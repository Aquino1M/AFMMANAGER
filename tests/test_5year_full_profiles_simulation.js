/**
 * SUÍTE COMPLETA DE ESTRESSE E SIMULAÇÃO DE 5 ANOS (2026–2030):
 * - 3 Perfis no Modo Jogador (P1 Atacante Base, P2 Meia Série B, P3 Goleiro Veterano 31->36 + Aposentadoria)
 * - 3 Perfis no Modo Treinador (M1 Ceilândia Série D, M2 Botafogo SAF, M3 Flamengo Continental/Mundial)
 * - Testa: Banco/Empréstimos, Jogos (5 anos), Compra/Venda de Jogadores, Vida Pessoal (Jogador & Treinador),
 *   Bolsa SAF/P2P, Licenças CBF/UEFA e Modo Jogo Ao Vivo em TODAS as velocidades (1x, 2x, 5x, 10x, 20x, 40x).
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');

// Orquestrador paralelo: quando executado sem AFM_SINGLE_PROFILE, dispara os 6 perfis (30 temporadas) em paralelo (~25s total)
const onlyProfile = process.env.AFM_SINGLE_PROFILE || null;
if (!onlyProfile) {
  (async () => {
    console.log('================================================================================');
    console.log('🚀 INICIANDO SIMULAÇÃO DE 5 ANOS (2026–2030) EM 6 PERFIS PARALELOS (30 TEMPORADAS)');
    console.log('================================================================================\n');
    const profiles = ['P1', 'P2', 'P3', 'M1', 'M2', 'M3'];
    const t0 = Date.now();
    const results = await Promise.all(profiles.map((prof) => new Promise((resolve, reject) => {
      const child = spawn(process.execPath, ['--max-old-space-size=2048', __filename], {
        env: { ...process.env, AFM_SINGLE_PROFILE: prof },
        stdio: ['ignore', 'pipe', 'pipe']
      });
      let out = '';
      let err = '';
      child.stdout.on('data', (d) => {
        const txt = d.toString();
        out += txt;
        txt.split(/\r?\n/).filter(Boolean).forEach((line) => {
          if (!line.startsWith('__PROFILE_JSON__:')) console.log(`[${prof}] ${line}`);
        });
      });
      child.stderr.on('data', (d) => { err += d.toString(); });
      child.on('close', (code) => {
        if (code !== 0) {
          return reject(new Error(`Perfil ${prof} falhou (code ${code}):\n${err || out}`));
        }
        const jsonLine = out.split(/\r?\n/).find((l) => l.startsWith('__PROFILE_JSON__:'));
        const parsed = jsonLine ? JSON.parse(jsonLine.slice('__PROFILE_JSON__:'.length)) : null;
        resolve({ prof, parsed });
      });
    })));

    const consolidated = { playerProfiles: [], managerProfiles: [], totalElapsedSec: Number(((Date.now() - t0) / 1000).toFixed(1)) };
    for (const r of results) {
      if (r.parsed?.playerProfiles?.length) consolidated.playerProfiles.push(...r.parsed.playerProfiles);
      if (r.parsed?.managerProfiles?.length) consolidated.managerProfiles.push(...r.parsed.managerProfiles);
    }
    console.log('\n================================================================================');
    console.log(`📊 RESUMO CONSOLIDADO DOS 6 PERFIS (30 TEMPORADAS COMPLETAS EM ${consolidated.totalElapsedSec}s · ZERO ERROS)`);
    console.log('================================================================================');
    console.log(JSON.stringify(consolidated, null, 2));
    console.log('\n🎉 TODOS OS TESTES DE 5 ANOS (JOGADOR + TREINADOR + AO VIVO 1x..40x + BANCO + MERCADO + VIDA + LICENÇAS) PASSARAM 100%!');
    process.exit(0);
  })().catch((e) => {
    console.error('\n❌ FALHA NA EXECUÇÃO PARALELA DOS 6 PERFIS:', e);
    process.exit(1);
  });
  return;
}

// ============================================================================
// 1. AMBIENTE HEADLESS COM DOM PARSER LEVE + CANVAS 2D REALISTA + SUPABASE MOCK
// ============================================================================
const storageMap = new Map();
global.window = global;
global.localStorage = {
  getItem: (k) => (storageMap.has(k) ? storageMap.get(k) : null),
  setItem: (k, v) => storageMap.set(k, String(v)),
  removeItem: (k) => storageMap.delete(k),
  clear: () => storageMap.clear(),
  key: (i) => Array.from(storageMap.keys())[i] || null,
  get length() { return storageMap.size; }
};
global.sessionStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {}
};

function createCanvas2DContext() {
  const grad = { addColorStop() {} };
  return {
    canvas: { width: 1280, height: 720 },
    fillStyle: '#000',
    strokeStyle: '#fff',
    lineWidth: 1,
    globalAlpha: 1,
    font: '12px sans-serif',
    textAlign: 'left',
    textBaseline: 'alphabetic',
    shadowColor: 'transparent',
    shadowBlur: 0,
    clearRect() {},
    fillRect() {},
    strokeRect() {},
    beginPath() {},
    closePath() {},
    moveTo() {},
    lineTo() {},
    quadraticCurveTo() {},
    bezierCurveTo() {},
    arc() {},
    ellipse() {},
    rect() {},
    roundRect() {},
    fill() {},
    stroke() {},
    clip() {},
    save() {},
    restore() {},
    translate() {},
    scale() {},
    rotate() {},
    setTransform() {},
    setLineDash() {},
    fillText() {},
    strokeText() {},
    measureText: (t) => ({ width: String(t || '').length * 7 }),
    createLinearGradient: () => grad,
    createRadialGradient: () => grad,
    drawImage() {}
  };
}

let allLiveElements = [];
let fastDomMode = false;

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
      const camel = key.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      dataset[camel] = val;
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
    nodeType: 1,
    tagName: String(tag).toUpperCase(),
    id: '',
    value: '',
    checked: false,
    disabled: false,
    style: {},
    dataset: {},
    parentNode: parent,
    parentElement: parent,
    children: [],
    textContent: '',
    innerText: '',
    width: 1280,
    height: 720,
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
      toggle(c, force) {
        const shouldAdd = force !== undefined ? Boolean(force) : !classSet.has(c);
        if (shouldAdd) classSet.add(c); else classSet.delete(c);
        _className = [...classSet].join(' ');
        return shouldAdd;
      }
    },
    get innerHTML() { return _innerHTML; },
    set innerHTML(html) {
      // Remove filhos antigos do registro global
      const removeSubtree = (node) => {
        (node.children || []).forEach(removeSubtree);
        const idx = allLiveElements.indexOf(node);
        if (idx >= 0) allLiveElements.splice(idx, 1);
      };
      el.children.forEach(removeSubtree);
      el.children = [];
      _innerHTML = String(html ?? '');
      if (fastDomMode && el.id === 'app') {
        el.textContent = '';
        el.innerText = '';
        return;
      }
      el.textContent = _innerHTML.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      el.innerText = el.textContent;

      // Extrai TODAS as tags interativas em qualquer profundidade (scan linear rápido O(N))
      const tagRe = /<(button|input|select|canvas|div|span|a|tr)\b([^>]*)\/?>/gi;
      let match;
      while ((match = tagRe.exec(_innerHTML)) !== null) {
        const tName = match[1];
        const rawAttrs = match[2] || '';
        const { attrs, dataset } = parseAttributes(rawAttrs);
        if (!attrs.id && !attrs.class && Object.keys(dataset).length === 0 && !['button', 'input', 'select', 'canvas'].includes(tName.toLowerCase())) {
          continue;
        }
        const child = createDomElement(tName, el);
        if (attrs.id) child.id = attrs.id;
        if (attrs.class) child.className = attrs.class;
        if (attrs.value !== undefined) child.value = attrs.value;
        if (rawAttrs.includes('disabled')) child.disabled = true;
        if (rawAttrs.includes('checked')) child.checked = true;
        Object.assign(child.dataset, dataset);
        Object.assign(child._attrs, attrs);
        el.children.push(child);
      }
    },
    _attrs: attrsMap,
    setAttribute(k, v) {
      attrsMap[k] = String(v);
      if (k === 'id') el.id = String(v);
      if (k === 'class') el.className = String(v);
      if (k.startsWith('data-')) {
        const camel = k.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        el.dataset[camel] = String(v);
      }
    },
    getAttribute(k) {
      if (k === 'id') return el.id || null;
      if (k === 'class') return el.className || null;
      if (k.startsWith('data-')) {
        const camel = k.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        if (el.dataset[camel] !== undefined) return el.dataset[camel];
      }
      return attrsMap[k] ?? null;
    },
    appendChild(child) {
      if (!child) return child;
      child.parentNode = el;
      child.parentElement = el;
      if (!el.children.includes(child)) el.children.push(child);
      if (!allLiveElements.includes(child)) allLiveElements.push(child);
      return child;
    },
    insertBefore(child) {
      return el.appendChild(child);
    },
    removeChild(child) {
      const idx = el.children.indexOf(child);
      if (idx >= 0) el.children.splice(idx, 1);
      const gIdx = allLiveElements.indexOf(child);
      if (gIdx >= 0) allLiveElements.splice(gIdx, 1);
      return child;
    },
    remove() {
      const removeSubtree = (node) => {
        (node.children || []).forEach(removeSubtree);
        const gIdx = allLiveElements.indexOf(node);
        if (gIdx >= 0) allLiveElements.splice(gIdx, 1);
      };
      removeSubtree(el);
      if (el.parentNode && Array.isArray(el.parentNode.children)) {
        const pIdx = el.parentNode.children.indexOf(el);
        if (pIdx >= 0) el.parentNode.children.splice(pIdx, 1);
      }
    },
    addEventListener(evt, fn) {
      listeners[evt] = listeners[evt] || [];
      listeners[evt].push(fn);
    },
    removeEventListener(evt, fn) {
      if (!listeners[evt]) return;
      listeners[evt] = listeners[evt].filter(f => f !== fn);
    },
    click() {
      const ev = { target: el, currentTarget: el, preventDefault() {}, stopPropagation() {} };
      if (typeof el.onclick === 'function') el.onclick(ev);
      (listeners.click || []).forEach(fn => fn(ev));
    },
    focus() {},
    scrollIntoView() {},
    setSelectionRange() {},
    getContext: (type) => (type === '2d' ? ctx2d : null),
    closest(sel) {
      let cur = el;
      while (cur) {
        if (matchesSelector(cur, sel)) return cur;
        cur = cur.parentNode;
      }
      return null;
    },
    querySelector(sel) {
      return queryElements(sel, el)[0] || null;
    },
    querySelectorAll(sel) {
      return queryElements(sel, el);
    }
  };

  if (registerLive) allLiveElements.push(el);
  return el;
}

function matchesSingleSelector(el, sel) {
  if (!el || !sel) return false;
  const s = sel.trim();
  if (!s) return false;
  if (s.startsWith('#') && !s.includes(' ') && !s.includes('.') && !s.includes('[')) {
    return el.id === s.slice(1);
  }
  if (s.startsWith('.') && !s.includes(' ') && !s.includes('[')) {
    return el.classList.contains(s.slice(1));
  }
  // Suporte a .classe[data-attr="val"] ou [data-attr="val"] ou button
  const attrMatch = s.match(/^([a-zA-Z0-9_-]*|\.[\w-]+)?\[([a-zA-Z0-9_-]+)(?:="([^"]*)")?\]$/);
  if (attrMatch) {
    const [, prefix, attrName, attrVal] = attrMatch;
    if (prefix) {
      if (prefix.startsWith('.') && !el.classList.contains(prefix.slice(1))) return false;
      if (!prefix.startsWith('.') && el.tagName !== prefix.toUpperCase()) return false;
    }
    const actual = el.getAttribute(attrName);
    if (actual === null) return false;
    return attrVal === undefined ? true : String(actual) === String(attrVal);
  }
  return el.tagName === s.toUpperCase();
}

function matchesSelector(el, selectorGroup) {
  return String(selectorGroup || '')
    .split(',')
    .some(part => matchesSingleSelector(el, part.trim()));
}

function collectDescendants(root) {
  const out = [];
  const visit = (node) => {
    (node.children || []).forEach(ch => {
      out.push(ch);
      visit(ch);
    });
  };
  visit(root);
  return out;
}

function queryElements(selector, root = null) {
  const pool = root ? collectDescendants(root) : allLiveElements;
  return pool.filter(el => matchesSelector(el, selector));
}

const bodyEl = createDomElement('body');
const appEl = createDomElement('div', bodyEl);
appEl.id = 'app';
bodyEl.appendChild(appEl);

const docListeners = {};
global.document = {
  readyState: 'complete',
  hidden: false,
  body: bodyEl,
  documentElement: createDomElement('html'),
  createElement: (tag) => createDomElement(tag, null, false),
  getElementById: (id) => allLiveElements.find(e => e.id === id) || null,
  querySelector: (sel) => queryElements(sel)[0] || null,
  querySelectorAll: (sel) => queryElements(sel),
  addEventListener(evt, fn) {
    docListeners[evt] = docListeners[evt] || [];
    docListeners[evt].push(fn);
  },
  removeEventListener() {}
};

Object.defineProperty(global, 'navigator', {
  value: { userAgent: 'node-5yr-suite', onLine: true },
  configurable: true
});
global.location = { href: 'http://localhost/', reload: () => {} };
global.confirm = () => true;
global.alert = () => {};
global.scrollTo = () => {};
global.addEventListener = () => {};
global.removeEventListener = () => {};
global.MutationObserver = class { observe() {} disconnect() {} takeRecords() { return []; } };
global.esc = (s) => String(s ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));

// Fila controlada de requestAnimationFrame para testar loops ao vivo e anti-vazamento
let rafIdCounter = 0;
const rafCallbacks = new Map();
global.requestAnimationFrame = (cb) => {
  const id = ++rafIdCounter;
  rafCallbacks.set(id, cb);
  return id;
};
global.cancelAnimationFrame = (id) => {
  rafCallbacks.delete(id);
};

let simNowMs = 1_700_000_000_000;
global.performance = { now: () => simNowMs };

function stepAnimationFrames(framesCount = 1, frameDeltaMs = 16.67) {
  for (let i = 0; i < framesCount; i++) {
    simNowMs += frameDeltaMs;
    const pending = [...rafCallbacks.entries()];
    rafCallbacks.clear();
    for (const [, fn] of pending) {
      fn(simNowMs);
    }
  }
}

// Mock Supabase afm_saves em memória
const mockCloudSaves = new Map();
global.fetch = async (url) => {
  if (String(url).includes('/rest/v1/afm_saves')) return { ok: true, status: 200, json: async () => [] };
  return { ok: false, status: 404, json: async () => ({}) };
};
global.supabase = {
  createClient: () => ({
    from: () => {
      const filters = [];
      const qb = {
        select: () => qb,
        eq: (c, v) => { filters.push(r => String(r[c]) === String(v)); return qb; },
        ilike: (c, v) => { filters.push(r => String(r[c] || '').toLowerCase() === String(v || '').toLowerCase()); return qb; },
        maybeSingle: async () => {
          const rows = [...mockCloudSaves.values()].filter(r => filters.every(f => f(r)));
          return { data: rows[0] ? JSON.parse(JSON.stringify(rows[0])) : null, error: null };
        },
        order: async () => {
          const rows = [...mockCloudSaves.values()].filter(r => filters.every(f => f(r)));
          return { data: JSON.parse(JSON.stringify(rows)), error: null };
        },
        upsert: async (payload) => {
          mockCloudSaves.set(`${String(payload.username).toLowerCase()}::${Number(payload.slot)}`, JSON.parse(JSON.stringify(payload)));
          return { data: payload, error: null };
        },
        delete: () => qb,
        then: (res, rej) => Promise.resolve({ data: [], error: null }).then(res, rej)
      };
      return qb;
    }
  })
};

// ============================================================================
// 2. CARREGAMENTO COMPLETO DO STACK DE PRODUÇÃO (ORDEM DO INDEX.HTML)
// ============================================================================
const rootDir = path.join(__dirname, '..');
const loadScript = (rel) => {
  const full = path.join(rootDir, rel);
  if (fs.existsSync(full)) {
    eval(fs.readFileSync(full, 'utf8'));
  }
};

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
  'js/systems/player_xp_evolution.js',
  'js/systems/copinha_sub20_engine.js',
  'js/systems/market_favorites_wishlist.js'
].forEach(loadScript);

// Helper para jogar uma partida ao vivo testando TODAS as 6 velocidades (1x, 2x, 5x, 10x, 20x, 40x)
function playFullLiveMatchTestingAllSpeeds(options = {}) {
  const st = window.getState();
  const gate = window.canStartMatch(null, st);
  if (gate.status === 'future' && gate.matchDate) {
    const diff = Math.max(1, Math.round((new Date(`${gate.matchDate}T12:00:00`) - new Date(`${st.date}T12:00:00`)) / 86400000));
    window.advanceCalendarDays(diff, true);
  } else if (gate.status === 'other_competitions_pending') {
    window.openNextPendingCompetitionFixture(gate.nextFixture || window.getNextPendingClubFixture(st));
  }
  if (st.isPreSeason && st.preSeasonDays > 0) {
    st.isPreSeason = false;
    st.preSeasonDays = 0;
  }

  const countLiveLoops = () => [...rafCallbacks.values()].filter(fn => fn.name === 'loop').length;
  window.startLiveMatch();
  const s = window.liveMatchState;
  assert.ok(s, 'liveMatchState deve iniciar ao chamar startLiveMatch()');
  assert.equal(countLiveLoops(), 1, 'Deve existir exatamente 1 loop ao vivo ativo no início da partida');

  const speedsToTest = [1, 2, 5, 10, 20, 40];
  const minutesBySpeed = {};

  for (const spd of speedsToTest) {
    const btn = document.getElementById(`btnLiveSpeed${spd}`);
    assert.ok(btn, `Botão #btnLiveSpeed${spd} deve existir no modal ao vivo`);
    btn.click();
    assert.equal(s.speed, spd, `Velocidade ao vivo deve mudar para ${spd}x`);

    const secBefore = s.timeSec;
    stepAnimationFrames(6, 50); // 300ms simulados nesta velocidade
    const secDelta = s.timeSec - secBefore;
    minutesBySpeed[`${spd}x`] = secDelta;
    assert.ok(secDelta > 0, `Relógio da partida deve avançar na velocidade ${spd}x (delta=${secDelta}s)`);
  }

  // Valida que velocidades maiores avançam estritamente mais segundos no mesmo intervalo de tempo real
  assert.ok(minutesBySpeed['40x'] > minutesBySpeed['10x'], '40x deve ser mais rápido que 10x');
  assert.ok(minutesBySpeed['10x'] > minutesBySpeed['2x'], '10x deve ser mais rápido que 2x');
  assert.ok(minutesBySpeed['2x'] > minutesBySpeed['1x'], '2x deve ser mais rápido que 1x');

  // Testa alternância 2D/3D e câmeras garantindo ZERO vazamento de loops rAF!
  document.getElementById('btnToggle2D3D')?.click();
  stepAnimationFrames(2, 16.67);
  document.getElementById('btnCamBall')?.click();
  document.getElementById('btnToggle2D3D')?.click();
  assert.equal(countLiveLoops(), 1, 'Alternar 2D/3D e câmeras JAMAIS pode duplicar loops requestAnimationFrame');

  // Testa botão ⏩ 1 min e ⏪ 10s
  if (!s.done && s.phase === 'FIRST_HALF' && s.minute < 43) {
    const minBeforeFwd = s.minute;
    document.getElementById('btnLiveForward1')?.click();
    assert.equal(s.minute, minBeforeFwd + 1, 'Botão ⏩ 1 min deve simular exatamente +1 minuto real');
    document.getElementById('btnLiveRewind10')?.click();
    assert.ok(s.timeSec >= s.minute * 60, 'Botão ⏪ 10s não pode dessincronizar s.minute');
  }

  // Testa comandos específicos do modo ativo
  if (st.gameMode === 'player') {
    document.getElementById('btnCraqueCallBall')?.click();
    document.getElementById('btnCraqueSprint')?.click();
    document.getElementById('btnCraquePress')?.click();
    document.getElementById('btnCraqueShoot')?.click();
  } else {
    const shoutBtns = document.querySelectorAll('.live-shout-btn');
    if (shoutBtns[0]) shoutBtns[0].click();
  }

  // Avança em 40x até o intervalo (45') respondendo também a eventuais Momentos Decisivos do Craque
  document.getElementById('btnLiveSpeed40')?.click();
  let guard = 0;
  while (s.phase === 'FIRST_HALF' && !s.done && guard++ < 400) {
    stepAnimationFrames(1, 100);
    const craqueOpt = document.querySelector('.btn-craque-decision-opt');
    if (craqueOpt) craqueOpt.click();
  }
  assert.equal(s.phase, 'HALF_TIME', 'Partida em 40x deve parar corretamente no intervalo (HALF_TIME)');
  assert.equal(countLiveLoops(), 1, 'No intervalo deve continuar existindo apenas 1 loop rAF (zero duplicação)');

  // Se estiver no banco no Modo Jogador, agenda entrada no intervalo para validar retomada
  if (st.gameMode === 'player' && options.forceHalftimeSub) {
    s.shouldSubPlayerAtHalftime = true;
  }

  // Retoma 2º tempo clicando no botão real do modal de intervalo (#btnResumeSecondHalf ou #btnPlayerResumeMatch)!
  const resumeBtn = document.getElementById('btnResumeSecondHalf') || document.getElementById('btnPlayerResumeMatch');
  if (resumeBtn) {
    resumeBtn.click();
  } else {
    document.getElementById('btnLivePlayToggle')?.click();
  }
  assert.equal(s.phase, 'SECOND_HALF', 'Botão de retomada do intervalo deve iniciar o SECOND_HALF');

  // Testa abertura de Tática Rápida no meio do 2º tempo sem resetar o relógio para 45'!
  document.getElementById('btnLiveSpeed40')?.click();
  stepAnimationFrames(8, 80);
  const minMid2H = s.minute;
  document.getElementById('btnLiveTactics')?.click();
  (document.getElementById('btnResumeSecondHalf') || document.getElementById('btnPlayerResumeMatch') || document.getElementById('btnLivePlayToggle'))?.click();
  assert.ok(s.minute >= minMid2H, `Retomar da tática rápida no 2º tempo não pode voltar o relógio (${minMid2H} -> ${s.minute})`);

  // Conclui o 2º tempo em 40x até os 90'+acréscimos
  document.getElementById('btnLiveSpeed40')?.click();
  guard = 0;
  while (!s.done && guard++ < 600) {
    stepAnimationFrames(1, 100);
    const craqueOpt = document.querySelector('.btn-craque-decision-opt');
    if (craqueOpt) craqueOpt.click();
    const autoPenBtn = document.getElementById('btn-auto-pen');
    if (autoPenBtn) autoPenBtn.click();
  }
  assert.equal(s.done, true, 'Partida ao vivo deve encerrar aos 90+ acréscimos com s.done === true');

  const scoreStr = `${s.home} ${s.hg} x ${s.ag} ${s.away}`;
  window.finalizeMatchRound();
  rafCallbacks.clear();
  return { scoreStr, speedsTested: Object.keys(minutesBySpeed), minutesBySpeed };
}

function executeSingleSimulatedRound(cur) {
  const isPl = cur.gameMode === 'player' && Boolean(cur.playerCareerState);
  const ath = isPl ? (cur.squad || []).find(p => String(p.id) === String(cur.controlledPlayerId)) : null;
  const eligibleBefore = isPl
    ? (window.AFM_PlayerEngine?.isPlayerAvailableForMatch?.(cur) ?? Number(ath?.energy ?? 100) >= 50)
    : false;
  const prevTopHistory = (cur.history || [])[0] || null;
  window.simulateQuickRound();
  const latestMatch = (cur.history || [])[0] || null;
  if (isPl && latestMatch && latestMatch !== prevTopHistory && window.AFM_PlayerEngine?.processMatchPerformance) {
    const pState = cur.playerCareerState;
    const trust = Number(pState?.managerTrust ?? 45);
    const played = eligibleBefore && trust >= 30;
    const isStarter = played && trust >= 60;
    const athNameNorm = window.norm(ath?.name || pState?.athleteName || '');
    const isHome = window.norm(latestMatch.h) === window.norm(cur.club);
    const gf = isHome ? (Number(latestMatch.hg) || 0) : (Number(latestMatch.ag) || 0);
    const ga = isHome ? (Number(latestMatch.ag) || 0) : (Number(latestMatch.hg) || 0);
    const goalEvents = Array.isArray(latestMatch.events) ? latestMatch.events.filter(ev => ev?.type === 'gol') : [];
    const goals = played ? goalEvents.filter(ev => athNameNorm && window.norm(ev.scorer) === athNameNorm).length : 0;
    const assists = played ? goalEvents.filter(ev => athNameNorm && window.norm(ev.assist) === athNameNorm).length : 0;
    const rating = played
      ? Number(Math.max(4.5, Math.min(10.0, 6.2 + goals * 1.3 + assists * 0.8 + (gf > ga ? 0.5 : gf < ga ? -0.35 : 0.1) + Math.random() * 0.9)).toFixed(1))
      : 0;
    window.AFM_PlayerEngine.processMatchPerformance(cur, {
      h: latestMatch.h || cur.club,
      a: latestMatch.a || 'Adversário',
      hg: Number(latestMatch.hg) || 0,
      ag: Number(latestMatch.ag) || 0,
      goalsFor: gf,
      goalsAgainst: ga,
      date: latestMatch.date || cur.date,
      competitionId: latestMatch.competitionId || cur.compId,
      competitionName: latestMatch.competitionName || cur.competition,
      goals,
      assists,
      rating,
      played,
      eligibleForMatch: eligibleBefore,
      playedMinutes: isStarter ? 90 : played ? 30 : 0
    }, { showSummary: false });
  }
}

// Helper para simular 1 temporada inteira (todos os campeonatos + avanço mensal + virada de ano)
async function simulateCompleteSeason(onMidSeasonHook = null) {
  const st = window.getState();
  const startSeason = Number(st.season);
  let matchesPlayed = 0;
  let safetySteps = 0;
  let midHookRan = false;
  fastDomMode = true;
  // Evita enfileirar milhares de JSON.stringify(1.5MB) síncronos intermediários; salva completo no meio e no fim de cada ano
  window.__afmAutoSavePaused = true;
  try {

  while (Number(window.getState().season) === startSeason && safetySteps++ < 220) {
    rafCallbacks.clear();
    if (safetySteps % 15 === 0) {
      await new Promise(r => setImmediate(r));
    }
    const cur = window.getState();
    if (cur.isPreSeason && cur.preSeasonDays > 0) {
      cur.isPreSeason = false;
      cur.preSeasonDays = 0;
    }

    if (!midHookRan && Number(cur.round) >= 10 && typeof onMidSeasonHook === 'function') {
      midHookRan = true;
      window.__afmAutoSavePaused = false;
      onMidSeasonHook(cur);
      window.save();
      await new Promise(r => setImmediate(r));
      window.__afmAutoSavePaused = true;
    }

    // No Modo Jogador, garante energia >= 65% para o atleta atuar nas partidas da simulação de 5 anos
    if (cur.gameMode === 'player' && cur.controlledPlayerId != null) {
      const ath = (cur.squad || []).find(p => String(p.id) === String(cur.controlledPlayerId));
      if (ath && (Number(ath.energy ?? 100) < 65 || Number(ath.fitness ?? 100) < 65)) {
        ath.energy = 88;
        ath.fitness = 88;
        if (cur.playerCareerState) cur.playerCareerState.energy = 88;
      }
    }

    const pending = window.getPendingClubCompetitions(cur);
    if (pending.length === 0) {
      // Garante que todos os 12 meses financeiros (01..12) foram processados antes de virar o ano!
      window.processClubMonthlyFinances(cur, `${startSeason}-12-20`);
      cur.date = `${startSeason}-12-20`;
      cur.currentDate = cur.date;
      window.__afmAutoSavePaused = false;
      const advanced = window.advanceSeasonYear();
      assert.equal(advanced, true, `advanceSeasonYear deve avançar de ${startSeason} para ${startSeason + 1}`);
      await new Promise(r => setImmediate(r));
      break;
    }

    const gate = window.canStartMatch(null, cur);
    if (gate.status === 'season_finished') {
      window.processClubMonthlyFinances(cur, `${startSeason}-12-20`);
      cur.date = `${startSeason}-12-20`;
      cur.currentDate = cur.date;
      window.__afmAutoSavePaused = false;
      const advanced = window.advanceSeasonYear();
      assert.equal(advanced, true, `advanceSeasonYear deve concluir virada de ${startSeason}`);
      await new Promise(r => setImmediate(r));
      break;
    }

    if (gate.status === 'other_competitions_pending') {
      const nextF = gate.nextFixture || pending[0];
      window.openNextPendingCompetitionFixture(nextF);
      const beforeHist = (cur.history || []).length;
      const beforeRound = Number(cur.round) || 0;
      executeSingleSimulatedRound(cur);
      matchesPlayed++;
      // Segurança extra se algum fixture secundário exigir avanço de data antes da simulação rápida
      if ((cur.history || []).length === beforeHist && (Number(cur.round) || 0) === beforeRound && nextF) {
        if (nextF.date && nextF.date > cur.date) {
          const dDiff = Math.max(1, Math.round((new Date(`${nextF.date}T12:00:00`) - new Date(`${cur.date}T12:00:00`)) / 86400000));
          window.advanceCalendarDays(Math.min(30, dDiff), true);
        }
        executeSingleSimulatedRound(cur);
      }
      continue;
    }

    if (gate.status === 'future' && gate.matchDate && gate.matchDate > cur.date) {
      const dDiff = Math.max(1, Math.round((new Date(`${gate.matchDate}T12:00:00`) - new Date(`${cur.date}T12:00:00`)) / 86400000));
      window.advanceCalendarDays(dDiff, true);
    }

    executeSingleSimulatedRound(cur);
    matchesPlayed++;
  }

  } finally {
    window.__afmAutoSavePaused = false;
    fastDomMode = false;
    rafCallbacks.clear();
    window.save();
    window.render();
    await new Promise(r => setImmediate(r));
  }
  if (Number(window.getState().season) !== startSeason + 1) {
    const dbg = window.getState();
    console.error('DEBUG PENDÊNCIAS:', dbg.club, dbg.date, dbg.compId, dbg.round, window.getPendingClubCompetitions(dbg), window.canStartMatch(null, dbg));
  }
  assert.equal(
    Number(window.getState().season),
    startSeason + 1,
    `Temporada deveria ter avançado de ${startSeason} para ${startSeason + 1} (safetySteps=${safetySteps})`
  );
  console.log(`      ✓ Temporada ${startSeason} concluída (${matchesPlayed} jogos disputados)`);
  return { finishedSeason: startSeason, matchesPlayed };
}

function assertPlayerWalletParity(st, contextLabel) {
  const pcs = st.playerCareerState;
  const lsCash = Number(pcs?.lifestyle?.cash ?? pcs?.personalBank ?? 0);
  const pBank = Number(pcs?.personalBank ?? 0);
  const aliasBank = Number(st.player?.personalBank ?? pBank);
  assert.equal(Number.isFinite(pBank), true, `[${contextLabel}] personalBank não pode ser NaN`);
  assert.equal(Math.round(pBank), Math.round(lsCash), `[${contextLabel}] Paridade quebrada: personalBank (${pBank}) !== lifestyle.cash (${lsCash})`);
  assert.equal(Math.round(pBank), Math.round(aliasBank), `[${contextLabel}] Paridade quebrada: personalBank (${pBank}) !== player.personalBank (${aliasBank})`);
}

function assertManagerFinanceIsolation(st, contextLabel) {
  assert.equal(Number.isFinite(Number(st.balance)), true, `[${contextLabel}] Caixa do clube não pode ser NaN`);
  assert.equal(Number.isFinite(Number(st.career?.cash)), true, `[${contextLabel}] Caixa pessoal do técnico não pode ser NaN`);
  assert.equal(
    Math.round(Number(st.career.cash)),
    Math.round(Number(st.managerPersonal?.personalBalance ?? st.career.cash)),
    `[${contextLabel}] Paridade quebrada entre career.cash e managerPersonal.personalBalance`
  );
}

// ============================================================================
// 3. EXECUÇÃO DOS 6 PERFIS DE TESTE POR 5 ANOS (2026 -> 2030 = 30 TEMPORADAS)
// ============================================================================
async function runFull5YearSuite() {
  console.log('================================================================================');
  console.log('🚀 INICIANDO SIMULAÇÃO DE 5 ANOS (2026–2030) EM 6 PERFIS (3 JOGADOR + 3 TREINADOR)');
  console.log('================================================================================\n');

  const summaryReport = {
    playerProfiles: [],
    managerProfiles: []
  };

  // Inicializa contas de teste isoladas
  window.saveStoredAccounts([
    { username: 'teste_perfil_1', name: 'Perfil Teste 1', role: 'player', saves: [] },
    { username: 'teste_perfil_2', name: 'Perfil Teste 2', role: 'player', saves: [] },
    { username: 'teste_perfil_3', name: 'Perfil Teste 3', role: 'player', saves: [] }
  ]);

  // ==========================================================================
  // ⭐ PERFIL JOGADOR 1 (P1): LUCAS ROCHA — ATACANTE 15 ANOS (CEILÂNDIA) -> 5 ANOS
  // ==========================================================================
  if (!onlyProfile || onlyProfile === 'P1') {
  console.log('▶️ [P1 - MODO JOGADOR] Criando Lucas Rocha (ATA, 15 anos, Ceilândia) e simulando 5 anos...');
    window.setActiveAccount('teste_perfil_1');
    window.AFM_SETUP_GUARD.enterSetupCleanly();
    window.setupSelectedSlot = 1;

    window.AFM_CreatePlayerUI.setWizardState({
      step: 5,
      name: 'Lucas Rocha',
      nickname: 'Rocha',
      nationality: 'Brasil',
      shirtNumber: 9,
      stateUf: 'DF',
      city: 'Ceilândia',
      clubName: 'Ceilândia',
      origin: 'terrao',
      playstyle: 'frieza_letal',
      inspiration: 'ronaldo',
      height: 1.81,
      bodyBuild: 'Ectomorfo',
      preferredFoot: 'Direito',
      position: 'ATA',
      archetype: 'st_poacher',
      pointsAvailable: 0,
      pointsDistributed: { velocidade: 3, finalizacao: 2, passe: 0, drible: 0, defesa: 0, fisico: 0, reflexos: 0 },
      starterBoot: 'boot_crimson'
    });
    window.AFM_CreatePlayerUI.finalizePlayerCareerStart(appEl);

    const st = window.getState();
    const initialOvr = st.playerCareerState.overall;
    const initialAge = st.playerCareerState.age;
    assert.equal(st.gameMode, 'player');
    assert.equal(initialAge, 15);
    assertPlayerWalletParity(st, 'P1 Criação');

    // 1) Jogo Ao Vivo completo testando TODAS as velocidades (1x, 2x, 5x, 10x, 20x, 40x) + entrada no intervalo!
    const liveRes = playFullLiveMatchTestingAllSpeeds({ forceHalftimeSub: true });

    // 2) Minigames de treino prático (Pênalti, Falta, Drible 1x1 + trava de 3/dia)
    const mg1 = window.AFM_PlayerEngine.executePracticalTraining({ type: 'penalty', isGoal: true, playerState: st.playerCareerState, currentGameDate: st.date });
    const mg2 = window.AFM_PlayerEngine.executePracticalTraining({ type: 'freekick', isGoal: true, playerState: st.playerCareerState, currentGameDate: st.date });
    const mg3 = window.AFM_PlayerEngine.executePracticalTraining({ type: 'dribble', isGoal: true, playerState: st.playerCareerState, currentGameDate: st.date });
    const mg4Blocked = window.AFM_PlayerEngine.executePracticalTraining({ type: 'penalty', isGoal: true, playerState: st.playerCareerState, currentGameDate: st.date });
    assert.equal(Boolean(mg1.success && mg2.success && mg3.success), true, '3 cargas diárias de minigame devem funcionar');
    assert.equal(Boolean(mg4Blocked.success), false, '4ª tentativa de minigame no mesmo dia deve ser bloqueada');

    // 3) Patrocínio + Troca Antecipada com Multa de 50% + Chuteira + Reforma + Staff + Bens à Vista/Financiado + CDB + Negócios + FootGram!
    window.AFM_Lifestyle.addPlayerTransaction(st.playerCareerState, st.date, 'Prêmio Luvas Teste', 250000, 'in');
    st.player.personalBank = st.playerCareerState.personalBank;
    st.player.cash = st.playerCareerState.personalBank;
    assertPlayerWalletParity(st, 'P1 Aporte Inicial');

    const spOffers = window.AFM_PlayerEngine.getPlayerSponsorOffers(st);
    assert.ok(spOffers.length > 0, 'Deve haver ofertas de patrocínio para o atleta');
    const sign1 = window.AFM_PlayerEngine.signSponsorContract(st.playerCareerState, spOffers[0], st.date);
    assert.equal(sign1.ok, true, 'Assinatura do 1º patrocinador deve funcionar');
    if (spOffers[1]) {
      const sign2 = window.AFM_PlayerEngine.signSponsorContract(st.playerCareerState, spOffers[1], st.date);
      assert.equal(sign2.ok, true, 'Troca antecipada de patrocinador deve cobrar multa de 50% sem erro');
      assert.ok(sign2.terminationFee > 0, 'Multa de rescisão antecipada deve ser > 0');
    }
    assertPlayerWalletParity(st, 'P1 Troca Patrocínio');

    // Compra chuteira, desgasta até 0 e reforma a 35%
    const bootCatalog = window.AFM_Lifestyle.AFM_BOOTS_CATALOG;
    const targetBoot = bootCatalog.find(b => b.price > 0 && b.price <= 15000) || bootCatalog[1];
    const bootBuy = window.AFM_Lifestyle.buyBoot(st, targetBoot.id);
    assert.equal(bootBuy.success, true, 'Compra de chuteira deve funcionar');
    window.AFM_Lifestyle.equipBoot(st, targetBoot.id);
    const ownedBoot = st.playerCareerState.lifestyle.ownedBoots[targetBoot.id];
    assert.ok(ownedBoot, 'Chuteira comprada deve estar em ownedBoots');
    ownedBoot.durability = 0;
    const repairRes = window.AFM_Lifestyle.repairBoot(st, targetBoot.id);
    assert.equal(repairRes.success, true, 'Reforma de chuteira zerada (35%) deve funcionar');
    assert.ok(ownedBoot.durability > 0, 'Durabilidade deve ser restaurada após reforma');
    assertPlayerWalletParity(st, 'P1 Chuteira & Reforma');

    // Contrata Contador + Personal Trainer + Fisioterapeuta
    assert.equal(window.AFM_Lifestyle.hireStaffMember(st, 'accountant').success, true, 'Contratação de Contador deve funcionar');
    assert.equal(window.AFM_Lifestyle.hireStaffMember(st, 'personal_trainer').success, true, 'Contratação de Personal Trainer deve funcionar');
    assert.equal(window.AFM_Lifestyle.hireStaffMember(st, 'physio').success, true, 'Contratação de Fisioterapeuta deve funcionar');

    // Compra 1 bem à vista e 1 bem financiado em 12x (30% entrada + 10% juros)
    const assetsCat = window.AFM_Lifestyle.AFM_ASSETS_CATALOG;
    const cheapAsset = assetsCat.find(a => a.price <= 25000) || assetsCat[0];
    const midAsset = assetsCat.find(a => a.id !== cheapAsset.id && a.financeable && a.price <= 90000) || assetsCat.find(a => a.financeable);
    assert.equal(window.AFM_Lifestyle.buyAssetCash(st, cheapAsset.id).success, true, 'Compra de bem à vista deve funcionar');
    const finRes = window.AFM_Lifestyle.financeAsset(st, midAsset.id);
    assert.equal(finRes.success, true, 'Financiamento bancário em 12x do bem deve funcionar');
    assert.equal(st.playerCareerState.lifestyle.financedAssets.length, 1, 'Deve registrar contrato de financiamento em 12x');

    // Aplica R$ 20.000 no CDB e resgata R$ 5.000
    assert.equal(window.AFM_Lifestyle.depositCdb(st, 20000).success, true, 'Aplicação no CDB deve funcionar');
    assert.equal(window.AFM_Lifestyle.withdrawCdb(st, 5000).success, true, 'Resgate parcial do CDB deve funcionar');
    assert.equal(st.playerCareerState.lifestyle.investments.cdbBalance, 15000, 'Saldo CDB deve refletir R$ 15.000');

    // Compra Kitnet + Escolinha + Marca Própria
    window.AFM_Lifestyle.addPlayerTransaction(st.playerCareerState, st.date, 'Bônus Imagem Extra', 300000, 'in');
    st.player.personalBank = st.playerCareerState.personalBank;
    st.player.cash = st.playerCareerState.personalBank;
    assert.equal(window.AFM_Lifestyle.buyRentalUnit(st).success, true, 'Compra de Kitnet deve funcionar');
    assert.equal(window.AFM_Lifestyle.buyAcademy(st).success, true, 'Compra de Escolinha deve funcionar');
    assert.equal(window.AFM_Lifestyle.buyBrand(st).success, true, 'Abertura de Marca Própria deve funcionar');
    assertPlayerWalletParity(st, 'P1 Negócios & CDB');

    // FootGram: Verificação automática aos 50.000 seguidores
    if (window.AFM_SocialMedia) {
      window.AFM_SocialMedia.initSocialMediaState(st);
      st.playerCareerState.socialMedia.followers = 52000;
      window.AFM_SocialMedia.initSocialMediaState(st);
      assert.equal(st.playerCareerState.socialMedia.verified, true, 'Selo azul verificado deve ativar automaticamente aos 50k+ seguidores');
    }

    // Simula os 5 ANOS COMPLETOS (2026, 2027, 2028, 2029, 2030)
    let totalMatches5Yrs = 1; // já jogou 1 ao vivo
    for (let yr = 0; yr < 5; yr++) {
      const res = await simulateCompleteSeason((midSt) => {
        // No meio de cada temporada, gasta pontos de atributo se houver e busca mercado no ano 2
        const pcs = midSt.playerCareerState;
        if ((pcs.skillPoints || 0) >= 1) {
          pcs.skillPoints -= 1;
          const ath = midSt.squad.find(p => String(p.id) === String(midSt.controlledPlayerId));
          if (ath?.attributes) {
            ath.attributes.chu = Math.min(99, (Number(ath.attributes.chu) || 45) + 1);
            window.AFM_PlayerEngine.syncBidirectionalAttributes(ath.attributes, 35);
            ath.ovr = window.AFM_PlayerEngine.calculatePlayerOverall(
              window.AFM_PlayerEngine.getPlayerEffectiveAttributes(midSt, ath),
              ath.pos
            );
            ath.overall = ath.ovr;
            pcs.overall = ath.ovr;
            pcs.athleteOvr = ath.ovr;
          }
        }
        if (yr === 1 && window.AFM_PlayerEngine.searchPlayerTransferMarket) {
          window.AFM_PlayerEngine.searchPlayerTransferMarket(midSt);
          const firstOffer = (pcs.agentOffers || []).find(o => o.wage && o.type !== 'coach_career');
          if (firstOffer && window.AFM_PlayerEngine.makeCounterOffer) {
            window.AFM_PlayerEngine.makeCounterOffer(midSt, firstOffer.id);
          }
        }
      });
      totalMatches5Yrs += res.matchesPlayed;

      // Valida regra de Dia 1 da nova temporada: 0 jogos na temporada atual e financiamento quitado após 12 meses!
      const afterRollover = window.getState();
      assert.equal(afterRollover.gameMode, 'player', `Ano ${afterRollover.season} deve continuar estritamente em Modo Jogador`);
      assert.equal(afterRollover.playerCareerState.seasonStats.games, 0, 'seasonStats.games deve zerar na virada de temporada');
      assert.equal(afterRollover.playerCareerState.seasonStats.avgRating, 0, 'Nota média da nova temporada com 0 jogos deve ser 0 (exibindo —)');
      assertPlayerWalletParity(afterRollover, `P1 Fim Ano ${res.finishedSeason}`);
    }

    const finalSt = window.getState();
    assert.equal(finalSt.season, 2031, 'P1 deve chegar em 01/01/2031 após 5 temporadas completas');
    assert.equal(finalSt.playerCareerState.age, 20, `P1 iniciado aos 15 anos DEVE ter exatamente 20 anos após 5 temporadas (atual: ${finalSt.playerCareerState.age})`);
    assert.equal(finalSt.playerCareerState.lifestyle.financedAssets.length, 0, 'Financiamento bancário de 12x deve estar 100% quitado após 5 anos');
    assert.equal(finalSt.playerCareerState.careerHistory.seasons.length, 5, 'careerHistory.seasons deve conter exatamente as 5 temporadas disputadas');
    assert.ok(finalSt.playerCareerState.lifestyle.investments.cdbBalance > 15000, 'CDB deve ter rendido juros compostos ao longo dos 5 anos');

    summaryReport.playerProfiles.push({
      profile: 'P1 — Lucas Rocha (ATA · Base ➔ Profissional)',
      clubStart: 'Ceilândia',
      clubEnd: finalSt.club,
      ageSpan: `${initialAge} ➔ ${finalSt.playerCareerState.age} anos`,
      ovrSpan: `${initialOvr} ➔ ${finalSt.playerCareerState.overall} OVR`,
      matches5Yrs: finalSt.playerCareerState.careerHistory.totals.games,
      goals5Yrs: finalSt.playerCareerState.careerHistory.totals.goals,
      assists5Yrs: finalSt.playerCareerState.careerHistory.totals.assists,
      personalBank: Math.round(finalSt.playerCareerState.personalBank),
      cdbBalance: Math.round(finalSt.playerCareerState.lifestyle.investments.cdbBalance),
      awardsCount: (finalSt.playerCareerState.individualAwards || []).length,
      liveSpeedsVerified: liveRes.speedsTested.join(', ')
    });
    console.log(`   ✅ P1 concluído! Idade: 15➔${finalSt.playerCareerState.age}, Jogos: ${finalSt.playerCareerState.careerHistory.totals.games}, Gols: ${finalSt.playerCareerState.careerHistory.totals.goals}, Banco: R$ ${Math.round(finalSt.playerCareerState.personalBank).toLocaleString('pt-BR')}, CDB: R$ ${Math.round(finalSt.playerCareerState.lifestyle.investments.cdbBalance).toLocaleString('pt-BR')}`);
  }

  // ==========================================================================
  // ⭐ PERFIL JOGADOR 2 (P2): GABRIEL MENDES — MEIA 19 ANOS (CEARÁ SÉRIE B) -> 5 ANOS
  // ==========================================================================
  if (!onlyProfile || onlyProfile === 'P2') {
  console.log('▶️ [P2 - MODO JOGADOR] Criando Gabriel Mendes (MEI, 19 anos, Ceará) e simulando 5 anos...');
    window.setActiveAccount('teste_perfil_2');
    window.AFM_SETUP_GUARD.enterSetupCleanly();
    window.setupSelectedSlot = 1;

    window.AFM_CreatePlayerUI.setWizardState({
      step: 5,
      name: 'Gabriel Mendes',
      nickname: 'Mendes',
      nationality: 'Brasil',
      shirtNumber: 10,
      stateUf: 'CE',
      city: 'Fortaleza',
      clubName: 'Ceará',
      origin: 'futsal',
      playstyle: 'visao_raio_x',
      inspiration: 'ronaldinho',
      height: 1.76,
      bodyBuild: 'Equilibrado',
      preferredFoot: 'Esquerdo',
      position: 'MEI',
      archetype: 'cam_playmaker',
      pointsAvailable: 0,
      pointsDistributed: { velocidade: 1, finalizacao: 1, passe: 2, drible: 1, defesa: 0, fisico: 0, reflexos: 0 },
      starterBoot: 'boot_classic'
    });
    window.AFM_CreatePlayerUI.finalizePlayerCareerStart(appEl);

    const st = window.getState();
    // Configura idade inicial 19 anos para testar faixa sub-23 -> auge (19 -> 24)
    st.playerCareerState.age = 19;
    st.playerCareerState.birthYear = 2007;
    st.playerCareerState.lastAgingYear = 2026;
    const ath = st.squad.find(p => String(p.id) === String(st.controlledPlayerId));
    if (ath) ath.age = 19;

    // Testa Seleção Nacional (Carlo Ancelotti no Brasil)
    const natCtx = window.AFM_NATIONAL_TEAM.ensureNationalData(st);
    assert.equal(natCtx.nation.coach, 'Carlo Ancelotti', 'Seleção Brasileira deve ter Carlo Ancelotti como treinador');

    // Testa atraso salarial + Ação Trabalhista (filePlayerSalaryClaim)
    window.AFM_Lifestyle.addPlayerTransaction(st.playerCareerState, st.date, 'Reserva Jurídica', 5000, 'in');
    st.player.personalBank = st.playerCareerState.personalBank;
    st.player.cash = st.playerCareerState.personalBank;
    st.playerCareerState.clubSalaryArrears = { amount: 12000, months: 2, claim: null };
    const claimRes = window.AFM_PlayerEngine.filePlayerSalaryClaim(st);
    assert.equal(claimRes.ok, true, 'Cobrança jurídica de salários atrasados deve iniciar com sucesso');
    assertPlayerWalletParity(st, 'P2 Ação Trabalhista');

    for (let yr = 0; yr < 5; yr++) {
      await simulateCompleteSeason();
      assertPlayerWalletParity(window.getState(), `P2 Ano ${2026 + yr}`);
    }

    const finalSt = window.getState();
    assert.equal(finalSt.playerCareerState.age, 24, `P2 iniciado aos 19 anos DEVE ter exatamente 24 anos após 5 temporadas (atual: ${finalSt.playerCareerState.age})`);
    assert.equal(finalSt.playerCareerState.clubSalaryArrears.amount, 0, 'Ação trabalhista deve ter sido julgada e paga em 3 meses');

    summaryReport.playerProfiles.push({
      profile: 'P2 — Gabriel Mendes (MEI · Camisa 10 Série B)',
      clubStart: 'Ceará',
      clubEnd: finalSt.club,
      ageSpan: `19 ➔ ${finalSt.playerCareerState.age} anos`,
      ovrSpan: `40 ➔ ${finalSt.playerCareerState.overall} OVR`,
      matches5Yrs: finalSt.playerCareerState.careerHistory.totals.games,
      goals5Yrs: finalSt.playerCareerState.careerHistory.totals.goals,
      assists5Yrs: finalSt.playerCareerState.careerHistory.totals.assists,
      personalBank: Math.round(finalSt.playerCareerState.personalBank),
      cdbBalance: Math.round(finalSt.playerCareerState.lifestyle.investments.cdbBalance),
      awardsCount: (finalSt.playerCareerState.individualAwards || []).length,
      liveSpeedsVerified: 'Simulação + Ação Jurídica + Seleção'
    });
    console.log(`   ✅ P2 concluído! Idade: 19➔${finalSt.playerCareerState.age}, Jogos: ${finalSt.playerCareerState.careerHistory.totals.games}, Assist.: ${finalSt.playerCareerState.careerHistory.totals.assists}, Banco: R$ ${Math.round(finalSt.playerCareerState.personalBank).toLocaleString('pt-BR')}`);
  }

  // ==========================================================================
  // ⭐ PERFIL JOGADOR 3 (P3): RAFAEL MURALHA — GOLEIRO VETERANO 31->36 ANOS + APOSENTADORIA
  // ==========================================================================
  if (!onlyProfile || onlyProfile === 'P3') {
  console.log('▶️ [P3 - MODO JOGADOR ➔ TREINADOR] Criando Rafael Muralha (GOL, 31 anos, Flamengo) até aposentar aos 36...');
    window.setActiveAccount('teste_perfil_3');
    window.AFM_SETUP_GUARD.enterSetupCleanly();
    window.setupSelectedSlot = 1;

    window.AFM_CreatePlayerUI.setWizardState({
      step: 5,
      name: 'Rafael Muralha',
      nickname: 'Muralha',
      nationality: 'Brasil',
      shirtNumber: 1,
      stateUf: 'RJ',
      city: 'Rio de Janeiro',
      clubName: 'Flamengo',
      origin: 'base_elite',
      playstyle: 'paredao',
      inspiration: 'alisson',
      height: 1.93,
      bodyBuild: 'Forte',
      preferredFoot: 'Direito',
      position: 'GOL',
      archetype: 'gk_shot_stopper',
      pointsAvailable: 0,
      pointsDistributed: { velocidade: 0, finalizacao: 0, passe: 0, drible: 0, defesa: 2, fisico: 1, reflexos: 2 },
      starterBoot: 'boot_classic'
    });
    window.AFM_CreatePlayerUI.finalizePlayerCareerStart(appEl);

    const st = window.getState();
    // Eleva para goleiro veterano 31 anos (82 OVR) para validar declínio natural 31->36 e carta dos 35 anos!
    st.playerCareerState.age = 31;
    st.playerCareerState.birthYear = 1995;
    st.playerCareerState.lastAgingYear = 2026;
    st.playerCareerState.weeklyTrainingFocus = 'gk_reflexes';
    const gkAth = st.squad.find(p => String(p.id) === String(st.controlledPlayerId));
    assert.ok(gkAth, 'Goleiro controlado deve existir no elenco');
    assert.ok(['GOL', 'GK'].includes(gkAth.pos), 'Goleiro nunca pode perder posição GOL/GK');
    gkAth.age = 31;
    Object.assign(gkAth.attributes, { vel: 68, chu: 45, pas: 74, dri: 70, def: 84, fis: 82 });
    window.AFM_PlayerEngine.syncBidirectionalAttributes(gkAth.attributes, 65);
    const startGkOvr = window.AFM_PlayerEngine.calculatePlayerOverall(gkAth.attributes, 'GOL');
    gkAth.ovr = startGkOvr;
    gkAth.overall = startGkOvr;
    st.playerCareerState.overall = startGkOvr;
    st.playerCareerState.athleteOvr = startGkOvr;

    for (let yr = 0; yr < 5; yr++) {
      await simulateCompleteSeason();
      const cur = window.getState();
      if (cur.playerCareerState.age === 35) {
        assert.equal(cur.playerCareerState.hasReceived35RetirementLetter, true, 'Carta oficial de aposentadoria DEVE disparar automaticamente aos 35 anos');
        const letter = (cur.playerCareerState.agentOffers || []).find(o => o.type === 'coach_career');
        assert.ok(letter, 'Proposta de transição para Treinador deve estar na mesa do empresário aos 35 anos');
      }
    }

    const at36 = window.getState();
    assert.equal(at36.playerCareerState.age, 36, `P3 iniciado aos 31 anos DEVE ter 36 anos após 5 temporadas (atual: ${at36.playerCareerState.age})`);
    assert.ok(at36.playerCareerState.overall < startGkOvr, `Declínio natural pós-32 anos deve ter reduzido OVR (${startGkOvr} ➔ ${at36.playerCareerState.overall})`);

    const gamesAsPlayer = at36.playerCareerState.careerHistory.totals.games;
    const bankAsPlayer = Math.round(at36.playerCareerState.personalBank);
    const ovrAtRetire = at36.playerCareerState.overall;

    // Executa transição oficial Jogador ➔ Treinador aos 36 anos!
    const retOffer = window.AFM_PlayerEngine.generateCoachOfferForRetirement(at36);
    const retRes = window.AFM_PlayerEngine.startManagerCareerFromPlayerRetirement(at36, retOffer);
    assert.equal(retRes.ok, true, 'Transição Jogador ➔ Treinador aos 36 anos deve concluir com sucesso');
    assert.equal(at36.gameMode, 'manager', 'Modo do save deve migrar para manager após aposentar');
    assert.equal(at36.season, 2031, 'Universo do jogo (ano 2031) deve ser preservado sem resetar');
    assert.equal(at36.managerCareerBonuses.salaryPct, 10, 'Ex-atleta deve receber +10% permanente em salário de técnico');
    assert.equal(at36.managerCareerBonuses.playerSigningChancePct, 5, 'Ex-atleta deve receber +5% permanente em negociações de atletas');

    summaryReport.playerProfiles.push({
      profile: 'P3 — Rafael Muralha (GOL · Veterano 31➔36 + Virou Técnico)',
      clubStart: 'Flamengo',
      clubEnd: `${at36.club} (Agora Treinador)`,
      ageSpan: `31 ➔ 36 anos (Aposentou)`,
      ovrSpan: `${startGkOvr} ➔ ${ovrAtRetire} OVR`,
      matches5Yrs: gamesAsPlayer,
      goals5Yrs: 0,
      assists5Yrs: 0,
      personalBank: bankAsPlayer,
      cdbBalance: 0,
      awardsCount: (at36.retiredPlayerCareer?.individualAwards || []).length,
      liveSpeedsVerified: 'Carta 35a + Transição Técnico OK'
    });
    console.log(`   ✅ P3 concluído! Aposentou aos 36 anos (${startGkOvr}➔${ovrAtRetire} OVR) com Carta aos 35 e assumiu como Treinador em 2031!`);
  }

  // ==========================================================================
  // 👔 PERFIL TREINADOR 1 (M1): TÉC. CARLOS SILVA — CEILÂNDIA (SÉRIE D) -> 5 ANOS
  // ==========================================================================
  if (!onlyProfile || onlyProfile === 'M1') {
  console.log('▶️ [M1 - MODO TREINADOR] Criando Téc. Carlos Silva (Ceilândia · Série D) e simulando 5 anos...');
    window.setActiveAccount('teste_perfil_1');
    window.AFM_SETUP_GUARD.enterSetupCleanly();
    window.newCareer({ clubName: 'Ceilândia', manager: 'Carlos Silva', slot: 2, gameMode: 'manager' });

    const st = window.getState();
    assert.equal(st.gameMode, 'manager');
    assert.equal((st.titles || []).length, 0, 'Dia 1 no Modo Treinador NÃO pode ter títulos fantasmas');

    // Garante que uma nova carreira começa na Licença CBF D (sem vazar licença de outro perfil!)
    const initLic = window.getCoachLicensesData(st);
    assert.equal(initLic.currentLicense.id, 'cbf_d', 'Nova carreira DEVE iniciar na Licença CBF D');

    // 1) Jogo Ao Vivo em TODAS as velocidades (1x, 2x, 5x, 10x, 20x, 40x) no Modo Treinador!
    const liveResM1 = playFullLiveMatchTestingAllSpeeds();

    // 2) Banco do Clube: Empréstimo via modal real + pagamento de parcela + antecipação + quitação!
    const balBeforeLoan = st.balance;
    window.openBankLoansModal('borrow');
    const btnTakeLoan = document.getElementById('btnConfirmTakeLoan');
    assert.ok(btnTakeLoan, 'Botão #btnConfirmTakeLoan deve existir no modal do banco');
    btnTakeLoan.click();
    assert.ok(st.bankLoans.length === 1 && st.balance > balBeforeLoan, 'Empréstimo bancário deve creditar caixa do clube');

    // Testa pagamento de 1 parcela manual e depois quitação com 10% de desconto
    window.openBankLoansModal('installments');
    const payInstBtn = document.querySelector('.btnPayInstallment');
    if (payInstBtn) payInstBtn.click();
    assert.equal(st.bankLoans[0].paidInstallments, 1, 'Parcela manual deve incrementar paidInstallments');

    // Testa também AFM_ClubFinance.takeLoan + anticipateLoanInstallments
    const extraLoan = window.AFM_ClubFinance.takeLoan(st, 500000, 6);
    assert.equal(extraLoan.ok, true, 'AFM_ClubFinance.takeLoan deve funcionar em array canônico');
    const antRes = window.AFM_ClubFinance.anticipateLoanInstallments(st, extraLoan.loanId, 2);
    assert.equal(antRes.ok, true, 'Antecipação de parcelas com desconto deve funcionar');

    // Quita todos os empréstimos ativos
    st.balance += 5000000; // aporte de teste para quitar e comprar reforço
    while (st.bankLoans.length > 0) {
      window.openBankLoansModal('installments');
      const payoffBtn = document.querySelector('.btnPayoffLoan');
      assert.ok(payoffBtn, 'Botão .btnPayoffLoan deve existir');
      payoffBtn.click();
    }
    assert.equal(st.bankLoans.length, 0, 'Todos os empréstimos bancários devem ser quitados');

    // 3) Comprar Jogador no Mercado (modal real de negociação, ampliando CT para abrir vaga no plantel) + Vender Jogador!
    st.infrastructure = st.infrastructure || {};
    st.infrastructure.training = { level: 3 };
    const marketPool = window.marketUniverse().filter(p => window.norm(p.club) !== window.norm(st.club) && window.playerOverall(p) <= 64);
    const targetBuy = marketPool[0];
    assert.ok(targetBuy, 'Deve haver jogador disponível no mercado');
    const tKey = window.playerKey(targetBuy);
    const squadCountBeforeBuy = st.squad.length;

    // Força Math.random favorável durante o clique de confirmação para testar o fluxo determinístico de aceite
    const origRandom = Math.random;
    Math.random = () => 0.10;
    try {
      window.buyPlayer(tKey);
      // Ajusta oferta e luvas para garantir interesse >= 65% e superar rivais
      document.querySelectorAll('.btnBidStep').forEach(b => { if (Number(b.dataset.step) > 0) b.click(); });
      document.querySelectorAll('.btnLuvasChip').forEach(b => { if (Number(b.dataset.val) > 0) b.click(); });
      document.querySelectorAll('.btnBonusWin').forEach(b => { if (Number(b.dataset.val) > 0) b.click(); });
      document.querySelectorAll('.btnBonusGoal').forEach(b => { if (Number(b.dataset.val) > 0) b.click(); });
      const confirmBuyBtn = document.getElementById('btnConfirmBuyTransfer');
      assert.ok(confirmBuyBtn, 'Botão #btnConfirmBuyTransfer deve existir');
      confirmBuyBtn.click();
    } finally {
      Math.random = origRandom;
    }
    assert.equal(st.squad.length, squadCountBeforeBuy + 1, 'Compra de jogador deve adicionar o atleta ao elenco');

    // Venda de jogador do elenco via oferta de comprador (.btnAcceptSale)
    const benchSellTarget = st.squad.find(p => p.pos !== 'GK' && !(st.lineup || []).includes(window.playerKey(p))) || st.squad[st.squad.length - 1];
    const sellKey = window.playerKey(benchSellTarget);
    st.transferOffers = st.transferOffers || {};
    st.transferOffers[sellKey] = [{ buyer: 'Gama', price: 350000, diffPercent: 5, sellOnPct: 20 }];
    const balBeforeSell = st.balance;
    Math.random = () => 0.10;
    try {
      window.buyPlayer(sellKey); // para atleta do próprio clube abre openPlayerTransferModal
      const acceptSaleBtn = document.querySelector('.btnAcceptSale');
      assert.ok(acceptSaleBtn, 'Botão .btnAcceptSale deve existir no modal de venda');
      acceptSaleBtn.click();
    } finally {
      Math.random = origRandom;
    }
    assert.equal(st.balance, balBeforeSell + 350000, 'Venda de jogador deve creditar o valor exato no caixa do clube');
    assert.equal(st.lineup.filter(Boolean).length, 11, 'Time titular deve continuar com 11 atletas válidos após venda');

    // 4) Vida Pessoal do Treinador + Todas as Licenças CBF/UEFA (isolamento absoluto do caixa do clube!)
    const clubBalCheck = st.balance;
    window.AFMCareerFix.ensureCareerState(st);
    st.career.cash = 2500000;
    st.career.prestige = 80;
    window.AFMCareerFix.calculateCareerEconomy(st);

    window.AFMCareerFix.handleBuyOrSellProperty(st, 'apt_studio', 'buy');
    window.AFMCareerFix.handleBuyOrUpgradeBusiness(st, 'barbearia_vip');
    window.AFMCareerFix.handleBuyOrSellVehicle(st, 'suv_blindado', 'buy');
    for (const licId of ['cbf_c', 'cbf_b', 'cbf_a', 'cbf_pro', 'uefa_pro']) {
      window.AFMCareerFix.handleBuyLicense(st, licId);
    }
    // Testa reativação de licença já desbloqueada (antes dava TypeError em strict mode quando state.manager era string!)
    window.AFMCareerFix.handleBuyLicense(st, 'cbf_pro');
    window.AFMCareerFix.handleBuyLicense(st, 'uefa_pro');

    assert.equal(st.balance, clubBalCheck, 'Compras pessoais e Licenças JAMAIS podem alterar o caixa do clube (state.balance)');
    assert.equal(st.career.licenseId, 'uefa_pro', 'Treinador deve possuir Licença UEFA PRO ativa');
    assertManagerFinanceIsolation(st, 'M1 Bens & Licenças');

    // Captura idade de um jogador de referência do elenco para provar +1 ano/temporada (+5 em 5 anos)
    const refPlayer = st.squad[0];
    const refStartAge = Number(refPlayer.age);
    const cashBefore5Yrs = st.career.cash;

    for (let yr = 0; yr < 5; yr++) {
      await simulateCompleteSeason();
      assertManagerFinanceIsolation(window.getState(), `M1 Fim Ano ${2026 + yr}`);
    }

    const finalM1 = window.getState();
    assert.equal(finalM1.season, 2031, 'M1 deve chegar em 2031 após 5 temporadas');
    const sameRef = finalM1.squad.find(p => p.name === refPlayer.name);
    if (sameRef) {
      assert.equal(Number(sameRef.age), refStartAge + 5, `Jogador do elenco DEVE envelhecer exatamente +5 anos em 5 temporadas (antes era +10/+20! Atual: ${refStartAge}➔${sameRef.age})`);
    }
    assert.ok(finalM1.career.cash > cashBefore5Yrs, 'Aluguéis de imóveis, lucros de empresas e salários devem acumular no caixa pessoal em 5 anos');

    summaryReport.managerProfiles.push({
      profile: 'M1 — Téc. Carlos Silva (Ceilândia · Série D)',
      clubStart: 'Ceilândia',
      clubEnd: finalM1.club,
      finalDivision: finalM1.competition,
      titlesCount: (finalM1.titles || []).length,
      clubBalance: Math.round(finalM1.balance),
      coachCash: Math.round(finalM1.career.cash),
      coachNetWorth: Math.round(finalM1.career.netWorth),
      license: finalM1.career.licenseId.toUpperCase(),
      liveSpeedsVerified: liveResM1.speedsTested.join(', ')
    });
    console.log(`   ✅ M1 concluído! Divisão 2031: ${finalM1.competition}, Títulos: ${(finalM1.titles || []).length}, Caixa Clube: R$ ${Math.round(finalM1.balance).toLocaleString('pt-BR')}, Patrimônio Técnico: R$ ${Math.round(finalM1.career.netWorth).toLocaleString('pt-BR')}`);
  }

  // ==========================================================================
  // 👔 PERFIL TREINADOR 2 (M2): TÉC. MARCOS VIANA — BOTAFOGO (SAF & BOLSA) -> 5 ANOS
  // ==========================================================================
  if (!onlyProfile || onlyProfile === 'M2') {
  console.log('▶️ [M2 - MODO TREINADOR SAF] Criando Téc. Marcos Viana (Botafogo · Bolsa SAF & P2P) e simulando 5 anos...');
    window.setActiveAccount('teste_perfil_2');
    // Prova de isolamento de licenças: cria carreira prévia com UEFA PRO no Slot 1 e valida que Slot 2 nasce em CBF D!
    window.newCareer({ clubName: 'Vasco da Gama', manager: 'Outro Técnico', slot: 1, gameMode: 'manager' });
    window.AFMCareerFix.ensureCareerState(window.getState());
    window.getState().career.cash = 3000000;
    window.getState().career.prestige = 90;
    for (const lid of ['cbf_c', 'cbf_b', 'cbf_a', 'cbf_pro', 'uefa_pro']) window.AFMCareerFix.handleBuyLicense(window.getState(), lid);
    window.AFM_SETUP_GUARD.enterSetupCleanly();
    window.newCareer({ clubName: 'Botafogo', manager: 'Marcos Viana', slot: 2, gameMode: 'manager' });

    const st = window.getState();
    assert.equal(window.AFMCareerFix.isClubSaf(st, 'Botafogo'), true, 'Botafogo deve ser reconhecido como Clube SAF');
    // Verifica que a licença de M1 (UEFA PRO) NÃO vazou para M2!
    assert.equal(window.getCoachLicensesData(st).currentLicense.id, 'cbf_d', 'M2 deve começar na Licença CBF D sem vazamento entre perfis');

    window.AFM_LifeAndSharesPro.ensureState(st);
    const clubBalBeforeSaf = st.balance;
    st.managerPersonal.personalBalance = 8000000;
    window.AFM_LifeAndSharesPro.syncCareerWallet(st, 8000000);

    // 1) Compra Cotas do Clube SAF + Ações no Pregão + Ordem P2P em Escrow (anti-venda dupla)
    const buyClubShare = window.AFM_LifeAndSharesPro.buyShareFraction(st, 0.25);
    assert.equal(buyClubShare.ok, true, 'Compra de 0.25% de cotas do Botafogo SAF deve funcionar');
    assert.equal(st.balance, clubBalBeforeSaf, 'Compra pessoal de cotas SAF JAMAIS pode alterar o caixa do clube');

    const safList = window.AFM_LifeAndSharesPro.getSafMarketList(st);
    st.safMarket = safList;
    const cruzeiroSaf = safList.find(s => s.id !== 'botafogo') || safList[0];
    const buyStockRes = window.AFM_LifeAndSharesPro.buySafShares(st, cruzeiroSaf.id, 100);
    assert.equal(buyStockRes.ok, true, 'Compra de 100 ações no Pregão SAF deve funcionar');

    const ecoBeforeEscrow = window.AFMCareerFix.calculateCareerEconomy(st);
    const pubOrder = window.AFM_LifeAndSharesPro.publishUserSafSellOrder(st, cruzeiroSaf.id, 60, 15);
    assert.equal(pubOrder.ok, true, 'Publicação de 60 ações em P2P Escrow deve funcionar');

    // Tentativa de venda dupla das mesmas 60 ações no Pregão DEVE falhar (restaram só 40 livres)!
    const doubleSellAttempt = window.AFM_LifeAndSharesPro.sellSafShares(st, cruzeiroSaf.id, 50);
    assert.equal(doubleSellAttempt.ok, false, 'Escrow P2P DEVE bloquear venda dupla no Pregão SAF');

    const ecoDuringEscrow = window.AFMCareerFix.calculateCareerEconomy(st);
    assert.equal(ecoDuringEscrow.netWorth, ecoBeforeEscrow.netWorth, 'Patrimônio Total NÃO pode cair quando ações estão em Escrow P2P');

    // Liquida a ordem P2P com ágio de +15%
    const orderId = st.userSafSellOrders[0].id;
    const execOrder = window.AFM_LifeAndSharesPro.instantExecuteUserSellOrder(st, orderId);
    assert.equal(execOrder.ok, true, 'Execução de ordem P2P com ágio deve creditar conta pessoal');
    assertManagerFinanceIsolation(st, 'M2 Bolsa SAF & P2P');

    for (let yr = 0; yr < 5; yr++) {
      await simulateCompleteSeason((midSt) => {
        if (yr < 3 && (midSt.career?.cash || 0) >= 600000) {
          window.AFMCareerFix.handleBuyOrUpgradeBusiness(midSt, 'escolinha_fut');
        }
      });
      assertManagerFinanceIsolation(window.getState(), `M2 Fim Ano ${2026 + yr}`);
    }

    const finalM2 = window.getState();
    assert.equal(finalM2.season, 2031);

    summaryReport.managerProfiles.push({
      profile: 'M2 — Téc. Marcos Viana (Botafogo · Bolsa SAF & P2P)',
      clubStart: 'Botafogo',
      clubEnd: finalM2.club,
      finalDivision: finalM2.competition,
      titlesCount: (finalM2.titles || []).length,
      clubBalance: Math.round(finalM2.balance),
      coachCash: Math.round(finalM2.career.cash),
      coachNetWorth: Math.round(finalM2.career.netWorth),
      license: finalM2.career.licenseId.toUpperCase(),
      liveSpeedsVerified: 'SAF Pregão + Escrow P2P + Dividendos'
    });
    console.log(`   ✅ M2 concluído! Títulos: ${(finalM2.titles || []).length}, Caixa Clube: R$ ${Math.round(finalM2.balance).toLocaleString('pt-BR')}, Patrimônio Técnico SAF: R$ ${Math.round(finalM2.career.netWorth).toLocaleString('pt-BR')}`);
  }

  // ==========================================================================
  // 👔 PERFIL TREINADOR 3 (M3): TÉC. RICARDO ANCELOTTI — FLAMENGO (CONTINENTAL/MUNDIAL/X1) -> 5 ANOS
  // ==========================================================================
  if (!onlyProfile || onlyProfile === 'M3') {
  console.log('▶️ [M3 - MODO TREINADOR ELITE] Criando Téc. Ricardo Ancelotti (Flamengo · Libertadores/Mundial/X1) e simulando 5 anos...');
    window.setActiveAccount('teste_perfil_3');
    window.AFM_SETUP_GUARD.enterSetupCleanly();
    window.newCareer({ clubName: 'Flamengo', manager: 'Ricardo Ancelotti', slot: 2, gameMode: 'manager' });

    const st = window.getState();
    // Testa Duelo X1 com acentos UTF-8 (Ceilândia, São Paulo, Diógenes) e Ranking de Treinadores ordenado por pontos
    const x1Token = window.AFMCareerFix.generateSafeX1Token({
      club: 'São Paulo',
      coachName: 'Diógenes Conceição',
      teamOverall: 81,
      formation: '4-3-3',
      squad: st.squad.slice(0, 11)
    });
    const x1Duel = window.AFMCareerFix.simulateX1Duel(st, x1Token);
    assert.equal(x1Duel.ok, true, 'Duelo X1 com caracteres UTF-8 acentuados deve funcionar sem erro');

    const rawRk = window.AFM_WorldSimulation.getCoachRankingEntries();
    const rkSorted = window.AFMCareerFix.normalizeAndSortRanking(rawRk, st);
    const rkList = rkSorted.all || rkSorted;
    for (let i = 1; i < Math.min(25, rkList.length); i++) {
      const prevPts = Number(rkList[i - 1].points ?? rkList[i - 1].pts ?? 0);
      const curPts = Number(rkList[i].points ?? rkList[i].pts ?? 0);
      assert.ok(prevPts >= curPts, `Ranking Vivo de Treinadores deve estar em ordem decrescente de pontos (${prevPts} < ${curPts})`);
    }

    for (let yr = 0; yr < 5; yr++) {
      await simulateCompleteSeason();
      assertManagerFinanceIsolation(window.getState(), `M3 Fim Ano ${2026 + yr}`);
    }

    const finalM3 = window.getState();
    assert.equal(finalM3.season, 2031, 'Flamengo com calendário completo (+60 jogos/ano) deve virar todas as 5 temporadas sem bloqueio');
    assert.equal(finalM3.seasonHistory.length, 5, 'Histórico de temporadas deve registrar todos os 5 anos');

    summaryReport.managerProfiles.push({
      profile: 'M3 — Téc. Ricardo Ancelotti (Flamengo · Elite Continental)',
      clubStart: 'Flamengo',
      clubEnd: finalM3.club,
      finalDivision: finalM3.competition,
      titlesCount: (finalM3.titles || []).length,
      clubBalance: Math.round(finalM3.balance),
      coachCash: Math.round(finalM3.career.cash),
      coachNetWorth: Math.round(finalM3.career.netWorth),
      license: finalM3.career.licenseId.toUpperCase(),
      liveSpeedsVerified: '60+ jogos/ano + X1 UTF-8 + Ranking'
    });
    console.log(`   ✅ M3 concluído! Temporadas: 5 (2026–2030), Títulos: ${(finalM3.titles || []).length}, Caixa Clube: R$ ${Math.round(finalM3.balance).toLocaleString('pt-BR')}, Patrimônio Técnico: R$ ${Math.round(finalM3.career.netWorth).toLocaleString('pt-BR')}`);
  }

  if (onlyProfile) {
    console.log(`__PROFILE_JSON__:${JSON.stringify(summaryReport)}`);
    process.exit(0);
  }
  console.log('\n================================================================================');
  console.log('📊 RESUMO CONSOLIDADO DOS 6 PERFIS (30 TEMPORADAS COMPLETAS · ZERO ERROS)');
  console.log('================================================================================');
  console.log(JSON.stringify(summaryReport, null, 2));
  console.log('\n🎉 TODOS OS TESTES DE 5 ANOS (JOGADOR + TREINADOR + AO VIVO 1x..40x + BANCO + MERCADO + VIDA + LICENÇAS) PASSARAM 100%!');
  process.exit(0);
}

runFull5YearSuite().catch((err) => {
  console.error('\n❌ FALHA ENCONTRADA NA SIMULAÇÃO DE 5 ANOS:', err);
  process.exit(1);
});
