// ==============================================================================
// AFM MANAGER 2027 — COTAS REALISTAS, DIVIDENDOS E SIMULADOR DE VIDA DO TREINADOR
// Arquivo: js/systems/manager_life_and_shares_pro.js
// BLOCO 02 — 100% ISOLADO NO SAVE DO USUÁRIO
// ==============================================================================

(function (window) {
  'use strict';

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

  const ManagerLifeAndSharesPro = {
    realEstate: REAL_ESTATE_CATALOG,
    businesses: LIFE_BUSINESS_CATALOG,
    garage: LUXURY_GARAGE_CATALOG,

    ensureState(state) {
      if (!state) return;
      if (window.AFM_NormalizeBankLoans) window.AFM_NormalizeBankLoans(state);
      state.managerPersonal = state.managerPersonal || {
        name: state.managerName || state.manager || 'Aquino',
        personalBalance: 120000,
        salary: 18000,
        clubSharesPct: state.managerPersonal?.clubShares || 0,
        externalShareholdersPct: 22,
        properties: [],
        businesses: [],
        vehicles: [],
        prestigeScore: 5,
        lastDividendPaidByClub: 0,
        lastDividendReceivedByManager: 0
      };
      if (typeof state.managerPersonal.clubSharesPct !== 'number') {
        state.managerPersonal.clubSharesPct = Number(state.managerPersonal.clubShares || 0);
      }
      if (!Array.isArray(state.managerPersonal.properties)) state.managerPersonal.properties = [];
      if (!Array.isArray(state.managerPersonal.businesses)) state.managerPersonal.businesses = [];
      if (!Array.isArray(state.managerPersonal.vehicles)) state.managerPersonal.vehicles = [];
      if (typeof state.managerPersonal.externalShareholdersPct !== 'number') {
        state.managerPersonal.externalShareholdersPct = 22;
      }
      state.financeLog = Array.isArray(state.financeLog) ? state.financeLog : [];
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
      state.clubBalance = (state.clubBalance || 0) + cost;
      state.balance = state.clubBalance;
      state.financeLog.unshift({
        date: state.date || state.currentDate || '2026',
        type: 'RECEITA',
        title: `Subscrição de Cotas (+${pctToBuy}% por Téc. ${mp.name})`,
        amount: cost
      });

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
      const mp = state.managerPersonal;
      const { onePercentPrice } = this.getClubValuationAndSharePrice(state);
      const dividendPerOnePercent = Math.round(onePercentPrice * 0.0065);
      const totalShareholdersPct = (mp.externalShareholdersPct || 22) + (mp.clubSharesPct || 0);
      const totalClubDividendExpense = Math.round(dividendPerOnePercent * totalShareholdersPct);
      const managerDividendShare = Math.round(dividendPerOnePercent * (mp.clubSharesPct || 0));
      return { totalClubDividendExpense, managerDividendShare, totalShareholdersPct };
    },

    processMonthlyLifeAndDividendsTurn(state) {
      this.ensureState(state);
      const mp = state.managerPersonal;
      const { totalClubDividendExpense, managerDividendShare, totalShareholdersPct } = this.calculateMonthlyClubDividendExpense(state);

      state.clubBalance = (state.clubBalance || state.balance || 0) - totalClubDividendExpense;
      state.balance = state.clubBalance;
      state.lastMonthDividendExpense = totalClubDividendExpense;
      mp.lastDividendPaidByClub = totalClubDividendExpense;
      mp.lastDividendReceivedByManager = managerDividendShare;

      state.financeLog.unshift({
        date: state.date || state.currentDate || 'Dia 1º',
        type: 'DESPESA',
        title: `Dividendos pagos aos Acionistas (${totalShareholdersPct.toFixed(2)}% cotas ativas)`,
        amount: -totalClubDividendExpense
      });

      const salary = mp.salary || 18000;
      state.clubBalance -= salary;
      state.balance = state.clubBalance;

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

      mp.personalBalance += salary + managerDividendShare + rentIncome + businessIncome;

      return {
        totalClubDividendExpense,
        managerDividendShare,
        salary,
        rentIncome,
        businessIncome,
        newPersonalBalance: mp.personalBalance
      };
    },

    // Renderiza o painel completo da Carreira + Simulador de Vida + Cotas
    renderLifeAndSharesUI(containerId, state) {
      const container = (typeof document !== 'undefined' && typeof containerId === 'string') ? document.getElementById(containerId) : containerId;
      if (!container) return;
      this.ensureState(state);
      const mp = state.managerPersonal;
      const { totalValuation, onePercentPrice, quarterPercentPrice } = this.getClubValuationAndSharePrice(state);

      container.innerHTML = `
        <div class="life-shares-container" style="display:flex;flex-direction:column;gap:18px;">
          
          <!-- BANNER DO TREINADOR: SALDO, SALÁRIO, COTAS E PRESTÍGIO -->
          <div style="background:radial-gradient(circle at top left, #2e1065, #0f172a);border:1px solid #7c3aed;border-radius:14px;padding:20px;box-shadow:0 10px 25px rgba(0,0,0,0.4);">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px;">
              <div>
                <span class="pill" style="background:#7c3aed;color:#fff;font-weight:900;font-size:10px;text-transform:uppercase;">CONTA PESSOAL DO TÉCNICO</span>
                <h2 style="margin:6px 0 2px 0;font-size:22px;color:#fff;font-weight:900;">Téc. ${mp.name || 'Aquino'}</h2>
                <div style="font-size:12px;color:#cbd5e1;">Prestígio Social: <b style="color:#facc15;">★ ${mp.prestigeScore || 5} Pontos</b> | Clube: <b>${state.club || 'Seu Clube'}</b></div>
              </div>
              <div style="text-align:right;">
                <div style="font-size:11px;color:#94a3b8;font-weight:700;text-transform:uppercase;">Patrimônio Pessoal Líquido</div>
                <div style="font-size:26px;font-weight:900;color:#4ade80;">R$ ${(mp.personalBalance || 0).toLocaleString('pt-BR')}</div>
                <div style="font-size:11px;color:#38bdf8;">Salário: R$ ${(mp.salary || 18000).toLocaleString('pt-BR')}/mês</div>
              </div>
            </div>
          </div>

          <!-- SEÇÃO 1: BOLSA SOCIETÁRIA DO CLUBE (COTAS VALORIZADAS + DIVIDENDOS) -->
          <div style="background:#111827;border:1px solid #374151;border-radius:14px;padding:18px;">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:14px;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:10px;">
              <div>
                <h3 style="margin:0;font-size:16px;color:#fff;font-weight:900;display:flex;align-items:center;gap:8px;">
                  🏛️ Bolsa Societária do Clube & Valuation Real
                </h3>
                <div style="font-size:11px;color:#9ca3af;">Participe dos lucros reais: o clube desconta mensalmente dividendos do caixa para os acionistas!</div>
              </div>
              <span class="pill" style="background:#1e3a8a;color:#93c5fd;font-weight:900;font-size:11px;">
                Valuation: R$ ${totalValuation.toLocaleString('pt-BR')}
              </span>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(210px, 1fr));gap:12px;margin-bottom:16px;">
              <div style="background:#1f2937;padding:12px;border-radius:10px;border-left:4px solid #10b981;">
                <div style="font-size:11px;color:#9ca3af;text-transform:uppercase;font-weight:700;">Preço de 1% de Cotas</div>
                <div style="font-size:18px;font-weight:900;color:#fff;margin-top:2px;">R$ ${onePercentPrice.toLocaleString('pt-BR')}</div>
                <div style="font-size:11px;color:#10b981;">Fração 0,25%: R$ ${quarterPercentPrice.toLocaleString('pt-BR')}</div>
              </div>

              <div style="background:#1f2937;padding:12px;border-radius:10px;border-left:4px solid #8b5cf6;">
                <div style="font-size:11px;color:#9ca3af;text-transform:uppercase;font-weight:700;">Sua Participação Ativa</div>
                <div style="font-size:18px;font-weight:900;color:#c084fc;margin-top:2px;">${(mp.clubSharesPct || 0).toFixed(2)}% <span style="font-size:11px;color:#94a3b8;">/ máx 25%</span></div>
                <div style="font-size:11px;color:#38bdf8;">Último dividendo recebido: R$ ${(mp.lastDividendReceivedByManager || 0).toLocaleString('pt-BR')}</div>
              </div>

              <div style="background:#1f2937;padding:12px;border-radius:10px;border-left:4px solid #f59e0b;">
                <div style="font-size:11px;color:#9ca3af;text-transform:uppercase;font-weight:700;">Despesa Mensal do Clube</div>
                <div style="font-size:18px;font-weight:900;color:#fcd34d;margin-top:2px;">R$ ${(mp.lastDividendPaidByClub || 0).toLocaleString('pt-BR')}</div>
                <div style="font-size:11px;color:#f87171;">Lançado nas despesas do Escritório</div>
              </div>
            </div>

            <div style="display:flex;gap:10px;flex-wrap:wrap;">
              <button class="btn primary" id="btnBuyQuarterShare" style="background:#10b981;border:none;font-weight:800;padding:10px 16px;border-radius:8px;font-size:12px;">
                ➕ Comprar +0,25% (R$ ${quarterPercentPrice.toLocaleString('pt-BR')})
              </button>
              <button class="btn primary" id="btnBuyFullShare" style="background:#059669;border:none;font-weight:800;padding:10px 16px;border-radius:8px;font-size:12px;">
                ➕ Comprar +1,00% (R$ ${onePercentPrice.toLocaleString('pt-BR')})
              </button>
              <button class="btn" id="btnSellQuarterShare" style="background:#374151;color:#f87171;border:1px solid #4b5563;font-weight:800;padding:10px 16px;border-radius:8px;font-size:12px;">
                ➖ Vender 0,25% de Cotas
              </button>
            </div>
          </div>

          <!-- SEÇÃO 2: SIMULADOR DE VIDA — IMÓVEIS (ALUGUEL MENSAL & VALORIZAÇÃO) -->
          <div style="background:#111827;border:1px solid #374151;border-radius:14px;padding:18px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
              <div>
                <h3 style="margin:0;font-size:16px;color:#fff;font-weight:900;">🏡 Portfólio Imobiliário do Treinador</h3>
                <div style="font-size:11px;color:#9ca3af;">Imóveis de alto padrão que valorizam todo mês e geram renda passiva de aluguel.</div>
              </div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(240px, 1fr));gap:12px;">
              ${REAL_ESTATE_CATALOG.map((prop) => {
                const owned = (mp.properties || []).some((p) => p.id === prop.id);
                return `
                  <div style="background:#1f2937;border:1px solid ${owned ? '#10b981' : '#374151'};border-radius:10px;padding:14px;display:flex;flex-direction:column;justify-content:space-between;">
                    <div>
                      <div style="font-size:24px;margin-bottom:4px;">${prop.icon}</div>
                      <div style="font-size:13px;font-weight:900;color:#fff;">${prop.name}</div>
                      <div style="font-size:12px;color:#4ade80;font-weight:800;margin-top:2px;">R$ ${prop.cost.toLocaleString('pt-BR')}</div>
                      <div style="font-size:11px;color:#38bdf8;margin-top:4px;">+R$ ${prop.monthlyRent.toLocaleString('pt-BR')}/mês de aluguel</div>
                      <div style="font-size:10px;color:#9ca3af;margin-top:2px;">★ +${prop.prestige} Prestígio | Valorização: +${Math.round(prop.appreciationRate * 100)}%/ano</div>
                    </div>
                    <button class="btn btnBuyProp" data-prop-id="${prop.id}" ${owned ? 'disabled' : ''} style="margin-top:12px;background:${owned ? '#065f46' : '#7c3aed'};color:#fff;border:none;font-weight:800;padding:8px 12px;border-radius:6px;font-size:11px;">
                      ${owned ? '✓ Imóvel Adquirido' : '🔑 Comprar Imóvel'}
                    </button>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- SEÇÃO 3: EMPRESAS & NEGÓCIOS PRÓPRIOS -->
          <div style="background:#111827;border:1px solid #374151;border-radius:14px;padding:18px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
              <div>
                <h3 style="margin:0;font-size:16px;color:#fff;font-weight:900;">💼 Empreendimentos & Negócios</h3>
                <div style="font-size:11px;color:#9ca3af;">Monte sua rede comercial extracampo com lucros mensais e bônus reais para o seu clube.</div>
              </div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(240px, 1fr));gap:12px;">
              ${LIFE_BUSINESS_CATALOG.map((biz) => {
                const existing = (mp.businesses || []).find((b) => b.id === biz.id || b.typeId === biz.id);
                const lvl = existing?.level || 0;
                return `
                  <div style="background:#1f2937;border:1px solid ${lvl > 0 ? '#38bdf8' : '#374151'};border-radius:10px;padding:14px;display:flex;flex-direction:column;justify-content:space-between;">
                    <div>
                      <div style="font-size:24px;margin-bottom:4px;">${biz.icon}</div>
                      <div style="font-size:13px;font-weight:900;color:#fff;">${biz.name}</div>
                      <div style="font-size:11px;color:#c084fc;font-weight:800;margin-top:2px;">${biz.bonusText}</div>
                      <div style="font-size:12px;color:#4ade80;font-weight:800;margin-top:4px;">Lucro est.: R$ ${(existing?.monthlyProfit || biz.monthlyProfit).toLocaleString('pt-BR')}/mês</div>
                      <div style="font-size:10px;color:#9ca3af;margin-top:2px;">Nível: ${lvl > 0 ? `Nível ${lvl}/5` : 'Não inaugurado'}</div>
                    </div>
                    <button class="btn btnBuyBiz" data-biz-id="${biz.id}" style="margin-top:12px;background:${lvl > 0 ? '#0284c7' : '#2563eb'};color:#fff;border:none;font-weight:800;padding:8px 12px;border-radius:6px;font-size:11px;">
                      ${lvl === 0 ? `🚀 Abrir (R$ ${biz.cost.toLocaleString('pt-BR')})` : lvl >= 5 ? '★ Nível Máximo' : `⚡ Expandir Nível ${lvl + 1}`}
                    </button>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- SEÇÃO 4: GARAGEM DE LUXO -->
          <div style="background:#111827;border:1px solid #374151;border-radius:14px;padding:18px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
              <div>
                <h3 style="margin:0;font-size:16px;color:#fff;font-weight:900;">🏎️ Garagem de Luxo & Transporte VIP</h3>
                <div style="font-size:11px;color:#9ca3af;">Veículos de alta cilindrada e aviação executiva que elevam seu prestígio mundial.</div>
              </div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(240px, 1fr));gap:12px;">
              ${LUXURY_GARAGE_CATALOG.map((veh) => {
                const owned = (mp.vehicles || []).some((v) => v.id === veh.id);
                return `
                  <div style="background:#1f2937;border:1px solid ${owned ? '#f59e0b' : '#374151'};border-radius:10px;padding:14px;display:flex;flex-direction:column;justify-content:space-between;">
                    <div>
                      <div style="font-size:24px;margin-bottom:4px;">${veh.icon}</div>
                      <div style="font-size:13px;font-weight:900;color:#fff;">${veh.name}</div>
                      <div style="font-size:12px;color:#facc15;font-weight:800;margin-top:2px;">R$ ${veh.cost.toLocaleString('pt-BR')}</div>
                      <div style="font-size:11px;color:#cbd5e1;margin-top:4px;">★ +${veh.prestige} Prestígio | ${veh.bonusText}</div>
                    </div>
                    <button class="btn btnBuyVeh" data-veh-id="${veh.id}" ${owned ? 'disabled' : ''} style="margin-top:12px;background:${owned ? '#78350f' : '#d97706'};color:#fff;border:none;font-weight:800;padding:8px 12px;border-radius:6px;font-size:11px;">
                      ${owned ? '✓ Na Garagem' : '🏎️ Comprar'}
                    </button>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

        </div>
      `;

      // Event Listeners
      const btnBuyQ = container.querySelector('#btnBuyQuarterShare');
      if (btnBuyQ) {
        btnBuyQ.onclick = () => {
          const res = this.buyShareFraction(state, 0.25);
          if (window.toast) window.toast(res.message);
          this.renderLifeAndSharesUI(containerId, state);
          if (window.save) window.save();
        };
      }

      const btnBuyF = container.querySelector('#btnBuyFullShare');
      if (btnBuyF) {
        btnBuyF.onclick = () => {
          const res = this.buyShareFraction(state, 1.0);
          if (window.toast) window.toast(res.message);
          this.renderLifeAndSharesUI(containerId, state);
          if (window.save) window.save();
        };
      }

      const btnSellQ = container.querySelector('#btnSellQuarterShare');
      if (btnSellQ) {
        btnSellQ.onclick = () => {
          const res = this.sellShareFraction(state, 0.25);
          if (window.toast) window.toast(res.message);
          this.renderLifeAndSharesUI(containerId, state);
          if (window.save) window.save();
        };
      }

      container.querySelectorAll('.btnBuyProp').forEach((btn) => {
        btn.onclick = () => {
          const res = this.buyProperty(state, btn.dataset.propId);
          if (window.toast) window.toast(res.message);
          this.renderLifeAndSharesUI(containerId, state);
          if (window.save) window.save();
        };
      });

      container.querySelectorAll('.btnBuyBiz').forEach((btn) => {
        btn.onclick = () => {
          const res = this.buyOrUpgradeBusiness(state, btn.dataset.bizId);
          if (window.toast) window.toast(res.message);
          this.renderLifeAndSharesUI(containerId, state);
          if (window.save) window.save();
        };
      });

      container.querySelectorAll('.btnBuyVeh').forEach((btn) => {
        btn.onclick = () => {
          const res = this.buyVehicle(state, btn.dataset.vehId);
          if (window.toast) window.toast(res.message);
          this.renderLifeAndSharesUI(containerId, state);
          if (window.save) window.save();
        };
      });
    }
  };

  window.AFM_LifeAndSharesPro = ManagerLifeAndSharesPro;
})(typeof window !== 'undefined' ? window : global);
