const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '..', 'js/game.js'), 'utf8');
function extract(name, nextName){ const start=source.indexOf(`function ${name}(`); const end=source.indexOf(`\nfunction ${nextName}(`,start); assert(start>=0&&end>start,`Não localizou ${name}()`); return source.slice(start,end).trim(); }
const initializer=extract('initCandangaoData','initCandangaoStats');
const statsInitializer=source.slice(source.indexOf('function initCandangaoStats(){'),source.indexOf('\nfunction getStateCompData(cId){')).trim();
const getData=extract('getStateCompData','getStateCompStats');
const getStats=extract('getStateCompStats','addPlayerMatchStats');
const norm=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const teams=['Gama','Capital-DF','Sobradinho','Samambaia','Ceilândia','Paranoá','Real Brasília','Brasiliense','ARUC','Brasília'];
const context={state:{season:2027,club:'Brasília',estadualData:{},competitionStats:{},competitionTeams:{}},window:{COMPETITION_TEAMS:{'bra-est-df':teams}},norm,clubStateCompId:()=> 'bra-est-df',roundRobin:names=>{const list=[...names];if(list.length%2)list.push('FOLGA');const rounds=[];let a=[...list];for(let r=0;r<a.length-1;r++){const g=[];for(let i=0;i<a.length/2;i++)if(a[i]!=='FOLGA'&&a[a.length-1-i]!=='FOLGA')g.push([a[i],a[a.length-1-i]]);rounds.push(g);a=[a[0],a[a.length-1],...a.slice(1,-1)];}return rounds.concat(rounds.map(g=>g.map(([h,a])=>[a,h])));},getDateForRound:(round,season)=>{const d=new Date(`${season}-01-17T12:00:00Z`);d.setUTCDate(d.getUTCDate()+Math.floor(round*2.5));return d.toISOString().slice(0,10);},formatDatePtBr:date=>date,clubByName:name=>({name,stadium:`Estádio ${name}`}),compById:id=>({id,name:'Campeonato Candango'}),clone:value=>JSON.parse(JSON.stringify(value)),console};
vm.runInNewContext(`${initializer}\n${statsInitializer}\n${getData}\n${getStats}\nthis.getData=getStateCompData;this.getStats=getStateCompStats;`,context);
const data=context.getData('bra-est-df');
assert.equal(data.season,2027);assert.equal(data.teams.length,10);assert(data.teams.every(t=>t.p===0&&t.j===0&&t.v===0&&t.e===0&&t.d===0&&t.gp===0&&t.gc===0&&t.sg===0&&t.pct===0&&t.form.length===0));
assert.equal(data.fixtures.length,teams.length*(teams.length-1));assert(data.fixtures.every(f=>f.isoDate.startsWith('2027-')));assert(data.fixtures.some(f=>norm(f.home)==='brasilia'||norm(f.away)==='brasilia'));
assert.equal(new Set(data.fixtures.map(f=>f.roundIndex)).size,2*(teams.length-1),'Todos os turnos (ida e volta) devem ser persistidos');
const roundDates=[...new Set(data.fixtures.map(f=>[f.roundIndex,f.isoDate].join('|')))].map(row=>row.split('|')).sort((a,b)=>Number(a[0])-Number(b[0]));
for(let round=1;round<roundDates.length;round++){const previous=roundDates[round-1][1],current=roundDates[round][1];const gap=(Date.parse(`${current}T00:00:00Z`)-Date.parse(`${previous}T00:00:00Z`))/86400000;assert(gap===2||gap===3,`Rodadas estaduais devem ter intervalo de 2–3 dias, encontrado ${gap}`);}
context.state.estadualData['bra-est-df']={...data,season:2026,teams:data.teams.map(t=>({...t,j:1,p:3})),fixtures:data.fixtures.map(f=>({...f,score:[2,0]}))};
const rolled=context.getData('bra-est-df');assert.equal(rolled.season,2027);assert(context.state.estadualArchive['bra-est-df'].some(s=>s.season===2026));assert(rolled.teams.every(t=>t.j===0&&t.p===0));
const stats=context.getStats('bra-est-df');assert.equal(stats.season,2027);assert.equal(stats.scorers.length,0);assert.equal(stats.assists.length,0);
assert(source.includes('const activeRoundDate = getDateForRound(state.round || 0, state.season);'));assert(source.includes('${estData.season || state.season} · ${estData.teams.length} CLUBES'));
console.log('PASS: dados estaduais zerados, temporada correta, jogos do Brasília, histórico arquivado e estatísticas limpas.');
// Regra permanente: um clube pode pertencer a Série A-D e ao estadual ao mesmo tempo.
{
  const gameSource = fs.readFileSync(path.join(__dirname, '..', 'js/game.js'), 'utf8');
  const dateStart = gameSource.indexOf('function getDateForRound(');
  const dateEnd = gameSource.indexOf('\nfunction ensureMidweekDate(', dateStart);
  assert(dateStart >= 0 && dateEnd > dateStart, 'Não encontrou a regra central de datas.');
  const dateContext = { state:{season:2027}, Date };
  vm.runInNewContext(`${gameSource.slice(dateStart,dateEnd)}\nthis.dateForRound=getDateForRound;`, dateContext);
  const dates = Array.from({length:24},(_,round)=>dateContext.dateForRound(round,2027));
  for(let i=1;i<dates.length;i++){
    const gap=(Date.parse(`${dates[i]}T00:00:00Z`)-Date.parse(`${dates[i-1]}T00:00:00Z`))/86400000;
    assert(gap===2||gap===3, `As rodadas precisam respeitar 2-3 dias (round ${i}: ${gap}).`);
  }
  const start = gameSource.indexOf('function getClubCompetitionIds(');
  const end = gameSource.indexOf('\nfunction compBaseStrength(',start);
  assert(start>=0&&end>start,'Não encontrou o catálogo completo de competições do clube.');
  const rosterContext={state:{compId:'bra-a',competitionTeams:{'bra-a':['Corinthians'],'bra-est-sp':['Corinthians']}},window:{COMPETITION_TEAMS:{'bra-a':['Corinthians'],'bra-est-sp':['Corinthians']},COMPETITIONS:[]},norm,clubStateCompId:()=> 'bra-est-sp',getClubPrimaryCompetitionId:()=> 'bra-a',compById:()=>({id:'bra-a'}),eligibleClubNames:()=>[],clubByName:()=>null};
  vm.runInNewContext(`${gameSource.slice(start,end)}\nthis.ids=getClubCompetitionIds;`,rosterContext);
  assert.deepEqual(Array.from(rosterContext.ids('Corinthians')).sort(),['bra-a','bra-est-sp']);
  assert.match(gameSource,/CRITICAL INVARIANT: national division swaps must never alter state-league rosters/);
  assert.match(gameSource,/btnCalStatePlay.*beginStateLeagueMatch|btnCalStatePlay/);
  assert.match(gameSource,/Partidas estaduais não passam pelo finalizador da temporada nacional/);
  assert.match(gameSource,/Todos os Confrontos \(\$\{allMatches.length\}\)/);
  assert.match(gameSource,/fixtureRecord\.played===true \|\| Boolean\(fixtureRecord\.result\)/);
  assert.match(gameSource,/Never replace the full persisted estadual calendar with the active round only/,'A sincronização não pode reduzir o calendário à rodada ativa.');
  assert.match(gameSource,/btn-est-round-prev, \.btn-est-round-next/,'Controles de rodada precisam de eventos funcionais.');
  assert.match(gameSource,/estData\.fixtures\.filter\(f => Number\(f\.roundIndex\|\|0\) === Math\.max\(0, Number\(estData\.currentRound\|\|1\)-1\)\)/,'A tela estadual deve mostrar a rodada selecionada.');
  // Old saves: repair a truncated fixture list without erasing the score/history.
  context.state.competitionTeams = {};
  context.state.history = [];
  context.state.estadualData['bra-est-df'] = {
    season:2027,
    teams:[{name:'Brasília',p:3,j:1,v:1,e:0,d:0,gp:2,gc:0,sg:2,pct:100,form:['V']}],
    fixtures:[{home:'Gama',away:'Capital-DF',roundIndex:0,isoDate:'2027-01-17',result:[2,0],played:true}]
  };
  const repaired = context.getData('bra-est-df');
  assert.equal(repaired.fixtures.length,teams.length*(teams.length-1),'Save antigo precisa reconstruir a tabela completa de ida e volta.');
  assert(repaired.fixtures.some(f=>norm(f.home)==='brasilia'||norm(f.away)==='brasilia'),'Brasília precisa continuar no estadual mesmo após promoção nacional.');
  assert(repaired.fixtures.some(f=>norm(f.home)==='gama'&&norm(f.away)==='capital-df'&&f.played&&f.result[0]===2),'Resultado estadual disputado deve sobreviver à reconstrução.');
  assert(context.state.competitionTeams['bra-est-df'].some(name=>norm(name)==='brasilia'),'O roster estadual precisa voltar a persistir no save.');
  assert(repaired.fixtures.find(f=>norm(f.home)==='gama'&&norm(f.away)==='capital-df').played,'Resultado finalizado precisa continuar marcado, impedindo replay mesmo se a classificação estiver incompleta.');
  console.log('PASS: calendário estadual completo, intervalo de 2–3 dias, associação Série+Estadual, abas oficiais, bloqueio de repetição e isolamento da liga nacional.');
}
