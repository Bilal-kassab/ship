import { Vector3 } from 'three';
import Force from '../Force';

class WaveForce extends Force {
  // W = 1/2 . 𝜌. 𝐶𝑑. 𝐴. 𝑢. |𝑈| + 𝜌 ⋅ 𝐶𝑀 ⋅ 𝑉 . ⅆ𝑢 / ⅆ𝑡

  constructor() {
    super();
  };

  compute_direction(movement) {
    if (movement)
      return movement.clone().normalize();
    return new Vector3();
  };

  calculateWaveVelocity(t, Um, T) {
    return Um * Math.sin((2 * Math.PI * t) / T);
  }

  calculate(rho, Cd, A, Um, CM, V, du_dt,waveVelocityDirection, t, T) {

    const u = this.calculateWaveVelocity(t, Um, T);
    const F_D = 0.5 * rho * Cd * A * u * Math.abs(u) * 0.002;
    const F_I = rho * CM * V * du_dt;

    this.direction = this.compute_direction(waveVelocityDirection);

    const strength = F_D + F_I;
    
    const Wa = this.direction.clone().multiplyScalar(strength);
    return Wa;
  }
  
};

export default WaveForce;