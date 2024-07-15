import { Vector3 } from 'three';
import Force from '../Force';

class WaterResistanceForce extends Force {
  // D = 0.5 * C * A * p * v2
  constructor() {
    super();
  };

  compute_direction(movement) {
    if (movement)
      return movement.clone().normalize().negate();
    return new Vector3();
  };

  calculate(C, frontArea, density, velocityLength, movement) {
    const c = C;
    const A = frontArea;
    const p = density;
    const v = velocityLength;

    this.direction = this.compute_direction(movement);

    const strength = 0.5 * c * A * p * (v ** 2);

    const D = this.direction.clone().multiplyScalar(strength);

    return D;
  };
};

export default WaterResistanceForce;