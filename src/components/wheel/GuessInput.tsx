import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GuessInputProps {
  onGuessLetter: (letter: string) => void;
  onBuyVowel: (vowel: string) => void;
  onSolvePuzzle: (solution: string) => void;
  guessedLetters: string[];
  currentPlayerScore: number;
  disabled?: boolean;
  wheelValue: number | string;
}

const CONSONANTS = 'BCDFGHJKLMNPQRSTVWXYZ'.split('');
const VOWELS = 'AEIOU'.split('');
const VOWEL_COST = 250;

export const GuessInput: React.FC<GuessInputProps> = ({
  onGuessLetter,
  onBuyVowel,
  onSolvePuzzle,
  guessedLetters,
  currentPlayerScore,
  disabled = false,
  wheelValue
}) => {
  const [selectedLetter, setSelectedLetter] = useState('');
  const [solution, setSolution] = useState('');

  const availableConsonants = CONSONANTS.filter(letter => !guessedLetters.includes(letter));
  const availableVowels = VOWELS.filter(vowel => !guessedLetters.includes(vowel));
  const canBuyVowel = currentPlayerScore >= VOWEL_COST && availableVowels.length > 0;

  const handleGuessLetter = () => {
    if (selectedLetter && availableConsonants.includes(selectedLetter)) {
      onGuessLetter(selectedLetter);
      setSelectedLetter('');
    }
  };

  const handleBuyVowel = (vowel: string) => {
    if (canBuyVowel) {
      onBuyVowel(vowel);
    }
  };

  const handleSolvePuzzle = () => {
    if (solution.trim()) {
      onSolvePuzzle(solution.trim().toUpperCase());
      setSolution('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Wheel Value Display */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-lg font-semibold text-muted-foreground">Current Wheel Value:</div>
            <div className={`text-3xl font-bold ${
              wheelValue === 'BANKRUPT' ? 'text-destructive' :
              wheelValue === 'LOSE_TURN' ? 'text-muted-foreground' :
              'text-primary'
            }`}>
              {typeof wheelValue === 'number' ? `$${wheelValue}` : wheelValue}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consonant Guessing */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Guess a Consonant</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-6 gap-2">
            {CONSONANTS.map(letter => (
              <Button
                key={letter}
                variant={selectedLetter === letter ? "default" : "outline"}
                disabled={disabled || guessedLetters.includes(letter) || typeof wheelValue !== 'number'}
                onClick={() => setSelectedLetter(letter)}
                className="h-10"
              >
                {letter}
              </Button>
            ))}
          </div>
          <Button 
            onClick={handleGuessLetter}
            disabled={disabled || !selectedLetter || typeof wheelValue !== 'number'}
            className="w-full"
          >
            Guess Letter ({typeof wheelValue === 'number' ? `$${wheelValue}` : 'No Value'})
          </Button>
        </CardContent>
      </Card>

      {/* Buy Vowel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Buy a Vowel (${VOWEL_COST})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2">
            {VOWELS.map(vowel => (
              <Button
                key={vowel}
                variant="outline"
                disabled={disabled || guessedLetters.includes(vowel) || !canBuyVowel}
                onClick={() => handleBuyVowel(vowel)}
                className="h-10"
              >
                {vowel}
              </Button>
            ))}
          </div>
          {!canBuyVowel && (
            <p className="text-sm text-muted-foreground mt-2">
              {currentPlayerScore < VOWEL_COST 
                ? `Need $${VOWEL_COST - currentPlayerScore} more to buy a vowel`
                : 'No vowels available'
              }
            </p>
          )}
        </CardContent>
      </Card>

      {/* Solve Puzzle */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Solve the Puzzle</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            value={solution}
            onChange={(e) => setSolution(e.target.value)}
            placeholder="Enter your solution..."
            disabled={disabled}
            onKeyPress={(e) => e.key === 'Enter' && handleSolvePuzzle()}
          />
          <Button 
            onClick={handleSolvePuzzle}
            disabled={disabled || !solution.trim()}
            className="w-full"
            variant="secondary"
          >
            Solve Puzzle
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};