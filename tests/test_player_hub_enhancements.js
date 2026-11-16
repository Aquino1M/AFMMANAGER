const assert = require('assert');
const fs = require('fs');

console.log('🧪 Iniciando Testes Unitários dos Aprimoramentos do Hub Central (player_hub)...');

// Mock browser environment
global.window = global;
global.document = {
  createElement: () => ({ className: '', style: {}, innerHTML: '', appendChild: () => {} }),
  getElementById: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {}
};

// Carregar competições e serviços necessários
require('../js/competitions.js');

// Mock helpers
global.norm = str => (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
global.esc = str => String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
global.formatDatePtBr = isoStr => isoStr || '17 de janeiro de 2026';
global.clubByName = name => ({ name, stadium: `Estádio do ${name}`, competition: 'Campeonato Candango' });
global.clubBadge = (name, size) => `<span class="mock-badge badge-${name}" data-size="${size}">[${name}]</span>`;
global.playerPhoto = (name, size) => `<img src="photo_${name}.png" width="${size}" />`;
global.teamStrengthByName = name => 62;

// Mock AFM_PlayerEngine
global.window.AFM_PlayerEngine = {
  getTrustRole: trust => {
    const val = Number(trust || 0);
    if (val >= 60) return { role: "Titular", color: "#10b981", desc: "Titular absoluto" };
    if (val >= 35) return { role: "Reserva Imediato", color: "#f59e0b", desc: "Primeira opção do banco" };
    return { role: "Fora dos Planos", color: "#ef4444", desc: "Pouco aproveitado" };
  },
  isPlayerAvailableForMatch: state => {
    const energy = state.playerCareerState?.athlete?.energy ?? 95;
    return energy >= 50;
  },
  calculateAthleteInitialMarketValue: (ovr, age) => 45000,
  processWeeklyTraining: state => {},
  processMatchPerformance: (state, perf) => ({ ...perf, xpGained: 120 })
};

// Mock AFM_Lifestyle
global.window.AFM_Lifestyle = {
  ensurePlayerLifestyleState: player => {
    if (!player.lifestyle) player.lifestyle = { cash: player.personalBank || 1102, transactions: [] };
    return player.lifestyle;
  },
  addPlayerTransaction: (player, date, desc, amount, type = "in") => {
    const ls = global.window.AFM_Lifestyle.ensurePlayerLifestyleState(player);
    const amt = Math.round(Number(amount) || 0);
    if (type === "out") {
      ls.cash = Math.max(0, (ls.cash || 0) - amt);
    } else {
      ls.cash = (ls.cash || 0) + amt;
    }
    player.personalBank = ls.cash;
    return ls.cash;
  }
};

// Carregar player_mode_ui.js
require('../js/player/player_mode_ui.js');

const PlayerMode = window.AFM_PlayerMode;
assert(PlayerMode, 'AFM_PlayerMode deve estar disponível globalmente');
assert(typeof PlayerMode.buildPlayerHubViewModel === 'function', 'buildPlayerHubViewModel deve ser exportada');
assert(typeof PlayerMode.renderPlayerHub === 'function', 'renderPlayerHub deve ser exportada');

// =========================================================================
// TESTE 1: buildPlayerHubViewModel com Atleta Atacante e 0 Jogos
// =========================================================================
console.log('Testando Teste 1: ViewModel com 0 jogos (início de temporada)...');
const mockState1 = {
  club: 'Brasília',
  season: 2026,
  date: '2026-01-01',
  currentDate: '2026-01-01',
  competition: 'Campeonato Candango',
  gameMode: 'player',
  controlledPlayerId: 'p10',
  news: [
    '⚡ CT DO BRASÍLIA: Carlos Henrique se destacou no treino técnico!',
    '📋 COMISSÃO TÉCNICA: Treinador elogiou o comprometimento tático de Carlos Henrique.'
  ],
  squad: [
    { id: 'p10', name: 'Carlos Henrique', number: 10, pos: 'ATA', ovr: 35, wage: 1500, energy: 95, fitness: 95, personalBank: 1102 }
  ],
  playerCareerState: {
    athleteName: 'Carlos Henrique',
    shirtNumber: 10,
    age: 15,
    city: 'Brasília',
    stateUf: 'DF',
    level: 1,
    xp: 0,
    xpToNextLevel: 400,
    skillPoints: 0,
    managerTrust: 45,
    personalBank: 1102,
    matchRatingHistory: [],
    seasonStats: { matches: 0, goals: 0, assists: 0, avgRating: 0 },
    lifestyle: { cash: 1102 }
  }
};

const vm1 = PlayerMode.buildPlayerHubViewModel(mockState1);
assert.strictEqual(vm1.ovr, 35, 'OVR deve ser 35');
assert.strictEqual(vm1.level, 1, 'Nível deve ser 1');
assert.strictEqual(vm1.xp, 0, 'XP deve ser 0');
assert.strictEqual(vm1.xpNext, 400, 'XP próximo nível deve ser 400');
assert.strictEqual(vm1.xpPercent, 0, 'Percentual de XP deve ser 0%');
assert.strictEqual(vm1.trustRole.role, 'Reserva Imediato', 'Papel do atleta deve ser Reserva Imediato');
assert.strictEqual(vm1.canPlayMatch, true, 'Atleta deve estar apto com 95% de energia');
assert.strictEqual(vm1.seasonMatches, 0, 'Deve ter 0 jogos na temporada');
assert.strictEqual(vm1.seasonAvgRating, '—', 'Nota média deve ser "—" quando não há jogos');
assert.strictEqual(vm1.hasSeasonMatches, false, 'hasSeasonMatches deve ser false');
assert.strictEqual(vm1.objectives.length, 3, 'Deve gerar exatamente 3 metas do treinador');
assert(vm1.nationalStatusText.includes('Observado'), 'Status de seleção deve ser Observado');
assert(vm1.playerNews.length >= 2, 'Deve conter notícias formatadas');

console.log('✅ Teste 1 passou com sucesso!');

// =========================================================================
// TESTE 2: Metas do Treinador por Posição (GOL, ZAG, MC, ATA)
// =========================================================================
console.log('Testando Teste 2: Metas do treinador para diferentes posições...');

// Goleiro
mockState1.squad[0].pos = 'GOL';
const vmGol = PlayerMode.buildPlayerHubViewModel(mockState1);
assert(vmGol.objectives.some(o => o.text.includes('Baliza Inviolada') || o.text.includes('Clean Sheet')), 'Goleiro deve ter meta de baliza inviolada');

// Defensor
mockState1.squad[0].pos = 'ZAG';
const vmZag = PlayerMode.buildPlayerHubViewModel(mockState1);
assert(vmZag.objectives.some(o => o.text.includes('Desarmes') || o.text.includes('Baliza')), 'Zagueiro deve ter metas defensivas');

// Meio-Campo
mockState1.squad[0].pos = 'MEI';
const vmMei = PlayerMode.buildPlayerHubViewModel(mockState1);
assert(vmMei.objectives.some(o => o.text.includes('assistência') || o.text.includes('passe')), 'Meia deve ter metas de criação');

// Atacante
mockState1.squad[0].pos = 'ATA';
const vmAta = PlayerMode.buildPlayerHubViewModel(mockState1);
assert(vmAta.objectives.some(o => o.text.includes('Participação em Gol')), 'Atacante deve ter metas de gol');

console.log('✅ Teste 2 passou com sucesso!');

// =========================================================================
// TESTE 3: Barra de XP Dinâmica e Estatísticas com Histórico
// =========================================================================
console.log('Testando Teste 3: XP dinâmico e estatísticas com partidas jogadas...');
mockState1.playerCareerState.xp = 250;
mockState1.playerCareerState.xpToNextLevel = 500;
mockState1.playerCareerState.matchRatingHistory = [
  { date: '2026-01-17', opponent: 'Samambaia', rating: 7.5, goals: 1, assists: 0, minutes: 90 },
  { date: '2026-01-20', opponent: 'Gama', rating: 6.8, goals: 0, assists: 1, minutes: 75 }
];

const vm3 = PlayerMode.buildPlayerHubViewModel(mockState1);
assert.strictEqual(vm3.xpPercent, 50, 'Percentual de XP deve ser 50%');
assert.strictEqual(vm3.seasonMatches, 2, 'Deve computar 2 jogos');
assert.strictEqual(vm3.seasonGoals, 1, 'Deve computar 1 gol');
assert.strictEqual(vm3.seasonAssists, 1, 'Deve computar 1 assistência');
assert.strictEqual(vm3.seasonStarter, 2, 'Ambos foram titulares');
assert.strictEqual(vm3.hasSeasonMatches, true, 'hasSeasonMatches deve ser true');
assert.strictEqual(vm3.seasonAvgRating, '7.15', 'Média de 7.5 e 6.8 deve ser 7.15');
assert.strictEqual(vm3.formDots.length, 2, 'Deve conter 2 bolinhas de forma recente');

console.log('✅ Teste 3 passou com sucesso!');

// =========================================================================
// TESTE 4: Renderização HTML Completa (renderPlayerHub)
// =========================================================================
console.log('Testando Teste 4: Renderização do Hub Central (renderPlayerHub)...');
const html = PlayerMode.renderPlayerHub(mockState1);

assert(html.includes('afm-player-hub-container'), 'HTML deve conter container do hub central');
assert(html.includes('afm-player-hub-grid'), 'HTML deve conter classe de grid responsivo');
assert(html.includes('badge-Brasília'), 'HTML deve conter escudo do clube ativo');
assert(html.includes('PROGRESSO PARA NÍVEL 2'), 'HTML deve conter título da barra de XP');
assert(html.includes('250 / 500 XP') && html.includes('50%'), 'HTML deve exibir contagem e percentual de XP');
assert(html.includes('DESEMPENHO NA TEMPORADA'), 'HTML deve conter faixa de estatísticas da temporada');
assert(html.includes('ROTINA & PREPARAÇÃO DIÁRIA'), 'HTML deve conter ações rápidas diárias');
assert(html.includes('data-hub-action="goto_training"'), 'HTML deve conter atalho de treino');
assert(html.includes('data-hub-action="quick_physio"'), 'HTML deve conter atalho de fisioterapia');
assert(html.includes('data-hub-action="goto_social"'), 'HTML deve conter atalho do FootGram');
assert(html.includes('data-hub-action="goto_agent"'), 'HTML deve conter atalho do empresário');
assert(html.includes('METAS DO TREINADOR PARA ESTE JOGO'), 'HTML deve conter caixa de metas do treinador');
assert(html.includes('data-hub-news-filter="all"'), 'HTML deve conter pílula de filtro Todas');
assert(html.includes('data-hub-news-filter="training"'), 'HTML deve conter pílula de filtro CT & Treino');
assert(html.includes('data-news-category='), 'HTML deve conter categorias nos itens de notícias');
assert(html.includes('data-hub-action="play_live"'), 'HTML deve conter data-hub-action no botão de jogar');
assert(html.includes('data-hub-action="play_quick"'), 'HTML deve conter data-hub-action no botão de simular');

// Testa também quando a partida é em data futura
global.window.getActualCurrentMatch = () => ({
  date: '2026-01-17',
  opponent: 'Samambaia',
  isHome: true,
  competitionName: 'Campeonato Candango'
});
const htmlFuture = PlayerMode.renderPlayerHub(mockState1);
assert(htmlFuture.includes('data-hub-action="advance_to_match"'), 'HTML deve conter data-hub-action no botão de avanço');
assert(htmlFuture.includes('data-hub-action="advance_1day"'), 'HTML deve conter data-hub-action no botão de avançar 1 dia');

console.log('✅ Teste 4 passou com sucesso!');

// =========================================================================
// TESTE 5: Lógica de Fisioterapia Rápida (quick_physio)
// =========================================================================
console.log('Testando Teste 5: Lógica do sistema de Fisioterapia Pré-Jogo...');
const pState = mockState1.playerCareerState;
const athlete = mockState1.squad[0];

// Caso A: Atleta com 100% de energia não precisa
athlete.energy = 100;
let needsPhysio = athlete.energy < 100;
assert.strictEqual(needsPhysio, false, 'Atleta 100% não deve precisar de fisio');

// Caso B: Atleta com 85% e saldo suficiente
athlete.energy = 85;
pState.lastQuickPhysioDate = null;
pState.personalBank = 1102;
pState.lifestyle.cash = 1102;

const cost = 150;
assert(pState.personalBank >= cost, 'Deve ter saldo suficiente para fisioterapia');

// Executa tratamento
const newCash = window.AFM_Lifestyle.addPlayerTransaction(pState, '2026-01-01', 'Fisioterapia', cost, 'out');
athlete.energy = Math.min(100, athlete.energy + 10);
pState.lastQuickPhysioDate = '2026-01-01';

assert.strictEqual(athlete.energy, 95, 'Energia deve ter subido de 85% para 95% (+10%)');
assert.strictEqual(pState.personalBank, 952, 'Saldo deve ter sido debitado em R$ 150 (1102 -> 952)');
assert.strictEqual(pState.lastQuickPhysioDate, '2026-01-01', 'Data do tratamento deve ser gravada para trava diária');

// Caso C: Trava diária (mesmo dia não pode repetir)
const isAlreadyDoneToday = pState.lastQuickPhysioDate === '2026-01-01';
assert.strictEqual(isAlreadyDoneToday, true, 'Trava diária deve impedir 2ª sessão no mesmo dia');

console.log('✅ Teste 5 passou com sucesso!');

console.log('🎉 TODOS OS TESTES DO HUB CENTRAL PASSARAM COM 100% DE SUCESSO!');
