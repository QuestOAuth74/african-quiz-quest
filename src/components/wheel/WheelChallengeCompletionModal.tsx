import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Star, Home, Crown, Medal } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '@/hooks/useAuth';

interface WheelChallengeCompletionModalProps {
  isOpen: boolean;
  player1Name: string;
  player2Name: string;
  player1Score: number;
  player2Score: number;
  puzzle: string;
  category: string;
  player1Id: string;
  player2Id: string;
  onReturnToLobby: () => void;
}

export const WheelChallengeCompletionModal: React.FC<WheelChallengeCompletionModalProps> = ({
  isOpen,
  player1Name,
  player2Name,
  player1Score,
  player2Score,
  puzzle,
  category,
  player1Id,
  player2Id,
  onReturnToLobby
}) => {
  const { user } = useAuth();

  // Determine winner
  const player1Won = player1Score > player2Score;
  const player2Won = player2Score > player1Score;
  const isTie = player1Score === player2Score;
  
  // Check if current user won
  const currentUserWon = user && (
    (user.id === player1Id && player1Won) ||
    (user.id === player2Id && player2Won)
  );

  useEffect(() => {
    if (isOpen) {
      // Trigger confetti animation
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        // Left side confetti
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });

        // Right side confetti
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getResultMessage = () => {
    if (isTie) return "🤝 It's a Tie! 🤝";
    return currentUserWon ? "🎉 You Won! 🎉" : "😔 You Lost 😔";
  };

  const getResultIcon = () => {
    if (isTie) return <Star className="h-16 w-16 text-yellow-500" />;
    return currentUserWon ? (
      <Trophy className="h-16 w-16 text-yellow-500" />
    ) : (
      <Medal className="h-16 w-16 text-muted-foreground" />
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-lg mx-auto animate-scale-in">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              {getResultIcon()}
              <Star className="h-6 w-6 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-primary">
            {getResultMessage()}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6 text-center">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Final Scores</h3>
            
            {/* Player 1 Score */}
            <div className={`flex items-center justify-between p-3 rounded-lg ${
              player1Won ? 'bg-yellow-500/20 border border-yellow-500/30' : 'bg-muted/20'
            }`}>
              <div className="flex items-center space-x-2">
                {player1Won && <Crown className="h-5 w-5 text-yellow-500" />}
                <span className="font-medium">{player1Name}</span>
              </div>
              <span className="text-lg font-bold">${player1Score.toLocaleString()}</span>
            </div>

            {/* Player 2 Score */}
            <div className={`flex items-center justify-between p-3 rounded-lg ${
              player2Won ? 'bg-yellow-500/20 border border-yellow-500/30' : 'bg-muted/20'
            }`}>
              <div className="flex items-center space-x-2">
                {player2Won && <Crown className="h-5 w-5 text-yellow-500" />}
                <span className="font-medium">{player2Name}</span>
              </div>
              <span className="text-lg font-bold">${player2Score.toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-2 p-4 bg-muted/20 rounded-lg">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {category}
            </p>
            <p className="text-lg font-bold text-foreground">
              "{puzzle}"
            </p>
          </div>

          <div className="flex flex-col space-y-3">
            <Button 
              onClick={onReturnToLobby}
              className="w-full flex items-center justify-center space-x-2"
              size="lg"
            >
              <Home className="h-4 w-4" />
              <span>Return to Lobby</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};