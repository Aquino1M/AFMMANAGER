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
  'america mg': 'bra_b/america_mg.png',
  'america mineiro': 'bra_b/america_mg.png',
  'america rn': 'bra_d/america_rn.svg',
  'america rj': 'bra_d/america_rj.svg',
  'botafogo': 'bra_a/botafogo.svg',
  'botafogo rj': 'bra_a/botafogo.svg',
  'botafogo sp': 'bra_b/botafogo_sp.svg',
  'botafogo pb': 'bra_c/botafogo_pb.svg',
  'athletic club': 'bra_b/athletic_club.svg',
  'avai': 'bra_b/avai.svg',
  'ponte preta': 'bra_b/ponte_preta.svg',
  'guarani': 'bra_c/guarani.png',
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
  'nacional': 'conmebol/nacional.png',
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

// Renderização oficial de escudos de clubes
window.renderClubBadge = function(clubName, size = 32) {
  const rawName = (typeof clubName === 'object' && clubName !== null ? (clubName.name || clubName.club || '') : String(clubName || '')).trim() || 'Clube';
  const n = window.normClub(rawName);

  let file = (window.CLUB_ALIASES && window.CLUB_ALIASES[n]) || (window.CLUB_BADGES && window.CLUB_BADGES[rawName]);

  if (!file && window.CLUB_BADGES) {
    for (const [k, v] of Object.entries(window.CLUB_BADGES)) {
      if (window.normClub(k) === n) {
        file = v;
        break;
      }
    }
  }

  if (file) {
    const cleanPath = file.startsWith('img/badges/') ? file : `img/badges/${file}`;
    const escapedName = rawName.replace(/'/g, "\\'");
    return `<img src="${cleanPath}" alt="${rawName}" class="crest-img" style="width:${size}px;height:${size}px;object-fit:contain;vertical-align:middle;border-radius:4px;flex-shrink:0" loading="lazy" onerror="this.onerror=null; this.outerHTML=window.renderDefaultBadge('${escapedName}',${size});">`;
  }

  return window.renderDefaultBadge(rawName, size);
};

window.renderDefaultBadge = function(rawName, size = 32) {
  const inits = rawName.split(/\s+/).filter(Boolean).slice(0, 2).map(x => x[0]).join('').toUpperCase() || 'FC';
  const n = typeof window.normClub === 'function' ? window.normClub(rawName) : rawName.toLowerCase();
  
  const colorMap = {
    'flamengo': ['#b91c1c', '#ffffff'],
    'palmeiras': ['#047857', '#ffffff'],
    'corinthians': ['#09090b', '#ffffff'],
    'sao paulo': ['#b91c1c', '#ffffff'],
    'santos': ['#ffffff', '#09090b'],
    'gremio': ['#0284c7', '#ffffff'],
    'internacional': ['#dc2626', '#ffffff'],
    'vasco': ['#09090b', '#ffffff'],
    'cruzeiro': ['#1d4ed8', '#ffffff'],
    'atletico mg': ['#09090b', '#ffffff'],
    'botafogo': ['#09090b', '#ffffff'],
    'fluminense': ['#047857', '#b91c1c'],
    'bahia': ['#0284c7', '#dc2626'],
    'sport': ['#b91c1c', '#facc15'],
    'sport recife': ['#b91c1c', '#facc15'],
    'america mg': ['#15803d', '#ffffff'],
    'brasilia': ['#dc2626', '#ffffff'],
    'coritiba': ['#047857', '#ffffff'],
    'chapecoense': ['#059669', '#ffffff'],
    'goias': ['#047857', '#ffffff'],
    'ceara': ['#09090b', '#ffffff'],
    'fortaleza': ['#1d4ed8', '#dc2626'],
    'sao bernardo': ['#ca8a04', '#09090b'],
    'pantanal': ['#047857', '#eab308']
  };

  const pair = colorMap[n] || ['#1e1b4b', '#c7d2fe'];
  const bg = pair[0];
  const fg = pair[1] || '#ffffff';

  return `<div class="crest-img-fallback" style="width:${size}px;height:${size}px;border-radius:6px;background:${bg};border:1.5px solid rgba(255,255,255,0.25);display:inline-flex;align-items:center;justify-content:center;font-size:${Math.max(8, Math.round(size*0.38))}px;font-weight:900;color:${fg};flex-shrink:0;box-shadow:0 2px 6px rgba(0,0,0,0.5);letter-spacing:0.5px" title="${rawName}">${inits}</div>`;
};

// Renderização oficial de fotos de jogadores
window.renderPlayerPhoto = function(player, size = 64) {
  const pObj = (typeof player === 'object' && player !== null) ? player : { name: String(player || 'Jogador'), pos: 'CM', club: '' };
  const pName = pObj.name || 'Jogador';
  const pPos = pObj.pos || 'CM';
  const pClub = pObj.club || '';

  // 1. Verificar mapeamento em PLAYER_PHOTOS
  let photoPath = window.PLAYER_PHOTOS && (window.PLAYER_PHOTOS[pName] || window.PLAYER_PHOTOS[pName.toLowerCase()]);

  // 2. Fallback por convenção de slugs (img/players/<liga>/<clube>/<jogador>.png)
  if (!photoPath && pClub) {
    const clubSlug = window.normSlug(pClub);
    const playerSlug = window.normSlug(pName);
    photoPath = `img/players/bra_a/${clubSlug}/${playerSlug}.png`;
  }

  if (photoPath) {
    const cleanPath = photoPath.startsWith('img/') ? photoPath : `img/${photoPath}`;
    const baseName = photoPath.split('/').pop();
    return `<img src="${cleanPath}" alt="${pName}" class="player-photo-img" style="width:${size}px;height:${size}px;object-fit:cover;border-radius:50%;vertical-align:middle;border:2px solid rgba(255,255,255,0.15);flex-shrink:0;background:#0f172a" loading="lazy" onerror="if(!this.dataset.retried){this.dataset.retried=1;this.src='img/players/${baseName}';}else{this.onerror=null;this.parentElement.innerHTML=renderDefaultPlayerAvatar('${pName.replace(/'/g, "\\'")}',${size},'${pPos}');}">`;
  }

  return window.renderDefaultPlayerAvatar(pName, size, pPos);
};

window.renderDefaultPlayerAvatar = function(playerName, size = 64, pos = 'CM') {
  const inits = playerName.split(/\s+/).filter(Boolean).slice(0, 2).map(x => x[0]).join('').toUpperCase() || 'AF';
  const fontSize = Math.round(size * 0.36);
  return `<div class="player-avatar-fallback" style="width:${size}px;height:${size}px;border-radius:50%;background:linear-gradient(135deg,#0f172a,#1e1b4b);border:2px solid rgba(99,102,241,0.3);display:inline-flex;align-items:center;justify-content:center;position:relative;flex-shrink:0">
    <span style="font-size:${fontSize}px;font-weight:900;color:#e2e8f0">${inits}</span>
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
