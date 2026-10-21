function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
!function (e) {
  var t = {
    LOW_MEMORY_VALUE: 256,
    MAX_IMAGE_PIXEL_SIZE: 5242880,
    LOW_MAX_IMAGE_PIXEL_SIZE: 5242880,
    LOW_MAX_IMAGE_PIXEL_SIZE_NO_JPEG: 1431136,
    MAX_UNKNOWN_IMAGE_SIZE: 524288,
    MIN_UNKNOWN_IMAGE_SIZE: 32,
    WALLPAPER_IMAGE_PATCH: "/sdcard/.wallpaper/custom_wallpaper.jpg",
    WALLPAPER_SETTINGS_KEY: "wallpaper.image",
    HARDWARE_MEMORY_KEY: "hardware.memory",
    SCREEN_WIDTH: window.innerWidth * window.devicePixelRatio,
    SCREEN_HEIGHT: window.innerHeight * window.devicePixelRatio,
    lowMemory: null,
    storageType: {
      external: "sdcard1",
      internal: "sdcard"
    },
    errorMessages: {
      corruptImage: "image-invalid",
      tooLargeImage: "image-too-big",
      notEnoughStorage: "not-enough-storage"
    },
    offscreenImage: null,
    offscreenImageURL: null,
    getDeviceStorageByFileName: function getDeviceStorageByFileName(e) {
      var _e$split = e.split("/"),
        _e$split2 = _slicedToArray(_e$split, 2),
        t = _e$split2[1],
        s = navigator.b2g.getDeviceStorages(this.storageType.internal);
      for (var _e = 0; _e < s.length; _e++) if (s[_e].storageName === t) return s[_e];
      return null;
    },
    getFileBlob: function getFileBlob(r) {
      var _this = this;
      return new Promise(function (e, t) {
        var s = _this.getDeviceStorageByFileName(r);
        s || t(_this.errorMessages.corruptImage);
        var o = s.get(r);
        o.onsuccess = function () {
          e(o.result);
        }, o.onerror = function () {
          t(_this.errorMessages.corruptImage);
        };
      });
    },
    saveBlob: function saveBlob(i) {
      var _this2 = this;
      return new Promise(function (t, s) {
        var o = navigator.b2g.getDeviceStorage(_this2.storageType.internal),
          e = o.delete(_this2.WALLPAPER_IMAGE_PATCH);
        var r = function r() {
          getStorageIfAvailable(_this2.storageType.internal, i.size, function () {
            var e = o.addNamed(i, _this2.WALLPAPER_IMAGE_PATCH);
            e.onsuccess = function () {
              t(e.result.name);
            }, e.onerror = function () {
              s(_this2.errorMessages.corruptImage);
            };
          }, function () {
            return s(_this2.errorMessages.notEnoughStorage);
          });
        };
        e.onsuccess = r, e.onerror = r;
      });
    },
    cropBlob: function cropBlob(t, s) {
      var _this3 = this;
      return new Promise(function (a, e) {
        _this3.offscreenImageURL = URL.createObjectURL(t), _this3.offscreenImage = new Image(), _this3.offscreenImage.onerror = function () {
          _this3.cleanupImage(), e(_this3.errorMessages.corruptImage);
        }, _this3.offscreenImage.onload = function () {
          var e = _this3.offscreenImage.width,
            t = _this3.offscreenImage.height,
            s = _this3.SCREEN_WIDTH / e,
            o = _this3.SCREEN_HEIGHT / t,
            s = Math.max(s, o),
            o = Math.round(_this3.SCREEN_WIDTH / s),
            s = Math.round(_this3.SCREEN_HEIGHT / s),
            e = Math.floor((e - o) / 2),
            t = Math.floor((t - s) / 2);
          var r = document.createElement("canvas");
          r.width = _this3.SCREEN_WIDTH, r.height = _this3.SCREEN_HEIGHT;
          var i = r.getContext("2d");
          i.drawImage(_this3.offscreenImage, e, t, o, s, 0, 0, _this3.SCREEN_WIDTH, _this3.SCREEN_HEIGHT), r.toBlob(function (e) {
            _this3.cleanupImage(), a(e);
          }, "image/jpeg");
        }, _this3.offscreenImage.src = s ? _this3.offscreenImageURL + s : _this3.offscreenImageURL;
      });
    },
    getDownResolutionBlob: function getDownResolutionBlob(i) {
      var _this4 = this;
      return new Promise(function (o, r) {
        getImageSize(i, function (e) {
          var t = e.width * e.height;
          var s = _this4.lowMemory ? _this4.LOW_MAX_IMAGE_PIXEL_SIZE : _this4.MAX_IMAGE_PIXEL_SIZE;
          "jpeg" !== e.type && _this4.lowMemory && (s = _this4.LOW_MAX_IMAGE_PIXEL_SIZE_NO_JPEG), t > s || i.size > 2 * s ? r(_this4.errorMessages.tooLargeImage) : (t = Downsample.areaNoMoreThan(_this4.SCREEN_WIDTH * _this4.SCREEN_HEIGHT / t), _this4.cropBlob(i, t).then(function (e) {
            return o(e);
          }).catch(function (e) {
            return r(e);
          }));
        }, function (e) {
          i.size > _this4.MAX_UNKNOWN_IMAGE_SIZE || i.size < _this4.MIN_UNKNOWN_IMAGE_SIZE ? r(_this4.errorMessages.corruptImage) : i.arrayBuffer().then(function (e) {
            return _this4.cropBlob(new Blob([new Uint8Array(e)]));
          }).then(function (e) {
            return o(e);
          }).catch(function (e) {
            return r(e);
          });
        });
      });
    },
    getWallpaperBlob: function getWallpaperBlob(e, t, s) {
      var _this5 = this;
      this.init().then(function () {
        return _this5.getFileBlob(e);
      }).then(function (e) {
        return _this5.getDownResolutionBlob(e);
      }).then(function (e) {
        return t(e);
      }).catch(function (e) {
        return s(e);
      });
    },
    getWallpaperBlobByBlob: function getWallpaperBlobByBlob(e, t, s) {
      var _this6 = this;
      this.init().then(function () {
        return _this6.getDownResolutionBlob(e);
      }).then(function (e) {
        return t(e);
      }).catch(function (e) {
        return s(e);
      });
    },
    setWallpaper: function setWallpaper(e, t, s) {
      var _this7 = this;
      this.init().then(function () {
        return _this7.getFileBlob(e);
      }).then(function (e) {
        return _this7.getDownResolutionBlob(e);
      }).then(function (e) {
        return _this7.saveBlob(e);
      }).then(function () {
        return SettingsObserver.setValue([{
          name: _this7.WALLPAPER_SETTINGS_KEY,
          value: _this7.WALLPAPER_IMAGE_PATCH
        }]);
      }).then(t).catch(function (e) {
        return s(e);
      });
    },
    setWallpaperByBlob: function setWallpaperByBlob(e, t, s) {
      var _this8 = this;
      this.init().then(function () {
        return _this8.getDownResolutionBlob(e);
      }).then(function (e) {
        return _this8.saveBlob(e);
      }).then(function () {
        return SettingsObserver.setValue([{
          name: _this8.WALLPAPER_SETTINGS_KEY,
          value: _this8.WALLPAPER_IMAGE_PATCH
        }]);
      }).then(t).catch(function (e) {
        return s(e);
      });
    },
    init: function init() {
      var _this9 = this;
      return new Promise(function (e) {
        var t = [];
        window.getStorageIfAvailable || t.push("http://shared.localhost/js/utils/device_storage/get_storage_if_available.js"), window.getImageSize || t.push("http://shared.localhost/js/utils/media/image_size.js"), window.parseJPEGMetadata || t.push("http://shared.localhost/js/utils/media/jpeg_metadata_parser.js"), window.Downsample || t.push("http://shared.localhost/js/utils/media/downsample.js"), window.BlobView || t.push("http://shared.localhost/js/utils/blob/blobview.js"), t.length ? LazyLoader.load(t, function () {
          null === _this9.lowMemory ? _this9.checkIsLowMemory().then(function () {
            return e();
          }) : e();
        }) : null === _this9.lowMemory ? _this9.checkIsLowMemory().then(function () {
          return e();
        }) : e();
      });
    },
    checkIsLowMemory: function checkIsLowMemory() {
      var _this0 = this;
      return new Promise(function (t) {
        DeviceCapabilityManager.get(_this0.HARDWARE_MEMORY_KEY).then(function (e) {
          _this0.lowMemory = e === _this0.LOW_MEMORY_VALUE, t();
        });
      });
    },
    cleanupImage: function cleanupImage() {
      this.offscreenImage.onerror = "", this.offscreenImage.onload = "", this.offscreenImage.src = "", URL.revokeObjectURL(this.offscreenImageURL), this.offscreenImageURL = null, this.offscreenImage = null;
    }
  };
  e.WallpaperProcessor = t;
}(window);
