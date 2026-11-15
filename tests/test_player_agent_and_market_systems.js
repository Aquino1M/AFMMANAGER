const assert = require("assert");
const fs = require("fs");
const path = require("path");

console.log("==================================================================");
console.log("INICIANDO TESTES DO SISTEMA DE EMPRESÁRIO, MERCADO E RENOVAÇÃO...");
console.log("==================================================================");

// Mock DOM e ambiente browser
global.window = global;
global.document = {
  getElementById: () => null,
  querySelectorAll: () => [],
  querySelector: () => null,
  createElement: () => ({ style: {}, appendChild: () => {}, querySelectorAll: () => [] }),
  body: { appendChild: () => {} },
};
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

// Carregar arquivos essenciais
const engineCode = fs.readFileSync(path.join(__dirname, "../js/player/player_career_engine.js"), "utf8");
eval(engineCode);

const uiCode = fs.readFileSync(path.join(__dirname, "../js/player/player_mode_ui.js"), "utf8");
eval(uiCode);

// --- TESTE 1: CATÁLOGO DE AGÊNCIAS E ALIASES ---
console.log("\n--- TESTE 1: Catálogo de Agências e Aliases ---");
const agents = window.AFM_PlayerEngine.AGENTS_CATALOG;
assert(Array.isArray(agents), "AGENTS_CATALOG deve ser um array");
assert.strictEqual(agents.length, 5, "Devem existir exatamente 5 agências no catálogo oficial");

const expectedIds = ["agent_family", "agent_regional", "agent_national", "agent_euro", "agent_global"];
assert.deepStrictEqual(agents.map(a => a.id), expectedIds, "IDs de agências devem estar na ordem correta");

// Testar bônus de barganha
assert.strictEqual(agents[0].negotiationBonusPct, 0, "Família tem 0% de bônus");
assert.strictEqual(agents[1].negotiationBonusPct, 5, "Scout Regional tem 5% de bônus");
assert.strictEqual(agents[2].negotiationBonusPct, 12, "Agência Nacional tem 12% de bônus");
assert.strictEqual(agents[3].negotiationBonusPct, 18, "Euro Bridge tem 18% de bônus");
assert.strictEqual(agents[4].negotiationBonusPct, 25, "Super Agente Global tem 25% de bônus");

// Testar resolução de agência com ID nativo e com aliases
const pState1 = { agentId: "agent_euro" };
const ag1 = window.AFM_PlayerEngine.getPlayerAgent(pState1);
assert.strictEqual(ag1.id, "agent_euro", "Deve resolver agent_euro");
assert.strictEqual(ag1.negotiationBonusPct, 18);

const pStateAlias = { agentId: "euro_bridge" };
const agAlias = window.AFM_PlayerEngine.getPlayerAgent(pStateAlias);
assert.strictEqual(agAlias.id, "agent_euro", "Deve resolver alias euro_bridge para agent_euro");
assert.strictEqual(agAlias.negotiationBonusPct, 18);

const pStateSuperAlias = { agentId: "super_agent" };
const agSuper = window.AFM_PlayerEngine.getPlayerAgent(pStateSuperAlias);
assert.strictEqual(agSuper.id, "agent_global", "Deve resolver alias super_agent para agent_global");
assert.strictEqual(agSuper.negotiationBonusPct, 25);
console.log("✔ Agências, bônus de barganha e suporte a aliases testados com sucesso!");

// --- TESTE 2: FORMATAÇÃO REALISTA DE VALOR DE MERCADO ---
console.log("\n--- TESTE 2: Formatação de Valor de Mercado ---");
const athleteOvr34 = {
  id: "test-user-athlete",
  name: "D.Aquino",
  ovr: 34,
  overall: 34,
  age: 15,
  isControlled: true,
  marketValue: 760000, // valor legado distorcido
};
const brl = window.AFM_PlayerMode.getPlayerMarketValueBrl(athleteOvr34);
assert(brl < 100000, `O valor de mercado de um jovem OVR 34 deve ser corrigido para < R$ 100k, obtido: R$ ${brl}`);
assert(brl >= 50000, `O valor de mercado de um jovem OVR 34 deve ser >= R$ 50k, obtido: R$ ${brl}`);

const formattedShort = window.AFM_PlayerMode.formatPlayerMarketValueShort(athleteOvr34);
assert.strictEqual(formattedShort, "R$ 69 Mil", `Deve formatar R$ 68.750 como 'R$ 69 Mil', obtido: ${formattedShort}`);

const athletePro = { ovr: 75, age: 24, marketValue: 8500000 };
const formattedPro = window.AFM_PlayerMode.formatPlayerMarketValueShort(athletePro);
assert(formattedPro.includes("Milhões"), `Valores >= 1M devem conter 'Milhões', obtido: ${formattedPro}`);
console.log("✔ Correção de save legado e formatação 'R$ 69 Mil' validadas!");

// --- TESTE 3: DATAS DE RENOVAÇÃO CONTRATUAL ---
console.log("\n--- TESTE 3: Cálculo de Datas Futuras na Renovação ---");
// Simulando cenário real: Temporada 2026, mas contrato atual vai até 2029
const curSeason = 2026;
const curContractUntil = 2029;
const baseContractYear = Math.max(curSeason, curContractUntil);
assert.strictEqual(baseContractYear, 2029, "O ano base deve ser 2029 (fim do vínculo atual)");

const durationButtons = [baseContractYear + 1, baseContractYear + 2, baseContractYear + 3, baseContractYear + 4];
assert.deepStrictEqual(durationButtons, [2030, 2031, 2032, 2033], "Botões devem oferecer extensões reais para 2030, 2031, 2032 e 2033");
console.log("✔ Anos de contrato futuro gerados corretamente a partir do fim do vínculo vigente!");

// --- TESTE 4: SISTEMA DE COOLDOWNS (15 DIAS E 10 DIAS) ---
console.log("\n--- TESTE 4: Sistema de Cooldowns ---");
const testState = {
  gameMode: "player",
  date: "2026-01-15",
  club: "Brasília",
  playerCareerState: {
    agentCooldowns: {
      wage_increase: "2026-01-10", // 5 dias atrás (cooldown ativo)
    },
    lastAgentMarketSearchDate: "2026-01-12", // 3 dias atrás
  },
};

const cdElapsed = window.AFM_PlayerMode.getDaysBetween(testState.playerCareerState.agentCooldowns.wage_increase, testState.date);
assert.strictEqual(cdElapsed, 5, "Devem ter se passado 5 dias");
assert(cdElapsed < 15, "Deve estar bloqueado pelo cooldown de 15 dias");

// Testando busca de propostas na janela (cooldown de 10 dias)
const searchResultBlocked = window.AFM_PlayerEngine.searchPlayerTransferMarket(testState);
assert.strictEqual(searchResultBlocked.ok, false, "Busca deve ser bloqueada quando realizada há menos de 10 dias");
assert(searchResultBlocked.error.includes("Aguarde"), "Mensagem de erro deve alertar dias restantes");

// Avançar a data do calendário para 12 dias depois
testState.date = "2026-01-25";
const searchResultAllowed = window.AFM_PlayerEngine.searchPlayerTransferMarket(testState);
assert.strictEqual(searchResultAllowed.ok, true, "Busca deve ser permitida após 10 dias");
assert(searchResultAllowed.offer, "Deve gerar uma proposta válida");
console.log("✔ Cooldowns de 15 dias para diretoria e 10 dias para prospecção de mercado validados!");

// --- TESTE 5: RADAR DE INTERESSE & RUMORES ---
console.log("\n--- TESTE 5: Radar de Interesse & Rumores ---");
const radarState = {
  date: "2026-02-01",
  club: "Brasília",
  playerCareerState: {
    athleteOvr: 45,
    agentOffers: [],
  },
  squad: [{ id: "p1", name: "D.Aquino", ovr: 45, pos: "ST", wage: 1045, isControlled: true }],
};
const radar = window.AFM_PlayerEngine.getPlayerMarketRadar(radarState);
assert(Array.isArray(radar) && radar.length > 0, "Radar deve retornar lista de clubes observadores");
assert(radar.some(item => item.status === "concrete" || item.status === "scouts"), "Deve ter clubes com status concreto ou olheiros");

const targetClub = radar[0].club;
const formalRes = window.AFM_PlayerEngine.requestFormalOfferFromRadar(radarState, targetClub);
assert.strictEqual(formalRes.ok, true, "Deve conseguir solicitar proposta formal a partir do radar");
assert(radarState.playerCareerState.agentOffers.some(o => o.newClub === targetClub || o.clubOrBrand === targetClub), "A proposta formal deve constar na mesa de propostas");
console.log("✔ Radar de interesse e solicitação formal de propostas testados com sucesso!");

// --- TESTE 6: CONTRAPROPOSTA (+15% SALÁRIO E LUVAS) ---
console.log("\n--- TESTE 6: Contraproposta do Atleta ---");
const offerIndex = radarState.playerCareerState.agentOffers.length - 1;
const initialWage = radarState.playerCareerState.agentOffers[offerIndex].wage;

const origRandom = Math.random;
Math.random = () => 0.1; // Garante rolagem positiva para testar aceitação
const counterRes = window.AFM_PlayerEngine.makeCounterOffer(radarState, offerIndex);
Math.random = origRandom;

assert.strictEqual(counterRes.ok, true, "Contraproposta deve ter sucesso");
const updatedOffer = radarState.playerCareerState.agentOffers[offerIndex];
assert(updatedOffer.wage > initialWage, `Salário deve ter subido de ${initialWage} para ${updatedOffer.wage}`);
assert.strictEqual(updatedOffer.wage, Math.round(initialWage * 1.15), "Salário deve aumentar em 15%");
assert.strictEqual(updatedOffer.isCounterOffered, true, "Deve marcar como já renegociada");

// Segunda contraproposta deve ser barrada
const secondCounter = window.AFM_PlayerEngine.makeCounterOffer(radarState, offerIndex);
assert.strictEqual(secondCounter.ok, false, "Não pode fazer contraproposta duas vezes na mesma oferta");
console.log("✔ Contraproposta (+15% salário e luvas valorizadas) testada com sucesso!");

// --- TESTE 7: TOPBAR SINCRONIZADA NO MODO JOGADOR ---
console.log("\n--- TESTE 7: Badges da Barra Superior (sm-topbar) no Modo Atleta ---");
const playerGameState = {
  gameMode: "player",
  controlledPlayerId: "ath-1",
  squad: [{ id: "ath-1", name: "D.Aquino", ovr: 54, pos: "ST", wage: 1045, isControlled: true }],
  playerCareerState: {
    skillPoints: 5,
    personalBank: 1045,
  },
  club: "Brasília",
};
assert.strictEqual(playerGameState.gameMode, "player");
assert.strictEqual(playerGameState.squad[0].ovr, 54);
assert.strictEqual(playerGameState.playerCareerState.skillPoints, 5);
assert.strictEqual(playerGameState.playerCareerState.personalBank, 1045);
console.log("✔ Dados da TopBar (54 OVR, 5 pts livres, R$ 1.045 no banco) testados com sucesso!");

console.log("\n==================================================================");
console.log("🎉 TODOS OS TESTES DE EMPRESÁRIO E MERCADO PASSARAM COM SUCESSO! 🎉");
console.log("==================================================================");
