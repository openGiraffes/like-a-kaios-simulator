function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
!function (e) {
  "use strict";

  e.FihImsManager = function () {
    var i = "FihImsManager";
    var t = !0;
    var d = "fih.volte.default.enable.bool",
      c = !0,
      s = "fih.volte.editable.bool",
      a = !0,
      u = "fih.setting.volte.enabled";
    var f = 1;
    var v = 3,
      g = "fih.vowifi.enable.dist.home.roaming.bool",
      m = !1,
      I = "fih.vowifi.default.enable.bool",
      b = !1,
      _ = "fih.vowifi.editable.bool",
      p = !0,
      C = "fih.vowifi.default.mode.int",
      h = 0,
      E = "fih.vowifi.editable.mode.bool",
      P = !0,
      w = "fih.vowifi.default.roaming.enable.bool",
      W = !1,
      V = "fih.vowifi.roaming.editable.bool",
      M = !0,
      S = "fih.vowifi.default.roaming.mode.int",
      L = 2,
      y = "fih.vowifi.roaming.editable.mode.bool",
      N = !1,
      H = "fih.setting.wfc.enabled",
      R = "fih.setting.wfc.mode",
      A = "fih.setting.wfc.roaming.enabled",
      k = "fih.setting.wfc.roaming.mode",
      O = {
        0: "cellular-preferred",
        1: "cellular-only",
        2: "wifi-preferred",
        3: "wifi-only"
      };
    var F = Object.freeze({
        start: -1,
        disabled: 0,
        enabled: 1,
        end: 2
      }),
      G = "fih.volte.provisioned",
      l = F.enabled,
      T = Object.freeze({
        start: -1,
        disabled: 0,
        enabled: 1,
        end: 2
      }),
      K = "fih.vowifi.provisioned",
      z = T.enabled,
      B = "ril.data.defaultServiceId",
      j = -1,
      o = ["device.dual-lte", "device.volte", "device.wifi", "device.vowifi"];
    var D = {
      "dual-Lte": null,
      voLte: null,
      wifi: null,
      voWifi: null,
      "load-status": null
    };
    var q = 1;
    var r = [];
    function x(n) {
      return new Promise(function (i, e) {
        SettingsObserver.setValue(n).then(function (e) {
          i(!0);
        }, function (e) {
          i(!1);
        });
      });
    }
    function J(n) {
      return new Promise(function (i, e) {
        SettingsObserver.getValue(n).then(function (e) {
          i(e);
        }, function (e) {
          i(!1);
        });
      });
    }
    function Q(e, i, n) {
      var t = navigator.b2g.mobileConnections[i];
      return t.getFihCustomizedValue(e, n);
    }
    function U(e, i) {
      var n = t ? e + "->" + i : "";
      return n;
    }
    function X(e) {
      var i = !1;
      var n = _typeof(e);
      return i = "string" == n ? "true" === e : e, i;
    }
    function Y(i, n) {
      if ("true" === D["load-status"]) ge("[_deviceFeature] device feature load complete for " + n), i && i();else if ("loading" === D["load-status"]) ge("[_deviceFeature] device feature loading for " + n), r.push(i);else {
        D["load-status"] = "loading", ge("[_deviceFeature] device feature start"), ge("[_deviceFeature] device feature loading for " + n), r.push(i);
        var _e = [];
        o.forEach(function (n) {
          _e.push(new Promise(function (i, e) {
            DeviceCapabilityManager.get(n).then(function (e) {
              i(!!e);
            });
          }));
        }), Promise.all(_e).then(function (e) {
          D["dual-Lte"] = e[0] + "", D.voLte = e[1] + "", D.wifi = e[2] + "", D.voWifi = e[3] + "", D["load-status"] = "true", ge("[_deviceFeature] device feature loaded " + r.length), r.forEach(function (e) {
            e && e();
          }), r.length = 0;
        });
      }
    }
    function Z(e) {
      var i = navigator.b2g.mobileConnections[e],
        e = i && i.voice && i.voice.roaming,
        i = i && i.voice && i.data.roaming;
      return X(e) || X(i);
    }
    function $() {
      return "connected" === navigator.b2g.wifiManager.connection.status && navigator.b2g.wifiManager.hasInternet;
    }
    function ee(s, a) {
      return new Promise(function (l, e) {
        Y(function () {
          if ("true" !== D.voLte) ge(U(a, "_getVolteEnabled") + " serviceId:" + s + " This device does not support VoLte"), l(!1);else {
            var _o = u,
              _r = d;
            var e = J(_o + s),
              i = Q(_r, s, "true"),
              n = se(s, U(a, "_getVolteEnabled")),
              t = J(B);
            Promise.all([e, i, n, t]).then(function (e) {
              var i = e[0];
              var n = e[1],
                t = e[2],
                e = void 0 === e[3] ? 0 : parseInt(e[3]);
              t === F.enabled ? "true" === D["dual-Lte"] || e === s ? (void 0 === i && (i = void 0 === n ? c : n), ge(U(a, "_getVolteEnabled") + " serviceId:" + s + " enabled_key:" + _o + " defaultEnabled_key:" + _r + " defaultEnabled:" + n + " userEnabled:" + i), l(X(i))) : (ge(U(a, "_getVolteEnabled") + " WARNING!!!  serviceId:" + s + " primarySim:" + e + " dual-Lte:" + ("true" === D["dual-Lte"])), l(!1)) : (ge(U(a, "_getVolteEnabled") + "serviceId:" + s + " volteProvisioned:" + t), l(!1));
            });
          }
        }, "_getVolteEnabled");
      });
    }
    function ie(r, l) {
      return new Promise(function (o, e) {
        Y(function () {
          if ("true" !== D.voLte) ge(U(l, "_getVolteEditable") + " serviceId:" + r + " This device does not support VoLte"), o(!1);else {
            var _t = s;
            var e = Q(_t, r, "true"),
              i = se(r, U(l, "_getVolteEditable")),
              n = J(B);
            Promise.all([e, i, n]).then(function (e) {
              var i = e[0];
              var n = e[1],
                e = void 0 === e[2] ? 0 : parseInt(e[2]);
              n === F.enabled ? "true" === D["dual-Lte"] || e === r ? (void 0 === i && (i = a), ge(U(l, "_getVolteEditable") + " serviceId:" + r + " defaultEditable_Key:" + _t + " defaultEditable:" + i), o(X(i))) : (ge(U(l, "_getVolteEditable") + " WARNING!!!  serviceId:" + r + " primarySim:" + e + " dual-Lte:" + ("true" === D["dual-Lte"])), o(!1)) : (ge(U(l, "_getVolteEditable") + "serviceId:" + r + " volteProvisioned:" + n), o(!1));
            });
          }
        }, "_getVolteEditable");
      });
    }
    function ne(a, d, c) {
      return new Promise(function (s, e) {
        Y(function () {
          "true" !== D.wifi || "true" !== D.voWifi ? (ge(U(c, "_getWifiCallingEnabled") + " serviceId:" + a + " This device does not support VoWifi"), s(!1)) : Q(g, a, "false").then(function (e) {
            var o = X(e);
            void 0 === o && (o = m);
            var r = o && d ? A : H,
              l = o && d ? w : I;
            var i = J(r + a),
              n = Q(l, a, "false"),
              t = ae(a, U(c, "_getWifiCallingEnabled")),
              e = J(B);
            Promise.all([i, n, t, e]).then(function (e) {
              var i = e[0];
              var n = e[1],
                t = e[2],
                e = void 0 === e[3] ? 0 : parseInt(e[3]);
              t === T.enabled ? "true" === D["dual-Lte"] || e === a && (-1 === j || j === a) ? (void 0 === i && (i = void 0 === n ? o && d ? W : b : n), ge(U(c, "_getWifiCallingEnabled") + " serviceId:" + a + " distinguish:" + o + " isRoaming:" + d + " enabled_key:" + r + " defaultEnabled_key:" + l + " defaultEnabled:" + n + " userEnabled:" + i), s(X(i))) : (ge(U(c, "_getWifiCallingEnabled") + " WARNING!!!  serviceId:" + a + " primarySim:" + e + " dual-Lte:" + ("true" === D["dual-Lte"]) + " _featrue_only_support_vowifi_slot:" + j), s(!1)) : (ge(U(c, "_getWifiCallingEnabled") + "serviceId:" + a + " wfcProvisioned:" + t), s(!1));
            });
          });
        }, "_getWifiCallingEnabled");
      });
    }
    function te(r, l, s) {
      return new Promise(function (o, e) {
        Y(function () {
          if ("true" !== D.wifi || "true" !== D.voWifi) ge(U(s, "_getWifiCallingEditable") + " serviceId:" + r + " This device does not support VoWifi"), o(!1);else {
            var _t2 = l ? V : _;
            var e = Q(_t2, r, "false"),
              i = ae(r, U(s, "_getWifiCallingEnabled")),
              n = J(B);
            Promise.all([e, i, n]).then(function (e) {
              var i = e[0];
              var n = e[1],
                e = void 0 === e[2] ? 0 : parseInt(e[2]);
              n === T.enabled ? "true" === D["dual-Lte"] || e === r && (-1 === j || j === r) ? (void 0 === i && (i = l ? M : p), ge(U(s, "_getWifiCallingEditable") + " serviceId:" + r + " isRoaming:" + l + " defaultEditable_Key:" + _t2 + " defaultEditable:" + i), o(X(i))) : (ge(U(s, "_getWifiCallingEditable") + " WARNING!!!  serviceId:" + r + " primarySim:" + e + " dual-Lte:" + ("true" === D["dual-Lte"]) + " _featrue_only_support_vowifi_slot:" + j), o(!1)) : (ge(U(s, "_getWifiCallingEditable") + "serviceId:" + r + " wfcProvisioned:" + n), o(!1));
            });
          }
        }, "_getWifiCallingEditable");
      });
    }
    function oe(l, s, a) {
      return new Promise(function (r, e) {
        Y(function () {
          var t = s ? k : R,
            o = s ? S : C;
          var e = J(t + l),
            i = Q(o, l, "0"),
            n = J(B);
          Promise.all([e, i, n]).then(function (e) {
            var i = e[0];
            var n = e[1],
              e = void 0 === e[2] ? 0 : parseInt(e[2]);
            "true" === D["dual-Lte"] || e === l && (-1 === j || j === l) ? (void 0 === i && (i = void 0 === n ? s ? L : h : n), ge(U(a, "_getWifiCallingMode") + " serviceId:" + l + " isRoaming:" + s + " mode_key:" + t + " defaultMode_key:" + o + " defaultMode:" + n + " userMode:" + i), r(parseInt(i))) : (ge(U(a, "_getWifiCallingMode") + " WARNING!!!  serviceId:" + l + " primarySim:" + e + " dual-Lte:" + ("true" === D["dual-Lte"]) + " _featrue_only_support_vowifi_slot:" + j), r(!1));
          });
        }, "_getWifiCallingMode");
      });
    }
    function re(r, l, s) {
      return new Promise(function (o, e) {
        Y(function () {
          var t = l ? y : E;
          var e = Q(t, r, "false"),
            i = ae(r, U(s, "_getWifiCallingModeEditable")),
            n = J(B);
          Promise.all([e, i, n]).then(function (e) {
            var i = e[0];
            var n = e[1],
              e = void 0 === e[2] ? 0 : parseInt(e[2]);
            n === T.enabled ? "true" === D["dual-Lte"] || e === r && (-1 === j || j === r) ? (void 0 === i && (i = l ? N : P), ge(U(s, "_getWifiCallingModeEditable") + " serviceId:" + r + " isRoaming:" + l + " defaultModeEditable_Key:" + t + " defaultModeEditable:" + i), o(X(i))) : (ge(U(s, "_getWifiCallingModeEditable") + " WARNING!!!  serviceId:" + r + " primarySim:" + e + " dual-Lte:" + ("true" === D["dual-Lte"]) + " _featrue_only_support_vowifi_slot:" + j), o(!1)) : (ge(U(s, "_getWifiCallingModeEditable") + "serviceId:" + r + " wfcProvisioned:" + n), o(!1));
          });
        }, "_getWifiCallingModeEditable");
      });
    }
    function le(e, i) {
      var n = !1;
      return ("VOLTE" === e && i > F.start && i < F.end || "VOWIFI" === e && i > T.start && i < T.end) && (n = !0), n;
    }
    function se(o, r) {
      return new Promise(function (t, e) {
        Y(function () {
          if ("true" !== D.voLte) ge(U(r, "_getVolteProvisioned") + " serviceId:" + o + " This device does not support VoLte"), t(F.disabled);else {
            var _n = G;
            var e = J(_n + o),
              i = J(B);
            Promise.all([e, i]).then(function (e) {
              var i = e[0];
              e = void 0 === e[1] ? 0 : parseInt(e[1]);
              "true" === D["dual-Lte"] || e === o ? (void 0 === i && (i = l), ge(U(r, "_getVolteProvisioned") + " serviceId:" + o + " provisioned_key:" + _n + " provisioned:" + i), t(parseInt(i))) : (ge(U(r, "_getVolteProvisioned") + " WARNING!!!  serviceId:" + o + " primarySim:" + e + " dual-Lte:" + ("true" === D["dual-Lte"])), t(F.disabled));
            });
          }
        }, "_getVolteProvisioned");
      });
    }
    function ae(o, r) {
      return new Promise(function (t, e) {
        Y(function () {
          if ("true" !== D.voLte) ge(U(r, "_getVowifiProvisioned") + " serviceId:" + o + " This device does not support VoLte"), t(T.disabled);else {
            var _n2 = K;
            var e = J(_n2 + o),
              i = J(B);
            Promise.all([e, i]).then(function (e) {
              var i = e[0];
              e = void 0 === e[1] ? 0 : parseInt(e[1]);
              "true" === D["dual-Lte"] || e === o && (-1 === j || j === o) ? (void 0 === i && (i = z), ge(U(r, "_getVowifiProvisioned") + " serviceId:" + o + " provisioned_key:" + _n2 + " provisioned:" + i), t(parseInt(i))) : (ge(U(r, "_getVowifiProvisioned") + " WARNING!!!  serviceId:" + o + " primarySim:" + e + " dual-Lte:" + ("true" === D["dual-Lte"]) + " _featrue_only_support_vowifi_slot:" + j), t(T.disabled));
            });
          }
        }, "_getVowifiProvisioned");
      });
    }
    function de(n, o, r) {
      return new Promise(function (i, e) {
        if (null != o) {
          if (void 0 === navigator.b2g.mobileConnections || null === navigator.b2g.mobileConnections) return ge(U(r, "_setImsEnable") + " serviceId:" + n + " isEnable:" + o + " --Mobile Connection Error--"), void i(X(!1));
          if ("true" === D["dual-Lte"]) {
            if (void 0 === navigator.b2g.mobileConnections[n] || null === navigator.b2g.mobileConnections[n]) return ge(U(r, "_setImsEnable") + " serviceId:" + n + " isEnable:" + o + " --Mobile serviceId Connection Error--"), void i(X(!1));
            if (void 0 === navigator.b2g.mobileConnections || null === navigator.b2g.mobileConnections || void 0 === navigator.b2g.mobileConnections[n] || null === navigator.b2g.mobileConnections[n]) return ge(U(r, "_setImsEnable") + " serviceId:" + n + " isEnable:" + o + " --Mobile Connection Error--"), void i(X(!1));
            var _e2 = navigator.b2g.mobileConnections[n].imsHandler;
            if (void 0 === _e2 || null === _e2) return ge(U(r, "_setImsEnable") + " serviceId:" + n + " isEnable:" + o + " --imsHandler Error--"), void i(X(!1));
            _e2.setEnabled(o).then(function () {
              ge(U(r, "_setImsEnable") + " serviceId:" + n + " isEnable:" + o + " bSuccess:true"), i(!0);
            }).catch(function (e) {
              ge(U(r, "_setImsEnable") + " serviceId:" + n + " isEnable:" + o + " bSuccess:false error:" + e), i(!1);
            });
          } else {
            var _e3 = [];
            var _loop = function _loop(_t3) {
              if (void 0 !== navigator.b2g.mobileConnections[_t3] && null !== navigator.b2g.mobileConnections[_t3] && void 0 !== navigator.b2g.mobileConnections[_t3].imsHandler && null !== navigator.b2g.mobileConnections[_t3].imsHandler) {
                var _n3 = navigator.b2g.mobileConnections[_t3].imsHandler;
                _e3.push(new Promise(function (i, e) {
                  _n3.setEnabled(o).then(function () {
                    ge(U(r, "_setImsEnable") + " serviceId:" + _t3 + " isEnable:" + o + " bSuccess:true"), i(!0);
                  }).catch(function (e) {
                    ge(U(r, "_setImsEnable") + " serviceId:" + _t3 + " isEnable:" + o + " bSuccess:false error:" + e), i(!1);
                  });
                }));
              } else ge(U(r, "_setImsEnable") + " serviceId:" + _t3 + " isEnable:" + o + " --imsHandler Error--i:" + _t3);
            };
            for (var _t3 = 0; _t3 < q; _t3++) {
              _loop(_t3);
            }
            0 < _e3.length ? Promise.all(_e3).then(function (e) {
              i(!0);
            }) : (ge(U(r, "_setImsEnable") + "error isEnable:" + o + " proList.length:" + _e3.length), i(!0));
          }
        } else i(!0);
      });
    }
    function ce(t, o, r) {
      return new Promise(function (i, e) {
        if (null != o) {
          if ("true" === D["dual-Lte"]) {
            if (void 0 === navigator.b2g.mobileConnections || null === navigator.b2g.mobileConnections || void 0 === navigator.b2g.mobileConnections[t] || null === navigator.b2g.mobileConnections[t]) return ge(U(r, "_setImsPreferred") + " serviceId:" + t + " preferred:" + o + " --Mobile Connection Error--"), void i(!1);
            var n = navigator.b2g.mobileConnections[t].imsHandler;
            if (null == n) return ge(U(r, "_setImsPreferred") + " serviceId:" + t + " preferred:" + o + " --imsHandler Error--"), void i(!1);
            n.setPreferredProfile(o).then(function () {
              ge(U(r, "_setImsPreferred") + " serviceId:" + t + " preferred:" + o + " bSuccess:true"), i(!0);
            }).catch(function (e) {
              ge(U(r, "_setImsPreferred") + " serviceId:" + t + " preferred:" + o + " bSuccess:false error:" + e), i(!1);
            });
          } else {
            var _e4 = [];
            var _loop2 = function _loop2(_t4) {
              if (void 0 !== navigator.b2g.mobileConnections[_t4] && null !== navigator.b2g.mobileConnections[_t4] && void 0 !== navigator.b2g.mobileConnections[_t4].imsHandler && null !== navigator.b2g.mobileConnections[_t4].imsHandler) {
                var _n4 = navigator.b2g.mobileConnections[_t4].imsHandler;
                _e4.push(new Promise(function (i, e) {
                  _n4.setPreferredProfile(o).then(function () {
                    ge(U(r, "_setImsPreferred") + " serviceId:" + _t4 + " preferred:" + o + " bSuccess:true"), i(!0);
                  }).catch(function (e) {
                    ge(U(r, "_setImsPreferred") + " serviceId:" + _t4 + " preferred:" + o + " bSuccess:false error:" + e), i(!1);
                  });
                }));
              } else ge(U(r, "_setImsPreferred") + " serviceId:" + _t4 + " preferred:" + o + " --imsHandler Error--i:" + _t4);
            };
            for (var _t4 = 0; _t4 < q; _t4++) {
              _loop2(_t4);
            }
            0 < _e4.length ? Promise.all(_e4).then(function (e) {
              i(!0);
            }) : (ge(U(r, "_setImsPreferred") + "error preferred:" + o + " proList.length:" + _e4.length), i(!0));
          }
        } else i(!0);
      });
    }
    function ue(l, s) {
      return new Promise(function (r, e) {
        J(B).then(function (e) {
          var i,
            n,
            t = void 0 === e ? 0 : parseInt(e);
          "true" === D["dual-Lte"] || t === l ? (i = ee(l, U(s, "_updateImsConfig")), n = ne(l, Z(l), U(s, "_updateImsConfig")), e = oe(l, Z(l), U(s, "_updateImsConfig")), Promise.all([i, n, e]).then(function (e) {
            var i = e[0];
            var n = e[1];
            e = e[2];
            !1 === $() && (ge(U(s, "_updateImsConfig") + " serviceId:" + l + " isWifiHasInternet:" + $()), n = !1);
            var t = null,
              o = null;
            i ? (t = !0, o = n ? O[e] : O[f]) : n ? (t = !0, o = O[v]) : t = !1, ge(U(s, "_updateImsConfig") + " serviceId:" + l + " imsEnable:" + t + " imsPreferred:" + o), de(l, t, U(s, "_updateImsConfig")).then(function (i) {
              X(i) ? ce(l, o, U(s, "_updateImsConfig")).then(function (e) {
                X(e) ? ge(U(s, "_updateImsConfig") + " serviceId:" + l + " imsSuccess:" + i + " imsModeSuccess:" + e) : ge(U(s, "_updateImsConfig") + " serviceId:" + l + " imsModeSuccess:" + e), r(!0);
              }) : (ge(U(s, "_updateImsConfig") + " serviceId:" + l + " imsSuccess:" + i), r(!0));
            });
          })) : (ge(U(s, "_updateImsConfig") + " WARNING!!!  serviceId:" + l + " primarySim:" + t + " dual-Lte:" + ("true" === D["dual-Lte"])), r(!0));
        });
      });
    }
    function fe(e, i) {
      var n = null,
        t = null;
      var o;
      return void 0 !== e && 0 <= e && (o = navigator.b2g.mobileConnections[e]) && o.iccId && (!(o = navigator.b2g.iccManager.getIccById(o.iccId)) || (o = o.iccInfo) && (t = o.msisdn || o.mdn)), t && (n = t.replace(/[^0-9]/gi, "")), ge(U(i, "_getSimNumber") + " serviceId:" + e + " simNumber:" + n + " formateSimMdn:" + t), n || "0";
    }
    function ve() {
      return new Promise(function (e, i) {
        e("0");
      });
    }
    function n(e, i) {
      t && dump(e + "==>" + i);
    }
    function ge(e) {
      n(i, e);
    }
    return {
      isNetRoaming: function isNetRoaming(e) {
        return Z(parseInt(e));
      },
      get isWifiHasInternet() {
        return $();
      },
      setVolteEnabled: function setVolteEnabled(e, i, n) {
        return l = parseInt(e), s = X(i), a = n, new Promise(function (r, e) {
          Y(function () {
            var e = ne(l, Z(l), U(a, "_setVolteEnabled")),
              i = oe(l, Z(l), U(a, "_setVolteEnabled")),
              n = se(l, U(a, "_setVolteEnabled")),
              t = J(B);
            Promise.all([e, i, n, t]).then(function (n) {
              var t = n[0];
              var o = n[1],
                e = n[2],
                i = void 0 === n[3] ? 0 : parseInt(n[3]);
              if (e === T.enabled) {
                n = s;
                if (!1 === $() && (ge(U(a, "_setVolteEnabled") + " serviceId:" + l + " isEnable:" + s + " isWifiHasInternet:" + $()), t = !1), "true" === D["dual-Lte"] || i === l) {
                  var _e5 = null,
                    _i = null;
                  n ? (_e5 = !0, _i = t ? O[o] : O[f]) : t ? (_e5 = !0, _i = O[v]) : _e5 = !1, ge(U(a, "_setVolteEnabled") + " serviceId:" + l + " isEnable:" + s + " imsEnable:" + _e5 + " imsPreferred:" + _i), de(l, _e5, U(a, "_setVolteEnabled")).then(function (e) {
                    X(e) ? ce(l, _i, U(a, "_setVolteEnabled")).then(function (e) {
                      if (X(e)) {
                        var _i2 = u;
                        x([{
                          name: _i2 + l,
                          value: s
                        }]).then(function (e) {
                          ge(U(a, "_setVolteEnabled") + " serviceId:" + l + " enabled_key:" + _i2 + " isEnable:" + s + " bSuccess:" + e), r(X(e));
                        });
                      } else ge(U(a, "_setVolteEnabled") + " serviceId:" + l + " imsModeSuccess:" + e), r(!1);
                    }) : (ge(U(a, "_setVolteEnabled") + " serviceId:" + l + " imsSuccess:" + e), r(!1));
                  });
                } else ge(U(a, "_setVolteEnabled") + " WARNING!!!  serviceId:" + l + " primarySim:" + i + " dual-Lte:" + ("true" === D["dual-Lte"])), r(!0);
              } else ge(U(a, "_setVolteEnabled") + "serviceId:" + l + " volteProvisioned:" + e), r(!1);
            });
          }, "_setVolteEnabled");
        });
        var l, s, a;
      },
      getVolteEnabled: function getVolteEnabled(e, i) {
        return ee(parseInt(e), i);
      },
      getVolteEditable: function getVolteEditable(e, i) {
        return ie(parseInt(e), i);
      },
      setWifiCallingEnabled: function setWifiCallingEnabled(e, i, n, t) {
        return l = parseInt(e), s = i, a = X(n), d = t, new Promise(function (r, e) {
          Y(function () {
            var e = ee(l, U(d, "_setWifiCallingEnabled")),
              i = oe(l, s, U(d, "_setWifiCallingEnabled")),
              n = ae(l, U(d, "_setWifiCallingEnabled")),
              t = J(B);
            Promise.all([e, i, n, t]).then(function (e) {
              var t = e[0],
                o = e[1],
                i = e[2],
                e = void 0 === e[3] ? 0 : parseInt(e[3]);
              if (i === T.enabled) {
                var _n5 = a;
                if (!1 === $() && (ge(U(d, "_setWifiCallingEnabled") + " serviceId:" + l + " isEnable:" + a + " isWifiHasInternet:" + $()), _n5 = !1), "true" === D["dual-Lte"] || e === l && (-1 === j || j === l)) {
                  var _e6 = null,
                    _i3 = null;
                  _n5 ? (_e6 = !0, _i3 = t ? O[o] : O[v]) : t ? (_e6 = !0, _i3 = O[f]) : _e6 = !1, ge(U(d, "_setWifiCallingEnabled") + " serviceId:" + l + " isEnable:" + a + " imsEnable:" + _e6 + " imsPreferred:" + _i3), de(l, _e6, U(d, "_setWifiCallingEnabled")).then(function (e) {
                    X(e) ? ce(l, _i3, U(d, "_setWifiCallingEnabled")).then(function (e) {
                      X(e) ? Q(g, l, "false").then(function (e) {
                        var i = X(e);
                        void 0 === i && (i = m);
                        var n = i && s ? A : H;
                        x([{
                          name: n + l,
                          value: a
                        }]).then(function (e) {
                          ge(U(d, "_setWifiCallingEnabled") + " serviceId:" + l + " distinguish:" + i + " isRoaming:" + s + " enabled_key:" + n + " isEnable:" + a + " bSuccess:" + e), r(X(e));
                        });
                      }) : (ge(U(d, "_setWifiCallingEnabled") + " serviceId:" + e + " imsModeSuccess:"), r(!1));
                    }) : (ge(U(d, "_setWifiCallingEnabled") + " serviceId:" + l + " imsSuccess:"), r(!1));
                  });
                } else ge(U(d, "_setWifiCallingEnabled") + " WARNING!!!  serviceId:" + l + " primarySim:" + e + " dual-Lte:" + ("true" === D["dual-Lte"]) + " _featrue_only_support_vowifi_slot:" + j), r(!0);
              } else ge(U(d, "_setWifiCallingEnabled") + "serviceId:" + l + " wfcProvisioned:" + i), r(!1);
            });
          }, "_setWifiCallingEnabled");
        });
        var l, s, a, d;
      },
      getWifiCallingEnabled: function getWifiCallingEnabled(e, i, n) {
        return ne(parseInt(e), i, n);
      },
      getWifiCallingEditable: function getWifiCallingEditable(e, i, n) {
        return te(parseInt(e), i, n);
      },
      setWifiCallingMode: function setWifiCallingMode(e, i, n, t) {
        return r = parseInt(e), l = i, s = parseInt(n), a = t, new Promise(function (o, e) {
          Y(function () {
            var e = ee(r, U(a, "_setWifiCallingMode")),
              i = ne(r, Z(r), U(a, "_setWifiCallingMode")),
              n = ae(r, U(a, "_setWifiCallingMode")),
              t = J(B);
            Promise.all([e, i, n, t]).then(function (e) {
              var n = e[0];
              var t = e[1];
              var i = e[2],
                e = void 0 === e[3] ? 0 : parseInt(e[3]);
              if (i === T.enabled) {
                if (!1 === $() && (ge(U(a, "_setWifiCallingMode") + " serviceId:" + r + " mode:" + s + " isWifiHasInternet:" + $()), t = !1), "true" === D["dual-Lte"] || e === r && (-1 === j || j === r)) {
                  var _e7 = null,
                    _i4 = null;
                  n ? (_e7 = !0, _i4 = t ? O[s] : O[f]) : t ? (_e7 = !0, _i4 = O[v]) : _e7 = !1, ge(U(a, "_setWifiCallingMode") + " serviceId:" + r + " mode:" + s + " imsEnable:" + _e7 + " imsPreferred:" + _i4), de(r, _e7, U(a, "_setWifiCallingMode")).then(function (e) {
                    X(e) ? ce(r, _i4, U(a, "_setWifiCallingMode")).then(function (e) {
                      if (X(e)) {
                        if (l) {
                          var _i5 = k;
                          x([{
                            name: _i5 + r,
                            value: s
                          }]).then(function (e) {
                            ge(U(a, "_setWifiCallingMode") + " serviceId:" + r + " isRoaming:" + l + " mode_key:" + _i5 + " mode:" + s + " bSuccess:" + e), o(X(e));
                          });
                        } else re(r, !0, U(a, "_setWifiCallingMode")).then(function (i) {
                          var e = [];
                          var n, t;
                          e = i ? [{
                            name: R + r,
                            value: s
                          }] : (n = R + r, t = k + r, [{
                            name: n,
                            value: s
                          }, {
                            name: t,
                            value: s
                          }]), x(e).then(function (e) {
                            ge(U(a, "_setWifiCallingMode") + " serviceId:" + r + " isRoaming:" + l + " roamingModeEditable:" + i + " mode:" + s + " bSuccess:" + e), o(X(e));
                          });
                        });
                      } else ge(U(a, "_setWifiCallingMode") + " serviceId:" + r + " imsModeSuccess:" + e), o(!1);
                    }) : (ge(U(a, "_setWifiCallingMode") + " serviceId:" + r + " imsSuccess:" + e), o(!1));
                  });
                } else ge(U(a, "_setWifiCallingMode") + " WARNING!!!  serviceId:" + r + " primarySim:" + e + " dual-Lte:" + ("true" === D["dual-Lte"]) + " _featrue_only_support_vowifi_slot:" + j), o(!1);
              } else ge(U(a, "_setWifiCallingMode") + "serviceId:" + r + " wfcProvisioned:" + i), o(!1);
            });
          }, "_setWifiCallingMode");
        });
        var r, l, s, a;
      },
      getWifiCallingMode: function getWifiCallingMode(e, i, n) {
        return oe(parseInt(e), i, n);
      },
      getWifiCallingModeEditable: function getWifiCallingModeEditable(e, i, n) {
        return re(parseInt(e), i, n);
      },
      isWifiCallingHideRoamingModeOnHome: function isWifiCallingHideRoamingModeOnHome(e, i) {
        return o = parseInt(e), r = i, new Promise(function (t, e) {
          Y(function () {
            var n = "fih.vowifi.hide.roaming.mode.onhome.bool",
              e = Q(n, o, "false");
            e.then(function (e) {
              var i = e;
              void 0 === i && (i = !1), ge(U(r, "_isWifiCallingHideRoamingModeOnHome") + " serviceId:" + o + " hideRoamingModeOnHome_Key:" + n + " hideRoamingModeOnHome:" + i), t(X(i));
            });
          }, "_isWifiCallingHideRoamingModeOnHome");
        });
        var o, r;
      },
      isWifiCallingHideHomeModeOnRoaming: function isWifiCallingHideHomeModeOnRoaming(e, i) {
        return o = parseInt(e), r = i, new Promise(function (t, e) {
          Y(function () {
            var n = "fih.vowifi.hide.home.mode.onroaming.bool";
            Q(n, o, "false").then(function (e) {
              var i = e;
              void 0 === i && (i = !1), ge(U(r, "_isWifiCallingHideHomeModeOnRoaming") + " serviceId:" + o + " hideHomeModeOnRoaming_Key:" + n + " hideHomeModeOnRoaming:" + i), t(X(i));
            });
          }, "_isWifiCallingHideHomeModeOnRoaming");
        });
        var o, r;
      },
      isSupportWifiCallingOnAirplane: function isSupportWifiCallingOnAirplane(e, i) {
        return r = parseInt(e), l = i, new Promise(function (n, e) {
          var t = "fih.vowifi.support.on.airplane.bool";
          var i = Q(t, r, "true"),
            o = ae(r, U(l, "_isSupportWifiCallingOnAirplane"));
          Promise.all([i, o]).then(function (e) {
            var i = e[0];
            e = e[1];
            e === T.enabled ? (void 0 === i && (i = !0), ge(U(l, "_isSupportWifiCallingOnAirplane") + " serviceId:" + r + " supportInAirplane_Key:" + t + " supportInAirplane:" + i), n(X(i))) : (ge(U(l, "_isSupportWifiCallingOnAirplane") + "serviceId:" + r + " wfcProvisioned:" + e), n(!1));
          });
        });
        var r, l;
      },
      get volteProvisionedMap() {
        return F;
      },
      volteProvisionedKey: function volteProvisionedKey(e) {
        return G + parseInt(e);
      },
      setVolteProvisioned: function setVolteProvisioned(e, i, n, t) {
        return o = parseInt(e), r = parseInt(i), l = X(n), s = t, new Promise(function (n, e) {
          if (!le("VOLTE", r)) return ge(U(s, "_setVolteProvisioned") + " serviceId:" + o + " provision:" + r + " Value not allowed!"), void n(!1);
          Y(function () {
            var e = se(o, U(s, "_setVolteProvisioned")),
              i = J(B);
            Promise.all([e, i]).then(function (e) {
              var i = e[0],
                e = void 0 === e[1] ? 0 : parseInt(e[1]);
              if (i !== r) {
                if ("true" === D["dual-Lte"] || e === o) {
                  var _i6 = G;
                  x([{
                    name: _i6 + o,
                    value: r
                  }]).then(function (e) {
                    e && l ? ue(o, U(s, "_setVolteProvisioned")).then(function (e) {
                      ge(U(s, "_setVolteProvisioned") + " serviceId:" + o + " provisioned_key:" + _i6 + " provision:" + r + " immediately:" + l + " bSuccess:" + e), n(X(e));
                    }) : (ge(U(s, "_setVolteProvisioned") + " serviceId:" + o + " provisioned_key:" + _i6 + " provision:" + r + " immediately:" + l + " bSuccess:" + e), n(X(e)));
                  });
                } else ge(U(s, "_setVolteProvisioned") + " WARNING!!!  serviceId:" + o + " primarySim:" + e + " dual-Lte:" + ("true" === D["dual-Lte"])), n(!0);
              } else n(!0);
            });
          }, "_setVolteProvisioned");
        });
        var o, r, l, s;
      },
      getVolteProvisioned: function getVolteProvisioned(e, i) {
        return se(parseInt(e), i);
      },
      get vowifiProvisionedMap() {
        return T;
      },
      vowifiProvisionedKey: function vowifiProvisionedKey(e) {
        return K + parseInt(e);
      },
      setVowifiProvisioned: function setVowifiProvisioned(e, i, n, t) {
        return o = parseInt(e), r = parseInt(i), l = X(n), s = t, new Promise(function (n, e) {
          if (!le("VOWIFI", r)) return ge(U(s, "_setVowifiProvisioned") + " serviceId:" + o + " provision:" + r + " Value not allowed!"), void n(!1);
          Y(function () {
            var e = ae(o, U(s, "_setVowifiProvisioned")),
              i = J(B);
            Promise.all([e, i]).then(function (e) {
              var i = e[0],
                e = void 0 === e[1] ? 0 : parseInt(e[1]);
              if (i !== r) {
                if ("true" === D["dual-Lte"] || e === o && (-1 === j || j === o)) {
                  var _i7 = K;
                  x([{
                    name: _i7 + o,
                    value: r
                  }]).then(function (e) {
                    e && l ? ue(o, U(s, "_setVowifiProvisioned")).then(function (e) {
                      ge(U(s, "_setVolteProvisioned") + " serviceId:" + o + " provisioned_key:" + _i7 + " provision:" + r + " immediately:" + l + " bSuccess:" + e), n(X(e));
                    }) : (ge(U(s, "_setVowifiProvisioned") + " serviceId:" + o + " provisioned_key:" + _i7 + " provision:" + r + " immediately:" + l + " bSuccess:" + e), n(X(e)));
                  });
                } else ge(U(s, "_setVowifiProvisioned") + " WARNING!!!  serviceId:" + o + " primarySim:" + e + " dual-Lte:" + ("true" === D["dual-Lte"]) + " _featrue_only_support_vowifi_slot:" + j), n(!0);
              } else n(!0);
            });
          }, "_setVolteProvisioned");
        });
        var o, r, l, s;
      },
      getVowifiProvisioned: function getVowifiProvisioned(e, i) {
        return ae(parseInt(e), i);
      },
      updateImsConfig: function updateImsConfig(e, i) {
        return ue(parseInt(e), i);
      },
      enableImsConfig: function enableImsConfig(e, i, n) {
        return t = parseInt(e), o = X(i), r = n, new Promise(function (i, e) {
          J(B).then(function (e) {
            e = void 0 === e ? 0 : parseInt(e);
            "true" === D["dual-Lte"] || e === t ? o ? ue(t, U(r, "_enableImsConfig")).then(function (e) {
              ge(U(r, "_enableImsConfig") + " serviceId:" + t + " isEnable:" + o + " bSuccess:" + e), i(X(e));
            }) : de(t, !1, U(r, "_enableImsConfig")).then(function (e) {
              ge(U(r, "_enableImsConfig") + " serviceId:" + t + " isEnable:" + o + " bSuccess:" + e), i(X(e));
            }) : (ge(U(r, "_enableImsConfig") + " WARNING!!!  serviceId:" + t + " primarySim:" + e + " dual-Lte:" + ("true" === D["dual-Lte"])), i(!0));
          });
        });
        var t, o, r;
      },
      updateVolteVowifiSettingsShow: function updateVolteVowifiSettingsShow(e, i) {
        return r = parseInt(e), l = i, new Promise(function (o, e) {
          J(B).then(function (e) {
            var i = void 0 === e ? 0 : parseInt(e);
            if ("true" === D["dual-Lte"] || i === r) {
              var _t5 = Z(r);
              var n = ie(r, U(l, "_updateVolteVowifiSettingsShow")),
                e = te(r, _t5, U(l, "_updateVolteVowifiSettingsShow"));
              Promise.all([n, e]).then(function (e) {
                var i = e[0] || e[1],
                  n = "volte_vowifi_settings.show";
                x([{
                  name: n,
                  value: i
                }]).then(function (e) {
                  ge(U(l, "_updateVolteVowifiSettingsShow") + " serviceId:" + r + " isRoaming:" + _t5 + " mode_key:" + n + " isShow:" + i + " bSuccess:" + e), o(X(e));
                });
              });
            } else ge(U(l, "_updateVolteVowifiSettingsShow") + " WARNING!!!  serviceId:" + r + " primarySim:" + i + " dual-Lte:" + ("true" === D["dual-Lte"])), o(!0);
          });
        });
        var r, l;
      },
      isWifiCallMissEcc: function isWifiCallMissEcc(e, i) {
        return n = parseInt(e), t = i, e = o = null, void 0 !== n && 0 <= n && !(e = (i = navigator.b2g.mobileConnections[n]) && i.voice && i.voice.network && i.voice.network.mcc ? i.voice.network.mcc + i.voice.network.mnc : e) && i.iccId && (e = (i = navigator.b2g.iccManager.getIccById(i.iccId)) && i.iccInfo ? i.iccInfo.mcc + i.iccInfo.mnc : null), e && ("20205" === e || "20404" === e || "21401" === e || "21670" === e || "22210" === e || "23003" === e || "26202" === e || "26209" === e || "26801" === e || "22601" === e || "27602" === e ? o = "Vodafone" : "20601" === e && (o = "")), ge(U(t, "_isWifiCallMissEcc") + " serviceId:" + n + " missEccOpt:" + o), o;
        var n, t, o;
      },
      getClaroArgentianWebLink: function getClaroArgentianWebLink(e, i) {
        return n = parseInt(e), t = i, e = o = null, void 0 !== n && 0 <= n && (i = navigator.b2g.mobileConnections[n]).iccId && (e = (i = navigator.b2g.iccManager.getIccById(i.iccId)) && i.iccInfo ? i.iccInfo.mcc + i.iccInfo.mnc : null), e && "722310" === e && (o = "https://landing.claro.com.ar/clarovowifi/"), ge(U(t, "_getClaroArgentianWebLink") + " serviceId:" + n + " linkClaro:" + o), o;
        var n, t, o;
      },
      isVzwCard: function isVzwCard(e, i) {
        return n = parseInt(e), t = i, o = !1, e = null, void 0 !== n && 0 <= n && (i = navigator.b2g.mobileConnections[n]).iccId && (e = (i = navigator.b2g.iccManager.getIccById(i.iccId)) && i.iccInfo ? i.iccInfo.mcc + i.iccInfo.mnc : null), e && ("310004" !== e && "310010" !== e && "310012" !== e && "310013" !== e && "310890" !== e && "310910" !== e && "311110" !== e && "311270" !== e && "311271" !== e && "311272" !== e && "311273" !== e && "311274" !== e && "311275" !== e && "311276" !== e && "311277" !== e && "311277" !== e && "311279" !== e && "311280" !== e && "311281" !== e && "311282" !== e && "311283" !== e && "311284" !== e && "311285" !== e && "311286" !== e && "311287" !== e && "311288" !== e && "311289" !== e && "311390" !== e && "311480" !== e && "311481" !== e && "311482" !== e && "311483" !== e && "311484" !== e && "311485" !== e && "311486" !== e && "311487" !== e && "311488" !== e && "311489" !== e || (o = !0)), ge(U(t, "_isVzwCard") + " serviceId:" + n + " bVzwCard:" + o), o;
        var n, t, o;
      },
      isTmoCard: function isTmoCard(e, i) {
        return n = parseInt(e), t = i, o = !1, e = null, void 0 !== n && 0 <= n && (i = navigator.b2g.mobileConnections[n]).iccId && (e = (i = navigator.b2g.iccManager.getIccById(i.iccId)) && i.iccInfo ? i.iccInfo.mcc + i.iccInfo.mnc : null), e && ("310260" !== e && "310240" !== e || (o = !0)), ge(U(t, "_isTmoCard") + " serviceId:" + n + " bTmoCard:" + o), o;
        var n, t, o;
      },
      matchSimMdnAndWiFiMdn: function matchSimMdnAndWiFiMdn(e, i) {
        return t = parseInt(e), o = i, new Promise(function (n, e) {
          ve(U(o, "_matchSimMdnAndWiFiMdn")).then(function (e) {
            var i = e,
              e = fe(t, U(o, "_matchSimMdnAndWiFiMdn"));
            null == i || 0 === i.length || "0" === i || null == e || 0 === e.length || "0" === e ? (ge(U(o, "_matchSimMdnAndWiFiMdn") + " serviceId:" + t + " simNumber:" + e + " wifiMdn:" + i + " match:false"), n(!1)) : (ge(U(o, "_matchSimMdnAndWiFiMdn") + " serviceId:" + t + " simNumber:" + e + " wifiMdn:" + i + " match:" + (i === e)), n(i === e));
          });
        });
        var t, o;
      },
      getSimNumber: function getSimNumber(e, i) {
        return fe(parseInt(e), i);
      },
      wifiMdnChangedByApKey: function wifiMdnChangedByApKey(e) {
        return "fih.wifi.mdn.changed.by.ap" + parseInt(e);
      },
      getWiFiMdn: function getWiFiMdn(e, i) {
        return ve(parseInt(e));
      },
      setWiFiMdn: function setWiFiMdn(e, i, n, t) {
        return parseInt(e), X(n), new Promise(function (e, i) {
          e(!1);
        });
      },
      setProvisionedImsConfig: function setProvisionedImsConfig(e, i, n, t) {
        return o = parseInt(e), r = i, l = parseInt(n), s = t, new Promise(function (e, i) {
          var n = navigator.b2g.mobileConnections[o].imsHandler;
          if (void 0 === n || null === n) return ge(U(s, "_setProvisionedImsConfig") + " serviceId:" + o + " configItem:" + r + " value: " + l + " --imsHandler Error--"), void e(!1);
          ge(U(s, "_setProvisionedImsConfig") + " serviceId:" + o + " configItem:" + r + " value: " + l);
          var t = n.SetImsConfig(r, l);
          t.onsuccess = function () {
            ge(U(s, "_setProvisionedImsConfig") + " serviceId:" + o + " configItem success"), e(!0);
          }, t.onerror = function () {
            ge(U(s, "_setProvisionedImsConfig") + " serviceId:" + o + "  set ProvisionedImsConfig onerror " + t.result), e(!1);
          };
        });
        var o, r, l, s;
      },
      getProvisionedImsConfig: function getProvisionedImsConfig(e, i, n) {
        return o = parseInt(e), r = i, l = n, new Promise(function (i, e) {
          var n = navigator.b2g.mobileConnections[o].imsHandler;
          if (void 0 === n || null === n) return ge(U(l, "_getProvisionedImsConfig") + " serviceId:" + o + " configItem:" + r + " --imsHandler Error--"), void i("");
          ge(U(l, "_getProvisionedImsConfig") + " serviceId:" + o + " configItem:" + r);
          var t = n.GetImsConfig(r);
          t.onsuccess = function () {
            var e = t.result;
            ge(U(l, "_getProvisionedImsConfig") + " serviceId:" + o + " configItem value:" + e), i(null != e && "" !== e ? e : "");
          }, t.onerror = function () {
            ge(U(l, "_getProvisionedImsConfig") + " serviceId:" + o + "  get ProvisionedImsConfig onerror " + t.result), i("");
          };
        });
        var o, r, l;
      },
      logd: function logd(e, i) {
        n(e, i);
      }
    };
  }();
}(this);
