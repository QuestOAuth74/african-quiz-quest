import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Star, Home } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WheelGameCompletionModalProps {
  isOpen: boolean;
  winnerName: string;
  winnerScore: number;
  puzzle: string;
  category: string;
  onReturnToLobby: () => void;
}

export const WheelGameCompletionModal: React.FC<WheelGameCompletionModalProps> = ({
  isOpen,
  winnerName,
  winnerScore,
  puzzle,
  category,
  onReturnToLobby
}) => {
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

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-md mx-auto animate-scale-in">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <Trophy className="h-16 w-16 text-yellow-500" />
              <Star className="h-6 w-6 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-primary">
            🎉 Puzzle Solved! 🎉
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6 text-center">
          <div className="space-y-2">
            <p className="text-lg font-semibold text-foreground">
              {winnerName} wins!
            </p>
            <p className="text-2xl font-bold text-primary">
              ${winnerScore.toLocaleString()}
            </p>
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