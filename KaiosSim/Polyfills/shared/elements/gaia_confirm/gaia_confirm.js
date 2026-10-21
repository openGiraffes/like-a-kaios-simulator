function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, e) { if ("object" != _typeof(t) || !t) return t; var r; if ("undefined" != typeof Symbol && void 0 !== (r = t[Symbol.toPrimitive])) { var i = r.call(t, e || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === e ? String : Number)(t); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
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
var GaiaConfirm = /*#__PURE__*/function (_HTMLElement) {
  "use strict";

  function GaiaConfirm() {
    var _this;
    _classCallCheck(this, GaiaConfirm);
    _this = _callSuper(this, GaiaConfirm);
    var t = _this.attachShadow({
      mode: "open"
    });
    t.innerHTML = "\n      <div class=\"container\">\n        <form role=\"dialog\" class=\"confirm\">\n          <section>\n            <slot name=\"title\"></slot>\n            <slot name=\"content\"></slot>\n          </section>\n        </form>\n      </div>\n\n      <style>\n        :host {\n          background-color: rgba(0, 0, 0, 0.8);\n          overflow: auto;\n          position: absolute;\n          height: calc(100% - var(--softkeybar-height));\n          top: 0;\n          left: 0;\n          right: 0;\n          bottom: 0;\n          padding-bottom: 0;\n          display: flex;\n          align-items: stretch;\n          flex-direction: column;\n          transition: transform ease-in-out 0.3s, visibility 0.3s;\n          z-index: 1023;\n        }\n        div.container {\n          height: 100%;\n          display: flex;\n          align-items: flex-end;\n        }\n        .container .confirm {\n          width: 100%;\n        }\n        :host(.insystem) {\n          margin-top: 3rem;\n        }\n        html[dir=\"ltr\"] :host {\n          text-align: left;\n        }\n        html[dir=\"rtl\"] :host {\n          text-align: right;\n        }\n        :host([hidden]) {\n          transform: translateY(100%);\n          visibility: hidden;\n          pointer-events: none;\n        }\n        :host button {\n          width: 50%;\n          border-radius: 0;\n        }\n        :host button.blank {\n          visibility: hidden;\n        }\n        ::slotted(.content) {\n          overflow-y: auto;\n        }\n        ::slotted(h1) {\n          font-weight: 300;\n          margin: 0;\n          padding: 0.5rem 1rem;\n          word-wrap: break-word;\n          color: var(--color-gs90);\n          background-color: var(--color-gs20);\n        }\n        ::slotted(p) {\n          font-weight: normal;\n          word-wrap: break-word;\n          margin: 0;\n          padding: 1rem;\n          line-height: 2.4rem;\n          color: var(--color-gs90);\n          background: var(--color-gs10);\n        }\n\n        p.noborder {\n          border: none;\n        }\n      </style>\n    ";
    return _this;
  }
  _inherits(GaiaConfirm, _HTMLElement);
  return _createClass(GaiaConfirm);
}(/*#__PURE__*/_wrapNativeSuper(HTMLElement));
customElements.define("gaia-confirm", GaiaConfirm);
