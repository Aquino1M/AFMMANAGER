const fs = require('fs');
const vm = require('vm');

const compTeamsContent = fs.readFileSync('data/competition_teams.js', 'utf8');
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(compTeamsContent, sandbox);

const ct = sandbox.window.COMPETITION_TEAMS;
const brClubs = new Set();
for (const [k, v] of Object.entries(ct)) {
  if (k.startsWith('bra-') || k === 'lib' || k === 'sud') {
    v.forEach(c => brClubs.add(c));
  }
}
console.log('Total Brazilian/South American clubs in competition_teams:', brClubs.size);
fs.writeFileSync('scripts/extracted_clubs.json', JSON.stringify(Array.from(brClubs).sort(), null, 2), 'utf8');
console.log('Saved to scripts/extracted_clubs.json');
