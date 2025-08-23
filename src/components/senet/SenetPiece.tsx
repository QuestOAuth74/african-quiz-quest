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
        "w-14 h-14 rounded-full border-4 flex items-center justify-center text-lg font-bold",
        "transition-all duration-300 z-20 relative shadow-2xl",
        {
          // Player 1 (human) pieces - extremely bright gold
          "bg-gradient-to-br from-yellow-200 via-amber-300 to-yellow-400 border-amber-900 text-amber-900": isPlayer1,
          
          // Player 2 (AI) pieces - high contrast silver/blue
          "bg-gradient-to-br from-slate-200 via-blue-300 to-slate-300 border-slate-900 text-slate-900": !isPlayer1,
          
          // Highlighted state for available moves - extremely visible
          "ring-6 ring-lime-300 ring-offset-3 scale-150 animate-bounce shadow-lime-400/80": isHighlighted,
          "hover:scale-125": !isHighlighted,
        }
      )}
      style={{
        boxShadow: isHighlighted 
          ? '0 0 30px rgba(132, 204, 22, 0.8), 0 12px 24px rgba(0, 0, 0, 0.5), inset 0 4px 8px rgba(255, 255, 255, 0.4)'
          : isPlayer1 
            ? '0 10px 20px rgba(245, 158, 11, 0.6), inset 0 4px 8px rgba(255, 255, 255, 0.4), 0 0 0 2px rgba(146, 64, 14, 0.3)'
            : '0 10px 20px rgba(71, 85, 105, 0.6), inset 0 4px 8px rgba(255, 255, 255, 0.4), 0 0 0 2px rgba(15, 23, 42, 0.3)'
      }}
      aria-label={`${isPlayer1 ? 'Your' : 'Opponent'} piece`}
    >
      <span className="text-3xl font-black drop-shadow-lg" 
            style={{ 
              textShadow: '2px 2px 4px rgba(0,0,0,0.8), 1px 1px 2px rgba(255,255,255,0.3)',
              WebkitTextStroke: '0.5px rgba(0,0,0,0.3)'
            }}>
        {isPlayer1 ? '𓀀' : '𓀁'}
      </span>
    </div>
  );
};