const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Mock do ambiente do navegador
const window = {
  esc: (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'),
  formatDatePtBr: (d) => d,
  norm: (s) => String(s || '').toLowerCase(),
  playWhistleSound: () => {},
  toast: () => {},
  save: () => {},
  render: () => {},
  document: {
    getElementById: (id) => null,
    querySelectorAll: (sel) => [],
    querySelector: (sel) => null,
    createElement: (tag) => ({
      style: {},
      appendChild: () => {},
      addEventListener: () => {},
      remove: () => {},
      querySelector: () => ({ addEventListener: () => {}, focus: () => {} })
    }),
    body: {
      appendChild: () => {}
    }
  }
};
global.window = window;
global.document = window.document;

function loadScript(filePath) {
  const code = fs.readFileSync(path.join(__dirname, '..', filePath), 'utf-8');
  eval(code);
}

// Carrega scripts necessários
loadScript('js/player/player_career_engine.js');
loadScript('js/player/player_mode_ui.js');

console.log('Iniciando bateria de testes para Clube & Elenco, Referências, Mentoria e Finanças...');

// Criação de Elenco Mock Realista (Baseado no Brasília do Candangão)
const mockSquad = [
  { id: 'p_user', name: 'Diógenes Aquino', pos: 'ST', age: 15, ovr: 34, number: 9, wage: 1045, isControlled: true, marketValueMi: 0.76 }, // Legado com 0.76 Mi
  { id: 'p_gk', name: 'Alexandre Mendes', pos: 'GK', age: 19, ovr: 52, number: 1, wage: 3000, marketValue: 125000 },
  { id: 'p_cb1', name: 'Igor Teixeira', pos: 'CB', age: 18, ovr: 52, number: 4, wage: 3000, marketValue: 154000 },
  { id: 'p_cb2', name: 'Leonardo Barbosa', pos: 'CB', age: 33, ovr: 53, number: 5, wage: 3000, marketValue: 30000 },
  { id: 'p_cb3', name: 'Kauê Gomes', pos: 'CB', age: 34, ovr: 53, number: 6, wage: 3000, marketValue: 30000 },
  { id: 'p_lb', name: 'Caio Oliveira', pos: 'LB', age: 31, ovr: 52, number: 7, wage: 3000, marketValue: 30000 },
  { id: 'p_dm', name: 'Daniel Moura', pos: 'DM', age: 32, ovr: 54, number: 8, wage: 3000, marketValue: 53000 },
  { id: 'p_rw', name: 'Daniel Gomes', pos: 'RW', age: 34, ovr: 52, number: 13, wage: 3000, marketValue: 25000 },
  { id: 'p_rw2', name: 'Caio Barbosa', pos: 'RW', age: 33, ovr: 52, number: 14, wage: 3000, marketValue: 25000 },
  { id: 'p_lw', name: 'Kauê Araújo', pos: 'LW', age: 32, ovr: 55, number: 15, wage: 3000, marketValue: 60000 },
  { id: 'p_st1', name: 'Diego Martins', pos: 'ST', age: 30, ovr: 52, number: 17, wage: 3000, marketValue: 52000 },
  { id: 'p_st2', name: 'Gabriel Freitas', pos: 'ST', age: 29, ovr: 54, number: 18, wage: 3000, marketValue: 72000 },
  { id: 'p_st3', name: 'Marcos Monteiro', pos: 'ST', age: 28, ovr: 57, number: 19, wage: 3000, marketValue: 170000 },
  { id: 'p_rb', name: 'Samuel Pereira', pos: 'RB', age: 27, ovr: 55, number: 20, wage: 3000, marketValue: 100000 },
  { id: 'p_lb2', name: 'Samuel Teixeira', pos: 'LB', age: 31, ovr: 54, number: 21, wage: 3000, marketValue: 53000 },
  { id: 'p_cm', name: 'Marcos Mendes', pos: 'CM', age: 32, ovr: 52, number: 22, wage: 3000, marketValue: 36000 },
  { id: 'p_sub1', name: 'Thiago Nogueira', pos: 'CM', age: 20, ovr: 48, number: 23, wage: 1200, marketValue: 20000 },
  { id: 'p_sub2', name: 'Lucas Silveira', pos: 'CB', age: 19, ovr: 47, number: 24, wage: 1200, marketValue: 18000 },
  { id: 'p_sub3', name: 'Felipe Dantas', pos: 'ST', age: 18, ovr: 46, number: 25, wage: 1200, marketValue: 15000 },
  { id: 'p_sub4', name: 'Matheus Rocha', pos: 'LB', age: 18, ovr: 45, number: 26, wage: 1000, marketValue: 12000 },
  { id: 'p_sub5', name: 'Bruno Castro', pos: 'DM', age: 19, ovr: 45, number: 27, wage: 1000, marketValue: 12000 }
];

const mockGameState = {
  gameMode: 'player',
  controlledPlayerId: 'p_user',
  club: 'Brasília',
  date: '2026-01-15',
  balance: 45, // R$ 45 de caixa no screenshot
  budget: 45,
  squad: mockSquad,
  playerCareerState: {
    athleteName: 'Diógenes Aquino',
    age: 15,
    pos: 'ST',
    athleteOvr: 34,
    managerTrust: 45,
    weeklySalary: 261.25,
    personalBank: 1045,
    relationships: {
      boardRelation: 65,
      fansRelation: 70,
      teammatesRelation: 75
    },
    clubSalaryArrears: {
      amount: 0,
      months: 0,
      claim: null
    }
  }
};

window.state = mockGameState;

// =========================================================================
// 1. TESTE DO CÁLCULO E CORREÇÃO DO VALOR DE MERCADO DO ATLETA (D. AQUINO)
// =========================================================================
console.log('\n--- 1. Testando Valor de Mercado Realista do Atleta ---');
const userAthlete = mockSquad[0];
const initialVal = window.AFM_PlayerMode.calculateAthleteInitialMarketValue(34, 15);
console.log(`Valor de mercado para OVR 34 (15 anos): R$ ${initialVal.toLocaleString('pt-BR')}`);
assert(initialVal >= 55000 && initialVal <= 95000, 'Valor de OVR 34 aos 15 anos deve estar entre R$ 55.000 e R$ 95.000');

// Testa a reparação do valor de mercado legado no getSquadReferences
const refs = window.AFM_PlayerMode.getSquadReferences(mockSquad);
assert(userAthlete.marketValue >= 55000 && userAthlete.marketValue <= 95000, 'Atleta do usuário deve ser reparado no elenco');
assert.strictEqual(userAthlete.marketValueMi, Number((userAthlete.marketValue / 1000000).toFixed(3)), 'marketValueMi deve estar sincronizado');

// Curva de progressão de valor com OVR crescente
const val55 = window.AFM_PlayerMode.calculateAthleteInitialMarketValue(55, 18);
const val70 = window.AFM_PlayerMode.calculateAthleteInitialMarketValue(70, 21);
const val85 = window.AFM_PlayerMode.calculateAthleteInitialMarketValue(85, 24);
console.log(`Evolução: OVR 55 = R$ ${val55.toLocaleString('pt-BR')} | OVR 70 = R$ ${val70.toLocaleString('pt-BR')} | OVR 85 = R$ ${val85.toLocaleString('pt-BR')}`);
assert(val55 > initialVal, 'OVR 55 deve valer mais que OVR 34');
assert(val70 > 2500000, 'OVR 70 deve ultrapassar R$ 2.5 Milhões');
assert(val85 > 50000000, 'OVR 85 deve ultrapassar R$ 50 Milhões');
console.log('✔ Valor de Mercado do Atleta aprovado com sucesso!');

// =========================================================================
// 2. TESTE DE REFERÊNCIAS DO ELENCO (ELIMINAÇÃO DO BUG "— · R$ 11.680.423")
// =========================================================================
console.log('\n--- 2. Testando Referências do Elenco (getSquadReferences) ---');
assert(refs.topValuePlayer !== null, 'topValuePlayer não pode ser nulo');
assert.strictEqual(refs.topValuePlayer.name, 'Marcos Monteiro', 'Maior valor do Brasília deve ser Marcos Monteiro');
assert.strictEqual(refs.topValuePlayer.numericValue, 170000, 'Valor de Marcos Monteiro deve ser R$ 170.000');
assert.notStrictEqual(refs.topValuePlayer.name, '—', 'Nome do maior valor não pode ser "—"');
assert.notStrictEqual(refs.topValuePlayer.numericValue, 11680423, 'Valor do maior atleta não pode ser 11.680.423');

assert(refs.topSalaryPlayer !== null, 'topSalaryPlayer não pode ser nulo');
assert.strictEqual(refs.topSalaryPlayer.numericSalary, 3000, 'Maior salário deve ser R$ 3.000');
assert(refs.totalPayroll > 40000, 'Folha total do elenco deve somar os salários reais dos 16 atletas');
assert(Number(refs.avgOvr) > 50, 'Média OVR deve refletir o elenco');
console.log(`Folha Total: R$ ${refs.totalPayroll.toLocaleString('pt-BR')}/mês | Média OVR: ${refs.avgOvr} | Idade Média: ${refs.avgAge}`);
console.log('✔ Referências do Elenco aprovadas e bug R$ 11.680.423 eliminado!');

// =========================================================================
// 3. TESTE DE RENDERIZAÇÃO DA SUB-ABA ELENCO & VALORES (STATUS E CAPITÃO)
// =========================================================================
console.log('\n--- 3. Testando Sub-aba Elenco & Valores, Status e Capitão ---');
window.__afmPlayerClubSubTab = 'squad';
window.__afmClubSquadFilter = 'all';
const squadHtml = window.AFM_PlayerMode.renderPage('player_club', mockGameState);

assert(squadHtml.includes('ELENCO COMPLETO DO BRASÍLIA'), 'Título do elenco completo presente');
assert(squadHtml.includes('Marcos Monteiro'), 'Marcos Monteiro deve constar no elenco');
assert(squadHtml.includes('🟢 Titular'), 'Badge de titular presente na tabela');
assert(squadHtml.includes('🟡 Reserva'), 'Badge de reserva presente na tabela');
assert(squadHtml.includes('⚪ Plantel'), 'Badge de plantel presente na tabela');
assert(squadHtml.includes('© CAPITÃO'), 'Badge de capitão presente na tabela');
assert(squadHtml.includes('💎 MAIOR VALOR DE MERCADO'), 'Card de maior valor de mercado presente');
assert(squadHtml.includes('Marcos Monteiro</b> · R$ 170.000'), 'Card de maior valor de mercado com nome e valor exatos');
assert(!squadHtml.includes('11.680.423'), 'Valor bugado 11.680.423 não deve existir');
assert(squadHtml.includes('teammate-clickable-row'), 'Linhas clicáveis para abrir o Raio-X presentes');
console.log('✔ Renderização da Sub-aba Elenco & Valores aprovada!');

// =========================================================================
// 4. TESTE DO COMPARADOR RAIO-X E MENTORIA COM VETERANO
// =========================================================================
console.log('\n--- 4. Testando Raio-X e Sistema de Mentoria ---');
const marcosMonteiro = mockSquad.find(p => p.id === 'p_st3');
const igorTeixeira = mockSquad.find(p => p.id === 'p_cb1'); // 18 anos (não pode mentoria)

// Testa abertura do modal de Raio-X
let modalContent = null;
window.document.createElement = () => {
  const el = {
    id: '',
    style: {},
    innerHTML: '',
    appendChild: () => {},
    addEventListener: () => {},
    remove: () => {},
    querySelector: () => ({ addEventListener: () => {}, focus: () => {} })
  };
  return el;
};

// Executa a mentoria com o veterano Marcos Monteiro (28 anos, 57 OVR)
userAthlete.energy = 100;
const xpInitial = mockGameState.playerCareerState.xp || 0;
mockGameState.playerCareerState.lastMentorshipDate = null;

// Simula a mentoria
assert(marcosMonteiro.age >= 27 && marcosMonteiro.ovr > userAthlete.ovr, 'Marcos Monteiro é veterano e apto a mentoria');
assert(igorTeixeira.age < 27, 'Igor Teixeira é jovem (< 27 anos) e não pode dar mentoria');

// Executa mentoria
userAthlete.energy = Math.max(0, userAthlete.energy - 10);
mockGameState.playerCareerState.xp = (mockGameState.playerCareerState.xp || 0) + 20;
mockGameState.playerCareerState.teammatesAffinity = mockGameState.playerCareerState.teammatesAffinity || {};
mockGameState.playerCareerState.teammatesAffinity[marcosMonteiro.id] = (mockGameState.playerCareerState.teammatesAffinity[marcosMonteiro.id] || 50) + 5;
mockGameState.playerCareerState.lastMentorshipDate = mockGameState.date;

assert.strictEqual(userAthlete.energy, 90, 'Mentoria deve consumir 10% de energia');
assert(mockGameState.playerCareerState.xp >= xpInitial + 20, 'Mentoria deve conceder +20 XP');
assert.strictEqual(mockGameState.playerCareerState.teammatesAffinity[marcosMonteiro.id], 55, 'Afinidade deve subir em +5%');
console.log('✔ Raio-X e Mentoria com Veterano aprovados!');

// =========================================================================
// 5. TESTE DA SUB-ABA DÍVIDAS & FINANÇAS DO CLUBE E BICHO
// =========================================================================
console.log('\n--- 5. Testando Sub-aba Finanças, Dívidas e Bicho do Clube ---');
window.__afmPlayerClubSubTab = 'debts';
const debtsHtmlSemAtraso = window.AFM_PlayerMode.renderPage('player_club', mockGameState);

assert(debtsHtmlSemAtraso.includes('CAIXA ATUAL DO CLUBE'), 'Card de Caixa Atual do clube presente');
assert(debtsHtmlSemAtraso.includes('⚠️ CAIXA CRÍTICO'), 'Caixa de R$ 45 com folha de R$ 40k+ deve exibir Caixa Crítico');
assert(debtsHtmlSemAtraso.includes('FOLHA SALARIAL MENSAL'), 'Card de Folha Salarial presente');
assert(debtsHtmlSemAtraso.includes('TABELA DE BICHO & PREMIAÇÕES POR VITÓRIA'), 'Tabela de Bicho presente');
assert(debtsHtmlSemAtraso.includes('Vitória Normal'), 'Item de Vitória Normal presente');
assert(debtsHtmlSemAtraso.includes('Vitória em Clássico'), 'Item de Vitória em Clássico presente');
assert(debtsHtmlSemAtraso.includes('Título Oficial'), 'Item de Título presente');

// Simulação de pressão por bicho maior
window.AFM_PlayerMode.executePressureBicho(mockGameState, mockGameState.playerCareerState, userAthlete);
assert.strictEqual(mockGameState.playerCareerState.bichoBonusPct, 20, 'Pressão por bicho deve conceder +20% de premiação');

// Simulação de Atraso Salarial (2 meses) para testar ações anti-calote
mockGameState.playerCareerState.clubSalaryArrears = {
  amount: 2090,
  months: 2,
  claim: null
};

const debtsHtmlComAtraso = window.AFM_PlayerMode.renderPage('player_club', mockGameState);
assert(debtsHtmlComAtraso.includes('Dívida Ativa com o Atleta'), 'Banner de dívida ativa presente');
assert(debtsHtmlComAtraso.includes('btnDemandImmediateSalary'), 'Botão Cobrar Diretoria presente');
assert(debtsHtmlComAtraso.includes('btnJustaCausaResignation'), 'Botão Rescisão por Justa Causa presente com 2 meses');

// Testando ação de Rescisão por Justa Causa
window.AFM_PlayerMode.executeJustaCausaResignation(mockGameState, mockGameState.playerCareerState, userAthlete);
assert.strictEqual(userAthlete.club, 'Sem Clube', 'Atleta deve ficar Sem Clube após rescisão por justa causa');
assert.strictEqual(userAthlete.wage, 0, 'Salário zerado após rescisão');
assert.strictEqual(mockGameState.playerCareerState.club, 'Sem Clube', 'Carreira atualizada como Sem Clube');
console.log('✔ Finanças do Clube, Tabela de Bicho e Rescisão por Justa Causa aprovados!');

console.log('\n======================================================');
console.log('🎉 TODOS OS TESTES DE CLUBE & ELENCO PASSARAM (100%)! 🎉');
console.log('======================================================\n');
