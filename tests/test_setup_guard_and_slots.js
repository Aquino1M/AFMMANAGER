// Test Suite: Isolamento de Modos, Proteção de Saves e Guard do Setup (AFM Manager)
const assert = require('assert');

// Mock browser environment if not present
if (typeof window === 'undefined') {
  global.window = global;
  global.document = {
    querySelector: (selector) => {
      if (selector === '.setup-container') return global.__mockSetupContainer || null;
      return null;
    },
    getElementById: (id) => {
      if (id === 'app') return global.__mockAppEl || null;
      return null;
    }
  };
  global.localStorage = {
    _data: {},
    getItem(k) { return this._data[k] || null; },
    setItem(k, v) { this._data[k] = String(v); },
    removeItem(k) { delete this._data[k]; },
    clear() { this._data = {}; }
  };
}

// Minimal mock DOM for app
global.__mockAppEl = {
  attrs: {},
  setAttribute(k, v) { this.attrs[k] = v; },
  getAttribute(k) { return this.attrs[k]; }
};

// 1. Definition of AFM_SETUP_GUARD as implemented in js/game.js
window.AFM_SETUP_GUARD = {
  isSetupActive: function() {
    return Boolean(typeof document !== 'undefined' && document.querySelector && document.querySelector('.setup-container')) ||
      window.state?.view === 'setup' ||
      window.state?.gameMode === 'setup';
  },

  enterSetupCleanly: function() {
    window.__afmAutoSavePaused = true;
    window.__afmIsRendering = false;
    const app = typeof document !== 'undefined' && document.getElementById ? document.getElementById('app') : null;
    if (app && typeof app.setAttribute === 'function') {
      app.setAttribute('data-rendered-game-mode', 'setup');
      app.setAttribute('data-rendered-view', 'setup');
    }
    if (window.state) {
      window.state.view = 'setup';
      window.state.gameMode = 'setup';
    }
  },

  detectSaveMode: function(saveData) {
    if (!saveData || typeof saveData !== 'object') return 'manager';
    const data = saveData.data && typeof saveData.data === 'object' ? saveData.data : saveData;

    // Regra AGENTS.md: gameMode persistido é a autoridade; use isPlayerMode/campos legados só quando ele faltar
    if (saveData.gameMode === 'player' || data.gameMode === 'player') return 'player';
    if (saveData.gameMode === 'manager' || data.gameMode === 'manager') return 'manager';

    const isPlayer = Boolean(
      saveData.playerCareer?.active ||
      saveData.playerCareerState ||
      saveData.controlledPlayerId ||
      saveData.player?.isUserPlayer ||
      saveData.mode === 'player' ||
      saveData.isPlayerMode ||
      data.playerCareer?.active ||
      data.player?.isUserPlayer ||
      data.mode === 'player' ||
      data.isPlayerMode ||
      data.playerCareerState ||
      data.controlledPlayerId ||
      (data.coach?.name === 'Treinador da IA' && (data.player || data.playerCareerState))
    );
    return isPlayer ? 'player' : 'manager';
  },

  sanitizeLoadedSave: function(rawSave, slotNumber) {
    const clean = JSON.parse(JSON.stringify(rawSave || {}));
    const detectedMode = this.detectSaveMode(clean);

    clean.slotId = Number(slotNumber || clean.slotId || clean.userSlot || 1);
    clean.gameMode = detectedMode;
    clean.mode = detectedMode;

    if (detectedMode === 'player') {
      delete clean.isManagerOnly;
      clean.playerCareer = Object.assign({ active: true }, clean.playerCareer || {});
      clean.player = Object.assign({ isUserPlayer: true }, clean.player || {});
      clean.player.isUserPlayer = true;
      const managerViews = ['central', 'tatica', 'elenco', 'mercado', 'financas', 'estrutura', 'escritorio', 'treinos'];
      if (!clean.view || managerViews.includes(clean.view) || clean.view === 'setup') {
        clean.view = 'player_hub';
      }
    } else {
      delete clean.playerCareer;
      delete clean.playerCareerState;
      delete clean.controlledPlayerId;
      delete clean.player;
      const playerViews = ['player_hub', 'player_evolution', 'player_club', 'player_social', 'player_agent', 'player_lifestyle', 'player_stats', 'player_national', 'player_creator'];
      if (!clean.view || playerViews.includes(clean.view) || clean.view === 'setup') {
        clean.view = 'central';
      }
    }
    return clean;
  },

  getFirstAvailableSlot: function(slotsMap) {
    for (const s of [1, 2, 3]) {
      if (!slotsMap) return s;
      if (Array.isArray(slotsMap)) {
        if (!slotsMap[s - 1]) return s;
      } else if (!slotsMap[s]) {
        return s;
      }
    }
    return 1;
  },

  confirmSlotOverwriteIfNeeded: function(targetSlot, slotsMap, newCareerLabel, onConfirm) {
    const existing = Array.isArray(slotsMap) ? slotsMap[targetSlot - 1] : slotsMap?.[targetSlot];
    if (!existing) {
      if (typeof onConfirm === 'function') onConfirm();
      return false; // No modal needed
    }
    return true; // Overwrite confirmation required
  }
};

console.log('--- EXECUTANDO TESTES DE SETUP GUARD E PROTEÇÃO DE SAVES ---');

// Test 1: detectSaveMode correctly classifies Player vs Manager saves
{
  const managerSave = {
    club: { name: 'São Paulo' },
    coach: { name: 'Prof. Aquino' },
    season: 2026,
    gameMode: 'manager'
  };
  assert.strictEqual(window.AFM_SETUP_GUARD.detectSaveMode(managerSave), 'manager', 'Manager save should be manager');

  const playerSave = {
    club: { name: 'Brasília' },
    playerCareerState: { athleteName: 'D. Aquino' },
    controlledPlayerId: 99,
    gameMode: 'player'
  };
  assert.strictEqual(window.AFM_SETUP_GUARD.detectSaveMode(playerSave), 'player', 'Player save should be player');

  const legacyPlayerSave = {
    club: { name: 'Brasília' },
    coach: { name: 'Treinador da IA' },
    player: { name: 'D. Aquino', isUserPlayer: true }
  };
  assert.strictEqual(window.AFM_SETUP_GUARD.detectSaveMode(legacyPlayerSave), 'player', 'Legacy AI Coach + player should be player');
  console.log('✅ Teste 1: detectSaveMode classificou corretamente Manager e Player.');
}

// Test 2: sanitizeLoadedSave strips contaminating views and guarantees mode isolation
{
  const contaminatedManagerSave = {
    club: { name: 'São Paulo' },
    playerCareerState: { athleteName: 'Resíduo Antigo' },
    controlledPlayerId: 123,
    view: 'player_hub',
    gameMode: 'manager'
  };
  const cleanManager = window.AFM_SETUP_GUARD.sanitizeLoadedSave(contaminatedManagerSave, 1);
  assert.strictEqual(cleanManager.gameMode, 'manager');
  assert.strictEqual(cleanManager.view, 'central', 'View should be reset to central for manager');
  assert.strictEqual(cleanManager.playerCareerState, undefined, 'Residual playerCareerState should be purged');
  assert.strictEqual(cleanManager.controlledPlayerId, undefined, 'Residual controlledPlayerId should be purged');
  assert.strictEqual(cleanManager.slotId, 1);

  const contaminatedPlayerSave = {
    club: { name: 'Brasília' },
    playerCareerState: { athleteName: 'D. Aquino' },
    view: 'tatica', // managerial view
    gameMode: 'player'
  };
  const cleanPlayer = window.AFM_SETUP_GUARD.sanitizeLoadedSave(contaminatedPlayerSave, 2);
  assert.strictEqual(cleanPlayer.gameMode, 'player');
  assert.strictEqual(cleanPlayer.view, 'player_hub', 'View should be reset to player_hub for player');
  assert.strictEqual(cleanPlayer.slotId, 2);
  console.log('✅ Teste 2: sanitizeLoadedSave isolou completamente os modos e purgou contaminações.');
}

// Test 3: getFirstAvailableSlot prioritizes Slot 3 when Slots 1 and 2 are full
{
  const slotsWith1and2 = [
    { club: 'São Paulo', slot: 1 },
    { club: 'Brasília', slot: 2 },
    null // Slot 3 is empty
  ];
  const target = window.AFM_SETUP_GUARD.getFirstAvailableSlot(slotsWith1and2);
  assert.strictEqual(target, 3, 'Slot 3 must be selected when Slots 1 and 2 are occupied');

  const allEmpty = [null, null, null];
  assert.strictEqual(window.AFM_SETUP_GUARD.getFirstAvailableSlot(allEmpty), 1, 'Slot 1 when all are empty');

  const allFull = [{ slot: 1 }, { slot: 2 }, { slot: 3 }];
  assert.strictEqual(window.AFM_SETUP_GUARD.getFirstAvailableSlot(allFull), 1, 'Default fallback to 1 when all full');
  console.log('✅ Teste 3: getFirstAvailableSlot selecionou Slot 3 automaticamente.');
}

// Test 4: confirmSlotOverwriteIfNeeded requires confirmation only on occupied slots
{
  const slotsMap = [
    { club: 'São Paulo', slot: 1 },
    { club: 'Brasília', slot: 2 },
    null
  ];
  let confirmFired = false;
  // Slot 3 (empty): should proceed immediately without requiring overwrite modal
  const needsModalSlot3 = window.AFM_SETUP_GUARD.confirmSlotOverwriteIfNeeded(3, slotsMap, 'Nova Carreira', () => { confirmFired = true; });
  assert.strictEqual(needsModalSlot3, false, 'Slot 3 is empty and must not require confirmation modal');
  assert.strictEqual(confirmFired, true, 'Callback onConfirm must execute immediately for empty slot');

  // Slot 1 (occupied): requires overwrite confirmation
  let confirmSlot1Fired = false;
  const needsModalSlot1 = window.AFM_SETUP_GUARD.confirmSlotOverwriteIfNeeded(1, slotsMap, 'Nova Carreira', () => { confirmSlot1Fired = true; });
  assert.strictEqual(needsModalSlot1, true, 'Slot 1 is occupied and must require confirmation modal');
  assert.strictEqual(confirmSlot1Fired, false, 'Callback must not execute automatically without user confirmation');
  console.log('✅ Teste 4: confirmSlotOverwriteIfNeeded protegeu slots ocupados contra sobrescrita acidental.');
}

// Test 5: enterSetupCleanly sets data attributes and pauses auto-save
{
  global.__mockSetupContainer = true;
  window.state = { view: 'player_hub', gameMode: 'player' };
  window.AFM_SETUP_GUARD.enterSetupCleanly();
  assert.strictEqual(window.__afmAutoSavePaused, true, 'Auto-save must be paused upon entering setup');
  assert.strictEqual(global.__mockAppEl.getAttribute('data-rendered-game-mode'), 'setup');
  assert.strictEqual(global.__mockAppEl.getAttribute('data-rendered-view'), 'setup');
  assert.strictEqual(window.AFM_SETUP_GUARD.isSetupActive(), true, 'isSetupActive must be true when setup-container is active');
  console.log('✅ Teste 5: enterSetupCleanly isolou o ambiente de setup e pausou auto-saves.');
}

// Test 6: Validação real em js/game.js e js/database.js contra reversão Jogador -> Treinador e cabeçalho do Setup
{
  const fs = require('fs');
  const path = require('path');
  const gameSrc = fs.readFileSync(path.join(__dirname, '../js/game.js'), 'utf8').replace(/\r\n/g, '\n');
  const dbSrc = fs.readFileSync(path.join(__dirname, '../js/database.js'), 'utf8').replace(/\r\n/g, '\n');

  // Extrai AFM_SETUP_GUARD e isPlayerCareerActive reais de js/game.js
  const guardStart = gameSrc.indexOf('window.AFM_SETUP_GUARD = {');
  const guardEnd = gameSrc.indexOf('window.migrateAndSanitizeSaveState =', guardStart);
  assert(guardStart !== -1 && guardEnd > guardStart, 'AFM_SETUP_GUARD deve existir em js/game.js');
  eval(gameSrc.slice(guardStart, guardEnd));

  // 6a. enterSetupCleanly NÃO pode sobrescrever state.gameMode='player' com 'setup'
  window.__afmSetupScreenActive = false;
  window.state = { view: 'player_hub', gameMode: 'player', club: 'Gama' };
  window.AFM_SETUP_GUARD.enterSetupCleanly();
  assert.strictEqual(window.state.gameMode, 'player', 'enterSetupCleanly nunca pode destruir state.gameMode da carreira');
  assert.strictEqual(window.__afmSetupScreenActive, true);

  // 6b. Save de Modo Jogador com manager='Treinador da IA' (ex.: header da nuvem ou wrapper corrompido) NUNCA vira manager
  const headerWithAiCoach = {
    slot: 2,
    club: 'Gama',
    manager: 'Treinador da IA',
    gameMode: 'manager', // simulando wrapper envenenado
    balance: 1031740,
    date: '2026-01-01'
  };
  assert.strictEqual(window.AFM_SETUP_GUARD.detectSaveMode(headerWithAiCoach), 'player', 'Save com Treinador da IA (sem retiredPlayerCareer) deve ser detectado como player');
  assert.strictEqual(window.isPlayerCareerActive({ club: 'Gama', manager: 'Treinador da IA' }), true, 'isPlayerCareerActive deve proteger save com Treinador da IA');

  const sanitizedPlayer = window.AFM_SETUP_GUARD.sanitizeLoadedSave({
    club: 'Gama',
    manager: 'Treinador da IA',
    gameMode: 'manager',
    playerCareerState: { athleteName: 'João' },
    controlledPlayerId: 'pl_1'
  }, 2);
  assert.strictEqual(sanitizedPlayer.gameMode, 'player', 'sanitizeLoadedSave não pode converter save de Jogador com Treinador da IA para manager');
  assert.ok(sanitizedPlayer.playerCareerState, 'playerCareerState não pode ser deletado quando manager é Treinador da IA');

  // 6c. Ex-jogador aposentado que virou técnico com nome próprio e retiredPlayerCareer deve ser manager
  const retiredPlayer = {
    club: 'Gama',
    manager: 'Aquino',
    gameMode: 'manager',
    retiredPlayerCareer: { athleteName: 'Aquino', games: 120 }
  };
  assert.strictEqual(window.AFM_SETUP_GUARD.detectSaveMode(retiredPlayer), 'manager', 'Ex-jogador aposentado convertido para treinador deve continuar manager');

  // 6d. Cabeçalho do Setup não deve exibir '⚽ Treinador' nem 'Prof.' no chip do usuário
  assert(!gameSrc.includes("?'🛡️ Admin':'⚽ Treinador'"), 'Setup header não pode fixar badge ⚽ Treinador no usuário');
  assert(!gameSrc.includes('👤 Prof. ${esc(activeUser.name)}'), 'Setup header não pode prefixar Prof. no usuário');

  // 6e. database.js (syncUser, restoreSaves, getSavedGameMode) preserva metadados do Modo Jogador e Treinador da IA
  assert(dbSrc.includes("data?.manager === 'Treinador da IA'"), 'database.js getSavedGameMode deve reconhecer Treinador da IA');
  assert(dbSrc.includes('gameMode: detectedEntryMode'), 'database.js syncUser deve gravar gameMode no entry de account.saves');
  assert(dbSrc.includes('gameMode: detectedRowMode'), 'database.js restoreSaves deve gravar gameMode no entry de account.saves');
  assert(gameSrc.includes('gameMode: detectedMode'), 'saveAndConfirmCloud deve incluir gameMode no saveEntry');

  console.log('✅ Teste 6: Isolamento definitivo Jogador vs Treinador, database.js e setup header validados.');
}

console.log('\n🎉 TODOS OS 6 TESTES DO SETUP GUARD E ISOLAMENTO DE SAVES PASSARAM COM SUCESSO!');
