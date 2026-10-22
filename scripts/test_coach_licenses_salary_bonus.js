// scripts/test_coach_licenses_salary_bonus.js
const fs = require('fs');
const assert = require('assert');
const vm = require('vm');

console.log('🧪 Iniciando testes de Bônus no Salário por Licença CBF & UEFA...');

const scriptCode = fs.readFileSync('js/systems/cup_highlight_ranking_world_and_licenses.js', 'utf8');

const localStorageMock = {
  store: {},
  getItem: function(k) { return this.store[k] || null; },
  setItem: function(k, v) { this.store[k] = String(v); }
};

const context = {
  window: {
    addEventListener: () => {},
    requestAnimationFrame: (fn) => setTimeout(fn, 0)
  },
  document: {
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => ({ id: '', style: {}, innerHTML: '', appendChild: () => {}, querySelector: () => null, querySelectorAll: () => [] }),
    body: { appendChild: () => {} },
    addEventListener: () => {}
  },
  localStorage: localStorageMock,
  console: console,
  norm: (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
};

vm.createContext(context);
vm.runInContext(scriptCode, context);

const LICENSES = context.window.AFM_COACH_LICENSES;
assert(Array.isArray(LICENSES) && LICENSES.length === 6, 'LICENSES deve conter 6 licenças');
console.log('✓ 1. Catálogo de Licenças carregado com 6 níveis (CBF D, C, B, A, PRO e UEFA PRO)');

// Verifica percentuais
const expectedBonuses = {
  cbf_d: 5,
  cbf_c: 10,
  cbf_b: 15,
  cbf_a: 20,
  cbf_pro: 25,
  uefa_pro: 35
};

LICENSES.forEach(lic => {
  assert.strictEqual(lic.salaryBonusPct, expectedBonuses[lic.id], `Bônus de salário incorreto para ${lic.id}`);
  console.log(`  • ${lic.name}: Bônus de Salário = +${lic.salaryBonusPct}% (${lic.salaryBonusLabel})`);
});
console.log('✓ 2. Todos os percentuais de bônus salarial por licença validados');

const getCoachLicensesData = context.window.getCoachLicensesData;
const syncCoachSalaryWithLicenses = context.window.syncCoachSalaryWithLicenses;
assert(typeof getCoachLicensesData === 'function', 'getCoachLicensesData deve ser função');
assert(typeof syncCoachSalaryWithLicenses === 'function', 'syncCoachSalaryWithLicenses deve ser função');

// Teste com licença inicial CBF D
const stateInitial = {
  manager: { license: 'cbf_d' },
  managerSalary: 100000,
  managerBaseSalary: 100000
};

let data = getCoachLicensesData(stateInitial);
assert.strictEqual(data.totalBonusPct, 5, 'CBF D deve conceder +5%');
assert.strictEqual(data.bonusValue, 5000, 'Bônus deve ser 5.000');
assert.strictEqual(data.totalSalary, 105000, 'Salário total deve ser 105.000');
console.log(`✓ 3. Licença Inicial CBF D: Base R$ 100.000 -> +5% (+R$ 5.000) -> Total R$ ${data.totalSalary.toLocaleString('pt-BR')}`);

// Teste com licença CBF C
const stateC = {
  manager: { license: 'cbf_c' },
  managerSalary: 100000,
  managerBaseSalary: 100000
};
data = getCoachLicensesData(stateC);
assert.strictEqual(data.totalBonusPct, 15, 'CBF D (+5%) + CBF C (+10%) deve totalizar +15%');
assert.strictEqual(data.bonusValue, 15000, 'Bônus deve ser 15.000');
assert.strictEqual(data.totalSalary, 115000, 'Salário total deve ser 115.000');
console.log(`✓ 4. Licença CBF C (Estadual): Base R$ 100.000 -> +15% (+R$ 15.000) -> Total R$ ${data.totalSalary.toLocaleString('pt-BR')}`);

// Teste com licença CBF B
const stateB = {
  manager: { license: 'cbf_b' },
  managerSalary: 100000,
  managerBaseSalary: 100000
};
data = getCoachLicensesData(stateB);
assert.strictEqual(data.totalBonusPct, 30, 'CBF D + C + B deve totalizar +30%');
assert.strictEqual(data.totalSalary, 130000, 'Salário total deve ser 130.000');
console.log(`✓ 5. Licença CBF B: Base R$ 100.000 -> +30% (+R$ 30.000) -> Total R$ ${data.totalSalary.toLocaleString('pt-BR')}`);

// Teste com licença CBF A
const stateA = {
  manager: { license: 'cbf_a' },
  managerSalary: 100000,
  managerBaseSalary: 100000
};
data = getCoachLicensesData(stateA);
assert.strictEqual(data.totalBonusPct, 50, 'CBF D + C + B + A deve totalizar +50%');
assert.strictEqual(data.totalSalary, 150000, 'Salário total deve ser 150.000');
console.log(`✓ 6. Licença CBF A (Série A): Base R$ 100.000 -> +50% (+R$ 50.000) -> Total R$ ${data.totalSalary.toLocaleString('pt-BR')}`);

// Teste com licença CBF PRO
const statePro = {
  manager: { license: 'cbf_pro' },
  managerSalary: 100000,
  managerBaseSalary: 100000
};
data = getCoachLicensesData(statePro);
assert.strictEqual(data.totalBonusPct, 75, 'Até CBF PRO deve totalizar +75%');
assert.strictEqual(data.totalSalary, 175000, 'Salário total deve ser 175.000');
console.log(`✓ 7. Licença CBF PRO (Continental): Base R$ 100.000 -> +75% (+R$ 75.000) -> Total R$ ${data.totalSalary.toLocaleString('pt-BR')}`);

// Teste com UEFA PRO (Mundial - Nível Máximo)
const stateUefa = {
  manager: { license: 'uefa_pro' },
  managerSalary: 100000,
  managerBaseSalary: 100000
};
data = getCoachLicensesData(stateUefa);
assert.strictEqual(data.totalBonusPct, 110, 'Todas as 6 licenças devem totalizar +110%');
assert.strictEqual(data.totalSalary, 210000, 'Salário total deve ser 210.000 (mais que o dobro)');
console.log(`✓ 8. Licença UEFA PRO (Mundial): Base R$ 100.000 -> +110% (+R$ 110.000) -> Total R$ ${data.totalSalary.toLocaleString('pt-BR')}`);

// Teste de sincronização com syncCoachSalaryWithLicenses
const stateSyncTest = {
  manager: { license: 'cbf_a' },
  managerSalary: 50000
};
const synced = syncCoachSalaryWithLicenses(stateSyncTest);
assert.strictEqual(synced, 75000, 'Salário sincronizado com base 50k e +50% deve ser 75k');
assert.strictEqual(stateSyncTest.managerSalary, 75000);
assert.strictEqual(stateSyncTest.managerBaseSalary, 50000);
console.log(`✓ 9. syncCoachSalaryWithLicenses atualizou estado: Base R$ 50.000 -> R$ ${stateSyncTest.managerSalary.toLocaleString('pt-BR')}`);

console.log('\n🎉 TODOS OS TESTES DE BÔNUS SALARIAL POR LICENÇA PASSARAM COM 100% DE SUCESSO!');
