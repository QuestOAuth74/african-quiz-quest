export interface OwarePit {
  stones: number;
  index: number;
}

export interface OwareBoard {
  playerOnePits: OwarePit[];
  playerTwoPits: OwarePit[];
  playerOneScore: number;
  playerTwoScore: number;
}

export interface OwareGameState {
  board: OwareBoard;
  currentPlayer: 1 | 2;
  gameStatus: 'waiting' | 'playing' | 'finished';
  winner: 1 | 2 | null;
  gameMode: 'single-player' | 'multiplayer';
  isThinking?: boolean;
}

export interface OwareMove {
  player: 1 | 2;
  pitIndex: number;
  timestamp: Date;
}

export interface OwareGame {
  id: string;
  hostUserId: string;
  guestUserId?: string;
  gameState: OwareGameState;
  moves: OwareMove[];
  status: 'waiting' | 'active' | 'finished';
  createdAt: Date;
  updatedAt: Date;
  winner?: string;
}

export interface OwareAI {
  difficulty: 'easy' | 'medium' | 'hard';
  calculateMove: (board: OwareBoard) => number;
}