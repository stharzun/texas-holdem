// ============================================================
// Core Types for Texas Hold'em Poker
// ============================================================

export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
  faceUp: boolean;
}

export type HandRank =
  | 'High Card'
  | 'Pair'
  | 'Two Pair'
  | 'Three of a Kind'
  | 'Straight'
  | 'Flush'
  | 'Full House'
  | 'Four of a Kind'
  | 'Straight Flush'
  | 'Royal Flush';

export interface HandResult {
  rank: HandRank;
  rankValue: number; // 1-10 for comparison
  tiebreakers: number[]; // card values for kicker comparison
  bestCards: Card[]; // the 5 best cards
  description: string;
}

export type PlayerAction = 'fold' | 'check' | 'call' | 'raise' | 'all-in';

export type PlayerStatus = 'active' | 'folded' | 'all-in' | 'sitting-out';

export interface Player {
  id: string;
  name: string;
  stack: number;
  holeCards: Card[];
  currentBet: number; // bet in current betting round
  totalBetInHand: number; // total bet across all rounds (for side pot calc)
  status: PlayerStatus;
  isDealer: boolean;
  isSmallBlind: boolean;
  isBigBlind: boolean;
  handResult?: HandResult;
  seatIndex: number; // 0-9 position around table
}

export type GamePhase = 'waiting' | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';

export interface Pot {
  amount: number;
  eligiblePlayerIds: string[]; // players who can win this pot
}

export interface GameState {
  players: Player[];
  deck: Card[];
  communityCards: Card[];
  pots: Pot[]; // main pot + side pots
  currentBet: number; // highest bet in current round
  phase: GamePhase;
  dealerIndex: number; // index in players array
  activePlayerIndex: number; // index in players array
  smallBlindAmount: number;
  bigBlindAmount: number;
  lastRaiserIndex: number; // to detect when betting round is complete
  actionsThisRound: number; // track actions to prevent infinite loops
  winners: WinnerInfo[];
  handNumber: number;
  minRaise: number; // minimum raise amount
  numActivePlayers: number; // players not folded/sitting-out
}

export interface WinnerInfo {
  playerId: string;
  playerName: string;
  amount: number;
  handDescription: string;
  potIndex: number;
}

export interface SetupConfig {
  playerNames: string[];
  startingStack: number;
  smallBlind: number;
  bigBlind: number;
}

// Action panel props
export interface ActionPanelProps {
  gameState: GameState;
  onFold: () => void;
  onCheck: () => void;
  onCall: () => void;
  onRaise: (amount: number) => void;
  onAllIn: () => void;
}

// Seat positions for up to 10 players around the table
export interface SeatPosition {
  top: string;
  left: string;
  transform?: string;
}
