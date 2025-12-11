// Use ESM CDN imports so the configurator can be served as static files under
// `public/configurator/` without a bundler. Version pinning helps stability.
import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.158.0/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://unpkg.com/three@0.158.0/examples/jsm/controls/OrbitControls.js';

const container = document.getElementById('viewer');
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(0, 1.2, 2.8);

const controls = new OrbitControls(camera, renderer.domElement);
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
// When deployed under the frontend's `public/configurator` folder the model
// should be placed at `/configurator/models/chips_bag.glb` so use that absolute
// path here so the loader resolves correctly from the iframe.
const modelPath = '/configurator/models/chips_fixed.glb';

loader.load(
  modelPath,
  (gltf) => {
    const root = gltf.scene || gltf.scenes[0];
    // Debug: print node/mesh/material hierarchy
    try {
      console.group('GLTF structure:', modelPath);
      function dump(node, indent = '') {
        const type = node.type || (node.isMesh ? 'Mesh' : 'Object3D');
        console.log(indent + (node.name || '(no-name)') + ' — ' + type);
        if (node.isMesh) {
          console.log(indent + '  geometry:', node.geometry?.type || node.geometry?.constructor?.name);
          if (node.material) {
            if (Array.isArray(node.material)) node.material.forEach((m, i) => console.log(indent + `  material[${i}]:`, m.name || m.type));
            else console.log(indent + '  material:', node.material.name || node.material.type);
          }
        }
        if (node.children && node.children.length) node.children.forEach(c => dump(c, indent + '  '));
      }
      dump(root, '');
      if (gltf.parser && gltf.parser.json) {
        console.log('glTF JSON summary:', { scenes: gltf.parser.json.scenes?.length, nodes: gltf.parser.json.nodes?.length, meshes: gltf.parser.json.meshes?.length });
      }
      console.groupEnd();
    } catch (e) { console.warn('Error logging glTF', e); }

    root.position.set(0, 0, 0);
    root.rotation.y = Math.PI;
    scene.add(root);
    fitCameraToObject(camera, root, controls);
  },
  undefined,
  (err) => {
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1.6, 0.2),
      new THREE.MeshStandardMaterial({ color: 0xffcc66 })
    );
    box.position.y = 0.8;
    scene.add(box);
  }
);

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
  const w = container.clientWidth;
  const h = container.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}

window.addEventListener('resize', onWindowResize, false);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();
