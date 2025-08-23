import { SenetPiece as SenetPieceType } from '@/types/senet';
import { cn } from '@/lib/utils';

interface SenetPieceProps {
  piece: SenetPieceType;
  isHighlighted?: boolean;
}

export const SenetPiece = ({ piece, isHighlighted }: SenetPieceProps) => {
  const isPlayer1 = piece.player === 1;
  
  return (
    <div
      className={cn(
        "w-12 h-12 rounded-full border-3 flex items-center justify-center text-lg font-bold",
        "transition-all duration-300 z-20 relative shadow-lg",
        {
          // Player 1 (human) pieces - bright gold/amber
          "bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 border-amber-800 text-amber-900": isPlayer1,
          "shadow-amber-500/60 drop-shadow-lg": isPlayer1,
          
          // Player 2 (AI) pieces - deep silver/slate
          "bg-gradient-to-br from-slate-300 via-gray-400 to-slate-500 border-slate-800 text-slate-900": !isPlayer1,
          "shadow-slate-500/60 drop-shadow-lg": !isPlayer1,
          
          // Highlighted state for available moves - glowing effect
          "ring-4 ring-emerald-300 ring-offset-2 scale-125 animate-bounce": isHighlighted,
          "hover:scale-110": !isHighlighted,
        }
      )}
      style={{
        boxShadow: isPlayer1 
          ? '0 8px 16px rgba(245, 158, 11, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3)'
          : '0 8px 16px rgba(71, 85, 105, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3)'
      }}
      aria-label={`${isPlayer1 ? 'Your' : 'Opponent'} piece`}
    >
      <span className="text-2xl drop-shadow-md">
        {isPlayer1 ? '𓀀' : '𓀁'}
      </span>
    </div>
  );
};