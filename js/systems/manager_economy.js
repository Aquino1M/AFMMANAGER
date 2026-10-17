(function (window) {
  'use strict';

  const BUSINESS_CATALOG = [
    {
      typeId: 'escolinha',
      name: 'Escolinha de futebol',
      cost: 300000,
      baseMonthlyReturn: 14500,
      maintenanceCost: 2500,
      icon: '⚽',
      description: 'Gera renda mensal e pode revelar jovens talentos gratuitos para a base do seu clube.'
    },
    {
      typeId: 'loja_esportiva',
      name: 'Loja de artigos esportivos',
      cost: 600000,
      baseMonthlyReturn: 31000,
      maintenanceCost: 5000,
      icon: '🎽',
      description: 'Comércio de chuteiras, camisas oficiais e materiais esportivos com alto giro.'
    },
    {
      typeId: 'restaurante',
      name: 'Restaurante',
      cost: 1200000,
      baseMonthlyReturn: 68000,
      maintenanceCost: 11000,
      icon: '🍽️',
      description: 'Gastronomia de alto padrão frequentada por atletas, empresários e torcedores.'
    }
  ];

  const COACH_COURSES = [
    { id: 'licenca_pro', name: 'Licença CONMEBOL/UEFA PRO', cost: 180000, bonusDesc: '+5% Evolução Tática do Elenco', icon: '📜' },
    { id: 'fisiologia', name: 'Especialização em Fisiologia', cost: 120000, bonusDesc: '-15% Risco de Lesão Muscular', icon: '🩺' },
    { id: 'mba_gestao', name: 'MBA em Gestão Esportiva', cost: 250000, bonusDesc: '+10% Lucro Mensal nos Seus Negócios', icon: '📊' }
  ];

  function showMessage(msg) {
    if (typeof window.showToast === 'function') {
      window.showToast(msg);
    } else if (typeof window.toast === 'function') {
      window.toast(msg);
    }
  }

  const ManagerEconomySystem = {
    catalog: BUSINESS_CATALOG,
    courses: COACH_COURSES,

    getSharePrice(state) {
      if (!state) return 16000;
      const annualRevenue = state.estimatedAnnualRevenue || 1600000;
      const divisionMultiplier = state.clubDivision === 1 ? 2.5 : state.clubDivision === 2 ? 1.5 : 1.0;
      const rawPrice = Math.round((annualRevenue * 0.01) * divisionMultiplier);
      return Math.max(16000, state.managerPersonal?.shareBasePrice || rawPrice);
    },

    buyClubShare(state) {
      if (window.AFM_Guards && typeof window.AFM_Guards.migrateSaveState === 'function') {
        window.AFM_Guards.migrateSaveState(state);
      }
      const mp = state.managerPersonal;
      const price = this.getSharePrice(state);

      if (mp.clubShares >= 10) {
        return { ok: false, message: 'Você já atingiu o limite máximo de 10 cotas (10% do clube).' };
      }
      if (mp.personalBalance < price) {
        return { ok: false, message: `Saldo pessoal insuficiente. Necessário: R$ ${price.toLocaleString('pt-BR')}.` };
      }

      mp.personalBalance -= price;
      mp.clubShares += 1;
      mp.shareBasePrice = price;
      state.clubBalance = (state.clubBalance || state.balance || 0) + price;
      state.balance = state.clubBalance;

      state.confidence = state.confidence || { board: 75, fans: 75, squad: 75 };
      state.confidence.board = Math.min(100, (state.confidence.board || 75) + 1);
      if (state.trust) state.trust.board = state.confidence.board;

      return {
        ok: true,
        message: `Cota adquirida por R$ ${price.toLocaleString('pt-BR')}! O valor entrou direto no caixa do clube. Você possui ${mp.clubShares}/10 cotas.`
      };
    },

    onDivisionChangeUpdateSharePrice(state, promoted, relegated) {
      if (window.AFM_Guards && typeof window.AFM_Guards.migrateSaveState === 'function') {
        window.AFM_Guards.migrateSaveState(state);
      }
      const current = this.getSharePrice(state);
      if (promoted) state.managerPersonal.shareBasePrice = Math.round(current * 1.35);
      if (relegated) state.managerPersonal.shareBasePrice = Math.max(8000, Math.round(current * 0.75));
    },

    getBoardDefeatProtectionFactor(state) {
      const shares = state?.managerPersonal?.clubShares || 0;
      const reductionPercent = Math.min(30, shares * 3);
      return 1 - (reductionPercent / 100);
    },

    liquidateSharesOnClubExit(state) {
      const mp = state?.managerPersonal;
      if (!mp || !mp.clubShares || mp.clubShares <= 0) return 0;
      const currentPrice = this.getSharePrice(state);
      const totalPayout = mp.clubShares * currentPrice;
      mp.personalBalance += totalPayout;
      mp.clubShares = 0;
      return totalPayout;
    },

    processAnnualShareDividends(state, annualClubProfit) {
      const mp = state?.managerPersonal;
      if (!mp || mp.clubShares <= 0 || annualClubProfit <= 0) return 0;

      const sharePrice = this.getSharePrice(state);
      const totalSharesValue = mp.clubShares * sharePrice;
      const rawDividend = Math.round(annualClubProfit * (mp.clubShares * 0.01));
      const maxCap = Math.round(totalSharesValue * 0.25);
      const finalDividend = Math.min(rawDividend, maxCap);

      mp.personalBalance += finalDividend;
      state.clubBalance = (state.clubBalance || state.balance || 0) - finalDividend;
      state.balance = state.clubBalance;
      return finalDividend;
    },

    openBusiness(state, typeId) {
      if (window.AFM_Guards && typeof window.AFM_Guards.migrateSaveState === 'function') {
        window.AFM_Guards.migrateSaveState(state);
      }
      const mp = state.managerPersonal;
      const item = BUSINESS_CATALOG.find((b) => b.typeId === typeId);
      if (!item) return { ok: false, message: 'Tipo de negócio inválido.' };

      if (mp.personalBalance < item.cost) {
        return {
          ok: false,
          message: `Patrimônio pessoal insuficiente! Custo de abertura: R$ ${item.cost.toLocaleString('pt-BR')}.`
        };
      }

      mp.personalBalance -= item.cost;
      const newBiz = {
        id: `biz_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        typeId: item.typeId,
        name: item.name,
        icon: item.icon,
        level: 1,
        hasManager: false,
        investedCapital: item.cost,
        baseMonthlyReturn: item.baseMonthlyReturn,
        maintenanceCost: item.maintenanceCost,
        managementScore: 100,
        lastMonthResult: 0,
        accumulatedProfit: 0,
        createdAt: state.date || state.currentDate || '2026'
      };
      mp.businesses = mp.businesses || [];
      mp.businesses.push(newBiz);

      return {
        ok: true,
        business: newBiz,
        message: `${item.icon} ${item.name} inaugurado(a) com sucesso!`
      };
    },

    upgradeBusiness(state, bizId) {
      const mp = state?.managerPersonal;
      if (!mp) return { ok: false, message: 'Treinador não encontrado.' };
      const biz = (mp.businesses || []).find((b) => b.id === bizId);
      if (!biz) return { ok: false, message: 'Negócio não encontrado.' };
      if (biz.level >= 3) return { ok: false, message: 'Nível máximo (Nível 3) atingido.' };

      const upgradeCost = Math.round(biz.investedCapital * 0.6);
      if (mp.personalBalance < upgradeCost) {
        return { ok: false, message: `Saldo insuficiente para expandir (Custo: R$ ${upgradeCost.toLocaleString('pt-BR')}).` };
      }

      mp.personalBalance -= upgradeCost;
      biz.level = (biz.level || 1) + 1;
      biz.investedCapital += upgradeCost;
      biz.baseMonthlyReturn = Math.round(biz.baseMonthlyReturn * 1.65);
      return { ok: true, message: `${biz.name} expandido com sucesso para o Nível ${biz.level}!` };
    },

    maintainBusiness(state, bizId) {
      const mp = state?.managerPersonal;
      if (!mp) return { ok: false, message: 'Dados do treinador indisponíveis.' };
      const biz = (mp.businesses || []).find((b) => b.id === bizId);
      if (!biz) return { ok: false, message: 'Negócio não encontrado.' };
      if (biz.managementScore >= 100) {
        return { ok: false, message: 'A gestão deste negócio já está em 100%!' };
      }

      const cost = biz.maintenanceCost || 3000;
      if (mp.personalBalance < cost) {
        return { ok: false, message: `Saldo pessoal insuficiente para manutenção (R$ ${cost.toLocaleString('pt-BR')}).` };
      }

      mp.personalBalance -= cost;
      biz.managementScore = 100;
      return { ok: true, message: `Gestão de ${biz.name} restaurada para 100%!` };
    },

    enrollInCourse(state, courseId) {
      if (window.AFM_Guards && typeof window.AFM_Guards.migrateSaveState === 'function') {
        window.AFM_Guards.migrateSaveState(state);
      }
      const mp = state.managerPersonal;
      mp.coursesCompleted = mp.coursesCompleted || [];
      if (mp.coursesCompleted.includes(courseId)) {
        return { ok: false, message: 'Você já concluiu este curso!' };
      }

      const course = COACH_COURSES.find((c) => c.id === courseId);
      if (!course) return { ok: false, message: 'Curso inválido.' };
      if (mp.personalBalance < course.cost) {
        return { ok: false, message: `Saldo pessoal insuficiente (R$ ${course.cost.toLocaleString('pt-BR')}).` };
      }

      mp.personalBalance -= course.cost;
      mp.coursesCompleted.push(courseId);
      return { ok: true, message: `Parabéns! Você concluiu: ${course.name} (${course.bonusDesc})!` };
    },

    processMonthlyTurn(state) {
      if (!state) return null;
      if (window.AFM_Guards && typeof window.AFM_Guards.migrateSaveState === 'function') {
        window.AFM_Guards.migrateSaveState(state);
      }
      const mp = state.managerPersonal;

      const salary = mp.salary || state.managerSalary || 15000;
      mp.personalBalance = (mp.personalBalance || 0) + salary;
      state.clubBalance = (state.clubBalance || state.balance || 0) - salary;
      state.balance = state.clubBalance;
      state.managerMoney = mp.personalBalance;

      const hasMba = (mp.coursesCompleted || []).includes('mba_gestao');
      let totalBusinessNet = 0;
      const report = [];

      (mp.businesses || []).forEach((biz) => {
        const marketWave = 0.85 + (Math.random() * 0.35);
        const mgmtFactor = (biz.managementScore - 35) / 65;
        const mbaMult = hasMba ? 1.10 : 1.0;
        const netResult = Math.round(biz.baseMonthlyReturn * marketWave * mgmtFactor * mbaMult);

        biz.lastMonthResult = netResult;
        biz.accumulatedProfit = (biz.accumulatedProfit || 0) + netResult;
        mp.personalBalance += netResult;
        state.managerMoney = mp.personalBalance;
        totalBusinessNet += netResult;

        const decay = biz.hasManager ? 1 : 3;
        biz.managementScore = Math.max(0, (biz.managementScore || 100) - decay);

        report.push({
          name: biz.name,
          netResult,
          managementScore: biz.managementScore
        });

        // Chance da Escolinha revelar jovem promessa para as categorias de base
        if (biz.typeId === 'escolinha' && Math.random() < 0.28 && Array.isArray(state.youthAcademy)) {
          const firstNames = ['Matheus', 'Lucas', 'Gabriel', 'Enzo', 'Cauã', 'Arthur', 'Felipe', 'Davi', 'Rodrigo', 'Thiago'];
          const lastNames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Pereira', 'Ferreira', 'Alves', 'Ribeiro', 'Costa', 'Carvalho'];
          const posList = ['ATA', 'MEI', 'VOL', 'ZAG', 'LAT', 'GOL'];
          const rPos = posList[Math.floor(Math.random() * posList.length)];
          const rName = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
          const youthPlayer = {
            id: `youth_escolinha_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            name: rName,
            pos: rPos,
            age: 16,
            overall: 63 + Math.floor(Math.random() * 6),
            potential: 80 + Math.floor(Math.random() * 11),
            salary: 1200,
            contractUntil: (Number(state.season) || 2026) + 3,
            morale: 90,
            fitness: 100,
            source: 'Escolinha de Futebol do Treinador'
          };
          state.youthAcademy.unshift(youthPlayer);
          state.news = Array.isArray(state.news) ? state.news : [];
          state.news.unshift(`⚽ ESCOLINHA DO PROFESSOR: Sua escolinha revelou uma jovem promessa para a base do ${state.club}: ${youthPlayer.name} (${youthPlayer.pos}, 16 anos, Potencial ${youthPlayer.potential})!`);
          if (state.news.length > 50) state.news = state.news.slice(0, 50);
        }
      });

      return {
        salaryReceived: salary,
        totalBusinessNet,
        personalBalance: mp.personalBalance,
        report
      };
    },

    renderCareerEconomyPanel(containerId, state) {
      const container = document.getElementById(containerId);
      if (!container || !state) return;
      if (window.AFM_Guards && typeof window.AFM_Guards.migrateSaveState === 'function') {
        window.AFM_Guards.migrateSaveState(state);
      }

      const mp = state.managerPersonal;
      const sharePrice = this.getSharePrice(state);
      const protectionPct = (mp.clubShares || 0) * 3;
      const canBuyShare = (mp.clubShares || 0) < 10 && (mp.personalBalance || 0) >= sharePrice;

      container.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:16px; color:#f8fafc; font-family:Inter, sans-serif;">
          <div style="background:#0f172a; border:1px solid #1e293b; border-radius:12px; padding:16px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
            <div>
              <div style="font-size:11px; color:#94a3b8; font-weight:700; letter-spacing:0.08em;">PATRIMÔNIO PESSOAL DO TREINADOR (${(mp.name || 'TREINADOR').toUpperCase()})</div>
              <div style="font-size:24px; font-weight:800; color:#34d399; margin-top:4px;">R$ ${(mp.personalBalance || 0).toLocaleString('pt-BR')}</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:12px; color:#cbd5e1;">Salário Mensal: <strong style="color:#a78bfa;">R$ ${(mp.salary || 15000).toLocaleString('pt-BR')}</strong></div>
              <div style="font-size:11px; color:#64748b;">Proteção na Diretoria: <strong style="color:#38bdf8;">-${protectionPct}% peso nas derrotas</strong></div>
            </div>
          </div>

          <div style="background:#090d16; border:1px solid #1e293b; border-radius:12px; padding:18px;">
            <div style="font-size:12px; font-weight:800; color:#94a3b8; letter-spacing:0.08em; margin-bottom:8px;">COTAS DO CLUBE</div>
            <p style="font-size:13px; color:#cbd5e1; line-height:1.5; margin:0 0 12px 0;">
              Você tem <strong style="color:#fff;">${mp.clubShares || 0}</strong> de 10 cotas. Cada cota equivale a 1% da receita anual e reduz em 3% o peso dos tropeços no humor da diretoria. Na virada do ano, se o clube fechar no azul, paga 1% do lucro por cota (até 25% do valor das cotas). O preço sobe com acesso e cai com rebaixamento; ao sair do clube, as cotas são vendidas pelo valor do dia.
            </p>
            <div style="font-size:13px; color:#94a3b8; margin-bottom:14px;">
              Preço atual: <strong style="color:#f8fafc;">R$ ${sharePrice.toLocaleString('pt-BR')}</strong> por cota (entra direto no caixa do clube).
            </div>
            <button id="btn-afm-buy-share" ${!canBuyShare ? 'disabled' : ''} style="background:${canBuyShare ? '#5b21b6' : '#1e293b'}; color:${canBuyShare ? '#fff' : '#64748b'}; border:1px solid ${canBuyShare ? '#7c3aed' : '#334155'}; padding:10px 18px; border-radius:8px; font-weight:800; font-size:12px; cursor:${canBuyShare ? 'pointer' : 'not-allowed'};">
              ✅ CONFIRMAR COMPRA DE 1 COTA (R$ ${sharePrice.toLocaleString('pt-BR')})
            </button>
          </div>

          <div style="background:#090d16; border:1px solid #1e293b; border-radius:12px; padding:18px;">
            <div style="font-size:12px; font-weight:800; color:#94a3b8; letter-spacing:0.08em; margin-bottom:8px;">SEUS NEGÓCIOS</div>
            <p style="font-size:13px; color:#cbd5e1; line-height:1.5; margin:0 0 14px 0;">
              Invista seu patrimônio fora do clube. Todo dia 1º cada negócio dá lucro ou prejuízo conforme tamanho, movimento e gestão (a gestão cai 3 pontos por mês sem cuidado).
            </p>
            <div style="display:flex; flex-wrap:wrap; gap:10px; margin-bottom:14px;">
              ${BUSINESS_CATALOG.map((item) => {
                const affordable = (mp.personalBalance || 0) >= item.cost;
                return `
                  <button class="btn-afm-open-biz" data-type="${item.typeId}" style="background:${affordable ? '#3b1d7a' : '#161f30'}; color:${affordable ? '#f8fafc' : '#94a3b8'}; border:1px solid ${affordable ? '#7c3aed' : '#26334d'}; padding:10px 14px; border-radius:8px; font-weight:700; font-size:12px; cursor:pointer;">
                    Abrir ${item.name} (R$ ${item.cost.toLocaleString('pt-BR')})
                  </button>
                `;
              }).join('')}
            </div>

            ${(!mp.businesses || mp.businesses.length === 0) ? `
              <div style="font-size:13px; color:#94a3b8;">Você ainda não abriu negócios.</div>
            ` : `
              <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:12px;">
                ${mp.businesses.map((biz) => `
                  <div style="background:#111827; border:1px solid #1f2937; border-radius:10px; padding:12px;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                      <strong style="font-size:13px; color:#fff;">${biz.icon} ${biz.name} (Nv. ${biz.level || 1})</strong>
                      <span style="font-size:11px; padding:2px 8px; border-radius:99px; background:${biz.managementScore >= 70 ? '#065f46' : '#7c2d12'}; color:#fff;">
                        Gestão: ${biz.managementScore}%
                      </span>
                    </div>
                    <div style="font-size:12px; color:#94a3b8; margin-top:8px;">
                      Último dia 1º: <strong style="color:${biz.lastMonthResult >= 0 ? '#34d399' : '#f87171'};">
                        ${biz.lastMonthResult >= 0 ? '+' : ''}R$ ${(biz.lastMonthResult || 0).toLocaleString('pt-BR')}
                      </strong>
                    </div>
                    <div style="font-size:11px; color:#64748b; margin-top:2px;">
                      Acumulado: R$ ${(biz.accumulatedProfit || 0).toLocaleString('pt-BR')}
                    </div>
                    <div style="display:flex; gap:6px; margin-top:10px;">
                      <button class="btn-afm-maint-biz" data-id="${biz.id}" style="flex:1; background:#1e293b; color:#e2e8f0; border:1px solid #334155; padding:7px; border-radius:6px; font-size:11px; font-weight:700; cursor:pointer;">
                        CUIDAR (R$ ${(biz.maintenanceCost || 3000).toLocaleString('pt-BR')})
                      </button>
                      ${(biz.level || 1) < 3 ? `
                        <button class="btn-afm-upgrade-biz" data-id="${biz.id}" style="flex:1; background:#4338ca; color:#fff; border:none; padding:7px; border-radius:6px; font-size:11px; font-weight:700; cursor:pointer;">
                          EXPANDIR (Nv. ${(biz.level || 1) + 1})
                        </button>
                      ` : ''}
                    </div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>

          <div style="background:#090d16; border:1px solid #1e293b; border-radius:12px; padding:18px;">
            <div style="font-size:12px; font-weight:800; color:#94a3b8; letter-spacing:0.08em; margin-bottom:8px;">CURSOS & ESPECIALIZAÇÕES DO TREINADOR</div>
            <p style="font-size:13px; color:#cbd5e1; line-height:1.5; margin:0 0 14px 0;">
              Evolua suas habilidades profissionais. Cursos concluídos fornecem bônus permanentes de tática, fisiologia e negócios.
            </p>
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:12px;">
              ${COACH_COURSES.map((c) => {
                const done = (mp.coursesCompleted || []).includes(c.id);
                const affordable = (mp.personalBalance || 0) >= c.cost;
                return `
                  <div style="background:#111827; border:1px solid ${done ? '#059669' : '#1f2937'}; border-radius:10px; padding:12px;">
                    <div style="font-size:13px; font-weight:800; color:#fff;">${c.icon} ${c.name}</div>
                    <div style="font-size:11px; color:#38bdf8; margin:4px 0 8px 0;">${c.bonusDesc}</div>
                    <div style="font-size:11px; color:#94a3b8; margin-bottom:10px;">Investimento: R$ ${c.cost.toLocaleString('pt-BR')}</div>
                    ${done ? `
                      <span style="display:inline-block; padding:4px 10px; border-radius:6px; background:#065f46; color:#a7f3d0; font-size:11px; font-weight:800;">✓ CONCLUÍDO</span>
                    ` : `
                      <button class="btn-afm-course" data-id="${c.id}" ${!affordable ? 'disabled' : ''} style="width:100%; background:${affordable ? '#0284c7' : '#1e293b'}; color:${affordable ? '#fff' : '#64748b'}; border:none; padding:7px; border-radius:6px; font-size:11px; font-weight:800; cursor:${affordable ? 'pointer' : 'not-allowed'};">
                        MATRICULAR-SE
                      </button>
                    `}
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      `;

      const btnShare = container.querySelector('#btn-afm-buy-share');
      if (btnShare) {
        btnShare.onclick = () => {
          const res = this.buyClubShare(state);
          showMessage(res.message);
          if (typeof window.save === 'function') window.save();
          this.renderCareerEconomyPanel(containerId, state);
        };
      }

      container.querySelectorAll('.btn-afm-open-biz').forEach((btn) => {
        btn.onclick = () => {
          const res = this.openBusiness(state, btn.dataset.type);
          showMessage(res.message);
          if (typeof window.save === 'function') window.save();
          this.renderCareerEconomyPanel(containerId, state);
        };
      });

      container.querySelectorAll('.btn-afm-maint-biz').forEach((btn) => {
        btn.onclick = () => {
          const res = this.maintainBusiness(state, btn.dataset.id);
          showMessage(res.message);
          if (typeof window.save === 'function') window.save();
          this.renderCareerEconomyPanel(containerId, state);
        };
      });

      container.querySelectorAll('.btn-afm-upgrade-biz').forEach((btn) => {
        btn.onclick = () => {
          const res = this.upgradeBusiness(state, btn.dataset.id);
          showMessage(res.message);
          if (typeof window.save === 'function') window.save();
          this.renderCareerEconomyPanel(containerId, state);
        };
      });

      container.querySelectorAll('.btn-afm-course').forEach((btn) => {
        btn.onclick = () => {
          const res = this.enrollInCourse(state, btn.dataset.id);
          showMessage(res.message);
          if (typeof window.save === 'function') window.save();
          this.renderCareerEconomyPanel(containerId, state);
        };
      });
    }
  };

  window.AFM_ManagerEconomy = Object.assign(window.AFM_ManagerEconomy || {}, ManagerEconomySystem);
})(window);
