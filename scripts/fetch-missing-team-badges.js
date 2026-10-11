const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

function loadWindow(files){
  const window = {};
  for(const file of files){
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    vm.runInNewContext(`(function(){${source}\n})();`, { window }, { filename: file });
  }
  return window;
}

const baseFiles = [
  'data/club_badges.js', 'data/club_badges_unverified.js', 'data/club_badges_competitions.js',
  'js/core/club_badges_core.js', 'data/club_badges_verified_2026.js', 'data/club_badges_verified_world.js'
];
const base = loadWindow(baseFiles);
const withOverrides = loadWindow([...baseFiles, 'data/club_badges_verified_overrides.js']);
const competitionsWindow = loadWindow(['js/competitions.js']);
const teamsWindow = loadWindow(['data/competition_teams.js']);
const defs = new Map(competitionsWindow.COMPETITIONS.map(item => [item.id, item]));
const countryAliases = {
  Alemanha: 'Germany', Argentina: 'Argentina', 'Arábia Saudita': 'Saudi Arabia', Bolívia: 'Bolivia', Brasil: 'Brazil',
  Bélgica: 'Belgium', Chile: 'Chile', Catar: 'Qatar', China: 'China', 'Coreia do Sul': 'South Korea',
  Colômbia: 'Colombia', Equador: 'Ecuador', Escócia: 'Scotland', Espanha: 'Spain', França: 'France',
  Inglaterra: 'England', Itália: 'Italy', Japão: 'Japan', Paraguai: 'Paraguay', 'Países Baixos': 'Netherlands',
  Peru: 'Peru', Portugal: 'Portugal', Turquia: 'Turkey', Uruguai: 'Uruguay', Venezuela: 'Venezuela',
  'Emirados Árabes Unidos': 'United Arab Emirates'
};
const clubCountries = {
  patriotas: 'Colombia', cesarvallejo: 'Peru', racingferrol: 'Spain', zaragoza: 'Spain', ulm: 'Germany',
  hearts: 'Scotland', crvenazvezda: 'Serbia', maccabitelaviv: 'Israel', qarabag: 'Azerbaijan',
  dynamokyiv: 'Ukraine', ludogorets: 'Bulgaria', rfs: 'Latvia'
};
const teamSearchNames = { zaragoza: 'Real Zaragoza', ulm: 'SSV Ulm 1846', hearts: 'Heart of Midlothian' };
const teamNameAliases = {
  patriotas: ['patriotasboyaca'], cesarvallejo: ['universidadcesarvallejo'],
  racingferrol: ['racingclubdeferrol'], zaragoza: ['realzaragoza'], ulm: ['ssvulm1846'],
  hearts: ['heartofmidlothian'], ludogorets: ['ludogoretsrazgrad']
};
for(const country of new Set(defs.values().map(item => item.country))){
  if(!['UEFA', 'FIFA', 'CONMEBOL'].includes(country) && !countryAliases[country]){
    throw new Error(`País sem correspondência confirmada no catálogo de escudos: ${country}`);
  }
}
const countries = new Map();

for(const [competitionId, teams] of Object.entries(teamsWindow.COMPETITION_TEAMS || {})){
  const country = countryAliases[defs.get(competitionId)?.country] || defs.get(competitionId)?.country;
  if(!country) continue;
  for(const team of teams){
    if(!countries.has(team)) countries.set(team, new Set());
    countries.get(team).add(country);
  }
}
if(!countries.has('Cienciano')) countries.set('Cienciano', new Set(['Peru']));

function currentFile(name){
  const normalized = withOverrides.normClub(name);
  const compact = normalize(name);
  const value = withOverrides.CLUB_BADGES_VERIFIED_2026_BY_NAME?.[normalized]
    || withOverrides.CLUB_BADGE_ALIASES_VERIFIED_2026?.[normalized]
    || withOverrides.CLUB_BADGES_VERIFIED_WORLD_BY_NAME?.[compact]
    || withOverrides.CLUB_BADGES_LOCAL_INDEX_BY_NAME?.[compact]
    || withOverrides.CLUB_BADGES?.[name]
    || Object.entries(withOverrides.CLUB_BADGES || {}).find(([key]) => normalize(key) === compact)?.[1];
  if(!value) return null;
  const relative = value.startsWith('img/badges/') ? value.slice('img/badges/'.length) : value;
  return fs.existsSync(path.join(root, 'img', 'badges', relative)) ? relative : null;
}

function imageExtension(buffer, contentType){
  if(buffer.subarray(0, 8).toString('hex') === '89504e470d0a1a0a') return 'png';
  if(buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'jpg';
  if(buffer.subarray(0, 4).toString() === 'RIFF' && buffer.subarray(8, 12).toString() === 'WEBP') return 'webp';
  if(contentType?.includes('image/svg+xml') && buffer.toString('utf8', 0, 200).includes('<svg')) return 'svg';
  return null;
}

async function searchTeam(name, allowedCountries){
  const key = normalize(name);
  const query = teamSearchNames[key] || name;
  const url = `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(query)}`;
  let teams;
  for(let attempt = 0; attempt < 3; attempt++){
    const response = await fetch(url);
    const text = await response.text();
    if(response.status === 429){
      await wait(60_000);
      continue;
    }
    try { teams = JSON.parse(text).teams || []; break; }
    catch(error){
      if(attempt === 2) throw new Error(`resposta inválida do catálogo para ${name}`);
      await wait(5000 * (attempt + 1));
    }
  }
  const expectedNames = new Set([key, ...(teamNameAliases[key] || [])]);
  const matches = (teams || []).filter(team => team.strSport === 'Soccer'
    && allowedCountries.has(team.strCountry)
    && expectedNames.has(normalize(team.strTeam))
    && team.strBadge);
  if(matches.length !== 1) return null;
  const team = matches[0];
  const badgeUrl = new URL(team.strBadge);
  if(badgeUrl.protocol !== 'https:' || !['r2.thesportsdb.com', 'www.thesportsdb.com'].includes(badgeUrl.hostname)) return null;
  const imageResponse = await fetch(badgeUrl.href);
  if(!imageResponse.ok) return null;
  const image = Buffer.from(await imageResponse.arrayBuffer());
  const extension = imageExtension(image, imageResponse.headers.get('content-type'));
  if(image.length < 256 || !extension) return null;
  return { team, badgeUrl: badgeUrl.href, image, extension };
}

async function run(){
  const allNames = new Set([...countries.keys(), 'Cienciano']);
  const missing = [...allNames].filter(name => !currentFile(name));
  const results = [];
  const failures = [];
  for(let index = 0; index < missing.length; index++){
    const name = missing[index];
    const countryOverride = clubCountries[normalize(name)];
    const allowedCountries = countryOverride ? new Set([countryOverride]) : countries.get(name) || new Set(['Peru']);
    try {
      const match = await searchTeam(name, allowedCountries);
      if(match){
        const filename = `tsdb-${match.team.idTeam}.${match.extension}`;
        fs.writeFileSync(path.join(root, 'img', 'badges', 'world', filename), match.image);
        results.push({ name, key: normalize(name), country: match.team.strCountry, teamId: match.team.idTeam, file: `world/${filename}`, source: match.badgeUrl });
      } else failures.push(name);
    } catch(error){ failures.push(`${name} (${error.message})`); }
    if((index + 1) % 10 === 0) console.log(`Consultados ${index + 1}/${missing.length}; escudos validados: ${results.length}.`);
    if(index < missing.length - 1) await wait(2500);
  }

  const existingOverrides = Object.fromEntries(Object.entries(withOverrides.CLUB_BADGES_VERIFIED_WORLD_BY_NAME || {})
    .filter(([key, value]) => base.CLUB_BADGES_VERIFIED_WORLD_BY_NAME?.[key] !== value));
  const supplemental = Object.fromEntries(results.map(item => [item.key, item.file]));
  const combined = { ...existingOverrides, ...supplemental };
  const overrideSource = [
    '// Escudos locais verificados: IDs ESPN conhecidos e correspondências exatas por clube/país do TheSportsDB.',
    `window.CLUB_BADGES_VERIFIED_WORLD_BY_NAME = Object.freeze(Object.assign({}, window.CLUB_BADGES_VERIFIED_WORLD_BY_NAME || {}, ${JSON.stringify(combined, null, 2)}));`,
    ''
  ].join('\n');
  fs.writeFileSync(path.join(root, 'data', 'club_badges_verified_overrides.js'), overrideSource, 'utf8');
  const provenancePath = path.join(root, 'data', 'club_badge_provenance.json');
  const previousProvenance = fs.existsSync(provenancePath) ? JSON.parse(fs.readFileSync(provenancePath, 'utf8')) : [];
  const provenanceByName = new Map(previousProvenance.map(item => [item.name, item]));
  for(const item of results) provenanceByName.set(item.name, item);
  fs.writeFileSync(provenancePath, JSON.stringify([...provenanceByName.values()], null, 2) + '\n', 'utf8');

  const unresolved = missing.filter(name => !results.some(item => item.key === normalize(name)) && !currentFile(name));
  console.log(`Clubes sem arquivo antes: ${missing.length}; escudos encontrados e validados: ${results.length}; pendentes: ${unresolved.length}.`);
  if(unresolved.length) console.log(`Sem correspondência exata e país validado: ${unresolved.join(', ')}`);
  fs.writeFileSync(path.join(root, 'data', 'club_badge_fetch_failures.log'), failures.join('\n') + (failures.length ? '\n' : ''), 'utf8');
  if(unresolved.length) process.exitCode = 1;
}

run().catch(error => { console.error(error.message); process.exitCode = 1; });
