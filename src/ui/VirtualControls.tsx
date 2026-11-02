/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Zap, Shield } from 'lucide-react';

interface VirtualControlsProps {
  onSteer: (steer: number) => void;
  onThrottle: (throttle: number) => void;
  onBoost: (active: boolean) => void;
  isPlowing: boolean;
  onToggleBlade: () => void;
}

export const VirtualControls: React.FC<VirtualControlsProps> = ({
  onSteer,
  onThrottle,
  onBoost,
  isPlowing,
  onToggleBlade,
}) => {
  return (
    <div className="absolute inset-x-0 bottom-6 px-6 pointer-events-none flex items-end justify-between z-15 sm:hidden">
      {/* Directional D-Pad */}
      <div className="pointer-events-auto grid grid-cols-3 gap-1.5 w-36 h-36 bg-slate-950/60 p-2 rounded-3xl border border-slate-800">
        <div />
        <button
          onTouchStart={() => onThrottle(1)}
          onTouchEnd={() => onThrottle(0)}
          onMouseDown={() => onThrottle(1)}
          onMouseUp={() => onThrottle(0)}
          className="flex items-center justify-center rounded-xl bg-slate-800 active:bg-amber-500 text-white active:text-slate-950"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
        <div />

        <button
          onTouchStart={() => onSteer(1)}
          onTouchEnd={() => onSteer(0)}
          onMouseDown={() => onSteer(1)}
          onMouseUp={() => onSteer(0)}
          className="flex items-center justify-center rounded-xl bg-slate-800 active:bg-amber-500 text-white active:text-slate-950"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button
          onTouchStart={() => onThrottle(-0.7)}
          onTouchEnd={() => onThrottle(0)}
          onMouseDown={() => onThrottle(-0.7)}
          onMouseUp={() => onThrottle(0)}
          className="flex items-center justify-center rounded-xl bg-slate-800 active:bg-amber-500 text-white active:text-slate-950"
        >
          <ArrowDown className="w-5 h-5" />
        </button>
        <button
          onTouchStart={() => onSteer(-1)}
          onTouchEnd={() => onSteer(0)}
          onMouseDown={() => onSteer(-1)}
          onMouseUp={() => onSteer(0)}
          className="flex items-center justify-center rounded-xl bg-slate-800 active:bg-amber-500 text-white active:text-slate-950"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Action Buttons (Boost & Blade) */}
      <div className="pointer-events-auto flex flex-col gap-2.5">
        <button
          onTouchStart={() => onBoost(true)}
          onTouchEnd={() => onBoost(false)}
          onMouseDown={() => onBoost(true)}
          onMouseUp={() => onBoost(false)}
          className="w-16 h-16 rounded-2xl bg-sky-500 active:bg-amber-400 text-slate-950 font-bold shadow-xl flex flex-col items-center justify-center text-[10px]"
        >
          <Zap className="w-6 h-6 fill-slate-950" />
          <span>BOOST</span>
        </button>

        <button
          onClick={onToggleBlade}
          className={`w-16 h-16 rounded-2xl font-bold shadow-xl flex flex-col items-center justify-center text-[10px] transition-colors ${
            isPlowing ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
          }`}
        >
          <Shield className="w-5 h-5" />
          <span>BLADE</span>
        </button>
      </div>
    </div>
  );
};
