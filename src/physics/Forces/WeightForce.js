import { Vector3 } from 'three';
import Force from '../Force';

class WeightForce extends Force {
  // W = m * g
  constructor() {
    super();
  }

  compute_direction() {
    return new Vector3(0, -1, 0);
  };

  calculate(mass, gravity) {
    const m = mass;
    const g = gravity;

    const strength = m * g;

    const W = this.direction.clone().multiplyScalar(strength);

    return W;
  };
}
export default WeightForce;