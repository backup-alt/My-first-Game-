/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { GameScreen, GameStats, TimeOfDay, VehicleUpgrades, FloatingText, VehicleId } from './types';
import { ModelFactory } from './models';
import { SnowSystem } from './snowSystem';
import { ParticleManager } from './particles';
import { getMapData, DISTRICTS } from './mapData';
import { UPGRADE_CATEGORIES, VEHICLE_FLEET } from './vehiclesData';
import { synth } from '../audio/synthEngine';

export class GameEngine {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private isSoftwareGl: boolean = false;
  private frameId: number = 0;
  private isDestroyed: boolean = false;

  // Systems
  private models: ModelFactory;
  private snowSystem: SnowSystem;
  private particles: ParticleManager;

  // Environment & Lights
  private dirLight!: THREE.DirectionalLight;
  private hemiLight!: THREE.HemisphereLight;
  private streetlampLights: THREE.PointLight[] = [];
  private groundMesh!: THREE.Mesh;

  // Vehicle Entity
  private truckRoot!: THREE.Group;
  private truckWheels: THREE.Mesh[] = [];
  private truckBladeGroup!: THREE.Group;
  private truckBeaconMesh!: THREE.Mesh;
  private truckBeaconLight!: THREE.PointLight;
  private truckHeadlightL!: THREE.SpotLight;
  private truckHeadlightR!: THREE.SpotLight;
  private truckExhaustPipe!: THREE.Object3D;
  private updateBladeWidthFn!: (lvl: number) => void;

  // Vehicle Kinematics
  private truckPos = new THREE.Vector3(0, 0, 6);
  private truckHeading: number = -Math.PI / 2; // Facing along -Z
  private truckSpeed: number = 0; // In m/s
  private truckSteerInput: number = 0;
  private truckThrottleInput: number = 0;
  private isBoostActive: boolean = false;
  private isPlowingBladeDown: boolean = true;
  private bladeAngleOffset: number = 0.2;

  // Camera Shake Trauma
  private cameraShakeTrauma: number = 0;

  // Input states
  private keysHeld: Record<string, boolean> = {};

  // Upgrades & Stats
  public upgrades: VehicleUpgrades = {
    plowLevel: 1,
    engineLevel: 1,
    handlingLevel: 1,
    saltLevel: 0,
    turboLevel: 1,
    heaterLevel: 0,
  };

  public stats: GameStats = {
    coins: 100,
    snowClearedSqMeters: 0,
    currentStreak: 0,
    highestStreak: 0,
    currentMultiplier: 1,
    multiplierProgress: 0,
    totalCoinsEarned: 100,
    currentDistrictIndex: 0,
    districtClearProgress: 0,
    boostFuel: 100,
    isBoosting: false,
    isPlowing: false,
    speedKmh: 0,
    timeOfDay: 'day',
    activeVehicleId: 'titan',
    unlockedVehicles: ['titan'],
  };

  public screen: GameScreen = 'title';
  public floatingTexts: FloatingText[] = [];

  // Combo decay tracking
  private comboTimer: number = 0;
  private readonly comboMaxTime: number = 3.2;

  // Collectibles
  private collectibleMeshes: { id: string; mesh: THREE.Group; type: string; x: number; z: number }[] = [];

  // Callbacks to React UI
  public onStatsUpdate?: (stats: GameStats) => void;
  public onScreenChange?: (screen: GameScreen) => void;
  public onDistrictComplete?: (districtId: number, bonus: number) => void;

  // Timing
  private lastTime: number = performance.now();
  private titlePanAngle: number = 0;
  private garageTurntableAngle: number = 0;

  constructor(container: HTMLElement) {
    this.container = container;

    // Detect software WebGL
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 1. Renderer Setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);

    // 2. Scene & Camera
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xdce8f2);
    this.scene.fog = new THREE.FogExp2(0xdce8f2, 0.016);

    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(40, aspect, 0.5, 300);
    this.camera.position.set(22, 28, 22);
    this.camera.lookAt(0, 0, 0);

    // 3. Studio Environment Map (PMREM)
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 4. Subsystems
    this.models = new ModelFactory();
    this.snowSystem = new SnowSystem();
    this.scene.add(this.snowSystem.driftGroup);
    this.particles = new ParticleManager(this.scene);

    // 5. Build Environment & Map
    this.setupLighting();
    this.buildTerrain();
    this.buildMapProps();
    this.buildCollectibles();

    // 6. Build Initial Vehicle
    this.setupTruck();

    // 7. Event listeners
    this.setupInputs();
    window.addEventListener('resize', this.onResize);

    // 8. Pre-warm shaders
    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }

    // 9. Start Game Loop
    this.tick();
  }

  // --- Lighting Setup ---
  private setupLighting() {
    this.dirLight = new THREE.DirectionalLight(0xfff7ed, 2.4);
    this.dirLight.position.set(40, 50, 25);
    this.dirLight.castShadow = !this.isSoftwareGl;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 10;
    this.dirLight.shadow.camera.far = 130;
    const d = 40;
    this.dirLight.shadow.camera.left = -d;
    this.dirLight.shadow.camera.right = d;
    this.dirLight.shadow.camera.top = d;
    this.dirLight.shadow.camera.bottom = -d;
    this.dirLight.shadow.bias = -0.0006;
    this.dirLight.shadow.normalBias = 0.03;
    this.scene.add(this.dirLight);

    this.hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x334155, 0.9);
    this.hemiLight.position.set(0, 40, 0);
    this.scene.add(this.hemiLight);
  }

  // --- Terrain & Snow Mesh ---
  private buildTerrain() {
    const groundGeom = new THREE.PlaneGeometry(160, 160, 64, 64);
    groundGeom.rotateX(-Math.PI / 2);

    const roadCanvas = document.createElement('canvas');
    roadCanvas.width = 512;
    roadCanvas.height = 512;
    const rCtx = roadCanvas.getContext('2d')!;
    rCtx.fillStyle = '#1e293b';
    rCtx.fillRect(0, 0, 512, 512);

    rCtx.fillStyle = '#0f172a';
    rCtx.fillRect(210, 0, 92, 512);
    rCtx.fillRect(0, 210, 512, 92);
    rCtx.beginPath();
    rCtx.arc(256, 256, 120, 0, Math.PI * 2);
    rCtx.fill();

    rCtx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    rCtx.setLineDash([12, 12]);
    rCtx.lineWidth = 3;
    rCtx.beginPath();
    rCtx.moveTo(256, 0); rCtx.lineTo(256, 512);
    rCtx.moveTo(0, 256); rCtx.lineTo(512, 256);
    rCtx.stroke();

    const roadTex = new THREE.CanvasTexture(roadCanvas);
    roadTex.colorSpace = THREE.SRGBColorSpace;
    roadTex.wrapS = THREE.RepeatWrapping;
    roadTex.wrapT = THREE.RepeatWrapping;

    const baseRoadMat = new THREE.MeshStandardMaterial({
      map: roadTex,
      roughness: 0.65,
      metalness: 0.2,
    });

    const baseMesh = new THREE.Mesh(groundGeom, baseRoadMat);
    baseMesh.position.y = 0.0;
    baseMesh.receiveShadow = true;
    this.scene.add(baseMesh);

    // Dynamic Top Snow Blanket Layer
    const snowGeom = new THREE.PlaneGeometry(160, 160, 32, 32);
    snowGeom.rotateX(-Math.PI / 2);

    const snowMat = new THREE.MeshStandardMaterial({
      map: this.snowSystem.texture,
      transparent: true,
      roughness: 0.95,
      metalness: 0.02,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });

    this.groundMesh = new THREE.Mesh(snowGeom, snowMat);
    this.groundMesh.position.y = 0.04;
    this.groundMesh.receiveShadow = true;
    this.scene.add(this.groundMesh);
  }

  // --- Environment Props ---
  private buildMapProps() {
    const map = getMapData();

    map.chalets.forEach((c) => {
      const chalet = this.models.createChalet(c.type);
      chalet.position.set(c.x, 0, c.z);
      chalet.rotation.y = c.rot;
      this.scene.add(chalet);
    });

    map.trees.forEach((t) => {
      const tree = this.models.createPineTree();
      tree.position.set(t.x, 0, t.z);
      tree.scale.setScalar(t.scale);
      this.scene.add(tree);
    });

    map.streetlamps.forEach((sl) => {
      const lamp = this.models.createStreetLamp();
      lamp.group.position.set(sl.x, 0, sl.z);
      this.scene.add(lamp.group);
      this.streetlampLights.push(lamp.light);
    });

    map.fences.forEach((f) => {
      const fence = this.models.createFence();
      fence.position.set(f.x, 0, f.z);
      fence.rotation.y = f.rot;
      this.scene.add(fence);
    });

    map.snowmen.forEach((sm) => {
      const snowman = this.models.createSnowman();
      snowman.position.set(sm.x, 0, sm.z);
      snowman.rotation.y = Math.random() * Math.PI * 2;
      this.scene.add(snowman);
    });

    this.snowSystem.spawnDrifts(map.drifts);
  }

  // --- Collectibles ---
  private buildCollectibles() {
    const map = getMapData();
    const coinGeom = new THREE.CylinderGeometry(0.5, 0.5, 0.12, 10);
    coinGeom.rotateX(Math.PI / 2);
    const coinMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0xd97706,
      emissiveIntensity: 0.5,
    });

    map.collectibles.forEach((item) => {
      const group = new THREE.Group();
      group.position.set(item.x, 0.6, item.z);

      if (item.type === 'coin') {
        const coin = new THREE.Mesh(coinGeom, coinMat);
        coin.castShadow = true;
        group.add(coin);
      } else if (item.type === 'cocoa') {
        const mugGeom = new THREE.CylinderGeometry(0.35, 0.3, 0.55, 8);
        const mugMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 });
        const mug = new THREE.Mesh(mugGeom, mugMat);
        mug.position.y = 0.28;
        group.add(mug);
      } else {
        const coneGeom = new THREE.ConeGeometry(0.4, 0.7, 6);
        const coneMat = new THREE.MeshStandardMaterial({
          color: 0xb45309,
          metalness: 0.6,
          roughness: 0.4,
          emissive: 0x78350f,
          emissiveIntensity: 0.4,
        });
        const cone = new THREE.Mesh(coneGeom, coneMat);
        cone.position.y = 0.35;
        group.add(cone);
      }

      this.scene.add(group);
      this.collectibleMeshes.push({
        id: item.id,
        mesh: group,
        type: item.type,
        x: item.x,
        z: item.z,
      });
    });
  }

  // --- Vehicle Setup & Switching ---
  private setupTruck() {
    this.switchVehicle(this.stats.activeVehicleId);
  }

  public switchVehicle(vehicleId: VehicleId) {
    if (this.truckRoot) {
      this.scene.remove(this.truckRoot);
    }

    this.stats.activeVehicleId = vehicleId;
    const vehicleData = this.models.createVehicle(vehicleId, this.upgrades);
    this.truckRoot = vehicleData.root;
    this.truckWheels = vehicleData.wheels;
    this.truckBladeGroup = vehicleData.bladeGroup;
    this.truckBeaconMesh = vehicleData.beaconMesh;
    this.truckBeaconLight = vehicleData.beaconLight;
    this.truckHeadlightL = vehicleData.headlightL;
    this.truckHeadlightR = vehicleData.headlightR;
    this.truckExhaustPipe = vehicleData.exhaustPipe;
    this.updateBladeWidthFn = vehicleData.updateBladeWidth;

    this.truckRoot.position.copy(this.truckPos);
    this.truckRoot.rotation.y = -this.truckHeading + Math.PI / 2;
    this.scene.add(this.truckRoot);
  }

  public unlockVehicle(vehicleId: VehicleId): boolean {
    if (this.stats.unlockedVehicles.includes(vehicleId)) {
      this.switchVehicle(vehicleId);
      return true;
    }

    const vDef = VEHICLE_FLEET.find((v) => v.id === vehicleId);
    if (!vDef) return false;

    if (this.stats.coins < vDef.unlockCost) {
      this.addFloatingText('NEED MORE COINS! 🪙', this.truckPos.x, 3.2, this.truckPos.z, '#ef4444');
      return false;
    }

    // Deduct coins!
    this.stats.coins -= vDef.unlockCost;
    this.stats.unlockedVehicles.push(vehicleId);
    this.switchVehicle(vehicleId);
    synth.playUpgradeFanfare();
    this.addFloatingText(`-${vDef.unlockCost} 🪙 NEW VEHICLE READY! 🚜`, this.truckPos.x, 3.2, this.truckPos.z, '#fbbf24');
    return true;
  }

  // --- Input Management ---
  private setupInputs() {
    window.addEventListener('keydown', (e) => {
      this.keysHeld[e.code] = true;

      synth.ensureContext();

      if (e.code === 'KeyM') {
        const isMuted = synth.toggleMute();
        this.addFloatingText(isMuted ? 'Muted 🔇' : 'Sound On 🔊', this.truckPos.x, 2.5, this.truckPos.z, '#94a3b8');
      }

      if (e.code === 'KeyP' || e.code === 'Escape') {
        if (this.screen === 'playing') {
          this.setScreen('paused');
        } else if (this.screen === 'paused') {
          this.setScreen('playing');
        } else if (this.screen === 'garage_home') {
          this.setScreen('playing');
        }
      }

      if (e.code === 'KeyE') {
        if (this.screen === 'playing') {
          this.setScreen('garage_home');
        } else if (this.screen === 'garage_home') {
          this.setScreen('playing');
        }
      }

      if (e.code === 'Space') {
        if (this.screen === 'title') {
          this.setScreen('playing');
        }
      }

      if (e.code === 'KeyB') {
        this.isPlowingBladeDown = !this.isPlowingBladeDown;
        this.truckBladeGroup.position.y = this.isPlowingBladeDown ? 0.35 : 0.85;
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keysHeld[e.code] = false;
    });

    window.addEventListener('blur', () => {
      this.keysHeld = {};
    });
  }

  public setScreen(newScreen: GameScreen) {
    this.screen = newScreen;
    if (newScreen === 'playing') {
      synth.ensureContext();
    }
    if (this.onScreenChange) {
      this.onScreenChange(newScreen);
    }
  }

  public setTimeOfDay(time: TimeOfDay) {
    this.stats.timeOfDay = time;
    if (time === 'day') {
      this.scene.background = new THREE.Color(0xdce8f2);
      (this.scene.fog as THREE.FogExp2).color.set(0xdce8f2);
      this.dirLight.color.set(0xfff7ed);
      this.dirLight.intensity = 2.4;
      this.hemiLight.color.set(0xe0f2fe);
      this.hemiLight.intensity = 0.9;
      this.streetlampLights.forEach((l) => (l.intensity = 0.5));
    } else if (time === 'sunset') {
      this.scene.background = new THREE.Color(0xfdba74);
      (this.scene.fog as THREE.FogExp2).color.set(0xfdba74);
      this.dirLight.color.set(0xf97316);
      this.dirLight.intensity = 1.8;
      this.hemiLight.color.set(0xfed7aa);
      this.hemiLight.intensity = 0.8;
      this.streetlampLights.forEach((l) => (l.intensity = 1.8));
    } else {
      this.scene.background = new THREE.Color(0x0a1120);
      (this.scene.fog as THREE.FogExp2).color.set(0x0a1120);
      this.dirLight.color.set(0x60a5fa);
      this.dirLight.intensity = 0.55;
      this.hemiLight.color.set(0x1e293b);
      this.hemiLight.intensity = 0.4;
      this.streetlampLights.forEach((l) => (l.intensity = 2.8));
    }
  }

  public setSteering(steer: number) {
    this.truckSteerInput = Math.max(-1, Math.min(1, steer));
  }

  public setThrottle(throttle: number) {
    this.truckThrottleInput = Math.max(-1, Math.min(1, throttle));
  }

  public setBoost(active: boolean) {
    this.isBoostActive = active;
  }

  // --- Upgrades Application with Proper Coin Deduction ---
  public applyUpgrade(id: keyof VehicleUpgrades): boolean {
    const currentLvl = this.upgrades[id];
    const cat = UPGRADE_CATEGORIES.find((c) => c.id === id);
    if (!cat) return false;
    if (currentLvl >= cat.maxLevel) return false;

    const nextTier = cat.levels[currentLvl];
    if (!nextTier) return false;

    if (this.stats.coins < nextTier.cost) {
      this.addFloatingText('NEED MORE COINS! 🪙', this.truckPos.x, 3.2, this.truckPos.z, '#ef4444');
      return false;
    }

    // Deduct coins!
    this.stats.coins -= nextTier.cost;
    this.upgrades[id] = currentLvl + 1;

    if (id === 'plowLevel' && this.updateBladeWidthFn) {
      this.updateBladeWidthFn(this.upgrades.plowLevel);
    }

    synth.playUpgradeFanfare();
    this.addFloatingText(`-${nextTier.cost} 🪙 UPGRADE INSTALLED! 🛠️`, this.truckPos.x, 3.2, this.truckPos.z, '#38bdf8');
    return true;
  }

  public getBladeWidth(): number {
    const baseScale = this.stats.activeVehicleId === 'snowcat' ? 1.15 : this.stats.activeVehicleId === 'scout' ? 0.95 : 1.0;
    switch (this.upgrades.plowLevel) {
      case 1: return 2.0 * baseScale;
      case 2: return 2.6 * baseScale;
      case 3: return 3.4 * baseScale;
      case 4: return 4.4 * baseScale;
      case 5: return 5.6 * baseScale;
      default: return 2.0 * baseScale;
    }
  }

  public getTopSpeed(): number {
    let vehicleSpeedMult = 1.0;
    if (this.stats.activeVehicleId === 'scout') vehicleSpeedMult = 1.3;
    if (this.stats.activeVehicleId === 'snowcat') vehicleSpeedMult = 0.85;

    const base = (8.5 + this.upgrades.engineLevel * 1.8) * vehicleSpeedMult;
    return this.stats.isBoosting ? base * 1.55 : base;
  }

  // --- Simulation Step ---
  private updatePhysics(dt: number) {
    if (this.screen !== 'playing') return;

    let steer = 0;
    let throttle = 0;

    // STEERING FIX:
    // ArrowLeft / KeyA turns Left (decreases angle towards -X)
    // ArrowRight / KeyD turns Right (increases angle towards +X)
    if (this.keysHeld['KeyA'] || this.keysHeld['ArrowLeft']) steer -= 1;
    if (this.keysHeld['KeyD'] || this.keysHeld['ArrowRight']) steer += 1;
    if (this.keysHeld['KeyW'] || this.keysHeld['ArrowUp']) throttle += 1;
    if (this.keysHeld['KeyS'] || this.keysHeld['ArrowDown']) throttle -= 0.65;

    // Combine with virtual joystick inputs
    if (steer === 0) steer = this.truckSteerInput;
    if (throttle === 0) throttle = this.truckThrottleInput;

    const wantBoost = this.keysHeld['Space'] || this.isBoostActive;
    let isBoosting = false;

    if (wantBoost && this.stats.boostFuel > 5 && throttle > 0.2) {
      isBoosting = true;
      this.stats.boostFuel = Math.max(0, this.stats.boostFuel - 28 * dt);
      if (Math.random() < 0.2) {
        synth.playTurboBoost();
      }
    } else {
      const refillMultiplier = this.stats.activeVehicleId === 'scout' ? 1.5 : 1.0;
      const rechargeRate = (8 + this.upgrades.turboLevel * 4) * refillMultiplier;
      this.stats.boostFuel = Math.min(100, this.stats.boostFuel + rechargeRate * dt);
    }
    this.stats.isBoosting = isBoosting;

    // Acceleration & Braking
    const maxSpeed = this.getTopSpeed();
    const accelRate = (7.0 + this.upgrades.engineLevel * 2.2) * (isBoosting ? 1.6 : 1.0);
    const dragRate = 3.5;

    if (throttle > 0) {
      this.truckSpeed = Math.min(maxSpeed, this.truckSpeed + accelRate * dt * throttle);
    } else if (throttle < 0) {
      this.truckSpeed = Math.max(-maxSpeed * 0.45, this.truckSpeed + accelRate * 0.7 * dt * throttle);
    } else {
      if (this.truckSpeed > 0) {
        this.truckSpeed = Math.max(0, this.truckSpeed - dragRate * dt);
      } else if (this.truckSpeed < 0) {
        this.truckSpeed = Math.min(0, this.truckSpeed + dragRate * dt);
      }
    }

    // Responsive Steering Dynamics
    // Snowcat turns on a dime (tracked crawler); Scout is fast and nimble
    const handlingBonus = this.stats.activeVehicleId === 'snowcat' ? 0.6 : this.stats.activeVehicleId === 'scout' ? 0.4 : 0;
    const turnSensitivity = 2.0 + this.upgrades.handlingLevel * 0.35 + handlingBonus;
    const speedRatio = Math.abs(this.truckSpeed) / maxSpeed;
    const effectiveTurn = steer * turnSensitivity * (speedRatio * 0.75 + 0.5);

    this.truckHeading += effectiveTurn * dt;

    // Update truck position along heading
    const forwardX = Math.cos(this.truckHeading);
    const forwardZ = Math.sin(this.truckHeading);

    const prevX = this.truckPos.x;
    const prevZ = this.truckPos.z;

    this.truckPos.x += forwardX * this.truckSpeed * dt;
    this.truckPos.z += forwardZ * this.truckSpeed * dt;

    // Boundary constraints
    const maxBound = 72;
    this.truckPos.x = Math.max(-maxBound, Math.min(maxBound, this.truckPos.x));
    this.truckPos.z = Math.max(-maxBound, Math.min(maxBound, this.truckPos.z));

    // COMPREHENSIVE OBJECT DETECTION & BUMP COLLISION
    // Covers chalets, pine trees, streetlamps, and fences!
    const map = getMapData();
    const truckCollisionRadius = 1.35;

    for (const obs of map.obstacles) {
      let isHit = false;
      const hitName = obs.name || 'Obstacle';

      if (obs.radius !== undefined) {
        // Circular collision (Trees, Streetlamps)
        const dx = this.truckPos.x - obs.x;
        const dz = this.truckPos.z - obs.z;
        const distSq = dx * dx + dz * dz;
        const minDist = obs.radius + truckCollisionRadius;
        if (distSq < minDist * minDist) {
          isHit = true;
        }
      } else if (obs.width !== undefined && obs.depth !== undefined) {
        // Rectangular bounding box collision (Chalets, Fences)
        const halfW = obs.width / 2 + truckCollisionRadius * 0.75;
        const halfD = obs.depth / 2 + truckCollisionRadius * 0.75;
        if (
          this.truckPos.x > obs.x - halfW &&
          this.truckPos.x < obs.x + halfW &&
          this.truckPos.z > obs.z - halfD &&
          this.truckPos.z < obs.z + halfD
        ) {
          isHit = true;
        }
      }

      if (isHit) {
        // Rebound from obstacle
        this.truckPos.x = prevX;
        this.truckPos.z = prevZ;
        const impactSpeed = Math.abs(this.truckSpeed);
        this.truckSpeed = -this.truckSpeed * 0.5;

        // Visceral camera shake trauma
        this.cameraShakeTrauma = Math.min(1.0, 0.4 + impactSpeed * 0.08);

        synth.playBump();
        this.addFloatingText(`${hitName.toUpperCase()} BUMP! 💥`, this.truckPos.x, 2.8, this.truckPos.z, '#f87171');
        break;
      }
    }

    // Apply position & rotation to 3D model
    this.truckRoot.position.copy(this.truckPos);
    this.truckRoot.rotation.y = -this.truckHeading + Math.PI / 2;

    // Subtle chassis roll and pitch
    const rollTarget = -steer * speedRatio * 0.08;
    const pitchTarget = (throttle < 0 ? -0.05 : throttle > 0 ? 0.04 : 0);
    this.truckRoot.rotation.z = THREE.MathUtils.damp(this.truckRoot.rotation.z, rollTarget, 10, dt);
    this.truckRoot.rotation.x = THREE.MathUtils.damp(this.truckRoot.rotation.x, pitchTarget, 8, dt);

    // Rotate wheels
    const wheelRotDelta = (this.truckSpeed / 0.38) * dt;
    this.truckWheels.forEach((w) => {
      w.rotation.x += wheelRotDelta;
    });

    // Flashing safety beacon
    const timeSec = performance.now() * 0.005;
    this.truckBeaconLight.intensity = 0.8 + Math.sin(timeSec * 8) * 0.8;
    this.truckBeaconMesh.rotation.y += 12 * dt;

    // Exhaust smoke puffs
    if (Math.random() < (isBoosting ? 0.6 : 0.25)) {
      const exhaustWorldPos = new THREE.Vector3();
      this.truckExhaustPipe.getWorldPosition(exhaustWorldPos);
      this.particles.emitExhaustPuff(exhaustWorldPos, isBoosting);
    }

    // Plowing snow action
    this.stats.isPlowing = this.isPlowingBladeDown && Math.abs(this.truckSpeed) > 0.5;
    const plowWidth = this.getBladeWidth();
    const bladeWorldPos = new THREE.Vector3();
    this.truckBladeGroup.getWorldPosition(bladeWorldPos);

    const saltTrailWidth = this.upgrades.saltLevel > 0 ? 1.0 + this.upgrades.saltLevel * 0.5 : 0;

    const plowResult = this.snowSystem.plow(
      bladeWorldPos,
      this.truckHeading,
      plowWidth,
      this.bladeAngleOffset,
      this.stats.isPlowing,
      saltTrailWidth
    );

    // Passive heated cabin melting radius
    const heaterLevel = this.stats.activeVehicleId === 'steampunk' ? this.upgrades.heaterLevel + 2 : this.upgrades.heaterLevel;
    if (heaterLevel > 0 && Math.random() < 0.25) {
      this.snowSystem.plow(this.truckPos, 0, 1.6 * heaterLevel, 0, true, 0);
    }

    // Snow spray particles
    if (this.stats.isPlowing && plowResult.sqMetersCleared > 0.05) {
      this.particles.emitSnowSpray(
        plowResult.sprayOrigin,
        this.truckHeading,
        plowWidth,
        speedRatio,
        isBoosting
      );
    }

    // 3D Snow drift burst
    if (plowResult.driftsHit > 0) {
      this.particles.emitDriftBurst(bladeWorldPos, true);
      synth.playBump();
      this.cameraShakeTrauma = 0.3;
      this.addFloatingText('DRIFT BASHED! ❄️', bladeWorldPos.x, 3.0, bladeWorldPos.z, '#38bdf8');
    }

    // Combo Streak & Multiplier Logic
    if (plowResult.sqMetersCleared > 0.1) {
      this.stats.snowClearedSqMeters += plowResult.sqMetersCleared;
      this.stats.currentStreak += plowResult.sqMetersCleared;
      if (this.stats.currentStreak > this.stats.highestStreak) {
        this.stats.highestStreak = Math.floor(this.stats.currentStreak);
      }
      this.comboTimer = this.comboMaxTime + this.upgrades.saltLevel * 0.8;

      const oldMult = this.stats.currentMultiplier;
      let newMult = 1;
      if (this.stats.currentStreak >= 500) newMult = 15;
      else if (this.stats.currentStreak >= 350) newMult = 10;
      else if (this.stats.currentStreak >= 220) newMult = 7;
      else if (this.stats.currentStreak >= 140) newMult = 5;
      else if (this.stats.currentStreak >= 80) newMult = 4;
      else if (this.stats.currentStreak >= 40) newMult = 3;
      else if (this.stats.currentStreak >= 15) newMult = 2;

      this.stats.currentMultiplier = newMult;

      if (newMult > oldMult) {
        synth.playComboChime(newMult);
        const titles = ['', '', 'NICE PLOWING! 2x', 'CLEAN STREAK! 3x', 'SNOW MASTER! 4x', 'FLURRY FRENZY! 5x', 'BLIZZARD HERO! 7x', 'ALPINE LEGEND! 10x', 'FROST GOD! 15x'];
        this.addFloatingText(titles[Math.min(newMult, titles.length - 1)], this.truckPos.x, 3.4, this.truckPos.z, '#fbbf24');
      }

      // Add earned coins
      const vehicleCoinBonus = this.stats.activeVehicleId === 'titan' ? 1.2 : 1.0;
      const earned = plowResult.sqMetersCleared * newMult * 0.45 * vehicleCoinBonus;
      this.stats.coins += earned;
      this.stats.totalCoinsEarned += earned;
    } else {
      if (this.comboTimer > 0) {
        this.comboTimer -= dt;
        this.stats.multiplierProgress = Math.max(0, this.comboTimer / (this.comboMaxTime + this.upgrades.saltLevel * 0.8));
      } else {
        if (this.stats.currentMultiplier > 1) {
          this.stats.currentMultiplier = 1;
          this.stats.currentStreak = 0;
        }
      }
    }

    // Collectibles Pickups
    for (let i = 0; i < this.collectibleMeshes.length; i++) {
      const col = this.collectibleMeshes[i];
      if (!col.mesh.visible) continue;

      const dist = this.truckPos.distanceTo(new THREE.Vector3(col.x, 0, col.z));
      if (dist < 2.5) {
        col.mesh.visible = false;
        synth.playCoinPickup();

        if (col.type === 'coin') {
          const coinEarned = 50 * this.stats.currentMultiplier;
          this.stats.coins += coinEarned;
          this.addFloatingText(`+${coinEarned} COZY COINS! 🪙`, col.x, 3.0, col.z, '#fbbf24');
        } else if (col.type === 'cocoa') {
          this.stats.boostFuel = 100;
          this.stats.currentMultiplier = Math.max(5, this.stats.currentMultiplier);
          this.comboTimer = 6.0;
          this.addFloatingText('HOT COCOA RUSH! ☕⚡', col.x, 3.2, col.z, '#f43f5e');
        } else {
          this.stats.coins += 150;
          this.addFloatingText('+150 GOLDEN PINECONE! 🌲', col.x, 3.2, col.z, '#eab308');
        }
      }
    }

    // District Clear Progress
    const targetDistrict = DISTRICTS[this.stats.currentDistrictIndex];
    if (targetDistrict) {
      const targetSqM = 3000 + this.stats.currentDistrictIndex * 2200;
      const progress = Math.min(100, Math.floor((this.stats.snowClearedSqMeters / targetSqM) * 100));
      this.stats.districtClearProgress = progress;

      if (progress >= targetDistrict.targetSnowClearPercent && this.screen === 'playing') {
        this.setScreen('district_complete');
        this.stats.coins += targetDistrict.bonusReward;
        synth.playUpgradeFanfare();
        if (this.onDistrictComplete) {
          this.onDistrictComplete(targetDistrict.id, targetDistrict.bonusReward);
        }
      }
    }

    this.stats.speedKmh = Math.floor(Math.abs(this.truckSpeed) * 3.6);

    synth.updateEngineSound(speedRatio, throttle !== 0, isBoosting);
    synth.updateSnowCrunch(this.stats.isPlowing, speedRatio);
  }

  // --- Camera Choreography with Shake Trauma & Garage Bay Mode ---
  private updateCamera(dt: number) {
    if (this.screen === 'title') {
      // Gentle orbit around town square
      this.titlePanAngle += dt * 0.12;
      const radius = 38;
      const targetCamX = Math.cos(this.titlePanAngle) * radius;
      const targetCamZ = Math.sin(this.titlePanAngle) * radius;
      this.camera.position.set(targetCamX, 26, targetCamZ);
      this.camera.lookAt(0, 2, 0);
    } else if (this.screen === 'garage_home') {
      // Cinematic Vehicle Showcase Bay: Turntable inspection view
      this.garageTurntableAngle += dt * 0.4;
      const dist = 7.5;
      const camX = this.truckPos.x + Math.cos(this.garageTurntableAngle) * dist;
      const camZ = this.truckPos.z + Math.sin(this.garageTurntableAngle) * dist;
      const camY = this.truckPos.y + 3.8;

      this.camera.position.lerp(new THREE.Vector3(camX, camY, camZ), 1 - Math.exp(-6 * dt));
      this.camera.lookAt(this.truckPos.x, this.truckPos.y + 1.1, this.truckPos.z);
    } else {
      // Dynamic Isometric Follow Camera
      const isoOffset = new THREE.Vector3(18, 22, 18);
      const targetCamPos = this.truckPos.clone().add(isoOffset);

      // Camera Shake decay and application
      if (this.cameraShakeTrauma > 0) {
        this.cameraShakeTrauma = Math.max(0, this.cameraShakeTrauma - dt * 2.2);
        const shakeMag = this.cameraShakeTrauma * this.cameraShakeTrauma * 0.65;
        targetCamPos.x += (Math.random() - 0.5) * shakeMag;
        targetCamPos.y += (Math.random() - 0.5) * shakeMag;
        targetCamPos.z += (Math.random() - 0.5) * shakeMag;
      }

      this.camera.position.lerp(targetCamPos, 1 - Math.exp(-6 * dt));

      const lookTarget = this.truckPos.clone();
      lookTarget.y += 1.2;
      this.camera.lookAt(lookTarget);
    }
  }

  public addFloatingText(text: string, x: number, y: number, z: number, color: string = '#fef08a') {
    this.floatingTexts.push({
      id: Math.random().toString(36).substring(2, 9),
      text,
      x,
      y,
      z,
      color,
      scale: 1.0,
      opacity: 1.0,
    });
  }

  private updateFloatingTexts(dt: number) {
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += 1.6 * dt;
      ft.opacity -= 0.7 * dt;
      if (ft.opacity <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  // --- Main Tick ---
  private tick = () => {
    if (this.isDestroyed) return;

    const now = performance.now();
    const rawDt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    const dt = Math.min(rawDt, 0.05);

    this.updatePhysics(dt);
    this.updateCamera(dt);
    this.particles.update(dt, this.truckPos);

    this.collectibleMeshes.forEach((col) => {
      if (col.mesh.visible) {
        col.mesh.rotation.y += 2.2 * dt;
        col.mesh.position.y = 0.6 + Math.sin(now * 0.003 + col.x) * 0.15;
      }
    });

    this.updateFloatingTexts(dt);

    if (this.onStatsUpdate) {
      this.onStatsUpdate({ ...this.stats });
    }

    this.renderer.render(this.scene, this.camera);

    if (this.isSoftwareGl) {
      this.afterDraw(this.tick);
    } else {
      this.frameId = requestAnimationFrame(this.tick);
    }
  };

  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 80);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  private onResize = () => {
    if (!this.container || !this.renderer || !this.camera) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  public nextDistrict() {
    this.stats.currentDistrictIndex = Math.min(
      DISTRICTS.length - 1,
      this.stats.currentDistrictIndex + 1
    );
    this.snowSystem.resetSnow();
    this.stats.snowClearedSqMeters = 0;
    this.stats.districtClearProgress = 0;
    this.setScreen('playing');
    this.addFloatingText('NEW DISTRICT UNLOCKED! 🏔️', this.truckPos.x, 3.2, this.truckPos.z, '#38bdf8');
  }

  public destroy() {
    this.isDestroyed = true;
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);
    window.removeEventListener('resize', this.onResize);

    this.particles.dispose();
    this.snowSystem.dispose();
    this.models.dispose();
    synth.destroy();

    this.renderer.dispose();
    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
