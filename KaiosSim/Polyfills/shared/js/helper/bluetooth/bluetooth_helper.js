var BluetoothHelper = function BluetoothHelper() {
  var n = window.navigator.b2g.bluetooth;
  var t = !1,
    a = [],
    r = null,
    s = null,
    o = !0;
  var d = function d(e) {
      e && n && (t ? e() : a.push(e));
    },
    c = function c(e, t, n) {
      e.onsuccess = function () {
        t && t(e.result);
      }, e.onerror = function () {
        n && n();
      };
    },
    u = function u() {
      r && (t = !0, a.forEach(function (e) {
        e();
      }), a = []);
    },
    e = function e() {
      o ? (n.onattributechanged = function (e) {
        for (var _t in e.attrs) "defaultAdapter" === e.attrs[_t] && (r = n.defaultAdapter, u());
      }, r = n.defaultAdapter, r && u()) : function () {
        var e = n.getDefaultAdapter();
        e && (e.onsuccess = function () {
          r && (s = r), t = !0, r = e.result, s && s.onpairedstatuschanged && (r.onpairedstatuschanged = s.onpairedstatuschanged), a.forEach(function (e) {
            e();
          }), a = [];
        }, e.onerror = function () {});
      }();
    };
  var i = function i(e, t) {
    if (!(e instanceof ArrayBuffer)) return null;
    var n = new Uint8Array(e);
    var a = function (t) {
      var n = 0;
      for (; n < 28;) {
        var a = t[n];
        if (0 === a) return null;
        var _e = n;
        if (22 === t[++_e]) return 170 !== t[++_e] || 254 !== t[++_e] || 16 !== t[++_e] ? null : n;
        n += a;
      }
      return null;
    }(n);
    if (null === a) return null;
    var r = n[a],
      s = n[a + 5],
      e = n[a + 6],
      s = function (e, t) {
        t = +e / (t - 41);
        return t < 1 ? Math.pow(t, 10) : .42093 * Math.pow(t, 6.9476) + .54992;
      }(t, s << 24 >> 24);
    n = n.slice(a + 7, a + r + 1);
    var o = function (e) {
      switch (e) {
        case 0:
          return "http://www.";
        case 1:
          return "https://www.";
        case 2:
          return "http://";
        case 3:
          return "https://";
      }
      return "";
    }(e);
    return n.forEach(function (e) {
      o += function (e) {
        switch (e) {
          case 0:
            return ".com/";
          case 1:
            return ".org/";
          case 2:
            return ".edu/";
          case 3:
            return ".net/";
          case 4:
            return ".info/";
          case 5:
            return ".biz/";
          case 6:
            return ".gov/";
          case 7:
            return ".com";
          case 8:
            return ".org";
          case 9:
            return ".edu";
          case 10:
            return ".net";
          case 11:
            return ".info";
          case 12:
            return ".biz";
          case 13:
            return ".gov";
        }
        return String.fromCharCode(e);
      }(e);
    }), {
      url: o,
      distance: s
    };
  };
  return n && (void 0 === n.onattributechanged && (o = !1), o ? n.onadapteradded = function () {
    e();
  } : (n.addEventListener("enabled", e), n.addEventListener("adapteradded", e), n.addEventListener("disabled", function () {
    r && (s = r), t = !1, r = null;
  })), e()), {
    profiles: {
      HFP: 4382,
      A2DP: 4365
    },
    answerWaitingCall: function answerWaitingCall() {
      d(function () {
        r.answerWaitingCall();
      });
    },
    ignoreWaitingCall: function ignoreWaitingCall() {
      d(function () {
        r.ignoreWaitingCall();
      });
    },
    toggleCalls: function toggleCalls() {
      d(function () {
        r.toggleCalls();
      });
    },
    getConnectedDevicesByProfile: function getConnectedDevicesByProfile(e, t, n) {
      d(function () {
        c(r.getConnectedDevices(e), t, n);
      });
    },
    connectSco: function connectSco(e) {
      d(function () {
        c(r.connectSco(), e);
      });
    },
    disconnectSco: function disconnectSco(e) {
      d(function () {
        c(r.disconnectSco(), e);
      });
    },
    getPairedDevices: function getPairedDevices(e) {
      d(function () {
        c(r.getPairedDevices(), e);
      });
    },
    getAddress: function getAddress(t) {
      o || d(function () {
        var _r = r,
          e = _r.address;
        t(e);
      });
    },
    setPairingConfirmation: function setPairingConfirmation(e, t) {
      o || d(function () {
        r.setPairingConfirmation(e, t);
      });
    },
    setPinCode: function setPinCode(e, t) {
      o || d(function () {
        r.setPinCode(e, t);
      });
    },
    setPasskey: function setPasskey(e, t) {
      o || d(function () {
        r.setPasskey(e, t);
      });
    },
    isScoConnected: function isScoConnected(e, t) {
      d(function () {
        c(r.isScoConnected(), e, t);
      });
    },
    sendMediaMetaData: function sendMediaMetaData(e, t, n) {
      d(function () {
        c(r.sendMediaMetaData(e), t, n);
      });
    },
    sendMediaPlayStatus: function sendMediaPlayStatus(e, t, n) {
      d(function () {
        c(r.sendMediaPlayStatus(e), t, n);
      });
    },
    set onhfpstatuschanged(e) {
      d(function () {
        r.onhfpstatuschanged = e;
      });
    },
    set onscostatuschanged(e) {
      d(function () {
        r.onscostatuschanged = e;
      });
    },
    set ona2dpstatuschanged(e) {
      d(function () {
        r.ona2dpstatuschanged = e;
      });
    },
    set onrequestmediaplaystatus(e) {
      d(function () {
        r.onrequestmediaplaystatus = e;
      });
    },
    set onpairedstatuschanged(e) {
      o || d(function () {
        r.onpairedstatuschanged = e;
      });
    },
    v2: o,
    enable: function enable() {
      o && d(function () {
        r.enable();
      });
    },
    disable: function disable() {
      o && d(function () {
        r.disable();
      });
    },
    parseEddystoneUrl: function parseEddystoneUrl(e, t) {
      return o ? i(e, t) : null;
    }
  };
};
window.BluetoothHelper = BluetoothHelper;
