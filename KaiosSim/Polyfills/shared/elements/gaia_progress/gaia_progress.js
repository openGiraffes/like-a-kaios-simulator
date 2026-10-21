function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, e) { if ("object" != _typeof(t) || !t) return t; var r; if ("undefined" != typeof Symbol && void 0 !== (r = t[Symbol.toPrimitive])) { var i = r.call(t, e || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === e ? String : Number)(t); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == _typeof(e) || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _wrapNativeSuper(t) { var r = "function" == typeof Map ? new Map() : void 0; return _wrapNativeSuper = function _wrapNativeSuper(t) { if (null === t || !_isNativeFunction(t)) return t; if ("function" != typeof t) throw new TypeError("Super expression must either be null or a function"); if (void 0 !== r) { if (r.has(t)) return r.get(t); r.set(t, Wrapper); } function Wrapper() { return _construct(t, arguments, _getPrototypeOf(this).constructor); } return Wrapper.prototype = Object.create(t.prototype, { constructor: { value: Wrapper, enumerable: !1, writable: !0, configurable: !0 } }), _setPrototypeOf(Wrapper, t); }, _wrapNativeSuper(t); }
function _construct(t, e, r) { if (_isNativeReflectConstruct()) return Reflect.construct.apply(null, arguments); var o = [null]; o.push.apply(o, e); var p = new (t.bind.apply(t, o))(); return r && _setPrototypeOf(p, r.prototype), p; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _isNativeFunction(t) { try { return -1 !== Function.toString.call(t).indexOf("[native code]"); } catch (n) { return "function" == typeof t; } }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
var GaiaProgress = /*#__PURE__*/function (_HTMLElement) {
  "use strict";

  function GaiaProgress() {
    var _this;
    _classCallCheck(this, GaiaProgress);
    _this = _callSuper(this, GaiaProgress);
    var e = _this.attachShadow({
      mode: "open"
    });
    e.innerHTML = "\n    <div class=\"inner\">\n      <div class=\"bar\"></div>\n    </div>\n    <style>\n      :host {\n        display: block;\n        overflow: hidden;\n        height: 0.6rem;\n        border-radius: 0.3rem;\n        width: 100%;\n      }\n      .inner {\n        height: 100%;\n        background: var(--color-gs45, #aaa)\n      }\n      .bar {\n        position: relative;\n        top: 0;\n        left: -100%;\n        width: 100%;\n        height: 100%;\n        background: var(--highlight-color);\n        transition: transform 0ms linear;\n      }\n      .bar:after {\n        position: absolute;\n        left: 100%;\n        display: block;\n        content: '';\n        width: 0;\n        height: 0;\n        border-top: 0.6rem solid var(--color-gs00, #fff);\n        border-left: 0.3rem solid var(--color-gs00, #fff);\n      }\n      .focus.bar {\n        background-color: var(--color-gs00);\n      }\n      .focus.bar::after {\n        border-top: 0.6rem solid var(--highlight-color);\n        border-left: 0.3rem solid var(--highlight-color);\n      }\n      .bar:before {\n        position: absolute;\n        left: -0.3rem;\n        display: block;\n        content: '';\n        width: 0;\n        height: 0;\n        border-top: 0.6rem solid var(--color-gs00, #fff);\n        border-left: 0.3rem solid var(--color-gs00, #fff);\n      }\n      .no-value .bar {\n        left: 0;\n        width: 100%;\n      }\n      .no-value.increasing  .bar {\n        animation: moving-in 1520ms cubic-bezier(0.3, 0, 0.4, 1);\n      }\n      .no-value.decreasing  .bar {\n        animation: moving-out 1520ms cubic-bezier(0.6, 0, 0.3, 1);\n      }\n      :dir(rtl) {\n        transform: rotateY(180deg);\n      }\n\n      @keyframes moving-in {\n        0% { transform: translateX(-100%); }\n        100% { transform: translateX(0%); }\n      }\n\n      @keyframes moving-out {\n        0% { transform: translateX(0%); }\n        100% { transform: translateX(100%); }\n      }\n    </style>\n  ";
    return _this;
  }
  _inherits(GaiaProgress, _HTMLElement);
  return _createClass(GaiaProgress, [{
    key: "connectedCallback",
    value: function connectedCallback() {
      var _this2 = this;
      this.els = {
        inner: this.shadowRoot.querySelector(".inner"),
        bar: this.shadowRoot.querySelector(".bar")
      }, this.els.inner.setAttribute("role", "progressbar"), this.els.inner.setAttribute("aria-valuemin", "0"), this.els.inner.setAttribute("aria-valuemax", "100"), this.els.bar.classList.toggle("focus", "true" === this.getAttribute("selected")), this.value = this.getAttribute("value") || 0, this.handleAnimationEnd = function () {
        var e = _this2.els.inner.classList;
        e.contains("no-value") && (e.contains("increasing") ? (e.remove("increasing"), e.add("decreasing")) : (e.remove("decreasing"), e.add("increasing")));
      }, this.els.inner.addEventListener("animationend", this.handleAnimationEnd);
    }
  }, {
    key: "disconnectedCallback",
    value: function disconnectedCallback() {
      this.els.inner.removeEventListener("animationend", this.handleAnimationEnd);
    }
  }, {
    key: "value",
    get: function get() {
      return this._value || 0;
    },
    set: function set(e) {
      var t;
      (e = Math.min(100, Math.max(0, Number(e)))) ? (t = Math.abs(this.value - e) / 100 * 2e3, this.els.bar.style.transform = "translateX(".concat(e, "%)"), this.els.bar.style.transitionDuration = "".concat(t, "ms"), this.els.inner.setAttribute("aria-valuenow", e)) : this.els.inner.removeAttribute("aria-valuenow"), this.els.inner.classList.toggle("no-value", !e), this.els.inner.classList.toggle("increasing", !e), this._value = e;
    }
  }, {
    key: "selected",
    get: function get() {
      return this._selected || 0;
    },
    set: function set(e) {
      this.els.bar.classList.toggle("focus", "true" === e), this._selected = e;
    }
  }]);
}(/*#__PURE__*/_wrapNativeSuper(HTMLElement));
customElements.define("gaia-progress", GaiaProgress);
