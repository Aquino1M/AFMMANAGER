const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const gameSource = fs.readFileSync(path.resolve('js/game.js'), 'utf8');

// 1. Testa declaração e renderização de managerPhoto
assert(gameSource.includes('function managerPhoto('), 'function managerPhoto deve existir');
assert(gameSource.includes('function openManagerPhotoModal('), 'function openManagerPhotoModal deve existir');

function extractFunc(name) {
  const marker = `function ${name}(`;
  const idx = gameSource.indexOf(marker);
  if (idx === -1) throw new Error(`${name} not found`);
  let depth = 0;
  let started = false;
  for (let i = idx; i < gameSource.length; i++) {
    if (gameSource[i] === '{') {
      depth++;
      started = true;
    } else if (gameSource[i] === '}') {
      depth--;
      if (started && depth === 0) {
        return gameSource.slice(idx, i + 1);
      }
    }
  }
  throw new Error(`Incomplete ${name}`);
}

const ctx = {
  window: {},
  esc: (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'),
  MANAGER_AVATARS: ['👨‍💼', '👔', '😎', '🧔'],
  currentManagerAvatarIdx: 0,
  state: { manager: 'Vini', managerPhoto: null, managerAvatar: '😎' }
};
ctx.window = ctx;

vm.runInNewContext(extractFunc('managerPhoto'), ctx);

// Teste 1: Renderiza avatar padrão quando sem foto
const avatarHtml = ctx.managerPhoto(ctx.state, 58);
assert(avatarHtml.includes('😎'), 'Deve renderizar o avatar do técnico');
assert(!avatarHtml.includes('<img'), 'Não deve renderizar img sem foto');

// Teste 2: Renderiza foto personalizada quando informada
ctx.state.managerPhoto = 'data:image/jpeg;base64,/9j/4AAQSkZJRg...';
const photoHtml = ctx.managerPhoto(ctx.state, 58);
assert(photoHtml.includes('<img src="data:image/jpeg;base64,/9j/4AAQSkZJRg..."'), 'Deve renderizar a foto personalizada');
assert(photoHtml.includes('border-radius:50%'), 'Foto deve ser circular');

console.log('✅ PASS: managerPhoto renderiza corretamente foto personalizada e avatar fallback');

// Teste 3: Checa HTML do card do treinador na Central
assert(gameSource.includes('btnManagerAvatarCircle'), 'Avatar do treinador possui container clicável');
assert(gameSource.includes('btnChangeManagerAvatar'), 'Botão de editar foto do treinador presente');
assert(gameSource.includes('📷 EDITAR FOTO'), 'Botão rotulado como 📷 EDITAR FOTO');

// Teste 4: Checa se bind conecta a abertura do modal
assert(gameSource.includes('bAvatar.onclick = () => openManagerPhotoModal()'), 'Botão abre openManagerPhotoModal');
assert(gameSource.includes('bAvatarCircle.onclick = () => openManagerPhotoModal()'), 'Círculo do avatar abre openManagerPhotoModal');

console.log('✅ PASS: Central vincula 100% dos cliques ao modal de personalização de foto');

// Teste 5: Validação do ranking de treinadores com foto
const pixSource = fs.readFileSync(path.resolve('js/systems/coach_ranking_pix.js'), 'utf8');
assert(pixSource.includes('state?.managerPhoto'), 'Ranking de treinadores exibe foto personalizada do usuário');

console.log('✅ PASS: Ranking nacional PIX também exibe a foto personalizada do treinador!');
