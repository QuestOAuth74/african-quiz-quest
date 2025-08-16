import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, Avatar as AvatarComponent, AvatarFallback } from '@/components/ui/avatar';
import { LobbyPlayer } from '@/types/lobby';
import { Users, Clock, UserPlus } from 'lucide-react';

interface OnlinePlayersListProps {
  players: LobbyPlayer[];
  onChallenge: (playerId: string) => void;
  loading?: boolean;
}

export const OnlinePlayersList: React.FC<OnlinePlayersListProps> = ({
  players,
  onChallenge,
  loading = false
}) => {
  if (players.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Online Players</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No other players online</p>
            <p className="text-sm">Share the game with friends to play together!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Online Players</span>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            {players.length} online
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {players.map((player) => (
            <div
              key={player.user_id}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <AvatarComponent className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {player.display_name?.charAt(0) || 'P'}
                    </AvatarFallback>
                  </AvatarComponent>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
                </div>
                
                <div>
                  <div className="font-medium">
                    {player.display_name || 'Anonymous Player'}
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>
                      {player.player_status === 'waiting' ? 'Available' : 'In Game'}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                size="sm"
                onClick={() => onChallenge(player.user_id)}
                disabled={loading || player.player_status !== 'waiting'}
                className="flex items-center space-x-1"
              >
                <UserPlus className="h-4 w-4" />
                <span>Challenge</span>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};