import { GameState, Player, Pot, WinnerInfo, SetupConfig, GamePhase } from './types';
import { createShuffledDeck, dealCard, burnCard } from './utils/shuffle';
import { evaluateBestHand, determineWinners } from './handEvaluator';

// ============================================================
// Game Engine - Texas Hold'em Core Logic
// ============================================================

/**
 * Initialize a new game with given configuration
 */
export function initializeGame(config: SetupConfig): GameState {
  const { playerNames, startingStack, smallBlind, bigBlind } = config;

  const players: Player[] = playerNames.map((name, index) => ({
    id: `player-${index}`,
    name,
    stack: startingStack,
    holeCards: [],
    currentBet: 0,
    totalBetInHand: 0,
    status: 'active',
    isDealer: index === 0,
    isSmallBlind: false,
    isBigBlind: false,
    seatIndex: index,
  }));

  return {
    players,
    deck: [],
    communityCards: [],
    pots: [{ amount: 0, eligiblePlayerIds: players.map(p => p.id) }],
    currentBet: 0,
    phase: 'waiting',
    dealerIndex: 0,
    activePlayerIndex: -1,
    smallBlindAmount: smallBlind,
    bigBlindAmount: bigBlind,
    lastRaiserIndex: -1,
    actionsThisRound: 0,
    winners: [],
    handNumber: 0,
    minRaise: bigBlind,
    numActivePlayers: players.length,
  };
}

/**
 * Start a new hand
 */
export function startNewHand(state: GameState): GameState {
  const activePlayers = state.players.filter(p => p.stack > 0);
  if (activePlayers.length < 2) {
    return state; // Not enough players
  }

  // Rotate dealer to next player with chips
  let newDealerIndex = state.dealerIndex;
  do {
    newDealerIndex = (newDealerIndex + 1) % state.players.length;
  } while (state.players[newDealerIndex].stack <= 0);

  // Reset all players
  const players: Player[] = state.players.map(p => ({
    ...p,
    holeCards: [],
    currentBet: 0,
    totalBetInHand: 0,
    status: p.stack > 0 ? 'active' : 'sitting-out',
    isDealer: false,
    isSmallBlind: false,
    isBigBlind: false,
    handResult: undefined,
  }));

  players[newDealerIndex].isDealer = true;

  // Find small blind (next active player after dealer)
  const sbIndex = nextActivePlayerIndex(players, newDealerIndex);
  // Find big blind (next active player after small blind)
  const bbIndex = nextActivePlayerIndex(players, sbIndex);

  players[sbIndex].isSmallBlind = true;
  players[bbIndex].isBigBlind = true;

  // Post blinds
  const sbAmount = Math.min(state.smallBlindAmount, players[sbIndex].stack);
  const bbAmount = Math.min(state.bigBlindAmount, players[bbIndex].stack);

  players[sbIndex].stack -= sbAmount;
  players[sbIndex].currentBet = sbAmount;
  players[sbIndex].totalBetInHand = sbAmount;
  if (players[sbIndex].stack === 0) players[sbIndex].status = 'all-in';

  players[bbIndex].stack -= bbAmount;
  players[bbIndex].currentBet = bbAmount;
  players[bbIndex].totalBetInHand = bbAmount;
  if (players[bbIndex].stack === 0) players[bbIndex].status = 'all-in';

  // Deal hole cards
  let deck = createShuffledDeck();
  const numActivePlayers = players.filter(p => p.status !== 'sitting-out').length;

  // Deal 2 cards to each active player
  for (let round = 0; round < 2; round++) {
    for (let i = 0; i < players.length; i++) {
      const playerIdx = (newDealerIndex + 1 + i) % players.length;
      if (players[playerIdx].status !== 'sitting-out') {
        const { card, remainingDeck } = dealCard(deck, true);
        players[playerIdx].holeCards.push(card);
        deck = remainingDeck;
      }
    }
  }

  // First to act preflop is player after big blind
  const firstToActIndex = nextActivePlayerIndex(players, bbIndex);

  const currentBet = bbAmount;
  const minRaise = state.bigBlindAmount * 2;

  return {
    ...state,
    players,
    deck,
    communityCards: [],
    pots: [{ amount: 0, eligiblePlayerIds: players.filter(p => p.status !== 'sitting-out').map(p => p.id) }],
    currentBet,
    phase: 'preflop',
    dealerIndex: newDealerIndex,
    activePlayerIndex: firstToActIndex,
    lastRaiserIndex: bbIndex,
    actionsThisRound: 0,
    winners: [],
    handNumber: state.handNumber + 1,
    minRaise,
    numActivePlayers,
  };
}

/**
 * Get next active player index (not folded, not sitting-out)
 */
function nextActivePlayerIndex(players: Player[], fromIndex: number): number {
  let idx = (fromIndex + 1) % players.length;
  let attempts = 0;
  while (
    (players[idx].status === 'folded' || players[idx].status === 'sitting-out') &&
    attempts < players.length
  ) {
    idx = (idx + 1) % players.length;
    attempts++;
  }
  return idx;
}

/**
 * Get next player who can still act (not folded, not all-in, not sitting-out)
 */
function nextBettingPlayerIndex(players: Player[], fromIndex: number): number {
  let idx = (fromIndex + 1) % players.length;
  let attempts = 0;
  while (
    (players[idx].status === 'folded' ||
      players[idx].status === 'all-in' ||
      players[idx].status === 'sitting-out') &&
    attempts < players.length
  ) {
    idx = (idx + 1) % players.length;
    attempts++;
  }
  return idx;
}

/**
 * Count players who can still act (not folded, not all-in, not sitting-out)
 */
function countBettingPlayers(players: Player[]): number {
  return players.filter(
    p => p.status !== 'folded' && p.status !== 'all-in' && p.status !== 'sitting-out'
  ).length;
}

/**
 * Count players still in hand (not folded, not sitting-out)
 */
function countPlayersInHand(players: Player[]): number {
  return players.filter(p => p.status !== 'folded' && p.status !== 'sitting-out').length;
}

/**
 * Check if betting round is complete
 */
function isBettingRoundComplete(state: GameState): boolean {
  const { players, currentBet, lastRaiserIndex, activePlayerIndex } = state;

  const bettingPlayers = players.filter(
    p => p.status !== 'folded' && p.status !== 'all-in' && p.status !== 'sitting-out'
  );

  if (bettingPlayers.length === 0) return true;
  if (bettingPlayers.length === 1 && countPlayersInHand(players) <= 1) return true;

  // All betting players have matched the current bet
  const allMatched = bettingPlayers.every(p => p.currentBet === currentBet);

  if (!allMatched) return false;

  // If no one has raised (lastRaiserIndex === -1 means we're in a new round)
  // and everyone has acted at least once
  if (lastRaiserIndex === -1) return true;

  // The action has come back around to the last raiser
  // i.e., the next player to act would be the last raiser
  const nextPlayer = nextBettingPlayerIndex(players, activePlayerIndex);
  return nextPlayer === lastRaiserIndex || state.actionsThisRound >= bettingPlayers.length;
}

/**
 * Calculate side pots based on all-in amounts
 */
function calculatePots(players: Player[]): Pot[] {
  const inHandPlayers = players.filter(
    p => p.status !== 'folded' && p.status !== 'sitting-out'
  );

  if (inHandPlayers.length === 0) return [{ amount: 0, eligiblePlayerIds: [] }];

  // Get unique total bet amounts (sorted ascending)
  const betLevels = [...new Set(
    players
      .filter(p => p.totalBetInHand > 0)
      .map(p => p.totalBetInHand)
  )].sort((a, b) => a - b);

  if (betLevels.length === 0) return [{ amount: 0, eligiblePlayerIds: inHandPlayers.map(p => p.id) }];

  const pots: Pot[] = [];
  let previousLevel = 0;

  for (const level of betLevels) {
    const contribution = level - previousLevel;
    let potAmount = 0;
    const eligible: string[] = [];

    for (const player of players) {
      if (player.totalBetInHand > 0 || player.status !== 'folded') {
        const playerContrib = Math.min(player.totalBetInHand, level) - previousLevel;
        if (playerContrib > 0) {
          potAmount += playerContrib;
        }
      }
    }

    // Eligible players: those who contributed to this level and are not folded
    for (const player of inHandPlayers) {
      if (player.totalBetInHand >= level) {
        eligible.push(player.id);
      }
    }

    if (potAmount > 0) {
      pots.push({ amount: potAmount, eligiblePlayerIds: eligible });
    }

    previousLevel = level;
    void contribution; // suppress unused warning
  }

  // Merge pots with same eligible players
  const merged: Pot[] = [];
  for (const pot of pots) {
    const existing = merged.find(
      m => JSON.stringify(m.eligiblePlayerIds.sort()) === JSON.stringify(pot.eligiblePlayerIds.sort())
    );
    if (existing) {
      existing.amount += pot.amount;
    } else {
      merged.push({ ...pot });
    }
  }

  return merged.length > 0 ? merged : [{ amount: 0, eligiblePlayerIds: inHandPlayers.map(p => p.id) }];
}

/**
 * Move bets to pot and reset current bets
 */
function collectBets(state: GameState): GameState {
  const totalBetted = state.players.reduce((sum, p) => sum + p.currentBet, 0);
  const players = state.players.map(p => ({ ...p, currentBet: 0 }));

  // Recalculate pots based on totalBetInHand
  const pots = calculatePots(players);

  // Add any uncollected amount to main pot
  const currentPotTotal = pots.reduce((sum, p) => sum + p.amount, 0);
  const previousPotTotal = state.pots.reduce((sum, p) => sum + p.amount, 0);

  // The pots are recalculated from scratch using totalBetInHand
  void totalBetted;
  void currentPotTotal;
  void previousPotTotal;

  return { ...state, players, pots, currentBet: 0 };
}

/**
 * Advance to next phase
 */
function advancePhase(state: GameState): GameState {
  let newState = collectBets(state);
  let deck = newState.deck;

  const playersInHand = newState.players.filter(
    p => p.status !== 'folded' && p.status !== 'sitting-out'
  );

  // If only one player remains, go to showdown immediately
  if (playersInHand.length <= 1) {
    return resolveShowdown(newState);
  }

  // Check if all remaining players are all-in (no more betting possible)
  const canBetPlayers = playersInHand.filter(p => p.status === 'active');

  const nextPhase: Record<GamePhase, GamePhase> = {
    waiting: 'preflop',
    preflop: 'flop',
    flop: 'turn',
    turn: 'river',
    river: 'showdown',
    showdown: 'waiting',
  };

  const phase = nextPhase[newState.phase];

  if (phase === 'flop') {
    // Burn 1, deal 3
    deck = burnCard(deck);
    const cards = [];
    for (let i = 0; i < 3; i++) {
      const { card, remainingDeck } = dealCard(deck, true);
      cards.push(card);
      deck = remainingDeck;
    }
    newState = {
      ...newState,
      deck,
      communityCards: cards,
      phase: 'flop',
    };
  } else if (phase === 'turn') {
    // Burn 1, deal 1
    deck = burnCard(deck);
    const { card, remainingDeck } = dealCard(deck, true);
    deck = remainingDeck;
    newState = {
      ...newState,
      deck,
      communityCards: [...newState.communityCards, card],
      phase: 'turn',
    };
  } else if (phase === 'river') {
    // Burn 1, deal 1
    deck = burnCard(deck);
    const { card, remainingDeck } = dealCard(deck, true);
    deck = remainingDeck;
    newState = {
      ...newState,
      deck,
      communityCards: [...newState.communityCards, card],
      phase: 'river',
    };
  } else if (phase === 'showdown') {
    return resolveShowdown(newState);
  }

  // If no one can bet (all all-in), run out the board automatically
  if (canBetPlayers.length <= 1) {
    return advancePhase(newState);
  }

  // Find first active player after dealer for post-flop betting
  const firstToAct = nextBettingPlayerIndex(
    newState.players,
    newState.dealerIndex
  );

  return {
    ...newState,
    activePlayerIndex: firstToAct,
    lastRaiserIndex: -1,
    actionsThisRound: 0,
    minRaise: newState.bigBlindAmount,
  };
}

/**
 * Resolve showdown - evaluate hands and distribute pots
 */
function resolveShowdown(state: GameState): GameState {
  const playersInHand = state.players.filter(
    p => p.status !== 'folded' && p.status !== 'sitting-out'
  );

  // Evaluate hands for all players still in
  const players = state.players.map(p => {
    if (p.status === 'folded' || p.status === 'sitting-out') return p;
    const handResult = evaluateBestHand(p.holeCards, state.communityCards);
    return { ...p, handResult };
  });

  // Build hand results map
  const handResults = players.map(p => p.handResult ?? evaluateBestHand([], []));

  const winners: WinnerInfo[] = [];
  const updatedPlayers = [...players];

  // Distribute each pot
  for (let potIndex = 0; potIndex < state.pots.length; potIndex++) {
    const pot = state.pots[potIndex];
    if (pot.amount === 0) continue;

    // Find eligible players who are still in hand
    const eligibleIndices = players
      .map((p, i) => ({ p, i }))
      .filter(({ p }) =>
        pot.eligiblePlayerIds.includes(p.id) &&
        p.status !== 'folded' &&
        p.status !== 'sitting-out'
      )
      .map(({ i }) => i);

    if (eligibleIndices.length === 0) continue;

    const winnerIndices = determineWinners(eligibleIndices, handResults);
    const splitAmount = Math.floor(pot.amount / winnerIndices.length);
    const remainder = pot.amount - splitAmount * winnerIndices.length;

    winnerIndices.forEach((idx, i) => {
      const winAmount = splitAmount + (i === 0 ? remainder : 0);
      updatedPlayers[idx] = {
        ...updatedPlayers[idx],
        stack: updatedPlayers[idx].stack + winAmount,
      };
      winners.push({
        playerId: updatedPlayers[idx].id,
        playerName: updatedPlayers[idx].name,
        amount: winAmount,
        handDescription: handResults[idx].description,
        potIndex,
      });
    });
  }

  // If only one player in hand (everyone else folded), they win without showdown
  if (playersInHand.length === 1) {
    const winner = playersInHand[0];
    const totalPot = state.pots.reduce((sum, p) => sum + p.amount, 0);
    const winnerIdx = updatedPlayers.findIndex(p => p.id === winner.id);
    updatedPlayers[winnerIdx] = {
      ...updatedPlayers[winnerIdx],
      stack: updatedPlayers[winnerIdx].stack + totalPot,
    };
    // Clear previous winners and set this one
    return {
      ...state,
      players: updatedPlayers,
      phase: 'showdown',
      winners: [{
        playerId: winner.id,
        playerName: winner.name,
        amount: totalPot,
        handDescription: 'Everyone else folded',
        potIndex: 0,
      }],
      activePlayerIndex: -1,
    };
  }

  return {
    ...state,
    players: updatedPlayers,
    phase: 'showdown',
    winners,
    activePlayerIndex: -1,
  };
}

// ============================================================
// Player Actions
// ============================================================

/**
 * Process fold action
 */
export function processFold(state: GameState): GameState {
  const { activePlayerIndex, players } = state;
  const updatedPlayers = [...players];
  updatedPlayers[activePlayerIndex] = {
    ...updatedPlayers[activePlayerIndex],
    status: 'folded',
  };

  const newState = { ...state, players: updatedPlayers };

  // Check if only one player remains
  const playersInHand = updatedPlayers.filter(
    p => p.status !== 'folded' && p.status !== 'sitting-out'
  );

  if (playersInHand.length === 1) {
    // Collect remaining bets and resolve
    const collected = collectBets(newState);
    return resolveShowdown(collected);
  }

  return advanceToNextPlayer(newState);
}

/**
 * Process check action
 */
export function processCheck(state: GameState): GameState {
  const newState = {
    ...state,
    actionsThisRound: state.actionsThisRound + 1,
  };

  return advanceToNextPlayer(newState);
}

/**
 * Process call action
 */
export function processCall(state: GameState): GameState {
  const { activePlayerIndex, players, currentBet } = state;
  const player = players[activePlayerIndex];
  const callAmount = Math.min(currentBet - player.currentBet, player.stack);

  const updatedPlayers = [...players];
  updatedPlayers[activePlayerIndex] = {
    ...player,
    stack: player.stack - callAmount,
    currentBet: player.currentBet + callAmount,
    totalBetInHand: player.totalBetInHand + callAmount,
    status: player.stack - callAmount === 0 ? 'all-in' : player.status,
  };

  const newState = {
    ...state,
    players: updatedPlayers,
    actionsThisRound: state.actionsThisRound + 1,
  };

  return advanceToNextPlayer(newState);
}

/**
 * Process raise action
 */
export function processRaise(state: GameState, raiseToAmount: number): GameState {
  const { activePlayerIndex, players } = state;
  const player = players[activePlayerIndex];

  // raiseToAmount is the total bet amount (not the raise increment)
  const actualRaiseTo = Math.min(raiseToAmount, player.stack + player.currentBet);
  const amountToAdd = actualRaiseTo - player.currentBet;

  const updatedPlayers = [...players];
  updatedPlayers[activePlayerIndex] = {
    ...player,
    stack: player.stack - amountToAdd,
    currentBet: actualRaiseTo,
    totalBetInHand: player.totalBetInHand + amountToAdd,
    status: player.stack - amountToAdd === 0 ? 'all-in' : player.status,
  };

  const minRaise = actualRaiseTo + (actualRaiseTo - state.currentBet);

  const newState = {
    ...state,
    players: updatedPlayers,
    currentBet: actualRaiseTo,
    lastRaiserIndex: activePlayerIndex,
    actionsThisRound: 1, // Reset action count after raise
    minRaise,
  };

  return advanceToNextPlayer(newState);
}

/**
 * Process all-in action
 */
export function processAllIn(state: GameState): GameState {
  const { activePlayerIndex, players } = state;
  const player = players[activePlayerIndex];
  const allInAmount = player.currentBet + player.stack;

  const updatedPlayers = [...players];
  updatedPlayers[activePlayerIndex] = {
    ...player,
    currentBet: allInAmount,
    totalBetInHand: player.totalBetInHand + player.stack,
    stack: 0,
    status: 'all-in',
  };

  let newCurrentBet = state.currentBet;
  let newLastRaiser = state.lastRaiserIndex;
  let newActionsThisRound = state.actionsThisRound + 1;
  let newMinRaise = state.minRaise;

  // If this all-in is a raise
  if (allInAmount > state.currentBet) {
    newCurrentBet = allInAmount;
    newLastRaiser = activePlayerIndex;
    newActionsThisRound = 1;
    newMinRaise = allInAmount + (allInAmount - state.currentBet);
  }

  const newState = {
    ...state,
    players: updatedPlayers,
    currentBet: newCurrentBet,
    lastRaiserIndex: newLastRaiser,
    actionsThisRound: newActionsThisRound,
    minRaise: newMinRaise,
  };

  return advanceToNextPlayer(newState);
}

/**
 * Advance to next player or next phase
 */
function advanceToNextPlayer(state: GameState): GameState {
  const bettingPlayers = countBettingPlayers(state.players);

  // Check if betting round is complete
  if (bettingPlayers === 0 || isBettingRoundComplete(state)) {
    return advancePhase(state);
  }

  // Find next player who can act
  const nextIdx = nextBettingPlayerIndex(state.players, state.activePlayerIndex);

  // Safety check: if we've looped back to last raiser, round is done
  if (state.lastRaiserIndex !== -1 && nextIdx === state.lastRaiserIndex) {
    // Check if all bets are matched
    const allMatched = state.players
      .filter(p => p.status !== 'folded' && p.status !== 'all-in' && p.status !== 'sitting-out')
      .every(p => p.currentBet === state.currentBet);

    if (allMatched) {
      return advancePhase(state);
    }
  }

  return { ...state, activePlayerIndex: nextIdx };
}

// ============================================================
// Action Validation
// ============================================================

export interface AvailableActions {
  canCheck: boolean;
  canCall: boolean;
  canRaise: boolean;
  canFold: boolean;
  canAllIn: boolean;
  callAmount: number;
  minRaiseAmount: number;
  maxRaiseAmount: number;
}

/**
 * Determine what actions are available for the active player
 */
export function getAvailableActions(state: GameState): AvailableActions {
  const { activePlayerIndex, players, currentBet, minRaise } = state;

  if (activePlayerIndex < 0 || activePlayerIndex >= players.length) {
    return {
      canCheck: false, canCall: false, canRaise: false,
      canFold: false, canAllIn: false,
      callAmount: 0, minRaiseAmount: 0, maxRaiseAmount: 0,
    };
  }

  const player = players[activePlayerIndex];
  const toCall = currentBet - player.currentBet;
  const canCheck = toCall === 0;
  const canCall = toCall > 0 && toCall < player.stack;
  const canRaise = player.stack > toCall && player.stack > 0;
  const canAllIn = player.stack > 0;
  const callAmount = Math.min(toCall, player.stack);
  const minRaiseAmount = Math.min(minRaise, player.stack + player.currentBet);
  const maxRaiseAmount = player.stack + player.currentBet;

  return {
    canCheck,
    canCall,
    canRaise,
    canFold: true,
    canAllIn,
    callAmount,
    minRaiseAmount,
    maxRaiseAmount,
  };
}

/**
 * Get total pot amount
 */
export function getTotalPot(state: GameState): number {
  return state.pots.reduce((sum, p) => sum + p.amount, 0) +
    state.players.reduce((sum, p) => sum + p.currentBet, 0);
}
