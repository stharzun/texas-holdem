'use client';

import React from 'react';
import { Pot, WinnerInfo } from '../types';

interface PotDisplayProps {
  pots: Pot[];
  totalPot: number;
  winners: WinnerInfo[];
}

export default function PotDisplay({ pots, totalPot, winners }: PotDisplayProps) {
  const hasMultiplePots = pots.length > 1;

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Main pot display */}
      <div className="flex items-center gap-2 bg-black/40 rounded-full px-4 py-1.5 border border-yellow-600/50">
        <div className="flex gap-1">
          {[...Array(Math.min(3, Math.ceil(totalPot / 1000)))].map((_, i) => (
            <div
              key={i}
              className="w-4 h-4 rounded-full border-2 border-yellow-400 bg-yellow-600"
              style={{ marginLeft: i > 0 ? '-6px' : '0' }}
            />
          ))}
        </div>
        <span className="text-yellow-300 font-bold text-sm">
          Pot: ${totalPot.toLocaleString()}
        </span>
      </div>

      {/* Side pots */}
      {hasMultiplePots && (
        <div className="flex gap-2 flex-wrap justify-center">
          {pots.map((pot, i) => (
            <div
              key={i}
              className="text-xs bg-black/30 rounded px-2 py-0.5 text-gray-300 border border-gray-600"
            >
              {i === 0 ? 'Main' : `Side ${i}`}: ${pot.amount.toLocaleString()}
              <span className="text-gray-500 ml-1">({pot.eligiblePlayerIds.length}p)</span>
            </div>
          ))}
        </div>
      )}

      {/* Winners display */}
      {winners.length > 0 && (
        <div className="flex flex-col items-center gap-1 mt-1">
          {winners.map((winner, i) => (
            <div
              key={i}
              className="flex items-center gap-2 bg-yellow-900/50 border border-yellow-500 rounded-lg px-3 py-1"
            >
              <span className="text-yellow-300 text-lg">🏆</span>
              <div className="text-center">
                <div className="text-yellow-200 font-bold text-sm">{winner.playerName}</div>
                <div className="text-yellow-400 text-xs">
                  wins ${winner.amount.toLocaleString()}
                  {winner.handDescription !== 'Everyone else folded' && (
                    <span className="text-gray-300 ml-1">— {winner.handDescription}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
