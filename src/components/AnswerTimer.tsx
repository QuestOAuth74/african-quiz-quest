import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Clock, AlertTriangle } from "lucide-react";
import { useSoundEffects } from "@/hooks/useSoundEffects";

interface AnswerTimerProps {
  isActive: boolean;
  onTimeout: () => void;
  onStop?: () => void;
  gameMode?: 'single' | 'multiplayer' | 'online-multiplayer';
}

export const AnswerTimer = ({ isActive, onTimeout, onStop, gameMode }: AnswerTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(30);
  const [isVisible, setIsVisible] = useState(false);
  const soundEffects = useSoundEffects();

  useEffect(() => {
    // Only show timer for multiplayer modes
    if (isActive && (gameMode === 'multiplayer' || gameMode === 'online-multiplayer')) {
      setTimeLeft(30);
      setIsVisible(true);
      
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          // Audio warnings
          if (prev === 11) {
            soundEffects.playTimerTick(); // 10 seconds warning
          } else if (prev === 6) {
            soundEffects.playTimerTick(); // 5 seconds warning
          }
          
          if (prev <= 1) {
            clearInterval(timer);
            setIsVisible(false);
            onTimeout();
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
      onStop?.();
    }
  }, [isActive, gameMode, onTimeout, onStop, soundEffects]);

  if (!isVisible) return null;

  const progressValue = (timeLeft / 30) * 100;
  const getProgressColor = () => {
    if (timeLeft > 20) return "bg-green-500";
    if (timeLeft > 10) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getTimerClasses = () => {
    if (timeLeft <= 5) return "animate-pulse border-red-500/70 bg-red-950/20";
    if (timeLeft <= 10) return "border-yellow-500/50 bg-yellow-950/10";
    return "border-green-500/30 bg-green-950/10";
  };

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in mb-4">
      <div className={`bg-background/95 backdrop-blur-sm border rounded-lg p-3 shadow-md transition-all duration-300 ${getTimerClasses()}`}>
        <div className="flex items-center justify-center gap-2 mb-2">
          {timeLeft <= 5 ? (
            <AlertTriangle className="h-4 w-4 text-red-400 animate-bounce" />
          ) : (
            <Clock className="h-4 w-4 text-primary animate-pulse" />
          )}
          <span className="text-sm font-medium text-foreground">
            {timeLeft <= 5 ? "TIME'S RUNNING OUT!" : "ANSWER TIME"}
          </span>
          {timeLeft <= 5 ? (
            <AlertTriangle className="h-4 w-4 text-red-400 animate-bounce" />
          ) : (
            <Clock className="h-4 w-4 text-primary animate-pulse" />
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Time to Answer</span>
            <span className={`font-mono font-bold ${
              timeLeft <= 5 ? 'text-red-400 text-lg' : 
              timeLeft <= 10 ? 'text-yellow-400' : 'text-foreground'
            }`}>
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
          
          <div className="text-center">
            <div className="text-xs text-muted-foreground">
              {timeLeft <= 5 ? "Hurry up!" : "Select your answer"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};