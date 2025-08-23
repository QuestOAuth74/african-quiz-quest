import { OwarePit as OwarePitType } from '@/types/oware';
import { cn } from '@/lib/utils';

interface OwarePitProps {
  pit: OwarePitType;
  isClickable: boolean;
  isSelected: boolean;
  onClick: () => void;
  player: 1 | 2;
}

export const OwarePit = ({
  pit,
  isClickable,
  isSelected,
  onClick,
  player
}: OwarePitProps) => {
  // Generate stone positions for visual appeal
  const generateStonePositions = (count: number) => {
    const positions = [];
    const maxVisible = Math.min(count, 8); // Show max 8 stones visually to prevent overcrowding
    
    for (let i = 0; i < maxVisible; i++) {
      // Create more natural clustering of stones
      const layer = Math.floor(i / 4);
      const posInLayer = i % 4;
      const baseRadius = 15 + (layer * 8);
      const angle = (posInLayer / 4) * Math.PI * 2 + (layer * Math.PI / 4);
      
      const x = Math.cos(angle) * baseRadius + (Math.random() - 0.5) * 6;
      const y = Math.sin(angle) * baseRadius + (Math.random() - 0.5) * 6;
      const z = layer * 3; // Layered effect
      
      positions.push({ x, y, z });
    }
    
    return positions;
  };

  const stonePositions = generateStonePositions(pit.stones);

  return (
    <div
      className={cn(
        "relative w-28 h-28 rounded-full transition-all duration-200",
        "bg-gradient-to-b from-amber-900 via-amber-950 to-black",
        "border-4 border-amber-800",
        // 3D pit effect with multiple shadows
        "shadow-[inset_0_8px_16px_rgba(0,0,0,0.6),_inset_0_-2px_8px_rgba(92,65,36,0.3),_0_4px_8px_rgba(0,0,0,0.4)]",
        isClickable && "cursor-pointer hover:shadow-[inset_0_8px_16px_rgba(0,0,0,0.7),_inset_0_-2px_8px_rgba(92,65,36,0.4),_0_6px_12px_rgba(0,0,0,0.5)]",
        isSelected && "ring-4 ring-yellow-400 ring-opacity-75",
        !isClickable && "opacity-75"
      )}
      onClick={isClickable ? onClick : undefined}
      style={{
        // Additional 3D depth effect
        background: `
          radial-gradient(ellipse at 30% 30%, rgba(146,91,50,0.3) 0%, transparent 60%),
          radial-gradient(ellipse at 70% 70%, rgba(0,0,0,0.8) 0%, transparent 50%),
          linear-gradient(145deg, #78350f, #1c1917)
        `
      }}
    >
      {/* Pit number indicator */}
      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-amber-200 text-sm font-bold bg-amber-900/50 px-2 py-1 rounded">
        {pit.index + 1}
      </div>

      {/* 3D Stones */}
      <div className="absolute inset-3 flex items-center justify-center pointer-events-none">
        <div className="relative w-full h-full">
          {stonePositions.map((pos, index) => (
            <div
              key={index}
              className={cn(
                "absolute w-4 h-4 rounded-full transition-all duration-300",
                // 3D stone effect with gradient and multiple shadows
                "bg-gradient-to-br from-stone-300 via-stone-500 to-stone-700",
                "shadow-[0_2px_4px_rgba(0,0,0,0.6),_inset_0_1px_2px_rgba(255,255,255,0.3),_inset_0_-1px_2px_rgba(0,0,0,0.3)]",
                // Slight animation delay for natural feel
                `animation-delay-[${index * 50}ms]`
              )}
              style={{
                left: `calc(50% + ${pos.x}px)`,
                top: `calc(50% + ${pos.y}px)`,
                transform: `translate(-50%, -50%) translateZ(${pos.z}px)`,
                // Additional 3D stone styling
                background: `
                  radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.4) 0%, transparent 40%),
                  radial-gradient(ellipse at 70% 70%, rgba(0,0,0,0.3) 0%, transparent 60%),
                  linear-gradient(135deg, #d6d3d1, #78716c, #57534e)
                `,
                boxShadow: `
                  0 ${pos.z + 2}px ${pos.z + 4}px rgba(0,0,0,0.4),
                  inset 0 1px 2px rgba(255,255,255,0.3),
                  inset 0 -1px 2px rgba(0,0,0,0.3)
                `
              }}
            />
          ))}
          
          {/* Stone count text overlay for large numbers */}
          {pit.stones > 8 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-amber-950/90 text-amber-100 px-2 py-1 rounded-lg text-xs font-bold shadow-lg border border-amber-800">
                {pit.stones}
              </span>
            </div>
          )}
          
          {/* Stone count for smaller numbers */}
          {pit.stones <= 8 && pit.stones > 0 && (
            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
              <span className="text-amber-200 text-xs font-bold bg-amber-900/70 px-1.5 py-0.5 rounded">
                {pit.stones}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Subtle glow effect when selected */}
      {isSelected && (
        <div className="absolute inset-0 rounded-full bg-yellow-400/20 animate-pulse" />
      )}
    </div>
  );
};