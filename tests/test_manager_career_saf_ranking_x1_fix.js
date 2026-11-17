// ==============================================================================
// TESTE AUTOMATIZADO: FIX CARREIRA, SAF, RANKING, LICENÇAS E X1
// Arquivo: tests/test_manager_career_saf_ranking_x1_fix.js
// ==============================================================================

const assert = require('assert');
const AFMCareerFix = require('../js/career-economy-fix.js');

console.log('🧪 Iniciando suíte de testes: Carreira, SAF, Ranking, Licenças & X1...');

// ------------------------------------------------------------------------------
// TESTE 1: Ordenação Numérica do Ranking de Treinadores (Pontos Decrescentes)
// ------------------------------------------------------------------------------
console.log('\n--- 1. Ranking de Treinadores: Ordenação Numérica & Resolução de Países ---');

const mockCoaches = [
  { coach: 'Dorival Júnior (2 D)', club: '2 de Mayo', league: 'PAR-1', points: 419, titles: 0, wins: 13, draws: 9, losses: 4, prestige: 45 },
  { coach: 'Dado Cavalcanti (3 D)', club: '3 de Febrero', league: 'PAR-2', points: 399, titles: 0, wins: 11, draws: 7, losses: 8, prestige: 53 },
  { coach: 'Claudinei Oliveira (9 D)', club: '9 de Octubre', league: 'ECU-2', points: 554, titles: 1, wins: 12, draws: 8, losses: 6, prestige: 46 },
  { coach: 'Antônio Oliveira (ABC)', club: 'ABC', league: 'BRA-D', points: 464, titles: 0, wins: 14, draws: 10, losses: 2, prestige: 48 },
  { coach: 'Barroca (ABE)', club: 'Aberdeen', league: 'SCO-1', points: 534, titles: 1, wins: 12, draws: 8, losses: 6, prestige: 42 },
  { coach: 'Zé Ricardo (AC)', club: 'AC Milan', league: 'ITA-1', points: 479, titles: 1, wins: 9, draws: 5, losses: 12, prestige: 49 },
  { coach: 'Téc. Téc. Aquino (VOCÊ)', club: 'Ceilândia', league: 'BRA-D', points: 210, titles: 0, wins: 5, draws: 2, losses: 3, prestige: 6, isUser: true }
];

const mockState = {
  club: 'Ceilândia',
  coachName: 'Téc. Aquino',
  career: {
    cash: 104250,
    prestige: 6,
    salary: 45000,
    properties: {},
    businesses: {},
    vehicles: {},
    licenses: ['cbf_d']
  }
};

const sortedRanking = AFMCareerFix.normalizeAndSortRanking(mockCoaches, mockState);

assert.strictEqual(sortedRanking[0].club, '9 de Octubre', 'O #1 deve ser o clube com mais pontos (554 pts)');
assert.strictEqual(sortedRanking[0].points, 554);
assert.strictEqual(sortedRanking[1].club, 'Aberdeen', 'O #2 deve ser Aberdeen (534 pts)');
assert.strictEqual(sortedRanking[2].club, 'AC Milan', 'O #3 deve ser AC Milan (479 pts)');
assert.strictEqual(sortedRanking[3].club, 'ABC', 'O #4 deve ser ABC (464 pts)');
assert.strictEqual(sortedRanking[4].club, '2 de Mayo', 'O #5 deve ser 2 de Mayo (419 pts), NÃO #1 como na ordem alfabética');
assert.strictEqual(sortedRanking[5].club, '3 de Febrero', 'O #6 deve ser 3 de Febrero (399 pts)');

console.log('✅ Ordenação por pontos decrescentes validada com sucesso.');

// ------------------------------------------------------------------------------
// TESTE 2: Resolução de Países (Clubes Estrangeiros não são Brasil)
// ------------------------------------------------------------------------------
const paraguayClub = sortedRanking.find(c => c.club === '2 de Mayo');
assert.strictEqual(paraguayClub.country, 'Paraguai', '2 de Mayo (PAR-1) deve ter país Paraguai');

const italyClub = sortedRanking.find(c => c.club === 'AC Milan');
assert.strictEqual(italyClub.country, 'Itália', 'AC Milan (ITA-1) deve ter país Itália');

const scotlandClub = sortedRanking.find(c => c.club === 'Aberdeen');
assert.strictEqual(scotlandClub.country, 'Escócia', 'Aberdeen (SCO-1) deve ter país Escócia');

const ecuadorClub = sortedRanking.find(c => c.club === '9 de Octubre');
assert.strictEqual(ecuadorClub.country, 'Equador', '9 de Octubre (ECU-2) deve ter país Equador');

console.log('✅ Resolução de países estrangeiros por código de liga validada.');

// ------------------------------------------------------------------------------
// TESTE 3: Sanitização de Nome de Técnico (Sem "Téc. Téc." nem "Treinador Téc.")
// ------------------------------------------------------------------------------
const sanitized1 = AFMCareerFix.sanitizeCoachName('Téc. Téc. Aquino (VOCÊ)');
assert.strictEqual(sanitized1, 'Aquino', 'Deve extrair o nome limpo sem duplicações de Téc. ou sufixo');

const sanitized2 = AFMCareerFix.sanitizeCoachName('Treinador Téc. Roberto');
assert.strictEqual(sanitized2, 'Roberto', 'Deve extrair Roberto');

const userRow = sortedRanking.find(r => r.isUser);
assert.strictEqual(userRow.coach, 'Téc. Aquino (VOCÊ)', 'A linha do usuário no ranking deve ter exatamente Téc. Aquino (VOCÊ)');

console.log('✅ Sanitização de nome de técnico aprovada.');

// ------------------------------------------------------------------------------
// TESTE 4: Licenças de Treinador (CBF & UEFA) & Dedução do Saldo Pessoal
// ------------------------------------------------------------------------------
console.log('\n--- 2. Licenças de Treinador & Isolamento Contábil ---');

const testStateLicense = {
  money: 1401099, // Dinheiro do clube (NUNCA DEVE SER TOCADO)
  club: 'Ceilândia',
  career: {
    cash: 50000,
    prestige: 6,
    salary: 45000,
    licenses: ['cbf_d'],
    properties: {},
    businesses: {},
    vehicles: {},
    safPortfolio: {}
  }
};

// Comprar Licença CBF C (Custa R$ 15.000, Requer Prestígio 5)
AFMCareerFix.handleBuyLicense(testStateLicense, 'cbf_c');

assert.strictEqual(testStateLicense.money, 1401099, 'Caixa do clube não pode ser alterado ao comprar licença!');
assert.strictEqual(testStateLicense.career.cash, 35000, 'Saldo pessoal deve ser debitado em R$ 15.000');
assert(testStateLicense.career.licenses.includes('cbf_c'), 'Licença CBF C deve estar adquirida');

const econAfterLicense = AFMCareerFix.calculateCareerEconomy(testStateLicense);
assert.strictEqual(econAfterLicense.effectiveSalary, 49500, 'Salário efetivo deve ter bônus de +10% (R$ 49.500)');

console.log('✅ Compra de licença, validação de requisitos e bônus salarial validados.');

// ------------------------------------------------------------------------------
// TESTE 5: Economia Pessoal, Imóveis, Negócios e Garagem (Comprar e Vender)
// ------------------------------------------------------------------------------
console.log('\n--- 3. Economia Pessoal: Compras, Upgrades e Liquidações ---');

const testStateAssets = {
  money: 2000000,
  career: {
    cash: 500000,
    prestige: 10,
    salary: 40000,
    licenses: ['cbf_d'],
    properties: {},
    businesses: {},
    vehicles: {},
    safPortfolio: {}
  }
};

// Comprar Apartamento Studio Executivo (R$ 280.000, R$ 2.400/mês de aluguel)
AFMCareerFix.handleBuyOrSellProperty(testStateAssets, 'apt_studio', 'buy');
assert.strictEqual(testStateAssets.career.cash, 220000, 'Saldo pessoal deve ser debitado de 500k para 220k');
assert.strictEqual(testStateAssets.career.properties.apt_studio.count, 1, 'Deve possuir 1 apt_studio');

// Vender Imóvel (85% do valor = R$ 238.000)
AFMCareerFix.handleBuyOrSellProperty(testStateAssets, 'apt_studio', 'sell');
assert.strictEqual(testStateAssets.career.cash, 220000 + 238000, 'Saldo deve receber 85% de liquidação');
assert.strictEqual(testStateAssets.career.properties.apt_studio, undefined, 'Imóvel vendido deve ser removido');

// Comprar Negócio: Barbearia VIP de Atletas (R$ 180.000, Nível 1)
testStateAssets.career.cash = 400000;
AFMCareerFix.handleBuyOrUpgradeBusiness(testStateAssets, 'barbearia_vip');
assert.strictEqual(testStateAssets.career.businesses.barbearia_vip, 1, 'Barbearia VIP deve estar no nível 1');

// Upgrade para Nível 2 (Custo: 180.000 * 0.75 = R$ 135.000. Saldo restante: 400k - 180k = 220k >= 135k)
AFMCareerFix.handleBuyOrUpgradeBusiness(testStateAssets, 'barbearia_vip');
assert.strictEqual(testStateAssets.career.businesses.barbearia_vip, 2, 'Barbearia VIP deve estar no nível 2');

// Comprar e Vender Veículo SUV Blindado (R$ 420.000, Venda 75% = R$ 315.000)
testStateAssets.career.cash = 500000;
AFMCareerFix.handleBuyOrSellVehicle(testStateAssets, 'suv_blindado', 'buy');
assert.strictEqual(testStateAssets.career.vehicles.suv_blindado, true, 'SUV deve estar na garagem');

AFMCareerFix.handleBuyOrSellVehicle(testStateAssets, 'suv_blindado', 'sell');
assert(!testStateAssets.career.vehicles.suv_blindado, 'SUV não deve mais estar na garagem');
assert.strictEqual(testStateAssets.career.cash, 80000 + 315000, 'Saldo deve receber 75% do valor do veículo'); // 500.000 - 420.000 + 315.000 = 395.000

console.log('✅ Operações de compra, upgrade e liquidação com percentuais corretos validadas.');

// ------------------------------------------------------------------------------
// TESTE 6: Detecção de Clube SAF
// ------------------------------------------------------------------------------
console.log('\n--- 4. Detecção de Clube SAF ---');

assert.strictEqual(AFMCareerFix.isClubSaf(null, 'Botafogo'), true, 'Botafogo é SAF');
assert.strictEqual(AFMCareerFix.isClubSaf(null, 'Cruzeiro SAF'), true, 'Cruzeiro é SAF');
assert.strictEqual(AFMCareerFix.isClubSaf(null, 'Vasco da Gama'), true, 'Vasco é SAF');
assert.strictEqual(AFMCareerFix.isClubSaf(null, 'Ceilândia'), false, 'Ceilândia padrão não é SAF');

const customSafState = { club: 'Ceilândia', clubIsSaf: true };
assert.strictEqual(AFMCareerFix.isClubSaf(customSafState, 'Ceilândia'), true, 'Ceilândia com flag clubIsSaf é SAF');

console.log('✅ Detecção de SAF nativa e dinâmica validada.');

// ------------------------------------------------------------------------------
// TESTE 7: Modo X1 com Caracteres Acentuados (UTF-8 Base64)
// ------------------------------------------------------------------------------
console.log('\n--- 5. Modo X1: Token UTF-8 com Acentuação e Simulação de Duelo ---');

const utf8State = {
  club: 'Ceilândia Esporte Clube',
  coachName: 'Téc. José Gonçalves',
  tactic: '4-3-3 Ofensivo',
  teamOverall: 68,
  squad: [
    { name: 'Joãozinho da Silva', pos: 'ATA', ovr: 72 },
    { name: 'Álvaro Gonçalves', pos: 'MC', ovr: 69 },
    { name: 'Matheus Éverton', pos: 'ZAG', ovr: 66 }
  ]
};

// Gerar Token X1
const token = AFMCareerFix.generateSafeX1Token(utf8State);
assert(token.startsWith('AFMX1_'), 'Token deve iniciar com AFMX1_');

// Parse do Token X1
const parsed = AFMCareerFix.parseSafeX1Token(token);
assert.strictEqual(parsed.club, 'Ceilândia Esporte Clube', 'Clube deve preservar acentos');
assert.strictEqual(parsed.coach, 'José Gonçalves', 'Técnico deve preservar acentos e ter Téc. sanitizado');
assert.strictEqual(parsed.ovr, 68);
assert.strictEqual(parsed.squad[0].n, 'Joãozinho da Silva');

// Simular Duelo X1
const duel = AFMCareerFix.simulateX1Duel(mockState, token);
assert.strictEqual(duel.ok, true, 'Simulação de duelo deve ser bem sucedida');
assert.strictEqual(duel.opponent.club, 'Ceilândia Esporte Clube');
assert(typeof duel.myGoals === 'number' && duel.myGoals >= 0);
assert(typeof duel.oppGoals === 'number' && duel.oppGoals >= 0);

console.log(`✅ Duelo X1 simulado com sucesso: Placar ${duel.myGoals} x ${duel.oppGoals} contra ${duel.opponent.club}`);

// ------------------------------------------------------------------------------
// TESTE 8: Blindagem Layout CSS (Sem grid espremido em #afm-career-economy-container)
// ------------------------------------------------------------------------------
console.log('\n--- 6. Layout Carreira: Regra CSS Anti-Squish & Paridade Legacy Array ---');
const fs = require('fs');
const path = require('path');
const appCss = fs.readFileSync(path.join(__dirname, '../css/app.css'), 'utf8');
assert(
  /#afm-career-economy-container,\s*\.life-shares-container\s*\{[^}]*display:\s*block\s*!important;/s.test(appCss),
  '#afm-career-economy-container deve usar display: block !important para não espremer em 1 coluna'
);
assert(appCss.includes('.afm-career-kpi-grid'), 'css/app.css deve definir .afm-career-kpi-grid responsivo');
assert(appCss.includes('.afm-career-catalog-grid'), 'css/app.css deve definir .afm-career-catalog-grid');

// Verifica sincronia dos arrays de managerPersonal em compra/venda de ativos
const syncState = {
  money: 9999999,
  club: 'Ceilândia',
  career: {
    cash: 2000000,
    prestige: 10,
    salary: 45000,
    licenses: ['cbf_d'],
    properties: {},
    businesses: {},
    vehicles: {},
    safPortfolio: {}
  },
  managerPersonal: {
    name: 'Aquino',
    personalBalance: 2000000,
    properties: [],
    businesses: [],
    vehicles: [],
    safPortfolio: {}
  }
};
AFMCareerFix.handleBuyOrSellProperty(syncState, 'apt_studio', 'buy');
assert.strictEqual(syncState.managerPersonal.properties.length, 1, 'mp.properties deve receber imóvel comprado para gerar aluguel mensal');
AFMCareerFix.handleBuyOrUpgradeBusiness(syncState, 'barbearia_vip');
assert.strictEqual(syncState.managerPersonal.businesses.length, 1, 'mp.businesses deve sincronizar empreendimento');
assert.strictEqual(syncState.managerPersonal.businesses[0].level, 1);
AFMCareerFix.handleBuyOrSellVehicle(syncState, 'suv_blindado', 'buy');
assert.strictEqual(syncState.managerPersonal.vehicles.length, 1, 'mp.vehicles deve sincronizar veículo comprado');
AFMCareerFix.handleBuyOrSellVehicle(syncState, 'suv_blindado', 'sell');
assert.strictEqual(syncState.managerPersonal.vehicles.length, 0, 'mp.vehicles deve remover veículo vendido');
AFMCareerFix.handleBuyOrSellProperty(syncState, 'apt_studio', 'sell');
assert.strictEqual(syncState.managerPersonal.properties.length, 0, 'mp.properties deve remover imóvel vendido');
console.log('✅ Layout CSS anti-squish e sincronia de arrays managerPersonal validados.');

// ------------------------------------------------------------------------------
// TESTE 9: Conservação de Caixa SAF / P2P / Escrow vs AFMCareerFix (Sem Dinheiro Infinito)
// ------------------------------------------------------------------------------
console.log('\n--- 7. Pregão SAF, P2P, Escrow e Re-render sem Reversão de Saldo ---');
global.window = global;
global.window.AFMCareerFix = AFMCareerFix;
require('../js/systems/manager_life_and_shares_pro.js');
const LifePro = global.window.AFM_LifeAndSharesPro;
assert(LifePro, 'AFM_LifeAndSharesPro deve inicializar em window');

const lifeProSrc = fs.readFileSync(path.join(__dirname, '../js/systems/manager_life_and_shares_pro.js'), 'utf8');
assert(
  lifeProSrc.includes('if (typeof window === \'undefined\' || !window.AFMCareerFix)'),
  'Handlers inline de .btnBuyProp/.btnBuyBiz/.btnBuyVeh só podem rodar como fallback sem AFMCareerFix'
);

const safState = {
  club: 'Ceilândia',
  season: 2026,
  round: 2,
  balance: 1000000,
  clubBalance: 1000000,
  career: {
    cash: 100000,
    prestige: 12,
    salary: 45000,
    licenses: ['cbf_d'],
    properties: {},
    businesses: {},
    vehicles: {},
    safPortfolio: {}
  }
};
LifePro.ensureState(safState);
const buySafRes = LifePro.buySafShares(safState, 'botafogo', 100); // R$ 34.50 * 100 = R$ 3.450
assert.strictEqual(buySafRes.ok, true, 'Compra SAF deve funcionar');
const expectedCashAfterBuy = 100000 - 3450;
assert.strictEqual(safState.managerPersonal.personalBalance, expectedCashAfterBuy);
assert.strictEqual(safState.career.cash, expectedCashAfterBuy, 'state.career.cash deve refletir débito imediato da compra SAF');

// Simula re-render chamando AFMCareerFix.calculateCareerEconomy(safState): saldo NÃO pode reverter para 100k!
const ecoAfterSafBuy = AFMCareerFix.calculateCareerEconomy(safState);
assert.strictEqual(ecoAfterSafBuy.cash, expectedCashAfterBuy, 'Re-render não pode reverter saldo da compra SAF (anti-glitch dinheiro infinito)');
assert.strictEqual(safState.managerPersonal.personalBalance, expectedCashAfterBuy);
assert(ecoAfterSafBuy.safValue >= 3400, 'Valor da carteira SAF deve compor o patrimônio líquido');

// Ordem P2P em Escrow (anunciar 50, cancelar -> devolve 50, anunciar 50 e executar venda P2P)
const pub1 = LifePro.publishUserSafSellOrder(safState, 'botafogo', 50, 20);
assert.strictEqual(pub1.ok, true);
assert.strictEqual(safState.managerPersonal.safPortfolio.botafogo.sharesCount, 50, '50 ações devem ir para escrow');
assert.strictEqual(safState.career.safPortfolio.botafogo.sharesCount, 50, 'state.career.safPortfolio deve espelhar escrow');

const orderId = safState.userSafSellOrders[0].id;
const cancelRes = LifePro.cancelUserSafSellOrder(safState, orderId);
assert.strictEqual(cancelRes.ok, true);
assert.strictEqual(safState.managerPersonal.safPortfolio.botafogo.sharesCount, 100, 'Cancelamento deve restituir 50 ações');

const pub2 = LifePro.publishUserSafSellOrder(safState, 'botafogo', 50, 20);
assert.strictEqual(pub2.ok, true);
const execOrderId = safState.userSafSellOrders[0].id;
const execAskingPrice = safState.userSafSellOrders[0].totalAskingPrice;
const execRes = LifePro.instantExecuteUserSellOrder(safState, execOrderId);
assert.strictEqual(execRes.ok, true);
assert.strictEqual(safState.career.cash, expectedCashAfterBuy + execAskingPrice, 'Venda instantânea P2P deve creditar state.career.cash');
const ecoAfterP2P = AFMCareerFix.calculateCareerEconomy(safState);
assert.strictEqual(ecoAfterP2P.cash, expectedCashAfterBuy + execAskingPrice, 'Saldo após venda P2P deve persistir em calculateCareerEconomy');

// Vender as 50 ações restantes no pregão
const sellSafRes = LifePro.sellSafShares(safState, 'botafogo', 50);
assert.strictEqual(sellSafRes.ok, true);
assert.strictEqual(safState.career.cash, safState.managerPersonal.personalBalance);
assert.strictEqual(safState.managerMoney, safState.career.cash);

console.log('✅ Conservação de caixa SAF, P2P, Escrow e consistência após calculateCareerEconomy aprovadas.');

console.log('\n🎉 TODOS OS TESTES PASSARAM COM 100% DE SUCESSO!\n');
