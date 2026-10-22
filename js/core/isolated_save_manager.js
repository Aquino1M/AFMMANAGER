// ==============================================================================
// AFM MANAGER 2027 — ISOLAMENTO DO SAVE INDIVIDUAL (SINGLE-PLAYER ISOLADO)
// Arquivo: js/core/isolated_save_manager.js
// BLOCO 01 — Garante que ligas, elencos e temporadas fiquem 100% no save
// ==============================================================================

(function (window) {
  'use strict';

  const IsolatedSaveManager = {
    staticSnapshot: null,

    // Captura e congela os dados originais de fabrica na inicializacao
    captureCleanFactoryDatabase(clubs, players, competitions) {
      if (!this.staticSnapshot) {
        this.staticSnapshot = {
          clubs: JSON.stringify(clubs || []),
          players: JSON.stringify(players || []),
          competitions: JSON.stringify(competitions || [])
        };
      }
    },

    // Cria um universo de ligas e clubes 100% isolado para o Save do usuario
    createIsolatedWorldForNewSave() {
      const baseClubs = this.staticSnapshot ? JSON.parse(this.staticSnapshot.clubs) : (window.clubs ? JSON.parse(JSON.stringify(window.clubs)) : []);
      const basePlayers = this.staticSnapshot ? JSON.parse(this.staticSnapshot.players) : (window.livePlayers ? JSON.parse(JSON.stringify(window.livePlayers)) : []);
      const baseComps = this.staticSnapshot ? JSON.parse(this.staticSnapshot.competitions) : (window.COMPETITIONS ? JSON.parse(JSON.stringify(window.COMPETITIONS)) : []);

      return {
        saveId: `save_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        createdAt: new Date().toISOString(),
        seasonYear: 2026,
        clubs: baseClubs,
        players: basePlayers,
        competitions: baseComps,
        standingsByLeague: {},
        cupBrackets: {},
        seasonHistory: []
      };
    },

    // Garante que um save carregado possua sua propria copia isolada das ligas
    ensureSaveIsolation(gameState) {
      if (!gameState) return null;
      if (!gameState.isolatedWorld) {
        gameState.isolatedWorld = this.createIsolatedWorldForNewSave();
      } else {
        const baseClubs = this.staticSnapshot ? JSON.parse(this.staticSnapshot.clubs) : (window.clubs ? JSON.parse(JSON.stringify(window.clubs)) : []);
        const basePlayers = this.staticSnapshot ? JSON.parse(this.staticSnapshot.players) : (window.livePlayers ? JSON.parse(JSON.stringify(window.livePlayers)) : []);
        const baseComps = this.staticSnapshot ? JSON.parse(this.staticSnapshot.competitions) : (window.COMPETITIONS ? JSON.parse(JSON.stringify(window.COMPETITIONS)) : []);
        if (!gameState.isolatedWorld.clubs || !gameState.isolatedWorld.clubs.length) gameState.isolatedWorld.clubs = baseClubs;
        if (!gameState.isolatedWorld.players || !gameState.isolatedWorld.players.length) gameState.isolatedWorld.players = basePlayers;
        if (!gameState.isolatedWorld.competitions || !gameState.isolatedWorld.competitions.length) gameState.isolatedWorld.competitions = baseComps;
      }
      return gameState.isolatedWorld;
    },

    // Salva o estado exclusivamente no slot individual do usuario
    saveToUserSlot(gameState, slotName = 'default_user') {
      this.ensureSaveIsolation(gameState);
      const storageKey = `afm2027_individual_save_${slotName}`;
      if (typeof localStorage !== 'undefined') {
        try {
          const toSave = JSON.parse(JSON.stringify(gameState));
          if (toSave.isolatedWorld) {
            delete toSave.isolatedWorld.players;
            delete toSave.isolatedWorld.clubs;
            delete toSave.isolatedWorld.competitions;
          }
          delete toSave.worldGenerated;
          localStorage.setItem(storageKey, JSON.stringify(toSave));
          localStorage.setItem('afm2027_last_active_slot', slotName);
        } catch (e) {
          if (typeof window.freeUpLocalStorageQuota === 'function') {
            window.freeUpLocalStorageQuota();
          }
        }
      }
      return storageKey;
    },

    loadFromUserSlot(slotName = 'default_user') {
      const storageKey = `afm2027_individual_save_${slotName}`;
      if (typeof localStorage === 'undefined') return null;
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      try {
        const parsed = JSON.parse(raw);
        this.ensureSaveIsolation(parsed);
        return parsed;
      } catch (e) {
        return null;
      }
    }
  };

  window.AFM_IsolatedSave = IsolatedSaveManager;
})(typeof window !== 'undefined' ? window : global);
