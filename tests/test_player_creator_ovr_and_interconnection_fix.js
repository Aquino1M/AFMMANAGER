/**
 * Teste Automatizado E2E: Fonte Única de Verdade na Criação do Atleta, OVR, Atributos,
 * Camisa (#9 vs #10), Posições PT/EN (ATA/ST, GOL/GK), Colisão LIVE_PLAYERS e Save/Load JSON
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function createMockElement(tag = 'div') {
  return {
    tagName: tag.toUpperCase(),
    id: '',
    dataset: {},
    style: {},
    value: '',
    checked: false,
    innerHTML: '',
    textContent: '',
    classList: {
      _s: new Set(),
      add(c) { this._s.add(c); },
      remove(c) { this._s.delete(c); },
      contains(c) { return this._s.has(c); },
      toggle(c) { if (this._s.has(c)) this._s.delete(c); else this._s.add(c); }
    },
    addEventListener() {},
    removeEventListener() {},
    appendChild() {},
    removeChild() {},
    remove() {},
    setAttribute() {},
    getAttribute() { return null; },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    closest() { return null; }
  };
}

const storageMap = new Map();
global.window = global;
global.localStorage = {
  getItem: (k) => (storageMap.has(k) ? storageMap.get(k) : null),
  setItem: (k, v) => storageMap.set(k, String(v)),
  removeItem: (k) => storageMap.delete(k),
  clear: () => storageMap.clear(),
  key: (i) => Array.from(storageMap.keys())[i] || null,
  get length() { return storageMap.size; }
};
global.sessionStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {}
};

const appEl = createMockElement('div');
appEl.id = 'app';
global.document = {
  body: createMockElement('body'),
  documentElement: createMockElement('html'),
  getElementById: (id) => (id === 'app' ? appEl : null),
  querySelector: (sel) => (sel === '#app' ? appEl : null),
  querySelectorAll: () => [],
  createElement: (tag) => createMockElement(tag),
  addEventListener: () => {}
};
Object.defineProperty(global, 'navigator', {
  value: { userAgent: 'node-test', onLine: true },
  configurable: true
});
global.location = { href: 'http://localhost/', reload: () => {} };
global.confirm = () => true;
global.alert = () => {};
global.scrollTo = () => {};
global.requestAnimationFrame = () => 0;
global.cancelAnimationFrame = () => {};

global.$ = () => null;
global.$$ = () => [];
global.toast = () => {};
global.performance = { now: () => Date.now() };

// Carrega o ecossistema completo na mesma ordem do navegador
const rootDir = path.join(__dirname, '..');
const loadScript = (rel) => eval(fs.readFileSync(path.join(rootDir, rel), 'utf8'));

loadScript('js/competitions.js');
loadScript('data/competition_teams.js');
loadScript('data/players_live.js');
loadScript('js/game.js');
loadScript('js/player/lifestyleData.js');
loadScript('js/player/social_media_manager.js');
loadScript('js/player/national_teams_manager.js');
loadScript('js/player/player_career_engine.js');
loadScript('js/player/player_mode_ui.js');
loadScript('js/ui/create_player_ui.js');

console.log('=== TESTE E2E: SINCRONIA TOTAL CRIADOR 3D -> MOTOR -> ABAS -> SAVE/LOAD ===\n');

// ---------------------------------------------------------------------------
// 1. Reprodução exata do cenário reportado pelo usuário (Aquino #9, 40 OVR)
// ---------------------------------------------------------------------------
console.log('1. Validando cenário exato do usuário (Aquino #9, ATA, 1.83m, Forte, st_poacher, +3 VEL, +2 DRI => 40 OVR)...');
{
  window.setupSelectedSlot = 2;
  window.AFM_CreatePlayerUI.setWizardState({
    step: 5,
    name: 'Aquino',
    nickname: 'Aquino',
    nationality: 'Brasil',
    shirtNumber: 9,
    stateUf: 'DF',
    city: 'Brasília',
    clubName: 'Brasília',
    origin: 'terrao',
    playstyle: 'frieza_letal',
    inspiration: 'ronaldo',
    height: 1.83,
    bodyBuild: 'Forte',
    preferredFoot: 'Direito',
    position: 'ATA',
    archetype: 'st_poacher',
    pointsAvailable: 0,
    pointsDistributed: {
      pace: 3,
      shooting: 0,
      passing: 0,
      dribbling: 2,
      defending: 0,
      physical: 0
    },
    peneiraTier: 'varzea_local',
    tryoutResult: {
      approved: true,
      scoutRating: 7.8,
      clubName: 'Brasília',
      wageOffered: 982,
      squadRole: 'Titular em Potencial'
    },
    appearance: {
      skinTone: 'skin_2',
      hairStyle: 'samurai',
      hairColor: 'hc_platinum',
      eyeColor: 'ec_blue',
      face: 'smile',
      avatarMode: 'mirror',
      facePhoto: null,
      customFacePhoto: null,
      starterBoot: 'boot_classic',
      sockStyle: 'Meião baixo'
    }
  });

  const creatorAttrs = window.AFM_CreatePlayerUI.getCurrentAttributes();
  const creatorOvr = window.AFM_CreatePlayerUI.getCurrentOverall();
  assert.deepEqual(creatorAttrs, {
    pace: 37,
    shooting: 45,
    passing: 33,
    dribbling: 41,
    defending: 22,
    physical: 43
  }, 'Atributos na Etapa 5 devem bater ponto a ponto (37, 45, 33, 41, 22, 43)');
  assert.equal(creatorOvr, 40, 'OVR na Etapa 5 deve ser exatamente 40');

  // Executa assinatura do contrato exatamente como o clique em #btnStep6SignContract
  window.AFM_CreatePlayerUI.finalizePlayerCareerStart(appEl);

  const s = window.state;
  assert.equal(s.gameMode, 'player');
  const athlete = window.getControlledPlayer(s);
  assert.ok(athlete, 'Atleta controlado deve existir no elenco');
  assert.equal(athlete.number, 9, 'Camisa escolhida (#9) deve ser preservada');
  assert.equal(s.playerCareerState.shirtNumber, 9, 'shirtNumber no playerCareerState deve ser 9');

  // Verifica que nenhum companheiro de elenco ficou com camisa duplicada #9
  const teammatesWith9 = s.squad.filter((p) => p.id !== athlete.id && Number(p.number) === 9);
  assert.equal(teammatesWith9.length, 0, 'Nenhum outro jogador do elenco pode duplicar a camisa #9');

  const effAfterSign = window.AFM_PlayerEngine.getPlayerEffectiveAttributes(s, athlete);
  assert.equal(effAfterSign.vel, 37);
  assert.equal(effAfterSign.chu, 45);
  assert.equal(effAfterSign.pas, 33);
  assert.equal(effAfterSign.dri, 41);
  assert.equal(effAfterSign.def, 22);
  assert.equal(effAfterSign.fis, 43);

  assert.equal(athlete.ovr, 40, 'OVR do atleta logo após assinar contrato DEVE continuar 40');
  assert.equal(s.playerCareerState.athleteOvr, 40, 'athleteOvr em playerCareerState DEVE ser 40');
  assert.equal(s.player.ovr, 40, 'ovr em state.player DEVE ser 40');
  assert.equal(window.playerOverall(athlete), 40, 'window.playerOverall(athlete) DEVE retornar 40 sem puxar errado');

  // Verifica Mini-Card FUT, Radar e Aba Evolução
  const evoHtml = window.AFM_PlayerModeUI.renderPlayerEvolution(s);
  assert.ok(evoHtml.includes('<div class="fut-card-ovr">40</div>'), 'Mini-Card FUT deve exibir 40 OVR');
  assert.ok(evoHtml.includes('>37</span> <span class="fut-card-stat-lbl">VEL</span>'), 'Mini-Card FUT deve exibir 37 VEL (idêntico ao radar e barras)');
  assert.ok(evoHtml.includes('>45</span> <span class="fut-card-stat-lbl">CHU</span>'), 'Mini-Card FUT deve exibir 45 CHU');
  assert.ok(evoHtml.includes('>33</span> <span class="fut-card-stat-lbl">PAS</span>'), 'Mini-Card FUT deve exibir 33 PAS');
  assert.ok(evoHtml.includes('>41</span> <span class="fut-card-stat-lbl">DRI</span>'), 'Mini-Card FUT deve exibir 41 DRI');
  assert.ok(evoHtml.includes('>22</span> <span class="fut-card-stat-lbl">DEF</span>'), 'Mini-Card FUT deve exibir 22 DEF');
  assert.ok(evoHtml.includes('>43</span> <span class="fut-card-stat-lbl">FIS</span>'), 'Mini-Card FUT deve exibir 43 FIS');

  // Verifica que o SVG do retrato no Mini-Card FUT contém o número #9 (e não #10)
  const futPhotoMatch = evoHtml.match(/class="fut-card-photo"\s+src="data:image\/svg\+xml;utf8,([^"]+)"/);
  assert.ok(futPhotoMatch, 'Mini-Card FUT deve conter retrato SVG em Data URI');
  const decodedEvoSvg = decodeURIComponent(futPhotoMatch[1]);
  assert.ok(decodedEvoSvg.includes('>9</text>'), 'Retrato SVG do Mini-Card FUT deve estampar a camisa 9');

  // Verifica Aba Estatísticas (#9 no cabeçalho) e FootGram
  const statsHtml = window.AFM_PlayerMode.renderPage('player_stats', s);
  assert.ok(statsHtml.includes('#9 •'), 'Aba Estatísticas deve exibir #9 em vez de #10');
  const socialData = window.AFM_FOOTGRAM.ensureSocialData(s);
  assert.ok(decodeURIComponent(socialData.avatarUrl).includes('>9</text>'), 'Avatar do FootGram deve estampar a camisa 9');

  // Simula ciclo completo de serialização JSON + migrate() + normalizeSquadState() (onde ATA vira ST)
  const serialized = JSON.parse(JSON.stringify(s));
  const migrated = window.migrate(serialized);
  const reloadedAthlete = window.getControlledPlayer(migrated);
  assert.equal(reloadedAthlete.pos, 'ST', 'normalizeSquadState converte ATA para ST');
  assert.equal(reloadedAthlete.ovr, 40, 'Mesmo com pos="ST", OVR após migrate() DEVE permanecer 40');
  assert.equal(migrated.playerCareerState.athleteOvr, 40, 'playerCareerState.athleteOvr após migrate() DEVE permanecer 40');
  assert.equal(migrated.player.ovr, 40, 'state.player.ovr após migrate() DEVE permanecer 40');
  assert.equal(window.AFM_PLAYER_EVOLUTION.recalculateOvr(reloadedAthlete, migrated), 40, 'recalculateOvr com pos="ST" DEVE continuar 40');
  assert.equal(reloadedAthlete.wage, 982, 'Salário contratado (R$ 982) deve se manter íntegro após migrate()');
  assert.equal(migrated.playerCareerState.salary, 982, 'playerCareerState.salary deve ser 982 (sem cair em default 1045)');
  assert.equal(migrated.player.salary, 982, 'state.player.salary deve ser 982');
  assert.equal(migrated.playerCareerState.personalBank, 982, 'personalBank deve ser 982');
  assert.equal(migrated.player.cash, 982, 'state.player.cash deve ser 982');
  console.log('✔ Cenário exato Aquino #9 (40 OVR) validado em 100% das telas e após ciclo completo de Save/Load!');
}

// ---------------------------------------------------------------------------
// 2. Varredura exaustiva dos 21 arquétipos, 7 posições e 4 chuteiras iniciais
// ---------------------------------------------------------------------------
console.log('\n2. Validando paridade 1:1 de OVR em todos os 21 arquétipos + 4 chuteiras iniciais...');
{
  const catalog = window.AFM_CREATOR_CATALOG;
  const boots = catalog.starterBoots.map((b) => b.id);
  const origins = catalog.origins.map((o) => o.id);
  const builds = ['Magro', 'Médio', 'Forte'];
  let idx = 0;

  // Reutiliza mundo gerado para testar rapidamente os 21 arquétipos sem reconstruir 96 clubes 21x
  const realNewCareer = window.newCareer;
  const cachedWorldTemplate = JSON.stringify(window.state);
  window.newCareer = (cfg) => {
    const cloned = JSON.parse(cachedWorldTemplate);
    cloned.club = cfg.clubName || 'Gama';
    cloned.gameMode = 'player';
    cloned.isPlayerMode = true;
    cloned.squad = cloned.squad.filter((p) => !p.isControlled && !p.isControlledAthlete);
    window.setState(cloned);
  };

  try {
  for (const [pos, archList] of Object.entries(catalog.archetypesByPos)) {
    for (const arch of archList) {
      const bootId = boots[idx % boots.length];
      const originId = origins[idx % origins.length];
      const build = builds[idx % builds.length];
      const height = 1.68 + (idx % 6) * 0.05;
      idx++;

      window.AFM_CreatePlayerUI.setWizardState({
        name: `Teste ${arch.id}`,
        nickname: arch.id,
        position: pos,
        archetype: arch.id,
        origin: originId,
        bodyBuild: build,
        height,
        shirtNumber: (idx % 25) + 1,
        pointsAvailable: 0,
        pointsDistributed: { pace: 2, shooting: 1, passing: 1, dribbling: 1, defending: 0, physical: 0 },
        appearance: {
          skinTone: 'skin_3',
          hairStyle: 'fade_quiff',
          hairColor: 'hc_black',
          eyeColor: 'ec_dark',
          face: 'focused',
          avatarMode: 'mirror',
          facePhoto: null,
          customFacePhoto: null,
          starterBoot: bootId,
          sockStyle: 'Meião baixo'
        }
      });

      const expectedOvr = window.AFM_CreatePlayerUI.getCurrentOverall();
      const expectedAttrs = window.AFM_CreatePlayerUI.getCurrentAttributes();

      // Testa também chamada direta ao motor SEM baseAttributes pré-calculados
      window.AFM_PlayerEngine.startPlayerCareer({
        name: `Teste ${arch.id}`,
        nickname: arch.id,
        clubName: 'Gama',
        position: pos,
        archetype: arch.id,
        origin: originId,
        bodyBuild: build,
        height,
        shirtNumber: (idx % 25) + 1,
        peneiraTier: 'estadual_federada',
        tryoutWage: 1650,
        pointsDistributed: { vel: 2, chu: 1, pas: 1, dri: 1, def: 0, fis: 0 },
        appearance: {
          skinTone: 'skin_3',
          hairStyle: 'fade_quiff',
          hairColor: 'hc_black',
          eyeColor: 'ec_dark',
          face: 'focused',
          starterBoot: bootId
        }
      }, 3);

      const st = window.state;
      const ath = window.getControlledPlayer(st);
      const eff = window.AFM_PlayerEngine.getPlayerEffectiveAttributes(st, ath);
      assert.equal(ath.ovr, expectedOvr, `Arquétipo ${arch.id} (${pos}) deve manter OVR ${expectedOvr} no motor`);
      assert.equal(eff.pace, expectedAttrs.pace, `Arquétipo ${arch.id}: pace divergente`);
      assert.equal(eff.shooting, expectedAttrs.shooting, `Arquétipo ${arch.id}: shooting divergente`);
      assert.equal(eff.passing, expectedAttrs.passing, `Arquétipo ${arch.id}: passing divergente`);
      assert.equal(eff.dribbling, expectedAttrs.dribbling, `Arquétipo ${arch.id}: dribbling divergente`);
      assert.equal(eff.defending, expectedAttrs.defending, `Arquétipo ${arch.id}: defending divergente`);
      assert.equal(eff.physical, expectedAttrs.physical, `Arquétipo ${arch.id}: physical divergente`);

      const afterMigrate = window.migrate(JSON.parse(JSON.stringify(st)));
      const migratedAth = window.getControlledPlayer(afterMigrate);
      assert.equal(migratedAth.ovr, expectedOvr, `Arquétipo ${arch.id} (${pos} -> ${migratedAth.pos}) deve manter OVR ${expectedOvr} após migrate()`);
    }
  }
  } finally {
    window.newCareer = realNewCareer;
  }
  console.log('✔ Todos os 21 arquétipos nas 7 posições mantiveram 100% de paridade de atributos e OVR antes e após migrate()!');
}

// ---------------------------------------------------------------------------
// 3. Blindagem de Goleiro (GOL -> GK) e Imunidade contra Colisão LIVE_PLAYERS
// ---------------------------------------------------------------------------
console.log('\n3. Validando Goleiro (GOL -> GK) e imunidade contra colisão de nomes no LIVE_PLAYERS...');
{
  const realDbName = (Array.isArray(window.LIVE_PLAYERS) && window.LIVE_PLAYERS[0]?.name) || 'Pedro';
  const customSvg = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg"><text>GOLEIRO_USER</text></svg>';

  window.AFM_PlayerEngine.startPlayerCareer({
    name: realDbName,
    nickname: 'Paredão',
    clubName: 'Brasiliense',
    position: 'GOL',
    archetype: 'gk_reflex',
    origin: 'school',
    bodyBuild: 'Médio',
    height: 1.92,
    shirtNumber: 1,
    peneiraTier: 'varzea_local',
    tryoutWage: 1100,
    pointsDistributed: { vel: 0, chu: 0, pas: 1, dri: 0, def: 3, fis: 1 },
    appearance: {
      skinTone: 'skin_4',
      hairStyle: 'buzzcut',
      hairColor: 'hc_black',
      eyeColor: 'ec_dark',
      face: 'fierce',
      customFacePhoto: customSvg,
      starterBoot: 'boot_classic'
    }
  }, 4);

  const gkOvrBefore = window.state.playerCareerState.athleteOvr;
  const migratedGkState = window.migrate(JSON.parse(JSON.stringify(window.state)));
  const gkAthlete = window.getControlledPlayer(migratedGkState);

  assert.equal(gkAthlete.pos, 'GK', 'Posição tática normalizada de GOL é GK');
  assert.equal(gkAthlete.ovr, gkOvrBefore, 'OVR do Goleiro não pode mudar após GOL -> GK nem sofrer override do LIVE_PLAYERS');
  assert.equal(gkAthlete.photo, customSvg, 'Foto customizada do atleta não pode ser sobrescrita por homônimo do LIVE_PLAYERS');
  assert.equal(migratedGkState.playerCareerState.weeklyTrainingFocus, 'gk_reflexes', 'Goleiro com pos="GK" deve preservar foco gk_reflexes');

  const gkEvoHtml = window.AFM_PlayerModeUI.renderPlayerEvolution(migratedGkState);
  assert.ok(gkEvoHtml.includes('Reflexos & Defesas Difíceis'), 'Aba Evolução deve renderizar treino específico de Goleiro mesmo quando pos="GK"');

  const gkHubHtml = window.AFM_PlayerMode.renderPage('player_hub', migratedGkState);
  assert.ok(gkHubHtml.includes('Clean Sheet') || gkHubHtml.includes('Baliza Inviolada'), 'Hub Central deve exibir metas de Goleiro mesmo quando pos="GK"');
  console.log(`✔ Goleiro (GOL -> GK) e blindagem contra homônimo LIVE_PLAYERS ("${realDbName}") aprovados!`);
}

// ---------------------------------------------------------------------------
// 4. Imunidade contra Split-Brain após evolução e ganhos financeiros + Save/Load
// ---------------------------------------------------------------------------
console.log('\n4. Validando imunidade contra Split-Brain entre playerCareerState e state.player após evolução...');
{
  const s = window.state;
  const ath = window.getControlledPlayer(s);
  ath.attributes.def = 55;
  ath.attributes.defending = 55;
  const evolvedOvr = window.AFM_PLAYER_EVOLUTION.recalculateOvr(ath, s);
  s.playerCareerState.athleteOvr = evolvedOvr;
  s.playerCareerState.overall = evolvedOvr;
  s.playerCareerState.personalBank = 7500;
  s.playerCareerState.lifestyle.cash = 7500;
  s.playerCareerState.salary = 3200;
  ath.wage = 3200;

  // Simula estado dessincronizado antigo em s.player antes de salvar
  s.player.ovr = 35;
  s.player.cash = 982;
  s.player.salary = 1045;

  const reloaded = window.migrate(JSON.parse(JSON.stringify(s)));
  assert.equal(reloaded.player.ovr, evolvedOvr, 'state.player.ovr deve sincronizar com o OVR evoluído real');
  assert.equal(reloaded.playerCareerState.athleteOvr, evolvedOvr, 'athleteOvr deve preservar evolução');
  assert.equal(reloaded.player.cash, 7500, 'state.player.cash deve refletir saldo evoluído de R$ 7.500');
  assert.equal(reloaded.playerCareerState.personalBank, 7500, 'personalBank deve preservar R$ 7.500');
  assert.equal(reloaded.player.salary, 3200, 'state.player.salary deve refletir novo salário de R$ 3.200');
  console.log('✔ Sincronização pós-save/load sem regressão para snapshots antigos validada!');
}

console.log('\n====================================================================');
console.log('🎉 TODOS OS TESTES DE INTERCONEXÃO E OVR DO MODO JOGADOR PASSARAM! 🎉');
console.log('====================================================================\n');
