!function (e) {
  var t = "client=";
  var n = null;
  function i() {
    0;
  }
  function o() {
    this.getGoogleClientId();
  }
  o.prototype = {
    getGoogleClientId: function getGoogleClientId() {
      SettingsObserver && SettingsObserver.getValue("google.client_id").then(function (e) {
        e && "" !== e && (n = e, i(n));
      });
    },
    parse: function parse(e) {
      if (!n) return e;
      if (e.indexOf("google") < 0) return e;
      if (e.indexOf(t) < 0) return e;
      e = e.slice(0, e.indexOf(t) + t.length) + n;
      return e;
    }
  }, e.ClientIdCustomizer = new o();
}(window);
