// =========================================================================
// AFM MANAGER 2026/2027 — PWA, FULLSCREEN & MODO HORIZONTAL (LANDSCAPE)
// Inspirado na interface mobile de Soccer Manager 2027 (SM27)
// =========================================================================

(function(){
  'use strict';

  // 1. Registro do Service Worker para suporte a PWA e Offline
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator && typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').then(reg => {
        console.log('[AFM PWA] Service Worker registrado com sucesso:', reg.scope);
      }).catch(err => {
        console.warn('[AFM PWA] Falha ao registrar Service Worker:', err);
      });
    });
  }

  // 2. Gerenciamento do Prompt de Instalação do PWA
  window.deferredInstallPrompt = null;
  if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      window.deferredInstallPrompt = e;
      console.log('[AFM PWA] Evento beforeinstallprompt capturado com sucesso.');
      
      // Revela e destaca os botões de instalação no app
      if (typeof document !== 'undefined') {
        document.querySelectorAll('.afm-btn-install-app').forEach(btn => {
          btn.style.display = 'inline-flex';
          btn.classList.add('pulse-install');
        });
      }
    });

    window.addEventListener('appinstalled', () => {
      window.deferredInstallPrompt = null;
      console.log('[AFM PWA] Aplicativo instalado no dispositivo!');
      if (typeof document !== 'undefined') {
        document.querySelectorAll('.afm-btn-install-app').forEach(btn => {
          btn.classList.remove('pulse-install');
          btn.style.opacity = '0.5';
          btn.title = 'Aplicativo Já Instalado';
        });
      }
    });
  }

  // Função global de instalação do app
  window.installAFMApp = async function() {
    if (window.deferredInstallPrompt) {
      try {
        window.deferredInstallPrompt.prompt();
        const choice = await window.deferredInstallPrompt.userChoice;
        console.log('[AFM PWA] Escolha do usuário na instalação:', choice.outcome);
        if (choice.outcome === 'accepted') {
          window.deferredInstallPrompt = null;
        }
      } catch (err) {
        console.warn('[AFM PWA] Erro ao disparar prompt de instalação:', err);
        window.showAFMInstallHelpModal();
      }
    } else {
      window.showAFMInstallHelpModal();
    }
  };

  // Modal explicativo de como instalar em qualquer plataforma (Android, iOS e PC)
  window.showAFMInstallHelpModal = function() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.matchMedia('(display-mode: fullscreen)').matches || window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

    if (isStandalone) {
      if (typeof window.showCustomAlert === 'function') {
        window.showCustomAlert({ title: 'AFM Manager Instalado', message: '⚽ O AFM Manager já está instalado e rodando em modo aplicativo!', type: 'success' });
      } else if (typeof window.toast === 'function') {
        window.toast('⚽ O AFM Manager já está instalado e rodando em modo aplicativo!');
      }
      return;
    }

    const modalHtml = `
      <div id="afmInstallModal" class="afm-modal-overlay" style="position:fixed;inset:0;background:rgba(0,0,0,0.85);backdrop-filter:blur(10px);z-index:9999999;display:flex;align-items:center;justify-content:center;padding:16px;">
        <div class="afm-install-box" style="background:#0e0a1f;border:1.5px solid rgba(168,85,247,0.5);border-radius:20px;max-width:480px;width:100%;padding:24px;color:#fff;box-shadow:0 0 40px rgba(124,58,237,0.4);position:relative;">
          <button type="button" id="btnCloseInstallModal" style="position:absolute;top:16px;right:16px;background:none;border:none;color:#94a3b8;font-size:22px;cursor:pointer;padding:4px;">✕</button>
          
          <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px;">
            <div style="width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,#7c3aed,#06b6d4);display:flex;align-items:center;justify-content:center;font-size:24px;box-shadow:0 0 15px rgba(124,58,237,0.6);">
              📲
            </div>
            <div>
              <h3 style="margin:0;font-size:18px;font-weight:900;letter-spacing:0.5px;">Instalar AFM Manager 2026</h3>
              <p style="margin:2px 0 0 0;font-size:12px;color:#a855f7;font-weight:700;">Modo Tela Cheia & Offline no Celular e PC</p>
            </div>
          </div>

          <div style="display:flex;flex-direction:column;gap:12px;font-size:13px;line-height:1.5;color:#e2e8f0;">
            ${isIOS ? `
              <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:12px;">
                <b style="color:#38bdf8;">📱 No iPhone / iPad (Safari):</b>
                <ol style="margin:6px 0 0 0;padding-left:20px;">
                  <li>Toque no botão de <b>Compartilhar</b> (ícone do quadrado com a seta <b>⎋</b>) na barra do Safari.</li>
                  <li>Role as opções e toque em <b>"Adicionar à Tela de Início"</b> (<b>➕</b>).</li>
                  <li>Toque em <b>Adicionar</b> no topo. Pronto! O jogo abrirá direto em tela cheia na horizontal!</li>
                </ol>
              </div>
            ` : `
              <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:12px;">
                <b style="color:#22c55e;">🤖 No Celular Android (Chrome / Edge):</b>
                <ol style="margin:6px 0 0 0;padding-left:20px;">
                  <li>Toque nos <b>três pontinhos (⋮)</b> no canto superior do navegador.</li>
                  <li>Selecione <b>"Instalar aplicativo"</b> ou <b>"Adicionar à tela inicial"</b>.</li>
                  <li>Confirme a instalação. O jogo ficará sem barra de navegação, ocupando 100% da tela!</li>
                </ol>
              </div>

              <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:12px;">
                <b style="color:#a855f7;">💻 No Computador (Windows / Mac):</b>
                <ol style="margin:6px 0 0 0;padding-left:20px;">
                  <li>Clique no ícone de <b>computador com seta para baixo (⊞)</b> no lado direito da barra de endereços do Chrome ou Edge.</li>
                  <li>Clique em <b>"Instalar"</b> para criar a janela de jogo exclusiva.</li>
                  <li>Você também pode pressionar <b>F11</b> a qualquer momento para entrar no modo Tela Cheia!</li>
                </ol>
              </div>
            `}
          </div>

          <div style="margin-top:20px;display:flex;gap:10px;">
            <button type="button" class="btn primary" id="btnConfirmFullscreenAction" style="flex:1;padding:12px;font-weight:900;border-radius:10px;font-size:13px;">
              ⛶ Ativar Tela Cheia Agora
            </button>
            <button type="button" class="btn" id="btnDismissInstallModal" style="padding:12px 18px;border-radius:10px;font-size:13px;">
              Entendido
            </button>
          </div>
        </div>
      </div>
    `;

    // Remove modal anterior se houver
    const oldModal = document.getElementById('afmInstallModal');
    if (oldModal) oldModal.remove();

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    document.getElementById('btnCloseInstallModal')?.addEventListener('click', () => {
      document.getElementById('afmInstallModal')?.remove();
    });
    document.getElementById('btnDismissInstallModal')?.addEventListener('click', () => {
      document.getElementById('afmInstallModal')?.remove();
    });
    document.getElementById('btnConfirmFullscreenAction')?.addEventListener('click', () => {
      document.getElementById('afmInstallModal')?.remove();
      window.toggleAFMFullscreen();
    });
  };

  // 3. Gerenciamento do Modo Tela Cheia (Fullscreen API no Mobile & PC)
  window.toggleAFMFullscreen = function() {
    const doc = document;
    const docEl = doc.documentElement;
    const isFs = doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement;

    if (!isFs) {
      const req = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.mozRequestFullScreen || docEl.msRequestFullscreen;
      if (req) {
        req.call(docEl).then(() => {
          // Tenta travar a orientação em paisagem (landscape) no mobile
          if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('landscape').catch(() => {});
          }
        }).catch(err => {
          console.log('[AFM Fullscreen] Erro ao entrar em tela cheia:', err);
        });
      }
    } else {
      const exit = doc.exitFullscreen || doc.webkitExitFullscreen || doc.mozCancelFullScreen || doc.msExitFullscreen;
      if (exit) {
        exit.call(doc).catch(err => {
          console.log('[AFM Fullscreen] Erro ao sair da tela cheia:', err);
        });
      }
    }
  };

  // Sincroniza ícones de tela cheia
  function syncFullscreenIcons() {
    const isFs = Boolean(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
    document.querySelectorAll('.afm-btn-fullscreen, #btnTopFullscreen').forEach(btn => {
      const iconSpan = btn.querySelector('.fullscreen-icon');
      if (iconSpan) {
        iconSpan.textContent = isFs ? '🗗' : '⛶';
      }
      btn.title = isFs ? 'Sair da Tela Cheia' : 'Entrar em Tela Cheia (Mobile & PC)';
    });
  }
  if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
    document.addEventListener('fullscreenchange', syncFullscreenIcons);
    document.addEventListener('webkitfullscreenchange', syncFullscreenIcons);
  }

  // 4. Modo Horizontal Estrito (Landscape Enforcer & Orientation Guard)
  // Cria o overlay se ele não estiver no HTML
  function ensureOrientationGuardDOM() {
    if (!document || !document.body) return;
    if (document.getElementById('afmOrientationGuard')) return;

    const guardHtml = `
      <div id="afmOrientationGuard" class="afm-orientation-guard">
        <div class="afm-guard-box">
          <div class="afm-phone-anim">
            <div class="afm-phone-inner">
              <div class="afm-phone-screen">⚽</div>
            </div>
          </div>
          <h2 class="afm-guard-title">Gire o Aparelho</h2>
          <div class="afm-guard-tag">MODO HORIZONTAL · SOCCER MANAGER STYLE</div>
          <p class="afm-guard-desc">
            O <b>AFM Manager 2026</b> foi desenvolvido para ser jogado exclusivamente na <b>horizontal</b> (modo paisagem), proporcionando a melhor visão tática do campo e dos cards de gestão.
          </p>
          <div style="display:flex;gap:10px;justify-content:center;margin-top:16px;flex-wrap:wrap;">
            <button type="button" class="btn primary afm-guard-btn" onclick="window.toggleAFMFullscreen()">
              ⛶ Ativar Tela Cheia Horizontal
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('afterbegin', guardHtml);
  }

  // =========================================================================
  // 4.5. DETECTOR E SEPARADOR DE PLATAFORMAS (PC vs MOBILE)
  // Permite separar 100% o jogo: layout, menus, escalas táticas e cards
  // =========================================================================
  const AFM_Platform = {
    getPreference() {
      try {
        return localStorage.getItem('afm_platform_mode') || 'auto';
      } catch (e) {
        return 'auto';
      }
    },
    setPreference(mode) {
      try {
        if (mode === 'pc' || mode === 'mobile') {
          localStorage.setItem('afm_platform_mode', mode);
        } else {
          localStorage.removeItem('afm_platform_mode');
        }
      } catch (e) {}
      this.syncClasses();
    },
    detectDeviceIsMobile() {
      if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
      const ua = (navigator.userAgent || navigator.vendor || window.opera || '').toLowerCase();
      const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet/i;
      const hasTouch = (navigator.maxTouchPoints && navigator.maxTouchPoints > 1) || ('ontouchstart' in window);
      const isCoarse = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
      const isNarrow = window.innerWidth <= 1024;
      
      // Se for dispositivo móvel típico por UA
      if (mobileRegex.test(ua)) return true;
      // Se tiver toque e largura <= 1024px
      if (hasTouch && isNarrow) return true;
      // Se for tela menor ou igual a 1024px com ponteiro impreciso/touch
      if (isCoarse && isNarrow) return true;
      // Se estiver em modo paisagem com altura baixa (típico celular)
      if (window.innerHeight <= 520 && isNarrow) return true;
      
      return false;
    },
    isMobile() {
      const pref = this.getPreference();
      if (pref === 'mobile') return true;
      if (pref === 'pc') return false;
      return this.detectDeviceIsMobile();
    },
    isPC() {
      return !this.isMobile();
    },
    syncClasses() {
      if (typeof document === 'undefined') return;
      const isMob = this.isMobile();
      const root = document.documentElement;
      const body = document.body;
      
      if (isMob) {
        root.classList.remove('platform-pc');
        root.classList.add('platform-mobile');
        if (body) {
          body.classList.remove('platform-pc');
          body.classList.add('platform-mobile');
        }
      } else {
        root.classList.remove('platform-mobile');
        root.classList.add('platform-pc');
        if (body) {
          body.classList.remove('platform-mobile');
          body.classList.add('platform-pc');
        }
      }
    }
  };
  window.AFM_Platform = AFM_Platform;

  // Sincroniza classes imediatamente
  try {
    AFM_Platform.syncClasses();
  } catch(e) {}

  // 5. Drawer / Menu Lateral Deslizante Mobile vs Menu Fixo no PC
  function isAFMMobileViewport() {
    return AFM_Platform.isMobile();
  }
  window.isAFMMobileViewport = isAFMMobileViewport;

  let lastAFMDrawerToggleTs = 0;
  window.toggleAFMMobileDrawer = function(forceState) {
    const drawer = document.getElementById('afmSideDrawer');
    const backdrop = document.getElementById('afmDrawerBackdrop');
    if (!drawer) return;

    // No PC (Desktop >= 1025px), o menu lateral é sempre estático e fixo na grade do layout
    if (!isAFMMobileViewport()) {
      drawer.classList.remove('drawer-open');
      if (drawer.style) {
        drawer.style.transform = '';
        drawer.style.webkitTransform = '';
        drawer.style.display = '';
        drawer.style.visibility = '';
        drawer.style.pointerEvents = '';
        drawer.style.zIndex = '';
        drawer.style.position = '';
      }
      if (backdrop) {
        backdrop.classList.remove('active');
        if (backdrop.style) {
          backdrop.style.opacity = '';
          backdrop.style.pointerEvents = '';
          backdrop.style.display = 'none';
          backdrop.style.zIndex = '';
        }
      }
      return;
    }

    const now = Date.now();
    // Previne duplo disparo acidental entre touch e click
    if (typeof forceState !== 'boolean') {
      if (now - lastAFMDrawerToggleTs < 160) {
        return;
      }
      lastAFMDrawerToggleTs = now;
    }

    const willOpen = (typeof forceState === 'boolean') ? forceState : !drawer.classList.contains('drawer-open');
    if (willOpen) {
      drawer.classList.add('drawer-open');
      if (drawer.style) {
        drawer.style.transform = 'translateX(0)';
        drawer.style.webkitTransform = 'translateX(0)';
        drawer.style.display = 'flex';
        drawer.style.visibility = 'visible';
        drawer.style.pointerEvents = 'auto';
        drawer.style.zIndex = '1200';
      }
      if (backdrop) {
        backdrop.classList.add('active');
        if (backdrop.style) {
          backdrop.style.opacity = '1';
          backdrop.style.pointerEvents = 'auto';
          backdrop.style.display = 'block';
          backdrop.style.zIndex = '1199';
        }
      }
    } else {
      drawer.classList.remove('drawer-open');
      if (drawer.style) {
        drawer.style.transform = '';
        drawer.style.webkitTransform = '';
        drawer.style.display = '';
        drawer.style.visibility = '';
        drawer.style.pointerEvents = '';
        drawer.style.zIndex = '';
      }
      if (backdrop) {
        backdrop.classList.remove('active');
        if (backdrop.style) {
          backdrop.style.opacity = '';
          backdrop.style.pointerEvents = '';
          backdrop.style.display = '';
          backdrop.style.zIndex = '';
        }
      }
    }
  };

  // Observador de Redimensionamento: garante limpeza imediata ao alternar entre PC e Mobile
  if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    const handleViewportChange = () => {
      if (window.AFM_Platform && typeof window.AFM_Platform.syncClasses === 'function') {
        window.AFM_Platform.syncClasses();
      }
      if (!isAFMMobileViewport()) {
        const drawer = document.getElementById('afmSideDrawer');
        const backdrop = document.getElementById('afmDrawerBackdrop');
        if (drawer) {
          drawer.classList.remove('drawer-open');
          if (drawer.style) {
            drawer.style.transform = '';
            drawer.style.webkitTransform = '';
            drawer.style.display = '';
            drawer.style.visibility = '';
            drawer.style.pointerEvents = '';
            drawer.style.zIndex = '';
            drawer.style.position = '';
          }
        }
        if (backdrop) {
          backdrop.classList.remove('active');
          if (backdrop.style) {
            backdrop.style.opacity = '';
            backdrop.style.pointerEvents = '';
            backdrop.style.display = 'none';
          }
        }
      }
    };

    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('orientationchange', handleViewportChange);
    if (typeof document !== 'undefined') {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', handleViewportChange);
      } else {
        handleViewportChange();
      }
    }
  }

  // 6. Delegação Global de Eventos de Interação (Click e Touch)
  if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
    const handleDrawerInteraction = (e) => {
      // Abrir/Fechar Gaveta lateral pelo botão hambúrguer
      if (e.target.closest('#btnToggleSidebarDrawer')) {
        e.preventDefault();
        e.stopPropagation();
        window.toggleAFMMobileDrawer();
        return;
      }
      if (e.target.closest('#btnCloseMobileDrawer')) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof window.toggleAFMMobileDrawer === 'function') window.toggleAFMMobileDrawer(false);
        return;
      }
      if (e.target.closest('#mainMenuBtn') || e.target.closest('#btnExitToMainMenu')) {
        e.preventDefault();
        if (typeof window.toggleAFMMobileDrawer === 'function') window.toggleAFMMobileDrawer(false);
        if (typeof window.handleExitGameAction === 'function') {
          window.handleExitGameAction();
          return;
        }
        return;
      }
      if (e.target.closest('#afmDrawerBackdrop') || e.target.id === 'afmDrawerBackdrop') {
        e.preventDefault();
        window.toggleAFMMobileDrawer(false);
        return;
      }

      // Navegação infalível para qualquer item com data-view (Gaveta lateral ou Fita superior)
      const dataViewBtn = e.target.closest('[data-view]');
      if (dataViewBtn) {
        const nextView = dataViewBtn.getAttribute('data-view');
        if (nextView) {
          e.preventDefault();
          e.stopPropagation();
          if (nextView === 'admin') {
            if (typeof window.toggleAFMMobileDrawer === 'function') window.toggleAFMMobileDrawer(false);
            if (typeof window.openAdminModal === 'function') window.openAdminModal();
            return;
          }
          if (typeof window.setGameView === 'function') {
            window.setGameView(nextView);
          } else if (typeof window.setView === 'function') {
            window.setView(nextView);
          } else {
            window.view = nextView;
          }
          if (typeof window.toggleAFMMobileDrawer === 'function') {
            window.toggleAFMMobileDrawer(false);
          }
          const drawer = document.getElementById('afmSideDrawer');
          if (drawer) drawer.classList.remove('drawer-open');
          const backdrop = document.getElementById('afmDrawerBackdrop');
          if (backdrop) backdrop.classList.remove('active');
          if (typeof window.render === 'function') window.render();
          return;
        }
      }

      // Botão de Tela Cheia
      if (e.target.closest('.afm-btn-fullscreen') || e.target.closest('#btnTopFullscreen')) {
        e.preventDefault();
        window.toggleAFMFullscreen();
        return;
      }

      // Botão de Instalar App
      if (e.target.closest('.afm-btn-install-app') || e.target.closest('#btnTopInstallApp')) {
        e.preventDefault();
        window.installAFMApp();
        return;
      }

      // Botão de Licenças e Cursos (Acessível na Carreira e em Instalações/Casa)
      if (e.target.closest('#btnOpenCbfLicensesFromHouse') || e.target.closest('#btn-open-cbf-licenses')) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof window.openLicensesModal === 'function') {
          window.openLicensesModal();
        } else if (window.AFM_LicensesModal && typeof window.AFM_LicensesModal.open === 'function') {
          window.AFM_LicensesModal.open();
        }
        return;
      }

      // Botão Loja
      if (e.target.closest('#btnTopStore')) {
        e.preventDefault();
        try {
          if (typeof window.openStoreComingSoonModal === 'function') {
            window.openStoreComingSoonModal();
            return;
          }
        } catch (errStore) {
          console.warn('Erro ao abrir modal de loja:', errStore);
        }
        if (typeof window.view !== 'undefined') {
          window.view = 'escritorio';
          if (typeof window.render === 'function') window.render();
        }
        return;
      }

      // Botão Ajuda
      if (e.target.closest('#btnTopHelp')) {
        e.preventDefault();
        try {
          if (typeof window.openGameHelpTutorialModal === 'function') {
            window.openGameHelpTutorialModal();
            return;
          }
        } catch (errHelp) {
          console.warn('Erro ao abrir modal de ajuda:', errHelp);
        }
        if (typeof window.view !== 'undefined') {
          window.view = 'novidades';
          if (typeof window.render === 'function') window.render();
        }
        return;
      }

      // Alternância de Abas de Competições na Central (Estadual, Copa, Continental)
      if (e.target.closest('.btn-central-cup-tab')) {
        const btn = e.target.closest('.btn-central-cup-tab');
        if (btn && btn.dataset && btn.dataset.tabId && window.state) {
          e.preventDefault();
          window.state.centralCupTab = btn.dataset.tabId;
          if (typeof window.render === 'function') window.render();
          return;
        }
      }

      if (e.target.closest('#btnGoToEstadualTableFromCentral')) {
        e.preventDefault();
        if (typeof window.view !== 'undefined') {
          const mShips = (typeof window.getSavedSeasonMemberships === 'function') ? window.getSavedSeasonMemberships(window.state?.club) : null;
          window.view = 'calendario';
          if (mShips?.stateId) window.calendarFilter = mShips.stateId;
          if (typeof window.render === 'function') window.render();
        }
        return;
      }

      // Botão CONTINUAR (Soccer Manager 2027 style)
      if (e.target.closest('#btnHeaderContinue')) {
        e.preventDefault();
        try {
          if (typeof window.handleHeaderContinueAction === 'function') {
            window.handleHeaderContinueAction();
            return;
          }
          if (typeof window.openMatchActionModal === 'function') {
            window.openMatchActionModal();
            return;
          }
          if (typeof window.canStartMatch === 'function') {
            const gate = window.canStartMatch();
            if (gate.ok || gate.canStart) {
              if (typeof window.startLiveMatch === 'function') window.startLiveMatch();
              return;
            }
          }
          if (window.AFM_CalendarFix && typeof window.AFM_CalendarFix.advanceToNextMatchGuaranteed === 'function' && window.state) {
            window.AFM_CalendarFix.advanceToNextMatchGuaranteed(window.state);
          } else if (typeof window.advanceCalendarDays === 'function') {
            window.advanceCalendarDays(1, true);
          }
        } catch (err) {
          console.warn('[AFM Continue] Erro ao avançar pelo botão Continuar:', err);
        }
        return;
      }
    };

    document.addEventListener('click', handleDrawerInteraction);
    document.addEventListener('touchend', (e) => {
      if (e.target.closest('#btnToggleSidebarDrawer') || e.target.closest('#btnCloseMobileDrawer') || e.target.closest('#afmDrawerBackdrop') || e.target.closest('[data-view]')) {
        handleDrawerInteraction(e);
      }
    }, { passive: false });
  }

  if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
    // Fecha o menu lateral com a tecla ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        window.toggleAFMMobileDrawer(false);
        const modal = document.getElementById('afmInstallModal');
        if (modal) modal.remove();
      }
    });

    // Inicialização no DOM Ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', ensureOrientationGuardDOM);
    } else {
      ensureOrientationGuardDOM();
    }
  }

  // Tenta travar orientação na primeira interação do usuário se for touchscreen
  if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    window.addEventListener('touchstart', function onFirstTouch() {
      if (typeof screen !== 'undefined' && screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('landscape').catch(() => {});
      }
      window.removeEventListener('touchstart', onFirstTouch);
    }, { passive: true });
  }

})();
