<template>
  <div class="bag-preview">
    <canvas ref="canvas" class="bag-canvas"></canvas>
  </div>
</template>

<script>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue';

// We'll dynamically import Three.js at runtime so the dev server
// can work even if dependencies haven't been installed yet.

export default {
  name: 'BagPreview',
  props: {
    image: { type: String, default: '' },
    color: { type: String, default: '#ffd400' },
    width: { type: Number, default: 300 },
    height: { type: Number, default: 200 }
  },
  setup(props) {
    const canvas = ref(null);
    let renderer, scene, camera, mesh, texture;
    let THREE = null;
    const loaded = ref(false);

    const init = async () => {
      // try to import three normally, fall back to CDN if that fails
      try {
        THREE = await import('three');
        // some bundlers expose as default; handle both
        if (THREE && THREE.default) THREE = THREE.default;
      } catch (e) {
        // fallback to remote ESM build
        THREE = await import('https://unpkg.com/three@0.158.0/build/three.module.js');
      }

      scene = new THREE.Scene();
      const aspect = props.width / props.height;
      camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
      camera.position.set(0, 0, 3);

      renderer = new THREE.WebGLRenderer({ canvas: canvas.value, alpha: true, antialias: true });
      renderer.setSize(props.width, props.height);
      renderer.setClearColor(0x000000, 0);

      const geometry = new THREE.PlaneGeometry(2, 1.2);
      const material = new THREE.MeshBasicMaterial({ color: new THREE.Color(props.color) });
      mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      if (props.image) setTexture(props.image);
      loaded.value = true;
      animate();
    };

    const setTexture = (url) => {
      const loader = new THREE.TextureLoader();
      loader.load(url, (tex) => {
        if (texture) texture.dispose();
        texture = tex;
        mesh.material.map = texture;
        mesh.material.color = new THREE.Color(0xffffff);
        mesh.material.needsUpdate = true;
      }, undefined, () => {
        // failed to load image - fallback to color
        mesh.material.map = null;
        mesh.material.color = new THREE.Color(props.color);
        mesh.material.needsUpdate = true;
      });
    };

    const animate = () => {
      if (!renderer) return;
      mesh.rotation.y += 0.01;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    onMounted(() => {
      init();
    });

    onBeforeUnmount(() => {
      try {
        if (texture) texture.dispose();
        if (mesh) mesh.geometry.dispose();
        if (mesh && mesh.material) mesh.material.dispose();
        if (renderer) renderer.dispose();
      } catch (e) { }
    });

    watch(() => props.image, (v) => {
      if (!v) return;
      // ensure three is loaded
      if (!loaded.value) return;
      setTexture(v);
    });

    watch(() => props.color, (v) => {
      if (mesh && !mesh.material.map) mesh.material.color = new THREE.Color(v);
    });

    return { canvas };
  }
}
</script>

<style scoped>
.bag-canvas { width: 100%; height: auto; display: block }
.bag-preview { width: 100%; max-width: 320px }
</style>
