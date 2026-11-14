const assert = require('assert');
const fs = require('fs');

console.log('🧪 Iniciando teste de Avanço de Calendário Multi-Dias (>30 dias) e Limites de Coleção...');

// Carrega o módulo CalendarAndDayFix
const calendarFixCode = fs.readFileSync('js/core/calendar_and_day_advance_fix.js', 'utf8');

let saveCallCount = 0;
let renderCallCount = 0;
let dayAdvanceModalConfig = null;

const windowMock = {
  GameState: null,
  addEventListener: () => {},
  document: {
    addEventListener: () => {},
    getElementById: () => null,
    querySelectorAll: () => []
  },
  save: () => {
    saveCallCount++;
  },
  render: () => {
    renderCallCount++;
  },
  AFM_DayAdvanceNews: {
    formatHeadingDate: (d) => d.toISOString(),
    generateNewsForDay: (date, st, isMatch, fixture) => {
      // Simula notícias geradas por dia
      return [
        { type: 'deal', text: 'Transferência gerada em ' + date.toISOString() },
        { type: 'discipline', text: 'Cartão amarelo gerado' }
      ];
    },
    openDayAdvanceModal: (cfg) => {
      dayAdvanceModalConfig = cfg;
    }
  },
  AFM_WorldSimulation: {
    simulateWorldStepOnDayAdvance: (st, iso) => {}
  },
  AFM_PlayerEngine: {
    processWeeklyTraining: (st) => {},
    processMonthlyAttributeTraining: (st, m) => {},
    processMonthlyPlayerFinances: (st) => {},
    processDailySponsorTurn: (st) => {}
  }
};

const fn = new Function('window', 'document', calendarFixCode);
fn(windowMock, windowMock.document);

const CalendarFix = windowMock.AFM_CalendarFix;
assert.ok(CalendarFix, 'CalendarAndDayFix deve ser exportado');

// Cria estado inicial com notícias já acumuladas (e.g. 45 notícias)
const state = {
  gameMode: 'player',
  club: 'Real Brasília',
  date: '2026-01-01',
  currentDate: '2026-01-01',
  news: Array.from({ length: 45 }, (_, i) => `Notícia antiga ${i + 1}`),
  marketWorldFeed: Array.from({ length: 28 }, (_, i) => ({ id: i })),
  seasonHistory: Array.from({ length: 15 }, (_, i) => ({ year: 2020 + i })),
  playerCareerState: {
    socialMedia: {
      feedPosts: Array.from({ length: 22 }, (_, i) => ({ id: i }))
    }
  }
};

windowMock.GameState = state;
windowMock.state = state;

// Simula injeção massiva de notícias durante avanço (adiciona +30 notícias antes da verificação)
for (let i = 0; i < 30; i++) {
  state.news.unshift(`Notícia nova ${i + 1}`);
}
assert.ok(state.news.length > 50, 'Array de notícias simulado deve ter ultrapassado 50 antes do corte');

// Executa avanço de 35 dias com exibição de modal (salto longo > 30 dias em um único clique)
saveCallCount = 0;
const res = CalendarFix.advanceDaysGuaranteed(state, 35, true);

// 1. Verificação da data
assert.strictEqual(state.date, '2026-02-05', 'Data deve ter avançado exatamente 35 dias (01/01 -> 05/02)');

// 2. Verificação do limite estrito de state.news <= 50 (AGENTS.md Seção 2)
assert.ok(state.news.length <= 50, `state.news deve ter no máximo 50 itens, mas tem ${state.news.length}`);
console.log(`✓ Limite de state.news respeitado estritamente: ${state.news.length}/50 itens`);

// 3. Verificação de outros limites de coleção (AGENTS.md Seção 2)
assert.ok(state.marketWorldFeed.length <= 30, `state.marketWorldFeed deve ter máx 30 itens, tem ${state.marketWorldFeed.length}`);
assert.ok(state.seasonHistory.length <= 20, `state.seasonHistory deve ter máx 20 itens, tem ${state.seasonHistory.length}`);
assert.ok(state.playerCareerState.socialMedia.feedPosts.length <= 25, `feedPosts deve ter máx 25 itens, tem ${state.playerCareerState.socialMedia.feedPosts.length}`);
console.log('✓ Limites de coleções (marketWorldFeed <= 30, seasonHistory <= 20, feedPosts <= 25) 100% verificados');

// 4. Verificação de saves periódicos / checkpoints
assert.ok(saveCallCount >= 2, `Save deve ter sido chamado pelo menos 2 vezes (checkpoint intermediário + save final), chamou ${saveCallCount}`);
console.log(`✓ Checkpoint de save executado com sucesso: ${saveCallCount} chamadas de save() durante o avanço`);

// 5. Verificação da limitação da lista de dias no modal (evita travar DOM)
assert.ok(dayAdvanceModalConfig, 'Modal de avanço de dia deve ter sido configurado');
assert.strictEqual(dayAdvanceModalConfig.totalDays, 35, 'totalDays no modal deve reportar 35 dias');
assert.ok(dayAdvanceModalConfig.daysList.length <= 14, `daysList renderizado no modal deve ser limitado a <= 14 dias para evitar travamento, tem ${dayAdvanceModalConfig.daysList.length}`);
console.log(`✓ Modal de avanço seguro: renderizou os últimos ${dayAdvanceModalConfig.daysList.length} dias de notícias em vez de 35 blocos pesados`);

console.log('\n======================================================');
console.log('🎉 TODOS OS TESTES DE AVANÇO DE CALENDÁRIO PASSARAM COM 100% DE SUCESSO!');
console.log('======================================================');
