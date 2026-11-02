/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DistrictInfo } from './types';

export interface MapObstacle {
  x: number;
  z: number;
  width?: number;
  depth?: number;
  radius?: number;
  name?: string;
}

export interface BuildingSpot {
  x: number;
  z: number;
  rot: number;
  type: 'timber' | 'stone' | 'red';
  label?: string;
}

export interface CollectibleItem {
  id: string;
  x: number;
  z: number;
  type: 'coin' | 'cocoa' | 'pinecone';
  collected: boolean;
}

export const DISTRICTS: DistrictInfo[] = [
  {
    id: 1,
    name: "Pine Hollow Main St",
    subtitle: "The Heart of the Alpine Valley",
    targetSnowClearPercent: 55,
    bonusReward: 250,
    description: "Clear the main road, the bakery driveway, and the town square around the grand pine tree.",
    unlockRequirement: 0,
  },
  {
    id: 2,
    name: "Chalet Ridge & Winding Pass",
    subtitle: "Cozy Residential Hills",
    targetSnowClearPercent: 65,
    bonusReward: 500,
    description: "Navigate tight mountain curves, clear neighborhood driveways, and bash through heavy snowdrifts.",
    unlockRequirement: 1,
  },
  {
    id: 3,
    name: "Summit Lodge & Blizzard Plaza",
    subtitle: "High Altitude Winter Wonderland",
    targetSnowClearPercent: 75,
    bonusReward: 1000,
    description: "A major snowstorm has buried the ski lodge and mountain pass. Clear the grand plaza for the winter festival!",
    unlockRequirement: 2,
  },
];

// Map layout definition
export function getMapData() {
  const chalets: BuildingSpot[] = [
    // Town Center Chalets
    { x: -28, z: -18, rot: 0, type: 'timber', label: "Alpine Bakery" },
    { x: -28, z: 18, rot: 0, type: 'red', label: "Cozy Books" },
    { x: 28, z: -18, rot: Math.PI, type: 'stone', label: "Mountain Gear" },
    { x: 28, z: 18, rot: Math.PI, type: 'timber', label: "Hot Cocoa Cafe" },

    // North Residential Ridge
    { x: -45, z: -45, rot: 0.2, type: 'timber' },
    { x: -18, z: -48, rot: -0.1, type: 'red' },
    { x: 18, z: -48, rot: 0.3, type: 'timber' },
    { x: 45, z: -45, rot: -0.4, type: 'stone' },

    // South Ridge / Lake Chalets
    { x: -48, z: 42, rot: 0.8, type: 'stone' },
    { x: -20, z: 48, rot: 0, type: 'timber' },
    { x: 22, z: 46, rot: -0.2, type: 'red' },
    { x: 48, z: 42, rot: -0.6, type: 'timber' },

    // Grand Ski Lodge (Far East)
    { x: 55, z: 0, rot: -Math.PI / 2, type: 'stone', label: "Summit Ski Lodge" },
    // Town Hall / Clock Tower (Far West)
    { x: -55, z: 0, rot: Math.PI / 2, type: 'red', label: "Alpine Town Hall" },
  ];

  // Pine trees placement (border groves + park clusters)
  const trees: { x: number; z: number; scale: number }[] = [];
  // Perimeter mountain groves
  for (let angle = 0; angle < Math.PI * 2; angle += 0.12) {
    const r = 68 + (Math.sin(angle * 7) * 4) + Math.random() * 6;
    trees.push({
      x: Math.cos(angle) * r,
      z: Math.sin(angle) * r,
      scale: 0.85 + Math.random() * 0.4,
    });
  }

  // Scattered neighborhood trees & park trees
  const parkTrees = [
    { x: -10, z: -8, scale: 1.1 },
    { x: 10, z: -8, scale: 1.2 },
    { x: -12, z: 10, scale: 0.9 },
    { x: 12, z: 10, scale: 1.0 },
    { x: -38, z: -30, scale: 1.3 },
    { x: 38, z: -30, scale: 1.1 },
    { x: -38, z: 30, scale: 1.2 },
    { x: 38, z: 30, scale: 1.0 },
    { x: 0, z: 0, scale: 1.6 }, // Central Grand Holiday Tree at town square!
  ];
  trees.push(...parkTrees);

  // Streetlamps along main roads
  const streetlamps = [
    { x: -22, z: -6 }, { x: -6, z: -6 }, { x: 6, z: -6 }, { x: 22, z: -6 },
    { x: -22, z: 6 }, { x: -6, z: 6 }, { x: 6, z: 6 }, { x: 22, z: 6 },
    { x: -6, z: -25 }, { x: 6, z: -25 }, { x: -6, z: 25 }, { x: 6, z: 25 },
    { x: -40, z: -6 }, { x: 40, z: -6 }, { x: -40, z: 6 }, { x: 40, z: 6 },
  ];

  // Fences along properties
  const fences = [
    { x: -28, z: -24, rot: 0 },
    { x: -28, z: 24, rot: 0 },
    { x: 28, z: -24, rot: 0 },
    { x: 28, z: 24, rot: 0 },
    { x: -45, z: -38, rot: 0.3 },
    { x: 45, z: -38, rot: -0.3 },
  ];

  // Snowmen to cheer on the plow!
  const snowmen = [
    { x: -22, z: -14 },
    { x: 22, z: -14 },
    { x: -20, z: 20 },
    { x: 24, z: 20 },
    { x: 5, z: -5 },
  ];

  // Snowdrifts (blocking driveways and road shoulders)
  const drifts: { x: number; z: number; type: 'small' | 'large' | 'blockade' }[] = [
    { x: -14, z: 0, type: 'large' },
    { x: 14, z: 0, type: 'large' },
    { x: 0, z: -16, type: 'large' },
    { x: 0, z: 16, type: 'large' },
    { x: -32, z: -10, type: 'small' },
    { x: 32, z: -10, type: 'small' },
    { x: -32, z: 10, type: 'small' },
    { x: 32, z: 10, type: 'small' },
    { x: -48, z: 0, type: 'blockade' },
    { x: 48, z: 0, type: 'blockade' },
    { x: 0, z: -38, type: 'blockade' },
    { x: 0, z: 38, type: 'blockade' },
    { x: -20, z: -35, type: 'small' },
    { x: 20, z: -35, type: 'small' },
    { x: -20, z: 35, type: 'small' },
    { x: 20, z: 35, type: 'small' },
  ];

  // Collectibles buried under snow
  const collectibles: CollectibleItem[] = [
    { id: 'c1', x: -15, z: -2, type: 'coin', collected: false },
    { id: 'c2', x: 15, z: -2, type: 'coin', collected: false },
    { id: 'c3', x: -2, z: -15, type: 'coin', collected: false },
    { id: 'c4', x: -2, z: 15, type: 'coin', collected: false },
    { id: 'c5', x: -35, z: 0, type: 'pinecone', collected: false },
    { id: 'c6', x: 35, z: 0, type: 'pinecone', collected: false },
    { id: 'c7', x: -25, z: -25, type: 'cocoa', collected: false },
    { id: 'c8', x: 25, z: 25, type: 'cocoa', collected: false },
    { id: 'c9', x: 0, z: 30, type: 'coin', collected: false },
    { id: 'c10', x: 0, z: -30, type: 'coin', collected: false },
  ];

  // Solid Collision Obstacles (buildings, trees, streetlamps, fences)
  const obstacles: MapObstacle[] = [];

  // 1. Chalets
  chalets.forEach((c) => {
    obstacles.push({
      x: c.x,
      z: c.z,
      width: 5.4,
      depth: 5.4,
      name: c.label || 'Chalet',
    });
  });

  // 2. Trees (Radial collision cylinder)
  trees.forEach((t) => {
    obstacles.push({
      x: t.x,
      z: t.z,
      radius: 1.2 * t.scale,
      name: 'Pine Tree',
    });
  });

  // 3. Street Lamps (Pedestal & pole)
  streetlamps.forEach((sl) => {
    obstacles.push({
      x: sl.x,
      z: sl.z,
      radius: 0.85,
      name: 'Street Lamp',
    });
  });

  // 4. Wooden Fences
  fences.forEach((f) => {
    obstacles.push({
      x: f.x,
      z: f.z,
      width: 3.2,
      depth: 0.9,
      name: 'Wooden Fence',
    });
  });

  return {
    chalets,
    trees,
    streetlamps,
    fences,
    snowmen,
    drifts,
    collectibles,
    obstacles,
  };
}
