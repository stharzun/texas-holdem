import { Card, Player, Suit, Rank } from '../types';
import { evaluateBestHand, compareHands } from '../handEvaluator';
import { createDeck } from './shuffle';

// ============================================================
// Monte Carlo Win Probability Calculator
// Simulates thousands of random runouts to estimate each
// active player's probability of winning the hand.
// ============================================================

/**
 * Result map: playerId -> win probability (0-100)
 */
export type WinProbabilities = Record<string, number>;

/**
 * Build the set of cards already "in use" (hole cards + community cards)
 * so we can exclude them from the random deck.
 */
function cardKey(card: Card): string {
  return `${card.rank}-${card.suit}`;
}

/**
 * Run Monte Carlo simulation to estimate win probabilities.
 *
 * @param players       All players in the game
 * @param communityCards Cards already on the board (0-5)
 * @param numSimulations Number of random runouts to simulate (default 2000)
 * @returns Map of playerId -> win percentage (0-100)
 */
export function calculateWinProbabilities(
  players: Player[],
  communityCards: Card[],
  numSimulations = 2000
): WinProbabilities {
  // Only consider active (non-folded, non-sitting-out) players with hole cards
  const activePlayers = players.filter(
    p => p.status !== 'folded' && p.status !== 'sitting-out' && p.holeCards.length === 2
  );

  // Edge case: 0 or 1 active player
  if (activePlayers.length === 0) {
    return {};
  }
  if (activePlayers.length === 1) {
    return { [activePlayers[0].id]: 100 };
  }

  // Build set of known cards to exclude from the random deck
  const usedKeys = new Set<string>();
  for (const p of activePlayers) {
    for (const c of p.holeCards) {
      usedKeys.add(cardKey(c));
    }
  }
  for (const c of communityCards) {
    usedKeys.add(cardKey(c));
  }

  // Build the remaining deck (cards not yet dealt)
  const fullDeck = createDeck();
  const remainingDeck = fullDeck.filter(c => !usedKeys.has(cardKey(c)));

  // How many more community cards do we need to complete the board?
  const cardsNeeded = 5 - communityCards.length;

  // Win / tie counters
  const wins: Record<string, number> = {};
  const ties: Record<string, number> = {};
  for (const p of activePlayers) {
    wins[p.id] = 0;
    ties[p.id] = 0;
  }

  // Run simulations
  for (let sim = 0; sim < numSimulations; sim++) {
    // Shuffle remaining deck (Fisher-Yates)
    const deck = [...remainingDeck];
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    // Complete the board with random cards
    const board = [...communityCards, ...deck.slice(0, cardsNeeded)];

    // Evaluate each active player's best hand
    const handResults = activePlayers.map(p => evaluateBestHand(p.holeCards, board));

    // Find the best hand value
    let bestResult = handResults[0];
    for (let i = 1; i < handResults.length; i++) {
      if (compareHands(handResults[i], bestResult) > 0) {
        bestResult = handResults[i];
      }
    }

    // Find all players who share the best hand (split pot)
    const winnerIndices: number[] = [];
    for (let i = 0; i < handResults.length; i++) {
      if (compareHands(handResults[i], bestResult) === 0) {
        winnerIndices.push(i);
      }
    }

    if (winnerIndices.length === 1) {
      // Outright winner
      wins[activePlayers[winnerIndices[0]].id]++;
    } else {
      // Split pot — credit as tie
      for (const idx of winnerIndices) {
        ties[activePlayers[idx].id]++;
      }
    }
  }

  // Convert to percentages
  // Ties count as half a win for display purposes (equity share)
  const result: WinProbabilities = {};
  for (const p of activePlayers) {
    const equity = (wins[p.id] + ties[p.id] * 0.5) / numSimulations;
    result[p.id] = Math.round(equity * 1000) / 10; // one decimal place
  }

  return result;
}
