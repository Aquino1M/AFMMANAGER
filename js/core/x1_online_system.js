// ==============================================================================
// AFM MANAGER 2027 — MODO X1 DUELO TÁTICO POR CÓDIGO
// Arquivo: js/core/x1_online_system.js
// ==============================================================================

(function (window) {
  'use strict';

  const X1SystemCore = {
    exportSquadX1Token(state) {
      if (!state) return '';
      const payload = {
        club: state.club || 'Clube',
        manager: state.manager || 'Aquino',
        tactic: state.tactic || '4-3-3',
        posture: state.posture || 'Ofensiva',
        starters: Array.isArray(state.squad)
          ? state.squad.filter((p) => p && !p.bench).slice(0, 11).map((p) => ({ name: p.name, pos: p.pos, ovr: p.ovr || p.overall || 75 }))
          : []
      };

      try {
        const jsonStr = JSON.stringify(payload);
        const encoded = typeof btoa === 'function' ? btoa(unescape(encodeURIComponent(jsonStr))) : Buffer.from(jsonStr).toString('base64');
        return `AFMX1_${encoded}`;
      } catch (e) {
        return `AFMX1_CLUB_${state.club || 'FC'}_${Date.now()}`;
      }
    },

    decodeX1Token(token) {
      if (!token || typeof token !== 'string') return null;
      try {
        const raw = token.replace(/^AFMX1_/, '');
        const jsonStr = typeof atob === 'function' ? decodeURIComponent(escape(atob(raw))) : Buffer.from(raw, 'base64').toString('utf8');
        return JSON.parse(jsonStr);
      } catch (e) {
        return null;
      }
    },

    importAndSimulateX1Challenge(state, token) {
      const decoded = this.decodeX1Token(token) || {
        club: 'Adversário X1',
        manager: 'Treinador Rival',
        posture: 'Equilibrada',
        starters: []
      };

      // Simulação isolada sem mutar o save da carreira
      const myGoals = Math.floor(Math.random() * 4);
      const oppGoals = Math.floor(Math.random() * 3);

      return {
        ok: true,
        myGoals,
        oppGoals,
        myClub: state?.club || 'Seu Clube',
        oppClub: decoded.club,
        oppManager: decoded.manager,
        winner: myGoals > oppGoals ? (state?.club || 'Seu Clube') : (oppGoals > myGoals ? decoded.club : 'Empate')
      };
    }
  };

  window.AFM_X1System = X1SystemCore;
})(typeof window !== 'undefined' ? window : global);
