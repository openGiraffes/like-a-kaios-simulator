function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, e) { if ("object" != _typeof(t) || !t) return t; var r; if ("undefined" != typeof Symbol && void 0 !== (r = t[Symbol.toPrimitive])) { var i = r.call(t, e || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === e ? String : Number)(t); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == _typeof(e) || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
var AccountManager = {
  _observers: [],
  _observersArray: [],
  initFlag: !1,
  restoreObserves: !1,
  state: {
    LOGGED_IN: 0,
    LOGGED_OUT: 1,
    REFRESHED: 2
  },
  init: function init() {
    var _this = this;
    this.initFlag || (this.initFlag = !0, window.addEventListener("session-disconnected", function () {
      var t = window.api.accountmanager;
      t && _this._observers.forEach(function (e) {
        var _e = e,
          e = _e.authenticatorId;
        t.removeObserver(e, _this.observer);
      }), _this.connected = !1, _this._observers = [], delete _this.observer;
    }), window.addEventListener("services-load-complete", function () {
      _this.createObserver(), _this.processPendingRequest();
    }));
  },
  createObserver: function createObserver() {
    var e = window.api.accountmanager;
    var t = /*#__PURE__*/function (_lib_accounts$Account) {
      "use strict";

      function t(e, _t) {
        _classCallCheck(this, t);
        return _callSuper(this, t, [e.id, _t]);
      }
      _inherits(t, _lib_accounts$Account);
      return _createClass(t, [{
        key: "display",
        value: function display() {
          return "Account observer";
        }
      }, {
        key: "callback",
        value: function callback(a) {
          return AccountManager._observers.forEach(function (e) {
            var _t2, r;
            e.authenticatorId === a.accountType && (r = [_t2 = _objectSpread({}, a), "accountType", "authenticatorId"], AccountManager.replaceObjectKey.apply(AccountManager, _toConsumableArray(r)), e.callback(_t2));
          }), Promise.resolve();
        }
      }]);
    }(lib_accounts.AccountObserverBase);
    this.observer = new t(e, window.api.session);
  },
  addObserver: function addObserver() {
    for (var _len = arguments.length, e = new Array(_len), _key = 0; _key < _len; _key++) {
      e[_key] = arguments[_key];
    }
    return taskScheduler.request({
      serverName: taskScheduler.ACCOUNTS,
      funcName: "addObserver",
      args: e
    });
  },
  removeObserver: function removeObserver() {
    for (var _len2 = arguments.length, e = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      e[_key2] = arguments[_key2];
    }
    return taskScheduler.request({
      serverName: taskScheduler.ACCOUNTS,
      funcName: "removeObserver",
      args: e
    });
  },
  notify: function notify() {
    for (var _len3 = arguments.length, e = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      e[_key3] = arguments[_key3];
    }
    return this.replaceObjectKey(e[0], "authenticatorId", "accountType"), taskScheduler.request({
      serverName: taskScheduler.ACCOUNTS,
      funcName: "notify",
      args: e
    });
  },
  observe: function observe(t, r) {
    try {
      var _this2 = this;
      var e = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : !1;
      return function () {
        var _ref = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(e) {
          var c, a, s, n, _t3, _t4, _t5;
          return _regenerator().w(function (_context) {
            while (1) switch (_context.p = _context.n) {
              case 0:
                if (_this2.observer) {
                  if (!_this2._observers.find(function (e) {
                    return e.authenticatorId === t;
                  })) {
                    c = window.api.accountmanager;
                    c.addObserver(t, _this2.observer);
                  }
                  _this2._observers.push({
                    authenticatorId: t,
                    callback: r
                  });
                }
                if (!(_this2.restoreObserves || _this2._observersArray.push({
                  authenticatorId: t,
                  callbackHandle: r
                }), "kaiaccount" === t && !e)) {
                  _context.n = 7;
                  break;
                }
                _context.n = 1;
                return LazyLoader.load("http://shared.localhost/js/helper/account/crypto_helper.js");
              case 1:
                _context.n = 2;
                return AccountCryptoHelper.getKey();
              case 2:
                _t3 = _context.v;
                _t4 = {
                  action: "getAccounts",
                  publicKey: _t3
                };
                a = {
                  name: "account-manager",
                  data: _t4
                };
                e = !1;
                _context.p = 3;
                _context.n = 4;
                return new WebActivity(a.name, a.data).start();
              case 4:
                s = _context.v;
                _context.n = 5;
                return AccountCryptoHelper.unwrapKey(s);
              case 5:
                n = _context.v;
                e = n.find(function (e) {
                  return e.authenticatorId === t;
                }), r({
                  authenticatorId: t,
                  accountId: e ? e.accountId : "",
                  state: e ? _this2.state.LOGGED_IN : _this2.state.LOGGED_OUT
                });
                _context.n = 7;
                break;
              case 6:
                _context.p = 6;
                _t5 = _context.v;
                r({
                  authenticatorId: t,
                  accountId: "",
                  state: _this2.state.LOGGED_OUT
                });
              case 7:
                return _context.a(2);
            }
          }, _callee, null, [[3, 6]]);
        }));
        return function (_x) {
          return _ref.apply(this, arguments);
        };
      }()(e);
    } catch (e) {
      return Promise.reject(e);
    }
  },
  unobserve: function unobserve(s, c) {
    var _this3 = this;
    var e = window.api.accountmanager;
    if (e) {
      var r = 0,
        a = !1;
      this._observers.forEach(function (e, t) {
        e.authenticatorId === s && (a || e.callback !== c || (_this3._observers.splice(t, 1), a = !0), r++);
      }), 1 === r && e.removeObserver(s, this.observer);
    }
  },
  processPendingRequest: function processPendingRequest() {
    var _this4 = this;
    this.restoreObserves = !0, this._observersArray.forEach(function (e) {
      var _e2 = e,
        t = _e2.authenticatorId,
        e = _e2.callbackHandle;
      _this4.observe(t, e);
    }), this.restoreObserves = !1;
  },
  replaceObjectKey: function replaceObjectKey(e, t, r) {
    delete Object.assign(e, _defineProperty({}, r, e[t]))[t];
  }
};
AccountManager.init(), window.AccountManager = AccountManager;
