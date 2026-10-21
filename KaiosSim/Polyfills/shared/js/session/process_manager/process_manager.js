var ProcManager = {
  abort: function abort() {
    return taskScheduler.request({
      serverName: taskScheduler.PROCESS,
      funcName: "abort"
    });
  },
  add: function add() {
    for (var _len = arguments.length, e = new Array(_len), _key = 0; _key < _len; _key++) {
      e[_key] = arguments[_key];
    }
    return taskScheduler.request({
      serverName: taskScheduler.PROCESS,
      funcName: "add",
      args: e
    });
  },
  begin: function begin() {
    for (var _len2 = arguments.length, e = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      e[_key2] = arguments[_key2];
    }
    return taskScheduler.request({
      serverName: taskScheduler.PROCESS,
      funcName: "begin",
      args: e
    });
  },
  commit: function commit() {
    return taskScheduler.request({
      serverName: taskScheduler.PROCESS,
      funcName: "commit"
    });
  },
  pending: function pending() {
    return taskScheduler.request({
      serverName: taskScheduler.PROCESS,
      funcName: "pending"
    });
  },
  remove: function remove() {
    for (var _len3 = arguments.length, e = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      e[_key3] = arguments[_key3];
    }
    return taskScheduler.request({
      serverName: taskScheduler.PROCESS,
      funcName: "remove",
      args: e
    });
  },
  reset: function reset() {
    return taskScheduler.request({
      serverName: taskScheduler.PROCESS,
      funcName: "reset"
    });
  }
};
window.ProcManager = ProcManager;
