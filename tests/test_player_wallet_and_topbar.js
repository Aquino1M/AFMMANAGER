/**
 * Test Suite: Carteira Unificada, Conservação Monetária no CDB e Topbar por Modo
 * tests/test_player_wallet_and_topbar.js
 */

const assert = require("assert");
const path = require("path");
const fs = require("fs");

console.log("Iniciando testes de Integridade da Carteira, CDB e Topbar por Modo...\n");

// Mocking DOM & Window
const mockDom = {
  elements: {},
  getElementById(id) {
    return this.elements[id] || null;
  },
  querySelector(sel) {
    if (sel.startsWith('#')) return this.elements[sel.slice(1)] || null;
    return null;
  },
  querySelectorAll(sel) {
    const res = [];
    if (sel.includes('.sm-badge-cash .sm-res-val')) {
      if (this.elements['topCashVal']) res.push(this.elements['topCashVal']);
    }
    if (sel.includes('#drawerPersonalCashVal')) {
      if (this.elements['drawerPersonalCashVal']) res.push(this.elements['drawerPersonalCashVal']);
    }
    if (sel.includes('#personalBankBalanceCard')) {
      if (this.elements['personalBankBalanceCard']) res.push(this.elements['personalBankBalanceCard']);
    }
    if (sel.includes('#athleteCashDisplay')) {
      if (this.elements['athleteCashDisplay']) res.push(this.elements['athleteCashDisplay']);
    }
    return res;
  }
};

global.window = global;
global.document = mockDom;
global.showToast = () => {};
global.showCustomAlert = () => {};
global.toast = () => {};
global.save = () => {};
global.render = () => {};

// Carrega lifestyleData.js
require(path.join(__dirname, "../js/player/lifestyleData.js"));

// Teste 1: getPlayerWallet & syncPlayerWallet com sincronização atômica de aliases
{
  console.log("--- Teste 1: getPlayerWallet & syncPlayerWallet ---");
  const state = {
    gameMode: "player",
    playerCareerState: {
      personalBank: 1045,
      cash: 1045,
      lifestyle: {
        cash: 1045,
        investments: { cdbBalance: 0 }
      }
    },
    squad: [
      { id: "p1", isControlled: true, personalBank: 1045, cash: 1045 }
    ],
    controlledPlayerId: "p1"
  };

  const wallet = window.getPlayerWallet(state);
  assert.strictEqual(wallet.personalCash, 1045, "Saldo pessoal deve ser R$ 1.045");
  assert.strictEqual(wallet.cdbBalance, 0, "Saldo CDB inicial deve ser 0");

  // Testa syncPlayerWallet
  const synced = window.syncPlayerWallet(state, 545, 500);
  assert.strictEqual(synced.personalCash, 545, "Saldo pessoal deve ser R$ 545");
  assert.strictEqual(synced.cdbBalance, 500, "Saldo CDB deve ser R$ 500");

  assert.strictEqual(state.playerCareerState.personalCash, 545, "pState.personalCash deve ser 545");
  assert.strictEqual(state.playerCareerState.personalBank, 545, "pState.personalBank deve ser 545");
  assert.strictEqual(state.playerCareerState.cash, 545, "pState.cash deve ser 545");
  assert.strictEqual(state.playerCareerState.lifestyle.cash, 545, "lifestyle.cash deve ser 545");
  assert.strictEqual(state.playerCareerState.lifestyle.investments.cdbBalance, 500, "lifestyle cdb deve ser 500");

  const athlete = state.squad[0];
  assert.strictEqual(athlete.personalCash, 545, "athlete.personalCash deve ser 545");
  assert.strictEqual(athlete.personalBank, 545, "athlete.personalBank deve ser 545");

  console.log("✔ Teste 1: Sincronização de aliases e carteira unificada: PASSOU\n");
}

// Teste 2: Conservação Monetária Estrita nas Aplicações e Resgates do CDB
{
  console.log("--- Teste 2: Conservação Monetária no CDB ---");
  const state = {
    gameMode: "player",
    date: "2026-01-01",
    playerCareerState: {
      personalBank: 1045,
      cash: 1045,
      lifestyle: {
        cash: 1045,
        investments: { cdbBalance: 0, rentalUnits: 0, academyOwned: false, brandOwned: false },
        ownedAssets: [],
        financedAssets: []
      }
    }
  };

  const pState = state.playerCareerState;

  // Estado Inicial
  let initialPatrimony = window.AFM_Lifestyle.getPlayerTotalPatrimony(pState);
  assert.strictEqual(initialPatrimony, 1045, "Patrimônio inicial deve ser exatamente R$ 1.045");

  // 1ª Aplicação: R$ 500
  const dep1 = window.depositToPlayerCdb(state, 500);
  assert.strictEqual(dep1, true, "1ª aplicação de R$ 500 deve ser bem-sucedida");
  assert.strictEqual(pState.personalBank, 545, "Conta pessoal após 1ª aplicação: R$ 545");
  assert.strictEqual(pState.lifestyle.investments.cdbBalance, 500, "CDB após 1ª aplicação: R$ 500");
  assert.strictEqual(window.AFM_Lifestyle.getPlayerTotalPatrimony(pState), 1045, "Patrimônio deve conservar em R$ 1.045");

  // 2ª Aplicação: R$ 500
  const dep2 = window.depositToPlayerCdb(state, 500);
  assert.strictEqual(dep2, true, "2ª aplicação de R$ 500 deve ser bem-sucedida");
  assert.strictEqual(pState.personalBank, 45, "Conta pessoal após 2ª aplicação: R$ 45");
  assert.strictEqual(pState.lifestyle.investments.cdbBalance, 1000, "CDB após 2ª aplicação: R$ 1.000");
  assert.strictEqual(window.AFM_Lifestyle.getPlayerTotalPatrimony(pState), 1045, "Patrimônio deve conservar em R$ 1.045");

  // 3ª Aplicação: R$ 500 (deve falhar por saldo insuficiente: 45 < 500)
  const dep3 = window.depositToPlayerCdb(state, 500);
  assert.strictEqual(dep3, false, "3ª aplicação deve ser rejeitada por saldo insuficiente");
  assert.strictEqual(pState.personalBank, 45, "Conta pessoal deve permanecer inalterada em R$ 45");
  assert.strictEqual(pState.lifestyle.investments.cdbBalance, 1000, "CDB deve permanecer inalterado em R$ 1.000");
  assert.strictEqual(window.AFM_Lifestyle.getPlayerTotalPatrimony(pState), 1045, "Patrimônio deve conservar em R$ 1.045");

  // Resgate Total
  const withRes = window.withdrawFromPlayerCdb(state);
  assert.strictEqual(withRes, true, "Resgate total deve ser bem-sucedido");
  assert.strictEqual(pState.personalBank, 1045, "Conta pessoal após resgate total: R$ 1.045");
  assert.strictEqual(pState.lifestyle.investments.cdbBalance, 0, "CDB após resgate total: R$ 0");
  assert.strictEqual(window.AFM_Lifestyle.getPlayerTotalPatrimony(pState), 1045, "Patrimônio após resgate deve conservar em R$ 1.045");

  // Tentativa de segundo resgate sem saldo no CDB
  const withRes2 = window.withdrawFromPlayerCdb(state);
  assert.strictEqual(withRes2, false, "Resgate subsequente com saldo 0 no CDB deve falhar");

  console.log("✔ Teste 2: Conservação Monetária no CDB (Zero Dinheiro Infinito): PASSOU\n");
}

// Teste 3: Proteção contra Texto Sobreposto na Topbar (#btnTopQuickCash)
{
  console.log("--- Teste 3: Proteção contra Text Overlap na Topbar ---");
  const quickCashBtn = {
    id: "btnTopQuickCash",
    textContent: "+",
    style: {}
  };
  const drawerCashVal = {
    id: "drawerPersonalCashVal",
    textContent: ""
  };
  const topCashVal = {
    className: "sm-res-val",
    textContent: ""
  };

  mockDom.elements["btnTopQuickCash"] = quickCashBtn;
  mockDom.elements["drawerPersonalCashVal"] = drawerCashVal;
  mockDom.elements["topCashVal"] = topCashVal;

  const playerObj = {
    personalBank: 1045,
    cash: 1045,
    lifestyle: { cash: 1045, investments: { cdbBalance: 0 } }
  };

  window.AFM_Lifestyle.updatePlayerFinancialDisplay(playerObj);

  assert.strictEqual(quickCashBtn.textContent, "+", "Botão circular #btnTopQuickCash deve manter estritamente '+'");
  assert.strictEqual(drawerCashVal.textContent, "R$ 1.045", "Gaveta lateral deve receber 'R$ 1.045'");

  console.log("✔ Teste 3: Sem sobreposição de texto em botões circulares: PASSOU\n");
}

// Teste 4: Renderização da Topbar por Modo (game.js)
{
  console.log("--- Teste 4: Topbar por Modo (Carreira Jogador vs Treinador) ---");
  const gameFile = fs.readFileSync(path.join(__dirname, "../js/game.js"), "utf8");

  // Verifica que existe o bloco condicional isPlayer na sm-top-center
  assert(gameFile.includes("${isPlayer ? (function(){"), "sm-top-center deve conter bloco específico para isPlayer");
  assert(gameFile.includes('class="sm-res-badge sm-badge-strength" id="btnTopQuickTeamStrengthCard" data-view="player_evolution"'), "No modo jogador, badge de força direciona para player_evolution");
  assert(gameFile.includes('class="sm-res-badge sm-badge-prestige" id="btnTopQuickPrestigeCard" data-view="player_evolution"'), "No modo jogador, badge de prestígio vira Nível do Atleta e direciona para player_evolution");
  assert(gameFile.includes('class="sm-res-badge sm-badge-cash" id="btnTopPersonalCashCard" data-view="player_lifestyle"'), "No modo jogador, badge financeiro exibe Saldo Pessoal e direciona para player_lifestyle");
  assert(gameFile.includes('class="sm-res-badge sm-badge-energy" id="btnTopCdbCard" data-view="player_lifestyle"'), "No modo jogador, renderiza badge exclusivo do CDB direcionando para player_lifestyle");

  // No modo treinador, mantém os 3 badges de técnico
  assert(gameFile.includes('${teamOvr} OVR'), "No modo treinador, força do time exibe teamOvr");
  assert(gameFile.includes('${coachPrestige} pts'), "No modo treinador, prestígio exibe coachPrestige");
  assert(gameFile.includes('${displayCashVal}'), "No modo treinador, caixa exibe displayCashVal");

  console.log("✔ Teste 4: Topbar isolada por Modo (4 painéis no Jogador, 3 no Treinador): PASSOU\n");
}

// Teste 5: Botões do CDB na Interface (player_mode_ui.js)
{
  console.log("--- Teste 5: Botões do Card CDB em player_mode_ui.js ---");
  const uiFile = fs.readFileSync(path.join(__dirname, "../js/player/player_mode_ui.js"), "utf8");

  assert(uiFile.includes('data-cdb-action="deposit"'), "Botão de depósito deve possuir data-cdb-action='deposit'");
  assert(uiFile.includes('data-cdb-action="withdraw"'), "Botão de resgate deve possuir data-cdb-action='withdraw'");
  assert(uiFile.includes("🔒 Saldo Insuficiente"), "Botão desabilitado deve exibir '🔒 Saldo Insuficiente' quando saldo < 500");
  assert(uiFile.includes("const cdbBtn = e.target.closest(\"[data-cdb-action]\");"), "Delegação de eventos deve capturar cliques em [data-cdb-action]");

  console.log("✔ Teste 5: Atributos data-cdb-action e trava na interface: PASSOU\n");
}

console.log("=================================================================");
console.log("🎉 TODOS OS TESTES DE INTEGRIDADE FINANCEIRA E TOPBAR PASSARAM! 🎉");
console.log("=================================================================\n");
