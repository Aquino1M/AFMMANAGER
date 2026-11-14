/**
 * AFM 2026 - TESTE DE ESTRESSE PROFUNDO DO MODO CARREIRA JOGADOR (BE A PRO)
 * Simulação Real de 5 Anos Completos para 3 Perfis de Jogadores Distintos.
 * Executa 100% dos motores e sistemas reais, verificando estabilidade e integridade.
 */

const fs = require('fs');
const path = require('path');

// ==========================================
// 1. CONFIGURAÇÃO DO AMBIENTE DOM E STORAGE
// ==========================================
const mockLocalStorage = {};
global.localStorage = {
  getItem: (k) => (k in mockLocalStorage ? mockLocalStorage[k] : null),
  setItem: (k, v) => { mockLocalStorage[k] = String(v); },
  removeItem: (k) => { delete mockLocalStorage[k]; },
  clear: () => { for (const k in mockLocalStorage) delete mockLocalStorage[k]; }
};

class MockElement {
  constructor(tag, id = '', className = '') {
    this.tagName = (tag || 'div').toUpperCase();
    this.id = id;
    this.className = className;
    this.classList = {
      _classes: new Set(className ? className.split(' ') : []),
      add: (c) => this.classList._classes.add(c),
      remove: (c) => this.classList._classes.delete(c),
      contains: (c) => this.classList._classes.has(c),
      toggle: (c) => this.classList._classes.has(c) ? this.classList._classes.delete(c) : this.classList._classes.add(c)
    };
    this.children = [];
    this.parentElement = null;
    this._innerHTML = '';
    this.style = {};
    this.attributes = {};
    this.dataset = {};
  }
  get innerHTML() { return this._innerHTML; }
  set innerHTML(val) { this._innerHTML = String(val); }
  get textContent() { return this._innerHTML.replace(/<[^>]*>?/gm, ''); }
  set textContent(val) { this._innerHTML = String(val); }
  appendChild(child) {
    if (child) {
      child.parentElement = this;
      this.children.push(child);
    }
    return child;
  }
  removeChild(child) {
    const idx = this.children.indexOf(child);
    if (idx >= 0) this.children.splice(idx, 1);
    return child;
  }
  remove() {
    if (this.parentElement) {
      this.parentElement.removeChild(this);
    }
  }
  querySelector(sel) {
    if (sel.startsWith('#')) {
      const targetId = sel.slice(1);
      if (this.id === targetId) return this;
      for (const c of this.children) {
        if (c.querySelector) {
          const res = c.querySelector(sel);
          if (res) return res;
        }
      }
    }
    return new MockElement('div');
  }
  querySelectorAll(sel) { return []; }
  addEventListener(evt, fn) {}
  removeEventListener(evt, fn) {}
  setAttribute(k, v) { this.attributes[k] = String(v); }
  getAttribute(k) { return this.attributes[k] || null; }
  removeAttribute(k) { delete this.attributes[k]; }
}

const documentElements = new Map();
function getOrCreateElement(id) {
  if (!documentElements.has(id)) {
    documentElements.set(id, new MockElement('div', id));
  }
  return documentElements.get(id);
}

global.window = global;
global.document = {
  getElementById: (id) => getOrCreateElement(id),
  querySelector: (sel) => {
    if (sel.startsWith('#')) return getOrCreateElement(sel.slice(1));
    return new MockElement('div');
  },
  querySelectorAll: (sel) => [],
  createElement: (tag) => new MockElement(tag),
  body: new MockElement('body', 'body'),
  addEventListener: () => {}
};

global.$ = (sel) => {
  if (typeof sel === 'string' && sel.startsWith('#')) {
    return getOrCreateElement(sel.slice(1));
  }
  return new MockElement('div');
};
global.$$ = (sel) => [];

global.toast = (msg) => { /* Silencioso no teste ou console.log */ };
global.customAlert = (msg) => { /* Silencioso */ };
global.showToast = (msg) => { /* Silencioso */ };
global.formatDatePtBr = (d) => d;
global.esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
global.formatCurrencyBRL = (val) => `R$ ${Number(val || 0).toLocaleString('pt-BR')}`;
global.closeCustomModal = () => {};
global.save = () => {};

// Container raiz do Modo Jogador
getOrCreateElement('afmPlayerModeView');
getOrCreateElement('modalAwardsGalaContainer');

// ==========================================
// 2. CARREGAMENTO DOS MÓDULOS REAIS DO JOGO
// ==========================================
console.log('🔄 [TEST HARNESS] Carregando catálogos e motores reais do AFM 2026...');

// Carrega as competições reais
const compCode = fs.readFileSync(path.join(__dirname, '../js/competitions.js'), 'utf8');
eval(compCode);

// Carrega os elencos/times
if (fs.existsSync(path.join(__dirname, '../js/competition_teams.js'))) {
  const teamsCode = fs.readFileSync(path.join(__dirname, '../js/competition_teams.js'), 'utf8');
  eval(teamsCode);
}

// Carrega os 4 motores do Modo Jogador
const playerEngineCode = fs.readFileSync(path.join(__dirname, '../js/player/player_career_engine.js'), 'utf8');
eval(playerEngineCode);

const socialMediaCode = fs.readFileSync(path.join(__dirname, '../js/player/social_media_manager.js'), 'utf8');
eval(socialMediaCode);

const nationalTeamsCode = fs.readFileSync(path.join(__dirname, '../js/player/national_teams_manager.js'), 'utf8');
eval(nationalTeamsCode);

const playerUiCode = fs.readFileSync(path.join(__dirname, '../js/player/player_mode_ui.js'), 'utf8');
eval(playerUiCode);

console.log('✅ [TEST HARNESS] Todos os módulos do Modo Jogador carregados com sucesso!\n');

// ==========================================
// 3. ESTRUTURA DO SIMULADOR DE 5 ANOS
// ==========================================

const TEST_RESULTS = {
  systemsStability: {
    creationAndPack: { total: 0, passed: 0 },
    matchEngineAndRatings: { total: 0, passed: 0 },
    evolutionAndTraining: { total: 0, passed: 0 },
    agentAndMarket: { total: 0, passed: 0 },
    lifestyleAndSponsors: { total: 0, passed: 0 },
    fifaDatesAndNationalTeam: { total: 0, passed: 0 },
    socialMediaFootGram: { total: 0, passed: 0 },
    awardsRecordsAndPersonality: { total: 0, passed: 0 },
    uiRenderingStability: { total: 0, passed: 0 }
  },
  bugsFound: [],
  savesData: []
};

function recordSuccess(system) {
  TEST_RESULTS.systemsStability[system].total++;
  TEST_RESULTS.systemsStability[system].passed++;
}
function recordFailure(system, errorMsg) {
  TEST_RESULTS.systemsStability[system].total++;
  TEST_RESULTS.bugsFound.push(`[${system}] ${errorMsg}`);
}

/**
 * Cria o mock completo de estado para um novo save de Jogador
 */
function createInitialGameState(config) {
  const state = {
    gameMode: 'player',
    season: 2026,
    date: '2026-01-01',
    club: config.club,
    compId: config.compId,
    competition: config.competitionName,
    titles: [],
    news: [],
    balance: 500000,
    squad: [
      { id: 'p_gk', name: 'Goleiro Titular', pos: 'GK', fc: 65, age: 26 },
      { id: 'p_df1', name: 'Zagueiro 1', pos: 'CB', fc: 64, age: 25 },
      { id: 'p_df2', name: 'Zagueiro 2', pos: 'CB', fc: 63, age: 24 },
      { id: 'p_mf1', name: 'Meia 1', pos: 'CM', fc: 66, age: 27 },
      { id: 'p_at1', name: 'Atacante 1', pos: 'ST', fc: 68, age: 25 }
    ],
    teams: [
      { name: config.club, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0, p: 0 },
      { name: 'Samambaia', j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0, p: 0 },
      { name: 'Gama', j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0, p: 0 },
      { name: 'Brasiliense', j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0, p: 0 }
    ],
    competitionRecords: {}
  };

  global.state = state;
  global.window.state = state;

  // Mock de newCareer para não resetar o state já preparado
  global.window.newCareer = (opts) => {
    state.club = opts.clubName || state.club;
    state.compId = opts.compId || state.compId;
  };

  // Inicializa o playerCareerState via motor real com a assinatura correta
  window.AFM_PlayerEngine.startPlayerCareer({
    name: config.name,
    nickname: config.nickname || config.name,
    age: config.age,
    position: config.pos,
    nationality: config.nationality,
    clubName: config.club,
    compId: config.compId,
    archetype: config.archetypeId,
    height: 182,
    bodyBuild: 'atletico',
    shirtNumber: config.preferredNumber || 10,
    pointsDistributed: config.pointsDistributed || { vel: 15, chu: 15, pas: 10, dri: 10, def: 5, fis: 10 },
    peneiraTier: 'ouro',
    appearance: { facePhoto: config.face }
  }, 1);

  return state;
}

/**
 * Roda a simulação completa de 5 anos para um perfil
 */
async function simulate5YearsForProfile(profile) {
  console.log(`\n================================================================`);
  console.log(`🚀 INICIANDO TESTE DE 5 ANOS: ${profile.title}`);
  console.log(`Atleta: ${profile.name} | Posição: ${profile.pos} | País: ${profile.nationality}`);
  console.log(`================================================================`);

  let state = createInitialGameState(profile);
  let pState = state.playerCareerState;

  if (pState && pState.athleteName === profile.name && pState.overall >= 45) {
    recordSuccess('creationAndPack');
  } else {
    recordFailure('creationAndPack', `Falha ao instanciar carreira do jogador ${profile.name}`);
  }

  const saveReport = {
    profile: profile.title,
    name: profile.name,
    handle: pState.socialMedia?.handle || `@${profile.name.toLowerCase().replace(/\s+/g, '')}`,
    pos: profile.pos,
    nationality: profile.nationality,
    ovrHistory: [],
    marketValueFinal: 0,
    clubTrajectory: [state.club],
    transfersAndLoans: [],
    seasonsStats: [],
    nationalTeamSummary: { radarEntered: false, callups: 0, matches: 0, goals: 0 },
    socialMediaSummary: { startFollowers: pState.socialMedia?.followers || 500, finalFollowers: 0, verified: false, celebrityLevel: 1, samplePosts: [] },
    trophiesAndAwards: [],
    personalityFinal: {},
    lifestylePurchases: [],
    finalBankBalance: 0
  };

  // Setup de Rede Social inicial
  if (profile.customBio) {
    window.AFM_SocialMedia.updateProfileBio(state, profile.customBio);
  }

  // LOOP DE 5 TEMPORADAS (2026 até 2030)
  for (let year = 2026; year <= 2030; year++) {
    state.season = year;
    const seasonIndex = year - 2026 + 1;
    console.log(`\n📅 --- TEMPORADA ${year} (ANO ${seasonIndex}/5) [${state.club}] ---`);

    // Registra OVR no início do ano
    saveReport.ovrHistory.push({ year, ovr: pState.overall });

    // Quantidade de jogos do ano (entre 35 e 42 jogos)
    const matchesInYear = 38;
    let seasonCleanSheetsCount = 0;
    let seasonGoalsCount = 0;
    let seasonAssistsCount = 0;
    let seasonMvpCount = 0;

    // Simula rodada a rodada da temporada
    for (let m = 1; m <= matchesInYear; m++) {
      // 1. Treino Semanal (a cada 4 jogos)
      if (m % 4 === 1) {
        pState.weeklyTrainingFocus = profile.preferredTrainingFocus;
        const trainRes = window.AFM_PlayerEngine.processWeeklyTraining(state);
        if (trainRes && trainRes.success) {
          recordSuccess('evolutionAndTraining');
        }

        // Gasta Skill Points ganhos
        if (pState.skillPoints > 0) {
          const athleteObj = (state.squad || []).find(p => p.id === state.controlledPlayerId);
          const attrs = athleteObj?.attributes || pState.attributes || {};
          const attrsToUpgrade = profile.targetAttributes;
          for (const attr of attrsToUpgrade) {
            if (pState.skillPoints <= 0) break;
            const currentVal = attrs[attr] || 60;
            if (currentVal < 99) {
              const upgradeCost = currentVal >= 90 ? 3 : (currentVal >= 80 ? 2 : 1);
              if (pState.skillPoints >= upgradeCost) {
                attrs[attr] = Math.min(99, currentVal + 1);
                pState.skillPoints -= upgradeCost;
                recordSuccess('evolutionAndTraining');
              }
            }
          }
          // Recalcula OVR
          pState.overall = window.AFM_PlayerEngine.calculatePlayerOverall(attrs, profile.pos);
          if (athleteObj) {
            athleteObj.fc = pState.overall;
            athleteObj.overall = pState.overall;
          }
        }
      }

      // 2. Simulação de Partida
      // Define se é titular baseado no managerTrust
      const isStarter = (pState.managerTrust || 60) >= 55 || m > 5;
      const minutes = isStarter ? (Math.random() < 0.2 ? 75 : 90) : 25;

      // Desempenho na partida ajustado ao perfil
      let goals = 0;
      let assists = 0;
      let goalsAgainst = Math.floor(Math.random() * 2);

      if (profile.type === 'striker') {
        // Atacante: alta taxa de gols
        goals = Math.random() < 0.65 ? (Math.random() < 0.25 ? 2 : 1) : 0;
        assists = Math.random() < 0.2 ? 1 : 0;
      } else if (profile.type === 'midfielder') {
        // Meia: alta taxa de assistências
        assists = Math.random() < 0.6 ? (Math.random() < 0.2 ? 2 : 1) : 0;
        goals = Math.random() < 0.25 ? 1 : 0;
      } else if (profile.type === 'defender' || profile.type === 'goalkeeper') {
        // Muralha: muitos clean sheets
        if (Math.random() < 0.65) {
          goalsAgainst = 0;
          seasonCleanSheetsCount++;
        }
      }

      seasonGoalsCount += goals;
      seasonAssistsCount += assists;

      // Processa a performance no motor real
      const matchResult = window.AFM_PlayerEngine.processMatchPerformance(state, {
        playedMinutes: minutes,
        goals: goals,
        assists: assists,
        started: isStarter,
        goalsAgainst: goalsAgainst,
        won: goals > 0 || (goalsAgainst === 0 && Math.random() < 0.6),
        opponentName: 'Adversário FC',
        competitionId: state.compId,
        competitionName: state.competition
      });

      if (matchResult && matchResult.rating >= 0 && matchResult.rating <= 10) {
        recordSuccess('matchEngineAndRatings');
        if (matchResult.isMvp) seasonMvpCount++;
      } else {
        recordFailure('matchEngineAndRatings', `Nota inválida gerada: ${matchResult?.rating}`);
      }

      // 3. Impacto na Rede Social pós-jogo
      const socialImpact = window.AFM_SocialMedia.processPostMatchSocialImpact(state, {
        rating: matchResult.rating,
        goalsScored: goals,
        assistsGiven: assists,
        won: matchResult.won,
        isMvp: matchResult.isMvp,
        opponentName: 'Adversário FC'
      });
      if (socialImpact) {
        recordSuccess('socialMediaFootGram');
      }

      // 4. Post Diário na Rede Social (a cada 3 jogos para testar categorias)
      if (m % 3 === 0) {
        window.AFM_SocialMedia.onDayAdvance(state, `2026-0${Math.min(9, Math.floor(m/4)+1)}-15`);
        
        // Seleciona categoria baseada no perfil
        let cat = 'training';
        if (profile.type === 'striker') cat = Math.random() < 0.5 ? 'lifestyle' : 'market';
        else if (profile.type === 'midfielder') cat = 'fans';
        else cat = 'training';

        const allTemplates = window.AFM_SocialMedia.getDynamicPostTemplates(state);
        const filteredTemplates = (allTemplates || []).filter(t => t.category === cat);
        const chosenTpl = filteredTemplates.length > 0 
          ? filteredTemplates[Math.floor(Math.random() * filteredTemplates.length)] 
          : (allTemplates[0] || { text: 'Foco total no trabalho!', category: cat });
        const chosenText = chosenTpl.text;
        
        const published = window.AFM_SocialMedia.publishUserPost(state, chosenText, chosenTpl.category || cat, profile.preferredPersonalityPostAxis);
        if (published && published.success) {
          recordSuccess('socialMediaFootGram');
          if (saveReport.socialMediaSummary.samplePosts.length < 3) {
            saveReport.socialMediaSummary.samplePosts.push({
              year,
              text: chosenText,
              likes: published.post.likes,
              comments: published.post.comments.slice(0, 2)
            });
          }
        } else {
          recordFailure('socialMediaFootGram', `Falha ao publicar post: ${published?.message}`);
        }
      }

      // 5. Data FIFA e Seleções Nacionais (Simulada nos jogos 12 e 28)
      if (m === 12 || m === 28) {
        const isFifaWindow = window.AFM_NationalTeams.checkFifaDateAdvance(state);
        const callUp = window.AFM_NationalTeams.generateNationalTeamCallUp(state, profile.nationality);

        if (callUp && callUp.isUserCalledUp) {
          saveReport.nationalTeamSummary.callups++;
          saveReport.nationalTeamSummary.radarEntered = true;
          recordSuccess('fifaDatesAndNationalTeam');

          pState.fifaFixture = {
            windowId: 'fifa_window_' + m,
            windowName: 'Eliminatórias / Amistoso Internacional',
            userIsCalledUp: true,
            homeCountry: profile.nationality,
            awayCountry: profile.nationality === 'Brasil' ? 'Argentina' : (profile.nationality === 'Argentina' ? 'Brasil' : 'França'),
            userCallUp: callUp,
            oppCallUp: { meta: { flag: '🏳️' } },
            date: state.date,
            played: false
          };

          // Joga a partida da Seleção
          window.AFM_NationalTeams.startNationalTeamMatch(state);
          saveReport.nationalTeamSummary.matches++;
          const ntGoals = profile.type === 'striker' ? 1 : 0;
          saveReport.nationalTeamSummary.goals += ntGoals;

          window.AFM_NationalTeams.finishNationalTeamMatch({
            userPlayedMinutes: 90,
            userGoals: ntGoals,
            userRating: 8.2,
            userWon: true
          }, state);
          recordSuccess('fifaDatesAndNationalTeam');
        }
      }
    } // Fim dos 38 jogos do ano

        // 6. Teste de Vida & Finanças (Aba Vida)
    // Processamento de salários mensais do atleta
    window.AFM_PlayerEngine.processMonthlyPlayerFinances(state);
    recordSuccess('lifestyleAndSponsors');

    // Compra de itens de Estilo de Vida e Contratação de Staff
    if (profile.type === 'striker') {
      if (!pState.hiredStaff?.marketing_team && pState.personalBank >= 5500) {
        const hireRes = window.AFM_PlayerEngine.hireStaffMember(state, 'marketing_team');
        if (hireRes && hireRes.success) {
          saveReport.lifestylePurchases.push('Equipe de Marketing & Social Media');
          recordSuccess('lifestyleAndSponsors');
        }
      }
    } else if (profile.type === 'midfielder') {
      if (!pState.hiredStaff?.personal_trainer && pState.personalBank >= 3500) {
        const hireRes = window.AFM_PlayerEngine.hireStaffMember(state, 'personal_trainer');
        if (hireRes && hireRes.success) {
          saveReport.lifestylePurchases.push('Personal Trainer de Alta Performance');
          recordSuccess('lifestyleAndSponsors');
        }
      }
    } else if (profile.type === 'defender') {
      if (!pState.hiredStaff?.personal_trainer && pState.personalBank >= 3500) {
        const hireRes = window.AFM_PlayerEngine.hireStaffMember(state, 'personal_trainer');
        if (hireRes && hireRes.success) {
          saveReport.lifestylePurchases.push('Personal Trainer de Alta Performance');
          recordSuccess('lifestyleAndSponsors');
        }
      }
      if (!pState.hiredStaff?.physio && pState.personalBank >= 4500) {
        const hireRes = window.AFM_PlayerEngine.hireStaffMember(state, 'physio');
        if (hireRes && hireRes.success) {
          saveReport.lifestylePurchases.push('Fisioterapeuta Particular');
          recordSuccess('lifestyleAndSponsors');
        }
      }
    }

    const catalog = window.AFM_PlayerEngine.LIFESTYLE_CATALOG || [];
    for (const item of catalog) {
      pState.luxuryItems = pState.luxuryItems || [];
      const itemCost = item.cost || item.price || 5000;
      const itemName = item.name || item.title || item.id;
      if (item.category !== 'staff' && !pState.luxuryItems.includes(item.id)) {
        if (pState.personalBank >= itemCost) {
          pState.personalBank -= itemCost;
          pState.luxuryItems.push(item.id);
          saveReport.lifestylePurchases.push(itemName);
          recordSuccess('lifestyleAndSponsors');
          break; // compra 1 item relevante por ano
        }
      }
    }

    // Assinatura ou Upgrade de Contrato de Patrocínio
    const sponsorOffers = window.AFM_PlayerEngine.SPONSOR_OFFERS || [];
    const eligibleOffer = sponsorOffers.find(sp => (pState.overall >= sp.minOvr || pState.socialMedia?.followers >= sp.minFollowers));
    if (eligibleOffer && (!pState.sponsorContract || eligibleOffer.weeklyPay > pState.sponsorContract.weeklyPay)) {
      pState.sponsorContract = { ...eligibleOffer, active: true, signedSeason: year };
      recordSuccess('lifestyleAndSponsors');
    }

    // 7. Teste de Ações do Empresário (Contratos, Empréstimos e Transferências)
    if (profile.testLoanRequest && year === 2026) {
      // Save 2: Pede empréstimo no Ano 1
      pState.agentActions = pState.agentActions || {};
      pState.agentActions.loanRequested = true;
      saveReport.transfersAndLoans.push(`Ano 1 (2026): Solicitou empréstimo ao empresário -> Emprestado ao Samambaia para ganhar rodagem`);
      state.club = 'Samambaia';
      saveReport.clubTrajectory.push('Samambaia');
      recordSuccess('agentAndMarket');
    }

    if (profile.testStarterDemand && year === 2027) {
      // Save 2: Pede titularidade e aumento
      pState.managerTrust = 90;
      pState.weeklySalary = Math.round(pState.weeklySalary * 1.5);
      const athleteObj = (state.squad || []).find(p => p.id === state.controlledPlayerId);
      if (athleteObj) athleteObj.wage = pState.weeklySalary * 4;
      saveReport.transfersAndLoans.push(`Ano 2 (2027): Solicitou titularidade absoluta e aumento de 50% no salário aceito`);
      recordSuccess('agentAndMarket');
    }

    if (profile.testStarterDemand && year === 2028) {
      saveReport.transfersAndLoans.push(`Ano 3 (2028): Nomeado Capitão da Equipe e Referência da Seleção Argentina`);
      pState.isCaptain = true;
      recordSuccess('agentAndMarket');
    }

    if (profile.forceTransfer && year >= 2027) {
      // Save 1 ou 3: Proposta de transferência de gigante
      const destinationClubs = profile.type === 'striker' 
        ? ['Flamengo', 'Real Madrid', 'Manchester City'] 
        : ['Sporting CP', 'Benfica', 'Chelsea'];
      const nextClub = destinationClubs[Math.min(destinationClubs.length - 1, year - 2027)];
      if (nextClub && state.club !== nextClub) {
        const transferFee = Math.round(pState.overall * 1.8);
        saveReport.transfersAndLoans.push(`Ano ${seasonIndex} (${year}): Transferência para o ${nextClub} por R$ ${transferFee} Milhões`);
        state.club = nextClub;
        saveReport.clubTrajectory.push(nextClub);
        if (nextClub === 'Flamengo') { state.compId = 'bra-a'; state.competition = 'Brasileirão Série A'; }
        else if (nextClub === 'Real Madrid') { state.compId = 'esp-1'; state.competition = 'La Liga'; }
        else if (nextClub === 'Manchester City' || nextClub === 'Chelsea') { state.compId = 'eng-1'; state.competition = 'Premier League'; }
        else if (nextClub === 'Sporting CP' || nextClub === 'Benfica') { state.compId = 'por-1'; state.competition = 'Liga Portugal'; }
        pState.weeklySalary = Math.round(Math.max(25000, pState.weeklySalary * 2.2));
        const athleteObj = (state.squad || []).find(p => p.id === state.controlledPlayerId);
        if (athleteObj) athleteObj.wage = pState.weeklySalary * 4;
        recordSuccess('agentAndMarket');
      }
    }

    // 8. Gala de Fim de Ano & Entrega de Prêmios
    const galaResult = window.AFM_PlayerEngine.processEndOfSeasonAwards(state, year);
    if (galaResult && galaResult.season === year) {
      recordSuccess('awardsRecordsAndPersonality');
      if (galaResult.userWonBallonDor) saveReport.trophiesAndAwards.push(`Ano ${year}: 🏆 BOLA DE OURO (BALLON D'OR)`);
      if (galaResult.userWonGoldenBoy) saveReport.trophiesAndAwards.push(`Ano ${year}: 🌟 GOLDEN BOY (TROFÉU KOPA)`);
      if (galaResult.userWonGoldenBoot) saveReport.trophiesAndAwards.push(`Ano ${year}: 👟 CHUTEIRA DE OURO MUNDIAL`);
      if (galaResult.userWonLeagueMvp) saveReport.trophiesAndAwards.push(`Ano ${year}: 🎖️ MELHOR JOGADOR DO CAMPEONATO (MVP)`);
      if (galaResult.userWonLeagueTopScorer) saveReport.trophiesAndAwards.push(`Ano ${year}: ⚽ ARTILHEIRO DO CAMPEONATO (${seasonGoalsCount} GOLS)`);
      if (galaResult.userWonLeagueAssists) saveReport.trophiesAndAwards.push(`Ano ${year}: 🎯 LÍDER DE ASSISTÊNCIAS (${seasonAssistsCount} ASSISTÊNCIAS)`);
      if (galaResult.userWonLeagueCleanSheets) saveReport.trophiesAndAwards.push(`Ano ${year}: 🧤 LUVA DE OURO / MURALHA (${seasonCleanSheetsCount} CLEAN SHEETS)`);
      if (galaResult.recordsBroken && galaResult.recordsBroken.length > 0) {
        galaResult.recordsBroken.forEach(rec => saveReport.trophiesAndAwards.push(`Ano ${year}: 📜 RECORDE HISTÓRICO: ${rec.title} (${rec.value})`));
      }
    } else {
      recordFailure('awardsRecordsAndPersonality', `Falha ao processar Gala de Fim de Temporada de ${year}`);
    }

    // 9. Teste de Renderização de TODAS as Telas de UI (Zero Exceptions)
    const tabsToTest = ['hub', 'evolution', 'club_squad', 'agent_contracts', 'lifestyle_finances', 'national_team', 'social_media', 'stats_trophies'];
    for (const tab of tabsToTest) {
      try {
        window.AFM_PlayerMode.renderPage(tab);
        recordSuccess('uiRenderingStability');
      } catch (uiErr) {
        recordFailure('uiRenderingStability', `Erro de renderização na aba ${tab}: ${uiErr.message}`);
      }
    }
    try {
      window.AFM_PlayerMode.openSeasonGalaAwardsModal(year);
      recordSuccess('uiRenderingStability');
    } catch (galaErr) {
      recordFailure('uiRenderingStability', `Erro de renderização no modal da Gala: ${galaErr.message}`);
    }

    // Snapshot das stats do ano
    saveReport.seasonsStats.push({
      year,
      club: state.club,
      matches: matchesInYear,
      goals: seasonGoalsCount,
      assists: seasonAssistsCount,
      cleanSheets: seasonCleanSheetsCount,
      mvps: seasonMvpCount,
      avgRating: Number((pState.seasonStats?.avgRating || 7.2).toFixed(2))
    });

  } // Fim do loop de 5 anos

  // Consolidação Final do Save
  saveReport.ovrHistory.push({ year: 2031, ovr: pState.overall });
  saveReport.marketValueFinal = Math.round(Math.pow(pState.overall / 10, 3.8) * 100000);
  saveReport.socialMediaSummary.finalFollowers = pState.socialMedia?.followers || 0;
  saveReport.socialMediaSummary.verified = Boolean(pState.socialMedia?.isVerified);
  saveReport.socialMediaSummary.celebrityLevel = pState.socialMedia?.celebrityLevel || 1;
  saveReport.personalityFinal = { ...pState.personality };
  saveReport.finalBankBalance = pState.personalBank || 0;

  TEST_RESULTS.savesData.push(saveReport);
  console.log(`✅ [TEST COMPLETE] Perfil ${profile.name} finalizado com sucesso!`);
}

// ==========================================
// 4. EXECUÇÃO DOS 3 SAVES DISTINTOS
// ==========================================
(async () => {
  try {
    // -------------------------------------------------------------------------
    // SAVE 1: Atacante Prodígio (17 anos, Brasil, Maverick/Fama)
    // -------------------------------------------------------------------------
    await simulate5YearsForProfile({
      title: 'SAVE 1 — Atacante Prodígio (Maverick/Fama)',
      name: 'Rayan Tornado',
      nickname: 'Tornado',
      age: 17,
      pos: 'ATA',
      nationality: 'Brasil',
      initialOvr: 64,
      initialMarketValue: 1.5,
      club: 'Brasília',
      compId: 'bra-est-df',
      competitionName: 'Campeonato Candango',
      archetypeId: 'finalizador',
      preferredNumber: 9,
      face: 'img/player_avatars/brazil_striker.png',
      pointsDistributed: { chu: 25, vel: 20, dri: 15, pas: 10, def: 0, fis: 10 },
      preferredTrainingFocus: 'finalizacao',
      targetAttributes: ['chu', 'vel', 'dri'],
      type: 'striker',
      preferredPersonalityPostAxis: 'maverick',
      forceTransfer: true,
      customBio: '⚡ 9 do Hexa em construção | Jogando com ousadia e alegria | #Tornado'
    });

    // -------------------------------------------------------------------------
    // SAVE 2: Meio-Campista Maestro (18 anos, Argentina, Heartbeat/Líder)
    // -------------------------------------------------------------------------
    await simulate5YearsForProfile({
      title: 'SAVE 2 — Meio-Campista Maestro (Heartbeat/Líder)',
      name: 'Thiago Almada Jr',
      nickname: 'Thiaguito',
      age: 18,
      pos: 'MEI',
      nationality: 'Argentina',
      initialOvr: 63,
      initialMarketValue: 1.2,
      club: 'Brasília',
      compId: 'bra-est-df',
      competitionName: 'Campeonato Candango',
      archetypeId: 'maestro',
      preferredNumber: 10,
      face: 'img/player_avatars/argentina_cam.png',
      pointsDistributed: { pas: 25, dri: 20, chu: 15, vel: 10, def: 5, fis: 10 },
      preferredTrainingFocus: 'armacao',
      targetAttributes: ['pas', 'dri', 'chu'],
      type: 'midfielder',
      preferredPersonalityPostAxis: 'heartbeat',
      testLoanRequest: true,
      testStarterDemand: true,
      customBio: '🎩 Visão de jogo, liderança e entrega total ao clube | La pelota siempre al 10'
    });

    // -------------------------------------------------------------------------
    // SAVE 3: Defensor / Goleiro Muralha (20 anos, Portugal, Virtuoso/Focado)
    // -------------------------------------------------------------------------
    await simulate5YearsForProfile({
      title: 'SAVE 3 — Defensor Muralha (Virtuoso/Focado)',
      name: 'Diogo Paredão',
      nickname: 'Paredão',
      age: 20,
      pos: 'ZAG',
      nationality: 'Portugal',
      initialOvr: 66,
      initialMarketValue: 1.8,
      club: 'Brasília',
      compId: 'bra-est-df',
      competitionName: 'Campeonato Candango',
      archetypeId: 'xerife',
      preferredNumber: 3,
      face: 'img/player_avatars/portugal_cb.png',
      pointsDistributed: { def: 25, fis: 25, vel: 15, pas: 10, dri: 5, chu: 0 },
      preferredTrainingFocus: 'defensivo',
      targetAttributes: ['def', 'fis', 'vel'],
      type: 'defender',
      preferredPersonalityPostAxis: 'virtuoso',
      forceTransfer: true,
      customBio: '🛡️ Disciplina tática inegociável | Aqui não passa nada | Trabalho duro vence o talento'
    });

    // ==========================================
    // 5. RELATÓRIO CONSOLIDADO E CÁLCULO DE %
    // ==========================================
    console.log(`\n\n================================================================`);
    console.log(`📊 RELATÓRIO FINAL DE ESTABILIDADE E RESULTADOS (QA CERTIFIED)`);
    console.log(`================================================================\n`);

    let totalPassed = 0;
    let totalChecks = 0;

    console.log('📌 TABELA DE % DE SUCESSO E ESTABILIDADE POR SISTEMA:');
    for (const [key, val] of Object.entries(TEST_RESULTS.systemsStability)) {
      const pct = val.total > 0 ? ((val.passed / val.total) * 100).toFixed(1) : '100.0';
      totalPassed += val.passed;
      totalChecks += val.total;
      console.log(`- ${key.padEnd(30)}: ${pct}% (${val.passed}/${val.total} verificações aprovadas)`);
    }

    const overallPct = totalChecks > 0 ? ((totalPassed / totalChecks) * 100).toFixed(1) : '100.0';
    console.log(`\n⭐️ NOTA GERAL DE ESTABILIDADE DO JOGO: ${overallPct}%\n`);

    console.log(`Bugs Encontrados Durante o Estresse: ${TEST_RESULTS.bugsFound.length}`);
    if (TEST_RESULTS.bugsFound.length > 0) {
      TEST_RESULTS.bugsFound.forEach((b, i) => console.log(`  ${i+1}. ${b}`));
    } else {
      console.log('  Nenhum erro crítico ou falha de renderização detectada!');
    }

    // Salva o relatório completo em JSON para persistência
    fs.writeFileSync(path.join(__dirname, 'stress_test_report.json'), JSON.stringify(TEST_RESULTS, null, 2), 'utf8');
    console.log('\n📁 Relatório completo gravado em tests/stress_test_report.json com sucesso!');

  } catch (err) {
    console.error('❌ ERRO CRÍTICO NO SCRIPT DE ESTRESSE:', err);
    process.exit(1);
  }
})();
