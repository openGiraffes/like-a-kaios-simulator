var AudioVolumeManager = {
  _observersArray: [],
  connected: !1,
  initFlag: !1,
  AudioVolumeState: {},
  init: function init() {
    var _this = this;
    this.initFlag || (this.initFlag = !0, window.addEventListener("session-disconnected", function () {
      _this.connected = !1;
    }), window.addEventListener("services-load-complete", function () {
      _this.connected || (_this.connected = !0, "undefined" != typeof lib_audiovolume && (_this.AudioVolumeState = lib_audiovolume.AudioVolumeState), _this.processPendingRequest());
    }));
  },
  requestVolumeDown: function requestVolumeDown() {
    return taskScheduler.request({
      serverName: taskScheduler.AUDIO_VOLUME,
      funcName: "requestVolumeDown"
    });
  },
  requestVolumeShow: function requestVolumeShow() {
    return taskScheduler.request({
      serverName: taskScheduler.AUDIO_VOLUME,
      funcName: "requestVolumeShow"
    });
  },
  requestVolumeUp: function requestVolumeUp() {
    return taskScheduler.request({
      serverName: taskScheduler.AUDIO_VOLUME,
      funcName: "requestVolumeUp"
    });
  },
  observeAudioVolumeChanged: function observeAudioVolumeChanged(e) {
    this.connected && window.api.audiovolumemanager.addEventListener(window.api.audiovolumemanager.AUDIO_VOLUME_CHANGED_EVENT, e), this._observersArray.push(e);
  },
  unobserveAudioVolumeChanged: function unobserveAudioVolumeChanged(r) {
    var _this2 = this;
    if (this.connected) {
      window.api.audiovolumemanager.removeEventListener(window.api.audiovolumemanager.AUDIO_VOLUME_CHANGED_EVENT, r);
      var i = !1;
      this._observersArray.forEach(function (e, o) {
        i || e !== r || (_this2._observersArray.splice(o, 1), i = !0);
      });
    }
  },
  processPendingRequest: function processPendingRequest() {
    var _this3 = this;
    this._observersArray.forEach(function (e) {
      _this3.connected && window.api.audiovolumemanager.addEventListener(window.api.audiovolumemanager.AUDIO_VOLUME_CHANGED_EVENT, e);
    });
  }
};
AudioVolumeManager.init(), window.AudioVolumeManager = AudioVolumeManager;
