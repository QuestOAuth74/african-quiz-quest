import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SinglePlayerSetupProps {
  open: boolean;
  onClose: () => void;
  onStartGame: (difficulty: 'easy' | 'medium' | 'hard') => void;
}

export const SinglePlayerSetup = ({ open, onClose, onStartGame }: SinglePlayerSetupProps) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const difficulties = [
    {
      level: 'easy' as const,
      title: 'Easy',
      description: 'Computer takes longer to think and makes random guesses',
      color: 'bg-green-500',
      features: ['Slower computer moves', 'Random letter selection', 'Solves at 80% completion']
    },
    {
      level: 'medium' as const,
      title: 'Medium',
      description: 'Balanced gameplay with moderate computer intelligence',
      color: 'bg-yellow-500',
      features: ['Moderate thinking time', 'Smart letter selection', 'Solves at 60% completion']
    },
    {
      level: 'hard' as const,
      title: 'Hard',
      description: 'Quick and strategic computer opponent',
      color: 'bg-red-500',
      features: ['Fast computer moves', 'Strategic gameplay', 'Buys vowels', 'Solves at 40% completion']
    }
  ];

  const handleStartGame = () => {
    onStartGame(selectedDifficulty);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">Choose Difficulty</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {difficulties.map((diff) => (
            <Card 
              key={diff.level}
              className={`cursor-pointer transition-all duration-200 ${
                selectedDifficulty === diff.level 
                  ? 'ring-2 ring-primary shadow-lg' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedDifficulty(diff.level)}
            >
              <CardHeader className="text-center">
                <div className={`w-12 h-12 ${diff.color} rounded-full mx-auto mb-2 flex items-center justify-center`}>
                  <span className="text-white font-bold text-lg">
                    {diff.level === 'easy' ? '🟢' : diff.level === 'medium' ? '🟡' : '🔴'}
                  </span>
                </div>
                <CardTitle>{diff.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{diff.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {diff.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleStartGame}>
            Start Game vs {difficulties.find(d => d.level === selectedDifficulty)?.title} Computer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};