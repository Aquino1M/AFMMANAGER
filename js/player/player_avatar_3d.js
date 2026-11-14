(function(window){
  'use strict';

  let preview = null;
  const v = (x, y, z) => new window.THREE.Vector3(x, y, z);

  function material(color, roughness = 0.72, metalness = 0){
    return new window.THREE.MeshStandardMaterial({ color, roughness, metalness });
  }

  function addMesh(parent, geometry, mat, x, y, z, scale){
    const mesh = new window.THREE.Mesh(geometry, mat);
    mesh.position.set(x, y, z);
    if(scale) mesh.scale.set(scale[0], scale[1], scale[2]);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  function addLimb(parent, start, end, radius, mat, segments = 10){
    const direction = end.clone().sub(start);
    const mesh = new window.THREE.Mesh(new window.THREE.CylinderGeometry(radius, radius, direction.length(), segments), mat);
    mesh.position.copy(start).add(end).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(v(0, 1, 0), direction.normalize());
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  function disposeGroup(group){
    if(!group) return;
    group.traverse(obj => {
      obj.geometry?.dispose();
      if(Array.isArray(obj.material)) obj.material.forEach(mat => { mat.map?.dispose(); mat.dispose(); });
      else if(obj.material){ obj.material.map?.dispose(); obj.material.dispose(); }
    });
    group.parent?.remove(group);
  }

  function buildAthlete(options){
    const THREE = window.THREE;
    const model = new THREE.Group();
    const appearance = options.appearance || {};
    const skin = material(appearance.skinTone || '#c68642');
    const hair = material(appearance.hairColor || '#111827');
    const kitPrimary = material(appearance.uniformPrimary || '#f8fafc');
    const kitSecondary = material(appearance.uniformSecondary || '#00d7bd');
    const kitShorts = material(appearance.uniformShorts || appearance.uniformSecondary || '#f8fafc');
    const white = material('#f8fafc');
    const bootData = (window.AFM_PlayerEngine?.STARTER_BOOTS || []).find(boot => boot.id === appearance.starterBoot);
    const boot = material(bootData?.color || '#111827', 0.42);
    const bootAccent = material(bootData?.accent || '#374151', 0.38, 0.08);
    const eye = material(appearance.eyeColor || '#2c1810', 0.38);
    const dark = material('#171116', 0.86);
    const width = options.bodyBuild === 'Forte' ? 1.12 : options.bodyBuild === 'Magro' ? 0.88 : 1;
    const height = Math.max(0.9, Math.min(1.1, (Number(options.height) || 1.78) / 1.78));
    model.scale.set(width, height, 1);

    // Travas e solas dos dois pés.
    for(const side of [-1, 1]){
      const x = side * 0.14;
      addMesh(model, new THREE.BoxGeometry(0.22, 0.055, 0.34), bootAccent, x, 0.055, 0.055);
      addMesh(model, new THREE.BoxGeometry(0.21, 0.095, 0.33), boot, x, 0.12, 0.07);
      for(let i = -1; i <= 1; i++) addMesh(model, new THREE.ConeGeometry(0.018, 0.04, 5), bootAccent, x + i * 0.065, 0.018, 0.14);
      addMesh(model, new THREE.BoxGeometry(0.19, 0.61, 0.2), white, x, 0.49, 0);
      addLimb(model, v(x, 0.78, 0), v(x, 1.02, 0), 0.095, skin);
    }

    // Calção e camisa listrada verde e branca.
    addMesh(model, new THREE.BoxGeometry(0.49 * width, 0.28, 0.31), kitShorts, 0, 1.03, 0);
    addMesh(model, new THREE.BoxGeometry(0.58 * width, 0.72, 0.34), kitPrimary, 0, 1.54, 0);
    addMesh(model, new THREE.BoxGeometry(0.12 * width, 0.67, 0.018), kitSecondary, -0.12 * width, 1.54, 0.36);
    addMesh(model, new THREE.BoxGeometry(0.12 * width, 0.67, 0.018), kitSecondary, 0.12 * width, 1.54, 0.36);
    addMesh(model, new THREE.BoxGeometry(0.37 * width, 0.035, 0.02), kitSecondary, 0, 1.24, 0.37);
    addMesh(model, new THREE.CylinderGeometry(0.105, 0.12, 0.17, 10), skin, 0, 1.99, 0);

    // Braços, mangas e mãos em pose natural de apresentação.
    for(const side of [-1, 1]){
      const shoulder = v(side * 0.34 * width, 1.82, 0);
      const elbow = v(side * 0.48 * width, 1.47, 0.02);
      const wrist = v(side * 0.5 * width, 1.2, 0.08);
      addMesh(model, new THREE.BoxGeometry(0.2, 0.48, 0.25), kitPrimary, side * 0.42 * width, 1.66, 0);
      addLimb(model, elbow, wrist, 0.076, skin);
      addMesh(model, new THREE.SphereGeometry(0.078, 10, 8), skin, wrist.x, wrist.y - 0.035, wrist.z + 0.015);
    }

    // Rosto com olhos, íris, nariz, boca e orelhas.
    addMesh(model, new THREE.SphereGeometry(0.255, 18, 14), skin, 0, 2.25, 0);
    for(const side of [-1, 1]){
      addMesh(model, new THREE.SphereGeometry(0.055, 10, 8), skin, side * 0.25, 2.25, 0);
      addMesh(model, new THREE.SphereGeometry(0.047, 12, 8), white, side * 0.095, 2.29, 0.24);
      addMesh(model, new THREE.SphereGeometry(0.024, 10, 8), eye, side * 0.09, 2.29, 0.28);
      addMesh(model, new THREE.SphereGeometry(0.012, 8, 6), dark, side * 0.09, 2.29, 0.3);
      addMesh(model, new THREE.SphereGeometry(0.008, 8, 6), white, side * 0.082, 2.3, 0.31);
      addLimb(model, v(side * 0.15, 2.36, 0.24), v(side * 0.045, 2.37, 0.245), 0.012, hair, 6);
    }
    addMesh(model, new THREE.SphereGeometry(0.038, 8, 6), skin, 0, 2.23, 0.265);
    const mouthStyle = appearance.mouthStyle || 'sorriso';
    const mouthCurve = new THREE.CatmullRomCurve3(mouthStyle === 'focado'
      ? [v(-0.05, 2.16, 0.25), v(0, 2.16, 0.26), v(0.05, 2.16, 0.25)]
      : mouthStyle === 'confiante'
        ? [v(-0.05, 2.17, 0.25), v(0, 2.155, 0.26), v(0.05, 2.18, 0.25)]
        : mouthStyle === 'determinado'
          ? [v(-0.05, 2.17, 0.25), v(0, 2.15, 0.26), v(0.05, 2.17, 0.25)]
          : [v(-0.05, 2.17, 0.25), v(0, mouthStyle === 'gol' ? 2.11 : 2.14, 0.26), v(0.05, 2.17, 0.25)]);
    addMesh(model, new THREE.TubeGeometry(mouthCurve, 8, 0.009, 5, false), dark, 0, 0, 0);

    // Cabelo ajustável: cortes mudam a silhueta do modelo sem trocar o rosto.
    const hairStyle = appearance.hairStyle || 'Curto';
    const afro = hairStyle === 'Black power';
    addMesh(model, new THREE.SphereGeometry(afro ? 0.31 : 0.258, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), hair, 0, 2.32, 0);
    if(hairStyle === 'Topete') addMesh(model, new THREE.SphereGeometry(0.15, 12, 8), hair, 0, 2.48, 0.12, [1, 0.8, 0.8]);
    if(hairStyle === 'Moicano') addMesh(model, new THREE.CylinderGeometry(0.035, 0.09, 0.32, 7), hair, 0, 2.45, 0.02);
    if(hairStyle === 'Coque Samurai'){
      addMesh(model, new THREE.SphereGeometry(0.085, 10, 8), hair, 0, 2.56, -0.02);
      addMesh(model, new THREE.TorusGeometry(0.09, 0.018, 6, 12), bootAccent, 0, 2.55, -0.02);
    }
    if(hairStyle === 'Tranças') for(let i = -2; i <= 2; i++) addLimb(model, v(i * 0.075, 2.49, 0.08), v(i * 0.075, 2.28, 0.19), 0.018, hair, 6);
    if(hairStyle === 'Franja') for(let i = -2; i <= 2; i++) addMesh(model, new THREE.SphereGeometry(0.055, 8, 6), hair, i * 0.075, 2.3, 0.205, [1, 0.75, 0.65]);
    if(hairStyle === 'Fade') addMesh(model, new THREE.SphereGeometry(0.253, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), hair, 0, 2.32, 0);

    // Número nas costas; controles frente/costas movem a câmera ao redor do atleta.
    const numberCanvas = document.createElement('canvas');
    numberCanvas.width = 128;
    numberCanvas.height = 128;
    const ctx = numberCanvas.getContext('2d');
    if(ctx){
      ctx.fillStyle = appearance.uniformNumberColor || '#078b58';
      ctx.font = '900 88px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(options.shirtNumber || 10), 64, 66);
      const number = addMesh(model, new THREE.PlaneGeometry(0.22, 0.22), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(numberCanvas), transparent: true }), 0, 1.52, -0.36);
      number.rotation.y = Math.PI;
      const nicknameCanvas = document.createElement('canvas');
      nicknameCanvas.width = 512; nicknameCanvas.height = 96;
      const nicknameCtx = nicknameCanvas.getContext('2d');
      if(nicknameCtx){
        nicknameCtx.fillStyle = '#111827'; nicknameCtx.font = '900 58px system-ui';
        nicknameCtx.textAlign = 'center'; nicknameCtx.textBaseline = 'middle';
        nicknameCtx.fillText(String(options.nickname || options.name || '').toUpperCase().slice(0, 14), 256, 48);
        const name = addMesh(model, new THREE.PlaneGeometry(0.54, 0.1), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(nicknameCanvas), transparent: true }), 0, 1.69, -0.367);
        name.rotation.y = Math.PI;
      }
    }

    // Base de apresentação, iluminação leve e uma bola junto ao pé.
    addMesh(model, new THREE.CylinderGeometry(0.69, 0.75, 0.08, 32), material('#111827', 0.5, 0.2), 0, -0.005, 0);
    addMesh(model, new THREE.SphereGeometry(0.105, 12, 10), white, 0.48, 0.12, 0.11);
    return model;
  }

  function draw(){
    if(!preview) return;
    preview.renderer.render(preview.scene, preview.camera);
  }

  function update(options){
    if(!preview) return false;
    disposeGroup(preview.model);
    preview.model = buildAthlete(options || {});
    preview.scene.add(preview.model);
    const back = options?.cameraView === 'back';
    preview.camera.position.set(back ? 0.18 : 0.18, 1.72, back ? -4.5 : 4.5);
    preview.controls.target.set(0, 1.34, 0);
    preview.controls.update();
    draw();
    return true;
  }

  function destroy(){
    if(!preview) return;
    preview.controls?.dispose();
    preview.resizeObserver?.disconnect();
    disposeGroup(preview.model);
    preview.renderer.dispose();
    preview.renderer.domElement.remove();
    preview = null;
  }

  function mount(stage, options){
    if(!stage || !window.THREE || !window.THREE.WebGLRenderer) return false;
    if(preview?.stage === stage) return update(options);
    destroy();
    const fallback = stage.innerHTML;
    let renderer = null;
    let controls = null;
    try {
      const THREE = window.THREE;
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(stage.clientWidth || 260, stage.clientHeight || 310, false);
      renderer.setClearColor(0x000000, 0);
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.touchAction = 'none';
      renderer.domElement.setAttribute('aria-label', 'Prévia 3D do atleta. Arraste para girar.');
      stage.innerHTML = '';
      stage.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      scene.add(new THREE.HemisphereLight(0xe0f2fe, 0x172033, 2.1));
      const key = new THREE.DirectionalLight(0xffffff, 2.2);
      key.position.set(-3, 5, 4);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xa78bfa, 1.4);
      rim.position.set(3, 2, -3);
      scene.add(rim);
      const camera = new THREE.PerspectiveCamera(32, (stage.clientWidth || 260) / (stage.clientHeight || 310), 0.1, 30);
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enablePan = false;
      controls.enableZoom = false;
      controls.enableDamping = false;
      controls.minPolarAngle = Math.PI * 0.28;
      controls.maxPolarAngle = Math.PI * 0.62;
      preview = { stage, renderer, scene, camera, controls, model: null };
      controls.addEventListener('change', draw);
      if(window.ResizeObserver){
        preview.resizeObserver = new window.ResizeObserver(() => {
          if(!preview || preview.stage !== stage) return;
          const w = stage.clientWidth || 260;
          const h = stage.clientHeight || 310;
          renderer.setSize(w, h, false);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          draw();
        });
        preview.resizeObserver.observe(stage);
      }
      update(options);
      return true;
    } catch(error){
      if(preview?.stage === stage) destroy();
      else { controls?.dispose(); renderer?.dispose(); }
      stage.innerHTML = fallback;
      console.warn('[AFM_PlayerAvatar3D] Preview 3D indisponível; mantendo retrato 2D.', error);
      return false;
    }
  }

  window.AFM_PlayerAvatar3D = { mount, update, destroy };
})(window);
