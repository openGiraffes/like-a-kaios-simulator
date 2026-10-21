!function (e) {
  var _arguments = arguments;
  var n = navigator.b2g.iccManager;
  var c = null;
  if (Object.defineProperty(e, "IccHelper", {
    configurable: !0,
    get: function get() {
      return c;
    },
    set: function set(e) {
      c = e;
    }
  }), n && n.getIccById) {
    var o = null;
    var a = {},
      r = {},
      i = ["cardstatechange", "iccinfochange", "stkcommand", "stksessionend"],
      d = ["iccInfo", "cardState"],
      s = ["sendStkResponse", "sendStkMenuSelection", "sendStkTimerExpiration", "sendStkEventDownload"],
      f = ["getCardLock", "unlockCardLock", "setCardLock", "getCardLockRetryCount", "readContacts", "updateContact", "iccOpenChannel", "iccExchangeAPDU", "iccCloseChannel"],
      l = function l(e) {
        return function () {
          return o ? o[e].apply(o, _arguments) : null;
        };
      };
    c = function () {
      var t = {
        addEventListener: function addEventListener(n, c) {
          if ("function" == typeof c && -1 !== i.indexOf(n)) {
            var _e = a[n];
            null === _e && (a[n] = [], _e = []), -1 === _e.indexOf(c) && _e.push(c);
          }
        },
        removeEventListener: function removeEventListener(e, n) {
          var c = a[e];
          !c || -1 !== (n = c.indexOf(n)) && c.splice(n, 1);
        }
      };
      return d.forEach(function (e) {
        var n;
        Object.defineProperty(t, e, {
          enumerable: !0,
          get: (n = e, function () {
            return o ? o[n] : null;
          })
        });
      }), s.forEach(function (e) {
        t[e] = l(e);
      }), f.forEach(function (e) {
        t[e] = l(e);
      }), i.forEach(function (c) {
        Object.defineProperty(t, "on".concat(c), {
          enumerable: !0,
          set: function set(e) {
            var n = r[c];
            n && t.removeEventListener(c, n), (r[c] = e) && t.addEventListener(c, e);
          },
          get: function get() {
            return r[c];
          }
        });
      }), t;
    }(), n.iccIds && n.iccIds.length && (o = n.getIccById(n.iccIds[0]), o && i.forEach(function (c) {
      o.addEventListener(c, function (n) {
        var e = a[c];
        e && e.forEach(function (e) {
          e(n);
        });
      });
    })), n.oniccdetected = function (e) {
      null === c.cardState && (o = n.getIccById(e.iccId), o && (i.forEach(function (c) {
        o.addEventListener(c, function (n) {
          var e = a[c];
          e && e.forEach(function (e) {
            e(n);
          });
        });
      }), ["cardstatechange", "iccinfochange"].forEach(function (e) {
        a[e] && a[e].forEach(function (e) {
          e();
        });
      })));
    };
  } else c = n;
}(window);
