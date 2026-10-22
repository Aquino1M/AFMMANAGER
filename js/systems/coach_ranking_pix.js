/**
 * AFM 2027 - Ranking Oficial de Técnicos & Premiação PIX R$ 1.000,00
 * Sistema de pontuação competitiva, selos de prestígio, divisão de premiação para o TOP 5 no PIX
 * e interface fiel ao Brasileirinho FC.
 */
(function(window){
  'use strict';

  const esc = (window && typeof window.esc === 'function') ? window.esc : (typeof globalThis.esc === 'function' ? globalThis.esc : (s => String(s ?? '')));
  if (window && !window.esc) window.esc = esc;

  // Chaves de armazenamento local
  const STORAGE_KEY_RANKING = 'afm_coach_ranking_v3';
  const STORAGE_KEY_PIX = 'afm_user_pix_key_v1';
  const STORAGE_KEY_BOARD = 'afm_ranking_active_board_v1';

  // Divisões de Prestígio Oficiais
  const PRESTIGE_TIERS = [
    { id: 'lenda', label: 'Lenda', minPoints: 12000, icon: '👑', color: '#facc15', bg: '#0b0716', border: '#facc15', ring: 'ring-neon-gold' },
    { id: 'estrategista', label: 'Estrategista', minPoints: 6000, icon: '🎖️', color: '#c084fc', bg: '#4c1d95', border: '#a855f7', bars: 4 },
    { id: 'professor', label: 'Professor', minPoints: 2500, icon: '🎓', color: '#e9d5ff', bg: '#6b21a8', border: '#c084fc', bars: 3 },
    { id: 'efetivado', label: 'Efetivado', minPoints: 1000, icon: '👔', color: '#86efac', bg: '#14532d', border: '#22c55e', bars: 2 },
    { id: 'interino', label: 'Interino', minPoints: 300, icon: '📋', color: '#bae6fd', bg: '#0369a1', border: '#38bdf8', bars: 1 },
    { id: 'estagiario', label: 'Estagiário', minPoints: 0, icon: '🧢', color: '#cbd5e1', bg: '#334155', border: '#64748b', bars: 0 }
  ];

  // Divisão Oficial da Premiação de R$ 1.000,00 no PIX para o TOP 5
  const PIX_PRIZES = {
    1: { value: 450, label: 'R$ 450,00', trophy: '🥇 Troféu Ouro & Campeão', badge: '💠 R$ 450 NO PIX' },
    2: { value: 250, label: 'R$ 250,00', trophy: '🥈 Troféu Prata', badge: '💠 R$ 250 NO PIX' },
    3: { value: 150, label: 'R$ 150,00', trophy: '🥉 Troféu Bronze', badge: '💠 R$ 150 NO PIX' },
    4: { value: 100, label: 'R$ 100,00', trophy: '🏅 Top 4', badge: '💠 R$ 100 NO PIX' },
    5: { value: 50,  label: 'R$ 50,00',  trophy: '🏅 Top 5', badge: '💠 R$ 50 NO PIX' }
  };

  // Pool inicial de técnicos competitivos do Brasileirão e de usuários do jogo
  const BASE_COACHES = [
    { name: 'Paulo Herren', club: 'Remo', points: 17959, seasonPoints: 4890, weekPoints: 920, wins: 608, move: 0, isUser: false },
    { name: 'Gabriel Mendes', club: 'Atlético-MG', points: 11834, seasonPoints: 3940, weekPoints: 850, wins: 325, move: 1, isUser: false },
    { name: 'Matheus Silva', club: 'Flamengo', points: 10143, seasonPoints: 3510, weekPoints: 780, wins: 389, move: -1, isUser: false },
    { name: 'Lucas Souza', club: 'Palmeiras', points: 9556, seasonPoints: 3120, weekPoints: 740, wins: 298, move: 3, isUser: false },
    { name: 'Rodrigo B.', club: 'Grêmio', points: 8740, seasonPoints: 2890, weekPoints: 690, wins: 242, move: 0, isUser: false },
    { name: 'Bruno Costa', club: 'Santos', points: 7920, seasonPoints: 2650, weekPoints: 640, wins: 215, move: -2, isUser: false },
    { name: 'Carlos Eduardo', club: 'Corinthians', points: 7310, seasonPoints: 2480, weekPoints: 590, wins: 198, move: 2, isUser: false },
    { name: 'Felipe Alcantara', club: 'São Paulo', points: 6840, seasonPoints: 2310, weekPoints: 540, wins: 182, move: -1, isUser: false },
    { name: 'Thiago Neves', club: 'Cruzeiro', points: 6250, seasonPoints: 2140, weekPoints: 510, wins: 167, move: 1, isUser: false },
    { name: 'André Ramos', club: 'Internacional', points: 5930, seasonPoints: 1980, weekPoints: 470, wins: 154, move: 0, isUser: false },
    { name: 'Eduardo Paiva', club: 'Vasco', points: 5410, seasonPoints: 1820, weekPoints: 440, wins: 139, move: 4, isUser: false },
    { name: 'Leonardo Lima', club: 'Fluminense', points: 4980, seasonPoints: 1690, weekPoints: 410, wins: 126, move: -2, isUser: false },
    { name: 'Marcos Vinicius', club: 'Botafogo', points: 4560, seasonPoints: 1540, weekPoints: 380, wins: 114, move: 0, isUser: false },
    { name: 'Guilherme Rosa', club: 'Bahia', points: 4120, seasonPoints: 1410, weekPoints: 350, wins: 98, move: 1, isUser: false },
    { name: 'Renato Gaúcho', club: 'Fortaleza', points: 3750, seasonPoints: 1280, weekPoints: 320, wins: 87, move: -3, isUser: false },
    { name: 'Diego Ferreira', club: 'Athletico-PR', points: 3340, seasonPoints: 1150, weekPoints: 290, wins: 76, move: 2, isUser: false },
    { name: 'Marcelo Rossi', club: 'Criciúma', points: 2980, seasonPoints: 1020, weekPoints: 260, wins: 64, move: 0, isUser: false },
    { name: 'Vitor Hugo', club: 'Sport', points: 2610, seasonPoints: 910, weekPoints: 230, wins: 55, move: -1, isUser: false },
    { name: 'Alexandre Pires', club: 'Ceará', points: 2240, seasonPoints: 800, weekPoints: 200, wins: 48, move: 1, isUser: false },
    { name: 'Danilo Silva', club: 'Coritiba', points: 1920, seasonPoints: 710, weekPoints: 180, wins: 39, move: 0, isUser: false },
    { name: 'Rafael Barbosa', club: 'Goiás', points: 1650, seasonPoints: 620, weekPoints: 150, wins: 32, move: -2, isUser: false },
    { name: 'Caio Junqueira', club: 'América-MG', points: 1380, seasonPoints: 530, weekPoints: 130, wins: 27, move: 3, isUser: false },
    { name: 'Fábio Santos', club: 'Ponte Preta', points: 1120, seasonPoints: 440, weekPoints: 110, wins: 21, move: 0, isUser: false },
    { name: 'Murilo Becker', club: 'Vila Nova', points: 890, seasonPoints: 360, weekPoints: 90, wins: 16, move: 1, isUser: false },
    { name: 'Gustavo N.', club: 'Novorizontino', points: 680, seasonPoints: 280, weekPoints: 70, wins: 12, move: -1, isUser: false },
    { name: 'Lucas Santana', club: 'Mirassol', points: 490, seasonPoints: 210, weekPoints: 50, wins: 9, move: 0, isUser: false },
    { name: 'Arthur Diniz', club: 'Botafogo-SP', points: 340, seasonPoints: 150, weekPoints: 40, wins: 6, move: 2, isUser: false },
    { name: 'Henrique M.', club: 'Operário-PR', points: 210, seasonPoints: 90, weekPoints: 20, wins: 3, move: -1, isUser: false }
  ];

  const AFM_CoachRanking = {
    // 1. Resolve Selo de Prestígio baseado na pontuação
    getPrestigeTier(points) {
      const p = Math.max(0, Number(points) || 0);
      for(const tier of PRESTIGE_TIERS){
        if(p >= tier.minPoints) return tier;
      }
      return PRESTIGE_TIERS[PRESTIGE_TIERS.length - 1];
    },

    // 2. Resolve Premiação PIX do TOP 5
    getPixPrize(rank) {
      return PIX_PRIZES[Number(rank)] || null;
    },

    // 3. Gerenciamento de Chave PIX do Usuário (Local + Conta + Nuvem Supabase)
    getUserPixKey() {
      const user = (typeof window.getActiveAccount === 'function') ? window.getActiveAccount() : null;
      if(user?.username){
        try {
          const uPix = localStorage.getItem(`afm_pix_${user.username.toLowerCase()}`);
          if(uPix) return JSON.parse(uPix);
          if(user.pixKey) return user.pixKey;
        } catch(e) {}
      }
      try {
        const raw = localStorage.getItem(STORAGE_KEY_PIX);
        if(!raw) return null;
        return JSON.parse(raw);
      } catch(e) {
        return null;
      }
    },

    setUserPixKey(type, key) {
      if(!key) {
        localStorage.removeItem(STORAGE_KEY_PIX);
        const user = (typeof window.getActiveAccount === 'function') ? window.getActiveAccount() : null;
        if(user?.username){
          try {
            localStorage.removeItem(`afm_pix_${user.username.toLowerCase()}`);
            delete user.pixKey;
          } catch(e) {}
        }
        return null;
      }
      const data = {
        type: String(type || 'cpf').toLowerCase(),
        key: String(key).trim(),
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY_PIX, JSON.stringify(data));
      const user = (typeof window.getActiveAccount === 'function') ? window.getActiveAccount() : null;
      if(user?.username){
        try {
          localStorage.setItem(`afm_pix_${user.username.toLowerCase()}`, JSON.stringify(data));
          user.pixKey = data;
          if(typeof window.saveStoredAccounts === 'function' && typeof window.getStoredAccounts === 'function'){
            const accs = window.getStoredAccounts();
            const acc = accs.find(a => (a.username || '').toLowerCase() === user.username.toLowerCase());
            if(acc){
              acc.pixKey = data;
              window.saveStoredAccounts(accs);
            }
          }
          if(window.AFM_DB && typeof window.AFM_DB.saveUserPix === 'function'){
            window.AFM_DB.saveUserPix(user.username, data);
          }
        } catch(e) {}
      }
      return data;
    },

    // 4. Calcula Pontos Reais de Carreira do Jogador
    getUserCareerPoints(state) {
      if(!state) return 500;
      state.managerPersonal = state.managerPersonal || {};
      const mp = state.managerPersonal;
      const stats = state.managerCareer || {};
      const wins = Math.max(0, Number(stats.wins) || 0);
      const draws = Math.max(0, Number(stats.draws) || 0);
      const losses = Math.max(0, Number(stats.losses) || 0);
      let statsPoints = wins * 30 + draws * 10 + losses * 2;

      // Saves antigos podem não ter managerCareer completo, mas ainda guardam partidas.
      if (Array.isArray(state.history)) {
        const historyPoints = state.history.reduce((total, match) => {
          const isHome = match.h === state.club;
          const isAway = match.a === state.club;
          if (!isHome && !isAway) return total;
          const goalsFor = Number(isHome ? match.hg : match.ag) || 0;
          const goalsAgainst = Number(isHome ? match.ag : match.hg) || 0;
          return total + (goalsFor > goalsAgainst ? 30 : goalsFor === goalsAgainst ? 10 : 2);
        }, 0);
        statsPoints = Math.max(statsPoints, historyPoints);
      }

      const savedPoints = Math.max(0, Number(mp.careerPoints) || (Number(state.coachPrestige) || 0) * 35);
      mp.careerPoints = Math.max(savedPoints, statsPoints);
      state.coachPrestige = Math.max(5, Math.round(mp.careerPoints / 35));
      mp.prestigeScore = Math.min(99, Math.max(5, Number(mp.prestigeScore) || 5, state.coachPrestige));
      return mp.careerPoints;
    },

    syncCareerProgress(state) {
      return this.getUserCareerPoints(state);
    },

    // 5. Gera ou Atualiza o Leaderboard Completo
    getLeaderboard(boardType = 'semana', state = null) {
      let list = [];
      try {
        const raw = localStorage.getItem(STORAGE_KEY_RANKING);
        if(raw) list = JSON.parse(raw);
      } catch(e) {}

      if(!list || !Array.isArray(list) || list.length < 20){
        list = JSON.parse(JSON.stringify(BASE_COACHES));
      }

      // Sincroniza o usuário atual no ranking
      if(state && state.club){
        const userCoachName = (state.manager || (window.getActiveAccount && window.getActiveAccount()?.name) || 'Você').trim();
        const userPoints = this.getUserCareerPoints(state);
        const userWins = (state.history || []).filter(h => {
          const isH = (h.h === state.club);
          const isA = (h.a === state.club);
          return isH ? (h.hg > h.ag) : (h.ag > h.hg);
        }).length;

        // Calcula pontos da semana e melhor temporada
        const userSeasonPts = Math.round(userPoints * 0.42);
        const userWeekPts = Math.round((userPoints % 1500) + userWins * 25);

        // Remove entrada anterior do usuário se houver
        list = list.filter(c => !c.isUser && c.name.toLowerCase() !== userCoachName.toLowerCase());

        // Adiciona entrada oficial do usuário
        list.push({
          name: userCoachName,
          club: state.club,
          points: userPoints,
          seasonPoints: userSeasonPts,
          weekPoints: userWeekPts,
          wins: userWins,
          move: 2,
          isUser: true
        });
      }

      // Ordena de acordo com o quadro selecionado
      list.sort((a, b) => {
        if(boardType === 'temporada'){
          return (b.seasonPoints || Math.round(b.points * 0.4)) - (a.seasonPoints || Math.round(a.points * 0.4));
        }
        if(boardType === 'carreira'){
          return (b.points || 0) - (a.points || 0);
        }
        // Padrão: Semana
        return (b.weekPoints || Math.round(b.points * 0.12)) - (a.weekPoints || Math.round(a.points * 0.12));
      });

      // Atribui posições (ranks 1, 2, 3...)
      list.forEach((item, idx) => {
        item.rank = idx + 1;
        item.pixPrize = this.getPixPrize(item.rank);
      });

      try {
        localStorage.setItem(STORAGE_KEY_RANKING, JSON.stringify(list));
      } catch(e) {}

      return list;
    },

    // 6. Adiciona Pontos e Recompensa após Partida
    onMatchFinished(state, userRes) {
      if(!state || !userRes) return;
      state.managerPersonal = state.managerPersonal || {};
      let ptsGained = 0;

      const isUserHome = (userRes.h === state.club);
      const uGoals = isUserHome ? userRes.hg : userRes.ag;
      const oGoals = isUserHome ? userRes.ag : userRes.hg;

      if(uGoals > oGoals){
        ptsGained += 30; // Vitória base
        // Bônus se vencer clássico
        if(userRes.isDerby) ptsGained += 20;
        // Bônus de elenco modesto
        const teamOvr = (typeof window.overallSquad === 'function') ? window.overallSquad() : 70;
        if(teamOvr < 72) ptsGained += 15;
      } else if(uGoals === oGoals){
        ptsGained += 10; // Empate
      } else {
        ptsGained += 2; // Experiência de jogo
      }

      state.managerPersonal.careerPoints = (state.managerPersonal.careerPoints || 0) + ptsGained;
      state.coachPrestige = Math.round(state.managerPersonal.careerPoints / 35);
      state.managerPersonal.prestigeScore = Math.min(99, Math.max(
        5,
        Number(state.managerPersonal.prestigeScore) || 5,
        Number(state.coachPrestige) || 0
      ));

      // Sincroniza com o cache de ranking
      this.getLeaderboard('semana', state);
      return ptsGained;
    },

    // 7. Modal de Cadastro / Edição da Chave PIX (Em Breve)
    openPixKeyModal() {
      const currentPix = this.getUserPixKey();
      let modalEl = document.getElementById('pixKeyModalContainer');
      if(!modalEl){
        modalEl = document.createElement('div');
        modalEl.id = 'pixKeyModalContainer';
        document.body.appendChild(modalEl);
      }

      modalEl.innerHTML = `
        <div class="afm-modal-backdrop" style="position:fixed;inset:0;background:rgba(5,7,15,0.88);backdrop-filter:blur(10px);z-index:10010;display:flex;align-items:center;justify-content:center;padding:16px">
          <div class="afm-modal-card" style="background:#0d111d;border:1px solid #eab308;box-shadow:0 12px 40px rgba(0,0,0,0.85),0 0 25px rgba(234,179,8,0.25);border-radius:16px;width:100%;max-width:500px;padding:24px;color:#fff;position:relative">
            
            <button type="button" id="btnClosePixModal" style="position:absolute;top:16px;right:16px;background:none;border:none;color:#94a3b8;font-size:20px;cursor:pointer">✕</button>

            <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
              <div style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#eab308,#ca8a04);display:flex;align-items:center;justify-content:center;font-size:22px;box-shadow:0 0 15px rgba(234,179,8,0.4);flex-shrink:0">
                💠
              </div>
              <div>
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                  <h2 style="font-size:19px;font-weight:900;margin:0;letter-spacing:0.5px;color:#fff">Chave PIX da Premiação</h2>
                  <span style="font-size:10px;font-weight:900;background:linear-gradient(135deg,#eab308,#ca8a04);color:#000;padding:2px 8px;border-radius:20px;text-transform:uppercase;letter-spacing:0.8px">Em Breve</span>
                </div>
                <p style="font-size:12px;color:#facc15;font-weight:700;margin:2px 0 0">R$ 1.000,00 no PIX para o TOP 5 da Edição</p>
              </div>
            </div>

            <!-- Banner Informativo: Recurso Em Breve -->
            <div style="background:linear-gradient(135deg,rgba(234,179,8,0.14) 0%,rgba(147,51,234,0.12) 100%);border:1px solid rgba(234,179,8,0.35);border-radius:12px;padding:14px 16px;display:flex;align-items:flex-start;gap:12px;margin-bottom:16px">
              <div style="font-size:28px;flex-shrink:0;line-height:1">⏳</div>
              <div>
                <div style="font-size:13px;font-weight:900;color:#facc15;text-transform:uppercase;letter-spacing:0.5px">
                  Cadastro de Chave PIX Em Breve!
                </div>
                <div style="font-size:12px;color:#e2e8f0;line-height:1.45;margin-top:3px">
                  O módulo de cadastro de chave PIX e transferências automáticas aos <b>5 melhores técnicos</b> do ranking nacional está em fase final de homologação e será liberado nas próximas atualizações oficiais do AFM.
                </div>
                <div style="font-size:11px;color:#94a3b8;margin-top:6px">
                  🏆 <b>Fique tranquilo:</b> seus pontos, vitórias e classificação já estão sendo computados normalmente em tempo real!
                </div>
              </div>
            </div>

            <form id="afmPixKeyForm" style="display:flex;flex-direction:column;gap:14px">
              <div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                  <label style="font-size:11px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px">Tipo de Chave PIX</label>
                  <span style="font-size:10px;font-weight:800;color:#eab308;background:rgba(234,179,8,0.15);padding:1px 6px;border-radius:4px">🔒 Em Breve</span>
                </div>
                <select id="pixKeyType" disabled style="width:100%;background:#111827;border:1px solid rgba(255,255,255,0.1);color:#64748b;padding:10px 14px;border-radius:8px;font-size:13px;font-weight:700;cursor:not-allowed">
                  <option value="cpf" ${currentPix?.type==='cpf'?'selected':''}>CPF</option>
                  <option value="email" ${currentPix?.type==='email'?'selected':''}>E-mail</option>
                  <option value="phone" ${currentPix?.type==='phone'?'selected':''}>Telefone Celular</option>
                  <option value="random" ${currentPix?.type==='random'?'selected':''}>Chave Aleatória (EVP)</option>
                </select>
              </div>

              <div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                  <label style="font-size:11px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px">Chave PIX</label>
                  <span style="font-size:10px;font-weight:800;color:#eab308;background:rgba(234,179,8,0.15);padding:1px 6px;border-radius:4px">🔒 Bloqueado</span>
                </div>
                <input type="text" id="pixKeyValue" disabled value="${currentPix?.key ? window.esc(currentPix.key) : ''}" placeholder="Cadastro de chaves será liberado em breve..." style="width:100%;box-sizing:border-box;background:#111827;border:1px solid rgba(255,255,255,0.1);color:#94a3b8;padding:12px 14px;border-radius:8px;font-size:14px;font-weight:700;cursor:not-allowed">
              </div>

              <div style="background:rgba(234,179,8,0.08);border:1px solid rgba(234,179,8,0.25);border-radius:8px;padding:10px 12px;font-size:12px;color:#fef08a;line-height:1.4">
                🔒 <b>Pagamento 100% Seguro:</b> Quando liberado, seus dados serão protegidos para recebimento direto do prêmio de até R$ 450,00 no PIX.
              </div>

              <div style="display:flex;gap:10px;margin-top:6px">
                <button type="button" id="btnEntendidoPixModal" style="flex:1;background:linear-gradient(135deg,#eab308,#ca8a04);border:none;color:#000;font-weight:900;font-size:13px;padding:12px;border-radius:8px;cursor:pointer;box-shadow:0 4px 15px rgba(234,179,8,0.35);letter-spacing:0.5px;text-transform:uppercase">
                  ✓ Entendido (Em Breve)
                </button>
                <button type="button" id="btnCancelPixModal" style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);color:#fff;font-weight:700;font-size:13px;padding:12px 16px;border-radius:8px;cursor:pointer">
                  Fechar
                </button>
              </div>
            </form>
          </div>
        </div>
      `;

      // Eventos do modal
      const close = () => modalEl.remove();
      document.getElementById('btnClosePixModal').onclick = close;
      document.getElementById('btnCancelPixModal').onclick = close;
      const btnEntendido = document.getElementById('btnEntendidoPixModal');
      if(btnEntendido){
        btnEntendido.onclick = () => {
          close();
          if(window.toast) window.toast('⏳ O cadastro de chave PIX da premiação será liberado em breve!');
        };
      }

      document.getElementById('afmPixKeyForm').onsubmit = (e) => {
        e.preventDefault();
        close();
        if(window.toast) window.toast('⏳ O cadastro de chave PIX da premiação será liberado em breve!');
      };
    },

    // 8. Renderiza Banner Especial de Premiação PIX R$ 1.000
    renderPixPrizeBanner(userRank, isLanding = false) {
      const pixKey = this.getUserPixKey();
      const hasKey = Boolean(pixKey && pixKey.key);
      const isTop5 = Number(userRank) >= 1 && Number(userRank) <= 5;
      const prize = this.getPixPrize(userRank);

      return `
        <div class="afm-pix-banner" style="background:linear-gradient(135deg,rgba(11,7,22,0.95),rgba(20,11,40,0.95) 60%,rgba(6,78,59,0.9) 100%);border:1px solid #10b981;border-radius:16px;padding:20px 24px;margin-bottom:24px;box-shadow:0 8px 30px rgba(0,0,0,0.8),0 0 25px rgba(16,185,129,0.25);position:relative;overflow:hidden">
          <div style="position:absolute;top:-40px;right:-40px;width:180px;height:180px;background:radial-gradient(circle,rgba(16,185,129,0.25) 0%,transparent 70%);border-radius:50%;pointer-events:none"></div>
          
          <div style="display:flex;flex-direction:column;gap:14px;position:relative;z-index:2">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px">
              <div>
                <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(16,185,129,0.18);border:1px solid #10b981;padding:4px 10px;border-radius:9999px;font-size:11px;font-weight:900;color:#6ee7b7;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px">
                  💠 PREMIAÇÃO OFICIAL AFM 2027 · DINHEIRO REAL NO PIX
                </div>
                <h2 style="font-size:28px;font-weight:900;margin:0;letter-spacing:0.5px;color:#fff;text-transform:uppercase">
                  R$ 1.000,00 NO PIX PARA O TOP 5
                </h2>
                <p style="font-size:14px;color:#cbd5e1;margin:6px 0 0;max-width:760px;line-height:1.5">
                  Os 5 melhores técnicos do ranking ao término da edição dividem a premiação total via PIX direto na conta. Ganhe jogos, suba de divisão e conquiste títulos para garantir sua parte!
                </p>
              </div>

              ${isLanding ? `
                <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">
                  <button type="button" class="btn btn-neon-pix" id="btnLandingCtaGame" onclick="if(window.setupViewMode){window.setupViewMode='auth';if(typeof window.renderSetup==='function')window.renderSetup(document.querySelector('#app'));}" style="background:linear-gradient(135deg,#10b981,#059669);border:1px solid #34d399;color:#fff;font-weight:900;font-size:13px;padding:12px 22px;border-radius:10px;cursor:pointer;display:inline-flex;align-items:center;gap:8px;box-shadow:0 4px 16px rgba(16,185,129,0.4)">
                    🎮 ENTRAR NO JOGO & PARTICIPAR
                  </button>
                  <span style="font-size:11px;font-weight:700;color:#6ee7b7">
                    Classificação oficial dos melhores técnicos em tempo real (Sem necessidade de cadastro de dados)
                  </span>
                </div>
              ` : `
                <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px">
                  <button type="button" class="btn btn-neon-pix" id="btnOpenPixModalBanner" style="background:linear-gradient(135deg,#f59e0b,#d97706);border:1px solid #facc15;color:#000;font-weight:900;font-size:13px;padding:10px 18px;border-radius:10px;cursor:pointer;display:inline-flex;align-items:center;gap:8px;box-shadow:0 4px 16px rgba(245,158,11,0.35);transition:all 0.15s">
                    💠 CADASTRAR CHAVE PIX (EM BREVE)
                  </button>
                  <span style="font-size:11px;font-weight:700;color:#facc15">
                    ⏳ Cadastro de chaves PIX em breve nas próximas atualizações
                  </span>
                </div>
              `}
            </div>

            <!-- TABELA DAS 5 FAIXAS DE PREMIAÇÃO -->
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px;margin-top:4px">
              <div style="background:rgba(250,204,21,0.12);border:1px solid rgba(250,204,21,0.4);border-radius:10px;padding:10px;text-align:center">
                <div style="font-size:11px;font-weight:900;color:#facc15">🥇 1º LUGAR</div>
                <div style="font-size:18px;font-weight:900;color:#fff;margin:2px 0">R$ 450,00</div>
                <div style="font-size:10px;font-weight:700;color:#fef08a">Campeão Supremo</div>
              </div>
              <div style="background:rgba(226,232,240,0.1);border:1px solid rgba(226,232,240,0.3);border-radius:10px;padding:10px;text-align:center">
                <div style="font-size:11px;font-weight:900;color:#cbd5e1">🥈 2º LUGAR</div>
                <div style="font-size:18px;font-weight:900;color:#fff;margin:2px 0">R$ 250,00</div>
                <div style="font-size:10px;font-weight:700;color:#e2e8f0">Vice-Campeão</div>
              </div>
              <div style="background:rgba(217,119,6,0.12);border:1px solid rgba(217,119,6,0.35);border-radius:10px;padding:10px;text-align:center">
                <div style="font-size:11px;font-weight:900;color:#fbbf24">🥉 3º LUGAR</div>
                <div style="font-size:18px;font-weight:900;color:#fff;margin:2px 0">R$ 150,00</div>
                <div style="font-size:10px;font-weight:700;color:#fed7aa">3º no Pódio</div>
              </div>
              <div style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);border-radius:10px;padding:10px;text-align:center">
                <div style="font-size:11px;font-weight:900;color:#6ee7b7">🏅 4º LUGAR</div>
                <div style="font-size:18px;font-weight:900;color:#fff;margin:2px 0">R$ 100,00</div>
                <div style="font-size:10px;font-weight:700;color:#a7f3d0">Top 4 Premiado</div>
              </div>
              <div style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);border-radius:10px;padding:10px;text-align:center">
                <div style="font-size:11px;font-weight:900;color:#6ee7b7">🏅 5º LUGAR</div>
                <div style="font-size:18px;font-weight:900;color:#fff;margin:2px 0">R$ 50,00</div>
                <div style="font-size:10px;font-weight:700;color:#a7f3d0">Top 5 Premiado</div>
              </div>
            </div>

            ${(!isLanding && isTop5) ? `
              <div style="background:rgba(16,185,129,0.2);border:1px solid #10b981;border-radius:8px;padding:8px 14px;display:flex;align-items:center;gap:8px;font-size:13px;font-weight:900;color:#a7f3d0">
                🎉 <b>PARABÉNS!</b> Você está na <b>#${userRank}ª posição</b> e garantindo <b>${prize?.label} no PIX</b>! Mantenha a pontuação até o fechamento para receber!
              </div>
            ` : ''}
          </div>
        </div>
      `;
    },

    // 9. Renderiza Pódio TOP 3 em Destaque
    renderPodium(top3, boardType) {
      if(!top3 || top3.length < 3) return '';
      const [first, second, third] = [top3[0], top3[1], top3[2]];

      function cardHtml(item, rank, prizeStr, isCenter = false){
        const tier = AFM_CoachRanking.getPrestigeTier(boardType === 'temporada' ? item.seasonPoints : (boardType === 'carreira' ? item.points : item.weekPoints));
        const pts = (boardType === 'temporada' ? item.seasonPoints : (boardType === 'carreira' ? item.points : item.weekPoints)).toLocaleString('pt-BR');
        const badgeSize = isCenter ? 44 : 36;
        const avatarSize = isCenter ? 96 : 80;

        return `
          <article class="afm-podium-card ${isCenter ? 'center-champion' : ''}" style="background:#111827;border:${isCenter ? '2px solid #facc15' : '1px solid rgba(255,255,255,0.12)'};border-radius:18px;padding:${isCenter ? '28px 20px 24px' : '20px 16px'};position:relative;display:flex;flex-direction:column;align-items:center;text-align:center;box-shadow:${isCenter ? '0 12px 35px rgba(250,204,21,0.2), 0 0 20px rgba(0,0,0,0.8)' : '0 8px 24px rgba(0,0,0,0.6)'};${isCenter ? 'order:2' : rank===2 ? 'order:1' : 'order:3'};${item.isUser ? 'box-shadow: 0 0 25px rgba(56,189,248,0.5);' : ''}">
            
            <!-- BADGE NUMÉRICO DO RANKING -->
            <span style="position:absolute;top:-18px;left:50%;transform:translateX(-50%);width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:900;color:#fff;background:${rank===1 ? 'linear-gradient(135deg,#eab308,#ca8a04)' : rank===2 ? 'linear-gradient(135deg,#94a3b8,#64748b)' : 'linear-gradient(135deg,#d97706,#b45309)'};box-shadow:0 4px 12px rgba(0,0,0,0.6)">
              ${rank}
            </span>

            <!-- BADGE PREMIAÇÃO PIX DO TOP 3 -->
            <div style="display:inline-flex;align-items:center;gap:4px;background:rgba(16,185,129,0.18);border:1px solid #10b981;color:#6ee7b7;font-weight:900;font-size:11px;padding:3px 10px;border-radius:9999px;margin-bottom:12px;margin-top:6px;box-shadow:0 0 10px rgba(16,185,129,0.3)">
              💠 ${prizeStr}
            </div>

            <!-- AVATAR CIRCULAR COM ESCUDO DO CLUBE -->
            <div style="position:relative;width:${avatarSize}px;height:${avatarSize}px;margin-bottom:12px">
              <div style="width:100%;height:100%;border-radius:50%;background:radial-gradient(circle at 50% 35%,#1e293b,#0b0716 78%);border:2px solid ${rank===1 ? '#facc15' : 'rgba(255,255,255,0.2)'};display:flex;align-items:center;justify-content:center;font-size:${isCenter ? '42px' : '36px'};overflow:hidden">
                ${item.isUser && typeof state !== 'undefined' && state?.managerPhoto ? `<img src="${window.esc(state.managerPhoto)}" alt="Técnico" style="width:100%;height:100%;object-fit:cover">` : (item.isUser && typeof state !== 'undefined' && state?.managerAvatar ? window.esc(state.managerAvatar) : '👔')}
              </div>
              <span style="position:absolute;bottom:-4px;right:-4px;filter:drop-shadow(0 4px 6px rgba(0,0,0,0.6))">
                ${window.clubBadge ? window.clubBadge(item.club, badgeSize) : ''}
              </span>
            </div>

            ${rank === 1 ? `<span style="font-size:11px;font-weight:900;color:#facc15;text-transform:uppercase;letter-spacing:1px;display:flex;align-items:center;gap:4px;margin-bottom:2px">👑 LÍDER DO BRASIL</span>` : ''}

            <!-- NOME E CLUBE -->
            <h3 style="font-size:${isCenter ? '22px' : '18px'};font-weight:900;margin:0;letter-spacing:0.5px;color:#fff;line-height:1.2">
              ${window.esc(item.name)} ${item.isUser ? '<span style="background:#0284c7;color:#fff;font-size:10px;padding:1px 6px;border-radius:4px;margin-left:4px">VOCÊ</span>' : ''}
            </h3>
            <p style="font-size:13px;color:#94a3b8;font-weight:700;margin:3px 0 8px">
              ${window.esc(item.club)}
            </p>

            <!-- SELO DE PRESTÍGIO -->
            <div style="display:inline-flex;align-items:center;gap:6px;background:${tier.bg};border:1px solid ${tier.border};color:${tier.color};padding:3px 10px;border-radius:9999px;font-size:10px;font-weight:900;text-transform:uppercase;margin-bottom:10px">
              <span>${tier.icon}</span>
              <span>${tier.label}</span>
            </div>

            <div style="font-size:12px;color:#64748b;font-weight:700;margin-bottom:6px">
              ${item.wins} vitórias na carreira
            </div>

            <!-- PONTUAÇÃO GIGANTE -->
            <div style="font-size:${isCenter ? '36px' : '28px'};font-weight:900;color:#facc15;line-height:1;letter-spacing:0.5px">
              ${pts}
              <span style="display:block;font-size:10px;font-weight:800;color:#94a3b8;letter-spacing:1px;text-transform:uppercase;margin-top:2px">PONTOS</span>
            </div>
          </article>
        `;
      }

      return `
        <section class="afm-podium-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;align-items:end;margin-bottom:32px">
          ${cardHtml(second, 2, 'R$ 250,00 NO PIX', false)}
          ${cardHtml(first, 1, 'R$ 450,00 NO PIX', true)}
          ${cardHtml(third, 3, 'R$ 150,00 NO PIX', false)}
        </section>
      `;
    },

    // 10. Renderiza Tabela do 4º ao 30º Lugar
    renderTable(list, boardType) {
      if(!list || list.length <= 3) return '';
      const tableRows = list.slice(3, 30);

      return `
        <section class="afm-ranking-list-section" style="margin-bottom:32px">
          <div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:8px">
            <h2 style="font-size:20px;font-weight:900;color:#fff;margin:0;letter-spacing:0.5px">
              4º AO ${list.length}º LUGAR
            </h2>
            <span style="font-size:12px;font-weight:700;color:#94a3b8">
              ${list.length} técnicos ativos na disputa · 4º e 5º garantem prêmio no PIX
            </span>
          </div>

          <div style="background:#111827;border:1px solid rgba(255,255,255,0.08);border-radius:14px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.5)">
            <div style="display:flex;flex-direction:column;divide-y:divide-slate-800">
              ${tableRows.map(item => {
                const tier = AFM_CoachRanking.getPrestigeTier(boardType === 'temporada' ? item.seasonPoints : (boardType === 'carreira' ? item.points : item.weekPoints));
                const pts = (boardType === 'temporada' ? item.seasonPoints : (boardType === 'carreira' ? item.points : item.weekPoints)).toLocaleString('pt-BR');
                const isTop5 = (item.rank === 4 || item.rank === 5);
                const prize = AFM_CoachRanking.getPixPrize(item.rank);

                return `
                  <div class="afm-ranking-row ${item.isUser ? 'user-highlight' : ''}" style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.06);background:${item.isUser ? 'rgba(56,189,248,0.12)' : isTop5 ? 'rgba(16,185,129,0.06)' : 'transparent'};border-left:${item.isUser ? '4px solid #38bdf8' : isTop5 ? '4px solid #10b981' : '4px solid transparent'};transition:background 0.15s">
                    
                    <div style="display:flex;align-items:center;gap:14px;min-width:0">
                      <!-- NÚMERO DA POSIÇÃO -->
                      <div style="display:flex;flex-direction:column;align-items:center;width:34px;flex-shrink:0">
                        <span style="font-size:20px;font-weight:900;color:${isTop5 ? '#10b981' : '#94a3b8'};line-height:1">
                          ${item.rank}
                        </span>
                        <span style="font-size:9px;font-weight:800;color:${item.move > 0 ? '#4ade80' : item.move < 0 ? '#f87171' : '#64748b'};display:inline-flex;align-items:center;gap:1px;margin-top:2px">
                          ${item.move > 0 ? `▲ ${item.move}` : item.move < 0 ? `▼ ${Math.abs(item.move)}` : '▬'}
                        </span>
                      </div>

                      <!-- AVATAR DO TÉCNICO -->
                      <div style="width:42px;height:42px;border-radius:50%;background:#1e293b;border:1px solid rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;overflow:hidden">
                        ${item.isUser && typeof state !== 'undefined' && state?.managerPhoto ? `<img src="${window.esc(state.managerPhoto)}" alt="Técnico" style="width:100%;height:100%;object-fit:cover">` : (item.isUser && typeof state !== 'undefined' && state?.managerAvatar ? window.esc(state.managerAvatar) : '👔')}
                      </div>

                      <!-- NOME, SELO, CLUBE -->
                      <div style="min-width:0">
                        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                          <span style="font-size:15px;font-weight:900;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                            ${window.esc(item.name)}
                          </span>
                          ${item.isUser ? `<span style="background:#0284c7;color:#fff;font-size:10px;font-weight:900;padding:2px 6px;border-radius:4px">VOCÊ</span>` : ''}
                          ${isTop5 ? `<span style="background:rgba(16,185,129,0.2);border:1px solid #10b981;color:#6ee7b7;font-size:10px;font-weight:900;padding:2px 8px;border-radius:9999px">💠 ${prize?.badge}</span>` : ''}
                        </div>

                        <div style="display:flex;align-items:center;gap:8px;margin-top:3px;flex-wrap:wrap">
                          <span style="display:inline-flex;align-items:center;gap:4px;background:${tier.bg};border:1px solid ${tier.border};color:${tier.color};padding:1px 6px;border-radius:9999px;font-size:9px;font-weight:900;text-transform:uppercase">
                            ${tier.icon} ${tier.label}
                          </span>
                          <span style="display:inline-flex;align-items:center;gap:4px;font-size:12px;color:#cbd5e1;font-weight:700">
                            ${window.clubBadge ? window.clubBadge(item.club, 16) : ''}
                            ${window.esc(item.club)}
                          </span>
                          <span style="font-size:11px;color:#64748b;display:none" class="desktop-only">
                            · ${item.wins} vitórias
                          </span>
                        </div>
                      </div>
                    </div>

                    <!-- PONTUAÇÃO -->
                    <div style="text-align:right;flex-shrink:0;margin-left:12px">
                      <span style="font-size:22px;font-weight:900;color:${isTop5 ? '#facc15' : '#fff'};line-height:1">
                        ${pts}
                      </span>
                      <span style="display:block;font-size:9px;font-weight:800;color:#64748b;letter-spacing:1px;text-transform:uppercase">
                        PONTOS
                      </span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </section>
      `;
    },

    // 11. Renderiza Sidebar Lateral (Cards de Regras, Selos, Censo e Status)
    renderSidebar(state, userRank, userPoints, boardType, isLanding = false) {
      const pixKey = this.getUserPixKey();
      const userTier = this.getPrestigeTier(userPoints);

      return `
        <aside class="afm-ranking-sidebar" style="display:flex;flex-direction:column;gap:18px">
          
          ${!isLanding ? `
            <!-- CARD 1: SEU STATUS NO RANKING (IN-GAME) -->
            <section class="afm-sidebar-card" style="background:#111827;border:1px solid rgba(255,255,255,0.12);border-radius:14px;padding:18px">
              <h3 style="font-size:16px;font-weight:900;color:#fff;margin:0 0 12px;letter-spacing:0.5px;text-transform:uppercase">
                🎯 SEU DESEMPENHO
              </h3>
              
              <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:12px;margin-bottom:12px">
                <div>
                  <span style="font-size:11px;color:#94a3b8;font-weight:700;display:block">POSIÇÃO ATUAL</span>
                  <span style="font-size:26px;font-weight:900;color:#38bdf8">#${userRank || '-'}</span>
                </div>
                <div style="text-align:right">
                  <span style="font-size:11px;color:#94a3b8;font-weight:700;display:block">SEUS PONTOS</span>
                  <span style="font-size:26px;font-weight:900;color:#facc15">${userPoints.toLocaleString('pt-BR')}</span>
                </div>
              </div>

              <div>
                <span style="font-size:11px;color:#94a3b8;font-weight:700;display:block;margin-bottom:6px">SELO ATUAL</span>
                <div style="display:inline-flex;align-items:center;gap:6px;background:${userTier.bg};border:1px solid ${userTier.border};color:${userTier.color};padding:4px 12px;border-radius:9999px;font-size:11px;font-weight:900;text-transform:uppercase">
                  <span>${userTier.icon}</span>
                  <span>${userTier.label}</span>
                </div>
              </div>

              <div style="margin-top:14px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.08)">
                ${userRank <= 5 ? `
                  <div style="background:rgba(16,185,129,0.15);border:1px solid #10b981;border-radius:8px;padding:8px 10px;font-size:12px;font-weight:800;color:#a7f3d0">
                    🎉 <b>ZONA DE PREMIAÇÃO:</b> Você está garantindo <b>${AFM_CoachRanking.getPixPrize(userRank)?.label} no PIX</b>!
                  </div>
                ` : `
                  <div style="font-size:12px;color:#cbd5e1;line-height:1.4">
                    🚀 <b>Foco no TOP 5:</b> Jogue e vença para entrar na zona de premiação de até <b>R$ 450 no PIX</b>!
                  </div>
                `}
              </div>
            </section>
          ` : `
            <!-- CARD 1 LANDING: INFORMATIVO -->
            <section class="afm-sidebar-card" style="background:#111827;border:1px solid rgba(168,85,247,0.3);border-radius:14px;padding:18px">
              <h3 style="font-size:15px;font-weight:900;color:#d8b4fe;margin:0 0 8px;letter-spacing:0.5px;text-transform:uppercase">
                🏆 DISPUTA NACIONAL
              </h3>
              <p style="font-size:12px;color:#cbd5e1;line-height:1.5;margin:0 0 12px">
                Todos os treinadores ativos no AFM Manager concorrem automaticamente à premiação de R$ 1.000,00 no PIX semanal.
              </p>
              <button type="button" class="btn primary" onclick="window.setupViewMode='auth';if(typeof window.renderSetup==='function')window.renderSetup(document.querySelector('#app'));" style="width:100%;padding:10px;font-size:12px;font-weight:900;border-radius:8px;cursor:pointer">
                🎮 Entrar & Começar Carreira
              </button>
            </section>
          `}

          <!-- CARD 2: PREMIAÇÃO OFICIAL NO PIX (R$ 1.000,00) -->
          <section class="afm-sidebar-card" style="background:#111827;border:1px solid #10b981;border-radius:14px;padding:18px;box-shadow:0 0 15px rgba(16,185,129,0.15)">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
              <h3 style="font-size:15px;font-weight:900;color:#6ee7b7;margin:0;letter-spacing:0.5px;text-transform:uppercase">
                💠 PREMIAÇÃO NO PIX
              </h3>
              <span style="font-size:11px;font-weight:900;background:#10b981;color:#000;padding:2px 6px;border-radius:4px">R$ 1.000</span>
            </div>

            <p style="font-size:12px;color:#cbd5e1;line-height:1.4;margin:0 0 12px">
              Premiação distribuída integralmente aos 5 primeiros colocados ao fechar a semana/temporada:
            </p>

            <div style="display:flex;flex-direction:column;gap:6px;font-size:12px">
              <div style="display:flex;justify-content:space-between;padding:4px 8px;background:rgba(250,204,21,0.08);border-radius:6px">
                <span style="color:#facc15;font-weight:800">🥇 1º Lugar</span>
                <b style="color:#fff">R$ 450,00</b>
              </div>
              <div style="display:flex;justify-content:space-between;padding:4px 8px;background:rgba(226,232,240,0.08);border-radius:6px">
                <span style="color:#e2e8f0;font-weight:800">🥈 2º Lugar</span>
                <b style="color:#fff">R$ 250,00</b>
              </div>
              <div style="display:flex;justify-content:space-between;padding:4px 8px;background:rgba(217,119,6,0.08);border-radius:6px">
                <span style="color:#fbbf24;font-weight:800">🥉 3º Lugar</span>
                <b style="color:#fff">R$ 150,00</b>
              </div>
              <div style="display:flex;justify-content:space-between;padding:4px 8px;background:rgba(16,185,129,0.08);border-radius:6px">
                <span style="color:#a7f3d0;font-weight:800">🏅 4º Lugar</span>
                <b style="color:#fff">R$ 100,00</b>
              </div>
              <div style="display:flex;justify-content:space-between;padding:4px 8px;background:rgba(16,185,129,0.08);border-radius:6px">
                <span style="color:#a7f3d0;font-weight:800">🏅 5º Lugar</span>
                <b style="color:#fff">R$ 50,00</b>
              </div>
            </div>

            ${!isLanding ? `
              <button type="button" class="btn" id="btnSidebarManagePix" style="width:100%;background:rgba(234,179,8,0.15);border:1px solid #eab308;color:#facc15;font-weight:800;font-size:12px;padding:9px;border-radius:8px;margin-top:14px;cursor:pointer">
                💠 Chave PIX (Em Breve)
              </button>
            ` : `
              <button type="button" class="btn" id="btnSidebarManagePix" onclick="window.setupViewMode='auth';if(typeof window.renderSetup==='function')window.renderSetup(document.querySelector('#app'));" style="width:100%;background:rgba(16,185,129,0.15);border:1px solid #10b981;color:#6ee7b7;font-weight:800;font-size:12px;padding:9px;border-radius:8px;margin-top:14px;cursor:pointer">
                🎮 Entrar no Jogo & Disputar
              </button>
            `}
          </section>

          <!-- CARD 3: CENSO DE TÉCNICOS DO JOGO -->
          <section class="afm-sidebar-card" style="background:#111827;border:1px solid rgba(255,255,255,0.12);border-radius:14px;padding:18px">
            <h3 style="font-size:16px;font-weight:900;color:#fff;margin:0 0 6px;letter-spacing:0.5px;text-transform:uppercase">
              📊 CENSO DOS TÉCNICOS
            </h3>
            <p style="font-size:12px;color:#94a3b8;margin:0 0 14px">Situação dos comandantes nos últimos 7 dias</p>

            <div style="display:flex;align-items:baseline;gap:6px;margin-bottom:14px">
              <span style="font-size:32px;font-weight:900;color:#a3e635;line-height:1">6.258</span>
              <span style="font-size:12px;color:#cbd5e1;font-weight:700">técnicos em atividade</span>
            </div>

            <div style="display:flex;flex-direction:column;gap:10px;font-size:12px">
              <div>
                <div style="display:flex;justify-content:space-between;margin-bottom:3px">
                  <span style="color:#fff;font-weight:700">Estável (diretoria satisfeita)</span>
                  <span style="color:#4ade80;font-weight:800">5.742 (91,8%)</span>
                </div>
                <div style="height:5px;background:rgba(255,255,255,0.1);border-radius:9999px;overflow:hidden">
                  <div style="width:91.8%;height:100%;background:#4ade80"></div>
                </div>
              </div>

              <div>
                <div style="display:flex;justify-content:space-between;margin-bottom:3px">
                  <span style="color:#fff;font-weight:700">Pressionado (cobrança)</span>
                  <span style="color:#facc15;font-weight:800">405 (6,5%)</span>
                </div>
                <div style="height:5px;background:rgba(255,255,255,0.1);border-radius:9999px;overflow:hidden">
                  <div style="width:6.5%;height:100%;background:#facc15"></div>
                </div>
              </div>

              <div>
                <div style="display:flex;justify-content:space-between;margin-bottom:3px">
                  <span style="color:#fff;font-weight:700">Em Ultimato</span>
                  <span style="color:#f97316;font-weight:800">82 (1,3%)</span>
                </div>
                <div style="height:5px;background:rgba(255,255,255,0.1);border-radius:9999px;overflow:hidden">
                  <div style="width:1.3%;height:100%;background:#f97316"></div>
                </div>
              </div>

              <div>
                <div style="display:flex;justify-content:space-between;margin-bottom:3px">
                  <span style="color:#fff;font-weight:700">Balançando (demissão iminente)</span>
                  <span style="color:#ef4444;font-weight:800">29 (0,4%)</span>
                </div>
                <div style="height:5px;background:rgba(255,255,255,0.1);border-radius:9999px;overflow:hidden">
                  <div style="width:0.5%;height:100%;background:#ef4444"></div>
                </div>
              </div>
            </div>
            
            <p style="font-size:11px;color:#94a3b8;margin:12px 0 0;font-style:italic">
              13 técnicos foram demitidos pela diretoria nesta semana.
            </p>
          </section>

          <!-- CARD 4: COMO PONTUA -->
          <section class="afm-sidebar-card" style="background:#111827;border:1px solid rgba(255,255,255,0.12);border-radius:14px;padding:18px">
            <h3 style="font-size:16px;font-weight:900;color:#fff;margin:0 0 10px;letter-spacing:0.5px;text-transform:uppercase">
              ⭐ COMO PONTUA
            </h3>
            
            <div style="display:flex;flex-direction:column;gap:6px;font-size:12px">
              <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.06)">
                <span style="color:#cbd5e1">Vitória</span>
                <b style="color:#4ade80">+30 pontos</b>
              </div>
              <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.06)">
                <span style="color:#cbd5e1">Empate</span>
                <b style="color:#4ade80">+10 pontos</b>
              </div>
              <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.06)">
                <span style="color:#cbd5e1">Vitória em Clássico / Duelo</span>
                <b style="color:#facc15">+20 bônus</b>
              </div>
              <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.06)">
                <span style="color:#cbd5e1">Passar de fase no mata-mata</span>
                <b style="color:#facc15">+40 pontos</b>
              </div>
              <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.06)">
                <span style="color:#cbd5e1">Título Estadual / Nacional</span>
                <b style="color:#facc15">+100 a +400 pts</b>
              </div>
              <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.06)">
                <span style="color:#cbd5e1">Acesso de divisão</span>
                <b style="color:#facc15">+150 pontos</b>
              </div>
              <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.06)">
                <span style="color:#cbd5e1">Meta da diretoria cumprida</span>
                <b style="color:#facc15">+100 pontos</b>
              </div>
              <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.06)">
                <span style="color:#cbd5e1">Rebaixamento</span>
                <b style="color:#ef4444">-100 pontos</b>
              </div>
              <div style="display:flex;justify-content:space-between;padding:4px 0">
                <span style="color:#cbd5e1">Demissão</span>
                <b style="color:#ef4444">-150 pontos</b>
              </div>
            </div>
          </section>

          <!-- CARD 5: SELOS DE PRESTÍGIO -->
          <section class="afm-sidebar-card" style="background:#111827;border:1px solid rgba(255,255,255,0.12);border-radius:14px;padding:18px">
            <h3 style="font-size:16px;font-weight:900;color:#fff;margin:0 0 10px;letter-spacing:0.5px;text-transform:uppercase">
              👑 SELOS DE PRESTÍGIO
            </h3>

            <div style="display:flex;flex-direction:column;gap:8px">
              ${PRESTIGE_TIERS.map(tier => `
                <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 10px;background:rgba(255,255,255,0.04);border-radius:8px">
                  <span style="display:inline-flex;align-items:center;gap:6px;background:${tier.bg};border:1px solid ${tier.border};color:${tier.color};padding:2px 8px;border-radius:9999px;font-size:10px;font-weight:900;text-transform:uppercase">
                    ${tier.icon} ${tier.label}
                  </span>
                  <span style="font-size:11px;font-weight:700;color:#94a3b8">
                    ${tier.minPoints > 0 ? `a partir de ${tier.minPoints.toLocaleString('pt-BR')} pts` : 'do 1º jogo'}
                  </span>
                </div>
              `).join('')}
            </div>
          </section>
        </aside>
      `;
    },

    // 12. Renderiza a Tela do Ranking na PÁGINA INICIAL (Público & Como Funciona)
    renderLandingPage() {
      let activeBoard = 'semana';
      try {
        activeBoard = localStorage.getItem(STORAGE_KEY_BOARD) || 'semana';
      } catch(e) {}

      const list = this.getLeaderboard(activeBoard, null);

      return `
        <div class="afm-ranking-page" style="padding:16px 20px 40px;max-width:1440px;margin:0 auto;color:#fff">
          
          <!-- BREADCRUMB -->
          <nav style="display:flex;align-items:center;gap:8px;font-size:11px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px">
            <a href="javascript:void(0)" onclick="if(window.setupViewMode){window.setupViewMode='auth';if(typeof window.renderSetup==='function')window.renderSetup(document.querySelector('#app'));}else{window.view='central';if(typeof window.render==='function')window.render();}" style="color:#94a3b8;text-decoration:none">← Voltar para a Página Inicial</a>
            <span>&gt;</span>
            <span style="color:#facc15">Ranking de Técnicos & Como Funciona</span>
          </nav>

          <!-- CABEÇALHO PRINCIPAL -->
          <header style="display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:12px;margin-bottom:20px">
            <div>
              <p style="font-size:11px;font-weight:900;letter-spacing:2px;text-transform:uppercase;color:#a3e635;margin:0 0 4px">
                TODAS AS CARREIRAS DO JOGO · BRASIL
              </p>
              <h1 style="font-size:36px;font-weight:900;letter-spacing:0.5px;text-transform:uppercase;margin:0;line-height:1">
                RANKING DE TÉCNICOS & PREMIAÇÃO PIX
              </h1>
              <p style="font-size:14px;color:#cbd5e1;margin:8px 0 0;max-width:760px;line-height:1.4">
                Cada jogo do seu clube vale pontos de prestígio. Clube modesto em divisão mais forte rende mais: dispute o topo nacional e divida R$ 1.000,00 no PIX toda semana!
              </p>
            </div>
            <div style="font-size:12px;font-weight:800;color:#94a3b8">
              Atualizado em tempo real
            </div>
          </header>

          <!-- BANNER OFICIAL DE PREMIAÇÃO PIX R$ 1.000,00 (MODO LANDING) -->
          ${this.renderPixPrizeBanner(0, true)}

          <!-- SEÇÃO ESPECIAL: COMO FUNCIONA O RANKING & PREMIAÇÃO PIX -->
          <section class="afm-how-it-works-section" style="background:#0f172a;border:1px solid rgba(168,85,247,0.3);border-radius:16px;padding:22px 24px;margin-bottom:24px;box-shadow:0 8px 30px rgba(0,0,0,0.6)">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
              <span style="font-size:26px">📖</span>
              <div>
                <h2 style="font-size:20px;font-weight:900;margin:0;color:#fff;letter-spacing:0.5px;text-transform:uppercase">COMO FUNCIONA O RANKING & A PREMIAÇÃO PIX</h2>
                <p style="font-size:13px;color:#cbd5e1;margin:2px 0 0">Entenda as regras, como pontuar com seu clube e receber até R$ 450,00 direto no PIX</p>
              </div>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px">
              <div style="background:#161f30;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
                  <span style="width:28px;height:28px;border-radius:50%;background:#8b5cf6;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:14px">1</span>
                  <h3 style="font-size:15px;font-weight:900;color:#fff;margin:0">Crie sua Conta & Clube</h3>
                </div>
                <p style="font-size:12px;color:#94a3b8;line-height:1.5;margin:0">
                  Faça login ou crie sua conta gratuita no AFM Manager e assuma o comando de qualquer clube das Séries A, B, C, D ou dos 11 Estaduais.
                </p>
              </div>

              <div style="background:#161f30;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
                  <span style="width:28px;height:28px;border-radius:50%;background:#3b82f6;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:14px">2</span>
                  <h3 style="font-size:15px;font-weight:900;color:#fff;margin:0">Ganhe Jogos e Títulos</h3>
                </div>
                <p style="font-size:12px;color:#94a3b8;line-height:1.5;margin:0">
                  Cada vitória vale <b>+30 pts</b> (com bônus para clássicos e zebras). Empates valem <b>+10 pts</b> e títulos somam até <b>+400 pts</b> no ranking!
                </p>
              </div>

              <div style="background:#161f30;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
                  <span style="width:28px;height:28px;border-radius:50%;background:#10b981;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:14px">3</span>
                  <h3 style="font-size:15px;font-weight:900;color:#fff;margin:0">Cadastre a Chave no Jogo</h3>
                </div>
                <p style="font-size:12px;color:#94a3b8;line-height:1.5;margin:0">
                  Dentro do jogo, abra a nova <b>aba de Ranking</b> e cadastre sua chave PIX com 1 clique (CPF, Celular, E-mail ou chave aleatória).
                </p>
              </div>

              <div style="background:#161f30;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
                  <span style="width:28px;height:28px;border-radius:50%;background:#f59e0b;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:14px">4</span>
                  <h3 style="font-size:15px;font-weight:900;color:#fff;margin:0">PIX Toda Segunda-Feira</h3>
                </div>
                <p style="font-size:12px;color:#94a3b8;line-height:1.5;margin:0">
                  A edição fecha todo domingo às 23:59. Os <b>5 melhores técnicos</b> dividem R$ 1.000,00 no PIX pago pontualmente na segunda!
                </p>
              </div>
            </div>
          </section>

          <!-- QUADROS DO RANKING (FILTROS SEMANA, TEMPORADA, CARREIRA) -->
          <nav class="afm-ranking-tabs" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:24px">
            <button type="button" class="afm-tab-btn ${activeBoard==='semana'?'active':''}" data-board="semana" style="background:${activeBoard==='semana'?'#6d28d9':'#111827'};border:${activeBoard==='semana'?'2px solid #a855f7':'1px solid rgba(255,255,255,0.12)'};border-radius:12px;padding:12px 16px;text-align:left;cursor:pointer;color:#fff;box-shadow:${activeBoard==='semana'?'0 4px 15px rgba(109,40,217,0.4)':'none'}">
              <span style="font-size:16px;font-weight:900;text-transform:uppercase;display:block">Semana (Edição PIX)</span>
              <span style="font-size:11px;color:${activeBoard==='semana'?'#e9d5ff':'#94a3b8'};display:block;margin-top:2px">Pontos de seg a dom. Zera domingo 23:59!</span>
            </button>
            <button type="button" class="afm-tab-btn ${activeBoard==='temporada'?'active':''}" data-board="temporada" style="background:${activeBoard==='temporada'?'#6d28d9':'#111827'};border:${activeBoard==='temporada'?'2px solid #a855f7':'1px solid rgba(255,255,255,0.12)'};border-radius:12px;padding:12px 16px;text-align:left;cursor:pointer;color:#fff;box-shadow:${activeBoard==='temporada'?'0 4px 15px rgba(109,40,217,0.4)':'none'}">
              <span style="font-size:16px;font-weight:900;text-transform:uppercase;display:block">Melhor Temporada</span>
              <span style="font-size:11px;color:${activeBoard==='temporada'?'#e9d5ff':'#94a3b8'};display:block;margin-top:2px">A maior pontuação obtida em uma temporada completa.</span>
            </button>
            <button type="button" class="afm-tab-btn ${activeBoard==='carreira'?'active':''}" data-board="carreira" style="background:${activeBoard==='carreira'?'#6d28d9':'#111827'};border:${activeBoard==='carreira'?'2px solid #a855f7':'1px solid rgba(255,255,255,0.12)'};border-radius:12px;padding:12px 16px;text-align:left;cursor:pointer;color:#fff;box-shadow:${activeBoard==='carreira'?'0 4px 15px rgba(109,40,217,0.4)':'none'}">
              <span style="font-size:16px;font-weight:900;text-transform:uppercase;display:block">Carreira Geral</span>
              <span style="font-size:11px;color:${activeBoard==='carreira'?'#e9d5ff':'#94a3b8'};display:block;margin-top:2px">Todos os pontos somados desde o primeiro jogo.</span>
            </button>
          </nav>

          <p style="font-size:13px;font-weight:700;color:#a3e635;margin-bottom:20px;display:flex;align-items:center;gap:6px">
            ⏱️ Esta edição fecha no domingo às 23:59. Pagamento do PIX R$ 1.000 para o TOP 5 na segunda-feira!
          </p>

          <!-- CORPO PRINCIPAL -->
          <div style="display:grid;grid-template-columns:1fr;gap:24px" class="afm-ranking-layout">
            <div style="min-width:0">
              ${this.renderPodium(list.slice(0, 3), activeBoard)}
              ${this.renderTable(list, activeBoard)}
            </div>

            <!-- SIDEBAR LATERAL -->
            ${this.renderSidebar(null, 0, 0, activeBoard, true)}
          </div>
        </div>
      `;
    },

    // 12b. Renderiza a Aba do Ranking DENTRO DO JOGO (Com Sua Posição e Cadastro PIX)
    renderInGamePage() {
      const state = window.state || null;
      let activeBoard = 'semana';
      try {
        activeBoard = localStorage.getItem(STORAGE_KEY_BOARD) || 'semana';
      } catch(e) {}

      const list = this.getLeaderboard(activeBoard, state);
      const userItem = list.find(c => c.isUser);
      const userRank = userItem?.rank || 4;
      const userPoints = state ? this.getUserCareerPoints(state) : 1200;
      const userTier = this.getPrestigeTier(userPoints);
      const pixKey = this.getUserPixKey();
      const hasKey = Boolean(pixKey && pixKey.key);
      const prize = this.getPixPrize(userRank);
      const userWins = (state?.history || []).filter(h => {
        const isH = (h.h === state?.club);
        const isA = (h.a === state?.club);
        if(!isH && !isA) return false;
        return isH ? (h.hg > h.ag) : (h.ag > h.hg);
      }).length;

      // Distância de pontos para o Top 5
      const top5Cutoff = list[4] ? (activeBoard==='temporada' ? list[4].seasonPoints : activeBoard==='carreira' ? list[4].points : list[4].weekPoints) : 1500;
      const currentBoardPoints = activeBoard==='temporada' ? (userItem?.seasonPoints || 0) : activeBoard==='carreira' ? (userItem?.points || 0) : (userItem?.weekPoints || 0);
      const ptsToTop5 = Math.max(0, top5Cutoff - currentBoardPoints + 1);

      return `
        <div class="afm-ranking-page" style="padding:16px 20px 40px;max-width:1440px;margin:0 auto;color:#fff">
          
          <!-- BREADCRUMB IN-GAME -->
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:14px">
            <div style="font-size:12px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px">
              ⭐ Carreira de <b style="color:#fff">${window.esc(state?.manager || 'Treinador')}</b> · <b style="color:#a7ff3f">${window.esc(state?.club || 'Clube')}</b> (${window.esc(state?.competition || 'Nacional')}) &gt; <span style="color:#facc15">Ranking de Técnicos & PIX</span>
            </div>
            <button type="button" class="btn" onclick="window.view='central';if(typeof window.render==='function')window.render();" style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);color:#fff;padding:6px 14px;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer">
              ← Voltar para Central
            </button>
          </div>

          <!-- CARD HERO: SEU DESEMPENHO NO RANKING (SUA POSIÇÃO E PONTOS) -->
          <div class="afm-ingame-ranking-hero" style="background:linear-gradient(135deg,#130f26,#1e143b);border:1px solid #a855f7;border-radius:16px;padding:20px 24px;margin-bottom:20px;box-shadow:0 8px 30px rgba(0,0,0,0.7),0 0 20px rgba(168,85,247,0.2)">
            <div class="afm-ranking-hero-top" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px">
              <div class="afm-ranking-hero-identity" style="display:flex;align-items:center;gap:14px">
                <div class="afm-ranking-badge-wrap" style="filter:drop-shadow(0 4px 10px rgba(0,0,0,0.6))">
                  ${window.clubBadge ? window.clubBadge(state?.club || 'Clube', 56) : ''}
                </div>
                <div>
                  <div class="afm-ranking-tag" style="display:inline-flex;align-items:center;gap:6px;background:rgba(168,85,247,0.2);border:1px solid #a855f7;padding:3px 10px;border-radius:9999px;font-size:10px;font-weight:900;color:#d8b4fe;text-transform:uppercase;margin-bottom:4px">
                    👔 SEU DESEMPENHO OFICIAL NO RANKING
                  </div>
                  <h1 class="afm-ranking-user-title" style="font-size:24px;font-weight:900;margin:0;color:#fff;letter-spacing:0.5px">
                    ${window.esc(state?.manager || 'Você')} · <span style="color:#a7ff3f">${window.esc(state?.club || 'Seu Clube')}</span>
                  </h1>
                  <p class="afm-ranking-user-sub" style="font-size:12px;color:#cbd5e1;margin:4px 0 0">
                    Divisão Ativa: <b>${window.esc(state?.competition || 'Nacional')}</b> · <b>${userWins} vitórias</b> computadas na carreira
                  </p>
                </div>
              </div>

              <!-- BLOCOS DE ESTATÍSTICA DO USUÁRIO -->
              <div class="afm-ranking-stats-row" style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
                <div class="afm-ranking-stat-box" style="background:#090d16;border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:10px 18px;text-align:center">
                  <span class="afm-ranking-stat-lbl" style="font-size:10px;font-weight:800;color:#94a3b8;display:block;text-transform:uppercase;letter-spacing:0.5px">Sua Posição</span>
                  <span class="afm-ranking-stat-val" style="font-size:28px;font-weight:900;color:${userRank<=5 ? '#10b981' : '#38bdf8'};line-height:1">#${userRank}</span>
                </div>

                <div class="afm-ranking-stat-box" style="background:#090d16;border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:10px 18px;text-align:center">
                  <span class="afm-ranking-stat-lbl" style="font-size:10px;font-weight:800;color:#94a3b8;display:block;text-transform:uppercase;letter-spacing:0.5px">Seus Pontos</span>
                  <span class="afm-ranking-stat-val" style="font-size:28px;font-weight:900;color:#facc15;line-height:1">${userPoints.toLocaleString('pt-BR')}</span>
                </div>

                <div class="afm-ranking-stat-box" style="background:#090d16;border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:10px 18px;text-align:center">
                  <span class="afm-ranking-stat-lbl" style="font-size:10px;font-weight:800;color:#94a3b8;display:block;text-transform:uppercase;letter-spacing:0.5px">Selo Atual</span>
                  <div class="afm-ranking-tier-pill" style="display:inline-flex;align-items:center;gap:4px;background:${userTier.bg};border:1px solid ${userTier.border};color:${userTier.color};padding:3px 8px;border-radius:9999px;font-size:10px;font-weight:900;text-transform:uppercase;margin-top:2px">
                    ${userTier.icon} ${userTier.label}
                  </div>
                </div>

                <button type="button" class="btn btn-neon-pix afm-ranking-pix-btn" id="btnHeroOpenPixModal" style="background:linear-gradient(135deg,#f59e0b,#d97706);border:1px solid #facc15;color:#000;font-weight:900;font-size:12px;padding:12px 16px;border-radius:10px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;box-shadow:0 4px 15px rgba(245,158,11,0.35)">
                  💠 Cadastrar Chave PIX (Em Breve)
                </button>
              </div>
            </div>

            <!-- STATUS ZONA DE PREMIAÇÃO -->
            <div class="afm-ranking-hero-footer" style="margin-top:14px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.1)">
              ${userRank <= 5 ? `
                <div class="afm-ranking-status-alert alert-success" style="background:rgba(16,185,129,0.2);border:1px solid #10b981;border-radius:8px;padding:10px 14px;font-size:13px;font-weight:900;color:#a7f3d0;display:flex;align-items:center;gap:8px">
                  🎉 <b>PARABÉNS!</b> Você está na <b>#${userRank}ª posição</b> e garantindo <b>${prize?.label} no PIX</b>! Mantenha a pontuação até o fechamento domingo 23:59 para receber!
                </div>
              ` : `
                <div class="afm-ranking-status-alert alert-info" style="background:rgba(56,189,248,0.12);border:1px solid rgba(56,189,248,0.3);border-radius:8px;padding:10px 14px;font-size:13px;font-weight:700;color:#bae6fd;display:flex;align-items:center;gap:8px">
                  🚀 <b>Foco no TOP 5:</b> Faltam apenas <b>${ptsToTop5} pontos</b> para você entrar no TOP 5 e faturar até <b>R$ 450,00 no PIX</b>! Vença a próxima rodada!
                </div>
              `}
            </div>
          </div>

          <!-- BANNER OFICIAL DE PREMIAÇÃO PIX R$ 1.000,00 (MODO IN-GAME) -->
          ${this.renderPixPrizeBanner(userRank, false)}

          <!-- QUADROS DO RANKING (FILTROS SEMANA, TEMPORADA, CARREIRA) -->
          <nav class="afm-ranking-tabs" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:24px">
            <button type="button" class="afm-tab-btn ${activeBoard==='semana'?'active':''}" data-board="semana" style="background:${activeBoard==='semana'?'#6d28d9':'#111827'};border:${activeBoard==='semana'?'2px solid #a855f7':'1px solid rgba(255,255,255,0.12)'};border-radius:12px;padding:12px 16px;text-align:left;cursor:pointer;color:#fff;box-shadow:${activeBoard==='semana'?'0 4px 15px rgba(109,40,217,0.4)':'none'}">
              <span style="font-size:16px;font-weight:900;text-transform:uppercase;display:block">Semana (Edição PIX)</span>
              <span style="font-size:11px;color:${activeBoard==='semana'?'#e9d5ff':'#94a3b8'};display:block;margin-top:2px">Pontos de seg a dom. Zera domingo 23:59!</span>
            </button>
            <button type="button" class="afm-tab-btn ${activeBoard==='temporada'?'active':''}" data-board="temporada" style="background:${activeBoard==='temporada'?'#6d28d9':'#111827'};border:${activeBoard==='temporada'?'2px solid #a855f7':'1px solid rgba(255,255,255,0.12)'};border-radius:12px;padding:12px 16px;text-align:left;cursor:pointer;color:#fff;box-shadow:${activeBoard==='temporada'?'0 4px 15px rgba(109,40,217,0.4)':'none'}">
              <span style="font-size:16px;font-weight:900;text-transform:uppercase;display:block">Melhor Temporada</span>
              <span style="font-size:11px;color:${activeBoard==='temporada'?'#e9d5ff':'#94a3b8'};display:block;margin-top:2px">A maior pontuação obtida em uma temporada completa.</span>
            </button>
            <button type="button" class="afm-tab-btn ${activeBoard==='carreira'?'active':''}" data-board="carreira" style="background:${activeBoard==='carreira'?'#6d28d9':'#111827'};border:${activeBoard==='carreira'?'2px solid #a855f7':'1px solid rgba(255,255,255,0.12)'};border-radius:12px;padding:12px 16px;text-align:left;cursor:pointer;color:#fff;box-shadow:${activeBoard==='carreira'?'0 4px 15px rgba(109,40,217,0.4)':'none'}">
              <span style="font-size:16px;font-weight:900;text-transform:uppercase;display:block">Carreira Geral</span>
              <span style="font-size:11px;color:${activeBoard==='carreira'?'#e9d5ff':'#94a3b8'};display:block;margin-top:2px">Todos os pontos somados desde o primeiro jogo.</span>
            </button>
          </nav>

          <p style="font-size:13px;font-weight:700;color:#a3e635;margin-bottom:20px;display:flex;align-items:center;gap:6px">
            ⏱️ Esta edição fecha no domingo às 23:59. Pagamento do PIX R$ 1.000 para o TOP 5 na segunda-feira!
          </p>

          <!-- CORPO PRINCIPAL -->
          <div style="display:grid;grid-template-columns:1fr;gap:24px" class="afm-ranking-layout">
            <div style="min-width:0">
              ${this.renderPodium(list.slice(0, 3), activeBoard)}
              ${this.renderTable(list, activeBoard)}
            </div>

            <!-- SIDEBAR LATERAL -->
            ${this.renderSidebar(state, userRank, userPoints, activeBoard, false)}
          </div>
        </div>
      `;
    },

    // 12c. Resolvedor Universal da Página do Ranking
    renderPage(options = {}) {
      if(options.isLanding || window.setupViewMode === 'ranking'){
        return this.renderLandingPage();
      }
      return this.renderInGamePage();
    },

    // 13. Amarração de Eventos da Tela de Ranking
    bindRankingEvents() {
      // Botão para abrir modal PIX do banner
      const btnPixBanner = document.getElementById('btnOpenPixModalBanner');
      if(btnPixBanner) btnPixBanner.onclick = () => this.openPixKeyModal();

      // Botão para abrir modal PIX no Hero In-Game
      const btnHeroPix = document.getElementById('btnHeroOpenPixModal');
      if(btnHeroPix) btnHeroPix.onclick = () => this.openPixKeyModal();

      // Botão para gerenciar PIX na sidebar
      const btnSidebarPix = document.getElementById('btnSidebarManagePix');
      if(btnSidebarPix) {
        btnSidebarPix.onclick = () => {
          if(window.setupViewMode === 'ranking'){
            window.setupViewMode = 'auth';
            if(typeof window.renderSetup === 'function') window.renderSetup(document.querySelector('#app'));
          } else {
            this.openPixKeyModal();
          }
        };
      }

      // Botão CTA da landing page para entrar no jogo
      const btnLandingCta = document.getElementById('btnLandingCtaGame');
      if(btnLandingCta) {
        btnLandingCta.onclick = () => {
          window.setupViewMode = 'auth';
          if(typeof window.renderSetup === 'function') window.renderSetup(document.querySelector('#app'));
        };
      }

      // Alternância de abas do ranking (Semana, Temporada, Carreira)
      document.querySelectorAll('.afm-tab-btn[data-board]').forEach(btn => {
        btn.onclick = () => {
          const board = btn.dataset.board;
          localStorage.setItem(STORAGE_KEY_BOARD, board);
          if(window.setupViewMode === 'ranking' && typeof window.renderSetup === 'function'){
            window.renderSetup(document.querySelector('#app'));
          } else if(typeof window.render === 'function') {
            window.render();
          }
        };
      });
    }
  };

  // Exportação Global
  window.AFM_CoachRanking = AFM_CoachRanking;
  window.rankingPage = function(opts){
    return AFM_CoachRanking.renderPage(opts);
  };

})(typeof window !== 'undefined' ? window : globalThis);
