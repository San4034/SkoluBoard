'use strict';

/*
 * Downloads the Google Fonts used by the schedule themes and writes them, plus a
 * plain @font-face stylesheet, into public/fonts/ so signage devices never need
 * to reach fonts.googleapis.com / fonts.gstatic.com at runtime.
 *
 * Families: Noto Sans, Inter, Roboto, Open Sans, Lato, Montserrat
 * Subsets kept: latin, latin-ext (covers Latvian). The UI is English / Latvian
 * only, so Cyrillic subsets are not downloaded.
 *
 * Run with: npm run fonts   (regenerate only when the family/weight list changes)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const CSS_URL =
  'https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,400;0,600;0,700;0,800;1,400' +
  '&family=Roboto:wght@400;500;700' +
  '&family=Inter:wght@400;600;700;800' +
  '&family=Open+Sans:wght@400;600;700' +
  '&family=Lato:wght@400;700' +
  '&family=Montserrat:wght@400;600;700;800' +
  '&display=swap';

const OUT_DIR = path.join(__dirname, '..', 'public', 'fonts');
const KEEP = new Set(['latin', 'latin-ext']);

// A modern desktop UA makes Google return woff2 (Chrome 36+ / every device we target).
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function get(url, binary) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': UA } }, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(url + ' -> HTTP ' + res.statusCode));
          return;
        }
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => resolve(binary ? Buffer.concat(chunks) : Buffer.concat(chunks).toString('utf8')));
      })
      .on('error', reject);
  });
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const css = await get(CSS_URL, false);

  const re = /\/\*\s*([a-z-]+)\s*\*\/\s*@font-face\s*\{([^}]*)\}/g;
  const faces = [];
  let m;
  while ((m = re.exec(css))) {
    const subset = m[1];
    if (!KEEP.has(subset)) continue;
    const body = m[2];
    const fam = /font-family:\s*'?([^;'"]+)'?/.exec(body)[1].trim();
    const weight = (/font-weight:\s*([0-9]+)/.exec(body) || [, '400'])[1];
    const style = (/font-style:\s*([a-z]+)/.exec(body) || [, 'normal'])[1];
    const range = (/unicode-range:\s*([^;]+);/.exec(body) || [, ''])[1].trim();
    const url = /src:\s*url\(([^)]+)\)/.exec(body)[1].replace(/['"]/g, '');
    const slug = fam.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    faces.push({ fam, weight, style, range, url, file: `${slug}-${weight}-${style}-${subset}.woff2` });
  }

  let bytes = 0;
  for (const f of faces) {
    const dest = path.join(OUT_DIR, f.file);
    if (!fs.existsSync(dest)) fs.writeFileSync(dest, await get(f.url, true));
    bytes += fs.statSync(dest).size;
  }

  const out = [
    '/* Self-hosted Google Fonts — Noto Sans, Inter, Roboto, Open Sans, Lato, Montserrat.',
    '   Subsets: latin, latin-ext (covers Latvian).',
    '   Regenerate with `npm run fonts`. Do not edit by hand. */',
    '',
  ];
  for (const f of faces) {
    out.push('@font-face {');
    out.push(`  font-family: '${f.fam}';`);
    out.push(`  font-style: ${f.style};`);
    out.push(`  font-weight: ${f.weight};`);
    out.push('  font-display: swap;');
    out.push(`  src: url(./${f.file}) format('woff2');`);
    if (f.range) out.push(`  unicode-range: ${f.range};`);
    out.push('}');
  }
  fs.writeFileSync(path.join(OUT_DIR, 'fonts.css'), out.join('\n') + '\n');
  console.log(`Wrote fonts.css + ${faces.length} woff2 files (${(bytes / 1024).toFixed(0)} KB total)`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
