window.Format = {
  padLeft: function padLeft(t, e, r) {
    r = r || " ";
    var n = e - "".concat(t).length;
    for (; -1 < --n;) t = r + t;
    return t;
  }
};
