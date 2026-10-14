(function (window) {
  'use strict';

  const SquadAssistantSystem = {
    pendingBuffer: null,

    overallToStars(ovr) {
      const clamped = Math.max(45, Math.min(95, Number(ovr) || 60));
      return Math.round(((clamped - 40) / 11) * 2) / 2;
    },

    renderThreeLayerStarsHTML(player) {
      if (!player) return '';
      const curOvr = Number(player.overall || player.ovr || 65);
      const currentStars = Math.round(this.overallToStars(curOvr));
      const potVal = Number(player.potential || (curOvr + 5));
      const guaranteedPot = Math.max(currentStars, Math.round(this.overallToStars(potVal)));
      const pAge = Number(player.age) || 24;
      const ceilingPot = Math.min(5, Math.max(guaranteedPot, guaranteedPot + (pAge <= 21 ? 1 : 0)));

      let html = '<span class="afm-three-layer-stars" style="display:inline-flex;gap:2px;align-items:center;" title="Dourado: Nível Atual | Violeta: Potencial Garantido | Lilás Translúcido: Teto Máximo">';
      for (let i = 1; i <= 5; i++) {
        if (i <= currentStars) {
          html += '<span style="color:#fbbf24;font-size:13px;line-height:1;">★</span>';
        } else if (i <= guaranteedPot) {
          html += '<span style="color:#8b5cf6;font-size:13px;line-height:1;">★</span>';
        } else if (i <= ceilingPot) {
          html += '<span style="color:rgba(167,139,250,0.45);font-size:13px;line-height:1;">★</span>';
        } else {
          html += '<span style="color:#334155;font-size:13px;line-height:1;">☆</span>';
        }
      }
      html += '</span>';
      return html;
    },

    applyAssistantSuggestedSwaps(squadList) {
      if (!Array.isArray(squadList) || squadList.length <= 11) {
        return { swapsMade: 0, details: [] };
      }

      this.pendingBuffer = squadList.map((p) => ({ ...p }));
      const starters = squadList.slice(0, 11);
      const reserves = squadList.slice(11);
      const details = [];
      let swapsMade = 0;

      starters.forEach((starter, sIdx) => {
        const stamina = Number(starter.stamina ?? starter.energy ?? starter.fitness ?? 100);
        const needsSub = starter.injured || starter.injury || (starter.suspended > 0) || stamina < 72;

        if (needsSub) {
          let bestResIdx = -1;
          let bestScore = -1;

          reserves.forEach((res, rIdx) => {
            const resStamina = Number(res.stamina ?? res.energy ?? res.fitness ?? 100);
            if (res.injured || res.injury || (res.suspended > 0) || resStamina < 75) return;
            const samePosBonus = (res.pos === starter.pos || res.position === starter.position) ? 25 : 0;
            const resOvr = Number(res.overall || res.ovr || 60);
            const score = resOvr + samePosBonus + (resStamina * 0.2);
            if (score > bestScore) {
              bestScore = score;
              bestResIdx = rIdx;
            }
          });

          if (bestResIdx !== -1) {
            const incoming = reserves[bestResIdx];
            squadList[sIdx] = incoming;
            squadList[11 + bestResIdx] = starter;
            swapsMade++;
            const reason = starter.injured || starter.injury ? 'lesionado' : ((starter.suspended > 0) ? 'suspenso' : `físico em ${Math.round(stamina)}%`);
            details.push(`${incoming.name} (${incoming.pos || incoming.position || 'CM'}) substituiu ${starter.name} (${reason})`);
          }
        }
      });

      return { swapsMade, details };
    },

    undoLastSuggestedSwaps(squadList) {
      if (!this.pendingBuffer || !Array.isArray(squadList)) return false;
      squadList.length = 0;
      this.pendingBuffer.forEach((p) => squadList.push(p));
      this.pendingBuffer = null;
      return true;
    },

    // #136: Mentoria de Veteranos (30+ anos) para Jovens Sub-20
    applyMentorshipVeterans(squadList) {
      if (!Array.isArray(squadList)) return [];
      const veterans = squadList.filter((p) => (p.age || 25) >= 30 && (p.overall || p.ovr || 65) >= 70);
      const youth = squadList.filter((p) => (p.age || 25) <= 20);
      const results = [];

      if (!veterans.length || !youth.length) return results;

      youth.forEach((y) => {
        const mentor = veterans[Math.floor(Math.random() * veterans.length)];
        if (Math.random() < 0.35) {
          y.morale = Math.min(100, (y.morale || 75) + 5);
          if (y.potential && y.overall && y.potential > y.overall) {
            y.overall = (y.overall || 65) + 1;
            results.push(`${y.name} evoluiu (+1 OVR) sob a mentoria do experiente ${mentor.name}!`);
          }
        }
      });
      return results;
    },

    // #138: Foco de Treino Semanal
    applyWeeklyTrainingFocus(squadList, focus = 'TATICO') {
      if (!Array.isArray(squadList)) return;
      squadList.forEach((p) => {
        if (focus === 'FISICO') {
          p.fitness = Math.min(100, (p.fitness || 100) + 4);
        } else if (focus === 'TATICO') {
          p.tacticalFamiliarity = Math.min(100, (p.tacticalFamiliarity || 70) + 3);
        } else if (focus === 'TECNICO') {
          if (Math.random() < 0.15 && (p.overall || 65) < (p.potential || 80)) {
            p.overall = (p.overall || 65) + 1;
          }
        }
      });
    }
  };

  window.AFM_SquadAssistant = Object.assign(window.AFM_SquadAssistant || {}, SquadAssistantSystem);
})(window);
