import { useState, useCallback, useEffect } from 'react';
import { OwareGameState, OwareBoard, OwarePit } from '@/types/oware';

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

export const useOwareGame = (gameMode: 'single-player' | 'multiplayer' = 'single-player') => {
  const [gameState, setGameState] = useState<OwareGameState>({
    board: createInitialBoard(),
    currentPlayer: 1,
    gameStatus: 'waiting',
    winner: null,
    gameMode,
    isThinking: false,
  });

  const [selectedPit, setSelectedPit] = useState<number | null>(null);

  // Check if game is over (when one side has no stones)
  const checkGameEnd = useCallback((board: OwareBoard): { isGameEnd: boolean; winner: 1 | 2 | null } => {
    const playerOneTotalStones = board.playerOnePits.reduce((sum, pit) => sum + pit.stones, 0);
    const playerTwoTotalStones = board.playerTwoPits.reduce((sum, pit) => sum + pit.stones, 0);
    
    if (playerOneTotalStones === 0 || playerTwoTotalStones === 0) {
      let winner: 1 | 2 | null = null;
      if (board.playerOneScore > board.playerTwoScore) winner = 1;
      else if (board.playerTwoScore > board.playerOneScore) winner = 2;
      
      return { isGameEnd: true, winner };
    }
    
    return { isGameEnd: false, winner: null };
  }, []);

  // Sow stones from selected pit (core Oware mechanic)
  const sowStones = useCallback((board: OwareBoard, player: 1 | 2, pitIndex: number): OwareBoard => {
    const newBoard = JSON.parse(JSON.stringify(board)) as OwareBoard;
    const isPlayerOne = player === 1;
    const sourcePits = isPlayerOne ? newBoard.playerOnePits : newBoard.playerTwoPits;
    
    if (sourcePits[pitIndex].stones === 0) return board; // Can't move from empty pit
    
    let stones = sourcePits[pitIndex].stones;
    sourcePits[pitIndex].stones = 0;
    
    let currentPitIndex = pitIndex;
    let currentSide = player;
    
    // Sow stones counter-clockwise
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
      if (currentSide === player && currentPitIndex === pitIndex) {
        continue;
      }
      
      // Place stone
      const targetPits = currentSide === 1 ? newBoard.playerOnePits : newBoard.playerTwoPits;
      targetPits[currentPitIndex].stones++;
      stones--;
    }
    
    // Capture stones if last stone landed in opponent's pit with 2 or 3 stones
    if (currentSide !== player) {
      const targetPits = currentSide === 1 ? newBoard.playerOnePits : newBoard.playerTwoPits;
      const lastPitStones = targetPits[currentPitIndex].stones;
      
      if (lastPitStones === 2 || lastPitStones === 3) {
        // Capture stones working backwards
        let captureIndex = currentPitIndex;
        while (captureIndex >= 0) {
          const capturedStones = targetPits[captureIndex].stones;
          if (capturedStones === 2 || capturedStones === 3) {
            if (player === 1) {
              newBoard.playerOneScore += capturedStones;
            } else {
              newBoard.playerTwoScore += capturedStones;
            }
            targetPits[captureIndex].stones = 0;
            captureIndex--;
          } else {
            break;
          }
        }
      }
    }
    
    return newBoard;
  }, []);

  // Make a move
  const makeMove = useCallback((pitIndex: number) => {
    if (gameState.gameStatus !== 'playing' && gameState.gameStatus !== 'waiting') return;
    
    const currentPlayer = gameState.currentPlayer;
    const newBoard = sowStones(gameState.board, currentPlayer, pitIndex);
    const gameEnd = checkGameEnd(newBoard);
    
    setGameState(prev => ({
      ...prev,
      board: newBoard,
      currentPlayer: prev.currentPlayer === 1 ? 2 : 1,
      gameStatus: gameEnd.isGameEnd ? 'finished' : 'playing',
      winner: gameEnd.winner,
    }));
    
    setSelectedPit(null);
  }, [gameState, sowStones, checkGameEnd]);

  // Simple AI for single-player mode
  const makeAIMove = useCallback(() => {
    if (gameState.gameMode !== 'single-player' || gameState.currentPlayer !== 2) return;
    
    setGameState(prev => ({ ...prev, isThinking: true }));
    
    setTimeout(() => {
      // Simple AI: choose pit with most stones that allows capture
      const board = gameState.board;
      let bestMove = 0;
      let bestScore = -1;
      
      for (let i = 0; i < 6; i++) {
        if (board.playerTwoPits[i].stones > 0) {
          const testBoard = sowStones(board, 2, i);
          const scoreDiff = testBoard.playerTwoScore - board.playerTwoScore;
          
          if (scoreDiff > bestScore || (scoreDiff === bestScore && board.playerTwoPits[i].stones > board.playerTwoPits[bestMove].stones)) {
            bestMove = i;
            bestScore = scoreDiff;
          }
        }
      }
      
      setGameState(prev => ({ ...prev, isThinking: false }));
      makeMove(bestMove);
    }, 1000 + Math.random() * 1000); // Random thinking time
  }, [gameState, makeMove, sowStones]);

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
  }, [gameMode]);

  // AI move effect
  useEffect(() => {
    if (gameState.gameStatus === 'playing' && gameState.currentPlayer === 2 && gameState.gameMode === 'single-player') {
      makeAIMove();
    }
  }, [gameState.gameStatus, gameState.currentPlayer, gameState.gameMode, makeAIMove]);

  return {
    gameState,
    selectedPit,
    setSelectedPit,
    makeMove,
    startGame,
    resetGame,
  };
};