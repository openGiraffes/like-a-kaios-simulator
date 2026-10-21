function TaskScheduler() {
  var _this = this;
  this.connected = !1, this.taskId = 0, this.taskQueue = new Map(), this.serversName = ["settings", "power", "usb", "accounts", "apps", "tcp_socket", "telephony", "device_capability", "contacts", "audio_volume", "process", "time_service"], this.setServersNameConst(), window.addEventListener("services-load-complete", function () {
    _this.connected = !0, _this.taskQueue.forEach(function (e) {
      _this.doTask(e);
    }), _this.taskQueue.clear(), _this.taskId = 0;
  }), window.addEventListener("session-disconnected", function () {
    _this.connected = !1;
  });
}
TaskScheduler.prototype.setServersNameConst = function () {
  var _this2 = this;
  this.serversName.forEach(function (e) {
    _this2[e.toUpperCase()] = e;
  });
}, TaskScheduler.prototype.getServer = function (e) {
  var s = null;
  switch (e) {
    case this.SETTINGS:
      s = window.api.settingsmanager;
      break;
    case this.POWER:
      s = window.api.powermanager;
      break;
    case this.USB:
      s = window.api.usbmanager;
      break;
    case this.ACCOUNTS:
      s = window.api.accountmanager;
      break;
    case this.APPS:
      s = window.api.appsmanager;
      break;
    case this.TCP_SOCKET:
      s = window.api.tcpsocketmanager;
      break;
    case this.TELEPHONY:
      s = window.api.telephonymanager;
      break;
    case this.DEVICE_CAPABILITY:
      s = window.api.devicecapabilitymanager;
      break;
    case this.CONTACTS:
      s = window.api.contactsmanager;
      break;
    case this.AUDIO_VOLUME:
      s = window.api.audiovolumemanager;
      break;
    case this.PROCESS:
      s = window.api.procmanager;
      break;
    case this.TIME_SERVICE:
      s = window.api.timeservice;
  }
  return s;
}, TaskScheduler.prototype.enqueue = function (e) {
  return this.taskId++, this.taskQueue.has(this.taskId) || this.taskQueue.set(this.taskId, e), this.taskId;
}, TaskScheduler.prototype.request = function (n) {
  var _this3 = this;
  return new Promise(function (s, t) {
    var e = n.serverName,
      a = n.funcName,
      i = n.args,
      i = {
        serverName: e,
        funcName: a,
        args: i,
        resolve: function resolve(e) {
          taskScheduler.dequeue(r), s(e);
        },
        reject: function reject(e) {
          e && "session_closed" === e.reason || (taskScheduler.dequeue(r), t(e));
        }
      };
    var r = _this3.enqueue(i);
    _this3.doTask(i);
  });
}, TaskScheduler.prototype.doTask = function (s) {
  if (this.connected) {
    var _s = s,
      t = _s.serverName,
      a = _s.funcName,
      i = _s.args,
      r = _s.resolve,
      s = _s.reject,
      t = this.getServer(t);
    if (t) {
      var e = null;
      e = "function" == typeof a ? a : t[a], e.apply(t, i).then(r, s);
    }
  }
}, TaskScheduler.prototype.dequeue = function (e) {
  this.taskQueue.delete(e);
}, TaskScheduler.prototype.clearLastTask = function () {
  this.taskId && (this.taskQueue.delete(this.taskId), this.taskId--);
}, window.taskScheduler = new TaskScheduler();
var _window = window,
  taskScheduler = _window.taskScheduler;
