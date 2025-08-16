import { CrosswordPuzzle, CrosswordWordData } from '@/types/crossword';
import { CrosswordGenerator } from '@/lib/crosswordGenerator';

export const crosswordUtils = {
  // Test the crossword generation with sample data
  testGeneration: (words: CrosswordWordData[]): CrosswordPuzzle | null => {
    if (words.length < 5) {
      console.warn('Need at least 5 words for crossword generation');
      return null;
    }

    const generator = new CrosswordGenerator(15);
    return generator.generatePuzzle(
      words,
      'Test African History Crossword',
      'Mixed',
      3
    );
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