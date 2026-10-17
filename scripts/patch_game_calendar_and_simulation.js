const fs = require('fs');
const path = require('path');

const gameJsPath = path.join(__dirname, '..', 'js', 'game.js');
const normalizeNl = s => s.replace(/\r\n/g, '\n');
let code = normalizeNl(fs.readFileSync(gameJsPath, 'utf8'));

function replaceExactlyOnce(name, from, to) {
  from = normalizeNl(from);
  to = normalizeNl(to);
  const parts = code.split(from);
  if (parts.length === 1) {
    throw new Error(`Target not found for: ${name}`);
  }
  if (parts.length > 2) {
    throw new Error(`Target found multiple times (${parts.length - 1}) for: ${name}`);
  }
  code = parts.join(to);
  console.log(`[OK] Replaced: ${name}`);
}

// 1. playCopaDoBrasilFixture date advancement and state updates
replaceExactlyOnce(
  'playCopaDoBrasilFixture-date-advance',
  `  const result = { h: fixture.home, a: fixture.away, hg, ag, winner, events, round: phase.name, season: Number(state.season), date: state.date, competitionId: 'bra-cup', competitionName: 'Copa do Brasil' };
  state.history = [result, ...(state.history || [])].slice(0, 100);
  fixture.played = true;
  state.news = state.news || [];
  state.news.unshift(\`🏆 Copa do Brasil (\${phase.name}): \${fixture.home} \${hg} x \${ag} \${fixture.away}. \${norm(winner) === norm(state.club) ? 'Classificado.' : 'Eliminado.'}\`);
  if(norm(winner) !== norm(state.club)){
    const opp = norm(fixture.home) === norm(state.club) ? fixture.away : fixture.home;
    const oppGoals = norm(fixture.home) === norm(state.club) ? ag : hg;
    registrarEliminacaoMataMata(state, 'Copa do Brasil', phase.name, opp, userGoals, oppGoals);
  }
  save();
  render();
  openPressConferenceModal('post', result);`,
  `  const result = { h: fixture.home, a: fixture.away, hg, ag, winner, events, round: phase.name, season: Number(state.season), date: state.date, competitionId: 'bra-cup', competitionName: 'Copa do Brasil' };
  state.history = [result, ...(state.history || [])].slice(0, 100);
  fixture.played = true;
  state.lastMatchSummary = { h: fixture.home, a: fixture.away, hg, ag, isHome: norm(fixture.home) === norm(state.club), won: norm(winner) === norm(state.club) };
  state.news = state.news || [];
  state.news.unshift(\`🏆 Copa do Brasil (\${phase.name}): \${fixture.home} \${hg} x \${ag} \${fixture.away}. \${norm(winner) === norm(state.club) ? 'Classificado.' : 'Eliminado.'}\`);
  if(norm(winner) !== norm(state.club)){
    const opp = norm(fixture.home) === norm(state.club) ? fixture.away : fixture.home;
    const oppGoals = norm(fixture.home) === norm(state.club) ? ag : hg;
    registrarEliminacaoMataMata(state, 'Copa do Brasil', phase.name, opp, userGoals, oppGoals);
  }
  try {
    const curD = new Date(state.date + 'T12:00:00');
    curD.setDate(curD.getDate() + 1);
    state.date = curD.toISOString().slice(0, 10);
    state.currentDate = state.date;
    state.currentDateFormatted = formatDatePtBr(state.date);
  } catch(e){}
  if(typeof window !== 'undefined' && window.AFM_LifeAndSharesPro && typeof window.AFM_LifeAndSharesPro.processRoundTurn === 'function'){
    window.AFM_LifeAndSharesPro.processRoundTurn(state);
  }
  processFitness();
  processDevelopment();
  save();
  render();
  openPressConferenceModal('post', result);`
);

// 2. getPendingClubCompetitions continental tournament retrieval
replaceExactlyOnce(
  'getPendingClubCompetitions-continental',
  `  // Competições continentais/internacionais qualificadas e persistidas no save.
  for(const id of ['lib','sud','ucl','uel','uecl','afc-el','afc2','cwc']){
    const tournament = gameState.tournaments?.[id];
    if(!tournament || Number(tournament.season) !== season) continue;`,
  `  // Competições continentais/internacionais qualificadas e persistidas no save.
  for(const id of ['lib','sud','ucl','uel','uecl','afc-el','afc2','cwc']){
    const tournament = (gameState === state && typeof getContinentalTournament === 'function')
      ? getContinentalTournament(id)
      : gameState.tournaments?.[id];
    if(!tournament || Number(tournament.season) !== season) continue;`
);

// 3. getActualCurrentMatch sorting: prioritize due matches over future matches
replaceExactlyOnce(
  'getActualCurrentMatch-sorting',
  `  // Prioridade: partida de hoje; senão, próxima partida no futuro; senão, partida pendente mais antiga
  const today = gameState.date;
  const todayMatches = candidates.filter(c => c.date === today);
  if(todayMatches.length) return todayMatches[0];

  const futureMatches = candidates.filter(c => c.date > today).sort((a,b) => String(a.date).localeCompare(String(b.date)));
  if(futureMatches.length) return futureMatches[0];

  return candidates.sort((a,b) => String(a.date).localeCompare(String(b.date)))[0];`,
  `  // Prioridade: se houver partidas pendentes hoje ou com data já vencida, joga a devida; senão, a próxima no futuro
  const today = gameState.date;
  const sorted = candidates.slice().sort((a,b) => String(a.date || '').localeCompare(String(b.date || '')));
  const due = sorted.filter(c => c.date <= today);
  if(due.length){
    const todayMatch = due.find(c => c.date === today);
    return todayMatch || due[0];
  }
  return sorted[0];`
);

// 4. canStartMatch: handle pending fixtures when primary schedule is exhausted and precise alreadyPlayed checks
replaceExactlyOnce(
  'canStartMatch-pending-and-played',
  `  // Once the primary schedule is over, resolve the next pending fixture in
  // another competition before offering season completion.
  const mainSchedule = Array.isArray(gameState.schedule) ? gameState.schedule : [];
  if(Number(gameState.round) >= mainSchedule.length){
    const nextPending = typeof getNextPendingClubFixture === 'function' ? getNextPendingClubFixture(gameState) : null;
    if(nextPending){
      return {
        canStart:false,
        reason:\`O campeonato principal terminou. A próxima partida pendente é \${nextPending.name}\${nextPending.detail ? \` (\${nextPending.detail})\` : ''}\${nextPending.date ? \` em \${formatDatePtBr(nextPending.date)}\` : ''}. Avance até essa data e abra a competição correspondente.\`,
        status:'other_competitions_pending',
        pending:typeof getPendingClubCompetitions === 'function' ? getPendingClubCompetitions(gameState) : [nextPending],
        nextDate:nextPending.date || null,
        nextFixture:nextPending
      };
    }
  }

  // 2. Fim de temporada
  const fixtures = Array.isArray(gameState.schedule?.[gameState.round]) ? gameState.schedule[gameState.round] : [];
  if(gameState.round >= (gameState.schedule?.length || 1)){
    const pendingOtherCompetitions = typeof getPendingClubCompetitions === 'function' ? getPendingClubCompetitions(gameState) : [];
    if(pendingOtherCompetitions.length){
      const next = pendingOtherCompetitions[0];
      return { canStart: false, reason: \`O calendário principal terminou, mas ainda falta disputar \${next.name}\${next.detail ? \` (\${next.detail})\` : ''}\${next.date ? \` em \${formatDatePtBr(next.date)}\` : ''}. A temporada continua aberta.\`, status: 'other_competitions_pending', pending: pendingOtherCompetitions, nextDate: next.date || null };
    }
    return { canStart: false, reason: 'A temporada atual já foi concluída.', status: 'season_finished' };
  }

  // 3. Partida existe
  const myClubNorm = norm(gameState.club);
  const activeMatch = typeof getActualCurrentMatch === 'function' ? getActualCurrentMatch(gameState) : null;
  const uFix = fixture || activeMatch?.fixture || fixtures.find(g => Array.isArray(g) && (norm(g[0]) === myClubNorm || norm(g[1]) === myClubNorm));
  if(!uFix || !Array.isArray(uFix) || uFix.length < 2){
    return { canStart: false, reason: 'Nenhuma partida agendada para o seu clube nesta rodada (Folga na tabela).', status: 'no_fixture', isBye: true };
  }

  // 4. Pertence ao clube
  if(norm(uFix[0]) !== myClubNorm && norm(uFix[1]) !== myClubNorm){
    return { canStart: false, reason: 'O confronto agendado não pertence ao seu clube.', status: 'wrong_club' };
  }

  // 5. Partida já foi disputada nesta rodada?
  const alreadyPlayed = Array.isArray(gameState.history) && gameState.history.some(h => h.competitionId === gameState.compId && h.round === (gameState.round + 1) && h.season === gameState.season && (norm(h.h) === myClubNorm || norm(h.a) === myClubNorm));
  if(alreadyPlayed){
    return { canStart: false, reason: 'A partida desta rodada já foi disputada e finalizada.', status: 'already_played' };
  }`,
  `  // Once the primary schedule is over, resolve the next pending fixture in
  // another competition before offering season completion.
  const mainSchedule = Array.isArray(gameState.schedule) ? gameState.schedule : [];
  if(Number(gameState.round) >= mainSchedule.length){
    const nextPending = typeof getNextPendingClubFixture === 'function' ? getNextPendingClubFixture(gameState) : null;
    if(nextPending){
      if(!nextPending.date || nextPending.date <= gameState.date){
        return {
          canStart: true,
          reason: \`Partida decisiva pronta para o apito inicial: \${nextPending.name}!\`,
          status: 'playable',
          matchDate: nextPending.date || gameState.date,
          curDate: gameState.date,
          nextFixture: nextPending
        };
      }
      const d1 = new Date(gameState.date + 'T12:00:00');
      const d2 = new Date(nextPending.date + 'T12:00:00');
      const diffDays = Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));
      return {
        canStart: false,
        reason: \`O campeonato principal terminou. A próxima partida pendente é \${nextPending.name}\${nextPending.detail ? \` (\${nextPending.detail})\` : ''}\${nextPending.date ? \` em \${formatDatePtBr(nextPending.date)}\` : ''}. Avance até essa data e dispute a partida.\`,
        status: 'future',
        daysDiff: diffDays,
        pending: typeof getPendingClubCompetitions === 'function' ? getPendingClubCompetitions(gameState) : [nextPending],
        nextDate: nextPending.date || null,
        nextFixture: nextPending
      };
    }
    return { canStart: false, reason: 'Todas as competições da temporada atual foram concluídas.', status: 'season_finished' };
  }

  // 2. Fim de temporada
  const fixtures = Array.isArray(gameState.schedule?.[gameState.round]) ? gameState.schedule[gameState.round] : [];
  if(gameState.round >= (gameState.schedule?.length || 1)){
    const pendingOtherCompetitions = typeof getPendingClubCompetitions === 'function' ? getPendingClubCompetitions(gameState) : [];
    if(pendingOtherCompetitions.length){
      const next = pendingOtherCompetitions[0];
      if(!next.date || next.date <= gameState.date){
        return { canStart: true, reason: \`Partida pronta para o apito inicial: \${next.name}!\`, status: 'playable', matchDate: next.date || gameState.date, curDate: gameState.date };
      }
      return { canStart: false, reason: \`O calendário principal terminou, mas ainda falta disputar \${next.name}\${next.detail ? \` (\${next.detail})\` : ''}\${next.date ? \` em \${formatDatePtBr(next.date)}\` : ''}. A temporada continua aberta.\`, status: 'future', pending: pendingOtherCompetitions, nextDate: next.date || null };
    }
    return { canStart: false, reason: 'A temporada atual já foi concluída.', status: 'season_finished' };
  }

  // 3. Partida existe
  const myClubNorm = norm(gameState.club);
  const activeMatch = typeof getActualCurrentMatch === 'function' ? getActualCurrentMatch(gameState) : null;
  const uFix = fixture || activeMatch?.fixture || fixtures.find(g => Array.isArray(g) && (norm(g[0]) === myClubNorm || norm(g[1]) === myClubNorm));
  if(!uFix || !Array.isArray(uFix) || uFix.length < 2){
    return { canStart: false, reason: 'Nenhuma partida agendada para o seu clube nesta rodada (Folga na tabela).', status: 'no_fixture', isBye: true };
  }

  // 4. Pertence ao clube
  if(norm(uFix[0]) !== myClubNorm && norm(uFix[1]) !== myClubNorm){
    return { canStart: false, reason: 'O confronto agendado não pertence ao seu clube.', status: 'wrong_club' };
  }

  // 5. Partida já foi disputada nesta rodada?
  let alreadyPlayed = false;
  if(activeMatch){
    if(activeMatch.type === 'estadual'){
      const estData = typeof getStateCompData === 'function' ? getStateCompData(activeMatch.competitionId) : null;
      const fix = estData?.fixtures?.[activeMatch.fixtureIndex];
      alreadyPlayed = Boolean(fix?.played || fix?.result);
    } else if(activeMatch.type === 'copa'){
      const copa = typeof getCopaDoBrasilState === 'function' ? getCopaDoBrasilState() : gameState.copaData;
      const fix = copa?.phases?.[activeMatch.phaseName]?.fixtures?.[activeMatch.fixtureIndex];
      alreadyPlayed = Boolean(fix?.played || fix?.score || fix?.winner);
    } else if(activeMatch.type === 'continental'){
      const tourn = typeof getContinentalTournament === 'function' ? getContinentalTournament(activeMatch.competitionId) : gameState.tournaments?.[activeMatch.competitionId];
      const m = tourn?.matches?.find(item => item.id === activeMatch.matchId);
      alreadyPlayed = Boolean(m && m.status !== 'scheduled');
    } else {
      alreadyPlayed = Array.isArray(gameState.history) && gameState.history.some(h => 
        (h.competitionId === activeMatch.competitionId || h.competitionId === gameState.compId) && 
        Number(h.round) === (gameState.round + 1) && 
        Number(h.season) === Number(gameState.season) && 
        (norm(h.h) === myClubNorm || norm(h.a) === myClubNorm)
      );
    }
  } else {
    alreadyPlayed = Array.isArray(gameState.history) && gameState.history.some(h => 
      h.competitionId === gameState.compId && 
      Number(h.round) === (gameState.round + 1) && 
      Number(h.season) === Number(gameState.season) && 
      (norm(h.h) === myClubNorm || norm(h.a) === myClubNorm)
    );
  }
  if(alreadyPlayed){
    return { canStart: false, reason: 'A partida desta rodada já foi disputada e finalizada.', status: 'already_played' };
  }`
);

// 5. getActiveNextMatch: check copaData and continental tournaments
replaceExactlyOnce(
  'getActiveNextMatch-copa-and-continental',
  `  // 3. Copa do Brasil next match (if active)
  if(st.copaDoBrasil && Array.isArray(st.copaDoBrasil.fixtures)){
    const unplayedCopa = st.copaDoBrasil.fixtures.filter(f => !f.played && !f.result && (norm(f.home) === norm(st.club) || norm(f.away) === norm(st.club)));
    if(unplayedCopa.length > 0){
      const nextC = unplayedCopa[0];
      const cDate = nextC.isoDate || nextC.date || st.date;
      matches.push({
        type: 'copa',
        competitionId: 'copa-do-brasil',
        competitionName: 'Copa do Brasil',
        home: nextC.home,
        away: nextC.away,
        roundIndex: Number(nextC.roundIndex) || 0,
        roundNumber: (Number(nextC.roundIndex) || 0) + 1,
        date: cDate,
        dateStr: formatDatePtBr(cDate)
      });
    }
  }`,
  `  // 3. Copa do Brasil next match (if active)
  const copa = (st === state && typeof getCopaDoBrasilState === 'function') ? getCopaDoBrasilState() : st.copaData;
  if(copa && copa.phases){
    Object.entries(copa.phases).forEach(([phaseName, phase]) => {
      (phase.fixtures || []).forEach((fix, fixIdx) => {
        if((norm(fix.home) === norm(st.club) || norm(fix.away) === norm(st.club)) && !fix.score && !fix.winner && !fix.played){
          const cDate = ensureMidweekDate(fix.isoDate || phase.isoDate, st.season);
          matches.push({
            type: 'copa',
            competitionId: 'bra-cup',
            competitionName: 'Copa do Brasil',
            home: fix.home,
            away: fix.away,
            roundIndex: fixIdx,
            roundNumber: fixIdx + 1,
            phaseName,
            date: cDate,
            dateStr: formatDatePtBr(cDate)
          });
        }
      });
    });
  }

  // 4. Continental next match (if active)
  for(const id of ['lib','sud','ucl','uel','uecl','afc-el','afc2','cwc']){
    const tournament = (st === state && typeof getContinentalTournament === 'function') ? getContinentalTournament(id) : st.tournaments?.[id];
    if(!tournament || Number(tournament.season) !== Number(st.season)) continue;
    (tournament.matches || []).forEach(m => {
      if((norm(m.home) === norm(st.club) || norm(m.away) === norm(st.club)) && (m.status === 'scheduled' || (!m.result && !m.score))){
        const cDate = ensureMidweekDate(m.date, st.season);
        const compName = id === 'lib' ? 'CONMEBOL Libertadores' : id === 'sud' ? 'CONMEBOL Sul-Americana' : id === 'cwc' ? 'Mundial de Clubes FIFA' : (compById(id)?.name || id);
        matches.push({
          type: 'continental',
          competitionId: id,
          competitionName: compName,
          home: m.home,
          away: m.away,
          matchId: m.id,
          roundIndex: (m.round || 1) - 1,
          roundNumber: m.round || 1,
          date: cDate,
          dateStr: formatDatePtBr(cDate)
        });
      }
    });
  }`
);

// 6. simulateQuickStateLeagueRound: h and a properties, attendance, stats, and fitness
replaceExactlyOnce(
  'simulateQuickStateLeagueRound-enrichment',
  `  const userRes = {home, away, hg: uHg, ag: uAg};
  state.history = state.history || [];
  state.history.unshift({...userRes, round: roundIndex + 1, season: Number(state.season), date: fixtureRecord.isoDate || state.date, competitionId, competitionName: data.name, isHome, won: gf > ga});
  state.history = state.history.slice(0, 100);
  data.currentRound = Math.max(Number(data.currentRound)||1, roundIndex + 2);
  state.estadualData[competitionId] = data;`,
  `  const userRes = {home, away, h: home, a: away, hg: uHg, ag: uAg};
  state.history = state.history || [];
  state.history.unshift({...userRes, round: roundIndex + 1, season: Number(state.season), date: fixtureRecord.isoDate || state.date, competitionId, competitionName: data.name, isHome, won: gf > ga});
  state.history = state.history.slice(0, 100);
  data.currentRound = Math.max(Number(data.currentRound)||1, roundIndex + 2);
  state.estadualData[competitionId] = data;

  state.lastMatchSummary = { h: home, a: away, hg: uHg, ag: uAg, ga, isHome, won: gf > ga };
  const userGoals = isHome ? uHg : uAg;
  const events = simulateUserGoalEvents(state.club, userGoals);
  addPlayerMatchStats(competitionId, state.club, events);

  if(isHome){
    const att = (typeof calcAttendance === 'function') ? calcAttendance(data.name || 'Estadual') : { revenue: 150000 };
    const gate = att.revenue || 0;
    state.balance += gate;
    state.income += gate;
  }
  processFitness();
  processDevelopment();`
);

// 7. startLiveMatch: guard stateLeagueMatchSession and add continental fixture
replaceExactlyOnce(
  'startLiveMatch-delegations',
  `    const activeMatch = typeof getActualCurrentMatch === 'function' ? getActualCurrentMatch(state) : null;
    if(activeMatch && activeMatch.type === 'estadual' && activeMatch.competitionId && Number.isInteger(activeMatch.roundIndex)){
      isStartingLiveMatch = false;
      return beginStateLeagueMatch(activeMatch.competitionId, activeMatch.roundIndex);
    }
    if(activeMatch && activeMatch.type === 'copa' && Number.isInteger(activeMatch.fixtureIndex)){
      isStartingLiveMatch = false;
      return playCopaDoBrasilFixture(activeMatch.fixtureIndex, activeMatch.phaseName || copaCurrentPhase);
    }`,
  `    const activeMatch = typeof getActualCurrentMatch === 'function' ? getActualCurrentMatch(state) : null;
    if(!stateLeagueMatchSession && activeMatch && activeMatch.type === 'estadual' && activeMatch.competitionId && Number.isInteger(activeMatch.roundIndex)){
      isStartingLiveMatch = false;
      return beginStateLeagueMatch(activeMatch.competitionId, activeMatch.roundIndex);
    }
    if(activeMatch && activeMatch.type === 'copa' && Number.isInteger(activeMatch.fixtureIndex)){
      isStartingLiveMatch = false;
      return playCopaDoBrasilFixture(activeMatch.fixtureIndex, activeMatch.phaseName || copaCurrentPhase);
    }
    if(activeMatch && activeMatch.type === 'continental' && activeMatch.competitionId && activeMatch.matchId){
      isStartingLiveMatch = false;
      return playContinentalFixture(activeMatch.competitionId, activeMatch.matchId);
    }`
);

// 8. simulateQuickRound: call simulateQuickStateLeagueRound and playContinentalFixture
replaceExactlyOnce(
  'simulateQuickRound-delegations',
  `    const activeMatch = typeof getActualCurrentMatch === 'function' ? getActualCurrentMatch(state) : null;
    if(activeMatch && activeMatch.type === 'estadual' && activeMatch.competitionId && Number.isInteger(activeMatch.roundIndex)){
      isSimulatingQuickRound = false;
      return beginStateLeagueMatch(activeMatch.competitionId, activeMatch.roundIndex);
    }
    if(activeMatch && activeMatch.type === 'copa' && Number.isInteger(activeMatch.fixtureIndex)){
      isSimulatingQuickRound = false;
      return playCopaDoBrasilFixture(activeMatch.fixtureIndex, activeMatch.phaseName || copaCurrentPhase);
    }`,
  `    const activeMatch = typeof getActualCurrentMatch === 'function' ? getActualCurrentMatch(state) : null;
    if(activeMatch && activeMatch.type === 'estadual' && activeMatch.competitionId && Number.isInteger(activeMatch.roundIndex)){
      isSimulatingQuickRound = false;
      return simulateQuickStateLeagueRound(activeMatch.competitionId, activeMatch.roundIndex);
    }
    if(activeMatch && activeMatch.type === 'copa' && Number.isInteger(activeMatch.fixtureIndex)){
      isSimulatingQuickRound = false;
      return playCopaDoBrasilFixture(activeMatch.fixtureIndex, activeMatch.phaseName || copaCurrentPhase);
    }
    if(activeMatch && activeMatch.type === 'continental' && activeMatch.competitionId && activeMatch.matchId){
      isSimulatingQuickRound = false;
      return playContinentalFixture(activeMatch.competitionId, activeMatch.matchId);
    }`
);

// 9. playContinentalFixture: advance date by 1 day and process turn
replaceExactlyOnce(
  'playContinentalFixture-date-advance',
  `  if(userResult){
    state.history = [userResult, ...(state.history || [])].slice(0, 100);
    state.lastMatchSummary = { h:userResult.h, a:userResult.a, hg:userResult.hg, ag:userResult.ag, isHome:norm(userResult.h)===norm(state.club), won:(norm(userResult.h)===norm(state.club)?userResult.hg>userResult.ag:userResult.ag>userResult.hg) };
  }
  state.news = state.news || [];
  state.news.unshift(\`🏆 \${match.competitionId === 'lib' ? 'Libertadores' : 'Sul-Americana'}: rodada \${match.round} concluída; classificação atualizada.\`);
  save();
  toast('Partidas continentais da data simuladas; classificação salva.');
  render();`,
  `  if(userResult){
    state.history = [userResult, ...(state.history || [])].slice(0, 100);
    state.lastMatchSummary = { h:userResult.h, a:userResult.a, hg:userResult.hg, ag:userResult.ag, isHome:norm(userResult.h)===norm(state.club), won:(norm(userResult.h)===norm(state.club)?userResult.hg>userResult.ag:userResult.ag>userResult.hg) };
  }
  state.news = state.news || [];
  state.news.unshift(\`🏆 \${match.competitionId === 'lib' ? 'Libertadores' : 'Sul-Americana'}: rodada \${match.round} concluída; classificação atualizada.\`);
  try {
    const curD = new Date(state.date + 'T12:00:00');
    curD.setDate(curD.getDate() + 1);
    state.date = curD.toISOString().slice(0, 10);
    state.currentDate = state.date;
    state.currentDateFormatted = formatDatePtBr(state.date);
  } catch(e){}
  if(typeof window !== 'undefined' && window.AFM_LifeAndSharesPro && typeof window.AFM_LifeAndSharesPro.processRoundTurn === 'function'){
    window.AFM_LifeAndSharesPro.processRoundTurn(state);
  }
  processFitness();
  processDevelopment();
  save();
  toast('Partidas continentais da data simuladas; classificação salva.');
  render();`
);

// 10. calendarPage: render completed state fixtures and allow playing match when match.date <= state.date
replaceExactlyOnce(
  'calendarPage-state-fixtures-and-buttons',
  `      const date=row?.isoDate||getDateForRound(roundIndex,state.season);
      const historyMatch=saved?{...saved,hg:calendarClubKey(saved.h)===calendarClubKey(home)?saved.hg:saved.ag,ag:calendarClubKey(saved.h)===calendarClubKey(home)?saved.ag:saved.hg}:null;
      stateMatches.push({competitionId:stateCompId,name:stateComp.name,home,away,isHome,date,round:\`Rodada \${roundIndex+1}\`,current:date===state.date,past:playedKeys.has(key)||row.played===true||Boolean(row.result),historyMatch,stateFixture:row,matchIndex:roundIndex,fixtureIndex});
    });
    competitionTabs.push({id:stateCompId,name:stateComp.name,label:\`🏟️ \${stateComp.name}\`,matches:stateMatches});
  }
  for(const [id,label] of cupFilters){const matches=extraMatches.filter(m=>m.competitionId===id);if(matches.length)competitionTabs.push({id,name:matches[0].name,label,matches});}
  const activeCalendarFilter=competitionTabs.some(tab=>tab.id===calendarFilter)||['ALL','HOME','AWAY'].includes(calendarFilter)?calendarFilter:'ALL';
  const allMatches=competitionTabs.flatMap(tab=>tab.matches);
  const calendarMatches=allMatches.filter(match=>activeCalendarFilter==='ALL'||(activeCalendarFilter==='HOME'||activeCalendarFilter==='AWAY'?match.isHome===(activeCalendarFilter==='HOME'):match.competitionId===activeCalendarFilter)).sort((a,b)=>a.date.localeCompare(b.date)||(a.competitionId==='COMP'?-1:1));
  return \`
    <div class="hero"><div><h1>Calendário Oficial de Jogos & Janelas de Transferência</h1><div class="muted">Datas dos confrontos, mandos de campo, torneios da temporada \${state.season} e janelas de contratação</div></div><div style="display:flex;gap:10px;align-items:center"><span class="window-badge \${winInfo.open?'window-open':'window-closed'}">\${winInfo.open?'🟢':'🔴'} \${esc(winInfo.text)}</span><span class="pill">\${esc(comp.name)}</span></div></div>
    <div class="grid g2" style="margin-top:14px"><div class="card" style="border-left:4px solid var(--neon)"><div style="display:flex;justify-content:space-between;align-items:center"><h3 style="margin:0">☀️ Janela de Verão (Início de Ano)</h3><span class="pill \${isTransferWindowOpen(state.season+'-02-01')?'good':''}">01/Jan a 31/Mar</span></div><p class="small muted" style="margin:6px 0 0 0">Período oficial de montagem do elenco. Permite contratações definitivas, empréstimos e vendas.</p></div><div class="card" style="border-left:4px solid var(--cyan)"><div style="display:flex;justify-content:space-between;align-items:center"><h3 style="margin:0">❄️ Janela de Inverno (Meio de Ano)</h3><span class="pill \${isTransferWindowOpen(state.season+'-08-01')?'good':''}">10/Jul a 02/Set</span></div><p class="small muted" style="margin:6px 0 0 0">Período de reforços e ajustes do elenco para o segundo semestre e retas finais dos campeonatos.</p></div></div>
    <div class="filters" style="margin-top:14px"><button type="button" class="btn \${activeCalendarFilter==='ALL'?'primary':''}" data-cal-filter="ALL">📅 Todos os Confrontos (\${allMatches.length})</button>\${competitionTabs.map(tab=>\`<button type="button" class="btn \${activeCalendarFilter===tab.id?'primary':''}" data-cal-filter="\${tab.id}">\${tab.label}</button>\`).join('')}<button type="button" class="btn \${activeCalendarFilter==='HOME'?'primary':''}" data-cal-filter="HOME">🏠 Em Casa</button><button type="button" class="btn \${activeCalendarFilter==='AWAY'?'primary':''}" data-cal-filter="AWAY">✈️ Fora de Casa</button></div>
    <div class="calendar-view" style="margin-top:10px">\${calendarMatches.map(match=>{
      const opponent=match.isHome?match.away:match.home,date=new Date(\`\${match.date}T12:00:00\`),dayNames=['DOM','SEG','TER','QUA','QUI','SEX','SÁB'],dayBadge=dayNames[date.getDay()]||'JOGO',isMidweek=date.getDay()===3,dateFormatted=date.toLocaleDateString('pt-BR',{day:'2-digit',month:'long'});
      let status='<span class="pill muted">⏳ Agendado</span>';
      if(match.historyMatch){const h=match.historyMatch,homeGoals=Number(h.hg)||0,awayGoals=Number(h.ag)||0;status=\`<span class="pill good">\${homeGoals} x \${awayGoals} · Concluído</span>\`;}
      else if(match.competitionId==='COMP'&&match.current)status=\`<button class="btn primary btnCalPlayNow" style="padding:4px 10px;font-size:12px">⚽ Jogar</button>\`;
      else if(match.competitionId.startsWith('bra-est-')&&!match.past&&match.date===state.date)status=\`<button type="button" class="btn primary btnCalStatePlay" data-state-comp="\${match.competitionId}" data-round="\${match.matchIndex}" style="padding:4px 10px;font-size:12px">⚽ Jogar Estadual</button>\`;
      else if(match.competitionId==='bra-cup'&&match.result)status=\`<span class="pill good">\${match.result[0]} x \${match.result[1]} · Concluído</span>\`;
      else if(match.competitionId==='bra-cup'&&match.date===state.date)status=\`<button class="btn primary btnCalCopaPlay" data-phase="\${esc(match.phaseName)}" data-index="\${match.matchIndex}" style="padding:4px 10px;font-size:12px">▶ Jogar Copa do Brasil</button>\`;
      else if(match.matchId&&match.result)status=\`<span class="pill good">\${match.result[0]} x \${match.result[1]} · Concluído</span>\`;
      else if(match.matchId&&match.date===state.date)status=\`<button class="btn primary btnCalTournamentPlay" data-tournament="\${esc(match.competitionId)}" data-match="\${esc(match.matchId)}" style="padding:4px 10px;font-size:12px">⚽ Jogar</button>\`;`,
  `      const date=row?.isoDate||getDateForRound(roundIndex,state.season);
      const historyMatch=saved?{...saved,hg:calendarClubKey(saved.h)===calendarClubKey(home)?saved.hg:saved.ag,ag:calendarClubKey(saved.h)===calendarClubKey(home)?saved.ag:saved.hg}:(row.result?{hg:row.result[0],ag:row.result[1]}:null);
      stateMatches.push({competitionId:stateCompId,name:stateComp.name,home,away,isHome,date,round:\`Rodada \${roundIndex+1}\`,current:date===state.date,past:playedKeys.has(key)||row.played===true||Boolean(row.result),historyMatch,stateFixture:row,matchIndex:roundIndex,fixtureIndex});
    });
    competitionTabs.push({id:stateCompId,name:stateComp.name,label:\`🏟️ \${stateComp.name}\`,matches:stateMatches});
  }
  for(const [id,label] of cupFilters){const matches=extraMatches.filter(m=>m.competitionId===id);if(matches.length)competitionTabs.push({id,name:matches[0].name,label,matches});}
  const activeCalendarFilter=competitionTabs.some(tab=>tab.id===calendarFilter)||['ALL','HOME','AWAY'].includes(calendarFilter)?calendarFilter:'ALL';
  const allMatches=competitionTabs.flatMap(tab=>tab.matches);
  const calendarMatches=allMatches.filter(match=>activeCalendarFilter==='ALL'||(activeCalendarFilter==='HOME'||activeCalendarFilter==='AWAY'?match.isHome===(activeCalendarFilter==='HOME'):match.competitionId===activeCalendarFilter)).sort((a,b)=>a.date.localeCompare(b.date)||(a.competitionId==='COMP'?-1:1));
  return \`
    <div class="hero"><div><h1>Calendário Oficial de Jogos & Janelas de Transferência</h1><div class="muted">Datas dos confrontos, mandos de campo, torneios da temporada \${state.season} e janelas de contratação</div></div><div style="display:flex;gap:10px;align-items:center"><span class="window-badge \${winInfo.open?'window-open':'window-closed'}">\${winInfo.open?'🟢':'🔴'} \${esc(winInfo.text)}</span><span class="pill">\${esc(comp.name)}</span></div></div>
    <div class="grid g2" style="margin-top:14px"><div class="card" style="border-left:4px solid var(--neon)"><div style="display:flex;justify-content:space-between;align-items:center"><h3 style="margin:0">☀️ Janela de Verão (Início de Ano)</h3><span class="pill \${isTransferWindowOpen(state.season+'-02-01')?'good':''}">01/Jan a 31/Mar</span></div><p class="small muted" style="margin:6px 0 0 0">Período oficial de montagem do elenco. Permite contratações definitivas, empréstimos e vendas.</p></div><div class="card" style="border-left:4px solid var(--cyan)"><div style="display:flex;justify-content:space-between;align-items:center"><h3 style="margin:0">❄️ Janela de Inverno (Meio de Ano)</h3><span class="pill \${isTransferWindowOpen(state.season+'-08-01')?'good':''}">10/Jul a 02/Set</span></div><p class="small muted" style="margin:6px 0 0 0">Período de reforços e ajustes do elenco para o segundo semestre e retas finais dos campeonatos.</p></div></div>
    <div class="filters" style="margin-top:14px"><button type="button" class="btn \${activeCalendarFilter==='ALL'?'primary':''}" data-cal-filter="ALL">📅 Todos os Confrontos (\${allMatches.length})</button>\${competitionTabs.map(tab=>\`<button type="button" class="btn \${activeCalendarFilter===tab.id?'primary':''}" data-cal-filter="\${tab.id}">\${tab.label}</button>\`).join('')}<button type="button" class="btn \${activeCalendarFilter==='HOME'?'primary':''}" data-cal-filter="HOME">🏠 Em Casa</button><button type="button" class="btn \${activeCalendarFilter==='AWAY'?'primary':''}" data-cal-filter="AWAY">✈️ Fora de Casa</button></div>
    <div class="calendar-view" style="margin-top:10px">\${calendarMatches.map(match=>{
      const opponent=match.isHome?match.away:match.home,date=new Date(\`\${match.date}T12:00:00\`),dayNames=['DOM','SEG','TER','QUA','QUI','SEX','SÁB'],dayBadge=dayNames[date.getDay()]||'JOGO',isMidweek=date.getDay()===3,dateFormatted=date.toLocaleDateString('pt-BR',{day:'2-digit',month:'long'});
      let status='<span class="pill muted">⏳ Agendado</span>';
      if(match.historyMatch){const h=match.historyMatch,homeGoals=Number(h.hg)||0,awayGoals=Number(h.ag)||0;status=\`<span class="pill good">\${homeGoals} x \${awayGoals} · Concluído</span>\`;}
      else if(match.stateFixture && (match.stateFixture.result || match.stateFixture.played)){const res=match.stateFixture.result||[0,0];status=\`<span class="pill good">\${res[0]} x \${res[1]} · Concluído</span>\`;}
      else if(match.competitionId==='COMP'&&match.current)status=\`<button class="btn primary btnCalPlayNow" style="padding:4px 10px;font-size:12px">⚽ Jogar</button>\`;
      else if(match.competitionId.startsWith('bra-est-')&&!match.past&&match.date<=state.date)status=\`<button type="button" class="btn primary btnCalStatePlay" data-state-comp="\${match.competitionId}" data-round="\${match.matchIndex}" style="padding:4px 10px;font-size:12px">⚽ Jogar Estadual</button>\`;
      else if(match.competitionId==='bra-cup'&&match.result)status=\`<span class="pill good">\${match.result[0]} x \${match.result[1]} · Concluído</span>\`;
      else if(match.competitionId==='bra-cup'&&match.date<=state.date)status=\`<button class="btn primary btnCalCopaPlay" data-phase="\${esc(match.phaseName)}" data-index="\${match.matchIndex}" style="padding:4px 10px;font-size:12px">▶ Jogar Copa do Brasil</button>\`;
      else if(match.matchId&&match.result)status=\`<span class="pill good">\${match.result[0]} x \${match.result[1]} · Concluído</span>\`;
      else if(match.matchId&&match.date<=state.date)status=\`<button class="btn primary btnCalTournamentPlay" data-tournament="\${esc(match.competitionId)}" data-match="\${esc(match.matchId)}" style="padding:4px 10px;font-size:12px">⚽ Jogar</button>\`;`
);

fs.writeFileSync(gameJsPath, code.replace(/\n/g, '\r\n'), 'utf8');
console.log('Successfully updated js/game.js with all 10 patches!');
