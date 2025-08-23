import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useOwareMultiplayer } from '@/hooks/useOwareMultiplayer';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Plus, Users, Clock, Crown } from 'lucide-react';
import { format } from 'date-fns';

interface OwareMultiplayerLobbyProps {
  onBack: () => void;
  onGameStart: (gameId: string, isHost: boolean) => void;
}

export const OwareMultiplayerLobby = ({ onBack, onGameStart }: OwareMultiplayerLobbyProps) => {
  const { user } = useAuth();
  const {
    currentGame,
    availableGames,
    loading,
    isHost,
    createGame,
    joinGame,
    leaveGame,
  } = useOwareMultiplayer();
  
  const [joiningGameId, setJoiningGameId] = useState<string | null>(null);

  const handleCreateGame = async () => {
    const gameId = await createGame();
    if (gameId) {
      onGameStart(gameId, true);
    }
  };

  const handleJoinGame = async (gameId: string) => {
    setJoiningGameId(gameId);
    const success = await joinGame(gameId);
    if (success) {
      onGameStart(gameId, false);
    }
    setJoiningGameId(null);
  };

  const handleLeaveGame = async () => {
    await leaveGame();
  };

  // If user is in a game, show game status
  if (currentGame) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Current Game</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Game Room</span>
              <Badge variant={currentGame.status === 'waiting' ? 'secondary' : 'default'}>
                {currentGame.status === 'waiting' ? 'Waiting' : 'In Progress'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-500" />
              <span className="font-medium">Host:</span>
              <span>{isHost ? 'You' : 'Opponent'}</span>
            </div>
            
            {currentGame.status === 'waiting' && (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  {isHost ? 'Waiting for an opponent to join...' : 'Joining game...'}
                </p>
                <div className="animate-pulse flex justify-center space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animation-delay-200"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animation-delay-400"></div>
                </div>
              </div>
            )}
            
            {currentGame.status === 'active' && (
              <div className="text-center py-4">
                <p className="text-green-600 font-medium">Game is ready!</p>
                <Button 
                  onClick={() => onGameStart(currentGame.id, isHost)}
                  className="mt-4"
                >
                  Enter Game
                </Button>
              </div>
            )}
            
            <div className="flex justify-center">
              <Button variant="outline" onClick={handleLeaveGame}>
                Leave Game
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Multiplayer Lobby</h1>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Create Game */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create Game
            </CardTitle>
            <CardDescription>
              Start a new game and invite others to join
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleCreateGame} 
              disabled={loading || !user}
              className="w-full"
            >
              {loading ? 'Creating...' : 'Create New Game'}
            </Button>
            {!user && (
              <p className="text-sm text-muted-foreground mt-2 text-center">
                Please log in to create games
              </p>
            )}
          </CardContent>
        </Card>

        {/* Join Game */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Available Games ({availableGames.length})
            </CardTitle>
            <CardDescription>
              Join an existing game waiting for players
            </CardDescription>
          </CardHeader>
          <CardContent>
            {availableGames.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No games available</p>
                <p className="text-sm">Create one to get started!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {availableGames.map((game) => (
                  <div key={game.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">Game #{game.id.slice(0, 8)}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{format(new Date(game.created_at), 'MMM d, HH:mm')}</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleJoinGame(game.id)}
                        disabled={joiningGameId === game.id || !user}
                      >
                        {joiningGameId === game.id ? 'Joining...' : 'Join'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Game Rules */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>How Multiplayer Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>• Create a game or join an existing one</p>
          <p>• Games are played in real-time with live updates</p>
          <p>• The game creator (host) always plays as Player 1</p>
          <p>• Take turns making moves until one player wins</p>
          <p>• You can leave a game at any time</p>
        </CardContent>
      </Card>
    </div>
  );
};