const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert');

console.log('================================================================================');
console.log('🔬 AUDITORIA PROFUNDA DE SINCRONIZAÇÃO E VALIDAÇÃO DE TODAS AS ABAS E SUB-ABAS');
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
    scrollY: 0,
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
    toast: (msg) => {},
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

// Auditoria profunda de integridade dos dados e ausência de duplicações
function auditStateIntegrity(st, clubName) {
  // 1. ELENCO: Sem duplicação de atletas
  assert(Array.isArray(st.squad), 'st.squad deve ser um Array');
  assert(st.squad.length >= 11, `Elenco de ${clubName} deve ter pelo menos 11 atletas (possui ${st.squad.length})`);
  const seenPlayerKeys = new Set();
  st.squad.forEach((p, idx) => {
    assert(p && typeof p === 'object', `Jogador ${idx} no elenco deve ser um objeto válido`);
    assert(p.name, `Jogador ${idx} deve possuir nome`);
    const key = p.marketKey || p.id || p.name;
    assert(!seenPlayerKeys.has(key), `ERRO DE DUPLICAÇÃO: Atleta repetido no elenco: ${p.name} (key: ${key})`);
    seenPlayerKeys.add(key);
    assert(Number(p.salary || p.wage || 0) >= 0, `Salário de ${p.name} deve ser válido`);
  });

  // 2. ESCALAÇÃO: 11 titulares únicos e todos pertencentes ao elenco
  assert(Array.isArray(st.lineup), 'st.lineup deve ser um Array');
  assert.strictEqual(st.lineup.length, 11, `Escalação deve ter exatamente 11 posições (tem ${st.lineup.length})`);
  const lineupKeys = new Set();
  st.lineup.forEach((slotKey, sIdx) => {
    if (slotKey) {
      assert(!lineupKeys.has(slotKey), `ERRO DE DUPLICAÇÃO: Atleta duplicado em múltiplos slots da escalação: ${slotKey}`);
      lineupKeys.add(slotKey);
      assert(seenPlayerKeys.has(slotKey), `Atleta escalado (${slotKey}) não foi encontrado no elenco do clube!`);
    }
  });

  // 3. HISTÓRICO: Sem duplicação de partidas no mesmo campeonato e rodada
  assert(Array.isArray(st.history), 'st.history deve ser um Array');
  const seenMatches = new Set();
  st.history.forEach((h, hIdx) => {
    assert(h && typeof h === 'object', `Registro ${hIdx} do histórico deve ser um objeto válido`);
    assert(h.h && h.a, `Registro ${hIdx} do histórico deve ter mandante e visitante`);
    assert(Number.isFinite(Number(h.hg)) && Number.isFinite(Number(h.ag)), `Placar inválido no histórico (${h.h} ${h.hg} x ${h.ag} ${h.a})`);
    const hClub = (h.h || '').toLowerCase().trim();
    const aClub = (h.a || '').toLowerCase().trim();
    const pair = [hClub, aClub].sort().join('::');
    const mKey = `${h.season || 2026}__${h.competitionId || 'comp'}__${pair}__${h.round || h.date}`;
    assert(!seenMatches.has(mKey), `ERRO DE DUPLICAÇÃO: Partida duplicada encontrada em state.history: ${mKey}`);
    seenMatches.add(mKey);
  });

  // 4. CLASSIFICAÇÃO (TEAMS): Sem duplicação e matemática 100% perfeita
  assert(Array.isArray(st.teams), 'st.teams deve ser um Array');
  const seenTeams = new Set();
  st.teams.forEach(t => {
    assert(t.name, 'Time na tabela deve ter nome');
    const tNorm = t.name.toLowerCase().trim();
    assert(!seenTeams.has(tNorm), `ERRO DE DUPLICAÇÃO: Clube repetido na tabela de classificação: ${t.name}`);
    seenTeams.add(tNorm);

    // Validação matemática estrita
    const j = Number(t.j) || 0;
    const v = Number(t.v) || 0;
    const e = Number(t.e) || 0;
    const d = Number(t.d) || 0;
    const gp = Number(t.gp) || 0;
    const gc = Number(t.gc) || 0;
    const sg = Number(t.sg) || 0;
    const p = Number(t.p) || 0;

    assert.strictEqual(j, v + e + d, `Inconsistência de Jogos para ${t.name}: J (${j}) !== V (${v}) + E (${e}) + D (${d})`);
    assert.strictEqual(sg, gp - gc, `Inconsistência de Saldo para ${t.name}: SG (${sg}) !== GP (${gp}) - GC (${gc})`);
    assert.strictEqual(p, (v * 3) + e, `Inconsistência de Pontos para ${t.name}: P (${p}) !== V*3 + E (${(v * 3) + e})`);
  });

  // 5. NOTÍCIAS: Sem mensagens idênticas e dentro do limite
  assert(Array.isArray(st.news), 'st.news deve ser um Array');
  assert(st.news.length <= 50, `st.news não deve exceder 50 itens (tem ${st.news.length})`);
  const seenNews = new Set();
  st.news.forEach(n => {
    assert(typeof n === 'string' && n.length > 0, 'Notícia deve ser texto não vazio');
    assert(!seenNews.has(n), `ERRO DE DUPLICAÇÃO: Notícia duplicada encontrada no feed: "${n}"`);
    seenNews.add(n);
  });

  // 6. FINANÇAS: Saldo, receitas e despesas consistentes
  assert(Number.isFinite(Number(st.balance)), `Saldo do clube deve ser um número finito (${st.balance})`);
  assert(Number.isFinite(Number(st.income || 0)), `Receita deve ser um número finito (${st.income})`);
  assert(Number.isFinite(Number(st.expense || 0)), `Despesa deve ser um número finito (${st.expense})`);

  // 7. CONFIANÇA & DIRETORIA: Sincronização entre trust e confidence
  assert(st.trust && typeof st.trust === 'object', 'st.trust deve existir');
  assert(st.confidence && typeof st.confidence === 'object', 'st.confidence deve existir');
  assert.strictEqual(st.trust.board, st.confidence.board, 'Confiança da diretoria (trust.board) deve estar sincronizada com confidence.board');
  assert.strictEqual(st.trust.fans, st.confidence.fans, 'Confiança da torcida (trust.fans) deve estar sincronizada com confidence.fans');
  assert.strictEqual(st.trust.squad, st.confidence.squad, 'Confiança do elenco (trust.squad) deve estar sincronizada com confidence.squad');
}

// Verifica renderização e conteúdo de todas as 12 abas e sub-abas
function auditAllTabsAndSubtabs(env, clubName) {
  const tabs = [
    { view: 'central', title: 'Central' },
    { view: 'noticias', title: 'Notícias & Mídia' },
    { view: 'calendario', title: 'Calendário Oficial' },
    { view: 'meutime', title: 'Meu Time & Tática' },
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
    assert(typeof html === 'string', `Aba ${t.title} deve retornar string HTML`);
    assert(html.length > 50, `Aba ${t.title} deve renderizar conteúdo visual completo (> 50 chars, tem ${html.length})`);
    assert(!html.includes('undefined is not a function'), `Aba ${t.title} contém exceção não tratada`);
    assert(!html.includes('NaN'), `Aba ${t.title} não pode conter NaN`);
    assert(!html.includes('null x null'), `Aba ${t.title} não pode exibir placares nulos`);
    assert(!html.includes('[object Object]'), `Aba ${t.title} não pode renderizar [object Object] cru`);
  }

  // SUB-ABAS DE NOTÍCIAS
  env.view = 'noticias';
  const newsChannels = ['ALL', 'G1', 'CAZETV', 'TWITTER', 'LEODIAS'];
  for (const ch of newsChannels) {
    env.newsChannelFilter = ch;
    const h = env.page();
    assert(h.length > 100, `Sub-aba de notícias ${ch} deve ter conteúdo`);
    assert(!h.includes('NaN'), `Sub-aba de notícias ${ch} não pode conter NaN`);
  }

  // SUB-ABAS DE ELENCO
  env.view = 'elenco';
  const squadFilters = ['ALL', 'GK', 'DEF', 'MID', 'ATT'];
  for (const sf of squadFilters) {
    env.squadFilter = sf;
    const h = env.page();
    assert(h.length > 100, `Filtro de elenco ${sf} deve ter conteúdo`);
    assert(!h.includes('NaN'), `Filtro de elenco ${sf} não pode conter NaN`);
  }

  // SUB-ABAS DE MERCADO
  env.view = 'mercado';
  const marketTabs = ['buy', 'sell', 'loan', 'scout', 'feed'];
  for (const mt of marketTabs) {
    env.marketTab = mt;
    const h = env.page();
    assert(h.length > 100, `Sub-aba de mercado ${mt} deve ter conteúdo`);
    assert(!h.includes('NaN'), `Sub-aba de mercado ${mt} não pode conter NaN`);
  }

  // SUB-ABAS DE TEMPORADA
  env.view = 'temporada';
  const seasonTabs = ['nacional', 'estadual', 'copadobrasil', 'continental'];
  for (const st of seasonTabs) {
    env.seasonTab = st;
    const h = env.page();
    assert(h.length > 100, `Sub-aba de temporada ${st} deve ter conteúdo`);
    assert(!h.includes('NaN'), `Sub-aba de temporada ${st} não pode conter NaN`);
  }
}

// Execução de teste completo
function runFullSuite() {
  const clubs = [
    { club: 'Flamengo', comp: 'bra-a', mgr: 'Filipe Luís IA' },
    { club: 'Corinthians', comp: 'bra-a', mgr: 'Ramón Díaz IA' },
    { club: 'Palmeiras', comp: 'bra-a', mgr: 'Abel Ferreira IA' },
    { club: 'Santos', comp: 'bra-b', mgr: 'Carille IA' },
    { club: 'Brasília', comp: 'bra-est-df', mgr: 'Prof. Aquino' },
    { club: 'Real Madrid', comp: 'esp-1', mgr: 'Ancelotti IA' },
    { club: 'Al-Hilal', comp: 'sau-1', mgr: 'Jorge Jesus IA' }
  ];

  for (const c of clubs) {
    console.log(`\n----------------------------------------------------------------`);
    console.log(`Auditoria do clube: ${c.club} (${c.comp})`);
    console.log(`----------------------------------------------------------------`);
    const env = initGameEnvironment();
    env.newCareer({ clubName: c.club, compId: c.comp, manager: c.mgr });
    const st = env.state;

    // 1. Estado inicial
    auditStateIntegrity(st, c.club);
    auditAllTabsAndSubtabs(env, c.club);
    console.log(`  ✓ Estado inicial e todas as 12 abas + sub-abas 100% OK`);

    // 2. Pré-temporada (se houver)
    if (st.isPreSeason) {
      env.skipPreSeason();
      auditStateIntegrity(st, c.club);
      auditAllTabsAndSubtabs(env, c.club);
      console.log(`  ✓ Pré-temporada pulada e sincronizada`);
    }

    // 3. Simula partidas consecutivas
    for (let matchNum = 1; matchNum <= 3; matchNum++) {
      const act = env.getActualCurrentMatch(st);
      if (!act) break;
      if (st.date < act.date) {
        env.AFM_CalendarFix.advanceToNextMatchGuaranteed(st);
      }
      env.simulateQuickRound();
      auditStateIntegrity(st, c.club);
      auditAllTabsAndSubtabs(env, c.club);
      console.log(`  ✓ Partida ${matchNum} simulada (${act.competitionName}) - integridade 100%`);
    }

    // 4. Mercado: Compra e Venda
    const prevSquadCount = st.squad.length;
    const testBuy = {
      id: `audit_buy_${Date.now()}`,
      name: 'Reforço Teste Auditoria',
      age: 22,
      pos: 'ATA',
      overall: 80,
      salary: 150000,
      value: 5000000,
      club: 'Livre',
      stamina: 100,
      energy: 100
    };
    st.squad.push(testBuy);
    st.balance -= 5000000;
    auditStateIntegrity(st, c.club);
    auditAllTabsAndSubtabs(env, c.club);

    const buyIdx = st.squad.findIndex(p => p.id === testBuy.id);
    st.squad.splice(buyIdx, 1);
    st.balance += 6000000;
    auditStateIntegrity(st, c.club);
    auditAllTabsAndSubtabs(env, c.club);
    console.log(`  ✓ Compra e venda no mercado verificadas sem duplicações`);

    // 5. Instalações
    env.upgradeFacility('stadium');
    env.upgradeFacility('training');
    auditStateIntegrity(st, c.club);
    auditAllTabsAndSubtabs(env, c.club);
    console.log(`  ✓ Instalações atualizadas e sincronizadas`);
  }

  console.log('\n================================================================');
  console.log('✅ AUDITORIA CONCLUÍDA COM 100% DE SUCESSO EM TODOS OS CLUBES!');
  console.log('================================================================');
}

runFullSuite();
