const fs = require('fs');
const path = require('path');
const assert = require('assert');

const gameSource = fs.readFileSync(path.resolve('js/game.js'), 'utf8');

// Verifica se no modal de empréstimo a idade do atleta é renderizada
assert(gameSource.includes('${p.age ? `<span class="pill" style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.9);background:rgba(255,255,255,0.08)">${p.age} anos</span>` : \'\'}'), 'Pill de idade do jogador deve estar no cabeçalho do empréstimo');
assert(gameSource.includes('Cedente: <b>${esc(from)}</b>${p.age ? ` • <b>${p.age} anos</b>` : \'\'}'), 'Idade do jogador deve estar no subtítulo de informações do empréstimo');

console.log('✅ PASS: Idade do atleta incluída com sucesso na tela de negociação de empréstimo!');
