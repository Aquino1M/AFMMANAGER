/**
 * AFM MANAGER 2027 — SCANNER DE ASSETS FALTANTES
 * Arquivo: scan_missing_assets.js
 */
const fs = require('fs');
const path = require('path');

function checkAssets() {
  console.log('\n============================================================');
  console.log('🔍 RELATÓRIO DE INTEGRIDADE DE ASSETS (ESCUDOS & FOTOS)');
  console.log('============================================================');

  const leagues = ['bra_a', 'bra_b', 'bra_c', 'bra_d', 'arg_1', 'europe', 'asia'];
  let totalBadgesMissing = 0;
  let totalBadgesFound = 0;

  console.log('\n🛡️  ESCUDOS DE CLUBES (img/badges/):');
  for (const l of leagues) {
    const dir = path.join(__dirname, 'img', 'badges', l);
    if (!fs.existsSync(dir)) {
      console.log(`  [${l.toUpperCase()}]: Pasta não encontrada (0 arquivos)`);
      continue;
    }
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.png') || f.endsWith('.svg'));
    totalBadgesFound += files.length;
    console.log(`  [${l.toUpperCase().padEnd(7)}]: ${files.length.toString().padStart(2)} escudos presentes`);
  }

  // Checagem de fotos em img/players
  console.log('\n👤 FOTOS DE JOGADORES (img/players/):');
  const playersDir = path.join(__dirname, 'img', 'players');
  let totalPhotos = 0;
  if (fs.existsSync(playersDir)) {
    const countPhotos = (dir) => {
      let count = 0;
      const items = fs.readdirSync(dir, { withFileTypes: true });
      for (const item of items) {
        const full = path.join(dir, item.name);
        if (item.isDirectory()) {
          count += countPhotos(full);
        } else if (item.name.endsWith('.png') || item.name.endsWith('.jpg') || item.name.endsWith('.webp')) {
          count++;
        }
      }
      return count;
    };
    totalPhotos = countPhotos(playersDir);
    console.log(`  Total de fotos físicas catalogadas: ${totalPhotos}`);
  } else {
    console.log(`  Pasta img/players não encontrada.`);
  }

  console.log('============================================================\n');
}

checkAssets();
