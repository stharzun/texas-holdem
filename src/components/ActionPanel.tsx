'use client';

import React, { useState } from 'react';
import { GameState } from '../types';
import { getAvailableActions, getTotalPot } from '../gameEngine';

interface ActionPanelProps {
  gameState: GameState;
  onFold: () => void;
  onCheck: () => void;
  onCall: () => void;
  onRaise: (amount: number) => void;
  onAllIn: () => void;
  onNextHand: () => void;
}

export default function ActionPanel({
  gameState,
  onFold,
  onCheck,
  onCall,
  onRaise,
  onAllIn,
  onNextHand,
}: ActionPanelProps) {
  const [raiseAmount, setRaiseAmount] = useState<string>('');
  const [showRaiseInput, setShowRaiseInput] = useState(false);

  const { phase, activePlayerIndex, players } = gameState;
  const actions = getAvailableActions(gameState);
  const totalPot = getTotalPot(gameState);

  const activePlayer = activePlayerIndex >= 0 ? players[activePlayerIndex] : null;

  // Showdown / waiting state
  if (phase === 'showdown' || phase === 'waiting') {
    return (
      <div className="flex flex-col items-center gap-3 p-4 bg-gray-900/90 rounded-xl border border-gray-700">
        {phase === 'showdown' && (
          <div className="text-yellow-300 font-bold text-lg">Hand Complete!</div>
        )}
        <button
          onClick={onNextHand}
          className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors text-lg shadow-lg"
        >
          {phase === 'waiting' ? '🃏 Start Game' : '🔄 Next Hand'}
        </button>
      </div>
    );
  }

  if (!activePlayer) return null;

  const handleRaise = () => {
    const amount = parseInt(raiseAmount, 10);
    if (!isNaN(amount) && amount >= actions.minRaiseAmount && amount <= actions.maxRaiseAmount) {
      onRaise(amount);
      setRaiseAmount('');
      setShowRaiseInput(false);
    }
  };

  const handleRaiseClick = () => {
    setShowRaiseInput(!showRaiseInput);
    setRaiseAmount(String(actions.minRaiseAmount));
  };

  const potSizedRaise = Math.min(
    Math.floor(totalPot + actions.callAmount),
    actions.maxRaiseAmount
  );

  return (
    <div className="flex flex-col gap-3 p-4 bg-gray-900/90 rounded-xl border border-gray-700 min-w-[320px]">
      {/* Active player info */}
      <div className="flex items-center justify-between">
        <div className="text-white font-bold text-sm">
          <span className="text-yellow-400">▶</span> {activePlayer.name}&apos;s turn
        </div>
        <div className="text-green-400 text-sm font-semibold">
          Stack: ${activePlayer.stack.toLocaleString()}
        </div>
      </div>

      {/* Bet info */}
      {gameState.currentBet > 0 && (
        <div className="text-xs text-gray-400 flex gap-4">
          <span>Current bet: <span className="text-white">${gameState.currentBet}</span></span>
          {actions.callAmount > 0 && (
            <span>To call: <span className="text-yellow-300">${actions.callAmount}</span></span>
          )}
        </div>
      )}

      {/* Raise input */}
      {showRaiseInput && actions.canRaise && (
        <div className="flex flex-col gap-2 p-3 bg-gray-800 rounded-lg border border-gray-600">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Min: ${actions.minRaiseAmount}</span>
            <span>Max: ${actions.maxRaiseAmount}</span>
          </div>
          <input
            type="range"
            min={actions.minRaiseAmount}
            max={actions.maxRaiseAmount}
            value={raiseAmount || actions.minRaiseAmount}
            onChange={e => setRaiseAmount(e.target.value)}
            className="w-full accent-yellow-400"
          />
          <div className="flex gap-2 items-center">
            <input
              type="number"
              value={raiseAmount}
              onChange={e => setRaiseAmount(e.target.value)}
              min={actions.minRaiseAmount}
              max={actions.maxRaiseAmount}
              className="flex-1 bg-gray-700 text-white rounded px-2 py-1 text-sm border border-gray-500 focus:outline-none focus:border-yellow-400"
              placeholder={`${actions.minRaiseAmount}`}
            />
            <span className="text-gray-400 text-xs">total</span>
          </div>
          {/* Quick bet buttons */}
          <div className="flex gap-1 flex-wrap">
            {[
              { label: 'Min', value: actions.minRaiseAmount },
              { label: '½ Pot', value: Math.min(Math.floor(totalPot / 2) + gameState.currentBet, actions.maxRaiseAmount) },
              { label: 'Pot', value: Math.min(potSizedRaise, actions.maxRaiseAmount) },
              { label: '2x Pot', value: Math.min(potSizedRaise * 2, actions.maxRaiseAmount) },
            ].map(({ label, value }) => (
              <button
                key={label}
                onClick={() => setRaiseAmount(String(value))}
                className="px-2 py-0.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded border border-gray-500 transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRaise}
              disabled={
                !raiseAmount ||
                parseInt(raiseAmount) < actions.minRaiseAmount ||
                parseInt(raiseAmount) > actions.maxRaiseAmount
              }
              className="flex-1 py-2 bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold rounded-lg transition-colors text-sm"
            >
              Raise to ${raiseAmount || actions.minRaiseAmount}
            </button>
            <button
              onClick={() => setShowRaiseInput(false)}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors text-sm"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 flex-wrap">
        {/* Fold */}
        <button
          onClick={onFold}
          className="flex-1 min-w-[70px] py-2.5 bg-red-800 hover:bg-red-700 text-white font-bold rounded-lg transition-colors text-sm shadow"
        >
          Fold
        </button>

        {/* Check */}
        <button
          onClick={onCheck}
          disabled={!actions.canCheck}
          className="flex-1 min-w-[70px] py-2.5 bg-blue-700 hover:bg-blue-600 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors text-sm shadow"
        >
          Check
        </button>

        {/* Call */}
        <button
          onClick={onCall}
          disabled={!actions.canCall}
          className="flex-1 min-w-[70px] py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors text-sm shadow"
        >
          Call ${actions.callAmount}
        </button>

        {/* Raise */}
        <button
          onClick={handleRaiseClick}
          disabled={!actions.canRaise}
          className={`flex-1 min-w-[70px] py-2.5 font-bold rounded-lg transition-colors text-sm shadow
            ${showRaiseInput
              ? 'bg-yellow-600 text-white'
              : 'bg-yellow-700 hover:bg-yellow-600 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white'
            }`}
        >
          Raise
        </button>

        {/* All-In */}
        <button
          onClick={onAllIn}
          disabled={!actions.canAllIn}
          className="flex-1 min-w-[70px] py-2.5 bg-red-600 hover:bg-red-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors text-sm shadow"
        >
          All-In
          <span className="block text-xs font-normal opacity-80">${activePlayer.stack}</span>
        </button>
      </div>
    </div>
  );
}
