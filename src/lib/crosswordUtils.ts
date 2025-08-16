import { CrosswordPuzzle, CrosswordWordData, CrosswordWord } from '@/types/crossword';
import { CrosswordGenerator } from '@/lib/crosswordGenerator';

interface SpatialValidationError {
  type: 'boundary' | 'consecutiveness' | 'intersection' | 'letter_mismatch';
  wordId: string;
  message: string;
  position?: { x: number; y: number };
}

interface ValidationReport {
  isValid: boolean;
  errors: SpatialValidationError[];
  warnings: string[];
}

export const crosswordUtils = {
  // Test the crossword generation with sample data
  testGeneration: (words: CrosswordWordData[]): CrosswordPuzzle | null => {
    if (words.length < 5) {
      console.warn('Need at least 5 words for crossword generation');
      return null;
    }

    const generator = new CrosswordGenerator(15);
    const puzzle = generator.generatePuzzle(
      words,
      10, // Default word count
      'Test African History Crossword',
      'Mixed',
      3
    );

    // Validate the generated puzzle
    if (puzzle) {
      const validation = crosswordUtils.validateSpatialLogic(puzzle);
      if (!validation.isValid) {
        console.warn('Generated puzzle has spatial validation errors:', validation.errors);
      }
    }

    return puzzle;
  },

  // Comprehensive spatial logic validation
  validateSpatialLogic: (puzzle: CrosswordPuzzle): ValidationReport => {
    const errors: SpatialValidationError[] = [];
    const warnings: string[] = [];

    // 1. Validate each word's spatial properties
    for (const word of puzzle.words) {
      // Check boundary constraints
      if (word.direction === 'across') {
        if (word.startX + word.length > puzzle.gridSize) {
          errors.push({
            type: 'boundary',
            wordId: word.id,
            message: `Horizontal word "${word.word}" exceeds grid boundary`,
            position: { x: word.startX, y: word.startY }
          });
        }
      } else {
        if (word.startY + word.length > puzzle.gridSize) {
          errors.push({
            type: 'boundary',
            wordId: word.id,
            message: `Vertical word "${word.word}" exceeds grid boundary`,
            position: { x: word.startX, y: word.startY }
          });
        }
      }

      // Check consecutiveness (verify word occupies continuous cells)
      const wordCells = crosswordUtils.getWordCells(word);
      for (let i = 0; i < wordCells.length; i++) {
        const cell = puzzle.grid[wordCells[i].y]?.[wordCells[i].x];
        if (!cell || cell.isBlocked) {
          errors.push({
            type: 'consecutiveness',
            wordId: word.id,
            message: `Word "${word.word}" has gap or blocked cell at position ${i}`,
            position: wordCells[i]
          });
        }
      }
    }

    // 2. Validate intersections
    for (const intersection of puzzle.intersections) {
      const word1 = puzzle.words.find(w => w.id === intersection.word1Id);
      const word2 = puzzle.words.find(w => w.id === intersection.word2Id);
      
      if (!word1 || !word2) continue;

      // Check if intersection point is valid for both words
      const word1Cells = crosswordUtils.getWordCells(word1);
      const word2Cells = crosswordUtils.getWordCells(word2);
      
      const word1HasCell = word1Cells.some(cell => cell.x === intersection.x && cell.y === intersection.y);
      const word2HasCell = word2Cells.some(cell => cell.x === intersection.x && cell.y === intersection.y);

      if (!word1HasCell || !word2HasCell) {
        errors.push({
          type: 'intersection',
          wordId: intersection.word1Id,
          message: `Invalid intersection between "${word1.word}" and "${word2.word}"`,
          position: { x: intersection.x, y: intersection.y }
        });
      }

      // Check letter matching at intersection
      const cell = puzzle.grid[intersection.y]?.[intersection.x];
      if (cell && cell.letter !== intersection.letter) {
        errors.push({
          type: 'letter_mismatch',
          wordId: intersection.word1Id,
          message: `Letter mismatch at intersection: expected "${intersection.letter}", got "${cell.letter}"`,
          position: { x: intersection.x, y: intersection.y }
        });
      }
    }

    // 3. Check for isolated words (no intersections)
    for (const word of puzzle.words) {
      const hasIntersection = puzzle.intersections.some(
        int => int.word1Id === word.id || int.word2Id === word.id
      );
      if (!hasIntersection && puzzle.words.length > 1) {
        warnings.push(`Word "${word.word}" has no intersections with other words`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  },

  // Get all cells occupied by a word
  getWordCells: (word: CrosswordWord): { x: number; y: number }[] => {
    const cells: { x: number; y: number }[] = [];
    for (let i = 0; i < word.length; i++) {
      if (word.direction === 'across') {
        cells.push({ x: word.startX + i, y: word.startY });
      } else {
        cells.push({ x: word.startX, y: word.startY + i });
      }
    }
    return cells;
  },

  // Validate that a crossword puzzle is properly formed
  validatePuzzle: (puzzle: CrosswordPuzzle): boolean => {
    if (!puzzle.grid || !puzzle.words || !puzzle.clues) {
      return false;
    }

    // Check that all words have corresponding clues
    const wordIds = puzzle.words.map(w => w.id);
    const clueIds = [
      ...puzzle.clues.across.map(c => c.wordId),
      ...puzzle.clues.down.map(c => c.wordId)
    ];

    return wordIds.every(id => clueIds.includes(id));
  },

  // Get puzzle statistics
  getPuzzleStats: (puzzle: CrosswordPuzzle) => {
    const totalWords = puzzle.words.length;
    const completedWords = puzzle.words.filter(w => w.isCompleted).length;
    const totalCells = puzzle.words.reduce((sum, word) => sum + word.length, 0);
    const completedCells = puzzle.grid.flat().filter(cell => 
      !cell.isBlocked && cell.userInput === cell.letter
    ).length;

    return {
      totalWords,
      completedWords,
      totalCells,
      completedCells,
      completionPercentage: Math.round((completedWords / totalWords) * 100)
    };
  },

  // Format time for display
  formatTime: (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
};