const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

console.log('🧪 Iniciando teste de recalibração de chances do Momento Decisivo do Craque...');

// 1. Carrega calcCraqueDecisionChance e helpers do game.js
const rawCode = fs.readFileSync('js/game.js', 'utf8');
const gameCode = rawCode.replace(/\r\n/g, '\n');

// Extrai a função calcCraqueDecisionChance
const fnMatch = gameCode.match(/function calcCraqueDecisionChance[\s\S]*?\n}\nwindow\.calcCraqueDecisionChance/);
assert(fnMatch, 'Função calcCraqueDecisionChance deve existir em js/game.js');

const sandbox = {
  window: {},
  document: {
    getElementById: () => null,
    createElement: () => ({ style: {}, setAttribute: () => {}, appendChild: () => {}, querySelectorAll: () => [], querySelector: () => null }),
    body: { appendChild: () => {} }
  },
  console
};
vm.createContext(sandbox);
vm.runInContext(fnMatch[0] + ' = calcCraqueDecisionChance;', sandbox);
const calcChance = sandbox.window.calcCraqueDecisionChance;

// =========================================================================
// TESTE 1: CASO EXATO DO USUÁRIO (Atleta Iniciante OVR 41)
// =========================================================================
console.log('--- Teste 1: Caso Real do Usuário (OVR 41, Joia da Base Iniciante) ---');
const userOvr = 41;
const finVal = 49;
const shoVal = 45;
const driVal = 43;
const pacVal = 40;
const pasVal = 38;

const placedChance = calcChance({ attrVal: finVal, athleteOvr: userOvr, attrWeight: 0.65, baseChance: 17, slope: 0.86, minChance: 15, maxChance: 75 });
const powerChance = calcChance({ attrVal: shoVal, athleteOvr: userOvr, attrWeight: 0.65, baseChance: 13, slope: 0.84, minChance: 12, maxChance: 72 });
const dribbleChance = calcChance({ attrVal: (driVal + pacVal) / 2, athleteOvr: userOvr, attrWeight: 0.65, baseChance: 14, slope: 0.85, minChance: 12, maxChance: 73 });
const passChance = calcChance({ attrVal: pasVal, athleteOvr: userOvr, attrWeight: 0.65, baseChance: 15, slope: 0.86, minChance: 14, maxChance: 75 });

console.log(`Chute Colocado: ${placedChance}% (antigo: 52% - absurdo para OVR 41)`);
console.log(`Bomba Primeira: ${powerChance}% (antigo: 44%)`);
console.log(`Drible na Área: ${dribbleChance}% (antigo: 47%)`);
console.log(`Passe Medida:   ${passChance}% (antigo: 44%)`);

// Assertivas críticas:
assert(placedChance <= 30 && placedChance >= 22, `Chute colocado deve estar entre 22% e 30% (obtido: ${placedChance}%), nunca 52%!`);
assert(powerChance <= 25 && powerChance >= 16, `Bomba de primeira deve estar entre 16% e 25% (obtido: ${powerChance}%)`);
assert(dribbleChance <= 25 && dribbleChance >= 16, `Drible na área deve estar entre 16% e 25% (obtido: ${dribbleChance}%)`);
assert(passChance <= 25 && passChance >= 15, `Passe na medida deve estar entre 15% e 25% (obtido: ${passChance}%)`);
console.log('✅ Teste 1 passou com sucesso!');

// =========================================================================
// TESTE 2: PROGRESSÃO SUAVE E REALISTA CONFORME O ATLETA EVOLUI
// =========================================================================
console.log('--- Teste 2: Curva de Progressão por OVR e Atributos ---');
const ovrTiers = [
  { label: 'Iniciante (41 OVR / 49 Fin)', ovr: 41, fin: 49 },
  { label: 'Profissional Candango (55 OVR / 58 Fin)', ovr: 55, fin: 58 },
  { label: 'Titular Série B (65 OVR / 68 Fin)', ovr: 65, fin: 68 },
  { label: 'Destaque Série A (75 OVR / 79 Fin)', ovr: 75, fin: 79 },
  { label: 'Craque Europa (85 OVR / 89 Fin)', ovr: 85, fin: 89 },
  { label: 'Lenda Mundial (95 OVR / 97 Fin)', ovr: 95, fin: 97 }
];

let previousChance = 0;
ovrTiers.forEach(t => {
  const c = calcChance({ attrVal: t.fin, athleteOvr: t.ovr, attrWeight: 0.65, baseChance: 17, slope: 0.86, minChance: 15, maxChance: 75 });
  console.log(`  ${t.label.padEnd(42)} -> ${c}%`);
  assert(c > previousChance, `A chance para ${t.label} (${c}%) deve ser maior que o tier anterior (${previousChance}%)`);
  previousChance = c;
});
console.log('✅ Teste 2 (progressão estrita e monótona) passou com sucesso!');

// =========================================================================
// TESTE 3: REGRA NÃO-FÁCIL-DEMAIS (TETO RIGOROSO)
// =========================================================================
console.log('--- Teste 3: Teto Rigoroso Anti-Trivialidade (99 OVR / 99 Attr) ---');
const maxPlaced = calcChance({ attrVal: 99, athleteOvr: 99, attrWeight: 0.65, baseChance: 17, slope: 0.86, minChance: 15, maxChance: 75 });
const maxPower = calcChance({ attrVal: 99, athleteOvr: 99, attrWeight: 0.65, baseChance: 13, slope: 0.84, minChance: 12, maxChance: 72 });
const maxDribble = calcChance({ attrVal: 99, athleteOvr: 99, attrWeight: 0.65, baseChance: 14, slope: 0.85, minChance: 12, maxChance: 73 });
const maxPass = calcChance({ attrVal: 99, athleteOvr: 99, attrWeight: 0.65, baseChance: 15, slope: 0.86, minChance: 14, maxChance: 75 });

console.log(`Max Chute Colocado: ${maxPlaced}% (teto 75%)`);
console.log(`Max Bomba Primeira: ${maxPower}% (teto 72%)`);
console.log(`Max Drible na Área: ${maxDribble}% (teto 73%)`);
console.log(`Max Passe Medida:   ${maxPass}% (teto 75%)`);

assert(maxPlaced <= 75, 'Chute colocado nunca deve ultrapassar 75%');
assert(maxPower <= 72, 'Bomba nunca deve ultrapassar 72%');
assert(maxDribble <= 73, 'Drible nunca deve ultrapassar 73%');
assert(maxPass <= 75, 'Passe nunca deve ultrapassar 75%');
console.log('✅ Teste 3 passou com sucesso!');

// =========================================================================
// TESTE 4: DEFENSOR E GOLEIRO CALIBRADOS
// =========================================================================
console.log('--- Teste 4: Defensores e Goleiros Calibrados ---');
const defNovice = calcChance({ attrVal: 45, athleteOvr: 42, attrWeight: 0.65, baseChance: 16, slope: 0.86, minChance: 14, maxChance: 74 });
const defStar = calcChance({ attrVal: 85, athleteOvr: 84, attrWeight: 0.65, baseChance: 16, slope: 0.86, minChance: 14, maxChance: 74 });
console.log(`Desarme Novato (OVR 42): ${defNovice}%, Desarme Craque (OVR 84): ${defStar}%`);
assert(defNovice <= 28 && defNovice >= 18, 'Desarme de novato deve ser entre 18% e 28%');
assert(defStar >= 55 && defStar <= 70, 'Desarme de craque deve ser entre 55% e 70%');

const gkNovice = calcChance({ attrVal: 45, athleteOvr: 42, attrWeight: 0.65, baseChance: 19, slope: 0.86, minChance: 18, maxChance: 76 });
const gkStar = calcChance({ attrVal: 90, athleteOvr: 88, attrWeight: 0.65, baseChance: 19, slope: 0.86, minChance: 18, maxChance: 76 });
console.log(`GK Segurar Centro Novato: ${gkNovice}%, GK Segurar Centro Craque: ${gkStar}%`);
assert(gkNovice <= 30 && gkNovice >= 22, 'Defesa no centro de novato deve ser entre 22% e 30%');
assert(gkStar >= 60 && gkStar <= 76, 'Defesa no centro de craque deve ser entre 60% e 76%');
console.log('✅ Teste 4 passou com sucesso!');

console.log('🎉 Todos os testes de recalibração do Momento Decisivo do Craque passaram com 100% de sucesso!');
