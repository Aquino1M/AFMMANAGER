// ============================================================================
// AFM MANAGER 2027 — FIX DEFINITIVO ABA TEMPORADA (BRASILEIRÃO, COPAS, CBF)
// Arquivo: js/season_view_fix.js
// ============================================================================

(function (window) {
  'use strict';

  window.afmSeasonUIState = window.afmSeasonUIState || {
    activeMainTab: 'nacional',        // 'estadual' | 'nacional' | 'copadobrasil' | 'continental'
    selectedDivision: null,           // Inicializado apenas UMA VEZ, nunca sobrescrito no render
    selectedCopaPhase: '1ª Fase',     // '1ª Fase' .. '5ª Fase' | 'Chaveamento'
    continentalCat: 'internacional',  // 'nacional' (Pirâmide CBF) | 'internacional'
    continentalTab: 'libertadores',   // 'libertadores' | 'sulamericana' | 'mundial'
    continentalPhase: {
      libertadores: 'pre1',
      sulamericana: 'preliminar',
      mundial: 'bracket'
    }
  };

  function normalizeDivisionKey(rawKey) {
    const raw = String(rawKey || '').toLowerCase().trim();
    const map = {
      'a': 'bra-a', 'serie_a': 'bra-a', 'serie-a': 'bra-a', 'bra_a': 'bra-a', 'bra-a': 'bra-a',
      'b': 'bra-b', 'serie_b': 'bra-b', 'serie-b': 'bra-b', 'bra_b': 'bra-b', 'bra-b': 'bra-b',
      'c': 'bra-c', 'serie_c': 'bra-c', 'serie-c': 'bra-c', 'bra_c': 'bra-c', 'bra-c': 'bra-c',
      'd': 'bra-d', 'serie_d': 'bra-d', 'serie-d': 'bra-d', 'bra_d': 'bra-d', 'bra-d': 'bra-d'
    };
    return map[raw] || 'bra-a';
  }

  function getActiveDivisionForSeasonView(state) {
    if (!window.afmSeasonUIState.selectedDivision) {
      const userDiv = state?.userClub?.division || state?.compId || state?.club?.leagueId || 'bra-a';
      window.afmSeasonUIState.selectedDivision = normalizeDivisionKey(userDiv);
    }
    return window.afmSeasonUIState.selectedDivision;
  }

  // Delegação única e à prova de falhas para todos os cliques da aba Temporada
  if (typeof document !== 'undefined') {
    document.addEventListener('click', (e) => {
      // 1. Abas principais da Temporada (Estadual, Brasileirão, Copa do Brasil, Continentais)
      const seasonTabBtn = e.target.closest('[data-season-tab]');
      if (seasonTabBtn) {
        e.preventDefault();
        const targetTab = seasonTabBtn.dataset.seasonTab;
        window.afmSeasonUIState.activeMainTab = targetTab;
        if (typeof window.seasonTab !== 'undefined') window.seasonTab = targetTab;
        if (typeof window.render === 'function') window.render();
        return;
      }

      // 2. Atalhos rápidos entre Copa do Brasil e Continentais / Pirâmide CBF
      const btnToCopa = e.target.closest('#btnSeasonSwitchToCopa');
      if (btnToCopa) {
        e.preventDefault();
        window.afmSeasonUIState.activeMainTab = 'copadobrasil';
        if (typeof window.seasonTab !== 'undefined') window.seasonTab = 'copadobrasil';
        if (typeof window.render === 'function') window.render();
        return;
      }

      const btnToLib = e.target.closest('#btnSeasonSwitchToLib');
      if (btnToLib) {
        e.preventDefault();
        window.afmSeasonUIState.activeMainTab = 'continental';
        window.afmSeasonUIState.continentalCat = 'internacional';
        window.afmSeasonUIState.continentalTab = 'libertadores';
        if (typeof window.seasonTab !== 'undefined') window.seasonTab = 'continental';
        if (typeof window.continentalCategory !== 'undefined') window.continentalCategory = 'internacional';
        if (typeof window.continentalTab !== 'undefined') window.continentalTab = 'libertadores';
        if (typeof window.render === 'function') window.render();
        return;
      }

      const btnQuickPiramide = e.target.closest('#btnQuickGoPiramideCBF');
      if (btnQuickPiramide) {
        e.preventDefault();
        window.afmSeasonUIState.activeMainTab = 'continental';
        window.afmSeasonUIState.continentalCat = 'nacional';
        if (typeof window.seasonTab !== 'undefined') window.seasonTab = 'continental';
        if (typeof window.continentalCategory !== 'undefined') window.continentalCategory = 'nacional';
        if (typeof window.render === 'function') window.render();
        return;
      }

      // 3. Seletor de Séries A / B / C / D (Corrige bug de voltar para Série D)
      const divBtn = e.target.closest('[data-nat-div], [data-division], [data-div-tab], [data-league-tab]');
      if (divBtn) {
        e.preventDefault();
        e.stopPropagation();
        const rawDiv = divBtn.dataset.natDiv || divBtn.dataset.division || divBtn.dataset.divTab || divBtn.dataset.leagueTab;
        const normalized = normalizeDivisionKey(rawDiv);
        window.afmSeasonUIState.selectedDivision = normalized;
        if (typeof window.nationalDivision !== 'undefined') window.nationalDivision = normalized;
        if (typeof window.render === 'function') window.render();
        return;
      }

      // 4. Fases da Copa do Brasil
      const copaPhaseBtn = e.target.closest('[data-copa-phase], .btn-copa-phase');
      if (copaPhaseBtn) {
        e.preventDefault();
        const phase = copaPhaseBtn.dataset.copaPhase;
        if (phase) {
          window.afmSeasonUIState.selectedCopaPhase = phase;
          if (typeof window.copaCurrentPhase !== 'undefined') window.copaCurrentPhase = phase;
          if (typeof window.render === 'function') window.render();
        }
        return;
      }

      // 5. Pirâmide CBF vs Internacionais (Categorias Continentais)
      const contCatBtn = e.target.closest('[data-continental-cat]');
      if (contCatBtn) {
        e.preventDefault();
        const cat = contCatBtn.dataset.continentalCat;
        window.afmSeasonUIState.continentalCat = cat;
        if (typeof window.continentalCategory !== 'undefined') window.continentalCategory = cat;
        if (typeof window.render === 'function') window.render();
        return;
      }

      // 6. Torneios Internacionais (Libertadores, Sul-Americana, Mundial)
      const contTabBtn = e.target.closest('[data-continental-tab]');
      if (contTabBtn) {
        e.preventDefault();
        const tab = contTabBtn.dataset.continentalTab;
        window.afmSeasonUIState.continentalTab = tab;
        if (typeof window.continentalTab !== 'undefined') window.continentalTab = tab;
        if (typeof window.render === 'function') window.render();
        return;
      }

      // 7. Sub-fases Continentais
      const contPhaseBtn = e.target.closest('[data-continental-phase]');
      if (contPhaseBtn) {
        e.preventDefault();
        const ph = contPhaseBtn.dataset.continentalPhase;
        if (typeof window.continentalPhase !== 'undefined') window.continentalPhase = ph;
        if (typeof window.render === 'function') window.render();
        return;
      }
    }, true);
  }

  const AFMSeasonView = {
    normalizeDivisionKey,
    getActiveDivisionForSeasonView
  };

  window.AFMSeasonView = AFMSeasonView;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AFMSeasonView;
  }
})(typeof window !== 'undefined' ? window : global);
