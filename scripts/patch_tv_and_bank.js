const fs = require('fs');
const path = require('path');

const gameJsPath = path.join(__dirname, '..', 'js', 'game.js');
let content = fs.readFileSync(gameJsPath, 'utf8');

// 1. Definição das funções de TV e Adiantamento antes de renderTvBroadcastCard
const newTvLogic = `
function getTvCompanies(baseAnnual){
  return [
    {
      id: 'globo_libra',
      name: 'Grupo Globo (Bloco LIBRA)',
      channels: 'TV Globo · SporTV · Premiere · Globoplay',
      desc: 'Exclusividade multiplataforma (TV Aberta, Fechada, PPV e Streaming) para o bloco Libra.',
      annualFactor: 1.35,
      fanBoost: '+10% Alcance Nacional'
    },
    {
      id: 'amazon_lfu',
      name: 'Amazon Prime Video (Bloco LFU)',
      channels: 'Amazon Prime Video (Streaming Exclusivo)',
      desc: 'Transmissão digital exclusiva de 1 grande confronto por rodada dos clubes da LFU.',
      annualFactor: 1.25,
      fanBoost: '+12% Receita Digital'
    },
    {
      id: 'record_youtube',
      name: 'TV Record & YouTube (CazéTV / LFU)',
      channels: 'TV Record (Aberta) · PlayPlus · YouTube CazéTV',
      desc: 'Exibição multiplataforma gratuita aberta e no YouTube com grande alcance de torcida jovem.',
      annualFactor: 1.22,
      fanBoost: '+18% Engajamento & Patrocínios'
    },
    {
      id: '1190_fanatiz',
      name: '1190 Sports & Fanatiz (Internacional)',
      channels: 'Fanatiz & Emissoras Globais (+130 Países)',
      desc: 'Comercialização internacional do sinal ao vivo para mais de 130 países e parceiros.',
      annualFactor: 0.88,
      fanBoost: '+15 Prestígio Internacional'
    }
  ];
}

function takeContractAdvance(type, pct){
  let targetContract = null;
  let contractName = '';
  let totalVal = 0;

  if(type === 'tv'){
    targetContract = state.tvContract1Year;
    contractName = targetContract?.name || 'Direitos de Transmissão';
    totalVal = targetContract?.annualTotal || 80000000;
  } else if(state.sponsors && state.sponsors[type]){
    targetContract = state.sponsors[type];
    contractName = targetContract?.brand || ('Patrocínio ' + type);
    totalVal = (targetContract?.monthly || 50000) * 12 * (targetContract?.years || 1);
  }

  if(!targetContract) return;

  const currentAdvanced = Number(targetContract.advancedAmount) || (type === 'tv' && targetContract.advancedTaken ? Math.round(totalVal * 0.45) : 0);
  const targetMax = Math.round(totalVal * (pct / 100));
  const availableAdvance = Math.max(0, targetMax - currentAdvanced);

  if(availableAdvance <= 0){
    toast('Este contrato já atingiu o limite de adiantamento de ' + pct + '%!');
    return;
  }

  state.balance += availableAdvance;
  state.income = (state.income || 0) + availableAdvance;
  targetContract.advancedAmount = currentAdvanced + availableAdvance;
  if(type === 'tv'){
    targetContract.advancedTaken = true;
    const remToReceive = Math.max(0, totalVal - targetContract.advancedAmount);
    targetContract.monthly = Math.round(remToReceive / 12);
  }

  state.news = state.news || [];
  state.news.unshift('🏦 ADIANTAMENTO BANCÁRIO: O clube antecipou ' + fmtMoney(availableAdvance) + ' (' + pct + '% da cota) referente ao contrato com ' + contractName + '.');
  save();
  toast('⚡ Adiantamento de ' + fmtMoney(availableAdvance) + ' creditado à vista no caixa do clube!');
}

function openTvBreakModal(targetCo){
  const act = state.tvContract1Year || {};
  const annualTotal = Number(act.annualTotal) || 80000000;
  const breakFee30 = Math.round(annualTotal * 0.30);
  const advancedAmount = Math.max(0, Number(act.advancedAmount) || (act.advancedTaken ? Math.round(annualTotal * 0.45) : 0));
  const advancedPaid = Math.max(0, Number(act.advancedPaid) || 0);
  const remainingAdvance = Math.max(0, advancedAmount - advancedPaid);
  const totalSwitchCost = breakFee30 + remainingAdvance;
  const canAfford = state.balance >= totalSwitchCost;

  openCustomModal(
    '⚠️ Termo de Rescisão & Quebra de Contrato de Transmissão',
    \`
      <div style="background:rgba(239,68,68,0.1);border:1px solid #ef4444;border-radius:12px;padding:16px;margin-bottom:14px">
        <div style="font-size:14px;font-weight:900;color:#ef4444;text-transform:uppercase">
          Rescisão Unilateral de Transmissão (Multa de 30% + Devolução de Adiantamento)
        </div>
        <div style="font-size:13px;color:rgba(255,255,255,0.85);margin-top:6px;line-height:1.4">
          O seu clube possui contrato ativo com a emissora <b>\${esc(act.name)}</b>. A troca para <b>\${esc(targetCo.name)}</b> exige o pagamento imediato da multa de quebra contratual (30%) somada à quitação de adiantamentos em aberto.
        </div>
      </div>

      <div style="background:#13111c;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px;font-size:13px;display:flex;flex-direction:column;gap:10px">
        <div style="display:flex;justify-content:space-between">
          <span class="muted">Emissora Atual:</span>
          <b>\${esc(act.name)}</b>
        </div>
        <div style="display:flex;justify-content:space-between">
          <span class="muted">Nova Emissora Selecionada:</span>
          <b style="color:#a78bfa">\${esc(targetCo.name)} (+\${fmtMoney(targetCo.monthly)}/mês)</b>
        </div>
        <div style="border-top:1px solid rgba(255,255,255,0.06);margin:4px 0"></div>
        <div style="display:flex;justify-content:space-between">
          <span class="muted">⚖️ Multa de 30% (sobre valor acumulado):</span>
          <b style="color:#ef4444">\${fmtMoney(breakFee30)}</b>
        </div>
        <div style="display:flex;justify-content:space-between">
          <span class="muted">🏦 Quitação do Restante do Adiantamento Não Abatido:</span>
          <b style="color:#f59e0b">\${fmtMoney(remainingAdvance)}</b>
        </div>
        <div style="border-top:1px solid rgba(255,255,255,0.06);margin:4px 0"></div>
        <div style="display:flex;justify-content:space-between;font-size:15px">
          <span style="font-weight:900;color:#fff">💸 CUSTO TOTAL DE TROCA:</span>
          <b style="color:#ef4444;font-size:16px">\${fmtMoney(totalSwitchCost)}</b>
        </div>
        <div style="display:flex;justify-content:space-between">
          <span class="muted">Saldo Atual em Caixa:</span>
          <b style="color:\${canAfford ? '#22c55e' : '#ef4444'}">\${fmtMoney(state.balance)}</b>
        </div>
        <div style="display:flex;justify-content:space-between">
          <span class="muted">Saldo Previsto após Quitação:</span>
          <b style="color:\${canAfford ? 'var(--neon)' : '#ef4444'}">\${fmtMoney(state.balance - totalSwitchCost)}</b>
        </div>
      </div>

      <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:16px">
        <button class="btn" id="btnCancelBreakTv">Manter Atual</button>
        <button class="btn danger" id="btnConfirmBreakTv" \${canAfford ? '' : 'disabled'} style="font-weight:900;padding:10px 18px">
          \${canAfford ? ('Pagar ' + fmtMoney(totalSwitchCost) + ' e Trocar de Emissora') : 'Saldo Insuficiente para Rescisão'}
        </button>
      </div>
    \`,
    null,
    'Fechar',
    false,
    '560px'
  );

  const bCancel = $('#btnCancelBreakTv');
  if(bCancel) bCancel.onclick = closeCustomModal;

  const bConfirm = $('#btnConfirmBreakTv');
  if(bConfirm){
    bConfirm.onclick = () => {
      if(!canAfford) return;
      state.balance -= totalSwitchCost;
      state.expense = (state.expense || 0) + totalSwitchCost;
      state.tvContract1Year = {
        id: targetCo.id,
        name: targetCo.name,
        annualTotal: targetCo.annualTotal,
        monthly: targetCo.monthly,
        channels: targetCo.channels,
        desc: targetCo.desc,
        advancedAmount: 0,
        advancedPaid: 0,
        advancedTaken: false
      };
      state.news = state.news || [];
      state.news.unshift('📺 RESCISÃO DE TRANSMISSÃO: O ' + state.club + ' pagou ' + fmtMoney(totalSwitchCost) + ' (multa de 30% + quitação de adiantamento) para rescindir com ' + act.name + ' e assinar com a ' + targetCo.name + '!');
      toast('📺 Nova emissora ' + targetCo.name + ' contratada com sucesso!');
      closeCustomModal();
      save();
      render();
    };
  }
}

function renderTvBroadcastCard(st){
  if(!st) return '';
  const ovr = (typeof strength === 'function' && typeof clubByName === 'function') ? (strength(clubByName(st.club)) || 76) : 76;
  const comp = typeof curComp === 'function' ? curComp() : null;
  const div = comp?.id === 'bra-a' ? 1 : comp?.id === 'bra-b' ? 2 : 3;
  const mult = Math.pow(Math.max(55, ovr) / 72, 2.2) * (div === 1 ? 1.0 : div === 2 ? 0.38 : 0.16);
  const baseAnnual = Math.round(82000000 * mult);
  const TV_COMPANIES = getTvCompanies(baseAnnual);

  if(!st.tvContract1Year){
    const def = TV_COMPANIES[0];
    const tot = Math.round(baseAnnual * def.annualFactor);
    st.tvContract1Year = {
      id: def.id,
      name: def.name,
      annualTotal: tot,
      monthly: Math.round(tot / 12),
      channels: def.channels,
      desc: def.desc,
      advancedAmount: 0,
      advancedPaid: 0,
      advancedTaken: false
    };
  }

  const act = st.tvContract1Year;
  const annualTotal = Number(act.annualTotal) || Math.round(baseAnnual * 1.25);
  const advancedAmount = Math.max(0, Number(act.advancedAmount) || (act.advancedTaken ? Math.round(annualTotal * 0.45) : 0));
  const advancedPaid = Math.max(0, Number(act.advancedPaid) || 0);
  const remainingToReceive = Math.max(0, annualTotal - advancedAmount);
  const breakFee30 = Math.round(annualTotal * 0.30);

  const proposals = TV_COMPANIES.filter(co => co.id !== act.id);

  return \`
    <div class="card" id="cardOfficeTvRights" style="margin-top:14px;background:#0d111d;border:1px solid rgba(124,58,237,0.45);border-radius:14px;padding:20px">
      <!-- TOPO: EMISSORA OFICIAL DO CLUBE (MESMO PADRÃO DOS PATROCINADORES OFICIAIS) -->
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:14px;padding-bottom:16px;border-bottom:1px solid rgba(255,255,255,0.08)">
        <div>
          <div style="display:flex;align-items:center;gap:8px">
            <span class="sponsor-badge" style="background:#7c3aed33;color:#c084fc;font-size:11px;font-weight:900">📺 EMISSORA OFICIAL DO CLUBE</span>
            <span class="pill" style="background:#10b981;color:#000;font-weight:900;font-size:10px">CONTRATO ANUAL ATIVO</span>
          </div>
          <h2 style="margin:8px 0 2px 0;font-size:22px;font-weight:900;color:#fff">\${esc(act.name)}</h2>
          <div style="font-size:12px;color:#38bdf8;font-weight:700">\${esc(act.channels || 'Exclusividade Multiplataforma')}</div>
          <div class="small muted" style="margin-top:4px;max-width:750px">\${esc(act.desc || 'Direitos de transmissão exclusivos nas plataformas contratadas.')}</div>
        </div>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <button class="btn" id="btnTvOpenBankAdvances" style="background:linear-gradient(135deg,#7c3aed,#4f46e5);border:none;color:#fff;font-size:12px;font-weight:800;padding:8px 16px;border-radius:8px;cursor:pointer;display:inline-flex;align-items:center;gap:6px">
            <span>💳</span> <span>Pedir Adiantamento no Banco</span>
          </button>
        </div>
      </div>

      <!-- 5 MÉTRICAS FINANCEIRAS DO CONTRATO ATIVO -->
      <div class="grid g5" style="margin-top:16px;display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px">
        <div style="background:rgba(255,255,255,0.03);padding:12px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.06)">
          <div class="small muted" style="font-size:11px">💰 Valor Anual Acumulado</div>
          <b style="color:#fbbf24;font-size:15px;display:block;margin-top:4px">\${fmtMoney(annualTotal)}/ano</b>
        </div>
        <div style="background:rgba(255,255,255,0.03);padding:12px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.06)">
          <div class="small muted" style="font-size:11px">📅 Parcela Mensal (1/12)</div>
          <b style="color:#34d399;font-size:15px;display:block;margin-top:4px">+\${fmtMoney(act.monthly)}/mês</b>
        </div>
        <div style="background:rgba(255,255,255,0.03);padding:12px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.06)">
          <div class="small muted" style="font-size:11px">⚡ Quanto Já Pegou Adiantado</div>
          <b style="color:\${advancedAmount > 0 ? '#f59e0b' : '#94a3b8'};font-size:15px;display:block;margin-top:4px">\${fmtMoney(advancedAmount)}</b>
        </div>
        <div style="background:rgba(255,255,255,0.03);padding:12px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.06)">
          <div class="small muted" style="font-size:11px">⏳ Quanto Ainda Falta Receber</div>
          <b style="color:#38bdf8;font-size:15px;display:block;margin-top:4px">\${fmtMoney(remainingToReceive)}</b>
        </div>
        <div style="background:rgba(255,255,255,0.03);padding:12px 14px;border-radius:10px;border:1px solid rgba(239,68,68,0.25)">
          <div class="small muted" style="font-size:11px">⚠️ Multa Rescisória de 30%</div>
          <b style="color:#ef4444;font-size:15px;display:block;margin-top:4px">\${fmtMoney(breakFee30)}</b>
        </div>
      </div>

      <!-- ABAIXO: PROPOSTAS DE TRANSMISSÃO RECEBIDAS -->
      <div style="margin-top:22px;border-top:1px solid rgba(255,255,255,0.08);padding-top:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:12px">
          <div>
            <h3 style="margin:0;font-size:16px;font-weight:900;color:#fff;display:flex;align-items:center;gap:8px">
              <span>📡</span> Propostas de Transmissão Recebidas
            </h3>
            <div class="small muted" style="margin-top:2px">
              Demais emissoras e plataformas de streaming interessadas nos direitos de transmissão do clube:
            </div>
          </div>
          <span class="pill" style="background:rgba(255,255,255,0.06);font-size:10px">RESCISÃO COM MULTA DE 30%</span>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:12px">
          \${proposals.map(co => {
            const ann = Math.round(baseAnnual * co.annualFactor);
            const mon = Math.round(ann / 12);
            return \`
              <div style="background:#131828;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:14px;display:flex;flex-direction:column;justify-content:space-between">
                <div>
                  <div style="font-size:13px;font-weight:900;color:#fff">\${esc(co.name)}</div>
                  <div style="font-size:11px;color:#38bdf8;font-weight:700;margin-top:3px">\${esc(co.channels)}</div>
                  <p style="font-size:11px;color:#94a3b8;line-height:1.4;margin:8px 0">\${esc(co.desc)}</p>
                </div>
                <div style="border-top:1px solid rgba(255,255,255,0.07);padding-top:10px;margin-top:6px">
                  <div style="font-size:11px;color:#fbbf24;font-weight:800">💰 Valor Anual: \${fmtMoney(ann)}/ano</div>
                  <div style="font-size:13px;font-weight:900;color:#34d399;margin-top:2px">📅 Parcela Mensal (1/12): +\${fmtMoney(mon)}/mês</div>
                  <div style="font-size:10px;color:#c4b5fd;margin-top:2px">\${co.fanBoost} · Adiantamento disponível</div>
                  <button class="btn btnOpenTvBreakModal" data-tvid="\${co.id}" data-name="\${esc(co.name)}" data-annual="\${ann}" data-monthly="\${mon}" data-channels="\${esc(co.channels)}" data-desc="\${esc(co.desc)}" style="margin-top:10px;width:100%;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;border:none;padding:9px;border-radius:8px;font-weight:800;font-size:11px;cursor:pointer">
                    🔄 Trocar de Emissora
                  </button>
                </div>
              </div>
            \`;
          }).join('')}
        </div>
      </div>
    </div>
  \`;
}
`;

// Substitui renderTvBroadcastCard antiga
const oldRenderTvRegex = /function renderTvBroadcastCard\(st\)\{[\s\S]*?return `<div class="card" id="cardOfficeTvRights"[\s\S]*?`\s*;\s*\}/;
if (oldRenderTvRegex.test(content)) {
  content = content.replace(oldRenderTvRegex, newTvLogic);
  console.log('✅ Substituted renderTvBroadcastCard successfully');
} else {
  console.error('❌ Could not match old renderTvBroadcastCard');
  process.exit(1);
}

// 2. Atualizar o card do Banco no escritório para adicionar o botão "Adiantar Cotas de TV & Patrocínios"
const oldBankOfficeBtn = '<button class="btn primary" id="btnOpenBankFromOffice" style="background:linear-gradient(135deg,#10b981,#059669);border:none;font-weight:900;padding:10px 18px;display:flex;align-items:center;gap:8px">\r\n          🏦 Acessar Banco do Clube\r\n        </button>';
const oldBankOfficeBtnLF = '<button class="btn primary" id="btnOpenBankFromOffice" style="background:linear-gradient(135deg,#10b981,#059669);border:none;font-weight:900;padding:10px 18px;display:flex;align-items:center;gap:8px">\n          🏦 Acessar Banco do Clube\n        </button>';
const newBankOfficeBtns = `<div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn" id="btnOpenBankAdvancesFromOffice" style="background:linear-gradient(135deg,#7c3aed,#4f46e5);border:none;color:#fff;font-weight:900;padding:10px 16px;display:flex;align-items:center;gap:8px">
            💳 Adiantar Cotas de TV & Patrocínios
          </button>
          <button class="btn primary" id="btnOpenBankFromOffice" style="background:linear-gradient(135deg,#10b981,#059669);border:none;font-weight:900;padding:10px 18px;display:flex;align-items:center;gap:8px">
            🏦 Acessar Banco do Clube
          </button>
        </div>`;

if (content.includes(oldBankOfficeBtn)) {
  content = content.replace(oldBankOfficeBtn, newBankOfficeBtns);
  console.log('✅ Added btnOpenBankAdvancesFromOffice to bank card in office (CRLF)');
} else if (content.includes(oldBankOfficeBtnLF)) {
  content = content.replace(oldBankOfficeBtnLF, newBankOfficeBtns);
  console.log('✅ Added btnOpenBankAdvancesFromOffice to bank card in office (LF)');
}

// 3. Atualizar openBankLoansModal para suportar aba de adiantamentos
const oldBankModalOpen = 'function openBankLoansModal(){';
const newBankModalOpen = `let activeBankModalTab = 'borrow';
function openBankLoansModal(initialTab = null){
  if(initialTab) activeBankModalTab = initialTab;
  else if(!activeBankModalTab) activeBankModalTab = 'advances';`;

content = content.replace(oldBankModalOpen, newBankModalOpen);

// Atualizar abas do modal bancário
const oldBankTabsRegex = /<div style="display:flex;gap:12px;padding:14px 24px 0 24px">[\s\S]*?id="tabBankBorrow"[\s\S]*?id="tabBankActive"[\s\S]*?<\/div>/;

const newBankTabs = `<div style="display:flex;gap:10px;padding:14px 24px 0 24px;flex-wrap:wrap">
            <button id="tabBankAdvances" style="padding:10px 18px;border-radius:10px 10px 0 0;font-weight:900;font-size:13px;cursor:pointer;border:none;background:\${activeBankModalTab==='advances'?'linear-gradient(135deg,#7c3aed,#4f46e5)':'rgba(255,255,255,0.06)'};color:#fff;display:flex;align-items:center;gap:6px">
              <span>💳</span> <span>ADIANTAMENTO DE PATROCÍNIOS & TV</span>
            </button>
            <button id="tabBankBorrow" style="padding:10px 18px;border-radius:10px 10px 0 0;font-weight:900;font-size:13px;cursor:pointer;border:none;background:\${activeBankModalTab==='borrow'?'linear-gradient(135deg,#10b981,#059669)':'rgba(255,255,255,0.06)'};color:#fff;display:flex;align-items:center;gap:6px">
              <span>💰</span> <span>SOLICITAR EMPRÉSTIMO</span>
            </button>
            <button id="tabBankActive" style="padding:10px 18px;border-radius:10px 10px 0 0;font-weight:900;font-size:13px;cursor:pointer;border:none;background:\${activeBankModalTab==='active'?'linear-gradient(135deg,#3b82f6,#1d4ed8)':'rgba(255,255,255,0.06)'};color:#fff;display:flex;align-items:center;gap:6px">
              <span>📋</span> <span>MINHAS PARCELAS & ANTECIPAÇÃO (\${state.bankLoans.length})</span>
            </button>
          </div>`;

content = content.replace(oldBankTabsRegex, newBankTabs);

// Adicionar renderização da aba de adiantamentos no modal bancário
const oldBorrowCheckRegex = /<!-- Conteúdo da Aba 1: SOLICITAR EMPRÉSTIMO -->\s*\$\{activeBankModalTab==='borrow' \? `/;

const newBorrowCheck = `<!-- Conteúdo das Abas -->
          \${activeBankModalTab==='advances' ? \`
            <div style="padding:24px;display:flex;flex-direction:column;gap:18px">
              <div style="background:rgba(124,58,237,0.12);border:1px solid rgba(139,92,246,0.35);border-radius:14px;padding:16px 20px">
                <div style="font-size:15px;font-weight:900;color:#c084fc;text-transform:uppercase;display:flex;align-items:center;gap:8px">
                  <span>💳</span> ADIANTAMENTO DE PATROCÍNIOS & COTAS DE TV
                </div>
                <div style="font-size:12px;color:rgba(255,255,255,0.8);margin-top:4px;line-height:1.5">
                  Antecipe até <b>50%</b> ou <b>80%</b> das receitas contratuais do clube à vista no caixa. O valor é abatido proporcionalmente das parcelas futuras.
                </div>
              </div>

              <div style="display:flex;flex-direction:column;gap:14px">
                \${[
                  {
                    type: 'tv',
                    category: '📺 DIREITOS DE TRANSMISSÃO DE TV & STREAMING',
                    name: state.tvContract1Year?.name || 'Emissora Oficial',
                    monthly: state.tvContract1Year?.monthly || 0,
                    totalVal: state.tvContract1Year?.annualTotal || 80000000,
                    badgeColor: '#c084fc',
                    advancedAmount: Math.max(0, Number(state.tvContract1Year?.advancedAmount) || (state.tvContract1Year?.advancedTaken ? Math.round((state.tvContract1Year?.annualTotal || 80000000) * 0.45) : 0)),
                    advancedPaid: Math.max(0, Number(state.tvContract1Year?.advancedPaid) || 0)
                  },
                  {
                    type: 'master',
                    category: '👕 PATROCINADOR MASTER (PEITO)',
                    name: state.sponsors?.master?.brand || 'Sem Patrocínio',
                    monthly: state.sponsors?.master?.monthly || 0,
                    totalVal: (state.sponsors?.master?.monthly || 0) * 12 * (state.sponsors?.master?.years || 1),
                    badgeColor: '#a855f7',
                    advancedAmount: Math.max(0, Number(state.sponsors?.master?.advancedAmount) || 0),
                    advancedPaid: Math.max(0, Number(state.sponsors?.master?.advancedPaid) || 0)
                  },
                  {
                    type: 'sleeves',
                    category: '👕 MANGAS DA CAMISA',
                    name: state.sponsors?.sleeves?.brand || 'Sem Patrocínio',
                    monthly: state.sponsors?.sleeves?.monthly || 0,
                    totalVal: (state.sponsors?.sleeves?.monthly || 0) * 12 * (state.sponsors?.sleeves?.years || 1),
                    badgeColor: '#38bdf8',
                    advancedAmount: Math.max(0, Number(state.sponsors?.sleeves?.advancedAmount) || 0),
                    advancedPaid: Math.max(0, Number(state.sponsors?.sleeves?.advancedPaid) || 0)
                  },
                  {
                    type: 'back',
                    category: '👕 COSTAS / OMOPLATA',
                    name: state.sponsors?.back?.brand || 'Sem Patrocínio',
                    monthly: state.sponsors?.back?.monthly || 0,
                    totalVal: (state.sponsors?.back?.monthly || 0) * 12 * (state.sponsors?.back?.years || 1),
                    badgeColor: '#34d399',
                    advancedAmount: Math.max(0, Number(state.sponsors?.back?.advancedAmount) || 0),
                    advancedPaid: Math.max(0, Number(state.sponsors?.back?.advancedPaid) || 0)
                  }
                ].map(c => {
                  const remAdvance = Math.max(0, c.advancedAmount - c.advancedPaid);
                  const remToReceive = Math.max(0, c.totalVal - c.advancedAmount);
                  const pctAbatido = c.totalVal > 0 ? Math.min(100, Math.round((c.advancedPaid / c.totalVal) * 100)) : 0;
                  const pctAdiantado = c.totalVal > 0 ? Math.min(100 - pctAbatido, Math.round((remAdvance / c.totalVal) * 100)) : 0;
                  const pctAReceber = Math.max(0, 100 - pctAbatido - pctAdiantado);

                  const max50 = Math.round(c.totalVal * 0.50);
                  const avail50 = Math.max(0, max50 - c.advancedAmount);
                  const max80 = Math.round(c.totalVal * 0.80);
                  const avail80 = Math.max(0, max80 - c.advancedAmount);

                  return \`
                    <div style="background:#161a2e;border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:18px;display:flex;flex-direction:column;gap:12px">
                      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
                        <div>
                          <span class="pill" style="font-size:10px;font-weight:900;background:\${c.badgeColor}22;color:\${c.badgeColor}">
                            \${c.category}
                          </span>
                          <div style="font-size:16px;font-weight:900;color:#fff;margin-top:4px">\${esc(c.name)}</div>
                        </div>
                        <div style="text-align:right">
                          <div style="font-size:11px;color:rgba(255,255,255,0.5)">Valor Total do Contrato:</div>
                          <div style="font-size:16px;font-weight:900;color:#fbbf24">\${fmtMoney(c.totalVal)} (\${fmtMoney(c.monthly)}/mês)</div>
                        </div>
                      </div>

                      <!-- Barra de Controle do Contrato -->
                      <div>
                        <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:6px">
                          <span style="color:#34d399">✓ Abatido: \${fmtMoney(c.advancedPaid)} (\${pctAbatido}%)</span>
                          <span style="color:#f59e0b">⚡ Adiantado a Abater: \${fmtMoney(remAdvance)} (\${pctAdiantado}%)</span>
                          <span style="color:#38bdf8">⏳ Falta Receber: \${fmtMoney(remToReceive)} (\${pctAReceber}%)</span>
                        </div>
                        <div style="width:100%;height:10px;background:rgba(255,255,255,0.06);border-radius:6px;overflow:hidden;display:flex">
                          <div style="width:\${pctAbatido}%;background:#10b981" title="Abatido"></div>
                          <div style="width:\${pctAdiantado}%;background:#f59e0b" title="Adiantado"></div>
                          <div style="width:\${pctAReceber}%;background:#38bdf8" title="A Receber"></div>
                        </div>
                      </div>

                      <!-- Ações de Adiantamento -->
                      <div style="display:flex;justify-content:flex-end;gap:10px;flex-wrap:wrap;border-top:1px solid rgba(255,255,255,0.06);padding-top:12px">
                        <button class="btn btnTakeContractAdvance" data-type="\${c.type}" data-pct="50" \${avail50 <= 0 ? 'disabled style="opacity:0.4;cursor:not-allowed"' : 'style="background:linear-gradient(135deg,#f59e0b,#d97706);color:#000;font-weight:900;font-size:11px;border:none;padding:8px 14px;border-radius:8px;cursor:pointer"'}>
                          \${avail50 > 0 ? ('⚡ Pedir Adiantamento (50%) (+' + fmtMoney(avail50) + ')') : '✔ Limite de 50% Atingido'}
                        </button>
                        <button class="btn btnTakeContractAdvance" data-type="\${c.type}" data-pct="80" \${avail80 <= 0 ? 'disabled style="opacity:0.4;cursor:not-allowed"' : 'style="background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;font-weight:900;font-size:11px;border:none;padding:8px 14px;border-radius:8px;cursor:pointer"'}>
                          \${avail80 > 0 ? ('🚀 Pedir Adiantamento (80%) (+' + fmtMoney(avail80) + ')') : '✔ Limite de 80% Atingido'}
                        </button>
                      </div>
                    </div>
                  \`;
                }).join('')}
              </div>
            </div>
          \` : activeBankModalTab==='borrow' ? \``;

content = content.replace(oldBorrowCheckRegex, newBorrowCheck);

// Event listeners do modal bancário
const oldTabBorrowListener = `const tabBorrow = $('#tabBankBorrow');
    if(tabBorrow) tabBorrow.onclick = () => { activeBankModalTab = 'borrow'; renderModalContent(); };`;

const newTabBorrowListener = `const tabAdvances = $('#tabBankAdvances');
    if(tabAdvances) tabAdvances.onclick = () => { activeBankModalTab = 'advances'; renderModalContent(); };
    const tabBorrow = $('#tabBankBorrow');
    if(tabBorrow) tabBorrow.onclick = () => { activeBankModalTab = 'borrow'; renderModalContent(); };`;

content = content.replace(oldTabBorrowListener, newTabBorrowListener);

// Handler dos botões de adiantamento
const oldBtnTakeLoan = `const btnConfirm = $('#btnConfirmTakeLoan');`;
const newBtnTakeLoan = `$$('.btnTakeContractAdvance').forEach(btn => {
      btn.onclick = () => {
        const type = btn.dataset.type;
        const pct = Number(btn.dataset.pct);
        takeContractAdvance(type, pct);
        renderModalContent();
        render();
      };
    });

    const btnConfirm = $('#btnConfirmTakeLoan');`;

content = content.replace(oldBtnTakeLoan, newBtnTakeLoan);

// 4. Atualizar os listeners na view === 'escritorio'
const oldOfficeTvRegex = /\$\('\.btnSignTvAnnualAction'\)[\s\S]*?toast\(`⚡ Adiantamento de \$\{fmtMoney\(advVal\)\} creditado à vista no caixa do clube!`\);\s*\}\s*;/;

const newOfficeTvListeners = `$$('.btnOpenTvBreakModal').forEach(btn => {
      btn.onclick = () => {
        openTvBreakModal({
          id: btn.dataset.tvid,
          name: btn.dataset.name,
          annualTotal: Number(btn.dataset.annual),
          monthly: Number(btn.dataset.monthly),
          channels: btn.dataset.channels,
          desc: btn.dataset.desc
        });
      };
    });
    const btnTvOpenAdv = $('#btnTvOpenBankAdvances');
    if(btnTvOpenAdv) btnTvOpenAdv.onclick = () => openBankLoansModal('advances');
    const btnOfficeBankAdv = $('#btnOpenBankAdvancesFromOffice');
    if(btnOfficeBankAdv) btnOfficeBankAdv.onclick = () => openBankLoansModal('advances');`;

content = content.replace(oldOfficeTvRegex, newOfficeTvListeners);

fs.writeFileSync(gameJsPath, content, 'utf8');
console.log('🎉 patch_tv_and_bank.js successfully applied to js/game.js!');
