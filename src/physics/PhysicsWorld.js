import { Vector3 } from "three";

import WeightForce from "./Forces/WeightForce";
import BuoyancyForce from "./Forces/BuoyancyForce";
import ThurstForce from "./Forces/ThurstForce";
import WindForce from "./Forces/WindForce";
import hYaw from "./Torques/hYaw";
import WaterResistanceForce from "./Forces/WaterResistanceForce";
import WaveForce from "./Forces/WaveForce";
class PhysicsWorld {
  target; // ship
  controls;
  oldMass;
  oldH;
  acceleration;
  velocity;
  movement;
  angleY; // for turn ship around Y
  angleX;
  angleZ;
  constants;
  editableConstants;
  physicalVariables;

  angular_acceleration;
  angular_velocity;

  worldControl; // for environment controls
  sizes; // for ship , rudder , propeller

  output;
  outputFolder;
  warning;
  forces;
  torques;

  dampingFactor;

  constructor(
    target,
    controls,
    output,
    outputFolder,
    physicalVariables,
    camera
  ) {
    this.target = target;
    this.controls = controls;
    this.camera = camera;
    this.output = output;
    this.outputFolder = outputFolder;
    this.physicalVariables = physicalVariables;
    this.acceleration = new Vector3();
    this.velocity = new Vector3();
    this.movement = new Vector3();
    this.warning = document.querySelector("#warning");
    // this.angularVelocityY = 0;
    // this.angularVelocityZ = 0;
    this.angleY = 0;
    this.angleX = 0;
    this.angleZ = 0;
    this.angular_acceleration = 0;
    this.angular_velocity = 0;
    this.oldMass=0;
    this.oldH=0;
    this.constants = {
      c: 0.1, // معامل الاحتكاك
      cd: 0.8, // معامل السحب
      cm: 0.9, // معامل القصور الذاتي
    };

    this.editableConstants = {
      //later
    };

    this.worldControl = {
      waterSize: 10000 * 5,
      worldBoundries: (10000 * 5) / 2,
    };

    this.sizes = {
      //ship
      length: 120,
      height: 12,
      width: 60,
      //rudder
      rudderWidth: 6,
      rudderHeight: 10,
    };

    this.forces = {
      W: new WeightForce(),
      B: new BuoyancyForce(),
      R: new WaterResistanceForce(),
      T: new ThurstForce(),
      Wa: new WaveForce(),
      Wi: new WindForce(),
    };

    this.torques = {
      H: new hYaw(this.forces.R),
    };

    this.dampingFactor = 0.95;
  }
  calculate_mass() {
    const mass = this.physicalVariables.mass;
    // console.log(mass);
    return mass;
  }

  calculate_gravity() {
    const gravity = this.physicalVariables.gravity;
    return gravity;
  }

  calculate_AirDensity() {
    return this.physicalVariables.AirDensity;
  }

  calculate_waterDensity() {
    return this.physicalVariables.waterDensity;
  }

  calculate_volume_under_water() {
    return this.physicalVariables.mass / this.physicalVariables.waterDensity;
  }

  calculate_volume() {
    // return this.physicalVariables.volume;
    return this.sizes.height*this.sizes.width*this.sizes.length;
  }
  calculate_WaterResistanceArea() {
    const frontArea = ((this.sizes.width / 3) * this.sizes.height) / 5;
    //const frontArea = 1/100 *  this.sizes.width * this.sizes.length  ;
    return frontArea; // just in water
  }

  calculate_WindArea() {
    // const frontArea = (this.sizes.width / 2) * this.sizes.height * (4 / 5);
    // const sideArea = this.sizes.length * this.sizes.height * (4 / 5);

    const frontArea = (this.sizes.width / 2) * this.sizes.height * (4 / 5);
    const sideArea = this.sizes.length * this.sizes.height * (4 / 5);

    const windDirection = this.calculate_windVelocityDirection()
      .clone()
      .normalize();

    const frontNormal = new Vector3(1, 0, 0);
    const sideNormal = new Vector3(0, 0, 1);

    const effectiveFrontArea =
      frontArea * Math.abs(windDirection.dot(frontNormal));
    const effectiveSideArea =
      sideArea * Math.abs(windDirection.dot(sideNormal));

    const totalWindArea = effectiveFrontArea + effectiveSideArea;

    return totalWindArea;
  }


  calculate_velocityLength() {
    return this.velocity.length();
  }

  calculate_accelerationLength() {
    return this.acceleration.length();
  }

  calculate_rpm() {
    return this.physicalVariables.currentRPM;
  }

  calculate_diameter() {
    return this.physicalVariables.propellerDiameter;
  }

  calculate_propellerArea() {
    return this.physicalVariables.propellerArea;
  }

  calculate_rudderArea() {
    //projection

    const width = this.sizes.rudderWidth;
    const height = this.sizes.rudderHeight;

    return width * height;
  }

  calculate_windVelocityLength() {
    const windVelocityLength = this.physicalVariables.windVelocity;
    return windVelocityLength;
  }

  calculate_windVelocityDirection() {
    const windX = this.physicalVariables.windDirection.x;
    const windY = this.physicalVariables.windDirection.y;
    const windZ = this.physicalVariables.windDirection.z;

    const windVelocityDirection = new Vector3(windX, windY, windZ);

    return windVelocityDirection;
  }

  calculate_waveVelocityDirection() {
    const waveX = this.physicalVariables.waveDirection.x;
    const waveY = this.physicalVariables.waveDirection.y;
    const waveZ = this.physicalVariables.waveDirection.z;

    const waveVelocityDirection = new Vector3(waveX, waveY, waveZ);
    return waveVelocityDirection;
  }

  calculate_waveVelocityLength() {
    const waveVelocityLength = this.physicalVariables.waveVelocity;
    return waveVelocityLength;
  }
  calculateHAlpha() {
    const alpha = (this.physicalVariables.horizontalRudder * Math.PI) / 180;

    return alpha;
  }

  calculateVAlpha() {
    const alpha = (this.physicalVariables.angleRudder * Math.PI) / 180;
    // console.log("alpha: ",alpha);
    return alpha;
  }
  calculate_H_underWater(){
    const Yship=this.target.position?.y??-0.013;
      let h=0;
      if(Yship>=0){
        h=0.013
      }
      else if(Yship<-12){
        h=this.sizes.height;
      }
      else{
        h=Yship;
      }
      this.oldH=Math.min(h,this.oldH);
      // console.log("Yship",Yship);
      return Math.abs(h);
  }
  calculate_sigma() {
    
    const velocityLength = this.calculate_velocityLength();
    const accelerationLength = this.calculate_accelerationLength();
    const movement = this.movement;
    const mass = this.calculate_mass();
    const gravity = this.calculate_gravity();
    const rpm = this.calculate_rpm();
    const propellerDiameter = this.calculate_diameter();
    const propellerArea = this.calculate_propellerArea();
    const waterDensity = this.calculate_waterDensity();
    const volume = this.calculate_volume_under_water();

    const c = this.constants.c;
    const RArea = this.calculate_WaterResistanceArea();

    const cd = this.constants.cd;
    const airDensity = this.calculate_AirDensity();
    const WArea = this.calculate_WindArea();
    const windVelocityLength = this.calculate_windVelocityLength();
    const windVelocityDirection = this.calculate_windVelocityDirection();
    const windRelativeVelocity = windVelocityLength - velocityLength;

    const cm = this.constants.cm;
    const waveVelocityDirection= this.calculate_waveVelocityDirection();
    const time = this.physicalVariables.time;
    const Um = this.physicalVariables.waveVelocityAmplitude;
    const TW = this.physicalVariables.wavePeriod;
    const v=this.calculate_H_underWater()*(this.sizes.width)*(this.sizes.length);
    const W = this.forces.W.calculate(mass, gravity);
    const T = this.forces.T.calculate(
      rpm,
      propellerDiameter,
      propellerArea,
      waterDensity,
      velocityLength,
      this.angleY
    );
    const B = this.forces.B.calculate(waterDensity, v, gravity);
    const R = this.forces.R.calculate(
      c,
      RArea,
      waterDensity,
      velocityLength,
      movement
    );
    const Wi = this.forces.Wi.calculate(
      cd,
      WArea,
      airDensity,
      windRelativeVelocity,
      windVelocityDirection
    );
    const Wa = this.forces.Wa.calculate(
      waterDensity,
      cd,
      RArea,
      Um,
      cm,
      100, 
      accelerationLength, 
      waveVelocityDirection, 
      time, 
      TW);
   

    // جمع القوى
    const sigma = new Vector3();
    sigma.add(W);
    sigma.add(T);
    sigma.add(B);
    sigma.add(R);
    sigma.add(Wi);
    sigma.add(Wa);

    // console.log(B);
    // console.log(W);
    // console.log("T:",T);
    // console.log("R:",R);
    // console.log("Wa",Wa);
    // console.log("sigma",sigma);
    //this.output.WeightX = W.x.toFixed(4)+" N";
    this.output.WeightY = W.y.toFixed(4) + " N";
    //this.output.WeightZ = W.z.toFixed(4)+" N";

    //this.output.BuoyancyX = B.x.toFixed(4)+" N";
    this.output.BuoyancyY = B.y.toFixed(4) + " N";
    //this.output.BuoyancyZ = B.z.toFixed(4)+" N";

    this.output.WaterResistanceX = R.x.toFixed(4) + " N";
    this.output.WaterResistanceY = R.y.toFixed(4) + " N";
    this.output.WaterResistanceZ = R.z.toFixed(4) + " N";

    this.output.ThrustX = T.x.toFixed(4) + " N";
    this.output.ThrustY = T.y.toFixed(4) + " N";
    this.output.ThrustZ = T.z.toFixed(4) + " N";

    this.output.WindX = Wi.x.toFixed(4) + " N";
    this.output.WindY = Wi.y.toFixed(4) + " N";
    this.output.WindZ = Wi.z.toFixed(4) + " N";

    this.output.WaveX = Wa.x.toFixed(4) + " N";
    this.output.WaveY = Wa.y.toFixed(4) + " N";
    this.output.WaveZ = Wa.z.toFixed(4) + " N";
    return sigma;
  }

  calculate_acceleration() {
    //a = sigma / m

    const sigma = this.calculate_sigma();
    const m = this.calculate_mass();

    const a = sigma.divideScalar(m); //  sigma / m

    this.acceleration = a.clone();

    this.output.AccelerationX = a.x.toFixed(4) + " m.s⁻²";
    this.output.AccelerationY = a.y.toFixed(4) + " m.s⁻²";
    this.output.AccelerationZ = a.z.toFixed(4) + " m.s⁻²";
    this.output.Acceleration = a.length().toFixed(4) + " m.s⁻²";
    // console.log(a);
    return a;
  }

  calculate_velocity(deltaTime) {
    //v = a * t + v0

    const v0 = this.velocity;
    const t = deltaTime;
    const a = this.calculate_acceleration();

    const v = new Vector3().addVectors(v0, a.clone().multiplyScalar(t));

    this.velocity = v.clone();

    this.output.VelocityX = v.x.toFixed(4) + " m.s⁻¹";
    this.output.VelocityY = v.y.toFixed(4) + " m.s⁻¹";
    this.output.VelocityZ = v.z.toFixed(4) + " m.s⁻¹";
    this.output.Velocity = v.length().toFixed(4) + " m.s⁻¹";
    // console.log(v);
    return v;
  }

  calculateMovement(deltaTime) {
    //delta position = 0.5 * a * t ^ 2 + v * t

    const t = deltaTime;
    const v = this.calculate_velocity(t);
    const a = this.acceleration;

    const d = new Vector3().addVectors(
      a.clone().multiplyScalar(0.5 * t ** 2),
      v.clone().multiplyScalar(t)
    );

    this.movement = d.clone();
    // this.movement.add(d.divideScalar(1));
    // console.log("Position",d);
    // this.output.PositionX = d.x.toFixed(6) + " m"
    // this.output.PositionY = d.y.toFixed(6) + " m"
    // this.output.PositionZ = d.z.toFixed(6) + " m"
    const x = this.target.position?.x.toFixed(4) ?? 0;
    const y = this.target.position?.y.toFixed(4) ?? 0;
    const z = this.target.position?.z.toFixed(4) ?? 0;
    this.output.PositionX = x + " m";
    this.output.PositionY = y + " m";
    this.output.PositionZ = z + " m";

    return d;
  }

  calculateTorque() {
    //Calculate Angles From Torques
    const waterDensity = this.calculate_waterDensity();
    const c = this.constants.c;
    const RArea = this.calculate_WaterResistanceArea();
    const velocityLength = this.calculate_velocityLength();
    const movement = this.movement;
    const R = this.forces.R.calculate(
      c,
      RArea,
      waterDensity,
      velocityLength,
      movement
    );
    const vAlpha = this.calculateVAlpha();

    const hY = this.torques.H.calculateM(vAlpha, R.length());

    //  console.log("hY",hY);

    return hY;
  }

  calculate_angular_acceleration() {
    //alpha = M / I

    const M = this.calculateTorque();
    const I = 30000000;

    const alphaAcce = M / I; //  M / I

    this.angular_acceleration = alphaAcce;

    // console.log("alphaAcce",alphaAcce);
    return alphaAcce;
  }

  calculate_angular_velocity(deltaTime) {
    //w = alphaAcc * t + w0

    const w0 = this.angular_velocity;
    const t = deltaTime;
    const alphaAcc = this.calculate_angular_acceleration();
    const w = alphaAcc * t + w0;
    // this.velocity = v.clone();
    // console.log("W",w);
    return w;
  }

  calculate_angular(deltaTime) {
    //delta position = 0.5 * alphaAcc * t ^ 2 + w * t

    const t = deltaTime;
    const w = this.calculate_angular_velocity(t);
    const alphaAcc = this.angular_acceleration;
    const teta = 0.5 * (alphaAcc * t ** 2) + w * t;
    // this.angleY+=teta*5;
    // console.log("teta",teta);

    return teta;
  }

  checkBounderies() {
    if (
      (this.camera.position.x < this.worldControl.waterSize / 2 - 160) &
      (this.camera.position.x > -this.worldControl.waterSize / 2 + 160) &
      (this.camera.position.z > -this.worldControl.waterSize / 2 + 160) &
      (this.camera.position.z < this.worldControl.waterSize / 2 - 160)
    ) {
      return true;
    }
    return false;
  }

  move(displacement) {
    const volume=this.calculate_volume();
      if(this.target.position?.y<=-30 && this.physicalVariables.mass>=(volume*this.physicalVariables.waterDensity)){
        this.velocity.y = Math.max(this.velocity.y, 0);
        this.acceleration.y = Math.max(this.acceleration.y, 0);
        this.target.addMove(displacement.x, 0, displacement.z);
      }
      else{
          this.velocity.y = Math.max(this.velocity.y, 0);
          this.acceleration.y = Math.max(this.acceleration.y, 0);
          this.target.addMove(displacement.x, displacement.y, displacement.z);
      }
  }

  rotate(x, h, v) {
    this.target.rotate(x, h, v);
  }

  perform_wave_rotations(t, Um, T) {
    const rho = this.calculate_waterDensity();
    const Cd = this.constants.cd;
    const A = this.calculate_WaterResistanceArea();
    const CM = this.constants.cm;
    const du_dt = this.calculate_accelerationLength();
    const waveVelocityDirection= this.calculate_waveVelocityDirection();

    const Wa = this.forces.Wa.calculate(rho, Cd, A, Um, CM, 100, du_dt, waveVelocityDirection, t, T);
    
    const u = this.forces.Wa.calculateWaveVelocity(t,Um,T);
    // console.log("u",u)
    const angle = (u / Um) * Math.PI / 10;
    
    this.angleZ = angle *0.01 * waveVelocityDirection.x;
    this.angleX = angle *0.01 * waveVelocityDirection.z;

    // console.log("z",this.angleZ );
    // console.log("x",this.angleX );
    this.rotate(this.angleX, this.angleY, this.angleZ);
    // this.target.addMove(0,u,0);

  }

  update(deltaTime) {
    //Run All Above Functions And Simulate The Physics
    const d = this.calculateMovement(deltaTime);

    if (this.checkBounderies()) {
      this.move(d);
    } else {
      warning.classList.add("warning");
    }

    // console.log("time", this.physicalVariables.time);
    this.physicalVariables.time += deltaTime;
    const Um = this.physicalVariables.waveVelocityAmplitude;
    const T = this.physicalVariables.wavePeriod;
    this.perform_wave_rotations(this.physicalVariables.time, Um, T);
    
    const angle = this.calculate_angular(deltaTime);
    // console.log("angle ",angle);
    this.angleY += angle * 5;
    this.rotate(0, this.angleY, 0);
  
    this.outputFolder.children.map((e) => e.updateDisplay());
  }
}

export default PhysicsWorld;
