// ==============================================================================
// AFM MANAGER 2027 — CORREÇÃO CRÍTICA DE PASSAR O DIA & JOGOS INTERCALADOS (3 DIAS)
// Arquivo: js/core/calendar_and_day_advance_fix.js
// BLOCO 01 — 100% ISOLADO NO SAVE DO USUÁRIO
// ==============================================================================

(function (window) {
  'use strict';

  const OFFICIAL_CALENDAR_2026 = {
    ESTADUAL: { start: '01-11', end: '03-08', datesCount: 11, intervalDays: 3 },
    BRASILEIRAO: { start: '01-28', end: '12-02', pauseStart: '06-14', pauseEnd: '07-13', rounds: 38, intervalDays: 3 },
    COPA_DO_BRASIL: { start: '02-18', end: '12-06', singleLegFinal: true, intervalDays: 3 },
    LIBERTADORES: { prelim: '02-18', groupsStart: '04-01', groupsEnd: '05-29', finalDate: '11-28', intervalDays: 3 },
    MUNDIAL_CLUBES_EUA: { start: '06-14', end: '07-13', host: 'EUA', brazilDirectFinalPhases: true }
  };

  function parseSafeLocalNoon(input) {
    if (!input) return new Date(2026, 0, 18, 12, 0, 0);
    if (input instanceof Date) {
      return new Date(input.getFullYear(), input.getMonth(), input.getDate(), 12, 0, 0);
    }
    const s = String(input).trim();
    const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]), 12, 0, 0);

    const br = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (br) return new Date(Number(br[3]), Number(br[2]) - 1, Number(br[1]), 12, 0, 0);

    const meses = {
      janeiro: 0, fevereiro: 1, marco: 2, 'março': 2, abril: 3, maio: 4, junho: 5,
      julho: 6, agosto: 7, setembro: 8, outubro: 9, novembro: 10, dezembro: 11
    };
    const pt = s.toLowerCase().match(/(\d{1,2})\s+de\s+([a-zç]+)\s+de\s+(\d{4})/);
    if (pt && meses[pt[2]] !== undefined) {
      return new Date(Number(pt[3]), meses[pt[2]], Number(pt[1]), 12, 0, 0);
    }
    const d = new Date(s);
    return isNaN(d.getTime()) ? new Date(2026, 0, 18, 12, 0, 0) : new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0);
  }

  function toIso(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function toPtBr(d) {
    const nomes = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    return `${d.getDate()} de ${nomes[d.getMonth()]} de ${d.getFullYear()}`;
  }

  const CalendarAndDayFix = {
    rules: OFFICIAL_CALENDAR_2026,
    parseSafeLocalNoon,
    toIso,
    toPtBr,

    // Gera calendário oficial intercalado a cada 3 dias alternando Estadual, Brasileirão, Copa do Brasil, Libertadores e Mundial
    buildInterleavedSeasonSchedule(stateOrYear) {
      const year = (typeof stateOrYear === 'number')
        ? stateOrYear
        : (stateOrYear?.seasonYear || stateOrYear?.season || 2026);
      const stateObj = (typeof stateOrYear === 'object' && stateOrYear !== null) ? stateOrYear : null;
      const schedule = [];
      let cursor = new Date(year, 0, 11, 12, 0, 0); // 11 de janeiro (Estaduais)
      const endYear = new Date(year, 11, 6, 12, 0, 0); // 6 de dezembro

      let estRound = 1, braRound = 1, cdbPhase = 1, libRound = 1, munPhase = 1;
      let stepIndex = 0;

      while (cursor <= endYear) {
        const mmdd = `${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
        let compType = null;
        let roundLabel = '';

        // 14/06 a 13/07: Pausa do Brasileirão para o Mundial de Clubes nos EUA
        if (mmdd >= '06-14' && mmdd <= '07-13') {
          if (munPhase <= 4) {
            compType = 'MUNDIAL_CLUBES_EUA';
            roundLabel = `Mundial de Clubes EUA · Fase Final ${munPhase}`;
            munPhase++;
          }
        } else {
          // Intercala Estadual (11 datas: 11/jan a 08/mar), Brasileirão (28/jan a 02/dez), Copa do Brasil (18/fev a 06/dez), Libertadores (18/fev a 28/nov)
          const rotation = stepIndex % 3;
          if (mmdd <= '03-08' && estRound <= 11 && (rotation === 0 || mmdd < '01-28')) {
            compType = 'ESTADUAL';
            roundLabel = `Campeonato Estadual · Rodada ${estRound++}/11`;
          } else if (mmdd >= '02-18' && rotation === 1 && cdbPhase <= 8) {
            compType = 'COPA_DO_BRASIL';
            roundLabel = cdbPhase === 8 ? 'Copa do Brasil · Final em Jogo Único' : `Copa do Brasil · ${cdbPhase}ª Fase`;
            cdbPhase++;
          } else if (mmdd >= '02-18' && rotation === 2 && ((mmdd >= '04-01' && mmdd <= '05-29') || mmdd === '02-18' || mmdd >= '08-01') && libRound <= 13) {
            compType = 'LIBERTADORES';
            roundLabel = libRound === 1 ? 'Libertadores · Fase Preliminar' : libRound <= 7 ? `Libertadores · Fase de Grupos R${libRound - 1}` : 'Libertadores · Mata-Mata';
            libRound++;
          } else if (mmdd >= '01-28' && braRound <= 38) {
            // Se Estadual ou Copa terminou, segue com o Campeonato Nacional!
            compType = 'BRASILEIRAO';
            roundLabel = `Campeonato Brasileiro Série A · Rodada ${braRound++}/38`;
          }
        }

        if (compType) {
          schedule.push({
            dateIso: toIso(cursor),
            datePtBr: toPtBr(cursor),
            competition: compType,
            label: roundLabel
          });
        }

        // Jogos intercalados a cada 3 dias!
        cursor.setDate(cursor.getDate() + 3);
        stepIndex++;
      }

      schedule.stateTournament = {
        startDate: `${year}-${OFFICIAL_CALENDAR_2026.ESTADUAL.start}`,
        endDate: `${year}-${OFFICIAL_CALENDAR_2026.ESTADUAL.end}`,
        datesCount: OFFICIAL_CALENDAR_2026.ESTADUAL.datesCount
      };
      schedule.serieA = {
        startDate: `${year}-${OFFICIAL_CALENDAR_2026.BRASILEIRAO.start}`,
        endDate: `${year}-${OFFICIAL_CALENDAR_2026.BRASILEIRAO.end}`,
        worldCupBreakStart: `${year}-${OFFICIAL_CALENDAR_2026.BRASILEIRAO.pauseStart}`,
        worldCupBreakEnd: `${year}-${OFFICIAL_CALENDAR_2026.BRASILEIRAO.pauseEnd}`,
        rounds: OFFICIAL_CALENDAR_2026.BRASILEIRAO.rounds
      };
      schedule.copaDoBrasil = {
        startDate: `${year}-${OFFICIAL_CALENDAR_2026.COPA_DO_BRASIL.start}`,
        endDate: `${year}-${OFFICIAL_CALENDAR_2026.COPA_DO_BRASIL.end}`,
        singleFinalDate: `${year}-${OFFICIAL_CALENDAR_2026.COPA_DO_BRASIL.end}`
      };
      schedule.libertadores = {
        prelimDate: `${year}-${OFFICIAL_CALENDAR_2026.LIBERTADORES.prelim}`,
        finalDate: `${year}-${OFFICIAL_CALENDAR_2026.LIBERTADORES.finalDate}`
      };
      schedule.mundialClubes = {
        startDate: `${year}-${OFFICIAL_CALENDAR_2026.MUNDIAL_CLUBES_EUA.start}`,
        endDate: `${year}-${OFFICIAL_CALENDAR_2026.MUNDIAL_CLUBES_EUA.end}`,
        host: OFFICIAL_CALENDAR_2026.MUNDIAL_CLUBES_EUA.host
      };

      if (stateObj) stateObj.interleavedSchedule2026 = schedule;
      return schedule;
    },

    // Avança o dia no Save do Usuário sem nunca travar em 18 de janeiro de 2026!
    advanceDaysGuaranteed(state, days = 1) {
      if (!state) return null;
      const add = Math.max(1, Number(days) || 1);
      const currentObj = parseSafeLocalNoon(state.currentDate || state.date || '2026-01-18');
      const oldMonth = currentObj.getMonth();

      currentObj.setDate(currentObj.getDate() + add);
      const newIso = toIso(currentObj);
      const newPtBr = toPtBr(currentObj);

      state.currentDate = newIso;
      state.date = newIso;
      state.currentDateFormatted = newPtBr;

      // Remove qualquer trava de evento de show que impedia o jogo de avançar
      if (state.pendingStadiumShow && state.pendingStadiumShow.blocking) {
        state.pendingStadiumShow.blocking = false;
      }

      // Recupera físico dos atletas no elenco do usuário
      const squad = state.squad || state.players || [];
      squad.forEach((p) => {
        if (!p) return;
        if (typeof p.stamina === 'number') p.stamina = Math.min(100, p.stamina + add * 7);
        if (typeof p.energy === 'number') p.energy = Math.min(100, p.energy + add * 7);
      });

      // Simula o Mundo Vivo do Save (Outros times jogam, compram/vendem jogadores e técnicos pontuam no ranking)
      if (window.AFM_WorldSimulation && typeof window.AFM_WorldSimulation.simulateWorldStepOnDayAdvance === 'function') {
        window.AFM_WorldSimulation.simulateWorldStepOnDayAdvance(state, newIso);
      }

      // Se virou o mês, processa folha salarial e dividendos
      if (currentObj.getMonth() !== oldMonth && window.AFM_LifeAndSharesPro && typeof window.AFM_LifeAndSharesPro.processMonthlyLifeAndDividendsTurn === 'function') {
        window.AFM_LifeAndSharesPro.processMonthlyLifeAndDividendsTurn(state);
      }

      // Atualiza o texto da data no topo da tela e nos cards da Central
      this.syncDateInDOM(state, newPtBr);
      return { newIso, newPtBr };
    },

    advanceToNextMatchGuaranteed(state) {
      if (!state) return null;
      const curr = parseSafeLocalNoon(state.currentDate || state.date || '2026-01-18');
      let nextDate = null;

      if (state.nextMatch && state.nextMatch.date) {
        nextDate = parseSafeLocalNoon(state.nextMatch.date);
      } else if (state.schedule && Array.isArray(state.schedule)) {
        const nextFix = state.schedule.find((f) => f && f.date && parseSafeLocalNoon(f.date) > curr);
        if (nextFix) nextDate = parseSafeLocalNoon(nextFix.date);
      } else if (typeof document !== 'undefined') {
        const bodyTxt = document.body.innerText || '';
        const m = bodyTxt.match(/Data do Jogo:\s*(\d{1,2}\s+de\s+[a-zç]+\s+de\s+\d{4})/i);
        if (m) nextDate = parseSafeLocalNoon(m[1]);
      }

      if (!nextDate || nextDate <= curr) {
        return this.advanceDaysGuaranteed(state, 1);
      }
      const diffDays = Math.max(1, Math.round((nextDate.getTime() - curr.getTime()) / 86400000));
      return this.advanceDaysGuaranteed(state, diffDays);
    },

    syncDateInDOM(state, newPtBr) {
      if (typeof document === 'undefined') return;

      // Atualiza o calendário no topo da barra superior
      document.querySelectorAll('span, div').forEach((el) => {
        if (el.children.length === 0) {
          const t = (el.textContent || '').trim();
          if (/^📅\s*\d{1,2}\s+de\s+[a-zç]+\s+de\s+\d{4}$/i.test(t)) {
            el.textContent = `📅 ${newPtBr}`;
          } else if (/Data do Jogo:\s*(.+?)\s*\(Hoje:/i.test(t)) {
            el.textContent = t.replace(/\(Hoje:\s*[^)]+\)/i, `(Hoje: ${newPtBr})`);
          }
        }
      });

      // Se chegou no dia do jogo, transforma o botão "⏩ ATÉ O JOGO" em "▶ JOGAR AO VIVO"
      document.querySelectorAll('button').forEach((btn) => {
        const bTxt = (btn.textContent || '').trim();
        if (bTxt.includes('ATÉ O JOGO')) {
          btn.innerHTML = '▶ JOGAR AO VIVO';
          btn.style.background = 'linear-gradient(135deg, #7c3aed, #6d28d9)';
          btn.dataset.readyToPlay = '1';
        }
      });

      if (typeof window.save === 'function') {
        try { window.save(); } catch (e) {}
      }
      if (typeof window.render === 'function') {
        try { window.render(); } catch (e) {}
      }
      if (typeof window.updateUI === 'function') {
        try { window.updateUI(); } catch (e) {}
      }
    },

    bindGlobalAdvanceAndTableClicks() {
      if (typeof document === 'undefined') return;
      document.addEventListener('click', (e) => {
        const btn = e.target.closest('button, a, div, span');
        if (!btn) return;
        const txt = (btn.textContent || '').trim();
        const st = window.GameState || window.state;

        // 1. Clique em "+1 DIA"
        if ((txt.includes('+1 DIA') || btn.id === 'btnAdvanceOneDayCentral') && !btn.dataset.handlingClick) {
          btn.dataset.handlingClick = '1';
          setTimeout(() => { delete btn.dataset.handlingClick; }, 150);
          const res = this.advanceDaysGuaranteed(st, 1);
          if (res && typeof window.toast === 'function') window.toast(`📅 Calendário avançado para ${res.newPtBr}.`);
          else if (res && typeof window.showToast === 'function') window.showToast(`📅 Calendário avançado para ${res.newPtBr}.`);
          return;
        }

        // 2. Clique em "ATÉ O JOGO"
        if ((txt.includes('ATÉ O JOGO') || btn.id === 'btnAdvanceToMatchCentral') && btn.dataset.readyToPlay !== '1' && !btn.dataset.handlingClick) {
          btn.dataset.handlingClick = '1';
          setTimeout(() => { delete btn.dataset.handlingClick; }, 150);
          const res = this.advanceToNextMatchGuaranteed(st);
          if (res && typeof window.toast === 'function') window.toast(`⚽ Dia de Jogo! Calendário avançado para ${res.newPtBr}.`);
          else if (res && typeof window.showToast === 'function') window.showToast(`⚽ Dia de Jogo! Calendário avançado para ${res.newPtBr}.`);
          return;
        }

        // 3. Clique em "Tabela completa e rodadas >" na Central
        if (txt.includes('Tabela completa e rodadas') || txt.includes('NA TABELA') || btn.id === 'btnGoToSeasonFromCentral') {
          e.preventDefault();
          const navTemporada = Array.from(document.querySelectorAll('button, a, div')).find(
            (el) => (el.textContent || '').trim() === '🏆 Temporada' || (el.textContent || '').trim() === 'Temporada'
          );
          if (navTemporada) navTemporada.click();
          if (typeof window.switchTab === 'function') window.switchTab('temporada');
          if (typeof window.openTab === 'function') window.openTab('temporada');
          if (typeof window.render === 'function') {
            if (st) st.view = 'temporada';
            try { window.render(); } catch (err) {}
          }
        }
      }, true);
    }
  };

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        CalendarAndDayFix.bindGlobalAdvanceAndTableClicks();
        const st = window.GameState || window.state;
        if (st) CalendarAndDayFix.buildInterleavedSeasonSchedule(st);
      });
    } else {
      CalendarAndDayFix.bindGlobalAdvanceAndTableClicks();
      const st = window.GameState || window.state;
      if (st) CalendarAndDayFix.buildInterleavedSeasonSchedule(st);
    }
  }

  window.AFM_CalendarFix = CalendarAndDayFix;
})(typeof window !== 'undefined' ? window : global);
