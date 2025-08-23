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
        "w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold",
        "transition-all duration-200 z-10 relative",
        {
          // Player 1 (human) pieces - light/gold
          "bg-gradient-to-br from-amber-400 to-amber-600 border-amber-700 text-amber-900": isPlayer1,
          "shadow-lg shadow-amber-500/50": isPlayer1,
          
          // Player 2 (AI) pieces - dark/silver
          "bg-gradient-to-br from-slate-400 to-slate-600 border-slate-700 text-slate-100": !isPlayer1,
          "shadow-lg shadow-slate-500/50": !isPlayer1,
          
          // Highlighted state for available moves
          "ring-2 ring-primary ring-offset-1 scale-110": isHighlighted,
          "animate-pulse": isHighlighted,
        }
      )}
      aria-label={`${isPlayer1 ? 'Your' : 'Opponent'} piece`}
    >
      {isPlayer1 ? '𓀀' : '𓀁'}
    </div>
  );
};