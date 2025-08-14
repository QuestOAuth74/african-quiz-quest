import { useState, useEffect } from 'react';
import { Users, Clock, Zap, Crown, ArrowLeft, Send, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePlayerLobby } from '@/hooks/usePlayerLobby';
import { useAuth } from '@/hooks/useAuth';
import { useGameRoom } from '@/hooks/useGameRoom';
import { toast } from 'sonner';

interface LiveLobbyProps {
  onBack: () => void;
  onMatchFound: (roomId: string, players: any[]) => void;
  gameConfig: {
    categories: string[];
    rowCount: number;
  };
}

export const LiveLobby = ({ onBack, onMatchFound, gameConfig }: LiveLobbyProps) => {
  const { user } = useAuth();
  const {
    onlinePlayers,
    waitingPlayers,
    matchmakingRequests,
    currentStatus,
    enterWaitingLobby,
    leaveWaitingLobby,
    sendMatchRequest,
    respondToMatchRequest,
    updatePlayerStatus
  } = usePlayerLobby();
  
  const { createRoom, loading: roomLoading } = useGameRoom();

  // Debug logging
  console.log('LiveLobby Debug:', {
    user: user ? { id: user.id, email: user.email } : null,
    onlinePlayers: onlinePlayers.length,
    waitingPlayers: waitingPlayers.length,
    matchmakingRequests: matchmakingRequests.length,
    currentStatus
  });

  const [selectedTab, setSelectedTab] = useState<'lobby' | 'waiting' | 'requests'>('lobby');

  // Auto-switch to requests tab when new requests come in
  useEffect(() => {
    const incomingRequests = matchmakingRequests.filter(req => 
      req.target_id === user?.id && req.status === 'pending'
    );
    if (incomingRequests.length > 0) {
      setSelectedTab('requests');
    }
  }, [matchmakingRequests, user?.id]);

  const handleSendMatchRequest = async (targetUserId: string) => {
    const success = await sendMatchRequest(targetUserId, gameConfig);
    if (success) {
      toast.success('Match request sent! Waiting for response...');
    }
  };

  const handleMatchResponse = async (requestId: string, accept: boolean) => {
    if (!accept) {
      await respondToMatchRequest(requestId, false);
      toast.info('Match request declined');
      return;
    }

    try {
      // Accept the match request first
      const success = await respondToMatchRequest(requestId, true);
      if (!success) {
        toast.error('Failed to accept match request');
        return;
      }

      // Create a real game room
      const room = await createRoom(gameConfig);
      if (!room) {
        toast.error('Failed to create game room');
        return;
      }

      // Update both players' status to 'in_game'
      await updatePlayerStatus('in_game');

      // Find the requester to get their info
      const request = matchmakingRequests.find(req => req.id === requestId);
      const requester = onlinePlayers.find(p => p.user_id === request?.requester_id);

      // Create players array for the game
      const players = [
        { 
          id: user?.id, 
          name: user?.email?.split('@')[0] || 'You', 
          score: 0,
          user_id: user?.id 
        },
        { 
          id: request?.requester_id, 
          name: requester?.display_name || 'Player', 
          score: 0,
          user_id: request?.requester_id 
        }
      ];

      toast.success('Match accepted! Joining game room...');
      onMatchFound(room.id, players);
    } catch (error) {
      console.error('Error handling match response:', error);
      toast.error('Failed to start game. Please try again.');
    }
  };

  const getPlayerDisplayName = (player: any) => {
    return player.display_name || 'Anonymous';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'waiting': return 'bg-yellow-500';
      case 'in_game': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const incomingRequests = matchmakingRequests.filter(req => 
    req.target_id === user?.id && req.status === 'pending'
  );
  const outgoingRequests = matchmakingRequests.filter(req => 
    req.requester_id === user?.id && req.status === 'pending'
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={onBack}
              variant="outline"
              size="sm"
              className="text-white border-white/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                <Zap className="w-8 h-8 text-yellow-400" />
                Live Multiplayer Lobby
              </h1>
              <p className="text-blue-200">Find players to challenge in real-time!</p>
            </div>
          </div>

          {/* Status indicator */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full animate-pulse ${getStatusColor(currentStatus)}`} />
              <span className="text-white capitalize">{currentStatus}</span>
            </div>
            {currentStatus === 'waiting' ? (
              <Button
                onClick={leaveWaitingLobby}
                variant="outline"
                size="sm"
                className="text-yellow-400 border-yellow-400"
              >
                Leave Queue
              </Button>
            ) : (
              <Button
                onClick={enterWaitingLobby}
                className="bg-yellow-600 hover:bg-yellow-700"
                size="sm"
              >
                Join Queue
              </Button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => setSelectedTab('lobby')}
            variant={selectedTab === 'lobby' ? 'default' : 'outline'}
            className={selectedTab === 'lobby' ? 'bg-blue-600' : 'text-white border-white/20'}
          >
            <Users className="w-4 h-4 mr-2" />
            Online Players ({onlinePlayers.length})
          </Button>
          <Button
            onClick={() => setSelectedTab('waiting')}
            variant={selectedTab === 'waiting' ? 'default' : 'outline'}
            className={selectedTab === 'waiting' ? 'bg-yellow-600' : 'text-white border-white/20'}
          >
            <Clock className="w-4 h-4 mr-2" />
            Waiting to Play ({waitingPlayers.length})
          </Button>
          <Button
            onClick={() => setSelectedTab('requests')}
            variant={selectedTab === 'requests' ? 'default' : 'outline'}
            className={selectedTab === 'requests' ? 'bg-green-600' : 'text-white border-white/20'}
          >
            <Send className="w-4 h-4 mr-2" />
            Match Requests ({incomingRequests.length + outgoingRequests.length})
            {incomingRequests.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {incomingRequests.length}
              </Badge>
            )}
          </Button>
        </div>

        {/* Content based on selected tab */}
        <div className="grid grid-cols-1 gap-4">
          {selectedTab === 'lobby' && (
            <>
              <h2 className="text-xl font-semibold text-white mb-4">
                All Online Players ({onlinePlayers.length})
              </h2>
              {onlinePlayers.length === 0 ? (
                <Card className="bg-white/10 border-white/20">
                  <CardContent className="p-8 text-center">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-300 text-lg">No players online right now</p>
                    <p className="text-gray-400">Be the first to join the lobby!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {onlinePlayers.map((player) => (
                    <Card key={player.user_id} className="bg-white/10 border-white/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-blue-600 text-white">
                                {getPlayerDisplayName(player).charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="text-white font-medium">
                                {getPlayerDisplayName(player)}
                              </h3>
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${getStatusColor(player.player_status)}`} />
                                <span className="text-sm text-gray-300 capitalize">
                                  {player.player_status}
                                </span>
                              </div>
                            </div>
                          </div>
                          {player.player_status === 'waiting' && player.user_id !== user?.id && (
                            <Button
                              onClick={() => handleSendMatchRequest(player.user_id)}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Challenge
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}

          {selectedTab === 'waiting' && (
            <>
              <h2 className="text-xl font-semibold text-white mb-4">
                Players Waiting to Play ({waitingPlayers.length})
              </h2>
              {waitingPlayers.length === 0 ? (
                <Card className="bg-white/10 border-white/20">
                  <CardContent className="p-8 text-center">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-300 text-lg">No players waiting</p>
                    <p className="text-gray-400">Join the queue to be matched with other players!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {waitingPlayers.map((player) => (
                    <Card key={player.user_id} className="bg-white/10 border-white/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-yellow-600 text-white">
                                {getPlayerDisplayName(player).charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="text-white font-medium">
                                {getPlayerDisplayName(player)}
                              </h3>
                              <div className="flex items-center gap-2">
                                <Clock className="w-3 h-3 text-yellow-400" />
                                <span className="text-sm text-yellow-400">Waiting to play</span>
                              </div>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleSendMatchRequest(player.user_id)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Challenge
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}

          {selectedTab === 'requests' && (
            <>
              {/* Incoming Requests */}
              {incomingRequests.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-white mb-4">
                    Incoming Match Requests ({incomingRequests.length})
                  </h2>
                  <div className="space-y-3">
                    {incomingRequests.map((request) => {
                      const requester = onlinePlayers.find(p => p.user_id === request.requester_id);
                      return (
                        <Card key={request.id} className="bg-green-500/20 border-green-500/30">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarFallback className="bg-green-600 text-white">
                                    {getPlayerDisplayName(requester || {}).charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="text-white font-medium">
                                    {getPlayerDisplayName(requester || {})} wants to play!
                                  </h3>
                                  <p className="text-green-200 text-sm">
                                    African History • {gameConfig.categories.length} categories
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleMatchResponse(request.id, true)}
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <Check className="w-4 h-4 mr-2" />
                                  Accept
                                </Button>
                                <Button
                                  onClick={() => handleMatchResponse(request.id, false)}
                                  size="sm"
                                  variant="outline"
                                  className="text-red-400 border-red-400"
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  Decline
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Outgoing Requests */}
              {outgoingRequests.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-white mb-4">
                    Sent Match Requests ({outgoingRequests.length})
                  </h2>
                  <div className="space-y-3">
                    {outgoingRequests.map((request) => {
                      const target = onlinePlayers.find(p => p.user_id === request.target_id);
                      return (
                        <Card key={request.id} className="bg-blue-500/20 border-blue-500/30">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarFallback className="bg-blue-600 text-white">
                                    {getPlayerDisplayName(target || {}).charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="text-white font-medium">
                                    Waiting for {getPlayerDisplayName(target || {})}
                                  </h3>
                                  <p className="text-blue-200 text-sm">
                                    Request sent • Waiting for response...
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-blue-400 animate-pulse" />
                                <span className="text-blue-400 text-sm">Pending</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {incomingRequests.length === 0 && outgoingRequests.length === 0 && (
                <Card className="bg-white/10 border-white/20">
                  <CardContent className="p-8 text-center">
                    <Send className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-300 text-lg">No match requests</p>
                    <p className="text-gray-400">Challenge other players to start a match!</p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};