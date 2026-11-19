/**
 * Suíte de Testes Automatizados: Recordes por Competição, Título de Artilheiro e Avanço de Temporada
 * Regra 26 — AFM Manager 2026/2027
 */

const assert = require("assert");
const fs = require("fs");
const path = require("path");

console.log("Iniciando testes: Recordes por Competição, Artilharia e Avanço de Temporada...");

// Setup mock do ambiente de navegador
global.window = global;
global.document = {
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => []
};

// Carrega o motor do atleta
const enginePath = path.join(__dirname, "../js/player/player_career_engine.js");
const engineCode = fs.readFileSync(enginePath, "utf-8");
eval(engineCode);

// Teste 1: getCompetitionRecords retorna alvos e detentores específicos por competição
console.log("Teste 1: getCompetitionRecords por competição...");
const recCandango = window.AFM_PlayerEngine.getCompetitionRecords("bra-est-df");
assert.strictEqual(recCandango.compName, "Campeonato Candango");
assert.strictEqual(recCandango.mostGoalsSeason.value, 14);
assert.strictEqual(recCandango.mostGoalsSeason.holder, "Tatu");
assert.strictEqual(recCandango.mostAssistsSeason.value, 8);
assert.strictEqual(recCandango.longestUnbeatenStreak.value, 11);

const recSerieD = window.AFM_PlayerEngine.getCompetitionRecords("bra-d");
assert.strictEqual(recSerieD.compName, "Campeonato Brasileiro Série D");
assert.strictEqual(recSerieD.mostGoalsSeason.value, 13);
assert.strictEqual(recSerieD.mostGoalsSeason.holder, "Nino Guerreiro");
assert.strictEqual(recSerieD.mostAssistsSeason.value, 8);
assert.strictEqual(recSerieD.longestUnbeatenStreak.value, 24);

const recSerieA = window.AFM_PlayerEngine.getCompetitionRecords("bra-a");
assert.strictEqual(recSerieA.compName, "Campeonato Brasileiro Série A");
assert.strictEqual(recSerieA.mostGoalsSeason.value, 34);
assert.strictEqual(recSerieA.mostGoalsSeason.holder, "Washington (Coração Valente)");
assert.strictEqual(recSerieA.mostAssistsSeason.value, 14);
assert.strictEqual(recSerieA.longestUnbeatenStreak.value, 24);

console.log("✅ Teste 1 concluído com sucesso!");

// Teste 2: processEndOfSeasonAwards concede Bota de Ouro / Artilharia a partir de matchRatingHistory
console.log("Teste 2: processEndOfSeasonAwards com artilharia garantida...");
const mockState = {
  gameMode: "player",
  season: 2026,
  club: "Brasília",
  compId: "bra-est-df",
  competition: "Campeonato Candango",
  controlledPlayerId: 10,
  squad: [
    { id: 10, name: "D,.Aquino", isControlled: true, pos: "ATA", ovr: 43, age: 15 }
  ],
  playerCareerState: {
    athleteName: "D,.Aquino",
    position: "ATA",
    age: 15,
    overall: 43,
    individualAwards: [],
    competitionRecordsBroken: [
      {
        type: "mostGoalsSeason",
        title: "Maior Artilheiro em uma Única Edição",
        compName: "Campeonato Candango",
        compId: "bra-est-df",
        value: 18,
        year: 2026
      }
    ],
    seasonStats: {
      season: 2026,
      matches: 9,
      games: 9,
      goals: 18,
      assists: 0,
      avgRating: 9.01
    },
    matchRatingHistory: [
      { date: "2026-01-17", competitionId: "bra-est-df", goals: 3, assists: 0, rating: 9.5, isMvp: true },
      { date: "2026-01-19", competitionId: "bra-est-df", goals: 3, assists: 0, rating: 10.0, isMvp: true },
      { date: "2026-01-22", competitionId: "bra-est-df", goals: 2, assists: 0, rating: 8.8, isMvp: true },
      { date: "2026-01-26", competitionId: "bra-est-df", goals: 2, assists: 0, rating: 8.9, isMvp: true },
      { date: "2026-01-29", competitionId: "bra-est-df", goals: 2, assists: 0, rating: 9.0, isMvp: true },
      { date: "2026-02-02", competitionId: "bra-est-df", goals: 2, assists: 0, rating: 8.7, isMvp: false },
      { date: "2026-02-05", competitionId: "bra-est-df", goals: 1, assists: 0, rating: 8.5, isMvp: false },
      { date: "2026-02-09", competitionId: "bra-est-df", goals: 2, assists: 0, rating: 9.2, isMvp: true },
      { date: "2026-02-12", competitionId: "bra-est-df", goals: 1, assists: 0, rating: 8.5, isMvp: false }
    ],
    careerStats: { titles: [] },
    careerHistory: { seasons: [], totals: {} }
  }
};

window.AFM_PlayerEngine.processEndOfSeasonAwards(mockState, 2026, { isSingleCompEnd: true, compId: "bra-est-df" });

const hasTopScorerAward = mockState.playerCareerState.individualAwards.some(
  (a) => (a.id.includes("top_scorer") || a.badge === "ARTILHEIRO OFICIAL") && a.year === 2026
);
assert.strictEqual(hasTopScorerAward, true, "Atleta deve receber o troféu oficial de Artilheiro do Candangão!");
console.log("✅ Teste 2 concluído com sucesso!");

// Teste 3: AFM_SAVE_VERIFIER auto-cura save travado em 2026 Série D com 18 gols
console.log("Teste 3: AFM_SAVE_VERIFIER curando save travado na transição Candangão ➔ Série D...");

// Read game.js and extract AFM_SAVE_VERIFIER
const gameCode = fs.readFileSync(path.join(__dirname, "../js/game.js"), "utf8").replace(/\r\n/g, "\n");
global.formatDatePtBr = (d) => d;
global.getDateForRound = (r, s) => `${s}-01-17`;
global.compById = (id) => ({ id, name: id === 'bra-d' ? 'Campeonato Brasileiro Série D' : id === 'bra-est-df' ? 'Campeonato Candango' : id });
global.normalizeCompStatsId = (id) => String(id || '').trim().toLowerCase();
global.getSaveGameMode = (entry) => {
  if (!entry) return null;
  const s = entry?.data && typeof entry.data === 'object' ? entry.data : entry;
  return s.gameMode === 'player' || s.isPlayerMode || s.playerCareerState ? 'player' : 'manager';
};
global.isPlayerCareerActive = (s) => Boolean(s?.gameMode === 'player' || s?.isPlayerMode || s?.playerCareerState);

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

const stuckState = {
  gameMode: "player",
  season: 2026,
  date: "2026-01-17",
  currentDate: "2026-01-17",
  round: 0,
  club: "Brasília",
  compId: "bra-d",
  competition: "Campeonato Brasileiro Série D",
  controlledPlayerId: 10,
  teams: [
    { name: "Brasília", j: 9, p: 21, gp: 20, gc: 5, sg: 15 },
    { name: "ARUC", j: 9, p: 24, gp: 18, gc: 4, sg: 14 }
  ],
  squad: [
    { id: 10, name: "D,.Aquino", isControlled: true, pos: "ATA", ovr: 43, age: 15, goals: 18, matches: 9, games: 9 }
  ],
  history: [
    { season: 2026, competitionId: "bra-est-df", competitionName: "Campeonato Candango", goals: 3 }
  ],
  playerCareerState: {
    athleteName: "D,.Aquino",
    position: "ATA",
    age: 15,
    overall: 43,
    individualAwards: [],
    competitionRecordsBroken: [
      { type: "mostGoalsSeason", title: "Maior Artilheiro em uma Única Edição", value: 18, year: 2026 }
    ],
    seasonStats: {
      season: 2026,
      matches: 9,
      games: 9,
      goals: 18,
      assists: 0,
      avgRating: 9.01
    },
    matchRatingHistory: [
      { date: "2026-01-17", competitionId: "bra-est-df", goals: 3, assists: 0, rating: 9.5 }
    ],
    careerStats: { titles: [] },
    careerHistory: { seasons: [], totals: {} }
  }
};

const verifyResult = window.AFM_SAVE_VERIFIER.verifyAndHealState(stuckState);
assert.strictEqual(verifyResult.ok, true);
assert.strictEqual(stuckState.season, 2027, "O ano deve avançar para 2027!");
assert.strictEqual(stuckState.date, "2027-01-17", "A data deve ser 17 de janeiro de 2027!");
assert.strictEqual(stuckState.playerCareerState.seasonStats.goals, 0, "Gols em 2027 iniciam zerados!");
assert.strictEqual(stuckState.playerCareerState.seasonStats.matches, 0, "Jogos em 2027 iniciam zerados!");
assert.strictEqual(stuckState.teams[0].j, 0, "Tabela de clubes inicia zerada com 0 jogos!");
assert.strictEqual(stuckState.teams[0].p, 0, "Tabela de clubes inicia zerada com 0 pontos!");

// Verifica se a temporada 2026 foi arquivada
const season2026Archive = stuckState.playerCareerState.careerHistory.seasons.find((s) => Number(s.season || s.year) === 2026);
assert.ok(season2026Archive, "A temporada 2026 deve ser arquivada no histórico!");
assert.strictEqual(season2026Archive.goals, 18, "Gols arquivados de 2026 devem ser 18!");
assert.strictEqual(season2026Archive.club, "Brasília");

// Verifica se a artilharia oficial foi concedida
const topScorerInArchive = stuckState.playerCareerState.individualAwards.find(
  (a) => a.id.includes("top_scorer") || a.badge === "ARTILHEIRO OFICIAL"
);
assert.ok(topScorerInArchive, "Bota de Ouro / Artilharia deve estar concedida!");

// Verifica se competitionRecordsBroken foi curado com compName e previousHolder
const brokenRecord = stuckState.playerCareerState.competitionRecordsBroken[0];
assert.strictEqual(brokenRecord.compName, "Campeonato Candango", "compName não pode ficar vazio!");
assert.ok(brokenRecord.previousHolder, "previousHolder não pode ficar vazio!");

console.log("✅ Teste 3 concluído com sucesso!");

// Teste 4: Verificação da contagem de Artilharias Oficiais na UI
console.log("Teste 4: Contagem de Artilharias Oficiais...");
const awardsList = stuckState.playerCareerState.individualAwards;
const artilhariasCount = awardsList.filter(
  (a) => a.id.startsWith("league_top_scorer") || a.id.startsWith("comp_top_scorer") || a.id.startsWith("record_goals") || a.badge === "ARTILHEIRO OFICIAL" || (a.title && a.title.toLowerCase().includes("artilheir"))
).length;
assert.ok(artilhariasCount >= 1, "Contador de Artilharias Oficiais deve ser pelo menos 1!");
console.log("✅ Teste 4 concluído com sucesso!");

console.log("\nTODOS OS 4 TESTES UNITÁRIOS PASSARAM COM 100% DE SUCESSO! 🎉");
