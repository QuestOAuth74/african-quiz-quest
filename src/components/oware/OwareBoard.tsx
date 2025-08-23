import { OwareBoard as OwareBoardType } from '@/types/oware';
import { OwarePit } from './OwarePit';
import { cn } from '@/lib/utils';

interface OwareBoardProps {
  board: OwareBoardType;
  currentPlayer: 1 | 2;
  onPitClick: (pitIndex: number) => void;
  selectedPit: number | null;
  isGameActive: boolean;
  className?: string;
}

export const OwareBoard = ({
  board,
  currentPlayer,
  onPitClick,
  selectedPit,
  isGameActive,
  className
}: OwareBoardProps) => {
  return (
    <div className={cn(
      "relative w-full max-w-5xl mx-auto p-8",
      className
    )}>
      {/* Main 3D Board Container */}
      <div 
        className={cn(
          "relative bg-gradient-to-br from-amber-900 via-amber-950 to-black",
          "rounded-3xl p-12 border-8 border-amber-800",
          // 3D board effect with multiple shadows and highlights
          "shadow-[0_20px_40px_rgba(0,0,0,0.6),_inset_0_4px_8px_rgba(146,91,50,0.3),_inset_0_-4px_16px_rgba(0,0,0,0.4)]",
          // Wood grain texture effect
          "before:absolute before:inset-0 before:rounded-3xl before:opacity-20",
          "before:bg-gradient-to-br before:from-transparent before:via-amber-700/30 before:to-transparent",
          "after:absolute after:inset-0 after:rounded-3xl after:opacity-10",
          "after:bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.1)_70%)]"
        )}
        style={{
          // Rich wood texture background
          background: `
            linear-gradient(135deg, rgba(146,91,50,0.1) 0%, transparent 30%),
            linear-gradient(225deg, rgba(0,0,0,0.2) 0%, transparent 40%),
            linear-gradient(315deg, rgba(92,65,36,0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 20% 20%, rgba(146,91,50,0.1) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 80%, rgba(0,0,0,0.3) 0%, transparent 50%),
            linear-gradient(145deg, #451a03, #7c2d12, #1c1917)
          `
        }}
      >
        {/* Decorative African Patterns */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex gap-6 text-amber-600/60 text-2xl">
          <span className="drop-shadow-lg">𓀀</span>
          <span className="drop-shadow-lg">𓂧</span>
          <span className="drop-shadow-lg">𓃭</span>
          <span className="drop-shadow-lg">𓄿</span>
          <span className="drop-shadow-lg">𓅓</span>
          <span className="drop-shadow-lg">𓆑</span>
          <span className="drop-shadow-lg">𓇯</span>
        </div>
        
        {/* Player Two (Top Row) */}
        <div className="mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-amber-800 to-amber-900 text-amber-100 px-6 py-3 rounded-xl font-bold text-lg shadow-lg border-2 border-amber-700">
              Player 2: {board.playerTwoScore} stones
              {currentPlayer === 2 && (
                <span className="ml-2 inline-block w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg"></span>
              )}
            </div>
          </div>
          <div className="flex justify-center gap-6">
            {board.playerTwoPits.slice().reverse().map((pit, index) => (
              <OwarePit
                key={`p2-${5 - index}`}
                pit={{ ...pit, index: 5 - index }}
                isClickable={currentPlayer === 2 && isGameActive && pit.stones > 0}
                isSelected={selectedPit === (5 - index) && currentPlayer === 2}
                onClick={() => currentPlayer === 2 && isGameActive && onPitClick(5 - index)}
                player={2}
              />
            ))}
          </div>
        </div>

        {/* Elegant Center Divider */}
        <div className="relative my-8">
          <div className="h-1 bg-gradient-to-r from-transparent via-amber-600 to-transparent opacity-60 shadow-lg" />
          <div className="absolute inset-0 h-1 bg-gradient-to-r from-transparent via-amber-400/30 to-transparent blur-sm" />
        </div>

        {/* Player One (Bottom Row) */}
        <div className="mt-12">
          <div className="flex justify-center gap-6 mb-6">
            {board.playerOnePits.map((pit, index) => (
              <OwarePit
                key={`p1-${index}`}
                pit={pit}
                isClickable={currentPlayer === 1 && isGameActive && pit.stones > 0}
                isSelected={selectedPit === index && currentPlayer === 1}
                onClick={() => currentPlayer === 1 && isGameActive && onPitClick(index)}
                player={1}
              />
            ))}
          </div>
          <div className="flex justify-center">
            <div className="bg-gradient-to-r from-amber-800 to-amber-900 text-amber-100 px-6 py-3 rounded-xl font-bold text-lg shadow-lg border-2 border-amber-700">
              Player 1: {board.playerOneScore} stones
              {currentPlayer === 1 && (
                <span className="ml-2 inline-block w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg"></span>
              )}
            </div>
          </div>
        </div>

        {/* Current Player Indicator - Repositioned to avoid conflicts */}
        <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
          <div className={cn(
            "w-20 h-20 rounded-full border-4 flex items-center justify-center font-bold text-xl transition-all duration-300 shadow-lg",
            currentPlayer === 1
              ? "bg-gradient-to-br from-emerald-400 to-emerald-600 border-emerald-300 text-emerald-900"
              : "bg-gradient-to-br from-blue-400 to-blue-600 border-blue-300 text-blue-900"
          )}>
            <div className="text-center">
              <div className="text-sm">Turn</div>
              <div>P{currentPlayer}</div>
            </div>
          </div>
        </div>

        {/* Corner decorations */}
        <div className="absolute top-4 left-4 w-4 h-4 bg-amber-600/40 rounded-full shadow-inner"></div>
        <div className="absolute top-4 right-4 w-4 h-4 bg-amber-600/40 rounded-full shadow-inner"></div>
        <div className="absolute bottom-4 left-4 w-4 h-4 bg-amber-600/40 rounded-full shadow-inner"></div>
        <div className="absolute bottom-4 right-4 w-4 h-4 bg-amber-600/40 rounded-full shadow-inner"></div>
      </div>
    </div>
  );
};