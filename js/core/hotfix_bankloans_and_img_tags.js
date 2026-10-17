(function() {
  
window.__afmAsRoundArray = window.__afmAsRoundArray || function(r) {
  if (!r) return [];
  if (Array.isArray(r)) return r;
  if (Array.isArray(r.matches)) return r.matches;
  if (Array.isArray(r.fixtures)) return r.fixtures;
  if (Array.isArray(r.games)) return r.games;
  if (Array.isArray(r.items)) return r.items;
  if (Array.isArray(r.list)) return r.list;
  if (typeof r === 'object') {
    var vals = Object.values(r).filter(function(v) {
      return v && typeof v === 'object' && (v.home || v.away || v.homeTeam || v.teamA || v.clubA || v.id);
    });
    if (vals.length > 0) return vals;
  }
  return [];
};


  window.AFM_SafeImg = function(img) {
    if (!img || img.dataset.fallbackApplied) return;
    img.dataset.fallbackApplied = '1';
    var label = (img.alt || 'AFM').replace(/[^A-Za-z0-9]/g, '').slice(0, 3).toUpperCase() || 'FC';
    img.src = "data:image/svg+xml;utf8," + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
      '<rect width="100" height="100" rx="18" fill="#1e293b"/>' +
      '<text x="50" y="58" font-family="Arial,sans-serif" font-size="28" font-weight="bold" fill="#94a3b8" text-anchor="middle">' + label + '</text></svg>'
    );
  };

  window.AFM_EnsureSafeState = function() {
    var st = window.state || window.GameState;
    if (!st || typeof st !== 'object') return;
    ['bankLoans', 'loans'].forEach(function(k) {
      if (st[k] !== undefined && !Array.isArray(st[k])) {
        st[k] = (st[k] && typeof st[k] === 'object') ? Object.values(st[k]) : [];
      } else if (st[k] === undefined) {
        st[k] = [];
      }
    });
    if (st.finances && typeof st.finances === 'object' && st.finances.bankLoans !== undefined && !Array.isArray(st.finances.bankLoans)) {
      st.finances.bankLoans = Array.isArray(st.bankLoans) ? st.bankLoans : [];
    }

    // Normaliza rodadas de competicoes (Libertadores, Intercontinental, Temporada) para nunca quebrar round.filter
    var comps = st.competitions || st.tournaments || st.leagues;
    if (comps && typeof comps === 'object') {
      Object.values(comps).forEach(function(comp) {
        if (!comp || typeof comp !== 'object') return;
        if (comp.rounds && Array.isArray(comp.rounds)) {
          comp.rounds = comp.rounds.map(function(r) {
            if (Array.isArray(r)) return r;
            if (r && typeof r === 'object') {
              var arr = window.__afmAsRoundArray(r);
              // Preserva propriedades como r.name ou r.title no proprio Array!
              Object.keys(r).forEach(function(k) {
                if (k !== 'length') try { arr[k] = r[k]; } catch(e) {}
              });
              return arr;
            }
            return [];
          });
        }
      });
    }
  };
})();
