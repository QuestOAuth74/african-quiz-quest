// Crossword-related type definitions

export interface CrosswordCell {
  letter: string;
  wordNumber?: number;
  isBlocked: boolean;
  isHighlighted: boolean;
  isStartOfWord: boolean;
  userInput: string;
  x: number;
  y: number;
}

export interface CrosswordWord {
  id: string;
  word: string;
  clue: string;
  startX: number;
  startY: number;
  direction: 'across' | 'down';
  number: number;
  length: number;
  category: string;
  isCompleted: boolean;
}

export interface CrosswordClue {
  number: number;
  clue: string;
  direction: 'across' | 'down';
  wordId: string;
  isCompleted: boolean;
}

export interface CrosswordIntersection {
  word1Id: string;
  word2Id: string;
  x: number;
  y: number;
  letter: string;
}

export interface CrosswordPuzzle {
  id: string;
  title: string;
  category: string;
  difficulty: number;
  gridSize: number;
  grid: CrosswordCell[][];
  words: CrosswordWord[];
  clues: {
    across: CrosswordClue[];
    down: CrosswordClue[];
  };
  intersections: CrosswordIntersection[];
  isCompleted: boolean;
  startTime?: Date;
  completionTime?: Date;
  usedWordIds?: string[];
}

export interface CrosswordGameState {
  puzzle: CrosswordPuzzle | null;
  selectedWord: CrosswordWord | null;
  selectedCell: { x: number; y: number } | null;
  currentDirection: 'across' | 'down';
  hintsUsed: number;
  score: number;
  timeElapsed: number;
  isCompleted: boolean;
}

export interface CrosswordWordData {
  id: string;
  word: string;
  clue: string;
  category: string;
  difficulty: number;
  length: number;
  is_active: boolean;
}