import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface OnlinePlayer {
  user_id: string;
  display_name: string | null;
  player_status: 'online' | 'waiting' | 'in_game';
  last_seen: string;
  is_online: boolean;
}

interface MatchmakingRequest {
  id: string;
  requester_id: string;
  target_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  game_config: any;
  created_at: string;
  expires_at: string;
}

export const usePlayerLobby = () => {
  const { user } = useAuth();
  const [onlinePlayers, setOnlinePlayers] = useState<OnlinePlayer[]>([]);
  const [waitingPlayers, setWaitingPlayers] = useState<OnlinePlayer[]>([]);
  const [matchmakingRequests, setMatchmakingRequests] = useState<MatchmakingRequest[]>([]);
  const [currentStatus, setCurrentStatus] = useState<'offline' | 'online' | 'waiting' | 'in_game'>('offline');
  const [loading, setLoading] = useState(false);

  // Update player status
  const updatePlayerStatus = useCallback(async (status: 'offline' | 'online' | 'waiting' | 'in_game') => {
    if (!user) return;

    try {
      const { error } = await supabase.rpc('update_player_status', { new_status: status });
      if (error) throw error;
      setCurrentStatus(status);
    } catch (err: any) {
      console.error('Failed to update player status:', err);
      toast.error('Failed to update status');
    }
  }, [user]);

  // Set player as waiting for matchmaking
  const enterWaitingLobby = useCallback(async () => {
    await updatePlayerStatus('waiting');
    toast.success('Entered matchmaking lobby');
  }, [updatePlayerStatus]);

  // Leave waiting lobby
  const leaveWaitingLobby = useCallback(async () => {
    await updatePlayerStatus('online');
    toast.success('Left matchmaking lobby');
  }, [updatePlayerStatus]);

  // Send matchmaking request to another player
  const sendMatchRequest = useCallback(async (targetUserId: string, gameConfig: any) => {
    if (!user) return false;

    try {
      // First check if there's already a pending request between these users
      const { data: existingRequests, error: checkError } = await supabase
        .from('matchmaking_requests')
        .select('*')
        .or(`and(requester_id.eq.${user.id},target_id.eq.${targetUserId}),and(requester_id.eq.${targetUserId},target_id.eq.${user.id})`)
        .eq('status', 'pending');

      if (checkError) {
        console.error('Error checking existing requests:', checkError);
        toast.error('Failed to check existing requests');
        return false;
      }

      if (existingRequests && existingRequests.length > 0) {
        toast.info('A request is already pending between you and this player');
        return false;
      }

      const { error } = await supabase
        .from('matchmaking_requests')
        .insert({
          requester_id: user.id,
          target_id: targetUserId,
          game_config: gameConfig
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast.info('A request is already pending between you and this player');
          return false;
        } else {
          throw error;
        }
      }

      toast.success('Match request sent!');
      return true;
    } catch (err: any) {
      console.error('Error sending match request:', err);
      toast.error('Failed to send match request');
      return false;
    }
  }, [user]);

  // Respond to matchmaking request
  const respondToMatchRequest = useCallback(async (requestId: string, accept: boolean) => {
    try {
      const { error } = await supabase
        .from('matchmaking_requests')
        .update({
          status: accept ? 'accepted' : 'declined'
        })
        .eq('id', requestId);

      if (error) throw error;

      if (accept) {
        toast.success('Match accepted! Creating game room...');
        // Set both players to in_game status
        await updatePlayerStatus('in_game');
      } else {
        toast.info('Match request declined');
      }

      return accept;
    } catch (err: any) {
      toast.error('Failed to respond to match request');
      return false;
    }
  }, [updatePlayerStatus]);

  // Fetch online and waiting players
  const fetchPlayers = useCallback(async () => {
    try {
      // Call the fixed get_online_players function
      const { data: allOnline, error: onlineError } = await supabase
        .rpc('get_online_players');

      if (onlineError) {
        console.error('Error fetching online players:', onlineError);
        // Fallback to direct profiles query
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, display_name, player_status, last_seen')
          .neq('player_status', 'offline')
          .gt('last_seen', new Date(Date.now() - 5 * 60 * 1000).toISOString())
          .order('last_seen', { ascending: false });

        if (profilesError) throw profilesError;
        
        const formattedData = profilesData?.map(p => ({
          ...p,
          is_online: true
        })) || [];
        
        setOnlinePlayers(formattedData as any);
        
        const waiting = formattedData.filter(player => 
          player.player_status === 'waiting' && player.user_id !== user?.id
        );
        setWaitingPlayers(waiting as any);
        return;
      }

      setOnlinePlayers(allOnline as any || []);

      // Filter waiting players
      const waiting = (allOnline || []).filter(player => 
        player.player_status === 'waiting' && player.user_id !== user?.id
      );
      setWaitingPlayers(waiting as any);

    } catch (err: any) {
      console.error('Failed to fetch players:', err);
    }
  }, [user?.id]);

  // Fetch matchmaking requests
  const fetchMatchmakingRequests = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('matchmaking_requests')
        .select('*')
        .or(`requester_id.eq.${user.id},target_id.eq.${user.id}`)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMatchmakingRequests(data as any || []);
    } catch (err: any) {
      console.error('Failed to fetch match requests:', err);
    }
  }, [user]);

  // Real-time subscriptions
  useEffect(() => {
    if (!user) return;

    // Subscribe to online players changes
    const playersChannel = supabase
      .channel('online-players')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          fetchPlayers();
        }
      )
      .subscribe();

    // Subscribe to matchmaking requests
    const matchmakingChannel = supabase
      .channel('matchmaking-requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matchmaking_requests'
        },
        () => {
          fetchMatchmakingRequests();
        }
      )
      .subscribe();

    // Broadcast presence
    const presenceChannel = supabase
      .channel('lobby-presence')
      .on('presence', { event: 'sync' }, () => {
        fetchPlayers();
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('Player joined lobby:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('Player left lobby:', key, leftPresences);
      })
      .subscribe();

    // Track user presence
    presenceChannel.track({
      user_id: user.id,
      email: user.email,
      online_at: new Date().toISOString()
    });

    return () => {
      supabase.removeChannel(playersChannel);
      supabase.removeChannel(matchmakingChannel);
      supabase.removeChannel(presenceChannel);
    };
  }, [user, fetchPlayers, fetchMatchmakingRequests]);

  // Initial data load
  useEffect(() => {
    if (user) {
      fetchPlayers();
      fetchMatchmakingRequests();
      updatePlayerStatus('online');
    }
  }, [user, fetchPlayers, fetchMatchmakingRequests, updatePlayerStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (user && currentStatus !== 'offline') {
        updatePlayerStatus('offline');
      }
    };
  }, []);

  return {
    onlinePlayers,
    waitingPlayers,
    matchmakingRequests,
    currentStatus,
    loading,
    enterWaitingLobby,
    leaveWaitingLobby,
    sendMatchRequest,
    respondToMatchRequest,
    updatePlayerStatus
  };
};