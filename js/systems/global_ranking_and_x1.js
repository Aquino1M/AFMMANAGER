(function (window) {
  'use strict';

  const GlobalRankingAndX1 = {
    // #185: Exporta Código Tático do Elenco para duelo JOGAR X1
    exportSquadX1Token(state) {
      const payload = {
        manager: state?.managerPersonal?.name || state?.manager || 'Aquino',
        club: state?.club || state?.clubName || 'Real Brasília',
        posture: state?.tacticalSetup?.mentality || state?.mentality || 'EQUILIBRADA',
        power: state?.teamOverall || state?.avgOvr || 74,
        ts: Date.now()
      };
      return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    },

    importAndSimulateX1Challenge(myState, opponentToken) {
      try {
        const opp = JSON.parse(decodeURIComponent(escape(atob(opponentToken))));
        const myPower = myState?.teamOverall || myState?.avgOvr || 75;
        const oppPower = opp.power || 72;
        const myGoals = Math.max(0, Math.round((Math.random() * 3) * (myPower / oppPower)));
        const oppGoals = Math.max(0, Math.round((Math.random() * 3) * (oppPower / myPower)));
        return { ok: true, opponent: opp, myGoals, oppGoals };
      } catch (e) {
        return { ok: false, message: 'Código X1 inválido!' };
      }
    }
  };

  window.AFM_X1System = Object.assign(window.AFM_X1System || {}, GlobalRankingAndX1);
})(window);
