import { useState, useEffect, useCallback } from 'react';
import { GameState } from '@/types/wheel';

interface ComputerPlayerOptions {
  difficulty: 'easy' | 'medium' | 'hard';
  currentPuzzle: any;
  gameState: GameState;
  onSpin: (value: number | string) => void;
  onGuessLetter: (letter: string) => void;
  onBuyVowel: (vowel: string) => void;
  onSolvePuzzle: (solution: string) => void;
}

export const useComputerPlayer = ({
  difficulty,
  currentPuzzle,
  gameState,
  onSpin,
  onGuessLetter,
  onBuyVowel,
  onSolvePuzzle
}: ComputerPlayerOptions) => {
  const [isThinking, setIsThinking] = useState(false);

  const getThinkingTime = useCallback(() => {
    switch (difficulty) {
      case 'easy': return 1000 + Math.random() * 1000; // 1-2 seconds
      case 'medium': return 1500 + Math.random() * 1500; // 1.5-3 seconds
      case 'hard': return 500 + Math.random() * 1000; // 0.5-1.5 seconds
      default: return 1500;
    }
  }, [difficulty]);

  const getCommonLetters = useCallback(() => {
    // Most common letters in English, ordered by frequency
    return ['E', 'T', 'A', 'O', 'I', 'N', 'S', 'H', 'R', 'D', 'L', 'U'];
  }, []);

  const getUnguessedConsonants = useCallback(() => {
    const consonants = ['B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z'];
    return consonants.filter(letter => !gameState.guessedLetters.includes(letter));
  }, [gameState.guessedLetters]);

  const getUnguessedVowels = useCallback(() => {
    const vowels = ['A', 'E', 'I', 'O', 'U'];
    return vowels.filter(vowel => !gameState.guessedLetters.includes(vowel));
  }, [gameState.guessedLetters]);

  const shouldSolvePuzzle = useCallback(() => {
    if (!currentPuzzle) return false;
    
    const phrase = currentPuzzle.phrase.toUpperCase();
    const revealedCount = gameState.revealedLetters.length;
    const totalLetters = phrase.replace(/[^A-Z]/g, '').length;
    const revealedPercentage = revealedCount / totalLetters;

    switch (difficulty) {
      case 'easy': return revealedPercentage >= 0.8; // Solve when 80% revealed
      case 'medium': return revealedPercentage >= 0.6; // Solve when 60% revealed
      case 'hard': return revealedPercentage >= 0.4; // Solve when 40% revealed
      default: return false;
    }
  }, [currentPuzzle, gameState.revealedLetters, difficulty]);

  const makeComputerMove = useCallback(async () => {
    if (!currentPuzzle || gameState.currentPlayerTurn !== 2) return;

    setIsThinking(true);
    
    // Add thinking delay
    await new Promise(resolve => setTimeout(resolve, getThinkingTime()));

    // Check if computer should solve the puzzle
    if (shouldSolvePuzzle()) {
      onSolvePuzzle(currentPuzzle.phrase);
      setIsThinking(false);
      return;
    }

    // Decide what action to take based on game phase
    if (gameState.gamePhase === 'spinning') {
      // Spin the wheel
      const wheelValues = [300, 400, 500, 600, 700, 800, 900, 1000, 'BANKRUPT', 'LOSE_TURN'];
      const randomValue = wheelValues[Math.floor(Math.random() * wheelValues.length)];
      onSpin(randomValue);
    } else if (gameState.gamePhase === 'guessing') {
      const unguessedVowels = getUnguessedVowels();
      const unguessedConsonants = getUnguessedConsonants();

      // Computer strategy based on difficulty
      if (difficulty === 'hard' && unguessedVowels.length > 0 && Math.random() < 0.3) {
        // Hard difficulty: 30% chance to buy vowel
        const vowel = unguessedVowels[0]; // Pick most common unguessed vowel
        onBuyVowel(vowel);
      } else if (unguessedConsonants.length > 0) {
        // Guess consonant
        let letterToGuess;
        
        if (difficulty === 'easy') {
          // Easy: Random consonant
          letterToGuess = unguessedConsonants[Math.floor(Math.random() * unguessedConsonants.length)];
        } else {
          // Medium/Hard: Smart letter selection
          const commonLetters = getCommonLetters();
          letterToGuess = commonLetters.find(letter => unguessedConsonants.includes(letter)) || unguessedConsonants[0];
        }
        
        onGuessLetter(letterToGuess);
      }
    }

    setIsThinking(false);
  }, [currentPuzzle, gameState, difficulty, onSpin, onGuessLetter, onBuyVowel, onSolvePuzzle, shouldSolvePuzzle, getThinkingTime, getCommonLetters, getUnguessedConsonants, getUnguessedVowels]);

  // Trigger computer move when it's the computer's turn
  useEffect(() => {
    if (gameState.currentPlayerTurn === 2 && !isThinking) {
      const timer = setTimeout(makeComputerMove, 500);
      return () => clearTimeout(timer);
    }
  }, [gameState.currentPlayerTurn, gameState.gamePhase, isThinking, makeComputerMove]);

  return {
    isThinking,
    makeComputerMove
  };
};