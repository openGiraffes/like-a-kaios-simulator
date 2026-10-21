!function (m) {
  function o(o) {
    if (m.mozPerfHasListener) {
      var t = m.performance.now(),
        n = Date.now();
      setTimeout(function () {
        var e = {
            name: o,
            timestamp: t,
            epoch: n
          },
          e = new CustomEvent("x-moz-perf", {
            detail: e
          });
        m.dispatchEvent(e);
      });
    }
  }
  m.mozPerformance = {
    timing: {}
  }, ["moz-chrome-dom-loaded", "moz-chrome-interactive", "moz-app-visually-complete", "moz-content-interactive", "moz-app-loaded"].forEach(function (e) {
    m.addEventListener(e, function () {
      o(e);
    }, !1);
  }), m.PerformanceTestingHelper = {
    dispatch: o
  };
}(window);
