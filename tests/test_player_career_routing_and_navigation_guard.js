/**
 * Test Suite: Blindagem de Roteamento, Save Migration e Navegação Global (Anti-Travamento)
 * tests/test_player_career_routing_and_navigation_guard.js
 */

const assert = require("assert");
const fs = require("fs");
const path = require("path");

// Mocking window & DOM
global.window = global;
global.document = {
  querySelectorAll: () => [],
  querySelector: () => null,
  getElementById: () => null,
  addEventListener: () => {}
};

// Carrega dependências
require(path.join(__dirname, "../js/player/lifestyleData.js"));
require(path.join(__dirname, "../js/player/player_career_engine.js"));

// Mock de UI do PlayerMode e funções centrais do jogo
window.AFM_PlayerMode = {
  renderPage: (view) => {
    if (view === "player_hub" || view === "central") {
      return '<div class="player-hub-screen">Central do Atleta</div>';
    }
    if (["player_evolution", "player_club", "player_agent", "player_lifestyle", "player_stats", "player_national", "player_social"].includes(view)) {
      return `<div class="${view}-screen">Tela ${view}</div>`;
    }
    return null;
  }
};

// Carrega trecho de game.js com as funções de saneamento e roteamento
const gameJsCode = fs.readFileSync(path.join(__dirname, "../js/game.js"), "utf-8");
eval(gameJsCode);

console.log("Iniciando bateria de testes de Blindagem de Roteamento e Navegação...\n");

// 1. Teste de Fonte Única da Verdade: isPlayerCareerActive
{
  // Cenário A: Save com gameMode explícito 'player'
  const stateA = { gameMode: "player", club: "Brasília" };
  assert.strictEqual(window.isPlayerCareerActive(stateA), true, "Deveria detectar modo atleta por gameMode='player'");
  assert.strictEqual(stateA.mode, "player");

  // Cenário B: Save legado com Treinador da IA e playerCareerState
  const stateB = { coachName: "Treinador da IA", playerCareerState: { athleteName: "D.Aquino" }, club: "Brasília" };
  assert.strictEqual(window.isPlayerCareerActive(stateB), true, "Deveria detectar modo atleta por Treinador da IA + playerCareerState");
  assert.strictEqual(stateB.gameMode, "player");

  // Cenário C: Save legado com controlledPlayerId
  const stateC = { controlledPlayerId: "p_123", club: "Brasília" };
  assert.strictEqual(window.isPlayerCareerActive(stateC), true, "Deveria detectar modo atleta por controlledPlayerId");
  assert.strictEqual(stateC.gameMode, "player");

  // Cenário D: Save puro de Modo Treinador
  const stateD = { gameMode: "manager", coachName: "Professor Aquino", balance: 500000 };
  assert.strictEqual(window.isPlayerCareerActive(stateD), false, "Não deve confundir modo treinador com atleta");

  console.log("✔ 1. Fonte Única da Verdade (window.isPlayerCareerActive): PASSOU");
}

// 2. Teste de Migração e Saneamento de Saves Legados (migrateAndSanitizeSaveState)
{
  const oldLegacySave = {
    gameMode: "player",
    club: "Brasília",
    view: "central", // Tentativa de abrir na central do treinador
    playerCareerState: {
      athleteName: "D.Aquino",
      athleteOvr: 40,
      personalBank: 1045
      // Faltando: seasonStats, careerHistory, agentCooldowns, lifestyle.investments
    }
  };

  const sanitized = window.migrateAndSanitizeSaveState(oldLegacySave);

  assert.strictEqual(sanitized.view, "player_hub", "Save do modo atleta não pode ter view='central'; deve sanitizar para 'player_hub'");
  assert(sanitized.playerCareerState.seasonStats, "Deve inicializar seasonStats");
  assert.strictEqual(sanitized.playerCareerState.seasonStats.games, 0);
  assert(sanitized.playerCareerState.careerHistory, "Deve inicializar careerHistory");
  assert.strictEqual(sanitized.playerCareerState.careerHistory.totals.games, 0);
  assert(sanitized.playerCareerState.agentCooldowns, "Deve inicializar agentCooldowns");
  assert.strictEqual(sanitized.playerCareerState.agentCooldowns.wage_increase, 0);
  assert(sanitized.playerCareerState.lifestyle.investments, "Deve inicializar lifestyle.investments");
  assert.strictEqual(sanitized.playerCareerState.lifestyle.investments.cdbBalance, 0);

  console.log("✔ 2. Saneamento e Proteção contra TypeError em Saves Antigos: PASSOU");
}

// 3. Teste de Redirecionamento em setGameView e page() (Zero Acesso à Central do Treinador no Modo Atleta)
{
  window.state = {
    gameMode: "player",
    club: "Brasília",
    playerCareerState: { athleteName: "D.Aquino", athleteOvr: 40 }
  };

  // Tentativa de navegar para telas de treinador
  window.setGameView("central");
  assert.strictEqual(window.view, "player_hub", "setGameView('central') no modo atleta deve redirecionar para 'player_hub'");

  window.setGameView("tatica");
  assert.strictEqual(window.view, "player_hub", "setGameView('tatica') no modo atleta deve redirecionar para 'player_hub'");

  window.setGameView("mercado");
  assert.strictEqual(window.view, "player_hub", "setGameView('mercado') no modo atleta deve redirecionar para 'player_hub'");

  // page() no modo atleta com view='central' forçada
  window.view = "central";
  const htmlOutput = window.page();
  assert(!htmlOutput.includes("central-dashboard-grid"), "page() no modo atleta NUNCA pode retornar o dashboard do treinador!");
  assert(htmlOutput.includes("Central do Atleta"), "page() deve retornar a Central do Atleta!");

  console.log("✔ 3. Roteamento Blindado no setGameView e page(): PASSOU");
}

// 4. Teste de Proteção de Trava de Renderização (__afmIsRendering)
{
  assert.strictEqual(window.__afmIsRendering, false, "A flag __afmIsRendering deve estar false");
  
  // Executa render() e confirma que a trava é liberada no finally
  if (typeof window.render === "function") {
    window.render();
  }
  assert.strictEqual(window.__afmIsRendering, false, "A flag __afmIsRendering deve ser liberada após render()");

  console.log("✔ 4. Liberação Garantida de Trava de Renderização: PASSOU");
}

console.log("\n==================================================================");
console.log("🎉 TODOS OS TESTES DE ROTEAMENTO E NAVEGAÇÃO PASSARAM (100%)! 🎉");
console.log("==================================================================");
