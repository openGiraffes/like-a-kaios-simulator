!function (e) {
  var a = {},
    f = "image/jpeg",
    d = "image/png",
    g = "image/gif",
    u = "image/bmp";
  a.JPEG = f, a.PNG = d, a.GIF = g, a.BMP = u, a.getSizeAndType = function (o) {
    return o instanceof Blob ? new Promise(function (t, r) {
      if (o.size <= 16) r(new TypeError("corrupt image file"));else {
        var n = function n(e) {
          t(e);
        };
        var i = function i(e) {
          r(e.error);
        };
        var _e = 32768;
        o.type !== d && o.type !== g && o.type !== u || (_e = 512), a(o, _e, n, function (e) {
          e.type === f ? a(o, o.size, n, i) : r(e.error);
        });
      }
    }) : Promise.reject(new TypeError("argument is not a Blob"));
    function a(a, e, c, l) {
      e = a.slice(0, Math.min(e, a.size));
      var t = new FileReader();
      t.readAsArrayBuffer(e), t.onloadend = function () {
        !function (e) {
          var t = new Uint8Array(e, 0, 16),
            r = new DataView(e);
          if (137 === t[0] && 80 === t[1] && 78 === t[2] && 71 === t[3] && 13 === t[4] && 10 === t[5] && 26 === t[6] && 10 === t[7] && 73 === t[12] && 72 === t[13] && 68 === t[14] && 82 === t[15]) try {
            c({
              type: d,
              width: r.getUint32(16, !1),
              height: r.getUint32(20, !1)
            });
          } catch (e) {
            l({
              error: e.toString()
            });
          } else if (71 !== t[0] || 73 !== t[1] || 70 !== t[2] || 56 !== t[3] || 55 !== t[4] && 57 !== t[4] || 97 !== t[5]) {
            if (66 === t[0] && 77 === t[1] && r.getUint32(2, !0) === a.size) try {
              var _e2 = r.getUint32(18, !0),
                _t = r.getUint32(22, !0);
              12 === r.getUint16(14, !0) && (_e2 = r.getUint16(18, !0), _t = r.getUint16(20, !0)), c({
                type: u,
                width: _e2,
                height: _t
              });
            } catch (e) {
              l({
                error: e.toString()
              });
            } else if (255 === t[0] && 216 === t[1]) {
              var _o = {
                type: f
              };
              try {
                var _e3 = 2;
                for (;;) {
                  255 !== r.getUint8(_e3) && l({
                    error: "corrupt JPEG file"
                  });
                  var n = r.getUint8(_e3 + 1),
                    i = r.getUint16(_e3 + 2) + 2;
                  if (192 <= n && n <= 195 || 197 <= n && n <= 199 || 201 <= n && n <= 203 || 205 <= n && n <= 207) {
                    _o.height = r.getUint16(_e3 + 5, !1), _o.width = r.getUint16(_e3 + 7, !1), c(_o);
                    break;
                  }
                  if (_e3 += i, _e3 + 9 > r.byteLength) {
                    _o.error = "corrupt JPEG file", l(_o);
                    break;
                  }
                }
              } catch (e) {
                l({
                  error: e.toString()
                });
              }
            } else l({
              error: "unknown image type"
            });
          } else try {
            c({
              type: g,
              width: r.getUint16(6, !0),
              height: r.getUint16(8, !0)
            });
          } catch (e) {
            l({
              error: e.toString()
            });
          }
        }(t.result);
      };
    }
  }, a.resizeAndCropToCover = function (o, g, u, h, s) {
    return !g || !isFinite(g) || g <= 0 || !u || !isFinite(u) || u <= 0 ? Promise.reject(new TypeError("invalid output dimensions")) : (g = Math.round(g), u = Math.round(u), a.getSizeAndType(o).then(function (e) {
      var t = e.width,
        r = e.height;
      return t === g && r === u ? o : n(e);
    }, function () {
      return n({});
    }));
    function n(e) {
      var t = e.type,
        r = e.width,
        e = e.height;
      h = (h = h && h !== f && h !== d ? void 0 : h) || (t === f || t === d ? t : d);
      var n = URL.createObjectURL(o);
      var i = "";
      return t === f && g < r && u < e && (e = Math.max(g / r, u / e), i = a.Downsample.sizeNoMoreThan(e)), new Promise(function (a, e) {
        var c = new Image();
        function l() {
          c.onerror = "", c.onload = "", c.src = "", URL.revokeObjectURL(n);
        }
        c.src = n + i, c.onerror = function () {
          l(), e(new Error("failed to decode image"));
        }, c.onload = function () {
          var e = c.width,
            t = c.height,
            r = Math.max(g / e, u / t),
            n = Math.round(g / r),
            r = Math.round(u / r),
            e = Math.floor((e - n) / 2),
            t = Math.floor((t - r) / 2);
          var i = document.createElement("canvas");
          i.width = g, i.height = u;
          var o = i.getContext("2d", {
            willReadFrequently: !0
          });
          o.drawImage(c, e, t, n, r, 0, 0, g, u), l(), i.toBlob(function (e) {
            i.width = 0, a(e);
          }, h, s);
        };
      });
    }
  }, function (e) {
    function n(e) {
      return Math.round(100 * e) / 100;
    }
    function t(e, t) {
      return Object.freeze({
        dimensionScale: n(t),
        areaScale: n(t * t),
        toString: function toString() {
          return "#-moz-samplesize=".concat(e);
        },
        scale: function scale(e) {
          return Math.ceil(e * t);
        }
      });
    }
    var i = Object.freeze({
        dimensionScale: 1,
        areaScale: 1,
        toString: function toString() {
          return "";
        },
        scale: function scale(e) {
          return e;
        }
      }),
      o = [i, t(2, .5), t(3, 3 / 8), t(4, .25), t(8, 1 / 8)];
    e.Downsample = {
      sizeAtLeast: function sizeAtLeast(t) {
        t = n(t);
        for (var _e4 = 0; _e4 < o.length; _e4++) {
          var r = o[_e4];
          if (r.dimensionScale <= t) return r;
        }
        return o[o.length - 1];
      },
      sizeNoMoreThan: function sizeNoMoreThan(t) {
        t = n(t);
        for (var _e5 = o.length - 1; 0 <= _e5; _e5--) {
          var r = o[_e5];
          if (r.dimensionScale >= t) return r;
        }
        return i;
      },
      areaAtLeast: function areaAtLeast(t) {
        t = n(t);
        for (var _e6 = 0; _e6 < o.length; _e6++) {
          var r = o[_e6];
          if (r.areaScale <= t) return r;
        }
        return o[o.length - 1];
      },
      areaNoMoreThan: function areaNoMoreThan(t) {
        t = n(t);
        for (var _e7 = o.length - 1; 0 <= _e7; _e7--) {
          var r = o[_e7];
          if (r.areaScale >= t) return r;
        }
        return i;
      },
      NONE: i,
      MAX_SIZE_REDUCTION: 1 / o[o.length - 1].dimensionScale,
      MAX_AREA_REDUCTION: 1 / o[o.length - 1].areaScale
    };
  }(a), e.ImageUtils = a;
}(window);
