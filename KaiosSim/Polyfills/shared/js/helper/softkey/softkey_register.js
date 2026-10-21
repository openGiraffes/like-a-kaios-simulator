function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function registerSoftkeys(t) {
  if (t) {
    var o = "og:kaios:softkeyinfo";
    var n = [];
    var e = document.head.querySelector("meta[name=\"".concat(o, "\"]"));
    e || (e = document.createElement("meta"), e.name = o, document.head.appendChild(e)), t.forEach(function (e) {
      e.options.name && ("object" == _typeof(e.options.name) ? e.options.name.text && n.push("".concat(e.code, ": ").concat(e.options.name.text)) : n.push("".concat(e.code, ": ").concat(e.options.name)));
    }), e.setAttribute("content", n.join(", "));
  }
}
window.registerSoftkeys = registerSoftkeys;
