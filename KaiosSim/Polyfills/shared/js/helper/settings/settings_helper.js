!function (n) {
  n.SettingsHelper = function (n, t) {
    var i = n;
    var l;
    var u = t,
      o = function o(n) {
        for (var _len = arguments.length, t = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          t[_key - 1] = arguments[_key];
        }
        n && n.apply(null, Array.prototype.slice.call(t, 0));
      };
    return {
      get: function get(t) {
        var e;
        e = function e(n) {
          l = void 0 !== n ? n : u, o(t, l);
        }, SettingsObserver.getValue(i).then(function (n) {
          o(e, n);
        }, function () {
          o(e, null);
        });
      },
      set: function set(n, t) {
        var e;
        n = n, e = o.bind(null, t), SettingsObserver.setValue([{
          name: i,
          value: n
        }]).then(function () {
          o(e);
        }, function () {
          o(e);
        });
      },
      uninit: function uninit() {}
    };
  };
}(window);
