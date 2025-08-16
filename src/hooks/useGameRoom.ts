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

      // Create room with max 2 players for private rooms
      const { data: roomData, error: roomError } = await supabase
        .from('game_rooms')
        .insert({
          room_code: roomCodeData,
          host_user_id: user.id,
          game_config: gameConfig,
          status: 'waiting',
          max_players: 2
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
        if (roomError?.message?.includes('No rows')) {
          throw new Error('Invalid invitation code. Please check the code and try again.');
        }
        throw new Error('Room not found or game has already started');
      }

      // Check actual player count instead of relying on potentially stale current_player_count
      const { count: actualPlayerCount, error: countError } = await supabase
        .from('game_room_players')
        .select('*', { count: 'exact', head: true })
        .eq('room_id', roomData.id)
        .eq('is_active', true);

      if (countError) {
        console.error('Error counting players:', countError);
        throw new Error('Failed to check room capacity');
      }

      console.log(`Room ${roomCode}: stored count = ${roomData.current_player_count}, actual count = ${actualPlayerCount}`);

      if (actualPlayerCount >= roomData.max_players) {
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

  // Delete room (host only, when room is inactive)
  const deleteRoom = useCallback(async () => {
    if (!currentRoom || !user || currentRoom.host_user_id !== user.id) {
      toast.error('Only the host can delete the room');
      return false;
    }

    if (currentRoom.status === 'playing') {
      toast.error('Cannot delete an active game');
      return false;
    }

    try {
      // First remove all players
      await supabase
        .from('game_room_players')
        .delete()
        .eq('room_id', currentRoom.id);

      // Then delete the room
      const { error } = await supabase
        .from('game_rooms')
        .delete()
        .eq('id', currentRoom.id);

      if (error) throw error;

      setCurrentRoom(null);
      setPlayers([]);
      toast.success('Room deleted successfully');
      return true;
    } catch (err: any) {
      toast.error('Failed to delete room');
      return false;
    }
  }, [currentRoom, user]);

  // Start the game (host only)
  const startGame = useCallback(async () => {
    if (!currentRoom || !user || currentRoom.host_user_id !== user.id) {
      toast.error('Only the host can start the game');
      return false;
    }

    if (players.length !== 2) {
      toast.error('Need exactly 2 players to start a private room');
      return false;
    }

    try {
      // Initialize first turn with host or first player
      const firstPlayer = players.find(p => p.is_host) || players[0];
      
      const { error } = await supabase
        .from('game_rooms')
        .update({ 
          status: 'playing', 
          started_at: new Date().toISOString(),
          current_turn_user_id: firstPlayer?.user_id
        })
        .eq('id', currentRoom.id);

      if (error) throw error;

      console.log('Game started with first turn:', firstPlayer?.player_name);
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
    deleteRoom,
    startGame,
    addPlayerToRoom,
    isHost: currentRoom?.host_user_id === user?.id,
    canStart: currentRoom?.status === 'waiting' && players.length === 2,
    canDelete: currentRoom?.host_user_id === user?.id && currentRoom?.status !== 'playing'
  };
};