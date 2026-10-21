function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function cropResizeRotate(p, f, m, b, t, R) {
  var v = "image/jpeg";
  switch (arguments.length) {
    case 2:
      R = f, t = b = m = f = null;
      break;
    case 3:
      R = m, t = b = m = null;
      break;
    case 4:
      R = b, t = b = null;
      break;
    case 5:
      R = t, t = null;
      break;
    case 6:
      break;
    default:
      throw new Error("wrong number of arguments: ".concat(arguments.length));
  }
  function e(t) {
    var i = t.width,
      l = t.height,
      n = i * l,
      r = t.rotation || 0,
      g = t.mirrored || !1;
    var a = l,
      w = i;
    if (0 !== r && 180 !== r || (a = i, w = l), f) {
      if (f.left < 0 || f.top < 0 || f.left + f.width > a || f.top + f.height > w) return void R("crop region does not fit inside image");
    } else f = {
      left: 0,
      top: 0,
      width: a,
      height: w
    };
    if (null == m) m = {
      width: f.width,
      height: f.height
    };else if ("number" == typeof m) {
      if (m <= 0) return void R("outputSize must be positive");
      if (n < m) m = {
        width: f.width,
        height: f.height
      };else {
        var o = Downsample.areaAtLeast(m / n);
        m = {
          width: o.scale(f.width),
          height: o.scale(f.height)
        };
      }
    }
    if (0 < m.width && 0 < m.height) {
      m.width > f.width && (m.width = f.width), m.height > f.height && (m.height = f.height);
      var e = m.width / f.width,
        h = m.height / f.height;
      if (e < h ? (t = f.width, f.width = Math.round(m.width / h), f.left += t - f.width >> 1) : h < e && (h = f.height, f.height = Math.round(m.height / e), f.top += h - f.height >> 1), b && b !== v && "image/png" !== b) R("unsupported outputType: ".concat(b));else if (0 !== r || g || b && p.type !== b || m.width !== a || m.height !== w) {
        var s = function s() {
          c.onerror = "", c.onload = "", c.src = "", URL.revokeObjectURL(_h);
        };
        var u = {
          left: f.left,
          top: f.top,
          width: f.width,
          height: f.height
        };
        r = URL.createObjectURL(p), g = f.width * f.height;
        var _t = Downsample.NONE,
          _e = n;
        p.type === v && (_t = Downsample.sizeNoMoreThan(m.width / f.width), _e = _t.scale(i) * _t.scale(l));
        var _h = null,
          _o = !1,
          d = !1;
        _e < n ? (_h = r + _t, d = !0) : g < n ? (_h = "".concat(r, "#xywh=").concat(u.left, ",").concat(u.top, ",").concat(u.width, ",").concat(u.height), _o = !0) : _h = r;
        var c = new Image();
        c.onerror = function () {
          s(), R("error decoding image: ".concat(_h));
        }, c.onload = function () {
          {
            var t, e;
            _o ? c.width === u.width && c.height === u.height && (u.left = 0, u.top = 0) : d && (c.width < a || c.height < w) && (t = a / c.width, e = w / c.height, u.left = Math.round(u.left / t), u.top = Math.round(u.top / e), u.width = Math.round(u.width / t), u.height = Math.round(u.height / e));
          }
          var h = document.createElement("canvas");
          h.width = m.width, h.height = m.height;
          var i = h.getContext("2d", {
            willReadFrequently: !0
          });
          try {
            i.drawImage(c, u.left, u.top, u.width, u.height, 0, 0, m.width, m.height);
          } catch (t) {
            return void R("Failed to decode image in cropResizeRotate; image may be corrupt or too large: ".concat(t));
          } finally {
            s();
          }
          h.toBlob(function (t) {
            h.width = 0, h.height = 0, h = null, i = null, R(null, t);
          }, b || v);
        }, c.src = _h;
      } else R(null, p);
    } else R("outputSize width and height must be positive");
  }
  f = f && {
    left: f.left,
    top: f.top,
    width: f.width,
    height: f.height
  }, m && "object" == _typeof(m) && (m = {
    width: m.width,
    height: m.height
  }), t ? e(t) : getImageSize(p, e, function (t) {
    R(t);
  });
}
window.cropResizeRotate = cropResizeRotate;
