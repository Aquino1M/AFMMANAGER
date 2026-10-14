// ==============================================================================
// AFM MANAGER 2027 — CORRECAO DE LOGOS (RESTAURADOR LEVE DE ESCUDOS)
// Arquivo: js/core/badge_svg_restorer.js
// ==============================================================================

(function (window) {
  'use strict';

  const BadgeSvgRestorer = {
    // Normaliza o slug do clube para encontrar o SVG/PNG correto sem erro de acento
    normalizeSlug(name = '') {
      return String(name)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/\.([a-z0-9])/g, '$1')
        .replace(/\./g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    },

    // Versão leve e instantânea: protege o visual da logo sem travar a CPU com Flood-Fill BFS síncrono
    restoreInnerWhiteOfBadge(imgElement) {
      if (!imgElement || imgElement.dataset?.restored === '1') return;
      imgElement.dataset.restored = '1';
      if (imgElement.style) {
        imgElement.style.objectFit = 'contain';
        imgElement.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.45))';
      }
    },

    // Tratamento passivo de erro de imagem sem MutationObserver agressivo
    initAutoBadgeObserver() {
      if (typeof document !== 'undefined') {
        document.addEventListener('error', function (e) {
          var t = e.target;
          if (t && t.tagName === 'IMG' && !t.dataset.fallbackApplied) {
            if (typeof window.AFM_SafeImg === 'function') window.AFM_SafeImg(t);
          }
        }, true);
      }
    }
  };

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => BadgeSvgRestorer.initAutoBadgeObserver());
    } else {
      BadgeSvgRestorer.initAutoBadgeObserver();
    }
  }

  window.AFM_BadgeRestorer = BadgeSvgRestorer;
})(typeof window !== 'undefined' ? window : global);
