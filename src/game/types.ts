/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameScreen = 'title' | 'playing' | 'paused' | 'garage_home' | 'district_complete';

export type TimeOfDay = 'day' | 'sunset' | 'night';

export type VehicleId = 'titan' | 'snowcat' | 'scout' | 'steampunk';

export interface VehicleDef {
  id: VehicleId;
  name: string;
  subtitle: string;
  description: string;
  unlockCost: number; // 0 for starter, coins for others
  stats: {
    speed: number;      // 1-10
    plowWidth: number;  // 1-10
    grip: number;       // 1-10
    perk: string;       // Unique perk description
  };
  colorTheme: string;
}

export interface VehicleUpgrades {
  plowLevel: number;        // 1 to 5 (Blade width and clearing efficiency)
  engineLevel: number;      // 1 to 5 (Top speed and acceleration)
  handlingLevel: number;    // 1 to 5 (Grip on ice and turning responsiveness)
  saltLevel: number;        // 0 to 4 (Spreads salt behind to melt residual frost and extend combo)
  turboLevel: number;       // 1 to 4 (Boost speed, duration, and cooldown)
  heaterLevel: number;      // 0 to 3 (Passive melting radius around the truck)
}

export interface DistrictInfo {
  id: number;
  name: string;
  subtitle: string;
  targetSnowClearPercent: number;
  bonusReward: number;
  description: string;
  unlockRequirement: number;
}

export interface GameStats {
  coins: number;
  snowClearedSqMeters: number;
  currentStreak: number;
  highestStreak: number;
  currentMultiplier: number;
  multiplierProgress: number; // 0 to 1
  totalCoinsEarned: number;
  currentDistrictIndex: number;
  districtClearProgress: number; // 0 to 100
  boostFuel: number; // 0 to 100
  isBoosting: boolean;
  isPlowing: boolean;
  speedKmh: number;
  timeOfDay: TimeOfDay;
  activeVehicleId: VehicleId;
  unlockedVehicles: VehicleId[];
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  z: number;
  color: string;
  scale: number;
  opacity: number;
}
