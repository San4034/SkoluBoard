'use strict';

// ── Offline resilience ───────────────────────────────────────────────
// The service worker caches the shell, the last playlist/settings/bell/schedule
// responses and every piece of uploaded media, so a network outage keeps the
// last content on screen instead of the error page. Old WebViews without a
// service worker simply run as before.

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(function () {});
}

function _setOffline(on) {
  const el = document.getElementById('offline-badge');
  if (el) el.classList.toggle('show', !!on);
}

// ── YouTube IFrame API ────────────────────────────────────────────────

let _ytReady = false;
const _ytCallbacks = [];

window.onYouTubeIframeAPIReady = function() {
  _ytReady = true;
  _ytCallbacks.splice(0).forEach(fn => fn());
};

function _whenYTReady(fn) {
  if (_ytReady) { fn(); return; }
  _ytCallbacks.push(fn);
}

(function() {
  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);
})();

// ── Schedule helpers ──────────────────────────────────────────────────

function _escHtml(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Theme value sanitisers ────────────────────────────────────────────
// Schedule theme fields are entered by an admin, stored as JSON and then written
// straight into element styles on the kiosk. Each one is validated here so a
// value can neither smuggle an extra url() / background layer into a property
// nor break out of the surrounding attribute — a signage screen must never turn
// into an outbound beacon.

function _safeColor(v, fallback) {
  if (typeof v !== 'string') return fallback;
  const s = v.trim();
  if (/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(s)) return s;
  if (/^(rgb|hsl)a?\([0-9eE.,%\s/+-]+\)$/.test(s))           return s;
  if (/^[a-z]{3,20}$/i.test(s))                              return s; // named colour
  return fallback;
}

function _safeFontFamily(v) {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  // letters, digits, spaces, commas, hyphens, dots, quotes — no (), ;, {}, :, /,
  // @, url(...), etc.
  return /^[\w\s,'".-]{1,120}$/.test(s) ? s : null;
}

function _safeLocalUrl(v) {
  // A same-origin absolute path only (e.g. "/uploads/xxx"): blocks //host,
  // http(s):, data:, javascript: and any ' " ( ) that could break out.
  return (typeof v === 'string' && !v.startsWith('//') && /^\/[a-z0-9_\-./]+$/i.test(v)) ? v : null;
}

function _num(v, fallback, min, max) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}

function _parseCSV(text) {
  const rows = [];
  for (const line of text.replace(/\r\n?/g, '\n').split('\n')) {
    if (!line.trim()) continue;
    const row = []; let f = '', inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') { if (inQ && line[i+1]==='"') { f+='"'; i++; } else inQ=!inQ; }
      else if (c === ',' && !inQ) { row.push(f.trim()); f=''; }
      else f += c;
    }
    row.push(f.trim()); rows.push(row);
  }
  return rows;
}

function _schedColWidths(headers) {
  const map = {
    'Aizvietotājs':25, 'Stunda':8, 'Klase':9,
    'Kab.':7, 'Promesošais skolotājs':22, 'Piezīmes':29,
  };
  const totalKnown = headers.reduce((s,h) => s + (map[h]||0), 0);
  const unknown    = headers.filter(h => !map[h]).length;
  const perUnknown = unknown ? Math.floor((100 - totalKnown) / unknown) : 0;
  return headers.map(h => `${map[h] || perUnknown}%`);
}

function _matchesToday(cell) {
  const s = String(cell).trim().replace(/\.$/, '');
  if (!s) return false;
  const t = new Date();
  const d = t.getDate(), m = t.getMonth() + 1, y = t.getFullYear();
  const dd = String(d).padStart(2,'0'), mm = String(m).padStart(2,'0');
  const pats = [
    `${d}.${m}.${y}`, `${dd}.${mm}.${y}`,
    `${y}-${mm}-${dd}`,
    `${d}/${m}/${y}`, `${dd}/${mm}/${y}`,
    `${dd}.${mm}.${String(y).slice(2)}`,
  ];
  return pats.some(p => s === p || s.startsWith(p + ' ') || s.startsWith(p + ','));
}

async function _expandScheduleItems(slides) {
  const result = [];
  for (const item of slides) {
    if (item.type !== 'schedule') { result.push(item); continue; }
    let cfg; try { cfg = JSON.parse(item.src); } catch { continue; }
    if (!cfg?.sheetsUrl) continue;

    try {
      // Fetch by item id: the server resolves the saved sheetsUrl itself, so the
      // token-less player never hands the proxy an arbitrary URL.
      const r = await fetch(`/api/schedule/fetch?item=${encodeURIComponent(item.id)}`);
      if (!r.ok) throw new Error(`HTTP ${r.status} — check access to the table`);
      const text = await r.text();
      if (text.trim().startsWith('<')) throw new Error('The table requires authorisation — set the access level to ‘Anyone with the link’');
      const rows = _parseCSV(text);
      if (rows.length < 2) continue;

      // Auto-detect header row: scan first 5 rows for the date column name
      let headerRowIdx = 0;
      if (cfg.dateColumn) {
        const dc = String(cfg.dateColumn).trim();
        if (isNaN(dc) || dc === '') {
          const dcLower = dc.toLowerCase();
          for (let i = 0; i < Math.min(rows.length, 5); i++) {
            if (rows[i].some(h => h.trim().toLowerCase() === dcLower)) {
              headerRowIdx = i;
              break;
            }
          }
        }
      }

      const headers = rows[headerRowIdx];
      let   dataRows = rows.slice(headerRowIdx + 1).filter(r => r.some(c => c.trim()));
      if (!dataRows.length) continue;

      // Find date column index
      let dateColIdx = -1;
      if (cfg.dateColumn) {
        const dc = String(cfg.dateColumn).trim();
        dateColIdx = (!isNaN(dc) && dc !== '')
          ? parseInt(dc) - 1
          : headers.findIndex(h => h.trim().toLowerCase() === dc.toLowerCase());
      }

      // Filter rows by today's date
      if (dateColIdx >= 0) {
        const firstDateRow = dataRows.find(r => (r[dateColIdx]||'').trim());
        if (!firstDateRow) {
          dataRows = [];
        } else if (firstDateRow.some((c, i) => i !== dateColIdx && c.trim())) {
          // Per-row format: every data row has its own date value
          dataRows = dataRows.filter(row => _matchesToday(row[dateColIdx] || ''));
        } else {
          // Grouped format: date row is a separator, data rows follow with empty date cell
          const grouped = new Map();
          let cur = null;
          for (const row of dataRows) {
            const dv = (row[dateColIdx]||'').trim();
            if (dv) {
              cur = dv;
              if (!grouped.has(cur)) grouped.set(cur, []);
            } else if (cur && row.some(c => c.trim())) {
              grouped.get(cur).push(row);
            }
          }
          dataRows = [...grouped.entries()]
            .filter(([d]) => _matchesToday(d))
            .flatMap(([, r]) => r);
        }
      }

      const today = new Date();
      const date  = `${String(today.getDate()).padStart(2,'0')}.${String(today.getMonth()+1).padStart(2,'0')}.${today.getFullYear()}.`;

      // No rows for today — show "no substitutions" slide
      if (dateColIdx >= 0 && !dataRows.length) {
        result.push({
          ...item,
          type: 'schedule-page',
          _sched: {
            date,
            title:      cfg.title      || '',
            schoolName: cfg.schoolName || '',
            logoUrl:    cfg.logoUrl    || '',
            lang:       cfg.lang       || 'en',
            colHeaders: [],
            rows:       [],
            noDataMsg:  (cfg.lang === 'lv') ? 'Šodien aizvietošanu nav' : 'No substitutions today',
            theme:      cfg.theme || null,
            pageNum: 1, totalPages: 1,
          },
        });
        continue;
      }

      const defaultCols = ['Aizvietotājs','Stunda','Klase','Kab.','Promesošais skolotājs','Piezīmes'];
      const wantedCols  = cfg.columns || defaultCols;
      let   colIdxs     = wantedCols.map(n => headers.findIndex(h => h.trim()===n.trim())).filter(i => i>=0);
      // fall back to all columns, excluding the date column and empty-header columns
      if (!colIdxs.length) colIdxs = headers.map((_,i)=>i).filter(i => i !== dateColIdx && headers[i].trim());
      const colHeaders = colIdxs.map(i => headers[i]);

      const rps   = cfg.rowsPerSlide || 14;
      const pages = [];
      for (let i = 0; i < dataRows.length; i += rps) pages.push(dataRows.slice(i, i + rps));

      pages.forEach((pageRows, pi) => {
        result.push({
          ...item,
          type: 'schedule-page',
          _sched: {
            date,
            title:      cfg.title      || '',
            schoolName: cfg.schoolName || '',
            logoUrl:    cfg.logoUrl    || '',
            lang:       cfg.lang       || 'en',
            colHeaders,
            rows:       pageRows.map(row => colIdxs.map(ci => row[ci] || '')),
            rowsPerSlide: rps,
            theme:      cfg.theme || null,
            pageNum:    pi + 1,
            totalPages: pages.length,
          },
        });
      });
    } catch(e) {
      console.error('[Schedule] Error loading schedule:', e);
      result.push({
        ...item,
        type: 'schedule-page',
        _sched: {
          date: '',
          title: 'SCHEDULE UNAVAILABLE',
          schoolName: 'Check access to the table in Google Sheets',
          logoUrl: '',
          colHeaders: ['Error'],
          rows: [[String(e.message || 'Failed to get data from Google Sheets')]],
          pageNum: 1,
          totalPages: 1,
        },
      });
    }
  }
  return result;
}

// ── Slideshow engine ──────────────────────────────────────────────────

class Slideshow {
  constructor(slides, config) {
    this.slides       = slides;
    this.config       = config;
    this.currentIndex = -1;
    this.timer        = null;
    this.elements     = [];
    this._ytPlayers   = new Map();

    this.$container = document.getElementById('slideshow');
    this.$progress  = document.getElementById('progress-bar');
    this.$counter   = document.getElementById('slide-counter');

    this._buildAll();
  }

  _buildAll() {
    this.slides.forEach((data, index) => {
      const el = this._buildSlide(data, index);
      this.$container.appendChild(el);
      this.elements.push(el);
    });
  }

  _buildSlide(data, index) {
    const slide = document.createElement('div');
    slide.className = 'slide';

    switch (data.type) {
      case 'image':   this._buildImage(slide, data);          break;
      case 'video':   this._buildVideo(slide, data);          break;
      case 'youtube':        this._buildYoutube(slide, data, index);  break;
      case 'schedule-page':  this._buildSchedulePage(slide, data);    break;
      default: this._showError(slide, `Unknown type: "${data.type}"`);
    }
    return slide;
  }

  _buildImage(slide, data) {
    const mode = data.display_mode || 'blur';

    if (mode === 'blur') {
      const bg = document.createElement('div');
      bg.className = 'slide-bg';
      bg.style.backgroundImage = `url("${data.src}")`;
      slide.appendChild(bg);
    }

    const wrap = document.createElement('div');
    wrap.className = 'slide-content';

    const img = document.createElement('img');
    img.className = mode === 'cover' ? 'slide-img mode-cover' : 'slide-img';
    img.src = data.src;
    img.alt = '';
    img.decoding = 'async';
    img.onerror  = () => this._showError(wrap, `The image could not be loaded:\n${data.src}`);

    wrap.appendChild(img);
    slide.appendChild(wrap);
  }

  _buildVideo(slide, data) {
    const mode = data.display_mode || 'contain';
    const wrap = document.createElement('div');
    wrap.className = 'slide-content';

    const video = document.createElement('video');
    video.className   = mode === 'cover' ? 'slide-video mode-cover' : 'slide-video';
    video.src         = data.src;
    video.muted       = false;
    video.playsInline = true;
    video.preload     = 'auto';
    // Old WebKit-based TV engines honour the attributes, not the properties.
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.onerror     = () => this._showError(wrap, `The video could not be loaded:\n${data.src}`);

    wrap.appendChild(video);
    slide.appendChild(wrap);
  }

  _buildYoutube(slide, data, index) {
    const wrap = document.createElement('div');
    wrap.className = 'slide-content';

    const container = document.createElement('div');
    container.id = `yt-${index}`;
    container.className = 'slide-yt-wrap';

    wrap.appendChild(container);
    slide.appendChild(wrap);
  }

  _buildSchedulePage(slide, data) {
    const s = data._sched;
    const th = s.theme || {};
    const bgType    = th.bgType || 'gradient';
    const font      = _safeFontFamily(th.fontFamily);
    const hfont     = _safeFontFamily(th.headerFont) || font;
    const textColor = _safeColor(th.textColor, '#ffffff');
    const tableOp   = (_num(th.tableOpacity, 13, 0, 100) / 100).toFixed(2);
    const tableR    = _num(th.tableRadius, 12, 0, 200) + 'px';
    const tBlur     = th.tableBlur   !== false;
    const decoVis   = th.decoVisible !== false;
    const bgImg     = _safeLocalUrl(th.bgImageUrl);

    if (bgType === 'solid') {
      slide.style.background = _safeColor(th.bgSolid, '#1a1a2e');
    } else if (bgType === 'image' && bgImg) {
      const fit = th.bgImageFit === 'contain' ? 'contain' : 'cover';
      slide.style.background = `url("${bgImg}") center/${fit} no-repeat`;
      // dark overlay injected below
    } else {
      const angle = _num(th.bgAngle, 180, 0, 360);
      slide.style.background = `linear-gradient(${angle}deg,${_safeColor(th.bgFrom, '#f4a63a')},${_safeColor(th.bgTo, '#d84d00')})`;
    }
    if (font) slide.style.fontFamily = font;
    slide.style.setProperty('--sched-text', textColor);

    const wrap = document.createElement('div');
    wrap.className = 'sched-slide';

    // Image bg overlay
    if (bgType === 'image' && bgImg) {
      const ovl = document.createElement('div');
      ovl.style.cssText = `position:absolute;inset:0;background:rgba(0,0,0,${(_num(th.bgOverlay, 50, 0, 90) / 100).toFixed(2)});z-index:0`;
      wrap.appendChild(ovl);
    }

    const deco = document.createElement('div');
    deco.className = 'sched-deco';
    if (!decoVis) deco.style.display = 'none';
    wrap.appendChild(deco);

    const header = document.createElement('div');
    header.className = 'sched-header';
    header.innerHTML = `<div class="sched-title">${_escHtml(s.title)}</div><div class="sched-date-block"><div class="sched-lesson"></div><div class="sched-clock"></div><div class="sched-date"></div></div>`;
    if (hfont) {
      const titleEl = header.querySelector('.sched-title');
      if (titleEl) titleEl.style.fontFamily = hfont;
    }
    // Live clock + date + lesson status
    const clockEl  = header.querySelector('.sched-clock');
    const dateEl   = header.querySelector('.sched-date');
    const lessonEl = header.querySelector('.sched-lesson');
    const _lang = s.lang || 'en';
    const _loc  = _LOCALE[_lang] || _LOCALE.en;
    const _tick = () => {
      const n = new Date();
      const hh = String(n.getHours()).padStart(2,'0');
      const mm = String(n.getMinutes()).padStart(2,'0');
      const ss = String(n.getSeconds()).padStart(2,'0');
      clockEl.textContent = `${hh}:${mm}:${ss}`;
      const _day = _lang === 'lv' ? `${n.getDate()}.` : n.getDate();
      dateEl.textContent  = `${_loc.days[n.getDay()]}, ${_day} ${_loc.months[n.getMonth()]}`;
      if (lessonEl && _bellData) {
        const dow = n.getDay();
        const isWeekend = dow === 0 || dow === 6;
        const iso = `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`;
        const isWorkingWeekend = Array.isArray(_bellData.workingWeekendDates) && _bellData.workingWeekendDates.includes(iso);
        if (isWeekend && !isWorkingWeekend) {
          lessonEl.textContent = '';
        } else {
          const schedule = _todayIsShortDay() ? _bellData.shortened : _bellData.regular;
          lessonEl.textContent = _lessonLabel(_getLessonStatus(schedule, n), _lang);
        }
      }
    };
    _tick();
    const _clockInt = setInterval(_tick, 1000);
    // Stop clock when slide is removed from DOM
    new MutationObserver((_, obs) => {
      if (!document.contains(clockEl)) { clearInterval(_clockInt); obs.disconnect(); }
    }).observe(document.body, { childList: true, subtree: true });
    wrap.appendChild(header);

    if (s.noDataMsg) {
      const noData = document.createElement('div');
      noData.style.cssText = 'flex:1;display:flex;align-items:center;justify-content:center;' +
        'color:rgba(255,255,255,.85);font-size:clamp(20px,3.5vh,48px);font-weight:700;' +
        'letter-spacing:.06em;text-shadow:0 2px 12px rgba(0,0,0,.2)';
      noData.textContent = s.noDataMsg;
      wrap.appendChild(noData);
    } else {
      const tableWrap = document.createElement('div');
      tableWrap.className = 'sched-table-wrap';
      tableWrap.style.background = `rgba(255,255,255,${tableOp})`;
      tableWrap.style.borderRadius = tableR;
      if (!tBlur) tableWrap.style.backdropFilter = 'none';

      // Use rowsPerSlide (max rows) so all pages have identical row height
      const maxRows = s.rowsPerSlide || s.rows.length;
      if (maxRows > 0) {
        const n   = maxRows + 1; // +1 for thead
        // Resolve to px here rather than emitting clamp()/vh in the style:
        // old signage engines (Chrome < 79) don't support clamp(), which would
        // leave the table with no font-size at all.
        const vh  = (window.innerHeight || 1080) / 100;
        const clampPx = (min, val, max) => Math.max(min, Math.min(val, max)).toFixed(1) + 'px';
        tableWrap.style.setProperty('--td-fs', clampPx(6, 37 / n * vh,        22));
        tableWrap.style.setProperty('--td-pv', clampPx(2, 37 / n * 0.49 * vh, 12));
      }

      const table = document.createElement('table');
      table.className = 'sched-table';

      // Detect which columns are "notes" (long/optional text) vs important.
      // Notes columns: header matches piezīm/note/remark, or — if none match —
      // the single column with the highest average content length (only when it
      // is clearly longer than the others, i.e. > 1.8× average of rest).
      const notesRe = /piezīm|piezim|note|remark|comment|remark/i;
      let clipCols = new Set(
        s.colHeaders.map((h, i) => notesRe.test(h) ? i : -1).filter(i => i >= 0)
      );
      if (clipCols.size === 0 && s.rows.length > 0) {
        const avgLen = s.colHeaders.map((_, ci) => {
          const lens = s.rows.map(r => (r[ci] || '').length);
          return lens.reduce((a, b) => a + b, 0) / lens.length;
        });
        const total = avgLen.reduce((a, b) => a + b, 0) || 1;
        const maxIdx = avgLen.indexOf(Math.max(...avgLen));
        const othersAvg = (total - avgLen[maxIdx]) / (avgLen.length - 1 || 1);
        if (avgLen[maxIdx] > othersAvg * 1.8) clipCols.add(maxIdx);
      }

      // Build colgroup: fixed widths for important cols, remainder for notes cols.
      const colgroup = document.createElement('colgroup');
      const n = s.colHeaders.length;
      const importantW = Math.floor(88 / Math.max(n, 1)); // rough equal share
      s.colHeaders.forEach((_, ci) => {
        const col = document.createElement('col');
        if (!clipCols.has(ci)) col.style.width = `${importantW}%`;
        colgroup.appendChild(col);
      });
      table.appendChild(colgroup);

      const thead = document.createElement('thead');
      thead.innerHTML = `<tr>${s.colHeaders.map((h, ci) =>
        `<th class="${clipCols.has(ci) ? 'sched-td-clip' : ''}">${_escHtml(h)}</th>`
      ).join('')}</tr>`;
      table.appendChild(thead);

      const tbody = document.createElement('tbody');
      s.rows.forEach((row, ri) => {
        const tr = document.createElement('tr');
        tr.style.setProperty('--row-i', ri);
        tr.innerHTML = row.map((c, ci) =>
          `<td class="${clipCols.has(ci) ? 'sched-td-clip' : ''}" title="${_escHtml(c)}">${_escHtml(c)}</td>`
        ).join('');
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      tableWrap.appendChild(table);
      wrap.appendChild(tableWrap);
    }

    const footer = document.createElement('div');
    footer.className = 'sched-footer';
    const logo = _safeLocalUrl(s.logoUrl);
    footer.innerHTML = [
      logo ? `<img src="${logo}" class="sched-logo" alt="">` : '',
      `<div class="sched-school-name">${_escHtml(s.schoolName)}</div>`,
    ].join('');
    wrap.appendChild(footer);

    slide.appendChild(wrap);
  }

  _showError(parent, message) {
    parent.innerHTML = '';
    const el = document.createElement('div');
    el.className   = 'slide-error';
    el.textContent = message;
    parent.appendChild(el);
  }

  start() {
    if (!this.slides.length) return;
    this._goTo(0);
  }

  next() {
    if (this.slides.length <= 1) return;
    this._goTo((this.currentIndex + 1) % this.slides.length);
  }

  prev() {
    if (this.slides.length <= 1) return;
    this._goTo((this.currentIndex - 1 + this.slides.length) % this.slides.length);
  }

  _goTo(index) {
    const prevIdx = this.currentIndex;
    this._clearTimer();

    if (prevIdx >= 0) {
      this.elements[prevIdx].classList.remove('active');
      this._stopMedia(this.elements[prevIdx], this.slides[prevIdx], prevIdx);
    }

    this.currentIndex = index;
    const nextEl   = this.elements[index];
    const nextData = this.slides[index];

    nextEl.classList.add('active');
    this._startMedia(nextEl, nextData, index);
    this._updateCounter(index);

    const waitForEnd = nextData.use_video_duration &&
      (nextData.type === 'video' || nextData.type === 'youtube');
    if (!waitForEnd && this.config.autoAdvance) {
      const dur = nextData.group_duration || this.config.defaultDuration;
      this._startProgress(dur);
      this.timer = setTimeout(() => this.next(), dur);
    } else {
      this._clearProgress();
    }
  }

  // Start <video> playback across engines old and new.
  //  - Chrome < 50 / old TV WebViews: play() returns no Promise — we cannot
  //    catch a rejection, so we poll currentTime once and retry muted if stuck.
  //  - Chrome 66+ strict autoplay: play() Promise rejects when sound is not
  //    allowed — we retry muted so at least the picture shows.
  // Sound is kept whenever the first (un-muted) attempt actually starts.
  _playVideo(video) {
    let started = false;
    const onPlaying = () => { started = true; };
    video.addEventListener('playing', onPlaying, { once: true });

    const retryMuted = () => {
      if (started || video.muted) return;
      video.muted = true;
      const r = video.play();
      if (r && typeof r.catch === 'function') {
        r.catch(() => console.warn('[Signage] Video playback blocked.'));
      }
    };

    const p = video.play();
    if (p && typeof p.catch === 'function') p.catch(retryMuted);
    setTimeout(() => { if (!started && !video.currentTime) retryMuted(); }, 2000);
  }

  _startMedia(slideEl, data, index) {
    if (data.type === 'video') {
      const video = slideEl.querySelector('video');
      if (!video) return;
      video.currentTime = 0;
      this._playVideo(video);

      if (data.use_video_duration) {
        video.addEventListener('ended', () => {
          this._clearProgress();
          this._clearTimer();
          this.next();
        }, { once: true });
      }
    } else if (data.type === 'youtube') {
      _whenYTReady(() => {
        if (this.currentIndex !== index) return;
        const videoId = (data.src.match(/embed\/([^?&]+)/) || [])[1];
        if (!videoId) return;

        if (this._ytPlayers.has(index)) {
          const p = this._ytPlayers.get(index);
          try { p.seekTo(0, true); } catch {}
          this._playYT(p, index);
        } else {
          const player = new YT.Player(`yt-${index}`, {
            width: '100%',
            height: '100%',
            videoId,
            playerVars: { autoplay: 1, controls: 0, rel: 0, modestbranding: 1, playsinline: 1 },
            events: {
              onReady: (e) => { if (this.currentIndex === index) this._playYT(e.target, index); },
              onStateChange: (e) => {
                if (e.data === 1 && player._sbStarted) player._sbStarted();
                if (e.data === 0 && data.use_video_duration && this.currentIndex === index) {
                  this._clearProgress();
                  this._clearTimer();
                  this.next();
                }
              },
            },
          });
          this._ytPlayers.set(index, player);
        }
      });
    }
  }

  // Same idea as _playVideo, for the cross-origin YouTube iframe: try with
  // sound, and if it has not reached PLAYING after 2s (old TV engines block
  // autoplay of an embed without a gesture), mute and retry so it still runs.
  _playYT(player, index) {
    let started = false;
    player._sbStarted = () => { started = true; };
    try { player.playVideo(); } catch (e) {}
    setTimeout(() => {
      if (started || this.currentIndex !== index) return;
      try { player.mute(); player.playVideo(); } catch (e) {}
    }, 2000);
  }

  _stopMedia(slideEl, data, index) {
    if (data.type === 'video') {
      const video = slideEl.querySelector('video');
      if (video) { video.pause(); video.currentTime = 0; }
    } else if (data.type === 'youtube') {
      const p = this._ytPlayers.get(index);
      if (p) { try { p.pauseVideo(); } catch {} }
    }
  }

  _clearTimer() { clearTimeout(this.timer); this.timer = null; }

  _startProgress(duration) {
    if (!this.config.showProgress) return;
    this.$progress.style.transition = 'none';
    this.$progress.style.width      = '0%';
    void this.$progress.offsetWidth;
    this.$progress.style.transition = `width ${duration}ms linear`;
    this.$progress.style.width      = '100%';
  }

  _clearProgress() {
    if (!this.config.showProgress) return;
    this.$progress.style.transition = 'none';
    this.$progress.style.width      = '0%';
  }

  _updateCounter(index) {
    if (!this.config.showCounter) return;
    this.$counter.textContent = `${index + 1} / ${this.slides.length}`;
  }
}

// ── Bell schedule helpers ─────────────────────────────────────────────

let _bellData = null;

function _loadBell() {
  return fetch('/api/bell').then(r => r.json()).then(d => { _bellData = d; }).catch(() => {});
}

const _LOCALE = {
  en: {
    days:   ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
    months: ['January','February','March','April','May','June','July','August','September','October','November','December'],
    lessonOn:    n => `Lesson ${n} in progress`,
    lessonBreak: n => `Break · next: lesson ${n}`,
  },
  lv: {
    days:   ['Svētdiena','Pirmdiena','Otrdiena','Trešdiena','Ceturtdiena','Piektdiena','Sestdiena'],
    months: ['janvāris','februāris','marts','aprīlis','maijs','jūnijs','jūlijs','augusts','septembris','oktobris','novembris','decembris'],
    lessonOn:    n => `Notiek ${n}. stunda`,
    lessonBreak: n => `Pārtraukums · nākamā: ${n}. stunda`,
  },
};

function _lessonLabel(status, lang) {
  if (!status) return '';
  const loc = _LOCALE[lang] || _LOCALE.en;
  if (status.type === 'lesson') return loc.lessonOn(status.num);
  return loc.lessonBreak(status.nextLesson);
}

function _todayIsShortDay() {
  if (!_bellData) return false;
  if (_bellData.shortDayManual) return true;
  const today = new Date();
  const iso = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  return Array.isArray(_bellData.shortDayDates) && _bellData.shortDayDates.includes(iso);
}

function _getLessonStatus(schedule, now) {
  if (!schedule || !schedule.length) return null;
  const cur = now.getHours() * 60 + now.getMinutes();
  for (let i = 0; i < schedule.length; i++) {
    const [sh, sm] = schedule[i].start.split(':').map(Number);
    const [eh, em] = schedule[i].end.split(':').map(Number);
    const start = sh * 60 + sm, end = eh * 60 + em;
    if (cur >= start && cur < end) return { type: 'lesson', num: schedule[i].lesson };
    if (i < schedule.length - 1) {
      const [nsh, nsm] = schedule[i + 1].start.split(':').map(Number);
      const nextStart = nsh * 60 + nsm;
      if (cur >= end && cur < nextStart) return { type: 'break', nextLesson: schedule[i + 1].lesson };
    }
  }
  return null;
}

// ── Load data from API and start ──────────────────────────────────────

function showStatus(icon, title, hint = '') {
  document.getElementById('st-icon').textContent  = icon;
  document.getElementById('st-title').textContent = title;
  document.getElementById('st-hint').textContent  = hint;
  document.getElementById('status-screen').classList.add('show');
  document.getElementById('slideshow').style.display = 'none';
}

async function init() {
  showStatus('⏳', 'Loading…');

  try {
    const [configRes, playlistRes] = await Promise.all([
      fetch('/api/settings/public'),
      fetch('/api/playlist'),
      _loadBell(),
    ]);

    if (!configRes.ok || !playlistRes.ok) throw new Error('Server response error');

    // The service worker tags responses it served from cache during an outage.
    _setOffline([configRes, playlistRes].some(r => r && r.headers && r.headers.get('X-SW-Cache')));

    const config = await configRes.json();
    let slides = await playlistRes.json();

    // Expand schedule items into individual slide pages
    slides = await _expandScheduleItems(slides);

    if (!slides.length) {
      showStatus('📺', 'No active content', 'Add content in the admin panel');
      return;
    }

    // Auto-refresh every 30 min to reload fresh schedule data
    setTimeout(() => location.reload(), 30 * 60 * 1000);

    document.getElementById('status-screen').classList.remove('show');
    document.getElementById('slideshow').style.display = '';
    document.documentElement.style.setProperty('--transition', `${config.transition}ms`);

    const show = new Slideshow(slides, config);
    show.start();

    document.addEventListener('keydown', ({ key }) => {
      if (key === 'ArrowRight' || key === ' ') show.next();
      if (key === 'ArrowLeft')                 show.prev();
    });

  } catch (err) {
    console.error(err);
    showStatus('⚠️', 'Connection error', 'Failed to load playlist from server');
  }
}

init();
