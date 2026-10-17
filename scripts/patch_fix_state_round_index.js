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

// 1. simulateQuickStateLeagueRound alreadyPlayed: check h.round === roundIndex + 1
replaceExactlyOnce(
  'simulateQuickStateLeagueRound-alreadyPlayed-roundIndex',
  `  const {home,away}=fixtureRecord;
  const alreadyPlayed = fixtureRecord.played===true || Boolean(fixtureRecord.result) || (state.history||[]).some(h=>h.competitionId===competitionId && Number(h.season)===Number(state.season) && ((norm(h.h)===norm(home)&&norm(h.a)===norm(away))||(norm(h.h)===norm(away)&&norm(h.a)===norm(home))));
  if(alreadyPlayed){toast('Esta partida estadual já foi disputada.');return false;}`,
  `  const {home,away}=fixtureRecord;
  const alreadyPlayed = fixtureRecord.played===true || Boolean(fixtureRecord.result) || (state.history||[]).some(h=>h.competitionId===competitionId && Number(h.season)===Number(state.season) && Number(h.round)===Number(roundIndex)+1 && ((norm(h.h)===norm(home)&&norm(h.a)===norm(away))||(norm(h.h)===norm(away)&&norm(h.a)===norm(home))));
  if(alreadyPlayed){toast('Esta partida estadual já foi disputada.');return false;}`
);

// 2. beginStateLeagueMatch alreadyPlayed: check h.round === roundIndex + 1
replaceExactlyOnce(
  'beginStateLeagueMatch-alreadyPlayed-roundIndex',
  `  const {home,away}=fixtureRecord;
  const alreadyPlayed = fixtureRecord.played===true || Boolean(fixtureRecord.result) || (state.history||[]).some(h=>h.competitionId===competitionId && Number(h.season)===Number(state.season) && ((norm(h.h)===norm(home)&&norm(h.a)===norm(away))||(norm(h.h)===norm(away)&&norm(h.a)===norm(home))));
  if(alreadyPlayed){toast('Esta partida estadual já foi disputada. O resultado salvo foi preservado.');return false;}`,
  `  const {home,away}=fixtureRecord;
  const alreadyPlayed = fixtureRecord.played===true || Boolean(fixtureRecord.result) || (state.history||[]).some(h=>h.competitionId===competitionId && Number(h.season)===Number(state.season) && Number(h.round)===Number(roundIndex)+1 && ((norm(h.h)===norm(home)&&norm(h.a)===norm(away))||(norm(h.h)===norm(away)&&norm(h.a)===norm(home))));
  if(alreadyPlayed){toast('Esta partida estadual já foi disputada. O resultado salvo foi preservado.');return false;}`
);

// 3. calendarPage stateMatches: match saved by roundIndex + 1
replaceExactlyOnce(
  'calendarPage-stateMatches-roundIndex',
  `    const data=getStateCompData(stateCompId), played=(state.history||[]).filter(h=>h.competitionId===stateCompId&&Number(h.season)===Number(state.season)), playedKeys=new Set(played.map(h=>[calendarClubKey(h.h),calendarClubKey(h.a)].sort().join('|'))), stateMatches=[];
    (data.fixtures||[]).forEach((row,fixtureIndex)=>{
      if(calendarClubKey(row.home)!==calendarClubKey(myClub)&&calendarClubKey(row.away)!==calendarClubKey(myClub))return;
      const {home,away}=row,roundIndex=Number(row.roundIndex)||0,isHome=calendarClubKey(home)===calendarClubKey(myClub),key=[calendarClubKey(home),calendarClubKey(away)].sort().join('|');
      const saved=played.find(h=>(calendarClubKey(h.h)===calendarClubKey(home)&&calendarClubKey(h.a)===calendarClubKey(away))||(calendarClubKey(h.h)===calendarClubKey(away)&&calendarClubKey(h.a)===calendarClubKey(home)));
      const date=row?.isoDate||getDateForRound(roundIndex,state.season);
      const historyMatch=saved?{...saved,hg:calendarClubKey(saved.h)===calendarClubKey(home)?saved.hg:saved.ag,ag:calendarClubKey(saved.h)===calendarClubKey(home)?saved.ag:saved.hg}:(row.result?{hg:row.result[0],ag:row.result[1]}:null);
      stateMatches.push({competitionId:stateCompId,name:stateComp.name,home,away,isHome,date,round:\`Rodada \${roundIndex+1}\`,current:date===state.date,past:playedKeys.has(key)||row.played===true||Boolean(row.result),historyMatch,stateFixture:row,matchIndex:roundIndex,fixtureIndex});
    });`,
  `    const data=getStateCompData(stateCompId), played=(state.history||[]).filter(h=>h.competitionId===stateCompId&&Number(h.season)===Number(state.season)), stateMatches=[];
    (data.fixtures||[]).forEach((row,fixtureIndex)=>{
      if(calendarClubKey(row.home)!==calendarClubKey(myClub)&&calendarClubKey(row.away)!==calendarClubKey(myClub))return;
      const {home,away}=row,roundIndex=Number(row.roundIndex)||0,isHome=calendarClubKey(home)===calendarClubKey(myClub);
      const saved=played.find(h=>Number(h.round)===roundIndex+1&&((calendarClubKey(h.h)===calendarClubKey(home)&&calendarClubKey(h.a)===calendarClubKey(away))||(calendarClubKey(h.h)===calendarClubKey(away)&&calendarClubKey(h.a)===calendarClubKey(home))));
      const date=row?.isoDate||getDateForRound(roundIndex,state.season);
      const historyMatch=saved?{...saved,hg:calendarClubKey(saved.h)===calendarClubKey(home)?saved.hg:saved.ag,ag:calendarClubKey(saved.h)===calendarClubKey(home)?saved.ag:saved.hg}:(row.result?{hg:row.result[0],ag:row.result[1]}:null);
      stateMatches.push({competitionId:stateCompId,name:stateComp.name,home,away,isHome,date,round:\`Rodada \${roundIndex+1}\`,current:date===state.date,past:row.played===true||Boolean(row.result)||Boolean(saved),historyMatch,stateFixture:row,matchIndex:roundIndex,fixtureIndex});
    });`
);

fs.writeFileSync(gameJsPath, code.replace(/\n/g, '\r\n'), 'utf8');
console.log('Successfully updated js/game.js with state roundIndex fixes!');
