import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { WheelGameSession, GameState } from '@/types/wheel';
import { toast } from '@/hooks/use-toast';

export const useRealtimeGameSync = (gameSessionId: string | null) => {
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
  const [loading, setLoading] = useState(true);

  const loadGameSession = useCallback(async () => {
    if (!gameSessionId || !user) return;

    console.log('Loading game session:', gameSessionId, 'for user:', user.id);
    
    try {
      const { data: session, error } = await supabase
        .from('wheel_game_sessions')
        .select('*')
        .eq('id', gameSessionId)
        .single();

      if (error) throw error;
      if (!session) return;

      console.log('Loaded session data:', session);

      // Parse game state
      const sessionGameState = typeof session.game_state === 'string' 
        ? JSON.parse(session.game_state) 
        : session.game_state;

      console.log('Session game state:', sessionGameState);

      // If there's a puzzle ID, fetch the full puzzle
      const puzzleId = session.current_puzzle_id || sessionGameState?.puzzleId;
      let currentPuzzle = sessionGameState?.currentPuzzle;
      
      if (puzzleId && !currentPuzzle) {
        console.log('Fetching puzzle:', puzzleId);
        const { data: puzzle, error: puzzleError } = await supabase
          .from('wheel_puzzles')
          .select('*')
          .eq('id', puzzleId)
          .single();
          
        if (!puzzleError && puzzle) {
          console.log('Loaded puzzle:', puzzle);
          currentPuzzle = puzzle;
        } else {
          console.error('Error loading puzzle:', puzzleError);
        }
      }

      setGameSession(session);
      setGameState(prev => ({
        ...prev,
        currentPuzzle,
        revealedLetters: sessionGameState?.revealedLetters || [],
        guessedLetters: sessionGameState?.guessedLetters || [],
        currentPlayerTurn: session.current_player,
        gamePhase: sessionGameState?.gamePhase || 'spinning',
        wheelValue: sessionGameState?.wheelValue || 0
      }));
      setLoading(false);
    } catch (error) {
      console.error('Error loading game session:', error);
      toast({
        title: "Error loading game",
        description: "Failed to load the game session.",
        variant: "destructive"
      });
    }
  }, [gameSessionId, user]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!gameSessionId || !user) return;

    loadGameSession();

    // Subscribe to game session updates
    const gameChannel = supabase
      .channel(`game-session-${gameSessionId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'wheel_game_sessions',
        filter: `id=eq.${gameSessionId}`
      }, (payload) => {
        if (payload.new) {
          setGameSession(payload.new as WheelGameSession);
          
          // Parse and update game state
          const sessionGameState = typeof payload.new.game_state === 'string' 
            ? JSON.parse(payload.new.game_state) 
            : payload.new.game_state;

          setGameState(prev => ({
            ...prev,
            currentPuzzle: sessionGameState?.currentPuzzle || prev.currentPuzzle,
            revealedLetters: sessionGameState?.revealedLetters || prev.revealedLetters,
            guessedLetters: sessionGameState?.guessedLetters || prev.guessedLetters,
            currentPlayerTurn: payload.new.current_player,
            gamePhase: sessionGameState?.gamePhase || 'spinning',
            wheelValue: sessionGameState?.wheelValue || 0
          }));
        }
      })
      .subscribe();

    // Subscribe to game moves for real-time updates
    const movesChannel = supabase
      .channel(`game-moves-${gameSessionId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'wheel_game_moves',
        filter: `session_id=eq.${gameSessionId}`
      }, (payload) => {
        // Refresh game session when new moves are made
        loadGameSession();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(gameChannel);
      supabase.removeChannel(movesChannel);
    };
  }, [gameSessionId, user, loadGameSession]);

  return {
    gameSession,
    gameState,
    loading,
    setGameState,
    setGameSession,
    loadGameSession
  };
};