const fs = require('fs');
const vm = require('vm');

const ctCode = fs.readFileSync('data/competition_teams.js', 'utf8');
const context = { window: {} };
vm.createContext(context);
vm.runInContext(ctCode, context);

const ct = context.window.COMPETITION_TEAMS || {};
['ucl', 'uel', 'uecl', 'afc-el', 'afc2', 'cwc', 'lib', 'sud'].forEach(id => {
  console.log(id, 'in COMPETITION_TEAMS:', ct[id] ? `${ct[id].length} teams: ${ct[id].slice(0, 5).join(', ')}...` : 'not found');
});
