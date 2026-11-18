/**
 * SUÍTE DE REGRESSÃO E HIPÓTESES ANTI-BUG — NOVAS SOLICITAÇÕES:
 * 1. Criar Seu Próprio Clube (10 melhorias + setupViewMode=null + escudo nos 4 kits + rival + SAF + capitão + colisão de nome/cores)
 * 2. Modo Jogador — Anti-Overshoot do Calendário (17/01 vs 20/01), Performance < 100ms e APENAS 2 botões no Dia do Jogo
 * 3. Modo Jogador — Posição Exata Permanente em Campo (Titular, Reserva entrando no lugar de Volante, Intervalo e 2º Tempo) + Protagonismo
 * 4. Modo Jogador — FootGram Campanha Patrocinada Condicional (% pós-boa partida) + Crédito Bancário Real
 * 5. Modo Jogador — Staff Pessoal Unificado (sem duplicidade no Treino, ✅ CONTRATADO, ❌ Demitir, 🔴 DESPESAS PREVISTAS e cobrança mensal)
 * 6. Modo Jogador — Propostas de Material Esportivo com Bônus Único (+1 a +3) em Atributos Distintos
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const storageMap = new Map();
global.window = global;
global.__AFM_HEADLESS_TEST__ = true;
global.localStorage = {
  getItem: (k) => (storageMap.has(k) ? storageMap.get(k) : null),
  setItem: (k, v) => storageMap.set(k, String(v)),
  removeItem: (k) => storageMap.delete(k),
  clear: () => storageMap.clear(),
  key: (i) => Array.from(storageMap.keys())[i] || null,
  get length() { return storageMap.size; }
};
global.sessionStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {}, clear: () => {} };

function createCanvas2DContext() {
  const grad = { addColorStop() {} };
  return {
    canvas: { width: 1280, height: 720 },
    clearRect() {}, fillRect() {}, strokeRect() {}, beginPath() {}, closePath() {},
    moveTo() {}, lineTo() {}, quadraticCurveTo() {}, bezierCurveTo() {}, arc() {},
    ellipse() {}, rect() {}, roundRect() {}, fill() {}, stroke() {}, clip() {},
    save() {}, restore() {}, translate() {}, scale() {}, rotate() {}, setTransform() {},
    setLineDash() {}, fillText() {}, strokeText() {},
    measureText: (t) => ({ width: String(t || '').length * 7 }),
    createLinearGradient: () => grad, createRadialGradient: () => grad, drawImage() {}
  };
}

let allLiveElements = [];
function parseAttributes(attrStr) {
  const attrs = {};
  const dataset = {};
  const re = /([a-zA-Z0-9_:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
  let m;
  while ((m = re.exec(attrStr)) !== null) {
    const key = m[1];
    const val = m[2] ?? m[3] ?? m[4] ?? '';
    attrs[key] = val;
    if (key.startsWith('data-')) {
      dataset[key.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = val;
    }
  }
  return { attrs, dataset };
}

function createDomElement(tag = 'div', parent = null, registerLive = true) {
  let _innerHTML = '';
  let _className = '';
  const classSet = new Set();
  const listeners = {};
  const attrsMap = {};
  const ctx2d = tag.toLowerCase() === 'canvas' ? createCanvas2DContext() : null;
  const el = {
    nodeType: 1, tagName: String(tag).toUpperCase(), id: '', value: '', checked: false, disabled: false,
    style: {}, dataset: {}, parentNode: parent, parentElement: parent, children: [], textContent: '', innerText: '',
    width: 1280, height: 720,
    get className() { return _className; },
    set className(v) {
      _className = String(v || '');
      classSet.clear();
      _className.split(/\s+/).filter(Boolean).forEach(c => classSet.add(c));
    },
    classList: {
      add(...cs) { cs.forEach(c => c && classSet.add(c)); _className = [...classSet].join(' '); },
      remove(...cs) { cs.forEach(c => classSet.delete(c)); _className = [...classSet].join(' '); },
      contains(c) { return classSet.has(c); },
      toggle(c, f) {
        const add = f !== undefined ? Boolean(f) : !classSet.has(c);
        if (add) classSet.add(c); else classSet.delete(c);
        _className = [...classSet].join(' ');
        return add;
      }
    },
    get innerHTML() { return _innerHTML; },
    set innerHTML(html) {
      const removeSub = (n) => {
        (n.children || []).forEach(removeSub);
        const i = allLiveElements.indexOf(n);
        if (i >= 0) allLiveElements.splice(i, 1);
      };
      el.children.forEach(removeSub);
      el.children = [];
      _innerHTML = String(html ?? '');
      el.textContent = _innerHTML.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      el.innerText = el.textContent;
      const tagRe = /<(button|input|select|canvas|div|span|a|tr)\b([^>]*)\/?>/gi;
      let match;
      while ((match = tagRe.exec(_innerHTML)) !== null) {
        const { attrs, dataset } = parseAttributes(match[2] || '');
        if (!attrs.id && !attrs.class && Object.keys(dataset).length === 0 && match[1].toLowerCase() === 'div') continue;
        const child = createDomElement(match[1], el, true);
        if (attrs.id) child.id = attrs.id;
        if (attrs.class) child.className = attrs.class;
        if (attrs.value !== undefined) child.value = attrs.value;
        if ('disabled' in attrs) child.disabled = true;
        if ('checked' in attrs) child.checked = true;
        Object.assign(child.dataset, dataset);
        Object.assign(attrsMap, attrs);
        el.children.push(child);
      }
    },
    setAttribute(k, v) {
      attrsMap[k] = String(v);
      if (k === 'id') el.id = String(v);
      if (k === 'class') el.className = String(v);
      if (k.startsWith('data-')) el.dataset[k.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = String(v);
    },
    getAttribute: (k) => attrsMap[k] ?? null,
    hasAttribute: (k) => k in attrsMap,
    removeAttribute(k) { delete attrsMap[k]; },
    appendChild(child) { child.parentNode = el; child.parentElement = el; el.children.push(child); if (!allLiveElements.includes(child)) allLiveElements.push(child); return child; },
    removeChild(child) { const i = el.children.indexOf(child); if (i >= 0) el.children.splice(i, 1); const gi = allLiveElements.indexOf(child); if (gi >= 0) allLiveElements.splice(gi, 1); return child; },
    remove() { if (el.parentNode?.removeChild) el.parentNode.removeChild(el); },
    addEventListener(ev, fn) { (listeners[ev] = listeners[ev] || []).push(fn); },
    removeEventListener(ev, fn) { if (listeners[ev]) listeners[ev] = listeners[ev].filter(f => f !== fn); },
    dispatchEvent(evObj) {
      const type = evObj?.type || 'click';
      (listeners[type] || []).slice().forEach(fn => fn.call(el, evObj));
      if (typeof el[`on${type}`] === 'function') el[`on${type}`].call(el, evObj);
      return true;
    },
    click() {
      if (el.disabled) return;
      const ev = { type: 'click', target: el, currentTarget: el, preventDefault() {}, stopPropagation() {}, stopImmediatePropagation() {} };
      if (typeof el.onclick === 'function') el.onclick(ev);
      (listeners.click || []).slice().forEach(fn => fn.call(el, ev));
      document.dispatchEvent(ev);
    },
    focus() {}, blur() {}, scrollIntoView() {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720, right: 1280, bottom: 720 }),
    getContext: () => ctx2d,
    closest(sel) { let cur = el; while (cur && cur.nodeType === 1) { if (matchesSelector(cur, sel)) return cur; cur = cur.parentElement; } return null; },
    querySelector: (sel) => queryAllWithin(el, sel)[0] || null,
    querySelectorAll: (sel) => queryAllWithin(el, sel)
  };
  if (registerLive) allLiveElements.push(el);
  return el;
}

function matchesSingleSelector(el, rawSel) {
  const s = rawSel.trim();
  if (!s || !el || el.nodeType !== 1) return false;
  if (s.startsWith('#') && !s.includes(' ') && !s.includes('.') && !s.includes('[')) return el.id === s.slice(1);
  if (s.startsWith('.') && !s.includes(' ') && !s.slice(1).includes('.') && !s.includes('[')) return el.classList.contains(s.slice(1));
  const attrMatch = s.match(/^([a-zA-Z0-9_-]+)?(\.[a-zA-Z0-9_-]+)?\[([a-zA-Z0-9_-]+)(?:=["']?([^"'\]]+)["']?)?\]$/);
  if (attrMatch) {
    const [, tagPart, clsPart, attrName, attrVal] = attrMatch;
    if (tagPart && el.tagName !== tagPart.toUpperCase()) return false;
    if (clsPart && !el.classList.contains(clsPart.slice(1))) return false;
    const actual = attrName.startsWith('data-')
      ? el.dataset[attrName.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())]
      : el.getAttribute(attrName);
    if (actual === undefined || actual === null) return false;
    return attrVal === undefined ? true : String(actual) === String(attrVal);
  }
  if (/^[a-zA-Z0-9]+$/.test(s)) return el.tagName === s.toUpperCase();
  const parts = s.split('.');
  if (!parts[0] && parts.length > 1) return parts.slice(1).every(c => el.classList.contains(c));
  return false;
}
function matchesSelector(el, selGroup) {
  return String(selGroup || '').split(',').some(part => {
    const tokens = part.trim().split(/\s+/).filter(Boolean);
    if (!tokens.length) return false;
    if (!matchesSingleSelector(el, tokens[tokens.length - 1])) return false;
    let cur = el.parentElement;
    for (let i = tokens.length - 2; i >= 0; i--) {
      while (cur && !matchesSingleSelector(cur, tokens[i])) cur = cur.parentElement;
      if (!cur) return false;
      cur = cur.parentElement;
    }
    return true;
  });
}
function queryAllWithin(root, sel) {
  const out = [];
  const visit = (n) => { (n.children || []).forEach(ch => { if (matchesSelector(ch, sel)) out.push(ch); visit(ch); }); };
  visit(root);
  return out;
}

const docListeners = {};
const bodyEl = createDomElement('body', null, true);
const headEl = createDomElement('head', null, true);
const appEl = createDomElement('div', bodyEl, true);
appEl.id = 'app';
bodyEl.appendChild(appEl);

global.document = {
  body: bodyEl, head: headEl, documentElement: createDomElement('html', null, false),
  createElement: (tag) => createDomElement(tag, null, true),
  getElementById: (id) => allLiveElements.find(e => e.id === id) || null,
  querySelector: (sel) => allLiveElements.find(e => matchesSelector(e, sel)) || null,
  querySelectorAll: (sel) => allLiveElements.filter(e => matchesSelector(e, sel)),
  addEventListener(ev, fn) { (docListeners[ev] = docListeners[ev] || []).push(fn); },
  removeEventListener(ev, fn) { if (docListeners[ev]) docListeners[ev] = docListeners[ev].filter(f => f !== fn); },
  dispatchEvent(ev) { (docListeners[ev?.type || 'click'] || []).slice().forEach(fn => fn(ev)); return true; }
};
global.window.document = global.document;
global.window.addEventListener = () => {};
global.window.removeEventListener = () => {};
global.window.dispatchEvent = () => true;
global.CustomEvent = class CustomEvent { constructor(t, o) { this.type = t; this.detail = o?.detail; } };
global.Image = class Image { set src(_) { if (this.onload) this.onload(); } };
global.navigator = { userAgent: 'NodeTest/AFM2027', onLine: true };
global.location = { href: 'http://localhost:8080/', reload() {} };
global.confirm = () => true;
global.alert = () => {};
global.prompt = () => '';
global.scrollTo = () => {};
global.requestAnimationFrame = () => 1;
global.cancelAnimationFrame = () => {};
global.performance = { now: () => Date.now() };
global.URL = { createObjectURL: () => 'blob:mock', revokeObjectURL: () => {} };
global.Blob = class Blob { constructor(parts) { this.parts = parts; } };
global.fetch = async () => ({ ok: true, status: 200, json: async () => [] });

const rootDir = path.join(__dirname, '..');
[
  'js/core/error_log.js',
  'js/core/hotfix_bankloans_and_img_tags.js',
  'js/competitions.js',
  'data/competition_teams.js',
  'data/international_teams_2026_27.js',
  'data/continental_2026.js',
  'js/core/tournament_engine.js',
  'js/core/competition_integrity.js',
  'data/players_live.js',
  'data/club_badges.js',
  'js/core/club_badges_core.js',
  'js/database.js',
  'js/features30.js',
  'js/core/club_stadiums_catalog.js',
  'js/core/match_engine.js',
  'js/core/tactics_pitch.js',
  'js/core/real_football_engine.js',
  'js/ui/training_center_modal.js',
  'js/ui/create_club_ui.js',
  'js/player/social_media_manager.js',
  'js/player/national_teams_manager.js',
  'js/player/lifestyleData.js',
  'js/player/player_career_engine.js',
  'js/ui/create_player_ui.js',
  'js/player/player_mode_ui.js',
  'js/career-economy-fix.js',
  'js/season_view_fix.js',
  'js/competitions_sync_fix.js',
  'js/structure_stadium_unified_fix.js',
  'js/game.js',
  'js/core/isolated_save_manager.js',
  'js/core/calendar_and_day_advance_fix.js',
  'js/systems/real_world_leagues_and_pyramid.js',
  'js/systems/manager_economy.js',
  'js/systems/global_ranking_and_confidence.js',
  'js/systems/club_finance_and_stadium.js',
  'js/systems/manager_life_and_shares_pro.js',
  'js/systems/transfer_market_pro.js',
  'js/match/tactical_4phases_enhancer.js',
  'js/match/live_match_hud.js',
  'js/systems/competitions_and_awards.js',
  'js/systems/global_ranking_and_x1.js',
  'js/systems/trophies_tv_1year_marketing_and_payroll.js',
  'js/systems/cup_highlight_ranking_world_and_licenses.js',
  'js/systems/market_lupa_aging_and_regens.js',
  'js/systems/player_xp_evolution.js'
].forEach(rel => {
  const full = path.join(rootDir, rel);
  if (fs.existsSync(full)) eval(fs.readFileSync(full, 'utf8'));
});

window.saveStoredAccounts([
  { username: 'qa_ux_1', name: 'Aquino QA', role: 'player', saves: [] }
]);
window.setActiveAccount('qa_ux_1');

console.log('🧪 [TESTE 1/6] Estúdio Criar Seu Próprio Clube (10 melhorias + anti-colisão + 4 kits + rival + SAF + capitão)...');
{
  window.openCreateClubModal('bra-est-sp');
  assert.equal(window.setupViewMode, 'create_club');

  // 1) Verifica os 4 uniformes + brasão vetorial real estampado no peito (data:image/svg+xml) + patrocinador master
  const kitHtml = window.generateKitSvg(window.customClubDraft.homeKit, '', 120);
  assert.ok(kitHtml.includes('data:image/svg+xml;utf8,'), 'Brasão vetorial real DEVE aparecer como <image> em todos os uniformes');
  assert.ok(kitHtml.includes('VÉRTICE'), 'Patrocinador Master inicial DEVE aparecer estampado na camisa');
  assert.ok(document.getElementById('btnOpenThirdKitModal'), 'Botão do 3º Uniforme deve existir');
  assert.ok(document.getElementById('btnOpenGkKitModal'), 'Botão do Uniforme de Goleiro deve existir');

  // 2) Testa bloqueio anti-colisão contra nome de clube oficial ("Corinthians")
  window.customClubDraft.name = 'Corinthians';
  window.renderCreateClubScreen(appEl, window.getActiveAccount());
  document.getElementById('btnBottomLaunchCreateClub').click();
  assert.equal(window.setupViewMode, 'create_club', 'Nome colidindo com clube oficial existente DEVE ser bloqueado antes de iniciar');

  // 3) Testa Sorteio Completo + Modelo SAF + Projeto Estruturado (R$ 650k) + Gramado Híbrido + Rivalidade + Capitão Customizado
  window.AFM_CreateClubUI.randomize();
  window.customClubDraft.name = 'Valência Imperial SAF';
  window.customClubDraft.shortName = 'VIS';
  window.customClubDraft.clubModel = 'saf';
  window.customClubDraft.projectTier = 'estruturado';
  window.customClubDraft.pitchType = 'hybrid';
  window.customClubDraft.rivalClub = 'Palmeiras';
  window.customClubDraft.masterSponsorId = 'sp_banco';
  window.customClubDraft.squad = window.generateCustomClubSquad('Valência Imperial SAF');
  window.customClubDraft.squad.forEach((p, i) => { p.isCustomCaptain = (i === 9); });
  const chosenCapName = window.customClubDraft.squad[9].name;

  window.renderCreateClubScreen(appEl, window.getActiveAccount());
  window.setupSelectedSlot = 2;
  document.getElementById('btnBottomLaunchCreateClub').click();

  const stClub = window.getState();
  assert.equal(window.setupViewMode, null, 'setupViewMode DEVE ser limpo (null) ao iniciar carreira com clube criado');
  assert.equal(stClub.club, 'Valência Imperial SAF');
  assert.equal(stClub.balance, 650000, 'Pacote Estruturado deve iniciar com R$ 650.000 em caixa');
  assert.equal(stClub.isSafClub, true, 'Modelo SAF deve marcar state.isSafClub = true');
  assert.equal(window.AFMCareerFix.isClubSaf(stClub, stClub.club), true, 'AFMCareerFix deve reconhecer o clube criado como SAF');
  assert.equal(stClub.stadium.pitchType, 'hybrid', 'Tipo de gramado escolhido deve persistir no estádio');
  assert.ok(stClub.customClub.thirdKit && stClub.customClub.gkKit, '3º Uniforme e Uniforme de Goleiro devem persistir em state.customClub');
  assert.equal(stClub.sponsors.master.name, 'NeoBank Digital', 'Patrocinador Master selecionado deve estar ativo no Dia 1');
  assert.equal(stClub.sponsors.master.bonus, 8500, 'Bônus de vitória (winBonus) do Patrocinador Master escolhido DEVE ser preservado sem cair no fallback 15000');
  assert.ok(stClub.news.some(n => JSON.stringify(n).includes('650.000')), 'Notícia inaugural deve refletir o caixa real (R$ 650.000) do pacote escolhido');
  assert.ok(stClub.news.some(n => JSON.stringify(n).includes('7.500')), 'Notícia inaugural deve refletir a capacidade real (7.500 lugares) do pacote escolhido');
  assert.ok(String(stClub.setPieces.captain).includes(chosenCapName), 'Capitão escolhido no editor deve assumir a braçadeira em state.setPieces.captain');
  assert.equal(window.isDerbyMatch('Valência Imperial SAF', 'Palmeiras'), true, 'Confronto contra o Maior Rival escolhido DEVE ativar Clássico/Derby');

  // 4) Testa fechamento financeiro mensal do clube criado: marketing deve cobrar R$ 20.000/mês (5k*4) e NUNCA R$ 144.000/mês!
  const balBeforeMonth = stClub.balance;
  window.processClubMonthlyFinances(stClub, '2026-01-15');
  assert.ok(stClub.balance > balBeforeMonth - 60000, `Clube criado não pode sofrer cobrança abusiva de R$ 144k de marketing de Série A no mês 1 (saldo: ${balBeforeMonth} ➔ ${stClub.balance})`);
  console.log('   ✅ Teste 1 aprovado!');
}

console.log('🧪 [TESTE 2/6] Modo Jogador — Anti-Overshoot (17/01 vs 20/01), Copa < 100ms e APENAS 2 botões no Dia do Jogo...');
{
  window.AFM_SETUP_GUARD.enterSetupCleanly();
  window.setupSelectedSlot = 1;
  window.AFM_CreatePlayerUI.setWizardState({
    step: 5, name: 'D. Aquino', nickname: 'Aquino', nationality: 'Brasil', shirtNumber: 9,
    stateUf: 'DF', city: 'Brasília', clubName: 'Brasília', origin: 'varzea', playstyle: 'frieza_letal',
    inspiration: 'ronaldo', height: 1.80, bodyBuild: 'Equilibrado', preferredFoot: 'Direito',
    position: 'ATA', archetype: 'st_poacher', pointsAvailable: 0,
    pointsDistributed: { velocidade: 2, finalizacao: 3, passe: 0, drible: 0, defesa: 0, fisico: 0, reflexos: 0 },
    starterBoot: 'boot_crimson'
  });
  window.AFM_CreatePlayerUI.finalizePlayerCareerStart(appEl);

  const st = window.getState();
  // Performance: getCopaDoBrasilState repetido 10x deve levar < 50ms (antes levava 7.500ms!)
  const t0 = Date.now();
  for (let i = 0; i < 10; i++) window.getCopaDoBrasilState();
  const elapsedMs = Date.now() - t0;
  assert.ok(elapsedMs < 150, `getCopaDoBrasilState 10x deve ser instantâneo (<150ms, levou ${elapsedMs}ms)`);

  // Mesmo se flag legada de pré-temporada/janela estivesse ativa, CONTINUAR não pode pular o jogo de 17/01!
  st.date = '2026-01-15';
  st.currentDate = '2026-01-15';
  st.isPreSeason = true;
  st.preSeasonDays = 4;
  st.transferWindowActive = true;

  const firstMatch = window.getActualCurrentMatch(st);
  assert.ok(firstMatch && firstMatch.date, 'Brasília deve possuir estreia no Candangão');

  // Clica no botão CONTINUAR do topo: deve avançar EXATAMENTE até a data do jogo e parar lá!
  window.handleHeaderContinueAction();
  assert.equal(st.date, firstMatch.date, `CONTINUAR deve parar exatamente na data do jogo (${firstMatch.date}), nunca pular!`);

  // Clicar de novo em CONTINUAR ou advance_to_match ou advance_1day NO DIA DO JOGO jamais avança a data!
  window.handleHeaderContinueAction();
  window.AFM_CalendarFix.advanceToNextMatchGuaranteed(st);
  window.AFM_CalendarFix.advanceDaysGuaranteed(st, 1);
  window.advanceCalendarDays(3, true);
  assert.equal(st.date, firstMatch.date, 'Nenhum avanço pode ultrapassar uma partida não disputada!');

  // Verifica que NO DIA DO JOGO só existem os 2 botões oficiais: JOGAR PARTIDA AO VIVO e SIMULAR PARTIDA
  window.setGameView('player_hub');
  window.render();
  assert.ok(document.querySelector('.btn-player-play-live'), 'Botão JOGAR PARTIDA AO VIVO deve aparecer no Dia do Jogo');
  assert.ok(document.querySelector('.btn-player-play-quick'), 'Botão SIMULAR PARTIDA deve aparecer no Dia do Jogo');
  assert.equal(document.querySelector('.btn-player-advance-to-match'), null, 'Botão Avançar até o Dia do Jogo NÃO pode aparecer no Dia do Jogo');
  assert.equal(document.querySelector('.btn-player-advance-1day'), null, 'Botão Avançar 1 Dia NÃO pode aparecer no Dia do Jogo');

  // Hipótese de save legado que JÁ estava em 20/01/2026 com jogo de 17/01/2026 pendente:
  st.date = '2026-01-20';
  st.currentDate = '2026-01-20';
  const gateLegacy = window.canStartMatch(null, st);
  assert.equal(gateLegacy.canStart, true, 'Save legado em 20/01 com jogo pendente em 17/01 deve liberar canStart=true imediatamente');
  window.render();
  assert.equal(st.date, firstMatch.date, 'Save legado em 20/01 com jogo pendente em 17/01 deve auto-curar a data para 17/01');
  assert.ok(document.querySelector('.btn-player-play-live'), 'Save em 20/01 com jogo de 17/01 deve exibir JOGAR PARTIDA AO VIVO para destravar imediatamente');

  // Restaura data exata do jogo
  st.date = firstMatch.date;
  st.currentDate = firstMatch.date;
  console.log('   ✅ Teste 2 aprovado!');
}

console.log('🧪 [TESTE 3/6] Modo Jogador — Posição Exata em Campo (Titular, Entrada do Banco sobre Volante e Intervalo)...');
{
  const st = window.getState();
  const ath = st.squad.find(p => String(p.id) === String(st.controlledPlayerId));
  assert.ok(['ATA', 'ST'].includes(ath.pos));

  // Caso A: Entrando do banco no 2º tempo quando o jogador mais cansado do time é o VOLANTE (DM no círculo central)!
  st.playerCareerState.role = 'Reserva Imediato';
  st.playerCareerState.squadRole = 'Reserva Imediato';
  st.lineup = st.squad.filter(p => String(p.id) !== String(ath.id)).slice(0, 11).map(p => window.playerKey(p));
  window.startLiveMatch();
  const lms = window.liveMatchState;
  const userIsHome = window.norm(lms.home) === window.norm(st.club);
  const myTeamArr = userIsHome ? lms.homePlayers : lms.awayPlayers;

  // Se iniciou como reserva, força um volante/zagueiro a ter stamina 10 e chama triggerPlayerCareerSubstitution!
  myTeamArr.forEach((pl, idx) => {
    if (idx > 0 && ['DM', 'CM', 'CB'].includes(pl.pos)) pl.stamina = 12;
    if (['ST', 'CF'].includes(pl.pos)) pl.stamina = 95;
  });
  window.triggerPlayerCareerSubstitution(lms);

  const controlledOnPitch = myTeamArr.find(pl => pl.isControlledAthlete || String(pl.careerPlayerId) === String(ath.id));
  assert.ok(controlledOnPitch, 'Atleta controlado deve estar em campo após substituição');
  assert.equal(controlledOnPitch.pos, 'ST', `Atacante (ATA) entrando do banco DEVE assumir código canônico ST (recebeu ${controlledOnPitch.pos})`);
  const expectedFrontX = userIsHome ? controlledOnPitch.baseX >= 45 : controlledOnPitch.baseX <= 55;
  assert.equal(expectedFrontX, true, `Atacante JAMAIS pode ficar preso no círculo central (baseX=${controlledOnPitch.baseX}, home=${userIsHome})`);
  assert.ok(controlledOnPitch.depthRuns >= 0.70 && controlledOnPitch.shotTendency >= 0.75, 'Atacante deve ter depthRuns e shotTendency de centroavante');
  assert.notEqual(myTeamArr[0].careerPlayerId, controlledOnPitch.careerPlayerId, 'Atleta de linha NUNCA pode ocupar o slot 0 (GK)');

  // Valida mapeamento dinâmico de slots por formação (sem inversão LB/RB ou LW/RW e ST exato em 4-3-3 e 4-2-3-1)
  assert.equal(window.getPreferredLineupSlots('LB', '4-3-3')[0], 1, 'LB em 4-3-3 deve mapear para slot 1 (esquerda)');
  assert.equal(window.getPreferredLineupSlots('RB', '4-3-3')[0], 4, 'RB em 4-3-3 deve mapear para slot 4 (direita)');
  assert.equal(window.getPreferredLineupSlots('CDM', '4-3-3')[0], 6, 'CDM/VOL em 4-3-3 deve mapear para slot 6 (DM central)');
  assert.equal(window.getPreferredLineupSlots('LW', '4-3-3')[0], 8, 'LW/PE em 4-3-3 deve mapear para slot 8 (ponta esquerda)');
  assert.equal(window.getPreferredLineupSlots('ST', '4-3-3')[0], 9, 'ST/ATA em 4-3-3 deve mapear para slot 9 (centroavante)');
  assert.equal(window.getPreferredLineupSlots('RW', '4-3-3')[0], 10, 'RW/PD em 4-3-3 deve mapear para slot 10 (ponta direita)');
  assert.equal(window.getPreferredLineupSlots('ST', '4-2-3-1')[0], 10, 'ST/ATA em 4-2-3-1 deve mapear para slot 10 (centroavante isolado)');

  // Simula alguns minutos para garantir que simulateMinute preserva a posição exata e lockedCanonicalBaseX
  lms.phase = 'SECOND_HALF';
  lms.paused = false;
  window.simulateMinute(lms, 62);
  assert.equal(controlledOnPitch.pos, 'ST');
  assert.equal(controlledOnPitch.lockedCanonicalBaseX, userIsHome ? 54.0 : 46.0, 'lockedCanonicalBaseX deve travar o centroavante na linha mais avançada');
  window.liveMatchState = null;
  console.log('   ✅ Teste 3 aprovado!');
}

console.log('🧪 [TESTE 4/6] Modo Jogador — FootGram Publipost Condicional (% pós-boa partida) + Crédito Bancário Real...');
{
  const st = window.getState();
  st.playerCareerState.socialMedia = null;
  window.AFM_SocialMedia.initSocialMediaState(st);
  assert.ok(!st.playerCareerState.socialMedia.activeBrandOffer, 'No Dia 1 (0 jogos) NÃO pode existir Campanha Patrocinada automática');

  // Partida ruim (nota 5.7, 0 gols): nenhuma marca deve procurar o atleta
  window.AFM_SocialMedia.processPostMatchSocialImpact(st, { rating: 5.7, goals: 0, assists: 0, result: 'L' });
  assert.ok(!st.playerCareerState.socialMedia.activeBrandOffer, 'Após partida ruim (nota 5.7) NÃO pode surgir oferta patrocinada');

  // Grande partida (nota 8.5, 2 gols, MVP) com sorteio favorável: marca procura o atleta!
  const origRnd = Math.random;
  Math.random = () => 0.15;
  try {
    window.AFM_SocialMedia.processPostMatchSocialImpact(st, { rating: 8.5, goals: 2, assists: 0, isMvp: true, result: 'W' });
  } finally {
    Math.random = origRnd;
  }
  const offer = st.playerCareerState.socialMedia.activeBrandOffer;
  assert.ok(offer && offer.payout > 0 && offer.chancePct >= 35, 'Após grande atuação + sorteio %, marca deve enviar proposta paga');

  // Publica o Publipost na aba FootGram e verifica crédito exato na conta pessoal (sem bug NaN!)
  const bankBefore = Number(st.playerCareerState.personalBank || 0);
  window.setGameView('player_social');
  window.render();
  const btnPubli = document.getElementById('btnPublishSponsoredPost');
  assert.ok(btnPubli, 'Botão #btnPublishSponsoredPost deve renderizar na aba FootGram');
  btnPubli.click();
  assert.equal(
    Math.round(Number(st.playerCareerState.personalBank)),
    Math.round(bankBefore + offer.payout),
    `Publipost DEVE creditar exatamente +R$ ${offer.payout} na conta pessoal`
  );
  assert.equal(Math.round(Number(st.playerCareerState.lifestyle.cash)), Math.round(Number(st.playerCareerState.personalBank)));
  console.log('   ✅ Teste 4 aprovado!');
}

console.log('🧪 [TESTE 5/6] Modo Jogador — Staff Pessoal Unificado (sem duplicidade no Treino + CONTRATADO + Demitir + Despesas Mensais)...');
{
  const st = window.getState();
  window.AFM_Lifestyle.addPlayerTransaction(st.playerCareerState, st.date, 'Saldo Teste Staff', 40000, 'in');

  // Verifica que ⚡ Meu Atleta & Treino NÃO tem botões duplicados .btn-hire-perf-staff
  window.setGameView('player_evolution');
  window.render();
  assert.equal(document.querySelectorAll('.btn-hire-perf-staff').length, 0, 'Sistema duplicado de 4 staffs em Meu Atleta & Treino deve estar removido');

  // Contrata Personal Trainer e Contador em 💎 Vida & Patrocínios
  assert.equal(window.AFM_Lifestyle.hireStaffMember(st, 'personal_trainer').success, true);
  assert.equal(window.AFM_Lifestyle.hireStaffMember(st, 'accountant').success, true);

  window.setGameView('player_lifestyle');
  window.render();
  assert.ok(appEl.innerHTML.includes('✅ CONTRATADO'), 'Card do profissional contratado deve exibir ✅ CONTRATADO');
  assert.ok(appEl.innerHTML.includes('❌ Demitir'), 'Card do profissional contratado deve exibir botão ❌ Demitir');
  assert.ok(appEl.innerHTML.includes('Staff (2): R$'), '🔴 DESPESAS PREVISTAS deve listar Staff (2) com valor mensal exato');

  // Demite 1 profissional pelo botão real .btn-dismiss-staff e valida redução para Staff (1)
  const dismissBtn = document.querySelector('.btn-dismiss-staff[data-staff-id="accountant"]');
  assert.ok(dismissBtn, 'Botão .btn-dismiss-staff deve existir para o Contador');
  dismissBtn.click();
  assert.equal(st.playerCareerState.lifestyle.hiredStaff.includes('accountant'), false, 'Botão Demitir deve remover o profissional do array hiredStaff');
  assert.ok(appEl.innerHTML.includes('Staff (1): R$'), '🔴 DESPESAS PREVISTAS deve atualizar imediatamente para Staff (1)');
  console.log('   ✅ Teste 5 aprovado!');
}

console.log('🧪 [TESTE 6/6] Modo Jogador — Propostas de Material Esportivo com Bônus Único (+1 a +3) nas Chuteiras...');
{
  const st = window.getState();
  const offers = window.AFM_PlayerEngine.getPlayerSponsorOffers(st);
  assert.equal(offers.length, 3, 'Devem existir 3 propostas iniciais de material esportivo');

  const attrsSeen = new Set();
  for (const sp of offers) {
    const info = window.AFM_PlayerEngine.getSponsorBootBonusInfo(sp);
    assert.ok(['vel', 'chu', 'pas', 'dri', 'fis', 'def'].includes(info.attr), `Atributo de bônus inválido: ${info.attr}`);
    assert.ok(info.val >= 1 && info.val <= 3, `Bônus da chuteira deve ser entre +1 e +3 (atual: ${info.val})`);
    attrsSeen.add(info.attr);
  }
  assert.equal(attrsSeen.size, 3, 'As 3 propostas da vitrine devem ter atributos de bônus ÚNICOS e distintos entre si');

  window.setGameView('player_lifestyle');
  window.render();
  assert.ok(appEl.innerHTML.includes('Bônus na Chuteira:'), 'Cards de propostas de material esportivo devem exibir o Bônus na Chuteira');

  // Assina a proposta 0 e verifica que getPlayerEffectiveAttributes soma exatamente +val no atributo único da proposta!
  const chosenSp = offers[0];
  const bInfo = window.AFM_PlayerEngine.getSponsorBootBonusInfo(chosenSp);
  const ath = st.squad.find(p => String(p.id) === String(st.controlledPlayerId));
  // Desequipa chuteira da loja temporariamente para isolar o bônus do patrocinador
  st.playerCareerState.lifestyle.equippedBoot = null;
  st.playerCareerState.sponsorContract = null;
  const effBefore = window.AFM_PlayerEngine.getPlayerEffectiveAttributes(st, ath);

  const signRes = window.AFM_PlayerEngine.signSponsorContract(st.playerCareerState, chosenSp, st.date);
  assert.equal(signRes.ok, true);
  const effAfter = window.AFM_PlayerEngine.getPlayerEffectiveAttributes(st, ath);
  assert.equal(
    effAfter[bInfo.attr],
    Math.min(99, effBefore[bInfo.attr] + bInfo.val),
    `Assinar patrocínio ${chosenSp.brand} deve somar +${bInfo.val} exatamente em ${bInfo.attr}`
  );

  // Valida contratos legados sem bootBonusAttr/Val (clamp [1, 3] e atributo específico da marca) + luvas em renovação
  const legacySuperstar = window.AFM_PlayerEngine.getSponsorBootBonusInfo({ brand: 'Nike', tier: 'superstar' });
  assert.equal(legacySuperstar.attr, 'vel', 'Nike legado deve mapear para Velocidade');
  assert.ok(legacySuperstar.val >= 1 && legacySuperstar.val <= 3, 'Contrato legado superstar nunca deve ultrapassar +3');

  const bankBeforeRenew = st.playerCareerState.personalBank;
  const renewRes = window.AFM_PlayerEngine.signSponsorContract(
    st.playerCareerState,
    { id: 'sp_renew_test', brand: 'Puma', name: 'Puma Pro', bootBonusAttr: 'dri', bootBonusVal: 3, monthlyStipend: 800, renewalBonus: 1200, durationDays: 180 },
    st.date
  );
  assert.equal(renewRes.ok, true);
  assert.equal(
    st.playerCareerState.personalBank,
    bankBeforeRenew - renewRes.terminationFee + 1200,
    'Assinar oferta com renewalBonus deve creditar luvas com paridade de saldo'
  );
  assert.equal(st.playerCareerState.lifestyle.cash, st.playerCareerState.personalBank, 'lifestyle.cash deve manter 100% de paridade');
  console.log('   ✅ Teste 6 aprovado!');
}

console.log('🧪 [TESTE 7/7] Modo Jogador — PlayStyles & Especialidades exigem OVR 50+ progressivo e higienizam saves legados...');
{
  const st = window.getState();
  const ath = st.squad.find(p => String(p.id) === String(st.controlledPlayerId));
  // Simula save legado onde atleta < 50 OVR estava com 3 PlayStyles equipados
  ath.attributes = { vel: 42, chu: 43, pas: 38, dri: 41, def: 32, fis: 40, pace: 42, shooting: 43, passing: 38, dribbling: 41, defending: 32, physical: 40 };
  ath.ovr = 41;
  ath.overall = 41;
  st.playerCareerState.athleteOvr = 41;
  st.playerCareerState.overall = 41;
  st.playerCareerState.equippedPlayStyles = ['chute_colocado', 'velocidade_pura', 'drible_espetacular'];

  // 1) AFM_SAVE_VERIFIER deve limpar automaticamente equippedPlayStyles quando OVR < 50
  const verLow = window.AFM_SAVE_VERIFIER.verifyAndHealState(st, { slot: st.userSlot || 1 });
  assert.equal(verLow.ok, true);
  assert.equal(st.playerCareerState.equippedPlayStyles.length, 0, 'AFM_SAVE_VERIFIER deve remover PlayStyles equipados se OVR < 50');

  window.setGameView('player_evolution');
  window.render();
  assert.ok(appEl.innerHTML.includes('0/3 Equipados'), 'Com 41 OVR deve exibir 0/3 Equipados');
  assert.equal(document.querySelectorAll('.btn-playstyle-toggle').length, 0, 'Com 41 OVR nenhum PlayStyle pode ter botão Equipar liberado');
  assert.ok(appEl.innerHTML.includes('Requer 50 OVR'), 'Deve mostrar requisito mínimo de 50 OVR');

  // 2) Evolui atleta para ~57 OVR (vel 60, chu 64, fis 58, dri 56, pas 50, def 40) -> libera Tier 1 e Chute Colocado, mantém Maestro/Pé de Canhão bloqueados
  ath.attributes = { vel: 60, chu: 64, pas: 50, dri: 56, def: 40, fis: 58, pace: 60, shooting: 64, passing: 50, dribbling: 56, defending: 40, physical: 58 };
  window.render();
  const unlockedBtns = document.querySelectorAll('.btn-playstyle-toggle');
  assert.equal(unlockedBtns.length, 3, 'Com ~58 OVR (vel 60, chu 64, fis 58) devem destravar exatamente Velocidade Pura, Fôlego de Aço e Chute Colocado');
  unlockedBtns[0].click();
  unlockedBtns[1].click();
  assert.equal(st.playerCareerState.equippedPlayStyles.length, 2, 'Deve permitir equipar PlayStyles legitimamente desbloqueados (OVR >= 50)');

  // 3) Evolui para 68 OVR e todos atributos 72 -> destrava todos os 8 e trava em no máximo 3/3 equipados
  ath.attributes = { vel: 72, chu: 72, pas: 72, dri: 72, def: 72, fis: 72, pace: 72, shooting: 72, passing: 72, dribbling: 72, defending: 72, physical: 72 };
  window.render();
  const allBtns = document.querySelectorAll('.btn-playstyle-toggle');
  assert.equal(allBtns.length, 8, 'Com 72 OVR e atributos 72 todos os 8 PlayStyles devem estar desbloqueados');
  // Equipa o 3º e tenta equipar o 4º
  for (const b of allBtns) {
    if (st.playerCareerState.equippedPlayStyles.length < 3 && !st.playerCareerState.equippedPlayStyles.includes(b.dataset.playstyle)) {
      b.click();
      break;
    }
  }
  assert.equal(st.playerCareerState.equippedPlayStyles.length, 3, 'Deve atingir 3/3 equipados');
  const fourthBtn = Array.from(document.querySelectorAll('.btn-playstyle-toggle')).find(
    b => !st.playerCareerState.equippedPlayStyles.includes(b.dataset.playstyle)
  );
  fourthBtn.click();
  assert.equal(st.playerCareerState.equippedPlayStyles.length, 3, 'Trava rigorosa deve impedir equipar um 4º PlayStyle');
  console.log('   ✅ Teste 7 aprovado!');
}

console.log('🧪 [TESTE 8/8] Modo Jogador — Imunidade do Atleta Controlado contra rotinas NPC (processFitness, processDevelopment, AFM_PlayerXPEvolution e SAF)...');
{
  const vm = require('vm');
  // Carrega também player_xp_evolution.js e manager_life_and_shares_pro.js para validar imunidade total
  for (const extraRel of ['js/systems/player_xp_evolution.js', 'js/systems/manager_life_and_shares_pro.js']) {
    const code = fs.readFileSync(path.join(__dirname, '..', extraRel), 'utf8');
    new vm.Script(code, { filename: extraRel }).runInThisContext();
  }

  const st = window.getState();
  const ath = st.squad.find(p => String(p.id) === String(st.controlledPlayerId));
  ath.attributes = { vel: 39, chu: 40, pas: 35, dri: 38, def: 30, fis: 37, pace: 39, shooting: 40, passing: 35, dribbling: 38, defending: 30, physical: 37 };
  ath.ovr = 38;
  ath.overall = 38;
  ath.fc = 38;
  ath.pes = 38;
  ath.potential = 90;
  ath.age = 16;
  ath.energy = 35;
  ath.fitness = 35;
  st.playerCareerState.athleteOvr = 38;
  st.playerCareerState.overall = 38;
  st.round = 4; // Múltiplo de 4 para acionar o ciclo de evolução de NPCs em processDevelopment()
  delete st.safMarket;
  delete st.managerPersonal;

  // 1) AFM_PlayerXPEvolution jamais pode alterar ovr/xp do atleta controlado
  window.AFM_PlayerXPEvolution.processMatchXP(st, { h: st.club, a: 'Rival FC', hg: 3, ag: 0, won: true, events: [{ type: 'gol', scorer: ath.name }] });
  window.AFM_PlayerXPEvolution.processMonthlyTrainingXP(st);
  assert.equal(ath.ovr, 38, 'AFM_PlayerXPEvolution JAMAIS pode inflar ovr do atleta controlado fora de attributes');

  // 2) processFitness e processDevelopment jamais podem forçar fitness >= 55 ou fc >= 40 no atleta controlado
  if (typeof window.processFitness === 'function') window.processFitness();
  if (typeof window.processDevelopment === 'function') window.processDevelopment();
  assert.equal(ath.fitness, 35, 'processFitness deve preservar fitness === energy (35%) do atleta controlado sem forçar piso 55%');
  assert.equal(ath.fc, 38, 'processDevelopment jamais pode aplicar piso 40 ou evoluir fc do atleta controlado');

  // 3) AFM_LifeAndSharesPro.processRoundTurn jamais pode injetar safMarket/managerPersonal em Modo Jogador
  window.AFM_LifeAndSharesPro.processRoundTurn(st);
  assert.equal(st.safMarket, undefined, 'processRoundTurn não pode injetar safMarket no Modo Jogador');
  assert.equal(st.managerPersonal, undefined, 'processRoundTurn não pode injetar managerPersonal no Modo Jogador');
  console.log('   ✅ Teste 8 aprovado!');
}

console.log('\n🎉 TODOS OS 8 BLOCOS DE NOVAS FUNCIONALIDADES E CORREÇÕES PASSARAM 100% SEM ERROS!');
process.exit(0);
