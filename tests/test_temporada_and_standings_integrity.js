const assert = require('assert');
const fs = require('fs');

console.log('🧪 Iniciando Testes Unitários de Integridade da Aba Temporada & Classificação...');

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
global.formatDatePtBr = isoStr => {
  if (!isoStr) return '';
  const parts = String(isoStr).split('-');
  if (parts.length < 3) return isoStr;
  const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const m = Number(parts[1]) - 1;
  return `${parts[2]} de ${months[m]} de ${parts[0]}`;
};
global.clubByName = name => ({ name, stadium: `Estádio do ${name}` });
global.clubBadge = (name, size) => `<img src="badge_${name}.png" width="${size}" />`;
global.playerPhoto = (name, size) => `<img src="photo_${name}.png" width="${size}" />`;
global.save = () => {};
global.render = () => {};
global.$ = () => null;
global.$$ = () => [];

// Mock state
global.state = {
  season: 2026,
  club: 'DF Esporte Clube',
  compId: 'bra-est-df-candango',
  round: 0,
  teams: [
    { name: 'ARUC', p: 0, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0, form: [] },
    { name: 'Brasília', p: 0, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0, form: [] },
    { name: 'Brasiliense', p: 0, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0, form: [] },
    { name: 'Capital-DF', p: 0, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0, form: [] },
    { name: 'Ceilândia', p: 0, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0, form: [] },
    { name: 'DF Esporte Clube', p: 0, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0, form: [] },
    { name: 'Gama', p: 0, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0, form: [] },
    { name: 'Paranoá', p: 0, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0, form: [] },
    { name: 'Real Brasília', p: 0, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0, form: [] },
    { name: 'Samambaia', p: 0, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0, form: [] }
  ],
  competitionTeams: {},
  competitionStats: {},
  estadualData: {}
};

// Extrair funções do game.js para teste isolado
const gameCode = fs.readFileSync('js/game.js', 'utf8');

// Test 1: ensureCompetitionFixturesIntegrity
console.log('1. Testando ensureCompetitionFixturesIntegrity...');
eval(gameCode.slice(gameCode.indexOf('function ensureCompetitionFixturesIntegrity('), gameCode.indexOf('window.ensureCompetitionFixturesIntegrity = ensureCompetitionFixturesIntegrity;')));

const corruptCandangoComp = {
  id: 'bra-est-df-candango',
  name: 'Campeonato Candango',
  teams: [
    'ARUC', 'Brasília', 'Brasiliense', 'Capital-DF', 'Ceilândia',
    'DF Esporte Clube', 'Gama', 'Paranoá', 'Real Brasília', 'Samambaia'
  ],
  fixtures: [
    { roundIndex: 0, home: 'ARUC', away: 'Sobradinho' }, // Time fantasma!
    { roundIndex: 0, home: 'Brasília', away: 'Samambaia' },
    { roundIndex: 0, home: 'Brasiliense', away: 'Real Brasília' },
    { roundIndex: 0, home: 'Capital-DF', away: 'Paranoá' },
    { roundIndex: 0, home: 'Ceilândia', away: 'Gama' }
    // DF Esporte Clube ausente!
  ]
};

ensureCompetitionFixturesIntegrity(corruptCandangoComp, 'DF Esporte Clube');

// Validações
const fixtures = corruptCandangoComp.fixtures;
assert.strictEqual(fixtures.length, 45, 'Devem existir exatamente 45 confrontos (9 rodadas de 5 jogos)');

const hasSobradinho = fixtures.some(f => norm(f.home) === 'sobradinho' || norm(f.away) === 'sobradinho');
assert.strictEqual(hasSobradinho, false, 'Sobradinho (fantasma) deve ser purgado dos confrontos');

const round1Fixtures = fixtures.filter(f => f.roundIndex === 0);
assert.strictEqual(round1Fixtures.length, 5, 'Rodada 1 deve conter exatamente 5 jogos');

const dfInRound1 = round1Fixtures.some(f => norm(f.home) === norm('DF Esporte Clube') || norm(f.away) === norm('DF Esporte Clube'));
assert.strictEqual(dfInRound1, true, 'DF Esporte Clube deve constar na 1ª Rodada');

// Verifica presença do usuário em todas as 9 rodadas
for (let r = 0; r < 9; r++) {
  const rFixtures = fixtures.filter(f => f.roundIndex === r);
  assert.strictEqual(rFixtures.length, 5, `Rodada ${r + 1} deve ter 5 jogos`);
  const hasUser = rFixtures.some(f => norm(f.home) === norm('DF Esporte Clube') || norm(f.away) === norm('DF Esporte Clube'));
  assert.strictEqual(hasUser, true, `DF Esporte Clube deve estar presente na Rodada ${r + 1}`);
}
assert.ok(corruptCandangoComp.roundDate.includes('17 DE JANEIRO DE 2026'), 'roundDate deve ser 17 de janeiro de 2026');
console.log('✅ ensureCompetitionFixturesIntegrity passou com 100% de sucesso!');

// Test 2: computeStandingsFromFixtures
console.log('2. Testando computeStandingsFromFixtures...');
eval(gameCode.slice(gameCode.indexOf('function computeStandingsFromFixtures('), gameCode.indexOf('window.computeStandingsFromFixtures = computeStandingsFromFixtures;')));

const mockTeams = ['DF Esporte Clube', 'Gama', 'Brasiliense'];
const mockFixtures = [
  { home: 'DF Esporte Clube', away: 'Brasiliense', result: [3, 0], played: true },
  { home: 'Gama', away: 'DF Esporte Clube', result: [2, 1], played: true },
  { home: 'Brasiliense', away: 'Gama', result: [1, 1], played: true }
];

const standingsGeral = computeStandingsFromFixtures(mockTeams, mockFixtures, 'geral');
assert.strictEqual(standingsGeral[0].name, 'Gama', 'Gama deve liderar com 4 pontos (1V 1E)');
assert.strictEqual(standingsGeral[0].p, 4);
assert.strictEqual(standingsGeral[1].name, 'DF Esporte Clube', 'DF Esporte Clube deve ser o 2º com 3 pontos');
assert.strictEqual(standingsGeral[1].p, 3);
assert.strictEqual(standingsGeral[2].name, 'Brasiliense', 'Brasiliense deve ser o 3º com 1 ponto');
assert.strictEqual(standingsGeral[2].p, 1);

const standingsHome = computeStandingsFromFixtures(mockTeams, mockFixtures, 'mandante');
const dfHome = standingsHome.find(t => t.name === 'DF Esporte Clube');
assert.strictEqual(dfHome.p, 3, 'DF Esporte Clube tem 3 pontos como mandante');
assert.strictEqual(dfHome.j, 1, 'DF Esporte Clube jogou 1 partida como mandante');

const standingsAway = computeStandingsFromFixtures(mockTeams, mockFixtures, 'visitante');
const dfAway = standingsAway.find(t => t.name === 'DF Esporte Clube');
assert.strictEqual(dfAway.p, 0, 'DF Esporte Clube tem 0 pontos como visitante');
assert.strictEqual(dfAway.j, 1, 'DF Esporte Clube jogou 1 partida como visitante');
console.log('✅ computeStandingsFromFixtures passou com 100% de sucesso!');

// Test 3: openFullStatsModal
console.log('3. Testando openFullStatsModal...');
let openedModalTitle = null;
global.openCustomModal = (title, bodyHtml, onConfirm, confirmText, showActions, maxWidth) => {
  openedModalTitle = title;
  assert.ok(bodyHtml.includes('Atleta & Clube'), 'Corpo do modal deve conter cabeçalho');
};

eval(gameCode.slice(gameCode.indexOf('function openFullStatsModal('), gameCode.indexOf('window.openFullStatsModal = openFullStatsModal;')));

state.competitionStats['bra-est-df-candango'] = {
  season: 2026,
  scorers: [
    { name: 'Pedrinho', club: 'DF Esporte Clube', goals: 5, pos: 'ATA' },
    { name: 'Nunes', club: 'Gama', goals: 4, pos: 'ATA' }
  ],
  assists: [
    { name: 'Meia Craque', club: 'Capital-DF', assists: 3, pos: 'MEI' }
  ]
};

openFullStatsModal('artilharia', 'Campeonato Candango', 'bra-est-df-candango');
assert.ok(openedModalTitle.includes('Top 30 Artilheiros'), 'Título de artilharia correto');

openFullStatsModal('assistencias', 'Campeonato Candango', 'bra-est-df-candango');
assert.ok(openedModalTitle.includes('Top 30 Garçons'), 'Título de assistências correto');

openFullStatsModal('mvp', 'Campeonato Candango', 'bra-est-df-candango');
assert.ok(openedModalTitle.includes('Top 30 Craques (MVP)'), 'Título de MVP correto');

openFullStatsModal('cartoes', 'Campeonato Candango', 'bra-est-df-candango');
assert.ok(openedModalTitle.includes('Disciplina & Cartões'), 'Título de cartões correto');
console.log('✅ openFullStatsModal passou com 100% de sucesso!');

console.log('\n🎉 TODOS OS TESTES DE INTEGRIDADE DA ABA TEMPORADA PASSARAM COM SUCESSO!');
