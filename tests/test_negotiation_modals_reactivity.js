const assert = require('assert');

// Clean DOM Registry for Mock
const elementsById = {};
const elementsByClass = {};

class MockElement {
  constructor(tag = 'div') {
    this.tagName = tag.toUpperCase();
    this.children = [];
    this.style = {};
    this.dataset = {};
    this.classList = {
      add: () => {},
      remove: () => {},
      contains: () => false
    };
    this._innerHTML = '';
    this.textContent = '';
    this.value = '';
    this.onclick = null;
    this.oninput = null;
    this.disabled = false;
  }

  get id() {
    return this._id;
  }

  set id(val) {
    this._id = val;
    elementsById[val] = this;
  }

  get innerHTML() {
    return this._innerHTML;
  }

  set innerHTML(html) {
    this._innerHTML = html;
    
    // Parse IDs
    const idRegex = /id="([^"]+)"/g;
    let match;
    while ((match = idRegex.exec(html)) !== null) {
      if (!elementsById[match[1]]) {
        const el = new MockElement();
        el.id = match[1];
      }
    }

    // Parse classes and buttons
    const btnRegex = /<button[^>]*class="([^"]+)"[^>]*>/g;
    while ((match = btnRegex.exec(html)) !== null) {
      const fullTag = match[0];
      const classes = match[1].split(/\s+/);
      const el = new MockElement('button');
      
      const dataRegex = /data-([a-zA-Z0-9_-]+)="([^"]*)"/g;
      let dMatch;
      while ((dMatch = dataRegex.exec(fullTag)) !== null) {
        el.dataset[dMatch[1]] = dMatch[2];
      }

      classes.forEach(cls => {
        if (!elementsByClass[cls]) elementsByClass[cls] = [];
        elementsByClass[cls].push(el);
      });
    }

    // Parse motive cards
    const divRegex = /<div[^>]*class="([^"]+)"[^>]*>/g;
    while ((match = divRegex.exec(html)) !== null) {
      const fullTag = match[0];
      const classes = match[1].split(/\s+/);
      const el = new MockElement('div');
      
      const dataRegex = /data-([a-zA-Z0-9_-]+)="([^"]*)"/g;
      let dMatch;
      while ((dMatch = dataRegex.exec(fullTag)) !== null) {
        el.dataset[dMatch[1]] = dMatch[2];
      }

      classes.forEach(cls => {
        if (!elementsByClass[cls]) elementsByClass[cls] = [];
        elementsByClass[cls].push(el);
      });
    }
  }

  querySelector(sel) {
    if (sel.startsWith('#')) return elementsById[sel.slice(1)] || null;
    if (sel.startsWith('.')) return (elementsByClass[sel.slice(1)] || [])[0] || null;
    return null;
  }

  querySelectorAll(sel) {
    if (sel.startsWith('.')) return elementsByClass[sel.slice(1)] || [];
    return [];
  }

  appendChild(child) {
    this.children.push(child);
  }

  remove() {
    if (this.id && elementsById[this.id]) {
      delete elementsById[this.id];
    }
  }

  addEventListener(ev, fn) {
    if (ev === 'click') this.onclick = fn;
    if (ev === 'input') this.oninput = fn;
  }
}

global.window = global;
global.window.addEventListener = () => {};
const rootDoc = new MockElement('body');
global.document = {
  body: rootDoc,
  createElement: (tag) => new MockElement(tag),
  getElementById: (id) => elementsById[id] || null,
  querySelector: (sel) => rootDoc.querySelector(sel),
  querySelectorAll: (sel) => rootDoc.querySelectorAll(sel),
  addEventListener: () => {}
};

// Load code
require('../js/competitions.js');
require('../js/player/player_career_engine.js');
require('../js/player/player_mode_ui.js');

console.log('--- TEST 1: Modais de Negociação Reativos e Funções Exportadas/Internas ---');

// Mock state
const mockState = {
  gameMode: 'player',
  season: 2026,
  date: '2026-01-15',
  club: 'Real Brasília',
  controlledPlayerId: 'p_10',
  squad: [
    {
      id: 'p_10',
      name: 'Diogenes Aquino',
      age: 20,
      overall: 55,
      wage: 2000,
      contractUntil: 2028,
      pos: 'ST'
    }
  ],
  playerCareerState: {
    athleteName: 'Diogenes Aquino',
    age: 20,
    managerTrust: 50,
    actionRequests: {}
  }
};

const athlete = mockState.squad[0];
const pState = mockState.playerCareerState;

// Test Wage Negotiation Modal (Young vs Veteran reactivity)
console.log('1.1 Testando Modal: Pedir Aumento & Renovação...');

// Test wage calculation logic for young athlete (< 28)
{
  athlete.age = 20;
  pState.age = 20;
  window.AFM_PlayerMode.openWageNegotiationModal(mockState, athlete, pState);
  
  const valEl = document.getElementById('txtWageChanceVal');
  const barEl = document.getElementById('barWageVisual');
  assert(valEl !== null, 'Texto de porcentagem de aprovação salarial deve existir');
  assert(barEl !== null, 'Barra visual de aprovação salarial deve existir');

  const durButtons = elementsByClass['btn-until-year'] || [];
  assert(durButtons.length >= 4, `Esperado pelo menos 4 botões de duração de contrato, encontrado ${durButtons.length}`);
  
  // Test clicking +1 ano vs +4 anos
  durButtons[0].onclick();
  const chance1Year = parseInt(valEl.textContent);
  assert(!isNaN(chance1Year), 'Chance não pode ser NaN');
  assert(chance1Year >= 5 && chance1Year <= 100, `Chance deve estar entre 5% e 100%, recebido ${chance1Year}`);

  durButtons[3].onclick();
  const chance4Years = parseInt(valEl.textContent);
  assert(!isNaN(chance4Years), 'Chance não pode ser NaN');
  assert(chance4Years >= 5 && chance4Years <= 100, `Chance deve estar entre 5% e 100%, recebido ${chance4Years}`);

  // For young player, 4-year contract should have higher approval than 1-year contract (asset security)
  assert(chance4Years > chance1Year, `Para jovem atleta, contrato de 4 anos (${chance4Years}%) deve ter maior aprovação que 1 ano (${chance1Year}%)`);
  console.log(`✓ Jovem (20 anos): +1 ano = ${chance1Year}%, +4 anos = ${chance4Years}% (Reatividade confirmada)`);
}

// Test wage calculation logic for veteran athlete (30+)
{
  athlete.age = 34;
  pState.age = 34;
  // Reset classes for fresh render
  elementsByClass['btn-until-year'] = [];
  window.AFM_PlayerMode.openWageNegotiationModal(mockState, athlete, pState);

  const valEl = document.getElementById('txtWageChanceVal');
  const durButtons = elementsByClass['btn-until-year'] || [];

  durButtons[0].onclick();
  const chance1YearVet = parseInt(valEl.textContent);

  durButtons[3].onclick();
  const chance4YearsVet = parseInt(valEl.textContent);

  // For veteran player (34yo), 1-year contract should have higher approval than 4-year contract (decline risk)
  assert(chance1YearVet > chance4YearsVet, `Para veterano (34 anos), contrato de 1 ano (${chance1YearVet}%) deve ter maior aprovação que 4 anos (${chance4YearsVet}%)`);
  console.log(`✓ Veterano (34 anos): +1 ano = ${chance1YearVet}%, +4 anos = ${chance4YearsVet}% (Risco de declínio respeitado)`);
}

console.log('1.2 Testando Modal: Solicitar Empréstimo...');
{
  athlete.age = 21;
  pState.age = 21;
  elementsByClass['btn-loan-split'] = [];
  elementsByClass['btn-loan-tier'] = [];
  window.AFM_PlayerMode.openRequestLoanModal(mockState, athlete, pState);

  const valEl = document.getElementById('txtLoanChanceVal');
  const barEl = document.getElementById('barLoanVisual');
  const descEl = document.getElementById('descLoanText');
  assert(valEl !== null, 'Texto de porcentagem do empréstimo deve existir');
  assert(barEl !== null, 'Barra visual do empréstimo deve existir');
  assert(descEl !== null, 'Texto de descrição do empréstimo deve existir');

  const splitButtons = elementsByClass['btn-loan-split'] || [];
  assert(splitButtons.length >= 2, 'Devem existir 2 botões de divisão salarial');

  // Click 50/50
  splitButtons[0].onclick();
  const chance50 = parseInt(valEl.textContent);

  // Click 100% Destino
  splitButtons[1].onclick();
  const chance100 = parseInt(valEl.textContent);

  assert(!isNaN(chance50) && !isNaN(chance100), 'Chances não podem ser NaN');
  assert(chance100 > chance50, `100% Clube Destino (${chance100}%) deve ter aprovação significativamente maior que 50/50 (${chance50}%)`);
  assert(descEl.innerHTML.includes('100% dos salários') || descEl.innerHTML.includes('aliviando a folha'), 'Texto deve refletir a escolha de alívio salarial');
  console.log(`✓ Empréstimo: 50/50 = ${chance50}%, 100% Destino = ${chance100}% (Reatividade salarial confirmada)`);
}

console.log('1.3 Testando Modal: Solicitar Transferência...');
{
  elementsByClass['card-transfer-motive'] = [];
  window.AFM_PlayerMode.openRequestTransferModal(mockState, athlete, pState);

  const valEl = document.getElementById('txtTransferResVal');
  const barEl = document.getElementById('barTransferVisual');
  const descEl = document.getElementById('descTransferText');
  assert(valEl !== null, 'Texto de resistência à transferência deve existir');
  assert(barEl !== null, 'Barra de resistência à transferência deve existir');
  assert(descEl !== null, 'Texto descritivo de resistência à transferência deve existir');

  const motiveCards = elementsByClass['card-transfer-motive'] || [];
  assert(motiveCards.length >= 3, 'Devem existir 3 cartões de motivo');

  // Motive: divergence (relação desgastada)
  motiveCards[2].onclick();
  const resDivergence = parseInt(valEl.textContent);

  // Motive: salary (valorização salarial)
  motiveCards[1].onclick();
  const resSalary = parseInt(valEl.textContent);

  assert(!isNaN(resDivergence) && !isNaN(resSalary), 'Resistência não pode ser NaN');
  assert(resDivergence < resSalary, `Relação desgastada (${resDivergence}%) deve diminuir a resistência à venda em relação a pedido salarial (${resSalary}%)`);
  console.log(`✓ Transferência: Desgaste = ${resDivergence}%, Salarial = ${resSalary}% (Reatividade de motivos confirmada)`);
}

console.log('🎉 TODOS OS TESTES DE REATIVIDADE DOS MODAIS PASSARAM COM SUCESSO! 🎉');
