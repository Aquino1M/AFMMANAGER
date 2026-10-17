const fs = require('fs');

let code = fs.readFileSync('data/players_live.js', 'utf8');

const mlsShirtMap = {
  'Lionel Messi': 10,
  'Luis Suárez': 9,
  'Sergio Busquets': 5,
  'Jordi Alba': 18,
  'Federico Redondo': 55,
  'Drake Callender': 1,
  'Tomás Avilés': 6,
  'Diego Gómez': 8,
  'Leonardo Campana': 8,
  'Olivier Giroud': 9,
  'Hugo Lloris': 1,
  'Denis Bouanga': 99,
  'Cristian Olivera': 25,
  'Timothy Tillman': 11,
  'Marco Reus': 18,
  'Riqui Puig': 10,
  'Gabriel Pec': 11,
  'Joseph Paintsil': 28,
  'Maya Yoshida': 4,
  'Dejan Joveljic': 9,
  'Cucho Hernández': 9,
  'Diego Rossi': 10,
  'Darlington Nagbe': 6,
  'Luciano Acosta': 10,
  'Luca Orellano': 23,
  'Emil Forsberg': 10,
  'Lewis Morgan': 82,
  'Aleksei Miranchuk': 59,
  'Facundo Torres': 10,
  'Sebastián Driussi': 10,
  'Hany Mukhtar': 10,
  'Evander': 10
};

let count = 0;
for (const [name, num] of Object.entries(mlsShirtMap)) {
  const searchPattern = new RegExp(`name:\\s*['"]${name}['"]([\\s\\S]*?)(value:\\s*\\d+)`, 'g');
  if (searchPattern.test(code)) {
    code = code.replace(searchPattern, (match, middle, value) => {
      count++;
      return `name: '${name}'${middle}${value}, number: ${num}`;
    });
  }
}

fs.writeFileSync('data/players_live.js', code, 'utf8');
console.log(`Updated shirt numbers for ${count} MLS stars in data/players_live.js!`);
