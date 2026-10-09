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
  const ovr = player ? (player.overall || player.ovr || (typeof playerOverall === 'function' ? playerOverall(player) : 60)) : '-';
  const pos = player ? (player.pos || role) : role;
  const isSelected = !!opts.isSelected;
  const isHalftime = !!opts.isHalftime;
  const stamina = player ? Math.round(player.stamina ?? player.fitness ?? 100) : 100;
  const stClass = stamina >= 75 ? 'stamina-good' : stamina >= 50 ? 'stamina-warn' : 'stamina-tired';
  const shortName = player ? (player.name.split(' ').pop() || player.name) : 'Vazio';
  const customClass = opts.customClass || '';

  return `
    <div class="pitch-player-pill ${isSelected ? 'selected selected-glow' : ''} ${customClass}"
         style="left:${x}%;top:${y}%;"
         data-slot-index="${i}"
         data-slot-role="${escHtml(role)}"
         data-player-key="${escHtml(pk)}"
         data-starterkey="${escHtml(pk)}"
         draggable="true"
         onclick="window.handleTacticalCardClick ? window.handleTacticalCardClick(${i}) : null"
         title="${player ? `${escHtml(player.name)} (${escHtml(pos)}) • OVR ${ovr}` : 'Slot Vazio'}">
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
