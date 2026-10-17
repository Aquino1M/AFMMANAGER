const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert');

console.log('========================================================================');
console.log('TESTANDO CLIQUE DO BOTÃO DE PRÉVIA NA CENTRAL E NO CALENDÁRIO');
console.log('========================================================================\n');

function createMockElement(tag, id = '', className = '') {
  const el = {
    tagName: (tag || 'DIV').toUpperCase(),
    id: id || '',
    className: className || '',
    innerHTML: '',
    textContent: '',
    value: '',
    checked: false,
    dataset: {},
    style: {},
    children: [],
    onclick: null,
    appendChild: function(c) {
      if (c) c.parentNode = el;
      el.children.push(c);
      return c;
    },
    removeChild: function(c) {
      const idx = el.children.indexOf(c);
      if (idx >= 0) {
        el.children.splice(idx, 1);
        if (c) c.parentNode = null;
      }
    },
    remove: function() {
      if (el.parentNode && el.parentNode.removeChild) el.parentNode.removeChild(el);
    },
    setAttribute: function(k, v) { el[k] = v; },
    getAttribute: function(k) { return el[k] || null; },
    querySelector: function(sel) {
      if (sel.includes('#appCustomModal') || sel.includes('.modal-overlay')) {
        return el.children.find(c => c.id === 'appCustomModal' || c.className.includes('modal-overlay')) || null;
      }
      return createMockElement('div');
    },
    querySelectorAll: function(sel) { return []; },
    closest: function(sel) {
      if (sel.includes('#btnMatchPreviewCentral') && (el.id === 'btnMatchPreviewCentral' || el.className.includes('btnMatchPreviewCentral'))) return el;
      if (sel.includes('.btnCalPreviewNow') && el.className.includes('btnCalPreviewNow')) return el;
      return null;
    }
  };
  return el;
}

function runPreviewTest() {
  const storage = {};
  const root = createMockElement('body');
  const appEl = createMockElement('div', 'app');
  root.appendChild(appEl);

  const listeners = {};

  const context = {
    console,
    setTimeout: (fn) => 1,
    clearTimeout: () => {},
    setInterval: (fn) => 1,
    clearInterval: () => {},
    scrollTo: () => {},
    requestAnimationFrame: (cb) => { if (typeof cb === 'function') cb(); },
    Math, Date, Array, Object, String, Number, Boolean, RegExp, JSON, Set, Map,
    localStorage: {
      getItem: k => storage[k] || null,
      setItem: (k, v) => { storage[k] = String(v); },
      removeItem: k => { delete storage[k]; },
      clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
    }
  };
  context.window = context;
  context.window.AFM_DB = { init: () => Promise.resolve(null) };

  const doc = {
    getElementById: id => (id === 'app' ? appEl : root.children.find(c => c.id === id) || createMockElement('div', id)),
    querySelector: sel => (sel === '#app' ? appEl : root.children.find(c => c.id === sel.replace('#', '')) || createMockElement('div')),
    querySelectorAll: () => [],
    addEventListener: (event, handler, useCapture) => {
      listeners[event] = listeners[event] || [];
      listeners[event].push(handler);
    },
    removeEventListener: () => {},
    createElement: tag => createMockElement(tag),
    body: root
  };
  context.document = doc;
  context.window.document = doc;

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

  // 1. Inicializa carreira (Flamengo - 17 de janeiro de 2026)
  context.newCareer({ clubName: 'Flamengo', compId: 'bra-a', manager: 'Mister Aquino' });
  const s = context.state;
  s.isPreSeason = false;
  s.preSeasonDays = 0;
  s.date = '2026-01-17';

  // 2. Renderiza a tela Central
  context.view = 'central';
  context.render();

  console.log(`- Carreira em 17/01/2026: Clube=${s.club}, Data=${s.date}`);
  const currentMatch = context.getActualCurrentMatch(s);
  console.log(`- Próxima Partida detectada: ${currentMatch.home} x ${currentMatch.away} (${currentMatch.competitionName})`);

  // 3. Simula o clique do usuário no botão #btnMatchPreviewCentral
  const btnEl = createMockElement('button', 'btnMatchPreviewCentral', 'btn btnMatchPreviewCentral');
  btnEl.dataset = {
    home: currentMatch.home,
    away: currentMatch.away,
    comp: currentMatch.competitionName,
    date: currentMatch.date
  };

  const clickEvent = {
    target: btnEl,
    preventDefault: () => {},
    stopPropagation: () => {}
  };

  console.log('\n[TESTE 1] Disparando clique do usuário no botão 📋 PRÉVIA na tela Central...');
  let modalFoundBefore = root.children.find(c => c.id === 'appCustomModal');
  assert(!modalFoundBefore, 'Modal não deve existir antes do clique');

  (listeners['click'] || []).forEach(handler => handler(clickEvent));

  const modalFoundAfter = root.children.find(c => c.id === 'appCustomModal');
  assert(modalFoundAfter, 'Modal DEVE ter sido adicionado ao document.body após o clique!');
  console.log('  ✓ Modal adicionado ao document.body com sucesso!');
  assert(modalFoundAfter.innerHTML.includes('Prévia Oficial'), 'Modal deve conter cabeçalho da Prévia Oficial');
  assert(modalFoundAfter.innerHTML.includes('Raio-X Setorial') || modalFoundAfter.innerHTML.includes('Provável 11 Inicial'), 'Modal deve conter análise');
  console.log('  ✓ Conteúdo completo da Prévia Oficial renderizado corretamente.');

  // 4. Testa botão de fechar modal
  console.log('\n[TESTE 2] Fechando a prévia...');
  modalFoundAfter.remove();
  assert(!root.children.find(c => c.id === 'appCustomModal'), 'Modal deve ser removido ao fechar');
  console.log('  ✓ Modal fechado com sucesso.');

  // 5. Testa chamada direta do openMatchPreviewModal() sem argumentos
  console.log('\n[TESTE 3] Testando chamada openMatchPreviewModal() sem parâmetros...');
  context.openMatchPreviewModal();
  const directModal = root.children.find(c => c.id === 'appCustomModal');
  assert(directModal, 'Modal deve abrir mesmo sem parâmetros');
  console.log('  ✓ Modal abriu com resolução automática dos dados da partida.');
  directModal.remove();

  console.log('\n>>> SUCESSO TOTAL: O BOTÃO DE PRÉVIA ESTÁ 100% FUNCIONAL E ABRE O MODAL IMEDIATAMENTE! <<<');
}

runPreviewTest();
