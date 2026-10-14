const fs = require('fs');
const path = require('path');
const vm = require('vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const scriptMatches = [...html.matchAll(/<script\s+src=["']([^"']+)["']/g)].map(m => m[1]);

console.log('Total scripts found in index.html:', scriptMatches.length);

const sandbox = {
  window: {},
  document: {
    getElementById: () => null,
    querySelectorAll: () => [],
    querySelector: () => null,
    createElement: () => ({ style: {}, appendChild: () => {} }),
    body: { appendChild: () => {}, innerText: '', querySelectorAll: () => [] }
  },
  navigator: { userAgent: 'node' },
  console,
  setTimeout: () => {},
  setInterval: () => {},
  clearTimeout: () => {},
  clearInterval: () => {},
  localStorage: { getItem: () => null, setItem: () => {} }
};
sandbox.window = sandbox;
sandbox.global = sandbox;

const context = vm.createContext(sandbox);

for (const src of scriptMatches) {
  if (src.startsWith('http')) continue;
  const filePath = path.resolve(__dirname, '..', src);
  try {
    const code = fs.readFileSync(filePath, 'utf8');
    vm.runInContext(code, context, { filename: src });
    console.log('✅ Loaded:', src);
  } catch (err) {
    console.error('❌ FAILED to load/run:', src, err.message, err.stack);
  }
}
