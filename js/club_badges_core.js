// ==============================================================================
// AFM MANAGER 2027 — SISTEMA CENTRAL DE ESCUDOS & LOGOS (CORE LEVE)
// Arquivo: js/club_badges_core.js
// Totalmente desacoplado dos bancos de dados pesados.
// ==============================================================================

window.CLUB_BADGES = window.CLUB_BADGES || {};

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

// Aliases oficiais para variações populares de escrita
window.CLUB_ALIASES = window.CLUB_ALIASES || {
  'vasco': '24.png',
  'vasco da gama': '24.png',
  'cr vasco da gama': '24.png',
  'c r vasco da gama': '24.png',
  'red bull bragantino': '20.png',
  'bragantino': '20.png',
  'rb bragantino': '20.png',
  'athletico': '7.svg',
  'athletico pr': '7.svg',
  'athletico paranaense': '7.svg',
  'atletico paranaense': '7.svg',
  'atletico mg': '8.svg',
  'atletico mineiro': '8.svg',
  'galo': '8.svg',
  'atletico go': 'atletico_go.svg',
  'atletico goianiense': 'atletico_go.svg',
  'sao paulo': '23.svg',
  'sao paulo fc': '23.svg',
  'spfc': '23.svg',
  'corinthians': '12.png',
  'sc corinthians': '12.png',
  'corinthians paulista': '12.png',
  'palmeiras': '19.png',
  'se palmeiras': '19.png',
  'santos': '22.png',
  'santos fc': '22.png',
  'flamengo': 'flamengo.png',
  'cr flamengo': 'flamengo.png',
  'fluminense': 'fluminense.png',
  'fluminense fc': 'fluminense.png',
  'gremio': '16.svg',
  'gremio fbpa': '16.svg',
  'internacional': '17.svg',
  'inter de porto alegre': '17.svg',
  'cruzeiro': '14.svg',
  'cruzeiro ec': '14.svg',
  'bahia': '9.svg',
  'ec bahia': '9.svg',
  'vitoria': '25.svg',
  'ec vitoria': '25.svg',
  'fortaleza': 'fortaleza.png',
  'fortaleza ec': 'fortaleza.png',
  'ceara': 'ceara.svg',
  'ceara sc': 'ceara.svg',
  'cuiaba': '130.png',
  'cuiaba ec': '130.png',
  'criciuma': 'criciuma.svg',
  'criciuma ec': 'criciuma.svg',
  'juventude': 'juventude.svg',
  'ec juventude': 'juventude.svg',
  'chapecoense': '11.svg',
  'coritiba': '13.svg',
  'coritiba fbc': '13.svg',
  'mirassol': '18.png',
  'mirassol fc': '18.png',
  'remo': '21.svg',
  'clube do remo': '21.svg',
  'paysandu': 'paysandu.svg',
  'paysandu sc': 'paysandu.svg',
  'sport': 'sport.svg',
  'sport recife': 'sport.svg',
  'sport club do recife': 'sport.svg',
  'america mg': 'america_mg.svg',
  'america mineiro': 'america_mg.svg',
  'america rn': 'america_rn.svg',
  'america rj': 'america_rj.svg',
  'botafogo': '10.svg',
  'botafogo rj': '10.svg',
  'botafogo sp': 'botafogo_sp.svg',
  'botafogo pb': 'botafogo_pb.svg',
  'athletic club': 'athletic_club.svg',
  'athletic mg': 'athletic_club.svg',
  'avai': '125.svg',
  'avai fc': '125.svg',
  'ponte preta': 'ponte_preta.svg',
  'guarani': 'guarani.svg',
  'guarani fc': 'guarani.svg',
  'novorizontino': 'novorizontino.svg',
  'operario pr': 'operario_pr.svg',
  'operario ferroviario': 'operario_pr.svg',
  'brusque': 'brusque.svg',
  'vila nova': 'vila_nova.svg',
  'goias': 'goias.png',
  'crb': 'crb.svg',
  'sao bernardo': 'sao_bernardo.svg',
  'londrina': 'londrina.svg',
  'nautico': 'nautico.svg',
  'amazonas': '142.png',
  'amazonas fc': '142.png',
  'volta redonda': 'volta_redonda.svg',
  'ferroviaria': 'ferroviaria.png',
  'santa cruz': 'santa_cruz.svg',
  'figueirense': 'figueirense.png',
  'ypiranga rs': 'ypiranga_rs.svg',
  'ypiranga': 'ypiranga_rs.svg',
  'caxias': '147.svg',
  'ser caxias': '147.svg',
  'maringa': 'maringa.svg',
  'maringa fc': 'maringa.svg',
  'brasiliense': '41.png',
  'gama': 'gama.png',
  'capital df': '43.png',
  'ceilandia': '44.png',
  'real brasilia': '3401.png',
  'sobradinho': '3396.png',
  'samambaia': '3397.png',
  'paranoa': '3400.png',
  'brasilia': '3399.png',
  'aruc': 'aruc.png',
  'real madrid': 'real_madrid.png',
  'barcelona': 'barcelona.png',
  'fc barcelona': 'barcelona.png',
  'manchester city': 'manchester_city.png',
  'manchester united': 'manchester_united.png',
  'arsenal': 'arsenal.png',
  'chelsea': 'chelsea.png',
  'liverpool': 'liverpool.png',
  'bayern munchen': 'bayern_munchen.png',
  'bayern munich': 'bayern_munchen.png',
  'paris saint germain': 'paris_saint_germain.png',
  'psg': 'paris_saint_germain.png',
  'juventus': 'juventus.png',
  'inter': 'inter.png',
  'internazionale': 'inter.png',
  'inter de milao': 'inter.png',
  'ac milan': 'ac_milan.png',
  'milan': 'ac_milan.png',
  'river plate': 'river_plate.png',
  'boca juniors': 'boca_juniors.png',
  'racing club': 'racing_club.png',
  'independiente': 'independiente.png',
  'san lorenzo': 'san_lorenzo.png',
  'velez sarsfield': 'velez_sarsfield.png',
  'lanus': 'lanus.png',
  'estudiantes': 'estudiantes.png',
  'penarol': 'penarol.png',
  'nacional': 'nacional.png',
  'al hilal': 'al_hilal.png',
  'al nassr': 'al_nassr.png'
};

// Renderização otimizada do escudo do clube
window.renderClubBadge = function(clubName, size = 32) {
  const rawName = (typeof clubName === 'object' && clubName !== null ? (clubName.name || clubName.club || '') : String(clubName || '')).trim() || 'Clube';
  const n = window.normClub(rawName);

  let file = (window.CLUB_ALIASES && window.CLUB_ALIASES[n]) || (window.CLUB_BADGES && window.CLUB_BADGES[rawName]);

  if (!file && window.CLUB_BADGES) {
    // 1. Match exato normalizado
    for (const [k, v] of Object.entries(window.CLUB_BADGES)) {
      if (window.normClub(k) === n) {
        file = v;
        break;
      }
    }
  }

  if (!file && window.CLUB_BADGES) {
    // 2. Prefixo ou sufixo com fronteira de palavra
    for (const [k, v] of Object.entries(window.CLUB_BADGES)) {
      const kn = window.normClub(k);
      if (kn && (n.startsWith(kn + ' ') || n.endsWith(' ' + kn) || kn.startsWith(n + ' ') || kn.endsWith(' ' + n))) {
        file = v;
        break;
      }
    }
  }

  if (file) {
    return `<img src="img/badges/${file}" alt="${rawName}" class="crest-img" style="width:${size}px;height:${size}px;object-fit:contain;vertical-align:middle;border-radius:4px;flex-shrink:0" loading="lazy" onerror="if(!this.dataset.retried){this.dataset.retried=1;this.src='./img/badges/${file}';}else{this.style.display='inline-flex';}">`;
  }

  const inits = rawName.split(/\s+/).filter(Boolean).slice(0, 2).map(x => x[0]).join('').toUpperCase() || 'FC';
  return `<div class="crest-img-fallback" style="width:${size}px;height:${size}px;border-radius:6px;background:linear-gradient(135deg,#1e1b4b,#312e81);border:1px solid #6366f1;display:inline-flex;align-items:center;justify-content:center;font-size:${Math.round(size*0.38)}px;font-weight:900;color:#c7d2fe;flex-shrink:0">${inits}</div>`;
};

// Logos oficiais das competições
window.COMPETITION_LOGOS = window.COMPETITION_LOGOS || {
  'bra-a': 'competitions/bra_a.svg',
  'bra-b': 'competitions/bra_b.svg',
  'bra-c': 'competitions/bra_c.svg',
  'bra-d': 'competitions/bra_d.svg',
  'bra-cup': 'competitions/bra_cup.svg',
  'lib': 'competitions/libertadores.svg',
  'sud': 'competitions/sudamericana.svg',
  'ucl': 'competitions/ucl.svg',
  'uel': 'competitions/uel.svg',
  'uecl': 'competitions/uel.svg',
  'cwc': 'competitions/cwc.svg',
  'eng-1': 'competitions/eng_1.svg',
  'esp-1': 'competitions/esp_1.svg',
  'ita-1': 'competitions/ita_1.svg',
  'ger-1': 'competitions/ger_1.svg',
  'fra-1': 'competitions/fra_1.svg',
  'por-1': 'competitions/por_1.svg',
  'ksa-1': 'competitions/ksa_1.svg'
};

window.renderCompetitionLogo = function(compId, size = 32) {
  const file = window.COMPETITION_LOGOS && window.COMPETITION_LOGOS[compId];
  if (file) {
    return `<img src="img/badges/${file}" alt="${compId}" class="comp-logo-img" style="width:${size}px;height:${size}px;object-fit:contain;vertical-align:middle;border-radius:6px;flex-shrink:0" loading="lazy">`;
  }
  return `<span class="comp-badge-fallback" style="display:inline-flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;border-radius:6px;background:rgba(99,102,241,0.2);color:#a5b4fc;font-weight:900;font-size:${Math.round(size*0.4)}px">🏆</span>`;
};
