export interface WheelPuzzle {
  id: string;
  category: string;
  phrase: string;
  difficulty: number;
  hint?: string;
  is_active: boolean;
}

export interface WheelGameSession {
  id: string;
  player1_id: string;
  player2_id: string;
  current_player: number;
  player1_score: number;
  player2_score: number;
  player1_round_score: number;
  player2_round_score: number;
  current_puzzle_id?: string;
  game_state: any;
  status: string;
  rounds_won_player1: number;
  rounds_won_player2: number;
  created_at: string;
  updated_at: string;
}

export interface WheelGameMove {
  id: string;
  session_id: string;
  player_id: string;
  move_type: 'spin' | 'guess_letter' | 'buy_vowel' | 'solve_puzzle';
  move_data: any;
  points_earned: number;
  created_at: string;
}

export interface WheelSegment {
  value: number | 'BANKRUPT' | 'LOSE_TURN';
  color: string;
}

export interface GameState {
  currentPuzzle?: WheelPuzzle;
  revealedLetters: string[];
  guessedLetters: string[];
  wheelValue: number | string;
  isSpinning: boolean;
  currentPlayerTurn: number;
  gamePhase: 'spinning' | 'guessing' | 'solving' | 'round_end' | 'game_end';
}