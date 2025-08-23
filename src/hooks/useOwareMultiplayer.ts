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

      const { data, error } = await supabase
        .from('oware_games')
        .insert({
          host_user_id: user.id,
          game_state: initialGameState,
          status: 'waiting',
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentGame(data);
      setIsHost(true);
      toast.success('Game created! Waiting for opponent...');
      return data.id;
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
      const { data, error } = await supabase
        .from('oware_games')
        .update({ 
          guest_user_id: user.id, 
          status: 'active',
          'game_state.gameStatus': 'playing'
        })
        .eq('id', gameId)
        .eq('status', 'waiting')
        .select()
        .single();

      if (error) throw error;

      setCurrentGame(data);
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
      const { error } = await supabase
        .from('oware_games')
        .update({ 
          game_state: newGameState,
          updated_at: new Date().toISOString(),
          ...(newGameState.winner && { 
            status: 'finished',
            winner_user_id: newGameState.winner === 1 ? currentGame.host_user_id : currentGame.guest_user_id
          })
        })
        .eq('id', currentGame.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error making move:', error);
      toast.error('Failed to make move');
      return false;
    }
  }, [currentGame, user]);

  // Leave current game
  const leaveGame = useCallback(async () => {
    if (!currentGame || !user) return;

    try {
      if (isHost) {
        // Host deletes the game
        const { error } = await supabase
          .from('oware_games')
          .delete()
          .eq('id', currentGame.id);
        
        if (error) throw error;
      } else {
        // Guest leaves the game
        const { error } = await supabase
          .from('oware_games')
          .update({ 
            guest_user_id: null, 
            status: 'waiting',
            'game_state.gameStatus': 'waiting'
          })
          .eq('id', currentGame.id);
        
        if (error) throw error;
      }

      setCurrentGame(null);
      setIsHost(false);
      toast.success('Left game successfully');
    } catch (error) {
      console.error('Error leaving game:', error);
      toast.error('Failed to leave game');
    }
  }, [currentGame, user, isHost]);

  // Fetch available games
  const fetchAvailableGames = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('oware_games')
        .select(`
          *,
          host:profiles!oware_games_host_user_id_fkey(display_name)
        `)
        .eq('status', 'waiting')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAvailableGames(data || []);
    } catch (error) {
      console.error('Error fetching games:', error);
    }
  }, []);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    // Subscribe to game changes for current game
    let gameSubscription: any = null;
    if (currentGame) {
      gameSubscription = supabase
        .channel(`oware_game_${currentGame.id}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'oware_games',
          filter: `id=eq.${currentGame.id}`,
        }, (payload) => {
          if (payload.eventType === 'UPDATE') {
            setCurrentGame(payload.new as OwareMultiplayerGame);
          } else if (payload.eventType === 'DELETE') {
            setCurrentGame(null);
            setIsHost(false);
            toast.info('Game was deleted by host');
          }
        })
        .subscribe();
    }

    // Subscribe to available games list
    const gamesSubscription = supabase
      .channel('oware_games_list')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'oware_games',
      }, () => {
        fetchAvailableGames();
      })
      .subscribe();

    return () => {
      if (gameSubscription) {
        supabase.removeChannel(gameSubscription);
      }
      supabase.removeChannel(gamesSubscription);
    };
  }, [user, currentGame?.id, fetchAvailableGames]);

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