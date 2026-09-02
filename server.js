'use strict';

require('dotenv').config();

const express  = require('express');
const helmet   = require('helmet');
const rateLimit = require('express-rate-limit');
const multer   = require('multer');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const Database = require('better-sqlite3');
const path     = require('path');
const fs       = require('fs');
const { v4: uuid } = require('uuid');
const https = require('https');
const net   = require('net');

const app    = express();
const PORT   = process.env.PORT       || 3031;
const EXPIRES = process.env.JWT_EXPIRES_IN || '24h';

// A signing secret is mandatory. Refuse to start on a missing, too-short, or
// placeholder value rather than fall back to a well-known one that would let
// anyone mint valid tokens.
const SECRET = process.env.JWT_SECRET;
const PLACEHOLDER_SECRETS = new Set([
  'dev-secret-change-in-production',
  'replace-this-with-a-random-secret-string',
]);
if (!SECRET || SECRET.length < 32 || PLACEHOLDER_SECRETS.has(SECRET)) {
  console.error('FATAL: JWT_SECRET must be set to a random string of at least 32 characters.');
  console.error('Generate one with:');
  console.error('  node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'base64url\'))"');
  process.exit(1);
}

// How much to trust the X-Forwarded-For header when working out the client IP.
// Unset/empty → don't trust it at all (use the socket address). Set this only
// when the server actually sits behind a known reverse proxy: 'true', a hop
// count, a subnet, or a preset like 'loopback' (see Express "trust proxy").
const TRUST_PROXY = (() => {
  const v = process.env.TRUST_PROXY;
  if (v === undefined || v === '') return false;
  if (v === 'true')  return true;
  if (v === 'false') return false;
  return /^\d+$/.test(v) ? Number(v) : v;
})();
app.set('trust proxy', TRUST_PROXY);

// ── Directories ───────────────────────────────────────────────────────
const DATA_DIR    = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');
const PUBLIC_DIR  = path.join(__dirname, 'public');

fs.mkdirSync(DATA_DIR,    { recursive: true });
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// ── SQLite database ───────────────────────────────────────────────────
const db = new Database(path.join(DATA_DIR, 'db.sqlite'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT    UNIQUE NOT NULL,
    password_hash TEXT    NOT NULL,
    role          TEXT    NOT NULL DEFAULT 'admin',
    token_version INTEGER NOT NULL DEFAULT 0,
    created_at    TEXT    DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS media_groups (
    id          TEXT PRIMARY KEY,
    name        TEXT    NOT NULL,
    description TEXT    DEFAULT '',
    duration    INTEGER DEFAULT NULL,
    sort_order  INTEGER DEFAULT 0,
    active      INTEGER DEFAULT 1,
    created_at  TEXT    DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS items (
    id                TEXT    PRIMARY KEY,
    group_id          TEXT    NOT NULL REFERENCES media_groups(id) ON DELETE CASCADE,
    type              TEXT    NOT NULL,
    title             TEXT    NOT NULL,
    src               TEXT    NOT NULL,
    duration          INTEGER,
    active            INTEGER DEFAULT 1,
    display_mode      TEXT    DEFAULT 'blur',
    use_video_duration INTEGER DEFAULT 0,
    sort_order        INTEGER DEFAULT 0,
    created_at        TEXT    DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS config_snapshots (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT    NOT NULL,
    username   TEXT,
    kind       TEXT    NOT NULL DEFAULT 'manual',  -- 'manual' | 'auto'
    label      TEXT    DEFAULT '',
    n_groups   INTEGER NOT NULL DEFAULT 0,
    n_items    INTEGER NOT NULL DEFAULT 0,
    data       TEXT    NOT NULL                    -- full config JSON
  );
`);

// Migrations for existing databases
try { db.exec('ALTER TABLE media_groups ADD COLUMN duration INTEGER DEFAULT NULL'); } catch {}
try { db.exec("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'admin'"); } catch {}
try { db.exec('ALTER TABLE users ADD COLUMN token_version INTEGER NOT NULL DEFAULT 0'); } catch {}

// Roles: exactly one 'superadmin' (created during first-run setup) may manage
// other accounts; every 'admin' can only act on their own account. On an older
// database that predates roles, promote the earliest account so the install is
// not left without anyone able to manage users.
try {
  const { n } = db.prepare("SELECT COUNT(*) as n FROM users WHERE role = 'superadmin'").get();
  if (n === 0) {
    db.prepare(`UPDATE users SET role = 'superadmin'
                WHERE id = (SELECT id FROM users ORDER BY id LIMIT 1)`).run();
  }
} catch {}
db.exec(`
  CREATE TABLE IF NOT EXISTS activity_log (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER,
    username    TEXT    NOT NULL,
    action      TEXT    NOT NULL,
    object_type TEXT,
    object_id   TEXT,
    object_name TEXT,
    ip          TEXT,
    created_at  TEXT    DEFAULT (datetime('now'))
  );
`);

// Default settings
const DEFAULTS = {
  defaultDuration: '8000',
  transition:      '1000',
  showProgress:    'true',
  showCounter:     'true',
  autoAdvance:     'true',
  bellScheduleRegular: JSON.stringify([
    {lesson:1,start:'08:00',end:'08:40'},{lesson:2,start:'08:50',end:'09:30'},
    {lesson:3,start:'09:40',end:'10:20'},{lesson:4,start:'10:30',end:'11:10'},
    {lesson:5,start:'11:30',end:'12:10'},{lesson:6,start:'12:20',end:'13:00'},
    {lesson:7,start:'13:10',end:'13:50'},{lesson:8,start:'14:00',end:'14:40'},
  ]),
  bellScheduleShortened: JSON.stringify([
    {lesson:1,start:'08:00',end:'08:30'},{lesson:2,start:'08:40',end:'09:10'},
    {lesson:3,start:'09:20',end:'09:50'},{lesson:4,start:'10:10',end:'10:40'},
    {lesson:5,start:'10:50',end:'11:20'},{lesson:6,start:'11:30',end:'12:00'},
    {lesson:7,start:'12:10',end:'12:40'},{lesson:8,start:'12:50',end:'13:20'},
  ]),
  shortDayManual: 'false',
  shortDayDates:  '[]',
  workingWeekendDates: '[]',
};
const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
for (const [k, v] of Object.entries(DEFAULTS)) insertSetting.run(k, v);

// PUT /api/settings only accepts these keys — anything else is a client bug or an
// attempt to bloat the table with arbitrary rows.
const ALLOWED_SETTING_KEYS = new Set(Object.keys(DEFAULTS));
const MAX_SETTING_VALUE_LEN = 64 * 1024;

// ── File uploads ──────────────────────────────────────────────────────
// The stored extension is derived from the MIME type, never from the filename
// the client sent: a request may declare image/png while naming the file
// "evil.html", and express.static would then serve that upload as HTML from
// our own origin — where the admin's token lives in localStorage.
const MIME_EXT = {
  'image/jpeg': '.jpg',
  'image/png':  '.png',
  'image/webp': '.webp',
  'video/mp4':  '.mp4',
  'video/webm': '.webm',
};
const ALLOWED_MIME = new Set(Object.keys(MIME_EXT));

// Leading bytes each accepted format must actually start with. The MIME type
// is client-supplied too, so it is verified against the real content below.
const SIGNATURES = {
  'image/jpeg': b => b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF,
  'image/png':  b => b.subarray(0, 8).equals(Buffer.from([0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A])),
  'image/webp': b => b.subarray(0, 4).toString('latin1') === 'RIFF' &&
                     b.subarray(8, 12).toString('latin1') === 'WEBP',
  'video/mp4':  b => b.subarray(4, 8).toString('latin1') === 'ftyp',
  'video/webm': b => b.subarray(0, 4).equals(Buffer.from([0x1A,0x45,0xDF,0xA3])),
};

const MAX_FILE_BYTES   = Number(process.env.UPLOADS_MAX_FILE_BYTES)  || 1024 * 1024 * 1024;       //  1 GB per file
const MAX_UPLOADS_BYTES = Number(process.env.UPLOADS_MAX_TOTAL_BYTES) || 20 * 1024 * 1024 * 1024; // 20 GB total

// Current size of everything in public/uploads/.
function uploadsDirSize() {
  let total = 0;
  try {
    for (const name of fs.readdirSync(UPLOADS_DIR)) {
      try { total += fs.statSync(path.join(UPLOADS_DIR, name)).size; } catch {}
    }
  } catch {}
  return total;
}

// Custom multer storage: validate the magic bytes off the *stream* and only
// start writing once they match, so a 1 GB file with a bogus signature never
// lands on disk (diskStorage would write the whole thing and delete it after).
const signatureCheckedStorage = {
  _handleFile(_req, file, cb) {
    const check     = SIGNATURES[file.mimetype];
    const filename  = `${uuid()}${MIME_EXT[file.mimetype] || ''}`;
    const finalPath = path.join(UPLOADS_DIR, filename);

    let head = Buffer.alloc(0);
    let ws = null;
    let size = 0;
    let decided = false;

    const reject = (msg) => {
      if (decided) return;
      decided = true;
      if (ws) ws.destroy();
      fs.unlink(finalPath, () => {});
      file.stream.resume(); // drain the rest so busboy can finish the request
      cb(new Error(msg));
    };

    const startWriting = () => {
      ws = fs.createWriteStream(finalPath);
      ws.on('error', (e) => { if (!decided) { decided = true; cb(e); } });
      ws.on('finish', () => { if (!decided) cb(null, { path: finalPath, filename, size, mimetype: file.mimetype }); });
      size = head.length;
      ws.write(head);
      file.stream.pipe(ws);
    };

    file.stream.on('data', (chunk) => {
      if (decided) return;
      if (ws) { size += chunk.length; return; }
      head = head.length ? Buffer.concat([head, chunk]) : Buffer.from(chunk);
      if (head.length >= 16) {
        if (check && !check(head.subarray(0, 16))) return reject('File contents do not match the declared type');
        startWriting();
      }
    });
    file.stream.on('end', () => {
      if (decided || ws) return;
      if (check && !check(head)) return reject('File contents do not match the declared type');
      startWriting();
      ws.end();
    });
    file.stream.on('error', (e) => { if (!decided) { decided = true; if (ws) ws.destroy(); fs.unlink(finalPath, () => {}); cb(e); } });
  },
  _removeFile(_req, file, cb) {
    fs.unlink(file.path, cb);
  },
};

const upload = multer({
  storage: signatureCheckedStorage,
  limits: { fileSize: MAX_FILE_BYTES },
  fileFilter: (_req, file, cb) => {
    ALLOWED_MIME.has(file.mimetype)
      ? cb(null, true)
      : cb(new Error(`Unsupported file type: ${file.mimetype}`));
  },
});

// Reject before a byte is read if the uploads folder is already at its quota.
// Content-Length is the whole multipart body — close enough as an upper bound.
function checkUploadQuota(req, res, next) {
  const incoming = Number(req.headers['content-length']) || 0;
  if (uploadsDirSize() + incoming > MAX_UPLOADS_BYTES) {
    return res.status(507).json({ error: 'Storage quota exceeded — delete unused media first' });
  }
  next();
}

// ── Middleware ────────────────────────────────────────────────────────

app.disable('x-powered-by');

// Security headers. The CSP is deliberately permissive on inline script/style:
// admin.html and login.html wire their buttons through inline on* attributes
// (see build.js), and the pages carry inline <style> and a first-run failsafe
// <script>. What it still buys us: no framing (clickjacking), no plugins, all
// XHR/fetch pinned to same-origin, and a tight allowlist for the one external
// dependency — the YouTube player.
const YT = ['https://www.youtube.com', 'https://s.ytimg.com'];
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      'default-src':     ["'self'"],
      'base-uri':        ["'self'"],
      'object-src':      ["'none'"],
      'frame-ancestors': ["'none'"],
      'form-action':     ["'self'"],
      'script-src':      ["'self'", "'unsafe-inline'", ...YT],
      'style-src':       ["'self'", "'unsafe-inline'"],
      'img-src':         ["'self'", 'data:', 'blob:', 'https://img.youtube.com', 'https://i.ytimg.com'],
      'media-src':       ["'self'", 'blob:'],
      'font-src':        ["'self'"],
      'connect-src':     ["'self'"],
      'frame-src':       ['https://www.youtube.com', 'https://www.youtube-nocookie.com'],
      'worker-src':      ["'self'", 'blob:'],
      // No upgrade-insecure-requests on purpose: there are no http subresources
      // to upgrade, and it would break a plain-HTTP LAN deployment by rewriting
      // same-origin requests to https.
    },
  },
  // Nothing here should ever be framed.
  frameguard: { action: 'deny' },
  referrerPolicy: { policy: 'no-referrer' },
  // Only honoured over HTTPS. No includeSubDomains: this appliance often lives on
  // a subdomain of a domain that runs other, unrelated services.
  hsts: { maxAge: 15552000, includeSubDomains: false },
  // Would block the cross-origin YouTube iframe/thumbnails.
  crossOriginEmbedderPolicy: false,
}));

// Rate limits. Keyed on req.ip, so behind a reverse proxy TRUST_PROXY must be
// set (otherwise every client shares the proxy's address and trips the limit
// together). 429s come back as JSON to match the rest of the API.
const jsonTooMany = (_req, res) =>
  res.status(429).json({ error: 'Too many requests, please try again later' });

// Brute-force guard for the credential endpoints. Only failed attempts count,
// so a normal sign-in / sign-out cycle is never penalised.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: jsonTooMany,
});

// Broad backstop against scraping / hammering. Generous enough that a wall of
// screens on one NAT and a busy admin panel never notice it.
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 600,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: jsonTooMany,
});
app.use('/api/', apiLimiter);

app.use(express.json({ limit: '2mb' })); // config import/restore payloads
app.use(express.static(PUBLIC_DIR, {
  // Keep browsers from re-interpreting an upload as something executable
  setHeaders: res => res.setHeader('X-Content-Type-Options', 'nosniff'),
}));

// JWT verification + a database check on every request. The token only carries a
// claim; role and token_version are read fresh from the row, so a password
// change, a reset, a "log out everywhere", a role change or a deleted account
// all take effect immediately instead of lasting until the token expires.
const selectAuthUser = db.prepare('SELECT id, username, role, token_version FROM users WHERE id = ?');

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  let payload;
  try {
    payload = jwt.verify(header.slice(7), SECRET);
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  const row = selectAuthUser.get(payload.id);
  if (!row || row.token_version !== (payload.tv ?? 0)) {
    return res.status(401).json({ error: 'Session expired, please sign in again' });
  }
  req.user = { id: row.id, username: row.username, role: row.role };
  next();
}

// Gate for account-management endpoints. `auth` has already put the current role
// (read from the database) on req.user.
function requireSuperadmin(req, res, next) {
  if (req.user?.role !== 'superadmin') {
    return res.status(403).json({ error: 'Superadmin role required' });
  }
  next();
}

function signToken(u) {
  return jwt.sign(
    { id: u.id, username: u.username, role: u.role, tv: u.token_version },
    SECRET,
    { expiresIn: EXPIRES },
  );
}

// Invalidate every token already issued for this user (see `auth`).
const bumpTokenVersion = db.prepare('UPDATE users SET token_version = token_version + 1 WHERE id = ?');

// Multer error handler
function handleUploadError(err, _req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: `File too large (max ${Math.round(MAX_FILE_BYTES / (1024 * 1024))} MB)` });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err?.message?.startsWith('Unsupported') ||
      err?.message === 'File contents do not match the declared type') {
    return res.status(400).json({ error: err.message });
  }
  next(err);
}

// Post-write guard. The signature is already enforced on the stream by
// signatureCheckedStorage; this re-checks it cheaply as a backstop and, more
// importantly, catches concurrent uploads that each passed checkUploadQuota
// before either had landed and together pushed the folder over the limit.
function verifyUpload(req, res, next) {
  if (!req.file) return next();

  let head = Buffer.alloc(0);
  try {
    const fd  = fs.openSync(req.file.path, 'r');
    const buf = Buffer.alloc(16);
    const len = fs.readSync(fd, buf, 0, 16, 0);
    fs.closeSync(fd);
    head = buf.subarray(0, len);
  } catch {}

  const matches = SIGNATURES[req.file.mimetype];
  if (!matches || !matches(head)) {
    try { fs.unlinkSync(req.file.path); } catch {}
    return res.status(400).json({ error: 'File contents do not match the declared type' });
  }

  if (uploadsDirSize() > MAX_UPLOADS_BYTES) {
    try { fs.unlinkSync(req.file.path); } catch {}
    return res.status(507).json({ error: 'Storage quota exceeded — delete unused media first' });
  }

  next();
}

// ── Helper functions ──────────────────────────────────────────────────
function settingsToObject(rows) {
  const s = Object.fromEntries(rows.map(r => [r.key, r.value]));
  return {
    defaultDuration: parseInt(s.defaultDuration) || 8000,
    transition:      parseInt(s.transition)      || 1000,
    showProgress:    s.showProgress !== 'false',
    showCounter:     s.showCounter  !== 'false',
    autoAdvance:     s.autoAdvance  !== 'false',
  };
}

// Client IP for the audit log. Express resolves req.ip from X-Forwarded-For only
// as far as `trust proxy` allows, so with TRUST_PROXY unset a client cannot
// influence it. The result is still validated as a real IPv4/IPv6 address before
// it is stored: activity_log.ip is rendered in the admin panel, so a value like
// `<img src=x onerror=…>` must never reach the database.
function getIp(req) {
  const ip = String(req.ip || '').replace(/^::ffff:/, '');
  return net.isIP(ip) ? ip : '';
}

function localISOString() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ` +
         `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function logActivity(req, action, objectType = null, objectId = null, objectName = null) {
  try {
    db.prepare(`INSERT INTO activity_log (user_id, username, action, object_type, object_id, object_name, ip, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(req.user?.id ?? null, req.user?.username ?? 'system', action, objectType, objectId, objectName, getIp(req), localISOString());
  } catch (e) {
    // The audit trail losing an entry silently is itself a problem — surface it.
    console.error(`[activity-log] failed to record "${action}":`, e.message);
  }
}

// Remove a file belonging to an item. The path is resolved and checked against
// UPLOADS_DIR first: src is only ever written by the upload handler, but a
// tampered or malformed value must not be able to point the unlink somewhere
// else in the filesystem.
function deleteUploadedFile(src) {
  if (typeof src !== 'string' || !src.trim()) return;

  const root   = path.resolve(UPLOADS_DIR);
  const target = path.resolve(PUBLIC_DIR, src.replace(/^[\\/]+/, ''));
  if (!target.startsWith(root + path.sep)) return;

  try {
    fs.unlinkSync(target);
  } catch (e) {
    if (e.code !== 'ENOENT') console.warn(`[uploads] could not delete ${src}:`, e.message);
  }
}

function mapItem(i) {
  return {
    ...i,
    active:             Boolean(i.active),
    use_video_duration: Boolean(i.use_video_duration),
  };
}

// ── Initial setup ─────────────────────────────────────────────────────

// Status: whether initial setup is required
app.get('/api/setup/status', (_req, res) => {
  const { n } = db.prepare('SELECT COUNT(*) as n FROM users').get();
  res.json({ needsSetup: n === 0 });
});

// Create the first administrator (only when no users exist). This account is the
// superadmin — the only role allowed to manage other users afterwards.
app.post('/api/setup', authLimiter, (req, res) => {
  const { n } = db.prepare('SELECT COUNT(*) as n FROM users').get();
  if (n > 0) return res.status(403).json({ error: 'Administrator already exists' });

  const { username, password } = req.body;
  if (!username?.trim())  return res.status(400).json({ error: 'Username is required' });
  if (!password || password.length < 8)
    return res.status(400).json({ error: 'Password must be at least 8 characters' });

  const hash = bcrypt.hashSync(password, 12);
  db.prepare("INSERT INTO users (username, password_hash, role) VALUES (?, ?, 'superadmin')")
    .run(username.trim(), hash);
  res.json({ ok: true, message: 'Administrator created' });
});

// ── Auth ──────────────────────────────────────────────────────────────

app.post('/api/auth/login', authLimiter, (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Username and password are required' });

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username.trim());
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    // Record the attempt for brute-force forensics. username stays 'system'; the
    // (capped) value tried goes in object_name, which the panel renders escaped.
    logActivity(req, 'login_failed', 'user', null, String(username).slice(0, 100));
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const token = signToken(user);
  req.user = { id: user.id, username: user.username };
  logActivity(req, 'login');
  res.json({ token, username: user.username, role: user.role });
});

app.get('/api/auth/me', auth, (req, res) => {
  res.json({ id: req.user.id, username: req.user.username, role: req.user.role });
});

// Log out every session for the caller by rotating their token_version.
app.post('/api/auth/logout', auth, (req, res) => {
  bumpTokenVersion.run(req.user.id);
  res.json({ ok: true });
});

app.put('/api/auth/password', auth, (req, res) => {
  const { current, newPassword } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);

  if (!bcrypt.compareSync(current, user.password_hash))
    return res.status(400).json({ error: 'Current password is incorrect' });
  if (!newPassword || newPassword.length < 8)
    return res.status(400).json({ error: 'New password must be at least 8 characters' });

  // Rotate token_version so other sessions are dropped, then hand this one a
  // fresh token so the admin who just changed the password stays signed in.
  db.transaction(() => {
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?')
      .run(bcrypt.hashSync(newPassword, 12), req.user.id);
    bumpTokenVersion.run(req.user.id);
  })();
  const updated = selectAuthUser.get(req.user.id);
  res.json({ ok: true, token: signToken(updated) });
});

// ── Groups ────────────────────────────────────────────────────────────

app.get('/api/groups', auth, (_req, res) => {
  const groups = db.prepare(`
    SELECT g.*, COUNT(i.id) as item_count
    FROM media_groups g
    LEFT JOIN items i ON i.group_id = g.id
    GROUP BY g.id
    ORDER BY g.sort_order, g.created_at
  `).all();
  res.json(groups.map(g => ({ ...g, active: Boolean(g.active) })));
});

// Reorder groups (must come before /:id)
app.post('/api/groups/reorder', auth, (req, res) => {
  const { order } = req.body; // array of ids in desired order
  if (!Array.isArray(order)) return res.status(400).json({ error: 'Expected an array of ids' });
  const update = db.prepare('UPDATE media_groups SET sort_order = ? WHERE id = ?');
  db.transaction(() => order.forEach((id, i) => update.run(i, id)))();
  res.json({ ok: true });
});

app.post('/api/groups', auth, (req, res) => {
  const { name, description = '', duration } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Group name is required' });

  const { m } = db.prepare('SELECT MAX(sort_order) as m FROM media_groups').get();
  const id = uuid();
  db.prepare('INSERT INTO media_groups (id, name, description, duration, sort_order) VALUES (?, ?, ?, ?, ?)')
    .run(id, name.trim(), description, duration ? parseInt(duration) : null, (m ?? -1) + 1);

  const group = db.prepare('SELECT * FROM media_groups WHERE id = ?').get(id);
  logActivity(req, 'create', 'group', id, name.trim());
  res.json({ ...group, active: Boolean(group.active), item_count: 0 });
});

app.put('/api/groups/:id', auth, (req, res) => {
  const g = db.prepare('SELECT * FROM media_groups WHERE id = ?').get(req.params.id);
  if (!g) return res.status(404).json({ error: 'Group not found' });

  const { name, description, active, duration } = req.body;
  db.prepare('UPDATE media_groups SET name = ?, description = ?, active = ?, duration = ? WHERE id = ?').run(
    name        !== undefined ? name.trim()       : g.name,
    description !== undefined ? description       : g.description,
    active      !== undefined ? (active ? 1 : 0)  : g.active,
    duration    !== undefined ? (duration ? parseInt(duration) : null) : g.duration,
    g.id,
  );

  const updated = db.prepare('SELECT * FROM media_groups WHERE id = ?').get(g.id);
  logActivity(req, 'update', 'group', g.id, updated.name);
  res.json({ ...updated, active: Boolean(updated.active) });
});

app.delete('/api/groups/:id', auth, (req, res) => {
  const g = db.prepare('SELECT name FROM media_groups WHERE id = ?').get(req.params.id);
  const items = db.prepare('SELECT src, type FROM items WHERE group_id = ?').all(req.params.id);
  db.prepare('DELETE FROM media_groups WHERE id = ?').run(req.params.id);

  for (const item of items) {
    if (item.type !== 'youtube' && item.type !== 'schedule') deleteUploadedFile(item.src);
  }
  logActivity(req, 'delete', 'group', req.params.id, g?.name);
  res.json({ ok: true });
});

// ── Items ─────────────────────────────────────────────────────────────

app.get('/api/groups/:groupId/items', auth, (req, res) => {
  const items = db.prepare(
    'SELECT * FROM items WHERE group_id = ? ORDER BY sort_order, created_at'
  ).all(req.params.groupId);
  res.json(items.map(mapItem));
});

// Reorder items within a group (must come before /:id)
app.post('/api/groups/:groupId/items/reorder', auth, (req, res) => {
  const { order } = req.body;
  if (!Array.isArray(order)) return res.status(400).json({ error: 'Expected an array of ids' });
  const update = db.prepare('UPDATE items SET sort_order = ? WHERE id = ?');
  db.transaction(() => order.forEach((id, i) => update.run(i, id)))();
  res.json({ ok: true });
});

app.post('/api/groups/:groupId/items', auth, checkUploadQuota, upload.single('file'), verifyUpload, (req, res) => {
  const group = db.prepare('SELECT id FROM media_groups WHERE id = ?').get(req.params.groupId);
  if (!group) return res.status(404).json({ error: 'Group not found' });

  const { type, title, duration, active = '1', display_mode = 'blur', use_video_duration = '0', youtube_url } = req.body;

  if (!['image', 'video', 'youtube', 'schedule'].includes(type))
    return res.status(400).json({ error: 'Invalid type: image, video, youtube or schedule' });

  let src;
  if (type === 'youtube' || type === 'schedule') {
    if (!youtube_url?.trim()) return res.status(400).json({ error: 'URL is required' });
    src = youtube_url.trim();
  } else {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    src = `/uploads/${req.file.filename}`;
  }

  const { m } = db.prepare('SELECT MAX(sort_order) as m FROM items WHERE group_id = ?').get(req.params.groupId);
  const id = uuid();

  db.prepare(`
    INSERT INTO items (id, group_id, type, title, src, duration, active, display_mode, use_video_duration, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, group.id, type,
    title?.trim() || 'Untitled',
    src,
    duration ? parseInt(duration) : null,
    active === '1' || active === true ? 1 : 0,
    display_mode,
    use_video_duration === '1' || use_video_duration === true ? 1 : 0,
    (m ?? -1) + 1,
  );

  const newItem = mapItem(db.prepare('SELECT * FROM items WHERE id = ?').get(id));
  logActivity(req, 'create', 'item', id, newItem.title);
  res.json(newItem);
}, handleUploadError);

app.put('/api/items/:id', auth, (req, res) => {
  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Item not found' });

  const { title, duration, active, display_mode, use_video_duration, src } = req.body;

  // For image/video the src is the path of the uploaded file and is owned by the
  // upload handler — a request must not be able to repoint it. For youtube and
  // schedule it is a URL or a JSON config, which is how the admin panel edits them.
  const srcEditable = item.type === 'youtube' || item.type === 'schedule';

  db.prepare(`
    UPDATE items
    SET title = ?, duration = ?, active = ?, display_mode = ?, use_video_duration = ?, src = ?
    WHERE id = ?
  `).run(
    title              !== undefined ? title.trim()                         : item.title,
    duration           !== undefined ? (duration ? parseInt(duration) : null) : item.duration,
    active             !== undefined ? (active ? 1 : 0)                    : item.active,
    display_mode       !== undefined ? display_mode                         : item.display_mode,
    use_video_duration !== undefined ? (use_video_duration ? 1 : 0)        : item.use_video_duration,
    srcEditable && src !== undefined ? src                                  : item.src,
    item.id,
  );

  const updated = mapItem(db.prepare('SELECT * FROM items WHERE id = ?').get(item.id));
  logActivity(req, 'update', 'item', item.id, updated.title);
  res.json(updated);
});

app.delete('/api/items/:id', auth, (req, res) => {
  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Item not found' });

  db.prepare('DELETE FROM items WHERE id = ?').run(item.id);

  if (item.type !== 'youtube' && item.type !== 'schedule') deleteUploadedFile(item.src);
  logActivity(req, 'delete', 'item', item.id, item.title);
  res.json({ ok: true });
});

// Move item to another group
app.put('/api/items/:id/move', auth, (req, res) => {
  const { group_id } = req.body;
  const group = db.prepare('SELECT id FROM media_groups WHERE id = ?').get(group_id);
  if (!group) return res.status(404).json({ error: 'Group not found' });
  db.prepare('UPDATE items SET group_id = ? WHERE id = ?').run(group_id, req.params.id);
  res.json({ ok: true });
});

// ── Public playlist (for the player, no auth required) ────────────────

app.get('/api/playlist', (_req, res) => {
  const items = db.prepare(`
    SELECT i.*, g.duration as group_duration
    FROM items i
    JOIN media_groups g ON g.id = i.group_id
    WHERE i.active = 1 AND g.active = 1
    ORDER BY g.sort_order, i.sort_order, i.created_at
  `).all();
  res.json(items.map(mapItem));
});

// ── Settings ──────────────────────────────────────────────────────────

app.get('/api/settings/public', (_req, res) => {
  res.json(settingsToObject(db.prepare('SELECT * FROM settings').all()));
});

app.get('/api/settings', auth, (_req, res) => {
  res.json(settingsToObject(db.prepare('SELECT * FROM settings').all()));
});

app.put('/api/settings', auth, (req, res) => {
  const entries = Object.entries(req.body || {});

  const unknown = entries.filter(([k]) => !ALLOWED_SETTING_KEYS.has(k)).map(([k]) => k);
  if (unknown.length)
    return res.status(400).json({ error: `Unknown setting key(s): ${unknown.join(', ')}` });

  const tooBig = entries.find(([, v]) => String(v).length > MAX_SETTING_VALUE_LEN);
  if (tooBig)
    return res.status(400).json({ error: `Value for "${tooBig[0]}" is too large` });

  const upsert = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
  db.transaction(() => {
    for (const [k, v] of entries) upsert.run(k, String(v));
  })();
  logActivity(req, 'update', 'settings');
  res.json({ ok: true });
});

// ── Export / import / config snapshots ───────────────────────────────

const CONFIG_VERSION   = 3;
const AUTO_SNAPSHOT_KEEP = 20;
const ITEM_TYPES        = new Set(['image', 'video', 'youtube', 'schedule']);
const DISPLAY_MODES     = new Set(['blur', 'cover', 'contain']);

// Full, loss-free config: every settings row (not just the player subset) so an
// export → import round-trip keeps the bell schedule and everything else.
function buildConfig() {
  return {
    version:    CONFIG_VERSION,
    exportedAt: new Date().toISOString(),
    groups:   db.prepare('SELECT * FROM media_groups ORDER BY sort_order').all(),
    items:    db.prepare('SELECT * FROM items ORDER BY sort_order').all(),
    settings: Object.fromEntries(db.prepare('SELECT key, value FROM settings').all().map(r => [r.key, r.value])),
  };
}

function snapshotConfig(req, kind, label) {
  const cfg = buildConfig();
  const info = db.prepare(`INSERT INTO config_snapshots (created_at, username, kind, label, n_groups, n_items, data)
                           VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .run(localISOString(), req.user?.username ?? 'system', kind,
         String(label || '').slice(0, 120), cfg.groups.length, cfg.items.length, JSON.stringify(cfg));
  if (kind === 'auto') {
    db.prepare(`DELETE FROM config_snapshots WHERE kind = 'auto' AND id NOT IN
                (SELECT id FROM config_snapshots WHERE kind = 'auto' ORDER BY id DESC LIMIT ?)`)
      .run(AUTO_SNAPSHOT_KEEP);
  }
  return info.lastInsertRowid;
}

// Returns an error string, or null when the shape is acceptable.
function validateConfig(cfg) {
  if (!cfg || typeof cfg !== 'object')            return 'Not a config object';
  if (!Array.isArray(cfg.groups))                 return 'Missing "groups" array';
  if (!Array.isArray(cfg.items))                  return 'Missing "items" array';
  if (cfg.settings && typeof cfg.settings !== 'object') return '"settings" must be an object';

  const gids = new Set();
  for (const g of cfg.groups) {
    if (!g || typeof g.id !== 'string' || !g.id)  return 'A group is missing its id';
    if (typeof g.name !== 'string' || !g.name.trim()) return `Group ${g.id} has no name`;
    gids.add(g.id);
  }
  for (const it of cfg.items) {
    if (!it || typeof it.id !== 'string' || !it.id) return 'An item is missing its id';
    if (!gids.has(it.group_id))                    return `Item ${it.id} points at unknown group ${it.group_id}`;
    if (!ITEM_TYPES.has(it.type))                  return `Item ${it.id} has invalid type "${it.type}"`;
    if (typeof it.src !== 'string')                return `Item ${it.id} has no src`;
  }
  return null;
}

const applyConfig = db.transaction((cfg) => {
  db.prepare('DELETE FROM items').run();
  db.prepare('DELETE FROM media_groups').run();

  const gIns = db.prepare(`INSERT INTO media_groups (id, name, description, duration, sort_order, active, created_at)
                           VALUES (@id, @name, @description, @duration, @sort_order, @active, @created_at)`);
  cfg.groups.forEach((g, i) => gIns.run({
    id:          g.id,
    name:        String(g.name).slice(0, 200),
    description: typeof g.description === 'string' ? g.description.slice(0, 500) : '',
    duration:    g.duration != null && Number.isFinite(+g.duration) ? Math.trunc(+g.duration) : null,
    sort_order:  Number.isFinite(+g.sort_order) ? Math.trunc(+g.sort_order) : i,
    active:      g.active ? 1 : 0,
    created_at:  typeof g.created_at === 'string' ? g.created_at : localISOString(),
  }));

  const iIns = db.prepare(`INSERT INTO items
    (id, group_id, type, title, src, duration, active, display_mode, use_video_duration, sort_order, created_at)
    VALUES (@id, @group_id, @type, @title, @src, @duration, @active, @display_mode, @use_video_duration, @sort_order, @created_at)`);
  cfg.items.forEach((it, i) => iIns.run({
    id:                 it.id,
    group_id:           it.group_id,
    type:               it.type,
    title:              String(it.title ?? 'Untitled').slice(0, 200),
    src:                String(it.src).slice(0, 20000),
    duration:           it.duration != null && Number.isFinite(+it.duration) ? Math.trunc(+it.duration) : null,
    active:             it.active ? 1 : 0,
    display_mode:       DISPLAY_MODES.has(it.display_mode) ? it.display_mode : 'blur',
    use_video_duration: it.use_video_duration ? 1 : 0,
    sort_order:         Number.isFinite(+it.sort_order) ? Math.trunc(+it.sort_order) : i,
    created_at:         typeof it.created_at === 'string' ? it.created_at : localISOString(),
  }));

  if (cfg.settings) {
    const sUp = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    for (const [k, v] of Object.entries(cfg.settings)) {
      if (ALLOWED_SETTING_KEYS.has(k) && String(v).length <= MAX_SETTING_VALUE_LEN) sUp.run(k, String(v));
    }
  }
});

app.get('/api/export', auth, (_req, res) => {
  res.json(buildConfig());
});

app.get('/api/config/snapshots', auth, (_req, res) => {
  res.json(db.prepare(
    'SELECT id, created_at, username, kind, label, n_groups, n_items FROM config_snapshots ORDER BY id DESC'
  ).all());
});

app.post('/api/config/snapshots', auth, (req, res) => {
  const id = snapshotConfig(req, 'manual', req.body?.label);
  logActivity(req, 'create', 'snapshot', String(id), req.body?.label || null);
  res.json({ ok: true, id });
});

app.get('/api/config/snapshots/:id', auth, (req, res) => {
  const row = db.prepare('SELECT data FROM config_snapshots WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Snapshot not found' });
  res.type('application/json').send(row.data);
});

app.delete('/api/config/snapshots/:id', auth, requireSuperadmin, (req, res) => {
  const r = db.prepare('DELETE FROM config_snapshots WHERE id = ?').run(req.params.id);
  if (!r.changes) return res.status(404).json({ error: 'Snapshot not found' });
  logActivity(req, 'delete', 'snapshot', req.params.id);
  res.json({ ok: true });
});

app.post('/api/config/snapshots/:id/restore', auth, requireSuperadmin, (req, res) => {
  const row = db.prepare('SELECT data FROM config_snapshots WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Snapshot not found' });
  let cfg;
  try { cfg = JSON.parse(row.data); } catch { return res.status(500).json({ error: 'Snapshot data is corrupt' }); }
  const err = validateConfig(cfg);
  if (err) return res.status(422).json({ error: `Snapshot is invalid: ${err}` });

  snapshotConfig(req, 'auto', `before restoring #${req.params.id}`);
  applyConfig(cfg);
  logActivity(req, 'update', 'config', String(req.params.id), 'restore snapshot');
  res.json({ ok: true });
});

app.post('/api/config/import', auth, requireSuperadmin, (req, res) => {
  const cfg = req.body;
  const err = validateConfig(cfg);
  if (err) return res.status(422).json({ error: err });

  snapshotConfig(req, 'auto', 'before import');
  applyConfig(cfg);
  logActivity(req, 'update', 'config', null, 'import');
  res.json({ ok: true, groups: cfg.groups.length, items: cfg.items.length });
});

// ── User management (superadmin only) ─────────────────────────────────
// Every route here is gated by requireSuperadmin. A plain 'admin' manages only
// their own account, and does that through PUT /api/auth/password, which checks
// the current password.

app.get('/api/users', auth, requireSuperadmin, (_req, res) => {
  const users = db.prepare('SELECT id, username, role, created_at FROM users ORDER BY id').all();
  res.json(users);
});

app.post('/api/users', auth, requireSuperadmin, (req, res) => {
  const { username, password } = req.body;
  if (!username?.trim())           return res.status(400).json({ error: 'Username is required' });
  if (!password || password.length < 8)
    return res.status(400).json({ error: 'Password must be at least 8 characters' });

  const exists = db.prepare('SELECT id FROM users WHERE username = ?').get(username.trim());
  if (exists) return res.status(409).json({ error: 'A user with that username already exists' });

  const hash = bcrypt.hashSync(password, 12);
  const info = db.prepare("INSERT INTO users (username, password_hash, role) VALUES (?, ?, 'admin')")
    .run(username.trim(), hash);
  logActivity(req, 'create', 'user', String(info.lastInsertRowid), username.trim());
  res.json(db.prepare('SELECT id, username, role, created_at FROM users WHERE id = ?').get(info.lastInsertRowid));
});

app.put('/api/users/:id/password', auth, requireSuperadmin, (req, res) => {
  const target = db.prepare('SELECT id, username FROM users WHERE id = ?').get(req.params.id);
  if (!target) return res.status(404).json({ error: 'User not found' });

  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 8)
    return res.status(400).json({ error: 'Password must be at least 8 characters' });

  db.transaction(() => {
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(bcrypt.hashSync(newPassword, 12), target.id);
    bumpTokenVersion.run(target.id); // drop the target's existing sessions
  })();
  logActivity(req, 'update', 'user', String(target.id), target.username);
  res.json({ ok: true });
});

app.delete('/api/users/:id', auth, requireSuperadmin, (req, res) => {
  if (String(req.user.id) === String(req.params.id))
    return res.status(400).json({ error: 'You cannot delete your own account' });

  const target = db.prepare('SELECT id, username, role FROM users WHERE id = ?').get(req.params.id);
  if (!target) return res.status(404).json({ error: 'User not found' });

  if (target.role === 'superadmin') {
    const { n } = db.prepare("SELECT COUNT(*) as n FROM users WHERE role = 'superadmin'").get();
    if (n <= 1) return res.status(400).json({ error: 'The last superadmin cannot be deleted' });
  }

  db.prepare('DELETE FROM users WHERE id = ?').run(target.id);
  logActivity(req, 'delete', 'user', String(target.id), target.username);
  res.json({ ok: true });
});

// ── Activity log ──────────────────────────────────────────────────────

app.get('/api/activity', auth, (req, res) => {
  const limit  = Math.min(parseInt(req.query.limit)  || 100, 500);
  const offset = parseInt(req.query.offset) || 0;
  const rows = db.prepare(
    'SELECT * FROM activity_log ORDER BY id DESC LIMIT ? OFFSET ?'
  ).all(limit, offset);
  const { total } = db.prepare('SELECT COUNT(*) as total FROM activity_log').get();
  res.json({ rows, total });
});

// ── Generic image upload (logo, background, etc.) ─────────────────────

app.post('/api/upload', auth, checkUploadQuota, upload.single('file'), verifyUpload, (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ url: `/uploads/${req.file.filename}` });
}, handleUploadError);

// ── Bell schedule (public) ────────────────────────────────────────────

app.get('/api/bell', (_req, res) => {
  const rows = db.prepare(
    'SELECT key, value FROM settings WHERE key IN (?,?,?,?,?)'
  ).all('bellScheduleRegular','bellScheduleShortened','shortDayManual','shortDayDates','workingWeekendDates');
  const s = Object.fromEntries(rows.map(r => [r.key, r.value]));
  let regular = [], shortened = [], dates = [], workingWeekendDates = [];
  try { regular              = JSON.parse(s.bellScheduleRegular    || '[]'); } catch {}
  try { shortened            = JSON.parse(s.bellScheduleShortened  || '[]'); } catch {}
  try { dates                = JSON.parse(s.shortDayDates          || '[]'); } catch {}
  try { workingWeekendDates  = JSON.parse(s.workingWeekendDates    || '[]'); } catch {}
  res.json({ regular, shortened, shortDayManual: s.shortDayManual === 'true', shortDayDates: dates, workingWeekendDates });
});

// ── Schedule / Google Sheets proxy ───────────────────────────────────

// Hosts the proxy may fetch, apex plus subdomains. Checked before the first
// request and again on every redirect hop — otherwise a redirect could walk the
// proxy out to an arbitrary host (including the local network) on behalf of the
// server. googleusercontent.com is required: a Sheets export URL 307-redirects
// there, and that is where the CSV itself is served from.
const SCHEDULE_HOSTS          = ['google.com', 'googleusercontent.com'];
const SCHEDULE_MAX_BYTES      = 8 * 1024 * 1024; // a substitutions CSV is a few KB
const SCHEDULE_SOCKET_TIMEOUT = 10_000;          // idle socket, per hop
const SCHEDULE_TOTAL_TIMEOUT  = 25_000;          // whole fetch, redirects included

function isAllowedScheduleUrl(u) {
  if (u.protocol !== 'https:') return false;
  const host = u.hostname.toLowerCase();
  return SCHEDULE_HOSTS.some(h => host === h || host.endsWith('.' + h));
}

// The saved Google Sheets URL from a schedule item's stored config.
function scheduleUrlForItem(id) {
  const row = db.prepare("SELECT src FROM items WHERE id = ? AND type = 'schedule'").get(id);
  if (!row) return null;
  try { return JSON.parse(row.src)?.sheetsUrl || null; } catch { return null; }
}

// Stream a Google CSV back to the client with a host allowlist enforced on every
// hop, an overall deadline, a per-socket idle timeout and a hard size cap, so a
// slow or oversized upstream cannot tie up or exhaust the server.
function streamSchedule(rawUrl, res) {
  let target;
  try { target = new URL(rawUrl); }
  catch { return res.status(400).json({ error: 'Invalid URL' }); }
  if (!isAllowedScheduleUrl(target))
    return res.status(400).json({ error: 'Only https Google URLs are allowed' });

  const fail = (code, error) => { if (!res.headersSent) res.status(code).json({ error }); };

  let done = false;
  let inflight = null;
  const deadline = setTimeout(
    () => finish(() => { fail(504, 'Upstream timed out'); res.destroy(); }),
    SCHEDULE_TOTAL_TIMEOUT,
  );
  function finish(fn) {
    if (done) return;
    done = true;
    clearTimeout(deadline);
    if (inflight) inflight.destroy();
    fn();
  }

  const doGet = (targetUrl, hops = 0) => {
    if (done) return;
    if (hops > 6) return finish(() => fail(502, 'Too many redirects'));

    const r = https.get(targetUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 SkoluBoard', 'Accept-Encoding': 'identity' },
      timeout: SCHEDULE_SOCKET_TIMEOUT,
    }, (resp) => {
      if (resp.statusCode >= 300 && resp.statusCode < 400 && resp.headers.location) {
        resp.resume();
        let next;
        try { next = new URL(resp.headers.location, targetUrl); } // Location may be relative
        catch { return finish(() => fail(502, 'Invalid redirect target')); }
        if (!isAllowedScheduleUrl(next))
          return finish(() => fail(502, 'Redirect to a non-Google host was blocked'));
        return doGet(next, hops + 1);
      }
      if (resp.statusCode !== 200) {
        resp.resume();
        return finish(() => fail(502, `HTTP ${resp.statusCode}`));
      }

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');

      let bytes = 0;
      resp.on('data', (chunk) => {
        bytes += chunk.length;
        if (bytes > SCHEDULE_MAX_BYTES) {
          return finish(() => { fail(502, 'Response too large'); res.destroy(); });
        }
        res.write(chunk);
      });
      resp.on('end',   () => finish(() => res.end()));
      resp.on('error', () => finish(() => { fail(502, 'Upstream error'); res.destroy(); }));
    });

    inflight = r;
    r.on('timeout', () => finish(() => { fail(504, 'Upstream timed out'); r.destroy(); }));
    r.on('error',   e  => finish(() => fail(502, e.message)));
  };

  doGet(target);
}

app.get('/api/schedule/fetch', (req, res) => {
  const { item, url } = req.query;

  // Player path: reference a schedule item by id. The URL then comes from what an
  // admin saved, never from the caller, so this stays open (the player carries
  // no token) without being an arbitrary-URL proxy.
  if (item) {
    const saved = scheduleUrlForItem(String(item));
    if (!saved) return res.status(404).json({ error: 'Unknown schedule item' });
    return streamSchedule(saved, res);
  }

  // Admin path: the "Test access" button fetches a URL that is not saved yet.
  // Arbitrary URLs require a valid token.
  if (url) return auth(req, res, () => streamSchedule(String(url), res));

  return res.status(400).json({ error: 'item or url parameter is required' });
});

// ── Orphaned upload sweep ────────────────────────────────────────────
// /api/upload hands back a URL before any item references it; if the caller
// never creates the item, the file would sit in uploads/ forever. Delete files
// that nothing points at and that are older than the grace period (so a file
// waiting for its item to be created is left alone).

const ORPHAN_GRACE_MS   = 24 * 60 * 60 * 1000;
const ORPHAN_SWEEP_EVERY = 6 * 60 * 60 * 1000;

function referencedUploadFiles() {
  const names = new Set();
  const scan = (v) => {
    if (typeof v !== 'string') return;
    for (const m of v.matchAll(/\/uploads\/([A-Za-z0-9._-]+)/g)) names.add(m[1]);
  };
  try {
    for (const { src }   of db.prepare('SELECT src FROM items').all())            scan(src);
    for (const { value } of db.prepare('SELECT value FROM settings').all())       scan(value);
    // Keep media alive while a config snapshot still references it, so a rollback
    // does not resurrect items whose files were swept.
    for (const { data }  of db.prepare('SELECT data FROM config_snapshots').all()) scan(data);
  } catch {}
  return names;
}

function sweepOrphanUploads() {
  const referenced = referencedUploadFiles();
  const now = Date.now();
  let removed = 0;
  let entries;
  try { entries = fs.readdirSync(UPLOADS_DIR); } catch { return; }
  for (const name of entries) {
    if (referenced.has(name)) continue;
    const p = path.join(UPLOADS_DIR, name);
    try {
      const st = fs.statSync(p);
      if (!st.isFile() || now - st.mtimeMs < ORPHAN_GRACE_MS) continue;
      fs.unlinkSync(p);
      removed++;
    } catch {}
  }
  if (removed) console.log(`🧹  uploads: removed ${removed} orphaned file(s)`);
}

sweepOrphanUploads();
setInterval(sweepOrphanUploads, ORPHAN_SWEEP_EVERY).unref();

// ── Start server ──────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n🖥  SkoluBoard started`);
  console.log(`   Player: http://localhost:${PORT}/`);
  console.log(`   Login:  http://localhost:${PORT}/login.html`);
  console.log(`   Admin:  http://localhost:${PORT}/admin.html\n`);
});
