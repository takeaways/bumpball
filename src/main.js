import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as CANNON from "cannon-es";

import { PreventDragClick } from "./utils/drag";
import { ResizeControl } from "./utils/resize";
import { Sphere } from "./utils/sphere";
import { CollideSound } from "./utils/sound";

// Renderer
const canvas = document.querySelector("#three-canvas");
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.x = 1;
camera.position.y = 1.5;
camera.position.z = 10;
scene.add(camera);

// Light
const ambientLight = new THREE.AmbientLight("white", 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight("white", 1);
directionalLight.position.x = 1;
directionalLight.position.z = 2;
directionalLight.castShadow = true;
scene.add(directionalLight);

// Controls
new OrbitControls(camera, renderer.domElement);

// Cannon
const cannonWorld = new CANNON.World(); // [1] 월드 생성
cannonWorld.gravity.set(0, -10, 0); // [2] 중력셋팅
cannonWorld.allowSleep = true;
cannonWorld.broadphase = new CANNON.SAPBroadphase(cannonWorld);

const defaultMaterial = new CANNON.Material("default");
const defaultContactMaterial = new CANNON.ContactMaterial(
  defaultMaterial,
  defaultMaterial,
  {
    friction: 0.5,
    restitution: 0.4,
  }
);

cannonWorld.defaultContactMaterial = defaultContactMaterial;

const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body({
  mass: 0,
  position: new CANNON.Vec3(0, 0, 0),
  shape: floorShape,
  material: defaultMaterial,
});
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI / 2);
cannonWorld.addBody(floorBody);

// Mesh
const floorMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshStandardMaterial({
    color: "slategray",
    side: THREE.DoubleSide,
  })
);
floorMesh.rotation.x = -Math.PI / 2;
floorMesh.receiveShadow = true;

scene.add(floorMesh);

const spheres = [];
const sphereGeometry = new THREE.SphereGeometry(0.5);
const sphereMaterial = new THREE.MeshStandardMaterial({ color: "hotpink" });

// 그리기
const clock = new THREE.Clock();

// 이벤트
new ResizeControl({
  camera,
  renderer,
  scene,
});

const preventDragClick = new PreventDragClick(canvas);
canvas.addEventListener("click", () => {
  if (preventDragClick.mouseMoved) return;
  const newSphere = new Sphere({
    cannonWorld,
    scene,
    geometry: sphereGeometry,
    material: sphereMaterial,
    x: (Math.random() - 0.5) * 2,
    y: Math.random() * 5 + 2,
    z: (Math.random() - 0.5) * 2,
    scale: Math.random() + 0.2,
  });
  spheres.push(newSphere);
  newSphere.cannonBody.addEventListener(
    "collide",
    new CollideSound("/sounds/boing.mp3").callback
  );
});

function draw() {
  const delta = clock.getDelta();

  let cannoStepTime = 1 / 60;
  if (delta < 0.01) cannoStepTime = 1 / 120;
  cannonWorld.step(cannoStepTime, delta, 3);

  spheres.forEach((item) => {
    item.mesh.position.copy(item.cannonBody.position);
    item.mesh.quaternion.copy(item.cannonBody.quaternion);
    item.cannonBody.velocity.x *= 0.99;
    item.cannonBody.velocity.y *= 0.99;
    item.cannonBody.velocity.z *= 0.99;
    item.cannonBody.angularVelocity.x *= 0.99;
    item.cannonBody.angularVelocity.y *= 0.99;
    item.cannonBody.angularVelocity.z *= 0.99;
  });

  renderer.render(scene, camera);
  renderer.setAnimationLoop(draw);
}

draw();
