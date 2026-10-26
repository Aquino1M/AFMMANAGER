/**
 * ==============================================================================
 * AFM MANAGER 2027 — SCOUTING VISUAL PRO (RADAR HEXAGONAL & HEATMAP SVG)
 * Arquivo: js/systems/scouting_radar_and_heatmap.js
 * 
 * Fornece:
 * 1. Gráfico Radar Hexagonal EA FC / Football Manager em SVG nativo de alta precisão.
 * 2. Mapa de Calor Tático (Heatmap) em mini-gramado vetorial conforme a posição.
 * 3. Traço Comportamental / Personalidade de Vestiário do Atleta.
 * ==============================================================================
 */

(function (window) {
  'use strict';

  function hashString(str = '') {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
    return Math.abs(h);
  }

  const AFM_Scouting = {
    /**
     * Identifica o traço de personalidade marcante do atleta
     */
    getPersonalityTrait(name = '', pos = '', age = 24, realOvr = 70) {
      const h = hashString(name);
      const p = String(pos || '').toUpperCase();
      
      if (age >= 31 && realOvr >= 78) {
        return { icon: '👑', label: 'Líder Nato', desc: 'Comanda o vestiário, acalma os mais jovens e cresce em momentos decisivos.' };
      }
      if (age <= 21 && realOvr >= 74) {
        return { icon: '💎', label: 'Joia Prodígio', desc: 'Evolução acelerada nos treinos e alto valor de revenda internacional.' };
      }
      if (p.includes('GK') || p.includes('GOL')) {
        return { icon: '🧤', label: 'Paredão Seguro', desc: 'Excelente posicionamento e frieza em pênaltis e bolas cara a cara.' };
      }
      if (p.includes('CB') || p.includes('ZAG') || p.includes('DM') || p.includes('VOL')) {
        return { icon: '🛡️', label: 'Guerreiro de Combate', desc: 'Muita raça no bote, imposição física e liderança pelo exemplo em campo.' };
      }
      if (p.includes('ST') || p.includes('CF') || p.includes('CA') || p.includes('ATA')) {
        return { icon: '🎯', label: 'Finalizador Letal', desc: 'Faro de gol refinado, ótimo aproveitamento em chutes de primeira na área.' };
      }
      if (p.includes('AM') || p.includes('MC') || p.includes('MEI')) {
        return { icon: '🪄', label: 'Mago Criativo', desc: 'Visão de jogo privilegiada, passes verticais que quebram linhas defensivas.' };
      }
      if (p.includes('W') || p.includes('PE') || p.includes('PD') || p.includes('PNT')) {
        return { icon: '⚡', label: 'Velocista Explosivo', desc: 'Arrancadas fulminantes no corredor e facilidade para o drible no um contra um.' };
      }

      const defaultTraits = [
        { icon: '⭐', label: 'Profissional Exemplar', desc: 'Disciplina tática rigorosa, comprometimento com a rotina e moral estável.' },
        { icon: '🔥', label: 'Competitivo Feroz', desc: 'Detesta perder, corre os 90 minutos e contagia os companheiros com intensidade.' },
        { icon: '🤝', label: 'Jogador Coletivo', desc: 'Movimentação sem bola inteligente, abre espaços e joga sempre em prol da vitória.' }
      ];
      return defaultTraits[h % defaultTraits.length];
    },

    /**
     * Gera o Polígono Hexagonal Radar em SVG puro
     */
    generateRadarSVG(attrs = [], size = 180) {
      const cx = size / 2, cy = size / 2, r = (size / 2) - 28;
      const n = Math.max(3, attrs.length || 6);
      const angles = [];
      for (let i = 0; i < n; i++) angles.push((Math.PI * 2 / n) * i - Math.PI / 2);

      let gridHexagons = '';
      [0.35, 0.70, 1.0].forEach(level => {
        const pts = angles.map(a => `${(cx + r * level * Math.cos(a)).toFixed(1)},${(cy + r * level * Math.sin(a)).toFixed(1)}`).join(' ');
        gridHexagons += `<polygon points="${pts}" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1" stroke-dasharray="${level < 1 ? '3 3' : 'none'}"/>`;
      });

      let radialAxes = '';
      angles.forEach(a => {
        const ex = (cx + r * Math.cos(a)).toFixed(1);
        const ey = (cy + r * Math.sin(a)).toFixed(1);
        radialAxes += `<line x1="${cx}" y1="${cy}" x2="${ex}" y2="${ey}" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>`;
      });

      const polyPts = attrs.map((at, i) => {
        const valRatio = Math.min(1.0, Math.max(0.25, (at.val || 60) / 100));
        const px = (cx + r * valRatio * Math.cos(angles[i])).toFixed(1);
        const py = (cy + r * valRatio * Math.sin(angles[i])).toFixed(1);
        return `${px},${py}`;
      }).join(' ');

      let labels = '';
      attrs.forEach((at, i) => {
        const lx = (cx + (r + 16) * Math.cos(angles[i])).toFixed(1);
        const ly = (cy + (r + 14) * Math.sin(angles[i])).toFixed(1);
        const shortName = at.name.split(' ')[0].slice(0, 6);
        labels += `<text x="${lx}" y="${ly}" fill="#94a3b8" font-size="8" font-weight="900" text-anchor="middle" dominant-baseline="middle">${shortName}</text>`;
        const valRatio = Math.min(1.0, Math.max(0.25, (at.val || 60) / 100));
        const vx = (cx + r * valRatio * Math.cos(angles[i])).toFixed(1);
        const vy = (cy + r * valRatio * Math.sin(angles[i])).toFixed(1);
        labels += `<circle cx="${vx}" cy="${vy}" r="2.8" fill="#38bdf8" stroke="#fff" stroke-width="1"/>`;
      });

      const gradId = `radar_grad_${Math.round(cx)}_${Math.round(Math.random() * 1000)}`;

      return `
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="display:block;margin:0 auto;overflow:visible">
          <defs>
            <radialGradient id="${gradId}" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.65"/>
              <stop offset="100%" stop-color="#06b6d4" stop-opacity="0.2"/>
            </radialGradient>
          </defs>
          ${gridHexagons}
          ${radialAxes}
          <polygon points="${polyPts}" fill="url(#${gradId})" stroke="#38bdf8" stroke-width="2" />
          ${labels}
        </svg>
      `;
    },

    /**
     * Mini-Campo de Futebol Vetorial com Mapa de Calor Dinâmico por Posição
     */
    generateHeatmapSVG(posStr = '') {
      const p = String(posStr || '').toUpperCase();
      let cx = 55, cy = 70, rx = 24, ry = 22;
      if (p.includes('GK') || p.includes('GOL')) {
        cx = 55; cy = 120; rx = 24; ry = 14;
      } else if (p.includes('CB') || p.includes('ZAG')) {
        cx = 55; cy = 100; rx = 28; ry = 16;
      } else if (p.includes('LB') || p.includes('LE')) {
        cx = 22; cy = 88; rx = 12; ry = 30;
      } else if (p.includes('RB') || p.includes('LD')) {
        cx = 88; cy = 88; rx = 12; ry = 30;
      } else if (p.includes('DM') || p.includes('VOL')) {
        cx = 55; cy = 82; rx = 24; ry = 18;
      } else if (p.includes('CM') || p.includes('MC')) {
        cx = 55; cy = 70; rx = 26; ry = 22;
      } else if (p.includes('AM') || p.includes('MEI')) {
        cx = 55; cy = 52; rx = 24; ry = 18;
      } else if (p.includes('LW') || p.includes('PE')) {
        cx = 22; cy = 42; rx = 14; ry = 28;
      } else if (p.includes('RW') || p.includes('PD')) {
        cx = 88; cy = 42; rx = 14; ry = 28;
      } else if (p.includes('ST') || p.includes('CF') || p.includes('ATA') || p.includes('CA')) {
        cx = 55; cy = 30; rx = 24; ry = 16;
      }

      const gradId = `heat_grad_${Math.round(cx)}_${Math.round(cy)}_${Math.round(Math.random() * 1000)}`;

      return `
        <svg width="110" height="140" viewBox="0 0 110 140" style="display:block;margin:0 auto;background:#090d16;border:1px solid rgba(255,255,255,0.1);border-radius:8px;">
          <defs>
            <radialGradient id="${gradId}" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#ef4444" stop-opacity="0.9"/>
              <stop offset="50%" stop-color="#f59e0b" stop-opacity="0.55"/>
              <stop offset="85%" stop-color="#22c55e" stop-opacity="0.25"/>
              <stop offset="100%" stop-color="#22c55e" stop-opacity="0"/>
            </radialGradient>
          </defs>
          <rect x="6" y="6" width="98" height="128" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
          <line x1="6" y1="70" x2="104" y2="70" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
          <circle cx="55" cy="70" r="14" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
          <circle cx="55" cy="70" r="1.5" fill="rgba(255,255,255,0.4)"/>
          <rect x="32" y="6" width="46" height="22" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
          <rect x="32" y="112" width="46" height="22" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
          <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${gradId})" />
          <ellipse cx="${cx}" cy="${cy}" rx="${Math.round(rx*0.5)}" ry="${Math.round(ry*0.5)}" fill="url(#${gradId})" />
        </svg>
      `;
    },

    /**
     * Injeta a seção visual de Radar e Heatmap na Lupa do Atleta
     */
    enhanceLupaModal(modalEl) {
      if (!modalEl || modalEl.dataset.scoutingEnhanced) return;
      modalEl.dataset.scoutingEnhanced = 'true';

      const statsGrid = modalEl.querySelector('div[style*="grid-template-columns:repeat(4,1fr)"]');
      if (!statsGrid || !statsGrid.parentElement) return;

      // Extrai dados contextuais do jogador
      const ovrEl = modalEl.querySelector('.fut-card-ovr');
      const posEl = modalEl.querySelector('.fut-card-pos');
      const nameEl = modalEl.querySelector('h2');
      const ovr = ovrEl ? parseInt(ovrEl.textContent) || 70 : 70;
      const pos = posEl ? posEl.textContent.trim() : 'CM';
      const name = nameEl ? nameEl.textContent.trim() : 'Atleta';

      const trait = this.getPersonalityTrait(name, pos, 24, ovr);

      // Extrai os 6 atributos da caixa granular
      const attrItems = Array.from(modalEl.querySelectorAll('div[style*="grid-template-columns:repeat(2,1fr)"] > div'));
      let attrs = [];
      if (attrItems.length >= 6) {
        attrs = attrItems.slice(0, 6).map(it => {
          const nameSpan = it.querySelector('span');
          const valB = it.querySelector('b');
          return {
            name: nameSpan ? nameSpan.textContent.replace(/^[^\w\s]+/g, '').trim() : 'Attr',
            val: valB ? parseInt(valB.textContent) || ovr : ovr
          };
        });
      } else {
        attrs = [
          { name: 'Ritmo', val: ovr },
          { name: 'Finalização', val: Math.max(50, ovr - 2) },
          { name: 'Passe', val: ovr },
          { name: 'Drible', val: Math.min(99, ovr + 2) },
          { name: 'Defesa', val: Math.max(45, ovr - 6) },
          { name: 'Físico', val: ovr }
        ];
      }

      const radarHtml = this.generateRadarSVG(attrs, 180);
      const heatmapHtml = this.generateHeatmapSVG(pos);

      const sectionWrap = document.createElement('div');
      sectionWrap.style.cssText = 'background:#090d16;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px;margin-top:2px;';
      sectionWrap.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:6px">
          <div style="font-size:11px;font-weight:900;color:#38bdf8;letter-spacing:0.5px;display:flex;align-items:center;gap:6px">
            <span>📊</span> SCOUTING AVANÇADO (RADAR & MAPA DE CALOR)
          </div>
          <div style="display:inline-flex;align-items:center;gap:5px;background:rgba(124,58,237,0.18);border:1px solid rgba(167,139,250,0.3);padding:3px 8px;border-radius:6px;font-size:10px;color:#c084fc;font-weight:800" title="${trait.desc}">
            <span>${trait.icon}</span> <span>${trait.label}</span>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 130px;gap:12px;align-items:center;">
          <!-- Radar Hexagonal -->
          <div style="background:#0d1322;border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:8px 4px;text-align:center;">
            <div style="font-size:9px;font-weight:800;color:#94a3b8;margin-bottom:2px;text-transform:uppercase;letter-spacing:0.5px">Polígono de Performance</div>
            ${radarHtml}
          </div>

          <!-- Mapa de Calor -->
          <div style="background:#0d1322;border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:8px 4px;text-align:center;">
            <div style="font-size:9px;font-weight:800;color:#94a3b8;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px">Raio de Ação</div>
            ${heatmapHtml}
            <div style="font-size:9px;color:#64748b;margin-top:4px;font-weight:700">Posição: <span style="color:#38bdf8">${pos}</span></div>
          </div>
        </div>
      `;

      statsGrid.parentElement.insertBefore(sectionWrap, statsGrid.nextSibling);
    }
  };

  // Observador contínuo para enriquecer a Lupa assim que o modal for montado no DOM
  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver(() => {
      const modal = document.getElementById('afm-market-lupa-modal');
      if (modal && !modal.dataset.scoutingEnhanced) {
        AFM_Scouting.enhanceLupaModal(modal);
      }
    });
    observer.observe(document.body || document.documentElement, { childList: true, subtree: true });
  }

  window.AFM_Scouting = AFM_Scouting;
})(typeof window !== 'undefined' ? window : global);
