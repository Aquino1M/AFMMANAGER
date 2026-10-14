// ==============================================================================
// AFM MANAGER 2027 — ASSISTENTE TÉCNICO & MENTORIA DE VETERANOS
// Arquivo: js/core/squad_assistant.js
// ==============================================================================

(function (window) {
  'use strict';

  const SquadAssistantCore = {
    applyAssistantSuggestedSwaps(squad) {
      if (!Array.isArray(squad)) return { swapsMade: 0 };
      let swapsMade = 0;

      // Localiza titulares (lineup <= 11) com cansaço extremo ou suspensão
      squad.forEach((starter) => {
        if (!starter || starter.lineup > 11 || starter.bench) return;
        const needsSwap = (starter.cond !== undefined && starter.cond < 50) || starter.suspended;

        if (needsSwap) {
          // Busca reserva descansado e da mesma posição
          const benchPlayer = squad.find((b) => {
            return b && (b.lineup > 11 || b.bench) && !b.suspended && (b.cond === undefined || b.cond >= 75) && (b.pos === starter.pos || !starter.pos);
          }) || squad.find((b) => b && (b.lineup > 11 || b.bench) && !b.suspended && (b.cond === undefined || b.cond >= 75));

          if (benchPlayer) {
            const temp = starter.lineup;
            starter.lineup = benchPlayer.lineup;
            benchPlayer.lineup = temp;
            swapsMade++;
          }
        }
      });

      return { swapsMade };
    },

    applyMentorshipVeterans(squad) {
      if (!Array.isArray(squad)) return [];
      const messages = [];

      const veterans = squad.filter((p) => p && (Number(p.age) || 20) >= 32);
      const youngsters = squad.filter((p) => p && (Number(p.age) || 25) < 21);

      veterans.forEach((vet) => {
        const apprentice = youngsters.find((y) => y && !y._mentored && (y.pos === vet.pos || !vet.pos));
        if (apprentice) {
          apprentice._mentored = true;
          apprentice.developmentXp = (Number(apprentice.developmentXp) || 0) + 15;
          messages.push(`🤝 Mentoria: ${vet.name} orientou ${apprentice.name} (+15 XP de desenvolvimento).`);
        }
      });

      return messages;
    }
  };

  window.AFM_SquadAssistant = SquadAssistantCore;
})(typeof window !== 'undefined' ? window : global);
