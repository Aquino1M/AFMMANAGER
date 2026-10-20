/**
 * AFM 2027 - Sistema de Favoritos no Mercado (Wishlist / Shortlist de Contratações)
 * 
 * Permite marcar jogadores com estrela ⭐ em toda a interface do Mercado e na Lupa,
 * salvar notas do treinador, definir teto máximo de preço e acompanhar alertas de transferências.
 */

(function(window){
  'use strict';

  function resolvePlayerObj(playerOrKey){
    if(!playerOrKey) return null;
    if(typeof playerOrKey === 'object' && playerOrKey.name) return playerOrKey;
    const key = String(playerOrKey);
    const state = window.state;
    if(!state) return null;

    // Busca no elenco do usuário
    if(Array.isArray(state.squad)){
      const found = state.squad.find(p => (typeof window.playerKey === 'function' ? window.playerKey(p) : p.name) === key);
      if(found) return found;
    }

    // Busca no universo do mercado
    if(typeof window.marketUniverse === 'function'){
      const u = window.marketUniverse();
      const found = u.find(p => (p.marketKey || (typeof window.playerKey === 'function' ? window.playerKey(p) : p.name)) === key);
      if(found) return found;
    }

    // Busca nos favoritos salvos
    if(Array.isArray(state.marketFavorites)){
      const found = state.marketFavorites.find(f => f.key === key);
      if(found) return found;
    }

    return null;
  }

  const MarketFavorites = {
    // Retorna se o jogador está na lista de favoritos
    isFavorite(playerOrKey){
      const state = window.state;
      if(!state || !Array.isArray(state.marketFavorites)) return false;
      const key = typeof playerOrKey === 'object' ? (playerOrKey.marketKey || (typeof window.playerKey === 'function' ? window.playerKey(playerOrKey) : playerOrKey.name)) : String(playerOrKey);
      return state.marketFavorites.some(f => f.key === key);
    },

    // Alterna o status de favorito (Adiciona / Remove)
    toggleFavorite(playerOrKey, options = {}){
      const state = window.state;
      if(!state) return false;
      state.marketFavorites = Array.isArray(state.marketFavorites) ? state.marketFavorites : [];

      const p = resolvePlayerObj(playerOrKey);
      const key = p ? (p.marketKey || (typeof window.playerKey === 'function' ? window.playerKey(p) : p.name)) : String(playerOrKey);
      if(!key) return false;

      const existingIdx = state.marketFavorites.findIndex(f => f.key === key);
      if(existingIdx >= 0){
        // Remove dos favoritos
        const removed = state.marketFavorites.splice(existingIdx, 1)[0];
        if(typeof window.toast === 'function'){
          window.toast(`⭐ ${removed.name || 'Jogador'} removido dos seus Favoritos.`);
        }
        if(typeof window.save === 'function') window.save();
        this.updateStarElements(key, false);
        return false;
      } else {
        // Adiciona aos favoritos
        const name = p?.name || 'Jogador';
        const club = p?.club || 'Mercado';
        const pos = p?.pos || 'MEI';
        const age = p?.age || 24;
        const ovr = p ? (typeof window.playerOverall === 'function' ? window.playerOverall(p) : (p.ovr || p.overall || 75)) : 75;
        const valMi = p?.value != null ? p.value : (typeof window.calcValueMi === 'function' ? window.calcValueMi(p) : 10);
        const wage = p?.wage || (typeof window.playerSalary === 'function' ? window.playerSalary(p) : Math.round(ovr * 1200));

        const newFav = {
          key,
          id: p?.id || key,
          name,
          club,
          pos,
          age,
          ovr,
          valMi,
          wage,
          maxPrice: options.maxPrice != null ? options.maxPrice : valMi,
          note: options.note || 'Monitorar para a próxima janela de transferências.',
          addedDate: state.date || '2026-01-01'
        };

        state.marketFavorites.unshift(newFav);
        if(typeof window.toast === 'function'){
          window.toast(`⭐ ${name} adicionado aos seus Favoritos do Mercado!`);
        }
        if(typeof window.save === 'function') window.save();
        this.updateStarElements(key, true);

        // Se solicitado, abre modal de notas
        if(options.openEdit){
          this.openEditFavoriteModal(key);
        }
        return true;
      }
    },

    // Atualiza visualmente botões de estrela ativos na tela
    updateStarElements(key, isFav){
      const btns = document.querySelectorAll(`.btn-fav-star[data-key="${key}"]`);
      btns.forEach(btn => {
        btn.classList.toggle('active', isFav);
        btn.title = isFav ? 'Remover dos Favoritos (Wishlist)' : 'Salvar nos Favoritos (Wishlist)';
        btn.style.color = isFav ? '#facc15' : 'rgba(255,255,255,0.4)';
        btn.style.borderColor = isFav ? '#facc15' : 'rgba(255,255,255,0.15)';
      });

      // Atualiza badge na aba de favoritos se existir
      const favTabBadge = document.querySelector('.market-fav-count');
      if(favTabBadge && window.state?.marketFavorites){
        favTabBadge.textContent = window.state.marketFavorites.length;
      }
    },

    // Modal para editar anotações do treinador e teto de preço
    openEditFavoriteModal(key){
      const state = window.state;
      if(!state || !Array.isArray(state.marketFavorites)) return;
      const fav = state.marketFavorites.find(f => f.key === key);
      if(!fav) return;

      const bodyHtml = `
        <div style="color:#fff;display:flex;flex-direction:column;gap:14px">
          <div style="display:flex;align-items:center;gap:12px;background:rgba(255,255,255,0.03);padding:12px;border-radius:10px;border:1px solid rgba(255,255,255,0.08)">
            ${typeof window.clubBadge === 'function' ? window.clubBadge(fav.club, 36) : ''}
            <div>
              <div style="font-size:16px;font-weight:900">${window.esc ? window.esc(fav.name) : fav.name}</div>
              <div style="font-size:12px;color:#94a3b8">${fav.pos} • ${fav.age} anos • ${fav.club} • <b style="color:#38bdf8">OVR ${fav.ovr}</b></div>
            </div>
            <div style="margin-left:auto;text-align:right">
              <div style="font-size:10px;color:#94a3b8">VALOR ATUAL</div>
              <div style="font-size:15px;font-weight:900;color:#34d399">R$ ${fav.valMi.toFixed(1)} mi</div>
            </div>
          </div>

          <div>
            <label style="display:block;font-size:11px;font-weight:800;color:#38bdf8;margin-bottom:6px">💰 TETO MÁXIMO DE PREÇO (R$ MILHÕES)</label>
            <input id="inputFavMaxPrice" type="number" step="0.5" value="${fav.maxPrice || fav.valMi}" style="width:100%;padding:10px 12px;background:#0b0816;border:1px solid #7c3aed;border-radius:8px;color:#fff;font-weight:800;font-size:14px;box-sizing:border-box">
            <div style="font-size:10px;color:#94a3b8;margin-top:4px">Você receberá um alerta visual caso o valor do atleta esteja dentro deste teto.</div>
          </div>

          <div>
            <label style="display:block;font-size:11px;font-weight:800;color:#facc15;margin-bottom:6px">📝 ANOTAÇÕES & PARECER DO TREINADOR</label>
            <textarea id="inputFavNote" rows="3" style="width:100%;padding:10px 12px;background:#0b0816;border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#fff;font-size:12px;resize:none;box-sizing:border-box">${window.esc ? window.esc(fav.note || '') : (fav.note || '')}</textarea>
          </div>

          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
            <button class="btn" id="btnRemoveFavFromModal" style="background:rgba(239,68,68,0.15);border:1px solid #ef4444;color:#fca5a5;padding:8px 14px;font-weight:800;border-radius:8px">
              ❌ Remover dos Favoritos
            </button>
            <div style="display:flex;gap:8px">
              <button class="btn" id="btnCancelFavModal" style="padding:8px 14px;border-radius:8px">Cancelar</button>
              <button class="btn primary" id="btnSaveFavModal" style="background:linear-gradient(135deg,#7c3aed,#2563eb);border:none;padding:8px 18px;font-weight:900;border-radius:8px">
                Salvar Informações
              </button>
            </div>
          </div>
        </div>
      `;

      if(typeof window.openCustomModal === 'function'){
        window.openCustomModal('⭐ Gerenciar Atleta nos Favoritos', bodyHtml, null, 'Fechar', false, '540px');
      }

      const saveBtn = document.querySelector('#btnSaveFavModal');
      if(saveBtn){
        saveBtn.onclick = () => {
          const maxP = parseFloat(document.querySelector('#inputFavMaxPrice')?.value) || fav.valMi;
          const note = document.querySelector('#inputFavNote')?.value || '';
          fav.maxPrice = maxP;
          fav.note = note;
          if(typeof window.toast === 'function') window.toast('⭐ Informações do favorito atualizadas!');
          if(typeof window.save === 'function') window.save();
          if(typeof window.closeCustomModal === 'function') window.closeCustomModal();
          // Se estiver na aba de favoritos, re-renderiza
          if(window.marketTab === 'favs' && typeof window.render === 'function') window.render();
        };
      }

      const removeBtn = document.querySelector('#btnRemoveFavFromModal');
      if(removeBtn){
        removeBtn.onclick = () => {
          MarketFavorites.toggleFavorite(key);
          if(typeof window.closeCustomModal === 'function') window.closeCustomModal();
          if(window.marketTab === 'favs' && typeof window.render === 'function') window.render();
        };
      }

      const cancelBtn = document.querySelector('#btnCancelFavModal');
      if(cancelBtn){
        cancelBtn.onclick = () => {
          if(typeof window.closeCustomModal === 'function') window.closeCustomModal();
        };
      }
    },

    // Renderiza o Dashboard da aba de Favoritos dentro do Mercado
    renderFavoritesTab(){
      const state = window.state;
      const list = (state?.marketFavorites || []);
      const windowOpen = typeof window.isTransferWindowOpen === 'function' ? window.isTransferWindowOpen(state?.date) : true;

      if(!list.length){
        return `
          <div class="card" style="text-align:center;padding:40px 20px;margin-top:14px;background:#0f172a;border:1px dashed rgba(255,255,255,0.15);border-radius:14px">
            <span style="font-size:38px">⭐</span>
            <h3 style="margin:10px 0 4px 0;font-size:18px;color:#fff">Sua Lista de Favoritos (Wishlist) está vazia</h3>
            <p style="color:#94a3b8;font-size:13px;max-width:480px;margin:0 auto 16px auto">
              Marque jogadores com a estrela ⭐ nas abas de Comprar, Empréstimo ou na Lupa para monitorar seus valores, definir tetos de preço e salvar observações táticas.
            </p>
            <button class="btn primary" id="btnGoToMarketBuy" style="background:linear-gradient(135deg,#7c3aed,#2563eb);border:none;font-weight:900;padding:10px 22px;border-radius:10px">
              🔍 Explorar Mercado de Transferências
            </button>
          </div>
        `;
      }

      return `
        <div style="margin-top:14px;display:flex;flex-direction:column;gap:12px">
          <!-- CABEÇALHO DO DASHBOARD DE FAVORITOS -->
          <div style="background:linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(37,99,235,0.15) 100%);border:1px solid rgba(124,58,237,0.3);border-radius:12px;padding:12px 18px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
            <div style="display:flex;align-items:center;gap:10px">
              <span style="font-size:24px">⭐</span>
              <div>
                <div style="font-size:15px;font-weight:900;color:#fff;letter-spacing:0.5px">RADAR DE CONTRATAÇÕES PRIORITÁRIAS</div>
                <div style="font-size:11px;color:#94a3b8">Você está monitorando <b>${list.length} atletas</b> recomendados para reforçar o ${state?.club || 'clube'}.</div>
              </div>
            </div>
            <div style="display:flex;gap:12px;align-items:center">
              <div style="background:rgba(0,0,0,0.3);padding:6px 12px;border-radius:8px;border:1px solid rgba(255,255,255,0.08);font-size:11px">
                <span style="color:#94a3b8">Saldo em Caixa: </span><b style="color:#f59e0b">${typeof window.fmtMoney === 'function' ? window.fmtMoney(state.balance) : 'R$ ' + state.balance}</b>
              </div>
            </div>
          </div>

          <!-- TABELA COMPLETA DE FAVORITOS -->
          <div class="tablewrap card">
            <table>
              <thead>
                <tr>
                  <th style="width:40px;text-align:center">⭐</th>
                  <th>Jogador</th>
                  <th>Clube Atual</th>
                  <th>Pos</th>
                  <th>Overall</th>
                  <th>Idade</th>
                  <th>Valor de Mercado</th>
                  <th>Teto Estipulado</th>
                  <th>Parecer do Treinador</th>
                  <th style="text-align:right">Ações</th>
                </tr>
              </thead>
              <tbody>
                ${list.map(fav => {
                  const valMi = fav.valMi || 5;
                  const maxP = fav.maxPrice || valMi;
                  const canAfford = (valMi * 1e6) <= (state?.balance || 0);
                  const isUnderCeiling = valMi <= maxP;
                  const ceilingClass = isUnderCeiling ? 'color:#34d399' : 'color:#f87171';
                  const key = fav.key;

                  return `
                    <tr>
                      <td style="text-align:center">
                        <button type="button" class="btn btn-fav-star active" data-key="${window.esc ? window.esc(key) : key}" title="Remover dos favoritos" style="background:none;border:none;cursor:pointer;font-size:16px;color:#facc15">⭐</button>
                      </td>
                      <td><b>${window.esc ? window.esc(fav.name) : fav.name}</b></td>
                      <td><div class="club-cell">${typeof window.clubBadge === 'function' ? window.clubBadge(fav.club, 20) : ''} ${window.esc ? window.esc(fav.club || '-') : (fav.club || '-')}</div></td>
                      <td><span class="pill" style="font-size:11px">${window.esc ? window.esc(fav.pos || '-') : (fav.pos || '-')}</span></td>
                      <td><span class="rating-pill ${typeof window.ratingClass === 'function' ? window.ratingClass(fav.ovr) : ''}">${fav.ovr}</span></td>
                      <td>${fav.age || '-'} anos</td>
                      <td><b class="good">R$ ${valMi.toFixed(1)} mi</b></td>
                      <td><b style="${ceilingClass}">R$ ${maxP.toFixed(1)} mi</b></td>
                      <td style="max-width:220px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:11px;color:#cbd5e1" title="${window.esc ? window.esc(fav.note || '') : (fav.note || '')}">
                        💬 ${window.esc ? window.esc(fav.note || 'Sem anotações') : (fav.note || 'Sem anotações')}
                      </td>
                      <td style="text-align:right">
                        <div style="display:inline-flex;gap:6px;align-items:center;justify-content:flex-end">
                          <button type="button" class="btn btn-fav-edit" data-key="${window.esc ? window.esc(key) : key}" style="background:#1e293b;border:1px solid #334155;color:#38bdf8;padding:5px 9px;border-radius:6px;font-size:11px;cursor:pointer" title="Editar Teto e Anotações">
                            ✏️ Editar
                          </button>
                          <button type="button" class="btn btn-lupa-details" data-key="${window.esc ? window.esc(key) : key}" title="Ver atributos e ficha técnica do atleta" style="background:#3b1d7a;color:#fff;border:1px solid #a78bfa;border-radius:6px;padding:5px 9px;cursor:pointer;font-size:11px;line-height:1">
                            🔍
                          </button>
                          <button type="button" class="btn primary buy btn-fav-buy" data-key="${window.esc ? window.esc(key) : key}" ${(!windowOpen || !canAfford) ? 'disabled' : ''} style="padding:5px 12px;font-size:11px;font-weight:800">
                            ${!windowOpen ? 'Janela Fechada' : (!canAfford ? 'Sem Caixa' : 'Comprar')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    },

    // Vincula eventos da aba de favoritos
    bindFavoritesEvents(){
      const editBtns = document.querySelectorAll('.btn-fav-edit');
      editBtns.forEach(b => {
        b.onclick = () => this.openEditFavoriteModal(b.dataset.key);
      });

      const buyBtns = document.querySelectorAll('.btn-fav-buy');
      buyBtns.forEach(b => {
        b.onclick = () => {
          if(typeof window.buyPlayer === 'function') window.buyPlayer(b.dataset.key);
        };
      });

      const starBtns = document.querySelectorAll('.btn-fav-star');
      starBtns.forEach(b => {
        b.onclick = (e) => {
          e.stopPropagation();
          this.toggleFavorite(b.dataset.key);
          if(window.marketTab === 'favs' && typeof window.render === 'function') window.render();
        };
      });

      const goMarketBtn = document.querySelector('#btnGoToMarketBuy');
      if(goMarketBtn){
        goMarketBtn.onclick = () => {
          window.marketTab = 'buy';
          if(typeof window.render === 'function') window.render();
        };
      }
    }
  };

  window.AFM_MarketFavorites = MarketFavorites;

})(typeof window !== 'undefined' ? window : globalThis);
