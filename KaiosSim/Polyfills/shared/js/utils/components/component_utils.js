!function (i) {
  i.ComponentUtils = {
    style: function style(i, t) {
      var _this = this;
      var e = document.createElement("style");
      i = "".concat(i, "style.css");
      e.setAttribute("scoped", ""), e.innerHTML = "@import url(".concat(i, ");"), t ? (t.appendChild(e), t.style.visibility = "hidden") : (this.appendChild(e), this.style.visibility = "hidden"), e.addEventListener("load", function () {
        t ? (t.shadowRoot && t.shadowRoot.appendChild(e.cloneNode(!0)), t.style.visibility = "") : (_this.shadowRoot && _this.shadowRoot.appendChild(e.cloneNode(!0)), _this.style.visibility = "");
      });
    }
  };
}(window);
