import { Vector3 } from 'three';
import Force from '../Force';

class BuoyancyForce extends Force {
  // B = p * V * g
  constructor() {
    super();
  };

  compute_direction() {
    return new Vector3(0, +1, 0);
  };

  calculate(density, volume, gravity) {
    const p = density;
    const V = volume;
    const g = gravity;

    const strength = p * V * g;

    const B = this.direction.clone().multiplyScalar(strength);

    return B;
  };
};

export default BuoyancyForce;