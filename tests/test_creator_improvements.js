/**
 * Testes Automatizados para Melhorias e Correções do Criador de Atleta 3D (AFM 2026)
 * Valida:
 * 1. Câmera estrita Frente/Costas (remoção de 3/4 e 360 livre)
 * 2. Retrato vetorial 1:1 do boneco 3D em window.generateYoungAthletePortraitUri
 * 3. Influência dinâmica da altura no box de Vantagens e Desvantagens do Biotipo
 * 4. Clubes 100% reais nas propostas de peneira por estado (sem clubes inventados)
 * 5. Desmontagem e transição garantida para a Central do Atleta ao assinar contrato
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Mock DOM com cache de nós para preservação de event listeners
function createMockElement(tag = 'div') {
  const el = {
    tagName: tag.toUpperCase(),
    style: {},
    classList: {
      _classes: new Set(),
      add(c){ this._classes.add(c); },
      remove(c){ this._classes.delete(c); },
      contains(c){ return this._classes.has(c); },
      toggle(c, v){ if(v === undefined) v = !this.contains(c); if(v) this.add(c); else this.remove(c); }
    },
    dataset: {},
    children: [],
    _innerHTML: '',
    _cached: {},
    get innerHTML(){ return this._innerHTML; },
    set innerHTML(html){
      this._innerHTML = html;
      this._cached = {};
      this.children = [];
    },
    value: '',
    checked: false,
    _listeners: {},
    addEventListener(type, cb){
      if(!this._listeners[type]) this._listeners[type] = [];
      this._listeners[type].push(cb);
    },
    removeEventListener(type, cb){
      if(this._listeners[type]) this._listeners[type] = this._listeners[type].filter(fn => fn !== cb);
    },
    dispatchEvent(evt){
      const type = evt.type || evt;
      const list = this._listeners[type] || [];
      list.forEach(fn => fn(evt));
    },
    querySelector(sel){
      if(this._cached[sel]) return this._cached[sel];
      const all = this.querySelectorAll(sel);
      const res = all.length > 0 ? all[0] : null;
      if(res) this._cached[sel] = res;
      return res;
    },
    querySelectorAll(sel){
      const results = [];
      if(this._innerHTML){
        if(sel.startsWith('#')){
          const id = sel.slice(1);
          if(this._innerHTML.includes(`id="${id}"`)){
            const found = createMockElement('div');
            found.id = id;
            return [found];
          }
        }
        if(sel.startsWith('.')){
          const cls = sel.slice(1).split('[')[0];
          if(this._innerHTML.includes(`class="`) && this._innerHTML.includes(cls)){
            const found = createMockElement('div');
            found.classList.add(cls);
            return [found];
          }
        }
      }
      return results;
    },
    remove(){
      this._removed = true;
    }
  };
  return el;
}

// Ambiente Global Mock
global.window = global;
global.document = {
  getElementById: (id) => createMockElement('div'),
  querySelector: (sel) => {
    const el = createMockElement('div');
    if(sel === '#app') el.id = 'app';
    return el;
  },
  createElement: (tag) => createMockElement(tag),
  addEventListener: () => {}
};
global.localStorage = {
  _store: {},
  getItem(k){ return this._store[k] || null; },
  setItem(k, v){ this._store[k] = String(v); },
  removeItem(k){ delete this._store[k]; }
};
global.toast = () => {};

// Carrega scripts
require('../js/competitions.js');
const gameJsCode = fs.readFileSync(path.join(__dirname, '../js/game.js'), 'utf8');
const estMatch = gameJsCode.match(/const AFM_ESTADUAIS_DATA = \[[\s\S]*?\];/);
if(estMatch){
  let code = estMatch[0].replace('const AFM_ESTADUAIS_DATA', 'window.AFM_ESTADUAIS_DATA');
  eval(code);
}

require('../js/player/player_career_engine.js');
require('../js/ui/create_player_ui.js');

console.log('=== TESTES DAS MELHORIAS DO CRIADOR DE ATLETA (AFM 2026) ===\n');

// 1. Validação dos botões de Câmera (Frente e Costas estritos, sem 3/4 e sem 360 livre)
console.log('1. Testando Controles de Câmera e Ângulos 3D...');
const mockContainer = createMockElement('div');
mockContainer.id = 'app';
window.renderCreatePlayerScreen(mockContainer, { email: 'test@afm.com' });
const html = mockContainer.innerHTML;

assert.ok(html.includes('id="btnCamFront"'), 'Deve conter botão de câmera Frente');
assert.ok(html.includes('id="btnCamBack"'), 'Deve conter botão de câmera Costas');
assert.ok(!html.includes('id="btnCamThreeQuarter"'), 'NÃO deve conter botão de câmera 3/4');
assert.ok(!html.includes('🔄 Arraste para girar 360°'), 'NÃO deve conter o texto de arraste 360° bugado');
assert.ok(html.includes('Visualização 3D do atleta (Frente e Costas)'), 'Deve conter a descrição limpa de câmera');
console.log('✔ Câmera estrita Frente e Costas validada com sucesso.');

// 2. Validação do Retrato Vetorial 1:1 do Atleta 3D
console.log('\n2. Testando Geração do Retrato Vetorial 1:1 do Boneco 3D...');
const sampleDraft = {
  name: 'Aquino',
  shirtNumber: 9,
  appearance: {
    skinTone: 'skin_3',
    hairColor: 'hc_black',
    eyeColor: 'ec_dark',
    hairStyle: 'samurai',
    face: 'smile'
  }
};
const uri = window.generateYoungAthletePortraitUri(sampleDraft);
assert.ok(uri.startsWith('data:image/svg+xml;utf8,'), 'Deve gerar Data URI válida de SVG');
const decodedSvg = decodeURIComponent(uri.replace('data:image/svg+xml;utf8,', ''));
assert.ok(decodedSvg.includes('viewBox="75 14 90 90"'), 'SVG deve enquadrar com precisão 1:1 o busto do boneco 3D');
assert.ok(decodedSvg.includes('text-anchor="middle">9</text>'), 'SVG do retrato deve estampar o número da camisa do atleta');
assert.ok(decodedSvg.includes('Coque Samurai') || decodedSvg.includes('fill="#ef4444"'), 'SVG deve reproduzir o corte e laço samurai do modelo 3D');
console.log('✔ Retrato vetorial 1:1 espelhado perfeitamente do modelo 3D.');

// 3. Validação da Influência Dinâmica da Altura no Biotipo
console.log('\n3. Testando Influência da Altura no Box de Vantagens e Desvantagens...');
window.AFM_CreatePlayerUI.setWizardState({ step: 3, height: 1.95, bodyBuild: 'Forte' });
window.renderCreatePlayerScreen(mockContainer, { email: 'test@afm.com' });
const step3Html = mockContainer.innerHTML;

assert.ok(step3Html.includes('id="biotypeProsConsBox"'), 'Deve conter o container reativo id="biotypeProsConsBox"');
assert.ok(step3Html.includes('Estatura Alta (1.95m)'), 'Deve listar vantagens de estatura alta para >= 1.88m');
assert.ok(step3Html.includes('+2 Físico & Jogo Aéreo'), 'Deve bonificar físico e jogo aéreo');
assert.ok(step3Html.includes('-2 Aceleração curta'), 'Deve penalizar agilidade/aceleração curta');

window.AFM_CreatePlayerUI.setWizardState({ step: 3, height: 1.65, bodyBuild: 'Magro' });
window.renderCreatePlayerScreen(mockContainer, { email: 'test@afm.com' });
const step3LowHtml = mockContainer.innerHTML;
assert.ok(step3LowHtml.includes('Baixo Centro de Gravidade (1.65m)'), 'Deve listar vantagens de centro de gravidade baixo para <= 1.70m');
assert.ok(step3LowHtml.includes('+2 Arranque & +1 Drible'), 'Deve bonificar arranque e drible');
assert.ok(step3LowHtml.includes('Baixa Estatura (1.65m): -1 Força e Jogo Aéreo'), 'Deve penalizar jogo aéreo para baixa estatura');
console.log('✔ Altura altera em tempo real as vantagens e desvantagens do biotipo.');

// 4. Validação dos Clubes Reais nas Peneiras (Sem Clubes Fakes)
console.log('\n4. Testando Ofertas de Clubes 100% Reais nas Peneiras...');
window.AFM_CreatePlayerUI.setWizardState({ step: 6, stateUf: 'DF', city: 'Brasília', peneiraTier: 'varzea_local' });

window.renderCreatePlayerScreen(mockContainer, { email: 'test@afm.com' });
const rootEl = mockContainer.querySelector('.afm-player-creator-wrapper');

// Dispara clique no botão de disputar jogo-treino
rootEl.dispatchEvent({
  type: 'click',
  target: {
    closest: (sel) => sel.includes('#btnPlayTryoutDirect') ? createMockElement('button') : null
  }
});

const wizSt = window.AFM_CreatePlayerUI.getWizardState();
assert.ok(wizSt.tryoutResult, 'Deve gerar resultado do jogo-treino');
assert.ok(Array.isArray(wizSt.tryoutResult.clubOffers), 'Deve gerar propostas de clubes');
assert.equal(wizSt.tryoutResult.clubOffers.length, 3, 'Deve ofertar exatamente 3 clubes');

const offeredClubNames = wizSt.tryoutResult.clubOffers.map(o => o.clubName);
console.log('Clubes ofertados para DF:', offeredClubNames);
assert.ok(!offeredClubNames.includes('DF Esporte Clube'), 'PROIBIDO ofertar clubes fakes como DF Esporte Clube');
assert.ok(!offeredClubNames.includes('Brasília FC'), 'PROIBIDO ofertar clubes fakes como Brasília FC');

const validDfClubs = ["Brasília", "Gama", "Brasiliense", "Capital-DF", "Ceilândia", "Real Brasília", "Samambaia", "Paranoá", "Sobradinho", "Planaltina", "Santa Maria"];
offeredClubNames.forEach(club => {
  assert.ok(validDfClubs.includes(club), `Clube ${club} deve ser um clube real e oficial do DF`);
});
console.log('✔ Propostas de peneira utilizam exclusivamente clubes reais do catálogo oficial.');

// 5. Validação da Desmontagem do Criador e Início do Jogo
console.log('\n5. Testando Transição Garantida ao Clicar em Assinar Contrato...');
let renderCalled = false;
window.render = () => { renderCalled = true; };
window.newCareer = ({ clubName, gameMode }) => {
  window.state = {
    club: clubName,
    players: [],
    season: 2026,
    date: '2026-01-01',
    calendar: [],
    gameMode: gameMode || 'player'
  };
};
window.setupSelectedSlot = 2;
window.setupViewMode = 'create_player';

// Simula clique em assinar contrato
rootEl.dispatchEvent({
  type: 'click',
  target: {
    closest: (sel) => sel.includes('#btnStep6SignContract') ? createMockElement('button') : null
  }
});

assert.equal(window.setupViewMode, null, 'setupViewMode deve ser limpo para null');
assert.equal(window.state?.gameMode, 'player', 'state.gameMode deve ser player');
assert.equal(window.state?.view, 'player_hub', 'state.view deve ser player_hub');
assert.equal(window.view, 'player_hub', 'window.view deve ser player_hub');
assert.ok(renderCalled, 'window.render() deve ser chamado com sucesso na transição');
console.log('✔ Transição para player_hub efetuada com sucesso sem travamentos!');

console.log('\n=============================================================');
console.log('🎉 TODAS AS MELHORIAS E FIXES PASSARAM COM 100% DE SUCESSO! 🎉');
console.log('=============================================================');
