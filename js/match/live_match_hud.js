(function (window) {
  'use strict';

  const LiveMatchHUD = {
    speedMultiplier: 1,
    isPaused: false,
    viewMode: '2.5D',

    getTickIntervalMs() {
      if (this.speedMultiplier === 40) return 45;
      if (this.speedMultiplier === 20) return 90;
      return 650;
    },

    setSpeed(mult) {
      this.speedMultiplier = mult;
      if (window.AFM_MatchLoop && typeof window.AFM_MatchLoop.updateTimerSpeed === 'function') {
        window.AFM_MatchLoop.updateTimerSpeed(this.getTickIntervalMs());
      }
      this.highlightActiveSpeedButton();
    },

    fastForwardTo(targetMinute, matchState, simulateMinuteFn, onCompleteRenderFn) {
      if (!matchState || typeof simulateMinuteFn !== 'function') return;
      const wasPaused = this.isPaused;
      this.isPaused = true;

      while (matchState.minute < targetMinute && !matchState.isFinished && !matchState.done) {
        simulateMinuteFn(matchState, { silentVisuals: true });
        if (targetMinute === 45 && matchState.minute >= 45) break;
      }

      this.isPaused = wasPaused;
      if (typeof onCompleteRenderFn === 'function') onCompleteRenderFn(matchState);
    },

    drawTechnicalAreaOnCanvas(ctx, canvasWidth, canvasHeight, homeBenchCount, awayBenchCount, managerName = 'AQUINO', rivalManager = 'ADVERSÁRIO') {
      if (!ctx) return;
      const yBase = canvasHeight - 26;

      ctx.save();
      // Área Técnica Home
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.fillRect(canvasWidth * 0.14, yBase - 14, 150, 18);
      ctx.strokeRect(canvasWidth * 0.14, yBase - 14, 150, 18);

      const hCount = Math.min(7, homeBenchCount || 7);
      for (let i = 0; i < hCount; i++) {
        ctx.beginPath();
        ctx.arc(canvasWidth * 0.14 + 16 + i * 20, yBase - 5, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#eab308';
        ctx.fill();
      }

      const coachHomeX = canvasWidth * 0.14 + 175;
      ctx.beginPath();
      ctx.arc(coachHomeX, yBase - 8, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#a855f7';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      ctx.fillStyle = 'rgba(9, 13, 22, 0.9)';
      ctx.fillRect(coachHomeX - 42, yBase + 2, 84, 14);
      ctx.fillStyle = '#e9d5ff';
      ctx.font = 'bold 9px Inter, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`TÉC. ${managerName.toUpperCase()}`, coachHomeX, yBase + 12);

      // Área Técnica Away
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(canvasWidth * 0.62, yBase - 14, 150, 18);
      ctx.strokeRect(canvasWidth * 0.62, yBase - 14, 150, 18);

      const aCount = Math.min(7, awayBenchCount || 7);
      for (let i = 0; i < aCount; i++) {
        ctx.beginPath();
        ctx.arc(canvasWidth * 0.62 + 16 + i * 20, yBase - 5, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#38bdf8';
        ctx.fill();
      }

      const coachAwayX = canvasWidth * 0.62 - 25;
      ctx.beginPath();
      ctx.arc(coachAwayX, yBase - 8, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#64748b';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      ctx.fillStyle = 'rgba(9, 13, 22, 0.9)';
      ctx.fillRect(coachAwayX - 42, yBase + 2, 84, 14);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(`TÉC. ${rivalManager.substring(0, 10).toUpperCase()}`, coachAwayX, yBase + 12);
      ctx.restore();
    },

    highlightActiveSpeedButton() {
      document.querySelectorAll('.afm-speed-btn, .live-ctrl-btn[data-speed]').forEach((btn) => {
        const isCurrent = Number(btn.dataset.speed) === this.speedMultiplier;
        btn.style.background = isCurrent ? '#6d28d9' : '#1e293b';
        btn.style.borderColor = isCurrent ? '#a78bfa' : '#334155';
      });
    },

    openPenaltyShootoutModal(matchState, onShootoutFinished) {
      const modal = document.createElement('div');
      modal.id = 'afm-penalty-modal';
      modal.style.cssText = 'position:fixed;inset:0;background:rgba(5,8,17,0.92);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;font-family:Inter,sans-serif;color:#fff;';

      const homeName = matchState?.homeTeamName || matchState?.home || 'Mandante';
      const awayName = matchState?.awayTeamName || matchState?.away || 'Visitante';

      let homeScore = 0;
      let awayScore = 0;
      let kickIndex = 0;
      let selectedCorner = 'CENTER';

      const renderModal = (statusText = 'Escolha o canto da baliza e clique em COBRAR PÊNALTI!') => {
        modal.innerHTML = `
          <div style="background:#0f172a;border:1px solid #334155;border-radius:14px;max-width:520px;width:100%;padding:20px;text-align:center;">
            <div style="font-size:12px;color:#a78bfa;font-weight:800;letter-spacing:0.08em;">DISPUTA DE PÊNALTIS AO VIVO</div>
            <div style="font-size:28px;font-weight:900;margin:10px 0;">
              ${homeName} <span style="color:#34d399;">${homeScore}</span> x <span style="color:#38bdf8;">${awayScore}</span> ${awayName}
            </div>
            <div style="font-size:13px;color:#cbd5e1;margin-bottom:16px;">${statusText}</div>

            <div style="border:4px solid #f8fafc;border-bottom:2px dashed #34d399;height:130px;margin:0 auto 16px;max-width:360px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;padding:8px;background:rgba(16,185,129,0.12);border-radius:8px 8px 0 0;">
              ${['LEFT', 'CENTER', 'RIGHT'].map((corner) => `
                <button class="pen-corner-btn" data-corner="${corner}" style="background:${selectedCorner === corner ? 'rgba(139,92,246,0.65)' : 'rgba(15,23,42,0.55)'};border:2px solid ${selectedCorner === corner ? '#c4b5fd' : '#475569'};border-radius:6px;color:#fff;font-weight:800;font-size:11px;cursor:pointer;">
                  ${corner === 'LEFT' ? 'CANTO ESQ.' : corner === 'CENTER' ? 'MEIO DO GOL' : 'CANTO DIR.'}
                </button>
              `).join('')}
            </div>

            <div style="display:flex;gap:10px;justify-content:center;">
              <button id="btn-shoot-pen" style="background:#10b981;color:#052e16;border:none;padding:10px 20px;border-radius:8px;font-weight:900;cursor:pointer;">
                COBRAR PÊNALTI
              </button>
              <button id="btn-auto-pen" style="background:#334155;color:#f8fafc;border:1px solid #475569;padding:10px 16px;border-radius:8px;font-weight:700;cursor:pointer;">
                SIMULAR RESTANTE
              </button>
            </div>
          </div>
        `;

        modal.querySelectorAll('.pen-corner-btn').forEach((btn) => {
          btn.onclick = () => {
            selectedCorner = btn.dataset.corner;
            renderModal(statusText);
          };
        });

        const executeRound = () => {
          const corners = ['LEFT', 'CENTER', 'RIGHT'];
          const gkDive = corners[Math.floor(Math.random() * 3)];
          const userScored = selectedCorner !== gkDive || Math.random() < 0.35;
          if (userScored) homeScore++;

          const aiScored = Math.random() < 0.76;
          if (aiScored) awayScore++;
          kickIndex++;

          const roundMsg = `${userScored ? 'GOL SEU!' : 'GOLEIRO DEFENDEU!'} | Adversário: ${aiScored ? 'Gol' : 'Perdeu'} (Série ${kickIndex})`;

          if ((kickIndex >= 5 && homeScore !== awayScore) || kickIndex >= 10) {
            setTimeout(() => {
              modal.remove();
              if (onShootoutFinished) onShootoutFinished({ homeScore, awayScore });
            }, 900);
          } else {
            renderModal(roundMsg);
          }
        };

        const btnShoot = modal.querySelector('#btn-shoot-pen');
        if (btnShoot) btnShoot.onclick = executeRound;

        const btnAuto = modal.querySelector('#btn-auto-pen');
        if (btnAuto) {
          btnAuto.onclick = () => {
            while ((kickIndex < 5 || homeScore === awayScore) && kickIndex < 15) {
              if (Math.random() < 0.78) homeScore++;
              if (Math.random() < 0.75) awayScore++;
              kickIndex++;
            }
            if (homeScore === awayScore) homeScore++;
            modal.remove();
            if (onShootoutFinished) onShootoutFinished({ homeScore, awayScore });
          };
        }
      };

      document.body.appendChild(modal);
      renderModal();
    }
  };

  window.AFM_LiveMatchHUD = LiveMatchHUD;
})(window);
