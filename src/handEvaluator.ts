import { Card, HandResult, HandRank } from './types';
import { rankToValue } from './utils/shuffle';

// ============================================================
// Hand Evaluator - Texas Hold'em
// Evaluates the best 5-card hand from 7 cards (2 hole + 5 community)
// ============================================================

/**
 * Get all combinations of k elements from array
 */
function combinations<T>(arr: T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (arr.length < k) return [];
  const [first, ...rest] = arr;
  const withFirst = combinations(rest, k - 1).map(combo => [first, ...combo]);
  const withoutFirst = combinations(rest, k);
  return [...withFirst, ...withoutFirst];
}

/**
 * Sort cards by rank value descending
 */
function sortByRank(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => rankToValue(b.rank) - rankToValue(a.rank));
}

/**
 * Check if cards form a flush (all same suit)
 */
function isFlush(cards: Card[]): boolean {
  return cards.every(c => c.suit === cards[0].suit);
}

/**
 * Check if cards form a straight, returns high card value or -1
 * Handles wheel (A-2-3-4-5)
 */
function straightHighCard(cards: Card[]): number {
  const sorted = sortByRank(cards);
  const values = sorted.map(c => rankToValue(c.rank));

  // Check normal straight
  let isStraight = true;
  for (let i = 0; i < values.length - 1; i++) {
    if (values[i] - values[i + 1] !== 1) {
      isStraight = false;
      break;
    }
  }
  if (isStraight) return values[0];

  // Check wheel: A-2-3-4-5 (Ace counts as 1)
  const hasAce = values.includes(14);
  if (hasAce) {
    const lowValues = values.map(v => (v === 14 ? 1 : v)).sort((a, b) => b - a);
    let isWheel = true;
    for (let i = 0; i < lowValues.length - 1; i++) {
      if (lowValues[i] - lowValues[i + 1] !== 1) {
        isWheel = false;
        break;
      }
    }
    if (isWheel) return 5; // 5-high straight
  }

  return -1;
}

/**
 * Get rank counts: { value: count }
 */
function getRankCounts(cards: Card[]): Map<number, number> {
  const counts = new Map<number, number>();
  for (const card of cards) {
    const val = rankToValue(card.rank);
    counts.set(val, (counts.get(val) ?? 0) + 1);
  }
  return counts;
}

/**
 * Evaluate a 5-card hand and return HandResult
 */
function evaluateFiveCards(cards: Card[]): HandResult {
  const sorted = sortByRank(cards);
  const values = sorted.map(c => rankToValue(c.rank));
  const counts = getRankCounts(cards);
  const flush = isFlush(cards);
  const straightHigh = straightHighCard(cards);

  // Group by count
  const groups = Array.from(counts.entries()).sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1]; // sort by count desc
    return b[0] - a[0]; // then by value desc
  });

  const countValues = groups.map(g => g[1]);

  // Royal Flush
  if (flush && straightHigh === 14) {
    return {
      rank: 'Royal Flush',
      rankValue: 10,
      tiebreakers: [14],
      bestCards: sorted,
      description: 'Royal Flush',
    };
  }

  // Straight Flush
  if (flush && straightHigh > 0) {
    return {
      rank: 'Straight Flush',
      rankValue: 9,
      tiebreakers: [straightHigh],
      bestCards: sorted,
      description: `Straight Flush, ${straightHigh === 5 ? '5' : sorted[0].rank}-high`,
    };
  }

  // Four of a Kind
  if (countValues[0] === 4) {
    const quadVal = groups[0][0];
    const kicker = groups[1][0];
    return {
      rank: 'Four of a Kind',
      rankValue: 8,
      tiebreakers: [quadVal, kicker],
      bestCards: sorted,
      description: `Four of a Kind, ${rankName(quadVal)}s`,
    };
  }

  // Full House
  if (countValues[0] === 3 && countValues[1] === 2) {
    const tripVal = groups[0][0];
    const pairVal = groups[1][0];
    return {
      rank: 'Full House',
      rankValue: 7,
      tiebreakers: [tripVal, pairVal],
      bestCards: sorted,
      description: `Full House, ${rankName(tripVal)}s full of ${rankName(pairVal)}s`,
    };
  }

  // Flush
  if (flush) {
    return {
      rank: 'Flush',
      rankValue: 6,
      tiebreakers: values,
      bestCards: sorted,
      description: `Flush, ${sorted[0].rank}-high`,
    };
  }

  // Straight
  if (straightHigh > 0) {
    // Reorder for wheel
    let bestCards = sorted;
    if (straightHigh === 5) {
      // Move ace to end for wheel display
      const ace = sorted.find(c => rankToValue(c.rank) === 14)!;
      bestCards = [...sorted.filter(c => rankToValue(c.rank) !== 14), ace];
    }
    return {
      rank: 'Straight',
      rankValue: 5,
      tiebreakers: [straightHigh],
      bestCards,
      description: `Straight, ${straightHigh === 5 ? '5' : sorted[0].rank}-high`,
    };
  }

  // Three of a Kind
  if (countValues[0] === 3) {
    const tripVal = groups[0][0];
    const kickers = groups.slice(1).map(g => g[0]);
    return {
      rank: 'Three of a Kind',
      rankValue: 4,
      tiebreakers: [tripVal, ...kickers],
      bestCards: sorted,
      description: `Three of a Kind, ${rankName(tripVal)}s`,
    };
  }

  // Two Pair
  if (countValues[0] === 2 && countValues[1] === 2) {
    const highPair = groups[0][0];
    const lowPair = groups[1][0];
    const kicker = groups[2][0];
    return {
      rank: 'Two Pair',
      rankValue: 3,
      tiebreakers: [highPair, lowPair, kicker],
      bestCards: sorted,
      description: `Two Pair, ${rankName(highPair)}s and ${rankName(lowPair)}s`,
    };
  }

  // Pair
  if (countValues[0] === 2) {
    const pairVal = groups[0][0];
    const kickers = groups.slice(1).map(g => g[0]);
    return {
      rank: 'Pair',
      rankValue: 2,
      tiebreakers: [pairVal, ...kickers],
      bestCards: sorted,
      description: `Pair of ${rankName(pairVal)}s`,
    };
  }

  // High Card
  return {
    rank: 'High Card',
    rankValue: 1,
    tiebreakers: values,
    bestCards: sorted,
    description: `High Card, ${sorted[0].rank}`,
  };
}

/**
 * Convert numeric rank value to display name
 */
function rankName(value: number): string {
  const names: Record<number, string> = {
    14: 'Ace', 13: 'King', 12: 'Queen', 11: 'Jack',
    10: '10', 9: '9', 8: '8', 7: '7', 6: '6',
    5: '5', 4: '4', 3: '3', 2: '2',
  };
  return names[value] ?? String(value);
}

/**
 * Compare two hand results. Returns positive if a > b, negative if a < b, 0 if tie
 */
export function compareHands(a: HandResult, b: HandResult): number {
  if (a.rankValue !== b.rankValue) {
    return a.rankValue - b.rankValue;
  }
  // Same rank - compare tiebreakers
  for (let i = 0; i < Math.max(a.tiebreakers.length, b.tiebreakers.length); i++) {
    const aVal = a.tiebreakers[i] ?? 0;
    const bVal = b.tiebreakers[i] ?? 0;
    if (aVal !== bVal) return aVal - bVal;
  }
  return 0; // Tie
}

/**
 * Find the best 5-card hand from 7 cards (or fewer)
 */
export function evaluateBestHand(holeCards: Card[], communityCards: Card[]): HandResult {
  const allCards = [...holeCards, ...communityCards];

  if (allCards.length < 5) {
    // Not enough cards yet - return placeholder
    return {
      rank: 'High Card',
      rankValue: 0,
      tiebreakers: [],
      bestCards: allCards,
      description: 'Incomplete hand',
    };
  }

  const fiveCardCombos = combinations(allCards, 5);
  let best: HandResult | null = null;

  for (const combo of fiveCardCombos) {
    const result = evaluateFiveCards(combo);
    if (!best || compareHands(result, best) > 0) {
      best = result;
    }
  }

  return best!;
}

/**
 * Determine winners from a list of players with their hands
 * Returns array of winner indices (multiple for split pot)
 */
export function determineWinners(
  playerIndices: number[],
  handResults: HandResult[]
): number[] {
  if (playerIndices.length === 0) return [];
  if (playerIndices.length === 1) return [playerIndices[0]];

  let bestResult = handResults[playerIndices[0]];
  let winners = [playerIndices[0]];

  for (let i = 1; i < playerIndices.length; i++) {
    const idx = playerIndices[i];
    const comparison = compareHands(handResults[idx], bestResult);
    if (comparison > 0) {
      bestResult = handResults[idx];
      winners = [idx];
    } else if (comparison === 0) {
      winners.push(idx);
    }
  }

  return winners;
}
