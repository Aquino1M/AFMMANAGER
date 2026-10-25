const fs = require('fs');
const assert = require('assert');

const code = fs.readFileSync('js/game.js', 'utf8');

const FACILITIES = { marketing: { max: 8 } };
const MARKETING_MINIMUM_WEEKLY = 36000;
function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }

const fnMatch = code.match(/function marketingBenefits\([\s\S]*?\n\}/);
assert(fnMatch, 'marketingBenefits encontrado no código');

const evalFn = new Function('FACILITIES', 'MARKETING_MINIMUM_WEEKLY', 'clamp', 'state', fnMatch[0] + '\nreturn marketingBenefits;');
const marketingBenefits = evalFn(FACILITIES, MARKETING_MINIMUM_WEEKLY, clamp, { marketingWeekly: 288000, infrastructure: { marketing: { level: 4 } } });

const b288 = marketingBenefits(288000, 4);
const b151 = marketingBenefits(151000, 4);
const b36 = marketingBenefits(36000, 4);

console.log('--- RESULTADOS DO MARKETING DINÂMICO ---');
console.log('Aporte R$ 288.000/sem (Máximo):', { torcida: '+' + b288.attendancePercent + '%', bonus: '+' + b288.sponsorPercent + '%', mult: b288.sponsorMultiplier });
console.log('Aporte R$ 151.000/sem (Médio):  ', { torcida: '+' + b151.attendancePercent + '%', bonus: '+' + b151.sponsorPercent + '%', mult: b151.sponsorMultiplier });
console.log('Aporte R$  36.000/sem (Mínimo): ', { torcida: '+' + b36.attendancePercent + '%', bonus: '+' + b36.sponsorPercent + '%', mult: b36.sponsorMultiplier });

assert.strictEqual(b288.attendancePercent, 6, '288k deve dar +6% de torcida no nível 4');
assert.strictEqual(b288.sponsorPercent, 8, '288k deve dar +8% de bônus no nível 4');
assert.strictEqual(b36.attendancePercent, 3, '36k deve dar +3% de torcida no nível 4');
assert.strictEqual(b36.sponsorPercent, 4, '36k deve dar +4% de bônus no nível 4');

assert(b151.attendancePercent < b288.attendancePercent, '151k deve ter torcida menor que 288k');
assert(b151.sponsorPercent < b288.sponsorPercent, '151k deve ter bônus de patrocínio menor que 288k');
assert(b36.attendancePercent < b151.attendancePercent, '36k deve ter torcida menor que 151k');
assert(b36.sponsorPercent < b151.sponsorPercent, '36k deve ter bônus de patrocínio menor que 151k');

console.log('✅ TODOS OS TESTES PASSARAM! O slider agora recalcula e atualiza tudo dinamicamente.');
