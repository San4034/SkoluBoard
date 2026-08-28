'use strict';

require('dotenv').config();

const express  = require('express');
const multer   = require('multer');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const Database = require('better-sqlite3');
const path     = require('path');
const fs       = require('fs');
const { v4: uuid } = require('uuid');
const https = require('https');

const app    = express();
const PORT   = process.env.PORT       || 3031;
const SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const EXPIRES = process.env.JWT_EXPIRES_IN || '24h';

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
`);

// Migrations for existing databases
try { db.exec('ALTER TABLE media_groups ADD COLUMN duration INTEGER DEFAULT NULL'); } catch {}
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

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename:    (_req, file, cb) => cb(null, `${uuid()}${MIME_EXT[file.mimetype]}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB
  fileFilter: (_req, file, cb) => {
    ALLOWED_MIME.has(file.mimetype)
      ? cb(null, true)
      : cb(new Error(`Unsupported file type: ${file.mimetype}`));
  },
});

// ── Middleware ────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.static(PUBLIC_DIR, {
  // Keep browsers from re-interpreting an upload as something executable
  setHeaders: res => res.setHeader('X-Content-Type-Options', 'nosniff'),
}));

// JWT token verification
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    req.user = jwt.verify(header.slice(7), SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Multer error handler
function handleUploadError(err, _req, res, next) {
  if (err instanceof multer.MulterError || err.message?.startsWith('Unsupported')) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
}

// Reject an upload whose bytes do not match its declared type. Runs after
// multer, so the file already exists on disk and has to be removed on failure.
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
  if (matches && matches(head)) return next();

  try { fs.unlinkSync(req.file.path); } catch {}
  res.status(400).json({ error: 'File contents do not match the declared type' });
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

function getIp(req) {
  return (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
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
  } catch {}
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

  try { fs.unlinkSync(target); } catch {}
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

// Create the first administrator (only when no users exist)
app.post('/api/setup', (req, res) => {
  const { n } = db.prepare('SELECT COUNT(*) as n FROM users').get();
  if (n > 0) return res.status(403).json({ error: 'Administrator already exists' });

  const { username, password } = req.body;
  if (!username?.trim())  return res.status(400).json({ error: 'Username is required' });
  if (!password || password.length < 8)
    return res.status(400).json({ error: 'Password must be at least 8 characters' });

  const hash = bcrypt.hashSync(password, 12);
  db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(username.trim(), hash);
  res.json({ ok: true, message: 'Administrator created' });
});

// ── Auth ──────────────────────────────────────────────────────────────

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Username and password are required' });

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username.trim());
  if (!user || !bcrypt.compareSync(password, user.password_hash))
    return res.status(401).json({ error: 'Invalid username or password' });

  const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: EXPIRES });
  req.user = { id: user.id, username: user.username };
  logActivity(req, 'login');
  res.json({ token, username: user.username });
});

app.get('/api/auth/me', auth, (req, res) => {
  res.json({ id: req.user.id, username: req.user.username });
});

app.put('/api/auth/password', auth, (req, res) => {
  const { current, newPassword } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);

  if (!bcrypt.compareSync(current, user.password_hash))
    return res.status(400).json({ error: 'Current password is incorrect' });
  if (!newPassword || newPassword.length < 8)
    return res.status(400).json({ error: 'New password must be at least 8 characters' });

  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?')
    .run(bcrypt.hashSync(newPassword, 12), req.user.id);
  res.json({ ok: true });
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

app.post('/api/groups/:groupId/items', auth, upload.single('file'), verifyUpload, (req, res) => {
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
  const upsert = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
  db.transaction(() => {
    for (const [k, v] of Object.entries(req.body)) upsert.run(k, String(v));
  })();
  logActivity(req, 'update', 'settings');
  res.json({ ok: true });
});

// ── Export / import ───────────────────────────────────────────────────

app.get('/api/export', auth, (_req, res) => {
  const groups  = db.prepare('SELECT * FROM media_groups ORDER BY sort_order').all();
  const items   = db.prepare('SELECT * FROM items ORDER BY sort_order').all();
  const settings = settingsToObject(db.prepare('SELECT * FROM settings').all());
  res.json({ groups, items, settings, exportedAt: new Date().toISOString(), version: 2 });
});

// ── User management ───────────────────────────────────────────────────

app.get('/api/users', auth, (_req, res) => {
  const users = db.prepare('SELECT id, username, created_at FROM users ORDER BY id').all();
  res.json(users);
});

app.post('/api/users', auth, (req, res) => {
  const { username, password } = req.body;
  if (!username?.trim())           return res.status(400).json({ error: 'Username is required' });
  if (!password || password.length < 8)
    return res.status(400).json({ error: 'Password must be at least 8 characters' });

  const exists = db.prepare('SELECT id FROM users WHERE username = ?').get(username.trim());
  if (exists) return res.status(409).json({ error: 'A user with that username already exists' });

  const hash = bcrypt.hashSync(password, 12);
  const info = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(username.trim(), hash);
  logActivity(req, 'create', 'user', String(info.lastInsertRowid), username.trim());
  res.json(db.prepare('SELECT id, username, created_at FROM users WHERE id = ?').get(info.lastInsertRowid));
});

app.put('/api/users/:id/password', auth, (req, res) => {
  const target = db.prepare('SELECT id, username FROM users WHERE id = ?').get(req.params.id);
  if (!target) return res.status(404).json({ error: 'User not found' });

  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 8)
    return res.status(400).json({ error: 'Password must be at least 8 characters' });

  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(bcrypt.hashSync(newPassword, 12), target.id);
  logActivity(req, 'update', 'user', String(target.id), target.username);
  res.json({ ok: true });
});

app.delete('/api/users/:id', auth, (req, res) => {
  if (String(req.user.id) === String(req.params.id))
    return res.status(400).json({ error: 'You cannot delete your own account' });
  const { n } = db.prepare('SELECT COUNT(*) as n FROM users').get();
  if (n <= 1) return res.status(400).json({ error: 'At least one user must remain' });

  const target = db.prepare('SELECT id, username FROM users WHERE id = ?').get(req.params.id);
  if (!target) return res.status(404).json({ error: 'User not found' });

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

app.post('/api/upload', auth, upload.single('file'), verifyUpload, (req, res) => {
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
const SCHEDULE_HOSTS = ['google.com', 'googleusercontent.com'];

function isAllowedScheduleUrl(u) {
  if (u.protocol !== 'https:') return false;
  const host = u.hostname.toLowerCase();
  return SCHEDULE_HOSTS.some(h => host === h || host.endsWith('.' + h));
}

app.get('/api/schedule/fetch', (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  let target;
  try {
    target = new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL' });
  }
  if (!isAllowedScheduleUrl(target))
    return res.status(400).json({ error: 'Only https Google URLs are allowed' });

  // Once the body is being piped the headers are already out
  const fail = (code, error) => { if (!res.headersSent) res.status(code).json({ error }); };

  const doGet = (targetUrl, hops = 0) => {
    if (hops > 6) return fail(502, 'Too many redirects');
    https.get(targetUrl, { headers: { 'User-Agent': 'Mozilla/5.0 SkoluBoard' } }, (resp) => {
      if (resp.statusCode >= 300 && resp.statusCode < 400 && resp.headers.location) {
        resp.resume();
        let next;
        try {
          next = new URL(resp.headers.location, targetUrl); // Location may be relative
        } catch {
          return fail(502, 'Invalid redirect target');
        }
        if (!isAllowedScheduleUrl(next))
          return fail(502, 'Redirect to a non-Google host was blocked');
        return doGet(next, hops + 1);
      }
      if (resp.statusCode !== 200) {
        resp.resume();
        return fail(502, `HTTP ${resp.statusCode}`);
      }
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      resp.pipe(res);
    }).on('error', e => fail(502, e.message));
  };

  doGet(target);
});

// ── Start server ──────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n🖥  SkoluBoard started`);
  console.log(`   Player: http://localhost:${PORT}/`);
  console.log(`   Login:  http://localhost:${PORT}/login.html`);
  console.log(`   Admin:  http://localhost:${PORT}/admin.html\n`);
});
