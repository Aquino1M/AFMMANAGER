const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const listeners = {};
const documentListeners = {};
let serviceWorkerListener;
const storage = new Map();
let downloaded;
let storageUnavailable = false;
const context = {
  window: { addEventListener(type, callback){ listeners[type] = callback; } },
  navigator: { serviceWorker: { addEventListener(type, callback){ if(type === 'message') serviceWorkerListener = callback; } } },
  localStorage: {
    getItem(key){ if(storageUnavailable) throw new Error('Storage unavailable'); return storage.get(key) || null; },
    setItem(key, value){ if(storageUnavailable) throw new Error('Storage unavailable'); storage.set(key, value); }
  },
  Date, Error, JSON, String, Number, URL: {
    createObjectURL(){ return 'blob:test'; },
    revokeObjectURL(){ }
  },
  Blob: class Blob { constructor(parts){ this.text = parts.join(''); } },
  document: {
    addEventListener(type, callback, capture){ documentListeners[type] = { callback, capture }; },
    body: { appendChild(){} },
    createElement(){ return { click(){ downloaded = this; }, remove(){} }; }
  },
  setTimeout(callback){ callback(); }
};

vm.runInNewContext(fs.readFileSync('js/core/error_log.js', 'utf8'), context);
listeners.error({ error: new Error('Falha ao abrir conta exemplo@site.com com password=secreto'), filename: 'https://game.test/js/game.js?token=segredo', lineno: 12 });
listeners.unhandledrejection({ reason: new Error('Bearer segredo') });
documentListeners.error.callback({ target: { tagName: 'IMG', currentSrc: 'https://game.test/img/missing.svg?token=segredo' } });
documentListeners.error.callback({ target: { tagName: 'IMG', currentSrc: 'https://game.test/img/missing.svg?token=segredo' } });
context.window.AFMErrorLog.record('save-sync', 'Falha ao salvar password=secreto');
context.window.AFMErrorLog.record('handled-test', 'Erro tratado', { stack: 'Error: tratada\n    at save (js/game.js:1)' });
assert.equal(context.window.AFMErrorLog.recordHandled(new Error('Audio indisponível'), 'audio.play'), true);
assert.equal(context.window.AFMErrorLog.recordHandled(new Error('Audio indisponível'), 'audio.play'), false, 'falha opcional repetida é registrada uma única vez');
serviceWorkerListener({ data: { type: 'AFM_OFFLINE_CACHE_MISS', url: 'https://game.test/data/club.js?secret=private' } });

const logs = context.window.AFMErrorLog.getLogs();
assert.equal(logs.length, 7, 'falhas tratadas e recursos são registrados uma única vez');
assert.equal(logs[0].type, 'error');
assert.equal(logs[2].type, 'resource-load');
assert.equal(logs[3].type, 'save-sync');
assert.equal(logs[4].type, 'handled-test');
assert(logs[4].stack.includes('save (js/game.js:1)'), 'falhas tratadas preservam a pilha sanitizada para diagnóstico');
assert.equal(logs[5].type, 'handled-error');
assert.equal(logs[6].type, 'offline-cache-miss');
assert(!JSON.stringify(logs).includes('exemplo@site.com'));
assert(!JSON.stringify(logs).includes('secreto'));
assert(!JSON.stringify(logs).includes('private'));
assert(!JSON.stringify(logs).includes('token=segredo'));
assert(logs[0].source.endsWith('/js/game.js'));

for(let i = 0; i < 110; i++) listeners.error({ message: `Erro ${i}` });
assert.equal(context.window.AFMErrorLog.getLogs().length, 100, 'log tem limite de 100 eventos');
context.window.AFMErrorLog.download();
assert(downloaded.download.endsWith('.log'));
assert(downloaded.href === 'blob:test');
storageUnavailable = true;
context.window.AFMErrorLog.record('memory-fallback', 'Log continua disponível sem LocalStorage');
assert(context.window.AFMErrorLog.getLogs().some(item => item.type === 'memory-fallback'), 'erros continuam exportáveis se o armazenamento local falhar');
console.log('Error log checks passed: 18');
