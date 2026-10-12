const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const css = fs.readFileSync(path.join(root, 'css/app.css'), 'utf8');
const game = fs.readFileSync(path.join(root, 'js/game.js'), 'utf8');

function extractRule(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = css.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`, 's'));
  assert.ok(match, `Regra CSS ausente: ${selector}`);
  return match[1];
}

// These selectors are consumed by openHalftimeModal()/setupTacticsInteractions().
for (const selector of [
  '.halftime-overlay',
  '.halftime-card',
  '.halftime-header',
  '.halftime-footer',
  '.tactics-modal-container',
  '.tactics-pitch-wrapper',
  '.tactics-bench-wrapper'
]) {
  assert.match(css, new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
}

for (const id of [
  'halftimeModalContainer',
  'halftimeTacticsContainer',
  'halftimePitchBox',
  'halftimeBenchWrapper',
  'btnResumeSecondHalf',
  'chkAutoSubAssistant'
]) {
  assert.ok(game.includes(`id="${id}"`) || game.includes(`$('#${id}')`), `DOM do intervalo não contém referência a #${id}`);
}

const card = extractRule('.halftime-card');
assert.match(card, /height:\s*100vh/);
assert.match(card, /max-height:\s*100vh/);
assert.match(card, /overflow:\s*hidden\s*!important/);

const tactics = extractRule('.tactics-modal-container');
assert.match(tactics, /min-height:\s*0\s*!important/, 'Modal deve anular min-height global de 560px');
assert.match(tactics, /flex:\s*1 1 auto\s*!important/, 'Contêiner tático deve preencher o espaço entre cabeçalho e rodapé');

const bench = extractRule('.halftime-card .tactics-bench-wrapper');
assert.match(bench, /overflow:\s*hidden\s*!important/, 'Banco externo não deve criar uma segunda rolagem');
assert.match(game, /flex:1;overflow-y:auto;overflow-x:hidden;display:flex;flex-direction:column;gap:6px;padding-right:2px/, 'Lista de reservas deve manter sua rolagem interna');
assert.ok(game.includes('class="halftime-footer"'), 'Markup do rodapé precisa continuar no modal');
assert.ok(game.includes('id="btnResumeSecondHalf"'), 'Botão de retomar precisa continuar no modal');

console.log('PASS: seletores do modal de intervalo correspondem ao DOM criado no game.js.');
console.log('PASS: altura de 100vh, contêiner tático sem min-height global e rodapé preservado.');
console.log('PASS: banco sem rolagem externa; lista de reservas mantém rolagem interna.');
