/**
 * Aquino Futebol Manager 2026 — Sistema de XP, Evolução em Campo, Resumo Mensal & "Ir Além" (Breakthrough)
 * Baseado nas diretrizes oficiais de carreira e progressão:
 * 1. Minutos jogados + notas da partida + ações decisivas (gols, assistências, clean sheets) = XP de Partida.
 * 2. Titulares com bom desempenho evoluem mais rápido; reservas progridem pelo treino no CT.
 * 3. Resumo mensal transparente detalha de onde vieram os pontos (Partidas vs Treino).
 * 4. Mecânica "Ir Além" (Breakthrough): Jovens talentos que chegam cedo ao limite com alto rendimento
 *    superam as expectativas do treinador e aumentam o teto de potencial (+1 a +2 POT).
 */

(function (window) {
  'use strict';

  function norm(str) {
    if (!str) return '';
    return String(str)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  function getMonthKey(dateStr) {
    if (!dateStr) return '2026-01';
    const s = String(dateStr).trim();
    // Suporta 'YYYY-MM-DD', 'DD/MM/YYYY' ou 'YYYY-MM'
    if (s.includes('/')) {
      const parts = s.split('/');
      if (parts.length >= 3) return `${parts[2]}-${String(parts[1]).padStart(2, '0')}`;
    }
    const match = s.match(/^(\d{4})-(\d{2})/);
    return match ? `${match[1]}-${match[2]}` : '2026-01';
  }

  // Curva balanceada de XP necessário para subir 1 ponto de Overall (OVR)
  function getXPRequiredForNextLevel(ovr) {
    const val = Number(ovr) || 65;
    if (val <= 60) return 300;
    if (val <= 67) return 420;
    if (val <= 74) return 580;
    if (val <= 80) return 800;
    if (val <= 85) return 1150;
    if (val <= 89) return 1600;
    return 2200; // Superestrelas 90+ exigem consistência excepcional
  }

  // Inicialização segura e aditiva dos dados de XP no atleta
  function initPlayerXP(p, state) {
    if (!p) return;
    const curOvr = typeof window.playerOverall === 'function' ? window.playerOverall(p) : (Number(p.overall || p.ovr) || 65);
    
    if (typeof p.xp !== 'number' || isNaN(p.xp)) p.xp = 0;
    if (!p.xpNext || typeof p.xpNext !== 'number' || isNaN(p.xpNext)) {
      p.xpNext = getXPRequiredForNextLevel(curOvr);
    }
    if (typeof p.breakthroughsCount !== 'number') p.breakthroughsCount = 0;

    const curMonth = getMonthKey(state?.date);
    if (!p.monthlyEvolution || p.monthlyEvolution.month !== curMonth) {
      // Arquiva histórico mensal anterior se existir
      if (p.monthlyEvolution && p.monthlyEvolution.month) {
        p.pastMonthlyEvolutions = Array.isArray(p.pastMonthlyEvolutions) ? p.pastMonthlyEvolutions : [];
        p.pastMonthlyEvolutions.unshift({ ...p.monthlyEvolution });
        if (p.pastMonthlyEvolutions.length > 12) p.pastMonthlyEvolutions.pop();
      }
      p.monthlyEvolution = {
        month: curMonth,
        matchXP: 0,
        trainingXP: 0,
        matchesPlayed: 0,
        sumRatings: 0,
        avgRating: 0,
        ovrGains: 0,
        breakthroughs: 0
      };
    }
  }

  // Cálculo individual da Nota e do XP conquistado por um atleta na partida
  function calcPlayerMatchXP(p, matchContext) {
    const {
      minutes = 90,
      teamResult = { gf: 0, ga: 0, won: false, draw: false },
      goals = 0,
      assists = 0,
      isGK = false,
      isDef = false
    } = matchContext;

    if (minutes <= 0) {
      return {
        minutes: 0,
        rating: 6.0,
        matchXP: 0,
        breakdown: { baseMinutes: 0, ratingBonus: 0, goalsBonus: 0, assistsBonus: 0, cleanSheetBonus: 0, resultBonus: 0, ageMult: 1.0 }
      };
    }

    // 1. Cálculo da Nota de Atuação (Escala de 5.0 a 10.0)
    let rating = 6.0;

    // Influência do resultado coletivo
    if (teamResult.won) rating += 0.45;
    else if (teamResult.draw) rating += 0.05;
    else rating -= 0.35;

    // Saldo de gols
    const netG = (teamResult.gf || 0) - (teamResult.ga || 0);
    rating += Math.max(-0.6, Math.min(0.6, netG * 0.12));

    // Ações individuais
    rating += (goals * 1.25);
    rating += (assists * 0.85);

    // Defesa sem sofrer gols (Clean sheet para goleiro e zagueiros)
    const hadCleanSheet = (isGK || isDef) && (teamResult.ga === 0) && (minutes >= 60);
    if (hadCleanSheet) {
      rating += 0.85;
    } else if ((isGK || isDef) && (teamResult.ga > 2)) {
      rating -= Math.min(0.8, (teamResult.ga - 2) * 0.25);
    }

    // Variação orgânica controlada (+/- 0.25)
    const hash = Math.abs(Math.sin((p.name || 'player').length * 13 + minutes * 7)) * 0.5 - 0.25;
    rating += hash;

    // Trava de segurança entre 5.0 e 10.0
    rating = Math.max(5.0, Math.min(10.0, Math.round(rating * 10) / 10));

    // 2. Cálculo dos Pontos de XP
    // A. Base por minutos jogados (proporcional até 25 XP)
    const baseMinutesXP = Math.round(25 * (Math.min(90, minutes) / 90));

    // B. Bônus por Nota de Desempenho (quem jogou bem cresce muito mais rápido)
    let ratingBonus = 5;
    if (rating >= 9.0) ratingBonus = 150;      // Atuação de gala / Craque da partida
    else if (rating >= 8.5) ratingBonus = 120; // Excelente
    else if (rating >= 8.0) ratingBonus = 90;  // Ótima
    else if (rating >= 7.5) ratingBonus = 65;  // Muito boa
    else if (rating >= 7.0) ratingBonus = 45;  // Boa
    else if (rating >= 6.5) ratingBonus = 30;  // Regular positiva
    else if (rating >= 6.0) ratingBonus = 15;  // Mediana
    else ratingBonus = 5;                      // Fraca (não ganha sem jogar bem)

    // C. Bônus por Lances Decisivos que deram certo
    const goalsBonus = goals * 40;
    const assistsBonus = assists * 25;
    const cleanSheetBonus = hadCleanSheet ? 35 : 0;

    // D. Bônus por Vitória da Equipe
    const resultBonus = teamResult.won ? 15 : (teamResult.draw ? 5 : 0);

    // E. Multiplicador de Estágio da Carreira / Idade
    const age = Number(p.age) || 24;
    let ageMult = 1.0;
    if (age <= 20) ageMult = 1.40;      // Prodígio em fase de crescimento acelerado
    else if (age <= 23) ageMult = 1.25; // Jovem em maturação
    else if (age <= 27) ageMult = 1.00; // Ápice físico e tático
    else if (age <= 30) ageMult = 0.70; // Experiente
    else ageMult = 0.40;                // Veterano (evolução lenta / manutenção)

    const rawXP = (baseMinutesXP + ratingBonus + goalsBonus + assistsBonus + cleanSheetBonus + resultBonus) * ageMult;
    const totalMatchXP = Math.max(8, Math.round(rawXP));

    return {
      minutes,
      rating,
      cleanSheet: hadCleanSheet,
      goals,
      assists,
      matchXP: totalMatchXP,
      breakdown: {
        baseMinutes: baseMinutesXP,
        ratingBonus,
        goalsBonus,
        assistsBonus,
        cleanSheetBonus,
        resultBonus,
        ageMult
      }
    };
  }

  // Verifica e executa Level Up de OVR e a mecânica "Ir Além" (Breakthrough de Potencial)
  function checkLevelUp(p, state, eventsLog = []) {
    if (!p) return;
    initPlayerXP(p, state);

    let curOvr = typeof window.playerOverall === 'function' ? window.playerOverall(p) : (Number(p.overall || p.ovr) || 65);
    let curPot = Number(p.potential) || curOvr;
    const age = Number(p.age) || 24;

    while (p.xp >= p.xpNext) {
      // CASO 1: Atleta ainda está abaixo do seu potencial máximo
      if (curOvr < curPot) {
        p.xp -= p.xpNext;
        curOvr += 1;
        p.overall = curOvr;
        p.ovr = curOvr;
        p.fc = curOvr;
        p.pes = curOvr;
        p.xpNext = getXPRequiredForNextLevel(curOvr);

        // Incrementa atributos de posição proporcionalmente
        incrementPlayerAttributes(p, 1);

        if (p.monthlyEvolution) {
          p.monthlyEvolution.ovrGains = (p.monthlyEvolution.ovrGains || 0) + 1;
        }

        const msg = `🌟 EVOLUÇÃO: O atleta ${p.name} atingiu a meta de XP e evoluiu para ${curOvr} OVR!`;
        if (state && Array.isArray(state.news)) {
          state.news.unshift(msg);
          state.news = state.news.slice(0, 50);
        }
        if (typeof window.toast === 'function') {
          window.toast(`🌟 ${p.name} evoluiu para ${curOvr} OVR!`);
        }
        eventsLog.push({ type: 'levelup', player: p, oldOvr: curOvr - 1, newOvr: curOvr });
      }
      // CASO 2: Atleta atingiu seu limite de potencial -> Mecânica "Ir Além" (Breakthrough)
      // "Quem chega cedo ao próprio limite pode ir além: o técnico percebe que você superou o esperado e ainda dá para crescer um pouco mais."
      else {
        const avgRating = p.monthlyEvolution?.avgRating || p.rating || 7.2;
        const matchesCount = p.monthlyEvolution?.matchesPlayed || 0;
        const canBreakthrough = (age <= 24) && (curPot < 99) && (avgRating >= 7.3 || matchesCount >= 4);

        if (canBreakthrough) {
          // A comissão técnica reconhece que o jovem superou o esperado!
          const potBoost = (p.breakthroughsCount < 1) ? 2 : 1;
          curPot = Math.min(99, curPot + potBoost);
          p.potential = curPot;
          p.breakthroughsCount = (p.breakthroughsCount || 0) + 1;

          p.xp -= p.xpNext;
          curOvr += 1;
          p.overall = curOvr;
          p.ovr = curOvr;
          p.fc = curOvr;
          p.pes = curOvr;
          p.xpNext = getXPRequiredForNextLevel(curOvr);

          incrementPlayerAttributes(p, 1);

          if (p.monthlyEvolution) {
            p.monthlyEvolution.ovrGains = (p.monthlyEvolution.ovrGains || 0) + 1;
            p.monthlyEvolution.breakthroughs = (p.monthlyEvolution.breakthroughs || 0) + 1;
          }

          const msg = `🚀 PRODÍGIO INDOMÁVEL: ${p.name} superou as expectativas da comissão técnica e rompeu o teto de potencial (+${potBoost} POT)! Novo OVR: ${curOvr} (Potencial: ${curPot}).`;
          if (state && Array.isArray(state.news)) {
            state.news.unshift(msg);
            state.news = state.news.slice(0, 50);
          }
          if (typeof window.toast === 'function') {
            window.toast(`🚀 PRODÍGIO! ${p.name} rompeu o potencial (+${potBoost} POT) e subiu para ${curOvr} OVR!`);
          }
          eventsLog.push({ type: 'breakthrough', player: p, oldOvr: curOvr - 1, newOvr: curOvr, newPot: curPot, potBoost });
        } else {
          // Atingiu o teto sem critérios de rompimento no momento; trava no teto sem perder progresso
          p.xp = Math.min(p.xp, p.xpNext - 1);
          break;
        }
      }
    }
  }

  // Incrementa atributos granulares de acordo com a posição do atleta
  function incrementPlayerAttributes(p, delta = 1) {
    if (!p) return;
    const isGK = /^(GK|GOLEIRO)$/i.test(p.pos || '');
    if (isGK) {
      if (p.attrs) {
        ['elasticidade', 'reflexos', 'posicionamento', 'seguranca', 'jogoComPes'].forEach(attr => {
          if (typeof p.attrs[attr] === 'number') p.attrs[attr] = Math.min(99, p.attrs[attr] + delta);
        });
      }
      p.gk = Math.min(99, (Number(p.gk) || p.overall) + delta);
    } else {
      if (p.attrs) {
        ['velocidade', 'finalizacao', 'passe', 'drible', 'defesa', 'fisico'].forEach(attr => {
          if (typeof p.attrs[attr] === 'number') p.attrs[attr] = Math.min(99, p.attrs[attr] + delta);
        });
      }
      if (/^(ST|CF|RW|LW|ATA|PD|PE)$/i.test(p.pos || '')) {
        p.fin = Math.min(99, (Number(p.fin) || p.overall) + delta);
      } else if (/^(CM|AM|DM|VOL|MEI)$/i.test(p.pos || '')) {
        p.pas = Math.min(99, (Number(p.pas) || p.overall) + delta);
      } else {
        p.def = Math.min(99, (Number(p.def) || p.overall) + delta);
      }
    }
  }

  const PlayerXPEvolution = {
    getXPRequiredForNextLevel,
    initPlayerXP,
    calcPlayerMatchXP,
    checkLevelUp,

    // Processamento de XP de Partida após qualquer jogo oficial finalizado
    processMatchXP(state, matchResult) {
      if (!state || !Array.isArray(state.squad)) return { updatedPlayers: [], levelUps: [] };

      initPlayerXP(state.squad[0], state);
      const isHome = norm(matchResult?.h) === norm(state.club);
      const gf = isHome ? (matchResult?.hg ?? 0) : (matchResult?.ag ?? 0);
      const ga = isHome ? (matchResult?.ag ?? 0) : (matchResult?.hg ?? 0);
      const won = matchResult?.won ?? (gf > ga);
      const draw = gf === ga;
      const teamResult = { gf, ga, won, draw };

      // Identifica quem jogou na partida
      const lineupKeys = Array.isArray(state.lineup) ? state.lineup : [];
      const starters = lineupKeys.map(k => state.squad.find(p => (typeof window.playerKey === 'function' ? window.playerKey(p) : p.name) === k)).filter(Boolean);

      // Substituições registradas em partida ao vivo
      const liveState = (typeof window.getLiveMatchState === 'function') ? window.getLiveMatchState() : window.liveMatchState;
      const subbedOutKeys = Array.isArray(liveState?.subbedOut) ? liveState.subbedOut : [];

      // Mapeamento de gols e assistências do jogo
      const goalCounts = {};
      const assistCounts = {};
      const events = Array.isArray(matchResult?.events) ? matchResult.events : [];
      events.forEach(ev => {
        if (ev?.type === 'gol' && ev.scorer) {
          const scorerKey = norm(ev.scorer);
          goalCounts[scorerKey] = (goalCounts[scorerKey] || 0) + 1;
        }
        if (ev?.type === 'gol' && ev.assist) {
          const assistKey = norm(ev.assist);
          assistCounts[assistKey] = (assistCounts[assistKey] || 0) + 1;
        }
      });

      const updatedPlayers = [];
      const levelUps = [];

      // 1. Processa titulares e reservas que entraram
      starters.forEach(p => {
        initPlayerXP(p, state);
        const pk = typeof window.playerKey === 'function' ? window.playerKey(p) : p.name;
        const wasSubbedOut = subbedOutKeys.includes(pk);
        const minutes = wasSubbedOut ? 60 : 90;

        const isGK = /^(GK|GOLEIRO)$/i.test(p.pos || '');
        const isDef = /^(CB|LB|RB|ZAG|LE|LD)$/i.test(p.pos || '');

        const pGoals = goalCounts[norm(p.name)] || 0;
        const pAssists = assistCounts[norm(p.name)] || 0;

        const perf = calcPlayerMatchXP(p, {
          minutes,
          teamResult,
          goals: pGoals,
          assists: pAssists,
          isGK,
          isDef
        });

        // Concede os pontos de XP da partida
        p.xp = (p.xp || 0) + perf.matchXP;
        p.lastMatchXP = perf;

        // Atualiza resumo mensal
        if (p.monthlyEvolution) {
          const m = p.monthlyEvolution;
          m.matchXP = (m.matchXP || 0) + perf.matchXP;
          m.matchesPlayed = (m.matchesPlayed || 0) + 1;
          m.sumRatings = (m.sumRatings || 0) + perf.rating;
          m.avgRating = Math.round((m.sumRatings / m.matchesPlayed) * 10) / 10;
        }

        checkLevelUp(p, state, levelUps);
        updatedPlayers.push({ player: p, perf });
      });

      // 2. Quem ficou no banco não ganha XP de jogo nesta rodada, apenas treina
      state.squad.forEach(p => {
        const pk = typeof window.playerKey === 'function' ? window.playerKey(p) : p.name;
        if (!starters.some(s => (typeof window.playerKey === 'function' ? window.playerKey(s) : s.name) === pk)) {
          initPlayerXP(p, state);
          p.lastMatchXP = { minutes: 0, rating: 6.0, matchXP: 0 };
        }
      });

      return { updatedPlayers, levelUps };
    },

    // Processamento de XP de Treino do Centro de Treinamento (CT)
    // Concedido periodicamente a TODO o elenco (titulares e reservas continuam evoluindo)
    processMonthlyTrainingXP(state) {
      if (!state || !Array.isArray(state.squad)) return [];
      const lvl = state.infrastructure?.training?.level || 1;
      const baseTrainingPoints = [35, 50, 70, 95, 130][Math.max(0, Math.min(4, lvl - 1))] || 40;

      const levelUps = [];

      state.squad.forEach(p => {
        initPlayerXP(p, state);
        const age = Number(p.age) || 24;
        const ageMult = age <= 20 ? 1.35 : (age <= 23 ? 1.20 : (age <= 27 ? 1.0 : (age <= 30 ? 0.75 : 0.45)));
        const trainingXP = Math.round(baseTrainingPoints * ageMult);

        p.xp = (p.xp || 0) + trainingXP;
        if (p.monthlyEvolution) {
          p.monthlyEvolution.trainingXP = (p.monthlyEvolution.trainingXP || 0) + trainingXP;
        }

        checkLevelUp(p, state, levelUps);
      });

      return levelUps;
    },

    // Renderiza a barra compacta de XP para tabelas e cartões de elenco
    renderMiniXPBar(p) {
      if (!p) return '';
      const xp = Number(p.xp) || 0;
      const curOvr = typeof window.playerOverall === 'function' ? window.playerOverall(p) : (Number(p.overall || p.ovr) || 65);
      const xpNext = Number(p.xpNext) || getXPRequiredForNextLevel(curOvr);
      const pct = Math.min(100, Math.max(0, Math.round((xp / xpNext) * 100)));

      return `
        <div class="afm-player-xp-mini" title="Progresso de Evolução: ${xp}/${xpNext} XP (${pct}%)" style="display:flex;flex-direction:column;gap:2px;min-width:48px;max-width:64px;margin:2px auto 0 auto;">
          <div style="display:flex;justify-content:space-between;align-items:center;font-size:8px;color:#94a3b8;font-weight:800;line-height:1;">
            <span style="color:#a855f7;">XP</span>
            <span style="color:#cbd5e1;">${pct}%</span>
          </div>
          <div style="width:100%;height:4px;background:rgba(255,255,255,0.08);border-radius:999px;overflow:hidden;border:1px solid rgba(168,85,247,0.3);">
            <div style="width:${pct}%;height:100%;background:linear-gradient(90deg, #9333ea, #38bdf8);border-radius:999px;transition:width 0.3s ease;"></div>
          </div>
        </div>
      `;
    },

    // Renderiza a seção completa de Evolução & Resumo Mensal para o Modal da Lupa
    renderEvolutionPanelHTML(p, state) {
      if (!p) return '';
      initPlayerXP(p, state);

      const curOvr = typeof window.playerOverall === 'function' ? window.playerOverall(p) : (Number(p.overall || p.ovr) || 65);
      const curPot = Number(p.potential) || curOvr;
      const age = Number(p.age) || 24;
      const xp = Number(p.xp) || 0;
      const xpNext = Number(p.xpNext) || getXPRequiredForNextLevel(curOvr);
      const pct = Math.min(100, Math.max(0, Math.round((xp / xpNext) * 100)));

      const m = p.monthlyEvolution || { matchXP: 0, trainingXP: 0, matchesPlayed: 0, avgRating: 7.0, ovrGains: 0, breakthroughs: 0 };
      const totalMonthXP = (m.matchXP || 0) + (m.trainingXP || 0);

      // Status do teto de evolução
      let statusTag = '';
      if (curOvr >= curPot) {
        if (age <= 24) {
          statusTag = `<span style="background:linear-gradient(135deg, #7c3aed, #ec4899);color:#fff;font-size:9.5px;font-weight:900;padding:2px 8px;border-radius:6px;box-shadow:0 0 10px rgba(236,72,153,0.5);" title="Com alto desempenho nas partidas, este jovem atleta pode quebrar o teto de potencial!">🚀 IR ALÉM: PRONTO PARA ROMPER POTENCIAL</span>`;
        } else {
          statusTag = `<span style="background:rgba(234,179,8,0.18);color:#fbbf24;border:1px solid rgba(234,179,8,0.4);font-size:9.5px;font-weight:800;padding:2px 7px;border-radius:6px;">👑 NO TOPO DO POTENCIAL</span>`;
        }
      } else {
        const margin = curPot - curOvr;
        statusTag = `<span style="background:rgba(34,197,94,0.18);color:#4ade80;border:1px solid rgba(34,197,94,0.4);font-size:9.5px;font-weight:800;padding:2px 7px;border-radius:6px;">📈 EM EVOLUÇÃO (Margem: +${margin} OVR)</span>`;
      }

      return `
        <div class="afm-lupa-xp-panel" style="background:#090d16;border:1px solid rgba(168,85,247,0.3);border-radius:12px;padding:12px;margin-top:2px;">
          <!-- Cabeçalho do Card de Evolução -->
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:6px;">
            <div style="display:inline-flex;align-items:center;gap:6px;">
              <span style="font-size:14px;">⚡</span>
              <span style="font-size:11px;font-weight:900;color:#c084fc;letter-spacing:0.6px;text-transform:uppercase;">PROGRESSO DE EVOLUÇÃO & XP</span>
            </div>
            ${statusTag}
          </div>

          <!-- Barra Principal de XP com Brilho Neon -->
          <div style="margin-bottom:10px;">
            <div style="display:flex;justify-content:space-between;align-items:baseline;font-size:11px;margin-bottom:4px;">
              <span style="color:#94a3b8;font-weight:700;">Nível Atual: <b style="color:#fff;">OVR ${curOvr}</b> ➔ Próximo: <b style="color:#38bdf8;">OVR ${curOvr + 1}</b></span>
              <span style="color:#cbd5e1;font-weight:800;"><b style="color:#c084fc;font-size:13px;">${xp.toLocaleString('pt-BR')}</b> / ${xpNext.toLocaleString('pt-BR')} XP <span style="color:#38bdf8;">(${pct}%)</span></span>
            </div>
            <div style="width:100%;height:8px;background:rgba(255,255,255,0.06);border-radius:999px;overflow:hidden;border:1px solid rgba(168,85,247,0.4);box-shadow:inset 0 1px 3px rgba(0,0,0,0.6);">
              <div style="width:${pct}%;height:100%;background:linear-gradient(90deg, #7c3aed 0%, #38bdf8 100%);border-radius:999px;box-shadow:0 0 12px rgba(56,189,248,0.7);transition:width 0.4s cubic-bezier(0.4, 0, 0.2, 1);"></div>
            </div>
          </div>

          <!-- Resumo do Mês (De onde vieram os pontos - Referência Exata do Screenshot) -->
          <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);border-radius:8px;padding:8px 10px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
              <span style="font-size:10px;font-weight:900;color:#38bdf8;letter-spacing:0.5px;text-transform:uppercase;">📊 RESUMO DE PONTOS DESTE MÊS</span>
              <span style="font-size:10px;font-weight:800;color:#facc15;">+${totalMonthXP.toLocaleString('pt-BR')} XP no mês</span>
            </div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;text-align:center;">
              <div style="background:#0d1424;border:1px solid rgba(56,189,248,0.2);border-radius:6px;padding:5px 4px;">
                <div style="font-size:8.5px;color:#94a3b8;font-weight:800;">🎮 EM CAMPO</div>
                <div style="font-size:13px;font-weight:900;color:#38bdf8;margin-top:2px;">+${(m.matchXP || 0).toLocaleString('pt-BR')}</div>
                <div style="font-size:8px;color:#64748b;">Jogos & Notas</div>
              </div>
              <div style="background:#0d1424;border:1px solid rgba(168,85,247,0.2);border-radius:6px;padding:5px 4px;">
                <div style="font-size:8.5px;color:#94a3b8;font-weight:800;">🏋️ TREINO CT</div>
                <div style="font-size:13px;font-weight:900;color:#c084fc;margin-top:2px;">+${(m.trainingXP || 0).toLocaleString('pt-BR')}</div>
                <div style="font-size:8px;color:#64748b;">Instalações</div>
              </div>
              <div style="background:#0d1424;border:1px solid rgba(250,204,21,0.2);border-radius:6px;padding:5px 4px;">
                <div style="font-size:8.5px;color:#94a3b8;font-weight:800;">⭐ NOTA MÉDIA</div>
                <div style="font-size:13px;font-weight:900;color:#facc15;margin-top:2px;">${m.matchesPlayed > 0 ? (m.avgRating || 7.0).toFixed(1) : '-'}</div>
                <div style="font-size:8px;color:#64748b;">${m.matchesPlayed || 0} jogos disputados</div>
              </div>
            </div>
            <div style="margin-top:6px;font-size:9.5px;color:#94a3b8;line-height:1.3;display:flex;align-items:center;gap:4px;">
              <span>💡</span>
              <span><b>Dica:</b> Titulares com altas notas e lances decisivos ganham muito mais XP; atletas no banco evoluem com o treino no CT.</span>
            </div>
          </div>
        </div>
      `;
    }
  };

  window.AFM_PlayerXPEvolution = PlayerXPEvolution;

})(typeof window !== 'undefined' ? window : globalThis);
