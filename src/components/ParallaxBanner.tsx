import { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { useIsMobile } from '@/hooks/use-mobile';

interface ParallaxBannerProps {
  imageSrc: string;
  alt: string;
  children?: React.ReactNode;
}

export function ParallaxBanner({ imageSrc, alt, children }: ParallaxBannerProps) {
  const [scrollY, setScrollY] = useState(0);
  const bannerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Parallax transform calculation
  const parallaxOffset = scrollY * 0.5;

  return (
    <div 
      ref={bannerRef}
      className={`relative w-full overflow-hidden ${
        isMobile ? 'h-[50vh]' : 'h-screen'
      }`}
    >
      {/* Floating Stars Background - Only on Desktop */}
      {!isMobile && (
        <div className="absolute inset-0 z-10">
          <Canvas camera={{ position: [0, 0, 1] }}>
            <Stars 
              radius={100}
              depth={50}
              count={5000}
              factor={4}
              saturation={0}
              fade={true}
              speed={0.5}
            />
          </Canvas>
        </div>
      )}
      
      {/* Parallax Background Image */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          transform: `translateY(${parallaxOffset}px)`,
          transition: 'transform 0.1s ease-out'
        }}
      >
        {/* Golden Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-yellow-500/30 to-yellow-400/20 z-20" />
        
        {/* Main Banner Image */}
        <img 
          src={imageSrc}
          alt={alt}
          className="w-full h-full object-cover"
          style={{
            filter: 'brightness(1.1) contrast(1.1) saturate(1.2)',
          }}
        />
        
        {/* Overlay Gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 z-30" />
      </div>

      {/* Content Overlay */}
      {children && (
        <div className="relative z-40 h-full flex items-center justify-center">
          <div className="text-center px-4 sm:px-6">
            {children}
          </div>
        </div>
      )}

      {/* Animated Golden Border - Only on Desktop */}
      {!isMobile && (
        <div className="absolute inset-0 z-50 pointer-events-none">
          <div className="w-full h-full border-4 border-yellow-400/50 rounded-lg shadow-[0_0_30px_rgba(255,215,0,0.3),0_0_60px_rgba(255,215,0,0.2),0_0_90px_rgba(255,215,0,0.1)] animate-pulse" />
        </div>
      )}

      {/* Mobile fallback sparkle effects */}
      {isMobile && (
        <div className="absolute inset-0 z-10">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
        <div className="w-6 h-10 border-2 border-yellow-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-yellow-400 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </div>
  );
}