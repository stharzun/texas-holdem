'use client';

import React, { useState } from 'react';
import { SetupConfig } from '../types';

interface StartScreenProps {
  onStart: (config: SetupConfig) => void;
}

type Screen = 'landing' | 'setup';

export default function StartScreen({ onStart }: StartScreenProps) {
  const [screen, setScreen] = useState<Screen>('landing');
  const [numPlayers, setNumPlayers] = useState(4);
  const [playerNames, setPlayerNames] = useState<string[]>(
    Array.from({ length: 10 }, (_, i) => `Player ${i + 1}`)
  );
  const [startingStack, setStartingStack] = useState(1000);
  const [smallBlind, setSmallBlind] = useState(5);
  const [bigBlind, setBigBlind] = useState(10);

  const handleNameChange = (index: number, name: string) => {
    const updated = [...playerNames];
    updated[index] = name;
    setPlayerNames(updated);
  };

  const handleStart = () => {
    onStart({
      playerNames: playerNames.slice(0, numPlayers),
      startingStack,
      smallBlind,
      bigBlind,
    });
  };

  // ── Landing Page ──────────────────────────────────────────────
  if (screen === 'landing') {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Background decorative cards */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          {['♠', '♥', '♦', '♣'].map((suit, i) => (
            <span
              key={suit}
              className="absolute text-8xl opacity-5 font-bold"
              style={{
                top: `${[15, 65, 20, 70][i]}%`,
                left: `${[5, 80, 85, 10][i]}%`,
                color: i % 2 === 0 ? '#fff' : '#ef4444',
                transform: `rotate(${[-15, 20, -10, 15][i]}deg)`,
              }}
            >
              {suit}
            </span>
          ))}
        </div>

        {/* Main card */}
        <div className="relative z-10 flex flex-col items-center gap-8 max-w-md w-full">
          {/* Logo / Title */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="text-5xl">🂡</span>
              <span className="text-5xl">🂱</span>
            </div>
            <h1 className="text-5xl font-black text-white tracking-tight mb-2">
              Texas Hold&apos;em
            </h1>
            <p className="text-gray-400 text-lg">
              Local multiplayer · Up to 10 players
            </p>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-3 gap-3 w-full">
            {[
              { icon: '🃏', label: 'Full Rules', desc: 'Blinds, raises, side pots' },
              { icon: '📊', label: 'Win Odds', desc: 'Live Monte Carlo %' },
              { icon: '🏆', label: 'Showdown', desc: 'Best hand wins' },
            ].map(({ icon, label, desc }) => (
              <div
                key={label}
                className="bg-gray-900 border border-gray-700 rounded-xl p-3 text-center"
              >
                <div className="text-2xl mb-1">{icon}</div>
                <div className="text-white text-xs font-semibold">{label}</div>
                <div className="text-gray-500 text-xs mt-0.5">{desc}</div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={() => setScreen('setup')}
            className="w-full py-5 bg-green-600 hover:bg-green-500 active:bg-green-700 text-white font-black text-2xl rounded-2xl transition-all shadow-2xl shadow-green-900/50 hover:scale-[1.02] active:scale-[0.98]"
          >
            🃏 Play Now
          </button>

          <p className="text-gray-600 text-xs">No account needed · Runs in your browser</p>
        </div>
      </div>
    );
  }

  // ── Setup Screen ──────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-700 p-8 w-full max-w-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => setScreen('landing')}
            className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-1"
          >
            ← Back
          </button>
          <div className="flex-1 text-center">
            <h2 className="text-2xl font-bold text-white">Game Setup</h2>
            <p className="text-gray-400 text-sm">Configure your table</p>
          </div>
          <div className="w-12" /> {/* spacer */}
        </div>

        {/* Settings grid */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Number of players */}
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">
              Number of Players
            </label>
            <select
              value={numPlayers}
              onChange={e => setNumPlayers(Number(e.target.value))}
              className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:border-green-500"
            >
              {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                <option key={n} value={n}>{n} Players</option>
              ))}
            </select>
          </div>

          {/* Starting stack */}
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">
              Starting Stack ($)
            </label>
            <input
              type="number"
              value={startingStack}
              onChange={e => setStartingStack(Number(e.target.value))}
              min={100}
              step={100}
              className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:border-green-500"
            />
          </div>

          {/* Small blind */}
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">
              Small Blind ($)
            </label>
            <input
              type="number"
              value={smallBlind}
              onChange={e => setSmallBlind(Number(e.target.value))}
              min={1}
              className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:border-green-500"
            />
          </div>

          {/* Big blind */}
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">
              Big Blind ($)
            </label>
            <input
              type="number"
              value={bigBlind}
              onChange={e => setBigBlind(Number(e.target.value))}
              min={2}
              className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:border-green-500"
            />
          </div>
        </div>

        {/* Player names */}
        <div className="mb-6">
          <label className="block text-gray-300 text-sm font-semibold mb-3">
            Player Names
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: numPlayers }, (_, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-gray-500 text-xs w-6 text-right">{i + 1}.</span>
                <input
                  type="text"
                  value={playerNames[i]}
                  onChange={e => handleNameChange(i, e.target.value)}
                  className="flex-1 bg-gray-800 text-white rounded px-2 py-1.5 text-sm border border-gray-600 focus:outline-none focus:border-green-500"
                  placeholder={`Player ${i + 1}`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Start button */}
        <button
          onClick={handleStart}
          className="w-full py-4 bg-green-600 hover:bg-green-500 active:bg-green-700 text-white font-bold text-xl rounded-xl transition-all shadow-lg hover:scale-[1.01] active:scale-[0.99]"
        >
          🃏 Start Game
        </button>
      </div>
    </div>
  );
}
