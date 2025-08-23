import { SenetGameState, SPECIAL_SQUARES } from '@/types/senet';
import { SenetPiece } from './SenetPiece';
import { cn } from '@/lib/utils';
import { useSenetAudio } from '@/hooks/useSenetAudio';

interface SenetBoardProps {
  gameState: SenetGameState;
  onSquareClick: (position: number) => void;
}

export const SenetBoard = ({ gameState, onSquareClick }: SenetBoardProps) => {
  const { board, availableMoves, currentPlayer } = gameState;
  const { playSpecialSquare } = useSenetAudio();

  const getSquareStyle = (position: number) => {
    const specialSquare = SPECIAL_SQUARES.find(s => s.position === position);
    const isAvailable = availableMoves.includes(position);
    const piece = board[position];
    
    return cn(
      // Base square styling - larger and more visible
      "relative w-16 h-16 border-2 flex items-center justify-center",
      "transition-all duration-300 cursor-pointer shadow-inner",
      "bg-gradient-to-br from-yellow-100 to-orange-200",
      "border-yellow-800 dark:border-yellow-600",
      "hover:shadow-md hover:scale-105",
      {
        // Special squares with distinct Egyptian styling
        "bg-gradient-to-br from-red-200 to-red-400 border-red-800 shadow-red-300/50": specialSquare?.effect === 'safe',
        "bg-gradient-to-br from-blue-200 to-cyan-400 border-cyan-800 shadow-cyan-300/50": specialSquare?.effect === 'restart', 
        "bg-gradient-to-br from-purple-200 to-violet-400 border-purple-800 shadow-purple-300/50": specialSquare?.effect === 'must_roll_exact',
        
        // Available move highlighting - extremely visible
        "ring-4 ring-lime-400 ring-opacity-100 bg-gradient-to-br from-lime-200 to-green-400 animate-bounce shadow-lg shadow-lime-400/60": isAvailable && piece?.player === currentPlayer,
        "hover:ring-2 hover:ring-yellow-400": !isAvailable,
        
        // Board corner styling for papyrus effect
        "rounded-tl-2xl": position === 0,
        "rounded-tr-2xl": position === 9, 
        "rounded-bl-2xl": position === 29,
        "rounded-br-2xl": position === 20,
      }
    );
  };

  const renderSquareContent = (position: number) => {
    const piece = board[position];
    const specialSquare = SPECIAL_SQUARES.find(s => s.position === position);
    
    return (
      <>
        {/* Background Egyptian pattern for all squares */}
        <div className="absolute inset-1 opacity-10 bg-repeat bg-center" 
             style={{ backgroundImage: "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\" viewBox=\"0 0 20 20\"><rect width=\"20\" height=\"20\" fill=\"%23D97706\"/><path d=\"M10 5l3 3-3 3-3-3z\" fill=\"%23F59E0B\"/></svg>')" }}>
        </div>
        
        {/* Special square symbols - extremely visible */}
        {specialSquare && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <span className="text-4xl font-black drop-shadow-2xl" 
                  style={{ 
                    color: specialSquare.effect === 'safe' ? '#7F1D1D' : 
                           specialSquare.effect === 'restart' ? '#0C4A6E' : '#4C1D95',
                    textShadow: '3px 3px 6px rgba(0,0,0,0.8), 1px 1px 3px rgba(255,255,255,0.3)',
                    WebkitTextStroke: '1px rgba(0,0,0,0.5)'
                  }}
                  title={specialSquare.description}>
              {specialSquare.symbol}
            </span>
          </div>
        )}
        
        {/* Game pieces */}
        {piece && (
          <SenetPiece 
            piece={piece} 
            isHighlighted={availableMoves.includes(position) && piece.player === currentPlayer}
          />
        )}
        
        {/* Square numbers - much more visible */}
        <div className="absolute bottom-1 right-1 text-sm font-black bg-black/80 text-white px-1.5 py-0.5 rounded-md shadow-lg border border-white/30">
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
      <div className="grid grid-cols-10 gap-2">
        {positions.map(position => (
          <div
            key={position}
            className={getSquareStyle(position)}
            onClick={() => {
              const specialSquare = SPECIAL_SQUARES.find(s => s.position === position);
              if (specialSquare) {
                playSpecialSquare();
              }
              onSquareClick(position);
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                const specialSquare = SPECIAL_SQUARES.find(s => s.position === position);
                if (specialSquare) {
                  playSpecialSquare();
                }
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
    <div className="relative p-8 rounded-3xl shadow-2xl"
         style={{
           background: 'linear-gradient(135deg, #FEF3C7 0%, #F59E0B 20%, #D97706 40%, #92400E 60%, #451A03 100%)',
           boxShadow: 'inset 0 0 50px rgba(0,0,0,0.3), 0 20px 40px rgba(0,0,0,0.4)'
         }}>
      
      {/* Papyrus texture overlay */}
      <div className="absolute inset-0 rounded-3xl opacity-20"
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
             backgroundSize: '60px 60px'
           }}>
      </div>
      
      <div className="relative z-10">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-white flex items-center justify-center gap-3 drop-shadow-lg">
            <span className="text-3xl">𓋹</span>
            Sacred Senet Board of the Afterlife
            <span className="text-3xl">𓋹</span>
          </h3>
          <p className="text-white font-semibold mt-2 text-lg">Journey through the underworld to eternal life</p>
        </div>
        
        {/* Ornamental border */}
        <div className="mb-6 h-1 bg-gradient-to-r from-transparent via-yellow-800 to-transparent"></div>
        
        <div className="space-y-3 p-4 bg-gradient-to-br from-yellow-50/80 to-orange-100/80 rounded-2xl border-4 border-yellow-700 shadow-inner">
          {/* Row 1: Squares 1-10 */}
          {renderBoardRow(0, 9)}
          
          {/* Row 2: Squares 20-11 (reversed S-pattern) */}
          {renderBoardRow(10, 19, true)}
          
          {/* Row 3: Squares 21-30 */}
          {renderBoardRow(20, 29)}
        </div>
        
        {/* Egyptian-themed legend */}
        <div className="mt-6 grid grid-cols-2 gap-6 text-sm font-medium text-white">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-gradient-to-br from-red-200 to-red-400 border-2 border-red-800 rounded shadow-lg"></div>
              <span className="font-bold text-white">𓇳 Safe Square - Protected by gods</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-gradient-to-br from-blue-200 to-cyan-400 border-2 border-cyan-800 rounded shadow-lg"></div>
              <span className="font-bold text-white">𓈖 House of Water - Return to start</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-gradient-to-br from-purple-200 to-violet-400 border-2 border-purple-800 rounded shadow-lg"></div>
              <span className="font-bold text-white">𓊨 Sacred Houses - Roll exact</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-gradient-to-br from-lime-200 to-green-400 ring-4 ring-lime-400 rounded animate-bounce shadow-lg"></div>
              <span className="font-bold text-white">✨ Available Move</span>
            </div>
          </div>
        </div>
        
        {/* Decorative hieroglyphs */}
        <div className="mt-4 text-center text-2xl text-yellow-800 opacity-60 space-x-4">
          <span>𓀀</span><span>𓀁</span><span>𓊃</span><span>𓋹</span><span>𓇳</span><span>𓈖</span><span>𓊨</span>
        </div>
      </div>
    </div>
  );
};