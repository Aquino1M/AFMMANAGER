// ============================================================================
// MOTOR DE SINCRONIZAÇÃO: COPA DO BRASIL, PIRÂMIDE CBF E INTERNACIONAIS
// Arquivo: js/competitions_sync_fix.js
// ============================================================================

(function (window) {
  'use strict';

  /**
   * 1. Ordenação Oficial de Tabela (Pontos -> Vitórias -> Saldo de Gols -> Gols Pró)
   */
  function getSortedDivisionStandings(teams = []) {
    if (!Array.isArray(teams)) return [];
    const copy = [...teams];
    const anyPlayed = copy.some(t => (t.j || t.played || t.p || t.pts || 0) > 0);

    return copy.sort((a, b) => {
      if (anyPlayed) {
        const ptsA = a.pts !== undefined ? a.pts : (a.p !== undefined ? a.p : ((a.w || a.v || 0) * 3 + (a.d || a.e || 0)));
        const ptsB = b.pts !== undefined ? b.pts : (b.p !== undefined ? b.p : ((b.w || b.v || 0) * 3 + (b.d || b.e || 0)));
        if (ptsB !== ptsA) return ptsB - ptsA;

        const wA = a.w !== undefined ? a.w : (a.v !== undefined ? a.v : 0);
        const wB = b.w !== undefined ? b.w : (b.v !== undefined ? b.v : 0);
        if (wB !== wA) return wB - wA;

        const sgA = a.sg !== undefined ? a.sg : ((a.gf || a.gp || 0) - (a.ga || a.gc || 0));
        const sgB = b.sg !== undefined ? b.sg : ((b.gf || b.gp || 0) - (b.ga || b.gc || 0));
        if (sgB !== sgA) return sgB - sgA;

        const gfA = a.gf !== undefined ? a.gf : (a.gp !== undefined ? a.gp : 0);
        const gfB = b.gf !== undefined ? b.gf : (b.gp !== undefined ? b.gp : 0);
        if (gfB !== gfA) return gfB - gfA;
      }

      // Se nenhum jogo foi realizado ainda, ordena por força/ranking padrão em vez de ordem alfabética
      if (typeof window.teamStrengthByName === 'function') {
        const strA = window.teamStrengthByName(a.name || a);
        const strB = window.teamStrengthByName(b.name || b);
        if (strB !== strA) return strB - strA;
      }

      const nameA = String(a.name || a || '');
      const nameB = String(b.name || b || '');
      return nameA.localeCompare(nameB);
    });
  }

  /**
   * 2. Copa do Brasil (126 Clubes): Progressão das 5 Fases -> Oitavas à Final
   */
  function syncCopaDoBrasilProgression(state) {
    const copa = state?.copaDoBrasil || state?.competitions?.copaDoBrasil;
    const phaseContainer = copa?.phases || copa?.fases;
    if (!copa || !phaseContainer) return;

    const phaseKeys = [
      ['1ª Fase', '1a_fase'],
      ['2ª Fase', '2a_fase'],
      ['3ª Fase', '3a_fase'],
      ['4ª Fase', '4a_fase'],
      ['5ª Fase', '5a_fase']
    ];

    const getPhaseObj = (aliases) => {
      for (const k of aliases) {
        if (phaseContainer[k]) return phaseContainer[k];
      }
      return null;
    };

    // Avança vencedores entre fases preliminares (1ª -> 2ª -> 3ª -> 4ª -> 5ª)
    for (let i = 0; i < phaseKeys.length - 1; i++) {
      const currObj = getPhaseObj(phaseKeys[i]);
      const nextObj = getPhaseObj(phaseKeys[i + 1]);
      if (!currObj || !nextObj) continue;

      const currMatches = currObj.fixtures || currObj;
      const nextMatches = nextObj.fixtures || nextObj;

      const allPlayed = Array.isArray(currMatches) && currMatches.length > 0 && currMatches.every(m => m && (m.score || m.winner || m.played));
      if (allPlayed && Array.isArray(nextMatches)) {
        const winners = currMatches.map(m => m.winner || (m.score && m.score[0] > m.score[1] ? m.home : m.away)).filter(Boolean);
        if (!nextMatches.length && winners.length >= 2) {
          // Se fixtures ainda não foram gerados, gera os pares
          for (let w = 0; w < winners.length; w += 2) {
            nextMatches.push({
              home: winners[w] || 'A definir',
              away: winners[w + 1] || 'A definir',
              played: false,
              score: null,
              winner: null
            });
          }
        } else {
          let wIdx = 0;
          nextMatches.forEach(match => {
            if (!match) return;
            if ((!match.home || String(match.home).startsWith('Vencedor') || String(match.home).startsWith('Time H') || String(match.home).startsWith('A definir')) && winners[wIdx]) {
              match.home = winners[wIdx++];
            }
            if ((!match.away || String(match.away).startsWith('Vencedor') || String(match.away).startsWith('Time A') || String(match.away).startsWith('A definir')) && winners[wIdx]) {
              match.away = winners[wIdx++];
            }
          });
        }
      }
    }

    // Injeta os 16 classificados da 5ª Fase nas Oitavas de Final (Chave A e Chave B)
    const fifthObj = getPhaseObj(phaseKeys[4]);
    const fifthMatches = fifthObj?.fixtures || fifthObj || [];
    const fifthComplete = Array.isArray(fifthMatches) && fifthMatches.length >= 8 && fifthMatches.every(m => m && (m.score || m.winner || m.played));

    if (fifthComplete && copa.bracket?.oitavas) {
      const qualified16 = fifthMatches.map(m => m.winner || (m.score && m.score[0] > m.score[1] ? m.home : m.away)).filter(Boolean);
      if (!copa.bracket.oitavas.length && qualified16.length >= 2) {
        for (let q = 0; q < qualified16.length; q += 2) {
          copa.bracket.oitavas.push({
            home: qualified16[q] || 'A definir',
            away: qualified16[q + 1] || 'A definir',
            played: false,
            winner: null
          });
        }
      } else {
        copa.bracket.oitavas.forEach((tie, idx) => {
          if (!tie.home || String(tie.home).startsWith('Classificado') || String(tie.home).startsWith('A definir')) {
            if (qualified16[idx * 2]) tie.home = qualified16[idx * 2];
            if (qualified16[idx * 2 + 1]) tie.away = qualified16[idx * 2 + 1];
          }
        });
      }
    }

    // Avança Oitavas -> Quartas -> Semifinal -> Final
    advanceKnockoutBracket(copa.bracket, state, 'Copa do Brasil');
  }

  /**
   * 3. Inicialização Limpa das Competições Internacionais (Sem resultados falsos em 01/01)
   */
  function sanitizeContinentalInitialState(state) {
    const currentDate = state?.date || state?.currentDate || '2026-01-01';
    const lib = state?.tournaments?.lib || state?.competitions?.libertadores;
    const sula = state?.tournaments?.sud || state?.competitions?.sulamericana;
    const mundial = state?.tournaments?.cwc || state?.competitions?.mundial;

    // Se ainda estamos antes do início das fases preliminares (Jan 2026), limpa resultados fantasma
    if (currentDate < '2026-02-01') {
      const preList = lib?.pre1 || lib?.prePhase1;
      if (Array.isArray(preList)) {
        preList.forEach(m => {
          m.played = false;
          m.leg1Score = null;
          m.leg2Score = null;
          m.aggScore = null;
          m.score = null;
          m.winner = null;
        });
      }
      if (lib?.bracket?.oitavas && Array.isArray(lib.bracket.oitavas)) {
        lib.bracket.oitavas.forEach((tie, i) => {
          tie.home = `1º Grupo ${String.fromCharCode(65 + i)}`;
          tie.away = `2º Grupo ${String.fromCharCode(65 + ((i + 1) % 8))}`;
          tie.played = false;
          tie.winner = null;
        });
      }
      if (sula?.bracket?.oitavas && Array.isArray(sula.bracket.oitavas)) {
        sula.bracket.oitavas.forEach((tie, i) => {
          tie.home = `1º Grupo ${String.fromCharCode(65 + i)}`;
          tie.away = `Playoff ${i + 1}`;
          tie.played = false;
          tie.winner = null;
        });
      }
      if (mundial?.bracket?.oitavas && Array.isArray(mundial.bracket.oitavas)) {
        mundial.bracket.oitavas.forEach((tie, i) => {
          tie.home = `1º Grupo ${String.fromCharCode(65 + i)}`;
          tie.away = `2º Grupo ${String.fromCharCode(65 + ((i + 1) % 8))}`;
          tie.played = false;
          tie.winner = null;
        });
      }
    }
  }

  /**
   * 4. Handoff Libertadores -> Sul-Americana e Preenchimento dos Mata-Matas Pós-Grupos
   */
  function syncContinentalBrackets(state) {
    const lib = state?.tournaments?.lib || state?.competitions?.libertadores;
    const sula = state?.tournaments?.sud || state?.competitions?.sulamericana;
    const mundial = state?.tournaments?.cwc || state?.competitions?.mundial;

    // Libertadores: Fim dos Grupos A-H -> Oitavas Lib + Playoffs (16-avos) Sul-Americana
    const libStandingsList = lib?.standings ? Object.values(lib.standings) : (lib?.groups ? Object.values(lib.groups) : []);

    const libGroupsFinished = libStandingsList.length >= 2 && libStandingsList.every(rows => Array.isArray(rows) && (rows.every(r => (r.played || r.j || 0) >= 6) || rows.some(r => (r.p || r.points || 0) > 0)));

    if (libGroupsFinished) {
      const firsts = [];
      const seconds = [];
      const thirds = [];

      libStandingsList.forEach(rows => {
        const sorted = getSortedDivisionStandings(rows);
        if (sorted[0]) firsts.push(sorted[0].name || sorted[0]);
        if (sorted[1]) seconds.push(sorted[1].name || sorted[1]);
        if (sorted[2]) thirds.push(sorted[2].name || sorted[2]);
      });

      if (lib.bracket?.oitavas && Array.isArray(lib.bracket.oitavas)) {
        lib.bracket.oitavas.forEach((tie, idx) => {
          if (!tie.home || tie.home.startsWith('1º Grupo') || tie.home.startsWith('Classificado')) {
            tie.home = firsts[idx] || tie.home;
            tie.away = seconds[(idx + 1) % seconds.length] || tie.away;
          }
        });
      }

      // Transfere os 3º colocados da Libertadores para os Playoffs da Sul-Americana
      const sulaStandingsList = sula?.standings ? Object.values(sula.standings) : (sula?.groups ? Object.values(sula.groups) : []);
      const sulaSeconds = sulaStandingsList.map(rows => getSortedDivisionStandings(rows)[1]?.name || getSortedDivisionStandings(rows)[1]).filter(Boolean);

      if (sula && sula.playoffs && Array.isArray(sula.playoffs)) {
        if (!sula.playoffs.length && thirds.length > 0) {
          thirds.forEach((thirdTeam, idx) => {
            sula.playoffs.push({
              home: sulaSeconds[idx] || `2º Grupo ${String.fromCharCode(65 + idx)}`,
              away: thirdTeam,
              played: false,
              winner: null
            });
          });
        } else {
          sula.playoffs.forEach((tie, idx) => {
            if (!tie.home || tie.home.startsWith('2º') || tie.home.startsWith('Venc')) tie.home = sulaSeconds[idx] || tie.home;
            if (!tie.away || tie.away.startsWith('3º') || tie.away.startsWith('Lib')) tie.away = thirds[idx] || tie.away;
          });
        }
      }
    }

    // Sul-Americana: 1º de cada grupo + 8 vencedores dos Playoffs -> Oitavas
    const sulaStandingsList = sula?.standings ? Object.values(sula.standings) : [];
    const sulaGroupsFinished = sulaStandingsList.length === 8 && sulaStandingsList.every(rows => Array.isArray(rows) && rows.every(r => (r.played || 0) >= 6));

    if (sulaGroupsFinished && sula?.bracket?.oitavas && Array.isArray(sula.bracket.oitavas)) {
      const sulaFirsts = sulaStandingsList.map(rows => getSortedDivisionStandings(rows)[0]?.name).filter(Boolean);
      sula.bracket.oitavas.forEach((tie, idx) => {
        if (!tie.home || tie.home.startsWith('1º Grupo')) tie.home = sulaFirsts[idx] || tie.home;
        if (sula.playoffs?.[idx]?.winner) tie.away = sula.playoffs[idx].winner;
      });
    }

    // Mundial FIFA: Fim dos Grupos A-H -> Oitavas (1º A vs 2º B, 1º C vs 2º D, etc.)
    const mundialStandingsList = mundial?.standings ? Object.values(mundial.standings) : [];
    const mundialFinished = mundialStandingsList.length === 8 && mundialStandingsList.every(rows => Array.isArray(rows) && rows.every(r => (r.played || 0) >= 3));

    if (mundialFinished && mundial?.bracket?.oitavas && Array.isArray(mundial.bracket.oitavas)) {
      const gSorted = mundialStandingsList.map(rows => getSortedDivisionStandings(rows));
      const pairings = [
        [gSorted[0]?.[0], gSorted[1]?.[1]], // 1º A vs 2º B
        [gSorted[2]?.[0], gSorted[3]?.[1]], // 1º C vs 2º D
        [gSorted[4]?.[0], gSorted[5]?.[1]], // 1º E vs 2º F
        [gSorted[6]?.[0], gSorted[7]?.[1]], // 1º G vs 2º H
        [gSorted[1]?.[0], gSorted[0]?.[1]], // 1º B vs 2º A
        [gSorted[3]?.[0], gSorted[2]?.[1]], // 1º D vs 2º C
        [gSorted[5]?.[0], gSorted[4]?.[1]], // 1º F vs 2º E
        [gSorted[7]?.[0], gSorted[6]?.[1]]  // 1º H vs 2º G
      ];
      mundial.bracket.oitavas.forEach((tie, idx) => {
        if ((!tie.home || tie.home.startsWith('1º Grupo')) && pairings[idx]?.[0]) {
          tie.home = pairings[idx][0].name || pairings[idx][0];
          tie.away = pairings[idx][1]?.name || pairings[idx][1] || tie.away;
        }
      });
    }

    advanceKnockoutBracket(lib?.bracket, state, 'Copa Libertadores');
    advanceKnockoutBracket(sula?.bracket, state, 'Copa Sul-Americana');
    advanceKnockoutBracket(mundial?.bracket, state, 'Mundial de Clubes FIFA');
  }

  function advanceKnockoutBracket(bracket, state, compTitle) {
    if (!bracket) return;
    const stages = [
      ['oitavas', 'quartas'],
      ['quartas', 'semifinal'],
      ['semifinal', 'final']
    ];

    stages.forEach(([curr, next]) => {
      const currTies = bracket[curr] || [];
      const nextTies = bracket[next] || [];
      for (let i = 0; i < nextTies.length; i++) {
        const t1 = currTies[i * 2];
        const t2 = currTies[i * 2 + 1];
        if (t1 && (t1.played || t1.winner) && t1.winner) nextTies[i].home = t1.winner;
        if (t2 && (t2.played || t2.winner) && t2.winner) nextTies[i].away = t2.winner;
      }
    });

    // Registra o campeão em "Campeões do Mundo do Save"
    const finalTie = bracket.final?.[0] || bracket.final;
    if (finalTie && (finalTie.played || finalTie.winner) && finalTie.winner && state) {
      state.worldSaveChampions = state.worldSaveChampions || [];
      const seasonYear = state.seasonYear || state.season || 2026;
      const alreadySaved = state.worldSaveChampions.some(
        c => c.year === seasonYear && c.competition === compTitle
      );
      if (!alreadySaved) {
        state.worldSaveChampions.push({
          year: seasonYear,
          competition: compTitle,
          champion: finalTie.winner,
          runnerUp: finalTie.winner === finalTie.home ? finalTie.away : finalTie.home
        });
      }
    }
  }

  const AFMCompetitionsSync = {
    getSortedDivisionStandings,
    syncCopaDoBrasilProgression,
    sanitizeContinentalInitialState,
    syncContinentalBrackets,
    advanceKnockoutBracket
  };

  window.AFM_CompetitionsSync = AFMCompetitionsSync;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AFMCompetitionsSync;
  }
})(typeof window !== 'undefined' ? window : global);
