/**
 * Testes Unitários: Reset de Títulos Individuais Oficiais & Calibração de Convocação da Seleção
 * Validações:
 * 1. computeCompetitionAwards e syncCompetitionStatsComprehensive limpos na virada de temporada e na Série D unplayed (zero jogos).
 * 2. Sem herança de gols de Candangão ou de seasonStats para competições não iniciadas.
 * 3. calculateCallUpScore e generateNationalTeamCallUp com piso de 75 OVR para o Brasil (jogador de 43 OVR fica "Fora").
 * 4. Sem discrepância de 0 Jogos com 2 Gols na tabela de convocação da Seleção.
 * 5. AFM_SAVE_VERIFIER auto-cura de estatísticas e títulos individuais contaminados.
 */

const assert = require("assert");
const fs = require("fs");
const path = require("path");

// Mock global window/DOM environment
global.window = global;
global.document = {
  createElement: () => ({ style: {} }),
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => []
};

// Utilities mocks
global.esc = (str) => String(str || "");
global.norm = (str) => String(str || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
global.hashStr = (s) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h) + s.charCodeAt(i) | 0;
  return h;
};
global.clubBadge = () => "";
global.playerPhoto = () => "";
global.compById = (id) => ({ id, name: id === 'bra-d' ? 'Campeonato Brasileiro Série D' : id === 'bra-est-df' ? 'Campeonato Candango' : id });
global.normalizeCompStatsId = (id) => String(id || '').trim().toLowerCase();
global.formatDatePtBr = (d) => d;
global.getDateForRound = (r, s) => `${s}-01-17`;
global.totalBankDebt = () => 0;
global.registerTrophyInMuseum = () => {};
global.getSaveGameMode = (entry) => {
  if (!entry) return null;
  const s = entry?.data && typeof entry.data === 'object' ? entry.data : entry;
  return s.gameMode === 'player' || s.isPlayerMode || s.playerCareerState ? 'player' : 'manager';
};
global.isPlayerCareerActive = (s) => Boolean(s?.gameMode === 'player' || s?.isPlayerMode || s?.playerCareerState);

// Read core files
const gameCode = fs.readFileSync(path.join(__dirname, "../js/game.js"), "utf8").replace(/\r\n/g, "\n");
const natCode = fs.readFileSync(path.join(__dirname, "../js/player/national_teams_manager.js"), "utf8").replace(/\r\n/g, "\n");

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

// Evaluate functions from game.js
eval(extractFunction(gameCode, "getCompetitionAwardsMeta"));
eval(extractFunction(gameCode, "getStateCompStats"));
eval(extractFunction(gameCode, "getClubSquadForStats"));
eval(extractFunction(gameCode, "collectCompetitionClubSummaries"));
eval(extractFunction(gameCode, "syncCompetitionStatsComprehensive"));
eval(extractFunction(gameCode, "computeCompetitionAwards"));

// Extract AFM_SAVE_VERIFIER from game.js
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

// Evaluate national teams manager
eval(natCode);

console.log("Iniciando testes unitários: Títulos Individuais e Convocação da Seleção...");

// --------------------------------------------------------------------------
// TESTE 1: Títulos Individuais Oficiais retornam "A definir" em Série D zerada
// --------------------------------------------------------------------------
console.log("Teste 1: computeCompetitionAwards em Série D sem jogos disputados...");

const roster96 = [];
for (let i = 0; i < 96; i++) {
  roster96.push(i === 0 ? "Brasília" : `Clube D ${i}`);
}

global.state = {
  season: 2027,
  compId: "bra-d",
  club: "Brasília",
  round: 0,
  gameMode: "player",
  playerCareerState: {
    athleteName: "D,.Aquino",
    seasonStats: {
      goals: 0,
      matches: 0,
      assists: 0
    },
    competitionStatsByComp: {}
  },
  squad: [
    { id: 1, name: "D,.Aquino", isControlled: true, pos: "ST", ovr: 43, goals: 0, matches: 0, games: 0 }
  ],
  teams: roster96.map(name => ({ name, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0, p: 0, form: [] })),
  competitionStats: {},
  history: []
};

const awards = computeCompetitionAwards("bra-d", "Campeonato Brasileiro Série D");
assert.strictEqual(awards.hasPlayedMatches, false, "hasPlayedMatches deve ser false em competição não iniciada");
assert.strictEqual(awards.maxMatches, 0, "maxMatches deve ser 0");
assert.strictEqual(awards.topScorer.hasWinner, false, "topScorer não deve ter vencedor antes do início");
assert.strictEqual(awards.topScorer.winnerName, "A definir", "topScorer winnerName deve ser 'A definir'");
assert.strictEqual(awards.mvp.hasWinner, false, "mvp não deve ter vencedor antes do início");
assert.strictEqual(awards.mvp.winnerName, "A definir", "mvp winnerName deve ser 'A definir'");

console.log("✅ Teste 1 concluído com sucesso!");

// --------------------------------------------------------------------------
// TESTE 2: syncCompetitionStatsComprehensive não herda gols de Candangão
// --------------------------------------------------------------------------
console.log("Teste 2: syncCompetitionStatsComprehensive não contamina Série D...");

// Simula state onde o atleta jogou Candangão anteriormente com 18 gols
global.state.playerCareerState.seasonStats.goals = 18; // Resíduo se não tivesse sido limpo
global.state.playerCareerState.seasonStats.matches = 9;
global.state.history = [
  { competitionId: "bra-est-df", events: [{ type: "gol", scorer: "D,.Aquino" }], season: 2026 }
];

const stats = syncCompetitionStatsComprehensive("bra-d");
assert.strictEqual(stats.scorers.length, 0, "stats.scorers da Série D deve permanecer vazio quando 0 jogos ocorreram");
assert.strictEqual(stats.assists.length, 0, "stats.assists da Série D deve permanecer vazio quando 0 jogos ocorreram");

console.log("✅ Teste 2 concluído com sucesso!");

// --------------------------------------------------------------------------
// TESTE 3: calculateCallUpScore e generateNationalTeamCallUp para atleta 43 OVR
// --------------------------------------------------------------------------
console.log("Teste 3: Convocação da Seleção com piso de 75 OVR para o Brasil...");

const natManager = window.AFM_NationalTeams;
assert.ok(natManager, "AFM_NationalTeams deve estar definido");

global.state.season = 2027;
global.state.round = 0;
global.state.controlledPlayerId = 1;
global.state.playerCareerState = {
  nationality: "Brasil",
  athleteName: "D,.Aquino",
  managerTrust: 89,
  seasonStats: {
    matches: 0,
    games: 0,
    goals: 0,
    assists: 0,
    avgRating: 6.5
  }
};

const userPlayer = {
  id: 1,
  name: "D,.Aquino",
  isControlled: true,
  club: "Brasília",
  nationality: "Brasil",
  pos: "ST",
  overall: 43,
  ovr: 43
};

global.state.squad = [userPlayer];

// Pack com Vinicius Jr e Neymar
global.window.livePlayers = [
  { id: 101, name: "Vinicius Jr", club: "Real Madrid", country: "Brasil", pos: "LW", overall: 91, ovr: 91 },
  { id: 102, name: "Raphinha", club: "FC Barcelona", country: "Brasil", pos: "RW", overall: 89, ovr: 89 },
  { id: 103, name: "Neymar", club: "Santos", country: "Brasil", pos: "ST", overall: 88, ovr: 88 },
  { id: 104, name: "Rodrygo", club: "Real Madrid", country: "Brasil", pos: "RW", overall: 87, ovr: 87 },
  { id: 105, name: "Matheus Cunha", club: "Manchester United", country: "Brasil", pos: "ST", overall: 85, ovr: 85 },
  { id: 106, name: "Estêvão", club: "Chelsea", country: "Brasil", pos: "RW", overall: 84, ovr: 84 },
  { id: 107, name: "Gabriel Martinelli", club: "Al-Hilal", country: "Brasil", pos: "LW", overall: 84, ovr: 84 }
];

const callUp = natManager.generateNationalTeamCallUp("Brasil", global.state);
assert.ok(callUp, "callUp deve ser gerado");
assert.strictEqual(callUp.isUserCalledUp, false, "Atleta de 43 OVR NÃO pode ser convocado para o Brasil");
assert.ok(callUp.userStatus.includes("Fora da Convocação"), "userStatus deve indicar 'Fora da Convocação'");

// Verifica pontuação do atleta de 43 OVR vs Vinicius Jr
const viniScore = natManager.calculateCallUpScore(global.window.livePlayers[0], global.state);
const userScore = natManager.calculateCallUpScore(userPlayer, global.state);

assert.ok(userScore < 80, `Pontuação de atleta 43 OVR deve ser menor que 80 (foi ${userScore})`);
assert.ok(viniScore > 90, `Pontuação de Vinicius Jr 91 OVR deve ser maior que 90 (foi ${viniScore})`);
assert.ok(viniScore > userScore + 30, `Vinicius Jr deve estar substancialmente à frente do atleta 43 OVR (Vini: ${viniScore}, User: ${userScore})`);

// Verifica ranking dos atacantes
const attRankings = callUp.rankings.ATT;
const userRank = attRankings.findIndex(p => p.isUser);
assert.ok(userRank >= 6, `Atleta de 43 OVR não pode estar entre os 6 convocados do setor (ficou na posição ${userRank + 1})`);

// Verifica se os jogos e gols do usuário não exibem 0 jogos com 2 gols
const userInPool = attRankings.find(p => p.isUser);
assert.strictEqual(userInPool.matches, 0, "Matches do atleta deve ser 0");
assert.strictEqual(userInPool.goals, 0, "Goals do atleta deve ser 0 quando matches é 0");

console.log("✅ Teste 3 concluído com sucesso!");

// --------------------------------------------------------------------------
// TESTE 4: Auto-Cura de AFM_SAVE_VERIFIER para estatísticas contaminadas
// --------------------------------------------------------------------------
console.log("Teste 4: AFM_SAVE_VERIFIER curando estatísticas de Série D com scorers de Candangão...");

const contaminatedSave = {
  season: 2027,
  compId: "bra-d",
  club: "Brasília",
  round: 0,
  teams: roster96.map(name => ({ name, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0, p: 0, form: [] })),
  squad: [
    { id: 1, name: "D,.Aquino", isControlled: true, pos: "ST", ovr: 43, goals: 2, matches: 0, games: 0 }
  ],
  competitionStats: {
    "bra-d": {
      season: 2027,
      scorers: [
        { name: "D,.Aquino", club: "Brasília", goals: 18, matches: 9 },
        { name: "Tobinha", club: "Brasiliense", goals: 6, matches: 9 }
      ],
      assists: [
        { name: "Tarta", club: "Brasiliense", assists: 3, matches: 9 }
      ]
    }
  },
  playerCareerState: {
    athleteName: "D,.Aquino",
    seasonStats: { goals: 0, matches: 0 }
  }
};

const healReport = window.AFM_SAVE_VERIFIER.verifyAndHealState(contaminatedSave);
assert.strictEqual(contaminatedSave.competitionStats["bra-d"].scorers.length, 0, "scorers da Série D deve ser limpo para 0");
assert.strictEqual(contaminatedSave.competitionStats["bra-d"].assists.length, 0, "assists da Série D deve ser limpo para 0");
assert.strictEqual(contaminatedSave.squad[0].goals, 0, "goals do atleta na squad em round 0 deve ser limpo para 0");

console.log("✅ Teste 4 concluído com sucesso!");

console.log("\nTODOS OS 4 TESTES UNITÁRIOS PASSARAM COM 100% DE SUCESSO! 🎉");
