const fs = require('fs');
const path = require('path');

console.log('=== Building 2026 Unified Database with Anti-Homonym System & MLS ===');

function norm(str) {
  return String(str || '').toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function normSlug(str) {
  return norm(str).replace(/[^a-z0-9]/g, '_');
}

// 1. Load All Source Datasets
const scrapedAB = JSON.parse(fs.readFileSync('scripts/tm_scraped_squads.json', 'utf8'));
let scrapedC = {};
try {
  scrapedC = JSON.parse(fs.readFileSync('scripts/tm_scraped_serie_c.json', 'utf8'));
} catch (e) {}

const interMiamiSquad = JSON.parse(fs.readFileSync('scripts/inter_miami_squad.json', 'utf8'));
let mlsSquads = {};
try {
  mlsSquads = JSON.parse(fs.readFileSync('scripts/mls_scraped_squads.json', 'utf8'));
} catch (e) {}

// Load current players_live.js to preserve Série D and existing world clubs
global.window = {};
eval(fs.readFileSync('data/players_live.js', 'utf8'));
const currentLivePlayers = global.window.LIVE_PLAYERS || [];

// Helper to check if local photo exists
function getValidPhoto(p) {
  if (p.photo && fs.existsSync(p.photo)) return p.photo;
  if (p.tmId) {
    const tmPath = `img/players/tm_${p.tmId}.jpg`;
    if (fs.existsSync(tmPath)) return tmPath;
  }
  return null;
}

// Master player map: club::normName -> player
const masterSquadMap = new Map();

function registerPlayer(p) {
  if (!p || !p.name || !p.club) return;
  const clubNorm = norm(p.club);
  const nameNorm = norm(p.name);
  const key = `${clubNorm}::${nameNorm}`;

  const clean = {
    name: p.name.trim(),
    club: p.club.trim(),
    country: p.country || 'Brasil',
    pos: p.pos || 'CM',
    age: Number(p.age) || 24,
    fc: Number(p.fc) || 70,
    pes: Number(p.pes) || 70,
    potential: Number(p.potential) || (Number(p.fc) || 70),
    value: Number(p.value) || 1.0
  };

  if (p.number !== undefined && p.number !== null && !isNaN(Number(p.number))) {
    clean.number = Number(p.number);
  }

  if (p.tmId) clean.tmId = String(p.tmId);

  const photo = getValidPhoto(p);
  if (photo) clean.photo = photo;

  masterSquadMap.set(key, clean);
}

// A. First register all existing players (baseline: Série D, world clubs)
for (const p of currentLivePlayers) {
  // Skip old Inter Miami, LA Galaxy, Los Angeles FC (we replace with full authentic squads)
  const cNorm = norm(p.club);
  if (cNorm === 'inter miami' || cNorm === 'la galaxy' || cNorm === 'los angeles fc') continue;
  registerPlayer(p);
}

// B. Overwrite / merge Série A and Série B with authentic Transfermarkt data
for (const [club, squad] of Object.entries(scrapedAB)) {
  for (const p of squad) {
    registerPlayer(p);
  }
}

// C. Merge Série C scraped data
for (const [club, squad] of Object.entries(scrapedC)) {
  for (const p of squad) {
    registerPlayer(p);
  }
}

// D. Add Inter Miami 36-player authentic squad with accurate star data
for (const p of interMiamiSquad) {
  registerPlayer(p);
}

// Inter Miami Star Details
registerPlayer({
  name: 'Lionel Messi',
  club: 'Inter Miami',
  country: 'Argentina',
  pos: 'RW',
  age: 39,
  fc: 88,
  pes: 88,
  potential: 88,
  value: 35,
  number: 10,
  tmId: '28003',
  photo: 'img/players/tm_28003.jpg'
});
registerPlayer({
  name: 'Luis Suárez',
  club: 'Inter Miami',
  country: 'Uruguai',
  pos: 'ST',
  age: 39,
  fc: 82,
  pes: 82,
  potential: 82,
  value: 4,
  number: 9,
  tmId: '44352',
  photo: 'img/players/tm_44352.jpg'
});
registerPlayer({
  name: 'Sergio Busquets',
  club: 'Inter Miami',
  country: 'Espanha',
  pos: 'DM',
  age: 38,
  fc: 81,
  pes: 81,
  potential: 81,
  value: 3,
  number: 5,
  tmId: '65230',
  photo: 'img/players/tm_65230.jpg'
});
registerPlayer({
  name: 'Jordi Alba',
  club: 'Inter Miami',
  country: 'Espanha',
  pos: 'LB',
  age: 37,
  fc: 80,
  pes: 80,
  potential: 80,
  value: 3,
  number: 18,
  tmId: '69751',
  photo: 'img/players/tm_69751.jpg'
});
registerPlayer({
  name: 'Drake Callender',
  club: 'Inter Miami',
  country: 'Estados Unidos',
  pos: 'GK',
  age: 28,
  fc: 74,
  pes: 74,
  potential: 76,
  value: 2.5,
  number: 1,
  tmId: '723561',
  photo: 'img/players/tm_723561.jpg'
});
registerPlayer({
  name: 'Tomás Avilés',
  club: 'Inter Miami',
  country: 'Argentina',
  pos: 'CB',
  age: 22,
  fc: 74,
  pes: 74,
  potential: 81,
  value: 5,
  number: 6,
  tmId: '1007387',
  photo: 'img/players/tm_1007387.jpg'
});
registerPlayer({
  name: 'Federico Redondo',
  club: 'Inter Miami',
  country: 'Argentina',
  pos: 'DM',
  age: 23,
  fc: 76,
  pes: 76,
  potential: 84,
  value: 8,
  number: 55,
  tmId: '994254',
  photo: 'img/players/tm_994254.jpg'
});
registerPlayer({
  name: 'Diego Gómez',
  club: 'Inter Miami',
  country: 'Paraguai',
  pos: 'CM',
  age: 23,
  fc: 76,
  pes: 76,
  potential: 83,
  value: 8,
  number: 8,
  tmId: '1015246',
  photo: 'img/players/tm_1015246.jpg'
});
registerPlayer({
  name: 'Leonardo Campana',
  club: 'Inter Miami',
  country: 'Equador',
  pos: 'ST',
  age: 25,
  fc: 75,
  pes: 75,
  potential: 78,
  value: 4,
  number: 19,
  tmId: '819603',
  photo: 'img/players/tm_819603.jpg'
});
registerPlayer({
  name: 'Robert Taylor',
  club: 'Inter Miami',
  country: 'Finlândia',
  pos: 'LW',
  age: 31,
  fc: 73,
  pes: 73,
  potential: 73,
  value: 1.5,
  number: 16,
  tmId: '255901',
  photo: 'img/players/tm_255901.jpg'
});
registerPlayer({
  name: 'Matías Rojas',
  club: 'Inter Miami',
  country: 'Paraguai',
  pos: 'AM',
  age: 29,
  fc: 76,
  pes: 76,
  potential: 77,
  value: 4,
  number: 7,
  tmId: '216683',
  photo: 'img/players/tm_216683.jpg'
});
registerPlayer({
  name: 'Facundo Farías',
  club: 'Inter Miami',
  country: 'Argentina',
  pos: 'AM',
  age: 23,
  fc: 75,
  pes: 75,
  potential: 82,
  value: 5,
  number: 11,
  tmId: '744586',
  photo: 'img/players/tm_744586.jpg'
});
registerPlayer({
  name: 'Marcelo Weigandt',
  club: 'Inter Miami',
  country: 'Argentina',
  pos: 'RB',
  age: 26,
  fc: 74,
  pes: 74,
  potential: 76,
  value: 2,
  number: 57,
  tmId: '636207',
  photo: 'img/players/tm_636207.jpg'
});

// E. Add LA Galaxy and Los Angeles FC
for (const [club, squad] of Object.entries(mlsSquads)) {
  for (const p of squad) {
    registerPlayer(p);
  }
}

// F. Explicit Fixes for Requested Stars & Key Rosters:

// 1. Santos: Neymar Jr (#10, tmId 68290)
registerPlayer({
  name: 'Neymar Jr',
  club: 'Santos',
  country: 'Brasil',
  pos: 'LW',
  age: 34,
  fc: 88,
  pes: 88,
  potential: 88,
  value: 30,
  number: 10,
  tmId: '68290',
  photo: 'img/players/tm_68290.jpg'
});
registerPlayer({
  name: 'Neymar',
  club: 'Santos',
  country: 'Brasil',
  pos: 'LW',
  age: 34,
  fc: 88,
  pes: 88,
  potential: 88,
  value: 30,
  number: 10,
  tmId: '68290',
  photo: 'img/players/tm_68290.jpg'
});

// 2. Chelsea: Estêvão (#41, tmId 1056993)
registerPlayer({
  name: 'Estêvão',
  club: 'Chelsea',
  country: 'Brasil',
  pos: 'RW',
  age: 19,
  fc: 83,
  pes: 83,
  potential: 93,
  value: 60,
  number: 41,
  tmId: '1056993',
  photo: 'img/players/tm_1056993.jpg'
});

// 3. Cruzeiro: Matheus Pereira (#10, tmId 225984) & Fabrício Bruno (#25, tmId 432773)
registerPlayer({
  name: 'Matheus Pereira',
  club: 'Cruzeiro',
  country: 'Brasil',
  pos: 'AM',
  age: 30,
  fc: 79,
  pes: 79,
  potential: 79,
  value: 14,
  number: 10,
  tmId: '225984',
  photo: 'img/players/tm_225984.jpg'
});
registerPlayer({
  name: 'Fabrício Bruno',
  club: 'Cruzeiro',
  country: 'Brasil',
  pos: 'CB',
  age: 30,
  fc: 79,
  pes: 79,
  potential: 79,
  value: 8,
  number: 25,
  tmId: '432773',
  photo: 'img/players/tm_432773.jpg'
});

// 4. Bragantino: Fabrício (#1, GK, tmId 722457)
registerPlayer({
  name: 'Fabrício',
  club: 'Bragantino',
  country: 'Brasil',
  pos: 'GK',
  age: 26,
  fc: 71,
  pes: 71,
  potential: 74,
  value: 1.5,
  number: 1,
  tmId: '722457',
  photo: 'img/players/tm_722457.jpg'
});

// 5. Figueirense: Fabrício (#12, GK, tmId 150479)
registerPlayer({
  name: 'Fabrício',
  club: 'Figueirense',
  country: 'Brasil',
  pos: 'GK',
  age: 40,
  fc: 66,
  pes: 66,
  potential: 66,
  value: 0.3,
  number: 12,
  tmId: '150479',
  photo: 'img/players/tm_150479.jpg'
});

// 6. Corinthians: Purge false players and ensure 100% real current roster
const corinthiansBanned = new Set([
  'matheus pereira',
  'fabrizio angileri',
  'jesse lingard',
  'zakaria labyad'
]);

for (const [key] of masterSquadMap.entries()) {
  if (key.startsWith('corinthians::')) {
    const pName = key.replace('corinthians::', '');
    if (corinthiansBanned.has(pName)) {
      masterSquadMap.delete(key);
      console.log(`Purged invalid player from Corinthians: ${pName}`);
    }
  }
}

// 7. Memphis Depay (Corinthians #10)
registerPlayer({
  name: 'Memphis Depay',
  club: 'Corinthians',
  country: 'Holanda',
  pos: 'ST',
  age: 32,
  fc: 80,
  pes: 80,
  potential: 80,
  value: 8,
  number: 10,
  tmId: '167850',
  photo: 'img/players/bra_a/corinthians/memphis_depay.png'
});

// 8. World Stars & Craques Mundiais (Ratings >= 85 & Icons)
const worldStarsData = [
  { name: 'Erling Haaland', club: 'Manchester City', country: 'Noruega', pos: 'ST', age: 26, fc: 91, pes: 91, potential: 93, value: 200, number: 9, tmId: '418560', photo: 'img/players/tm_418560.jpg' },
  { name: 'Kylian Mbappé', club: 'Real Madrid', country: 'França', pos: 'ST', age: 27, fc: 91, pes: 91, potential: 92, value: 180, number: 9, tmId: '342229', photo: 'img/players/tm_342229.jpg' },
  { name: 'Vinicius Jr', club: 'Real Madrid', country: 'Brasil', pos: 'LW', age: 26, fc: 91, pes: 91, potential: 93, value: 200, number: 7, tmId: '371998', photo: 'img/players/tm_371998.jpg' },
  { name: 'Jude Bellingham', club: 'Real Madrid', country: 'Inglaterra', pos: 'AM', age: 23, fc: 90, pes: 90, potential: 94, value: 180, number: 5, tmId: '581678', photo: 'img/players/tm_581678.jpg' },
  { name: 'Rodri', club: 'Manchester City', country: 'Espanha', pos: 'DM', age: 30, fc: 91, pes: 91, potential: 91, value: 130, number: 16, tmId: '357565', photo: 'img/players/tm_357565.jpg' },
  { name: 'Kevin De Bruyne', club: 'Manchester City', country: 'Bélgica', pos: 'AM', age: 35, fc: 89, pes: 89, potential: 89, value: 40, number: 17, tmId: '88755', photo: 'img/players/tm_88755.jpg' },
  { name: 'Phil Foden', club: 'Manchester City', country: 'Inglaterra', pos: 'AM', age: 26, fc: 88, pes: 88, potential: 91, value: 150, number: 47, tmId: '406635', photo: 'img/players/tm_406635.jpg' },
  { name: 'Harry Kane', club: 'Bayern München', country: 'Inglaterra', pos: 'ST', age: 33, fc: 90, pes: 90, potential: 90, value: 100, number: 9, tmId: '132098', photo: 'img/players/tm_132098.jpg' },
  { name: 'Jamal Musiala', club: 'Bayern München', country: 'Alemanha', pos: 'AM', age: 23, fc: 88, pes: 88, potential: 93, value: 130, number: 42, tmId: '580195', photo: 'img/players/tm_580195.jpg' },
  { name: 'Joshua Kimmich', club: 'Bayern München', country: 'Alemanha', pos: 'CM', age: 31, fc: 87, pes: 87, potential: 87, value: 50, number: 6, tmId: '161056', photo: 'img/players/tm_161056.jpg' },
  { name: 'Manuel Neuer', club: 'Bayern München', country: 'Alemanha', pos: 'GK', age: 40, fc: 85, pes: 85, potential: 85, value: 4, number: 1, tmId: '17259', photo: 'img/players/tm_17259.jpg' },
  { name: 'Robert Lewandowski', club: 'FC Barcelona', country: 'Polônia', pos: 'ST', age: 38, fc: 88, pes: 88, potential: 88, value: 15, number: 9, tmId: '38253', photo: 'img/players/tm_38253.jpg' },
  { name: 'Lamine Yamal', club: 'FC Barcelona', country: 'Espanha', pos: 'RW', age: 19, fc: 86, pes: 86, potential: 95, value: 150, number: 19, tmId: '937958', photo: 'img/players/tm_937958.jpg' },
  { name: 'Raphinha', club: 'FC Barcelona', country: 'Brasil', pos: 'LW', age: 29, fc: 86, pes: 86, potential: 86, value: 60, number: 11, tmId: '411295', photo: 'img/players/tm_411295.jpg' },
  { name: 'Pedri', club: 'FC Barcelona', country: 'Espanha', pos: 'CM', age: 23, fc: 87, pes: 87, potential: 92, value: 80, number: 8, tmId: '683840', photo: 'img/players/tm_683840.jpg' },
  { name: 'Rodrygo', club: 'Real Madrid', country: 'Brasil', pos: 'RW', age: 25, fc: 87, pes: 87, potential: 90, value: 110, number: 11, tmId: '412363', photo: 'img/players/tm_412363.jpg' },
  { name: 'Federico Valverde', club: 'Real Madrid', country: 'Uruguai', pos: 'CM', age: 28, fc: 88, pes: 88, potential: 89, value: 130, number: 8, tmId: '369081', photo: 'img/players/tm_369081.jpg' },
  { name: 'Eduardo Camavinga', club: 'Real Madrid', country: 'França', pos: 'CM', age: 23, fc: 86, pes: 86, potential: 91, value: 100, number: 6, tmId: '640428', photo: 'img/players/tm_640428.jpg' },
  { name: 'Thibaut Courtois', club: 'Real Madrid', country: 'Bélgica', pos: 'GK', age: 34, fc: 89, pes: 89, potential: 89, value: 28, number: 1, tmId: '108390', photo: 'img/players/tm_108390.jpg' },
  { name: 'Cole Palmer', club: 'Chelsea', country: 'Inglaterra', pos: 'AM', age: 24, fc: 87, pes: 87, potential: 91, value: 90, number: 20, tmId: '568177', photo: 'img/players/tm_568177.jpg' },
  { name: 'Mohamed Salah', club: 'Liverpool', country: 'Egito', pos: 'RW', age: 34, fc: 89, pes: 89, potential: 89, value: 55, number: 11, tmId: '148455', photo: 'img/players/tm_148455.jpg' },
  { name: 'Virgil van Dijk', club: 'Liverpool', country: 'Holanda', pos: 'CB', age: 35, fc: 89, pes: 89, potential: 89, value: 30, number: 4, tmId: '139208', photo: 'img/players/tm_139208.jpg' },
  { name: 'Alisson', club: 'Liverpool', country: 'Brasil', pos: 'GK', age: 33, fc: 89, pes: 89, potential: 89, value: 28, number: 1, tmId: '105470', photo: 'img/players/tm_105470.jpg' },
  { name: 'Ederson', club: 'Manchester City', country: 'Brasil', pos: 'GK', age: 33, fc: 88, pes: 88, potential: 88, value: 35, number: 31, tmId: '238223', photo: 'img/players/tm_238223.jpg' },
  { name: 'Bukayo Saka', club: 'Arsenal', country: 'Inglaterra', pos: 'RW', age: 25, fc: 87, pes: 87, potential: 90, value: 140, number: 7, tmId: '433177', photo: 'img/players/tm_433177.jpg' },
  { name: 'Martin Ødegaard', club: 'Arsenal', country: 'Noruega', pos: 'AM', age: 27, fc: 89, pes: 89, potential: 90, value: 110, number: 8, tmId: '316264', photo: 'img/players/tm_316264.jpg' },
  { name: 'William Saliba', club: 'Arsenal', country: 'França', pos: 'CB', age: 25, fc: 87, pes: 87, potential: 90, value: 80, number: 2, tmId: '495666', photo: 'img/players/tm_495666.jpg' },
  { name: 'Florian Wirtz', club: 'Bayer Leverkusen', country: 'Alemanha', pos: 'AM', age: 23, fc: 88, pes: 88, potential: 92, value: 130, number: 10, tmId: '598577', photo: 'img/players/tm_598577.jpg' },
  { name: 'Lautaro Martínez', club: 'Inter', country: 'Argentina', pos: 'ST', age: 29, fc: 89, pes: 89, potential: 89, value: 110, number: 10, tmId: '406625', photo: 'img/players/tm_406625.jpg' },
  { name: 'Cristiano Ronaldo', club: 'Al-Nassr', country: 'Portugal', pos: 'ST', age: 41, fc: 86, pes: 86, potential: 86, value: 12, number: 7, tmId: '8198', photo: 'img/players/tm_8198.jpg' }
];

worldStarsData.forEach(ws => registerPlayer(ws));

// Convert Map back to array
const finalPlayers = Array.from(masterSquadMap.values());
console.log(`Total Compiled Master Players: ${finalPlayers.length}`);

// 2. Identify All Homonyms
const nameToClubs = new Map();
for (const p of finalPlayers) {
  const n = norm(p.name);
  if (!nameToClubs.has(n)) nameToClubs.set(n, new Set());
  nameToClubs.get(n).add(p.club);
}

const ambiguousNames = new Set();
for (const [name, clubs] of nameToClubs.entries()) {
  if (clubs.size > 1) {
    ambiguousNames.add(name);
  }
}

// ALWAYS enforce explicit homonyms that are known across Brazilian & international football
const explicitHomonyms = [
  'matheus pereira', 'fabricio', 'dudu', 'wallace', 'juninho', 'allan',
  'gabriel', 'lucas', 'pedro', 'victor', 'danilo', 'gustavo', 'matheuzinho',
  'diego', 'rafael', 'bruno', 'andre', 'felipe', 'rodrigo', 'henrique',
  'leandro', 'tiago', 'marcelo', 'alex', 'eduardo', 'paulo', 'carlos'
];
explicitHomonyms.forEach(name => ambiguousNames.add(norm(name)));

console.log(`Identified ${ambiguousNames.size} ambiguous player names across different clubs.`);

// 3. Generate data/player_photos_modular.js
const photoMappings = {};

// Register all verified photos
for (const p of finalPlayers) {
  if (!p.photo) continue;
  const club = p.club;
  const name = p.name;
  const normN = norm(name);

  // Scoped key: "Club::Player Name"
  photoMappings[`${club}::${name}`] = p.photo;
  photoMappings[`${club}::${normN}`] = p.photo;
  photoMappings[`${norm(club)}::${normN}`] = p.photo;

  // Pitch card short names (e.g. SOUZA, FAGNER, MESSI, SUÁREZ, DEPAY, PEREIRA)
  const parts = name.trim().split(/\s+/);
  const surname = parts[parts.length - 1].toUpperCase();
  photoMappings[`${club}::${surname}`] = p.photo;
  photoMappings[`${norm(club)}::${norm(surname)}` ] = p.photo;

  // Global key: ONLY IF the name is NOT an ambiguous homonym!
  if (!ambiguousNames.has(normN)) {
    photoMappings[name] = p.photo;
    photoMappings[normN] = p.photo;
  }
}

// Explicit pitch card aliases for key stars
photoMappings['Corinthians::DEPAY'] = 'img/players/bra_a/corinthians/memphis_depay.png';
photoMappings['Corinthians::SOUZA'] = 'img/players/tm_574901.jpg';
photoMappings['Corinthians::GARRO'] = 'img/players/tm_565009.jpg';
photoMappings['Corinthians::BIDU'] = 'img/players/tm_670021.jpg';
photoMappings['Cruzeiro::PEREIRA'] = 'img/players/tm_225984.jpg';
photoMappings['Cruzeiro::MATHEUS PEREIRA'] = 'img/players/tm_225984.jpg';
photoMappings['Inter Miami::MESSI'] = 'img/players/tm_28003.jpg';
photoMappings['Inter Miami::SUÁREZ'] = 'img/players/tm_44352.jpg';
photoMappings['Inter Miami::BUSQUETS'] = 'img/players/tm_65230.jpg';
photoMappings['Inter Miami::ALBA'] = 'img/players/tm_69751.jpg';
photoMappings['LA Galaxy::REUS'] = 'img/players/tm_35207.jpg';
photoMappings['LA Galaxy::PUIG'] = 'img/players/tm_331511.jpg';
photoMappings['LA Galaxy::PEC'] = 'img/players/tm_703321.jpg';
photoMappings['Los Angeles FC::GIROUD'] = 'img/players/tm_82442.jpg';
photoMappings['Los Angeles FC::LLORIS'] = 'img/players/tm_17965.jpg';
photoMappings['Santos::NEYMAR'] = 'img/players/tm_68290.jpg';
photoMappings['Chelsea::ESTÊVÃO'] = 'img/players/tm_1056993.jpg';
photoMappings['Manchester City::HAALAND'] = 'img/players/tm_418560.jpg';
photoMappings['Manchester City::RODRI'] = 'img/players/tm_357565.jpg';
photoMappings['Manchester City::DE BRUYNE'] = 'img/players/tm_88755.jpg';
photoMappings['Manchester City::FODEN'] = 'img/players/tm_406635.jpg';
photoMappings['Manchester City::EDERSON'] = 'img/players/tm_238223.jpg';
photoMappings['Real Madrid::MBAPPÉ'] = 'img/players/tm_342229.jpg';
photoMappings['Real Madrid::MBAPPE'] = 'img/players/tm_342229.jpg';
photoMappings['Real Madrid::VINICIUS JR'] = 'img/players/tm_371998.jpg';
photoMappings['Real Madrid::BELLINGHAM'] = 'img/players/tm_581678.jpg';
photoMappings['Real Madrid::VALVERDE'] = 'img/players/tm_369081.jpg';
photoMappings['Real Madrid::RODRYGO'] = 'img/players/tm_412363.jpg';
photoMappings['Real Madrid::CAMAVINGA'] = 'img/players/tm_640428.jpg';
photoMappings['Real Madrid::COURTOIS'] = 'img/players/tm_108390.jpg';
photoMappings['FC Barcelona::LEWANDOWSKI'] = 'img/players/tm_38253.jpg';
photoMappings['FC Barcelona::YAMAL'] = 'img/players/tm_937958.jpg';
photoMappings['FC Barcelona::RAPHINHA'] = 'img/players/tm_411295.jpg';
photoMappings['FC Barcelona::PEDRI'] = 'img/players/tm_683840.jpg';
photoMappings['Bayern München::KANE'] = 'img/players/tm_132098.jpg';
photoMappings['Bayern München::MUSIALA'] = 'img/players/tm_580195.jpg';
photoMappings['Bayern München::KIMMICH'] = 'img/players/tm_161056.jpg';
photoMappings['Bayern München::NEUER'] = 'img/players/tm_17259.jpg';
photoMappings['Liverpool::SALAH'] = 'img/players/tm_148455.jpg';
photoMappings['Liverpool::VAN DIJK'] = 'img/players/tm_139208.jpg';
photoMappings['Liverpool::ALISSON'] = 'img/players/tm_105470.jpg';
photoMappings['Arsenal::SAKA'] = 'img/players/tm_433177.jpg';
photoMappings['Arsenal::ØDEGAARD'] = 'img/players/tm_316264.jpg';
photoMappings['Arsenal::ODEGAARD'] = 'img/players/tm_316264.jpg';
photoMappings['Arsenal::SALIBA'] = 'img/players/tm_495666.jpg';
photoMappings['Bayer Leverkusen::WIRTZ'] = 'img/players/tm_598577.jpg';
photoMappings['Inter::MARTÍNEZ'] = 'img/players/tm_406625.jpg';
photoMappings['Inter::MARTINEZ'] = 'img/players/tm_406625.jpg';
photoMappings['Al-Nassr::RONALDO'] = 'img/players/tm_8198.jpg';

let modularContent = `// AFM MANAGER 2027 — MAPEAMENTO DE FOTOS VERIFICADAS & ANTI-HOMÔNIMOS
// Gerado automaticamente com fotos autênticas do Transfermarkt e isolamento por clube.

window.AMBIGUOUS_PLAYER_NAMES = new Set(${JSON.stringify(Array.from(ambiguousNames), null, 2)});

window.PLAYER_PHOTOS = Object.assign(window.PLAYER_PHOTOS || {}, ${JSON.stringify(photoMappings, null, 2)});
`;

fs.writeFileSync('data/player_photos_modular.js', modularContent, 'utf8');
console.log('Successfully wrote data/player_photos_modular.js');

// 4. Write data/players_live.js
let liveContent = `/* Banco de dados unificado de jogadores AFM 2026/2027 */\nwindow.LIVE_PLAYERS = [\n`;
for (const p of finalPlayers) {
  const parts = [
    `name:${JSON.stringify(p.name)}`,
    `club:${JSON.stringify(p.club)}`,
    `country:${JSON.stringify(p.country)}`,
    `pos:${JSON.stringify(p.pos)}`,
    `age:${p.age}`,
    `fc:${p.fc}`,
    `pes:${p.pes}`,
    `potential:${p.potential}`,
    `value:${p.value}`
  ];
  if (p.number !== undefined && p.number !== null) parts.push(`number:${p.number}`);
  if (p.tmId) parts.push(`tmId:${JSON.stringify(p.tmId)}`);
  if (p.photo) parts.push(`photo:${JSON.stringify(p.photo)}`);
  liveContent += `  {${parts.join(',')}},\n`;
}
liveContent += `];\n`;

fs.writeFileSync('data/players_live.js', liveContent, 'utf8');
console.log('Successfully wrote data/players_live.js');
