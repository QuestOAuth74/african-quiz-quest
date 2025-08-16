import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { WheelGameSession, WheelPuzzle, GameState } from '@/types/wheel';
import { toast } from '@/hooks/use-toast';

export const useWheelGameState = () => {
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

  const createGameSession = useCallback(async (player2Id: string) => {
    if (!user) return null;

    try {
      setLoading(true);
      
      // Get a random puzzle
      const { data: puzzles, error: puzzleError } = await supabase
        .from('wheel_puzzles')
        .select('*')
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      if (puzzleError) throw puzzleError;
      if (!puzzles) {
        toast({
          title: "No puzzles available",
          description: "Please contact an admin to add wheel puzzles.",
          variant: "destructive"
        });
        return null;
      }

      const puzzle = puzzles;

      const { data: session, error } = await supabase
        .from('wheel_game_sessions')
        .insert({
          player1_id: user.id,
          player2_id: player2Id,
          current_puzzle_id: puzzle.id,
          game_state: {
            currentPuzzle: puzzle,
            revealedLetters: [],
            guessedLetters: [],
            wheelValue: 0,
            isSpinning: false,
            currentPlayerTurn: 1,
            gamePhase: 'spinning'
          }
        })
        .select()
        .single();

      if (error) throw error;

      setGameSession(session);
      setGameState(prev => ({
        ...prev,
        currentPuzzle: puzzle,
        revealedLetters: [],
        guessedLetters: [],
        currentPlayerTurn: 1,
        gamePhase: 'spinning'
      }));

      return session;
    } catch (error) {
      console.error('Error creating game session:', error);
      toast({
        title: "Failed to create game",
        description: "Please try again.",
        variant: "destructive"
      });
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
          move_data: { value },
          points_earned: 0
        });

      setGameState(prev => ({
        ...prev,
        wheelValue: value,
        isSpinning: false,
        gamePhase: value === 'BANKRUPT' || value === 'LOSE_TURN' ? 'round_end' : 'guessing'
      }));

      if (value === 'BANKRUPT') {
        // Player loses all round score
        const updatedSession = {
          ...gameSession,
          [gameSession.current_player === 1 ? 'player1_round_score' : 'player2_round_score']: 0,
          current_player: gameSession.current_player === 1 ? 2 : 1
        };
        
        await supabase
          .from('wheel_game_sessions')
          .update(updatedSession)
          .eq('id', gameSession.id);
          
        setGameSession(updatedSession);
        switchTurn();
      } else if (value === 'LOSE_TURN') {
        switchTurn();
      }
    } catch (error) {
      console.error('Error spinning wheel:', error);
      toast({
        title: "Error spinning wheel",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  }, [gameSession, user]);

  const guessLetter = useCallback(async (letter: string) => {
    if (!gameSession || !gameState.currentPuzzle || typeof gameState.wheelValue !== 'number') return;

    try {
      const isCorrect = gameState.currentPuzzle.phrase.toUpperCase().includes(letter.toUpperCase());
      const letterCount = (gameState.currentPuzzle.phrase.toUpperCase().match(new RegExp(letter.toUpperCase(), 'g')) || []).length;
      const pointsEarned = isCorrect ? gameState.wheelValue * letterCount : 0;

      // Record the guess
      await supabase
        .from('wheel_game_moves')
        .insert({
          session_id: gameSession.id,
          player_id: user!.id,
          move_type: 'guess_letter',
          move_data: { letter, isCorrect, letterCount },
          points_earned: pointsEarned
        });

      // Update game state
      const newGuessedLetters = [...gameState.guessedLetters, letter.toUpperCase()];
      const newRevealedLetters = isCorrect 
        ? [...gameState.revealedLetters, letter.toUpperCase()]
        : gameState.revealedLetters;

      setGameState(prev => ({
        ...prev,
        guessedLetters: newGuessedLetters,
        revealedLetters: newRevealedLetters,
        gamePhase: isCorrect ? 'spinning' : 'round_end'
      }));

      // Update session scores
      if (isCorrect && pointsEarned > 0) {
        const updatedSession = {
          ...gameSession,
          [gameSession.current_player === 1 ? 'player1_round_score' : 'player2_round_score']: 
            (gameSession.current_player === 1 ? gameSession.player1_round_score : gameSession.player2_round_score) + pointsEarned
        };
        
        await supabase
          .from('wheel_game_sessions')
          .update(updatedSession)
          .eq('id', gameSession.id);
          
        setGameSession(updatedSession);
      } else {
        switchTurn();
      }
    } catch (error) {
      console.error('Error guessing letter:', error);
      toast({
        title: "Error making guess",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  }, [gameSession, gameState, user]);

  const buyVowel = useCallback(async (vowel: string) => {
    if (!gameSession || !gameState.currentPuzzle) return;

    const VOWEL_COST = 250;
    const currentScore = gameSession.current_player === 1 ? gameSession.player1_round_score : gameSession.player2_round_score;
    
    if (currentScore < VOWEL_COST) return;

    try {
      const isCorrect = gameState.currentPuzzle.phrase.toUpperCase().includes(vowel.toUpperCase());

      // Record the vowel purchase
      await supabase
        .from('wheel_game_moves')
        .insert({
          session_id: gameSession.id,
          player_id: user!.id,
          move_type: 'buy_vowel',
          move_data: { vowel, isCorrect },
          points_earned: -VOWEL_COST
        });

      // Update game state
      const newGuessedLetters = [...gameState.guessedLetters, vowel.toUpperCase()];
      const newRevealedLetters = isCorrect 
        ? [...gameState.revealedLetters, vowel.toUpperCase()]
        : gameState.revealedLetters;

      setGameState(prev => ({
        ...prev,
        guessedLetters: newGuessedLetters,
        revealedLetters: newRevealedLetters
      }));

      // Update session scores (deduct vowel cost)
      const updatedSession = {
        ...gameSession,
        [gameSession.current_player === 1 ? 'player1_round_score' : 'player2_round_score']: currentScore - VOWEL_COST
      };
      
      await supabase
        .from('wheel_game_sessions')
        .update(updatedSession)
        .eq('id', gameSession.id);
        
      setGameSession(updatedSession);
    } catch (error) {
      console.error('Error buying vowel:', error);
      toast({
        title: "Error buying vowel",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  }, [gameSession, gameState, user]);

  const solvePuzzle = useCallback(async (solution: string) => {
    if (!gameSession || !gameState.currentPuzzle) return;

    try {
      const isCorrect = solution.toUpperCase() === gameState.currentPuzzle.phrase.toUpperCase();
      const pointsEarned = isCorrect ? 1000 : 0; // Bonus for solving

      // Record the solve attempt
      await supabase
        .from('wheel_game_moves')
        .insert({
          session_id: gameSession.id,
          player_id: user!.id,
          move_type: 'solve_puzzle',
          move_data: { solution, isCorrect },
          points_earned: pointsEarned
        });

      if (isCorrect) {
        // Player wins the round
        const currentRoundScore = gameSession.current_player === 1 ? gameSession.player1_round_score : gameSession.player2_round_score;
        const totalPoints = currentRoundScore + pointsEarned;
        
        const updatedSession = {
          ...gameSession,
          [gameSession.current_player === 1 ? 'player1_score' : 'player2_score']: 
            (gameSession.current_player === 1 ? gameSession.player1_score : gameSession.player2_score) + totalPoints,
          [gameSession.current_player === 1 ? 'rounds_won_player1' : 'rounds_won_player2']:
            (gameSession.current_player === 1 ? gameSession.rounds_won_player1 : gameSession.rounds_won_player2) + 1,
          player1_round_score: 0,
          player2_round_score: 0
        };
        
        await supabase
          .from('wheel_game_sessions')
          .update(updatedSession)
          .eq('id', gameSession.id);
          
        setGameSession(updatedSession);
        setGameState(prev => ({ ...prev, gamePhase: 'round_end' }));
        
        toast({
          title: "Correct!",
          description: `You solved the puzzle and earned $${totalPoints.toLocaleString()}!`,
        });
      } else {
        switchTurn();
        toast({
          title: "Incorrect",
          description: "That's not the right answer.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error solving puzzle:', error);
      toast({
        title: "Error solving puzzle",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  }, [gameSession, gameState, user]);

  const switchTurn = useCallback(async () => {
    if (!gameSession) return;

    const newPlayer = gameSession.current_player === 1 ? 2 : 1;
    const updatedSession = { ...gameSession, current_player: newPlayer };
    
    await supabase
      .from('wheel_game_sessions')
      .update({ current_player: newPlayer })
      .eq('id', gameSession.id);
      
    setGameSession(updatedSession);
    setGameState(prev => ({ 
      ...prev, 
      currentPlayerTurn: newPlayer,
      gamePhase: 'spinning',
      wheelValue: 0
    }));
  }, [gameSession]);

  return {
    gameSession,
    gameState,
    loading,
    createGameSession,
    spinWheel,
    guessLetter,
    buyVowel,
    solvePuzzle,
    switchTurn
  };
};