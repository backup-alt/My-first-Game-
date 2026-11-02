/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from './game/gameEngine';
import { GameScreen, GameStats, TimeOfDay, VehicleId, VehicleUpgrades } from './game/types';
import { TitleScreen } from './ui/TitleScreen';
import { GameHud } from './ui/GameHud';
import { GarageHomeScreen } from './ui/GarageHomeScreen';
import { PauseModal } from './ui/PauseModal';
import { DistrictCompleteModal } from './ui/DistrictCompleteModal';
import { VirtualControls } from './ui/VirtualControls';
import { synth } from './audio/synthEngine';

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [screen, setScreen] = useState<GameScreen>('title');
  const [isMuted, setIsMuted] = useState(false);
  const [stats, setStats] = useState<GameStats>({
    coins: 100,
    snowClearedSqMeters: 0,
    currentStreak: 0,
    highestStreak: 0,
    currentMultiplier: 1,
    multiplierProgress: 0,
    totalCoinsEarned: 100,
    currentDistrictIndex: 0,
    districtClearProgress: 0,
    boostFuel: 100,
    isBoosting: false,
    isPlowing: false,
    speedKmh: 0,
    timeOfDay: 'day',
    activeVehicleId: 'titan',
    unlockedVehicles: ['titan'],
  });

  const [upgrades, setUpgrades] = useState<VehicleUpgrades>({
    plowLevel: 1,
    engineLevel: 1,
    handlingLevel: 1,
    saltLevel: 0,
    turboLevel: 1,
    heaterLevel: 0,
  });

  const [floatingTexts, setFloatingTexts] = useState<
    { id: string; text: string; opacity: number; color: string }[]
  >([]);

  // 1. Initialize stable 3D WebGL engine
  useEffect(() => {
    if (!mountRef.current) return;

    const engine = new GameEngine(mountRef.current);
    engineRef.current = engine;

    engine.onStatsUpdate = (newStats) => {
      setStats({ ...newStats });
      setFloatingTexts(
        engine.floatingTexts.map((ft) => ({
          id: ft.id,
          text: ft.text,
          opacity: ft.opacity,
          color: ft.color,
        }))
      );
    };

    engine.onScreenChange = (newScreen) => {
      setScreen(newScreen);
    };

    engine.onDistrictComplete = () => {
      setScreen('district_complete');
    };

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  // Screen Transitions
  const handleStartGame = () => {
    synth.ensureContext();
    if (engineRef.current) {
      engineRef.current.setScreen('playing');
      setScreen('playing');
    }
  };

  const handleOpenGarage = () => {
    if (engineRef.current) {
      engineRef.current.setScreen('garage_home');
      setScreen('garage_home');
    }
  };

  const handleCloseGarage = () => {
    if (engineRef.current) {
      engineRef.current.setScreen('playing');
      setScreen('playing');
    }
  };

  const handlePause = () => {
    if (engineRef.current) {
      engineRef.current.setScreen('paused');
      setScreen('paused');
    }
  };

  const handleResume = () => {
    if (engineRef.current) {
      engineRef.current.setScreen('playing');
      setScreen('playing');
    }
  };

  const handleRestart = () => {
    if (engineRef.current) {
      engineRef.current.stats.snowClearedSqMeters = 0;
      engineRef.current.stats.districtClearProgress = 0;
      engineRef.current.stats.currentStreak = 0;
      engineRef.current.stats.currentMultiplier = 1;
      engineRef.current.setScreen('playing');
      setScreen('playing');
    }
  };

  const handleQuitToTitle = () => {
    if (engineRef.current) {
      engineRef.current.setScreen('title');
      setScreen('title');
    }
  };

  const handleToggleMute = () => {
    const muted = synth.toggleMute();
    setIsMuted(muted);
  };

  const handleSetTimeOfDay = (tod: TimeOfDay) => {
    if (engineRef.current) {
      engineRef.current.setTimeOfDay(tod);
    }
  };

  // Upgrades with real coin deduction
  const handleUpgrade = (id: keyof VehicleUpgrades) => {
    if (!engineRef.current) return;
    const success = engineRef.current.applyUpgrade(id);
    if (success) {
      setUpgrades({ ...engineRef.current.upgrades });
      setStats({ ...engineRef.current.stats });
    }
  };

  // Vehicle switching and unlocking
  const handleSelectVehicle = (vehId: VehicleId) => {
    if (!engineRef.current) return;
    engineRef.current.switchVehicle(vehId);
    setStats({ ...engineRef.current.stats });
  };

  const handleUnlockVehicle = (vehId: VehicleId) => {
    if (!engineRef.current) return;
    const success = engineRef.current.unlockVehicle(vehId);
    if (success) {
      setStats({ ...engineRef.current.stats });
    }
  };

  const handleNextDistrict = () => {
    if (engineRef.current) {
      engineRef.current.nextDistrict();
      setScreen('playing');
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* Isolated WebGL Canvas Mount Container */}
      <div
        ref={mountRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Floating 3D Text / Popups HUD layer */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-25">
        {floatingTexts.slice(-3).map((ft) => (
          <div
            key={ft.id}
            className="absolute transition-transform duration-75 text-base sm:text-xl font-black drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] px-3 py-1 rounded-full bg-slate-950/70 border border-white/20 animate-fade-in"
            style={{
              color: ft.color,
              opacity: ft.opacity,
              transform: `translateY(-${(1 - ft.opacity) * 60}px) scale(${0.9 + ft.opacity * 0.2})`,
            }}
          >
            {ft.text}
          </div>
        ))}
      </div>

      {/* Game Screens */}
      {screen === 'title' && (
        <TitleScreen
          onStart={handleStartGame}
          onOpenShop={handleOpenGarage}
          highStreak={stats.highestStreak}
          totalCoins={stats.totalCoinsEarned}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {screen === 'playing' && (
        <>
          <GameHud
            stats={stats}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onSetTimeOfDay={handleSetTimeOfDay}
            onOpenShop={handleOpenGarage}
            onPause={handlePause}
          />
          <VirtualControls
            onSteer={(val) => engineRef.current?.setSteering(val)}
            onThrottle={(val) => engineRef.current?.setThrottle(val)}
            onBoost={(val) => engineRef.current?.setBoost(val)}
            isPlowing={stats.isPlowing}
            onToggleBlade={() => {
              window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyB' }));
            }}
          />
        </>
      )}

      {screen === 'garage_home' && (
        <GarageHomeScreen
          activeVehicleId={stats.activeVehicleId}
          unlockedVehicles={stats.unlockedVehicles}
          upgrades={upgrades}
          coins={stats.coins}
          onSelectVehicle={handleSelectVehicle}
          onUnlockVehicle={handleUnlockVehicle}
          onUpgrade={handleUpgrade}
          onStartDrive={handleCloseGarage}
        />
      )}

      {screen === 'paused' && (
        <PauseModal
          onResume={handleResume}
          onOpenShop={handleOpenGarage}
          onRestart={handleRestart}
          onQuitToTitle={handleQuitToTitle}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {screen === 'district_complete' && (
        <DistrictCompleteModal
          districtIndex={stats.currentDistrictIndex}
          bonus={stats.coins}
          highestStreak={stats.highestStreak}
          totalSnowCleared={stats.snowClearedSqMeters}
          onNextDistrict={handleNextDistrict}
          onFreePlow={() => {
            if (engineRef.current) {
              engineRef.current.setScreen('playing');
              setScreen('playing');
            }
          }}
          onOpenShop={handleOpenGarage}
        />
      )}
    </div>
  );
}
