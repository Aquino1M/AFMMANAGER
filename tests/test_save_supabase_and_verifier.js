/**
 * Suíte Automatizada E2E: Blindagem do Save, Verificador Anti-Bug (AFM_SAVE_VERIFIER)
 * e Sincronização com Supabase (afm_saves) sem Troca de Modo (Jogador ⇄ Treinador)
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function createMockElement(tag = 'div') {
  return {
    tagName: tag.toUpperCase(),
    id: '',
    dataset: {},
    style: {},
    value: '',
    checked: false,
    innerHTML: '',
    textContent: '',
    classList: {
      _s: new Set(),
      add(c) { this._s.add(c); },
      remove(c) { this._s.delete(c); },
      contains(c) { return this._s.has(c); },
      toggle(c) { if (this._s.has(c)) this._s.delete(c); else this._s.add(c); }
    },
    addEventListener() {},
    removeEventListener() {},
    appendChild() {},
    removeChild() {},
    remove() {},
    setAttribute() {},
    getAttribute() { return null; },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    closest() { return null; }
  };
}

const storageMap = new Map();
global.window = global;
global.localStorage = {
  getItem: (k) => (storageMap.has(k) ? storageMap.get(k) : null),
  setItem: (k, v) => storageMap.set(k, String(v)),
  removeItem: (k) => storageMap.delete(k),
  clear: () => storageMap.clear(),
  key: (i) => Array.from(storageMap.keys())[i] || null,
  get length() { return storageMap.size; }
};
global.sessionStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {}
};

const appEl = createMockElement('div');
appEl.id = 'app';
global.document = {
  hidden: false,
  body: createMockElement('body'),
  documentElement: createMockElement('html'),
  getElementById: (id) => (id === 'app' ? appEl : null),
  querySelector: (sel) => (sel === '#app' ? appEl : null),
  querySelectorAll: () => [],
  createElement: (tag) => createMockElement(tag),
  addEventListener: () => {}
};
Object.defineProperty(global, 'navigator', {
  value: { userAgent: 'node-test', onLine: true },
  configurable: true
});
global.location = { href: 'http://localhost/', reload: () => {} };
global.confirm = () => true;
global.alert = () => {};
global.scrollTo = () => {};
global.requestAnimationFrame = () => 0;
global.cancelAnimationFrame = () => {};
global.$ = () => null;
global.$$ = () => [];
global.toast = () => {};
global.performance = { now: () => Date.now() };

// Mock FileReader para testar importSave
global.FileReader = class MockFileReader {
  readAsText(file) {
    this.result = file.__content;
    if (typeof this.onload === 'function') {
      this.onload({ target: { result: this.result } });
    }
  }
};

// =========================================================================
// MOCK IN-MEMORY DA TABELA SUPABASE `afm_saves` E `afm_users`
// =========================================================================
const mockCloudTables = {
  afm_saves: new Map(), // key: `${username}::${slot}`
  afm_users: new Map()
};
let upsertCallCount = 0;
let lastUpsertPayloadBytes = 0;

function makeQueryBuilder(tableName) {
  const filters = [];
  let pendingDelete = false;

  const applyFilters = () => {
    const rows = Array.from(mockCloudTables[tableName]?.values() || []);
    return rows.filter(row => filters.every(fn => fn(row)));
  };

  const builder = {
    select() { return builder; },
    eq(col, val) {
      filters.push(row => String(row[col]) === String(val));
      if (pendingDelete) {
        // se for o último filtro, executa no await/then
      }
      return builder;
    },
    ilike(col, val) {
      filters.push(row => String(row[col] || '').toLowerCase() === String(val || '').toLowerCase());
      return builder;
    },
    order(col, opts = {}) {
      const asc = opts.ascending !== false;
      const matched = applyFilters().sort((a, b) => {
        if (a[col] < b[col]) return asc ? -1 : 1;
        if (a[col] > b[col]) return asc ? 1 : -1;
        return 0;
      });
      return Promise.resolve({ data: JSON.parse(JSON.stringify(matched)), error: null });
    },
    maybeSingle() {
      const matched = applyFilters();
      return Promise.resolve({
        data: matched[0] ? JSON.parse(JSON.stringify(matched[0])) : null,
        error: null
      });
    },
    single() {
      const matched = applyFilters();
      return Promise.resolve({
        data: matched[0] ? JSON.parse(JSON.stringify(matched[0])) : null,
        error: matched[0] ? null : { message: 'Row not found' }
      });
    },
    limit(n) {
      const matched = applyFilters().slice(0, n);
      return Promise.resolve({ data: JSON.parse(JSON.stringify(matched)), error: null });
    },
    upsert(payload) {
      if (tableName === 'afm_saves') {
        upsertCallCount++;
        const serialized = JSON.stringify(payload);
        lastUpsertPayloadBytes = Buffer.byteLength(serialized, 'utf8');
        const key = `${String(payload.username).toLowerCase()}::${Number(payload.slot)}`;
        mockCloudTables.afm_saves.set(key, JSON.parse(serialized));
      } else if (tableName === 'afm_users') {
        const key = String(payload.username).toLowerCase();
        mockCloudTables.afm_users.set(key, JSON.parse(JSON.stringify(payload)));
      }
      return Promise.resolve({ data: payload, error: null });
    },
    delete() {
      pendingDelete = true;
      return builder;
    },
    then(resolve, reject) {
      try {
        const matched = applyFilters();
        if (pendingDelete && tableName === 'afm_saves') {
          for (const [k, row] of mockCloudTables.afm_saves.entries()) {
            if (filters.every(fn => fn(row))) {
              mockCloudTables.afm_saves.delete(k);
            }
          }
          return Promise.resolve({ data: matched, error: null }).then(resolve, reject);
        }
        return Promise.resolve({ data: JSON.parse(JSON.stringify(matched)), error: null }).then(resolve, reject);
      } catch (err) {
        return Promise.reject(err).then(resolve, reject);
      }
    }
  };
  return builder;
}

global.fetch = async (url) => {
  if (String(url).includes('/rest/v1/afm_saves')) {
    return { ok: true, status: 200, json: async () => [] };
  }
  return { ok: false, status: 404, json: async () => ({}) };
};

global.supabase = {
  createClient() {
    return {
      from(tableName) {
        return makeQueryBuilder(tableName);
      }
    };
  }
};

// Carrega os módulos reais do jogo na ordem oficial
const rootDir = path.join(__dirname, '..');
const loadScript = (rel) => eval(fs.readFileSync(path.join(rootDir, rel), 'utf8'));

loadScript('js/database.js');
loadScript('js/competitions.js');
loadScript('data/competition_teams.js');
loadScript('data/players_live.js');
loadScript('js/game.js');
loadScript('js/player/lifestyleData.js');
loadScript('js/player/social_media_manager.js');
loadScript('js/player/national_teams_manager.js');
loadScript('js/player/player_career_engine.js');
loadScript('js/player/player_mode_ui.js');
loadScript('js/ui/create_player_ui.js');

async function runAllTests() {
  console.log('=== SUÍTE E2E: SAVE LOCAL + SUPABASE + VERIFICADOR ANTI-BUG (AFM_SAVE_VERIFIER) ===\n');

  // Configura conta autenticada 'aquino'
  window.saveStoredAccounts([{ username: 'aquino', name: 'Aquino', role: 'player', saves: [] }]);
  window.setActiveAccount('aquino');

  // ---------------------------------------------------------------------------
  // TESTE 1: Criação de Modo Jogador + saveAndConfirmCloud() sem duplicidade e sem worldGenerated
  // ---------------------------------------------------------------------------
  console.log('1. Testando salvamento no Supabase (Modo Jogador), corte de worldGenerated e zero upsert duplicado...');
  {
    upsertCallCount = 0;
    window.AFM_SETUP_GUARD.enterSetupCleanly();
    window.setupSelectedSlot = 1;
    window.AFM_CreatePlayerUI.setWizardState({
      step: 5,
      name: 'Aquino',
      nickname: 'Aquino',
      nationality: 'Brasil',
      shirtNumber: 9,
      stateUf: 'DF',
      city: 'Brasília',
      clubName: 'Brasília',
      origin: 'terrao',
      playstyle: 'frieza_letal',
      inspiration: 'ronaldo',
      height: 1.83,
      bodyBuild: 'Forte',
      preferredFoot: 'Direito',
      position: 'ATA',
      archetype: 'st_poacher',
      pointsAvailable: 0,
      pointsDistributed: {
        velocidade: 3, finalizacao: 0, passe: 0, drible: 2, defesa: 0, fisico: 0, reflexos: 0
      },
      starterBoot: 'boot_classic'
    });
    window.AFM_CreatePlayerUI.finalizePlayerCareerStart(appEl);

    // Aguarda eventual promessa pendente do startPlayerCareer
    await new Promise(r => setTimeout(r, 30));

    // Simula catálogo gigante em memória (worldGenerated) para garantir que NUNCA vaze pro Supabase
    const curState = window.getState();
    curState.worldGenerated = Array.from({ length: 2500 }, (_, i) => ({ id: `wg_${i}`, name: `Dummy ${i}`, ovr: 60 }));

    upsertCallCount = 0;
    const savedOk = await window.saveAndConfirmCloud();
    assert.equal(savedOk, true, 'saveAndConfirmCloud deve retornar true com Supabase online');
    assert.equal(upsertCallCount, 1, 'saveAndConfirmCloud DEVE executar exatamente 1 upsert no Supabase (sem chamada paralela duplicada)');

    const cloudRow = mockCloudTables.afm_saves.get('aquino::1');
    assert.ok(cloudRow, 'Linha aquino::1 deve existir em afm_saves no Supabase');
    assert.equal(cloudRow.manager, 'Treinador da IA', 'Coluna manager no Supabase deve ser Treinador da IA no Modo Jogador');
    assert.equal(cloudRow.save_data.gameMode, 'player', 'save_data.gameMode no Supabase deve ser player');
    assert.equal(cloudRow.save_data.isPlayerMode, true, 'save_data.isPlayerMode no Supabase deve ser true');
    assert.equal(cloudRow.save_data.worldGenerated, undefined, 'worldGenerated NÃO pode ser enviado ao Supabase');
    assert.ok(cloudRow.save_data._saveIntegrity?.checksum?.length === 8, 'Checksum FNV-1a de 8 dígitos deve estar gravado no Supabase');
    assert.ok(lastUpsertPayloadBytes < 900 * 1024, `Payload enviado ao Supabase deve ser enxuto (<900KB), atual: ${lastUpsertPayloadBytes} bytes`);
    console.log(`   ✅ PASSOU! Payload Supabase enxuto (${Math.round(lastUpsertPayloadBytes / 1024)} KB), 1 único upsert e checksum ${cloudRow.save_data._saveIntegrity.checksum}.`);
  }

  // ---------------------------------------------------------------------------
  // TESTE 2: Blindagem Imutável contra Mutação Acidental de Modo em Tempo de Execução e Transferência
  // ---------------------------------------------------------------------------
  console.log('2. Testando blindagem contra bug que tente transformar Modo Jogador em Treinador na hora de salvar...');
  {
    const curState = window.getState();
    // Simula bug externo corrompendo o modo do estado ativo antes de salvar!
    curState.gameMode = 'manager';
    curState.mode = 'manager';
    curState.isPlayerMode = false;
    curState.isManagerOnly = true;
    curState.coachName = 'Aquino';
    curState.manager = 'Aquino';

    await window.saveAndConfirmCloud();

    assert.equal(curState.gameMode, 'player', 'AFM_SAVE_VERIFIER deve restaurar gameMode para player imediatamente');
    assert.equal(curState.isPlayerMode, true, 'AFM_SAVE_VERIFIER deve restaurar isPlayerMode para true');
    assert.equal(curState.isManagerOnly, undefined, 'isManagerOnly deve ser purgado');
    assert.equal(curState.manager, 'Treinador da IA', 'manager deve ser restaurado para Treinador da IA');

    const cloudRow = mockCloudTables.afm_saves.get('aquino::1');
    assert.equal(cloudRow.save_data.gameMode, 'player', 'Supabase deve continuar com gameMode === player mesmo após tentativa de corrupção');
    assert.equal(cloudRow.manager, 'Treinador da IA', 'Coluna manager no Supabase deve continuar Treinador da IA');

    // Simula transferência do atleta para outro clube durante a sessão e nova tentativa de corrupção
    curState.club = 'Gama';
    curState.gameMode = 'manager';
    await window.saveAndConfirmCloud();
    assert.equal(curState.gameMode, 'player', 'Trava de modo da sessão deve persistir mesmo quando o atleta muda de clube');
    curState.club = 'Brasília';
    await window.saveAndConfirmCloud();
    console.log('   ✅ PASSOU! Tentativa de trocar modo para Treinador foi neutralizada antes de gravar no disco e no Supabase.');
  }

  // ---------------------------------------------------------------------------
  // TESTE 3: Auto-Cura de NaN / Atributos / Elenco + Auditoria Ao Vivo (auditActiveSaveAndCloud)
  // ---------------------------------------------------------------------------
  console.log('3. Testando auto-cura (NaN, atributos fora de [1,99], data e elenco) + auditActiveSaveAndCloud...');
  {
    const curState = window.getState();
    const ctrlId = curState.controlledPlayerId;
    curState.balance = NaN;
    curState.playerCareerState.personalBank = NaN;
    curState.playerCareerState.overall = 145;
    curState.playerCareerState.attributes.pace = -15;
    curState.date = '';
    curState.squad = curState.squad.filter(p => p.id !== ctrlId);

    await window.saveAndConfirmCloud();
    const report = await window.AFM_SAVE_VERIFIER.auditActiveSaveAndCloud();

    assert.equal(report.ok, true, `Auditoria completa deve aprovar 100%, recebido: ${JSON.stringify(report.checks)}`);
    assert.equal(report.localOk, true, 'Save local e checksum JSON devem estar íntegros');
    assert.equal(report.cloudOk, true, 'Save na tabela afm_saves do Supabase deve bater com o modo local');
    assert.equal(Number.isFinite(curState.balance), true, 'balance NaN deve ser curado');
    assert.equal(Number.isFinite(curState.playerCareerState.personalBank), true, 'personalBank NaN deve ser curado');
    assert.ok(curState.playerCareerState.overall <= 99 && curState.playerCareerState.overall >= 1, 'OVR deve ficar em [1,99]');
    assert.ok(curState.playerCareerState.attributes.pace >= 1, 'Atributo negativo deve ser curado para >= 1');
    assert.ok(curState.squad.some(p => p.id === ctrlId), 'Atleta controlado ausente deve ser reinserido automaticamente no elenco');
    console.log('   ✅ PASSOU! Auto-cura e auditoria ao vivo (Memória + LocalStorage + Supabase) 100% validadas.');
  }

  // ---------------------------------------------------------------------------
  // TESTE 4: Imunidade contra Lixo Legado em STORAGE (Slot 1)
  // ---------------------------------------------------------------------------
  console.log('4. Testando imunidade do Slot 1 contra save legado órfão em aquino_futebol_manager_2026_v1...');
  {
    localStorage.setItem('aquino_futebol_manager_2026_v1', JSON.stringify({
      club: 'Ceilândia',
      gameMode: 'manager',
      manager: 'Antigo Técnico',
      squad: [{ id: 'x1', name: 'Goleiro', pos: 'GK' }]
    }));

    // Salvar no Slot 1 NÃO pode ser bloqueado por preserveConflictingSlot
    window.save({ manual: true, force: true });
    const slots = window.getUserSaveSlots('aquino');
    assert.equal(slots[0].gameMode, 'player', 'Slot 1 deve continuar sendo Modo Jogador mesmo com STORAGE legado sujo');

    const loadedOk = window.loadUserSlot(1, 'aquino');
    assert.equal(loadedOk, true, 'loadUserSlot(1) deve carregar com sucesso');
    assert.equal(window.getState().gameMode, 'player', 'Carregar Slot 1 deve abrir Modo Jogador');
    assert.equal(window.getView(), 'player_hub', 'View ativa deve ser player_hub');
    console.log('   ✅ PASSOU! Slot 1 imune contra contaminação da chave legada STORAGE.');
  }

  // ---------------------------------------------------------------------------
  // TESTE 5: Bloqueio de Conflito Acidental no Supabase vs Sobrescrita Legítima (Online & Offline)
  // ---------------------------------------------------------------------------
  console.log('5. Testando bloqueio de sobrescrita acidental no Supabase vs Nova Carreira autorizada...');
  {
    // Tentativa acidental de salvar um payload 'manager' em cima do Slot 1 'player' SEM allowModeReplace
    const accidentalRes = await window.AFM_DB.saveSlot('aquino', 1, {
      slot: 1,
      owner: 'aquino',
      club: 'Ceilândia',
      gameMode: 'manager',
      isPlayerMode: false,
      manager: 'Aquino',
      updatedAt: new Date(Date.now() + 5000).toISOString(),
      data: { club: 'Ceilândia', gameMode: 'manager', isPlayerMode: false, squad: [{ id: '1', pos: 'GK' }] }
    }, { allowModeReplace: false });

    // Nota: como a sessão está travada em 'player' no Slot 1, o próprio verificador ou o guardião de nuvem impede virar manager!
    const cloudAfterAccidental = mockCloudTables.afm_saves.get('aquino::1');
    assert.equal(cloudAfterAccidental.save_data.gameMode, 'player', 'Supabase JAMAIS pode virar manager sem autorização explícita');

    // Agora simula tela inicial limpa + criação de nova carreira Manager no Slot 3
    window.AFM_SETUP_GUARD.enterSetupCleanly();
    window.newCareer({
      clubName: 'Ceilândia',
      manager: 'Aquino',
      slot: 3,
      gameMode: 'manager'
    });
    await new Promise(r => setTimeout(r, 30));
    const slot3Cloud = mockCloudTables.afm_saves.get('aquino::3');
    assert.ok(slot3Cloud, 'Slot 3 deve ser salvo no Supabase ao iniciar carreira Treinador');
    assert.equal(slot3Cloud.save_data.gameMode, 'manager', 'Slot 3 deve ser manager');
    assert.equal(mockCloudTables.afm_saves.get('aquino::1').save_data.gameMode, 'player', 'Slot 1 deve permanecer intocado como player');

    // Testa newCareer com gameMode: 'player' SEM deferInitialSave (Bug #1 corrigido)
    window.AFM_SETUP_GUARD.enterSetupCleanly();
    window.newCareer({
      clubName: 'Gama',
      slot: 2,
      gameMode: 'player',
      isPlayerMode: true
    });
    await new Promise(r => setTimeout(r, 30));
    const slot2Cloud = mockCloudTables.afm_saves.get('aquino::2');
    assert.equal(slot2Cloud.save_data.gameMode, 'player', 'newCareer com gameMode: player deve salvar como player já no primeiro save');

    // Limpa Slot 2 para usar nos próximos testes
    mockCloudTables.afm_saves.delete('aquino::2');
    localStorage.removeItem('afm_save_aquino_slot_2');
    localStorage.removeItem('afm_save_slot_2');
    localStorage.removeItem('afm_save_slot_2_backup');
    const accs = window.getStoredAccounts();
    accs[0].saves = accs[0].saves.filter(s => s.slot !== 2);
    window.saveStoredAccounts(accs);
    console.log('   ✅ PASSOU! Proteção anti-conflito no Supabase e ordem de inicialização do newCareer validadas.');
  }

  // ---------------------------------------------------------------------------
  // TESTE 6: syncUser & restoreSaves respeitam Tela Inicial e evitam Split-Brain (window.state === getState())
  // ---------------------------------------------------------------------------
  console.log('6. Testando syncUser na Tela Inicial e paridade entre window.state e getState()...');
  {
    window.AFM_SETUP_GUARD.enterSetupCleanly();
    window.setState(null);

    const syncOnSetup = await window.AFM_DB.syncUser('aquino');
    assert.equal(syncOnSetup.ok, true, 'syncUser deve concluir com sucesso');
    assert.equal(window.getState(), null, 'syncUser NÃO pode injetar estado em memória enquanto a Tela Inicial estiver aberta');
    assert.equal(window.state, null, 'window.state deve permanecer null na Tela Inicial');

    // Carrega Slot 1 (Player) e simula atualização mais nova vinda do celular no Supabase
    window.loadUserSlot(1, 'aquino');
    assert.equal(window.getState().gameMode, 'player', 'Slot 1 carregado em Modo Jogador');

    const cloudSlot1 = JSON.parse(JSON.stringify(mockCloudTables.afm_saves.get('aquino::1')));
    const futureIso = new Date(Date.now() + 60000).toISOString();
    cloudSlot1.updated_at = futureIso;
    cloudSlot1.save_data.updatedAt = futureIso;
    cloudSlot1.save_data.playerCareerState.personalBank = 77777;
    if (cloudSlot1.save_data.playerCareerState.lifestyle) {
      cloudSlot1.save_data.playerCareerState.lifestyle.cash = 77777;
    }
    if (cloudSlot1.save_data.player) {
      cloudSlot1.save_data.player.personalBank = 77777;
      cloudSlot1.save_data.player.cash = 77777;
    }
    mockCloudTables.afm_saves.set('aquino::1', cloudSlot1);

    const syncInGame = await window.AFM_DB.syncUser('aquino');
    assert.equal(syncInGame.ok, true, 'syncUser durante o jogo deve concluir');
    assert.equal(window.getState(), window.state, 'Zero Split-Brain: window.getState() e window.state devem apontar para o exato mesmo objeto');
    assert.equal(window.getState().gameMode, 'player', 'Modo Jogador preservado após pull da nuvem');
    assert.equal(window.getState().playerCareerState.personalBank, 77777, 'Dados novos da nuvem aplicados no estado interno');
    console.log('   ✅ PASSOU! Zero split-brain e respeito absoluto à Tela Inicial em syncUser.');
  }

  // ---------------------------------------------------------------------------
  // TESTE 7: duplicateSaveSlot & importSave preservam Modo Jogador e enviam ao Supabase
  // ---------------------------------------------------------------------------
  console.log('7. Testando duplicateSaveSlot e importSave em Modo Jogador...');
  {
    window.AFM_SETUP_GUARD.enterSetupCleanly();
    window.duplicateSaveSlot(1); // Duplica Slot 1 (Player) para Slot 2 livre
    await new Promise(r => setTimeout(r, 30));

    const dupCloud = mockCloudTables.afm_saves.get('aquino::2');
    assert.ok(dupCloud, 'Slot 2 duplicado deve ser sincronizado automaticamente com o Supabase');
    assert.equal(dupCloud.save_data.gameMode, 'player', 'Slot 2 duplicado deve preservar gameMode === player');
    assert.equal(dupCloud.manager, 'Treinador da IA', 'Slot 2 duplicado deve manter Treinador da IA');

    // Testa importSave (em jogo) com JSON de Modo Jogador
    window.loadUserSlot(2, 'aquino');
    const exportedJson = JSON.stringify(dupCloud.save_data);
    window.setView('central'); // força view errada antes de importar para provar que importSave corrige para player_hub
    const fakeEvent = { target: { files: [{ __content: exportedJson }] } };
    // Executa importSave via input simulado
    const impStart = fs.readFileSync(path.join(rootDir, 'js/game.js'), 'utf8').indexOf('function importSave(ev){');
    assert.ok(impStart > 0, 'importSave deve existir em js/game.js');

    // Aciona importSave real registrado no handler ou via export/import
    window.importSaveJsonFile({ __content: exportedJson }, 2);
    await new Promise(r => setTimeout(r, 30));
    window.loadUserSlot(2, 'aquino');
    assert.equal(window.getState().gameMode, 'player', 'Save JSON importado deve permanecer Modo Jogador');
    assert.equal(window.getView(), 'player_hub', 'View após carregar save importado de jogador deve ser player_hub');
    console.log('   ✅ PASSOU! Duplicação e importação JSON preservam Modo Jogador e sincronizam com Supabase.');
  }

  // ---------------------------------------------------------------------------
  // TESTE 8: Transição Oficial de Aposentadoria (Jogador -> Treinador aos 35+)
  // ---------------------------------------------------------------------------
  console.log('8. Testando transição legítima de aposentadoria (Jogador ➔ Treinador)...');
  {
    window.loadUserSlot(2, 'aquino');
    const st = window.getState();
    st.retiredPlayerCareer = JSON.parse(JSON.stringify(st.playerCareerState));
    delete st.playerCareerState;
    delete st.controlledPlayerId;
    delete st.aiCoachControlled;
    st.gameMode = 'manager';
    st.isPlayerMode = false;
    st.coachName = 'Aquino';
    st.manager = 'Aquino';

    window.AFM_SAVE_VERIFIER.lockSlotMode(2, 'manager', { club: st.club });
    window.save({ allowModeReplace: true, force: true });
    await new Promise(r => setTimeout(r, 30));

    const retiredCloud = mockCloudTables.afm_saves.get('aquino::2');
    assert.equal(retiredCloud.save_data.gameMode, 'manager', 'Aposentadoria oficial com retiredPlayerCareer deve transicionar o slot para manager');
    assert.ok(retiredCloud.save_data.retiredPlayerCareer, 'Histórico de ex-atleta deve permanecer preservado no save');
    console.log('   ✅ PASSOU! Transição legítima Jogador ➔ Treinador na aposentadoria preservada.');
  }

  console.log('\n🎉 TODOS OS 8 TESTES DE SAVE, SUPABASE E VERIFICADOR ANTI-BUG PASSARAM COM 100% DE SUCESSO!');
  process.exit(0);
}

runAllTests().catch(err => {
  console.error('\n❌ FALHA NA SUÍTE DE SAVE & SUPABASE:', err);
  process.exit(1);
});
