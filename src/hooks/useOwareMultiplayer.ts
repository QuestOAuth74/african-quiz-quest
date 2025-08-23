import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { OwareGameState } from '@/types/oware';
import { toast } from 'sonner';

export interface OwareMultiplayerGame {
  id: string;
  host_user_id: string;
  guest_user_id?: string;
  game_state: OwareGameState;
  status: 'waiting' | 'active' | 'finished';
  created_at: string;
  updated_at: string;
  winner_user_id?: string;
}

export const useOwareMultiplayer = () => {
  const { user } = useAuth();
  const [currentGame, setCurrentGame] = useState<OwareMultiplayerGame | null>(null);
  const [availableGames, setAvailableGames] = useState<OwareMultiplayerGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [isHost, setIsHost] = useState(false);

  // Create a new game
  const createGame = useCallback(async (): Promise<string | null> => {
    if (!user) {
      toast.error('Please log in to create a game');
      return null;
    }

    setLoading(true);
    try {
      const initialGameState: OwareGameState = {
        board: {
          playerOnePits: Array.from({ length: 6 }, (_, i) => ({ stones: 4, index: i })),
          playerTwoPits: Array.from({ length: 6 }, (_, i) => ({ stones: 4, index: i })),
          playerOneScore: 0,
          playerTwoScore: 0,
        },
        currentPlayer: 1,
        gameStatus: 'waiting',
        winner: null,
        gameMode: 'multiplayer',
      };

      const { data, error } = await supabase.rpc('create_oware_game', {
        p_host_user_id: user.id,
        p_game_state: initialGameState as any,
      });

      if (error) throw error;
      if (!data || data.length === 0) throw new Error('No game created');

      const gameData = Array.isArray(data) ? data[0] : data;
      setCurrentGame({
        id: gameData.id,
        host_user_id: gameData.host_user_id,
        guest_user_id: gameData.guest_user_id,
        game_state: gameData.game_state as unknown as OwareGameState,
        status: gameData.status as 'waiting' | 'active' | 'finished',
        created_at: gameData.created_at,
        updated_at: gameData.updated_at,
        winner_user_id: gameData.winner_user_id,
      });
      setIsHost(true);
      toast.success('Game created! Waiting for opponent...');
      return gameData.id;
    } catch (error) {
      console.error('Error creating game:', error);
      toast.error('Failed to create game');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Join an existing game
  const joinGame = useCallback(async (gameId: string): Promise<boolean> => {
    if (!user) {
      toast.error('Please log in to join a game');
      return false;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('join_oware_game', {
        p_game_id: gameId,
        p_user_id: user.id,
      });

      if (error) throw error;
      if (!data || data.length === 0) throw new Error('Failed to join game');

      const gameData = Array.isArray(data) ? data[0] : data;
      setCurrentGame({
        id: gameData.id,
        host_user_id: gameData.host_user_id,
        guest_user_id: gameData.guest_user_id,
        game_state: gameData.game_state as unknown as OwareGameState,
        status: gameData.status as 'waiting' | 'active' | 'finished',
        created_at: gameData.created_at,
        updated_at: gameData.updated_at,
        winner_user_id: gameData.winner_user_id,
      });
      setIsHost(false);
      toast.success('Joined game successfully!');
      return true;
    } catch (error) {
      console.error('Error joining game:', error);
      toast.error('Failed to join game');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Make a move in the current game
  const makeMove = useCallback(async (pitIndex: number, newGameState: OwareGameState): Promise<boolean> => {
    if (!currentGame || !user) return false;

    try {
      const { data, error } = await supabase.rpc('make_oware_move', {
        p_game_id: currentGame.id,
        p_game_state: newGameState as any,
        p_winner_user_id: newGameState.winner === 1 ? currentGame.host_user_id : 
                         newGameState.winner === 2 ? currentGame.guest_user_id : null
      });

      if (error) throw error;
      return data === true;
    } catch (error) {
      console.error('Error making move:', error);
      toast.error('Failed to make move');
      return false;
    }
  }, [currentGame, user]);

  // Leave current game (simplified for now)
  const leaveGame = useCallback(async () => {
    setCurrentGame(null);
    setIsHost(false);
    toast.success('Left game');
  }, []);

  // Fetch available games (simplified for now)
  const fetchAvailableGames = useCallback(async () => {
    // For now, just clear the list
    // We'll implement this properly once database types are ready
    setAvailableGames([]);
  }, []);

  // Placeholder for real-time subscriptions
  useEffect(() => {
    if (!user) return;
    // We'll add real-time subscriptions once database types are ready
  }, [user, currentGame?.id]);

  // Fetch available games on mount
  useEffect(() => {
    fetchAvailableGames();
  }, [fetchAvailableGames]);

  return {
    currentGame,
    availableGames,
    loading,
    isHost,
    createGame,
    joinGame,
    makeMove,
    leaveGame,
    fetchAvailableGames,
  };
};
