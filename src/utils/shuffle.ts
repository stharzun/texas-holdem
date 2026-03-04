import { Card, Rank, Suit } from '../types';

/**
 * Creates a standard 52-card deck
 */
export function createDeck(): Card[] {
  const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const deck: Card[] = [];

  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank, faceUp: false });
    }
  }

  return deck;
}

/**
 * Fisher-Yates shuffle algorithm
 * Mutates the array in place and returns it
 */
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Creates and shuffles a fresh deck
 */
export function createShuffledDeck(): Card[] {
  return shuffleDeck(createDeck());
}

/**
 * Deals a card from the top of the deck (mutates deck array)
 */
export function dealCard(deck: Card[], faceUp = true): { card: Card; remainingDeck: Card[] } {
  if (deck.length === 0) {
    throw new Error('Deck is empty');
  }
  const [card, ...remainingDeck] = deck;
  return { card: { ...card, faceUp }, remainingDeck };
}

/**
 * Burns a card (discards without using)
 */
export function burnCard(deck: Card[]): Card[] {
  if (deck.length === 0) {
    throw new Error('Deck is empty');
  }
  const [, ...remainingDeck] = deck;
  return remainingDeck;
}

/**
 * Get numeric value of a rank for comparison
 */
export function rankToValue(rank: Rank): number {
  const values: Record<Rank, number> = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
    '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14,
  };
  return values[rank];
}

/**
 * Get display symbol for suit
 */
export function suitSymbol(suit: Suit): string {
  const symbols: Record<Suit, string> = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠',
  };
  return symbols[suit];
}

/**
 * Get color class for suit
 */
export function suitColor(suit: Suit): string {
  return suit === 'hearts' || suit === 'diamonds' ? 'text-red-500' : 'text-gray-900';
}
