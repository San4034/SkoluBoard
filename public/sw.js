'use strict';

/*
 * SkoluBoard player service worker — keeps the screen showing the last known
 * content when the network drops out.
 *
 * Registered only by the player page. Admin, login, auth and every non-GET
 * request are ignored here and fall straight through to the network.
 *
 * Strategies:
 *   - shell (/, player.js, fonts, logo) — stale-while-revalidate
 *   - player data (/api/playlist, /api/settings/public, /api/bell, and the
 *     schedule CSV proxy) — network first, fall back to the last good copy
 *   - uploaded media (/uploads/*) — cache first (filenames are UUIDs, immutable)
 *
 * Plain Promise style on purpose (no async / await): some signage WebViews ship
 * a service worker but a pre-2017 JS engine.
 */

var VERSION = 'v1';
var SHELL_CACHE = 'sb-shell-' + VERSION;
var DATA_CACHE  = 'sb-data-'  + VERSION;
var MEDIA_CACHE = 'sb-media-' + VERSION;
var MEDIA_MAX_ENTRIES = 80;

var SHELL_ASSETS = ['/', '/index.html', '/js/player.js', '/fonts/fonts.css', '/SkoluBoard-logo.png'];
var DATA_PATHS   = ['/api/playlist', '/api/settings/public', '/api/bell'];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then(function (cache) {
        // add() individually — addAll() would fail the whole install if one 404s
        return Promise.all(SHELL_ASSETS.map(function (u) { return cache.add(u).catch(function () {}); }));
      })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.map(function (k) {
          if (k !== SHELL_CACHE && k !== DATA_CACHE && k !== MEDIA_CACHE) return caches.delete(k);
        }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

// Copy a cached response, tagging it so the page can raise a "stale data" badge.
function tagStale(res) {
  return res.arrayBuffer().then(function (buf) {
    var headers = new Headers(res.headers);
    headers.set('X-SW-Cache', '1');
    return new Response(buf, { status: res.status, statusText: res.statusText, headers: headers });
  });
}

function networkFirst(request, cacheName) {
  return caches.open(cacheName).then(function (cache) {
    return fetch(request)
      .then(function (res) {
        if (res && res.ok) cache.put(request, res.clone());
        return res;
      })
      .catch(function () {
        return cache.match(request).then(function (hit) {
          return hit ? tagStale(hit) : Response.error();
        });
      });
  });
}

function trimCache(cache) {
  return cache.keys().then(function (keys) {
    if (keys.length <= MEDIA_MAX_ENTRIES) return;
    return Promise.all(
      keys.slice(0, keys.length - MEDIA_MAX_ENTRIES).map(function (k) { return cache.delete(k); })
    );
  });
}

function cacheFirst(request, cacheName) {
  return caches.open(cacheName).then(function (cache) {
    return cache.match(request).then(function (hit) {
      if (hit) return hit;
      return fetch(request).then(function (res) {
        if (res && (res.ok || res.type === 'opaque')) {
          cache.put(request, res.clone()).then(function () { return trimCache(cache); });
        }
        return res;
      });
    });
  });
}

function staleWhileRevalidate(request, cacheName) {
  return caches.open(cacheName).then(function (cache) {
    return cache.match(request).then(function (hit) {
      var network = fetch(request)
        .then(function (res) {
          if (res && res.ok) cache.put(request, res.clone());
          return res;
        })
        .catch(function () { return null; });
      return hit || network.then(function (res) { return res || Response.error(); });
    });
  });
}

self.addEventListener('fetch', function (event) {
  var request = event.request;
  if (request.method !== 'GET') return;

  var url;
  try { url = new URL(request.url); } catch (e) { return; }
  if (url.origin !== self.location.origin) return; // YouTube etc. straight to network

  if (DATA_PATHS.indexOf(url.pathname) !== -1) {
    event.respondWith(networkFirst(request, DATA_CACHE));
    return;
  }
  if (url.pathname === '/api/schedule/fetch' && url.searchParams.has('item')) {
    event.respondWith(networkFirst(request, DATA_CACHE));
    return;
  }
  if (url.pathname.indexOf('/uploads/') === 0) {
    event.respondWith(cacheFirst(request, MEDIA_CACHE));
    return;
  }
  if (url.pathname === '/' || url.pathname === '/index.html' ||
      url.pathname === '/js/player.js' || url.pathname.indexOf('/fonts/') === 0 ||
      url.pathname === '/SkoluBoard-logo.png') {
    event.respondWith(staleWhileRevalidate(request, SHELL_CACHE));
    return;
  }
  // Everything else (admin, login, auth, mutations) — default network handling.
});
