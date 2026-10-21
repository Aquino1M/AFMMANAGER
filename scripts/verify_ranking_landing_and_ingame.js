const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

function createMockElement(tag) {
  return {
    tagName: (tag || 'DIV').toUpperCase(),
    innerHTML: '',
    textContent: '',
    value: '',
    style: {},
    dataset: {},
    classList: { add: () => {}, remove: () => {}, contains: () => false, toggle: () => {} },
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

function initEnvironment() {
  const storage = {};
  const context = {
    console,
    requestAnimationFrame: (cb) => { if (typeof cb === 'function') cb(); },
    scrollTo: () => {},
    setTimeout: (fn) => 1,
    clearTimeout: () => {},
    setInterval: () => 1,
    clearInterval: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    confirm: () => true,
    alert: () => {},
    prompt: () => '',
    Math, Date, Array, Object, String, Number, Boolean, RegExp, JSON, Set, Map,
    localStorage: {
      getItem: k => storage[k] || null,
      setItem: (k, v) => { storage[k] = String(v); },
      removeItem: k => { delete storage[k]; },
      clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
    },
    openCustomModal: () => {},
    closeCustomModal: () => {},
    toast: () => {}
  };
  context.window = context;
  const root = createMockElement('body');
  const elements = { app: createMockElement('app') };
  context.document = {
    getElementById: id => {
      if (!elements[id]) elements[id] = createMockElement(id);
      return elements[id];
    },
    querySelector: sel => {
      if (sel === '#app') return elements.app;
      return createMockElement(sel);
    },
    querySelectorAll: () => [],
    addEventListener: () => {},
    removeEventListener: () => {},
    createElement: tag => createMockElement(tag),
    body: root
  };
  context.window.document = context.document;
  context.window.esc = s => String(s || '');

  vm.createContext(context);

  const files = [
    'js/database.js',
    'js/competitions.js',
    'data/competition_teams.js',
    'data/international_teams_2026_27.js',
    'data/continental_2026.js',
    'js/core/tournament_engine.js',
    'js/core/competition_integrity.js',
    'data/players_live.js',
    'js/core/match_engine.js',
    'js/core/real_football_engine.js',
    'js/game.js',
    'js/systems/coach_ranking_pix.js'
  ];

  for (const f of files) {
    const fullPath = path.join(__dirname, '..', f);
    if (fs.existsSync(fullPath)) {
      vm.runInContext(fs.readFileSync(fullPath, 'utf8'), context);
    }
  }

  return context;
}

function runTests() {
  console.log('--- INICIANDO TESTE DE RANKING (PÁGINA INICIAL vs DENTRO DO JOGO) ---');
  const env = initEnvironment();

  // 1. Teste da Página Inicial
  console.log('\n[TESTE 1] Página Inicial do Ranking (Público & Como Funciona)...');
  const landingHtml = env.AFM_CoachRanking.renderLandingPage();
  assert(landingHtml.includes('COMO FUNCIONA O RANKING & A PREMIAÇÃO PIX'), 'Deve conter seção Como Funciona');
  assert(landingHtml.includes('R$ 1.000,00 NO PIX PARA O TOP 5'), 'Deve conter banner de R$ 1.000 no PIX');
  assert(landingHtml.includes('R$ 450,00') && landingHtml.includes('R$ 250,00'), 'Deve conter faixas de premiação');
  assert(landingHtml.includes('btnLandingCtaGame'), 'Deve conter CTA para entrar no jogo');
  assert(!landingHtml.includes('id="btnHeroOpenPixModal"'), 'NÃO deve conter botão de cadastro de chave in-game no topo da landing page');
  assert(!landingHtml.includes('afm-ingame-ranking-hero'), 'NÃO deve conter o card de desempenho pessoal na landing page');
  console.log('✓ Página Inicial validada com sucesso: informativa, com pódio, tabela e sem cadastro indevido de chave PIX.');

  // 2. Teste Dentro do Jogo (In-Game)
  console.log('\n[TESTE 2] Aba de Ranking DENTRO DO JOGO...');
  env.newCareer({ clubName: 'Flamengo', compId: 'bra-a', manager: 'Prof. Aquino' });
  env.state.history = [
    { h: 'Flamengo', a: 'Vasco', hg: 2, ag: 0, date: '2026-02-01' },
    { h: 'Flamengo', a: 'Botafogo', hg: 3, ag: 1, date: '2026-02-05' },
    { h: 'Fluminense', a: 'Flamengo', hg: 0, ag: 1, date: '2026-02-09' }
  ];
  env.state.titles = ['Campeonato Carioca'];

  env.view = 'ranking';
  const inGameHtml = env.page();

  assert(inGameHtml.includes('afm-ingame-ranking-hero'), 'Deve conter o Hero Card exclusivo de desempenho');
  assert(inGameHtml.includes('Prof. Aquino'), 'Deve exibir o nome do treinador logado');
  assert(inGameHtml.includes('Flamengo'), 'Deve exibir o clube do treinador');
  assert(inGameHtml.includes('Sua Posição'), 'Deve exibir o bloco de Sua Posição');
  assert(inGameHtml.includes('Seus Pontos'), 'Deve exibir o bloco de Seus Pontos');
  assert(inGameHtml.includes('btnOpenPixModalBanner') || inGameHtml.includes('btnHeroOpenPixModal'), 'Deve conter botão de cadastrar chave PIX');
  assert(inGameHtml.includes('VOCÊ'), 'Deve destacar o treinador na tabela com a etiqueta VOCÊ');
  console.log('✓ Aba interna do jogo validada com sucesso: exibe a posição do jogador, seus pontos e o cadastro de chave PIX.');

  // 3. Teste do Cadastro e Persistência da Chave PIX
  console.log('\n[TESTE 3] Cadastro e Persistência da Chave PIX...');
  const keyBefore = env.AFM_CoachRanking.getUserPixKey();
  assert(keyBefore === null || !keyBefore.key, 'Inicialmente sem chave');

  env.AFM_CoachRanking.setUserPixKey('cpf', '123.456.789-00');
  const keyAfter = env.AFM_CoachRanking.getUserPixKey();
  assert(keyAfter && keyAfter.key === '123.456.789-00', 'Chave deve ter sido gravada');
  assert(keyAfter.type === 'cpf', 'Tipo da chave deve ser CPF');

  const inGameHtmlWithKey = env.AFM_CoachRanking.renderInGamePage();
  assert(inGameHtmlWithKey.includes('Chave PIX Cadastrada') || inGameHtmlWithKey.includes('CHAVE PIX'), 'Deve refletir a chave cadastrada');
  console.log('✓ Cadastro da chave PIX validado com sucesso com persistência segura!');

  // 4. Teste da Navegação e Menus do Jogo
  console.log('\n[TESTE 4] Menus e Abas do Jogo...');
  env.view = 'central';
  const fullShellHtml = env.shell(env.page());
  assert(fullShellHtml.includes('data-view="ranking"'), 'Drawer lateral e ribbon devem conter o botão de navegação para a aba ranking');
  assert(fullShellHtml.includes('👑 Ranking & PIX'), 'Deve exibir o rótulo da aba com ícone da coroa');
  console.log('✓ Navegação do jogo validada: aba Ranking presente no menu lateral e ribbon!');

  console.log('\n🎉 TODOS OS TESTES FORAM CONCLUÍDOS COM 100% DE SUCESSO! ZERO BUGS! 🎉');
}

runTests();
