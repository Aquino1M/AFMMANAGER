// ==============================================================================
// AFM MANAGER 2027 — COTAS REALISTAS, DIVIDENDOS E SIMULADOR DE VIDA DO TREINADOR
// Arquivo: js/systems/manager_life_and_shares_pro.js
// BLOCO 02 — 100% ISOLADO NO SAVE DO USUÁRIO
// ==============================================================================

(function (window) {
  'use strict';

  function norm(str) {
    return String(str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  }

  function esc(str) {
    if (typeof window !== 'undefined' && typeof window.esc === 'function') return window.esc(str);
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function fmtMoney(value) {
    if (typeof window.fmtMoney === 'function') return window.fmtMoney(value);
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(Number(value) || 0);
  }

  const REAL_ESTATE_CATALOG = [
    { id: 'apt_studio', name: 'Apartamento Studio Executivo', cost: 280000, monthlyRent: 2400, appreciationRate: 0.08, prestige: 1, icon: '🏢' },
    { id: 'casa_condominio', name: 'Casa em Condomínio Fechado', cost: 850000, monthlyRent: 7500, appreciationRate: 0.12, prestige: 3, icon: '🏡' },
    { id: 'cobertura_duplex', name: 'Cobertura Duplex Panorâmica', cost: 2400000, monthlyRent: 21000, appreciationRate: 0.15, prestige: 6, icon: '🌆' },
    { id: 'mansao_lago', name: 'Mansão com Campo Particular & Heliponto', cost: 7800000, monthlyRent: 68000, appreciationRate: 0.18, prestige: 12, icon: '🏰' },
    { id: 'ilha_privada', name: 'Ilha Particular & Resort VIP', cost: 24000000, monthlyRent: 210000, appreciationRate: 0.22, prestige: 25, icon: '🏝️' }
  ];

  const LIFE_BUSINESS_CATALOG = [
    { id: 'barbearia_vip', name: 'Barbearia VIP de Atletas', cost: 180000, monthlyProfit: 9500, maintenance: 1500, bonusText: '+1 Moral dos Jovens', icon: '💈' },
    { id: 'escolinha_fut', name: 'Escolinha de Futebol Oficial', cost: 350000, monthlyProfit: 18500, maintenance: 2800, bonusText: 'Revela jovens talentos para a base', icon: '⚽' },
    { id: 'academia_fitness', name: 'Academia Fitness & CrossTraining', cost: 520000, monthlyProfit: 28000, maintenance: 4200, bonusText: '+2% Recuperação Física do Elenco', icon: '🏋️' },
    { id: 'loja_esportiva', name: 'Loja de Artigos Esportivos', cost: 750000, monthlyProfit: 41000, maintenance: 6000, bonusText: '+5% Venda de Camisas', icon: '🎽' },
    { id: 'clinica_fisio', name: 'Clínica de Fisioterapia Esportiva', cost: 1350000, monthlyProfit: 72000, maintenance: 10500, bonusText: '-15% Tempo de Lesão no Clube', icon: '🏥' },
    { id: 'restaurante_luxo', name: 'Restaurante & Steakhouse de Luxo', cost: 1800000, monthlyProfit: 96000, maintenance: 14000, bonusText: '+3% Humor do Elenco e Diretoria', icon: '🍽️' },
    { id: 'rede_hoteis', name: 'Rede de Hotéis Executivos', cost: 5500000, monthlyProfit: 290000, maintenance: 38000, bonusText: '+15 Prestígio Internacional', icon: '🏨' }
  ];

  const LUXURY_GARAGE_CATALOG = [
    { id: 'suv_blindado', name: 'SUV Blindado Executivo', cost: 420000, prestige: 2, bonusText: '+Segurança e Respeito Local', icon: '🚙' },
    { id: 'superesportivo', name: 'Superesportivo Europeu V12', cost: 3200000, prestige: 8, bonusText: '+Atração de Craques no Mercado', icon: '🏎️' },
    { id: 'jato_particular', name: 'Jato Executivo Particular', cost: 18500000, prestige: 20, bonusText: '-30% Desgaste em Viagens e Negociações Rápidas', icon: '✈️' }
  ];

  const SAF_CLUBS_DEFAULT = [
    { id: 'botafogo', name: 'Botafogo SAF', ticker: 'BOTA4', sharePrice: 34.50, prevPrice: 33.10, change: 4.2, dividendYield: 0.009, valuation: 1650000000, logo: '⭐' },
    { id: 'cruzeiro', name: 'Cruzeiro SAF', ticker: 'CRUZ4', sharePrice: 28.00, prevPrice: 27.40, change: 2.1, dividendYield: 0.008, valuation: 1400000000, logo: '🦊' },
    { id: 'bahia', name: 'Bahia SAF (CFG)', ticker: 'BAHI3', sharePrice: 31.20, prevPrice: 30.00, change: 3.8, dividendYield: 0.011, valuation: 1550000000, logo: '🔵' },
    { id: 'vasco', name: 'Vasco SAF', ticker: 'VASC4', sharePrice: 22.50, prevPrice: 22.80, change: -1.2, dividendYield: 0.007, valuation: 1100000000, logo: '💢' },
    { id: 'atletico-mg', name: 'Atlético-MG SAF', ticker: 'CAM3', sharePrice: 42.00, prevPrice: 41.40, change: 1.5, dividendYield: 0.010, valuation: 1950000000, logo: '🐓' },
    { id: 'fortaleza', name: 'Fortaleza SAF', ticker: 'FORT4', sharePrice: 26.00, prevPrice: 24.80, change: 5.0, dividendYield: 0.012, valuation: 950000000, logo: '🦁' },
    { id: 'cuiaba', name: 'Cuiabá SAF', ticker: 'CUIA3', sharePrice: 16.80, prevPrice: 16.90, change: -0.5, dividendYield: 0.006, valuation: 480000000, logo: '🔰' },
    { id: 'bragantino', name: 'Red Bull Bragantino', ticker: 'RBB3', sharePrice: 38.00, prevPrice: 37.00, change: 2.7, dividendYield: 0.013, valuation: 1750000000, logo: '🐂' },
    { id: 'coritiba', name: 'Coritiba SAF', ticker: 'CTBA4', sharePrice: 19.50, prevPrice: 19.30, change: 1.0, dividendYield: 0.007, valuation: 620000000, logo: '🟢' },
    { id: 'america-mg', name: 'América-MG SAF', ticker: 'AMER3', sharePrice: 18.20, prevPrice: 18.35, change: -0.8, dividendYield: 0.007, valuation: 540000000, logo: '🐰' }
  ];

  const MARKET_MAGNATES = [
    { id: 'pif_arabia', name: 'Fundo Soberano PIF Árabe', entity: 'Public Investment Fund', netWorth: 120000000000, avatar: '🇸🇦', desc: 'Maior fundo soberano esportivo do planeta' },
    { id: 'sheikh_mansour', name: 'Sheikh Mansour', entity: 'City Football Group (CFG)', netWorth: 85000000000, avatar: '👑', desc: 'Controlador do Bahia SAF e Manchester City' },
    { id: 'jorge_paulo_lemann', name: 'Jorge Paulo Lemann', entity: '3G Capital & Investimentos', netWorth: 74000000000, avatar: '💼', desc: 'Bilionário brasileiro investidor institucional' },
    { id: 'rubens_menin', name: 'Rubens Menin', entity: 'Galo Holding & MRV', netWorth: 8500000000, avatar: '🏗️', desc: 'Sócio majoritário do Atlético-MG SAF' },
    { id: 'john_textor', name: 'John Textor', entity: 'Eagle Football Holdings', netWorth: 5200000000, avatar: '🦅', desc: 'Proprietário do Botafogo SAF e Lyon' },
    { id: 'ronaldo_nazario', name: 'Ronaldo Fenômeno', entity: 'Tara Sports', netWorth: 2400000000, avatar: '⚽', desc: 'Investidor e gestor pioneiro da Lei da SAF' }
  ];

  const AI_MAGNATES = MARKET_MAGNATES; // Compatibilidade legada

  const ManagerLifeAndSharesPro = {
    realEstate: REAL_ESTATE_CATALOG,
    businesses: LIFE_BUSINESS_CATALOG,
    garage: LUXURY_GARAGE_CATALOG,
    aiMagnates: MARKET_MAGNATES,
    activeTab: 'trainer',
    selectedSafModel: '50plus1',

    getInitialMarketTrades() {
      return [
        { id: 'tr_1', type: 'BUY', investor: 'Fundo Soberano PIF', club: 'Botafogo SAF', ticker: 'BOTA4', shares: 35000, price: 34.50, total: 1207500, time: 'Hoje no Pregão' },
        { id: 'tr_2', type: 'SELL', investor: '777 Partners', club: 'Vasco SAF', ticker: 'VASC4', shares: 14000, price: 22.40, total: 313600, time: 'Hoje no Pregão' },
        { id: 'tr_3', type: 'BUY', investor: 'Sheikh Mansour (CFG)', club: 'Bahia SAF (CFG)', ticker: 'BAHI3', shares: 42000, price: 31.20, total: 1310400, time: 'Ontem' },
        { id: 'tr_4', type: 'BUY', investor: 'Rubens Menin', club: 'Atlético-MG SAF', ticker: 'CAM3', shares: 20000, price: 42.00, total: 840000, time: 'Ontem' },
        { id: 'tr_5', type: 'BUY', investor: 'Ronaldo Fenômeno', club: 'Cruzeiro SAF', ticker: 'CRUZ4', shares: 18000, price: 28.10, total: 505800, time: '2 dias atrás' },
        { id: 'tr_6', type: 'SELL', investor: 'XP Private Equity', club: 'Coritiba SAF', ticker: 'CTBA4', shares: 8500, price: 19.50, total: 165750, time: '3 dias atrás' }
      ];
    },

    getInitialCorporateNews() {
      return [
        { id: 'cn_1', tag: 'TRANSIÇÃO SAF', club: 'Santos FC', headline: 'Conselho Deliberativo aprova autorização para conversão em SAF com aporte previsto de até R$ 750 milhões.', date: 'Recente' },
        { id: 'cn_2', tag: 'ASSOCIAÇÃO CIVIL', club: 'Vasco da Gama', headline: 'Liminar na Justiça devolve controle temporário do futebol à Diretoria da Associação Civil após impasse societário.', date: 'Recente' },
        { id: 'cn_3', tag: 'TRANSIÇÃO SAF', club: 'Paraná Clube', headline: 'Assembleia Geral de Credores homologa plano de venda da SAF e garante novo fôlego ao futebol.', date: '3 dias atrás' },
        { id: 'cn_4', tag: 'ASSOCIAÇÃO CIVIL', club: 'Portuguesa de Desportos', headline: 'Sócios e conselheiros votam rejeição a grupo estrangeiro e reafirmam modelo de Associação Civil sem fins lucrativos.', date: '1 semana atrás' },
        { id: 'cn_5', tag: 'EXPANSÃO SAF', club: 'América-MG SAF', headline: 'Diretoria conclui venda de 30% das cotas para investidores com cláusula de proteção patrimonial.', date: '1 semana atrás' },
        { id: 'cn_6', tag: 'ASSOCIAÇÃO CIVIL', club: 'Santa Cruz', headline: 'Conselho Deliberativo mantém comitê de transição enquanto analisa propostas para modelo SAF ou reestruturação civil.', date: '2 semanas atrás' }
      ];
    },

    isClubSaf(state, clubName) {
      const targetClub = clubName || state?.club || '';
      if (!targetClub) return false;
      const targetNorm = typeof norm === 'function' ? norm(targetClub) : String(targetClub).toLowerCase().trim();

      if (typeof window !== 'undefined' && window.AFMCareerFix && typeof window.AFMCareerFix.isClubSaf === 'function') {
        return window.AFMCareerFix.isClubSaf(state, targetClub);
      }

      // Se for o clube do treinador no save ativo e houver flag explicita
      if (state && state.club && (typeof norm === 'function' ? norm(state.club) : String(state.club).toLowerCase().trim()) === targetNorm) {
        if (state.clubIsSaf === true) return true;
        if (state.clubIsSaf === false) return false;
      }

      // Verificacao por sigla SAF ou termo explicito
      if (/\bsaf\b/i.test(targetClub)) return true;

      // Lista canonica de clubes brasileiros que ja sao SAF constituida
      const KNOWN_SAFS = [
        'botafogo', 'cruzeiro', 'bahia', 'vasco', 'atletico-mg', 'atletico mineiro',
        'fortaleza', 'cuiaba', 'red bull bragantino', 'bragantino', 'coritiba',
        'america-mg', 'america mineiro', 'londrina', 'maringa', 'athletic club'
      ];
      return KNOWN_SAFS.some(n => targetNorm.includes(typeof norm === 'function' ? norm(n) : n));
    },

    ensureState(state) {
      if (!state) return;
      if (window.AFM_NormalizeBankLoans) window.AFM_NormalizeBankLoans(state);
      const isUserClubSaf = this.isClubSaf(state);
      const initialCashCandidate = Number.isFinite(Number(state.career?.cash))
        ? Number(state.career.cash)
        : (Number.isFinite(Number(state.career?.personalCash))
          ? Number(state.career.personalCash)
          : (Number.isFinite(Number(state.managerMoney)) ? Number(state.managerMoney) : 120000));
      state.managerPersonal = state.managerPersonal || {
        name: state.managerName || state.manager || 'Aquino',
        personalBalance: Math.max(0, initialCashCandidate),
        salary: 18000,
        clubSharesPct: state.managerPersonal?.clubShares || 0,
        externalShareholdersPct: isUserClubSaf ? 22 : 0,
        properties: [],
        businesses: [],
        vehicles: [],
        prestigeScore: 5,
        lastDividendPaidByClub: 0,
        lastDividendReceivedByManager: 0,
        safPortfolio: {}
      };
      const mp = state.managerPersonal;
      if (!mp.balanceMigrationV1) {
        const savedPersonalBalance = Number(mp.personalBalance);
        const legacyPersonalBalance = Number(state.managerMoney);
        if ((!Number.isFinite(savedPersonalBalance) || savedPersonalBalance === 0) && legacyPersonalBalance > 0) {
          mp.personalBalance = legacyPersonalBalance;
        }
        mp.balanceMigrationV1 = true;
      }
      // Older saves may already have V1 marked while still carrying the real
      // cash only in managerMoney. Recover that zero balance once on V2.
      if (!mp.balanceMigrationV2) {
        const savedPersonalBalance = Number(mp.personalBalance);
        const legacyPersonalBalance = Number(state.managerMoney);
        if ((!Number.isFinite(savedPersonalBalance) || savedPersonalBalance === 0) && legacyPersonalBalance > 0) {
          mp.personalBalance = legacyPersonalBalance;
        }
        mp.balanceMigrationV2 = true;
      }
      mp.personalBalance = Math.max(0, Number(mp.personalBalance) || 0);
      state.managerMoney = mp.personalBalance;
      const prestige = Math.max(5, Number(mp.prestigeScore) || 5, Number(state.coachPrestige) || 0);
      mp.prestigeScore = Math.min(99, prestige);
      if (typeof state.managerPersonal.clubSharesPct !== 'number') {
        state.managerPersonal.clubSharesPct = Number(state.managerPersonal.clubShares || 0);
      }
      if (!Array.isArray(state.managerPersonal.properties)) state.managerPersonal.properties = [];
      if (!Array.isArray(state.managerPersonal.businesses)) state.managerPersonal.businesses = [];
      if (!Array.isArray(state.managerPersonal.vehicles)) state.managerPersonal.vehicles = [];
      if (!state.managerPersonal.safPortfolio || typeof state.managerPersonal.safPortfolio !== 'object') {
        state.managerPersonal.safPortfolio = {};
      }
      if (typeof state.managerPersonal.externalShareholdersPct !== 'number') {
        state.managerPersonal.externalShareholdersPct = isUserClubSaf ? 22 : 0;
      } else if (!isUserClubSaf) {
        state.managerPersonal.externalShareholdersPct = 0;
      }
      state.financeLog = Array.isArray(state.financeLog) ? state.financeLog : [];
      state.safP2POffers = Array.isArray(state.safP2POffers) ? state.safP2POffers : [];

      if (typeof window.syncCoachSalaryWithLicenses === 'function') {
        window.syncCoachSalaryWithLicenses(state);
      } else {
        const salary = Math.max(0, Number(state.managerSalary) || Number(state.managerPersonal.salary) || 18000);
        state.managerSalary = salary;
        state.managerPersonal.salary = salary;
      }
      if (window.AFM_CoachRanking?.syncCareerProgress) {
        window.AFM_CoachRanking.syncCareerProgress(state);
      }

      if (!Array.isArray(state.safMarketTrades) || state.safMarketTrades.length === 0) {
        state.safMarketTrades = this.getInitialMarketTrades();
      }
      if (!Array.isArray(state.safCorporateNews) || state.safCorporateNews.length === 0) {
        state.safCorporateNews = this.getInitialCorporateNews();
      }
      if (state.career && typeof state.career === 'object') {
        if (typeof state.career.cash === 'number' && !Number.isNaN(state.career.cash) && mp.personalBalance === state.career.cash) {
          state.career.personalCash = state.career.cash;
        }
        if (state.career.safPortfolio && typeof state.career.safPortfolio === 'object' && Object.keys(mp.safPortfolio).length === 0 && Object.keys(state.career.safPortfolio).length > 0) {
          Object.assign(mp.safPortfolio, state.career.safPortfolio);
        }
      }
    },

    // Mantém caixa pessoal e carteira SAF 100% sincronizados entre managerPersonal e state.career
    syncCareerWallet(state, newCash) {
      if (!state) return 0;
      const mp = state.managerPersonal || (state.managerPersonal = {});
      const cash = Math.max(0, Math.round(Number(newCash !== undefined ? newCash : mp.personalBalance) || 0));
      mp.personalBalance = cash;
      state.managerMoney = cash;
      if (state.career && typeof state.career === 'object') {
        state.career.cash = cash;
        state.career.personalCash = cash;
        state.career.safPortfolio = JSON.parse(JSON.stringify(mp.safPortfolio || {}));
      }
      if (typeof this.getSafMarketList === 'function') {
        state.safMarket = this.getSafMarketList(state);
      }
      if (typeof window !== 'undefined' && window.AFMCareerFix && typeof window.AFMCareerFix.calculateCareerEconomy === 'function') {
        window.AFMCareerFix.calculateCareerEconomy(state);
      }
      return cash;
    },

    payMonthlyCoachSalary(state) {
      if (!state) return { paid: 0, salary: 0, monthKey: null };
      this.ensureState(state);
      const mp = state.managerPersonal;
      if (typeof window.syncCoachSalaryWithLicenses === 'function') {
        window.syncCoachSalaryWithLicenses(state);
      }
      const salary = Math.max(0, Math.round(Number(state.managerSalary) || Number(mp.salary) || 18000));
      state.managerSalary = salary;
      mp.salary = salary;

      const date = String(state.date || state.currentDate || '');
      const monthKey = /^\d{4}-\d{2}/.test(date)
        ? date.slice(0, 7)
        : `${Number(state.season) || 2026}-${String(Math.max(1, Math.ceil((Number(state.round) || 1) / 4))).padStart(2, '0')}`;
      if (mp.lastSalaryPaidMonth === monthKey) {
        state.managerMoney = Number(mp.personalBalance) || 0;
        return { paid: 0, salary, monthKey };
      }

      mp.personalBalance = (Number(mp.personalBalance) || 0) + salary;
      mp.lastSalaryPaidMonth = monthKey;
      state.managerMoney = mp.personalBalance;
      this.syncCareerWallet(state, mp.personalBalance);
      state.balance = (Number(state.balance) || 0) - salary;
      state.clubBalance = state.balance;
      state.managerFinanceHistory = Array.isArray(state.managerFinanceHistory) ? state.managerFinanceHistory : [];
      state.managerFinanceHistory.unshift({
        date: state.date || state.currentDate || 'Dia 1º',
        desc: `Salário mensal de técnico (${state.club || 'clube'})`,
        amount: salary
      });
      return { paid: salary, salary, monthKey };
    },

    recordSeasonCareerSnapshot(state, season) {
      if (!state) return null;
      this.ensureState(state);
      const year = Number(season) || Number(state.season);
      if (!year) return null;
      state.managerCareerHistory = Array.isArray(state.managerCareerHistory) ? state.managerCareerHistory : [];
      const existing = state.managerCareerHistory.find(item => Number(item.season) === year);
      if (existing) return existing;
      const salaryEntries = (state.managerFinanceHistory || []).filter(item => {
        const entryYear = String(item.date || '').match(/(?:^|\D)(\d{4})(?:\D|$)/)?.[1];
        return Number(entryYear) === year && /salário mensal de técnico/i.test(String(item.desc || ''));
      });
      const mp = state.managerPersonal;
      const snapshot = {
        season: year,
        club: state.club || '',
        salaryReceived: salaryEntries.reduce((total, item) => total + Math.max(0, Number(item.amount) || 0), 0),
        salaryMonths: salaryEntries.length,
        prestigeScore: Math.min(99, Math.max(5, Number(mp.prestigeScore) || Number(state.coachPrestige) || 5)),
        careerPoints: Math.max(0, Number(mp.careerPoints) || 0),
        savedAt: new Date().toISOString()
      };
      state.managerCareerHistory.unshift(snapshot);
      state.managerCareerHistory = state.managerCareerHistory.slice(0, 30);
      return snapshot;
    },

    getLicenseTitle(prestige) {
      if (prestige >= 60) return 'Licença UEFA PRO (Mundial)';
      if (prestige >= 45) return 'Licença PRO CBF';
      if (prestige >= 30) return 'Licença A CBF';
      if (prestige >= 15) return 'Licença B CBF';
      if (prestige >= 8) return 'Licença C CBF';
      return 'Licença CBF D (Iniciante)';
    },

    getSafMarketList(state) {
      this.ensureState(state);
      state.safMarketClubs = Array.isArray(state.safMarketClubs) && state.safMarketClubs.length > 0
        ? state.safMarketClubs
        : SAF_CLUBS_DEFAULT.map(c => ({ ...c }));

      const userClub = state.club || 'Meu Clube';
      const isUserClubSaf = this.isClubSaf(state, userClub);

      if (isUserClubSaf) {
        const userClubId = norm(userClub).replace(/\s+/g, '-');
        const existing = state.safMarketClubs.find(c => c.id === userClubId || norm(c.name).includes(norm(userClub)));
        if (!existing) {
          const { totalValuation } = this.getClubValuationAndSharePrice(state);
          const sharePrice = Number((totalValuation / 50000000).toFixed(2));
          state.safMarketClubs.unshift({
            id: userClubId,
            name: userClub.toUpperCase().includes('SAF') ? userClub : `${userClub} SAF`,
            ticker: (userClub.slice(0, 4).toUpperCase().replace(/[^A-Z]/g, 'C') + '3'),
            sharePrice: Math.max(15, sharePrice),
            prevPrice: Math.max(14, sharePrice * 0.98),
            change: 2.0,
            dividendYield: 0.010,
            valuation: totalValuation,
            logo: '🛡️',
            isUserClub: true
          });
        }
      }

      return state.safMarketClubs;
    },

    buySafShares(state, clubId, count = 100) {
      this.ensureState(state);
      const mp = state.managerPersonal;
      const safList = this.getSafMarketList(state);
      const club = safList.find(c => c.id === clubId);
      if (!club) return { ok: false, message: 'Clube SAF não encontrado na Bolsa.' };

      const totalCost = Math.round(club.sharePrice * count);
      if ((mp.personalBalance || 0) < totalCost) {
        return { ok: false, message: `Saldo pessoal insuficiente! Necessário: R$ ${totalCost.toLocaleString('pt-BR')}.` };
      }

      mp.personalBalance -= totalCost;
      mp.safPortfolio = mp.safPortfolio || {};
      mp.safPortfolio[clubId] = mp.safPortfolio[clubId] || { sharesCount: 0, avgPrice: club.sharePrice };
      const currentCount = mp.safPortfolio[clubId].sharesCount;
      const currentAvg = mp.safPortfolio[clubId].avgPrice || club.sharePrice;
      mp.safPortfolio[clubId].sharesCount += count;
      mp.safPortfolio[clubId].avgPrice = Number(((currentCount * currentAvg + totalCost) / mp.safPortfolio[clubId].sharesCount).toFixed(2));

      // Registra transação no livro de negociações do mercado
      state.safMarketTrades = state.safMarketTrades || [];
      state.safMarketTrades.unshift({
        id: 'tr_' + Date.now(),
        type: 'BUY',
        investor: `Téc. ${mp.name || 'Você'}`,
        club: club.name,
        ticker: club.ticker,
        shares: count,
        price: club.sharePrice,
        total: totalCost,
        time: `Rodada ${state.round || 1}`
      });
      if (state.safMarketTrades.length > 20) state.safMarketTrades.length = 20;
      this.syncCareerWallet(state, mp.personalBalance);

      return {
        ok: true,
        message: `🎉 Você comprou ${count.toLocaleString('pt-BR')} ações de ${club.name} (${club.ticker}) por R$ ${totalCost.toLocaleString('pt-BR')}!`
      };
    },

    sellSafShares(state, clubId, count = 100) {
      this.ensureState(state);
      const mp = state.managerPersonal;
      mp.safPortfolio = mp.safPortfolio || {};
      const holding = mp.safPortfolio[clubId];
      if (!holding || holding.sharesCount < count) {
        return { ok: false, message: 'Você não possui esta quantidade de ações para vender.' };
      }

      const safList = this.getSafMarketList(state);
      const club = safList.find(c => c.id === clubId);
      const sharePrice = club ? club.sharePrice : holding.avgPrice;
      const payout = Math.round(sharePrice * count * 0.98); // 2% taxa de corretagem

      holding.sharesCount -= count;
      if (holding.sharesCount <= 0) delete mp.safPortfolio[clubId];
      mp.personalBalance += payout;

      // Registra transação no livro de negociações do mercado
      state.safMarketTrades = state.safMarketTrades || [];
      state.safMarketTrades.unshift({
        id: 'tr_' + Date.now(),
        type: 'SELL',
        investor: `Téc. ${mp.name || 'Você'}`,
        club: club ? club.name : clubId,
        ticker: club ? club.ticker : 'SAF',
        shares: count,
        price: sharePrice,
        total: payout,
        time: `Rodada ${state.round || 1}`
      });
      if (state.safMarketTrades.length > 20) state.safMarketTrades.length = 20;
      this.syncCareerWallet(state, mp.personalBalance);

      return {
        ok: true,
        message: `💰 Você vendeu ${count.toLocaleString('pt-BR')} ações de ${club ? club.name : clubId} e recebeu R$ ${payout.toLocaleString('pt-BR')} líquido na sua conta!`
      };
    },

    // Modal interativo de confirmação de Compra / Venda de Ações SAF com valor calculado em tempo real
    openTradeModal(state, actionType, clubId, defaultCount = 100) {
      this.ensureState(state);
      const mp = state.managerPersonal;
      const safList = this.getSafMarketList(state);
      const saf = safList.find(c => c.id === clubId);
      if (!saf) {
        if (window.toast) window.toast('Clube SAF não encontrado na Bolsa.');
        return;
      }

      const existing = document.getElementById('afm-saf-trade-modal-overlay');
      if (existing) existing.remove();

      const userHolding = (mp.safPortfolio && mp.safPortfolio[clubId]) ? mp.safPortfolio[clubId].sharesCount || 0 : 0;
      const isBuy = actionType === 'buy';

      const overlay = document.createElement('div');
      overlay.id = 'afm-saf-trade-modal-overlay';
      overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(2,6,23,0.88);backdrop-filter:blur(6px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;';

      const initialCount = isBuy ? (defaultCount || 100) : Math.min(defaultCount || 100, userHolding || 100);

      overlay.innerHTML = `
        <div style="background:#0f172a;border:1px solid ${isBuy ? '#10b981' : '#ef4444'};border-radius:18px;max-width:540px;width:100%;padding:22px 24px;box-shadow:0 25px 60px rgba(0,0,0,0.8);color:#fff;display:flex;flex-direction:column;gap:16px;position:relative;animation:fadeIn 0.2s ease;">
          
          <!-- CABEÇALHO DO MODAL -->
          <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:12px;">
            <div>
              <div style="display:flex;align-items:center;gap:8px;">
                <span class="pill" style="background:${isBuy ? '#065f46' : '#7f1d1d'};color:${isBuy ? '#6ee7b7' : '#fca5a5'};font-weight:900;font-size:12px;text-transform:uppercase;padding:4px 10px;border-radius:6px;border:1px solid ${isBuy ? '#10b981' : '#ef4444'};">
                  ${isBuy ? '🛒 CONFIRMAR COMPRA DE AÇÕES' : '💰 CONFIRMAR VENDA DE AÇÕES'}
                </span>
                <span style="font-size:11px;color:#94a3b8;">Bolsa de Valores SAF (B3)</span>
              </div>
              <h3 style="margin:6px 0 2px 0;font-size:19px;font-weight:900;display:flex;align-items:center;gap:8px;">
                <span>${saf.logo || '🛡️'}</span> ${esc(saf.name)} <span style="color:#38bdf8;font-size:15px;">(${esc(saf.ticker)})</span>
              </h3>
            </div>
            <button id="btnSafModalClose" type="button" style="background:transparent;border:none;color:#94a3b8;font-size:22px;cursor:pointer;padding:4px 8px;border-radius:6px;" title="Fechar">✕</button>
          </div>

          <!-- DADOS DA COTAÇÃO -->
          <div style="background:#1e293b;border-radius:12px;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;border:1px solid rgba(255,255,255,0.06);">
            <div>
              <div style="font-size:10px;color:#94a3b8;text-transform:uppercase;font-weight:700;">Cotação Atual</div>
              <div style="font-size:20px;font-weight:900;color:#fff;">R$ ${saf.sharePrice.toFixed(2)}</div>
            </div>
            <div>
              <div style="font-size:10px;color:#94a3b8;text-transform:uppercase;font-weight:700;">Variação Hoje</div>
              <div style="font-size:14px;font-weight:900;color:${(saf.change || 0) >= 0 ? '#22c55e' : '#ef4444'};">
                ${(saf.change || 0) >= 0 ? '▲ +' : '▼ '}${saf.change || 0}%
              </div>
            </div>
            <div>
              <div style="font-size:10px;color:#94a3b8;text-transform:uppercase;font-weight:700;">Dividend Yield</div>
              <div style="font-size:14px;font-weight:900;color:#facc15;">${((saf.dividendYield || 0.008) * 100).toFixed(1)}%/mês</div>
            </div>
          </div>

          <!-- SEUS FUNDOS / SUAS AÇÕES -->
          <div style="font-size:12px;color:#cbd5e1;display:flex;justify-content:space-between;align-items:center;padding:0 4px;">
            <span>${isBuy ? '💵 Seu Saldo Pessoal Disponível:' : '📦 Ações que Você Possui:'}</span>
            <b style="color:${isBuy ? '#4ade80' : '#38bdf8'};font-size:14px;">
              ${isBuy ? `R$ ${(mp.personalBalance || 0).toLocaleString('pt-BR')}` : `${userHolding.toLocaleString('pt-BR')} ações`}
            </b>
          </div>

          <!-- SELETOR DE QUANTIDADE -->
          <div>
            <label style="display:block;font-size:11px;font-weight:800;color:#94a3b8;text-transform:uppercase;margin-bottom:6px;">
              Quantidade de Ações para ${isBuy ? 'Comprar' : 'Vender'}:
            </label>
            <div style="display:flex;gap:8px;align-items:center;">
              <input id="safTradeQtyInput" type="number" min="1" step="10" max="${isBuy ? 1000000 : userHolding}" value="${initialCount}" style="flex:1;background:#1e293b;border:1px solid #475569;border-radius:8px;padding:12px;color:#fff;font-size:18px;font-weight:900;text-align:center;box-sizing:border-box;">
            </div>

            <!-- BOTÕES DE ATALHO RÁPIDO -->
            <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;">
              ${[50, 100, 250, 500, 1000].map(amt => `
                <button type="button" class="btnSafPreset" data-amt="${amt}" style="flex:1;background:#1e293b;color:#cbd5e1;border:1px solid #334155;border-radius:6px;padding:6px;font-size:11px;font-weight:800;cursor:pointer;">
                  +${amt}
                </button>
              `).join('')}
              ${isBuy ? `
                <button type="button" id="btnSafMaxBuy" style="flex:1;background:#065f46;color:#6ee7b7;border:1px solid #10b981;border-radius:6px;padding:6px;font-size:11px;font-weight:900;cursor:pointer;">
                  Máx. Possível
                </button>
              ` : `
                <button type="button" id="btnSafMaxSell" style="flex:1;background:#7f1d1d;color:#fca5a5;border:1px solid #ef4444;border-radius:6px;padding:6px;font-size:11px;font-weight:900;cursor:pointer;">
                  Tudo (${userHolding})
                </button>
              `}
            </div>
          </div>

          <!-- CARD DE CÁLCULO FINANCEIRO DINÂMICO (VALOR QUE VAI SE GASTAR OU RECEBER) -->
          <div id="safTradeCalcBox" style="background:${isBuy ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)'};border:1px solid ${isBuy ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'};border-radius:12px;padding:14px;display:flex;flex-direction:column;gap:8px;">
            <!-- Preenchido dinamicamente por updateCalc -->
          </div>

          <!-- BOTÕES DE AÇÃO: CONFIRMAR COMPRA / CONFIRMAR VENDA -->
          <div style="display:flex;gap:10px;margin-top:6px;">
            <button id="btnSafConfirmTrade" type="button" style="flex:2;background:${isBuy ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#ef4444,#dc2626)'};color:#fff;border:none;border-radius:10px;padding:14px;font-size:14px;font-weight:900;cursor:pointer;box-shadow:${isBuy ? '0 4px 18px rgba(16,185,129,0.4)' : '0 4px 18px rgba(239,68,68,0.4)'};transition:all 0.2s ease;">
              Confirmar
            </button>
            <button id="btnSafCancelTrade" type="button" style="flex:1;background:#1e293b;color:#cbd5e1;border:1px solid #475569;border-radius:10px;padding:14px;font-size:12px;font-weight:800;cursor:pointer;">
              Cancelar
            </button>
          </div>

        </div>
      `;

      document.body.appendChild(overlay);

      const qtyInput = overlay.querySelector('#safTradeQtyInput');
      const calcBox = overlay.querySelector('#safTradeCalcBox');
      const confirmBtn = overlay.querySelector('#btnSafConfirmTrade');
      const closeBtn = overlay.querySelector('#btnSafModalClose');
      const cancelBtn = overlay.querySelector('#btnSafCancelTrade');

      function updateCalc() {
        let count = parseInt(qtyInput.value, 10);
        if (isNaN(count) || count <= 0) count = 0;

        if (isBuy) {
          const totalCost = Math.round(saf.sharePrice * count);
          const hasFunds = (mp.personalBalance || 0) >= totalCost && count > 0;
          const remaining = (mp.personalBalance || 0) - totalCost;

          calcBox.innerHTML = `
            <div style="display:flex;justify-content:space-between;font-size:12px;color:#cbd5e1;">
              <span>Preço Unitário da Ação:</span>
              <b style="color:#fff;">R$ ${saf.sharePrice.toFixed(2)}</b>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:12px;color:#cbd5e1;">
              <span>Taxa de Corretagem B3:</span>
              <b style="color:#10b981;">Isenta (R$ 0,00)</b>
            </div>
            <div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:8px;display:flex;justify-content:space-between;align-items:center;">
              <div>
                <div style="font-size:11px;font-weight:900;color:#6ee7b7;text-transform:uppercase;">VALOR TOTAL A GASTAR NA COMPRA:</div>
                <div style="font-size:22px;font-weight:900;color:#fff;">R$ ${totalCost.toLocaleString('pt-BR')}</div>
              </div>
              <div style="text-align:right;">
                <div style="font-size:10px;color:#94a3b8;">Saldo Restante:</div>
                <div style="font-size:13px;font-weight:900;color:${hasFunds ? '#4ade80' : '#ef4444'};">
                  R$ ${remaining.toLocaleString('pt-BR')}
                </div>
              </div>
            </div>
            ${!hasFunds && count > 0 ? `
              <div style="font-size:11px;color:#ef4444;font-weight:800;background:rgba(239,68,68,0.15);padding:6px 10px;border-radius:6px;border:1px solid rgba(239,68,68,0.3);margin-top:4px;">
                ⚠️ Saldo insuficiente! Faltam R$ ${(totalCost - (mp.personalBalance || 0)).toLocaleString('pt-BR')}.
              </div>
            ` : ''}
          `;

          if (hasFunds) {
            confirmBtn.disabled = false;
            confirmBtn.style.opacity = '1';
            confirmBtn.style.cursor = 'pointer';
            confirmBtn.textContent = `✅ Confirmar Compra (${count.toLocaleString('pt-BR')} ações por R$ ${totalCost.toLocaleString('pt-BR')})`;
          } else {
            confirmBtn.disabled = true;
            confirmBtn.style.opacity = '0.5';
            confirmBtn.style.cursor = 'not-allowed';
            confirmBtn.textContent = count <= 0 ? 'Informe uma quantidade válida' : '⚠️ Saldo Insuficiente';
          }
        } else {
          // Venda
          const gross = Math.round(saf.sharePrice * count);
          const fee = Math.round(gross * 0.02); // 2% taxa corretagem
          const payout = gross - fee;
          const hasShares = userHolding >= count && count > 0;
          const remainingShares = userHolding - count;

          calcBox.innerHTML = `
            <div style="display:flex;justify-content:space-between;font-size:12px;color:#cbd5e1;">
              <span>Subtotal Bruto (${count} ações):</span>
              <b style="color:#fff;">R$ ${gross.toLocaleString('pt-BR')}</b>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:12px;color:#cbd5e1;">
              <span>Taxa de Corretagem da Bolsa (2%):</span>
              <b style="color:#f87171;">- R$ ${fee.toLocaleString('pt-BR')}</b>
            </div>
            <div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:8px;display:flex;justify-content:space-between;align-items:center;">
              <div>
                <div style="font-size:11px;font-weight:900;color:#fca5a5;text-transform:uppercase;">VALOR LÍQUIDO A RECEBER:</div>
                <div style="font-size:22px;font-weight:900;color:#4ade80;">+R$ ${payout.toLocaleString('pt-BR')}</div>
              </div>
              <div style="text-align:right;">
                <div style="font-size:10px;color:#94a3b8;">Ações Restantes:</div>
                <div style="font-size:13px;font-weight:900;color:${hasShares ? '#38bdf8' : '#ef4444'};">
                  ${Math.max(0, remainingShares).toLocaleString('pt-BR')} ações
                </div>
              </div>
            </div>
            ${userHolding === 0 ? `
              <div style="font-size:12px;color:#fca5a5;font-weight:800;background:rgba(239,68,68,0.2);padding:10px 12px;border-radius:8px;border:1px solid rgba(239,68,68,0.4);margin-top:6px;line-height:1.4;">
                ⚠️ Você atualmente possui 0 ações de ${esc(saf.name)}. Para poder confirmar venda, compre ações no botão 'Confirmar Compra'.<br>
                <button type="button" id="btnSwitchToBuyModal" style="margin-top:8px;background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;padding:8px 16px;border-radius:6px;font-weight:900;font-size:12px;cursor:pointer;box-shadow:0 2px 8px rgba(16,185,129,0.3);">
                  🛒 Ir para Confirmar Compra
                </button>
              </div>
            ` : (!hasShares && count > 0 ? `
              <div style="font-size:11px;color:#ef4444;font-weight:800;background:rgba(239,68,68,0.15);padding:6px 10px;border-radius:6px;border:1px solid rgba(239,68,68,0.3);margin-top:4px;">
                ⚠️ Você possui apenas ${userHolding} ações desta SAF.
              </div>
            ` : '')}
          `;

          const btnSwitch = calcBox.querySelector('#btnSwitchToBuyModal');
          if (btnSwitch) {
            btnSwitch.onclick = () => {
              closeModal();
              this.openTradeModal(state, 'buy', clubId, 100);
            };
          }

          if (hasShares) {
            confirmBtn.disabled = false;
            confirmBtn.style.opacity = '1';
            confirmBtn.style.cursor = 'pointer';
            confirmBtn.textContent = `🔴 Confirmar Venda (${count.toLocaleString('pt-BR')} ações por +R$ ${payout.toLocaleString('pt-BR')})`;
          } else {
            confirmBtn.disabled = true;
            confirmBtn.style.opacity = '0.5';
            confirmBtn.style.cursor = 'not-allowed';
            confirmBtn.textContent = userHolding === 0 ? '⚠️ Você Não Possui Ações Desta SAF' : (count <= 0 ? 'Informe uma quantidade válida' : '⚠️ Ações Insuficientes');
          }
        }
      }

      updateCalc();
      qtyInput.oninput = updateCalc;

      overlay.querySelectorAll('.btnSafPreset').forEach(btn => {
        btn.onclick = () => {
          const amt = parseInt(btn.dataset.amt, 10);
          const current = parseInt(qtyInput.value, 10) || 0;
          qtyInput.value = current + amt;
          updateCalc();
        };
      });

      const btnMaxBuy = overlay.querySelector('#btnSafMaxBuy');
      if (btnMaxBuy) {
        btnMaxBuy.onclick = () => {
          const maxAfford = Math.floor((mp.personalBalance || 0) / saf.sharePrice);
          qtyInput.value = Math.max(1, maxAfford);
          updateCalc();
        };
      }

      const btnMaxSell = overlay.querySelector('#btnSafMaxSell');
      if (btnMaxSell) {
        btnMaxSell.onclick = () => {
          qtyInput.value = userHolding;
          updateCalc();
        };
      }

      function onSafModalKeyDown(ev) {
        if (ev.key === 'Escape') closeModal();
      }
      function closeModal() {
        document.removeEventListener('keydown', onSafModalKeyDown);
        overlay.remove();
      }
      document.addEventListener('keydown', onSafModalKeyDown);

      closeBtn.onclick = closeModal;
      cancelBtn.onclick = closeModal;
      overlay.onclick = (e) => {
        if (e.target === overlay) closeModal();
      };

      confirmBtn.onclick = () => {
        if (confirmBtn.disabled) return;
        const count = parseInt(qtyInput.value, 10);
        if (isNaN(count) || count <= 0) return;
        confirmBtn.disabled = true;

        let res;
        if (isBuy) {
          res = this.buySafShares(state, clubId, count);
        } else {
          res = this.sellSafShares(state, clubId, count);
        }

        if (window.toast) window.toast(res.message);
        if (res.ok) {
          if (window.save) window.save();
          closeModal();
          this.renderLifeAndSharesUI('afm-career-economy-container', state);
        } else {
          confirmBtn.disabled = false;
        }
      };
    },

    simulateSafAssemblyVote(state, modelKey = '50plus1') {
      this.ensureState(state);
      const totalVoters = 300;
      let baseProb = 0.80;
      let aporte = 90000000;
      let modelName = 'Venda Minoritária (50%+1 dos Sócios)';

      if (modelKey === 'strategic70') {
        baseProb = 0.62;
        aporte = 220000000;
        modelName = 'Investimento Estratégico (70% do Futebol)';
      } else if (modelKey === 'major90') {
        baseProb = 0.45;
        aporte = 450000000;
        modelName = 'Aporte Multibilionário (90% do Futebol)';
      }

      const prestigeBonus = ((state.managerPersonal?.prestigeScore || 5) - 5) * 0.005;
      const fansBonus = ((state.trust?.fans || 50) - 50) * 0.002;
      const finalProb = Math.min(0.92, Math.max(0.25, baseProb + prestigeBonus + fansBonus));

      let inFavor = 0;
      for (let i = 0; i < totalVoters; i++) {
        if (Math.random() < finalProb) inFavor++;
      }
      const against = totalVoters - inFavor;
      const approved = inFavor >= 151; // 50% + 1

      if (approved) {
        state.clubIsSaf = true;
        state.balance = (Number(state.balance) || 0) + aporte;
        state.clubBalance = state.balance;
        state.news = Array.isArray(state.news) ? state.news : [];
        state.news.unshift(`🏛️ ASSEMBLEIA GERAL HISTÓRICA: O ${state.club} aprovou a transformação em SAF com ${inFavor} votos a favor (${((inFavor / totalVoters) * 100).toFixed(1)}%)! Aporte de R$ ${aporte.toLocaleString('pt-BR')} creditado no caixa do clube!`);
        state.safAssemblyLastVote = { date: state.date, approved: true, inFavor, against, modelName, aporte };
      } else {
        state.news = Array.isArray(state.news) ? state.news : [];
        state.news.unshift(`⚠️ ASSEMBLEIA SAF REJEITADA: A proposta de SAF do ${state.club} obteve ${inFavor} votos a favor e foi rejeitada pelo Conselho Deliberativo (${against} votos contra).`);
        state.safAssemblyLastVote = { date: state.date, approved: false, inFavor, against, modelName, aporte };
      }

      return { approved, inFavor, against, totalVoters, aporte, modelName };
    },

    // Gera propostas P2P de investidores do mercado (tanto para comprar de você quanto vendendo lotes com desconto)
    generateSafP2POffers(state) {
      this.ensureState(state);
      const mp = state.managerPersonal;
      state.safP2POffers = Array.isArray(state.safP2POffers) ? state.safP2POffers : [];

      if (state.safP2POffers.length > 5) {
        state.safP2POffers.length = 5;
      }

      const safList = this.getSafMarketList(state);
      const magnates = MARKET_MAGNATES;
      if (!Array.isArray(safList) || safList.length === 0) return;

      // 1. Propostas de INVESTIDORES VENDENDO lotes para você comprar com desconto (garantir pelo menos 2)
      let sellingOffersCount = state.safP2POffers.filter(o => o.type === 'investor_selling').length;
      while (sellingOffersCount < 2) {
        const targetSaf = safList[Math.floor(Math.random() * safList.length)];
        const mag = magnates[Math.floor(Math.random() * magnates.length)];
        const sharesCount = [100, 200, 250, 500][Math.floor(Math.random() * 4)];
        const baseVal = Math.round(targetSaf.sharePrice * sharesCount);
        const discountPct = [12, 15, 18, 22, 25][Math.floor(Math.random() * 5)];
        const offerPrice = Math.round(baseVal * (1 - discountPct / 100));

        state.safP2POffers.push({
          id: 'p2p_sell_' + Date.now() + '_' + Math.floor(Math.random() * 10000),
          type: 'investor_selling',
          magnateName: mag.name,
          magnateEntity: mag.entity,
          magnateAvatar: mag.avatar,
          clubId: targetSaf.id,
          clubName: targetSaf.name,
          ticker: targetSaf.ticker,
          sharesCount,
          normalPrice: baseVal,
          offerPrice,
          discountPct,
          desc: `${mag.name} (${mag.entity}) está liquidando um lote de <b>${sharesCount.toLocaleString('pt-BR')} ações</b> de <b>${targetSaf.name} (${targetSaf.ticker})</b> com <b>${discountPct}% de desconto</b> sobre a cotação da Bolsa!`
        });
        sellingOffersCount++;
      }

      // 2. Propostas de INVESTIDORES COMPRANDO ações da sua carteira com ágio (garantir pelo menos 2)
      let buyingOffersCount = state.safP2POffers.filter(o => o.type === 'investor_buying').length;
      const userPortfolio = mp.safPortfolio || {};
      const ownedIds = Object.keys(userPortfolio).filter(id => userPortfolio[id] && userPortfolio[id].sharesCount > 0);

      while (buyingOffersCount < 2) {
        let targetId;
        let sharesCount;
        if (ownedIds.length > 0 && buyingOffersCount === 0) {
          targetId = ownedIds[Math.floor(Math.random() * ownedIds.length)];
          const ownedCount = userPortfolio[targetId].sharesCount;
          sharesCount = ownedCount <= 100 ? ownedCount : [50, 100, Math.min(250, ownedCount)][Math.floor(Math.random() * 3)];
        } else {
          targetId = safList[Math.floor(Math.random() * safList.length)].id;
          sharesCount = [100, 250, 500][Math.floor(Math.random() * 3)];
        }

        const targetSaf = safList.find(s => s.id === targetId) || safList[0];
        const mag = magnates[Math.floor(Math.random() * magnates.length)];
        const baseVal = Math.round(targetSaf.sharePrice * sharesCount);
        const agioPct = [15, 20, 25, 30][Math.floor(Math.random() * 4)];
        const offerPrice = Math.round(baseVal * (1 + agioPct / 100));

        state.safP2POffers.push({
          id: 'p2p_buy_' + Date.now() + '_' + Math.floor(Math.random() * 10000),
          type: 'investor_buying',
          magnateName: mag.name,
          magnateEntity: mag.entity,
          magnateAvatar: mag.avatar,
          clubId: targetSaf.id,
          clubName: targetSaf.name,
          ticker: targetSaf.ticker,
          sharesCount,
          normalPrice: baseVal,
          offerPrice,
          agioPct,
          desc: `${mag.name} (${mag.entity}) propõe comprar um pacote de <b>${sharesCount.toLocaleString('pt-BR')} ações</b> de <b>${targetSaf.name} (${targetSaf.ticker})</b> pagando <b>+${agioPct}% de ágio</b> sobre a cotação da Bolsa!`
        });
        buyingOffersCount++;
      }
    },

    generateSafP2POffersIfEmpty(state) {
      this.generateSafP2POffers(state);
    },

    acceptSafP2POffer(state, offerId) {
      this.ensureState(state);
      const mp = state.managerPersonal;
      const idx = (state.safP2POffers || []).findIndex(o => o.id === offerId);
      if (idx === -1) return { ok: false, message: 'Proposta expirada ou não encontrada.' };
      const offer = state.safP2POffers[idx];

      if (offer.type === 'investor_selling') {
        // Usuário comprando lote de ações do investidor
        if ((mp.personalBalance || 0) < offer.offerPrice) {
          return { ok: false, message: `Saldo pessoal insuficiente! Necessário: R$ ${offer.offerPrice.toLocaleString('pt-BR')}.` };
        }

        mp.personalBalance -= offer.offerPrice;
        mp.safPortfolio = mp.safPortfolio || {};
        mp.safPortfolio[offer.clubId] = mp.safPortfolio[offer.clubId] || { sharesCount: 0, avgPrice: 0 };
        const holding = mp.safPortfolio[offer.clubId];
        const oldVal = (holding.sharesCount || 0) * (holding.avgPrice || 0);
        holding.sharesCount = (holding.sharesCount || 0) + offer.sharesCount;
        holding.avgPrice = Number(((oldVal + offer.offerPrice) / holding.sharesCount).toFixed(2));

        // Registra transação no livro de negociações do mercado
        state.safMarketTrades = state.safMarketTrades || [];
        state.safMarketTrades.unshift({
          id: 'tr_' + Date.now(),
          type: 'BUY',
          investor: `Téc. ${mp.name || 'Você'}`,
          club: offer.clubName,
          ticker: offer.ticker,
          shares: offer.sharesCount,
          price: Number((offer.offerPrice / offer.sharesCount).toFixed(2)),
          total: offer.offerPrice,
          time: `Rodada ${state.round || 1}`
        });
        if (state.safMarketTrades.length > 20) state.safMarketTrades.length = 20;

        state.safP2POffers.splice(idx, 1);
        this.syncCareerWallet(state, mp.personalBalance);
        return {
          ok: true,
          message: `🎉 Negócio fechado! Você comprou o lote de ${offer.sharesCount.toLocaleString('pt-BR')} ações de ${offer.clubName} com ${offer.discountPct}% de desconto por R$ ${offer.offerPrice.toLocaleString('pt-BR')}!`
        };
      } else {
        // Usuário vendendo ações da carteira para o investidor
        mp.safPortfolio = mp.safPortfolio || {};
        const holding = mp.safPortfolio[offer.clubId];
        if (!holding || holding.sharesCount < offer.sharesCount) {
          return { ok: false, message: `Você precisa ter pelo menos ${offer.sharesCount} ações de ${offer.clubName} para fechar este negócio com ${offer.magnateName}.` };
        }

        holding.sharesCount -= offer.sharesCount;
        if (holding.sharesCount <= 0) delete mp.safPortfolio[offer.clubId];
        mp.personalBalance += offer.offerPrice;

        // Registra transação no livro de negociações do mercado
        state.safMarketTrades = state.safMarketTrades || [];
        state.safMarketTrades.unshift({
          id: 'tr_' + Date.now(),
          type: 'SELL',
          investor: `Téc. ${mp.name || 'Você'}`,
          club: offer.clubName,
          ticker: offer.ticker,
          shares: offer.sharesCount,
          price: Number((offer.offerPrice / offer.sharesCount).toFixed(2)),
          total: offer.offerPrice,
          time: `Rodada ${state.round || 1}`
        });
        if (state.safMarketTrades.length > 20) state.safMarketTrades.length = 20;

        state.safP2POffers.splice(idx, 1);
        this.syncCareerWallet(state, mp.personalBalance);
        return {
          ok: true,
          message: `🤝 Negócio P2P fechado! Você vendeu ${offer.sharesCount.toLocaleString('pt-BR')} ações para ${offer.magnateName} e recebeu R$ ${offer.offerPrice.toLocaleString('pt-BR')} com ágio!`
        };
      }
    },

    rejectSafP2POffer(state, offerId) {
      const idx = (state.safP2POffers || []).findIndex(o => o.id === offerId);
      if (idx !== -1) {
        state.safP2POffers.splice(idx, 1);
      }
      return { ok: true, message: 'Proposta recusada com sucesso.' };
    },

    // Permite ao treinador colocar suas próprias ações à venda para investidores comprarem com ágio
    publishUserSafSellOrder(state, clubId, count, agioPct = 15) {
      this.ensureState(state);
      const mp = state.managerPersonal;
      mp.safPortfolio = mp.safPortfolio || {};
      const holding = mp.safPortfolio[clubId];
      if (!holding || (holding.sharesCount || 0) < count || count <= 0) {
        return { ok: false, message: 'Quantidade de ações insuficiente para colocar à venda.' };
      }

      const safList = this.getSafMarketList(state);
      const saf = safList.find(c => c.id === clubId);
      if (!saf) return { ok: false, message: 'Clube SAF não encontrado na Bolsa.' };

      // Deduz ações da carteira para reserva na ordem
      holding.sharesCount -= count;
      if (holding.sharesCount <= 0) delete mp.safPortfolio[clubId];

      const baseVal = Math.round(saf.sharePrice * count);
      const totalAskingPrice = Math.round(baseVal * (1 + agioPct / 100));
      const askingPricePerShare = Number((saf.sharePrice * (1 + agioPct / 100)).toFixed(2));

      state.userSafSellOrders = Array.isArray(state.userSafSellOrders) ? state.userSafSellOrders : [];
      const order = {
        id: 'usr_order_' + Date.now(),
        clubId: saf.id,
        clubName: saf.name,
        ticker: saf.ticker,
        logo: saf.logo || '🛡️',
        sharesCount: count,
        agioPct,
        basePrice: saf.sharePrice,
        askingPricePerShare,
        totalAskingPrice,
        status: 'open',
        time: `Rodada ${state.round || 1}`
      };
      state.userSafSellOrders.unshift(order);
      this.syncCareerWallet(state, mp.personalBalance);

      return {
        ok: true,
        message: `📢 Proposta publicada no mercado! Seu pacote de ${count.toLocaleString('pt-BR')} ações de ${saf.name} está anunciado com +${agioPct}% de ágio por R$ ${totalAskingPrice.toLocaleString('pt-BR')}!`
      };
    },

    cancelUserSafSellOrder(state, orderId) {
      this.ensureState(state);
      const mp = state.managerPersonal;
      state.userSafSellOrders = Array.isArray(state.userSafSellOrders) ? state.userSafSellOrders : [];
      const idx = state.userSafSellOrders.findIndex(o => o.id === orderId);
      if (idx === -1) return { ok: false, message: 'Ordem de venda não encontrada.' };

      const order = state.userSafSellOrders[idx];
      mp.safPortfolio = mp.safPortfolio || {};
      mp.safPortfolio[order.clubId] = mp.safPortfolio[order.clubId] || { sharesCount: 0, avgPrice: order.basePrice };
      mp.safPortfolio[order.clubId].sharesCount += order.sharesCount;

      state.userSafSellOrders.splice(idx, 1);
      this.syncCareerWallet(state, mp.personalBalance);
      return {
        ok: true,
        message: `Ordem cancelada. As ${order.sharesCount.toLocaleString('pt-BR')} ações de ${order.clubName} retornaram para sua carteira.`
      };
    },

    instantExecuteUserSellOrder(state, orderId) {
      this.ensureState(state);
      const mp = state.managerPersonal;
      state.userSafSellOrders = Array.isArray(state.userSafSellOrders) ? state.userSafSellOrders : [];
      const idx = state.userSafSellOrders.findIndex(o => o.id === orderId);
      if (idx === -1) return { ok: false, message: 'Ordem de venda não encontrada.' };

      const order = state.userSafSellOrders[idx];
      const buyer = MARKET_MAGNATES[Math.floor(Math.random() * MARKET_MAGNATES.length)];

      mp.personalBalance = (mp.personalBalance || 0) + order.totalAskingPrice;

      // Registra transação no livro de negociações do mercado
      state.safMarketTrades = state.safMarketTrades || [];
      state.safMarketTrades.unshift({
        id: 'tr_' + Date.now(),
        type: 'SELL',
        investor: `Téc. ${mp.name || 'Você'} ➔ ${buyer.name}`,
        club: order.clubName,
        ticker: order.ticker,
        shares: order.sharesCount,
        price: order.askingPricePerShare,
        total: order.totalAskingPrice,
        time: `Hoje no Pregão (P2P)`
      });
      if (state.safMarketTrades.length > 25) state.safMarketTrades.length = 25;

      state.userSafSellOrders.splice(idx, 1);
      this.syncCareerWallet(state, mp.personalBalance);
      return {
        ok: true,
        message: `🎉 Negócio fechado! ${buyer.name} (${buyer.entity}) comprou sua oferta de ${order.sharesCount.toLocaleString('pt-BR')} ações de ${order.clubName} e pagou R$ ${order.totalAskingPrice.toLocaleString('pt-BR')} à vista na sua conta!`
      };
    },

    // Atualização dinâmica da Bolsa a cada rodada / avanço de dia (Turnos)
    processRoundTurn(state) {
      if (!state) return;
      this.ensureState(state);
      const safList = this.getSafMarketList(state);
      if (!Array.isArray(safList) || safList.length === 0) return;

      const userClub = state.club || '';
      const lastMatch = state.lastMatchSummary || null;
      const userWon = lastMatch ? (lastMatch.result === 'win' || (lastMatch.userScore > lastMatch.oppScore)) : null;
      const userDrew = lastMatch ? (lastMatch.result === 'draw' || (lastMatch.userScore === lastMatch.oppScore)) : null;

      safList.forEach(saf => {
        saf.prevPrice = saf.sharePrice || 25.00;
        let delta = (Math.random() * 0.07 - 0.03); // Oscilação base: -3% a +4%

        if (saf.isUserClub || norm(saf.name).includes(norm(userClub))) {
          if (userWon === true) delta = 0.02 + Math.random() * 0.045; // Vitória do clube: +2% a +6.5%
          else if (userDrew === true) delta = -0.01 + Math.random() * 0.025; // Empate: -1% a +1.5%
          else if (userWon === false) delta = -0.015 - Math.random() * 0.035; // Derrota: -1.5% a -5%
        } else {
          if (Math.random() < 0.15) {
            delta = (Math.random() > 0.5 ? 1 : -1) * (0.04 + Math.random() * 0.04);
          }
        }

        const newPrice = Math.max(3.50, Number((saf.sharePrice * (1 + delta)).toFixed(2)));
        saf.sharePrice = newPrice;
        saf.change = Number((((saf.sharePrice - saf.prevPrice) / saf.prevPrice) * 100).toFixed(1));

        const yieldAdjustment = (0.97 + Math.random() * 0.06);
        saf.dividendYield = Number(Math.max(0.005, Math.min(0.022, (saf.dividendYield || 0.009) * yieldAdjustment)).toFixed(4));
      });

      // Gera 1 ou 2 novas operações de outros investidores no livro de negociações
      const magnates = MARKET_MAGNATES;
      const targetSaf = safList[Math.floor(Math.random() * safList.length)];
      const mag = magnates[Math.floor(Math.random() * magnates.length)];
      const isBuy = Math.random() > 0.35;
      const tradeShares = (Math.floor(Math.random() * 7) + 1) * 5000;
      const tradeTotal = Math.round(tradeShares * targetSaf.sharePrice);

      state.safMarketTrades = state.safMarketTrades || [];
      state.safMarketTrades.unshift({
        id: 'tr_' + Date.now(),
        type: isBuy ? 'BUY' : 'SELL',
        investor: mag.name,
        club: targetSaf.name,
        ticker: targetSaf.ticker,
        shares: tradeShares,
        price: targetSaf.sharePrice,
        total: tradeTotal,
        time: `Rodada ${state.round || 1}`
      });
      if (state.safMarketTrades.length > 20) state.safMarketTrades.length = 20;

      // Gera notícias de governança (clubes virando SAF ou retornando à Associação Civil)
      const corporateNewsPool = [
        { tag: 'TRANSIÇÃO SAF', club: 'Santos FC', headline: 'Comitê de Governança aprova minuta de estatuto da SAF com investimento ancorado de R$ 650M.' },
        { tag: 'ASSOCIAÇÃO CIVIL', club: 'Vasco da Gama', headline: 'Conselho de Beneméritos aprova comissão para garantir que patrimônio histórico fique 100% com a Associação Civil.' },
        { tag: 'TRANSIÇÃO SAF', club: 'Paraná Clube', headline: 'Venda de 90% das cotas da SAF é formalizada em cartório após homologação judicial definitiva.' },
        { tag: 'ASSOCIAÇÃO CIVIL', club: 'Portuguesa', headline: 'Assembleia de Sócios ratifica gestão colegiada e recusa proposta de venda de controle do Canindé.' },
        { tag: 'EXPANSÃO SAF', club: 'Bahia SAF (CFG)', headline: 'City Football Group integraliza novo aporte de R$ 120 milhões para obras do CT e elenco.' },
        { tag: 'TRANSIÇÃO SAF', club: 'Joinville', headline: 'Sócios convocam assembleia geral para votar criação de empresa de futebol em modelo 50%+1.' },
        { tag: 'ASSOCIAÇÃO CIVIL', club: 'Santa Cruz', headline: 'Movimento popular e diretoria da Associação Civil debatem plano de recuperação sem alienação do Arruda.' },
        { tag: 'EXPANSÃO SAF', club: 'Botafogo SAF', headline: 'Eagle Football anuncia emissão de debêntures na Bolsa SAF para refinanciamento de passivo.' },
        { tag: 'TRANSIÇÃO SAF', club: 'Figueirense SAF', headline: 'Clube conclui captação na Bolsa com adesão de sócios e pequenos investidores locais.' },
        { tag: 'ASSOCIAÇÃO CIVIL', club: 'Ponte Preta', headline: 'Conselho Deliberativo aprova plano de metas trienal mantendo estrutura como Associação Civil.' }
      ];

      if ((state.round % 2 === 0 || Math.random() < 0.40) && corporateNewsPool.length > 0) {
        const item = corporateNewsPool[Math.floor(Math.random() * corporateNewsPool.length)];
        state.safCorporateNews = state.safCorporateNews || [];
        state.safCorporateNews.unshift({
          id: 'cn_' + Date.now(),
          tag: item.tag,
          club: item.club,
          headline: item.headline,
          date: `Rodada ${state.round || 1}`
        });
        if (state.safCorporateNews.length > 20) state.safCorporateNews.length = 20;
      }

      // Processa propostas de venda das ações publicadas pelo treinador no mercado
      if (Array.isArray(state.userSafSellOrders) && state.userSafSellOrders.length > 0) {
        if (Math.random() < 0.70) {
          const ord = state.userSafSellOrders[0];
          this.instantExecuteUserSellOrder(state, ord.id);
        }
      }

      this.generateSafP2POffers(state);
    },

    getClubValuationAndSharePrice(state) {
      this.ensureState(state);
      const div = state.clubDivision || (state.teamOverall >= 75 ? 1 : state.teamOverall >= 68 ? 2 : state.teamOverall >= 60 ? 3 : 4);
      const defaultOvr = div === 1 ? 75 : div === 2 ? 69 : div === 3 ? 63 : 58;
      const ovr = state.teamOverall || state.clubOverall || defaultOvr;

      let baseValuation = 22000000;
      if (div === 3) baseValuation = 85000000;
      else if (div === 2) baseValuation = 420000000;
      else if (div === 1) baseValuation = 1650000000;

      const ovrFactor = div === 1
        ? Math.min(1.94, Math.max(1.0, Math.pow(ovr / 75, 1.25)))
        : (div === 4 ? 1.0 : Math.max(0.85, Math.pow(ovr / 65, 1.2)));

      const totalValuation = Math.round(baseValuation * ovrFactor);
      const onePercentPrice = Math.max(220000, Math.round(totalValuation * 0.01));
      const quarterPercentPrice = Math.round(onePercentPrice * 0.25);

      return { totalValuation, onePercentPrice, quarterPercentPrice };
    },

    buyShareFraction(state, pctToBuy = 0.25) {
      this.ensureState(state);
      const mp = state.managerPersonal;
      const { onePercentPrice } = this.getClubValuationAndSharePrice(state);
      const cost = Math.round(onePercentPrice * pctToBuy);

      if (mp.clubSharesPct + pctToBuy > 25) {
        return { ok: false, message: 'Limite societário de 25% do clube atingido!' };
      }
      if (mp.personalBalance < cost) {
        return { ok: false, message: `Patrimônio pessoal insuficiente! Necessário: R$ ${cost.toLocaleString('pt-BR')}.` };
      }

      mp.personalBalance -= cost;
      mp.clubSharesPct = Number((mp.clubSharesPct + pctToBuy).toFixed(2));
      mp.clubShares = mp.clubSharesPct;
      state.balance = (Number(state.balance) || 0) + cost;
      state.clubBalance = state.balance;
      state.financeLog.unshift({
        date: state.date || state.currentDate || '2026',
        type: 'RECEITA',
        title: `Subscrição de Cotas (+${pctToBuy}% por Téc. ${mp.name})`,
        amount: cost
      });
      this.syncCareerWallet(state, mp.personalBalance);

      return {
        ok: true,
        message: `Você adquiriu +${pctToBuy}% do clube por R$ ${cost.toLocaleString('pt-BR')}! Participação atual: ${mp.clubSharesPct}%.`
      };
    },

    sellShareFraction(state, pctToSell = 0.25) {
      this.ensureState(state);
      const mp = state.managerPersonal;
      if (mp.clubSharesPct < pctToSell) {
        return { ok: false, message: 'Você não possui cotas suficientes para vender.' };
      }
      const { onePercentPrice } = this.getClubValuationAndSharePrice(state);
      const payout = Math.round(onePercentPrice * pctToSell * 0.95);
      mp.clubSharesPct = Number((mp.clubSharesPct - pctToSell).toFixed(2));
      mp.clubShares = mp.clubSharesPct;
      mp.personalBalance += payout;
      this.syncCareerWallet(state, mp.personalBalance);
      return {
        ok: true,
        message: `Você vendeu ${pctToSell}% de cotas e recebeu R$ ${payout.toLocaleString('pt-BR')} na sua conta pessoal.`
      };
    },

    buyProperty(state, propId) {
      this.ensureState(state);
      const mp = state.managerPersonal;
      const rawId = String(propId || '').toLowerCase().replace(/^prop_/, '');
      const item = REAL_ESTATE_CATALOG.find((p) => p.id === propId || p.id === rawId || p.id.includes(rawId) || rawId.includes(p.id));
      if (!item) return { ok: false, message: 'Imóvel não encontrado.' };
      if (mp.properties.some((p) => p.id === item.id)) return { ok: false, message: 'Você já possui este imóvel!' };
      if (mp.personalBalance < item.cost) return { ok: false, message: `Saldo pessoal insuficiente (R$ ${item.cost.toLocaleString('pt-BR')}).` };

      mp.personalBalance -= item.cost;
      mp.prestigeScore = (mp.prestigeScore || 5) + item.prestige;
      mp.properties.push({ ...item, currentValue: item.cost, rentedOut: true });
      return { ok: true, message: `${item.icon} ${item.name} comprado com sucesso! (+R$ ${item.monthlyRent.toLocaleString('pt-BR')}/mês)` };
    },

    buyOrUpgradeBusiness(state, bizId) {
      this.ensureState(state);
      const mp = state.managerPersonal;
      const rawId = String(bizId || '').toLowerCase().replace(/^biz_/, '');
      const catalogItem = LIFE_BUSINESS_CATALOG.find((b) => b.id === bizId || b.id === rawId || b.id.includes(rawId) || rawId.includes(b.id));
      if (!catalogItem) return { ok: false, message: 'Negócio inválido.' };

      const existing = mp.businesses.find((b) => b.id === catalogItem.id || b.typeId === catalogItem.id);
      if (existing) {
        if ((existing.level || 1) >= 5) return { ok: false, message: 'Empresa já está no Nível Máximo (5)!' };
        const upCost = Math.round(catalogItem.cost * 0.65 * (existing.level || 1));
        if (mp.personalBalance < upCost) return { ok: false, message: `Saldo insuficiente para expandir (R$ ${upCost.toLocaleString('pt-BR')}).` };
        mp.personalBalance -= upCost;
        existing.level = (existing.level || 1) + 1;
        existing.investedCapital = (existing.investedCapital || catalogItem.cost) + upCost;
        existing.monthlyProfit = Math.round((existing.monthlyProfit || catalogItem.monthlyProfit) * 1.45);
        existing.managementScore = 100;
        return { ok: true, message: `${catalogItem.icon} ${catalogItem.name} expandido para o Nível ${existing.level}!` };
      }

      if (mp.personalBalance < catalogItem.cost) return { ok: false, message: `Saldo pessoal insuficiente (R$ ${catalogItem.cost.toLocaleString('pt-BR')}).` };
      mp.personalBalance -= catalogItem.cost;
      mp.businesses.push({
        id: catalogItem.id,
        typeId: catalogItem.id,
        name: catalogItem.name,
        icon: catalogItem.icon,
        level: 1,
        investedCapital: catalogItem.cost,
        monthlyProfit: catalogItem.monthlyProfit,
        maintenanceCost: catalogItem.maintenance,
        bonusText: catalogItem.bonusText,
        managementScore: 100,
        lastMonthResult: catalogItem.monthlyProfit,
        accumulatedProfit: 0
      });
      return { ok: true, message: `${catalogItem.icon} ${catalogItem.name} inaugurado(a) com sucesso!` };
    },

    buyVehicle(state, vehId) {
      this.ensureState(state);
      const mp = state.managerPersonal;
      const rawId = String(vehId || '').toLowerCase().replace(/^veh_/, '');
      const item = LUXURY_GARAGE_CATALOG.find((v) => v.id === vehId || v.id === rawId || v.id.includes(rawId) || rawId.includes(v.id));
      if (!item) return { ok: false, message: 'Veículo inválido.' };
      if (mp.vehicles.some((v) => v.id === item.id)) return { ok: false, message: 'Já está na sua garagem!' };
      if (mp.personalBalance < item.cost) return { ok: false, message: `Saldo insuficiente (R$ ${item.cost.toLocaleString('pt-BR')}).` };

      mp.personalBalance -= item.cost;
      mp.prestigeScore = (mp.prestigeScore || 5) + item.prestige;
      mp.vehicles.push({ ...item });
      return { ok: true, message: `${item.icon} ${item.name} adicionado à sua Garagem!` };
    },

    calculateMonthlyClubDividendExpense(state) {
      this.ensureState(state);
      const isSaf = this.isClubSaf(state);
      if (!isSaf) {
        return {
          isSaf: false,
          totalClubDividendExpense: 0,
          managerDividendShare: 0,
          totalShareholdersPct: 0
        };
      }
      const mp = state.managerPersonal;
      const { onePercentPrice } = this.getClubValuationAndSharePrice(state);
      const dividendPerOnePercent = Math.round(onePercentPrice * 0.0065);
      const externalPct = Number.isFinite(Number(mp.externalShareholdersPct)) && mp.externalShareholdersPct > 0 ? Number(mp.externalShareholdersPct) : 22;
      const totalShareholdersPct = externalPct + (mp.clubSharesPct || 0);
      const totalClubDividendExpense = Math.round(dividendPerOnePercent * totalShareholdersPct);
      const managerDividendShare = Math.round(dividendPerOnePercent * (mp.clubSharesPct || 0));
      return { isSaf: true, totalClubDividendExpense, managerDividendShare, totalShareholdersPct };
    },

    processMonthlyLifeAndDividendsTurn(state) {
      this.ensureState(state);
      const mp = state.managerPersonal;
      const { isSaf, totalClubDividendExpense, managerDividendShare, totalShareholdersPct } = this.calculateMonthlyClubDividendExpense(state);

      if (isSaf && totalClubDividendExpense > 0) {
        state.balance = (Number(state.balance) || 0) - totalClubDividendExpense;
        state.clubBalance = state.balance;
        state.lastMonthDividendExpense = totalClubDividendExpense;
        mp.lastDividendPaidByClub = totalClubDividendExpense;
        mp.lastDividendReceivedByManager = managerDividendShare;

        state.financeLog.unshift({
          date: state.date || state.currentDate || 'Dia 1º',
          type: 'DESPESA',
          title: `Dividendos pagos aos Acionistas SAF (${totalShareholdersPct.toFixed(2)}% cotas ativas)`,
          amount: -totalClubDividendExpense
        });
      } else {
        state.lastMonthDividendExpense = 0;
        mp.lastDividendPaidByClub = 0;
        mp.lastDividendReceivedByManager = 0;
      }

      const salaryPayment = this.payMonthlyCoachSalary(state);
      const salary = salaryPayment.paid;

      const rentIncome = (mp.properties || []).reduce((acc, p) => {
        p.currentValue = Math.round((p.currentValue || p.cost) * (1 + (p.appreciationRate || 0.10) / 12));
        return acc + (p.rentedOut ? (p.monthlyRent || 0) : 0);
      }, 0);

      let businessIncome = 0;
      (mp.businesses || []).forEach((b) => {
        const base = b.monthlyProfit || b.baseMonthlyReturn || 15000;
        const mgmtFactor = Math.max(0.2, (b.managementScore || 90) / 100);
        const net = Math.round(base * mgmtFactor * (0.92 + Math.random() * 0.18));
        b.lastMonthResult = net;
        b.accumulatedProfit = (b.accumulatedProfit || 0) + net;
        b.managementScore = Math.max(20, (b.managementScore || 100) - 3);
        businessIncome += net;
      });

      // Dividendos de outras ações SAF da carteira
      let safDividends = 0;
      const safList = this.getSafMarketList(state);
      if (mp.safPortfolio) {
        Object.keys(mp.safPortfolio).forEach(clubId => {
          const holding = mp.safPortfolio[clubId];
          const saf = safList.find(s => s.id === clubId);
          if (holding && holding.sharesCount > 0 && saf) {
            const val = holding.sharesCount * saf.sharePrice;
            const div = Math.round(val * (saf.dividendYield || 0.008));
            safDividends += div;
          }
        });
      }

      mp.personalBalance += managerDividendShare + rentIncome + businessIncome + safDividends;
      state.managerMoney = mp.personalBalance;
      this.syncCareerWallet(state, mp.personalBalance);

      this.generateSafP2POffers(state);

      return {
        totalClubDividendExpense,
        managerDividendShare,
        salary,
        rentIncome,
        businessIncome,
        safDividends,
        newPersonalBalance: mp.personalBalance
      };
    },

    // Renderiza a interface da Carreira (Treinador + Negócios & Bolsa SAF)
    renderLifeAndSharesUI(containerId, state) {
      const container = (typeof document !== 'undefined' && typeof containerId === 'string') ? document.getElementById(containerId) : containerId;
      if (!container) return;
      if (typeof window.ensureManagerEconomyHydrated === 'function') {
        window.ensureManagerEconomyHydrated(state);
      }
      const careerDataNeedsMigration = !state?.managerPersonal || state.managerPersonal.balanceMigrationV2 !== true ||
        (Number(state.managerMoney) > 0 && Number(state.managerPersonal?.personalBalance) === 0) ||
        (Number(state.coachPrestige) > Number(state.managerPersonal?.prestigeScore || 0));
      this.ensureState(state);
      if (careerDataNeedsMigration && typeof window.save === 'function') window.save();
      const mp = state.managerPersonal;
      const { totalValuation } = this.getClubValuationAndSharePrice(state);
      const { managerDividendShare } = this.calculateMonthlyClubDividendExpense(state);

      // Sincroniza visibilidade do wrapper do modo X1 em game.js (sempre acessível em todas as sub-abas)
      const x1Wrapper = document.getElementById('afm-x1-card-wrapper') || document.querySelector('.card:has(#btnExportMyX1Token)');
      if (x1Wrapper) {
        x1Wrapper.style.display = 'block';
      }

      // Garante cotações SAF atualizadas no state antes do cálculo unificado de patrimônio
      const safList = this.getSafMarketList(state);
      state.safMarket = safList;

      // Finanças Pessoais do Treinador sincronizadas com AFMCareerFix
      let careerEco = null;
      if (typeof window !== 'undefined' && window.AFMCareerFix && typeof window.AFMCareerFix.calculateCareerEconomy === 'function') {
        careerEco = window.AFMCareerFix.calculateCareerEconomy(state);
      }
      const personalBalance = careerEco ? careerEco.cash : (mp.personalBalance || 0);
      const propertiesTotal = (mp.properties || []).reduce((acc, p) => acc + (p.currentValue || p.cost || 0), 0);
      const vehiclesTotal = (mp.vehicles || []).reduce((acc, v) => acc + (v.cost || 0), 0);
      const businessesTotal = (mp.businesses || []).reduce((acc, b) => acc + (b.investedCapital || b.cost || 0), 0);
      const clubSharesValue = Math.round(totalValuation * ((mp.clubSharesPct || 0) / 100));

      let safPortfolioValue = 0;
      let safPortfolioDividends = 0;
      mp.safPortfolio = mp.safPortfolio || {};
      Object.keys(mp.safPortfolio).forEach(clubId => {
        const holding = mp.safPortfolio[clubId];
        const saf = safList.find(s => s.id === clubId);
        if (holding && holding.sharesCount > 0 && saf) {
          const val = Math.round(holding.sharesCount * saf.sharePrice);
          safPortfolioValue += val;
          safPortfolioDividends += Math.round(val * (saf.dividendYield || 0.008));
        }
      });

      const totalNetWorth = careerEco ? careerEco.netWorth : (personalBalance + propertiesTotal + vehiclesTotal + businessesTotal + clubSharesValue + safPortfolioValue);

      const monthlySalary = careerEco ? careerEco.effectiveSalary : (mp.salary || 18000);
      const curYearSeason = state.year || state.season || 2026;
      const previousSeason = Number(curYearSeason) - 1;
      const previousSalaryEntries = (state.managerFinanceHistory || []).filter(item => {
        const entryYear = String(item.date || '').match(/(?:^|\D)(\d{4})(?:\D|$)/)?.[1];
        return Number(entryYear) === curYearSeason && /salário mensal de técnico/i.test(String(item.desc || ''));
      });
      const previousSeasonRecord = (state.managerCareerHistory || []).find(item => Number(item.season) === curYearSeason);
      const previousSalary = previousSeasonRecord
        ? Number(previousSeasonRecord.salaryReceived) || 0
        : previousSalaryEntries.reduce((total, item) => total + Math.max(0, Number(item.amount) || 0), 0);

      const pInfo = (typeof window.getUnifiedManagerPrestige === 'function')
        ? window.getUnifiedManagerPrestige(state)
        : { pts: Math.min(99, Math.max(5, Number(mp.prestigeScore) || Number(state.coachPrestige) || 5)), level: 1, titlesCount: (state.titles || []).length, license: 'LICENÇA CBF D (INICIANTE)' };
      const currentPrestige = pInfo.pts;
      const userPts = pInfo.pts;
      const userTitles = pInfo.titlesCount;
      const userLevel = pInfo.level;
      const userLicense = pInfo.license;

      const monthlyRent = (mp.properties || []).reduce((acc, p) => acc + (p.rentedOut ? (p.monthlyRent || 0) : 0), 0);
      const monthlyBiz = (mp.businesses || []).reduce((acc, b) => acc + (b.monthlyProfit || 0), 0);
      const monthlyClubDividend = mp.lastDividendReceivedByManager || managerDividendShare || 0;
      const totalMonthlyGains = careerEco ? careerEco.monthlyIncome : (monthlySalary + monthlyRent + monthlyBiz + monthlyClubDividend + safPortfolioDividends);

      const userClubName = state.club || 'Meu Clube';
      const isAlreadySaf = (typeof window !== 'undefined' && window.AFMCareerFix && typeof window.AFMCareerFix.isClubSaf === 'function')
        ? window.AFMCareerFix.isClubSaf(state, userClubName)
        : this.isClubSaf(state, userClubName);

      this.generateSafP2POffers(state);
      const p2pOffers = state.safP2POffers || [];
      this.activeP2PTab = this.activeP2PTab || 'proposals';
      const userSellOrders = state.userSafSellOrders || [];
      const userPortfolio = mp.safPortfolio || {};
      const ownedClubEntries = Object.keys(userPortfolio)
        .filter(id => userPortfolio[id] && userPortfolio[id].sharesCount > 0)
        .map(id => {
          const saf = safList.find(s => s.id === id) || { id, name: id, ticker: 'SAF', sharePrice: userPortfolio[id].avgPrice || 25, logo: '🛡️' };
          return { saf, count: userPortfolio[id].sharesCount, avgPrice: userPortfolio[id].avgPrice };
        });

      // Ranking de Bilionários da Bola
      const billionaires = [
        ...MARKET_MAGNATES.map(m => ({ name: m.name, entity: m.entity, netWorth: m.netWorth, avatar: m.avatar, isUser: false })),
        { name: `Téc. ${mp.name || 'Aquino'}`, entity: `${userClubName} (Treinador & Investidor)`, netWorth: totalNetWorth, avatar: '💎', isUser: true }
      ].sort((a, b) => b.netWorth - a.netWorth);

      container.innerHTML = `
        <div class="life-shares-container" style="display:block;width:100%;box-sizing:border-box;">
          <div style="display:flex;flex-direction:column;gap:18px;width:100%;box-sizing:border-box;">
          
          <!-- PAINEL SUPERIOR TRIPLO DE FINANÇAS PESSOAIS (RESPONSIVO) -->
          <div class="afm-career-kpi-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px;width:100%;box-sizing:border-box;">
            <!-- CARD 1: PATRIMÔNIO TOTAL ACUMULADO -->
            <div style="min-width:0;box-sizing:border-box;background:linear-gradient(135deg,rgba(124,58,237,0.25),rgba(15,23,42,0.95));border:1px solid rgba(168,85,247,0.5);border-radius:14px;padding:16px;box-shadow:0 8px 24px rgba(0,0,0,0.4);">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;">
                <div style="min-width:0;">
                  <div style="font-size:11px;font-weight:900;color:#c084fc;text-transform:uppercase;letter-spacing:0.5px;">💎 Patrimônio Total Acumulado</div>
                  <div style="font-size:24px;font-weight:900;color:#fff;margin-top:6px;">R$ ${totalNetWorth.toLocaleString('pt-BR')}</div>
                </div>
                <span style="font-size:24px;flex-shrink:0;">💎</span>
              </div>
              <div style="font-size:11px;color:#cbd5e1;margin-top:8px;line-height:1.4;">
                Caixa + Imóveis + Empresas + Garagem + Ações SAF
              </div>
            </div>

            <!-- CARD 2: DINHEIRO EM CAIXA (CONTA PESSOAL) -->
            <div style="min-width:0;box-sizing:border-box;background:linear-gradient(135deg,rgba(16,185,129,0.2),rgba(15,23,42,0.95));border:1px solid rgba(16,185,129,0.5);border-radius:14px;padding:16px;box-shadow:0 8px 24px rgba(0,0,0,0.4);">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;">
                <div style="min-width:0;">
                  <div style="font-size:11px;font-weight:900;color:#6ee7b7;text-transform:uppercase;letter-spacing:0.5px;">💵 Dinheiro em Caixa (Pessoal)</div>
                  <div style="font-size:24px;font-weight:900;color:#4ade80;margin-top:6px;">R$ ${personalBalance.toLocaleString('pt-BR')}</div>
                </div>
                <span style="font-size:24px;flex-shrink:0;">💵</span>
              </div>
              <div style="font-size:11px;color:#cbd5e1;margin-top:8px;line-height:1.4;">
                Saldo líquido para Bolsa SAF, bens e cursos CBF/UEFA
              </div>
            </div>

            <!-- CARD 3: GANHOS MENSAIS DE TUDO QUE É INVESTIDO -->
            <div style="min-width:0;box-sizing:border-box;background:linear-gradient(135deg,rgba(56,189,248,0.2),rgba(15,23,42,0.95));border:1px solid rgba(56,189,248,0.5);border-radius:14px;padding:16px;box-shadow:0 8px 24px rgba(0,0,0,0.4);">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;">
                <div style="min-width:0;">
                  <div style="font-size:11px;font-weight:900;color:#7dd3fc;text-transform:uppercase;letter-spacing:0.5px;">📊 Ganhos Mensais de Tudo</div>
                  <div style="font-size:24px;font-weight:900;color:#38bdf8;margin-top:6px;">+R$ ${totalMonthlyGains.toLocaleString('pt-BR')}/mês</div>
                </div>
                <span style="font-size:24px;flex-shrink:0;">📊</span>
              </div>
              <div style="font-size:11px;color:#cbd5e1;margin-top:8px;line-height:1.4;">
                Salário (R$ ${monthlySalary.toLocaleString('pt-BR')}) + Aluguéis + Negócios + SAF
              </div>
            </div>
          </div>

          <!-- BANNER DO PERFIL DO TREINADOR: PRESTÍGIO E BOTÕES DE ATALHO -->
          <div id="afm-manager-profile-banner" style="background:radial-gradient(circle at top left, #2e1065, #0f172a);border:1px solid #7c3aed;border-radius:14px;padding:16px 20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px;box-shadow:0 10px 25px rgba(0,0,0,0.4);width:100%;box-sizing:border-box;">
            <div style="display:flex;align-items:center;gap:14px;">
              <div style="width:48px;height:48px;border-radius:50%;background:#7c3aed;display:flex;align-items:center;justify-content:center;font-size:24px;box-shadow:0 0 15px rgba(124,58,237,0.6);">👔</div>
              <div>
                <div style="display:flex;align-items:center;gap:8px;">
                  <span class="pill" style="background:#7c3aed;color:#fff;font-weight:900;font-size:10px;text-transform:uppercase;">CONTA PESSOAL DO TÉCNICO</span>
                  <span style="font-size:11px;color:#94a3b8;">Clube Atual: <b style="color:#38bdf8;">${esc(userClubName)}</b></span>
                </div>
                <h2 style="margin:4px 0 2px 0;font-size:22px;color:#fff;font-weight:900;">Téc. ${esc(mp.name || 'Aquino')}</h2>
                <div style="font-size:12px;color:#cbd5e1;">
                  Prestígio Social: <b style="color:#facc15;">★ ${userPts} Pontos</b> | Clube: <b>${esc(userClubName)}</b>
                </div>
              </div>
            </div>

            <!-- SLOT CENTRAL: PRESTÍGIO + BOTÕES DE RANKING E CURSOS -->
            <div id="afm-top-prestige-center-panel" style="display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;">
              <div style="background:rgba(15,23,42,0.75);border:1px solid rgba(168,85,247,0.55);border-radius:12px;padding:8px 14px;text-align:left;">
                <div style="font-size:9px;font-weight:800;color:#cbd5e1;letter-spacing:0.6px;text-transform:uppercase;">NÍVEL DE PRESTÍGIO NO SAVE · ${userLicense.toUpperCase()}</div>
                <div style="font-size:13px;font-weight:900;color:#facc15;margin-top:2px;">⭐ Nível ${userLevel}/99 (${userPts} pts · ${userTitles} ${userTitles === 1 ? 'Título' : 'Títulos'})</div>
              </div>
              <button id="btn-open-save-coaches-rk" type="button" style="background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;border:1px solid rgba(255,255,255,0.25);border-radius:10px;padding:10px 14px;font-size:11px;font-weight:800;cursor:pointer;box-shadow:0 4px 14px rgba(124,58,237,0.45);white-space:nowrap;">
                🏆 VER RANKING & TODOS OS TÉCNICOS
              </button>
              <button id="btn-open-cbf-licenses" type="button" style="background:rgba(15,23,42,0.85);color:#38bdf8;border:1px solid rgba(56,189,248,0.45);border-radius:10px;padding:10px 14px;font-size:11px;font-weight:800;cursor:pointer;white-space:nowrap;">
                🎓 CURSOS & LICENÇAS (CBF & UEFA)
              </button>
            </div>

            <!-- DIREITA: PATRIMÔNIO LÍQUIDO E SALÁRIO -->
            <div style="text-align:right;">
              <div style="font-size:11px;color:#94a3b8;font-weight:700;text-transform:uppercase;">Patrimônio Pessoal Líquido</div>
              <div style="font-size:26px;font-weight:900;color:#4ade80;">R$ ${personalBalance.toLocaleString('pt-BR')}</div>
              <div style="font-size:11px;color:#38bdf8;">Salário: R$ ${monthlySalary.toLocaleString('pt-BR')}/mês</div>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;margin-top:-8px">
            <div style="background:#111827;border:1px solid rgba(56,189,248,.25);border-radius:10px;padding:12px 14px">
              <div style="font-size:10px;font-weight:800;color:#7dd3fc;letter-spacing:.5px;text-transform:uppercase">Salário recebido na temporada ${curYearSeason}</div>
              <div style="font-size:18px;font-weight:900;color:#fff;margin-top:4px">${previousSalaryEntries.length || previousSeasonRecord ? fmtMoney(previousSalary) : 'Sem registro'}</div>
              <div style="font-size:10px;color:#94a3b8;margin-top:3px">${previousSeasonRecord?.salaryMonths ?? previousSalaryEntries.length} pagamento(s) mensal(is) registrado(s)</div>
            </div>
            <div style="background:#111827;border:1px solid rgba(250,204,21,.25);border-radius:10px;padding:12px 14px">
              <div style="font-size:10px;font-weight:800;color:#facc15;letter-spacing:.5px;text-transform:uppercase">Prestígio atual</div>
              <div style="font-size:18px;font-weight:900;color:#fff;margin-top:4px">★ ${userPts} pontos</div>
              <div style="font-size:10px;color:#94a3b8;margin-top:3px">${previousSeasonRecord ? `Na temporada ${previousSeasonRecord.season}: nível ${previousSeasonRecord.prestigeScore}` : 'Atualizado pelo desempenho da carreira'}</div>
            </div>
          </div>

          <!-- NAVEGAÇÃO ENTRE AS 2 SUB-ABAS -->
          <div style="display:flex;gap:12px;margin:4px 0 2px 0;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:10px;">
            <button id="btnTabCareerTrainer" type="button" style="padding:12px 24px;border-radius:12px;font-weight:900;font-size:14px;cursor:pointer;border:none;background:${this.activeTab==='trainer'?'linear-gradient(135deg,#7c3aed,#9333ea)':'#1e293b'};color:#fff;box-shadow:${this.activeTab==='trainer'?'0 4px 15px rgba(124,58,237,0.4)':'none'};display:flex;align-items:center;gap:8px;transition:all 0.2s ease;">
              👔 Carreira do Treinador
            </button>
            <button id="btnTabCareerSaf" type="button" style="padding:12px 24px;border-radius:12px;font-weight:900;font-size:14px;cursor:pointer;border:none;background:${this.activeTab==='saf'?'linear-gradient(135deg,#2563eb,#3b82f6)':'#1e293b'};color:#fff;box-shadow:${this.activeTab==='saf'?'0 4px 15px rgba(37,99,235,0.4)':'none'};display:flex;align-items:center;gap:8px;transition:all 0.2s ease;">
              📈 Negócios & Bolsa de Valores SAF
            </button>
          </div>

          ${this.activeTab === 'trainer' ? `
            <!-- SUB-ABA 1: CARREIRA DO TREINADOR (IMÓVEIS, EMPRESAS, GARAGEM NA HORIZONTAL) -->
            
            <!-- SEÇÃO 1: PORTFÓLIO IMOBILIÁRIO (HORIZONTAL) -->
            <div style="background:#111827;border:1px solid #374151;border-radius:14px;padding:18px;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
                <div>
                  <h3 style="margin:0;font-size:16px;color:#fff;font-weight:900;">🏡 Portfólio Imobiliário do Treinador</h3>
                  <div style="font-size:11px;color:#9ca3af;">Imóveis de alto padrão que valorizam todo mês e geram renda passiva de aluguel.</div>
                </div>
              </div>
              <div class="afm-career-catalog-grid">
                ${REAL_ESTATE_CATALOG.map((prop) => {
                  const careerProps = state.career?.properties || {};
                  const fixItem = (typeof window !== 'undefined' && window.AFMCareerFix) ? window.AFMCareerFix.PROPERTIES_CATALOG.find(p => p.id === prop.id || (p.aliases && p.aliases.includes(prop.id))) : null;
                  const cProp = fixItem ? careerProps[fixItem.id] : careerProps[prop.id];
                  const propCount = (typeof cProp === 'number') ? cProp : (cProp?.count || ((mp.properties || []).some(p => p.id === prop.id) ? 1 : 0));
                  const owned = propCount > 0;
                  return `
                    <div style="min-width:0;box-sizing:border-box;background:#1f2937;border:1px solid ${owned ? '#10b981' : '#374151'};border-radius:10px;padding:14px;display:flex;flex-direction:column;justify-content:space-between;">
                      <div>
                        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                          <div style="font-size:24px;margin-bottom:4px;">${prop.icon}</div>
                          ${owned ? `<span class="pill" style="background:#065f46;color:#6ee7b7;font-weight:900;font-size:10px;">✓ POSSUI (${propCount})</span>` : ''}
                        </div>
                        <div style="font-size:13px;font-weight:900;color:#fff;">${esc(prop.name)}</div>
                        <div style="font-size:12px;color:#4ade80;font-weight:800;margin-top:2px;">R$ ${prop.cost.toLocaleString('pt-BR')}</div>
                        <div style="font-size:11px;color:#38bdf8;margin-top:4px;">+R$ ${prop.monthlyRent.toLocaleString('pt-BR')}/mês de aluguel</div>
                        <div style="font-size:10px;color:#9ca3af;margin-top:2px;">★ +${prop.prestige} Prestígio | Valorização: +${Math.round(prop.appreciationRate * 100)}%/ano</div>
                      </div>
                      <div style="display:flex;flex-direction:column;gap:6px;margin-top:12px;">
                        <button class="btn btnBuyProp" data-prop-id="${prop.id}" style="background:${owned ? '#059669' : '#7c3aed'};color:#fff;border:none;font-weight:800;padding:8px 12px;border-radius:6px;font-size:11px;cursor:pointer;">
                          ${owned ? '➕ Comprar Mais (+1 Unidade)' : '🔑 Comprar Imóvel'}
                        </button>
                        ${owned ? `
                          <button class="btn btnSellProp" data-prop-id="${prop.id}" style="background:#7f1d1d;color:#fca5a5;border:1px solid #ef4444;font-weight:800;padding:6px 12px;border-radius:6px;font-size:11px;cursor:pointer;">
                            💰 Vender (85% do valor)
                          </button>
                        ` : ''}
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- SEÇÃO 2: EMPREENDIMENTOS & NEGÓCIOS (HORIZONTAL) -->
            <div style="background:#111827;border:1px solid #374151;border-radius:14px;padding:18px;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
                <div>
                  <h3 style="margin:0;font-size:16px;color:#fff;font-weight:900;">💼 Empreendimentos & Negócios</h3>
                  <div style="font-size:11px;color:#9ca3af;">Monte sua rede comercial extracampo com lucros mensais e bônus reais para o seu clube.</div>
                </div>
              </div>
              <div class="afm-career-catalog-grid">
                ${LIFE_BUSINESS_CATALOG.map((biz) => {
                  const careerBiz = state.career?.businesses || {};
                  const fixBiz = (typeof window !== 'undefined' && window.AFMCareerFix) ? window.AFMCareerFix.BUSINESSES_CATALOG.find(b => b.id === biz.id || (b.aliases && b.aliases.includes(biz.id))) : null;
                  const cLvl = fixBiz ? Number(careerBiz[fixBiz.id] || 0) : Number(careerBiz[biz.id] || 0);
                  const existing = (mp.businesses || []).find((b) => b.id === biz.id || b.typeId === biz.id);
                  const lvl = Math.max(cLvl, existing?.level || 0);
                  return `
                    <div style="min-width:0;box-sizing:border-box;background:#1f2937;border:1px solid ${lvl > 0 ? '#38bdf8' : '#374151'};border-radius:10px;padding:14px;display:flex;flex-direction:column;justify-content:space-between;">
                      <div>
                        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                          <div style="font-size:24px;margin-bottom:4px;">${biz.icon}</div>
                          ${lvl > 0 ? `<span class="pill" style="background:#0369a1;color:#7dd3fc;font-weight:900;font-size:10px;">NÍVEL ${lvl}/5</span>` : ''}
                        </div>
                        <div style="font-size:13px;font-weight:900;color:#fff;">${esc(biz.name)}</div>
                        <div style="font-size:11px;color:#c084fc;font-weight:800;margin-top:2px;">${esc(biz.bonusText)}</div>
                        <div style="font-size:12px;color:#4ade80;font-weight:800;margin-top:4px;">Lucro est.: R$ ${(existing?.monthlyProfit || biz.monthlyProfit).toLocaleString('pt-BR')}/mês</div>
                        <div style="font-size:10px;color:#9ca3af;margin-top:2px;">Status: ${lvl > 0 ? `Nível ${lvl}/5` : 'Não inaugurado'}</div>
                      </div>
                      <button class="btn btnBuyBiz" data-biz-id="${biz.id}" style="margin-top:12px;background:${lvl > 0 ? '#0284c7' : '#2563eb'};color:#fff;border:none;font-weight:800;padding:8px 12px;border-radius:6px;font-size:11px;cursor:${lvl >= 5 ? 'default' : 'pointer'};" ${lvl >= 5 ? 'disabled' : ''}>
                        ${lvl === 0 ? `🚀 Abrir (R$ ${biz.cost.toLocaleString('pt-BR')})` : lvl >= 5 ? '★ Nível Máximo (5/5)' : `⚡ Expandir Nível ${lvl + 1}`}
                      </button>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- SEÇÃO 3: GARAGEM DE LUXO & TRANSPORTE VIP (HORIZONTAL) -->
            <div style="background:#111827;border:1px solid #374151;border-radius:14px;padding:18px;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
                <div>
                  <h3 style="margin:0;font-size:16px;color:#fff;font-weight:900;">🏎️ Garagem de Luxo & Transporte VIP</h3>
                  <div style="font-size:11px;color:#9ca3af;">Veículos de alta cilindrada e aviação executiva que elevam seu prestígio mundial.</div>
                </div>
              </div>
              <div class="afm-career-catalog-grid">
                ${LUXURY_GARAGE_CATALOG.map((veh) => {
                  const careerVeh = state.career?.vehicles || {};
                  const fixVeh = (typeof window !== 'undefined' && window.AFMCareerFix) ? window.AFMCareerFix.VEHICLES_CATALOG.find(v => v.id === veh.id || (v.aliases && v.aliases.includes(veh.id))) : null;
                  const cOwned = fixVeh ? Boolean(careerVeh[fixVeh.id]) : Boolean(careerVeh[veh.id]);
                  const owned = cOwned || (mp.vehicles || []).some((v) => v.id === veh.id);
                  return `
                    <div style="min-width:0;box-sizing:border-box;background:#1f2937;border:1px solid ${owned ? '#f59e0b' : '#374151'};border-radius:10px;padding:14px;display:flex;flex-direction:column;justify-content:space-between;">
                      <div>
                        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                          <div style="font-size:24px;margin-bottom:4px;">${veh.icon}</div>
                          ${owned ? `<span class="pill" style="background:#78350f;color:#fde68a;font-weight:900;font-size:10px;">✓ NA GARAGEM</span>` : ''}
                        </div>
                        <div style="font-size:13px;font-weight:900;color:#fff;">${esc(veh.name)}</div>
                        <div style="font-size:12px;color:#facc15;font-weight:800;margin-top:2px;">R$ ${veh.cost.toLocaleString('pt-BR')}</div>
                        <div style="font-size:11px;color:#cbd5e1;margin-top:4px;">★ +${veh.prestige} Prestígio | ${esc(veh.bonusText)}</div>
                      </div>
                      <div style="display:flex;flex-direction:column;gap:6px;margin-top:12px;">
                        <button class="btn btnBuyVeh" data-veh-id="${veh.id}" ${owned ? 'disabled' : ''} style="background:${owned ? '#78350f' : '#d97706'};color:#fff;border:none;font-weight:800;padding:8px 12px;border-radius:6px;font-size:11px;cursor:${owned?'default':'pointer'};">
                          ${owned ? '✓ Na Garagem VIP' : '🏎️ Comprar'}
                        </button>
                        ${owned ? `
                          <button class="btn btnSellVeh" data-veh-id="${veh.id}" style="background:#7f1d1d;color:#fca5a5;border:1px solid #ef4444;font-weight:800;padding:6px 12px;border-radius:6px;font-size:11px;cursor:pointer;">
                            💰 Vender (75% do valor)
                          </button>
                        ` : ''}
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          ` : `
            <!-- SUB-ABA 2: NEGÓCIOS & BOLSA DE VALORES SAF -->

            <!-- SEÇÃO 1: SIMULADOR DE TRANSFORMAÇÃO DO CLUBE EM SAF -->
            ${isAlreadySaf ? `
              <div style="background:linear-gradient(135deg,#064e3b,#0f172a);border:1px solid #10b981;border-radius:14px;padding:20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px;box-shadow:0 10px 25px rgba(0,0,0,0.4);">
                <div>
                  <div style="display:flex;align-items:center;gap:8px;">
                    <span style="font-size:24px;">🏛️</span>
                    <span class="pill" style="background:#10b981;color:#000;font-weight:900;font-size:11px;">STATUS DO CLUBE: SAF PROFISSIONAL ATIVA</span>
                  </div>
                  <h3 style="margin:8px 0 4px 0;font-size:18px;color:#fff;font-weight:900;">${esc(userClubName)} SAF — Empresa Constituída</h3>
                  <div style="font-size:12px;color:#cbd5e1;max-width:680px;line-height:1.5;">
                    O clube opera como Sociedade Anônima do Futebol sob governança corporativa da Lei da SAF, atraindo aportes de investidores e listado oficialmente no Pregão da Bolsa SAF abaixo!
                  </div>
                </div>
                <div style="text-align:right;">
                  <div style="font-size:11px;color:#94a3b8;font-weight:700;">VALUATION ESTIMADO</div>
                  <div style="font-size:22px;font-weight:900;color:#38bdf8;">R$ ${totalValuation.toLocaleString('pt-BR')}</div>
                  <div style="font-size:11px;color:#4ade80;">Cotas Abertas no Pregão SAF</div>
                </div>
              </div>
            ` : `
              <div style="background:linear-gradient(135deg,#1e1b4b,#0f172a);border:1px solid #7c3aed;border-radius:14px;padding:20px;box-shadow:0 10px 25px rgba(0,0,0,0.4);">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px;margin-bottom:14px;">
                  <div>
                    <div style="display:flex;align-items:center;gap:8px;">
                      <span style="font-size:24px;">🗳️</span>
                      <span class="pill" style="background:#7c3aed;color:#fff;font-weight:900;font-size:11px;">ASSEMBLEIA GERAL DOS SÓCIOS & CONSELHEIROS</span>
                    </div>
                    <h3 style="margin:8px 0 4px 0;font-size:18px;color:#fff;font-weight:900;">Transformar o ${esc(userClubName)} em SAF (Sociedade Anônima do Futebol)</h3>
                    <div style="font-size:12px;color:#cbd5e1;max-width:720px;line-height:1.5;">
                      Atualmente o ${esc(userClubName)} é uma Associação Civil. Ao aprovar a SAF no Conselho Deliberativo (300 conselheiros votantes), o clube recebe um aporte milionário imediato em caixa e passa a ter ações negociadas na Bolsa SAF!
                    </div>
                  </div>
                </div>

                <!-- MODELOS DE CAMPANHA (HORIZONTAL) -->
                <div style="display:flex;flex-direction:row;gap:14px;overflow-x:auto;padding-bottom:10px;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;margin:16px 0;">
                  <div class="safModelCard" data-model="50plus1" style="flex:1 0 260px;min-width:260px;background:#1f2937;border:2px solid ${this.selectedSafModel==='50plus1'?'#10b981':'#374151'};border-radius:10px;padding:14px;cursor:pointer;">
                    <div style="font-weight:900;color:#10b981;font-size:13px;">Modelo 1: Venda Minoritária (50%+1 dos Sócios)</div>
                    <div style="font-size:18px;font-weight:900;color:#fff;margin:6px 0;">Aporte: R$ 90.000.000</div>
                    <div style="font-size:11px;color:#cbd5e1;line-height:1.4;">O clube mantém controle societário. Aprovação mais fácil no Conselho (~80% de chances).</div>
                  </div>

                  <div class="safModelCard" data-model="strategic70" style="flex:1 0 260px;min-width:260px;background:#1f2937;border:2px solid ${this.selectedSafModel==='strategic70'?'#38bdf8':'#374151'};border-radius:10px;padding:14px;cursor:pointer;">
                    <div style="font-weight:900;color:#38bdf8;font-size:13px;">Modelo 2: Investimento Estratégico (70% do Futebol)</div>
                    <div style="font-size:18px;font-weight:900;color:#fff;margin:6px 0;">Aporte: R$ 220.000.000</div>
                    <div style="font-size:11px;color:#cbd5e1;line-height:1.4;">Governança compartilhada com fundo esportivo (~62% de chances de aprovação).</div>
                  </div>

                  <div class="safModelCard" data-model="major90" style="flex:1 0 260px;min-width:260px;background:#1f2937;border:2px solid ${this.selectedSafModel==='major90'?'#f59e0b':'#374151'};border-radius:10px;padding:14px;cursor:pointer;">
                    <div style="font-weight:900;color:#f59e0b;font-size:13px;">Modelo 3: Aporte Multibilionário (90% do Futebol)</div>
                    <div style="font-size:18px;font-weight:900;color:#fff;margin:6px 0;">Aporte: R$ 450.000.000</div>
                    <div style="font-size:11px;color:#cbd5e1;line-height:1.4;">Aporte maciço para reestruturar dívidas e elenco (~45% de chances de aprovação).</div>
                  </div>
                </div>

                <div id="safVotingResultArea" style="margin-top:14px;">
                  <button class="btn primary" id="btnStartSafVoting" type="button" style="background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;font-weight:900;padding:12px 24px;border-radius:10px;font-size:13px;cursor:pointer;box-shadow:0 4px 15px rgba(16,185,129,0.3);">
                    🗳️ Convocar Assembleia e Iniciar Votação dos 300 Conselheiros
                  </button>
                </div>
              </div>
            `}

            <!-- SEÇÃO 2: PREGÃO DA BOLSA DE VALORES SAF -->
            <div id="pregao-saf-full-table" style="background:#111827;border:1px solid #374151;border-radius:14px;padding:18px;">
              <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:14px;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:10px;">
                <div>
                  <h3 style="margin:0;font-size:16px;color:#fff;font-weight:900;display:flex;align-items:center;gap:8px;">
                    🏛️ Pregão da Bolsa de Valores SAF
                    <span class="pill" style="background:#065f46;color:#6ee7b7;font-weight:900;font-size:10px;">🟢 PREGÃO ABERTO</span>
                  </h3>
                  <div style="font-size:11px;color:#9ca3af;">Compre e venda ações das SAFs brasileiras com confirmação e cálculo instantâneo do valor gasto! As cotações oscilam a cada rodada.</div>
                </div>
                <div style="font-size:12px;color:#cbd5e1;">
                  Seu Saldo em Conta: <b style="color:#4ade80;">R$ ${personalBalance.toLocaleString('pt-BR')}</b>
                </div>
              </div>

              <!-- TABELA DO PREGÃO -->
              <div style="overflow-x:auto;">
                <table style="width:100%;border-collapse:collapse;font-size:13px;color:#e2e8f0;">
                  <thead>
                    <tr style="border-bottom:1px solid rgba(255,255,255,0.1);color:#94a3b8;font-size:11px;text-align:left;">
                      <th style="padding:10px 8px;">CLUBE SAF</th>
                      <th style="padding:10px 8px;">TICKER</th>
                      <th style="padding:10px 8px;">COTAÇÃO</th>
                      <th style="padding:10px 8px;">VARIAÇÃO</th>
                      <th style="padding:10px 8px;">DIV. YIELD</th>
                      <th style="padding:10px 8px;">SUAS AÇÕES</th>
                      <th style="padding:10px 8px;text-align:right;">CONFIRMAR COMPRA / CONFIRMAR VENDA</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${safList.map((saf) => {
                      const holding = mp.safPortfolio[saf.id] || { sharesCount: 0 };
                      const count = holding.sharesCount || 0;
                      const holdingVal = Math.round(count * saf.sharePrice);
                      const isPositive = (saf.change || 0) >= 0;
                      return `
                        <tr style="border-bottom:1px solid rgba(255,255,255,0.05);background:${count > 0 ? 'rgba(37,99,235,0.08)' : 'transparent'};">
                          <td style="padding:10px 8px;font-weight:800;color:#fff;">
                            <span style="margin-right:6px;">${saf.logo || '🛡️'}</span>${esc(saf.name)}
                          </td>
                          <td style="padding:10px 8px;font-weight:900;color:#38bdf8;">${esc(saf.ticker)}</td>
                          <td style="padding:10px 8px;font-weight:900;color:#fff;">R$ ${saf.sharePrice.toFixed(2)}</td>
                          <td style="padding:10px 8px;font-weight:800;color:${isPositive ? '#22c55e' : '#ef4444'};">
                            ${isPositive ? '▲ +' : '▼ '}${saf.change || 0}%
                          </td>
                          <td style="padding:10px 8px;font-size:11px;color:#facc15;">
                            ${((saf.dividendYield || 0.008) * 100).toFixed(1)}%/mês
                          </td>
                          <td style="padding:10px 8px;font-weight:800;color:${count > 0 ? '#4ade80' : '#94a3b8'};">
                            ${count > 0 ? `${count.toLocaleString('pt-BR')} ações (R$ ${holdingVal.toLocaleString('pt-BR')})` : '0 ações'}
                          </td>
                          <td style="padding:10px 8px;text-align:right;">
                            <div style="display:flex;gap:6px;justify-content:flex-end;align-items:center;flex-wrap:wrap;">
                              <button class="btn btnOpenTradeModal btnConfirmBuyRow" data-action="buy" data-saf-id="${saf.id}" data-count="100" type="button" style="background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:1px solid #10b981;padding:7px 13px;border-radius:8px;font-size:11px;font-weight:900;cursor:pointer;display:inline-flex;align-items:center;gap:5px;box-shadow:0 3px 10px rgba(16,185,129,0.35);transition:all 0.15s ease;" title="Confirmar Compra de ações de ${saf.name}">
                                🛒 Confirmar Compra
                              </button>
                              ${count > 0 ? `
                                <button class="btn btnOpenTradeModal btnConfirmSellRow" data-action="sell" data-saf-id="${saf.id}" data-count="${Math.min(100, count)}" type="button" style="background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;border:1px solid #ef4444;padding:7px 13px;border-radius:8px;font-size:11px;font-weight:900;cursor:pointer;display:inline-flex;align-items:center;gap:5px;box-shadow:0 3px 10px rgba(239,68,68,0.35);transition:all 0.15s ease;" title="Confirmar Venda de ações de ${saf.name}">
                                  💰 Confirmar Venda (${count})
                                </button>
                              ` : `
                                <button class="btn btnOpenTradeModal btnConfirmSellRow" data-action="sell" data-saf-id="${saf.id}" data-count="0" type="button" style="background:rgba(239,68,68,0.12);color:#fca5a5;border:1px solid rgba(239,68,68,0.28);padding:7px 13px;border-radius:8px;font-size:11px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:5px;" title="Clique para ver ordem de venda ou comprar ações">
                                  💰 Confirmar Venda (0)
                                </button>
                              `}
                            </div>
                          </td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- SEÇÃO 3: INVESTIDORES DO MERCADO, PROPOSTAS P2P & LIVRO DE NEGOCIAÇÕES -->
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(360px, 1fr));gap:14px;">
              
              <!-- HUB P2P: PROPOSTAS DE INVESTIDORES + NOSSAS AÇÕES À VENDA + ÚLTIMAS COMPRAS E VENDAS -->
              <div style="background:#111827;border:1px solid #374151;border-radius:14px;padding:18px;">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px;margin-bottom:12px;">
                  <div>
                    <h3 style="margin:0 0 4px 0;font-size:17px;color:#fff;font-weight:900;display:flex;align-items:center;gap:8px;">
                      🤝 Investidores de IA & Mercado Privado P2P
                    </h3>
                    <div style="font-size:11px;color:#9ca3af;">
                      Negociações diretas com magnatas do futebol. Compre lotes com desconto, venda com ágio ou publique suas próprias ações à venda!
                    </div>
                  </div>
                </div>

                <!-- SUB-ABAS DE NAVEGAÇÃO -->
                <div style="display:flex;gap:8px;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:12px;margin-bottom:14px;flex-wrap:wrap;">
                  <button type="button" class="btnP2PNavTab" data-p2p-tab="proposals" style="background:${(this.activeP2PTab || 'proposals') === 'proposals' ? 'linear-gradient(135deg,#7c3aed,#6d28d9)' : '#1f2937'};color:${(this.activeP2PTab || 'proposals') === 'proposals' ? '#fff' : '#cbd5e1'};border:1px solid ${(this.activeP2PTab || 'proposals') === 'proposals' ? '#a855f7' : '#374151'};padding:8px 14px;border-radius:8px;font-size:11px;font-weight:900;cursor:pointer;display:inline-flex;align-items:center;gap:6px;box-shadow:${(this.activeP2PTab || 'proposals') === 'proposals' ? '0 4px 14px rgba(124,58,237,0.4)' : 'none'};">
                    🤝 Propostas dos Investidores (${p2pOffers.length})
                  </button>
                  <button type="button" class="btnP2PNavTab" data-p2p-tab="my_offers" style="background:${(this.activeP2PTab || 'proposals') === 'my_offers' ? 'linear-gradient(135deg,#3b82f6,#2563eb)' : '#1f2937'};color:${(this.activeP2PTab || 'proposals') === 'my_offers' ? '#fff' : '#cbd5e1'};border:1px solid ${(this.activeP2PTab || 'proposals') === 'my_offers' ? '#60a5fa' : '#374151'};padding:8px 14px;border-radius:8px;font-size:11px;font-weight:900;cursor:pointer;display:inline-flex;align-items:center;gap:6px;box-shadow:${(this.activeP2PTab || 'proposals') === 'my_offers' ? '0 4px 14px rgba(59,130,246,0.4)' : 'none'};">
                    📢 Colocar Nossas Ações à Venda (${userSellOrders.length})
                  </button>
                  <button type="button" class="btnP2PNavTab" data-p2p-tab="trades" style="background:${(this.activeP2PTab || 'proposals') === 'trades' ? 'linear-gradient(135deg,#10b981,#059669)' : '#1f2937'};color:${(this.activeP2PTab || 'proposals') === 'trades' ? '#fff' : '#cbd5e1'};border:1px solid ${(this.activeP2PTab || 'proposals') === 'trades' ? '#34d399' : '#374151'};padding:8px 14px;border-radius:8px;font-size:11px;font-weight:900;cursor:pointer;display:inline-flex;align-items:center;gap:6px;box-shadow:${(this.activeP2PTab || 'proposals') === 'trades' ? '0 4px 14px rgba(16,185,129,0.4)' : 'none'};">
                    📊 Últimas Compras & Vendas (${(state.safMarketTrades || []).length})
                  </button>
                </div>

                <!-- CONTEÚDO DA SUB-ABA 1: PROPOSTAS DE INVESTIDORES -->
                ${(this.activeP2PTab || 'proposals') === 'proposals' ? `
                  <div style="display:flex;flex-direction:column;gap:14px;">
                    
                    <!-- BLOCO A: INVESTIDORES VENDENDO COM DESCONTO (PRA GENTE COMPRAR) -->
                    <div>
                      <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
                        <span style="font-size:15px;">🛒</span>
                        <h4 style="margin:0;font-size:13px;color:#34d399;font-weight:900;text-transform:uppercase;">
                          Investidores Vendendo Ações (Pra Você Comprar com Desconto)
                        </h4>
                      </div>
                      <div style="font-size:11px;color:#9ca3af;margin-bottom:10px;">
                        Magnatas liquidando lotes abaixo da cotação de mercado. Aproveite para adquirir participações com desconto!
                      </div>
                      ${p2pOffers.filter(o => o.type === 'investor_selling').length > 0 ? p2pOffers.filter(o => o.type === 'investor_selling').map(o => `
                        <div style="background:#1f2937;border:1px solid #10b981;border-radius:10px;padding:14px;margin-bottom:10px;box-shadow:0 4px 12px rgba(16,185,129,0.15);">
                          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
                            <div style="display:flex;align-items:center;gap:10px;">
                              <span style="font-size:24px;">${o.magnateAvatar || '💼'}</span>
                              <div>
                                <div style="font-size:13px;font-weight:900;color:#fff;">${esc(o.magnateName)}</div>
                                <div style="font-size:10px;color:#cbd5e1;">${esc(o.magnateEntity)}</div>
                              </div>
                            </div>
                            <span class="pill" style="background:#065f46;color:#6ee7b7;font-size:9px;font-weight:900;">
                              🟢 OFERTA COM DESCONTO (-${o.discountPct}%)
                            </span>
                          </div>
                          <div style="font-size:12px;color:#cbd5e1;line-height:1.4;margin-bottom:10px;">
                            ${o.desc}
                          </div>
                          <div style="display:flex;justify-content:space-between;align-items:center;background:#111827;padding:8px 12px;border-radius:8px;margin-bottom:10px;font-size:11px;">
                            <div>
                              <span style="color:#94a3b8;">Cotação Normal: </span>
                              <s style="color:#ef4444;">R$ ${(o.normalPrice || 0).toLocaleString('pt-BR')}</s>
                            </div>
                            <div>
                              <span style="color:#94a3b8;">Preço Promocional: </span>
                              <b style="color:#6ee7b7;font-size:14px;">R$ ${(o.offerPrice || 0).toLocaleString('pt-BR')}</b>
                            </div>
                          </div>
                          <div style="display:flex;gap:8px;justify-content:flex-end;">
                            <button class="btn btnAcceptP2P" data-offer-id="${o.id}" type="button" style="background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;font-weight:900;padding:8px 14px;border-radius:6px;font-size:11px;cursor:pointer;box-shadow:0 2px 8px rgba(16,185,129,0.3);">
                              🛒 Confirmar Compra de Lote (-${o.discountPct}% Desconto)
                            </button>
                            <button class="btn btnRejectP2P" data-offer-id="${o.id}" type="button" style="background:#374151;color:#cbd5e1;border:1px solid #4b5563;font-weight:800;padding:8px 12px;border-radius:6px;font-size:11px;cursor:pointer;">
                              Recusar
                            </button>
                          </div>
                        </div>
                      `).join('') : `
                        <div style="padding:12px;text-align:center;color:#94a3b8;font-size:11px;background:#1f2937;border-radius:8px;border:1px dashed #374151;">
                          Nenhum magnata liquidando lotes com desconto no momento. Novas ofertas surgirão na próxima rodada!
                        </div>
                      `}
                    </div>

                    <!-- BLOCO B: INVESTIDORES COMPRANDO SUAS AÇÕES COM ÁGIO -->
                    <div>
                      <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
                        <span style="font-size:15px;">💎</span>
                        <h4 style="margin:0;font-size:13px;color:#c084fc;font-weight:900;text-transform:uppercase;">
                          Investidores Comprando Suas Ações (Com Ágio para Você Lucrar)
                        </h4>
                      </div>
                      <div style="font-size:11px;color:#9ca3af;margin-bottom:10px;">
                        Magnatas oferecendo propostas acima da Bolsa para comprar ações da sua carteira. Venda e lucre imediatamente!
                      </div>
                      ${p2pOffers.filter(o => o.type === 'investor_buying').length > 0 ? p2pOffers.filter(o => o.type === 'investor_buying').map(o => {
                        const userHolding = (userPortfolio[o.clubId] && userPortfolio[o.clubId].sharesCount) || 0;
                        const hasEnough = userHolding >= o.sharesCount;
                        return `
                          <div style="background:#1f2937;border:1px solid #7c3aed;border-radius:10px;padding:14px;margin-bottom:10px;box-shadow:0 4px 12px rgba(124,58,237,0.15);">
                            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
                              <div style="display:flex;align-items:center;gap:10px;">
                                <span style="font-size:24px;">${o.magnateAvatar || '💼'}</span>
                                <div>
                                  <div style="font-size:13px;font-weight:900;color:#fff;">${esc(o.magnateName)}</div>
                                  <div style="font-size:10px;color:#cbd5e1;">${esc(o.magnateEntity)}</div>
                                </div>
                              </div>
                              <span class="pill" style="background:#581c87;color:#d8b4fe;font-size:9px;font-weight:900;">
                                💎 PROPOSTA COM ÁGIO (+${o.agioPct}%)
                              </span>
                            </div>
                            <div style="font-size:12px;color:#cbd5e1;line-height:1.4;margin-bottom:10px;">
                              ${o.desc}
                            </div>
                            <div style="display:flex;justify-content:space-between;align-items:center;background:#111827;padding:8px 12px;border-radius:8px;margin-bottom:10px;font-size:11px;">
                              <div>
                                <span style="color:#94a3b8;">Valor a Receber com Ágio: </span>
                                <b style="color:#4ade80;font-size:14px;">+R$ ${(o.offerPrice || 0).toLocaleString('pt-BR')}</b>
                              </div>
                              <div style="font-size:11px;color:${hasEnough ? '#4ade80' : '#f87171'};font-weight:800;">
                                ${hasEnough ? `✓ Você possui ${userHolding} ações` : `⚠️ Você possui apenas ${userHolding} ações`}
                              </div>
                            </div>
                            <div style="display:flex;gap:8px;justify-content:flex-end;align-items:center;">
                              ${hasEnough ? `
                                <button class="btn btnAcceptP2P" data-offer-id="${o.id}" type="button" style="background:linear-gradient(135deg,#7c3aed,#6d28d9);color:#fff;border:none;font-weight:900;padding:8px 14px;border-radius:6px;font-size:11px;cursor:pointer;box-shadow:0 2px 8px rgba(124,58,237,0.3);">
                                  💰 Confirmar Venda com Ágio (+${o.agioPct}%)
                                </button>
                              ` : `
                                <button type="button" class="btnGoToPregao" style="background:rgba(124,58,237,0.15);color:#c084fc;border:1px solid rgba(168,85,247,0.3);font-weight:800;padding:8px 12px;border-radius:6px;font-size:11px;cursor:pointer;" title="Compre ações no pregão para aceitar esta proposta">
                                  🛒 Comprar Ações no Pregão
                                </button>
                              `}
                              <button class="btn btnRejectP2P" data-offer-id="${o.id}" type="button" style="background:#374151;color:#cbd5e1;border:1px solid #4b5563;font-weight:800;padding:8px 12px;border-radius:6px;font-size:11px;cursor:pointer;">
                                Recusar
                              </button>
                            </div>
                          </div>
                        `;
                      }).join('') : `
                        <div style="padding:12px;text-align:center;color:#94a3b8;font-size:11px;background:#1f2937;border-radius:8px;border:1px dashed #374151;">
                          Nenhum investidor buscando ações da sua carteira no momento.
                        </div>
                      `}
                    </div>
                  </div>
                ` : ''}

                <!-- CONTEÚDO DA SUB-ABA 2: COLOCAR NOSSAS AÇÕES À VENDA (PROPOSTA DO TREINADOR) -->
                ${(this.activeP2PTab || 'proposals') === 'my_offers' ? `
                  <div style="display:flex;flex-direction:column;gap:14px;">
                    <div>
                      <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
                        <span style="font-size:16px;">📢</span>
                        <h4 style="margin:0;font-size:14px;color:#60a5fa;font-weight:900;text-transform:uppercase;">
                          Publicar Proposta de Venda das Nossas Ações
                        </h4>
                      </div>
                      <div style="font-size:11px;color:#9ca3af;margin-bottom:12px;">
                        Escolha um clube SAF da sua carteira, defina a quantidade de ações e a margem de ágio que deseja cobrar dos investidores!
                      </div>

                      ${ownedClubEntries.length === 0 ? `
                        <div style="background:#1f2937;border:1px dashed #3b82f6;border-radius:10px;padding:18px;text-align:center;">
                          <div style="font-size:32px;margin-bottom:6px;">📦</div>
                          <div style="font-size:13px;font-weight:900;color:#fff;">Sua Carteira de Ações SAF está Vazia</div>
                          <div style="font-size:11px;color:#9ca3af;margin:6px auto 14px auto;max-width:380px;line-height:1.4;">
                            Para criar propostas de venda para outros investidores, você precisa primeiro adquirir ações no Pregão da Bolsa SAF acima!
                          </div>
                          <button type="button" class="btnGoToPregao" style="background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;padding:9px 18px;border-radius:8px;font-weight:900;font-size:12px;cursor:pointer;">
                            🛒 Ir para o Pregão da Bolsa SAF
                          </button>
                        </div>
                      ` : `
                        <div style="background:#1f2937;border:1px solid #3b82f6;border-radius:12px;padding:16px;box-shadow:0 4px 14px rgba(59,130,246,0.15);">
                          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:12px;margin-bottom:12px;">
                            
                            <!-- 1. CLUBE SAF -->
                            <div>
                              <label style="font-size:11px;font-weight:800;color:#93c5fd;display:block;margin-bottom:4px;">
                                1. Selecione o Clube SAF em Carteira:
                              </label>
                              <select id="userSellSafSelect" style="width:100%;background:#111827;color:#fff;border:1px solid #374151;border-radius:8px;padding:9px 10px;font-size:12px;font-weight:700;">
                                ${ownedClubEntries.map(e => `
                                  <option value="${e.saf.id}" data-share-price="${e.saf.sharePrice}" data-max-shares="${e.count}">
                                    ${esc(e.saf.name)} (${esc(e.saf.ticker)}) — ${e.count.toLocaleString('pt-BR')} ações (Bolsa: R$ ${e.saf.sharePrice.toFixed(2)})
                                  </option>
                                `).join('')}
                              </select>
                            </div>

                            <!-- 2. QUANTIDADE -->
                            <div>
                              <label style="font-size:11px;font-weight:800;color:#93c5fd;display:block;margin-bottom:4px;">
                                2. Quantidade de Ações:
                              </label>
                              <input id="userSellQtyInput" type="number" min="1" max="${ownedClubEntries[0].count}" value="${Math.min(100, ownedClubEntries[0].count)}" style="width:100%;box-sizing:border-box;background:#111827;color:#fff;border:1px solid #374151;border-radius:8px;padding:8px 10px;font-size:12px;font-weight:800;">
                              <div style="display:flex;gap:4px;margin-top:6px;flex-wrap:wrap;">
                                <button type="button" class="btnUserSellPreset" data-preset="50" style="background:#374151;color:#cbd5e1;border:none;padding:3px 8px;border-radius:4px;font-size:10px;font-weight:800;cursor:pointer;">50</button>
                                <button type="button" class="btnUserSellPreset" data-preset="100" style="background:#374151;color:#cbd5e1;border:none;padding:3px 8px;border-radius:4px;font-size:10px;font-weight:800;cursor:pointer;">100</button>
                                <button type="button" class="btnUserSellPreset" data-preset="250" style="background:#374151;color:#cbd5e1;border:none;padding:3px 8px;border-radius:4px;font-size:10px;font-weight:800;cursor:pointer;">250</button>
                                <button type="button" class="btnUserSellPreset" data-preset="all" style="background:#2563eb;color:#fff;border:none;padding:3px 8px;border-radius:4px;font-size:10px;font-weight:800;cursor:pointer;">Tudo</button>
                              </div>
                            </div>

                            <!-- 3. MARGEM DE ÁGIO -->
                            <div>
                              <label style="font-size:11px;font-weight:800;color:#93c5fd;display:block;margin-bottom:4px;">
                                3. Margem de Ágio Desejada:
                              </label>
                              <select id="userSellAgioSelect" style="width:100%;background:#111827;color:#fff;border:1px solid #374151;border-radius:8px;padding:9px 10px;font-size:12px;font-weight:700;">
                                <option value="5">+5% de Ágio (Venda Rápida)</option>
                                <option value="10">+10% de Ágio</option>
                                <option value="15" selected>+15% de Ágio (Recomendado)</option>
                                <option value="20">+20% de Ágio</option>
                                <option value="25">+25% de Ágio (Lucro Máximo)</option>
                              </select>
                            </div>
                          </div>

                          <!-- 4. BOX DE CÁLCULO DINÂMICO -->
                          <div id="userSellCalcBox" style="background:#111827;border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:10px 14px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                            <!-- Calculado dinamicamente via JS -->
                          </div>

                          <div style="display:flex;justify-content:flex-end;">
                            <button id="btnPublishUserSellOrder" type="button" style="background:linear-gradient(135deg,#3b82f6,#2563eb);color:#fff;border:none;padding:10px 18px;border-radius:8px;font-size:12px;font-weight:900;cursor:pointer;display:inline-flex;align-items:center;gap:6px;box-shadow:0 3px 10px rgba(59,130,246,0.35);">
                              📢 Publicar Proposta de Venda para Investidores
                            </button>
                          </div>
                        </div>
                      `}
                    </div>

                    <!-- MINHAS PROPOSTAS PUBLICADAS -->
                    <div style="margin-top:6px;">
                      <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
                        <span style="font-size:15px;">📋</span>
                        <h4 style="margin:0;font-size:13px;color:#fff;font-weight:900;text-transform:uppercase;">
                          Suas Propostas de Venda Publicadas no Mercado (${userSellOrders.length})
                        </h4>
                      </div>
                      ${userSellOrders.length > 0 ? userSellOrders.map(ord => `
                        <div style="background:#1f2937;border:1px solid #3b82f6;border-radius:10px;padding:12px 14px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
                          <div>
                            <div style="display:flex;align-items:center;gap:8px;">
                              <span class="pill" style="background:#1e3a8a;color:#93c5fd;font-size:9px;font-weight:900;">
                                📢 OFERTA ABERTA (+${ord.agioPct}% ÁGIO)
                              </span>
                              <b style="color:#fff;font-size:13px;">${esc(ord.clubName)} (${esc(ord.ticker)})</b>
                            </div>
                            <div style="font-size:11px;color:#cbd5e1;margin-top:4px;">
                              ${ord.sharesCount.toLocaleString('pt-BR')} ações pedindo R$ ${ord.askingPricePerShare.toFixed(2)} cada (Cotação base: R$ ${ord.basePrice.toFixed(2)})
                            </div>
                          </div>
                          <div style="text-align:right;">
                            <div style="font-size:14px;font-weight:900;color:#4ade80;">
                              +R$ ${ord.totalAskingPrice.toLocaleString('pt-BR')}
                            </div>
                            <div style="display:flex;gap:6px;margin-top:6px;">
                              <button class="btnInstantExecuteUserSellOrder" data-order-id="${ord.id}" type="button" style="background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;padding:5px 10px;border-radius:6px;font-size:10px;font-weight:900;cursor:pointer;" title="Vender agora para um magnata da IA">
                                ⚡ Vender Agora
                              </button>
                              <button class="btnCancelUserSellOrder" data-order-id="${ord.id}" type="button" style="background:#374151;color:#fca5a5;border:1px solid #4b5563;padding:5px 10px;border-radius:6px;font-size:10px;font-weight:800;cursor:pointer;">
                                Cancelar
                              </button>
                            </div>
                          </div>
                        </div>
                      `).join('') : `
                        <div style="padding:12px;text-align:center;color:#94a3b8;font-size:11px;background:#1f2937;border-radius:8px;border:1px dashed #374151;">
                          Você não tem nenhuma proposta de venda aberta no mercado P2P.
                        </div>
                      `}
                    </div>
                  </div>
                ` : ''}

                <!-- CONTEÚDO DA SUB-ABA 3: ÚLTIMAS COMPRAS E VENDAS DE AÇÕES (LIVRO DE NEGOCIAÇÕES) -->
                ${(this.activeP2PTab || 'proposals') === 'trades' ? `
                  <div>
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                      <div>
                        <div style="font-size:13px;font-weight:900;color:#34d399;text-transform:uppercase;display:flex;align-items:center;gap:6px;">
                          <span>📊</span> Livro de Negociações: Últimas Compras e Vendas
                        </div>
                        <div style="font-size:11px;color:#9ca3af;">Histórico de todas as operações realizadas por você e por grandes investidores na Bolsa SAF.</div>
                      </div>
                      <span class="pill" style="background:#064e3b;color:#6ee7b7;font-weight:900;font-size:10px;">● TEMPO REAL</span>
                    </div>

                    <div style="display:flex;flex-direction:column;gap:8px;max-height:420px;overflow-y:auto;padding-right:4px;">
                      ${(state.safMarketTrades || []).length > 0 ? (state.safMarketTrades || []).map(tr => {
                        const isB = tr.type === 'BUY';
                        const isUser = (tr.investor || '').includes('Você') || (tr.investor || '').includes(mp.name);
                        return `
                          <div style="background:#1f2937;border:1px solid ${isB ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'};border-radius:8px;padding:10px 12px;display:flex;justify-content:space-between;align-items:center;${isUser ? 'box-shadow:0 0 10px rgba(124,58,237,0.3);border-color:#a855f7;' : ''}">
                            <div>
                              <div style="display:flex;align-items:center;gap:6px;">
                                <span class="pill" style="background:${isB ? '#065f46' : '#7f1d1d'};color:${isB ? '#6ee7b7' : '#fca5a5'};font-size:9px;font-weight:900;padding:2px 6px;">
                                  ${isB ? '🟢 COMPRA' : '🔴 VENDA'}
                                </span>
                                <b style="color:${isUser ? '#c084fc' : '#fff'};font-size:12px;">${esc(tr.investor)}</b>
                                ${isUser ? '<span class="pill" style="background:#7c3aed;color:#fff;font-size:8px;font-weight:900;padding:1px 5px;">VOCÊ</span>' : ''}
                              </div>
                              <div style="font-size:11px;color:#cbd5e1;margin-top:3px;">
                                ${(tr.shares || 0).toLocaleString('pt-BR')} ações de <b style="color:#38bdf8;">${esc(tr.club || tr.ticker)}</b> a R$ ${(tr.price || 0).toFixed(2)}
                              </div>
                            </div>
                            <div style="text-align:right;">
                              <div style="font-size:13px;font-weight:900;color:${isB ? '#4ade80' : '#f87171'};">
                                ${isB ? '+' : '-'}R$ ${(tr.total || 0).toLocaleString('pt-BR')}
                              </div>
                              <div style="font-size:9px;color:#94a3b8;margin-top:2px;">${esc(tr.time || 'Hoje')}</div>
                            </div>
                          </div>
                        `;
                      }).join('') : `
                        <div style="padding:16px;text-align:center;color:#94a3b8;font-size:12px;">
                          Nenhuma negociação recente registrada no pregão.
                        </div>
                      `}
                    </div>
                  </div>
                ` : ''}

              </div>

              <!-- RANKING DE BILIONÁRIOS DA BOLA -->
              <div style="background:#111827;border:1px solid #374151;border-radius:14px;padding:18px;">
                <h3 style="margin:0 0 12px 0;font-size:16px;color:#fff;font-weight:900;display:flex;align-items:center;gap:8px;">
                  👑 Ranking de Bilionários da Bola
                </h3>
                <div style="font-size:11px;color:#9ca3af;margin-bottom:14px;">
                  Dispute a liderança de patrimônio com os maiores donos e fundos do futebol mundial.
                </div>
                <div style="display:flex;flex-direction:column;gap:8px;">
                  ${billionaires.map((b, idx) => `
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;border-radius:8px;background:${b.isUser ? 'rgba(124,58,237,0.25)' : '#1f2937'};border:${b.isUser ? '1px solid #a855f7' : '1px solid rgba(255,255,255,0.05)'};">
                      <div style="display:flex;align-items:center;gap:10px;">
                        <span style="font-weight:900;font-size:12px;color:${idx < 3 ? '#facc15' : (b.isUser ? '#c084fc' : '#94a3b8')};">#${idx + 1}</span>
                        <span style="font-size:18px;">${b.avatar}</span>
                        <div>
                          <div style="font-size:12px;font-weight:900;color:${b.isUser ? '#c084fc' : '#fff'};">${esc(b.name)}</div>
                          <div style="font-size:10px;color:#cbd5e1;">${esc(b.entity)}</div>
                        </div>
                      </div>
                      <div style="text-align:right;">
                        <div style="font-size:13px;font-weight:900;color:${b.isUser ? '#4ade80' : '#38bdf8'};">
                          R$ ${b.netWorth >= 1000000000 ? `${(b.netWorth / 1000000000).toFixed(1)} Bi` : `${(b.netWorth / 1000000).toFixed(1)} Mi`}
                        </div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- SEÇÃO 4: RADAR DO MERCADO: ÚLTIMAS NEGOCIAÇÕES & MOVIMENTAÇÕES CORPORATIVAS SAF -->
            <div style="background:#111827;border:1px solid #374151;border-radius:14px;padding:18px;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:10px;">
                <div>
                  <h3 style="margin:0;font-size:16px;color:#fff;font-weight:900;display:flex;align-items:center;gap:8px;">
                    📡 Radar do Mercado: Últimas Negociações & Movimentações Corporativas
                    <span class="pill" style="background:#1e3a8a;color:#93c5fd;font-weight:900;font-size:10px;">AO VIVO</span>
                  </h3>
                  <div style="font-size:11px;color:#9ca3af;">Acompanhe o que outros grandes investidores estão negociando na Bolsa e as movimentações de clubes entre SAF e Associação Civil!</div>
                </div>
              </div>

              <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(340px, 1fr));gap:16px;">
                
                <!-- COLUNA 1: LIVRO DE NEGOCIAÇÕES DOS INVESTIDORES (TRADES EM TEMPO REAL) -->
                <div style="background:#1f2937;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px;">
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                    <div style="font-size:13px;font-weight:900;color:#fff;display:flex;align-items:center;gap:6px;">
                      <span>📊</span> Livro de Negociações (Trades de Investidores)
                    </div>
                    <span style="font-size:10px;color:#4ade80;font-weight:800;">● Pregão em tempo real</span>
                  </div>
                  
                  <div style="display:flex;flex-direction:column;gap:8px;max-height:360px;overflow-y:auto;padding-right:4px;">
                    ${(state.safMarketTrades || []).map(tr => {
                      const isB = tr.type === 'BUY';
                      return `
                        <div style="background:#111827;border:1px solid ${isB ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'};border-radius:8px;padding:10px 12px;display:flex;justify-content:space-between;align-items:center;">
                          <div>
                            <div style="display:flex;align-items:center;gap:6px;">
                              <span class="pill" style="background:${isB ? '#065f46' : '#7f1d1d'};color:${isB ? '#6ee7b7' : '#fca5a5'};font-size:9px;font-weight:900;padding:2px 6px;">
                                ${isB ? '🟢 COMPRA' : '🔴 VENDA'}
                              </span>
                              <b style="color:#fff;font-size:12px;">${esc(tr.investor)}</b>
                            </div>
                            <div style="font-size:11px;color:#cbd5e1;margin-top:3px;">
                              ${(tr.shares || 0).toLocaleString('pt-BR')} ações de <b style="color:#38bdf8;">${esc(tr.club || tr.ticker)}</b> a R$ ${(tr.price || 0).toFixed(2)}
                            </div>
                          </div>
                          <div style="text-align:right;">
                            <div style="font-size:12px;font-weight:900;color:${isB ? '#4ade80' : '#f87171'};">
                              ${isB ? '+' : '-'}R$ ${(tr.total || 0).toLocaleString('pt-BR')}
                            </div>
                            <div style="font-size:9px;color:#94a3b8;margin-top:2px;">${esc(tr.time || 'Hoje')}</div>
                          </div>
                        </div>
                      `;
                    }).join('')}
                  </div>
                </div>

                <!-- COLUNA 2: GOVERNANÇA CORPORATIVA (SAF VS ASSOCIAÇÃO CIVIL) -->
                <div style="background:#1f2937;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px;">
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                    <div style="font-size:13px;font-weight:900;color:#fff;display:flex;align-items:center;gap:6px;">
                      <span>🏛️</span> Governança: Transições SAF & Associações Civis
                    </div>
                    <span style="font-size:10px;color:#38bdf8;font-weight:800;">● Notícias Institucionais</span>
                  </div>

                  <div style="display:flex;flex-direction:column;gap:8px;max-height:360px;overflow-y:auto;padding-right:4px;">
                    ${(state.safCorporateNews || []).map(cn => {
                      const isSaf = (cn.tag || '').includes('SAF');
                      return `
                        <div style="background:#111827;border-left:3px solid ${isSaf ? '#10b981' : '#f59e0b'};border-radius:8px;padding:10px 12px;">
                          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                            <span class="pill" style="background:${isSaf ? '#064e3b' : '#78350f'};color:${isSaf ? '#6ee7b7' : '#fde68a'};font-size:9px;font-weight:900;padding:2px 6px;">
                              ${esc(cn.tag || 'GOVERNANÇA')}
                            </span>
                            <span style="font-size:10px;color:#94a3b8;">${esc(cn.date || 'Recente')}</span>
                          </div>
                          <div style="font-size:12px;font-weight:900;color:#fff;margin-bottom:2px;">
                            ${esc(cn.club)}
                          </div>
                          <div style="font-size:11px;color:#cbd5e1;line-height:1.4;">
                            ${esc(cn.headline)}
                          </div>
                        </div>
                      `;
                    }).join('')}
                  </div>
                </div>

              </div>
            </div>
          `}

          </div>
        </div>
      `;

      // Event Listeners para Cursos e Ranking no Banner
      const btnLic = container.querySelector('#btn-open-cbf-licenses');
      if (btnLic) {
        btnLic.onclick = (e) => {
          e.stopPropagation();
          if (typeof window.openLicensesModal === 'function') window.openLicensesModal();
          else if (window.AFM_LicensesModal && typeof window.AFM_LicensesModal.open === 'function') window.AFM_LicensesModal.open();
        };
      }

      const btnRk = container.querySelector('#btn-open-save-coaches-rk');
      if (btnRk) {
        btnRk.onclick = (e) => {
          e.stopPropagation();
          if (typeof window.openGlobalRankingModal === 'function') window.openGlobalRankingModal();
          else if (window.AFM_GlobalRanking && typeof window.AFM_GlobalRanking.openModal === 'function') window.AFM_GlobalRanking.openModal();
        };
      }

      // Event Listeners de Alternância das 2 Sub-Abas
      const tabTrainer = container.querySelector('#btnTabCareerTrainer');
      if (tabTrainer) {
        tabTrainer.onclick = () => {
          this.activeTab = 'trainer';
          this.renderLifeAndSharesUI(containerId, state);
        };
      }

      const tabSaf = container.querySelector('#btnTabCareerSaf');
      if (tabSaf) {
        tabSaf.onclick = () => {
          this.activeTab = 'saf';
          this.renderLifeAndSharesUI(containerId, state);
        };
      }

      // Modelos de Campanha SAF
      container.querySelectorAll('.safModelCard').forEach(card => {
        card.onclick = () => {
          this.selectedSafModel = card.dataset.model;
          this.renderLifeAndSharesUI(containerId, state);
        };
      });

      // Votação da Assembleia SAF
      const btnVote = container.querySelector('#btnStartSafVoting');
      if (btnVote) {
        btnVote.onclick = () => {
          btnVote.disabled = true;
          btnVote.innerHTML = '🗳️ Realizando apuração dos 300 Conselheiros...';
          setTimeout(() => {
            const res = this.simulateSafAssemblyVote(state, this.selectedSafModel);
            if (window.toast) {
              window.toast(res.approved ? `🎉 SAF APROVADA COM ${res.inFavor} VOTOS! Aporte de R$ ${res.aporte.toLocaleString('pt-BR')} recebido!` : `⚠️ SAF Reprovada com ${res.against} votos contrários.`);
            }
            if (window.save) window.save();
            this.renderLifeAndSharesUI(containerId, state);
          }, 600);
        };
      }

      // Abertura do Modal de Compra e Venda de Ações SAF com confirmação e cálculo do valor a gastar
      container.querySelectorAll('.btnOpenTradeModal').forEach(btn => {
        btn.onclick = () => {
          const action = btn.dataset.action;
          const clubId = btn.dataset.safId;
          const count = Number(btn.dataset.count) || 100;
          this.openTradeModal(state, action, clubId, count);
        };
      });

      // Propostas P2P de Investidores (Compra ou Venda)
      container.querySelectorAll('.btnAcceptP2P').forEach(btn => {
        btn.onclick = () => {
          const offerId = btn.dataset.offerId;
          const res = this.acceptSafP2POffer(state, offerId);
          if (window.toast) window.toast(res.message);
          if (window.save) window.save();
          this.renderLifeAndSharesUI(containerId, state);
        };
      });

      container.querySelectorAll('.btnRejectP2P').forEach(btn => {
        btn.onclick = () => {
          const offerId = btn.dataset.offerId;
          const res = this.rejectSafP2POffer(state, offerId);
          if (window.toast) window.toast(res.message);
          if (window.save) window.save();
          this.renderLifeAndSharesUI(containerId, state);
        };
      });

      // Navegação entre as sub-abas do Hub P2P
      container.querySelectorAll('.btnP2PNavTab').forEach(btn => {
        btn.onclick = () => {
          this.activeP2PTab = btn.dataset.p2pTab;
          this.renderLifeAndSharesUI(containerId, state);
        };
      });

      // Cálculo dinâmico e publicação da Proposta de Venda do Usuário
      const selClub = container.querySelector('#userSellSafSelect');
      const inputQty = container.querySelector('#userSellQtyInput');
      const selAgio = container.querySelector('#userSellAgioSelect');
      const calcBox = container.querySelector('#userSellCalcBox');

      const updateSellCalc = () => {
        if (!selClub || !inputQty || !selAgio || !calcBox) return;
        const opt = selClub.options ? (selClub.options[selClub.selectedIndex] || selClub.options[0]) : null;
        if (!opt) return;
        const sharePrice = parseFloat(opt.dataset?.sharePrice || opt.getAttribute?.('data-share-price')) || 25;
        const maxShares = parseInt(opt.dataset?.maxShares || opt.getAttribute?.('data-max-shares'), 10) || 100;
        let qty = parseInt(inputQty.value, 10);
        if (isNaN(qty) || qty < 1) qty = 1;
        if (qty > maxShares) qty = maxShares;
        inputQty.value = qty;
        inputQty.max = maxShares;

        const agioPct = parseInt(selAgio.value, 10) || 15;
        const askingPricePerShare = Number((sharePrice * (1 + agioPct / 100)).toFixed(2));
        const totalReceiving = Math.round(qty * askingPricePerShare);

        calcBox.innerHTML = `
          <div>
            <div style="font-size:10px;color:#94a3b8;text-transform:uppercase;">Cotação na Bolsa vs Pedido</div>
            <div style="font-size:12px;color:#cbd5e1;font-weight:700;">
              R$ ${sharePrice.toFixed(2)} ➔ <b style="color:#60a5fa;">R$ ${askingPricePerShare.toFixed(2)} / ação</b> (+${agioPct}%)
            </div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:10px;color:#94a3b8;text-transform:uppercase;">Total a Receber da Venda</div>
            <div style="font-size:16px;font-weight:900;color:#4ade80;">
              +R$ ${totalReceiving.toLocaleString('pt-BR')}
            </div>
          </div>
        `;
      };

      if (selClub && inputQty && selAgio) {
        updateSellCalc();
        selClub.onchange = updateSellCalc;
        inputQty.oninput = updateSellCalc;
        selAgio.onchange = updateSellCalc;

        container.querySelectorAll('.btnUserSellPreset').forEach(btn => {
          btn.onclick = () => {
            const opt = selClub.options ? (selClub.options[selClub.selectedIndex] || selClub.options[0]) : null;
            const maxShares = opt ? (parseInt(opt.dataset?.maxShares || opt.getAttribute?.('data-max-shares'), 10) || 100) : 100;
            const preset = btn.dataset?.preset || btn.getAttribute?.('data-preset');
            if (preset === 'all') inputQty.value = maxShares;
            else inputQty.value = Math.min(parseInt(preset, 10) || 50, maxShares);
            updateSellCalc();
          };
        });

        const btnPublish = container.querySelector('#btnPublishUserSellOrder');
        if (btnPublish) {
          btnPublish.onclick = () => {
            const clubId = selClub.value;
            const qty = parseInt(inputQty.value, 10);
            const agio = parseInt(selAgio.value, 10) || 15;
            const res = this.publishUserSafSellOrder(state, clubId, qty, agio);
            if (window.toast) window.toast(res.message);
            if (res.ok) {
              if (window.save) window.save();
              this.renderLifeAndSharesUI(containerId, state);
            }
          };
        }
      }

      // Cancelamento de proposta de venda do usuário
      container.querySelectorAll('.btnCancelUserSellOrder').forEach(btn => {
        btn.onclick = () => {
          const res = this.cancelUserSafSellOrder(state, btn.dataset.orderId);
          if (window.toast) window.toast(res.message);
          if (window.save) window.save();
          this.renderLifeAndSharesUI(containerId, state);
        };
      });

      // Execução imediata da proposta de venda com investidor da IA
      container.querySelectorAll('.btnInstantExecuteUserSellOrder').forEach(btn => {
        btn.onclick = () => {
          const res = this.instantExecuteUserSellOrder(state, btn.dataset.orderId);
          if (window.toast) window.toast(res.message);
          if (window.save) window.save();
          this.renderLifeAndSharesUI(containerId, state);
        };
      });

      // Botão de atalho para rolar até o pregão
      container.querySelectorAll('.btnGoToPregao').forEach(btn => {
        btn.onclick = () => {
          const tbl = container.querySelector('#pregao-saf-full-table');
          if (tbl) {
            tbl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        };
      });

      // Event Listeners da Aba 1 (apenas fallback quando AFMCareerFix não está carregado;
      // quando AFMCareerFix está ativo, a delegação global única no document já executa e evita cobrança dupla)
      if (typeof window === 'undefined' || !window.AFMCareerFix) {
        container.querySelectorAll('.btnBuyProp').forEach((btn) => {
          btn.onclick = () => {
            const res = this.buyProperty(state, btn.dataset.propId);
            if (window.toast) window.toast(res.message);
            if (window.save) window.save();
            this.renderLifeAndSharesUI(containerId, state);
          };
        });

        container.querySelectorAll('.btnBuyBiz').forEach((btn) => {
          btn.onclick = () => {
            const res = this.buyOrUpgradeBusiness(state, btn.dataset.bizId);
            if (window.toast) window.toast(res.message);
            if (window.save) window.save();
            this.renderLifeAndSharesUI(containerId, state);
          };
        });

        container.querySelectorAll('.btnBuyVeh').forEach((btn) => {
          btn.onclick = () => {
            const res = this.buyVehicle(state, btn.dataset.vehId);
            if (window.toast) window.toast(res.message);
            if (window.save) window.save();
            this.renderLifeAndSharesUI(containerId, state);
          };
        });
      }
    },

    calculateManagerTotalNetWorth(state) {
      if (!state) return 0;
      const mp = state.managerPersonal || {};
      const personalBalance = Number(state.managerMoney !== undefined ? state.managerMoney : (mp.personalBalance || 57000));
      const propertiesTotal = (mp.properties || []).reduce((acc, p) => acc + (p.currentValue || p.cost || 0), 0);
      const vehiclesTotal = (mp.vehicles || []).reduce((acc, v) => acc + (v.cost || 0), 0);
      const businessesTotal = (mp.businesses || []).reduce((acc, b) => acc + (b.investedCapital || b.cost || 0), 0);
      const totalValuation = (typeof this.getClubValuation === 'function') ? this.getClubValuation(state) : 10000000;
      const clubSharesValue = Math.round(totalValuation * ((mp.clubSharesPct || 0) / 100));

      let safPortfolioValue = 0;
      const safList = (typeof this.getSafMarketList === 'function') ? this.getSafMarketList(state) : [];
      if (mp.safPortfolio) {
        Object.keys(mp.safPortfolio).forEach(clubId => {
          const holding = mp.safPortfolio[clubId];
          const saf = safList.find(s => s.id === clubId);
          if (holding && holding.sharesCount > 0 && saf) {
            safPortfolioValue += Math.round(holding.sharesCount * saf.sharePrice);
          }
        });
      }
      return personalBalance + propertiesTotal + vehiclesTotal + businessesTotal + clubSharesValue + safPortfolioValue;
    }
  };

  window.AFM_LifeAndSharesPro = ManagerLifeAndSharesPro;
  window.isClubSaf = (state, clubName) => ManagerLifeAndSharesPro.isClubSaf(state, clubName);
})(typeof window !== 'undefined' ? window : global);
