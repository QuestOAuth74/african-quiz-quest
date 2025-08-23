import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SenetGameState, SenetOnlineGame, SenetOnlineMove, ThrowingSticksResult } from '@/types/senet';
import { useAuth } from './useAuth';
import { useToast } from '@/components/ui/use-toast';

export const useOnlineSenetGame = (gameId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [gameState, setGameState] = useState<SenetGameState | null>(null);
  const [onlineGame, setOnlineGame] = useState<SenetOnlineGame | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Load game data
  const loadGame = useCallback(async () => {
    if (!gameId || !user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('senet_games')
        .select('*')
        .eq('id', gameId)
        .single();

      if (error) throw error;
      
      setOnlineGame(data as unknown as SenetOnlineGame);
      setGameState(data.game_state as unknown as SenetGameState);
      setIsConnected(true);
    } catch (error) {
      console.error('Error loading game:', error);
      toast({
        title: 'Error',
        description: 'Failed to load game',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [gameId, user, toast]);

  // Create new online game
  const createGame = useCallback(async () => {
    if (!user) return null;

    try {
      const initialGameState = {
        id: crypto.randomUUID(),
        board: createInitialBoard(),
        players: [
          { id: 1, name: user.email || 'Player 1', pieces: [], isAI: false },
          { id: 2, name: 'Waiting for opponent...', pieces: [], isAI: false }
        ],
        currentPlayer: 1,
        gamePhase: 'setup',
        lastRoll: 0,
        availableMoves: [],
        moveHistory: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isMultiplayer: true
      } as any;

      const { data, error } = await supabase
        .from('senet_games')
        .insert({
          type: 'online_multiplayer',
          status: 'waiting',
          host_user_id: user.id,
          game_state: initialGameState
        })
        .select()
        .single();

      if (error) throw error;
      
      return data.id;
    } catch (error) {
      console.error('Error creating game:', error);
      toast({
        title: 'Error',
        description: 'Failed to create game',
        variant: 'destructive',
      });
      return null;
    }
  }, [user, toast]);

  // Join existing game
  const joinGame = useCallback(async (gameId: string) => {
    if (!user) return false;

    try {
      const { data: game, error: fetchError } = await supabase
        .from('senet_games')
        .select('*')
        .eq('id', gameId)
        .eq('status', 'waiting')
        .single();

      if (fetchError) throw fetchError;

      if (game.guest_user_id || game.host_user_id === user.id) {
        throw new Error('Game is already full or you cannot join your own game');
      }

      // Update game state with second player
      const currentGameState = game.game_state as unknown as any;
      const updatedGameState = {
        ...currentGameState,
        players: [
          currentGameState.players[0],
          { id: 2, name: user.email || 'Player 2', pieces: [], isAI: false }
        ]
      } as any;

      const { error: updateError } = await supabase
        .from('senet_games')
        .update({
          guest_user_id: user.id,
          status: 'active',
          started_at: new Date().toISOString(),
          game_state: updatedGameState
        })
        .eq('id', gameId);

      if (updateError) throw updateError;

      return true;
    } catch (error) {
      console.error('Error joining game:', error);
      toast({
        title: 'Error',
        description: 'Failed to join game',
        variant: 'destructive',
      });
      return false;
    }
  }, [user, toast]);

  // Make a move
  const makeMove = useCallback(async (moveData: any) => {
    if (!onlineGame || !user || !gameState) return false;

    try {
      // Create move record
      const { error: moveError } = await supabase
        .from('senet_moves')
        .insert({
          game_id: onlineGame.id,
          player_user_id: user.id,
          move_data: moveData,
          move_number: gameState.moveHistory.length + 1
        });

      if (moveError) throw moveError;

      // Update game state would be handled by real-time subscription
      return true;
    } catch (error) {
      console.error('Error making move:', error);
      toast({
        title: 'Error',
        description: 'Failed to make move',
        variant: 'destructive',
      });
      return false;
    }
  }, [onlineGame, user, gameState, toast]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!gameId || !user) return;

    let gameChannel: any;
    let movesChannel: any;

    const setupSubscriptions = async () => {
      // Subscribe to game updates
      gameChannel = supabase
        .channel(`game:${gameId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'senet_games',
            filter: `id=eq.${gameId}`
          },
          (payload) => {
            console.log('Game updated:', payload);
            const newGame = payload.new as any;
            setOnlineGame(newGame as SenetOnlineGame);
            setGameState(newGame.game_state as SenetGameState);
          }
        )
        .subscribe();

      // Subscribe to moves
      movesChannel = supabase
        .channel(`moves:${gameId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'senet_moves',
            filter: `game_id=eq.${gameId}`
          },
          (payload) => {
            console.log('New move:', payload);
            // Handle the new move
          }
        )
        .subscribe();
    };

    setupSubscriptions();

    return () => {
      if (gameChannel) supabase.removeChannel(gameChannel);
      if (movesChannel) supabase.removeChannel(movesChannel);
    };
  }, [gameId, user]);

  // Load game on mount
  useEffect(() => {
    if (gameId) {
      loadGame();
    }
  }, [gameId, loadGame]);

  return {
    gameState,
    onlineGame,
    isLoading,
    isConnected,
    createGame,
    joinGame,
    makeMove,
    loadGame
  };
};

// Helper function to create initial board
const createInitialBoard = (): (any | null)[] => {
  const board = new Array(30).fill(null);
  
  // Place initial pieces - alternating pattern in first 10 squares
  for (let i = 0; i < 10; i++) {
    if (i % 2 === 0) {
      // Player 1 pieces
      board[i] = {
        id: `p1_${Math.floor(i / 2)}`,
        player: 1,
        position: i
      };
    } else {
      // Player 2 pieces
      board[i] = {
        id: `p2_${Math.floor(i / 2)}`,
        player: 2,
        position: i
      };
    }
  }
  
  return board;
};