!function (t) {
  var e = new WeakMap(),
    o = /\$\{([^}]+)\}/g,
    n = /[&<>"']/g,
    r = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&apos;"
    };
  function i(t) {
    if (!(this instanceof i)) return new i(t);
    e.set(this, {
      idOrNode: t
    });
  }
  i.prototype.extract = function () {
    var t = e.get(this);
    return t.tmpl || (t.tmpl = function (t) {
      var e = null;
      if ("string" == typeof t ? (e = t, t = document.getElementById(t)) : t && (e = t.id), !t) return "";
      if (!t.firstChild) return "";
      t = t.firstChild;
      do {
        if (t.nodeType === Node.COMMENT_NODE) return (t.nodeValue || "").trim();
      } while (t = t.nextSibling);
      return "";
    }(t.idOrNode), delete t.idOrNode), t.tmpl;
  }, i.prototype.toString = function () {
    return this.extract().slice();
  }, i.prototype.interpolate = function (n, r) {
    return (r = r || {}).safe = r.safe || [], this.extract().replace(o, function (t, e) {
      return e = e.trim(), -1 === r.safe.indexOf(e) ? i.escape(n[e]) : n[e];
    });
  }, i.prototype.prepare = function (t, e) {
    return {
      toString: function toString() {
        return i.interpolate(t, e);
      },
      toDocumentFragment: function toDocumentFragment() {
        var t = document.createElement("template");
        return t.innerHTML = this.toString(), t.content.cloneNode(!0);
      }
    };
  }, i.escape = function (t) {
    return "string" != typeof t ? "" : t.replace(n, function (t) {
      return r[t];
    });
  }, t.Template = i;
}(window);
