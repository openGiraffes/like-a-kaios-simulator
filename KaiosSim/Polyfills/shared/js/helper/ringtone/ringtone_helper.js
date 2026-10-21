var RingtoneHelper = function () {
  var o = "dialer.ringtone",
    s = "dialer.ringtone.name",
    l = "dialer.ringtone.id",
    g = "dialer.ringtone.default",
    d = "dialer.ringtone.name.default",
    u = "dialer.ringtone.id.default",
    t = [o, s, l, g, d, u],
    c = {};
  return function () {
    var _loop = function _loop(n) {
      SettingsObserver.observe(t[n], "", function (e) {
        c[t[n]] = e;
      });
    };
    for (var n = 0; n < 3; n++) {
      _loop(n);
    }
    var _loop2 = function _loop2(_n) {
      SettingsObserver.getValue(t[_n]).then(function (e) {
        c[t[_n]] = e;
      }, function () {
        c[t[_n]] = "";
      });
    };
    for (var _n = 3; _n < 6; _n++) {
      _loop2(_n);
    }
  }(), {
    get: function get() {
      return new Promise(function (e) {
        var n = c[o],
          t = c[s],
          r = c[l];
        if (n && n.startsWith("http")) e({
          src: n,
          name: t,
          id: r
        });else {
          var i = navigator.b2g.getDeviceStorage("sdcard"),
            a = i.get(n);
          a.onsuccess = function () {
            e({
              src: a.result,
              name: t,
              id: r
            });
          }, a.onerror = function () {
            SettingsObserver.setValue([{
              name: o,
              value: c[g]
            }, {
              name: s,
              value: c[d]
            }, {
              name: l,
              value: c[u]
            }]), e({
              src: c[g],
              name: c[d],
              id: c[u]
            });
          };
        }
      });
    }
  };
}();
window.RingtoneHelper = RingtoneHelper;
