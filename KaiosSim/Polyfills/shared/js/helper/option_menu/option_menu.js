function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n3 = 0, F = function F() {}; return { s: F, n: function n() { return _n3 >= r.length ? { done: !0 } : { done: !1, value: r[_n3++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t.return || t.return(); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
var SUB_MENU_PREFIX = "submenu_";
var secondCall = !1;
var OptionMenu = function OptionMenu(a, e) {
  if (a && a.items && 0 !== a.items.length) {
    var d = function d(n) {
      if (!secondCall) {
        secondCall = !0;
        var _i = n.target;
        if ("true" === _i.dataset.hasmenu) return c.subMenuDisplayed = !0, function (t) {
          var e = SUB_MENU_PREFIX + t.id,
            n = function (e) {
              for (var _t = 1; _t < c.form.children.length; _t++) {
                var n = c.form.children[_t];
                if (n.id === e) return n;
              }
              return null;
            }(e);
          n && setTimeout(function () {
            c.toggleMainMenu(!1), m.classList.add("submenu-displayed"), t.classList.add("submenu-owner"), n.classList.remove("hidden"), c._setFocus(n.children[1]);
          }, 400);
        }(_i), void (secondCall = !1);
        var _t2 = r.get(_i),
          _e;
        if (!_t2 && "menu" === _i.tagName.toLowerCase()) {
          var _s = _i.querySelector(".focus");
          _s && (_s.focus(), _t2 = r.get(_s));
        }
        void 0 !== _t2 && (_e = _t2.method || function () {}, _e.apply(null, _t2.params || []), c.hide(), "function" != typeof a.complete || _t2.incomplete || a.complete());
      }
    };
    this.optionMenuCallback = e;
    var r = new WeakMap(),
      l = [],
      u = {};
    var o = a.menuClassName;
    o = o || "menu-button";
    var c = this,
      i = document.getElementById("option-menu");
    i && i.parentNode && i.remove();
    var t = null;
    this.form = document.createElement("form"), this.form.id = "option-menu", this.form.dataset.type = a.type || "action", this.form.dataset.subtype = "menu", this.form.setAttribute("role", "dialog"), this.form.tabIndex = -1, this.subMenuDisplayed = !1;
    var s = this.form.classList;
    if (a.classes && s.add.apply(s, a.classes), a.section) {
      var h = document.createElement("section");
      "string" == typeof a.section ? h.textContent = a.section || "" : h.appendChild(a.section), this.form.appendChild(h);
    }
    !function (t) {
      var _iterator = _createForOfIteratorHelper(t),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var _n = _step.value;
          var e = _n.fid;
          e ? u[e] ? u[e].push(_n) : u[e] = [_n] : l.push(_n);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }(a.items);
    var m = document.createElement("menu");
    m.id = "mainmenu", m.dataset.items = l.length, a.header && (t = document.createElement("h1"), "string" == typeof a.header ? t.textContent = a.header || "" : a.header.l10nId ? t.setAttribute("data-l10n-id", a.header.l10nId) : t.appendChild(a.header), this.form.appendChild(t));
    var n;
    l.forEach(function (t) {
      var e = document.createElement("button");
      if (e.type = "button", e.classList.add(o), e.classList.add("p-pri"), t.id && (e.id = t.id), t.l10nId) window.api.l10n.setAttributes(e, t.l10nId, t.l10nArgs), "" === e.textContent && (e.textContent = t.name || "");else {
        if (!t.name || !t.name.length) return;
        e.textContent = t.name || "";
      }
      t.disable && e.classList.add("disabled"), m.appendChild(e), n || (e.id || (e.id = "option-menu-first-item"), n = e.id), t.incomplete = t.incomplete || !1, r.set(e, t);
    }), this.form.addEventListener("submit", function (t) {
      t.preventDefault();
    }), this.form.addEventListener("transitionend", function (t) {
      t.target === this.form && (this.form.classList.contains("visible") ? this.form.focus() : this.form.parentNode && this.form.remove(), document.body.classList.remove("dialog-animating"), window.NavigationMap && (NavigationMap.lockNavigation = !1));
    }.bind(this)), m.addEventListener("click", d), this.form.appendChild(m), t && (t.setAttribute("role", "heading"), t.setAttribute("aria-labelledby", n)), function () {
      for (var _e2 in u) {
        var t = u[_e2];
        if (Array.isArray(t) && 0 !== t.length) {
          var _n2 = document.createElement("menu");
          _n2.id = SUB_MENU_PREFIX + _e2, _n2.setAttribute("fid", _e2), _n2.dataset.subtype = "submenu", _n2.dataset.items = t.length, _n2.classList.add("hidden"), _n2.setAttribute("role", "heading"), _n2.setAttribute("aria-labelledby", "sub-menu-header"), function (t, e) {
            var n = l.find(function (t) {
              return t.id === e;
            });
            if (n) {
              var _i2 = document.createElement("header");
              _i2.id = "sub-menu-header", _i2.setAttribute("role", "heading"), n.l10nId ? window.api.l10n.setAttributes(_i2, n.l10nId, n.l10nArgs) : _i2.textContent = n.name, t.appendChild(_i2);
            }
          }(_n2, _e2);
          var _iterator2 = _createForOfIteratorHelper(t),
            _step2;
          try {
            for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
              var _i3 = _step2.value;
              var _s2 = document.createElement("button");
              _s2.type = "button", _s2.classList.add(o), _s2.classList.add("p-pri"), _i3.id && (_s2.id = _i3.id), _i3.l10nId ? window.api.l10n.setAttributes(_s2, _i3.l10nId, _i3.l10nArgs) : _s2.textContent = _i3.name, _i3.incomplete = _i3.incomplete || !1, r.set(_s2, _i3), _n2.appendChild(_s2);
            }
          } catch (err) {
            _iterator2.e(err);
          } finally {
            _iterator2.f();
          }
          _n2.addEventListener("click", function (t) {
            this.subMenuDisplayed = !1, d(t);
          }.bind(this)), this.form[_e2].dataset.hasmenu = "true", this.form.appendChild(_n2);
        }
      }
    }.call(this);
  }
};
OptionMenu.prototype._setFocus = function (t) {
  var e = document.querySelector(".focus");
  e && e.classList.remove("focus"), t.setAttribute("tabindex", 1), t.classList.add("focus"), t.focus();
}, OptionMenu.prototype.show = function () {
  return window.NavigationMap && (NavigationMap.lockNavigation = !0), document.activeElement && document.activeElement.blur(), this.form.parentNode || (document.body.appendChild(this.form), this.form.clientTop), this.form.classList.add("visible"), document.body.classList.add("dialog-animating", "show-option"), this.optionMenuCallback && this.optionMenuCallback(!0), this.form.addEventListener("transitionstart", function t() {
    this.removeEventListener("transitionstart", t);
    var e = document.getElementById("mainmenu");
    var n = this.querySelector("h1");
    n.setAttribute("style", "bottom:".concat(e.offsetHeight, "px"));
  }), Promise.resolve();
}, OptionMenu.prototype.toggleMainMenu = function (t) {
  var e = this.form.querySelector("h1"),
    n = this.form.querySelector("#mainmenu");
  t ? (n.classList.remove("hidden"), e.classList.remove("hidden")) : (n.classList.add("hidden"), e.classList.add("hidden"));
}, OptionMenu.prototype.hide = function () {
  var _this = this;
  if (this.form.classList.contains("visible")) {
    if (this.subMenuDisplayed) {
      var t = document.querySelector("form[data-subtype=menu] > menu > button.submenu-owner");
      if (t) {
        var e = document.getElementById(SUB_MENU_PREFIX + t.id);
        if (e) return e.classList.add("hidden"), t.classList.remove("submenu-owner"), t.parentElement.classList.remove("submenu-displayed"), this.subMenuDisplayed = !1, this.toggleMainMenu(!0), this._setFocus(t), secondCall = !1, new Promise(function (t) {
          t();
        });
      }
    }
    return this.form.setAttribute("aria-hidden", "true"), this.form.classList.remove("visible"), this.optionMenuCallback && this.optionMenuCallback(!1), setTimeout(function () {
      document.body.classList.remove("show-option");
    }, 10), new Promise(function (t) {
      var e = setTimeout(function () {
        t();
      }, 300);
      _this.form.addEventListener("transitionend", function () {
        e && clearTimeout(e), t();
      });
    });
  }
}, window.OptionMenu = OptionMenu;
