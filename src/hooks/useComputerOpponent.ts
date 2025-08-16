import { useState, useCallback } from 'react';
import { WheelSegment } from '@/types/wheel';

interface ComputerPlayer {
  difficulty: 'easy' | 'medium' | 'hard';
  name: string;
  strategy: ComputerStrategy;
}

interface ComputerStrategy {
  spinProbability: number;
  vowelBuyThreshold: number;
  solvePuzzleThreshold: number;
  commonLetterPriority: string[];
}

const COMPUTER_STRATEGIES = {
  easy: {
    spinProbability: 0.7,
    vowelBuyThreshold: 3000,
    solvePuzzleThreshold: 0.3,
    commonLetterPriority: ['R', 'S', 'T', 'L', 'N', 'E']
  },
  medium: {
    spinProbability: 0.8,
    vowelBuyThreshold: 2000,
    solvePuzzleThreshold: 0.5,
    commonLetterPriority: ['R', 'S', 'T', 'L', 'N', 'E', 'A', 'I', 'O']
  },
  hard: {
    spinProbability: 0.85,
    vowelBuyThreshold: 1500,
    solvePuzzleThreshold: 0.7,
    commonLetterPriority: ['R', 'S', 'T', 'L', 'N', 'E', 'A', 'I', 'O', 'U', 'C', 'M']
  }
};

const COMPUTER_NAMES = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank'];

export const useComputerOpponent = (difficulty: 'easy' | 'medium' | 'hard' = 'medium') => {
  const [computerPlayer] = useState<ComputerPlayer>(() => ({
    difficulty,
    name: COMPUTER_NAMES[Math.floor(Math.random() * COMPUTER_NAMES.length)],
    strategy: COMPUTER_STRATEGIES[difficulty]
  }));

  const getNextMove = useCallback((
    phrase: string,
    revealedLetters: string[],
    guessedLetters: string[],
    currentScore: number,
    wheelValue: number | string
  ) => {
    const { strategy } = computerPlayer;
    const unrevealedLetters = phrase.split('').filter(char => 
      char.match(/[A-Z]/) && !revealedLetters.includes(char)
    );
    
    const unguessedConsonants = 'BCDFGHJKLMNPQRSTVWXYZ'.split('').filter(letter => 
      !guessedLetters.includes(letter)
    );
    
    const unguessedVowels = 'AEIOU'.split('').filter(letter => 
      !guessedLetters.includes(letter)
    );

    // Calculate puzzle completion percentage
    const totalLetters = phrase.split('').filter(char => char.match(/[A-Z]/)).length;
    const revealedCount = revealedLetters.length;
    const completionRate = revealedCount / totalLetters;

    // Decision: Try to solve if completion rate is high enough
    if (completionRate >= strategy.solvePuzzleThreshold && Math.random() < 0.8) {
      return { type: 'solve', data: phrase };
    }

    // Decision: Buy vowel if we have enough money and vowels available
    if (unguessedVowels.length > 0 && currentScore >= 250 && currentScore >= strategy.vowelBuyThreshold) {
      const vowel = unguessedVowels.find(v => strategy.commonLetterPriority.includes(v)) || unguessedVowels[0];
      return { type: 'buy_vowel', data: vowel };
    }

    // Decision: Guess consonant
    if (unguessedConsonants.length > 0) {
      const consonant = unguessedConsonants.find(c => strategy.commonLetterPriority.includes(c)) || unguessedConsonants[0];
      return { type: 'guess_letter', data: consonant };
    }

    // Fallback: spin wheel
    return { type: 'spin', data: null };
  }, [computerPlayer]);

  const simulateComputerTurn = useCallback(() => {
    // Simulate thinking time
    return new Promise(resolve => {
      const thinkingTime = 1000 + Math.random() * 2000; // 1-3 seconds
      setTimeout(resolve, thinkingTime);
    });
  }, []);

  return {
    computerPlayer,
    getNextMove,
    simulateComputerTurn
  };
};