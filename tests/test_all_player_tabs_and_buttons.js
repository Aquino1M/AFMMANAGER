// Teste automatizado de todas as abas e botões do Modo Carreira Jogador (Be a Pro)
const assert = require('assert');

global.window = global;

const elementRegistry = [];
function makeEl(tag, cls = '', id = '', dataset = {}) {
  const el = {
    tagName: tag.toUpperCase(),
    className: cls,
    id: id,
    dataset: dataset,
    classList: {
      contains: (c) => cls.split(' ').includes(c),
      add: (c) => {},
      remove: (c) => {},
      toggle: (c) => {}
    },
    style: {},
    children: [],
    appendChild: (c) => el.children.push(c),
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: (evt, fn) => { el['on' + evt] = fn; },
    remove: () => {},
    focus: () => {}
  };
  elementRegistry.push(el);
  return el;
}

global.document = {
  querySelectorAll: (selector) => {
    if(selector.startsWith('.')) {
      const cls = selector.slice(1).split(',')[0].trim().replace('.', '');
      return elementRegistry.filter(e => e.className.includes(cls));
    }
    return [];
  },
  querySelector: (selector) => {
    if(selector.startsWith('.')) {
      const cls = selector.slice(1).replace('.', '');
      return elementRegistry.find(e => e.className.includes(cls)) || null;
    }
    if(selector.startsWith('#')) {
      const id = selector.slice(1);
      return elementRegistry.find(e => e.id === id) || null;
    }
    return null;
  },
  getElementById: (id) => elementRegistry.find(e => e.id === id) || null,
  createElement: (tag) => makeEl(tag),
  addEventListener: () => {},
  body: { appendChild: () => {} }
};
global.addEventListener = () => {};

require('../js/player/player_career_engine.js');
require('../js/player/social_media_manager.js');
require('../js/player/national_teams_manager.js');
require('../js/player/player_mode_ui.js');
require('../js/core/calendar_and_day_advance_fix.js');

console.log('=== TESTE DE TODAS AS ABAS E BOTÕES DO MODO JOGADOR ===\n');

const state = {
  gameMode: 'player',
  controlledPlayerId: 'p1',
  club: 'Real Brasília',
  competition: 'Campeonato Candango',
  date: '2026-01-01',
  season: 2026,
  round: 0,
  squad: [
    {
      id: 'p1',
      name: 'Diógenes Aquino',
      number: 9,
      pos: 'ST',
      ovr: 40,
      overall: 40,
      age: 15,
      wage: 1007,
      attributes: { vel: 34, chu: 45, pas: 29, dri: 34, def: 25, fis: 33 }
    }
  ],
  playerCareerState: {
    athleteName: 'Diógenes Aquino',
    shirtNumber: 9,
    age: 15,
    city: 'Brasília',
    stateUf: 'DF',
    nationality: 'Brasil',
    level: 1,
    xp: 0,
    xpToNextLevel: 400,
    skillPoints: 5,
    _startingPointsNormalized: true,
    managerTrust: 45,
    personalBank: 1007,
    weeklyTrainingFocus: 'finalizacao',
    lifestylePerks: {},
    luxuryItems: [],
    hiredStaff: {},
    agentOffers: [
      {
        id: 'off_1',
        type: 'sponsor',
        clubOrBrand: 'Incentivo Esportivo Regional de Base',
        title: 'Incentivo Esportivo Regional de Base',
        details: 'Fornecimento de chuteiras e bônus',
        monthly: 1000,
        bonusGoal: 500,
        bonusWin: 500,
        durationDays: 180,
        isRead: false
      }
    ],
    availableSponsorOffers: [
      { id: 'sp_test', name: 'Penalty Speed', brand: 'Penalty', monthlyStipend: 1500, durationDays: 180 }
    ]
  }
};
window.state = state;
window.save = () => {};
window.render = () => {};

// 1. Testar aba Vida & Patrocínios (Zero erro de athlete is not defined)
console.log('1. Testando aba Vida & Patrocínios...');
let lifestyleHtml = '';
assert.doesNotThrow(() => {
  lifestyleHtml = window.AFM_PlayerMode.renderPage('player_lifestyle');
}, 'Erro ao renderizar player_lifestyle');
assert(lifestyleHtml.includes('CONTA BANCÁRIA PESSOAL'), 'Aba de finanças do atleta presente');
assert(!lifestyleHtml.includes('athlete is not defined'), 'athlete is not defined corrigido');
console.log('✔ Aba Vida & Patrocínios renderizada com sucesso!');

// 2. Testar aba Seleção Nacional (Zero undefined no header e na tabela)
console.log('2. Testando aba Seleção Nacional...');
let natHtml = '';
assert.doesNotThrow(() => {
  natHtml = window.AFM_PlayerMode.renderPage('player_national');
}, 'Erro ao renderizar player_national');
assert(!natHtml.includes('undefined • undefined'), 'Header da confederação e federação corrigido');
assert(natHtml.includes('CONMEBOL') || natHtml.includes('CBF'), 'Confederação/Federação renderizada');
assert(!natHtml.includes('>undefined</td>'), 'Nenhum OVR undefined na tabela');
console.log('✔ Aba Seleção Nacional corrigida e sem campos undefined!');

// 3. Testar aba Hub Central
console.log('3. Testando aba Hub Central...');
const hubHtml = window.AFM_PlayerMode.renderPage('player_hub');
assert(hubHtml.includes('DIÓGENES AQUINO'), 'Nome do atleta presente');
assert(hubHtml.includes('CONFIANÇA DO TÉCNICO:'), 'Confiança presente');
console.log('✔ Aba Hub Central renderizada com sucesso!');

// 4. Testar aba Meu Atleta & Treino
console.log('4. Testando aba Meu Atleta & Treino...');
const evoHtml = window.AFM_PlayerMode.renderPage('player_evolution');
assert(evoHtml.includes('btn-upgrade-skill'), 'Botões de upgrade de atributos presentes');
assert(evoHtml.includes('card-training-option'), 'Opções de treino semanal presentes');
assert(evoHtml.includes('btn-practice-penalty'), 'Treinar pênaltis presente');
assert(evoHtml.includes('btn-practice-freekick'), 'Treinar faltas presente');
console.log('✔ Aba Meu Atleta & Treino renderizada com sucesso!');

// 5. Testar aba Clube & Elenco
console.log('5. Testando aba Clube & Elenco...');
const clubHtml = window.AFM_PlayerMode.renderPage('player_club');
assert(clubHtml.includes('HIERARQUIA NA POSIÇÃO'), 'Hierarquia presente');
assert(clubHtml.includes('ELENCO COMPLETO DO REAL BRASÍLIA'), 'Elenco presente');
console.log('✔ Aba Clube & Elenco renderizada com sucesso!');

// 6. Testar aba FootGram (Rede Social)
console.log('6. Testando aba FootGram (Rede Social)...');
const socialHtml = window.AFM_PlayerMode.renderPage('player_social');
assert(socialHtml.includes('btnPublishFootGramPost'), 'Botão PUBLICAR AGORA presente');
assert(socialHtml.includes('btn-social-cat-pill'), 'Categorias de post presentes');
console.log('✔ Aba FootGram renderizada com sucesso!');

// 7. Testar aba Empresário & Mercado
console.log('7. Testando aba Empresário & Mercado...');
const agentHtml = window.AFM_PlayerMode.renderPage('player_agent');
assert(agentHtml.includes('btn-agent-action'), 'Ações de empresário presentes');
assert(agentHtml.includes('btn-open-agent-modal'), 'Trocar empresário presente');
assert(agentHtml.includes('btn-accept-offer'), 'Aceitar proposta presente');
assert(agentHtml.includes('btn-reject-offer'), 'Recusar proposta presente');
console.log('✔ Aba Empresário & Mercado renderizada com sucesso!');

// 8. Testar aba Estatísticas & Troféus
console.log('8. Testando aba Estatísticas & Troféus...');
const statsHtml = window.AFM_PlayerMode.renderPage('player_stats');
assert(statsHtml.includes('btn-player-stats-subtab'), 'Sub-abas de estatísticas presentes');
assert(statsHtml.includes('Dados da Temporada'), 'Dados da temporada presentes');
console.log('✔ Aba Estatísticas & Troféus renderizada com sucesso!');

// 9. Testar Abas Compartilhadas (Retorno null para uso das páginas oficiais do jogo)
console.log('9. Testando Abas Compartilhadas...');
assert.strictEqual(window.AFM_PlayerMode.renderPage('calendario'), null, 'Calendário devolve controle para calendarPage');
assert.strictEqual(window.AFM_PlayerMode.renderPage('noticias'), null, 'Notícias devolve controle para newsMediaPage');
assert.strictEqual(window.AFM_PlayerMode.renderPage('temporada'), null, 'Temporada devolve controle para seasonPage');
assert.strictEqual(window.AFM_PlayerMode.renderPage('config'), null, 'Config devolve controle para configPage');
console.log('✔ Abas compartilhadas integradas com o motor oficial do jogo!');

// 10. Evolução mensal do foco e bônus de chuteira equipada
console.log('10. Testando evolução mensal e chuteira...');
const monthlyState = {
  gameMode: 'player',
  date: '2026-02-01',
  controlledPlayerId: 'monthly-player',
  squad: [{ id: 'monthly-player', name: 'Atleta de Teste', pos: 'ATA', attributes: { vel: 35, chu: 40, pas: 35, dri: 35, def: 35, fis: 35 } }],
  playerCareerState: { athleteName: 'Atleta de Teste', weeklyTrainingFocus: 'finalizacao' },
  news: []
};
const originalRandom = Math.random;
try {
  Math.random = () => 0.05;
  const monthlyUpgrade = window.AFM_PlayerEngine.processMonthlyAttributeTraining(monthlyState, '2026-02');
  assert.strictEqual(monthlyUpgrade.success, true, '10% monthly roll can improve selected focus');
  assert.strictEqual(monthlyState.squad[0].attributes.chu, 41, 'Finalization focus improves shooting by one');
  assert.strictEqual(window.AFM_PlayerEngine.processMonthlyAttributeTraining(monthlyState, '2026-02').reason, 'already_processed', 'Same month cannot reroll');

  const advanceState = {
    gameMode: 'player',
    date: '2026-01-31',
    controlledPlayerId: 'advance-player',
    squad: [{ id: 'advance-player', name: 'Atleta de Teste', pos: 'ATA', attributes: { vel: 35, chu: 40, pas: 35, dri: 35, def: 35, fis: 35 } }],
    playerCareerState: { athleteName: 'Atleta de Teste', weeklyTrainingFocus: 'finalizacao' },
    news: []
  };
  const engine = window.AFM_PlayerEngine;
  const weekly = engine.processWeeklyTraining;
  const finances = engine.processMonthlyPlayerFinances;
  const sponsors = engine.processDailySponsorTurn;
  engine.processWeeklyTraining = engine.processMonthlyPlayerFinances = engine.processDailySponsorTurn = () => {};
  window.AFM_CalendarFix.advanceDaysGuaranteed(advanceState, 1);
  assert.strictEqual(advanceState.date, '2026-02-01', 'Calendar advances into the next month');
  assert.strictEqual(advanceState.squad[0].attributes.chu, 41, 'Month rollover performs the monthly training roll');
  engine.processWeeklyTraining = weekly;
  engine.processMonthlyPlayerFinances = finances;
  engine.processDailySponsorTurn = sponsors;

  monthlyState.squad[0].attributes.chu = 99;
  assert.strictEqual(window.AFM_PlayerEngine.processMonthlyAttributeTraining(monthlyState, '2026-03').reason, 'attribute_capped', 'Attribute cap remains 99');

  const bootsState = {
    gameMode: 'player',
    controlledPlayerId: 'boot-player',
    squad: [{ id: 'boot-player', pos: 'ATA', attributes: { vel: 35, chu: 98, pas: 35, dri: 35, def: 35, fis: 35 } }],
    playerCareerState: { luxuryItems: ['luxury_boots'], luxuryBootsEquipped: true }
  };
  assert.strictEqual(window.AFM_PlayerEngine.getPlayerEffectiveAttributes(bootsState, bootsState.squad[0]).chu, 99, 'Equipped boots add two without exceeding 99');
  bootsState.playerCareerState.luxuryBootsEquipped = false;
  assert.strictEqual(window.AFM_PlayerEngine.getPlayerEffectiveAttributes(bootsState, bootsState.squad[0]).chu, 98, 'Unequipping restores base value');
  assert.strictEqual(bootsState.squad[0].attributes.chu, 98, 'Equipment never mutates base attribute');
} finally {
  Math.random = originalRandom;
}
console.log('✔ Evolução mensal protegida contra repetição e atributos limitados; chuteira aplica bônus apenas equipada!');

// 11. Testar acionamento de cliques em bindPlayerModeEvents
console.log('11. Testando acionamento funcional dos botões...');
const btnUp = makeEl('button', 'btn-upgrade-skill', '', { attr: 'vel' });
const btnDown = makeEl('button', 'btn-decrease-skill', '', { attr: 'vel' });
const btnConfirmSkills = makeEl('button', 'btn-confirm-skill-points');
const cardFoc = makeEl('div', 'card-training-option', '', { focus: 'drible' });
const btnCat = makeEl('button', 'btn-agent-category', '', { category: 'sponsor' });
const btnSub = makeEl('button', 'btn-player-stats-subtab', '', { subtab: 'trophies' });
const btnSocCat = makeEl('button', 'btn-social-cat-pill', '', { cat: 'fans' });
state.playerCareerState.luxuryItems = ['luxury_boots'];
state.playerCareerState.luxuryBootsEquipped = true;
state.squad[0].attributes.chu = 98;
const btnToggleBoots = makeEl('button', 'btn-toggle-lifestyle-equip', '', { itemId: 'luxury_boots' });

window.AFM_PlayerMode.bindPlayerModeEvents();

// Simula cliques
btnUp.onclick();
assert.strictEqual(state.playerCareerState.skillPoints, 5, 'Ponto só é consumido ao confirmar');
assert.strictEqual(state.playerCareerState.pendingAttributePoints.vel, 1, 'Atributo fica pendente antes da confirmação');
btnDown.onclick();
assert.strictEqual(state.playerCareerState.pendingAttributePoints.vel, undefined, 'Menos desfaz ponto pendente');
btnUp.onclick();
btnConfirmSkills.onclick();
assert.strictEqual(state.playerCareerState.skillPoints, 4, 'Skill point gasto');
assert.strictEqual(state.squad[0].attributes.vel, 35, 'Velocidade aumentada após confirmar');

cardFoc.onclick();
assert.strictEqual(state.playerCareerState.weeklyTrainingFocus, 'drible', 'Foco de treino alterado para drible');

btnCat.onclick();
assert.strictEqual(window.__afmAgentOfferCategory, 'sponsor', 'Categoria de propostas alterada');

btnSub.onclick();
assert.strictEqual(window.__afmPlayerStatsSubTab, 'trophies', 'Sub-aba de estatísticas alterada');

btnSocCat.onclick();
assert.strictEqual(window._afmSocialActiveCategory, 'fans', 'Categoria de rede social alterada');

btnToggleBoots.onclick();
assert.strictEqual(state.playerCareerState.luxuryBootsEquipped, false, 'Chuteiras podem ser desequipadas');
assert.strictEqual(window.AFM_PlayerEngine.getPlayerEffectiveAttributes(state, state.squad[0]).chu, 98, 'Bônus some ao desequipar');
btnToggleBoots.onclick();
assert.strictEqual(state.playerCareerState.luxuryBootsEquipped, true, 'Chuteiras podem ser equipadas novamente');
assert.strictEqual(window.AFM_PlayerEngine.getPlayerEffectiveAttributes(state, state.squad[0]).chu, 99, 'Bônus volta sem passar de 99');

console.log('✔ Todos os botões responderam aos cliques com sucesso!\n');
console.log('🎉 TODOS OS TESTES PASSARAM COM SUCESSO! 🎉');
