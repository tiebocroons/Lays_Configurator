<template>
  <div class="configurator-vue">
    <div ref="viewer" class="viewer" style="width:100%;height:80vh"></div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default {
  name: 'ConfiguratorThree',
  props: {
    modelUrl: { type: String, default: '/configurator/models/chips_bag.glb' }
  },
  setup(props) {
    const viewer = ref(null);
    let renderer, scene, camera, controls, model;

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
        model.position.set(0, 0, 0);
        model.rotation.y = Math.PI;
        scene.add(model);
        fitCameraToObject(camera, model, controls);
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

    return { viewer };
  }
}
</script>

<style scoped>
.viewer { width: 100%; height: 80vh; }
</style>
