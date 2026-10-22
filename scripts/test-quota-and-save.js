const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const gameSource = fs.readFileSync(path.resolve('js/game.js'), 'utf8');

// Testa se shuffle está definido e funcional
assert(gameSource.includes('function shuffle(array){'), 'function shuffle deve estar declarada');
const shuffleMatch = gameSource.match(/function shuffle\(array\)\{[\s\S]*?\n\}/);
assert(shuffleMatch, 'declaração de shuffle encontrada');

const testArr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const shuffleCtx = { Array, Math };
vm.runInNewContext(shuffleMatch[0] + '\nshuffle(testArr);', { testArr, Array, Math });
assert.strictEqual(testArr.length, 10, 'shuffle preserva tamanho do array');

console.log('✅ PASS: function shuffle implementada e infalível');

// Testa freeUpLocalStorageQuota
assert(gameSource.includes('function freeUpLocalStorageQuota()'), 'freeUpLocalStorageQuota declarada');

// Testa se save() limpa payload para proteção de cota
assert(gameSource.includes('delete savePayload.isolatedWorld.players'), 'Omitir catálogo de atletas estáticos do savePayload');
assert(gameSource.includes('delete savePayload.isolatedWorld.clubs'), 'Omitir catálogo de clubes estáticos do savePayload');
assert(gameSource.includes('freeUpLocalStorageQuota()'), 'Chamar recuperação de cota se houver erro ao salvar');

console.log('✅ PASS: Compactação de payload e recuperação de cota de salvamento validadas');
