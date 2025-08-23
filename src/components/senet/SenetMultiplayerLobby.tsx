
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Crown, Copy, Share, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { SenetLobbyPlayer } from '@/types/senet';

interface SenetMultiplayerLobbyProps {
  onJoinGame?: (gameId: string) => void;
  onCreateGame?: () => void;
}

export const SenetMultiplayerLobby = ({ onJoinGame, onCreateGame }: SenetMultiplayerLobbyProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [onlinePlayers, setOnlinePlayers] = useState<SenetLobbyPlayer[]>([]);
  const [waitingGames, setWaitingGames] = useState<any[]>([]);

  // Load waiting games and online players
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      // Load waiting games
      const { data: games } = await supabase
        .from('senet_games')
        .select(`
          *,
          host_profile:profiles!senet_games_host_user_id_fkey(display_name)
        `)
        .eq('status', 'waiting')
        .eq('type', 'online_multiplayer')
        .neq('host_user_id', user.id);

      if (games) {
        setWaitingGames(games);
      }

      // Load online players
      const { data: players } = await supabase.rpc('get_online_players');
      if (players) {
        setOnlinePlayers(players.filter((p: SenetLobbyPlayer) => p.user_id !== user.id));
      }
    };

    loadData();

    // Set up real-time subscription for games
    const gamesChannel = supabase
      .channel('waiting_games')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'senet_games',
          filter: 'status=eq.waiting'
        },
        () => loadData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(gamesChannel);
    };
  }, [user]);

  const challengePlayer = async (targetPlayer: SenetLobbyPlayer) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const initialGameState = {
        id: crypto.randomUUID(),
        board: createInitialBoard(),
        players: [
          { id: 1, name: user.email || 'Player 1', pieces: [], isAI: false },
          { id: 2, name: targetPlayer.display_name || 'Player 2', pieces: [], isAI: false }
        ],
        currentPlayer: 1,
        gamePhase: 'throwing',
        lastRoll: 0,
        availableMoves: [],
        moveHistory: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isMultiplayer: true
      };

      const { data, error } = await supabase
        .from('senet_games')
        .insert({
          type: 'online_multiplayer',
          status: 'active',
          host_user_id: user.id,
          guest_user_id: targetPlayer.user_id,
          started_at: new Date().toISOString(),
          game_state: initialGameState
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Game Started!',
        description: `Challenge sent to ${targetPlayer.display_name}!`,
      });

      navigate(`/senet/play/${data.id}?mode=multiplayer`);
    } catch (error) {
      console.error('Error creating game:', error);
      toast({
        title: 'Error',
        description: 'Failed to start game',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const joinGame = async (gameId: string) => {
    if (!user) return;

    try {
      // Update game to add second player
      const updatedGameState = {
        id: crypto.randomUUID(),
        board: createInitialBoard(),
        players: [
          { id: 1, name: 'Host Player', pieces: [], isAI: false },
          { id: 2, name: user.email || 'Player 2', pieces: [], isAI: false }
        ],
        currentPlayer: 1,
        gamePhase: 'throwing',
        lastRoll: 0,
        availableMoves: [],
        moveHistory: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isMultiplayer: true
      };

      const { error } = await supabase
        .from('senet_games')
        .update({
          guest_user_id: user.id,
          status: 'active',
          started_at: new Date().toISOString(),
          game_state: updatedGameState
        })
        .eq('id', gameId);

      if (error) throw error;

      toast({
        title: 'Joined Game!',
        description: 'Game is starting...',
      });

      navigate(`/senet/play/${gameId}?mode=multiplayer`);
    } catch (error) {
      console.error('Error joining game:', error);
      toast({
        title: 'Error',
        description: 'Failed to join game',
        variant: 'destructive',
      });
    }
  };

  const copyGameLink = (gameId: string) => {
    const url = `${window.location.origin}/senet/play/${gameId}?mode=multiplayer`;
    navigator.clipboard.writeText(url);
    toast({
      title: 'Link Copied!',
      description: 'Game link copied to clipboard',
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="text-4xl">𓋹</div>
          <h1 className="text-3xl font-bold text-foreground">Senet Multiplayer</h1>
          <div className="text-4xl">𓋹</div>
        </div>
        <p className="text-muted-foreground text-lg">
          Challenge other players in the ancient Egyptian game of Senet
        </p>
      </div>

      {/* Online Players */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Online Players ({onlinePlayers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {onlinePlayers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg mb-2">
                  No other players online
                </p>
                <p className="text-sm text-muted-foreground">
                  Invite friends to play or wait for other players to join!
                </p>
              </div>
            ) : (
              onlinePlayers.map((player) => (
                <div
                  key={player.user_id}
                  className="flex items-center justify-between p-3 rounded border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <div>
                      <span className="font-medium">{player.display_name || 'Anonymous Player'}</span>
                      <div className="text-sm text-muted-foreground">
                        Ready to play
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => challengePlayer(player)}
                    disabled={isLoading}
                    size="sm"
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Swords className="h-4 w-4 mr-2" />
                    Challenge
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Available Games */}
      {waitingGames.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Games Waiting for Players
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {waitingGames.map((game) => (
                <div
                  key={game.id}
                  className="flex items-center justify-between p-3 rounded border"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-amber-500" />
                      <span className="font-medium">
                        {game.host_profile?.display_name || 'Unknown Player'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Created {new Date(game.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => copyGameLink(game.id)}
                      variant="ghost"
                      size="sm"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => joinGame(game.id)}
                      size="sm"
                    >
                      Join Game
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Helper function to create initial board
const createInitialBoard = () => {
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
