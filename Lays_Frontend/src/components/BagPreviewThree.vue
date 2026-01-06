<template>
  <div class="bag-preview-three" ref="viewer">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default {
  name: 'BagPreviewThree',
  props: {
    bag: { type: Object, required: true }
  },
  setup(props) {
    const viewer = ref(null);
    const canvas = ref(null);
    let renderer, scene, camera, model;
    let animationId = null;
    let colorTargets = [];
    let textureLoader = new THREE.TextureLoader();
    let textCanvasTexture = null;

    const init = async () => {
      const container = viewer.value;
      const canvasEl = canvas.value;
      renderer = new THREE.WebGLRenderer({ canvas: canvasEl, antialias: true, alpha: true });
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(container.clientWidth, container.clientHeight);

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
      camera.position.set(0, 1.2, 2.8);

      const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
      scene.add(hemi);
      const dir = new THREE.DirectionalLight(0xffffff, 0.8);
      dir.position.set(3, 10, 5);
      scene.add(dir);
      const ambient = new THREE.AmbientLight(0xffffff, 0.2);
      scene.add(ambient);

      const loader = new GLTFLoader();
      const modelUrl = '/configurator/models/chips_fixed.glb';
      loader.load(modelUrl, (gltf) => {
        model = gltf.scene || gltf.scenes[0];

        // Detect color targets
        colorTargets = [];
        model.traverse((n) => {
          if (n.isMesh) colorTargets.push(n);
        });
        const prefer = colorTargets.filter(m => /bag|pack|wrap|packaging|pouch/i.test(m.name) || (m.material && ((m.material.name && /bag|pack|wrap/i.test(m.material.name)) || (Array.isArray(m.material) && m.material.some(mm=> mm.name && /bag|pack|wrap/i.test(mm.name))))));
        if (prefer.length) colorTargets = prefer;

        model.position.set(0, 0, 0);
        model.rotation.y = Math.PI;
        scene.add(model);
        fitCameraToObject(camera, model);

        // Apply bag data
        applyBagData();
      }, undefined, (err) => {
        console.error('Model failed to load', modelUrl, err);
      });

      window.addEventListener('resize', onWindowResize);
      animate();
    };

    function fitCameraToObject(camera, object) {
      const box = new THREE.Box3().setFromObject(object);
      const size = box.getSize(new THREE.Vector3()).length();
      const center = box.getCenter(new THREE.Vector3());
      const dist = size * 1.5;
      camera.position.copy(center.clone().add(new THREE.Vector3(0, size * 0.2, dist)));
      camera.lookAt(center);
      camera.updateProjectionMatrix();
    }

    function onWindowResize() {
      if (!viewer.value || !renderer) return;
      const w = viewer.value.clientWidth;
      const h = viewer.value.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }

    function animate() {
      animationId = requestAnimationFrame(animate);
      if (model) model.rotation.y += 0.005; // Slow rotation for preview
      renderer.render(scene, camera);
    }

    function applyBagData() {
      if (!props.bag) return;
      try {
        if (props.bag.bagColor || props.bag.color) applyColorToTargets(props.bag.bagColor || props.bag.color);
        if (props.bag.image || props.bag.bagImage) applyImageToBagMaterial(props.bag.image || props.bag.bagImage);
        else applyImageToBagMaterial(null);
        if (props.bag.name) applyTextToBagMaterial(props.bag.name);
        else applyTextToBagMaterial('');
      } catch (e) { console.warn('Error applying bag data', e); }
    }

    function applyColorToTargets(color) {
      if (!colorTargets.length) return;
      const threeColor = new THREE.Color(color);
      colorTargets.forEach(mesh => {
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(mat => {
              if (mat.color) mat.color.copy(threeColor);
            });
          } else if (mesh.material.color) {
            mesh.material.color.copy(threeColor);
          }
        }
      });
    }

    function applyImageToBagMaterial(imageUrl) {
      if (!colorTargets.length) return;
      colorTargets.forEach(mesh => {
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(mat => {
              if (imageUrl) {
                textureLoader.load(imageUrl, (texture) => {
                  mat.map = texture;
                  mat.needsUpdate = true;
                });
              } else {
                mat.map = null;
                mat.needsUpdate = true;
              }
            });
          } else {
            if (imageUrl) {
              textureLoader.load(imageUrl, (texture) => {
                mesh.material.map = texture;
                mesh.material.needsUpdate = true;
              });
            } else {
              mesh.material.map = null;
              mesh.material.needsUpdate = true;
            }
          }
        }
      });
    }

    function applyTextToBagMaterial(text) {
      if (!model) return;
      // dispose previous
      if (textCanvasTexture) { try { textCanvasTexture.dispose(); } catch(e){} textCanvasTexture = null; }
      const tex = createTextTexture(text);
      textCanvasTexture = tex;
      let applied = false;
      model.traverse((n) => {
        if (n.isMesh && n.material) {
          const mats = Array.isArray(n.material) ? n.material : [n.material];
          mats.forEach((m) => {
            if (m && m.name === 'BagText') {
              m.map = tex;
              m.color.set(0xffffff);
              m.emissive.set(0,0,0);
              m.alphaTest = 0.5;
              m.transparent = true;
              m.needsUpdate = true;
              applied = true;
            }
          });
        }
      });
      // fallback: apply to first color target
      if (!applied && colorTargets && colorTargets.length) {
        const n = colorTargets[0];
        if (n.material) {
          const mats = Array.isArray(n.material) ? n.material : [n.material];
          mats.forEach((m) => { 
            m.map = tex; 
            m.color.set(0xffffff);
            m.needsUpdate = true; 
          });
        }
      }
    }

    function createTextTexture(text) {
      const size = 1024;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size / 2;
      const ctx = canvas.getContext('2d');
      // background transparent
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // styling
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 500px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // wrap if necessary
      const lines = [];
      const words = text.split(' ');
      let line = '';
      for (let i = 0; i < words.length; i++) {
        const test = line ? line + ' ' + words[i] : words[i];
        const metrics = ctx.measureText(test);
        if (metrics.width > canvas.width - 40 && line) {
          lines.push(line);
          line = words[i];
        } else line = test;
      }
      if (line) lines.push(line);
      // draw text with shadow for readability
      const startY = canvas.height / 2 - (lines.length - 1) * 120;
      for (let i = 0; i < lines.length; i++) {
        // draw drop shadow
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.6;
        ctx.fillText(lines[i], canvas.width / 2 + 12, startY + i * 240 + 12);
        // draw main text
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(lines[i], canvas.width / 2, startY + i * 240);
      }
      const tex = new THREE.CanvasTexture(canvas);
      tex.flipY = false;
      tex.repeat.set(1, 1);
      tex.offset.set(0, 0);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.needsUpdate = true;
      return tex;
    }

    onMounted(() => {
      init();
    });

    onBeforeUnmount(() => {
      if (animationId) cancelAnimationFrame(animationId);
      window.removeEventListener('resize', onWindowResize);
      if (renderer) {
        renderer.dispose();
        if (renderer.forceContextLoss) renderer.forceContextLoss();
      }
      if (scene) scene.clear();
    });

    watch(() => props.bag, applyBagData, { deep: true });

    return {
      viewer,
      canvas
    };
  }
}
</script>

<style scoped>
.bag-preview-three {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>