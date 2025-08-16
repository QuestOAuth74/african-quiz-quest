import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { WheelSegment } from '@/types/wheel';

interface WheelComponentProps {
  onSpin: (value: number | string) => void;
  disabled?: boolean;
  isSpinning?: boolean;
}

const WHEEL_SEGMENTS: WheelSegment[] = [
  { value: 100, color: '#FF6B6B' },    // Bright red
  { value: 200, color: '#4ECDC4' },    // Turquoise
  { value: 300, color: '#45B7D1' },    // Sky blue
  { value: 400, color: '#FFA726' },    // Orange
  { value: 500, color: '#66BB6A' },    // Green
  { value: 'BANKRUPT', color: '#1A1A1A' }, // Black
  { value: 600, color: '#AB47BC' },    // Purple
  { value: 700, color: '#FFEB3B' },    // Bright yellow
  { value: 800, color: '#FF5722' },    // Deep orange
  { value: 'LOSE_TURN', color: '#78909C' }, // Blue grey
  { value: 900, color: '#8BC34A' },    // Light green
  { value: 1000, color: '#E91E63' },   // Pink
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
    <div className="flex flex-col items-center space-y-8">
      <div className="relative">
        {/* Outer glow ring */}
        <div className={`absolute inset-0 rounded-full ${isSpinning ? 'animate-pulse' : ''}`} 
             style={{
               background: 'conic-gradient(from 0deg, #FF6B6B, #4ECDC4, #45B7D1, #FFA726, #66BB6A, #AB47BC, #FFEB3B, #FF5722, #8BC34A, #E91E63, #FF6B6B)',
               filter: 'blur(8px)',
               opacity: 0.6,
               transform: 'scale(1.1)'
             }}>
        </div>
        
        {/* Wheel pointer - Enhanced design */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-3 z-20">
          <div className="relative">
            <div className="w-0 h-0 border-l-6 border-r-6 border-b-12 border-l-transparent border-r-transparent border-b-white shadow-lg"></div>
            <div className="absolute top-1 left-1/2 transform -translate-x-1/2">
              <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-gray-800"></div>
            </div>
          </div>
        </div>
        
        {/* Wheel */}
        <div className="relative z-10">
          <svg
            width="320"
            height="320"
            className="drop-shadow-2xl"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 5s cubic-bezier(0.17, 0.67, 0.12, 1.12)' : 'none',
              filter: isSpinning ? 'brightness(1.2) saturate(1.3)' : 'brightness(1.1) saturate(1.1)'
            }}
          >
            {/* Outer decorative ring */}
            <circle
              cx="160"
              cy="160"
              r="155"
              fill="none"
              stroke="url(#goldGradient)"
              strokeWidth="6"
            />
            
            {/* Define gradients */}
            <defs>
              <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFD700" />
                <stop offset="50%" stopColor="#FFA500" />
                <stop offset="100%" stopColor="#FF8C00" />
              </linearGradient>
              <radialGradient id="centerGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFD700" />
                <stop offset="70%" stopColor="#FFA500" />
                <stop offset="100%" stopColor="#FF8C00" />
              </radialGradient>
              {WHEEL_SEGMENTS.map((segment, index) => (
                <linearGradient key={`grad-${index}`} id={`segment-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={segment.color} />
                  <stop offset="50%" stopColor={segment.color} stopOpacity="0.9" />
                  <stop offset="100%" stopColor={segment.color} stopOpacity="0.8" />
                </linearGradient>
              ))}
            </defs>
            
            {WHEEL_SEGMENTS.map((segment, index) => {
              const startAngle = index * segmentAngle;
              const endAngle = (index + 1) * segmentAngle;
              
              const x1 = 160 + 150 * Math.cos((startAngle * Math.PI) / 180);
              const y1 = 160 + 150 * Math.sin((startAngle * Math.PI) / 180);
              const x2 = 160 + 150 * Math.cos((endAngle * Math.PI) / 180);
              const y2 = 160 + 150 * Math.sin((endAngle * Math.PI) / 180);
              
              const largeArcFlag = segmentAngle > 180 ? 1 : 0;
              
              const pathData = [
                `M 160 160`,
                `L ${x1} ${y1}`,
                `A 150 150 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ');

              const textAngle = startAngle + segmentAngle / 2;
              const textX = 160 + 90 * Math.cos((textAngle * Math.PI) / 180);
              const textY = 160 + 90 * Math.sin((textAngle * Math.PI) / 180);

              return (
                <g key={index}>
                  {/* Segment background */}
                  <path
                    d={pathData}
                    fill={`url(#segment-${index})`}
                    stroke="#FFFFFF"
                    strokeWidth="3"
                  />
                  
                  {/* Inner highlight for 3D effect */}
                  <path
                    d={[
                      `M 160 160`,
                      `L ${160 + 130 * Math.cos((startAngle * Math.PI) / 180)} ${160 + 130 * Math.sin((startAngle * Math.PI) / 180)}`,
                      `A 130 130 0 ${largeArcFlag} 1 ${160 + 130 * Math.cos((endAngle * Math.PI) / 180)} ${160 + 130 * Math.sin((endAngle * Math.PI) / 180)}`,
                      'Z'
                    ].join(' ')}
                    fill="rgba(255, 255, 255, 0.2)"
                    stroke="none"
                  />
                  
                  {/* Text with shadow effect */}
                  <text
                    x={textX + 1}
                    y={textY + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="rgba(0, 0, 0, 0.5)"
                    fontSize={segment.value === 'BANKRUPT' || segment.value === 'LOSE_TURN' ? '11' : '16'}
                    fontWeight="bold"
                    transform={`rotate(${textAngle}, ${textX + 1}, ${textY + 1})`}
                  >
                    {segment.value}
                  </text>
                  <text
                    x={textX}
                    y={textY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={segment.value === 'BANKRUPT' ? '#FFFFFF' : '#FFFFFF'}
                    fontSize={segment.value === 'BANKRUPT' || segment.value === 'LOSE_TURN' ? '11' : '16'}
                    fontWeight="bold"
                    fontFamily="Arial, sans-serif"
                    transform={`rotate(${textAngle}, ${textX}, ${textY})`}
                    style={{ filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.8))' }}
                  >
                    {segment.value}
                  </text>
                </g>
              );
            })}
            
            {/* Center circle with gradient */}
            <circle
              cx="160"
              cy="160"
              r="35"
              fill="url(#centerGradient)"
              stroke="#FFFFFF"
              strokeWidth="4"
            />
            
            {/* Center logo/text */}
            <text
              x="160"
              y="160"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#FFFFFF"
              fontSize="12"
              fontWeight="bold"
              style={{ filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.8))' }}
            >
              SPIN
            </text>
          </svg>
        </div>
      </div>

      <Button 
        onClick={handleSpin}
        disabled={disabled || isSpinning}
        size="lg"
        className={`px-12 py-8 text-xl font-bold tracking-wider transform transition-all duration-200 
                   ${isSpinning 
                     ? 'animate-pulse bg-gradient-to-r from-orange-500 to-red-500 scale-95' 
                     : 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:scale-105 hover:shadow-2xl'
                   } 
                   text-white shadow-lg border-none rounded-xl`}
        style={{
          background: isSpinning 
            ? 'linear-gradient(45deg, #FF6B6B, #FFA726)' 
            : 'linear-gradient(45deg, #FFD700, #FFA500, #FF6B6B)',
          boxShadow: isSpinning 
            ? '0 4px 20px rgba(255, 107, 107, 0.4)' 
            : '0 8px 30px rgba(255, 165, 0, 0.4), 0 0 20px rgba(255, 215, 0, 0.3)'
        }}
      >
        {isSpinning ? (
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            SPINNING...
          </span>
        ) : (
          'SPIN THE WHEEL!'
        )}
      </Button>
    </div>
  );
};