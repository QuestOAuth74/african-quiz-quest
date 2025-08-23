import { useState, useCallback, useEffect } from 'react';
import { OwareGameState, OwareBoard, OwarePit } from '@/types/oware';
import { useGameAudio } from './useGameAudio';

type OwareRules = 'anan-anan' | 'abapa';

// Initialize an empty Oware board with 4 stones in each pit
const createInitialBoard = (): OwareBoard => {
  const playerOnePits: OwarePit[] = [];
  const playerTwoPits: OwarePit[] = [];
  
  for (let i = 0; i < 6; i++) {
    playerOnePits.push({ stones: 4, index: i });
    playerTwoPits.push({ stones: 4, index: i });
  }
  
  return {
    playerOnePits,
    playerTwoPits,
    playerOneScore: 0,
    playerTwoScore: 0,
  };
};

interface AnimationState {
  isAnimating: boolean;
  currentStones: number;
  currentPit: { side: 1 | 2; index: number } | null;
  sowingSequence: Array<{ side: 1 | 2; index: number; isCapture?: boolean }>;
  sequenceIndex: number;
}

export const useAnimatedOwareGame = (
  gameMode: 'single-player' | 'multiplayer' = 'single-player',
  rules: OwareRules = 'anan-anan'
) => {
  const [gameState, setGameState] = useState<OwareGameState>({
    board: createInitialBoard(),
    currentPlayer: 1,
    gameStatus: 'waiting',
    winner: null,
    gameMode,
    isThinking: false,
  });

  const [selectedPit, setSelectedPit] = useState<number | null>(null);
  const [animationState, setAnimationState] = useState<AnimationState>({
    isAnimating: false,
    currentStones: 0,
    currentPit: null,
    sowingSequence: [],
    sequenceIndex: 0,
  });

  const { playCorrectAnswer, playWrongAnswer, setEffectsVolume } = useGameAudio();

  // Initialize audio volume
  useEffect(() => {
    setEffectsVolume(0.3);
  }, [setEffectsVolume]);

  // Check if game is over based on rules
  const checkGameEnd = useCallback((board: OwareBoard): { isGameEnd: boolean; winner: 1 | 2 | null } => {
    const playerOneTotalStones = board.playerOnePits.reduce((sum, pit) => sum + pit.stones, 0);
    const playerTwoTotalStones = board.playerTwoPits.reduce((sum, pit) => sum + pit.stones, 0);
    const totalStonesOnBoard = playerOneTotalStones + playerTwoTotalStones;
    
    let isGameEnd = false;
    let winner: 1 | 2 | null = null;
    
    if (rules === 'anan-anan') {
      if (totalStonesOnBoard <= 8) {
        isGameEnd = true;
      }
    } else if (rules === 'abapa') {
      if (board.playerOneScore > 24 || board.playerTwoScore > 24) {
        isGameEnd = true;
      }
    }
    
    if (playerOneTotalStones === 0 || playerTwoTotalStones === 0) {
      isGameEnd = true;
    }
    
    if (isGameEnd) {
      if (board.playerOneScore > board.playerTwoScore) winner = 1;
      else if (board.playerTwoScore > board.playerOneScore) winner = 2;
    }
    
    return { isGameEnd, winner };
  }, [rules]);

  // Generate animated sowing sequence
  const generateSowingSequence = useCallback((board: OwareBoard, player: 1 | 2, pitIndex: number) => {
    const sequence: Array<{ side: 1 | 2; index: number; isCapture?: boolean }> = [];
    const tempBoard = JSON.parse(JSON.stringify(board)) as OwareBoard;
    const isPlayerOne = player === 1;
    const sourcePits = isPlayerOne ? tempBoard.playerOnePits : tempBoard.playerTwoPits;
    
    if (sourcePits[pitIndex].stones === 0) return { sequence, finalBoard: board };
    
    let stones = sourcePits[pitIndex].stones;
    sourcePits[pitIndex].stones = 0;
    
    let currentPitIndex = pitIndex;
    let currentSide = player;
    let continueDistribution = true;
    
    while (continueDistribution) {
      while (stones > 0) {
        // Move to next pit
        if (currentSide === 1) {
          currentPitIndex++;
          if (currentPitIndex > 5) {
            currentSide = 2;
            currentPitIndex = 0;
          }
        } else {
          currentPitIndex++;
          if (currentPitIndex > 5) {
            currentSide = 1;
            currentPitIndex = 0;
          }
        }
        
        // Skip the original pit if we circle back to it
        if (currentSide === player && currentPitIndex === pitIndex && stones > 1) {
          continue;
        }
        
        // Add to sequence
        sequence.push({ side: currentSide, index: currentPitIndex });
        
        // Place stone
        const targetPits = currentSide === 1 ? tempBoard.playerOnePits : tempBoard.playerTwoPits;
        targetPits[currentPitIndex].stones++;
        stones--;
        
        // Check for captures
        if (rules === 'anan-anan' && targetPits[currentPitIndex].stones === 4) {
          sequence[sequence.length - 1].isCapture = true;
          const capturingPlayer = (stones === 0) ? player : (currentSide === 1 ? 1 : 2);
          
          if (capturingPlayer === 1) {
            tempBoard.playerOneScore += 4;
          } else {
            tempBoard.playerTwoScore += 4;
          }
          targetPits[currentPitIndex].stones = 0;
        }
      }
      
      if (rules === 'anan-anan') {
        const lastPits = currentSide === 1 ? tempBoard.playerOnePits : tempBoard.playerTwoPits;
        if (lastPits[currentPitIndex].stones > 0) {
          stones = lastPits[currentPitIndex].stones;
          lastPits[currentPitIndex].stones = 0;
        } else {
          continueDistribution = false;
        }
      } else {
        continueDistribution = false;
        
        // Abapa capture logic
        if (currentSide !== player) {
          const targetPits = currentSide === 1 ? tempBoard.playerOnePits : tempBoard.playerTwoPits;
          const lastPitStones = targetPits[currentPitIndex].stones;
          
          if (lastPitStones === 2 || lastPitStones === 3) {
            let captureIndex = currentPitIndex;
            while (captureIndex >= 0) {
              const capturedStones = targetPits[captureIndex].stones;
              if (capturedStones === 2 || capturedStones === 3) {
                if (player === 1) {
                  tempBoard.playerOneScore += capturedStones;
                } else {
                  tempBoard.playerTwoScore += capturedStones;
                }
                targetPits[captureIndex].stones = 0;
                captureIndex--;
              } else {
                break;
              }
            }
          }
        }
      }
    }
    
    // Handle end game for anan-anan
    if (rules === 'anan-anan') {
      const totalStones = tempBoard.playerOnePits.reduce((sum, pit) => sum + pit.stones, 0) + 
                         tempBoard.playerTwoPits.reduce((sum, pit) => sum + pit.stones, 0);
      
      if (totalStones <= 8) {
        if (player === 1) {
          tempBoard.playerOneScore += totalStones;
        } else {
          tempBoard.playerTwoScore += totalStones;
        }
        
        tempBoard.playerOnePits.forEach(pit => pit.stones = 0);
        tempBoard.playerTwoPits.forEach(pit => pit.stones = 0);
      }
    }
    
    return { sequence, finalBoard: tempBoard };
  }, [rules]);

  // Animate the sowing process
  const animateSowing = useCallback((sequence: Array<{ side: 1 | 2; index: number; isCapture?: boolean }>, finalBoard: OwareBoard) => {
    setAnimationState(prev => ({
      ...prev,
      isAnimating: true,
      sowingSequence: sequence,
      sequenceIndex: 0,
    }));

    let currentIndex = 0;

    const animateStep = () => {
      if (currentIndex >= sequence.length) {
        // Animation complete
        setGameState(prev => {
          const gameEnd = checkGameEnd(finalBoard);
          return {
            ...prev,
            board: finalBoard,
            currentPlayer: prev.currentPlayer === 1 ? 2 : 1,
            gameStatus: gameEnd.isGameEnd ? 'finished' : 'playing',
            winner: gameEnd.winner,
          };
        });

        setAnimationState(prev => ({
          ...prev,
          isAnimating: false,
          currentPit: null,
          sequenceIndex: 0,
        }));
        
        setSelectedPit(null);
        return;
      }

      const step = sequence[currentIndex];
      
      // Update visual state
      setAnimationState(prev => ({
        ...prev,
        currentPit: { side: step.side, index: step.index },
        sequenceIndex: currentIndex,
      }));

      // Update board state incrementally for visual feedback
      setGameState(prev => {
        const newBoard = JSON.parse(JSON.stringify(prev.board)) as OwareBoard;
        const targetPits = step.side === 1 ? newBoard.playerOnePits : newBoard.playerTwoPits;
        targetPits[step.index].stones++;

        if (step.isCapture) {
          targetPits[step.index].stones = 0;
          playCorrectAnswer(); // Sound effect for capture
        }

        return {
          ...prev,
          board: newBoard,
        };
      });

      currentIndex++;
      setTimeout(animateStep, 500); // 500ms between each stone placement
    };

    animateStep();
  }, [checkGameEnd, playCorrectAnswer]);

  // Make a move with animation
  const makeMove = useCallback((pitIndex: number) => {
    if (gameState.gameStatus !== 'playing' && gameState.gameStatus !== 'waiting') return;
    if (animationState.isAnimating) return; // Prevent moves during animation
    
    const currentPlayer = gameState.currentPlayer;
    const { sequence, finalBoard } = generateSowingSequence(gameState.board, currentPlayer, pitIndex);
    
    if (sequence.length === 0) {
      playWrongAnswer(); // Invalid move sound
      return;
    }

    animateSowing(sequence, finalBoard);
  }, [gameState, animationState.isAnimating, generateSowingSequence, animateSowing, playWrongAnswer]);

  // Simple AI for single-player mode
  const makeAIMove = useCallback(() => {
    if (gameState.gameMode !== 'single-player' || gameState.currentPlayer !== 2) return;
    if (animationState.isAnimating) return;
    
    setGameState(prev => ({ ...prev, isThinking: true }));
    
    setTimeout(() => {
      const board = gameState.board;
      let bestMove = 0;
      let bestScore = -1;
      
      for (let i = 0; i < 6; i++) {
        if (board.playerTwoPits[i].stones > 0) {
          const { finalBoard } = generateSowingSequence(board, 2, i);
          const scoreDiff = finalBoard.playerTwoScore - board.playerTwoScore;
          
          if (scoreDiff > bestScore || (scoreDiff === bestScore && board.playerTwoPits[i].stones > board.playerTwoPits[bestMove].stones)) {
            bestMove = i;
            bestScore = scoreDiff;
          }
        }
      }
      
      setGameState(prev => ({ ...prev, isThinking: false }));
      makeMove(bestMove);
    }, 1000 + Math.random() * 1000);
  }, [gameState, animationState.isAnimating, generateSowingSequence, makeMove]);

  // Start game
  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      gameStatus: 'playing',
    }));
  }, []);

  // Reset game
  const resetGame = useCallback(() => {
    setGameState({
      board: createInitialBoard(),
      currentPlayer: 1,
      gameStatus: 'waiting',
      winner: null,
      gameMode,
      isThinking: false,
    });
    setSelectedPit(null);
    setAnimationState({
      isAnimating: false,
      currentStones: 0,
      currentPit: null,
      sowingSequence: [],
      sequenceIndex: 0,
    });
  }, [gameMode]);

  // AI move effect
  useEffect(() => {
    if (gameState.gameStatus === 'playing' && 
        gameState.currentPlayer === 2 && 
        gameState.gameMode === 'single-player' &&
        !animationState.isAnimating) {
      makeAIMove();
    }
  }, [gameState.gameStatus, gameState.currentPlayer, gameState.gameMode, animationState.isAnimating, makeAIMove]);

  return {
    gameState,
    selectedPit,
    setSelectedPit,
    makeMove,
    startGame,
    resetGame,
    animationState,
  };
};