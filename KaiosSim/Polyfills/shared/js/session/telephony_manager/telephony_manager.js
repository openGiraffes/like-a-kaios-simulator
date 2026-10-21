var TelephonyManager = {
  _observers: [],
  _observersArray: [],
  _callState: null,
  connected: !1,
  initFlag: !1,
  init: function init() {
    var _this = this;
    this.initFlag || (this.initFlag = !0, window.addEventListener("session-disconnected", function () {
      _this.connected = !1;
    }), window.addEventListener("services-load-complete", function () {
      _this.connected || (_this.connected = !0, _this.processPendingRequest());
    }));
  },
  setCallState: function setCallState(e) {
    this.connected ? (window.api.telephonymanager.callState = e, this._callState = null) : this._callState = e;
  },
  getCallState: function getCallState() {
    return taskScheduler.request({
      serverName: taskScheduler.TELEPHONY,
      funcName: function funcName() {
        return new Promise(function (t, n) {
          window.api.telephonymanager.callState.then(function (e) {
            t(e);
          }, function (e) {
            n(e);
          });
        });
      }
    });
  },
  observeCallStateChange: function observeCallStateChange(e) {
    this.connected && window.api.telephonymanager.addEventListener(window.api.telephonymanager.CALLSTATE_CHANGE_EVENT, e), this._observersArray.push(e);
  },
  unobserveCallStateChange: function unobserveCallStateChange(a) {
    var _this2 = this;
    if (this.connected) {
      window.api.telephonymanager.removeEventListener(window.api.telephonymanager.CALLSTATE_CHANGE_EVENT, a);
      var n = !1;
      this._observersArray.forEach(function (e, t) {
        n || e !== a || (_this2._observersArray.splice(t, 1), n = !0);
      });
    }
  },
  processPendingRequest: function processPendingRequest() {
    var _this3 = this;
    this._callState && this.setCallState(this._callState), this._observersArray.forEach(function (e) {
      _this3.connected && window.api.telephonymanager.addEventListener(window.api.telephonymanager.CALLSTATE_CHANGE_EVENT, e);
    });
  }
};
TelephonyManager.init(), window.TelephonyManager = TelephonyManager;
