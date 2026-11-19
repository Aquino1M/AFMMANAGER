const assert = require("assert");
const fs = require("fs");
const path = require("path");

console.log("Iniciando testes unitários: Encerramento de Temporada e Cerimônia de Campeão no Modo Jogador...");

// Mock básico do DOM
global.window = global;
global.document = {
  body: {
    appendChild: (el) => el,
    removeChild: (el) => el,
  },
  getElementById: (id) => null,
  createElement: (tag) => {
    return {
      tagName: tag.toUpperCase(),
      style: {},
      children: [],
      classList: { add: () => {}, remove: () => {} },
      appendChild: function(c) { this.children.push(c); return c; },
      remove: function() {},
      querySelectorAll: () => [],
      querySelector: () => null
    };
  },
  querySelectorAll: () => []
};

// Funções utilitárias mockadas
global.rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
global.clamp = (val, min, max) => Math.max(min, Math.min(max, val));
global.norm = (str) => String(str || "").toLowerCase().trim();
global.esc = (str) => String(str || "");
global.fmtMoney = (n) => `R$ ${(Number(n) || 0).toLocaleString("pt-BR")}`;
global.formatDatePtBr = (d) => String(d);
global.clubBadge = (club, size) => `<span class="badge-${size}">${club}</span>`;
global.playCheerSound = () => {};
global.playWhistleSound = () => {};
global.toast = () => {};
global.save = () => {};
global.render = () => {};
global.recordAFMError = () => {};

let customModalOpened = null;
global.openCustomModal = (title, body, onConfirm, confirmText, isCancel, width, onDismiss) => {
  customModalOpened = { title, body, onConfirm, confirmText, isCancel, width, onDismiss };
};
global.closeCustomModal = () => { customModalOpened = null; };

// Carrega o código relevante de game.js
const gameCode = fs.readFileSync(path.join(__dirname, "../js/game.js"), "utf8");

// Extrai e avalia funções essenciais
function extractFunction(code, fnName) {
  const start = code.indexOf(`function ${fnName}(`);
  if (start === -1) throw new Error(`Função ${fnName} não encontrada em game.js`);
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

// Avalia funções necessárias
eval(extractFunction(gameCode, "openPostMatchInterviewModal"));
eval(extractFunction(gameCode, "openPressConferenceModal"));
eval(extractFunction(gameCode, "showChampionTrophyCeremonyModal"));
eval(extractFunction(gameCode, "showPlayerEndOfSeasonModal"));
eval(extractFunction(gameCode, "showEndOfSeasonModal"));

// Mock de state e helpers
global.clubs = [
  { name: "Brasília", strength: () => 50, competition: "Campeonato Candango" },
  { name: "Volta Redonda", strength: () => 55, competition: "Brasileirão Série C" },
  { name: "CSKA Sofia", strength: () => 65, competition: "UEFA Conference League" }
];
global.clubByName = (name) => ({ name, strength: 50 });
global.strength = (c) => (typeof c?.strength === "function" ? c.strength() : Number(c?.strength || 50));
global.position = () => 1;
global.curComp = () => ({ id: "bra-est-df", name: "Campeonato Candango" });
global.calculateSeasonPrizeMoney = () => 100000;
global.getPendingClubCompetitions = () => [];
global.registerTrophyInMuseum = (s, title, year) => {
  s.titles = s.titles || [];
  s.titles.push({ name: title, year });
};

// -------------------------------------------------------------
// Teste 1: Coletiva de Imprensa desativada no Modo Jogador
// -------------------------------------------------------------
console.log("Teste 1: Verificando desativação da coletiva de imprensa no Modo Jogador...");
global.state = {
  gameMode: "player",
  isPlayerMode: true,
  manager: "Treinador da IA",
  club: "Brasília",
  trust: { fans: 70, squad: 70, board: 70 },
  playerCareerState: { name: "D,.Aquino" }
};

let callbackFired = false;
customModalOpened = null;
openPostMatchInterviewModal({ gf: 2, ga: 0, opponent: "ARUC" }, () => {
  callbackFired = true;
});
assert.strictEqual(callbackFired, true, "openPostMatchInterviewModal deve disparar onComplete imediatamente no Modo Jogador");
assert.strictEqual(customModalOpened, null, "openPostMatchInterviewModal NÃO deve abrir modal no Modo Jogador");

let pressCallbackFired = false;
openPressConferenceModal("post", null, () => {
  pressCallbackFired = true;
});
assert.strictEqual(pressCallbackFired, true, "openPressConferenceModal deve disparar onComplete imediatamente no Modo Jogador");
assert.strictEqual(customModalOpened, null, "openPressConferenceModal NÃO deve abrir modal no Modo Jogador");
console.log("✅ Teste 1 passou com sucesso!");

// -------------------------------------------------------------
// Teste 2: Cerimônia de Campeão no Modo Jogador (1º Título e Bicampeonato)
// -------------------------------------------------------------
console.log("Teste 2: Verificando Cerimônia de Campeão para o atleta...");

// 2a. Primeiro Título
global.state = {
  gameMode: "player",
  isPlayerMode: true,
  season: 2026,
  manager: "Treinador da IA",
  club: "Brasília",
  titles: [],
  controlledPlayerId: 10,
  squad: [{ id: 10, isControlled: true, name: "D,.Aquino", pos: "ST", ovr: 45 }],
  playerCareerState: {
    name: "D,.Aquino",
    careerStats: { titles: [] }
  }
};

let overlayContainer = null;
global.$ = (sel) => {
  if (sel === "#trophyCeremonyContainer") return overlayContainer;
  if (sel === "#btnClaimTrophyCeremony") return { onclick: null };
  return null;
};
global.document.getElementById = (id) => {
  if (id === "trophyCeremonyContainer") return overlayContainer;
  return null;
};
global.document.createElement = (tag) => {
  const el = {
    id: "",
    innerHTML: "",
    remove: () => { overlayContainer = null; }
  };
  overlayContainer = el;
  return el;
};

showChampionTrophyCeremonyModal({ name: "Campeonato Candango" }, () => {});

assert(overlayContainer, "Deve criar o container da cerimônia de campeão");
assert(overlayContainer.innerHTML.includes("★ CONQUISTA HISTÓRICA DO ATLETA ★"), "Deve conter o podium do atleta");
assert(overlayContainer.innerHTML.includes("D,.Aquino"), "Deve exibir o nome do atleta");
assert(!overlayContainer.innerHTML.includes("Treinador da IA"), "NUNCA deve exibir Treinador da IA no Modo Jogador");
assert(overlayContainer.innerHTML.includes("Parabéns pelo seu 1º título oficial na carreira!"), "Deve parabenizar pelo 1º título da carreira");

// 2b. Bicampeonato
global.state.titles = [{ name: "Campeonato Candango", year: 2026 }];
global.state.season = 2027;
global.state.playerCareerState.careerStats.titles = [{ name: "Campeonato Candango", year: 2026 }];

showChampionTrophyCeremonyModal({ name: "Campeonato Candango" }, () => {});
assert(overlayContainer.innerHTML.includes("Parabéns pelo seu Bicampeonato na carreira!"), "Deve parabenizar pelo Bicampeonato quando já tiver 1 título anterior");
console.log("✅ Teste 2 passou com sucesso!");

// -------------------------------------------------------------
// Teste 3: Modal de Encerramento da Temporada no Modo Jogador
// -------------------------------------------------------------
console.log("Teste 3: Verificando Modal de Encerramento da Temporada do Atleta...");

global.state = {
  gameMode: "player",
  isPlayerMode: true,
  season: 2026,
  manager: "Treinador da IA",
  club: "Brasília",
  titles: [{ name: "Campeonato Candango", year: 2026 }],
  controlledPlayerId: 10,
  squad: [{ id: 10, isControlled: true, name: "D,.Aquino", pos: "ST", ovr: 48, wage: 1800 }],
  playerCareerState: {
    name: "D,.Aquino",
    coachTrust: 92,
    personalBank: 1548,
    contractUntil: 2029,
    seasonStats: {
      games: 12,
      starterCount: 11,
      goals: 14,
      assists: 4,
      avgRating: 8.45,
      mvpCount: 6,
      yellowCards: 1,
      redCards: 0
    },
    individualAwards: [
      { year: 2026, title: "Craque do Campeonato Candango", icon: "👑", desc: "Eleito o melhor atleta do torneio!" },
      { year: 2026, title: "Artilheiro do Campeonato Candango", icon: "👟", desc: "14 gols marcados!" }
    ],
    agentOffers: [
      { type: "transfer", clubOrBrand: "Volta Redonda", clubLeague: "Brasileirão Série C · Carioca (RJ)", wage: 2500 }
    ]
  }
};

customModalOpened = null;
showEndOfSeasonModal();

assert(customModalOpened, "showEndOfSeasonModal deve abrir o modal customizado");
assert(customModalOpened.title.includes("🏆 Encerramento da Temporada Oficial 2026"), "Título deve ser Encerramento da Temporada Oficial");
assert(customModalOpened.body.includes("D,.Aquino · Brasília"), "Deve exibir o atleta e o clube no cabeçalho");
assert(customModalOpened.body.includes(">14</div>"), "Deve exibir os gols do atleta");
assert(customModalOpened.body.includes("8.45"), "Deve exibir a nota média do atleta");
assert(customModalOpened.body.includes("6x"), "Deve exibir a contagem de MVPs");
assert(customModalOpened.body.includes("Craque do Campeonato Candango"), "Deve exibir o troféu de Craque conquistado");
assert(customModalOpened.body.includes("Artilheiro do Campeonato Candango"), "Deve exibir o troféu de Artilheiro conquistado");
assert(customModalOpened.body.includes("R$ 1.800/mês"), "Deve exibir o salário do atleta");
assert(customModalOpened.body.includes("Volta Redonda"), "Deve exibir proposta do mercado para o atleta");

// Proibições estritas do modo treinador
assert(!customModalOpened.body.includes("Professor Treinador da IA"), "NÃO deve citar Professor Treinador da IA");
assert(!customModalOpened.body.includes("Renovar com Brasília (+15% salário)"), "NÃO deve ter o botão de renovação de técnico");
assert(!customModalOpened.body.includes("CSKA Sofia") || !customModalOpened.body.includes("btnAcceptJob"), "NÃO deve ter botões de técnico Assumir clube");

console.log("✅ Teste 3 passou com sucesso!");

console.log("🎉 Todos os testes de Encerramento e Cerimônia de Campeão no Modo Jogador passaram com 100% de sucesso!");
