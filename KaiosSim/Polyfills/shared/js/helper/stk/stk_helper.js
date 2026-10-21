var STKHelper = {
  getIconCanvas: function getIconCanvas(e) {
    if (!(e && e.pixels && e.width && e.height)) return null;
    if (e.pixels.length < e.width * e.height) return null;
    e.codingScheme || (e.codingScheme = "basic");
    var t = document.createElement("canvas");
    t.setAttribute("width", e.width), t.setAttribute("height", e.height);
    var n = t.getContext("2d", {
      willReadFrequently: !0
    });
    var i = n.createImageData(e.width, e.height);
    var l = 0,
      r = 0;
    var a = i.data;
    for (var _t = 0; _t < e.height; _t++) for (var _t2 = 0; _t2 < e.width; _t2++) a[r++] = (4278190080 & e.pixels[l]) >>> 24, a[r++] = (16711680 & e.pixels[l]) >>> 16, a[r++] = (65280 & e.pixels[l]) >>> 8, a[r++] = 255 & e.pixels[l], l++;
    return n.putImageData(i, 0, 0), t;
  },
  getMessageText: function getMessageText(t, e, n) {
    var i;
    if (i = "string" === t || t instanceof String ? t : t ? t.text : "", !i && e) {
      var l = window.api.l10n.get;
      i = l(e, n);
    }
    return i;
  },
  isIconSelfExplanatory: function isIconSelfExplanatory(t) {
    return t && t.icons && t.iconSelfExplanatory;
  },
  getFirstIconRawData: function getFirstIconRawData(t) {
    return t.icons && 0 < t.icons.length ? t.icons[0] : null;
  }
};
window.STKHelper = STKHelper;
