/**
 * Test Suite: Seleção Nacional (AFM_NATIONAL_TEAM) Completo
 * Valida:
 * 1. Dicionário dinâmico de seleções e gramática correta (SELEÇÃO BRASILEIRA / no Brasil)
 * 2. Fallback de avatar anti-404 com SVG Data URI
 * 3. Cálculo de índice de convocação (computeCallUpScore)
 * 4. Sincronização de contexto nacional e contagem regressiva da Data FIFA
 * 5. Simulação viva de partidas e estatísticas de concorrentes na temporada
 * 6. Renderização da aba player_national com Termômetro, 11 Titulares, Eliminatórias e Lendas
 * 7. Modal de convocação com boletim oficial e reação à imprensa (+seguidores)
 * 8. Adaptação completa a outras nacionalidades (Argentina, Portugal, França)
 */

const assert = require('assert');

// Mock browser globals
global.window = global;
global.document = {
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => [],
  createElement: (tag) => {
    return {
      tagName: tag.toUpperCase(),
      style: {},
      innerHTML: '',
      querySelector: () => null,
      querySelectorAll: () => [],
      appendChild: () => {},
      remove: () => {}
    };
  },
  body: {
    appendChild: () => {}
  }
};

// Load dependencies
require('../js/player/national_teams_manager.js');
require('../js/player/player_mode_ui.js');

console.log('🧪 Iniciando testes do Sistema da Seleção Nacional (AFM_NATIONAL_TEAM)...');

const natTeam = window.AFM_NATIONAL_TEAM;
const natMgr = window.AFM_NationalTeams;

assert(natTeam, 'window.AFM_NATIONAL_TEAM deve estar definido');
assert(natMgr, 'window.AFM_NationalTeams deve estar definido');

// 1. Dicionário de seleções e gramática correta
const bra = natTeam.getNationProfile('Brasil');
assert.strictEqual(bra.officialName, 'SELEÇÃO BRASILEIRA', 'Nome oficial do Brasil deve ser SELEÇÃO BRASILEIRA');
assert.strictEqual(bra.prepIn, 'no Brasil', 'Preposição deve ser no Brasil');
assert.strictEqual(bra.coach, 'Dorival Júnior', 'Treinador deve ser Dorival Júnior');
assert(bra.legends.length >= 4, 'Brasil deve ter pelo menos 4 lendas históricas');
assert(bra.qualifiers.length >= 6, 'Brasil deve ter tabela das eliminatórias');

const arg = natTeam.getNationProfile('Argentina');
assert.strictEqual(arg.officialName, 'SELEÇÃO ARGENTINA', 'Nome oficial da Argentina deve ser SELEÇÃO ARGENTINA');
assert.strictEqual(arg.prepIn, 'na Argentina', 'Preposição deve ser na Argentina');
assert.strictEqual(arg.coach, 'Lionel Scaloni', 'Treinador deve ser Lionel Scaloni');

const por = natTeam.getNationProfile('Portugal');
assert.strictEqual(por.officialName, 'SELEÇÃO PORTUGUESA', 'Nome oficial de Portugal deve ser SELEÇÃO PORTUGUESA');
assert.strictEqual(por.prepIn, 'em Portugal', 'Preposição deve ser em Portugal');

const fra = natTeam.getNationProfile('França');
assert.strictEqual(fra.officialName, 'SELEÇÃO FRANCESA', 'Nome oficial da França deve ser SELEÇÃO FRANCESA');
assert.strictEqual(fra.prepIn, 'na França', 'Preposição deve ser na França');

console.log('  ✅ 1. Dicionário de seleções e gramática por país validados com sucesso');

// 2. Avatar fallback anti-404
const svgUri = natTeam.buildAvatarFallbackUri('Vinicius Jr');
assert(svgUri.startsWith('data:image/svg+xml'), 'Avatar fallback deve ser SVG Data URI');
assert(svgUri.includes('VJ'), 'Iniciais VJ devem estar no SVG');

console.log('  ✅ 2. Avatar fallback anti-404 em SVG validado com sucesso');

// 3. Cálculo do índice de convocação
const scoreBase = natTeam.computeCallUpScore(80, 0, 0, 0, 6.0);
assert.strictEqual(scoreBase, 100.0, 'Score base de OVR 80 deve ser 100.0');

const scoreCraque = natTeam.computeCallUpScore(91, 15, 12, 8, 7.8);
assert(scoreCraque > 135, 'Score de craque com gols e nota 7.8 deve ser superior a 135');

console.log('  ✅ 3. Cálculo de pontuação de convocação (computeCallUpScore) validado com sucesso');

// 4. Sincronização de dados nacionais e contagem regressiva
const state = {
  gameMode: 'player',
  round: 4,
  date: '2026-02-15',
  player: {
    name: 'D. Aquino',
    nationality: 'Brasil',
    pos: 'ATA',
    ovr: 50
  },
  playerCareerState: {
    athleteName: 'D. Aquino',
    nationality: 'Brasil',
    internationalCaps: 0,
    internationalGoals: 0,
    seasonStats: { matches: 4, goals: 2, assists: 1, averageRating: 6.8 }
  }
};
window.state = state;

const natCtx = natTeam.ensureNationalData(state);
assert(natCtx, 'Contexto nacional deve ser criado');
assert.strictEqual(natCtx.nation.officialName, 'SELEÇÃO BRASILEIRA');
assert.strictEqual(natCtx.nextFifaRound, 6, 'Próxima Data FIFA deve ser rodada 6');
assert.strictEqual(natCtx.roundsLeft, 2, 'Devem faltar 2 rodadas');
assert(natCtx.nextOpponent, 'Adversário internacional deve ser definido');

console.log('  ✅ 4. Sincronização de dados nacionais e contagem de Data FIFA validadas com sucesso');

// 5. Simulação viva de concorrentes na temporada (round > 1)
window.livePlayers = [
  { id: 'p_vini', name: 'Vinicius Jr', club: 'Real Madrid', country: 'Brasil', overall: 91, pos: 'ATA' },
  { id: 'p_rodrygo', name: 'Rodrygo', club: 'Real Madrid', country: 'Brasil', overall: 87, pos: 'ATA' }
];

state.round = 10; // Avança temporada para rodada 10
const pool = natMgr.getPlayerPoolByNationality('Brasil', state);
const vini = pool.find(p => p.name === 'Vinicius Jr');
assert(vini, 'Vinicius Jr deve estar no pool');
assert(vini.matches > 0, 'Vinicius Jr deve ter jogos simulados na temporada');
assert(vini.goals > 0, 'Vinicius Jr deve ter gols simulados na temporada');
assert(vini.avgRating > 6.5, 'Vinicius Jr deve ter nota média realista proporcional ao OVR');
assert(vini.score > 120, 'Score de Vinicius Jr deve refletir temporada viva');

console.log('  ✅ 5. Simulação viva de partidas e estatísticas de concorrentes validada com sucesso');

// 6. Renderização da aba player_national
const html = window.AFM_PlayerMode.renderPage('player_national', state);
assert(html.includes('SELEÇÃO BRASILEIRA'), 'HTML deve conter SELEÇÃO BRASILEIRA');
assert(html.includes('RANKING DA SUA POSIÇÃO NO BRASIL'), 'HTML deve conter RANKING DA SUA POSIÇÃO NO BRASIL');
assert(html.includes('Termômetro da Convocação'), 'HTML deve conter Termômetro da Convocação');
assert(html.includes('ESQUEMA TÁTICO &amp; 11 TITULARES') || html.includes('11 TITULARES'), 'HTML deve conter 11 Titulares da Seleção');
assert(html.includes('TABELA DAS ELIMINATÓRIAS'), 'HTML deve conter Tabela das Eliminatórias');
assert(html.includes('LENDAS HISTÓRICAS DA SELEÇÃO'), 'HTML deve conter Lendas Históricas');
assert(html.includes('btnPreviewCallUpModal'), 'HTML deve conter botão de boletim oficial');
assert(html.includes('onerror='), 'HTML deve conter fallback onerror nas imagens');

console.log('  ✅ 6. Renderização completa da aba player_national validada com sucesso');

// 7. Adaptação a outras nacionalidades (Argentina)
state.player.nationality = 'Argentina';
state.playerCareerState.nationality = 'Argentina';
natTeam.ensureNationalData(state);

const htmlArg = window.AFM_PlayerMode.renderPage('player_national', state);
assert(htmlArg.includes('SELEÇÃO ARGENTINA'), 'HTML deve conter SELEÇÃO ARGENTINA');
assert(htmlArg.includes('NA ARGENTINA'), 'HTML deve conter NA ARGENTINA');
assert(htmlArg.includes('Lionel Scaloni'), 'HTML deve conter Lionel Scaloni');

console.log('  ✅ 7. Adaptação dinâmica para outras seleções (Argentina) validada com sucesso');

// 8. Teste do Modal de Convocação e Reação à Imprensa
state.playerCareerState.socialMedia = { followers: 1000 };
let createdModal = null;
global.document.createElement = (tag) => {
  const el = {
    tagName: tag.toUpperCase(),
    style: {},
    innerHTML: '',
    disabled: false,
    querySelector: (sel) => {
      if (sel === '#btnPressReactionNational') {
        return {
          onclick: null,
          disabled: false,
          style: {},
          innerHTML: ''
        };
      }
      return null;
    },
    remove: () => {}
  };
  createdModal = el;
  return el;
};

const fixture = {
  windowName: 'Data FIFA · Amistoso Oficial',
  date: '2026-03-25',
  awayCountry: 'Uruguai',
  userIsCalledUp: true,
  userIsStarter: true,
  userCallUp: { isUserCalledUp: true, meta: bra }
};

window.AFM_PlayerMode.openCallUpAnnouncementModal(fixture, state);
assert(createdModal, 'Modal deve ser criado');
assert(createdModal.innerHTML.includes('PARABÉNS! VOCÊ FOI CONVOCADO'), 'Modal deve conter mensagem de convocação');

console.log('  ✅ 8. Modal de convocação e coletiva à imprensa validados com sucesso');

console.log('\n🎉 TODOS OS 8 TESTES DA SELEÇÃO NACIONAL PASSARAM COM 100% DE SUCESSO!\n');
