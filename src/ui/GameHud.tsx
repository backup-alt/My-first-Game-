/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Sun,
  Sunset,
  Moon,
  Wrench,
  Pause,
  Zap,
  Snowflake,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { GameStats, TimeOfDay } from '../game/types';
import { DISTRICTS } from '../game/mapData';

interface GameHudProps {
  stats: GameStats;
  isMuted: boolean;
  onToggleMute: () => void;
  onSetTimeOfDay: (tod: TimeOfDay) => void;
  onOpenShop: () => void;
  onPause: () => void;
}

export const GameHud: React.FC<GameHudProps> = ({
  stats,
  isMuted,
  onToggleMute,
  onSetTimeOfDay,
  onOpenShop,
  onPause,
}) => {
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const currentDistrict = DISTRICTS[stats.currentDistrictIndex] || DISTRICTS[0];

  return (
    <div className="absolute inset-0 pointer-events-none p-4 sm:p-6 flex flex-col justify-between z-10">
      {/* Top Perimeter Cluster */}
      <div className="flex items-start justify-between w-full">
        {/* Top-Left: District Status & Clear Progress */}
        <div className="pointer-events-auto bg-slate-900/85 border border-slate-700/70 rounded-2xl p-3.5 shadow-xl min-w-[200px] sm:min-w-[260px] text-white">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider">
              District {currentDistrict.id}
            </span>
            <span className="text-xs font-bold text-amber-400 font-mono-numbers">
              {stats.districtClearProgress}% / {currentDistrict.targetSnowClearPercent}%
            </span>
          </div>

          <h3 className="text-sm sm:text-base font-bold text-slate-100 truncate mb-2">
            {currentDistrict.name}
          </h3>

          {/* Progress bar */}
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-2">
            <div
              className="bg-gradient-to-r from-sky-500 to-amber-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (stats.districtClearProgress / currentDistrict.targetSnowClearPercent) * 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Snow Plowed</span>
            <span className="font-bold text-slate-200 font-mono-numbers">
              {Math.floor(stats.snowClearedSqMeters)} m²
            </span>
          </div>
        </div>

        {/* Top-Center: Dynamic Combo Multiplier */}
        <div className="pointer-events-none flex flex-col items-center">
          {stats.currentMultiplier > 1 && (
            <div className="animate-bounce flex flex-col items-center">
              <div className="bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black px-4 py-1.5 rounded-full shadow-2xl flex items-center gap-1.5 text-sm sm:text-base border border-amber-300">
                <Snowflake className="w-4 h-4 fill-slate-950" />
                <span>COMBO x{stats.currentMultiplier}</span>
              </div>

              {/* Multiplier decay bar */}
              <div className="w-28 sm:w-36 bg-slate-950/70 rounded-full h-1.5 overflow-hidden mt-1.5 border border-amber-500/40">
                <div
                  className="bg-amber-400 h-full rounded-full transition-all duration-75"
                  style={{ width: `${stats.multiplierProgress * 100}%` }}
                />
              </div>

              <span className="text-[11px] font-semibold text-amber-200 drop-shadow mt-0.5 font-mono-numbers">
                Streak: {Math.floor(stats.currentStreak)}m²
              </span>
            </div>
          )}
        </div>

        {/* Top-Right: Coins, Weather/Time, Audio, Garage & Pause Controls */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Cozy Coins Counter */}
          <div className="bg-slate-900/85 border border-slate-700/70 rounded-2xl px-3.5 py-2 shadow-xl flex items-center gap-2 text-white">
            <span className="text-base">🪙</span>
            <span className="font-bold text-amber-400 text-sm sm:text-base font-mono-numbers">
              {Math.floor(stats.coins)}
            </span>
          </div>

          {/* Time of Day Cycle Toggle */}
          <div className="hidden sm:flex items-center bg-slate-900/85 border border-slate-700/70 rounded-2xl p-1 shadow-xl">
            <button
              onClick={() => onSetTimeOfDay('day')}
              className={`p-1.5 rounded-xl transition-colors ${
                stats.timeOfDay === 'day' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Daytime Sun"
            >
              <Sun className="w-4 h-4" />
            </button>
            <button
              onClick={() => onSetTimeOfDay('sunset')}
              className={`p-1.5 rounded-xl transition-colors ${
                stats.timeOfDay === 'sunset' ? 'bg-orange-500 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Sunset Glow"
            >
              <Sunset className="w-4 h-4" />
            </button>
            <button
              onClick={() => onSetTimeOfDay('night')}
              className={`p-1.5 rounded-xl transition-colors ${
                stats.timeOfDay === 'night' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Aurora Night"
            >
              <Moon className="w-4 h-4" />
            </button>
          </div>

          {/* Audio Mute */}
          <button
            onClick={onToggleMute}
            className="p-2.5 rounded-2xl bg-slate-900/85 border border-slate-700/70 hover:bg-slate-800 text-slate-200 transition-colors shadow-xl"
            title="Toggle Sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-sky-400" />}
          </button>

          {/* Garage Shop Button */}
          <button
            onClick={onOpenShop}
            className="px-3 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition-colors shadow-xl flex items-center gap-1.5"
            title="Open Garage (E)"
          >
            <Wrench className="w-4 h-4" />
            <span className="hidden sm:inline">Garage</span>
          </button>

          {/* Pause Button */}
          <button
            onClick={onPause}
            className="p-2.5 rounded-2xl bg-slate-900/85 border border-slate-700/70 hover:bg-slate-800 text-slate-200 transition-colors shadow-xl"
            title="Pause Game (Esc)"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Perimeter Cluster */}
      <div className="flex items-end justify-between w-full">
        {/* Bottom-Left: Speedometer & Boost Gauge */}
        <div className="pointer-events-auto bg-slate-900/85 border border-slate-700/70 rounded-2xl p-3.5 shadow-xl min-w-[170px] text-white">
          <div className="flex items-baseline justify-between mb-1.5">
            <div>
              <span className="text-2xl font-black text-white font-mono-numbers">
                {stats.speedKmh}
              </span>
              <span className="text-xs text-slate-400 font-semibold ml-1">km/h</span>
            </div>
            <div className={`text-xs px-2 py-0.5 rounded font-bold ${
              stats.isPlowing ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
            }`}>
              {stats.isPlowing ? 'PLOWING' : 'IDLE'}
            </div>
          </div>

          {/* Active Vehicle Badge */}
          <div className="text-[11px] font-semibold text-amber-400 mb-2 flex items-center gap-1 truncate">
            <span>🚜</span>
            <span className="truncate">{stats.activeVehicleId === 'titan' ? 'Alpine Titan 4x4' : stats.activeVehicleId === 'snowcat' ? 'Snowcat PistenBully' : stats.activeVehicleId === 'scout' ? 'Blizzard Scout 4x4' : 'Steam Iron Mammoth'}</span>
          </div>

          {/* Boost Fuel Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-semibold text-sky-300">
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-sky-400" />
                <span>Turbo Boost</span>
              </span>
              <span className="font-mono-numbers">{Math.floor(stats.boostFuel)}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-75 ${
                  stats.isBoosting ? 'bg-gradient-to-r from-amber-400 to-rose-500 animate-pulse' : 'bg-sky-400'
                }`}
                style={{ width: `${stats.boostFuel}%` }}
              />
            </div>
          </div>
        </div>

        {/* Bottom-Center: Collapsible Floating Control Dock (<=15% footprint) */}
        <div className="pointer-events-auto flex flex-col items-center">
          <button
            onClick={() => setIsDockCollapsed(!isDockCollapsed)}
            className="mb-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/70 hover:bg-slate-800 text-[11px] font-semibold text-slate-300 flex items-center gap-1 shadow-lg transition-colors cursor-pointer"
          >
            {isDockCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-sky-400" />
                <span>Show Controls</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                <span>Hide Dock</span>
              </>
            )}
          </button>

          {!isDockCollapsed && (
            <div className="px-5 py-2.5 rounded-2xl bg-slate-950/90 border border-slate-800/80 shadow-2xl flex items-center gap-4 text-xs font-medium text-slate-400 max-w-md">
              <span className="text-slate-200">
                <strong className="text-amber-400 font-bold">WASD / Arrows</strong> Move
              </span>
              <span>·</span>
              <span className="text-slate-200">
                <strong className="text-sky-400 font-bold">Space</strong> Boost
              </span>
              <span>·</span>
              <span className="text-slate-200">
                <strong className="text-slate-300 font-bold">B</strong> Blade
              </span>
              <span>·</span>
              <span className="text-slate-200">
                <strong className="text-amber-400 font-bold">E</strong> Shop
              </span>
            </div>
          )}
        </div>

        {/* Bottom-Right placeholder for spacing or mobile touch controls */}
        <div className="w-[170px] hidden sm:block" />
      </div>
    </div>
  );
};
