import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { WheelSegment } from '@/types/wheel';

interface WheelComponentProps {
  onSpin: (value: number | string) => void;
  disabled?: boolean;
  isSpinning?: boolean;
}

const WHEEL_SEGMENTS: WheelSegment[] = [
  { value: 100, color: 'hsl(var(--primary))' },
  { value: 200, color: 'hsl(var(--secondary))' },
  { value: 300, color: 'hsl(var(--primary))' },
  { value: 400, color: 'hsl(var(--secondary))' },
  { value: 500, color: 'hsl(var(--primary))' },
  { value: 'BANKRUPT', color: 'hsl(var(--destructive))' },
  { value: 600, color: 'hsl(var(--primary))' },
  { value: 700, color: 'hsl(var(--secondary))' },
  { value: 800, color: 'hsl(var(--primary))' },
  { value: 'LOSE_TURN', color: 'hsl(var(--muted))' },
  { value: 900, color: 'hsl(var(--secondary))' },
  { value: 1000, color: 'hsl(var(--primary))' },
];

export const WheelComponent: React.FC<WheelComponentProps> = ({
  onSpin,
  disabled = false,
  isSpinning = false
}) => {
  const [rotation, setRotation] = useState(0);

  const handleSpin = () => {
    if (disabled || isSpinning) return;

    const segmentAngle = 360 / WHEEL_SEGMENTS.length;
    const randomSpin = Math.random() * 360 + 3600; // More rotations for dramatic effect
    const finalRotation = (rotation + randomSpin) % 360;
    
    setRotation(rotation + randomSpin);

    // Calculate which segment the wheel landed on
    const normalizedRotation = (360 - finalRotation) % 360;
    const segmentIndex = Math.floor(normalizedRotation / segmentAngle);
    const selectedSegment = WHEEL_SEGMENTS[segmentIndex];

    // Delay to match 5-second animation
    setTimeout(() => {
      onSpin(selectedSegment.value);
    }, 5000);
  };

  const segmentAngle = 360 / WHEEL_SEGMENTS.length;

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="relative">
        {/* Wheel pointer */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
          <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-foreground"></div>
        </div>
        
        {/* Wheel */}
        <div className="relative">
          <svg
            width="300"
            height="300"
            className="drop-shadow-lg"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 5s cubic-bezier(0.25, 0.1, 0.1, 1)' : 'none'
            }}
          >
            {WHEEL_SEGMENTS.map((segment, index) => {
              const startAngle = index * segmentAngle;
              const endAngle = (index + 1) * segmentAngle;
              
              const x1 = 150 + 140 * Math.cos((startAngle * Math.PI) / 180);
              const y1 = 150 + 140 * Math.sin((startAngle * Math.PI) / 180);
              const x2 = 150 + 140 * Math.cos((endAngle * Math.PI) / 180);
              const y2 = 150 + 140 * Math.sin((endAngle * Math.PI) / 180);
              
              const largeArcFlag = segmentAngle > 180 ? 1 : 0;
              
              const pathData = [
                `M 150 150`,
                `L ${x1} ${y1}`,
                `A 140 140 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ');

              const textAngle = startAngle + segmentAngle / 2;
              const textX = 150 + 80 * Math.cos((textAngle * Math.PI) / 180);
              const textY = 150 + 80 * Math.sin((textAngle * Math.PI) / 180);

              return (
                <g key={index}>
                  <path
                    d={pathData}
                    fill={segment.color}
                    stroke="hsl(var(--border))"
                    strokeWidth="2"
                  />
                  <text
                    x={textX}
                    y={textY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="hsl(var(--primary-foreground))"
                    fontSize="14"
                    fontWeight="bold"
                    transform={`rotate(${textAngle}, ${textX}, ${textY})`}
                  >
                    {segment.value}
                  </text>
                </g>
              );
            })}
            
            {/* Center circle */}
            <circle
              cx="150"
              cy="150"
              r="30"
              fill="hsl(var(--background))"
              stroke="hsl(var(--border))"
              strokeWidth="3"
            />
          </svg>
        </div>
      </div>

      <Button 
        onClick={handleSpin}
        disabled={disabled || isSpinning}
        size="lg"
        className="px-8 py-6 text-lg font-bold"
      >
        {isSpinning ? 'Spinning...' : 'SPIN THE WHEEL'}
      </Button>
    </div>
  );
};