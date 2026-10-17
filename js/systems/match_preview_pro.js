/**
 * AFM Manager - Match Preview Pro & Smart Club Info Engine
 * Prévia completa e cinematográfica de partidas: raio-x de elencos, provável 11 inicial,
 * comparativo setor a setor, probabilidades estatísticas, histórico de jogos disputados e resolução inteligente de tabelas.
 */
(function() {
  'use strict';

  const normClub = name => String(name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  const norm = normClub;
  if (typeof window !== 'undefined') {
    window.norm = normClub;
  }

  const esc = (s) => (window.esc ? window.esc(s) : (typeof s === 'string' ? s.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])) : String(s ?? '')));
  const resolveActualMatch = s => (window.getActualCurrentMatch ? window.getActualCurrentMatch(s) : (typeof getActualCurrentMatch === 'function' ? getActualCurrentMatch(s) : null));
  const resolveUserFixture = () => (window.userFixture ? window.userFixture() : (typeof userFixture === 'function' ? userFixture() : null));
  const resolveClubByName = name => (window.clubByName ? window.clubByName(name) : (typeof clubByName === 'function' ? clubByName(name) : null));
  const resolveCurComp = () => (window.curComp ? window.curComp() : (typeof curComp === 'function' ? curComp() : null));
  const resolveOverallSquad = () => (window.overallSquad ? window.overallSquad() : (typeof overallSquad === 'function' ? overallSquad() : 75));
  const resolveClubStadium = () => (window.clubStadiumName ? window.clubStadiumName() : (typeof clubStadiumName === 'function' ? clubStadiumName() : 'Estádio Principal'));
  const resolveWeather = (d, r) => (window.getMatchWeather ? window.getMatchWeather(d, r) : (typeof getMatchWeather === 'function' ? getMatchWeather(d, r) : { icon: '☀️', condition: 'Céu Limpo', temp: 24 }));
  const resolvePlayerPhoto = (p, sz) => (window.playerPhoto ? window.playerPhoto(p, sz) : (typeof playerPhoto === 'function' ? playerPhoto(p, sz) : ''));
  const resolveClubBadge = (c, sz) => (window.clubBadge ? window.clubBadge(c, sz) : (typeof clubBadge === 'function' ? clubBadge(c, sz) : ''));
  const resolvePlayerSalary = p => (window.playerSalary ? window.playerSalary(p) : (typeof playerSalary === 'function' ? playerSalary(p) : 15000));
  const resolveRatingClass = r => (window.ratingClass ? window.ratingClass(r) : (typeof ratingClass === 'function' ? ratingClass(r) : 'rating-med'));
  const resolveFormatDate = d => (window.formatDatePtBr ? window.formatDatePtBr(d) : (typeof formatDatePtBr === 'function' ? formatDatePtBr(d) : String(d || '')));
  const resolvePlayersForClub = (c, w) => (window.playersForClub ? window.playersForClub(c, w) : (typeof playersForClub === 'function' ? playersForClub(c, w) : []));
  const resolvePlayerOverall = p => (window.playerOverall ? window.playerOverall(p) : (typeof playerOverall === 'function' ? playerOverall(p) : (p?.ovr || 70)));
  const resolveStateCompId = c => (window.clubStateCompId ? window.clubStateCompId(c) : (typeof clubStateCompId === 'function' ? clubStateCompId(c) : null));
  const resolveStateCompData = id => (window.getStateCompData ? window.getStateCompData(id) : (typeof getStateCompData === 'function' ? getStateCompData(id) : null));
  const resolveCopaDoBrasilState = () => (window.getCopaDoBrasilState ? window.getCopaDoBrasilState() : (typeof getCopaDoBrasilState === 'function' ? getCopaDoBrasilState() : null));

  // 1. Algoritmo tático para montar os 11 titulares prováveis de um elenco
  function buildProbableStarting11(squad) {
    if (!Array.isArray(squad) || !squad.length) return [];
    const pool = squad.slice().sort((a, b) => {
      const ovrB = resolvePlayerOverall(b);
      const ovrA = resolvePlayerOverall(a);
      return ovrB - ovrA;
    });

    const starters = [];
    const used = new Set();

    // Goleiro (GK)
    const gk = pool.find(p => /^(GK|GOLEIRO|GOL)$/i.test(p.pos)) || pool[0];
    if (gk) { starters.push(gk); used.add(gk); }

    // Laterais (RB/LD e LB/LE)
    const rb = pool.find(p => !used.has(p) && /^(RB|LATERAL DIREITO|LD)$/i.test(p.pos));
    if (rb) { starters.push(rb); used.add(rb); }
    const lb = pool.find(p => !used.has(p) && /^(LB|LATERAL ESQUERDO|LE)$/i.test(p.pos));
    if (lb) { starters.push(lb); used.add(lb); }

    // Zagueiros (CB/ZAG)
    const cbs = pool.filter(p => !used.has(p) && /^(CB|ZAGUEIRO|ZAG)$/i.test(p.pos)).slice(0, 2);
    cbs.forEach(p => { starters.push(p); used.add(p); });

    // Meio-campo (DMF, CMF, AMF)
    const mids = pool.filter(p => !used.has(p) && /^(DMF|VOLANTE|VOL|CMF|MEIA|MC|AMF|MEI)$/i.test(p.pos)).slice(0, 3);
    mids.forEach(p => { starters.push(p); used.add(p); });

    // Atacantes (CF, ST, RW, LW, ATA)
    const fwds = pool.filter(p => !used.has(p) && /^(CF|ST|ATA|ATACANTE|RW|LW|PONTA)$/i.test(p.pos)).slice(0, 3);
    fwds.forEach(p => { starters.push(p); used.add(p); });

    // Preenche até 11 atletas caso posições específicas não existam no elenco
    for (const p of pool) {
      if (starters.length >= 11) break;
      if (!used.has(p)) {
        starters.push(p);
        used.add(p);
      }
    }
    return starters.slice(0, 11);
  }

  // 2. Histórico detalhado e jogos já disputados por um clube na temporada atual
  function getClubSeasonMatches(clubName, beforeDate = null) {
    const s = window.state;
    if (!s || !clubName) return { matches: [], recent: [], totalPlayed: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, sg: 0, pts: 0, winPct: 0 };
    const normName = typeof norm === 'function' ? normClub(clubName) : clubName.toLowerCase();
    const season = Number(s.season) || 2026;
    const all = [];
    const seen = new Set();

    function addMatch(date, home, away, hg, ag, compName) {
      if (!home || !away || hg === undefined || ag === undefined) return;
      if (beforeDate && date && String(date) > String(beforeDate)) return;
      const hNorm = typeof norm === 'function' ? normClub(home) : home.toLowerCase();
      const aNorm = typeof norm === 'function' ? normClub(away) : away.toLowerCase();
      if (hNorm !== normName && aNorm !== normName) return;

      const dedupeKey = `${date}|${hNorm}|${aNorm}`;
      if (seen.has(dedupeKey)) return;
      seen.add(dedupeKey);

      const isHome = hNorm === normName;
      const teamG = Number(isHome ? hg : ag) || 0;
      const oppG = Number(isHome ? ag : hg) || 0;
      const opp = isHome ? away : home;
      const outcome = teamG > oppG ? 'V' : (teamG === oppG ? 'E' : 'D');
      const outcomeColor = teamG > oppG ? '#22c55e' : (teamG === oppG ? '#eab308' : '#ef4444');

      all.push({
        date: date || '2026-01-01',
        home,
        away,
        isHome,
        opp,
        teamG,
        oppG,
        hg: Number(hg) || 0,
        ag: Number(ag) || 0,
        compName: compName || 'Campeonato Oficial',
        outcome,
        outcomeColor
      });
    }

    // 1. Jogos do histórico do save (state.history)
    (s.history || []).forEach(h => {
      if (h.season && Number(h.season) !== season) return;
      addMatch(h.date, h.h, h.a, h.hg, h.ag, h.competitionName || h.competitionId);
    });

    // 2. Jogos do estadual (state.estadualData)
    if (s.estadualData) {
      Object.values(s.estadualData).forEach(est => {
        if (!est || !Array.isArray(est.fixtures)) return;
        est.fixtures.forEach(f => {
          if ((f.played || f.result) && f.result) {
            addMatch(f.isoDate, f.home, f.away, f.result[0], f.result[1], est.name || 'Campeonato Estadual');
          }
        });
      });
    }

    // 3. Jogos da Copa do Brasil (state.copaData)
    const copa = s.copaData || (typeof getCopaDoBrasilState === 'function' ? getCopaDoBrasilState() : null);
    if (copa?.phases) {
      Object.entries(copa.phases).forEach(([pName, ph]) => {
        (ph.fixtures || []).forEach(f => {
          if ((f.played || f.score) && f.score) {
            addMatch(f.isoDate || ph.isoDate, f.home, f.away, f.score[0], f.score[1], `Copa do Brasil (${pName})`);
          }
        });
      });
    }

    // 4. Jogos de Torneios Continentais (state.tournaments)
    if (s.tournaments) {
      Object.entries(s.tournaments).forEach(([tId, tourney]) => {
        if (!tourney || Number(tourney.season) !== season || !Array.isArray(tourney.matches)) return;
        const cName = ({lib:'Copa Libertadores',sud:'Copa Sul-Americana',ucl:'UEFA Champions League',uel:'UEFA Europa League',uecl:'UEFA Conference League','afc-el':'AFC Champions League Elite',afc2:'AFC Champions League Two',cwc:'Mundial de Clubes FIFA'})[tId] || (typeof compById === 'function' ? compById(tId)?.name : null) || 'Torneio Continental';
        tourney.matches.forEach(m => {
          if ((m.status === 'played' || m.result) && m.result) {
            addMatch(m.date, m.home, m.away, m.result[0], m.result[1], cName);
          }
        });
      });
    }

    // Ordena do mais recente para o mais antigo
    all.sort((a, b) => String(b.date).localeCompare(String(a.date)));

    let wins = 0, draws = 0, losses = 0, gf = 0, ga = 0;
    all.forEach(m => {
      gf += m.teamG;
      ga += m.oppG;
      if (m.outcome === 'V') wins++;
      else if (m.outcome === 'E') draws++;
      else losses++;
    });

    const totalPlayed = all.length;
    const pts = wins * 3 + draws;
    const winPct = totalPlayed > 0 ? Math.round((pts / (totalPlayed * 3)) * 100) : 0;

    return {
      matches: all,
      recent: all.slice(0, 5),
      totalPlayed,
      wins,
      draws,
      losses,
      gf,
      ga,
      sg: gf - ga,
      pts,
      winPct
    };
  }

  // 3. Retrospecto Direto H2H entre os dois clubes
  function getDetailedH2H(clubA, clubB) {
    const s = window.state;
    if (!s || !clubA || !clubB) return { winsA: 0, draws: 0, winsB: 0, total: 0, matches: [] };
    const aNorm = typeof norm === 'function' ? normClub(clubA) : clubA.toLowerCase();
    const bNorm = typeof norm === 'function' ? normClub(clubB) : clubB.toLowerCase();
    const h2hMatches = [];
    const seen = new Set();

    function checkAdd(date, home, away, hg, ag, comp) {
      if (!home || !away || hg === undefined || ag === undefined) return;
      const hN = typeof norm === 'function' ? normClub(home) : home.toLowerCase();
      const aN = typeof norm === 'function' ? normClub(away) : away.toLowerCase();
      if (!((hN === aNorm && aN === bNorm) || (hN === bNorm && aN === aNorm))) return;
      const key = `${date}|${hN}|${aN}`;
      if (seen.has(key)) return;
      seen.add(key);
      h2hMatches.push({ date, home, away, hg: Number(hg) || 0, ag: Number(ag) || 0, comp });
    }

    (s.history || []).forEach(h => checkAdd(h.date, h.h, h.a, h.hg, h.ag, h.competitionName || 'Oficial'));
    if (s.estadualData) {
      Object.values(s.estadualData).forEach(est => {
        (est?.fixtures || []).forEach(f => {
          if (f.result) checkAdd(f.isoDate, f.home, f.away, f.result[0], f.result[1], est.name);
        });
      });
    }
    const copa = s.copaData || (typeof getCopaDoBrasilState === 'function' ? getCopaDoBrasilState() : null);
    if (copa?.phases) {
      Object.values(copa.phases).forEach(ph => {
        (ph?.fixtures || []).forEach(f => {
          if (f.score) checkAdd(f.isoDate || ph.isoDate, f.home, f.away, f.score[0], f.score[1], 'Copa do Brasil');
        });
      });
    }
    if (s.tournaments) {
      Object.values(s.tournaments).forEach(t => {
        (t?.matches || []).forEach(m => {
          if (m.result) checkAdd(m.date, m.home, m.away, m.result[0], m.result[1], 'Continental');
        });
      });
    }

    h2hMatches.sort((x, y) => String(y.date).localeCompare(String(x.date)));
    let winsA = 0, draws = 0, winsB = 0;
    h2hMatches.forEach(m => {
      const hN = typeof norm === 'function' ? normClub(m.home) : m.home.toLowerCase();
      const teamAGoals = hN === aNorm ? m.hg : m.ag;
      const teamBGoals = hN === aNorm ? m.ag : m.hg;
      if (teamAGoals > teamBGoals) winsA++;
      else if (teamAGoals < teamBGoals) winsB++;
      else draws++;
    });

    return {
      winsA,
      draws,
      winsB,
      total: h2hMatches.length,
      matches: h2hMatches.slice(0, 5)
    };
  }

  // 4. Prévia Oficial da Partida (Modal Premium com Raio-X, 11 Inicial, Histórico e Probabilidades)
  function openMatchPreviewModal(oppOrHome, awayClubName, customCompName, customDate) {
    const s = window.state;
    if (!s) return;

    let homeClub = '';
    let awayClub = '';
    let isUserMatch = false;
    let compTitle = customCompName || '';
    let matchDate = customDate || '';
    let roundLabel = '';

    if (typeof oppOrHome === 'object' && oppOrHome !== null) {
      homeClub = oppOrHome.home || oppOrHome.h || '';
      awayClub = oppOrHome.away || oppOrHome.a || '';
      compTitle = oppOrHome.competitionName || oppOrHome.comp || oppOrHome.name || customCompName || '';
      matchDate = oppOrHome.date || customDate || s.date;
      roundLabel = oppOrHome.roundLabel || oppOrHome.round || '';
    } else if (oppOrHome && awayClubName) {
      homeClub = oppOrHome;
      awayClub = awayClubName;
      compTitle = customCompName || '';
      matchDate = customDate || s.date;
    } else if (oppOrHome) {
      const act = resolveActualMatch(s);
      if (act && (normClub(act.opponent) === normClub(oppOrHome) || normClub(act.home) === normClub(oppOrHome) || normClub(act.away) === normClub(oppOrHome))) {
        homeClub = act.home;
        awayClub = act.away;
        compTitle = act.competitionName;
        roundLabel = act.roundLabel;
        matchDate = act.date;
      } else {
        const f = resolveUserFixture();
        const isHome = f ? (normClub(f[0]) === normClub(s.club)) : true;
        homeClub = isHome ? s.club : oppOrHome;
        awayClub = isHome ? oppOrHome : s.club;
      }
    } else {
      const act = resolveActualMatch(s);
      if (act) {
        homeClub = act.home;
        awayClub = act.away;
        compTitle = act.competitionName;
        roundLabel = act.roundLabel;
        matchDate = act.date;
      } else {
        const f = resolveUserFixture();
        const opp = f ? (f[0] === s.club ? f[1] : f[0]) : (s.teams?.find(t => t.name !== s.club)?.name || 'Palmeiras');
        const isHome = f ? (normClub(f[0]) === normClub(s.club)) : true;
        homeClub = isHome ? s.club : opp;
        awayClub = isHome ? opp : s.club;
      }
    }

    if (!homeClub) homeClub = s.club || 'Meu Clube';
    if (!awayClub) awayClub = 'Adversário';
    if (!matchDate) matchDate = s.date;
    isUserMatch = typeof norm === 'function' ? (normClub(homeClub) === normClub(s.club) || normClub(awayClub) === normClub(s.club)) : (homeClub === s.club || awayClub === s.club);

    const homeClubObj = resolveClubByName(homeClub) || { name: homeClub, atk: 75, mid: 75, def: 75, stadium: 'Estádio Municipal' };
    const awayClubObj = resolveClubByName(awayClub) || { name: awayClub, atk: 74, mid: 74, def: 74, stadium: 'Estádio Municipal' };

    const homeOvr = (isUserMatch && homeClub === s.club) ? resolveOverallSquad() : (typeof strength === 'function' ? strength(homeClubObj) : (homeClubObj.atk || 75));
    const awayOvr = (isUserMatch && awayClub === s.club) ? resolveOverallSquad() : (typeof strength === 'function' ? strength(awayClubObj) : (awayClubObj.atk || 74));

    const homeAtk = homeClubObj.atk || 75;
    const homeMid = homeClubObj.mid || 75;
    const homeDef = homeClubObj.def || 75;

    const awayAtk = awayClubObj.atk || 74;
    const awayMid = awayClubObj.mid || 74;
    const awayDef = awayClubObj.def || 74;

    const comp = resolveCurComp() || { name: compTitle || 'Campeonato Oficial', id: s.competition || 'bra-a' };
    if (!compTitle) compTitle = comp.name || 'Campeonato Oficial';
    const roundNum = roundLabel || (`Rodada ${(Number(s.round) || 0) + 1}`);
    const stadiumName = homeClubObj.stadium || (homeClub === s.club ? resolveClubStadium() : 'Estádio Principal');
    const weather = resolveWeather(s.date, s.round);

    // Histórico de confrontos e jogos disputados na temporada
    const h2h = getDetailedH2H(homeClub, awayClub);
    const homeStats = getClubSeasonMatches(homeClub, matchDate);
    const awayStats = getClubSeasonMatches(awayClub, matchDate);

    // Resolução inteligente da tabela da competição ativa
    let compTeams = [];
    if (Array.isArray(s.teams) && (s.teams.some(t => normClub(t.name) === normClub(homeClub)) || s.teams.some(t => normClub(t.name) === normClub(awayClub)))) {
      compTeams = s.teams.slice().sort((a, b) => b.p - a.p || b.sg - a.sg || b.gp - a.gp);
    } else {
      const homeEstId = typeof clubStateCompId === 'function' ? clubStateCompId(homeClub) : null;
      const estData = homeEstId && typeof getStateCompData === 'function' ? getStateCompData(homeEstId) : null;
      if (estData?.teams) {
        compTeams = estData.teams.slice().sort((a, b) => b.p - a.p || b.sg - a.sg || b.gp - a.gp);
      }
    }

    const tableHome = compTeams.find(t => normClub(t.name) === normClub(homeClub)) || { p: homeStats.pts, j: homeStats.totalPlayed, v: homeStats.wins, e: homeStats.draws, d: homeStats.losses, gp: homeStats.gf, gc: homeStats.ga, sg: homeStats.sg };
    const tableAway = compTeams.find(t => normClub(t.name) === normClub(awayClub)) || { p: awayStats.pts, j: awayStats.totalPlayed, v: awayStats.wins, e: awayStats.draws, d: awayStats.losses, gp: awayStats.gf, gc: awayStats.ga, sg: awayStats.sg };
    const homeRank = compTeams.indexOf(tableHome) >= 0 ? compTeams.indexOf(tableHome) + 1 : 1;
    const awayRank = compTeams.indexOf(tableAway) >= 0 ? compTeams.indexOf(tableAway) + 1 : 2;
    const hasGames = Number(tableHome.j) > 0 || Number(tableAway.j) > 0 || homeStats.totalPlayed > 0 || awayStats.totalPlayed > 0;

    // Cálculo das probabilidades estatísticas
    const diff = (homeOvr + 3) - awayOvr; // Mando de campo confere +3
    const winHome = typeof clamp === 'function' ? clamp(Math.round(42 + diff * 3.2), 14, 82) : 45;
    const drawProb = typeof clamp === 'function' ? clamp(Math.round(28 - Math.abs(diff) * 0.7), 12, 35) : 28;
    const winAway = Math.max(5, 100 - winHome - drawProb);

    // Elenco do adversário (ou visitante caso neutro)
    const oppTeamName = isUserMatch ? (homeClub === s.club ? awayClub : homeClub) : awayClub;
    const oppSquad = typeof playersForClub === 'function' ? playersForClub(oppTeamName, s.worldGenerated || []) : [];
    const oppStarters = buildProbableStarting11(oppSquad);
    const oppSortedByOvr = oppSquad.slice().sort((a, b) => (typeof playerOverall === 'function' ? (playerOverall(b) - playerOverall(a)) : 0));
    const oppStar = oppSortedByOvr[0] || oppSquad[0];
    const oppScorer = oppSquad.filter(p => !/^(GK|GOLEIRO)$/i.test(p.pos)).sort((a, b) => (b.goals || 0) - (a.goals || 0) || (playerOverall ? playerOverall(b) - playerOverall(a) : 0))[0] || oppStar;

    const modalHtml = `
      <!-- Cabeçalho do Confronto com Efeito Visual -->
      <div style="background:linear-gradient(135deg, #1b1338 0%, #0d0a1a 100%);padding:20px;border-radius:14px;border:1px solid #7c3aed;box-shadow:0 0 25px rgba(124,58,237,0.25)">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:10px">
          <div style="font-size:12px;color:#c084fc;font-weight:900;text-transform:uppercase;letter-spacing:1px">
            🏆 ${esc(compTitle)} · ${esc(roundNum)}
          </div>
          <div style="font-size:11px;color:rgba(255,255,255,0.7);font-weight:700">
            📅 ${typeof formatDatePtBr === 'function' ? formatDatePtBr(matchDate) : matchDate} · 19:00
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 70px 1fr;align-items:center;text-align:center">
          <!-- Mandante -->
          <div style="padding:10px">
            ${typeof clubBadge === 'function' ? clubBadge(homeClub, 64) : ''}
            <h3 style="margin:8px 0 3px 0;font-size:18px;font-weight:900;color:#fff">${esc(homeClub)}</h3>
            <span class="pill ${homeClub === s.club ? 'good' : ''}" style="font-size:10px;font-weight:900">
              ${homeClub === s.club ? '★ SEU CLUBE (MANDANTE)' : 'MANDANTE'}
            </span>
            <div style="margin-top:6px;font-size:13px;color:rgba(255,255,255,0.7);font-weight:800">
              Força Geral: <b style="color:var(--neon)">${homeOvr}</b>
            </div>
          </div>

          <!-- Duelo Central -->
          <div style="display:flex;flex-direction:column;align-items:center;justify-content:center">
            <div style="font-size:26px;font-weight:900;color:#a855f7;text-shadow:0 0 12px rgba(168,85,247,0.7)">VS</div>
            <div style="font-size:10px;color:rgba(255,255,255,0.4);margin-top:4px;font-weight:700">DUELO</div>
          </div>

          <!-- Visitante -->
          <div style="padding:10px">
            ${typeof clubBadge === 'function' ? clubBadge(awayClub, 64) : ''}
            <h3 style="margin:8px 0 3px 0;font-size:18px;font-weight:900;color:#fff">${esc(awayClub)}</h3>
            <span class="pill ${awayClub === s.club ? 'good' : ''}" style="font-size:10px;font-weight:900">
              ${awayClub === s.club ? '★ SEU CLUBE (VISITANTE)' : 'VISITANTE'}
            </span>
            <div style="margin-top:6px;font-size:13px;color:rgba(255,255,255,0.7);font-weight:800">
              Força Geral: <b style="color:var(--neon)">${awayOvr}</b>
            </div>
          </div>
        </div>

        <!-- Informações do Estádio, Clima e Retrospecto Direto -->
        <div style="display:flex;justify-content:space-around;align-items:center;background:rgba(0,0,0,0.35);padding:10px 14px;border-radius:10px;margin-top:14px;font-size:11px;color:rgba(255,255,255,0.85);flex-wrap:wrap;gap:8px">
          <div>🏟️ <b>${esc(stadiumName)}</b></div>
          <div>${weather.icon || '☀️'} ${esc(weather.condition || 'Céu Limpo')} (${weather.temp || 24}°C)</div>
          <div>⚔️ Histórico Direto: <b style="color:#22c55e">${h2h.winsA}V ${esc(homeClub)}</b> · <b style="color:#94a3b8">${h2h.draws}E</b> · <b style="color:#ef4444">${h2h.winsB}V ${esc(awayClub)}</b> <span class="muted">(${h2h.total} jogos)</span></div>
        </div>
      </div>

      <!-- Seção: Forma Recente & Histórico de Partidas na Temporada -->
      <div style="margin-top:14px;background:#130f24;border:1px solid rgba(139,92,246,0.3);border-radius:12px;padding:14px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
          <div style="font-size:12px;font-weight:900;color:#c084fc;text-transform:uppercase;letter-spacing:0.8px">
            📈 Forma Recente & Jogos Disputados na Temporada
          </div>
          <div style="font-size:10px;color:rgba(255,255,255,0.5)">
            Atualizado até a data da partida (${typeof formatDatePtBr === 'function' ? formatDatePtBr(matchDate) : matchDate})
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
          <!-- Mandante Recente -->
          <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:10px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
              <span style="font-weight:900;font-size:13px;color:#38bdf8">${esc(homeClub)}</span>
              <div style="display:flex;gap:4px">
                ${homeStats.recent.length ? homeStats.recent.map(m => `
                  <span style="font-size:9px;font-weight:900;padding:2px 6px;border-radius:4px;background:${m.outcomeColor};color:#000" title="${m.outcome === 'V' ? 'Vitória' : (m.outcome === 'E' ? 'Empate' : 'Derrota')} vs ${esc(m.opp)} (${m.hg}x${m.ag})">${m.outcome}</span>
                `).join('') : '<span class="pill muted" style="font-size:9px">Sem jogos</span>'}
              </div>
            </div>
            <div style="font-size:11px;color:rgba(255,255,255,0.7);margin-bottom:8px">
              Jogos: <b>${homeStats.totalPlayed}</b> (${homeStats.wins}V ${homeStats.draws}E ${homeStats.losses}D) · GP: <b>${homeStats.gf}</b> · GC: <b>${homeStats.ga}</b> · Aproveitamento: <b style="color:#38bdf8">${homeStats.winPct}%</b>
            </div>
            ${homeStats.recent.length ? `
              <div style="display:flex;flex-direction:column;gap:4px">
                ${homeStats.recent.map(m => `
                  <div style="display:flex;justify-content:space-between;align-items:center;background:rgba(0,0,0,0.25);padding:4px 8px;border-radius:6px;font-size:10px">
                    <span style="color:rgba(255,255,255,0.7)">${String(m.date).slice(5)} · ${m.isHome ? '🏠' : '✈️'} vs ${esc(m.opp)} <span class="muted">(${esc(m.compName)})</span></span>
                    <span style="font-weight:900;color:${m.outcomeColor}">${m.hg} x ${m.ag} (${m.outcome})</span>
                  </div>
                `).join('')}
              </div>
            ` : `
              <div style="font-size:10px;color:rgba(255,255,255,0.4);text-align:center;padding:8px">
                Estreia na temporada: nenhuma partida oficial disputada ainda.
              </div>
            `}
          </div>

          <!-- Visitante Recente -->
          <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:10px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
              <span style="font-weight:900;font-size:13px;color:#f43f5e">${esc(awayClub)}</span>
              <div style="display:flex;gap:4px">
                ${awayStats.recent.length ? awayStats.recent.map(m => `
                  <span style="font-size:9px;font-weight:900;padding:2px 6px;border-radius:4px;background:${m.outcomeColor};color:#000" title="${m.outcome === 'V' ? 'Vitória' : (m.outcome === 'E' ? 'Empate' : 'Derrota')} vs ${esc(m.opp)} (${m.hg}x${m.ag})">${m.outcome}</span>
                `).join('') : '<span class="pill muted" style="font-size:9px">Sem jogos</span>'}
              </div>
            </div>
            <div style="font-size:11px;color:rgba(255,255,255,0.7);margin-bottom:8px">
              Jogos: <b>${awayStats.totalPlayed}</b> (${awayStats.wins}V ${awayStats.draws}E ${awayStats.losses}D) · GP: <b>${awayStats.gf}</b> · GC: <b>${awayStats.ga}</b> · Aproveitamento: <b style="color:#f43f5e">${awayStats.winPct}%</b>
            </div>
            ${awayStats.recent.length ? `
              <div style="display:flex;flex-direction:column;gap:4px">
                ${awayStats.recent.map(m => `
                  <div style="display:flex;justify-content:space-between;align-items:center;background:rgba(0,0,0,0.25);padding:4px 8px;border-radius:6px;font-size:10px">
                    <span style="color:rgba(255,255,255,0.7)">${String(m.date).slice(5)} · ${m.isHome ? '🏠' : '✈️'} vs ${esc(m.opp)} <span class="muted">(${esc(m.compName)})</span></span>
                    <span style="font-weight:900;color:${m.outcomeColor}">${m.hg} x ${m.ag} (${m.outcome})</span>
                  </div>
                `).join('')}
              </div>
            ` : `
              <div style="font-size:10px;color:rgba(255,255,255,0.4);text-align:center;padding:8px">
                Estreia na temporada: nenhuma partida oficial disputada ainda.
              </div>
            `}
          </div>
        </div>
      </div>

      <!-- Comparativo Setorial e Probabilidades -->
      <div style="margin-top:14px;background:#130f24;border:1px solid rgba(139,92,246,0.25);border-radius:12px;padding:14px">
        <div style="font-size:12px;font-weight:900;color:#c084fc;margin-bottom:10px;text-transform:uppercase;letter-spacing:0.8px">
          📊 Raio-X Setorial & Análise Comparativa
        </div>

        <div style="display:flex;flex-direction:column;gap:9px">
          <!-- Ataque -->
          <div>
            <div style="display:flex;justify-content:space-between;font-size:11px;font-weight:800;margin-bottom:3px">
              <span style="color:#38bdf8">${esc(homeClub)} (ATK: ${homeAtk})</span>
              <span style="color:rgba(255,255,255,0.6)">SETOR OFENSIVO</span>
              <span style="color:#f43f5e">${esc(awayClub)} (ATK: ${awayAtk})</span>
            </div>
            <div style="height:8px;background:rgba(255,255,255,0.08);border-radius:4px;overflow:hidden;display:flex">
              <div style="width:${Math.round((homeAtk / (homeAtk + awayAtk)) * 100)}%;background:#38bdf8"></div>
              <div style="width:${Math.round((awayAtk / (homeAtk + awayAtk)) * 100)}%;background:#f43f5e"></div>
            </div>
          </div>

          <!-- Meio-Campo -->
          <div>
            <div style="display:flex;justify-content:space-between;font-size:11px;font-weight:800;margin-bottom:3px">
              <span style="color:#38bdf8">${esc(homeClub)} (MEI: ${homeMid})</span>
              <span style="color:rgba(255,255,255,0.6)">MEIO-CAMPO</span>
              <span style="color:#f43f5e">${esc(awayClub)} (MEI: ${awayMid})</span>
            </div>
            <div style="height:8px;background:rgba(255,255,255,0.08);border-radius:4px;overflow:hidden;display:flex">
              <div style="width:${Math.round((homeMid / (homeMid + awayMid)) * 100)}%;background:#38bdf8"></div>
              <div style="width:${Math.round((awayMid / (homeMid + awayMid)) * 100)}%;background:#f43f5e"></div>
            </div>
          </div>

          <!-- Defesa -->
          <div>
            <div style="display:flex;justify-content:space-between;font-size:11px;font-weight:800;margin-bottom:3px">
              <span style="color:#38bdf8">${esc(homeClub)} (DEF: ${homeDef})</span>
              <span style="color:rgba(255,255,255,0.6)">SETOR DEFENSIVO</span>
              <span style="color:#f43f5e">${esc(awayClub)} (DEF: ${awayDef})</span>
            </div>
            <div style="height:8px;background:rgba(255,255,255,0.08);border-radius:4px;overflow:hidden;display:flex">
              <div style="width:${Math.round((homeDef / (homeDef + awayDef)) * 100)}%;background:#38bdf8"></div>
              <div style="width:${Math.round((awayDef / (homeDef + awayDef)) * 100)}%;background:#f43f5e"></div>
            </div>
          </div>
        </div>

        <!-- Probabilidades da Partida -->
        <div style="margin-top:14px;background:rgba(0,0,0,0.3);padding:10px;border-radius:10px">
          <div style="font-size:10px;font-weight:800;color:rgba(255,255,255,0.5);text-align:center;margin-bottom:6px">
            PROBABILIDADES ESTATÍSTICAS
          </div>
          <div style="display:flex;justify-content:space-around;text-align:center">
            <div>
              <div style="font-size:17px;font-weight:900;color:#22c55e">${winHome}%</div>
              <div style="font-size:9px;color:rgba(255,255,255,0.6)">Vitória ${esc(homeClub)}</div>
            </div>
            <div>
              <div style="font-size:17px;font-weight:900;color:#94a3b8">${drawProb}%</div>
              <div style="font-size:9px;color:rgba(255,255,255,0.6)">Empate</div>
            </div>
            <div>
              <div style="font-size:17px;font-weight:900;color:#ef4444">${winAway}%</div>
              <div style="font-size:9px;color:rgba(255,255,255,0.6)">Vitória ${esc(awayClub)}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Situação na Tabela Oficial -->
      <div style="margin-top:14px;background:#130f24;border:1px solid rgba(139,92,246,0.25);border-radius:12px;padding:14px">
        <div style="font-size:12px;font-weight:900;color:#c084fc;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.8px">
          📈 Situação na Tabela (${esc(compTitle)})
        </div>

        ${hasGames ? `
          <div class="tablewrap" style="max-height:160px;margin-bottom:6px">
            <table>
              <thead>
                <tr><th>Clube</th><th>Pos</th><th>PTS</th><th>J</th><th>V</th><th>E</th><th>D</th><th>GP</th><th>GC</th><th>SG</th></tr>
              </thead>
              <tbody>
                <tr style="background:rgba(56,189,248,0.12)">
                  <td><b>${esc(homeClub)}</b></td>
                  <td><b style="color:var(--neon)">#${homeRank}</b></td>
                  <td><b>${tableHome.p || 0}</b></td>
                  <td>${tableHome.j || 0}</td>
                  <td>${tableHome.v || 0}</td>
                  <td>${tableHome.e || 0}</td>
                  <td>${tableHome.d || 0}</td>
                  <td>${tableHome.gp || 0}</td>
                  <td>${tableHome.gc || 0}</td>
                  <td>${(tableHome.sg || 0) > 0 ? '+' : ''}${tableHome.sg || 0}</td>
                </tr>
                <tr style="background:rgba(244,63,94,0.12)">
                  <td><b>${esc(awayClub)}</b></td>
                  <td><b style="color:#f43f5e">#${awayRank}</b></td>
                  <td><b>${tableAway.p || 0}</b></td>
                  <td>${tableAway.j || 0}</td>
                  <td>${tableAway.v || 0}</td>
                  <td>${tableAway.e || 0}</td>
                  <td>${tableAway.d || 0}</td>
                  <td>${tableAway.gp || 0}</td>
                  <td>${tableAway.gc || 0}</td>
                  <td>${(tableAway.sg || 0) > 0 ? '+' : ''}${tableAway.sg || 0}</td>
                </tr>
              </tbody>
            </table>
          </div>
        ` : `
          <div style="background:rgba(255,255,255,0.02);padding:12px 16px;border-radius:10px;text-align:center">
            <div style="display:flex;justify-content:space-around;align-items:center;margin-bottom:8px">
              <div>
                <div class="small muted">Posição Inicial</div>
                <div style="font-weight:900;font-size:16px;color:#38bdf8">#${homeRank} ${esc(homeClub)}</div>
              </div>
              <div>
                <div class="small muted">Rodada Oficial</div>
                <div style="font-weight:900;font-size:14px;color:var(--neon)">Estreia na Temporada ${s.season || 2026}</div>
              </div>
              <div>
                <div class="small muted">Posição Inicial</div>
                <div style="font-weight:900;font-size:16px;color:#f43f5e">#${awayRank} ${esc(awayClub)}</div>
              </div>
            </div>
            <div style="font-size:11px;color:rgba(255,255,255,0.6);line-height:1.4">
              ⚽ Início oficial da temporada: as equipes entram em campo pela 1ª rodada. Estatísticas, pontos e gols serão computados a cada partida realizada.
            </div>
          </div>
        `}
      </div>

      <!-- Destaques & Provável Escalação do Adversário -->
      <div style="margin-top:14px;background:#130f24;border:1px solid rgba(139,92,246,0.25);border-radius:12px;padding:14px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
          <div style="font-size:12px;font-weight:900;color:#c084fc;text-transform:uppercase;letter-spacing:0.8px">
            🛡️ Provável 11 Inicial do ${esc(oppTeamName)}
          </div>
          <div style="font-size:10px;color:rgba(255,255,255,0.5)">
            11 Titulares Prováveis
          </div>
        </div>

        ${oppStar ? `
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
            <div style="background:rgba(234,179,8,0.1);border:1px solid rgba(234,179,8,0.3);border-radius:10px;padding:8px 12px;display:flex;align-items:center;gap:10px">
              ${typeof playerPhoto === 'function' ? playerPhoto(oppStar, 36) : ''}
              <div>
                <div style="font-size:9px;color:#fde047;font-weight:900">⭐ CRAQUE DO ADVERSÁRIO</div>
                <div style="font-size:13px;font-weight:900;color:#fff">${esc(oppStar.name)}</div>
                <div style="font-size:10px;color:rgba(255,255,255,0.6)">${esc(oppStar.pos || '-')} · Overall: <b style="color:#fde047">${typeof playerOverall === 'function' ? playerOverall(oppStar) : (oppStar.ovr || 75)}</b></div>
              </div>
            </div>

            <div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:10px;padding:8px 12px;display:flex;align-items:center;gap:10px">
              ${typeof playerPhoto === 'function' ? playerPhoto(oppScorer, 36) : ''}
              <div>
                <div style="font-size:9px;color:#fca5a5;font-weight:900">⚽ HOMEM-GOL / PERIGO</div>
                <div style="font-size:13px;font-weight:900;color:#fff">${esc(oppScorer.name)}</div>
                <div style="font-size:10px;color:rgba(255,255,255,0.6)">${esc(oppScorer.pos || '-')} · Overall: <b style="color:#fca5a5">${typeof playerOverall === 'function' ? playerOverall(oppScorer) : (oppScorer.ovr || 75)}</b></div>
              </div>
            </div>
          </div>
        ` : ''}

        <div class="tablewrap" style="max-height:220px">
          <table>
            <thead>
              <tr><th>Foto</th><th>Jogador</th><th>Pos</th><th>Idade</th><th>Overall</th><th>Salário Estimado</th></tr>
            </thead>
            <tbody>
              ${oppStarters.map(p => {
                const ovr = typeof playerOverall === 'function' ? playerOverall(p) : (p.ovr || 70);
                const rClass = typeof ratingClass === 'function' ? ratingClass(ovr) : 'good';
                const sal = typeof playerSalary === 'function' ? playerSalary(p) : 150000;
                return `
                  <tr>
                    <td style="width:36px">${typeof playerPhoto === 'function' ? playerPhoto(p, 26) : ''}</td>
                    <td><b>${esc(p.name)}</b></td>
                    <td><span class="pill" style="font-size:10px">${esc(p.pos || '-')}</span></td>
                    <td>${p.age || 23} anos</td>
                    <td><span class="rating-pill ${rClass}">${ovr}</span></td>
                    <td style="color:#22c55e;font-weight:700">R$ ${sal.toLocaleString('pt-BR')}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Botões de Ação no Rodapé -->
      <div style="display:flex;gap:10px;margin-top:16px;justify-content:flex-end">
        <button class="btn" id="btnPreviewCloseModal" style="padding:10px 16px;font-size:12px;font-weight:800;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:10px;cursor:pointer">
          ✕ Fechar Prévia
        </button>
        ${isUserMatch ? `
          <button class="btn" id="btnPreviewSimulateQuick" style="padding:10px 16px;font-size:12px;font-weight:800;background:#1e1b4b;border:1px solid #6366f1;color:#a5b4fc;border-radius:10px;cursor:pointer">
            ⚡ Simular Partida
          </button>
          <button class="btn primary" id="btnPreviewPlayLiveMatch" style="padding:10px 20px;font-size:13px;font-weight:900;background:linear-gradient(135deg, #7c3aed, #9333ea);border:none;border-radius:10px;box-shadow:0 4px 15px rgba(124,58,237,0.4);cursor:pointer">
            ▶ JOGAR AO VIVO AGORA
          </button>
        ` : ''}
      </div>
    `;

    const modalOpener = (window.openCustomModal || (typeof openCustomModal === 'function' ? openCustomModal : null));
    const modalCloser = (window.closeCustomModal || (typeof closeCustomModal === 'function' ? closeCustomModal : null));
    const simQuick = (window.simulateQuickRound || (typeof simulateQuickRound === 'function' ? simulateQuickRound : null));
    const liveMatch = (window.startLiveMatch || (typeof startLiveMatch === 'function' ? startLiveMatch : null));

    if (modalOpener) {
      modalOpener(
        `📋 Prévia Oficial: ${homeClub} x ${awayClub}`,
        modalHtml,
        null,
        'Fechar',
        false,
        '860px'
      );
    } else {
      const existing = document.getElementById('appCustomModal');
      if (existing) existing.remove();
      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.id = 'appCustomModal';
      overlay.innerHTML = `
        <div class="modal modal-wide" style="max-width:860px;width:96%;max-height:90vh;overflow-y:auto;background:#110e1d;border:1px solid #7c3aed;border-radius:14px;padding:20px;box-shadow:0 0 30px rgba(0,0,0,0.8)">
          <div class="modal-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:10px">
            <h3 style="margin:0;color:#fff">${esc(`📋 Prévia Oficial: ${homeClub} x ${awayClub}`)}</h3>
            <button class="modal-close-btn" id="modalCloseXBtn" style="background:none;border:none;color:#fff;font-size:22px;cursor:pointer">✕</button>
          </div>
          <div>${modalHtml}</div>
        </div>
      `;
      document.body.appendChild(overlay);
      overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
      const closeX = document.getElementById('modalCloseXBtn');
      if (closeX) closeX.onclick = () => overlay.remove();
    }

    const doClose = () => {
      if (modalCloser) modalCloser();
      const el = document.getElementById('appCustomModal');
      if (el) el.remove();
    };

    const btnClose = document.getElementById('btnPreviewCloseModal');
    if (btnClose) btnClose.onclick = doClose;

    const btnSim = document.getElementById('btnPreviewSimulateQuick');
    if (btnSim) {
      btnSim.onclick = () => {
        doClose();
        if (simQuick) simQuick();
      };
    }

    const btnLive = document.getElementById('btnPreviewPlayLiveMatch');
    if (btnLive) {
      btnLive.onclick = () => {
        doClose();
        if (liveMatch) liveMatch();
      };
    }
  }

  // 5. Informações Inteligentes do Clube (Tabela atualizada ou card de temporada inaugural)
  function openSmartClubInfoModal(clubName) {
    const s = window.state;
    if (!s) return;

    const clubObj = (typeof clubByName === 'function' ? clubByName(clubName) : null) || { name: clubName, country: 'Brasil', competition: 'Campeonato', atk: 60, mid: 60, def: 60, budget: 1, stadium: 'Estádio Municipal' };
    const str = typeof strength === 'function' ? strength(clubObj) : 60;
    let cComp = clubObj.competition || 'Campeonato';

    let tableRow = null;
    let compTeams = [];
    if (Array.isArray(s.teams) && s.teams.some(t => normClub(t.name) === normClub(clubName))) {
      compTeams = s.teams.slice().sort((a, b) => b.p - a.p || b.sg - a.sg || b.gp - a.gp);
      tableRow = compTeams.find(t => normClub(t.name) === normClub(clubName));
      if (tableRow && typeof curComp === 'function') cComp = curComp()?.name || s.competition || 'Campeonato Brasileiro';
    }
    if (!tableRow) {
      const cEstId = typeof clubStateCompId === 'function' ? clubStateCompId(clubName) : null;
      const estData = cEstId && typeof getStateCompData === 'function' ? getStateCompData(cEstId) : null;
      if (estData?.teams) {
        compTeams = estData.teams.slice().sort((a, b) => b.p - a.p || b.sg - a.sg || b.gp - a.gp);
        tableRow = compTeams.find(t => normClub(t.name) === normClub(clubName));
        if (tableRow) cComp = estData.name || 'Campeonato Estadual';
      }
    }

    const pos = tableRow ? (compTeams.indexOf(tableRow) + 1) : 1;
    const hasGames = tableRow && Number(tableRow.j) > 0;
    const squadPool = typeof playersForClub === 'function' ? playersForClub(clubName, s.worldGenerated || []).slice(0, 16) : [];

    const bodyHtml = `
      <div style="display:flex;align-items:center;gap:16px;background:rgba(255,255,255,0.03);padding:16px;border-radius:12px;border:1px solid rgba(255,255,255,0.08)">
        ${typeof clubBadge === 'function' ? clubBadge(clubName, 64) : ''}
        <div>
          <h2 style="margin:0;font-size:22px;color:#fff">${esc(clubName)}</h2>
          <div style="font-size:13px;color:rgba(255,255,255,0.6);margin-top:2px">
            🏟️ <b>${esc(clubObj.stadium || 'Estádio do Clube')}</b> • 🏆 ${esc(cComp)}
          </div>
          <div style="margin-top:6px;display:flex;gap:8px;flex-wrap:wrap">
            <span class="pill good">Força Geral: ${str}</span>
            <span class="pill">ATK: ${clubObj.atk || 60}</span>
            <span class="pill">MEI: ${clubObj.mid || 60}</span>
            <span class="pill">DEF: ${clubObj.def || 60}</span>
          </div>
        </div>
      </div>

      ${tableRow ? (hasGames ? `
        <div style="margin-top:14px;background:#161324;padding:12px 16px;border-radius:10px;border:1px solid rgba(139,92,246,0.2);display:flex;justify-content:space-around;text-align:center">
          <div><div class="small muted">Posição</div><div style="font-weight:900;font-size:18px;color:var(--neon)">#${pos}</div></div>
          <div><div class="small muted">Pontos</div><div style="font-weight:900;font-size:18px">${tableRow.p}</div></div>
          <div><div class="small muted">Jogos</div><div style="font-weight:900;font-size:18px">${tableRow.j}</div></div>
          <div><div class="small muted">Vitórias</div><div style="font-weight:900;font-size:18px">${tableRow.v}</div></div>
          <div><div class="small muted">Gols Pró</div><div style="font-weight:900;font-size:18px">${tableRow.gp}</div></div>
          <div><div class="small muted">Saldo</div><div style="font-weight:900;font-size:18px">${tableRow.sg > 0 ? '+' : ''}${tableRow.sg}</div></div>
        </div>
      ` : `
        <div style="margin-top:14px;background:#161324;padding:12px 16px;border-radius:10px;border:1px solid rgba(139,92,246,0.25)">
          <div style="display:flex;justify-content:space-around;align-items:center;text-align:center">
            <div><div class="small muted">Posição Inicial</div><div style="font-weight:900;font-size:18px;color:var(--neon)">#${pos}</div></div>
            <div><div class="small muted">Status</div><div style="font-weight:900;font-size:14px;color:#38bdf8">Estreia Oficial (${s.season || 2026})</div></div>
            <div><div class="small muted">Competição</div><div style="font-weight:900;font-size:14px;color:#a78bfa">${esc(cComp)}</div></div>
          </div>
          <div style="font-size:11px;color:rgba(255,255,255,0.6);text-align:center;margin-top:8px">
            ⚽ Temporada inaugural ou 1ª rodada: partidas oficiais ainda não foram disputadas. Estatísticas, pontos e gols serão computados a cada rodada.
          </div>
        </div>
      `) : ''}

      <h3 style="margin:16px 0 8px 0;font-size:15px">Destaques do Elenco (${squadPool.length} atletas)</h3>
      <div class="tablewrap" style="max-height:260px">
        <table>
          <thead><tr><th>Foto</th><th>Jogador</th><th>Pos</th><th>Idade</th><th>Overall</th><th>Salário Estimado</th></tr></thead>
          <tbody>
            ${squadPool.map(p => {
              const ovr = typeof playerOverall === 'function' ? playerOverall(p) : (p.ovr || 70);
              const rClass = typeof ratingClass === 'function' ? ratingClass(ovr) : 'good';
              const sal = typeof playerSalary === 'function' ? playerSalary(p) : 120000;
              return `
                <tr>
                  <td style="width:40px">${typeof playerPhoto === 'function' ? playerPhoto(p, 28) : ''}</td>
                  <td><b>${esc(p.name)}</b></td>
                  <td><span class="pill" style="font-size:11px">${esc(p.pos || '-')}</span></td>
                  <td>${p.age || 23} anos</td>
                  <td><span class="rating-pill ${rClass}">${ovr}</span></td>
                  <td style="color:#22c55e;font-weight:700">R$ ${sal.toLocaleString('pt-BR')}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    const modalOpener = (window.openCustomModal || (typeof openCustomModal === 'function' ? openCustomModal : null));
    if (modalOpener) {
      modalOpener(
        `Informações do Clube: ${esc(clubName)}`,
        bodyHtml,
        null,
        'Fechar',
        false
      );
    } else {
      const existing = document.getElementById('appCustomModal');
      if (existing) existing.remove();
      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.id = 'appCustomModal';
      overlay.innerHTML = `
        <div class="modal" style="max-width:680px;width:96%;max-height:85vh;overflow-y:auto;background:#110e1d;border:1px solid #7c3aed;border-radius:14px;padding:20px">
          <div class="modal-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:8px">
            <h3 style="margin:0;color:#fff">${esc(`Informações do Clube: ${clubName}`)}</h3>
            <button class="modal-close-btn" id="modalCloseXBtn" style="background:none;border:none;color:#fff;font-size:22px;cursor:pointer">✕</button>
          </div>
          <div>${bodyHtml}</div>
        </div>
      `;
      document.body.appendChild(overlay);
      overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
      const closeX = document.getElementById('modalCloseXBtn');
      if (closeX) closeX.onclick = () => overlay.remove();
    }
  }

  // 6. Exposição Global e Interceptação Segura
  window.buildProbableStarting11 = buildProbableStarting11;
  window.getClubSeasonMatches = getClubSeasonMatches;
  window.getDetailedH2H = getDetailedH2H;
  window.openMatchPreviewModal = openMatchPreviewModal;
  window.openClubInfoModal = openSmartClubInfoModal;

  // Interceptar cliques em links de prévia do confronto na interface (Central, Calendário e Cards)
  document.addEventListener('click', function(e) {
    const calTarget = e.target.closest('.btnCalPreviewNow');
    if (calTarget) {
      e.preventDefault();
      e.stopPropagation();
      openMatchPreviewModal(calTarget.dataset.home, calTarget.dataset.away, calTarget.dataset.comp, calTarget.dataset.date);
      return;
    }
    const target = e.target.closest('#btnMatchPreviewCentral, .btnMatchPreviewCentral, [data-action="match-preview"]');
    if (target) {
      e.preventDefault();
      e.stopPropagation();
      openMatchPreviewModal(target.dataset?.home, target.dataset?.away, target.dataset?.comp, target.dataset?.date);
    }
  }, true);

})();
