import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js";
import getBgSphere from "./getBgSphere.js";
import { EffectComposer } from 'jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'jsm/postprocessing/RenderPass.js';
import { BokehPass } from 'jsm/postprocessing/BokehPass.js';

const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
camera.position.z = 4;
const renderer = new THREE.WebGLRenderer();
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);

const ctrls = new OrbitControls(camera, renderer.domElement);
ctrls.enableDamping = true;

// Post Processing
const renderPass = new RenderPass(scene, camera);
const bokehPass = new BokehPass(scene, camera, {
  focus: 2.5,
  aperture: 0.025,
  maxblur: 0.03
});
const composer = new EffectComposer(renderer);
composer.addPass(renderPass);
composer.addPass(bokehPass);

// ThingGroup
const thingGroup = new THREE.Group();
thingGroup.update = function (t) {
  thingGroup.rotation.y += 0.01;
  thingGroup.children.forEach((ch) => {
    ch.update(t);
  });
  sunlight.position.x = Math.sin(t * 0.0005) * 2;
  sunlight.position.y = Math.cos(t * 0.0005) * 2;
};
scene.add(thingGroup);

// toon mat
const textureLoader = new THREE.TextureLoader();
const gradPath = "./assets/threeTone.jpg";
const gradientMap = textureLoader.load(gradPath);
gradientMap.magFilter = THREE.NearestFilter;
gradientMap.minFilter = THREE.NearestFilter;

const TAU = Math.PI * 2;
const palette = ["#c7522a", "#d68a58", "#e5c185", "#f0daa5", "#fbf2c4", "#b8cdab", "#74a892", "#3a978c", "#008585", "#80c2c2"]; // warm & cool

function getThing() {
  const ballGeo = new THREE.IcosahedronGeometry(0.25, 4);
  const icoGeo = new THREE.IcosahedronGeometry(0.25, 0);
  const randomIndex = Math.floor(Math.random() * palette.length);
  const hex = palette[randomIndex];
  const color = new THREE.Color(hex);
  const toonMat = new THREE.MeshToonMaterial({ color, gradientMap, wireframe: false });
  const glassMat = new THREE.MeshPhysicalMaterial({
    roughness: 0.0,
    transmission: 1.0,
    transparent: true,
    thickness: 3.0,
  });
  const prob = Math.random();
  const mat = prob < 0.5 ? toonMat : glassMat;
  const geo = prob < 0.5 ? ballGeo : icoGeo;
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.set(Math.random() * TAU, Math.random() * TAU, Math.random() * TAU);

  const r = 1 + Math.random() * 0.5;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.random() * Math.PI * 2;
  let x = r * Math.cos(theta) * Math.sin(phi);
  let y = r * Math.sin(theta) * Math.sin(phi);
  let z = r * Math.cos(phi);
  mesh.position.set(x, y, z);
  const oscillationSpeed = 0.002 + Math.random() * 0.002 - 0.001;
  const range = 0.5;
  const oscillationRange = range + Math.random() * range - range * 0.5;
  mesh.update = function (t) {
    let currentRadius = Math.sin(t * oscillationSpeed) * oscillationRange + r;
    x = currentRadius * Math.cos(theta) * Math.sin(phi);
    y = currentRadius * Math.sin(theta) * Math.sin(phi);
    z = currentRadius * Math.cos(phi);
    mesh.position.set(x, y, z);
  };

  return mesh;
}

// Lights
const hemiLight = new THREE.HemisphereLight(0x7799ee, 0x400000, 5);
scene.add(hemiLight);

const sunlight = new THREE.DirectionalLight(0xffffff, 2);
sunlight.position.x = 2;
sunlight.position.y = 2;
scene.add(sunlight);

// bg
const bgSphere = getBgSphere();
scene.add(bgSphere);

const numThings = 100;
for (let i = 0; i < numThings; i++) {
  const thing = getThing();
  thingGroup.add(thing);
}

function animate(t = 0) {
  requestAnimationFrame(animate);
  thingGroup.update(t);
  composer.render(scene, camera);
  ctrls.update();
}
animate();


function handleWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', handleWindowResize, false);