import Torque from '../Torque.js';

class Yaw extends Torque {
  // M = FR * d * sin(a)
  constructor() {
    super();
  }

  calculateM(Alpha, F) { // حساب العزم
    /**
    Length: 120 meters (246 feet)
    Height: 12 meters (62 feet)
    Width: 60 meters (60 feet)
    */
    const f = F;

    const d = 120 / 2;

    const alpha = Alpha;

    const M = f * d * Math.sin(alpha);

    return M;
  };

  calculateMInverse(AlphaInverse, F) { 
    /**
    Length: 120 meters (246 feet)
    Height: 12 meters (62 feet)
    Width: 60 meters (60 feet)
    */
    const f = F;

    const d = 120 / 2;

    const alphaInverse = AlphaInverse;

    const MInverse = f * d * Math.sin(alphaInverse);

    return MInverse;
  };

  calculateIdelta() {
    return 10000;
  };

  calculate(alpha, alphaInverse, forceValue) {
    const M = this.calculateM(alpha, forceValue);

    const MInverse = this.calculateM(alphaInverse, forceValue);

    const Idelta = this.calculateIdelta();

    const Theta = (M - MInverse) / Idelta; // rotate angle

    return Theta;
  };
}
export default Yaw;