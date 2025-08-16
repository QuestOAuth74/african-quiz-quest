import { useState, useEffect } from 'react';
import { Users, Clock, Zap, Crown, ArrowLeft, Send, Check, X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePlayerLobby } from '@/hooks/usePlayerLobby';
import { useAuth } from '@/hooks/useAuth';
import { useGameRoom } from '@/hooks/useGameRoom';
import { GameConfigModal } from './GameConfigModal';
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
  
  const { createRoom, addPlayerToRoom, findActiveGame, loading: roomLoading } = useGameRoom();
  const [activeGame, setActiveGame] = useState<any>(null);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [challengeTarget, setChallengeTarget] = useState<any>(null);

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

  const handleChallengePlayer = (player: any) => {
    setChallengeTarget(player);
    setConfigModalOpen(true);
  };

  const handleSendConfiguredChallenge = async (config: { categories: string[]; rowCount: number }) => {
    if (!user || !challengeTarget) return;
    
    try {
      await sendMatchRequest(challengeTarget.user_id, config);
      toast.success(`Challenge sent to ${challengeTarget.display_name}!`);
      setConfigModalOpen(false);
      setChallengeTarget(null);
    } catch (error) {
      console.error('Failed to send challenge:', error);
      toast.error('Failed to send challenge');
      setConfigModalOpen(false);
      setChallengeTarget(null);
    }
  };

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

      // Find the requester to add them to the room
      const request = matchmakingRequests.find(req => req.id === requestId);
      const requester = onlinePlayers.find(p => p.user_id === request?.requester_id);

      if (request?.requester_id && requester) {
        // Add the requester to the room
        const requesterAdded = await addPlayerToRoom(
          room.id, 
          request.requester_id, 
          requester.display_name || 'Player'
        );

        if (!requesterAdded) {
          toast.error('Failed to add requester to room');
          return;
        }
      }

      // Update both players' status to 'in_game'
      await updatePlayerStatus('in_game');

      // Create players array for the game
      const players = [
        { 
          id: user?.id, 
          name: 'You', 
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

  const handleRejoinGame = () => {
    if (activeGame) {
      // Create minimal players array for rejoining
      const players = [
        { 
          id: user?.id, 
          name: 'You', 
          score: 0,
          user_id: user?.id 
        }
      ];
      onMatchFound(activeGame.id, players);
    }
  };

  // Check for active games on component mount
  useEffect(() => {
    const checkActiveGame = async () => {
      const game = await findActiveGame();
      setActiveGame(game);
    };

    if (user) {
      checkActiveGame();
    }
  }, [user, findActiveGame]);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-2 sm:p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <Button
              onClick={onBack}
              variant="outline"
              size="sm"
              className="text-white border-white/20 flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400 flex-shrink-0" />
                <span className="truncate">Live Multiplayer Lobby</span>
              </h1>
              <p className="text-blue-200 text-sm sm:text-base">Find players to challenge in real-time!</p>
            </div>
          </div>

          {/* Status indicator and controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full animate-pulse ${getStatusColor(currentStatus)}`} />
              <span className="text-white capitalize text-sm sm:text-base">{currentStatus}</span>
            </div>
            
            {/* Active game indicator */}
            {activeGame && (
              <Button
                onClick={handleRejoinGame}
                className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                size="sm"
              >
                <Crown className="w-4 h-4 mr-2" />
                <span className="truncate">Rejoin Game ({activeGame.room_code})</span>
              </Button>
            )}
            
            {/* Queue controls */}
            {!activeGame && (currentStatus === 'waiting' ? (
              <Button
                onClick={leaveWaitingLobby}
                variant="outline"
                size="sm"
                className="text-yellow-400 border-yellow-400 w-full sm:w-auto"
              >
                Leave Queue
              </Button>
            ) : (
              <Button
                onClick={enterWaitingLobby}
                className="bg-yellow-600 hover:bg-yellow-700 w-full sm:w-auto"
                size="sm"
              >
                Join Queue
              </Button>
            ))}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-col sm:flex-row gap-2 mb-6 overflow-x-auto">
          <Button
            onClick={() => setSelectedTab('lobby')}
            variant={selectedTab === 'lobby' ? 'default' : 'outline'}
            className={`${selectedTab === 'lobby' ? 'bg-blue-600' : 'text-white border-white/20'} whitespace-nowrap text-sm`}
          >
            <Users className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Online Players </span>({onlinePlayers.length})
          </Button>
          <Button
            onClick={() => setSelectedTab('waiting')}
            variant={selectedTab === 'waiting' ? 'default' : 'outline'}
            className={`${selectedTab === 'waiting' ? 'bg-yellow-600' : 'text-white border-white/20'} whitespace-nowrap text-sm`}
          >
            <Clock className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Waiting </span>({waitingPlayers.length})
          </Button>
          <Button
            onClick={() => setSelectedTab('requests')}
            variant={selectedTab === 'requests' ? 'default' : 'outline'}
            className={`${selectedTab === 'requests' ? 'bg-green-600' : 'text-white border-white/20'} whitespace-nowrap text-sm`}
          >
            <Send className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Requests </span>({incomingRequests.length + outgoingRequests.length})
            {incomingRequests.length > 0 && (
              <Badge variant="destructive" className="ml-1 sm:ml-2 text-xs">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {onlinePlayers.map((player) => (
                    <Card key={player.user_id} className="bg-white/10 border-white/20">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                            <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                              <AvatarFallback className="bg-blue-600 text-white text-sm">
                                {getPlayerDisplayName(player).charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <h3 className="text-white font-medium text-sm sm:text-base truncate">
                                {getPlayerDisplayName(player)}
                              </h3>
                              <div className="flex items-center gap-1 sm:gap-2">
                                <div className={`w-2 h-2 rounded-full ${getStatusColor(player.player_status)}`} />
                                <span className="text-xs sm:text-sm text-gray-300 capitalize">
                                  {player.player_status}
                                </span>
                              </div>
                            </div>
                          </div>
                          {player.user_id !== user?.id && player.is_online && (
                            <Button
                              onClick={() => handleChallengePlayer(player)}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 flex-shrink-0 text-xs sm:text-sm px-2 sm:px-3"
                            >
                              <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              <span className="hidden sm:inline">
                                {player.player_status === 'waiting' ? 'Challenge' : 'Request Match'}
                              </span>
                              <span className="sm:hidden">+</span>
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
                            onClick={() => handleChallengePlayer(player)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Settings className="w-4 h-4 mr-1" />
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

      {/* Game Configuration Modal */}
      <GameConfigModal
        isOpen={configModalOpen}
        onClose={() => {
          setConfigModalOpen(false);
          setChallengeTarget(null);
        }}
        onConfirm={handleSendConfiguredChallenge}
        playerName={challengeTarget?.display_name || 'Player'}
      />
    </div>
  );
};