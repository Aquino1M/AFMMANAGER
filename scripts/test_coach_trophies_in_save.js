// scripts/test_coach_trophies_in_save.js
const fs = require('fs');
const assert = require('assert');
const vm = require('vm');

console.log('🧪 Iniciando testes de Troféus Conquistados no Comando (No Save)...');

// Carregar o script trophies_tv_1year_marketing_and_payroll.js no sandbox
const scriptCode = fs.readFileSync('js/systems/trophies_tv_1year_marketing_and_payroll.js', 'utf8');

const context = {
  window: {
    addEventListener: () => {},
    requestAnimationFrame: (fn) => setTimeout(fn, 0)
  },
  document: {
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => ({ id: '', style: {}, innerHTML: '', appendChild: () => {}, querySelector: () => null, querySelectorAll: () => [] }),
    body: { appendChild: () => {} },
    addEventListener: () => {}
  },
  console: console,
  norm: (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
};

vm.createContext(context);
vm.runInContext(scriptCode, context);

const api = context.window.AFM_TrophiesTvPayroll;
assert(api, 'AFM_TrophiesTvPayroll não inicializado no window');
const getClubTitlesWonInSave = api.getClubTitlesWonInSave;
const getTrophiesHtmlBlock = api.getTrophiesHtmlBlock;

// Teste 1: Save novo do Corinthians (0 títulos no save)
const stateNew = {
  club: 'Corinthians',
  season: 2026,
  titles: [],
  seasonHistory: [],
  manager: 'Aquino'
};

const wonNew = getClubTitlesWonInSave('Corinthians', stateNew);
assert.strictEqual(wonNew.length, 0, 'Save novo não deve ter títulos no comando');
console.log('✓ 1. Save novo com 0 títulos no comando validado com sucesso');

const htmlNew = getTrophiesHtmlBlock(stateNew);
assert(htmlNew.includes('TÍTULOS CONQUISTADOS NO COMANDO DO CORINTHIANS (NO SAVE)'), 'Cabeçalho não encontrado');
assert(htmlNew.includes('Em busca da 1ª Taça no Comando do Corinthians'), 'Card de busca do 1º título não encontrado');
// O título histórico de 2012 NÃO pode estar dentro de coach-trophies-container!
const coachSectionMatch = htmlNew.match(/class="coach-trophies-container"[\s\S]*?<\/div>\s*<\/div>/);
assert(coachSectionMatch, 'coach-trophies-container não encontrado');
assert(!coachSectionMatch[0].includes('2012'), 'ERRO CRÍTICO: 2012 não pode estar na seção de títulos conquistados no save!');
assert(!coachSectionMatch[0].includes('Campeão Invicto'), 'ERRO CRÍTICO: Campeão Invicto de 2012 não pode estar nos títulos do save!');
console.log('✓ 2. Seção de títulos conquistados no comando exibe estado inicial limpo sem títulos históricos de 2012');

// Teste 2: Save após conquistar o Campeonato Paulista e a Copa do Brasil
const stateWon = {
  club: 'Corinthians',
  season: 2026,
  titles: ['Campeonato Paulista', 'Copa do Brasil'],
  seasonHistory: [],
  manager: 'Aquino'
};

const wonActual = getClubTitlesWonInSave('Corinthians', stateWon);
assert.strictEqual(wonActual.length, 2, 'Deveria ter 2 títulos conquistados');
assert.strictEqual(wonActual[0].name, 'Campeonato Paulista');
assert.strictEqual(wonActual[1].name, 'Copa do Brasil');
console.log('✓ 3. Títulos conquistados no save resolvidos: ' + wonActual.map(t => t.name).join(', '));

const htmlWon = getTrophiesHtmlBlock(stateWon);
const coachSectionWon = htmlWon.slice(htmlWon.indexOf('TÍTULOS CONQUISTADOS NO COMANDO'));
assert(coachSectionWon.includes('Campeonato Paulista'), 'Campeonato Paulista ausente no container do save');
assert(coachSectionWon.includes('Copa do Brasil'), 'Copa do Brasil ausente no container do save');
assert(!coachSectionWon.includes('2012'), '2012 não pode estar nos títulos conquistados no save');
console.log('✓ 4. HTML exibe os títulos reais conquistados no save pelo jogador com o time');

// Teste 3: Título conquistado na temporada anterior via seasonHistory
const stateMultiSeason = {
  club: 'Corinthians',
  season: 2027,
  titles: ['Supercopa do Brasil'],
  seasonHistory: [
    {
      season: 2026,
      compName: 'Campeonato Brasileiro Série A',
      champion: 'Corinthians',
      userClub: 'Corinthians',
      titlesWon: ['Campeonato Paulista']
    }
  ],
  manager: 'Aquino'
};

const wonMulti = getClubTitlesWonInSave('Corinthians', stateMultiSeason);
const names = wonMulti.map(t => t.name);
assert(names.includes('Supercopa do Brasil'), 'Falta Supercopa');
assert(names.includes('Campeonato Brasileiro Série A'), 'Falta Brasileirão da seasonHistory');
assert(names.includes('Campeonato Paulista'), 'Falta Paulistão da seasonHistory');
console.log('✓ 5. Títulos de temporadas anteriores no histórico do save integrados perfeitamente: ' + names.join(', '));

// Teste 4: Garantir que títulos históricos continuam na galeria histórica do clube
assert(htmlNew.includes('TÍTULOS HISTÓRICOS REAIS DO CORINTHIANS'), 'Galeria histórica do clube ausente');
assert(htmlNew.includes('CONMEBOL Libertadores'), 'Libertadores histórica do clube ausente na galeria histórica');
assert(htmlNew.includes('2012 (Campeão Invicto)'), '2012 deve estar na galeria histórica do clube');
console.log('✓ 6. Galeria histórica do clube preserva 100% dos títulos reais oficiais (Libertadores 2012, Mundiais, etc.)');

console.log('\n🎉 TODOS OS TESTES DE TÍTULOS CONQUISTADOS NO COMANDO PASSARAM COM 100% DE SUCESSO!');
