function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
!function (e) {
  e.LanguageList = {
    _languages: null,
    _readFile: function _readFile(s) {
      return new Promise(function (e, t) {
        var n = new XMLHttpRequest();
        n.onreadystatechange = function () {
          4 === n.readyState && (0 === n.status || 200 === n.status ? e(n.response) : t(n.statusText));
        }, n.open("GET", s, !0), n.responseType = "json", n.send();
      });
    },
    _readSetting: function _readSetting(e) {
      return SettingsObserver.getValue(e);
    },
    rtlList: ["ar", "he", "fa", "ps", "qps-plocm", "ur", "ks-IN", "ur-IN"],
    getRtlList: function getRtlList() {
      return this.rtlList;
    },
    _extendPseudo: function _extendPseudo(e, t, n) {
      if (!window.api.l10n) return e;
      for (var s in window.api.l10n.qps) (s === t || n) && (e[s] = window.api.l10n.qps[s].name);
      return e;
    },
    _build: function _build() {
      var _this = this;
      return Promise.all([this._languages || (this._languages = this._readFile("http://shared.localhost/resources/languages.json")), this._readSetting("language.current"), this._readSetting("devtools.qps.enabled"), this._readSetting("config.language.list")]).then(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 4),
          e = _ref2[0],
          t = _ref2[1],
          n = _ref2[2],
          s = _ref2[3];
        var r = null,
          i = null;
        return s && (r = Object.keys(s)), i = r && 0 < r.length ? (s = _this.filterLanguageList(s, e, r), Object.create(s)) : Object.create(e), _this._extendPseudo(i, t, n), [i, t];
      });
    },
    filterLanguageList: function filterLanguageList(t, n, s) {
      for (var _e = 0; _e < s.length; _e++) Object.prototype.hasOwnProperty.call(n, s[_e]) || delete t[s[_e]];
      return t;
    },
    get: function get(e) {
      e && this._build().then(Function.prototype.apply.bind(e, null));
    },
    wrapBidi: function wrapBidi(e, t) {
      return (0 <= this.rtlList.indexOf(e) ? "‫" : "‪") + t + "‬";
    }
  };
}(window);
