!function (e) {
  function t(e) {
    return Math.round(100 * e) / 100;
  }
  function n(e, n) {
    return Object.freeze({
      dimensionScale: t(n),
      areaScale: t(n * n),
      toString: function toString() {
        return "#-moz-samplesize=".concat(e);
      },
      scale: function scale(e) {
        return Math.ceil(e * n);
      }
    });
  }
  var a = Object.freeze({
      dimensionScale: 1,
      areaScale: 1,
      toString: function toString() {
        return "";
      },
      scale: function scale(e) {
        return e;
      }
    }),
    i = [a, n(2, .5), n(3, 3 / 8), n(4, .25), n(8, 1 / 8)];
  e.Downsample = {
    sizeAtLeast: function sizeAtLeast(n) {
      n = t(n);
      for (var _e = 0; _e < i.length; _e++) {
        var r = i[_e];
        if (r.dimensionScale <= n) return r;
      }
      return i[i.length - 1];
    },
    sizeNoMoreThan: function sizeNoMoreThan(n) {
      n = t(n);
      for (var _e2 = i.length - 1; 0 <= _e2; _e2--) {
        var r = i[_e2];
        if (r.dimensionScale >= n) return r;
      }
      return a;
    },
    areaAtLeast: function areaAtLeast(n) {
      n = t(n);
      for (var _e3 = 0; _e3 < i.length; _e3++) {
        var r = i[_e3];
        if (r.areaScale <= n) return r;
      }
      return i[i.length - 1];
    },
    areaNoMoreThan: function areaNoMoreThan(n) {
      n = t(n);
      for (var _e4 = i.length - 1; 0 <= _e4; _e4--) {
        var r = i[_e4];
        if (r.areaScale >= n) return r;
      }
      return a;
    },
    NONE: a,
    MAX_SIZE_REDUCTION: 1 / i[i.length - 1].dimensionScale,
    MAX_AREA_REDUCTION: 1 / i[i.length - 1].areaScale
  };
}(window);
