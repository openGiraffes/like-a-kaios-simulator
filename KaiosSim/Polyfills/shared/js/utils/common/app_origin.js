!function (e) {
  var r = {
    "kaios-plus": "kaios-store"
  };
  e.AppOrigin = {
    getOrigin: function getOrigin(e) {
      if (e) return "http://".concat(r[e] || e, ".localhost");
      throw new TypeError('"appName" is required for getOrigin().');
    },
    getManifestURL: function getManifestURL(e) {
      if (e) return "http://".concat(r[e] || e, ".localhost/manifest.webmanifest");
      throw new TypeError('"appName" is required for getManifestURL().');
    },
    getManifestName: function getManifestName() {
      return "manifest.webmanifest";
    },
    getScheme: function getScheme() {
      return "http://";
    },
    getProtocol: function getProtocol() {
      return "http://".replace("://", "");
    },
    getRootDomain: function getRootDomain() {
      return "localhost";
    }
  };
}(window);
