import { useState, useCallback, useEffect } from 'react';
import { OwareGameState, OwareBoard, OwarePit } from '@/types/oware';
import { useGameAudio } from './useGameAudio';

// Initialize an Oware board with 4 stones in each pit (48 total stones)
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
  gameMode: 'single-player' | 'multiplayer' = 'single-player'
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

  const { playCorrectAnswer, playWrongAnswer, playPebbleDrop, setEffectsVolume } = useGameAudio();

  // Initialize audio volume
  useEffect(() => {
    setEffectsVolume(0.3);
  }, [setEffectsVolume]);

  // Check if game is over using Four-Four (Anan-Anan) rules
  const checkGameEnd = useCallback((board: OwareBoard): { isGameEnd: boolean; winner: 1 | 2 | null } => {
    const playerOneTotalStones = board.playerOnePits.reduce((sum, pit) => sum + pit.stones, 0);
    const playerTwoTotalStones = board.playerTwoPits.reduce((sum, pit) => sum + pit.stones, 0);
    const totalStonesOnBoard = playerOneTotalStones + playerTwoTotalStones;
    
    let isGameEnd = false;
    let winner: 1 | 2 | null = null;
    
    // Game ends when 8 or fewer stones remain on the board
    if (totalStonesOnBoard <= 8) {
      isGameEnd = true;
    }
    
    // Game ends if one side has no stones (cannot move)
    if (playerOneTotalStones === 0 || playerTwoTotalStones === 0) {
      isGameEnd = true;
    }
    
    if (isGameEnd) {
      // When game ends, remaining stones go to the last player who captured
      if (board.playerOneScore > board.playerTwoScore) winner = 1;
      else if (board.playerTwoScore > board.playerOneScore) winner = 2;
    }
    
    return { isGameEnd, winner };
  }, []);

  // Generate sowing sequence using Four-Four (Anan-Anan) rules - capture on 4 stones
  const generateSowingSequence = useCallback((board: OwareBoard, player: 1 | 2, pitIndex: number) => {
    const sequence: Array<{ side: 1 | 2; index: number; isCapture?: boolean; capturedStones?: number }> = [];
    const tempBoard = JSON.parse(JSON.stringify(board)) as OwareBoard;
    const sourcePits = player === 1 ? tempBoard.playerOnePits : tempBoard.playerTwoPits;
    
    // Check if pit has stones
    if (sourcePits[pitIndex].stones === 0) return { sequence, finalBoard: board, source: { side: player, index: pitIndex, removed: 0 } };
    
    let stones = sourcePits[pitIndex].stones;
    sourcePits[pitIndex].stones = 0;
    
    let currentSide = player;
    let currentPitIndex = pitIndex;
    let totalCaptured = 0;
    
    // Continue sowing until no more stones to distribute
    while (stones > 0) {
      // Move to next pit in counter-clockwise direction
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
      
      // Skip the original pit if we have 12+ stones (lap rule)
      if (currentSide === player && currentPitIndex === pitIndex && stones > 0) {
        continue;
      }
      
      // Place one stone in current pit
      const targetPits = currentSide === 1 ? tempBoard.playerOnePits : tempBoard.playerTwoPits;
      targetPits[currentPitIndex].stones++;
      stones--;
      
      // Add to animation sequence
      sequence.push({ side: currentSide, index: currentPitIndex });
      
      // Check for capture - if pit now has exactly 4 stones, capture them!
      if (targetPits[currentPitIndex].stones === 4) {
        const capturedStones = 4;
        targetPits[currentPitIndex].stones = 0;
        totalCaptured += capturedStones;
        
        // Mark this step as a capture in the sequence
        sequence[sequence.length - 1].isCapture = true;
        sequence[sequence.length - 1].capturedStones = capturedStones;
        
        // Award stones to the current player (who made the move)
        if (player === 1) {
          tempBoard.playerOneScore += capturedStones;
        } else {
          tempBoard.playerTwoScore += capturedStones;
        }
      }
    }
    
    // After sowing ends, check if we need to continue (pickup and continue sowing)
    // In Four-Four rules, if the last pit you dropped into has stones, pick them up and continue
    const lastTargetPits = currentSide === 1 ? tempBoard.playerOnePits : tempBoard.playerTwoPits;
    const lastPitStones = lastTargetPits[currentPitIndex].stones;
    
    // If last pit has stones (and we haven't captured from it), pick up and continue
    if (lastPitStones > 0 && !sequence[sequence.length - 1]?.isCapture) {
      stones = lastPitStones;
      lastTargetPits[currentPitIndex].stones = 0;
      
      // Continue sowing from this pit
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
        
        // Skip original pit
        if (currentSide === player && currentPitIndex === pitIndex && stones > 0) {
          continue;
        }
        
        const nextTargetPits = currentSide === 1 ? tempBoard.playerOnePits : tempBoard.playerTwoPits;
        nextTargetPits[currentPitIndex].stones++;
        stones--;
        
        sequence.push({ side: currentSide, index: currentPitIndex });
        
        // Check for capture again
        if (nextTargetPits[currentPitIndex].stones === 4) {
          const capturedStones = 4;
          nextTargetPits[currentPitIndex].stones = 0;
          totalCaptured += capturedStones;
          
          sequence[sequence.length - 1].isCapture = true;
          sequence[sequence.length - 1].capturedStones = capturedStones;
          
          if (player === 1) {
            tempBoard.playerOneScore += capturedStones;
          } else {
            tempBoard.playerTwoScore += capturedStones;
          }
        }
      }
    }
    
    return { sequence, finalBoard: tempBoard, source: { side: player, index: pitIndex, removed: 0 } };
  }, []);

  // Animate the sowing process with proper visual feedback
  const animateSowing = useCallback((
    sequence: Array<{ side: 1 | 2; index: number; isCapture?: boolean; capturedStones?: number }>,
    finalBoard: OwareBoard,
    source: { side: 1 | 2; index: number }
  ) => {
    // Start animation
    setAnimationState(prev => ({
      ...prev,
      isAnimating: true,
      sowingSequence: sequence,
      sequenceIndex: 0,
    }));

    let currentIndex = 0;
    const workingBoard = JSON.parse(JSON.stringify(gameState.board)) as OwareBoard;

    // Clear the source pit for visual accuracy
    if (source.side === 1) {
      workingBoard.playerOnePits[source.index].stones = 0;
    } else {
      workingBoard.playerTwoPits[source.index].stones = 0;
    }

    const animateStep = () => {
      if (currentIndex >= sequence.length) {
        // Animation complete - apply final board state
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
      
      // Update visual animation state
      setAnimationState(prev => ({
        ...prev,
        currentPit: { side: step.side, index: step.index },
        sequenceIndex: currentIndex,
      }));

      // Update working board for visual feedback (stone by stone)
      const targetPits = step.side === 1 ? workingBoard.playerOnePits : workingBoard.playerTwoPits;
      
      if (step.isCapture && step.capturedStones) {
        // Handle capture visually
        targetPits[step.index].stones = 0;
        playCorrectAnswer(); // Capture sound effect
      } else {
        // Add stone to pit
        targetPits[step.index].stones++;
        playPebbleDrop(); // Pebble drop sound for each stone placed
      }

      // Update visual board state
      setGameState(prev => ({
        ...prev,
        board: { ...workingBoard }
      }));

      currentIndex++;
      setTimeout(animateStep, 800); // Slower animation - 800ms between moves
    };

    animateStep();
  }, [gameState.board, checkGameEnd, playCorrectAnswer, playPebbleDrop]);

  // Make a move with animation
  const makeMove = useCallback((pitIndex: number) => {
    if (gameState.gameStatus !== 'playing' && gameState.gameStatus !== 'waiting') return;
    if (animationState.isAnimating) return; // Prevent moves during animation
    
    const currentPlayer = gameState.currentPlayer;
    const { sequence, finalBoard, source } = generateSowingSequence(gameState.board, currentPlayer, pitIndex);
    
    if (sequence.length === 0) {
      playWrongAnswer(); // Invalid move sound
      return;
    }

    animateSowing(sequence, finalBoard, source);
  }, [gameState, animationState.isAnimating, generateSowingSequence, animateSowing, playWrongAnswer]);

  // AI handled in effect below

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

  // AI move effect (single-player): schedule only when it's AI's turn and not already thinking/animating
  useEffect(() => {
    if (
      gameState.gameStatus === 'playing' &&
      gameState.currentPlayer === 2 &&
      gameState.gameMode === 'single-player' &&
      !animationState.isAnimating &&
      !gameState.isThinking
    ) {
      console.log('AI should move now, triggering thinking...');
      
      const timeoutId = setTimeout(() => {
        console.log('AI timeout triggered, calculating move...');
        setGameState(prev => ({ ...prev, isThinking: true }));
        
        // Add another small delay to show thinking state
        const moveTimeout = setTimeout(() => {
          const board = gameState.board;
          let bestMove = -1;
          let bestScore = -Infinity;
          
          // Find valid moves
          const validMoves = [];
          for (let i = 0; i < 6; i++) {
            if (board.playerTwoPits[i].stones > 0) {
              validMoves.push(i);
              const { finalBoard } = generateSowingSequence(board, 2, i);
              const scoreDiff = finalBoard.playerTwoScore - board.playerTwoScore;
              if (scoreDiff > bestScore) {
                bestScore = scoreDiff;
                bestMove = i;
              }
            }
          }
          
          console.log('AI valid moves:', validMoves, 'best move:', bestMove);
          
          setGameState(prev => ({ ...prev, isThinking: false }));
          
          if (bestMove >= 0) {
            console.log('AI making move:', bestMove);
            makeMove(bestMove);
          } else {
            console.log('AI has no valid moves!');
          }
        }, 500);
        
        return () => clearTimeout(moveTimeout);
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [gameState.gameStatus, gameState.currentPlayer, gameState.gameMode, animationState.isAnimating, gameState.isThinking]);

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