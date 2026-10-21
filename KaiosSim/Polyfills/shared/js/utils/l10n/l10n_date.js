window.api.l10n.DateTimeFormat = function () {
  var h = window.api.l10n.get;
  function m(a, r) {
    var n = r.match(/(%[\x2DEO\|]?(?:[\0-\t\x0B\f\x0E-\u2027\u202A-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]))/g);
    if (!n) return r;
    for (var t = 0; t < n.length; t++) {
      var e = "";
      switch (n[t]) {
        case "%a":
          e = h("weekday-".concat(a.getDay(), "-short"));
          break;
        case "%A":
          e = h("weekday-".concat(a.getDay(), "-long"));
          break;
        case "%b":
        case "%h":
          e = h("month-".concat(a.getMonth(), "-short"));
          break;
        case "%B":
          e = h("month-".concat(a.getMonth(), "-long"));
          break;
        case "%Eb":
          e = h("month-".concat(a.getMonth(), "-genitive"));
          break;
        case "%-m":
          e = a.getMonth() + 1;
          break;
        case "%I":
          e = a.getHours() % 12 || 12;
          break;
        case "%e":
          e = a.getDate();
          break;
        case "%p":
          e = a.getHours() < 12 ? h("time_am") : h("time_pm");
          break;
        case "%c":
        case "%x":
        case "%X":
          var o = h("dateTimeFormat_".concat(n[t]));
          o && (/(%c|%x|%X)/.test(o) || (e = m(a, o)));
          break;
        case "%H":
          e = a.getHours();
          break;
        case "%M":
          e = a.getMinutes(), e < 10 && (e = "0".concat(e));
          break;
        case "%Y":
          e = a.getFullYear();
          break;
        case "%m":
          e = a.getMonth() + 1, e < 10 && (e = "0".concat(e));
          break;
        case "%d":
          e = a.getDate(), e < 10 && (e = "0".concat(e));
          break;
        case "%T":
          e = "".concat(a.getHours(), ":").concat(a.getMinutes(), ":").concat(a.getSeconds());
      }
      e, r = r.replace(n[t], e);
    }
    return r;
  }
  function b(a) {
    var r = {};
    var n = ["years", 31536e3, "months", 2592e3, "weeks", 604800, "days", 86400, "hours", 3600, "minutes", 60];
    if ((a = Math.abs(a)) < 60) return {
      minutes: Math.round(a / 60)
    };
    for (var e = 0, t = n.length; e < t; e += 2) {
      var o = n[e + 1];
      o <= a && (r[n[e]] = Math.floor(a / o), a -= r[n[e]] * o);
    }
    return r;
  }
  return {
    localeDateString: function localeDateString(e) {
      return m(e, "%x");
    },
    localeTimeString: function localeTimeString(e) {
      return m(e, "%X");
    },
    localeString: function localeString(e) {
      return m(e, "%c");
    },
    localeFormat: m,
    fromNow: function fromNow(e, t) {
      switch (e.constructor) {
        case String:
          e = parseInt(e, 10);
          break;
        case Date:
          e = e.getTime();
      }
      var a = (Date.now() - e) / 1e3;
      if (isNaN(a)) return h("incorrectDate");
      60 < Math.abs(a) && (a = 0 < a ? Math.ceil(a) : Math.floor(a));
      var r = new Date();
      r.setHours(0, 0, 0, 0);
      var n = r.getTime(),
        o = n - 864e5,
        s = new Date(r.getFullYear().toString()).getTime(),
        c = window.api.hour12 ? "%I:%M %p" : "%H:%M";
      if (e < s) return m(new Date(e), "%B %e, %Y ".concat(c));
      if (e < o) return m(new Date(e), "%B %e, ".concat(c));
      if (e < n) return "".concat(h("days-ago-long", {
        value: 1
      }), ", ").concat(m(new Date(e), c));
      if (14400 < a) return "".concat(h("days-ago-long", {
        value: 0
      }), ", ").concat(m(new Date(e), c));
      var i,
        u = t ? "-short" : "-long",
        g = b(a),
        l = 0 <= a ? "-ago" : "-until";
      for (i in g) return h(i + l + u, {
        value: g[i]
      });
      return h("incorrectDate");
    },
    relativeParts: b
  };
};
