import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, User } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  totalScore: number;
  roundScore: number;
  roundsWon: number;
}

interface PlayerScoreboardProps {
  player1: Player;
  player2: Player;
  currentPlayerTurn: number;
  gameStatus: string;
}

export const PlayerScoreboard: React.FC<PlayerScoreboardProps> = ({
  player1,
  player2,
  currentPlayerTurn,
  gameStatus
}) => {
  const renderPlayerCard = (player: Player, playerNumber: number) => {
    const isCurrentTurn = currentPlayerTurn === playerNumber;
    const isLeader = player.totalScore > (playerNumber === 1 ? player2.totalScore : player1.totalScore);

    return (
      <Card className={`transition-all duration-300 ${
        isCurrentTurn ? 'ring-2 ring-primary shadow-lg' : ''
      }`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Player {playerNumber}</span>
              {isLeader && player.totalScore > 0 && (
                <Crown className="h-4 w-4 text-yellow-500" />
              )}
            </div>
            {isCurrentTurn && (
              <Badge variant="default" className="animate-pulse">
                Current Turn
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Total Score</div>
            <div className="text-2xl font-bold text-primary">
              ${player.totalScore.toLocaleString()}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Round Score</div>
            <div className="text-lg font-semibold">
              ${player.roundScore.toLocaleString()}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Rounds Won</div>
            <div className="text-lg font-semibold text-secondary-foreground">
              {player.roundsWon} / 3
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-primary">Wheel of African Destiny</h2>
        <Badge variant="outline" className="mt-2">
          {gameStatus === 'playing' ? 'Game in Progress' : 
           gameStatus === 'finished' ? 'Game Finished' : 'Waiting to Start'}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderPlayerCard(player1, 1)}
        {renderPlayerCard(player2, 2)}
      </div>
      
      {gameStatus === 'playing' && (
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <div className="text-lg font-semibold">
            {currentPlayerTurn === 1 ? player1.name : player2.name}'s Turn
          </div>
          <div className="text-sm text-muted-foreground">
            First to win 3 rounds wins the game!
          </div>
        </div>
      )}
    </div>
  );
};