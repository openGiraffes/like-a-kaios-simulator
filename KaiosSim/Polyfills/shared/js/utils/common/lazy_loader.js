function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
var LazyLoader = function () {
  function e() {
    this._loaded = {}, this._isLoading = {};
  }
  return e.prototype = {
    _errorCallback: function _errorCallback() {
      var e = this.src;
      e.startsWith("http://127.0.0.1/api/v1/") && window.setTimeout(function () {
        window.location.reload();
      });
    },
    _js: function _js(e, t) {
      var o = document.createElement("script");
      o.src = e, o.async = !1, o.callback = t, o.errorCallback = this._errorCallback.bind(o), o.addEventListener("load", function () {
        o.removeEventListener("error", o.errorCallback, {
          once: !0
        }), t();
      }, {
        once: !0
      }), o.addEventListener("error", o.errorCallback, {
        once: !0
      }), document.head.appendChild(o), this._isLoading[e] = o;
    },
    _css: function _css(e, t) {
      var o = document.createElement("link");
      o.type = "text/css", o.rel = "stylesheet", o.href = e, document.head.appendChild(o), t();
    },
    _html: function _html(t, e) {
      if (t.getAttribute("is")) this.load(["/shared/js/html_imports.js"], function () {
        HtmlImports.populate(e);
      });else {
        for (var _e = 0; _e < t.childNodes.length; _e++) if (t.childNodes[_e].nodeType === document.COMMENT_NODE) {
          t.innerHTML = t.childNodes[_e].nodeValue;
          break;
        }
        window.dispatchEvent(new CustomEvent("lazyload", {
          detail: t
        })), e();
      }
    },
    getJSON: function getJSON(n, s) {
      return new Promise(function (e, t) {
        var o = {};
        o = s ? new XMLHttpRequest({
          mozSystem: !0
        }) : new XMLHttpRequest(), o.open("GET", n, !0), o.responseType = "json", o.onerror = function (e) {
          t(e);
        }, o.onload = function () {
          null !== o.response ? e(o.response) : t(new Error("No valid JSON object was found (".concat(o.status, " ").concat(o.statusText, ")")));
        }, o.send();
      });
    },
    load: function load(t, o) {
      var n = {};
      n.promise = new Promise(function (e) {
        n.resolve = e;
      });
      var s = (t = !Array.isArray(t) ? [t] : t).length;
      var r = this;
      function i(e, t) {
        t && window.setTimeout(function () {
          r._isLoading[e] && delete r._isLoading[e];
        }, 100), r._loaded[e] = !0, 0 == --s && (n.resolve(), o && o());
      }
      for (var _e2 = 0; _e2 < t.length; _e2++) {
        var d = t[_e2];
        if (this._loaded[d.id || d]) i(d);else if (this._isLoading[d]) this._isLoading[d].addEventListener("load", i.bind(null, d, !0), {
          once: !0
        });else {
          var _d$match, _d$match2;
          var _e3 = "",
            _t = "";
          _e3 = "string" == typeof d ? (_d$match = d.match(/\.([^.]+)$/), _d$match2 = _slicedToArray(_d$match, 2), _t = _d$match2[1], d) : (_t = "html", d.id), this["_".concat(_t)](d, i.bind(null, _e3, !1));
        }
      }
      return n.promise;
    }
  }, new e();
}();
window.LazyLoader = LazyLoader;
