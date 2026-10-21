!function (e) {
  e.AccessibilityHelper = {
    setAriaSelected: function setAriaSelected(t, e) {
      Array.prototype.forEach.call(e, function (e) {
        e.setAttribute("aria-selected", e === t ? "true" : "false");
      });
    }
  };
}(window);
