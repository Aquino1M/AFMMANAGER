(function (window) {
  'use strict';

  const GlobalUIEnhancer = {
    initKeyboardShortcuts() {
      window.addEventListener('keydown', (e) => {
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target?.tagName || '').toUpperCase())) return;

        // Barra de espaço: Pausa / Retoma partida ao vivo
        if (e.code === 'Space' && window.AFM_LiveMatchHUD) {
          e.preventDefault();
          window.AFM_LiveMatchHUD.isPaused = !window.AFM_LiveMatchHUD.isPaused;
          if (typeof window.toast === 'function') {
            window.toast(window.AFM_LiveMatchHUD.isPaused ? '⏸️ Partida Pausada' : '▶️ Partida em Andamento');
          }
        }
        // Tecla 1: Velocidade 1x
        else if (e.key === '1' && window.AFM_LiveMatchHUD) {
          window.AFM_LiveMatchHUD.setSpeed(1);
          if (typeof window.toast === 'function') window.toast('⚡ Velocidade: 1x (Normal)');
        }
        // Tecla 2: Velocidade 20x
        else if (e.key === '2' && window.AFM_LiveMatchHUD) {
          window.AFM_LiveMatchHUD.setSpeed(20);
          if (typeof window.toast === 'function') window.toast('⚡ Velocidade: 20x (Rápida)');
        }
        // Tecla 3: Velocidade 40x
        else if (e.key === '3' && window.AFM_LiveMatchHUD) {
          window.AFM_LiveMatchHUD.setSpeed(40);
          if (typeof window.toast === 'function') window.toast('⚡ Velocidade: 40x (Ultra)');
        }
        // Tecla S: Salvar jogo
        else if ((e.key === 's' || e.key === 'S') && !e.ctrlKey && !e.metaKey) {
          const quickSaveBtn = document.getElementById('quickSaveBtn');
          if (quickSaveBtn) quickSaveBtn.click();
        }
        // Tecla Esc: Fechar modal aberto
        else if (e.key === 'Escape') {
          const customModal = document.getElementById('customModal');
          if (customModal && customModal.style.display !== 'none') {
            if (typeof window.closeCustomModal === 'function') window.closeCustomModal();
          }
        }
        // Ctrl+K: Pesquisa rápida no mercado
        else if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
          e.preventDefault();
          const btnMarket = document.querySelector('[data-view="mercado"]');
          if (btnMarket) btnMarket.click();
        }
      });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => GlobalUIEnhancer.initKeyboardShortcuts());
  } else {
    GlobalUIEnhancer.initKeyboardShortcuts();
  }

  window.AFM_UIEnhancer = GlobalUIEnhancer;
})(window);
