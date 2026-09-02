'use strict';

/*
 * Transpiles the browser scripts in src/ down to a syntax level old signage
 * devices understand, and writes them to public/js/.
 *
 * Why: WebOS 3.x / Tizen 2016 / Android 5 WebViews ship a Chrome ~49 engine.
 * They abort the ENTIRE inline <script> on the first unknown token (??, ?.,
 * optional catch binding, ...), which is why those TVs showed a black page.
 *
 * IMPORTANT: this is a plain transform, NOT a bundle. Bundling would wrap each
 * file in an IIFE, and admin.html / login.html call their functions through
 * inline on* attributes (onclick="nav('x')", onsubmit="handleLogin(event)"),
 * which only resolve against globals. A non-bundled transform keeps top-level
 * `function` declarations global, so those handlers keep working.
 *
 * The runtime polyfills (padStart, flat, flatMap) are prepended to every file
 * via `banner` instead of an import, since there is no bundle step.
 *
 * Target: es2016 — esbuild lowers ??, ?., optional catch binding, spread and
 * async/await (to a generator helper) but keeps arrow functions, classes,
 * let/const, template strings and generators, all fine on Chrome 45+
 * (generators need Chrome 39+).
 *
 * Runs automatically via `npm start` / `npm run dev` (prestart / predev hooks).
 */

const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const POLYFILLS = fs.readFileSync(path.join(__dirname, 'src', 'polyfills.js'), 'utf8');

esbuild
  .build({
    entryPoints: ['src/player.js', 'src/admin.js', 'src/login.js'],
    outdir: 'public/js',
    bundle: false,
    target: ['es2016'],
    charset: 'utf8',
    legalComments: 'none',
    banner: { js: "'use strict';\n" + POLYFILLS },
    logLevel: 'info',
    // Readable output on purpose: these run on TVs we cannot open devtools on,
    // so a legible stack trace via window.onerror is worth the extra bytes.
    minify: false,
  })
  .catch(() => process.exit(1));
