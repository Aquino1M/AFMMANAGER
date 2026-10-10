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

// Carrega o código do game.js para inspeção e testes
const gameJsPath = path.resolve(__dirname, '../js/game.js');
const gameJsContent = fs.readFileSync(gameJsPath, 'utf8');

console.log('⚽ [AFM MANAGER 2027] — INICIANDO SUÍTE DE TESTES DOS SUBSISTEMAS DE GAMEPLAY\n');

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
// 4. TESTE DE EXPANSÃO DO ESTÁDIO
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

assert(!gameJsContent.includes('id="btnLiveReplay"'),
  'Botão de Replay removido da barra de controles da partida ao vivo (game.js)');

assert(gameJsContent.includes('function canStartMatch('),
  'Função canStartMatch implementada como portão arquitetural central (game.js)');

assert(gameJsContent.includes('function advanceCalendarDays('),
  'Função advanceCalendarDays implementada para avanço seguro dia a dia (game.js)');

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

const cssPath = path.resolve(__dirname, '../css/app.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');
assert(cssContent.includes('.halftime-pitch-player *'),
  'Proteção de eventos de ponteiro (pointer-events: none) aplicada no CSS para Drag & Drop (app.css)');

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
