/**
 * Test Suite: AFM 2027 3D Stadium Integration & Asset Verification
 */
const assert = require('assert');
const fs = require('fs');

console.log('--- TEST 1: Verificar arquivos 3D no disco ---');
const requiredFiles = [
  'assets/stadiums/arena_aberta.glb',
  'assets/stadiums/arena_classica.glb',
  'assets/stadiums/arena_moderna.glb',
  'assets/stadiums/gradas_modulares_sem_campo.glb',
  'assets/stadiums/PREVIA_ESTADIOS.png',
  'assets/stadios/arena_aberta.glb',
  'assets/stadios/arena_classica.glb',
  'assets/stadios/arena_moderna.glb',
  'assets/stadios/gradas_modulares_sem_campo.glb',
  'public/assets/stadios/arena_aberta.glb',
  'public/assets/stadios/arena_classica.glb',
  'public/assets/stadios/arena_moderna.glb',
  'public/assets/stadios/gradas_modulares_sem_campo.glb'
];

requiredFiles.forEach(file => {
  assert.ok(fs.existsSync(file), `Arquivo não encontrado: ${file}`);
  const stats = fs.statSync(file);
  assert.ok(stats.size > 1000, `Arquivo muito pequeno (${stats.size} bytes): ${file}`);
  console.log(`  ✓ ${file} (${(stats.size / 1024).toFixed(1)} KB)`);
});

console.log('\n--- TEST 2: Carregar AFMStadium3D e verificar catálogo ---');
const globalWindow = {
  normSlug: (str) => String(str).toLowerCase().replace(/[^a-z0-9]/g, '_')
};
global.window = globalWindow;

require('../js/core/stadium_3d_manager.js');
const AFMStadium3D = globalWindow.AFMStadium3D;
assert.ok(AFMStadium3D, 'AFMStadium3D deve estar definido');
assert.ok(AFMStadium3D.catalog, 'Catálogo deve estar presente');
assert.strictEqual(Object.keys(AFMStadium3D.catalog).length, 4, 'Catálogo deve ter 4 modelos');

assert.strictEqual(AFMStadium3D.catalog.arena_aberta.stLevel, 1);
assert.strictEqual(AFMStadium3D.catalog.arena_classica.stLevel, 2);
assert.strictEqual(AFMStadium3D.catalog.arena_moderna.stLevel, 3);
assert.strictEqual(AFMStadium3D.catalog.gradas_modulares.stLevel, 0);
console.log('  ✓ Catálogo carregado com sucesso (4 modelos validados)');

console.log('\n--- TEST 3: Testar Resolução Dinâmica de Estádios ---');
// 1. Criciúma (Heriberto Hülse ~19.200 lugares -> arena_classica)
const criciumaModel = AFMStadium3D.resolveStadiumModel('Criciúma', { stadiumCapacity: 19200, infrastructure: { stadium: { level: 2 } } });
assert.strictEqual(criciumaModel.id, 'arena_classica', 'Criciúma deve resolver arena_classica');
console.log('  ✓ Criciúma -> arena_classica (Ferradura Clássica)');

// 2. Flamengo (Maracanã ~78.000 lugares -> arena_moderna)
const flamengoModel = AFMStadium3D.resolveStadiumModel('Flamengo', { stadiumCapacity: 78000, infrastructure: { stadium: { level: 5 } } });
assert.strictEqual(flamengoModel.id, 'arena_moderna', 'Flamengo deve resolver arena_moderna');
console.log('  ✓ Flamengo -> arena_moderna (Arena Padrão FIFA)');

// 3. Time pequeno / divisão de acesso (~5.000 lugares -> arena_aberta)
const pequenoModel = AFMStadium3D.resolveStadiumModel('Marcílio Dias', { stadiumCapacity: 6000, infrastructure: { stadium: { level: 1 } } });
assert.strictEqual(pequenoModel.id, 'arena_aberta', 'Clube menor deve resolver arena_aberta');
console.log('  ✓ Marcílio Dias -> arena_aberta (Aberto / Raiz)');

// 4. Heurística de clube conhecido sem estado ativo
const palmeirasModel = AFMStadium3D.resolveStadiumModel('Palmeiras', null);
assert.strictEqual(palmeirasModel.id, 'arena_moderna', 'Palmeiras histórico deve ser arena_moderna');
console.log('  ✓ Palmeiras (sem save) -> arena_moderna (Heurística)');

const santosModel = AFMStadium3D.resolveStadiumModel('Santos', null);
assert.strictEqual(santosModel.id, 'arena_classica', 'Santos histórico deve ser arena_classica');
console.log('  ✓ Santos (sem save) -> arena_classica (Heurística)');

console.log('\n--- TEST 4: Testar Renderização de Card HTML ---');
const html = AFMStadium3D.renderStadium3DCardHTML('Criciúma', {
  club: 'Criciúma',
  stadiumName: 'Estádio Heriberto Hülse',
  stadiumCapacity: 19200,
  infrastructure: { stadium: { level: 2, capacity: 19200 } }
});
assert.ok(html.includes('Estádio Heriberto Hülse'), 'Deve conter o nome do estádio');
assert.ok(html.includes('19.200'), 'Deve formatar a capacidade em pt-BR');
assert.ok(html.includes('Ferradura Clássica'), 'Deve conter o badge do modelo clássico');
assert.ok(html.includes('openStadium3DViewerModal'), 'Deve conter o gatilho para o visualizador 3D');
console.log('  ✓ Card HTML renderizado com todos os metadados necessários');

console.log('\n--- TEST 5: Verificar conexões em js/game.js e index.html ---');
const gameJs = fs.readFileSync('js/game.js', 'utf8');
assert.ok(gameJs.includes('AFMStadium3D.renderStadium3DCardHTML'), 'js/game.js deve chamar AFMStadium3D.renderStadium3DCardHTML');

const indexHtml = fs.readFileSync('index.html', 'utf8');
assert.ok(indexHtml.includes('js/core/stadium_3d_manager.js'), 'index.html deve carregar stadium_3d_manager.js');
assert.ok(indexHtml.includes('model-viewer'), 'index.html deve incluir suporte ao model-viewer');
console.log('  ✓ Todas as conexões em js/game.js e index.html validadas');

console.log('\n========================================');
console.log('TODOS OS 5 TESTES DE ESTÁDIOS 3D PASSARAM COM 100% DE SUCESSO!');
console.log('========================================');
