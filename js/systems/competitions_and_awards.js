(function (window) {
  'use strict';

  const CompetitionsAndAwards = {
    // #144: Simulador de Placar Paralelo da Rodada em Tempo Real
    simulateLiveParallelMatches(parallelFixtures, currentMinute) {
      if (!Array.isArray(parallelFixtures)) return [];
      const events = [];
      parallelFixtures.forEach((fix) => {
        if (!fix) return;
        if (Math.random() < 0.026) {
          const homeScored = Math.random() < 0.54;
          if (homeScored) fix.homeGoals = (fix.homeGoals || 0) + 1;
          else fix.awayGoals = (fix.awayGoals || 0) + 1;
          const hName = fix.homeName || fix.home || 'Casa';
          const aName = fix.awayName || fix.away || 'Fora';
          events.push({
            minute: currentMinute,
            text: `⚽ GOL NA RODADA! ${hName} ${fix.homeGoals || 0} x ${fix.awayGoals || 0} ${aName}`
          });
        }
      });
      return events;
    },

    // #148: Seleção do Campeonato e Prêmios de Fim de Temporada
    generateEndOfSeasonAwards(allPlayers) {
      const sortedScorers = [...(allPlayers || [])].sort((a, b) => (b.seasonGoals || b.goals || 0) - (a.seasonGoals || a.goals || 0));
      const sortedRatings = [...(allPlayers || [])].sort((a, b) => (b.avgRating || b.rating || 0) - (a.avgRating || a.rating || 0));
      return {
        topScorer: sortedScorers[0] || null,
        bestPlayer: sortedRatings[0] || null
      };
    }
  };

  window.AFM_Competitions = Object.assign(window.AFM_Competitions || {}, CompetitionsAndAwards);
})(window);
