/**
 * AFM MANAGER 2026 / 2027 — MODO CARREIRA JOGADOR (BE A PRO)
 * Interface das Abas Exclusivas do Atleta, Modais Customizados e Navegação Dedicada
 */

(function(window){
  'use strict';

  const esc = (typeof window.esc === 'function')
    ? window.esc
    : (s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'));

  const formatDatePtBr = (typeof window.formatDatePtBr === 'function')
    ? window.formatDatePtBr
    : (d => {
        if(!d) return '';
        const p = String(d).split('-');
        return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : d;
      });

  function getPlayerMarketValueBrl(player){
    const marketValueMi = Number(player?.marketValueMi);
    const marketValueBrl = Number(player?.marketValue);
    const valueMi = Number(player?.value);
    const estimatedValue = Math.pow((Number(player?.ovr || player?.overall) || 35) / 10, 3.8) * 100000;
    if(Number.isFinite(marketValueMi) && marketValueMi > 0) return Math.round(marketValueMi * 1000000);
    if(Number.isFinite(marketValueBrl) && marketValueBrl > 0) return Math.round(marketValueBrl);
    if(Number.isFinite(valueMi) && valueMi > 0) return Math.round(valueMi * 1000000);
    return Math.round(estimatedValue);
  }

  function formatPlayerMarketValueMi(player){
    return (getPlayerMarketValueBrl(player) / 1000000).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
  }

  function addDaysToIso(isoDateStr, days){
    const parts = String(isoDateStr || '2026-01-01').split('-');
    const y = Number(parts[0]) || 2026;
    const m = (Number(parts[1]) || 1) - 1;
    const d = Number(parts[2]) || 1;
    const dt = new Date(y, m, d, 12, 0, 0);
    dt.setDate(dt.getDate() + Number(days));
    const ny = dt.getFullYear();
    const nm = String(dt.getMonth() + 1).padStart(2, '0');
    const nd = String(dt.getDate()).padStart(2, '0');
    return `${ny}-${nm}-${nd}`;
  }

  function getDaysBetween(isoDate1, isoDate2){
    const p1 = String(isoDate1 || '2026-01-01').split('-');
    const p2 = String(isoDate2 || '2026-01-01').split('-');
    const d1 = new Date(Number(p1[0]), Number(p1[1]) - 1, Number(p1[2]), 12, 0, 0);
    const d2 = new Date(Number(p2[0]), Number(p2[1]) - 1, Number(p2[2]), 12, 0, 0);
    return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
  }

  function getControlledPlayer(state){
    if(!state) return null;
    const squad = Array.isArray(state.squad) ? state.squad : (state.squad = []);
    const pState = state.playerCareerState;
    const athlete = squad.find(p => p.id === state.controlledPlayerId) ||
      squad.find(p => p.isControlled) ||
      (pState?.athleteName && squad.find(p => String(p.name || '').toLowerCase() === String(pState.athleteName).toLowerCase()));
    if(athlete){
      state.controlledPlayerId = athlete.id;
      return athlete;
    }
    if(pState?.athleteName){
      const id = state.controlledPlayerId || `player_user_recovered_${Date.now()}`;
      const recovered = {
        id,
        name: pState.athleteName,
        nickname: pState.nickname || pState.athleteName,
        pos: pState.position || pState.pos || 'ATA',
        position: pState.position || pState.pos || 'ATA',
        number: Number(pState.shirtNumber) || 10,
        age: Number(pState.age) || 15,
        ovr: Number(pState.athleteOvr || pState.overall) || 35,
        overall: Number(pState.athleteOvr || pState.overall) || 35,
        attributes: pState.attributes || { vel: 35, chu: 35, pas: 35, dri: 35, def: 35, fis: 35 },
        photo: pState.appearance?.customFacePhoto || pState.appearance?.facePhoto || null,
        wage: Number(pState.weeklySalary) || 0,
        isControlled: true,
        club: state.club || ''
      };
      state.controlledPlayerId = id;
      squad.unshift(recovered);
      return recovered;
    }
    return state.gameMode === 'player' || state.controlledPlayerId ? null : (squad[0] || null);
  }

  function syncControlledPlayerOverall(state){
    const athlete = getControlledPlayer(state);
    const engine = window.AFM_PlayerEngine;
    if(!athlete?.attributes || !state?.playerCareerState || !engine?.getPlayerEffectiveAttributes) return;
    athlete.ovr = engine.calculatePlayerOverall(engine.getPlayerEffectiveAttributes(state, athlete), athlete.pos);
    athlete.overall = athlete.ovr;
    state.playerCareerState.athleteOvr = athlete.ovr;
  }

  function getCareerState(state){
    if(!state) return null;
    if(!state.playerCareerState){
      const athlete = getControlledPlayer(state);
      if(!athlete || !(state.controlledPlayerId || athlete.isControlled || state.gameMode === 'player')) return null;
      state.playerCareerState = {
        athleteName: athlete.name || 'Atleta',
        nickname: athlete.nickname || athlete.name || 'Atleta',
        pos: athlete.pos || athlete.position || 'ATA',
        position: athlete.pos || athlete.position || 'ATA',
        age: Number(athlete.age) || 15,
        shirtNumber: Number(athlete.number) || 10,
        athleteOvr: Number(athlete.ovr || athlete.overall) || 35,
        overall: Number(athlete.ovr || athlete.overall) || 35,
        attributes: athlete.attributes || {},
        appearance: {},
        personalBank: 0,
        xp: 0,
        xpToNextLevel: 400,
        level: 1,
        skillPoints: 0,
        managerTrust: 45,
        careerStats: { matches: 0, goals: 0, assists: 0, minutes: 0, averageRating: 0 }
      };
    }
    const pState = state.playerCareerState;
    const athlete = getControlledPlayer(state);
    const trust = Number(pState.managerTrust);
    pState.managerTrust = Number.isFinite(trust) ? Math.max(0, Math.min(100, trust)) : 45;
    pState.age = Number(pState.age || athlete?.age) || 15;
    pState.city = pState.city || athlete?.city || 'Brasília';
    pState.stateUf = pState.stateUf || athlete?.stateUf || 'DF';
    pState.position = pState.position || pState.pos || athlete?.pos || athlete?.position || 'ATA';
    pState.pos = pState.pos || pState.position;
    pState.shirtNumber = Number(pState.shirtNumber || athlete?.number) || 10;
    pState.level = Math.max(1, Number(pState.level) || 1);
    pState.skillPoints = Math.max(0, Number(pState.skillPoints) || 0);
    pState.athleteOvr = Number(pState.athleteOvr || pState.overall || athlete?.ovr || athlete?.overall) || 35;
    pState.appearance = pState.appearance || {};
    if(athlete){
      athlete.name = athlete.name || pState.athleteName || 'Atleta';
      athlete.number = Number(athlete.number || pState.shirtNumber) || 10;
      athlete.pos = athlete.pos || athlete.position || pState.position;
      athlete.ovr = Number(athlete.ovr || athlete.overall || pState.athleteOvr) || 35;
      athlete.overall = athlete.ovr;
    }
    window.AFM_PlayerEngine?.normalizePlayerProgression?.(pState);
    pState.weeklyTrainingFocus = pState.weeklyTrainingFocus || 'finalizacao';
    // Migração idempotente: se o save estava no nível 1 com 0 XP e ainda tinha pontos livres
    // indevidos (pois os pontos já foram todos distribuídos na criação do atleta), ajusta para 0 pontos livres
    if(!pState._startingPointsNormalized && (pState.level || 1) === 1 && (!pState.xp || pState.xp === 0) && pState.skillPoints > 0){
      pState.skillPoints = 0;
      pState._startingPointsNormalized = true;
    }
    // Fallbacks para novo sistema de Prêmios, Personalidade e Relacionamentos
    pState.personality = pState.personality || { maverick: 30, heartbeat: 30, virtuoso: 40 };
    pState.relationships = pState.relationships || { boardRelation: 65, fansRelation: 70, teammatesRelation: 75 };
    pState.individualAwards = Array.isArray(pState.individualAwards) ? pState.individualAwards : [];
    pState.competitionRecordsBroken = Array.isArray(pState.competitionRecordsBroken) ? pState.competitionRecordsBroken : [];
    pState.careerStats = pState.careerStats || {};
    pState.clubSalaryArrears = pState.clubSalaryArrears || { amount: 0, months: 0, claim: null };
    pState.careerStats.cleanSheets = pState.careerStats.cleanSheets || 0;
    pState.careerStats.mvpCount = pState.careerStats.mvpCount || pState.careerStats.manOfTheMatch || 0;
    pState.careerStats.unbeatenStreak = pState.careerStats.unbeatenStreak || 0;
    pState.nationality = pState.nationality || 'Brasil';
    pState.internationalStats = pState.internationalStats || {
      caps: 0,
      goals: 0,
      assists: 0,
      cleanSheets: 0,
      mvpCount: 0,
      titles: [],
      history: []
    };
    // Inicialização da Rede Social ("FootGram / InstaFut")
    if(typeof window !== 'undefined' && window.AFM_SocialMedia?.initSocialMediaState){
      window.AFM_SocialMedia.initSocialMediaState(state);
    } else {
      pState.socialMedia = pState.socialMedia || {
        handle: '@' + (pState.athleteName || 'craque').toLowerCase().replace(/[^a-z0-9]/g, '') + '10',
        bio: `⚽ Atleta profissional do ${state.club || 'Clube'} | Foco total nos gramados! 🇧🇷`,
        avatarUrl: null,
        isVerified: false,
        followers: 1200,
        celebrityLevel: 10,
        postedToday: false,
        feedPosts: []
      };
    }
    return pState;
  }

  async function restorePlayerProfile(){
    const state = window.state || {};
    const username = String(state.userOwner || window.AFM_DB?.getUser?.()?.username || '').toLowerCase();
    if(!username || !window.AFM_DB?.syncUser || typeof window.loadUserSlot !== 'function'){
      window.toast?.('Não foi possível localizar a conta para restaurar o save.');
      return;
    }
    try {
      const result = await window.AFM_DB.syncUser(username);
      if(!result?.ok){
        window.toast?.('Falha ao restaurar o save da nuvem. Verifique a conexão e tente novamente.');
        return;
      }
      window.loadUserSlot(Number(state.userSlot) || 1, username);
    } catch(e){
      window.toast?.('Falha ao restaurar o save da nuvem. Verifique a conexão e tente novamente.');
    }
  }

  /**
   * Modal Pop-up Customizado Dark Glassmorphism Neon (Substitui o alert() nativo do navegador)
   */
  function showCustomAlert(options){
    const opts = typeof options === 'string' ? { message: options } : (options || {});
    const title = opts.title || 'AFM Notificação';
    const message = opts.message || '';
    const icon = opts.icon || (opts.type === 'danger' ? '⚠️' : opts.type === 'warning' ? '⭐' : opts.type === 'success' ? '✅' : '⚽');
    const onConfirm = opts.onConfirm || null;
    const isConfirm = Boolean(opts.isConfirm || onConfirm);

    const oldModal = document.getElementById('afmCustomAlertModal');
    if(oldModal) oldModal.remove();

    const overlay = document.createElement('div');
    overlay.id = 'afmCustomAlertModal';
    overlay.className = 'afm-custom-modal-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);backdrop-filter:blur(10px);z-index:999999;display:flex;align-items:center;justify-content:center;padding:16px';

    overlay.innerHTML = `
      <div style="background:#0f172a;border:2px solid rgba(168,85,247,0.5);border-radius:20px;padding:24px;max-width:460px;width:100%;box-shadow:0 24px 60px rgba(0,0,0,0.9);color:#fff;animation:afmScaleUp 0.25s ease;text-align:center">
        <div style="font-size:36px;margin-bottom:8px">${icon}</div>
        <h3 style="margin:0 0 8px 0;font-size:18px;font-weight:900;color:#c084fc;letter-spacing:0.5px">${esc(title)}</h3>
        <div style="font-size:13px;color:#cbd5e1;line-height:1.5;margin-bottom:22px;white-space:pre-line">${esc(message)}</div>
        <div style="display:flex;justify-content:center;gap:12px">
          ${isConfirm ? `
            <button type="button" id="btnCustomAlertCancel" class="btn" style="background:rgba(255,255,255,0.08);color:#fff;font-weight:800;padding:10px 20px;border-radius:10px;cursor:pointer">
              Cancelar
            </button>
          ` : ''}
          <button type="button" id="btnCustomAlertOk" class="btn primary" style="background:linear-gradient(135deg,#7c3aed,#a855f7);border:none;color:#fff;font-weight:900;font-size:14px;padding:10px 28px;border-radius:10px;cursor:pointer;box-shadow:0 4px 18px rgba(168,85,247,0.4)">
            ${isConfirm ? 'Confirmar' : 'Entendido'}
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const btnOk = overlay.querySelector('#btnCustomAlertOk');
    if(btnOk){
      btnOk.onclick = () => {
        overlay.remove();
        if(typeof onConfirm === 'function') onConfirm();
      };
      btnOk.focus();
    }

    const btnCancel = overlay.querySelector('#btnCustomAlertCancel');
    if(btnCancel){
      btnCancel.onclick = () => {
        overlay.remove();
        if(typeof opts.onCancel === 'function') opts.onCancel();
      };
    }
  }

  /**
   * Roteador de Páginas do Modo Jogador
   * Retorna HTML específico para abas do jogador ou null para permitir que o motor padrão renderize
   * páginas como Notícias, Calendário, Classificação da Liga (temporada) e Configurações.
   */
  function renderPage(view){
    const s = window.state;
    if(!s || s.gameMode !== 'player') return null;
    syncControlledPlayerOverall(s);

    switch(view){
      case 'player_hub':
      case 'central':
        return renderPlayerHub(s);

      case 'player_evolution':
      case 'meutime':
        return renderPlayerEvolution(s);

      case 'player_club':
      case 'elenco':
        return renderPlayerClubAndSquad(s);

      case 'player_agent':
      case 'mercado':
        return renderPlayerAgentAndMarket(s);

      case 'player_lifestyle':
      case 'escritorio':
      case 'carreira':
        return renderPlayerLifestyleAndSponsors(s);

      case 'player_stats':
        return renderPlayerStatsAndTrophies(s);

      case 'player_national':
        return renderPlayerNationalTeam(s);

      case 'player_social':
      case 'footgram':
      case 'instafut':
        return renderPlayerSocialMedia(s);

      // Notícias, Calendário e Classificação da Liga usam os motores oficiais do jogo!
      case 'temporada':
      case 'classificacao':
      case 'noticias':
      case 'calendario':
      case 'config':
      default:
        // Retorna null para que js/game.js invoque a respectiva função de página dedicada
        return null;
    }
  }

  function isForbiddenCoachNews(item){
    const s = String(item || '').toLowerCase();
    return s.includes('convite para evento') ||
           s.includes('proposta de evento') ||
           s.includes('show no estádio') ||
           s.includes('festival eletrônico') ||
           s.includes('tardezinha') ||
           s.includes('numanice') ||
           s.includes('villa mix') ||
           s.includes('rock brasil') ||
           s.includes('proposta de aluguel') ||
           s.includes('estádio alugado') ||
           s.includes('bilheteria') ||
           s.includes('estacionamento') ||
           s.includes('público:') ||
           s.includes('ausência do técnico') ||
           s.includes('50% de ganho de xp') ||
           s.includes('folha salarial') ||
           s.includes('balanço financeiro') ||
           s.includes('cota de transmissão') ||
           s.includes('patrocínio master') ||
           s.includes('naming rights') ||
           s.includes('sócio-torcedor') ||
           s.includes('reforma de arquibancada') ||
           s.includes('obras do estádio') ||
           s.includes('construtora') ||
           s.includes('concessão de estacionamento') ||
           s.includes('investida árabe') ||
           s.includes('oportunidade extraordinária') ||
           s.includes('novo olheiro contratado') ||
           s.includes('a diretoria considera uma oportunidade extraordinária');
  }

  function getPlayerModeNewsList(state){
    const pState = getCareerState(state) || {};
    const athlete = getControlledPlayer(state) || { name: pState.athleteName || 'Atleta', number: pState.shirtNumber || 10 };
    const club = state.club || 'Clube';
    const compName = state.competition || 'Campeonato';

    // 1. Limpa notícias proibidas de treinador/estádio acumuladas no save
    if(Array.isArray(state.news)){
      state.news = state.news.filter(n => !isForbiddenCoachNews(n));
    } else {
      state.news = [];
    }

    const rawList = state.news.slice(0, 8);
    const formattedList = [];

    rawList.forEach((n, idx) => {
      const text = String(n || '').trim();
      if(!text) return;

      let tag = 'FUTEBOL & CLUBE';
      let icon = '📰';
      let tagColor = '#60a5fa';
      let borderColor = '#3b82f6';

      if(text.includes('🔥') || text.includes('⚽') || text.includes('GOL') || text.includes('ATUAÇÃO') || text.includes('DOBRADINHA') || text.includes('HAT-TRICK') || text.includes('x ')){
        tag = 'PARTIDA & GOL';
        icon = '⚽';
        tagColor = '#4ade80';
        borderColor = '#22c55e';
      } else if(text.includes('⚡') || text.includes('CT') || text.includes('TREINO') || text.includes('XP')){
        tag = 'CT & TREINO';
        icon = '⚡';
        tagColor = '#facc15';
        borderColor = '#eab308';
      } else if(text.includes('📈') || text.includes('📉') || text.includes('PROFESSOR') || text.includes('COMISSÃO') || text.includes('TREINADOR')){
        tag = 'COMISSÃO TÉCNICA';
        icon = '📋';
        tagColor = '#38bdf8';
        borderColor = '#0284c7';
      } else if(text.includes('💼') || text.includes('FINANÇAS') || text.includes('SALÁRIO') || text.includes('MATERIAL') || text.includes('CHUTEIRA') || text.includes('MERCADO')){
        tag = 'CARREIRA & MERCADO';
        icon = '💎';
        tagColor = '#c084fc';
        borderColor = '#a855f7';
      } else if(text.includes('🗣️') || text.includes('TORCIDA') || text.includes('REDES') || text.includes('IMPRENSA')){
        tag = 'TORCIDA & MÍDIA';
        icon = '🗣️';
        tagColor = '#fb7185';
        borderColor = '#f43f5e';
      }

      formattedList.push({
        text,
        tag,
        icon,
        tagColor,
        borderColor,
        time: idx === 0 ? 'Hoje' : idx === 1 ? 'Ontem' : `Há ${idx + 1} dias`
      });
    });

    // 2. Se a lista ainda for pequena, complementa com notícias dinâmicas e contextuais da vida do atleta e time
    if(formattedList.length < 4){
      const focusLabels = {
        finalizacao: 'Finalização & Chutes',
        passe: 'Passe & Visão de Jogo',
        drible: 'Drible & Agilidade',
        fisico: 'Físico & Fôlego',
        defesa: 'Desarme & Marcação'
      };
      const fLabel = focusLabels[pState.weeklyTrainingFocus] || 'Treinamento Físico-Técnico';

      const fillers = [
        {
          text: `⚡ CT DO ${club.toUpperCase()}: ${athlete.name} completou as atividades da semana focado em ${fLabel}. A comissão técnica elogiou a dedicação do atleta!`,
          tag: 'CT & TREINO',
          icon: '⚡',
          tagColor: '#facc15',
          borderColor: '#eab308',
          time: 'Há 1 dia'
        },
        {
          text: `📋 COMISSÃO TÉCNICA: O treinador destacou a disciplina de ${athlete.name}: "Jogador focado e obediente taticamente. Tem tudo para brilhar no ${compName}!" (Confiança: ${pState.managerTrust || 65}%)`,
          tag: 'COMISSÃO TÉCNICA',
          icon: '📋',
          tagColor: '#38bdf8',
          borderColor: '#0284c7',
          time: 'Há 2 dias'
        },
        {
          text: `🗣️ REDES SOCIAIS: Vídeo com lances e finalizações de ${athlete.name} repercutiu entre torcedores do ${club}, que pedem mais minutos em campo para o camisa ${athlete.number || 10}.`,
          tag: 'TORCIDA & MÍDIA',
          icon: '🗣️',
          tagColor: '#fb7185',
          borderColor: '#f43f5e',
          time: 'Há 3 dias'
        },
        {
          text: `💼 BASTIDORES DO MERCADO: O empresário de ${athlete.name} confirma sondagens de olheiros que acompanham de perto a trajetória do atleta no ${club}.`,
          tag: 'CARREIRA & MERCADO',
          icon: '💎',
          tagColor: '#c084fc',
          borderColor: '#a855f7',
          time: 'Há 4 dias'
        }
      ];

      fillers.forEach(f => {
        if(formattedList.length < 5 && !formattedList.some(item => item.tag === f.tag)){
          formattedList.push(f);
        }
      });
    }

    return formattedList.slice(0, 5);
  }

  // =========================================================================
  // ABA 1: HUB CENTRAL DO ATLETA
  // =========================================================================
  function renderPlayerHub(state){
    const pState = getCareerState(state);
    const athlete = getControlledPlayer(state);
    if(!pState || !athlete) return `<div class="card" style="padding:24px;color:#fff"><h2>Perfil do atleta indisponível</h2><p>Os dados deste atleta não vieram neste save. Tente restaurar a carreira pela nuvem.</p><button class="btn primary" onclick="window.AFM_PlayerMode.restorePlayerProfile()">☁️ Tentar restaurar save</button></div>`;

    const eng = window.AFM_PlayerEngine;
    const trustRole = eng ? eng.getTrustRole(pState.managerTrust) : { role: 'Reserva', color: '#f59e0b', desc: '' };
    const ovr = athlete.ovr || athlete.overall || 35;
    const energy = athlete.energy ?? athlete.fitness ?? 95;

    // Próximo jogo do clube
    const activeMatch = (typeof window.getActualCurrentMatch === 'function') ? window.getActualCurrentMatch(state) : null;
    const comp = (typeof window.curComp === 'function') ? window.curComp() : null;
    const opp = activeMatch?.opponent || 'Adversário';
    const isHome = activeMatch ? activeMatch.isHome : true;
    const matchDate = activeMatch ? activeMatch.date : state.date;
    const compName = activeMatch?.competitionName || comp?.name || state.competition || 'Campeonato';
    const isMatchToday = String(state.date || '').slice(0, 10) === String(matchDate || '').slice(0, 10);
    const playerNews = getPlayerModeNewsList(state);

    return `
      <div class="afm-player-hub-container" style="display:flex;flex-direction:column;gap:18px">
        
        <!-- CARD PRINCIPAL DO ATLETA (HEADER) -->
        <div class="card" style="background:linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);border:2px solid rgba(168,85,247,0.4);border-radius:20px;padding:22px;box-shadow:0 12px 36px rgba(0,0,0,0.6)">
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px">
            
            <div style="display:flex;align-items:center;gap:18px">
              <div style="width:84px;height:84px;border-radius:18px;overflow:hidden;border:3px solid #a855f7;background:#1e293b;flex-shrink:0;box-shadow:0 6px 20px rgba(168,85,247,0.3)">
                <img src="${athlete.photo || pState.appearance?.customFacePhoto || pState.appearance?.facePhoto || 'img/player_avatars/young_01.webp'}" alt="${esc(athlete.name)}" style="width:100%;height:100%;object-fit:cover" onerror="this.src='img/player_avatars/young_01.webp'">
              </div>
              <div>
                <div style="display:flex;align-items:center;gap:10px">
                  <h1 style="margin:0;font-size:24px;font-weight:900;letter-spacing:0.5px;color:#fff">${esc(athlete.name.toUpperCase())}</h1>
                  <span style="font-size:18px;color:#c084fc;font-weight:900">#${athlete.number}</span>
                  <span class="pill" style="background:#7c3aed;color:#fff;font-size:10px;font-weight:900">${athlete.pos}</span>
                </div>
                <div style="font-size:13px;color:#94a3b8;margin-top:4px;display:flex;align-items:center;gap:12px;flex-wrap:wrap">
                  <span>🏟️ <b>${esc(state.club)}</b></span>
                  <span>🎂 ${pState.age} anos</span>
                  <span>📍 ${esc(pState.city)}/${pState.stateUf}</span>
                  <span>💵 Salário: <b>R$ ${(athlete.wage || 1500).toLocaleString('pt-BR')}/mês</b></span>
                </div>
              </div>
            </div>

            <!-- OVERALL & NÍVEL -->
            <div style="display:flex;align-items:center;gap:14px">
              <div style="background:rgba(0,0,0,0.5);border:1px solid #10b981;border-radius:14px;padding:8px 18px;text-align:center">
                <span style="font-size:28px;font-weight:900;color:#10b981;line-height:1">${ovr}</span>
                <div style="font-size:10px;font-weight:800;color:#94a3b8;letter-spacing:0.5px">OVERALL</div>
              </div>
              <div style="background:rgba(0,0,0,0.5);border:1px solid #a855f7;border-radius:14px;padding:8px 18px;text-align:center">
                <span style="font-size:28px;font-weight:900;color:#c084fc;line-height:1">Nv. ${pState.level || 1}</span>
                <div style="font-size:10px;font-weight:800;color:#94a3b8;letter-spacing:0.5px">${pState.skillPoints || 0} PTS LIVRES</div>
              </div>
            </div>

          </div>

          <!-- BARRAS DE STATUS: CONFIANÇA DO TÉCNICO & FÍSICO -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:20px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.08)">
            
            <!-- Confiança do Treinador -->
            <div>
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                <span style="font-size:12px;font-weight:800;color:#cbd5e1">CONFIANÇA DO TÉCNICO:</span>
                <span style="font-size:12px;font-weight:900;color:${trustRole.color}">${pState.managerTrust}% · ${trustRole.role}</span>
              </div>
              <div style="width:100%;height:10px;background:#334155;border-radius:5px;overflow:hidden">
                <div style="width:${pState.managerTrust}%;height:100%;background:${trustRole.color};border-radius:5px;transition:width 0.3s ease"></div>
              </div>
              <div style="font-size:10px;color:#94a3b8;margin-top:4px">${trustRole.desc}</div>
            </div>

            <!-- Condição Física / Energia -->
            <div>
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                <span style="font-size:12px;font-weight:800;color:#cbd5e1">CONDIÇÃO FÍSICA:</span>
                <span style="font-size:12px;font-weight:900;color:${energy >= 80 ? '#10b981' : energy >= 60 ? '#f59e0b' : '#ef4444'}">${energy}% ${energy >= 85 ? '100% Pronto' : 'Recuperando'}</span>
              </div>
              <div style="width:100%;height:10px;background:#334155;border-radius:5px;overflow:hidden">
                <div style="width:${energy}%;height:100%;background:${energy >= 80 ? '#10b981' : energy >= 60 ? '#f59e0b' : '#ef4444'};border-radius:5px;transition:width 0.3s ease"></div>
              </div>
              <div style="font-size:10px;color:#94a3b8;margin-top:4px">O atleta recupera energia nos dias sem jogo e com staff fisioterapêutico.</div>
            </div>

          </div>
        </div>

        <!-- GRID DE 2 COLUNAS: PRÓXIMO JOGO + NOTÍCIAS RECENTES -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px">
          
          <!-- CARD DO PRÓXIMO JOGO -->
          <div class="card" style="background:#101724;border:1px solid rgba(255,255,255,0.08);border-radius:18px;padding:20px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
              <span style="font-size:13px;font-weight:900;letter-spacing:1px;color:#fff;text-transform:uppercase">⚽ PRÓXIMO COMPROMISSO</span>
              <span class="pill" style="background:rgba(56,189,248,0.15);color:#38bdf8;font-size:10px;font-weight:800">${esc(compName)}</span>
            </div>

            <div style="background:#090d16;border-radius:14px;padding:16px;text-align:center;margin-bottom:14px">
              <div style="font-size:12px;color:#94a3b8;margin-bottom:8px">Data: ${window.formatDatePtBr ? window.formatDatePtBr(matchDate) : matchDate}</div>
              <div style="display:flex;align-items:center;justify-content:center;gap:16px">
                <div style="font-size:16px;font-weight:900;color:#fff">${esc(isHome ? state.club : opp)}</div>
                <span style="font-size:18px;font-weight:900;color:#a855f7">VS</span>
                <div style="font-size:16px;font-weight:900;color:#fff">${esc(isHome ? opp : state.club)}</div>
              </div>
              <div style="font-size:11px;color:#64748b;margin-top:8px">${isHome ? 'Partida em Casa' : 'Partida Fora de Casa'}</div>
            </div>

            <div style="background:rgba(124,58,237,0.1);border:1px solid rgba(124,58,237,0.3);border-radius:10px;padding:10px 14px;display:flex;align-items:center;gap:10px">
              <span style="font-size:20px">📋</span>
              <div style="font-size:12px;color:#cbd5e1">
                Sua projeção para este jogo: <b style="color:${trustRole.color}">${trustRole.role}</b>
              </div>
            </div>

            <!-- BOTÕES DE JOGO / AVANÇO DE CALENDÁRIO (EM TEMPO REAL) -->
            <div style="margin-top:14px;display:flex;flex-direction:column;gap:8px">
              ${isMatchToday ? `
                <button type="button" class="btn primary btn-player-play-live" style="width:100%;padding:13px;font-size:13px;font-weight:900;background:linear-gradient(135deg,#7c3aed,#9333ea);border:none;border-radius:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 6px 18px rgba(124,58,237,0.4)">
                  ▶ JOGAR AO VIVO (EM TEMPO REAL)
                </button>
                <button type="button" class="btn btn-player-play-quick" style="width:100%;padding:10px;font-size:12px;font-weight:800;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);color:#cbd5e1;border-radius:10px;cursor:pointer">
                  ⚡ Simular Rápido
                </button>
              ` : `
                <button type="button" class="btn primary btn-player-advance-to-match" style="width:100%;padding:13px;font-size:13px;font-weight:900;background:linear-gradient(135deg,#06b6d4,#0891b2);border:none;border-radius:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 6px 18px rgba(6,182,212,0.4)">
                  ⏩ AVANÇAR ATÉ O DIA DO JOGO (${window.formatDatePtBr ? window.formatDatePtBr(matchDate) : matchDate})
                </button>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
                  <button type="button" class="btn btn-player-advance-1day" style="padding:10px;font-size:11px;font-weight:800;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);color:#cbd5e1;border-radius:8px;cursor:pointer">
                    📅 Avançar 1 Dia
                  </button>
                  <button type="button" class="btn primary btn-player-play-live" style="padding:10px;font-size:11px;font-weight:900;background:linear-gradient(135deg,#7c3aed,#9333ea);border:none;border-radius:8px;cursor:pointer">
                    ▶ Jogar Direto
                  </button>
                </div>
              `}
            </div>
          </div>

          <!-- FEED DE NOTÍCIAS DO ATLETA E CLUBE -->
          <div class="card" style="background:#101724;border:1px solid rgba(255,255,255,0.08);border-radius:18px;padding:20px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
              <span style="font-size:13px;font-weight:900;letter-spacing:1px;color:#fff;text-transform:uppercase">📰 NOTÍCIAS & IMPRENSA DO ATLETA</span>
              <span style="font-size:11px;color:#64748b">Vida do Atleta & Clube</span>
            </div>

            <div style="display:flex;flex-direction:column;gap:10px;max-height:240px;overflow-y:auto;padding-right:4px">
              ${playerNews.map(n => `
                <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-left:4px solid ${n.borderColor};border-radius:8px;padding:10px 14px;transition:all 0.2s">
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px">
                    <span style="display:inline-flex;align-items:center;gap:5px;font-size:10px;font-weight:900;color:${n.tagColor};letter-spacing:0.5px;text-transform:uppercase">
                      <span>${n.icon}</span> ${n.tag}
                    </span>
                    <span style="font-size:10px;color:rgba(255,255,255,0.4)">${n.time || 'Recente'}</span>
                  </div>
                  <div style="font-size:12px;color:#e2e8f0;line-height:1.45;font-weight:500">
                    ${esc(n.text)}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

        </div>

      </div>
    `;
  }

  // =========================================================================
  // ABA 2: MEU ATLETA & TREINO (EVOLUÇÃO E GASTO DE SKILL POINTS)
  // =========================================================================
  function renderPlayerEvolution(state){
    const pState = getCareerState(state);
    const athlete = getControlledPlayer(state);
    if(!pState || !athlete) return `<div class="card" style="padding:20px;color:#fff">Carregando perfil...</div>`;

    const attrs = window.AFM_PlayerEngine?.getPlayerEffectiveAttributes(state, athlete) || athlete.attributes || { vel:35, chu:35, pas:35, dri:35, def:35, fis:35 };
    const bootsEquipped = (pState.luxuryItems || []).includes('luxury_boots') && pState.luxuryBootsEquipped !== false;
    const sponsorBootBonus = window.AFM_PlayerEngine?.getSponsorBootBonus(pState.sponsorContract) || 0;
    const pending = pState.pendingAttributePoints || (pState.pendingAttributePoints = {});
    const pendingTotal = Object.values(pending).reduce((sum, value) => sum + Math.max(0, Number(value) || 0), 0);
    const sp = Math.max(0, (pState.skillPoints || 0) - pendingTotal);
    const xpPercent = Math.min(100, Math.round(((pState.xp || 0) / (pState.xpToNextLevel || 400)) * 100));

    const trainingOptions = [
      { id: 'finalizacao', label: 'Finalização & Chutes', icon: '🎯', desc: 'Foco em pontaria, chutes colocados e frieza' },
      { id: 'passe', label: 'Passe & Criação', icon: '📐', desc: 'Foco em lançamentos, visão e passes curtos' },
      { id: 'drible', label: 'Drible & Agilidade', icon: '⚡', desc: 'Foco em controle de bola e condução rápida' },
      { id: 'fisico', label: 'Físico & Resistência', icon: '🏋️‍♂️', desc: 'Foco em fôlego, força de arranque e impulsão' },
      { id: 'defesa', label: 'Desarme & Marcação', icon: '🛡️', desc: 'Foco em interceptações, botes e combate' }
    ];

    const attrList = [
      { key: 'vel', label: 'Velocidade & Arranque', val: attrs.vel || 35, icon: '⚡' },
      { key: 'chu', label: 'Finalização & Chute', val: attrs.chu || 35, icon: '⚽' },
      { key: 'pas', label: 'Passe & Visão de Jogo', val: attrs.pas || 35, icon: '🎯' },
      { key: 'dri', label: 'Drible & Agilidade', val: attrs.dri || 35, icon: '🌀' },
      { key: 'def', label: 'Defesa & Desarme', val: attrs.def || 35, icon: '🛡️' },
      { key: 'fis', label: 'Físico & Fôlego', val: attrs.fis || 35, icon: '💪' }
    ];

    return `
      <div style="display:flex;flex-direction:column;gap:18px">
        
        <!-- CARD DE XP & LEVEL UP -->
        <div class="card" style="background:linear-gradient(135deg, #1e1b4b, #0f172a);border:1px solid rgba(168,85,247,0.4);border-radius:18px;padding:20px">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:12px">
            <div>
              <div style="display:flex;align-items:center;gap:10px">
                <span style="font-size:24px">⭐</span>
                <h2 style="margin:0;font-size:20px;font-weight:900;color:#fff">NÍVEL ${pState.level || 1} · EVOLUÇÃO</h2>
              </div>
              <div style="font-size:12px;color:#94a3b8;margin-top:2px">Jogue partidas e treine semanalmente para acumular XP e liberar novos pontos ao subir de nível.</div>
            </div>
            <div style="background:rgba(168,85,247,0.2);border:1px solid #a855f7;border-radius:10px;padding:8px 16px;text-align:right">
              <span style="font-size:11px;font-weight:800;color:#c084fc">PONTOS DISPONÍVEIS:</span>
              <div style="font-size:22px;font-weight:900;color:#fff">${sp} PTS</div>
              <div style="font-size:9px;color:#a855f7;margin-top:2px">${sp > 0 ? 'Prontos para distribuir' : '+2 pts a cada novo nível'}</div>
            </div>
          </div>

          <!-- Barra de XP -->
          <div>
            <div style="display:flex;justify-content:space-between;font-size:11px;font-weight:800;color:#cbd5e1;margin-bottom:4px">
              <span>PROGRESSO PARA O NÍVEL ${(pState.level || 1) + 1}</span>
              <span>${pState.xp || 0} / ${pState.xpToNextLevel || 400} XP (${xpPercent}%)</span>
            </div>
            <div style="width:100%;height:12px;background:#334155;border-radius:6px;overflow:hidden">
              <div style="width:${xpPercent}%;height:100%;background:linear-gradient(90deg, #7c3aed, #10b981);border-radius:6px"></div>
            </div>
          </div>
        </div>

        <!-- GRID: ATRIBUTOS COM GASTO DE PONTOS + SELETOR DE FOCO DE TREINO -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px">
          
          <!-- COLUNA 1: ATRIBUTOS INDIVIDUAIS COM [+] -->
          <div class="card" style="background:#101724;border:1px solid rgba(255,255,255,0.08);border-radius:18px;padding:20px">
            <h3 style="margin:0 0 14px 0;font-size:14px;font-weight:900;color:#fff;text-transform:uppercase;letter-spacing:0.5px">
              📊 ATRIBUTOS DO ATLETA (GASTAR PONTOS)
            </h3>

            <div style="display:flex;flex-direction:column;gap:10px">
              ${attrList.map(a => `
                <div style="background:#090d16;border:1px solid #334155;border-radius:12px;padding:12px 14px;display:flex;align-items:center;justify-content:space-between">
                  <div style="display:flex;align-items:center;gap:10px">
                    <span style="font-size:18px">${a.icon}</span>
                    <span style="font-size:13px;font-weight:800;color:#fff">${a.label}${a.key === 'chu' && (bootsEquipped || sponsorBootBonus) ? ` <small style="color:#facc15">(${bootsEquipped ? '+2 chuteiras' : ''}${bootsEquipped && sponsorBootBonus ? ' · ' : ''}${sponsorBootBonus ? `+${sponsorBootBonus} patrocínio` : ''})</small>` : ''}</span>
                  </div>
                  <div style="display:flex;align-items:center;gap:12px">
                    <span style="font-size:18px;font-weight:900;color:#10b981;min-width:30px;text-align:center">${Math.min(99, a.val + (pending[a.key] || 0))}</span>
                    <button type="button" class="btn btn-decrease-skill" data-attr="${a.key}" ${!pending[a.key] ? 'disabled' : ''} aria-label="Diminuir ${a.label}" style="background:${pending[a.key] ? '#334155' : '#1e293b'};border:none;color:#fff;font-weight:900;width:32px;height:32px;border-radius:8px;cursor:${pending[a.key] ? 'pointer' : 'not-allowed'}">−</button>
                    <button type="button" class="btn btn-upgrade-skill primary" data-attr="${a.key}" ${sp <= 0 || (athlete.attributes?.[a.key] || 35) + (pending[a.key] || 0) >= 99 ? 'disabled' : ''} style="background:${sp > 0 ? '#7c3aed' : '#334155'};border:none;color:#fff;font-weight:900;width:32px;height:32px;border-radius:8px;cursor:${sp > 0 ? 'pointer' : 'not-allowed'}">+</button>
                  </div>
                </div>
              `).join('')}
            </div>
            <button type="button" class="btn btn-confirm-skill-points" ${pendingTotal <= 0 ? 'disabled' : ''} style="margin-top:14px;width:100%;padding:11px;border:0;border-radius:10px;background:${pendingTotal ? '#10b981' : '#334155'};color:#07111d;font-weight:900;cursor:${pendingTotal ? 'pointer' : 'not-allowed'}">✓ Confirmar atributos${pendingTotal ? ` (${pendingTotal} ponto${pendingTotal === 1 ? '' : 's'})` : ''}</button>
          </div>

          <!-- COLUNA 2: SELETOR DE FOCO DE TREINO SEMANAL -->
          <div class="card" style="background:#101724;border:1px solid rgba(255,255,255,0.08);border-radius:18px;padding:20px">
            <h3 style="margin:0 0 14px 0;font-size:14px;font-weight:900;color:#fff;text-transform:uppercase;letter-spacing:0.5px">
              🏋️ FOCO DE TREINO SEMANAL (XP PASSIVO)
            </h3>

            <div style="display:flex;flex-direction:column;gap:10px">
              ${trainingOptions.map(t => {
                const isSel = pState.weeklyTrainingFocus === t.id;
                return `
                  <div class="card-training-option ${isSel ? 'active' : ''}" data-focus="${t.id}" style="background:${isSel ? 'linear-gradient(135deg,rgba(124,58,237,0.3),rgba(168,85,247,0.1))' : '#090d16'};border:2px solid ${isSel ? '#a855f7' : '#334155'};border-radius:12px;padding:12px 14px;cursor:pointer">
                    <div style="display:flex;justify-content:space-between;align-items:center">
                      <div style="display:flex;align-items:center;gap:10px">
                        <span style="font-size:20px">${t.icon}</span>
                        <div>
                          <div style="font-size:13px;font-weight:900;color:#fff">${t.label}</div>
                          <div style="font-size:11px;color:#94a3b8">${t.desc}</div>
                        </div>
                      </div>
                      ${isSel ? '<span class="pill good" style="font-size:9px">ATIVO</span>' : ''}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>

            <div style="font-size:11px;color:#64748b;margin-top:14px;line-height:1.4">
              O foco rende XP ao avançar o calendário e dá 10% de chance, uma vez por mês, de aumentar em 1 um atributo relacionado (limite 99).
            </div>

            <!-- MINIGAME DE BOLAS PARADAS (PÊNALTIS E FALTAS) -->
            <div style="margin-top:18px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.08)">
              <div style="font-size:12px;font-weight:900;color:#facc15;margin-bottom:8px;display:flex;align-items:center;gap:6px">
                🎯 TREINAMENTO PRÁTICO EM CAMPO:
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
                <button type="button" class="btn btn-practice-penalty" style="background:linear-gradient(135deg,rgba(250,204,21,0.22),rgba(234,179,8,0.1));border:1px solid #facc15;color:#fef08a;font-size:11px;font-weight:900;padding:10px 8px;border-radius:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:5px">
                  ⚽ Treinar Pênaltis
                </button>
                <button type="button" class="btn btn-practice-freekick" style="background:linear-gradient(135deg,rgba(56,189,248,0.22),rgba(14,165,233,0.1));border:1px solid #38bdf8;color:#bae6fd;font-size:11px;font-weight:900;padding:10px 8px;border-radius:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:5px">
                  🎯 Treinar Faltas
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    `;
  }

  // =========================================================================
  // ABA 3: CLUBE & ELENCO (HIERARQUIA DA POSIÇÃO NO TIME)
  // =========================================================================
  function renderPlayerClubAndSquad(state){
    const athlete = getControlledPlayer(state);
    const pState = getCareerState(state);
    if(!athlete || !pState) return `<div class="card" style="padding:20px;color:#fff">Carregando elenco...</div>`;

    const myPos = (athlete.pos || 'ATA').toUpperCase();
    const samePosPlayers = (state.squad || []).filter(p => (p.pos || p.position || '').toUpperCase() === myPos);
    samePosPlayers.sort((a,b) => (b.ovr || b.overall || 35) - (a.ovr || a.overall || 35));
    const squad = state.squad || [];
    const marketValue = getPlayerMarketValueBrl;
    const monthlyWage = p => Math.round(Number(p.wage || p.salary || p.monthlySalary) || 0);
    const highestValue = squad.reduce((best, p) => marketValue(p) > marketValue(best || {}) ? p : best, null);
    const highestWage = squad.reduce((best, p) => monthlyWage(p) > monthlyWage(best || {}) ? p : best, null);
    const arrears = pState.clubSalaryArrears || { amount: 0, months: 0, claim: null };
    const clubSubTab = window.__afmPlayerClubSubTab === 'debts' ? 'debts' : 'squad';

    return `
      <div style="display:flex;flex-direction:column;gap:18px">
        <div role="tablist" aria-label="Abas do clube" style="display:flex;gap:10px;flex-wrap:wrap;border-bottom:1px solid rgba(255,255,255,.1);padding-bottom:10px">
          <button type="button" role="tab" aria-selected="${clubSubTab === 'squad'}" aria-controls="player-club-tab-content" class="btn btn-player-club-subtab ${clubSubTab === 'squad' ? 'primary' : ''}" data-subtab="squad">👥 Elenco & Valores</button>
          <button type="button" role="tab" aria-selected="${clubSubTab === 'debts'}" aria-controls="player-club-tab-content" class="btn btn-player-club-subtab ${clubSubTab === 'debts' ? 'primary' : ''}" data-subtab="debts">⚖️ Dívidas do Clube ${Number(arrears.amount) > 0 ? `· R$ ${Math.round(Number(arrears.amount)).toLocaleString('pt-BR')}` : ''}</button>
        </div>
        <div id="player-club-tab-content" role="tabpanel" style="display:flex;flex-direction:column;gap:18px">
        ${clubSubTab === 'squad' ? `
        <!-- HIERARQUIA DA SUA POSIÇÃO NO CLUBE -->
        <div class="card" style="background:#101724;border:1px solid rgba(255,255,255,0.08);border-radius:18px;padding:20px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
            <div>
              <h3 style="margin:0;font-size:15px;font-weight:900;color:#fff;text-transform:uppercase;letter-spacing:0.5px">
                👥 HIERARQUIA NA POSIÇÃO: ${myPos}
              </h3>
              <div style="font-size:11px;color:#94a3b8;margin-top:2px">Sua disputa direta por vaga no time titular com outros atletas do ${esc(state.club)}.</div>
            </div>
          </div>

          <div style="display:flex;flex-direction:column;gap:8px">
            ${samePosPlayers.map((p, idx) => {
              const isUser = p.id === state.controlledPlayerId;
              return `
                <div style="background:${isUser ? 'linear-gradient(135deg,rgba(124,58,237,0.3),rgba(16,185,129,0.1))' : '#090d16'};border:2px solid ${isUser ? '#a855f7' : '#334155'};border-radius:12px;padding:12px 16px;display:flex;align-items:center;justify-content:space-between">
                  <div style="display:flex;align-items:center;gap:12px">
                    <span style="font-size:14px;font-weight:900;color:${isUser ? '#c084fc' : '#94a3b8'}">#${idx + 1}</span>
                    <div>
                      <div style="font-size:14px;font-weight:900;color:#fff;display:flex;align-items:center;gap:8px">
                        ${esc(p.name)}
                        ${isUser ? '<span class="pill primary" style="font-size:9px">VOCÊ</span>' : ''}
                      </div>
                      <div style="font-size:11px;color:#94a3b8">${p.age || 22} anos · Camisa #${p.number || 10}</div>
                    </div>
                  </div>
                  <div style="display:flex;align-items:center;gap:14px">
                    <span style="font-size:18px;font-weight:900;color:#10b981">${p.ovr || p.overall || 35} OVR</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- ELENCO COMPLETO DO CLUBE -->
        <div class="card" style="background:#101724;border:1px solid rgba(255,255,255,0.08);border-radius:18px;padding:20px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
            <h3 style="margin:0;font-size:15px;font-weight:900;color:#fff;text-transform:uppercase;letter-spacing:0.5px">
              📋 ELENCO COMPLETO DO ${esc(state.club.toUpperCase())}
            </h3>
            <span style="font-size:11px;color:#94a3b8">${(state.squad || []).length} Atletas</span>
          </div>

          <div class="tablewrap" style="overflow-x:auto">
            <table class="table" style="width:100%;border-collapse:collapse;font-size:12px">
              <thead>
                <tr style="border-bottom:1px solid rgba(255,255,255,0.1);color:#94a3b8;text-align:left">
                  <th style="padding:8px">#</th>
                  <th style="padding:8px">Nome</th>
                  <th style="padding:8px;text-align:center">Pos</th>
                  <th style="padding:8px;text-align:center">Idade</th>
                  <th style="padding:8px;text-align:center">OVR</th>
                  <th style="padding:8px;text-align:right">Valor de mercado</th>
                  <th style="padding:8px;text-align:right">Salário/mês</th>
                  <th style="padding:8px;text-align:center">Status</th>
                </tr>
              </thead>
              <tbody>
                ${(state.squad || []).map(p => {
                  const isUser = p.id === state.controlledPlayerId;
                  return `
                    <tr style="border-bottom:1px solid rgba(255,255,255,0.04);background:${isUser ? 'rgba(124,58,237,0.15)' : 'transparent'};color:${isUser ? '#c084fc' : '#fff'};font-weight:${isUser ? '900' : '500'}">
                      <td style="padding:8px">${p.number || 10}</td>
                      <td style="padding:8px">${esc(p.name)} ${isUser ? '<span class="pill primary" style="font-size:8px">VOCÊ</span>' : ''}</td>
                      <td style="padding:8px;text-align:center">${p.pos}</td>
                      <td style="padding:8px;text-align:center">${p.age || 20}</td>
                      <td style="padding:8px;text-align:center;font-weight:900;color:#10b981">${p.ovr || p.overall || 35}</td>
                      <td style="padding:8px;text-align:right">R$ ${marketValue(p).toLocaleString('pt-BR')}</td>
                      <td style="padding:8px;text-align:right">R$ ${monthlyWage(p).toLocaleString('pt-BR')}</td>
                      <td style="padding:8px;text-align:center">${isUser ? (pState.managerTrust >= 60 ? 'Titular' : 'Reserva') : 'Plantel'}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="card" style="background:#101724;border:1px solid rgba(255,255,255,0.08);border-radius:18px;padding:18px">
          <h3 style="margin:0 0 12px;color:#fff;font-size:14px">🔎 REFERÊNCIAS DO ELENCO</h3>
          <div style="display:flex;flex-wrap:wrap;gap:12px">
            <div style="flex:1;min-width:220px;background:#090d16;padding:12px;border-radius:10px;color:#cbd5e1">💎 Maior valor: <b style="color:#c084fc">${esc(highestValue?.name || '—')}</b> · R$ ${marketValue(highestValue || {}).toLocaleString('pt-BR')}</div>
            <div style="flex:1;min-width:220px;background:#090d16;padding:12px;border-radius:10px;color:#cbd5e1">💰 Maior salário: <b style="color:#34d399">${esc(highestWage?.name || '—')}</b> · R$ ${monthlyWage(highestWage || {}).toLocaleString('pt-BR')}/mês</div>
          </div>
        </div>
        ` : ''}

        ${clubSubTab === 'debts' ? `<div class="card" style="background:#101724;border:1px solid ${Number(arrears.amount) > 0 ? '#f59e0b' : 'rgba(255,255,255,0.08)'};border-radius:18px;padding:18px;color:#cbd5e1">
          <h3 style="margin:0 0 8px;color:#fff;font-size:14px">⚖️ SALÁRIOS ATRASADOS & DÍVIDA DO CLUBE</h3>
          ${Number(arrears.amount) > 0 ? `<p>O ${esc(state.club)} deve <b style="color:#fbbf24">R$ ${Math.round(Number(arrears.amount)).toLocaleString('pt-BR')}</b> em ${Number(arrears.months) || 0} mês(es) de salário.</p>
            ${arrears.claim?.status === 'pending' ? `<p>Processo em andamento com ${Number(arrears.claim.monthsRemaining) || 0} mês(es) estimado(s).</p>` : `<button type="button" id="btnPlayerSalaryClaim" class="btn" style="padding:9px 14px" ${Number(pState.personalBank) < Math.max(300, Math.min(1000, Math.round(Number(arrears.amount) * 0.08))) ? 'disabled' : ''}>👨‍⚖️ Contratar advogado e cobrar (R$ ${Math.max(300, Math.min(1000, Math.round(Number(arrears.amount) * 0.08))).toLocaleString('pt-BR')})</button>`}`
            : '<p>Não há salários atrasados registrados.</p>'}
        </div>` : ''}
        </div>
      </div>
    `;
  }

  // =========================================================================
  // ABA 4: EMPRESÁRIO & MERCADO (AÇÕES DO ATLETA & PROPOSTAS)
  // =========================================================================
  function renderPlayerAgentAndMarket(state){
    const athlete = getControlledPlayer(state);
    const pState = getCareerState(state);
    if(!athlete || !pState) return `<div class="card" style="padding:20px;color:#fff">Carregando empresário...</div>`;
    const controlledMarketValueMi = formatPlayerMarketValueMi(athlete);

    // Ao acessar a aba Empresário & Mercado, marca automaticamente as propostas como lidas para limpar a notificação
    if(Array.isArray(pState.agentOffers)){
      pState.agentOffers.forEach(o => { o.isRead = true; });
    }

    const isWinOpen = (typeof isTransferWindowOpen === 'function') ? isTransferWindowOpen(state.date) : false;
    const winInfo = (typeof getTransferWindowInfo === 'function') ? getTransferWindowInfo(state.date) : { open: false, text: 'Janela Fechada' };
    const transferListing = pState.transferListing?.status === 'active' ? pState.transferListing : null;

    return `
      <div style="display:flex;flex-direction:column;gap:18px">
        ${transferListing ? `<div class="card" style="padding:16px;border:1px solid #a855f7;background:rgba(124,58,237,.12);color:#e2e8f0">
          <b style="color:#c084fc">📋 LISTA DE ${transferListing.type === 'loan' ? 'EMPRÉSTIMO' : 'TRANSFERÊNCIA'} ATIVA</b>
          <div style="font-size:12px;margin-top:5px">O ${esc(transferListing.club || state.club)} aceitou seu pedido. ${isWinOpen ? 'Propostas podem chegar após as partidas desta janela.' : 'Seu empresário buscará propostas quando a janela de transferências abrir.'}</div>
        </div>` : ''}
        
        <!-- CARD DA JANELA OFICIAL DE TRANSFERÊNCIAS (IDÊNTICO AO MODO TREINADOR) -->
        <div class="card" style="background:linear-gradient(135deg, #090d16, #1e1b4b);border:1px solid ${isWinOpen ? '#10b981' : 'rgba(255,255,255,0.12)'};border-radius:18px;padding:22px">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:14px">
            <div style="display:flex;align-items:center;gap:12px">
              <span style="font-size:26px">${isWinOpen ? '🟢' : '🔴'}</span>
              <div>
                <h3 style="margin:0;font-size:16px;font-weight:900;color:#fff;text-transform:uppercase;letter-spacing:0.5px">
                  Janela Oficial de Transferências
                </h3>
                <span class="pill ${isWinOpen ? 'good' : 'muted'}" style="font-size:11px;font-weight:900;margin-top:4px">
                  ${isWinOpen ? 'JANELA ABERTA NO CALENDÁRIO' : (winInfo.text || 'JANELA FECHADA')}
                </span>
              </div>
            </div>
            <div style="text-align:right">
              <span style="font-size:11px;color:#94a3b8">DATA ATUAL NO JOGO:</span>
              <div style="font-size:15px;font-weight:900;color:#38bdf8">${window.formatDatePtBr ? window.formatDatePtBr(state.date) : state.date}</div>
            </div>
          </div>

          <!-- DATAS OFICIAIS IDENTICAS AO MODO TREINADOR -->
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:12px;margin-bottom:14px">
            <div style="background:rgba(0,0,0,0.3);border-left:4px solid #f59e0b;border-radius:10px;padding:12px">
              <div style="font-size:11px;font-weight:800;color:#fbbf24">☀️ JANELA DE VERÃO (Início de Temporada)</div>
              <div style="font-size:14px;font-weight:900;color:#fff;margin-top:3px">01/Jan a 01/Mar</div>
              <div style="font-size:11px;color:#94a3b8;margin-top:4px">Período oficial de contratações definitivas, empréstimos e montagem do elenco para estaduais e início das ligas.</div>
            </div>
            <div style="background:rgba(0,0,0,0.3);border-left:4px solid #06b6d4;border-radius:10px;padding:12px">
              <div style="font-size:11px;font-weight:800;color:#38bdf8">❄️ JANELA DE INVERNO (Meio de Temporada)</div>
              <div style="font-size:14px;font-weight:900;color:#fff;margin-top:3px">01/Jun a 01/Ago</div>
              <div style="font-size:11px;color:#94a3b8;margin-top:4px">Período de reforços e ajustes do elenco para o segundo semestre e retas decisivas do Brasileirão e Copas.</div>
            </div>
          </div>

          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;background:${isWinOpen ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)'};border:1px solid ${isWinOpen ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'};border-radius:10px;padding:12px;gap:10px">
            <div style="font-size:12px;color:${isWinOpen ? '#a7f3d0' : '#fca5a5'}">
              ${isWinOpen 
                ? '✨ <b>Período de Negociações Ativo!</b> Clubes podem enviar propostas e seu empresário pode prospectar novos contratos no mercado.' 
                : '🔒 <b>Janela Fechada.</b> Clubes não podem registrar novas contratações no BID no momento. Foco total em treinar e jogar!'}
            </div>
            ${isWinOpen ? `
              <button type="button" class="btn success btn-scout-transfer-market" style="background:#10b981;color:#000;font-weight:900;font-size:12px;padding:8px 16px;border-radius:8px;border:none;cursor:pointer;white-space:nowrap">
                🔍 Buscar Propostas na Janela
              </button>
            ` : ''}
          </div>
        </div>

        <!-- CARD DO CONTRATO ATUAL COM O CLUBE -->
        <div class="card" style="background:linear-gradient(135deg, #101724, #1e1b4b);border:1px solid rgba(168,85,247,0.4);border-radius:18px;padding:22px">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px;margin-bottom:16px">
            <div>
              <span class="pill good" style="font-size:10px;font-weight:900">CONTRATO PROFISSIONAL ATIVO</span>
              <h2 style="margin:4px 0 0 0;font-size:22px;font-weight:900;color:#fff">${esc(state.club)}</h2>
            </div>
            <div style="text-align:right">
              <span style="font-size:11px;color:#94a3b8">VALOR DE MERCADO ESTIMADO:</span>
              <div style="font-size:20px;font-weight:900;color:#10b981">R$ ${controlledMarketValueMi.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})} Milhões</div>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:12px;background:rgba(0,0,0,0.3);border-radius:12px;padding:14px;margin-bottom:18px">
            <div>
              <span style="font-size:11px;color:#94a3b8">Salário Mensal:</span>
              <div style="font-size:16px;font-weight:900;color:#fff">R$ ${(athlete.wage || 1500).toLocaleString('pt-BR')}</div>
            </div>
            <div>
              <span style="font-size:11px;color:#94a3b8">Duração do Vínculo:</span>
              <div style="font-size:16px;font-weight:900;color:#fff">Até Dezembro de ${athlete.contractUntil || 2028}</div>
            </div>
            <div>
              <span style="font-size:11px;color:#94a3b8">Multa Rescisória:</span>
              <div style="font-size:16px;font-weight:900;color:#fff">R$ 5.000.000</div>
            </div>
          </div>

          <!-- BOTÕES DE AÇÃO DO ATLETA COM A DIRETORIA E EMPRESÁRIO -->
          <div>
            <label style="font-size:11px;font-weight:800;color:#94a3b8;display:block;margin-bottom:8px">AÇÕES DISPONÍVEIS:</label>
            <div style="display:flex;gap:10px;flex-wrap:wrap">
              ${(function(){
                const reqs = pState.actionRequests || {};
                
                // 1. Aumento Salarial
                const wReq = reqs.wage_increase;
                let wText = '💰 Pedir Aumento Salarial';
                let wStyle = 'background:#1e293b;border:1px solid #334155;color:#fff;';
                if(wReq?.status === 'accepted'){
                  wText = `✅ SOLICITAÇÃO ACEITA (R$ ${(athlete.wage || 1500).toLocaleString('pt-BR')}/mês)`;
                  wStyle = 'background:rgba(16,185,129,0.18);border:1.5px solid #10b981;color:#6ee7b7;box-shadow:0 0 12px rgba(16,185,129,0.3);';
                } else if(wReq?.status === 'rejected'){
                  wText = '❌ SOLICITAÇÃO RECUSADA (Aumento Negado)';
                  wStyle = 'background:rgba(239,68,68,0.18);border:1.5px solid #ef4444;color:#fca5a5;box-shadow:0 0 12px rgba(239,68,68,0.3);';
                }

                // 2. Exigir Titularidade
                const sReq = reqs.demand_starter;
                let sText = '⭐ Exigir Titularidade';
                let sStyle = 'background:#1e293b;border:1px solid #334155;color:#fff;';
                if(sReq?.status === 'accepted'){
                  sText = '✅ SOLICITAÇÃO ACEITA (Titular Prometido)';
                  sStyle = 'background:rgba(16,185,129,0.18);border:1.5px solid #10b981;color:#6ee7b7;box-shadow:0 0 12px rgba(16,185,129,0.3);';
                } else if(sReq?.status === 'rejected'){
                  sText = '❌ SOLICITAÇÃO RECUSADA (Paciência Exigida)';
                  sStyle = 'background:rgba(239,68,68,0.18);border:1.5px solid #ef4444;color:#fca5a5;box-shadow:0 0 12px rgba(239,68,68,0.3);';
                }

                // 3. Solicitar Empréstimo
                const lReq = reqs.request_loan;
                let lText = '✈️ Solicitar Empréstimo';
                let lStyle = 'background:#1e293b;border:1px solid #334155;color:#fff;';
                if(lReq?.status === 'accepted'){
                  lText = '✅ SOLICITAÇÃO ACEITA (Liberado p/ Empréstimo)';
                  lStyle = 'background:rgba(16,185,129,0.18);border:1.5px solid #10b981;color:#6ee7b7;box-shadow:0 0 12px rgba(16,185,129,0.3);';
                } else if(lReq?.status === 'rejected'){
                  lText = '❌ SOLICITAÇÃO RECUSADA (Empréstimo Vetado)';
                  lStyle = 'background:rgba(239,68,68,0.18);border:1.5px solid #ef4444;color:#fca5a5;box-shadow:0 0 12px rgba(239,68,68,0.3);';
                }

                // 4. Solicitar Transferência
                const tReq = reqs.request_transfer;
                let tText = '🔄 Solicitar Transferência';
                let tStyle = 'background:#1e293b;border:1px solid #334155;color:#fff;';
                if(tReq?.status === 'accepted'){
                  tText = '✅ SOLICITAÇÃO ACEITA (Na Lista de Vendas)';
                  tStyle = 'background:rgba(16,185,129,0.18);border:1.5px solid #10b981;color:#6ee7b7;box-shadow:0 0 12px rgba(16,185,129,0.3);';
                } else if(tReq?.status === 'rejected'){
                  tText = '❌ SOLICITAÇÃO RECUSADA (Venda Bloqueada)';
                  tStyle = 'background:rgba(239,68,68,0.18);border:1.5px solid #ef4444;color:#fca5a5;box-shadow:0 0 12px rgba(239,68,68,0.3);';
                }

                return `
                  <button type="button" class="btn btn-agent-action" data-action="wage_increase" style="${wStyle}font-weight:800;padding:10px 16px;border-radius:10px;cursor:pointer;display:inline-flex;align-items:center;gap:6px">
                    ${wText}
                  </button>
                  <button type="button" class="btn btn-agent-action" data-action="demand_starter" style="${sStyle}font-weight:800;padding:10px 16px;border-radius:10px;cursor:pointer;display:inline-flex;align-items:center;gap:6px">
                    ${sText}
                  </button>
                  <button type="button" class="btn btn-agent-action" data-action="request_loan" style="${lStyle}font-weight:800;padding:10px 16px;border-radius:10px;cursor:pointer;display:inline-flex;align-items:center;gap:6px">
                    ${lText}
                  </button>
                  <button type="button" class="btn btn-agent-action" data-action="request_transfer" style="${tStyle}font-weight:800;padding:10px 16px;border-radius:10px;cursor:pointer;display:inline-flex;align-items:center;gap:6px">
                    ${tText}
                  </button>
                `;
              })()}
            </div>
          </div>
        </div>

        <!-- CARD DO EMPRESÁRIO CONTRATADO & GESTÃO DE CARREIRA -->
        ${(function(){
          const agent = window.AFM_PlayerEngine?.getPlayerAgent 
            ? window.AFM_PlayerEngine.getPlayerAgent(pState) 
            : { name: 'Família & Amigo de Infância', agency: 'Gestão Familiar Amadora', icon: '👨‍👦', monthlySalary: 0, transferCommissionPct: 3, sponsorCommissionPct: 5, negotiationPower: 'Básico', clubTierAccess: 'Regional / Série D', reputationStars: 1, description: 'Pessoas de confiança da família.' };
          
          return `
            <div class="card" style="background:linear-gradient(135deg, #0b1329 0%, #171738 100%);border:2px solid #6366f1;border-radius:18px;padding:22px;box-shadow:0 0 20px rgba(99,102,241,0.18)">
              <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:16px">
                <div style="display:flex;align-items:center;gap:14px">
                  <span style="font-size:36px;background:rgba(99,102,241,0.2);padding:10px;border-radius:14px;border:1px solid #6366f1">${agent.icon || '💼'}</span>
                  <div>
                    <div style="display:flex;align-items:center;gap:8px">
                      <span class="pill primary" style="font-size:10px;font-weight:900">REPRESENTAÇÃO PROFISSIONAL ATIVA</span>
                      <span style="color:#fbbf24;font-size:12px">${'⭐'.repeat(agent.reputationStars || 1)}</span>
                    </div>
                    <h2 style="margin:4px 0 0 0;font-size:22px;font-weight:900;color:#fff">${esc(agent.name)}</h2>
                    <div style="font-size:12px;color:#a5b4fc;font-weight:700">${esc(agent.agency || 'Agência Credenciada')}</div>
                  </div>
                </div>
                <div>
                  <button type="button" class="btn btn-open-agent-modal" style="background:linear-gradient(135deg, #6366f1, #4f46e5);color:#fff;font-weight:900;font-size:12px;padding:10px 18px;border-radius:10px;border:none;cursor:pointer;display:inline-flex;align-items:center;gap:8px;box-shadow:0 4px 14px rgba(99,102,241,0.4)">
                    🔄 Trocar Empresário / Ver Agências
                  </button>
                </div>
              </div>

              <!-- DADOS CONTRATUAIS DO EMPRESÁRIO -->
              <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:12px;background:rgba(0,0,0,0.35);border-radius:12px;padding:14px;margin-bottom:14px">
                <div>
                  <span style="font-size:11px;color:#94a3b8">Salário / Taxa Mensal:</span>
                  <div style="font-size:16px;font-weight:900;color:${agent.monthlySalary > 0 ? '#fca5a5' : '#10b981'}">
                    ${agent.monthlySalary > 0 ? `R$ ${agent.monthlySalary.toLocaleString('pt-BR')}/mês` : 'Isento (R$ 0)'}
                  </div>
                </div>
                <div>
                  <span style="font-size:11px;color:#94a3b8">Comissão em Vendas:</span>
                  <div style="font-size:16px;font-weight:900;color:#38bdf8">${agent.transferCommissionPct || 7}% das Luvas/Venda</div>
                </div>
                <div>
                  <span style="font-size:11px;color:#94a3b8">Comissão em Patrocínios:</span>
                  <div style="font-size:16px;font-weight:900;color:#cbd5e1">${agent.sponsorCommissionPct || 8}%</div>
                </div>
                <div>
                  <span style="font-size:11px;color:#94a3b8">Poder de Barganha:</span>
                  <div style="font-size:14px;font-weight:900;color:#a855f7">${esc(agent.negotiationPower || 'Básico')}</div>
                </div>
              </div>

              <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;font-size:12px;color:#94a3b8;border-top:1px solid rgba(255,255,255,0.08);padding-top:10px">
                <div>🌐 <b>Alcance de Mercado:</b> <span style="color:#e2e8f0">${esc(agent.clubTierAccess || 'Regional')}</span></div>
                <div style="font-style:italic">"${esc(agent.description || '')}"</div>
              </div>
            </div>
          `;
        })()}

        <!-- LISTA DE PROPOSTAS DE CLUBES DA IA (CATEGORIZADAS E COM NOTIFICAÇÃO) -->
        ${(function(){
          const curCat = window.__afmAgentOfferCategory || 'all';
          const offers = (pState.agentOffers || []).map((o, idx) => ({ ...o, __originalIndex: idx }));
          
          const totalCount = offers.length;
          const unreadTotal = offers.filter(o => !o.isRead).length;

          const countSponsor = offers.filter(o => o.type === 'sponsor').length;
          const unreadSponsor = offers.filter(o => o.type === 'sponsor' && !o.isRead).length;

          const countTransfer = offers.filter(o => o.type === 'transfer').length;
          const unreadTransfer = offers.filter(o => o.type === 'transfer' && !o.isRead).length;

          const countLoan = offers.filter(o => o.type === 'club_loan').length;
          const unreadLoan = offers.filter(o => o.type === 'club_loan' && !o.isRead).length;

          const filtered = offers.filter(o => {
            if(curCat === 'sponsor') return o.type === 'sponsor';
            if(curCat === 'transfer') return o.type === 'transfer';
            if(curCat === 'loan') return o.type === 'club_loan';
            return true;
          });

          return `
            <div class="card" style="background:#101724;border:1px solid rgba(255,255,255,0.08);border-radius:18px;padding:22px">
              <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:16px">
                <div style="display:flex;align-items:center;gap:10px">
                  <h3 style="margin:0;font-size:16px;font-weight:900;color:#fff;text-transform:uppercase;letter-spacing:0.5px;display:flex;align-items:center;gap:8px">
                    📬 PROPOSTAS NA MESA DO EMPRESÁRIO
                  </h3>
                  ${unreadTotal > 0 ? `
                    <span style="background:rgba(239,68,68,0.2);border:1px solid #ef4444;color:#fca5a5;font-size:11px;font-weight:900;padding:2px 8px;border-radius:12px">
                      🔴 ${unreadTotal} nova${unreadTotal > 1 ? 's' : ''}
                    </span>
                  ` : ''}
                </div>
                ${unreadTotal > 0 ? `
                  <button type="button" class="btn" id="btnMarkAllOffersRead" style="background:rgba(56,189,248,0.15);border:1px solid #38bdf8;color:#38bdf8;font-size:11px;font-weight:800;padding:6px 14px;border-radius:8px;cursor:pointer">
                    👁️ Marcar Todas como Lidas (${unreadTotal})
                  </button>
                ` : ''}
              </div>

              <!-- ABAS DE CATEGORIAS -->
              <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:14px">
                <button type="button" class="btn btn-agent-category" data-category="all" style="background:${curCat === 'all' ? '#7c3aed' : '#1e293b'};color:#fff;border:1px solid ${curCat === 'all' ? '#a855f7' : '#334155'};font-size:12px;font-weight:900;padding:8px 16px;border-radius:10px;cursor:pointer;display:inline-flex;align-items:center;gap:6px">
                  Todas (${totalCount})
                  ${unreadTotal > 0 ? `<span style="background:#ef4444;color:#fff;border-radius:10px;padding:1px 6px;font-size:10px">${unreadTotal}</span>` : ''}
                </button>
                <button type="button" class="btn btn-agent-category" data-category="sponsor" style="background:${curCat === 'sponsor' ? '#0891b2' : '#1e293b'};color:#fff;border:1px solid ${curCat === 'sponsor' ? '#06b6d4' : '#334155'};font-size:12px;font-weight:900;padding:8px 16px;border-radius:10px;cursor:pointer;display:inline-flex;align-items:center;gap:6px">
                  📦 Patrocínios (${countSponsor})
                  ${unreadSponsor > 0 ? `<span style="background:#ef4444;color:#fff;border-radius:10px;padding:1px 6px;font-size:10px">${unreadSponsor}</span>` : ''}
                </button>
                <button type="button" class="btn btn-agent-category" data-category="transfer" style="background:${curCat === 'transfer' ? '#9333ea' : '#1e293b'};color:#fff;border:1px solid ${curCat === 'transfer' ? '#c084fc' : '#334155'};font-size:12px;font-weight:900;padding:8px 16px;border-radius:10px;cursor:pointer;display:inline-flex;align-items:center;gap:6px">
                  ✈️ Transferências (${countTransfer})
                  ${unreadTransfer > 0 ? `<span style="background:#ef4444;color:#fff;border-radius:10px;padding:1px 6px;font-size:10px">${unreadTransfer}</span>` : ''}
                </button>
                <button type="button" class="btn btn-agent-category" data-category="loan" style="background:${curCat === 'loan' ? '#d97706' : '#1e293b'};color:#fff;border:1px solid ${curCat === 'loan' ? '#f59e0b' : '#334155'};font-size:12px;font-weight:900;padding:8px 16px;border-radius:10px;cursor:pointer;display:inline-flex;align-items:center;gap:6px">
                  📋 Empréstimos (${countLoan})
                  ${unreadLoan > 0 ? `<span style="background:#ef4444;color:#fff;border-radius:10px;padding:1px 6px;font-size:10px">${unreadLoan}</span>` : ''}
                </button>
              </div>

              <!-- LISTAGEM DE PROPOSTAS -->
              ${filtered.length > 0 ? `
                <div style="display:flex;flex-direction:column;gap:12px">
                  ${filtered.map(o => {
                    const isUnread = !o.isRead;
                    const isClubOffer = (o.type === 'transfer' || o.type === 'club_loan');
                    const isWinOpen = (typeof isTransferWindowOpen === 'function')
                      ? isTransferWindowOpen(state.date)
                      : false;

                    const catTag = o.type === 'sponsor'
                      ? `<span style="background:rgba(6,182,212,0.15);border:1px solid #06b6d4;color:#67e8f9;padding:3px 8px;border-radius:6px;font-size:10px;font-weight:900">📦 PATROCÍNIO ESPORTIVO</span>`
                      : (o.type === 'transfer'
                        ? `<span style="background:rgba(168,85,247,0.15);border:1px solid #a855f7;color:#d8b4fe;padding:3px 8px;border-radius:6px;font-size:10px;font-weight:900">✈️ COMPRA DEFINITIVA</span>`
                        : `<span style="background:rgba(245,158,11,0.15);border:1px solid #f59e0b;color:#fde68a;padding:3px 8px;border-radius:6px;font-size:10px;font-weight:900">📋 EMPRÉSTIMO</span>`);

                    const winBadge = isClubOffer
                      ? (isWinOpen
                          ? `<span style="background:rgba(34,197,94,0.15);border:1px solid #22c55e;color:#86efac;font-size:10px;font-weight:900;padding:2px 8px;border-radius:12px">🟢 JANELA ABERTA</span>`
                          : `<span style="background:rgba(239,68,68,0.15);border:1px solid #ef4444;color:#fca5a5;font-size:10px;font-weight:900;padding:2px 8px;border-radius:12px">🔒 JANELA FECHADA</span>`)
                      : '';

                    return `
                      <div class="agent-offer-card" data-index="${o.__originalIndex}" style="background:${isUnread ? 'linear-gradient(135deg, rgba(239,68,68,0.07) 0%, #090d16 100%)' : '#090d16'};border:2px solid ${isUnread ? '#ef4444' : '#334155'};border-radius:14px;padding:16px;box-shadow:${isUnread ? '0 0 16px rgba(239,68,68,0.22)' : 'none'};transition:all 0.2s ease">
                        
                        <!-- HEADER DO CARD: CATEGORIA + NOTIFICAÇÃO STATUS -->
                        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:8px">
                          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                            ${catTag}
                            ${winBadge}
                            ${isUnread ? `
                              <span style="display:inline-flex;align-items:center;gap:5px;background:rgba(239,68,68,0.2);border:1px solid #ef4444;color:#fca5a5;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:900;letter-spacing:0.5px">
                                <span style="width:6px;height:6px;border-radius:50%;background:#ef4444;display:inline-block;box-shadow:0 0 6px #ef4444"></span>
                                🔴 NOVA / NÃO LIDA
                              </span>
                            ` : `
                              <span style="display:inline-flex;align-items:center;gap:4px;background:rgba(148,163,184,0.1);border:1px solid rgba(148,163,184,0.25);color:#94a3b8;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:800">
                                ✓ LIDA
                              </span>
                            `}
                          </div>
                          <div style="font-size:11px;color:#64748b;font-weight:700">
                            ${o.date ? formatDatePtBr(o.date) : 'Disponível'}
                          </div>
                        </div>

                        <!-- CORPO DO CARD: TÍTULO, DETALHES E BOTÕES -->
                        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-top:6px">
                          <div>
                            <div style="font-size:15px;font-weight:900;color:#fff">${esc(o.title || o.clubOrBrand)}</div>
                            <div style="font-size:12px;color:#cbd5e1;margin-top:4px;line-height:1.4">${esc(o.details || '')}</div>
                          </div>

                          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
                            ${isUnread ? `
                              <button type="button" class="btn btn-mark-offer-read" data-index="${o.__originalIndex}" style="background:rgba(255,255,255,0.06);border:1px solid #64748b;color:#cbd5e1;font-size:11px;font-weight:800;padding:8px 12px;border-radius:8px;cursor:pointer">
                                👁️ Marcar Lida
                              </button>
                            ` : ''}
                            <button type="button" class="btn btn-view-offer-details" data-index="${o.__originalIndex}" title="Ver detalhes da negociação e parecer do empresário" style="background:rgba(56,189,248,0.15);border:1.5px solid #38bdf8;color:#38bdf8;font-size:12px;font-weight:900;padding:8px 14px;border-radius:8px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;box-shadow:0 0 10px rgba(56,189,248,0.2);transition:all 0.2s ease">
                              🔍 Detalhes
                            </button>
                            <button type="button" class="btn success btn-accept-offer" data-index="${o.__originalIndex}" style="background:#10b981;color:#000;font-weight:900;padding:8px 16px;border-radius:8px;border:none;cursor:pointer">
                              Aceitar Proposta
                            </button>
                            <button type="button" class="btn danger btn-reject-offer" data-index="${o.__originalIndex}" style="background:#ef4444;color:#fff;font-weight:800;padding:8px 12px;border-radius:8px;border:none;cursor:pointer">
                              Recusar
                            </button>
                          </div>
                        </div>

                      </div>
                    `;
                  }).join('')}
                </div>
              ` : `
                <div style="text-align:center;padding:34px 10px;color:#64748b;font-size:13px">
                  Nenhuma proposta encontrada nesta categoria no momento. Destaque-se em campo para atrair novas oportunidades na janela!
                </div>
              `}
            </div>
          `;
        })()}

      </div>
    `;
  }

  // =========================================================================
  // ABA 5: VIDA & PATROCÍNIOS (BANCO PESSOAL + STAFF & ITENS DE LUXO)
  // =========================================================================
  function renderPlayerLifestyleAndSponsors(state){
    if(window.AFM_PlayerEngine && typeof window.AFM_PlayerEngine.processDailySponsorTurn === 'function'){
      window.AFM_PlayerEngine.processDailySponsorTurn(state);
    }
    const pState = getCareerState(state);
    if(!pState) return `<div class="card" style="padding:20px;color:#fff">Carregando vida pessoal...</div>`;

    const athlete = getControlledPlayer(state);
    const eng = window.AFM_PlayerEngine;
    const allSponsorOffers = (eng && typeof eng.getPlayerSponsorOffers === 'function')
      ? eng.getPlayerSponsorOffers(state)
      : (eng ? eng.SPONSOR_OFFERS : []);
    const items = eng ? eng.LIFESTYLE_CATALOG : [];
    const bank = pState.personalBank || 0;
    const curDate = state.date || state.currentDate || '2026-01-18';

    // Normaliza integridade das variáveis de tempo do patrocínio ativo
    let activeSp = pState.sponsorContract;
    if(activeSp){
      if(!activeSp.endDate){
        activeSp.startDate = activeSp.startDate || curDate;
        activeSp.totalDays = activeSp.totalDays || 180;
        activeSp.endDate = addDaysToIso(activeSp.startDate, activeSp.totalDays);
      }
      activeSp.daysRemaining = Math.max(0, getDaysBetween(curDate, activeSp.endDate));
    }
    const sponsorExitFee = activeSp ? eng?.getSponsorTerminationFee(activeSp, curDate) || 0 : 0;

    // FILTRO ESTRITO: Na seção de propostas, mostramos EXCLUSIVAMENTE propostas disponíveis para assinar!
    // O contrato que já está assinado e ativo NUNCA é duplicado aqui embaixo.
    const availableSponsors = (allSponsorOffers || []).filter(sp => {
      if(!activeSp) return true;
      if(sp.id && activeSp.id && String(sp.id).trim() === String(activeSp.id).trim()) return false;
      if(sp.name && activeSp.name && String(sp.name).trim().toLowerCase() === String(activeSp.name).trim().toLowerCase()) return false;
      return true;
    });

    const elapsedDays = activeSp ? Math.max(0, (activeSp.totalDays || 180) - activeSp.daysRemaining) : 0;
    const pctDays = activeSp ? Math.min(100, Math.max(0, Math.round((elapsedDays / (activeSp.totalDays || 180)) * 100))) : 0;

    return `
      <div style="display:flex;flex-direction:column;gap:18px">
        
        <!-- BANCO PESSOAL & FLUXO FINANCEIRO MENSAL DO ATLETA -->
        ${(function(){
          const athlete = getControlledPlayer(state);
          const wage = Number(athlete?.wage) || 1500;
          const spIncome = Number(activeSp?.monthlyStipend) || 0;
          const expIncome = wage + spIncome;

          const agent = window.AFM_PlayerEngine?.getPlayerAgent 
            ? window.AFM_PlayerEngine.getPlayerAgent(pState) 
            : { monthlySalary: 0, sponsorCommissionPct: 5 };
          const agentWage = Number(agent.monthlySalary) || 0;
          const agentSponsorCut = spIncome > 0 ? Math.round(spIncome * ((Number(agent.sponsorCommissionPct) || 5) / 100)) : 0;
          const agentCost = agentWage + agentSponsorCut;
          const staffCost = window.AFM_PlayerEngine?.calculateHiredStaffMonthlyCost 
            ? window.AFM_PlayerEngine.calculateHiredStaffMonthlyCost(pState, athlete?.ovr) 
            : 0;
          const lifeCost = window.AFM_PlayerEngine?.calculatePlayerLifestyleCost 
            ? window.AFM_PlayerEngine.calculatePlayerLifestyleCost(pState, athlete?.ovr) 
            : 350;
          const expExpenses = agentCost + staffCost + lifeCost;
          const netExp = expIncome - expExpenses;

          const ovr = Number(athlete?.ovr || pState?.athleteOvr || 45);
          let lifestyleLabel = 'Aspirante / Base 🥉';
          let lifestyleBadgeColor = '#94a3b8';
          if(ovr >= 85){
            lifestyleLabel = 'Craque Galáctico / Ícone Mundial 👑';
            lifestyleBadgeColor = '#facc15';
          } else if(ovr >= 78){
            lifestyleLabel = 'Estrela Internacional 🌟';
            lifestyleBadgeColor = '#a855f7';
          } else if(ovr >= 70){
            lifestyleLabel = 'Destaque Série A 💎';
            lifestyleBadgeColor = '#38bdf8';
          } else if(ovr >= 62){
            lifestyleLabel = 'Profissional em Ascensão ⚡';
            lifestyleBadgeColor = '#10b981';
          } else if(ovr >= 52){
            lifestyleLabel = 'Profissional Estabelecido ⚽';
            lifestyleBadgeColor = '#34d399';
          }

          return `
            <div class="card" style="background:linear-gradient(135deg, #064e3b 0%, #0f172a 100%);border:2px solid rgba(16,185,129,0.5);border-radius:18px;padding:22px">
              <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px;margin-bottom:18px">
                <div>
                  <span class="pill good" style="font-size:10px;font-weight:900">CONTA BANCÁRIA PESSOAL</span>
                  <h2 style="margin:4px 0 0 0;font-size:32px;font-weight:900;color:#fff">R$ ${bank.toLocaleString('pt-BR')}</h2>
                  <div style="font-size:12px;color:#a7f3d0;margin-top:2px">Saldo pessoal para contratação de staff, empresário e manutenção de carreira.</div>
                </div>
                <div style="background:rgba(0,0,0,0.4);border-radius:12px;padding:12px 18px;text-align:right">
                  <span style="font-size:11px;color:#94a3b8">ESTILO DE VIDA ATUAL:</span>
                  <div style="font-size:15px;font-weight:900;color:${lifestyleBadgeColor}">${lifestyleLabel}</div>
                </div>
              </div>

              <!-- FLUXO MENSAL PREVISTO -->
              <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:12px;background:rgba(0,0,0,0.45);border-radius:14px;padding:14px">
                <div>
                  <div style="font-size:11px;color:#94a3b8;font-weight:700">🟢 ENTRADAS PREVISTAS:</div>
                  <div style="font-size:17px;font-weight:900;color:#10b981">+ R$ ${expIncome.toLocaleString('pt-BR')}/mês</div>
                  <div style="font-size:10px;color:#6ee7b7">Salário: R$ ${wage.toLocaleString('pt-BR')} ${spIncome > 0 ? `· Patrocínio: R$ ${spIncome.toLocaleString('pt-BR')}` : ''}</div>
                </div>
                <div>
                  <div style="font-size:11px;color:#94a3b8;font-weight:700">🔴 DESPESAS PREVISTAS:</div>
                  <div style="font-size:17px;font-weight:900;color:#f87171">- R$ ${expExpenses.toLocaleString('pt-BR')}/mês</div>
                  <div style="font-size:10px;color:#fca5a5">Empresário: R$ ${agentCost.toLocaleString('pt-BR')} ${agentSponsorCut > 0 ? `(Fixo R$ ${agentWage.toLocaleString('pt-BR')} + Com. R$ ${agentSponsorCut.toLocaleString('pt-BR')})` : ''} · Staff: R$ ${staffCost.toLocaleString('pt-BR')} · Custo Vida: R$ ${lifeCost.toLocaleString('pt-BR')}</div>
                </div>
                <div>
                  <div style="font-size:11px;color:#94a3b8;font-weight:700">💰 BALANÇO LÍQUIDO PREVISTO:</div>
                  <div style="font-size:17px;font-weight:900;color:${netExp >= 0 ? '#38bdf8' : '#ef4444'}">
                    ${netExp >= 0 ? `+ R$ ${netExp.toLocaleString('pt-BR')}` : `- R$ ${Math.abs(netExp).toLocaleString('pt-BR')}`}/mês
                  </div>
                  <div style="font-size:10px;color:#94a3b8">${netExp >= 0 ? 'Economia acumulada positiva' : 'Atenção: despesas superam receitas'}</div>
                </div>
              </div>
            </div>
          `;
        })()}

        <!-- SEÇÃO: CARD DEDICADO DO PATROCÍNIO ATIVO (TEMPO DE CONTRATO E DIAS RESTANTES) -->
        ${activeSp ? `
          <div class="card" style="background:linear-gradient(135deg, #091e20 0%, #0a0f1d 100%);border:2px solid #06b6d4;border-radius:18px;padding:20px;box-shadow:0 0 20px rgba(6,182,212,0.18)">
            
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:12px">
              <div style="display:flex;align-items:center;gap:10px">
                <span style="font-size:26px">👟</span>
                <div>
                  <h3 style="margin:0;font-size:18px;font-weight:900;color:#fff">${esc(activeSp.name)}</h3>
                  <div style="font-size:11px;color:#67e8f9;font-weight:700">Fornecedor Oficial de Chuteiras · bônus de +${window.AFM_PlayerEngine?.getSponsorBootBonus(activeSp) || 0} em Finalização enquanto o contrato estiver ativo</div>
                </div>
              </div>
              <div style="display:flex;align-items:center;gap:8px">
                <span class="pill ${activeSp.daysRemaining <= 30 ? 'danger' : 'good'}" style="font-size:10px;font-weight:900">
                  ${activeSp.daysRemaining <= 30 ? '⚠️ RETA FINAL DE CONTRATO' : '⚡ CONTRATO EM VIGOR'}
                </span>
                <span style="background:rgba(6,182,212,0.15);border:1px solid #06b6d4;color:#67e8f9;padding:3px 8px;border-radius:6px;font-size:10px;font-weight:900">
                  ${esc(activeSp.brand)}
                </span>
              </div>
            </div>

            <!-- BARRA DE PROGRESSO DO TEMPO DE CONTRATO -->
            <div style="background:rgba(0,0,0,0.5);border:1px solid #1e293b;border-radius:12px;padding:14px;margin-bottom:14px">
              <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:8px">
                <div style="font-size:13px;font-weight:900;color:#fff">
                  ⏳ Tempo de Contrato Restante: <span style="color:#10b981">${activeSp.daysRemaining} Dias</span> <span style="color:#64748b;font-size:11px;font-weight:700">(de ${activeSp.totalDays || 180} dias contratados)</span>
                </div>
                <div style="font-size:11px;color:#94a3b8">
                  📅 Vínculo: <b>${formatDatePtBr(activeSp.startDate)}</b> até <b>${formatDatePtBr(activeSp.endDate)}</b>
                </div>
              </div>

              <!-- BARRA PROGRESSIVA NEON -->
              <div style="background:rgba(255,255,255,0.08);border-radius:10px;height:12px;overflow:hidden;position:relative">
                <div style="background:linear-gradient(90deg, #10b981, #06b6d4);height:100%;width:${pctDays}%;border-radius:10px;transition:width 0.4s ease;box-shadow:0 0 10px rgba(6,182,212,0.6)"></div>
              </div>
              <div style="display:flex;justify-content:space-between;font-size:10px;color:#64748b;margin-top:4px">
                <span>Início (${formatDatePtBr(activeSp.startDate)})</span>
                <span>${pctDays}% cumprido</span>
                <span>Fim (${formatDatePtBr(activeSp.endDate)})</span>
              </div>
            </div>

            <!-- DESEMPENHO NO PERÍODO DO CONTRATO & AVALIAÇÃO DE RENOVAÇÃO -->
            <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:10px;margin-bottom:14px;text-align:center">
              <div style="background:#090d16;padding:10px;border-radius:10px;border:1px solid #1e293b">
                <div style="font-size:10px;color:#94a3b8;font-weight:800">JOGOS NO CONTRATO</div>
                <div style="font-size:18px;font-weight:900;color:#fff">${activeSp.matchesDuringContract || 0}</div>
              </div>
              <div style="background:#090d16;padding:10px;border-radius:10px;border:1px solid #1e293b">
                <div style="font-size:10px;color:#94a3b8;font-weight:800">GOLS MARCADOS</div>
                <div style="font-size:18px;font-weight:900;color:#10b981">${activeSp.goalsDuringContract || 0}</div>
              </div>
              <div style="background:#090d16;padding:10px;border-radius:10px;border:1px solid #1e293b">
                <div style="font-size:10px;color:#94a3b8;font-weight:800">ASSISTÊNCIAS</div>
                <div style="font-size:18px;font-weight:900;color:#38bdf8">${activeSp.assistsDuringContract || 0}</div>
              </div>
            </div>

            <!-- GANHOS E BOTÃO DE RESCISÃO -->
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;background:rgba(0,0,0,0.3);padding:12px 14px;border-radius:10px">
              <div style="font-size:12px;color:#cbd5e1">
                <div>💰 Mensalidade: <b style="color:#10b981">R$ ${(activeSp.monthlyStipend || 1000).toLocaleString('pt-BR')}/mês</b> · Gol: <b>R$ ${(activeSp.bonusGoal || 500).toLocaleString('pt-BR')}</b> · Vitória: <b>R$ ${(activeSp.bonusWin || 500).toLocaleString('pt-BR')}</b></div>
                <div style="font-size:11px;color:#94a3b8;margin-top:2px">💡 Ao término dos dias, a empresa analisará seus números para propor uma renovação valorizada com luvas!</div>
                <div style="font-size:11px;color:#fca5a5;margin-top:3px">⚖️ Multa de rescisão hoje: <b>R$ ${sponsorExitFee.toLocaleString('pt-BR')}</b> (50% dos pagamentos mensais restantes)</div>
              </div>
              <div>
                <button type="button" class="btn danger btn-cancel-sponsor" ${Number(pState.personalBank) < sponsorExitFee ? 'disabled title="Saldo insuficiente para pagar a multa"' : ''} style="background:${Number(pState.personalBank) < sponsorExitFee ? '#475569' : '#ef4444'};color:#fff;font-weight:800;padding:8px 14px;border-radius:8px;border:none;cursor:${Number(pState.personalBank) < sponsorExitFee ? 'not-allowed' : 'pointer'};font-size:11px">
                  ${Number(pState.personalBank) < sponsorExitFee ? 'Saldo insuficiente' : 'Rescindir Contrato'}
                </button>
              </div>
            </div>

          </div>
        ` : `
          <!-- BANNER DE AGENTE LIVRE DE PATROCÍNIO -->
          <div class="card" style="background:linear-gradient(135deg, rgba(245,158,11,0.15) 0%, #0f172a 100%);border:1.5px solid #f59e0b;border-radius:18px;padding:18px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
            <div style="display:flex;align-items:center;gap:12px">
              <span style="font-size:32px">👟</span>
              <div>
                <div style="font-size:15px;font-weight:900;color:#fbbf24">VOCÊ ESTÁ LIVRE NO MERCADO DE MATERIAL ESPORTIVO!</div>
                <div style="font-size:12px;color:#cbd5e1;margin-top:2px">
                  Seu contrato anterior encerrou ou ainda não foi assinado. Escolha uma das marcas abaixo no catálogo oficial para garantir fornecimento de chuteiras, pagamentos mensais e bônus por gols!
                </div>
              </div>
            </div>
            <span class="pill warning" style="font-size:11px;font-weight:900">DISPONÍVEL NO MERCADO</span>
          </div>
        `}

        <!-- SEÇÃO: CONTRATOS DE PATROCÍNIO DISPONÍVEIS -->
        <div class="card" style="background:#101724;border:1px solid rgba(255,255,255,0.08);border-radius:18px;padding:20px">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:14px">
            <div>
              <h3 style="margin:0;font-size:15px;font-weight:900;color:#fff;text-transform:uppercase;letter-spacing:0.5px">
                👟 PROPOSTAS DE MATERIAL ESPORTIVO (${availableSponsors.length} DISPONÍVEIS)
              </h3>
              <div style="font-size:11px;color:#94a3b8;margin-top:2px">
                Propostas oficiais de fornecedores esportivos. A cada temporada chegam novas ofertas baseadas na sua evolução.
              </div>
              ${activeSp ? `<div style="font-size:11px;color:#fca5a5;margin-top:4px">Trocar de marca encerra o vínculo atual e cobra multa de R$ ${sponsorExitFee.toLocaleString('pt-BR')}.</div>` : ''}
            </div>
            <span class="pill primary" style="font-size:10px;font-weight:900">TEMPORADA ${state.date ? state.date.slice(0, 4) : '2026'}</span>
          </div>

          ${availableSponsors.length === 0 ? `
            <div style="background:rgba(255,255,255,0.02);border:1px dashed rgba(255,255,255,0.1);border-radius:12px;padding:24px;text-align:center;color:#94a3b8;font-size:13px">
              Nenhuma outra proposta no momento. Ao avançar de temporada ou aumentar seu Overall, novas marcas enviarão propostas!
            </div>
          ` : `
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:14px">
              ${availableSponsors.map(sp => `
                <div style="background:#090d16;border:1px solid #334155;border-radius:14px;padding:16px;display:flex;flex-direction:column;justify-content:space-between;transition:border-color 0.2s">
                  <div>
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                      <span style="font-size:15px;font-weight:900;color:#fff">${esc(sp.name)}</span>
                      <span class="pill primary" style="font-size:9px;font-weight:900">${esc(sp.brand)}</span>
                    </div>
                    <div style="font-size:11px;color:#94a3b8;margin-bottom:10px;line-height:1.3">${esc(sp.description || 'Fornecimento esportivo oficial')}</div>
                    
                    <div style="font-size:11px;color:#cbd5e1;background:rgba(0,0,0,0.3);padding:10px;border-radius:8px;margin-bottom:12px;line-height:1.5">
                      <div style="color:#38bdf8;font-weight:800;margin-bottom:4px">📅 Duração do Vínculo: <b>${sp.durationDays || 180} Dias</b></div>
                      <div>Mensalidade Fixa: <b style="color:#10b981">R$ ${(sp.monthlyStipend || 1000).toLocaleString('pt-BR')}</b>/mês</div>
                      <div>Bônus por Gol: <b>R$ ${(sp.bonusGoal || 500).toLocaleString('pt-BR')}</b> · Vitória: <b>R$ ${(sp.bonusWin || 500).toLocaleString('pt-BR')}</b></div>
                    </div>
                  </div>

                  <div>
                    <button type="button" class="btn btn-sponsor-details" data-sponsor-id="${esc(sp.id)}" style="width:100%;margin-bottom:7px;background:#182234;border:1px solid #38bdf8;color:#7dd3fc;font-weight:900;padding:8px;border-radius:8px;cursor:pointer;font-size:11px">🔍 Ver detalhes da proposta</button>
                    ${activeSp ? `
                      <button type="button" class="btn warning btn-sign-sponsor" data-sponsor-id="${sp.id}" style="width:100%;background:linear-gradient(135deg,#f59e0b,#d97706);color:#000;font-weight:900;padding:9px;border-radius:8px;border:none;cursor:pointer;font-size:12px;box-shadow:0 3px 10px rgba(245,158,11,0.3)">
                        🔄 Trocar Fornecedor para ${esc(sp.brand)} (${sp.durationDays || 180} Dias)
                      </button>
                    ` : `
                      <button type="button" class="btn success btn-sign-sponsor" data-sponsor-id="${sp.id}" style="width:100%;background:linear-gradient(135deg,#10b981,#059669);color:#000;font-weight:900;padding:9px;border-radius:8px;border:none;cursor:pointer;font-size:12px;box-shadow:0 3px 10px rgba(16,185,129,0.3)">
                        ✍️ Assinar com a ${esc(sp.brand)} (${sp.durationDays || 180} Dias)
                      </button>
                    `}
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <!-- SEÇÃO 1: STAFF PESSOAL DE ALTA PERFORMANCE -->
        <div class="card" style="background:#101724;border:1px solid rgba(255,255,255,0.08);border-radius:18px;padding:22px">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:14px">
            <div>
              <h3 style="margin:0;font-size:16px;font-weight:900;color:#fff;text-transform:uppercase;letter-spacing:0.5px">
                🩺 STAFF PESSOAL DE ALTA PERFORMANCE
              </h3>
              <div style="font-size:11px;color:#94a3b8;margin-top:2px">
                Profissionais particulares exclusivos para acelerar sua evolução física, mental, técnica e de imagem no FootGram.
              </div>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:14px">
            ${(function(){
              const staffList = window.AFM_PlayerEngine?.STAFF_CATALOG || [];
              const athleteOvr = Number(athlete?.ovr || pState?.athleteOvr || 45);
              const hired = pState.hiredStaff || {};

              return staffList.map(st => {
                const isHired = Boolean(hired[st.id]);
                const ovrFactor = Math.max(1, 1 + (athleteOvr - 45) * 0.03);
                const currentMonthly = Math.round(st.monthlyCostBase * ovrFactor);

                return `
                  <div style="background:${isHired ? 'linear-gradient(135deg, rgba(16,185,129,0.08), #090d16)' : '#090d16'};border:1.5px solid ${isHired ? '#10b981' : '#334155'};border-radius:14px;padding:16px;display:flex;flex-direction:column;justify-content:space-between;box-shadow:${isHired ? '0 0 14px rgba(16,185,129,0.15)' : 'none'}">
                    <div>
                      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">
                        <div style="display:flex;align-items:center;gap:10px">
                          <span style="font-size:28px">${st.icon}</span>
                          <div>
                            <div style="font-size:14px;font-weight:900;color:#fff">${esc(st.name)}</div>
                            <div style="font-size:11px;color:#38bdf8;font-weight:700">${esc(st.role)}</div>
                          </div>
                        </div>
                        ${isHired 
                          ? `<span class="pill good" style="font-size:9px;font-weight:900">CONTRATADO</span>` 
                          : `<span class="pill muted" style="font-size:9px;font-weight:900">DISPONÍVEL</span>`}
                      </div>

                      <div style="font-size:11px;color:#cbd5e1;line-height:1.4;margin-bottom:10px">${esc(st.description)}</div>
                      <div style="background:rgba(0,0,0,0.35);padding:10px;border-radius:8px;font-size:11px;color:#a7f3d0;margin-bottom:12px;border-left:3px solid #10b981">
                        <b>Bônus:</b> ${esc(st.benefitText)}
                      </div>
                    </div>

                    <div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:12px;display:flex;justify-content:space-between;align-items:center;gap:10px">
                      <div>
                        ${isHired ? `
                          <div style="font-size:11px;color:#94a3b8">Honorários:</div>
                          <div style="font-size:14px;font-weight:900;color:#f87171">R$ ${currentMonthly.toLocaleString('pt-BR')}/mês</div>
                        ` : `
                          <div style="font-size:10px;color:#94a3b8">Taxa de Contratação: <b>R$ ${st.hireCost.toLocaleString('pt-BR')}</b></div>
                          <div style="font-size:12px;font-weight:900;color:#cbd5e1">Mensalidade: R$ ${currentMonthly.toLocaleString('pt-BR')}/mês</div>
                        `}
                      </div>
                      <div>
                        ${isHired ? `
                          <button type="button" class="btn danger btn-dismiss-staff" data-staff-id="${st.id}" style="background:#ef4444;color:#fff;font-weight:900;font-size:11px;padding:8px 14px;border-radius:8px;border:none;cursor:pointer">
                            Dispensar
                          </button>
                        ` : `
                          <button type="button" class="btn success btn-hire-staff" data-staff-id="${st.id}" ${bank < st.hireCost ? 'disabled' : ''} style="background:${bank >= st.hireCost ? '#10b981' : '#334155'};color:#000;font-weight:900;font-size:11px;padding:8px 16px;border-radius:8px;border:none;cursor:${bank >= st.hireCost ? 'pointer' : 'not-allowed'}">
                            Contratar
                          </button>
                        `}
                      </div>
                    </div>
                  </div>
                `;
              }).join('');
            })()}
          </div>
        </div>

        <!-- SEÇÃO 2: BENS DE CONSUMO & LUXO -->
        <div class="card" style="background:#101724;border:1px solid rgba(255,255,255,0.08);border-radius:18px;padding:22px">
          <h3 style="margin:0 0 14px 0;font-size:15px;font-weight:900;color:#fff;text-transform:uppercase;letter-spacing:0.5px">
            💎 BENS DE LUXO & SÍMBOLOS DE CONQUISTA
          </h3>

          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:12px">
            ${items.filter(it => it.category === 'luxury').map(it => {
              const hasIt = (pState.luxuryItems || []).includes(it.id);
              const isBootEquipped = it.id === 'luxury_boots' && pState.luxuryBootsEquipped !== false;
              return `
                <div style="background:${hasIt ? 'linear-gradient(135deg,rgba(124,58,237,0.2),rgba(15,23,42,0.4))' : '#090d16'};border:1px solid ${hasIt ? '#a855f7' : '#334155'};border-radius:12px;padding:14px;display:flex;align-items:center;justify-content:space-between">
                  <div style="display:flex;align-items:center;gap:12px">
                    <span style="font-size:28px">${it.icon}</span>
                    <div>
                      <div style="font-size:13px;font-weight:900;color:#fff">${it.name}</div>
                      <div style="font-size:11px;color:#94a3b8">${it.benefit}</div>
                      <div style="font-size:11px;color:#10b981;font-weight:800;margin-top:2px">Custo: R$ ${it.cost.toLocaleString('pt-BR')}</div>
                    </div>
                  </div>
                  <div>
                    ${hasIt ? `
                      ${it.id === 'luxury_boots' ? `<button type="button" class="btn btn-toggle-lifestyle-equip ${isBootEquipped ? 'success' : ''}" data-item-id="${it.id}" style="font-weight:900;padding:8px 14px;border-radius:8px;border:1px solid ${isBootEquipped ? '#10b981' : '#64748b'};background:${isBootEquipped ? 'rgba(16,185,129,0.18)' : '#1e293b'};color:${isBootEquipped ? '#6ee7b7' : '#cbd5e1'}">${isBootEquipped ? 'Em uso · +2 CHU' : 'Equipar · +2 CHU'}</button>` : '<span class="pill good" style="font-size:10px;font-weight:900">ADQUIRIDO</span>'}
                    ` : `
                      <button type="button" class="btn btn-buy-lifestyle success" data-item-id="${it.id}" ${bank < it.cost ? 'disabled' : ''} style="background:${bank >= it.cost ? '#10b981' : '#334155'};color:#000;font-weight:900;padding:8px 14px;border-radius:8px;border:none;cursor:${bank >= it.cost ? 'pointer' : 'not-allowed'}">
                        Comprar
                      </button>
                    `}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- SEÇÃO 3: EXTRATO FINANCEIRO DOS ÚLTIMOS MESES -->
        ${Array.isArray(pState.financialHistory) && pState.financialHistory.length > 0 ? `
          <div class="card" style="background:#101724;border:1px solid rgba(255,255,255,0.08);border-radius:18px;padding:22px">
            <h3 style="margin:0 0 14px 0;font-size:15px;font-weight:900;color:#fff;text-transform:uppercase;letter-spacing:0.5px">
              📜 HISTÓRICO DE EXTRATOS MENSAIS
            </h3>
            <div style="display:flex;flex-direction:column;gap:10px">
              ${pState.financialHistory.slice(0, 6).map(fh => `
                <div style="background:#090d16;border:1px solid #1e293b;border-radius:12px;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
                  <div>
                    <div style="font-size:13px;font-weight:900;color:#38bdf8">📅 ${fh.month || fh.date}</div>
                    <div style="font-size:11px;color:#94a3b8;margin-top:2px">
                      Salário: R$ ${Number(fh.salary || 0).toLocaleString('pt-BR')} · Empresário (${esc(fh.agentName || 'Agente')}): R$ ${Number(fh.agentSalary || 0).toLocaleString('pt-BR')} · Staff: R$ ${Number(fh.staffExpenses || 0).toLocaleString('pt-BR')} · Custo Vida: R$ ${Number(fh.lifestyleCost || 0).toLocaleString('pt-BR')}
                    </div>
                  </div>
                  <div style="text-align:right">
                    <div style="font-size:14px;font-weight:900;color:${(fh.netBalance || 0) >= 0 ? '#10b981' : '#ef4444'}">
                      ${(fh.netBalance || 0) >= 0 ? '+' : ''} R$ ${(fh.netBalance || 0).toLocaleString('pt-BR')}
                    </div>
                    <div style="font-size:10px;color:#64748b">Saldo em conta: R$ ${(fh.finalBank || 0).toLocaleString('pt-BR')}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

      </div>
    `;
  }

  // =========================================================================
  // ABA 6: ESTATÍSTICAS & TROFÉUS DO ATLETA (COM SALA DE TROFÉUS E DADOS DA TEMPORADA)
  // =========================================================================
  function renderPlayerStatsAndTrophies(state){
    const pState = getCareerState(state);
    if(!pState) return `<div class="card" style="padding:20px;color:#fff">Carregando estatísticas...</div>`;

    const athlete = getControlledPlayer(state);
    const stats = pState.careerStats || {};
    const history = pState.matchRatingHistory || [];
    const currentSeason = Number(state.season) || 2026;
    const currentClub = state.club || athlete?.club || 'Clube';

    // 1. Sincroniza e obtém todos os troféus da carreira do atleta
    pState.careerStats = pState.careerStats || {};
    pState.careerStats.titles = Array.isArray(pState.careerStats.titles) ? pState.careerStats.titles : [];

    // Sincroniza com títulos conquistados no save pelo clube
    if(Array.isArray(state?.titles)){
      state.titles.forEach(t => {
        const tName = typeof t === 'string' ? t : t.name;
        const tYear = (typeof t === 'object' && t.year) ? Number(t.year) : currentSeason;
        const tClub = (typeof t === 'object' && t.club) ? t.club : currentClub;
        const tBadge = (typeof t === 'object' && t.badge) ? t.badge : 'CAMPEÃO NO SAVE';
        const tIcon = (typeof t === 'object' && t.icon) ? t.icon : '🏆';

        const exists = pState.careerStats.titles.some(pt => {
          const ptName = typeof pt === 'string' ? pt : pt.name;
          const ptYear = typeof pt === 'object' ? Number(pt.year) : null;
          return ptName === tName && (!ptYear || ptYear === tYear);
        });

        if(!exists){
          pState.careerStats.titles.push({
            name: tName,
            year: tYear,
            club: tClub,
            badge: tBadge,
            icon: tIcon,
            date: state.date || `${tYear}-12-15`
          });
        }
      });
    }

    const allTitles = pState.careerStats.titles;

    // 2. Extrai e consolida estatísticas da temporada atual
    const seasonMatchesList = history.filter(m => !m.date || String(m.date).startsWith(String(currentSeason)));
    const sStats = pState.seasonStats || {};
    const historyGoals = seasonMatchesList.reduce((sum, match) => sum + (Number(match.goals) || 0), 0);
    const historyAssists = seasonMatchesList.reduce((sum, match) => sum + (Number(match.assists) || 0), 0);
    const seasonGoals = Math.max(Number(sStats.goals) || 0, historyGoals);
    const seasonAssists = Math.max(Number(sStats.assists) || 0, historyAssists);
    const seasonMatches = Math.max(Number(sStats.matches) || 0, seasonMatchesList.length, (seasonGoals || seasonAssists) ? 1 : 0);
    const seasonStarter = Math.max(Number(sStats.starterCount) || 0, seasonMatchesList.filter(match => match.minutes >= 60).length);
    const seasonBench = Math.max(Number(sStats.benchCount) || 0, seasonMatchesList.filter(match => match.minutes > 0 && match.minutes < 60).length);
    const seasonMinutes = Math.max(Number(sStats.minutesPlayed) || 0, seasonMatchesList.reduce((sum, match) => sum + (Number(match.minutes) || 0), 0));
    const seasonHistoryRating = seasonMatchesList.length ? seasonMatchesList.reduce((sum, match) => sum + (Number(match.rating) || 0), 0) / seasonMatchesList.length : 0;
    const seasonAvgRating = seasonHistoryRating ? seasonHistoryRating.toFixed(2) : (Number(sStats.avgRating) || Number(stats.avgRating) || 6.5);
    const seasonShots = sStats.shots ?? (seasonGoals * 3 + Math.round(seasonMatches * 1.5));
    const seasonShotsOnTarget = sStats.shotsOnTarget ?? Math.max(seasonGoals, Math.round(seasonShots * 0.55));
    const shotAccuracy = seasonShots > 0 ? Math.round((seasonShotsOnTarget / seasonShots) * 100) : 0;
    const seasonYellows = sStats.yellowCards ?? stats.yellowCards ?? 0;
    const seasonReds = sStats.redCards ?? stats.redCards ?? 0;
    const seasonMotm = Math.max(Number(sStats.manOfTheMatch) || 0, Number(sStats.mvpCount) || 0, seasonMatchesList.filter(match => match.isMvp || (Number(match.rating) || 0) >= 8.5).length);
    const seasonDirectGoals = seasonGoals + seasonAssists;

    const eng = window.AFM_PlayerEngine;
    const trustRole = eng ? eng.getTrustRole(pState.managerTrust) : { role: 'Reserva', color: '#f59e0b', desc: '' };

    // Sub-aba ativa
    const subTab = window.__afmPlayerStatsSubTab || 'season';

    return `
      <div style="display:flex;flex-direction:column;gap:18px">

        <!-- SUB-ABAS DE NAVEGAÇÃO -->
        <div style="display:flex;gap:10px;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:14px;overflow-x:auto;-webkit-overflow-scrolling:touch">
          <button type="button" class="btn btn-player-stats-subtab" data-subtab="season"
            style="flex:1;min-width:180px;padding:12px 16px;border-radius:12px;font-weight:900;font-size:13px;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;transition:all 0.2s;${subTab === 'season' ? 'background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;border:1px solid #c084fc;box-shadow:0 0 20px rgba(168,85,247,0.4);' : 'background:#101724;color:#94a3b8;border:1px solid rgba(255,255,255,0.08);'}">
            <span>📊</span> Dados da Temporada (${currentSeason})
          </button>
          
          <button type="button" class="btn btn-player-stats-subtab" data-subtab="trophies"
            style="flex:1;min-width:180px;padding:12px 16px;border-radius:12px;font-weight:900;font-size:13px;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;transition:all 0.2s;${subTab === 'trophies' ? 'background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;border:1px solid #fde68a;box-shadow:0 0 20px rgba(245,158,11,0.4);' : 'background:#101724;color:#94a3b8;border:1px solid rgba(255,255,255,0.08);'}">
            <span>🏆</span> Sala de Troféus (${allTitles.length})
          </button>

          <button type="button" class="btn btn-player-stats-subtab" data-subtab="matches"
            style="flex:1;min-width:180px;padding:12px 16px;border-radius:12px;font-weight:900;font-size:13px;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;transition:all 0.2s;${subTab === 'matches' ? 'background:linear-gradient(135deg,#0284c7,#38bdf8);color:#fff;border:1px solid #7dd3fc;box-shadow:0 0 20px rgba(56,189,248,0.4);' : 'background:#101724;color:#94a3b8;border:1px solid rgba(255,255,255,0.08);'}">
            <span>⭐</span> Histórico de Jogos (${history.length})
          </button>
        </div>

        ${subTab === 'season' ? `
          <!-- SUB-ABA 1: DADOS DA TEMPORADA ATUAL -->
          
          <!-- BANNER DO CLUBE E STATUS DO ATLETA -->
          <div class="card" style="background:linear-gradient(135deg,#0f172a,#1e1b4b);border:1px solid rgba(168,85,247,0.3);border-radius:20px;padding:22px;display:flex;justify-content:space-between;align-items:center;gap:18px;flex-wrap:wrap">
            <div style="display:flex;align-items:center;gap:16px">
              <div style="width:58px;height:58px;border-radius:16px;background:rgba(255,255,255,0.05);border:1.5px solid rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;font-size:30px;box-shadow:0 4px 18px rgba(0,0,0,0.5)">
                ⚽
              </div>
              <div>
                <div style="font-size:11px;color:#a855f7;font-weight:900;text-transform:uppercase;letter-spacing:1px">
                  TEMPORADA OFICIAL ${currentSeason}
                </div>
                <h2 style="margin:2px 0 6px 0;font-size:22px;font-weight:900;color:#fff;display:flex;align-items:center;gap:10px">
                  ${esc(athlete?.name || 'Seu Craque')} 
                  <span style="font-size:12px;color:#38bdf8;background:rgba(56,189,248,0.15);padding:3px 10px;border-radius:8px;border:1px solid rgba(56,189,248,0.3)">#${athlete?.num || 10} • ${athlete?.pos || 'ATA'}</span>
                </h2>
                <div style="font-size:13px;color:#cbd5e1;display:flex;align-items:center;gap:10px;flex-wrap:wrap">
                  <span>Defendendo as cores do: <b style="color:#fff">${esc(currentClub)}</b></span>
                  <span>•</span>
                  <span>Papel Tático: <b style="color:${trustRole.color}">${trustRole.role}</b></span>
                </div>
              </div>
            </div>

            <!-- BARRA DE CONFIANÇA DO TREINADOR -->
            <div style="background:#090d16;padding:14px 18px;border-radius:14px;border:1px solid rgba(255,255,255,0.08);min-width:240px;flex:1;max-width:320px">
              <div style="display:flex;justify-content:space-between;font-size:11px;font-weight:800;color:#94a3b8;margin-bottom:6px">
                <span>CONFIANÇA DO TREINADOR</span>
                <span style="color:${trustRole.color};font-weight:900">${pState.managerTrust || 35}%</span>
              </div>
              <div style="background:rgba(255,255,255,0.06);height:8px;border-radius:4px;overflow:hidden">
                <div style="background:linear-gradient(90deg, #3b82f6, ${trustRole.color});width:${pState.managerTrust || 35}%;height:100%;border-radius:4px;transition:width 0.4s ease"></div>
              </div>
              <div style="font-size:10px;color:#64748b;margin-top:6px;font-style:italic">
                ${trustRole.desc || 'Continue treinando forte para ganhar mais espaço'}
              </div>
            </div>
          </div>

          <!-- GRID DE 8 MÉTRICAS PRINCIPAIS DA TEMPORADA -->
          <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:14px">
            
            <!-- 1. JOGOS -->
            <div class="card" style="background:#101724;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:18px;text-align:center">
              <div style="font-size:11px;color:#94a3b8;font-weight:800;text-transform:uppercase;margin-bottom:6px">JOGOS DISPUTADOS</div>
              <div style="font-size:28px;font-weight:900;color:#fff">${seasonMatches}</div>
              <div style="font-size:11px;color:#a855f7;font-weight:700;margin-top:4px">
                ${seasonStarter} Titular • ${seasonBench} Reserva
              </div>
            </div>

            <!-- 2. MINUTOS -->
            <div class="card" style="background:#101724;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:18px;text-align:center">
              <div style="font-size:11px;color:#94a3b8;font-weight:800;text-transform:uppercase;margin-bottom:6px">MINUTOS EM CAMPO</div>
              <div style="font-size:28px;font-weight:900;color:#38bdf8">${seasonMinutes}'</div>
              <div style="font-size:11px;color:#64748b;font-weight:700;margin-top:4px">
                Média: ${seasonMatches ? Math.round(seasonMinutes / seasonMatches) : 0}' / jogo
              </div>
            </div>

            <!-- 3. GOLS -->
            <div class="card" style="background:#101724;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:18px;text-align:center">
              <div style="font-size:11px;color:#94a3b8;font-weight:800;text-transform:uppercase;margin-bottom:6px">GOLS MARCADOS</div>
              <div style="font-size:28px;font-weight:900;color:#10b981">${seasonGoals}</div>
              <div style="font-size:11px;color:#64748b;font-weight:700;margin-top:4px">
                Média: ${seasonMatches ? (seasonGoals / seasonMatches).toFixed(2) : '0.00'} / jogo
              </div>
            </div>

            <!-- 4. ASSISTÊNCIAS -->
            <div class="card" style="background:#101724;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:18px;text-align:center">
              <div style="font-size:11px;color:#94a3b8;font-weight:800;text-transform:uppercase;margin-bottom:6px">ASSISTÊNCIAS</div>
              <div style="font-size:28px;font-weight:900;color:#60a5fa">${seasonAssists}</div>
              <div style="font-size:11px;color:#64748b;font-weight:700;margin-top:4px">
                Média: ${seasonMatches ? (seasonAssists / seasonMatches).toFixed(2) : '0.00'} / jogo
              </div>
            </div>

            <!-- 5. NOTA MÉDIA -->
            <div class="card" style="background:#101724;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:18px;text-align:center">
              <div style="font-size:11px;color:#94a3b8;font-weight:800;text-transform:uppercase;margin-bottom:6px">NOTA MÉDIA</div>
              <div style="font-size:28px;font-weight:900;color:${Number(seasonAvgRating) >= 7.5 ? '#10b981' : Number(seasonAvgRating) >= 6.5 ? '#f59e0b' : '#ef4444'}">
                ${seasonAvgRating}
              </div>
              <div style="font-size:11px;color:#94a3b8;font-weight:700;margin-top:4px">
                ${Number(seasonAvgRating) >= 7.5 ? '⭐ Destaque' : Number(seasonAvgRating) >= 6.5 ? '✓ Regular/Boa' : '⚠️ Em Evolução'}
              </div>
            </div>

            <!-- 6. PARTICIPAÇÕES DIRETAS (G/A) -->
            <div class="card" style="background:#101724;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:18px;text-align:center">
              <div style="font-size:11px;color:#94a3b8;font-weight:800;text-transform:uppercase;margin-bottom:6px">PARTICIPAÇÕES (G/A)</div>
              <div style="font-size:28px;font-weight:900;color:#c084fc">${seasonDirectGoals}</div>
              <div style="font-size:11px;color:#64748b;font-weight:700;margin-top:4px">
                Gols + Assistências
              </div>
            </div>

            <!-- 7. FINALIZAÇÕES & PONTARIA -->
            <div class="card" style="background:#101724;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:18px;text-align:center">
              <div style="font-size:11px;color:#94a3b8;font-weight:800;text-transform:uppercase;margin-bottom:6px">CHUTES NO ALVO</div>
              <div style="font-size:28px;font-weight:900;color:#facc15">${seasonShotsOnTarget} <span style="font-size:16px;color:#94a3b8">/ ${seasonShots}</span></div>
              <div style="font-size:11px;color:#64748b;font-weight:700;margin-top:4px">
                Precisão: ${shotAccuracy}%
              </div>
            </div>

            <!-- 8. DISCIPLINA E CARTÕES -->
            <div class="card" style="background:#101724;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:18px;text-align:center">
              <div style="font-size:11px;color:#94a3b8;font-weight:800;text-transform:uppercase;margin-bottom:6px">DISCIPLINA</div>
              <div style="font-size:24px;font-weight:900;color:#fff;display:flex;align-items:center;justify-content:center;gap:8px">
                <span>🟨 ${seasonYellows}</span>
                <span>•</span>
                <span>🟥 ${seasonReds}</span>
              </div>
              <div style="font-size:11px;color:#64748b;font-weight:700;margin-top:4px">
                ${seasonMotm}x Melhor da Partida
              </div>
            </div>

          </div>

          <!-- CARD DE DIAGNÓSTICO E FEEDBACK DO TREINADOR -->
          <div class="card" style="background:#101724;border:1px solid rgba(255,255,255,0.08);border-radius:18px;padding:22px">
            <h3 style="margin:0 0 12px 0;font-size:15px;font-weight:900;color:#fff;text-transform:uppercase;letter-spacing:0.5px;display:flex;align-items:center;gap:8px">
              <span>📋</span> RELATÓRIO TÉCNICO DA TEMPORADA
            </h3>
            
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px">
              <div style="background:#090d16;padding:16px;border-radius:12px;border:1px solid rgba(255,255,255,0.05)">
                <div style="font-size:11px;color:#a855f7;font-weight:800;text-transform:uppercase;margin-bottom:6px">PARECER DO TREINADOR:</div>
                <div style="font-size:13px;color:#cbd5e1;line-height:1.6">
                  ${Number(seasonAvgRating) >= 7.5
                    ? `“O rendimento do ${athlete?.name || 'atleta'} nesta temporada é extraordinário. Tem sido decisivo, ganhando respeito dos companheiros e garantindo sua vaga com autoridade!”`
                    : Number(seasonAvgRating) >= 6.5
                    ? `“Temporada de afirmação consistente. O atleta tem cumprido as orientações táticas e está pronto para voos ainda maiores quando a equipe precisar.”`
                    : `“A comissão técnica reconhece a dedicação, mas cobra mais intensidade nos treinos e precisão em campo para consolidar uma sequência maior como titular.”`
                  }
                </div>
              </div>

              <div style="background:#090d16;padding:16px;border-radius:12px;border:1px solid rgba(255,255,255,0.05);display:flex;flex-direction:column;justify-content:center">
                <div style="font-size:11px;color:#38bdf8;font-weight:800;text-transform:uppercase;margin-bottom:6px">STATUS DO VÍNCULO NO ${esc(currentClub.toUpperCase())}:</div>
                <div style="font-size:13px;color:#fff;line-height:1.6">
                  <div>💵 Salário no Clube: <b>R$ ${(pState.weeklySalary ? pState.weeklySalary * 4 : 1200).toLocaleString('pt-BR')}/mês</b></div>
                  <div>💼 Vínculo Contratual: <b>Válido até o fim de ${athlete?.contractUntil || (currentSeason + 2)}</b></div>
                  <div>⭐ Nível do Atleta: <b>Nível ${pState.level || 1} (${pState.xp || 0} / ${pState.xpToNextLevel || 400} XP)</b></div>
                </div>
              </div>
            </div>
          </div>
        ` : subTab === 'trophies' ? `
          <!-- SUB-ABA 2: SALA DE TROFÉUS & ESTATÍSTICAS DA CARREIRA -->
          
          <div style="display:flex;flex-direction:column;gap:20px">
            
            <!-- HEADER DA SALA DE TROFÉUS & BOTÃO DE CERIMÔNIA DE GALA -->
            <div class="card" style="background:linear-gradient(135deg,#1c1917,#0f172a);border:1.5px solid rgba(245,158,11,0.4);border-radius:20px;padding:24px;box-shadow:0 12px 40px rgba(0,0,0,0.8);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px">
              <div>
                <h2 style="margin:0;font-size:22px;font-weight:900;color:#facc15;display:flex;align-items:center;gap:10px;text-transform:uppercase;letter-spacing:0.5px">
                  <span>🏛️</span> SALA DE TROFÉUS & MEMORIAL DA CARREIRA
                </h2>
                <div style="font-size:13px;color:#94a3b8;margin-top:4px">
                  Galeria oficial de títulos coletivos, troféus individuais mundiais, recordes históricos superados e perfil psicológico.
                </div>
                <div style="font-size:12px;color:#cbd5e1;margin-top:8px;display:flex;align-items:center;gap:12px;flex-wrap:wrap">
                  <span style="background:rgba(245,158,11,0.15);color:#fde68a;padding:4px 10px;border-radius:8px;border:1px solid rgba(245,158,11,0.3);font-weight:800">
                    🏆 ${allTitles.length} Coletivos
                  </span>
                  <span style="background:rgba(168,85,247,0.15);color:#c084fc;padding:4px 10px;border-radius:8px;border:1px solid rgba(168,85,247,0.3);font-weight:800">
                    🥇 ${(pState.individualAwards || []).length} Individuais
                  </span>
                  <span style="background:rgba(56,189,248,0.15);color:#7dd3fc;padding:4px 10px;border-radius:8px;border:1px solid rgba(56,189,248,0.3);font-weight:800">
                    📜 ${(pState.competitionRecordsBroken || []).length} Recordes
                  </span>
                  <span style="background:rgba(16,185,129,0.15);color:#6ee7b7;padding:4px 10px;border-radius:8px;border:1px solid rgba(16,185,129,0.3);font-weight:800">
                    ⭐ ${(stats.mvpCount || stats.manOfTheMatch || 0)}x MVP
                  </span>
                </div>
              </div>

              <button type="button" class="btn btn-open-gala-modal" style="background:linear-gradient(135deg,#eab308,#ca8a04);color:#000;font-weight:900;font-size:13px;padding:14px 22px;border-radius:12px;border:none;cursor:pointer;display:flex;align-items:center;gap:8px;box-shadow:0 6px 20px rgba(234,179,8,0.35);transition:all 0.2s">
                <span>🌟</span> REVER CERIMÔNIA DE GALA DO ANO ➔
              </button>
            </div>

            <!-- SEÇÃO 1: 🏆 TROFÉUS COLETIVOS (LIGAS & COPAS) -->
            <div class="card" style="background:#101724;border:1px solid rgba(255,255,255,0.08);border-radius:18px;padding:22px">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:10px">
                <h3 style="margin:0;font-size:16px;font-weight:900;color:#facc15;text-transform:uppercase;letter-spacing:0.5px;display:flex;align-items:center;gap:8px">
                  <span>🏆</span> 1. TROFÉUS COLETIVOS (LIGAS & COPAS)
                </h3>
                <span style="font-size:12px;color:#94a3b8;font-weight:700">Títulos oficiais erguidos pelo clube com o atleta</span>
              </div>

              ${allTitles.length > 0 ? `
                <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:16px">
                  ${allTitles.map((t, idx) => `
                    <div style="background:linear-gradient(145deg, rgba(245,158,11,0.1), #101724);border:1.5px solid rgba(245,158,11,0.4);box-shadow:0 10px 30px rgba(0,0,0,0.7), 0 0 20px rgba(245,158,11,0.12);border-radius:18px;padding:20px;display:flex;flex-direction:column;justify-content:space-between;position:relative;overflow:hidden">
                      <div style="position:absolute;top:-25px;right:-25px;width:90px;height:90px;background:radial-gradient(circle, rgba(245,158,11,0.25) 0%, transparent 70%);border-radius:50%;pointer-events:none"></div>
                      <div>
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
                          <div style="font-size:36px;filter:drop-shadow(0 0 12px rgba(245,158,11,0.6))">${t.icon || '🏆'}</div>
                          <span style="background:rgba(245,158,11,0.2);color:#fde68a;font-size:10px;font-weight:900;padding:4px 10px;border-radius:6px;border:1px solid rgba(245,158,11,0.3);text-transform:uppercase">
                            ${esc(t.badge || 'CAMPEÃO')}
                          </span>
                        </div>
                        <h3 style="margin:0 0 4px 0;font-size:17px;font-weight:900;color:#fff;line-height:1.3">
                          ${esc(t.name || 'Competição')}
                        </h3>
                        <div style="font-size:12px;color:#facc15;font-weight:800;display:flex;align-items:center;gap:6px">
                          <span>📅</span> Temporada ${t.year || currentSeason}
                        </div>
                      </div>
                      <div style="margin-top:14px;padding:10px 14px;background:rgba(0,0,0,0.5);border-radius:12px;border:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;gap:10px">
                        <div style="font-size:18px">🛡️</div>
                        <div>
                          <div style="font-size:10px;color:#94a3b8;font-weight:700;text-transform:uppercase">Clube Campeão:</div>
                          <div style="font-size:13px;color:#38bdf8;font-weight:900">${esc(t.club || currentClub)}</div>
                        </div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              ` : `
                <div style="background:#090d16;border:1.5px dashed rgba(245,158,11,0.3);border-radius:16px;padding:36px 20px;text-align:center">
                  <div style="font-size:48px;margin-bottom:10px">🏆</div>
                  <h4 style="margin:0 0 8px 0;font-size:17px;font-weight:900;color:#facc15">Estante Coletiva Aguarda a Primeira Taça</h4>
                  <p style="color:#94a3b8;font-size:12px;max-width:520px;margin:0 auto 16px auto;line-height:1.5">
                    Lidere o <b>${esc(currentClub)}</b> rumo ao título nas competições da temporada ${currentSeason} para imortalizar a conquista nesta estante!
                  </p>
                </div>
              `}
            </div>

            <!-- SEÇÃO 2: 🥇 PRÊMIOS E TROFÉUS INDIVIDUAIS -->
            <div class="card" style="background:#101724;border:1px solid rgba(255,255,255,0.08);border-radius:18px;padding:22px">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:10px">
                <h3 style="margin:0;font-size:16px;font-weight:900;color:#c084fc;text-transform:uppercase;letter-spacing:0.5px;display:flex;align-items:center;gap:8px">
                  <span>🥇</span> 2. PRÊMIOS E TROFÉUS INDIVIDUAIS
                </h3>
                <span style="font-size:12px;color:#94a3b8;font-weight:700">Consagrações globais, artilharias e prêmios da liga</span>
              </div>

              <!-- CONTADORES RESUMIDOS DE HONRARIAS -->
              <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(135px, 1fr));gap:10px;margin-bottom:18px">
                <div style="background:#090d16;padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,0.06);text-align:center">
                  <div style="font-size:22px">👑</div>
                  <div style="font-size:18px;font-weight:900;color:#facc15">${(pState.individualAwards || []).filter(a => a.id.startsWith('ballon_dor')).length}</div>
                  <div style="font-size:10px;color:#94a3b8;font-weight:800;text-transform:uppercase">Bola de Ouro</div>
                </div>
                <div style="background:#090d16;padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,0.06);text-align:center">
                  <div style="font-size:22px">👟</div>
                  <div style="font-size:18px;font-weight:900;color:#f59e0b">${(pState.individualAwards || []).filter(a => a.id.startsWith('golden_boot')).length}</div>
                  <div style="font-size:10px;color:#94a3b8;font-weight:800;text-transform:uppercase">Chuteira Ouro</div>
                </div>
                <div style="background:#090d16;padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,0.06);text-align:center">
                  <div style="font-size:22px">🌟</div>
                  <div style="font-size:18px;font-weight:900;color:#a855f7">${(pState.individualAwards || []).filter(a => a.id.startsWith('golden_boy')).length}</div>
                  <div style="font-size:10px;color:#94a3b8;font-weight:800;text-transform:uppercase">Golden Boy</div>
                </div>
                <div style="background:#090d16;padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,0.06);text-align:center">
                  <div style="font-size:22px">🏅</div>
                  <div style="font-size:18px;font-weight:900;color:#10b981">${(pState.individualAwards || []).filter(a => a.id.startsWith('league_mvp')).length}</div>
                  <div style="font-size:10px;color:#94a3b8;font-weight:800;text-transform:uppercase">MVP da Liga</div>
                </div>
                <div style="background:#090d16;padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,0.06);text-align:center">
                  <div style="font-size:22px">⚽</div>
                  <div style="font-size:18px;font-weight:900;color:#38bdf8">${(pState.individualAwards || []).filter(a => a.id.startsWith('league_top_scorer')).length}</div>
                  <div style="font-size:10px;color:#94a3b8;font-weight:800;text-transform:uppercase">Bota de Ouro Liga</div>
                </div>
                <div style="background:#090d16;padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,0.06);text-align:center">
                  <div style="font-size:22px">🎯</div>
                  <div style="font-size:18px;font-weight:900;color:#60a5fa">${(pState.individualAwards || []).filter(a => a.id.startsWith('league_assists')).length}</div>
                  <div style="font-size:10px;color:#94a3b8;font-weight:800;text-transform:uppercase">Garçom da Liga</div>
                </div>
                <div style="background:#090d16;padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,0.06);text-align:center">
                  <div style="font-size:22px">🧤</div>
                  <div style="font-size:18px;font-weight:900;color:#34d399">${(pState.individualAwards || []).filter(a => a.id.startsWith('league_clean_sheets')).length}</div>
                  <div style="font-size:10px;color:#94a3b8;font-weight:800;text-transform:uppercase">Muralha / Luva</div>
                </div>
                <div style="background:#090d16;padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,0.06);text-align:center">
                  <div style="font-size:22px">⭐</div>
                  <div style="font-size:18px;font-weight:900;color:#facc15">${stats.mvpCount || stats.manOfTheMatch || 0}</div>
                  <div style="font-size:10px;color:#94a3b8;font-weight:800;text-transform:uppercase">Melhor em Campo</div>
                </div>
              </div>

              <!-- GALERIA DE PRÊMIOS CONQUISTADOS -->
              ${(pState.individualAwards || []).length > 0 ? `
                <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:14px">
                  ${(pState.individualAwards || []).map(aw => `
                    <div style="background:linear-gradient(135deg,rgba(168,85,247,0.1),#090d16);border:1.5px solid rgba(168,85,247,0.35);border-radius:16px;padding:18px;display:flex;flex-direction:column;justify-content:space-between;position:relative;overflow:hidden">
                      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
                        <div style="font-size:32px">${aw.icon || '🏅'}</div>
                        <span style="background:rgba(168,85,247,0.2);color:#c084fc;font-size:10px;font-weight:900;padding:3px 8px;border-radius:6px;border:1px solid rgba(168,85,247,0.3)">
                          ${esc(aw.badge || 'TROFÉU OFICIAL')}
                        </span>
                      </div>
                      <div>
                        <h4 style="margin:0 0 4px 0;font-size:16px;font-weight:900;color:#fff">${esc(aw.title)}</h4>
                        <div style="font-size:11px;color:#facc15;font-weight:800;margin-bottom:6px">📅 Ano / Temporada ${aw.year}</div>
                        <div style="font-size:12px;color:#cbd5e1;line-height:1.4">${esc(aw.desc || '')}</div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              ` : `
                <div style="background:#090d16;border:1px dashed rgba(255,255,255,0.1);border-radius:14px;padding:28px 16px;text-align:center;color:#94a3b8;font-size:13px">
                  Nenhum troféu individual conquistado ainda. Decida partidas, marque gols, lidere em assistências e atinja notas elevadas para disputar a Bola de Ouro e prêmios da liga no fim da temporada!
                </div>
              `}
            </div>

            <!-- SEÇÃO 3: 📜 RECORDES HISTÓRICOS QUEBRADOS -->
            <div class="card" style="background:#101724;border:1px solid rgba(255,255,255,0.08);border-radius:18px;padding:22px">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:10px">
                <h3 style="margin:0;font-size:16px;font-weight:900;color:#38bdf8;text-transform:uppercase;letter-spacing:0.5px;display:flex;align-items:center;gap:8px">
                  <span>📜</span> 3. RECORDES HISTÓRICOS DA COMPETIÇÃO
                </h3>
                <span style="font-size:12px;color:#94a3b8;font-weight:700">Marcas lendárias eternizadas nos livros da liga</span>
              </div>

              ${(pState.competitionRecordsBroken || []).length > 0 ? `
                <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:14px">
                  ${(pState.competitionRecordsBroken || []).map(rec => `
                    <div style="background:linear-gradient(135deg,rgba(56,189,248,0.1),#090d16);border:1.5px solid rgba(56,189,248,0.4);border-radius:16px;padding:18px">
                      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                        <span style="font-size:26px">📜</span>
                        <span style="background:rgba(56,189,248,0.2);color:#7dd3fc;font-size:10px;font-weight:900;padding:3px 8px;border-radius:6px">RECORDISTA OFICIAL</span>
                      </div>
                      <h4 style="margin:0 0 4px 0;font-size:15px;font-weight:900;color:#fff">${esc(rec.title)}</h4>
                      <div style="font-size:22px;font-weight:900;color:#38bdf8;margin:6px 0">${rec.value} <span style="font-size:13px;color:#94a3b8">${rec.type === 'mostGoalsSeason' ? 'Gols' : rec.type === 'mostAssistsSeason' ? 'Assistências' : 'Jogos Invicto'}</span></div>
                      <div style="font-size:11px;color:#cbd5e1;line-height:1.4">
                        Competição: <b>${esc(rec.compName)}</b><br>
                        Superou: <b>${esc(rec.previousHolder)}</b> na temporada ${rec.year}
                      </div>
                    </div>
                  `).join('')}
                </div>
              ` : `
                <div style="background:#090d16;border:1px dashed rgba(56,189,248,0.25);border-radius:14px;padding:24px 18px">
                  <div style="text-align:center;font-size:13px;color:#94a3b8;margin-bottom:14px">
                    Você ainda não quebrou nenhum recorde histórico oficial. Veja as marcas lendárias atuais a serem batidas:
                  </div>
                  <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:12px">
                    <div style="background:rgba(255,255,255,0.03);padding:12px;border-radius:10px;border:1px solid rgba(255,255,255,0.06)">
                      <div style="font-size:11px;color:#f59e0b;font-weight:800">⚽ RECORDE DE GOLS EM 1 ANO:</div>
                      <div style="font-size:18px;font-weight:900;color:#fff;margin:4px 0">14 Gols</div>
                      <div style="font-size:11px;color:#64748b">Marque 15 gols na temporada para se tornar o recordista!</div>
                    </div>
                    <div style="background:rgba(255,255,255,0.03);padding:12px;border-radius:10px;border:1px solid rgba(255,255,255,0.06)">
                      <div style="font-size:11px;color:#38bdf8;font-weight:800">🎯 RECORDE DE ASSISTÊNCIAS:</div>
                      <div style="font-size:18px;font-weight:900;color:#fff;margin:4px 0">8 Passes Decisivos</div>
                      <div style="font-size:11px;color:#64748b">Dê 9 assistências na temporada para bater a marca!</div>
                    </div>
                    <div style="background:rgba(255,255,255,0.03);padding:12px;border-radius:10px;border:1px solid rgba(255,255,255,0.06)">
                      <div style="font-size:11px;color:#10b981;font-weight:800">🛡️ SEQUÊNCIA INVICTA:</div>
                      <div style="font-size:18px;font-weight:900;color:#fff;margin:4px 0">11 Partidas</div>
                      <div style="font-size:11px;color:#64748b">Atinja 12 jogos seguidos sem derrota!</div>
                    </div>
                  </div>
                </div>
              `}
            </div>

            <!-- SEÇÃO 4: 🧠 PERFIL DE PERSONALIDADE & RELACIONAMENTOS -->
            <div class="card" style="background:#101724;border:1px solid rgba(255,255,255,0.08);border-radius:18px;padding:22px">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:10px">
                <h3 style="margin:0;font-size:16px;font-weight:900;color:#10b981;text-transform:uppercase;letter-spacing:0.5px;display:flex;align-items:center;gap:8px">
                  <span>🧠</span> 4. PERFIL DE PERSONALIDADE & RELACIONAMENTOS
                </h3>
                <span style="font-size:12px;color:#94a3b8;font-weight:700">Identidade psicológica, liderança e vestiário</span>
              </div>

              <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;flex-wrap:wrap">
                
                <!-- COLUNA 1: PERSONALIDADE (MAVERICK, HEARTBEAT, VIRTUOSO) -->
                <div style="background:#090d16;padding:18px;border-radius:14px;border:1px solid rgba(255,255,255,0.06)">
                  
                  <!-- ARQUÉTIPO DOMINANTE -->
                  <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.06)">
                    <div style="font-size:32px">${(pState.personality?.maverick >= pState.personality?.heartbeat && pState.personality?.maverick >= pState.personality?.virtuoso) ? '🔥' : (pState.personality?.heartbeat >= pState.personality?.maverick && pState.personality?.heartbeat >= pState.personality?.virtuoso) ? '💙' : '⚡'}</div>
                    <div>
                      <div style="font-size:10px;color:#94a3b8;font-weight:800;text-transform:uppercase">ARQUÉTIPO DOMINANTE:</div>
                      <div style="font-size:16px;font-weight:900;color:${(pState.personality?.maverick >= pState.personality?.heartbeat && pState.personality?.maverick >= pState.personality?.virtuoso) ? '#ef4444' : (pState.personality?.heartbeat >= pState.personality?.maverick && pState.personality?.heartbeat >= pState.personality?.virtuoso) ? '#38bdf8' : '#a855f7'}">
                        ${(pState.personality?.maverick >= pState.personality?.heartbeat && pState.personality?.maverick >= pState.personality?.virtuoso) ? 'Astro Individualista (Maverick)' : (pState.personality?.heartbeat >= pState.personality?.maverick && pState.personality?.heartbeat >= pState.personality?.virtuoso) ? 'Líder de Equipe (Heartbeat)' : 'Mestre Focado (Virtuoso)'}
                      </div>
                    </div>
                  </div>

                  <!-- 3 BARRAS DE PERSONALIDADE -->
                  <div style="display:flex;flex-direction:column;gap:10px">
                    <div>
                      <div style="display:flex;justify-content:space-between;font-size:11px;font-weight:800;color:#ef4444;margin-bottom:4px">
                        <span>🔥 MAVERICK (Astro / Decisivo)</span>
                        <span>${pState.personality?.maverick || 30} pts</span>
                      </div>
                      <div style="background:rgba(255,255,255,0.06);height:8px;border-radius:4px;overflow:hidden">
                        <div style="background:#ef4444;width:${Math.min(100, (pState.personality?.maverick || 30) / 2)}%;height:100%;border-radius:4px"></div>
                      </div>
                    </div>

                    <div>
                      <div style="display:flex;justify-content:space-between;font-size:11px;font-weight:800;color:#38bdf8;margin-bottom:4px">
                        <span>💙 HEARTBEAT (Líder / Espírito Coletivo)</span>
                        <span>${pState.personality?.heartbeat || 30} pts</span>
                      </div>
                      <div style="background:rgba(255,255,255,0.06);height:8px;border-radius:4px;overflow:hidden">
                        <div style="background:#38bdf8;width:${Math.min(100, (pState.personality?.heartbeat || 30) / 2)}%;height:100%;border-radius:4px"></div>
                      </div>
                    </div>

                    <div>
                      <div style="display:flex;justify-content:space-between;font-size:11px;font-weight:800;color:#a855f7;margin-bottom:4px">
                        <span>⚡ VIRTUOSO (Técnico / Focado / Profissional)</span>
                        <span>${pState.personality?.virtuoso || 40} pts</span>
                      </div>
                      <div style="background:rgba(255,255,255,0.06);height:8px;border-radius:4px;overflow:hidden">
                        <div style="background:#a855f7;width:${Math.min(100, (pState.personality?.virtuoso || 40) / 2)}%;height:100%;border-radius:4px"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- COLUNA 2: BARRAS DE RELACIONAMENTO (0 A 100%) -->
                <div style="background:#090d16;padding:18px;border-radius:14px;border:1px solid rgba(255,255,255,0.06);display:flex;flex-direction:column;justify-content:space-between">
                  <div style="font-size:12px;font-weight:900;color:#fff;text-transform:uppercase;margin-bottom:12px;display:flex;align-items:center;gap:6px">
                    <span>🤝</span> TERMÔMETRO DE RELACIONAMENTOS (0 A 100)
                  </div>

                  <div style="display:flex;flex-direction:column;gap:12px">
                    <div>
                      <div style="display:flex;justify-content:space-between;font-size:11px;font-weight:800;color:#cbd5e1;margin-bottom:4px">
                        <span>🏢 Diretoria do Clube</span>
                        <span style="color:#10b981;font-weight:900">${pState.relationships?.boardRelation || 65}%</span>
                      </div>
                      <div style="background:rgba(255,255,255,0.06);height:8px;border-radius:4px;overflow:hidden">
                        <div style="background:linear-gradient(90deg,#3b82f6,#10b981);width:${pState.relationships?.boardRelation || 65}%;height:100%;border-radius:4px"></div>
                      </div>
                    </div>

                    <div>
                      <div style="display:flex;justify-content:space-between;font-size:11px;font-weight:800;color:#cbd5e1;margin-bottom:4px">
                        <span>📢 Torcida & Arquibancada</span>
                        <span style="color:#f59e0b;font-weight:900">${pState.relationships?.fansRelation || 70}%</span>
                      </div>
                      <div style="background:rgba(255,255,255,0.06);height:8px;border-radius:4px;overflow:hidden">
                        <div style="background:linear-gradient(90deg,#f59e0b,#eab308);width:${pState.relationships?.fansRelation || 70}%;height:100%;border-radius:4px"></div>
                      </div>
                    </div>

                    <div>
                      <div style="display:flex;justify-content:space-between;font-size:11px;font-weight:800;color:#cbd5e1;margin-bottom:4px">
                        <span>👥 Companheiros de Elenco</span>
                        <span style="color:#38bdf8;font-weight:900">${pState.relationships?.teammatesRelation || 75}%</span>
                      </div>
                      <div style="background:rgba(255,255,255,0.06);height:8px;border-radius:4px;overflow:hidden">
                        <div style="background:linear-gradient(90deg,#6366f1,#38bdf8);width:${pState.relationships?.teammatesRelation || 75}%;height:100%;border-radius:4px"></div>
                      </div>
                    </div>
                  </div>

                  <div style="font-size:11px;color:#64748b;margin-top:14px;font-style:italic">
                    Gols e vitórias aumentam a admiração da torcida; assistências e fair-play fortalecem o respeito no vestiário.
                  </div>
                </div>

              </div>
            </div>

          </div>
        ` : `
          <!-- SUB-ABA 3: HISTÓRICO DE JOGOS DISPUTADOS -->
          
          <div class="card" style="background:#101724;border:1px solid rgba(255,255,255,0.08);border-radius:18px;padding:22px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:10px">
              <div>
                <h3 style="margin:0;font-size:16px;font-weight:900;color:#fff;text-transform:uppercase;letter-spacing:0.5px">
                  ⭐ HISTÓRICO DE ATUAÇÕES EM CAMPO
                </h3>
                <div style="font-size:12px;color:#94a3b8;margin-top:2px">
                  Registro detalhado de cada partida disputada pelo atleta com gols, assistências e notas individuais.
                </div>
              </div>

              <div style="font-size:12px;color:#38bdf8;font-weight:800">
                ${history.length} partida${history.length === 1 ? '' : 's'} catalogada${history.length === 1 ? '' : 's'}
              </div>
            </div>

            ${history.length > 0 ? `
              <div class="tablewrap" style="overflow-x:auto">
                <table class="table" style="width:100%;border-collapse:collapse;font-size:12px">
                  <thead>
                    <tr style="border-bottom:1px solid rgba(255,255,255,0.1);color:#94a3b8;text-align:left">
                      <th style="padding:10px 8px">Data</th>
                      <th style="padding:10px 8px">Adversário</th>
                      <th style="padding:10px 8px;text-align:center">Placar</th>
                      <th style="padding:10px 8px;text-align:center">Minutos</th>
                      <th style="padding:10px 8px;text-align:center">Gols</th>
                      <th style="padding:10px 8px;text-align:center">Assists</th>
                      <th style="padding:10px 8px;text-align:center">Cartões</th>
                      <th style="padding:10px 8px;text-align:center">Nota</th>
                      <th style="padding:10px 8px;text-align:center">Súmula Pop-up</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${history.map((m, idx) => `
                      <tr class="btn-match-history-row" data-match-idx="${idx}" style="border-bottom:1px solid rgba(255,255,255,0.04);cursor:pointer;transition:background 0.2s" title="Clique para abrir a súmula e detalhes da partida">
                        <td style="padding:10px 8px;color:#cbd5e1">${m.date || '—'}</td>
                        <td style="padding:10px 8px;font-weight:700;color:#fff">${esc(m.opponent || 'Adversário')}</td>
                        <td style="padding:10px 8px;text-align:center;font-weight:800;color:#fff">${m.score || '-'}</td>
                        <td style="padding:10px 8px;text-align:center;color:#94a3b8">${m.minutes || 0}'</td>
                        <td style="padding:10px 8px;text-align:center;font-weight:900;color:#10b981">${m.goals ? `⚽ ${m.goals}` : '—'}</td>
                        <td style="padding:10px 8px;text-align:center;font-weight:900;color:#38bdf8">${m.assists ? `👟 ${m.assists}` : '—'}</td>
                        <td style="padding:10px 8px;text-align:center;font-size:13px">
                          ${m.redCard ? '🟥' : m.yellowCard ? '🟨' : '—'}
                        </td>
                        <td style="padding:10px 8px;text-align:center">
                          <span class="pill ${m.rating >= 7.5 ? 'good' : m.rating >= 6.0 ? 'primary' : 'danger'}" style="font-weight:900;padding:3px 8px;border-radius:6px">
                            ${m.rating}
                          </span>
                        </td>
                        <td style="padding:10px 8px;text-align:center">
                          <button type="button" class="btn btn-view-match-details" data-match-idx="${idx}" style="background:rgba(56,189,248,0.15);border:1px solid #38bdf8;color:#38bdf8;padding:4px 10px;border-radius:6px;font-size:11px;font-weight:800;cursor:pointer">
                            🔍 Súmula
                          </button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            ` : `
              <div style="text-align:center;padding:36px 12px;color:#64748b;font-size:13px">
                Nenhuma partida oficial registrada ainda. Entre em campo na próxima rodada para inaugurar seu histórico!
              </div>
            `}
          </div>
        `}

      </div>
    `;
  }

  // =========================================================================
  // ABA 7: SELEÇÃO NACIONAL (DATA FIFA, CONVOCAÇÕES & RANKING NO PAÍS)
  // =========================================================================
  function renderPlayerNationalTeam(state){
    const pState = getCareerState(state);
    const athlete = getControlledPlayer(state);
    if(!pState || !athlete) return `<div class="card" style="padding:20px;color:#fff">Carregando dados da seleção...</div>`;

    const userCountry = (window.AFM_NationalTeams?.normalizeNationality(pState.nationality || 'Brasil')) || 'Brasil';
    const callUp = window.AFM_NationalTeams?.generateNationalTeamCallUp(userCountry, state) || {
      country: userCountry,
      meta: { flag: '🇧🇷', name: 'Brasil', primaryColor: '#facc15', secondaryColor: '#15803d', federation: 'CBF', confed: 'CONMEBOL', coach: 'Dorival Júnior', stadium: 'Maracanã', rivals: ['Argentina', 'Uruguai'] },
      bySector: { GK: [], DEF: [], MID: [], ATT: [] },
      rankings: { GK: [], DEF: [], MID: [], ATT: [] },
      isUserCalledUp: false,
      userSectorRanking: 999,
      userStatus: 'Distante da Convocação',
      userStatusColor: '#ef4444'
    };

    const meta = callUp.meta || { flag: '🇧🇷', name: 'Brasil', primaryColor: '#facc15', secondaryColor: '#15803d', federation: 'CBF', confed: 'CONMEBOL', coach: 'Dorival Júnior', stadium: 'Maracanã', rivals: ['Argentina', 'Uruguai'] };
    const intStats = pState.internationalStats || { caps: 0, goals: 0, assists: 0, cleanSheets: 0, mvpCount: 0, titles: [], history: [] };
    const userSector = window.AFM_NationalTeams?.getPlayerSector(athlete.pos) || 'ATT';
    const sectorRankingList = (callUp.rankings && callUp.rankings[userSector]) ? callUp.rankings[userSector] : [];
    const topCompetitors = sectorRankingList.slice(0, 10);
    const isFifaWindow = Boolean(pState.isFifaWindowActive || pState.onInternationalDuty || window.internationalMatchSession);
    const fifaFix = pState.fifaFixture;
    const userCalledForFixture = fifaFix ? Boolean(fifaFix.userIsCalledUp) : callUp.isUserCalledUp;

    return `
      <div class="afm-national-team-view" style="display:flex;flex-direction:column;gap:20px">
        
        <!-- HEADER DA SELEÇÃO NACIONAL COM BANDEIRA E STATUS DO CRAQUE -->
        <div class="card" style="background:linear-gradient(135deg, rgba(250,204,21,0.12) 0%, #090d16 100%);border:2px solid rgba(250,204,21,0.35);border-radius:22px;padding:24px;box-shadow:0 12px 40px rgba(0,0,0,0.7);position:relative;overflow:hidden">
          
          <div style="position:absolute;top:-10px;right:-10px;font-size:120px;opacity:0.08;pointer-events:none;line-height:1">
            ${meta.flag}
          </div>

          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:18px;position:relative;z-index:1">
            <div style="display:flex;align-items:center;gap:18px">
              <div style="font-size:58px;line-height:1;filter:drop-shadow(0 6px 14px rgba(0,0,0,0.5))">
                ${meta.flag}
              </div>
              <div>
                <div style="display:flex;align-items:center;gap:10px">
                  <h1 style="margin:0;font-size:24px;font-weight:900;color:#fff;letter-spacing:0.5px">SELEÇÃO ${meta.name.toUpperCase()}</h1>
                  <span style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);padding:3px 10px;border-radius:8px;font-size:11px;font-weight:900;color:#facc15">
                    ${meta.confederation || meta.confed || 'CONMEBOL'} • ${meta.textBadge || meta.federation || 'CBF'}
                  </span>
                </div>
                <div style="font-size:13px;color:#94a3b8;margin-top:6px;display:flex;align-items:center;gap:14px;flex-wrap:wrap">
                  <span>👔 Treinador: <b style="color:#fff">${esc(meta.coach)}</b></span>
                  <span>🏟️ Estádio Principal: <b style="color:#fff">${esc(meta.stadium)}</b></span>
                  <span>⚽ Rival Histórico: <b style="color:#fff">${esc((meta.rivals || []).join(', ') || 'Nenhum')}</b></span>
                </div>
              </div>
            </div>

            <!-- BADGE DE STATUS DO USUÁRIO NA SELEÇÃO -->
            <div style="background:#050c18;border:2px solid ${callUp.userStatusColor};border-radius:16px;padding:12px 20px;text-align:right;box-shadow:0 0 20px ${callUp.userStatusColor}33">
              <div style="font-size:10px;font-weight:900;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px">Seu Status na Seleção:</div>
              <div style="font-size:15px;font-weight:900;color:${callUp.userStatusColor}">
                ${callUp.userStatus}
              </div>
              <div style="font-size:11px;color:#cbd5e1;margin-top:3px">
                Posição no País: <b>#${callUp.userSectorRanking}</b> entre os ${userSector === 'GK' ? 'Goleiros' : userSector === 'DEF' ? 'Defensores' : userSector === 'MID' ? 'Meio-campistas' : 'Atacantes'}
              </div>
            </div>
          </div>
        </div>

        <!-- CARDS DE ESTATÍSTICAS INTERNACIONAIS -->
        <div class="grid g4" style="gap:14px">
          <div class="card" style="background:#101724;border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:16px;text-align:center">
            <span style="font-size:26px;font-weight:900;color:#38bdf8;line-height:1">${intStats.caps || 0}</span>
            <div style="font-size:11px;font-weight:800;color:#94a3b8;margin-top:4px;text-transform:uppercase">Jogos pela Seleção (Caps)</div>
          </div>
          <div class="card" style="background:#101724;border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:16px;text-align:center">
            <span style="font-size:26px;font-weight:900;color:#22c55e;line-height:1">${intStats.goals || 0}</span>
            <div style="font-size:11px;font-weight:800;color:#94a3b8;margin-top:4px;text-transform:uppercase">Gols Internacionais</div>
          </div>
          <div class="card" style="background:#101724;border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:16px;text-align:center">
            <span style="font-size:26px;font-weight:900;color:#a855f7;line-height:1">${intStats.assists || 0}</span>
            <div style="font-size:11px;font-weight:800;color:#94a3b8;margin-top:4px;text-transform:uppercase">Assistências</div>
          </div>
          <div class="card" style="background:#101724;border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:16px;text-align:center">
            <span style="font-size:26px;font-weight:900;color:#facc15;line-height:1">${(intStats.titles || []).length}</span>
            <div style="font-size:11px;font-weight:800;color:#94a3b8;margin-top:4px;text-transform:uppercase">Títulos Internacionais</div>
          </div>
        </div>

        ${(pState.nationalTeamHistory || []).length ? `
          <div class="card" style="background:#101724;border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:18px">
            <h3 style="margin:0 0 10px;color:#fff;font-size:14px">📅 RESULTADOS RECENTES DA SELEÇÃO</h3>
            ${(pState.nationalTeamHistory || []).slice(0, 5).map(match => `
              <div style="display:flex;justify-content:space-between;gap:12px;padding:9px 0;border-top:1px solid rgba(255,255,255,0.06);font-size:12px;color:#cbd5e1">
                <span>${esc(match.competition || 'Data FIFA')} · ${esc(match.home)} ${Number(match.homeGoals) || 0} x ${Number(match.awayGoals) || 0} ${esc(match.away)}</span>
                <span style="color:${match.userCalledUp ? '#facc15' : '#94a3b8'}">${match.userPlayed ? 'Você jogou' : match.userCalledUp ? 'Convocado · não entrou' : 'Não convocado'}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <!-- PAINEL DE DATA FIFA / CONVOCAÇÃO ATIVA -->
        ${isFifaWindow && fifaFix ? `
          <div class="card" style="background:linear-gradient(135deg, rgba(16,185,129,0.15) 0%, #090d16 100%);border:2px solid #10b981;border-radius:18px;padding:22px;box-shadow:0 0 30px rgba(16,185,129,0.3)">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px">
              <div>
                <span style="background:rgba(16,185,129,0.2);border:1px solid #10b981;color:#6ee7b7;padding:3px 10px;border-radius:12px;font-size:10px;font-weight:900;letter-spacing:1px;text-transform:uppercase">
                  🔥 DATA FIFA EM ANDAMENTO · ${esc(fifaFix.windowName)}
                </span>
                <h3 style="margin:10px 0 4px 0;font-size:18px;font-weight:900;color:#fff">
                  ${meta.flag} ${userCountry} vs ${fifaFix.oppCallUp?.meta?.flag || '🌎'} ${fifaFix.awayCountry}
                </h3>
                <div style="font-size:12px;color:#cbd5e1">
                  Local: <b>${esc(fifaFix.stadium || meta.stadium)}</b> · Data no Jogo: <b>${fifaFix.date}</b> · Status: <b>${fifaFix.played ? '✅ Partida concluída' : userCalledForFixture ? (fifaFix.userIsStarter ? '⭐ Você é Titular' : '🟢 Você começa no Banco') : '🔴 Você não foi convocado'}</b>
                </div>
                ${fifaFix.played && Array.isArray(fifaFix.result) ? `<div style="margin-top:8px;font-size:16px;font-weight:900;color:#facc15">${esc(fifaFix.homeCountry)} ${fifaFix.result[0]} x ${fifaFix.result[1]} ${esc(fifaFix.awayCountry)}</div>` : ''}
              </div>

              <div>
                ${userCalledForFixture && !fifaFix.played ? `
                  <button type="button" id="btnStartNationalMatch" style="padding:12px 24px;background:linear-gradient(135deg,#10b981,#059669);color:#000;border:none;border-radius:12px;font-weight:900;font-size:14px;cursor:pointer;box-shadow:0 4px 18px rgba(16,185,129,0.45);display:inline-flex;align-items:center;gap:8px">
                    ▶ SIMULAR PARTIDA PELA SELEÇÃO
                  </button>
                ` : `
                  <span style="font-size:12px;color:#94a3b8;font-style:italic">
                    O time nacional disputa esta partida enquanto você treina no ${esc(state.club)}.
                  </span>
                `}
              </div>
            </div>
          </div>
        ` : `
          <div class="card" style="background:#101724;border:1px solid rgba(255,255,255,0.08);border-radius:18px;padding:18px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
            <div style="display:flex;align-items:center;gap:12px">
              <span style="font-size:24px">🗓️</span>
              <div>
                <div style="font-size:13px;font-weight:800;color:#fff">Próxima Janela de Data FIFA:</div>
                <div style="font-size:12px;color:#94a3b8">Amistosos Internacionais e Eliminatórias da Copa do Mundo ocorrem periodicamente no calendário.</div>
              </div>
            </div>
            <button type="button" id="btnPreviewCallUpModal" style="background:rgba(56,189,248,0.15);border:1px solid #38bdf8;color:#38bdf8;padding:8px 16px;border-radius:8px;font-size:12px;font-weight:800;cursor:pointer">
              📋 Ver Lista dos 23 da Convocação
            </button>
          </div>
        `}

        <!-- TABELA DE CONCORRENTES DA POSIÇÃO NO PAÍS -->
        <div class="card" style="background:#101724;border:1px solid rgba(255,255,255,0.08);border-radius:18px;padding:22px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:10px">
            <div>
              <h3 style="margin:0;font-size:16px;font-weight:900;color:#fff;text-transform:uppercase;letter-spacing:0.5px;display:flex;align-items:center;gap:8px">
                <span>📊</span> RANKING DA SUA POSIÇÃO NA ${userCountry.toUpperCase()} (${userSector})
              </h3>
              <div style="font-size:12px;color:#94a3b8;margin-top:2px">
                Avaliação do desempenho da temporada entre todos os atletas do pack da mesma nacionalidade e setor.
              </div>
            </div>
            <span style="font-size:11px;color:#38bdf8;font-weight:800">
              Top 10 Concorrentes do Pack
            </span>
          </div>

          <div class="tablewrap" style="overflow-x:auto">
            <table class="table" style="width:100%;border-collapse:collapse;font-size:12px">
              <thead>
                <tr style="border-bottom:1px solid rgba(255,255,255,0.1);color:#94a3b8;text-align:left">
                  <th style="padding:10px 8px;text-align:center">Rank</th>
                  <th style="padding:10px 8px">Jogador</th>
                  <th style="padding:10px 8px">Clube Atual</th>
                  <th style="padding:10px 8px;text-align:center">OVR</th>
                  <th style="padding:10px 8px;text-align:center">Jogos</th>
                  <th style="padding:10px 8px;text-align:center">Gols / Ast</th>
                  <th style="padding:10px 8px;text-align:center">Nota Média</th>
                  <th style="padding:10px 8px;text-align:center">Pontuação Convocação</th>
                  <th style="padding:10px 8px;text-align:center">Status</th>
                </tr>
              </thead>
              <tbody>
                ${topCompetitors.map((p, idx) => {
                  const isUser = Boolean(p.isUser || p.id === athlete.id || p.name === athlete.name);
                  const statusBadge = (idx < (userSector === 'GK' ? 1 : 3))
                    ? `<span style="background:rgba(16,185,129,0.2);color:#6ee7b7;padding:3px 8px;border-radius:6px;font-size:10px;font-weight:900">⭐ Titular</span>`
                    : (idx < (userSector === 'GK' ? 3 : (userSector === 'DEF' ? 8 : 6))
                        ? `<span style="background:rgba(56,189,248,0.2);color:#7dd3fc;padding:3px 8px;border-radius:6px;font-size:10px;font-weight:900">🟢 Convocado</span>`
                        : `<span style="background:rgba(239,68,68,0.2);color:#fca5a5;padding:3px 8px;border-radius:6px;font-size:10px;font-weight:800">Fora</span>`);

                  return `
                    <tr style="border-bottom:1px solid rgba(255,255,255,0.04);background:${isUser ? 'rgba(250,204,21,0.12)' : 'transparent'};border-left:${isUser ? '3px solid #facc15' : 'none'}">
                      <td style="padding:10px 8px;text-align:center;font-weight:900;color:${isUser ? '#facc15' : '#fff'}">#${idx + 1}</td>
                      <td style="padding:10px 8px;font-weight:800;color:${isUser ? '#fde047' : '#fff'}">
                        ${isUser ? '⭐ ' : ''}${esc(p.name)} ${isUser ? '<span style="font-size:9px;background:#facc15;color:#000;padding:1px 5px;border-radius:4px;font-weight:900;margin-left:4px">VOCÊ</span>' : ''}
                      </td>
                      <td style="padding:10px 8px;color:#cbd5e1">${esc(p.club || 'Livre')}</td>
                      <td style="padding:10px 8px;text-align:center;font-weight:900;color:${(p.ovr||p.overall||0) >= 80 ? '#22c55e' : (p.ovr||p.overall||0) >= 70 ? '#38bdf8' : '#facc15'}">${p.ovr||p.overall||'?'}</td>
                      <td style="padding:10px 8px;text-align:center;color:#cbd5e1">${p.matches || 0}</td>
                      <td style="padding:10px 8px;text-align:center;color:#cbd5e1">${p.goals || 0} / ${p.assists || 0}</td>
                      <td style="padding:10px 8px;text-align:center;font-weight:800;color:${(p.avgRating||p.rating||0) >= 7.5 ? '#10b981' : '#cbd5e1'}">${Number(p.avgRating || p.rating || 6.0).toFixed(1)}</td>
                      <td style="padding:10px 8px;text-align:center;font-weight:900;color:#c084fc">${Number(p.score || 0).toFixed(1)}</td>
                      <td style="padding:10px 8px;text-align:center">${statusBadge}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- ELENCO DOS 23 CONVOCADOS DA SELEÇÃO -->
        <div class="card" style="background:#101724;border:1px solid rgba(255,255,255,0.08);border-radius:18px;padding:22px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:10px">
            <h3 style="margin:0;font-size:16px;font-weight:900;color:#fff;text-transform:uppercase;letter-spacing:0.5px;display:flex;align-items:center;gap:8px">
              <span>👥</span> ELENCO OFICIAL DOS 23 CONVOCADOS (${userCountry})
            </h3>
            <span style="font-size:11px;color:#94a3b8">
              3 Goleiros • 8 Defensores • 6 Meio-Campistas • 6 Atacantes
            </span>
          </div>

          <!-- Grade por Setor -->
          <div style="display:flex;flex-direction:column;gap:18px">
            ${[
              { sectorKey: 'GK', label: '🧤 Goleiros (3 Convocados)', list: callUp.bySector?.GK || [] },
              { sectorKey: 'DEF', label: '🛡️ Defensores (8 Convocados)', list: callUp.bySector?.DEF || [] },
              { sectorKey: 'MID', label: '🎯 Meio-Campistas (6 Convocados)', list: callUp.bySector?.MID || [] },
              { sectorKey: 'ATT', label: '⚡ Atacantes (6 Convocados)', list: callUp.bySector?.ATT || [] }
            ].map(sec => `
              <div>
                <div style="font-size:12px;font-weight:900;color:#cbd5e1;text-transform:uppercase;margin-bottom:8px;border-bottom:1px solid rgba(255,255,255,0.06);padding-bottom:4px">
                  ${sec.label}
                </div>
                <div class="grid g4" style="gap:10px">
                  ${sec.list.map((p, idx) => {
                    const isUser = Boolean(p.isUser || p.id === athlete.id || p.name === athlete.name);
                    return `
                      <div style="background:${isUser ? 'rgba(250,204,21,0.12)' : '#090d16'};border:1px solid ${isUser ? '#facc15' : 'rgba(255,255,255,0.06)'};border-radius:10px;padding:10px;display:flex;align-items:center;gap:10px;position:relative">
                        <div style="width:36px;height:36px;border-radius:8px;background:#1e293b;border:1px solid rgba(255,255,255,0.1);overflow:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:16px">
                          ${p.photo ? `<img src="${p.photo}" style="width:100%;height:100%;object-fit:cover">` : (sec.sectorKey === 'GK' ? '🧤' : sec.sectorKey === 'DEF' ? '🛡️' : sec.sectorKey === 'MID' ? '🎯' : '⚡')}
                        </div>
                        <div style="overflow:hidden;flex:1">
                          <div style="font-size:12px;font-weight:900;color:${isUser ? '#fde047' : '#fff'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                            ${isUser ? '⭐ ' : ''}${esc(p.name)}
                          </div>
                          <div style="font-size:10px;color:#94a3b8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                            ${esc(p.club || 'Livre')} • <b style="color:#22c55e">${p.ovr||p.overall||'?'} OVR</b>
                          </div>
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

      </div>
    `;
  }

  /**
   * Modal Visual Oficial da Convocação da Seleção Nacional (CBF / Federação)
   */
  function openCallUpAnnouncementModal(fifaFixture, gameState){
    if(!fifaFixture) return;
    const pCareer = gameState?.playerCareerState || {};
    const callUp = fifaFixture.userCallUp;
    const isCalled = Boolean(fifaFixture.userIsCalledUp);
    const meta = callUp?.meta || { flag: '🇧🇷', name: 'Brasil', primaryColor: '#facc15', coach: 'Dorival Júnior' };

    const old = document.getElementById('afmCallUpAnnouncementModal');
    if(old) old.remove();

    const overlay = document.createElement('div');
    overlay.id = 'afmCallUpAnnouncementModal';
    overlay.className = 'afm-custom-modal-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(2,6,23,0.92);backdrop-filter:blur(10px);z-index:999999;display:flex;align-items:center;justify-content:center;padding:16px';

    overlay.innerHTML = `
      <div style="background:linear-gradient(135deg, #090d16 0%, #111827 100%);border:2px solid ${isCalled ? '#facc15' : '#38bdf8'};border-radius:24px;padding:28px;max-width:560px;width:100%;box-shadow:0 0 50px ${isCalled ? 'rgba(250,204,21,0.35)' : 'rgba(56,189,248,0.25)'};color:#fff;text-align:center;position:relative">
        
        <div style="font-size:52px;margin-bottom:8px">
          ${meta.flag}
        </div>

        <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(250,204,21,0.15);border:1px solid #facc15;padding:3px 12px;border-radius:20px;font-size:11px;font-weight:900;color:#fde047;letter-spacing:1px;text-transform:uppercase;margin-bottom:12px">
          ${meta.name.toUpperCase()} · CONVOCAÇÃO OFICIAL DATA FIFA
        </div>

        <h2 style="margin:0 0 8px 0;font-size:22px;font-weight:900;color:${isCalled ? '#facc15' : '#fff'}">
          ${isCalled ? `🎉 PARABÉNS! VOCÊ FOI CONVOCADO!` : `📋 LISTA OFICIAL DOS 23 ANUNCIADA`}
        </h2>

        <div style="font-size:13px;color:#cbd5e1;line-height:1.6;margin-bottom:20px;padding:0 8px">
          ${isCalled
            ? `O treinador <b>${esc(meta.coach)}</b> anunciou a convocação oficial da <b>Seleção ${meta.name}</b> para a Data FIFA e o seu nome está na lista! Você se apresenta ao elenco para disputar o confronto contra a <b>${fifaFixture.awayCountry}</b>.`
            : `O técnico <b>${esc(meta.coach)}</b> fechou a lista dos 23 atletas convocados para esta Data FIFA. Seu nome permanece na pré-lista de observação. Mantenha a sequência de atuações destacadas no <b>${esc(gameState?.club || 'clube')}</b> para buscar uma vaga na próxima convocação!`
          }
        </div>

        ${isCalled ? `
          <div style="background:rgba(250,204,21,0.1);border:1.5px solid rgba(250,204,21,0.35);border-radius:14px;padding:14px;margin-bottom:20px;display:flex;justify-content:space-around;font-size:12px">
            <div>
              <div style="color:#94a3b8;font-size:10px;text-transform:uppercase;font-weight:800">Bônus Convocação</div>
              <div style="color:#facc15;font-weight:900;font-size:15px">+250 XP</div>
            </div>
            <div>
              <div style="color:#94a3b8;font-size:10px;text-transform:uppercase;font-weight:800">Valor de Mercado</div>
              <div style="color:#10b981;font-weight:900;font-size:15px">+25% Imediato</div>
            </div>
            <div>
              <div style="color:#94a3b8;font-size:10px;text-transform:uppercase;font-weight:800">Papel Tático</div>
              <div style="color:#38bdf8;font-weight:900;font-size:15px">${fifaFixture.userIsStarter ? 'Titular' : 'Reserva'}</div>
            </div>
          </div>
        ` : ''}

        <div style="display:flex;gap:12px;justify-content:center">
          <button type="button" id="btnGoToNationalTab" class="btn primary" style="background:linear-gradient(135deg,#7c3aed,#9333ea);border:none;padding:12px 24px;border-radius:10px;color:#fff;font-weight:900;font-size:13px;cursor:pointer">
            🇧🇷 Ver Seleção Nacional
          </button>
          <button type="button" id="btnCloseCallUpModal" class="btn secondary" style="background:rgba(255,255,255,0.08);border:1px solid #475569;padding:12px 20px;border-radius:10px;color:#fff;font-weight:800;font-size:13px;cursor:pointer">
            Entendido
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const btnClose = overlay.querySelector('#btnCloseCallUpModal');
    if(btnClose) btnClose.onclick = () => overlay.remove();

    const btnGo = overlay.querySelector('#btnGoToNationalTab');
    if(btnGo){
      btnGo.onclick = () => {
        overlay.remove();
        if(typeof window.setGameView === 'function') window.setGameView('player_national');
        else window.view = 'player_national';
        if(typeof window.render === 'function') window.render();
      };
    }
  }

  // =========================================================================
  // SISTEMA DE REDE SOCIAL ("FOOTGRAM / INSTAFUT") - MODO JOGADOR
  // =========================================================================
  window._afmSocialActiveCategory = window._afmSocialActiveCategory || 'training';
  window._afmSocialActiveFilter = window._afmSocialActiveFilter || 'all';
  window._afmSocialSelectedTemplateId = window._afmSocialSelectedTemplateId || 'tpl_training_1';
  window._afmSocialExpandedComments = window._afmSocialExpandedComments || {};

  function renderPlayerSocialMedia(state){
    const pState = getCareerState(state);
    const athlete = getControlledPlayer(state);
    if(!pState || !athlete) return `<div class="card" style="padding:20px;color:#fff">Carregando FootGram...</div>`;

    const sm = (typeof window.AFM_SocialMedia?.initSocialMediaState === 'function')
      ? window.AFM_SocialMedia.initSocialMediaState(state)
      : (pState.socialMedia || {});

    const athleteName = athlete.name || pState.athleteName || 'Atleta';
    const club = state.club || 'Clube';
    const tierInfo = (typeof window.AFM_SocialMedia?.getFollowerTier === 'function')
      ? window.AFM_SocialMedia.getFollowerTier(sm.followers)
      : { label: 'Promessa da Base ⚽', color: '#94a3b8', perk: 'Iniciando trajetória nas redes sociais.' };

    const fmtFollowers = (typeof window.AFM_SocialMedia?.formatFollowersCount === 'function')
      ? window.AFM_SocialMedia.formatFollowersCount(sm.followers)
      : String(sm.followers || 1000);

    const templates = (typeof window.AFM_SocialMedia?.getDynamicPostTemplates === 'function')
      ? window.AFM_SocialMedia.getDynamicPostTemplates(state)
      : [];

    const activeCat = window._afmSocialActiveCategory || 'training';
    const catTemplates = templates.filter(t => t.category === activeCat);
    if(!catTemplates.some(t => t.id === window._afmSocialSelectedTemplateId)){
      window._afmSocialSelectedTemplateId = catTemplates[0]?.id || templates[0]?.id;
    }

    const curFilter = window._afmSocialActiveFilter || 'all';
    let filteredPosts = sm.feedPosts || [];
    if(curFilter === 'user'){
      filteredPosts = filteredPosts.filter(p => p.isUser);
    } else if(curFilter === 'world'){
      filteredPosts = filteredPosts.filter(p => !p.isUser);
    }

    const mediaValue = Math.round((sm.followers || 1000) * 0.15 + (sm.celebrityLevel || 10) * 80);

    // Avatar do atleta (Foto customizada via proxy / foto do elenco / iniciais)
    const avatarPhoto = sm.avatarUrl || (typeof resolvePlayerPhotoUrl === 'function' ? resolvePlayerPhotoUrl(athlete) : null);

    return `
      <div class="afm-social-media-view" style="display:flex;flex-direction:column;gap:20px;max-width:880px;margin:0 auto">
        
        <!-- HEADER DO PERFIL NO FOOTGRAM (ESTILO INSTAGRAM/THREADS VIP) -->
        <div class="card" style="background:linear-gradient(135deg,#090d16 0%,#111827 100%);border:2px solid rgba(56,189,248,0.3);border-radius:24px;padding:26px;box-shadow:0 12px 40px rgba(0,0,0,0.7);position:relative;overflow:hidden">
          
          <div style="position:absolute;top:-20px;right:-15px;font-size:140px;opacity:0.04;pointer-events:none;line-height:1">
            📱
          </div>

          <div style="display:flex;align-items:flex-start;gap:24px;flex-wrap:wrap;position:relative;z-index:1">
            
            <!-- AVATAR COM BADGE DE EDIÇÃO -->
            <div style="position:relative;flex-shrink:0;text-align:center">
              ${avatarPhoto ? `
                <img src="${avatarPhoto}" alt="${esc(athleteName)}" style="width:84px;height:84px;border-radius:50%;object-fit:cover;border:3px solid ${sm.isVerified ? '#38bdf8' : '#10b981'};box-shadow:0 0 20px ${sm.isVerified ? 'rgba(56,189,248,0.4)' : 'rgba(16,185,129,0.3)'}">
              ` : `
                <div style="width:84px;height:84px;border-radius:50%;background:linear-gradient(135deg,#0284c7,#0369a1);border:3px solid #38bdf8;box-shadow:0 0 20px rgba(56,189,248,0.4);display:flex;align-items:center;justify-content:center;font-size:30px;font-weight:900;color:#fff">
                  ${esc(athleteName.slice(0, 2).toUpperCase())}
                </div>
              `}
              <button type="button" id="btnOpenChangeAvatarModal" style="display:inline-flex;align-items:center;gap:4px;margin-top:8px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.18);padding:4px 10px;border-radius:20px;color:#cbd5e1;font-size:10px;font-weight:800;cursor:pointer;transition:background 0.15s ease">
                📷 Alterar Foto
              </button>
            </div>

            <!-- INFORMAÇÕES DO ATLETA, HANDLE E BIO -->
            <div style="flex:1;min-width:240px">
              <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
                <h2 style="margin:0;font-size:24px;font-weight:900;color:#fff;letter-spacing:-0.5px">
                  ${esc(athleteName)}
                </h2>
                
                ${sm.isVerified ? `
                  <span style="display:inline-flex;align-items:center;gap:4px;background:rgba(56,189,248,0.18);border:1px solid #38bdf8;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:900;color:#38bdf8" title="Atleta Verificado Oficial">
                    ✓ Verificado
                  </span>
                ` : `
                  <span style="display:inline-flex;align-items:center;gap:4px;background:rgba(148,163,184,0.12);border:1px solid rgba(148,163,184,0.3);padding:2px 8px;border-radius:12px;font-size:10px;font-weight:800;color:#94a3b8" title="Alcance 50.000 seguidores ou seja convocado para a Seleção para verificar">
                    ⚪ Não Verificado (${fmtFollowers}/50K)
                  </span>
                `}
              </div>

              <!-- HANDLE EDITÁVEL -->
              <div style="display:inline-flex;align-items:center;gap:6px;margin-top:4px;margin-bottom:8px">
                <span style="font-size:14px;font-weight:800;color:#38bdf8;font-family:'Courier New', monospace">
                  ${esc(sm.handle)}
                </span>
                <button type="button" id="btnOpenEditHandleModal" style="background:none;border:none;color:#94a3b8;cursor:pointer;padding:2px 6px;font-size:12px" title="Editar @handle">
                  ✏️
                </button>
              </div>

              <!-- BIO EDITÁVEL -->
              <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:8px 12px;display:flex;justify-content:space-between;align-items:center;gap:8px">
                <span style="font-size:12px;color:#cbd5e1;line-height:1.4">
                  ${esc(sm.bio)}
                </span>
                <button type="button" id="btnOpenEditBioModal" style="background:none;border:none;color:#94a3b8;cursor:pointer;padding:2px 6px;font-size:12px" title="Editar Bio">
                  ✏️
                </button>
              </div>

              <!-- TIER DE SEGUIDORES E PERK -->
              <div style="display:inline-flex;align-items:center;gap:8px;margin-top:10px;background:rgba(255,255,255,0.04);border:1px solid ${tierInfo.color};padding:4px 12px;border-radius:20px;font-size:11px;font-weight:800;color:${tierInfo.color}">
                <span>${tierInfo.label}</span>
                <span style="color:#94a3b8;font-weight:600;font-size:10px">• ${esc(tierInfo.perk)}</span>
              </div>
            </div>
          </div>

          <!-- BARRA DE ESTATÍSTICAS DO FOOTGRAM (4 CARDS) -->
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(160px, 1fr));gap:12px;margin-top:22px;border-top:1px solid rgba(255,255,255,0.08);padding-top:18px">
            
            <div style="background:#060a12;border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:12px;text-align:center">
              <div style="font-size:10px;font-weight:900;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px">👥 SEGUIDORES</div>
              <div style="font-size:22px;font-weight:900;color:#38bdf8;margin-top:2px">${fmtFollowers}</div>
              <div style="font-size:9px;color:#64748b;margin-top:1px">${sm.followers.toLocaleString('pt-BR')} fãs reais</div>
            </div>

            <div style="background:#060a12;border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:12px;text-align:center">
              <div style="font-size:10px;font-weight:900;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px">⭐ FAMA & CELEBRIDADE</div>
              <div style="font-size:22px;font-weight:900;color:#facc15;margin-top:2px">${sm.celebrityLevel}/100</div>
              <div style="width:80%;height:4px;background:#1e293b;border-radius:2px;margin:4px auto 0;overflow:hidden">
                <div style="width:${sm.celebrityLevel}%;height:100%;background:linear-gradient(90deg,#eab308,#facc15)"></div>
              </div>
            </div>

            <div style="background:#060a12;border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:12px;text-align:center">
              <div style="font-size:10px;font-weight:900;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px">📝 PUBLICAÇÕES</div>
              <div style="font-size:22px;font-weight:900;color:#10b981;margin-top:2px">${sm.totalPostsCount || sm.feedPosts.filter(p=>p.isUser).length}</div>
              <div style="font-size:9px;color:#64748b;margin-top:1px">Posts no feed</div>
            </div>

            <div style="background:#060a12;border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:12px;text-align:center">
              <div style="font-size:10px;font-weight:900;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px">💎 VALOR ESTIMADO / POST</div>
              <div style="font-size:20px;font-weight:900;color:#a855f7;margin-top:2px">R$ ${mediaValue.toLocaleString('pt-BR')}</div>
              <div style="font-size:9px;color:#64748b;margin-top:1px">Apelo de marketing</div>
            </div>
          </div>
        </div>

        <!-- PAINEL DE CRIAÇÃO DE POST DIÁRIO (COMPACTO & ELEGANTE - PADRÃO EA FC) -->
        <div class="card" style="background:linear-gradient(135deg, #090e1a 0%, #111827 100%);border:1.5px solid ${sm.postedToday ? 'rgba(255,255,255,0.08)' : 'rgba(16,185,129,0.5)'};border-radius:14px;padding:12px 16px;box-shadow:0 4px 20px rgba(0,0,0,0.5)">
          
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:8px">
            <div style="display:flex;align-items:center;gap:8px">
              <span style="font-size:16px">✍️</span>
              <span style="font-size:13px;font-weight:900;color:#fff;text-transform:uppercase;letter-spacing:0.5px">
                ${sm.postedToday ? 'Publicação Diária (Limite Atingido)' : 'Criar Publicação Diária (1 post/dia)'}
              </span>
            </div>

            ${sm.postedToday ? `
              <span style="background:rgba(234,179,8,0.15);border:1px solid #eab308;color:#fde047;padding:2px 8px;border-radius:12px;font-size:10px;font-weight:900;display:inline-flex;align-items:center;gap:4px">
                ⏱️ Post Realizado Hoje
              </span>
            ` : `
              <span style="background:rgba(16,185,129,0.15);border:1px solid #10b981;color:#6ee7b7;padding:2px 8px;border-radius:12px;font-size:10px;font-weight:900;display:inline-flex;align-items:center;gap:4px">
                🟢 Disponível Agora
              </span>
            `}
          </div>

          ${sm.postedToday ? `
            <div style="background:rgba(255,255,255,0.02);border:1px dashed rgba(255,255,255,0.1);border-radius:8px;padding:8px 12px;font-size:11px;color:#94a3b8;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px">
              <span>✅ <b>Post de hoje publicado!</b> As interações e comentários da IA já estão no feed abaixo.</span>
              <span style="color:#64748b;font-size:10px">Avance o dia no calendário para liberar nova publicação.</span>
            </div>
          ` : `
            <!-- SELETOR COMPACTO DE CATEGORIA DO POST -->
            <div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;margin-bottom:8px">
              <button type="button" class="btn-social-cat-pill ${activeCat === 'training' ? 'active' : ''}" data-cat="training" style="background:${activeCat === 'training' ? 'linear-gradient(135deg,#059669,#10b981)' : 'rgba(255,255,255,0.05)'};color:${activeCat === 'training' ? '#000' : '#cbd5e1'};border:${activeCat === 'training' ? 'none' : '1px solid rgba(255,255,255,0.1)'};padding:4px 10px;border-radius:8px;font-size:10px;font-weight:900;cursor:pointer;white-space:nowrap">
                🏋️‍♂️ Treino & Foco
              </button>
              <button type="button" class="btn-social-cat-pill ${activeCat === 'fans' ? 'active' : ''}" data-cat="fans" style="background:${activeCat === 'fans' ? 'linear-gradient(135deg,#0284c7,#38bdf8)' : 'rgba(255,255,255,0.05)'};color:${activeCat === 'fans' ? '#000' : '#cbd5e1'};border:${activeCat === 'fans' ? 'none' : '1px solid rgba(255,255,255,0.1)'};padding:4px 10px;border-radius:8px;font-size:10px;font-weight:900;cursor:pointer;white-space:nowrap">
                👥 Torcida & Grupo
              </button>
              <button type="button" class="btn-social-cat-pill ${activeCat === 'lifestyle' ? 'active' : ''}" data-cat="lifestyle" style="background:${activeCat === 'lifestyle' ? 'linear-gradient(135deg,#ca8a04,#facc15)' : 'rgba(255,255,255,0.05)'};color:${activeCat === 'lifestyle' ? '#000' : '#cbd5e1'};border:${activeCat === 'lifestyle' ? 'none' : '1px solid rgba(255,255,255,0.1)'};padding:4px 10px;border-radius:8px;font-size:10px;font-weight:900;cursor:pointer;white-space:nowrap">
                💎 Estilo de Vida
              </button>
              <button type="button" class="btn-social-cat-pill ${activeCat === 'market' ? 'active' : ''}" data-cat="market" style="background:${activeCat === 'market' ? 'linear-gradient(135deg,#7c3aed,#a855f7)' : 'rgba(255,255,255,0.05)'};color:${activeCat === 'market' ? '#fff' : '#cbd5e1'};border:${activeCat === 'market' ? 'none' : '1px solid rgba(255,255,255,0.1)'};padding:4px 10px;border-radius:8px;font-size:10px;font-weight:900;cursor:pointer;white-space:nowrap">
                👀 Mercado & Futuro
              </button>
            </div>

            <!-- LISTA COMPACTA DE MENSAGENS ESTRATÉGICAS -->
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:6px;margin-bottom:10px">
              ${catTemplates.map(tpl => {
                const isSelected = (tpl.id === window._afmSocialSelectedTemplateId);
                return `
                  <div class="social-template-card" data-template-id="${tpl.id}" style="background:${isSelected ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.03)'};border:1.5px solid ${isSelected ? '#10b981' : 'rgba(255,255,255,0.08)'};border-radius:10px;padding:8px 10px;cursor:pointer;transition:all 0.15s ease;display:flex;align-items:center;gap:8px">
                    <div style="width:14px;height:14px;min-width:14px;border-radius:50%;border:1.5px solid ${isSelected ? '#10b981' : '#64748b'};background:${isSelected ? '#10b981' : 'transparent'};display:flex;align-items:center;justify-content:center;flex-shrink:0">
                      ${isSelected ? '<span style="color:#000;font-size:8px;font-weight:900">✓</span>' : ''}
                    </div>
                    <div style="flex:1;min-width:0">
                      <div style="font-size:11px;color:#f8fafc;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${esc(tpl.text)}">
                        "${esc(tpl.text)}"
                      </div>
                      <div style="display:flex;gap:4px;align-items:center;margin-top:3px;font-size:9px">
                        <span style="color:#6ee7b7;font-weight:800">${esc(tpl.impactDesc)}</span>
                        <span style="color:#64748b">• Risco: ${esc(tpl.risk)}</span>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>

            <!-- PRÉVIA DO POST SELECIONADO & BOTÃO DE PUBLICAR LADO A LADO -->
            ${(function(){
              const curTpl = catTemplates.find(t => t.id === window._afmSocialSelectedTemplateId) || catTemplates[0];
              return `
                <div style="background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:8px 12px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">
                  <div style="flex:1;min-width:200px">
                    <div style="font-size:10px;color:#94a3b8;font-weight:700">MENSAGEM SELECIONADA:</div>
                    <div style="font-size:11px;color:#e2e8f0;font-style:italic;line-height:1.3;margin-top:2px">"${esc(curTpl ? curTpl.text : '')}"</div>
                  </div>
                  <button type="button" id="btnPublishFootGramPost" style="padding:8px 18px;background:linear-gradient(135deg,#10b981,#059669);border:none;border-radius:8px;color:#000;font-size:11px;font-weight:900;cursor:pointer;white-space:nowrap;box-shadow:0 2px 10px rgba(16,185,129,0.35);transition:transform 0.15s ease">
                    🚀 PUBLICAR AGORA
                  </button>
                </div>
              `;
            })()}
          `}
        </div>

        <!-- BARRA DE FILTROS DO FEED -->
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:12px">
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:18px">🔥</span>
            <span style="font-size:14px;font-weight:900;color:#fff;text-transform:uppercase;letter-spacing:0.5px">FEED EM TEMPO REAL</span>
          </div>

          <div style="display:flex;gap:6px">
            <button type="button" class="btn-social-filter-pill ${curFilter === 'all' ? 'active' : ''}" data-filter="all" style="background:${curFilter === 'all' ? '#38bdf8' : 'rgba(255,255,255,0.05)'};color:${curFilter === 'all' ? '#000' : '#cbd5e1'};border:none;padding:5px 12px;border-radius:8px;font-size:11px;font-weight:800;cursor:pointer">
              Todos
            </button>
            <button type="button" class="btn-social-filter-pill ${curFilter === 'user' ? 'active' : ''}" data-filter="user" style="background:${curFilter === 'user' ? '#10b981' : 'rgba(255,255,255,0.05)'};color:${curFilter === 'user' ? '#000' : '#cbd5e1'};border:none;padding:5px 12px;border-radius:8px;font-size:11px;font-weight:800;cursor:pointer">
              Minhas Postagens
            </button>
            <button type="button" class="btn-social-filter-pill ${curFilter === 'world' ? 'active' : ''}" data-filter="world" style="background:${curFilter === 'world' ? '#a855f7' : 'rgba(255,255,255,0.05)'};color:${curFilter === 'world' ? '#fff' : '#cbd5e1'};border:none;padding:5px 12px;border-radius:8px;font-size:11px;font-weight:800;cursor:pointer">
              Imprensa & Estrelas
            </button>
          </div>
        </div>

        <!-- LISTA DE POSTS DO FEED (CARD ESTILO THREADS / X) -->
        <div style="display:flex;flex-direction:column;gap:16px">
          ${filteredPosts.length === 0 ? `
            <div class="card" style="padding:30px;text-align:center;color:#94a3b8;font-size:13px">
              Nenhuma publicação encontrada neste filtro.
            </div>
          ` : filteredPosts.map(post => {
            const isCommentsOpen = Boolean(window._afmSocialExpandedComments[post.id]);
            const commentsCount = Array.isArray(post.comments) ? post.comments.length : 0;
            const normalizeAuthor = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
            const authorName = normalizeAuthor(post.authorName);
            const worldProfile = window.AFM_SocialMedia?.WORLD_PROFILES?.find(profile => profile.handle === post.handle || normalizeAuthor(profile.name) === authorName);
            const isAthletePost = post.isUser || authorName === normalizeAuthor(athleteName);
            const postAvatar = post.avatarUrl || (isAthletePost ? avatarPhoto : null) || worldProfile?.avatarUrl || window.resolvePlayerPhotoUrl?.({ name: post.authorName, club: post.club }) || null;
            const postTimestamp = window.AFM_SocialMedia?.formatPostTimestamp?.(post, state.date, sm.lastPostDate) || post.timestamp || 'Data não informada';
            return `
              <div class="card social-post-card" style="background:#090d16;border:1px solid ${post.isUser ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.08)'};border-radius:18px;padding:20px;box-shadow:0 6px 24px rgba(0,0,0,0.5)">
                
                <!-- HEADER DO POST: AUTOR, HANDLE, DATA -->
                <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:12px">
                  <div style="display:flex;align-items:center;gap:12px">
                    ${postAvatar ? `<img src="${esc(postAvatar)}" alt="${esc(post.authorName)}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" style="width:44px;height:44px;border-radius:50%;object-fit:cover;border:2px solid ${post.isVerified ? '#38bdf8' : '#64748b'}">` : ''}
                    <div style="width:44px;height:44px;border-radius:50%;background:${post.avatarBg || '#0284c7'};${postAvatar ? 'display:none;' : 'display:flex;'}align-items:center;justify-content:center;font-weight:900;color:#fff;font-size:16px;border:2px solid ${post.isVerified ? '#38bdf8' : '#64748b'}">
                      ${esc(post.avatarText || 'FC')}
                    </div>
                    <div>
                      <div style="display:flex;align-items:center;gap:6px">
                        <span style="font-weight:900;color:#fff;font-size:14px">
                          ${esc(post.authorName)}
                        </span>
                        ${post.isVerified ? `
                          <span style="color:#38bdf8;font-size:12px;font-weight:900" title="Verificado Oficial">✓</span>
                        ` : ''}
                        ${post.isUser ? `
                          <span style="background:rgba(16,185,129,0.2);color:#6ee7b7;border:1px solid #10b981;font-size:9px;font-weight:900;padding:1px 6px;border-radius:6px">VOCÊ</span>
                        ` : ''}
                      </div>
                      <div style="display:flex;align-items:center;gap:8px;margin-top:1px">
                        <span style="font-size:12px;color:#38bdf8;font-family:'Courier New', monospace">${esc(post.handle)}</span>
                        <span style="font-size:10px;color:#64748b">• ${esc(postTimestamp)}</span>
                      </div>
                    </div>
                  </div>

                  ${post.categoryLabel ? `
                    <span style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);padding:3px 8px;border-radius:8px;font-size:10px;font-weight:800;color:#94a3b8">
                      ${esc(post.categoryLabel.split(' ')[0])}
                    </span>
                  ` : ''}
                </div>

                <!-- CORPO DO TEXTO DO POST (SEM IMAGEM, DESIGN TEXTO PURO ELEGANTE) -->
                <div style="background:rgba(255,255,255,0.02);border-left:3px solid ${post.isUser ? '#10b981' : '#38bdf8'};border-radius:0 12px 12px 0;padding:14px 16px;font-size:14px;color:#f1f5f9;line-height:1.6;margin-bottom:14px">
                  ${esc(post.text).replace(/(#[a-zA-Z0-9_]+)/g, '<span style="color:#38bdf8;font-weight:800">$1</span>')}
                </div>

                <!-- BARRA DE ENGAJAMENTO (LIKES, REPOSTS, COMENTÁRIOS) -->
                <div style="display:flex;align-items:center;gap:18px;border-top:1px solid rgba(255,255,255,0.06);padding-top:12px">
                  
                  <button type="button" class="btn-social-like" data-post-id="${post.id}" style="background:none;border:none;color:${post.userLiked ? '#ef4444' : '#94a3b8'};font-size:13px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:6px;padding:4px 8px;border-radius:6px;transition:background 0.15s ease">
                    <span>${post.userLiked ? '❤️' : '🤍'}</span>
                    <span>${(post.likes || 0).toLocaleString('pt-BR')}</span>
                  </button>

                  <div style="color:#94a3b8;font-size:13px;font-weight:800;display:inline-flex;align-items:center;gap:6px">
                    <span>🔄</span>
                    <span>${(post.reposts || 0).toLocaleString('pt-BR')}</span>
                  </div>

                  <button type="button" class="btn-toggle-comments" data-post-id="${post.id}" style="background:none;border:none;color:${isCommentsOpen ? '#38bdf8' : '#94a3b8'};font-size:13px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:6px;padding:4px 8px;border-radius:6px">
                    <span>💬</span>
                    <span>${commentsCount} comentários ${isCommentsOpen ? '▲' : '▼'}</span>
                  </button>
                </div>

                <!-- SEÇÃO EXPANSÍVEL DE COMENTÁRIOS -->
                ${isCommentsOpen ? `
                  <div style="margin-top:14px;border-top:1px solid rgba(255,255,255,0.06);padding-top:14px;display:flex;flex-direction:column;gap:10px">
                    
                    <!-- INPUT PARA O USUÁRIO COMENTAR -->
                    <div style="display:flex;gap:8px;margin-bottom:6px">
                      <input type="text" class="input-add-comment" data-post-id="${post.id}" placeholder="Escreva um comentário público..." style="flex:1;background:#050811;border:1px solid rgba(255,255,255,0.12);border-radius:8px;padding:8px 12px;color:#fff;font-size:12px">
                      <button type="button" class="btn-submit-comment" data-post-id="${post.id}" style="background:#10b981;border:none;border-radius:8px;color:#000;font-weight:900;font-size:11px;padding:0 14px;cursor:pointer">
                        Enviar
                      </button>
                    </div>

                    <!-- LISTAGEM DOS COMENTÁRIOS SIMULADOS POR IA -->
                    ${(post.comments || []).map(comm => `
                      <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.04);border-radius:10px;padding:10px 12px;display:flex;gap:10px">
                        <div style="width:32px;height:32px;border-radius:50%;background:${comm.avatarBg || '#3b82f6'};display:flex;align-items:center;justify-content:center;font-weight:900;color:#fff;font-size:11px;flex-shrink:0">
                          ${esc(comm.avatarText || 'U')}
                        </div>
                        <div style="flex:1">
                          <div style="display:flex;align-items:center;gap:6px">
                            <span style="font-size:12px;font-weight:800;color:#fff">${esc(comm.authorName)}</span>
                            ${comm.isVerified ? `<span style="color:#38bdf8;font-size:10px">✓</span>` : ''}
                            <span style="font-size:10px;color:#64748b">${esc(comm.handle)}</span>
                            <span style="font-size:9px;color:#475569;margin-left:auto">${esc(comm.timestamp)}</span>
                          </div>
                          <div style="font-size:12px;color:#cbd5e1;margin-top:2px;line-height:1.4">
                            ${esc(comm.text)}
                          </div>
                          <div style="display:inline-flex;align-items:center;gap:4px;font-size:10px;color:#94a3b8;margin-top:4px">
                            <span>❤️</span> <span>${comm.likes || 1}</span>
                          </div>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // Modais de Edição de @Handle, Bio e Foto de Perfil
  function openEditHandleModal(state){
    const sm = state?.playerCareerState?.socialMedia;
    if(!sm) return;

    const oldModal = document.getElementById('afmEditHandleModal');
    if(oldModal) oldModal.remove();

    const overlay = document.createElement('div');
    overlay.id = 'afmEditHandleModal';
    overlay.className = 'afm-custom-modal-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(2,6,23,0.92);backdrop-filter:blur(10px);z-index:999999;display:flex;align-items:center;justify-content:center;padding:16px';

    overlay.innerHTML = `
      <div style="background:linear-gradient(135deg,#090d16 0%,#111827 100%);border:2px solid #38bdf8;border-radius:20px;padding:24px;max-width:440px;width:100%;box-shadow:0 0 40px rgba(56,189,248,0.3);color:#fff">
        <h3 style="margin:0 0 6px 0;font-size:18px;font-weight:900;color:#fff">EDITAR SEU @HANDLE</h3>
        <div style="font-size:12px;color:#94a3b8;margin-bottom:16px">
          Escolha como seus seguidores e a imprensa esportiva encontrarão você no FootGram.
        </div>
        <div style="margin-bottom:18px">
          <label style="font-size:11px;font-weight:800;color:#38bdf8;display:block;margin-bottom:4px">NOVO @HANDLE:</label>
          <input type="text" id="inputNewHandle" value="${esc(sm.handle)}" maxlength="25" style="width:100%;padding:10px 14px;background:#050811;border:1px solid rgba(255,255,255,0.15);border-radius:10px;color:#fff;font-size:14px;font-family:'Courier New', monospace;box-sizing:border-box">
          <div style="font-size:10px;color:#64748b;margin-top:4px">Apenas letras, números e underline. O '@' é inserido automaticamente.</div>
        </div>
        <div style="display:flex;gap:10px;justify-content:flex-end">
          <button type="button" id="btnCancelEditHandle" style="padding:10px 18px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#fff;font-weight:800;font-size:12px;cursor:pointer">Cancelar</button>
          <button type="button" id="btnConfirmEditHandle" style="padding:10px 20px;background:#38bdf8;border:none;border-radius:8px;color:#000;font-weight:900;font-size:12px;cursor:pointer">Salvar @Handle</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector('#btnCancelEditHandle').onclick = () => overlay.remove();
    overlay.querySelector('#btnConfirmEditHandle').onclick = () => {
      const val = overlay.querySelector('#inputNewHandle').value;
      if(window.AFM_SocialMedia?.updateProfileHandle){
        window.AFM_SocialMedia.updateProfileHandle(val, state);
        if(typeof window.save === 'function') window.save();
        if(typeof window.render === 'function') window.render();
      }
      overlay.remove();
    };
  }

  function openEditBioModal(state){
    const sm = state?.playerCareerState?.socialMedia;
    if(!sm) return;

    const oldModal = document.getElementById('afmEditBioModal');
    if(oldModal) oldModal.remove();

    const overlay = document.createElement('div');
    overlay.id = 'afmEditBioModal';
    overlay.className = 'afm-custom-modal-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(2,6,23,0.92);backdrop-filter:blur(10px);z-index:999999;display:flex;align-items:center;justify-content:center;padding:16px';

    overlay.innerHTML = `
      <div style="background:linear-gradient(135deg,#090d16 0%,#111827 100%);border:2px solid #10b981;border-radius:20px;padding:24px;max-width:440px;width:100%;box-shadow:0 0 40px rgba(16,185,129,0.3);color:#fff">
        <h3 style="margin:0 0 6px 0;font-size:18px;font-weight:900;color:#fff">EDITAR BIO DO PERFIL</h3>
        <div style="font-size:12px;color:#94a3b8;margin-bottom:16px">
          Descreva sua mentalidade, metas no clube e frase de destaque (máx 160 caracteres).
        </div>
        <div style="margin-bottom:18px">
          <label style="font-size:11px;font-weight:800;color:#10b981;display:block;margin-bottom:4px">SUA BIO:</label>
          <textarea id="textareaNewBio" maxlength="160" rows="3" style="width:100%;padding:10px 14px;background:#050811;border:1px solid rgba(255,255,255,0.15);border-radius:10px;color:#fff;font-size:13px;line-height:1.4;box-sizing:border-box">${esc(sm.bio)}</textarea>
        </div>
        <div style="display:flex;gap:10px;justify-content:flex-end">
          <button type="button" id="btnCancelEditBio" style="padding:10px 18px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#fff;font-weight:800;font-size:12px;cursor:pointer">Cancelar</button>
          <button type="button" id="btnConfirmEditBio" style="padding:10px 20px;background:#10b981;border:none;border-radius:8px;color:#000;font-weight:900;font-size:12px;cursor:pointer">Salvar Bio</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector('#btnCancelEditBio').onclick = () => overlay.remove();
    overlay.querySelector('#btnConfirmEditBio').onclick = () => {
      const val = overlay.querySelector('#textareaNewBio').value;
      if(window.AFM_SocialMedia?.updateProfileBio){
        window.AFM_SocialMedia.updateProfileBio(val, state);
        if(typeof window.save === 'function') window.save();
        if(typeof window.render === 'function') window.render();
      }
      overlay.remove();
    };
  }

  function openChangeAvatarModal(state){
    const sm = state?.playerCareerState?.socialMedia;
    if(!sm) return;

    const oldModal = document.getElementById('afmChangeAvatarModal');
    if(oldModal) oldModal.remove();

    const overlay = document.createElement('div');
    overlay.id = 'afmChangeAvatarModal';
    overlay.className = 'afm-custom-modal-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(2,6,23,0.92);backdrop-filter:blur(10px);z-index:999999;display:flex;align-items:center;justify-content:center;padding:16px';

    overlay.innerHTML = `
      <div style="background:linear-gradient(135deg,#090d16 0%,#111827 100%);border:2px solid #a855f7;border-radius:20px;padding:24px;max-width:480px;width:100%;box-shadow:0 0 40px rgba(168,85,247,0.3);color:#fff">
        <h3 style="margin:0 0 6px 0;font-size:18px;font-weight:900;color:#fff">FOTO DE PERFIL DO FOOTGRAM</h3>
        <div style="font-size:12px;color:#94a3b8;margin-bottom:16px">
          Insira uma URL de imagem (otimizada automaticamente via proxy WebP 80x80) ou envie um arquivo que será reduzido para 64x64px com zero peso no save.
        </div>

        <!-- OPÇÃO 1: URL COM PROXY AUTOMÁTICO -->
        <div style="margin-bottom:16px">
          <label style="font-size:11px;font-weight:800;color:#a855f7;display:block;margin-bottom:4px">OPÇÃO 1 · URL DA FOTO (HTTP / HTTPS):</label>
          <input type="url" id="inputAvatarUrl" placeholder="https://exemplo.com/minha-foto.jpg" style="width:100%;padding:10px 14px;background:#050811;border:1px solid rgba(255,255,255,0.15);border-radius:10px;color:#fff;font-size:13px;box-sizing:border-box">
          <div style="font-size:10px;color:#64748b;margin-top:4px">A imagem passa pelo proxy de cache wsrv.nl para carregar instantaneamente sem pesar o save.</div>
        </div>

        <!-- OPÇÃO 2: ARQUIVO LOCAL VIA CANVAS MINIFICADO -->
        <div style="margin-bottom:20px;background:rgba(255,255,255,0.02);border:1px dashed rgba(255,255,255,0.1);border-radius:10px;padding:12px">
          <label style="font-size:11px;font-weight:800;color:#cbd5e1;display:block;margin-bottom:4px">OPÇÃO 2 · ENVIAR ARQUIVO LOCAL (REDUÇÃO 64x64):</label>
          <input type="file" id="inputFileAvatar" accept="image/*" style="font-size:11px;color:#94a3b8">
        </div>

        <div style="display:flex;gap:10px;justify-content:flex-end">
          <button type="button" id="btnCancelAvatar" style="padding:10px 18px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#fff;font-weight:800;font-size:12px;cursor:pointer">Cancelar</button>
          <button type="button" id="btnConfirmAvatar" style="padding:10px 20px;background:#a855f7;border:none;border-radius:8px;color:#fff;font-weight:900;font-size:12px;cursor:pointer">Atualizar Foto</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector('#btnCancelAvatar').onclick = () => overlay.remove();

    overlay.querySelector('#btnConfirmAvatar').onclick = () => {
      const urlInput = overlay.querySelector('#inputAvatarUrl').value.trim();
      const fileInput = overlay.querySelector('#inputFileAvatar');

      if(fileInput && fileInput.files && fileInput.files[0]){
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            // Reduz via Canvas para 64x64px com qualidade 0.60 para pesar menos de 2KB
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, 64, 64);
            const compressed = canvas.toDataURL('image/jpeg', 0.6);
            if(window.AFM_SocialMedia?.updateProfileAvatar){
              window.AFM_SocialMedia.updateProfileAvatar(compressed, state);
              if(typeof window.save === 'function') window.save();
              if(typeof window.render === 'function') window.render();
            }
            overlay.remove();
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      } else if(urlInput){
        if(window.AFM_SocialMedia?.updateProfileAvatar){
          window.AFM_SocialMedia.updateProfileAvatar(urlInput, state);
          if(typeof window.save === 'function') window.save();
          if(typeof window.render === 'function') window.render();
        }
        overlay.remove();
      } else {
        overlay.remove();
      }
    };
  }

  function showPostMatchSummaryModal(param1, param2, onContinue){
    const report = (param2 && typeof param2 === 'object') ? param2 : param1;
    if(!report) return;
    const canGiveInterview = Boolean(report.isMvp && window.state?.gameMode === 'player');

    const oldModal = document.getElementById('afmPlayerPostMatchModal');
    if(oldModal && typeof oldModal.remove === 'function') oldModal.remove();
    else if(oldModal && oldModal.parentNode) oldModal.parentNode.removeChild(oldModal);

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'afmPlayerPostMatchModal';
    overlay.style.zIndex = '99999';

    overlay.innerHTML = `
      <div class="modal" style="max-width:540px;width:90%;background:#090d16;border:2px solid ${report.isMvp ? '#facc15' : '#a855f7'};border-radius:20px;padding:24px;box-shadow:0 16px 50px rgba(0,0,0,0.9)${report.isMvp ? ', 0 0 35px rgba(250,204,21,0.3)' : ''};color:#fff;text-align:center">
        
        <div style="font-size:36px;margin-bottom:6px">${report.isMvp ? '👑 🏆' : '⭐'}</div>
        <h2 style="margin:0;font-size:22px;font-weight:900;color:${report.isMvp ? '#fde68a' : '#c084fc'};letter-spacing:0.5px">RESUMO DA SUA ATUAÇÃO</h2>
        <div style="font-size:13px;color:#94a3b8;margin-top:4px">
          ${report.played ? `${report.status} (${report.minutes} minutos jogados)` : 'Não relacionado para este jogo'}
        </div>

        ${report.isMvp ? `
          <div style="margin:16px 0;background:linear-gradient(135deg,rgba(234,179,8,0.25),rgba(202,138,4,0.12));border:2px solid #facc15;border-radius:14px;padding:14px;box-shadow:0 0 25px rgba(250,204,21,0.25);text-align:center">
            <div style="font-size:15px;font-weight:900;color:#fde68a;text-transform:uppercase;letter-spacing:0.5px">
              🌟 MELHOR EM CAMPO (MVP DA PARTIDA)!
            </div>
            <div style="font-size:12px;color:#cbd5e1;margin-top:4px">
              Atuação brilhante e decisiva! Você foi eleito o Craque da Partida pela imprensa e torcida!
            </div>
            <div style="display:flex;justify-content:center;gap:8px;margin-top:10px;font-size:11px;font-weight:800;color:#facc15;flex-wrap:wrap">
              <span style="background:rgba(0,0,0,0.5);padding:4px 10px;border-radius:8px;border:1px solid rgba(250,204,21,0.4)">⭐ +100 XP Bônus MVP</span>
              <span style="background:rgba(0,0,0,0.5);padding:4px 10px;border-radius:8px;border:1px solid rgba(250,204,21,0.4)">⚡ +25 Virtuoso</span>
              <span style="background:rgba(0,0,0,0.5);padding:4px 10px;border-radius:8px;border:1px solid rgba(250,204,21,0.4)">🔥 +15 Maverick</span>
              <span style="background:rgba(0,0,0,0.5);padding:4px 10px;border-radius:8px;border:1px solid rgba(250,204,21,0.4)">📈 Confiança Máxima</span>
            </div>
          </div>
        ` : ''}

        ${report.cleanSheet ? `
          <div style="background:rgba(56,189,248,0.18);border:1.5px solid #38bdf8;border-radius:12px;padding:10px;margin-bottom:14px;font-size:12px;color:#7dd3fc;text-align:center">
            🧤 <b>CLEAN SHEET (JOGO SEM SOFRER GOLS)!</b> Muralha defensiva sólida (+20 Heartbeat / Equipe)!
          </div>
        ` : ''}

        <!-- NOTA INDIVIDUAL DO ATLETA -->
        <div style="margin:16px 0;background:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:16px">
          <div style="font-size:11px;font-weight:800;color:#94a3b8">NOTA DA PARTIDA</div>
          <div style="font-size:42px;font-weight:900;color:${report.rating >= 7.5 ? '#10b981' : report.rating >= 6.0 ? '#f59e0b' : '#ef4444'};line-height:1.1;margin-top:4px">
            ${report.played ? report.rating : '—'}
          </div>
          <div style="font-size:12px;color:#cbd5e1;margin-top:6px">
            ${report.played ? `Gols: <b>${report.goals}</b> • Assistências: <b>${report.assists}</b> • Finalizações: <b>${report.shots || 0}</b> (${report.shotsOnTarget || 0} no alvo)` : report.reason}
          </div>
        </div>

        <!-- GANHOS: XP, CONFIANÇA DO TÉCNICO E BÔNUS -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
          <div style="background:#1e293b;border-radius:10px;padding:12px">
            <div style="font-size:11px;color:#94a3b8">XP CONQUISTADO</div>
            <div style="font-size:20px;font-weight:900;color:#10b981">+${report.xpGained} XP</div>
          </div>
          <div style="background:#1e293b;border-radius:10px;padding:12px">
            <div style="font-size:11px;color:#94a3b8">CONFIANÇA DO TÉCNICO</div>
            <div style="font-size:20px;font-weight:900;color:${report.trustDelta >= 0 ? '#10b981' : '#ef4444'}">
              ${report.trustDelta >= 0 ? '+' : ''}${report.trustDelta}%
            </div>
          </div>
        </div>

        ${report.sponsorBonus > 0 ? `
          <div style="background:rgba(16,185,129,0.15);border:1px solid #10b981;border-radius:10px;padding:10px;margin-bottom:16px;font-size:12px;color:#6ee7b7">
            💰 Bônus do Patrocinador Esportivo: <b>+R$ ${report.sponsorBonus.toLocaleString('pt-BR')}</b> creditados na sua conta!
          </div>
        ` : ''}

        ${canGiveInterview ? '<button type="button" id="btnPlayerPostMatchInterview" class="btn" style="width:100%;margin-bottom:8px;background:linear-gradient(135deg,#eab308,#ca8a04);border:none;color:#000;font-size:14px;font-weight:900;padding:12px;border-radius:10px;cursor:pointer">🎙️ Dar entrevista como Craque da Partida</button>' : ''}
        <button type="button" id="btnClosePostMatchModal" class="btn primary" style="width:100%;background:linear-gradient(135deg,${report.isMvp ? '#eab308,#ca8a04' : '#7c3aed,#a855f7'});border:none;color:${report.isMvp ? '#000' : '#fff'};font-size:14px;font-weight:900;padding:12px;border-radius:10px;cursor:pointer">
          CONTINUAR CARREIRA ➔
        </button>

      </div>
    `;

    document.body.appendChild(overlay);

    const interviewButton = overlay.querySelector('#btnPlayerPostMatchInterview');
    if(interviewButton){
      interviewButton.onclick = () => openPlayerPostMatchInterview(report, onContinue);
    }

    const bClose = overlay.querySelector('#btnClosePostMatchModal');
    if(bClose){
      bClose.onclick = () => {
        overlay.remove();
        if(typeof window.save === 'function') window.save();
        if(typeof window.render === 'function') window.render();
        if(typeof onContinue === 'function') onContinue();
      };
    }
  }

  function openPlayerPostMatchInterview(report, onContinue){
    const s = window.state;
    if(!report?.isMvp || s?.gameMode !== 'player' || !s.playerCareerState) return;
    const prior = document.getElementById('afmPlayerPostMatchModal');
    if(prior) prior.remove();
    const athleteName = s.playerCareerState.athleteName || 'Atleta';
    const choices = [
      'Esse prêmio é do grupo. Meus companheiros e a torcida fizeram a diferença.',
      'Fico feliz pelo reconhecimento, mas vou seguir trabalhando para melhorar.',
      'Foi uma grande atuação. Quero manter esse nível e buscar ainda mais.'
    ];
    const modal = document.createElement('div');
    modal.id = 'afmPlayerInterviewModal';
    modal.className = 'modal-overlay';
    modal.style.zIndex = '100000';
    modal.innerHTML = `<div class="modal" style="max-width:560px;width:92%;padding:24px;background:#0b1020;border:2px solid #facc15;border-radius:18px;color:#fff"><div style="font-size:30px">🎙️</div><h2 style="margin:4px 0 8px;color:#fde68a">Entrevista pós-jogo</h2><p style="color:#cbd5e1;line-height:1.5">${esc(athleteName)}, você foi eleito Craque da Partida${report.opponent ? ` contra ${esc(report.opponent)}` : ''}. O que quer dizer à imprensa?</p><div style="display:grid;gap:9px">${choices.map((quote,index) => `<button type="button" class="btn-player-interview-answer" data-answer="${index}" style="padding:12px;text-align:left;color:#fff;background:#151d30;border:1px solid #334155;border-radius:10px;cursor:pointer">${esc(quote)}</button>`).join('')}</div><button type="button" id="btnCancelPlayerInterview" class="btn" style="margin-top:12px;width:100%;padding:10px">Agora não</button></div>`;
    document.body.appendChild(modal);
    modal.querySelector('#btnCancelPlayerInterview').onclick = () => { modal.remove(); showPostMatchSummaryModal(report, null, onContinue); };
    modal.querySelectorAll('.btn-player-interview-answer').forEach(button => {
      button.onclick = () => {
        const quote = choices[Number(button.dataset.answer)];
        const published = window.AFM_SocialMedia?.publishPlayerInterview?.(s, quote, report);
        modal.remove();
        if(published){
          if(typeof window.toast === 'function') window.toast('📰 Entrevista publicada nas notícias e no FootGram!');
          if(typeof window.save === 'function') window.save();
          if(typeof window.render === 'function') window.render();
          if(typeof onContinue === 'function') onContinue();
        } else {
          showPostMatchSummaryModal(report, null, onContinue);
        }
      };
    });
  }

  /**
   * CERIMÔNIA DE GALA DO FIM DE TEMPORADA / MELHORES DO ANO
   * Revela os pódios da Bola de Ouro (Ballon d'Or), Chuteira de Ouro Mundial, Golden Boy e Prêmios da Liga
   */
  function openSeasonGalaAwardsModal(galaData){
    const s = window.state;
    if(!galaData && s && s.gameMode === 'player' && window.AFM_PlayerEngine?.processEndOfSeasonAwards){
      galaData = window.AFM_PlayerEngine.processEndOfSeasonAwards(s, s.season);
    }
    if(!galaData) return;

    const oldModal = document.getElementById('afmSeasonGalaModal');
    if(oldModal) oldModal.remove();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'afmSeasonGalaModal';
    overlay.style.zIndex = '99999';

    window.__afmGalaTab = window.__afmGalaTab || 'ballon';

    function renderGalaContent(){
      const activeTab = window.__afmGalaTab || 'ballon';
      const b3 = galaData.ballonDorTop3 || [];
      const gb3 = galaData.goldenBootTop3 || [];
      const kopa3 = galaData.goldenBoyTop3 || [];
      const leg = galaData.leagueAwards || {};
      const recs = galaData.recordsBroken || [];

      // Helper para renderizar pódio de 3 atletas
      function renderPodium(top3, metricLabel, metricKey, isScore = false){
        const first = top3[0] || { name: '—', club: '—', ovr: 80 };
        const second = top3[1] || { name: '—', club: '—', ovr: 78 };
        const third = top3[2] || { name: '—', club: '—', ovr: 76 };

        return `
          <div style="display:flex;align-items:flex-end;justify-content:center;gap:14px;margin:24px 0 16px 0;min-height:260px">
            
            <!-- 2º LUGAR (PRATA) -->
            <div style="flex:1;max-width:200px;display:flex;flex-direction:column;align-items:center">
              <div style="font-size:26px;margin-bottom:6px">🥈</div>
              <div style="width:100%;background:linear-gradient(180deg,#334155,#1e293b);border:1.5px solid #94a3b8;border-radius:14px 14px 0 0;padding:14px 10px;text-align:center;box-shadow:0 8px 24px rgba(0,0,0,0.5);${second.isUser ? 'border:2px solid #38bdf8;box-shadow:0 0 20px rgba(56,189,248,0.4);' : ''}">
                ${second.isUser ? `<span style="background:#38bdf8;color:#000;font-size:9px;font-weight:900;padding:2px 6px;border-radius:4px;text-transform:uppercase;display:inline-block;margin-bottom:4px">⭐ VOCÊ!</span>` : ''}
                <div style="font-size:24px;margin-bottom:2px">👤</div>
                <div style="font-size:13px;font-weight:900;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(second.name)}</div>
                <div style="font-size:10px;color:#94a3b8">${esc(second.club)}</div>
                <div style="font-size:11px;color:#cbd5e1;font-weight:800;margin-top:6px;background:rgba(0,0,0,0.3);padding:4px;border-radius:6px">
                  ${metricLabel}: <b>${second[metricKey] ?? '—'}</b>
                </div>
              </div>
              <div style="width:100%;background:#0f172a;border-top:2px solid #94a3b8;height:55px;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:900;color:#94a3b8">
                2º
              </div>
            </div>

            <!-- 1º LUGAR (OURO - VENCEDOR) -->
            <div style="flex:1.1;max-width:220px;display:flex;flex-direction:column;align-items:center;transform:translateY(-14px)">
              <div style="font-size:36px;margin-bottom:4px;filter:drop-shadow(0 0 12px rgba(250,204,21,0.8))">👑 🥇</div>
              <div style="width:100%;background:linear-gradient(180deg,#854d0e,#1c1917);border:2px solid #facc15;border-radius:16px 16px 0 0;padding:16px 10px;text-align:center;box-shadow:0 12px 35px rgba(250,204,21,0.25);${first.isUser ? 'border:2.5px solid #fde68a;box-shadow:0 0 30px rgba(250,204,21,0.6);' : ''}">
                ${first.isUser ? `<span style="background:linear-gradient(90deg,#facc15,#eab308);color:#000;font-size:10px;font-weight:900;padding:3px 8px;border-radius:6px;text-transform:uppercase;display:inline-block;margin-bottom:4px">🏆 VOCÊ É O CAMPEÃO!</span>` : `<span style="background:rgba(250,204,21,0.2);color:#fde68a;font-size:9px;font-weight:900;padding:2px 6px;border-radius:4px;text-transform:uppercase">VENCEDOR</span>`}
                <div style="font-size:30px;margin:2px 0">⭐</div>
                <div style="font-size:15px;font-weight:900;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(first.name)}</div>
                <div style="font-size:11px;color:#facc15;font-weight:700">${esc(first.club)}</div>
                <div style="font-size:12px;color:#fde68a;font-weight:900;margin-top:8px;background:rgba(0,0,0,0.5);padding:5px;border-radius:8px;border:1px solid rgba(250,204,21,0.3)">
                  ${metricLabel}: <b>${first[metricKey] ?? '—'}</b>
                </div>
              </div>
              <div style="width:100%;background:#090d16;border-top:2px solid #facc15;height:80px;display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:900;color:#facc15">
                1º
              </div>
            </div>

            <!-- 3º LUGAR (BRONZE) -->
            <div style="flex:1;max-width:200px;display:flex;flex-direction:column;align-items:center">
              <div style="font-size:26px;margin-bottom:6px">🥉</div>
              <div style="width:100%;background:linear-gradient(180deg,#78350f,#1c1917);border:1.5px solid #d97706;border-radius:14px 14px 0 0;padding:12px 10px;text-align:center;box-shadow:0 8px 24px rgba(0,0,0,0.5);${third.isUser ? 'border:2px solid #38bdf8;box-shadow:0 0 20px rgba(56,189,248,0.4);' : ''}">
                ${third.isUser ? `<span style="background:#38bdf8;color:#000;font-size:9px;font-weight:900;padding:2px 6px;border-radius:4px;text-transform:uppercase;display:inline-block;margin-bottom:4px">⭐ VOCÊ!</span>` : ''}
                <div style="font-size:24px;margin-bottom:2px">👤</div>
                <div style="font-size:13px;font-weight:900;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(third.name)}</div>
                <div style="font-size:10px;color:#d97706">${esc(third.club)}</div>
                <div style="font-size:11px;color:#cbd5e1;font-weight:800;margin-top:6px;background:rgba(0,0,0,0.3);padding:4px;border-radius:6px">
                  ${metricLabel}: <b>${third[metricKey] ?? '—'}</b>
                </div>
              </div>
              <div style="width:100%;background:#0f172a;border-top:2px solid #d97706;height:40px;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:900;color:#d97706">
                3º
              </div>
            </div>

          </div>
        `;
      }

      let tabBodyHtml = '';

      if(activeTab === 'ballon'){
        tabBodyHtml = `
          <div>
            <div style="font-size:12px;color:#94a3b8;margin-bottom:4px;text-align:center">
              Avalia o desempenho global de todos os craques do mundo: Overall, Gols, Assistências, Clean Sheets, Nota Média e Títulos.
            </div>
            ${renderPodium(b3, 'Pontuação Oficial', 'ballonScore', true)}
            <div style="background:rgba(255,255,255,0.03);padding:12px 16px;border-radius:12px;border:1px solid rgba(255,255,255,0.08);font-size:12px;color:#cbd5e1;text-align:center">
              Fórmula Oficial da Bola de Ouro: (Overall × 1.2) + (Gols × 1.5) + (Assists × 1.2) + (CleanSheets × 0.8) + (Nota × 8) + (MVPs × 2) + Bônus de Títulos.
            </div>
          </div>
        `;
      } else if(activeTab === 'boot'){
        tabBodyHtml = `
          <div>
            <div style="font-size:12px;color:#94a3b8;margin-bottom:4px;text-align:center">
              Premia o maior artilheiro do futebol mundial considerando os gols multiplicados pelo peso da liga.
            </div>
            ${renderPodium(gb3, 'Pontos de Chuteira', 'goldenBootPoints', true)}
            <div style="background:rgba(255,255,255,0.03);padding:12px 16px;border-radius:12px;border:1px solid rgba(255,255,255,0.08);font-size:12px;color:#cbd5e1;text-align:center">
              Critério: Gols marcados × Multiplicador de Divisão (Série A / Europa: 2.0x • Série B: 1.5x • Série C/D/Estaduais: 1.0x).
            </div>
          </div>
        `;
      } else if(activeTab === 'kopa'){
        tabBodyHtml = `
          <div>
            <div style="font-size:12px;color:#94a3b8;margin-bottom:4px;text-align:center">
              Filtro mundial exclusivo para as maiores promessas do futebol com até 21 anos de idade.
            </div>
            ${renderPodium(kopa3, 'Pontos Sub-21', 'ballonScore', true)}
            <div style="background:rgba(255,255,255,0.03);padding:12px 16px;border-radius:12px;border:1px solid rgba(255,255,255,0.08);font-size:12px;color:#cbd5e1;text-align:center">
              Apenas atletas com idade ≤ 21 anos são elegíveis para a consagração do Golden Boy e Troféu Kopa.
            </div>
          </div>
        `;
      } else if(activeTab === 'league'){
        tabBodyHtml = `
          <div style="display:flex;flex-direction:column;gap:14px">
            <div style="font-size:12px;color:#94a3b8;text-align:center">
              Premiações oficiais concedidas pela federação para os melhores da competição que você disputou (${esc(leg.compName || 'Liga')}).
            </div>
            
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
              
              <!-- 1. MVP DA LIGA -->
              <div style="background:linear-gradient(135deg,rgba(16,185,129,0.1),#090d16);border:1.5px solid ${leg.mvp?.isUser ? '#10b981' : 'rgba(255,255,255,0.1)'};border-radius:14px;padding:16px;position:relative">
                ${leg.mvp?.isUser ? `<span style="position:absolute;top:10px;right:10px;background:#10b981;color:#000;font-size:9px;font-weight:900;padding:2px 6px;border-radius:4px">⭐ VOCÊ!</span>` : ''}
                <div style="font-size:24px">🏅</div>
                <div style="font-size:11px;color:#10b981;font-weight:800;text-transform:uppercase;margin-top:4px">MELHOR DA COMPETIÇÃO (MVP)</div>
                <div style="font-size:16px;font-weight:900;color:#fff;margin:4px 0">${esc(leg.mvp?.winnerName || 'Craque')}</div>
                <div style="font-size:11px;color:#94a3b8">Clube: <b>${esc(leg.mvp?.winnerClub || 'Clube')}</b> • Nota Média: <b>${leg.mvp?.score}</b></div>
              </div>

              <!-- 2. BOTA DE OURO DA LIGA -->
              <div style="background:linear-gradient(135deg,rgba(245,158,11,0.1),#090d16);border:1.5px solid ${leg.topScorer?.isUser ? '#facc15' : 'rgba(255,255,255,0.1)'};border-radius:14px;padding:16px;position:relative">
                ${leg.topScorer?.isUser ? `<span style="position:absolute;top:10px;right:10px;background:#facc15;color:#000;font-size:9px;font-weight:900;padding:2px 6px;border-radius:4px">⭐ VOCÊ!</span>` : ''}
                <div style="font-size:24px">⚽</div>
                <div style="font-size:11px;color:#facc15;font-weight:800;text-transform:uppercase;margin-top:4px">BOTA DE OURO (ARTILHEIRO)</div>
                <div style="font-size:16px;font-weight:900;color:#fff;margin:4px 0">${esc(leg.topScorer?.winnerName || 'Artilheiro')}</div>
                <div style="font-size:11px;color:#94a3b8">Clube: <b>${esc(leg.topScorer?.winnerClub || 'Clube')}</b> • Gols: <b>${leg.topScorer?.goals} gols</b></div>
              </div>

              <!-- 3. GARÇOM DA TEMPORADA -->
              <div style="background:linear-gradient(135deg,rgba(56,189,248,0.1),#090d16);border:1.5px solid ${leg.assistLeader?.isUser ? '#38bdf8' : 'rgba(255,255,255,0.1)'};border-radius:14px;padding:16px;position:relative">
                ${leg.assistLeader?.isUser ? `<span style="position:absolute;top:10px;right:10px;background:#38bdf8;color:#000;font-size:9px;font-weight:900;padding:2px 6px;border-radius:4px">⭐ VOCÊ!</span>` : ''}
                <div style="font-size:24px">🎯</div>
                <div style="font-size:11px;color:#38bdf8;font-weight:800;text-transform:uppercase;margin-top:4px">GARÇOM DA TEMPORADA</div>
                <div style="font-size:16px;font-weight:900;color:#fff;margin:4px 0">${esc(leg.assistLeader?.winnerName || 'Líder')}</div>
                <div style="font-size:11px;color:#94a3b8">Clube: <b>${esc(leg.assistLeader?.winnerClub || 'Clube')}</b> • Assistências: <b>${leg.assistLeader?.assists}</b></div>
              </div>

              <!-- 4. MURALHA / LUVA DE OURO -->
              <div style="background:linear-gradient(135deg,rgba(168,85,247,0.1),#090d16);border:1.5px solid ${leg.goldenGlove?.isUser ? '#c084fc' : 'rgba(255,255,255,0.1)'};border-radius:14px;padding:16px;position:relative">
                ${leg.goldenGlove?.isUser ? `<span style="position:absolute;top:10px;right:10px;background:#c084fc;color:#000;font-size:9px;font-weight:900;padding:2px 6px;border-radius:4px">⭐ VOCÊ!</span>` : ''}
                <div style="font-size:24px">🧤</div>
                <div style="font-size:11px;color:#c084fc;font-weight:800;text-transform:uppercase;margin-top:4px">LUVA DE OURO / MURALHA</div>
                <div style="font-size:16px;font-weight:900;color:#fff;margin:4px 0">${esc(leg.goldenGlove?.winnerName || 'Goleiro')}</div>
                <div style="font-size:11px;color:#94a3b8">Clube: <b>${esc(leg.goldenGlove?.winnerClub || 'Clube')}</b> • Clean Sheets: <b>${leg.goldenGlove?.cleanSheets}</b></div>
              </div>

            </div>
          </div>
        `;
      } else {
        // RECORDES HISTÓRICOS
        tabBodyHtml = `
          <div>
            <div style="font-size:12px;color:#94a3b8;margin-bottom:14px;text-align:center">
              Recordes históricos da competição superados pelo atleta nesta temporada.
            </div>
            ${recs.length > 0 ? `
              <div style="display:flex;flex-direction:column;gap:10px">
                ${recs.map(r => `
                  <div style="background:linear-gradient(135deg,rgba(56,189,248,0.15),#090d16);border:2px solid #38bdf8;border-radius:14px;padding:16px;display:flex;align-items:center;gap:14px">
                    <div style="font-size:36px">📜</div>
                    <div>
                      <div style="font-size:10px;color:#38bdf8;font-weight:900;text-transform:uppercase">NOVO RECORDE HISTÓRICO QUEBRADO!</div>
                      <div style="font-size:16px;font-weight:900;color:#fff">${esc(r.title)}</div>
                      <div style="font-size:13px;color:#fde68a;font-weight:800;margin-top:2px">Nova Marca: ${r.value} • Superou: ${esc(r.previousHolder)}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : `
              <div style="background:#090d16;border:1px dashed rgba(255,255,255,0.1);border-radius:14px;padding:32px 20px;text-align:center;color:#94a3b8;font-size:13px">
                Nenhum recorde histórico foi quebrado nesta temporada. Na próxima temporada, persiga a liderança isolada em gols ou passes decisivos para bater as marcas históricas da liga!
              </div>
            `}
          </div>
        `;
      }

      overlay.innerHTML = `
        <div class="modal" style="max-width:760px;width:94%;background:radial-gradient(circle at top,#231b42,#090d16);border:2px solid #eab308;box-shadow:0 0 50px rgba(234,179,8,0.35);border-radius:24px;padding:26px;color:#fff;text-align:left;max-height:92vh;overflow-y:auto">
          
          <!-- BANNER DO EVENTO -->
          <div style="text-align:center;margin-bottom:18px">
            <div style="font-size:11px;font-weight:900;color:#facc15;text-transform:uppercase;letter-spacing:2px">
              🏆 CERIMÔNIA OFICIAL DE GALA DO FUTEBOL
            </div>
            <h2 style="margin:4px 0 2px 0;font-size:24px;font-weight:900;color:#fff">
              MELHORES DO ANO & PRÊMIOS DA TEMPORADA ${galaData.season} 🌟
            </h2>
          </div>

          <!-- BANNER DE CELEBRAÇÃO CASO O USUÁRIO TENHA VENCIDO ALGUM PRÊMIO -->
          ${galaData.userWonAny ? `
            <div style="background:linear-gradient(135deg,rgba(234,179,8,0.3),rgba(202,138,4,0.15));border:2px solid #facc15;border-radius:16px;padding:16px 20px;margin-bottom:18px;text-align:center;box-shadow:0 0 30px rgba(250,204,21,0.35)">
              <div style="font-size:28px">🎉 👑 🏆</div>
              <div style="font-size:16px;font-weight:900;color:#fde68a;text-transform:uppercase;letter-spacing:0.5px;margin-top:4px">
                PARABÉNS! VOCÊ ENTROU PARA A HISTÓRIA DO FUTEBOL!
              </div>
              <div style="font-size:12px;color:#cbd5e1;margin-top:4px">
                Seu nome foi consagrado entre os melhores do mundo na temporada! O seu valor de mercado aumentou e os maiores clubes do futebol estão de olho em você!
              </div>
            </div>
          ` : ''}

          <!-- SUB-MENU / ABAS DA GALA -->
          <div style="display:flex;gap:8px;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:12px;margin-bottom:18px;overflow-x:auto;-webkit-overflow-scrolling:touch">
            <button type="button" class="btn btn-gala-nav-tab" data-tab="ballon"
              style="flex:1;min-width:140px;padding:10px 12px;border-radius:10px;font-weight:900;font-size:12px;cursor:pointer;${activeTab === 'ballon' ? 'background:#eab308;color:#000;border:none;' : 'background:#16122b;color:#94a3b8;border:1px solid rgba(255,255,255,0.08);'}">
              👑 Bola de Ouro
            </button>
            <button type="button" class="btn btn-gala-nav-tab" data-tab="boot"
              style="flex:1;min-width:140px;padding:10px 12px;border-radius:10px;font-weight:900;font-size:12px;cursor:pointer;${activeTab === 'boot' ? 'background:#f59e0b;color:#000;border:none;' : 'background:#16122b;color:#94a3b8;border:1px solid rgba(255,255,255,0.08);'}">
              👟 Chuteira de Ouro
            </button>
            <button type="button" class="btn btn-gala-nav-tab" data-tab="kopa"
              style="flex:1;min-width:140px;padding:10px 12px;border-radius:10px;font-weight:900;font-size:12px;cursor:pointer;${activeTab === 'kopa' ? 'background:#a855f7;color:#fff;border:none;' : 'background:#16122b;color:#94a3b8;border:1px solid rgba(255,255,255,0.08);'}">
              🌟 Golden Boy (Sub-21)
            </button>
            <button type="button" class="btn btn-gala-nav-tab" data-tab="league"
              style="flex:1;min-width:140px;padding:10px 12px;border-radius:10px;font-weight:900;font-size:12px;cursor:pointer;${activeTab === 'league' ? 'background:#10b981;color:#000;border:none;' : 'background:#16122b;color:#94a3b8;border:1px solid rgba(255,255,255,0.08);'}">
              🏆 Prêmios da Liga
            </button>
            <button type="button" class="btn btn-gala-nav-tab" data-tab="records"
              style="flex:1;min-width:140px;padding:10px 12px;border-radius:10px;font-weight:900;font-size:12px;cursor:pointer;${activeTab === 'records' ? 'background:#38bdf8;color:#000;border:none;' : 'background:#16122b;color:#94a3b8;border:1px solid rgba(255,255,255,0.08);'}">
              📜 Recordes (${recs.length})
            </button>
          </div>

          <!-- CORPO DA ABA SELECIONADA -->
          ${tabBodyHtml}

          <!-- BOTÃO FECHAR GALA -->
          <div style="margin-top:22px">
            <button type="button" id="btnCloseGalaModal" class="btn primary" style="width:100%;background:linear-gradient(135deg,#eab308,#ca8a04);border:none;color:#000;font-size:14px;font-weight:900;padding:14px;border-radius:12px;cursor:pointer;box-shadow:0 6px 20px rgba(234,179,8,0.3)">
              CONTINUAR TRAJETÓRIA NO FUTEBOL ➔
            </button>
          </div>

        </div>
      `;

      // Eventos das abas internas da Gala
      overlay.querySelectorAll('.btn-gala-nav-tab').forEach(b => {
        b.onclick = () => {
          window.__afmGalaTab = b.dataset.tab;
          renderGalaContent();
        };
      });

      // Fechar modal
      const bClose = overlay.querySelector('#btnCloseGalaModal');
      if(bClose){
        bClose.onclick = () => {
          overlay.remove();
          if(typeof window.save === 'function') window.save();
          if(typeof window.render === 'function') window.render();
        };
      }
    }

    renderGalaContent();
    document.body.appendChild(overlay);
  }

  // Binds de eventos das abas do jogador
  function bindPlayerModeEvents(){
    const s = window.state;
    if(!s || s.gameMode !== 'player') return;
    const pState = s.playerCareerState;
    const athlete = getControlledPlayer(s);

    document.querySelectorAll('.btn-player-club-subtab').forEach(btn => {
      btn.onclick = () => {
        window.__afmPlayerClubSubTab = btn.dataset.subtab === 'debts' ? 'debts' : 'squad';
        window.render?.();
        document.querySelector(`.btn-player-club-subtab[data-subtab="${window.__afmPlayerClubSubTab}"]`)?.focus();
      };
      btn.onkeydown = event => {
        if(event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        const tabs = [...document.querySelectorAll('.btn-player-club-subtab')];
        const next = tabs[(tabs.indexOf(btn) + (event.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
        next?.click();
      };
    });

    document.getElementById('btnPlayerSalaryClaim')?.addEventListener('click', () => {
      const result = window.AFM_PlayerEngine?.filePlayerSalaryClaim?.(s);
      if(!result?.ok){
        showCustomAlert({ title: 'Cobrança de salário', message: result?.error || 'Não foi possível abrir o processo.', type: 'warning' });
        return;
      }
      window.save?.();
      window.render?.();
      showCustomAlert({ title: 'Advogado contratado', message: `A cobrança de R$ ${result.amount.toLocaleString('pt-BR')} foi aberta. Honorários: R$ ${result.fee.toLocaleString('pt-BR')}. O processo será atualizado a cada virada de mês.`, type: 'success' });
    });

    // Botão de Rever Cerimônia de Gala
    document.querySelectorAll('.btn-open-gala-modal').forEach(btn => {
      btn.onclick = () => {
        let gala = pState?.lastSeasonGalaAwards;
        if(!gala && window.AFM_PlayerEngine?.processEndOfSeasonAwards){
          gala = window.AFM_PlayerEngine.processEndOfSeasonAwards(s, s.season);
        }
        openSeasonGalaAwardsModal(gala);
      };
    });

    // Sub-abas de Estatísticas e Troféus
    document.querySelectorAll('.btn-player-stats-subtab').forEach(btn => {
      btn.onclick = () => {
        const target = btn.dataset.subtab || 'season';
        window.__afmPlayerStatsSubTab = target;
        if(typeof window.render === 'function') window.render();
      };
    });

    // Jogar Partida ao Vivo (Motor Real 2D/3D em Tempo Real)
    document.querySelectorAll('.btn-player-play-live').forEach(btn => {
      btn.onclick = () => {
        if(typeof window.startLiveMatch === 'function'){
          const activeMatch = (typeof window.getActualCurrentMatch === 'function') ? window.getActualCurrentMatch(s) : null;
          if(activeMatch && activeMatch.date){
            s.date = activeMatch.date;
            s.currentDate = activeMatch.date;
          }
          window.startLiveMatch();
        }
      };
    });

    // Simulação Rápida da Partida
    document.querySelectorAll('.btn-player-play-quick').forEach(btn => {
      btn.onclick = () => {
        const activeMatch = (typeof window.getActualCurrentMatch === 'function') ? window.getActualCurrentMatch(s) : null;
        if(activeMatch && activeMatch.date){
          s.date = activeMatch.date;
          s.currentDate = activeMatch.date;
        }
        if(typeof window.simulateQuickRound === 'function'){
          window.simulateQuickRound();
        }
        const pEng = window.AFM_PlayerEngine;
        if(pEng){
          const trust = pState?.managerTrust || 35;
          const played = trust >= 30;
          const isStarter = trust >= 60;
          const goals = played && Math.random() < 0.35 ? 1 : 0;
          const assists = played && Math.random() < 0.25 ? 1 : 0;
          const rating = played ? Number((6.0 + (goals * 1.5) + (assists * 0.8) + Math.random() * 1.2).toFixed(1)) : 0;
          const rep = pEng.processMatchPerformance(s, {
            goals,
            assists,
            rating,
            played,
            playedMinutes: isStarter ? 90 : (played ? 30 : 0)
          });
          showPostMatchSummaryModal(s, rep);
        }
      };
    });

    // Avançar até o Dia do Jogo
    document.querySelectorAll('.btn-player-advance-to-match').forEach(btn => {
      btn.onclick = () => {
        if(window.AFM_CalendarFix && typeof window.AFM_CalendarFix.advanceToNextMatchGuaranteed === 'function'){
          window.AFM_CalendarFix.advanceToNextMatchGuaranteed(s);
        } else if(typeof window.advanceCalendarDays === 'function'){
          window.advanceCalendarDays(3, true);
        }
        if(window.AFM_PlayerEngine){
          window.AFM_PlayerEngine.processWeeklyTraining(s);
        }
        if(typeof window.save === 'function') window.save();
        if(typeof window.render === 'function') window.render();
      };
    });

    // Avançar 1 Dia
    document.querySelectorAll('.btn-player-advance-1day').forEach(btn => {
      btn.onclick = () => {
        if(typeof window.advanceDay === 'function'){
          window.advanceDay();
        } else if(typeof window.advanceCalendarDays === 'function'){
          window.advanceCalendarDays(1, true);
        }
        if(window.AFM_PlayerEngine){
          window.AFM_PlayerEngine.processWeeklyTraining(s);
        }
        if(typeof window.save === 'function') window.save();
        if(typeof window.render === 'function') window.render();
      };
    });

    // Gasto de Skill Points
    document.querySelectorAll('.btn-upgrade-skill').forEach(btn => {
      btn.onclick = () => {
        const k = btn.dataset.attr;
        if(!athlete || !pState || !k) return;
        const pending = pState.pendingAttributePoints || (pState.pendingAttributePoints = {});
        const pendingTotal = Object.values(pending).reduce((sum, value) => sum + Math.max(0, Number(value) || 0), 0);
        const baseValue = Number(athlete.attributes?.[k]) || 35;
        if(pState.skillPoints > pendingTotal && baseValue + (pending[k] || 0) < 99){
          pending[k] = (pending[k] || 0) + 1;
          if(typeof window.save === 'function') window.save();
          if(typeof window.render === 'function') window.render();
        }
      };
    });

    document.querySelectorAll('.btn-decrease-skill').forEach(btn => {
      btn.onclick = () => {
        const k = btn.dataset.attr;
        const pending = pState?.pendingAttributePoints;
        if(!pending || !pending[k]) return;
        pending[k]--;
        if(!pending[k]) delete pending[k];
        if(typeof window.save === 'function') window.save();
        if(typeof window.render === 'function') window.render();
      };
    });

    const btnConfirmSkillPoints = document.querySelector('.btn-confirm-skill-points');
    if(btnConfirmSkillPoints) btnConfirmSkillPoints.onclick = () => {
      if(!athlete || !pState) return;
      const pending = pState.pendingAttributePoints || {};
      const pendingTotal = Object.values(pending).reduce((sum, value) => sum + Math.max(0, Number(value) || 0), 0);
      if(!pendingTotal || pendingTotal > (pState.skillPoints || 0)) return;
      athlete.attributes = athlete.attributes || { vel:35, chu:35, pas:35, dri:35, def:35, fis:35 };
      Object.entries(pending).forEach(([key, amount]) => {
        athlete.attributes[key] = Math.min(99, (Number(athlete.attributes[key]) || 35) + Math.max(0, Number(amount) || 0));
      });
      pState.skillPoints -= pendingTotal;
      pState.pendingAttributePoints = {};
      syncControlledPlayerOverall(s);
      if(typeof window.save === 'function') window.save();
      if(typeof window.render === 'function') window.render();
    };

    // Mudança de Foco de Treino
    document.querySelectorAll('.card-training-option').forEach(el => {
      el.onclick = () => {
        if(pState){
          pState.weeklyTrainingFocus = el.dataset.focus;
          if(typeof window.save === 'function') window.save();
          if(typeof window.render === 'function') window.render();
        }
      };
    });

    // Prática Livre de Pênaltis e Faltas (Minigame)
    const btnPracPen = document.querySelector('.btn-practice-penalty');
    if(btnPracPen){
      btnPracPen.onclick = () => {
        if(window.AFM_InteractiveSetPieces && typeof window.AFM_InteractiveSetPieces.openPenaltyModal === 'function'){
          const mySquad = s.squad || [];
          const gk = mySquad.find(p => p.pos === 'GOL' || p.pos === 'GK') || { name: 'Goleiro Titular', overall: 68 };
          const mockMatch = {
            home: s.club || 'Clube',
            away: 'Treino Tático',
            hg: 0, ag: 0,
            homePlayers: [{ ...athlete, isControlledAthlete: true }],
            awayPlayers: [gk],
            stats: { shotsH: 0, shotsA: 0, targetH: 0, targetA: 0, xGH: 0, xGA: 0, savesH: 0, savesA: 0, cornersH: 0, cornersA: 0 },
            events: [],
            prng: Math.random
          };
          window.AFM_InteractiveSetPieces.openPenaltyModal(mockMatch, 90, athlete, gk, true, (res) => {
            if(res.isGoal && pState){
              pState.xp = (pState.xp || 0) + 25;
              if(typeof window.toast === 'function') window.toast('🎯 Golaço no treino! +25 XP conquistado!');
              if(typeof window.save === 'function') window.save();
              if(typeof window.render === 'function') window.render();
            }
          });
        }
      };
    }

    const btnPracFk = document.querySelector('.btn-practice-freekick');
    if(btnPracFk){
      btnPracFk.onclick = () => {
        if(window.AFM_InteractiveSetPieces && typeof window.AFM_InteractiveSetPieces.openFreeKickModal === 'function'){
          const mySquad = s.squad || [];
          const gk = mySquad.find(p => p.pos === 'GOL' || p.pos === 'GK') || { name: 'Goleiro Titular', overall: 68 };
          const mockMatch = {
            home: s.club || 'Clube',
            away: 'Treino Tático',
            hg: 0, ag: 0,
            homePlayers: [{ ...athlete, isControlledAthlete: true }],
            awayPlayers: [gk],
            stats: { shotsH: 0, shotsA: 0, targetH: 0, targetA: 0, xGH: 0, xGA: 0, savesH: 0, savesA: 0, cornersH: 0, cornersA: 0 },
            events: [],
            prng: Math.random
          };
          window.AFM_InteractiveSetPieces.openFreeKickModal(mockMatch, 90, athlete, gk, true, (res) => {
            if(res.isGoal && pState){
              pState.xp = (pState.xp || 0) + 35;
              if(typeof window.toast === 'function') window.toast('🎯 Golaço de falta no treino! +35 XP conquistado!');
              if(typeof window.save === 'function') window.save();
              if(typeof window.render === 'function') window.render();
            }
          });
        }
      };
    }

    // Ações de Empresário
    document.querySelectorAll('.btn-agent-action').forEach(btn => {
      btn.onclick = () => {
        const action = btn.dataset.action;
        handleAgentAction(action, s, athlete, pState);
      };
    });

    // Buscar Propostas na Janela Aberta
    const bScoutMarket = document.querySelector('.btn-scout-transfer-market');
    if(bScoutMarket){
      bScoutMarket.onclick = () => {
        handleAgentAction('request_transfer', s, athlete, pState);
      };
    }

    // Filtros de Categoria de Propostas
    document.querySelectorAll('.btn-agent-category').forEach(btn => {
      btn.onclick = () => {
        window.__afmAgentOfferCategory = btn.dataset.category || 'all';
        if(typeof window.render === 'function') window.render();
      };
    });

    // Navegação de Sub-Abas em Estatísticas & Troféus (Dados da Temporada, Sala de Troféus, Histórico)
    document.querySelectorAll('.btn-player-stats-subtab').forEach(btn => {
      btn.onclick = () => {
        window.__afmPlayerStatsSubTab = btn.dataset.subtab || 'season';
        if(typeof window.render === 'function') window.render();
      };
    });

    // Abrir Súmula Pop-up dos Detalhes da Partida em Histórico
    document.querySelectorAll('.btn-match-history-row, .btn-view-match-details').forEach(el => {
      el.onclick = (e) => {
        const idx = Number(el.dataset.matchIdx);
        const historyList = pState.matchRatingHistory || [];
        const match = historyList[idx];
        if(match){
          openMatchDetailsPopup(match, s);
        }
      };
    });

    // Disputar Partida da Seleção na Data FIFA
    const bStartNat = document.getElementById('btnStartNationalMatch');
    if(bStartNat){
      bStartNat.onclick = () => {
        if(window.AFM_NationalTeams && typeof window.AFM_NationalTeams.simulateNationalTeamMatch === 'function'){
          window.AFM_NationalTeams.simulateNationalTeamMatch(s);
          if(typeof window.save === 'function') window.save();
          if(typeof window.render === 'function') window.render();
        }
      };
    }

    // Abrir Modal de Convocação Oficial da Seleção
    const bPrevCallUp = document.getElementById('btnPreviewCallUpModal');
    if(bPrevCallUp){
      bPrevCallUp.onclick = () => {
        const userCountry = window.AFM_NationalTeams?.normalizeNationality(pState.nationality || 'Brasil') || 'Brasil';
        const callUp = window.AFM_NationalTeams?.generateNationalTeamCallUp(userCountry, s);
        const fix = pState.fifaFixture || {
          windowName: 'Data FIFA · Amistoso Oficial',
          date: s.date,
          awayCountry: callUp?.meta?.rivals?.[0] || 'Argentina',
          userIsCalledUp: callUp?.isUserCalledUp,
          userIsStarter: callUp?.userSectorRanking <= 3,
          userCallUp: callUp
        };
        openCallUpAnnouncementModal(fix, s);
      };
    }

    // =========================================================================
    // EVENTOS DO FOOTGRAM (REDE SOCIAL)
    // =========================================================================
    document.querySelectorAll('.btn-social-cat-pill').forEach(btn => {
      btn.onclick = () => {
        window._afmSocialActiveCategory = btn.dataset.cat || 'training';
        if(typeof window.render === 'function') window.render();
      };
    });

    document.querySelectorAll('.social-template-card').forEach(card => {
      card.onclick = () => {
        const tplId = card.dataset.templateId;
        if(tplId){
          window._afmSocialSelectedTemplateId = tplId;
          document.querySelectorAll('.social-template-card').forEach(c => {
            const isSel = (c.dataset.templateId === tplId);
            c.style.background = isSel ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.03)';
            c.style.borderColor = isSel ? '#10b981' : 'rgba(255,255,255,0.08)';
            const ind = c.querySelector('div:first-child');
            if(ind && ind.style.borderRadius === '50%'){
              ind.style.borderColor = isSel ? '#10b981' : '#64748b';
              ind.style.background = isSel ? '#10b981' : 'transparent';
              ind.innerHTML = isSel ? '<span style="color:#000;font-size:8px;font-weight:900">✓</span>' : '';
            }
          });
          if(typeof window.render === 'function') window.render();
        }
      };
    });

    const btnPubSocial = document.getElementById('btnPublishFootGramPost');
    if(btnPubSocial){
      btnPubSocial.onclick = () => {
        const tplId = window._afmSocialSelectedTemplateId || 'tpl_training_1';
        if(window.AFM_SocialMedia?.publishUserPost){
          const res = window.AFM_SocialMedia.publishUserPost(tplId, s);
          if(!res.ok){
            showCustomAlert({ title: 'Aviso do FootGram', message: res.error, type: 'warning' });
            return;
          }
          if(typeof window.save === 'function') window.save();
          if(typeof window.render === 'function') window.render();
          
          if(res.isBadPhase && res.followersDelta < 0){
            showCustomAlert({
              title: 'Repercussão Negativa no FootGram ⚠️',
              message: `A torcida criticou duramente sua postagem de folga/ostentação após uma partida abaixo da média!\n\nVocê perdeu ${Math.abs(res.followersDelta)} seguidores e sofreu cobranças nos comentários. Menos foto e mais futebol!`,
              type: 'danger'
            });
          } else {
            showCustomAlert({
              title: 'Publicado com Sucesso! 🚀',
              message: `Sua mensagem está no ar no FootGram!\n\nEngajamento imediato: +${res.followersDelta} seguidores conquistados! Confira os comentários e reações no feed.`,
              type: 'success'
            });
          }
        }
      };
    }

    document.querySelectorAll('.btn-social-filter-pill').forEach(btn => {
      btn.onclick = () => {
        window._afmSocialActiveFilter = btn.dataset.filter || 'all';
        if(typeof window.render === 'function') window.render();
      };
    });

    document.querySelectorAll('.btn-social-like').forEach(btn => {
      btn.onclick = () => {
        const pid = btn.dataset.postId;
        if(pid && window.AFM_SocialMedia?.toggleLikePost){
          window.AFM_SocialMedia.toggleLikePost(pid, s);
          if(typeof window.save === 'function') window.save();
          if(typeof window.render === 'function') window.render();
        }
      };
    });

    document.querySelectorAll('.btn-toggle-comments').forEach(btn => {
      btn.onclick = () => {
        const pid = btn.dataset.postId;
        if(pid){
          window._afmSocialExpandedComments[pid] = !window._afmSocialExpandedComments[pid];
          if(typeof window.render === 'function') window.render();
        }
      };
    });

    document.querySelectorAll('.btn-submit-comment').forEach(btn => {
      btn.onclick = () => {
        const pid = btn.dataset.postId;
        const input = document.querySelector(`.input-add-comment[data-post-id="${pid}"]`);
        if(input && input.value.trim() && window.AFM_SocialMedia?.addCommentToPost){
          window.AFM_SocialMedia.addCommentToPost(pid, input.value.trim(), s);
          input.value = '';
          if(typeof window.save === 'function') window.save();
          if(typeof window.render === 'function') window.render();
        }
      };
    });

    const btnOpenHandle = document.getElementById('btnOpenEditHandleModal');
    if(btnOpenHandle) btnOpenHandle.onclick = () => openEditHandleModal(s);

    const btnOpenBio = document.getElementById('btnOpenEditBioModal');
    if(btnOpenBio) btnOpenBio.onclick = () => openEditBioModal(s);

    const btnOpenAvatar = document.getElementById('btnOpenChangeAvatarModal');
    if(btnOpenAvatar) btnOpenAvatar.onclick = () => openChangeAvatarModal(s);

    // Marcar Todas as Propostas como Lidas
    const bMarkAll = document.getElementById('btnMarkAllOffersRead');
    if(bMarkAll){
      bMarkAll.onclick = () => {
        (pState.agentOffers || []).forEach(o => { o.isRead = true; });
        if(typeof window.save === 'function') window.save();
        if(typeof window.render === 'function') window.render();
      };
    }

    // Marcar Proposta Individual como Lida
    document.querySelectorAll('.btn-mark-offer-read').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const idx = Number(btn.dataset.index);
        if(pState.agentOffers && pState.agentOffers[idx]){
          pState.agentOffers[idx].isRead = true;
          if(typeof window.save === 'function') window.save();
          if(typeof window.render === 'function') window.render();
        }
      };
    });

    // Clique no Card para Abrir Detalhes da Proposta
    document.querySelectorAll('.agent-offer-card').forEach(card => {
      card.onclick = (e) => {
        if(e.target.closest('button')) return;
        const idx = Number(card.dataset.index);
        const offer = pState.agentOffers ? pState.agentOffers[idx] : null;
        if(offer){
          openOfferDetailsModal(offer, idx, s, athlete, pState);
        }
      };
    });

    // Ver Detalhes da Proposta (Lupa de Negociação no Card)
    document.querySelectorAll('.btn-view-offer-details').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const idx = Number(btn.dataset.index);
        const offer = pState.agentOffers ? pState.agentOffers[idx] : null;
        if(offer){
          openOfferDetailsModal(offer, idx, s, athlete, pState);
        }
      };
    });

    // Aceitar / Recusar Propostas
    document.querySelectorAll('.btn-accept-offer').forEach(btn => {
      btn.onclick = () => {
        const idx = Number(btn.dataset.index);
        const offer = pState.agentOffers[idx];
        if(offer){
          let sponsorTerms = null;
          if(offer.type === 'transfer' || offer.type === 'club_loan'){
            const isWindowOpen = (typeof isTransferWindowOpen === 'function')
              ? isTransferWindowOpen(s.date)
              : false;
            if(!isWindowOpen){
              showCustomAlert({
                title: 'Janela de Transferências Fechada! 🔒',
                message: `O mercado da bola está FECHADO na data atual (${formatDatePtBr(s.date)}).\n\nVocê só pode mudar de clube durante a Janela de Transferências aberta (Janeiro/Fevereiro e Julho/Agosto).\n\nAguarde a reabertura oficial da janela para formalizar sua transferência!`,
                icon: '🔒',
                type: 'warning'
              });
              return;
            }
            pState.agentOffers.splice(idx, 1);
            executePlayerTransfer(offer, s, athlete, pState);
            return;
          }
          if(offer.type === 'sponsor'){
            const curDate = s.date || s.currentDate || '2026-01-18';
            const signed = window.AFM_PlayerEngine?.signSponsorContract(pState, offer, curDate);
            if(!signed?.ok){
              showCustomAlert({ title: 'Saldo insuficiente para a rescisão ⚖️', message: `A multa para encerrar o contrato atual é de R$ ${(signed?.terminationFee || 0).toLocaleString('pt-BR')}. Faltam R$ ${(signed?.shortfall || 0).toLocaleString('pt-BR')}.`, type: 'warning' });
              return;
            }
            if(offer.renewalBonus && offer.renewalBonus > 0){
              pState.personalBank = (pState.personalBank || 0) + offer.renewalBonus;
            }
            sponsorTerms = signed;
          }
          pState.agentOffers.splice(idx, 1);
          showCustomAlert({
            title: offer.isRenewal ? 'Renovação Concluída! ✍️' : 'Proposta Aceita! 👟',
            message: `Contrato assinado com sucesso por ${sponsorTerms?.durationDays || offer.durationDays || 180} dias!${sponsorTerms?.terminationFee ? `\nMulta de rescisão anterior: R$ ${sponsorTerms.terminationFee.toLocaleString('pt-BR')} paga.` : ''}\n${(offer.renewalBonus && offer.renewalBonus > 0) ? `Luvas de R$ ${offer.renewalBonus.toLocaleString('pt-BR')} creditadas na sua conta pessoal!\n` : ''}Os novos termos já estão em vigor para sua carreira!`,
            type: 'success',
            onConfirm: () => {
              if(typeof window.save === 'function') window.save();
              if(typeof window.render === 'function') window.render();
            }
          });
        }
      };
    });
    document.querySelectorAll('.btn-reject-offer').forEach(btn => {
      btn.onclick = () => {
        const idx = Number(btn.dataset.index);
        pState.agentOffers.splice(idx, 1);
        if(typeof window.save === 'function') window.save();
        if(typeof window.render === 'function') window.render();
      };
    });

    document.querySelectorAll('.btn-sponsor-details').forEach(btn => {
      btn.onclick = () => {
        const offer = (pState.availableSponsorOffers || []).find(item => String(item.id) === String(btn.dataset.sponsorId));
        if(!offer) return;
        const fee = pState.sponsorContract ? (window.AFM_PlayerEngine?.getSponsorTerminationFee(pState.sponsorContract, s.date || s.currentDate) || 0) : 0;
        showCustomAlert({
          title: `Proposta ${offer.brand || offer.name} 👟`,
          message: `Duração: ${offer.durationDays || 180} dias\nMensalidade: R$ ${Number(offer.monthlyStipend || 0).toLocaleString('pt-BR')}/mês\nBônus por gol: R$ ${Number(offer.bonusGoal || 0).toLocaleString('pt-BR')}\nBônus por assistência: R$ ${Number(offer.bonusAssist || 0).toLocaleString('pt-BR')}\nBônus por vitória: R$ ${Number(offer.bonusWin || 0).toLocaleString('pt-BR')}\nBônus de assinatura: R$ ${Number(offer.renewalBonus || 0).toLocaleString('pt-BR')}\nBônus atual nas chuteiras: +${Number(window.AFM_PlayerEngine?.getSponsorBootBonus(offer) || 0)} em finalização\nMulta estimada para trocar agora: R$ ${fee.toLocaleString('pt-BR')}\nSaldo pessoal: R$ ${Number(pState.personalBank || 0).toLocaleString('pt-BR')}`,
          type: 'info'
        });
      };
    });

    // Assinar / Trocar Patrocinador
    document.querySelectorAll('.btn-sign-sponsor').forEach(btn => {
      btn.onclick = () => {
        const spId = btn.dataset.sponsorId;
        const allPool = [
          ...(pState.availableSponsorOffers || []),
          ...(window.AFM_PlayerEngine?.SPONSOR_TIERS_CATALOG || []),
          ...(window.AFM_PlayerEngine?.SPONSOR_OFFERS || [])
        ];
        const sp = allPool.find(o => o.id === spId);
        if(sp && pState){
          const curDate = s.date || s.currentDate || '2026-01-18';
          const wasSwitch = Boolean(pState.sponsorContract);
          const oldBrand = pState.sponsorContract?.brand;
          const signed = window.AFM_PlayerEngine?.signSponsorContract(pState, sp, curDate);
          if(!signed?.ok){
            showCustomAlert({ title: 'Saldo insuficiente para a rescisão ⚖️', message: `A multa para encerrar o contrato atual é de R$ ${(signed?.terminationFee || 0).toLocaleString('pt-BR')}. Faltam R$ ${(signed?.shortfall || 0).toLocaleString('pt-BR')}.`, type: 'warning' });
            return;
          }
          const totalDays = signed.durationDays;
          const endDate = signed.endDate;

          // Remove da lista de propostas disponíveis pois agora é o contrato em vigor
          if(Array.isArray(pState.availableSponsorOffers)){
            pState.availableSponsorOffers = pState.availableSponsorOffers.filter(o => o.id !== sp.id);
          }

          showCustomAlert({
            title: wasSwitch ? `Fornecedor Atualizado para ${sp.brand}! 👟` : 'Patrocínio Oficial Assinado! 👟',
            message: `${wasSwitch ? `Fornecedor anterior: ${oldBrand}\nMulta de rescisão paga: R$ ${Number(signed.terminationFee || 0).toLocaleString('pt-BR')}\n` : ''}Novo fornecedor: ${sp.brand}\nVigência: ${totalDays} dias (até ${formatDatePtBr(endDate)})\nMensalidade: R$ ${Number(sp.monthlyStipend || 0).toLocaleString('pt-BR')}/mês\nBônus por gol: R$ ${Number(sp.bonusGoal || 0).toLocaleString('pt-BR')}\nBônus por assistência: R$ ${Number(sp.bonusAssist || 0).toLocaleString('pt-BR')}\nBônus por vitória: R$ ${Number(sp.bonusWin || 0).toLocaleString('pt-BR')}\nBônus em finalização: +${Number(window.AFM_PlayerEngine?.getSponsorBootBonus(sp) || 0)}\n${sp.renewalBonus ? `Luvas: R$ ${Number(sp.renewalBonus).toLocaleString('pt-BR')}\n` : ''}Efeito do contrato ativo já aplicado à carreira.`,
            type: 'success',
            onConfirm: () => {
              if(typeof window.save === 'function') window.save();
              if(typeof window.render === 'function') window.render();
            }
          });
        }
      };
    });
    const bCancelSp = document.querySelector('.btn-cancel-sponsor');
    if(bCancelSp){
      bCancelSp.onclick = () => {
        if(pState && pState.sponsorContract){
          const oldBrand = pState.sponsorContract.brand || 'material esportivo';
          const result = window.AFM_PlayerEngine?.terminateSponsorContract(pState, s.date || s.currentDate || '2026-01-18');
          if(!result?.ok){
            showCustomAlert({ title: 'Saldo insuficiente para a rescisão ⚖️', message: `A multa para encerrar o contrato é de R$ ${(result?.terminationFee || 0).toLocaleString('pt-BR')}. Faltam R$ ${(result?.shortfall || 0).toLocaleString('pt-BR')}.`, type: 'warning' });
            return;
          }
          showCustomAlert({
            title: 'Contrato Rescindido 👟',
            message: `O contrato com a ${oldBrand} foi encerrado. Multa paga: R$ ${result.terminationFee.toLocaleString('pt-BR')}.\nVocê está livre no mercado para assinar com outra marca ou aguardar novas propostas.`,
            type: 'info',
            onConfirm: () => {
              if(typeof window.save === 'function') window.save();
              if(typeof window.render === 'function') window.render();
            }
          });
        }
      };
    }

    // Contratar / Comprar Estilo de Vida
    document.querySelectorAll('.btn-buy-lifestyle').forEach(btn => {
      btn.onclick = () => {
        const itemId = btn.dataset.itemId;
        const item = window.AFM_PlayerEngine?.LIFESTYLE_CATALOG?.find(i => i.id === itemId);
        if(item && pState && (item.id !== 'luxury_boots' || !(pState.luxuryItems || []).includes('luxury_boots')) && (pState.personalBank || 0) >= item.cost){
          pState.personalBank -= item.cost;
          if(item.category === 'staff'){
            pState.lifestylePerks[item.id] = true;
          } else {
            pState.luxuryItems = pState.luxuryItems || [];
            pState.luxuryItems.push(item.id);
            if(item.id === 'luxury_boots') pState.luxuryBootsEquipped = true;
          }
          syncControlledPlayerOverall(s);
          showCustomAlert({
            title: 'Aquisição Concluída',
            message: `Você adquiriu: ${item.name}!\nBenefício ativado: ${item.benefit}`,
            type: 'success',
            onConfirm: () => {
              if(typeof window.save === 'function') window.save();
              if(typeof window.render === 'function') window.render();
            }
          });
        }
      };
    });

    document.querySelectorAll('.btn-toggle-lifestyle-equip').forEach(btn => {
      btn.onclick = () => {
        if(btn.dataset.itemId !== 'luxury_boots' || !(pState.luxuryItems || []).includes('luxury_boots')) return;
        pState.luxuryBootsEquipped = pState.luxuryBootsEquipped === false;
        syncControlledPlayerOverall(s);
        if(typeof window.save === 'function') window.save();
        if(typeof window.render === 'function') window.render();
      };
    });

    // Contratar Membro de Staff Pessoal
    document.querySelectorAll('.btn-hire-staff').forEach(btn => {
      btn.onclick = () => {
        const staffId = btn.dataset.staffId;
        const res = window.AFM_PlayerEngine?.hireStaffMember ? window.AFM_PlayerEngine.hireStaffMember(s, staffId) : { success: false, message: 'Erro ao contratar staff.' };
        showCustomAlert({
          title: res.success ? 'Staff Contratado! ⭐' : 'Saldo Insuficiente ❌',
          message: res.message,
          type: res.success ? 'success' : 'warning',
          onConfirm: () => {
            if(typeof window.save === 'function') window.save();
            if(typeof window.render === 'function') window.render();
          }
        });
      };
    });

    // Dispensar Membro de Staff Pessoal
    document.querySelectorAll('.btn-dismiss-staff').forEach(btn => {
      btn.onclick = () => {
        const staffId = btn.dataset.staffId;
        const res = window.AFM_PlayerEngine?.dismissStaffMember ? window.AFM_PlayerEngine.dismissStaffMember(s, staffId) : { success: false, message: 'Erro ao dispensar staff.' };
        showCustomAlert({
          title: 'Vínculo Encerrado 📋',
          message: res.message,
          type: 'info',
          onConfirm: () => {
            if(typeof window.save === 'function') window.save();
            if(typeof window.render === 'function') window.render();
          }
        });
      };
    });

    // Abrir Modal de Mercado de Empresários
    document.querySelectorAll('.btn-open-agent-modal').forEach(btn => {
      btn.onclick = () => {
        openAgentMarketModal(s);
      };
    });
  }

  function getCandidateClubsForPlayer(athleteOvr, currentClub, state){
    let pool = [];
    if(athleteOvr < 48){
      pool = ['Ceilândia', 'Gama', 'Real Brasília', 'Capital-DF', 'Paranoá', 'Madureira', 'Campinense', 'Maringá', 'Portuguesa-RJ', 'Santa Cruz', 'Cascavel', 'Sousa', 'América-RN', 'Treze'];
    } else if(athleteOvr < 63){
      pool = ['Volta Redonda', 'Botafogo-PB', 'Náutico', 'Ponte Preta', 'Vila Nova', 'Paysandu', 'Chapecoense', 'Guarani', 'Figueirense', 'Novorizontino', 'Criciúma', 'Juventude'];
    } else {
      pool = ['Santos', 'Sport', 'Ceará', 'Fortaleza', 'Bahia', 'Vasco', 'Cruzeiro', 'Internacional', 'Grêmio', 'Corinthians', 'Palmeiras', 'Flamengo', 'São Paulo', 'Atlético-MG'];
    }
    return pool.filter(c => c !== currentClub);
  }

  function executePlayerTransfer(offer, state, athlete, pState){
    const oldClub = state.club;
    const newClub = offer.newClub || offer.clubOrBrand;
    if(!newClub) return;

    // Regra inviolável: Atleta SÓ pode se transferir ou ser emprestado durante a Janela de Transferências aberta!
    const isWindowOpen = (typeof isTransferWindowOpen === 'function')
      ? isTransferWindowOpen(state.date)
      : (function(dStr){
          if(!dStr) return false;
          const parts = String(dStr).split('-');
          if(parts.length < 3) return false;
          const m = parseInt(parts[1], 10);
          const d = parseInt(parts[2], 10);
          return (m === 1 || m === 2 || (m === 3 && d <= 1) || m === 6 || m === 7 || (m === 8 && d <= 1));
        })(state.date);

    if(!isWindowOpen){
      showCustomAlert({
        title: 'Janela de Transferências Fechada! 🔒',
        message: `O mercado da bola está FECHADO na data atual (${formatDatePtBr(state.date)}).\n\nVocê só pode assinar contrato e mudar de clube durante a Janela de Transferências aberta (Janeiro/Fevereiro e Julho/Agosto).\n\nAguarde a reabertura do mercado para formalizar sua ida ao ${newClub}!`,
        icon: '🔒',
        type: 'warning'
      });
      return false;
    }

    // 1. Atualizar clube e competição primária usando AFM_PlayerEngine
    state.club = newClub;
    pState.transferListing = null;
    if(pState.actionRequests){
      if(pState.actionRequests.request_loan) pState.actionRequests.request_loan.active = false;
      if(pState.actionRequests.request_transfer) pState.actionRequests.request_transfer.active = false;
    }
    const newCompId = window.AFM_PlayerEngine?.getClubPrimaryCompetitionId(newClub) || 'bra-est-df';
    state.compId = newCompId;

    // 2. Atualizar contrato do atleta
    athlete.club = newClub;
    if(offer.wage) athlete.wage = Math.round(offer.wage);
    const seasonYear = Number(state.season) || 2026;
    athlete.contractUntil = offer.type === 'club_loan' ? seasonYear + 1 : seasonYear + 3;

    // 3. Atualizar elenco nos objetos state.teams e state.squad
    if(state.teams && state.teams[oldClub] && Array.isArray(state.teams[oldClub].squad)){
      state.teams[oldClub].squad = state.teams[oldClub].squad.filter(p => p.id !== state.controlledPlayerId);
    }
    if(state.teams && state.teams[newClub]){
      state.teams[newClub].squad = state.teams[newClub].squad || [];
      state.teams[newClub].squad = state.teams[newClub].squad.filter(p => p.id !== state.controlledPlayerId);
      state.teams[newClub].squad.push(athlete);
      state.squad = state.teams[newClub].squad;
    } else {
      state.teams = state.teams || {};
      state.teams[newClub] = { name: newClub, squad: [athlete] };
      state.squad = state.teams[newClub].squad;
    }

    // 4. Ajustar confiança do técnico do novo clube
    pState.managerTrust = offer.type === 'club_loan' ? 60 : 45;

    // 5. Luvas de Assinatura & Comissão do Empresário (Padrão de Mercado da Vida Real)
    const agent = window.AFM_PlayerEngine?.getPlayerAgent 
      ? window.AFM_PlayerEngine.getPlayerAgent(pState) 
      : { transferCommissionPct: 7, signingBonusMultiplier: 1.0, name: 'Empresário' };
    const baseSigningBonus = offer.type === 'club_loan' 
      ? Math.round((athlete.wage || 1500) * 1.5) 
      : Math.round((athlete.wage || 1500) * 3.5);
    const grossSigningBonus = Math.round(baseSigningBonus * (agent.signingBonusMultiplier || 1.0));
    const agentCommPct = Number(agent.transferCommissionPct) || 7;
    const agentCommission = Math.round(grossSigningBonus * (agentCommPct / 100));
    const netPlayerBonus = Math.max(0, grossSigningBonus - agentCommission);
    pState.personalBank = Math.round((Number(pState.personalBank) || 0) + netPlayerBonus);

    // 6. Inserir notícia oficial no feed
    state.news = state.news || [];
    state.news.unshift({
      title: `OFICIAL: ${athlete.name} é anunciado pelo ${newClub}!`,
      content: offer.type === 'club_loan' 
        ? `O ${newClub} confirmou o empréstimo da jovem promessa ${athlete.name} para a disputa da temporada. Luvas: R$ ${grossSigningBonus.toLocaleString('pt-BR')} (Comissão do agente ${agent.name}: R$ ${agentCommission.toLocaleString('pt-BR')}).`
        : `Em negociação sacramentada na janela de transferências, ${athlete.name} acertou em definitivo com o ${newClub} até ${athlete.contractUntil}. Luvas de assinatura: R$ ${grossSigningBonus.toLocaleString('pt-BR')} (Comissão ${agent.name} ${agentCommPct}%: R$ ${agentCommission.toLocaleString('pt-BR')}, Líquido atleta: R$ ${netPlayerBonus.toLocaleString('pt-BR')}).`,
      date: state.date || '2026-01-01',
      club: newClub
    });

    showCustomAlert({
      title: offer.type === 'club_loan' ? 'Empréstimo Concluído! ✈️' : 'Transferência Concluída! ✍️',
      message: `Você agora veste a camisa do ${newClub}!\nNovo salário: R$ ${(athlete.wage || 1500).toLocaleString('pt-BR')}/mês.\n\n💰 LUVAS DE ASSINATURA:\n• Total Bruto: R$ ${grossSigningBonus.toLocaleString('pt-BR')}\n• Comissão do Agente (${agent.name} - ${agentCommPct}%): - R$ ${agentCommission.toLocaleString('pt-BR')}\n• Saldo Líquido Creditado na sua Conta: + R$ ${netPlayerBonus.toLocaleString('pt-BR')}\n\nSua moral com o novo treinador começou em ${pState.managerTrust}%. Mostre serviço nos treinos e ganhe a titularidade!`,
      type: 'success',
      onConfirm: () => {
        if(typeof window.save === 'function') window.save();
        if(typeof window.render === 'function') window.render();
      }
    });
  }

  // =========================================================================
  // MODAIS PERSONALIZADOS PARA AÇÕES DO ATLETA (AUMENTO, TITULARIDADE, EMPRÉSTIMO, TRANSFERÊNCIA)
  // =========================================================================

  function createActionModalContainer(){
    const modalId = 'afmPlayerActionModal';
    let modalEl = document.getElementById(modalId);
    if(modalEl) modalEl.remove();
    modalEl = document.createElement('div');
    modalEl.id = modalId;
    modalEl.className = 'afm-custom-modal-overlay';
    modalEl.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);backdrop-filter:blur(12px);z-index:999999;display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto';
    document.body.appendChild(modalEl);
    return modalEl;
  }

  function closeActionModal(){
    const modalEl = document.getElementById('afmPlayerActionModal');
    if(modalEl) modalEl.remove();
  }

  // MODAL: MERCADO DE EMPRESÁRIOS & AGÊNCIAS
  function openAgentMarketModal(state){
    const modal = createActionModalContainer();
    const pState = getCareerState(state);
    const athlete = getControlledPlayer(state);
    const ovr = Number(athlete?.ovr || pState?.athleteOvr || 45);
    const followers = Number(pState?.socialMedia?.followers || 500);
    const currentAgent = window.AFM_PlayerEngine?.getPlayerAgent 
      ? window.AFM_PlayerEngine.getPlayerAgent(pState) 
      : { id: 'agent_family' };
    const agents = window.AFM_PlayerEngine?.AGENTS_CATALOG || [];

    modal.innerHTML = `
      <div class="card" style="background:linear-gradient(135deg, #090d16 0%, #151b2e 100%);border:2px solid #6366f1;border-radius:20px;max-width:880px;width:100%;max-height:90vh;overflow-y:auto;padding:26px;box-shadow:0 0 35px rgba(99,102,241,0.3)">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:14px">
          <div>
            <h2 style="margin:0;font-size:20px;font-weight:900;color:#fff;display:flex;align-items:center;gap:10px">
              💼 MERCADO DE EMPRESÁRIOS & AGÊNCIAS
            </h2>
            <div style="font-size:12px;color:#a5b4fc;margin-top:2px">
              Seu Overall: <b>${ovr}</b> · Seguidores FootGram: <b>${followers.toLocaleString('pt-BR')}</b>
            </div>
          </div>
          <button type="button" class="btn btn-close-action-modal" style="background:#ef4444;color:#fff;font-weight:900;border:none;border-radius:8px;padding:6px 14px;cursor:pointer">✕ Fechar</button>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(360px, 1fr));gap:14px">
          ${agents.map(ag => {
            const isCurrent = (ag.id === currentAgent.id);
            const meetsOvr = ovr >= ag.minOvr;
            const meetsFollowers = followers >= ag.minFollowers;
            const canHire = meetsOvr && meetsFollowers && !isCurrent;

            return `
              <div style="background:${isCurrent ? 'linear-gradient(135deg, rgba(99,102,241,0.2), #0b1329)' : '#0b1329'};border:2px solid ${isCurrent ? '#6366f1' : '#334155'};border-radius:14px;padding:16px;display:flex;flex-direction:column;justify-content:space-between">
                <div>
                  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
                    <div style="display:flex;align-items:center;gap:10px">
                      <span style="font-size:32px">${ag.icon}</span>
                      <div>
                        <div style="font-size:16px;font-weight:900;color:#fff">${esc(ag.name)}</div>
                        <div style="font-size:11px;color:#818cf8;font-weight:700">${esc(ag.agency)}</div>
                      </div>
                    </div>
                    <div>
                      ${isCurrent 
                        ? `<span class="pill good" style="font-size:9px;font-weight:900">SEU AGENTE ATUAL</span>` 
                        : `<span style="color:#fbbf24;font-size:12px">${'⭐'.repeat(ag.reputationStars)}</span>`}
                    </div>
                  </div>

                  <div style="font-size:11px;color:#cbd5e1;line-height:1.4;margin-bottom:12px">${esc(ag.description)}</div>

                  <div style="background:rgba(0,0,0,0.4);border-radius:10px;padding:10px;font-size:11px;color:#cbd5e1;display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px">
                    <div>Taxa Mensal: <b style="color:${ag.monthlySalary > 0 ? '#fca5a5' : '#10b981'}">${ag.monthlySalary > 0 ? `R$ ${ag.monthlySalary.toLocaleString('pt-BR')}/mês` : 'R$ 0/mês'}</b></div>
                    <div>Comissão Vendas: <b style="color:#38bdf8">${ag.transferCommissionPct}%</b></div>
                    <div>Comissão Patrocínio: <b>${ag.sponsorCommissionPct}%</b></div>
                    <div>Poder Barganha: <b style="color:#a855f7">${ag.negotiationPower}</b></div>
                    <div style="grid-column:1 / -1;color:#94a3b8">Rede de Clubes: <b style="color:#e2e8f0">${ag.clubTierAccess}</b></div>
                  </div>

                  <div style="font-size:10px;color:#94a3b8;margin-bottom:10px">
                    Requisitos: Overall <b>${ag.minOvr}+</b> (${meetsOvr ? '✅' : '❌'}) · Fãs: <b>${ag.minFollowers.toLocaleString('pt-BR')}+</b> (${meetsFollowers ? '✅' : '❌'})
                  </div>
                </div>

                <div>
                  ${isCurrent ? `
                    <button type="button" disabled style="width:100%;background:rgba(99,102,241,0.2);color:#a5b4fc;border:1px solid #6366f1;padding:9px;border-radius:8px;font-weight:900;font-size:12px;cursor:default">
                      ✓ Seu Empresário Ativo
                    </button>
                  ` : (canHire ? `
                    <button type="button" class="btn btn-select-agent success" data-agent-id="${ag.id}" style="width:100%;background:linear-gradient(135deg, #10b981, #059669);color:#000;padding:9px;border-radius:8px;font-weight:900;font-size:12px;border:none;cursor:pointer;box-shadow:0 3px 12px rgba(16,185,129,0.3)">
                      ✍️ Assinar Contrato de Representação
                    </button>
                  ` : `
                    <button type="button" disabled style="width:100%;background:#1e293b;color:#64748b;padding:9px;border-radius:8px;font-weight:800;font-size:11px;border:1px solid #334155;cursor:not-allowed">
                      🔒 Requisitos não atingidos
                    </button>
                  `)}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    const closeBtn = modal.querySelector('.btn-close-action-modal');
    if(closeBtn) closeBtn.onclick = () => closeActionModal();

    modal.querySelectorAll('.btn-select-agent').forEach(b => {
      b.onclick = () => {
        const aId = b.dataset.agentId;
        const res = window.AFM_PlayerEngine?.hirePlayerAgent 
          ? window.AFM_PlayerEngine.hirePlayerAgent(state, aId) 
          : { success: false, message: 'Erro ao contratar.' };
        closeActionModal();
        showCustomAlert({
          title: res.success ? 'Empresário Contratado! ✍️' : 'Falha na Negociação ❌',
          message: res.message,
          type: res.success ? 'success' : 'warning',
          onConfirm: () => {
            if(typeof window.save === 'function') window.save();
            if(typeof window.render === 'function') window.render();
          }
        });
      };
    });
  }

  // 1. MODAL: PEDIR AUMENTO SALARIAL & RENOVAÇÃO CONTRATUAL
  function openWageNegotiationModal(state, athlete, pState){
    const modal = createActionModalContainer();
    const curWage = Math.max(800, Number(athlete.wage) || 1500);
    const curContractUntil = Number(athlete.contractUntil) || ((Number(state.season) || 2026) + 2);
    const curSeason = Number(state.season) || 2026;
    const ovr = Number(athlete.overall || athlete.ovr) || 35;
    const trust = Number(pState.managerTrust) || 35;

    let proposedWage = Math.round(curWage * 1.3); // +30% inicial
    let selectedUntil = Math.max(curContractUntil, curSeason + 2);
    const minWage = Math.round(curWage * 0.9);
    const maxWage = Math.max(8000, Math.round(curWage * 3.5));

    function calcWageApproval(wage, untilYear){
      const ratio = wage / curWage;
      let chance = 85;
      if(ratio > 1.15){
        chance -= (ratio - 1.15) * 55;
      }
      chance += (trust - 40) * 0.45;
      chance += (ovr - 35) * 1.2;
      const yearsAdded = Math.max(0, untilYear - curSeason);
      if(yearsAdded >= 3 && ratio > 1.3) chance -= 8;
      return Math.max(5, Math.min(95, Math.round(chance)));
    }

    function renderContent(){
      const req = pState.actionRequests?.wage_increase;
      const isAccepted = req?.status === 'accepted';
      const isRejected = req?.status === 'rejected';

      const chance = calcWageApproval(proposedWage, selectedUntil);
      let chanceColor = '#10b981';
      let chanceLabel = 'Alta Aprovação da Diretoria';
      let chanceDesc = 'A diretoria avalia o pedido como justo e compatível com a folha salarial da sua categoria.';
      if(chance < 35){
        chanceColor = '#ef4444';
        chanceLabel = 'Baixa Aprovação (Risco Alto de Recusa)';
        chanceDesc = 'Pedida muito acima dos padrões do clube para seu papel no elenco. Alto risco de recusa.';
      } else if(chance < 65){
        chanceColor = '#f59e0b';
        chanceLabel = 'Aprovação Média (Negociação Exigente)';
        chanceDesc = 'A diretoria pode hesitar ou solicitar metas de desempenho antes de assinar.';
      }

      modal.innerHTML = `
        <div style="background:#0f172a;border:2px solid rgba(168,85,247,0.5);border-radius:22px;padding:26px;max-width:540px;width:100%;box-shadow:0 24px 60px rgba(0,0,0,0.95);color:#fff;animation:afmScaleUp 0.25s ease;position:relative">
          
          <!-- BOTÃO FECHAR X -->
          <button type="button" id="btnCloseWageModal" style="position:absolute;top:16px;right:18px;background:none;border:none;color:#94a3b8;font-size:22px;font-weight:900;cursor:pointer;line-height:1">✕</button>

          <!-- CABEÇALHO -->
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
            <div style="width:46px;height:46px;background:rgba(168,85,247,0.2);border:1px solid #a855f7;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:24px">
              💰
            </div>
            <div>
              <h2 style="margin:0;font-size:18px;font-weight:900;color:#fff;letter-spacing:0.5px">PEDIR AUMENTO & RENOVAÇÃO</h2>
              <div style="font-size:12px;color:#94a3b8">Negociação contratual com a diretoria do <b>${esc(state.club)}</b></div>
            </div>
          </div>

          ${isAccepted ? `
            <div style="background:rgba(16,185,129,0.12);border:1.5px solid #10b981;border-radius:14px;padding:16px;margin-bottom:18px">
              <div style="font-size:12px;font-weight:900;color:#6ee7b7;display:flex;align-items:center;gap:6px;margin-bottom:4px">
                ✅ SOLICITAÇÃO ACEITA PELA DIRETORIA
              </div>
              <div style="font-size:13px;color:#cbd5e1;line-height:1.5">
                Seu contrato recente foi valorizado com sucesso! Novo salário de <b>R$ ${(athlete.wage || 1500).toLocaleString('pt-BR')}/mês</b> garantido até <b>Dezembro de ${athlete.contractUntil || 2028}</b>.
              </div>
            </div>
          ` : isRejected ? `
            <div style="background:rgba(239,68,68,0.12);border:1.5px solid #ef4444;border-radius:14px;padding:16px;margin-bottom:18px">
              <div style="font-size:12px;font-weight:900;color:#fca5a5;display:flex;align-items:center;gap:6px;margin-bottom:4px">
                ❌ ÚLTIMA SOLICITAÇÃO RECUSADA
              </div>
              <div style="font-size:13px;color:#cbd5e1;line-height:1.5">
                ${esc(req?.reason || 'A diretoria avaliou seu pedido anterior mas recusou. Ajuste sua pedida ou renegocie com base na sua evolução.')}
              </div>
            </div>
          ` : ''}

          <!-- BARRA DO TIME & SAÚDE FINANCEIRA DO CLUBE -->
          <div style="background:#182234;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:16px;margin-bottom:18px">
            <div style="display:flex;justify-content:space-between;align-items:center;font-size:11px;font-weight:800;color:#cbd5e1;margin-bottom:6px">
              <span>BARRA DO CLUBE · DISPOSIÇÃO DA DIRETORIA</span>
              <span id="txtWageChanceVal" style="color:${chanceColor};font-weight:900">${chance}% de Chance</span>
            </div>
            
            <!-- Barra visual animada -->
            <div style="background:rgba(0,0,0,0.5);border-radius:8px;height:12px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);margin-bottom:8px">
              <div id="barWageVisual" style="width:${chance}%;height:100%;background:${chanceColor};transition:all 0.25s ease;border-radius:8px;box-shadow:0 0 10px ${chanceColor}"></div>
            </div>

            <div id="descWageText" style="font-size:11px;color:#94a3b8;line-height:1.4">
              <b style="color:${chanceColor}">${chanceLabel}:</b> ${chanceDesc}
            </div>

            <div style="display:flex;gap:12px;margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.06);font-size:11px;color:#94a3b8">
              <div>Salário Atual: <b style="color:#fff">R$ ${curWage.toLocaleString('pt-BR')}</b></div>
              <div>•</div>
              <div>Vínculo Atual: <b style="color:#fff">Até Dez/${curContractUntil}</b></div>
              <div>•</div>
              <div>OVR: <b style="color:#38bdf8">${ovr}</b></div>
            </div>
          </div>

          <!-- SALÁRIO DESEJADO (CONTROLES INTERATIVOS) -->
          <div style="margin-bottom:18px">
            <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:6px">
              <label style="font-size:11px;font-weight:800;color:#cbd5e1">SALÁRIO MENSAL DESEJADO:</label>
              <div id="txtWageDisplay" style="font-size:24px;font-weight:900;color:#38bdf8;text-shadow:0 0 12px rgba(56,189,248,0.4)">
                R$ ${proposedWage.toLocaleString('pt-BR')} <span style="font-size:13px;color:#94a3b8;font-weight:600">/mês</span>
              </div>
            </div>

            <input type="range" id="sliderWage" min="${minWage}" max="${maxWage}" step="50" value="${proposedWage}" style="width:100%;accent-color:#a855f7;cursor:pointer;margin-bottom:10px">

            <!-- Botões Rápidos de Aumento -->
            <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:6px">
              <button type="button" class="btn btn-wage-preset" data-mult="1.2" style="background:#1e293b;border:1px solid #334155;color:#cbd5e1;font-size:11px;font-weight:800;padding:6px;border-radius:8px;cursor:pointer">+20%</button>
              <button type="button" class="btn btn-wage-preset" data-mult="1.5" style="background:#1e293b;border:1px solid #334155;color:#cbd5e1;font-size:11px;font-weight:800;padding:6px;border-radius:8px;cursor:pointer">+50%</button>
              <button type="button" class="btn btn-wage-preset" data-mult="2.0" style="background:#1e293b;border:1px solid #334155;color:#cbd5e1;font-size:11px;font-weight:800;padding:6px;border-radius:8px;cursor:pointer">Dobrar (2x)</button>
              <button type="button" class="btn btn-wage-preset" data-mult="2.5" style="background:#1e293b;border:1px solid #334155;color:#cbd5e1;font-size:11px;font-weight:800;padding:6px;border-radius:8px;cursor:pointer">+150% (2.5x)</button>
            </div>
          </div>

          <!-- TEMPO DE CONTRATO (BOTÕES DE DURAÇÃO) -->
          <div style="margin-bottom:24px">
            <label style="font-size:11px;font-weight:800;color:#cbd5e1;display:block;margin-bottom:8px">NOVO TEMPO DE CONTRATO (DURAÇÃO):</label>
            <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:6px">
              ${[curSeason + 1, curSeason + 2, curSeason + 3, curSeason + 4].map((year, idx) => `
                <button type="button" class="btn btn-until-year" data-year="${year}" style="background:${selectedUntil === year ? '#7c3aed' : '#1e293b'};border:1px solid ${selectedUntil === year ? '#a855f7' : '#334155'};color:#fff;font-size:11px;font-weight:800;padding:8px 4px;border-radius:8px;cursor:pointer">
                  +${idx + 1} Ano${idx > 0 ? 's' : ''}<br><span style="font-size:10px;color:${selectedUntil === year ? '#e9d5ff' : '#94a3b8'}">Dez/${year}</span>
                </button>
              `).join('')}
            </div>
          </div>

          <!-- BOTÕES DE CONFIRMAÇÃO -->
          <div style="display:flex;justify-content:flex-end;gap:10px">
            <button type="button" id="btnCancelWage" class="btn" style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);color:#cbd5e1;font-weight:800;padding:10px 18px;border-radius:10px;cursor:pointer">
              Cancelar
            </button>
            <button type="button" id="btnSubmitWage" class="btn primary" style="background:linear-gradient(135deg,#7c3aed,#a855f7);border:none;color:#fff;font-weight:900;font-size:13px;padding:10px 22px;border-radius:10px;cursor:pointer;box-shadow:0 4px 18px rgba(168,85,247,0.4)">
              🤝 Enviar Proposta à Diretoria
            </button>
          </div>
        </div>
      `;

      // Binds de Fechamento
      document.getElementById('btnCloseWageModal')?.addEventListener('click', closeActionModal);
      document.getElementById('btnCancelWage')?.addEventListener('click', closeActionModal);

      // Slider listener com atualização em tempo real
      const slider = document.getElementById('sliderWage');
      function updateLiveChance(){
        const ch = calcWageApproval(proposedWage, selectedUntil);
        const valEl = document.getElementById('txtWageChanceVal');
        const barEl = document.getElementById('barWageVisual');
        const descEl = document.getElementById('descWageText');
        const dispEl = document.getElementById('txtWageDisplay');

        let col = '#10b981';
        let lbl = 'Alta Aprovação da Diretoria';
        let d = 'A diretoria avalia o pedido como justo e compatível com a folha salarial da sua categoria.';
        if(ch < 35){
          col = '#ef4444';
          lbl = 'Baixa Aprovação (Risco Alto de Recusa)';
          d = 'Pedida muito acima dos padrões do clube para seu papel no elenco. Alto risco de recusa.';
        } else if(ch < 65){
          col = '#f59e0b';
          lbl = 'Aprovação Média (Negociação Exigente)';
          d = 'A diretoria pode hesitar ou solicitar metas de desempenho antes de assinar.';
        }

        if(valEl){
          valEl.textContent = `${ch}% de Chance`;
          valEl.style.color = col;
        }
        if(barEl){
          barEl.style.width = `${ch}%`;
          barEl.style.background = col;
          barEl.style.boxShadow = `0 0 10px ${col}`;
        }
        if(descEl){
          descEl.innerHTML = `<b style="color:${col}">${lbl}:</b> ${d}`;
        }
        if(dispEl){
          dispEl.innerHTML = `R$ ${proposedWage.toLocaleString('pt-BR')} <span style="font-size:13px;color:#94a3b8;font-weight:600">/mês</span>`;
        }
      }

      if(slider){
        slider.oninput = (e) => {
          proposedWage = Number(e.target.value);
          updateLiveChance();
        };
      }

      // Presets de Aumento
      modal.querySelectorAll('.btn-wage-preset').forEach(btn => {
        btn.onclick = () => {
          const mult = Number(btn.dataset.mult) || 1.2;
          proposedWage = Math.min(maxWage, Math.max(minWage, Math.round(curWage * mult)));
          if(slider) slider.value = proposedWage;
          updateLiveChance();
        };
      });

      // Seletor de Anos
      modal.querySelectorAll('.btn-until-year').forEach(btn => {
        btn.onclick = () => {
          selectedUntil = Number(btn.dataset.year) || selectedUntil;
          modal.querySelectorAll('.btn-until-year').forEach(b => {
            const isSel = Number(b.dataset.year) === selectedUntil;
            b.style.background = isSel ? '#7c3aed' : '#1e293b';
            b.style.borderColor = isSel ? '#a855f7' : '#334155';
          });
          updateLiveChance();
        };
      });

      // Enviar Proposta
      const btnSubmit = document.getElementById('btnSubmitWage');
      if(btnSubmit){
        btnSubmit.onclick = () => {
          btnSubmit.disabled = true;
          btnSubmit.innerHTML = '⏳ Diretoria Reunida Analisando...';

          setTimeout(() => {
            const finalChance = calcWageApproval(proposedWage, selectedUntil);
            const roll = Math.random() * 100;
            const accepted = roll <= finalChance;

            pState.actionRequests = pState.actionRequests || {};
            if(accepted){
              athlete.wage = proposedWage;
              athlete.contractUntil = selectedUntil;
              pState.actionRequests.wage_increase = {
                status: 'accepted',
                date: state.date,
                wage: proposedWage,
                contractUntil: selectedUntil
              };
              state.news = Array.isArray(state.news) ? state.news : [];
              state.news.unshift(`📰 [RENOVAÇÃO DE CONTRATO] O jovem talento ${athlete.name} assinou novo vínculo com o ${state.club}! Novo salário de R$ ${proposedWage.toLocaleString('pt-BR')}/mês até Dezembro de ${selectedUntil}.`);

              modal.innerHTML = `
                <div style="background:#0f172a;border:2px solid #10b981;border-radius:22px;padding:28px;max-width:480px;width:100%;text-align:center;color:#fff;animation:afmScaleUp 0.25s ease">
                  <div style="font-size:46px;margin-bottom:10px">🎉</div>
                  <h2 style="margin:0 0 8px;font-size:20px;font-weight:900;color:#10b981">PROPOSTA ACEITA PELA DIRETORIA!</h2>
                  <div style="font-size:13px;color:#cbd5e1;line-height:1.5;margin-bottom:22px">
                    A diretoria do <b>${esc(state.club)}</b> aceitou sua pedida contratual na íntegra!<br><br>
                    💵 Novo Salário: <b style="color:#6ee7b7">R$ ${proposedWage.toLocaleString('pt-BR')}/mês</b><br>
                    📅 Vínculo Estendido: <b style="color:#fff">Até Dezembro de ${selectedUntil}</b>
                  </div>
                  <button type="button" id="btnFinishWageOk" class="btn primary" style="background:#10b981;border:none;color:#000;font-weight:900;font-size:14px;padding:10px 28px;border-radius:10px;cursor:pointer">
                    Excelente, Continuar Carreira!
                  </button>
                </div>
              `;
              document.getElementById('btnFinishWageOk')?.addEventListener('click', () => {
                closeActionModal();
                if(typeof window.save === 'function') window.save();
                if(typeof window.render === 'function') window.render();
              });
            } else {
              pState.actionRequests.wage_increase = {
                status: 'rejected',
                date: state.date,
                requestedWage: proposedWage,
                reason: 'Salário pedido considerado acima do teto orçamentário do clube no momento.'
              };

              modal.innerHTML = `
                <div style="background:#0f172a;border:2px solid #ef4444;border-radius:22px;padding:28px;max-width:480px;width:100%;text-align:center;color:#fff;animation:afmScaleUp 0.25s ease">
                  <div style="font-size:46px;margin-bottom:10px">❌</div>
                  <h2 style="margin:0 0 8px;font-size:20px;font-weight:900;color:#ef4444">SOLICITAÇÃO RECUSADA</h2>
                  <div style="font-size:13px;color:#cbd5e1;line-height:1.5;margin-bottom:22px">
                    A diretoria do <b>${esc(state.club)}</b> avaliou sua pedida de <b>R$ ${proposedWage.toLocaleString('pt-BR')}/mês</b>, mas considerou fora dos padrões para o seu momento no elenco.<br><br>
                    <i>"Ganhe mais minutos, marque gols e evolua seus atributos nos treinos antes de pedir novas cifras."</i>
                  </div>
                  <button type="button" id="btnFinishWageKo" class="btn" style="background:#1e293b;border:1px solid #ef4444;color:#fca5a5;font-weight:900;font-size:14px;padding:10px 28px;border-radius:10px;cursor:pointer">
                    Entendido, vou focar nos treinos!
                  </button>
                </div>
              `;
              document.getElementById('btnFinishWageKo')?.addEventListener('click', () => {
                closeActionModal();
                if(typeof window.save === 'function') window.save();
                if(typeof window.render === 'function') window.render();
              });
            }
          }, 450);
        };
      }
    }

    renderContent();
  }

  // 2. MODAL: EXIGIR TITULARIDADE / REUNIÃO COM TREINADOR
  function openDemandStarterModal(state, athlete, pState){
    const modal = createActionModalContainer();
    const trust = Number(pState.managerTrust) || 35;
    const starterCount = Number(pState.careerStats?.starterCount) || 0;
    const totalMatches = Number(pState.careerStats?.matches) || 0;

    let selectedStance = 'humble'; // 'humble', 'firm', 'ultimatum'

    function getStanceData(st){
      if(st === 'humble'){
        return { chance: Math.min(90, Math.max(30, trust + 30)), penalty: 0, label: 'Postura Construtiva / Pedir Oportunidade', risk: 'Baixo Risco (Sem penalidade de confiança)' };
      } else if(st === 'firm'){
        return { chance: Math.min(80, Math.max(20, trust + 10)), penalty: 5, label: 'Cobrança Firme de Titularidade', risk: 'Risco Moderado (-5% de Confiança se recusado)' };
      } else {
        return { chance: Math.min(65, Math.max(10, trust - 10)), penalty: 12, label: 'Ultimato por Minutagem', risk: 'Alto Risco (-12% de Confiança se recusado)' };
      }
    }

    function renderContent(){
      const req = pState.actionRequests?.demand_starter;
      const isAccepted = req?.status === 'accepted';
      const isRejected = req?.status === 'rejected';
      const stData = getStanceData(selectedStance);

      modal.innerHTML = `
        <div style="background:#0f172a;border:2px solid rgba(168,85,247,0.5);border-radius:22px;padding:26px;max-width:520px;width:100%;box-shadow:0 24px 60px rgba(0,0,0,0.95);color:#fff;animation:afmScaleUp 0.25s ease;position:relative">
          
          <button type="button" id="btnCloseStarterModal" style="position:absolute;top:16px;right:18px;background:none;border:none;color:#94a3b8;font-size:22px;font-weight:900;cursor:pointer;line-height:1">✕</button>

          <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
            <div style="width:46px;height:46px;background:rgba(168,85,247,0.2);border:1px solid #a855f7;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:24px">
              ⭐
            </div>
            <div>
              <h2 style="margin:0;font-size:18px;font-weight:900;color:#fff">REUNIÃO COM O TREINADOR</h2>
              <div style="font-size:12px;color:#94a3b8">Conversa individual com a comissão técnica do <b>${esc(state.club)}</b></div>
            </div>
          </div>

          ${isAccepted ? `
            <div style="background:rgba(16,185,129,0.12);border:1.5px solid #10b981;border-radius:14px;padding:16px;margin-bottom:18px">
              <div style="font-size:12px;font-weight:900;color:#6ee7b7;display:flex;align-items:center;gap:6px;margin-bottom:4px">
                ✅ SOLICITAÇÃO ACEITA
              </div>
              <div style="font-size:13px;color:#cbd5e1">O treinador prometeu sua titularidade nos próximos compromissos da equipe!</div>
            </div>
          ` : isRejected ? `
            <div style="background:rgba(239,68,68,0.12);border:1.5px solid #ef4444;border-radius:14px;padding:16px;margin-bottom:18px">
              <div style="font-size:12px;font-weight:900;color:#fca5a5;display:flex;align-items:center;gap:6px;margin-bottom:4px">
                ❌ SOLICITAÇÃO RECUSADA
              </div>
              <div style="font-size:13px;color:#cbd5e1">${esc(req?.reason || 'O treinador pediu paciência e evolução nos treinos.')}</div>
            </div>
          ` : ''}

          <!-- BARRA DO TREINADOR & CONFIANÇA -->
          <div style="background:#182234;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:16px;margin-bottom:18px">
            <div style="display:flex;justify-content:space-between;align-items:center;font-size:11px;font-weight:800;color:#cbd5e1;margin-bottom:6px">
              <span>CONFIANÇA DO TREINADOR: ${trust}%</span>
              <span id="txtStarterChanceVal" style="color:#10b981;font-weight:900">${stData.chance}% de Chance</span>
            </div>
            
            <div style="background:rgba(0,0,0,0.5);border-radius:8px;height:12px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);margin-bottom:8px">
              <div id="barStarterVisual" style="width:${stData.chance}%;height:100%;background:#10b981;transition:all 0.25s ease;border-radius:8px"></div>
            </div>

            <div style="font-size:11px;color:#94a3b8">
              Jogos na temporada: <b style="color:#fff">${totalMatches}</b> (${starterCount} como titular).
            </div>
          </div>

          <!-- OPÇÕES DE POSTURA -->
          <div style="margin-bottom:24px">
            <label style="font-size:11px;font-weight:800;color:#cbd5e1;display:block;margin-bottom:8px">ESCOLHA SUA POSTURA NA CONVERSA:</label>
            <div style="display:flex;flex-direction:column;gap:8px">
              
              <div class="card-starter-stance" data-stance="humble" style="background:${selectedStance === 'humble' ? 'rgba(168,85,247,0.15)' : '#182234'};border:1.5px solid ${selectedStance === 'humble' ? '#a855f7' : 'rgba(255,255,255,0.08)'};border-radius:12px;padding:12px;cursor:pointer">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
                  <span style="font-size:13px;font-weight:900;color:#fff">🟢 Postura Construtiva / Pedir Chance</span>
                  <span style="font-size:10px;font-weight:800;color:#10b981">Sem Risco</span>
                </div>
                <div style="font-size:12px;color:#94a3b8">"Professor, estou focado no dia a dia e queria saber o que falta para eu ter uma chance de começar jogando."</div>
              </div>

              <div class="card-starter-stance" data-stance="firm" style="background:${selectedStance === 'firm' ? 'rgba(168,85,247,0.15)' : '#182234'};border:1.5px solid ${selectedStance === 'firm' ? '#a855f7' : 'rgba(255,255,255,0.08)'};border-radius:12px;padding:12px;cursor:pointer">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
                  <span style="font-size:13px;font-weight:900;color:#fff">🟡 Cobrança Firme de Titularidade</span>
                  <span style="font-size:10px;font-weight:800;color:#f59e0b">-5% se recusar</span>
                </div>
                <div style="font-size:12px;color:#94a3b8">"Estou rendendo melhor que os titulares da minha posição e acredito que a titularidade seja justa pelo momento técnico."</div>
              </div>

              <div class="card-starter-stance" data-stance="ultimatum" style="background:${selectedStance === 'ultimatum' ? 'rgba(168,85,247,0.15)' : '#182234'};border:1.5px solid ${selectedStance === 'ultimatum' ? '#a855f7' : 'rgba(255,255,255,0.08)'};border-radius:12px;padding:12px;cursor:pointer">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
                  <span style="font-size:13px;font-weight:900;color:#fff">🔴 Ultimato por Sequência</span>
                  <span style="font-size:10px;font-weight:800;color:#ef4444">-12% se recusar</span>
                </div>
                <div style="font-size:12px;color:#94a3b8">"Preciso de sequência como titular imediato. Se não for aproveitado, vou pedir para ser negociado ou emprestado."</div>
              </div>

            </div>
          </div>

          <div style="display:flex;justify-content:flex-end;gap:10px">
            <button type="button" id="btnCancelStarter" class="btn" style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);color:#cbd5e1;font-weight:800;padding:10px 18px;border-radius:10px;cursor:pointer">
              Cancelar
            </button>
            <button type="button" id="btnSubmitStarter" class="btn primary" style="background:linear-gradient(135deg,#7c3aed,#a855f7);border:none;color:#fff;font-weight:900;font-size:13px;padding:10px 22px;border-radius:10px;cursor:pointer;box-shadow:0 4px 18px rgba(168,85,247,0.4)">
              🗣️ Falar com o Treinador
            </button>
          </div>
        </div>
      `;

      document.getElementById('btnCloseStarterModal')?.addEventListener('click', closeActionModal);
      document.getElementById('btnCancelStarter')?.addEventListener('click', closeActionModal);

      modal.querySelectorAll('.card-starter-stance').forEach(card => {
        card.onclick = () => {
          selectedStance = card.dataset.stance || 'humble';
          renderContent();
        };
      });

      const btnSubmit = document.getElementById('btnSubmitStarter');
      if(btnSubmit){
        btnSubmit.onclick = () => {
          btnSubmit.disabled = true;
          btnSubmit.innerHTML = '⏳ Conversando com a comissão...';

          setTimeout(() => {
            const data = getStanceData(selectedStance);
            const roll = Math.random() * 100;
            const accepted = roll <= data.chance;

            pState.actionRequests = pState.actionRequests || {};
            if(accepted){
              pState.managerTrust = Math.min(100, trust + 12);
              pState.actionRequests.demand_starter = { status: 'accepted', date: state.date };

              modal.innerHTML = `
                <div style="background:#0f172a;border:2px solid #10b981;border-radius:22px;padding:28px;max-width:480px;width:100%;text-align:center;color:#fff;animation:afmScaleUp 0.25s ease">
                  <div style="font-size:46px;margin-bottom:10px">✅</div>
                  <h2 style="margin:0 0 8px;font-size:20px;font-weight:900;color:#10b981">VAGA PROMETIDA!</h2>
                  <div style="font-size:13px;color:#cbd5e1;line-height:1.5;margin-bottom:22px">
                    O treinador ouviu seus argumentos e concordou em escalá-lo como titular nos próximos jogos!<br>
                    <b style="color:#6ee7b7">Confiança do Treinador: +12%</b>
                  </div>
                  <button type="button" id="btnFinishStarterOk" class="btn primary" style="background:#10b981;border:none;color:#000;font-weight:900;font-size:14px;padding:10px 28px;border-radius:10px;cursor:pointer">
                    Entendido!
                  </button>
                </div>
              `;
              document.getElementById('btnFinishStarterOk')?.addEventListener('click', () => {
                closeActionModal();
                if(typeof window.save === 'function') window.save();
                if(typeof window.render === 'function') window.render();
              });
            } else {
              pState.managerTrust = Math.max(5, trust - data.penalty);
              pState.actionRequests.demand_starter = {
                status: 'rejected',
                date: state.date,
                reason: 'Treinador exigiu mais maturidade e minutos no segundo tempo antes de dar a titularidade.'
              };

              modal.innerHTML = `
                <div style="background:#0f172a;border:2px solid #ef4444;border-radius:22px;padding:28px;max-width:480px;width:100%;text-align:center;color:#fff;animation:afmScaleUp 0.25s ease">
                  <div style="font-size:46px;margin-bottom:10px">❌</div>
                  <h2 style="margin:0 0 8px;font-size:20px;font-weight:900;color:#ef4444">COBRANÇA REPROVADA</h2>
                  <div style="font-size:13px;color:#cbd5e1;line-height:1.5;margin-bottom:22px">
                    O treinador pediu calma: <i>"Aqui quem define os 11 titulares sou eu. Continue trabalhando nos treinos para merecer o seu lugar."</i><br>
                    ${data.penalty > 0 ? `<b style="color:#fca5a5">Confiança do Treinador: -${data.penalty}%</b>` : ''}
                  </div>
                  <button type="button" id="btnFinishStarterKo" class="btn" style="background:#1e293b;border:1px solid #ef4444;color:#fca5a5;font-weight:900;font-size:14px;padding:10px 28px;border-radius:10px;cursor:pointer">
                    Entendido!
                  </button>
                </div>
              `;
              document.getElementById('btnFinishStarterKo')?.addEventListener('click', () => {
                closeActionModal();
                if(typeof window.save === 'function') window.save();
                if(typeof window.render === 'function') window.render();
              });
            }
          }, 450);
        };
      }
    }

    renderContent();
  }

  // 3. MODAL: SOLICITAR EMPRÉSTIMO
  function openRequestLoanModal(state, athlete, pState){
    const modal = createActionModalContainer();

    let selectedTier = 'regional';
    let selectedSalarySplit = '50_50';

    function renderContent(){
      const req = pState.actionRequests?.request_loan;
      const isAccepted = req?.status === 'accepted';
      const isRejected = req?.status === 'rejected';

      modal.innerHTML = `
        <div style="background:#0f172a;border:2px solid rgba(168,85,247,0.5);border-radius:22px;padding:26px;max-width:520px;width:100%;box-shadow:0 24px 60px rgba(0,0,0,0.95);color:#fff;animation:afmScaleUp 0.25s ease;position:relative">
          
          <button type="button" id="btnCloseLoanModal" style="position:absolute;top:16px;right:18px;background:none;border:none;color:#94a3b8;font-size:22px;font-weight:900;cursor:pointer;line-height:1">✕</button>

          <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
            <div style="width:46px;height:46px;background:rgba(168,85,247,0.2);border:1px solid #a855f7;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:24px">
              ✈️
            </div>
            <div>
              <h2 style="margin:0;font-size:18px;font-weight:900;color:#fff">SOLICITAR EMPRÉSTIMO</h2>
              <div style="font-size:12px;color:#94a3b8">Prospecção de equipes para ganhar rodagem como titular</div>
            </div>
          </div>

          ${isAccepted ? `
            <div style="background:rgba(16,185,129,0.12);border:1.5px solid #10b981;border-radius:14px;padding:16px;margin-bottom:18px">
              <div style="font-size:12px;font-weight:900;color:#6ee7b7;display:flex;align-items:center;gap:6px;margin-bottom:4px">
                ✅ EMPRÉSTIMO APROVADO PELO CLUBE
              </div>
              <div style="font-size:13px;color:#cbd5e1">O clube autorizou sua saída temporária! As propostas disponíveis estão na mesa do empresário.</div>
            </div>
          ` : isRejected ? `
            <div style="background:rgba(239,68,68,0.12);border:1.5px solid #ef4444;border-radius:14px;padding:16px;margin-bottom:18px">
              <div style="font-size:12px;font-weight:900;color:#fca5a5;display:flex;align-items:center;gap:6px;margin-bottom:4px">
                ❌ EMPRÉSTIMO VETADO
              </div>
              <div style="font-size:13px;color:#cbd5e1">${esc(req?.reason || 'A comissão técnica vetou a saída.')}</div>
            </div>
          ` : ''}

          <!-- BARRA DO CLUBE ATUAL -->
          <div style="background:#182234;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:16px;margin-bottom:18px">
            <div style="display:flex;justify-content:space-between;align-items:center;font-size:11px;font-weight:800;color:#cbd5e1;margin-bottom:6px">
              <span>DISPOSIÇÃO DO ${esc(state.club)} PARA EMPRESTAR</span>
              <span style="color:#10b981;font-weight:900">80% de Aprovação</span>
            </div>
            <div style="background:rgba(0,0,0,0.5);border-radius:8px;height:12px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);margin-bottom:8px">
              <div style="width:80%;height:100%;background:#10b981;border-radius:8px;box-shadow:0 0 10px #10b981"></div>
            </div>
            <div style="font-size:11px;color:#94a3b8">
              A diretoria vê com bons olhos um empréstimo para você somar 100% de minutos como titular.
            </div>
          </div>

          <!-- PERFIL DO DESTINO -->
          <div style="margin-bottom:16px">
            <label style="font-size:11px;font-weight:800;color:#cbd5e1;display:block;margin-bottom:8px">PERFIL DE DESTINO DESEJADO:</label>
            <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:8px">
              <button type="button" class="btn btn-loan-tier" data-tier="regional" style="background:${selectedTier === 'regional' ? '#7c3aed' : '#1e293b'};border:1px solid ${selectedTier === 'regional' ? '#a855f7' : '#334155'};color:#fff;font-size:11px;font-weight:800;padding:10px 6px;border-radius:8px;cursor:pointer">
                Regional / Estadual<br><span style="font-size:9px;color:#cbd5e1">Alta Titularidade</span>
              </button>
              <button type="button" class="btn btn-loan-tier" data-tier="serie_cd" style="background:${selectedTier === 'serie_cd' ? '#7c3aed' : '#1e293b'};border:1px solid ${selectedTier === 'serie_cd' ? '#a855f7' : '#334155'};color:#fff;font-size:11px;font-weight:800;padding:10px 6px;border-radius:8px;cursor:pointer">
                Séries C e D<br><span style="font-size:9px;color:#cbd5e1">Vitrine Nacional</span>
              </button>
              <button type="button" class="btn btn-loan-tier" data-tier="any" style="background:${selectedTier === 'any' ? '#7c3aed' : '#1e293b'};border:1px solid ${selectedTier === 'any' ? '#a855f7' : '#334155'};color:#fff;font-size:11px;font-weight:800;padding:10px 6px;border-radius:8px;cursor:pointer">
                Qualquer Clube<br><span style="font-size:9px;color:#cbd5e1">Vaga Garantida</span>
              </button>
            </div>
          </div>

          <!-- DIVISÃO SALARIAL -->
          <div style="margin-bottom:24px">
            <label style="font-size:11px;font-weight:800;color:#cbd5e1;display:block;margin-bottom:8px">DIVISÃO SALARIAL:</label>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
              <button type="button" class="btn btn-loan-split" data-split="50_50" style="background:${selectedSalarySplit === '50_50' ? '#0891b2' : '#1e293b'};border:1px solid ${selectedSalarySplit === '50_50' ? '#06b6d4' : '#334155'};color:#fff;font-size:11px;font-weight:800;padding:10px;border-radius:8px;cursor:pointer">
                50% / 50% Subsidiado<br><span style="font-size:9px;color:#cbd5e1">Mais fácil fechar</span>
              </button>
              <button type="button" class="btn btn-loan-split" data-split="100_dest" style="background:${selectedSalarySplit === '100_dest' ? '#0891b2' : '#1e293b'};border:1px solid ${selectedSalarySplit === '100_dest' ? '#06b6d4' : '#334155'};color:#fff;font-size:11px;font-weight:800;padding:10px;border-radius:8px;cursor:pointer">
                100% Clube Destino<br><span style="font-size:9px;color:#cbd5e1">Sem custo ao time</span>
              </button>
            </div>
          </div>

          <div style="display:flex;justify-content:flex-end;gap:10px">
            <button type="button" id="btnCancelLoan" class="btn" style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);color:#cbd5e1;font-weight:800;padding:10px 18px;border-radius:10px;cursor:pointer">
              Cancelar
            </button>
            <button type="button" id="btnSubmitLoan" class="btn primary" ${isAccepted || isRejected ? 'disabled' : ''} style="background:linear-gradient(135deg,#7c3aed,#a855f7);border:none;color:#fff;font-weight:900;font-size:13px;padding:10px 22px;border-radius:10px;cursor:pointer;box-shadow:0 4px 18px rgba(168,85,247,0.4)">
              ✈️ Confirmar Pedido de Empréstimo
            </button>
          </div>
        </div>
      `;

      document.getElementById('btnCloseLoanModal')?.addEventListener('click', closeActionModal);
      document.getElementById('btnCancelLoan')?.addEventListener('click', closeActionModal);

      modal.querySelectorAll('.btn-loan-tier').forEach(b => {
        b.onclick = () => { selectedTier = b.dataset.tier || 'regional'; renderContent(); };
      });
      modal.querySelectorAll('.btn-loan-split').forEach(b => {
        b.onclick = () => { selectedSalarySplit = b.dataset.split || '50_50'; renderContent(); };
      });

      const btnSubmit = document.getElementById('btnSubmitLoan');
      if(btnSubmit){
        btnSubmit.onclick = () => {
          btnSubmit.disabled = true;
          btnSubmit.innerHTML = '⏳ Empresário contactando clubes...';

          setTimeout(() => {
            const isWinOpen = (typeof isTransferWindowOpen === 'function')
              ? isTransferWindowOpen(state.date)
              : false;
            const result = window.AFM_PlayerEngine?.registerPlayerTransferListing?.(state, 'loan', { tier: selectedTier, salarySplit: selectedSalarySplit });
            if(!result?.ok){ showCustomAlert({ title: 'Pedido de empréstimo', message: result?.error || 'Não foi possível registrar o pedido.', type: 'warning' }); closeActionModal(); return; }

            modal.innerHTML = `
              <div style="background:#0f172a;border:2px solid #10b981;border-radius:22px;padding:28px;max-width:480px;width:100%;text-align:center;color:#fff;animation:afmScaleUp 0.25s ease">
                <div style="font-size:46px;margin-bottom:10px">✈️</div>
                <h2 style="margin:0 0 8px;font-size:20px;font-weight:900;color:#10b981">EMPRÉSTIMO LIBERADO!</h2>
                <div style="font-size:13px;color:#cbd5e1;line-height:1.5;margin-bottom:22px">
                  ${isWinOpen ? `
                    O <b>${esc(state.club)}</b> aceitou seu pedido e colocou <b>${esc(athlete.name)}</b> na lista de empréstimos. Propostas serão enviadas ao empresário conforme os clubes responderem durante a janela.
                  ` : `
                    O <b>${esc(state.club)}</b> aceitou seu pedido e colocou <b>${esc(athlete.name)}</b> na lista de empréstimos. As consultas serão abertas quando a janela de transferências começar.
                  `}
                </div>
                <button type="button" id="btnFinishLoanOk" class="btn primary" style="background:#10b981;border:none;color:#000;font-weight:900;font-size:14px;padding:10px 28px;border-radius:10px;cursor:pointer">
                  ${isWinOpen ? 'Ver Propostas no Mercado' : 'Entendido'}
                </button>
              </div>
            `;
            document.getElementById('btnFinishLoanOk')?.addEventListener('click', () => {
              window.__afmAgentOfferCategory = 'loan';
              closeActionModal();
              if(typeof window.save === 'function') window.save();
              if(typeof window.render === 'function') window.render();
            });
          }, 450);
        };
      }
    }

    renderContent();
  }

  // 4. MODAL: SOLICITAR TRANSFERÊNCIA DEFINITIVA
  function openRequestTransferModal(state, athlete, pState){
    const modal = createActionModalContainer();
    const isWinOpen = (typeof isTransferWindowOpen === 'function') ? isTransferWindowOpen(state.date) : false;
    const winInfo = (typeof getTransferWindowInfo === 'function') ? getTransferWindowInfo(state.date) : { open: false, text: 'Janela Fechada' };

    let selectedMotive = 'growth';

    function renderContent(){
      const req = pState.actionRequests?.request_transfer;
      const isAccepted = req?.status === 'accepted';
      const isRejected = req?.status === 'rejected';

      modal.innerHTML = `
        <div style="background:#0f172a;border:2px solid rgba(168,85,247,0.5);border-radius:22px;padding:26px;max-width:520px;width:100%;box-shadow:0 24px 60px rgba(0,0,0,0.95);color:#fff;animation:afmScaleUp 0.25s ease;position:relative">
          
          <button type="button" id="btnCloseTransferModal" style="position:absolute;top:16px;right:18px;background:none;border:none;color:#94a3b8;font-size:22px;font-weight:900;cursor:pointer;line-height:1">✕</button>

          <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
            <div style="width:46px;height:46px;background:rgba(168,85,247,0.2);border:1px solid #a855f7;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:24px">
              🔄
            </div>
            <div>
              <h2 style="margin:0;font-size:18px;font-weight:900;color:#fff">SOLICITAR TRANSFERÊNCIA</h2>
              <div style="font-size:12px;color:#94a3b8">Pedido formal de venda definitiva no mercado</div>
            </div>
          </div>

          ${isAccepted ? `
            <div style="background:rgba(16,185,129,0.12);border:1.5px solid #10b981;border-radius:14px;padding:16px;margin-bottom:18px">
              <div style="font-size:12px;font-weight:900;color:#6ee7b7;display:flex;align-items:center;gap:6px;margin-bottom:4px">
                ✅ SOLICITAÇÃO ACEITA
              </div>
              <div style="font-size:13px;color:#cbd5e1">O clube aceitou negociar seus direitos e colocou você na lista de transferências!</div>
            </div>
          ` : isRejected ? `
            <div style="background:rgba(239,68,68,0.12);border:1.5px solid #ef4444;border-radius:14px;padding:16px;margin-bottom:18px">
              <div style="font-size:12px;font-weight:900;color:#fca5a5;display:flex;align-items:center;gap:6px;margin-bottom:4px">
                ❌ SAÍDA VETADA
              </div>
              <div style="font-size:13px;color:#cbd5e1">${esc(req?.reason || 'A presidência barrou a venda e exige cumprimento do vínculo.')}</div>
            </div>
          ` : ''}

          <!-- DADOS DE MERCADO DO CLUBE -->
          <div style="background:#182234;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:16px;margin-bottom:18px">
            <div style="display:flex;justify-content:space-between;align-items:center;font-size:11px;font-weight:800;color:#cbd5e1;margin-bottom:6px">
              <span>STATUS NO MERCADO · RESISTÊNCIA À VENDA</span>
              <span style="color:${isWinOpen ? '#10b981' : '#f59e0b'};font-weight:900">${isWinOpen ? 'Janela Aberta' : 'Janela Fechada'}</span>
            </div>
            <div style="background:rgba(0,0,0,0.5);border-radius:8px;height:12px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);margin-bottom:8px">
              <div style="width:65%;height:100%;background:#38bdf8;border-radius:8px"></div>
            </div>
            <div style="display:flex;gap:12px;font-size:11px;color:#94a3b8">
              <div>Valor de Mercado: <b style="color:#10b981">R$ ${controlledMarketValueMi} Mi</b></div>
              <div>•</div>
              <div>Multa Rescisória: <b style="color:#fff">R$ 5.000.000</b></div>
            </div>
          </div>

          <!-- MOTIVO DO PEDIDO -->
          <div style="margin-bottom:24px">
            <label style="font-size:11px;font-weight:800;color:#cbd5e1;display:block;margin-bottom:8px">MOTIVO DO PEDIDO DE SAÍDA:</label>
            <div style="display:flex;flex-direction:column;gap:8px">
              <div class="card-transfer-motive" data-motive="growth" style="background:${selectedMotive === 'growth' ? 'rgba(168,85,247,0.15)' : '#182234'};border:1.5px solid ${selectedMotive === 'growth' ? '#a855f7' : 'rgba(255,255,255,0.08)'};border-radius:12px;padding:12px;cursor:pointer">
                <span style="font-size:12px;font-weight:900;color:#fff">🏆 Buscar divisão superior e visibilidade nacional</span>
              </div>
              <div class="card-transfer-motive" data-motive="salary" style="background:${selectedMotive === 'salary' ? 'rgba(168,85,247,0.15)' : '#182234'};border:1.5px solid ${selectedMotive === 'salary' ? '#a855f7' : 'rgba(255,255,255,0.08)'};border-radius:12px;padding:12px;cursor:pointer">
                <span style="font-size:12px;font-weight:900;color:#fff">💰 Buscar maior valorização salarial e novo contrato</span>
              </div>
              <div class="card-transfer-motive" data-motive="divergence" style="background:${selectedMotive === 'divergence' ? 'rgba(168,85,247,0.15)' : '#182234'};border:1.5px solid ${selectedMotive === 'divergence' ? '#a855f7' : 'rgba(255,255,255,0.08)'};border-radius:12px;padding:12px;cursor:pointer">
                <span style="font-size:12px;font-weight:900;color:#fff">⚡ Relação desgastada com a comissão técnica</span>
              </div>
            </div>
          </div>

          <div style="display:flex;justify-content:flex-end;gap:10px">
            <button type="button" id="btnCancelTransfer" class="btn" style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);color:#cbd5e1;font-weight:800;padding:10px 18px;border-radius:10px;cursor:pointer">
              Cancelar
            </button>
            <button type="button" id="btnSubmitTransfer" class="btn primary" ${isAccepted || isRejected ? 'disabled' : ''} style="background:linear-gradient(135deg,#7c3aed,#a855f7);border:none;color:#fff;font-weight:900;font-size:13px;padding:10px 22px;border-radius:10px;cursor:pointer;box-shadow:0 4px 18px rgba(168,85,247,0.4)">
              🔄 Confirmar Pedido de Transferência
            </button>
          </div>
        </div>
      `;

      document.getElementById('btnCloseTransferModal')?.addEventListener('click', closeActionModal);
      document.getElementById('btnCancelTransfer')?.addEventListener('click', closeActionModal);

      modal.querySelectorAll('.card-transfer-motive').forEach(c => {
        c.onclick = () => { selectedMotive = c.dataset.motive || 'growth'; renderContent(); };
      });

      const btnSubmit = document.getElementById('btnSubmitTransfer');
      if(btnSubmit){
        btnSubmit.onclick = () => {
          btnSubmit.disabled = true;
          btnSubmit.innerHTML = '⏳ Enviando pedido à presidência...';

          setTimeout(() => {
            const isWinOpen = (typeof isTransferWindowOpen === 'function')
              ? isTransferWindowOpen(state.date)
              : false;
            const result = window.AFM_PlayerEngine?.registerPlayerTransferListing?.(state, 'transfer', { motive: selectedMotive });
            if(!result?.ok){ showCustomAlert({ title: 'Pedido de transferência', message: result?.error || 'Não foi possível registrar o pedido.', type: 'warning' }); closeActionModal(); return; }

            modal.innerHTML = `
              <div style="background:#0f172a;border:2px solid #10b981;border-radius:22px;padding:28px;max-width:480px;width:100%;text-align:center;color:#fff;animation:afmScaleUp 0.25s ease">
                <div style="font-size:46px;margin-bottom:10px">💼</div>
                <h2 style="margin:0 0 8px;font-size:20px;font-weight:900;color:#10b981">SOLICITAÇÃO ACEITA!</h2>
                <div style="font-size:13px;color:#cbd5e1;line-height:1.5;margin-bottom:22px">
                  ${isWinOpen ? `
                    O <b>${esc(state.club)}</b> aceitou seu pedido e colocou <b>${esc(athlete.name)}</b> na lista de transferências. Propostas serão encaminhadas ao empresário conforme chegarem nesta janela.
                  ` : `
                    O <b>${esc(state.club)}</b> aceitou seu pedido e colocou <b>${esc(athlete.name)}</b> na lista de transferências. Os clubes poderão formalizar propostas quando a janela abrir.
                  `}
                </div>
                <button type="button" id="btnFinishTransferOk" class="btn primary" style="background:#10b981;border:none;color:#000;font-weight:900;font-size:14px;padding:10px 28px;border-radius:10px;cursor:pointer">
                  ${isWinOpen ? 'Ver Propostas de Compra' : 'Entendido'}
                </button>
              </div>
            `;
            document.getElementById('btnFinishTransferOk')?.addEventListener('click', () => {
              window.__afmAgentOfferCategory = 'transfer';
              closeActionModal();
              if(typeof window.save === 'function') window.save();
              if(typeof window.render === 'function') window.render();
            });
          }, 450);
        };
      }
    }

    renderContent();
  }

  // 5. MODAL: DETALHES DA PROPOSTA NA MESA DO EMPRESÁRIO (LUPA DE NEGOCIAÇÃO)
  function openOfferDetailsModal(offer, originalIndex, state, athlete, pState){
    if(!offer) return;
    offer.isRead = true; // Marca como lida ao abrir os detalhes
    const modal = createActionModalContainer();

    const isTransfer = offer.type === 'transfer';
    const isLoan = offer.type === 'club_loan';
    const isSponsor = offer.type === 'sponsor';
    const isRenewal = !!offer.isRenewal;

    const isWindowOpen = (typeof isTransferWindowOpen === 'function')
      ? isTransferWindowOpen(state.date)
      : (function(dStr){
          if(!dStr) return false;
          const parts = String(dStr).split('-');
          if(parts.length < 3) return false;
          const m = parseInt(parts[1], 10);
          const d = parseInt(parts[2], 10);
          return (m === 1 || m === 2 || (m === 3 && d <= 1) || m === 6 || m === 7 || (m === 8 && d <= 1));
        })(state.date);

    const curWage = Math.max(800, Number(athlete?.wage) || 1500);
    const offeredWage = Number(offer.wage || offer.monthly || offer.monthlyStipend) || curWage;
    const wageDiff = offeredWage - curWage;
    const wagePct = curWage > 0 ? Math.round(((offeredWage - curWage) / curWage) * 100) : 0;
    const currentClub = state.club || 'Seu Clube';
    const proposedClub = offer.newClub || offer.clubOrBrand || 'Clube Interessado';

    let categoryBadge = '';
    let categoryIcon = '📄';
    if(isRenewal){
      categoryBadge = '<span style="background:rgba(16,185,129,0.2);border:1px solid #10b981;color:#6ee7b7;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:900">✨ RENOVAÇÃO VALORIZADA</span>';
      categoryIcon = '✨';
    } else if(isSponsor){
      categoryBadge = '<span style="background:rgba(6,182,212,0.2);border:1px solid #06b6d4;color:#67e8f9;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:900">👟 PATROCÍNIO ESPORTIVO</span>';
      categoryIcon = '👟';
    } else if(isLoan){
      categoryBadge = '<span style="background:rgba(245,158,11,0.2);border:1px solid #f59e0b;color:#fde68a;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:900">📋 PROPOSTA DE EMPRÉSTIMO</span>';
      categoryIcon = '📋';
    } else {
      categoryBadge = '<span style="background:rgba(168,85,247,0.2);border:1px solid #a855f7;color:#d8b4fe;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:900">✈️ COMPRA DEFINITIVA</span>';
      categoryIcon = '✈️';
    }

    // Parecer técnico contextualizado do empresário
    let agentOpinionText = '';
    if(isRenewal){
      agentOpinionText = offer.reasonText || `A diretoria da ${offer.brand || 'marca'} ficou muito impressionada com o seu rendimento em campo e atendeu integralmente nossas exigências! Além do reajuste generoso nas mensalidades e bônus por gol, incluíram luvas à vista na assinatura. Meu conselho profissional é assinar e selar esse grande momento!`;
    } else if(isSponsor){
      agentOpinionText = `Ter uma grande marca oficial como a ${offer.clubOrBrand} fornecendo suas chuteiras traz prestígio comercial imediato e dinheiro direto no seu bolso todo mês. É o primeiro passo para consolidar sua imagem no futebol. Vale muito a pena assinar!`;
    } else if(isLoan){
      agentOpinionText = `O empréstimo para o ${proposedClub} é uma oportunidade estratégica de ouro! Lá o técnico garantiu espaço entre os titulares e você terá rodagem contínua nos gramados. O clube cobre seu salário integralmente. Vale muito a pena para acelerar sua evolução!`;
    } else {
      if(wagePct >= 25){
        agentOpinionText = `Negócio espetacular! O ${proposedClub} formalizou uma oferta de alto escalão com valorização salarial de ${wagePct >= 0 ? '+' : ''}${wagePct}%. É um clube competitivo, estruturado e com grande visibilidade na mídia. Assinar esse contrato definitivo colocará sua carreira em outro patamar!`;
      } else if(wagePct >= 0){
        agentOpinionText = `O ${proposedClub} oferece um projeto esportivo bastante sério e estável. O salário é equilibrado com o seu momento de carreira. Se você quer novos ares e busca protagonismo em outro elenco, é uma ótima escolha.`;
      } else {
        agentOpinionText = `Atenção: financeiramente a pedida é próxima da atual. Considere a mudança apenas se o projeto técnico do ${proposedClub} oferecer mais minutos como titular do que você tem hoje.`;
      }
    }

    function renderModalContent(){
      modal.innerHTML = `
        <div style="background:linear-gradient(135deg, #0b1120 0%, #060913 100%);border:2px solid #38bdf8;border-radius:20px;width:100%;max-width:680px;padding:26px;box-shadow:0 0 35px rgba(56,189,248,0.28);color:#fff;font-family:inherit;position:relative">
          
          <!-- BOTÃO FECHAR -->
          <button type="button" id="btnCloseOfferDetails" style="position:absolute;top:18px;right:18px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);color:#94a3b8;width:34px;height:34px;border-radius:50%;cursor:pointer;font-size:16px;font-weight:900;display:flex;align-items:center;justify-content:center;transition:all 0.2s ease">
            ✕
          </button>

          <!-- HEADER -->
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px">
            <div style="width:46px;height:46px;border-radius:12px;background:rgba(56,189,248,0.14);border:1.5px solid #38bdf8;display:flex;align-items:center;justify-content:center;font-size:22px">
              ${categoryIcon}
            </div>
            <div>
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                <h2 style="margin:0;font-size:20px;font-weight:900;color:#fff">${esc(offer.title || offer.clubOrBrand)}</h2>
                ${categoryBadge}
                ${(isTransfer || isLoan) ? (
                  isWindowOpen
                    ? `<span style="background:rgba(34,197,94,0.15);border:1px solid #22c55e;color:#86efac;font-size:10px;font-weight:900;padding:3px 8px;border-radius:12px;display:inline-flex;align-items:center;gap:4px">🟢 JANELA ABERTA</span>`
                    : `<span style="background:rgba(239,68,68,0.15);border:1px solid #ef4444;color:#fca5a5;font-size:10px;font-weight:900;padding:3px 8px;border-radius:12px;display:inline-flex;align-items:center;gap:4px">🔒 JANELA FECHADA</span>`
                ) : ''}
              </div>
              <div style="font-size:12px;color:#94a3b8;margin-top:2px">
                Data do recebimento: ${offer.date ? formatDatePtBr(offer.date) : 'Recente'} • Mesa do Agente Oficial
              </div>
            </div>
          </div>

          <!-- CORPO: ANÁLISE COMPARATIVA 'VALE A PENA?' -->
          <div style="background:#090d16;border:1px solid #1e293b;border-radius:14px;padding:16px;margin-bottom:16px">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
              <span style="font-size:16px">⚖️</span>
              <span style="font-size:13px;font-weight:900;color:#38bdf8;text-transform:uppercase;letter-spacing:0.5px">VALE A PENA? ANÁLISE COMPARATIVA DA NEGOCIAÇÃO</span>
            </div>

            ${(isTransfer || isLoan) ? `
              <!-- COMPARAÇÃO DE CLUBES E CONTRATO -->
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                
                <!-- SITUAÇÃO ATUAL -->
                <div style="background:rgba(15,23,42,0.8);border:1px solid #334155;border-radius:10px;padding:12px">
                  <div style="font-size:11px;font-weight:800;color:#94a3b8;margin-bottom:6px">SITUAÇÃO ATUAL:</div>
                  <div style="font-size:14px;font-weight:900;color:#fff">${esc(currentClub)}</div>
                  <div style="margin-top:8px;font-size:12px;color:#cbd5e1;line-height:1.6">
                    <div>💰 Salário: <b>R$ ${curWage.toLocaleString('pt-BR')}/mês</b></div>
                    <div>📅 Contrato: <b>Até ${athlete?.contractUntil || 2028}</b></div>
                    <div>🛡️ Papel: <b>${pState.role || 'Reserva Imediato'}</b></div>
                    <div>🤝 Confiança: <b>${pState.managerTrust || 40}%</b></div>
                  </div>
                </div>

                <!-- NOVA PROPOSTA -->
                <div style="background:rgba(6,78,59,0.25);border:1.5px solid #10b981;border-radius:10px;padding:12px">
                  <div style="font-size:11px;font-weight:800;color:#6ee7b7;margin-bottom:6px">PROPOSTA DO CLUBE:</div>
                  <div style="font-size:14px;font-weight:900;color:#fff">${esc(proposedClub)}</div>
                  <div style="margin-top:8px;font-size:12px;color:#cbd5e1;line-height:1.6">
                    <div>💰 Salário Proposto: <b style="color:#10b981">R$ ${offeredWage.toLocaleString('pt-BR')}/mês</b></div>
                    <div>📈 Variação: <span style="background:${wagePct >= 0 ? '#10b981' : '#ef4444'};color:#000;font-weight:900;padding:1px 6px;border-radius:4px;font-size:11px">${wagePct >= 0 ? '+' : ''}${wagePct}% (${wageDiff >= 0 ? '+R$ ' : '-R$ '}${Math.abs(wageDiff).toLocaleString('pt-BR')})</span></div>
                    <div>📅 Duração: <b>${isLoan ? '1 Temporada (Empréstimo)' : '3 Anos (Definitivo)'}</b></div>
                    <div>⭐ Minutagem: <b>${isLoan ? 'Garantia de Minutos' : 'Disputa de Titularidade'}</b></div>
                  </div>
                </div>

              </div>

              <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px;font-size:11px;color:#94a3b8;background:rgba(0,0,0,0.3);padding:10px;border-radius:8px">
                <div>📌 <b>Multa Rescisória:</b> ${isLoan ? 'Fixada no Contrato de Empréstimo' : 'R$ 8.000.000 a R$ 10.000.000'}</div>
                <div>🎯 <b>Bônus de Desempenho:</b> R$ 500 por gol e premiações por vitórias</div>
              </div>
            ` : `
              <!-- DETALHES DE PATROCÍNIO ESPORTIVO -->
              <div style="background:rgba(15,23,42,0.8);border:1.5px solid ${isRenewal ? '#10b981' : '#06b6d4'};border-radius:10px;padding:14px">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:8px">
                  <div style="font-size:16px;font-weight:900;color:#fff">${esc(offer.clubOrBrand || offer.brand)}</div>
                  <div style="font-size:12px;color:#67e8f9;font-weight:900">Vínculo: ${offer.durationDays || 180} Dias no Calendário</div>
                </div>

                <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:10px;margin-top:10px;text-align:center">
                  <div style="background:#090d16;padding:8px;border-radius:8px">
                    <div style="font-size:10px;color:#94a3b8">MENSALIDADE FIXA</div>
                    <div style="font-size:15px;font-weight:900;color:#10b981">R$ ${(offer.monthly || offer.monthlyStipend || 1000).toLocaleString('pt-BR')}</div>
                    <div style="font-size:10px;color:#64748b">por mês</div>
                  </div>
                  <div style="background:#090d16;padding:8px;border-radius:8px">
                    <div style="font-size:10px;color:#94a3b8">BÔNUS POR GOL</div>
                    <div style="font-size:15px;font-weight:900;color:#38bdf8">R$ ${(offer.bonusGoal || 500).toLocaleString('pt-BR')}</div>
                    <div style="font-size:10px;color:#64748b">a cada gol marcado</div>
                  </div>
                  <div style="background:#090d16;padding:8px;border-radius:8px">
                    <div style="font-size:10px;color:#94a3b8">BÔNUS POR VITÓRIA</div>
                    <div style="font-size:15px;font-weight:900;color:#f59e0b">R$ ${(offer.bonusWin || 500).toLocaleString('pt-BR')}</div>
                    <div style="font-size:10px;color:#64748b">em partidas oficiais</div>
                  </div>
                </div>

                ${(offer.renewalBonus && offer.renewalBonus > 0) ? `
                  <div style="margin-top:12px;background:linear-gradient(135deg,rgba(16,185,129,0.2),rgba(6,78,59,0.3));border:1px solid #10b981;border-radius:8px;padding:10px;display:flex;align-items:center;justify-content:space-between">
                    <div>
                      <div style="font-size:12px;font-weight:900;color:#fff">🎁 LUVAS DE ASSINATURA / BÔNUS DE FIDELIDADE:</div>
                      <div style="font-size:11px;color:#a7f3d0">Creditados integralmente e à vista na sua conta bancária pessoal ao assinar!</div>
                    </div>
                    <div style="font-size:18px;font-weight:900;color:#10b981">
                      + R$ ${offer.renewalBonus.toLocaleString('pt-BR')}
                    </div>
                  </div>
                ` : ''}

                ${offer.reasonText ? `
                  <div style="margin-top:10px;font-size:11px;color:#94a3b8;line-height:1.4">
                    📝 <b>Avaliação de Desempenho da Empresa:</b> ${esc(offer.reasonText)}
                  </div>
                ` : ''}
              </div>
            `}
          </div>

          <!-- PARECER TÉCNICO DO EMPRESÁRIO -->
          <div style="background:linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(15,23,42,0.8) 100%);border:1.5px solid rgba(245,158,11,0.5);border-radius:14px;padding:16px;margin-bottom:20px">
            <div style="display:flex;align-items:flex-start;gap:12px">
              <span style="font-size:26px">👔</span>
              <div>
                <div style="font-size:13px;font-weight:900;color:#fbbf24;margin-bottom:4px">
                  PARECER TÉCNICO DO SEU EMPRESÁRIO:
                </div>
                <div style="font-size:12px;color:#e2e8f0;line-height:1.5;font-style:italic">
                  "${esc(agentOpinionText)}"
                </div>
              </div>
            </div>
          </div>

          <!-- BOTÕES DE AÇÃO -->
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">
            <button type="button" id="btnOfferModalBack" style="background:rgba(255,255,255,0.08);border:1px solid #475569;color:#cbd5e1;font-weight:800;padding:10px 18px;border-radius:10px;cursor:pointer;font-size:12px">
              ⬅️ Voltar / Pensar Mais
            </button>

            <div style="display:flex;gap:10px;align-items:center">
              <button type="button" id="btnOfferModalReject" style="background:#ef4444;color:#fff;font-weight:800;padding:10px 18px;border-radius:10px;border:none;cursor:pointer;font-size:12px">
                ❌ Recusar Proposta
              </button>
              <button type="button" id="btnOfferModalAccept" style="background:${(!isWindowOpen && (isTransfer || isLoan)) ? '#334155' : '#10b981'};color:${(!isWindowOpen && (isTransfer || isLoan)) ? '#94a3b8' : '#000'};font-weight:900;padding:10px 22px;border-radius:10px;border:none;cursor:pointer;font-size:13px;box-shadow:${(!isWindowOpen && (isTransfer || isLoan)) ? 'none' : '0 0 16px rgba(16,185,129,0.4)'}">
                ${(!isWindowOpen && (isTransfer || isLoan)) ? '🔒 Janela Fechada (Bloqueado)' : '✅ Aceitar e Assinar Contrato ✍️'}
              </button>
            </div>
          </div>

        </div>
      `;

      // Eventos dos botões do modal
      document.getElementById('btnCloseOfferDetails')?.addEventListener('click', () => {
        closeActionModal();
        if(typeof window.render === 'function') window.render();
      });
      document.getElementById('btnOfferModalBack')?.addEventListener('click', () => {
        closeActionModal();
        if(typeof window.render === 'function') window.render();
      });

      document.getElementById('btnOfferModalReject')?.addEventListener('click', () => {
        pState.agentOffers.splice(originalIndex, 1);
        closeActionModal();
        if(typeof window.save === 'function') window.save();
        if(typeof window.render === 'function') window.render();
      });

      document.getElementById('btnOfferModalAccept')?.addEventListener('click', () => {
        if(isTransfer || isLoan){
          if(!isWindowOpen){
            showCustomAlert({
              title: 'Janela de Transferências Fechada! 🔒',
              message: `O mercado da bola está FECHADO na data atual (${formatDatePtBr(state.date)}).\n\nVocê só pode mudar de clube durante a Janela de Transferências aberta (Janeiro/Fevereiro e Julho/Agosto).\n\nAguarde a reabertura oficial da janela para formalizar sua transferência!`,
              icon: '🔒',
              type: 'warning'
            });
            return;
          }
          pState.agentOffers.splice(originalIndex, 1);
          closeActionModal();
          executePlayerTransfer(offer, state, athlete, pState);
          return;
        }

        if(isSponsor){
          const curDate = state.date || state.currentDate || '2026-01-18';
          const signed = window.AFM_PlayerEngine?.signSponsorContract(pState, offer, curDate);
          if(!signed?.ok){
            showCustomAlert({ title: 'Saldo insuficiente para a rescisão ⚖️', message: `A multa para encerrar o contrato atual é de R$ ${(signed?.terminationFee || 0).toLocaleString('pt-BR')}. Faltam R$ ${(signed?.shortfall || 0).toLocaleString('pt-BR')}.`, type: 'warning' });
            return;
          }
          const totalDays = signed.durationDays;
          const endDate = signed.endDate;
          if(offer.renewalBonus && offer.renewalBonus > 0){
            pState.personalBank = (pState.personalBank || 0) + offer.renewalBonus;
          }
          pState.agentOffers.splice(originalIndex, 1);
          closeActionModal();
          showCustomAlert({
            title: isRenewal ? 'Renovação Concluída! ✍️' : 'Patrocínio Assinado! 👟',
            message: `Contrato com a ${offer.clubOrBrand} assinado com sucesso por ${totalDays} dias (até ${formatDatePtBr(endDate)})!${signed.terminationFee ? `\nMulta de rescisão anterior: R$ ${signed.terminationFee.toLocaleString('pt-BR')} paga.` : ''}\n${(offer.renewalBonus && offer.renewalBonus > 0) ? `Luvas de R$ ${offer.renewalBonus.toLocaleString('pt-BR')} creditadas à vista na sua conta bancária!\n` : ''}Você receberá R$ ${(offer.monthly || offer.monthlyStipend || 1000).toLocaleString('pt-BR')}/mês e bônus por gols.\nAo término dos dias, a empresa analisará seu desempenho para nova proposta de renovação!`,
            type: 'success',
            onConfirm: () => {
              if(typeof window.save === 'function') window.save();
              if(typeof window.render === 'function') window.render();
            }
          });
        }
      });
    }

    renderModalContent();
  }

  function handleAgentAction(action, state, athlete, pState){
    pState.actionRequests = pState.actionRequests || {};
    switch(action){
      case 'wage_increase':
        openWageNegotiationModal(state, athlete, pState);
        break;
      case 'demand_starter':
        openDemandStarterModal(state, athlete, pState);
        break;
      case 'request_loan':
        openRequestLoanModal(state, athlete, pState);
        break;
      case 'request_transfer':
        openRequestTransferModal(state, athlete, pState);
        break;
    }
  }

  // 6. MODAL: SÚMULA E DETALHES POP-UP DA PARTIDA DISPUTADA
  function openMatchDetailsPopup(m, state){
    if(!m) return;
    const modal = createActionModalContainer();
    const athlete = getControlledPlayer(state);
    const pState = getCareerState(state);
    const isMvp = Boolean(m.isMvp || Number(m.rating) >= 8.0);
    const goals = Number(m.goals) || 0;
    const assists = Number(m.assists) || 0;
    const minutes = Number(m.minutes) || 90;
    const rating = Number(m.rating) || 6.5;
    const ratingColor = rating >= 8.0 ? '#10b981' : (rating >= 7.0 ? '#38bdf8' : (rating >= 6.0 ? '#facc15' : '#ef4444'));

    let coachVerdict = '';
    if(rating >= 8.5){
      coachVerdict = 'Atuação magistral de cinema! O jogador dominou as ações ofensivas, desequilibrou a zaga adversária e foi o grande maestro da partida.';
    } else if(rating >= 7.5){
      coachVerdict = 'Excelente desempenho tático e técnico. Cumpriu com maestria o plano de jogo e foi fundamental na construção das jogadas.';
    } else if(rating >= 6.5){
      coachVerdict = 'Partida segura e disciplinada. Ajudou na marcação e cumpriu as orientações da comissão técnica.';
    } else {
      coachVerdict = 'Partida abaixo do esperado. Faltou intensidade e precisão nas finalizações e passes finais.';
    }

    modal.innerHTML = `
      <div style="background:linear-gradient(135deg, #0b1120 0%, #060913 100%);border:2px solid ${isMvp ? '#facc15' : '#38bdf8'};border-radius:22px;width:100%;max-width:620px;padding:26px;box-shadow:0 0 35px ${isMvp ? 'rgba(250,204,21,0.28)' : 'rgba(56,189,248,0.28)'};color:#fff;font-family:inherit;position:relative;animation:afmScaleUp 0.25s ease">
        
        <!-- BOTÃO FECHAR -->
        <button type="button" id="btnCloseMatchDetailsPopup" style="position:absolute;top:18px;right:18px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);color:#94a3b8;width:34px;height:34px;border-radius:50%;cursor:pointer;font-size:16px;font-weight:900;display:flex;align-items:center;justify-content:center;transition:all 0.2s ease">
          ✕
        </button>

        <!-- CABEÇALHO DA PARTIDA -->
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px">
          <div style="width:48px;height:48px;border-radius:14px;background:${isMvp ? 'rgba(250,204,21,0.15)' : 'rgba(56,189,248,0.15)'};border:1.5px solid ${isMvp ? '#facc15' : '#38bdf8'};display:flex;align-items:center;justify-content:center;font-size:24px">
            ${isMvp ? '⭐' : '📋'}
          </div>
          <div>
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
              <h2 style="margin:0;font-size:18px;font-weight:900;color:#fff">SÚMULA OFICIAL DA PARTIDA</h2>
              ${isMvp ? `
                <span style="background:rgba(250,204,21,0.2);border:1px solid #facc15;color:#fde68a;font-size:10px;font-weight:900;padding:2px 8px;border-radius:12px">
                  ⭐ MELHOR EM CAMPO (MVP)
                </span>
              ` : ''}
            </div>
            <div style="font-size:12px;color:#94a3b8;margin-top:2px">
              ${m.competitionName || state.competition || 'Campeonato'} • ${m.date ? formatDatePtBr(m.date) : 'Data Registrada'}
            </div>
          </div>
        </div>

        <!-- PLACAR DO JOGO -->
        <div style="background:#090d16;border:1px solid #1e293b;border-radius:16px;padding:16px;text-align:center;margin-bottom:18px">
          <div style="display:flex;align-items:center;justify-content:center;gap:18px">
            <div style="font-size:16px;font-weight:900;color:#fff">${esc(state.club)}</div>
            <div style="font-size:24px;font-weight:900;color:#10b981;background:rgba(16,185,129,0.15);padding:4px 16px;border-radius:10px;border:1px solid rgba(16,185,129,0.3)">
              ${esc(m.score || '-')}
            </div>
            <div style="font-size:16px;font-weight:900;color:#fff">${esc(m.opponent || 'Adversário')}</div>
          </div>
        </div>

        <!-- ATUAÇÃO INDIVIDUAL DO ATLETA -->
        <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:10px;margin-bottom:18px;text-align:center">
          <div style="background:#090d16;border:1px solid #1e293b;border-radius:12px;padding:10px">
            <div style="font-size:10px;color:#94a3b8;font-weight:800;text-transform:uppercase">NOTA OFICIAL</div>
            <div style="font-size:22px;font-weight:900;color:${ratingColor};margin-top:2px">${rating.toFixed(1)}</div>
          </div>
          <div style="background:#090d16;border:1px solid #1e293b;border-radius:12px;padding:10px">
            <div style="font-size:10px;color:#94a3b8;font-weight:800;text-transform:uppercase">MINUTOS</div>
            <div style="font-size:22px;font-weight:900;color:#38bdf8;margin-top:2px">${minutes}'</div>
          </div>
          <div style="background:#090d16;border:1px solid #1e293b;border-radius:12px;padding:10px">
            <div style="font-size:10px;color:#94a3b8;font-weight:800;text-transform:uppercase">GOLS</div>
            <div style="font-size:22px;font-weight:900;color:#10b981;margin-top:2px">${goals > 0 ? `⚽ ${goals}` : '0'}</div>
          </div>
          <div style="background:#090d16;border:1px solid #1e293b;border-radius:12px;padding:10px">
            <div style="font-size:10px;color:#94a3b8;font-weight:800;text-transform:uppercase">ASSISTS</div>
            <div style="font-size:22px;font-weight:900;color:#c084fc;margin-top:2px">${assists > 0 ? `👟 ${assists}` : '0'}</div>
          </div>
        </div>

        <!-- PARECER DO TREINADOR -->
        <div style="background:rgba(15,23,42,0.8);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:14px;margin-bottom:14px">
          <div style="font-size:11px;font-weight:900;color:#facc15;text-transform:uppercase;margin-bottom:4px;display:flex;align-items:center;gap:6px">
            <span>👔</span> AVALIAÇÃO DA COMISSÃO TÉCNICA
          </div>
          <div style="font-size:12px;color:#cbd5e1;line-height:1.5;font-style:italic">
            "${esc(coachVerdict)}"
          </div>
        </div>

        <!-- REPERCUSSÃO NAS REDES E IMPRENSA -->
        <div style="background:rgba(15,23,42,0.8);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:14px;margin-bottom:20px">
          <div style="font-size:11px;font-weight:900;color:#38bdf8;text-transform:uppercase;margin-bottom:4px;display:flex;align-items:center;gap:6px">
            <span>📱</span> REPERCUSSÃO NO FOOTGRAM & TORCIDA
          </div>
          <div style="font-size:12px;color:#cbd5e1;line-height:1.5">
            ${rating >= 8.0
              ? `Os torcedores foram à loucura nas redes sociais exaltando a atuação de <b>${esc(athlete?.name || 'Craque')}</b>! O nome do atleta figurou entre os mais comentados do dia no FootGram!`
              : rating >= 6.5
              ? `A torcida aplaudiu a garra em campo e destacou a entrega tática na partida.`
              : `Comentários nas redes pedem mais minutos e apoio da torcida para recuperar a melhor fase.`
            }
          </div>
        </div>

        <!-- BOTÃO FECHAR -->
        <div style="display:flex;justify-content:center">
          <button type="button" id="btnOkCloseMatchDetails" class="btn primary" style="background:linear-gradient(135deg,#7c3aed,#9333ea);color:#fff;font-weight:900;padding:11px 32px;border-radius:10px;border:none;cursor:pointer;font-size:13px">
            Fechar Súmula
          </button>
        </div>

      </div>
    `;

    document.getElementById('btnCloseMatchDetailsPopup')?.addEventListener('click', () => closeActionModal());
    document.getElementById('btnOkCloseMatchDetails')?.addEventListener('click', () => closeActionModal());
  }

  /**
   * VESTIÁRIO EXCLUSIVO DO MODO JOGADOR (BE A PRO) — INTERVALO DE PARTIDA
   * Substitui a prancheta de técnico por um relatório individual do atleta:
   * nota da atuação até o momento, estatísticas de passes/gols/assistências,
   * confiança com o treinador e decisões da IA para o 2º tempo.
   */
  function getPlayerSubstitutionChance(trust, scoreText, warmedUp){
    return Math.max(10, Math.min(90, Math.round(20 + Math.max(0, Math.min(100, Number(trust) || 0)) * 0.45 + (scoreText === 'Perdendo' ? 15 : 0) + (warmedUp ? 10 : 0))));
  }
  function isSubstitutionAccepted(chance, roll = Math.random()){
    return Math.max(0, Math.min(100, Number(chance) || 0)) > roll * 100;
  }

  function openPlayerCareerHalftimeModal(isQuickTactics = false){
    const s = window.liveMatchState;
    const gameState = window.state;
    if(!s || !gameState) return;

    let modalEl = document.getElementById('halftimeModalContainer');
    if(!modalEl){
      modalEl = document.createElement('div');
      modalEl.id = 'halftimeModalContainer';
      document.body.appendChild(modalEl);
    }

    const userIsHome = (typeof window.norm === 'function' ? window.norm(s.home) === window.norm(gameState.club) : (s.home === gameState.club));
    const pCareer = gameState.playerCareerState || {};
    const athlete = (gameState.squad || []).find(p => p.id === gameState.controlledPlayerId) || {
      name: pCareer.athleteName || 'Seu Atleta',
      pos: pCareer.position || 'ATA',
      number: pCareer.shirtNumber || 10,
      ovr: 40
    };

    const myTeam = userIsHome ? s.homePlayers : s.awayPlayers;
    const athleteOnPitch = (myTeam || []).find(p => p.isControlledAthlete);
    const isOnPitch = Boolean(athleteOnPitch);
    const canAskCoach = !isOnPitch && s.playerCareerAvailableForMatch !== false && Number(s.subsLeft) > 0;
    let trust = Number(pCareer.managerTrust) || 35;

    // Placar e contexto
    const scoreText = s.hg === s.ag
      ? 'Empatando'
      : (userIsHome ? (s.hg > s.ag ? 'Vencendo' : 'Perdendo') : (s.ag > s.hg ? 'Vencendo' : 'Perdendo'));
    const scoreColor = s.hg === s.ag ? '#38bdf8' : (scoreText === 'Vencendo' ? '#10b981' : '#f87171');

    // Estatísticas individuais do 1º tempo
    let goals = 0;
    let assists = 0;
    let shots = 0;
    let passesCompleted = 0;
    let passesAttempted = 0;
    let tackles = 0;
    let staminaPct = 100;
    let rating = 6.5;

    if(isOnPitch && athleteOnPitch){
      goals = athleteOnPitch.matchGoals || (s.events || []).filter(e => e.type === 'gol' && (e.playerId === athleteOnPitch.id || e.text?.includes(athlete.name))).length;
      assists = athleteOnPitch.matchAssists || (s.events || []).filter(e => e.type === 'gol' && e.relatedPlayerId === athleteOnPitch.id).length;
      shots = athleteOnPitch.matchShots || Math.max(goals, Math.floor((s.events || []).filter(e => e.type === 'finalizacao' && (e.playerId === athleteOnPitch.id || e.text?.includes(athlete.name))).length) || (goals > 0 ? goals + 1 : 2));
      passesAttempted = athleteOnPitch.passesAttempted || (14 + Math.floor(athlete.ovr * 0.1));
      passesCompleted = athleteOnPitch.passesCompleted || Math.round(passesAttempted * (0.78 + Math.min(0.18, (athlete.attributes?.pas || 35) * 0.002)));
      tackles = athleteOnPitch.matchTackles || Math.floor((athlete.attributes?.def || 30) * 0.05);
      staminaPct = Math.max(40, Math.round(athleteOnPitch.stamina || (100 - (s.minute * 0.3))));
      athleteOnPitch.matchGoals = goals;
      athleteOnPitch.matchAssists = assists;
      athleteOnPitch.matchShots = shots;
      athleteOnPitch.passesAttempted = passesAttempted;
      athleteOnPitch.passesCompleted = passesCompleted;
      athleteOnPitch.matchTackles = tackles;

      // Nota do 1º tempo calculada dinamicamente
      let calcRating = 6.2 + (goals * 1.3) + (assists * 0.8) + ((passesCompleted / passesAttempted) * 0.5) + (shots * 0.2);
      if(scoreText === 'Vencendo') calcRating += 0.4;
      if(scoreText === 'Perdendo') calcRating -= 0.4;
      rating = Math.max(4.5, Math.min(10.0, Number(calcRating.toFixed(1))));
      athleteOnPitch.firstHalfRating = rating;
    }

    // Classificação da Nota
    const ratingBadgeColor = rating >= 8.0 ? '#10b981' : rating >= 7.0 ? '#38bdf8' : rating >= 6.0 ? '#facc15' : '#ef4444';
    const ratingLabel = rating >= 8.5 ? 'Craque do Jogo' : rating >= 7.5 ? 'Excelente' : rating >= 6.5 ? 'Bom Desempenho' : rating >= 5.5 ? 'Regular' : 'Abaixo do Esperado';

    // Status da Confiança do Treinador
    let trustStatus = 'Reserva Imediato';
    let trustBadgeBg = '#f59e0b';
    if(trust >= 85){ trustStatus = 'Estrela & Capitão'; trustBadgeBg = '#a855f7'; }
    else if(trust >= 60){ trustStatus = 'Titular de Confiança'; trustBadgeBg = '#10b981'; }
    else if(trust >= 30){ trustStatus = 'Reserva Imediato / Opção'; trustBadgeBg = '#f59e0b'; }
    else { trustStatus = 'Pouco Prestígio / Em Avaliação'; trustBadgeBg = '#ef4444'; }

    // Fala do Treinador no Vestiário
    let coachSpeech = '';
    const coachTitle = `Palavra do Professor (${gameState.manager || 'Treinador da IA'})`;
    let subDecisionNotice = '';

    if(!isOnPitch){
      s.shouldSubPlayerAtHalftime = false;
      if(canAskCoach){
        coachSpeech = `"Mantenha o foco no banco de reservas, ${athlete.name}. O aquecimento e o andamento da partida podem abrir uma oportunidade."`;
        subDecisionNotice = '⏳ STATUS: No banco, aguardando uma oportunidade da comissão.';
      } else if(s.playerCareerAvailableForMatch === false){
        coachSpeech = `"Você está com desgaste físico alto, ${athlete.name}. Vamos preservar sua condição e evitar uma entrada sem segurança."`;
        subDecisionNotice = '🩺 STATUS: Fora dos relacionados por desgaste físico (40% ou menos).';
      } else {
        coachSpeech = `"As substituições disponíveis já foram usadas, ${athlete.name}. Continue apoiando a equipe do banco."`;
        subDecisionNotice = '⏳ STATUS: Sem substituições disponíveis para esta partida.';
      }
    } else {
      if(rating >= 7.5){
        coachSpeech = `"Excelente primeira etapa, ${athlete.name}! Você está vencendo os duelos individuais e criando perigo. Continue nessa mesma pegada no segundo tempo!"`;
        subDecisionNotice = '✅ STATUS: Confirmado e mantido como titular absoluto no 2º tempo.';
      } else if(rating >= 6.5){
        coachSpeech = `"Bom trabalho coletivo no primeiro tempo, ${athlete.name}. No segundo tempo quero mais aproximação com os companheiros e chutes rápidos de média distância."`;
        subDecisionNotice = '✅ STATUS: Mantido na equipe para a etapa final.';
      } else {
        coachSpeech = `"Você está sumido no jogo, ${athlete.name}! Quero mais entrega, bote pressão na saída de bola e movimentação rápida, senão serei obrigado a mexer no time."`;
        subDecisionNotice = '⚠️ ALERTA DO TÉCNICO: Sob observação (risco de substituição se cansar).';
      }
    }

    modalEl.innerHTML = `
      <div class="halftime-overlay" style="position:fixed;inset:0;background:rgba(2,6,23,0.94);backdrop-filter:blur(14px);z-index:999999;display:flex;align-items:center;justify-content:center;padding:14px;animation:afmFadeIn 0.25s ease">
        <div style="background:linear-gradient(145deg, #0f172a 0%, #1e1b4b 55%, #090d16 100%);border:2px solid #7c3aed;border-radius:24px;padding:22px 24px;max-width:880px;width:100%;box-shadow:0 24px 70px rgba(0,0,0,0.85);color:#fff;display:flex;flex-direction:column;gap:16px">
          
          <!-- TOPO DO VESTIÁRIO: CABEÇALHO & PLACAR AO VIVO -->
          <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:12px">
            <div>
              <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(124,58,237,0.25);border:1px solid #a855f7;padding:3px 12px;border-radius:20px;font-size:11px;font-weight:900;color:#c084fc;text-transform:uppercase;letter-spacing:0.5px">
                ⚽ VESTIÁRIO DO ATLETA · MODO JOGADOR (BE A PRO)
              </div>
              <h2 style="margin:4px 0 0 0;font-size:20px;font-weight:900;color:#fff">
                ${isQuickTactics ? 'PARADA TÁTICA / INSTRUÇÕES' : 'INTERVALO DE JOGO'}
              </h2>
              <div style="font-size:11px;color:#94a3b8">
                Clube: <b style="color:#fff">${window.esc ? window.esc(gameState.club) : gameState.club}</b> · Situação: <span style="color:${scoreColor};font-weight:800">${scoreText.toUpperCase()}</span>
              </div>
            </div>

            <!-- PLACAR CENTRAL DO JOGO -->
            <div style="display:flex;align-items:center;gap:12px;background:rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.12);border-radius:14px;padding:8px 18px">
              <div style="display:flex;align-items:center;gap:6px">
                ${typeof window.clubBadge === 'function' ? window.clubBadge(s.home, 26) : ''}
                <span style="font-size:13px;font-weight:900;color:#fff">${window.esc ? window.esc(s.home) : s.home}</span>
              </div>
              <div style="font-size:22px;font-weight:900;letter-spacing:2px;color:#facc15;background:#090d16;padding:2px 12px;border-radius:8px;border:1px solid rgba(250,204,21,0.3)">
                ${s.hg} - ${s.ag}
              </div>
              <div style="display:flex;align-items:center;gap:6px">
                <span style="font-size:13px;font-weight:900;color:#fff">${window.esc ? window.esc(s.away) : s.away}</span>
                ${typeof window.clubBadge === 'function' ? window.clubBadge(s.away, 26) : ''}
              </div>
            </div>
          </div>

          <!-- CORPO: DUAS COLUNAS (PERFIL & DESEMPENHO vs CONFIANÇA & FALA DO TÉCNICO) -->
          <div style="display:grid;grid-template-columns:1.15fr 1fr;gap:18px">
            
            <!-- COLUNA ESQUERDA: DESEMPENHO INDIVIDUAL DO ATLETA -->
            <div style="background:#090d16;border:1px solid rgba(255,255,255,0.08);border-radius:18px;padding:18px;display:flex;flex-direction:column;gap:14px">
              
              <!-- IDENTIFICAÇÃO DO ATLETA -->
              <div style="display:flex;align-items:center;gap:12px;border-bottom:1px solid rgba(255,255,255,0.06);padding-bottom:12px">
                <div style="width:52px;height:52px;border-radius:12px;overflow:hidden;background:#1e293b;border:2px solid #7c3aed;flex-shrink:0">
                  ${athlete.photo ? `<img src="${athlete.photo}" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none'">` : '<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:22px">⭐</div>'}
                </div>
                <div style="flex:1">
                  <div style="font-size:16px;font-weight:900;color:#fff">
                    ${window.esc ? window.esc(athlete.name.toUpperCase()) : athlete.name.toUpperCase()} <span style="color:#a855f7">#${athlete.number || 10}</span>
                  </div>
                  <div style="display:flex;align-items:center;gap:6px;margin-top:2px">
                    <span class="pill" style="background:#7c3aed;color:#fff;font-size:9px;font-weight:900">${athlete.pos || 'ATA'}</span>
                    <span class="pill" style="background:${isOnPitch ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'};color:${isOnPitch ? '#34d399' : '#facc15'};border:1px solid ${isOnPitch ? '#10b981' : '#f59e0b'};font-size:9px;font-weight:900">
                      ${isOnPitch ? '🟢 EM CAMPO (TITULAR)' : '🟡 BANCO DE RESERVAS'}
                    </span>
                  </div>
                </div>

                <!-- NOTA DO JOGO EM DESTAQUE -->
                <div style="text-align:center;background:#1e293b;border:2px solid ${ratingBadgeColor};border-radius:12px;padding:6px 14px">
                  <div id="valAthleteHalftimeRating" style="font-size:24px;font-weight:900;color:${ratingBadgeColor}">${isOnPitch ? rating : '---'}</div>
                  <div id="lblAthleteHalftimeRating" style="font-size:9px;font-weight:800;color:#94a3b8;white-space:nowrap">${isOnPitch ? ratingLabel : 'NO BANCO'}</div>
                </div>
              </div>

              <!-- GRADE DE ESTATÍSTICAS INDIVIDUAIS -->
              <div>
                <div style="font-size:11px;font-weight:800;color:#94a3b8;margin-bottom:8px;text-transform:uppercase">
                  📊 ESTATÍSTICAS INDIVIDUAIS NO JOGO:
                </div>
                <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:8px">
                  <div style="background:#131d2e;border:1px solid #1e293b;border-radius:10px;padding:8px;text-align:center">
                    <div style="font-size:18px;font-weight:900;color:#10b981">${goals}</div>
                    <div style="font-size:10px;color:#94a3b8;font-weight:700">⚽ Gols</div>
                  </div>
                  <div style="background:#131d2e;border:1px solid #1e293b;border-radius:10px;padding:8px;text-align:center">
                    <div style="font-size:18px;font-weight:900;color:#38bdf8">${assists}</div>
                    <div style="font-size:10px;color:#94a3b8;font-weight:700">🎯 Assistências</div>
                  </div>
                  <div style="background:#131d2e;border:1px solid #1e293b;border-radius:10px;padding:8px;text-align:center">
                    <div style="font-size:18px;font-weight:900;color:#facc15">${shots}</div>
                    <div style="font-size:10px;color:#94a3b8;font-weight:700">⚡ Chutes a Gol</div>
                  </div>
                  <div style="background:#131d2e;border:1px solid #1e293b;border-radius:10px;padding:8px;text-align:center">
                    <div style="font-size:15px;font-weight:900;color:#fff">${isOnPitch ? `${passesCompleted}/${passesAttempted}` : '0/0'}</div>
                    <div style="font-size:10px;color:#94a3b8;font-weight:700">👟 Passes (${passesAttempted > 0 ? Math.round((passesCompleted/passesAttempted)*100) : 0}%)</div>
                  </div>
                  <div style="background:#131d2e;border:1px solid #1e293b;border-radius:10px;padding:8px;text-align:center">
                    <div style="font-size:18px;font-weight:900;color:#a855f7">${tackles}</div>
                    <div style="font-size:10px;color:#94a3b8;font-weight:700">🛡️ Desarmes</div>
                  </div>
                  <div style="background:#131d2e;border:1px solid #1e293b;border-radius:10px;padding:8px;text-align:center">
                    <div id="txtAthleteStaminaVal" style="font-size:18px;font-weight:900;color:${staminaPct >= 70 ? '#10b981' : '#f59e0b'}">${staminaPct}%</div>
                    <div style="font-size:10px;color:#94a3b8;font-weight:700">🔋 Fôlego</div>
                  </div>
                </div>
              </div>

              <!-- BARRA DE ENERGIA / FÔLEGO DO JOGADOR -->
              <div>
                <div style="display:flex;justify-content:space-between;font-size:11px;font-weight:800;color:#cbd5e1;margin-bottom:4px">
                  <span>CONDIÇÃO FÍSICA PARA O 2º TEMPO</span>
                  <span id="txtAthleteStaminaHeader" style="color:#10b981">${staminaPct}%</span>
                </div>
                <div style="width:100%;height:8px;background:#1e293b;border-radius:4px;overflow:hidden">
                  <div id="barAthleteHalftimeEnergy" style="width:${staminaPct}%;height:100%;background:linear-gradient(90deg, #10b981, #38bdf8);border-radius:4px;transition:width 0.3s"></div>
                </div>
              </div>

            </div>

            <!-- COLUNA DIREITA: CONFIANÇA COM O TREINADOR & AÇÕES DO VESTIÁRIO -->
            <div style="display:flex;flex-direction:column;gap:14px">
              
              <!-- CARD DE CONFIANÇA DO TREINADOR -->
              <div style="background:#090d16;border:1px solid rgba(255,255,255,0.08);border-radius:18px;padding:18px">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                  <div>
                    <span style="font-size:10px;font-weight:800;color:#c084fc;text-transform:uppercase">RELAÇÃO COM O TREINADOR:</span>
                    <div id="txtHalftimeTrustStatus" style="font-size:15px;font-weight:900;color:#fff">${trustStatus}</div>
                  </div>
                  <span id="badgeHalftimeTrust" class="pill" style="background:${trustBadgeBg};color:#000;font-size:11px;font-weight:900;padding:4px 10px;border-radius:8px">
                    ${trust} / 100
                  </span>
                </div>

                <div style="width:100%;height:8px;background:#1e293b;border-radius:4px;overflow:hidden;margin-bottom:12px">
                  <div id="barHalftimeTrust" style="width:${trust}%;height:100%;background:linear-gradient(90deg,#7c3aed,#a855f7);border-radius:4px;transition:width 0.3s"></div>
                </div>

                <!-- FALA DO TREINADOR NO VESTIÁRIO -->
                <div style="background:rgba(124,58,237,0.12);border-left:3px solid #a855f7;border-radius:8px;padding:10px 12px">
                  <div style="font-size:10px;font-weight:800;color:#c084fc;margin-bottom:2px">
                    🗣️ ${coachTitle}:
                  </div>
                  <div id="txtHalftimeCoachSpeech" style="font-size:12px;color:#e2e8f0;line-height:1.4;font-style:italic">
                    ${coachSpeech}
                  </div>
                </div>

                <div id="txtHalftimeSubNotice" style="margin-top:10px;font-size:11px;font-weight:800;color:#38bdf8;display:flex;align-items:center;gap:6px">
                  ${subDecisionNotice}
                </div>
              </div>

              <!-- AÇÕES INTERATIVAS DO JOGADOR NO VESTIÁRIO -->
              <div style="background:#090d16;border:1px solid rgba(255,255,255,0.08);border-radius:18px;padding:16px;flex:1;display:flex;flex-direction:column;justify-content:space-between">
                <div>
                  <div style="font-size:11px;font-weight:800;color:#94a3b8;margin-bottom:10px;text-transform:uppercase">
                    ⚡ ATITUDE DO ATLETA NO INTERVALO:
                  </div>

                  <div style="display:flex;flex-direction:column;gap:8px">
                    ${canAskCoach ? `
                      <button type="button" id="btnHalftimeWarmup" class="btn warning" style="background:linear-gradient(135deg,#f59e0b,#d97706);color:#000;font-size:12px;font-weight:900;padding:10px 14px;border-radius:10px;cursor:pointer;border:none;text-align:left;display:flex;justify-content:space-between;align-items:center">
                        <span>🔥 Aquecer Intensamente no Gramado</span>
                        <span style="font-size:10px;opacity:0.9;background:rgba(0,0,0,0.25);padding:2px 8px;border-radius:6px">+10% chance de entrada</span>
                      </button>

                      <button type="button" id="btnHalftimeAskToPlay" class="btn primary" style="background:linear-gradient(135deg,#7c3aed,#9333ea);color:#fff;font-size:12px;font-weight:900;padding:10px 14px;border-radius:10px;cursor:pointer;border:none;text-align:left;display:flex;justify-content:space-between;align-items:center">
                        <span>🗣️ Pedir Chance ao Professor</span>
                        <span style="font-size:10px;color:#c084fc;background:rgba(0,0,0,0.3);padding:2px 8px;border-radius:6px">${getPlayerSubstitutionChance(trust, scoreText, Boolean(s.playerCareerWarmup))}% de chance</span>
                      </button>
                    ` : !isOnPitch ? `
                      <div style="padding:10px 12px;border-radius:10px;background:#111827;color:#94a3b8;font-size:12px">${s.playerCareerAvailableForMatch === false ? '🩺 Descanse para recuperar o físico antes de voltar a ser relacionado.' : '⏳ A comissão não tem substituições disponíveis.'}</div>
                    ` : `
                      <button type="button" id="btnHalftimeHydrate" class="btn success" style="background:linear-gradient(135deg,#10b981,#059669);color:#000;font-size:12px;font-weight:900;padding:10px 14px;border-radius:10px;cursor:pointer;border:none;text-align:left;display:flex;justify-content:space-between;align-items:center">
                        <span>💧 Hidratar & Recuperar Fôlego</span>
                        <span style="font-size:10px;opacity:0.9;background:rgba(0,0,0,0.25);padding:2px 8px;border-radius:6px">+8% Energia</span>
                      </button>

                      <button type="button" id="btnHalftimeTacticsFocus" class="btn primary" style="background:linear-gradient(135deg,#7c3aed,#9333ea);color:#fff;font-size:12px;font-weight:900;padding:10px 14px;border-radius:10px;cursor:pointer;border:none;text-align:left;display:flex;justify-content:space-between;align-items:center">
                        <span>🎯 Ouvir Instruções Específicas</span>
                        <span style="font-size:10px;color:#c084fc;background:rgba(0,0,0,0.3);padding:2px 8px;border-radius:6px">+Precisão de Passes</span>
                      </button>
                    `}
                  </div>
                </div>

                <div id="halftimeFeedbackMsg" style="min-height:20px;font-size:11px;font-weight:800;color:#34d399;margin-top:8px;text-align:center"></div>
              </div>

            </div>

          </div>

          <!-- RODAPÉ: BOTÃO DE VOLTAR AO JOGO -->
          <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid rgba(255,255,255,0.08);padding-top:14px">
            <div style="font-size:12px;color:#94a3b8">
              A comissão técnica da IA comanda o restante da equipe. Você controla o destino do seu atleta!
            </div>
            
            <button type="button" id="btnPlayerResumeMatch" class="btn success" style="background:linear-gradient(135deg,#10b981,#059669);color:#000;font-size:15px;font-weight:900;padding:12px 36px;border-radius:12px;cursor:pointer;border:none;box-shadow:0 0 24px rgba(16,185,129,0.5)">
              ${isQuickTactics ? '▶️ RETOMAR PARTIDA ➔' : '▶️ COMEÇAR O 2º TEMPO ➔'}
            </button>
          </div>

        </div>
      </div>
    `;

    // Interações de Vestiário
    const btnWarmup = modalEl.querySelector('#btnHalftimeWarmup');
    if(btnWarmup){
      btnWarmup.onclick = () => {
        s.playerCareerWarmup = true;
        btnWarmup.disabled = true;
        btnWarmup.style.opacity = '0.6';
        const msg = modalEl.querySelector('#halftimeFeedbackMsg');
        if(msg) msg.textContent = '🔥 Aquecimento concluído: sua chance de ser chamado aumentou em 10 pontos percentuais.';
        const notice = modalEl.querySelector('#txtHalftimeSubNotice');
        if(notice) notice.innerHTML = '🔥 Você está aquecido. A decisão final continua com o professor.';
        const askButton = modalEl.querySelector('#btnHalftimeAskToPlay');
        if(askButton) askButton.querySelector('span:last-child').textContent = `${getPlayerSubstitutionChance(trust, scoreText, true)}% de chance`;
        if(typeof window.toast === 'function') window.toast('🔥 Aquecimento realizado com sucesso!');
      };
    }

    const btnAskToPlay = modalEl.querySelector('#btnHalftimeAskToPlay');
    if(btnAskToPlay){
      btnAskToPlay.onclick = () => {
        btnAskToPlay.disabled = true;
        btnAskToPlay.style.opacity = '0.6';
        const chance = getPlayerSubstitutionChance(trust, scoreText, Boolean(s.playerCareerWarmup));
        const accepted = isSubstitutionAccepted(chance);
        const msg = modalEl.querySelector('#halftimeFeedbackMsg');
        if(accepted){
          pCareer.managerTrust = Math.min(100, trust + 1);
          trust = pCareer.managerTrust;
          s.shouldSubPlayerAtHalftime = true;
          if(msg) msg.textContent = `🗣️ O professor aceitou seu pedido (${chance}%): prepare-se, você entra na próxima parada do jogo.`;
          if(typeof window.toast === 'function') window.toast(`🗣️ Pedido aceito! Chance calculada: ${chance}%.`);
        } else {
          s.shouldSubPlayerAtHalftime = false;
          if(msg) msg.textContent = `🗣️ O professor agradeceu, mas decidiu manter a formação por enquanto (${chance}% de chance).`;
          if(typeof window.toast === 'function') window.toast(`🗣️ Pedido recusado desta vez (${chance}% de chance).`);
        }
        const bTrust = modalEl.querySelector('#barHalftimeTrust');
        if(bTrust) bTrust.style.width = `${trust}%`;
        const badge = modalEl.querySelector('#badgeHalftimeTrust');
        if(badge) badge.textContent = `${trust} / 100`;
      };
    }

    const btnHydrate = modalEl.querySelector('#btnHalftimeHydrate');
    if(btnHydrate){
      btnHydrate.onclick = () => {
        btnHydrate.disabled = true;
        btnHydrate.style.opacity = '0.6';
        staminaPct = Math.min(100, staminaPct + 8);
        if(athleteOnPitch) athleteOnPitch.stamina = staminaPct;
        const bEnergy = modalEl.querySelector('#barAthleteHalftimeEnergy');
        if(bEnergy) bEnergy.style.width = `${staminaPct}%`;
        const txtVal = modalEl.querySelector('#txtAthleteStaminaVal');
        if(txtVal) txtVal.textContent = `${staminaPct}%`;
        const txtH = modalEl.querySelector('#txtAthleteStaminaHeader');
        if(txtH) txtH.textContent = `${staminaPct}%`;
        const msg = modalEl.querySelector('#halftimeFeedbackMsg');
        if(msg) msg.textContent = '💧 Você se hidratou com isotônico e recuperou +8% de fôlego!';
        if(typeof window.toast === 'function') window.toast('💧 Energia recuperada para a etapa final!');
      };
    }

    const btnTacticsFocus = modalEl.querySelector('#btnHalftimeTacticsFocus');
    if(btnTacticsFocus){
      btnTacticsFocus.onclick = () => {
        btnTacticsFocus.disabled = true;
        btnTacticsFocus.style.opacity = '0.6';
        pCareer.managerTrust = Math.min(100, (pCareer.managerTrust || 35) + 1);
        const msg = modalEl.querySelector('#halftimeFeedbackMsg');
        if(msg) msg.textContent = '🎯 Foco tático ajustado! Passes e visão aprimorados para o 2º tempo!';
        if(typeof window.toast === 'function') window.toast('🎯 Instruções assimiladas com sucesso!');
      };
    }

    // Retomada da Partida
    const btnResume = modalEl.querySelector('#btnPlayerResumeMatch');
    if(btnResume){
      btnResume.onclick = () => {
        modalEl.remove();

        // Se o atleta estava no banco e o técnico marcou a entrada dele:
        if(canAskCoach && s.shouldSubPlayerAtHalftime){
          if(typeof window.triggerPlayerCareerSubstitution === 'function'){
            const entered = window.triggerPlayerCareerSubstitution(s);
            if(!entered && typeof window.toast === 'function') window.toast('A comissão não conseguiu realizar a substituição. Você permanece no banco.');
          }
        }

        if(typeof window.applyCpuReactiveHalftimeTactics === 'function'){
          window.applyCpuReactiveHalftimeTactics(s);
        }

        if(typeof window.transitionMatchPhase === 'function'){
          window.transitionMatchPhase('SECOND_HALF');
        }
        s.phase = 'SECOND_HALF';
        s.minute = 45;
        s.timeSec = 2700;

        s.playing = true;
        s.lastLoopTime = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
        s.secAccumulator = 0;
        const playBtn = document.getElementById('btnLivePlayToggle');
        if(playBtn) playBtn.textContent = '⏸';
        const overlay = document.getElementById('livePauseOverlay');
        if(overlay) overlay.style.display = 'none';

        if(window.afmAudio){
          window.afmAudio.playSFX('whistle_start');
        } else if(typeof window.playWhistleSound === 'function'){
          window.playWhistleSound();
        }

        if(typeof window.renderLiveMatchModal === 'function'){
          window.renderLiveMatchModal();
        }
        if(typeof window.toast === 'function'){
          window.toast('Bola rolando para a etapa complementar!');
        }
      };
    }
  }

  // Exportação Global
  window.AFM_PlayerMode = {
    renderPage,
    restorePlayerProfile,
    renderPlayerSocialMedia,
    renderPlayerNationalTeam,
    openCallUpAnnouncementModal,
    showCustomAlert,
    showPostMatchSummaryModal,
    openPlayerCareerHalftimeModal,
    getPlayerSubstitutionChance,
    isSubstitutionAccepted,
    openSeasonGalaAwardsModal,
    bindPlayerModeEvents,
    getCareerState
  };

})(window);
