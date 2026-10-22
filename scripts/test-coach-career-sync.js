const fs = require('fs');
const path = require('path');
const vm = require('vm');

const storage = new Map();
const localStorage = {
  getItem(key) { return storage.get(key) || null; },
  setItem(key, value) { storage.set(key, String(value)); },
  removeItem(key) { storage.delete(key); }
};
const window = {
  localStorage,
  AFM_NormalizeBankLoans() {},
  syncCoachSalaryWithLicenses(state) {
    state.managerSalary = Number(state.managerSalary) || 26250;
    state.managerPersonal.salary = state.managerSalary;
  }
};
const context = vm.createContext({ window, localStorage, console, Date, Math });

for (const file of ['coach_ranking_pix.js', 'manager_life_and_shares_pro.js']) {
  const source = fs.readFileSync(path.resolve(__dirname, `../js/systems/${file}`), 'utf8');
  vm.runInContext(source, context, { filename: file });
}

const career = {
  managerMoney: 169087,
  managerSalary: 26250,
  coachPrestige: 5,
  managerCareer: { matches: 20, wins: 10, draws: 4, losses: 6 },
  managerPersonal: {
    personalBalance: 0,
    balanceMigrationV1: true,
    prestigeScore: 5,
    careerPoints: 0,
    salary: 26250
  }
};

window.AFM_LifeAndSharesPro.ensureState(career);
if (career.managerPersonal.personalBalance !== 169087 || career.managerMoney !== 169087) {
  throw new Error('A V1 save with a zero personal balance must recover the existing managerMoney balance.');
}
if (career.managerPersonal.prestigeScore !== 10 || career.coachPrestige !== 10) {
  throw new Error('Prestige must be reconstructed from the saved career match record.');
}

const firstPoints = career.managerPersonal.careerPoints;
window.AFM_LifeAndSharesPro.ensureState(career);
if (career.managerPersonal.personalBalance !== 169087 || career.managerPersonal.careerPoints !== firstPoints) {
  throw new Error('Career sync must remain stable after repeated renders.');
}

console.log('PASS: saldo legado recuperado e prestígio recalculado de forma idempotente.');
