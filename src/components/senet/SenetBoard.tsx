import { SenetGameState, SPECIAL_SQUARES } from '@/types/senet';
import { SenetPiece } from './SenetPiece';
import { cn } from '@/lib/utils';

interface SenetBoardProps {
  gameState: SenetGameState;
  onSquareClick: (position: number) => void;
}

export const SenetBoard = ({ gameState, onSquareClick }: SenetBoardProps) => {
  const { board, availableMoves, currentPlayer } = gameState;

  const getSquareStyle = (position: number) => {
    const specialSquare = SPECIAL_SQUARES.find(s => s.position === position);
    const isAvailable = availableMoves.includes(position);
    const piece = board[position];
    
    return cn(
      "relative w-12 h-12 border border-primary/20 flex items-center justify-center",
      "transition-all duration-200 cursor-pointer hover:bg-primary/5",
      {
        // Special squares styling
        "bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30": specialSquare?.effect === 'safe',
        "bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30": specialSquare?.effect === 'restart',
        "bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30": specialSquare?.effect === 'must_roll_exact',
        
        // Available move highlighting
        "ring-2 ring-primary ring-opacity-60 bg-primary/10": isAvailable && piece?.player === currentPlayer,
        "hover:ring-1 hover:ring-primary/40": !isAvailable,
        
        // Board layout
        "rounded-tl-lg": position === 0,
        "rounded-tr-lg": position === 9,
        "rounded-bl-lg": position === 29,
        "rounded-br-lg": position === 20,
      }
    );
  };

  const renderSquareContent = (position: number) => {
    const piece = board[position];
    const specialSquare = SPECIAL_SQUARES.find(s => s.position === position);
    
    return (
      <>
        {specialSquare && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg opacity-30" title={specialSquare.description}>
              {specialSquare.symbol}
            </span>
          </div>
        )}
        {piece && (
          <SenetPiece 
            piece={piece} 
            isHighlighted={availableMoves.includes(position) && piece.player === currentPlayer}
          />
        )}
        <div className="absolute bottom-0 right-0 text-xs opacity-40 text-foreground/60">
          {position + 1}
        </div>
      </>
    );
  };

  const renderBoardRow = (startIndex: number, endIndex: number, reverse: boolean = false) => {
    const positions = [];
    for (let i = startIndex; i <= endIndex; i++) {
      positions.push(i);
    }
    if (reverse) positions.reverse();
    
    return (
      <div className="grid grid-cols-10 gap-1">
        {positions.map(position => (
          <div
            key={position}
            className={getSquareStyle(position)}
            onClick={() => onSquareClick(position)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onSquareClick(position);
              }
            }}
            aria-label={`Square ${position + 1}${board[position] ? ` with ${board[position]?.player === 1 ? 'your' : 'opponent'} piece` : ''}`}
          >
            {renderSquareContent(position)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-1 p-4 bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950/20 dark:to-orange-950/20 rounded-xl border border-amber-200 dark:border-amber-800">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center justify-center gap-2">
          <span className="text-amber-600">𓋹</span>
          Ancient Senet Board
          <span className="text-amber-600">𓋹</span>
        </h3>
        <p className="text-sm text-muted-foreground">Move your pieces to the afterlife</p>
      </div>
      
      <div className="space-y-1">
        {/* Row 1: Squares 1-10 */}
        {renderBoardRow(0, 9)}
        
        {/* Row 2: Squares 20-11 (reversed S-pattern) */}
        {renderBoardRow(10, 19, true)}
        
        {/* Row 3: Squares 21-30 */}
        {renderBoardRow(20, 29)}
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4 text-xs text-muted-foreground">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 rounded"></div>
            <span>Safe Square</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded"></div>
            <span>House of Water</span>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded"></div>
            <span>Sacred House</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary/20 rounded ring-2 ring-primary/40"></div>
            <span>Available Move</span>
          </div>
        </div>
      </div>
    </div>
  );
};