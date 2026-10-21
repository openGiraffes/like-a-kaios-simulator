var DeviceCapabilityManager = {
  get: function get() {
    for (var _len = arguments.length, e = new Array(_len), _key = 0; _key < _len; _key++) {
      e[_key] = arguments[_key];
    }
    return new Promise(function (a) {
      taskScheduler.request({
        serverName: taskScheduler.DEVICE_CAPABILITY,
        funcName: "get",
        args: e
      }).then(function (e) {
        a(e);
      }, function () {
        a(void 0);
      });
    });
  }
};
window.DeviceCapabilityManager = DeviceCapabilityManager;
