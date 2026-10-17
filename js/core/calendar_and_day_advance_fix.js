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
    if (input instanceof Date) return new Date(input.getFullYear(), input.getMonth(), input.getDate(), 12, 0, 0);
    const s = String(input).trim();
    const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]), 12, 0, 0);
    const br = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (br) return new Date(Number(br[3]), Number(br[2]) - 1, Number(br[1]), 12, 0, 0);
    const meses = { janeiro:0, fevereiro:1, marco:2, 'março':2, abril:3, maio:4, junho:5, julho:6, agosto:7, setembro:8, outubro:9, novembro:10, dezembro:11 };
    const pt = s.toLowerCase().match(/(\d{1,2})\s+de\s+([a-zç]+)\s+de\s+(\d{4})/);
    if (pt && meses[pt[2]] !== undefined) return new Date(Number(pt[3]), meses[pt[2]], Number(pt[1]), 12, 0, 0);
    const d = new Date(s);
    return isNaN(d.getTime()) ? new Date(2026, 0, 18, 12, 0, 0) : new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0);
  }

  function toIso(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function toPtBr(d) {
    const nomes = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    return d.getDate() + ' de ' + nomes[d.getMonth()] + ' de ' + d.getFullYear();
  }

  let isAdvancingNow = false;

  const CalendarAndDayFix = {
    rules: OFFICIAL_CALENDAR_2026,
    parseSafeLocalNoon,
    toIso,
    toPtBr,

    buildInterleavedSeasonSchedule(state) {
      const year = state?.seasonYear || 2026;
      const schedule = [];
      let cursor = new Date(year, 0, 11, 12, 0, 0);
      const endYear = new Date(year, 11, 6, 12, 0, 0);
      let estRound = 1, braRound = 1, cdbPhase = 1, libRound = 1, munPhase = 1, stepIndex = 0;

      while (cursor <= endYear) {
        const mmdd = String(cursor.getMonth() + 1).padStart(2, '0') + '-' + String(cursor.getDate()).padStart(2, '0');
        let compType = null, roundLabel = '';

        if (mmdd >= '06-14' && mmdd <= '07-13') {
          if (munPhase <= 4) {
            compType = 'MUNDIAL_CLUBES_EUA';
            roundLabel = 'Mundial de Clubes EUA · Fase Final ' + (munPhase++);
          }
        } else {
          const rotation = stepIndex % 3;
          if (mmdd <= '03-08' && estRound <= 11 && (rotation === 0 || mmdd < '01-28')) {
            compType = 'ESTADUAL';
            roundLabel = 'Campeonato Estadual · Rodada ' + (estRound++) + '/11';
          } else if (mmdd >= '02-18' && rotation === 1 && cdbPhase <= 8) {
            compType = 'COPA_DO_BRASIL';
            roundLabel = cdbPhase === 8 ? 'Copa do Brasil · Final em Jogo Único' : ('Copa do Brasil · ' + cdbPhase + 'ª Fase');
            cdbPhase++;
          } else if (mmdd >= '02-18' && rotation === 2 && ((mmdd >= '04-01' && mmdd <= '05-29') || mmdd === '02-18' || mmdd >= '08-01') && libRound <= 13) {
            compType = 'LIBERTADORES';
            roundLabel = libRound === 1 ? 'Libertadores · Fase Preliminar' : libRound <= 7 ? ('Libertadores · Fase de Grupos R' + (libRound - 1)) : 'Libertadores · Mata-Mata';
            libRound++;
          } else if (mmdd >= '01-28' && braRound <= 38) {
            compType = 'BRASILEIRAO';
            roundLabel = 'Campeonato Brasileiro Série A · Rodada ' + (braRound++) + '/38';
          }
        }

        if (compType) schedule.push({ dateIso: toIso(cursor), datePtBr: toPtBr(cursor), competition: compType, label: roundLabel });
        cursor.setDate(cursor.getDate() + 3);
        stepIndex++;
      }
      if (state) state.interleavedSchedule2026 = schedule;
      return schedule;
    },

    advanceDaysGuaranteed(state, days = 1) {
      if (!state) return null;
      if (isAdvancingNow) {
        if (Date.now() - (this._lastAdvanceTime || 0) > 1200) {
          isAdvancingNow = false;
        } else {
          return null;
        }
      }
      this._lastAdvanceTime = Date.now();
      isAdvancingNow = true;
      try {
        const add = Math.max(1, Math.min(90, Number(days) || 1));
        const activeDateStr = state.date || state.currentDate || '2026-01-01';
        const currentObj = parseSafeLocalNoon(activeDateStr);
        const oldMonth = currentObj.getMonth();

        currentObj.setDate(currentObj.getDate() + add);
        const newIso = toIso(currentObj);
        const newPtBr = toPtBr(currentObj);

        state.date = newIso;
        state.currentDate = newIso;
        state.currentDateFormatted = newPtBr;

        if (state.pendingStadiumShow && state.pendingStadiumShow.blocking) {
          state.pendingStadiumShow.blocking = false;
        }

        if (state.transferWindowActive && state.transferWindowDay) {
          state.transferWindowDay = Math.min(4, Number(state.transferWindowDay) + add);
          if (state.transferWindowDay >= 4) {
            state.transferWindowDay = 4;
          }
        }
        if (state.isPreSeason && state.preSeasonDays > 0) {
          state.preSeasonDays = Math.max(0, state.preSeasonDays - add);
          if (state.preSeasonDays <= 0) {
            state.isPreSeason = false;
          }
        }

        const squad = state.squad || state.players || [];
        if (Array.isArray(squad)) {
          squad.forEach((p) => {
            if (!p) return;
            if (typeof p.stamina === 'number') p.stamina = Math.min(100, p.stamina + add * 7);
            if (typeof p.energy === 'number') p.energy = Math.min(100, p.energy + add * 7);
          });
        }

        if (window.AFM_WorldSimulation && typeof window.AFM_WorldSimulation.simulateWorldStepOnDayAdvance === 'function') {
          window.AFM_WorldSimulation.simulateWorldStepOnDayAdvance(state, newIso);
        }

        if (currentObj.getMonth() !== oldMonth && window.AFM_LifeAndSharesPro && typeof window.AFM_LifeAndSharesPro.processMonthlyLifeAndDividendsTurn === 'function') {
          window.AFM_LifeAndSharesPro.processMonthlyLifeAndDividendsTurn(state);
        }
        if (window.AFM_LifeAndSharesPro && typeof window.AFM_LifeAndSharesPro.processRoundTurn === 'function') {
          window.AFM_LifeAndSharesPro.processRoundTurn(state);
        }

        this.syncDateInDOM(state, newPtBr);
        if (typeof window.save === 'function') window.save();
        if (typeof window.render === 'function') window.render();
        return { newIso, newPtBr };
      } finally {
        setTimeout(() => { isAdvancingNow = false; }, 120);
      }
    },

    advanceToNextMatchGuaranteed(state) {
      if (!state) return null;
      const curr = parseSafeLocalNoon(state.date || state.currentDate || '2026-01-01');
      let nextDate = null;
      const act = (typeof window.getActualCurrentMatch === 'function' ? window.getActualCurrentMatch(state) : null);
      if (act && act.date) {
        nextDate = parseSafeLocalNoon(act.date);
      } else {
        const nm = (typeof window.getActiveNextMatch === 'function' ? window.getActiveNextMatch(state) : null) || state.nextMatch;
        const gate = (typeof window.canStartMatch === 'function' ? window.canStartMatch(null, state) : null);
        if (gate && gate.matchDate) {
          nextDate = parseSafeLocalNoon(gate.matchDate);
        } else if (gate && gate.nextDate) {
          nextDate = parseSafeLocalNoon(gate.nextDate);
        } else if (nm && nm.date) {
          nextDate = parseSafeLocalNoon(nm.date);
        }
      }
      if (!nextDate || nextDate <= curr) return this.advanceDaysGuaranteed(state, 1);
      const diffDays = Math.min(90, Math.max(1, Math.round((nextDate.getTime() - curr.getTime()) / 86400000)));
      return this.advanceDaysGuaranteed(state, diffDays);
    },

    syncDateInDOM(state, newPtBr) {
      const st = state || window.GameState || window.state || {};
      const activeIso = st.date || st.currentDate || '2026-01-01';
      st.date = activeIso;
      st.currentDate = activeIso;

      const safeDateObj = parseSafeLocalNoon(activeIso);
      const finalPtBr = newPtBr || toPtBr(safeDateObj);
      st.currentDateFormatted = finalPtBr;

      // 1. Atualiza diretamente pelo ID específico do topo
      const topDate = document.getElementById('topBarCurrentDate');
      if (topDate) topDate.textContent = '📅 ' + finalPtBr;

      // 2. Atualiza qualquer badge ou span de data na barra superior
      document.querySelectorAll('.top-right span, header.top span').forEach((el) => {
        const t = (el.textContent || '').trim();
        if (t.startsWith('📅') || t.startsWith('🗓️') || t.startsWith('🗓')) {
          el.textContent = '📅 ' + finalPtBr;
        }
      });
    },

    bindGlobalAdvanceAndTableClicks() {
      // REGRA CRÍTICA: Intercepta e garante o funcionamento de TODOS os botões de avanço
      document.addEventListener('click', (e) => {
        const target = e.target;
        if (!target || !target.closest) return;

        const btn = target.closest('button, a');
        if (!btn) return;

        const btnId = btn.id || '';
        const txt = (btn.textContent || '').trim().toUpperCase();
        const st = window.GameState || window.state;

        // 1. Janela de transferências / Pré-temporada: Avançar Dia
        if (btnId === 'btnAdvanceTransferWindowDay' || btnId === 'btnAdvanceTransferWindowDayCard' || btnId === 'btnAdvancePreSeasonDay' || btnId === 'btnAdvancePreSeasonDayCard' || (txt.includes('AVANÇAR DIA') && txt.includes('DE 4')) || (txt.includes('AVANCAR DIA') && txt.includes('DE 4'))) {
          if (btn.dataset.handlingClick) return;
          btn.dataset.handlingClick = '1';
          setTimeout(() => { delete btn.dataset.handlingClick; }, 200);
          if (typeof window.advanceTransferWindow === 'function') {
            window.advanceTransferWindow(24);
          } else if (typeof window.advanceTransferWindowDay === 'function') {
            window.advanceTransferWindowDay();
          } else if (typeof window.advancePreSeasonDay === 'function') {
            window.advancePreSeasonDay();
          }
          return;
        }

        // 2. Janela de transferências: Avançar 6 Horas no Deadline Day
        if (btnId === 'btnAdvanceTransferWindowHours' || btnId === 'btnAdvanceTransferWindowHoursCard' || (txt.includes('AVANÇAR') && txt.includes('6 HORAS')) || (txt.includes('AVANCAR') && txt.includes('6 HORAS'))) {
          if (btn.dataset.handlingClick) return;
          btn.dataset.handlingClick = '1';
          setTimeout(() => { delete btn.dataset.handlingClick; }, 200);
          if (typeof window.advanceTransferWindow === 'function') {
            window.advanceTransferWindow(6);
          } else if (typeof window.advanceTransferWindowHours === 'function') {
            window.advanceTransferWindowHours();
          }
          return;
        }

        // 3. Pular Janela / Pré-Temporada
        if (btnId === 'btnSkipPreSeason' || btnId === 'btnSkipPreSeasonCard' || txt.includes('PULAR JANELA') || txt.includes('PULAR PRÉ-TEMPORADA') || txt.includes('PULAR PRE-TEMPORADA')) {
          if (btn.dataset.handlingClick) return;
          btn.dataset.handlingClick = '1';
          setTimeout(() => { delete btn.dataset.handlingClick; }, 200);
          if (typeof window.skipPreSeason === 'function') {
            window.skipPreSeason();
          }
          return;
        }

        // 4. Avançar 1 Dia do Calendário
        if (btnId === 'btnAdvanceOneDayCentral' || txt.includes('+1 DIA')) {
          if (btn.dataset.handlingClick) return;
          btn.dataset.handlingClick = '1';
          setTimeout(() => { delete btn.dataset.handlingClick; }, 200);
          if (typeof this.advanceDaysGuaranteed === 'function') {
            this.advanceDaysGuaranteed(st, 1);
          } else if (typeof window.advanceCalendarDays === 'function') {
            window.advanceCalendarDays(1, true);
          }
          return;
        }

        // 5. Avançar Calendário Até o Dia do Jogo
        if (btnId === 'btnAdvanceToMatchCentral' || (txt.includes('AVANÇAR CALENDÁRIO') && txt.includes('JOGO')) || (txt.includes('AVANCAR CALENDARIO') && txt.includes('JOGO')) || ((txt.includes('ATÉ O JOGO') || txt.includes('ATE O JOGO')) && btn.dataset.readyToPlay !== '1')) {
          if (btn.dataset.handlingClick) return;
          btn.dataset.handlingClick = '1';
          setTimeout(() => { delete btn.dataset.handlingClick; }, 200);
          if (typeof this.advanceToNextMatchGuaranteed === 'function') {
            this.advanceToNextMatchGuaranteed(st);
          } else if (typeof window.advanceCalendarDays === 'function') {
            window.advanceCalendarDays(7, true);
          }
          return;
        }

        // 6. Link "Tabela completa e rodadas >"
        if (txt.includes('TABELA COMPLETA E RODADAS') && txt.length < 50) {
          if (typeof window.switchTab === 'function') window.switchTab('temporada');
          else if (typeof window.openTab === 'function') window.openTab('temporada');
        }
      }, false);
    }
  };

  window.addEventListener('DOMContentLoaded', () => {
    CalendarAndDayFix.bindGlobalAdvanceAndTableClicks();
    const st = window.GameState || window.state;
    if (st) CalendarAndDayFix.buildInterleavedSeasonSchedule(st);
  });

  // Corrige imediatamente qualquer "📅 undefined" na barra superior
  function fixUndefinedDateOnLoad() {
    CalendarAndDayFix.syncDateInDOM(window.GameState || window.state || {});
  }
  document.addEventListener('click', () => setTimeout(fixUndefinedDateOnLoad, 50));
  window.addEventListener('load', () => setTimeout(fixUndefinedDateOnLoad, 300));
  window.AFM_CalendarFix = CalendarAndDayFix;
})(window);
