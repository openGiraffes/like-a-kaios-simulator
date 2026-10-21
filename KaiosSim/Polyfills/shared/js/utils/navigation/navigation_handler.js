!function () {
  var e = LazyLoader;
  e.load("js/navigation_map.js", function () {
    NavigationMap.init();
  }), window.addEventListener("keydown", function (e) {
    !function (e) {
      var t = e.target,
        a = null;
      if (!(NavigationMap && (0 < NavigationMap.currentActivatedLength || NavigationMap.lockNavigation) || "select-one" === document.activeElement.type || "date" === document.activeElement.type)) if ("Enter" === e.key || "Accept" === e.key) !function (t) {
        var e = document.querySelector(".focus");
        e && e.focus();
        if (NavigationMap && NavigationMap.optionMenuVisible && !t.target.classList.contains("menu-button")) {
          var _a = document.querySelector("menu button.menu-button");
          _a && _a.click && _a.click();
        } else if (NavigationMap && NavigationMap.handleClick) NavigationMap.handleClick(t);else {
          t.target.click();
          for (var _e = 0; _e < t.target.children.length; _e++) t.target.children[_e].click();
        }
      }(e);else if (e.target.classList && (e.target.classList.contains("focus") || (t = document.querySelector(".focus")), a = function (e, t) {
        var a = null;
        if (null === e) return null;
        if (void 0 !== NavigationMap && void 0 !== NavigationMap.disableNav && NavigationMap.disableNav) return null;
        var o = e.style,
          n = "rtl" === document.dir;
        var _t = t,
          i = _t.key;
        var r = {
          ArrowLeft: "--nav-left",
          ArrowRight: "--nav-right",
          ArrowUp: "--nav-up",
          ArrowDown: "--nav-down",
          Home: "--nav-home",
          MozHomeScreen: "--nav-home"
        };
        switch (i) {
          case "ArrowLeft":
          case "ArrowRight":
            n && (i = "ArrowLeft" === i ? "ArrowRight" : "ArrowLeft"), a = o.getPropertyValue(r[i]);
            break;
          case "ArrowUp":
          case "ArrowDown":
          case "Home":
          case "MozHomeScreen":
            a = o.getPropertyValue(r[i]);
        }
        if (!a) return null;
        t = "[data-nav-id=\"".concat(a, "\"]");
        return document.querySelector(t);
      }(t, e), null !== a)) if ("ArrowDown" === e.key && e.repeat && a.offsetTop < t.offsetTop) e.preventDefault();else if ("ArrowUp" === e.key && e.repeat && a.offsetTop > t.offsetTop) e.preventDefault();else {
        var o = document.querySelectorAll(".focus");
        a !== o[0] && (0 < o.length && o[0].classList.remove("focus"), NavigationMap && NavigationMap.scrollToElement ? NavigationMap.scrollToElement(a, e) : a.scrollIntoView(!1), a.classList.add("focus"), void 0 !== NavigationMap && null !== NavigationMap.ignoreFocus && NavigationMap.ignoreFocus || (a.focus(), e.preventDefault()), document.dispatchEvent(new CustomEvent("focusChanged", {
          detail: {
            focusedElement: a
          }
        })));
      }
    }(e);
  }), window.addEventListener("menuEvent", function (e) {
    NavigationMap && (NavigationMap.optionMenuVisible = e.detail.menuVisible);
  });
}();
