// Resultados persistentes de torneios paralelos à liga principal da carreira.
window.AFM_TOURNAMENT_ENGINE = (() => {
  const key = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');

  function standings(groups, fixtures) {
    return Object.fromEntries(Object.entries(groups || {}).map(([group, teams]) => {
      const rows = teams.map(name => ({ name, played: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, points: 0 }));
      const byName = new Map(rows.map(row => [key(row.name), row]));
      for (const match of fixtures || []) {
        if (match.group !== group || !match.result) continue;
        const home = byName.get(key(match.home));
        const away = byName.get(key(match.away));
        if (!home || !away) continue;
        const [hg, ag] = match.result;
        home.played++; away.played++;
        home.gf += hg; home.ga += ag; away.gf += ag; away.ga += hg;
        if (hg > ag) { home.wins++; away.losses++; home.points += 3; }
        else if (hg < ag) { away.wins++; home.losses++; away.points += 3; }
        else { home.draws++; away.draws++; home.points++; away.points++; }
      }
      rows.sort((a, b) => b.points - a.points || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf || key(a.name).localeCompare(key(b.name)));
      return [group, rows];
    }));
  }

  function createGroupTournament({ id, season, groups, fixtures }) {
    if (!id || !Number.isInteger(Number(season)) || !groups || !fixtures) throw new TypeError('Torneio sem temporada, grupos ou jogos.');
    const seen = new Set();
    const matches = fixtures.map((fixture, index) => {
      const matchId = `${id}-${season}-${fixture.round}-${fixture.group}-${key(fixture.home)}-${key(fixture.away)}`;
      if (seen.has(matchId)) throw new Error(`Jogo duplicado: ${matchId}`);
      seen.add(matchId);
      return { ...fixture, id: matchId, competitionId: id, season: Number(season), status: 'scheduled', result: null, winner: null };
    });
    return { id, season: Number(season), phase: 'groups', groups, matches, standings: standings(groups, matches), champion: null };
  }

  function recordResult(tournament, matchId, homeGoals, awayGoals, winner = null) {
    if (!tournament || !Array.isArray(tournament.matches)) throw new TypeError('Estado do torneio inválido.');
    const match = tournament.matches.find(item => item.id === matchId);
    if (!match) throw new Error('Partida não encontrada no torneio.');
    if (match.status !== 'scheduled') throw new Error('Esta partida já foi registrada.');
    const score = [homeGoals, awayGoals].map(Number);
    if (score.some(value => !Number.isInteger(value) || value < 0)) throw new TypeError('Placar inválido.');
    if (tournament.phase !== 'groups' && score[0] === score[1] && !winner) throw new Error('Mata-mata empatado exige vencedor.');
    if (winner && key(winner) !== key(match.home) && key(winner) !== key(match.away)) throw new Error('Vencedor não pertence ao confronto.');
    match.result = score;
    match.winner = winner || (score[0] === score[1] ? null : (score[0] > score[1] ? match.home : match.away));
    match.status = 'played';
    tournament.standings = standings(tournament.groups, tournament.matches);
    return match;
  }

  return { createGroupTournament, recordResult, standings };
})();
