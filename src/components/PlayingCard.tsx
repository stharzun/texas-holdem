'use client';

import React from 'react';
import { Card } from '../types';
import { suitSymbol, suitColor } from '../utils/shuffle';

interface PlayingCardProps {
  card: Card;
  hidden?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// Get the numeric value for positioning suits
const getRankValue = (rank: string): number => {
  if (rank === 'A') return 1;
  if (rank === 'J') return 11;
  if (rank === 'Q') return 12;
  if (rank === 'K') return 13;
  return parseInt(rank, 10);
};

// Real card face component with proper suit patterns
function CardFace({ card, size = 'md' }: { card: Card; size?: 'sm' | 'md' | 'lg' }) {
  const colorClass = suitColor(card.suit);
  const symbol = suitSymbol(card.suit);
  const rank = card.rank;
  const rankValue = getRankValue(rank);

  // Size configurations
  const sizes = {
    sm: { width: '40px', height: '56px', fontSize: '8px', suitSize: '10px', cornerSize: '10px' },
    md: { width: '56px', height: '78px', fontSize: '10px', suitSize: '14px', cornerSize: '12px' },
    lg: { width: '72px', height: '100px', fontSize: '12px', suitSize: '18px', cornerSize: '14px' },
  };

  const s = sizes[size];

  // Generate suit pattern based on rank
  const renderSuitPattern = () => {
    // Face cards (J, Q, K) - show large single suit with rank
    if (rankValue > 10) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <span className={`${colorClass} font-bold`} style={{ fontSize: s.suitSize }}>{rank}</span>
          <span className={`${colorClass}`} style={{ fontSize: `calc(${s.suitSize} * 1.5)` }}>{symbol}</span>
        </div>
      );
    }

    // Ace - large single suit
    if (rank === 'A') {
      return (
        <div className="flex items-center justify-center h-full">
          <span className={`${colorClass}`} style={{ fontSize: `calc(${s.suitSize} * 2)` }}>{symbol}</span>
        </div>
      );
    }

    // Number cards - arrange suits in proper pattern
    const suits: React.ReactElement[] = [];
    
    // Position configurations for different counts
    const positions: Record<number, Array<{ top: string; left: string; rotate?: boolean }>> = {
      2: [
        { top: '25%', left: '50%' },
        { top: '75%', left: '50%', rotate: true },
      ],
      3: [
        { top: '20%', left: '50%' },
        { top: '50%', left: '50%' },
        { top: '80%', left: '50%', rotate: true },
      ],
      4: [
        { top: '25%', left: '30%' },
        { top: '25%', left: '70%' },
        { top: '75%', left: '30%', rotate: true },
        { top: '75%', left: '70%', rotate: true },
      ],
      5: [
        { top: '20%', left: '30%' },
        { top: '20%', left: '70%' },
        { top: '50%', left: '50%' },
        { top: '80%', left: '30%', rotate: true },
        { top: '80%', left: '70%', rotate: true },
      ],
      6: [
        { top: '20%', left: '30%' },
        { top: '20%', left: '70%' },
        { top: '50%', left: '30%' },
        { top: '50%', left: '70%' },
        { top: '80%', left: '30%', rotate: true },
        { top: '80%', left: '70%', rotate: true },
      ],
      7: [
        { top: '15%', left: '30%' },
        { top: '15%', left: '70%' },
        { top: '35%', left: '50%' },
        { top: '50%', left: '30%' },
        { top: '50%', left: '70%' },
        { top: '85%', left: '30%', rotate: true },
        { top: '85%', left: '70%', rotate: true },
      ],
      8: [
        { top: '15%', left: '30%' },
        { top: '15%', left: '70%' },
        { top: '38%', left: '30%' },
        { top: '38%', left: '70%' },
        { top: '62%', left: '30%', rotate: true },
        { top: '62%', left: '70%', rotate: true },
        { top: '85%', left: '30%', rotate: true },
        { top: '85%', left: '70%', rotate: true },
      ],
      9: [
        { top: '15%', left: '30%' },
        { top: '15%', left: '70%' },
        { top: '35%', left: '30%' },
        { top: '35%', left: '70%' },
        { top: '50%', left: '50%' },
        { top: '65%', left: '30%', rotate: true },
        { top: '65%', left: '70%', rotate: true },
        { top: '85%', left: '30%', rotate: true },
        { top: '85%', left: '70%', rotate: true },
      ],
      10: [
        { top: '12%', left: '30%' },
        { top: '12%', left: '70%' },
        { top: '32%', left: '30%' },
        { top: '32%', left: '70%' },
        { top: '45%', left: '50%' },
        { top: '58%', left: '30%', rotate: true },
        { top: '58%', left: '70%', rotate: true },
        { top: '78%', left: '30%', rotate: true },
        { top: '78%', left: '70%', rotate: true },
        { top: '50%', left: '50%', rotate: true },
      ],
    };

    const pos = positions[rankValue] || [];
    
    return pos.map((p, i) => (
      <span
        key={i}
        className={`absolute ${colorClass}`}
        style={{
          top: p.top,
          left: p.left,
          transform: `translate(-50%, -50%) ${p.rotate ? 'rotate(180deg)' : ''}`,
          fontSize: s.suitSize,
        }}
      >
        {symbol}
      </span>
    ));
  };

  return (
    <div 
      className="relative bg-white rounded-md overflow-hidden select-none"
      style={{
        width: s.width,
        height: s.height,
        boxShadow: '0 2px 8px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.8)',
        border: '1px solid #d1d5db',
      }}
    >
      {/* Top left corner */}
      <div className={`absolute top-1 left-1 flex flex-col items-center leading-none ${colorClass}`}>
        <span style={{ fontSize: s.cornerSize, fontWeight: 'bold' }}>{rank}</span>
        <span style={{ fontSize: s.suitSize }}>{symbol}</span>
      </div>

      {/* Bottom right corner (rotated) */}
      <div 
        className={`absolute bottom-1 right-1 flex flex-col items-center leading-none ${colorClass}`}
        style={{ transform: 'rotate(180deg)' }}
      >
        <span style={{ fontSize: s.cornerSize, fontWeight: 'bold' }}>{rank}</span>
        <span style={{ fontSize: s.suitSize }}>{symbol}</span>
      </div>

      {/* Center suit pattern */}
      <div className="absolute inset-0 px-4 py-5">
        {renderSuitPattern()}
      </div>
    </div>
  );
}

// Card back component
function CardBack({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: { width: '40px', height: '56px' },
    md: { width: '56px', height: '78px' },
    lg: { width: '72px', height: '100px' },
  };

  const s = sizes[size];

  return (
    <div 
      className="rounded-md overflow-hidden"
      style={{
        width: s.width,
        height: s.height,
        background: 'linear-gradient(145deg, #1e3a5f 0%, #1a365d 50%, #172554 100%)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
        border: '1px solid #3b82f6',
      }}
    >
      {/* Pattern */}
      <div 
        className="w-full h-full p-1"
        style={{
          backgroundImage: `
            repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.03) 4px, rgba(255,255,255,0.03) 8px),
            repeating-linear-gradient(-45deg, transparent, transparent 4px, rgba(255,255,255,0.03) 4px, rgba(255,255,255,0.03) 8px)
          `,
        }}
      >
        <div 
          className="w-full h-full rounded border-2 border-blue-400/30 flex items-center justify-center"
        >
          <div 
            className="w-8 h-8 rounded-full border-2 border-blue-400/50 flex items-center justify-center"
            style={{ width: size === 'sm' ? '20px' : size === 'lg' ? '32px' : '24px', height: size === 'sm' ? '20px' : size === 'lg' ? '32px' : '24px' }}
          >
            <span className="text-blue-400/60 text-lg">♠</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PlayingCard({ card, hidden = false, size = 'md' }: PlayingCardProps) {
  if (hidden || !card.faceUp) {
    return <CardBack size={size} />;
  }

  return <CardFace card={card} size={size} />;
}
