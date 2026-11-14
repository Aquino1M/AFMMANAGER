const { spawnSync } = require('child_process');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const htmlPath = path.resolve(__dirname, 'test_browser_stadium_webgl.html');
const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');

console.log('Iniciando Chrome Headless para testar simulação WebGL gráfica 3D real...');
const res = spawnSync(chromePath, [
  '--headless=new',
  '--dump-dom',
  '--no-sandbox',
  '--enable-webgl',
  '--ignore-gpu-blocklist',
  fileUrl
], { encoding: 'utf-8', timeout: 15000 });

if (res.error) {
  console.error('Erro ao executar Chrome:', res.error);
  process.exit(1);
}

const output = res.stdout || '';
if (output.includes('SUCCESS: ALL WEBGL TESTS PASSED')) {
  console.log('✓ TESTE DE SIMULAÇÃO GRÁFICA WEBGL NO CHROME REAL CONCLUÍDO COM 100% DE SUCESSO!');
  console.log('Detalhes da execução:');
  const match = output.match(/<div id="test-results">([\s\S]*?)<\/div>/);
  if (match) {
    console.log(match[1].trim());
  }
} else {
  console.error('Falha no teste gráfico WebGL:');
  console.error(output);
  process.exit(1);
}
