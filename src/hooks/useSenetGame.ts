import { useState, useCallback } from 'react';
import { SenetGameState, SenetPlayer, SenetPiece, SenetMove, ThrowingSticksResult, SPECIAL_SQUARES } from '@/types/senet';

const createInitialBoard = (): (SenetPiece | null)[] => {
  const board = new Array(30).fill(null);
  
  // Place initial pieces - alternating pattern in first 10 squares
  for (let i = 0; i < 10; i++) {
    if (i % 2 === 0) {
      // Player 1 pieces (human)
      board[i] = {
        id: `p1_${Math.floor(i / 2)}`,
        player: 1,
        position: i
      };
    } else {
      // Player 2 pieces (AI)
      board[i] = {
        id: `p2_${Math.floor(i / 2)}`,
        player: 2,
        position: i
      };
    }
  }
  
  return board;
};

const throwSticks = (): ThrowingSticksResult => {
  const sticks = Array.from({ length: 4 }, () => Math.random() < 0.5);
  const markedSides = sticks.filter(stick => stick).length;
  
  // Traditional Senet scoring: 0 marked = 6, 1-4 marked = that number
  const value = markedSides === 0 ? 6 : markedSides;
  
  return { sticks, value };
};

const getSquarePath = (position: number): number => {
  // S-shaped movement pattern
  if (position < 10) return position; // Row 1: 0-9
  if (position < 20) return 19 - (position - 10); // Row 2: 19-10 (reversed)
  return position; // Row 3: 20-29
};

const isSpecialSquare = (position: number): boolean => {
  return SPECIAL_SQUARES.some(square => square.position === position);
};

const canCapture = (attacker: SenetPiece, target: SenetPiece, position: number): boolean => {
  // Cannot capture on special squares
  if (isSpecialSquare(position)) return false;
  // Cannot capture own pieces
  if (attacker.player === target.player) return false;
  // Can only capture single pieces (not groups)
  return true;
};

export const useSenetGame = () => {
  const [gameState, setGameState] = useState<SenetGameState>({
    id: crypto.randomUUID(),
    board: createInitialBoard(),
    players: [
      { id: 1, name: 'Player', pieces: [], isAI: false },
      { id: 2, name: 'AI Opponent', pieces: [], isAI: true, difficulty: 'medium' }
    ],
    currentPlayer: 1,
    gamePhase: 'throwing',
    lastRoll: 0,
    availableMoves: [],
    moveHistory: [],
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const [isProcessing, setIsProcessing] = useState(false);

  const throwSticksAction = useCallback(() => {
    if (gameState.gamePhase !== 'throwing' || isProcessing) return null;
    
    const result = throwSticks();
    const availableMoves = getAvailableMoves(gameState.board, gameState.currentPlayer, result.value);
    
    setGameState(prev => ({
      ...prev,
      lastRoll: result.value,
      availableMoves,
      gamePhase: availableMoves.length > 0 ? 'moving' : 'throwing',
      currentPlayer: availableMoves.length === 0 ? (prev.currentPlayer === 1 ? 2 : 1) : prev.currentPlayer,
      updatedAt: new Date()
    }));
    
    return result;
  }, [gameState.gamePhase, gameState.board, gameState.currentPlayer, isProcessing]);

  const getAvailableMoves = (board: (SenetPiece | null)[], player: 1 | 2, roll: number): number[] => {
    const moves: number[] = [];
    
    board.forEach((piece, index) => {
      if (piece && piece.player === player) {
        const newPosition = index + roll;
        
        // Check if move is valid
        if (newPosition >= 30) {
          // Trying to bear off - check special square rules
          const specialSquare = SPECIAL_SQUARES.find(s => s.position === index);
          if (specialSquare && specialSquare.effect === 'must_roll_exact') {
            // Must roll exact number to exit from special squares
            if (newPosition === 30) moves.push(index);
          } else {
            // Can bear off with any sufficient roll
            moves.push(index);
          }
        } else if (newPosition < 30) {
          const targetSquare = board[newPosition];
          
          if (!targetSquare) {
            // Empty square
            moves.push(index);
          } else if (targetSquare.player !== player && canCapture(piece, targetSquare, newPosition)) {
            // Can capture opponent piece
            moves.push(index);
          }
        }
      }
    });
    
    return moves;
  };

  const makeMove = useCallback((fromPosition: number) => {
    if (gameState.gamePhase !== 'moving' || !gameState.availableMoves.includes(fromPosition) || isProcessing) {
      return false;
    }
    
    setIsProcessing(true);
    
    const piece = gameState.board[fromPosition];
    if (!piece || piece.player !== gameState.currentPlayer) {
      setIsProcessing(false);
      return false;
    }
    
    const newPosition = fromPosition + gameState.lastRoll;
    const targetPiece = newPosition < 30 ? gameState.board[newPosition] : null;
    
    const move: SenetMove = {
      pieceId: piece.id,
      fromPosition,
      toPosition: newPosition,
      captured: targetPiece?.id,
      timestamp: Date.now()
    };
    
    setGameState(prev => {
      const newBoard = [...prev.board];
      
      // Remove piece from old position
      newBoard[fromPosition] = null;
      
      if (newPosition >= 30) {
        // Piece bears off - remove from board
        piece.position = -1;
      } else {
        // Move piece to new position
        if (targetPiece && targetPiece.player !== piece.player) {
          // Capture - send captured piece back to start
          const startPosition = newBoard.findIndex(square => square === null);
          if (startPosition !== -1) {
            targetPiece.position = startPosition;
            newBoard[startPosition] = targetPiece;
          }
        }
        
        piece.position = newPosition;
        newBoard[newPosition] = piece;
      }
      
      // Check for winner
      const player1Pieces = newBoard.filter(p => p?.player === 1).length;
      const player2Pieces = newBoard.filter(p => p?.player === 2).length;
      const winner = player1Pieces === 0 ? 1 : player2Pieces === 0 ? 2 : undefined;
      
      return {
        ...prev,
        board: newBoard,
        currentPlayer: prev.currentPlayer === 1 ? 2 : 1,
        gamePhase: winner ? 'finished' : 'throwing',
        availableMoves: [],
        moveHistory: [...prev.moveHistory, move],
        winner,
        updatedAt: new Date()
      };
    });
    
    setTimeout(() => setIsProcessing(false), 500);
    return true;
  }, [gameState, isProcessing]);

  const resetGame = useCallback(() => {
    setGameState({
      id: crypto.randomUUID(),
      board: createInitialBoard(),
      players: [
        { id: 1, name: 'Player', pieces: [], isAI: false },
        { id: 2, name: 'AI Opponent', pieces: [], isAI: true, difficulty: gameState.players[1].difficulty || 'medium' }
      ],
      currentPlayer: 1,
      gamePhase: 'throwing',
      lastRoll: 0,
      availableMoves: [],
      moveHistory: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    setIsProcessing(false);
  }, [gameState.players]);

  const setAIDifficulty = useCallback((difficulty: 'easy' | 'medium' | 'hard') => {
    setGameState(prev => ({
      ...prev,
      players: prev.players.map(p => 
        p.isAI ? { ...p, difficulty } : p
      )
    }));
  }, []);

  return {
    gameState,
    isProcessing,
    throwSticks: throwSticksAction,
    makeMove,
    resetGame,
    setAIDifficulty
  };
};