import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface GameRoom {
  id: string;
  room_code: string;
  host_user_id: string;
  status: 'waiting' | 'playing' | 'finished';
  max_players: number;
  current_player_count: number;
  game_config: {
    categories: string[];
    rowCount: number;
  };
  current_turn_user_id: string | null;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
}

interface GameRoomPlayer {
  id: string;
  room_id: string;
  user_id: string;
  player_name: string;
  score: number;
  is_host: boolean;
  is_active: boolean;
  joined_at: string;
}

export const useGameRoom = () => {
  const { user } = useAuth();
  const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null);
  const [players, setPlayers] = useState<GameRoomPlayer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Find active game for current user
  const findActiveGame = useCallback(async () => {
    if (!user) return null;

    try {
      const { data: playerData, error: playerError } = await supabase
        .from('game_room_players')
        .select(`
          room_id,
          game_rooms (
            id,
            room_code,
            status,
            current_player_count,
            max_players,
            game_config
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .not('game_rooms.status', 'eq', 'finished')
        .order('joined_at', { ascending: false })
        .limit(1);

      if (playerError) throw playerError;

      if (playerData && playerData.length > 0 && playerData[0].game_rooms) {
        return playerData[0].game_rooms as any;
      }

      return null;
    } catch (err: any) {
      console.error('Failed to find active game:', err);
      return null;
    }
  }, [user]);

  // Add player to existing room (for match acceptance)
  const addPlayerToRoom = useCallback(async (roomId: string, playerId: string, playerName: string) => {
    try {
      const { error } = await supabase
        .from('game_room_players')
        .insert({
          room_id: roomId,
          user_id: playerId,
          player_name: playerName,
          is_host: false
        });

      if (error) throw error;
      return true;
    } catch (err: any) {
      console.error('Failed to add player to room:', err);
      return false;
    }
  }, []);

  // Create a new game room
  const createRoom = useCallback(async (gameConfig: { categories: string[]; rowCount: number }) => {
    if (!user) {
      toast.error('You must be logged in to create a room');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      // Generate room code
      const { data: roomCodeData, error: roomCodeError } = await supabase
        .rpc('generate_room_code');

      if (roomCodeError) throw roomCodeError;

      // Create room
      const { data: roomData, error: roomError } = await supabase
        .from('game_rooms')
        .insert({
          room_code: roomCodeData,
          host_user_id: user.id,
          game_config: gameConfig,
          status: 'waiting'
        })
        .select()
        .single();

      if (roomError) throw roomError;

      // Add host as first player
      const { error: playerError } = await supabase
        .from('game_room_players')
        .insert({
          room_id: roomData.id,
          user_id: user.id,
          player_name: user.email?.split('@')[0] || 'Host',
          is_host: true
        });

      if (playerError) throw playerError;

      setCurrentRoom(roomData as any);
      toast.success(`Room created! Code: ${roomCodeData}`);
      return roomData;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create room';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Join an existing room
  const joinRoom = useCallback(async (roomCode: string) => {
    if (!user) {
      toast.error('You must be logged in to join a room');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // Find room by code
      const { data: roomData, error: roomError } = await supabase
        .from('game_rooms')
        .select('*')
        .eq('room_code', roomCode.toUpperCase())
        .eq('status', 'waiting')
        .single();

      if (roomError || !roomData) {
        throw new Error('Room not found or game already started');
      }

      // Check if room is full
      if (roomData.current_player_count >= roomData.max_players) {
        throw new Error('Room is full');
      }

      // Check if user is already in room
      const { data: existingPlayer } = await supabase
        .from('game_room_players')
        .select('id')
        .eq('room_id', roomData.id)
        .eq('user_id', user.id)
        .single();

      if (existingPlayer) {
      setCurrentRoom(roomData as any);
      toast.success('Rejoined room!');
      return true;
      }

      // Add player to room
      const { error: playerError } = await supabase
        .from('game_room_players')
        .insert({
          room_id: roomData.id,
          user_id: user.id,
          player_name: user.email?.split('@')[0] || 'Player',
          is_host: false
        });

      if (playerError) throw playerError;

      setCurrentRoom(roomData as any);
      toast.success('Joined room successfully!');
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to join room';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Leave the current room
  const leaveRoom = useCallback(async () => {
    if (!currentRoom || !user) return;

    try {
      await supabase
        .from('game_room_players')
        .delete()
        .eq('room_id', currentRoom.id)
        .eq('user_id', user.id);

      setCurrentRoom(null);
      setPlayers([]);
      toast.success('Left room');
    } catch (err: any) {
      toast.error('Failed to leave room');
    }
  }, [currentRoom, user]);

  // Start the game (host only)
  const startGame = useCallback(async () => {
    if (!currentRoom || !user || currentRoom.host_user_id !== user.id) {
      toast.error('Only the host can start the game');
      return false;
    }

    if (players.length < 2) {
      toast.error('Need at least 2 players to start');
      return false;
    }

    try {
      const { error } = await supabase
        .from('game_rooms')
        .update({ 
          status: 'playing',
          started_at: new Date().toISOString(),
          current_turn_user_id: players[0]?.user_id
        })
        .eq('id', currentRoom.id);

      if (error) throw error;

      toast.success('Game started!');
      return true;
    } catch (err: any) {
      toast.error('Failed to start game');
      return false;
    }
  }, [currentRoom, user, players]);

  // Subscribe to room updates
  useEffect(() => {
    if (!currentRoom) return;

    const roomChannel = supabase
      .channel(`game-room-${currentRoom.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_rooms',
          filter: `id=eq.${currentRoom.id}`
        },
        (payload) => {
      if (payload.eventType === 'UPDATE') {
        setCurrentRoom(payload.new as any);
      }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_room_players',
          filter: `room_id=eq.${currentRoom.id}`
        },
        () => {
          // Refetch players when there are changes
          fetchPlayers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(roomChannel);
    };
  }, [currentRoom?.id]);

  // Fetch players for current room
  const fetchPlayers = useCallback(async () => {
    if (!currentRoom) return;

    try {
      const { data, error } = await supabase
        .from('game_room_players')
        .select('*')
        .eq('room_id', currentRoom.id)
        .eq('is_active', true)
        .order('joined_at', { ascending: true });

      if (error) throw error;
      setPlayers(data || []);
    } catch (err: any) {
      console.error('Failed to fetch players:', err);
    }
  }, [currentRoom]);

  // Fetch players when room changes
  useEffect(() => {
    if (currentRoom) {
      fetchPlayers();
    }
  }, [currentRoom, fetchPlayers]);

  return {
    currentRoom,
    players,
    loading,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
    findActiveGame,
    addPlayerToRoom,
    isHost: currentRoom?.host_user_id === user?.id,
    canStart: currentRoom?.status === 'waiting' && players.length >= 2
  };
};