!function (t) {
  var e = [16, 17, 18, 19, 20, 21, 22, 23],
    n = {
      _cachedContexts: {},
      _getCachedContext: function _getCachedContext(t, e, n) {
        n = n || "italic";
        var i = this._cachedContexts;
        var r = i[t] && i[t][e] && i[t][e][n];
        if (!r) {
          var a = document.createElement("canvas");
          a.setAttribute("moz-opaque", "true"), a.setAttribute("width", "1"), a.setAttribute("height", "1"), r = a.getContext("2d", {
            willReadFrequently: !0
          }), r.font = "".concat(n, " ").concat(t, "px ").concat(e), i[t] || (i[t] = {}), i[t][e] || (i[t][e] = {}), i[t][e][n] = r;
        }
        return r;
      },
      resetCache: function resetCache() {
        this._cachedContexts = {};
      },
      _textChangeObserver: null,
      _handleTextChanges: function _handleTextChanges(e) {
        for (var _t = 0; _t < e.length; _t++) this._reformatHeaderText(e[_t].target);
      },
      _getTextChangeObserver: function _getTextChangeObserver() {
        return this._textChangeObserver || (this._textChangeObserver = new MutationObserver(this._handleTextChanges.bind(this))), this._textChangeObserver;
      },
      _observeHeaderChanges: function _observeHeaderChanges(t) {
        var e = this._getTextChangeObserver();
        e.observe(t, {
          childList: !0
        });
      },
      _reformatHeaderText: function _reformatHeaderText(t) {
        if ("" !== t.textContent.trim()) {
          this.resetCentering(t);
          var _e = this.getStyleProperties(t);
          _e.textWidth = this.autoResizeElement(t, _e), this.centerTextToScreen(t, _e);
        }
      },
      _registerHeadersInSubtree: function _registerHeadersInSubtree(t) {
        if (t) for (var e = t.querySelectorAll("header > h1"), n = 0; n < e.length; n++) window.requestAnimationFrame(function (t) {
          this._reformatHeaderText(t), this._observeHeaderChanges(t);
        }.bind(this, e[n]));
      },
      getFontWidth: function getFontWidth(t, e, n, i) {
        var r = this._getCachedContext(e, n, i);
        return r.measureText(t).width;
      },
      getMaxFontSizeInfo: function getMaxFontSizeInfo(t, e, n, i) {
        var r = null,
          a = null,
          o = e.length - 1;
        for (; r = e[o], a = this.getFontWidth(t, r, n), o--, a > i && 0 <= o;);
        return {
          fontSize: r,
          overflow: a > i,
          textWidth: a
        };
      },
      getOverflowCount: function getOverflowCount(t, e, n, i) {
        var r, a;
        var o = -1;
        for (; o++, r = t.substr(0, t.length - o), a = this.getFontWidth(r, e, n), 0 < r.length && i < a;);
        return o;
      },
      getAllowedSizes: function getAllowedSizes(t) {
        return "H1" === t.tagName && "HEADER" === t.parentNode.tagName ? e : [];
      },
      getContentWidth: function getContentWidth(t) {
        var e = parseInt(t.width, 10);
        return "border-box" === t.boxSizing && (e -= parseInt(t.paddingRight, 10) + parseInt(t.paddingLeft, 10)), e;
      },
      getStyleProperties: function getStyleProperties(t) {
        var e = window.getComputedStyle(t);
        var n = this.getContentWidth(e);
        return isNaN(n) && (n = 0), {
          fontFamily: e.fontFamily,
          contentWidth: n,
          paddingRight: parseInt(e.paddingRight, 10),
          paddingLeft: parseInt(e.paddingLeft, 10),
          offsetLeft: t.offsetLeft
        };
      },
      autoResizeElement: function autoResizeElement(t, e) {
        var n = this.getAllowedSizes(t);
        if (0 === n.length) return 0;
        var i = e.contentWidth || this.getContentWidth(t),
          e = e.fontFamily || getComputedStyle(t).fontFamily,
          i = this.getMaxFontSizeInfo(t.textContent.trim(), n, e, i);
        return t.style.fontSize = "".concat(i.fontSize, "px"), i.textWidth;
      },
      resetCentering: function resetCentering(t) {
        t.style.marginLeft = "0", t.style.marginRight = "0";
      },
      centerTextToScreen: function centerTextToScreen(t, e) {
        var n = e.textWidth + e.paddingRight + e.paddingLeft,
          i = e.offsetLeft,
          e = this.getWindowWidth() - i - e.contentWidth - e.paddingRight - e.paddingLeft;
        i === e || n + 2 * (e = Math.max(i, e)) < this.getWindowWidth() - 1 && (t.style.marginLeft = "".concat(e, "px"), t.style.marginRight = "".concat(e, "px"));
      },
      _initHeaderFormatting: function _initHeaderFormatting() {
        var _this = this;
        window.api.l10n ? window.api.l10n.once(function () {
          _this._registerHeadersInSubtree(document.body);
        }) : this._registerHeadersInSubtree(document.body);
      },
      init: function init() {
        var _this2 = this;
        window.addEventListener("lazyload", function (t) {
          _this2._registerHeadersInSubtree(t.detail);
        }), "loading" === document.readyState ? window.addEventListener("DOMContentLoaded", function () {
          _this2._initHeaderFormatting();
        }) : this._initHeaderFormatting();
      },
      getWindowWidth: function getWindowWidth() {
        return window.innerWidth;
      }
    };
  n.init(), t.FontSizeUtils = n;
}(window);
