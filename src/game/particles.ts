/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

interface ActiveParticle {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  rot: number;
  rotSpeed: number;
  life: number;
  maxLife: number;
  scale: number;
  color: THREE.Color;
  active: boolean;
}

export class ParticleManager {
  // 1. Ambient Falling Snow
  private ambientSnowPoints: THREE.Points;
  private ambientSnowGeom: THREE.BufferGeometry;
  private ambientSnowPos: Float32Array;
  private ambientCount: number = 1800;
  private cameraCenter: THREE.Vector3 = new THREE.Vector3();

  // 2. Pooled Plow Snow Sprays & Bursts (InstancedMesh)
  private sprayMesh: THREE.InstancedMesh;
  private maxSprays: number = 180;
  private sprayParticles: ActiveParticle[] = [];
  private dummyObj: THREE.Object3D = new THREE.Object3D();

  // 3. Exhaust Smoke Puffs
  private exhaustMesh: THREE.InstancedMesh;
  private maxExhaust: number = 30;
  private exhaustParticles: ActiveParticle[] = [];

  constructor(scene: THREE.Scene) {
    // 1. Ambient Falling Snow System
    this.ambientSnowGeom = new THREE.BufferGeometry();
    this.ambientSnowPos = new Float32Array(this.ambientCount * 3);

    for (let i = 0; i < this.ambientCount; i++) {
      this.ambientSnowPos[i * 3] = (Math.random() - 0.5) * 80;
      this.ambientSnowPos[i * 3 + 1] = Math.random() * 25;
      this.ambientSnowPos[i * 3 + 2] = (Math.random() - 0.5) * 80;
    }

    this.ambientSnowGeom.setAttribute('position', new THREE.BufferAttribute(this.ambientSnowPos, 3));

    // Create a procedural soft round snowflake point texture
    const pointCanvas = document.createElement('canvas');
    pointCanvas.width = 32;
    pointCanvas.height = 32;
    const pCtx = pointCanvas.getContext('2d')!;
    const pGrad = pCtx.createRadialGradient(16, 16, 1, 16, 16, 15);
    pGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    pGrad.addColorStop(0.4, 'rgba(240, 248, 255, 0.7)');
    pGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    pCtx.fillStyle = pGrad;
    pCtx.fillRect(0, 0, 32, 32);

    const flakeTexture = new THREE.CanvasTexture(pointCanvas);

    const snowMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.35,
      map: flakeTexture,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      opacity: 0.8,
    });

    this.ambientSnowPoints = new THREE.Points(this.ambientSnowGeom, snowMat);
    scene.add(this.ambientSnowPoints);

    // 2. Pooled Snow Sprays (InstancedMesh of small soft snow spheres)
    const sprayGeom = new THREE.DodecahedronGeometry(0.28, 1);
    const sprayMat = new THREE.MeshStandardMaterial({
      color: 0xf1f8fe,
      roughness: 0.85,
      metalness: 0.05,
      transparent: true,
      opacity: 0.9,
    });

    this.sprayMesh = new THREE.InstancedMesh(sprayGeom, sprayMat, this.maxSprays);
    this.sprayMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(this.sprayMesh);

    for (let i = 0; i < this.maxSprays; i++) {
      this.sprayParticles.push({
        pos: new THREE.Vector3(0, -100, 0),
        vel: new THREE.Vector3(),
        rot: 0,
        rotSpeed: 0,
        life: 0,
        maxLife: 1.0,
        scale: 0.1,
        color: new THREE.Color(0xffffff),
        active: false,
      });
      this.dummyObj.position.set(0, -100, 0);
      this.dummyObj.updateMatrix();
      this.sprayMesh.setMatrixAt(i, this.dummyObj.matrix);
    }
    this.sprayMesh.instanceMatrix.needsUpdate = true;

    // 3. Exhaust Smoke Puffs
    const puffGeom = new THREE.SphereGeometry(0.18, 6, 6);
    const puffMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.9,
      transparent: true,
      opacity: 0.45,
    });
    this.exhaustMesh = new THREE.InstancedMesh(puffGeom, puffMat, this.maxExhaust);
    this.exhaustMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(this.exhaustMesh);

    for (let i = 0; i < this.maxExhaust; i++) {
      this.exhaustParticles.push({
        pos: new THREE.Vector3(0, -100, 0),
        vel: new THREE.Vector3(),
        rot: 0,
        rotSpeed: 0,
        life: 0,
        maxLife: 0.8,
        scale: 0.1,
        color: new THREE.Color(0x94a3b8),
        active: false,
      });
      this.dummyObj.position.set(0, -100, 0);
      this.dummyObj.updateMatrix();
      this.exhaustMesh.setMatrixAt(i, this.dummyObj.matrix);
    }
    this.exhaustMesh.instanceMatrix.needsUpdate = true;
  }

  // Emit snow spray arc from the plow blade tip
  public emitSnowSpray(
    origin: THREE.Vector3,
    headingAngle: number,
    plowWidth: number,
    intensity: number = 1.0,
    isBoosting: boolean = false
  ) {
    const count = Math.min(6, Math.floor(2 + intensity * 3));
    const sprayAngle = headingAngle - Math.PI / 3 + (Math.random() - 0.5) * 0.4; // Throw snow to right/forward

    for (let i = 0; i < count; i++) {
      // Find inactive particle
      const p = this.sprayParticles.find((pt) => !pt.active);
      if (!p) break;

      p.active = true;
      p.pos.copy(origin);
      p.pos.x += (Math.random() - 0.5) * (plowWidth * 0.3);
      p.pos.z += (Math.random() - 0.5) * 0.4;
      p.pos.y = 0.2 + Math.random() * 0.25;

      const speed = (4.0 + Math.random() * 5.5) * (isBoosting ? 1.5 : 1.0);
      p.vel.set(
        Math.cos(sprayAngle) * speed + (Math.random() - 0.5) * 1.5,
        1.8 + Math.random() * 3.2,
        Math.sin(sprayAngle) * speed + (Math.random() - 0.5) * 1.5
      );

      p.life = 0;
      p.maxLife = 0.5 + Math.random() * 0.4;
      p.scale = (0.2 + Math.random() * 0.35) * (isBoosting ? 1.4 : 1.0);
      p.rot = Math.random() * Math.PI * 2;
      p.rotSpeed = (Math.random() - 0.5) * 6;
    }
  }

  // Emit burst on 3D snow drift impact
  public emitDriftBurst(center: THREE.Vector3, large: boolean) {
    const count = large ? 16 : 8;
    for (let i = 0; i < count; i++) {
      const p = this.sprayParticles.find((pt) => !pt.active);
      if (!p) break;

      p.active = true;
      p.pos.copy(center);
      p.pos.x += (Math.random() - 0.5) * 1.2;
      p.pos.z += (Math.random() - 0.5) * 1.2;
      p.pos.y = 0.3 + Math.random() * 0.5;

      const angle = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * 4.5;
      p.vel.set(
        Math.cos(angle) * speed,
        2.5 + Math.random() * 4.0,
        Math.sin(angle) * speed
      );

      p.life = 0;
      p.maxLife = 0.6 + Math.random() * 0.4;
      p.scale = 0.35 + Math.random() * 0.4;
      p.rot = Math.random() * Math.PI * 2;
      p.rotSpeed = (Math.random() - 0.5) * 8;
    }
  }

  // Emit cute exhaust smoke puff
  public emitExhaustPuff(pos: THREE.Vector3, isBoosting: boolean) {
    const p = this.exhaustParticles.find((pt) => !pt.active);
    if (!p) return;

    p.active = true;
    p.pos.copy(pos);
    p.vel.set(
      (Math.random() - 0.5) * 0.4,
      0.8 + Math.random() * 0.6,
      (Math.random() - 0.5) * 0.4
    );
    p.life = 0;
    p.maxLife = 0.7;
    p.scale = isBoosting ? 0.35 : 0.18;
  }

  // Update loop
  public update(dt: number, focusPos: THREE.Vector3) {
    this.cameraCenter.copy(focusPos);

    // 1. Update ambient falling snowflakes around the player
    const positions = this.ambientSnowPos;
    const boxSize = 70;
    const halfBox = boxSize / 2;

    for (let i = 0; i < this.ambientCount; i++) {
      const i3 = i * 3;
      // Drift down with gentle wind flutter
      positions[i3 + 1] -= (2.5 + Math.sin(positions[i3] * 0.1 + i) * 0.5) * dt;
      positions[i3] += Math.sin(positions[i3 + 1] * 0.5 + i) * 0.4 * dt;
      positions[i3 + 2] += Math.cos(positions[i3 + 1] * 0.5 + i) * 0.3 * dt;

      // Wrap around focus position in X, Y, Z
      if (positions[i3 + 1] < 0) {
        positions[i3 + 1] = 22 + Math.random() * 4;
        positions[i3] = this.cameraCenter.x + (Math.random() - 0.5) * boxSize;
        positions[i3 + 2] = this.cameraCenter.z + (Math.random() - 0.5) * boxSize;
      }
      if (positions[i3] < this.cameraCenter.x - halfBox) positions[i3] += boxSize;
      if (positions[i3] > this.cameraCenter.x + halfBox) positions[i3] -= boxSize;
      if (positions[i3 + 2] < this.cameraCenter.z - halfBox) positions[i3 + 2] += boxSize;
      if (positions[i3 + 2] > this.cameraCenter.z + halfBox) positions[i3 + 2] -= boxSize;
    }
    this.ambientSnowGeom.attributes.position.needsUpdate = true;

    // 2. Update snow sprays
    let sprayNeedsUpdate = false;
    for (let i = 0; i < this.maxSprays; i++) {
      const p = this.sprayParticles[i];
      if (!p.active) continue;

      p.life += dt;
      if (p.life >= p.maxLife) {
        p.active = false;
        this.dummyObj.position.set(0, -100, 0);
        this.dummyObj.updateMatrix();
        this.sprayMesh.setMatrixAt(i, this.dummyObj.matrix);
        sprayNeedsUpdate = true;
        continue;
      }

      // Physics: gravity + air resistance
      p.vel.y -= 9.8 * dt;
      p.vel.x *= (1 - 1.5 * dt);
      p.vel.z *= (1 - 1.5 * dt);

      p.pos.addScaledVector(p.vel, dt);
      if (p.pos.y < 0.1) {
        p.pos.y = 0.1;
        p.vel.y = 0;
      }

      const progress = p.life / p.maxLife;
      const currentScale = p.scale * (1.0 - progress * 0.4);

      this.dummyObj.position.copy(p.pos);
      this.dummyObj.scale.setScalar(currentScale);
      this.dummyObj.rotation.set(0, p.rot + p.rotSpeed * p.life, 0);
      this.dummyObj.updateMatrix();
      this.sprayMesh.setMatrixAt(i, this.dummyObj.matrix);
      sprayNeedsUpdate = true;
    }
    if (sprayNeedsUpdate) {
      this.sprayMesh.instanceMatrix.needsUpdate = true;
    }

    // 3. Update exhaust smoke puffs
    let exhaustNeedsUpdate = false;
    for (let i = 0; i < this.maxExhaust; i++) {
      const p = this.exhaustParticles[i];
      if (!p.active) continue;

      p.life += dt;
      if (p.life >= p.maxLife) {
        p.active = false;
        this.dummyObj.position.set(0, -100, 0);
        this.dummyObj.updateMatrix();
        this.exhaustMesh.setMatrixAt(i, this.dummyObj.matrix);
        exhaustNeedsUpdate = true;
        continue;
      }

      p.pos.addScaledVector(p.vel, dt);
      const progress = p.life / p.maxLife;
      const currentScale = p.scale * (1.0 + progress * 1.5);

      this.dummyObj.position.copy(p.pos);
      this.dummyObj.scale.setScalar(currentScale);
      this.dummyObj.updateMatrix();
      this.exhaustMesh.setMatrixAt(i, this.dummyObj.matrix);
      exhaustNeedsUpdate = true;
    }
    if (exhaustNeedsUpdate) {
      this.exhaustMesh.instanceMatrix.needsUpdate = true;
    }
  }

  public dispose() {
    this.ambientSnowGeom.dispose();
    (this.ambientSnowPoints.material as THREE.Material).dispose();
    this.sprayMesh.geometry.dispose();
    (this.sprayMesh.material as THREE.Material).dispose();
    this.exhaustMesh.geometry.dispose();
    (this.exhaustMesh.material as THREE.Material).dispose();
  }
}
