!function (t) {
  function n(t) {
    return e(t, "begin");
  }
  function e(t, e) {
    if (!t || !t.photo || !t.photo.length) return null;
    if (1 === t.photo.length) return t.photo[0];
    var n = t.photo;
    var o = t.category;
    if (Array.isArray(o) && -1 !== o.indexOf("fb_linked")) return 4 <= n.length ? n["begin" === e ? 1 : 0] : n[0];
    n = function (t) {
      var e = t.photo.slice(0);
      return e.sort(function (t, e) {
        return r(t) < r(e) ? -1 : r(t) > r(e) ? 1 : 0;
      }), e;
    }(t);
    e = "begin" === e ? 0 : n.length - 1;
    return n[e];
  }
  function r(t) {
    return "string" == typeof t ? t.length : t.size;
  }
  t.ContactPhotoHelper = {
    getThumbnail: n,
    getFullResolution: function getFullResolution(t) {
      return e(t, "end");
    },
    getPhotoHeader: function getPhotoHeader(t, e) {
      return t && t.photo && t.photo.length ? function (t) {
        var e = document.createElement("span");
        e.classList.add("contactHeaderImage");
        try {
          return e.dataset.src = window.URL.createObjectURL(t), e.setAttribute("style", "background-image:url(".concat(e.dataset.src, ")")), e;
        } catch (t) {}
        return null;
      }(n(t)) : function () {
        var t = document.createElement("span");
        t.classList.add("defaultPicture"), t.classList.add("contactHeaderImage"), t.setAttribute("style", "");
        var e = ["top", "center", "bottom"],
          n = ["left", "center", "right"],
          e = "".concat(n[Math.floor(Math.random() * n.length)], " ").concat(e[Math.floor(Math.random() * e.length)]);
        return t.dataset.group = "", t.style.backgroundPosition = e, t;
      }();
    }
  };
}(window);
