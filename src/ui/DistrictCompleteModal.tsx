/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Star, ArrowRight, RotateCcw, Wrench } from 'lucide-react';
import { DISTRICTS } from '../game/mapData';

interface DistrictCompleteModalProps {
  districtIndex: number;
  bonus: number;
  highestStreak: number;
  totalSnowCleared: number;
  onNextDistrict: () => void;
  onFreePlow: () => void;
  onOpenShop: () => void;
}

export const DistrictCompleteModal: React.FC<DistrictCompleteModalProps> = ({
  districtIndex,
  bonus,
  highestStreak,
  totalSnowCleared,
  onNextDistrict,
  onFreePlow,
  onOpenShop,
}) => {
  const currentDistrict = DISTRICTS[districtIndex] || DISTRICTS[0];
  const hasNextDistrict = districtIndex < DISTRICTS.length - 1;

  useEffect(() => {
    // Fire festive winter celebration confetti
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#fbbf24', '#ffffff', '#a855f7'],
      });
    } catch {
      // Ignored if canvas blocked
    }
  }, []);

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/85 pointer-events-auto">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col items-center text-center">
        {/* Trophy Badge */}
        <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mb-4 shadow-lg shadow-amber-500/10">
          <Trophy className="w-8 h-8" />
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-sky-400 mb-1">
          District Cleared!
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
          {currentDistrict.name}
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mb-5">
          The villagers can now travel safely to the bakery and town square!
        </p>

        {/* 3 Stars */}
        <div className="flex items-center gap-2 mb-6">
          <Star className="w-7 h-7 text-amber-400 fill-amber-400" />
          <Star className="w-8 h-8 text-amber-400 fill-amber-400 animate-pulse" />
          <Star className="w-7 h-7 text-amber-400 fill-amber-400" />
        </div>

        {/* Scorecard Stats */}
        <div className="w-full bg-slate-950/70 border border-slate-800 rounded-2xl p-4 mb-6 space-y-2.5 text-xs sm:text-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span>District Bonus Reward</span>
            <span className="font-bold text-amber-400 font-mono-numbers">+🪙 {bonus}</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Peak Combo Streak</span>
            <span className="font-bold text-sky-400 font-mono-numbers">{highestStreak} m²</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Total Snow Cleared</span>
            <span className="font-bold text-slate-200 font-mono-numbers">{Math.floor(totalSnowCleared)} m²</span>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="w-full space-y-2.5">
          {hasNextDistrict ? (
            <button
              onClick={onNextDistrict}
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Next: {DISTRICTS[districtIndex + 1]?.name}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-300 font-bold text-xs mb-2">
              🎉 Master Snowplower! You have cleared all alpine districts!
            </div>
          )}

          <button
            onClick={onOpenShop}
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs border border-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Wrench className="w-4 h-4 text-amber-400" />
            <span>Visit Garage to Upgrade</span>
          </button>

          <button
            onClick={onFreePlow}
            className="w-full py-2.5 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Continue Free-Plowing This District</span>
          </button>
        </div>
      </div>
    </div>
  );
};
