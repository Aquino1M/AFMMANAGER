const fs = require('fs');
const gameJs = fs.readFileSync('js/game.js', 'utf8');

const pages = [
  'centralPage',
  'newsMediaPage',
  'calendarPage',
  'myTeamPage',
  'squadPage',
  'marketPage',
  'structurePage',
  'officePage',
  'careerPage',
  'seasonPage',
  'changelogPage',
  'configPage'
];

pages.forEach(p => {
  const idx = gameJs.indexOf('function ' + p);
  if (idx !== -1) {
    const line = gameJs.slice(0, idx).split('\n').length;
    console.log(`${p}: line ${line}`);
  } else {
    console.log(`${p}: NOT FOUND in js/game.js!`);
  }
});
