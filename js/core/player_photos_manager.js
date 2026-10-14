// ==============================================================================
// AFM MANAGER 2027 — GERENCIADOR DE FOTOS REAIS DE JOGADORES (OTIMIZADO)
// Arquivo: js/core/player_photos_manager.js
// BLOCO 03 — Lazy loading, recorte circular facial e fallback inteligente
// ==============================================================================

(function (window) {
  'use strict';

  const PlayerPhotosManager = {
    resolvePlayerPhotoUrl(player) {
      if (!player) return '';
      if (player.photoUrl && player.photoUrl.trim() !== '') return player.photoUrl;
      if (player.faceUrl && player.faceUrl.trim() !== '') return player.faceUrl;
      const id = player.id || player.playerId;
      return `img/players/${id}.webp`;
    },

    // Gera retrato estilizado realista com a camisa oficial do clube apenas se o jogador nao tiver foto local
    generateRealisticKitSilhouette(player, clubColors = ['#10b981', '#ffffff']) {
      const primary = (Array.isArray(clubColors) && clubColors[0]) ? clubColors[0] : '#5b21b6';
      const secondary = (Array.isArray(clubColors) && clubColors[1]) ? clubColors[1] : '#ffffff';
      const number = player?.shirtNumber || player?.number || 10;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#0f172a"/><stop offset="100%" stop-color="#1e293b"/>
          </linearGradient>
        </defs>
        <circle cx="48" cy="48" r="46" fill="url(#bg)" stroke="${primary}" stroke-width="3"/>
        <path d="M22 86 C22 64 74 64 74 86 Z" fill="${primary}" stroke="${secondary}" stroke-width="2"/>
        <circle cx="48" cy="36" r="16" fill="#e2b897"/>
        <path d="M32 32 C32 18 64 18 64 32 C60 26 36 26 32 32 Z" fill="#1e1b18"/>
        <text x="48" y="82" font-family="Inter,Arial,sans-serif" font-size="13" font-weight="900" fill="${secondary}" text-anchor="middle">${number}</text>
      </svg>`;
      return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
    },

    bindPlayerPhotoElement(imgEl, player, clubColors) {
      if (!imgEl || !player) return;
      imgEl.loading = 'lazy';
      imgEl.decoding = 'async';
      if (imgEl.style) {
        imgEl.style.objectFit = 'cover';
        imgEl.style.objectPosition = 'center top';
        imgEl.style.borderRadius = '50%';
      }

      const id = player.id || player.playerId;
      imgEl.dataset.step = '0';
      imgEl.src = this.resolvePlayerPhotoUrl(player);

      imgEl.onerror = () => {
        const step = parseInt(imgEl.dataset.step || '0', 10);
        if (step === 0) {
          imgEl.dataset.step = '1';
          imgEl.src = `img/players/${id}.png`;
        } else if (step === 1) {
          imgEl.dataset.step = '2';
          imgEl.src = `img/players/${id}.jpg`;
        } else {
          imgEl.onerror = null;
          imgEl.src = this.generateRealisticKitSilhouette(player, clubColors);
        }
      };
    }
  };

  window.AFM_PlayerPhotos = PlayerPhotosManager;
})(typeof window !== 'undefined' ? window : global);
