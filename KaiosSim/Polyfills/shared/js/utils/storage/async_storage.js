window.asyncStorage = function () {
  var r = "asyncStorage";
  var c = 1;
  var l = "keyvaluepairs";
  var u = null,
    s = 3;
  function i(e, o, t) {
    !function n(e) {
      if (u) e();else {
        var _o = window.indexedDB.open(r, c);
        _o.onerror = function () {
          window.close();
        }, _o.onupgradeneeded = function () {
          _o.result.createObjectStore(l);
        }, _o.onsuccess = function () {
          u = _o.result, u.objectStoreNames.contains(l) ? e() : s-- && (u.close(), u = null, c++, n(e));
        };
      }
    }(function () {
      var n = u.transaction(l, e);
      t && (n.oncomplete = t), o(n.objectStore(l));
    });
  }
  return {
    getItem: function getItem(e, o) {
      var t = null;
      i("readonly", function (n) {
        t = n.get(e), t.onerror = function () {};
      }, function () {
        var n = t.result;
        void 0 === n && (n = null), o(n);
      });
    },
    setItem: function setItem(o, t, n) {
      i("readwrite", function (n) {
        var e = n.put(t, o);
        e.onerror = function () {};
      }, n);
    },
    removeItem: function removeItem(o, n) {
      i("readwrite", function (n) {
        var e = n.delete(o);
        e.onerror = function () {};
      }, n);
    },
    clear: function clear(n) {
      i("readwrite", function (n) {
        var e = n.clear();
        e.onerror = function () {};
      }, n);
    },
    length: function length(n) {
      var e = null;
      i("readonly", function (n) {
        e = n.count(), e.onerror = function () {};
      }, function () {
        n(e.result);
      });
    },
    key: function key(t, e) {
      if (t < 0) e(null);else {
        var o = null;
        i("readonly", function (n) {
          var e = !1;
          o = n.openCursor(), o.onsuccess = function () {
            var n = o.result;
            n && (0 === t || e || (e = !0, n.advance(t)));
          }, o.onerror = function () {};
        }, function () {
          var n = o.result;
          e(n ? n.key : null);
        });
      }
    }
  };
}();
