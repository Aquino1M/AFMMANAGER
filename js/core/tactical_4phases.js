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
      const homeGoals = matchState.homeGoals || 0;
      const awayGoals = matchState.awayGoals || 0;
      const diff = awayGoals - homeGoals;

      if (diff < 0 && minute >= 70) {
        return 'OFENSIVA';
      }
      if (diff > 0 && minute >= 80) {
        return 'RETRANCA';
      }
      return matchState.awayPosture || 'EQUILIBRADA';
    }
  };

  window.AFM_Tactical4Phases = Tactical4PhasesCore;
})(typeof window !== 'undefined' ? window : global);
