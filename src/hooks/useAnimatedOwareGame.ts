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

  const { playCorrectAnswer, playWrongAnswer, setEffectsVolume } = useGameAudio();

  // Initialize audio volume
  useEffect(() => {
    setEffectsVolume(0.3);
  }, [setEffectsVolume]);

  // Check if game is over using standard Oware (Abapa) rules
  const checkGameEnd = useCallback((board: OwareBoard): { isGameEnd: boolean; winner: 1 | 2 | null } => {
    const playerOneTotalStones = board.playerOnePits.reduce((sum, pit) => sum + pit.stones, 0);
    const playerTwoTotalStones = board.playerTwoPits.reduce((sum, pit) => sum + pit.stones, 0);
    
    let isGameEnd = false;
    let winner: 1 | 2 | null = null;
    
    // Game ends when someone captures more than 24 stones (more than half of 48)
    if (board.playerOneScore > 24 || board.playerTwoScore > 24) {
      isGameEnd = true;
    }
    
    // Game ends if one side has no stones (cannot move)
    if (playerOneTotalStones === 0 || playerTwoTotalStones === 0) {
      isGameEnd = true;
    }
    
    if (isGameEnd) {
      if (board.playerOneScore > board.playerTwoScore) winner = 1;
      else if (board.playerTwoScore > board.playerOneScore) winner = 2;
    }
    
    return { isGameEnd, winner };
  }, []);

  // Generate sowing sequence using proper Oware (Abapa) rules
  const generateSowingSequence = useCallback((board: OwareBoard, player: 1 | 2, pitIndex: number) => {
    const sequence: Array<{ side: 1 | 2; index: number; isCapture?: boolean; capturedStones?: number }> = [];
    const tempBoard = JSON.parse(JSON.stringify(board)) as OwareBoard;
    const sourcePits = player === 1 ? tempBoard.playerOnePits : tempBoard.playerTwoPits;
    
    // Check if pit has stones
    if (sourcePits[pitIndex].stones === 0) return { sequence, finalBoard: board };
    
    let stones = sourcePits[pitIndex].stones;
    sourcePits[pitIndex].stones = 0;
    
    let currentSide = player;
    let currentPitIndex = pitIndex;
    
    // Sow stones counter-clockwise
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
    }
    
    // Check for captures (only from opponent's side)
    const lastSide = currentSide;
    const lastPitIndex = currentPitIndex;
    
    if (lastSide !== player) { // Last stone landed on opponent's side
      const opponentPits = lastSide === 1 ? tempBoard.playerOnePits : tempBoard.playerTwoPits;
      const lastPitStones = opponentPits[lastPitIndex].stones;
      
      // Capture if pit has exactly 2 or 3 stones
      if (lastPitStones === 2 || lastPitStones === 3) {
        let captureIndex = lastPitIndex;
        let totalCaptured = 0;
        
        // Capture backwards while pits have 2 or 3 stones
        while (captureIndex >= 0) {
          const pitStones = opponentPits[captureIndex].stones;
          if (pitStones === 2 || pitStones === 3) {
            totalCaptured += pitStones;
            opponentPits[captureIndex].stones = 0;
            
            // Mark capture in sequence
            const captureSequenceIndex = sequence.findIndex(
              step => step.side === lastSide && step.index === captureIndex
            );
            if (captureSequenceIndex !== -1) {
              sequence[captureSequenceIndex].isCapture = true;
              sequence[captureSequenceIndex].capturedStones = pitStones;
            }
            
            captureIndex--;
          } else {
            break; // Stop chain if pit doesn't have 2-3 stones
          }
        }
        
        // Add captured stones to player's score
        if (player === 1) {
          tempBoard.playerOneScore += totalCaptured;
        } else {
          tempBoard.playerTwoScore += totalCaptured;
        }
      }
    }
    
    // Check for "feed" rule - cannot capture all opponent's stones
    const opponentSide = player === 1 ? 2 : 1;
    const opponentPits = opponentSide === 1 ? tempBoard.playerOnePits : tempBoard.playerTwoPits;
    const opponentHasStones = opponentPits.some(pit => pit.stones > 0);
    
    if (!opponentHasStones) {
      // Reverse all captures and return original board
      return { sequence: [], finalBoard: board };
    }
    
    return { sequence, finalBoard: tempBoard };
  }, []);

  // Animate the sowing process with proper visual feedback
  const animateSowing = useCallback((sequence: Array<{ side: 1 | 2; index: number; isCapture?: boolean; capturedStones?: number }>, finalBoard: OwareBoard) => {
    // Start animation
    setAnimationState(prev => ({
      ...prev,
      isAnimating: true,
      sowingSequence: sequence,
      sequenceIndex: 0,
    }));

    let currentIndex = 0;
    const workingBoard = JSON.parse(JSON.stringify(gameState.board)) as OwareBoard;

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
  }, [gameState.board, checkGameEnd, playCorrectAnswer]);

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