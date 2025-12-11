<template>
  <div class="configurator-vue">
    <aside class="config-panel">
      <h3>Configurator</h3>
      <label>Choose bag color
        <input type="color" v-model="bagColor" />
      </label>

      <label>Choose bag image
        <input type="text" v-model="bagImage" placeholder="Image URL" />
      </label>

      <label>Choose a name
        <input type="text" v-model="bagName" placeholder="Bag name" />
      </label>

      <label>Choose a font
        <select v-model="bagFont">
          <option value="Roboto">Roboto</option>
          <option value="Montserrat">Montserrat</option>
          <option value="Indie">Indie</option>
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

      <button @click="applyToModel">Apply</button>
    </aside>

    <div class="viewer-wrap">
      <div ref="viewer" class="viewer"></div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default {
  name: 'ConfiguratorThree',
  props: {
    modelUrl: { type: String, default: '/configurator/models/chips_bag.glb' }
  },
  setup(props, { emit }) {
    const viewer = ref(null);
    const bagColor = ref('#ffffff');
    const bagImage = ref('');
    const bagName = ref('My Bag');
    const bagFont = ref('Roboto');
    const keyFlavours = ref('');
    const chipsType = ref('plain');

    let renderer, scene, camera, controls, model;
    let colorTargets = [];
    let textureLoader = new THREE.TextureLoader();

    const init = async () => {
      // Using local `three` package (imported at top)
      const container = viewer.value;
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(container.clientWidth, container.clientHeight);
      container.appendChild(renderer.domElement);

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
      camera.position.set(0, 1.2, 2.8);

      controls = new OrbitControls(camera, renderer.domElement);
      controls.target.set(0, 0.8, 0);
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
        // Debug: log GLB structure (nodes, meshes, materials)
        try {
          console.group('GLTF structure:', props.modelUrl);
          function dumpNode(node, indent = '') {
            const type = node.type || (node.isMesh ? 'Mesh' : 'Object3D');
            console.log(indent + (node.name || '(no-name)') + ' — ' + type);
            if (node.isMesh) {
              console.log(indent + '  geometry:', node.geometry?.type || node.geometry?.constructor?.name);
              if (node.material) {
                if (Array.isArray(node.material)) node.material.forEach((m, i) => console.log(indent + `  material[${i}]:`, m.name || m.type));
                else console.log(indent + '  material:', node.material.name || node.material.type);
              }
            }
            if (node.children && node.children.length) node.children.forEach(c => dumpNode(c, indent + '  '));
          }
          dumpNode(model, '');
          // detect likely bag meshes/materials to color
          try {
            colorTargets = [];
            model.traverse((n) => {
              if (n.isMesh) colorTargets.push(n);
            });
            // prefer meshes whose name or material name suggests packaging
            const prefer = colorTargets.filter(m => /bag|pack|wrap|packaging|pouch/i.test(m.name) || (m.material && ((m.material.name && /bag|pack|wrap/i.test(m.material.name)) || (Array.isArray(m.material) && m.material.some(mm=> mm.name && /bag|pack|wrap/i.test(mm.name))))));
            if (prefer.length) colorTargets = prefer;
            console.log('Color targets count:', colorTargets.length);
          } catch (e) { console.warn('color target detection failed', e); }
          if (gltf.parser && gltf.parser.json) {
            console.log('glTF JSON summary:', { scenes: gltf.parser.json.scenes?.length, nodes: gltf.parser.json.nodes?.length, meshes: gltf.parser.json.meshes?.length });
          }
          console.groupEnd();
        } catch (e) { console.warn('Error logging GLTF structure', e); }

        model.position.set(0, 0, 0);
        model.rotation.y = Math.PI;
        scene.add(model);
        fitCameraToObject(camera, model, controls);
      }, undefined, (err) => {
        console.error('Model failed to load', props.modelUrl, err);
      });

      // apply initial color if set
      try { if (bagColor.value && bagColor.value.length) applyColorToTargets(bagColor.value); } catch(e){}

      window.addEventListener('resize', onWindowResize);
      animate();
    };

    function fitCameraToObject(camera, object, controls) {
      const box = new THREE.Box3().setFromObject(object);
      const size = box.getSize(new THREE.Vector3()).length();
      const center = box.getCenter(new THREE.Vector3());
      const dist = size * 1.5;
      camera.position.copy(center.clone().add(new THREE.Vector3(0, size * 0.2, dist)));
      camera.lookAt(center);
      camera.updateProjectionMatrix();
      if (controls) controls.target.copy(center);
    }

    function onWindowResize() {
      if (!viewer.value) return;
      const w = viewer.value.clientWidth;
      const h = viewer.value.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }

    function animate() {
      requestAnimationFrame(animate);
      if (model) model.rotation.y += 0.005;
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
        }
      } catch (e) { console.warn('applyToModel failed', e); }
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
              mats.forEach((m) => { m.map = tex; m.needsUpdate = true; });
            }
          });
        }
      }, undefined, (err) => { console.warn('Texture load failed', err); });
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
    }

    // react to color changes immediately
    watch(bagColor, (val) => { try { applyColorToTargets(val); } catch(e){} });
    // react to image changes immediately
    watch(bagImage, (val) => { try { if (val) applyImageToBagMaterial(val); else applyImageToBagMaterial(null); } catch(e){} });

    onBeforeUnmount(() => {
      try {
        window.removeEventListener('resize', onWindowResize);
        if (renderer) {
          renderer.dispose();
          if (renderer.domElement && renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
        if (scene) scene.clear();
      } catch (e) { }
    });

    return { viewer, bagColor, bagImage, bagName, bagFont, keyFlavours, chipsType, applyToModel };
  }
}
</script>

<style scoped>
.configurator-vue { display: flex; gap: 12px; }
.config-panel { width: 260px; background: #fafafa; padding: 12px; border-radius: 6px; box-shadow: 0 2px 6px rgba(0,0,0,0.06); }
.config-panel h3 { margin: 0 0 8px 0; }
.config-panel label { display: block; margin-bottom: 10px; font-size: 0.95rem; }
.config-panel input[type="text"], .config-panel select { width: 100%; padding: 6px; margin-top: 4px; box-sizing: border-box; }
.viewer-wrap { flex: 1; }
.viewer { width: 100%; height: 80vh; }
</style>
