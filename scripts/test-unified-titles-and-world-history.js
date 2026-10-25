const fs = require('fs');
const path = require('path');
const vm = require('vm');

const gameJsSource = fs.readFileSync(path.resolve(__dirname, '../js/game.js'), 'utf8').replace(/\r\n/g, '\n');

// Monta contexto para testar AFM_TitlesAndHistoryService
const mockWindow = {
  addEventListener: () => {},
  REAL_CLUB_TROPHIES_DB: {}
};

const testContext = {
  window: mockWindow,
  state: null,
  document: {
    addEventListener: () => {},
    querySelector: () => null,
    querySelectorAll: () => []
  },
  MUSEUM_LEVELS: [
    { level: 1, name: 'Estante de Troféus', capacity: 2, cost: 50000 },
    { level: 2, name: 'Vitrine de Prata', capacity: 4, cost: 120000 }
  ],
  compById: id => {
    const names = {
      'bra-est-df': 'Campeonato Candango',
      'bra-d': 'Campeonato Brasileiro Série D',
      'bra-c': 'Campeonato Brasileiro Série C',
      'bra-b': 'Campeonato Brasileiro Série B',
      'bra-a': 'Campeonato Brasileiro Série A',
      'bra-cup': 'Copa do Brasil'
    };
    return { id, name: names[id] || id };
  },
  clubStateCompId: () => 'bra-est-df',
  norm: v => String(v || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
};

// Executa a definição de AFM_TitlesAndHistoryService e registerTrophyInMuseum
const serviceStart = gameJsSource.indexOf('function registerTrophyInMuseum(');
const serviceEnd = gameJsSource.indexOf('ABA NOT');
if(serviceStart < 0 || serviceEnd < 0) throw new Error('AFM_TitlesAndHistoryService não encontrado em js/game.js');

const serviceCode = gameJsSource.slice(serviceStart, serviceEnd);
vm.runInNewContext(serviceCode, testContext);

const service = testContext.window.AFM_TitlesAndHistoryService;
if (!service) throw new Error('AFM_TitlesAndHistoryService não foi anexado ao window!');

// 1. Testa classificação de movimentos de divisão (Estadual para Série D é sempre ACESSO)
if (service.getDivisionMovementLabel('bra-est-df', 'bra-d') !== 'Acesso') {
  throw new Error('Movimento de Candango (Estadual) para Série D deve ser Acesso, nunca Rebaixamento!');
}
if (service.getDivisionMovementLabel('bra-d', 'bra-c') !== 'Acesso') {
  throw new Error('Série D para C deve ser Acesso!');
}
if (service.getDivisionMovementLabel('bra-a', 'bra-b') !== 'Rebaixamento') {
  throw new Error('Série A para B deve ser Rebaixamento!');
}
if (service.getDivisionMovementLabel('bra-d', 'bra-est-df') !== 'Rebaixamento') {
  throw new Error('Série D para Estadual deve ser Rebaixamento!');
}

console.log('PASS: getDivisionMovementLabel classifica acessos e rebaixamentos corretamente.');

// 2. Testa reparação e sincronização das Temporadas 2026 e 2027 do usuário (AQN FC)
const testState = {
  club: 'AQN FC',
  season: 2028,
  compId: 'bra-d',
  customClub: { isCustom: true, name: 'AQN FC', shortName: 'AQF' },
  customClubStateCompId: 'bra-est-df',
  titles: [],
  museumData: { level: 1, skipOfferUsed: false },
  seasonHistory: [
    {
      season: 2027,
      compName: 'Campeonato Candango',
      champion: 'Brasiliense',
      runnerUp: 'AQN FC',
      userPosition: 2,
      userClub: 'AQN FC',
      titlesWon: [],
      balance: 0
    },
    {
      season: 2026,
      compName: 'Campeonato Candango',
      champion: 'Ceilândia',
      runnerUp: 'Brasiliense',
      userPosition: 10,
      userClub: 'AQN FC',
      titlesWon: [],
      balance: 39660
    }
  ],
  worldChampionHistory: [
    {
      season: 2027,
      userClub: 'AQN FC',
      competitions: [
        { id: 'bra-c', name: 'Campeonato Brasileiro Série C', champion: 'Caxias' },
        { id: 'bra-d', name: 'Campeonato Brasileiro Série D', champion: 'Brasiliense,Fluminense-PI,Maricá,União Rondonópolis' }
      ],
      achievements: [
        'Rebaixamento para Campeonato Brasileiro Série D'
      ],
      prizeMoney: 500000
    },
    {
      season: 2026,
      userClub: 'AQN FC',
      competitions: [
        { id: 'bra-est-df', name: 'Campeonato Candango', champion: 'ARUC' },
        { id: 'bra-cup', name: 'Copa do Brasil', champion: 'Palmeiras' },
        { id: 'afc-el', name: 'afc-el', champion: 'Vissel Kobe' },
        { id: 'afc2', name: 'afc2', champion: 'Sharjah FC' }
      ],
      achievements: [],
      prizeMoney: 100000
    }
  ]
};

// Executa a sincronização e reparação universal
service.syncAndRepairAll(testState);

// Verificações da Temporada 2027
const rec2027 = testState.worldChampionHistory.find(r => r.season === 2027);
if (!rec2027) throw new Error('Temporada 2027 não encontrada no worldChampionHistory');

const serieD = rec2027.competitions.find(c => c.id === 'bra-d');
if (!serieD || serieD.champion !== 'Brasiliense') {
  throw new Error(`Série D 2027 deve ter campeão limpo 'Brasiliense', recebeu: ${serieD?.champion}`);
}

if (rec2027.achievements.some(a => a.toLowerCase().includes('rebaixamento'))) {
  throw new Error('Conquistas de 2027 não devem conter "Rebaixamento" para Série D!');
}
if (!rec2027.achievements.some(a => a.includes('Acesso para Campeonato Brasileiro Série D'))) {
  throw new Error('Conquistas de 2027 devem conter "Acesso para Campeonato Brasileiro Série D"!');
}
if (!rec2027.achievements.some(a => a.includes('Vice-Campeão de Campeonato Candango'))) {
  throw new Error('Conquistas de 2027 devem conter "Vice-Campeão de Campeonato Candango"!');
}

const candango2027 = rec2027.competitions.find(c => c.id === 'bra-est-df' || c.name.includes('Candango'));
if (!candango2027 || candango2027.champion !== 'Brasiliense') {
  throw new Error(`Campeonato Candango 2027 deve ter campeão alinhado 'Brasiliense', recebeu: ${candango2027?.champion}`);
}

console.log('PASS: Temporada 2027 corrigida (Série D individual, Acesso restaurado e Vice-Campeonato registrado).');

// Verificações da Temporada 2026
const rec2026 = testState.worldChampionHistory.find(r => r.season === 2026);
if (!rec2026) throw new Error('Temporada 2026 não encontrada no worldChampionHistory');

const candango2026 = rec2026.competitions.find(c => c.id === 'bra-est-df' || c.name.includes('Candango'));
if (!candango2026 || candango2026.champion === 'ARUC') {
  throw new Error(`Campeonato Candango 2026 não deve ser ARUC! Recebeu: ${candango2026?.champion}`);
}

const afcEl = rec2026.competitions.find(c => c.id === 'afc-el');
if (!afcEl || afcEl.name !== 'AFC Champions League Elite') {
  throw new Error(`afc-el deve ser formatado como AFC Champions League Elite, recebeu: ${afcEl?.name}`);
}

const afc2 = rec2026.competitions.find(c => c.id === 'afc2');
if (!afc2 || afc2.name !== 'AFC Champions League Two') {
  throw new Error(`afc2 deve ser formatado como AFC Champions League Two, recebeu: ${afc2?.name}`);
}

console.log('PASS: Temporada 2026 corrigida (Candango alinhado com Hall da Fama e nomes AFC amigáveis).');

// 3. Verificações do Museu do Clube
const musData = service.getMuseumData(testState);
if (!musData.allTitles.some(t => t.includes('Campeonato Candango') && t.includes('2026'))) {
  throw new Error('Título do Candango 2026 deve constar no acervo do museu!');
}
if (!musData.inVitrine.some(t => t.includes('Campeonato Candango') && t.includes('2026'))) {
  throw new Error('Título do Candango 2026 deve estar na vitrine da estante do museu!');
}

const clubTitles = service.getClubTitles('AQN FC', testState);
if (!clubTitles.trophiesWonInSave.some(t => t.name === 'Campeonato Candango' && String(t.year).includes('2026'))) {
  throw new Error('getClubTitles deve retornar o troféu do Candango 2026 na galeria do treinador!');
}

console.log('PASS: Museu do Clube e galeria do treinador 100% integrados e sincronizados com o Hall da Fama.');
