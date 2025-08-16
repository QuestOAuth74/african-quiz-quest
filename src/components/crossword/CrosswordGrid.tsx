import { useState, useEffect, useRef } from 'react';
import { CrosswordPuzzle, CrosswordWord, CrosswordCell, CrosswordIntersection } from '@/types/crossword';

interface CrosswordGridProps {
  puzzle: CrosswordPuzzle;
  selectedWord: CrosswordWord | null;
  onCellClick: (x: number, y: number) => void;
  onWordComplete: (wordId: string) => void;
  className?: string;
}

export function CrosswordGrid({ 
  puzzle, 
  selectedWord, 
  onCellClick, 
  onWordComplete,
  className = '' 
}: CrosswordGridProps) {
  const [grid, setGrid] = useState<CrosswordCell[][]>(puzzle.grid);
  const [intersectionMap, setIntersectionMap] = useState<Map<string, CrosswordIntersection[]>>(new Map());
  const inputRefs = useRef<(HTMLInputElement | null)[][]>([]);

  useEffect(() => {
    setGrid(puzzle.grid);
    // Initialize refs array properly
    inputRefs.current = Array(puzzle.gridSize).fill(null).map(() => 
      Array(puzzle.gridSize).fill(null)
    );
    // Build intersection mapping
    buildIntersectionMap();
  }, [puzzle]);

  const buildIntersectionMap = () => {
    const map = new Map<string, CrosswordIntersection[]>();
    
    // Initialize map for each word
    puzzle.words.forEach(word => {
      map.set(word.id, []);
    });

    // Find all intersections between words
    for (let i = 0; i < puzzle.words.length; i++) {
      for (let j = i + 1; j < puzzle.words.length; j++) {
        const word1 = puzzle.words[i];
        const word2 = puzzle.words[j];
        const intersection = findWordIntersection(word1, word2);
        
        if (intersection) {
          map.get(word1.id)?.push(intersection);
          map.get(word2.id)?.push(intersection);
        }
      }
    }
    
    setIntersectionMap(map);
  };

  const handleCellChange = (x: number, y: number, value: string) => {
    // Allow only letters A-Z or empty string
    const upperValue = value.toUpperCase();
    if (value && !/^[A-Z]$/.test(upperValue)) {
      return; // Only allow single letters A-Z
    }

    const newGrid = [...grid];
    newGrid[y][x] = { ...newGrid[y][x], userInput: upperValue };
    setGrid(newGrid);

    // Check if any words are complete after this change
    checkAllAffectedWords(x, y, newGrid);

    // Auto-advance to next cell
    if (upperValue && selectedWord) {
      advanceToNextCell(x, y, selectedWord);
    }
  };

  // Removed validateCellInput - we now allow free typing and validate only at word completion

  const checkAllAffectedWords = (x: number, y: number, currentGrid: CrosswordCell[][]) => {
    // Find all words that contain this cell
    const affectedWords = puzzle.words.filter(word => {
      if (word.direction === 'across') {
        return y === word.startY && x >= word.startX && x < word.startX + word.length;
      } else {
        return x === word.startX && y >= word.startY && y < word.startY + word.length;
      }
    });

    // Check completion for each affected word
    affectedWords.forEach(word => {
      checkWordCompletion(word, currentGrid);
    });
  };

  const checkWordCompletion = (word: CrosswordWord, currentGrid: CrosswordCell[][]) => {
    // Check if the word is completely filled with correct letters
    const isWordComplete = isWordCompleteAndValid(word, currentGrid);
    
    // Validate all intersections for this word
    const intersectionsValid = validateWordIntersections(word, currentGrid);
    
    if (isWordComplete && intersectionsValid && !word.isCompleted) {
      onWordComplete(word.id);
    }
  };

  const isWordCompleteAndValid = (word: CrosswordWord, currentGrid: CrosswordCell[][]): boolean => {
    for (let i = 0; i < word.length; i++) {
      const cellX = word.direction === 'across' ? word.startX + i : word.startX;
      const cellY = word.direction === 'down' ? word.startY + i : word.startY;
      const cell = currentGrid[cellY][cellX];
      
      // Cell must have user input and it must match the expected letter
      if (!cell.userInput || cell.userInput !== cell.letter) {
        return false;
      }
    }
    return true;
  };

  const validateWordIntersections = (word: CrosswordWord, currentGrid: CrosswordCell[][]): boolean => {
    const wordIntersections = intersectionMap.get(word.id) || [];
    
    for (const intersection of wordIntersections) {
      const cell = currentGrid[intersection.y][intersection.x];
      
      // For word completion, intersection cell must match the expected letter
      if (!cell.userInput || cell.userInput !== intersection.letter) {
        return false;
      }
    }
    
    return true;
  };

  const findWordIntersection = (word1: CrosswordWord, word2: CrosswordWord): CrosswordIntersection | null => {
    // Words must have different directions to intersect
    if (word1.direction === word2.direction) return null;
    
    let horizontalWord: CrosswordWord;
    let verticalWord: CrosswordWord;
    
    if (word1.direction === 'across') {
      horizontalWord = word1;
      verticalWord = word2;
    } else {
      horizontalWord = word2;
      verticalWord = word1;
    }
    
    // Check if words actually intersect
    const intersectionX = verticalWord.startX;
    const intersectionY = horizontalWord.startY;
    
    // Validate intersection boundaries
    if (intersectionX >= horizontalWord.startX && 
        intersectionX < horizontalWord.startX + horizontalWord.length &&
        intersectionY >= verticalWord.startY && 
        intersectionY < verticalWord.startY + verticalWord.length) {
      
      // Get the expected letter at intersection
      const horizontalIndex = intersectionX - horizontalWord.startX;
      const verticalIndex = intersectionY - verticalWord.startY;
      const horizontalLetter = horizontalWord.word[horizontalIndex];
      const verticalLetter = verticalWord.word[verticalIndex];
      
      // Letters must match for valid intersection
      if (horizontalLetter === verticalLetter) {
        return {
          word1Id: word1.id,
          word2Id: word2.id,
          x: intersectionX,
          y: intersectionY,
          letter: horizontalLetter
        };
      }
    }
    
    return null;
  };

  const isWordValid = (word: CrosswordWord, currentGrid: CrosswordCell[][]): boolean => {
    // Check if a word is valid (all filled cells match the expected letters)
    for (let i = 0; i < word.length; i++) {
      const cellX = word.direction === 'across' ? word.startX + i : word.startX;
      const cellY = word.direction === 'down' ? word.startY + i : word.startY;
      const cell = currentGrid[cellY][cellX];
      
      // If cell has user input, it must match the expected letter
      if (cell.userInput && cell.userInput !== cell.letter) {
        return false;
      }
    }
    return true;
  };

  const advanceToNextCell = (currentX: number, currentY: number, word: CrosswordWord) => {
    let nextX = currentX;
    let nextY = currentY;

    if (word.direction === 'across') {
      nextX = currentX + 1;
      if (nextX >= word.startX + word.length) return; // End of word
    } else {
      nextY = currentY + 1;
      if (nextY >= word.startY + word.length) return; // End of word
    }

    // Focus next cell
    const nextInput = inputRefs.current[nextY][nextX];
    if (nextInput) {
      nextInput.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, x: number, y: number) => {
    if (e.key === 'Backspace' && !grid[y][x].userInput && selectedWord) {
      // Move to previous cell on backspace if current cell is empty
      let prevX = x;
      let prevY = y;

      if (selectedWord.direction === 'across') {
        prevX = x - 1;
        if (prevX < selectedWord.startX) return;
      } else {
        prevY = y - 1;
        if (prevY < selectedWord.startY) return;
      }

      const prevInput = inputRefs.current[prevY][prevX];
      if (prevInput) {
        prevInput.focus();
        // Clear the previous cell
        handleCellChange(prevX, prevY, '');
      }
    }
  };

  const isCellInSelectedWord = (x: number, y: number): boolean => {
    if (!selectedWord) return false;
    
    if (selectedWord.direction === 'across') {
      return y === selectedWord.startY && 
             x >= selectedWord.startX && 
             x < selectedWord.startX + selectedWord.length;
    } else {
      return x === selectedWord.startX && 
             y >= selectedWord.startY && 
             y < selectedWord.startY + selectedWord.length;
    }
  };

  const getCellClasses = (cell: CrosswordCell, x: number, y: number): string => {
    const baseClasses = "w-8 h-8 text-center text-sm font-bold border border-theme-brown/30";
    
    if (cell.isBlocked) {
      return `${baseClasses} bg-theme-brown-dark cursor-not-allowed`;
    }

    const isSelected = isCellInSelectedWord(x, y);
    const isHighlighted = isSelected ? "bg-theme-yellow/20 border-theme-yellow" : "bg-background";
    
    // Enhanced validation feedback - show correct/incorrect after typing
    let validationClass = "text-foreground";
    if (cell.userInput) {
      if (cell.userInput === cell.letter) {
        validationClass = "text-green-600 bg-green-50"; // Correct letter
      } else {
        validationClass = "text-red-600 bg-red-50"; // Incorrect letter
      }
    }
    
    return `${baseClasses} ${isHighlighted} ${validationClass} cursor-pointer hover:bg-theme-yellow/10 transition-colors`;
  };

  return (
    <div className={`crossword-grid ${className}`}>
      <div 
        className="inline-grid gap-px bg-theme-brown/20 p-2 rounded-lg"
        style={{ 
          gridTemplateColumns: `repeat(${puzzle.gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${puzzle.gridSize}, 1fr)`
        }}
      >
        {grid.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              className="relative"
              onClick={() => !cell.isBlocked && onCellClick(x, y)}
            >
              {/* Word number */}
              {cell.wordNumber && (
                <div className="absolute top-0 left-0 text-xs text-theme-yellow font-bold z-10 leading-none">
                  {cell.wordNumber}
                </div>
              )}
              
              {/* Input cell */}
              {!cell.isBlocked ? (
                <input
                  ref={el => { 
                    if (!inputRefs.current[y]) inputRefs.current[y] = [];
                    inputRefs.current[y][x] = el;
                  }}
                  type="text"
                  maxLength={1}
                  value={cell.userInput || ''}
                  onChange={(e) => handleCellChange(x, y, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, x, y)}
                  className={getCellClasses(cell, x, y)}
                  disabled={puzzle.isCompleted}
                  autoComplete="off"
                />
              ) : (
                <div className={getCellClasses(cell, x, y)} />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}