/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { VehicleId, VehicleUpgrades } from './types';

export interface VehicleModelResult {
  root: THREE.Group;
  wheels: THREE.Mesh[];
  bladeGroup: THREE.Group;
  beaconMesh: THREE.Mesh;
  beaconLight: THREE.PointLight;
  headlightL: THREE.SpotLight;
  headlightR: THREE.SpotLight;
  exhaustPipe: THREE.Object3D;
  updateBladeWidth: (level: number) => void;
}

// Materials cache for high performance
export class ModelFactory {
  // Vehicle Materials
  private matTruckBody: THREE.MeshStandardMaterial;
  private matTruckCabin: THREE.MeshStandardMaterial;
  private matSnowcatBody: THREE.MeshStandardMaterial;
  private matScoutBody: THREE.MeshStandardMaterial;
  private matSteampunkIron: THREE.MeshStandardMaterial;
  private matSteampunkBrass: THREE.MeshStandardMaterial;
  private matGlass: THREE.MeshPhysicalMaterial;
  private matTireRubber: THREE.MeshStandardMaterial;
  private matRimsChains: THREE.MeshStandardMaterial;
  private matPlowBlade: THREE.MeshStandardMaterial;
  private matPlowHydraulics: THREE.MeshStandardMaterial;
  private matChromeExhaust: THREE.MeshStandardMaterial;
  private matBeaconAmber: THREE.MeshStandardMaterial;
  private matHeadlights: THREE.MeshStandardMaterial;
  private matSaltHopper: THREE.MeshStandardMaterial;

  // Environment materials
  private matWoodChalet: THREE.MeshStandardMaterial;
  private matChaletRoofSnow: THREE.MeshStandardMaterial;
  private matChaletTrim: THREE.MeshStandardMaterial;
  private matChimneyStone: THREE.MeshStandardMaterial;
  private matPineFoliage: THREE.MeshStandardMaterial;
  private matPineSnowCap: THREE.MeshStandardMaterial;
  private matTrunkWood: THREE.MeshStandardMaterial;
  private matStreetLampPost: THREE.MeshStandardMaterial;
  private matStreetLampLantern: THREE.MeshStandardMaterial;
  private matSnowmanBody: THREE.MeshStandardMaterial;
  private matSnowmanCarrot: THREE.MeshStandardMaterial;
  private matSnowmanHat: THREE.MeshStandardMaterial;
  private matFenceWood: THREE.MeshStandardMaterial;
  private matFenceSnow: THREE.MeshStandardMaterial;
  private matBridgeStone: THREE.MeshStandardMaterial;

  // Contact shadow texture & material
  private contactShadowMat: THREE.MeshBasicMaterial;

  constructor() {
    // Truck PBR Materials
    this.matTruckBody = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Amber safety orange
      metalness: 0.35,
      roughness: 0.45,
    });

    this.matTruckCabin = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.3,
      roughness: 0.5,
    });

    this.matSnowcatBody = new THREE.MeshStandardMaterial({
      color: 0xdc2626, // Bright alpine rescue red
      metalness: 0.4,
      roughness: 0.35,
    });

    this.matScoutBody = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Arctic electric cyan/blue
      metalness: 0.5,
      roughness: 0.3,
    });

    this.matSteampunkIron = new THREE.MeshStandardMaterial({
      color: 0x27272a, // Cast iron boiler
      metalness: 0.85,
      roughness: 0.35,
    });

    this.matSteampunkBrass = new THREE.MeshStandardMaterial({
      color: 0xd97706, // Polished brass
      metalness: 0.9,
      roughness: 0.2,
    });

    this.matGlass = new THREE.MeshPhysicalMaterial({
      color: 0xfef08a, // Warm cozy interior glow
      emissive: 0x92400e,
      emissiveIntensity: 0.3,
      metalness: 0.1,
      roughness: 0.15,
      transparent: true,
      opacity: 0.75,
    });

    this.matTireRubber = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      metalness: 0.1,
      roughness: 0.9,
    });

    this.matRimsChains = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.85,
      roughness: 0.25,
    });

    this.matPlowBlade = new THREE.MeshStandardMaterial({
      color: 0xeab308, // Hazard safety yellow
      metalness: 0.65,
      roughness: 0.3,
    });

    this.matPlowHydraulics = new THREE.MeshStandardMaterial({
      color: 0x334155, // Dark industrial forged steel
      metalness: 0.8,
      roughness: 0.3,
    });

    this.matChromeExhaust = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      metalness: 0.95,
      roughness: 0.1,
    });

    this.matBeaconAmber = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.6,
      roughness: 0.2,
    });

    this.matHeadlights = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xfef08a,
      emissiveIntensity: 2.0,
      roughness: 0.1,
    });

    this.matSaltHopper = new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.4,
      roughness: 0.6,
    });

    // Environment Materials
    this.matWoodChalet = new THREE.MeshStandardMaterial({
      color: 0x78350f,
      roughness: 0.85,
      metalness: 0.05,
    });

    this.matChaletRoofSnow = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.9,
      metalness: 0.02,
    });

    this.matChaletTrim = new THREE.MeshStandardMaterial({
      color: 0x451a03,
      roughness: 0.7,
    });

    this.matChimneyStone = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.95,
    });

    this.matPineFoliage = new THREE.MeshStandardMaterial({
      color: 0x14532d,
      roughness: 0.85,
      metalness: 0.05,
    });

    this.matPineSnowCap = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.9,
    });

    this.matTrunkWood = new THREE.MeshStandardMaterial({
      color: 0x543310,
      roughness: 0.9,
    });

    this.matStreetLampPost = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.75,
      roughness: 0.35,
    });

    this.matStreetLampLantern = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xfbbf24,
      emissiveIntensity: 1.8,
      roughness: 0.2,
    });

    this.matSnowmanBody = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.95,
    });

    this.matSnowmanCarrot = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      roughness: 0.6,
    });

    this.matSnowmanHat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.8,
    });

    this.matFenceWood = new THREE.MeshStandardMaterial({
      color: 0x854d0e,
      roughness: 0.85,
    });

    this.matFenceSnow = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.9,
    });

    this.matBridgeStone = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.9,
    });

    // Procedural radial contact shadow texture
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d')!;
    const grad = sCtx.createRadialGradient(64, 64, 10, 64, 64, 62);
    grad.addColorStop(0, 'rgba(10, 15, 30, 0.6)');
    grad.addColorStop(0.5, 'rgba(10, 15, 30, 0.25)');
    grad.addColorStop(1, 'rgba(10, 15, 30, 0)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 128, 128);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    this.contactShadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.65,
    });
  }

  // --- VEHICLE FACTORY DISPATCHER ---
  public createVehicle(vehicleId: VehicleId, upgrades: VehicleUpgrades): VehicleModelResult {
    switch (vehicleId) {
      case 'snowcat':
        return this.createSnowcat(upgrades);
      case 'scout':
        return this.createScoutJeep(upgrades);
      case 'steampunk':
        return this.createSteampunkPlow(upgrades);
      case 'titan':
      default:
        return this.createSnowplowTruck(upgrades);
    }
  }

  // Helper: Blade builder
  private createBladeMesh(bladeGroup: THREE.Group, width: number, level: number, bladeMat?: THREE.Material) {
    while (bladeGroup.children.length > 0) {
      const c = bladeGroup.children[0];
      bladeGroup.remove(c);
      if (c instanceof THREE.Mesh) c.geometry.dispose();
    }

    const height = 0.68;
    const depth = 0.12;
    const mat = bladeMat || this.matPlowBlade;

    const geom = new THREE.BoxGeometry(width, height, depth);
    const bladeMesh = new THREE.Mesh(geom, mat);
    bladeMesh.position.set(0, 0.25, 0.55);
    bladeMesh.castShadow = true;
    bladeMesh.receiveShadow = true;

    // Hazard stripes
    const hazardGeom = new THREE.BoxGeometry(0.12, height * 1.02, depth * 1.05);
    const hazardMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 });
    const hazardL = new THREE.Mesh(hazardGeom, hazardMat);
    hazardL.position.set(-width / 2 + 0.06, 0, 0);
    bladeMesh.add(hazardL);

    const hazardR = hazardL.clone();
    hazardR.position.x = width / 2 - 0.06;
    bladeMesh.add(hazardR);

    // Level 3+ V-wing deflectors
    if (level >= 3) {
      const wingGeom = new THREE.BoxGeometry(0.45, height * 0.95, depth);
      const wingL = new THREE.Mesh(wingGeom, mat);
      wingL.position.set(-width / 2 - 0.18, 0, -0.15);
      wingL.rotation.y = -0.55;
      bladeMesh.add(wingL);

      const wingR = new THREE.Mesh(wingGeom, mat);
      wingR.position.set(width / 2 + 0.18, 0, -0.15);
      wingR.rotation.y = 0.55;
      bladeMesh.add(wingR);
    }

    bladeGroup.add(bladeMesh);
  }

  private getBladeWidthForLevel(lvl: number, baseScale: number = 1.0) {
    switch (lvl) {
      case 1: return 2.0 * baseScale;
      case 2: return 2.6 * baseScale;
      case 3: return 3.4 * baseScale;
      case 4: return 4.4 * baseScale;
      case 5: return 5.6 * baseScale;
      default: return 2.0 * baseScale;
    }
  }

  // --- 1. HERO ALPINE TITAN TRUCK ---
  public createSnowplowTruck(upgrades: VehicleUpgrades): VehicleModelResult {
    const root = new THREE.Group();

    // Contact shadow
    const shadowGeom = new THREE.PlaneGeometry(3.6, 5.0);
    const shadowMesh = new THREE.Mesh(shadowGeom, this.contactShadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.02;
    root.add(shadowMesh);

    // Chassis
    const chassisGeom = new THREE.BoxGeometry(1.6, 0.45, 3.4);
    const chassisMesh = new THREE.Mesh(chassisGeom, this.matPlowHydraulics);
    chassisMesh.position.set(0, 0.45, 0);
    chassisMesh.castShadow = true;
    root.add(chassisMesh);

    // Hood
    const hoodGeom = new THREE.BoxGeometry(1.5, 0.6, 1.4);
    const hoodMesh = new THREE.Mesh(hoodGeom, this.matTruckBody);
    hoodMesh.position.set(0, 0.85, 0.9);
    hoodMesh.castShadow = true;
    root.add(hoodMesh);

    // Cabin
    const cabGeom = new THREE.BoxGeometry(1.5, 0.95, 1.4);
    const cabMesh = new THREE.Mesh(cabGeom, this.matTruckCabin);
    cabMesh.position.set(0, 1.15, -0.4);
    cabMesh.castShadow = true;
    root.add(cabMesh);

    // Windows
    const windshieldGeom = new THREE.BoxGeometry(1.36, 0.5, 0.08);
    const windshield = new THREE.Mesh(windshieldGeom, this.matGlass);
    windshield.position.set(0, 1.25, 0.32);
    root.add(windshield);

    // Beacon
    const beaconMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.2, 8), this.matBeaconAmber);
    beaconMesh.position.set(0, 1.8, -0.4);
    root.add(beaconMesh);

    const beaconLight = new THREE.PointLight(0xf59e0b, 1.2, 7);
    beaconLight.position.set(0, 2.0, -0.4);
    root.add(beaconLight);

    // Wheels
    const wheels: THREE.Mesh[] = [];
    const wheelGeom = new THREE.CylinderGeometry(0.38, 0.38, 0.35, 12);
    wheelGeom.rotateZ(Math.PI / 2);
    const rimGeom = new THREE.CylinderGeometry(0.24, 0.24, 0.36, 8);
    rimGeom.rotateZ(Math.PI / 2);

    [
      { x: -0.9, y: 0.38, z: 1.0 },
      { x: 0.9, y: 0.38, z: 1.0 },
      { x: -0.9, y: 0.38, z: -1.0 },
      { x: 0.9, y: 0.38, z: -1.0 },
    ].forEach((pos) => {
      const tire = new THREE.Mesh(wheelGeom, this.matTireRubber);
      tire.castShadow = true;
      tire.add(new THREE.Mesh(rimGeom, this.matRimsChains));
      tire.position.set(pos.x, pos.y, pos.z);
      root.add(tire);
      wheels.push(tire);
    });

    // Exhaust Pipe
    const exhaustGeom = new THREE.CylinderGeometry(0.06, 0.06, 1.2, 8);
    const exhaustPipe1 = new THREE.Mesh(exhaustGeom, this.matChromeExhaust);
    exhaustPipe1.position.set(-0.7, 1.25, -1.05);
    root.add(exhaustPipe1);

    // Rear Salt Hopper
    const hopperGeom = new THREE.ConeGeometry(0.65, 0.7, 4);
    hopperGeom.rotateY(Math.PI / 4);
    hopperGeom.rotateX(Math.PI);
    const hopperMesh = new THREE.Mesh(hopperGeom, this.matSaltHopper);
    hopperMesh.position.set(0, 0.9, -1.35);
    root.add(hopperMesh);

    // Headlights
    const targetL = new THREE.Object3D(); targetL.position.set(-0.55, 0, 8); root.add(targetL);
    const headlightL = new THREE.SpotLight(0xfef08a, 2.5, 18, Math.PI / 5, 0.45, 1.2);
    headlightL.position.set(-0.55, 0.75, 1.65); headlightL.target = targetL; root.add(headlightL);

    const targetR = new THREE.Object3D(); targetR.position.set(0.55, 0, 8); root.add(targetR);
    const headlightR = new THREE.SpotLight(0xfef08a, 2.5, 18, Math.PI / 5, 0.45, 1.2);
    headlightR.position.set(0.55, 0.75, 1.65); headlightR.target = targetR; root.add(headlightR);

    // Blade
    const bladeGroup = new THREE.Group();
    bladeGroup.position.set(0, 0.35, 1.7);
    this.createBladeMesh(bladeGroup, this.getBladeWidthForLevel(upgrades.plowLevel), upgrades.plowLevel);
    root.add(bladeGroup);

    return {
      root,
      wheels,
      bladeGroup,
      beaconMesh,
      beaconLight,
      headlightL,
      headlightR,
      exhaustPipe: exhaustPipe1,
      updateBladeWidth: (lvl: number) => {
        this.createBladeMesh(bladeGroup, this.getBladeWidthForLevel(lvl), lvl);
      },
    };
  }

  // --- 2. PISTENBULLY SNOWCAT (Dual-Tracked Arctic Groomer) ---
  public createSnowcat(upgrades: VehicleUpgrades): VehicleModelResult {
    const root = new THREE.Group();

    // Shadow
    const shadowGeom = new THREE.PlaneGeometry(4.2, 5.2);
    const shadowMesh = new THREE.Mesh(shadowGeom, this.contactShadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.02;
    root.add(shadowMesh);

    // Main Red Chassis Box
    const chassisGeom = new THREE.BoxGeometry(2.0, 0.6, 3.2);
    const chassis = new THREE.Mesh(chassisGeom, this.matSnowcatBody);
    chassis.position.set(0, 0.65, 0);
    chassis.castShadow = true;
    root.add(chassis);

    // Dual Caterpillar Rubber Tracks (Left & Right)
    const trackGeom = new THREE.BoxGeometry(0.55, 0.55, 3.6);
    const trackL = new THREE.Mesh(trackGeom, this.matTireRubber);
    trackL.position.set(-1.15, 0.35, 0);
    trackL.castShadow = true;
    root.add(trackL);

    const trackR = trackL.clone();
    trackR.position.x = 1.15;
    root.add(trackR);

    // Track Bogie Wheels
    const wheels: THREE.Mesh[] = [];
    const bogieGeom = new THREE.CylinderGeometry(0.24, 0.24, 0.58, 10);
    bogieGeom.rotateZ(Math.PI / 2);
    [-1.2, -0.4, 0.4, 1.2].forEach((zPos) => {
      const bL = new THREE.Mesh(bogieGeom, this.matRimsChains);
      bL.position.set(-1.15, 0.35, zPos);
      root.add(bL);
      wheels.push(bL);

      const bR = new THREE.Mesh(bogieGeom, this.matRimsChains);
      bR.position.set(1.15, 0.35, zPos);
      root.add(bR);
      wheels.push(bR);
    });

    // Panoramic Heated Glass Cockpit Dome
    const cabGeom = new THREE.CylinderGeometry(0.9, 1.1, 0.85, 8);
    const cab = new THREE.Mesh(cabGeom, this.matGlass);
    cab.position.set(0, 1.35, 0.3);
    cab.castShadow = true;
    root.add(cab);

    // Rear Snow Tiller
    const tillerGeom = new THREE.CylinderGeometry(0.18, 0.18, 2.4, 8);
    tillerGeom.rotateZ(Math.PI / 2);
    const tiller = new THREE.Mesh(tillerGeom, this.matPlowHydraulics);
    tiller.position.set(0, 0.35, -1.8);
    root.add(tiller);

    // Beacon
    const beaconMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.22, 8), this.matBeaconAmber);
    beaconMesh.position.set(0, 1.85, 0.3);
    root.add(beaconMesh);

    const beaconLight = new THREE.PointLight(0xf59e0b, 1.4, 8);
    beaconLight.position.set(0, 2.1, 0.3);
    root.add(beaconLight);

    // Headlights
    const targetL = new THREE.Object3D(); targetL.position.set(-0.7, 0, 8); root.add(targetL);
    const headlightL = new THREE.SpotLight(0xfef08a, 2.8, 20, Math.PI / 4, 0.45, 1.2);
    headlightL.position.set(-0.7, 1.2, 1.3); headlightL.target = targetL; root.add(headlightL);

    const targetR = new THREE.Object3D(); targetR.position.set(0.7, 0, 8); root.add(targetR);
    const headlightR = new THREE.SpotLight(0xfef08a, 2.8, 20, Math.PI / 4, 0.45, 1.2);
    headlightR.position.set(0.7, 1.2, 1.3); headlightR.target = targetR; root.add(headlightR);

    // Exhaust
    const exhaustGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.9, 8);
    const exhaust = new THREE.Mesh(exhaustGeom, this.matChromeExhaust);
    exhaust.position.set(0.8, 1.4, -0.9);
    root.add(exhaust);

    // Massive Blade (Wider than standard)
    const bladeGroup = new THREE.Group();
    bladeGroup.position.set(0, 0.35, 1.9);
    this.createBladeMesh(bladeGroup, this.getBladeWidthForLevel(upgrades.plowLevel, 1.15), upgrades.plowLevel);
    root.add(bladeGroup);

    return {
      root,
      wheels,
      bladeGroup,
      beaconMesh,
      beaconLight,
      headlightL,
      headlightR,
      exhaustPipe: exhaust,
      updateBladeWidth: (lvl: number) => {
        this.createBladeMesh(bladeGroup, this.getBladeWidthForLevel(lvl, 1.15), lvl);
      },
    };
  }

  // --- 3. BLIZZARD SCOUT 4x4 (Sport Winter Jeep) ---
  public createScoutJeep(upgrades: VehicleUpgrades): VehicleModelResult {
    const root = new THREE.Group();

    // Contact shadow
    const shadowGeom = new THREE.PlaneGeometry(3.2, 4.4);
    const shadowMesh = new THREE.Mesh(shadowGeom, this.contactShadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.02;
    root.add(shadowMesh);

    // Lifted Off-road Chassis
    const bodyGeom = new THREE.BoxGeometry(1.4, 0.55, 2.8);
    const body = new THREE.Mesh(bodyGeom, this.matScoutBody);
    body.position.set(0, 0.7, 0);
    body.castShadow = true;
    root.add(body);

    // Open Cabin Roll Cage
    const cageMat = this.matPlowHydraulics;
    const barGeom = new THREE.CylinderGeometry(0.04, 0.04, 1.0, 6);
    const cageL = new THREE.Mesh(barGeom, cageMat);
    cageL.position.set(-0.6, 1.25, -0.2);
    root.add(cageL);

    const cageR = cageL.clone();
    cageR.position.x = 0.6;
    root.add(cageR);

    // Roof light bar with 4 LEDs
    const lightBarGeom = new THREE.BoxGeometry(1.2, 0.08, 0.15);
    const lightBar = new THREE.Mesh(lightBarGeom, this.matHeadlights);
    lightBar.position.set(0, 1.7, 0.2);
    root.add(lightBar);

    // Big Chunky Off-road Tires (Lifted)
    const wheels: THREE.Mesh[] = [];
    const wheelGeom = new THREE.CylinderGeometry(0.44, 0.44, 0.38, 12);
    wheelGeom.rotateZ(Math.PI / 2);
    const rimGeom = new THREE.CylinderGeometry(0.28, 0.28, 0.39, 8);
    rimGeom.rotateZ(Math.PI / 2);

    [
      { x: -0.85, y: 0.44, z: 0.9 },
      { x: 0.85, y: 0.44, z: 0.9 },
      { x: -0.85, y: 0.44, z: -0.9 },
      { x: 0.85, y: 0.44, z: -0.9 },
    ].forEach((pos) => {
      const tire = new THREE.Mesh(wheelGeom, this.matTireRubber);
      tire.castShadow = true;
      tire.add(new THREE.Mesh(rimGeom, this.matRimsChains));
      tire.position.set(pos.x, pos.y, pos.z);
      root.add(tire);
      wheels.push(tire);
    });

    // Beacon
    const beaconMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.18, 8), this.matBeaconAmber);
    beaconMesh.position.set(0, 1.82, -0.4);
    root.add(beaconMesh);

    const beaconLight = new THREE.PointLight(0x38bdf8, 1.2, 7);
    beaconLight.position.set(0, 2.0, -0.4);
    root.add(beaconLight);

    // High Intensity Headlights
    const targetL = new THREE.Object3D(); targetL.position.set(-0.45, 0, 8); root.add(targetL);
    const headlightL = new THREE.SpotLight(0xffffff, 3.2, 22, Math.PI / 4, 0.4, 1.2);
    headlightL.position.set(-0.45, 0.8, 1.4); headlightL.target = targetL; root.add(headlightL);

    const targetR = new THREE.Object3D(); targetR.position.set(0.45, 0, 8); root.add(targetR);
    const headlightR = new THREE.SpotLight(0xffffff, 3.2, 22, Math.PI / 4, 0.4, 1.2);
    headlightR.position.set(0.45, 0.8, 1.4); headlightR.target = targetR; root.add(headlightR);

    // Rear Dual Exhaust
    const exhaustGeom = new THREE.CylinderGeometry(0.05, 0.05, 0.6, 8);
    const exhaust = new THREE.Mesh(exhaustGeom, this.matChromeExhaust);
    exhaust.position.set(-0.4, 0.5, -1.4);
    root.add(exhaust);

    // Sporty Angled V-Blade
    const bladeGroup = new THREE.Group();
    bladeGroup.position.set(0, 0.35, 1.55);
    this.createBladeMesh(bladeGroup, this.getBladeWidthForLevel(upgrades.plowLevel, 0.95), upgrades.plowLevel);
    root.add(bladeGroup);

    return {
      root,
      wheels,
      bladeGroup,
      beaconMesh,
      beaconLight,
      headlightL,
      headlightR,
      exhaustPipe: exhaust,
      updateBladeWidth: (lvl: number) => {
        this.createBladeMesh(bladeGroup, this.getBladeWidthForLevel(lvl, 0.95), lvl);
      },
    };
  }

  // --- 4. STEAM IRON MAMMOTH (Vintage Steam Boiler Plow) ---
  public createSteampunkPlow(upgrades: VehicleUpgrades): VehicleModelResult {
    const root = new THREE.Group();

    // Contact shadow
    const shadowGeom = new THREE.PlaneGeometry(3.6, 5.4);
    const shadowMesh = new THREE.Mesh(shadowGeom, this.contactShadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.02;
    root.add(shadowMesh);

    // Heavy Cast Iron Boiler Hull
    const boilerGeom = new THREE.CylinderGeometry(0.65, 0.65, 2.6, 12);
    boilerGeom.rotateX(Math.PI / 2);
    const boiler = new THREE.Mesh(boilerGeom, this.matSteampunkIron);
    boiler.position.set(0, 0.95, 0.3);
    boiler.castShadow = true;
    root.add(boiler);

    // Brass bands around boiler
    [-0.6, 0.3, 1.1].forEach((zPos) => {
      const ringGeom = new THREE.TorusGeometry(0.67, 0.04, 6, 16);
      const ring = new THREE.Mesh(ringGeom, this.matSteampunkBrass);
      ring.position.set(0, 0.95, zPos);
      root.add(ring);
    });

    // Tall Smoking Copper Smokestack
    const stackGeom = new THREE.CylinderGeometry(0.12, 0.16, 1.4, 8);
    const stack = new THREE.Mesh(stackGeom, this.matSteampunkBrass);
    stack.position.set(0, 1.8, 1.0);
    stack.castShadow = true;
    root.add(stack);

    // Glowing Firebox underneath (Thermal Heat!)
    const fireboxGeom = new THREE.BoxGeometry(1.2, 0.45, 1.6);
    const firebox = new THREE.Mesh(fireboxGeom, this.matSteampunkIron);
    firebox.position.set(0, 0.4, -0.6);
    root.add(firebox);

    const fireLight = new THREE.PointLight(0xf97316, 2.0, 6);
    fireLight.position.set(0, 0.35, -0.6);
    root.add(fireLight);

    // Heavy Cast Wheels (6-wheel steam drive)
    const wheels: THREE.Mesh[] = [];
    const wheelGeom = new THREE.CylinderGeometry(0.42, 0.42, 0.32, 12);
    wheelGeom.rotateZ(Math.PI / 2);

    [-1.0, 0, 1.0].forEach((zPos) => {
      const wL = new THREE.Mesh(wheelGeom, this.matSteampunkBrass);
      wL.position.set(-0.85, 0.42, zPos);
      wL.castShadow = true;
      root.add(wL);
      wheels.push(wL);

      const wR = new THREE.Mesh(wheelGeom, this.matSteampunkBrass);
      wR.position.set(0.85, 0.42, zPos);
      wR.castShadow = true;
      root.add(wR);
      wheels.push(wR);
    });

    // Lantern
    const lanternGeom = new THREE.BoxGeometry(0.3, 0.4, 0.3);
    const lantern = new THREE.Mesh(lanternGeom, this.matSteampunkBrass);
    lantern.position.set(0, 1.4, 1.5);
    root.add(lantern);

    const beaconMesh = lantern;
    const beaconLight = new THREE.PointLight(0xf59e0b, 1.5, 8);
    beaconLight.position.set(0, 1.5, 1.5);
    root.add(beaconLight);

    // Headlights
    const targetL = new THREE.Object3D(); targetL.position.set(-0.5, 0, 8); root.add(targetL);
    const headlightL = new THREE.SpotLight(0xfef08a, 2.5, 18, Math.PI / 4, 0.4, 1.2);
    headlightL.position.set(-0.5, 0.9, 1.6); headlightL.target = targetL; root.add(headlightL);

    const targetR = new THREE.Object3D(); targetR.position.set(0.5, 0, 8); root.add(targetR);
    const headlightR = new THREE.SpotLight(0xfef08a, 2.5, 18, Math.PI / 4, 0.4, 1.2);
    headlightR.position.set(0.5, 0.9, 1.6); headlightR.target = targetR; root.add(headlightR);

    // Heavy Brass Cowcatcher Wedge Blade
    const bladeGroup = new THREE.Group();
    bladeGroup.position.set(0, 0.35, 1.85);
    this.createBladeMesh(bladeGroup, this.getBladeWidthForLevel(upgrades.plowLevel, 1.05), upgrades.plowLevel, this.matSteampunkBrass);
    root.add(bladeGroup);

    return {
      root,
      wheels,
      bladeGroup,
      beaconMesh,
      beaconLight,
      headlightL,
      headlightR,
      exhaustPipe: stack,
      updateBladeWidth: (lvl: number) => {
        this.createBladeMesh(bladeGroup, this.getBladeWidthForLevel(lvl, 1.05), lvl, this.matSteampunkBrass);
      },
    };
  }

  // --- ENVIRONMENT PROPS ---
  public createChalet(colorScheme: 'timber' | 'stone' | 'red'): THREE.Group {
    const group = new THREE.Group();

    // Stone foundation
    const foundationGeom = new THREE.BoxGeometry(5.2, 0.6, 5.2);
    const foundation = new THREE.Mesh(foundationGeom, this.matChimneyStone);
    foundation.position.set(0, 0.3, 0);
    foundation.castShadow = true;
    foundation.receiveShadow = true;
    group.add(foundation);

    // Main timber walls
    const wallGeom = new THREE.BoxGeometry(4.8, 2.8, 4.8);
    const wallMat = colorScheme === 'red'
      ? new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.8 })
      : this.matWoodChalet;
    const walls = new THREE.Mesh(wallGeom, wallMat);
    walls.position.set(0, 2.0, 0);
    walls.castShadow = true;
    walls.receiveShadow = true;
    group.add(walls);

    // Windows
    const windowGeom = new THREE.BoxGeometry(0.8, 0.8, 0.1);
    const win1 = new THREE.Mesh(windowGeom, this.matGlass);
    win1.position.set(-1.3, 2.2, 2.42);
    group.add(win1);

    const win2 = win1.clone();
    win2.position.set(1.3, 2.2, 2.42);
    group.add(win2);

    // Door
    const doorGeom = new THREE.BoxGeometry(0.9, 1.6, 0.1);
    const door = new THREE.Mesh(doorGeom, this.matChaletTrim);
    door.position.set(0, 1.4, 2.42);
    group.add(door);

    // Roof
    const roofBaseGeom = new THREE.ConeGeometry(4.2, 2.2, 4);
    roofBaseGeom.rotateY(Math.PI / 4);
    const roof = new THREE.Mesh(roofBaseGeom, this.matChaletRoofSnow);
    roof.position.set(0, 4.5, 0);
    roof.castShadow = true;
    roof.receiveShadow = true;
    group.add(roof);

    // Chimney
    const chimneyGeom = new THREE.BoxGeometry(0.65, 2.2, 0.65);
    const chimney = new THREE.Mesh(chimneyGeom, this.matChimneyStone);
    chimney.position.set(1.4, 4.5, -0.8);
    chimney.castShadow = true;
    group.add(chimney);

    // Porch Light
    const porchLight = new THREE.PointLight(0xfef08a, 1.4, 8);
    porchLight.position.set(0, 2.6, 2.7);
    group.add(porchLight);

    return group;
  }

  public createPineTree(): THREE.Group {
    const group = new THREE.Group();

    // Wood Trunk
    const trunkGeom = new THREE.CylinderGeometry(0.25, 0.35, 1.4, 8);
    const trunk = new THREE.Mesh(trunkGeom, this.matTrunkWood);
    trunk.position.set(0, 0.7, 0);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    group.add(trunk);

    // Three Tiered Cones
    const tiers = [
      { radius: 1.8, height: 1.8, y: 1.8 },
      { radius: 1.4, height: 1.6, y: 2.8 },
      { radius: 0.9, height: 1.4, y: 3.7 },
    ];

    tiers.forEach((t) => {
      const coneGeom = new THREE.ConeGeometry(t.radius, t.height, 8);
      const cone = new THREE.Mesh(coneGeom, this.matPineFoliage);
      cone.position.set(0, t.y, 0);
      cone.castShadow = true;
      cone.receiveShadow = true;
      group.add(cone);

      const snowGeom = new THREE.ConeGeometry(t.radius * 0.95, t.height * 0.35, 8);
      const snow = new THREE.Mesh(snowGeom, this.matPineSnowCap);
      snow.position.set(0, t.y + t.height * 0.28, 0);
      snow.castShadow = true;
      group.add(snow);
    });

    return group;
  }

  public createStreetLamp(): { group: THREE.Group; light: THREE.PointLight } {
    const group = new THREE.Group();

    const baseGeom = new THREE.CylinderGeometry(0.3, 0.38, 0.4, 8);
    const base = new THREE.Mesh(baseGeom, this.matStreetLampPost);
    base.position.set(0, 0.2, 0);
    group.add(base);

    const poleGeom = new THREE.CylinderGeometry(0.08, 0.1, 3.2, 8);
    const pole = new THREE.Mesh(poleGeom, this.matStreetLampPost);
    pole.position.set(0, 1.8, 0);
    pole.castShadow = true;
    group.add(pole);

    const headGeom = new THREE.BoxGeometry(0.4, 0.55, 0.4);
    const head = new THREE.Mesh(headGeom, this.matStreetLampLantern);
    head.position.set(0, 3.4, 0);
    group.add(head);

    const light = new THREE.PointLight(0xfef08a, 1.8, 12, 1.5);
    light.position.set(0, 3.3, 0);
    group.add(light);

    return { group, light };
  }

  public createSnowman(): THREE.Group {
    const group = new THREE.Group();

    const b1 = new THREE.Mesh(new THREE.SphereGeometry(0.7, 10, 8), this.matSnowmanBody);
    b1.position.set(0, 0.65, 0);
    b1.castShadow = true;
    group.add(b1);

    const b2 = new THREE.Mesh(new THREE.SphereGeometry(0.5, 10, 8), this.matSnowmanBody);
    b2.position.set(0, 1.5, 0);
    b2.castShadow = true;
    group.add(b2);

    const b3 = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 8), this.matSnowmanBody);
    b3.position.set(0, 2.15, 0);
    b3.castShadow = true;
    group.add(b3);

    const noseGeom = new THREE.ConeGeometry(0.08, 0.35, 6);
    noseGeom.rotateX(Math.PI / 2);
    const nose = new THREE.Mesh(noseGeom, this.matSnowmanCarrot);
    nose.position.set(0, 2.15, 0.45);
    group.add(nose);

    const hatGeom = new THREE.CylinderGeometry(0.28, 0.28, 0.45, 10);
    const hat = new THREE.Mesh(hatGeom, this.matSnowmanHat);
    hat.position.set(0, 2.6, 0);
    hat.castShadow = true;
    group.add(hat);

    return group;
  }

  public createFence(): THREE.Group {
    const group = new THREE.Group();

    const postGeom = new THREE.BoxGeometry(0.18, 1.1, 0.18);
    const p1 = new THREE.Mesh(postGeom, this.matFenceWood);
    p1.position.set(-1.4, 0.55, 0);
    p1.castShadow = true;
    group.add(p1);

    const p2 = p1.clone();
    p2.position.x = 1.4;
    group.add(p2);

    const railGeom = new THREE.BoxGeometry(3.0, 0.12, 0.08);
    const r1 = new THREE.Mesh(railGeom, this.matFenceWood);
    r1.position.set(0, 0.8, 0);
    group.add(r1);

    const r2 = r1.clone();
    r2.position.y = 0.4;
    group.add(r2);

    const snowRail = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.06, 0.1), this.matFenceSnow);
    snowRail.position.set(0, 0.88, 0);
    group.add(snowRail);

    return group;
  }

  public dispose() {
    this.matTruckBody.dispose();
    this.matTruckCabin.dispose();
    this.matSnowcatBody.dispose();
    this.matScoutBody.dispose();
    this.matSteampunkIron.dispose();
    this.matSteampunkBrass.dispose();
    this.matGlass.dispose();
    this.matTireRubber.dispose();
    this.matRimsChains.dispose();
    this.matPlowBlade.dispose();
    this.matPlowHydraulics.dispose();
    this.matChromeExhaust.dispose();
    this.matBeaconAmber.dispose();
    this.matHeadlights.dispose();
    this.matSaltHopper.dispose();
    this.matWoodChalet.dispose();
    this.matChaletRoofSnow.dispose();
    this.matChaletTrim.dispose();
    this.matChimneyStone.dispose();
    this.matPineFoliage.dispose();
    this.matPineSnowCap.dispose();
    this.matTrunkWood.dispose();
    this.matStreetLampPost.dispose();
    this.matStreetLampLantern.dispose();
    this.matSnowmanBody.dispose();
    this.matSnowmanCarrot.dispose();
    this.matSnowmanHat.dispose();
    this.matFenceWood.dispose();
    this.matFenceSnow.dispose();
    this.matBridgeStone.dispose();
    this.contactShadowMat.dispose();
  }
}
