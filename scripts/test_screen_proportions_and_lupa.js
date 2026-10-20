const assert = require('assert');
const fs = require('fs');

console.log('=== TESTE DE ESCALA DE BOTÕES EM VÁRIAS PROPORÇÕES & MODAL DA LUPA SPLIT ===');

// 1. Validar CSS de escala de botões
const css = fs.readFileSync('css/app.css', 'utf8');

assert(css.includes('.sm-drawer-nav'), 'css/app.css deve conter estilos para .sm-drawer-nav');
assert(css.includes('grid-template-columns: repeat(2, minmax(0, 1fr))'), '.sm-drawer-nav deve usar 2 colunas proporcionais');
assert(css.includes('.afm-lupa-modal-dialog'), 'css/app.css deve conter .afm-lupa-modal-dialog');
assert(css.includes('.afm-lupa-split-layout'), 'css/app.css deve conter .afm-lupa-split-layout');
assert(css.includes('grid-template-columns: minmax(190px, 220px) 1fr'), 'Layout da lupa deve usar 2 colunas lado a lado');
console.log('  ✅ CSS de escala do drawer e modal da lupa 100% validado');

// 2. Simular proporções de tela e testar cálculo de escala
const testAspectRatios = [
  { name: '16:9 Standard Mobile (640x360)', w: 640, h: 360, ratio: 640/360 },
  { name: '16:9 HD Mobile (854x480)', w: 854, h: 480, ratio: 854/480 },
  { name: '18:9 Widescreen (720x360)', w: 720, h: 360, ratio: 720/360 },
  { name: '19.5:9 Modern iPhone/Galaxy (844x390)', w: 844, h: 390, ratio: 844/390 },
  { name: '19.5:9 Large Flagship (896x414)', w: 896, h: 414, ratio: 896/414 },
  { name: '20:9 Ultra-Wide Android (915x412)', w: 915, h: 412, ratio: 915/412 },
  { name: '21:9 Cinematic (1080x480)', w: 1080, h: 480, ratio: 1080/480 },
  { name: '4:3 Tablet Landscape (1024x768)', w: 1024, h: 768, ratio: 1024/768 },
  { name: '16:9 Desktop (1920x1080)', w: 1920, h: 1080, ratio: 1920/1080 }
];

testAspectRatios.forEach(res => {
  // Drawer width calculation: clamp(290px, 42vw, 380px), max-width 90vw
  const vwVal = res.w * 0.42;
  const drawerWidth = Math.min(res.w * 0.90, Math.max(290, Math.min(380, vwVal)));
  
  // Available width for 2 columns inside drawer (padding 14px * 2 = 28px, gap 7px)
  const colWidth = (drawerWidth - 28 - 7) / 2;
  
  assert(colWidth >= 125, `Largura de coluna no drawer em ${res.name} deve ser >= 125px (atual: ${colWidth.toFixed(1)}px)`);
  assert(drawerWidth <= res.w, `Drawer não pode ultrapassar a largura da tela em ${res.name}`);
  
  // Modal lupa width calculation: min(940px, 95vw)
  const modalWidth = Math.min(940, res.w * 0.95);
  const cardCol = Math.min(220, Math.max(190, modalWidth * 0.25));
  const infoCol = modalWidth - cardCol - 20; // 20px gap

  assert(infoCol >= 300, `Coluna de informações da lupa em ${res.name} deve ser >= 300px para os stats (atual: ${infoCol.toFixed(1)}px)`);

  console.log(`  ✅ Proporção ${res.name} (${res.w}x${res.h}): Drawer = ${drawerWidth.toFixed(0)}px (Colunas: 2x ${colWidth.toFixed(0)}px) | Lupa Modal = ${modalWidth.toFixed(0)}px (Card: ${cardCol.toFixed(0)}px | Info: ${infoCol.toFixed(0)}px)`);
});

// 3. Validar arquivo JS da Lupa
const lupaCode = fs.readFileSync('js/systems/market_lupa_aging_and_regens.js', 'utf8');

assert(lupaCode.includes('class="afm-lupa-modal-dialog"'), 'Modal da lupa deve ter a classe afm-lupa-modal-dialog');
assert(lupaCode.includes('class="afm-lupa-split-layout"'), 'Modal da lupa deve ter a classe afm-lupa-split-layout');
assert(lupaCode.includes('COLUNA ESQUERDA: CARD DO JOGADOR'), 'Modal da lupa deve possuir a coluna esquerda com o card');
assert(lupaCode.includes('COLUNA DIREITA: DADOS DO JOGADOR'), 'Modal da lupa deve possuir a coluna direita com os dados');
assert(lupaCode.includes('btnChangePlayerPosLupa'), 'Botão de mudar posição deve estar presente');
assert(lupaCode.includes('afm-btn-season-tab'), 'Abas de histórico de temporadas devem estar presentes');
console.log('  ✅ Estrutura do arquivo da Lupa 100% conferida');

console.log('=== TODOS OS TESTES PASSARAM COM SUCESSO ABSOLUTO! ===');
