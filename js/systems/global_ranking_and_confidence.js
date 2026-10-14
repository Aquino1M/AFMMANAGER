(function (window) {
  'use strict';

  const GlobalRankingAndConfidence = {
    updateConfidenceAfterMatch(state, { goalsFor, goalsAgainst, isHome, isDerby }) {
      if (!state) return null;
      if (window.AFM_Guards && typeof window.AFM_Guards.migrateSaveState === 'function') {
        window.AFM_Guards.migrateSaveState(state);
      }
      const conf = state.confidence = state.confidence || { board: 75, fans: 75, squad: 75 };
      state.managerPersonal = state.managerPersonal || { careerPoints: 0 };
      const protectionFactor = window.AFM_ManagerEconomy
        ? window.AFM_ManagerEconomy.getBoardDefeatProtectionFactor(state)
        : 1.0;

      const goalDiff = (Number(goalsFor) || 0) - (Number(goalsAgainst) || 0);

      if (goalDiff > 0) {
        const bonus = isDerby ? 6 : 3;
        conf.board = Math.min(100, (conf.board || 75) + bonus);
        conf.fans = Math.min(100, (conf.fans || 75) + bonus + (isHome ? 2 : 1));
        conf.squad = Math.min(100, (conf.squad || 75) + 2);
        state.managerPersonal.careerPoints = (state.managerPersonal.careerPoints || 0) + (isDerby ? 15 : 10);
      } else if (goalDiff === 0) {
        const delta = isHome ? -1 : 1;
        conf.board = Math.max(0, Math.min(100, (conf.board || 75) + Math.round(delta * protectionFactor)));
        conf.fans = Math.max(0, Math.min(100, (conf.fans || 75) + delta));
        state.managerPersonal.careerPoints = (state.managerPersonal.careerPoints || 0) + 3;
      } else {
        const rawBoardDrop = isDerby ? -7 : -4;
        const protectedBoardDrop = Math.round(rawBoardDrop * protectionFactor);
        conf.board = Math.max(0, (conf.board || 75) + protectedBoardDrop);
        conf.fans = Math.max(0, (conf.fans || 75) + (isDerby ? -8 : -5));
        conf.squad = Math.max(0, (conf.squad || 75) - 2);
      }

      if (state.trust) {
        state.trust.board = conf.board;
        state.trust.fans = conf.fans;
        state.trust.squad = conf.squad;
      }
      state.boardConfidence = conf.board;

      return conf;
    },

    calculateManagerTotalNetWorth(state) {
      if (!state) return 0;
      if (window.AFM_Guards && typeof window.AFM_Guards.migrateSaveState === 'function') {
        window.AFM_Guards.migrateSaveState(state);
      }
      const mp = state.managerPersonal || {};
      const sharePrice = window.AFM_ManagerEconomy ? window.AFM_ManagerEconomy.getSharePrice(state) : 16000;
      const sharesValue = (mp.clubShares || 0) * sharePrice;
      const businessesValue = (mp.businesses || []).reduce((acc, b) => acc + (b.investedCapital || 0), 0);
      return (mp.personalBalance || state.managerMoney || 0) + sharesValue + businessesValue;
    },

    async syncActiveSaveToRanking(state) {
      if (!state) return null;
      if (window.AFM_Guards && typeof window.AFM_Guards.migrateSaveState === 'function') {
        window.AFM_Guards.migrateSaveState(state);
      }
      const mp = state.managerPersonal || {};
      const entry = {
        manager_name: mp.name || state.manager || 'Aquino',
        club_name: state.club || state.clubName || 'Real Brasília',
        season_year: Number(state.season) || 2026,
        career_points: mp.careerPoints || 120,
        trophies_count: (mp.trophies || state.titles || []).length,
        net_worth: this.calculateManagerTotalNetWorth(state),
        updated_at: new Date().toISOString()
      };

      try {
        const localList = JSON.parse(localStorage.getItem('afm_ranking_cache') || '[]');
        const idx = localList.findIndex((x) => x.manager_name === entry.manager_name);
        if (idx >= 0) localList[idx] = entry;
        else localList.push(entry);
        localStorage.setItem('afm_ranking_cache', JSON.stringify(localList));
      } catch (e) {
        // Ignora falhas de localStorage quota
      }

      const client = window.supabaseClient || (window.AFM_DB && typeof window.AFM_DB.getClient === 'function' ? window.AFM_DB.getClient() : null);

      if (client) {
        try {
          await client
            .from('afm_global_ranking')
            .upsert(entry, { onConflict: 'manager_name' });
        } catch (err) {
          console.warn('[AFM Ranking] Modo offline ativo, ranking salvo localmente.');
        }
      }
      return entry;
    }
  };

  window.AFM_GlobalRanking = GlobalRankingAndConfidence;
})(window);
