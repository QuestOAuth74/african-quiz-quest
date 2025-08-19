import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { WheelSegment } from '@/types/wheel';

interface WheelComponentProps {
  onSpin: (value: number | string) => void;
  onStop?: () => void;
  disabled?: boolean;
  isSpinning?: boolean;
}

const WHEEL_SEGMENTS: WheelSegment[] = [
  { value: '$5000', color: '#FF1744' },     // Bright red
  { value: '$600', color: '#2196F3' },      // Blue
  { value: '$500', color: '#4CAF50' },      // Green
  { value: '$300', color: '#FF9800' },      // Orange
  { value: 'LOSE_TURN', color: '#795548' }, // Brown
  { value: '$800', color: '#9C27B0' },      // Purple
  { value: '$550', color: '#00BCD4' },      // Cyan
  { value: '$400', color: '#8BC34A' },      // Light green
  { value: 'BANKRUPT', color: '#000000' },  // Black
  { value: '$350', color: '#FFC107' },      // Amber
  { value: '$450', color: '#E91E63' },      // Pink
  { value: '$700', color: '#607D8B' },      // Blue grey
  { value: '$300', color: '#FF5722' },      // Deep orange
  { value: '$900', color: '#673AB7' },      // Deep purple
  { value: '$500', color: '#009688' },      // Teal
  { value: '$650', color: '#795548' },      // Brown
  { value: 'LOSE_TURN', color: '#424242' }, // Dark grey
  { value: '$750', color: '#3F51B5' },      // Indigo
  { value: '$500', color: '#4CAF50' },      // Green
  { value: '$400', color: '#FF9800' },      // Orange
  { value: 'BANKRUPT', color: '#000000' },  // Black
  { value: '$550', color: '#E91E63' },      // Pink
  { value: '$300', color: '#2196F3' },      // Blue
  { value: '$900', color: '#9C27B0' },      // Purple
];

export const WheelComponent: React.FC<WheelComponentProps> = ({
  onSpin,
  onStop,
  disabled = false,
  isSpinning = false
}) => {
  const [rotation, setRotation] = useState(0);
  const [canStop, setCanStop] = useState(false);

  const handleSpin = () => {
    if (disabled || isSpinning) return;

    const segmentAngle = 360 / WHEEL_SEGMENTS.length;
    
    // First randomly select a segment to land on
    const randomSegmentIndex = Math.floor(Math.random() * WHEEL_SEGMENTS.length);
    const selectedSegment = WHEEL_SEGMENTS[randomSegmentIndex];
    
    // Calculate the target angle for this segment (center of the segment)
    const targetSegmentAngle = randomSegmentIndex * segmentAngle + segmentAngle / 2;
    
    // Add multiple full rotations (8-12 spins) for dramatic effect
    const extraRotations = 8 + Math.random() * 4; // 8-12 full rotations
    const totalRotation = extraRotations * 360 + (360 - targetSegmentAngle);
    
    // Set the new rotation
    setRotation(rotation + totalRotation);
    setCanStop(true);

    // Allow stopping after 1 second
    setTimeout(() => {
      setCanStop(true);
    }, 1000);

    // Delay to match animation duration and call onSpin with the predetermined segment
    setTimeout(() => {
      onSpin(selectedSegment.value);
      setCanStop(false);
    }, 4000);
  };

  const handleStop = () => {
    if (!canStop || !isSpinning) return;
    onStop?.();
    setCanStop(false);
  };

  const segmentAngle = 360 / WHEEL_SEGMENTS.length;

  return (
    <div className="flex flex-col items-center space-y-8">
      <div className="relative">
        {/* Decorative background ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 opacity-20 blur-xl transform scale-110"></div>
        
        {/* Wheel pointer - Classic Wheel of Fortune style */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 z-20">
          <div className="relative">
            {/* Outer pointer shadow */}
            <div className="w-0 h-0 border-l-8 border-r-8 border-b-16 border-l-transparent border-r-transparent border-b-black/20 transform translate-x-0.5 translate-y-0.5"></div>
            {/* Main pointer */}
            <div className="absolute top-0 w-0 h-0 border-l-8 border-r-8 border-b-16 border-l-transparent border-r-transparent border-b-white"></div>
            {/* Inner pointer detail */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
              <div className="w-0 h-0 border-l-5 border-r-5 border-b-10 border-l-transparent border-r-transparent border-b-red-600"></div>
            </div>
          </div>
        </div>
        
        {/* Wheel */}
        <div className="relative z-10">
          <svg
            width="400"
            height="400"
            className="drop-shadow-2xl"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 4s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none',
              filter: isSpinning ? 'brightness(1.2) saturate(1.3)' : 'brightness(1.0) saturate(1.0)'
            }}
          >
            {/* Outer decorative ring */}
            <circle
              cx="200"
              cy="200"
              r="195"
              fill="none"
              stroke="url(#goldGradient)"
              strokeWidth="8"
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
                  <stop offset="100%" stopColor={segment.color} />
                </linearGradient>
              ))}
            </defs>
            
            {WHEEL_SEGMENTS.map((segment, index) => {
              const startAngle = index * segmentAngle;
              const endAngle = (index + 1) * segmentAngle;
              
              const x1 = 200 + 190 * Math.cos((startAngle * Math.PI) / 180);
              const y1 = 200 + 190 * Math.sin((startAngle * Math.PI) / 180);
              const x2 = 200 + 190 * Math.cos((endAngle * Math.PI) / 180);
              const y2 = 200 + 190 * Math.sin((endAngle * Math.PI) / 180);
              
              const largeArcFlag = segmentAngle > 180 ? 1 : 0;
              
              const pathData = [
                `M 200 200`,
                `L ${x1} ${y1}`,
                `A 190 190 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ');

              const textAngle = startAngle + segmentAngle / 2;
              const textRadius = (typeof segment.value === 'string' && (segment.value.includes('BANKRUPT') || segment.value.includes('LOSE'))) ? 140 : 130;
              const textX = 200 + textRadius * Math.cos((textAngle * Math.PI) / 180);
              const textY = 200 + textRadius * Math.sin((textAngle * Math.PI) / 180);

              return (
                <g key={index}>
                  {/* Segment background */}
                  <path
                    d={pathData}
                    fill={segment.color}
                    stroke="#FFFFFF"
                    strokeWidth="4"
                  />
                  
                  {/* Inner border for definition */}
                  <path
                    d={[
                      `M 200 200`,
                      `L ${200 + 170 * Math.cos((startAngle * Math.PI) / 180)} ${200 + 170 * Math.sin((startAngle * Math.PI) / 180)}`,
                      `A 170 170 0 ${largeArcFlag} 1 ${200 + 170 * Math.cos((endAngle * Math.PI) / 180)} ${200 + 170 * Math.sin((endAngle * Math.PI) / 180)}`,
                      'Z'
                    ].join(' ')}
                    fill="rgba(255, 255, 255, 0.1)"
                    stroke="rgba(255, 255, 255, 0.3)"
                    strokeWidth="1"
                  />
                  
                  {/* Text with proper styling */}
                  <text
                    x={textX}
                    y={textY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#FFFFFF"
                    fontSize={(typeof segment.value === 'string' && (segment.value.includes('BANKRUPT') || segment.value.includes('LOSE'))) ? '10' : '14'}
                    fontWeight="bold"
                    fontFamily="Arial, sans-serif"
                    transform={`rotate(${textAngle}, ${textX}, ${textY})`}
                    style={{ 
                      filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.8))',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                    }}
                  >
                    {segment.value}
                  </text>
                </g>
              );
            })}
            
            {/* Center circle with gradient */}
            <circle
              cx="200"
              cy="200"
              r="45"
              fill="url(#centerGradient)"
              stroke="#FFFFFF"
              strokeWidth="6"
            />
            
            {/* Center logo/text */}
            <text
              x="200"
              y="195"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#FFFFFF"
              fontSize="14"
              fontWeight="bold"
              style={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.8))' }}
            >
              WHEEL
            </text>
            <text
              x="200"
              y="210"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#FFFFFF"
              fontSize="10"
              fontWeight="bold"
              style={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.8))' }}
            >
              OF FORTUNE
            </text>
          </svg>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-6 items-center">
        <Button 
          onClick={handleSpin}
          disabled={disabled || isSpinning}
          size="lg"
          className="px-8 py-6 text-lg font-bold tracking-wider transform transition-all duration-200 
                     bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700
                     text-white shadow-xl border-2 border-white rounded-2xl
                     hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:hover:scale-100"
        >
          {isSpinning ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              SPINNING...
            </span>
          ) : (
            'SPIN'
          )}
        </Button>

        <Button 
          onClick={handleStop}
          disabled={!canStop || !isSpinning}
          size="lg"
          className="px-8 py-6 text-lg font-bold tracking-wider transform transition-all duration-200 
                     bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900
                     text-white shadow-xl border-2 border-white rounded-2xl
                     hover:scale-105 hover:shadow-2xl disabled:opacity-30 disabled:hover:scale-100"
        >
          STOP
        </Button>
      </div>
    </div>
  );
};