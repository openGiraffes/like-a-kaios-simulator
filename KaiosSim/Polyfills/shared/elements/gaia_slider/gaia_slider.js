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
var GaiaSlider = /*#__PURE__*/function (_HTMLElement) {
  "use strict";

  function GaiaSlider() {
    var _this;
    _classCallCheck(this, GaiaSlider);
    _this = _callSuper(this, GaiaSlider);
    var t = _this.attachShadow({
      mode: "open"
    });
    t.innerHTML = "\n      <div class=\"inner\">\n        <input type=\"range\" orient=\"vertical\"/>\n      </div>\n      <style>\n        ::-moz-focus-outer { border: 0; }\n        div.inner {\n          height: 100%;\n        }\n        :host {\n          display: block;\n          height: 100%;\n        }\n        input {\n          width: 100%;\n          height: 100%;\n          margin: 0;\n          padding: 0;\n          background: none;\n          border: 0;\n        }\n        ::-moz-range-progress {\n          background: var(--highlight-color);\n          width: 1.2rem;\n          border-radius: 0 0 0.6rem 0.6rem;\n        }\n        .transparent::-moz-range-progress {\n          opacity: 1;\n          width: 0.6rem;\n          background: var(--color-gs00);\n        }\n        .no-border-radius::-moz-range-progress {\n          background: var(--highlight-color);\n          width: 1.2rem;\n          border-radius: 0;\n        }\n        input.max::-moz-range-progress {\n          border-radius: 0.6rem;\n        }\n        input.max.no-border-radius::-moz-range-progress {\n          border-radius: 0;\n        }\n        ::-moz-range-track {\n          width: 1.2rem;\n          height: 100%;\n          border-radius: 0.6rem;\n          background: var(--color-gs45);\n        }\n        .transparent::-moz-range-track {\n          opacity: 0.5;\n          width: 0.6rem;\n          box-shadow: 0px 0px 3px 0px rgba(0,0,0,0.5);\n          background: var(--color-gs00);\n        }\n        .no-border-radius::-moz-range-track {\n          width: 1.2rem;\n          height: 100%;\n          background: var(--color-gs45);\n          border-radius: 0;\n        }\n        ::-moz-range-thumb {\n          width: 1.2rem;\n          height: 0.3rem;\n          background: var(--input-background);\n          border: none;\n          border-radius: 0;\n          position: relative;\n          z-index: 100;\n          left: 50%;\n          transition: all 0.2s;\n        }\n        .transparent::-moz-range-thumb {\n          width: 0.6rem;\n        }\n        input.min::-moz-range-thumb,\n        input.max::-moz-range-thumb {\n          opacity: 0;\n        }\n      </style>\n    ";
    return _this;
  }
  _inherits(GaiaSlider, _HTMLElement);
  return _createClass(GaiaSlider, [{
    key: "connectedCallback",
    value: function connectedCallback() {
      this.els = {
        input: this.shadowRoot.querySelector("input")
      }, this.els.input.addEventListener("input", this._onInput.bind(this)), this.els.input.addEventListener("change", this._onChange.bind(this)), this.noborder = this.getAttribute("data-no-border") || "false";
      var t = this.getAttribute("transparent");
      t && this.els.input.classList.toggle("transparent", "true" === t);
    }
  }, {
    key: "setRange",
    value: function setRange(t, e) {
      this.min = t, this.max = e, this.els.input.min = t, this.els.input.max = e;
    }
  }, {
    key: "_onInput",
    value: function _onInput() {
      this.dispatchEvent(new CustomEvent("input"));
    }
  }, {
    key: "_onChange",
    value: function _onChange() {
      this.dispatchEvent(new CustomEvent("change"));
    }
  }, {
    key: "value",
    get: function get() {
      return this._value || 0;
    },
    set: function set(t) {
      var e = this.els.input.min || 0,
        r = this.els.input.max || 100;
      e <= t && t <= r && (this.els.input.value = t), this._value = parseInt(this.els.input.value, 10), this.els.input.classList.toggle("min", this._value == e), this.els.input.classList.toggle("max", this._value == r);
    }
  }, {
    key: "noborder",
    get: function get() {
      return this._noborder || "false";
    },
    set: function set(t) {
      this.els.input.classList.toggle("no-border-radius", "true" === t), this._noborder = t;
    }
  }]);
}(/*#__PURE__*/_wrapNativeSuper(HTMLElement));
customElements.define("gaia-slider", GaiaSlider);
