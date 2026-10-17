const fs = require('fs');

// 1. js/competitions.js
let compCode = fs.readFileSync('js/competitions.js', 'utf8');
if (!compCode.includes("'usa-1'")) {
  const target = `{id:'afc2',continent:'Ásia',country:'AFC',name:'AFC Champions League Two',type:'continental-groups',teams:32,rule:'Fase de grupos regionalizada seguida por mata-mata.'}`;
  const replacement = `{id:'afc2',continent:'Ásia',country:'AFC',name:'AFC Champions League Two',type:'continental-groups',teams:32,rule:'Fase de grupos regionalizada seguida por mata-mata.'},
  {id:'usa-1',continent:'América do Norte',country:'Estados Unidos',name:'Major League Soccer',type:'league',teams:20,rounds:38,promote:0,relegate:0,logo:'img/badges/competitions/usa_1.svg',rule:'Temporada regular com 20 franquias, pontos corridos e decisão da MLS Cup.'}`;
  compCode = compCode.replace(target, replacement);
  fs.writeFileSync('js/competitions.js', compCode, 'utf8');
  console.log('✓ Added usa-1 to js/competitions.js');
} else {
  console.log('- usa-1 already in js/competitions.js');
}

// 2. data/competition_teams.js
let teamsCode = fs.readFileSync('data/competition_teams.js', 'utf8');
const mlsTeams = [
  "Inter Miami",
  "Los Angeles FC",
  "LA Galaxy",
  "Columbus Crew",
  "New York City FC",
  "New York Red Bulls",
  "Seattle Sounders",
  "Atlanta United",
  "FC Cincinnati",
  "Orlando City",
  "Philadelphia Union",
  "Houston Dynamo",
  "Portland Timbers",
  "Austin FC",
  "Sporting Kansas City",
  "Nashville SC",
  "Real Salt Lake",
  "Minnesota United",
  "St. Louis City SC",
  "Chicago Fire"
];

if (!teamsCode.includes("'usa-1'")) {
  const insertMarker = "window.COMPETITION_TEAMS = {";
  const mlsEntry = `window.COMPETITION_TEAMS = {
  'usa-1': ${JSON.stringify(mlsTeams, null, 2)},`;
  teamsCode = teamsCode.replace(insertMarker, mlsEntry);
  fs.writeFileSync('data/competition_teams.js', teamsCode, 'utf8');
  console.log('✓ Added usa-1 to data/competition_teams.js');
} else {
  console.log('- usa-1 already in data/competition_teams.js');
}

// 3. data/international_teams_2026_27.js
let intlCode = fs.readFileSync('data/international_teams_2026_27.js', 'utf8');
if (!intlCode.includes('"usa-1"')) {
  const intlMarker = "window.AFM_INTERNATIONAL_TEAMS_2026_27 = {";
  const intlEntry = `window.AFM_INTERNATIONAL_TEAMS_2026_27 = {
  "usa-1": ${JSON.stringify(mlsTeams, null, 2)},`;
  intlCode = intlCode.replace(intlMarker, intlEntry);
  fs.writeFileSync('data/international_teams_2026_27.js', intlCode, 'utf8');
  console.log('✓ Added usa-1 to data/international_teams_2026_27.js');
} else {
  console.log('- usa-1 already in data/international_teams_2026_27.js');
}
