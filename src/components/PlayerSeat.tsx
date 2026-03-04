'use client';

import React from 'react';
import { Player, GamePhase } from '../types';
import PlayingCard from './PlayingCard';

interface PlayerSeatProps {
  player: Player;
  isActive: boolean;
  phase: GamePhase;
  showCards: boolean;
  seatStyle: React.CSSProperties;
  winProbability?: number;
}

export default function PlayerSeat({ player, isActive, phase, showCards, seatStyle, winProbability }: PlayerSeatProps) {
  const isFolded = player.status === 'folded';
  const isAllIn = player.status === 'all-in';
  const isSittingOut = player.status === 'sitting-out';
  const shouldShowCards = showCards || phase === 'showdown';

  return (
    <div
      className="absolute flex flex-col items-center gap-2"
      style={seatStyle}
    >
      {/* Player Card with Glassmorphism */}
      <div
        className={`
          relative rounded-xl px-3 py-2 min-w-[100px] text-center
          backdrop-blur-md border
          transition-all duration-300
          ${isActive 
            ? 'bg-gray-900/90 border-yellow-500/60 shadow-lg shadow-yellow-500/20 scale-105' 
            : isFolded
            ? 'bg-gray-900/60 border-gray-700/50 opacity-60'
            : isAllIn
            ? 'bg-red-950/70 border-red-500/50'
            : 'bg-gray-900/80 border-gray-700/60 hover:border-gray-600/60'}
          ${isSittingOut ? 'opacity-30' : ''}
        `}
        style={{
          boxShadow: isActive 
            ? '0 0 20px rgba(234, 179, 8, 0.3), 0 4px 20px rgba(0,0,0,0.5)' 
            : '0 4px 20px rgba(0,0,0,0.4)',
        }}
      >
        {/* Active Indicator Ring */}
        {isActive && (
          <div className="absolute -inset-0.5 rounded-xl border-2 border-yellow-400/50 animate-pulse" />
        )}

        {/* Position Badges */}
        <div className="absolute -top-3 -left-3 flex gap-1">
          {player.isDealer && (
            <div className="w-6 h-6 bg-white text-black text-xs font-bold rounded-full flex items-center justify-center border-2 border-gray-400 shadow-lg z-10">
              D
            </div>
          )}
          {player.isSmallBlind && !player.isDealer && (
            <div className="w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-blue-400 shadow-lg z-10">
              SB
            </div>
          )}
          {player.isBigBlind && (
            <div className="w-6 h-6 bg-orange-600 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-orange-400 shadow-lg z-10">
              BB
            </div>
          )}
        </div>

        {/* Player Name */}
        <div className={`text-sm font-semibold truncate max-w-[90px] ${isFolded ? 'text-gray-500' : 'text-white'}`}>
          {player.name}
        </div>

        {/* Stack Amount */}
        <div className={`text-sm font-bold ${isFolded ? 'text-gray-600' : 'text-emerald-400'}`}>
          ${player.stack.toLocaleString()}
        </div>

        {/* Status Badge */}
        {isFolded && (
          <div className="mt-1 px-2 py-0.5 bg-red-950/80 rounded text-xs text-red-400 font-semibold border border-red-800/50">
            FOLDED
          </div>
        )}
        {isAllIn && (
          <div className="mt-1 px-2 py-0.5 bg-red-900/80 rounded text-xs text-red-300 font-bold border border-red-700/50 animate-pulse">
            ALL-IN
          </div>
        )}

        {/* Win Probability Bar */}
        {winProbability !== undefined && phase !== 'showdown' && !isFolded && (
          <div className="mt-2 w-full">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-gray-400 uppercase tracking-wide">Win</span>
              <span
                className={`text-xs font-bold ${
                  winProbability >= 60
                    ? 'text-emerald-400'
                    : winProbability >= 35
                    ? 'text-amber-400'
                    : 'text-red-400'
                }`}
              >
                {winProbability.toFixed(0)}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  winProbability >= 60
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-400'
                    : winProbability >= 35
                    ? 'bg-gradient-to-r from-amber-600 to-amber-400'
                    : 'bg-gradient-to-r from-red-600 to-red-400'
                }`}
                style={{ width: `${Math.min(100, winProbability)}%` }}
              />
            </div>
          </div>
        )}

        {/* Hand Result at Showdown */}
        {phase === 'showdown' && player.handResult && !isFolded && (
          <div className="mt-1 px-2 py-0.5 bg-yellow-900/60 rounded text-xs text-yellow-300 font-medium border border-yellow-700/50 leading-tight">
            {player.handResult.description}
          </div>
        )}
      </div>

      {/* Hole Cards */}
      {player.holeCards.length > 0 && !isSittingOut && (
        <div className="flex gap-1">
          {player.holeCards.map((card, i) => (
            <PlayingCard
              key={i}
              card={card}
              hidden={isFolded || (!shouldShowCards && !isActive)}
              size="sm"
            />
          ))}
        </div>
      )}

      {/* Current Bet Chip */}
      {player.currentBet > 0 && (
        <div className="flex items-center gap-1.5 bg-black/60 rounded-full px-2 py-1 border border-yellow-600/50">
          <div 
            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-black border"
            style={{
              background: 'linear-gradient(145deg, #FFD700 0%, #FFA500 100%)',
              borderColor: '#B8860B',
              boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
            }}
          >
            $
          </div>
          <span className="text-yellow-300 text-xs font-bold">{player.currentBet.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}
