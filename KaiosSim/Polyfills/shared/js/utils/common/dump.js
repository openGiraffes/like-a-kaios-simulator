!function () {
  function e() {}
  function i(n, e) {
    var i = n;
    e && (i += JSON.stringify(e)), "function" == typeof dump && (e = document.location.hostname.replace(/\..*$/g, ""), dump("[".concat(e, "] ").concat(i, "\n")));
  }
  window.DUMP = e, window.DumpOn = i, SettingsObserver && SettingsObserver.observe("debug.gaia.enabled", !1, function (n) {
    window.DUMP = n ? i : e, i(n ? "Enabling DUMP" : "Disabling DUMP");
  });
}();
