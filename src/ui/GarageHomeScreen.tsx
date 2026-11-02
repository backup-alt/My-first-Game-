/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Play,
  Truck,
  Wrench,
  Compass,
  Check,
  Lock,
  Zap,
  Flame,
  Shield,
  Gauge,
  Snowflake,
} from 'lucide-react';
import { VehicleId, VehicleUpgrades } from '../game/types';
import { VEHICLE_FLEET, UPGRADE_CATEGORIES } from '../game/vehiclesData';
import { DISTRICTS } from '../game/mapData';

interface GarageHomeScreenProps {
  activeVehicleId: VehicleId;
  unlockedVehicles: VehicleId[];
  upgrades: VehicleUpgrades;
  coins: number;
  onSelectVehicle: (id: VehicleId) => void;
  onUnlockVehicle: (id: VehicleId) => void;
  onUpgrade: (id: keyof VehicleUpgrades) => void;
  onStartDrive: () => void;
}

export const GarageHomeScreen: React.FC<GarageHomeScreenProps> = ({
  activeVehicleId,
  unlockedVehicles,
  upgrades,
  coins,
  onSelectVehicle,
  onUnlockVehicle,
  onUpgrade,
  onStartDrive,
}) => {
  const [tab, setTab] = useState<'fleet' | 'tuning' | 'districts'>('fleet');
  const activeDef = VEHICLE_FLEET.find((v) => v.id === activeVehicleId) || VEHICLE_FLEET[0];

  return (
    <div className="fixed inset-0 z-30 flex flex-col justify-between pointer-events-none p-4 sm:p-8 bg-slate-950/45">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between w-full pointer-events-auto">
        <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-700/80 rounded-2xl px-4 py-2.5 shadow-2xl">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-none">
              Alpine Vehicle Bay
            </h1>
            <span className="text-xs text-slate-400">
              Active: <strong className="text-amber-400">{activeDef.name}</strong>
            </span>
          </div>
        </div>

        {/* Center Tabs */}
        <div className="hidden sm:flex items-center bg-slate-900/90 border border-slate-700/80 rounded-2xl p-1 shadow-2xl">
          <button
            onClick={() => setTab('fleet')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              tab === 'fleet'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Vehicle Fleet ({unlockedVehicles.length}/{VEHICLE_FLEET.length})</span>
          </button>

          <button
            onClick={() => setTab('tuning')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              tab === 'tuning'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Tuning & Parts</span>
          </button>

          <button
            onClick={() => setTab('districts')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              tab === 'districts'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Districts</span>
          </button>
        </div>

        {/* Right Status (Coins & Drive Button) */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 rounded-2xl px-4 py-2.5 shadow-2xl text-white font-bold text-sm sm:text-base font-mono-numbers">
            <span className="text-lg">🪙</span>
            <span className="text-amber-400">{Math.floor(coins)}</span>
          </div>

          <button
            onClick={onStartDrive}
            className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Drive (Space)</span>
          </button>
        </div>
      </div>

      {/* Mobile Tab Row */}
      <div className="sm:hidden flex items-center justify-center gap-2 pointer-events-auto my-2">
        <button
          onClick={() => setTab('fleet')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
            tab === 'fleet' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-300'
          }`}
        >
          Fleet
        </button>
        <button
          onClick={() => setTab('tuning')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
            tab === 'tuning' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-300'
          }`}
        >
          Tuning
        </button>
        <button
          onClick={() => setTab('districts')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
            tab === 'districts' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-300'
          }`}
        >
          Districts
        </button>
      </div>

      {/* Main Showcase Panel (Floating left/center) */}
      <div className="pointer-events-auto max-w-4xl w-full mx-auto my-auto max-h-[70vh] overflow-y-auto">
        {/* 1. VEHICLE FLEET TAB */}
        {tab === 'fleet' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {VEHICLE_FLEET.map((veh) => {
              const isUnlocked = unlockedVehicles.includes(veh.id);
              const isSelected = activeVehicleId === veh.id;
              const canAfford = coins >= veh.unlockCost;

              return (
                <div
                  key={veh.id}
                  onClick={() => {
                    if (isUnlocked) onSelectVehicle(veh.id);
                  }}
                  className={`rounded-3xl p-5 border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-900/95 border-amber-400 shadow-2xl ring-2 ring-amber-400/30'
                      : 'bg-slate-950/85 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    {/* Top Row: Name and Status */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-white">{veh.name}</h3>
                          {isSelected && (
                            <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-sky-400 font-semibold">{veh.subtitle}</span>
                      </div>

                      <div
                        className="w-4 h-4 rounded-full border border-white/20"
                        style={{ backgroundColor: veh.colorTheme }}
                      />
                    </div>

                    <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                      {veh.description}
                    </p>

                    {/* Stats Gauges */}
                    <div className="space-y-2 mb-4 bg-slate-900/70 p-3 rounded-2xl border border-slate-800/80">
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-slate-400 mb-1">
                          <span className="flex items-center gap-1">
                            <Gauge className="w-3.5 h-3.5 text-sky-400" />
                            <span>Top Speed</span>
                          </span>
                          <span className="font-mono-numbers">{veh.stats.speed}/10</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-sky-400 h-full rounded-full"
                            style={{ width: `${veh.stats.speed * 10}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-slate-400 mb-1">
                          <span className="flex items-center gap-1">
                            <Shield className="w-3.5 h-3.5 text-amber-400" />
                            <span>Plow Blade Coverage</span>
                          </span>
                          <span className="font-mono-numbers">{veh.stats.plowWidth}/10</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-amber-400 h-full rounded-full"
                            style={{ width: `${veh.stats.plowWidth * 10}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-slate-400 mb-1">
                          <span className="flex items-center gap-1">
                            <Snowflake className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Ice Traction & Grip</span>
                          </span>
                          <span className="font-mono-numbers">{veh.stats.grip}/10</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-400 h-full rounded-full"
                            style={{ width: `${veh.stats.grip * 10}%` }}
                          />
                        </div>
                      </div>

                      {/* Perk */}
                      <div className="pt-1 text-[11px] font-medium text-amber-300">
                        ⚡ {veh.stats.perk}
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div>
                    {isSelected ? (
                      <div className="w-full py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-center gap-2">
                        <Check className="w-4 h-4" />
                        <span>Ready to Plow</span>
                      </div>
                    ) : isUnlocked ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectVehicle(veh.id);
                        }}
                        className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        Select Vehicle
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUnlockVehicle(veh.id);
                        }}
                        disabled={!canAfford}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          canAfford
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 active:scale-95'
                            : 'bg-slate-800/80 text-slate-500 border border-slate-800 cursor-not-allowed'
                        }`}
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Unlock for</span>
                        <span className="font-mono-numbers">🪙 {veh.unlockCost}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 2. TUNING & UPGRADES TAB (Coins properly deducted!) */}
        {tab === 'tuning' && (
          <div className="bg-slate-900/90 border border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Modular Mechanical Upgrades</h3>
                <p className="text-xs text-slate-400">Upgrades persist across all vehicles in your fleet</p>
              </div>
              <div className="text-xs font-bold text-slate-300">
                Wallet: <span className="text-amber-400 font-mono-numbers">🪙 {Math.floor(coins)}</span>
              </div>
            </div>

            <div className="space-y-3.5">
              {UPGRADE_CATEGORIES.map((cat) => {
                const currentLevel = upgrades[cat.id];
                const isMaxed = currentLevel >= cat.maxLevel;
                const currentSpec = cat.levels[Math.min(currentLevel - 1, cat.levels.length - 1)] || cat.levels[0];
                const nextSpec = !isMaxed ? cat.levels[currentLevel] : null;
                const canAfford = nextSpec ? coins >= nextSpec.cost : false;

                return (
                  <div
                    key={cat.id}
                    className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-white">{cat.title}</span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono-numbers">
                          Tier {currentLevel} / {cat.maxLevel}
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 font-semibold mb-0.5">
                        {isMaxed ? currentSpec.name : nextSpec?.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {isMaxed ? 'Maximum tier installed!' : nextSpec?.description}
                      </p>
                    </div>

                    <div className="shrink-0 w-full sm:w-auto">
                      {isMaxed ? (
                        <div className="px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5">
                          <Check className="w-4 h-4" />
                          <span>MAXED</span>
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
                          <span>Install</span>
                          <span className="font-mono-numbers">🪙 {nextSpec?.cost}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. DISTRICTS TAB */}
        {tab === 'districts' && (
          <div className="bg-slate-900/90 border border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white mb-2">Alpine Village Districts</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {DISTRICTS.map((d, i) => (
                <div key={d.id} className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-sky-400">District {d.id}</span>
                    <h4 className="text-sm font-bold text-white mb-1">{d.name}</h4>
                    <p className="text-xs text-slate-400 mb-3">{d.description}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-amber-400 font-semibold font-mono-numbers">
                    <span>Target: {d.targetSnowClearPercent}%</span>
                    <span>+🪙 {d.bonusReward}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Bar: Quick Control Hints */}
      <div className="w-full flex items-center justify-between pointer-events-auto">
        <div className="px-4 py-2 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 hidden sm:flex items-center gap-3">
          <span>Camera orbits active vehicle in showroom</span>
          <span>·</span>
          <span><strong className="text-amber-400">Space</strong> to Hit the Snow</span>
        </div>

        <button
          onClick={onStartDrive}
          className="ml-auto px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-slate-950" />
          <span>Exit Garage to Road</span>
        </button>
      </div>
    </div>
  );
};
