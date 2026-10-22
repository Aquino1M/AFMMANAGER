/**
 * AFM 2027 - Sistema Oficial da Copa São Paulo de Futebol Júnior (Copinha Sub-20)
 * 
 * Simulação 100% automatizada em Janeiro (02 a 25 de Janeiro).
 * O treinador principal acompanha os resultados, classificação e desempenho dos atletas da base.
 * Revelações têm alta chance de breakout de Overall (+3 a +7 OVR) e alto potencial (84 a 94 POT).
 * Premiações em dinheiro por fase avançada + Taça da Copinha na sala de troféus.
 */

(function(window){
  'use strict';

  const COPINHA_RIVAL_CLUBS = [
    'Ponte Preta Sub-20', 'Novorizontino Sub-20', 'Nacional-SP Sub-20', 'São Caetano Sub-20',
    'Audax-SP Sub-20', 'Ferroviária Sub-20', 'Mirassol Sub-20', 'Botafogo-SP Sub-20',
    'Guarani Sub-20', 'Ituano Sub-20', 'XV de Piracicaba Sub-20', 'Juventus-SP Sub-20'
  ];

  const COPINHA_ELITE_CLUBS = [
    'Corinthians Sub-20', 'Palmeiras Sub-20', 'São Paulo Sub-20', 'Santos Sub-20',
    'Flamengo Sub-20', 'Fluminense Sub-20', 'Vasco Sub-20', 'Grêmio Sub-20',
    'Internacional Sub-20', 'Cruzeiro Sub-20', 'Atlético-MG Sub-20', 'Athletico-PR Sub-20'
  ];

  const CopinhaSub20Engine = {
    // Inicialização da Copinha para a temporada atual
    initCopinha(state, force = false){
      if(!state) return null;
      const season = Number(state.season) || 2026;
      if(!force && state.copinha && Number(state.copinha.season) === season){
        return state.copinha;
      }

      // Garante atletas suficientes na base (mínimo 14 jovens talentos)
      if(typeof window.normalizeYouthAcademyRoster === 'function'){
        window.normalizeYouthAcademyRoster(state);
        window.restoreYouthAcademyOverflow?.(state);
      } else {
        state.youthAcademy = Array.isArray(state.youthAcademy) ? state.youthAcademy.slice(0, 15) : [];
      }
      const acadLvl = state.infrastructure?.academy?.level || 1;
      while(state.youthAcademy.length < 14){
        if(typeof window.generateYouthPlayer === 'function'){
          const p = window.generateYouthPlayer(acadLvl, Math.floor(Math.random() * 3) + 16);
          state.youthAcademy.push(p);
        } else {
          const positions = ['GK', 'CB', 'LB', 'RB', 'DM', 'CM', 'AM', 'RW', 'LW', 'ST'];
          const pos = positions[state.youthAcademy.length % positions.length];
          const ovr = 62 + Math.floor(Math.random() * 10);
          state.youthAcademy.push({
            name: `Jovem ${state.youthAcademy.length + 1}`,
            pos,
            age: 16 + Math.floor(Math.random() * 3),
            overall: ovr,
            potential: Math.min(92, ovr + 14 + Math.floor(Math.random() * 8)),
            fitness: 100,
            isYouth: true
          });
        }
      }

      // Escolhe 3 adversários do grupo
      const shuffledRivals = [...COPINHA_RIVAL_CLUBS].sort(() => Math.random() - 0.5);
      const groupRivals = shuffledRivals.slice(0, 3);
      const userTeamName = `${state.club} Sub-20`;

      // 4 equipes do Grupo
      const groupStandings = [
        { club: userTeamName, isUser: true, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0, p: 0 },
        { club: groupRivals[0], isUser: false, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0, p: 0 },
        { club: groupRivals[1], isUser: false, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0, p: 0 },
        { club: groupRivals[2], isUser: false, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0, p: 0 }
      ];

      // 3 Rodadas da Fase de Grupos
      const groupFixtures = [
        {
          id: `c_g1_${season}`,
          round: 1,
          date: `${season}-01-03`,
          home: userTeamName,
          away: groupRivals[2],
          played: false,
          result: null,
          events: []
        },
        {
          id: `c_g2_${season}`,
          round: 2,
          date: `${season}-01-06`,
          home: groupRivals[1],
          away: userTeamName,
          played: false,
          result: null,
          events: []
        },
        {
          id: `c_g3_${season}`,
          round: 3,
          date: `${season}-01-09`,
          home: userTeamName,
          away: groupRivals[0],
          played: false,
          result: null,
          events: []
        }
      ];

      // Sorteia adversários para as fases de mata-mata
      const shuffledElite = [...COPINHA_ELITE_CLUBS].sort(() => Math.random() - 0.5);
      const knockouts = [
        {
          id: `c_r16_${season}`,
          phase: 'Oitavas de Final',
          date: `${season}-01-13`,
          home: userTeamName,
          away: shuffledElite[0] || 'Corinthians Sub-20',
          played: false,
          result: null,
          prize: 75000,
          events: []
        },
        {
          id: `c_qf_${season}`,
          phase: 'Quartas de Final',
          date: `${season}-01-17`,
          home: userTeamName,
          away: shuffledElite[1] || 'Palmeiras Sub-20',
          played: false,
          result: null,
          prize: 100000,
          events: []
        },
        {
          id: `c_sf_${season}`,
          phase: 'Semifinal',
          date: `${season}-01-21`,
          home: userTeamName,
          away: shuffledElite[2] || 'São Paulo Sub-20',
          played: false,
          result: null,
          prize: 150000,
          events: []
        },
        {
          id: `c_f_${season}`,
          phase: 'Grande Final',
          date: `${season}-01-25`,
          home: userTeamName,
          away: shuffledElite[3] || 'Santos Sub-20',
          played: false,
          result: null,
          prize: 350000,
          events: []
        }
      ];

      state.copinha = {
        season,
        active: true,
        groupName: `Grupo ${Math.floor(Math.random() * 16) + 1} • Sede São Paulo`,
        currentPhase: 'Fase de Grupos',
        standings: groupStandings,
        groupFixtures,
        knockouts,
        currentKnockoutIndex: 0,
        eliminated: false,
        champion: false,
        totalPrizeWon: 0,
        breakouts: [],
        playerStats: {}
      };

      return state.copinha;
    },

    // Checa e simula automaticamente partidas da Copinha que casem com a data atual
    checkAndSimulateCopinhaDay(state, currentDate){
      if(!state) return;
      const dateStr = currentDate || state.date;
      if(!dateStr || typeof dateStr !== 'string') return;
      const [yearStr, monthStr, dayStr] = dateStr.split('-');
      if(monthStr !== '01') return; // Copinha ocorre estritamente em Janeiro

      const cop = this.initCopinha(state);
      if(!cop || !cop.active || cop.eliminated || cop.champion) return;

      // 1. Fase de Grupos
      const pendingGroupFixture = cop.groupFixtures.find(f => !f.played && f.date <= dateStr);
      if(pendingGroupFixture){
        this.simulateMatch(state, cop, pendingGroupFixture, false);
        this.checkGroupCompletion(state, cop);
        return;
      }

      // 2. Fases Eliminatórias (Mata-Mata)
      if(cop.advancedToKnockout && !cop.eliminated && !cop.champion){
        const curKO = cop.knockouts[cop.currentKnockoutIndex];
        if(curKO && !curKO.played && curKO.date <= dateStr){
          this.simulateMatch(state, cop, curKO, true);
        }
      }
    },

    // Simulação automatizada de uma partida da Copinha
    simulateMatch(state, cop, fixture, isKnockout = false){
      fixture.played = true;
      const isHomeUser = fixture.home.includes('Sub-20') && fixture.home.startsWith(state.club);
      const userClubName = `${state.club} Sub-20`;
      const oppClubName = isHomeUser ? fixture.away : fixture.home;

      // Calcula força média da base
      const youthList = state.youthAcademy || [];
      const baseOvr = youthList.length ? Math.round(youthList.reduce((acc, p) => acc + (typeof window.playerOverall === 'function' ? window.playerOverall(p) : (p.overall || 65)), 0) / youthList.length) : 66;
      const acadLvl = state.infrastructure?.academy?.level || 1;
      const effectiveYouthStrength = baseOvr + (acadLvl * 1.5);
      const oppStrength = isKnockout ? (70 + Math.floor(Math.random() * 8)) : (66 + Math.floor(Math.random() * 6));

      // Gera placar ponderado
      const diff = effectiveYouthStrength - oppStrength;
      const userProb = Math.max(0.25, Math.min(0.85, 0.50 + (diff * 0.04)));
      
      let userScore = 0, oppScore = 0;
      const roll = Math.random();
      if(roll < userProb){
        userScore = Math.floor(Math.random() * 3) + 1;
        oppScore = Math.floor(Math.random() * userScore);
      } else if(roll < userProb + 0.20 && !isKnockout){
        userScore = Math.floor(Math.random() * 3);
        oppScore = userScore;
      } else {
        oppScore = Math.floor(Math.random() * 3) + 1;
        userScore = Math.floor(Math.random() * oppScore);
        if(isKnockout && userScore === oppScore) userScore++; // desempate mata-mata
      }

      const hg = isHomeUser ? userScore : oppScore;
      const ag = isHomeUser ? oppScore : userScore;
      fixture.result = `${hg} x ${ag}`;

      // Simula atuação individual e gols dos atletas da base
      const matchEvents = [];
      const scorers = [];
      const assisters = [];

      // Seleciona atletas de linha da base para jogarem
      const fieldPlayers = youthList.filter(p => p.pos !== 'GK').slice(0, 10);
      const attackers = fieldPlayers.filter(p => ['ST', 'CF', 'RW', 'LW', 'ATA', 'PON'].includes(p.pos));
      const midfielders = fieldPlayers.filter(p => ['CM', 'AM', 'DM', 'MEI', 'VOL'].includes(p.pos));

      for(let g = 0; g < userScore; g++){
        const pool = attackers.length && Math.random() < 0.70 ? attackers : (midfielders.length ? midfielders : fieldPlayers);
        const scorer = pool[Math.floor(Math.random() * pool.length)] || youthList[0];
        if(scorer){
          scorers.push(scorer);
          matchEvents.push({
            min: Math.floor(Math.random() * 85) + 5,
            type: 'goal',
            player: scorer.name,
            team: userClubName
          });
        }
      }

      // Atualiza estatísticas e calcula notas individuais (5.0 a 9.5)
      youthList.forEach(p => {
        const k = typeof window.playerKey === 'function' ? window.playerKey(p) : p.name;
        cop.playerStats[k] = cop.playerStats[k] || { games: 0, goals: 0, assists: 0, ratings: [], sumRatings: 0, avgRating: 0, ovrGain: 0 };
        const st = cop.playerStats[k];
        st.games++;

        const isScorer = scorers.includes(p);
        const pGoals = scorers.filter(s => s === p).length;
        st.goals += pGoals;

        // Nota da partida
        let rating = 6.0;
        if(userScore > oppScore) rating += 0.6;
        else if(userScore === oppScore) rating += 0.1;
        else rating -= 0.4;

        rating += (pGoals * 1.3);
        if(Math.random() < 0.25 && userScore > 0){
          st.assists++;
          rating += 0.8;
        }

        rating += (Math.random() * 0.8 - 0.4);
        rating = Math.max(5.0, Math.min(9.8, Math.round(rating * 10) / 10));
        st.ratings.push(rating);
        st.sumRatings += rating;
        st.avgRating = Math.round((st.sumRatings / st.ratings.length) * 10) / 10;

        // Chance de OVER ALTA (Breakout dos Juniores)
        // Se jogou bem (nota >= 7.8 ou fez gol), tem 50% de chance de grande salto de Overall (+3 a +7)
        if((rating >= 7.8 || pGoals > 0) && Math.random() < 0.55 && !p.copinhaBreakout){
          const ovrGain = Math.floor(Math.random() * 5) + 3; // +3 a +7 de salto
          p.overall = Math.min(84, (p.overall || 65) + ovrGain);
          p.potential = Math.max(p.potential || 82, Math.min(95, p.overall + Math.floor(Math.random() * 8) + 8));
          p.copinhaBreakout = true;
          st.ovrGain = (st.ovrGain || 0) + ovrGain;

          cop.breakouts.push({
            name: p.name,
            pos: p.pos,
            age: p.age,
            ovr: p.overall,
            pot: p.potential,
            ovrGain,
            rating,
            phase: fixture.phase || `Rodada ${fixture.round}`
          });

          // Notícia de Destaque
          state.news = Array.isArray(state.news) ? state.news : [];
          state.news.unshift(`🔥 REVELAÇÃO DA COPINHA: O jovem ${p.name} (${p.pos}, ${p.age} anos) brilhou na Copinha com nota ${rating}! Seu Overall saltou +${ovrGain} (Agora OVR ${p.overall} • Potencial ⭐${p.potential})!`);
        }
      });

      fixture.events = matchEvents;

      // Atualiza tabela ou fase eliminatória
      if(!isKnockout){
        const userRow = cop.standings.find(s => s.isUser);
        const oppRow = cop.standings.find(s => s.club === oppClubName);
        if(userRow && oppRow){
          userRow.j++; oppRow.j++;
          userRow.gp += userScore; userRow.gc += oppScore; userRow.sg = userRow.gp - userRow.gc;
          oppRow.gp += oppScore; oppRow.gc += userScore; oppRow.sg = oppRow.gp - oppRow.gc;
          if(userScore > oppScore){
            userRow.v++; userRow.p += 3; oppRow.d++;
          } else if(userScore < oppScore){
            oppRow.v++; oppRow.p += 3; userRow.d++;
          } else {
            userRow.e++; userRow.p++; oppRow.e++; oppRow.p++;
          }
        }
        // Simula o outro jogo da rodada
        this.simulateOtherGroupMatch(cop, fixture.round, oppClubName);

        // Notícia do jogo
        const resultEmoji = userScore > oppScore ? '🟢 VITÓRIA' : (userScore === oppScore ? '🟡 EMPATE' : '🔴 DERROTA');
        state.news = Array.isArray(state.news) ? state.news : [];
        state.news.unshift(`🏆 COPINHA SUB-20 (Rodada ${fixture.round}): ${userClubName} ${userScore} x ${oppScore} ${oppClubName} • ${resultEmoji}`);
        if(typeof window.toast === 'function'){
          window.toast(`🏆 Copinha Sub-20: ${userClubName} ${userScore} x ${oppScore} ${oppClubName}!`);
        }
      } else {
        // Fases Eliminatórias
        const won = userScore > oppScore;
        const prize = fixture.prize || 75000;
        if(won){
          cop.totalPrizeWon += prize;
          state.balance = (Number(state.balance) || 0) + prize;
          state.income = (Number(state.income) || 0) + prize;

          state.news = Array.isArray(state.news) ? state.news : [];
          if(cop.currentKnockoutIndex === cop.knockouts.length - 1){
            // CAMPEÃO DA COPINHA!
            cop.champion = true;
            cop.currentPhase = '🏆 Campeão Invicto';
            state.titles = Array.isArray(state.titles) ? state.titles : [];
            state.titles.push({
              name: `Copa São Paulo de Juniores (Copinha Sub-20)`,
              season: Number(state.season) || 2026,
              date: state.date
            });
            state.news.unshift(`🏆 É CAMPEÃO DA COPINHA SUB-20! Nossos juniores conquistaram a taça histórica! Premiação de R$ ${prize.toLocaleString('pt-BR')} creditada nos cofres.`);
            if(typeof window.toast === 'function'){
              window.toast(`🏆 É CAMPEÃO DA COPINHA SUB-20! +R$ ${prize.toLocaleString('pt-BR')} no caixa!`);
            }
            if(window.AFM30 && window.AFM30.audio) window.AFM30.audio.playGoal();
          } else {
            cop.currentKnockoutIndex++;
            cop.currentPhase = cop.knockouts[cop.currentKnockoutIndex]?.phase || 'Mata-Mata';
            state.news.unshift(`🏆 CLASSIFICADO NA COPINHA! O Sub-20 bateu o ${oppClubName} por ${userScore} x ${oppScore} e avançou para a ${cop.currentPhase}! Premiação: +R$ ${prize.toLocaleString('pt-BR')}.`);
            if(typeof window.toast === 'function'){
              window.toast(`🏆 Copinha: Classificado para ${cop.currentPhase}! +R$ ${prize.toLocaleString('pt-BR')}`);
            }
          }
        } else {
          cop.eliminated = true;
          cop.currentPhase = `Eliminado na ${fixture.phase}`;
          state.news = Array.isArray(state.news) ? state.news : [];
          state.news.unshift(`⭐ FIM DA LINHA NA COPINHA: O Sub-20 lutou bravamente mas foi superado pelo ${oppClubName} por ${oppScore} x ${userScore} na ${fixture.phase}. Grandes joias foram reveladas.`);
          if(typeof window.toast === 'function'){
            window.toast(`⭐ Copinha: Sub-20 encerra participação na ${fixture.phase}.`);
          }
        }
      }

      if(typeof window.save === 'function') window.save();
    },

    // Simula a outra partida do grupo entre os adversários
    simulateOtherGroupMatch(cop, round, userOpponent){
      const otherTeams = cop.standings.filter(s => !s.isUser && s.club !== userOpponent);
      if(otherTeams.length >= 2){
        const t1 = otherTeams[0];
        const t2 = otherTeams[1];
        const s1 = Math.floor(Math.random() * 3);
        const s2 = Math.floor(Math.random() * 3);
        t1.j++; t2.j++;
        t1.gp += s1; t1.gc += s2; t1.sg = t1.gp - t1.gc;
        t2.gp += s2; t2.gc += s1; t2.sg = t2.gp - t2.gc;
        if(s1 > s2){ t1.v++; t1.p += 3; t2.d++; }
        else if(s1 < s2){ t2.v++; t2.p += 3; t1.d++; }
        else { t1.e++; t1.p++; t2.e++; t2.p++; }
      }
    },

    // Verifica classificação ao final das 3 rodadas
    checkGroupCompletion(state, cop){
      const allGroupPlayed = cop.groupFixtures.every(f => f.played);
      if(!allGroupPlayed) return;

      // Ordena classificação: P > V > SG > GP
      cop.standings.sort((a,b) => (b.p - a.p) || (b.v - a.v) || (b.sg - a.sg) || (b.gp - a.gp));

      const userRank = cop.standings.findIndex(s => s.isUser) + 1;
      if(userRank <= 2){
        cop.advancedToKnockout = true;
        cop.currentPhase = 'Oitavas de Final';
        const groupPrize = 50000;
        cop.totalPrizeWon += groupPrize;
        state.balance = (Number(state.balance) || 0) + groupPrize;
        state.income = (Number(state.income) || 0) + groupPrize;

        state.news = Array.isArray(state.news) ? state.news : [];
        state.news.unshift(`🏆 COPINHA SUB-20: Classificados em ${userRank}º lugar do grupo para as Oitavas de Final! Premiação de R$ 50.000 creditada.`);
        if(typeof window.toast === 'function'){
          window.toast(`🏆 Sub-20 classificado para as Oitavas da Copinha! +R$ 50k`);
        }
      } else {
        cop.eliminated = true;
        cop.currentPhase = 'Eliminado na Fase de Grupos';
        state.news = Array.isArray(state.news) ? state.news : [];
        state.news.unshift(`⭐ COPINHA SUB-20: O time de juniores encerrou sua participação na fase de grupos (${userRank}º lugar).`);
      }
      if(typeof window.save === 'function') window.save();
    },

    // Interface Completa da Copinha Sub-20 (Modal de Acompanhamento)
    openCopinhaModal(state){
      if(!state) return;
      const cop = this.initCopinha(state);
      if(!cop) return;

      const userTeamName = `${state.club} Sub-20`;
      const youthList = state.youthAcademy || [];
      const breakouts = cop.breakouts || [];

      // Ordena classificação atual do grupo
      const sortedStandings = [...(cop.standings || [])].sort((a,b) => (b.p - a.p) || (b.v - a.v) || (b.sg - a.sg) || (b.gp - a.gp));

      // Ordena jovens por destaque da Copinha
      const sortedYouth = [...youthList].map(p => {
        const k = typeof window.playerKey === 'function' ? window.playerKey(p) : p.name;
        const st = cop.playerStats[k] || { games: 0, goals: 0, assists: 0, avgRating: 6.0, ovrGain: 0 };
        return { ...p, stats: st, key: k };
      }).sort((a,b) => (b.stats.avgRating - a.stats.avgRating) || (b.stats.goals - a.stats.goals));

      const statusBadge = cop.champion 
        ? '<span style="background:#22c55e;color:#000;font-weight:900;padding:4px 10px;border-radius:6px">🏆 CAMPEÃO INVICTO</span>'
        : (cop.eliminated 
          ? `<span style="background:rgba(239,68,68,0.2);color:#fca5a5;font-weight:800;padding:4px 10px;border-radius:6px;border:1px solid #ef4444">${cop.currentPhase}</span>`
          : `<span style="background:rgba(56,189,248,0.2);color:#38bdf8;font-weight:800;padding:4px 10px;border-radius:6px;border:1px solid #38bdf8">EM DISPUTA • ${cop.currentPhase.toUpperCase()}</span>`);

      const bodyHtml = `
        <div style="display:flex;flex-direction:column;gap:14px;color:#fff">
          <!-- BANNER TOPO COPINHA -->
          <div style="background:linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%);border:1px solid rgba(129,140,248,0.3);border-radius:14px;padding:16px 20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;box-shadow:0 8px 24px rgba(0,0,0,0.4)">
            <div>
              <div style="display:flex;align-items:center;gap:8px">
                <span style="font-size:26px">🏆</span>
                <div>
                  <h2 style="margin:0;font-size:20px;font-weight:900;letter-spacing:0.5px">COPA SÃO PAULO DE FUTEBOL JÚNIOR</h2>
                  <div style="font-size:12px;color:#cbd5e1;margin-top:2px">Edição Oficial ${cop.season} • ${cop.groupName}</div>
                </div>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:10px">
              ${statusBadge}
              <div style="background:rgba(0,0,0,0.35);padding:6px 14px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);text-align:right">
                <div style="font-size:10px;color:#94a3b8;font-weight:700">PREMIAÇÕES FATURADAS</div>
                <div style="font-size:16px;font-weight:900;color:#34d399">R$ ${(cop.totalPrizeWon || 0).toLocaleString('pt-BR')}</div>
              </div>
            </div>
          </div>

          <!-- CARDS DE DESTAQUES E REVELAÇÕES DA BASE -->
          ${breakouts.length ? `
            <div style="background:rgba(234,179,8,0.08);border:1px solid rgba(234,179,8,0.3);border-radius:12px;padding:14px">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
                <span style="font-size:20px">🔥</span>
                <span style="font-size:14px;font-weight:900;color:#facc15;letter-spacing:0.5px">JOIAS REVELADAS NESTA EDIÇÃO (+3 A +7 OVERALL)</span>
              </div>
              <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(240px, 1fr));gap:10px">
                ${breakouts.map(b => `
                  <div style="background:#0f172a;border:1px solid rgba(234,179,8,0.4);border-radius:10px;padding:10px 14px;display:flex;justify-content:space-between;align-items:center">
                    <div>
                      <div style="font-size:13px;font-weight:800;color:#fff">${window.esc ? window.esc(b.name) : b.name}</div>
                      <div style="font-size:11px;color:#94a3b8;margin-top:2px">${b.pos} • ${b.age} anos • Nota ${b.rating}</div>
                    </div>
                    <div style="text-align:right">
                      <div style="background:linear-gradient(135deg,#eab308,#ca8a04);color:#000;font-weight:900;font-size:12px;padding:2px 8px;border-radius:6px;display:inline-block">OVR ${b.ovr} (+${b.ovrGain})</div>
                      <div style="font-size:10px;color:#facc15;font-weight:800;margin-top:2px">⭐ POT ${b.pot}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- LAYOUT EM 2 COLUNAS: CLASSIFICAÇÃO / CONFRONTOS E LISTA DE ATLETAS -->
          <div style="display:grid;grid-template-columns:1fr 1.15fr;gap:14px">
            <!-- COLUNA ESQUERDA: CLASSIFICAÇÃO E JOGOS -->
            <div style="display:flex;flex-direction:column;gap:12px">
              <!-- TABELA DA FASE DE GRUPOS -->
              <div style="background:#0f172a;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px">
                <div style="font-size:12px;font-weight:900;color:#38bdf8;margin-bottom:8px;letter-spacing:0.5px">📊 CLASSIFICAÇÃO DO GRUPO</div>
                <table style="width:100%;border-collapse:collapse;font-size:11px;text-align:center">
                  <thead>
                    <tr style="color:#94a3b8;border-bottom:1px solid rgba(255,255,255,0.08)">
                      <th style="text-align:left;padding:6px">Clube</th>
                      <th style="padding:6px">J</th>
                      <th style="padding:6px">V</th>
                      <th style="padding:6px">E</th>
                      <th style="padding:6px">D</th>
                      <th style="padding:6px">SG</th>
                      <th style="padding:6px;font-weight:900;color:#fff">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${sortedStandings.map((tm, idx) => `
                      <tr style="border-bottom:1px solid rgba(255,255,255,0.04);${tm.isUser ? 'background:rgba(56,189,248,0.12);font-weight:800;color:#38bdf8' : ''}">
                        <td style="text-align:left;padding:6px;white-space:nowrap">${idx + 1}. ${window.esc ? window.esc(tm.club) : tm.club}</td>
                        <td style="padding:6px">${tm.j}</td>
                        <td style="padding:6px">${tm.v}</td>
                        <td style="padding:6px">${tm.e}</td>
                        <td style="padding:6px">${tm.d}</td>
                        <td style="padding:6px">${tm.sg > 0 ? '+' + tm.sg : tm.sg}</td>
                        <td style="padding:6px;font-weight:900;color:#facc15">${tm.p}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>

              <!-- CONFRONTOS DA COPINHA -->
              <div style="background:#0f172a;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px">
                <div style="font-size:12px;font-weight:900;color:#a855f7;margin-bottom:8px;letter-spacing:0.5px">📅 CONFRONTOS DA NOSSA BASE</div>
                <div style="display:flex;flex-direction:column;gap:6px">
                  ${cop.groupFixtures.map(f => `
                    <div style="display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,0.03);padding:7px 10px;border-radius:6px;font-size:11px">
                      <span style="color:#94a3b8">${f.date.slice(8,10)}/01 • R${f.round}</span>
                      <span style="font-weight:700">${window.esc ? window.esc(f.home) : f.home} <b style="color:#facc15">${f.result || 'vs'}</b> ${window.esc ? window.esc(f.away) : f.away}</span>
                      <span>${f.played ? '<span style="color:#22c55e;font-weight:800">Concluído</span>' : '<span style="color:#94a3b8">Agendado</span>'}</span>
                    </div>
                  `).join('')}
                  ${cop.knockouts.map(k => `
                    <div style="display:flex;justify-content:space-between;align-items:center;background:rgba(168,85,247,0.08);border:1px solid rgba(168,85,247,0.2);padding:7px 10px;border-radius:6px;font-size:11px">
                      <span style="color:#d8b4fe;font-weight:800">${k.phase}</span>
                      <span style="font-weight:700">${window.esc ? window.esc(k.home) : k.home} <b style="color:#facc15">${k.result || 'vs'}</b> ${window.esc ? window.esc(k.away) : k.away}</span>
                      <span>${k.played ? '<span style="color:#22c55e;font-weight:800">Concluído</span>' : '<span style="color:#94a3b8">Agendado</span>'}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- COLUNA DIREITA: DESEMPENHO INDIVIDUAL DOS ATLETAS DA BASE -->
            <div style="background:#0f172a;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px;display:flex;flex-direction:column">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                <span style="font-size:12px;font-weight:900;color:#22c55e;letter-spacing:0.5px">🌱 ATLETAS DA BASE & ESTATÍSTICAS NA COPINHA</span>
                <span style="font-size:10px;color:#94a3b8">Simulação automática</span>
              </div>
              <div style="max-height:380px;overflow-y:auto">
                <table style="width:100%;border-collapse:collapse;font-size:11px">
                  <thead>
                    <tr style="color:#94a3b8;border-bottom:1px solid rgba(255,255,255,0.08);text-align:left">
                      <th style="padding:6px">Jogador</th>
                      <th style="padding:6px">Pos</th>
                      <th style="padding:6px">OVR</th>
                      <th style="padding:6px">Jogos</th>
                      <th style="padding:6px">Gols</th>
                      <th style="padding:6px">Nota</th>
                      <th style="padding:6px;text-align:right">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${sortedYouth.map(p => `
                      <tr style="border-bottom:1px solid rgba(255,255,255,0.04)">
                        <td style="padding:6px">
                          <b>${window.esc ? window.esc(p.name) : p.name}</b>
                          ${p.copinhaBreakout ? '<span style="color:#facc15;font-size:10px;margin-left:4px">🔥 Revelação</span>' : ''}
                        </td>
                        <td style="padding:6px"><span style="background:#1e293b;padding:2px 6px;border-radius:4px;font-size:10px">${p.pos}</span></td>
                        <td style="padding:6px"><b style="color:#38bdf8">${p.overall || 65}</b></td>
                        <td style="padding:6px">${p.stats.games}</td>
                        <td style="padding:6px;font-weight:800;color:#facc15">${p.stats.goals}</td>
                        <td style="padding:6px;font-weight:800;color:${p.stats.avgRating >= 7.5 ? '#22c55e' : (p.stats.avgRating >= 6.5 ? '#38bdf8' : '#e2e8f0')}">${p.stats.avgRating || '-'}</td>
                        <td style="padding:6px;text-align:right">
                          <button class="btn btnPromoteFromCopinha" data-key="${p.key}" style="background:linear-gradient(135deg,#2563eb,#3b82f6);color:#fff;border:none;padding:4px 8px;border-radius:6px;font-size:10px;font-weight:800;cursor:pointer" title="Promover atleta direto ao elenco profissional">
                            📝 Subir ao Profissional
                          </button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      `;

      if(typeof window.openCustomModal === 'function'){
        window.openCustomModal('🏆 Copa São Paulo de Futebol Júnior (Copinha Sub-20)', bodyHtml, null, 'Fechar', false, '1080px');
      }

      // Bind botão de promoção direta ao profissional
      const promoteButtons = document.querySelectorAll('.btnPromoteFromCopinha');
      promoteButtons.forEach(btn => {
        btn.onclick = () => {
          const k = btn.dataset.key;
          if(typeof window.signProContract === 'function'){
            window.signProContract(k);
            if(typeof window.closeCustomModal === 'function') window.closeCustomModal();
            this.openCopinhaModal(state);
          }
        };
      });
    }
  };

  // Exportação Global
  window.AFM_CopinhaEngine = CopinhaSub20Engine;

})(typeof window !== 'undefined' ? window : globalThis);
