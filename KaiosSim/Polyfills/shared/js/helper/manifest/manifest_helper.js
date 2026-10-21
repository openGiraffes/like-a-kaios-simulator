function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
!function (n) {
  function t(e) {
    var n = this;
    var t = n[e];
    var i = window.api.l10n.language.code || "";
    return i in window.api.l10n.qps && ("name" === e || "description" === e || "short_name" === e) ? t = window.api.l10n.qps[navigator.language].translate(t) : n.locales && [i, i.substr(0, i.indexOf("-"))].some(function (n) {
      return !(!this[n] || !this[n][e]) && (t = this[n][e], !0);
    }, n.locales), "object" != _typeof(t) || t instanceof Array || (t = new o(t)), t;
  }
  function o(n) {
    for (var e in n) Object.defineProperty(this, e, {
      get: t.bind(n, e),
      enumerable: !0
    });
  }
  Object.defineProperty(o.prototype, "displayName", {
    get: function get() {
      return this.short_name || this.name;
    }
  }), n.ManifestHelper = o;
}(window);
