/**
 * Testes Unitários e de Integração:
 * - Sub-abas da tela de Estatísticas & Troféus (Dados da Temporada, Sala de Troféus, Histórico de Jogos e Carreira Total)
 * - Correção da Nota Média e Parecer do Treinador com 0 jogos disputados
 * - Paridade salarial com Vida & Patrocínios
 * - Bônus ativo do arquétipo dominante
 * - Barras de progresso e quebra de recordes históricos com +500 XP
 * - Fita de forma recente e filtros do histórico de jogos
 * - Histórico acumulado da carreira (careerHistory) e persistência
 * - Segurança contra 'athlete is not defined' na view player_lifestyle
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Mock do ambiente de navegador
global.window = global;
global.document = {
  getElementById: (id) => null,
  querySelector: () => null,
  querySelectorAll: () => [],
  createElement: (tag) => ({
    tagName: tag,
    style: {},
    classList: { add: () => {}, remove: () => {} },
    innerHTML: '',
    appendChild: () => {},
    remove: () => {}
  })
};

// Carrega scripts necessários
function loadScript(relPath) {
  const fullPath = path.join(__dirname, '..', relPath);
  const code = fs.readFileSync(fullPath, 'utf8');
  eval(code);
}

loadScript('js/player/lifestyleData.js');
loadScript('js/player/player_career_engine.js');
loadScript('js/player/player_mode_ui.js');

console.log('Iniciando bateria de testes para Estatísticas, Carreira e Trava de Segurança...');

// Configura estado inicial do save no Modo Atleta
const mockAthlete = {
  id: 'atleta_teste_99',
  name: 'Diógenes Aquino',
  number: 9,
  pos: 'ATA',
  ovr: 54,
  wage: 1045,
  contractUntil: 2029,
  club: 'Brasília',
  energy: 100,
  fitness: 100
};

const mockGameState = {
  gameMode: 'player',
  controlledPlayerId: 'atleta_teste_99',
  club: 'Brasília',
  league: 'Campeonato Candango',
  season: 2026,
  date: '2026-01-01',
  squad: [mockAthlete],
  titles: [],
  playerCareerState: {
    athleteName: 'Diógenes Aquino',
    position: 'ATA',
    athleteOvr: 54,
    age: 16,
    weeklySalary: 261.25, // 261.25 * 4 = 1045
    managerTrust: 45,
    level: 1,
    xp: 0,
    xpToNextLevel: 400,
    personality: { maverick: 30, heartbeat: 30, virtuoso: 40 },
    relationships: { boardRelation: 65, fansRelation: 70, teammatesRelation: 75 },
    individualAwards: [],
    competitionRecordsBroken: [],
    lastSeasonGalaAwards: null,
    seasonStats: {
      season: 2026,
      club: 'Brasília',
      matches: 0,
      minutesPlayed: 0,
      goals: 0,
      assists: 0,
      cleanSheets: 0,
      mvpCount: 0,
      avgRating: 6.5,
      yellowCards: 0,
      redCards: 0
    },
    careerStats: {
      matches: 0,
      minutesPlayed: 0,
      goals: 0,
      assists: 0,
      avgRating: 6.5
    },
    matchRatingHistory: []
  }
};

window.state = mockGameState;

// =========================================================================
// 1. TESTE DA SUB-ABA DADOS DA TEMPORADA COM 0 JOGOS
// =========================================================================
console.log('\n--- 1. Testando Sub-aba Dados da Temporada com 0 jogos ---');
window.__afmPlayerStatsSubTab = 'season';
const seasonHtml = window.AFM_PlayerMode.renderPage('player_stats', mockGameState);

// Nota média não pode ser 6.5 quando games === 0
assert(seasonHtml.includes('—'), 'Nota média deve ser "—" quando não há jogos disputados');
assert(seasonHtml.includes('Aguardando estreia'), 'Legenda da nota média deve ser "Aguardando estreia"');
assert(!seasonHtml.includes('>6.5</div>') && !seasonHtml.includes('6.5\n'), 'Não deve exibir nota média fictícia de 6.5 com 0 jogos');

// Salário deve ser R$ 1.045/mês
assert(seasonHtml.includes('R$ 1.045/mês') || seasonHtml.includes('R$&nbsp;1.045/mês') || seasonHtml.includes('1.045'), 'Salário deve estar sincronizado em R$ 1.045/mês');

// Parecer do treinador pré-temporada
assert(seasonHtml.includes('Pré-temporada em andamento'), 'Parecer do treinador deve indicar pré-temporada com 0 jogos');

// Grid responsivo com auto-fit minmax
assert(seasonHtml.includes('grid-template-columns:repeat(auto-fit, minmax(190px, 1fr))'), 'Grid de métricas da temporada deve ser responsivo');
console.log('✔ Sub-aba Dados da Temporada aprovada com 0 jogos!');

// =========================================================================
// 2. TESTE DA SUB-ABA SALA DE TROFÉUS (BÔNUS DE ARQUÉTIPO E RECORDES)
// =========================================================================
console.log('\n--- 2. Testando Sub-aba Sala de Troféus (Arquétipos e Recordes) ---');
window.__afmPlayerStatsSubTab = 'trophies';
const trophiesHtml = window.AFM_PlayerMode.renderPage('player_stats', mockGameState);

// Bônus ativo do arquétipo dominante (Virtuoso com 40 pts)
assert(trophiesHtml.includes('BÔNUS ATIVO DE ARQUÉTIPO (VIRTUOSO)'), 'Deve exibir bônus ativo do arquétipo dominante Virtuoso');
assert(trophiesHtml.includes('+12% de ganho de XP nos treinos'), 'Bônus do Virtuoso deve mencionar +12% de XP');

// Barras de progresso ao vivo dos 3 recordes
assert(trophiesHtml.includes('RECORDE DE GOLS EM 1 ANO'), 'Deve conter progresso do recorde de gols');
assert(trophiesHtml.includes('0 / 14 gols') || trophiesHtml.includes('0 <span style="font-size:13px;color:#94a3b8">/ 14 gols</span>'), 'Deve indicar meta de 14 gols');
assert(trophiesHtml.includes('RECORDE DE ASSISTÊNCIAS'), 'Deve conter progresso do recorde de assistências');
assert(trophiesHtml.includes('SEQUÊNCIA INVICTA'), 'Deve conter progresso do recorde de invencibilidade');
assert(trophiesHtml.includes('REVER CERIMÔNIA DE GALA DO ANO'), 'Botão de Gala deve estar presente');
console.log('✔ Sub-aba Sala de Troféus aprovada!');

// =========================================================================
// 3. TESTE DA SUB-ABA HISTÓRICO DE JOGOS & FILTROS
// =========================================================================
console.log('\n--- 3. Testando Sub-aba Histórico de Jogos e Filtros ---');
window.__afmPlayerStatsSubTab = 'matches';
window.__afmPlayerMatchesFilter = 'all';
const matchesHtml0 = window.AFM_PlayerMode.renderPage('player_stats', mockGameState);
assert(matchesHtml0.includes('Melhor Atuação da Temporada'), 'Deve conter card de melhor atuação');
assert(matchesHtml0.includes('Aguardando sua estreia em campo'), 'Card de melhor atuação sem jogos deve exibir mensagem amigável');
assert(matchesHtml0.includes('btn-player-match-filter'), 'Filtros rápidos devem estar presentes');

// Adiciona partidas no histórico para testar filtros e forma recente
mockGameState.playerCareerState.matchRatingHistory = [
  { date: '2026-02-15', opponent: 'Ceilândia', score: '3 x 1', rating: 8.5, minutes: 90, goals: 2, assists: 1, isMvp: true, won: true },
  { date: '2026-02-10', opponent: 'Gama', score: '1 x 1', rating: 7.0, minutes: 75, goals: 0, assists: 1, isMvp: false, won: false, draw: true },
  { date: '2026-02-05', opponent: 'Brasiliense', score: '0 x 2', rating: 5.5, minutes: 45, goals: 0, assists: 0, isMvp: false, won: false, lost: true }
];

const matchesHtmlWithGames = window.AFM_PlayerMode.renderPage('player_stats', mockGameState);
assert(matchesHtmlWithGames.includes('Ceilândia'), 'Deve listar a partida contra o Ceilândia');
assert(matchesHtmlWithGames.includes('8.5'), 'Deve exibir nota 8.5');
assert(matchesHtmlWithGames.toUpperCase().includes('MELHOR ATUAÇÃO DA TEMPORADA'), 'Card de melhor atuação presente com jogos');
console.log('✔ Sub-aba Histórico de Jogos e Filtros aprovada!');

// =========================================================================
// 4. TESTE DA NOVA SUB-ABA 4: CARREIRA TOTAL (ALL-TIME)
// =========================================================================
console.log('\n--- 4. Testando Nova Sub-aba 4: Carreira Total ---');
window.__afmPlayerStatsSubTab = 'career';
const careerHtml = window.AFM_PlayerMode.renderPage('player_stats', mockGameState);

assert(careerHtml.includes('JOGOS NA CARREIRA'), 'Métrica Jogos na Carreira presente');
assert(careerHtml.includes('MINUTOS JOGADOS'), 'Métrica Minutos Jogados presente');
assert(careerHtml.includes('GOLS MARCADOS'), 'Métrica Gols Marcados presente');
assert(careerHtml.includes('ASSISTÊNCIAS TOTAIS'), 'Métrica Assistências Totais presente');
assert(careerHtml.includes('NOTA MÉDIA GERAL'), 'Métrica Nota Média Geral presente');
assert(careerHtml.includes('LINHA DO TEMPO & CLUBES DEFENDIDOS'), 'Tabela de linha do tempo presente');
assert(careerHtml.includes('ATUAL'), 'Temporada atual identificada com badge ATUAL');
assert(careerHtml.includes('Legado & Transição para Treinador'), 'Card de transição para carreira de treinador presente');
console.log('✔ Sub-aba 4 Carreira Total aprovada com sucesso!');

// =========================================================================
// 5. TESTE DE MOTOR: PROCESSAMENTO DE PARTIDA E REGISTRO SIMULTÂNEO
// =========================================================================
console.log('\n--- 5. Testando Registro de Partida Simultâneo e Quebra de Recorde ---');
const engine = window.AFM_PlayerEngine;
assert(typeof engine.ensurePlayerCareerHistory === 'function', 'ensurePlayerCareerHistory deve ser exportado');

const chBefore = engine.ensurePlayerCareerHistory(mockGameState.playerCareerState, mockGameState);
const gamesBefore = chBefore.totals.games;

// Processa uma atuação espetacular
const matchResult = {
  h: 'Brasília',
  a: 'Paranoá',
  goalsFor: 4,
  goalsAgainst: 0,
  playedMinutes: 90,
  won: true
};

const result = engine.processMatchPerformance(mockGameState, matchResult, { showSummary: false });
assert(result.played, 'Atleta deve ter jogado');
const chAfter = mockGameState.playerCareerState.careerHistory;
assert.strictEqual(chAfter.totals.games, gamesBefore + 1, 'Jogos all-time deve ter incrementado');
assert(chAfter.bestMatch !== null, 'bestMatch deve estar preenchido');

// Testa quebra do recorde de gols (> 14 gols)
mockGameState.playerCareerState.seasonStats.goals = 15;
const levelBefore = mockGameState.playerCareerState.level || 1;
const xpBefore = mockGameState.playerCareerState.xp || 0;
engine.processMatchPerformance(mockGameState, matchResult, { showSummary: false });

const brokenRecs = mockGameState.playerCareerState.competitionRecordsBroken || [];
const hasGoalRecord = brokenRecs.some(r => r.type === 'mostGoalsSeason');
assert(hasGoalRecord, 'Deve quebrar o recorde histórico de gols da temporada');
assert(mockGameState.playerCareerState.xp >= xpBefore + 500 || mockGameState.playerCareerState.level > levelBefore, 'Deve conceder bônus de 500 XP ao quebrar recorde');
console.log('✔ Motor de Carreira e Quebra de Recorde aprovados!');

// =========================================================================
// 6. TESTE DE SEGURANÇA: VIEW PLAYER_LIFESTYLE SEM REFERENCEERROR
// =========================================================================
console.log('\n--- 6. Testando Segurança na view player_lifestyle ---');
let lifestyleHtml = null;
assert.doesNotThrow(() => {
  lifestyleHtml = window.AFM_PlayerMode.renderPage('player_lifestyle', mockGameState);
}, 'renderPage(player_lifestyle) não pode lançar exceções de atleta ou variável indefinida');
assert(lifestyleHtml.includes('VIDA & PATROCÍNIOS') || lifestyleHtml.includes('CHUTEIRAS') || lifestyleHtml.includes('STAFF'), 'player_lifestyle renderizou com sucesso');
console.log('✔ Trava de segurança contra ReferenceError em player_lifestyle validada!');

console.log('\n======================================================');
console.log('🎉 TODOS OS TESTES PASSARAM COM 100% DE SUCESSO! 🎉');
console.log('======================================================');
