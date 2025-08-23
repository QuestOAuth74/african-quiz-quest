export interface SenetPiece {
  id: string;
  player: 1 | 2;
  position: number; // 0-29 for board squares, -1 for off board
  isHighlighted?: boolean;
}

export interface SenetPlayer {
  id: 1 | 2;
  name: string;
  pieces: SenetPiece[];
  isAI?: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface SenetMove {
  pieceId: string;
  fromPosition: number;
  toPosition: number;
  captured?: string; // captured piece id
  timestamp: number;
}

export interface SenetGameState {
  id: string;
  board: (SenetPiece | null)[];
  players: SenetPlayer[];
  currentPlayer: 1 | 2;
  gamePhase: 'setup' | 'throwing' | 'moving' | 'finished';
  lastRoll: number;
  availableMoves: number[];
  moveHistory: SenetMove[];
  winner?: 1 | 2;
  createdAt: Date;
  updatedAt: Date;
  isMultiplayer?: boolean;
  gameId?: string;
}

// Online multiplayer types
export interface SenetOnlineGame {
  id: string;
  type: 'single_player' | 'online_multiplayer';
  status: 'waiting' | 'active' | 'finished' | 'abandoned';
  host_user_id: string;
  guest_user_id?: string;
  game_state: SenetGameState;
  winner_user_id?: string;
  created_at: string;
  updated_at: string;
  started_at?: string;
  finished_at?: string;
}

export interface SenetOnlineMove {
  id: string;
  game_id: string;
  player_user_id: string;
  move_data: {
    type: 'throw_sticks' | 'make_move';
    roll?: number;
    fromPosition?: number;
    toPosition?: number;
    pieceId?: string;
  };
  move_number: number;
  created_at: string;
}

export interface SenetLobbyPlayer {
  user_id: string;
  display_name: string;
  last_seen: string;
  is_online: boolean;
  player_status: string;
}

export interface ThrowingSticksResult {
  sticks: boolean[]; // true for marked side up
  value: number; // movement value (1-5)
}

export interface SpecialSquare {
  position: number;
  type: 'house_of_beauty' | 'house_of_water' | 'house_of_three_truths' | 'house_of_re_atoum' | 'house_of_two_truths';
  symbol: string;
  effect: 'safe' | 'restart' | 'extra_turn' | 'must_roll_exact' | 'cannot_pass';
  description: string;
}

export const SPECIAL_SQUARES: SpecialSquare[] = [
  {
    position: 14, // 15th square
    type: 'house_of_beauty',
    symbol: '𓇳',
    effect: 'safe',
    description: 'House of Beauty - Safe haven, pieces cannot be captured here'
  },
  {
    position: 25, // 26th square
    type: 'house_of_water',
    symbol: '𓈖',
    effect: 'restart',
    description: 'House of Water - Piece returns to start or house of beauty'
  },
  {
    position: 27, // 28th square
    type: 'house_of_three_truths',
    symbol: '𓊨',
    effect: 'must_roll_exact',
    description: 'House of Three Truths - Must roll exact number to exit'
  },
  {
    position: 28, // 29th square
    type: 'house_of_re_atoum',
    symbol: '𓇯',
    effect: 'must_roll_exact',
    description: 'House of Re-Atoum - Must roll exact number to exit'
  },
  {
    position: 29, // 30th square
    type: 'house_of_two_truths',
    symbol: '𓊩',
    effect: 'must_roll_exact',
    description: 'House of Two Truths - Must roll exact number to exit'
  }
];