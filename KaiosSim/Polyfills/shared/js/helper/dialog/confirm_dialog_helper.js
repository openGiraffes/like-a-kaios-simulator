function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
!function () {
  var e = ["http://shared.localhost/elements/gaia_confirm/gaia_confirm.js"];
  window.ComponentUtils || e.push("http://shared.localhost/js/utils/components/component_utils.js");
  var l;
  var o = new SoftkeyPanel({
    menuClassName: "menu-button",
    items: [{
      name: "",
      priority: 1,
      method: function method() {}
    }]
  });
  function t(t) {
    this.config = t;
  }
  o.hide(), t.prototype = {
    activeElement: null,
    deltaTop: 100,
    Softkey: o,
    isShown: !1,
    show: function show(t) {
      LazyLoader.load(e, this._show.bind(this, t));
    },
    _show: function _show(t) {
      var e = this.config;
      var n = this;
      if (NavigationMap && -1 < NavigationMap.currentActivatedLength) {
        if (NavigationMap.currentActivatedLength) return void setTimeout(function () {
          n.show(t);
        }, 600);
        NavigationMap.currentActivatedLength = 1;
      }
      n.parent = t, n.activeElement = document.activeElement;
      var i = document.createElement("div");
      e.cancel;
      var s = e.system ? "insystem" : "",
        o = e.extraClass || "",
        a = "font-weight: normal;word-wrap: break-word;margin: 0;padding: 1rem;line-height: 2.4rem;color: var(--color-gs90);background: var(--color-gs10);";
      i.innerHTML = "<gaia-confirm role=\"menuitem\" tabindex=\"-1\" class=".concat(s, " ").concat(o, ">") + '<h1 slot="title" style="text-align:center;"></h1><div slot="content" class="content"><div>' + "<p style=\"".concat(a, "\"></p>") + "<p class=\"noborder\" style=\"".concat(a, "\" hidden></p>") + "</div></div></gaia-confirm>";
      var c = i.firstElementChild;
      this.element = c, l = c, c.dataset.type = e.type, c.addEventListener("confirm", this), c.addEventListener("cancel", this), c.addEventListener("accept", this), window.addEventListener("keydown", this), window.addEventListener("hashchange", this);
      var _c$querySelectorAll = c.querySelectorAll("p"),
        _c$querySelectorAll2 = _slicedToArray(_c$querySelectorAll, 2),
        r = _c$querySelectorAll2[0],
        h = _c$querySelectorAll2[1];
      a = function a(t, e) {
        "string" == typeof e && window.api.l10n.setAttributes(t, e), e.id ? window.api.l10n.setAttributes(t, e.id, e.args) : e.text && (t.textContent = e.text);
      };
      a(c.querySelector("h1"), e.title), a(r, e.body), e.body.html && (r.innerHTML = e.body.html), e.title.id || e.title.text || (c.querySelector("h1").hidden = !0), e.desc || e.desc && "" !== e.desc ? (h.hidden = !1, a(h, e.desc)) : h.hidden = !0, c.setAttribute("hidden", ""), t.appendChild(c), n.activeElement.blur(), window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          c.removeAttribute("hidden"), n.scrollContext("ArrowUp"), n.element.addEventListener("transitionend", function t() {
            var e;
            n.input && (e = n.input.value.length, n.input.focus(), n.input.setSelectionRange(e, e), n.input.oninput = function () {
              n.updateSoftkey();
            }), n.element.removeEventListener("transitionend", t), n.isShown = !0;
          }), window.dispatchEvent(new CustomEvent("gaia-confirm-open"));
        });
      }), this.input = c.querySelector("input"), this.updateSoftkey();
    },
    updateSoftkey: function updateSoftkey() {
      var t = {
        menuClassName: "menu-button",
        header: {},
        items: []
      };
      var e = !this.input || 0 < this.input.value.trim().length;
      this.config.cancel && t.items.push({
        name: "",
        priority: 1,
        l10nId: this.config.cancel.l10nId,
        method: function method() {}
      }), this.config.accept && t.items.push({
        name: "",
        priority: 2,
        l10nId: this.config.accept.l10nId,
        icon: this.config.accept.icon || null,
        method: function method() {}
      }), this.config.confirm && e && t.items.push({
        name: "",
        priority: 3,
        l10nId: this.config.confirm.l10nId,
        method: function method() {}
      }), o.initSoftKeyPanel(t), o.show();
    },
    close: function close() {
      this.destroy(), o.hide();
    },
    destroy: function destroy() {
      var _this = this;
      this.element && this.isShown && (NavigationMap && -1 < NavigationMap.currentActivatedLength && (NavigationMap.currentActivatedLength = 0), this.activeElement.focus(), window.removeEventListener("hashchange", this), window.removeEventListener("keydown", this), this.element.addEventListener("transitionend", function (t) {
        t.target === _this.element && (_this.element.parentNode.removeChild(_this.element), _this.element = null, _this.isShown = !1, window.dispatchEvent(new CustomEvent("gaia-confirm-close")));
      }), this.element.setAttribute("hidden", ""));
    },
    scrollContext: function scrollContext(t) {
      var e = this.parent.querySelector("div.content");
      var n = this.parent.querySelector("h1").clientHeight,
        n = document.body.clientHeight - this.getSoftkeyHeight() - this.getStatusBarHeight() - n;
      e.style.maxHeight = "".concat(n, "px"), e.clientHeight < n ? this.scroll = !1 : e.scrollTop = "ArrowUp" === t ? e.scrollTop - this.deltaTop : e.scrollTop + this.deltaTop;
    },
    getSoftkeyHeight: function getSoftkeyHeight() {
      var t = 0;
      var e = document.querySelector("#".concat(FORM_ID));
      return e && e.classList.contains("visible") && (t = e.clientHeight), t;
    },
    getStatusBarHeight: function getStatusBarHeight() {
      var t = getComputedStyle(document.body);
      return parseFloat(t.fontSize) * (parseFloat(t.getPropertyValue("--statusbar-height")) + 2);
    },
    handleEvent: function handleEvent(t) {
      switch (t.type) {
        case "hashchange":
          break;
        case "confirm":
          {
            var _e = this.config.confirm.callback;
            var _t = null;
            this.input && (_t = this.input.value.trim()), this.destroy(), _e && _e(_t);
            break;
          }
        case "cancel":
          {
            this.destroy();
            var n = this.config.cancel.callback;
            n && n();
            break;
          }
        case "accept":
          {
            this.destroy();
            var i = this.config.accept.callback;
            i && i();
            break;
          }
      }
      switch (t.key) {
        case "BrowserBack":
        case "KanjiMode":
        case "Backspace":
          {
            o.hide(), this.destroy();
            var s = this.config.backcallback;
            s && s(), t.preventDefault(), t.stopPropagation();
            break;
          }
        case "Enter":
        case "Accept":
          this.config.accept && (o.hide(), this.element.dispatchEvent(new CustomEvent("accept")));
          break;
        case "ContextMenu":
        case "SoftLeft":
        case "F1":
          this.config.cancel && this.isShown && (o.hide(), this.element.dispatchEvent(new CustomEvent("cancel")));
          break;
        case "ArrowUp":
        case "ArrowDown":
          this.scrollContext(t.key), t.preventDefault(), t.stopPropagation();
          break;
        case "BrowserSearch":
        case "SoftRight":
        case "F2":
          if (this.input && this.input.value.trim().length < 1) break;
          this.config.confirm && this.isShown && (o.hide(), this.element.dispatchEvent(new CustomEvent("confirm")));
      }
    }
  }, window.ConfirmDialogHelper = t;
}(window);
