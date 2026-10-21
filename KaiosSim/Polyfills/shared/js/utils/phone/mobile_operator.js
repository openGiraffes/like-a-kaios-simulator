var SimCardsName = {};
var MobileInfo = {
    brazil: {
      carriers: {
        "00": "NEXTEL",
        "02": "TIM",
        "03": "TIM",
        "04": "TIM",
        "05": "CLARO",
        "06": "VIVO",
        "07": "CTBC",
        "08": "TIM",
        10: "VIVO",
        11: "VIVO",
        15: "SERCOMTEL",
        16: "OI",
        23: "VIVO",
        24: "OI",
        31: "OI",
        32: "CTBC",
        33: "CTBC",
        34: "CTBC",
        37: "AEIOU"
      },
      regions: {
        11: "SP",
        12: "SP",
        13: "SP",
        14: "SP",
        15: "SP",
        16: "SP",
        17: "SP",
        18: "SP",
        19: "SP",
        21: "RJ",
        22: "RJ",
        24: "RJ",
        27: "ES",
        28: "ES",
        31: "MG",
        32: "MG",
        33: "MG",
        34: "MG",
        35: "MG",
        37: "MG",
        38: "MG",
        41: "PR",
        42: "PR",
        43: "PR",
        44: "PR",
        45: "PR",
        46: "PR",
        47: "SC",
        48: "SC",
        49: "SC",
        51: "RS",
        53: "RS",
        54: "RS",
        55: "RS",
        61: "DF",
        62: "GO",
        63: "TO",
        64: "GO",
        65: "MT",
        66: "MT",
        67: "MS",
        68: "AC",
        69: "RO",
        71: "BA",
        73: "BA",
        74: "BA",
        75: "BA",
        77: "BA",
        79: "SE",
        81: "PE",
        82: "AL",
        83: "PB",
        84: "RN",
        85: "CE",
        86: "PI",
        87: "PE",
        88: "CE",
        89: "PI",
        91: "PA",
        92: "AM",
        93: "PA",
        94: "PA",
        95: "RR",
        96: "AP",
        97: "AM",
        98: "MA",
        99: "MA"
      }
    }
  },
  MobileOperator = {
    BRAZIL_MCC: "724",
    BRAZIL_CELLBROADCAST_CHANNEL: 50,
    userFacingInfo: function userFacingInfo(i) {
      var e = null,
        r = null;
      i.voice && i.voice.connected ? (e = i.voice.network, r = i.voice.cell) : i.data && "registered" === i.data.state && (e = i.data.network, r = i.data.cell);
      var a,
        n,
        c = i.iccId,
        o = navigator.b2g.iccManager.getIccById(c),
        t = o ? o.iccInfo : null;
      var s = e ? e.shortName || e.longName : null;
      s && t && t.isDisplaySpnRequired && t.spn && (s = t.isDisplayNetworkNameRequired && s !== t.spn ? "".concat(s, " ").concat(t.spn) : t.spn);
      var l = null,
        m = null;
      this.isBrazil(i, r, e) && (a = r.gsmLocationAreaCode % 100, n = MobileInfo.brazil.carriers, o = MobileInfo.brazil.regions, l = e ? n[e.mnc] || this.BRAZIL_MCC + e.mnc : null, m = o[a] ? "".concat(o[a], " ").concat(a) : "");
      i = i.imsHandler;
      return i && ("voice-over-wifi" === i.capability || "video-over-wifi" === i.capability) && t && t.isDisplaySpnRequired && t.spn && (s = t.spn), SimCardsName && SimCardsName[c] && (s = SimCardsName[c]), e && (i = navigator.language, dump(" MobileOperator currentLanguage = " + i), t = e.mcc, c = e.mnc, !s || "zh-CN" != i && "zh-TW" != i && "zh-HK" != i || ("460" != t || "00" != c && "04" != c && "07" != c && "08" != c) && ("460" != t || "01" != c && "09" != c) && ("460" != t || "03" != c && "11" != c) || (s = "????"), dump(" MobileOperator operator = " + s)), {
        operator: s,
        carrier: l,
        region: m
      };
    },
    isBrazil: function isBrazil(i, e, r) {
      return r ? r.mcc === this.BRAZIL_MCC && e && e.gsmLocationAreaCode : null;
    },
    isATTSimCard: function isATTSimCard(e) {
      if (e) {
        var r = e.iccId;
        if (r) {
          var i = ["380", "170", "150", "680", "070", "560", "410", "980", "38", "280"];
          e = navigator.b2g.iccManager.getIccById(r);
          if (e && e.iccInfo) {
            r = e.iccInfo.mcc, e = e.iccInfo.mnc;
            if (dump("miao isATTSimCard simmcc=" + r), dump("miao isATTSimCard simmnc=" + e), "310" === r && i.includes(e)) return !0;
          }
        }
      }
      return !1;
    },
    isTMOSimCard: function isTMOSimCard(e) {
      if (e) {
        var r = e.iccId;
        if (r) {
          var i = ["200", "210", "220", "230", "240", "250", "260"];
          e = navigator.b2g.iccManager.getIccById(r);
          if (e && e.iccInfo) {
            r = e.iccInfo.mcc, e = e.iccInfo.mnc;
            if (dump("miao isTMOSimCard simmcc=" + r), dump("miao isTMOSimCard simmnc=" + e), "310" === r && i.includes(e)) return !0;
          }
        }
      }
      return !1;
    },
    isATTOperator: function isATTOperator(i) {
      var e = null;
      i && (i.voice && i.voice.connected ? e = i.voice.network : i.data && "registered" === i.data.state && (e = i.data.network));
      if (e) {
        var r = e.mcc,
          i = e.mnc;
        if ("310" === r && ["380", "170", "150", "680", "070", "560", "410", "980", "38"].includes(i)) return !0;
      }
      return !1;
    }
  };
SettingsObserver && SettingsObserver.observe("custom.simcards.name", {}, function (i) {
  SimCardsName = i;
}), window.MobileInfo = MobileInfo, window.MobileOperator = MobileOperator;
