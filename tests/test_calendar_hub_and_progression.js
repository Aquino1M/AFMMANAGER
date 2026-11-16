const assert = require('assert');
const fs = require('fs');

console.log('--- TEST SUITE: AFM_CALENDAR_HUB & CHRONOLOGICAL CALENDAR ---');

// Mock browser environment
global.window = global;
global.document = {
  getElementById: () => null,
  createElement: (tag) => ({
    id: '',
    style: {},
    innerHTML: '',
    querySelector: () => ({ onclick: null }),
    querySelectorAll: () => [],
    appendChild: () => {},
    remove: () => {}
  }),
  body: {
    appendChild: () => {}
  }
};
global.$ = () => null;
global.$$ = () => [];
global.norm = (s) => String(s || '').toLowerCase().trim();
global.esc = (s) => String(s || '');
global.formatDatePtBr = (d) => d;
global.teamStrengthByName = () => 65;
global.clubBadge = (name, size) => `<img alt="${name}">`;

// Load game.js calendar section or hub directly
const gameCode = fs.readFileSync('js/game.js', 'utf8');

// Verify syntax of game.js
console.log('1. Verificando integridade sintática de js/game.js...');
assert.doesNotThrow(() => {
  require('../js/game.js');
}, 'js/game.js deve carregar sem erros');
console.log('   ✓ js/game.js carregado com sucesso!');

// Test 1: Janela de Transferências (Verão: 01/Jan a 31/Mar, 90 dias)
console.log('2. Testando cálculo preciso das janelas de transferência...');
const hub = window.AFM_CALENDAR_HUB;
assert.ok(hub, 'window.AFM_CALENDAR_HUB deve estar definido');

const summerDay1 = hub.getTransferWindowStatus('2026-01-01');
assert.strictEqual(summerDay1.open, true, 'Janela deve estar aberta em 01/01');
assert.strictEqual(summerDay1.currentDay, 1, '01/01 deve ser Dia 1');
assert.strictEqual(summerDay1.totalDays, 90, 'Janela de Verão deve ter 90 dias');
assert.strictEqual(summerDay1.daysRemaining, 89, 'Devem restar 89 dias');
assert.ok(summerDay1.text.includes('Dia 1 de 90'), `Texto deve conter "Dia 1 de 90", recebeu: ${summerDay1.text}`);

const summerDay46 = hub.getTransferWindowStatus('2026-02-15');
assert.strictEqual(summerDay46.open, true, 'Janela deve estar aberta em 15/02');
assert.strictEqual(summerDay46.currentDay, 46, '15/02 deve ser Dia 46');
assert.strictEqual(summerDay46.totalDays, 90);

const summerEnd = hub.getTransferWindowStatus('2026-03-31');
assert.strictEqual(summerEnd.open, true, 'Janela deve estar aberta em 31/03');
assert.strictEqual(summerEnd.daysRemaining, 0, 'No último dia devem restar 0 dias');

// Test 2: Janela Fechada (Abril a Julho)
const closedSpring = hub.getTransferWindowStatus('2026-05-10');
assert.strictEqual(closedSpring.open, false, 'Janela deve estar fechada em 10/05');
assert.ok(closedSpring.text.includes('10/07/2026'), 'Deve informar reabertura em 10/07/2026');

// Test 3: Janela de Inverno (10/Jul a 02/Set, 55 dias)
const winterDay1 = hub.getTransferWindowStatus('2026-07-10');
assert.strictEqual(winterDay1.open, true, 'Janela de inverno deve abrir em 10/07');
assert.strictEqual(winterDay1.currentDay, 1, '10/07 deve ser Dia 1');
assert.strictEqual(winterDay1.totalDays, 55, 'Janela de Inverno deve ter 55 dias');

const winterEnd = hub.getTransferWindowStatus('2026-09-02');
assert.strictEqual(winterEnd.open, true, 'Janela de inverno deve estar aberta em 02/09');
assert.strictEqual(winterEnd.daysRemaining, 0, '02/09 deve ser o último dia da janela de inverno');

const closedAutumn = hub.getTransferWindowStatus('2026-10-15');
assert.strictEqual(closedAutumn.open, false, 'Janela deve estar fechada em 10/10');
assert.ok(closedAutumn.text.includes('01/01/2027'), 'Deve informar reabertura em 01/01/2027');

console.log('   ✓ Cálculos de datas e dias de janelas aprovados!');

// Test 4: Detector de Clássicos & Derbies
console.log('3. Testando detector de clássicos regionais e nacionais...');
assert.strictEqual(hub.isDerbyMatch('Gama', 'Brasiliense'), true, 'Gama vs Brasiliense é clássico candango');
assert.strictEqual(hub.isDerbyMatch('Ceilândia', 'Brasiliense'), true, 'Ceilândia vs Brasiliense é clássico candango');
assert.strictEqual(hub.isDerbyMatch('Flamengo', 'Fluminense'), true, 'Fla-Flu é clássico');
assert.strictEqual(hub.isDerbyMatch('Corinthians', 'Palmeiras'), true, 'Derby paulista');
assert.strictEqual(hub.isDerbyMatch('Grêmio', 'Internacional'), true, 'Gre-Nal');
assert.strictEqual(hub.isDerbyMatch('Gama', 'Real Madrid'), false, 'Não é clássico');
console.log('   ✓ Detecção de clássicos aprovada!');

// Test 5: Fallback de Escudos
console.log('4. Testando fallback SVG anti-404 para escudos...');
const uri = hub.buildCrestFallbackUri('GAM', 'Gama');
assert.ok(uri.startsWith('data:image/svg+xml'), 'Deve gerar Data URI');
assert.ok(uri.includes('GAM'), 'Deve conter a sigla informada');
console.log('   ✓ Fallback de escudos aprovado!');

// Test 6: Resumo da Temporada (Estatísticas do Calendário)
console.log('5. Testando agregação de estatísticas da temporada...');
const mockMatches = [
  { home: 'Gama', away: 'Samambaia', date: '2026-01-17', result: [2, 0] },
  { home: 'Real Brasília', away: 'Gama', date: '2026-01-19', result: [1, 2] },
  { home: 'Gama', away: 'Brasiliense', date: '2026-01-22', result: [1, 1] },
  { home: 'Ceilândia', away: 'Gama', date: '2026-01-24', result: null }
];
const summary = hub.computeSeasonSummary(mockMatches, 'Gama', {});
assert.strictEqual(summary.total, 4, 'Total de partidas deve ser 4');
assert.strictEqual(summary.played, 3, 'Disputadas deve ser 3');
assert.strictEqual(summary.wins, 2, 'Vitórias deve ser 2');
assert.strictEqual(summary.draws, 1, 'Empates deve ser 1');
assert.strictEqual(summary.losses, 0, 'Derrotas deve ser 0');
assert.strictEqual(summary.points, 7, 'Pontos somados deve ser 7 (2*3 + 1)');
assert.strictEqual(summary.winRate, 78, 'Aproveitamento 7/9 = 78%');
assert.ok(summary.streakText.includes('1E') || summary.streakText.includes('2V'), 'Sequência atual calculada');
console.log('   ✓ Agregação estatística aprovada!');

// Test 7: Modais de Prévia e Súmula registrados no escopo global
console.log('6. Verificando registro global dos modais do calendário...');
assert.strictEqual(typeof window.openMatchPreviewModal, 'function', 'openMatchPreviewModal deve ser função global');
assert.strictEqual(typeof window.openMatchSummaryModal, 'function', 'openMatchSummaryModal deve ser função global');
console.log('   ✓ Modais registrados globalmente!');

console.log('--- TODOS OS TESTES DO CALENDÁRIO PASSARAM COM SUCESSO! ---');
