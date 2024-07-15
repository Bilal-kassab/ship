import { Vector3 } from "three";

class Force {
  constructor() {
    this.direction = this.compute_direction();
  }

  direction = new Vector3();

  compute_direction() { };
  calculate() { };
}
export default Force;