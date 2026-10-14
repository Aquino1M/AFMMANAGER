// ==============================================================================
// AFM MANAGER 2027 — SALA DE TROFÉUS REAL, DIREITOS DE TV (1 ANO), MARKETING & FOLHA
// Arquivo: js/systems/trophies_tv_1year_marketing_and_payroll.js
// BLOCO 02 — 100% ISOLADO NO SAVE DO USUÁRIO
// ==============================================================================

(function (window) {
  'use strict';

  const REAL_CLUB_TROPHIES = {
    corinthians: [
      { name: 'Mundial de Clubes da FIFA (2x)', year: '2000 e 2012', badge: 'HISTÓRICO OFICIAL DO CLUBE', icon: '🌎' },
      { name: 'CONMEBOL Libertadores', year: '2012 (Campeão Invicto)', badge: 'HISTÓRICO OFICIAL DO CLUBE', icon: '🏆' },
      { name: 'Campeonato Brasileiro Série A (7x)', year: '1990, 1998, 1999, 2005, 2011, 2015, 2017', badge: 'HISTÓRICO OFICIAL DO CLUBE', icon: '🇧🇷' },
      { name: 'Copa do Brasil (3x)', year: '1995, 2002, 2009', badge: 'HISTÓRICO OFICIAL DO CLUBE', icon: '🏅' },
      { name: 'Recopa Sul-Americana', year: '2013', badge: 'HISTÓRICO OFICIAL DO CLUBE', icon: '✨' },
      { name: 'Supercopa do Brasil', year: '1991', badge: 'HISTÓRICO OFICIAL DO CLUBE', icon: '⚡' },
      { name: 'Campeonato Paulista (31x)', year: 'Maior Campeão Estadual', badge: 'HISTÓRICO OFICIAL DO CLUBE', icon: '🥇' }
    ],
    flamengo: [
      { name: 'Mundial Interclubes', year: '1981', badge: 'HISTÓRICO OFICIAL DO CLUBE', icon: '🌎' },
      { name: 'CONMEBOL Libertadores (3x)', year: '1981, 2019, 2022', badge: 'HISTÓRICO OFICIAL DO CLUBE', icon: '🏆' },
      { name: 'Campeonato Brasileiro Série A (8x)', year: '1980, 1982, 1983, 1987, 1992, 2009, 2019, 2020', badge: 'HISTÓRICO OFICIAL DO CLUBE', icon: '🇧🇷' },
      { name: 'Copa do Brasil (5x)', year: '1990, 2006, 2013, 2022, 2024', badge: 'HISTÓRICO OFICIAL DO CLUBE', icon: '🏅' }
    ],
    palmeiras: [
      { name: 'Copa Rio Internacional', year: '1951', badge: 'HISTÓRICO OFICIAL DO CLUBE', icon: '🌎' },
      { name: 'CONMEBOL Libertadores (3x)', year: '1999, 2020, 2021', badge: 'HISTÓRICO OFICIAL DO CLUBE', icon: '🏆' },
      { name: 'Campeonato Brasileiro Série A (12x)', year: 'Maior Campeão Nacional', badge: 'HISTÓRICO OFICIAL DO CLUBE', icon: '🇧🇷' },
      { name: 'Copa do Brasil (4x)', year: '1998, 2012, 2015, 2020', badge: 'HISTÓRICO OFICIAL DO CLUBE', icon: '🏅' }
    ],
    'sao-paulo': [
      { name: 'Mundial de Clubes / Intercontinental (3x)', year: '1992, 1993, 2005', badge: 'HISTÓRICO OFICIAL DO CLUBE', icon: '🌎' },
      { name: 'CONMEBOL Libertadores (3x)', year: '1992, 1993, 2005', badge: 'HISTÓRICO OFICIAL DO CLUBE', icon: '🏆' },
      { name: 'Campeonato Brasileiro Série A (6x)', year: '1977, 1986, 1991, 2006, 2007, 2008', badge: 'HISTÓRICO OFICIAL DO CLUBE', icon: '🇧🇷' },
      { name: 'Copa do Brasil', year: '2023', badge: 'HISTÓRICO OFICIAL DO CLUBE', icon: '🏅' }
    ]
  };

  // Empresas Detentoras dos Direitos de Transmissão para o Ciclo de 1 Ano
  const TV_RIGHTS_1YEAR_COMPANIES = [
    {
      id: 'grupo_globo_libra',
      name: 'Grupo Globo (Bloco LIBRA)',
      channels: 'TV Globo (Aberta) · SporTV (Fechada) · Premiere (PPV) · Globoplay',
      contractDuration: 'Ciclo de 1 Ano (Renovável)',
      desc: 'Exclusividade total do bloco Libra para TV aberta, fechada, streaming e pay-per-view.',
      monthlyFactor: 1.40,
      signingBonusFactor: 2.0,
      fanBoost: '+10% Alcance Nacional'
    },
    {
      id: 'amazon_prime_lfu',
      name: 'Amazon Prime Video (Bloco LFU)',
      channels: 'Amazon Prime Video (Streaming Exclusivo · 1 Jogo/Rodada)',
      contractDuration: 'Ciclo de 1 Ano (Renovável)',
      desc: 'Direitos exclusivos de um grande jogo por rodada dos clubes da Liga Forte União (LFU).',
      monthlyFactor: 1.28,
      signingBonusFactor: 2.5,
      fanBoost: '+12% Receita Digital'
    },
    {
      id: 'record_youtube_lfu',
      name: 'TV Record & Google (YouTube / LFU)',
      channels: 'TV Record (Aberta) · Portal R7 / PlayPlus · YouTube',
      contractDuration: 'Ciclo de 1 Ano (Renovável)',
      desc: 'Exibição simultânea na TV aberta, no site R7/PlayPlus e na plataforma do YouTube para clubes da LFU.',
      monthlyFactor: 1.24,
      signingBonusFactor: 1.85,
      fanBoost: '+18% Engajamento de Torcida & Patrocínios'
    },
    {
      id: '1190_sports_fanatiz',
      name: '1190 Sports & Fanatiz (Direitos Internacionais)',
      channels: 'Fanatiz & Emissoras Globais (+130 Países)',
      contractDuration: 'Ciclo de 1 Ano (Renovável)',
      desc: 'Gestora dos direitos internacionais da competição (exceto jogos do Flamengo como mandante) em mais de 130 países.',
      monthlyFactor: 0.72,
      signingBonusFactor: 1.5,
      fanBoost: '+15 Prestígio Internacional'
    }
  ];

  function getClubKey(state) {
    let raw = state?.club || state?.clubName;
    if (!raw && typeof document !== 'undefined') {
      raw = document.querySelector('.sidebar-club-name')?.textContent || 'Corinthians';
    }
    return String(raw || 'Corinthians').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  const TrophiesTvMarketingPayroll = {
    clubTrophies: REAL_CLUB_TROPHIES,
    tvCompanies: TV_RIGHTS_1YEAR_COMPANIES,
    REAL_CLUB_TROPHIES: {
      Corinthians: {
        fifaWorldCup: 2,
        libertadores: 1,
        brasileiro: 7,
        copaDoBrasil: 3,
        recopa: 1,
        supercopa: 1,
        paulista: 31,
        candangao: 0
      },
      Flamengo: {
        mundial: 1,
        libertadores: 3,
        brasileiro: 8,
        copaDoBrasil: 5
      },
      Palmeiras: {
        copaRio: 1,
        libertadores: 3,
        brasileiro: 12,
        copaDoBrasil: 4
      },
      'Sao Paulo': {
        mundial: 3,
        libertadores: 3,
        brasileiro: 6,
        copaDoBrasil: 1
      }
    },
    TV_RIGHTS_1YEAR_COMPANIES: {
      globo: {
        name: 'Grupo Globo (Libra)',
        contractLengthYears: 1
      },
      amazon: {
        name: 'Amazon Prime Video (LFU)',
        contractLengthYears: 1
      },
      recordYoutube: {
        name: 'TV Record & Google/YouTube (LFU)',
        contractLengthYears: 1
      },
      fanatiz1190: {
        name: '1190 Sports & Fanatiz',
        contractLengthYears: 1
      }
    },
    calculateLiveMarketingMetrics(fanMoney = 0, sponsorMoney = 0) {
      const f = Number(fanMoney) || 0;
      const s = Number(sponsorMoney) || 0;
      const retentionPct = Math.min(98, Math.round(50 + (f / 100000) * 3));
      const boostBonusPct = Math.min(100, Math.round((s / 200000) * 5));
      const sponsorRevenueMonth = Math.round(s * (1 + boostBonusPct / 100));
      return { retentionPct, boostBonusPct, sponsorRevenueMonth };
    },

    // 1. Renderiza a Sala de Troféus Real do Corinthians + Títulos do Treinador no comando do time
    refreshMuseumTrophiesDOM(state) {
      if (typeof document === 'undefined') return;
      const allHeadings = Array.from(document.querySelectorAll('h2, h3, div, span'));
      const museumHeader = allHeadings.find((el) => (el.textContent || '').includes('MUSEU DO CLUBE: ESTANTE DE TROFÉUS') || (el.textContent || '').includes('MUSEU DO CLUBE') || (el.textContent || '').includes('ESTANTE DE TROFÉUS'));
      if (!museumHeader) return;

      const museumBox = museumHeader.closest('div[style*="border"], .card, section') || museumHeader.parentElement?.parentElement;
      if (!museumBox || museumBox.dataset.corinthiansFixed === '1') return;

      const cKey = getClubKey(state);
      let clubHistorical = REAL_CLUB_TROPHIES.corinthians;
      if (cKey.includes('flamengo')) clubHistorical = REAL_CLUB_TROPHIES.flamengo;
      else if (cKey.includes('palmeiras')) clubHistorical = REAL_CLUB_TROPHIES.palmeiras;
      else if (cKey.includes('sao paulo') || cKey.includes('sao-paulo')) clubHistorical = REAL_CLUB_TROPHIES['sao-paulo'];

      const coachWonHere = (state?.managerPersonal?.trophies || []).filter((t) => !t.club || getClubKey({ clubName: t.club }) === cKey);
      const coachDisplay = coachWonHere.length > 0
        ? coachWonHere
        : [{ name: 'Em busca da 1ª Taça no Comando', year: 'Temporada Atual no Save', badge: `COMANDO TÉC. ${(state?.managerPersonal?.name || state?.managerName || 'AQUINO').toUpperCase()}`, icon: '🎯' }];

      museumBox.dataset.corinthiansFixed = '1';
      const totalTitlesCount = clubHistorical.length + coachWonHere.length;

      museumBox.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:16px;">
          <div>
            <h3 style="margin:0;font-size:18px;font-weight:900;color:#fff;">MUSEU DO CLUBE: ESTANTE DE TROFÉUS OFICIAL</h3>
            <div style="font-size:12px;color:#94a3b8;margin-top:4px;">
              Acervo Histórico Real do Clube (${clubHistorical.length} marcos históricos) + Conquistas de Téc. ${state?.managerPersonal?.name || state?.managerName || 'Aquino'} no Comando (${coachWonHere.length} títulos no save)
            </div>
          </div>
          <span style="background:#eab308;color:#090d16;font-weight:900;font-size:12px;padding:8px 14px;border-radius:8px;">
            🏆 Acervo Oficial Sincronizado (${totalTitlesCount})
          </span>
        </div>

        <div style="font-size:12px;font-weight:800;color:#fbbf24;margin-bottom:10px;letter-spacing:0.05em;">
          🏛️ TÍTULOS HISTÓRICOS REAIS DO ${(state?.club || state?.clubName || 'CORINTHIANS').toUpperCase()}
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(185px,1fr));gap:10px;margin-bottom:20px;">
          ${clubHistorical.map((t) => `
            <div style="background:#16192b;border:1px solid #854d0e;border-radius:10px;padding:14px;text-align:center;">
              <div style="font-size:26px;margin-bottom:6px;">${t.icon}</div>
              <div style="font-size:12px;font-weight:800;color:#fff;">${t.name}</div>
              <div style="font-size:11px;color:#cbd5e1;margin-top:3px;">(${t.year})</div>
              <div style="font-size:9px;color:#f59e0b;font-weight:800;margin-top:6px;">${t.badge}</div>
            </div>
          `).join('')}
        </div>

        <div style="font-size:12px;font-weight:800;color:#a78bfa;margin-bottom:10px;letter-spacing:0.05em;">
          👑 TÍTULOS CONQUISTADOS POR TÉC. ${(state?.managerPersonal?.name || state?.managerName || 'AQUINO').toUpperCase()} NO COMANDO DO TIME (NO SAVE)
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(185px,1fr));gap:10px;">
          ${coachDisplay.map((t) => `
            <div style="background:#1e1b4b;border:1px solid #7c3aed;border-radius:10px;padding:14px;text-align:center;">
              <div style="font-size:26px;margin-bottom:6px;">${t.icon || '🏆'}</div>
              <div style="font-size:12px;font-weight:800;color:#fff;">${t.name || t.title}</div>
              <div style="font-size:11px;color:#c4b5fd;margin-top:3px;">(${t.year || 'No Save'})</div>
              <div style="font-size:9px;color:#34d399;font-weight:800;margin-top:6px;">${t.badge || 'CONQUISTA NO SAVE'}</div>
            </div>
          `).join('')}
        </div>
      `;
    },

    // 2. Injeta o Painel de Direitos de Transmissão (Ciclo de 1 Ano) em Escritório & Patrocinadores
    injectTvBroadcastSectionInOffice(state) {
      if (typeof document === 'undefined') return;
      const isOfficeOpen = document.body.innerText.includes('Patrocinadores') || document.body.innerText.includes('Salários do elenco') || document.querySelector('[data-tab="escritorio"].active');
      if (!isOfficeOpen) return;
      if (document.getElementById('afm-tv-rights-1year-box')) return;

      const ovr = state?.teamOverall || state?.clubOverall || 78;
      const div = state?.clubDivision || 1;
      const relevanceMult = Math.pow(Math.max(55, ovr) / 68, 2.2) * (div === 1 ? 1.0 : div === 2 ? 0.35 : 0.12);
      const baseMonthly = Math.round(3800000 * relevanceMult);
      const currentContractId = state?.tvContract1Year?.id || null;

      const officeContainer = document.querySelector('main, .main-content, #content, .content-area') || document.body;
      const panel = document.createElement('div');
      panel.id = 'afm-tv-rights-1year-box';
      panel.style.cssText = 'background:#0f172a;border:1px solid #4c1d95;border-radius:14px;padding:18px;margin:16px 0;color:#f8fafc;font-family:Inter,sans-serif;';

      panel.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:12px;">
          <div>
            <div style="font-size:11px;font-weight:800;color:#a78bfa;letter-spacing:0.08em;">DIREITOS DE TRANSMISSÃO DE TV & STREAMING · CICLO DE 1 ANO</div>
            <h3 style="margin:4px 0 0;font-size:17px;font-weight:900;color:#fff;">📺 Propostas de Transmissão (Relevância Nacional & Mundial do Clube)</h3>
          </div>
          <span style="background:#1e1b4b;border:1px solid #6d28d9;color:#e9d5ff;font-size:11px;font-weight:800;padding:6px 12px;border-radius:99px;">
            Contrato: Ciclo de 1 Ano · ${state?.tvContract1Year ? `Ativo: ${state.tvContract1Year.name}` : 'Escolha sua Emissora'}
          </span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;">
          ${TV_RIGHTS_1YEAR_COMPANIES.map((co) => {
            const monthly = Math.round(baseMonthly * co.monthlyFactor);
            const bonus = Math.round(monthly * co.signingBonusFactor);
            const isSigned = currentContractId === co.id;
            return `
              <div style="background:#090d16;border:1px solid ${isSigned ? '#10b981' : '#1e293b'};border-radius:10px;padding:14px;display:flex;flex-direction:column;justify-content:space-between;">
                <div>
                  <div style="font-size:13px;font-weight:900;color:#fff;">${co.name}</div>
                  <div style="font-size:11px;color:#38bdf8;font-weight:700;margin-top:3px;">${co.channels}</div>
                  <p style="font-size:11px;color:#94a3b8;line-height:1.4;margin:8px 0;">${co.desc}</p>
                </div>
                <div>
                  <div style="font-size:13px;font-weight:800;color:#34d399;">+R$ ${monthly.toLocaleString('pt-BR')}/mês</div>
                  <div style="font-size:11px;color:#fbbf24;">Luvas de Assinatura (1 Ano): R$ ${bonus.toLocaleString('pt-BR')}</div>
                  <div style="font-size:10px;color:#c4b5fd;margin-top:2px;">Bônus: ${co.fanBoost}</div>
                  <button class="btn-sign-tv-1year" data-id="${co.id}" data-monthly="${monthly}" data-bonus="${bonus}" data-name="${co.name}" style="margin-top:10px;width:100%;background:${isSigned ? '#065f46' : '#5b21b6'};color:#fff;border:none;padding:9px;border-radius:8px;font-weight:800;font-size:11px;cursor:pointer;">
                    ${isSigned ? '✅ EMISSORA OFICIAL (CICLO 1 ANO)' : 'ASSINAR DIREITOS (CICLO 1 ANO)'}
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;

      officeContainer.appendChild(panel);

      panel.querySelectorAll('.btn-sign-tv-1year').forEach((btn) => {
        btn.onclick = () => {
          const id = btn.dataset.id;
          const name = btn.dataset.name;
          const monthly = Number(btn.dataset.monthly);
          const bonus = Number(btn.dataset.bonus);
          const cKey = getClubKey(state);

          if (id === '1190_sports_fanatiz' && cKey.includes('flamengo')) {
            alert('⚠️ Pela regra oficial, a 1190 Sports gere os direitos internacionais de todos os clubes exceto os jogos do Flamengo como mandante!');
            return;
          }

          if (state) {
            state.tvContract1Year = { id, name, monthly, bonus, expiresAfterSeason: (state.seasonYear || state.season || 2026) + 1 };
            state.clubBalance = (state.clubBalance || state.balance || 0) + bonus;
            state.balance = state.clubBalance;
          }
          panel.remove();
          this.injectTvBroadcastSectionInOffice(state);
          if (typeof window.toast === 'function') window.toast(`📺 Direitos de Transmissão (1 Ano) fechados com ${name}! +R$ ${bonus.toLocaleString('pt-BR')} de luvas no caixa.`);
          else if (typeof window.showToast === 'function') window.showToast(`📺 Direitos de Transmissão (1 Ano) fechados com ${name}! +R$ ${bonus.toLocaleString('pt-BR')} de luvas no caixa.`);
        };
      });
    },

    // 3. Soma Nosso Salário em "Salários do elenco" e sincroniza "Vagas do elenco:" com a aba Meu Time
    syncCoachSalaryAndSquadSlotsInDOM(state) {
      if (typeof document === 'undefined') return;
      const squad = state?.squad || state?.players || [];
      const coachSalary = Number(state?.managerPersonal?.salary || state?.managerSalary || 75000);
      const playersSalary = squad.reduce((sum, p) => sum + Number(p?.salary || p?.wage || 65000), 0);
      const totalPayroll = playersSalary + coachSalary;
      const squadCount = Math.max(18, squad.length || 23);

      document.querySelectorAll('div, span, p, td').forEach((el) => {
        if (el.children.length === 0) {
          const t = (el.textContent || '').trim();
          // Sincroniza "Vagas do elenco: -" para nunca ficar "-" ou dessincronizado
          if (t === 'Vagas do elenco:' || t.startsWith('Vagas do elenco:')) {
            const next = el.nextElementSibling;
            if (next && (next.textContent.trim() === '-' || next.textContent.trim() === '')) {
              next.textContent = `${squadCount}/35 atletas (11 Titulares sincronizados com Meu Time)`;
              next.style.color = '#34d399';
            } else if (t.includes('-')) {
              el.textContent = `Vagas do elenco: ${squadCount}/35 atletas (Sincronizado com Meu Time)`;
            }
          }
          // Inclui o salário do treinador em Salários do elenco
          if (t === 'Salários do elenco' || t === 'Salários do Elenco') {
            const parent = el.parentElement;
            if (parent && !parent.dataset.coachWageAdded) {
              parent.dataset.coachWageAdded = '1';
              const valEl = parent.querySelector('strong, span:last-child, div:last-child, b');
              if (valEl && valEl !== el) {
                valEl.textContent = `R$ ${totalPayroll.toLocaleString('pt-BR')}/mês (Inclui R$ ${coachSalary.toLocaleString('pt-BR')} Téc. ${state?.managerPersonal?.name || state?.managerName || 'Aquino'})`;
              }
            }
          }
        }
      });
    }
  };

  if (typeof setInterval !== 'undefined') {
    setInterval(() => {
      const st = window.GameState || window.state || {};
      TrophiesTvMarketingPayroll.refreshMuseumTrophiesDOM(st);
      TrophiesTvMarketingPayroll.injectTvBroadcastSectionInOffice(st);
      TrophiesTvMarketingPayroll.syncCoachSalaryAndSquadSlotsInDOM(st);
    }, 600);
  }

  window.AFM_TrophiesTvPayroll = TrophiesTvMarketingPayroll;
})(typeof window !== 'undefined' ? window : global);
