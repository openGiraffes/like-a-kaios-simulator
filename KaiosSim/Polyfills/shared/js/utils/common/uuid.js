!function () {
  var n = this;
  var e = function e() {};
  var t = function t() {};
  var r = new Array(16);
  var o = function o() {
    var n = 0;
    var e = r;
    var t = 0;
    for (t = 0, n; t < 16; t++) 0 == (3 & t) && (n = 4294967296 * Math.random()), e[t] = n >>> ((3 & t) << 3) & 255;
    return e;
  };
  try {
    var y = require("crypto").randomBytes;
    e = y && function () {
      return y(16);
    };
  } catch (n) {}
  var u = o,
    s = "function" == typeof Buffer ? Buffer : Array,
    c = [],
    l = {};
  for (var _n = 0; _n < 256; _n++) c[_n] = (_n + 256).toString(16).substr(1), l[c[_n]] = _n;
  function f(n, e) {
    var t = e || 0,
      e = c;
    return "".concat(e[n[t++]] + e[n[t++]] + e[n[t++]] + e[n[t++]], "-").concat(e[n[t++]]).concat(e[n[t++]], "-").concat(e[n[t++]]).concat(e[n[t++]], "-").concat(e[n[t++]]).concat(e[n[t++]], "-").concat(e[n[t++]]).concat(e[n[t++]]).concat(e[n[t++]]).concat(e[n[t++]]).concat(e[n[t++]]).concat(e[n[+t]]);
  }
  var a = u();
  var i = [1 | a[0], a[1], a[2], a[3], a[4], a[5]];
  var d = 16383 & (a[6] << 8 | a[7]),
    $ = 0,
    m = 0;
  function v(n, e, t) {
    var r = e && t || 0;
    "string" == typeof n && (e = "binary" === n ? new s(16) : null, n = null);
    var o = (n = n || {}).random || (n.rng || u)();
    if (o[6] = 15 & o[6] | 64, o[8] = 63 & o[8] | 128, e) for (var _n2 = 0; _n2 < 16; _n2++) e[r + _n2] = o[_n2];
    return e || f(o);
  }
  var w = v;
  if (w.v1 = function (n, e, t) {
    var r = e && t || 0;
    var o = e || [];
    var u = null !== (n = n || {}).clockseq ? n.clockseq : d,
      s = null !== n.msecs ? n.msecs : new Date().getTime(),
      c = null !== n.nsecs ? n.nsecs : m + 1;
    if ((t = s - $ + (c - m) / 1e4) < 0 && null === n.clockseq && (u = u + 1 & 16383), (t < 0 || s > $) && null === n.nsecs && (c = 0), 1e4 <= c) throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
    $ = s, m = c, d = u, s += 122192928e5, t = (1e4 * (268435455 & s) + c) % 4294967296, o[r++] = t >>> 24 & 255, o[r++] = t >>> 16 & 255, o[r++] = t >>> 8 & 255, o[r++] = 255 & t, t = s / 4294967296 * 1e4 & 268435455, o[r++] = t >>> 8 & 255, o[r++] = 255 & t, o[r++] = t >>> 24 & 15 | 16, o[r++] = t >>> 16 & 255, o[r++] = u >>> 8 | 128, o[r++] = 255 & u;
    var l = n.node || i;
    for (var _n3 = 0; _n3 < 6; _n3++) o[r + _n3] = l[_n3];
    return e || f(o);
  }, w.v4 = v, w.parse = function (n, e, t) {
    var r = e && t || 0;
    var o = 0;
    for (e = e || [], n.toLowerCase().replace(/[0-9a-f]{2}/, function (n) {
      o < 16 && (e[r + o++] = l[n]);
    }); o < 16;) e[r + o++] = 0;
    return e;
  }, w.unparse = f, w.BufferClass = s, w.mathRNG = o, w.nodeRNG = e, w.whatwgRNG = t, "undefined" != typeof module) module.exports = w;else {
    var p = n.uuid;
    w.noConflict = function () {
      return n.uuid = p, w;
    }, n.uuid = w;
  }
  window.uuid = w;
}();
