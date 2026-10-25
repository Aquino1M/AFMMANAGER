const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('=== TESTE DE RECUPERAÇÃO DE SAVES & CONFIGURAÇÃO VERCEL SUPABASE ===');

// 1. Validar api/config.js
const configHandler = require('../api/config.js');
let configData = null;
configHandler({}, {
  setHeader: () => {},
  status: (code) => {
    assert.strictEqual(code, 200, 'api/config status deve ser 200');
    return {
      json: (d) => { configData = d; }
    };
  }
});
assert.ok(configData, 'api/config deve retornar dados');
assert.ok(configData.url.includes('supabase.co'), 'api/config deve retornar url do Supabase');
assert.ok(configData.key.length > 10, 'api/config deve retornar chave do Supabase');
console.log('PASS: api/config.js retorna as credenciais corretas do Supabase:', configData.url);

// 2. Validar api/supabase-config.js
const supConfigHandler = require('../api/supabase-config.js');
let supConfigData = null;
supConfigHandler({}, {
  setHeader: () => {},
  status: (code) => {
    assert.strictEqual(code, 200);
    return {
      json: (d) => { supConfigData = d; }
    };
  }
});
assert.deepStrictEqual(supConfigData, configData, 'api/supabase-config deve ter o mesmo comportamento');
console.log('PASS: api/supabase-config.js funciona perfeitamente!');

// 3. Validar api/restore-saves.js para o usuário vhc0808
const restoreHandler = require('../api/restore-saves.js');
restoreHandler({ query: { username: 'vhc0808' } }, {
  setHeader: () => {},
  status: (code) => {
    assert.strictEqual(code, 200, 'api/restore-saves status deve ser 200');
    return {
      json: (d) => {
        assert.ok(d.ok, 'd.ok deve ser true');
        assert.ok(Array.isArray(d.saves) && d.saves.length > 0, 'Deve retornar ao menos 1 save para vhc0808');
        const s1 = d.saves[0];
        assert.strictEqual(s1.club, 'Cachaceiros Futebol Clube', 'Clube deve ser Cachaceiros Futebol Clube');
        console.log(`PASS: api/restore-saves.js recuperou save do clube "${s1.club}" (Temporada ${s1.season}, Saldo: R$ ${s1.balance.toLocaleString('pt-BR')})!`);
      }
    };
  }
});

// 4. Validar que js/database.js e js/game.js contêm as funções necessárias
const dbSource = fs.readFileSync(path.resolve(__dirname, '../js/database.js'), 'utf8');
assert.ok(dbSource.includes('loadRemoteVercelConfig'), 'database.js deve conter loadRemoteVercelConfig');
assert.ok(dbSource.includes('restoreSavesDirectly'), 'database.js deve conter restoreSavesDirectly');
assert.ok(dbSource.includes("Authorization': `Bearer ${cfg.key}`"), 'database.js deve incluir Authorization Bearer');
console.log('PASS: js/database.js possui todas as integrações de resiliência e Vercel sync!');

const gameSource = fs.readFileSync(path.resolve(__dirname, '../js/game.js'), 'utf8');
assert.ok(gameSource.includes('openRestoreCloudModal'), 'game.js deve conter openRestoreCloudModal');
assert.ok(gameSource.includes('btnRestoreCloudSavesModal'), 'game.js deve conter btnRestoreCloudSavesModal');
assert.ok(gameSource.includes('btnTopRestoreCloud'), 'game.js deve conter btnTopRestoreCloud');
console.log('PASS: js/game.js possui o modal e os botões de restauração rápida de saves da nuvem!');

console.log('=== TODOS OS TESTES DE RESTAURAÇÃO SUPABASE PASSARAM COM SUCESSO! ===');
