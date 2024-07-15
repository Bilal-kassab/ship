import { Vector3 } from 'three';
import Force from '../Force';

class ThurstForce extends Force {
  // T = 0.3 * p * area * RPM * d^2 
  constructor() {
    super();
  };

  compute_direction(angleY) {
    return new Vector3(
      Math.cos(angleY),
      0,
      -Math.sin(angleY)
      
    );
  };

  calculate(RPM, diameter, areaa, density, v ,angleY) {
    const p = density;
    const area = areaa;
    const rpm = RPM;
    const d = diameter;

    this.direction = this.compute_direction(angleY);

    const strength = (0.3 * p * area * rpm * (d * d)) -v;

    const T = this.direction.clone().multiplyScalar(strength);

    return T;
  };
};
export default ThurstForce;