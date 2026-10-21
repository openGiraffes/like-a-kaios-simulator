var FORM_ID = "softkeyPanel",
  SoftkeyPanel = function SoftkeyPanel(t, e, s) {
    function n() {
      var e = !1,
        s = !1,
        i = !1;
      this.menuStartIndex = -1, this.lskIndex = -1, this.cskIndex = -1, this.rskIndex = -1;
      for (var _t = 0; _t < this.actions.length; _t++) {
        var n = this.actions[_t].priority;
        if (n < this.menuActionsPriority) {
          if (e || n !== this.lskPriority) {
            if (s || n !== this.cskPriority) {
              if (!i) {
                _t === this.actions.length - 1 ? this.rskIndex = _t : this.menuStartIndex = _t, i = !0;
                break;
              }
            } else this.cskIndex = _t, s = !0;
          } else this.lskIndex = _t, e = !0;
        } else if (!i) {
          this.menuStartIndex = _t, i = !0;
          break;
        }
      }
    }
    function o() {
      var o = !1;
      function t(t, e, s, i) {
        var n = t[i];
        e.set(s, n), s.innerHTML = (i = (t = n).l10nId ? window.api.l10n.get(t.l10nId) : t.name, e = t.iconMixedText ? i : "", e = t.iconReverse ? "<span data-icon=\"".concat(t.icon, "\"></span>\n           <span data-name=\"").concat(i, "\" class=\"with-icon-right\">").concat(e, "</span>") : "<span data-name=\"".concat(i, "\" class=\"with-icon-left\">").concat(e, "</span>\n           <span data-icon=\"").concat(t.icon, "\"></span>"), t.icon ? e : i), void 0 === n.l10nId ? (n.icon ? s.firstChild : s).removeAttribute("data-l10n-id") : (n.icon ? n.iconReverse ? s.lastChild : s.firstChild : s).setAttribute("data-l10n-id", n.l10nId), o = n.disabled;
      }
      -1 !== this.lskIndex ? t(this.actions, this.handlers, this.buttonLsk, this.lskIndex) : (this.buttonLsk.innerHTML = "", this.buttonLsk.removeAttribute("data-l10n-id"), o = !0), l(this.buttonLsk, o), -1 !== this.cskIndex ? t(this.actions, this.handlers, this.buttonCsk, this.cskIndex) : (this.buttonCsk.innerHTML = "", this.buttonCsk.removeAttribute("data-l10n-id"), o = !0), l(this.buttonCsk, o), -1 !== this.rskIndex ? t(this.actions, this.handlers, this.buttonRsk, this.rskIndex) : o = -1 != this.menuStartIndex ? (this.buttonRsk.setAttribute("data-l10n-id", "softkey-options"), this.buttonRsk.innerHTML = window.api.l10n.get("softkey-options") || "Options", !1) : (this.buttonRsk.innerHTML = "", this.buttonRsk.removeAttribute("data-l10n-id"), !0), l(this.buttonRsk, o), modifyAllString.call(this);
    }
    function i(t) {
      t = this.handlers.get(t);
      if (void 0 !== t) {
        var _e = t.method || function () {};
        _e.apply(null, t.params || []), "function" != typeof this.actions.complete || t.incomplete || this.actions.complete();
      }
    }
    function a() {
      var _this = this;
      if (this.menu) {
        var _t2 = this.menu.hide();
        _t2 && _t2.then(function () {
          _this.menu.subMenuDisplayed || _this.subMenuNeedHide ? (_this.subMenuNeedHide = !1, secondCall = !1) : (_this.menuVisible = !1, o.call(_this), document.dispatchEvent(_this.menuHideEvent), window.dispatchEvent(_this.menuHideEvent));
        });
      }
    }
    function h() {
      this.buttonLsk.innerHTML = "", l(this.buttonLsk, !0), this.buttonCsk.innerHTML = window.api.l10n.get("select"), l(this.buttonCsk, !1), this.buttonRsk.innerHTML = "", l(this.buttonRsk, !0);
    }
    function l(t, e) {
      var s = t.hasAttribute("disabled");
      e && !s ? t.setAttribute("disabled", "disabled") : !e && s && t.removeAttribute("disabled");
    }
    t && t.items && 0 !== t.items.length && (this.softKeyArea = s || document.body, this.subMenuNeedHide = !1, this.initSoftKeyPanel = function (t) {
      var _this2 = this;
      this.handleDelay && (this.pause = !0), t && t.items && 0 < t.items.length && (this.actions && this.actions.items && 0 < this.actions.items.length && this.actions.clear(), this.actions = t.items, this.header = t.header || "header", this.handlers.clear(), this.stopListener(), n.call(this), o.call(this), this.startListener()), this.handleDelay && setTimeout(function () {
        _this2.pause = !1;
      }, 200);
    }, this.startListener = function () {
      window.addEventListener("keydown", this.keyDownHandler, !0), window.addEventListener("menuChangeEvent", this.keyDownHandler);
    }, this.stopListener = function () {
      window.removeEventListener("keydown", this.keyDownHandler, !0), window.removeEventListener("menuChangeEvent", this.keyDownHandler);
    }, this.keyDownHandler = function (t) {
      if (this.form && (this.form.classList.contains("visible") || this.menuVisible)) {
        if (("Enter" === t.key || "Accept" === t.key) && this.menuVisible && this.menu) {
          var e = this.menu.form.querySelector(".focus");
          var _t3 = !1;
          return null !== e && (_t3 = e.dataset.hasmenu || !1), void (this.menu && !_t3 && a.call(this));
        }
        if (!("SoftRight" === t.key && "undefined" != typeof NavigationMap && NavigationMap.disableSoftRight || this.pause || "undefined" != typeof NavigationMap && 0 < NavigationMap.currentActivatedLength)) {
          switch (t.key) {
            case "BrowserSearch":
            case "F2":
            case "SoftRight":
              if (this.menuVisible || !this.softKeyVisible) break;
              -1 === this.menuStartIndex ? i.call(this, this.buttonRsk) : function () {
                var _this3 = this;
                if (!document.querySelector("gaia-confirm")) {
                  h.call(this);
                  var _t4 = null;
                  var _e2 = {
                    header: this.header,
                    items: this.actions.slice(this.menuStartIndex).sort(function (t, e) {
                      return t.priority - e.priority;
                    }),
                    classes: ["group-menu", "softkey"],
                    menuClassName: this.menuClassName
                  };
                  if ("undefined" == typeof OptionMenu) {
                    var _s = ["http://shared.localhost/style/commons/action_menu.css", "http://shared.localhost/style/commons/option_menu.css"];
                    window.OptionMenu || _s.push("http://shared.localhost/js/helper/option_menu/option_menu.js"), LazyLoader.load(_s, function () {
                      _this3.menu = new OptionMenu(_e2, _this3.optionMenuCallback), _t4 = _this3.menu.show(), _t4 && _t4.then(function () {
                        h.call(_this3), modifyAllString.call(_this3), document.dispatchEvent(_this3.menuShowEvent), window.dispatchEvent(_this3.menuShowEvent);
                      });
                    });
                  } else secondCall = !1, this.menu = new OptionMenu(_e2, this.optionMenuCallback), _t4 = this.menu.show(), _t4 && _t4.then(function () {
                    h.call(_this3), modifyAllString.call(_this3), document.dispatchEvent(_this3.menuShowEvent), window.dispatchEvent(_this3.menuShowEvent);
                  });
                  this.menuVisible = !0;
                }
              }.call(this), t.preventDefault(), t.stopPropagation();
              break;
            case "F1":
            case "SoftLeft":
              !this.menuVisible && this.softKeyVisible && (i.call(this, this.buttonLsk), t.preventDefault());
              break;
            case "Enter":
            case "Accept":
              if (this.menuVisible) a.call(this);else {
                if (!this.softKeyVisible) break;
                i.call(this, this.buttonCsk);
              }
              break;
            case "BrowserBack":
            case "Backspace":
              this.menuVisible && t.preventDefault(), this.menu && this.menu.subMenuDisplayed && (this.subMenuNeedHide = !0), a.call(this);
          }
          null !== t.detail && "closeMenu" === t.detail.action && a.call(this);
        }
      }
    }.bind(this), this.createPanel = function (t) {
      var e = document.createElement("div"),
        s = document.createElement("div"),
        i = document.createElement("div");
      this.buttonLsk = document.createElement("button"), this.buttonLsk.className = "sk-button", this.buttonLsk.setAttribute("id", "software-keys-left"), this.buttonCsk = document.createElement("button"), this.buttonCsk.className = "sk-button", this.buttonCsk.setAttribute("id", "software-keys-center"), this.buttonRsk = document.createElement("button"), this.buttonRsk.className = "sk-button", this.buttonRsk.setAttribute("id", "software-keys-right"), t.appendChild(e), t.appendChild(s), t.appendChild(i), e.appendChild(this.buttonLsk), s.appendChild(this.buttonCsk), i.appendChild(this.buttonRsk), n.call(this), o.call(this), this.startListener();
    }, this.hideMenu = function () {
      a.call(this);
    }, this.handlers = new Map(), this.menuActionsPriority = 4, this.actions = t.items, this.header = t.header || "header", this.optionMenuCallback = e, this.handleDelay = !!t.handleDelay, this.pause = !1, this.menuClassName = t.menuClassName, void 0 === this.menuClassName && (this.menuClassName = "menu-button"), this.menu = null, this.menuShowEvent = new CustomEvent("menuEvent", {
      detail: {
        softkeyPanel: this,
        menuName: this.menuClassName,
        menuVisible: !0
      }
    }), this.menuHideEvent = new CustomEvent("menuEvent", {
      detail: {
        softkeyPanel: this,
        menuName: this.menuClassName,
        menuVisible: !1
      }
    }), this.menuVisible = !1, this.softKeyVisible = !1, this.lskPriority = 1, this.cskPriority = 2, this.form = function (t) {
      var _this4 = this;
      var e = document.createElement("form");
      return e.id = t, e.dataset.type = this.actions.type || "action", e.className = "skbar", e.classList.add("none-paddings"), e.setAttribute("data-z-index-level", "softkeyPanel"), e.addEventListener("updateKeyInfo", function () {
        modifyAllString.call(_this4);
      }), e.addEventListener("submit", function (t) {
        t.preventDefault();
      }), e.addEventListener("transitionend", function (t) {
        t.target === e && !e.classList.contains("visible") && e.parentNode && (_this4.softKeyArea || document.body).removeChild(e);
      }), e;
    }.call(this, FORM_ID), this.createPanel(this.form), this.getLeftKey = function () {
      return this.buttonLsk;
    }, this.getRightKey = function () {
      return this.buttonRsk;
    }, this.getCenterKey = function () {
      return this.buttonCsk;
    });
  };
function updateNextSoftkeyPanelKeysInfo() {
  var t = document.querySelectorAll("#softkeyPanel.visible.focused");
  if (t.length) {
    var e = t[t.length - 1];
    e.dispatchEvent(new CustomEvent("updateKeyInfo"));
  }
}
function modifyAllString() {
  var t = [];
  0 < this.buttonLsk.innerHTML.length && t.push(getInfoFromButton(this.buttonLsk, this)), 0 < this.buttonCsk.innerHTML.length && t.push(getInfoFromButton(this.buttonCsk, this)), 0 < this.buttonRsk.innerHTML.length && t.push(getInfoFromButton(this.buttonRsk, this));
  var e = document.querySelectorAll("#softkeyPanel.visible.focused");
  e.length && e[e.length - 1] === this.form && window.registerSoftkeys && window.registerSoftkeys(t);
}
function getInfoFromButton(t, e) {
  var s = {};
  switch (t) {
    case e.buttonLsk:
      s.code = "SoftLeft";
      break;
    case e.buttonCsk:
      s.code = "Enter";
      break;
    case e.buttonRsk:
      s.code = "SoftRight";
  }
  var i = t.querySelector("span");
  return i ? (e = i.dataset.name, s.options = {
    name: e || "",
    icon: i.dataset.icon
  }) : s.options = {
    name: t.textContent,
    icon: ""
  }, s;
}
SoftkeyPanel.prototype.show = function () {
  this.form.parentNode || (this.softKeyArea || document.body).appendChild(this.form), this.form.classList.remove("inactive"), this.form.classList.add("visible", "focused"), this.softKeyVisible = !0, this.form.focus(), modifyAllString.call(this);
}, SoftkeyPanel.prototype.hide = function () {
  this.form.classList.remove("visible", "focused"), this.softKeyVisible = !1, window.registerSoftkeys && window.registerSoftkeys([]), updateNextSoftkeyPanelKeysInfo();
}, SoftkeyPanel.prototype.destroy = function () {
  (this.softKeyArea || document.body).removeChild(this.form), this.form = null, this.stopListener(), this.softKeyVisible = !1, this.menuVisible = !1;
}, window.registerSoftkeys || LazyLoader.load("http://shared.localhost/js/helper/softkey/softkey_register.js"), window.SoftkeyPanel = SoftkeyPanel;
