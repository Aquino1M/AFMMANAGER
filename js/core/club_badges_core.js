// ==============================================================================
// AFM MANAGER 2027 — SISTEMA CENTRAL DE ESCUDOS, FOTOS & LOGOS (CORE MODULAR)
// Arquivo: js/core/club_badges_core.js
// 
// Funções centrais e leves de renderização:
// - normClub(s)
// - normSlug(s)
// - renderClubBadge(clubName, size)
// - renderPlayerPhoto(player, size)
// - renderCompetitionLogo(compId, size)
// ==============================================================================

window.CLUB_BADGES = window.CLUB_BADGES || {};
window.PLAYER_PHOTOS = window.PLAYER_PHOTOS || {};

// Função de escape sanitizado para prevenção de XSS e erros de referência
window.esc = window.esc || function(s) {
  return String(s ?? '').replace(/[&<>"']/g, function(m) {
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];
  });
};
var esc = window.esc;

// Normalização padronizada de nomes de clubes
window.normClub = function(s) {
  if (typeof s === 'object' && s !== null) {
    s = s.name || s.club || '';
  }
  return String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

function normClub(s) {
  return window.normClub(s);
}

// Conversão padronizada de strings em slugs (ex: "Memphis Depay" -> "memphis_depay")
window.normSlug = function(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
};

function normSlug(s) {
  return window.normSlug(s);
}

// Aliases oficiais para variações populares de escrita
window.CLUB_ALIASES = window.CLUB_ALIASES || {
  'vasco': 'bra_a/vasco.png',
  'vasco da gama': 'bra_a/vasco.png',
  'cr vasco da gama': 'bra_a/vasco.png',
  'red bull bragantino': 'bra_a/bragantino.png',
  'bragantino': 'bra_a/bragantino.png',
  'rb bragantino': 'bra_a/bragantino.png',
  'athletico': 'bra_a/athletico_pr.svg',
  'athletico pr': 'bra_a/athletico_pr.svg',
  'athletico paranaense': 'bra_a/athletico_pr.svg',
  'atletico paranaense': 'bra_a/athletico_pr.svg',
  'atletico mg': 'bra_a/atletico_mg.svg',
  'atletico mineiro': 'bra_a/atletico_mg.svg',
  'galo': 'bra_a/atletico_mg.svg',
  'atletico go': 'bra_b/atletico_go.svg',
  'atletico goianiense': 'bra_b/atletico_go.svg',
  'sao paulo': 'bra_a/sao_paulo.svg',
  'sao paulo fc': 'bra_a/sao_paulo.svg',
  'spfc': 'bra_a/sao_paulo.svg',
  'corinthians': 'bra_a/corinthians.png',
  'sc corinthians': 'bra_a/corinthians.png',
  'corinthians paulista': 'bra_a/corinthians.png',
  'palmeiras': 'bra_a/palmeiras.png',
  'se palmeiras': 'bra_a/palmeiras.png',
  'santos': 'bra_a/santos.png',
  'santos fc': 'bra_a/santos.png',
  'flamengo': 'bra_a/flamengo.png',
  'cr flamengo': 'bra_a/flamengo.png',
  'fluminense': 'bra_a/fluminense.png',
  'fluminense fc': 'bra_a/fluminense.png',
  'gremio': 'bra_a/gremio.svg',
  'gremio fbpa': 'bra_a/gremio.svg',
  'internacional': 'bra_a/internacional.svg',
  'inter de porto alegre': 'bra_a/internacional.svg',
  'cruzeiro': 'bra_a/cruzeiro.svg',
  'cruzeiro ec': 'bra_a/cruzeiro.svg',
  'bahia': 'bra_a/bahia.svg',
  'ec bahia': 'bra_a/bahia.svg',
  'vitoria': 'bra_a/vitoria.svg',
  'ec vitoria': 'bra_a/vitoria.svg',
  'fortaleza': 'bra_b/fortaleza.png',
  'fortaleza ec': 'bra_b/fortaleza.png',
  'ceara': 'bra_b/ceara.svg',
  'ceara sc': 'bra_b/ceara.svg',
  'cuiaba': 'bra_b/cuiaba.png',
  'cuiaba ec': 'bra_b/cuiaba.png',
  'criciuma': 'bra_b/criciuma.svg',
  'criciuma ec': 'bra_b/criciuma.svg',
  'juventude': 'bra_b/juventude.svg',
  'ec juventude': 'bra_b/juventude.svg',
  'chapecoense': 'bra_a/chapecoense.svg',
  'coritiba': 'bra_a/coritiba.svg',
  'coritiba fbc': 'bra_a/coritiba.svg',
  'mirassol': 'bra_a/mirassol.png',
  'mirassol fc': 'bra_a/mirassol.png',
  'remo': 'bra_a/remo.svg',
  'clube do remo': 'bra_a/remo.svg',
  'paysandu': 'bra_c/paysandu.svg',
  'paysandu sc': 'bra_c/paysandu.svg',
  'sport': 'bra_b/sport.svg',
  'sport recife': 'bra_b/sport.svg',
  'america mg': 'bra_b/america_mg.svg',
  'america mineiro': 'bra_b/america_mg.svg',
  'america rn': 'bra_d/america_rn.svg',
  'america rj': 'bra_d/america_rj.svg',
  'botafogo': 'bra_a/botafogo.svg',
  'botafogo rj': 'bra_a/botafogo.svg',
  'botafogo sp': 'bra_b/botafogo_sp.svg',
  'botafogo pb': 'bra_c/botafogo_pb.svg',
  'athletic club': 'bra_b/athletic_club.svg',
  'avai': 'bra_b/avai.svg',
  'ponte preta': 'bra_b/ponte_preta.svg',
  'atletico ba': 'bra_d/atletico_ba_official.png',
  'atletico de alagoinhas': 'bra_d/atletico_ba_official.png',
  'central': 'bra_d/central_official.png',
  'central sport club': 'bra_d/central_official.png',
  'portuguesa rj': 'bra_d/portuguesa_rj_cbf_2026.png',
  'portuguesa carioca': 'bra_d/portuguesa_rj_cbf_2026.png',
  'sao joseense': 'bra_d/sao_joseense_cbf_2026.png',
  'guarani': 'bra_c/guarani.svg',
  'novorizontino': 'bra_b/novorizontino.svg',
  'operario pr': 'bra_b/operario_pr.svg',
  'brusque': 'bra_c/brusque.svg',
  'vila nova': 'bra_b/vila_nova.svg',
  'goias': 'bra_b/goias.png',
  'crb': 'bra_b/crb.svg',
  'sao bernardo': 'bra_b/sao_bernardo.svg',
  'londrina': 'bra_b/londrina.svg',
  'nautico': 'bra_b/nautico.svg',
  'amazonas': 'bra_c/amazonas_fc.png',
  'amazonas fc': 'bra_c/amazonas_fc.png',
  'volta redonda': 'bra_c/volta_redonda.svg',
  'ferroviaria': 'bra_c/ferroviaria.png',
  'santa cruz': 'bra_c/santa_cruz.svg',
  'figueirense': 'bra_c/figueirense.png',
  'ypiranga rs': 'bra_c/ypiranga_rs.svg',
  'caxias': 'bra_c/caxias.svg',
  'maringa': 'bra_c/maringa.svg',
  'brasiliense': 'bra_d/brasiliense.png',
  'gama': 'bra_d/gama.png',
  'capital df': 'bra_d/capital_df.png',
  'ceilandia': 'bra_d/ceilandia.png',
  'real brasilia': 'bra_estaduais/real_brasilia.png',
  'sobradinho': 'bra_estaduais/sobradinho.png',
  'samambaia': 'bra_estaduais/samambaia.png',
  'paranoa': 'bra_estaduais/paranoa.png',
  'brasilia': 'bra_estaduais/brasilia.png',
  'aruc': 'bra_estaduais/aruc.png',
  'river plate': 'arg_1/river_plate.png',
  'boca juniors': 'arg_1/boca_juniors.png',
  'racing club': 'arg_1/racing_club.png',
  'independiente': 'arg_1/independiente.png',
  'san lorenzo': 'arg_1/san_lorenzo.png',
  'velez sarsfield': 'arg_1/velez_sarsfield.png',
  'lanus': 'arg_1/lanus.png',
  'estudiantes': 'arg_1/estudiantes.png',
  'penarol': 'conmebol/penarol.png',
  'nacional': 'nacional.png',
  'colo colo': 'conmebol/colo_colo.png',
  'ldu quito': 'conmebol/ldu_quito.png',
  'real madrid': 'europe/real_madrid.png',
  'barcelona': 'europe/barcelona.png',
  'fc barcelona': 'europe/barcelona.png',
  'manchester city': 'europe/manchester_city.png',
  'manchester united': 'europe/manchester_united.png',
  'arsenal': 'europe/arsenal.png',
  'chelsea': 'europe/chelsea.png',
  'liverpool': 'europe/liverpool.png',
  'bayern munchen': 'europe/bayern_munchen.png',
  'paris saint germain': 'europe/paris_saint_germain.png',
  'psg': 'europe/paris_saint_germain.png',
  'juventus': 'europe/juventus.png',
  'inter': 'europe/inter.png',
  'ac milan': 'europe/ac_milan.png',
  'al hilal': 'asia/al_hilal.png',
  'al nassr': 'asia/al_nassr.png',
  'al ittihad': 'asia/al_ittihad.png',
  'al ahli': 'asia/al_ahli.png'
};

const DEFAULT_PLAYER_AVATAR = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64' fill='%2364748b'><circle cx='32' cy='22' r='14'/><path d='M12 56c0-11 9-20 20-20s20 9 20 20z'/></svg>";
window.DEFAULT_PLAYER_AVATAR = DEFAULT_PLAYER_AVATAR;

window.renderPlayerPhoto = function(playerName, size = 32) {
  const pName = typeof playerName === 'object' && playerName !== null ? (playerName.name || 'Jogador') : String(playerName || 'Jogador');
  const localFile = (window.PLAYER_PHOTOS && (window.PLAYER_PHOTOS[pName] || window.PLAYER_PHOTOS[window.normSlug?.(pName)])) || DEFAULT_PLAYER_AVATAR;
  return `<img src="${localFile}" alt="${pName}" class="player-photo-img" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;vertical-align:middle;display:inline-block;" onerror="this.onerror=null;this.src='${DEFAULT_PLAYER_AVATAR}';" />`;
};

// Renderização oficial de escudos de clubes com caminhos locais e fallback nativo
function buildClubBadgeFallbackPaths(rawName) {
  const slug = window.normSlug(rawName);
  if (!slug) return [];
  let stripped = slug;
  const suffixes = ['_futebol_clube', '_esporte_clube', '_futebol', '_esporte', '_fc', '_sc', '_ec'];
  for (const suffix of suffixes) {
    if (stripped.endsWith(suffix)) { stripped = stripped.slice(0, -suffix.length); break; }
  }
  const variants = [...new Set([slug, stripped].filter(Boolean))];
  const folders = ['bra_a', 'bra_b', 'bra_c', 'bra_d', 'bra_estaduais', ''];
  const paths = [];
  for (const variant of variants) {
    for (const ext of ['png', 'svg']) {
      for (const folder of folders) {
        paths.push((folder ? 'img/badges/' + folder + '/' : 'img/badges/') + variant + '.' + ext);
      }
    }
  }
  return [...new Set(paths)];
}

window.renderClubBadge = function(clubName, size = 32) {
  const rawName = (typeof clubName === 'object' && clubName !== null ? (clubName.name || clubName.club || '') : String(clubName || '')).trim() || 'Clube';
  const n = window.normClub(rawName);
  const verifiedFile = window.CLUB_BADGES_VERIFIED_2026_BY_NAME?.[n] || window.CLUB_BADGE_ALIASES_VERIFIED_2026?.[n];
  let file = verifiedFile || (window.CLUB_ALIASES && window.CLUB_ALIASES[n]) || (window.CLUB_BADGES && window.CLUB_BADGES[rawName]);
  if (!file && window.CLUB_BADGES) {
    for (const [k, v] of Object.entries(window.CLUB_BADGES)) {
      if (window.normClub(k) === n) { file = v; break; }
    }
  }
  const knownPath = file ? (file.startsWith('img/badges/') ? file : 'img/badges/' + file) : null;
  const alternatives = verifiedFile ? [] : buildClubBadgeFallbackPaths(rawName).filter(path => path !== knownPath);
  const imagePath = knownPath || alternatives.shift();
  if (!imagePath) return '';
  const onError = "const a=JSON.parse(this.dataset.badgeAlternatives||'[]');if(a.length){this.dataset.badgeAlternatives=JSON.stringify(a.slice(1));this.src=a[0];}else{this.onerror=null;this.remove();}";
  return `<img src="${imagePath}" alt="${rawName}" class="crest-img" style="width:${size}px;height:${size}px;object-fit:contain;vertical-align:middle;flex-shrink:0;" data-badge-alternatives="${esc(JSON.stringify(alternatives))}" onerror="${onError}" />`;
};

// Renderização oficial de avatar de jogadores (Fotos Reais com fallback vetorial do AFM)
window.renderPlayerPhoto = function(player, size = 64) {
  const pObj = (typeof player === 'object' && player !== null) ? player : { name: String(player || 'Jogador'), pos: 'CM', club: '' };
  const pName = pObj.name || 'Jogador';
  const pPos = pObj.pos || 'CM';
  const photoUrl = typeof window.resolvePlayerPhotoUrl === 'function' ? window.resolvePlayerPhotoUrl(pObj) : null;

  if (photoUrl) {
    const fallbackSvg = window.renderDefaultPlayerAvatar(pName, size, pPos);
    return `<div class="player-photo-container" style="width:${size}px;height:${size}px;border-radius:50%;overflow:hidden;position:relative;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;vertical-align:middle;box-shadow:0 2px 6px rgba(0,0,0,0.3)">
      <img src="${String(photoUrl)}" alt="${String(pName)}" style="width:100%;height:100%;object-fit:cover;display:block" onerror="this.style.display='none';if(this.nextElementSibling)this.nextElementSibling.style.display='inline-flex';" />
      <div style="display:none;width:100%;height:100%">${fallbackSvg}</div>
    </div>`;
  }

  return window.renderDefaultPlayerAvatar(pName, size, pPos);
};

window.renderDefaultPlayerAvatar = function(playerName, size = 64, pos = 'CM') {
  const posUpper = String(pos || 'CM').toUpperCase();
  const posColorMap = {
    GK: '#f59e0b',
    CB: '#3b82f6', LB: '#38bdf8', RB: '#38bdf8',
    DM: '#10b981', CM: '#22c55e', AM: '#a855f7',
    LM: '#06b6d4', RM: '#06b6d4',
    LW: '#ec4899', RW: '#ec4899', CF: '#ef4444', ST: '#f43f5e'
  };
  const badgeColor = posColorMap[posUpper] || '#94a3b8';
  const iconSize = Math.round(size * 0.68);
  return `<div class="player-avatar-fallback" style="width:${size}px;height:${size}px;border-radius:50%;background:radial-gradient(circle at 35% 30%, #1e293b, #090d16);border:1.5px solid rgba(148,163,184,0.35);box-shadow:0 2px 6px rgba(0,0,0,0.45);display:inline-flex;align-items:center;justify-content:center;position:relative;flex-shrink:0;vertical-align:middle" title="${String(playerName||'')}">
    <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="opacity:0.95">
      <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="${badgeColor}"/>
    </svg>
    ${size >= 30 ? `<span style="position:absolute;bottom:-2px;right:-2px;background:#0f172a;border:1px solid rgba(255,255,255,0.25);color:${badgeColor};font-size:${Math.max(7, Math.round(size * 0.22))}px;font-weight:900;padding:1px 3px;border-radius:4px;line-height:1">${posUpper.slice(0, 2)}</span>` : ''}
  </div>`;
};

// Logos oficiais das competições (pasta img/competitions/)
window.COMPETITION_LOGOS = window.COMPETITION_LOGOS || {
  'bra-a': 'bra_a.svg',
  'bra-b': 'bra_b.svg',
  'bra-c': 'bra_c.svg',
  'bra-d': 'bra_d.svg',
  'bra-cup': 'bra_cup.svg',
  'lib': 'libertadores.svg',
  'sud': 'sudamericana.svg',
  'ucl': 'ucl.svg',
  'uel': 'uel.svg',
  'uecl': 'uel.svg',
  'cwc': 'cwc.svg',
  'eng-1': 'eng_1.svg',
  'esp-1': 'esp_1.svg',
  'ita-1': 'ita_1.svg',
  'ger-1': 'ger_1.svg',
  'fra-1': 'fra_1.svg',
  'por-1': 'por_1.svg',
  'ksa-1': 'ksa_1.svg'
};

window.renderCompetitionLogo = function(compId, size = 32) {
  const file = window.COMPETITION_LOGOS && window.COMPETITION_LOGOS[compId];
  if (file) {
    return `<img src="img/competitions/${file}" alt="${compId}" class="comp-logo-img" style="width:${size}px;height:${size}px;object-fit:contain;vertical-align:middle;border-radius:6px;flex-shrink:0" loading="lazy" onerror="if(!this.dataset.retried){this.dataset.retried=1;this.src='img/badges/competitions/${file}';}else{this.style.display='none';}">`;
  }
  return `<span class="comp-badge-fallback" style="display:inline-flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;border-radius:6px;background:rgba(99,102,241,0.2);color:#a5b4fc;font-weight:900;font-size:${Math.round(size*0.4)}px">🏆</span>`;
};
