import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Crown, Medal, Award } from "lucide-react";
import confetti from "canvas-confetti";

interface Player {
  name: string;
  score: number;
  isActive: boolean;
}

interface GameCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  onNewGame: () => void;
  onViewLeaderboard: () => void;
}

export function GameCompletionModal({ 
  isOpen, 
  onClose, 
  players, 
  onNewGame, 
  onViewLeaderboard 
}: GameCompletionModalProps) {
  
  // Trigger confetti animation when modal opens
  useEffect(() => {
    if (isOpen) {
      // Initial burst
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Additional bursts with delay
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
      }, 250);

      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 400);

      // Final burst from the top
      setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 100,
          origin: { y: 0.3 }
        });
      }, 600);
    }
  }, [isOpen]);

  // Sort players by score to determine winner
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];
  const isPlayerWinner = winner && winner.name !== "Computer";
  const margin = sortedPlayers.length > 1 ? winner.score - sortedPlayers[1].score : 0;

  const getWinnerIcon = () => {
    if (isPlayerWinner) {
      return <Crown className="w-12 h-12 text-accent animate-pulse" />;
    } else {
      return <Trophy className="w-12 h-12 text-accent animate-pulse" />;
    }
  };

  const getWinnerMessage = () => {
    if (isPlayerWinner) {
      return "Congratulations! You Won!";
    } else {
      return "Computer Wins!";
    }
  };

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="w-6 h-6 text-accent" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold">#{position}</span>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="jeopardy-card max-w-md w-full">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getWinnerIcon()}
          </div>
          <DialogTitle className="text-2xl font-orbitron gradient-text mb-2">
            Game Complete!
          </DialogTitle>
          <div className="text-xl font-exo text-accent mb-4">
            {getWinnerMessage()}
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Winner Details */}
          <div className="text-center p-4 rounded-lg border border-accent/30 bg-accent/5">
            <div className="text-lg font-bold text-card-foreground">
              {winner?.name || "Unknown"}
            </div>
            <div className="text-2xl font-orbitron text-accent">
              ${winner?.score.toLocaleString() || 0}
            </div>
            {margin > 0 && (
              <div className="text-sm text-muted-foreground">
                Won by ${margin.toLocaleString()}
              </div>
            )}
          </div>

          {/* Final Scores */}
          <div className="space-y-2">
            <h4 className="font-orbitron text-accent text-center">Final Scores</h4>
            {sortedPlayers.map((player, index) => (
              <div
                key={player.name}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  index === 0
                    ? 'border-accent bg-accent/10'
                    : 'border-accent/30 hover:bg-accent/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  {getPositionIcon(index + 1)}
                  <span className="font-medium text-card-foreground">
                    {player.name}
                  </span>
                </div>
                <span className="font-bold text-accent">
                  ${player.score.toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={onNewGame} 
              className="jeopardy-button flex-1"
            >
              New Game
            </Button>
            <Button 
              onClick={onViewLeaderboard} 
              variant="outline" 
              className="jeopardy-button flex-1"
            >
              Leaderboard
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default GameCompletionModal;