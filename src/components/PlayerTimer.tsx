import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Brain } from "lucide-react";

interface PlayerTimerProps {
  isActive: boolean;
  playerName: string;
  onTimeout?: () => void;
}

export const PlayerTimer = ({ isActive, playerName, onTimeout }: PlayerTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(60);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isActive && playerName !== "Computer") {
      setTimeLeft(60);
      setIsVisible(true);
      
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsVisible(false);
            onTimeout?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearInterval(timer);
        setIsVisible(false);
      };
    } else {
      setIsVisible(false);
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
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
      <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-4 shadow-lg min-w-[300px]">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Brain className="h-5 w-5 text-primary animate-pulse" />
          <span className="text-lg font-semibold text-foreground">
            THINKING...
          </span>
          <Brain className="h-5 w-5 text-primary animate-pulse" />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">{playerName}'s Turn</span>
            <span className="font-mono text-foreground font-bold">
              {timeLeft}s
            </span>
          </div>
          
          <div className="relative">
            <Progress 
              value={progressValue} 
              className="h-3 bg-muted"
            />
            <div 
              className={`absolute top-0 left-0 h-3 rounded-full transition-all duration-1000 ${getProgressColor()}`}
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