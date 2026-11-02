/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Volume2, VolumeX, Sparkles, Snowflake, Compass } from 'lucide-react';
import { synth } from '../audio/synthEngine';

interface TitleScreenProps {
  onStart: () => void;
  onOpenShop: () => void;
  highStreak: number;
  totalCoins: number;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStart,
  onOpenShop,
  highStreak,
  totalCoins,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 sm:p-12 z-20">
      {/* Top Bar Status / Settings */}
      <div className="flex items-center justify-between w-full pointer-events-auto">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/60 shadow-lg text-xs font-medium text-slate-300">
          <Snowflake className="w-4 h-4 text-sky-400" />
          <span>Alpine Winter Festival 2026</span>
          <span className="text-slate-500">·</span>
          <span className="text-amber-400 font-mono-numbers">Best Streak: {highStreak}m²</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMute}
            className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60 hover:bg-slate-800 text-slate-200 transition-colors shadow-lg"
            title="Toggle Audio"
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-sky-400" />}
          </button>
        </div>
      </div>

      {/* Hero Title Lockup & Negative Space (30-40% viewport height) */}
      <div className="flex flex-col items-center text-center my-auto pointer-events-auto max-w-xl mx-auto">
        {/* Bespoke Inline SVG Title Lockup */}
        <div className="relative mb-3 flex items-center justify-center">
          <svg className="w-24 h-24 sm:w-28 sm:h-28 drop-shadow-xl" viewBox="0 0 100 100" fill="none">
            {/* Mountain peaks background */}
            <path d="M10 80L35 35L55 65L75 25L95 80Z" fill="#1e293b" opacity="0.7" />
            <path d="M35 35L42 47L28 47Z" fill="#f8fafc" />
            <path d="M75 25L82 38L68 38Z" fill="#f8fafc" />
            {/* Heavy curved snowplow blade */}
            <path d="M12 72C25 58 65 58 88 72L84 82C65 70 25 70 16 82Z" fill="#f59e0b" />
            {/* Warning black hash marks */}
            <path d="M22 71L26 80M38 67L42 77M58 67L62 77M74 71L78 80" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
            {/* Snow flying */}
            <circle cx="86" cy="52" r="3.5" fill="#e0f2fe" />
            <circle cx="92" cy="60" r="2.5" fill="#ffffff" />
            <circle cx="78" cy="46" r="2.0" fill="#bae6fd" />
          </svg>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white drop-shadow-lg mb-2">
          Frost<span className="text-amber-400">Plow</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-300 font-medium max-w-md drop-shadow mb-8 leading-relaxed">
          Cozy alpine snow-plowing simulation. Clear village roads, build massive combo streaks, upgrade your winter rig, and chill to warm synth beats.
        </p>

        {/* Primary CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => {
              synth.ensureContext();
              onStart();
            }}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-base shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Compass className="w-5 h-5" />
            <span>Start Plowing (Space)</span>
          </button>

          <button
            onClick={onOpenShop}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold text-base shadow-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>Garage & Upgrades</span>
          </button>
        </div>
      </div>

      {/* Flat Control Hints Bar at bottom */}
      <div className="w-full flex items-center justify-center pointer-events-auto">
        <div className="px-5 py-2.5 rounded-full bg-slate-950/80 border border-slate-800/80 text-xs sm:text-sm font-medium text-slate-400 flex items-center gap-3 sm:gap-4 flex-wrap justify-center shadow-lg">
          <span className="text-slate-200"><strong className="text-amber-400 font-bold">WASD / Arrows</strong> Drive</span>
          <span>·</span>
          <span className="text-slate-200"><strong className="text-sky-400 font-bold">Space</strong> Turbo Boost</span>
          <span>·</span>
          <span className="text-slate-200"><strong className="text-slate-200 font-bold">B</strong> Blade Lift</span>
          <span>·</span>
          <span className="text-slate-200"><strong className="text-amber-400 font-bold">E</strong> Garage</span>
          <span>·</span>
          <span className="text-slate-200"><strong className="text-slate-200 font-bold">M</strong> Audio</span>
          <span>·</span>
          <span className="text-slate-200"><strong className="text-slate-200 font-bold">Esc</strong> Pause</span>
        </div>
      </div>
    </div>
  );
};
