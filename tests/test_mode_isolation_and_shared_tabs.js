const assert = require('assert');
const fs = require('fs');

console.log('🧪 Iniciando Testes de Isolamento de Modos & Abas Compartilhadas...');

// Mock browser environment
global.window = global;
global.document = {
  createElement: () => ({ className: '', style: {}, innerHTML: '', appendChild: () => {} }),
  getElementById: () => null,
  querySelectorAll: () => []
};

// Carregar definições do jogo
require('../js/competitions.js');

// Mock helpers
global.norm = str => (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
global.esc = str => String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
global.formatDatePtBr = isoStr => isoStr || '01 de janeiro de 2026';
global.clubByName = name => ({ name, stadium: `Estádio do ${name}`, competition: 'Campeonato Candango' });
global.clubBadge = (name, size) => `<img src="badge_${name}.png" width="${size}" />`;
global.playerPhoto = (name, size) => `<img src="photo_${name}.png" width="${size}" />`;
global.playerKey = p => p.name || 'player';
global.playerOverall = p => Number(p.ovr || p.overall || 70);
global.playerSalary = p => Number(p.salary || p.wage || 5000);
global.playerContractUntil = p => Number(p.contractUntil || 2027);
global.calcValueMi = p => Number(p.marketValueMi || 1.5);
global.fmtMoney = val => `R$ ${Number(val||0).toLocaleString('pt-BR')}`;
global.fmtMi = val => `R$ ${val}M`;
global.ratingClass = r => 'good';
global.isExpensiveForTier = p => false;
global.isPlayerTransferListed = p => false;
global.isPlayerLoanListed = p => false;
global.squadCapacity = () => 35;
global.totalMonthlyPayroll = () => 150000;
global.totalFacilitiesMonthlyExpense = () => 20000;
global.curComp = () => ({ id: 'bra-est-df-candango', name: 'Campeonato Candango', country: 'Brasil' });
global.compById = id => ({ id, name: 'Campeonato Candango', country: 'Brasil' });
global.getSavedSeasonMemberships = () => ({ stateId: 'bra-est-df-candango', nationalId: 'bra-a' });
global.clubStateCompId = () => 'bra-est-df-candango';
global.ranking = () => [];
global.save = () => {};
global.render = () => {};
global.$ = () => null;
global.$$ = () => [];
global.squadFilter = 'ALL';
global.squadRosterSort = 'overall';
global.squadViewMode = 'normal';
global.newsChannelFilter = 'ALL';
global.newsCategoryFilter = 'ALL';
global.calendarFilter = 'ALL';
global.selectedEstadualId = null;
global.seasonTab = 'estadual';
global.estadualPhase = 'primeira_fase';
global.estadualTableFilter = 'geral';
global.statsFilterTab = 'artilharia';

// Carregar código do js/game.js
const gameCode = fs.readFileSync('js/game.js', 'utf8');

function extractFunctionCode(source, funcName) {
  const idx = source.indexOf(`function ${funcName}(`);
  if (idx === -1) throw new Error(`Function ${funcName} not found`);
  let braceCount = 0;
  let inFunc = false;
  let endIdx = -1;
  for (let i = idx; i < source.length; i++) {
    if (source[i] === '{') {
      braceCount++;
      inFunc = true;
    } else if (source[i] === '}') {
      braceCount--;
      if (inFunc && braceCount === 0) {
        endIdx = i + 1;
        break;
      }
    }
  }
  return source.slice(idx, endIdx);
}

// Extrair e avaliar resolveModeContext
const resolveTarget = 'window.resolveModeContext = resolveModeContext;';
eval(gameCode.slice(gameCode.indexOf('function resolveModeContext('), gameCode.indexOf(resolveTarget) + resolveTarget.length));

// Teste 1: resolveModeContext
console.log('1. Testando resolveModeContext...');
const mState = { gameMode: 'manager', club: 'Flamengo', date: '2026-02-01' };
const mCtx = resolveModeContext(mState);
assert.strictEqual(mCtx.mode, 'MODE_MANAGER');
assert.strictEqual(mCtx.isManager, true);
assert.strictEqual(mCtx.isPlayer, false);
assert.strictEqual(mCtx.clubName, 'Flamengo');

const pState = { gameMode: 'player', club: 'DF Esporte Clube', playerCareerState: { clubName: 'DF Esporte Clube', athleteName: 'D. Aquino' }, date: '2026-01-20' };
const pCtx = resolveModeContext(pState);
assert.strictEqual(pCtx.mode, 'MODE_PLAYER');
assert.strictEqual(pCtx.isManager, false);
assert.strictEqual(pCtx.isPlayer, true);
assert.strictEqual(pCtx.clubName, 'DF Esporte Clube');
assert.strictEqual(pCtx.playerName, 'D. Aquino');
console.log('✅ resolveModeContext validado com sucesso!');

// Teste 2: newsMediaPage isolamento e categorias
console.log('2. Testando newsMediaPage()...');
global.generateSimWorldNews = () => [
  { channel: 'G1', source: 'G1 Esporte', time: '10:00', title: 'Flamengo vence clássico', text: 'Grande jogo no Maracanã' },
  { channel: 'CAZETV', source: 'CazéTV', time: '11:00', title: 'DF Esporte Clube contrata reforço', text: 'Novo reforço anunciado para a temporada' }
];

// No modo Treinador (Flamengo)
global.state = mState;
global.state.news = [{ text: 'Minha foto pessoal foi atualizada no CT' }]; // Fictícia de jogador
eval(extractFunctionCode(gameCode, 'newsMediaPage'));

const managerNewsHtml = newsMediaPage();
assert.ok(managerNewsHtml.includes('Sala de Imprensa do Treinador'), 'Deve indicar sala de imprensa do treinador');
assert.ok(!managerNewsHtml.includes('Minha foto pessoal'), 'Notícias pessoais do atleta não devem vazar para o treinador');

// No modo Jogador (DF Esporte Clube)
global.state = pState;
global.state.news = [{ title: 'Treino de Finalização', text: 'D. Aquino treinou pênaltis no CT hoje' }];
const playerNewsHtml = newsMediaPage();
assert.ok(playerNewsHtml.includes('Treino de Finalização'), 'Notícia da carreira deve aparecer no modo jogador');
console.log('✅ newsMediaPage isolamento e filtros validados com sucesso!');

// Teste 3: squadPage isolamento de permissões e resumo
console.log('3. Testando squadPage()...');
global.normalizeSquadState = () => {};
global.state = {
  ...mState,
  squad: [
    { name: 'Goleiro 1', pos: 'GK', ovr: 75, age: 28, salary: 15000, fitness: 100, morale: 90 },
    { name: 'Zagueiro 1', pos: 'CB', ovr: 72, age: 24, salary: 10000, fitness: 85, morale: 80 },
    { name: 'Atacante Craque', pos: 'ST', ovr: 80, age: 21, salary: 25000, fitness: 95, morale: 100 }
  ]
};

// Executar squadPage no modo treinador
eval(extractFunctionCode(gameCode, 'squadPage'));
const managerSquadHtml = squadPage();
assert.ok(managerSquadHtml.includes('RESUMO DO ELENCO • GESTÃO DO TREINADOR'), 'Resumo Dark Neon presente no modo técnico');
assert.ok(managerSquadHtml.includes('Renovar contrato'), 'Botão Renovar Contrato disponível para o treinador');
assert.ok(managerSquadHtml.includes('Propostas / Vender'), 'Botão Vender disponível para o treinador');

// Executar squadPage no modo jogador
global.state = {
  ...pState,
  squad: [
    { name: 'Goleiro 1', pos: 'GK', ovr: 75, age: 28, salary: 15000, fitness: 100 },
    { name: 'D. Aquino', pos: 'ST', ovr: 78, age: 16, salary: 2000, fitness: 100, isControlled: true }
  ]
};
const playerSquadHtml = squadPage();
assert.ok(playerSquadHtml.includes('CONSULTA DO ATLETA'), 'Indica modo consulta do atleta');
assert.ok(!playerSquadHtml.includes('Renovar contrato'), 'Botão Renovar Contrato DEVE ser ocultado no modo atleta');
assert.ok(playerSquadHtml.includes('VOCÊ'), 'Destaque VOCÊ presente no atleta controlado');
assert.ok(playerSquadHtml.includes('👥 Companheiro'), 'Badge de companheiro presente nos demais atletas');
console.log('✅ squadPage isolamento de permissões e resumo validados com sucesso!');

// Teste 4: seasonPage diferenciação de Expectativa da Diretoria
console.log('4. Testando seasonPage()...');
global.getStateCompData = () => ({
  id: 'bra-est-df-candango',
  name: 'Campeonato Candango',
  teams: ['DF Esporte Clube', 'Gama', 'Brasiliense'],
  fixtures: []
});
global.ensureCompetitionFixturesIntegrity = () => {};
global.computeStandingsFromFixtures = (teams) => teams.map((t, idx) => ({ name: t, p: 3 - idx, j: 1, v: 1, e: 0, d: 0, gp: 2, gc: 1, sg: 1, pct: 100, form: ['V'], trend: '▲' }));
global.getStateCompStats = () => ({ scorers: [], assists: [], mvp: [], cards: [] });

eval(extractFunctionCode(gameCode, 'seasonPage'));

// Treinador
global.state = { ...mState, club: 'DF Esporte Clube' };
const managerSeasonHtml = seasonPage();
assert.ok(managerSeasonHtml.includes('EXPECTATIVA DA DIRETORIA'), 'Expectativa da diretoria presente no modo técnico');
assert.ok(managerSeasonHtml.includes('⚡ Ir para Meu Time & Tática'), 'Botão Ir para Tática presente no modo técnico');

// Jogador
global.state = pState;
const playerSeasonHtml = seasonPage();
assert.ok(!playerSeasonHtml.includes('⚡ Ir para Meu Time & Tática'), 'Botão Ir para Tática NÃO pode aparecer no modo atleta');
assert.ok(playerSeasonHtml.includes('MEU CLUBE NA COMPETIÇÃO'), 'Exibe Meu Clube na Competição no modo atleta');
console.log('✅ seasonPage diferenciação validada com sucesso!');

console.log('\n🎉 TODOS OS TESTES DE ISOLAMENTO DE MODOS E ABAS COMPARTILHADAS PASSARAM COM 100% DE SUCESSO!');
