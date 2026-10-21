var StringHelper = {
    fromUTF8: function fromUTF8(t) {
      var n = new Uint8Array(t.length);
      for (var e = 0; e < t.length; e++) n[e] = t.charCodeAt(e);
      return n;
    },
    camelCase: function camelCase(e) {
      return e.replace(/-(.)/g, function (e, t) {
        return t.toUpperCase();
      });
    }
  },
  DateHelper = {
    todayStarted: function todayStarted() {
      var e = new Date().valueOf();
      return this.getMidnight(e);
    },
    yesterdayStarted: function yesterdayStarted() {
      var e = new Date().valueOf();
      return this.getMidnight(e - 864e5);
    },
    thisWeekStarted: function thisWeekStarted() {
      var e = new Date();
      var t = e.getDay(),
        t = new Date(e.getFullYear(), e.getMonth(), e.getDate() - t);
      return this.getMidnight(t);
    },
    thisMonthStarted: function thisMonthStarted() {
      var e = new Date();
      return new Date(e.getFullYear(), e.getMonth(), 1).valueOf();
    },
    lastSixMonthsStarted: function lastSixMonthsStarted() {
      return new Date().valueOf() - 15778462980;
    },
    thisYearStarted: function thisYearStarted() {
      var e = new Date();
      return new Date(e.getFullYear(), 0).valueOf();
    },
    getMidnight: function getMidnight(e) {
      var t = new Date(e);
      return new Date(t.getFullYear(), t.getMonth(), t.getDate(), 0).valueOf();
    }
  },
  NumberHelper = {
    zfill: function zfill(e, t) {
      var n = e;
      for (; n.length < t;) n = "0".concat(n);
      return n;
    }
  },
  HtmlHelper = {
    createHighlightHTML: function createHighlightHTML(e, t) {
      if (!t) return this.escapeHTML(e);
      t = new RegExp(t, "gi");
      var n = e.split(t);
      var r = e.match(t);
      if (!r) return this.escapeHTML(e);
      var a = "";
      for (var _e = 0; _e < r.length; _e++) a = "".concat(a + this.escapeHTML(n[_e]), "<span class=\"highlight\">").concat(this.escapeHTML(r[_e]), "</span>");
      return a += this.escapeHTML(n.pop()), a;
    },
    escapeHTML: function escapeHTML(e, t) {
      var n = document.createElement("span");
      return n.textContent = e, n.innerHTML = n.innerHTML.replace(/\s/g, "&nbsp;"), t ? n.innerHTML.replace(/"/g, "&quot;").replace(/'/g, "&#x27;") : n.innerHTML;
    },
    importElements: function importElements(t) {
      for (var _len = arguments.length, e = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        e[_key - 1] = arguments[_key];
      }
      var n = [].slice.call(e, 0);
      n.forEach(function (e) {
        t[StringHelper.camelCase(e)] = document.getElementById(e);
      });
    }
  };
window.StringHelper = StringHelper, window.DateHelper = DateHelper, window.HtmlHelper = HtmlHelper, window.NumberHelper = NumberHelper;
