import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";
const loader = new GLTFLoader();

export class Ship {
  constructor(scene, camera) {
    this.camera = camera;
    loader.load("assets/ship/scene.gltf", (gltf) => {
      scene.add(gltf.scene);
      gltf.scene.scale.set(100, 100, 100);
      gltf.scene.position.set(0, 0, -50);
      gltf.scene.rotation.y = 0;

      this.ship = gltf.scene;
      this.updateCameraPosition();
      this.speed = {
        vel: 0,
        rot: 0,
      };
    });
  }
  get position() {
    if (this.ship) {
      return this.ship?.position;
    }
  }

  get rotation() {
    if (this.ship) {
      return this.ship.rotation;
    }
  }

  updateCameraPosition() {
    if (this.ship) {
      const offset = new THREE.Vector3(0, 50, 200); // Adjust offset as needed
      const shipPosition = this.ship.position.clone();
      const cameraPosition = shipPosition.add(offset);
      this.camera.position.copy(cameraPosition);

      this.camera.lookAt(this.ship.position);

      // controls.target = controls.target.add(this.ship.position);
      // controls.object.position.add(this.ship.position);
    }
  }

  addMove(dx, dy, dz) {
    if (this.ship) {
      this.ship.position.x += dx;
      this.ship.position.y += dy;
      this.ship.position.z += dz;
    }
  }

  moveTo(x, y, z) {
    if (this.ship) {
      this.ship.position.x = x;
      this.ship.position.y = y;
      this.ship.position.z = z;
    }
  }
  rotate(dx, dy, dz) {
    if (this.ship) {
      this.ship.rotation.x += dx;
      this.ship.rotation.y = dy;
      this.ship.rotation.z += dz;
    }
  }
  stop() {
    this.speed.vel = 0;
    this.speed.rot = 0;
  }

  update() {
    if (this.ship) {
      this.ship.rotation.y += this.speed.rot;
      this.ship.translateX(this.speed.vel);

      const time = performance.now() * 0.001;
      this.ship.position.y = Math.sin(time) * 2;
    }
  }
}
