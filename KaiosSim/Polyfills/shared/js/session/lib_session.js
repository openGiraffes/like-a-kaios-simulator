var inServiceWorker = !1;
function LibSession() {
  this.debug("LibSession"), this.DEBUG = !1, this.LOCALHOST = "http://127.0.0.1/api/v1/", this.services = [], this.session = null, this.sessionFiles = ["".concat(this.LOCALHOST, "shared/core.js"), "".concat(this.LOCALHOST, "shared/session.js")], this.serviceSessionMapping = {
    settingsService: {
      apiName: "settingsmanager",
      sessionInitFunc: function sessionInitFunc(e) {
        return lib_settings.SettingsManager.get(e);
      },
      fileLists: ["".concat(this.LOCALHOST, "settings/service.js")]
    },
    powerService: {
      apiName: "powermanager",
      sessionInitFunc: function sessionInitFunc(e) {
        return lib_powermanager.PowermanagerService.get(e);
      },
      fileLists: ["".concat(this.LOCALHOST, "powermanager/service.js")]
    },
    usbService: {
      apiName: "usbmanager",
      sessionInitFunc: function sessionInitFunc(e) {
        return lib_usbmanager.UsbmanagerService.get(e);
      },
      fileLists: ["".concat(this.LOCALHOST, "usbmanager/service.js")]
    },
    accountsService: {
      apiName: "accountmanager",
      sessionInitFunc: function sessionInitFunc(e) {
        return lib_accounts.AccountManager.get(e);
      },
      fileLists: ["".concat(this.LOCALHOST, "accounts/service.js")]
    },
    appsService: {
      apiName: "appsmanager",
      sessionInitFunc: function sessionInitFunc(e) {
        return lib_apps.AppsManager.get(e);
      },
      fileLists: ["".concat(this.LOCALHOST, "apps/service.js")]
    },
    tcpsocketService: {
      apiName: "tcpsocketmanager",
      sessionInitFunc: function sessionInitFunc(e) {
        return lib_tcpsocket.TcpSocketManager.get(e);
      },
      fileLists: ["".concat(this.LOCALHOST, "tcpsocket/service.js")]
    },
    telephonyService: {
      apiName: "telephonymanager",
      sessionInitFunc: function sessionInitFunc(e) {
        return lib_telephony.Telephony.get(e);
      },
      fileLists: ["".concat(this.LOCALHOST, "telephony/service.js")]
    },
    devicecapabilityService: {
      apiName: "devicecapabilitymanager",
      sessionInitFunc: function sessionInitFunc(e) {
        return lib_devicecapability.DeviceCapabilityManager.get(e);
      },
      fileLists: ["".concat(this.LOCALHOST, "devicecapability/service.js")]
    },
    contactsService: {
      apiName: "contactsmanager",
      sessionInitFunc: function sessionInitFunc(e) {
        return lib_contacts.ContactsManager.get(e);
      },
      fileLists: ["".concat(this.LOCALHOST, "contacts/service.js")]
    },
    audiovolumeService: {
      apiName: "audiovolumemanager",
      sessionInitFunc: function sessionInitFunc(e) {
        return lib_audiovolume.AudioVolumeManager.get(e);
      },
      fileLists: ["".concat(this.LOCALHOST, "audiovolumemanager/service.js")]
    },
    procmanagerService: {
      apiName: "procmanager",
      sessionInitFunc: function sessionInitFunc(e) {
        return lib_procmanager.ProcManager.get(e);
      },
      fileLists: ["".concat(this.LOCALHOST, "procmanager/service.js")]
    },
    timeService: {
      apiName: "timeservice",
      sessionInitFunc: function sessionInitFunc(e) {
        return lib_time.TimeService.get(e);
      },
      fileLists: ["".concat(this.LOCALHOST, "time/service.js")]
    },
    fotaService: {
      apiName: "fota",
      sessionInitFunc: function sessionInitFunc(e) {
        return lib_fota.Fota.get(e);
      },
      fileLists: ["".concat(this.LOCALHOST, "fota/service.js")]
    }
  };
}
"undefined" == typeof window && (inServiceWorker = !0, window = {
  dispatchEvent: function (_dispatchEvent) {
    function dispatchEvent() {
      return _dispatchEvent.apply(this, arguments);
    }
    dispatchEvent.toString = function () {
      return _dispatchEvent.toString();
    };
    return dispatchEvent;
  }(function () {
    for (var _len = arguments.length, e = new Array(_len), _key = 0; _key < _len; _key++) {
      e[_key] = arguments[_key];
    }
    dispatchEvent.apply(self, e);
  }),
  addEventListener: function (_addEventListener) {
    function addEventListener() {
      return _addEventListener.apply(this, arguments);
    }
    addEventListener.toString = function () {
      return _addEventListener.toString();
    };
    return addEventListener;
  }(function () {
    for (var _len2 = arguments.length, e = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      e[_key2] = arguments[_key2];
    }
    addEventListener.apply(self, e);
  })
}), LibSession.prototype.debug = function (e) {
  this.DEBUG || window.DUMP && DUMP("[LibSession] ".concat(e));
}, LibSession.prototype.sessionInit = function (e) {
  var _this = this;
  this.debug("sessionInit");
  var n = [];
  return e.forEach(function (e) {
    var s = _this.serviceSessionMapping[e];
    if (s) {
      var i = s.sessionInitFunc(_this.session);
      i.then(function (e) {
        window.api[s.apiName] = e;
      }), n.push(i);
    }
  }), Promise.all(n).then(function () {
    return _this.debug("services-load-complete"), window.dispatchEvent(new CustomEvent("services-load-observer")), window.dispatchEvent(new CustomEvent("services-load-complete")), _this.session;
  });
}, LibSession.prototype.initService = function (t) {
  var _this2 = this;
  return new Promise(function (i, e) {
    t && t.length || e(Error("No service"));
    var s = null,
      n = _this2.sessionFiles;
    t.forEach(function (e) {
      e = _this2.serviceSessionMapping[e];
      e && (n = n.concat(e.fileLists));
    }), s = inServiceWorker ? new Promise(function (e) {
      n.forEach(function (e) {
        importScripts(e);
      }), e();
    }) : LazyLoader.load(n), s.then(function () {
      if (_this2.services.length ? t.forEach(function (e) {
        _this2.services.includes(e) || _this2.services.push(e);
      }) : _this2.services = _this2.services.concat(t), _this2.session) window.api && window.api.session && window.api.session.connected ? _this2.sessionInit(t).then(i) : (_this2.debug("Waiting for session connected"), window.addEventListener("services-load-complete", function () {
        i(_this2.session);
      }, {
        once: !0
      }));else {
        _this2.debug("session first initService"), _this2.session = new lib_session.Session();
        var _s = {};
        window.api || (window.api = {});
        var _window = window,
          _e = _window.api;
        _e.session = _this2.session, _s.onsessionconnected = function () {
          _this2.debug("onsessionconnected"), _this2.sessionInit(_this2.services).then(i);
        }, _s.onsessiondisconnected = function () {
          if (window.dispatchEvent(new CustomEvent("session-disconnected")), _this2.debug("session onsessiondisconnected Daemon Crashed"), document.hidden && window && window.parent && "b2g" !== window.parent.location.hostname) {
            var _e2 = window.parent.location.href;
            _e2 && !_e2.includes("callscreen.localhost") && (_this2.debug("Force close app: ".concat(_e2)), window.close());
          }
        };
        try {
          _this2.debug("session open"), navigator.b2g.externalapi.getToken().then(function (e) {
            _this2.debug("session open external token"), _this2.session.open("websocket", "127.0.0.1", e, _s, !0);
          });
        } catch (e) {
          _this2.debug("session open secret token"), _this2.session.open("websocket", "127.0.0.1", "secrettoken", _s, !0);
        }
      }
    }, function () {
      _this2.debug("session lazyload failed");
    });
  });
}, window.libSession = new LibSession();
