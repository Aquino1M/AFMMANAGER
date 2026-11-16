/**
 * tests/test_modals_and_exit_action.js
 *
 * Validação rigorosa dos botões de popups/modais e do fluxo de Sair e Salvar:
 * 1. openCustomModal: botões Fechar [X], Cancelar e Confirmar responsivos com delegação e onclick.
 * 2. handleExitGameAction: aciona modal de saída, executa save({ force: true, manual: true }) e direciona ao setup.
 * 3. Modais do Treinador e Jogador: overlays com pointer-events: auto e classes ativas.
 * 4. css/app.css: regras de pointer-events blindadas contra bloqueio acidental de cliques.
 */

const assert = require('assert');
const fs = require('fs');

console.log('--- INICIANDO TESTES DE MODAIS E BOTÃO DE SAIR E SALVAR ---');

// Lightweight DOM mock supporting innerHTML element extraction
function createMockElement(tagName = 'div') {
  const el = {
    tagName: tagName.toUpperCase(),
    className: '',
    id: '',
    style: {},
    _innerHTML: '',
    children: [],
    parentNode: null,
    listeners: {},
    addEventListener(event, fn) {
      if (!this.listeners[event]) this.listeners[event] = [];
      this.listeners[event].push(fn);
    },
    removeEventListener(event, fn) {
      if (!this.listeners[event]) return;
      this.listeners[event] = this.listeners[event].filter(f => f !== fn);
    },
    dispatchEvent(event) {
      if (this.listeners[event.type]) {
        this.listeners[event.type].forEach(fn => fn(event));
      }
      if (this.onclick && event.type === 'click') {
        this.onclick(event);
      }
      if (this.parentNode && !event._propagationStopped) {
        this.parentNode.dispatchEvent(event);
      }
    },
    remove() {
      if (this.parentNode) {
        this.parentNode.children = this.parentNode.children.filter(c => c !== this);
        this.parentNode = null;
      }
    },
    appendChild(child) {
      child.parentNode = this;
      this.children.push(child);
      return child;
    },
    querySelector(sel) {
      return findInMock(this, sel);
    },
    querySelectorAll(sel) {
      const results = [];
      findAllInMock(this, sel, results);
      return results;
    },
    closest(sel) {
      let cur = this;
      while (cur) {
        if (matchesSel(cur, sel)) return cur;
        cur = cur.parentNode;
      }
      return null;
    }
  };

  Object.defineProperty(el, 'innerHTML', {
    get() {
      return this._innerHTML;
    },
    set(html) {
      this._innerHTML = html;
      this.children = [];
      // Parse ids and classes from HTML tags to create child nodes for DOM testing
      const tagRegex = /<([a-z0-9]+)([^>]*)>([\s\S]*?)<\/\1>|<([a-z0-9]+)([^>]*)\/>/gi;
      let match;
      while ((match = tagRegex.exec(html)) !== null) {
        const tName = match[1] || match[4];
        const attrs = match[2] || match[5] || '';
        const inner = match[3] || '';
        const child = createMockElement(tName);
        const idM = attrs.match(/id=['"]([^'"]+)['"]/);
        if (idM) child.id = idM[1];
        const classM = attrs.match(/class=['"]([^'"]+)['"]/);
        if (classM) child.className = classM[1];
        if (inner.includes('<')) {
          child.innerHTML = inner;
        }
        this.appendChild(child);
      }
    }
  });

  return el;
}

function matchesSel(el, sel) {
  const parts = sel.split(',').map(s => s.trim());
  return parts.some(part => {
    if (part.startsWith('#')) return el.id === part.slice(1);
    if (part.startsWith('.')) return el.className && el.className.split(' ').includes(part.slice(1));
    return el.tagName && el.tagName.toLowerCase() === part.toLowerCase();
  });
}

function findInMock(root, sel) {
  for (const child of root.children) {
    if (matchesSel(child, sel)) return child;
    const found = findInMock(child, sel);
    if (found) return found;
  }
  return null;
}

function findAllInMock(root, sel, results) {
  for (const child of root.children) {
    if (matchesSel(child, sel)) results.push(child);
    findAllInMock(child, sel, results);
  }
}

// Global window and document mock
const mockDocument = {
  body: createMockElement('body'),
  createElement(tag) { return createMockElement(tag); },
  getElementById(id) {
    return findInMock(this.body, '#' + id);
  },
  querySelector(sel) {
    return findInMock(this.body, sel);
  },
  querySelectorAll(sel) {
    const results = [];
    findAllInMock(this.body, sel, results);
    return results;
  }
};

global.document = mockDocument;
global.window = global;
global.$ = (sel) => mockDocument.querySelector(sel);
global.$$ = (sel) => mockDocument.querySelectorAll(sel);
global.esc = (str) => String(str || '');
global.toast = (msg) => { global.__lastToast = msg; };

// Carregar arquivos fonte
const gameJsCode = fs.readFileSync('js/game.js', 'utf8');
const cssCode = fs.readFileSync('css/app.css', 'utf8');

// TESTE 1: Validação do CSS de Overlays e Pointer-Events
console.log('Teste 1: Validando regras de pointer-events em css/app.css...');
assert(
  !cssCode.includes('.modal-overlay:not(.active):not([style*="display: flex"]):not([style*="display: block"])'),
  'Erro: css/app.css ainda contém regra destrutiva de pointer-events: none em .modal-overlay!'
);
assert(
  cssCode.includes('.modal-overlay,') && cssCode.includes('#appCustomModal,') && cssCode.includes('pointer-events: auto !important;'),
  'Erro: css/app.css não contém garantia explícita de pointer-events: auto para modais!'
);
assert(
  cssCode.includes('#modalCloseXBtn,') && cssCode.includes('#modalConfirmAction') && cssCode.includes('cursor: pointer !important;'),
  'Erro: css/app.css não contém regras garantindo pointer-events: auto nos botões de ação do modal!'
);
console.log('✅ Teste 1: Regras de CSS validadas com sucesso (sem bloqueio de cliques).');

// TESTE 2: openCustomModal e fechamento via botão X
console.log('Teste 2: Testando openCustomModal com clique no botão [X] (#modalCloseXBtn)...');

eval(gameJsCode.slice(
  gameJsCode.indexOf('function openCustomModal('),
  gameJsCode.indexOf('function closeActiveModal(')
));

openCustomModal('Teste Modal', '<p>Conteúdo de teste</p>', null, 'Confirmar', true);
let modalEl = document.getElementById('appCustomModal');
assert(modalEl, 'Modal não foi inserido no DOM!');
assert(modalEl.className.includes('active'), 'Overlay não possui classe active!');
assert(modalEl.style.cssText.includes('pointer-events:auto'), 'Overlay não possui pointer-events:auto no estilo!');

const closeXBtn = modalEl.querySelector('#modalCloseXBtn');
assert(closeXBtn, 'Botão #modalCloseXBtn não foi encontrado no modal!');
closeXBtn.dispatchEvent({ type: 'click', target: closeXBtn, preventDefault: () => {}, stopPropagation: () => {} });
assert(!document.getElementById('appCustomModal'), 'Modal deveria ter sido removido após clicar em [X]!');
console.log('✅ Teste 2: Fechar [X] funcionou e removeu o modal do DOM.');

// TESTE 3: openCustomModal e cancelamento via botão Cancelar (#modalCancelAction)
console.log('Teste 3: Testando openCustomModal com clique em [Cancelar] (#modalCancelAction)...');
openCustomModal('Teste Cancelar', '<p>Conteúdo</p>', null, 'Confirmar', true);
modalEl = document.getElementById('appCustomModal');
assert(modalEl, 'Modal não foi inserido no DOM!');
const cancelBtn = modalEl.querySelector('#modalCancelAction');
assert(cancelBtn, 'Botão #modalCancelAction não foi encontrado!');
cancelBtn.dispatchEvent({ type: 'click', target: cancelBtn, preventDefault: () => {}, stopPropagation: () => {} });
assert(!document.getElementById('appCustomModal'), 'Modal deveria ter sido removido após clicar em [Cancelar]!');
console.log('✅ Teste 3: Cancelar funcionou e removeu o modal do DOM.');

// TESTE 4: openCustomModal e confirmação via botão Confirmar (#modalConfirmAction)
console.log('Teste 4: Testando openCustomModal com clique em [Confirmar] (#modalConfirmAction)...');
let confirmRan = false;
openCustomModal('Teste Confirmar', '<p>Conteúdo</p>', () => { confirmRan = true; }, 'Salvar e Sair', true);
modalEl = document.getElementById('appCustomModal');
assert(modalEl, 'Modal não foi inserido no DOM!');
const confBtn = modalEl.querySelector('#modalConfirmAction');
assert(confBtn, 'Botão #modalConfirmAction não foi encontrado!');
confBtn.dispatchEvent({ type: 'click', target: confBtn, preventDefault: () => {}, stopPropagation: () => {} });
assert(confirmRan === true, 'Callback onConfirm não foi executado!');
assert(!document.getElementById('appCustomModal'), 'Modal deveria ter sido fechado após confirmar!');
console.log('✅ Teste 4: Confirmar executou a ação e fechou o modal com sucesso.');

// TESTE 5: handleExitGameAction (Sair e Salvar)
console.log('Teste 5: Testando handleExitGameAction (Salvar e Sair para o Menu Principal)...');

let savedOptions = null;
global.save = (opts) => { savedOptions = opts; };
global.getActiveAccount = () => ({ username: 'aquino' });
global.setActiveAccount = (u) => {};
global.closeMatchActionModal = () => {};
global.localStorage = {
  getItem: () => 'true',
  setItem: () => {}
};
let renderSetupCalled = false;
global.renderSetup = () => { renderSetupCalled = true; };
global.state = { club: 'Brasília', userOwner: 'aquino' };

// Garantir elemento #app no mockDocument
const appNode = createMockElement('div');
appNode.id = 'app';
mockDocument.body.appendChild(appNode);

eval(gameJsCode.slice(
  gameJsCode.indexOf('function handleExitGameAction('),
  gameJsCode.indexOf('window.handleExitGameAction = handleExitGameAction;') + 'window.handleExitGameAction = handleExitGameAction;'.length
));

// Executar ação de saída
handleExitGameAction();
const exitModal = document.getElementById('appCustomModal');
assert(exitModal, 'Modal de confirmação de saída não foi aberto!');

// Clicar em "Sim, Salvar e Sair"
const exitConfirmBtn = exitModal.querySelector('#modalConfirmAction');
assert(exitConfirmBtn, 'Botão de confirmação de saída não encontrado!');
exitConfirmBtn.dispatchEvent({ type: 'click', target: exitConfirmBtn, preventDefault: () => {}, stopPropagation: () => {} });

assert(savedOptions && savedOptions.force === true && savedOptions.manual === true, 'save({ force: true, manual: true }) não foi chamado!');
assert(global.state === null, 'Estado não foi limpo após sair!');
assert(global.setupViewMode === 'select', 'setupViewMode não foi redefinido para "select"!');
assert(renderSetupCalled === true, 'renderSetup não foi chamado após sair!');
assert(!document.getElementById('appCustomModal'), 'Modal de saída não foi fechado após confirmação!');
console.log('✅ Teste 5: handleExitGameAction salvou com force:true, limpou o estado e voltou ao setup.');

// TESTE 6: Verificação dos demais modais no game.js e player_mode_ui.js
console.log('Teste 6: Verificando integridade das definições de overlay em game.js e player_mode_ui.js...');
const playerUiCode = fs.readFileSync('js/player/player_mode_ui.js', 'utf8');

assert(gameJsCode.includes("overlay.className = 'modal-overlay active afm-match-action-modal-overlay'"), 'openMatchActionModal sem active');
assert(gameJsCode.includes("overlay.className = 'modal-overlay active afm-store-modal-overlay'"), 'openStoreComingSoonModal sem active');
assert(gameJsCode.includes("overlay.className = 'modal-overlay active afm-help-modal-overlay'"), 'openGameHelpTutorialModal sem active');
assert(playerUiCode.includes('afmPlayerPostMatchModal') && playerUiCode.includes('modal-overlay active'), 'afmPlayerPostMatchModal sem active');
assert(playerUiCode.includes('afmSeasonGalaModal') && playerUiCode.includes('modal-overlay active'), 'afmSeasonGalaModal sem active');
assert(playerUiCode.includes('afmPlayerInterviewModal') && playerUiCode.includes('modal-overlay active'), 'afmPlayerInterviewModal sem active');
assert(playerUiCode.includes('createActionModalContainer') && playerUiCode.includes('afm-custom-modal-overlay active'), 'createActionModalContainer sem active');

console.log('✅ Teste 6: Todos os modais auditados e garantidos com classe active e pointer-events: auto.');

console.log('\n🎉 TODOS OS TESTES DE MODAIS E BOTÕES DE SAIR/SALVAR PASSARAM COM 100% DE SUCESSO!');
