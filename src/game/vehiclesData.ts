/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { VehicleDef, VehicleUpgrades } from './types';

export const VEHICLE_FLEET: VehicleDef[] = [
  {
    id: 'titan',
    name: 'Alpine Titan 4x4',
    subtitle: 'Heavy Duty Municipal Plow',
    description: 'The standard heavy-duty winter truck. Balanced torque, sturdy hydraulic push arms, and dual hazard beacons.',
    unlockCost: 0, // Starter vehicle
    stats: {
      speed: 7,
      plowWidth: 8,
      grip: 8,
      perk: '+20% Combo bonus on wide municipal avenues',
    },
    colorTheme: '#f59e0b',
  },
  {
    id: 'snowcat',
    name: 'PistenBully Snowcat',
    subtitle: 'Arctic Dual-Track Groomer',
    description: 'Dual rubber caterpillar treads with an ultra-wide hydraulic bulldozer blade and heated panoramic dome cab. 100% ice traction!',
    unlockCost: 350,
    stats: {
      speed: 5,
      plowWidth: 10,
      grip: 10,
      perk: 'Zero slip on ice + Demolishes snowdrifts in 1 hit',
    },
    colorTheme: '#ef4444',
  },
  {
    id: 'scout',
    name: 'Blizzard Scout 4x4',
    subtitle: 'Agile Sport Winter Jeep',
    description: 'Lifted high-speed off-roader equipped with an aggressive angled V-plow blade, rooftop spotlights, and tight cornering.',
    unlockCost: 250,
    stats: {
      speed: 10,
      plowWidth: 6,
      grip: 7,
      perk: 'Fastest top speed + 50% faster Turbo boost refill',
    },
    colorTheme: '#38bdf8',
  },
  {
    id: 'steampunk',
    name: 'Steam Iron Mammoth',
    subtitle: 'Geothermal Boiler Plow',
    description: 'Vintage brass and cast-iron snow hauler with a smoking chimney, glowing firebox, and a heavy riveted steel cowcatcher.',
    unlockCost: 550,
    stats: {
      speed: 6,
      plowWidth: 9,
      grip: 9,
      perk: 'Radiates intense heat that melts snow around it',
    },
    colorTheme: '#d97706',
  },
];

export interface UpgradeCategoryDef {
  id: keyof VehicleUpgrades;
  title: string;
  maxLevel: number;
  levels: {
    name: string;
    description: string;
    cost: number;
    value: number;
  }[];
}

export const UPGRADE_CATEGORIES: UpgradeCategoryDef[] = [
  {
    id: 'plowLevel',
    title: 'Hydraulic Plow Blade',
    maxLevel: 5,
    levels: [
      { name: '2.0m Compact Blade', description: 'Standard starter blade for tight residential alleys.', cost: 0, value: 2.0 },
      { name: '2.6m Broad Blade', description: 'Clears wider roadway paths in a single continuous pass.', cost: 150, value: 2.6 },
      { name: '3.4m V-Wing Deflector', description: 'Angled wings throw snow higher and widen combo strips.', cost: 380, value: 3.4 },
      { name: '4.4m Dual-Wing Titan', description: 'Heavy industrial blade that demolishes large snowdrifts.', cost: 800, value: 4.4 },
      { name: '5.6m Blizzard Mammoth', description: 'Massive highway plow clears entire avenues effortlessly.', cost: 1600, value: 5.6 },
    ],
  },
  {
    id: 'engineLevel',
    title: 'Turbo Diesel Engine',
    maxLevel: 5,
    levels: [
      { name: '150 HP Cozy 4-Cylinder', description: 'Reliable cold-weather starter motor.', cost: 0, value: 1.0 },
      { name: '220 HP Turbocharged', description: 'Faster acceleration when pushing heavy snowdrifts.', cost: 180, value: 1.25 },
      { name: '320 HP V6 High-Torque', description: 'Significantly higher cruising speed and hill climbing power.', cost: 420, value: 1.5 },
      { name: '450 HP Twin-Turbo V8', description: 'Extreme torque cuts through snow with zero resistance.', cost: 950, value: 1.8 },
      { name: '600 HP Alpine Super-Diesel', description: 'The ultimate powerhouse engine with roaring synth sound.', cost: 1900, value: 2.2 },
    ],
  },
  {
    id: 'handlingLevel',
    title: 'Studded Snow Tires & Grip',
    maxLevel: 5,
    levels: [
      { name: 'All-Season Radial Tires', description: 'Decent traction on light powder.', cost: 0, value: 1.0 },
      { name: 'Deep-Tread Snow Tires', description: 'Reduces slip and drift on icy corners.', cost: 140, value: 1.25 },
      { name: 'Diamond-Link Steel Chains', description: 'Razor-sharp turning response on steep mountain roads.', cost: 320, value: 1.55 },
      { name: 'Heavy 4x4 Studded Drive', description: 'Total control even during maximum speed drifts.', cost: 700, value: 1.9 },
      { name: 'Arctic Expedition Track Grip', description: 'Unshakable grip that corners like a railcar on sheer ice.', cost: 1350, value: 2.3 },
    ],
  },
  {
    id: 'saltLevel',
    title: 'Heated Salt Spreader',
    maxLevel: 4,
    levels: [
      { name: 'Not Installed', description: 'No salt spreading capability.', cost: 0, value: 0 },
      { name: 'Rear Salt Hopper', description: 'Leaves salt behind to melt residual ice and prolong combos.', cost: 200, value: 1.0 },
      { name: 'Heated Brine Sprayer', description: 'Wider salt swath protects combo multiplier from breaking.', cost: 480, value: 1.8 },
      { name: 'Rapid Thermite Melter', description: 'Melts deep snow tracks and triples combo grace period.', cost: 900, value: 2.5 },
      { name: 'Eternal Salt Storm', description: 'Supercharged salt distributor clears roads behind you.', cost: 1750, value: 3.5 },
    ],
  },
  {
    id: 'turboLevel',
    title: 'Nitrous Turbo Boost',
    maxLevel: 4,
    levels: [
      { name: 'Basic Pressure Tank', description: 'Short burst of nitrous speed (Space).', cost: 0, value: 1.0 },
      { name: 'Dual Nitrogen Injectors', description: 'Faster speed burst and +30% boost fuel capacity.', cost: 220, value: 1.35 },
      { name: 'High-Flow Intercooler', description: 'Turbo recharges 50% faster while driving.', cost: 550, value: 1.8 },
      { name: 'Infinite Cyclone Turbo', description: 'Maximum thrust with brilliant cyan particle trails.', cost: 1150, value: 2.4 },
    ],
  },
  {
    id: 'heaterLevel',
    title: 'Cabin & Radiator Coils',
    maxLevel: 3,
    levels: [
      { name: 'Cold Stock Cabin', description: 'No passive ambient melting.', cost: 0, value: 0 },
      { name: 'Ceramic Core Heater', description: 'Passively melts nearby snowbanks within 2 meters.', cost: 250, value: 1.0 },
      { name: 'Thermal Undercarriage Coils', description: 'Wider passive melting aura melts snow on contact.', cost: 650, value: 2.0 },
      { name: 'Geothermal Micro-Core', description: 'Radiates cozy warmth that auto-clears surrounding curbs.', cost: 1400, value: 3.2 },
    ],
  },
];
