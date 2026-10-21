!function (t) {
  var i = navigator.b2g.iccManager;
  t.SIMSlotManager = {
    length: 0,
    instances: [],
    TIMEOUT_FOR_SIM2: 2e3,
    timerForSIM2: null,
    ready: !1,
    init: function init() {
      i && (this.conns = Array.prototype.slice.call(navigator.b2g.mobileConnections), this.length = this.conns.length, 0 !== this.conns.length && (this.conns.forEach(function (t, n) {
        this.instances.push(new SIMSlot(t, n, i.getIccById(t.iccId)));
      }, this), i.addEventListener("iccdetected", this), this.publishSIMSlotIfReady()));
    },
    isMultiSIM: function isMultiSIM() {
      return 1 < this.length;
    },
    isSIMCardAbsent: function isSIMCardAbsent(t) {
      var n = this.get(t);
      return !n || n.isAbsent();
    },
    hasOnlyOneSIMCardDetected: function hasOnlyOneSIMCardDetected() {
      var t = this.isSIMCardAbsent(0),
        n = this.isSIMCardAbsent(1);
      return t && !n || !t && n;
    },
    noSIMCardOnDevice: function noSIMCardOnDevice() {
      return !i || !i.iccIds || 0 === i.iccIds.length;
    },
    noSIMCardConnectedToNetwork: function noSIMCardConnectedToNetwork() {
      return !i || !i.iccIds || this.instances.every(function (t) {
        return t.conn.voice && t.conn.voice.emergencyCallsOnly;
      });
    },
    get: function get(t) {
      return t > this.length - 1 ? null : this.instances[t];
    },
    getMobileConnection: function getMobileConnection(t) {
      return t > this.length - 1 ? null : this.instances[t].conn;
    },
    getSlots: function getSlots() {
      return this.instances;
    },
    getSlotByIccId: function getSlotByIccId(n) {
      var i = null;
      return this.instances.some(function (t) {
        return !(!t.conn.iccId || t.conn.iccId !== n) && (i = t, !0);
      }, this), i;
    },
    waitForSecondSIM: function waitForSecondSIM() {
      var _this = this;
      this.timerForSIM2 = setTimeout(function () {
        clearTimeout(_this.timerForSIM2), _this.publishSIMSlotIsReady();
      }, this.TIMEOUT_FOR_SIM2);
    },
    publishSIMSlotIsReady: function publishSIMSlotIsReady() {
      this.ready || (this.ready = !0, t.dispatchEvent(new CustomEvent("simslotready")));
    },
    handleEvent: function handleEvent(t) {
      if ("iccdetected" === t.type) {
        var n = this.getSlotByIccId(t.iccId);
        n && (n.update(i.getIccById(t.iccId)), this.isMultiSIM() ? this.hasOnlyOneSIMCardDetected() ? this.waitForSecondSIM() : (clearTimeout(this.timerForSIM2), this.publishSIMSlotIsReady()) : this.publishSIMSlotIsReady());
      }
    },
    publishSIMSlotIfReady: function publishSIMSlotIfReady() {
      var n = 0;
      this.instances.forEach(function (t) {
        t.isAbsent() || n++;
      }, this), n !== this.instances.length ? !this.timerForSIM2 && this.isMultiSIM() && this.hasOnlyOneSIMCardDetected() && this.waitForSecondSIM() : this.publishSIMSlotIsReady();
    }
  }, SIMSlotManager.init();
}(window);
