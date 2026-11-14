const fs = require('fs');

// Carrega os módulos
const engineCode = fs.readFileSync('js/player/player_career_engine.js', 'utf8');
const socialCode = fs.readFileSync('js/player/social_media_manager.js', 'utf8');

global.window = global;
global.document = {
  getElementById: () => null,
  querySelectorAll: () => []
};

// Executa os códigos em contexto seguro
eval(engineCode);
eval(socialCode);

const AFM_PlayerEngine = global.window.AFM_PlayerEngine;
const AFM_SocialMedia = global.window.AFM_SocialMedia;

console.log('--- TESTE 1: Catálogo de Agentes e Requisitos de Contratação ---');
const agents = AFM_PlayerEngine.AGENTS_CATALOG;
console.log(`Catálogo carregado com ${agents.length} empresários.`);
agents.forEach(a => {
  console.log(`  • ${a.name} (${a.agency}) - Min OVR: ${a.minOvr} | Min Seguidores: ${a.minFollowers} | Salário Fixo: R$ ${a.monthlySalary}/mês | Com. Vendas: ${a.transferCommissionPct}% | Com. Patrocínio: ${a.sponsorCommissionPct}%`);
});

// Mock do estado do jogador no início de carreira (OVR 48, 1200 seguidores)
const state = {
  gameMode: 'player',
  club: 'Itabaiana',
  date: '2026-01-01',
  controlledPlayerId: 'p_test_1',
  squad: [
    { id: 'p_test_1', name: 'Diogenes Aquino', ovr: 48, wage: 2500, position: 'ATA' }
  ],
  playerCareerState: {
    athleteName: 'Diogenes Aquino',
    athleteOvr: 48,
    personalBank: 15000,
    socialMedia: {
      followers: 1200,
      celebrityLevel: 15,
      postedToday: false,
      feedPosts: []
    },
    agent: { id: 'agent_family' },
    hiredStaff: {},
    lifestylePerks: {},
    sponsorContract: {
      name: 'Comércio Esportivo Local',
      brand: 'Penalty',
      monthlyStipend: 600,
      bonusGoal: 500
    }
  }
};

const pState = state.playerCareerState;

// Teste de contratação de agente regional (exige OVR 40 e 500 fãs -> deve permitir)
const hireRegional = AFM_PlayerEngine.hirePlayerAgent(state, 'agent_regional');
console.log('\nTentativa de contratar Agente Regional:', hireRegional);
if (!hireRegional.success) throw new Error('Falha ao contratar agente regional elegível!');
if (pState.agent.id !== 'agent_regional') throw new Error('Agente não atualizado no estado!');

// Teste de contratação de agente global sem requisitos (exige OVR 78 e 25.000 fãs -> deve bloquear)
const hireGlobalFail = AFM_PlayerEngine.hirePlayerAgent(state, 'agent_global');
console.log('Tentativa de contratar Agente Global com OVR baixo (deve bloquear):', hireGlobalFail.message);
if (hireGlobalFail.success) throw new Error('Permitiu contratar superagente sem os requisitos necessários!');

console.log('\n--- TESTE 2: Contratação de Staff Pessoal e Dedução Inicial de Taxa ---');
const staffList = AFM_PlayerEngine.STAFF_CATALOG;
console.log(`Catálogo de Staff carregado com ${staffList.length} especialistas.`);

const bankBeforeHire = pState.personalBank;
const hirePT = AFM_PlayerEngine.hireStaffMember(state, 'personal_trainer');
console.log('Contratação de Personal Trainer:', hirePT);
if (!hirePT.success) throw new Error('Falha ao contratar Personal Trainer!');
if (pState.personalBank !== (bankBeforeHire - 3500)) throw new Error('Taxa de contratação do Personal Trainer não foi descontada corretamente!');
if (!pState.hiredStaff.personal_trainer) throw new Error('Flag de Personal Trainer não registrada em hiredStaff!');

// Contratação de Equipe de Marketing
const hireMkt = AFM_PlayerEngine.hireStaffMember(state, 'marketing_team');
console.log('Contratação de Equipe de Marketing:', hireMkt);
if (!hireMkt.success) throw new Error('Falha ao contratar Equipe de Marketing!');
if (!pState.hiredStaff.marketing_team) throw new Error('Flag de Equipe de Marketing não registrada!');

console.log('\n--- TESTE 3: Escalonamento Orgânico de Custos por OVR e Fama ---');
// OVR 48 (Base):
const cost48 = AFM_PlayerEngine.calculateHiredStaffMonthlyCost(pState, 48);
const lifeCost48 = AFM_PlayerEngine.calculatePlayerLifestyleCost(pState, 48);
console.log(`Custos mensais no OVR 48: Staff = R$ ${cost48}/mês | Custo de Vida = R$ ${lifeCost48}/mês`);

// OVR 75 (Série A / Destaque):
const cost75 = AFM_PlayerEngine.calculateHiredStaffMonthlyCost(pState, 75);
const lifeCost75 = AFM_PlayerEngine.calculatePlayerLifestyleCost(pState, 75);
console.log(`Custos mensais no OVR 75: Staff = R$ ${cost75}/mês | Custo de Vida = R$ ${lifeCost75}/mês`);
if (cost75 <= cost48) throw new Error('Honorários de staff não escalonaram com a subida de OVR!');
if (lifeCost75 <= lifeCost48) throw new Error('Custo de estilo de vida não escalonou com o estrelato!');

// OVR 88 (Ícone Galáctico):
const cost88 = AFM_PlayerEngine.calculateHiredStaffMonthlyCost(pState, 88);
const lifeCost88 = AFM_PlayerEngine.calculatePlayerLifestyleCost(pState, 88);
console.log(`Custos mensais no OVR 88: Staff = R$ ${cost88}/mês | Custo de Vida = R$ ${lifeCost88}/mês`);
if (cost88 <= cost75) throw new Error('Honorários de craque galáctico não escalonaram!');
if (lifeCost88 < 65000) throw new Error('Custo de vida de ícone mundial abaixo do esperado!');

console.log('\n--- TESTE 4: Ciclo Financeiro Mensal (Processamento do Dia 01) ---');
const prevBank = pState.personalBank;
// Salário: R$ 2500, Patrocínio: R$ 600 -> Entradas = R$ 3100
// Empresário Regional: taxa mensal e comissão reduzidas conforme o catálogo atual.
// Staff (PT + MKT no OVR 48): R$ 1000*1.09 + R$ 1500*1.09 = ~R$ 2725
// Custo de vida: R$ 1200
// Total despesas: ~R$ 5173
AFM_PlayerEngine.processMonthlyPlayerFinances(state);
console.log(`Extrato financeiro gerado! Saldo anterior: R$ ${prevBank} | Saldo final: R$ ${pState.personalBank}`);
const history = pState.financialHistory[0];
console.log('Detalhes do mês registrado:', {
  salary: history.salary,
  sponsorMonthly: history.sponsorMonthly,
  totalIncome: history.totalIncome,
  agentSalary: history.agentSalary,
  agentSponsorComm: history.agentSponsorComm,
  totalAgentExpenses: history.totalAgentExpenses,
  staffExpenses: history.staffExpenses,
  lifestyleCost: history.lifestyleCost,
  totalExpenses: history.totalExpenses,
  netBalance: history.netBalance,
  finalBank: history.finalBank
});

if (!history || history.totalIncome !== 3100) throw new Error('Cálculo de receitas mensais divergente!');
if (history.agentSalary !== 350) throw new Error('Taxa mensal do agente regional não foi rebalanceada!');
if (history.agentSponsorComm !== Math.round(600 * 0.06)) throw new Error('Comissão de patrocínio do agente incorreta!');
if (pState.personalBank !== (prevBank + history.netBalance)) throw new Error('Saldo bancário final não bate com o balanço líquido!');
const gameCode = fs.readFileSync('js/game.js', 'utf8');
if (!gameCode.includes('window.AFM_PlayerEngine.processMonthlyPlayerFinances?.(gameState)') || !gameCode.includes('window.AFM_PlayerEngine.processDailySponsorTurn?.(gameState)')) {
  throw new Error('O avanço após partidas não dispara os ciclos mensal e diário do atleta!');
}
const bankAfterJanuary = pState.personalBank;
AFM_PlayerEngine.processMonthlyPlayerFinances(state);
if (pState.personalBank !== bankAfterJanuary || pState.financialHistory.length !== 1) throw new Error('O mesmo mês foi pago/descontado mais de uma vez!');
state.date = '2026-02-01';
AFM_PlayerEngine.processMonthlyPlayerFinances(state);
if (pState.financialHistory[0].month !== '2026-02' || pState.financialHistory.length !== 2) throw new Error('A virada para um novo mês não processou o extrato!');

console.log('\n--- TESTE 5: Impulsionamento no FootGram pela Equipe de Marketing ---');
const prevFollowers = pState.socialMedia.followers;
// Publica post de treino
const postRes = AFM_SocialMedia.publishUserPost('tpl_training_1', state);
console.log('Resultado da publicação com Equipe de Marketing contratada:', {
  followersDelta: postRes.followersDelta,
  newTotal: postRes.newFollowersTotal
});
if (postRes.followersDelta <= 0) throw new Error('Post deveria ter gerado seguidores positivos!');
if (pState.socialMedia.followers <= prevFollowers) throw new Error('Seguidores não cresceram!');

console.log('\n--- TESTE 6: Dispensa de Membro do Staff para Cortar Custos ---');
const dismissRes = AFM_PlayerEngine.dismissStaffMember(state, 'personal_trainer');
console.log('Dispensa de Personal Trainer:', dismissRes);
if (!dismissRes.success) throw new Error('Falha ao dispensar Personal Trainer!');
if (pState.hiredStaff.personal_trainer !== false) throw new Error('Staff ainda marcado como ativo após dispensa!');

const costAfterDismiss = AFM_PlayerEngine.calculateHiredStaffMonthlyCost(pState, 48);
console.log(`Custo de staff após dispensar Personal Trainer: R$ ${costAfterDismiss} (reduzido de R$ ${cost48})`);
if (costAfterDismiss >= cost48) throw new Error('Custo do staff não diminuiu após a dispensa!');

console.log('\n✅ TODOS OS TESTES DO SISTEMA FINANCEIRO DO JOGADOR PASSARAM COM SUCESSO ABSOLUTO (100%)!');
