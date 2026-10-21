!function (n) {
  n.ApnHelper = {
    getCompatible: function getCompatible(n, t, e) {
      return n && n[t] && n[t][e] || [];
    },
    getAll: function getAll(n, t, e) {
      return n && n[t] && n[t][e] || [];
    }
  };
}(window);
