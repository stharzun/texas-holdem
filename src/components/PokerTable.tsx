'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, SetupConfig, SeatPosition } from '../types';
import {
  initializeGame,
  startNewHand,
  processFold,
  processCheck,
  processCall,
  processRaise,
  processAllIn,
  getTotalPot,
} from '../gameEngine';
import PlayerSeat from './PlayerSeat';
import CommunityCards from './CommunityCards';
import PotDisplay from './PotDisplay';
import ActionPanel from './ActionPanel';
import StartScreen from './StartScreen';
import { calculateWinProbabilities, WinProbabilities } from '../utils/monteCarlo';

// ============================================================
// Seat positions for up to 10 players around an oval table
// Positions are percentage-based (top/left) relative to table container
// ============================================================
const SEAT_POSITIONS: SeatPosition[] = [
  // Bottom center (seat 0 - often dealer start)
  { top: '82%', left: '50%', transform: 'translate(-50%, -50%)' },
  // Bottom right
  { top: '75%', left: '72%', transform: 'translate(-50%, -50%)' },
  // Right
  { top: '55%', left: '88%', transform: 'translate(-50%, -50%)' },
  // Top right
  { top: '25%', left: '78%', transform: 'translate(-50%, -50%)' },
  // Top center-right
  { top: '12%', left: '62%', transform: 'translate(-50%, -50%)' },
  // Top center
  { top: '10%', left: '50%', transform: 'translate(-50%, -50%)' },
  // Top center-left
  { top: '12%', left: '38%', transform: 'translate(-50%, -50%)' },
  // Top left
  { top: '25%', left: '22%', transform: 'translate(-50%, -50%)' },
  // Left
  { top: '55%', left: '12%', transform: 'translate(-50%, -50%)' },
  // Bottom left
  { top: '75%', left: '28%', transform: 'translate(-50%, -50%)' },
];

// ============================================================
// Main Poker Table Component
// ============================================================
export default function PokerTable() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showSetup, setShowSetup] = useState(true);
  const [winProbabilities, setWinProbabilities] = useState<WinProbabilities>({});
  const simTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Run Monte Carlo simulation whenever the game phase or community cards change
  useEffect(() => {
    if (!gameState || gameState.phase === 'waiting' || gameState.phase === 'showdown') {
      setWinProbabilities({});
      return;
    }

    // Debounce: wait a tick so UI renders first, then compute
    if (simTimerRef.current) clearTimeout(simTimerRef.current);
    simTimerRef.current = setTimeout(() => {
      const probs = calculateWinProbabilities(
        gameState.players,
        gameState.communityCards,
        2000
      );
      setWinProbabilities(probs);
    }, 50);

    return () => {
      if (simTimerRef.current) clearTimeout(simTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState?.phase, gameState?.communityCards.length, gameState?.players.map(p => p.status).join(',')]);

  const handleStart = useCallback((config: SetupConfig) => {
    const initialState = initializeGame(config);
    const handState = startNewHand(initialState);
    setGameState(handState);
    setShowSetup(false);
  }, []);

  const handleNextHand = useCallback(() => {
    if (!gameState) return;
    const newState = startNewHand(gameState);
    setGameState(newState);
  }, [gameState]);

  const handleFold = useCallback(() => {
    if (!gameState) return;
    setGameState(processFold(gameState));
  }, [gameState]);

  const handleCheck = useCallback(() => {
    if (!gameState) return;
    setGameState(processCheck(gameState));
  }, [gameState]);

  const handleCall = useCallback(() => {
    if (!gameState) return;
    setGameState(processCall(gameState));
  }, [gameState]);

  const handleRaise = useCallback((amount: number) => {
    if (!gameState) return;
    setGameState(processRaise(gameState, amount));
  }, [gameState]);

  const handleAllIn = useCallback(() => {
    if (!gameState) return;
    setGameState(processAllIn(gameState));
  }, [gameState]);

  const handleNewGame = useCallback(() => {
    setShowSetup(true);
    setGameState(null);
  }, []);

  if (showSetup || !gameState) {
    return <StartScreen onStart={handleStart} />;
  }

  const totalPot = getTotalPot(gameState);
  const { players, communityCards, phase, activePlayerIndex, pots, winners } = gameState;

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-2">
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-5xl mb-2 px-2">
        <div className="text-gray-400 text-sm">
          Hand #{gameState.handNumber} •{' '}
          <span className="text-white capitalize">{phase}</span>
        </div>
        <h1 className="text-white font-bold text-lg">🃏 Texas Hold&apos;em</h1>
        <button
          onClick={handleNewGame}
          className="text-gray-400 hover:text-white text-sm transition-colors"
        >
          New Game
        </button>
      </div>

      {/* Table area */}
      <div className="relative w-full max-w-5xl mx-auto" style={{ paddingBottom: '56%' }}>
        {/* Poker table felt */}
        <div
          className="absolute inset-0 rounded-[50%] poker-table-felt border-8 border-amber-900"
          style={{
            background: 'radial-gradient(ellipse at center, #1a5c2a 0%, #0f3d1a 60%, #0a2d12 100%)',
            boxShadow: '0 0 0 12px #5c3a1e, 0 20px 60px rgba(0,0,0,0.8)',
          }}
        >
          {/* Table inner rail */}
          <div className="absolute inset-4 rounded-[50%] border-2 border-green-800/30" />

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <PotDisplay pots={pots} totalPot={totalPot} winners={winners} />
            <CommunityCards cards={communityCards} phase={phase} />
          </div>

          {/* Player seats */}
          {players.map((player, index) => {
            const position = SEAT_POSITIONS[player.seatIndex] ?? SEAT_POSITIONS[0];
            return (
              <PlayerSeat
                key={player.id}
                player={player}
                isActive={index === activePlayerIndex}
                phase={phase}
                showCards={phase === 'showdown'}
                seatStyle={{
                  top: position.top,
                  left: position.left,
                  transform: position.transform ?? 'translate(-50%, -50%)',
                  zIndex: 10,
                }}
                winProbability={winProbabilities[player.id]}
              />
            );
          })}
        </div>
      </div>

      {/* Action panel */}
      <div className="mt-3 w-full max-w-lg">
        <ActionPanel
          gameState={gameState}
          onFold={handleFold}
          onCheck={handleCheck}
          onCall={handleCall}
          onRaise={handleRaise}
          onAllIn={handleAllIn}
          onNextHand={handleNextHand}
        />
      </div>

      {/* Player stacks summary (bottom bar) */}
      <div className="mt-2 w-full max-w-5xl">
        <div className="flex flex-wrap gap-1 justify-center">
          {players.map((player, i) => (
            <div
              key={player.id}
              className={`
                flex items-center gap-1.5 px-2 py-1 rounded text-xs
                ${i === activePlayerIndex ? 'bg-yellow-900/50 border border-yellow-600' : 'bg-gray-800/50 border border-gray-700'}
                ${player.status === 'folded' ? 'opacity-40' : ''}
              `}
            >
              {player.isDealer && <span className="text-white bg-gray-600 rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">D</span>}
              <span className={i === activePlayerIndex ? 'text-yellow-300' : 'text-gray-300'}>
                {player.name}
              </span>
              <span className={player.stack === 0 ? 'text-red-400' : 'text-green-400'}>
                ${player.stack.toLocaleString()}
              </span>
              {player.status === 'all-in' && <span className="text-red-300 font-bold">AI</span>}
              {player.status === 'folded' && <span className="text-gray-500">F</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
