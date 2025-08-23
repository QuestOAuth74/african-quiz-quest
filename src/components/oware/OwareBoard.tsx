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
      "relative w-full max-w-4xl mx-auto",
      "bg-gradient-to-br from-amber-800 via-amber-700 to-amber-900",
      "rounded-3xl p-8 shadow-2xl",
      "border-4 border-amber-600",
      className
    )}>
      {/* African symbols decoration */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex gap-4 text-amber-200 text-xl opacity-60">
        <span>𓀀</span>
        <span>𓂧</span>
        <span>𓃭</span>
        <span>𓄿</span>
        <span>𓅓</span>
        <span>𓆑</span>
        <span>𓇯</span>
        <span>𓈖</span>
        <span>𓉐</span>
      </div>
      
      {/* Player Two (Top Row) */}
      <div className="mb-6">
        <div className="flex justify-center mb-2">
          <div className="bg-amber-600 text-amber-100 px-4 py-2 rounded-lg font-bold">
            Player 2: {board.playerTwoScore} stones
          </div>
        </div>
        <div className="flex justify-center gap-2">
          {board.playerTwoPits.map((pit, index) => (
            <OwarePit
              key={`p2-${index}`}
              pit={pit}
              isClickable={currentPlayer === 2 && isGameActive && pit.stones > 0}
              isSelected={selectedPit === index && currentPlayer === 2}
              onClick={() => currentPlayer === 2 && isGameActive && onPitClick(index)}
              player={2}
            />
          ))}
        </div>
      </div>

      {/* Center divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent my-6" />

      {/* Player One (Bottom Row) */}
      <div className="mt-6">
        <div className="flex justify-center gap-2">
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
        <div className="flex justify-center mt-2">
          <div className="bg-amber-600 text-amber-100 px-4 py-2 rounded-lg font-bold">
            Player 1: {board.playerOneScore} stones
          </div>
        </div>
      </div>

      {/* Current player indicator */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
        <div className={cn(
          "w-16 h-16 rounded-full border-4 flex items-center justify-center font-bold text-lg transition-all duration-300",
          currentPlayer === 1
            ? "bg-green-500 border-green-300 text-green-900"
            : "bg-blue-500 border-blue-300 text-blue-900"
        )}>
          P{currentPlayer}
        </div>
      </div>
    </div>
  );
};