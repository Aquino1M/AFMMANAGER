(function (window) {
  'use strict';

  const PressAndBoardroom = {
    questions: [
      {
        q: 'A imprensa questiona a postura tática da equipe para o próximo confronto decisivo. Qual sua resposta, Professor?',
        options: [
          { label: '🔥 Vamos jogar no ataque total pelos 3 pontos!', effects: { fans: 4, squad: 2, board: 0 } },
          { label: '🧠 Respeitamos o adversário, jogaremos com inteligência e equilíbrio.', effects: { fans: 0, squad: 1, board: 3 } },
          { label: '🛡️ O elenco sabe da responsabilidade e vai dar a vida em campo pela vitória.', effects: { fans: 2, squad: 4, board: 1 } }
        ]
      },
      {
        q: 'Os repórteres perguntam sobre o planejamento financeiro e a cobrança da diretoria.',
        options: [
          { label: '💼 Nosso foco é valorizar o clube e honrar cada centavo investido.', effects: { fans: 1, squad: 0, board: 4 } },
          { label: '⚽ A melhor resposta é dada com títulos e espetáculo para a torcida!', effects: { fans: 5, squad: 2, board: -1 } },
          { label: '🤝 Diretoria, comissão e elenco estão 100% blindados e unidos.', effects: { fans: 2, squad: 3, board: 2 } }
        ]
      }
    ],

    applyPressAnswer(state, questionIndex = 0, optionIndex = 0) {
      if (window.AFM_Guards && typeof window.AFM_Guards.migrateSaveState === 'function') {
        window.AFM_Guards.migrateSaveState(state);
      }
      const q = this.questions[questionIndex % this.questions.length];
      const opt = q.options[optionIndex] || q.options[0];

      state.confidence = state.confidence || { board: 75, fans: 75, squad: 75 };
      state.confidence.fans = Math.max(0, Math.min(100, state.confidence.fans + opt.effects.fans));
      state.confidence.squad = Math.max(0, Math.min(100, state.confidence.squad + opt.effects.squad));
      state.confidence.board = Math.max(0, Math.min(100, state.confidence.board + opt.effects.board));

      if (state.trust) {
        state.trust.board = state.confidence.board;
        state.trust.fans = state.confidence.fans;
        state.trust.squad = state.confidence.squad;
      }

      return opt;
    },

    openPressConferenceModal(state, onComplete) {
      if (state?.gameMode === 'player' || (typeof window !== 'undefined' && window.isPlayerCareerActive?.(state))) {
        if (typeof onComplete === 'function') onComplete();
        return;
      }

      const qIdx = Math.floor(Math.random() * this.questions.length);
      const qObj = this.questions[qIdx];

      const modal = document.createElement('div');
      modal.id = 'afm-press-modal';
      modal.style.cssText = 'position:fixed;inset:0;background:rgba(5,8,17,0.92);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;font-family:Inter,sans-serif;color:#fff;';

      modal.innerHTML = `
        <div style="background:#0f172a;border:1px solid #334155;border-radius:14px;max-width:560px;width:100%;padding:22px;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
            <span style="font-size:24px;">🎙️</span>
            <div>
              <div style="font-size:11px;color:#a78bfa;font-weight:800;letter-spacing:0.08em;">SALA DE IMPRENSA — COLETIVA OFICIAL</div>
              <div style="font-size:16px;font-weight:900;color:#f8fafc;">Entrevista do Professor ${state?.managerPersonal?.name || state?.manager || 'Aquino'}</div>
            </div>
          </div>
          <div style="background:#1e293b;border-radius:8px;padding:14px;font-size:13px;line-height:1.5;color:#cbd5e1;margin-bottom:16px;border-left:4px solid #8b5cf6;">
            "${qObj.q}"
          </div>
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${qObj.options.map((opt, i) => `
              <button class="btn-press-opt" data-opt="${i}" style="background:#111827;border:1px solid #334155;border-radius:8px;padding:12px 14px;text-align:left;color:#f8fafc;font-size:12px;font-weight:700;cursor:pointer;transition:all 0.2s ease;">
                ${opt.label}
              </button>
            `).join('')}
          </div>
        </div>
      `;

      modal.querySelectorAll('.btn-press-opt').forEach((btn) => {
        btn.onmouseover = () => { btn.style.borderColor = '#8b5cf6'; btn.style.background = '#1e1b4b'; };
        btn.onmouseout = () => { btn.style.borderColor = '#334155'; btn.style.background = '#111827'; };
        btn.onclick = () => {
          const optIdx = parseInt(btn.dataset.opt, 10);
          this.applyPressAnswer(state, qIdx, optIdx);
          modal.remove();
          if (typeof onComplete === 'function') onComplete();
        };
      });

      document.body.appendChild(modal);
    }
  };

  window.AFM_PressAndBoard = Object.assign(window.AFM_PressAndBoard || {}, PressAndBoardroom);
})(window);
