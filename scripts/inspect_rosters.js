const fs = require('fs');

const content = fs.readFileSync('data/players_live.js', 'utf8');
const sandbox = {};
eval(content.replace('window.LIVE_PLAYERS =', 'sandbox.LIVE_PLAYERS ='));

const players = sandbox.LIVE_PLAYERS || [];
console.log('Total players in LIVE_PLAYERS:', players.length);

const clubCounts = {};
players.forEach(p => {
  clubCounts[p.club] = (clubCounts[p.club] || 0) + 1;
});

console.log('Total clubs represented:', Object.keys(clubCounts).length);
console.log('\nTop clubs by player count:');
Object.entries(clubCounts)
  .sort((a,b) => b[1] - a[1])
  .slice(0, 30)
  .forEach(([club, count]) => {
    console.log(`- ${club}: ${count} players`);
  });

console.log('\nSample notable players:');
const checkNames = [
  'Neymar', 'Mbappé', 'Kylian Mbappé', 'Endrick', 'Thiago Silva', 'Philippe Coutinho',
  'Coutinho', 'Gabriel Barbosa', 'Memphis Depay', 'Luiz Henrique', 'Thiago Almada',
  'Estêvão', 'Vitor Roque', 'Suárez', 'Luis Suárez', 'Messi', 'Lionel Messi',
  'Cristiano Ronaldo', 'Haaland', 'Vinícius Júnior', 'Rodrygo', 'Bellingham',
  'Lamine Yamal', 'Gerson', 'Arrascaeta', 'Pedro', 'Payet', 'Veiga', 'Hulk', 'Paulinho'
];

checkNames.forEach(name => {
  const found = players.filter(p => p.name.toLowerCase().includes(name.toLowerCase()));
  if (found.length) {
    found.forEach(f => console.log(`  * ${f.name} -> Club: ${f.club}, Age: ${f.age}, Pos: ${f.pos}, FC: ${f.fc}, Pot: ${f.potential}, Val: ${f.value}`));
  } else {
    console.log(`  * ${name}: NOT FOUND`);
  }
});
