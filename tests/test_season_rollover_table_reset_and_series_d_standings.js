const assert = require("assert");
const fs = require("fs");
const path = require("path");

console.log("Iniciando testes unitários: Reset de Tabela na Virada de Temporada, Série D e Sincronia de Calendário...");

// Setup mock environment
global.window = global;
global.document = {
  body: {
    appendChild: (el) => el,
    removeChild: (el) => el,
  },
  getElementById: (id) => null,
  createElement: (tag) => ({
    tagName: tag.toUpperCase(),
    style: {},
    children: [],
    classList: { add: () => {}, remove: () => {} },
    appendChild: function(c) { this.children.push(c); return c; },
    remove: function() {},
    querySelectorAll: () => [],
    querySelector: () => null
  }),
  querySelectorAll: () => [],
  querySelector: () => null
};

global.rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
global.clamp = (val, min, max) => Math.max(min, Math.min(max, val));
global.norm = (s) => String(s ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
global.esc = (str) => String(str || "");
global.fmtMoney = (n) => `R$ ${(Number(n) || 0).toLocaleString("pt-BR")}`;
global.formatDatePtBr = (d) => String(d);
global.clubBadge = (club, size) => `<span class="badge-${size}">${club}</span>`;
global.toast = () => {};
global.save = () => {};
global.render = () => {};
global.recordAFMError = () => {};
global.teamStrengthByName = () => 65;
global.strength = () => 65;
global.clubByName = (name) => ({ name, atk: 65, mid: 65, def: 65 });
global.ranking = () => [];
global.position = () => 1;
global.curComp = () => ({ id: global.state?.compId || "bra-d", name: "Campeonato Brasileiro Série D", teams: 96 });
global.compById = (id) => {
  if (id === "bra-d") return { id: "bra-d", name: "Campeonato Brasileiro Série D", teams: 96 };
  if (id === "bra-est-df") return { id: "bra-est-df", name: "Campeonato Candango", teams: 10 };
  return { id, name: id, teams: 20 };
};
global.competitionClubs = (comp, clubName) => {
  const count = comp.id === "bra-d" ? 96 : 20;
  const list = [{ name: clubName, atk: 65, mid: 65, def: 65 }];
  for (let i = 1; i < count; i++) {
    list.push({ name: `Clube ${i}`, atk: 65, mid: 65, def: 65 });
  }
  return list;
};
global.buildSchedule = (comp, teams) => {
  const rounds = 24;
  const sched = [];
  for (let r = 0; r < rounds; r++) {
    sched.push([[teams[0], teams[1] || "Adversário"]]);
  }
  return sched;
};
global.clone = (obj) => JSON.parse(JSON.stringify(obj));
global.expireSeasonSponsorContracts = () => [];
global.startSeasonTransferWindow = () => {};
global.executeSeasonTransitions = () => {};
global.refreshAnnualSponsorValues = () => {};
global.generateSponsorOffers = () => [];
global.uniqueAvailableSponsorOffers = (a) => a;
global.restorePlayerCareerSquad = () => {};
global.generateWorldRegens = () => {};
global.expireStadiumEventConfirmation = () => {};
global.simulateRemainingWorldTournaments = () => {};
global.getCopaDoBrasilState = () => ({ champion: null });
global.closeCustomModal = () => {};
global.totalBankDebt = () => 0;
global.registerTrophyInMuseum = () => {};
global.getSaveGameMode = (entry) => {
  if (!entry) return null;
  const s = entry?.data && typeof entry.data === 'object' ? entry.data : entry;
  return s.gameMode === 'player' || s.isPlayerMode || s.playerCareerState ? 'player' : 'manager';
};
global.isPlayerCareerActive = (s) => Boolean(s?.gameMode === 'player' || s?.isPlayerMode || s?.playerCareerState);

// Load game.js and player_mode_ui.js
const gameCode = fs.readFileSync(path.join(__dirname, "../js/game.js"), "utf8").replace(/\r\n/g, "\n");
const playerUiCode = fs.readFileSync(path.join(__dirname, "../js/player/player_mode_ui.js"), "utf8").replace(/\r\n/g, "\n");

function extractFunction(code, fnName) {
  const start = code.indexOf(`function ${fnName}(`);
  if (start === -1) throw new Error(`Função ${fnName} não encontrada no código`);
  let braceCount = 0;
  let started = false;
  let end = -1;
  for (let i = start; i < code.length; i++) {
    if (code[i] === "{") {
      braceCount++;
      started = true;
    } else if (code[i] === "}") {
      braceCount--;
      if (started && braceCount === 0) {
        end = i + 1;
        break;
      }
    }
  }
  return code.substring(start, end);
}

// Evaluate core functions
eval(extractFunction(gameCode, "getDateForRound"));
eval(extractFunction(gameCode, "repairEarnedStatePromotion"));
eval(extractFunction(gameCode, "getSeriesDGroupStandings"));
if (gameCode.includes("window.getSeriesDGroupStandings = getSeriesDGroupStandings;")) {
  window.getSeriesDGroupStandings = getSeriesDGroupStandings;
}
eval(extractFunction(gameCode, "advanceSeasonYear"));

// Extract AFM_SAVE_VERIFIER
const verifierStart = gameCode.indexOf("window.AFM_SAVE_VERIFIER = (function(){");
assert.ok(verifierStart > 0, "AFM_SAVE_VERIFIER deve existir em game.js");
let verBrace = 0, verStarted = false, verEnd = -1;
for (let i = verifierStart; i < gameCode.length; i++) {
  if (gameCode[i] === "{") { verBrace++; verStarted = true; }
  else if (gameCode[i] === "}") {
    verBrace--;
    if (verStarted && verBrace === 0) { verEnd = i + 1; break; }
  }
}
eval(gameCode.substring(verifierStart, verEnd) + ")();");

// --------------------------------------------------------------------------
// TESTE 1: window.getSeriesDGroupStandings exportado e sanitização de pontos
// --------------------------------------------------------------------------
console.log("Teste 1: getSeriesDGroupStandings e grupos A, B, C, D de 24 clubes...");
assert.strictEqual(typeof window.getSeriesDGroupStandings, "function", "window.getSeriesDGroupStandings deve estar exposto em window");

// Cria roster de 96 clubes com Brasília no Grupo D (índice 72)
const roster96 = [];
for (let i = 0; i < 96; i++) {
  if (i === 72) roster96.push("Brasília");
  else roster96.push(`Clube D ${i}`);
}

global.state = {
  season: 2027,
  compId: "bra-d",
  club: "Brasília",
  round: 0,
  teams: roster96.map((name, i) => ({
    name,
    p: i === 72 ? 24 : 0, // pontos contaminados de estadual no usuário
    j: i === 72 ? 9 : 0,
    v: i === 72 ? 8 : 0,
    e: 0,
    d: i === 72 ? 1 : 0,
    gp: i === 72 ? 22 : 0,
    gc: i === 72 ? 6 : 0,
    sg: i === 72 ? 16 : 0,
    form: []
  })),
  history: []
};

const groups = window.getSeriesDGroupStandings(roster96, global.state.teams);
assert.ok(groups.A && groups.B && groups.C && groups.D, "Deve conter os 4 grupos A, B, C e D");
assert.strictEqual(groups.A.length, 24, "Grupo A deve ter 24 clubes");
assert.strictEqual(groups.D.length, 24, "Grupo D deve ter 24 clubes");

const brasiliaRow = groups.D.find(t => norm(t.name) === "brasilia");
assert.ok(brasiliaRow, "Brasília deve estar presente no Grupo D");
assert.strictEqual(brasiliaRow.p, 0, "Brasília deve ter pontos sanitizados para 0 na rodada 0 da Série D");
assert.strictEqual(brasiliaRow.j, 0, "Brasília deve ter jogos sanitizados para 0 na rodada 0 da Série D");
console.log("✅ Teste 1 concluído com sucesso!");

// --------------------------------------------------------------------------
// TESTE 2: repairEarnedStatePromotion não dispara prematuramente com nextSeasonCompId
// --------------------------------------------------------------------------
console.log("Teste 2: repairEarnedStatePromotion bloqueado contra sequestro via nextSeasonCompId...");
const prematureSave = {
  season: 2026,
  compId: "bra-est-df",
  club: "Brasília",
  nextSeasonCompId: "bra-d",
  teams: [{ name: "Brasília", p: 24, j: 9, v: 8, e: 0, d: 1, gp: 22, gc: 6, sg: 16 }],
  competitionTeams: {
    "bra-a": Array(20).fill("ClubA"),
    "bra-b": Array(20).fill("ClubB"),
    "bra-c": Array(20).fill("ClubC"),
    "bra-d": roster96
  }
};

const repResult = repairEarnedStatePromotion(prematureSave);
assert.strictEqual(repResult, false, "repairEarnedStatePromotion NÃO deve aplicar promoção imediata se for apenas nextSeasonCompId");
assert.strictEqual(prematureSave.compId, "bra-est-df", "compId deve continuar bra-est-df");
console.log("✅ Teste 2 concluído com sucesso!");

// --------------------------------------------------------------------------
// TESTE 3: advanceSeasonYear(true) avança o ano, zera tabela e sincroniza datas
// --------------------------------------------------------------------------
console.log("Teste 3: advanceSeasonYear com virada garantida e tabela zerada...");
global.state = {
  season: 2026,
  compId: "bra-est-df",
  nextSeasonCompId: "bra-d",
  club: "Brasília",
  round: 9,
  date: "2026-02-07",
  currentDate: "2026-02-07",
  gameMode: "player",
  playerCareerState: { name: "D,.Aquino" },
  teams: [{ name: "Brasília", p: 24, j: 9, v: 8, e: 0, d: 1, gp: 22, gc: 6, sg: 16 }],
  competitionTeams: {
    "bra-a": Array(20).fill("ClubA"),
    "bra-b": Array(20).fill("ClubB"),
    "bra-c": Array(20).fill("ClubC"),
    "bra-d": roster96
  },
  history: []
};

global.getPendingClubCompetitions = () => [{ name: "Série D", date: "2026-01-17" }]; // simula teste de pendência
const advSuccess = advanceSeasonYear(true); // forced = true vindo do modal de fim de temporada
assert.strictEqual(advSuccess, true, "advanceSeasonYear(true) deve concluir com sucesso");
assert.strictEqual(global.state.season, 2027, "state.season deve avançar para 2027");
assert.strictEqual(global.state.compId, "bra-d", "state.compId deve ter virado para bra-d");
assert.strictEqual(global.state.round, 0, "state.round deve resetar para 0");
assert.strictEqual(global.state.date, "2027-01-17", "state.date no Modo Jogador deve ser 2027-01-17");
assert.ok(Array.isArray(global.state.teams) && global.state.teams.length === 96, "state.teams deve ter 96 clubes na Série D");

const userTeamInD = global.state.teams.find(t => norm(t.name) === "brasilia");
assert.ok(userTeamInD, "Brasília deve estar em state.teams");
assert.strictEqual(userTeamInD.p, 0, "Brasília deve ter 0 pontos na nova temporada");
assert.strictEqual(userTeamInD.j, 0, "Brasília deve ter 0 jogos na nova temporada");
assert.strictEqual(userTeamInD.v, 0, "Brasília deve ter 0 vitórias na nova temporada");
console.log("✅ Teste 3 concluído com sucesso!");

// --------------------------------------------------------------------------
// TESTE 4: Auto-Cura de saves corrompidos via AFM_SAVE_VERIFIER
// --------------------------------------------------------------------------
console.log("Teste 4: AFM_SAVE_VERIFIER curando save travado em 2026 Série D com pontos do Candangão...");
const corruptedSave = {
  gameMode: "player",
  season: 2026,
  compId: "bra-d",
  club: "Brasília",
  round: 0,
  date: "2026-02-07",
  currentDate: "2026-02-07",
  playerCareerState: { name: "D,.Aquino" },
  teams: [
    { name: "Brasília", p: 24, j: 9, v: 8, e: 0, d: 1, gp: 22, gc: 6, sg: 16 } // pontos residuais de Candangão
  ],
  schedule: Array(24).fill([["Brasília", "Real Noroeste"]]),
  history: [
    // 9 partidas de Candangão no histórico de 2026
    { season: 2026, competitionId: "bra-est-df", h: "Brasília", a: "ARUC", hg: 2, ag: 0 },
    { season: 2026, competitionId: "bra-est-df", h: "Brasília", a: "Paranoá", hg: 3, ag: 1 },
    { season: 2026, competitionId: "bra-est-df", h: "Brasília", a: "Ceilândia", hg: 1, ag: 0 },
    { season: 2026, competitionId: "bra-est-df", h: "Brasília", a: "Gama", hg: 2, ag: 1 },
    { season: 2026, competitionId: "bra-est-df", h: "Brasília", a: "Brasiliense", hg: 0, ag: 1 },
    { season: 2026, competitionId: "bra-est-df", h: "Brasília", a: "Capital-DF", hg: 3, ag: 0 },
    { season: 2026, competitionId: "bra-est-df", h: "Brasília", a: "Sobradinho", hg: 4, ag: 1 },
    { season: 2026, competitionId: "bra-est-df", h: "Brasília", a: "Samambaia", hg: 2, ag: 0 },
    { season: 2026, competitionId: "bra-est-df", h: "Brasília", a: "Real Brasília", hg: 5, ag: 2 }
  ]
};
for (let i = 1; i < 96; i++) {
  corruptedSave.teams.push({ name: `Clube ${i}`, p: 0, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0, form: [] });
}

const healReport = window.AFM_SAVE_VERIFIER.verifyAndHealState(corruptedSave, { slot: 1 });
assert.ok(healReport.healedCount > 0, "O verificador deve detectar e curar as inconsistências");
assert.strictEqual(corruptedSave.season, 2027, "O verificador deve avançar o save curado para a Temporada 2027");
assert.strictEqual(corruptedSave.date, "2027-01-17", "A data deve ser sincronizada para 2027-01-17");
assert.strictEqual(corruptedSave.round, 0, "A rodada deve ser 0");

const healedUserTeam = corruptedSave.teams.find(t => norm(t.name) === "brasilia");
assert.strictEqual(healedUserTeam.p, 0, "Pontos do atleta/clube devem ser zerados na tabela da Série D");
assert.strictEqual(healedUserTeam.j, 0, "Jogos do atleta/clube devem ser zerados na tabela da Série D");
console.log("✅ Teste 4 concluído com sucesso!");

console.log("\nTODOS OS 4 TESTES UNITÁRIOS FORAM EXECUTADOS COM SUCESSO! 🎉");
