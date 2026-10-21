var SimSettingsHelper = {
  ALWAYS_ASK_OPTION_VALUE: -1,
  callbacks: {
    outgoingCall: [],
    outgoingMessages: [],
    outgoingData: []
  },
  observe: function observe(e, t) {
    var a = this.callbacks[e];
    a && a.push(t);
  },
  unobserve: function unobserve(e, t) {
    var a = this.callbacks[e];
    !a || -1 < (t = a.indexOf(t)) && a.splice(t, 1);
  },
  getCardIndexFrom: function getCardIndexFrom(e) {
    return SettingsObserver.getValue({
      outgoingCall: "ril.telephony.defaultServiceId",
      outgoingMessages: "ril.sms.defaultServiceId",
      outgoingData: "ril.data.defaultServiceId"
    }[e]);
  },
  setServiceOnCard: function setServiceOnCard(e, t) {
    var a = [];
    switch (e) {
      case "outgoingCall":
        a = [{
          name: "ril.telephony.defaultServiceId",
          value: t
        }, {
          name: "ril.voicemail.defaultServiceId",
          value: t
        }];
        break;
      case "outgoingMessages":
        a = [{
          name: "ril.mms.defaultServiceId",
          value: t
        }, {
          name: "ril.sms.defaultServiceId",
          value: t
        }];
        break;
      case "outgoingData":
        a = [{
          name: "ril.data.defaultServiceId",
          value: t
        }];
    }
    a.length && SettingsObserver.setValue(a);
  },
  addSettingsObservers: function addSettingsObservers() {
    var _this = this;
    SettingsObserver.observe("ril.telephony.defaultServiceId", this.ALWAYS_ASK_OPTION_VALUE, function (t) {
      _this.callbacks.outgoingCall.forEach(function (e) {
        e(t);
      });
    }), SettingsObserver.observe("ril.sms.defaultServiceId", this.ALWAYS_ASK_OPTION_VALUE, function (t) {
      _this.callbacks.outgoingMessages.forEach(function (e) {
        e(t);
      });
    }), SettingsObserver.observe("ril.data.defaultServiceId", 0, function (t) {
      _this.callbacks.outgoingData.forEach(function (e) {
        e(t);
      });
    });
  }
};
SimSettingsHelper.addSettingsObservers(), window.SimSettingsHelper = SimSettingsHelper;
