const fs = require('fs');
const assert = require('assert');

// Setup mock browser environment
let windowObj = {
  norm: (s) => String(s || "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
  COMPETITION_TEAMS: {},
  COMPETITIONS: [],
  document: {
    getElementById: () => null,
    createElement: () => ({ style: {}, appendChild: () => {}, querySelector: () => null }),
    body: { appendChild: () => {} }
  }
};

// Load competition teams
eval(fs.readFileSync('data/competition_teams.js', 'utf8').replace(/window\./g, 'windowObj.'));
eval(fs.readFileSync('js/competitions.js', 'utf8').replace(/window\./g, 'windowObj.'));

// Load player_career_engine in windowObj context
const engineCode = fs.readFileSync('js/player/player_career_engine.js', 'utf8');
const wrappedEngine = `
(function(window) {
  ${engineCode.replace(/\(function\s*\(window\)\s*\{/, '').replace(/\}\)\(window\);?\s*$/, '')}
})(windowObj);
`;
eval(wrappedEngine);

console.log("Testing getClubLeagueSummary...");
const getLeague = windowObj.AFM_PlayerEngine.getClubLeagueSummary;

const voltaRedondaLeague = getLeague("Volta Redonda", { competitionTeams: windowObj.COMPETITION_TEAMS });
console.log("Volta Redonda:", voltaRedondaLeague);
assert(voltaRedondaLeague.includes("Carioca") || voltaRedondaLeague.includes("Brasileirão"), "Volta Redonda should resolve to Carioca or Brasileirão");

const brasiliaLeague = getLeague("Brasília", { competitionTeams: windowObj.COMPETITION_TEAMS });
console.log("Brasília:", brasiliaLeague);
assert(brasiliaLeague.includes("Candango (DF)"), "Brasília should resolve to Candango (DF)");
assert(brasiliaLeague.includes("Sem Divisão Nacional"), "Brasília should indicate Sem Divisão Nacional");

const flamengoLeague = getLeague("Flamengo", { competitionTeams: windowObj.COMPETITION_TEAMS });
console.log("Flamengo:", flamengoLeague);
assert(flamengoLeague.includes("Série A") && flamengoLeague.includes("Carioca"), "Flamengo should resolve to Série A and Carioca");

const realMadridLeague = getLeague("Real Madrid", { competitionTeams: windowObj.COMPETITION_TEAMS });
console.log("Real Madrid:", realMadridLeague);
assert.strictEqual(realMadridLeague, "LaLiga (Espanha)", "Real Madrid should resolve to LaLiga");

const manCityLeague = getLeague("Manchester City", { competitionTeams: windowObj.COMPETITION_TEAMS });
console.log("Manchester City:", manCityLeague);
assert.strictEqual(manCityLeague, "Premier League (Inglaterra)", "Man City should resolve to Premier League");

console.log("Testing isCompetitionFinished...");
const isFinished = windowObj.AFM_PlayerEngine.isCompetitionFinished;

const ongoingState = {
  season: 2026,
  round: 2,
  estadualData: {
    'bra-est-df': {
      id: 'bra-est-df',
      name: 'Campeonato Candango',
      fixtures: [
        { roundIndex: 0, home: 'Brasília', away: 'Paranoá', played: true, result: [3, 1] },
        { roundIndex: 1, home: 'ARUC', away: 'Brasília', played: false },
        { roundIndex: 2, home: 'Brasília', away: 'Ceilândia', played: false }
      ]
    }
  }
};

assert.strictEqual(isFinished(ongoingState, 'bra-est-df'), false, "Ongoing estadual with unplayed fixtures must NOT be finished");

const finishedState = {
  season: 2026,
  round: 9,
  estadualData: {
    'bra-est-df': {
      id: 'bra-est-df',
      name: 'Campeonato Candango',
      fixtures: [
        { roundIndex: 0, home: 'Brasília', away: 'Paranoá', played: true, result: [3, 1] },
        { roundIndex: 1, home: 'ARUC', away: 'Brasília', played: true, result: [1, 2] },
        { roundIndex: 2, home: 'Brasília', away: 'Ceilândia', played: true, result: [2, 0] }
      ],
      teams: [
        { name: 'Brasília', p: 9, j: 3, v: 3, e: 0, d: 0, gp: 7, gc: 2, sg: 5 },
        { name: 'Ceilândia', p: 6, j: 3, v: 2, e: 0, d: 1, gp: 4, gc: 2, sg: 2 }
      ]
    }
  }
};

assert.strictEqual(isFinished(finishedState, 'bra-est-df'), true, "Estadual with all fixtures played must be finished");

console.log("Testing auto-healing of premature awards in ongoing seasons...");
const playerStateWithPrematureAwards = {
  gameMode: 'player',
  season: 2026,
  playerCareerState: {
    individualAwards: [
      { id: 'league_mvp_2026', compId: 'bra-est-df', title: 'Craque do Campeonato Candango', year: 2026 },
      { id: 'league_topScorer_2026', compId: 'bra-est-df', title: 'Artilheiro do Campeonato Candango', year: 2026 },
      { id: 'ballon_dor_2026', title: 'Bola de Ouro', year: 2026 },
      { id: 'league_mvp_2025', compId: 'bra-est-df', title: 'Craque do Campeonato Candango', year: 2025 }
    ],
    careerHistory: { totals: { games: 2, starts: 2, minutes: 180, goals: 3, assists: 1, mvp: 1 } },
    seasonStats: { games: 2, goals: 3, assists: 1, mvpCount: 1 }
  },
  estadualData: ongoingState.estadualData
};

windowObj.AFM_PlayerEngine.ensurePlayerCareerHistory(playerStateWithPrematureAwards.playerCareerState, playerStateWithPrematureAwards);

const remainingAwards = playerStateWithPrematureAwards.playerCareerState.individualAwards;
console.log("Remaining awards after auto-heal:", remainingAwards.map(a => a.id));
assert.strictEqual(remainingAwards.length, 1, "Only the legitimate historical award (2025) should remain");
assert.strictEqual(remainingAwards[0].year, 2025, "Remaining award must be 2025");

console.log("Testing checkAndTriggerCompetitionConclusion when tournament finishes...");
const mockFinishedGameState = {
  gameMode: 'player',
  season: 2026,
  club: 'Brasília',
  controlledPlayerId: 10,
  squad: [{ id: 10, name: 'D. Aquino', ovr: 45, pos: 'ATA', isControlled: true }],
  playerCareerState: {
    athleteName: 'D. Aquino',
    concludedComps: {},
    individualAwards: [],
    careerStats: { goals: 3 },
    competitionStatsByComp: {
      'bra-est-df': { goals: 3, assists: 1, matches: 3, avgRating: 8.5, mvpCount: 2 }
    }
  },
  estadualData: finishedState.estadualData
};

const triggerRes = windowObj.AFM_PlayerEngine.checkAndTriggerCompetitionConclusion(mockFinishedGameState, 'bra-est-df');
assert(triggerRes != null, "Conclusion trigger should return result");
assert.strictEqual(triggerRes.isClubChampion, true, "Brasília should be identified as champion with 9 points");
assert.strictEqual(mockFinishedGameState.playerCareerState.concludedComps['bra-est-df_2026'], true, "Idempotency flag must be set");

// Second call should return null due to idempotency
const secondCall = windowObj.AFM_PlayerEngine.checkAndTriggerCompetitionConclusion(mockFinishedGameState, 'bra-est-df');
assert.strictEqual(secondCall, null, "Second trigger call must be ignored (idempotent)");

console.log("All unit tests passed successfully!");
