const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

// 1. Testa resolveRegenOrYouthPosition
const gameSource = fs.readFileSync(path.resolve('js/game.js'), 'utf8');

function extractFunc(name) {
  const marker = `function ${name}(`;
  const idx = gameSource.indexOf(marker);
  if (idx === -1) throw new Error(`${name} not found`);
  let depth = 0;
  let started = false;
  for (let i = idx; i < gameSource.length; i++) {
    if (gameSource[i] === '{') {
      depth++;
      started = true;
    } else if (gameSource[i] === '}') {
      depth--;
      if (started && depth === 0) {
        return gameSource.slice(idx, i + 1);
      }
    }
  }
  throw new Error(`Incomplete ${name}`);
}

const ctx = {
  window: {},
  norm: (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim(),
  normTacticalPos: (p) => {
    const map = { ZAG: 'CB', LAT: 'RB', LD: 'RB', LE: 'LB', VOL: 'DM', MEI: 'AM', MC: 'CM', ATA: 'ST', CA: 'ST', PON: 'LW', PD: 'RW', PE: 'LW', GOL: 'GK' };
    const up = String(p || '').toUpperCase();
    return map[up] || up;
  }
};
ctx.window = ctx;

vm.runInNewContext([
  extractFunc('resolveRegenOrYouthPosition'),
  extractFunc('normalizeYouthAcademyPositions'),
  extractFunc('normalizeYouthAcademyRoster'),
  extractFunc('isBuggedExploitPlayer'),
  extractFunc('purgeBuggedExploitPlayers')
].join('\n'), ctx);

// Teste de resolução de posições autênticas dos craques
assert.strictEqual(ctx.resolveRegenOrYouthPosition({ name: 'Virgil Jr.' }), 'CB', 'Virgil Jr. deve ser Zagueiro (CB)');
assert.strictEqual(ctx.resolveRegenOrYouthPosition({ name: 'Lionel Jr.' }), 'RW', 'Lionel Jr. deve ser Ponta Direita (RW)');
assert.strictEqual(ctx.resolveRegenOrYouthPosition({ name: 'Manuel Jr.' }), 'GK', 'Manuel Jr. deve ser Goleiro (GK)');
assert.strictEqual(ctx.resolveRegenOrYouthPosition({ name: 'Cristiano Jr.' }), 'ST', 'Cristiano Jr. deve ser Centroavante (ST)');
assert.strictEqual(ctx.resolveRegenOrYouthPosition({ name: 'Luis Jr.' }), 'ST', 'Luis Jr. deve ser Centroavante (ST)');
assert.strictEqual(ctx.resolveRegenOrYouthPosition({ name: 'Matheus Jr.', position: 'ZAG' }), 'CB', 'Deve converter posição herdada');

console.log('✅ PASS: Resolução precisa de posições para todos os craques regens (CB, RW, GK, ST)');

// Teste de preservação de regens legítimos pelo filtro
assert.strictEqual(ctx.isBuggedExploitPlayer({ name: 'Virgil Jr.', pos: 'CB' }), false, 'Virgil Jr. é legítimo e não deve ser purgado');
assert.strictEqual(ctx.isBuggedExploitPlayer({ name: 'Cristiano Jr.', pos: 'ST' }), false, 'Cristiano Jr. é legítimo e não deve ser purgado');
assert.strictEqual(ctx.isBuggedExploitPlayer({ name: 'Lionel Jr.', pos: 'RW' }), false, 'Lionel Jr. é legítimo e não deve ser purgado');
assert.strictEqual(ctx.isBuggedExploitPlayer({ name: 'Manuel Jr.', pos: 'GK' }), false, 'Manuel Jr. é legítimo e não deve ser purgado');
assert.strictEqual(ctx.isBuggedExploitPlayer({ name: 'Luis Jr.', pos: 'ST' }), false, 'Luis Jr. é legítimo e não deve ser purgado');

// Teste de normalização da base (youthAcademy)
const baseState = {
  youthAcademy: [
    { name: 'Virgil Jr.' },
    { name: 'Lionel Jr.' },
    { name: 'Manuel Jr.' },
    { name: 'Cristiano Jr.' },
    { name: 'Luis Jr.' },
    { name: 'Rayan Silva', pos: '-' },
    { name: 'Garoto da Base' }
  ],
  youthAcademyOverflow: []
};

ctx.normalizeYouthAcademyPositions(baseState);

assert.strictEqual(baseState.youthAcademy[0].pos, 'CB');
assert.strictEqual(baseState.youthAcademy[1].pos, 'RW');
assert.strictEqual(baseState.youthAcademy[2].pos, 'GK');
assert.strictEqual(baseState.youthAcademy[3].pos, 'ST');
assert.strictEqual(baseState.youthAcademy[4].pos, 'ST');
assert(baseState.youthAcademy[5].pos !== '-', 'Nenhum jogador pode ficar com pos "-"');
assert(Boolean(baseState.youthAcademy[6].pos), 'Atleta da base sem posição recebe posição tática válida');

console.log('✅ PASS: Categorias de base 100% curadas sem jogadores sem posição!');

// Teste do motor de envelhecimento e geração de regens em js/systems/market_lupa_aging_and_regens.js
const marketSrc = fs.readFileSync(path.resolve('js/systems/market_lupa_aging_and_regens.js'), 'utf8');
const marketCtx = {
  window: {
    resolveRegenOrYouthPosition: ctx.resolveRegenOrYouthPosition,
    norm: ctx.norm,
    addEventListener: () => {},
    addYouthAcademyPlayer: (regen, st) => {
      st.youthAcademy.unshift(regen);
      return true;
    }
  },
  document: { addEventListener: () => {} }
};
vm.runInNewContext(marketSrc, marketCtx);

const agingTestState = {
  club: 'Corinthians',
  squad: [
    { name: 'Lionel Messi', age: 37, overall: 88, pos: 'RW', nationality: 'Argentina', forceRetire: true },
    { name: 'Virgil van Dijk', age: 36, overall: 89, pos: 'CB', nationality: 'Holanda', forceRetire: true },
    { name: 'Cristiano Ronaldo', age: 39, overall: 87, pos: 'ST', nationality: 'Portugal', forceRetire: true }
  ],
  youthAcademy: [],
  worldRegens: []
};

marketCtx.window.AFM_MarketLupaAndAging.processAgingDeclineAndGeneticRegens(agingTestState);

assert(agingTestState.youthAcademy.length >= 3, 'Regens genéticos foram gerados na base ao aposentar veteranos');
const messiJr = agingTestState.youthAcademy.find(p => p.name.includes('Lionel Jr.'));
const virgilJr = agingTestState.youthAcademy.find(p => p.name.includes('Virgil Jr.'));
const cr7Jr = agingTestState.youthAcademy.find(p => p.name.includes('Cristiano Jr.'));

assert(messiJr, 'Lionel Jr. gerado com sucesso');
assert.strictEqual(messiJr.pos, 'RW', 'Lionel Jr. tem posição RW garantida');
assert.strictEqual(messiJr.age, 16, 'Idade 16 anos');
assert(messiJr.potential >= 83, 'Potencial alto herdado');

assert(virgilJr, 'Virgil Jr. gerado com sucesso');
assert.strictEqual(virgilJr.pos, 'CB', 'Virgil Jr. tem posição CB garantida');

assert(cr7Jr, 'Cristiano Jr. gerado com sucesso');
assert.strictEqual(cr7Jr.pos, 'ST', 'Cristiano Jr. tem posição ST garantida');

console.log('✅ PASS: Geração de regens em js/systems/market_lupa_aging_and_regens.js 100% restaurada com posições táticas!');

// Teste de exibição do gramado no centralPage quando for jogo em casa
assert(gameSource.includes('CONDIÇÃO DO GRAMADO (MANDANTE)'), 'Condição do gramado exibida com destaque na Central');
assert(gameSource.includes('homePitchCondition.statusText'), 'Status do gramado (Excelente, Bom, Regular) formatado');
assert(gameSource.includes('isUpcomingHomeMatch'), 'Condição do gramado só carrega para mandante');

console.log('✅ PASS: Condição do gramado exibida com destaque em jogos em casa na tela inicial');
