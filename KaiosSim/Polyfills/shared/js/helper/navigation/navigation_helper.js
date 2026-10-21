function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n2 = 0, F = function F() {}; return { s: F, n: function n() { return _n2 >= r.length ? { done: !0 } : { done: !1, value: r[_n2++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t.return || t.return(); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
var DIR = Object.freeze({
  LEFT: 0,
  RIGHT: 1,
  UP: 2,
  DOWN: 3
});
!function (t) {
  var n = {
    controls: null,
    resetMenu: function resetMenu() {
      var _this = this;
      var n = ">button.menu-button";
      var o = document.querySelector("form[data-subtype=menu]");
      var _loop = function _loop() {
        var e = o.children[_t].id;
        e && 0 === e.indexOf("submenu_") && _this.reset(u, function () {
          return document.querySelectorAll("#".concat(e).concat(n));
        }, 0, e);
      };
      for (var _t = 1; _t < o.children.length; _t++) {
        _loop();
      }
      return this.reset(u, function () {
        return document.querySelectorAll("#mainmenu".concat(n));
      }, 0, "mainmenu");
    },
    reset: function reset(t, n, o, e, u) {
      if (!t) return null;
      if ("function" != typeof n) return null;
      if (this.controls = n(), !this.controls || 0 === this.controls.length) return null;
      t.count = this.controls.length, this.updateNav(t, e);
      o = "function" == typeof o ? o() : 0, o = this.controls[o];
      return u || this.setFocus(o), o;
    },
    setFocus: function setFocus(t) {
      if (t) {
        var _n = document.querySelectorAll(".focus");
        0 < _n.length && _n[0].classList.remove("focus"), t.setAttribute("tabindex", 1), t.classList.add("focus"), "undefined" != typeof inputHandler ? inputHandler.focusChanged(t) : t.focus();
      }
    },
    updateNav: function updateNav(n, o) {
      for (var _t2 = 0; _t2 < this.controls.length; _t2++) {
        var _u = this.controls[_t2];
        _u.setAttribute("data-nav-id", e(_t2)), _u.style.setProperty("--nav-left", e(n.left(_t2))), _u.style.setProperty("--nav-right", e(n.right(_t2))), _u.style.setProperty("--nav-up", e(n.up(_t2))), _u.style.setProperty("--nav-down", e(n.down(_t2))), _u.setAttribute("tabindex", 0);
      }
      function e(t) {
        return (o = void 0 === o ? "" : o) + t;
      }
    },
    elementIsVisible: function elementIsVisible(t, n, o) {
      var e = !0;
      if (0 === t.offsetWidth || 0 === t.offsetHeight) return e;
      var _iterator = _createForOfIteratorHelper(t.getClientRects()),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var _u2 = _step.value;
          if (_u2.bottom + o > window.innerHeight || _u2.top < n) {
            e = !1;
            break;
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      return e;
    },
    scrollToElement: function scrollToElement(t, n, o, e) {
      this.elementIsVisible(t, o, e) || n && "ArrowDown" !== n.key && "ArrowUp" !== n.key || t.scrollIntoView(!1);
    },
    Key2Dir: function Key2Dir(t) {
      var n;
      switch (t) {
        case "ArrowLeft":
          n = DIR.LEFT;
          break;
        case "ArrowRight":
          n = DIR.RIGHT;
          break;
        case "ArrowUp":
          n = DIR.UP;
          break;
        case "ArrowDown":
          n = DIR.DOWN;
      }
      return n;
    }
  };
  var u = {
    count: 0,
    left: function left(t) {
      return t;
    },
    right: function right(t) {
      return t;
    },
    up: function up(t) {
      return 0 === t ? this.count - 1 : t - 1;
    },
    down: function down(t) {
      return this.count - 1 === t ? 0 : t + 1;
    }
  };
  var o = {
      count: 0,
      columnCount: 2,
      left: function left(t) {
        return 0 < t && t < this.count ? --t : this.count - 1;
      },
      right: function right(t) {
        return 0 <= t && t < this.count - 1 ? ++t : 0;
      },
      up: function up(t) {
        var n;
        return (t -= this.columnCount) < 0 && (t += this.columnCount * Math.ceil(this.count / this.columnCount), n = this.count % this.columnCount, (t = (t === this.count || t === this.count + 1 && 1 == n) && 0 != n ? this.count - 1 : t) > this.count && (t -= this.columnCount)), t;
      },
      down: function down(t) {
        t += this.columnCount;
        var n = this.count % this.columnCount;
        return ((t = (t === this.count || t === this.count + 1 && 1 == n) && 0 != n ? this.count - 1 : t) > this.count || t === this.count && 0 == n) && (t %= this.columnCount), t;
      }
    },
    e = {
      count: 0,
      columnCount: 3,
      getGroupInfo: null,
      left: function left(t) {
        return 0 < t && t < this.count ? --t : this.count - 1;
      },
      right: function right(t) {
        return 0 <= t && t < this.count - 1 ? ++t : 0;
      },
      up: function up(n) {
        var o = -1;
        if ("function" != typeof this.getGroupInfo) return o;
        var e = this.getGroupInfo(n, !0),
          u = e.curGroupIndex,
          e = e.destGroupLen;
        if (u >= this.columnCount) o = n - this.columnCount;else {
          o = n - u, 0 === o && (o = this.count);
          var _t3 = e % this.columnCount;
          0 === _t3 && (_t3 = this.columnCount), o -= _t3;
          u = u % this.columnCount;
          u < _t3 ? o += u : e > this.columnCount ? o = o - this.columnCount + u : o += _t3 - 1;
        }
        return o;
      },
      down: function down(t) {
        var n = -1;
        var o = this.getGroupInfo(t, !1),
          e = o.curGroupIndex,
          u = o.curGroupLen;
        return e + this.columnCount < u ? n = t + this.columnCount : (n = t + (u - e), this.count === n && (n = 0), e = e % this.columnCount, n += Math.min(e, o.destGroupLen - 1)), n;
      }
    };
  t.NavigationHelper = n, t.HorizontalNavigator = {
    count: 0,
    left: function left(t) {
      return 0 === t ? this.count - 1 : t - 1;
    },
    right: function right(t) {
      return this.count - 1 === t ? 0 : t + 1;
    },
    up: function up(t) {
      return t;
    },
    down: function down(t) {
      return t;
    }
  }, t.VerticalNavigator = u, t.BoxNavigator = o, t.GroupNavigator = e;
}(window);
