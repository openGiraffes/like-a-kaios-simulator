
(function () {
  'use strict';
  function makeAd(opts) {
    var ad = {
      call: function () {},
      display: function () {},
      close: function () {},
      onerror: null,
      onready: null
    };
    if (opts && typeof opts.onready === 'function') {
      setTimeout(function () { try { opts.onready(ad); } catch (e) {} }, 0);
    }
    return ad;
  }
  window.getKaiAd = makeAd;
  window.getKaiAd.dummy = true;
  window.kaiads = { getAd: makeAd, version: 'sim-stub' };

  // KaiAds v5 API (window.ads) — used by e.g. KaiWeather's showAds().
  // Never override a real SDK that already loaded.
  if (!window.ads) {
    window.ads = {
      showAds: function (opts) {
        // Apps wait for onAdFinished to continue their startup flow.
        setTimeout(function () {
          if (opts && typeof opts.onAdFinished === 'function') {
            try { opts.onAdFinished(); } catch (e) {}
          }
        }, 200);
      },
      hideAd: function () {},
      buildAd: function () { return makeAd({}); },
      getAd: function (opts) { return makeAd(opts || {}); },
      isAdFree: function () { return false; },
    };
  }
})();
