import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Sparkles, Star } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WelcomeModal = ({ isOpen, onClose }: WelcomeModalProps) => {
  const [showContent, setShowContent] = useState(false);
  const [showText, setShowText] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Staggered animation sequence
      const timer1 = setTimeout(() => setShowContent(true), 300);
      const timer2 = setTimeout(() => setShowText(true), 1200);
      const timer3 = setTimeout(() => setShowButton(true), 2500);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    } else {
      setShowContent(false);
      setShowText(false);
      setShowButton(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Animated Background Overlay */}
      <div 
        className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-1000 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          >
            {i % 3 === 0 ? (
              <Sparkles className="w-4 h-4 text-primary/30" />
            ) : (
              <Star className="w-3 h-3 text-accent/30" />
            )}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative max-w-4xl mx-auto px-6">
        {/* Close Button */}
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="absolute -top-4 -right-4 z-10 w-12 h-12 rounded-full bg-background/10 backdrop-blur-sm border border-border/30 hover:bg-background/20 transition-all duration-200"
        >
          <X className="w-6 h-6 text-foreground" />
        </Button>

        {/* Content Container */}
        <div 
          className={`text-center transition-all duration-1000 transform ${
            showContent 
              ? 'scale-100 opacity-100 translate-y-0' 
              : 'scale-95 opacity-0 translate-y-8'
          }`}
        >
          {/* Image Container */}
          <div className="relative mb-8">
            {/* Solid background ring - no gradient */}
            <div className="absolute inset-0">
              <div className="w-80 h-80 mx-auto bg-primary/20 border-4 border-border" />
            </div>
            
            {/* Solid Border Frame */}
            <div className="relative w-80 h-80 mx-auto">
              <div className="absolute inset-0 bg-primary border-4 border-border">
                <div className="absolute inset-4 bg-background" />
              </div>
              
              {/* Image */}
              <div className="absolute inset-6 overflow-hidden border-4 border-border shadow-[4px_4px_0px_hsl(var(--border))]">
                <img 
                  src="https://tvfqqzphwwcgrvmkilzr.supabase.co/storage/v1/object/public/question-images/heru.png"
                  alt="Ancient African Elder"
                  className="w-full h-full object-cover animate-scale-in"
                  style={{ animationDelay: '0.5s', animationFillMode: 'both' }}
                />
              </div>
            </div>
          </div>

          {/* Text Animation */}
          <div 
            className={`space-y-6 transition-all duration-1000 transform ${
              showText 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-8'
            }`}
          >
            {/* Main Welcome Text */}
            <h1 className="text-4xl lg:text-6xl font-black text-primary animate-fade-in">
              Welcome Child of Africa
            </h1>
            
            {/* Subtitle */}
            <p className="text-2xl lg:text-3xl font-bold text-foreground animate-fade-in" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
              Learn from the Elders
            </p>
            
            {/* Decorative Line - solid, no gradient */}
            <div className="flex items-center justify-center space-x-4 animate-fade-in" style={{ animationDelay: '1s', animationFillMode: 'both' }}>
              <div className="h-1 bg-primary w-32" />
              <Sparkles className="w-6 h-6 text-primary" />
              <div className="h-1 bg-primary w-32" />
            </div>
            
            {/* Description */}
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '1.5s', animationFillMode: 'both' }}>
              Embark on a rich journey through the authentic history of the mother continent which gave birth to humanity. 
              Test your knowledge and discover the wisdom of ancient civilizations.
            </p>
          </div>

          {/* Enter Button */}
          <div 
            className={`mt-12 transition-all duration-700 transform ${
              showButton 
                ? 'opacity-100 translate-y-0 scale-100' 
                : 'opacity-0 translate-y-8 scale-95'
            }`}
          >
            <Button
              onClick={onClose}
              className="px-12 py-4 text-lg font-black neo-button bg-primary text-primary-foreground"
              style={{ animationDuration: '2s' }}
            >
              Begin Your Journey
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;