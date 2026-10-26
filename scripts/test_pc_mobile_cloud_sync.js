const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('🧪 Iniciando teste de sincronização Multiplataforma (PC ⇄ Mobile ⇄ Supabase)...');

// Carregar database.js em ambiente simulado
const dbCode = fs.readFileSync(path.join(__dirname, '../js/database.js'), 'utf-8');

// Mock localStorage e window
const localStorageData = {};
const mockLocalStorage = {
  getItem: (key) => localStorageData[key] || null,
  setItem: (key, val) => { localStorageData[key] = String(val); },
  removeItem: (key) => { delete localStorageData[key]; },
  clear: () => { Object.keys(localStorageData).forEach(k => delete localStorageData[k]); }
};

let capturedUpserts = [];
let cloudSavesMock = [];

const mockSupabase = {
  from: (table) => ({
    select: (fields) => ({
      eq: (col1, val1) => ({
        order: (col2, opts) => Promise.resolve({ data: cloudSavesMock, error: null }),
        limit: (l) => Promise.resolve({ data: cloudSavesMock, error: null })
      })
    }),
    upsert: (record, opts) => {
      capturedUpserts.push(record);
      // Atualizar cloudSavesMock
      const idx = cloudSavesMock.findIndex(s => s.slot_id === record.slot_id);
      if (idx >= 0) cloudSavesMock[idx] = record;
      else cloudSavesMock.push(record);
      return Promise.resolve({ error: null });
    }
  })
};

global.window = {
  localStorage: mockLocalStorage,
  location: { reload: () => {} },
  supabase: {
    createClient: () => mockSupabase
  }
};
global.localStorage = mockLocalStorage;

// Avaliar database.js
eval(dbCode);

async function runTests() {
  const AFM_DB = global.window.AFM_DB;
  assert.ok(AFM_DB, 'AFM_DB deve estar disponível em window');
  assert.strictEqual(typeof AFM_DB.cloudSaveSlot, 'function', 'AFM_DB.cloudSaveSlot deve ser função');
  assert.strictEqual(typeof AFM_DB.cloudGetSaves, 'function', 'AFM_DB.cloudGetSaves deve ser função');
  assert.strictEqual(typeof AFM_DB.syncUser, 'function', 'AFM_DB.syncUser deve ser função');

  console.log('✅ 1. API AFM_DB carregada com sucesso.');

  // Cenário 1: Usuário joga no PC, salva no Slot 1 às 10:00:00Z
  const pcSaveTime = '2026-10-26T10:00:00.000Z';
  const pcSaveData = {
    team: 'AQN FC',
    managerName: 'Aquino',
    season: 2026,
    calendar: { currentRound: 6 },
    finances: { balance: 5600000 },
    timestamp: new Date(pcSaveTime).getTime(),
    updated_at: pcSaveTime
  };

  const saveRes = await AFM_DB.cloudSaveSlot('user_aquino', 1, pcSaveData);
  assert.ok(saveRes.success, 'cloudSaveSlot no PC deve retornar success: true');
  assert.strictEqual(capturedUpserts.length, 1, 'Deve ter feito 1 upsert no Supabase');
  assert.strictEqual(capturedUpserts[0].slot_id, 1);
  assert.strictEqual(capturedUpserts[0].club_name, 'AQN FC');
  assert.strictEqual(capturedUpserts[0].manager_name, 'Aquino');
  console.log('✅ 2. Save do PC enviado com sucesso para a nuvem Supabase.');

  // Cenário 2: Usuário abre o jogo no Celular (Mobile)
  // No celular, o cache local está vazio ou tem uma versão antiga das 08:00:00Z
  const oldMobileTime = '2026-10-26T08:00:00.000Z';
  const oldMobileSave = {
    team: 'AQN FC',
    managerName: 'Aquino',
    season: 2026,
    calendar: { currentRound: 3 },
    finances: { balance: 2000000 },
    timestamp: new Date(oldMobileTime).getTime(),
    updated_at: oldMobileTime
  };
  AFM_DB.saveSlot(1, oldMobileSave);

  // Verificar que o local antigo tem Rodada 3
  let localSlots = AFM_DB.getSaves();
  assert.strictEqual(localSlots['1'].calendar.currentRound, 3, 'Slot 1 local antes do sync deve ser rodada 3');

  // Agora o Mobile sincroniza com o Supabase (AFM_DB.syncUser)
  const syncResult = await AFM_DB.syncUser('user_aquino');
  assert.ok(syncResult.success, 'syncUser deve retornar sucesso');

  // REGRA INVIOLÁVEL: O save da nuvem (10:00:00Z) é mais novo que o do mobile (08:00:00Z).
  // Logo, o cache do celular DEVE ser atualizado automaticamente para a Rodada 6 do PC!
  localSlots = AFM_DB.getSaves();
  assert.strictEqual(localSlots['1'].calendar.currentRound, 6, 'O save local deve ter sido atualizado para a Rodada 6 do PC!');
  assert.strictEqual(localSlots['1'].finances.balance, 5600000, 'Saldo deve ser 5.6M');
  console.log('✅ 3. Regra Inviolável Cloud -> Mobile: Save mais recente do PC restaurado com perfeição no Mobile.');

  // Cenário 3: Usuário joga no Celular (Mobile) e avança para a Rodada 7 às 12:00:00Z
  const mobileNewTime = '2026-10-26T12:00:00.000Z';
  const mobileNewSave = {
    team: 'AQN FC',
    managerName: 'Aquino',
    season: 2026,
    calendar: { currentRound: 7 },
    finances: { balance: 6100000 },
    timestamp: new Date(mobileNewTime).getTime(),
    updated_at: mobileNewTime
  };
  // Salva no mobile
  AFM_DB.saveSlot(1, mobileNewSave);

  // O celular sincroniza com a nuvem
  const mobileSyncResult = await AFM_DB.syncUser('user_aquino');
  assert.ok(mobileSyncResult.success, 'Sincronização do mobile para nuvem deve ter sucesso');

  // Como o mobile é mais recente (12:00:00Z > 10:00:00Z), ele deve enviar para a nuvem
  const lastCloudSave = cloudSavesMock.find(s => s.slot_id === 1);
  assert.ok(lastCloudSave, 'Deve ter save no cloud');
  assert.strictEqual(lastCloudSave.save_data.calendar.currentRound, 7, 'Nuvem deve ter sido atualizada com a Rodada 7 do Mobile');
  console.log('✅ 4. Regra Inviolável Mobile -> Cloud: Progresso do celular salvo na nuvem com timestamp superior.');

  // Cenário 4: Checar integridade em js/game.js
  const gameCode = fs.readFileSync(path.join(__dirname, '../js/game.js'), 'utf-8');
  assert.ok(gameCode.includes('btnSyncNowCloudSlot'), 'game.js deve ter o botão de sincronização manual de slots');
  assert.ok(gameCode.includes('syncCloudWithLocal'), 'game.js deve ter a função syncCloudWithLocal implementada');
  assert.ok(gameCode.includes('cloudStatusBadge'), 'game.js deve renderizar a badge de status da nuvem');
  assert.ok(gameCode.includes('btnTopRestoreCloud'), 'game.js deve ter o botão de restaurar da nuvem no topo da tela de saves');

  console.log('✅ 5. Interface de Gerenciamento de Gravações e Landing Page conectadas com sucesso.');
  console.log('\n🎉 TODOS OS TESTES DE SINCRONIZAÇÃO PC ⇄ MOBILE ⇄ SUPABASE PASSARAM COM SUCESSO!');
}

runTests().catch(err => {
  console.error('❌ Falha nos testes de sincronização:', err);
  process.exit(1);
});
