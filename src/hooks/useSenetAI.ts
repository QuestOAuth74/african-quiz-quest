import { useEffect, useCallback, useState } from 'react';
import { SenetGameState, SenetPiece, SPECIAL_SQUARES } from '@/types/senet';

interface AIMove {
  position: number;
  score: number;
  reasoning: string;
}

const evaluatePosition = (board: (SenetPiece | null)[], piece: SenetPiece, newPosition: number): number => {
  let score = 0;
  
  // Advancement bonus - closer to bearing off is better
  score += newPosition * 2;
  
  // Special square considerations
  const specialSquare = SPECIAL_SQUARES.find(s => s.position === newPosition);
  if (specialSquare) {
    switch (specialSquare.effect) {
      case 'safe':
        score += 5; // Safety bonus
        break;
      case 'restart':
        score -= 20; // Penalty for dangerous square
        break;
      case 'must_roll_exact':
        score -= 3; // Slight penalty for restrictive squares
        break;
    }
  }
  
  // Bearing off bonus
  if (newPosition >= 30) {
    score += 50;
  }
  
  // Capture bonus
  const targetPiece = newPosition < 30 ? board[newPosition] : null;
  if (targetPiece && targetPiece.player !== piece.player) {
    score += 15;
  }
  
  return score;
};

const getAIMove = (gameState: SenetGameState): number => {
  const { board, availableMoves, currentPlayer, players } = gameState;
  const aiPlayer = players.find(p => p.id === currentPlayer && p.isAI);
  
  if (!aiPlayer || availableMoves.length === 0) return -1;
  
  const difficulty = aiPlayer.difficulty || 'medium';
  const possibleMoves: AIMove[] = [];
  
  // Evaluate all available moves
  availableMoves.forEach(position => {
    const piece = board[position];
    if (!piece || piece.player !== currentPlayer) return;
    
    const newPosition = position + gameState.lastRoll;
    const score = evaluatePosition(board, piece, newPosition);
    
    possibleMoves.push({
      position,
      score,
      reasoning: `Move from ${position} to ${newPosition >= 30 ? 'off board' : newPosition}`
    });
  });
  
  // Sort moves by score
  possibleMoves.sort((a, b) => b.score - a.score);
  
  // Apply difficulty-based selection
  switch (difficulty) {
    case 'easy':
      // 70% random, 30% best move
      if (Math.random() < 0.7) {
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
      }
      return possibleMoves[0].position;
      
    case 'medium':
      // 20% random, 80% top 3 moves
      if (Math.random() < 0.2) {
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
      }
      const topMoves = possibleMoves.slice(0, Math.min(3, possibleMoves.length));
      return topMoves[Math.floor(Math.random() * topMoves.length)].position;
      
    case 'hard':
      // Advanced strategy with look-ahead
      return getAdvancedAIMove(gameState, possibleMoves);
      
    default:
      return possibleMoves[0].position;
  }
};

const getAdvancedAIMove = (gameState: SenetGameState, moves: AIMove[]): number => {
  // For hard difficulty, consider blocking opponent and controlling key squares
  const { board, currentPlayer } = gameState;
  const opponentPlayer = currentPlayer === 1 ? 2 : 1;
  
  // Look for blocking opportunities
  const blockingMoves = moves.filter(move => {
    const newPosition = move.position + gameState.lastRoll;
    if (newPosition >= 30) return false;
    
    // Check if this move blocks opponent advancement
    const opponentPieces = board.filter(p => p?.player === opponentPlayer);
    return opponentPieces.some(piece => {
      if (!piece) return false;
      // Would this move block the opponent's likely next moves?
      for (let roll = 1; roll <= 6; roll++) {
        if (piece.position + roll === newPosition) return true;
      }
      return false;
    });
  });
  
  if (blockingMoves.length > 0) {
    // Prefer blocking moves with high advancement score
    blockingMoves.sort((a, b) => b.score - a.score);
    return blockingMoves[0].position;
  }
  
  // Control key squares (House of Beauty, late game squares)
  const controlMoves = moves.filter(move => {
    const newPosition = move.position + gameState.lastRoll;
    return [14, 20, 21, 22].includes(newPosition); // Strategic squares
  });
  
  if (controlMoves.length > 0) {
    controlMoves.sort((a, b) => b.score - a.score);
    return controlMoves[0].position;
  }
  
  // Default to best scoring move
  return moves[0].position;
};

export const useSenetAI = (
  gameState: SenetGameState | null,
  makeMove: (position: number) => boolean,
  throwSticks: () => any
) => {
  const [isThinking, setIsThinking] = useState(false);
  
  const makeAIMove = useCallback(async () => {
    if (!gameState || !gameState.players.find(p => p.id === gameState.currentPlayer && p.isAI)) {
      return;
    }
    
    setIsThinking(true);
    
    // Simulate thinking time based on difficulty
    const aiPlayer = gameState.players.find(p => p.id === gameState.currentPlayer && p.isAI);
    const thinkingTime = aiPlayer?.difficulty === 'hard' ? 2000 : 
                        aiPlayer?.difficulty === 'medium' ? 1500 : 1000;
    
    await new Promise(resolve => setTimeout(resolve, thinkingTime));
    
    if (gameState.gamePhase === 'throwing') {
      // AI throws sticks
      throwSticks();
    } else if (gameState.gamePhase === 'moving') {
      // AI makes a move
      const movePosition = getAIMove(gameState);
      if (movePosition !== -1) {
        makeMove(movePosition);
      }
    }
    
    setIsThinking(false);
  }, [gameState, makeMove, throwSticks]);
  
  // Trigger AI move when it's AI's turn
  useEffect(() => {
    if (!gameState) return;
    
    const isAITurn = gameState.players.find(p => p.id === gameState.currentPlayer && p.isAI);
    const shouldAct = (gameState.gamePhase === 'throwing' || gameState.gamePhase === 'moving') && 
                      !gameState.winner && !isThinking;
    
    if (isAITurn && shouldAct) {
      const timeout = setTimeout(makeAIMove, 500);
      return () => clearTimeout(timeout);
    }
  }, [gameState?.currentPlayer, gameState?.gamePhase, gameState?.winner, isThinking, makeAIMove]);
  
  return { isThinking };
};