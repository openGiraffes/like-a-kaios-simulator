!function (t) {
  var e = {
      leftKeyState: "",
      _cacheParams: null
    },
    s = function s(t) {
      return t.charAt(0).toUpperCase() + t.slice(1);
    };
  function o() {
    this.option = {}, this.optionParams = Object.create(null), this.softkeyPanel = void 0, this.optionsCallback = void 0, this.lastParamName = void 0;
  }
  o.prototype.stopKeyEvents = function () {
    this.softkeyPanel.stopListener();
  }, o.prototype.startKeyEvents = function () {
    this.softkeyPanel.startListener();
  }, o.prototype.setOptionMenuCallBack = function (t) {
    this.optionsCallback = t;
  }, o.prototype._initSoftKeyPanel = function () {
    if (!this.softkeyPanel) return "undefined" != typeof SoftkeyHelper ? (SoftkeyHelper.init(this._params, this.optionsCallback), this.softkeyPanel = SoftkeyHelper.getSoftkey()) : this.softkeyPanel = new SoftkeyPanel(this._params, this.optionsCallback), void this.softkeyPanel.show();
    this.softkeyPanel.initSoftKeyPanel(this._params);
  }, o.prototype.show = function (t) {
    this.lastParamName = t, this.softkeyPanel && (this.softkeyPanel.form, 1) && !this.softkeyPanel.softKeyVisible && this.softkeyPanel.show();
    try {
      this.optionParams[t] && (this._params = this.getValidParams(t), window.api.l10n.once(this._initSoftKeyPanel.bind(this)));
    } catch (t) {}
  }, o.prototype.getValidParams = function (t) {
    var e = this.optionParams[t];
    if (void 0 === e.items) return e;
    var s = {},
      o = [];
    for (var n in e) s[n] = e[n];
    for (var _t = 0; _t < s.items.length; _t++) {
      var i = s.items[_t];
      (i.l10nId || i.name && i.name.length || i.icon) && o.push(i);
    }
    return s.items = o, s;
  }, o.prototype.popAndRemoveElement = function (e, s) {
    var o;
    return e.forEach(function (t) {
      t.name !== s || 0 <= (t = e.indexOf(t)) && (o = e.splice(t, 1));
    }), o && o[0] || void 0;
  }, o.prototype.getParams = function (t) {
    return this.optionParams[t];
  }, o.prototype.getLastParamName = function () {
    return this.lastParamName;
  }, o.prototype.compare = function (t, e) {
    return t.priority - e.priority;
  }, o.prototype.swapParams = function (t, e, s, o) {
    var i = this.getParams(t);
    e = this.popAndRemoveElement(i.items, e);
    e && (i.hidenItems.push(e), i.items.push(this.popAndRemoveElement(i.hidenItems, s)), i.items.sort(this.compare), o && this.show(t));
  }, o.prototype.showParams = function (t, e, s) {
    var o = this.getParams(t);
    e = this.popAndRemoveElement(o.hidenItems, e);
    e && o.items.push(e), o.items.sort(this.compare), s && this.show(t);
  }, o.prototype.hideParams = function (t, e, s) {
    var o = this.getParams(t);
    e = this.popAndRemoveElement(o.items, e);
    e && o.hidenItems.push(e), o.items.sort(this.compare), s && this.show(t);
  }, o.prototype.hideMenu = function () {
    this.softkeyPanel && this.softkeyPanel.hide(), this.softkeyPanel.stopListener();
  }, o.prototype.showMenu = function () {
    this.softkeyPanel && this.softkeyPanel.show(), this.softkeyPanel.startListener();
  }, o.prototype.saveContext = function () {
    if (this.softkeyPanel) {
      var _t2 = this.softkeyPanel.getLeftKey();
      e.leftKeyState = _t2.classList.contains("hide"), _t2.classList.remove("hide"), e._cacheParams = this.getLastParamName();
    }
  }, o.prototype.returnContext = function () {
    this.softkeyPanel && (this.show(e._cacheParams), e.leftKeyState && this.softkeyPanel.getLeftKey().classList.add("hide"));
  }, o.prototype.getLeftKey = function () {
    return this.softkeyPanel.getLeftKey();
  }, o.prototype.setLast = function (t) {
    e._cacheParams = t;
  }, o.prototype.getSoftKeyByName = function (t) {
    var e;
    try {
      e = this.softkeyPanel["get".concat(s(t), "Key")]();
    } catch (t) {
      return null;
    }
    return e;
  }, o.prototype.isAvailable = function (t) {
    var e = !1;
    var s = this.getSoftKeyByName(t = t || "left");
    return s && (e = !s.classList.contains("hide")), e;
  }, o.prototype.changeBtnState = function (t, e) {
    t = this.getSoftKeyByName(t = t || "left");
    try {
      t && this["do".concat(s(e = e || "show"), "Btn")](t);
    } catch (t) {}
  }, o.prototype.doShowBtn = function (t) {
    t.classList.remove("hide");
  }, o.prototype.doHideBtn = function (t) {
    t.classList.add("hide");
  }, t.OptionHelper = new o();
}(window);
