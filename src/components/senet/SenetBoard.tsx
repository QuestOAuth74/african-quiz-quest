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
  const { playSpecialSquare, playCriticalSquare } = useSenetAudio();

  const getSquareStyle = (position: number) => {
    const specialSquare = SPECIAL_SQUARES.find(s => s.position === position);
    const isAvailable = availableMoves.includes(position);
    const piece = board[position];
    
    return cn(
      // Base square styling with 3D effects
      "relative w-16 h-16 flex items-center justify-center",
      "transition-all duration-300 cursor-pointer",
      // 3D border effects
      "border-t-2 border-l-2 border-r border-b",
      "border-t-yellow-200 border-l-yellow-300 border-r-yellow-900 border-b-yellow-950",
      // 3D background with depth
      "bg-gradient-to-br from-yellow-100 via-orange-200 to-yellow-300",
      "shadow-[inset_2px_2px_4px_rgba(255,255,255,0.8),inset_-2px_-2px_4px_rgba(0,0,0,0.3),0_4px_8px_rgba(0,0,0,0.3)]",
      "hover:shadow-[inset_3px_3px_6px_rgba(255,255,255,0.9),inset_-3px_-3px_6px_rgba(0,0,0,0.4),0_6px_12px_rgba(0,0,0,0.4)]",
      "hover:transform hover:-translate-y-0.5 hover:scale-105",
      // 3D perspective
      "transform-style-3d",
      {
        // Special squares with enhanced 3D styling
        "bg-gradient-to-br from-red-200 via-red-300 to-red-400 border-t-red-200 border-l-red-300 border-r-red-900 border-b-red-950 shadow-[inset_2px_2px_4px_rgba(255,200,200,0.8),inset_-2px_-2px_4px_rgba(100,0,0,0.5),0_4px_12px_rgba(220,38,38,0.4)]": specialSquare?.effect === 'safe',
        "bg-gradient-to-br from-blue-200 via-cyan-300 to-cyan-400 border-t-cyan-200 border-l-cyan-300 border-r-cyan-900 border-b-cyan-950 shadow-[inset_2px_2px_4px_rgba(200,255,255,0.8),inset_-2px_-2px_4px_rgba(0,50,100,0.5),0_4px_12px_rgba(6,182,212,0.4)]": specialSquare?.effect === 'restart',
        "bg-gradient-to-br from-purple-200 via-violet-300 to-violet-400 border-t-violet-200 border-l-violet-300 border-r-violet-900 border-b-violet-950 shadow-[inset_2px_2px_4px_rgba(220,200,255,0.8),inset_-2px_-2px_4px_rgba(50,0,100,0.5),0_4px_12px_rgba(139,92,246,0.4)]": specialSquare?.effect === 'must_roll_exact',
        
        // Available move highlighting with 3D glow
        "ring-4 ring-lime-400 ring-opacity-100 bg-gradient-to-br from-lime-200 via-green-300 to-green-400 animate-bounce shadow-[inset_2px_2px_6px_rgba(255,255,255,0.9),inset_-2px_-2px_6px_rgba(0,100,0,0.3),0_6px_20px_rgba(132,204,22,0.6),0_0_30px_rgba(132,204,22,0.4)] transform -translate-y-1": isAvailable && piece?.player === currentPlayer,
        "hover:ring-2 hover:ring-yellow-400 hover:ring-opacity-50": !isAvailable,
        
        // Board corner styling for 3D papyrus effect
        "rounded-tl-3xl": position === 0,
        "rounded-tr-3xl": position === 9, 
        "rounded-bl-3xl": position === 29,
        "rounded-br-3xl": position === 20,
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
        
        {/* Square numbers with 3D effect */}
        <div className="absolute bottom-1 right-1 text-xs font-black text-white px-1.5 py-0.5 rounded-md"
             style={{
               background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 100%)',
               boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.2), inset -1px -1px 2px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.5)',
               textShadow: '0 1px 2px rgba(0,0,0,0.8)',
               border: '1px solid rgba(255,255,255,0.1)'
             }}>
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
                // Play different sounds for different square types
                if (specialSquare.effect === 'restart' || specialSquare.effect === 'must_roll_exact') {
                  playCriticalSquare();
                } else {
                  playSpecialSquare();
                }
              }
              onSquareClick(position);
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                const specialSquare = SPECIAL_SQUARES.find(s => s.position === position);
                if (specialSquare) {
                  // Play different sounds for different square types
                  if (specialSquare.effect === 'restart' || specialSquare.effect === 'must_roll_exact') {
                    playCriticalSquare();
                  } else {
                    playSpecialSquare();
                  }
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
    <div className="relative perspective-1000" style={{ perspective: '1000px' }}>
      {/* 3D Board Container */}
      <div className="relative p-8 rounded-3xl shadow-2xl transform-gpu"
           style={{
             background: 'linear-gradient(135deg, #FEF3C7 0%, #F59E0B 15%, #D97706 35%, #92400E 65%, #451A03 100%)',
             boxShadow: `
               inset 4px 4px 12px rgba(255,255,255,0.3),
               inset -4px -4px 12px rgba(0,0,0,0.5),
               0 20px 40px rgba(0,0,0,0.6),
               0 8px 16px rgba(0,0,0,0.4),
               0 0 0 2px rgba(146,64,14,0.8),
               0 0 0 4px rgba(68,26,3,0.6)
             `,
             transform: 'rotateX(2deg) rotateY(-1deg)',
             transformOrigin: 'center center'
           }}>
        
        {/* Enhanced 3D papyrus texture overlay */}
        <div className="absolute inset-0 rounded-3xl opacity-30"
             style={{
               backgroundImage: `
                 radial-gradient(circle at 25% 25%, rgba(0,0,0,0.1) 1px, transparent 1px),
                 radial-gradient(circle at 75% 75%, rgba(0,0,0,0.1) 1px, transparent 1px),
                 linear-gradient(45deg, rgba(0,0,0,0.05) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.05) 75%),
                 url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.08'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
               `,
               backgroundSize: '30px 30px, 30px 30px, 20px 20px, 60px 60px',
               backgroundPosition: '0 0, 15px 15px, 10px 10px, 0 0'
             }}>
        </div>
        
        {/* 3D Inner glow effect */}
        <div className="absolute inset-4 rounded-2xl"
             style={{
               background: 'radial-gradient(ellipse at center, rgba(251,191,36,0.2) 0%, transparent 70%)',
               boxShadow: 'inset 0 0 20px rgba(251,191,36,0.3)'
             }}>
        </div>
        
        <div className="relative z-10">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white flex items-center justify-center gap-3"
                style={{
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 20px rgba(251,191,36,0.5)',
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))'
                }}>
              <span className="text-3xl">𓋹</span>
              Sacred Senet Board of the Afterlife
              <span className="text-3xl">𓋹</span>
            </h3>
            <p className="text-white font-semibold mt-2 text-lg"
               style={{
                 textShadow: '1px 1px 3px rgba(0,0,0,0.8)'
               }}>
              Journey through the underworld to eternal life
            </p>
          </div>
          
          {/* Enhanced ornamental border with 3D effect */}
          <div className="mb-6 relative h-2">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-800 to-transparent rounded-full"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-600 to-transparent rounded-full transform translate-y-0.5 opacity-50"></div>
          </div>
          
          {/* 3D Board Surface */}
          <div className="relative space-y-3 p-6 rounded-2xl"
               style={{
                 background: 'linear-gradient(135deg, rgba(254,243,199,0.95) 0%, rgba(255,237,213,0.9) 50%, rgba(251,191,36,0.1) 100%)',
                 boxShadow: `
                   inset 3px 3px 8px rgba(255,255,255,0.8),
                   inset -3px -3px 8px rgba(0,0,0,0.3),
                   0 0 0 3px rgba(180,83,9,0.8),
                   0 0 0 6px rgba(120,53,15,0.6),
                   0 2px 10px rgba(0,0,0,0.3)
                 `,
                 border: '2px solid rgba(180,83,9,0.8)',
                 transform: 'translateZ(4px)'
               }}>
            
            {/* Inner shadow for depth */}
            <div className="absolute inset-2 rounded-xl pointer-events-none"
                 style={{
                   boxShadow: 'inset 0 0 20px rgba(0,0,0,0.15)'
                 }}>
            </div>
            <div className="relative z-20">
              {/* Row 1: Squares 1-10 */}
              {renderBoardRow(0, 9)}
              
              {/* Row 2: Squares 20-11 (reversed S-pattern) */}
              {renderBoardRow(10, 19, true)}
              
              {/* Row 3: Squares 21-30 */}
              {renderBoardRow(20, 29)}
            </div>
          </div>
          
          {/* Enhanced Egyptian-themed legend with 3D effects */}
          <div className="mt-6 grid grid-cols-2 gap-6 text-sm font-medium text-white">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded shadow-lg"
                     style={{
                       background: 'linear-gradient(135deg, #fecaca 0%, #f87171 50%, #dc2626 100%)',
                       boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.8), inset -1px -1px 2px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.3)'
                     }}></div>
                <span className="font-bold text-white" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                  𓇳 Safe Square - Protected by gods
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded shadow-lg"
                     style={{
                       background: 'linear-gradient(135deg, #a7f3d0 0%, #34d399 50%, #059669 100%)',
                       boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.8), inset -1px -1px 2px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.3)'
                     }}></div>
                <span className="font-bold text-white" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                  𓈖 House of Water - Return to start
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded shadow-lg"
                     style={{
                       background: 'linear-gradient(135deg, #ddd6fe 0%, #a78bfa 50%, #7c3aed 100%)',
                       boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.8), inset -1px -1px 2px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.3)'
                     }}></div>
                <span className="font-bold text-white" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                  𓊨 Sacred Houses - Roll exact
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 ring-2 ring-lime-400 rounded animate-bounce shadow-lg"
                     style={{
                       background: 'linear-gradient(135deg, #d9f99d 0%, #84cc16 50%, #65a30d 100%)',
                       boxShadow: '0 0 10px rgba(132,204,22,0.6), inset 1px 1px 2px rgba(255,255,255,0.9), inset -1px -1px 2px rgba(0,0,0,0.2)'
                     }}></div>
                <span className="font-bold text-white" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
                  ✨ Available Move
                </span>
              </div>
            </div>
          </div>
          
          {/* Enhanced decorative hieroglyphs with 3D text effect */}
          <div className="mt-4 text-center text-2xl text-yellow-800 opacity-70 space-x-4"
               style={{
                 textShadow: '2px 2px 4px rgba(0,0,0,0.5), 0 0 8px rgba(251,191,36,0.3)',
                 filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
               }}>
            <span>𓀀</span><span>𓀁</span><span>𓊃</span><span>𓋹</span><span>𓇳</span><span>𓈖</span><span>𓊨</span>
          </div>
        </div>
      </div>
    </div>
  );
};