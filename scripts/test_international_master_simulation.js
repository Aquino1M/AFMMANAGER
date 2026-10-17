const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert');

function createMockElement(tag) {
  return {
    tagName: (tag || 'DIV').toUpperCase(),
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
    appendChild: function(c) { this.children.push(c); return c; },
    removeChild: () => {},
    remove: () => {},
    setAttribute: () => {},
    getAttribute: () => null,
    addEventListener: () => {},
    removeEventListener: () => {},
    querySelector: () => createMockElement('span'),
    querySelectorAll: () => [createMockElement('span')],
    closest: () => null
  };
}

function initGameEnvironment() {
  const storage = {};
  let lastCustomModal = null;
  const context = {
    console,
    requestAnimationFrame: (cb) => { if (typeof cb === 'function') cb(); },
    scrollTo: () => {},
    setTimeout: (fn) => 1,
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
    getLastCustomModal: () => lastCustomModal
  };
  context.window = context;
  const root = createMockElement('body');
  context.document = {
    getElementById: id => createMockElement(id),
    querySelector: sel => createMockElement(sel),
    querySelectorAll: () => [],
    addEventListener: () => {},
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
    'js/core/tournament_engine.js',
    'js/core/competition_integrity.js',
    'js/game.js',
    'js/systems/match_preview_pro.js'
  ];

  for (const f of files) {
    const fullPath = path.join(__dirname, '..', f);
    vm.runInContext(fs.readFileSync(fullPath, 'utf8'), context);
  }

  return context;
}

console.log('========================================================================');
console.log('AFM 2026 - SIMULAÇÃO INTERNACIONAL COMPLETA: AMÉRICA DO SUL, EUROPA & ÁSIA');
console.log('========================================================================');

const results = [];

function runInternationalClubSimulation(clubName, compId, region, expectedCompetitions) {
  console.log(`\n>>> [INICIANDO] Simulação Completa para: ${clubName} (${compId}) [${region}] <<<`);
  const env = initGameEnvironment();
  env.newCareer({ clubName, compId, manager: 'Mister Aquino' });
  const s = env.state;
  if (s.isPreSeason) {
    s.isPreSeason = false;
    s.preSeasonDays = 0;
  }

  // 1. Test Match Preview Pro at season start (Match 1)
  console.log(`- Testando Prévia Oficial (Match Preview Pro) antes da 1ª partida...`);
  const firstMatch = env.getActualCurrentMatch(s);
  assert(firstMatch, 'Expected valid active match at start');
  env.openMatchPreviewModal();
  let modalData = env.getLastCustomModal();
  assert(modalData, 'Expected modal to open');
  assert(modalData.html.includes('Raio-X Setorial'), 'Expected sectorial analysis in modal');
  assert(modalData.html.includes('Forma Recente'), 'Expected recent form section in modal');
  console.log(`  ✓ Prévia abriu com sucesso: "${modalData.title}"`);

  // Verify initial calendar rendering
  const initialCal = env.calendarPage();
  assert(initialCal.includes('btnCalPreviewNow'), 'Calendar must have btnCalPreviewNow');
  assert(initialCal.includes('btnCalPlayNow') || initialCal.includes('btnCalTournamentPlay'), 'Calendar must have play button');
  assert(initialCal.includes('btnCalSimNow') || initialCal.includes('btnCalTournamentSim'), 'Calendar must have simulate button');
  assert(!initialCal.includes('Paulista'), 'International club MUST NOT have Campeonato Paulista in calendar!');
  console.log(`  ✓ Cards do Calendário possuem botões de Jogar, Simular e Prévia.`);
  console.log(`  ✓ Verificado: Calendário não possui estadual brasileiro indevido.`);

  // 2. Play all season matches
  let steps = 0;
  let matchesPlayed = 0;
  const competitionsMet = new Set();

  while (steps < 700) {
    steps++;
    const gate = env.canStartMatch(null, s);

    if (gate.status === 'season_finished') {
      console.log(`  ✓ Fim da temporada alcançado na data ${s.date}!`);
      break;
    }

    if (gate.status === 'future') {
      env.advanceCalendarDays(gate.daysDiff || 1, true);
      continue;
    }

    if (gate.status === 'other_competitions_pending') {
      const nextFixture = gate.nextFixture || env.getNextPendingClubFixture(s);
      if (nextFixture) {
        env.openNextPendingCompetitionFixture(nextFixture);
        continue;
      }
      break;
    }

    if (gate.status === 'playable') {
      const active = env.getActualCurrentMatch(s);
      if (active && active.competitionName) {
        competitionsMet.add(active.competitionName);
      }

      // Test preview on round 10 to verify updated match history and form
      if (matchesPlayed === 10) {
        env.openMatchPreviewModal();
        const midModal = env.getLastCustomModal();
        assert(midModal.html.includes('Aproveitamento'), 'Expected win rate / form stats in mid-season preview');
        console.log(`  ✓ Prévia na rodada 10 exibe histórico de jogos e forma recente atualizados!`);
      }

      const beforeHist = s.history.length;
      env.simulateQuickRound();
      assert(s.history.length > beforeHist, `simulateQuickRound failed to record match at ${s.date}`);
      matchesPlayed++;
      if (matchesPlayed % 15 === 0) {
        console.log(`  ... Progresso: ${matchesPlayed} partidas disputadas (Data: ${s.date})`);
      }
      continue;
    }

    env.advanceCalendarDays(1, true);
  }

  // 3. Verify final state and calendar cards
  console.log(`  ✓ Total de jogos disputados: ${matchesPlayed}`);
  assert(matchesPlayed >= 25, `Expected at least 25 matches played, got ${matchesPlayed}`);

  const finalCal = env.calendarPage();
  const completedMatches = (finalCal.match(/· Concluído<\/span>/g) || []).length;
  const remainingScheduled = (finalCal.match(/⏳ Agendado/g) || []).length;
  console.log(`  ✓ Total de cards no calendário: ${completedMatches + remainingScheduled}`);
  console.log(`  ✓ Cards Concluídos: ${completedMatches} (Agendados restantes: ${remainingScheduled})`);
  assert.strictEqual(remainingScheduled, 0, 'All calendar cards should be completed at end of season');

  // Verify expected competitions were met
  expectedCompetitions.forEach(exp => {
    const met = [...competitionsMet].some(c => c.toLowerCase().includes(exp.toLowerCase()));
    assert(met, `Expected club to compete in ${exp}`);
    console.log(`  ✓ Competição confirmada: ${exp}`);
  });

  // 4. Verify Advance Season Year (Virada de Temporada para 2027)
  console.log(`- Executando virada de temporada (advanceSeasonYear)...`);
  const success = env.advanceSeasonYear();
  assert(success, 'Expected advanceSeasonYear to return true');
  assert.strictEqual(s.season, 2027, 'Expected season to advance to 2027');
  console.log(`  ✓ Temporada virou com sucesso para 2027!`);
  
  const newCal = env.calendarPage();
  assert(newCal.includes('2027'), 'Expected new 2027 calendar to be generated');
  console.log(`  ✓ Novo calendário oficial para 2027 gerado e pronto para jogar!`);

  results.push({
    club: clubName,
    comp: compId,
    region,
    matchesPlayed,
    totalCards: completedMatches,
    competitions: [...competitionsMet],
    seasonTurnover: '2026 ➔ 2027 (Sucesso)'
  });
}

// 1. América do Sul: Boca Juniors (arg-1)
runInternationalClubSimulation('Boca Juniors', 'arg-1', 'América do Sul', ['Liga', 'Libertadores']);

// 2. Europa: Real Madrid (esp-1)
runInternationalClubSimulation('Real Madrid', 'esp-1', 'Europa', ['LaLiga', 'Champions']);

// 3. Ásia: Al-Hilal (ksa-1)
runInternationalClubSimulation('Al-Hilal', 'ksa-1', 'Ásia', ['Saudi', 'Mundial']);

console.log('\n========================================================================');
console.log('RESULTADOS DOS TESTES DE SIMULAÇÃO COMPLETA INTERNACIONAL:');
console.log('========================================================================');
results.forEach(r => {
  console.log(`\n• Clube: ${r.club} (${r.comp}) [${r.region}]`);
  console.log(`  - Partidas Disputadas: ${r.matchesPlayed}`);
  console.log(`  - Cards no Calendário: ${r.totalCards} (Concluídos: ${r.totalCards}/100%)`);
  console.log(`  - Competições Ativas: ${r.competitions.join(', ')}`);
  console.log(`  - Virada de Temporada: ${r.seasonTurnover}`);
});
console.log('\n>>> TODOS OS TESTES INTERNACIONAIS PASSARAM 100% COM SUCESSO! <<<');
