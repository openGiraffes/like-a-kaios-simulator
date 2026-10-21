function parseJPEGMetadata(u, i, c) {
  var a = {},
    U = {};
  function o(t, e, r) {
    try {
      if (255 !== t.getUint8(e)) return void c("Malformed JPEG file: bad segment header");
      var _a = t.getUint8(e + 1),
        _o = t.getUint16(e + 2) + 2;
      var n = t.sliceOffset + t.viewOffset + e;
      var _s = n + _o >= u.size;
      var i = _s ? _o : _o + 4;
      t.getMore(n, i, function (t) {
        r(_a, _o, t, _s);
      });
    } catch (t) {
      c("".concat(t.toString(), "\n").concat(t.stack));
    }
  }
  function s(t, e, r, n) {
    try {
      switch (t) {
        case 192:
        case 193:
        case 194:
        case 195:
          a.height = r.getUint16(5), a.width = r.getUint16(7), 194 === t && (a.progressive = !0), i(a);
          break;
        case 225:
          !function (t) {
            if (1165519206 === t.getUint32(4, !1)) switch (!function (t) {
              var e = t.getUint8(10);
              if (77 === e) e = !1;else {
                if (73 !== e) throw Error("invalid byteorder in EXIF segment");
                e = !0;
              }
              if (42 !== t.getUint16(12, e)) throw Error("bad magic number in EXIF segment");
              var r = t.getUint32(14, e);
              d(t, r + 10, e, !0);
              var n = t.getUint16(r + 10, e),
                n = t.getUint32(r + 12 + 12 * n, e);
              0 !== n && d(t, n + 10, e, !0);
            }(t), U.THUMBNAIL && U.THUMBNAILLENGTH && (t = t.sliceOffset + t.viewOffset + 10 + U.THUMBNAIL, a.preview = {
              start: t,
              end: t + U.THUMBNAILLENGTH
            }), U.ORIENTATION) {
              case 1:
                a.rotation = 0, a.mirrored = !1;
                break;
              case 2:
                a.rotation = 0, a.mirrored = !0;
                break;
              case 3:
                a.rotation = 180, a.mirrored = !1;
                break;
              case 4:
                a.rotation = 180, a.mirrored = !0;
                break;
              case 5:
                a.rotation = 90, a.mirrored = !0;
                break;
              case 6:
                a.rotation = 90, a.mirrored = !1;
                break;
              case 7:
                a.rotation = 270, a.mirrored = !0;
                break;
              case 8:
                a.rotation = 270, a.mirrored = !1;
                break;
              default:
                a.rotation = 0, a.mirrored = !1;
            }
          }(r), n ? c("unexpected end of JPEG file") : o(r, e, s);
          break;
        default:
          n ? c("unexpected end of JPEG file") : o(r, e, s);
      }
    } catch (t) {
      c("".concat(t.toString(), "\n").concat(t.stack));
    }
  }
  function d(e, r, n, t) {
    var i,
      a,
      o,
      s,
      c,
      g,
      f = e.getUint16(r, n);
    for (var _t = 0; _t < f; _t++) i = e, a = r + 2 + 12 * _t, o = n, g = c = s = void 0, s = i.getUint16(a, o), (c = m[s]) && !U[c] && (g = i.getUint16(a + 2, o), s = i.getUint32(a + 4, o), a = s * l[g] <= 4 ? a + 8 : i.getUint32(a + 8, o), U[c] = function (e, r, n, i, a) {
      if (2 === n) {
        var _c = [];
        for (var _t2 = 0; _t2 < i - 1; _t2++) _c[_t2] = e.getUint8(r + _t2);
        return String.fromCharCode.apply(String, _c);
      }
      if (1 === i) return I(e, r, n, a);
      var o = [],
        s = l[n];
      for (var _t3 = 0; _t3 < i; _t3++) o[_t3] = I(e, r + s * _t3, n, a);
      return o;
    }(i, a, g, s, o));
    t || 0 !== (t = e.getUint32(r + 2 + 12 * f, n)) && t < u.size && d(e, t + 10, n);
  }
  BlobView.get(u, 0, Math.min(16384, u.size), function (t) {
    t.byteLength < 2 || 255 !== t.getUint8(0) || 216 !== t.getUint8(1) ? c("Not a JPEG file") : o(t, 2, s);
  });
  var l = [0, 1, 1, 2, 4, 8, 1, 1, 2, 4, 8, 4, 8],
    m = {
      274: "ORIENTATION",
      513: "THUMBNAIL",
      514: "THUMBNAILLENGTH"
    };
  function I(t, e, r, n) {
    switch (r) {
      case 1:
      case 7:
        return t.getUint8(e);
      case 2:
        return null;
      case 3:
        return t.getUint16(e, n);
      case 4:
        return t.getUint32(e, n);
      case 5:
        return t.getUint32(e, n) / t.getUint32(e + 4, n);
      case 6:
        return t.getInt8(e);
      case 8:
        return t.getInt16(e, n);
      case 9:
        return t.getInt32(e, n);
      case 10:
        return t.getInt32(e, n) / t.getInt32(e + 4, n);
      case 11:
        return t.getFloat32(e, n);
      case 12:
        return t.getFloat64(e, n);
    }
    return null;
  }
}
window.parseJPEGMetadata = parseJPEGMetadata;
