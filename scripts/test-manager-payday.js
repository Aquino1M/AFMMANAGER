const fs = require('fs');
const path = require('path');
const vm = require('vm');

const source = fs.readFileSync(path.resolve(__dirname, '../js/game.js'), 'utf8');
const marker = 'function processCoachSalaryOnFirstOfMonth(';
const start = source.indexOf(marker);
if (start < 0) throw new Error('processCoachSalaryOnFirstOfMonth not found');
const open = source.indexOf('{', start);
let depth = 0;
let end = -1;
for (let i = open; i < source.length; i++) {
  if (source[i] === '{') depth++;
  else if (source[i] === '}' && --depth === 0) { end = i + 1; break; }
}
if (end < 0) throw new Error('processCoachSalaryOnFirstOfMonth is incomplete');

let paidMonth = null;
let saves = 0;
const context = {
  state: null,
  window: {
    AFM_LifeAndSharesPro: {
      payMonthlyCoachSalary(gameState) {
        const month = gameState.date.slice(0, 7);
        if (paidMonth === month) return { paid: 0 };
        paidMonth = month;
        gameState.managerMoney = (gameState.managerMoney || 0) + 26250;
        return { paid: 26250 };
      }
    }
  },
  save() { saves++; }
};
const processPayday = vm.runInNewContext(`(${source.slice(start, end)})`, context);
const career = { date: '2027-01-01', managerMoney: 0 };

if (processPayday({ ...career, date: '2027-01-02' }) !== false || saves !== 0) {
  throw new Error('Salary must not be paid or saved outside the first day of a month');
}
if (processPayday(career) !== true || career.managerMoney !== 26250 || saves !== 1) {
  throw new Error('Salary must be credited and saved on the first day of the month');
}
if (processPayday(career) !== false || career.managerMoney !== 26250 || saves !== 1) {
  throw new Error('Re-rendering on the same month must not pay the salary twice');
}

console.log('PASS: salário cai no dia 1, salva a carreira e não duplica ao re-renderizar.');
