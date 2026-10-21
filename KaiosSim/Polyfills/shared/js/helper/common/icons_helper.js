!function (e) {
  function o(e, n) {
    if (!e) return null;
    var t = i(e),
      r = Object.keys(t).sort(function (e, n) {
        return e - n;
      });
    if (0 === r.length) {
      e = Object.keys(e);
      return 0 < e.length ? e[0] : null;
    }
    n = t[function (n, e) {
      var t = e ? parseInt(e) : 0;
      0 === t && (t = 1 < window.devicePixelRatio ? 142 : 84);
      var r = -1;
      var i = n.length;
      for (var _e = 0; _e < i && r < t; _e++) r = n[_e];
      return r;
    }(r, n)];
    return "apple-touch-icon" === n.rel && 0, n.uri;
  }
  function i(r) {
    var i = {},
      e = Object.keys(r);
    return e.forEach(function (t) {
      var e = r[t].sizes.join(" ").split(" ");
      e.forEach(function (e) {
        var n,
          e = (e = (n = e).indexOf("x")) ? n.substr(0, e) : null;
        e && (i[e] = {
          uri: t,
          rel: r[t].rel
        });
      });
    }), i;
  }
  e.IconsHelper = {
    getIcon: function getIcon(e, n, t) {
      var r;
      if (t && t.icons && (r = o(t.icons, n)), !r) {
        var _i = document.createElement("a");
        _i.href = e, r = "".concat(_i.origin, "/favicon.ico");
      }
      return new Promise(function (e) {
        e(r);
      });
    },
    getBestIcon: o,
    getSizes: i
  };
}(window);
