// ==============================================================================
// AFM MANAGER 2027 — ECONOMIA PESSOAL DO TREINADOR & COTAS SOCIETÁRIAS
// Arquivo: js/core/manager_economy.js
// ==============================================================================

(function (window) {
  'use strict';

  const ManagerEconomyCore = {
    initManagerEconomy(state) {
      if (!state) return;
      state.managerMoney = state.managerMoney !== undefined ? state.managerMoney : 50000;
      state.managerSharesOwned = state.managerSharesOwned !== undefined ? state.managerSharesOwned : 0;
      state.managerAssets = Array.isArray(state.managerAssets) ? state.managerAssets : [];
      state.clubSharePrice = state.clubSharePrice || 100000;
    },

    buyClubShares(state, qty = 1) {
      this.initManagerEconomy(state);
      const q = Math.max(1, Number(qty) || 1);
      const price = state.clubSharePrice || 100000;
      const totalCost = price * q;

      if ((state.managerMoney || 0) < totalCost) {
        return { ok: false, message: 'Saldo insuficiente para adquirir as cotas.' };
      }
      if ((state.managerSharesOwned || 0) + q > 49) {
        return { ok: false, message: 'Limite de 49% das cotas societárias atingido.' };
      }

      state.managerMoney -= totalCost;
      state.managerSharesOwned = (state.managerSharesOwned || 0) + q;
      return { ok: true, message: `${q}% de cotas adquiridas com sucesso!` };
    },

    sellClubShares(state, qty = 1) {
      this.initManagerEconomy(state);
      const q = Math.max(1, Number(qty) || 1);
      const price = state.clubSharePrice || 100000;

      if ((state.managerSharesOwned || 0) < q) {
        return { ok: false, message: 'Você não possui essa quantidade de cotas para vender.' };
      }

      const totalReturn = price * q;
      state.managerMoney = (state.managerMoney || 0) + totalReturn;
      state.managerSharesOwned = Math.max(0, (state.managerSharesOwned || 0) - q);
      return { ok: true, message: `${q}% de cotas vendidas com sucesso!` };
    },

    onDivisionChangeUpdateSharePrice(state, isPromotion = false, isRelegation = false) {
      this.initManagerEconomy(state);
      let currentPrice = state.clubSharePrice || 100000;

      if (isPromotion) {
        currentPrice = Math.round(currentPrice * 1.35); // +35% no acesso
      } else if (isRelegation) {
        currentPrice = Math.round(currentPrice * 0.75); // -25% na queda
      }

      state.clubSharePrice = currentPrice;
      return currentPrice;
    },

    liquidateSharesOnClubExit(state) {
      this.initManagerEconomy(state);
      const shares = state.managerSharesOwned || 0;
      const price = state.clubSharePrice || 50000;
      const payout = shares * price;

      state.managerMoney = (state.managerMoney || 0) + payout;
      state.managerSharesOwned = 0;
      return payout;
    }
  };

  window.AFM_ManagerEconomy = ManagerEconomyCore;
})(typeof window !== 'undefined' ? window : global);
