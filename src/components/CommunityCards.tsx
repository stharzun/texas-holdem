'use client';

import React from 'react';
import { Card, GamePhase } from '../types';
import PlayingCard from './PlayingCard';

interface CommunityCardsProps {
  cards: Card[];
  phase: GamePhase;
}

function EmptyCardSlot() {
  return (
    <div
      className="rounded-lg border-2 border-dashed border-green-700/40 bg-green-900/20"
      style={{
        width: '56px',
        height: '78px',
        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.2)',
      }}
    />
  );
}

export default function CommunityCards({ cards, phase }: CommunityCardsProps) {
  const phaseLabel: Record<GamePhase, string> = {
    waiting: '',
    preflop: 'Pre-Flop',
    flop: 'The Flop',
    turn: 'The Turn',
    river: 'The River',
    showdown: 'Showdown',
  };

  const totalSlots = 5;
  const slots = Array.from({ length: totalSlots }, (_, i) => cards[i] ?? null);

  return (
    <div className="flex flex-col items-center gap-3">
      {phase !== 'waiting' && (
        <div 
          className="px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-widest"
          style={{
            background: 'rgba(0,0,0,0.4)',
            color: '#86efac',
            border: '1px solid rgba(74, 222, 128, 0.3)',
            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
          }}
        >
          {phaseLabel[phase]}
        </div>
      )}
      <div className="flex gap-2 items-center">
        {slots.map((card, i) => (
          card ? (
            <PlayingCard 
              key={i} 
              card={card}
              size="md"
            />
          ) : (
            <EmptyCardSlot key={i} />
          )
        ))}
      </div>
    </div>
  );
}
