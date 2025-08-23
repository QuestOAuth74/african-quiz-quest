
import { OwareBoard as OwareBoardType } from '@/types/oware';
import { OwarePit } from './OwarePit';
import { cn } from '@/lib/utils';

interface AnimationState {
  isAnimating: boolean;
  currentStones: number;
  currentPit: { side: 1 | 2; index: number } | null;
  sowingSequence: Array<{ side: 1 | 2; index: number; isCapture?: boolean }>;
  sequenceIndex: number;
}

interface OwareBoardProps {
  board: OwareBoardType;
  currentPlayer: 1 | 2;
  onPitClick: (pitIndex: number) => void;
  selectedPit: number | null;
  isGameActive: boolean;
  animationState?: AnimationState;
  className?: string;
}

export const OwareBoard = ({
  board,
  currentPlayer,
  onPitClick,
  selectedPit,
  isGameActive,
  animationState,
  className
}: OwareBoardProps) => {
  return (
    <div className={cn(
      "relative w-full max-w-6xl mx-auto",
      className
    )} style={{ perspective: '1200px' }}>
      {/* Ancient African Temple Board Container */}
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
        
        {/* Ancient African Adinkra Border Pattern */}
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
        
        {/* Ornate Adinkra Corner Decorations */}
        <div className="absolute top-4 left-4 text-4xl opacity-80" 
             style={{ 
               color: '#8B4513',
               textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 20px rgba(139,69,19,0.5)',
               filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))'
             }}>
          ⚹
        </div>
        <div className="absolute top-4 right-4 text-4xl opacity-80" 
             style={{ 
               color: '#8B4513',
               textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 20px rgba(139,69,19,0.5)',
               filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))'
             }}>
          ✧
        </div>
        <div className="absolute bottom-4 left-4 text-4xl opacity-80" 
             style={{ 
               color: '#8B4513',
               textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 20px rgba(139,69,19,0.5)',
               filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))'
             }}>
          ❋
        </div>
        <div className="absolute bottom-4 right-4 text-4xl opacity-80" 
             style={{ 
               color: '#8B4513',
               textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 20px rgba(139,69,19,0.5)',
               filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))'
             }}>
          ◉
        </div>
        
         <div className="relative z-10">
          {/* Enhanced African Temple Header */}
          <div className="text-center mb-8">
            {/* Main Title with African Crown */}
            <div className="relative mb-4">
              <h3 className="text-3xl font-black text-transparent bg-clip-text flex items-center justify-center gap-4"
                  style={{
                    backgroundImage: 'linear-gradient(135deg, #8B4513 0%, #654321 25%, #3C2415 50%, #2C1810 75%, #1F120B 100%)',
                    textShadow: '0 0 30px rgba(101,67,33,0.8), 0 0 60px rgba(139,69,19,0.4)',
                    filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.8)) drop-shadow(0 0 20px rgba(101,67,33,0.6))'
                  }}>
                <span className="text-4xl animate-pulse" style={{ color: '#8B4513' }}>⚹</span>
                <span className="tracking-wider">OWARE</span>
                <span className="text-4xl animate-pulse" style={{ color: '#8B4513' }}>◉</span>
              </h3>
              
              {/* Sacred Subtitle */}
              <div className="text-xl font-bold text-stone-400 mt-3 tracking-wide"
                   style={{
                     textShadow: '2px 2px 4px rgba(0,0,0,0.9), 0 0 20px rgba(120,113,108,0.5)'
                   }}>
                <span className="opacity-80">⟨ Ancient Game of Seeds ⟩</span>
              </div>
              
              <p className="text-stone-300 font-semibold mt-2 text-lg tracking-wide"
                 style={{
                   textShadow: '1px 1px 3px rgba(0,0,0,0.8)'
                 }}>
                Sow wisdom, reap victory
              </p>
            </div>
            
            {/* African Decorative Elements */}
            <div className="flex items-center justify-center gap-8 mb-4">
              <div className="flex items-center gap-2 text-stone-500 text-2xl opacity-80">
                <span>⚹</span><span>✧</span><span>❋</span>
              </div>
              <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-stone-600 to-transparent opacity-60"></div>
              <div className="text-3xl text-stone-400 opacity-90 animate-bounce">🌰</div>
              <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-stone-600 to-transparent opacity-60"></div>
              <div className="flex items-center gap-2 text-stone-500 text-2xl opacity-80">
                <span>⚘</span><span>✦</span><span>◉</span>
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
            
            {/* Central African ornament */}
            <div className="relative z-10 bg-gradient-to-br from-stone-700 via-stone-800 to-stone-900 px-4 py-1 rounded-full text-stone-300 font-black text-sm"
                 style={{
                   boxShadow: 'inset 2px 2px 4px rgba(120,113,108,0.3), inset -2px -2px 4px rgba(0,0,0,0.8), 0 4px 8px rgba(0,0,0,0.6)',
                   textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                 }}>
              ⚹ SACRED BOARD ◉
            </div>
          </div>
          
          {/* 3D Board Surface */}
          <div className="relative space-y-6 p-6 rounded-2xl"
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
              {/* Player Two (Top Row) */}
              <div className="mb-12">
                <div className="flex justify-center mb-6">
                  <div className="bg-gradient-to-br from-stone-700 via-stone-800 to-stone-900 text-stone-200 px-6 py-3 rounded-xl font-bold text-lg shadow-lg border-2 border-stone-600"
                       style={{
                         boxShadow: 'inset 2px 2px 4px rgba(120,113,108,0.3), inset -2px -2px 4px rgba(0,0,0,0.8), 0 4px 8px rgba(0,0,0,0.6)',
                         textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                       }}>
                    Player 2: {board.playerTwoScore} stones
                    {currentPlayer === 2 && (
                      <span className="ml-2 inline-block w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg"></span>
                    )}
                  </div>
                </div>
                <div className="flex justify-center gap-6">
                  {board.playerTwoPits.slice().reverse().map((pit, index) => {
                    const actualIndex = 5 - index;
                    const isAnimating = animationState?.currentPit?.side === 2 && 
                                      animationState?.currentPit?.index === actualIndex;
                    
                    return (
                      <OwarePit
                        key={`p2-${actualIndex}`}
                        pit={{ ...pit, index: actualIndex }}
                        isClickable={currentPlayer === 2 && isGameActive && pit.stones > 0}
                        isSelected={selectedPit === actualIndex && currentPlayer === 2}
                        isAnimating={isAnimating}
                        onClick={() => currentPlayer === 2 && isGameActive && onPitClick(actualIndex)}
                        player={2}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Elegant Center Divider */}
              <div className="relative my-8">
                <div className="h-1 bg-gradient-to-r from-transparent via-stone-600 to-transparent opacity-60 shadow-lg" />
                <div className="absolute inset-0 h-1 bg-gradient-to-r from-transparent via-stone-400/30 to-transparent blur-sm" />
              </div>

              {/* Player One (Bottom Row) */}
              <div className="mt-12">
                <div className="flex justify-center gap-6 mb-6">
                  {board.playerOnePits.map((pit, index) => {
                    const isAnimating = animationState?.currentPit?.side === 1 && 
                                      animationState?.currentPit?.index === index;
                    
                    return (
                      <OwarePit
                        key={`p1-${index}`}
                        pit={pit}
                        isClickable={currentPlayer === 1 && isGameActive && pit.stones > 0}
                        isSelected={selectedPit === index && currentPlayer === 1}
                        isAnimating={isAnimating}
                        onClick={() => currentPlayer === 1 && isGameActive && onPitClick(index)}
                        player={1}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-center">
                  <div className="bg-gradient-to-br from-stone-700 via-stone-800 to-stone-900 text-stone-200 px-6 py-3 rounded-xl font-bold text-lg shadow-lg border-2 border-stone-600"
                       style={{
                         boxShadow: 'inset 2px 2px 4px rgba(120,113,108,0.3), inset -2px -2px 4px rgba(0,0,0,0.8), 0 4px 8px rgba(0,0,0,0.6)',
                         textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                       }}>
                    Player 1: {board.playerOneScore} stones
                    {currentPlayer === 1 && (
                      <span className="ml-2 inline-block w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg"></span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Current Player Indicator - Repositioned */}
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
          </div>
        </div>
      </div>
    </div>
  );
};
