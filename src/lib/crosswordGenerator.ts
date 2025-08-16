import { CrosswordPuzzle, CrosswordWord, CrosswordCell, CrosswordClue, CrosswordWordData } from '@/types/crossword';

interface PlacedWord {
  word: string;
  clue: string;
  startX: number;
  startY: number;
  direction: 'across' | 'down';
  category: string;
}

interface Intersection {
  word1Index: number;
  word2Index: number;
  char: string;
  word1Position: number;
  word2Position: number;
}

export class CrosswordGenerator {
  private gridSize: number;
  private grid: string[][];
  private placedWords: PlacedWord[] = [];
  private wordNumber = 1;

  constructor(gridSize: number = 15) {
    this.gridSize = gridSize;
    this.grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(''));
  }

  public generatePuzzle(words: CrosswordWordData[], maxWords: number, title: string, category: string, difficulty: number): CrosswordPuzzle | null {
    if (words.length === 0) return null;

    // Reset state
    this.grid = Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(''));
    this.placedWords = [];
    this.wordNumber = 1;

    // Sort words by length (longest first for better placement)
    const sortedWords = [...words].sort((a, b) => b.word.length - a.word.length);

    // Place first word in the center
    const firstWord = sortedWords[0];
    const startX = Math.floor((this.gridSize - firstWord.word.length) / 2);
    const startY = Math.floor(this.gridSize / 2);
    
    if (!this.placeWord(firstWord.word, firstWord.clue, startX, startY, 'across', firstWord.category)) {
      return null;
    }

    // Try to place remaining words up to maxWords limit
    for (let i = 1; i < Math.min(sortedWords.length, maxWords); i++) {
      const wordData = sortedWords[i];
      this.findAndPlaceWord(wordData.word, wordData.clue, wordData.category);
    }

    // Convert to CrosswordPuzzle format
    return this.createPuzzleFromGrid(title, category, difficulty);
  }

  private placeWord(word: string, clue: string, startX: number, startY: number, direction: 'across' | 'down', category: string): boolean {
    const upperWord = word.toUpperCase();
    
    // Check if word fits in grid
    if (direction === 'across' && startX + upperWord.length > this.gridSize) return false;
    if (direction === 'down' && startY + upperWord.length > this.gridSize) return false;

    // Check for conflicts
    for (let i = 0; i < upperWord.length; i++) {
      const x = direction === 'across' ? startX + i : startX;
      const y = direction === 'down' ? startY + i : startY;
      
      if (this.grid[y][x] !== '' && this.grid[y][x] !== upperWord[i]) {
        return false;
      }
    }

    // Place the word
    for (let i = 0; i < upperWord.length; i++) {
      const x = direction === 'across' ? startX + i : startX;
      const y = direction === 'down' ? startY + i : startY;
      this.grid[y][x] = upperWord[i];
    }

    this.placedWords.push({
      word: upperWord,
      clue,
      startX,
      startY,
      direction,
      category
    });

    return true;
  }

  private findAndPlaceWord(word: string, clue: string, category: string): boolean {
    const upperWord = word.toUpperCase();
    
    // Try to find intersections with existing words
    for (const placedWord of this.placedWords) {
      const intersections = this.findIntersections(upperWord, placedWord.word);
      
      for (const intersection of intersections) {
        const newDirection = placedWord.direction === 'across' ? 'down' : 'across';
        let newStartX, newStartY;

        if (placedWord.direction === 'across') {
          // Placed word is horizontal, new word will be vertical
          newStartX = placedWord.startX + intersection.word1Position;
          newStartY = placedWord.startY - intersection.word2Position;
        } else {
          // Placed word is vertical, new word will be horizontal
          newStartX = placedWord.startX - intersection.word2Position;
          newStartY = placedWord.startY + intersection.word1Position;
        }

        // Check bounds
        if (newStartX < 0 || newStartY < 0) continue;
        if (newDirection === 'across' && newStartX + upperWord.length > this.gridSize) continue;
        if (newDirection === 'down' && newStartY + upperWord.length > this.gridSize) continue;

        // Try to place the word
        if (this.placeWord(upperWord, clue, newStartX, newStartY, newDirection, category)) {
          return true;
        }
      }
    }

    return false;
  }

  private findIntersections(word1: string, word2: string): Intersection[] {
    const intersections: Intersection[] = [];
    
    for (let i = 0; i < word1.length; i++) {
      for (let j = 0; j < word2.length; j++) {
        if (word1[i] === word2[j]) {
          intersections.push({
            word1Index: 0,
            word2Index: 1,
            char: word1[i],
            word1Position: j,
            word2Position: i
          });
        }
      }
    }
    
    return intersections;
  }

  private createPuzzleFromGrid(title: string, category: string, difficulty: number): CrosswordPuzzle {
    // Create grid with proper cell data
    const puzzleGrid: CrosswordCell[][] = Array(this.gridSize).fill(null).map((_, y) =>
      Array(this.gridSize).fill(null).map((_, x) => ({
        letter: this.grid[y][x] || '',
        wordNumber: undefined,
        isBlocked: this.grid[y][x] === '',
        isHighlighted: false,
        isStartOfWord: false,
        userInput: '',
        x,
        y
      }))
    );

    // Assign word numbers and mark start positions
    const words: CrosswordWord[] = [];
    const acrossClues: CrosswordClue[] = [];
    const downClues: CrosswordClue[] = [];
    let wordNumber = 1;

    this.placedWords.forEach((placedWord) => {
      // Mark start of word
      puzzleGrid[placedWord.startY][placedWord.startX].wordNumber = wordNumber;
      puzzleGrid[placedWord.startY][placedWord.startX].isStartOfWord = true;

      // Create word object
      const word: CrosswordWord = {
        id: `word-${wordNumber}`,
        word: placedWord.word,
        clue: placedWord.clue,
        startX: placedWord.startX,
        startY: placedWord.startY,
        direction: placedWord.direction,
        number: wordNumber,
        length: placedWord.word.length,
        category: placedWord.category,
        isCompleted: false
      };

      words.push(word);

      // Create clue object
      const clue: CrosswordClue = {
        number: wordNumber,
        clue: placedWord.clue,
        direction: placedWord.direction,
        wordId: word.id,
        isCompleted: false
      };

      if (placedWord.direction === 'across') {
        acrossClues.push(clue);
      } else {
        downClues.push(clue);
      }

      wordNumber++;
    });

    // Sort clues by number
    acrossClues.sort((a, b) => a.number - b.number);
    downClues.sort((a, b) => a.number - b.number);

    return {
      id: `puzzle-${Date.now()}`,
      title,
      category,
      difficulty,
      gridSize: this.gridSize,
      grid: puzzleGrid,
      words,
      clues: {
        across: acrossClues,
        down: downClues
      },
      isCompleted: false
    };
  }
}