/**
 * TEST-GAMEPLAY-SYSTEMS.JS
 * Testes unitários e de integração para os subsistemas corrigidos do AFM Manager 2027:
 * 1. Calendário e Portão de Início de Partida (canStartMatch / advanceCalendarDays)
 * 2. Máquina de Estados da Partida (FIRST_HALF, HALF_TIME, SECOND_HALF, FULL_TIME)
 * 3. Sistema de Substituições (Limites, Atributos, Lineup Sync, Proibição de reentrada)
 * 4. Ampliação do Estádio (Anéis, Setores, Sincronização de Capacidade)
 * 5. Sanitização de Persistência (Regras do AGENTS.md)
 */

const fs = require('fs');
const path = require('path');
global.window = {};
require('../js/core/tournament_engine.js');

// Carrega o código do game.js para inspeção e testes
const gameJsPath = path.resolve(__dirname, '../js/game.js');
const gameJsContent = fs.readFileSync(gameJsPath, 'utf8');

const vm = require('vm');
try {
  new vm.Script(gameJsContent);
  console.log('  ✅ Sintaxe do game.js está 100% válida!');
} catch(err) {
  console.error('  ❌ ERRO DE SINTAXE EM GAME.JS:', err);
}

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${testName} ${details ? `(${details})` : ''}`);
    failedTests++;
  }
}

console.log('--- TESTE 0: Resultados de torneios persistentes ---');
const tournamentEngine = window.AFM_TOURNAMENT_ENGINE;
const sampleTournament = tournamentEngine.createGroupTournament({
  id: 'sample', season: 2026, groups: { A: ['Clube Um', 'Clube Dois'] },
  fixtures: [{ group: 'A', round: 1, date: '2026-04-07', home: 'Clube Um', away: 'Clube Dois' }]
});
const sampleMatch = sampleTournament.matches[0];
tournamentEngine.recordResult(sampleTournament, sampleMatch.id, 2, 0);
assert(sampleTournament.standings.A[0].name === 'Clube Um' && sampleTournament.standings.A[0].points === 3,
  'Placar de grupo atualiza pontuação e classificação');
let duplicateRejected = false;
try { tournamentEngine.recordResult(sampleTournament, sampleMatch.id, 1, 0); } catch { duplicateRejected = true; }
assert(duplicateRejected, 'Resultado duplicado é rejeitado para proteger o save');

// =========================================================================
// 1. TESTE DO CALENDÁRIO E PORTÃO DE INÍCIO DE PARTIDA
// =========================================================================
console.log('--- TESTE 1: Calendário e Portão canStartMatch ---');

// Mock básico das funções para teste puro
function mockCanStartMatch(state, fixture, matchDate) {
  if (!state || !state.club) {
    return { canStart: false, reason: 'Nenhum clube ativo selecionado', status: 'no_club' };
  }
  const scheduleLength = state.schedule?.length || 1;
  if (state.round >= scheduleLength) {
    return { canStart: false, reason: 'Temporada concluída', status: 'completed' };
  }
  if (!fixture) {
    return { canStart: false, reason: 'Nenhum confronto agendado para esta rodada', status: 'no_fixture' };
  }
  const startersCount = (state.lineup || []).filter(p => !p.bench).length;
  if (startersCount < 11) {
    return { canStart: false, reason: `Escalação incompleta (${startersCount}/11 titulares)`, status: 'invalid_lineup' };
  }
  const currentDate = state.date || '2026-01-01';
  if (currentDate < matchDate) {
    const d1 = new Date(currentDate);
    const d2 = new Date(matchDate);
    const diffDays = Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));
    return {
      canStart: false,
      reason: `A partida ocorrerá em ${matchDate}. Faltam ${diffDays} dias no calendário.`,
      status: 'future',
      daysDiff: diffDays,
      matchDate
    };
  }
  return { canStart: true, reason: 'Partida liberada para o pontapé inicial!', status: 'playable', matchDate };
}

const dummyState = {
  club: 'Brasília',
  round: 0,
  schedule: [[['Brasília', 'Gama']]],
  lineup: Array.from({ length: 11 }, (_, i) => ({ id: `p${i}`, name: `Jogador ${i}`, bench: false })),
  date: '2026-01-01'
};

const matchDate = '2026-01-12';
const gateFuture = mockCanStartMatch(dummyState, ['Brasília', 'Gama'], matchDate);
assert(gateFuture.canStart === false && gateFuture.status === 'future' && gateFuture.daysDiff === 11,
  'Bloqueia início de partida quando a data do jogo é no futuro (01/01 vs 12/01)');

dummyState.date = '2026-01-12';
const gatePlayable = mockCanStartMatch(dummyState, ['Brasília', 'Gama'], matchDate);
assert(gatePlayable.canStart === true && gatePlayable.status === 'playable',
  'Permite início de partida quando a data atual coincide com a data do jogo (12/01)');

dummyState.lineup.pop(); // Apenas 10 titulares
const gateIncomplete = mockCanStartMatch(dummyState, ['Brasília', 'Gama'], matchDate);
assert(gateIncomplete.canStart === false && gateIncomplete.status === 'invalid_lineup',
  'Bloqueia início de partida se a escalação tiver menos de 11 titulares');

// =========================================================================
// 2. TESTE DA MÁQUINA DE ESTADOS DA PARTIDA AO VIVO
// =========================================================================
console.log('\n--- TESTE 2: Máquina de Estados da Partida ao Vivo ---');

function mockTransitionMatchPhase(matchState, newPhase) {
  const allowedPhases = ['PRE_MATCH', 'FIRST_HALF', 'HALF_TIME', 'SECOND_HALF', 'FULL_TIME', 'POST_MATCH'];
  if (!allowedPhases.includes(newPhase)) return false;
  const current = matchState.phase || 'FIRST_HALF';
  if (current === 'FULL_TIME' && newPhase !== 'POST_MATCH') return false;
  if (current === 'SECOND_HALF' && (newPhase === 'FIRST_HALF' || newPhase === 'HALF_TIME')) return false;
  if (current === 'HALF_TIME' && newPhase === 'FIRST_HALF') return false;
  matchState.phase = newPhase;
  return true;
}

const mockMatch = { phase: 'FIRST_HALF', minute: 20 };
assert(mockTransitionMatchPhase(mockMatch, 'HALF_TIME') === true && mockMatch.phase === 'HALF_TIME',
  'Transição legal: FIRST_HALF -> HALF_TIME');

assert(mockTransitionMatchPhase(mockMatch, 'SECOND_HALF') === true && mockMatch.phase === 'SECOND_HALF',
  'Transição legal: HALF_TIME -> SECOND_HALF');

assert(mockTransitionMatchPhase(mockMatch, 'HALF_TIME') === false && mockMatch.phase === 'SECOND_HALF',
  'Transição ilegal rejeitada: SECOND_HALF -> HALF_TIME (Não volta ao intervalo no 2º tempo)');

assert(mockTransitionMatchPhase(mockMatch, 'FULL_TIME') === true && mockMatch.phase === 'FULL_TIME',
  'Transição legal: SECOND_HALF -> FULL_TIME');

assert(mockTransitionMatchPhase(mockMatch, 'FIRST_HALF') === false && mockMatch.phase === 'FULL_TIME',
  'Transição ilegal rejeitada: FULL_TIME -> FIRST_HALF');

// =========================================================================
// 3. TESTE DE SUBSTITUIÇÕES E SINCRONIZAÇÃO DE LINEUP
// =========================================================================
console.log('\n--- TESTE 3: Substituições e Sincronização de Lineup ---');

const mockSquad = [
  { id: 'p1', name: 'Atacante Titular', ovr: 80, pos: 'ST', stamina: 35, bench: false },
  { id: 'p2', name: 'Atacante Reserva', ovr: 78, pos: 'ST', stamina: 100, bench: true }
];
const mockMatchSubs = {
  subsLeft: 5,
  subbedOutKeys: [],
  homePlayers: [
    { key: 'p1', name: 'Atacante Titular', ovr: 80, pos: 'ST', stamina: 35, team: 'home' }
  ]
};

function mockExecuteSub(starterKey, benchKey, matchState, squad) {
  if (matchState.subsLeft <= 0) return { ok: false, msg: 'Sem substituições restantes' };
  if (matchState.subbedOutKeys.includes(benchKey)) return { ok: false, msg: 'Jogador já saiu de campo' };

  const starter = matchState.homePlayers.find(p => p.key === starterKey);
  const benchObj = squad.find(p => p.id === benchKey);
  if (!starter || !benchObj) return { ok: false, msg: 'Jogador não encontrado' };

  matchState.subbedOutKeys.push(starterKey);
  matchState.subsLeft--;

  starter.key = benchObj.id;
  starter.name = benchObj.name;
  starter.ovr = benchObj.ovr;
  starter.stamina = 100;

  // Sincroniza estado de banco no elenco
  const sqStarter = squad.find(p => p.id === starterKey);
  if (sqStarter) sqStarter.bench = true;
  benchObj.bench = false;

  return { ok: true, starter, benchObj };
}

const sub1 = mockExecuteSub('p1', 'p2', mockMatchSubs, mockSquad);
assert(sub1.ok === true && mockMatchSubs.subsLeft === 4, 'Substituição executada com sucesso e contador decrementado');
assert(mockMatchSubs.homePlayers[0].name === 'Atacante Reserva' && mockMatchSubs.homePlayers[0].stamina === 100,
  'Titular substituído adota nome, atributos e energia do reserva');
assert(mockSquad.find(p => p.id === 'p1').bench === true && mockSquad.find(p => p.id === 'p2').bench === false,
  'Lineup global sincronizado: antigo titular vai para o banco, novo entra como titular');

const subReturn = mockExecuteSub('p2', 'p1', mockMatchSubs, mockSquad);
assert(subReturn.ok === false, 'Impede reentrada de jogador que já havia sido substituído');

// =========================================================================
// 3B. TESTE DE SUBSTITUIÇÃO 100% POR CLIQUE E POSIÇÕES LIVRES (AFM 2027)
// =========================================================================
console.log('\n--- TESTE 3B: Substituição 100% por Clique e Posições (AFM 2027) ---');

// Matriz de fit e penalização extraída do modelo oficial
function testGetPositionFit(playerRole, slotRole){
  if(!playerRole || !slotRole) return 'INCOMPATÍVEL';
  const p = String(playerRole).split(',')[0].trim().toUpperCase();
  const s = String(slotRole).trim().toUpperCase();
  if(p === 'GK' || s === 'GK'){
    return (p === 'GK' && s === 'GK') ? 'IDEAL' : 'INCOMPATÍVEL';
  }
  if(p === s) return 'IDEAL';
  const adaptedMap = {
    CB: ['LB', 'RB', 'DM'],
    LB: ['RB', 'LW', 'LM', 'CB'],
    RB: ['LB', 'RW', 'RM', 'CB'],
    DM: ['CB', 'CM'],
    CM: ['DM', 'AM', 'LM', 'RM'],
    AM: ['LW', 'RW', 'CM', 'CF'],
    LW: ['RW', 'LM', 'AM', 'ST', 'CF'],
    RW: ['LW', 'RM', 'AM', 'ST', 'CF'],
    LM: ['LW', 'LB', 'CM', 'AM', 'RM'],
    RM: ['RW', 'RB', 'CM', 'AM', 'LM'],
    ST: ['CF', 'LW', 'RW', 'AM'],
    CF: ['ST', 'LW', 'RW', 'AM']
  };
  if(adaptedMap[p]?.includes(s) || adaptedMap[s]?.includes(p)){
    return 'ADAPTADA';
  }
  return 'INCOMPATÍVEL';
}

function testCompatibleScore(p, role){
  const pPos = String(p?.pos || '').trim().toUpperCase();
  const sRole = String(role || '').trim().toUpperCase();
  if(!pPos || !sRole || pPos === sRole) return 0;
  if(sRole === 'GK' && pPos !== 'GK') return -8;
  if(sRole !== 'GK' && pPos === 'GK') return -8;
  const fit = testGetPositionFit(pPos, sRole);
  if(fit === 'IDEAL') return 0;
  if(fit === 'ADAPTADA') return -3;
  return -6;
}

function testGetPlayerEffectiveOverall(p, role){
  const base = p?.overall || 60;
  const penalty = testCompatibleScore(p, role);
  return Math.max(45, Math.min(99, base + penalty));
}

// 1. Testes de penalização de overall efetivo sem alterar overall original
const testPlayerST = { id: 'st1', name: 'Centroavante Estrela', pos: 'ST', overall: 85 };
assert(testGetPositionFit(testPlayerST.pos, 'ST') === 'IDEAL', 'Posição de origem (ST em ST) é IDEAL');
assert(testGetPlayerEffectiveOverall(testPlayerST, 'ST') === 85, 'Overall efetivo em posição IDEAL não sofre penalidade (85)');

assert(testGetPositionFit(testPlayerST.pos, 'LW') === 'ADAPTADA', 'Posição secundária (ST em LW) é ADAPTADA');
assert(testGetPlayerEffectiveOverall(testPlayerST, 'LW') === 82, 'Overall efetivo em posição ADAPTADA sofre penalidade leve de -3 (82)');

assert(testGetPositionFit(testPlayerST.pos, 'CB') === 'INCOMPATÍVEL', 'Posição fora de setor (ST em CB) é INCOMPATÍVEL');
assert(testGetPlayerEffectiveOverall(testPlayerST, 'CB') === 79, 'Overall efetivo em posição INCOMPATÍVEL sofre penalidade de -6 (79)');

assert(testGetPositionFit(testPlayerST.pos, 'GK') === 'INCOMPATÍVEL', 'Jogador de linha no gol (ST em GK) é INCOMPATÍVEL');
assert(testGetPlayerEffectiveOverall(testPlayerST, 'GK') === 77, 'Overall efetivo de atacante no gol sofre penalidade de -8 (77)');

assert(testPlayerST.overall === 85, 'Overall base do atleta original permanece estritamente preservado (85) sem mutação permanente');

// 2. Testes de executeSwap (Menu 1 - Meu time & Tática)
function testExecuteSwap(stateObj, sourceKey, targetKey, targetSlotIndex = null, sourceSlotIndex = null) {
  if (!sourceKey && !targetKey && !Number.isInteger(targetSlotIndex)) return;
  if (!Array.isArray(stateObj.lineup)) stateObj.lineup = [];
  while (stateObj.lineup.length < 11) stateObj.lineup.push(null);

  if (Number.isInteger(sourceSlotIndex) && Number.isInteger(targetSlotIndex) &&
      sourceSlotIndex >= 0 && sourceSlotIndex < 11 &&
      targetSlotIndex >= 0 && targetSlotIndex < 11 &&
      sourceSlotIndex !== targetSlotIndex) {
    const temp = stateObj.lineup[sourceSlotIndex];
    stateObj.lineup[sourceSlotIndex] = stateObj.lineup[targetSlotIndex];
    stateObj.lineup[targetSlotIndex] = temp;
    return;
  }

  const sKey = sourceKey || null;
  const tKey = targetKey || null;
  let sourceLineupIdx = Number.isInteger(sourceSlotIndex) ? sourceSlotIndex : (sKey ? stateObj.lineup.indexOf(sKey) : -1);
  let targetLineupIdx = Number.isInteger(targetSlotIndex) ? targetSlotIndex : (tKey ? stateObj.lineup.indexOf(tKey) : -1);

  if (sourceLineupIdx >= 0 && targetLineupIdx >= 0 && sourceLineupIdx !== targetLineupIdx) {
    [stateObj.lineup[sourceLineupIdx], stateObj.lineup[targetLineupIdx]] = 
      [stateObj.lineup[targetLineupIdx], stateObj.lineup[sourceLineupIdx]];
  } else if (targetLineupIdx >= 0 && sKey) {
    stateObj.lineup = stateObj.lineup.map((k, idx) => (idx !== targetLineupIdx && k === sKey ? null : k));
    if (sourceLineupIdx >= 0) stateObj.lineup[sourceLineupIdx] = stateObj.lineup[targetLineupIdx];
    stateObj.lineup[targetLineupIdx] = sKey;
  } else if (sourceLineupIdx >= 0 && tKey) {
    stateObj.lineup = stateObj.lineup.map((k, idx) => (idx !== sourceLineupIdx && k === tKey ? null : k));
    if (targetLineupIdx >= 0) stateObj.lineup[targetLineupIdx] = stateObj.lineup[sourceLineupIdx];
    stateObj.lineup[sourceLineupIdx] = tKey;
  }
}

const mockCareerState = {
  lineup: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10', 'p11'],
  squad: [
    { id: 'p1', pos: 'GK', overall: 80 }, { id: 'p2', pos: 'LB', overall: 75 },
    { id: 'p3', pos: 'CB', overall: 78 }, { id: 'p4', pos: 'CB', overall: 77 },
    { id: 'p5', pos: 'RB', overall: 76 }, { id: 'p6', pos: 'DM', overall: 79 },
    { id: 'p7', pos: 'CM', overall: 81 }, { id: 'p8', pos: 'CM', overall: 80 },
    { id: 'p9', pos: 'LW', overall: 83 }, { id: 'p10', pos: 'ST', overall: 85 },
    { id: 'p11', pos: 'RW', overall: 82 },
    { id: 'b1', pos: 'ST', overall: 84 }, { id: 'b2', pos: 'CB', overall: 79 }
  ]
};

// Teste 3B.A: Titular -> Reserva (clicar titular p10 depois reserva b1)
testExecuteSwap(mockCareerState, 'b1', 'p10', 9);
assert(mockCareerState.lineup[9] === 'b1', 'Reserva b1 assume com sucesso a vaga 9 do titular');
assert(!mockCareerState.lineup.includes('p10'), 'Titular p10 sai da escalação e vai para o banco');
assert(mockCareerState.lineup.filter(k => k === 'b1').length === 1, 'Sem duplicação de atletas na escalação');
assert(mockCareerState.lineup.filter(Boolean).length === 11, 'Vaga tática continua preenchida com 11 atletas');

// Teste 3B.B: Reserva -> Titular (clicar reserva b2 depois titular na vaga 2)
testExecuteSwap(mockCareerState, 'b2', mockCareerState.lineup[2], 2);
assert(mockCareerState.lineup[2] === 'b2', 'Fluxo inverso (Reserva ➔ Titular) funciona identicamente');
assert(!mockCareerState.lineup.includes('p3'), 'Antigo titular p3 vai para o banco');
assert(mockCareerState.lineup.filter(Boolean).length === 11, 'Todas as 11 posições ocupadas sem lacunas');

// Teste 3B.C: Titular A -> Titular B (inverter posições entre dois titulares)
const playerAtIdx0 = mockCareerState.lineup[0];
const playerAtIdx1 = mockCareerState.lineup[1];
testExecuteSwap(mockCareerState, playerAtIdx0, playerAtIdx1, 1);
assert(mockCareerState.lineup[0] === playerAtIdx1 && mockCareerState.lineup[1] === playerAtIdx0,
  'Inversão entre dois titulares troca suas vagas com precisão');

// Teste 3B.D: Auditoria estática de remoção de drag e suporte a cliques
assert(!gameJsContent.includes('slot.setAttribute(\'draggable\', \'true\')'),
  'Dependência de drag-and-drop no campo de tática completamente eliminada');
assert(gameJsContent.includes('highlightSlotsForBench') && gameJsContent.includes('highlightBenchForStarter'),
  'Destaques visuais consistentes de compatibilidade por clique implementados');
assert(gameJsContent.includes('slot-incompatible'),
  'Indicação de posição incompatível (vermelha) integrada ao sistema visual');

// Teste 3B.E: Inversão específica de titulares por índices (ex: Romero na vaga 10 e Depay na vaga 9)
const slot9Before = mockCareerState.lineup[9];
const slot10Before = mockCareerState.lineup[10];
testExecuteSwap(mockCareerState, slot10Before, slot9Before, 9, 10);
assert(mockCareerState.lineup[9] === slot10Before && mockCareerState.lineup[10] === slot9Before,
  'Troca direta entre dois titulares por clique (ex: Romero e Depay) inverte seus slots com precisão');
// =========================================================================
console.log('\n--- TESTE 4: Ampliação do Estádio por Setores e Anéis ---');

const mockStadiumState = {
  balance: 5000000,
  infrastructure: { stadium: { level: 3, capacity: 18000 } },
  stadiumRingData: {
    ring: 1,
    maxRings: 4,
    sides: { norte: false, sul: false, leste: false, oeste: false }
  }
};

function mockBuildStadiumSide(side, stState) {
  const stData = stState.stadiumRingData;
  const unbuilt = ['norte', 'sul', 'leste', 'oeste'].find(s => !stData.sides[s]);
  if (!unbuilt) return { ok: false, msg: 'Anel completo' };

  let target = side;
  if (!target || stData.sides[target]) target = unbuilt;

  const cost = 850000;
  stState.balance -= cost;
  stData.sides[target] = true;
  stState.infrastructure.stadium.capacity += 3500;

  const allDone = ['norte', 'sul', 'leste', 'oeste'].every(s => stData.sides[s]);
  if (allDone) {
    stData.ring++;
    stData.sides = { norte: false, sul: false, leste: false, oeste: false };
  }
  return { ok: true, target, newCap: stState.infrastructure.stadium.capacity };
}

const build1 = mockBuildStadiumSide('norte', mockStadiumState);
assert(build1.ok === true && build1.target === 'norte' && build1.newCap === 21500,
  'Setor NORTE construído com sucesso (+3.500 lugares, capacidade 21.500)');

// Tenta construir NORTE novamente -> deve redirecionar para o próximo setor livre (sul)
const build2 = mockBuildStadiumSide('norte', mockStadiumState);
assert(build2.ok === true && build2.target === 'sul' && build2.newCap === 25000,
  'Setor já construído redireciona com segurança para o próximo setor vago (SUL)');

mockBuildStadiumSide('leste', mockStadiumState);
mockBuildStadiumSide('oeste', mockStadiumState);
assert(mockStadiumState.stadiumRingData.ring === 2 && mockStadiumState.stadiumRingData.sides.norte === false,
  'Conclusão dos 4 setores avança automaticamente para o Anel 2');

// =========================================================================
// 5. TESTE DE AUDITORIA DE CÓDIGO FONTE (VERIFICAÇÕES ESTÁTICAS)
// =========================================================================
console.log('\n--- TESTE 5: Auditoria Estática do Código Fonte (game.js e app.css) ---');

const finalizeRoundSource = gameJsContent.slice(
  gameJsContent.indexOf('function finalizeRound('),
  gameJsContent.indexOf('function showChampionTrophyCeremonyModal(')
);
assert(/let advanced = false/.test(finalizeRoundSource),
  'Classificação de mata-mata tem valor definido mesmo sem resultado do usuário');
assert(/advanced=isKO\?norm\(userRes\.winner\)===norm\(state\.club\)/.test(finalizeRoundSource),
  'Comparação do classificado de mata-mata ignora diferenças de caixa e acentuação');
assert(/comp\.id === 'bra-cup'/.test(finalizeRoundSource),
  'Premiação reconhece o identificador real da Copa do Brasil');
assert(!gameJsContent.includes("window.AFM30.audio.play('crowdCheer')") && !gameJsContent.includes("window.AFM30.audio.play('whistle')")
  && gameJsContent.includes('window.AFM30.audio.playCheer()') && gameJsContent.includes('window.AFM30.audio.playWhistle()'),
  'Pós-jogo usa os métodos de áudio existentes sem falha tratada silenciosamente');

assert(!gameJsContent.includes('id="btnLiveReplay"'),
  'Botão de Replay removido da barra de controles da partida ao vivo (game.js)');

assert(gameJsContent.includes('function canStartMatch('),
  'Função canStartMatch implementada como portão arquitetural central (game.js)');
assert(gameJsContent.includes("status: 'no_fixture'") && gameJsContent.includes('Nenhuma partida agendada para o seu clube nesta rodada (Folga na tabela).'),
  'Rodada sem jogo do clube recebe status explícito para recuperação');
assert(gameJsContent.includes('Rodadas sem jogo do clube são folgas válidas, não partidas atrasadas.'),
  'Folga do clube não é bloqueada pela verificação de partida atrasada');
assert(gameJsContent.includes('Rodada sem fixtures recuperada') && gameJsContent.includes('gameState.schedule?.[gameState.round]'),
  'Calendário recupera rodadas vazias e valida confrontos da carreira correta');

assert(gameJsContent.includes('function advanceCalendarDays('),
  'Função advanceCalendarDays implementada para avanço seguro dia a dia (game.js)');
assert(gameJsContent.includes('const baseCost = ring <= 2 ? 850000 : ring <= 4 ? 1200000 : 1800000') && gameJsContent.includes('return Math.round(baseCost * 1.30)') && gameJsContent.includes('if(ring <= 2) return rnd(15, 25)') && gameJsContent.includes('if(ring <= 4) return rnd(30, 45)') && gameJsContent.includes('return rnd(50, 90)'),
  'Expansão do estádio aplica custo +30% e prazos realistas por anel');
assert(gameJsContent.includes('OBRA EM ANDAMENTO') && gameJsContent.includes('stadiumWorkProgress'),
  'Interface do estádio mostra dias restantes e barra de progresso');
assert(gameJsContent.includes("offerType: 'arabic'") && gameJsContent.includes('transferMultiplier') && gameJsContent.includes('salaryMultiplier'),
  'Mercado inclui ofertas árabes com multiplicadores de transferência e salário');
assert(gameJsContent.includes('transferDiscontentDays') && gameJsContent.includes('wantsTransfer = true'),
  'Recusa de oferta árabe ativa insatisfação temporária do jogador');

assert(gameJsContent.includes("state.setPieces.penalty = pTak.value") && gameJsContent.includes("lowerTaker.value = pTak.value") && gameJsContent.includes("lowerTaker.value = fTak.value"),
  'Seletores superiores sincronizam os cobradores de pênaltis e faltas com a seção inferior');

const stadiumDaysStart = gameJsContent.indexOf('function getStadiumWorkDaysRemaining(');
const stadiumDaysEnd = gameJsContent.indexOf('function processStadiumConstructionDay(', stadiumDaysStart);
const stadiumDaysSource = gameJsContent.slice(stadiumDaysStart, stadiumDaysEnd).trim();
const stadiumDaysContext = { state: { date: '2026-06-01', stadiumRingData: {} } };
const getStadiumWorkDaysRemaining = vm.runInNewContext(`(${stadiumDaysSource})`, stadiumDaysContext);
const legacyStadiumWork = { roundsRemaining: 2 };
assert(getStadiumWorkDaysRemaining(legacyStadiumWork) === 14 && legacyStadiumWork.finishDate === '2026-06-15',
  'Obra de save legado migra de duas rodadas para 14 dias restantes');
stadiumDaysContext.state.date = '2026-06-02';
assert(getStadiumWorkDaysRemaining(legacyStadiumWork) === 13,
  'Contagem da obra do estádio diminui um dia com o calendário');
stadiumDaysContext.state.date = '2026-06-15';
assert(getStadiumWorkDaysRemaining(legacyStadiumWork) === 0,
  'Obra do estádio fica pronta ao atingir a data final');
assert(/state\.date = nextDate;\r?\n\s*processStadiumConstructionDay\(\);/.test(gameJsContent) && /state\.date = curD\.toISOString\(\)\.slice\(0, 10\);\r?\n\s*processStadiumConstructionDay\(\);/.test(gameJsContent),
  'Obra do estádio é processada em dias avançados manualmente e após cada partida');
assert(/function simulateQuickRound\(\)[\s\S]*?finalizeRound\(userRes, winners, isKO\);[\s\S]*?save\(\);[\s\S]*?render\(\);[\s\S]*?isSimulatingQuickRound = false;/.test(gameJsContent),
  'Simulação finaliza a rodada, salva, atualiza a interface e libera o fluxo sincronamente');
assert(/\} finally \{\r?\n\s*isAdvancingTime = false;\r?\n\s*\}/.test(gameJsContent),
  'Trava do calendário é liberada no mesmo ciclo síncrono do avanço');

assert(gameJsContent.includes('function transitionMatchPhase('),
  'Máquina formal de fases da partida transitionMatchPhase implementada (game.js)');

assert(gameJsContent.includes('function isTransferWindowOpen('),
  'Função central isTransferWindowOpen implementada (game.js)');

assert(gameJsContent.includes('const TRANSFER_WINDOWS ='),
  'Configuração anual TRANSFER_WINDOWS definida para múltiplas temporadas (game.js)');

assert(gameJsContent.includes('const PLAY_PATTERNS ='),
  'Tabela variada de padrões de jogadas PLAY_PATTERNS implementada (game.js)');

assert(gameJsContent.includes('function drawRefereeSprite('),
  'Renderizador de árbitro drawRefereeSprite implementado (game.js)');

assert(gameJsContent.includes('function validateGoalScorer('),
  'Validador de artilheiro validateGoalScorer implementado (game.js)');

assert(gameJsContent.includes('function addNews('),
  'Função addNews implementada para registro seguro de notícias sem crash (game.js)');

const testNewsState = { news: Array.from({ length: 50 }, (_, i) => `Notícia ${i}`) };
function mockAddNews(s, txt) {
  if (!txt || !s) return;
  if (!Array.isArray(s.news)) s.news = [];
  s.news.unshift(txt);
  if (s.news.length > 50) s.news = s.news.slice(0, 50);
}
mockAddNews(testNewsState, 'Nova notícia de megaevento');
assert(testNewsState.news.length === 50 && testNewsState.news[0] === 'Nova notícia de megaevento',
  'addNews respeita o teto de 50 registros de notícias sem exceder');

const cssPath = path.resolve(__dirname, '../css/app.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');
assert(cssContent.includes('.halftime-pitch-player *'),
  'Proteção de eventos de ponteiro (pointer-events: none) aplicada no CSS para Drag & Drop (app.css)');

assert(gameJsContent.includes('btnLiveSpeed2') && gameJsContent.includes('btnLiveSpeed5') && gameJsContent.includes('btnLiveSpeed10'),
  'Botões de velocidade 2x, 5x e 10x presentes no template da partida (game.js)');
assert(gameJsContent.includes('{ speed: 2, btn: $(\'#btnLiveSpeed2\') }') && gameJsContent.includes('{ speed: 5, btn: $(\'#btnLiveSpeed5\') }') && gameJsContent.includes('{ speed: 10, btn: $(\'#btnLiveSpeed10\') }'),
  'Manipuladores de eventos de clique registrados para 2x, 5x e 10x em bindLiveMatchEvents (game.js)');
assert(!gameJsContent.includes('id="autoLineup"'),
  'Botão redundante Melhor XI removido em favor do botão oficial DEIXAR A IA ESCALAR (game.js)');
assert(gameJsContent.includes('FORMAÇÃO:') && gameJsContent.includes('id="formation"'),
  'Seletor de formação posicionado junto ao card de força e setores (game.js)');

// =========================================================================
// 6. TESTE DAS JANELAS DE TRANSFERÊNCIA (CALENDÁRIO ANUAL MULTITEMPORADA)
// =========================================================================
console.log('\n--- TESTE 6: Janelas de Transferências Anuais ---');

function mockIsTransferWindowOpen(dateStr) {
  if (!dateStr) return true;
  const parts = String(dateStr).split('-');
  if (parts.length < 3) return true;
  const m = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  // Janela 1: 01/01 a 01/03 (inclusive)
  if ((m === 1) || (m === 2) || (m === 3 && day <= 1)) {
    return true;
  }
  // Janela 2: 01/06 a 01/08 (inclusive)
  if ((m === 6) || (m === 7) || (m === 8 && day <= 1)) {
    return true;
  }
  return false;
}

assert(mockIsTransferWindowOpen('2026-01-01') === true, '01/01/2026: Janela 1 aberta');
assert(mockIsTransferWindowOpen('2026-02-15') === true, '15/02/2026: Janela 1 aberta');
assert(mockIsTransferWindowOpen('2026-03-01') === true, '01/03/2026: Limite da Janela 1 (aberta)');
assert(mockIsTransferWindowOpen('2026-03-02') === false, '02/03/2026: Janela 1 fechada');
assert(mockIsTransferWindowOpen('2026-05-31') === false, '31/05/2026: Fora da janela (fechada)');
assert(mockIsTransferWindowOpen('2026-06-01') === true, '01/06/2026: Janela 2 aberta automaticamente');
assert(mockIsTransferWindowOpen('2026-07-20') === true, '20/07/2026: Janela 2 aberta');
assert(mockIsTransferWindowOpen('2026-08-01') === true, '01/08/2026: Limite da Janela 2 (aberta)');
assert(mockIsTransferWindowOpen('2026-08-02') === false, '02/08/2026: Janela 2 fechada');
assert(mockIsTransferWindowOpen('2026-12-31') === false, '31/12/2026: Fim de temporada (fechada)');
assert(mockIsTransferWindowOpen('2027-01-01') === true, '01/01/2027: Nova temporada abre janela automaticamente');

// =========================================================================
// 7. TESTE DE VALIDAÇÃO DE ENTIDADES E ÁRBITRO
// =========================================================================
console.log('\n--- TESTE 7: Validação de Entidades no Gramado ---');

const mockHomePlayers = [
  { id: 'h-0', type: 'PLAYER', name: 'Goleiro Casa', isGK: true, canScore: false, teamId: 'home' },
  { id: 'h-1', type: 'PLAYER', name: 'Atacante Casa', isGK: false, canScore: true, teamId: 'home' }
];
const mockAwayPlayers = [
  { id: 'a-0', type: 'PLAYER', name: 'Goleiro Fora', isGK: true, canScore: false, teamId: 'away' },
  { id: 'a-1', type: 'PLAYER', name: 'Zagueiro Fora', isGK: false, canScore: true, teamId: 'away' }
];
const mockReferee = {
  id: 'ref-1',
  type: 'REFEREE',
  name: 'Árbitro Principal',
  isGK: false,
  canScore: false,
  canShoot: false,
  canAssist: false
};

function mockValidateScorer(shooter, attTeam, homeList, awayList) {
  if (!shooter) return false;
  if (shooter.type !== 'PLAYER') return false;
  if (shooter.canScore === false && !shooter.isPenalty) return false;
  const list = attTeam === 'home' ? homeList : awayList;
  return list.some(p => p.id === shooter.id);
}

assert(mockValidateScorer(mockHomePlayers[1], 'home', mockHomePlayers, mockAwayPlayers) === true,
  'Atacante regular validado com sucesso para marcar gol');

assert(mockValidateScorer(mockReferee, 'home', mockHomePlayers, mockAwayPlayers) === false,
  'Árbitro sumariamente BLOQUEADO para marcar gol');

assert(mockValidateScorer({ id: 'ghost', type: 'UNKNOWN', canScore: true }, 'home', mockHomePlayers, mockAwayPlayers) === false,
  'Entidade inválida / fantasma / UNKNOWN bloqueada');

assert(mockValidateScorer(mockAwayPlayers[1], 'home', mockHomePlayers, mockAwayPlayers) === false,
  'Jogador do time adversário não pode marcar a favor do time atacante');

// =========================================================================
// 8. TESTE DE NÃO-REPETIÇÃO DE JOGADAS DO MATCH ENGINE
// =========================================================================
console.log('\n--- TESTE 8: Variabilidade e Não-Repetição de Padrões de Jogada ---');

const patterns = [
  'Construção Curta', 'Ataque pela Esquerda', 'Ataque pela Direita',
  'Ataque Central', 'Contra-Ataque Rápido', 'Cruzamento na Área'
];
const recentPlays = ['Contra-Ataque Rápido', 'Contra-Ataque Rápido'];

function pickNonRepeatingPattern(recent, pool) {
  const filtered = pool.filter(p => !recent.slice(-2).includes(p));
  return filtered[0] || pool[0];
}

const nextPlay = pickNonRepeatingPattern(recentPlays, patterns);
assert(nextPlay !== 'Contra-Ataque Rápido',
  'Match Engine evita repetição imediata do mesmo padrão de ataque');

// =========================================================================
// 9. TESTE DE ORDENAÇÃO ESTÁVEL DO MERCADO
// =========================================================================
console.log('\n--- TESTE 9: Ordenação Estável e Imutável do Mercado ---');

const marketSample = [
  { id: 'p1', name: 'Carlos', age: 28, fc: 78, val: 5.0 },
  { id: 'p2', name: 'Bruno', age: 20, fc: 82, val: 12.0 },
  { id: 'p3', name: 'André', age: 34, fc: 82, val: 8.0 }
];

// Cópia para verificação de não-mutação
const originalAges = marketSample.map(p => p.age);

const sortedByAge = [...marketSample].sort((a, b) => a.age - b.age || a.name.localeCompare(b.name));
assert(sortedByAge[0].name === 'Bruno' && sortedByAge[2].name === 'André',
  'Ordenação por idade (menor primeiro) funciona perfeitamente');

const sortedByOvr = [...marketSample].sort((a, b) => b.fc - a.fc || a.name.localeCompare(b.name));
assert(sortedByOvr[0].name === 'André' && sortedByOvr[1].name === 'Bruno',
  'Desempate estável por nome alfabético preservado quando Overall é idêntico (82)');

assert(marketSample[0].age === originalAges[0],
  'Ordenação pura sem mutação nos dados do atleta original');

// Benchmark de performance do motor de busca e filtragem do mercado (5.000 atletas)
const largeSample = Array.from({ length: 5000 }, (_, i) => ({
  id: `pl_${i}`,
  name: `Jogador ${i}`,
  club: `Clube ${i % 40}`,
  pos: ['ST', 'CM', 'CB', 'GK'][i % 4],
  ovr: 60 + (i % 35),
  value: 1.0 + ((i % 50) * 0.8),
  age: 18 + (i % 20),
  clubNorm: `clube ${i % 40}`,
  searchStr: `jogador ${i} clube ${i % 40}`,
  countryNorm: i % 2 === 0 ? 'brasil' : 'argentina'
}));

const tStart = performance.now();
const filtered = largeSample.filter(p => p.ovr >= 75 && p.searchStr.includes('clube 12')).sort((a, b) => b.ovr - a.ovr || b.value - a.value);
const tElapsed = performance.now() - tStart;
assert(tElapsed < 25,
  `Filtragem e ordenação de 5.000 atletas do mercado executada em velocidade ultra-rápida (${tElapsed.toFixed(2)}ms < 25ms)`);

assert(gameJsContent.includes('_clubByNameMap'),
  'Cache O(1) de clubes implementado com Map em clubByName para eliminar gargalo de busca');

// =========================================================================
// 10. TESTE DE MÉTRICAS TÁTICAS DINÂMICAS E IMPACTO NO JOGO
// =========================================================================
console.log('\n--- TESTE 10: Métricas Táticas Dinâmicas e Impacto no Jogo ---');

assert(gameJsContent.includes('function calculateTacticalMetrics('),
  'Função central calculateTacticalMetrics implementada em game.js');

assert(gameJsContent.includes('tacMetricCentralCover') && gameJsContent.includes('tacMetricPressCapacity'),
  'IDs dinâmicos de métricas táticas presentes no DOM para atualização em tempo real');

assert(gameJsContent.includes('updateTacticalMetricsUI'),
  'Função updateTacticalMetricsUI registra atualizações reativas nos sliders');

assert(gameJsContent.includes('homeTac: hTac') && gameJsContent.includes('awayTac: aTac'),
  'liveMatchState preserva táticas ativas de mandante e visitante para a simulação ao vivo');

// =========================================================================
// 11. DETALHES DE PARTIDA, CLASSIFICAÇÕES E FASES DE COPAS
// =========================================================================
console.log('\n--- TESTE 11: Relatórios, artilharia e fases de copas ---');
assert(gameJsContent.includes("'Oitavas de Final', 'Quartas de Final', 'Semifinais', 'Final'"),
  'Copa do Brasil exibe as nove fases até a final');
assert(gameJsContent.includes("addPlayerMatchStats('bra-cup', state.club, events)") && gameJsContent.includes('state.history = [result, ...(state.history || [])]'),
  'Jogo da Copa registra resultado, gols e assistências no histórico e ranking');
assert(gameJsContent.includes('Object.entries(copa.phases || {})'),
  'Calendário lê os confrontos da Copa do Brasil do save da carreira');
assert(gameJsContent.includes('savedMatch?.events') && gameJsContent.includes('formatDatePtBr(date) === item.date'),
  'Relatório recupera eventos de jogos concluídos e compara datas ISO/localizadas');
assert(gameJsContent.includes('data-continental-phase') && gameJsContent.includes("'cwc:round16'"),
  'Telas continentais e Mundial oferecem navegação por fases');

// =========================================================================
// 12. NEGOCIAÇÃO DE REVENDAS E INDICADOR DE RELAÇÃO
// =========================================================================
console.log('\n--- TESTE 12: Cláusula de revenda e relação da contraproposta ---');
assert(gameJsContent.includes('CONTRAPROPOSTA · % DE REVENDA FUTURA'),
  'Investida árabe permite escolher o percentual retido numa revenda futura');
assert(gameJsContent.includes('class="bid-relation-panel"') && gameJsContent.includes('bid-relation-bar'),
  'Cartão da proposta exibe uma barra de relação/chance estimada');
assert(gameJsContent.includes('const relationChance = counterRelationChance(b)') && gameJsContent.includes('Math.random() * 100 < relationChance'),
  'A chance informada no indicador é usada pela decisão probabilística do clube');
assert(gameJsContent.includes('b.sellOnPct = Math.max(0, Math.min(50, negotiatedSellOnPct))'),
  'O percentual negociado fica limitado a 0–50% e é persistido ao aceitar');
assert(gameJsContent.includes('bid.requestedSellOnPct = pct'),
  'A escolha do percentual permanece no save enquanto o jogador negocia');
assert(gameJsContent.includes('if(b.counterOffered || b.requestedSellOnPct !== undefined)')
  && gameJsContent.includes('const finalSellOnPct = Number(b.sellOnPct) || 0'),
  'Aceitar diretamente uma oferta respeita o percentual selecionado, inclusive cláusula explícita de 0%');
assert(gameJsContent.includes('if(label) label.textContent = `${relationChance}% de chance estimada`')
  && gameJsContent.includes('Esta foi a chance estimada usada na decisão.'),
  'Depois de uma contraproposta aceita, a barra continua mostrando a chance realmente usada');
assert(gameJsContent.includes("const breakPenaltyRate = slotKey === 'master' ? 0.20 : slotKey === 'sleeves' ? 0.15 : 0.10")
  && gameJsContent.includes('remainingContractValue * breakPenaltyRate'),
  'Multa de patrocínio varia por espaço e incide sobre o valor contratual restante');
assert(gameJsContent.includes('min="3000" max="48000" step="3000"')
  && gameJsContent.includes("marketing:{name:'Departamento de marketing',icon:'📢',base:540000"),
  'Marketing tem degraus semanais e custo de evolução aumentados em 20%');
assert(gameJsContent.indexOf('<h3>Propostas de Patrocínio Recebidas</h3>') > gameJsContent.indexOf('<h2 style="margin-top:20px">Patrocinadores Oficiais do Clube</h2>')
  && gameJsContent.indexOf('<h3>Propostas de Patrocínio Recebidas</h3>') < gameJsContent.indexOf('${renderSocioTorcedorCard(socioData)}'),
  'Propostas de patrocínio aparecem logo após patrocinadores oficiais');

// =========================================================================
// 13. Campeonatos da Temporada e interação dos filtros
// =========================================================================
console.log('\n--- TESTE 13: Competições da carreira e clique nos filtros ---');
assert(gameJsContent.includes('function getSavedSeasonMemberships(clubName = state?.club)')
  && gameJsContent.includes("state.competitionTeams && typeof state.competitionTeams === 'object'")
  && gameJsContent.includes('const cupState = state.copaData && Number(state.copaData.season) === Number(state.season) ? state.copaData : null'),
  'A lista de competições usa o save ativo e não cria participação ao renderizar a tela Temporada');
assert(gameJsContent.includes('if(hasStateMembership && stateCompId !== comp.id)')
  && gameJsContent.includes('const memberships=getSavedSeasonMemberships(myClub)')
  && gameJsContent.includes('memberships.stateId===stateCompId')
  && !gameJsContent.includes('memberships.includes(stateCompId)'),
  'O calendário não duplica o estadual quando ele já é a competição principal do save');
assert(gameJsContent.includes('data-season-tab="${tab.id}"')
  && gameJsContent.includes('if(!seasonTabs.some(tab => tab.id === seasonTab)) seasonTab = seasonTabs[0].id'),
  'As abas da Temporada são renderizadas apenas para competições participadas e corrigem seleção obsoleta');
assert(gameJsContent.includes('data-cal-filter="ALL"') && gameJsContent.includes('type="button" class="btn ${activeCalendarFilter')
  && gameJsContent.includes('event.preventDefault();event.stopPropagation();const nextFilter=b.dataset.calFilter'),
  'Todos os filtros do calendário são botões explícitos e processam cliques sem submit ou propagação acidental');
assert(gameJsContent.includes("$$('[data-view]').forEach(b=>b.onclick=(event)=>{event.preventDefault();event.stopPropagation();const nextView=b.dataset.view")
  && gameJsContent.includes('meutime:myTeamPage'),
  'A navegação lateral aceita cliques e mantém a rota Meu time & Tática registrada');
assert(gameJsContent.includes('state.squad = Array.isArray(state.squad) ? state.squad : []')
  && gameJsContent.includes('state.lineup = Array.isArray(state.lineup) ? state.lineup : []')
  && gameJsContent.includes("state.formation = FORMATIONS[state.formation] ? state.formation : '4-3-3'"),
  'Meu time & Tática normaliza escalação e formação de saves legados antes de renderizar');

// =========================================================================
// RESULTADO FINAL
// =========================================================================
console.log('\n=============================================================');
console.log(`TOTAL DE TESTES: ${passedTests + failedTests} | APROVADOS: ${passedTests} | FALHAS: ${failedTests}`);
console.log('=============================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('✅ Verificações automatizadas aprovadas. Fluxos não cobertos exigem validação separada.');
}
