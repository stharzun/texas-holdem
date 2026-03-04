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
      <div 
        className="flex flex-col items-center gap-4 p-6 rounded-2xl"
        style={{
          background: 'linear-gradient(145deg, rgba(17, 24, 39, 0.95) 0%, rgba(17, 24, 39, 0.8) 100%)',
          border: '1px solid rgba(75, 85, 99, 0.5)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}
      >
        {phase === 'showdown' && (
          <div className="text-yellow-400 font-bold text-xl">Hand Complete!</div>
        )}
        <button
          onClick={onNextHand}
          className="px-10 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold rounded-xl transition-all text-lg shadow-lg hover:shadow-green-500/25 hover:scale-105"
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
    <div 
      className="flex flex-col gap-4 p-5 rounded-2xl min-w-[340px]"
      style={{
        background: 'linear-gradient(145deg, rgba(17, 24, 39, 0.95) 0%, rgba(17, 24, 39, 0.8) 100%)',
        border: '1px solid rgba(75, 85, 99, 0.5)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}
    >
      {/* Active Player Info */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          <span className="text-white font-semibold">{activePlayer.name}'s turn</span>
        </div>
        <div className="text-emerald-400 font-medium">
          ${activePlayer.stack.toLocaleString()}
        </div>
      </div>

      {/* Bet Info */}
      {gameState.currentBet > 0 && (
        <div className="flex gap-6 text-sm">
          <span className="text-gray-400">
            Current bet: <span className="text-white font-medium">${gameState.currentBet.toLocaleString()}</span>
          </span>
          {actions.callAmount > 0 && (
            <span className="text-gray-400">
              To call: <span className="text-yellow-400 font-medium">${actions.callAmount.toLocaleString()}</span>
            </span>
          )}
        </div>
      )}

      {/* Raise Input Panel */}
      {showRaiseInput && actions.canRaise && (
        <div 
          className="flex flex-col gap-3 p-4 rounded-xl"
          style={{
            background: 'rgba(31, 41, 55, 0.8)',
            border: '1px solid rgba(75, 85, 99, 0.5)',
          }}
        >
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Min: <span className="text-gray-300">${actions.minRaiseAmount.toLocaleString()}</span></span>
            <span>Max: <span className="text-gray-300">${actions.maxRaiseAmount.toLocaleString()}</span></span>
          </div>
          <input
            type="range"
            min={actions.minRaiseAmount}
            max={actions.maxRaiseAmount}
            value={raiseAmount || actions.minRaiseAmount}
            onChange={e => setRaiseAmount(e.target.value)}
            className="w-full accent-yellow-400 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex gap-3 items-center">
            <input
              type="number"
              value={raiseAmount}
              onChange={e => setRaiseAmount(e.target.value)}
              min={actions.minRaiseAmount}
              max={actions.maxRaiseAmount}
              className="flex-1 bg-gray-800 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:outline-none focus:border-yellow-400 transition-colors"
              placeholder={String(actions.minRaiseAmount)}
            />
            <span className="text-gray-400 text-sm">total</span>
          </div>
          {/* Quick bet buttons */}
          <div className="flex gap-2 flex-wrap">
            {[
              { label: 'Min', value: actions.minRaiseAmount },
              { label: '½ Pot', value: Math.min(Math.floor(totalPot / 2) + gameState.currentBet, actions.maxRaiseAmount) },
              { label: 'Pot', value: Math.min(potSizedRaise, actions.maxRaiseAmount) },
              { label: '2x Pot', value: Math.min(potSizedRaise * 2, actions.maxRaiseAmount) },
            ].map(({ label, value }) => (
              <button
                key={label}
                onClick={() => setRaiseAmount(String(value))}
                className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded-lg border border-gray-600 transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex gap-3 pt-1">
            <button
              onClick={handleRaise}
              disabled={
                !raiseAmount ||
                parseInt(raiseAmount) < actions.minRaiseAmount ||
                parseInt(raiseAmount) > actions.maxRaiseAmount
              }
              className="flex-1 py-2.5 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 text-white font-bold rounded-lg transition-all text-sm shadow-lg"
            >
              Raise to ${parseInt(raiseAmount || String(actions.minRaiseAmount)).toLocaleString()}
            </button>
            <button
              onClick={() => setShowRaiseInput(false)}
              className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors text-sm"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-5 gap-2">
        {/* Fold */}
        <button
          onClick={onFold}
          className="py-3 bg-gradient-to-b from-red-800 to-red-900 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-xl transition-all text-sm shadow-lg hover:shadow-red-900/50 active:scale-95"
        >
          Fold
        </button>

        {/* Check */}
        <button
          onClick={onCheck}
          disabled={!actions.canCheck}
          className="py-3 bg-gradient-to-b from-blue-700 to-blue-800 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-600 text-white font-bold rounded-xl transition-all text-sm shadow-lg disabled:shadow-none active:scale-95"
        >
          Check
        </button>

        {/* Call */}
        <button
          onClick={onCall}
          disabled={!actions.canCall}
          className="py-3 bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-600 text-white font-bold rounded-xl transition-all text-sm shadow-lg disabled:shadow-none active:scale-95"
        >
          <span className="block text-xs opacity-80">Call</span>
          <span className="block">${actions.callAmount.toLocaleString()}</span>
        </button>

        {/* Raise */}
        <button
          onClick={handleRaiseClick}
          disabled={!actions.canRaise}
          className={`py-3 font-bold rounded-xl transition-all text-sm shadow-lg active:scale-95
            ${showRaiseInput
              ? 'bg-gradient-to-b from-yellow-600 to-yellow-700 text-white shadow-yellow-900/50'
              : 'bg-gradient-to-b from-yellow-700 to-yellow-800 hover:from-yellow-600 hover:to-yellow-700 disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-600 text-white'
            }`}
        >
          Raise
        </button>

        {/* All-In */}
        <button
          onClick={onAllIn}
          disabled={!actions.canAllIn}
          className="py-3 bg-gradient-to-b from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-600 text-white font-bold rounded-xl transition-all text-sm shadow-lg disabled:shadow-none active:scale-95"
        >
          <span className="block text-xs opacity-80">All-In</span>
          <span className="block text-xs font-normal">${activePlayer.stack.toLocaleString()}</span>
        </button>
      </div>
    </div>
  );
}
