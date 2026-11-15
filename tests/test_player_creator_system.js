/**
 * Testes Automatizados do Sistema Completo de Criação de Atleta (Modo Carreira Jogador)
 * Validação de window.AFM_CREATOR_CATALOG, Retratos Jovens (Anti-404), Etapas 1 a 6 e Boneco 3D
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Mock DOM Environment
function createMockElement(tag = 'div'){
  const el = {
    tagName: tag.toUpperCase(),
    style: {},
    classList: {
      _classes: new Set(),
      add(c){ this._classes.add(c); },
      remove(c){ this._classes.delete(c); },
      contains(c){ return this._classes.has(c); },
      toggle(c, v){ if(v === undefined) v = !this.contains(c); if(v) this.add(c); else this.remove(c); }
    },
    dataset: {},
    children: [],
    _innerHTML: '',
    get innerHTML(){ return this._innerHTML; },
    set innerHTML(html){
      this._innerHTML = html;
      this.children = [];
    },
    value: '',
    checked: false,
    _listeners: {},
    addEventListener(type, cb){
      if(!this._listeners[type]) this._listeners[type] = [];
      this._listeners[type].push(cb);
    },
    removeEventListener(type, cb){
      if(this._listeners[type]) this._listeners[type] = this._listeners[type].filter(fn => fn !== cb);
    },
    dispatchEvent(evt){
      const type = evt.type || evt;
      const list = this._listeners[type] || [];
      list.forEach(fn => fn(evt));
    },
    querySelector(sel){
      const all = this.querySelectorAll(sel);
      return all.length > 0 ? all[0] : null;
    },
    querySelectorAll(sel){
      const results = [];
      const search = (node) => {
        // Simple mock selector parser
        const matchClass = sel.match(/^\.([a-zA-Z0-9_-]+)/);
        const matchId = sel.match(/^#([a-zA-Z0-9_-]+)/);
        const matchAttr = sel.match(/\[([a-zA-Z0-9_-]+)(?:=['"]?([^'"\]]+)['"]?)?\]/);

        let matches = true;
        if(matchId && node.id !== matchId[1]) matches = false;
        if(matchClass && !node.classList.contains(matchClass[1])) matches = false;
        if(matchAttr){
          const attrVal = node.dataset?.[matchAttr[1].replace('data-', '')] || node[matchAttr[1]];
          if(matchAttr[2] !== undefined && attrVal !== matchAttr[2]) matches = false;
          else if(matchAttr[2] === undefined && attrVal === undefined) matches = false;
        }

        if(matches && (node !== el)) results.push(node);
        if(node.children && Array.isArray(node.children)){
          node.children.forEach(search);
        }
      };

      // Also parse innerHTML to find matching tags if children is empty
      if(this._innerHTML){
        // Basic regex parsing for ids and classes in innerHTML
        if(sel.startsWith('#')){
          const id = sel.slice(1);
          if(this._innerHTML.includes(`id="${id}"`)){
            const found = createMockElement('div');
            found.id = id;
            return [found];
          }
        }
        if(sel.startsWith('.')){
          const cls = sel.slice(1).split('[')[0];
          if(this._innerHTML.includes(`class="`) && this._innerHTML.includes(cls)){
            const found = createMockElement('div');
            found.classList.add(cls);
            return [found];
          }
        }
      }

      search(this);
      return results;
    },
    closest(sel){
      return this;
    }
  };
  return el;
}

global.window = global;
global.document = {
  querySelector(sel){ return createMockElement('div'); },
  querySelectorAll(sel){ return [createMockElement('div')]; },
  getElementById(id){ return createMockElement('div'); },
  createElement(tag){ return createMockElement(tag); },
  body: createMockElement('body')
};
global.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
global.sessionStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };

// Carrega dependências
require('../js/competitions.js');
require('../data/competition_teams.js');
require('../data/players_live.js');
require('../js/player/social_media_manager.js');
require('../js/player/national_teams_manager.js');
require('../js/player/player_career_engine.js');
require('../js/ui/create_player_ui.js');

console.log('=== TESTES DO SISTEMA DE CRIAÇÃO DE ATLETA (AFM 2026) ===\n');

// 1. Validação do Catálogo Embutido (window.AFM_CREATOR_CATALOG)
console.log('1. Validando window.AFM_CREATOR_CATALOG...');
assert.ok(window.AFM_CREATOR_CATALOG, 'window.AFM_CREATOR_CATALOG deve estar definido');
const cat = window.AFM_CREATOR_CATALOG;

// Estados e Cidades
const ufs = Object.keys(cat.statesCities);
assert.equal(ufs.length, 27, 'Deve conter exatamente os 27 estados da federação brasileira');
assert.ok(cat.statesCities['DF'].includes('Brasília'), 'DF deve incluir Brasília');
assert.ok(cat.statesCities['SP'].includes('Santos'), 'SP deve incluir Santos');
console.log('✔ Estados e Cidades validados: 27 UFs presentes com cidades reais.');

// Opções de Aparência
assert.equal(cat.appearanceOptions.skinTones.length, 6, 'Deve conter 6 tons de pele');
assert.equal(cat.appearanceOptions.hairStyles.length, 8, 'Deve conter 8 estilos de cabelo');
assert.equal(cat.appearanceOptions.hairColors.length, 8, 'Deve conter 8 cores de cabelo (incluindo Platinado/Nevou)');
assert.equal(cat.appearanceOptions.eyeColors.length, 6, 'Deve conter 6 cores de olhos');
assert.equal(cat.appearanceOptions.faces.length, 6, 'Deve conter 6 expressões de face');
console.log('✔ Opções de aparência 3D validadas com sucesso.');

// Biotipos e Chuteiras
assert.ok(cat.biotypes['Magro'] && cat.biotypes['Médio'] && cat.biotypes['Forte'], 'Deve conter 3 biotipos');
assert.equal(cat.biotypes['Magro'].pros.length, 3, 'Magro deve ter vantagens definidas');
assert.equal(cat.biotypes['Magro'].cons.length, 2, 'Magro deve ter desvantagens definidas');
assert.equal(cat.starterBoots.length, 4, 'Deve conter 4 chuteiras básicas de entrada');
console.log('✔ Biotipos e Chuteiras básicas validados.');

// 21 Arquétipos (3 por posição)
const positions = ['GOL', 'ZAG', 'LAT', 'VOL', 'MEI', 'PON', 'ATA'];
positions.forEach(pos => {
  const archs = cat.archetypesByPos[pos];
  assert.ok(archs && archs.length === 3, `Posição ${pos} deve conter exatamente 3 arquétipos`);
  archs.forEach(a => {
    assert.ok(a.stats.pace && a.stats.shooting && a.stats.passing && a.stats.dribbling && a.stats.defending && a.stats.physical, 'Cada arquétipo deve ter os 6 atributos definidos');
  });
});
console.log('✔ 21 Arquétipos distribuídos rigorosamente nas 7 posições de campo.');

// 4 Níveis de Peneira
assert.equal(cat.tryouts.length, 4, 'Deve conter 4 peneiras (Várzea, Estadual, Nacional e Elite)');
const tryoutIds = cat.tryouts.map(t => t.id);
assert.ok(tryoutIds.includes('varzea_local') && tryoutIds.includes('estadual_federada') && tryoutIds.includes('nacional_cb') && tryoutIds.includes('elite_serie_a'), 'IDs das 4 peneiras devem ser consistentes');
console.log('✔ 4 Desafios de Peneira validados com sucesso.');

// 2. Validação do Gerador de Retratos Jovens (Anti-404)
console.log('\n2. Validando window.generateYoungAthletePortraitUri...');
const draftMock = {
  skinTone: 'skin_3',
  hairStyle: 'fade_quiff',
  hairColor: 'hc_black',
  eyeColor: 'ec_dark',
  face: 'smile'
};
const portraitUri = window.generateYoungAthletePortraitUri(draftMock);
assert.ok(portraitUri.startsWith('data:image/svg+xml;utf8,'), 'Deve gerar uma URI SVG válida em UTF-8');
assert.ok(portraitUri.includes('%3Csvg') || portraitUri.includes('<svg'), 'Deve conter estrutura SVG');
assert.ok(portraitUri.length > 500, 'SVG deve ser detalhado e em alta fidelidade');
console.log('✔ Gerador de retratos jovens funcionando e gerando Data URI anti-404 com sucesso.');

// 3. Validação de Renderização de Todas as 6 Etapas do Criador
console.log('\n3. Validando Renderização das Etapas 1 a 6...');
const container = createMockElement('div');

for(let step = 1; step <= 6; step++){
  window.AFM_CreatePlayerUI.setWizardState({ step: step });
  window.renderCreatePlayerScreen(container, { username: 'teste' });
  const html = container.innerHTML;
  assert.ok(html.length > 2000, `Etapa ${step} deve renderizar HTML rico`);
  assert.ok(html.includes('afm-player-creator-wrapper'), `Etapa ${step} deve conter a classe raiz afm-player-creator-wrapper`);
  assert.ok(html.includes('afmDynamicAvatarContainer'), `Etapa ${step} deve conter o container do avatar 3D`);

  if(step === 1){
    assert.ok(html.includes('creatorStateSelect'), 'Etapa 1 deve conter creatorStateSelect');
    assert.ok(html.includes('creatorCitySelect'), 'Etapa 1 deve conter creatorCitySelect');
    assert.ok(html.includes('ORIGEM DO CRAQUE'), 'Etapa 1 deve conter Origem do Craque');
    assert.ok(html.includes('btnRollRandomPlayer'), 'Etapa 1 deve conter o botão de Gerar Craque Aleatório');
  } else if(step === 2){
    assert.ok(html.includes('swatch-skin'), 'Etapa 2 deve conter swatches de pele');
    assert.ok(html.includes('btn-hair-style'), 'Etapa 2 deve conter botões de estilo de cabelo');
    assert.ok(html.includes('Espelho 3D'), 'Etapa 2 deve conter modo Espelho 3D');
  } else if(step === 3){
    assert.ok(html.includes('wizHeightSlider'), 'Etapa 3 deve conter slider de altura');
    assert.ok(html.includes('VANTAGENS E DESVANTAGENS DESTE BIOTIPO'), 'Etapa 3 deve conter vantagens e desvantagens');
    assert.ok(html.includes('boot-card'), 'Etapa 3 deve conter cards de chuteiras');
  } else if(step === 4){
    assert.ok(html.includes('btn-pos'), 'Etapa 4 deve conter botões de posição');
    assert.ok(html.includes('arch-card'), 'Etapa 4 deve conter cards de arquétipos');
    assert.ok(html.includes('playstyle-card'), 'Etapa 4 deve conter cards de playstyle');
  } else if(step === 5){
    assert.ok(html.includes('wizPointsLeft'), 'Etapa 5 deve conter pontos restantes');
    assert.ok(html.includes('btn-attr-plus'), 'Etapa 5 deve conter botões de adicionar pontos');
    assert.ok(html.includes('RADAR DE ATRIBUTOS'), 'Etapa 5 deve conter radar de atributos');
    assert.ok(html.includes('POTENCIAL ESTIMADO'), 'Etapa 5 deve conter projeção de potencial aos 25 anos');
  } else if(step === 6){
    assert.ok(html.includes('peneira-tier-card'), 'Etapa 6 deve conter cards de peneira');
    assert.ok(html.includes('btnPlayTryoutDirect'), 'Etapa 6 deve conter o botão direto de disputar jogo-treino');
  }
}
console.log('✔ Todas as 6 etapas renderizam perfeitamente com 100% dos catálogos preenchidos!');

// 4. Teste de Início de Carreira com os Novos Arquétipos
console.log('\n4. Testando AFM_PlayerEngine.startPlayerCareer com novos arquétipos...');
const mockPlayerData = {
  name: 'Diego Souza',
  nickname: 'Dieguinho',
  nationality: 'Brasil',
  shirtNumber: 9,
  stateUf: 'SP',
  city: 'Santos',
  clubName: 'Santos',
  peneiraTier: 'varzea_local',
  tryoutWage: 1200,
  position: 'ATA',
  archetype: 'st_poacher',
  height: 1.80,
  bodyBuild: 'Forte',
  preferredFoot: 'Direito',
  origin: 'futsal',
  playstyle: 'frieza_letal',
  pointsDistributed: {
    vel: 2,
    chu: 2,
    pas: 1,
    dri: 0,
    def: 0,
    fis: 0
  },
  remainingSkillPoints: 0,
  appearance: {
    skinTone: 'skin_4',
    hairStyle: 'mohawk',
    hairColor: 'hc_black',
    eyeColor: 'ec_dark',
    face: 'fierce',
    starterBoot: 'boot_crimson',
    sockStyle: 'Meião baixo'
  }
};

assert.doesNotThrow(() => {
  // Mock window.newCareer para teste isolado
  window.newCareer = (cfg) => {
    window.state = {
      gameMode: 'player',
      isPlayerMode: true,
      club: cfg.clubName,
      season: 2026,
      date: '2026-01-01',
      squad: []
    };
  };
  window.AFM_PlayerEngine.startPlayerCareer(mockPlayerData, 2);
}, 'startPlayerCareer deve aceitar o novo arquétipo st_poacher sem erros');

assert.equal(window.state.gameMode, 'player', 'Estado deve estar em modo player');
assert.ok(window.state.playerCareerState, 'playerCareerState deve ter sido instanciado');
assert.equal(window.state.playerCareerState.athleteName, 'Diego Souza');
console.log('✔ startPlayerCareer completou a criação com o novo arquétipo e iniciou o save perfeitamente.');

console.log('\n======================================================');
console.log('🎉 TODOS OS TESTES DO CRIADOR DE ATLETA PASSARAM (100%)! 🎉');
console.log('======================================================\n');
