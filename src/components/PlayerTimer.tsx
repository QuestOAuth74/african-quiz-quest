import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Brain } from "lucide-react";
import { useGameAudio } from "@/hooks/useGameAudio";

interface PlayerTimerProps {
  isActive: boolean;
  playerName: string;
  onTimeout?: () => void;
}

export const PlayerTimer = ({ isActive, playerName, onTimeout }: PlayerTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(60);
  const [isVisible, setIsVisible] = useState(false);
  const gameAudio = useGameAudio();

  useEffect(() => {
    if (isActive && playerName !== "Computer") {
      setTimeLeft(60);
      setIsVisible(true);
      
      // Start thinking countdown music
      gameAudio.playThinkingCountdown();
      
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsVisible(false);
            gameAudio.stopThinkingCountdown();
            onTimeout?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearInterval(timer);
        setIsVisible(false);
        gameAudio.stopThinkingCountdown();
      };
    } else {
      setIsVisible(false);
      gameAudio.stopThinkingCountdown();
    }
  }, [isActive, playerName, onTimeout]);

  if (!isVisible) return null;

  const progressValue = (timeLeft / 60) * 100;
  const getProgressColor = () => {
    if (timeLeft > 40) return "bg-green-500";
    if (timeLeft > 20) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-3 shadow-md">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Brain className="h-4 w-4 text-primary animate-pulse" />
          <span className="text-sm font-medium text-foreground">
            THINKING...
          </span>
          <Brain className="h-4 w-4 text-primary animate-pulse" />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">{playerName}'s Turn</span>
            <span className="font-mono text-foreground font-bold">
              {timeLeft}s
            </span>
          </div>
          
          <div className="relative">
            <Progress 
              value={progressValue} 
              className="h-2 bg-muted"
            />
            <div 
              className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-1000 ${getProgressColor()}`}
              style={{ width: `${progressValue}%` }}
            />
          </div>
          
          <div className="text-center text-xs text-muted-foreground">
            Select a question to continue
          </div>
        </div>
      </div>
    </div>
  );
};