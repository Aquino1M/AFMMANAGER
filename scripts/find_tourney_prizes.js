const fs = require('fs');

const files = ['js/core/tournament_engine.js', 'js/systems/competitions_and_awards.js', 'js/systems/trophies_tv_1year_marketing_and_payroll.js'];
files.forEach(f => {
  if (fs.existsSync(f)) {
    const code = fs.readFileSync(f, 'utf8');
    const matches = code.match(/(?:prize|premia|balance|saldo)/gi);
    console.log(f, 'matches:', matches ? matches.length : 0);
    const prizeLines = code.split('\n').filter(l => l.includes('prize') || l.includes('premia') || l.includes('balance +='));
    console.log(f, 'prize lines:', prizeLines);
  }
});
