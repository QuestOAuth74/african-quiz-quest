import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useComputerOpponent } from './useComputerOpponent';
import { WheelGameSession, WheelPuzzle, GameState } from '@/types/wheel';

export const useSinglePlayerWheel = () => {
  const { user } = useAuth();
  const [gameSession, setGameSession] = useState<WheelGameSession | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    revealedLetters: [],
    guessedLetters: [],
    wheelValue: 0,
    isSpinning: false,
    currentPlayerTurn: 1,
    gamePhase: 'spinning'
  });
  const [loading, setLoading] = useState(false);
  const [computerTurn, setComputerTurn] = useState(false);

  const createSinglePlayerSession = useCallback(async (difficulty: 'easy' | 'medium' | 'hard' = 'medium') => {
    if (!user) return null;

    setLoading(true);
    try {
      // Get a random puzzle
      const { data: puzzles, error: puzzleError } = await supabase
        .from('wheel_puzzles')
        .select('*')
        .eq('is_active', true)
        .limit(10);

      if (puzzleError || !puzzles?.length) {
        throw new Error('No puzzles available');
      }

      const randomPuzzle = puzzles[Math.floor(Math.random() * puzzles.length)];

      // Create game session
      const { data: session, error: sessionError } = await supabase
        .from('wheel_game_sessions')
        .insert({
          player1_id: user.id,
          player2_id: null, // No human player 2
          current_player: 1,
          current_puzzle_id: randomPuzzle.id,
          game_mode: 'single',
          computer_difficulty: difficulty,
          computer_player_data: {
            name: `AI ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`,
            difficulty
          },
          game_state: {
            currentPuzzle: randomPuzzle,
            revealedLetters: [],
            guessedLetters: [],
            wheelValue: 0,
            isSpinning: false,
            currentPlayerTurn: 1,
            gamePhase: 'spinning'
          },
          status: 'active'
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      setGameSession(session);
      setGameState({
        currentPuzzle: randomPuzzle,
        revealedLetters: [],
        guessedLetters: [],
        wheelValue: 0,
        isSpinning: false,
        currentPlayerTurn: 1,
        gamePhase: 'spinning'
      });

      return session;
    } catch (error) {
      console.error('Error creating single player session:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const spinWheel = useCallback(async (value: number | string) => {
    if (!gameSession || !user) return;

    try {
      // Record the spin move
      await supabase
        .from('wheel_game_moves')
        .insert({
          session_id: gameSession.id,
          player_id: user.id,
          move_type: 'spin',
          move_data: { wheelValue: value },
          points_earned: 0
        });

      // Update game state
      const newGameState = {
        ...gameState,
        wheelValue: value,
        gamePhase: value === 'BANKRUPT' || value === 'LOSE_TURN' ? 'spinning' as const : 'guessing' as const
      };

      if (value === 'BANKRUPT') {
        // Reset round score and switch turns
        newGameState.currentPlayerTurn = newGameState.currentPlayerTurn === 1 ? 2 : 1;
      } else if (value === 'LOSE_TURN') {
        // Just switch turns
        newGameState.currentPlayerTurn = newGameState.currentPlayerTurn === 1 ? 2 : 1;
      }

      setGameState(newGameState);

      // Update session in database
      await supabase
        .from('wheel_game_sessions')
        .update({
          game_state: newGameState,
          current_player: newGameState.currentPlayerTurn
        })
        .eq('id', gameSession.id);

    } catch (error) {
      console.error('Error spinning wheel:', error);
    }
  }, [gameSession, gameState, user]);

  const guessLetter = useCallback(async (letter: string) => {
    if (!gameSession || !gameState.currentPuzzle || !user) return;

    try {
      const puzzle = gameState.currentPuzzle;
      const isCorrect = puzzle.phrase.includes(letter);
      const letterCount = puzzle.phrase.split('').filter(char => char === letter).length;
      const points = isCorrect && typeof gameState.wheelValue === 'number' ? 
        gameState.wheelValue * letterCount : 0;

      // Record the move
      await supabase
        .from('wheel_game_moves')
        .insert({
          session_id: gameSession.id,
          player_id: user.id,
          move_type: 'guess_letter',
          move_data: { letter, isCorrect, letterCount },
          points_earned: points
        });

      // Update game state
      const newRevealedLetters = isCorrect ? 
        [...gameState.revealedLetters, letter] : gameState.revealedLetters;
      
      const newGameState = {
        ...gameState,
        revealedLetters: newRevealedLetters,
        guessedLetters: [...gameState.guessedLetters, letter],
        gamePhase: isCorrect ? 'spinning' as const : 'spinning' as const,
        currentPlayerTurn: isCorrect ? gameState.currentPlayerTurn : (gameState.currentPlayerTurn === 1 ? 2 : 1)
      };

      setGameState(newGameState);

      // Update session
      const scoreUpdate = gameState.currentPlayerTurn === 1 ? 
        { player1_round_score: (gameSession.player1_round_score || 0) + points } :
        { player2_round_score: (gameSession.player2_round_score || 0) + points };

      await supabase
        .from('wheel_game_sessions')
        .update({
          ...scoreUpdate,
          game_state: newGameState,
          current_player: newGameState.currentPlayerTurn
        })
        .eq('id', gameSession.id);

      // Check if puzzle is solved
      const allLettersRevealed = puzzle.phrase.split('').every(char => 
        !char.match(/[A-Z]/) || newRevealedLetters.includes(char)
      );

      if (allLettersRevealed) {
        // Puzzle solved!
        newGameState.gamePhase = 'round_end';
        setGameState(newGameState);
      }

    } catch (error) {
      console.error('Error guessing letter:', error);
    }
  }, [gameSession, gameState, user]);

  // Computer opponent integration
  const { computerPlayer, getNextMove, simulateComputerTurn } = useComputerOpponent(
    gameSession?.computer_difficulty as 'easy' | 'medium' | 'hard' || 'medium'
  );

  // Handle computer turns
  useEffect(() => {
    if (gameState.currentPlayerTurn === 2 && gameSession?.game_mode === 'single' && !computerTurn) {
      setComputerTurn(true);
      
      const executeComputerMove = async () => {
        await simulateComputerTurn();
        
        if (!gameState.currentPuzzle) return;
        
        const currentScore = gameSession.player2_round_score || 0;
        const nextMove = getNextMove(
          gameState.currentPuzzle.phrase,
          gameState.revealedLetters,
          gameState.guessedLetters,
          currentScore,
          gameState.wheelValue
        );

        // Execute the computer's move
        switch (nextMove.type) {
          case 'spin':
            // Computer spins - simulate random wheel value
            const wheelValues = [200, 300, 400, 500, 600, 700, 800, 900, 1000, 'BANKRUPT', 'LOSE_TURN'];
            const randomValue = wheelValues[Math.floor(Math.random() * wheelValues.length)];
            await spinWheel(randomValue);
            break;
          case 'guess_letter':
            await guessLetter(nextMove.data);
            break;
          // Add cases for buy_vowel and solve when implemented
        }
        
        setComputerTurn(false);
      };

      executeComputerMove();
    }
  }, [gameState.currentPlayerTurn, gameSession, computerTurn, simulateComputerTurn, getNextMove, spinWheel, guessLetter]);

  return {
    gameSession,
    gameState,
    loading,
    computerPlayer: gameSession?.computer_player_data,
    createSinglePlayerSession,
    spinWheel,
    guessLetter,
    computerTurn
  };
};