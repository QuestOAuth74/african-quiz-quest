import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WheelPuzzle } from '@/types/wheel';

interface PuzzleBoardProps {
  puzzle: WheelPuzzle;
  revealedLetters: string[];
  className?: string;
}

export const PuzzleBoard: React.FC<PuzzleBoardProps> = ({
  puzzle,
  revealedLetters,
  className = ''
}) => {
  const renderPhrase = () => {
    return puzzle.phrase.split('').map((char, index) => {
      const isLetter = /[A-Z]/.test(char);
      const isRevealed = revealedLetters.includes(char.toUpperCase());
      const showChar = !isLetter || isRevealed;

      return (
        <div
          key={index}
          className={`
            inline-flex items-center justify-center font-bold text-lg
            ${isLetter 
              ? 'w-10 h-12 m-1 border-2 border-primary bg-background' 
              : 'w-4 h-12 m-1'
            }
            ${isLetter && showChar ? 'text-foreground' : 'text-transparent'}
          `}
        >
          {showChar ? char : ''}
        </div>
      );
    });
  };

  return (
    <Card className={`${className}`}>
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-bold text-primary">
          {puzzle.category.toUpperCase()}
        </CardTitle>
        {puzzle.hint && (
          <p className="text-muted-foreground italic">
            Hint: {puzzle.hint}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap justify-center items-center min-h-[100px] p-4 bg-muted/20 rounded-lg">
          {renderPhrase()}
        </div>
      </CardContent>
    </Card>
  );
};