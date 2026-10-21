function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _asyncIterator(r) { var n, t, o, e = 2; for ("undefined" != typeof Symbol && (t = Symbol.asyncIterator, o = Symbol.iterator); e--;) { if (t && null != (n = r[t])) return n.call(r); if (o && null != (n = r[o])) return new AsyncFromSyncIterator(n.call(r)); t = "@@asyncIterator", o = "@@iterator"; } throw new TypeError("Object is not async iterable"); }
function AsyncFromSyncIterator(r) { function AsyncFromSyncIteratorContinuation(r) { if (Object(r) !== r) return Promise.reject(new TypeError(r + " is not an object.")); var n = r.done; return Promise.resolve(r.value).then(function (r) { return { value: r, done: n }; }); } return AsyncFromSyncIterator = function AsyncFromSyncIterator(r) { this.s = r, this.n = r.next; }, AsyncFromSyncIterator.prototype = { s: null, n: null, next: function next() { return AsyncFromSyncIteratorContinuation(this.n.apply(this.s, arguments)); }, return: function _return(r) { var n = this.s.return; return void 0 === n ? Promise.resolve({ value: r, done: !0 }) : AsyncFromSyncIteratorContinuation(n.apply(this.s, arguments)); }, throw: function _throw(r) { var n = this.s.return; return void 0 === n ? Promise.reject(r) : AsyncFromSyncIteratorContinuation(n.apply(this.s, arguments)); } }, new AsyncFromSyncIterator(r); }
!function (e) {
  function l(n, e, t) {
    var _this = this;
    this.mediaType = n, this.metadataParser = e, this.indexes = (t = t || {}).indexes || [], this.version = t.version || 1, this.mimeTypes = t.mimeTypes, this.autoscan = void 0 === t.autoscan || t.autoscan, this.state = l.OPENING, this.scanning = !1, this.parsingBigFiles = !1, this.errorLength = 0, this.filesLength = 0, this.stopScanning = !1, this.updateRecord = t.updateRecord, this.reparsedRecord = t.reparsedRecord, t.excludeFilter && t.excludeFilter instanceof RegExp && (this.clientExcludeFilter = t.excludeFilter), this.batchHoldTime = t.batchHoldTime || 100, this.batchSize = t.batchSize || 0, this.dbname = "MediaDB/".concat(this.mediaType, "/"), this.details = {
      eventListeners: {},
      pendingInsertions: [],
      pendingDeletions: [],
      whenDoneProcessing: [],
      pendingCreateNotifications: [],
      pendingDeleteNotifications: [],
      pendingNotificationTimer: null,
      newestFileModTime: 0
    };
    var r = this;
    this.metadataParser || (this.metadataParser = function (e, t) {
      setTimeout(function () {
        t({});
      }, 0);
    });
    t = (65535 & this.version) << 16 | 65535 & l.VERSION;
    var a = indexedDB.open(this.dbname, t);
    a.onerror = function () {
      v(_this, "openMediaDBFail");
    }, a.onblocked = function () {}, a.onupgradeneeded = function (e) {
      var t = a.result,
        n = e.target.transaction,
        _e = e,
        e = _e.oldVersion;
      var i = 65535 & e,
        s = 65535 & e >> 16;
      0 === s && (i = 2, s = e / i), 0 === t.objectStoreNames.length ? function (e) {
        var t = e.createObjectStore("files", {
          keyPath: "name"
        });
        t.createIndex("date", "date"), r.indexes.forEach(function (e) {
          "name" !== e && "date" !== e && t.createIndex(e, e);
        });
      }(t) : function (e, i, s) {
        r.state = l.UPGRADING;
        var t = {
          oldMediaDBVersion: i,
          oldClientVersion: s,
          newMediaDBVersion: l.VERSION,
          newClientVersion: r.version
        };
        v(r, "upgrading", t);
        var a = e.objectStore("files");
        r.version !== s && function (t) {
          var n = t.indexNames,
            i = r.indexes;
          for (var _e2 = 0; _e2 < n.length; _e2++) "name" !== n[_e2] && "date" !== n[_e2] && i.indexOf(n[_e2]) < 0 && t.deleteIndex(n[_e2]);
          for (var _e3 = 0; _e3 < i.length; _e3++) n.contains(i[_e3]) || t.createIndex(i[_e3], i[_e3]);
        }(a);
        var o = r.version !== s && r.updateRecord;
        (2 === i && 3 === l.VERSION || o) && function (e, t) {
          var n = e.openCursor();
          n.onsuccess = function () {
            var e = n.result;
            e && (t(e.value), e.continue());
          };
        }(a, function (e) {
          var t, n;
          2 === i && 3 === l.VERSION && (t = a, "/" !== (n = e).name[0] && (t.delete(n.name), n.name = "/sdcard/".concat(n.name), t.add(n))), o && function (e, t, n) {
            try {
              t.metadata = r.updateRecord(t, n, r.version), t.needsReparse && !r.reparsedRecord && delete t.needsReparse, e.put(t);
            } catch (e) {}
          }(a, e, s);
        });
      }(n, i, s);
    }, a.onsuccess = function () {
      r.db = a.result, r.db.onerror = function (e) {}, b(r, l.ENUMERABLE);
      var t = r.db.transaction("files", "readonly").objectStore("files").index("date").openCursor(null, "prev");
      t.onerror = function () {}, t.onsuccess = function () {
        var e = t.result;
        r.details.newestFileModTime = e ? e.value.date : 0, function () {
          var a = r.details;
          function o() {
            for (var _e4 = 0; _e4 < a.storages.length; _e4++) a.storages[_e4].addEventListener("change", t);
            var e;
            a.dsEventListener = t, e = s(a.availability), b(r, e), r.autoscan && c(r);
          }
          function s(e) {
            var t = 0,
              n = 0,
              i = 0;
            for (var s in e) switch (t++, e[s]) {
              case "unavailable":
                n++;
                break;
              case "shared":
                i++;
            }
            return 0 < i ? l.UNMOUNTED : n === t ? l.NOCARD : l.READY;
          }
          function t(e) {
            switch (e.reason) {
              case "modified":
              case "deleted":
                n = (t = e).path, i(r, n) || ("modified" === t.reason ? f : h)(r, n);
                break;
              case "available":
              case "unavailable":
              case "shared":
                !function (e) {
                  var t = e.target.storageName;
                  var n, i;
                  a.availability[t] !== e.reason && (n = r.state, a.availability[t] = e.reason, (i = s(a.availability)) !== n ? (b(r, i), i === l.READY ? r.autoscan && c(r) : u(r)) : i === l.READY && ("available" === e.reason ? (v(r, "ready"), r.autoscan && c(r)) : "unavailable" === e.reason && (v(r, "cardremoved"), function (e) {
                    var t = e ? "/".concat(e, "/") : "",
                      n = r.db.transaction("files").objectStore("files"),
                      i = n.openCursor();
                    i.onsuccess = function () {
                      var e = i.result;
                      e && (e.value.name.startsWith(t) && h(r, e.value.name), e.continue());
                    };
                  }(t))));
                }(e);
            }
            var t, n;
          }
          a.storages = navigator.b2g.getDeviceStorages(n), a.availability = {}, function () {
            var s = 0;
            !function e() {
              if (s >= a.storages.length) return void o();
              var t = a.storages[s++];
              var n = t.storageName;
              var i = t.available();
              i.onsuccess = function () {
                a.availability[n] = i.result, e();
              };
              i.onerror = function () {
                a.availability[n] = "unavailable", e();
              };
            }();
          }();
        }();
      };
    };
  }
  function d(e, t) {
    return i(e, t.name) || !(!e.mimeTypes || -1 !== e.mimeTypes.indexOf(t.type));
  }
  function i(e, t) {
    if (e.clientExcludeFilter && !e.clientExcludeFilter.test(t)) return 1;
    var n = t.substring(0, t.lastIndexOf("/") + 1);
    return "." === n[0] || -1 !== n.indexOf("/.");
  }
  function c(c) {
    function n(a, o, r) {
      return Array.isArray(a) ? Promise.all(a.map(function (e) {
        return n(e, o, r);
      })).then(function (e) {
        return Array.prototype.concat.apply([], e);
      }) : new Promise(function (t, n) {
        var i = [],
          e = a.enumerate(o || "", r || {}),
          s = e.values();
        !_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
          var _iteratorAbruptCompletion, _didIteratorError, _iteratorError, _iterator, _step, e, _t;
          return _regenerator().w(function (_context) {
            while (1) switch (_context.p = _context.n) {
              case 0:
                _iteratorAbruptCompletion = false;
                _didIteratorError = false;
                _context.p = 1;
                _iterator = _asyncIterator(s);
              case 2:
                _context.n = 3;
                return _iterator.next();
              case 3:
                if (!(_iteratorAbruptCompletion = !(_step = _context.v).done)) {
                  _context.n = 5;
                  break;
                }
                e = _step.value;
                c.stopScanning && (c.scanning = !1, c.stopScanning = !1, t(i)), d(c, e) || i.push(e);
              case 4:
                _iteratorAbruptCompletion = false;
                _context.n = 2;
                break;
              case 5:
                _context.n = 7;
                break;
              case 6:
                _context.p = 6;
                _t = _context.v;
                _didIteratorError = true;
                _iteratorError = _t;
              case 7:
                _context.p = 7;
                _context.p = 8;
                if (!(_iteratorAbruptCompletion && _iterator.return != null)) {
                  _context.n = 9;
                  break;
                }
                _context.n = 9;
                return _iterator.return();
              case 9:
                _context.p = 9;
                if (!_didIteratorError) {
                  _context.n = 10;
                  break;
                }
                throw _iteratorError;
              case 10:
                return _context.f(9);
              case 11:
                return _context.f(7);
              case 12:
                t(i);
              case 13:
                return _context.a(2);
            }
          }, _callee, null, [[8,, 9, 11], [1, 6, 7, 12]]);
        }))().then(function () {}).catch(function (e) {
          "NotFoundError" === e.name ? t(i) : n(e);
        });
      });
    }
    c.details.storages.length < 1 ? v(c, "nomediastorage") : (c.scanning = !0, v(c, "scanstart"), function (e) {
      var t = null;
      c.details.containsData = !1, t = 0 < e ? (c.details.firstscan = !1, {
        since: new Date(e + 1)
      }) : (c.details.firstscan = !0, c.details.records = [], {});
      n(c.details.storages, null, t).then(function (t) {
        if (c.scanning) {
          t = t.sort(function (e, t) {
            return t.lastModified - e.lastModified;
          }), c.filesLength = t.length;
          for (var _e5 = 0; _e5 < t.length; _e5++) f(c, t[_e5]);
          !function (e, t) {
            var n = e.details;
            n.processingQueue ? n.whenDoneProcessing.push(t) : t();
          }(c, function () {
            m(c), c.details.firstscan ? (u(c), c.details.firstscan = !1) : c.state === l.READY ? n(c.details.storages).then(function (e) {
              return function (e) {
                var t = c.db.transaction("files").objectStore("files"),
                  n = t.mozGetAll();
                n.onsuccess = function () {
                  c.scanning && function (n, i) {
                    i.sort(function (e, t) {
                      return e.name < t.name ? -1 : 1;
                    });
                    var s = 0,
                      a = 0;
                    for (;;) {
                      var _e7;
                      var _e6 = null;
                      _e6 = s < i.length ? i[s] : null;
                      var _t2 = null;
                      if (_t2 = a < n.length ? n[a] : null, !_e6 && !_t2) break;
                      var o, r;
                      _t2 ? _e6 ? _e6.name !== _t2.name ? _e6.name < _t2.name ? (f(c, _e6), s++) : _e6.name > _t2.name && (h(c, _t2.name), a++) : (_e7 = _e6, o = _e7.lastModified, r = o - _t2.date, o = 0 == r || Math.abs(r) <= 432e5 && r % 10 * 60 * 1e3 == 0, r = _e6.size === _t2.size, o && r ? _t2.needsReparse && (h(c, _t2.name), f(c, _e6, _t2.metadata)) : (h(c, _t2.name), f(c, _e6)), s++, a++) : (h(c, _t2.name), a++) : (f(c, _e6), s++);
                    }
                    f(c, null);
                  }(n.result, e);
                };
              }(e);
            }).catch(function (e) {
              u(c);
            }) : u(c);
          });
        }
      }).catch(function (e) {
        u(c);
      });
    }(c.details.newestFileModTime));
  }
  function u(e) {
    e.scanning && (e.scanning = !1, e.parsingBigFiles = !1, e.filesLength > e.errorLength && (e.details.containsData = !0), v(e, "scanend", {
      containsData: e.details.containsData,
      firstscan: e.details.firstscan
    }));
  }
  function f(e, t, n) {
    var i = e.details;
    i.pendingInsertions.push([t, n]), i.processingQueue || s(e);
  }
  function h(e, t) {
    var n = e.details;
    n.pendingDeletions.push(t), n.processingQueue || s(e);
  }
  function s(o) {
    var s = o.details;
    function r() {
      if (0 < s.pendingDeletions.length) !function () {
        var e = o.db.transaction("files", "readwrite"),
          i = e.objectStore("files");
        !function e() {
          if (0 !== s.pendingDeletions.length) {
            var t = s.pendingDeletions.shift(),
              n = i.delete(t);
            n.onerror = function () {
              e();
            }, n.onsuccess = function () {
              p(o, t), e();
            };
          } else r();
        }();
      }();else if (0 < s.pendingInsertions.length) !function (e, t) {
        if (null !== e) {
          if ("string" == typeof e) {
            var n = navigator.b2g.getDeviceStorage(o.mediaType),
              _i = n.get(e);
            _i.onerror = function () {
              r();
            }, _i.onsuccess = function () {
              o.mimeTypes && d(o, _i.result) ? r() : a(_i.result, e, t);
            };
          } else a(e, e.name, t);
        } else m(o), u(o), r();
      }.apply(void 0, _toConsumableArray(s.pendingInsertions.shift()));else if (s.processingQueue = !1, 0 < s.whenDoneProcessing.length) {
        var _e8 = s.whenDoneProcessing;
        s.whenDoneProcessing = [], _e8.forEach(function (e) {
          e();
        });
      }
    }
    function a(e, t, n) {
      e.lastModified;
      var i = {
        name: t,
        type: e.type,
        size: e.size,
        date: e.lastModified || Date.now(),
        firstParseTime: e.firstParseTime || Date.now()
      };
      i.date > s.newestFileModTime && (s.newestFileModTime = i.date), o.metadataParser(e, function (e) {
        i.metadata = e, n && o.reparsedRecord && (i.metadata = o.reparsedRecord(n, e));
        c(i), o.scanning || (o.parsingBigFiles = !1);
      }, function (e) {
        o.errorLength += 1, i.fail = !0, c(i);
      }, function () {
        o.parsingBigFiles = !0;
      });
    }
    function c(i) {
      if (o.details.firstscan) o.details.records.push(i), i.fail || g(o, i), r();else {
        var _e9 = o.db.transaction("files", "readwrite"),
          _s = _e9.objectStore("files"),
          _a = _s.add(i);
        _a.onsuccess = function () {
          i.fail || g(o, i), r();
        }, _a.onerror = function (e) {
          if ("ConstraintError" === _a.error.name) {
            e.stopPropagation(), e.preventDefault();
            var t = _s.put(i);
            t.onsuccess = function () {
              p(o, i.name), i.fail || g(o, i), r();
            }, t.onerror = function () {
              r();
            };
          } else if ("QuotaExceededError" === _a.error.name) {
            e = (65535 & o.version) << 16 | 65535 & l.VERSION;
            var n = indexedDB.open(o.dbname, e);
            n.onsuccess = function () {
              o.db = n.result, r();
            }, n.onerror = function () {
              r();
            }, n.onblocked = function () {
              r();
            };
          } else r();
        };
      }
    }
    s.processingQueue = !0, r();
  }
  function g(e, t) {
    var n = e.details.pendingCreateNotifications;
    n.push(t), (e.batchSize && n.length >= e.batchSize ? m : a)(e);
  }
  function p(e, t) {
    var n = e.details.pendingDeleteNotifications;
    n.push(t), (e.batchSize && n.length >= e.batchSize ? m : a)(e);
  }
  function a(e) {
    var t = e.details;
    t.pendingNotificationTimer && clearTimeout(t.pendingNotificationTimer), t.pendingNotificationTimer = setTimeout(function () {
      m(e);
    }, e.scanning ? e.batchHoldTime : 100);
  }
  function m(e) {
    var t = e.details;
    var n;
    if (t.pendingNotificationTimer && (clearTimeout(t.pendingNotificationTimer), t.pendingNotificationTimer = null), 0 < t.pendingDeleteNotifications.length && (n = t.pendingDeleteNotifications, t.pendingDeleteNotifications = [], v(e, "deleted", n)), 0 === t.pendingCreateNotifications.length && t.firstscan && 0 === t.records.length && v(e, "empty", []), 0 < t.pendingCreateNotifications.length) {
      var _i2 = t.pendingCreateNotifications;
      if (t.pendingCreateNotifications = [], t.firstscan && 0 < t.records.length) {
        var _s2 = e.db.transaction("files", "readwrite"),
          _a2 = _s2.objectStore("files");
        for (var _e0 = 0; _e0 < t.records.length; _e0++) _a2.add(t.records[_e0]);
        t.records.length = 0, _s2.oncomplete = function () {
          v(e, "created", _i2);
        };
      } else v(e, "created", _i2);
    }
  }
  function v(t, e, n) {
    var i = t["on".concat(e)];
    var s = t.details.eventListeners[e];
    if (i || s && 0 !== s.length) {
      var a = {
        type: e,
        target: t,
        currentTarget: t,
        timestamp: Date.now(),
        detail: n
      };
      if ("function" == typeof i) try {
        i.call(t, a);
      } catch (e) {}
      if (s) for (var _e1 = 0; _e1 < s.length; _e1++) try {
        var o = s[_e1];
        "function" == typeof o ? o.call(t, a) : o.handleEvent(a);
      } catch (e) {}
    }
  }
  function b(e, t) {
    if (e.state !== t) switch (e.state = t) {
      case l.READY:
      case l.ENUMERABLE:
        v(e, t);
        break;
      default:
        v(e, "unavailable", t);
    }
  }
  l.prototype = {
    close: function close() {
      this.db.close();
      for (var _e10 = 0; _e10 < this.details.storages.length; _e10++) {
        var t = this.details.storages[_e10];
        t.removeEventListener("change", this.details.dsEventListener);
      }
      b(this, l.CLOSED);
    },
    addEventListener: function addEventListener(e, t) {
      Object.prototype.hasOwnProperty.call(this.details.eventListeners, e) || (this.details.eventListeners[e] = []);
      var n = this.details.eventListeners[e];
      -1 === n.indexOf(t) && n.push(t);
    },
    removeEventListener: function removeEventListener(e, t) {
      if (Object.prototype.hasOwnProperty.call(this.details.eventListeners, e)) {
        var n = this.details.eventListeners[e];
        t = n.indexOf(t);
        -1 !== t && n.splice(t, 1);
      }
    },
    getFileInfo: function getFileInfo(t, e, n) {
      if (this.state === l.OPENING) throw Error("MediaDB is not ready. State: ".concat(this.state));
      var i = this.db.transaction("files", "readonly").objectStore("files").get(t);
      i.onerror = function () {
        var e = "MediaDB.getFileInfo: unknown filename: ".concat(t);
        n && n(e);
      }, i.onsuccess = function () {
        e && e(i.result);
      };
    },
    getFile: function getFile(e, t, n) {
      if (this.state !== l.READY && this.state !== l.ENUMERABLE) throw Error("MediaDB is not ready. State: ".concat(this.state));
      var i = navigator.b2g.getDeviceStorage(this.mediaType),
        s = i.get(e);
      s.onsuccess = function () {
        t(s.result);
      }, s.onerror = function () {
        var e = s.error && s.error.name;
        n && n(e);
      };
    },
    deleteFile: function deleteFile(e, t) {
      if (this.state !== l.READY) throw Error("MediaDB is not ready. State: ".concat(this.state));
      var n = navigator.b2g.getDeviceStorage(this.mediaType),
        i = n.delete(e);
      i.onerror = function (e) {}, i.onsuccess = function () {
        t && t();
      };
    },
    addFile: function addFile(t, n, i, s) {
      if (this.state !== l.READY) throw Error("MediaDB is not ready. State: ".concat(this.state));
      var a = navigator.b2g.getDeviceStorage(this.mediaType),
        e = a.delete(t);
      function o() {
        var e = a.addNamed(n, t);
        e.onsuccess = function () {
          i && i();
        }, e.onerror = function () {
          s && s();
        };
      }
      e.onsuccess = o, e.onerror = o;
    },
    appendFile: function appendFile(e, t, n, i) {
      if (this.state !== l.READY) throw Error("MediaDB is not ready. State: ".concat(this.state));
      var s = navigator.b2g.getDeviceStorage(this.mediaType),
        a = s.appendNamed(t, e);
      a.onsuccess = function () {
        n && n();
      }, a.onerror = function () {
        i && i();
      };
    },
    updateMetadata: function updateMetadata(e, n, i) {
      var _this2 = this;
      if (this.state === l.OPENING) throw Error("MediaDB is not ready. State: ".concat(this.state));
      var s = this.db.transaction("files", "readonly").objectStore("files").get(e);
      s.onerror = function () {}, s.onsuccess = function () {
        var t = {};
        s.result ? t = s.result : t.metadata = {}, Object.keys(n).forEach(function (e) {
          t.metadata[e] = n[e];
        });
        var e = _this2.db.transaction("files", "readwrite").objectStore("files").put(t);
        e.onerror = function () {}, e.onsuccess = function () {
          i && i();
        };
      };
    },
    count: function count(e, t, n) {
      if (this.state !== l.READY && this.state !== l.ENUMERABLE) throw Error("MediaDB is not ready or enumerable. State: ".concat(this.state));
      1 === arguments.length ? (n = e, e = t = void 0) : 2 === arguments.length && (n = t, t = e, e = void 0);
      var i = this.db.transaction("files").objectStore("files");
      e && "name" !== e && (i = i.index(e));
      var s = i.count(t || null);
      s.onerror = function () {}, s.onsuccess = function (e) {
        n(e.target.result);
      };
    },
    enumerate: function enumerate(e, t, n, i) {
      if (this.state !== l.READY && this.state !== l.ENUMERABLE) throw Error("MediaDB is not ready or enumerable. State: ".concat(this.state));
      var s = {
        state: "enumerating"
      };
      1 === arguments.length ? (i = e, e = void 0) : 2 === arguments.length ? (i = t, t = void 0) : 3 === arguments.length && (i = n, n = void 0);
      var a = this.db.transaction("files").objectStore("files");
      e && "name" !== e && (a = a.index(e));
      var o = a.openCursor(t || null, n || "next");
      return o.onerror = function () {
        s.state = "error";
      }, o.onsuccess = function () {
        if ("cancelling" !== s.state) {
          var _t3 = o.result;
          if (_t3) {
            try {
              var e = _t3.value;
              e.fail || i(e);
            } catch (e) {}
            _t3.continue();
          } else s.state = "complete", i(null);
        } else s.state = "cancelled";
      }, s;
    },
    advancedEnumerate: function advancedEnumerate(e, t, n, i, s) {
      if (this.state !== l.READY) throw Error("MediaDB is not ready. State: ".concat(this.state));
      var a = {
        state: "enumerating"
      };
      var o = this.db.transaction("files").objectStore("files");
      e && "name" !== e && (o = o.index(e));
      var r = o.openCursor(t || null, n || "next");
      var c = !1;
      return r.onerror = function () {
        a.state = "error";
      }, r.onsuccess = function () {
        if ("cancelling" !== a.state) {
          var _e11 = r.result;
          if (_e11) try {
            0 === i && (c = !0), !_e11.value.fail && c ? (s(_e11.value), _e11.continue()) : (_e11.advance(i), c = !0);
          } catch (e) {} else a.state = "complete", s(null);
        } else a.state = "cancelled";
      }, a;
    },
    enumerateAll: function enumerateAll(e, t, n, i) {
      var s = [];
      return 1 === arguments.length ? (i = e, e = void 0) : 2 === arguments.length ? (i = t, t = void 0) : 3 === arguments.length && (i = n, n = void 0), this.enumerate(e, t, n, function (e) {
        e ? s.push(e) : i(s);
      });
    },
    cancelEnumeration: function cancelEnumeration(e) {
      "enumerating" === e.state && (e.state = "cancelling");
    },
    getAll: function getAll(n) {
      if (this.state !== l.READY && this.state !== l.ENUMERABLE) throw Error("MediaDB is not ready or enumerable. State: ".concat(this.state));
      var e = this.db.transaction("files").objectStore("files"),
        i = e.mozGetAll();
      i.onerror = function () {}, i.onsuccess = function () {
        var e = i.result;
        var t = e.filter(function (e) {
          return !e.fail;
        });
        n(t);
      };
    },
    scan: function scan() {
      c(this);
    },
    stopScan: function stopScan() {
      this.scanning && (this.stopScanning = !0);
    },
    freeSpace: function freeSpace(e) {
      if (this.state !== l.READY) throw Error("MediaDB is not ready. State: ".concat(this.state));
      var t = navigator.b2g.getDeviceStorage(this.mediaType),
        n = t.freeSpace();
      n.onsuccess = function () {
        e(n.result);
      };
    }
  }, l.VERSION = 3, l.OPENING = "opening", l.UPGRADING = "upgrading", l.ENUMERABLE = "enumerable", l.READY = "ready", l.NOCARD = "nocard", l.UNMOUNTED = "unmounted", l.CLOSED = "closed", e.MediaDB = l;
}(window);
