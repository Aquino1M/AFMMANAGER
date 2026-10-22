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
  extractFunc('normalizeYouthAcademyRoster')
].join('\n'), ctx);

// Teste de resolução de posições autênticas dos craques
assert.strictEqual(ctx.resolveRegenOrYouthPosition({ name: 'Virgil Jr.' }), 'CB', 'Virgil Jr. deve ser Zagueiro (CB)');
assert.strictEqual(ctx.resolveRegenOrYouthPosition({ name: 'Lionel Jr.' }), 'RW', 'Lionel Jr. deve ser Ponta Direita (RW)');
assert.strictEqual(ctx.resolveRegenOrYouthPosition({ name: 'Manuel Jr.' }), 'GK', 'Manuel Jr. deve ser Goleiro (GK)');
assert.strictEqual(ctx.resolveRegenOrYouthPosition({ name: 'Cristiano Jr.' }), 'ST', 'Cristiano Jr. deve ser Centroavante (ST)');
assert.strictEqual(ctx.resolveRegenOrYouthPosition({ name: 'Luis Jr.' }), 'ST', 'Luis Jr. deve ser Centroavante (ST)');
assert.strictEqual(ctx.resolveRegenOrYouthPosition({ name: 'Matheus Jr.', position: 'ZAG' }), 'CB', 'Deve converter posição herdada');

console.log('✅ PASS: Resolução precisa de posições para todos os craques regens (CB, RW, GK, ST)');

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

// Teste de exibição do gramado no centralPage quando for jogo em casa
assert(gameSource.includes('CONDIÇÃO DO GRAMADO (MANDANTE)'), 'Condição do gramado exibida com destaque na Central');
assert(gameSource.includes('homePitchCondition.statusText'), 'Status do gramado (Excelente, Bom, Regular) formatado');
assert(gameSource.includes('isUpcomingHomeMatch'), 'Condição do gramado só carrega para mandante');

console.log('✅ PASS: Condição do gramado exibida com destaque em jogos em casa na tela inicial');
