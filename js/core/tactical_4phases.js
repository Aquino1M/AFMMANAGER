// ==============================================================================
// AFM MANAGER 2027 — 4 FASES TÁTICAS & IA ADAPTATIVA DA CPU
// Arquivo: js/core/tactical_4phases.js
// ==============================================================================

(function (window) {
  'use strict';

  const Tactical4PhasesCore = {
    getNextPhase(currentPhase = 'BUILD_UP') {
      const cycle = {
        BUILD_UP: 'PROGRESSION',
        PROGRESSION: 'CHANCE_CREATION',
        CHANCE_CREATION: 'FINISHING',
        FINISHING: 'BUILD_UP'
      };
      return cycle[currentPhase] || 'BUILD_UP';
    },

    evaluateAICoachAdjustment(matchState) {
      if (!matchState) return 'EQUILIBRADA';
      const minute = matchState.minute || 0;
      if (minute < 68) return matchState.awayPosture || 'EQUILIBRADA';

      const userClub = (typeof window !== 'undefined' && window.state && window.state.club) ? window.state.club : null;
      const isUserHome = (typeof window.norm === 'function' && userClub)
        ? (window.norm(matchState.home) === window.norm(userClub))
        : true;

      const homeGoals = matchState.hg ?? matchState.homeGoals ?? 0;
      const awayGoals = matchState.ag ?? matchState.awayGoals ?? 0;
      const cpuDiff = isUserHome ? (awayGoals - homeGoals) : (homeGoals - awayGoals);

      if (cpuDiff < 0 && minute >= 70) {
        return 'OFENSIVA';
      }
      if (cpuDiff > 0 && minute >= 80) {
        return 'RETRANCA';
      }
      return isUserHome ? (matchState.awayPosture || 'EQUILIBRADA') : (matchState.homePosture || 'EQUILIBRADA');
    }
  };

  window.AFM_Tactical4Phases = Tactical4PhasesCore;
})(typeof window !== 'undefined' ? window : global);
