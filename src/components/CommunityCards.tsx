'use client';

import React from 'react';
import { Card, GamePhase } from '../types';
import { suitSymbol, suitColor } from '../utils/shuffle';

interface CommunityCardsProps {
  cards: Card[];
  phase: GamePhase;
}

function CommunityCard({ card, index }: { card: Card; index: number }) {
  const colorClass = suitColor(card.suit);
  const symbol = suitSymbol(card.suit);

  return (
    <div
      className="w-12 h-18 rounded-lg bg-white border-2 border-gray-200 flex flex-col items-center justify-between p-1 shadow-lg"
      style={{
        height: '72px',
        animationDelay: `${index * 100}ms`,
      }}
    >
      <div className={`text-sm font-bold leading-none ${colorClass}`}>{card.rank}</div>
      <div className={`text-2xl leading-none ${colorClass}`}>{symbol}</div>
      <div className={`text-sm font-bold leading-none rotate-180 ${colorClass}`}>{card.rank}</div>
    </div>
  );
}

function EmptyCard() {
  return (
    <div
      className="w-12 rounded-lg border-2 border-dashed border-green-700/50 bg-green-900/20"
      style={{ height: '72px' }}
    />
  );
}

export default function CommunityCards({ cards, phase }: CommunityCardsProps) {
  const phaseLabel: Record<GamePhase, string> = {
    waiting: '',
    preflop: 'Pre-Flop',
    flop: 'Flop',
    turn: 'Turn',
    river: 'River',
    showdown: 'Showdown',
  };

  // Show placeholders for cards not yet dealt
  const totalSlots = 5;
  const slots = Array.from({ length: totalSlots }, (_, i) => cards[i] ?? null);

  return (
    <div className="flex flex-col items-center gap-2">
      {phase !== 'waiting' && (
        <div className="text-green-300 text-xs font-semibold uppercase tracking-widest">
          {phaseLabel[phase]}
        </div>
      )}
      <div className="flex gap-2 items-center">
        {slots.map((card, i) => (
          card ? (
            <CommunityCard key={i} card={card} index={i} />
          ) : (
            <EmptyCard key={i} />
          )
        ))}
      </div>
    </div>
  );
}
