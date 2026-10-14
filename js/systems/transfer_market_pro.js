(function (window) {
  'use strict';

  const TransferMarketPro = {
    pageSize: 50,
    currentPage: 1,
    lastFilteredResults: [],

    // #061: Filtro ultra-rápido acionado pelo Botão Pesquisar com Paginação Virtual de 50 atletas
    executeMarketSearch(allPlayers, filters = {}) {
      const {
        nameQuery = '',
        position = 'ALL',
        minOvr = 0,
        maxOvr = 99,
        maxAge = 45,
        maxValue = Infinity,
        onlyFreeAgents = false
      } = filters;

      const q = nameQuery.trim().toLowerCase();
      this.lastFilteredResults = (allPlayers || []).filter((p) => {
        if (!p) return false;
        if (q && !(p.name || '').toLowerCase().includes(q)) return false;
        if (position !== 'ALL' && p.position !== position && p.pos !== position) return false;
        const ovr = p.overall || p.ovr || (typeof window.playerOverall === 'function' ? window.playerOverall(p) : 60);
        if (ovr < minOvr || ovr > maxOvr) return false;
        const age = p.age || 22;
        if (age > maxAge) return false;
        const val = p.marketValue || p.value || 0;
        if (val > maxValue) return false;
        if (onlyFreeAgents && p.clubId && p.clubId !== 'FREE' && p.club) return false;
        return true;
      });

      this.currentPage = 1;
      return this.getCurrentPageSlice();
    },

    getCurrentPageSlice() {
      const start = (this.currentPage - 1) * this.pageSize;
      return {
        items: this.lastFilteredResults.slice(start, start + this.pageSize),
        totalItems: this.lastFilteredResults.length,
        currentPage: this.currentPage,
        totalPages: Math.max(1, Math.ceil(this.lastFilteredResults.length / this.pageSize))
      };
    },

    setPage(pageNum) {
      const totalPages = Math.max(1, Math.ceil(this.lastFilteredResults.length / this.pageSize));
      this.currentPage = Math.max(1, Math.min(totalPages, pageNum));
      return this.getCurrentPageSlice();
    },

    // #062 a #075: Criação de Proposta com Cláusula de Revenda (%) e Expiração Automática
    submitTransferProposal(state, { player, offerValue, resalePercentage = 10, wageOffer, currentRound = 1 }) {
      if (window.AFM_Guards && typeof window.AFM_Guards.migrateSaveState === 'function') {
        window.AFM_Guards.migrateSaveState(state);
      }
      const marketVal = player.marketValue || player.value || 250000;
      const aiRequired = Math.round(marketVal * (1.05 - (resalePercentage * 0.004)));

      const acceptedImmediately = offerValue >= aiRequired;
      const proposal = {
        id: `prop_${Date.now()}_${player.id || player.name}`,
        playerId: player.id || player.name,
        playerName: player.name,
        sellerClubId: player.clubId || player.club || 'LIVRE',
        buyerClubId: state.userClubId || state.club,
        offerValue,
        resalePercentage,
        wageOffer,
        status: acceptedImmediately ? 'ACCEPTED' : 'PENDING',
        createdAtRound: currentRound,
        expiresAt: currentRound + 3
      };

      state.proposals = Array.isArray(state.proposals) ? state.proposals : [];
      state.proposals.push(proposal);

      if (acceptedImmediately && resalePercentage > 0 && window.AFM_Guards) {
        window.AFM_Guards.registerResaleClause(state, {
          playerId: player.id || player.name,
          playerName: player.name,
          beneficiaryClubId: player.clubId || player.club,
          sellerClubId: player.clubId || player.club,
          percentage: resalePercentage
        });
      }

      return proposal;
    }
  };

  window.AFM_TransferMarketPro = TransferMarketPro;
})(window);
