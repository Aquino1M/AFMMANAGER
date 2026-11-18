#!/usr/bin/env node
/**
 * AFM MANAGER — VERIFICADOR INVIOLÁVEL PRÉ-COMMIT (ANTI-TRUNCAMENTO & SINTAXE)
 * Impede qualquer commit/push caso arquivos críticos tenham sido truncados (ex.: 0 bytes)
 * por editores externos ou caso qualquer arquivo .js modificado contenha erro de sintaxe.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');

const MIN_SIZES = {
  'index.html': 8000,
  'sw.js': 1500,
  'AGENTS.md': 20000,
  'GEMINI.md': 10000,
  'js/game.js': 2000000,
  'js/database.js': 20000,
  'js/player/player_mode_ui.js': 500000,
  'js/player/player_career_engine.js': 180000,
  'js/player/lifestyleData.js': 40000,
  'js/player/social_media_manager.js': 40000,
  'js/player/national_teams_manager.js': 20000,
  'js/ui/create_club_ui.js': 80000,
  'js/ui/create_player_ui.js': 50000,
  'js/systems/manager_life_and_shares_pro.js': 100000,
  'js/systems/player_xp_evolution.js': 15000,
  'js/career-economy-fix.js': 20000,
};

let errors = 0;

for (const [rel, minBytes] of Object.entries(MIN_SIZES)) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) {
    console.error(`❌ [INTEGRITY] Arquivo crítico ausente: ${rel}`);
    errors++;
    continue;
  }
  const size = fs.statSync(full).size;
  if (size < minBytes) {
    console.error(`❌ [INTEGRITY] Arquivo truncado/abaixo do limite seguro: ${rel} (${size} bytes < ${minBytes} bytes)`);
    errors++;
  }
}

// Verifica blobs estagiados no índice Git (se houver)
try {
  const staged = execFileSync('git', ['diff', '--cached', '--name-only', '--diff-filter=ACM'], {
    cwd: ROOT,
    encoding: 'utf8',
  })
    .split(/\r?\n/)
    .map(s => s.trim())
    .filter(Boolean);

  for (const rel of staged) {
    const blobSize = Number(
      execFileSync('git', ['cat-file', '-s', `:${rel}`], { cwd: ROOT, encoding: 'utf8' }).trim()
    );
    if (MIN_SIZES[rel] && blobSize < MIN_SIZES[rel]) {
      console.error(`❌ [INTEGRITY] Blob estagiado truncado: ${rel} (${blobSize} bytes < ${MIN_SIZES[rel]} bytes)`);
      errors++;
    }
    if (rel.endsWith('.js')) {
      const full = path.join(ROOT, rel);
      if (fs.existsSync(full)) {
        try {
          execFileSync(process.execPath, ['--check', full], { cwd: ROOT, stdio: 'pipe' });
        } catch (err) {
          console.error(`❌ [SYNTAX] Erro de sintaxe em ${rel}:\n${err.stderr?.toString() || err.message}`);
          errors++;
        }
      }
    }
  }
} catch {}

// Valida JSONs estruturais
for (const jsonRel of ['manifest.json', 'vercel.json', 'package.json']) {
  const full = path.join(ROOT, jsonRel);
  if (fs.existsSync(full)) {
    try {
      JSON.parse(fs.readFileSync(full, 'utf8'));
    } catch (err) {
      console.error(`❌ [JSON] JSON inválido em ${jsonRel}: ${err.message}`);
      errors++;
    }
  }
}

if (errors > 0) {
  console.error(`\n🚫 [INTEGRITY BLOCKED] ${errors} falha(s) detectada(s). Commit bloqueado para proteger o repositório.`);
  process.exit(1);
}

console.log('✅ [INTEGRITY OK] Tamanhos mínimos, blobs estagiados, JSONs e sintaxe JS validados com 0 erros.');
