const { spawn } = require('child_process');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artDir = 'C:\\Users\\Aquino\\.gemini\\antigravity\\brain\\21b99a5f-923b-43a5-a8c5-ae714b7b5900';

function capture(url, outPath, width = 1280, height = 850) {
  return new Promise((resolve) => {
    const args = [
      '--headless=new',
      '--no-sandbox',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      `--window-size=${width},${height}`,
      '--virtual-time-budget=3500',
      `--screenshot=${outPath}`,
      url
    ];
    const child = spawn(chromePath, args);
    const timer = setTimeout(() => {
      try { child.kill(); } catch(e){}
      resolve();
    }, 12000);
    child.on('close', () => {
      clearTimeout(timer);
      resolve();
    });
  });
}

async function run() {
  console.log('Capturando Panorâmica Geral 100k...');
  await capture(
    'http://127.0.0.1:8089/test_mobile_harness.html?openStadium=1&stadiumTab=upgrades&stadiumRing=6&allSides=1&stadiumUpgrades=1&stadiumSide=panoramic',
    `${artDir}\\screen_stadium_3d_ring6_panoramic.png`,
    1280,
    850
  );
  console.log('Panorâmica capturada com sucesso!');
  process.exit(0);
}

run();
