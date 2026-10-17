const fs = require('fs');
const content = fs.readFileSync('data/players_live.js', 'utf8');

['Lionel Messi', 'Luis Suárez', 'Sergio Busquets', 'Jordi Alba'].forEach(name => {
  const idx = content.indexOf(name);
  if (idx !== -1) {
    console.log(content.substring(idx - 20, idx + 200));
  } else {
    console.log(name, 'not found');
  }
});
