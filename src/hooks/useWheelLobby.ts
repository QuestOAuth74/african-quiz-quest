import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { LobbyPlayer, WheelGameChallenge } from '@/types/lobby';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { getDisplayName } from '@/lib/username-generator';

export const useWheelLobby = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [onlinePlayers, setOnlinePlayers] = useState<LobbyPlayer[]>([]);
  const [incomingChallenges, setIncomingChallenges] = useState<WheelGameChallenge[]>([]);
  const [outgoingChallenges, setOutgoingChallenges] = useState<WheelGameChallenge[]>([]);
  const [loading, setLoading] = useState(false);

  // Update user status to 'waiting' when in lobby
  useEffect(() => {
    if (!user) return;

    const updateStatus = async () => {
      await supabase.rpc('update_player_status', { new_status: 'waiting' });
    };

    updateStatus();

    // Cleanup: set status to offline when leaving
    return () => {
      supabase.rpc('update_player_status', { new_status: 'offline' });
    };
  }, [user]);

  // Fetch online players
  const fetchOnlinePlayers = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('get_online_players');
      
      if (error) throw error;
      
      // Filter out current user
      const filteredPlayers = data?.filter((player: LobbyPlayer) => 
        player.user_id !== user.id
      ) || [];
      
      setOnlinePlayers(filteredPlayers);
    } catch (error) {
      console.error('Error fetching online players:', error);
    }
  }, [user]);

  // Fetch challenges
  const fetchChallenges = useCallback(async () => {
    if (!user) return;

    try {
      // Clean up expired challenges first
      await supabase.rpc('cleanup_expired_wheel_challenges');

      const { data, error } = await supabase
        .from('wheel_game_challenges')
        .select('*')
        .or(`challenger_id.eq.${user.id},challenged_id.eq.${user.id}`)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const incoming = data?.filter(challenge => 
        challenge.challenged_id === user.id
      ) || [];
      
      const outgoing = data?.filter(challenge => 
        challenge.challenger_id === user.id
      ) || [];

      setIncomingChallenges(incoming);
      setOutgoingChallenges(outgoing);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    }
  }, [user]);

  // Send challenge
  const sendChallenge = useCallback(async (challengedId: string) => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('wheel_game_challenges')
        .insert({
          challenger_id: user.id,
          challenged_id: challengedId,
          game_config: { difficulty: 'normal' }
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Challenge sent!",
        description: "Waiting for the other player to respond.",
      });

      fetchChallenges();
    } catch (error) {
      console.error('Error sending challenge:', error);
      toast({
        title: "Failed to send challenge",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, fetchChallenges]);

  // Accept challenge
  const acceptChallenge = useCallback(async (challengeId: string) => {
    if (!user) return null;

    try {
      setLoading(true);

      // Update challenge status
      const { error: updateError } = await supabase
        .from('wheel_game_challenges')
        .update({ status: 'accepted' })
        .eq('id', challengeId);

      if (updateError) throw updateError;

      // Get challenge details to create game session
      const { data: challenge, error: challengeError } = await supabase
        .from('wheel_game_challenges')
        .select('*')
        .eq('id', challengeId)
        .single();

      if (challengeError) throw challengeError;

      // Get a random puzzle
      const { data: puzzle, error: puzzleError } = await supabase
        .from('wheel_puzzles')
        .select('*')
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      if (puzzleError) throw puzzleError;
      if (!puzzle) {
        toast({
          title: "No puzzles available",
          description: "Please contact an admin to add wheel puzzles.",
          variant: "destructive"
        });
        return null;
      }

      // Create game session
      const { data: session, error: sessionError } = await supabase
        .from('wheel_game_sessions')
        .insert({
          player1_id: challenge.challenger_id,
          player2_id: challenge.challenged_id,
          current_puzzle_id: puzzle.id,
          status: 'playing',
          game_mode: 'challenge',
          player1_name: getDisplayName(null, challenge.challenger_id),
          player2_name: getDisplayName(null, challenge.challenged_id),
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

      if (sessionError) throw sessionError;

      console.log('Challenge accepted, navigating to game:', session.id);
      toast({
        title: "Challenge accepted!",
        description: "Starting the game...",
      });

      // Navigate immediately for the acceptor
      navigate(`/wheel/play/${session.id}`);
      
      fetchChallenges();
      return session;
    } catch (error) {
      console.error('Error accepting challenge:', error);
      toast({
        title: "Failed to accept challenge",
        description: "Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, fetchChallenges]);

  // Decline challenge
  const declineChallenge = useCallback(async (challengeId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('wheel_game_challenges')
        .update({ status: 'declined' })
        .eq('id', challengeId);

      if (error) throw error;

      toast({
        title: "Challenge declined",
        description: "The challenge has been declined.",
      });

      fetchChallenges();
    } catch (error) {
      console.error('Error declining challenge:', error);
      toast({
        title: "Failed to decline challenge",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  }, [user, fetchChallenges]);

  // Cancel outgoing challenge
  const cancelChallenge = useCallback(async (challengeId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('wheel_game_challenges')
        .update({ status: 'declined' })
        .eq('id', challengeId);

      if (error) throw error;

      toast({
        title: "Challenge cancelled",
        description: "Your challenge has been cancelled.",
      });

      fetchChallenges();
    } catch (error) {
      console.error('Error cancelling challenge:', error);
    }
  }, [user, fetchChallenges]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    // Subscribe to online players changes
    const playersChannel = supabase
      .channel('online-players')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles',
        filter: `player_status.neq.offline`
      }, () => {
        fetchOnlinePlayers();
      })
      .subscribe();

    // Subscribe to challenge changes
    const challengesChannel = supabase
      .channel('wheel-challenges')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'wheel_game_challenges'
      }, async (payload) => {
        console.log('Wheel challenge real-time update:', payload);
        fetchChallenges();

        const ch: any = payload.new;
        if (ch && ch.status === 'accepted' && ch.challenger_id === user.id) {
          // Fallback with retries: challenger navigates after seeing accepted status
          const waitForSession = async () => {
            const attemptDelays = [200, 300, 400, 600, 800, 1000, 1200, 1500];
            for (const delay of attemptDelays) {
              try {
                const { data: session } = await supabase
                  .from('wheel_game_sessions')
                  .select('id, player1_id, player2_id, created_at')
                  .eq('player1_id', ch.challenger_id)
                  .eq('player2_id', ch.challenged_id)
                  .order('created_at', { ascending: false })
                  .limit(1)
                  .maybeSingle();

                if (session) {
                  console.log('Found session for accepted challenge (fallback):', session.id);
                  navigate(`/wheel/play/${session.id}`);
                  return;
                }
              } catch (e) {
                console.warn('Fallback navigation lookup attempt failed:', e);
              }
              // wait before next attempt
              await new Promise((res) => setTimeout(res, delay));
            }
            console.warn('No session found after challenge accepted (fallback exhausted)');
          };

          waitForSession();
        }
      })
      .subscribe();

    // Subscribe to game session creation (for automatic navigation)
    const gameSessionChannel = supabase
      .channel('wheel-game-sessions')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'wheel_game_sessions'
      }, (payload) => {
        console.log('Game session real-time update:', payload);
        // Navigate both players to the game when a session is created
        if (payload.new) {
          const session = payload.new as any;
          console.log('Session created for players:', session.player1_id, session.player2_id, 'Current user:', user.id);
          
          // Check if current user is one of the players
          if (session.player1_id === user.id || session.player2_id === user.id) {
            console.log('Current user is a player in this session, navigating to game:', session.id);
            toast({
              title: "Game starting!",
              description: "You're being taken to the game room...",
            });
            navigate(`/wheel/play/${session.id}`);
          }
        }
      })
      .subscribe();

    // Initial fetch
    fetchOnlinePlayers();
    fetchChallenges();

    // Refresh players every 30 seconds
    const interval = setInterval(fetchOnlinePlayers, 30000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(playersChannel);
      supabase.removeChannel(challengesChannel);
      supabase.removeChannel(gameSessionChannel);
    };
  }, [user, fetchOnlinePlayers, fetchChallenges, navigate]);

  return {
    onlinePlayers,
    incomingChallenges,
    outgoingChallenges,
    loading,
    sendChallenge,
    acceptChallenge,
    declineChallenge,
    cancelChallenge,
    fetchOnlinePlayers,
    fetchChallenges
  };
};