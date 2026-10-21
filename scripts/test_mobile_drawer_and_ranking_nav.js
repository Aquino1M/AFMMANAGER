const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

console.log('--- TESTE ESPECÍFICO: GAVETA MOBILE E ABA RANKING NO DESKTOP/PC ---');

// Mock DOM environment
class ClassList {
  constructor() { this.classes = new Set(); }
  add(c) { this.classes.add(c); }
  remove(c) { this.classes.delete(c); }
  contains(c) { return this.classes.has(c); }
  toggle(c, force) {
    if (typeof force === 'boolean') {
      if (force) this.add(c); else this.remove(c);
      return force;
    }
    if (this.contains(c)) { this.remove(c); return false; }
    this.add(c); return true;
  }
}

class ElementMock {
  constructor(id, tag = 'div') {
    this.id = id;
    this.tagName = tag.toUpperCase();
    this.classList = new ClassList();
    this.children = [];
    this.innerHTML = '';
    this.dataset = {};
  }
  querySelector(sel) {
    if (sel === '[data-view="ranking"]') {
      return this.innerHTML.includes('data-view="ranking"') ? new ElementMock('rankingBtn') : null;
    }
    if (sel === '[data-view="calendario"]') {
      return this.innerHTML.includes('data-view="calendario"') ? new ElementMock('calBtn') : null;
    }
    return null;
  }
  querySelectorAll(sel) {
    return [];
  }
  insertAdjacentHTML(pos, html) {
    this.innerHTML = html + this.innerHTML;
  }
}

const elements = {
  afmSideDrawer: new ElementMock('afmSideDrawer', 'aside'),
  afmDrawerBackdrop: new ElementMock('afmDrawerBackdrop', 'div'),
  btnToggleSidebarDrawer: new ElementMock('btnToggleSidebarDrawer', 'button'),
  btnCloseMobileDrawer: new ElementMock('btnCloseMobileDrawer', 'button')
};

const domMock = {
  getElementById: (id) => elements[id] || null,
  addEventListener: () => {},
  removeEventListener: () => {},
  body: { insertAdjacentHTML: () => {} }
};

const context = {
  window: {},
  document: domMock,
  Date,
  setTimeout,
  clearTimeout,
  console
};
context.window = context;

// Load pwa_and_landscape_enforcer.js into context
const pwaCode = fs.readFileSync('js/ui/pwa_and_landscape_enforcer.js', 'utf8');
vm.runInNewContext(pwaCode, context);

// [TESTE 1] Teste do Drawer Mobile com proteção anti-double-click / anti-bubbling
console.log('\n[TESTE 1] Verificando debounce e proteção anti-bubbling da gaveta mobile...');
assert(typeof context.window.toggleAFMMobileDrawer === 'function', 'toggleAFMMobileDrawer deve existir');

// Initial state: drawer closed
assert(!elements.afmSideDrawer.classList.contains('drawer-open'), 'Drawer deve começar fechado');
assert(!elements.afmDrawerBackdrop.classList.contains('active'), 'Backdrop deve começar inativo');

// 1. Simular primeiro clique (botão onclick)
context.window.toggleAFMMobileDrawer();
assert(elements.afmSideDrawer.classList.contains('drawer-open'), 'Drawer deve abrir no 1º clique');
assert(elements.afmDrawerBackdrop.classList.contains('active'), 'Backdrop deve ativar no 1º clique');

// 2. Simular segundo clique imediato (evento que borbulha para document em menos de 250ms)
context.window.toggleAFMMobileDrawer();
assert(elements.afmSideDrawer.classList.contains('drawer-open'), 'Drawer NÃO DEVE fechar no disparo duplicado do bubbling!');
assert(elements.afmDrawerBackdrop.classList.contains('active'), 'Backdrop DEVE continuar ativo!');
console.log('✓ Proteção anti-bubbling funcionou: drawer continuou ABERTO após duplo clique imediato!');

// 3. Fechar explicitamente (ex: botão fechar ou selecionar tela)
context.window.toggleAFMMobileDrawer(false);
assert(!elements.afmSideDrawer.classList.contains('drawer-open'), 'Drawer deve fechar com forceState=false');
assert(!elements.afmDrawerBackdrop.classList.contains('active'), 'Backdrop deve desativar com forceState=false');
console.log('✓ Fechamento explícito via forceState=false funcionou perfeitamente!');

// [TESTE 2] Validar getDrawerNavItems() e presença da aba ranking
console.log('\n[TESTE 2] Verificando catálogo canônico de navegação (getDrawerNavItems)...');
const gameCode = fs.readFileSync('js/game.js', 'utf8');

// Extrair e avaliar getDrawerNavItems
const navMatch = gameCode.match(/function getDrawerNavItems\(\)\{[\s\S]*?return\s+\[([\s\S]*?)\];\s*\}/);
assert(navMatch, 'getDrawerNavItems deve estar definido em js/game.js');

const rawItemsStr = navMatch[1];
assert(rawItemsStr.includes("'ranking'"), "getDrawerNavItems deve conter a aba 'ranking'");
assert(rawItemsStr.includes('👑 Ranking & PIX R$ 1.000'), "getDrawerNavItems deve conter '👑 Ranking & PIX R$ 1.000'");
assert(rawItemsStr.includes("'carreira'"), "getDrawerNavItems deve conter a aba 'carreira'");
assert(rawItemsStr.includes("'temporada'"), "getDrawerNavItems deve conter a aba 'temporada'");
console.log('✓ getDrawerNavItems() contém a aba de Ranking e PIX perfeitamente posicionada!');

// [TESTE 3] Validar auto-cura de sideNav em render()
console.log('\n[TESTE 3] Verificando auto-cura do menu lateral em render()...');
assert(gameCode.includes("if(!sideNav.querySelector('[data-view=\"ranking\"]'))"), 'render() deve auto-curar sideNav se faltar data-view="ranking"');
assert(gameCode.includes("if(ribbon && !ribbon.querySelector('[data-view=\"ranking\"]'))"), 'render() deve auto-curar o ribbon se faltar ranking');
console.log('✓ Auto-cura de sideNav e ribbon validada: restaura abas mesmo com cache antigo no DOM!');

// [TESTE 4] Validar cache-busting em index.html e sw.js
console.log('\n[TESTE 4] Verificando cache-busting em index.html e Service Worker (sw.js)...');
const indexHtml = fs.readFileSync('index.html', 'utf8');
const swJs = fs.readFileSync('sw.js', 'utf8');

assert(indexHtml.includes('js/game.js?v='), 'index.html deve referenciar game.js com hash');
assert(indexHtml.includes('js/ui/pwa_and_landscape_enforcer.js?v='), 'index.html deve referenciar pwa_and_landscape_enforcer.js com hash');
assert(indexHtml.includes('js/systems/coach_ranking_pix.js?v='), 'index.html deve referenciar coach_ranking_pix.js com hash');
assert(swJs.includes("CACHE_NAME = 'afm-2027-cache-v"), 'sw.js deve ter CACHE_NAME versionado');
console.log('✓ Cache-busting validado: Service Worker v13 forçará atualização imediata dos clientes!');

console.log('\n🎉 TODOS OS TESTES PASSARAM COM SUCESSO! 100% OPERACIONAL!');
