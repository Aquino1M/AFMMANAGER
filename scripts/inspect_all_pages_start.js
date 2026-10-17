const fs = require('fs');

const code = fs.readFileSync('js/game.js', 'utf8');

const pages = [
  { name: 'centralPage', line: 21921 },
  { name: 'newsMediaPage', line: 4927 },
  { name: 'calendarPage', line: 22913 },
  { name: 'myTeamPage', line: 23019 },
  { name: 'squadPage', line: 23667 },
  { name: 'marketPage', line: 23863 },
  { name: 'structurePage', line: 25139 },
  { name: 'officePage', line: 26016 },
  { name: 'careerPage', line: 21879 },
  { name: 'seasonPage', line: 27649 },
  { name: 'changelogPage', line: 4061 },
  { name: 'configPage', line: 28082 }
];

pages.forEach(p => {
  const funcStart = code.indexOf(`function ${p.name}`);
  if (funcStart !== -1) {
    const snippet = code.substring(funcStart, funcStart + 400).replace(/\r?\n/g, ' ');
    console.log(`=== ${p.name} ===`);
    console.log(snippet.slice(0, 250));
  }
});
