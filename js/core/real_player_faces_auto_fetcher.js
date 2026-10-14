// ==============================================================================
// AFM MANAGER 2027 — SISTEMA AUTOMÁTICO DE FOTOS REAIS DOS JOGADORES
// Arquivo: js/core/real_player_faces_auto_fetcher.js
// BLOCO 03 — Busca automática de fotos para Corinthians e todas as ligas
// ==============================================================================

(function (window) {
  'use strict';

  const CACHE_KEY = 'afm2027_real_player_faces_v2';
  let faceCache = {};
  try {
    if (typeof localStorage !== 'undefined') {
      faceCache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
    }
  } catch (e) {
    faceCache = {};
  }

  const pendingQueries = new Set();

  function normalizeName(name = '') {
    return String(name)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  // Mapeamento prévio de fotos oficiais para o elenco completo do Corinthians e estrelas
  const PRESET_PLAYER_FACES = {
    'rodrigo garro': 'https://www.thesportsdb.com/images/media/player/cutout/rodrigo_garro.png',
    'garro': 'https://www.thesportsdb.com/images/media/player/cutout/rodrigo_garro.png',
    'yuri alberto': 'https://www.thesportsdb.com/images/media/player/cutout/yuri_alberto.png',
    'hugo souza': 'https://www.thesportsdb.com/images/media/player/cutout/hugo_souza.png',
    'igor coronado': 'https://www.thesportsdb.com/images/media/player/cutout/igor_coronado.png',
    'coronado': 'https://www.thesportsdb.com/images/media/player/cutout/igor_coronado.png',
    'raniele': 'https://www.thesportsdb.com/images/media/player/cutout/raniele.png',
    'andre ramalho': 'https://www.thesportsdb.com/images/media/player/cutout/andre_ramalho.png',
    'felix torres': 'https://www.thesportsdb.com/images/media/player/cutout/felix_torres.png',
    'fagner': 'https://www.thesportsdb.com/images/media/player/cutout/fagner.png',
    'matheus bidu': 'https://www.thesportsdb.com/images/media/player/cutout/matheus_bidu.png',
    'bidu': 'https://www.thesportsdb.com/images/media/player/cutout/matheus_bidu.png',
    'angel romero': 'https://www.thesportsdb.com/images/media/player/cutout/angel_romero.png',
    'romero': 'https://www.thesportsdb.com/images/media/player/cutout/angel_romero.png',
    'talles magno': 'https://www.thesportsdb.com/images/media/player/cutout/talles_magno.png',
    'andre carrillo': 'https://www.thesportsdb.com/images/media/player/cutout/andre_carrillo.png',
    'carrillo': 'https://www.thesportsdb.com/images/media/player/cutout/andre_carrillo.png',
    'breno bidon': 'https://www.thesportsdb.com/images/media/player/cutout/breno_bidon.png',
    'bidon': 'https://www.thesportsdb.com/images/media/player/cutout/breno_bidon.png',
    'jose martinez': 'https://www.thesportsdb.com/images/media/player/cutout/jose_martinez.png',
    'martinez': 'https://www.thesportsdb.com/images/media/player/cutout/jose_martinez.png',
    'caca': 'https://www.thesportsdb.com/images/media/player/cutout/caca.png',
    'gustavo henrique': 'https://www.thesportsdb.com/images/media/player/cutout/gustavo_henrique.png',
    'charles': 'https://www.thesportsdb.com/images/media/player/cutout/charles.png',
    'pedro raul': 'https://www.thesportsdb.com/images/media/player/cutout/pedro_raul.png',
    'hugo': 'https://www.thesportsdb.com/images/media/player/cutout/hugo.png',
    'memphis depay': 'https://www.thesportsdb.com/images/media/player/cutout/memphis_depay.png',
    'depay': 'https://www.thesportsdb.com/images/media/player/cutout/memphis_depay.png'
  };

  const RealPlayerFacesAutoFetcher = {
    resolveRealPlayerPhotoUrl(player) {
      if (!player) return null;
      const name = typeof player === 'string' ? player : (player.name || player.shortName || '');
      if (!name) return null;
      const key = normalizeName(name);
      if (!key || key === 'vazio') return null;
      return PRESET_PLAYER_FACES[key] || faceCache[key] || null;
    },

    getCachedPhoto(playerName) {
      const key = normalizeName(playerName);
      return faceCache[key] || PRESET_PLAYER_FACES[key] || null;
    },

    saveToCache(playerName, url) {
      if (!playerName || !url) return;
      const key = normalizeName(playerName);
      faceCache[key] = url;
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(CACHE_KEY, JSON.stringify(faceCache));
        }
      } catch (e) {}
    },

    async fetchPlayerCutoutFromSportsDB(playerName) {
      const key = normalizeName(playerName);
      if (!key || key === 'vazio') return null;
      if (PRESET_PLAYER_FACES[key]) return PRESET_PLAYER_FACES[key];
      if (faceCache[key]) return faceCache[key];
      if (pendingQueries.has(key)) return null;

      pendingQueries.add(key);
      try {
        if (typeof fetch === 'function') {
          const url = `https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${encodeURIComponent(playerName)}`;
          const resp = await fetch(url);
          if (!resp.ok) return null;
          const data = await resp.json();
          const players = data?.player;
          if (Array.isArray(players) && players.length > 0) {
            const match = players.find((p) => p.strCutout || p.strThumb) || players[0];
            const photoUrl = match.strCutout || match.strThumb || match.strRender;
            if (photoUrl) {
              this.saveToCache(playerName, photoUrl);
              return photoUrl;
            }
          }
        }
      } catch (e) {
      } finally {
        pendingQueries.delete(key);
      }
      return null;
    },

    async hydratePlayerAvatarElement(el, playerName, playerObj = null) {
      if (!el || !playerName || normalizeName(playerName) === 'vazio') return;
      const cached = playerObj?.photoUrl || this.getCachedPhoto(playerName);
      if (cached) {
        if (el.tagName === 'IMG') el.src = cached;
        else el.innerHTML = `<img src="${cached}" alt="${playerName}" style="width:100%;height:100%;object-fit:cover;object-position:center top;border-radius:50%;" onerror="this.style.display='none'" />`;
        return;
      }

      const fetchedUrl = await this.fetchPlayerCutoutFromSportsDB(playerName);
      if (fetchedUrl) {
        if (playerObj) playerObj.photoUrl = fetchedUrl;
        if (el.tagName === 'IMG') el.src = fetchedUrl;
        else el.innerHTML = `<img src="${fetchedUrl}" alt="${playerName}" style="width:100%;height:100%;object-fit:cover;object-position:center top;border-radius:50%;" onerror="this.style.display='none'" />`;
      }
    }
  };

  window.AFM_RealPlayerFaces = RealPlayerFacesAutoFetcher;
})(typeof window !== 'undefined' ? window : global);
