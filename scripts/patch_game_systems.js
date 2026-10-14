// Script de patch cirúrgico para js/game.js (BLOCO 01 a BLOCO 05)
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'js', 'game.js');
let content = fs.readFileSync(filePath, 'utf8');

let patchesApplied = 0;

// 1. Hook real player faces in resolvePlayerPhotoUrl
const p1Target = "function resolvePlayerPhotoUrl(p) {\r\n  if (!p) return null;\r\n  const name = typeof p === 'string' ? p : (p.name || '');\r\n  if (!name) return null;";
const p1TargetLF = "function resolvePlayerPhotoUrl(p) {\n  if (!p) return null;\n  const name = typeof p === 'string' ? p : (p.name || '');\n  if (!name) return null;";
const p1Repl = `function resolvePlayerPhotoUrl(p) {
  if (!p) return null;
  const name = typeof p === 'string' ? p : (p.name || '');
  if (!name) return null;
  if (typeof window !== 'undefined' && window.AFM_RealPlayerFaces && typeof window.AFM_RealPlayerFaces.resolveRealPlayerPhotoUrl === 'function') {
    const realFace = window.AFM_RealPlayerFaces.resolveRealPlayerPhotoUrl(p);
    if (realFace) return realFace;
  }`;

if (content.includes(p1Target)) {
  content = content.replace(p1Target, p1Repl.replace(/\n/g, '\r\n'));
  patchesApplied++;
  console.log('[Patch 1] resolvePlayerPhotoUrl patched (CRLF)');
} else if (content.includes(p1TargetLF)) {
  content = content.replace(p1TargetLF, p1Repl);
  patchesApplied++;
  console.log('[Patch 1] resolvePlayerPhotoUrl patched (LF)');
} else {
  console.log('[Patch 1] Target not found, checking if already patched...');
}

// 2. Hook changelog_14outubro in changelogPage
const p2Target = "function changelogPage(){\r\n  return `";
const p2TargetLF = "function changelogPage(){\n  return `";
const p2Repl = `function changelogPage(){
  if (typeof window !== 'undefined' && window.AFM_Changelog14Out && typeof window.AFM_Changelog14Out.renderChangelogMarkup === 'function') {
    return window.AFM_Changelog14Out.renderChangelogMarkup();
  }
  return \``;

if (content.includes(p2Target)) {
  content = content.replace(p2Target, p2Repl.replace(/\n/g, '\r\n'));
  patchesApplied++;
  console.log('[Patch 2] changelogPage patched (CRLF)');
} else if (content.includes(p2TargetLF)) {
  content = content.replace(p2TargetLF, p2Repl);
  patchesApplied++;
  console.log('[Patch 2] changelogPage patched (LF)');
}

// 3. Guard bankLoans array in structurePage
const p3Target = "function structurePage(){\r\n  const f = userFixture()";
const p3TargetLF = "function structurePage(){\n  const f = userFixture()";
const p3Repl = `function structurePage(){
  if (!Array.isArray(state.bankLoans)) state.bankLoans = Array.isArray(state.bankLoans?.activeLoans) ? state.bankLoans.activeLoans : [];
  const f = userFixture()`;

if (content.includes(p3Target)) {
  content = content.replace(p3Target, p3Repl.replace(/\n/g, '\r\n'));
  patchesApplied++;
  console.log('[Patch 3] structurePage bankLoans guarded (CRLF)');
} else if (content.includes(p3TargetLF)) {
  content = content.replace(p3TargetLF, p3Repl);
  patchesApplied++;
  console.log('[Patch 3] structurePage bankLoans guarded (LF)');
}

// 4. Guard bankLoans array in officePage and add dividend expense
const p4Target = "function officePage(){\r\n  const socioData = getSocioTorcedorMeta();";
const p4TargetLF = "function officePage(){\n  const socioData = getSocioTorcedorMeta();";
const p4Repl = `function officePage(){
  if (!Array.isArray(state.bankLoans)) state.bankLoans = Array.isArray(state.bankLoans?.activeLoans) ? state.bankLoans.activeLoans : [];
  const socioData = getSocioTorcedorMeta();`;

if (content.includes(p4Target)) {
  content = content.replace(p4Target, p4Repl.replace(/\n/g, '\r\n'));
  patchesApplied++;
  console.log('[Patch 4] officePage bankLoans guarded (CRLF)');
} else if (content.includes(p4TargetLF)) {
  content = content.replace(p4TargetLF, p4Repl);
  patchesApplied++;
  console.log('[Patch 4] officePage bankLoans guarded (LF)');
}

// 4b. Add Despesa com Dividendos aos Acionistas to officePage expense grid
const p4bTarget = "['Parcelas de obras do estádio',finance.expenses.stadiumRepayments]].map(([label,value])=>`<div style=\"background:rgba(255,255,255,0.03);padding:10px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.05)\"><div class=\"muted\">${label}</div><b style=\"color:#f87171;font-size:15px\">${fmtMoney(value)}/mês</b></div>`).join('')}";
const p4bRepl = "['Parcelas de obras do estádio',finance.expenses.stadiumRepayments],['Despesa com Dividendos aos Acionistas',(typeof window !== 'undefined' && window.AFM_LifeAndSharesPro?.calculateMonthlyClubDividendExpense ? window.AFM_LifeAndSharesPro.calculateMonthlyClubDividendExpense(state).totalClubDividendExpense : (state.lastMonthDividendExpense || 0))]].map(([label,value])=>`<div style=\"background:rgba(255,255,255,0.03);padding:10px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.05)\"><div class=\"muted\">${label}</div><b style=\"color:#f87171;font-size:15px\">${fmtMoney(value)}/mês</b></div>`).join('')}";

if (content.includes(p4bTarget)) {
  content = content.replace(p4bTarget, p4bRepl);
  patchesApplied++;
  console.log('[Patch 4b] officePage dividend expense item added');
}

// 5. Monthly turn process in advance
const p5Target = "if(nextDate.endsWith('-01') && typeof processBankLoansOnRound === 'function') processBankLoansOnRound();";
const p5Repl = "if(nextDate.endsWith('-01') && typeof processBankLoansOnRound === 'function') processBankLoansOnRound();\r\n      if(nextDate.endsWith('-01') && typeof window !== 'undefined' && window.AFM_LifeAndSharesPro?.processMonthlyLifeAndDividendsTurn) window.AFM_LifeAndSharesPro.processMonthlyLifeAndDividendsTurn(state);";

if (content.includes(p5Target)) {
  content = content.replace(p5Target, p5Repl);
  patchesApplied++;
  console.log('[Patch 5] monthly turn life and dividends hooked');
}

// 6. Hook AFM_LifeAndSharesPro in career view
const p6Target = "if(window.AFM_ManagerEconomy && typeof window.AFM_ManagerEconomy.renderCareerEconomyPanel === 'function'){\r\n      window.AFM_ManagerEconomy.renderCareerEconomyPanel('afm-career-economy-container', state);\r\n    }";
const p6TargetLF = "if(window.AFM_ManagerEconomy && typeof window.AFM_ManagerEconomy.renderCareerEconomyPanel === 'function'){\n      window.AFM_ManagerEconomy.renderCareerEconomyPanel('afm-career-economy-container', state);\n    }";
const p6Repl = `if(typeof window !== 'undefined' && window.AFM_LifeAndSharesPro && typeof window.AFM_LifeAndSharesPro.renderLifeAndSharesUI === 'function'){\r\n      window.AFM_LifeAndSharesPro.renderLifeAndSharesUI('afm-career-economy-container', state);\r\n    } else if(window.AFM_ManagerEconomy && typeof window.AFM_ManagerEconomy.renderCareerEconomyPanel === 'function'){\r\n      window.AFM_ManagerEconomy.renderCareerEconomyPanel('afm-career-economy-container', state);\r\n    }`;

if (content.includes(p6Target)) {
  content = content.replace(p6Target, p6Repl);
  patchesApplied++;
  console.log('[Patch 6] career page manager life and shares hooked (CRLF)');
} else if (content.includes(p6TargetLF)) {
  content = content.replace(p6TargetLF, p6Repl.replace(/\r\n/g, '\n'));
  patchesApplied++;
  console.log('[Patch 6] career page manager life and shares hooked (LF)');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log(`Total patches applied: ${patchesApplied}`);
