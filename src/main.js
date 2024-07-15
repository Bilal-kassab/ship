import "./style.css";
import * as THREE from "three";
import * as dat from "dat.gui";
import { Scene } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Water } from "three/examples/jsm/objects/Water.js";
import { Sky } from "three/examples/jsm/objects/Sky.js";
import { Ship } from "./ship";
import { GUI } from "lil-gui";
import PhysicsWorld from "./physics/PhysicsWorld";
import makeGui from "./gui";
let camera, renderer;
let controls, water, sun;
const scene = new Scene();
camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const ship = new Ship(scene, camera);

const physicalVariables = {
  start: false,
  // showCollision: false,
  // collide: true,
  
  gravity: 10,
  AirDensity: 1.2,
  waterDensity: 1000,
  //ship
  mass: 100 * 1000,
  volume: 100, // later..
  angleRudder: 0,
  //propeller
  currentRPM: 0,
  propellerDiameter: 8,
  propellerArea: 3,

  //ruddder
  rudderArea: 0,
  horizontalRudder: 0,

  windVelocity: 0,
  windDirection: { x: 0, y: 0, z: 0 },

  
  waveDirection: { x: 0, y: 0, z: 0.0 },
  waveVelocityAmplitude: 0.1, // Um
  wavePeriod: 5, // T in seconds
  time:0,
  
};

const output = {
  WeightX: 0,
  WeightY: 0,
  WeightZ: 0,

  BuoyancyX: 0,
  BuoyancyY: 0,
  BuoyancyZ: 0,

  WaterResistanceX: 0,
  WaterResistanceY: 0,
  WaterResistanceZ: 0,

  ThrustX: 0,
  ThrustY: 0,
  ThrustZ: 0,
  Thrust: 0,

  WindX: 0,
  WindY: 0,
  WindZ: 0,

  WaveX: 0,
  WaveY: 0,
  WaveZ: 0,

  AccelerationX: 0,
  AccelerationY: 0,
  AccelerationZ: 0,

  VelocityX: 0,
  VelocityY: 0,
  VelocityZ: 0,

  PositionX: 0,
  PositionY: 0,
  PositionZ: 0,

  Acceleration: 0,
  Velocity: 0,
};
const { outgui: outputFolder } = makeGui(output, physicalVariables);

const physicsWorld = new PhysicsWorld(
  ship,
  {},
  output,
  outputFolder,
  physicalVariables,
  camera
); // تهيئة PhysicsWorld مع السفينة

async function init() {
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  document.body.appendChild(renderer.domElement);

  // camera.position.set(30, 50, 100);

  sun = new THREE.Vector3();

  const waterGeometry = new THREE.PlaneGeometry(
    physicsWorld.worldControl.waterSize,
    physicsWorld.worldControl.waterSize
  );

  water = new Water(waterGeometry, {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: new THREE.TextureLoader().load(
      "assets/waternormals.jpg",
      function (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }
    ),
    sunDirection: new THREE.Vector3(),
    sunColor: 0xff0000,
    waterColor: 0x001e0f,
    distortionScale: 3.7,

    fog: scene.fog !== undefined,
  });

  water.rotation.x = -Math.PI / 2;
  water.position.y = -32;

  scene.add(water);

  // Skybox
  const sky = new Sky();
  sky.scale.setScalar(physicsWorld.worldControl.waterSize);
  scene.add(sky);

  const skyUniforms = sky.material.uniforms;

  skyUniforms["turbidity"].value = 10;
  skyUniforms["rayleigh"].value = 2;
  skyUniforms["mieCoefficient"].value = 0.005;
  skyUniforms["mieDirectionalG"].value = 0.8;

  const parameters = {
    elevation: 1.5,
    azimuth: 60,
  };

  const pmremGenerator = new THREE.PMREMGenerator(renderer);

  async function updateSun() {
    const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
    const theta = THREE.MathUtils.degToRad(parameters.azimuth);

    sun.setFromSphericalCoords(1, phi, theta);

    sky.material.uniforms["sunPosition"].value.copy(sun);
    water.material.uniforms["sunDirection"].value.copy(sun).normalize();

    scene.environment = pmremGenerator.fromScene(sky).texture;
  }

  updateSun();

  // controls = new OrbitControls(camera, renderer.domElement);

  // //to make the movement in the environment controlled
  // controls.maxPolarAngle = Math.PI * 0.495;
  // controls.target.set(0, 10, 0);
  // controls.minDistance = 40.0;
  // controls.maxDistance = 200.0;
  // controls.update();

  window.addEventListener("resize", onWindowResize);

  window.addEventListener("keydown", function (e) {
    if (e.key == "ArrowUp") {
      ship.speed.vel += 1;
    }
    if (e.key == "ArrowDown") {
      ship.speed.vel = -1;
    }
    if (e.key == "ArrowRight") {
      ship.speed.rot = -0.1;
    }
    if (e.key == "ArrowLeft") {
      ship.speed.rot = 0.005;
    }
  });
  window.addEventListener("keyup", function (e) {
    ship.stop();
  });
}

init();

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  render();
  physicsWorld.update(0.016); // تحديث PhysicsWorld كل إطار
  ship.updateCameraPosition();
}

animate();

function render() {
  water.material.uniforms["time"].value += 1.0 / 60.0;
  renderer.render(scene, camera);
}
