import { Vector3 } from 'three';
import Force from '../Force';

class WindForce extends Force {
  // Wi = 1/2 * Cd * p * v^2 * A
  // 𝑣 = 𝑣 𝑤𝑖𝑛𝑑 − 𝑣 𝑠ℎ𝑖p

  constructor() {
    super();
  }
  compute_direction(direction) {
    if (direction)
      return direction.clone();
    return new Vector3(); // no effect until start movثment
  };

  calculate(Cd, area, density, windVelocityLength, windVelocityDirection) {
    const cd = Cd;
    const A = area;
    const p = density;
    const v = windVelocityLength;

    this.direction = this.compute_direction(windVelocityDirection);

    const strength = 0.5 * cd * A * p * (v ** 2);

    const Wind = this.direction.clone().multiplyScalar(strength);

    return Wind;
  };
}
export default WindForce;