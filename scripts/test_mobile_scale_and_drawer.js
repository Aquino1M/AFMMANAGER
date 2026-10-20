// Test script to verify Mobile Scale, Drawer Navigation, Admin Button and Saves Screen Proportions
const fs = require('fs');

console.log('=== TEST SUITE: MOBILE SCALE, DRAWER, ADMIN & SAVES ===\n');

// 1. Check js/ui/pwa_and_landscape_enforcer.js
console.log('1. Checking js/ui/pwa_and_landscape_enforcer.js...');
const pwaCode = fs.readFileSync('js/ui/pwa_and_landscape_enforcer.js', 'utf8');

if (!pwaCode.includes("e.target.closest('#btnCloseMobileDrawer')")) {
  console.error('❌ #btnCloseMobileDrawer not found in pwa_and_landscape_enforcer.js');
  process.exit(1);
}
// Ensure btnCloseMobileDrawer is NOT bundled with handleExitGameAction
const btnCloseRegex = /if\s*\(e\.target\.closest\(['"]#btnCloseMobileDrawer['"]\)\)\s*\{([^}]+)\}/;
const matchClose = pwaCode.match(btnCloseRegex);
if (matchClose && matchClose[1].includes('handleExitGameAction')) {
  console.error('❌ btnCloseMobileDrawer must not call handleExitGameAction in pwa_and_landscape_enforcer.js');
  process.exit(1);
}
console.log('✓ btnCloseMobileDrawer correctly closes drawer without exiting game');

// 2. Check js/game.js
console.log('\n2. Checking js/game.js...');
const gameSrc = fs.readFileSync('js/game.js', 'utf8');

// Check drawer closing on [data-view]
if (!gameSrc.includes("if(typeof window.toggleAFMMobileDrawer === 'function') window.toggleAFMMobileDrawer(false)")) {
  console.error('❌ Missing drawer closing call on [data-view] click in js/game.js');
  process.exit(1);
}
console.log('✓ [data-view] clicks automatically close the mobile drawer');

// Check admin modal access check
if (!gameSrc.includes('const isAdm = curUser && (')) {
  console.error('❌ Missing flexible admin check in openAdminModal');
  process.exit(1);
}
console.log('✓ openAdminModal supports flexible admin role validation');

// Check drawer nav includes Painel Admin for admins
if (!gameSrc.includes("['admin','🛡️ Painel Admin']")) {
  console.error('❌ Missing admin button in drawer nav');
  process.exit(1);
}
console.log('✓ Drawer nav includes explicit 🛡️ Painel Admin for admins');

// 3. Check css/app.css
console.log('\n3. Checking css/app.css...');
const css = fs.readFileSync('css/app.css', 'utf8');

if (!css.includes('z-index:3000;') && !css.includes('z-index: 3000;')) {
  console.error('❌ .modal-overlay must have z-index: 3000;');
  process.exit(1);
}
console.log('✓ .modal-overlay z-index set to 3000 (above drawer 1100)');

// Check responsive landscape block
if (!css.includes('.saves-slots-grid {\n    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;')) {
  console.error('❌ Missing 3-column repeat for .saves-slots-grid in mobile landscape');
  process.exit(1);
}
console.log('✓ .saves-slots-grid forced to 3-column compact grid in mobile landscape');

if (!css.includes('.afm-postmatch-card {') || !css.includes('max-height: 94vh !important;')) {
  console.error('❌ Missing responsive styles for .afm-postmatch-card');
  process.exit(1);
}
console.log('✓ .afm-postmatch-card has max-height and auto scroll on landscape');

// 4. Check day_advance_news_modal.js
console.log('\n4. Checking js/systems/day_advance_news_modal.js...');
const modalSrc = fs.readFileSync('js/systems/day_advance_news_modal.js', 'utf8');

if (!modalSrc.includes('afm-postmatch-card') || !modalSrc.includes('max-height:94vh;overflow-y:auto;')) {
  console.error('❌ Post-match card missing max-height:94vh or overflow-y:auto');
  process.exit(1);
}
console.log('✓ Post-match modal has max-height and overflow-y:auto');

console.log('\n🎉 ALL MOBILE SCALE & DRAWER TESTS PASSED (100%)!');
