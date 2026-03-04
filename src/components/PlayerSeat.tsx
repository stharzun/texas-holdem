'use client';

import React from 'react';
import { Player, Card, GamePhase } from '../types';
import { suitSymbol, suitColor } from '../utils/shuffle';

interface PlayerSeatProps {
  player: Player;
  isActive: boolean;
  phase: GamePhase;
  showCards: boolean; // show hole cards (showdown)
  seatStyle: React.CSSProperties;
}

function CardDisplay({ card, hidden }: { card: Card; hidden?: boolean }) {
  if (hidden || !card.faceUp) {
    return (
      <div className="w-8 h-12 rounded bg-blue-800 border border-blue-600 flex items-center justify-center shadow-md">
        <span className="text-blue-400 text-xs">🂠</span>
      </div>
    );
  }

  const colorClass = suitColor(card.suit);
  const symbol = suitSymbol(card.suit);

  return (
    <div className="w-8 h-12 rounded bg-white border border-gray-300 flex flex-col items-center justify-between p-0.5 shadow-md">
      <span className={`text-xs font-bold leading-none ${colorClass}`}>{card.rank}</span>
      <span className={`text-sm leading-none ${colorClass}`}>{symbol}</span>
      <span className={`text-xs font-bold leading-none rotate-180 ${colorClass}`}>{card.rank}</span>
    </div>
  );
}

export default function PlayerSeat({ player, isActive, phase, showCards, seatStyle }: PlayerSeatProps) {
  const isFolded = player.status === 'folded';
  const isAllIn = player.status === 'all-in';
  const isSittingOut = player.status === 'sitting-out';

  const borderColor = isActive
    ? 'border-yellow-400 shadow-yellow-400/50 shadow-lg'
    : isFolded
    ? 'border-gray-600'
    : isAllIn
    ? 'border-red-500'
    : 'border-green-700';

  const bgColor = isActive
    ? 'bg-gray-800'
    : isFolded
    ? 'bg-gray-900/70'
    : 'bg-gray-800/90';

  const shouldShowCards = showCards || phase === 'showdown';

  return (
    <div
      className={`absolute flex flex-col items-center gap-1`}
      style={seatStyle}
    >
      {/* Player info card */}
      <div
        className={`
          relative rounded-lg border-2 px-2 py-1.5 min-w-[90px] text-center
          ${borderColor} ${bgColor}
          transition-all duration-200
          ${isSittingOut ? 'opacity-40' : ''}
        `}
      >
        {/* Active indicator */}
        {isActive && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
        )}

        {/* Dealer button */}
        {player.isDealer && (
          <div className="absolute -top-2 -left-2 w-5 h-5 bg-white text-black text-xs font-bold rounded-full flex items-center justify-center border border-gray-400 z-10">
            D
          </div>
        )}

        {/* Blind indicators */}
        {player.isSmallBlind && !player.isDealer && (
          <div className="absolute -top-2 -left-2 w-5 h-5 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center z-10">
            SB
          </div>
        )}
        {player.isBigBlind && (
          <div className="absolute -top-2 -left-2 w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center z-10">
            BB
          </div>
        )}

        {/* Player name */}
        <div className={`text-xs font-semibold truncate max-w-[80px] ${isFolded ? 'text-gray-500' : 'text-white'}`}>
          {player.name}
        </div>

        {/* Stack */}
        <div className={`text-xs font-bold ${isFolded ? 'text-gray-600' : 'text-green-400'}`}>
          ${player.stack.toLocaleString()}
        </div>

        {/* Status badges */}
        {isFolded && (
          <div className="text-xs text-red-400 font-semibold">FOLDED</div>
        )}
        {isAllIn && (
          <div className="text-xs text-red-300 font-bold animate-pulse">ALL-IN</div>
        )}

        {/* Hand result at showdown */}
        {phase === 'showdown' && player.handResult && !isFolded && (
          <div className="text-xs text-yellow-300 font-semibold mt-0.5 leading-tight">
            {player.handResult.description}
          </div>
        )}
      </div>

      {/* Hole cards */}
      {player.holeCards.length > 0 && !isSittingOut && (
        <div className="flex gap-1">
          {player.holeCards.map((card, i) => (
            <CardDisplay
              key={i}
              card={card}
              hidden={isFolded || (!shouldShowCards && !isActive)}
            />
          ))}
        </div>
      )}

      {/* Current bet chip */}
      {player.currentBet > 0 && (
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded-full bg-yellow-500 border border-yellow-300 flex items-center justify-center">
            <span className="text-black text-xs">$</span>
          </div>
          <span className="text-yellow-300 text-xs font-bold">{player.currentBet}</span>
        </div>
      )}
    </div>
  );
}
