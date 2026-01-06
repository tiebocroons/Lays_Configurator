<template>
  <div class="configurator-three">
    <div class="viewer-wrap">
      <div ref="viewer" class="viewer">
        <canvas ref="canvas"></canvas>
      </div>
    </div>

    <aside v-if="!readOnly" class="config-panel">
      <label>Choose bag color
        <div class="color-grid">
          <button
            v-for="color in presetColors"
            :key="color"
            class="color-swatch"
            :style="{ backgroundColor: color }"
            :class="{ selected: bagColor === color }"
            @click="bagColor = color"
            :title="color"
          ></button>
        </div>
      </label>

      <label class="image-upload-label">Choose bag image
        <div class="file-upload">
          <input type="file" @change="handleImageUpload" accept="image/*" id="image-upload" />
          <label for="image-upload" class="upload-btn">Choose Image</label>
        </div>
      </label>

      <label>Choose a name
        <input type="text" v-model="bagName" placeholder="Bag name" />
      </label>

      <label>Choose a font
        <select v-model="bagFont">
          <option value="Roboto">Roboto</option>
          <option value="Montserrat">Montserrat</option>
          <option value="Indie Flower">Indie Flower</option>
          <option value="Pacifico">Pacifico</option>
          <option value="Dancing Script">Dancing Script</option>
          <option value="Arial">Arial</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier New</option>
        </select>
      </label>

      <label>Choose key flavours
        <input type="text" v-model="keyFlavours" placeholder="Comma separated" />
      </label>

      <label>Choose chips type
        <select v-model="chipsType">
          <option value="plain">Plain</option>
          <option value="ribbed">Ribbed</option>
          <option value="wavy">Wavy</option>
        </select>
      </label>

      <button @click="applyToModel" class="apply-btn">Apply</button>
      <button @click="resetCamera" class="reset-btn">Reset Camera</button>
      <button @click="saveBag" class="save-btn" :disabled="saving">{{ saving ? 'Saving...' : 'Save Bag' }}</button>
      <div v-if="saveMessage" :class="{ 'save-success': saveMessage.includes('successfully'), 'save-error': saveMessage.includes('Failed') }" class="save-message">
        {{ saveMessage }}
      </div>
    </aside>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import api from '../api';

export default {
  name: 'ConfiguratorThree',
  props: {
    modelUrl: { type: String, default: '/configurator/models/chips_fixed.glb' },
    bagData: { type: Object, default: null },
    bagId: { type: String, default: null },
    readOnly: { type: Boolean, default: false }
  },
  setup(props, { emit }) {
    const viewer = ref(null);
    const canvas = ref(null);
    const presetColors = [
      '#FF0000', '#FF6B35', '#FF9500', '#FFD700',
      '#FFFF00', '#7FFF00', '#00FF00', '#00FF7F',
      '#00FFFF', '#007FFF', '#0000FF', '#4B0082',
      '#9400D3', '#FF1493', '#FF69B4', '#FFFFFF',
      '#C0C0C0', '#808080', '#404040', '#000000'
    ];
    const bagColor = ref(props.bagData?.bagColor || props.bagData?.color || '#FF0000');
    const bagImage = ref(props.bagData?.image || '');
    const bagName = ref(props.bagData?.name || 'My Bag');
    const bagFont = ref(props.bagData?.font || 'Roboto');
    const keyFlavours = ref(props.bagData?.keyFlavours ? props.bagData.keyFlavours.join(', ') : '');
    const chipsType = ref(props.bagData?.chipsType || 'plain');
    const saving = ref(false);
    const saveMessage = ref('');

    let renderer, scene, camera, controls, model;
    let animationId = null;
    let colorTargets = [];
    let textureLoader = new THREE.TextureLoader();
    let textCanvasTexture = null;

    const init = async () => {
      // Using local `three` package (imported at top)
      const container = viewer.value;
      const canvasEl = canvas.value;
      renderer = new THREE.WebGLRenderer({ canvas: canvasEl, antialias: true, alpha: true });
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(container.clientWidth, container.clientHeight);

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
      camera.position.set(0, 0, 0);

      controls = new OrbitControls(camera, renderer.domElement);
      controls.target.set(0, 0, 0);
      controls.update();

      const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
      scene.add(hemi);
      const dir = new THREE.DirectionalLight(0xffffff, 0.8);
      dir.position.set(3, 10, 5);
      scene.add(dir);

      const ambient = new THREE.AmbientLight(0xffffff, 0.2);
      scene.add(ambient);

      const loader = new GLTFLoader();
      loader.load(props.modelUrl, (gltf) => {
        model = gltf.scene || gltf.scenes[0];
        // Detect likely bag meshes/materials to color
        try {
          colorTargets = [];
          model.traverse((n) => {
            if (n.isMesh) colorTargets.push(n);
          });
          // Prefer meshes whose name or material name suggests packaging
          const prefer = colorTargets.filter(m => /bag|pack|wrap|packaging|pouch/i.test(m.name) || (m.material && ((m.material.name && /bag|pack|wrap/i.test(m.material.name)) || (Array.isArray(m.material) && m.material.some(mm=> mm.name && /bag|pack|wrap/i.test(mm.name))))));
          if (prefer.length) colorTargets = prefer;
        } catch (e) {
          console.warn('color target detection failed', e);
        }

        model.position.set(0, 0, 0);
        model.rotation.y = Math.PI;
        scene.add(model);
        fitCameraToObject(camera, model, controls);

        // Apply the current UI values now that the model is ready
        try { if (bagColor.value) applyColorToTargets(bagColor.value); } catch (e) {}
        try { if (bagImage.value) applyImageToBagMaterial(bagImage.value); else applyImageToBagMaterial(null); } catch (e) {}
        try { if (bagName.value) applyTextToBagMaterial(bagName.value); else applyTextToBagMaterial(''); } catch (e) {}
      }, undefined, (err) => {
        console.error('Model failed to load', props.modelUrl, err);
      });

      window.addEventListener('resize', onWindowResize);
      animate();
    };

    function fitCameraToObject(camera, object, controls) {
      const box = new THREE.Box3().setFromObject(object);
      const size = box.getSize(new THREE.Vector3()).length();
      const center = box.getCenter(new THREE.Vector3());
      const dist = size * 1.5;
      camera.position.copy(center.clone().add(new THREE.Vector3(0, 0, -dist)));
      camera.lookAt(center);
      camera.updateProjectionMatrix();
      if (controls) controls.target.copy(center);
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
      renderer.render(scene, camera);
    }

    onMounted(() => { init(); });

    function applyToModel() {
      // Emit changes so parent can react, and apply simple visual feedback
      emit('update:color', bagColor.value);
      emit('update:image', bagImage.value);
      emit('update:name', bagName.value);
      emit('update:font', bagFont.value);
      emit('update:keyFlavours', keyFlavours.value.split(',').map(s => s.trim()).filter(Boolean));
      emit('update:chipsType', chipsType.value);

      // Simple visual: if model exists, tint it using a MeshStandard material color override where possible
      try {
        if (model) {
          applyColorToTargets(bagColor.value);
          if (bagImage.value) applyImageToBagMaterial(bagImage.value);
          if (bagName.value) applyTextToBagMaterial(bagName.value);
        }
      } catch (e) { console.warn('applyToModel failed', e); }
    }

    function resetCamera() {
      if (model && camera && controls) {
        fitCameraToObject(camera, model, controls);
      }
    }

    function applyImageToBagMaterial(url) {
      if (!model) return;
      if (!url) {
        // clear maps on materials named BagImg
        model.traverse((n) => {
          if (n.isMesh && n.material) {
            const mats = Array.isArray(n.material) ? n.material : [n.material];
            mats.forEach((m) => {
              if (m.name === 'BagImg') {
                m.map = null;
                m.needsUpdate = true;
              }
            });
          }
        });
        return;
      }
      textureLoader.load(url, (tex) => {
        let applied = false;
        model.traverse((n) => {
          if (n.isMesh && n.material) {
            const mats = Array.isArray(n.material) ? n.material : [n.material];
            mats.forEach((m) => {
              if (m && m.name === 'BagImg') {
                m.map = tex;
                m.color.set(0xffffff); // Ensure image colors are preserved
                m.needsUpdate = true;
                applied = true;
              }
            });
          }
        });
        // fallback: apply as color target's map if BagImg not found
        if (!applied && colorTargets && colorTargets.length) {
          colorTargets.forEach((n) => {
            if (n.material) {
              const mats = Array.isArray(n.material) ? n.material : [n.material];
              mats.forEach((m) => { 
                m.map = tex; 
                m.color.set(0xffffff); // Preserve image colors
                m.needsUpdate = true; 
              });
            }
          });
        }
      }, undefined, (err) => { console.warn('Texture load failed', err); });
    }

    function applyTextToBag(text) {
      if (!model) return;
      const size = 1024;
      const canvas = document.createElement('canvas');
      canvas.width = size; canvas.height = size;
      const ctx = canvas.getContext('2d');
      // transparent background
      ctx.clearRect(0, 0, size, size);
      // style
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // choose font size responsively
      const fontSize = Math.floor(size / Math.max(6, (text.length / 6)));
      ctx.font = `${fontSize}px ${bagFont.value}`;
      // draw drop shadow for readability
      ctx.fillStyle = '#000000';
      ctx.globalAlpha = 0.6;
      ctx.fillText(text, size/2 + 2, size/2 + 2);
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(text, size/2, size/2);

      const tex = new THREE.CanvasTexture(canvas);
      tex.flipY = false; // match glTF UV orientation
      tex.repeat.set(1, 1);
      tex.offset.set(0, 0);
      tex.colorSpace = THREE.SRGBColorSpace;

      let applied = false;
      model.traverse((n) => {
        if (n.isMesh && n.material) {
          const mats = Array.isArray(n.material) ? n.material : [n.material];
          mats.forEach((m) => {
            if (m && m.name === 'BagText') {
              m.map = tex;
              m.alphaTest = 0.5;
              m.transparent = true;
              m.needsUpdate = true;
              applied = true;
            }
          });
        }
      });
      // fallback: apply as map to first color target
      if (!applied && colorTargets && colorTargets.length) {
        const n = colorTargets[0];
        if (n.material) {
          const mats = Array.isArray(n.material) ? n.material : [n.material];
          mats.forEach((m) => { m.map = tex; m.needsUpdate = true; });
        }
      }
    }

    function createTextTexture(text, fontFamily) {
      const size = 1024;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size / 2;
      const ctx = canvas.getContext('2d');
      // background transparent
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // styling
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold 300px ${fontFamily}`;
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
      // draw text
      ctx.fillStyle = '#ffffff';
      const startY = canvas.height / 2 - (lines.length - 1) * 200;
      for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], canvas.width / 2, startY + i * 400);
      }
      const tex = new THREE.CanvasTexture(canvas);
      tex.flipY = false;
      tex.repeat.set(1, 1);
      tex.offset.set(0, 0);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.needsUpdate = true;
      return tex;
    }

    function applyTextToBagMaterial(text) {
      if (!model) return;
      // dispose previous
      if (textCanvasTexture) { try { textCanvasTexture.dispose(); } catch(e){} textCanvasTexture = null; }
      const tex = createTextTexture(text, bagFont.value);
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
          mats.forEach((m) => { m.map = tex; m.needsUpdate = true; });
        }
      }
    }

    function applyColorToTargets(color) {
      if (!colorTargets || !colorTargets.length) return;
      colorTargets.forEach((c) => {
        try {
          if (c.material) {
            if (Array.isArray(c.material)) c.material.forEach(m => { if (m.color) m.color.set(color); m.needsUpdate = true; });
            else { if (c.material.color) c.material.color.set(color); c.material.needsUpdate = true; }
          }
        } catch (e) { }
      });

      // Also apply color to overlay materials (BagImg, BagText) to hide underlying patterns
      if (model) {
        model.traverse((n) => {
          if (n.isMesh && n.material) {
            const mats = Array.isArray(n.material) ? n.material : [n.material];
            mats.forEach((m) => {
              if (m && (m.name === 'BagImg' || m.name === 'BagText')) {
                // For BagImg, if it has a map (image), set color to white to preserve image colors
                // Otherwise, set to bag color
                if (m.name === 'BagImg' && m.map) {
                  if (m.color) m.color.set(0xffffff);
                } else {
                  if (m.color) m.color.set(color);
                }
                m.needsUpdate = true;
              }
            });
          }
        });
      }
    }

    // react to color changes immediately
    watch(bagColor, (val) => { try { applyColorToTargets(val); } catch(e){} });
    // react to image changes immediately
    watch(bagImage, (val) => { try { if (val) applyImageToBagMaterial(val); else applyImageToBagMaterial(null); } catch(e){} });
    // react to name changes immediately (render text into texture)
    watch(bagName, (val) => { try { if (val) applyTextToBag(val); else applyTextToBag(''); } catch(e){} });
    // react to font changes immediately
    watch(bagFont, (val) => { try { if (bagName.value) applyTextToBag(bagName.value); } catch(e){} });

    // watch for bagData prop changes to update the form and apply to model
    watch(() => props.bagData, (newBagData) => {
      if (newBagData) {
        bagColor.value = newBagData.bagColor || newBagData.color || '#ffffff';
        bagImage.value = newBagData.image || '';
        bagName.value = newBagData.name || 'My Bag';
        bagFont.value = newBagData.font || 'Roboto';
        keyFlavours.value = newBagData.keyFlavours ? newBagData.keyFlavours.join(', ') : '';
        chipsType.value = newBagData.chipsType || 'plain';
        
        // Apply visual changes to the model
        try { applyColorToTargets(bagColor.value); } catch(e){}
        try { if (bagImage.value) applyImageToBagMaterial(bagImage.value); else applyImageToBagMaterial(null); } catch(e){}
        try { applyTextToBagMaterial(bagName.value); } catch(e){}
      }
    }, { deep: true, immediate: true });

    async function saveBag() {
      if (!bagName.value || bagName.value.trim() === '') {
        saveMessage.value = 'Please enter a bag name';
        setTimeout(() => { saveMessage.value = ''; }, 3000);
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        saveMessage.value = 'You must be logged in to save a bag. Please login first.';
        setTimeout(() => { saveMessage.value = ''; }, 5000);
        return;
      }

      saving.value = true;
      saveMessage.value = '';

      try {
        const bagData = {
          name: bagName.value,
          bagColor: bagColor.value,
          image: bagImage.value,
          font: bagFont.value,
          keyFlavours: keyFlavours.value.split(',').map(s => s.trim()).filter(Boolean),
          chipsType: chipsType.value
        };

        let response;
        if (props.bagId) {
          // Update existing bag
          response = await api.put(`/bag/${props.bagId}`, bagData);
        } else {
          // Create new bag
          response = await api.post('/bag', bagData);
        }
        saveMessage.value = 'Bag saved successfully!';
        setTimeout(() => { saveMessage.value = ''; }, 3000);
      } catch (error) {
        console.error('Failed to save bag:', error);
        console.error('Error response:', error.response?.data);
        const message = error.response?.data?.message || error.message || 'Failed to save bag';
        saveMessage.value = message;
        setTimeout(() => { saveMessage.value = ''; }, 5000);
      } finally {
        saving.value = false;
      }
    }

    const handleImageUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          bagImage.value = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    };

    onBeforeUnmount(() => {
      try {
        window.removeEventListener('resize', onWindowResize);
        if (animationId) cancelAnimationFrame(animationId);
        if (renderer) {
          renderer.dispose();
          if (renderer.forceContextLoss) renderer.forceContextLoss();
        }
        if (scene) scene.clear();
      } catch (e) { }
    });

    return { viewer, canvas, presetColors, bagColor, bagImage, bagName, bagFont, keyFlavours, chipsType, applyToModel, resetCamera, saveBag, saving, saveMessage, handleImageUpload };
  }
}
</script>

<style>
.configurator-three { display: flex; gap: 24px; padding: 20px; min-height: 100vh; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); }
.config-panel { 
  width: 320px; 
  background: rgba(15, 23, 42, 0.9); 
  padding: 24px; 
  border-radius: 16px; 
  box-shadow: 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1); 
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.08);
  color: #e5e7eb;
}
.config-panel h3 { margin: 0 0 16px 0; color: #fbbf24; font-size: 1.4rem; font-weight: 700; }
.config-panel label { 
  display: block; 
  margin-bottom: 16px; 
  font-size: 0.95rem; 
  font-weight: 600; 
  color: #e5e7eb;
  letter-spacing: 0.025em;
}
.image-upload-label { 
  font-weight: 700; 
  color: #fbbf24; 
  margin-bottom: 20px;
  border-bottom: 2px solid rgba(251,191,36,0.3);
  padding-bottom: 8px;
}
.config-panel input[type="text"], .config-panel select { 
  width: 100%; 
  padding: 12px 16px; 
  margin-top: 6px; 
  box-sizing: border-box; 
  border: 2px solid rgba(255,255,255,0.1); 
  border-radius: 8px; 
  font-size: 0.9rem;
  background-color: rgba(30,41,59,0.8);
  color: #e5e7eb;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}
.config-panel input[type="text"]:focus, .config-panel select:focus {
  outline: none;
  border-color: #fbbf24;
  box-shadow: 0 0 0 3px rgba(251,191,36,0.2);
  background-color: rgba(30,41,59,0.9);
}
.config-panel input[type="text"]::placeholder, .config-panel select {
  color: #9ca3af;
}
.apply-btn, .save-btn {
  width: 100%;
  padding: 14px;
  margin-top: 16px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}
.apply-btn {
  background: linear-gradient(135deg, rgba(251,191,36,0.9) 0%, rgba(245,158,11,0.9) 100%);
  color: #0f172a;
  box-shadow: 0 4px 16px rgba(251,191,36,0.3);
}
.apply-btn:hover {
  background: linear-gradient(135deg, rgba(245,158,11,0.9) 0%, rgba(251,191,36,0.9) 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(251,191,36,0.4);
}
.reset-btn {
  width: 100%;
  padding: 12px;
  margin-top: 12px;
  border: 2px solid rgba(255,255,255,0.2);
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  background: rgba(55,65,81,0.8);
  color: #e5e7eb;
  backdrop-filter: blur(10px);
}
.reset-btn:hover {
  background: rgba(75,85,99,0.9);
  border-color: rgba(251,191,36,0.5);
  transform: translateY(-1px);
}
.save-btn {
  background: linear-gradient(135deg, rgba(34,197,94,0.9) 0%, rgba(22,163,74,0.9) 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(34,197,94,0.3);
}
.save-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(22,163,74,0.9) 0%, rgba(34,197,94,0.9) 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(34,197,94,0.4);
}
.save-btn:disabled {
  background: rgba(75,85,99,0.6);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
.save-message {
  margin-top: 16px;
  padding: 14px;
  border-radius: 8px;
  text-align: center;
  font-size: 0.9rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
}
.save-success {
  background: rgba(34,197,94,0.15);
  color: #bbf7d0;
  border: 1px solid rgba(34,197,94,0.3);
}
.save-error {
  background: rgba(239,68,68,0.15);
  color: #fecaca;
  border: 1px solid rgba(239,68,68,0.3);
}
.color-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  margin-top: 10px;
}
.color-swatch {
  width: 100%;
  aspect-ratio: 1;
  border: 3px solid rgba(255,255,255,0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
  position: relative;
  overflow: hidden;
}
.color-swatch:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 16px rgba(0,0,0,0.3);
}
.color-swatch.selected {
  border-color: #fbbf24;
  box-shadow: 0 0 0 3px rgba(251,191,36,0.3);
}
.file-upload {
  position: relative;
  display: inline-block;
  width: 100%;
}
.file-upload input[type="file"] {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}
.upload-btn {
  display: inline-block;
  padding: 14px 20px;
  background: linear-gradient(135deg, rgba(59,130,246,0.9) 0%, rgba(37,99,235,0.9) 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  transition: all 0.3s ease;
  width: 100%;
  box-sizing: border-box;
  text-align: center;
  box-shadow: 0 4px 16px rgba(59,130,246,0.3);
}
.upload-btn:hover {
  background: linear-gradient(135deg, rgba(37,99,235,0.9) 0%, rgba(59,130,246,0.9) 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(59,130,246,0.4);
}
.viewer-wrap { flex: 1; }
.viewer { width: 100%; height: 80vh; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.3); }
</style>
