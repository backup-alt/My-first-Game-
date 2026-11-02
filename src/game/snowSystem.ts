/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

export interface SnowClearResult {
  sqMetersCleared: number;
  driftsHit: number;
  bladeTipLeft: THREE.Vector3;
  bladeTipRight: THREE.Vector3;
  sprayOrigin: THREE.Vector3;
}

export interface SnowDriftItem {
  id: number;
  mesh: THREE.Mesh;
  position: THREE.Vector3;
  radius: number;
  health: number; // 1.0 to 0
  maxHealth: number;
  type: 'small' | 'large' | 'blockade';
}

export class SnowSystem {
  public canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  public texture: THREE.CanvasTexture;
  public worldSize: number = 160; // 160m x 160m town size
  public resolution: number = 1024; // 1024x1024 pixels -> ~0.15m per pixel
  private lastBladePos: THREE.Vector2 = new THREE.Vector2();
  private hasLastPos: boolean = false;

  // Snow drifts (3D physical mounds that pop into snow sprays)
  public drifts: SnowDriftItem[] = [];
  public driftGroup: THREE.Group;
  private driftGeomSmall: THREE.SphereGeometry;
  private driftGeomLarge: THREE.SphereGeometry;
  private driftMaterial: THREE.MeshStandardMaterial;

  // Total snow coverage accounting
  private totalMappableSnowPixels: number = 0;
  private clearedPixelsCount: number = 0;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.resolution;
    this.canvas.height = this.resolution;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true })!;

    // Initialize snow coverage: white fresh snow everywhere
    this.resetSnow();

    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.magFilter = THREE.LinearFilter;
    this.texture.wrapS = THREE.ClampToEdgeWrapping;
    this.texture.wrapT = THREE.ClampToEdgeWrapping;

    // 3D Snow Drifts
    this.driftGroup = new THREE.Group();
    this.driftGeomSmall = new THREE.SphereGeometry(1.2, 8, 6);
    this.driftGeomSmall.scale(1.4, 0.45, 1.4);
    this.driftGeomLarge = new THREE.SphereGeometry(2.2, 10, 8);
    this.driftGeomLarge.scale(1.6, 0.55, 1.6);

    this.driftMaterial = new THREE.MeshStandardMaterial({
      color: 0xf3f8fc,
      roughness: 0.9,
      metalness: 0.05,
      flatShading: true,
    });
  }

  public resetSnow() {
    // Fill with soft snowy tone and subtle micro-grain texture
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.resolution, this.resolution);

    // Add subtle procedural noise variations for cozy fresh powder look
    this.ctx.fillStyle = 'rgba(235, 244, 252, 0.6)';
    for (let i = 0; i < 400; i++) {
      const rx = Math.random() * this.resolution;
      const ry = Math.random() * this.resolution;
      const rad = 10 + Math.random() * 45;
      this.ctx.beginPath();
      this.ctx.arc(rx, ry, rad, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.totalMappableSnowPixels = this.resolution * this.resolution;
    this.clearedPixelsCount = 0;
    this.hasLastPos = false;
    if (this.texture) {
      this.texture.needsUpdate = true;
    }
  }

  // Convert world (X, Z) into Canvas (u, v) pixel coordinates
  private worldToCanvas(worldX: number, worldZ: number): { x: number; y: number } {
    const half = this.worldSize / 2;
    const u = (worldX + half) / this.worldSize;
    const v = (worldZ + half) / this.worldSize;
    return {
      x: Math.max(0, Math.min(this.resolution - 1, u * this.resolution)),
      y: Math.max(0, Math.min(this.resolution - 1, v * this.resolution)),
    };
  }

  // Spawn 3D snow drift mounds along roadsides and driveways
  public spawnDrifts(points: { x: number; z: number; type: 'small' | 'large' | 'blockade' }[]) {
    // Clear old drifts
    while (this.driftGroup.children.length > 0) {
      const child = this.driftGroup.children[0];
      this.driftGroup.remove(child);
    }
    this.drifts = [];

    points.forEach((pt, index) => {
      const geom = pt.type === 'small' ? this.driftGeomSmall : this.driftGeomLarge;
      const mesh = new THREE.Mesh(geom, this.driftMaterial);
      mesh.position.set(pt.x, 0.25, pt.z);
      mesh.rotation.y = Math.random() * Math.PI * 2;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.driftGroup.add(mesh);

      const radius = pt.type === 'small' ? 1.4 : 2.5;
      this.drifts.push({
        id: index,
        mesh,
        position: new THREE.Vector3(pt.x, 0.2, pt.z),
        radius,
        health: 1.0,
        maxHealth: 1.0,
        type: pt.type,
      });
    });
  }

  /**
   * Plowing action: swept polygon or thick stroke clearing snow
   */
  public plow(
    plowCenter: THREE.Vector3,
    headingAngle: number,
    plowWidth: number,
    plowAngleOffset: number = 0.2, // angled blade throws snow to the right
    bladeDown: boolean = true,
    saltTrailWidth: number = 0
  ): SnowClearResult {
    const halfWidth = plowWidth / 2;
    // Calculate blade left and right tips in world space
    const perpAngle = headingAngle + Math.PI / 2 + plowAngleOffset;
    const tipLeft = new THREE.Vector3(
      plowCenter.x - Math.cos(perpAngle) * halfWidth,
      0.1,
      plowCenter.z - Math.sin(perpAngle) * halfWidth
    );
    const tipRight = new THREE.Vector3(
      plowCenter.x + Math.cos(perpAngle) * halfWidth,
      0.1,
      plowCenter.z + Math.sin(perpAngle) * halfWidth
    );

    // Snow spray origin is the trailing blade tip
    const sprayOrigin = tipRight.clone();

    if (!bladeDown) {
      this.hasLastPos = false;
      return {
        sqMetersCleared: 0,
        driftsHit: 0,
        bladeTipLeft: tipLeft,
        bladeTipRight: tipRight,
        sprayOrigin,
      };
    }

    const currPos = new THREE.Vector2(plowCenter.x, plowCenter.z);

    if (!this.hasLastPos) {
      this.lastBladePos.copy(currPos);
      this.hasLastPos = true;
    }

    const distMoved = this.lastBladePos.distanceTo(currPos);
    let sqMetersCleared = 0;

    // Convert blade span to canvas pixels
    const pLeft = this.worldToCanvas(tipLeft.x, tipLeft.z);
    const pRight = this.worldToCanvas(tipRight.x, tipRight.z);

    // Draw swept clearing on canvas
    this.ctx.save();
    // 'destination-out' erases the snow texture to reveal the underlying dark asphalt / cobblestone!
    this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    // Blade clearing stroke
    const pixelWidth = (plowWidth / this.worldSize) * this.resolution;
    this.ctx.lineWidth = Math.max(2, pixelWidth * 0.95);
    this.ctx.beginPath();
    this.ctx.moveTo(pLeft.x, pLeft.y);
    this.ctx.lineTo(pRight.x, pRight.y);
    this.ctx.stroke();

    // If spreading salt, also clear a heated path behind the truck
    if (saltTrailWidth > 0) {
      const pCenter = this.worldToCanvas(plowCenter.x, plowCenter.z);
      this.ctx.lineWidth = (saltTrailWidth / this.worldSize) * this.resolution;
      this.ctx.beginPath();
      this.ctx.arc(pCenter.x, pCenter.y, this.ctx.lineWidth * 0.5, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.restore();

    this.texture.needsUpdate = true;

    // Calculate approximate square meters cleared from vehicle motion
    if (distMoved > 0.05) {
      // Area = distance * width
      sqMetersCleared = distMoved * plowWidth * 0.95;
      this.clearedPixelsCount += (sqMetersCleared / (this.worldSize * this.worldSize)) * this.totalMappableSnowPixels;
      this.lastBladePos.copy(currPos);
    }

    // Check collisions with 3D snow drifts
    let driftsHit = 0;
    for (let i = this.drifts.length - 1; i >= 0; i--) {
      const drift = this.drifts[i];
      if (drift.health <= 0) continue;

      const dist = drift.position.distanceTo(plowCenter);
      if (dist < drift.radius + halfWidth * 0.8) {
        // Impact! Shrink and destroy
        drift.health -= 0.6;
        drift.mesh.scale.multiplyScalar(0.65);
        drift.mesh.position.y -= 0.08;
        driftsHit++;
        sqMetersCleared += drift.type === 'large' ? 18 : 8;

        if (drift.health <= 0) {
          drift.mesh.visible = false;
        }
      }
    }

    return {
      sqMetersCleared,
      driftsHit,
      bladeTipLeft: tipLeft,
      bladeTipRight: tipRight,
      sprayOrigin,
    };
  }

  public getClearedPercentage(targetZoneTotalSqM: number): number {
    const cleared = (this.clearedPixelsCount / this.totalMappableSnowPixels) * (this.worldSize * this.worldSize);
    return Math.min(100, (cleared / targetZoneTotalSqM) * 100);
  }

  public dispose() {
    this.texture.dispose();
    this.driftGeomSmall.dispose();
    this.driftGeomLarge.dispose();
    this.driftMaterial.dispose();
  }
}
