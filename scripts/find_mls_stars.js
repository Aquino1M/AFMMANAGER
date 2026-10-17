const fs = require('fs');

const livePlayers = fs.readFileSync('data/players_live.js', 'utf8');

const targets = ['Messi', 'Suárez', 'Suarez', 'Busquets', 'Alba', 'Giroud', 'Lloris', 'Reus', 'Pec'];
targets.forEach(t => {
  const re = new RegExp(`['"][^'"]*${t}[^'"]*['"]`, 'gi');
  const matches = livePlayers.match(re);
  console.log(t, 'matches in players_live.js:', matches ? [...new Set(matches)] : 0);
});
