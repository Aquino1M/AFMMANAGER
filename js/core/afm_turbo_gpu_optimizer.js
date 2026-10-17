(function() {
  // Escudo Anti-Freeze: Desativa MutationObservers recursivos que travam o clique nas abas
  window.MutationObserver = function() {
    return {
      observe: function() {},
      disconnect: function() {},
      takeRecords: function() { return []; }
    };
  };
})();
