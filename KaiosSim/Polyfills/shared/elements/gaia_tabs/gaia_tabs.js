function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t.return || t.return(); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
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
var GaiaTabs = /*#__PURE__*/function (_HTMLElement) {
  "use strict";

  function GaiaTabs() {
    var _this;
    _classCallCheck(this, GaiaTabs);
    _this = _callSuper(this, GaiaTabs);
    var t = _this.attachShadow({
      mode: "open"
    });
    t.innerHTML = "\n      <style>\n        :host {\n          display: flex;\n          position: relative;\n          bottom: 0;\n          width: 100%;\n          margin: 0;\n          padding: 0;\n          z-index: 0;\n          background: var(--color-gs00);\n        }\n        :host([position=\"top\"]) {\n          top: 0;\n          bottom: auto;\n          height: 3rem;\n        }\n        :host([skin=\"dark\"]) {\n          border-color: rgba(189,189,189, 0.1);\n        }\n        ::slotted(*) {\n          box-sizing: content-box;\n          position: relative;\n          margin: 0;\n          padding: 0 0.5rem 0 1rem;\n          height: 3rem;\n          border: 0;\n          flex: 1 1 0;\n          line-height: 3rem;\n          text-align: center;\n          font-family: sans-serif;\n          text-decoration: none;\n          color: var(--color-gs45);\n          background-color: transparent;\n          cursor: pointer;\n          list-style: none;\n          white-space: nowrap;\n        }\n        ::slotted(a),\n        ::slotted(div),\n        ::slotted(button) {\n          background-repeat: no-repeat;\n          background-position: top center;\n        }\n        ::slotted(a) {\n          text-decoration: none;\n          display: block;\n        }\n        ::slotted([position=\"top\"] > *) {\n          height: 3rem;\n        }\n        :host([skin=\"dark\"]) ::slotted(*) {\n          background-color: #000;\n          color: #fff;\n        }\n        ::slotted(*):active {\n          border-radius: 0;\n          background-color: #b2f2ff;\n        }\n        ::slotted(.selected) {\n          color: var(--color-gs90);\n          font-weight: 700;\n        }\n        :host([skin=\"dark\"]) ::slotted(.selected) {\n          color: #00aacc;\n        }\n        ::slotted([disabled]) {\n          color: #333;\n          opacity: 0.25;\n          pointer-events: none;\n        }\n        :host([skin=\"dark\"]) ::slotted([disabled]) {\n          color: rgba(255,255,255,0.4);\n          opacity: 1;\n        }\n        :host ::slotted(.selected):after {\n          content: \"\";\n          position: absolute;\n          left: 0;\n          bottom: 0;\n          width: 100%;\n          border-bottom: 0.3rem solid #00aacc;\n        }\n      </style>\n      <slot id=\"tabsSlot\" name=\"tab\"></slot>\n    ";
    return _this;
  }
  _inherits(GaiaTabs, _HTMLElement);
  return _createClass(GaiaTabs, [{
    key: "connectedCallback",
    value: function connectedCallback() {
      var _this2 = this;
      this.setAttribute("role", "tablist");
      var t = this.shadowRoot.querySelector("slot");
      t.addEventListener("slotchange", function (t) {
        _this2.tabs = t.target.assignedElements({
          flatten: !0
        });
        var _iterator = _createForOfIteratorHelper(_this2.tabs.entries()),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var _step$value = _slicedToArray(_step.value, 2),
              e = _step$value[1];
            e.setAttribute("role", "tab");
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      }), this.addEventListener("click", this.onClick), setTimeout(function () {
        _this2.select(_this2.getAttribute("selected"));
      }), window.addEventListener("largetextenabledchanged", function () {
        setTimeout(function () {
          _this2._updateIndicator(_this2.selected || 0);
        });
      });
    }
  }, {
    key: "attributeChangedCallback",
    value: function attributeChangedCallback(t, e, s) {
      "selected" === t && this.select(s);
    }
  }, {
    key: "onClick",
    value: function onClick(t) {
      var e = t.target;
      var s;
      var o = [].indexOf;
      for (; e;) {
        if (-1 < (s = o.call(this.children, e))) return this.select(s);
        e = e.parentNode;
      }
    }
  }, {
    key: "select",
    value: function select(t) {
      if (null !== t) {
        t = Number(t);
        var s = this.children[t];
        this.deselect(this.selected), this.selected = t, s.classList.add("selected");
        var e = new CustomEvent("change");
        setTimeout(this.dispatchEvent.bind(this, e)), this._updateIndicator(t);
      }
    }
  }, {
    key: "addItem",
    value: function addItem(t, e) {
      var s = this.children.length;
      (e = e || s - 1) < 0 || s - 1 < e || !t || this.insertBefore(t, this.children[e]);
    }
  }, {
    key: "removeItem",
    value: function removeItem(t) {
      t = document.getElementById(t);
      t && this.removeChild(t);
    }
  }, {
    key: "_updateIndicator",
    value: function _updateIndicator(t) {
      var e = "rtl" === document.documentElement.dir;
      var s = 0;
      var o = this.children,
        i = this.offsetWidth,
        a = o[t].offsetLeft,
        n = o[t].offsetWidth,
        r = i - (a + n),
        l = o[o.length - 1].offsetLeft,
        d = i - (l + o[o.length - 1].offsetWidth);
      if (0 === t) s = 0;else if (t === o.length - 1) s = e ? Math.abs(l) : 0 < d ? 0 : d;else {
        o = (a + r) / 2;
        var _t = o - a;
        e ? i < (n = r + n) && (s = n < d ? (_t = Math.abs(o) - a, Math.abs(_t)) : Math.abs(l)) : 0 < _t || 0 < d ? s = 0 : _t < 0 && _t > d ? s = _t : _t < 0 && _t < d && (s = d);
      }
      this.style.transform = "translateX(".concat(s, "px)");
    }
  }, {
    key: "deselect",
    value: function deselect(t) {
      var e = this.children[t];
      e && (e.classList.remove("selected"), this.current === e && (this.selected = null));
    }
  }]);
}(/*#__PURE__*/_wrapNativeSuper(HTMLElement));
customElements.define("gaia-tabs", GaiaTabs);
