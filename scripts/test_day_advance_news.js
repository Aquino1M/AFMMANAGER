/**
 * Test Suite: AFM 2027 Day Advance News Feed & Post-Match Hub
 */
const assert = require('assert');
const fs = require('fs');

console.log('--- TEST 1: Verificar Carregamento do Módulo day_advance_news_modal.js ---');
const globalWindow = {
  norm: (s) => String(s || '').toLowerCase()
};
global.window = globalWindow;

require('../js/systems/day_advance_news_modal.js');
const AFM_DayAdvanceNews = globalWindow.AFM_DayAdvanceNews;
assert.ok(AFM_DayAdvanceNews, 'AFM_DayAdvanceNews deve estar definido');
assert.strictEqual(typeof AFM_DayAdvanceNews.formatHeadingDate, 'function');
assert.strictEqual(typeof AFM_DayAdvanceNews.generateNewsForDay, 'function');
assert.strictEqual(typeof AFM_DayAdvanceNews.openDayAdvanceModal, 'function');
assert.strictEqual(typeof AFM_DayAdvanceNews.openPostMatchHubModal, 'function');
assert.strictEqual(typeof AFM_DayAdvanceNews.openAdvanceDaysFromMatch, 'function');
console.log('  ✓ AFM_DayAdvanceNews carregado com todos os métodos essenciais');

console.log('\n--- TEST 2: Testar Formatação de Cabeçalho de Data (Fiel ao Screenshot) ---');
const dateQui = new Date(2026, 0, 29, 12, 0, 0); // 29 de janeiro de 2026 (Quinta-feira)
const strQui = AFM_DayAdvanceNews.formatHeadingDate(dateQui);
assert.strictEqual(strQui, 'QUI, 29 JAN 2026', `Esperado QUI, 29 JAN 2026, obtido: ${strQui}`);
console.log('  ✓ Formatação 29 Jan:', strQui);

const dateSab = new Date(2026, 0, 31, 12, 0, 0); // 31 de janeiro de 2026 (Sábado)
const strSab = AFM_DayAdvanceNews.formatHeadingDate(dateSab);
assert.strictEqual(strSab, 'SÁB, 31 JAN 2026', `Esperado SÁB, 31 JAN 2026, obtido: ${strSab}`);
console.log('  ✓ Formatação 31 Jan:', strSab);

console.log('\n--- TEST 3: Testar Geração de Notícias de Mercado e Ocorrências ---');
const mockState = { club: 'Criciúma' };
const newsDiaSemJogo = AFM_DayAdvanceNews.generateNewsForDay(dateQui, mockState, false, null);
assert.ok(Array.isArray(newsDiaSemJogo) && newsDiaSemJogo.length >= 1, 'Deve gerar notícias');
const hasDeal = newsDiaSemJogo.some(n => n.type === 'deal');
assert.ok(hasDeal, 'Deve conter pelo menos um negócio de mercado fechado');
console.log('  ✓ Notícias de dia sem jogo geradas:', newsDiaSemJogo.length, 'itens');
newsDiaSemJogo.forEach(n => console.log('    •', n.text));

console.log('\n--- TEST 4: Testar Alerta HOJE TEM JOGO em Dia de Partida ---');
const matchFix = { home: 'Samambaia', away: 'Real Brasília' };
const newsDiaJogo = AFM_DayAdvanceNews.generateNewsForDay(dateSab, mockState, true, matchFix);
const matchItem = newsDiaJogo.find(n => n.type === 'match');
assert.ok(matchItem, 'Deve conter o item do jogo do dia');
assert.strictEqual(matchItem.text, 'HOJE TEM JOGO · SAMAMBAIA X REAL BRASÍLIA');
console.log('  ✓ Item de destaque do dia do jogo:', matchItem.text);

console.log('\n--- TEST 5: Verificar conexões em js/game.js e index.html ---');
const gameJs = fs.readFileSync('js/game.js', 'utf8');
assert.ok(gameJs.includes('function triggerPostMatchFlow'), 'js/game.js deve definir triggerPostMatchFlow');
assert.ok(gameJs.includes('triggerPostMatchFlow(userRes)'), 'js/game.js deve acionar triggerPostMatchFlow');

const calJs = fs.readFileSync('js/core/calendar_and_day_advance_fix.js', 'utf8');
assert.ok(calJs.includes('AFM_DayAdvanceNews.openDayAdvanceModal'), 'calendar_and_day_advance_fix.js deve integrar o pop de avanço');

const indexHtml = fs.readFileSync('index.html', 'utf8');
assert.ok(indexHtml.includes('js/systems/day_advance_news_modal.js'), 'index.html deve registrar day_advance_news_modal.js');
console.log('  ✓ Todas as conexões em js/game.js, calendar_and_day_advance_fix.js e index.html validadas');

console.log('\n========================================');
console.log('TODOS OS 5 TESTES DE NOTÍCIAS E AVANÇO PASSARAM COM 100% DE SUCESSO!');
console.log('========================================');
