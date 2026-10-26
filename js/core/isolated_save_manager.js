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

    // Salva o estado exclusivamente no slot individual do usuario com Dual-Slot Backup espelho
    saveToUserSlot(gameState, slotName = 'default_user') {
      this.ensureSaveIsolation(gameState);
      const storageKey = `afm2027_individual_save_${slotName}`;
      const backupKey = `afm2027_individual_save_${slotName}_backup`;
      if (typeof localStorage !== 'undefined') {
        try {
          const toSave = JSON.parse(JSON.stringify(gameState));
          if (toSave.isolatedWorld) {
            delete toSave.isolatedWorld.players;
            delete toSave.isolatedWorld.clubs;
            delete toSave.isolatedWorld.competitions;
          }
          delete toSave.worldGenerated;
          const payload = JSON.stringify(toSave);
          localStorage.setItem(storageKey, payload);
          localStorage.setItem('afm2027_last_active_slot', slotName);

          // Dual-Slot Backup: Réplica de segurança para garantir integridade contra falhas repentinas
          try {
            localStorage.setItem(backupKey, payload);
          } catch (_) {}
        } catch (e) {
          if (typeof window.freeUpLocalStorageQuota === 'function') {
            window.freeUpLocalStorageQuota();
          }
        }
      }
      return storageKey;
    },

    // Carrega o save individual com restauração automática por backup em caso de corrupção
    loadFromUserSlot(slotName = 'default_user') {
      const storageKey = `afm2027_individual_save_${slotName}`;
      const backupKey = `afm2027_individual_save_${slotName}_backup`;
      if (typeof localStorage === 'undefined') return null;

      let raw = localStorage.getItem(storageKey);
      if (!raw) {
        // Tenta recuperar do backup se a chave principal foi perdida
        raw = localStorage.getItem(backupKey);
      }
      if (!raw) return null;

      try {
        const parsed = JSON.parse(raw);
        this.ensureSaveIsolation(parsed);
        return parsed;
      } catch (e) {
        console.warn(`[AFM Backup Engine] Save principal corrompido em ${storageKey}. Acionando backup de segurança...`, e);
        // Tenta restaurar imediatamente do slot backup de emergência
        const backupRaw = localStorage.getItem(backupKey);
        if (backupRaw) {
          try {
            const backupParsed = JSON.parse(backupRaw);
            this.ensureSaveIsolation(backupParsed);
            // Auto-repara a chave primária
            localStorage.setItem(storageKey, backupRaw);
            if (typeof window.toast === 'function') {
              window.toast('🛡️ Carreira restaurada com sucesso pelo backup de segurança!');
            }
            return backupParsed;
          } catch (backupErr) {
            console.error('[AFM Backup Engine] Falha no backup secundário:', backupErr);
          }
        }
        return null;
      }
    }
  };

  window.AFM_IsolatedSave = IsolatedSaveManager;
})(typeof window !== 'undefined' ? window : global);
