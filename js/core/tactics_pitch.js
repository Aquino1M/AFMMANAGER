// ==============================================================================
// AFM MANAGER 2027 — CAMPO TÁTICO HORIZONTAL & PÍLULAS LIMPAS (CORE MODULAR)
// Arquivo: js/core/tactics_pitch.js
// 
// Orientação: Esquerda para a Direita (Left-to-Right Widescreen)
// GK: 10% | Zaga: 25% | Meio: 44-58% | Ataque: 80-84%
// ==============================================================================

const HORIZONTAL_FORMATIONS = {
  '4-3-3': [
    { r: 'GK', x: 10, y: 50 },
    { r: 'LB', x: 26, y: 18 }, { r: 'CB', x: 25, y: 38 }, { r: 'CB', x: 25, y: 62 }, { r: 'RB', x: 26, y: 82 },
    { r: 'CM', x: 48, y: 28 }, { r: 'DM', x: 44, y: 50 }, { r: 'CM', x: 48, y: 72 },
    { r: 'LW', x: 80, y: 20 }, { r: 'ST', x: 84, y: 50 }, { r: 'RW', x: 80, y: 80 }
  ],
  '4-3-3 Holding': [
    { r: 'GK', x: 10, y: 50 },
    { r: 'LB', x: 26, y: 18 }, { r: 'CB', x: 25, y: 38 }, { r: 'CB', x: 25, y: 62 }, { r: 'RB', x: 26, y: 82 },
    { r: 'DM', x: 44, y: 36 }, { r: 'DM', x: 44, y: 64 }, { r: 'AM', x: 58, y: 50 },
    { r: 'LW', x: 80, y: 20 }, { r: 'ST', x: 84, y: 50 }, { r: 'RW', x: 80, y: 80 }
  ],
  '4-4-2': [
    { r: 'GK', x: 10, y: 50 },
    { r: 'LB', x: 26, y: 18 }, { r: 'CB', x: 25, y: 38 }, { r: 'CB', x: 25, y: 62 }, { r: 'RB', x: 26, y: 82 },
    { r: 'LM', x: 52, y: 20 }, { r: 'CM', x: 48, y: 40 }, { r: 'CM', x: 48, y: 60 }, { r: 'RM', x: 52, y: 80 },
    { r: 'ST', x: 82, y: 38 }, { r: 'ST', x: 82, y: 62 }
  ],
  '4-2-3-1': [
    { r: 'GK', x: 10, y: 50 },
    { r: 'LB', x: 26, y: 18 }, { r: 'CB', x: 25, y: 38 }, { r: 'CB', x: 25, y: 62 }, { r: 'RB', x: 26, y: 82 },
    { r: 'DM', x: 44, y: 38 }, { r: 'DM', x: 44, y: 62 },
    { r: 'LM', x: 64, y: 20 }, { r: 'AM', x: 66, y: 50 }, { r: 'RM', x: 64, y: 80 },
    { r: 'ST', x: 84, y: 50 }
  ],
  '3-5-2': [
    { r: 'GK', x: 10, y: 50 },
    { r: 'CB', x: 25, y: 26 }, { r: 'CB', x: 24, y: 50 }, { r: 'CB', x: 25, y: 74 },
    { r: 'LM', x: 48, y: 16 }, { r: 'CM', x: 48, y: 38 }, { r: 'DM', x: 42, y: 50 }, { r: 'CM', x: 48, y: 62 }, { r: 'RM', x: 48, y: 84 },
    { r: 'ST', x: 82, y: 38 }, { r: 'ST', x: 82, y: 62 }
  ],
  '5-3-2': [
    { r: 'GK', x: 10, y: 50 },
    { r: 'LB', x: 26, y: 14 }, { r: 'CB', x: 24, y: 32 }, { r: 'CB', x: 24, y: 50 }, { r: 'CB', x: 24, y: 68 }, { r: 'RB', x: 26, y: 86 },
    { r: 'CM', x: 48, y: 30 }, { r: 'DM', x: 44, y: 50 }, { r: 'CM', x: 48, y: 70 },
    { r: 'ST', x: 82, y: 40 }, { r: 'ST', x: 82, y: 60 }
  ],
  '4-1-4-1': [
    { r: 'GK', x: 10, y: 50 },
    { r: 'LB', x: 26, y: 18 }, { r: 'CB', x: 25, y: 38 }, { r: 'CB', x: 25, y: 62 }, { r: 'RB', x: 26, y: 82 },
    { r: 'DM', x: 43, y: 50 },
    { r: 'LM', x: 57, y: 16 }, { r: 'CM', x: 52, y: 38 }, { r: 'CM', x: 52, y: 62 }, { r: 'RM', x: 57, y: 84 },
    { r: 'ST', x: 82, y: 50 }
  ],
  '4-5-1': [
    { r: 'GK', x: 10, y: 50 },
    { r: 'LB', x: 26, y: 18 }, { r: 'CB', x: 25, y: 38 }, { r: 'CB', x: 25, y: 62 }, { r: 'RB', x: 26, y: 82 },
    { r: 'LM', x: 48, y: 16 }, { r: 'CM', x: 45, y: 34 }, { r: 'DM', x: 43, y: 50 }, { r: 'CM', x: 45, y: 66 }, { r: 'RM', x: 48, y: 84 },
    { r: 'ST', x: 82, y: 50 }
  ],
  '3-4-3': [
    { r: 'GK', x: 10, y: 50 },
    { r: 'CB', x: 25, y: 28 }, { r: 'CB', x: 24, y: 50 }, { r: 'CB', x: 25, y: 72 },
    { r: 'LM', x: 48, y: 16 }, { r: 'CM', x: 45, y: 38 }, { r: 'CM', x: 45, y: 62 }, { r: 'RM', x: 48, y: 84 },
    { r: 'LW', x: 80, y: 20 }, { r: 'ST', x: 84, y: 50 }, { r: 'RW', x: 80, y: 80 }
  ]
};

window.HORIZONTAL_FORMATIONS = HORIZONTAL_FORMATIONS;

function escHtml(str) {
  return String(str || '').replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}

function renderPitchPlayerPill(player, slot = {}, opts = {}) {
  const i = slot.index ?? 0;
  const role = slot.role || (player?.pos || 'ST');
  const x = slot.x ?? 50;
  const y = slot.y ?? 50;
  const pk = player ? (typeof playerKey === 'function' ? playerKey(player) : (player.id || player.key || player.name)) : '';
  const ovr = player ? ((typeof getPlayerEffectiveOverall === 'function') ? getPlayerEffectiveOverall(player, role) : (player.overall || player.ovr || (typeof playerOverall === 'function' ? playerOverall(player) : 60))) : '-';
  const pos = player ? (player.pos || role) : role;
  const isSelected = !!opts.isSelected;
  const isHalftime = !!opts.isHalftime;
  const stamina = player ? Math.round(player.stamina ?? player.fitness ?? 100) : 100;
  const stClass = stamina >= 75 ? 'stamina-good' : stamina >= 50 ? 'stamina-warn' : 'stamina-tired';
  const shortName = player ? (player.name.split(' ').pop() || player.name) : 'Vazio';
  const customClass = opts.customClass || '';
  const pt = player ? ((typeof getPlayerPendingTransfer === 'function') ? getPlayerPendingTransfer(player) : (player.pendingTransfer || (player.isSold ? { type: 'sale' } : null))) : null;
  const isSoldPill = pt && (pt.type === 'sale' || player?.isSold);

  return `
    <div class="pitch-player-pill ${isSelected ? 'selected selected-glow' : ''} ${customClass}"
         style="left:${x}%;top:${y}%;position:absolute;"
         data-slot-index="${i}"
         data-slot-role="${escHtml(role)}"
         data-player-key="${escHtml(pk)}"
         data-starterkey="${escHtml(pk)}"
         draggable="true"
         title="${player ? `${escHtml(player.name)} (${escHtml(pos)}) • OVR ${ovr}${isSoldPill ? ' [🏷️ VENDIDO - Aguardando Janela]' : ''}` : 'Slot Vazio'}">
      ${isSoldPill ? `<span class="pill-sold-badge" style="position:absolute;top:-6px;right:-6px;background:#ef4444;color:#fff;border-radius:50%;width:15px;height:15px;font-size:9px;font-weight:900;display:flex;align-items:center;justify-content:center;box-shadow:0 0 6px #ef4444;z-index:4;border:1px solid #fff" title="🏷️ VENDIDO (Aguardando Janela)">🏷️</span>` : ''}
      <span class="pill-pos">${escHtml(pos)}</span>
      <span class="pill-name">${escHtml(shortName)}</span>
      <span class="pill-ovr">${ovr}</span>
      ${isHalftime ? `
        <div class="pill-stamina" title="Energia: ${stamina}%">
          <div class="pill-stamina-fill ${stClass}" style="width:${stamina}%;"></div>
        </div>
      ` : ''}
    </div>
  `;
}
window.renderPitchPlayerPill = renderPitchPlayerPill;

function renderHorizontalTacticsPitch(players, formationName = '4-3-3', opts = {}) {
  const form = HORIZONTAL_FORMATIONS[formationName] || HORIZONTAL_FORMATIONS['4-3-3'];
  const selectedKey = opts.selectedKey || null;
  const isHalftime = !!opts.isHalftime;
  const customClass = opts.customClass || '';

  return `
    <div class="horizontal-pitch-field" style="position:relative;width:100%;height:100%;min-height:380px;background:repeating-linear-gradient(90deg, #15803d, #15803d 48px, #166534 48px, #166534 96px);border-radius:12px;overflow:hidden;box-shadow:inset 0 0 45px rgba(0,0,0,0.6)">
      <!-- Linhas Oficiais do Campo Horizontal (Transmissão de TV) -->
      <!-- Linha Central e Círculo Central -->
      <div style="position:absolute;left:50%;top:0;bottom:0;width:2px;background:rgba(255,255,255,0.45);transform:translateX(-50%)"></div>
      <div style="position:absolute;left:50%;top:50%;width:80px;height:80px;border-radius:50%;border:2px solid rgba(255,255,255,0.45);transform:translate(-50%,-50%)"></div>
      <div style="position:absolute;left:50%;top:50%;width:6px;height:6px;border-radius:50%;background:#fff;transform:translate(-50%,-50%)"></div>

      <!-- Área Defensiva Esquerda (GK) -->
      <div style="position:absolute;left:0;top:20%;bottom:20%;width:18%;border:2px solid rgba(255,255,255,0.45);border-left:none"></div>
      <div style="position:absolute;left:0;top:35%;bottom:35%;width:7%;border:2px solid rgba(255,255,255,0.45);border-left:none"></div>

      <!-- Área Ofensiva Direita (Ataque) -->
      <div style="position:absolute;right:0;top:20%;bottom:20%;width:18%;border:2px solid rgba(255,255,255,0.45);border-right:none"></div>
      <div style="position:absolute;right:0;top:35%;bottom:35%;width:7%;border:2px solid rgba(255,255,255,0.45);border-right:none"></div>

      <!-- Camada Vetorial de Setas Táticas de Movimentação (Padrão EA FC / FM) -->
      <svg style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <marker id="arrowHeadCyan" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38bdf8" />
          </marker>
          <marker id="arrowHeadGold" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#fbbf24" />
          </marker>
        </defs>
        ${form.map(slot => {
          if (!slot || !slot.r) return '';
          const r = slot.r.toUpperCase();
          if (r === 'LB') {
            return `<line x1="${slot.x + 4}" y1="${slot.y}" x2="${slot.x + 14}" y2="${slot.y}" stroke="#38bdf8" stroke-width="1.2" stroke-dasharray="2 2" stroke-opacity="0.6" marker-end="url(#arrowHeadCyan)" />`;
          }
          if (r === 'RB') {
            return `<line x1="${slot.x + 4}" y1="${slot.y}" x2="${slot.x + 14}" y2="${slot.y}" stroke="#38bdf8" stroke-width="1.2" stroke-dasharray="2 2" stroke-opacity="0.6" marker-end="url(#arrowHeadCyan)" />`;
          }
          if (r === 'LW') {
            return `<line x1="${slot.x + 2}" y1="${slot.y + 2}" x2="${slot.x + 7}" y2="${slot.y + 12}" stroke="#fbbf24" stroke-width="1.2" stroke-dasharray="2 2" stroke-opacity="0.7" marker-end="url(#arrowHeadGold)" />`;
          }
          if (r === 'RW') {
            return `<line x1="${slot.x + 2}" y1="${slot.y - 2}" x2="${slot.x + 7}" y2="${slot.y - 12}" stroke="#fbbf24" stroke-width="1.2" stroke-dasharray="2 2" stroke-opacity="0.7" marker-end="url(#arrowHeadGold)" />`;
          }
          if (r === 'AM') {
            return `<line x1="${slot.x + 4}" y1="${slot.y}" x2="${slot.x + 12}" y2="${slot.y}" stroke="#fbbf24" stroke-width="1.2" stroke-dasharray="2 2" stroke-opacity="0.7" marker-end="url(#arrowHeadGold)" />`;
          }
          if (r === 'DM') {
            return `<line x1="${slot.x - 2}" y1="${slot.y}" x2="${slot.x + 6}" y2="${slot.y}" stroke="rgba(255,255,255,0.4)" stroke-width="1" stroke-dasharray="1.5 1.5" />`;
          }
          return '';
        }).join('')}
      </svg>

      <!-- Jogadores em Pílulas Horizontais -->
      ${players.map((p, idx) => {
        const slot = form[idx] || { r: p?.pos || 'CM', x: 10 + idx * 8, y: 50 };
        const pk = p ? (typeof playerKey === 'function' ? playerKey(p) : (p.id || p.key || p.name)) : '';
        const isSel = selectedKey && selectedKey === pk;
        return renderPitchPlayerPill(p, { index: idx, role: slot.r, x: slot.x, y: slot.y }, {
          isSelected: isSel,
          isHalftime,
          customClass
        });
      }).join('')}
    </div>
  `;
}
window.renderHorizontalTacticsPitch = renderHorizontalTacticsPitch;
