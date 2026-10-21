var AML = function () {
  var o = window.navigator.b2g.mobileConnections,
    i = "http://shared.localhost/resources/aml.json",
    s = "aml.config",
    u = "geolocation.enabled",
    c = "wifi.enabled";
  var g = 20,
    l = !1,
    d = .1,
    e = null;
  function m(t) {
    var t = o[t].voice.network;
    return t && t.mcc ? t.mcc : "";
  }
  function h(t, e) {
    return SettingsObserver.setValue([{
      name: t,
      value: e
    }]).then(function () {
      return !0;
    }).catch(function (t) {
      return !1;
    });
  }
  function v(c) {
    l = !0;
    var r,
      t = function () {
        if (e && e.level) return e.level > d;
        return !0;
      }();
    var a = {};
    return r = t, new Promise(function (n) {
      SettingsObserver.getValue(u).then(function (t) {
        r === t ? S(r).then(function (t) {
          n(t);
        }) : h(u, r).then(function (e) {
          setTimeout(function () {
            S(r).then(function (t) {
              e && h(u, !r), n(t);
            });
          }, 250);
        });
      });
    }).then(function (t) {
      l = !1;
      var e = "N";
      var n = o[c];
      if (t && t.coords) {
        var _i = t.coords;
        switch (a.lt = 0 < _i.latitude ? "+".concat(_i.latitude.toFixed(5)) : _i.latitude.toFixed(5), a.lg = 0 < _i.longitude ? "+".concat(_i.longitude.toFixed(5)) : _i.longitude.toFixed(5), a.rd = parseInt(_i.accuracy, 10), t.positioningMethod) {
          case "gnss":
            e = "G";
            break;
          case "wifi":
            e = "W";
            break;
          case "cell":
            e = "C";
            break;
          case "wifi-and-cell":
            e = _i.accuracy < 500 ? "W" : "C";
            break;
          default:
            e = _i.accuracy < 30 ? "G" : 300 <= _i.accuracy ? "C" : "W";
        }
      }
      a.pm = e;
      var r = null;
      r = t && t.gnssUtcTime ? new Date(t.gnssUtcTime) : new Date(), a.top = r.getFullYear() + (r.getMonth() + 1).toString().padStart(2, "0") + r.getDate().toString().padStart(2, "0") + r.getHours().toString().padStart(2, "0") + r.getMinutes().toString().padStart(2, "0") + r.getSeconds().toString().padStart(2, "0");
      t = n.iccId, t = navigator.b2g.iccManager.getIccById(t);
      a.si = t.iccInfo.imsi, a.header = "2", a.mcc = m(c), a.mnc = function (t) {
        var t = o[t].voice.network;
        return t && t.mnc ? t.mnc : "";
      }(c);
      t = n.getDeviceIdentities();
      return a.ei = t.imei, a;
    }).catch(function (t) {
      return l = !1, a;
    });
  }
  function S(r) {
    return new Promise(function (n) {
      SettingsObserver.getValue(c).then(function (t) {
        r === t ? a().then(function (t) {
          n(t);
        }) : h(c, r).then(function (e) {
          setTimeout(function () {
            a().then(function (t) {
              e && h(c, !r), n(t);
            });
          }, 250);
        });
      });
    });
  }
  function a() {
    return new Promise(function (e) {
      var t = {
        enableHighAccuracy: !0,
        timeout: 1e3 * g,
        maximumAge: 0
      };
      var n = navigator.b2g.requestWakeLock("gps");
      navigator.geolocation.getCurrentPosition(function (t) {
        n.unlock(), e(t);
      }, function (t) {
        n.unlock(), e("");
      }, t);
    });
  }
  function f(a, t, e) {
    var n, r;
    l || !o || (n = o[a]) && n.iccId && (n = m(a)) && (r = n, LazyLoader.getJSON(i).then(function (t) {
      var e = {};
      return r && t[r] && (e = t[r]), e;
    }).catch(function (t) {
      return "";
    }).then(function (c) {
      (e || c && c.triggerNumbers && -1 !== c.triggerNumbers.indexOf(t)) && SettingsObserver.getValue(s).then(function (t) {
        t && (g = t.t1Timeout || g, d = t.batteryForFiveMinutes || d);
      }).catch(function (t) {}).then(function () {
        v(a).then(function (t) {
          var e = {};
          for (var _r in t) e[_r] = t[_r];
          for (var _i2 in c) e[_i2] = c[_i2];
          var n = new WebActivity("aml-msg", {
            id: a,
            data: e
          });
          n.start();
        });
      });
    }));
  }
  return window.navigator.getBattery().then(function (t) {
    e = t;
  }), {
    triggerBySMS: function triggerBySMS(r) {
      return LazyLoader.getJSON(i).then(function (t) {
        var e = m(r);
        var n = !1;
        e && t[e] && (n = t[e].AllowTriggerBySMS112), n && f(r, "", !0);
      }).catch(function (t) {});
    },
    sendAMLSms: f
  };
}();
window.AML = AML;
