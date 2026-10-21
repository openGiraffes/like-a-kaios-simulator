function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
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
var SettingsObserver = {
  _observers: [],
  _observersArray: [],
  _pendingGetValueRequests: {},
  initiated: !1,
  restoreObserves: !1,
  init: function init() {
    var _this = this;
    this.initiated || (this.initiated = !0, window.addEventListener("session-disconnected", function () {
      var s = window.api.settingsmanager;
      s && _this._observers.forEach(function (e) {
        s.removeObserver(e.name, _this.observer);
      }), _this._observers = [], delete _this.observer;
    }), window.addEventListener("services-load-observer", function () {
      _this.createObserver(), _this.processPendingRequest();
    }), window.addEventListener("services-load-complete", function () {
      _this.convertToGetBatch();
    }));
  },
  createObserver: function createObserver() {
    var e = /*#__PURE__*/function (_lib_settings$Setting) {
      "use strict";

      function e(_e, s) {
        _classCallCheck(this, e);
        return _callSuper(this, e, [_e.id, s]);
      }
      _inherits(e, _lib_settings$Setting);
      return _createClass(e, [{
        key: "display",
        value: function display() {
          return "Setting observer";
        }
      }, {
        key: "callback",
        value: function callback(s) {
          return SettingsObserver._observers.forEach(function (_e2) {
            _e2.name === s.name && _e2.callback(s.value, s.name);
          }), Promise.resolve();
        }
      }]);
    }(lib_settings.SettingObserverBase);
    var s = window.api.settingsmanager;
    this.observer = new e(s, window.api.session);
  },
  processPendingRequest: function processPendingRequest() {
    var _this2 = this;
    this.restoreObserves = !0, this._observersArray.forEach(function (e) {
      var s = e.name,
        t = e.defaultValue,
        r = e.callbackHandle,
        n = e.observeOnly;
      _this2.observe(s, t, r, n), n || (e.observeOnly = !0);
    }), this.restoreObserves = !1;
  },
  pendingProcessGetValue: function pendingProcessGetValue(e, s) {
    this._pendingGetValueRequests[e] || (this._pendingGetValueRequests[e] = []), this._pendingGetValueRequests[e].push(s);
  },
  convertToGetBatch: function convertToGetBatch() {
    var _this3 = this;
    var e = [];
    for (var s in this._pendingGetValueRequests) e.push(s);
    e.length ? this.getBatch(e).then(function (e) {
      e.forEach(function (e) {
        var s = e.name,
          t = e.value,
          r = _this3._pendingGetValueRequests[s];
        r && (r.forEach(function (e) {
          e(t);
        }), delete _this3._pendingGetValueRequests.name);
      });
      for (var _s in _this3._pendingGetValueRequests) {
        var t = _this3._pendingGetValueRequests[_s];
        t && (t.forEach(function (e) {
          e(void 0);
        }), delete _this3._pendingGetValueRequests.name);
      }
      _this3._pendingGetValueRequests = {};
    }) : this._pendingGetValueRequests = {};
  },
  getValue: function getValue() {
    var _this4 = this;
    for (var _len = arguments.length, e = new Array(_len), _key = 0; _key < _len; _key++) {
      e[_key] = arguments[_key];
    }
    return new Promise(function (s) {
      taskScheduler.connected ? taskScheduler.request({
        serverName: taskScheduler.SETTINGS,
        funcName: "get",
        args: e
      }).then(function (e) {
        var _e3 = e,
          e = _e3.value;
        s(e);
      }, function () {
        s(void 0);
      }) : _this4.pendingProcessGetValue(e[0], s);
    });
  },
  getBatch: function getBatch() {
    for (var _len2 = arguments.length, e = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      e[_key2] = arguments[_key2];
    }
    return new Promise(function (s, t) {
      taskScheduler.request({
        serverName: taskScheduler.SETTINGS,
        funcName: "getBatch",
        args: e
      }).then(function (e) {
        s(e);
      }, function (e) {
        t(e);
      });
    });
  },
  setValue: function setValue() {
    for (var _len3 = arguments.length, e = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      e[_key3] = arguments[_key3];
    }
    return taskScheduler.request({
      serverName: taskScheduler.SETTINGS,
      funcName: "set",
      args: e
    });
  },
  observe: function observe(t, r, n, e) {
    if (this.observer) {
      if (e || this.getValue(t).then(function (e) {
        n(void 0 === e ? r : e, t);
      }, function () {
        n(r, t);
      }), !SettingsObserver._observers.find(function (e) {
        return e.name === t;
      })) {
        var i = window.api.settingsmanager;
        i.addObserver(t, this.observer);
      }
      var s = !1;
      for (var _e4 = 0; _e4 < this._observers.length; _e4++) if (this._observers[_e4].name === t && this._observers[_e4].callback === n) {
        s = !0;
        break;
      }
      s || this._observers.push({
        name: t,
        callback: n
      });
    }
    this.restoreObserves || this._observersArray.push({
      name: t,
      defaultValue: r,
      callbackHandle: n,
      observeOnly: e
    });
  },
  unobserve: function unobserve(s, t) {
    var e = window.api.settingsmanager;
    if (e) {
      for (var _e5 = 0; _e5 < this._observers.length; _e5++) if (this._observers[_e5].name === s && this._observers[_e5].callback === t) {
        this._observers.splice(_e5, 1);
        break;
      }
      SettingsObserver._observers.find(function (e) {
        return e.name === s;
      }) || e.removeObserver(s, this.observer);
    }
  }
};
SettingsObserver.init(), window.SettingsObserver = SettingsObserver;
