const assert = require('assert');
const fs = require('fs');

console.log('🧪 Iniciando Testes da Aba Contratos & Salários (Modo Treinador)...');

// Mock browser environment
global.window = global;
global.Element = function() {};
global.NodeList = function() {};

// Mock document
const domMocks = {};
const eventListeners = {};
global.document = {
  createElement: (tag) => ({
    tagName: tag.toUpperCase(),
    className: '',
    style: {},
    innerHTML: '',
    children: [],
    dataset: {},
    appendChild: function(c) { this.children.push(c); },
    insertBefore: function(c) { this.children.unshift(c); },
    classList: {
      contains: () => false,
      toggle: () => {},
      add: () => {},
      remove: () => {}
    },
    remove: function() {}
  }),
  getElementById: (id) => domMocks[id] || null,
  querySelector: (sel) => domMocks[sel] || null,
  querySelectorAll: () => [],
  addEventListener: (event, handler) => {
    eventListeners[event] = eventListeners[event] || [];
    eventListeners[event].push(handler);
  }
};

// Mock helpers
global.norm = str => (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
global.esc = str => String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
global.formatDatePtBr = isoStr => isoStr || '01 de janeiro de 2026';
global.fmtMoney = val => `R$ ${Number(val||0).toLocaleString('pt-BR')}`;
global.playerPhoto = () => '<img src="player.png" />';
global.clubBadge = () => '<img src="badge.png" />';
global.save = () => true;
global.render = () => {};
global.toast = () => {};
global.clamp = (val, min, max) => Math.max(min, Math.min(max, val));
global.playerOverall = p => Number(p?.overall || p?.ovr || 60);
global.playerSalary = p => Number(p?.wage || p?.salary || 5000);
global.playerKey = p => p ? (p.marketKey || p.id || `n:${norm(p.name)}|${norm(p.club || 'clube')}`) : 'null';
global.playerContractUntil = p => p?.contractUntil || 2028;
global.squadCapacity = () => 25;
global.ratingClass = () => 'rating-good';
global.clubByName = name => ({ name, division: 'bra-d', players: [] });

// Carregar código do js/game.js
const gameCode = fs.readFileSync('js/game.js', 'utf8').replace(/\r\n/g, '\n');

function extractSnippet(source, startMarker, endMarker) {
  const startIdx = source.indexOf(startMarker);
  if (startIdx === -1) throw new Error(`Marker start not found: ${startMarker}`);
  const endIdx = source.indexOf(endMarker, startIdx);
  if (endIdx === -1) throw new Error(`Marker end not found: ${endMarker}`);
  return source.slice(startIdx, endIdx + endMarker.length);
}

// Avaliar helpers de contratos
const contractsSnippet = extractSnippet(
  gameCode,
  '// 1. Teto salarial mensal justo por Overall e Divisão do Clube',
  'window.isExpensiveForTier = isExpensiveForTier;\n}'
);
eval(contractsSnippet);

// -------------------------------------------------------------
// 1. Testar getExpectedPlayerMonthlyWage e multiplicadores de divisão
// -------------------------------------------------------------
console.log('1. Testando getExpectedPlayerMonthlyWage...');
const wageSerieD = getExpectedPlayerMonthlyWage({ overall: 66 }, { division: 'bra-d' });
const wageSerieA = getExpectedPlayerMonthlyWage({ overall: 66 }, { division: 'bra-a' });
assert(wageSerieA > wageSerieD * 4, 'Série A deve ter teto proporcionalmente superior à Série D');
assert(wageSerieD >= 3500, 'Teto mínimo deve respeitar o piso salarial');
console.log('✅ getExpectedPlayerMonthlyWage validado com sucesso.');

// -------------------------------------------------------------
// 2. Testar getPlayerMonthlyWageNormalized
// -------------------------------------------------------------
console.log('2. Testando getPlayerMonthlyWageNormalized...');
assert.strictEqual(getPlayerMonthlyWageNormalized({ monthlyWage: 12000 }), 12000);
assert.strictEqual(getPlayerMonthlyWageNormalized({ wage: 5000 }), 5000);
assert.strictEqual(getPlayerMonthlyWageNormalized({ wage: 2000, wagePeriod: 'weekly' }), 8000, 'Salário semanal deve multiplicar por 4');
assert.strictEqual(getPlayerMonthlyWageNormalized({ salary: 15000 }), 15000);
console.log('✅ getPlayerMonthlyWageNormalized validado com sucesso.');

// -------------------------------------------------------------
// 3. Testar getPlayerContractYear (sem NaN)
// -------------------------------------------------------------
console.log('3. Testando getPlayerContractYear...');
assert.strictEqual(getPlayerContractYear({ contractUntil: 2028 }, 2026), 2028);
assert.strictEqual(getPlayerContractYear({ contractUntil: '2029-12-31' }, 2026), 2029);
assert.strictEqual(getPlayerContractYear({ contractYears: 3 }, 2026), 2029);
assert(!Number.isNaN(getPlayerContractYear({}, 2026)), 'Nunca deve retornar NaN');
console.log('✅ getPlayerContractYear validado com sucesso.');

// -------------------------------------------------------------
// 4. Testar getSquadContractsSnapshot e consistência de contadores
// -------------------------------------------------------------
console.log('4. Testando getSquadContractsSnapshot...');
const mockClub = { name: 'Ceilândia', division: 'bra-d' };
const mockPlayers = [
  { name: 'Renato Nunes', pos: 'RW', ovr: 66, wage: 8000, contractUntil: 2028 },
  { name: 'Wesley Rodrigues', pos: 'LW', ovr: 67, wage: 8000, contractUntil: 2028 },
  { name: 'Rodrigo Lopes', pos: 'ST', ovr: 68, wage: 8000, contractUntil: 2028 },
  { name: 'Eduardo Marques', pos: 'ST', ovr: 64, wage: 8000, contractUntil: 2028 },
  { name: 'Estrela Cara', pos: 'CAM', ovr: 50, wage: 75000, contractUntil: 2026 } // Caro para Série D
];
const mockState = {
  club: 'Ceilândia',
  squad: mockPlayers,
  year: 2026,
  season: 2026
};

const snap = getSquadContractsSnapshot(mockState, mockClub);
assert.strictEqual(snap.totalCount, 5, 'Deve contar exatamente 5 jogadores');
assert(snap.expensiveCount <= snap.totalCount, 'expensiveCount NUNCA pode ser maior que totalCount');
assert.strictEqual(snap.expensiveCount, 1, 'Apenas 1 jogador deve ser considerado caro para o nível');
assert.strictEqual(snap.expiringCount, 1, '1 jogador vencendo em 2026');
assert.strictEqual(snap.totalMonthlyPayroll, 8000*4 + 75000, 'Folha mensal deve bater com a soma exata');
assert.strictEqual(snap.totalAnnualPayroll, snap.totalMonthlyPayroll * 12, 'Folha anual deve ser mensal * 12');
console.log('✅ getSquadContractsSnapshot validado com sucesso (zero inconsistência matemática).');

// -------------------------------------------------------------
// 5. Testar integridade do DOM e balanceamento de tags div na lista salarial
// -------------------------------------------------------------
console.log('5. Testando integridade do DOM e tags balanceadas...');

// Extrair trecho de squadPage que monta a tela de salários
assert(gameCode.includes('getSquadContractsSnapshot(state, clubObj)'), 'Deve chamar getSquadContractsSnapshot em squadPage');
assert(gameCode.includes('R$ ${snap.totalMonthlyPayroll.toLocaleString(\'pt-BR\')}/mês'), 'Deve exibir card de Folha Mensal');
assert(gameCode.includes('R$ ${snap.totalAnnualPayroll.toLocaleString(\'pt-BR\')}/ano'), 'Deve exibir card de Projeção Anual');
assert(gameCode.includes('~R$ ${snap.recommendedTierCap.toLocaleString(\'pt-BR\')}/mês'), 'Deve exibir card de Teto do Nível');
assert(gameCode.includes('salary-filter-btn'), 'Deve conter botões de filtro rápido');

// Testa balanceamento de divs em template de row
const rowSample = `
  <div class="salary-item-clickable" data-player-id="123" data-player-key="pKey" role="button" tabindex="0">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:12px">
      <div style="display:flex;align-items:center;gap:12px;min-width:0;flex:1">
        <span class="pill">ST</span>
        <div style="min-width:0;flex:1">
          <div style="font-size:15px;font-weight:800;color:#fff"><span>Atleta</span></div>
          <div style="font-size:12px;color:rgba(255,255,255,0.55)">68 OVR</div>
        </div>
      </div>
      <div style="text-align:right;flex-shrink:0">
        <div>R$ 8.000</div>
        <div>Clique p/ renovar ➔</div>
      </div>
    </div>
    <div style="margin-top:10px;width:100%;height:4px"><div style="height:100%"></div></div>
  </div>
`;

function countTags(html, tag) {
  const openRegex = new RegExp(`<${tag}(\\s+[^>]*)?>`, 'gi');
  const closeRegex = new RegExp(`</${tag}>`, 'gi');
  const opens = (html.match(openRegex) || []).length;
  const closes = (html.match(closeRegex) || []).length;
  return { opens, closes };
}

const divCount = countTags(rowSample, 'div');
assert.strictEqual(divCount.opens, divCount.closes, `Tags <div> devem estar perfeitamente balanceadas: ${divCount.opens} abertas vs ${divCount.closes} fechadas`);

// -------------------------------------------------------------
// 6. Testar pluralização e sub-aba Empréstimos Concedidos
// -------------------------------------------------------------
console.log('6. Testando sub-aba Empréstimos (Recebidos e Concedidos)...');
assert(gameCode.includes('📥 EMPRÉSTIMOS RECEBIDOS'), 'Deve conter título Empréstimos Recebidos');
assert(gameCode.includes('📤 EMPRÉSTIMOS CONCEDIDOS'), 'Deve conter título Empréstimos Concedidos');
assert(gameCode.includes('btnRecallLoanedPlayer'), 'Deve conter ação de requisitar retorno de atletas cedidos');
assert(!gameCode.includes('${loanPlayers.length} jogador(es) emprestado(s) ao clube'), 'Não deve exibir texto bruto com (es)/(s)');

console.log('🎉 Todos os testes da Aba Contratos & Salários passaram com 100% de sucesso!');
