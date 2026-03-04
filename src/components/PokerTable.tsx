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
// Seat positions optimized for the new table design
// Positions are percentage-based (top/left) relative to table container
// ============================================================
const SEAT_POSITIONS: SeatPosition[] = [
  // Bottom center (user position)
  { top: '88%', left: '50%', transform: 'translate(-50%, -50%)' },
  // Bottom right
  { top: '78%', left: '75%', transform: 'translate(-50%, -50%)' },
  // Mid right
  { top: '55%', left: '92%', transform: 'translate(-50%, -50%)' },
  // Top right
  { top: '22%', left: '82%', transform: 'translate(-50%, -50%)' },
  // Top center-right
  { top: '8%', left: '65%', transform: 'translate(-50%, -50%)' },
  // Top center
  { top: '6%', left: '50%', transform: 'translate(-50%, -50%)' },
  // Top center-left
  { top: '8%', left: '35%', transform: 'translate(-50%, -50%)' },
  // Top left
  { top: '22%', left: '18%', transform: 'translate(-50%, -50%)' },
  // Mid left
  { top: '55%', left: '8%', transform: 'translate(-50%, -50%)' },
  // Bottom left
  { top: '78%', left: '25%', transform: 'translate(-50%, -50%)' },
];

// ============================================================
// Main Poker Table Component - Redesigned
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
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between px-6 py-3 bg-gray-950/80 backdrop-blur-sm border-b border-gray-800/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center shadow-lg">
            <span className="text-lg">🃏</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-sm">Texas Hold'em</h1>
            <div className="text-gray-500 text-xs">
              Hand #{gameState.handNumber}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 rounded-full border border-gray-800">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-gray-300 text-xs font-medium capitalize">{phase}</span>
          </div>
          <button
            onClick={handleNewGame}
            className="px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white bg-gray-900 hover:bg-gray-800 rounded-full border border-gray-800 transition-all"
          >
            New Game
          </button>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Poker Table Container */}
        <div className="relative w-full max-w-6xl mx-auto" style={{ paddingBottom: '52%' }}>
          {/* Table Background with Wood Rail */}
          <div className="absolute inset-0 rounded-[45%] shadow-2xl overflow-hidden">
            {/* Wood Rail */}
            <div 
              className="absolute inset-0 rounded-[45%]"
              style={{
                background: 'linear-gradient(145deg, #8B5A2B 0%, #654321 30%, #4A2C17 50%, #654321 70%, #8B5A2B 100%)',
                boxShadow: 'inset 0 0 40px rgba(0,0,0,0.6), 0 10px 40px rgba(0,0,0,0.8)',
              }}
            />
            
            {/* Inner Felt */}
            <div 
              className="absolute inset-3 rounded-[45%] overflow-hidden"
              style={{
                background: 'radial-gradient(ellipse at center, #0d4a1c 0%, #093d16 40%, #063011 100%)',
              }}
            >
              {/* Felt Texture Pattern */}
              <div 
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `
                    repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px),
                    repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)
                  `,
                }}
              />
              
              {/* Inner Border Line */}
              <div 
                className="absolute inset-4 rounded-[45%] border-2 border-green-700/40"
                style={{
                  boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)',
                }}
              />

              {/* Center Content Area */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
                <PotDisplay pots={pots} totalPot={totalPot} winners={winners} />
                <CommunityCards cards={communityCards} phase={phase} />
              </div>

              {/* Player Seats */}
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
                      zIndex: 20,
                    }}
                    winProbability={winProbabilities[player.id]}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="mt-4 w-full max-w-xl">
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
      </main>

      {/* Player Info Bar */}
      <footer className="px-4 py-2 bg-gray-950/90 backdrop-blur border-t border-gray-800/50">
        <div className="flex flex-wrap gap-2 justify-center max-w-6xl mx-auto">
          {players.map((player, i) => (
            <div
              key={player.id}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs
                ${i === activePlayerIndex 
                  ? 'bg-yellow-900/30 border border-yellow-600/50 shadow-sm shadow-yellow-900/20' 
                  : 'bg-gray-900/50 border border-gray-800'}
                ${player.status === 'folded' ? 'opacity-40' : ''}
                transition-all duration-200
              `}
            >
              {player.isDealer && (
                <span className="w-4 h-4 bg-white text-black rounded-full flex items-center justify-center text-[10px] font-bold">
                  D
                </span>
              )}
              {player.isSmallBlind && !player.isDealer && (
                <span className="w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                  SB
                </span>
              )}
              {player.isBigBlind && (
                <span className="w-4 h-4 bg-orange-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                  BB
                </span>
              )}
              <span className={i === activePlayerIndex ? 'text-yellow-300 font-medium' : 'text-gray-300'}>
                {player.name}
              </span>
              <span className={player.stack === 0 ? 'text-red-400' : 'text-emerald-400 font-medium'}>
                ${player.stack.toLocaleString()}
              </span>
              {player.status === 'all-in' && (
                <span className="text-red-400 font-bold text-[10px] uppercase tracking-wide">AI</span>
              )}
              {player.status === 'folded' && (
                <span className="text-gray-500 text-[10px]">FOLD</span>
              )}
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}
