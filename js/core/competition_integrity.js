// CRITICAL SYSTEM INVARIANT — league membership and qualification.
// A save's current competition, participating rosters, standings and generated
// fixtures must agree. Historical BASE_COMPETITION_TEAMS is recovery metadata
// only; it must never overwrite legitimate seasonal movements.
window.AFM_COMPETITION_INTEGRITY = (() => {
  const NATIONAL_IDS = ['bra-a', 'bra-b', 'bra-c', 'bra-d'];
  const CAPACITY = { 'bra-a': 20, 'bra-b': 20, 'bra-c': 20, 'bra-d': 96 };
  const normalize = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

  function ranking(rows) {
    return [...(Array.isArray(rows) ? rows : [])].filter(row => row && row.name).sort((a, b) =>
      (Number(b.p) || 0) - (Number(a.p) || 0) ||
      (Number(b.v) || 0) - (Number(a.v) || 0) ||
      ((Number(b.gp) || 0) - (Number(b.gc) || 0)) - ((Number(a.gp) || 0) - (Number(a.gc) || 0)) ||
      (Number(b.gp) || 0) - (Number(a.gp) || 0) || normalize(a.name).localeCompare(normalize(b.name))
    );
  }

  function hashSeed(value){let n=2166136261;for(const ch of String(value)){n^=ch.charCodeAt(0);n=Math.imul(n,16777619);}return n>>>0;}
  function seededScore(home,away,seed,ratings={}){
    const rating=name=>Math.max(35,Math.min(99,Number(ratings[normalize(name)])||50+(hashSeed(name)%35)));
    const diff=rating(home)-rating(away),h=hashSeed(`${seed}|H|${normalize(home)}|${normalize(away)}`),a=hashSeed(`${seed}|A|${normalize(home)}|${normalize(away)}`);
    return [Math.max(0,Math.min(5,Math.floor((h%100)/39+diff/26))),Math.max(0,Math.min(5,Math.floor((a%100)/42-diff/28)))];
  }
  function newRow(name){return {name,p:0,j:0,v:0,e:0,d:0,gp:0,gc:0,sg:0,form:[]};}
  function addResult(home,away,hg,ag){home.j++;away.j++;home.gp+=hg;home.gc+=ag;away.gp+=ag;away.gc+=hg;home.sg=home.gp-home.gc;away.sg=away.gp-away.gc;if(hg>ag){home.v++;home.p+=3;away.d++;}else if(hg<ag){away.v++;away.p+=3;home.d++;}else{home.e++;away.e++;home.p++;away.p++;}}
  function simulateTable(teamNames,season,id,engine,ratings={},seed=''){
    if(!engine?.roundRobinFixtures)return null;
    const names=[...new Map((teamNames||[]).filter(Boolean).map(n=>[normalize(n),n])).values()],rows=new Map(names.map(n=>[normalize(n),newRow(n)]));
    const fixtures=engine.roundRobinFixtures({id,season,teamNames:names,startDate:`${season}-03-01`,homeAway:true});
    for(const f of fixtures){const [hg,ag]=seededScore(f.home,f.away,`${seed}|${f.round}`,ratings);addResult(rows.get(normalize(f.home)),rows.get(normalize(f.away)),hg,ag);}
    return {complete:fixtures.length>0,standings:ranking([...rows.values()]),fixtures};
  }
  function simulateGroups(groups,season,id,engine,ratings={},seed=''){
    if(!engine?.groupFixtures)return null;
    const fixtures=engine.groupFixtures({id,season,groups,startDate:`${season}-03-01`}),tables=Object.fromEntries(Object.entries(groups).map(([g,names])=>[g,names.map(newRow)])),byName=new Map(Object.values(tables).flat().map(r=>[normalize(r.name),r]));
    for(const f of fixtures){const [hg,ag]=seededScore(f.home,f.away,`${seed}|${f.group}|${f.round}`,ratings);const h=byName.get(normalize(f.home)),a=byName.get(normalize(f.away));if(h&&a)addResult(h,a,hg,ag);}
    for(const g of Object.keys(tables))tables[g]=ranking(tables[g]);
    return {complete:fixtures.length>0,tables,fixtures};
  }
  function resolvePlayoffWinners(candidates,count,seed,ratings={}){
    let pool=[...new Map((candidates||[]).map(n=>[normalize(n),n])).values()],round=0;
    while(pool.length>count&&pool.length>1){const next=[];for(let i=0;i<pool.length;i+=2){if(!pool[i+1]){next.push(pool[i]);continue;}const home=pool[i],away=pool[i+1],[h1,a1]=seededScore(home,away,`${seed}|${round}|${i}|1`,ratings),[a2,h2]=seededScore(away,home,`${seed}|${round}|${i}|2`,ratings),hs=h1+h2,as=a1+a2;next.push(hs===as?((Number(ratings[normalize(home)])||50)+hashSeed(seed+home)%9>=(Number(ratings[normalize(away)])||50)+hashSeed(seed+away)%9?home:away):(hs>as?home:away));}pool=next;round++;}
    return pool.slice(0,count);
  }
  function simulateBrazilSeason(rosters,season,activeId,activeRanking,engine,ratings={},transition={}){
    const map=Object.fromEntries(NATIONAL_IDS.map(id=>[id,[...(rosters?.[id]||[])]])),preAudit=audit(map);
    if(!preAudit.valid)return {valid:false,issues:preAudit.issues,rosters:map};
    const standings={};
    for(const id of NATIONAL_IDS){
      if(id===activeId&&Array.isArray(activeRanking)&&activeRanking.length===CAPACITY[id])standings[id]=ranking(activeRanking);
      else{const sim=simulateTable(map[id],season,id,engine,ratings,`${season}|${id}`);if(!sim?.complete||sim.standings.length!==CAPACITY[id])return {valid:false,issues:[{code:'incomplete-season-table',competitionId:id}],rosters:map};standings[id]=sim.standings;}
    }
    const b=ranking(standings['bra-b']),bWinners=resolvePlayoffWinners(b.slice(2,6).map(r=>r.name),2,`${season}|bra-b-playoffs`,ratings),c=ranking(standings['bra-c']);
    const cGroups={A:c.slice(0,4).map(r=>r.name),B:c.slice(4,8).map(r=>r.name)},cSim=simulateGroups(cGroups,season,'bra-c-quadrangular',engine,ratings,`${season}|bra-c-quadrangular`);
    if(!cSim?.complete)return {valid:false,issues:[{code:'missing-bra-c-quadrangular-results'}],rosters:map};
    const dGroups={};for(let i=0;i<16;i++)dGroups[String.fromCharCode(65+i)]=map['bra-d'].slice(i*6,i*6+6);
    const dSim=simulateGroups(dGroups,season,'bra-d-groups',engine,ratings,`${season}|bra-d-groups`);
    if(!dSim?.complete)return {valid:false,issues:[{code:'missing-bra-d-group-results'}],rosters:map};
    const dCandidates=Object.values(dSim.tables).flatMap(group=>ranking(group).slice(0,4).map(r=>r.name));
    // Main bracket establishes four semifinalists; two extra access places are
    // resolved by a playoff among other group-qualified clubs. This models the
    // six promotion places required by this game's defined Series D format.
    const dSemiFinalists=resolvePlayoffWinners(dCandidates,4,`${season}|bra-d-main-knockout`,ratings);
    const dOtherPlayoffCandidates=dCandidates.filter(name=>!dSemiFinalists.some(w=>normalize(w)===normalize(name)));
    const dAdditional=resolvePlayoffWinners(dOtherPlayoffCandidates,2,`${season}|bra-d-extra-access-playoff`,ratings);
    const dWinners=[...dSemiFinalists,...dAdditional].slice(0,6);
    const plan=applyBrazilPromotions(map,standings,{activeCompId:activeId,activeRanking,finalGroups:{'bra-c':Object.values(cSim.tables)},groupStandings:{'bra-d':Object.values(dSim.tables)},playoffWinners:{'bra-b':bWinners,'bra-d':dWinners}});
    const stateRosterUpdates={};
    // An explicit state-league access earned by this career must survive the
    // national rollover. Exchange one Serie D place and persist both lists.
    if(!activeId && transition.requestedDestinationCompId==='bra-d' && transition.userClub){
      const user=transition.userClub,userKey=normalize(user);
      if(!plan.rosters['bra-d'].some(name=>normalize(name)===userKey)){
        const dRows=[...(standings['bra-d']||[])].reverse();
        const demoteCandidate=dRows.find(row=>normalize(row.name)!==userKey && !plan.decisions['bra-d']?.promoted?.some(name=>normalize(name)===normalize(row.name)))?.name
          || plan.rosters['bra-d'].find(name=>normalize(name)!==userKey);
        if(!demoteCandidate){plan.issues.push({code:'no-replaceable-series-d-slot',club:user});plan.valid=false;}
        else{
          plan.rosters['bra-d']=plan.rosters['bra-d'].filter(name=>normalize(name)!==normalize(demoteCandidate));
          plan.rosters['bra-d'].push(user);
          const stateId=transition.sourceCompId;
          if(stateId && String(stateId).startsWith('bra-est-')){
            const stateRoster=[...(transition.stateRosters?.[stateId]||[])],index=stateRoster.findIndex(name=>normalize(name)===userKey);
            if(index>=0)stateRoster[index]=demoteCandidate;
            else if(!stateRoster.some(name=>normalize(name)===normalize(demoteCandidate)))stateRoster.push(demoteCandidate);
            stateRosterUpdates[stateId]=stateRoster;
          }
          plan.movers.push({name:user,from:stateId||'estadual',to:'bra-d',reason:'state-promotion'});
          plan.movers.push({name:demoteCandidate,from:'bra-d',to:stateId||'estadual',reason:'state-slot-reallocation'});
        }
      }
    }
    const rosterAudit=audit(plan.rosters);
    return {...plan,valid:plan.valid&&rosterAudit.valid,issues:[...(plan.issues||[]),...(rosterAudit.valid?[]:rosterAudit.issues)],stateRosterUpdates,standings,finalGroups:{'bra-c':Object.values(cSim.tables)},groupStandings:{'bra-d':Object.values(dSim.tables)},playoffWinners:{'bra-b':bWinners,'bra-d':dWinners},season:Number(season)};
  }

  function standingsMap(source) {
    const map = {};
    Object.entries(source || {}).forEach(([id, rows]) => {
      if (Array.isArray(rows)) map[id] = ranking(rows);
    });
    return map;
  }

  // Pure planner; callers atomically persist a complete, validated result.
  function applyBrazilPromotions(rosters, standings, options = {}) {
    const map = Object.fromEntries(NATIONAL_IDS.map(id => [id, [...new Set((rosters?.[id] || []).filter(Boolean))]]));
    const table = standingsMap(standings);
    if (options.activeCompId && NATIONAL_IDS.includes(options.activeCompId) && Array.isArray(options.activeRanking) && options.activeRanking.length) {
      table[options.activeCompId] = ranking(options.activeRanking);
    }
    const eligibleRows = id => ranking(table[id]).filter(row => map[id].some(name => normalize(name) === normalize(row.name)));
    const a = eligibleRows('bra-a'), b = eligibleRows('bra-b'), c = eligibleRows('bra-c'), d = eligibleRows('bra-d');
    const movers = [];
    const decisions = {};

    // Série B: 1st/2nd automatic. Places 3–6 only advance with recorded playoff winners.
    const bAuto = b.slice(0, 2).map(row => row.name);
    const bPlayoff = b.slice(2, 6).map(row => row.name);
    const bPlayoffWinners = (options.playoffWinners?.['bra-b'] || []).filter(name => bPlayoff.some(row => normalize(row) === normalize(name))).slice(0, 2);
    const bPromoted = [...bAuto, ...bPlayoffWinners];
    const bRelegated = b.slice(-4).map(row => row.name);
    decisions['bra-b'] = { promoted: bPromoted, playoff: bPlayoff, relegated: bRelegated };
    movers.push(...bPromoted.map(name => ({ name, from: 'bra-b', to: 'bra-a', reason: 'promotion' })));
    movers.push(...bRelegated.map(name => ({ name, from: 'bra-b', to: 'bra-c', reason: 'relegation' })));

    // Série C: only classify by the real final quadrangular tables supplied by the engine.
    const cGroups = options.finalGroups?.['bra-c'];
    const cPromoted = Array.isArray(cGroups) ? cGroups.flatMap(group => ranking(group).slice(0, 2).map(row => row.name)).slice(0, 4) : [];
    // Six Série D clubs earn Série C places. Six C clubs therefore must leave
    // for D for the pyramid to conserve the configured 20-club capacity.
    const cRelegated = c.slice(-6).map(row => row.name);
    decisions['bra-c'] = { promoted: cPromoted, relegated: cRelegated };
    movers.push(...cPromoted.map(name => ({ name, from: 'bra-c', to: 'bra-b', reason: 'promotion' })));
    movers.push(...cRelegated.map(name => ({ name, from: 'bra-c', to: 'bra-d', reason: 'relegation' })));

    // Série D: 16 groups, top four each advance; only recorded knockout winners earn six slots.
    const dGroups = options.groupStandings?.['bra-d'];
    const dQualifiers = Array.isArray(dGroups) ? dGroups.flatMap(group => ranking(group).slice(0, 4).map(row => row.name)) : [];
    const validDPlayoffWinners = (options.playoffWinners?.['bra-d'] || []).filter(name => dQualifiers.some(row => normalize(row) === normalize(name)));
    const dPromoted = validDPlayoffWinners.slice(0, 6);
    decisions['bra-d'] = { qualifiers: dQualifiers, promoted: dPromoted, relegated: [] };
    movers.push(...dPromoted.map(name => ({ name, from: 'bra-d', to: 'bra-c', reason: 'promotion' })));
    const aRelegated = a.slice(-4).map(row => row.name);
    decisions['bra-a'] = { relegated: aRelegated };
    movers.push(...aRelegated.map(name => ({ name, from: 'bra-a', to: 'bra-b', reason: 'relegation' })));
    // Every destination must have the exact number of incoming/outgoing slots.
    // Incomplete playoffs/groups are a blocked transition, not permission to
    // substitute clubs from the static catalog.
    if (bPromoted.length !== 4) decisions['bra-b'].pending = 'playoff-results';
    if (cPromoted.length !== 4) decisions['bra-c'].pending = 'final-quadrangulars';
    if (dPromoted.length !== 6) decisions['bra-d'].pending = 'knockout-playoff-results';

    const proposed = Object.fromEntries(NATIONAL_IDS.map(id => [id, [...map[id]]]));
    // Remove every mover from old divisions first; then insert as a single transaction.
    for (const move of movers) for (const id of NATIONAL_IDS) proposed[id] = proposed[id].filter(name => normalize(name) !== normalize(move.name));
    for (const move of movers) if (!proposed[move.to].some(name => normalize(name) === normalize(move.name))) proposed[move.to].push(move.name);
    const seen = new Set();
    for (const id of NATIONAL_IDS) {
      proposed[id] = [...new Map(proposed[id].filter(Boolean).map(name => [normalize(name), name])).values()].filter(name => {
        const key = normalize(name); if (!key || seen.has(key)) return false; seen.add(key); return true;
      });
    }
    const issues = NATIONAL_IDS.flatMap(id => proposed[id].length === CAPACITY[id] ? [] : [{ competitionId: id, expected: CAPACITY[id], actual: proposed[id].length }]);
    for (const [id, decision] of Object.entries(decisions)) if (decision.pending) issues.push({ code: 'results-pending', competitionId: id, required: decision.pending });
    return { rosters: proposed, movers, decisions, issues, valid: issues.length === 0 };
  }

  function audit(rosters) {
    const issues = [], seen = new Map();
    for (const id of NATIONAL_IDS) {
      const names = rosters?.[id] || [];
      if (names.length !== CAPACITY[id]) issues.push({ code: 'capacity', competitionId: id, expected: CAPACITY[id], actual: names.length });
      names.forEach(name => {
        const key = normalize(name);
        if (!key) issues.push({ code: 'empty-name', competitionId: id });
        if (seen.has(key)) issues.push({ code: 'duplicate-membership', club: name, competitions: [seen.get(key), id] });
        else seen.set(key, id);
      });
    }
    return { valid: issues.length === 0, issues };
  }

  function uniqueEntries(entries, limit, excluded = []){
    const seen=new Set((excluded||[]).map(normalize)),out=[];
    for(const item of entries||[]){const row=typeof item==='string'?{name:item}:item;if(!row?.name)continue;const key=normalize(row.name);if(!key||seen.has(key))continue;seen.add(key);out.push({...row});if(out.length===limit)break;}
    return out;
  }
  function makeGroups(participants, groupCount, groupSize){
    const groups={};for(let i=0;i<groupCount;i++)groups[String.fromCharCode(65+i)]=[];
    (participants||[]).forEach((name,index)=>groups[String.fromCharCode(65+(Math.floor(index/groupSize)%groupCount))].push(name));
    return groups;
  }
  // Qualification lists are generated once at the end of a season and saved
  // under the next season number. Duplicate cup/league slots are redistributed
  // through the ordered table instead of allowing the same club twice.
  function buildContinentalQualifications(season, leagueTables = {}, cupWinners = {}, champions = {}, worldRanking = []){
    const nextSeason=Number(season)+1, result={};
    const table=id=>ranking(leagueTables[id]||[]).map((row,index)=>({...row,source:id,position:index+1,reason:'league-ranking'}));
    const set=(id,count,entries,format='groups',excluded=[])=>{
      const records=uniqueEntries(entries,count,excluded),participants=records.map(row=>row.name);
      result[id]={season:nextSeason,competitionId:id,generatedFrom:Number(season),participants,provenance:records,
        status:participants.length===count?'qualified':'pending-slots',missingSlots:Math.max(0,count-participants.length),
        groups:participants.length===count&&format==='groups'?makeGroups(participants,(id==='lib'||id==='sud'||id==='afc2')?8:Math.ceil(count/4),4):null};
    };
    const brazil=table('bra-a');
    const libEntries=[...(cupWinners['bra-cup']?[{name:cupWinners['bra-cup'],source:'bra-cup',reason:'domestic-cup-winner'}]:[]),
      ...(cupWinners.lib?[{name:cupWinners.lib,source:'libertadores-winner',reason:'continental-champion'}]:[]),
      ...brazil.slice(0,6).map((row,index)=>({...row,source:'bra-a',position:index+1})),
      ...['arg-1','uru-1','chi-1','col-1','par-1','ecu-1','per-1','bol-1','ven-1'].flatMap(id=>table(id).slice(0,3))];
    const sudEntries=[...(cupWinners.sud?[{name:cupWinners.sud,source:'sudamericana-winner',reason:'continental-champion'}]:[]),
      ...brazil.slice(6,12).map((row,index)=>({...row,source:'bra-a',position:index+7})),
      ...['arg-1','uru-1','chi-1','col-1','par-1','ecu-1','per-1','bol-1','ven-1'].flatMap(id=>table(id).slice(3,6))];
    set('lib',32,libEntries);set('sud',32,sudEntries);
    const ucl=[],uel=[],uecl=[];
    const eligibleEuropeanLeagues=['eng-1','esp-1','ita-1','ger-1','fra-1','por-1','ned-1','bel-1','tur-1','sco-1','aut-1','sui-1','gre-1','cro-1','ser-1','cze-1','den-1','nor-1','swe-1'];
    for(const id of eligibleEuropeanLeagues){
      ucl.push(...table(id).slice(0,4));uel.push(...table(id).slice(4,6));uecl.push(...table(id).slice(6,8));
    }
    set('ucl',36,[...(champions.ucl?[{name:champions.ucl,source:'ucl-winner',reason:'continental-champion'}]:[]),...ucl],'league');
    set('uel',36,[...(champions.uel?[{name:champions.uel,source:'uel-winner',reason:'continental-champion'}]:[]),...uel],'league');
    set('uecl',36,[...(champions.uecl?[{name:champions.uecl,source:'uecl-winner',reason:'continental-champion'}]:[]),...uecl],'league');
    const afcElite=[],afcTwo=[];
    for(const id of ['ksa-1','jpn-1','kor-1','chn-1','qat-1','uae-1']){afcElite.push(...table(id).slice(0,3));afcTwo.push(...table(id).slice(3,5));}
    for(const id of ['irn-1','ind-1','aus-1'])afcTwo.push(...table(id).slice(0,3));
    for(const id of ['irn-1','ind-1','aus-1','tha-1'])afcElite.push(...table(id).slice(0,3));
    set('afc-el',24,[...(champions['afc-el']?[{name:champions['afc-el'],source:'afc-el-winner',reason:'continental-champion'}]:[]),...afcElite],'league');
    for(const id of ['ksa-1','jpn-1','kor-1','chn-1','qat-1','uae-1','irn-1','ind-1','aus-1','tha-1'])afcTwo.push(...table(id).slice(0,10));
    set('afc2',32,[...(champions.afc2?[{name:champions.afc2,source:'afc2-winner',reason:'continental-champion'}]:[]),...afcTwo], 'groups', result['afc-el']?.participants || []);
    const cwcEntries=[];
    for(const id of ['lib','sud','ucl','uel','uecl','afc-el','afc2'])if(champions[id])cwcEntries.push({name:champions[id],source:id,reason:'continental-champion'});
    cwcEntries.push(...(worldRanking||[]).map((entry,index)=>typeof entry==='string'?{name:entry,source:'world-ranking',position:index+1}:entry));
    set('cwc',32,cwcEntries);
    return result;
  }
  return { NATIONAL_IDS, CAPACITY, normalize, ranking, applyBrazilPromotions, audit, simulateBrazilSeason, simulateTable, simulateGroups, buildContinentalQualifications, uniqueEntries, makeGroups };
})();
