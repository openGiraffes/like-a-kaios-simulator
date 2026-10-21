function getStorageIfAvailable(e, a, t, g) {
  var l = navigator.b2g.getDeviceStorage(e);
  l.available().onsuccess = function (e) {
    "available" !== e.target.result ? g && g(e.target.result) : l.freeSpace().onsuccess = function (e) {
      e.target.result < a ? g && g(e.target.result) : t(l);
    };
  };
}
window.getStorageIfAvailable = getStorageIfAvailable;
