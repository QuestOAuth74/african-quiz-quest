import { useState } from 'react';
import { ArrowLeft, Users, Copy, Crown, Play, Zap, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGameRoom } from '@/hooks/useGameRoom';
import { LiveLobby } from './LiveLobby';
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
  const [mode, setMode] = useState<'menu' | 'create' | 'join' | 'waiting' | 'live-lobby'>('menu');
  
  const {
    currentRoom,
    players,
    loading,
    createRoom,
    joinRoom,
    leaveRoom,
    deleteRoom,
    startGame,
    isHost,
    canStart,
    canDelete
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

  const handleEnterLiveLobby = () => {
    setMode('live-lobby');
  };

  if (mode === 'live-lobby') {
    return (
      <LiveLobby
        onBack={() => setMode('menu')}
        onMatchFound={onGameStart}
        gameConfig={gameConfig}
      />
    );
  }

  const handleLeaveRoom = async () => {
    await leaveRoom();
    setMode('menu');
  };

  const handleDeleteRoom = async () => {
    const success = await deleteRoom();
    if (success) {
      setMode('menu');
    }
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
                  {isHost ? 'Exit Room' : 'Leave Room'}
                </Button>
                {canDelete && (
                  <Button
                    onClick={handleDeleteRoom}
                    variant="destructive"
                    className="text-white"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
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
                  onClick={handleEnterLiveLobby}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 mb-4"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Enter Live Lobby
                </Button>
                <div className="text-center text-white/70 text-sm mb-4">Quick match with waiting players</div>
                
                <div className="text-center text-white/50 mb-4">or</div>
                
                <Button
                  onClick={handleCreateRoom}
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 mb-4"
                >
                  Create Private Room
                </Button>
                <div className="text-center text-white/70">or</div>
                <div className="space-y-2">
                  <div className="text-sm text-white/60 text-center">Have an invitation code?</div>
                  <Input
                    placeholder="Enter 6-digit code"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                    className="text-center tracking-widest text-lg bg-white/10 border-white/20 text-white placeholder:text-white/50 font-mono"
                    maxLength={6}
                  />
                  <Button
                    onClick={handleJoinRoom}
                    disabled={loading || joinCode.length !== 6}
                    variant="outline"
                    className="w-full text-white border-white/20 hover:bg-white/10"
                  >
                    {loading ? 'Joining...' : 'Join with Code'}
                  </Button>
                </div>
              </>
            )}

            {mode === 'join' && (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-white mb-2">Join Private Room</h3>
                  <p className="text-sm text-white/60">Enter the invitation code shared by the host</p>
                </div>
                <Input
                  placeholder="XXXXXX"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                  className="text-center text-2xl tracking-widest bg-white/10 border-white/20 text-white placeholder:text-white/30 font-mono h-14"
                  maxLength={6}
                  autoFocus
                />
                <div className="text-xs text-white/50 text-center">
                  {joinCode.length}/6 characters
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setMode('menu')}
                    variant="outline"
                    className="flex-1 text-white border-white/20 hover:bg-white/10"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleJoinRoom}
                    disabled={loading || joinCode.length !== 6}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    {loading ? 'Joining...' : 'Join Room'}
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