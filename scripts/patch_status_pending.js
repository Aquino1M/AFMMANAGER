const fs = require('fs');
const path = require('path');

const gameJsPath = path.join(__dirname, '..', 'js', 'game.js');
let code = fs.readFileSync(gameJsPath, 'utf8');

code = code.replace(
  "status: 'future',\r\n        daysDiff: diffDays,\r\n        pending:",
  "status: 'other_competitions_pending',\r\n        daysDiff: diffDays,\r\n        pending:"
);

code = code.replace(
  "status: 'future', pending: pendingOtherCompetitions",
  "status: 'other_competitions_pending', pending: pendingOtherCompetitions"
);

fs.writeFileSync(gameJsPath, code, 'utf8');
console.log('Updated status to other_competitions_pending successfully');
