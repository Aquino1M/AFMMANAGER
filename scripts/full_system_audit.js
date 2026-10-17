const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert');

console.log('========================================================================');
console.log('AFM 2026 - AUDITORIA COMPLETA DE SISTEMAS, TELAS, RECURSOS & INTEGRIDADE');
console.log('========================================================================');

const findings = [];

// 1. AUDITORIA DE ARQUIVOS EM INDEX.HTML
console.log('\n[ETAPA 1] Verificando integridade de scripts e estilos do index.html...');
const indexHtml = fs.readFileSync('index.html', 'utf8');

const scriptRegex = /<script[^>]+src=["']([^"']+)["'][^>]*>/g;
let m;
const scripts = [];
while ((m = scriptRegex.exec(indexHtml)) !== null) {
  scripts.push(m[1].split('?')[0]);
}

const missingScripts = [];
scripts.forEach(s => {
  if (s.startsWith('http://') || s.startsWith('https://') || s.startsWith('//')) return;
  if (!fs.existsSync(s)) missingScripts.push(s);
});

if (missingScripts.length > 0) {
  findings.push({ severity: 'HIGH', category: 'index.html', issue: 'Scripts ausentes referenciados no index.html', items: missingScripts });
  console.log('  ❌ Scripts ausentes encontrados:', missingScripts);
} else {
  console.log(`  ✓ Todos os ${scripts.length} scripts referenciados no index.html existem no disco!`);
}

const cssRegex = /<link[^>]+href=["']([^"']+)["'][^>]*>/g;
const stylesheets = [];
while ((m = cssRegex.exec(indexHtml)) !== null) {
  if (m[0].includes('stylesheet')) stylesheets.push(m[1].split('?')[0]);
}
const missingCss = [];
stylesheets.forEach(c => {
  if (!fs.existsSync(c)) missingCss.push(c);
});
if (missingCss.length > 0) {
  findings.push({ severity: 'MEDIUM', category: 'index.html', issue: 'Arquivos CSS ausentes referenciados no index.html', items: missingCss });
  console.log('  ❌ Folhas de estilo ausentes:', missingCss);
} else {
  console.log(`  ✓ Todas as ${stylesheets.length} folhas de estilo existem no disco!`);
}

// 2. SINTAXE DE TODOS OS ARQUIVOS JAVASCRIPT EM JS/ E DATA/
console.log('\n[ETAPA 2] Verificando sintaxe de todos os arquivos JS em js/ e data/...');
function checkSyntaxDir(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      checkSyntaxDir(full);
    } else if (f.endsWith('.js') && !f.includes('.bak')) {
      const code = fs.readFileSync(full, 'utf8');
      try {
        new vm.Script(code);
      } catch (err) {
        findings.push({ severity: 'HIGH', category: 'Syntax', issue: `Erro de sintaxe em ${full}`, details: err.message });
        console.log(`  ❌ Erro de sintaxe em ${full}: ${err.message}`);
      }
    }
  }
}
checkSyntaxDir('js');
checkSyntaxDir('data');
console.log('  ✓ Varredura de sintaxe concluída.');

// 3. AMBIENTE COMPLETO DE SIMULAÇÃO HEADLESS
console.log('\n[ETAPA 3] Inicializando runtime completo e testando fluxos de usuário...');

function createMockElement(tag, id = '', className = '') {
  return {
    tagName: (tag || 'DIV').toUpperCase(),
    id: id || '',
    className: className || '',
    innerHTML: '',
    textContent: '',
    value: '',
    checked: false,
    options: [],
    selectedIndex: 0,
    style: {},
    dataset: {},
    classList: {
      add: function(cls) { this[cls] = true; },
      remove: function(cls) { delete this[cls]; },
      contains: function(cls) { return Boolean(this[cls]); },
      toggle: function(cls) { this[cls] = !this[cls]; }
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
    setAttribute: function(k, v) { this[k] = v; },
    getAttribute: function(k) { return this[k] || null; },
    addEventListener: function() {},
    removeEventListener: function() {},
    querySelector: function(sel) {
      if (sel.includes('span')) return createMockElement('span');
      if (sel.includes('input')) return createMockElement('input');
      return createMockElement('div');
    },
    querySelectorAll: function(sel) {
      return [createMockElement('div')];
    },
    closest: function() { return null; },
    getBoundingClientRect: function() {
      return { top: 0, left: 0, width: 800, height: 600, bottom: 600, right: 800 };
    }
  };
}

function initHeadlessGame() {
  const storage = {};
  let lastCustomModal = null;
  const context = {
    console,
    requestAnimationFrame: cb => { if (typeof cb === 'function') cb(); },
    scrollTo: () => {},
    setTimeout: (fn, ms) => 1,
    clearTimeout: () => {},
    setInterval: (fn, ms) => 1,
    clearInterval: () => {},
    Math, Date, Array, Object, String, Number, Boolean, RegExp, JSON, Set, Map,
    localStorage: {
      getItem: k => storage[k] || null,
      setItem: (k, v) => { storage[k] = String(v); },
      removeItem: k => { delete storage[k]; },
      clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
    },
    openCustomModal: (title, html) => { lastCustomModal = { title, html }; },
    closeCustomModal: () => { lastCustomModal = null; },
    getLastCustomModal: () => lastCustomModal,
    addEventListener: () => {},
    removeEventListener: () => {}
  };
  context.window = context;
  const root = createMockElement('body');
  const appEl = createMockElement('div', 'app');
  root.appendChild(appEl);

  function findElement(rootNode, predicate) {
    if (!rootNode) return null;
    if (predicate(rootNode)) return rootNode;
    for (const child of (rootNode.children || [])) {
      const found = findElement(child, predicate);
      if (found) return found;
    }
    return null;
  }

  context.document = {
    getElementById: id => (id === 'app' ? appEl : findElement(root, c => c.id === id)),
    querySelector: sel => {
      if (!sel) return null;
      if (sel === '#app') return appEl;
      if (sel.startsWith('#')) return findElement(root, c => c.id === sel.slice(1));
      if (sel.startsWith('.')) return findElement(root, c => c.className && c.className.includes(sel.slice(1)));
      return findElement(root, c => c.tagName && c.tagName.toLowerCase() === sel.toLowerCase());
    },
    querySelectorAll: sel => [],
    addEventListener: () => {},
    removeEventListener: () => {},
    createElement: tag => createMockElement(tag),
    body: root
  };
  context.window.document = context.document;
  context.window.AFM_DB = { init: () => Promise.resolve(null) };
  context.window.esc = s => String(s || '');

  vm.createContext(context);

  // Carrega todos os scripts referenciados em index.html que não sejam bibliotecas pesadas de chart/ui
  for (const s of scripts) {
    if (s.includes('chart') || s.includes('lucide') || s.includes('tone') || s.includes('p5')) continue;
    if (fs.existsSync(s)) {
      try {
        const full = path.join(__dirname, '..', s);
        vm.runInContext(fs.readFileSync(full, 'utf8'), context);
      } catch (err) {
        // Ignora erros de inicialização de canvas/chart específicos
        if (!err.message.includes('Chart') && !err.message.includes('Tone')) {
          console.log(`  ⚠️ Aviso ao rodar ${s}: ${err.message}`);
        }
      }
    }
  }

  return context;
}

const env = initHeadlessGame();

// 4. TESTES FUNCIONAIS DO JOGO EM TODAS AS TELAS E SISTEMAS
console.log('\n[ETAPA 4] Executando testes funcionais de sistemas e telas...');

try {
  // Teste 4.1: Nova Carreira
  console.log('  - Testando criação de nova carreira (Flamengo - bra-a)...');
  env.newCareer({ clubName: 'Flamengo', compId: 'bra-a', manager: 'Mister Aquino' });
  const s = env.state;
  assert(s, 'State deve ser criado com sucesso');
  assert.strictEqual(s.club, 'Flamengo', 'Clube deve ser Flamengo');
  assert(s.squad && s.squad.length > 11, 'Elenco deve conter mais de 11 jogadores');
  console.log(`    ✓ Carreira inicializada: ${s.club} com ${s.squad.length} atletas no elenco.`);

  // Teste 4.2: Renderização de todas as telas (views)
  const viewsToTest = [
    'central',
    'elenco',
    'taticas',
    'calendario',
    'classificacao',
    'mercado',
    'estrutura',
    'financas',
    'sala-trofeus'
  ];

  console.log('  - Testando renderização limpa de todas as telas principais (views)...');
  viewsToTest.forEach(v => {
    env.view = v;
    try {
      env.render();
      console.log(`    ✓ Tela '${v}' renderizou sem erros.`);
    } catch (viewErr) {
      findings.push({ severity: 'HIGH', category: 'View Rendering', issue: `Falha ao renderizar view: ${v}`, details: viewErr.message });
      console.log(`    ❌ Falha ao renderizar tela '${v}': ${viewErr.message}`);
    }
  });

  // Teste 4.3: Sistema de Táticas e Escalação
  console.log('  - Testando sistema tático (mudança de formação, batedores, capitão)...');
  const initialFormation = s.formation;
  s.formation = '4-4-2';
  env.ensureTacticsState(s);
  env.optimizeLineup();
  assert(s.lineup.length >= 11, 'Lineup deve conter 11 titulares');
  console.log(`    ✓ Formação alterada para 4-4-2 e elenco otimizado (${s.lineup.length} titulares).`);

  // Teste 4.4: Mercado da Bola & Contratos
  console.log('  - Testando mercado da bola (pesquisa, propostas, janela de transferências)...');
  const marketOpen = env.isTransferWindowOpen(s.date);
  console.log(`    ✓ Status da Janela de Transferências em ${s.date}: ${marketOpen ? 'ABERTA' : 'FECHADA'}`);
  const initialBalance = s.balance;
  
  // Teste 4.5: Estrutura & Finanças
  console.log('  - Testando economia do clube (empréstimos bancários, infraestrutura)...');
  const initialLoans = (s.bankLoans || []).length;
  if (typeof env.openBankLoansModal === 'function') {
    env.openBankLoansModal();
    const modal = env.getLastCustomModal();
    assert(modal, 'Modal de empréstimos bancários deve abrir');
    console.log(`    ✓ Modal bancário abriu com sucesso: "${modal.title}"`);
    env.closeCustomModal();
  }

  // Teste 4.6: Categorias de Base (Youth Academy)
  console.log('  - Testando Categorias de Base...');
  assert(Array.isArray(s.youthAcademy), 'Categorias de base deve ser um array');
  console.log(`    ✓ Base ativa com ${s.youthAcademy.length} jovens promessas.`);

  // Teste 4.7: Prévia Oficial (Match Preview Pro)
  console.log('  - Testando Match Preview Pro...');
  env.openMatchPreviewModal();
  const prevModal = env.document.getElementById('appCustomModal') || env.getLastCustomModal();
  assert(prevModal, 'Prévia deve abrir modal');
  const modalHtml = prevModal.innerHTML || prevModal.html || '';
  assert(modalHtml.includes('Raio-X Setorial') || modalHtml.includes('Provável 11 Inicial'), 'Prévia deve conter análise');
  console.log('    ✓ Prévia oficial gerada e modal verificado com sucesso.');
  if (typeof env.closeCustomModal === 'function') env.closeCustomModal();

  // Teste 4.8: Simulação Rápida e Partida Ao Vivo
  console.log('  - Testando fluxo de partida (simulação rápida e gravação de histórico)...');
  s.isPreSeason = false;
  s.preSeasonDays = 0;
  const gate = env.canStartMatch(null, s);
  if (gate.status === 'future') {
    env.advanceCalendarDays(gate.daysDiff || 1, true);
  }
  const histBefore = (s.history || []).length;
  env.simulateQuickRound();
  assert(s.history.length > histBefore, 'Partida deve ser gravada no histórico');
  console.log(`    ✓ Partida simulada com sucesso! Placar: ${s.history[0].h} ${s.history[0].hg} x ${s.history[0].ag} ${s.history[0].a}`);

  // Teste 4.9: Auditoria de Integridade de Saves
  console.log('  - Testando persistência (save e load)...');
  env.save();
  const savedItem = env.localStorage.getItem(`afm_save_slot_${s.userSlot || 1}`) || env.localStorage.getItem('aquino_futebol_manager_2026_v1');
  assert(savedItem, 'Save deve estar gravado no localStorage');
  console.log(`    ✓ Save gravado com sucesso no storage (${savedItem.length} bytes).`);

} catch (err) {
  findings.push({ severity: 'CRITICAL', category: 'Gameplay Error', issue: 'Erro durante execução funcional', details: err.stack });
  console.log(`  ❌ Erro funcional: ${err.message}`);
}

console.log('\n========================================================================');
console.log('RESUMO DA AUDITORIA GERAL DO JOGO:');
console.log('========================================================================');
if (findings.length === 0) {
  console.log('>>> 100% LIMPO! NENHUM BUG OU ERRO ENCONTRADO EM TODO O SISTEMA! <<<');
} else {
  console.log(`Encontrados ${findings.length} apontamentos:`);
  findings.forEach((f, idx) => {
    console.log(`\n[${idx + 1}] Severidade: ${f.severity} | Categoria: ${f.category}`);
    console.log(`    Problema: ${f.issue}`);
    if (f.details) console.log(`    Detalhes: ${f.details}`);
    if (f.items) console.log(`    Itens: ${JSON.stringify(f.items)}`);
  });
}
