// ==============================================================================
// AFM MANAGER 2027 — SISTEMA OFICIAL DE FOTOS REAIS DOS JOGADORES (CORE FAST)
// Arquivo: js/core/real_player_faces_auto_fetcher.js
// Garante resolução instantânea e offline de fotos para Corinthians e clubes
// ==============================================================================

(function (window) {
  'use strict';

  function normalizeName(name = '') {
    return String(name)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  // Mapeamento prévio de fotos oficiais locais verificadas
  const PRESET_PLAYER_FACES = {
    'hugo souza': 'img/players/tm_574901.jpg',
    'souza': 'img/players/tm_574901.jpg',
    'fagner': 'img/players/tm_47592.jpg',
    'felix torres': 'img/players/tm_468174.jpg',
    'torres': 'img/players/tm_468174.jpg',
    'andre ramalho': 'img/players/tm_175792.jpg',
    'ramalho': 'img/players/tm_175792.jpg',
    'matheus bidu': 'img/players/tm_670021.jpg',
    'bidu': 'img/players/tm_670021.jpg',
    'jose martinez': 'img/players/tm_415666.jpg',
    'martinez': 'img/players/tm_415666.jpg',
    'breno bidon': 'img/players/tm_1029227.jpg',
    'bidon': 'img/players/tm_1029227.jpg',
    'andre carrillo': 'img/players/tm_135057.jpg',
    'carrillo': 'img/players/tm_135057.jpg',
    'angel romero': 'img/players/tm_262262.jpg',
    'romero': 'img/players/tm_262262.jpg',
    'talles magno': 'img/players/tm_677512.jpg',
    'magno': 'img/players/tm_677512.jpg',
    'memphis depay': 'img/players/bra_a/corinthians/memphis_depay.png',
    'depay': 'img/players/bra_a/corinthians/memphis_depay.png',
    'rodrigo garro': 'img/players/tm_565009.jpg',
    'garro': 'img/players/tm_565009.jpg',
    'yuri alberto': 'img/players/tm_489893.jpg',
    'alberto': 'img/players/tm_489893.jpg',
    'igor coronado': 'img/players/tm_215915.jpg',
    'coronado': 'img/players/tm_215915.jpg',
    'raniele': 'img/players/tm_546530.jpg',
    'caca': 'img/players/tm_603122.jpg',
    'gustavo henrique': 'img/players/tm_208681.jpg',
    'charles': 'img/players/tm_486078.jpg',
    'hugo': 'img/players/tm_730708.jpg',
    'neymar': 'img/players/tm_68290.jpg',
    'neymar jr': 'img/players/tm_68290.jpg',
    'estevao': 'img/players/tm_1056993.jpg',
    'lionel messi': 'img/players/tm_28003.jpg',
    'messi': 'img/players/tm_28003.jpg'
  };

  const RealPlayerFacesAutoFetcher = {
    resolveRealPlayerPhotoUrl(player) {
      if (!player) return null;
      if (typeof player === 'object' && player.photo && typeof player.photo === 'string') {
        return player.photo;
      }
      const name = typeof player === 'string' ? player : (player.name || player.shortName || '');
      if (!name) return null;
      const key = normalizeName(name);
      if (!key || key === 'vazio') return null;
      return PRESET_PLAYER_FACES[key] || window.PLAYER_PHOTOS?.[name] || window.PLAYER_PHOTOS?.[key] || null;
    },

    getCachedPhoto(playerName) {
      return this.resolveRealPlayerPhotoUrl(playerName);
    },

    hydratePlayerAvatarElement(el, playerName) {
      if (!el || !playerName) return;
      const url = this.resolveRealPlayerPhotoUrl(playerName);
      if (url) {
        if (el.tagName === 'IMG') {
          el.src = url;
        } else {
          el.innerHTML = `<img src="${url}" alt="${playerName}" style="width:100%;height:100%;object-fit:cover;object-position:center top;border-radius:50%;" />`;
        }
      }
    }
  };

  window.AFM_RealPlayerFaces = RealPlayerFacesAutoFetcher;
})(typeof window !== 'undefined' ? window : global);
