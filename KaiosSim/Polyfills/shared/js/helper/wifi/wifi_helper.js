var WifiHelper = {
  getWifiManager: function getWifiManager() {
    return this.wifiManager;
  },
  wifiManager: navigator.b2g.wifiManager,
  setPassword: function setPassword(e) {
    var t = e.network,
      n = e.password,
      s = e.identity,
      i = e.eap,
      r = e.phase2,
      a = e.certificate,
      c = e.keyIndex;
    switch (this.getKeyManagement(t)) {
      case "WPA-PSK":
      case "WPA2-PSK":
      case "WPA/WPA2-PSK":
      case "SAE":
        t.psk = n;
        break;
      case "WAPI-PSK":
        t.wapi_psk = n;
        break;
      case "WPA-EAP":
        switch (t.eap = i) {
          case "SIM":
          case "AKA":
          case "AKA'":
            break;
          case "PEAP":
          case "TLS":
          case "TTLS":
            n && n.length && (t.password = n), s && s.length && (t.identity = s), "No" !== r && (t.phase2 = r), "none" !== a && (t.serverCertificate = a);
        }
        break;
      case "WEP":
        t.wep = n, t.keyIndex = c;
    }
  },
  setSecurity: function setSecurity(e, t) {
    e.security = t;
  },
  setSecurityValue: function setSecurityValue(e, t) {
    0 !== t.length && (e.security = t);
  },
  setSignalStrength: function setSignalStrength(e, t) {
    e.signalStrength = t;
  },
  setRelSignalStrength: function setRelSignalStrength(e, t) {
    e.relSignalStrength = t;
  },
  getSecurity: function getSecurity(e) {
    return e.security;
  },
  getCompositedKey: function getCompositedKey(e) {
    var t = this.getKeyManagement(e);
    switch (t) {
      case "WPA-PSK":
      case "WPA2-PSK":
      case "WPA/WPA2-PSK":
        t = "WPA-PSK";
    }
    return "".concat(e.ssid, "+").concat(t);
  },
  getCapabilities: function getCapabilities(e) {
    return void 0 === e.capabilities || null === e.capabilities ? [] : e.capabilities;
  },
  getKeyManagement: function getKeyManagement(e) {
    e = this.getSecurity(e);
    return /OPEN$/.test(e) ? "OPEN" : /WEP$/.test(e) ? "WEP" : /WAPI-PSK$/.test(e) ? "WAPI-PSK" : /PSK$/.test(e) ? "WPA-PSK" : /SAE$/.test(e) ? "SAE" : /EAP$/.test(e) ? "WPA-EAP" : /WAPI-CERT$/.test(e) ? "WAPI-CERT" : "";
  },
  isConnected: function isConnected(e) {
    var t = this.wifiManager.connection.network;
    return !(!t || !e) && this.getCompositedKey(e) === this.getCompositedKey(t) && t.connected;
  },
  isValidInput: function isValidInput(e, t, n, s) {
    if ("WAPI-CERT" === e) return !1;
    switch (e) {
      case "WPA-PSK":
      case "WPA2-PSK":
      case "WPA/WPA2-PSK":
      case "WAPI-PSK":
      case "SAE":
        if (!t || t.length < 8) return !1;
        break;
      case "WPA-EAP":
        switch (s) {
          case "SIM":
          case "AKA":
          case "AKA'":
            break;
          case "PEAP":
          case "TLS":
          case "TTLS":
          default:
            if (!t || t.length < 1 || !n || n.length < 1) return !1;
        }
        break;
      case "WEP":
        if (!t || !function (e) {
          switch (e.length) {
            case 5:
            case 13:
            case 16:
            case 29:
              return 1;
            case 10:
            case 26:
            case 32:
            case 58:
              return !/[^a-fA-F0-9]/.test(e);
            default:
              return;
          }
        }(t)) return !1;
    }
    return !0;
  },
  isWpsAvailable: function isWpsAvailable(e) {
    var t = this.getCapabilities(e);
    for (var _e = 0; _e < t.length; _e++) if (/WPS/.test(t[_e])) return !0;
    return !1;
  },
  isOpen: function isOpen(e) {
    return "" === this.getKeyManagement(e);
  },
  isEap: function isEap(e) {
    return -1 !== this.getKeyManagement(e).indexOf("EAP");
  },
  unionOfNetworks: function unionOfNetworks(e, t) {
    var _this = this;
    var n = e || {},
      s = [];
    return Object.keys(t).forEach(function (e) {
      n[e] && (_this.setSecurityValue(t[e], n[e].security), _this.setSignalStrength(t[e], n[e].signalStrength), _this.setRelSignalStrength(t[e], n[e].relSignalStrength), n[e] = t[e]);
    }), Object.keys(n).forEach(function (e) {
      s.push(n[e]);
    }), s;
  },
  networksArrayToObject: function networksArrayToObject(e) {
    var _this2 = this;
    var n = {};
    return [].forEach.call(e, function (e) {
      var t = _this2.getCompositedKey(e);
      n[t] = e;
    }), n;
  },
  onReqProxySuccess: function onReqProxySuccess(e, t, n) {
    e.result = this.unionOfNetworks(t, n), e.onsuccess();
  },
  getAvailableAndKnownNetworks: function getAvailableAndKnownNetworks() {
    var _this3 = this;
    var e = {
      onsuccess: function onsuccess() {},
      onerror: function onerror() {}
    };
    var t = {},
      n,
      s = null;
    var i = this.getWifiManager().getNetworks();
    return i.onsuccess = function () {
      n = _this3.networksArrayToObject(i.result), s = _this3.getWifiManager().getKnownNetworks(), s.onsuccess = function () {
        t = _this3.networksArrayToObject(s.result), _this3.onReqProxySuccess(e, n, t);
      }, s.onerror = function () {
        _this3.onReqProxySuccess(e, n, t);
      };
    }, i.onerror = function () {
      e.error = i.error, e.onerror();
    }, e;
  }
};
window.WifiHelper = WifiHelper;
