const assert = require('assert');
const fs = require('fs');

console.log('🧪 Iniciando testes de validação dos Modais de Loja (Em Breve) e Ajuda/Tutorial...');

// Simulação de DOM mínima
global.window = global;
global.document = {
  elements: {},
  body: {
    children: [],
    appendChild(el) {
      this.children.push(el);
      global.document.elements[el.id] = el;
      return el;
    }
  },
  getElementById(id) {
    return global.document.elements[id] || null;
  },
  createElement(tag) {
    const el = {
      tagName: tag.toUpperCase(),
      id: '',
      className: '',
      innerHTML: '',
      style: {},
      listeners: {},
      dataset: {},
      children: [],
      classList: {
        classes: new Set(),
        add(c) { this.classes.add(c); },
        remove(c) { this.classes.delete(c); },
        contains(c) { return this.classes.has(c); }
      },
      addEventListener(evt, fn) {
        this.listeners[evt] = this.listeners[evt] || [];
        this.listeners[evt].push(fn);
      },
      remove() {
        if (this.id && global.document.elements[this.id]) {
          delete global.document.elements[this.id];
        }
        const idx = global.document.body.children.indexOf(this);
        if (idx !== -1) global.document.body.children.splice(idx, 1);
      },
      querySelector(sel) {
        if (sel.startsWith('#')) {
          const id = sel.slice(1);
          return this._findChildById(id);
        }
        return null;
      },
      querySelectorAll(sel) {
        const results = [];
        this._findChildren(el => {
          if (sel === '[data-goto-view]' && el.dataset && el.dataset.gotoView) return true;
          return false;
        }, results);
        return results;
      },
      _findChildById(id) {
        if (this.id === id) return this;
        for (const child of this.children) {
          if (child.id === id) return child;
          const found = child._findChildById && child._findChildById(id);
          if (found) return found;
        }
        return null;
      },
      _findChildren(predicate, acc) {
        for (const child of this.children) {
          if (predicate(child)) acc.push(child);
          if (child._findChildren) child._findChildren(predicate, acc);
        }
      }
    };
    return el;
  }
};

global.esc = (str) => String(str || '');
global.toast = (msg) => { console.log('   [TOAST]', msg); };

// Carrega funções do game.js extraindo as funções de modal
const gameJs = fs.readFileSync('js/game.js', 'utf8');

// Executa bloco das funções de Loja e Ajuda
const storeRegex = /function closeStoreComingSoonModal\(\)[\s\S]*?window\.openStoreComingSoonModal = openStoreComingSoonModal;/;
const helpRegex = /function closeGameHelpTutorialModal\(\)[\s\S]*?window\.openGameHelpTutorialModal = openGameHelpTutorialModal;/;

const matchStore = gameJs.match(storeRegex);
const matchHelp = gameJs.match(helpRegex);

assert(matchStore, 'closeStoreComingSoonModal / openStoreComingSoonModal devem estar no game.js');
assert(matchHelp, 'closeGameHelpTutorialModal / openGameHelpTutorialModal devem estar no game.js');

// Mock helper para parsear elementos simples criados no innerHTML
const originalCreateElement = global.document.createElement;
global.document.createElement = function(tag) {
  const el = originalCreateElement(tag);
  // Monkey patch innerHTML setter to instantiate queryable children for our test
  Object.defineProperty(el, 'innerHTML', {
    set(html) {
      this._html = html;
      this.children = [];
      // Identifica ids
      const idMatches = html.matchAll(/id="([^"]+)"/g);
      for (const m of idMatches) {
        const childId = m[1];
        const child = originalCreateElement('div');
        child.id = childId;
        this.children.push(child);
      }
      // Identifica data-goto-view
      const viewMatches = html.matchAll(/data-goto-view="([^"]+)"/g);
      for (const vm of viewMatches) {
        const viewId = vm[1];
        const child = originalCreateElement('button');
        child.dataset = { gotoView: viewId };
        this.children.push(child);
      }
    },
    get() {
      return this._html || '';
    }
  });
  return el;
};

// Avalia os scripts no contexto global
eval(matchStore[0]);
eval(matchHelp[0]);

// 1. Testa openStoreComingSoonModal
console.log('1. Testando openStoreComingSoonModal...');
assert.strictEqual(typeof window.openStoreComingSoonModal, 'function');
assert.strictEqual(typeof window.closeStoreComingSoonModal, 'function');

window.openStoreComingSoonModal();
let storeOverlay = document.getElementById('appStoreComingSoonModal');
assert(storeOverlay, 'Modal de loja deve estar no document');
assert(storeOverlay.innerHTML.includes('Loja Oficial AFM'), 'Conteúdo deve ter Loja Oficial AFM');
assert(storeOverlay.innerHTML.includes('Em Breve'), 'Conteúdo deve indicar Em Breve');
assert(storeOverlay.innerHTML.includes('Moedas de Treinador'), 'Deve ter Moedas de Treinador');
assert(storeOverlay.innerHTML.includes('Kits Retrô'), 'Deve ter Kits Retrô');
assert(storeOverlay.innerHTML.includes('Customização de Arenas'), 'Deve ter Customização de Arenas');
assert(storeOverlay.innerHTML.includes('Rede VIP de Olheiros'), 'Deve ter Rede VIP de Olheiros');
assert(storeOverlay.innerHTML.includes('Fair Play'), 'Deve ter Garantia Fair Play');

// Fechar modal
window.closeStoreComingSoonModal();
assert.strictEqual(document.getElementById('appStoreComingSoonModal'), null, 'Modal de loja deve ser removido ao fechar');
console.log('✅ openStoreComingSoonModal testado com sucesso.');

// 2. Testa openGameHelpTutorialModal
console.log('2. Testando openGameHelpTutorialModal...');
assert.strictEqual(typeof window.openGameHelpTutorialModal, 'function');
assert.strictEqual(typeof window.closeGameHelpTutorialModal, 'function');

let renderCalled = false;
global.view = 'central';
global.render = () => { renderCalled = true; };

window.openGameHelpTutorialModal();
let helpOverlay = document.getElementById('appGameHelpTutorialModal');
assert(helpOverlay, 'Modal de ajuda deve estar no document');
assert(helpOverlay.innerHTML.includes('Central de Ajuda & Guia Completo'), 'Deve conter o título da central');
assert(helpOverlay.innerHTML.includes('Dicas Rápidas de Mestre'), 'Deve ter aba de Dicas');
assert(helpOverlay.innerHTML.includes('Tutorial das 12 Abas'), 'Deve ter aba das 12 Abas');

// Verifica as 12 abas presentes no conteúdo
const expectedViews = [
  'central', 'meutime', 'elenco', 'calendario',
  'mercado', 'carreira', 'temporada', 'estrutura',
  'escritorio', 'noticias', 'novidades', 'config'
];

expectedViews.forEach(v => {
  assert(helpOverlay.innerHTML.includes(`data-goto-view="${v}"`), `Deve ter botão com atalho para a aba '${v}'`);
});

// Testa navegação rápida clicando em uma aba
const gotoButtons = helpOverlay.querySelectorAll('[data-goto-view]');
assert.strictEqual(gotoButtons.length, 12, 'Deve ter 12 botões de atalho');

const btnElenco = gotoButtons.find(b => b.dataset.gotoView === 'elenco');
assert(btnElenco, 'Botão para elenco deve existir');
btnElenco.onclick({ preventDefault: () => {} });

assert.strictEqual(global.view, 'elenco', 'View global deve ter sido atualizada para elenco');
assert.strictEqual(renderCalled, true, 'render() deve ter sido chamado ao trocar de aba');
assert.strictEqual(document.getElementById('appGameHelpTutorialModal'), null, 'Modal de ajuda deve fechar após selecionar aba');

console.log('✅ openGameHelpTutorialModal testado com sucesso.');

// 3. Testa delegação em pwa_and_landscape_enforcer.js
console.log('3. Validando handlers no pwa_and_landscape_enforcer.js...');
const pwaJs = fs.readFileSync('js/ui/pwa_and_landscape_enforcer.js', 'utf8');
assert(pwaJs.includes('window.openStoreComingSoonModal()'), 'pwa_and_landscape_enforcer.js deve chamar openStoreComingSoonModal');
assert(pwaJs.includes('window.openGameHelpTutorialModal()'), 'pwa_and_landscape_enforcer.js deve chamar openGameHelpTutorialModal');
console.log('✅ Delegações validadas.');

// 4. Testa amarração direta no bind() do game.js
console.log('4. Validando amarração direta no bind() do game.js...');
assert(gameJs.includes("btnTopStoreBtn.onclick=(e)=>{e.preventDefault();e.stopPropagation();openStoreComingSoonModal();}"), 'bind() deve ter amarração direta de btnTopStore');
assert(gameJs.includes("btnTopHelpBtn.onclick=(e)=>{e.preventDefault();e.stopPropagation();openGameHelpTutorialModal();}"), 'bind() deve ter amarração direta de btnTopHelp');
console.log('✅ bind() validado.');

// 5. Testa estilos no css/app.css
console.log('5. Validando regras CSS...');
const css = fs.readFileSync('css/app.css', 'utf8');
assert(css.includes('.afm-store-modal-overlay'), 'css deve conter .afm-store-modal-overlay');
assert(css.includes('.afm-store-modal'), 'css deve conter .afm-store-modal');
assert(css.includes('.afm-help-modal-overlay'), 'css deve conter .afm-help-modal-overlay');
assert(css.includes('.afm-help-modal'), 'css deve conter .afm-help-modal');
assert(css.includes('.afm-help-nav-tabs'), 'css deve conter .afm-help-nav-tabs');
assert(css.includes('.afm-help-guide-card'), 'css deve conter .afm-help-guide-card');
assert(css.includes('.afm-btn-goto-tab'), 'css deve conter .afm-btn-goto-tab');
console.log('✅ Regras de CSS validadas com sucesso.');

console.log('\n🎉 TODOS OS TESTES PASSARAM COM 100% DE SUCESSO!');
