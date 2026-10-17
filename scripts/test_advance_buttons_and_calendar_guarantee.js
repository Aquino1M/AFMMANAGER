const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('--- INICIANDO TESTE CRÍTICO DOS BOTÕES DE AVANÇO E CALENDÁRIO ---');

// Mock DOM e browser environment
const domListeners = [];
const elementMap = new Map();

function createMockElement(id, textContent = '') {
  const el = {
    id,
    textContent,
    dataset: {},
    style: {},
    onclick: null,
    closest(selector) {
      if (selector.includes('button') || selector.includes(id)) return el;
      return null;
    },
    click() {
      if (typeof this.onclick === 'function') {
        this.onclick({ target: this, preventDefault() {}, stopPropagation() {} });
      }
      // Simula evento disparado no document
      domListeners.forEach(listener => {
        listener({ target: el, preventDefault() {}, stopPropagation() {} });
      });
    }
  };
  elementMap.set(id, el);
  return el;
}

global.document = {
  getElementById: (id) => elementMap.get(id) || null,
  querySelectorAll: (selector) => [],
  addEventListener: (event, handler) => {
    if (event === 'click') domListeners.push(handler);
  }
};
global.window = global;
global.window.addEventListener = (event, handler) => {};
global.toast = (msg) => { /* console.log('TOAST:', msg); */ };

// Carrega os módulos
const calendarFixCode = fs.readFileSync(path.join(__dirname, '../js/core/calendar_and_day_advance_fix.js'), 'utf8');
eval(calendarFixCode);

// Mock básico de estado do jogo
global.state = {
  club: 'Ceará',
  date: '2026-01-11',
  currentDate: '2026-01-11',
  currentDateFormatted: '11 de janeiro de 2026',
  season: 2026,
  round: 0,
  schedule: [
    [['Ceará', 'Fortaleza']],
    [['Ceará', 'Ferroviário']]
  ],
  isPreSeason: true,
  preSeasonDays: 4,
  transferWindowActive: true,
  transferWindowDay: 1,
  transferWindowHour: 0,
  squad: [
    { name: 'Jogador 1', stamina: 80, energy: 80 },
    { name: 'Jogador 2', stamina: 85, energy: 85 }
  ]
};

global.save = () => {};
global.render = () => {};
global.formatDatePtBr = (d) => d;
global.getDateForRound = (r, s) => '2026-01-18';
global.getActualCurrentMatch = () => ({ date: '2026-01-18', home: 'Ceará', away: 'Fortaleza', isHome: true });
global.getTransferWindowState = () => {
  if (!state.transferWindowActive) return { active: false };
  const day = Number(state.transferWindowDay) || 1;
  const hour = Number(state.transferWindowHour) || 0;
  const isDeadlineDay = day === 4;
  return {
    active: true,
    day,
    maxDays: 4,
    hour,
    isDeadlineDay,
    text: isDeadlineDay ? `Deadline Day (${hour}:00)` : `Dia ${day} de 4`
  };
};

// Extrai as funções do game.js para teste isolado
const gameJsCode = fs.readFileSync(path.join(__dirname, '../js/game.js'), 'utf8');

// Testa se advanceTransferWindow existe e está declarada no código
assert(gameJsCode.includes('function advanceTransferWindow('), 'CRÍTICO: advanceTransferWindow(step) deve estar declarada');
assert(gameJsCode.includes('window.advanceTransferWindow = advanceTransferWindow'), 'CRÍTICO: window.advanceTransferWindow deve ser exportada');
assert(gameJsCode.includes('window.advanceTransferWindowDay = advanceTransferWindowDay'), 'CRÍTICO: advanceTransferWindowDay deve ser exportada');
assert(gameJsCode.includes('window.advanceTransferWindowHours = advanceTransferWindowHours'), 'CRÍTICO: advanceTransferWindowHours deve ser exportada');
assert(gameJsCode.includes('window.skipPreSeason = skipPreSeason'), 'CRÍTICO: skipPreSeason deve ser exportada');

// Avalia advanceTransferWindow, advanceTransferWindowDay, advanceTransferWindowHours, skipPreSeason
const funcRegex = /function advanceTransferWindowDay\(\)[\s\S]*?window\.skipPreSeason = skipPreSeason;\s*\}/;
const matchFuncs = gameJsCode.match(funcRegex);
assert(matchFuncs, 'Funções de avanço de janela devem ser localizadas');
eval(matchFuncs[0]);

// Inicializa CalendarFix
global.AFM_CalendarFix.bindGlobalAdvanceAndTableClicks();

console.log('✅ Validação estrutural do código passou!');

// TESTE 1: Avançar Dia 1 -> Dia 2 via botão superior (btnAdvanceTransferWindowDay)
const btnBannerDay = createMockElement('btnAdvanceTransferWindowDay', '⏩ Avançar Dia (1 de 4)');
btnBannerDay.onclick = () => {
  if (btnBannerDay.dataset.handlingClick) return;
  btnBannerDay.dataset.handlingClick = '1';
  setTimeout(() => { delete btnBannerDay.dataset.handlingClick; }, 200);
  advanceTransferWindow(24);
};

btnBannerDay.click();
assert.strictEqual(state.transferWindowDay, 2, 'Dia deve ter avançado para 2 pelo botão superior');
assert.strictEqual(state.date, '2026-01-12', 'Data deve ter avançado 1 dia');
console.log('✅ TESTE 1 PASSOU: btnAdvanceTransferWindowDay avançou Dia 1 -> Dia 2');

// TESTE 2: Avançar Dia 2 -> Dia 3 via botão do card (btnAdvanceTransferWindowDayCard)
const btnCardDay = createMockElement('btnAdvanceTransferWindowDayCard', '⏩ AVANÇAR DIA (2 DE 4)');
btnCardDay.onclick = () => {
  if (btnCardDay.dataset.handlingClick) return;
  btnCardDay.dataset.handlingClick = '1';
  setTimeout(() => { delete btnCardDay.dataset.handlingClick; }, 200);
  advanceTransferWindow(24);
};

btnCardDay.click();
assert.strictEqual(state.transferWindowDay, 3, 'Dia deve ter avançado para 3 pelo botão do card');
assert.strictEqual(state.date, '2026-01-13', 'Data deve ter avançado para 2026-01-13');
console.log('✅ TESTE 2 PASSOU: btnAdvanceTransferWindowDayCard avançou Dia 2 -> Dia 3');

// TESTE 3: Avançar Dia 3 -> Dia 4 (Deadline Day)
delete btnBannerDay.dataset.handlingClick;
btnBannerDay.click();
assert.strictEqual(state.transferWindowDay, 4, 'Dia deve ser 4 (Deadline Day)');
assert.strictEqual(state.transferWindowHour, 0, 'Horário inicial do Deadline Day deve ser 00:00');
const twState = getTransferWindowState();
assert.strictEqual(twState.isDeadlineDay, true, 'isDeadlineDay deve ser true no Dia 4');
console.log('✅ TESTE 3 PASSOU: Transição para Deadline Day (Dia 4, 00:00) concluída com sucesso');

// TESTE 4: Avançar horas no Deadline Day (00:00 -> 06:00 -> 12:00 -> 18:00 -> 24:00)
const btnCardHours = createMockElement('btnAdvanceTransferWindowHoursCard', '⏩ AVANÇAR 6 HORAS (00:00)');
btnCardHours.onclick = () => {
  if (btnCardHours.dataset.handlingClick) return;
  btnCardHours.dataset.handlingClick = '1';
  setTimeout(() => { delete btnCardHours.dataset.handlingClick; }, 200);
  advanceTransferWindow(6);
};

btnCardHours.click();
assert.strictEqual(state.transferWindowHour, 6, 'Horário deve ter avançado para 06:00');

const btnBannerHours = createMockElement('btnAdvanceTransferWindowHours', '⏩ Avançar 6 Horas (06:00)');
btnBannerHours.onclick = () => {
  if (btnBannerHours.dataset.handlingClick) return;
  btnBannerHours.dataset.handlingClick = '1';
  setTimeout(() => { delete btnBannerHours.dataset.handlingClick; }, 200);
  advanceTransferWindow(6);
};

btnBannerHours.click();
assert.strictEqual(state.transferWindowHour, 12, 'Horário deve ter avançado para 12:00');

delete btnCardHours.dataset.handlingClick;
btnCardHours.click(); // 18:00
assert.strictEqual(state.transferWindowHour, 18, 'Horário deve ter avançado para 18:00');

delete btnCardHours.dataset.handlingClick;
btnCardHours.click(); // 24:00 -> Fim da janela!
assert.strictEqual(state.transferWindowHour, 24, 'Horário deve ter chegado a 24:00');
assert.strictEqual(state.transferWindowActive, false, 'Janela deve ser desativada após 24:00');
assert.strictEqual(state.isPreSeason, false, 'Pré-temporada deve ser finalizada');
assert.strictEqual(state.date, '2026-01-18', 'Data deve ser alinhada para a partida oficial');
console.log('✅ TESTE 4 PASSOU: Ciclo completo do Deadline Day e encerramento da janela verificado!');

// TESTE 5: Pular Pré-Temporada / Janela (btnSkipPreSeason e btnSkipPreSeasonCard)
state.transferWindowActive = true;
state.isPreSeason = true;
state.transferWindowDay = 1;
state.transferWindowHour = 0;
state.date = '2026-01-11';

const btnSkip = createMockElement('btnSkipPreSeasonCard', '⏭️ PULAR JANELA');
btnSkip.onclick = () => {
  if (btnSkip.dataset.handlingClick) return;
  btnSkip.dataset.handlingClick = '1';
  setTimeout(() => { delete btnSkip.dataset.handlingClick; }, 200);
  skipPreSeason();
};
btnSkip.click();

assert.strictEqual(state.transferWindowActive, false, 'Pular janela deve desativar transferWindowActive');
assert.strictEqual(state.isPreSeason, false, 'Pular janela deve desativar isPreSeason');
assert.strictEqual(state.date, '2026-01-18', 'Pular janela deve definir data da partida');
console.log('✅ TESTE 5 PASSOU: Pular Janela encerra a pré-temporada e sincroniza o calendário');

// TESTE 6: Fallback Global Delegado (mesmo SEM onclick direto no elemento)
state.transferWindowActive = true;
state.transferWindowDay = 2;
state.transferWindowHour = 0;

const orphanBannerBtn = createMockElement('btnAdvanceTransferWindowDay', '⏩ Avançar Dia (2 de 4)');
orphanBannerBtn.onclick = null; // Sem onclick direto!
orphanBannerBtn.click(); // Deve ser interceptado pelo document listener do CalendarFix

assert.strictEqual(state.transferWindowDay, 3, 'O fallback global DEVE avançar o dia mesmo sem onclick direto no elemento');
console.log('✅ TESTE 6 PASSOU: Fallback global delegado funcionou perfeitamente para botão órfão!');

// TESTE 7: Avançar dias do calendário e parar no dia do jogo
state.transferWindowActive = false;
state.isPreSeason = false;
state.date = '2026-01-14';
global.canStartMatch = () => ({ canStart: false, matchDate: '2026-01-18' });

const btnAdvToMatch = createMockElement('btnAdvanceToMatchCentral', '⏩ AVANÇAR CALENDÁRIO ATÉ O DIA DO JOGO (18 de janeiro de 2026)');
btnAdvToMatch.onclick = () => global.AFM_CalendarFix.advanceToNextMatchGuaranteed(state);
btnAdvToMatch.click();

assert.strictEqual(state.date, '2026-01-18', 'advanceToNextMatchGuaranteed deve avançar exatamente até 2026-01-18');
console.log('✅ TESTE 7 PASSOU: Avançar até a partida funcionou e alinhou a data');

console.log('\n======================================================');
console.log('🎉 TODOS OS TESTES DOS BOTÕES DE AVANÇO PASSARAM COM SUCESSO!');
console.log('======================================================');
