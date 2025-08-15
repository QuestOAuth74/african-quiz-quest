import React from 'react';

interface OrbIconProps {
  className?: string;
  size?: number;
}

export const OrbIcon = ({ className = "", size = 24 }: OrbIconProps) => {
  return (
    <div className={`relative inline-block ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className="animate-pulse"
        style={{ filter: 'drop-shadow(0 0 8px currentColor)' }}
      >
        <defs>
          <radialGradient id="orb-gradient" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
            <stop offset="50%" stopColor="currentColor" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.3)" />
          </radialGradient>
          <radialGradient id="orb-inner" cx="40%" cy="25%" r="30%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.0)" />
          </radialGradient>
        </defs>
        
        {/* Main orb sphere */}
        <circle 
          cx="12" 
          cy="12" 
          r="10" 
          fill="url(#orb-gradient)"
          className="animate-pulse"
          style={{ 
            animationDuration: '2s',
            animationDelay: '0s'
          }}
        />
        
        {/* Inner highlight */}
        <ellipse 
          cx="10" 
          cy="8" 
          rx="3" 
          ry="2" 
          fill="url(#orb-inner)"
          className="animate-pulse"
          style={{ 
            animationDuration: '3s',
            animationDelay: '0.5s'
          }}
        />
        
        {/* Magical sparkles */}
        <circle 
          cx="18" 
          cy="6" 
          r="1.5" 
          fill="currentColor"
          className="animate-ping"
          style={{ 
            animationDuration: '1.5s',
            animationDelay: '1s'
          }}
        />
        <circle 
          cx="6" 
          cy="18" 
          r="1" 
          fill="currentColor"
          className="animate-ping"
          style={{ 
            animationDuration: '2s',
            animationDelay: '0.3s'
          }}
        />
        <circle 
          cx="20" 
          cy="16" 
          r="0.8" 
          fill="currentColor"
          className="animate-ping"
          style={{ 
            animationDuration: '1.8s',
            animationDelay: '1.2s'
          }}
        />
      </svg>
    </div>
  );
};