var AppsManager = {
  connected: !1,
  initFlag: !1,
  eventListenerInfo: {},
  eventList: ["download_failed", "install", "installing", "uninstall", "update_available", "update", "updating", "status_changed"],
  init: function init() {
    var _this = this;
    this.initFlag || (this.initFlag = !0, window.addEventListener("session-disconnected", function () {
      _this.connected = !1;
    }), window.addEventListener("services-load-observer", function () {
      _this.connected || (_this.connected = !0, _this.recoverListener(), _this.updateDefaultConsts());
    })), this.initDefaultConsts();
  },
  initDefaultConsts: function initDefaultConsts() {
    this.AppsInstallState = {
      INSTALLED: 0,
      INSTALLING: 1,
      PENDING: 2
    }, this.AppsServiceError = {
      APP_NOT_FOUND: 0,
      CANCELED: 1,
      CLEAR_DATA_ERROR: 2,
      DEPENDENCIES_ERROR: 3,
      DISK_SPACE_NOT_ENOUGH: 4,
      DOWNLOAD_MANIFEST_FAILED: 5,
      DOWNLOAD_PACKAGE_FAILED: 6,
      DUPLICATED_ACTION: 7,
      INVALID_APP_NAME: 8,
      INVALID_START_URL: 9,
      INVALID_STATE: 10,
      INVALID_MANIFEST: 11,
      INVALID_PACKAGE: 12,
      INVALID_SIGNATURE: 13,
      INVALID_CERTIFICATE: 14,
      NETWORK_FAILURE: 15,
      FILESYSTEM_FAILURE: 16,
      PACKAGE_CORRUPT: 17,
      REGISTRATION_ERROR: 18,
      REINSTALL_FORBIDDEN: 19,
      UPDATE_ERROR: 20,
      UNKNOWN_ERROR: 21
    }, this.AppsServiceState = {
      INITIALIZING: 0,
      RUNNING: 1,
      TERMINATING: 2
    }, this.AppsStatus = {
      ENABLED: 0,
      DISABLED: 1
    }, this.AppsUpdateState = {
      IDLE: 0,
      AVAILABLE: 1,
      DOWNLOADING: 2,
      UPDATING: 3,
      PENDING: 4
    }, this.ClearType = {
      BROWSER: 0,
      STORAGE: 1
    }, this.ConnectionType = {
      WI_FI_ONLY: 0,
      ANY: 1
    };
  },
  updateDefaultConsts: function updateDefaultConsts() {
    var _lib_apps;
    var e, t, a, s, n, r, i;
    "undefined" != typeof lib_apps && (_lib_apps = lib_apps, e = _lib_apps.AppsInstallState, t = _lib_apps.AppsServiceError, a = _lib_apps.AppsServiceState, s = _lib_apps.AppsStatus, n = _lib_apps.AppsUpdateState, r = _lib_apps.ClearType, i = _lib_apps.ConnectionType, this.AppsInstallState = e, this.AppsServiceError = t, this.AppsServiceState = a, this.AppsStatus = s, this.AppsUpdateState = n, this.ClearType = r, this.ConnectionType = i);
  },
  getAll: function getAll() {
    var _this2 = this;
    return this._getAll().then(function (e) {
      return e;
    }, function () {
      return _this2.getAll();
    });
  },
  _getAll: function _getAll() {
    return taskScheduler.request({
      serverName: taskScheduler.APPS,
      funcName: "getAll"
    });
  },
  getApp: function getApp() {
    for (var _len = arguments.length, e = new Array(_len), _key = 0; _key < _len; _key++) {
      e[_key] = arguments[_key];
    }
    return taskScheduler.request({
      serverName: taskScheduler.APPS,
      funcName: "getApp",
      args: e
    });
  },
  getState: function getState() {
    return taskScheduler.request({
      serverName: taskScheduler.APPS,
      funcName: "getState"
    });
  },
  installPackage: function installPackage() {
    for (var _len2 = arguments.length, e = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      e[_key2] = arguments[_key2];
    }
    return taskScheduler.request({
      serverName: taskScheduler.APPS,
      funcName: "installPackage",
      args: e
    });
  },
  uninstall: function uninstall() {
    for (var _len3 = arguments.length, e = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      e[_key3] = arguments[_key3];
    }
    return taskScheduler.request({
      serverName: taskScheduler.APPS,
      funcName: "uninstall",
      args: e
    });
  },
  update: function update() {
    for (var _len4 = arguments.length, e = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      e[_key4] = arguments[_key4];
    }
    return taskScheduler.request({
      serverName: taskScheduler.APPS,
      funcName: "update",
      args: e
    });
  },
  checkForUpdate: function checkForUpdate(e) {
    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$autoInstall = _ref.autoInstall,
      t = _ref$autoInstall === void 0 ? !1 : _ref$autoInstall;
    return taskScheduler.request({
      serverName: taskScheduler.APPS,
      funcName: "checkForUpdate",
      args: [e, {
        autoInstall: t
      }]
    });
  },
  installPwa: function installPwa() {
    for (var _len5 = arguments.length, e = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
      e[_key5] = arguments[_key5];
    }
    return taskScheduler.request({
      serverName: taskScheduler.APPS,
      funcName: "installPwa",
      args: e
    });
  },
  setEnabled: function setEnabled() {
    for (var _len6 = arguments.length, e = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
      e[_key6] = arguments[_key6];
    }
    return taskScheduler.request({
      serverName: taskScheduler.APPS,
      funcName: "setEnabled",
      args: e
    });
  },
  clear: function clear() {
    for (var _len7 = arguments.length, e = new Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
      e[_key7] = arguments[_key7];
    }
    return taskScheduler.request({
      serverName: taskScheduler.APPS,
      funcName: "clear",
      args: e
    });
  },
  getUpdatePolicy: function getUpdatePolicy() {
    return taskScheduler.request({
      serverName: taskScheduler.APPS,
      funcName: "getUpdatePolicy"
    });
  },
  setUpdatePolicy: function setUpdatePolicy() {
    for (var _len8 = arguments.length, e = new Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
      e[_key8] = arguments[_key8];
    }
    return taskScheduler.request({
      serverName: taskScheduler.APPS,
      funcName: "setUpdatePolicy",
      args: e
    });
  },
  cancelDownload: function cancelDownload() {
    for (var _len9 = arguments.length, e = new Array(_len9), _key9 = 0; _key9 < _len9; _key9++) {
      e[_key9] = arguments[_key9];
    }
    return taskScheduler.request({
      serverName: taskScheduler.APPS,
      funcName: "cancelDownload",
      args: e
    });
  },
  getServiceEventList: function getServiceEventList() {
    var e = [];
    return window.api && window.api.appsmanager && (e = [window.api.appsmanager.APP_DOWNLOAD_FAILED_EVENT, window.api.appsmanager.APP_INSTALLED_EVENT, window.api.appsmanager.APP_INSTALLING_EVENT, window.api.appsmanager.APP_UNINSTALLED_EVENT, window.api.appsmanager.APP_UPDATE_AVAILABLE_EVENT, window.api.appsmanager.APP_UPDATED_EVENT, window.api.appsmanager.APP_UPDATING_EVENT, window.api.appsmanager.APPSTATUS_CHANGED_EVENT]), e;
  },
  addEventListener: function addEventListener(e, t) {
    var a,
      s = this.eventList.indexOf(e);
    -1 !== s && (this.connected && (a = this.getServiceEventList(), window.api.appsmanager.addEventListener(a[s], t)), this.eventListenerInfo[e] ? this.eventListenerInfo[e].push(t) : this.eventListenerInfo[e] = [t]);
  },
  removeEventListener: function removeEventListener(a, s) {
    var _this3 = this;
    var e,
      t = this.eventList.indexOf(a);
    -1 !== t && (this.connected && (e = this.getServiceEventList(), window.api.appsmanager.removeEventListener(e[t], s)), this.eventListenerInfo[a] && this.eventListenerInfo[a].forEach(function (e, t) {
      e === s && _this3.eventListenerInfo[a].splice(t, 1);
    }));
  },
  recoverListener: function recoverListener() {
    var _this4 = this;
    var e = "";
    var t = this.getServiceEventList();
    var _loop = function _loop() {
        a = e;
        var s = _this4.eventListenerInfo[a],
          n = _this4.eventList.indexOf(a);
        -1 !== n && s.forEach(function (e) {
          window.api.appsmanager.addEventListener(t[n], e);
        });
      },
      a;
    for (e in this.eventListenerInfo) {
      _loop();
    }
  }
};
AppsManager.init(), window.AppsManager = AppsManager;
