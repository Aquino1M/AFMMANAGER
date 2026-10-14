(function() {
  if (typeof window === 'undefined') return;
  if (window.__AFM_TURBO_OPTIMIZER_ACTIVE) return;
  window.__AFM_TURBO_OPTIMIZER_ACTIVE = true;

  // =========================================================================
  // 1. INICIALIZADOR WEBGPU (Hardware Acceleration de Alta Performance)
  // =========================================================================
  window.AFM_GPU = {
    supported: !!(typeof navigator !== 'undefined' && navigator.gpu),
    adapter: null,
    device: null,
    init: async function() {
      if (typeof navigator === 'undefined' || !navigator.gpu) return false;
      try {
        this.adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' });
        if (this.adapter) {
          this.device = await this.adapter.requestDevice();
          if (typeof document !== 'undefined' && document.documentElement) {
            document.documentElement.setAttribute('data-afm-gpu', 'webgpu-active');
          }
          console.log('⚡ [AFM Turbo] WebGPU High-Performance ativado na placa de vídeo!');
          return true;
        }
      } catch (e) {
        console.warn('[AFM Turbo] Fallback para WebGL/Canvas2D:', e);
      }
      return false;
    }
  };
  if (typeof window !== 'undefined' && window.AFM_GPU) {
    window.AFM_GPU.init();
  }

  // =========================================================================
  // 2. SAVE ASSÍNCRONO (Impede que JSON.stringify / localStorage trave cliques)
  // =========================================================================
  (function() {
    if (typeof Storage === 'undefined' || !Storage.prototype) return;
    var nativeSetItem = Storage.prototype.setItem;
    var nativeGetItem = Storage.prototype.getItem;
    var memoryCache = new Map();
    var pendingWrites = new Map();
    var flushTimer = null;

    var requestIdle = (typeof window !== 'undefined' && window.requestIdleCallback) || function(cb) { return setTimeout(cb, 50); };

    function flushStorageNow() {
      pendingWrites.forEach(function(val, key) {
        try { nativeSetItem.call(localStorage, key, val); } catch (e) {}
      });
      pendingWrites.clear();
      flushTimer = null;
    }

    Storage.prototype.getItem = function(key) {
      if (this === localStorage && memoryCache.has(key)) {
        return memoryCache.get(key);
      }
      return nativeGetItem.call(this, key);
    };

    Storage.prototype.setItem = function(key, value) {
      var strVal = String(value);
      if (this === localStorage) {
        memoryCache.set(key, strVal);
        // Se for um save grande (> 30KB), agenda a gravação em disco para quando a CPU estiver livre
        if (strVal.length > 30000) {
          pendingWrites.set(key, strVal);
          if (!flushTimer) {
            flushTimer = requestIdle(flushStorageNow, { timeout: 1200 });
          }
          return;
        }
      }
      try { nativeSetItem.call(this, key, strVal); } catch (e) {}
    };

    // Garante que nada seja perdido ao fechar ou recarregar a aba
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', flushStorageNow);
    }
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'hidden') flushStorageNow();
      });
    }
  })();

  // =========================================================================
  // 3. ESCUDO DE MUTATIONOBSERVER & SETINTERVAL (Zero Loop Infinito nas Abas)
  // =========================================================================
  (function() {
    if (typeof window === 'undefined') return;
    var NativeObserver = window.MutationObserver;
    var isProcessingDOM = false;
    var lastUserClickTime = 0;

    // Registra cliques do usuário para dar prioridade total à troca de aba
    if (typeof document !== 'undefined') {
      document.addEventListener('pointerdown', function() {
        lastUserClickTime = (typeof performance !== 'undefined' ? performance.now() : Date.now());
        if (typeof window.AFM_NormalizeStateArrays === 'function') {
          try { window.AFM_NormalizeStateArrays(); } catch (e) {}
        }
      }, true);
    }

    if (NativeObserver) {
      window.MutationObserver = function(callback) {
        var debounceTimer = null;
        var targetNode = null;
        var observeOpts = null;

        var instance = new NativeObserver(function(mutations, obs) {
          if (isProcessingDOM) return;
          if (debounceTimer) clearTimeout(debounceTimer);

          // Se o usuário acabou de clicar numa aba, espera a aba abrir primeiro antes de rodar scripts secundários
          var now = (typeof performance !== 'undefined' ? performance.now() : Date.now());
          var timeSinceClick = now - lastUserClickTime;
          var waitMs = timeSinceClick < 300 ? 220 : 140;

          debounceTimer = setTimeout(function() {
            if (isProcessingDOM) return;
            isProcessingDOM = true;
            try {
              instance.disconnect();
              if (typeof window.AFM_NormalizeStateArrays === 'function') window.AFM_NormalizeStateArrays();
              callback(mutations, obs);
            } catch (err) {
              console.warn('[AFM Turbo Observer]', err);
            } finally {
              var scheduleResume = (typeof requestAnimationFrame !== 'undefined') ? requestAnimationFrame : function(cb) { setTimeout(cb, 16); };
              scheduleResume(function() {
                isProcessingDOM = false;
                if (targetNode) {
                  try { instance.observe(targetNode, observeOpts); } catch (e) {}
                }
              });
            }
          }, waitMs);
        });

        return {
          observe: function(target, options) {
            targetNode = target || document.body;
            observeOpts = {
              childList: true,
              subtree: options ? !!options.subtree : true,
              attributes: false,
              characterData: false
            };
            try { instance.observe(targetNode, observeOpts); } catch (e) {}
          },
          disconnect: function() {
            if (debounceTimer) clearTimeout(debounceTimer);
            try { instance.disconnect(); } catch (e) {}
          },
          takeRecords: function() { return instance.takeRecords(); }
        };
      };
      window.MutationObserver.prototype = NativeObserver.prototype;
    }

    // Domestica intervalos rápidos para não rodarem no exato momento em que você clica em uma aba
    var nativeSetInterval = window.setInterval;
    window.setInterval = function(fn, delay) {
      var safeDelay = (typeof delay === 'number' && delay >= 250 && delay < 1500) ? 1800 : delay;
      var args = Array.prototype.slice.call(arguments, 2);
      return nativeSetInterval(function() {
        var now = (typeof performance !== 'undefined' ? performance.now() : Date.now());
        if (isProcessingDOM || (now - lastUserClickTime < 350)) return;
        try {
          if (typeof window.AFM_NormalizeStateArrays === 'function') window.AFM_NormalizeStateArrays();
          if (typeof fn === 'function') fn.apply(window, args);
        } catch (err) {
          console.warn('[AFM Turbo Interval]', err);
        }
      }, safeDelay);
    };
  })();

  // =========================================================================
  // 4. ACELERAÇÃO DE IMAGENS E ESCUDOS VIA GPU (Off-Thread Image Decoding)
  // =========================================================================
  function optimizeImagesInContainer(root) {
    if (!root || typeof root.querySelectorAll !== 'function') return;
    var imgs = root.querySelectorAll('img:not([data-afm-gpu-img])');
    for (var i = 0; i < imgs.length; i++) {
      var img = imgs[i];
      img.dataset.afmGpuImg = '1';
      img.decoding = 'async';
      if (!img.loading) img.loading = 'lazy';
    }
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('click', function() {
      var scheduleImg = (typeof requestAnimationFrame !== 'undefined') ? requestAnimationFrame : function(cb) { setTimeout(cb, 16); };
      scheduleImg(function() {
        optimizeImagesInContainer(document.getElementById('app'));
        if (typeof window.AFM_CleanBrokenTextOnce === 'function') {
          window.AFM_CleanBrokenTextOnce();
        }
      });
    }, true);

    window.addEventListener('DOMContentLoaded', function() {
      optimizeImagesInContainer(document.body);
    });
  }
})();
