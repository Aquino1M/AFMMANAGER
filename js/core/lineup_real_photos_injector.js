(function (window) {
  'use strict';

  const STORAGE_KEY = 'afm2027_verified_cutouts_v3';
  let verifiedCutouts = {};
  try { verifiedCutouts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch (e) {}

  const INSTANT_MAP = {
    'depay': 'https://www.thesportsdb.com/images/media/player/cutout/28965v1726681674.png',
    'memphis depay': 'https://www.thesportsdb.com/images/media/player/cutout/28965v1726681674.png'
  };

  function cleanKey(raw = '') {
    return String(raw).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }

  const LineupRealPhotosInjector = {
    hydrateVisibleAvatarsOnce() {
      const app = document.getElementById('app');
      if (!app) return;
      const svgs = app.querySelectorAll('svg');
      if (svgs.length === 0 || svgs.length > 80) return;

      svgs.forEach((svg) => {
        const parent = svg.parentElement;
        if (!parent || parent.dataset.photoChecked === '1') return;
        const card = parent.parentElement;
        if (!card) return;
        const nameEl = card.querySelector('div:last-child, span:last-child, strong');
        const name = (nameEl?.textContent || '').trim();
        const key = cleanKey(name);
        if (!key || key.length < 3) return;

        const cachedUrl = INSTANT_MAP[key] || verifiedCutouts[key];
        if (cachedUrl) {
          parent.dataset.photoChecked = '1';
          parent.innerHTML = '<img src="' + cachedUrl + '" alt="' + name + '" decoding="async" loading="lazy" style="width:44px;height:44px;object-fit:cover;object-position:center top;border-radius:50%;display:block;margin:0 auto;" onerror="window.AFM_SafeImg&&window.AFM_SafeImg(this)" />';
        }
      });
    }
  };

  document.addEventListener('click', () => setTimeout(() => LineupRealPhotosInjector.hydrateVisibleAvatarsOnce(), 150));
  window.AFM_LineupPhotos = LineupRealPhotosInjector;
})(window);
