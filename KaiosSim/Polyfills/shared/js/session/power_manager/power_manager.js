var PowerManager = {
  _powerOff: !1,
  _reboot: !1,
  _factoryReset: void 0,
  _screenEnabled: void 0,
  _extScreenEnabled: void 0,
  _keyLightEnabled: void 0,
  _screenBrightness: void 0,
  _extScreenBrightness: void 0,
  _keyLightBrightness: void 0,
  _cpuSleepAllowed: void 0,
  connected: !1,
  initFlag: !1,
  _extScreenEnabledState: !1,
  init: function init() {
    var _this = this;
    this.initFlag || (this.initFlag = !0, window.addEventListener("session-disconnected", function () {
      _this.connected = !1;
    }), window.addEventListener("services-load-complete", function () {
      _this.connected || (_this.connected = !0, _this.processPendingRequest());
    }));
  },
  getExtScreenState: function getExtScreenState() {
    return this._extScreenEnabledState;
  },
  powerOff: function powerOff() {
    this.connected ? (this._powerOff = !1, window.api.powermanager.powerOff()) : this._powerOff = !0;
  },
  reboot: function reboot() {
    this.connected ? (this._reboot = !1, window.api.powermanager.reboot()) : this._reboot = !0;
  },
  setFactoryReset: function setFactoryReset(e) {
    this.connected ? (window.api.powermanager.factoryReset = e, this._factoryReset = void 0) : this._factoryReset = e;
  },
  setScreenEnabled: function setScreenEnabled(e) {
    this.connected ? (dump("powerManager setScreenEnabled enable: " + e), window.api.powermanager.screenEnabled = e, this._screenEnabled = void 0) : this._screenEnabled = e;
  },
  setExtScreenEnabled: function setExtScreenEnabled(e) {
    this.connected ? (dump("powerManager setExtScreenEnabled enable: " + e), window.api.powermanager.extScreenEnabled = e, this._extScreenEnabled = void 0) : this._extScreenEnabled = e, this._extScreenEnabledState = e;
  },
  setKeyLightEnabled: function setKeyLightEnabled(e) {
    this.connected ? (window.api.powermanager.keyLightEnabled = e, this._keyLightEnabled = void 0) : this._keyLightEnabled = e;
  },
  setScreenBrightness: function setScreenBrightness(e) {
    this.connected ? (dump("powerManager setScreenBrightness bright: " + e), window.api.powermanager.screenBrightness = e, this._screenBrightness = void 0) : this._screenBrightness = e;
  },
  setExtScreenBrightness: function setExtScreenBrightness(e) {
    this.connected ? (dump("powerManager setExtScreenBrightness bright: " + e), window.api.powermanager.extScreenBrightness = e, this._extScreenBrightness = void 0) : this._extScreenBrightness = e;
  },
  setKeyLightBrightness: function setKeyLightBrightness(e) {
    this.connected ? (window.api.powermanager.keyLightBrightness = e, this._keyLightBrightness = void 0) : this._keyLightBrightness = e;
  },
  setCpuSleepAllowed: function setCpuSleepAllowed(e) {
    this.connected ? (window.api.powermanager.cpuSleepAllowed = e, this._cpuSleepAllowed = void 0) : this._cpuSleepAllowed = e;
  },
  getFactoryResetReason: function getFactoryResetReason() {
    return taskScheduler.request({
      serverName: taskScheduler.POWER,
      funcName: function funcName() {
        return new Promise(function (t, n) {
          window.api.powermanager.factoryReset.then(function (e) {
            t(e);
          }, function (e) {
            n(e);
          });
        });
      }
    });
  },
  getScreenEnabled: function getScreenEnabled() {
    return taskScheduler.request({
      serverName: taskScheduler.POWER,
      funcName: function funcName() {
        return new Promise(function (t, n) {
          window.api.powermanager.screenEnabled.then(function (e) {
            t(e);
          }, function (e) {
            n(e);
          });
        });
      }
    });
  },
  getExtScreenEnabled: function getExtScreenEnabled() {
    return taskScheduler.request({
      serverName: taskScheduler.POWER,
      funcName: function funcName() {
        return new Promise(function (t, n) {
          window.api.powermanager.extScreenEnabled.then(function (e) {
            t(e);
          }, function (e) {
            n(e);
          });
        });
      }
    });
  },
  getKeyLightEnabled: function getKeyLightEnabled() {
    return taskScheduler.request({
      serverName: taskScheduler.POWER,
      funcName: function funcName() {
        return new Promise(function (t, n) {
          window.api.powermanager.keyLightEnabled.then(function (e) {
            t(e);
          }, function (e) {
            n(e);
          });
        });
      }
    });
  },
  getScreenBrightness: function getScreenBrightness() {
    return taskScheduler.request({
      serverName: taskScheduler.POWER,
      funcName: function funcName() {
        return new Promise(function (t, n) {
          window.api.powermanager.screenBrightness.then(function (e) {
            t(e);
          }, function (e) {
            n(e);
          });
        });
      }
    });
  },
  getExtScreenBrightness: function getExtScreenBrightness() {
    return taskScheduler.request({
      serverName: taskScheduler.POWER,
      funcName: function funcName() {
        return new Promise(function (t, n) {
          window.api.powermanager.extScreenBrightness.then(function (e) {
            t(e);
          }, function (e) {
            n(e);
          });
        });
      }
    });
  },
  getKeyLightBrightness: function getKeyLightBrightness() {
    return taskScheduler.request({
      serverName: taskScheduler.POWER,
      funcName: function funcName() {
        return new Promise(function (t, n) {
          window.api.powermanager.keyLightBrightness.then(function (e) {
            t(e);
          }, function (e) {
            n(e);
          });
        });
      }
    });
  },
  getCpuSleepAllowed: function getCpuSleepAllowed() {
    return taskScheduler.request({
      serverName: taskScheduler.POWER,
      funcName: function funcName() {
        return new Promise(function (t, n) {
          window.api.powermanager.cpuSleepAllowed.then(function (e) {
            t(e);
          }, function (e) {
            n(e);
          });
        });
      }
    });
  },
  processPendingRequest: function processPendingRequest() {
    this._powerOff && this.powerOff(), this._reboot && this.reboot(), void 0 !== this._screenEnabled && this.setScreenEnabled(this._screenEnabled), void 0 !== this._extScreenEnabled && this.setExtScreenEnabled(this._extScreenEnabled), void 0 !== this._keyLightEnabled && this.setKeyLightEnabled(this._keyLightEnabled), void 0 !== this._screenBrightness && this.setScreenBrightness(this._screenBrightness), void 0 !== this._extScreenBrightness && this.setExtScreenBrightness(this._extScreenBrightness), void 0 !== this._keyLightBrightness && this.setKeyLightBrightness(this._keyLightBrightness), void 0 !== this._cpuSleepAllowed && this.setCpuSleepAllowed(this._cpuSleepAllowed), void 0 !== this._factoryReset && this.setFactoryReset(this._factoryReset);
  }
};
PowerManager.init(), window.PowerManager = PowerManager;
