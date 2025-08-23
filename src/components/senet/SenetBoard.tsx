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
              // Base Egyptian sandstone square styling with hieroglyphic patterns
              "relative flex items-center justify-center senet-square",
              "transition-all duration-300 cursor-pointer",
              // Egyptian temple stone border effects
              "border-t-2 border-l-2 border-r-2 border-b-2",
              "border-t-stone-600 border-l-stone-700 border-r-stone-900 border-b-black",
              // Ancient dark wood background with depth
              "bg-gradient-to-br from-stone-800 via-stone-900 to-black",
              "shadow-[inset_3px_3px_6px_rgba(68,64,60,0.9),inset_-3px_-3px_6px_rgba(0,0,0,0.8),0_4px_12px_rgba(0,0,0,0.7)]",
              "hover:shadow-[inset_4px_4px_8px_rgba(68,64,60,1),inset_-4px_-4px_8px_rgba(0,0,0,0.9),0_6px_16px_rgba(0,0,0,0.8)]",
              "hover:transform hover:-translate-y-1 hover:scale-105",
      // Egyptian temple perspective
      "transform-style-3d",
      {
        // Sacred squares - Ra's protection (dark red-brown)
        "bg-gradient-to-br from-red-900 via-red-950 to-black border-t-red-800 border-l-red-900 border-r-black border-b-black shadow-[inset_3px_3px_6px_rgba(127,29,29,0.9),inset_-3px_-3px_6px_rgba(0,0,0,0.9),0_4px_16px_rgba(0,0,0,0.8)] text-red-400": specialSquare?.effect === 'safe',
        
        // House of Waters - Dark blue-brown
        "bg-gradient-to-br from-blue-900 via-blue-950 to-black border-t-blue-800 border-l-blue-900 border-r-black border-b-black shadow-[inset_3px_3px_6px_rgba(30,58,138,0.9),inset_-3px_-3px_6px_rgba(0,0,0,0.9),0_4px_16px_rgba(0,0,0,0.8)] text-blue-400": specialSquare?.effect === 'restart',
        
        // Sacred Houses - Dark purple-brown
        "bg-gradient-to-br from-purple-900 via-purple-950 to-black border-t-purple-800 border-l-purple-900 border-r-black border-b-black shadow-[inset_3px_3px_6px_rgba(76,29,149,0.9),inset_-3px_-3px_6px_rgba(0,0,0,0.9),0_4px_16px_rgba(0,0,0,0.8)] text-purple-400": specialSquare?.effect === 'must_roll_exact',
        
        // Available move highlighting - Dark green glow
        "ring-4 ring-green-600 ring-opacity-100 bg-gradient-to-br from-green-900 via-green-950 to-black animate-pulse shadow-[inset_3px_3px_8px_rgba(21,128,61,0.8),inset_-3px_-3px_8px_rgba(0,0,0,0.9),0_8px_24px_rgba(34,197,94,0.6),0_0_40px_rgba(34,197,94,0.4)] transform -translate-y-2 scale-110": isAvailable && piece?.player === currentPlayer,
        "hover:ring-2 hover:ring-stone-600 hover:ring-opacity-60": !isAvailable,
        
        // Egyptian temple corner styling for papyrus scrolls
        "rounded-tl-[1rem]": position === 0,
        "rounded-tr-[1rem]": position === 9, 
        "rounded-bl-[1rem]": position === 29,
        "rounded-br-[1rem]": position === 20,
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
    <div className="relative w-full max-w-6xl mx-auto" style={{ perspective: '1200px' }}>
      {/* Ancient Egyptian Temple Board Container */}
      <div className="relative p-8 rounded-[2rem] shadow-2xl transform-gpu"
           style={{
             background: `
               linear-gradient(135deg, 
                 #3C2415 0%,      /* Dark chocolate brown */
                 #2C1810 12%,     /* Darker brown */
                 #1F120B 25%,     /* Very dark brown */
                 #140C08 40%,     /* Almost black brown */
                 #0F0805 60%,     /* Nearly black */
                 #0A0603 80%,     /* Extremely dark brown */
                 #050301 100%     /* Almost pure black */
               )
             `,
             boxShadow: `
               inset 6px 6px 20px rgba(60,36,21,0.4),
               inset -6px -6px 20px rgba(0,0,0,0.9),
               0 25px 50px rgba(0,0,0,0.9),
               0 12px 24px rgba(0,0,0,0.8),
               0 0 0 3px #3C2415,
               0 0 0 6px #1F120B,
               0 0 40px rgba(0,0,0,0.8)
             `,
             transform: 'rotateX(3deg) rotateY(-2deg)',
             transformOrigin: 'center center'
           }}>
        
        {/* Ancient Egyptian Hieroglyphic Border Pattern */}
        <div className="absolute inset-2 rounded-[1.5rem] opacity-20"
             style={{
               backgroundImage: `
                 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cpath d='M20 5L25 15H35L27 22L30 32L20 27L10 32L13 22L5 15H15L20 5Z' fill='%23654321' opacity='0.3'/%3E%3C/svg%3E"),
                 linear-gradient(45deg, transparent 40%, rgba(101,67,33,0.1) 50%, transparent 60%)
               `,
               backgroundSize: '40px 40px, 100px 100px',
               backgroundPosition: '0 0, 20px 20px'
             }}>
        </div>
        
        {/* Temple Interior Dark Glow */}
        <div className="absolute inset-6 rounded-2xl"
             style={{
               background: `
                 radial-gradient(ellipse at center, 
                   rgba(101,67,33,0.4) 0%, 
                   rgba(60,36,21,0.2) 40%, 
                   transparent 80%
                 )
               `,
               boxShadow: 'inset 0 0 30px rgba(101,67,33,0.4)'
             }}>
        </div>
        
        {/* Ornate Egyptian Corner Decorations */}
        <div className="absolute top-4 left-4 text-4xl opacity-80" 
             style={{ 
               color: '#8B4513',
               textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 20px rgba(139,69,19,0.5)',
               filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))'
             }}>
          𓋹
        </div>
        <div className="absolute top-4 right-4 text-4xl opacity-80" 
             style={{ 
               color: '#8B4513',
               textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 20px rgba(139,69,19,0.5)',
               filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))'
             }}>
          𓋹
        </div>
        <div className="absolute bottom-4 left-4 text-4xl opacity-80" 
             style={{ 
               color: '#8B4513',
               textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 20px rgba(139,69,19,0.5)',
               filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))'
             }}>
          𓋹
        </div>
        <div className="absolute bottom-4 right-4 text-4xl opacity-80" 
             style={{ 
               color: '#8B4513',
               textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 20px rgba(139,69,19,0.5)',
               filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))'
             }}>
          𓋹
        </div>
        
        <div className="relative z-10">
          {/* Enhanced Egyptian Temple Header */}
          <div className="text-center mb-8">
            {/* Main Title with Pharaoh's Crown */}
            <div className="relative mb-4">
              <h3 className="text-3xl font-black text-transparent bg-clip-text flex items-center justify-center gap-4"
                  style={{
                    backgroundImage: 'linear-gradient(135deg, #8B4513 0%, #654321 25%, #3C2415 50%, #2C1810 75%, #1F120B 100%)',
                    textShadow: '0 0 30px rgba(101,67,33,0.8), 0 0 60px rgba(139,69,19,0.4)',
                    filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.8)) drop-shadow(0 0 20px rgba(101,67,33,0.6))'
                  }}>
                <span className="text-4xl animate-pulse" style={{ color: '#8B4513' }}>𓋹</span>
                <span className="tracking-wider">𓊃𓈖𓏏 SENET 𓊃𓈖𓏏</span>
                <span className="text-4xl animate-pulse" style={{ color: '#8B4513' }}>𓋹</span>
              </h3>
              
              {/* Sacred Underworld Subtitle */}
              <div className="text-xl font-bold text-stone-400 mt-3 tracking-wide"
                   style={{
                     textShadow: '2px 2px 4px rgba(0,0,0,0.9), 0 0 20px rgba(120,113,108,0.5)'
                   }}>
                <span className="opacity-80">⟨ Sacred Game of Passing ⟩</span>
              </div>
              
              <p className="text-stone-300 font-semibold mt-2 text-lg tracking-wide"
                 style={{
                   textShadow: '1px 1px 3px rgba(0,0,0,0.8)'
                 }}>
                Journey through the underworld to eternal rebirth
              </p>
            </div>
            
            {/* Ancient Egyptian Decorative Elements */}
            <div className="flex items-center justify-center gap-8 mb-4">
              <div className="flex items-center gap-2 text-stone-500 text-2xl opacity-80">
                <span>𓇳</span><span>𓈖</span><span>𓊨</span>
              </div>
              <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-stone-600 to-transparent opacity-60"></div>
              <div className="text-3xl text-stone-400 opacity-90 animate-bounce">⚱️</div>
              <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-stone-600 to-transparent opacity-60"></div>
              <div className="flex items-center gap-2 text-stone-500 text-2xl opacity-80">
                <span>𓀀</span><span>𓀁</span><span>𓋹</span>
              </div>
            </div>
          </div>
          
          {/* Enhanced Sacred Border with Multiple Layers */}
          <div className="mb-8 relative h-6 flex items-center justify-center">
            {/* Base dark line */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-1 bg-gradient-to-r from-transparent via-stone-700 to-transparent rounded-full opacity-80"></div>
            </div>
            
            {/* Top highlight line */}
            <div className="absolute inset-0 flex items-center justify-center transform -translate-y-1">
              <div className="w-4/5 h-0.5 bg-gradient-to-r from-transparent via-stone-600 to-transparent rounded-full opacity-60"></div>
            </div>
            
            {/* Bottom shadow line */}
            <div className="absolute inset-0 flex items-center justify-center transform translate-y-1">
              <div className="w-4/5 h-0.5 bg-gradient-to-r from-transparent via-stone-900 to-transparent rounded-full opacity-40"></div>
            </div>
            
            {/* Central Egyptian ornament */}
            <div className="relative z-10 bg-gradient-to-br from-stone-700 via-stone-800 to-stone-900 px-4 py-1 rounded-full text-stone-300 font-black text-sm"
                 style={{
                   boxShadow: 'inset 2px 2px 4px rgba(120,113,108,0.3), inset -2px -2px 4px rgba(0,0,0,0.8), 0 4px 8px rgba(0,0,0,0.6)',
                   textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                 }}>
              𓊨 SACRED BOARD 𓊨
            </div>
          </div>
          
          {/* 3D Board Surface */}
          <div className="relative space-y-3 p-6 rounded-2xl"
               style={{
                 background: 'linear-gradient(135deg, rgba(68,64,60,0.95) 0%, rgba(41,37,36,0.9) 50%, rgba(28,25,23,0.8) 100%)',
                 boxShadow: `
                   inset 3px 3px 8px rgba(87,83,81,0.8),
                   inset -3px -3px 8px rgba(0,0,0,0.9),
                   0 0 0 3px rgba(60,36,21,0.8),
                   0 0 0 6px rgba(41,37,36,0.6),
                   0 2px 10px rgba(0,0,0,0.8)
                 `,
                 border: '2px solid rgba(60,36,21,0.8)',
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
          
          {/* Enhanced Egyptian-themed legend with dark temple colors */}
          <div className="mt-8 grid grid-cols-2 gap-6 text-sm font-medium text-stone-400">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg shadow-lg border border-stone-800"
                     style={{
                       background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 30%, #7c2d12 70%, #451a03 100%)',
                       boxShadow: 'inset 2px 2px 4px rgba(127,29,29,0.6), inset -2px -2px 4px rgba(0,0,0,0.8), 0 3px 6px rgba(0,0,0,0.6)'
                     }}></div>
                <span className="font-bold text-stone-300" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.9), 0 0 8px rgba(101,67,33,0.3)' }}>
                  𓇳 Sacred Square - Ra's Protection
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg shadow-lg border border-stone-800"
                     style={{
                       background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 30%, #1d4ed8 70%, #1e3a8a 100%)',
                       boxShadow: 'inset 2px 2px 4px rgba(30,58,138,0.6), inset -2px -2px 4px rgba(0,0,0,0.8), 0 3px 6px rgba(0,0,0,0.6)'
                     }}></div>
                <span className="font-bold text-stone-300" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.9), 0 0 8px rgba(101,67,33,0.3)' }}>
                  𓈖 House of Waters - Nile's Renewal
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg shadow-lg border border-stone-800"
                     style={{
                       background: 'linear-gradient(135deg, #581c87 0%, #7c3aed 30%, #6b21a8 70%, #4c1d95 100%)',
                       boxShadow: 'inset 2px 2px 4px rgba(88,28,135,0.6), inset -2px -2px 4px rgba(0,0,0,0.8), 0 3px 6px rgba(0,0,0,0.6)'
                     }}></div>
                <span className="font-bold text-stone-300" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.9), 0 0 8px rgba(101,67,33,0.3)' }}>
                  𓊨 Sacred Houses - Pharaoh's Chambers
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 ring-2 ring-green-600 rounded-lg animate-pulse shadow-lg border border-stone-800"
                     style={{
                       background: 'linear-gradient(135deg, #14532d 0%, #166534 30%, #15803d 70%, #14532d 100%)',
                       boxShadow: '0 0 16px rgba(34,197,94,0.6), inset 2px 2px 4px rgba(21,128,61,0.4), inset -2px -2px 4px rgba(0,0,0,0.9)'
                     }}></div>
                <span className="font-bold text-stone-300" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.9), 0 0 8px rgba(101,67,33,0.3)' }}>
                  ✨ Available Move - Path of Destiny
                </span>
              </div>
            </div>
          </div>
          
          {/* Enhanced decorative hieroglyphs with 3D text effect */}
          <div className="mt-4 text-center text-2xl text-stone-700 opacity-70 space-x-4"
               style={{
                 textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(101,67,33,0.3)',
                 filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'
               }}>
            <span>𓀀</span><span>𓀁</span><span>𓊃</span><span>𓋹</span><span>𓇳</span><span>𓈖</span><span>𓊨</span>
          </div>
        </div>
      </div>
    </div>
  );
};