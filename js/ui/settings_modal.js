/**
 * ==============================================================================
 * AFM MANAGER 2027 — INTERFACE DE CONFIGURAÇÕES DE ÁUDIO & PREFERÊNCIAS
 * Arquivo: js/ui/settings_modal.js
 * 
 * Componente visual modular para gerenciamento de áudio (Torcida e SFX),
 * testes de som em tempo real e integração com o AFMAudioManager.
 * ==============================================================================
 */

window.AFMSettingsUI = {
  /**
   * Retorna o HTML do card de configuração de áudio com design neon e controles deslizantes.
   */
  renderAudioSettingsCard() {
    const audio = window.afmAudio || (window.AFMAudioManager ? new window.AFMAudioManager() : null);
    const crowdOn = audio ? audio.isCrowdAudioEnabled() : true;
    const sfxOn = audio ? audio.isSFXAudioEnabled() : true;
    const crowdVol = audio ? Math.round(audio.getCrowdVolume() * 100) : 35;
    const sfxVol = audio ? Math.round(audio.getSFXVolume() * 100) : 80;

    return `
      <div class="card" style="margin-top:16px;background:linear-gradient(180deg,rgba(15,23,42,0.95) 0%,rgba(30,41,59,0.85) 100%);border:1px solid rgba(56,189,248,0.25);border-radius:14px;padding:20px;box-shadow:0 8px 24px rgba(0,0,0,0.4)">
        <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:12px;margin-bottom:16px;flex-wrap:wrap;gap:8px">
          <div>
            <h3 style="margin:0;font-size:16px;font-weight:900;color:#38bdf8;display:flex;align-items:center;gap:8px">
              🔊 Sons & Ambientação do Estádio
            </h3>
            <div class="muted small" style="margin-top:2px">
              Ajuste canais independentes de efeitos da partida (SFX) e cantos reais das torcidas.
            </div>
          </div>
          <span class="badge success" style="font-size:11px;padding:4px 10px;font-weight:800">
            ✓ Motor de Áudio Ativo
          </span>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px">
          <!-- CANAL 1: TORCIDA & AMBIENTE -->
          <div style="background:rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:14px">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
              <span style="font-weight:800;font-size:14px;color:#f8fafc;display:flex;align-items:center;gap:6px">
                🏟️ Som da Torcida (Ambiente)
              </span>
              <label class="toggle-switch" style="position:relative;display:inline-block;width:44px;height:24px;cursor:pointer">
                <input type="checkbox" id="chkAudioCrowd" ${crowdOn ? 'checked' : ''} style="opacity:0;width:0;height:0">
                <span class="slider" style="position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background-color:${crowdOn ? '#22c55e' : '#475569'};transition:.3s;border-radius:24px"></span>
              </label>
            </div>
            <p class="muted small" style="margin:0 0 12px 0;line-height:1.4">
              Executa o canto oficial do clube mandante ou o caldeirão geral durante as partidas em loop.
            </p>
            <div style="display:flex;align-items:center;gap:12px">
              <span style="font-size:12px;color:#94a3b8;min-width:60px">Volume: <b id="valCrowdVol" style="color:#38bdf8">${crowdVol}%</b></span>
              <input type="range" id="rngCrowdVol" min="0" max="100" value="${crowdVol}" class="slider-range" style="flex:1;cursor:pointer" ${crowdOn ? '' : 'disabled'}>
            </div>
            <div style="margin-top:12px;display:flex;gap:8px">
              <button class="btn btn-sm" id="btnTestCrowdAudio" style="font-size:11px;padding:4px 10px;background:rgba(56,189,248,0.15);border:1px solid rgba(56,189,248,0.3);color:#7dd3fc" ${crowdOn ? '' : 'disabled'}>
                ▶ Testar Torcida
              </button>
            </div>
          </div>

          <!-- CANAL 2: EFEITOS SONOROS (SFX) -->
          <div style="background:rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:14px">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
              <span style="font-weight:800;font-size:14px;color:#f8fafc;display:flex;align-items:center;gap:6px">
                📢 Efeitos da Partida (SFX)
              </span>
              <label class="toggle-switch" style="position:relative;display:inline-block;width:44px;height:24px;cursor:pointer">
                <input type="checkbox" id="chkAudioSFX" ${sfxOn ? 'checked' : ''} style="opacity:0;width:0;height:0">
                <span class="slider" style="position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background-color:${sfxOn ? '#22c55e' : '#475569'};transition:.3s;border-radius:24px"></span>
              </label>
            </div>
            <p class="muted small" style="margin:0 0 12px 0;line-height:1.4">
              Apitores de início/fim, faltas, cartões, explosão de gol, bola na trave e reações de perigo.
            </p>
            <div style="display:flex;align-items:center;gap:12px">
              <span style="font-size:12px;color:#94a3b8;min-width:60px">Volume: <b id="valSFXVol" style="color:#38bdf8">${sfxVol}%</b></span>
              <input type="range" id="rngSFXVol" min="0" max="100" value="${sfxVol}" class="slider-range" style="flex:1;cursor:pointer" ${sfxOn ? '' : 'disabled'}>
            </div>
            <div style="margin-top:12px;display:flex;gap:6px;flex-wrap:wrap">
              <button class="btn btn-sm" id="btnTestWhistle" style="font-size:11px;padding:4px 8px;background:rgba(250,204,21,0.15);border:1px solid rgba(250,204,21,0.3);color:#fde047" ${sfxOn ? '' : 'disabled'}>
                ▶ Apito
              </button>
              <button class="btn btn-sm" id="btnTestGoal" style="font-size:11px;padding:4px 8px;background:rgba(34,197,94,0.15);border:1px solid rgba(34,197,94,0.3);color:#86efac" ${sfxOn ? '' : 'disabled'}>
                ▶ Gol
              </button>
              <button class="btn btn-sm" id="btnTestPost" style="font-size:11px;padding:4px 8px;background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.3);color:#fca5a5" ${sfxOn ? '' : 'disabled'}>
                ▶ Trave
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Conecta os eventos dos toggles e sliders ao AFMAudioManager
   */
  bindAudioSettingsEvents() {
    const audio = window.afmAudio;
    if (!audio) return;

    // Toggle Torcida
    const chkCrowd = document.getElementById('chkAudioCrowd');
    const rngCrowd = document.getElementById('rngCrowdVol');
    const lblCrowd = document.getElementById('valCrowdVol');
    const btnTestCrowd = document.getElementById('btnTestCrowdAudio');

    if (chkCrowd) {
      chkCrowd.onchange = () => {
        const enabled = audio.toggleCrowdAudio(chkCrowd.checked);
        if (rngCrowd) rngCrowd.disabled = !enabled;
        if (btnTestCrowd) btnTestCrowd.disabled = !enabled;
        const sliderSpan = chkCrowd.parentElement?.querySelector('.slider');
        if (sliderSpan) sliderSpan.style.backgroundColor = enabled ? '#22c55e' : '#475569';
        if (typeof window.toast === 'function') {
          window.toast(enabled ? 'Som da torcida ativado!' : 'Som da torcida desativado!');
        }
      };
    }

    if (rngCrowd) {
      rngCrowd.oninput = () => {
        const vol = parseInt(rngCrowd.value, 10) / 100;
        audio.setCrowdVolume(vol);
        if (lblCrowd) lblCrowd.textContent = `${rngCrowd.value}%`;
      };
    }

    if (btnTestCrowd) {
      let isTesting = false;
      btnTestCrowd.onclick = () => {
        if (!isTesting) {
          isTesting = true;
          btnTestCrowd.textContent = '⏹ Parar Teste';
          const sampleClub = (window.state && window.state.club) || 'flamengo';
          audio.startCrowdAmbient(sampleClub, 'bra-a');
          setTimeout(() => {
            if (isTesting) {
              isTesting = false;
              btnTestCrowd.textContent = '▶ Testar Torcida';
              audio.stopCrowdAmbient();
            }
          }, 4000);
        } else {
          isTesting = false;
          btnTestCrowd.textContent = '▶ Testar Torcida';
          audio.stopCrowdAmbient();
        }
      };
    }

    // Toggle SFX
    const chkSFX = document.getElementById('chkAudioSFX');
    const rngSFX = document.getElementById('rngSFXVol');
    const lblSFX = document.getElementById('valSFXVol');
    const btnWhistle = document.getElementById('btnTestWhistle');
    const btnGoal = document.getElementById('btnTestGoal');
    const btnPost = document.getElementById('btnTestPost');

    if (chkSFX) {
      chkSFX.onchange = () => {
        const enabled = audio.toggleSFXAudio(chkSFX.checked);
        if (rngSFX) rngSFX.disabled = !enabled;
        if (btnWhistle) btnWhistle.disabled = !enabled;
        if (btnGoal) btnGoal.disabled = !enabled;
        if (btnPost) btnPost.disabled = !enabled;
        const sliderSpan = chkSFX.parentElement?.querySelector('.slider');
        if (sliderSpan) sliderSpan.style.backgroundColor = enabled ? '#22c55e' : '#475569';
        if (typeof window.toast === 'function') {
          window.toast(enabled ? 'Efeitos sonoros ativados!' : 'Efeitos sonoros desativados!');
        }
      };
    }

    if (rngSFX) {
      rngSFX.oninput = () => {
        const vol = parseInt(rngSFX.value, 10) / 100;
        audio.setSFXVolume(vol);
        if (lblSFX) lblSFX.textContent = `${rngSFX.value}%`;
      };
    }

    if (btnWhistle) {
      btnWhistle.onclick = () => {
        audio.playSFX('whistle_start');
      };
    }

    if (btnGoal) {
      btnGoal.onclick = () => {
        audio.playSFX('goal_celebration');
      };
    }

    if (btnPost) {
      btnPost.onclick = () => {
        audio.playSFX('goal_post');
      };
    }
  }
};
