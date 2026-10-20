// Exemplo de integração: Three.js / React Three Fiber (Three.js puro)
// Copie a pasta "modelos" para public/assets/stadios/.
//
// Para substituir todo o estádio:
// load('/assets/stadios/arena_moderna.glb')
//
// Para manter o campo/players do BRFC27 e trocar apenas as arquibancadas:
// load('/assets/stadios/gradas_modulares_sem_campo.glb')
//
// O campo-base mede aproximadamente 105 x 68 unidades. Ajuste escala e posição
// conforme a escala real do campo existente no jogo.

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const loader = new GLTFLoader();

export function carregarEstadio(scene, arquivo = 'gradas_modulares_sem_campo.glb') {
  return new Promise((resolve, reject) => {
    loader.load(
      `/assets/stadios/${arquivo}`,
      (gltf) => {
        const estadio = gltf.scene;
        estadio.position.set(0, 0, 0);
        estadio.scale.set(1, 1, 1); // ajustar se o campo atual usar outra escala
        scene.add(estadio);
        resolve(estadio);
      },
      undefined,
      reject
    );
  });
}

// Uso:
// const arquibancadas = await carregarEstadio(matchScene);
// Para alternar pelo tipo de estádio:
// await carregarEstadio(matchScene, 'arena_classica.glb');
// Atenção: remova o modelo anterior antes de carregar outro.
