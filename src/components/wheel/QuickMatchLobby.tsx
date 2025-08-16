import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, Timer } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface QuickMatchLobbyProps {
  onMatchFound: (sessionId: string) => void;
  onBack: () => void;
}

export const QuickMatchLobby = ({ onMatchFound, onBack }: QuickMatchLobbyProps) => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchTime, setSearchTime] = useState(0);
  const [playersInQueue, setPlayersInQueue] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSearching) {
      interval = setInterval(() => {
        setSearchTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSearching]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startQuickMatch = async () => {
    if (!user) return;

    setIsSearching(true);
    setSearchTime(0);

    try {
      // Update player status to waiting
      await supabase
        .from('profiles')
        .update({ player_status: 'waiting' })
        .eq('user_id', user.id);

      // Look for another waiting player
      const { data: waitingPlayers, error } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .eq('player_status', 'waiting')
        .neq('user_id', user.id)
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (waitingPlayers) {
        // Match found! Create game session
        const { data: gameSession, error: sessionError } = await supabase
          .from('wheel_game_sessions')
          .insert({
            player1_id: user.id,
            player2_id: waitingPlayers.user_id,
            game_mode: 'live-multiplayer',
            status: 'active'
          })
          .select()
          .single();

        if (sessionError) throw sessionError;

        // Update both players' status
        await Promise.all([
          supabase
            .from('profiles')
            .update({ player_status: 'in_game' })
            .eq('user_id', user.id),
          supabase
            .from('profiles')
            .update({ player_status: 'in_game' })
            .eq('user_id', waitingPlayers.user_id)
        ]);

        onMatchFound(gameSession.id);
      } else {
        // No match found, keep waiting
        // Set up real-time listener for new waiting players
        const channel = supabase
          .channel('waiting_players')
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'profiles',
              filter: `player_status=eq.waiting`
            },
            async (payload) => {
              if (payload.new.user_id !== user.id && isSearching) {
                // Match found!
                const { data: gameSession, error: sessionError } = await supabase
                  .from('wheel_game_sessions')
                  .insert({
                    player1_id: user.id,
                    player2_id: payload.new.user_id,
                    game_mode: 'live-multiplayer',
                    status: 'active'
                  })
                  .select()
                  .single();

                if (!sessionError) {
                  await Promise.all([
                    supabase
                      .from('profiles')
                      .update({ player_status: 'in_game' })
                      .eq('user_id', user.id),
                    supabase
                      .from('profiles')
                      .update({ player_status: 'in_game' })
                      .eq('user_id', payload.new.user_id)
                  ]);

                  onMatchFound(gameSession.id);
                }
              }
            }
          )
          .subscribe();

        // Clean up after 60 seconds if no match found
        setTimeout(() => {
          if (isSearching) {
            stopSearching();
            channel.unsubscribe();
          }
        }, 60000);
      }
    } catch (error) {
      console.error('Error starting quick match:', error);
      setIsSearching(false);
    }
  };

  const stopSearching = async () => {
    if (!user) return;

    setIsSearching(false);
    setSearchTime(0);

    // Update player status back to online
    await supabase
      .from('profiles')
      .update({ player_status: 'online' })
      .eq('user_id', user.id);
  };

  const fetchQueueSize = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('player_status', 'waiting');

    if (!error && data) {
      setPlayersInQueue(data.length);
    }
  };

  useEffect(() => {
    fetchQueueSize();
    const interval = setInterval(fetchQueueSize, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-md mx-auto space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Users className="w-5 h-5" />
            Quick Match
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Badge variant="outline">
                {playersInQueue} players in queue
              </Badge>
            </div>
            
            {isSearching && (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Searching for opponent...</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Timer className="w-4 h-4" />
                  {formatTime(searchTime)}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            {!isSearching ? (
              <Button onClick={startQuickMatch} className="w-full">
                Find Opponent
              </Button>
            ) : (
              <Button onClick={stopSearching} variant="outline" className="w-full">
                Cancel Search
              </Button>
            )}
            
            <Button onClick={onBack} variant="ghost" className="w-full">
              Back to Game Modes
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            <p>Quick match will automatically pair you with another player looking for a game.</p>
            <p className="mt-1">Search will timeout after 60 seconds.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
