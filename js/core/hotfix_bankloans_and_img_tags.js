// ==============================================================================
// AFM MANAGER 2027 — HOTFIX BANKLOANS & CORRUPTED IMG TAGS (MODO ULTRALEVE)
// Arquivo: js/core/hotfix_bankloans_and_img_tags.js
// ==============================================================================

(function (window) {
  'use strict';

  if (window.__AFM_HOTFIX_LIGHT_LOADED) return;
  window.__AFM_HOTFIX_LIGHT_LOADED = true;

  // 1. Imagem Segura Global
  window.AFM_SafeImg = function (imgEl, customAbbr) {
    if (!imgEl || imgEl.dataset?.fallbackApplied) return;
    imgEl.dataset.fallbackApplied = '1';
    imgEl.onerror = null;
    const abbr = String(customAbbr || imgEl.dataset?.abbr || imgEl.alt || 'FC')
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 3)
      .toUpperCase() || 'FC';

    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'>` +
      `<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>` +
      `<stop offset='0%' stop-color='#6d28d9'/><stop offset='100%' stop-color='#1e1b4b'/>` +
      `</linearGradient></defs>` +
      `<path d='M32 4 L56 14 V32 C56 47 32 58 32 60 C32 58 8 47 8 32 V14 Z' fill='url(#g)' stroke='#a78bfa' stroke-width='2'/>` +
      `<text x='32' y='37' font-family='Arial,sans-serif' font-size='14' font-weight='bold' fill='#ffffff' text-anchor='middle'>${abbr}</text>` +
      `</svg>`;

    imgEl.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  };

  // 2. Normalizador de Estado para NUNCA travar Escritório, Estádio, Carreira ou Temporada
  window.AFM_NormalizeStateArrays = function (stateParam) {
    var st = stateParam || window.state || window.gameState || (window.AFM && window.AFM.state);
    if (!st || typeof st !== 'object') return;
    var arrayKeys = ['bankLoans', 'loans', 'news', 'history', 'seasonHistory', 'trophies', 'offers', 'inbox', 'sponsors'];
    for (var i = 0; i < arrayKeys.length; i++) {
      var k = arrayKeys[i];
      if (st[k] !== undefined && !Array.isArray(st[k])) {
        if (st[k] && typeof st[k] === 'object') {
          var vals = Array.isArray(st[k].activeLoans) ? st[k].activeLoans : Object.values(st[k]).filter(function (x) { return x && typeof x === 'object'; });
          st[k] = vals;
        } else {
          st[k] = [];
        }
      } else if (st[k] === undefined && (k === 'bankLoans' || k === 'loans')) {
        st[k] = [];
      }
    }
    if (st.finances && typeof st.finances === 'object' && !Array.isArray(st.finances.bankLoans)) {
      st.finances.bankLoans = Array.isArray(st.bankLoans) ? st.bankLoans : [];
    }
  };

  // Normalizador específico para compatibilidade com chamadores de AFM_NormalizeBankLoans
  window.AFM_NormalizeBankLoans = function (state) {
    if (!state) return;
    if (!Array.isArray(state.bankLoans)) {
      const recovered = Array.isArray(state.bankLoans?.activeLoans) ? state.bankLoans.activeLoans : [];
      state.bankLoansMeta = {
        lastProcessedPeriod: state.bankLoans?.lastProcessedPeriod || null,
        creditScore: state.bankLoans?.creditScore || 'AA',
        creditLimit: state.bankLoans?.creditLimit || 5000000
      };
      state.bankLoans = recovered;
    }
    window.AFM_NormalizeStateArrays(state);
  };

  // 3. Polyfill de Blindagem: se algum save já salvo no localStorage tiver bankLoans como Objeto,
  // delega .reduce(), .some(), .filter(), .map() e .forEach() para activeLoans sem travar a aba!
  ['reduce', 'some', 'filter', 'map', 'forEach', 'find'].forEach(function (method) {
    if (!Object.prototype[method]) {
      Object.defineProperty(Object.prototype, method, {
        value: function (...args) {
          const arr = Array.isArray(this) ? this : (Array.isArray(this?.activeLoans) ? this.activeLoans : Object.values(this || {}));
          return Array.prototype[method].apply(arr, args);
        },
        enumerable: false,
        configurable: true,
        writable: true
      });
    }
  });

  // 4. Limpeza leve sob demanda (apenas 1x sob demanda ou após troca de aba, sem MutationObserver infinito)
  window.AFM_CleanBrokenTextOnce = function (root) {
    var container = root || document.getElementById('app') || document.body;
    if (!container || typeof document === 'undefined') return;
    if (window.AFM_NormalizeStateArrays) window.AFM_NormalizeStateArrays();

    try {
      var walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
      var node;
      var nodesToClean = [];
      while ((node = walker.nextNode())) {
        var val = node.nodeValue;
        if (val && (val.indexOf("';}\"") !== -1 || val.indexOf('onerror=') !== -1 || /[A-Z]{2,4}\s*\/>/.test(val))) {
          nodesToClean.push(node);
        }
      }
      nodesToClean.forEach(function (n) {
        n.nodeValue = n.nodeValue
          .replace(/onerror="[^"]*"/g, '')
          .replace(/[A-Za-z0-9_-]{0,6}\s*(<\/text><\/svg>)?\s*';\}"\s*\/>/g, '')
          .replace(/';\}"\s*\/>/g, '')
          .replace(/[A-Z]{2,4}\s*\/>/g, '')
          .replace(/\/>/g, '');
      });
    } catch (e) {}
  };

  window.AFM_SweepCorruptedTags = window.AFM_CleanBrokenTextOnce;

  // Executa apenas uma vez no carregamento, SEM MutationObserver em loop
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { window.AFM_CleanBrokenTextOnce(); });
    } else {
      window.AFM_CleanBrokenTextOnce();
    }
  }
})(typeof window !== 'undefined' ? window : global);
