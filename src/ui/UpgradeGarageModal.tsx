/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Wrench, Shield, Zap, Flame, Compass, Check } from 'lucide-react';
import { VehicleUpgrades } from '../game/types';

interface UpgradeGarageModalProps {
  upgrades: VehicleUpgrades;
  coins: number;
  onUpgrade: (id: keyof VehicleUpgrades) => void;
  onClose: () => void;
}

interface UpgradeItem {
  id: keyof VehicleUpgrades;
  title: string;
  icon: React.ReactNode;
  maxLevel: number;
  levels: {
    name: string;
    description: string;
    cost: number;
  }[];
}

const UPGRADE_DATA: UpgradeItem[] = [
  {
    id: 'plowLevel',
    title: 'Hydraulic Plow Blade',
    icon: <Shield className="w-5 h-5 text-amber-400" />,
    maxLevel: 5,
    levels: [
      { name: '2.0m Compact Blade', description: 'Standard starter blade for tight residential alleys.', cost: 0 },
      { name: '2.6m Broad Blade', description: 'Clears wider roadway paths in a single continuous pass.', cost: 150 },
      { name: '3.4m V-Wing Deflector', description: 'Angled wings throw snow higher and widen combo strips.', cost: 380 },
      { name: '4.4m Dual-Wing Titan', description: 'Heavy industrial blade that demolishes large snowdrifts.', cost: 800 },
      { name: '5.6m Blizzard Mammoth', description: 'Massive highway plow clears entire avenues effortlessly.', cost: 1600 },
    ],
  },
  {
    id: 'engineLevel',
    title: 'Turbo Diesel Engine',
    icon: <Flame className="w-5 h-5 text-orange-400" />,
    maxLevel: 5,
    levels: [
      { name: '150 HP Cozy 4-Cylinder', description: 'Reliable cold-weather starter motor.', cost: 0 },
      { name: '220 HP Turbocharged', description: 'Faster acceleration when pushing heavy snowdrifts.', cost: 180 },
      { name: '320 HP V6 High-Torque', description: 'Significantly higher cruising speed and hill climbing power.', cost: 420 },
      { name: '450 HP Twin-Turbo V8', description: 'Extreme torque cuts through snow with zero resistance.', cost: 950 },
      { name: '600 HP Alpine Super-Diesel', description: 'The ultimate powerhouse engine with roaring synth sound.', cost: 1900 },
    ],
  },
  {
    id: 'handlingLevel',
    title: 'Studded Snow Tires & Grip',
    icon: <Compass className="w-5 h-5 text-sky-400" />,
    maxLevel: 5,
    levels: [
      { name: 'All-Season Radial Tires', description: 'Decent traction on light powder.', cost: 0 },
      { name: 'Deep-Tread Snow Tires', description: 'Reduces slip and drift on icy corners.', cost: 140 },
      { name: 'Diamond-Link Steel Chains', description: 'Razor-sharp turning response on steep mountain roads.', cost: 320 },
      { name: 'Heavy 4x4 Studded Drive', description: 'Total control even during maximum speed drifts.', cost: 700 },
      { name: 'Arctic Expedition Track Grip', description: 'Unshakable grip that corners like a railcar on sheer ice.', cost: 1350 },
    ],
  },
  {
    id: 'saltLevel',
    title: 'Heated Salt Spreader',
    icon: <Zap className="w-5 h-5 text-yellow-300" />,
    maxLevel: 4,
    levels: [
      { name: 'Not Installed', description: 'No salt spreading capability.', cost: 0 },
      { name: 'Rear Salt Hopper', description: 'Leaves salt behind to melt residual ice and prolong combos.', cost: 200 },
      { name: 'Heated Brine Sprayer', description: 'Wider salt swath protects combo multiplier from breaking.', cost: 480 },
      { name: 'Rapid Thermite Melter', description: 'Melts deep snow tracks and triples combo grace period.', cost: 900 },
      { name: 'Eternal Salt Storm', description: 'Supercharged salt distributor clears roads behind you.', cost: 1750 },
    ],
  },
  {
    id: 'turboLevel',
    title: 'Nitrous Turbo Boost',
    icon: <Zap className="w-5 h-5 text-cyan-400" />,
    maxLevel: 4,
    levels: [
      { name: 'Basic Pressure Tank', description: 'Short burst of nitrous speed (Space).', cost: 0 },
      { name: 'Dual Nitrogen Injectors', description: 'Faster speed burst and +30% boost fuel capacity.', cost: 220 },
      { name: 'High-Flow Intercooler', description: 'Turbo recharges 50% faster while driving.', cost: 550 },
      { name: 'Infinite Cyclone Turbo', description: 'Maximum thrust with brilliant cyan particle trails.', cost: 1150 },
    ],
  },
  {
    id: 'heaterLevel',
    title: 'Cabin & Radiator Coils',
    icon: <Flame className="w-5 h-5 text-rose-400" />,
    maxLevel: 3,
    levels: [
      { name: 'Cold Stock Cabin', description: 'No passive ambient melting.', cost: 0 },
      { name: 'Ceramic Core Heater', description: 'Passively melts nearby snowbanks within 2 meters.', cost: 250 },
      { name: 'Thermal Undercarriage Coils', description: 'Wider passive melting aura melts snow on contact.', cost: 650 },
      { name: 'Geothermal Micro-Core', description: 'Radiates cozy warmth that auto-clears surrounding curbs.', cost: 1400 },
    ],
  },
];

export const UpgradeGarageModal: React.FC<UpgradeGarageModalProps> = ({
  upgrades,
  coins,
  onUpgrade,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/75 pointer-events-auto">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Alpine Workshop & Garage</h2>
              <p className="text-xs text-slate-400 font-medium">Upgrade plow blade, engine, studded tires, and thermal systems</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-sm font-bold text-amber-400 font-mono-numbers">
              <span>🪙</span>
              <span>{Math.floor(coins)}</span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Upgrade Cards List */}
        <div className="p-6 overflow-y-auto space-y-4">
          {UPGRADE_DATA.map((cat) => {
            const currentLevel = upgrades[cat.id];
            const isMaxed = currentLevel >= cat.maxLevel;
            const currentSpec = cat.levels[Math.min(currentLevel - 1, cat.levels.length - 1)] || cat.levels[0];
            const nextSpec = !isMaxed ? cat.levels[currentLevel] : null;
            const canAfford = nextSpec ? coins >= nextSpec.cost : false;

            return (
              <div
                key={cat.id}
                className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:border-slate-700"
              >
                <div className="flex items-start gap-3.5 flex-1">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                    {cat.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-bold text-white">{cat.title}</h4>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono-numbers">
                        Tier {currentLevel} / {cat.maxLevel}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 font-semibold mb-0.5">
                      {isMaxed ? currentSpec.name : nextSpec?.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {isMaxed ? 'Maximum tier installed!' : nextSpec?.description}
                    </p>
                  </div>
                </div>

                {/* Purchase Button */}
                <div className="shrink-0 w-full sm:w-auto">
                  {isMaxed ? (
                    <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5">
                      <Check className="w-4 h-4" />
                      <span>MAX LEVEL</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => onUpgrade(cat.id)}
                      disabled={!canAfford}
                      className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        canAfford
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 active:scale-95'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                      }`}
                    >
                      <span>Upgrade</span>
                      <span className="font-mono-numbers">🪙 {nextSpec?.cost}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Snow plowed continuously increases combo multiplier up to 15x.</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors cursor-pointer"
          >
            Back to Road
          </button>
        </div>
      </div>
    </div>
  );
};
