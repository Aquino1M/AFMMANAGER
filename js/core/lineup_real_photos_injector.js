// ==============================================================================
// AFM MANAGER 2027 — INJETOR DE FOTOS REAIS NA ESCALAÇÃO E BANCO DE RESERVAS
// Arquivo: js/core/lineup_real_photos_injector.js
// BLOCO 05 — 100% ISOLADO NO SAVE DO USUÁRIO
// ==============================================================================

(function (window) {
  'use strict';

  const STORAGE_KEY = 'afm2027_verified_cutouts_v3';
  let verifiedCutouts = {};
  try {
    if (typeof localStorage !== 'undefined') {
      verifiedCutouts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    }
  } catch (e) {}

  // Mapa prioritário imediato do elenco do Corinthians + estrelas
  const INSTANT_CORINTHIANS_AND_STARS_MAP = {
    'depay': 'https://www.thesportsdb.com/images/media/player/cutout/28965v1726681674.png',
    'memphis depay': 'https://www.thesportsdb.com/images/media/player/cutout/28965v1726681674.png',
    'rodrigo garro': 'https://www.thesportsdb.com/images/media/player/cutout/rodrigo_garro.png',
    'garro': 'https://www.thesportsdb.com/images/media/player/cutout/rodrigo_garro.png',
    'yuri alberto': 'https://www.thesportsdb.com/images/media/player/cutout/yuri_alberto.png',
    'hugo souza': 'https://www.thesportsdb.com/images/media/player/cutout/hugo_souza.png',
    'coronado': 'https://www.thesportsdb.com/images/media/player/cutout/igor_coronado.png',
    'igor coronado': 'https://www.thesportsdb.com/images/media/player/cutout/igor_coronado.png',
    'raniele': 'https://www.thesportsdb.com/images/media/player/cutout/raniele.png',
    'andre ramalho': 'https://www.thesportsdb.com/images/media/player/cutout/andre_ramalho.png',
    'ramalho': 'https://www.thesportsdb.com/images/media/player/cutout/andre_ramalho.png',
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
    'hugo': 'https://www.thesportsdb.com/images/media/player/cutout/hugo.png'
  };

  const pendingNames = new Set();

  function cleanPlayerKey(raw = '') {
    return String(raw).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }

  const LineupRealPhotosInjector = {
    fetchOfficialCutout(playerName) {
      const key = cleanPlayerKey(playerName);
      if (!key || key === 'vazio' || key.length < 3) return null;
      if (INSTANT_CORINTHIANS_AND_STARS_MAP[key]) return INSTANT_CORINTHIANS_AND_STARS_MAP[key];
      if (verifiedCutouts[key]) return verifiedCutouts[key];
      if (window.AFM_RealPlayerFaces && typeof window.AFM_RealPlayerFaces.resolveRealPlayerPhotoUrl === 'function') {
        const preset = window.AFM_RealPlayerFaces.resolveRealPlayerPhotoUrl(playerName);
        if (preset) return preset;
      }
      this.fetchOfficialCutoutAsync(playerName);
      return null;
    },

    async fetchOfficialCutoutAsync(playerName) {
      const key = cleanPlayerKey(playerName);
      if (!key || key === 'vazio' || key.length < 3 || pendingNames.has(key)) return null;

      pendingNames.add(key);
      try {
        if (typeof fetch === 'function') {
          const resp = await fetch(`https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${encodeURIComponent(playerName)}`);
          if (resp.ok) {
            const data = await resp.json();
            const list = data?.player;
            if (Array.isArray(list) && list.length > 0) {
              const best = list.find((p) => p.strCutout) || list.find((p) => p.strThumb) || list[0];
              const url = best?.strCutout || best?.strThumb || best?.strRender;
              if (url) {
                verifiedCutouts[key] = url;
                if (typeof localStorage !== 'undefined') {
                  localStorage.setItem(STORAGE_KEY, JSON.stringify(verifiedCutouts));
                }
                return url;
              }
            }
          }
        }
      } catch (e) {
      } finally {
        pendingNames.delete(key);
      }
      return null;
    },

    // Injeta as fotos reais nos 11 mini-cards do campo tático e na lista do Banco de Reservas
    scanAndHydratePitchAndBenchPhotos() {
      if (typeof document === 'undefined') return;
      const isTacticsScreen = document.body.innerText.includes('BANCO DE RESERVAS') || document.body.innerText.includes('FORMAÇÃO:') || document.querySelector('.tactics-pitch-wrapper');
      if (!isTacticsScreen) return;

      // 1. Banco de Reservas (Coluna da direita)
      document.querySelectorAll('div').forEach((row) => {
        if (row.dataset.benchPhotoChecked === '1') return;
        const txt = (row.innerText || '').trim();
        if (txt.includes('Físico ') && row.clientHeight >= 40 && row.clientHeight <= 85) {
          const lines = txt.split('\n').map((s) => s.trim()).filter(Boolean);
          const playerName = lines[0];
          const avatarCircle = row.querySelector('svg')?.parentElement;
          if (playerName && avatarCircle) {
            row.dataset.benchPhotoChecked = '1';
            this.fetchOfficialCutout(playerName).then((url) => {
              if (url) {
                avatarCircle.innerHTML = `<img src="${url}" alt="${playerName}" style="width:100%;height:100%;object-fit:cover;object-position:center top;border-radius:50%;" />`;
              }
            });
          }
        }
      });

      // 2. Mini-cards dos 11 titulares no gramado verde
      document.querySelectorAll('div').forEach((card) => {
        if (card.dataset.pitchPhotoChecked === '1') return;
        if (card.clientWidth >= 60 && card.clientWidth <= 115 && card.clientHeight >= 80 && card.clientHeight <= 145) {
          const silhouetteSvg = card.querySelector('svg');
          const nameBar = card.querySelector('div:last-child, span:last-child');
          const shortName = (nameBar?.textContent || '').trim();
          if (silhouetteSvg && shortName && shortName !== 'VAZIO' && /^[A-ZÀ-Ú\s-]{3,16}$/.test(shortName)) {
            card.dataset.pitchPhotoChecked = '1';
            const st = window.GameState || window.state || {};
            const squad = st.squad || st.players || [];
            const fullPlayer = squad.find((p) => (p?.name || '').toUpperCase().includes(shortName));
            const searchName = fullPlayer?.name || shortName;

            this.fetchOfficialCutout(searchName).then((url) => {
              if (url && silhouetteSvg.parentElement) {
                silhouetteSvg.parentElement.innerHTML = `<img src="${url}" alt="${searchName}" style="width:46px;height:46px;object-fit:cover;object-position:center top;border-radius:6px;display:block;margin:0 auto;" />`;
              }
            });
          }
        }
      });
    }
  };

  if (typeof setInterval !== 'undefined') {
    setInterval(() => LineupRealPhotosInjector.scanAndHydratePitchAndBenchPhotos(), 700);
  }

  window.AFM_LineupPhotos = LineupRealPhotosInjector;
})(typeof window !== 'undefined' ? window : global);
