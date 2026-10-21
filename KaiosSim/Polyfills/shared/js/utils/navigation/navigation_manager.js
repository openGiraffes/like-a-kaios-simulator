function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
!function (t) {
  var l = null;
  function e() {
    this.context = {}, this.currentSelector = void 0, this.nextId = this.generatorId(0), document.addEventListener("focusChanged", this.focusChandedHandler.bind(this));
  }
  e.prototype.CLASS_NAME = "NavigationManager", e.prototype.DEBUG = !1, e.prototype.init = function (t) {
    this.config = t || {
      clickHandler: void 0
    }, window.addEventListener("keydown", this.keyHandler.bind(this));
  }, e.prototype.keyHandler = function (t) {
    var e = t.target,
      n = null,
      o = null;
    var r;
    if ((this.debug("key ".concat(t.key)), !(NavigationMap && NavigationMap.currentActivatedLength && 0 < NavigationMap.currentActivatedLength)) && e) if ("Enter" === t.key || "Accept" === t.key) this.click(e), this.dispatchEvent("accepted", {
      acceptedEl: e
    });else if (e.classList && (e.classList.contains("focus") || (this.debug("event target does not have focus"), e = document.querySelector(".focus")), n = this.findElementFromNavProp(e, t), n && (o = document.querySelectorAll(".focus"), n !== o[0]))) {
      o.length && o[0].classList.remove("focus"), (r = this.scrollToElement) && r.constructor && r.call && r.apply ? this.scrollToElement(n, t) : n.scrollIntoView(!1), n.classList.add("focus"), l = n;
      var i = n.querySelector('input[type="text"]');
      (i || n).focus(), this.dispatchEvent("focusChanged", {
        focusedElement: n
      });
    }
  }, e.prototype.findElementFromNavProp = function (t, e) {
    if (!t) return null;
    var n = null;
    var o = t.style;
    var r = !0;
    switch (e.key) {
      case "ArrowLeft":
        n = o.getPropertyValue("--nav-left");
        break;
      case "ArrowRight":
        n = o.getPropertyValue("--nav-right");
        break;
      case "ArrowUp":
        n = o.getPropertyValue("--nav-up");
        break;
      case "ArrowDown":
        n = o.getPropertyValue("--nav-down");
        break;
      case "Home":
      case "MozHomeScreen":
        n = o.getPropertyValue("--nav-home");
        break;
      default:
        r = !1;
    }
    if (!n) return null;
    r && e.preventDefault();
    e = "[data-nav-id=\"".concat(n, "\"]");
    return document.querySelector(e);
  }, e.prototype.click = function (t) {
    this.config.clickHandler ? this.config.clickHandler(t) : t.click();
  }, e.prototype.dispatchEvent = function (t, e) {
    document.dispatchEvent(new CustomEvent(t, e ? {
      detail: e
    } : {}));
  }, e.prototype.focusChandedHandler = function (t) {
    var e = t.detail.focusedElement,
      n = e && e.getAttribute("data-nav-id");
    e && this.currentSelector && (this.context[this.currentSelector] = n);
  }, e.prototype.generatorId = function (t) {
    var e = t;
    return function () {
      return e++;
    };
  }, e.prototype.delNavId = function (t) {
    t = document.querySelectorAll(t);
    t.length && Array.prototype.forEach.call(t, function (t) {
      return t.removeAttribute("data-nav-id");
    });
  }, e.prototype.initNavId = function (t) {
    var _this = this;
    Array.prototype.forEach.call(t, function (t) {
      t.getAttribute("data-nav-id") || t.setAttribute("data-nav-id", _this.nextId());
    });
  }, e.prototype.prepareElements = function (t) {
    if (!t) throw Error("selector is undefined");
    var e = document.querySelectorAll(t);
    var n = Array.prototype.slice.call(document.querySelectorAll(".focus"));
    var o = n.length;
    if (this.currentSelector = t, this.debug("items.length ".concat(e.length)), !e.length) return this.dispatchEvent("focusChanged", {
      focusChanged: null
    }), null;
    if (o) for (var _t = 0; _t < o; _t++) n[_t].classList.remove("focus");
    return this.initNavId(e), e;
  }, e.prototype.reset = function (e, n, o, r) {
    var i = this.prepareElements(e);
    if (l = null, i) {
      var _i = i,
        _i2 = _slicedToArray(_i, 1),
        _t2 = _i2[0];
      n && (i = document.querySelector("[data-nav-id=\"".concat(n, "\"]"))) && (_t2 = i), this.context[e] = _t2.dataset.navId, this.setFocus(_t2), r || this.update(e, o);
    }
  }, e.prototype.unfocus = function () {
    var t = Array.prototype.slice.call(document.querySelectorAll(".focus"));
    t.forEach(function (t) {
      t.classList.remove("focus");
    });
  }, e.prototype.resetByNode = function (n, o, r) {
    var i = this.prepareElements(n);
    if (l = null, i) {
      var _i3 = _slicedToArray(i, 1),
        _t3 = _i3[0],
        _e = null;
      if (o) {
        if (_e = Array.prototype.slice.call(document.querySelectorAll(n)), !_e.some(function (t) {
          return t === o;
        })) return;
        _t3 = o;
      }
      this.context[n] = _t3.dataset.navId, this.setFocus(_t3), this.update(n, r);
    }
  }, e.prototype.update = function (t, e) {
    var n = null,
      o = 0,
      r = null,
      i = null;
    if (document.querySelectorAll(".focus").length) {
      if (!t) throw Error("selector is undefined");
      var l = document.querySelectorAll(t);
      if (this.debug("items.length ".concat(l.length)), this.initNavId(l), l.length <= 1) (n = l[0]) && (n.style.removeProperty("--nav-down"), n.style.removeProperty("--nav-up"));else if (this.debug("".concat(t, ".length = ").concat(l.length)), e = e || "vertical", "function" != typeof this.doUpdateCb) switch (e) {
        case "vertical":
          for (o = 0; o < l.length; o++) n = l[o], i = l[o - 1] || l[l.length - 1], r = l[o + 1] || l[0], n.style.setProperty("--nav-down", r.getAttribute("data-nav-id")), n.style.setProperty("--nav-up", i.getAttribute("data-nav-id"));
          break;
        case "horizontal":
          for (o = 0; o < l.length; o++) n = l[o], i = l[o - 1] || l[l.length - 1], r = l[o + 1] || l[0], n.style.setProperty("--nav-right", r.getAttribute("data-nav-id")), n.style.setProperty("--nav-left", i.getAttribute("data-nav-id"));
      } else this.doUpdateCb(l);
    } else this.reset(t);
  }, e.prototype._linkToUp = function (t, e) {
    t.style.setProperty("--nav-up", e.getAttribute("data-nav-id"));
  }, e.prototype._linkToDown = function (t, e) {
    t.style.setProperty("--nav-down", e.getAttribute("data-nav-id"));
  }, e.prototype._linkToLeft = function (t, e) {
    t.style.setProperty("--nav-left", e.getAttribute("data-nav-id"));
  }, e.prototype._linkToRight = function (t, e) {
    t.style.setProperty("--nav-right", e.getAttribute("data-nav-id"));
  }, e.prototype.appendToList = function (e, n, t) {
    var _this2 = this;
    var o = e.children.length,
      r = n.length;
    n.forEach(function (t) {
      e.appendChild(t), t.setAttribute("data-nav-id", _this2.nextId());
    });
    var i = null,
      l = null;
    switch (t = t || "vertical") {
      case "vertical":
        l = this._linkToUp, i = this._linkToDown;
        break;
      case "horizontal":
        l = this._linkToLeft, i = this._linkToRight;
    }
    if (o ? (l(n[0], e.children[o - 1]), i(n[r - 1], e.children[0]), i(e.children[o - 1], n[0]), l(e.children[0], n[r - 1])) : (l(n[0], n[r - 1]), i(n[r - 1], n[0])), 1 < r) {
      i(n[0], n[1]), l(n[r - 1], n[r - 2]);
      for (var _t4 = 1; _t4 < r - 2; _t4++) l(n[_t4], n[_t4 - 1]), i(n[_t4], n[_t4 + 1]);
    }
  }, e.prototype.setFocus = function (t) {
    t.classList.add("focus"), t.focus(), l = t, this.dispatchEvent("focusChanged", {
      focusedElement: t
    });
  }, e.prototype.getElementByNavId = function (t) {
    return document.querySelector("[data-nav-id=\"".concat(t, "\"]"));
  }, e.prototype.switchContext = function (t, e, n) {
    if (!t) throw Error("selector is undefined");
    e = e || this.context[t];
    this.reset(t, e, n);
  }, e.prototype.debug = function (t) {
    this.DEBUG;
  }, e.prototype.getFocusedEl = function () {
    return l;
  }, t.NavigationManager = new e();
}(window);
