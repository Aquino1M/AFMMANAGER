const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');

const root = path.resolve(__dirname, '..');
const sources = {
  'arg-1': 'arg.1', 'arg-2': 'arg.2',
  'eng-1': 'eng.1', 'eng-2': 'eng.2', 'eng-3': 'eng.3',
  'esp-1': 'esp.1', 'esp-2': 'esp.2', 'ita-1': 'ita.1', 'ita-2': 'ita.2',
  'ger-1': 'ger.1', 'ger-2': 'ger.2', 'fra-1': 'fra.1', 'fra-2': 'fra.2',
  'por-1': 'por.1', 'ned-1': 'ned.1', 'ned-2': 'ned.2',
  'bel-1': 'bel.1', 'tur-1': 'tur.1', 'sco-1': 'sco.1',
  'ksa-1': 'ksa.1', 'jpn-1': 'jpn.1',
  'chn-1': 'chn.1', 'chi-1': 'chi.1', 'uru-1': 'uru.1', 'col-1': 'col.1',
  'par-1': 'par.1', 'ecu-1': 'ecu.1', 'per-1': 'per.1', 'bol-1': 'bol.1',
  'ven-1': 'ven.1', 'ucl': 'uefa.champions', 'uel': 'uefa.europa',
  'uecl': 'uefa.europa.conf'
};
const teamNameOverrides = { 'uru-1': { Liverpool: 'Liverpool Montevideo' } };

const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^a-z0-9]/g, '');
const dataPath = path.join(root, 'data', 'competition_teams.js');
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(dataPath, 'utf8'), sandbox, { filename: dataPath });
const competitions = sandbox.window.COMPETITION_TEAMS;
const badges = {};
const changedTeams = {};
const downloaded = new Map();
const badgeOwners = new Map();

async function run() {
  for (const [competitionId, leagueId] of Object.entries(sources)) {
    const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${leagueId}/teams`);
    if (!response.ok) throw new Error(`${competitionId}: ESPN respondeu HTTP ${response.status}`);
    const payload = await response.json();
    const teams = payload.sports?.[0]?.leagues?.[0]?.teams?.map(item => item.team) || [];
    if (!teams.length || teams.some(team => !team.displayName || !team.id || !team.logos?.[0]?.href)) {
      throw new Error(`${competitionId}: resposta sem lista completa de clubes/escudos`);
    }

    const teamNames = new Map(teams.map(team => [team.id, teamNameOverrides[competitionId]?.[team.displayName] || team.displayName]));
    changedTeams[competitionId] = teams.map(team => teamNames.get(team.id));
    for (const team of teams) {
      const filename = `espn-${team.id}.png`;
      const relativePath = `world/${filename}`;
      const targetPath = path.join(root, 'img', 'badges', relativePath);
      const existing = fs.existsSync(targetPath) ? fs.readFileSync(targetPath) : null;
      const existingValid = existing && existing.length >= 100 && existing[0] === 0x89 && existing[1] === 0x50 && existing[2] === 0x4e && existing[3] === 0x47;
      if (!existingValid) {
      let imagePromise = downloaded.get(team.id);
      if (!imagePromise) {
        imagePromise = fetch(team.logos[0].href).then(async response => {
          if (!response.ok) throw new Error(`${team.displayName}: falha ao baixar escudo`);
          return Buffer.from(await response.arrayBuffer());
        });
        downloaded.set(team.id, imagePromise);
      }
      const image = await imagePromise;
      if (image.length < 100 || image[0] !== 0x89 || image[1] !== 0x50 || image[2] !== 0x4e || image[3] !== 0x47) {
        throw new Error(`${team.displayName}: resposta de escudo não é um PNG válido`);
      }
      fs.mkdirSync(path.join(root, 'img', 'badges', 'world'), { recursive: true });
      fs.writeFileSync(targetPath, image);
      }
      const nameKey = normalize(teamNames.get(team.id));
      const previousOwner = badgeOwners.get(nameKey);
      if (previousOwner && previousOwner !== team.id) {
        delete badges[nameKey];
        badgeOwners.set(nameKey, null);
      } else if (previousOwner !== null) {
        badges[nameKey] = relativePath;
        badgeOwners.set(nameKey, team.id);
      }
    }
  }

  for (const [competitionId, teams] of Object.entries(changedTeams)) {
    const normalizedTeams = teams.map(normalize);
    if (new Set(normalizedTeams).size !== normalizedTeams.length) throw new Error(`${competitionId}: feed contém clube duplicado`);
  }
  const worldBadgeDir = path.join(root, 'img', 'badges', 'world');
  const referencedFiles = new Set(Object.values(badges).map(value => path.basename(value)));
  for (const filename of fs.readdirSync(worldBadgeDir)) {
    if (filename.startsWith('espn-') && filename.endsWith('.png') && !referencedFiles.has(filename)) {
      fs.unlinkSync(path.join(worldBadgeDir, filename));
    }
  }

  const teamOutput = `// Elencos internacionais da temporada 2026/27, obtidos nos feeds de competições ESPN.\nwindow.AFM_INTERNATIONAL_TEAMS_2026_27 = ${JSON.stringify(changedTeams, null, 2)};\nfor (const [id, teams] of Object.entries(window.AFM_INTERNATIONAL_TEAMS_2026_27)) {\n  window.COMPETITION_TEAMS[id] = teams;\n  const competition = window.COMPETITIONS.find(item => item.id === id);\n  if (competition) competition.teams = teams.length;\n}\n`;
  const badgeOutput = `// Escudos ESPN: arquivos locais identificados pelo ID estável do clube no feed.\nwindow.CLUB_BADGES_VERIFIED_WORLD_BY_NAME = Object.freeze(${JSON.stringify(badges, null, 2)});\n`;
  const localBadgeCandidates = new Map();
  const ambiguousNames = new Set();
  function indexLocalBadges(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const filePath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        if (!['competitions', 'world'].includes(entry.name)) indexLocalBadges(filePath);
        continue;
      }
      if (!/\.(png|svg)$/i.test(entry.name)) continue;
      const key = normalize(path.basename(entry.name, path.extname(entry.name)));
      if (!key || ambiguousNames.has(key)) continue;
      const bytes = fs.readFileSync(filePath);
      const relative = path.relative(path.join(root, 'img', 'badges'), filePath).replace(/\\/g, '/');
      const candidate = { relative, digest: crypto.createHash('sha256').update(bytes).digest('hex') };
      const previous = localBadgeCandidates.get(key);
      if (previous && previous.digest !== candidate.digest) {
        localBadgeCandidates.delete(key);
        ambiguousNames.add(key);
      } else if (!previous) localBadgeCandidates.set(key, candidate);
    }
  }
  indexLocalBadges(path.join(root, 'img', 'badges'));
  const localBadgeOutput = `// Escudos locais selecionados apenas por nome de arquivo único e inequívoco.\nwindow.CLUB_BADGES_LOCAL_INDEX_BY_NAME = Object.freeze(${JSON.stringify(Object.fromEntries([...localBadgeCandidates].map(([key, item]) => [key, item.relative])), null, 2)});\n`;
  fs.writeFileSync(path.join(root, 'data', 'international_teams_2026_27.js'), teamOutput);
  fs.writeFileSync(path.join(root, 'data', 'club_badges_verified_world.js'), badgeOutput);
  fs.writeFileSync(path.join(root, 'data', 'club_badges_local_index.js'), localBadgeOutput);
  console.log(`Competições atualizadas: ${Object.keys(changedTeams).length}; escudos verificados: ${Object.keys(badges).length}; escudos locais únicos: ${localBadgeCandidates.size}; imagens novas: ${downloaded.size}.`);
}

run().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
