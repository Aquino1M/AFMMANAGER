/**
 * Test Suite: Sincronização em Tempo Real de Saldo Líquido e Patrimônio Total (CDB + Bens + Negócios)
 * tests/test_player_financial_sync.js
 */

const assert = require("assert");
const fs = require("fs");
const path = require("path");

// Mocking window & DOM
global.window = global;
global.document = {
  querySelectorAll: () => [],
  querySelector: () => null,
  getElementById: () => null
};

// Carrega lifestyleData.js
require(path.join(__dirname, "../js/player/lifestyleData.js"));

console.log("Iniciando testes de Sincronização Financeira e Patrimônio Total do Atleta...\n");

// 1. Teste de Cálculo do Patrimônio Total
{
  const player = {
    athleteName: "Diógenes Aquino",
    personalBank: 1045,
    cash: 1045,
    lifestyle: {
      cash: 1045,
      investments: {
        cdbBalance: 0,
        rentalUnits: 2, // 2 * 25.000 = 50.000
        academyOwned: true, // 90.000
        brandOwned: false
      },
      ownedAssets: ["gaming_rig"], // 6.500
      financedAssets: [
        {
          id: "sport_hatch", // price: 85.000. 30% down = 25.500. monthly: 5.454. 3 paid = 16.362.
          installmentsRemaining: 9,
          monthlyInstallment: 5454
        }
      ]
    }
  };

  const initialPatrimony = window.AFM_Lifestyle.getPlayerTotalPatrimony(player);
  console.log(`Patrimônio inicial calculado: R$ ${initialPatrimony.toLocaleString('pt-BR')}`);
  // 1045 + 0 + 50000 + 90000 + 6500 + 25500 + (3 * 5454 = 16362) = 189.407
  assert.strictEqual(initialPatrimony, 189407, "Patrimônio deve incluir saldo em conta, imóveis, escolinha e bens");
  console.log("✔ 1. Cálculo de Patrimônio Total: PASSOU");

  // 2. Aplicação de R$ 1.000 no CDB Esportivo
  const depositRes = window.AFM_Lifestyle.depositCdb(player, 1000);
  assert.strictEqual(depositRes.success, true, "Aplicação no CDB deve ter sucesso");
  assert.strictEqual(player.personalBank, 45, "Saldo livre após depósito de R$ 1.000 deve ser R$ 45");
  assert.strictEqual(player.lifestyle.cash, 45, "lifestyle.cash deve sincronizar estritamente em R$ 45");
  assert.strictEqual(player.lifestyle.investments.cdbBalance, 1000, "CDB deve conter R$ 1.000 investidos");

  const patrimonyAfterDeposit = window.AFM_Lifestyle.getPlayerTotalPatrimony(player);
  assert.strictEqual(patrimonyAfterDeposit, 189407, "Patrimônio total deve permanecer constante após transferir de conta para CDB");
  console.log("✔ 2. Aplicação de R$ 1.000 no CDB e preservação de Patrimônio Total: PASSOU");

  // 3. Teste de Resgate Total do CDB
  const withdrawRes = window.AFM_Lifestyle.withdrawCdb(player);
  assert.strictEqual(withdrawRes.success, true, "Resgate do CDB deve ter sucesso");
  assert.strictEqual(player.personalBank, 1045, "Saldo livre após resgate deve voltar para R$ 1.045");
  assert.strictEqual(player.lifestyle.investments.cdbBalance, 0, "CDB deve estar zerado após resgate");

  const patrimonyAfterWithdraw = window.AFM_Lifestyle.getPlayerTotalPatrimony(player);
  assert.strictEqual(patrimonyAfterWithdraw, 189407, "Patrimônio total deve permanecer constante após resgate do CDB");
  console.log("✔ 3. Resgate do CDB e atualização imediata: PASSOU");
}

// 4. Teste de Atualização da DOM via updatePlayerFinancialDisplay
{
  const mockDOM = {
    drawerPatrimonyVal: { textContent: "" },
    drawerPersonalCashVal: { textContent: "" },
    personalBankBalanceCard: { textContent: "" },
    cdbInvestedBalanceVal: { textContent: "" },
    topbarBadgeVal: { textContent: "" },
    topbarBadge: { title: "" }
  };

  global.document.getElementById = (id) => mockDOM[id] || null;
  global.document.querySelector = (sel) => {
    if (sel.includes(".sm-badge-cash .sm-res-val")) return mockDOM.topbarBadgeVal;
    if (sel === ".sm-badge-cash") return mockDOM.topbarBadge;
    return null;
  };
  global.document.querySelectorAll = () => [];

  const player = {
    personalBank: 45,
    cash: 45,
    lifestyle: {
      cash: 45,
      investments: { cdbBalance: 1000, rentalUnits: 0, academyOwned: false, brandOwned: false },
      ownedAssets: [],
      financedAssets: []
    }
  };

  const res = window.AFM_Lifestyle.updatePlayerFinancialDisplay(player);
  assert.strictEqual(res.liquidCash, 45, "Liquid cash deve ser 45");
  assert.strictEqual(res.totalInvested, 1000, "Total investido deve ser 1000");
  assert.strictEqual(res.totalPatrimony, 1045, "Patrimônio total deve ser 1045 (45 livre + 1000 CDB)");

  assert.strictEqual(mockDOM.drawerPatrimonyVal.textContent, "R$ 1.045", "Gaveta deve exibir Patrimônio Total R$ 1.045");
  assert.strictEqual(mockDOM.drawerPersonalCashVal.textContent, "R$ 45", "Gaveta deve exibir Conta Pessoal R$ 45");
  assert.strictEqual(mockDOM.personalBankBalanceCard.textContent, "R$ 45", "Card central deve exibir R$ 45");
  assert.strictEqual(mockDOM.cdbInvestedBalanceVal.textContent, "R$ 1.000", "Card CDB deve exibir Saldo Atual Investido R$ 1.000");
  assert.strictEqual(mockDOM.topbarBadgeVal.textContent, "R$ 45", "Topbar badge deve exibir R$ 45");
  assert(mockDOM.topbarBadge.title.includes("Patrimônio: R$ 1.045"), "Tooltip deve conter Patrimônio Total");

  console.log("✔ 4. Atualização Global da DOM Financeira: PASSOU");
}

console.log("\n==================================================================");
console.log("🎉 TODOS OS TESTES DE SINCRONIZAÇÃO FINANCEIRA PASSARAM (100%)! 🎉");
console.log("==================================================================");
