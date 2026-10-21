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
var TimeService = {
  eventList: ["timeChange", "timeZoneChange"],
  timeObservers: [],
  restoreObserves: !1,
  init: function init() {
    var _this = this;
    window.addEventListener("session-disconnected", function () {
      var e = window.api.timeservice;
      e && (e.removeObserver(lib_time.CallbackReason.TIME_CHANGED, _this.observer), e.removeObserver(lib_time.CallbackReason.TIMEZONE_CHANGED, _this.observer)), delete _this.observer;
    }), window.addEventListener("services-load-observer", function () {
      _this.createObserver(), _this.processPendingRequest();
    });
  },
  createObserver: function createObserver() {
    var e = /*#__PURE__*/function (_lib_time$TimeObserve) {
      "use strict";

      function e(_e, r) {
        _classCallCheck(this, e);
        return _callSuper(this, e, [_e.id, r]);
      }
      _inherits(e, _lib_time$TimeObserve);
      return _createClass(e, [{
        key: "display",
        value: function display() {
          return "Time observer";
        }
      }, {
        key: "callback",
        value: function callback() {
          return TimeService.timeObservers.forEach(function (_e2) {
            _e2();
          }), Promise.resolve();
        }
      }]);
    }(lib_time.TimeObserverBase);
    var r = window.api.timeservice;
    this.observer = new e(r, window.api.session);
  },
  processPendingRequest: function processPendingRequest() {
    if (this.restoreObserves = !0, 0 < TimeService.timeObservers.length) {
      var e = window.api.timeservice;
      e.addObserver(lib_time.CallbackReason.TIME_CHANGED, this.observer), e.addObserver(lib_time.CallbackReason.TIMEZONE_CHANGED, this.observer);
    }
    this.restoreObserves = !1;
  },
  set: function set() {
    for (var _len = arguments.length, e = new Array(_len), _key = 0; _key < _len; _key++) {
      e[_key] = arguments[_key];
    }
    return taskScheduler.request({
      serverName: taskScheduler.TIME_SERVICE,
      funcName: "set",
      args: e
    });
  },
  get: function get() {
    return taskScheduler.request({
      serverName: taskScheduler.TIME_SERVICE,
      funcName: "get"
    });
  },
  addEventListener: function addEventListener(e, r) {
    if (e === TimeService.eventList[0]) if (0 < TimeService.timeObservers.length) TimeService.timeObservers.push(r);else {
      var s = window.api.timeservice;
      s && (s.addObserver(lib_time.CallbackReason.TIME_CHANGED, this.observer), s.addObserver(lib_time.CallbackReason.TIMEZONE_CHANGED, this.observer)), TimeService.timeObservers.push(r);
    }
  },
  removeEventListener: function removeEventListener(e, s) {
    if (e === TimeService.eventList[0]) if (1 < TimeService.timeObservers.length) TimeService.timeObservers.forEach(function (e, r) {
      e === s && TimeService.timeObservers.splice(r, 1);
    });else if (s === TimeService.timeObservers[0]) {
      TimeService.timeObservers.splice(0, 1);
      var r = window.api.timeservice;
      r.removeObserver(lib_time.CallbackReason.TIME_CHANGED, this.observer), r.removeObserver(lib_time.CallbackReason.TIMEZONE_CHANGED, this.observer);
    }
  }
};
TimeService.init(), window.TimeService = TimeService;
