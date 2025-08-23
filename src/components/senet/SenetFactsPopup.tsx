import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Scroll } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SenetFactsPopupProps {
  gamePhase: string;
  moveCount: number;
  onClose: () => void;
}

const SENET_FACTS = [
  {
    title: "The Game of Passing",
    text: "Senet, meaning 'passing', represents the soul's journey through the Duat (underworld). Each square symbolizes challenges the deceased must overcome to reach the afterlife.",
    phase: "any"
  },
  {
    title: "House of Rebirth",
    text: "Square 26, known as the 'House of Rebirth', grants new life to pieces that land upon it. Ancient texts speak of this as where Ra emerges renewed each dawn.",
    phase: "moving"
  },
  {
    title: "The Waters of Chaos",
    text: "Square 27 represents the dangerous waters of Nun, the primordial chaos. Pieces landing here may be swept away, just as souls might be lost in the cosmic waters.",
    phase: "moving"
  },
  {
    title: "Three Judges",
    text: "The final three squares represent the judges of the dead: Horus, Thoth, and Osiris. Only by their favor can the soul complete its sacred journey.",
    phase: "moving"
  },
  {
    title: "Casting of Fate",
    text: "The throwing sticks represent the casting of fate by the gods. Four light sides up grants passage like the blessing of the four Sons of Horus.",
    phase: "throwing"
  },
  {
    title: "Sacred Number Seven",
    text: "Moving seven squares connects to the seven sacred oils used in mummification and the seven gates the soul must pass in the underworld journey.",
    phase: "any"
  },
  {
    title: "House of Happiness",
    text: "Square 28, the 'House of Happiness', offers sanctuary to weary souls. Here the deceased finds rest before the final judgment of their heart.",
    phase: "moving"
  },
  {
    title: "The Great Reversal",
    text: "When pieces move backward, they mirror the daily journey of Ra through the underworld, traveling east to west before emerging reborn at dawn.",
    phase: "moving"
  },
  {
    title: "Passage of Ra",
    text: "The zigzag path of Senet reflects Ra's nightly voyage through the twelve hours of night, facing serpents and demons in the dark realm.",
    phase: "any"
  },
  {
    title: "Voice of Truth",
    text: "In the afterlife, the deceased must speak the names of gatekeepers and demons. Knowledge grants safe passage, ignorance brings destruction.",
    phase: "any"
  }
];

export const SenetFactsPopup = ({ gamePhase, moveCount, onClose }: SenetFactsPopupProps) => {
  const [currentFact, setCurrentFact] = useState<typeof SENET_FACTS[0] | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [lastShownTime, setLastShownTime] = useState<number>(0);

  useEffect(() => {
    const now = Date.now();
    const threeMinutes = 3 * 60 * 1000; // 3 minutes in milliseconds
    
    // Show facts every 3 minutes, but only if the game has started (moveCount > 0)
    if (moveCount > 0 && (now - lastShownTime) >= threeMinutes) {
      // Filter facts based on current game phase
      const relevantFacts = SENET_FACTS.filter(fact => 
        fact.phase === 'any' || fact.phase === gamePhase
      );
      
      if (relevantFacts.length > 0) {
        const randomFact = relevantFacts[Math.floor(Math.random() * relevantFacts.length)];
        setCurrentFact(randomFact);
        setIsVisible(true);
        setLastShownTime(now);
        
        // Auto-hide after 8 seconds
        const timer = setTimeout(() => {
          handleClose();
        }, 8000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [moveCount, gamePhase, lastShownTime]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      setCurrentFact(null);
      onClose();
    }, 300);
  };

  if (!currentFact) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      <Card 
        className={cn(
          "max-w-md border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950/90 dark:to-orange-950/90 shadow-2xl transition-all duration-300",
          isVisible ? "animate-scale-in opacity-100" : "animate-scale-out opacity-0"
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scroll className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <CardTitle className="text-lg text-amber-800 dark:text-amber-200">
                Ancient Wisdom
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0 text-amber-600 hover:bg-amber-200 dark:text-amber-400 dark:hover:bg-amber-900"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <h3 className="font-semibold text-amber-900 dark:text-amber-100">
            {currentFact.title}
          </h3>
          <p className="text-amber-800 dark:text-amber-200 leading-relaxed">
            {currentFact.text}
          </p>
          <div className="flex justify-center pt-2">
            <div className="text-2xl">𓋹</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};