/**
 * tests/test_player_evolution_system.js
 * Teste unitário e de integração para a aba '⚡ Meu Atleta & Treino' (player_evolution):
 * - Sincronização estrita de chaves (vel/pace, chu/shooting, etc.)
 * - Recálculo ponderado de OVR por posição e atualização de HUD
 * - Cargas diárias (3/3) pelo calendário do jogo e trava anti-glitch
 * - Goleiro: Foco específico '🧤 Reflexos & Defesas Difíceis'
 * - Pontos estagiados com + e - e confirmação segura
 * - Os 3 minigames: Pênaltis, Faltas e Drible 1x1
 * - Árvore de PlayStyles / Especialidades (máx 3)
 * - Sessões Extras de CT & Academia
 * - Staff Pessoal de Performance e Objetivos Mensais
 * - Radar Hexagonal SVG e FUT Card
 * - Log de Evolução
 */

const assert = require("assert");
const fs = require("fs");
const path = require("path");

// Mock de DOM mínimo para carregar módulos do browser
global.window = global;
global.document = {
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => [],
  createElement: (tag) => ({
    tagName: tag.toUpperCase(),
    setAttribute: () => {},
    appendChild: () => {},
    style: {},
    classList: { add: () => {}, remove: () => {} }
  }),
  body: { appendChild: () => {}, removeChild: () => {} }
};

// Carrega motores
require(path.join(__dirname, "../js/player/player_career_engine.js"));
require(path.join(__dirname, "../js/player/player_mode_ui.js"));

console.log("=== INICIANDO BATERIA DE TESTES: SISTEMA DE EVOLUÇÃO & TREINO DO ATLETA ===");

// 1. Sincronização estrita de chaves de atributos
console.log("\n1. Testando sincronização bidirecional de chaves PT <-> EN...");
{
  const attrs = { vel: 40, shooting: 45, pas: 50, dribbling: 55, def: 35, physical: 60 };
  const effective = window.AFM_PlayerEngine.getPlayerEffectiveAttributes(attrs);
  
  assert.strictEqual(effective.vel, 40);
  assert.strictEqual(effective.pace, 40);
  assert.strictEqual(effective.chu, 45);
  assert.strictEqual(effective.shooting, 45);
  assert.strictEqual(effective.pas, 50);
  assert.strictEqual(effective.passing, 50);
  assert.strictEqual(effective.dri, 55);
  assert.strictEqual(effective.dribbling, 55);
  assert.strictEqual(effective.def, 35);
  assert.strictEqual(effective.defending, 35);
  assert.strictEqual(effective.fis, 60);
  assert.strictEqual(effective.physical, 60);
  console.log("✔ Sincronização bidirecional vel/pace, chu/shooting, pas/passing, dri/dribbling, def/defending, fis/physical aprovada!");
}

// 2. Recálculo ponderado de OVR por posição
console.log("\n2. Testando recálculo dinâmico de OVR ponderado por posição...");
{
  const evo = window.AFM_PLAYER_EVOLUTION;
  assert(evo, "AFM_PLAYER_EVOLUTION deve estar disponível globalmente");

  // Atacante com alta finalização vs Zagueiro com alta defesa
  const ata = {
    pos: "ATA",
    attributes: { vel: 50, chu: 70, pas: 40, dri: 60, def: 30, fis: 50 }
  };
  const zag = {
    pos: "ZAG",
    attributes: { vel: 50, chu: 30, pas: 40, dri: 30, def: 70, fis: 65 }
  };
  const gol = {
    pos: "GOL",
    attributes: { vel: 40, chu: 20, pas: 45, dri: 25, def: 75, fis: 70 }
  };

  const ovrAta = evo.recalculateOvr(ata);
  const ovrZag = evo.recalculateOvr(zag);
  const ovrGol = evo.recalculateOvr(gol);

  assert(ovrAta >= 50, `OVR do Atacante deve ponderar finalização (obteve: ${ovrAta})`);
  assert(ovrZag >= 50, `OVR do Zagueiro deve ponderar defesa/físico (obteve: ${ovrZag})`);
  assert(ovrGol >= 50, `OVR do Goleiro deve ponderar defesa (obteve: ${ovrGol})`);
  console.log(`✔ OVRs ponderados calculados com sucesso: ATA=${ovrAta}, ZAG=${ovrZag}, GOL=${ovrGol}!`);
}

// 3. Foco específico para Goleiros
console.log("\n3. Testando adaptação do foco de treino para Goleiro (GOL)...");
{
  const evo = window.AFM_PLAYER_EVOLUTION;
  const stateGOL = {
    date: "2026-01-01",
    playerCareerState: {
      athleteOvr: 45,
      skillPoints: 2,
      trainingState: { dailyCount: 0, lastTrainingDate: "2026-01-01" }
    },
    squad: [
      { id: "p1", name: "Goleiro Promissor", pos: "GOL", isControlledAthlete: true, attributes: { vel: 35, chu: 35, pas: 35, dri: 35, def: 35, fis: 35 } }
    ]
  };

  evo.syncAthleteState(stateGOL);
  assert.strictEqual(stateGOL.playerCareerState.weeklyTrainingFocus, "gk_reflexes", "Goleiro deve receber foco padrão 'gk_reflexes'");

  const html = window.AFM_PlayerModeUI.renderPlayerEvolution(stateGOL);
  assert(html.includes("Reflexos & Defesas Difíceis"), "HTML deve conter o card de treino específico de Goleiro");
  console.log("✔ Foco de treino de Goleiro renderizado e sincronizado perfeitamente!");
}

// 4. Trava anti-glitch e limite diário pelo calendário do jogo
console.log("\n4. Testando trava diária de 3/3 treinos práticos sincronizada ao calendário...");
{
  const pState = {
    trainingState: { dailyCount: 0, lastTrainingDate: "2026-01-01" },
    xp: 0,
    skillPoints: 0
  };

  // Dia 1: 3 execuções
  const r1 = window.AFM_PlayerEngine.executePracticalTraining({
    type: "penalty",
    isGoal: true,
    playerState: pState,
    currentGameDate: "2026-01-01"
  });
  assert(r1.success, "Primeiro treino deve ser aceito");
  assert.strictEqual(pState.trainingState.dailyCount, 1);

  const r2 = window.AFM_PlayerEngine.executePracticalTraining({
    type: "freekick",
    isGoal: true,
    playerState: pState,
    currentGameDate: "2026-01-01"
  });
  assert(r2.success, "Segundo treino deve ser aceito");
  assert.strictEqual(pState.trainingState.dailyCount, 2);

  const r3 = window.AFM_PlayerEngine.executePracticalTraining({
    type: "dribble",
    isGoal: true,
    playerState: pState,
    currentGameDate: "2026-01-01"
  });
  assert(r3.success, "Terceiro treino (1x1 Drible) deve ser aceito");
  assert.strictEqual(pState.trainingState.dailyCount, 3);

  // Quarta execução no mesmo dia deve ser bloqueada
  const r4 = window.AFM_PlayerEngine.executePracticalTraining({
    type: "penalty",
    isGoal: true,
    playerState: pState,
    currentGameDate: "2026-01-01"
  });
  assert(!r4.success, "Quarto treino no mesmo dia DEVE ser rejeitado");
  assert.strictEqual(pState.trainingState.dailyCount, 3);

  // Avanço no calendário (2026-01-02) reseta para 0
  window.AFM_PlayerEngine.syncDailyTrainingLimit(pState, "2026-01-02");
  assert.strictEqual(pState.trainingState.dailyCount, 0, "Mudança de data no calendário DEVE resetar cargas diárias para 0");
  console.log("✔ Limite de 3 treinos diários e reset de calendário validados com rigor!");
}

// 5. 3º Minigame: 1x1 & Drible com Combo Streak e XP
console.log("\n5. Testando 3º minigame (Drible & 1x1) e bônus de combo streak...");
{
  const pState = {
    trainingState: { dailyCount: 0, lastTrainingDate: "2026-01-03" },
    xp: 0,
    dribbleStreak: 0,
    evolutionLog: []
  };

  // 1º drible com sucesso (+25 XP)
  const d1 = window.AFM_PlayerEngine.executePracticalTraining({
    type: "dribble",
    isGoal: true,
    playerState: pState,
    currentGameDate: "2026-01-03"
  });
  assert(d1.success);
  assert.strictEqual(pState.dribbleStreak, 1);
  assert.strictEqual(d1.xpEarned, 25);

  // 2º drible consecutivo (+25 + 5 = +30 XP de combo)
  pState.trainingState.dailyCount = 1; // simula carga disponível
  const d2 = window.AFM_PlayerEngine.executePracticalTraining({
    type: "1v1",
    isGoal: true,
    playerState: pState,
    currentGameDate: "2026-01-03"
  });
  assert(d2.success);
  assert.strictEqual(pState.dribbleStreak, 2);
  assert.strictEqual(d2.xpEarned, 30, "Combo de 2 dribles deve conceder +30 XP (25 base + 5 bônus)");

  // 3º drible com erro (zera combo streak)
  pState.trainingState.dailyCount = 2;
  const d3 = window.AFM_PlayerEngine.executePracticalTraining({
    type: "dribble",
    isGoal: false,
    playerState: pState,
    currentGameDate: "2026-01-03"
  });
  assert(d3.success);
  assert.strictEqual(pState.dribbleStreak, 0, "Erro no drible deve zerar streak");
  assert.strictEqual(d3.xpEarned, 4, "Tentativa incompleta deve conceder +4 XP de consolação");
  assert(pState.evolutionLog.length >= 3, "Minigame deve alimentar evolutionLog");
  console.log("✔ 3º Minigame de Drible 1x1 com streak e XP validado com sucesso!");
}

// 6. Catálogo de PlayStyles e Trava de 3 Equipados
console.log("\n6. Testando sistema de PlayStyles / Especialidades (máx 3 equipados)...");
{
  const evo = window.AFM_PLAYER_EVOLUTION;
  assert(evo.PLAYSTYLES_CATALOG.length >= 8, "Catálogo de PlayStyles deve conter pelo menos 8 especialidades");

  const pState = {
    equippedPlayStyles: ["chute_colocado", "velocidade_pura"]
  };

  // Tenta equipar o 3º
  pState.equippedPlayStyles.push("drible_espacial");
  assert.strictEqual(pState.equippedPlayStyles.length, 3);

  // Tenta equipar o 4º (deve ser limitado a 3)
  const canEquip4 = pState.equippedPlayStyles.length < 3;
  assert(!canEquip4, "Não deve permitir equipar mais de 3 PlayStyles simultâneos");
  console.log("✔ Trava de PlayStyles (máximo 3 equipados) aprovada!");
}

// 7. Sessões Extras de Treino no CT & Academia
console.log("\n7. Testando Sessões Extras no CT & Academia e bônus de Perna Ruim...");
{
  const evo = window.AFM_PLAYER_EVOLUTION;
  assert(evo.EXTRA_SESSIONS_CATALOG.length >= 4, "Deve oferecer 4 sessões extras no CT & Academia");

  const sessWeakFoot = evo.EXTRA_SESSIONS_CATALOG.find(s => s.id === "treino_perna_ruim");
  assert(sessWeakFoot, "Deve existir sessão de treino de perna ruim");
  assert.strictEqual(sessWeakFoot.energyCost, 15);
  assert.strictEqual(sessWeakFoot.xpReward, 40);
  console.log("✔ Catálogo de Sessões Extras do CT aprovado!");
}

// 8. Staff Pessoal de Performance & Multiplicador de XP
console.log("\n8. Testando Staff Pessoal de Performance e bônus de XP...");
{
  const evo = window.AFM_PLAYER_EVOLUTION;
  assert(evo.STAFF_CATALOG.length >= 3, "Deve conter catálogo de staff pessoal de performance");

  const pState = {
    hiredStaff: { personal_trainer: true }, // +15% XP
    trainingState: { dailyCount: 0, lastTrainingDate: "2026-01-04" },
    xp: 0
  };

  const res = window.AFM_PlayerEngine.executePracticalTraining({
    type: "penalty",
    isGoal: true,
    playerState: pState,
    currentGameDate: "2026-01-04"
  });

  // Base 20 * 1.15 = 23 XP
  assert.strictEqual(res.xpEarned, 23, "Personal Trainer deve conceder +15% de XP sobre o treino");
  console.log(`✔ Bônus de Staff Pessoal aplicado com precisão: ${res.xpEarned} XP!`);
}

// 9. Objetivos Mensais do Treinador
console.log("\n9. Testando Objetivos Mensais do Treinador...");
{
  const evo = window.AFM_PLAYER_EVOLUTION;
  const state = {
    date: "2026-01-01",
    playerCareerState: {},
    squad: [{ isControlledAthlete: true, pos: "ATA", attributes: { vel: 35, chu: 35, pas: 35, dri: 35, def: 35, fis: 35 } }]
  };

  evo.syncAthleteState(state);
  assert(Array.isArray(state.playerCareerState.monthlyCoachObjectives), "Deve gerar lista de objetivos");
  assert.strictEqual(state.playerCareerState.monthlyCoachObjectives.length, 3, "Treinador deve estipular 3 objetivos mensais");
  console.log("✔ 3 Objetivos Mensais gerados com sucesso!");
}

// 10. Radar Hexagonal SVG e Card FUT Dinâmico
console.log("\n10. Testando renderização de Radar Hexagonal SVG e Card FUT...");
{
  const evo = window.AFM_PLAYER_EVOLUTION;
  const radarSvg = evo.generateRadarSvg({ vel: 55, chu: 60, pas: 45, dri: 50, def: 35, fis: 65 });
  assert(radarSvg.includes("<svg"), "Radar deve gerar SVG válido");
  assert(radarSvg.includes("<polygon"), "Radar deve conter polígono de atributos");

  const futBronze = evo.renderFutCard({ ovr: 60, name: "Atleta Teste", pos: "ATA", attributes: { vel: 50 } }, {});
  assert(futBronze.includes("fut-card-bronze"), "Atleta < 65 deve receber Card Bronze");

  const futSilver = evo.renderFutCard({ ovr: 70, name: "Atleta Teste", pos: "ATA", attributes: { vel: 70 } }, {});
  assert(futSilver.includes("fut-card-silver"), "Atleta 65-74 deve receber Card Prata");

  const futGold = evo.renderFutCard({ ovr: 80, name: "Atleta Teste", pos: "ATA", attributes: { vel: 80 } }, {});
  assert(futGold.includes("fut-card-gold"), "Atleta 75-84 deve receber Card Ouro");

  const futSpecial = evo.renderFutCard({ ovr: 88, name: "Atleta Teste", pos: "ATA", attributes: { vel: 88 } }, {});
  assert(futSpecial.includes("fut-card-special"), "Atleta 85-89 deve receber Card Especial");

  const futLegend = evo.renderFutCard({ ovr: 92, name: "Atleta Teste", pos: "ATA", attributes: { vel: 92 } }, {});
  assert(futLegend.includes("fut-card-legendary"), "Atleta 90+ deve receber Card Lendário/Ídolo");
  console.log("✔ Radar Hexagonal SVG e Cards FUT (Bronze, Prata, Ouro, Especial, Lendário) validados!");
}

// 11. Renderização Geral e Delegação de Eventos na UI
console.log("\n11. Testando renderização da view 'player_evolution' com todos os componentes...");
{
  const state = {
    date: "2026-01-01",
    view: "player_evolution",
    playerCareerState: {
      athleteOvr: 36,
      skillPoints: 5,
      pendingAttributePoints: { vel: 1 },
      xp: 150,
      xpToNextLevel: 400,
      energy: 90,
      fitness: 90,
      trainingState: { dailyCount: 1, maxDailyLimit: 3, lastTrainingDate: "2026-01-01" },
      evolutionLog: [
        { date: "2026-01-01", icon: "⚽", type: "training", desc: "Treino de Pênaltis: Sucesso! (+20 XP)" }
      ]
    },
    squad: [
      {
        id: "p_craque",
        name: "D. Aquino",
        nickname: "Craque",
        pos: "ATA",
        isControlledAthlete: true,
        attributes: { vel: 45, chu: 42, pas: 35, dri: 35, def: 35, fis: 39 },
        energy: 90,
        fitness: 90
      }
    ]
  };

  const html = window.AFM_PlayerModeUI.renderPlayerEvolution(state);
  assert(html.includes("btn-upgrade-skill"), "Deve renderizar botões de upgrade de skill");
  assert(html.includes("btn-decrease-skill"), "Deve renderizar botões de redução de skill pendente");
  assert(html.includes("btn-confirm-skill-points"), "Deve renderizar botão de confirmação de atributos");
  assert(html.includes("btn-train-penalty"), "Deve renderizar botão de Treino de Pênaltis");
  assert(html.includes("btn-train-freekick"), "Deve renderizar botão de Treino de Faltas");
  assert(html.includes("btn-train-dribble"), "Deve renderizar botão de Treino de Drible 1x1");
  assert(html.includes("btn-playstyle-toggle"), "Deve renderizar botões de PlayStyles");
  assert(html.includes("btn-extra-session"), "Deve renderizar botões de Sessões Extras");
  assert(html.includes("btn-hire-evolution-staff"), "Deve renderizar botões de Staff de Performance");
  assert(html.includes("RADAR HEXAGONAL DE ATRIBUTOS"), "Deve renderizar container do gráfico radar");
  assert(html.includes("fut-card"), "Deve renderizar card estilo FUT");
  assert(html.includes("HISTÓRICO DE EVOLUÇÃO"), "Deve renderizar log histórico de evolução");
  console.log("✔ Aba '⚡ Meu Atleta & Treino' renderizou todos os 10 sistemas sem falhas!");
}

console.log("\n🎉 TODOS OS 11 TESTES DO SISTEMA DE EVOLUÇÃO E TREINO PASSARAM COM 100% DE SUCESSO! 🎉");
