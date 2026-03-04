'use client';

import React from 'react';
import { Pot, WinnerInfo } from '../types';

interface PotDisplayProps {
  pots: Pot[];
  totalPot: number;
  winners: WinnerInfo[];
}

function ChipStack({ count, size = 'md' }: { count: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-3 h-3 text-[8px]',
    md: 'w-4 h-4 text-[10px]',
    lg: 'w-5 h-5 text-xs',
  };

  const chipColors = [
    { bg: 'from-white to-gray-200', border: '#9CA3AF', text: '#1F2937' },
    { bg: 'from-red-500 to-red-700', border: '#991B1B', text: 'white' },
    { bg: 'from-blue-500 to-blue-700', border: '#1E40AF', text: 'white' },
    { bg: 'from-green-500 to-green-700', border: '#166534', text: 'white' },
    { bg: 'from-black to-gray-800', border: '#374151', text: 'white' },
    { bg: 'from-purple-500 to-purple-700', border: '#7C3AED', text: 'white' },
    { bg: 'from-yellow-500 to-yellow-600', border: '#B45309', text: 'black' },
    { bg: 'from-orange-500 to-orange-700', border: '#C2410C', text: 'white' },
    { bg: 'from-pink-500 to-pink-700', border: '#BE185D', text: 'white' },
  ];

  const displayCount = Math.min(count, 8);
  
  return (
    <div className="relative" style={{ height: `${displayCount * 3 + 12}px` }}>
      {[...Array(displayCount)].map((_, i) => {
        const color = chipColors[i % chipColors.length];
        return (
          <div
            key={i}
            className={`absolute rounded-full flex items-center justify-center font-bold ${sizeClasses[size]}`}
            style={{
              bottom: `${i * 3}px`,
              left: `${Math.sin(i * 0.5) * 2}px`,
              background: `linear-gradient(145deg, ${color.bg.includes('from-') ? '' : color.bg})`,
              backgroundImage: color.bg.includes('from-') ? undefined : undefined,
              border: `2px solid ${color.border}`,
              color: color.text,
              boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
              zIndex: displayCount - i,
            }}
          >
            <span className="opacity-80">$</span>
          </div>
        );
      })}
    </div>
  );
}

export default function PotDisplay({ pots, totalPot, winners }: PotDisplayProps) {
  const hasMultiplePots = pots.length > 1;
  const mainPot = pots[0];

  // Calculate chip stack size based on pot amount
  const getChipCount = (amount: number): number => {
    if (amount === 0) return 0;
    if (amount < 100) return 2;
    if (amount < 500) return 4;
    if (amount < 1000) return 5;
    if (amount < 5000) return 6;
    return 7;
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Main Pot Display */}
      <div 
        className="flex items-center gap-3 rounded-full px-5 py-2 border"
        style={{
          background: 'linear-gradient(145deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 100%)',
          borderColor: 'rgba(234, 179, 8, 0.4)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}
      >
        <ChipStack count={getChipCount(totalPot)} size="md" />
        <div className="flex flex-col items-start">
          <span className="text-yellow-400 text-xs uppercase tracking-wide font-medium">Total Pot</span>
          <span className="text-yellow-300 font-bold text-lg">${totalPot.toLocaleString()}</span>
        </div>
      </div>

      {/* Side Pots */}
      {hasMultiplePots && (
        <div className="flex gap-2 flex-wrap justify-center">
          {pots.map((pot, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs"
              style={{
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(75, 85, 99, 0.5)',
              }}
            >
              <ChipStack count={getChipCount(pot.amount)} size="sm" />
              <div className="flex flex-col">
                <span className="text-gray-400">{i === 0 ? 'Main' : `Side ${i}`}</span>
                <span className="text-gray-300 font-medium">${pot.amount.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Winners Display */}
      {winners.length > 0 && (
        <div className="flex flex-col items-center gap-2 mt-1">
          {winners.map((winner, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-2 rounded-xl"
              style={{
                background: 'linear-gradient(145deg, rgba(234, 179, 8, 0.2) 0%, rgba(234, 179, 8, 0.1) 100%)',
                border: '1px solid rgba(234, 179, 8, 0.5)',
                boxShadow: '0 4px 20px rgba(234, 179, 8, 0.2)',
              }}
            >
              <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-xl shadow-lg">
                🏆
              </div>
              <div className="text-center">
                <div className="text-yellow-200 font-bold">{winner.playerName}</div>
                <div className="text-yellow-400 text-sm">
                  wins <span className="font-bold">${winner.amount.toLocaleString()}</span>
                  {winner.handDescription !== 'Everyone else folded' && (
                    <span className="text-gray-400 ml-1">— {winner.handDescription}</span>
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
