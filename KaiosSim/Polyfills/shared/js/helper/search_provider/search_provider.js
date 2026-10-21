function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
!function (e) {
  var n = "search.cache",
    r = "search.provider",
    t = [];
  window.ClientIdCustomizer || t.push("http://shared.localhost/js/helper/search_provider/clientId_customizer.js"), window.Format || t.push("http://shared.localhost/js/helper/search_provider/format.js");
  var i = null,
    o = {},
    s = null,
    a = null,
    l = null,
    c = null;
  function p(e, r) {
    for (var _t in r) {
      var n;
      Object.prototype.hasOwnProperty.call(r, _t) && (n = r[_t], Object.prototype.hasOwnProperty.call(e, _t) && "object" == _typeof(e[_t]) && "object" == _typeof(n) ? p(e[_t], n) : e[_t] = n);
    }
    return e;
  }
  function d(r) {
    var e = Object.keys(r.params).map(function (e) {
      return "".concat(e, "=").concat(r.params[e]);
    }).join("&");
    return r.url + (e ? "?".concat(e) : "");
  }
  function u() {
    SettingsObserver.observe(r, !1, function (e) {
      i = !1 !== e && e in o ? e : s, c && null !== i && Object.keys(o).length && (c(), c = null), a && a();
    });
  }
  function v(e) {
    return !!(i && e in o[i]) && o[i][e];
  }
  v.providerUpdated = function (e) {
    a = e;
  }, v.setProvider = function (e) {
    return e in o && (SettingsObserver.setValue([{
      name: r,
      value: e
    }]), !0);
  }, v.selected = function () {
    return i;
  }, v.providers = function () {
    return o;
  }, v.pickEngines = function () {
    for (var _len = arguments.length, e = new Array(_len), _key = 0; _key < _len; _key++) {
      e[_key] = arguments[_key];
    }
    var r = e[0],
      n = e[1],
      t = e[2],
      i = e[3],
      o = JSON.parse(JSON.stringify(r));
    var s = o.defaultEngines;
    var a = {
      defaultEngine: null,
      providers: {}
    };
    return t in o.partnerConfig && i in o.partnerConfig[t] && (s = o.partnerConfig[t][i]), n.forEach(function (e) {
      e in o.simConfigs && i in o.simConfigs[e] && (s = o.simConfigs[e][i]);
    }), a.defaultEngine = s.defaultEngine, Object.keys(s.providers).sort().forEach(function (e) {
      var r = o.search_providers[e];
      i in o.locales && e in o.locales[i] && (r = p(r, o.locales[i][e])), r = p(r, s.providers[e]), a.providers[e] = {
        title: r.title,
        searchUrl: ClientIdCustomizer.parse(d(r.search)),
        suggestUrl: d(r.suggest)
      };
    }), a;
  }, v.ready = function () {
    return l || (LazyLoader.load(t).then(function () {
      SettingsObserver && SettingsObserver.getValue(n).then(function (e) {
        e && 3 === e.version ? (s = e.defaultEngine, o = e.providers, u()) : LazyLoader.getJSON("http://shared.localhost/js/helper/search_provider/search_providers.json").then(function (e) {
          var r = navigator.b2g.mobileConnections || [],
            r = Array.prototype.slice.call(r).map(function (e) {
              if (e.voice && e.voice.network) return "".concat(Format.padLeft(e.voice.network.mcc, 3, "0"), "-\n            ").concat(Format.padLeft(e.voice.network.mnc, 3, "0"));
            }),
            e = v.pickEngines(e, r, e.partner_code || null, navigator.language);
          s = e.defaultEngine, o = e.providers, SettingsObserver.setValue([{
            name: n,
            value: {
              defaultEngine: s,
              providers: o,
              version: 3
            }
          }]), u();
        });
      });
    }), l = new Promise(function (e) {
      c = e;
    }), l);
  }, e.SearchProvider = v;
}(window);
