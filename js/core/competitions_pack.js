// ==============================================================================
// AFM MANAGER 2027 — PACOTE DE COMPETIÇÕES & PLACAR SIMULTÂNEO DA RODADA
// Arquivo: js/core/competitions_pack.js
// ==============================================================================

(function (window) {
  'use strict';

  const CompetitionsPackCore = {
    simulateLiveParallelMatches(parallelFixtures, currentMinute = 1) {
      if (!Array.isArray(parallelFixtures)) return [];
      const newEvents = [];

      parallelFixtures.forEach((f) => {
        if (!f) return;
        f.homeGoals = Number(f.homeGoals) || 0;
        f.awayGoals = Number(f.awayGoals) || 0;

        // Chance de gol paralela na rodada proporcional ao tempo
        if (Math.random() < 0.04) {
          const isHome = Math.random() < 0.55;
          if (isHome) {
            f.homeGoals += 1;
            newEvents.push({
              minute: currentMinute,
              text: `⚽ GOL no jogo simultâneo! ${f.homeName || 'Mandante'} ${f.homeGoals} x ${f.awayGoals} ${f.awayName || 'Visitante'}`
            });
          } else {
            f.awayGoals += 1;
            newEvents.push({
              minute: currentMinute,
              text: `⚽ GOL no jogo simultâneo! ${f.homeName || 'Mandante'} ${f.homeGoals} x ${f.awayGoals} ${f.awayName || 'Visitante'}`
            });
          }
        }
      });

      return newEvents;
    }
  };

  window.AFM_Competitions = CompetitionsPackCore;
})(typeof window !== 'undefined' ? window : global);
