/**
 * Test Suite: Sistema Completo de Estilo de Vida, Chuteiras, Staff, Bens Financiáveis, Negócios e Extrato
 * tests/test_player_lifestyle_system.js
 */

const assert = require("assert");
const fs = require("fs");
const path = require("path");

// Mocking window and DOM
global.window = global;
global.document = {
  querySelectorAll: () => []
};

// Carrega lifestyleData.js
const lifestylePath = path.join(__dirname, "../js/player/lifestyleData.js");
require(lifestylePath);

// Carrega dependências de player_career_engine.js
const careerEnginePath = path.join(__dirname, "../js/player/player_career_engine.js");
const careerEngineCode = fs.readFileSync(careerEnginePath, "utf-8");
eval(careerEngineCode);

console.log("Iniciando testes do Sistema de Estilo de Vida & Finanças do Atleta...\n");

// 1. Teste de Inicialização e Normalização de Estado
{
  const player = {
    athleteName: "Diógenes Aquino",
    personalBank: 1500,
    attributes: { vel: 50, chu: 60, pas: 55, dri: 52, def: 40, fis: 50 }
  };

  const ls = window.AFM_Lifestyle.ensurePlayerLifestyleState(player);
  assert.strictEqual(ls.cash, 1500, "Cash deve inicializar sincronizado com personalBank");
  assert.strictEqual(player.personalBank, 1500, "player.personalBank deve estar sincronizado");
  assert.strictEqual(ls.equippedBootsId, "boots_basic", "Chuteira equipada inicial deve ser boots_basic");
  assert.strictEqual(ls.ownedBoots.boots_basic.durability, 15, "Durabilidade inicial de boots_basic deve ser 15");
  assert.strictEqual(ls.ownedBoots.boots_basic.maxDurability, 15, "maxDurability deve ser 15");
  assert.deepStrictEqual(ls.hiredStaff, [], "hiredStaff deve ser array vazio");
  assert.deepStrictEqual(ls.investments.cdbBalance, 0, "CDB deve iniciar zerado");
  console.log("✔ 1. Inicialização de Estado e Sincronização: PASSOU");
}

// 2. Teste de Compra, Desgaste e Reforma de Chuteiras
{
  const pState = {
    athleteName: "Diógenes Aquino",
    personalBank: 5000,
    attributes: { vel: 50, chu: 60, pas: 55, dri: 52, def: 40, fis: 50 }
  };
  const gameState = { playerCareerState: pState, date: "2026-01-20" };

  // Compra da Chuteira Precision (R$ 2.800)
  const buyRes = window.AFM_Lifestyle.buyBoot(gameState, "boots_precision");
  assert.strictEqual(buyRes.success, true, "Compra de chuteira deve ter sucesso");
  assert.strictEqual(pState.personalBank, 2200, "Saldo deve debitar R$ 2.800 (5000 - 2800 = 2200)");
  assert.strictEqual(pState.lifestyle.equippedBootsId, "boots_precision", "Nova chuteira deve ser auto-equipada");
  assert.strictEqual(pState.lifestyle.ownedBoots.boots_precision.durability, 35, "Durabilidade deve iniciar em 35");

  // Desgaste em partida
  window.AFM_Lifestyle.processMatchLifestyleEffects(gameState, { goalsScored: 1 }, "2026-01-25");
  assert.strictEqual(pState.lifestyle.ownedBoots.boots_precision.durability, 34, "Durabilidade deve cair para 34 após 1 jogo");

  // Reforma de travas (35% de 2800 = 980)
  const repairRes = window.AFM_Lifestyle.repairBoot(gameState, "boots_precision");
  assert.strictEqual(repairRes.success, true, "Reforma deve ter sucesso");
  assert.strictEqual(pState.personalBank, 2200 - 980, "Deve debitar 35% do valor da chuteira (980)");
  assert.strictEqual(pState.lifestyle.ownedBoots.boots_precision.durability, 35, "Durabilidade deve voltar a 35");

  // Tentativa de reformar chuteira 100% conservada
  const repairAgain = window.AFM_Lifestyle.repairBoot(gameState, "boots_precision");
  assert.strictEqual(repairAgain.success, false, "Não deve cobrar reforma se estiver 100%");
  console.log("✔ 2. Compra, Desgaste e Reforma (35%) de Chuteiras: PASSOU");
}

// 3. Teste de Bônus de Atributos Efetivos com Chuteiras e Staff
{
  const pState = {
    athleteName: "Diógenes Aquino",
    personalBank: 50000,
    attributes: { vel: 50, chu: 60, pas: 55, dri: 52, def: 40, fis: 50 }
  };
  const athlete = { attributes: { ...pState.attributes } };
  const gameState = { playerCareerState: pState, controlledPlayerId: 1, squad: [athlete] };
  window.AFM_Lifestyle.ensurePlayerLifestyleState(pState);

  // Sem chuteiras adicionais, boots_basic dá +1 vel
  let effAttrs = window.AFM_PlayerEngine.getPlayerEffectiveAttributes(gameState, athlete);
  assert.strictEqual(effAttrs.vel, 51, "boots_basic com durabilidade > 0 concede +1 vel");

  // Simula durabilidade zerada
  pState.lifestyle.ownedBoots.boots_basic.durability = 0;
  effAttrs = window.AFM_PlayerEngine.getPlayerEffectiveAttributes(gameState, athlete);
  assert.strictEqual(effAttrs.vel, 50, "Chuteira com durabilidade 0 não concede bônus");

  // Contrata Analista de Vídeo (video_analyst) -> +1 pas
  window.AFM_Lifestyle.hireStaffMember(gameState, "video_analyst");
  effAttrs = window.AFM_PlayerEngine.getPlayerEffectiveAttributes(gameState, athlete);
  assert.strictEqual(effAttrs.pas, 56, "video_analyst concede +1 pas");

  // Compra chuteira Diamond Signature Ouro (+3 chu, +250/gol)
  window.AFM_Lifestyle.buyBoot(gameState, "boots_signature");
  effAttrs = window.AFM_PlayerEngine.getPlayerEffectiveAttributes(gameState, athlete);
  assert.strictEqual(effAttrs.chu, 63, "boots_signature concede +3 chu");

  // Gol marcado com Diamond Signature dá +R$ 250
  const cashBefore = pState.lifestyle.cash;
  window.AFM_Lifestyle.processMatchLifestyleEffects(gameState, { goalsScored: 2 }, "2026-02-01");
  assert.strictEqual(pState.lifestyle.cash, cashBefore + 500, "2 gols devem render +R$ 500 de bônus");
  console.log("✔ 3. Bônus de Atributos Efetivos e Bônus da Signature: PASSOU");
}

// 4. Teste de Staff Pessoal: Contratação e Dispensa
{
  const pState = {
    athleteName: "Diógenes Aquino",
    personalBank: 10000
  };
  const gameState = { playerCareerState: pState };
  window.AFM_Lifestyle.ensurePlayerLifestyleState(pState);

  // Contrata Personal Trainer (R$ 3.500)
  const res1 = window.AFM_Lifestyle.hireStaffMember(gameState, "personal_trainer");
  assert.strictEqual(res1.success, true, "Deve contratar personal_trainer");
  assert.strictEqual(pState.lifestyle.cash, 6500, "Saldo deve ser 10000 - 3500 = 6500");
  assert(pState.lifestyle.hiredStaff.includes("personal_trainer"), "personal_trainer deve constar no array");

  // Tenta contratar de novo
  const resDuplicate = window.AFM_Lifestyle.hireStaffMember(gameState, "personal_trainer");
  assert.strictEqual(resDuplicate.success, false, "Não pode contratar duplicado");

  // Dispensa
  const resDismiss = window.AFM_Lifestyle.dismissStaffMember(gameState, "personal_trainer");
  assert.strictEqual(resDismiss.success, true, "Deve dispensar com sucesso");
  assert(!pState.lifestyle.hiredStaff.includes("personal_trainer"), "Não deve mais constar no array");
  console.log("✔ 4. Contratação e Dispensa de Staff: PASSOU");
}

// 5. Teste de Bens de Luxo: À Vista vs Financiamento 12x
{
  const pState = {
    athleteName: "Diógenes Aquino",
    personalBank: 100000
  };
  const gameState = { playerCareerState: pState, date: "2026-02-01" };
  window.AFM_Lifestyle.ensurePlayerLifestyleState(pState);

  // Compra Relógio Suíço à vista (R$ 18.000)
  const resCash = window.AFM_Lifestyle.buyAssetCash(gameState, "swiss_watch");
  assert.strictEqual(resCash.success, true, "Compra de relógio à vista deve ter sucesso");
  assert.strictEqual(pState.lifestyle.cash, 82000, "Saldo deve ser 100000 - 18000 = 82000");
  assert(pState.lifestyle.ownedAssets.includes("swiss_watch"), "Deve constar em ownedAssets");

  // Financia Hatch Esportivo (R$ 85.000)
  // Entrada 30% = 25.500. Restante 59.500 * 1.10 = 65.450 / 12 = 5.454/mês
  const resFin = window.AFM_Lifestyle.financeAsset(gameState, "sport_hatch");
  assert.strictEqual(resFin.success, true, "Financiamento de carro deve ter sucesso");
  assert.strictEqual(pState.lifestyle.cash, 82000 - 25500, "Saldo deve debitar a entrada de R$ 25.500");
  assert.strictEqual(pState.lifestyle.financedAssets.length, 1, "financedAssets deve ter 1 item");
  assert.strictEqual(pState.lifestyle.financedAssets[0].id, "sport_hatch");
  assert.strictEqual(pState.lifestyle.financedAssets[0].remainingInstallments, 12);
  assert.strictEqual(pState.lifestyle.financedAssets[0].monthlyPayment, 5454);
  console.log("✔ 5. Bens de Luxo À Vista e Financiamento 12x: PASSOU");
}

// 6. Teste de Negócios, Investimentos (CDB, Aluguéis, Escolinha, Marca) e Mídia
{
  const pState = {
    athleteName: "Diógenes Aquino",
    personalBank: 400000,
    athleteOvr: 60,
    socialMedia: { followers: 5000 },
    energy: 100
  };
  const gameState = { playerCareerState: pState, controlledPlayerId: 1, squad: [pState], date: "2026-02-01" };
  window.AFM_Lifestyle.ensurePlayerLifestyleState(pState);

  // CDB: Aplicação de R$ 5.000
  window.AFM_Lifestyle.depositCdb(gameState, 5000);
  assert.strictEqual(pState.lifestyle.investments.cdbBalance, 5000, "Saldo no CDB deve ser 5000");

  // CDB: Resgate
  window.AFM_Lifestyle.withdrawCdb(gameState);
  assert.strictEqual(pState.lifestyle.investments.cdbBalance, 0, "Saldo no CDB deve zerar após resgate");

  // Kitnets: Compra de 2 unidades (R$ 50.000)
  window.AFM_Lifestyle.buyRentalUnit(gameState);
  window.AFM_Lifestyle.buyRentalUnit(gameState);
  assert.strictEqual(pState.lifestyle.investments.rentalUnits, 2, "Deve possuir 2 kitnets");

  // Escolinha (R$ 75.000)
  window.AFM_Lifestyle.buyAcademy(gameState);
  assert.strictEqual(pState.lifestyle.investments.academyOwned, true, "academyOwned deve ser true");

  // Marca Própria (R$ 180.000)
  window.AFM_Lifestyle.buyBrand(gameState);
  assert.strictEqual(pState.lifestyle.investments.brandOwned, true, "brandOwned deve ser true");

  // Comercial de Mídia: consome 15% estamina e paga cachê
  const cashBeforeMedia = pState.lifestyle.cash;
  const mediaRes = window.AFM_Lifestyle.executeMediaGig(gameState);
  assert.strictEqual(mediaRes.success, true, "Gravação de comercial deve ter sucesso");
  assert.strictEqual(pState.energy, 85, "Energia deve cair de 100 para 85");
  assert(mediaRes.payout >= 450 && mediaRes.payout <= 12000, "Cachê deve estar entre 450 e 12000");
  assert.strictEqual(pState.lifestyle.cash, cashBeforeMedia + mediaRes.payout, "Cachê deve ser adicionado ao saldo");

  // Tenta gravar novamente na mesma semana (cooldown)
  const mediaCooldown = window.AFM_Lifestyle.executeMediaGig(gameState);
  assert.strictEqual(mediaCooldown.success, false, "Deve bloquear em cooldown semanal");
  console.log("✔ 6. Negócios, Investimentos e Ações de Mídia: PASSOU");
}

// 7. Teste de Virada de Mês, Juros do CDB, Desconto de Contador e Inadimplência
{
  const pState = {
    athleteName: "Diógenes Aquino",
    personalBank: 10000,
    athleteOvr: 55,
    wage: 2500
  };
  const athlete = { id: 1, ovr: 55, wage: 2500 };
  const gameState = { gameMode: "player", playerCareerState: pState, controlledPlayerId: 1, squad: [athlete], date: "2026-03-01" };
  const ls = window.AFM_Lifestyle.ensurePlayerLifestyleState(pState);

  // Configura investimentos e staff
  ls.investments.cdbBalance = 10000;
  ls.investments.rentalUnits = 1; // +650/mês
  ls.hiredStaff = ["accountant"]; // Contador concede 1.5% no CDB e -15% na manutenção de bens
  ls.ownedAssets = ["sport_hatch"]; // Manutenção base: 1200. Com -15%: 1020.
  ls.financedAssets = [{ id: "armored_suv", name: "SUV Blindado", remainingInstallments: 12, monthlyPayment: 1500 }];

  const finRes = window.AFM_Lifestyle.processMonthlyPlayerFinances(gameState, "2026-03-01");
  assert(finRes !== null, "Deve processar finanças do mês 2026-03");
  assert.strictEqual(finRes.cdbYield, 150, "1.5% de 10.000 deve render R$ 150 com Contador");
  assert.strictEqual(finRes.totalBusinessIncome, 650, "1 kitnet deve render R$ 650");
  assert.strictEqual(ls.financedAssets[0].remainingInstallments, 11, "Parcelas restantes devem diminuir para 11");

  // Teste de Idempotência: rodar novamente no mesmo mês não deve duplicar
  const finDup = window.AFM_Lifestyle.processMonthlyPlayerFinances(gameState, "2026-03-01");
  assert.strictEqual(finDup, null, "Não pode processar duas vezes no mesmo mês");

  // Teste de Inadimplência: se saldo ficar negativo com staff contratado, suspende 1 staff
  ls.cash = -500;
  ls.lastProcessedMonth = "2026-03"; // Força avanço
  const finInsolvency = window.AFM_Lifestyle.processMonthlyPlayerFinances(gameState, "2026-04-01");
  assert.strictEqual(ls.hiredStaff.length, 0, "Staff deve ser suspenso por inadimplência");
  console.log("✔ 7. Virada de Mês, Rendimentos, Contador e Inadimplência: PASSOU");
}

// 8. Teste do Livro-Razão (Extrato) Limitado a 20 Transações
{
  const pState = { personalBank: 1000 };
  window.AFM_Lifestyle.ensurePlayerLifestyleState(pState);

  for (let i = 1; i <= 25; i++) {
    window.AFM_Lifestyle.addPlayerTransaction(pState, "2026-04-01", `Operação ${i}`, 10, "in");
  }

  assert.strictEqual(pState.lifestyle.transactions.length, 20, "Extrato deve manter no máximo 20 transações");
  assert.strictEqual(pState.lifestyle.transactions[0].desc, "Operação 25", "A mais recente deve estar no topo");
  console.log("✔ 8. Livro-Razão e Limite de 20 Transações: PASSOU");
}

// 9. Teste de Renderização da View de Estilo de Vida (UI)
{
  // Carrega player_mode_ui.js
  global.esc = (s) => String(s || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  global.formatDatePtBr = (d) => String(d || "");
  global.addDaysToIso = (d, days) => "2026-06-01";
  global.getDaysBetween = () => 180;

  const playerModeUiPath = path.join(__dirname, "../js/player/player_mode_ui.js");
  const playerModeUiCode = fs.readFileSync(playerModeUiPath, "utf-8");
  eval(playerModeUiCode);

  const pState = {
    athleteName: "Diógenes Aquino",
    personalBank: 1200, // Saldo baixo para forçar botões inteligentes com "🔒 Faltam R$"
    attributes: { vel: 50, chu: 60, pas: 55, dri: 52, def: 40, fis: 50 }
  };
  const athlete = { id: 1, name: "Diógenes Aquino", ovr: 50, wage: 1500, attributes: { ...pState.attributes } };
  const uiState = {
    gameMode: "player",
    playerCareerState: pState,
    controlledPlayerId: 1,
    squad: [athlete],
    date: "2026-01-20"
  };
  global.window.state = uiState;

  const htmlLowCash = window.AFM_PlayerMode.renderPage("player_lifestyle");
  assert(htmlLowCash.includes("CONTA BANCÁRIA PESSOAL"), "Deve conter o card de banco pessoal");
  assert(htmlLowCash.includes("LOJA DE CHUTEIRAS & EQUIPAMENTOS"), "Deve conter a Loja de Chuteiras");
  assert(htmlLowCash.includes("STAFF PESSOAL DE ALTA PERFORMANCE"), "Deve conter o Staff Pessoal");
  assert(htmlLowCash.includes("BENS DE LUXO, VEÍCULOS & IMÓVEIS"), "Deve conter os Bens de Luxo");
  assert(htmlLowCash.includes("NEGÓCIOS, INVESTIMENTOS & AÇÕES DE MÍDIA"), "Deve conter Negócios e Investimentos");
  assert(htmlLowCash.includes("EXTRATO FINANCEIRO DOS ÚLTIMOS MESES"), "Deve conter o Extrato Financeiro");
  assert(htmlLowCash.includes("🔒 Faltam R$"), "Deve conter botões inteligentes com aviso de saldo insuficiente");
  assert(htmlLowCash.includes("btn-media-gig"), "Deve conter botão de comercial de mídia");

  // Agora testa com saldo alto (R$ 50.000) para validar os botões ativos
  pState.personalBank = 50000;
  pState.lifestyle.cash = 50000;
  const htmlHighCash = window.AFM_PlayerMode.renderPage("player_lifestyle");
  assert(htmlHighCash.includes("btn-buy-boot"), "Deve conter botão de compra de chuteira ativo");
  assert(htmlHighCash.includes("btn-hire-staff"), "Deve conter botão de contratação de staff ativo");
  assert(htmlHighCash.includes("btn-buy-asset-cash"), "Deve conter botão de compra à vista ativo");
  assert(htmlHighCash.includes("btn-finance-asset"), "Deve conter botão de financiamento ativo");
  assert(htmlHighCash.includes("btn-cdb-deposit"), "Deve conter botão de depósito no CDB ativo");
  console.log("✔ 9. Renderização Completa da View player_lifestyle (UI): PASSOU");
}

console.log("\nTODOS OS TESTES DO SISTEMA DE ESTILO DE VIDA PASSARAM COM 100% DE SUCESSO! ⭐");
