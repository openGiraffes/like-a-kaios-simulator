!function (e) {
  var t = function () {
    var c = {
      ASYMMETRIC_ALGORITHM: "RSA-OAEP",
      SYMMETRIC_ALGORITHM: "AES-GCM"
    };
    var a = null,
      e = null;
    var t = function t() {
      return window.crypto.subtle.generateKey({
        name: c.ASYMMETRIC_ALGORITHM,
        modulusLength: 1024,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256"
      }, !0, ["wrapKey", "unwrapKey"]).then(function (e) {
        return a = e, window.crypto.subtle.exportKey("jwk", a.publicKey).catch(function (e) {});
      }).catch(function (e) {});
    };
    return {
      getKey: function getKey() {
        return e || (e = t());
      },
      generateKey: t,
      unwrapKey: function unwrapKey(e) {
        var t = e.encrypted,
          n = e.symmetricKey,
          r = e.iv;
        return window.crypto.subtle.unwrapKey("raw", n, a.privateKey, {
          name: c.ASYMMETRIC_ALGORITHM,
          hash: {
            name: "SHA-256"
          }
        }, {
          name: c.SYMMETRIC_ALGORITHM,
          length: 256
        }, !1, ["decrypt"]).then(function (e) {
          return function (e, t, n) {
            var r = new TextDecoder();
            return window.crypto.subtle.decrypt({
              name: c.SYMMETRIC_ALGORITHM,
              iv: n
            }, e, t).then(function (e) {
              return JSON.parse(r.decode(e));
            }).catch(function (e) {});
          }(e, t, r);
        }).catch(function (e) {});
      }
    };
  }();
  e.AccountCryptoHelper = t;
}(window);
