(function (window) {
  'use strict';

  const POSTURE_MODIFIERS = {
    RETRANCA:    { attackBias: 0.72, defenseBias: 1.32, pressLine: 0.35, staminaDrain: 0.82, label: 'RETRANCA' },
    EQUILIBRADA: { attackBias: 1.00, defenseBias: 1.00, pressLine: 0.55, staminaDrain: 1.00, label: 'EQUILIBRADA' },
    OFENSIVA:    { attackBias: 1.34, defenseBias: 0.80, pressLine: 0.78, staminaDrain: 1.28, label: 'OFENSIVA' }
  };

  const Tactical4PhasesEnhancer = {
    postures: POSTURE_MODIFIERS,

    getPostureConfig(postureKey = 'EQUILIBRADA') {
      const key = String(postureKey || 'EQUILIBRADA').toUpperCase();
      return POSTURE_MODIFIERS[key] || POSTURE_MODIFIERS.EQUILIBRADA;
    },

    // #089: IA Rival adapta a postura nos 20 minutos finais se estiver perdendo
    evaluateAICoachAdjustment(matchState) {
      if (!matchState || matchState.minute < 68) return matchState.awayPosture || 'EQUILIBRADA';
      const diff = (matchState.awayGoals || 0) - (matchState.homeGoals || 0);
      if (diff < 0) return 'OFENSIVA';
      if (diff > 0 && matchState.minute >= 80) return 'RETRANCA';
      return 'EQUILIBRADA';
    },

    // #086 & #100: Cálculo de xG (Expected Goals) e Resolução de Goleiro 1v1
    resolveShotVsGoalkeeper({ shooterOvr = 70, gkOvr = 70, distanceMeters = 16, posture = 'EQUILIBRADA' } = {}) {
      const pMod = this.getPostureConfig(posture);
      const ratio = gkOvr > 0 ? (shooterOvr / gkOvr) : 1;
      const distFactor = Math.max(0.03, Math.min(0.68, (28 - distanceMeters) / 36));
      const baseXg = Math.max(0.04, Math.min(0.85, distFactor * ratio * pMod.attackBias));
      const roll = Math.random();

      if (roll < baseXg * 0.72) return { outcome: 'GOAL', xG: baseXg };
      if (roll < baseXg * 0.90) return { outcome: 'WOODWORK', xG: baseXg }; // Bola na trave!
      if (roll < baseXg * 1.45) return { outcome: 'GK_SAVE_CORNER', xG: baseXg }; // Defesa para escanteio!
      return { outcome: 'OFF_TARGET', xG: baseXg };
    }
  };

  window.AFM_Tactical4Phases = Object.assign(window.AFM_Tactical4Phases || {}, Tactical4PhasesEnhancer);
})(window);
