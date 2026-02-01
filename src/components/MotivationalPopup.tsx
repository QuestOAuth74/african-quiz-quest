import { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useGameAudio } from '@/hooks/useGameAudio';

interface MotivationalPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const motivationalQuotes = [
  "\"The ancestors are always with you. Their wisdom guides your path.\" - Ancient African Proverb",
  "\"Ubuntu: I am because we are. Your knowledge honors our collective strength.\" - Zulu Philosophy",
  "\"Like the mighty baobab tree, your roots run deep with ancestral wisdom.\" - African Wisdom",
  "\"Sankofa teaches us: Look back to move forward. Learn from the past to shape the future.\" - Akan Principle",
  "\"The river that survives is the one that bends. Adapt and overcome.\" - African Proverb"
];

export const MotivationalPopup = ({ isOpen, onClose }: MotivationalPopupProps) => {
  const [quote] = useState(() => motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
  const { playCorrectAnswer } = useGameAudio();

  useEffect(() => {
    if (isOpen) {
      // Play motivational sound when popup opens
      setTimeout(() => {
        playCorrectAnswer();
      }, 300);
    }
  }, [isOpen, playCorrectAnswer]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gradient-to-br from-primary via-primary to-primary border-2 border-accent/50 shadow-2xl">
        <div className="relative overflow-hidden rounded-lg">
          {/* Close button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-2 right-2 z-10 text-accent/80 hover:text-accent hover:bg-primary/50"
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Crystals animation background */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              >
                <Sparkles 
                  className="text-accent/60 h-3 w-3"
                  style={{
                    filter: 'drop-shadow(0 0 4px hsl(var(--accent)))'
                  }}
                />
              </div>
            ))}
          </div>

          {/* Main content */}
          <div className="relative z-10 p-6 text-center">
            {/* Heru image with glow effect */}
            <div className="mb-4 relative">
              <img
                src="https://tvfqqzphwwcgrvmkilzr.supabase.co/storage/v1/object/public/question-images/heru.png"
                alt="Heru - Ancient Egyptian Falcon God"
                className="w-24 h-24 mx-auto rounded-full border-2 border-accent/50 animate-scale-in"
                style={{
                  filter: 'drop-shadow(0 0 12px hsl(var(--accent) / 0.4))',
                  boxShadow: '0 0 20px hsl(var(--accent) / 0.3)'
                }}
              />
              
              {/* Rotating glow ring */}
              <div className="absolute inset-0 rounded-full border-2 border-accent/30 animate-spin opacity-60"
                   style={{ animationDuration: '3s' }} />
            </div>

            {/* Motivational text */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-accent font-orbitron">
                Ancestral Encouragement
              </h3>
              <p className="text-accent/80 text-sm leading-relaxed italic">
                {quote}
              </p>
            </div>

            {/* Continue button */}
            <Button
              onClick={onClose}
              className="mt-4 bg-gradient-to-r from-accent to-accent/80 text-primary font-semibold hover:from-accent/80 hover:to-accent transition-all duration-300 shadow-lg"
            >
              Continue Your Journey
            </Button>
          </div>

          {/* Floating particles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-accent rounded-full animate-bounce opacity-70"
                style={{
                  left: `${20 + (i * 15)}%`,
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: `${2 + (i * 0.2)}s`
                }}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MotivationalPopup;