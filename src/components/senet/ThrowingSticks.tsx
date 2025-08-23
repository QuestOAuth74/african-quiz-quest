import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ThrowingSticksResult } from '@/types/senet';
import { cn } from '@/lib/utils';

interface ThrowingSticksProps {
  onThrow: () => ThrowingSticksResult | null;
  lastResult?: ThrowingSticksResult;
  disabled?: boolean;
  currentPlayer: 1 | 2;
}

export const ThrowingSticks = ({ onThrow, lastResult, disabled, currentPlayer }: ThrowingSticksProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  
  const handleThrow = async () => {
    setIsAnimating(true);
    
    // Simulate throwing animation
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const result = onThrow();
    setIsAnimating(false);
    
    return result;
  };

  const renderStick = (index: number, isMarked?: boolean) => (
    <div
      key={index}
      className={cn(
        "w-8 h-2 rounded-full transition-all duration-300",
        "border border-amber-600 shadow-sm",
        {
          "bg-gradient-to-r from-amber-200 to-amber-300 shadow-amber-200": isMarked,
          "bg-gradient-to-r from-amber-700 to-amber-800 shadow-amber-800": !isMarked,
          "animate-spin": isAnimating,
        }
      )}
      style={{
        transformOrigin: 'center',
        animationDelay: `${index * 100}ms`,
        animationDuration: '0.8s'
      }}
    />
  );

  return (
    <div className="flex flex-col items-center space-y-4 p-4 bg-gradient-to-br from-amber-100 to-orange-200 dark:from-amber-950/20 dark:to-orange-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
      <div className="text-center">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <span className="text-amber-600">𓊃</span>
          Throwing Sticks
          <span className="text-amber-600">𓊃</span>
        </h3>
        <p className="text-sm text-muted-foreground">
          Cast the sacred sticks of fate
        </p>
      </div>

      {/* Throwing Sticks Display */}
      <div className="flex gap-2 items-center justify-center h-16">
        {lastResult ? (
          lastResult.sticks.map((isMarked, index) => renderStick(index, isMarked))
        ) : (
          Array.from({ length: 4 }, (_, index) => renderStick(index))
        )}
      </div>

      {/* Result Display */}
      {lastResult && !isAnimating && (
        <div className="text-center space-y-2">
          <div className="text-2xl font-bold text-primary">
            {lastResult.value}
          </div>
          <div className="text-sm text-muted-foreground">
            {lastResult.value === 6 ? 'All blank - Move 6!' : 
             lastResult.value === 1 ? 'One mark - Move 1' :
             `${lastResult.value} marks - Move ${lastResult.value}`}
          </div>
        </div>
      )}

      {/* Throw Button */}
      <Button
        onClick={handleThrow}
        disabled={disabled || isAnimating}
        className={cn(
          "min-w-32",
          {
            "bg-amber-600 hover:bg-amber-700": currentPlayer === 1,
            "bg-slate-600 hover:bg-slate-700": currentPlayer === 2,
          }
        )}
      >
        {isAnimating ? (
          <>
            <span className="animate-spin">𓊃</span>
            <span className="ml-2">Throwing...</span>
          </>
        ) : (
          <>
            <span>𓊃</span>
            <span className="ml-2">Throw Sticks</span>
          </>
        )}
      </Button>

      {/* Instructions */}
      <div className="text-xs text-muted-foreground text-center max-w-64">
        Ancient Egyptians used four two-sided sticks. The number of marked sides showing determines your move.
      </div>
    </div>
  );
};