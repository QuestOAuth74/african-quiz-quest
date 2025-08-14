import { useState } from 'react';
// Remove framer-motion import since it's not available
import { ArrowLeft, Users, Copy, Crown, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGameRoom } from '@/hooks/useGameRoom';
import { toast } from 'sonner';

interface OnlineMultiplayerLobbyProps {
  onBack: () => void;
  onGameStart: (roomId: string, players: any[]) => void;
  gameConfig: {
    categories: string[];
    rowCount: number;
  };
}

export const OnlineMultiplayerLobby = ({ 
  onBack, 
  onGameStart, 
  gameConfig 
}: OnlineMultiplayerLobbyProps) => {
  const [joinCode, setJoinCode] = useState('');
  const [mode, setMode] = useState<'menu' | 'create' | 'join' | 'waiting'>('menu');
  
  const {
    currentRoom,
    players,
    loading,
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
    isHost,
    canStart
  } = useGameRoom();

  const handleCreateRoom = async () => {
    setMode('create');
    const room = await createRoom(gameConfig);
    if (room) {
      setMode('waiting');
    } else {
      setMode('menu');
    }
  };

  const handleJoinRoom = async () => {
    if (!joinCode.trim()) {
      toast.error('Please enter a room code');
      return;
    }
    
    const success = await joinRoom(joinCode.trim());
    if (success) {
      setMode('waiting');
    }
  };

  const handleCopyRoomCode = () => {
    if (currentRoom) {
      navigator.clipboard.writeText(currentRoom.room_code);
      toast.success('Room code copied to clipboard!');
    }
  };

  const handleStartGame = async () => {
    const success = await startGame();
    if (success && currentRoom) {
      onGameStart(currentRoom.id, players);
    }
  };

  const handleLeaveRoom = async () => {
    await leaveRoom();
    setMode('menu');
  };

  if (mode === 'waiting' && currentRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-white">
                Game Room: {currentRoom.room_code}
              </CardTitle>
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyRoomCode}
                  className="text-white border-white/20"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Code
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Players List */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  Players ({players.length}/{currentRoom.max_players})
                </h3>
                <div className="space-y-2">
                  {players.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                    >
                      <div className="flex items-center gap-3">
                        {player.is_host && (
                          <Crown className="w-5 h-5 text-yellow-400" />
                        )}
                        <span className="text-white font-medium">
                          {player.player_name}
                        </span>
                        {player.is_host && (
                          <Badge variant="secondary" className="text-xs">
                            Host
                          </Badge>
                        )}
                      </div>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Game Status */}
              <div className="text-center">
                {currentRoom.status === 'waiting' && (
                  <div className="space-y-4">
                    {isHost ? (
                      <div className="space-y-2">
                        <p className="text-blue-200">
                          Waiting for players to join...
                        </p>
                        {canStart && (
                          <Button
                            onClick={handleStartGame}
                            disabled={loading}
                            className="w-full bg-green-600 hover:bg-green-700"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Start Game
                          </Button>
                        )}
                        {!canStart && players.length < 2 && (
                          <p className="text-yellow-300 text-sm">
                            Need at least 2 players to start
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-blue-200">
                        Waiting for host to start the game...
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={handleLeaveRoom}
                  variant="outline"
                  className="flex-1 text-white border-white/20"
                >
                  Leave Room
                </Button>
                <Button
                  onClick={onBack}
                  variant="outline"
                  className="text-white border-white/20"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white flex items-center justify-center gap-2">
              <Users className="w-6 h-6" />
              Online Multiplayer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mode === 'menu' && (
              <>
                <Button
                  onClick={handleCreateRoom}
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  Create Room
                </Button>
                <div className="text-center text-white/70">or</div>
                <div className="space-y-2">
                  <Input
                    placeholder="Enter room code"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    className="text-center bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    maxLength={6}
                  />
                  <Button
                    onClick={handleJoinRoom}
                    disabled={loading || !joinCode.trim()}
                    variant="outline"
                    className="w-full text-white border-white/20"
                  >
                    Join Room
                  </Button>
                </div>
              </>
            )}

            {mode === 'join' && (
              <div className="space-y-4">
                <Input
                  placeholder="Enter 6-digit room code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="text-center text-lg bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  maxLength={6}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => setMode('menu')}
                    variant="outline"
                    className="flex-1 text-white border-white/20"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleJoinRoom}
                    disabled={loading || !joinCode.trim()}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    Join
                  </Button>
                </div>
              </div>
            )}

            {mode === 'menu' && (
              <Button
                onClick={onBack}
                variant="outline"
                className="w-full text-white border-white/20"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Game Modes
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};