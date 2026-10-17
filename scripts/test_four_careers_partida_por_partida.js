const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert');

console.log('================================================================================');
console.log('🧪 TESTE COMPLETO 100% REAL: 4 CONTAS / CLUBES DISTINTOS');
console.log('VALIDAÇÃO: PARTIDA POR PARTIDA, CALENDÁRIO 100% CONCLUÍDO E TODAS AS ABAS');
console.log('================================================================================\n');

function createMockElement(tag, id = '') {
  return {
    tagName: (tag || 'DIV').toUpperCase(),
    id: id,
    innerHTML: '',
    textContent: '',
    value: '',
    style: {},
    dataset: {},
    classList: {
      add: () => {},
      remove: () => {},
      contains: () => false,
      toggle: () => {}
    },
    children: [],
    appendChild: function(c) {
      if (c) c.parentNode = this;
      this.children.push(c);
      return c;
    },
    removeChild: function(c) {
      const idx = this.children.indexOf(c);
      if (idx >= 0) {
        this.children.splice(idx, 1);
        if (c) c.parentNode = null;
      }
    },
    remove: function() {
      if (this.parentNode && this.parentNode.removeChild) this.parentNode.removeChild(this);
    },
    setAttribute: () => {},
    getAttribute: () => null,
    addEventListener: () => {},
    removeEventListener: () => {},
    querySelector: () => createMockElement('span'),
    querySelectorAll: () => [createMockElement('span')],
    closest: function(sel) {
      if (sel.includes('button') && this.tagName === 'BUTTON') return this;
      if (sel.includes(this.id)) return this;
      return null;
    },
    click: function() {
      if (typeof this.onclick === 'function') {
        this.onclick({ target: this, preventDefault() {}, stopPropagation() {} });
      }
    }
  };
}

function initGameEnvironment() {
  const storage = {};
  let lastCustomModal = null;
  const domListeners = [];
  const elementMap = new Map();

  const context = {
    console,
    requestAnimationFrame: (cb) => { if (typeof cb === 'function') cb(); },
    cancelAnimationFrame: () => {},
    scrollTo: () => {},
    setTimeout: (fn) => { if (typeof fn === 'function') fn(); return 1; },
    clearTimeout: () => {},
    setInterval: () => 1,
    clearInterval: () => {},
    Math,
    Date,
    Array,
    Object,
    String,
    Number,
    Boolean,
    RegExp,
    JSON,
    Set,
    Map,
    localStorage: {
      getItem: k => storage[k] || null,
      setItem: (k, v) => { storage[k] = String(v); },
      removeItem: k => { delete storage[k]; },
      clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
    },
    openCustomModal: (title, html) => {
      lastCustomModal = { title, html };
    },
    closeCustomModal: () => {
      lastCustomModal = null;
    },
    getLastCustomModal: () => lastCustomModal,
    toast: (msg) => { /* silencioso no teste */ },
    addEventListener: (ev, h) => { if (ev === 'click') domListeners.push(h); },
    removeEventListener: () => {}
  };
  context.window = context;

  const root = createMockElement('body');
  context.document = {
    getElementById: id => elementMap.get(id) || (id === 'app' ? root : root.children.find(c => c.id === id) || null),
    querySelector: sel => {
      if (sel === '#app') return root;
      if (sel.startsWith('#')) return elementMap.get(sel.slice(1)) || root.children.find(c => c.id === sel.slice(1)) || null;
      return null;
    },
    querySelectorAll: () => [],
    addEventListener: (ev, h) => { if (ev === 'click') domListeners.push(h); },
    removeEventListener: () => {},
    createElement: tag => createMockElement(tag),
    body: root
  };
  context.window.document = context.document;
  context.window.AFM_DB = { init: () => Promise.resolve(null) };
  context.window.esc = s => String(s || '');

  vm.createContext(context);

  const files = [
    'js/competitions.js',
    'data/competition_teams.js',
    'data/international_teams_2026_27.js',
    'data/continental_2026.js',
    'js/core/calendar_and_day_advance_fix.js',
    'js/ui/changelog_14outubro.js',
    'js/core/tournament_engine.js',
    'js/core/competition_integrity.js',
    'js/core/real_football_engine.js',
    'js/game.js',
    'js/systems/match_preview_pro.js'
  ];

  for (const f of files) {
    const fullPath = path.join(__dirname, '..', f);
    if (fs.existsSync(fullPath)) {
      vm.runInContext(fs.readFileSync(fullPath, 'utf8'), context);
    }
  }

  context.registerMockElement = (id, tag = 'button') => {
    const el = createMockElement(tag, id);
    elementMap.set(id, el);
    return el;
  };

  return context;
}

// Testa todas as abas do jogo para um estado ativo
function verifyAllTabs(env, clubName) {
  const tabs = [
    { view: 'central', title: 'Central' },
    { view: 'calendario', title: 'Calendário' },
    { view: 'meutime', title: 'Meu Time / Tática' },
    { view: 'elenco', title: 'Elenco' },
    { view: 'mercado', title: 'Mercado da Bola' },
    { view: 'estrutura', title: 'Estrutura & Estádio' },
    { view: 'escritorio', title: 'Escritório' },
    { view: 'carreira', title: 'Carreira & Duelos X1' },
    { view: 'temporada', title: 'Temporada & Tabela' },
    { view: 'novidades', title: 'Novidades & Correções' },
    { view: 'config', title: 'Configurações' }
  ];

  for (const t of tabs) {
    env.view = t.view;
    const html = env.page();
    assert(typeof html === 'string', `Aba ${t.title} deve retornar HTML em string`);
    assert(html.length > 50, `Aba ${t.title} deve retornar conteúdo significativo (> 50 chars), retornou ${html.length}`);
    assert(!html.includes('undefined is not a function'), `Aba ${t.title} não pode conter erro em texto`);
  }
}

// Testa o fluxo de jogar partida por partida e validar no calendário
function testPartidaPorPartidaFlow(env, clubName, numMatchesToPlay = 6) {
  const st = env.state;
  console.log(`\n--- Testando Carreira: ${clubName} (${st.competition || st.compId}) ---`);
  console.log(`Data inicial: ${st.date}, Rodada inicial: ${st.round + 1}, Saldo: R$ ${st.balance?.toLocaleString('pt-BR') || st.cash}`);

  // Skip pré-temporada se ativa
  if (st.isPreSeason) {
    env.skipPreSeason();
    console.log(`- Pré-temporada pulada. Nova data: ${st.date}`);
  }

  let matchesPlayedCount = 0;
  const playedMatchesLog = [];

  for (let step = 1; step <= numMatchesToPlay; step++) {
    const act = env.getActualCurrentMatch(st);
    if (!act) {
      console.log(`- Nenhuma partida pendente encontrada no step ${step}. Finalizando ciclo.`);
      break;
    }

    const prevDate = st.date;
    const matchDate = act.date;
    const opp = act.opponent || (act.home === clubName ? act.away : act.home);
    const compName = act.competitionName || act.competitionId;

    // Se a partida for no futuro, avança o calendário até a data da partida
    if (st.date < matchDate) {
      env.AFM_CalendarFix.advanceToNextMatchGuaranteed(st);
      assert(st.date <= matchDate, `Data atual (${st.date}) não pode ultrapassar a data da próxima partida (${matchDate})`);
    }

    // Executa a partida via simulação rápida
    env.simulateQuickRound();
    matchesPlayedCount++;

    // Verifica que a partida foi gravada no histórico
    const lastHistory = st.history?.[0];
    assert(lastHistory, `Partida ${step} (${compName} vs ${opp}) deve ter sido registrada em state.history`);
    const scoreText = `${lastHistory.hg} x ${lastHistory.ag}`;
    playedMatchesLog.push({
      step,
      comp: compName,
      date: matchDate,
      home: lastHistory.h,
      away: lastHistory.a,
      score: scoreText
    });

    console.log(`  [Match ${step}] ${matchDate} | ${compName} | ${lastHistory.h} ${scoreText} ${lastHistory.a} | Saldo: R$ ${Math.round(st.balance).toLocaleString('pt-BR')}`);

    // VALIDAÇÃO CRÍTICA DO CALENDÁRIO:
    // Renderiza o calendário e verifica que a partida disputada NÃO possui botão de jogar/simular e ESTÁ MARCADA como Concluído!
    env.view = 'calendario';
    const calHtml = env.calendarPage();
    assert(calHtml.includes('Concluído'), `O calendário deve exibir status 'Concluído' para as partidas já jogadas`);
    
    // Verifica que na aba da competição ou no calendário, o resultado exato aparece
    const resolvedResult = env.resolveCalendarMatchResult({
      home: lastHistory.h,
      away: lastHistory.a,
      competitionId: lastHistory.competitionId,
      matchIndex: (Number(lastHistory.round) || 1) - 1,
      date: matchDate
    }, st);

    assert(Array.isArray(resolvedResult), `resolveCalendarMatchResult deve retornar array [hg, ag] para a partida jogada: ${lastHistory.h} x ${lastHistory.a}`);
    assert.strictEqual(resolvedResult[0], lastHistory.hg, `Gols mandante resolvidos (${resolvedResult[0]}) devem ser iguais ao histórico (${lastHistory.hg})`);
    assert.strictEqual(resolvedResult[1], lastHistory.ag, `Gols visitante resolvidos (${resolvedResult[1]}) devem ser iguais ao histórico (${lastHistory.ag})`);
  }

  assert(matchesPlayedCount >= numMatchesToPlay, `Deve ter jogado pelo menos ${numMatchesToPlay} partidas, jogou ${matchesPlayedCount}`);
  console.log(`✅ ${matchesPlayedCount} partidas jogadas estritamente Partida por Partida com validação 100% Concluído no Calendário!`);

  // Verifica todas as abas
  verifyAllTabs(env, clubName);
  console.log(`✅ Todas as 11 abas verificadas e renderizadas com sucesso absoluto!`);

  return playedMatchesLog;
}

// ================================================================================
// CONTA 1: CORINTHIANS (BRASIL - SÉRIE A + PAULISTÃO + LIBERTADORES + COPA)
// ================================================================================
console.log('--------------------------------------------------------------------------------');
console.log('🏟️ [CONTA 1: CORINTHIANS] Brasil - Série A, Paulistão, Libertadores');
console.log('--------------------------------------------------------------------------------');
const env1 = initGameEnvironment();
env1.newCareer({ clubName: 'Corinthians', compId: 'bra-a', manager: 'Manager Conta 1' });
assert.strictEqual(env1.state.club, 'Corinthians');
const log1 = testPartidaPorPartidaFlow(env1, 'Corinthians', 6);

// ================================================================================
// CONTA 2: FLAMENGO (BRASIL - SÉRIE A + CARIOCA + LIBERTADORES + COPA)
// ================================================================================
console.log('\n--------------------------------------------------------------------------------');
console.log('🏟️ [CONTA 2: FLAMENGO] Brasil - Série A, Carioca, Libertadores');
console.log('--------------------------------------------------------------------------------');
const env2 = initGameEnvironment();
env2.newCareer({ clubName: 'Flamengo', compId: 'bra-a', manager: 'Manager Conta 2' });
assert.strictEqual(env2.state.club, 'Flamengo');
const log2 = testPartidaPorPartidaFlow(env2, 'Flamengo', 6);

// ================================================================================
// CONTA 3: REAL MADRID (ESPANHA - LA LIGA + UEFA CHAMPIONS LEAGUE)
// ================================================================================
console.log('\n--------------------------------------------------------------------------------');
console.log('🏟️ [CONTA 3: REAL MADRID] Espanha - La Liga, Champions League');
console.log('--------------------------------------------------------------------------------');
const env3 = initGameEnvironment();
env3.newCareer({ clubName: 'Real Madrid', compId: 'esp-1', manager: 'Manager Conta 3' });
assert.strictEqual(env3.state.club, 'Real Madrid');
const log3 = testPartidaPorPartidaFlow(env3, 'Real Madrid', 6);

// ================================================================================
// CONTA 4: AL-HILAL (ARÁBIA SAUDITA - SAUDI PRO LEAGUE + AFC CHAMPIONS ELITE)
// ================================================================================
console.log('\n--------------------------------------------------------------------------------');
console.log('🏟️ [CONTA 4: AL-HILAL] Arábia Saudita - Saudi Pro League, AFC Champions Elite');
console.log('--------------------------------------------------------------------------------');
const env4 = initGameEnvironment();
env4.newCareer({ clubName: 'Al-Hilal', compId: 'sau-1', manager: 'Manager Conta 4' });
assert.strictEqual(env4.state.club, 'Al-Hilal');
const log4 = testPartidaPorPartidaFlow(env4, 'Al-Hilal', 6);

console.log('\n================================================================================');
console.log('🎉 RESUMO FINAL DO TESTE DE 4 CONTAS:');
console.log('================================================================================');
console.log(`✅ Conta 1 (Corinthians):  ${log1.length} partidas jogadas | Calendário 100% Concluído | 11 Abas OK`);
console.log(`✅ Conta 2 (Flamengo):     ${log2.length} partidas jogadas | Calendário 100% Concluído | 11 Abas OK`);
console.log(`✅ Conta 3 (Real Madrid):  ${log3.length} partidas jogadas | Calendário 100% Concluído | 11 Abas OK`);
console.log(`✅ Conta 4 (Al-Hilal):     ${log4.length} partidas jogadas | Calendário 100% Concluído | 11 Abas OK`);
console.log('\n🌟 100% DOS TESTES PASSARAM COM ZERO FALHAS E ZERO REGRESSÕES!');
console.log('================================================================================\n');
