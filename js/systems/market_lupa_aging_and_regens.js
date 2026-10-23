(function (window) {
  'use strict';

  function hashString(str = '') {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
    return Math.abs(h);
  }

  function norm(str = '') {
    return String(str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }

  // Resolução resiliente e exata do atleta (por objeto, chave global, nome ou linha da tabela)
  function resolvePlayer(pOrKeyOrRow) {
    if (!pOrKeyOrRow) return null;

    // 1. Já é um objeto válido de jogador
    if (typeof pOrKeyOrRow === 'object' && !pOrKeyOrRow.nodeType && (pOrKeyOrRow.ovr || pOrKeyOrRow.overall || pOrKeyOrRow.fc || pOrKeyOrRow.pes || pOrKeyOrRow.name)) {
      return pOrKeyOrRow;
    }

    // 2. Elemento do DOM (botão da lupa ou linha <tr> da tabela)
    let domRow = null;
    let domKey = '';
    if (typeof pOrKeyOrRow === 'object' && pOrKeyOrRow.nodeType) {
      domRow = pOrKeyOrRow.closest ? pOrKeyOrRow.closest('tr, .market-row, .salary-item-clickable') : null;
      domKey = pOrKeyOrRow.dataset?.key || pOrKeyOrRow.dataset?.playerKey || domRow?.querySelector('[data-key]')?.dataset?.key || domRow?.querySelector('[data-player-key]')?.dataset?.playerKey || '';
    }

    const searchKey = typeof pOrKeyOrRow === 'string' ? pOrKeyOrRow : domKey;

    // 3. Busca através da API oficial global do simulador
    let p = null;
    if (searchKey && typeof window.findGlobalPlayerByKey === 'function') {
      p = window.findGlobalPlayerByKey(searchKey);
    }
    if (!p && searchKey && typeof window.findSquadPlayerByKey === 'function') {
      p = window.findSquadPlayerByKey(searchKey);
    }

    // 4. Busca direta em todos os repositórios em memória
    if (!p && searchKey) {
      const rawKey = String(searchKey).trim();
      const cleanName = rawKey.startsWith('n:') ? rawKey.slice(2).split('|')[0] : (rawKey.startsWith('id:') || rawKey.startsWith('fifa:') || rawKey.startsWith('pes:') ? rawKey.split(':')[1] : rawKey);
      const cleanNorm = norm(cleanName);

      const pools = [
        ...(window.state?.squad || []),
        ...((typeof window.marketUniverse === 'function' ? window.marketUniverse() : []) || []),
        ...(window.LIVE_PLAYERS || window.livePlayers || []),
        ...(window.state?.worldGenerated || []),
        ...(window.state?.worldRegens || [])
      ];

      p = pools.find(x => {
        if (!x) return false;
        if (x.marketKey && x.marketKey === rawKey) return true;
        if (typeof window.playerKey === 'function' && window.playerKey(x) === rawKey) return true;
        if (String(x.id) === cleanName || String(x.fifaId) === cleanName || String(x.pesId) === cleanName) return true;
        const xNorm = norm(x.name);
        return xNorm === cleanNorm || (cleanNorm.length >= 4 && (xNorm.includes(cleanNorm) || cleanNorm.includes(xNorm)));
      });

      if (!p && window.clubs) {
        for (const c of Object.values(window.clubs)) {
          if (Array.isArray(c?.squad)) {
            p = c.squad.find(x => x && norm(x.name) === cleanNorm);
            if (p) {
              if (!p.club) p.club = c.name;
              break;
            }
          }
        }
      }
    }

    // 5. Se foi clicado a partir de uma linha da tabela, extrai com 100% de precisão coluna a coluna
    if (domRow) {
      const tds = Array.from(domRow.querySelectorAll('td'));
      if (tds.length >= 4) {
        // Localiza célula do nome (que contenha <b> e não seja clube ou valor)
        let nameTd = tds.find(td => td.querySelector('b') && !td.querySelector('.club-cell') && !td.querySelector('.good') && !(td.innerText || '').includes('R$'));
        if (!nameTd) nameTd = tds[0];
        const domName = (nameTd?.querySelector('b')?.innerText || nameTd?.innerText || '').trim();

        // Localiza célula do clube (se for elenco próprio sem célula de clube, usa o clube ativo do save)
        const clubTd = tds.find(td => td.querySelector('.club-cell'));
        const domClub = (clubTd ? (clubTd.querySelector('.club-cell')?.innerText || clubTd.innerText) : (window.state?.club || 'Meu Clube')).replace(/[\r\n\t]+/g, ' ').trim();

        // Localiza posição tática
        const posTd = tds.find(td => td.querySelector('.pill') && /^(GK|GOL|CB|ZAG|LB|RB|LAT|LD|LE|DM|VOL|CM|MC|AM|MEI|LW|RW|PD|PE|ST|CF|ATA|CA)$/i.test((td.querySelector('.pill')?.innerText || '').trim()));
        const domPos = (posTd?.querySelector('.pill')?.innerText || tds[2]?.querySelector('.pill')?.innerText || tds[2]?.innerText || 'MEI').trim();

        // Localiza overall
        const ovrTd = tds.find(td => td.querySelector('.rating-pill'));
        const domOvr = parseInt(((ovrTd?.querySelector('.rating-pill') || tds[3])?.innerText || '').replace(/\D/g, ''), 10);

        // Localiza idade
        const ageTd = tds.find(td => (td.innerText || '').includes('anos'));
        const domAge = parseInt(((ageTd || tds[4])?.innerText || '').replace(/\D/g, ''), 10);

        // Localiza valor de mercado
        const valTd = tds.find(td => td.querySelector('.good') || (td.innerText || '').includes('R$'));
        const rawValText = ((valTd?.querySelector('.good') || valTd || tds[5])?.innerText || '').trim();
        const cleanValText = rawValText.includes('R$') ? rawValText : (rawValText ? `R$ ${rawValText}` : '');

        if (!p) {
          p = {
            name: domName || 'Atleta',
            club: domClub || 'Mercado Global',
            pos: domPos || 'MEI',
            ovr: !isNaN(domOvr) && domOvr >= 45 ? domOvr : 78,
            overall: !isNaN(domOvr) && domOvr >= 45 ? domOvr : 78,
            age: !isNaN(domAge) && domAge >= 15 ? domAge : 22,
            valText: cleanValText
          };
        } else {
          // Se o overall ou idade no elemento visual for mais específico/atualizado, sincroniza:
          if (!isNaN(domOvr) && domOvr >= 45 && !p.ovr && !p.overall) p.ovr = domOvr;
          if (!isNaN(domAge) && domAge >= 15 && !p.age) p.age = domAge;
          if (cleanValText && !p.valText) p.valText = cleanValText;
        }
      }
    }

    // Sincroniza e enriquece atributos autênticos de fotos, tmId e ratings globais
    if (p) {
      if (!p.club && window.state?.club) {
        p.club = window.state.club;
      }
      const pNorm = norm(p.name);
      const cNorm = norm(p.club);
      const liveList = window.LIVE_PLAYERS || window.livePlayers || [];
      const matched = liveList.find(lp => {
        if (!lp) return false;
        if (norm(lp.name) === pNorm && (!cNorm || norm(lp.club) === cNorm)) return true;
        return false;
      }) || liveList.find(lp => lp && norm(lp.name) === pNorm);

      if (matched) {
        if (!p.photo && matched.photo) p.photo = matched.photo;
        if (!p.tmId && matched.tmId) p.tmId = matched.tmId;
        if (!p.country && matched.country) p.country = matched.country;
        if (!p.number && matched.number) p.number = matched.number;
        if (matched.fc && (!p.ovr || p.ovr === 78)) {
          p.ovr = matched.fc;
          p.overall = matched.fc;
        }
      }
    }

    return p;
  }

  // Gera ou recupera o histórico isolado de 3 temporadas passadas + temporada atual do save
  function getOrInitCareerHistory(p, state) {
    if (!p) return null;
    const st = state || window.state || {};
    st.playerCareerHistory = st.playerCareerHistory || {};

    const pName = p.name || 'Jogador';
    const pClub = p.club || 'Clube Atual';
    const key = (typeof window.playerKey === 'function' ? window.playerKey(p) : '') || norm(pName + '_' + pClub);

    const curSeasonYear = Number(st.season) || 2026;
    const ovr = Number(p.ovr || p.overall || (typeof window.playerOverall === 'function' ? window.playerOverall(p) : 75));
    const age = Number(p.age) || 24;
    const pos = p.pos || 'MEI';
    const isGK = /^(GK|GOL)$/i.test(pos);
    const isDefender = /^(CB|LB|RB|ZAG|LAT|LD|LE)$/i.test(pos);
    const isMidfielder = /^(DM|CM|AM|VOL|MEI|MC)$/i.test(pos);
    const isAttacker = /^(ST|CF|LW|RW|ATA|PON|CA|PD|PE)$/i.test(pos);

    // Se já existe no save, atualiza e sincroniza os dados da temporada atual
    if (st.playerCareerHistory[key]) {
      const rec = st.playerCareerHistory[key];
      // Garante que a temporada atual corresponda ao clube e stats em tempo real
      const cur = rec.seasons.find(s => s.seasonYear === curSeasonYear);
      if (cur) {
        if (p.club) cur.club = p.club;
        if (p.goals != null && p.goals > cur.goals) cur.goals = p.goals;
        if (p.assists != null && p.assists > cur.assists) cur.assists = p.assists;
        if (p.games != null && p.games > cur.games) cur.games = p.games;
      }
      return rec;
    }

    // Criação inicial das 4 temporadas (Atual + 3 Passadas)
    const h = hashString(pName + '_' + pClub);
    const seasons = [];

    // Temporada Atual (em progresso no save)
    const curRound = Math.max(1, Math.min(38, Number(st.round) || 1));
    const starterRatio = (ovr >= 78 ? 0.92 : (ovr >= 72 ? 0.75 : 0.45));
    const currentGames = p.games != null ? p.games : Math.max(0, Math.round(curRound * starterRatio));
    
    let currentGoals = p.goals != null ? p.goals : 0;
    if (p.goals == null && currentGames > 0) {
      if (isAttacker) currentGoals = Math.round(currentGames * (0.35 + (ovr >= 85 ? 0.35 : (ovr >= 78 ? 0.18 : 0.05))));
      else if (isMidfielder) currentGoals = Math.round(currentGames * (0.12 + (ovr >= 80 ? 0.12 : 0.02)));
      else if (isDefender) currentGoals = Math.round(currentGames * 0.04);
    }

    let currentAssists = p.assists != null ? p.assists : 0;
    if (p.assists == null && currentGames > 0) {
      if (isMidfielder) currentAssists = Math.round(currentGames * (0.24 + (ovr >= 80 ? 0.15 : 0.05)));
      else if (isAttacker) currentAssists = Math.round(currentGames * (0.18 + (ovr >= 82 ? 0.12 : 0.02)));
      else if (isDefender) currentAssists = Math.round(currentGames * 0.06);
    }

    const currentCleanSheets = isGK ? Math.round(currentGames * (0.32 + (ovr >= 80 ? 0.15 : 0.05))) : 0;
    const currentRating = +(6.6 + (ovr - 70) * 0.04 + (currentGoals * 0.08) / Math.max(1, currentGames)).toFixed(2);

    seasons.push({
      seasonYear: curSeasonYear,
      label: `Temporada Atual (${curSeasonYear})`,
      isCurrent: true,
      club: pClub,
      games: currentGames,
      goals: currentGoals,
      assists: currentAssists,
      cleanSheets: currentCleanSheets,
      rating: Math.min(9.4, Math.max(6.2, currentRating)),
      status: 'Em disputa ⚽'
    });

    // 3 Temporadas Passadas (ex: 2025, 2024, 2023)
    for (let i = 1; i <= 3; i++) {
      const pastYear = curSeasonYear - i;
      const ageAtYear = Math.max(15, age - i);
      const isRookie = ageAtYear <= 17;
      
      const totalPossibleMatches = 38 + (h % 10);
      const pastGames = isRookie 
        ? Math.max(4, Math.round(totalPossibleMatches * 0.35 + (h % 6)))
        : Math.max(12, Math.round(totalPossibleMatches * (0.75 + ((h >> i) % 20) / 100)));

      let pastGoals = 0;
      if (isAttacker) {
        const goalRate = isRookie ? 0.28 : (0.42 + (ovr >= 85 ? 0.30 : (ovr >= 78 ? 0.15 : 0.02)));
        pastGoals = Math.max(isRookie ? 1 : 4, Math.round(pastGames * goalRate + ((h >> (i + 1)) % 5)));
      } else if (isMidfielder) {
        pastGoals = Math.max(0, Math.round(pastGames * 0.16 + ((h >> (i + 1)) % 4)));
      } else if (isDefender) {
        pastGoals = Math.max(0, Math.round(pastGames * 0.05 + ((h >> (i + 2)) % 2)));
      }

      let pastAssists = 0;
      if (isMidfielder) {
        pastAssists = Math.max(1, Math.round(pastGames * 0.28 + ((h >> (i + 2)) % 6)));
      } else if (isAttacker) {
        pastAssists = Math.max(0, Math.round(pastGames * 0.18 + ((h >> (i + 3)) % 5)));
      } else if (isDefender) {
        pastAssists = Math.max(0, Math.round(pastGames * 0.07));
      }

      const pastCleanSheets = isGK ? Math.max(3, Math.round(pastGames * 0.38)) : 0;
      const pastRating = +(6.7 + ((ovr - (i * 2)) - 70) * 0.035 + (pastGoals * 0.05) / Math.max(1, pastGames)).toFixed(2);

      // Clube da época (se jovem revelado, pode ser o mesmo clube ou anterior)
      const pastClub = (i >= 2 && (h % 3 === 0)) ? (p.previousClub || pClub) : pClub;

      seasons.push({
        seasonYear: pastYear,
        label: `Temporada ${pastYear}`,
        isCurrent: false,
        club: pastClub,
        games: pastGames,
        goals: pastGoals,
        assists: pastAssists,
        cleanSheets: pastCleanSheets,
        rating: Math.min(9.2, Math.max(6.1, pastRating)),
        status: 'Concluída 🏆'
      });
    }

    const careerRecord = {
      playerKey: key,
      name: pName,
      seasons
    };

    st.playerCareerHistory[key] = careerRecord;
    return careerRecord;
  }

  const MarketLupaAgingAndRegens = {
    // Processamento de gols e jogos rodada a rodada integrado ao save
    processRoundMatchStats(state, matchResult) {
      if (!state) return;
      state.playerCareerHistory = state.playerCareerHistory || {};
      const curYear = Number(state.season) || 2026;

      // 1. Atualiza atletas titulares do clube do usuário
      if (Array.isArray(state.lineup) && Array.isArray(state.squad)) {
        const starters = state.lineup.map(k => state.squad.find(p => (typeof window.playerKey === 'function' ? window.playerKey(p) : p.name) === k)).filter(Boolean);
        
        starters.forEach(p => {
          const rec = getOrInitCareerHistory(p, state);
          if (rec && rec.seasons && rec.seasons[0]) {
            rec.seasons[0].games = (rec.seasons[0].games || 0) + 1;
            p.games = (p.games || 0) + 1;
          }
        });

        // Contabiliza gols e assistências oficiais da partida do usuário
        if (matchResult && Array.isArray(matchResult.events)) {
          matchResult.events.forEach(ev => {
            if (ev?.type === 'gol' && ev.player) {
              const scorer = state.squad.find(p => norm(p.name) === norm(ev.player));
              if (scorer) {
                scorer.goals = (scorer.goals || 0) + 1;
                const rec = getOrInitCareerHistory(scorer, state);
                if (rec && rec.seasons && rec.seasons[0]) {
                  rec.seasons[0].goals = (rec.seasons[0].goals || 0) + 1;
                }
              }
              if (ev.assist) {
                const assister = state.squad.find(p => norm(p.name) === norm(ev.assist));
                if (assister) {
                  assister.assists = (assister.assists || 0) + 1;
                  const rec = getOrInitCareerHistory(assister, state);
                  if (rec && rec.seasons && rec.seasons[0]) {
                    rec.seasons[0].assists = (rec.seasons[0].assists || 0) + 1;
                  }
                }
              }
            }
          });

          // Se o usuário não sofreu gols, dá clean sheet ao goleiro
          if (matchResult.ga === 0) {
            const gk = starters.find(p => p.pos === 'GK');
            if (gk) {
              const rec = getOrInitCareerHistory(gk, state);
              if (rec && rec.seasons && rec.seasons[0]) {
                rec.seasons[0].cleanSheets = (rec.seasons[0].cleanSheets || 0) + 1;
              }
            }
          }

          // Processamento dinâmico de XP e Evolução do Atleta por partida oficial
          if (window.AFM_PlayerXPEvolution && typeof window.AFM_PlayerXPEvolution.processMatchXP === 'function') {
            window.AFM_PlayerXPEvolution.processMatchXP(state, matchResult);
          }
        }
      }

      // 2. Simula rodada de gols e jogos para atletas do mercado e do mundo
      const registeredKeys = Object.keys(state.playerCareerHistory);
      registeredKeys.forEach(k => {
        const rec = state.playerCareerHistory[k];
        if (!rec || !rec.seasons || !rec.seasons[0]) return;
        const cur = rec.seasons[0];
        if (cur.seasonYear !== curYear) return;

        // Se não é do clube do usuário, avança jogos e gols proporcionalmente à rodada
        if (state.club && norm(cur.club) !== norm(state.club)) {
          cur.games = (cur.games || 0) + 1;
          const roll = Math.random();
          // Probabilidade de gol na rodada conforme histórico e posição
          if (roll < 0.38) {
            cur.goals = (cur.goals || 0) + 1;
          }
          if (Math.random() < 0.22) {
            cur.assists = (cur.assists || 0) + 1;
          }
        }
      });
    },

    openPlayerDetails(pOrKeyOrRow) {
      const p = resolvePlayer(pOrKeyOrRow);
      const state = window.state || {};
      const career = getOrInitCareerHistory(p, state);

      const name = p?.name || 'Jogador';
      const pos = (p?.pos || 'MEI').toUpperCase();
      const club = p?.club || 'Mercado Global';
      const age = Number(p?.age) || 22;

      // Cálculo e exibição do Overall REAL do atleta
      const realOvr = Number(p?.ovr || p?.overall || (typeof window.playerOverall === 'function' && p ? window.playerOverall(p) : 78));
      const potential = Number(p?.potential) || Math.min(99, realOvr + (age <= 21 ? 9 : (age <= 24 ? 6 : (age <= 28 ? 2 : 0))));

      // Valor de mercado limpo e formatado
      let valText = p?.valText;
      if (!valText) {
        const valMi = p?.value != null ? p.value : (typeof window.calcValueMi === 'function' && p ? window.calcValueMi(p) : (realOvr * 0.45));
        valText = typeof window.fmtMi === 'function' ? window.fmtMi(valMi) : `R$ ${Number(valMi).toFixed(1)} mi`;
      }

      // Salário
      const salary = p?.wage != null && p.wage > 0 ? p.wage : (typeof window.playerSalary === 'function' && p ? window.playerSalary(p) : Math.round(realOvr * 1200));
      const country = p?.country || '';

      const isGK = /^(GK|GOL)$/i.test(pos);
      const isDefender = /^(CB|LB|RB|ZAG|LAT|LD|LE)$/i.test(pos);
      const isMidfielder = /^(DM|CM|AM|VOL|MEI|MC)$/i.test(pos);
      const isAttacker = /^(ST|CF|LW|RW|ATA|PON|CA|PD|PE)$/i.test(pos);

      // Cores visuais de acordo com o Overall Real
      const ovrRatingBg = realOvr >= 85 ? 'linear-gradient(135deg, #f59e0b, #d97706)' : (realOvr >= 78 ? 'linear-gradient(135deg, #eab308, #ca8a04)' : (realOvr >= 70 ? 'linear-gradient(135deg, #0284c7, #0369a1)' : '#475569'));
      const ovrRatingColor = '#000';
      const ovrBorderColor = realOvr >= 85 ? '#f59e0b' : (realOvr >= 78 ? '#eab308' : (realOvr >= 70 ? '#38bdf8' : '#a78bfa'));
      const ovrGlowColor = realOvr >= 85 ? 'rgba(245,158,11,0.5)' : (realOvr >= 78 ? 'rgba(234,179,8,0.4)' : 'rgba(124,58,237,0.3)');

      // Determinação dos Tiers FIFA (Especial 84+ e Festival 90+)
      const isLegendary = realOvr >= 90;
      const isSpecial = realOvr >= 84 && realOvr < 90;
      const isGoldRare = realOvr >= 78 && realOvr < 84;
      const isGold = realOvr >= 70 && realOvr < 78;
      const isSilver = realOvr >= 60 && realOvr < 70;

      const futTierClass = isLegendary ? 'fut-card-legendary' : (isSpecial ? 'fut-card-special' : (isGoldRare ? 'fut-card-gold-rare' : (isGold ? 'fut-card-gold' : (isSilver ? 'fut-card-silver' : 'fut-card-bronze'))));
      const futTierPill = isLegendary ? '👑 FESTIVAL 90+' : (isSpecial ? '⭐ TOTW IN-FORM' : (isGoldRare ? 'OURO RARO' : (isGold ? 'OURO' : (isSilver ? 'PRATA' : 'BRONZE'))));

      const photoUrl = (typeof window.resolvePlayerPhotoUrl === 'function' ? window.resolvePlayerPhotoUrl(p) : null) || p?.photo || (p?.tmId ? `img/players/tm_${p.tmId}.jpg` : null);
      const fallbackUrl = 'img/players/default_avatar.svg';
      const shortSurname = (name.split(/\s+/).pop() || name).toUpperCase();

      // Cálculo dos 6 Atributos Dinâmicos FIFA FUT
      let s1 = { l: isGK ? 'DIV' : 'PAC', v: Math.round(realOvr * 0.98) };
      let s2 = { l: isGK ? 'HAN' : 'SHO', v: Math.round(realOvr * (isAttacker ? 1.02 : (isMidfielder ? 0.92 : 0.65))) };
      let s3 = { l: isGK ? 'KIC' : 'PAS', v: Math.round(realOvr * (isMidfielder ? 1.03 : (isAttacker ? 0.90 : 0.82))) };
      let s4 = { l: isGK ? 'REF' : 'DRI', v: Math.round(realOvr * (isAttacker ? 1.01 : (isMidfielder ? 0.98 : 0.74))) };
      let s5 = { l: isGK ? 'SPD' : 'DEF', v: Math.round(realOvr * (isDefender ? 1.03 : (isMidfielder ? 0.78 : 0.48))) };
      let s6 = { l: isGK ? 'POS' : 'PHY', v: Math.round(realOvr * (isDefender ? 1.01 : (isAttacker ? 0.92 : 0.85))) };
      [s1, s2, s3, s4, s5, s6].forEach(s => { s.v = Math.min(99, Math.max(40, s.v)); });

      let badgeHtml = '';
      if (club && typeof window.clubBadge === 'function') {
        badgeHtml = window.clubBadge(club, 22);
      }

      const futCardHtml = `
        <div class="fut-card ${futTierClass}">
          <div class="fut-card-top">
            <div class="fut-card-ovr-box">
              <span class="fut-card-ovr">${realOvr}</span>
              <span class="fut-card-pos">${pos}</span>
            </div>
            <div class="fut-card-crest">
              ${badgeHtml || ''}
            </div>
          </div>
          <div class="fut-card-photo-wrap">
            <img src="${photoUrl || fallbackUrl}" 
                 alt="${name}" 
                 class="fut-card-photo" 
                 loading="lazy" 
                 onerror="this.onerror=null;this.src='${fallbackUrl}';" />
          </div>
          <div class="fut-card-bottom">
            <div class="fut-card-name">${shortSurname}</div>
            <div class="fut-card-tier-pill">${futTierPill}</div>
            <div class="fut-card-stats">
              <div class="fut-card-stat-item"><span class="fut-card-stat-val">${s1.v}</span><span class="fut-card-stat-lbl">${s1.l}</span></div>
              <div class="fut-card-stat-item"><span class="fut-card-stat-val">${s2.v}</span><span class="fut-card-stat-lbl">${s2.l}</span></div>
              <div class="fut-card-stat-item"><span class="fut-card-stat-val">${s3.v}</span><span class="fut-card-stat-lbl">${s3.l}</span></div>
              <div class="fut-card-stat-item"><span class="fut-card-stat-val">${s4.v}</span><span class="fut-card-stat-lbl">${s4.l}</span></div>
              <div class="fut-card-stat-item"><span class="fut-card-stat-val">${s5.v}</span><span class="fut-card-stat-lbl">${s5.l}</span></div>
              <div class="fut-card-stat-item"><span class="fut-card-stat-val">${s6.v}</span><span class="fut-card-stat-lbl">${s6.l}</span></div>
            </div>
          </div>
        </div>
      `;

      // Atributos de desempenho ajustados rigorosamente ao OVERALL REAL do atleta
      const h = hashString(name + '_' + club);
      let attrTitle = 'ATRIBUTOS FÍSICOS & TÉCNICOS';
      let attributes = [];

      if (isGK) {
        attrTitle = 'ATRIBUTOS DE GOLEIRO (ESCALA REAL)';
        attributes = [
          { name: 'Reflexos', icon: '⚡', val: Math.min(99, Math.max(50, realOvr + 3 + (h % 4))) },
          { name: 'Pegada & Firmeza', icon: '🧤', val: Math.min(99, Math.max(50, realOvr + 2 + ((h >> 2) % 4))) },
          { name: 'Posicionamento', icon: '📐', val: Math.min(99, Math.max(50, realOvr + 1 + ((h >> 3) % 4))) },
          { name: 'Saída de Gol', icon: '⚽', val: Math.min(99, Math.max(45, realOvr - 2 + ((h >> 4) % 5))) },
          { name: 'Reposição', icon: '🎯', val: Math.min(99, Math.max(45, realOvr + ((h >> 5) % 4))) },
          { name: 'Elasticidade', icon: '💪', val: Math.min(99, Math.max(50, realOvr + 2 + ((h >> 6) % 4))) }
        ];
      } else if (isDefender) {
        attrTitle = 'ATRIBUTOS DEFENSIVOS & FÍSICOS (ESCALA REAL)';
        attributes = [
          { name: 'Desarme & Bote', icon: '🛡️', val: Math.min(99, Math.max(52, realOvr + 4 + (h % 3))) },
          { name: 'Marcação', icon: '🪓', val: Math.min(99, Math.max(52, realOvr + 3 + ((h >> 2) % 3))) },
          { name: 'Força Física', icon: '💪', val: Math.min(99, Math.max(50, realOvr + 2 + ((h >> 3) % 4))) },
          { name: 'Velocidade', icon: '⚡', val: Math.min(99, Math.max(48, realOvr + (age <= 25 ? 4 : -3) + ((h >> 4) % 4))) },
          { name: 'Jogo Aéreo', icon: '✈️', val: Math.min(99, Math.max(50, realOvr + 2 + ((h >> 5) % 4))) },
          { name: 'Passe & Saída', icon: '📐', val: Math.min(99, Math.max(45, realOvr - 2 + ((h >> 6) % 4))) }
        ];
      } else if (isMidfielder) {
        attrTitle = 'ATRIBUTOS DE CRIAÇÃO & MEIO-CAMPO (ESCALA REAL)';
        attributes = [
          { name: 'Passe & Visão', icon: '📐', val: Math.min(99, Math.max(52, realOvr + 4 + (h % 3))) },
          { name: 'Drible & Controle', icon: '🪄', val: Math.min(99, Math.max(52, realOvr + 3 + ((h >> 2) % 4))) },
          { name: 'Chute & Finalização', icon: '🎯', val: Math.min(99, Math.max(48, realOvr + ((h >> 3) % 4))) },
          { name: 'Ritmo & Agilidade', icon: '⚡', val: Math.min(99, Math.max(48, realOvr + (age <= 26 ? 3 : -2) + ((h >> 4) % 4))) },
          { name: 'Força & Combate', icon: '💪', val: Math.min(99, Math.max(46, realOvr + ((h >> 5) % 5))) },
          { name: 'Desarme', icon: '🛡️', val: Math.min(99, Math.max(45, realOvr + (pos.includes('DM') || pos.includes('VOL') ? 4 : -4) + ((h >> 6) % 4))) }
        ];
      } else {
        attrTitle = 'ATRIBUTOS DE ATAQUE & DEFINIÇÃO (ESCALA REAL)';
        attributes = [
          { name: 'Finalização & Chute', icon: '🎯', val: Math.min(99, Math.max(52, realOvr + 5 + (h % 3))) },
          { name: 'Velocidade & Arranque', icon: '⚡', val: Math.min(99, Math.max(50, realOvr + (age <= 26 ? 5 : -2) + ((h >> 2) % 4))) },
          { name: 'Drible & Finta', icon: '🪄', val: Math.min(99, Math.max(50, realOvr + 4 + ((h >> 3) % 3))) },
          { name: 'Força & Explosão', icon: '💪', val: Math.min(99, Math.max(48, realOvr + 1 + ((h >> 4) % 4))) },
          { name: 'Passe & Criação', icon: '📐', val: Math.min(99, Math.max(45, realOvr - 1 + ((h >> 5) % 4))) },
          { name: 'Cabeceio', icon: '✈️', val: Math.min(99, Math.max(45, realOvr + (pos.includes('ST') || pos.includes('CA') ? 3 : -3) + ((h >> 6) % 4))) }
        ];
      }

      // Remove modal antigo se aberto
      const oldModal = document.getElementById('afm-market-lupa-modal');
      if (oldModal) oldModal.remove();

      const pKey = p?.marketKey || (typeof window.playerKey === 'function' && p ? window.playerKey(p) : (p?.name || name));
      const seasons = career?.seasons || [];
      let activeSeasonIdx = 0; // 0 = Temporada Atual

      const modal = document.createElement('div');
      modal.id = 'afm-market-lupa-modal';
      modal.style.cssText = 'position:fixed;inset:0;background:rgba(5,8,17,0.85);backdrop-filter:blur(8px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;font-family:system-ui,-apple-system,sans-serif;color:#fff;animation:afmFadeIn 0.2s ease-out;';

      function renderModalContent() {
        const selSeason = seasons[activeSeasonIdx] || seasons[0] || {};
        const games = selSeason.games || 0;
        const goals = selSeason.goals || 0;
        const assists = selSeason.assists || 0;
        const cleanSheets = selSeason.cleanSheets || 0;
        const seasonClub = selSeason.club || club;
        const rating = selSeason.rating || 7.2;

        modal.innerHTML = `
          <div class="afm-lupa-modal-dialog" style="background:#0f172a;border:1.5px solid rgba(124,58,237,0.7);border-radius:20px;max-width:min(940px,95vw);width:100%;padding:18px 20px;box-shadow:0 25px 60px rgba(0,0,0,0.85),0 0 35px ${ovrGlowColor};position:relative;max-height:94vh;display:flex;flex-direction:column;box-sizing:border-box;">
            
            <div class="afm-lupa-split-layout" style="display:grid;grid-template-columns:minmax(190px,220px) 1fr;gap:20px;align-items:start;overflow-y:auto;max-height:calc(94vh - 36px);padding-right:4px;">
              
              <!-- COLUNA ESQUERDA: CARD DO JOGADOR, BADGES, CLUBE E MUDAR POSIÇÃO -->
              <div style="display:flex;flex-direction:column;align-items:center;background:linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(13,19,34,0.6) 100%);border:1px solid rgba(255,255,255,0.06);border-radius:16px;padding:16px 12px;position:relative;">
                
                <!-- Card FIFA Personalizado -->
                <div style="transform:scale(1.02);margin-bottom:12px;">
                  ${futCardHtml}
                </div>

                <!-- Posição e Botão Mudar Posição -->
                <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;width:100%;justify-content:center;flex-wrap:wrap;">
                  <span style="background:#5b21b6;color:#fff;font-size:11px;font-weight:900;padding:3px 9px;border-radius:6px;letter-spacing:0.5px;">${pos}</span>
                  <button type="button" class="btnChangePlayerPosLupa" style="background:#4c1d95;color:#e9d5ff;border:1px solid #7c3aed;font-size:10px;font-weight:800;padding:3px 8px;border-radius:6px;cursor:pointer;display:inline-flex;align-items:center;gap:3px;transition:all 0.15s ease;" title="Personalizar posição oficial de ${esc(name)}">✏️ Mudar Posição</button>
                </div>

                <!-- Badges de OVR e POT -->
                <div style="display:flex;align-items:center;gap:6px;margin-bottom:10px;width:100%;justify-content:center;flex-wrap:wrap;">
                  <span style="background:${ovrRatingBg};color:${ovrRatingColor};font-size:11px;font-weight:900;padding:3px 8px;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,0.3);">OVR ${realOvr}</span>
                  <span style="background:rgba(234,179,8,0.18);color:#fbbf24;border:1px solid rgba(234,179,8,0.4);font-size:11px;font-weight:800;padding:3px 8px;border-radius:6px;">⭐ POT ${potential}</span>
                </div>

                <!-- Clube e País -->
                <div style="display:flex;flex-direction:column;align-items:center;gap:4px;font-size:11px;color:#94a3b8;width:100%;border-top:1px solid rgba(255,255,255,0.06);padding-top:10px;">
                  <div style="display:inline-flex;align-items:center;gap:6px;">
                    ${badgeHtml}
                    <b style="color:#38bdf8;font-size:12px;">${esc(club)}</b>
                  </div>
                  ${country ? `<span style="font-size:10px;color:#cbd5e1;">🌍 ${esc(country)}</span>` : ''}
                </div>
              </div>

              <!-- COLUNA DIREITA: DADOS DO JOGADOR, HISTÓRICO, STATS & ATRIBUTOS -->
              <div style="display:flex;flex-direction:column;gap:12px;min-width:0;">
                
                <!-- Topo da Direita: Nome, Chips e Botão Fechar -->
                <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:12px;">
                  <div style="min-width:0;">
                    <h2 style="margin:0 0 6px 0;font-size:24px;font-weight:900;color:#fff;letter-spacing:-0.5px;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${name}</h2>
                    
                    <!-- Chips de Idade, Valor, Salário -->
                    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:11px;color:#cbd5e1;">
                      <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);padding:3px 8px;border-radius:6px;display:inline-flex;align-items:center;gap:4px;">
                        <span>🎂 Idade:</span> <b style="color:#fff;">${age} anos</b>
                      </div>
                      <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);padding:3px 8px;border-radius:6px;display:inline-flex;align-items:center;gap:4px;">
                        <span>💰 Valor:</span> <b style="color:#34d399;">${valText}</b>
                      </div>
                      <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);padding:3px 8px;border-radius:6px;display:inline-flex;align-items:center;gap:4px;">
                        <span>💼 Salário:</span> <b style="color:#fbbf24;">R$ ${salary.toLocaleString('pt-BR')}/mês</b>
                      </div>
                    </div>
                  </div>

                  <!-- Botão Fechar -->
                  <div style="display:flex;gap:8px;align-items:center">
                    <button id="btn-fav-lupa-toggle" type="button" class="btn btn-fav-star ${window.AFM_MarketFavorites && window.AFM_MarketFavorites.isFavorite(pKey) ? 'active' : ''}" data-key="${pKey}" style="background:${window.AFM_MarketFavorites && window.AFM_MarketFavorites.isFavorite(pKey) ? '#facc15' : 'rgba(255,255,255,0.08)'};color:${window.AFM_MarketFavorites && window.AFM_MarketFavorites.isFavorite(pKey) ? '#000' : '#facc15'};border:1px solid ${window.AFM_MarketFavorites && window.AFM_MarketFavorites.isFavorite(pKey) ? '#facc15' : 'rgba(250,204,21,0.4)'};padding:6px 12px;border-radius:8px;cursor:pointer;font-weight:800;font-size:11px;white-space:nowrap;display:inline-flex;align-items:center;gap:4px">⭐ ${window.AFM_MarketFavorites && window.AFM_MarketFavorites.isFavorite(pKey) ? 'Salvo nos Favoritos' : 'Favoritar'}</button>
                    <button id="close-lupa-modal" type="button" style="background:#1e293b;color:#cbd5e1;border:1px solid #334155;padding:6px 14px;border-radius:8px;cursor:pointer;font-weight:800;font-size:11px;white-space:nowrap;transition:all 0.2s;" onmouseover="this.style.background='#334155';this.style.color='#fff'" onmouseout="this.style.background='#1e293b';this.style.color='#cbd5e1'">✕ Fechar</button>
                  </div>
                </div>

                <!-- Abas de Temporadas -->
                <div>
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:6px;">
                    <span style="font-size:10px;font-weight:900;color:#a78bfa;letter-spacing:0.8px;text-transform:uppercase;">
                      📅 HISTÓRICO DE TEMPORADAS NO SAVE
                    </span>
                    <span style="font-size:10px;color:#94a3b8;">
                      Equipe na época: <b style="color:#38bdf8;">${seasonClub}</b>
                    </span>
                  </div>

                  <div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;">
                    ${seasons.map((s, idx) => {
                      const isActive = idx === activeSeasonIdx;
                      return `
                        <button type="button" class="afm-btn-season-tab" data-s-idx="${idx}" style="background:${isActive ? 'linear-gradient(135deg, #7c3aed, #4f46e5)' : 'rgba(255,255,255,0.05)'};color:${isActive ? '#fff' : '#cbd5e1'};border:${isActive ? '1px solid #a78bfa' : '1px solid rgba(255,255,255,0.08)'};border-radius:8px;padding:5px 10px;font-size:11px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:4px;white-space:nowrap;transition:all 0.2s;">
                          <span>${s.isCurrent ? '🟢' : '📅'}</span>
                          <span>${s.label}</span>
                        </button>
                      `;
                    }).join('')}
                  </div>
                </div>

                <!-- Stats Grid (Cards Dinâmicos da Temporada Selecionada) -->
                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;text-align:center;">
                  <div style="background:#090d16;border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:8px 6px;">
                    <div style="font-size:9px;color:#94a3b8;font-weight:900;letter-spacing:0.5px;">JOGOS</div>
                    <div style="font-size:18px;font-weight:900;margin-top:2px;color:#fff;">🏟️ ${games}</div>
                    <div style="font-size:9px;color:#64748b;">Oficiais</div>
                  </div>

                  ${isGK ? `
                    <div style="background:#090d16;border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:8px 6px;">
                      <div style="font-size:9px;color:#94a3b8;font-weight:900;letter-spacing:0.5px;">SEM GOLS</div>
                      <div style="font-size:18px;font-weight:900;color:#34d399;margin-top:2px;">🧤 ${cleanSheets}</div>
                      <div style="font-size:9px;color:#64748b;">Clean Sheets</div>
                    </div>
                  ` : `
                    <div style="background:#090d16;border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:8px 6px;">
                      <div style="font-size:9px;color:#94a3b8;font-weight:900;letter-spacing:0.5px;">GOLS</div>
                      <div style="font-size:18px;font-weight:900;color:#34d399;margin-top:2px;">⚽ ${goals}</div>
                      <div style="font-size:9px;color:#64748b;">${games > 0 ? (goals / games).toFixed(2) + '/j' : '0.00'}</div>
                    </div>
                  `}

                  <div style="background:#090d16;border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:8px 6px;">
                    <div style="font-size:9px;color:#94a3b8;font-weight:900;letter-spacing:0.5px;">${isGK ? 'DEFESAS' : 'ASSISTÊNCIAS'}</div>
                    <div style="font-size:18px;font-weight:900;color:#38bdf8;margin-top:2px;">${isGK ? '🛡️ ' + Math.round(games * 2.2) : '👟 ' + assists}</div>
                    <div style="font-size:9px;color:#64748b;">${isGK ? 'Paredão' : 'Garçom'}</div>
                  </div>

                  <div style="background:#090d16;border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:8px 6px;">
                    <div style="font-size:9px;color:#94a3b8;font-weight:900;letter-spacing:0.5px;">NOTA</div>
                    <div style="font-size:18px;font-weight:900;color:#facc15;margin-top:2px;">⭐ ${rating}</div>
                    <div style="font-size:9px;color:#64748b;">Média</div>
                  </div>
                </div>

                <!-- Seção de Evolução & XP do Jogador -->
                

                <!-- Granular Attributes Box com Escala Real -->
                <div style="background:#090d16;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px;">
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                    <div style="font-size:11px;font-weight:900;color:#a78bfa;letter-spacing:0.5px;">${attrTitle}</div>
                    <div style="font-size:10px;color:#64748b;">Escala EA FC & eFootball (Overall ${realOvr})</div>
                  </div>

                  <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;">
                    ${attributes.map(a => {
                      const color = a.val >= 85 ? '#4ade80' : (a.val >= 75 ? '#38bdf8' : (a.val >= 65 ? '#fbbf24' : '#f87171'));
                      const barColor = a.val >= 85 ? '#22c55e' : (a.val >= 75 ? '#0284c7' : (a.val >= 65 ? '#eab308' : '#ef4444'));
                      const pct = Math.min(100, Math.max(0, (a.val - 40) / 60 * 100));
                      return `
                        <div style="background:#111827;border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:7px 10px;">
                          <div style="display:flex;justify-content:space-between;align-items:center;font-size:11px;">
                            <span style="color:#cbd5e1;font-weight:700;">${a.icon} ${a.name}</span>
                            <b style="color:${color};font-size:13px;font-weight:900;">${a.val}</b>
                          </div>
                          <div style="background:rgba(255,255,255,0.08);height:5px;border-radius:3px;overflow:hidden;margin-top:6px;">
                            <div style="width:${pct}%;height:100%;background:${barColor};border-radius:3px;transition:width 0.3s;"></div>
                          </div>
                        </div>
                      `;
                    }).join('')}
                  </div>
                </div>

              </div>
            </div>
          </div>
        `;

        // Eventos
        const favToggleBtn = modal.querySelector('#btn-fav-lupa-toggle');
        if (favToggleBtn) {
          favToggleBtn.onclick = () => {
            if (window.AFM_MarketFavorites) {
              window.AFM_MarketFavorites.toggleFavorite(pKey, { openEdit: true });
              renderModalContent();
            }
          };
        }
        const closeBtn = modal.querySelector('#close-lupa-modal');
        if (closeBtn) closeBtn.onclick = () => modal.remove();

        const changePosBtn = modal.querySelector('.btnChangePlayerPosLupa');
        if (changePosBtn) {
          changePosBtn.onclick = () => {
            if (typeof window.openPlayerChangePositionModal === 'function') {
              window.openPlayerChangePositionModal(name);
            }
          };
        }

        modal.querySelectorAll('.afm-btn-season-tab').forEach(btn => {
          btn.onclick = () => {
            activeSeasonIdx = parseInt(btn.dataset.sIdx, 10) || 0;
            renderModalContent();
          };
        });
      }

      renderModalContent();
      document.body.appendChild(modal);

      modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
      };

      const escListener = (e) => {
        if (e.key === 'Escape') {
          modal.remove();
          document.removeEventListener('keydown', escListener);
        }
      };
      document.addEventListener('keydown', escListener);
    },

    openPlayerDetailsFromRow(playerData) {
      return this.openPlayerDetails(playerData);
    },

    injectLupaButtonsInMarketDOM() {
      const app = document.getElementById('app');
      if (!app) return;

      // Injeta listener em todos os botões de ação e botões lupa já presentes no mercado
      app.querySelectorAll('button').forEach((btn) => {
        const txt = (btn.textContent || '').trim();
        const isMarketActionBtn = /^(Comprar|Sem caixa|Janela Fechada|Negociar|Contratar|Fazer Proposta|Negociar Empréstimo|Negociar Jogador|Renovar contrato|Propostas \/ Vender|Gerenciar Venda|Gerenciar Empréstimo|Negociar c\/ detentor)$/i.test(txt);
        if (!isMarketActionBtn) return;

        const cell = btn.parentElement;
        if (!cell) return;
        if (cell.querySelector('.btn-lupa-details')) return;

        const row = btn.closest('tr, .market-row');
        if (!row) return;

        const key = btn.dataset.key || row.querySelector('[data-key]')?.dataset?.key || '';
        const lupaBtn = document.createElement('button');
        lupaBtn.type = 'button';
        lupaBtn.className = 'btn btn-lupa-details';
        lupaBtn.innerHTML = '🔍';
        lupaBtn.title = 'Ver ficha técnica e atributos reais do atleta';
        lupaBtn.style.cssText = 'background:#3b1d7a;color:#fff;border:1px solid #a78bfa;border-radius:8px;padding:6px 10px;margin-right:6px;cursor:pointer;font-size:13px;line-height:1;display:inline-flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(124,58,237,0.3);flex-shrink:0;';
        if (key) lupaBtn.dataset.key = key;

        lupaBtn.onclick = (e) => {
          e.stopPropagation();
          e.preventDefault();
          MarketLupaAgingAndRegens.openPlayerDetails(lupaBtn);
        };

        cell.insertBefore(lupaBtn, btn);
      });

      // Também vincula cliques nas lupas nativas da tabela
      app.querySelectorAll('.btn-lupa-details').forEach(lupaBtn => {
        if (lupaBtn.dataset.afmLupaBound) return;
        lupaBtn.dataset.afmLupaBound = 'true';
        lupaBtn.onclick = (e) => {
          e.stopPropagation();
          e.preventDefault();
          MarketLupaAgingAndRegens.openPlayerDetails(lupaBtn);
        };
      });

      app.querySelectorAll('span, div, h3, h4').forEach((el) => {
        if (el.children.length === 0 && (el.textContent || '').includes('MERCADO SIMULADO ATIVO')) {
          el.textContent = el.textContent.replace(/MERCADO SIMULADO ATIVO/g, '🌐 Mercado Global');
        }
      });
    },

    processAgingDeclineAndGeneticRegens(state) {
      if (!state) return [];

      const players = state?.isolatedWorld?.players || state?.players || state?.squad || [];
      const regensLog = [];

      players.forEach((p, idx) => {
        if (!p) return;
        p.age = (Number(p.age) || 23) + 1;
        const isGk = ["GK", "GOL"].includes(p.position || p.pos);
        const oldAge = isGk ? 34 : 31;

        if (p.age >= oldAge) {
          const ovrDrop = p.age >= 35 ? 2 : 1;
          p.overall = Math.max(48, (Number(p.overall || p.ovr) || 70) - ovrDrop);
          p.ovr = p.overall;
          p.marketValue = Math.max(40000, Math.round((Number(p.marketValue) || 1500000) * 0.65));
        }

        // Aposentadoria e Geração de Regens Genéticos nas Categorias de Base com Posição Tática Garantida
        if (p.age >= 36 && (p.age >= 37 || Math.random() < 0.65 || p.forceRetire)) {
          const randomClubs = ['Corinthians', 'Palmeiras', 'Santos', 'São Paulo', 'Flamengo', 'Grêmio', 'Cruzeiro', 'Vasco', 'Internacional', 'Atlético-MG'];
          const destClub = (state?.teams && state.teams.length > 0)
            ? state.teams[Math.floor(Math.random() * state.teams.length)].name
            : randomClubs[Math.floor(Math.random() * randomClubs.length)];

          // Resolução infalível de posição tática (CB, RW, GK, ST, CM, etc.) para nunca exibir "-"
          let resolvedPos = 'CM';
          if (typeof window !== 'undefined' && typeof window.resolveRegenOrYouthPosition === 'function') {
            resolvedPos = window.resolveRegenOrYouthPosition(p);
          } else {
            const raw = String(p.pos || p.position || p.primaryPosition || '').trim().toUpperCase();
            const map = { ZAG: 'CB', LAT: 'RB', LD: 'RB', LE: 'LB', VOL: 'DM', MEI: 'AM', MC: 'CM', ATA: 'ST', CA: 'ST', PON: 'LW', PD: 'RW', PE: 'LW', GOL: 'GK' };
            resolvedPos = map[raw] || raw || 'CM';
          }

          const baseOvr = Number(p.overall || p.ovr || p.fc || p.pes) || 72;
          const regenOvr = Math.max(58, Math.min(74, Math.round(baseOvr * 0.85)));
          const regenPot = Math.max(83, Math.min(95, (Number(p.potential) || 85) + 2));
          const firstName = (p.name || 'Craque').split(' ')[0];
          const regenName = `${firstName} Jr.`;

          // Um regen herda o perfil esportivo, não a identidade nem as fotos do veterano.
          // Não copiar photo, photoUrl, faceUrl ou tmId do jogador aposentado.
          const regen = {
            id: `regen_${Date.now()}_${idx}_${Math.floor(Math.random() * 1000)}`,
            name: regenName,
            regenOf: p.name,
            geneticOrigin: p.name,
            nationality: p.nationality || p.country || 'Brasil',
            country: p.country || p.nationality || 'Brasil',
            age: 16,
            pos: resolvedPos,
            position: resolvedPos,
            primaryPosition: resolvedPos,
            overall: regenOvr,
            ovr: regenOvr,
            fc: regenOvr,
            pes: regenOvr,
            potential: regenPot,
            marketValue: Math.round(regenOvr * 25000),
            value: Math.round(regenOvr * 25000) / 1000000,
            salary: 9500,
            wage: 9500,
            stamina: 100,
            fitness: 100,
            morale: 85,
            clubName: `${destClub} (Categorias de Base)`,
            club: `${destClub} (Categorias de Base)`,
            isGeneticRegen: true
          };

          const isUserClub = (state?.club && (typeof window !== 'undefined' && window.norm ? window.norm(destClub) === window.norm(state.club) : destClub.toLowerCase() === state.club.toLowerCase()))
            || (Array.isArray(state?.squad) && state.squad.includes(p))
            || (Array.isArray(state?.youthAcademy) && (!state.worldRegens || state.youthAcademy.length === 0));

          if (Array.isArray(state?.youthAcademy) && isUserClub) {
            if (typeof window !== 'undefined' && typeof window.addYouthAcademyPlayer === 'function') {
              window.addYouthAcademyPlayer(regen, state);
            } else {
              state.youthAcademy.unshift(regen);
            }
          } else if (Array.isArray(state?.worldRegens)) {
            state.worldRegens.unshift(regen);
            if (state.worldRegens.length > 50) state.worldRegens.pop();
          }

          regensLog.push(`🌟 ${p.name} aposentou-se aos ${p.age} anos! Seu regen genético (${regen.name}, 16 anos, POT ${regen.potential}, pos: ${regen.pos}) surgiu nas Categorias de Base do ${destClub}!`);
        }
      });

      return regensLog;
    }
  };

  document.addEventListener('click', (e) => {
    const lupaBtn = e.target.closest ? e.target.closest('.btn-lupa-details') : null;
    if (lupaBtn) {
      e.stopPropagation();
      e.preventDefault();
      MarketLupaAgingAndRegens.openPlayerDetails(lupaBtn);
      return;
    }
    setTimeout(() => MarketLupaAgingAndRegens.injectLupaButtonsInMarketDOM(), 60);
  });

  window.addEventListener('load', () => {
    MarketLupaAgingAndRegens.injectLupaButtonsInMarketDOM();
  });

  if (typeof MutationObserver !== 'undefined') {
    let obsTimeout = null;
    const observer = new MutationObserver(() => {
      if (obsTimeout) return;
      obsTimeout = setTimeout(() => {
        obsTimeout = null;
        MarketLupaAgingAndRegens.injectLupaButtonsInMarketDOM();
      }, 50);
    });
    const root = document.getElementById('app') || document.body;
    if (root) {
      observer.observe(root, { childList: true, subtree: true });
    }
  }

  window.AFM_MarketLupaAndAging = MarketLupaAgingAndRegens;
})(window);
