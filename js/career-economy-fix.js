/**
 * AFM MANAGER 2026/2027 - MÓDULO BLINDADO DE CARREIRA, SAF, RANKING, LICENÇAS & X1
 * Arquivo: js/career-economy-fix.js
 */
(function (global) {
  'use strict';

  // =========================================================================
  // 1. UTILITÁRIOS SEGUROS (UTF-8, MOEDA, SANITIZAÇÃO E ARREDONDAMENTO)
  // =========================================================================
  const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

  function formatBRL(val) {
    const num = Number(val) || 0;
    return 'R$ ' + Math.round(num).toLocaleString('pt-BR');
  }

  function formatBRLCompact(val) {
    const num = Number(val) || 0;
    if (num >= 1_000_000_000) return 'R$ ' + (num / 1_000_000_000).toFixed(1) + ' Bi';
    if (num >= 1_000_000) return 'R$ ' + (num / 1_000_000).toFixed(1) + ' Mi';
    if (num >= 1_000) return 'R$ ' + (num / 1_000).toFixed(1) + ' mil';
    return formatBRL(num);
  }

  function sanitizeCoachName(rawName) {
    let clean = String(rawName || 'Treinador').replace(/\(VOCÊ\)/gi, '').trim();
    while (/^(t[eé]c\.|treinador|t[eé]cnico)\s*/i.test(clean)) {
      clean = clean.replace(/^(t[eé]c\.|treinador|t[eé]cnico)\s*/i, '').trim();
    }
    return clean || 'Treinador';
  }

  // Codificação Base64 segura para UTF-8 (evita crash com acentos: Ceilândia, João, etc.)
  function encodeUtf8Base64(str) {
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(str, 'utf8').toString('base64');
    }
    const bytes = new TextEncoder().encode(str);
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }

  function decodeUtf8Base64(b64) {
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(String(b64 || '').trim(), 'base64').toString('utf8');
    }
    const bin = atob(String(b64 || '').trim());
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }

  function resolveCountryFromLeague(leagueCode, fallbackCountry) {
    if (fallbackCountry && fallbackCountry !== 'Brasil' && fallbackCountry !== 'Internacional') return fallbackCountry;
    const code = String(leagueCode || '').toUpperCase().trim();
    const prefixMap = {
      'BRA': 'Brasil',
      'PAR': 'Paraguai',
      'ECU': 'Equador',
      'ARG': 'Argentina',
      'URU': 'Uruguai',
      'CHI': 'Chile',
      'COL': 'Colômbia',
      'PER': 'Peru',
      'BOL': 'Bolívia',
      'VEN': 'Venezuela',
      'ENG': 'Inglaterra',
      'ESP': 'Espanha',
      'ITA': 'Itália',
      'GER': 'Alemanha',
      'FRA': 'França',
      'POR': 'Portugal',
      'NED': 'Holanda',
      'SCO': 'Escócia',
      'BEL': 'Bélgica',
      'TUR': 'Turquia',
      'USA': 'Estados Unidos',
      'MEX': 'México',
      'SAU': 'Arábia Saudita',
      'JPN': 'Japão',
      'SUD': 'América do Sul'
    };
    const prefix = code.split('-')[0];
    return prefixMap[prefix] || fallbackCountry || 'Brasil';
  }

  // =========================================================================
  // 2. CATÁLOGOS OFICIAIS DA CARREIRA (IMÓVEIS, NEGÓCIOS, GARAGEM, LICENÇAS)
  // =========================================================================
  const PROPERTIES_CATALOG = [
    { id: 'apt_studio', aliases: ['prop_studio'], icon: '🏢', name: 'Apartamento Studio Executivo', price: 280000, rent: 2400, prestige: 1, appreciationYear: 8 },
    { id: 'casa_condominio', aliases: ['prop_condo'], icon: '🏡', name: 'Casa em Condomínio Fechado', price: 850000, rent: 7500, prestige: 3, appreciationYear: 12 },
    { id: 'cobertura_duplex', aliases: ['prop_penthouse'], icon: '🌆', name: 'Cobertura Duplex Panorâmica', price: 2400000, rent: 21000, prestige: 6, appreciationYear: 15 },
    { id: 'mansao_lago', aliases: ['prop_mansion'], icon: '🏰', name: 'Mansão com Campo Particular & Heliponto', price: 7800000, rent: 68000, prestige: 12, appreciationYear: 18 },
    { id: 'ilha_privada', aliases: ['prop_island'], icon: '🏝️', name: 'Ilha Particular & Resort VIP', price: 24000000, rent: 210000, prestige: 25, appreciationYear: 22 }
  ];

  const BUSINESSES_CATALOG = [
    { id: 'barbearia_vip', aliases: ['biz_barber'], icon: '💈', name: 'Barbearia VIP de Atletas', price: 180000, baseProfit: 9500, perk: '+1 Moral dos Jovens', maxLevel: 5 },
    { id: 'escolinha_fut', aliases: ['biz_school'], icon: '⚽', name: 'Escolinha de Futebol Oficial', price: 350000, baseProfit: 18500, perk: 'Revela jovens talentos para a base', maxLevel: 5 },
    { id: 'academia_fitness', aliases: ['biz_gym'], icon: '🏋️', name: 'Academia Fitness & CrossTraining', price: 520000, baseProfit: 28000, perk: '+2% Recuperação Física do Elenco', maxLevel: 5 },
    { id: 'loja_esportiva', aliases: ['biz_store'], icon: '🎽', name: 'Loja de Artigos Esportivos', price: 750000, baseProfit: 41000, perk: '+5% Venda de Camisas', maxLevel: 5 },
    { id: 'clinica_fisio', aliases: ['biz_clinic'], icon: '🏥', name: 'Clínica de Fisioterapia Esportiva', price: 1350000, baseProfit: 72000, perk: '-15% Tempo de Lesão no Clube', maxLevel: 5 },
    { id: 'restaurante_luxo', aliases: ['biz_restaurant'], icon: '🍽️', name: 'Restaurante & Steakhouse de Luxo', price: 1800000, baseProfit: 96000, perk: '+3% Humor do Elenco e Diretoria', maxLevel: 5 },
    { id: 'rede_hoteis', aliases: ['biz_hotel'], icon: '🏨', name: 'Rede de Hotéis Executivos', price: 5500000, baseProfit: 290000, perk: '+15 Prestígio Internacional', maxLevel: 5 }
  ];

  const VEHICLES_CATALOG = [
    { id: 'suv_blindado', aliases: ['veh_suv'], icon: '🚙', name: 'SUV Blindado Executivo', price: 420000, prestige: 2, perk: '+Segurança e Respeito Local' },
    { id: 'superesportivo', aliases: ['veh_sport'], icon: '🏎️', name: 'Superesportivo Europeu V12', price: 3200000, prestige: 8, perk: '+Atração de Craques no Mercado' },
    { id: 'jato_particular', aliases: ['veh_jet'], icon: '✈️', name: 'Jato Executivo Particular', price: 18500000, prestige: 20, perk: '-30% Desgaste em Viagens e Negociações Rápidas' }
  ];

  const LICENSES_CATALOG = [
    { id: 'cbf_d', name: 'Licença CBF D (Iniciante)', cost: 0, reqPrestige: 0, salaryBonusPct: 5, perk: '+2% Evolução da Base' },
    { id: 'cbf_c', name: 'Licença CBF C (Estadual)', cost: 15000, reqPrestige: 5, salaryBonusPct: 10, perk: '+4% Treino Tático' },
    { id: 'cbf_b', name: 'Licença CBF B (Nacional Série B/C)', cost: 45000, reqPrestige: 12, salaryBonusPct: 15, perk: '+7% Moral & Tática' },
    { id: 'cbf_a', name: 'Licença CBF A (Elite Série A)', cost: 120000, reqPrestige: 25, salaryBonusPct: 20, perk: '+10% Atração no Mercado' },
    { id: 'cbf_pro', name: 'Licença CONMEBOL / CBF PRO', cost: 280000, reqPrestige: 45, salaryBonusPct: 25, perk: '+15% Prestígio Continental' },
    { id: 'uefa_pro', name: 'Licença UEFA PRO (Mundial)', cost: 650000, reqPrestige: 70, salaryBonusPct: 35, perk: 'Acesso Irrestrito a Gigantes Europeus' }
  ];

  const KNOWN_SAF_CLUBS = [
    'botafogo', 'cruzeiro', 'bahia', 'vasco', 'atletico-mg', 'atlético-mg',
    'fortaleza', 'cuiaba', 'cuiabá', 'bragantino', 'red bull bragantino',
    'coritiba', 'america-mg', 'américa-mg'
  ];

  function isClubSaf(state, clubName) {
    const target = String(clubName || state?.club || '').toLowerCase().trim();
    if (state?.clubIsSaf && target === String(state?.club || '').toLowerCase().trim()) return true;
    if (state?.club && typeof state.club === 'object' && state.club.isSaf) return true;
    return KNOWN_SAF_CLUBS.some(k => target.includes(k) || k.includes(target));
  }

  function findPropertyItem(propId) {
    const raw = String(propId || '').toLowerCase().trim();
    return PROPERTIES_CATALOG.find(p => p.id === raw || (p.aliases && p.aliases.includes(raw)) || p.id.includes(raw.replace(/^prop_/, '')) || raw.includes(p.id));
  }

  function findBusinessItem(bizId) {
    const raw = String(bizId || '').toLowerCase().trim();
    return BUSINESSES_CATALOG.find(b => b.id === raw || (b.aliases && b.aliases.includes(raw)) || b.id.includes(raw.replace(/^biz_/, '')) || raw.includes(b.id));
  }

  function findVehicleItem(vehId) {
    const raw = String(vehId || '').toLowerCase().trim();
    return VEHICLES_CATALOG.find(v => v.id === raw || (v.aliases && v.aliases.includes(raw)) || v.id.includes(raw.replace(/^veh_/, '')) || raw.includes(v.id));
  }

  // =========================================================================
  // 3. GARANTIA DE ESTADO CONSISTENTE (SINGLE SOURCE OF TRUTH)
  // =========================================================================
  function ensureCareerState(state) {
    if (!state) return null;
    if (!state.career) state.career = {};
    const c = state.career;
    const mp = state.managerPersonal || {};

    // Nunca misturar saldo do clube (state.money) com caixa pessoal (c.cash)
    if (typeof c.cash !== 'number' || Number.isNaN(c.cash)) {
      if (typeof c.personalCash === 'number') c.cash = c.personalCash;
      else if (typeof mp.personalBalance === 'number') c.cash = mp.personalBalance;
      else if (typeof state.managerMoney === 'number') c.cash = state.managerMoney;
      else c.cash = 104250;
    }
    c.personalCash = c.cash;
    if (state.managerPersonal) state.managerPersonal.personalBalance = c.cash;
    state.managerMoney = c.cash;

    if (typeof c.baseSalary !== 'number' || c.baseSalary <= 0) c.baseSalary = mp.salary || 45000;
    if (typeof c.prestige !== 'number') c.prestige = mp.prestigeScore || state.coachPrestige || 6;
    if (!c.licenseId) c.licenseId = c.license || mp.licenseId || (typeof localStorage !== 'undefined' ? localStorage.getItem('afm_user_license_id') : null) || 'cbf_d';
    if (!Array.isArray(c.unlockedLicenses)) c.unlockedLicenses = Array.isArray(c.licenses) ? c.licenses : (mp.unlockedLicenses || ['cbf_d']);
    c.licenses = c.unlockedLicenses;
    if (!c.properties || typeof c.properties !== 'object') c.properties = {};
    if (!c.businesses || typeof c.businesses !== 'object') c.businesses = {};
    if (!c.vehicles || typeof c.vehicles !== 'object') c.vehicles = {};
    if (!c.safPortfolio || typeof c.safPortfolio !== 'object') c.safPortfolio = mp.safPortfolio || {};
    if (!Array.isArray(c.p2pMyListings)) c.p2pMyListings = [];
    if (!Array.isArray(c.x1History)) c.x1History = [];
    if (!c.activeSubTab) c.activeSubTab = 'trainer'; // 'trainer' | 'saf' | 'x1'
    if (!c.selectedSafModel) c.selectedSafModel = '50plus1';

    // Sincronização retroativa com managerPersonal legado
    if (Array.isArray(mp.properties) && Object.keys(c.properties).length === 0) {
      mp.properties.forEach(p => {
        const item = findPropertyItem(p.id) || { id: p.id, price: p.currentValue || p.cost || 280000 };
        c.properties[item.id] = { count: 1, currentValue: p.currentValue || p.cost || item.price };
      });
    }
    if (Array.isArray(mp.businesses) && Object.keys(c.businesses).length === 0) {
      mp.businesses.forEach(b => {
        const item = findBusinessItem(b.id || b.typeId) || { id: b.id || b.typeId };
        c.businesses[item.id] = Number(b.level || 1);
      });
    }
    if (Array.isArray(mp.vehicles) && Object.keys(c.vehicles).length === 0) {
      mp.vehicles.forEach(v => {
        const item = findVehicleItem(v.id) || { id: v.id };
        c.vehicles[item.id] = true;
      });
    }

    return c;
  }

  function calculateCareerEconomy(state) {
    const c = ensureCareerState(state);
    if (!c) return { cash: 0, netWorth: 0, monthlyIncome: 0, effectiveSalary: 0 };

    const activeLic = LICENSES_CATALOG.find(l => l.id === c.licenseId) || LICENSES_CATALOG[0];
    const effectiveSalary = Math.round(c.baseSalary * (1 + activeLic.salaryBonusPct / 100));
    c.salary = effectiveSalary;

    // 1. Imóveis
    let propertiesValue = 0;
    let monthlyRent = 0;
    PROPERTIES_CATALOG.forEach(p => {
      const owned = c.properties[p.id];
      const count = typeof owned === 'number' ? owned : (owned?.count || 0);
      const currentVal = owned?.currentValue || p.price;
      if (count > 0) {
        propertiesValue += currentVal * count;
        monthlyRent += p.rent * count;
      }
    });

    // 2. Empreendimentos
    let businessesValue = 0;
    let monthlyBusinessProfit = 0;
    BUSINESSES_CATALOG.forEach(b => {
      const lvl = Number(c.businesses[b.id] || 0);
      if (lvl > 0) {
        businessesValue += Math.round(b.price * (1 + (lvl - 1) * 0.65));
        monthlyBusinessProfit += Math.round(b.baseProfit * (1 + (lvl - 1) * 0.35));
      }
    });

    // 3. Garagem
    let vehiclesValue = 0;
    VEHICLES_CATALOG.forEach(v => {
      if (c.vehicles[v.id]) {
        vehiclesValue += v.price;
      }
    });

    // 4. Carteira SAF
    let safValue = 0;
    let monthlySafDividends = 0;
    const market = Array.isArray(state?.safMarket) ? state.safMarket : (Array.isArray(state?.safMarketList) ? state.safMarketList : []);
    Object.entries(c.safPortfolio).forEach(([safId, shares]) => {
      const qty = typeof shares === 'number' ? shares : (shares?.sharesCount || 0);
      if (qty > 0) {
        const stock = market.find(s => s.id === safId || s.ticker === safId);
        const price = stock ? Number(stock.sharePrice || stock.price || 25) : 25;
        const divYield = stock ? Number(stock.dividendYield || stock.divYield || 0.008) : 0.008;
        const posVal = round2(qty * price);
        safValue += posVal;
        monthlySafDividends += Math.round(posVal * divYield);
      }
    });

    const netWorth = Math.round(c.cash + propertiesValue + businessesValue + vehiclesValue + safValue);
    const monthlyIncome = Math.round(effectiveSalary + monthlyRent + monthlyBusinessProfit + monthlySafDividends);

    c.netWorth = netWorth;
    c.monthlyIncome = monthlyIncome;

    if (state.managerPersonal) {
      state.managerPersonal.personalBalance = c.cash;
      state.managerPersonal.salary = effectiveSalary;
      state.managerPersonal.totalNetWorth = netWorth;
      state.managerPersonal.prestigeScore = c.prestige;
    }
    state.managerMoney = c.cash;

    return {
      cash: Math.round(c.cash),
      netWorth,
      monthlyIncome,
      effectiveSalary,
      monthlyRent,
      monthlyBusinessProfit,
      monthlySafDividends,
      propertiesValue,
      businessesValue,
      vehiclesValue,
      safValue
    };
  }

  // =========================================================================
  // 4. FIX DO RANKING VIVO DE TREINADORES (ORDENAÇÃO, PAÍS E NOME SEM DUPLICAR)
  // =========================================================================
  function normalizeAndSortRanking(rawList, state) {
    const c = ensureCareerState(state);
    const userCoachClean = sanitizeCoachName(state?.coachName || state?.managerName || state?.manager || 'Aquino');
    const userClubName = state?.club?.name || state?.clubName || state?.club || 'Ceilândia';

    const normalized = (rawList || []).map(item => {
      const cleanName = sanitizeCoachName(item.coachName || item.coach || item.name);
      const isUser = Boolean(item.isUser || cleanName.toLowerCase() === userCoachClean.toLowerCase());
      const league = item.division || item.league || 'BRA-D';
      const country = isUser ? (state?.club?.country || 'Brasil') : resolveCountryFromLeague(league, item.country);
      const titles = Number(item.titles || 0);
      const wins = Number(item.wins || item.w || 0);
      const draws = Number(item.draws || item.d || 0);
      const losses = Number(item.losses || item.l || 0);
      const prestige = isUser ? Number(c?.prestige || 6) : Number(item.prestige || 10);

      // Recalcula pontuação oficial caso esteja inconsistente: Títulos (+160), V (+14), E (+4), D (-6)
      const computedPts = (titles * 160) + (wins * 14) + (draws * 4) - (losses * 6);
      const points = typeof item.points === 'number' && item.points > 0 ? item.points : (typeof item.pts === 'number' && item.pts > 0 ? item.pts : Math.max(0, computedPts));

      return {
        ...item,
        isUser,
        coach: isUser ? `Téc. ${cleanName} (VOCÊ)` : `Téc. ${cleanName}`,
        displayCoachName: cleanName,
        club: isUser ? userClubName : (item.club || item.clubName || 'Clube'),
        clubName: isUser ? userClubName : (item.club || item.clubName || 'Clube'),
        division: league,
        league,
        country,
        prestige,
        titles,
        wins,
        w: wins,
        draws,
        d: draws,
        losses,
        l: losses,
        points,
        pts: points,
        scope: country === 'Brasil' ? 'BR' : 'WORLD'
      };
    });

    // ORDENAÇÃO REAL POR PONTOS DECRESCENTE (Corrige o bug de ordem alfabética por time!)
    normalized.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.titles !== a.titles) return b.titles - a.titles;
      if (b.prestige !== a.prestige) return b.prestige - a.prestige;
      return a.displayCoachName.localeCompare(b.displayCoachName);
    });

    normalized.forEach((row, idx) => {
      row.worldPos = idx + 1;
      row.pos = idx + 1;
    });

    const nationalOnly = normalized.filter(r => r.country === 'Brasil');
    nationalOnly.forEach((row, idx) => {
      row.nationalPos = idx + 1;
    });

    normalized.all = normalized;
    normalized.national = nationalOnly;
    return normalized;
  }

  // =========================================================================
  // 5. FIX DO MODO JOGAR X1 (TOKEN UTF-8 SEGURO + VALIDAÇÃO ANTI-CRASH)
  // =========================================================================
  function generateSafeX1Token(state) {
    const clubName = typeof state?.club === 'object' ? state.club.name : (state?.club || 'Ceilândia');
    const squad = Array.isArray(state?.squad) ? state.squad : (Array.isArray(state?.club?.squad) ? state.club.squad : []);
    const starters = squad.slice(0, 11).map(p => ({
      n: String(p?.name || 'Jogador').slice(0, 22),
      p: String(p?.pos || 'MC'),
      o: Math.min(99, Math.max(40, Number(p?.ovr || p?.overall || p?.rating || 65)))
    }));

    const payload = {
      v: 2,
      t: Date.now(),
      club: String(clubName || 'Meu Clube').slice(0, 30),
      coach: sanitizeCoachName(state?.coachName || state?.managerName || state?.manager || 'Treinador'),
      ovr: Number(state?.teamOverall || state?.avgOvr || 66),
      formation: String(state?.tactic || state?.formation || '4-3-3'),
      squad: starters
    };

    return 'AFMX1_' + encodeUtf8Base64(JSON.stringify(payload));
  }

  function parseSafeX1Token(rawToken) {
    const token = String(rawToken || '').trim();
    if (!token) throw new Error('Cole o código X1 do adversário antes de simular.');
    const cleanB64 = token.startsWith('AFMX1_') ? token.slice(6) : token;
    let parsed;
    try {
      parsed = JSON.parse(decodeUtf8Base64(cleanB64));
    } catch (e) {
      try {
        if (typeof atob === 'function') {
          parsed = JSON.parse(decodeURIComponent(escape(atob(cleanB64))));
        } else {
          parsed = JSON.parse(Buffer.from(cleanB64, 'base64').toString('utf8'));
        }
      } catch (e2) {
        throw new Error('Código X1 inválido ou corrompido. Peça ao seu rival para gerar novamente.');
      }
    }
    if (!parsed || (!parsed.club && !parsed.myClub)) {
      throw new Error('Estrutura tática do código X1 incompleta.');
    }
    parsed.club = parsed.club || parsed.myClub || 'Clube Rival';
    parsed.coach = parsed.coach || parsed.manager || 'Adversário';
    parsed.manager = parsed.coach;
    parsed.posture = parsed.posture || parsed.formation || 'Equilibrada';
    parsed.power = Number(parsed.ovr || parsed.power || 72);
    parsed.ovr = parsed.power;
    parsed.squad = parsed.squad || parsed.starters || [];
    return parsed;
  }

  function simulateX1Duel(myState, opponentToken) {
    try {
      const opp = parseSafeX1Token(opponentToken);
      const myPower = Number(myState?.teamOverall || myState?.avgOvr || 66);
      const oppPower = Number(opp.power || opp.ovr || 66);
      const ratio = myPower / Math.max(1, oppPower);
      const oppRatio = oppPower / Math.max(1, myPower);
      const myGoals = Math.max(0, Math.round((Math.random() * 3.2) * Math.pow(ratio, 1.2)));
      const oppGoals = Math.max(0, Math.round((Math.random() * 3.2) * Math.pow(oppRatio, 1.2)));
      return {
        ok: true,
        opponent: opp,
        myGoals,
        oppGoals,
        myClub: typeof myState?.club === 'object' ? myState.club.name : (myState?.club || 'Seu Clube'),
        oppClub: opp.club,
        oppCoach: opp.coach || opp.manager || 'Adversário'
      };
    } catch (e) {
      return { ok: false, message: e.message || 'Código X1 inválido!' };
    }
  }

  // =========================================================================
  // 6. COMPRAS, UPGRADES E VENDAS (IMÓVEIS, NEGÓCIOS, GARAGEM, LICENÇAS)
  // =========================================================================
  function notify(msg, type = 'success') {
    if (typeof window !== 'undefined') {
      if (typeof window.toast === 'function') window.toast(msg);
      else if (typeof window.showToast === 'function') window.showToast(msg, type);
      else console.log(`[AFM ${type.toUpperCase()}] ${msg}`);
    }
  }

  function handleBuyOrSellProperty(state, propId, action = 'buy') {
    const c = ensureCareerState(state);
    const prop = findPropertyItem(propId);
    if (!prop) return;

    const currentEntry = c.properties[prop.id];
    const count = typeof currentEntry === 'number' ? currentEntry : (currentEntry?.count || 0);

    if (action === 'buy') {
      if (c.cash < prop.price) {
        notify(`Saldo pessoal insuficiente! Faltam ${formatBRL(prop.price - c.cash)}.`, 'error');
        return;
      }
      c.cash = round2(c.cash - prop.price);
      c.properties[prop.id] = { count: count + 1, currentValue: prop.price };
      c.prestige = Math.min(99, c.prestige + prop.prestige);
      notify(`🏡 ${prop.name} adquirido! (+${formatBRL(prop.rent)}/mês de aluguel)`);
    } else if (action === 'sell') {
      if (count <= 0) return;
      const sellValue = Math.round((currentEntry?.currentValue || prop.price) * 0.85);
      c.cash = round2(c.cash + sellValue);
      if (count - 1 <= 0) delete c.properties[prop.id];
      else c.properties[prop.id] = { count: count - 1, currentValue: currentEntry?.currentValue || prop.price };
      notify(`💰 Imóvel vendido por ${formatBRL(sellValue)} (85% do valor de mercado).`);
    }

    calculateCareerEconomy(state);
    if (typeof window !== 'undefined' && typeof window.save === 'function') window.save();
    if (typeof window !== 'undefined' && typeof window.render === 'function') window.render();
  }

  function handleBuyOrUpgradeBusiness(state, bizId) {
    const c = ensureCareerState(state);
    const biz = findBusinessItem(bizId);
    if (!biz) return;

    const currentLvl = Number(c.businesses[biz.id] || 0);
    if (currentLvl >= biz.maxLevel) {
      notify(`${biz.name} já está no nível máximo (${biz.maxLevel})!`, 'info');
      return;
    }

    const cost = currentLvl === 0 ? biz.price : Math.round(biz.price * (0.75 * currentLvl));
    if (c.cash < cost) {
      notify(`Saldo pessoal insuficiente! Faltam ${formatBRL(cost - c.cash)}.`, 'error');
      return;
    }

    c.cash = round2(c.cash - cost);
    c.businesses[biz.id] = currentLvl + 1;
    if (biz.id === 'rede_hoteis' && currentLvl === 0) {
      c.prestige = Math.min(99, c.prestige + 15);
    }

    calculateCareerEconomy(state);
    notify(
      currentLvl === 0
        ? `🚀 ${biz.name} inaugurado! Bônus ativo: ${biz.perk}`
        : `⬆️ ${biz.name} expandido para o Nível ${currentLvl + 1}!`
    );
    if (typeof window !== 'undefined' && typeof window.save === 'function') window.save();
    if (typeof window !== 'undefined' && typeof window.render === 'function') window.render();
  }

  function handleBuyOrSellVehicle(state, vehId, action = 'buy') {
    const c = ensureCareerState(state);
    const veh = findVehicleItem(vehId);
    if (!veh) return;

    const owned = Boolean(c.vehicles[veh.id]);
    if (action === 'buy') {
      if (owned) {
        notify(`Você já possui ${veh.name} na garagem!`, 'info');
        return;
      }
      if (c.cash < veh.price) {
        notify(`Saldo pessoal insuficiente! Faltam ${formatBRL(veh.price - c.cash)}.`, 'error');
        return;
      }
      c.cash = round2(c.cash - veh.price);
      c.vehicles[veh.id] = true;
      c.prestige = Math.min(99, c.prestige + veh.prestige);
      notify(`🏎️ ${veh.name} adicionado à sua Garagem VIP! (+${veh.prestige} Prestígio)`);
    } else if (action === 'sell') {
      if (!owned) return;
      const refund = Math.round(veh.price * 0.75);
      c.cash = round2(c.cash + refund);
      delete c.vehicles[veh.id];
      notify(`💰 ${veh.name} vendido por ${formatBRL(refund)}.`);
    }

    calculateCareerEconomy(state);
    if (typeof window !== 'undefined' && typeof window.save === 'function') window.save();
    if (typeof window !== 'undefined' && typeof window.render === 'function') window.render();
  }

  function handleBuyLicense(state, licId) {
    const c = ensureCareerState(state);
    const lic = LICENSES_CATALOG.find(l => l.id === licId);
    if (!lic) return;

    if (c.unlockedLicenses.includes(lic.id)) {
      c.licenseId = lic.id;
      calculateCareerEconomy(state);
      notify(`🎓 Licença ${lic.name} ativada!`);
      return;
    }

    if (c.prestige < lic.reqPrestige) {
      notify(`Prestígio insuficiente! Requer Prestígio ${lic.reqPrestige}+ (Atual: ${c.prestige}).`, 'error');
      return;
    }

    if (c.cash < lic.cost) {
      notify(`Patrimônio líquido insuficiente! Faltam ${formatBRL(lic.cost - c.cash)}.`, 'error');
      return;
    }

    c.cash = round2(c.cash - lic.cost);
    if (!c.unlockedLicenses.includes(lic.id)) c.unlockedLicenses.push(lic.id);
    c.licenses = c.unlockedLicenses;
    c.licenseId = lic.id;
    if (typeof localStorage !== 'undefined') {
      try { localStorage.setItem('afm_user_license_id', lic.id); } catch (e) {}
    }
    calculateCareerEconomy(state);
    notify(`🎓 Parabéns! Você conquistou a ${lic.name} (+${lic.salaryBonusPct}% no salário)!`);
    if (typeof window !== 'undefined' && typeof window.save === 'function') window.save();
    if (typeof window !== 'undefined' && typeof window.render === 'function') window.render();
  }

  // =========================================================================
  // 7. DELEGAÇÃO GLOBAL DE EVENTOS (ANTI-BUG DE CLIQUE APÓS RE-RENDER)
  // =========================================================================
  function bindGlobalCareerEvents() {
    if (typeof window === 'undefined' || window.__AFM_CAREER_DELEGATED__) return;
    window.__AFM_CAREER_DELEGATED__ = true;

    if (typeof document === 'undefined') return;

    document.addEventListener('click', function (ev) {
      const state = (typeof window !== 'undefined') ? (window.state || window.GameState || window.STATE || window.appState) : null;
      if (!state) return;

      // 1. Comprar / Vender Imóvel
      const btnProp = ev.target.closest ? ev.target.closest('.btnBuyProp, .btnSellProp') : null;
      if (btnProp) {
        ev.preventDefault();
        const propId = btnProp.getAttribute('data-prop-id');
        const action = btnProp.classList.contains('btnSellProp') ? 'sell' : 'buy';
        handleBuyOrSellProperty(state, propId, action);
        return;
      }

      // 2. Abrir / Expandir Empreendimento
      const btnBiz = ev.target.closest ? ev.target.closest('.btnBuyBiz') : null;
      if (btnBiz) {
        ev.preventDefault();
        handleBuyOrUpgradeBusiness(state, btnBiz.getAttribute('data-biz-id'));
        return;
      }

      // 3. Comprar / Vender Veículo
      const btnVeh = ev.target.closest ? ev.target.closest('.btnBuyVeh, .btnSellVeh') : null;
      if (btnVeh) {
        ev.preventDefault();
        const vehId = btnVeh.getAttribute('data-veh-id');
        const action = btnVeh.classList.contains('btnSellVeh') ? 'sell' : 'buy';
        handleBuyOrSellVehicle(state, vehId, action);
        return;
      }

      // 4. Comprar Licença CBF / UEFA
      const btnLic = ev.target.closest ? ev.target.closest('.btn-buy-lic') : null;
      if (btnLic && !btnLic.disabled) {
        ev.preventDefault();
        btnLic.disabled = true; // trava duplo clique
        handleBuyLicense(state, btnLic.getAttribute('data-id'));
        return;
      }

      // 5. Botão "Comprar Ações no Pregão" dentro do P2P
      const btnPregao = ev.target.closest ? ev.target.closest('.btnGoToPregao') : null;
      if (btnPregao) {
        ev.preventDefault();
        const tableEl = document.getElementById('pregao-saf-full-table');
        if (tableEl) {
          tableEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          tableEl.style.boxShadow = '0 0 0 2px #10b981, 0 0 24px rgba(16,185,129,0.45)';
          setTimeout(() => { tableEl.style.boxShadow = ''; }, 1800);
        }
        return;
      }
    });
  }

  // Expõe API global para os renderizadores do jogo
  const AFMCareerFix = {
    PROPERTIES_CATALOG,
    BUSINESSES_CATALOG,
    VEHICLES_CATALOG,
    LICENSES_CATALOG,
    KNOWN_SAF_CLUBS,
    isClubSaf,
    ensureCareerState,
    calculateCareerEconomy,
    normalizeAndSortRanking,
    generateSafeX1Token,
    parseSafeX1Token,
    simulateX1Duel,
    sanitizeCoachName,
    resolveCountryFromLeague,
    handleBuyOrSellProperty,
    handleBuyOrUpgradeBusiness,
    handleBuyOrSellVehicle,
    handleBuyLicense,
    formatBRL,
    formatBRLCompact,
    round2
  };

  if (typeof window !== 'undefined') {
    window.AFMCareerFix = AFMCareerFix;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AFMCareerFix;
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', bindGlobalCareerEvents);
    } else {
      bindGlobalCareerEvents();
    }
  }
})(typeof window !== 'undefined' ? window : global);
