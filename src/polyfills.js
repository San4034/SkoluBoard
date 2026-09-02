/*
 * Runtime polyfills for old signage devices (target: Chrome/WebView >= 49,
 * e.g. WebOS 3.x, Tizen 2016+, Android 5 WebView).
 *
 * esbuild lowers modern *syntax* (??, ?., arrow fns, classes, let/const,
 * template strings, optional catch binding). It does NOT add missing runtime
 * methods, so the few that this codebase relies on are shimmed here.
 *
 * Keep this list minimal and in sync with actual usage.
 */

// String.prototype.padStart — Chrome 57 (used heavily for clock/date formatting)
if (!String.prototype.padStart) {
  String.prototype.padStart = function (targetLength, padString) {
    targetLength = targetLength >> 0;
    padString = String(typeof padString !== 'undefined' ? padString : ' ');
    if (this.length >= targetLength || !padString.length) return String(this);
    var pad = '';
    var needed = targetLength - this.length;
    while (pad.length < needed) pad += padString;
    return pad.slice(0, needed) + String(this);
  };
}

// String.prototype.padEnd — Chrome 57 (kept for parity / future use)
if (!String.prototype.padEnd) {
  String.prototype.padEnd = function (targetLength, padString) {
    targetLength = targetLength >> 0;
    padString = String(typeof padString !== 'undefined' ? padString : ' ');
    if (this.length >= targetLength || !padString.length) return String(this);
    var pad = '';
    var needed = targetLength - this.length;
    while (pad.length < needed) pad += padString;
    return String(this) + pad.slice(0, needed);
  };
}

// Array.prototype.flat — Chrome 69
if (!Array.prototype.flat) {
  Array.prototype.flat = function (depth) {
    var d = depth === undefined ? 1 : Number(depth) || 0;
    var flatten = function (arr, dd) {
      return arr.reduce(function (acc, val) {
        return acc.concat(
          Array.isArray(val) && dd > 0 ? flatten(val, dd - 1) : [val]
        );
      }, []);
    };
    return flatten(this, d);
  };
}

// Array.prototype.flatMap — Chrome 69 (used when grouping schedule rows by date)
if (!Array.prototype.flatMap) {
  Array.prototype.flatMap = function (callback, thisArg) {
    return this.map(function (v, i, a) {
      return callback.call(thisArg, v, i, a);
    }).flat();
  };
}
