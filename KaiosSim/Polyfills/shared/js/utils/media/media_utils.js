var MediaUtils = {
  _: window.api.l10n.get,
  formatDate: function formatDate(t) {
    if (!t || isNaN(t)) return null;
    {
      var r = new window.api.l10n.DateTimeFormat();
      return r.localeFormat(new Date(t), this._("dateTimeFormat_%x"));
    }
  },
  formatSize: function formatSize(t) {
    if (!t || void 0 === t || isNaN(t)) return null;
    var r = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    var e = 0;
    for (; 1024 <= t && e < r.length - 1;) t /= 1024, ++e;
    var a = e < 2 ? Math.round(t) : Math.round(10 * t) / 10;
    return "".concat(a.toLocaleString(navigator.language), " ").concat(this._("byteUnit-".concat(r[e])));
  },
  formatDuration: function formatDuration(t) {
    function r(t, r) {
      var e = String(t);
      for (; e.length < r;) e = "0".concat(e);
      return e;
    }
    t = Math.round(t);
    var e = Math.floor(t / 60);
    var a = t % 60;
    if (e < 60) return "".concat(r(e, 2), ":").concat(r(a, 2));
    t = Math.floor(e / 60);
    return e = Math.floor(e % 60), "".concat(t, ":").concat(r(e, 2), ":").concat(r(a, 2));
  },
  populateMediaInfo: function populateMediaInfo(t) {
    for (var r in t) if (Object.prototype.hasOwnProperty.call(t, r)) {
      var e = document.getElementById(t[r]);
      e && (e.textContent = t[r]);
    }
  },
  binarySearch: function binarySearch(t, r, e, a, n) {
    if (void 0 === e && (e = function e(t, r) {
      return t - r;
    }), void 0 === a) return MediaUtils.binarySearch(t, r, e, 0, t.length);
    if (a === n) return a;
    var i = Math.floor((a + n) / 2);
    return e(r, t[i]) < 0 ? MediaUtils.binarySearch(t, r, e, a, i) : MediaUtils.binarySearch(t, r, e, i + 1, n);
  }
};
window.MediaUtils = MediaUtils;
