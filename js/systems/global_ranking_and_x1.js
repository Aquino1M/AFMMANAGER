(function (window) {
  'use strict';

  function encodeUtf8Base64(str) {
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(str, 'utf8').toString('base64');
    }
    const bytes = new TextEncoder().encode(str);
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }

  function decodeUtf8Base64(b64) {
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(String(b64 || '').trim(), 'base64').toString('utf8');
    }
    const bin = atob(String(b64 || '').trim());
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }

  const GlobalRankingAndX1 = {
    // #185: Exporta Código Tático do Elenco para duelo JOGAR X1
    exportSquadX1Token(state) {
      if (window.AFMCareerFix && typeof window.AFMCareerFix.generateSafeX1Token === 'function') {
        return window.AFMCareerFix.generateSafeX1Token(state);
      }
      const payload = {
        manager: state?.managerPersonal?.name || state?.manager || 'Aquino',
        club: state?.club || state?.clubName || 'Real Brasília',
        posture: state?.tacticalSetup?.mentality || state?.mentality || 'EQUILIBRADA',
        power: state?.teamOverall || state?.avgOvr || 74,
        ts: Date.now()
      };
      return 'AFMX1_' + encodeUtf8Base64(JSON.stringify(payload));
    },

    decodeX1Token(token) {
      if (!token) return null;
      if (window.AFMCareerFix && typeof window.AFMCareerFix.parseSafeX1Token === 'function') {
        try {
          return window.AFMCareerFix.parseSafeX1Token(token);
        } catch (e) {
          return null;
        }
      }
      try {
        const clean = String(token || '').trim().replace(/^AFMX1_/, '');
        return JSON.parse(decodeUtf8Base64(clean));
      } catch (e) {
        return null;
      }
    },

    importAndSimulateX1Challenge(myState, opponentToken) {
      if (window.AFMCareerFix && typeof window.AFMCareerFix.simulateX1Duel === 'function') {
        return window.AFMCareerFix.simulateX1Duel(myState, opponentToken);
      }
      try {
        const clean = String(opponentToken || '').trim().replace(/^AFMX1_/, '');
        const opp = JSON.parse(decodeUtf8Base64(clean));
        const myPower = myState?.teamOverall || myState?.avgOvr || 75;
        const oppPower = opp.power || opp.ovr || 72;
        const myGoals = Math.max(0, Math.round((Math.random() * 3) * (myPower / Math.max(1, oppPower))));
        const oppGoals = Math.max(0, Math.round((Math.random() * 3) * (oppPower / Math.max(1, myPower))));
        return { ok: true, opponent: opp, myGoals, oppGoals };
      } catch (e) {
        return { ok: false, message: 'Código X1 inválido!' };
      }
    }
  };

  window.AFM_X1System = Object.assign(window.AFM_X1System || {}, GlobalRankingAndX1);
})(typeof window !== 'undefined' ? window : global);
