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
    const maxVisible = Math.min(count, 12); // Show max 12 stones visually
    
    for (let i = 0; i < maxVisible; i++) {
      const angle = (i / maxVisible) * Math.PI * 2;
      const radius = 20 + (Math.random() * 10);
      const x = Math.cos(angle) * radius + (Math.random() - 0.5) * 10;
      const y = Math.sin(angle) * radius + (Math.random() - 0.5) * 10;
      positions.push({ x, y });
    }
    
    return positions;
  };

  const stonePositions = generateStonePositions(pit.stones);

  return (
    <div
      className={cn(
        "relative w-24 h-24 rounded-full transition-all duration-300 cursor-pointer",
        "bg-gradient-to-br from-amber-900 via-amber-800 to-amber-950",
        "border-4 shadow-inner",
        isClickable && "hover:scale-105 hover:shadow-lg",
        isSelected && "ring-4 ring-yellow-400 ring-opacity-75 scale-105",
        isClickable ? "border-amber-500" : "border-amber-700",
        !isClickable && "opacity-75 cursor-not-allowed"
      )}
      onClick={isClickable ? onClick : undefined}
    >
      {/* Pit number indicator */}
      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-amber-200 text-xs font-bold">
        {pit.index + 1}
      </div>

      {/* Stones */}
      <div className="absolute inset-2 flex items-center justify-center">
        <div className="relative w-full h-full">
          {stonePositions.map((pos, index) => (
            <div
              key={index}
              className="absolute w-3 h-3 rounded-full bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 shadow-sm"
              style={{
                left: `calc(50% + ${pos.x}px)`,
                top: `calc(50% + ${pos.y}px)`,
                transform: 'translate(-50%, -50%)',
                animationDelay: `${index * 0.1}s`,
              }}
            />
          ))}
          
          {/* Stone count text overlay */}
          {pit.stones > 12 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-amber-900 text-amber-100 px-2 py-1 rounded text-xs font-bold shadow">
                {pit.stones}
              </span>
            </div>
          )}
          
          {pit.stones <= 12 && pit.stones > 0 && (
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              <span className="text-amber-200 text-xs font-bold">
                {pit.stones}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Click effect */}
      {isClickable && (
        <div className={cn(
          "absolute inset-0 rounded-full transition-opacity duration-200",
          "bg-gradient-to-br from-yellow-400/20 to-orange-400/20",
          isSelected ? "opacity-100" : "opacity-0 hover:opacity-50"
        )} />
      )}
    </div>
  );
};