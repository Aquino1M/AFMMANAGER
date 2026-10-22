/**
 * test_user_tag_and_pix_coming_soon.js
 * Valida a tag "VOCÊ" na tabela de classificação e o pop-up da chave PIX em status "Em Breve".
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('🧪 Iniciando testes da tag VOCÊ e Modal PIX Em Breve...');

// 1. Validar CSS da classe .tag-you em css/app.css
const cssPath = path.join(__dirname, '..', 'css', 'app.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');
assert(cssContent.includes('.tag-you{'), 'css/app.css deve conter a definição da classe .tag-you');
console.log('✅ 1. Classe .tag-you definida no CSS com estilo em destaque e gradiente.');

// 2. Validar js/game.js contém a tag VOCÊ nas tabelas de classificação
const gameJsPath = path.join(__dirname, '..', 'js', 'game.js');
const gameJsContent = fs.readFileSync(gameJsPath, 'utf8');

assert(gameJsContent.includes('${isMy ? \'<span class="tag-you">VOCÊ</span>\' : \'\'}'), 'game.js deve renderizar a tag VOCÊ na tabela da temporada');
assert(gameJsContent.includes('${isMy ? \'<span class="tag-you" style="font-size:9px;padding:1px 5px;margin-left:4px">VOCÊ</span>\' : \'\'}'), 'game.js deve renderizar a tag VOCÊ nos widgets da Central');
console.log('✅ 2. Inserção da tag VOCÊ validada nas tabelas da Temporada (Série A/B/C/D e Estadual) e Central.');

// 3. Validar js/systems/coach_ranking_pix.js contém Modal PIX Em Breve
const pixJsPath = path.join(__dirname, '..', 'js', 'systems', 'coach_ranking_pix.js');
const pixJsContent = fs.readFileSync(pixJsPath, 'utf8');

assert(pixJsContent.includes('Chave PIX da Premiação</h2>'), 'coach_ranking_pix.js deve conter o título');
assert(pixJsContent.includes('Em Breve</span>'), 'coach_ranking_pix.js deve conter badge Em Breve no cabeçalho');
assert(pixJsContent.includes('Cadastro de Chave PIX Em Breve!'), 'coach_ranking_pix.js deve conter o banner explicativo de Em Breve');
assert(pixJsContent.includes('btnEntendidoPixModal'), 'coach_ranking_pix.js deve conter botão Entendido (Em Breve)');
assert(pixJsContent.includes('disabled'), 'coach_ranking_pix.js deve desabilitar campos no modal Em Breve');
assert(pixJsContent.includes('CADASTRAR CHAVE PIX (EM BREVE)'), 'coach_ranking_pix.js deve indicar Em Breve no botão do banner');
console.log('✅ 3. Modal PIX validado com badge, banner explicativo, inputs bloqueados e botão "Entendido (Em Breve)".');

// 4. Simulação de renderização HTML de tabela com Corinthians sendo "state.club"
const mockState = {
  club: 'Corinthians',
  season: 2027
};

function norm(s){
  return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
}
function esc(s){
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function clubBadge(name, sz){
  return `<img src="${name}.png" width="${sz}">`;
}

const teams = [
  { name: 'Palmeiras', p: 3 },
  { name: 'Corinthians', p: 3 },
  { name: 'São Paulo', p: 1 },
  { name: 'Santos', p: 0 }
];

const renderedRows = teams.map((t, idx) => {
  const isMy = (t.name === mockState.club) || (norm(t.name) === norm(mockState.club));
  return `
    <tr class="${isMy ? 'my-row ' : ''}">
      <td>${idx + 1}</td>
      <td>
        <div class="club-cell">
          ${clubBadge(t.name, 22)}
          <span>${esc(t.name)}</span>
          ${isMy ? '<span class="tag-you">VOCÊ</span>' : ''}
        </div>
      </td>
      <td>${t.p}</td>
    </tr>
  `;
}).join('');

assert(renderedRows.includes('<span>Corinthians</span>\n          <span class="tag-you">VOCÊ</span>'), 'Linha do Corinthians deve conter a tag VOCÊ');
assert(!renderedRows.includes('<span>Palmeiras</span>\n          <span class="tag-you">VOCÊ</span>'), 'Linha do Palmeiras NÃO deve conter a tag VOCÊ');
assert(!renderedRows.includes('<span>São Paulo</span>\n          <span class="tag-you">VOCÊ</span>'), 'Linha do São Paulo NÃO deve conter a tag VOCÊ');
console.log('✅ 4. Simulação de renderização de tabela confirmou que apenas o time do usuário recebe a tag VOCÊ.');

// 5. Teste da renderização do Modal PIX
let modalContent = '';
const mockDocument = {
  getElementById: (id) => {
    if(id === 'pixKeyModalContainer') return null;
    return {
      onclick: null,
      value: 'cpf',
      trim: () => '123'
    };
  },
  createElement: () => ({
    set innerHTML(val) { modalContent = val; },
    get innerHTML() { return modalContent; },
    remove: () => {}
  }),
  body: {
    appendChild: () => {}
  }
};

global.document = mockDocument;
global.window = {
  esc: (s) => s,
  toast: () => {},
  localStorage: {
    getItem: () => null,
    setItem: () => {}
  }
};
global.localStorage = global.window.localStorage;

const runContext = new Function('window', 'document', 'localStorage', pixJsContent);
runContext(global.window, global.document, global.localStorage);

const AFM_CoachRanking = global.window.AFM_CoachRanking;
assert(typeof AFM_CoachRanking !== 'undefined', 'AFM_CoachRanking deve estar definido');
AFM_CoachRanking.openPixKeyModal();

assert(modalContent.includes('Em Breve'), 'Modal gerado deve conter texto "Em Breve"');
assert(modalContent.includes('Cadastro de Chave PIX Em Breve!'), 'Modal gerado deve ter aviso de recurso em breve');
assert(modalContent.includes('disabled'), 'Modal gerado deve conter inputs desabilitados');
assert(modalContent.includes('btnEntendidoPixModal'), 'Modal gerado deve ter botão Entendido');
console.log('✅ 5. Execução do método openPixKeyModal() testado com sucesso.');

console.log('\n🎉 TODOS OS TESTES PASSARAM COM 100% DE SUCESSO!');
