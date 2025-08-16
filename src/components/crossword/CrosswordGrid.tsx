import { useState, useEffect, useRef } from 'react';
import { CrosswordPuzzle, CrosswordWord, CrosswordCell } from '@/types/crossword';

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
  const inputRefs = useRef<(HTMLInputElement | null)[][]>([]);

  useEffect(() => {
    setGrid(puzzle.grid);
    // Initialize refs array
    inputRefs.current = Array(puzzle.gridSize).fill(null).map(() => 
      Array(puzzle.gridSize).fill(null)
    );
  }, [puzzle]);

  const handleCellChange = (x: number, y: number, value: string) => {
    const newGrid = [...grid];
    newGrid[y][x] = { ...newGrid[y][x], userInput: value.toUpperCase() };
    setGrid(newGrid);

    // Check if word is complete
    if (selectedWord) {
      checkWordCompletion(selectedWord, newGrid);
    }

    // Auto-advance to next cell
    if (value && selectedWord) {
      advanceToNextCell(x, y, selectedWord);
    }
  };

  const checkWordCompletion = (word: CrosswordWord, currentGrid: CrosswordCell[][]) => {
    let isComplete = true;
    
    for (let i = 0; i < word.length; i++) {
      const cellX = word.direction === 'across' ? word.startX + i : word.startX;
      const cellY = word.direction === 'down' ? word.startY + i : word.startY;
      const cell = currentGrid[cellY][cellX];
      
      if (cell.userInput !== cell.letter) {
        isComplete = false;
        break;
      }
    }

    if (isComplete && !word.isCompleted) {
      onWordComplete(word.id);
    }
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
    const hasCorrectAnswer = cell.userInput === cell.letter ? "text-green-600" : "text-foreground";
    
    return `${baseClasses} ${isHighlighted} ${hasCorrectAnswer} cursor-pointer hover:bg-theme-yellow/10 transition-colors`;
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
                  ref={el => inputRefs.current[y][x] = el}
                  type="text"
                  maxLength={1}
                  value={cell.userInput}
                  onChange={(e) => handleCellChange(x, y, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, x, y)}
                  className={getCellClasses(cell, x, y)}
                  disabled={puzzle.isCompleted}
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