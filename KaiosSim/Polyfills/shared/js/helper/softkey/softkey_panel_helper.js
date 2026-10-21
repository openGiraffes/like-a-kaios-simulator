!function (e) {
  var a = null,
    i = [],
    n = !1;
  function t(e) {
    switch (e.type) {
      case "screenchange":
        e.detail.screenEnabled || a && a.hide();
        break;
      case "lockscreen-appopened":
        a && a.hide();
        break;
      case "lockscreen-appclosed":
      case "wake":
        n && a && a.show();
        break;
      case "keydown":
        "Backspace" !== e.key && "BrowserBack" !== e.key || n && (i.apply(null, []), e.preventDefault());
    }
  }
  window.addEventListener("keydown", t), window.addEventListener("lockscreen-appopened", t), window.addEventListener("lockscreen-appclosed", t), window.addEventListener("screenchange", t), window.addEventListener("wake", t), e.SoftkeyHelper = {
    applist: [],
    init: function init(e, t) {
      a = a || new SoftkeyPanel({
        menuClassName: "menu-button",
        items: [{
          name: "create",
          priority: 1,
          method: function method() {}
        }]
      }), a.initSoftKeyPanel(e), a.show(), i = t || function () {}, n = !0;
    },
    updateSoftkey: function updateSoftkey(e, t, i) {
      switch (t) {
        case "1":
          e.items[0].l10nId = i;
          break;
        case "3":
          e.items[1].l10nId = i;
      }
      a && a.initSoftKeyPanel(e);
    },
    show: function show() {
      a && a.show();
    },
    onlyHide: function onlyHide() {
      a && a.hide();
    },
    hide: function hide(t) {
      a && a.hide(), i = function i() {}, n = !1;
      for (var _e = 0; _e < this.applist.length; _e++) if (this.applist[_e].name === t) {
        this.applist.splice(_e, 1), 0 === _e && 0 < this.applist.length && void 0 !== this.applist[0].appliacation.front && this.applist[0].appliacation.front();
        break;
      }
    },
    getSoftkey: function getSoftkey() {
      return a;
    },
    register: function register(e, t) {
      for (var _e2 = 0; _e2 < this.applist.length; _e2++) if (this.applist[_e2].name === t) return;
      e = {
        appliacation: e,
        name: t
      };
      0 < this.applist.length && void 0 !== this.applist[0].appliacation.back && this.applist[0].appliacation.back(), this.applist.unshift(e);
    }
  };
}(window);
