import { GUI } from "lil-gui";

function makeGui(output, physicalVariables, paramaters, updateSunFun) {
  const gui = new GUI();
  //const physicsFolder = gui.addFolder("Physics");

  const massController = gui.add(physicalVariables, 'mass', 1000, 87000000).name('Mass');

  // massController.onChange(function(value) {
  //   physicalVariables.oldMass=value;
  //   console.log(physicalVariables.oldMass);
  // });

  gui.add(physicalVariables, "gravity", 0, 20).name("Gravity");
  gui.add(physicalVariables, "currentRPM", 0, 1000).name("RPM");
  gui
    .add(physicalVariables, "propellerDiameter", 0, 20)
    .name("Propeller Diameter");
  gui.add(physicalVariables, "propellerArea", 0, 20).name("propeller Area");
  gui.add(physicalVariables, "waterDensity", 0, 20).name("Water Density");
  gui.add(physicalVariables, "angleRudder", -9, 9).name("angle Rudder");

  const waveDirectionFolder = gui.addFolder('Wave');

    // Wave Velocity Amplitude
    waveDirectionFolder.add(physicalVariables, 'waveVelocityAmplitude', 0.001, 0.5).name('Wave Velocity Amplitude')
    .onChange((value) => {
        setTimeout(() => {
            physicalVariables.waveVelocityAmplitude = value;
            console.log("changed!----")
        },physicalVariables.time % physicalVariables.wavePeriod); 
    });

    waveDirectionFolder.add(physicalVariables.waveDirection, 'x', -1, 1).step(0.1).name('x')
    .onChange((value) => {
        setTimeout(() => {
            physicalVariables.waveDirection.x = value;
            console.log("changed!----")
        },physicalVariables.time % physicalVariables.wavePeriod); 
    });
    
    waveDirectionFolder.add(physicalVariables.waveDirection, 'z', -1, 1).step(0.1).name('z')
    .onChange((value) => {
        setTimeout(() => {
            physicalVariables.waveDirection.z = value;
            console.log("changed!----")
        },physicalVariables.time % physicalVariables.wavePeriod); 
    });
    waveDirectionFolder.close();

  const windPhysicsFolder = gui.addFolder("Wind");
  windPhysicsFolder
    .add(physicalVariables, "windVelocity")
    .min(0)
    .max(30)
    .name("Wind Velocity")
    .listen();
  windPhysicsFolder
    .add(physicalVariables.windDirection, "x", -1, 1)
    .step(0.1)
    .name("x");
  windPhysicsFolder
    .add(physicalVariables.windDirection, "z", -1, 1)
    .step(0.1)
    .name("z");
  windPhysicsFolder.close();

  const outgui = new GUI({ title: "Output" });
  outgui.domElement.classList.add("output");
  outgui.add(output, "WeightX").disable().domElement.classList.add("weight");
  outgui.add(output, "WeightY").disable().domElement.classList.add("weight");
  outgui.add(output, "WeightZ").disable().domElement.classList.add("weight");

  outgui
    .add(output, "BuoyancyX")
    .disable()
    .domElement.classList.add("buoyancy");
  outgui
    .add(output, "BuoyancyY")
    .disable()
    .domElement.classList.add("buoyancy");
  outgui
    .add(output, "BuoyancyZ")
    .disable()
    .domElement.classList.add("buoyancy");

  outgui
    .add(output, "WaterResistanceX")
    .disable()
    .domElement.classList.add("waterResistance");
  outgui
    .add(output, "WaterResistanceY")
    .disable()
    .domElement.classList.add("waterResistance");
  outgui
    .add(output, "WaterResistanceZ")
    .disable()
    .domElement.classList.add("waterResistance");

  outgui.add(output, "ThrustX").disable().domElement.classList.add("thrust");
  outgui.add(output, "ThrustY").disable().domElement.classList.add("thrust");
  outgui.add(output, "ThrustZ").disable().domElement.classList.add("thrust");

  outgui.add(output, "WindX").disable().domElement.classList.add("wind");
  outgui.add(output, "WindY").disable().domElement.classList.add("wind");
  outgui.add(output, "WindZ").disable().domElement.classList.add("wind");

  outgui.add(output, "WaveX").disable().domElement.classList.add("Wave");
  outgui.add(output, "WaveY").disable().domElement.classList.add("Wave");
  outgui.add(output, "WaveZ").disable().domElement.classList.add("Wave");

  outgui
    .add(output, "AccelerationX")
    .disable()
    .domElement.classList.add("acceleration");
  outgui
    .add(output, "AccelerationY")
    .disable()
    .domElement.classList.add("acceleration");
  outgui
    .add(output, "AccelerationZ")
    .disable()
    .domElement.classList.add("acceleration");

  outgui
    .add(output, "VelocityX")
    .disable()
    .domElement.classList.add("velocity");
  outgui
    .add(output, "VelocityY")
    .disable()
    .domElement.classList.add("velocity");
  outgui
    .add(output, "VelocityZ")
    .disable()
    .domElement.classList.add("velocity");

  outgui
    .add(output, "PositionX")
    .disable()
    .domElement.classList.add("position");
  outgui
    .add(output, "PositionY")
    .disable()
    .domElement.classList.add("position");
  outgui
    .add(output, "PositionZ")
    .disable()
    .domElement.classList.add("position");

  return { outgui };
}
export default makeGui;
