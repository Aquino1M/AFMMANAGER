const fs = require('fs');
const assert = require('assert');

// 1. Ler js/game.js e checar os trechos adicionados
const code = fs.readFileSync('js/game.js', 'utf8');

// Verifica banner do Modo Craque
assert(code.includes('create-player-banner-card'), 'Faltou a classe create-player-banner-card');
assert(code.includes('btnGoCreatePlayer'), 'Faltou o ID btnGoCreatePlayer');
assert(code.includes('btnSelectSlotForPlayer'), 'Faltou a classe btnSelectSlotForPlayer');
assert(code.includes('renderCreatePlayerScreen'), 'Faltou a chamada para renderCreatePlayerScreen');

// Verifica limpeza profunda no deleteUserSlot
assert(code.includes('localStorage.removeItem(`afm_save_slot_${slotNum}_backup`);'), 'Faltou limpar backup do slot');
assert(code.includes('localStorage.removeItem(`${STORAGE}_backup`);'), 'Faltou limpar backup do STORAGE legado');
assert(code.includes('save-delete-sweep'), 'Faltou a varredura profunda de chaves do slot');

console.log('✅ Todos os testes de código passaram com sucesso!');
