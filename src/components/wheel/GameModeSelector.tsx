import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Bot, Zap, Trophy } from 'lucide-react';

interface GameModeSelectorProps {
  onSelectMode: (mode: 'single' | 'challenge' | 'live-multiplayer', difficulty?: 'easy' | 'medium' | 'hard') => void;
}

export const GameModeSelector = ({ onSelectMode }: GameModeSelectorProps) => {
  const [showDifficultyModal, setShowDifficultyModal] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const handleSinglePlayer = () => {
    setShowDifficultyModal(true);
  };

  const handleStartSinglePlayer = () => {
    setShowDifficultyModal(false);
    onSelectMode('single', selectedDifficulty);
  };

  const modes = [
    {
      id: 'single',
      title: 'Single Player',
      description: 'Test your knowledge against an intelligent AI opponent',
      icon: Bot,
      color: 'bg-gradient-to-br from-primary/20 to-primary/10',
      onClick: handleSinglePlayer
    },
    {
      id: 'challenge',
      title: 'Challenge Friends',
      description: 'Send direct challenges to specific players online',
      icon: Users,
      color: 'bg-gradient-to-br from-secondary/20 to-secondary/10',
      onClick: () => onSelectMode('challenge')
    }
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 max-w-4xl mx-auto">
        {modes.map((mode) => {
          const IconComponent = mode.icon;
          return (
            <Card 
              key={mode.id} 
              className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${mode.color} border-2 hover:border-primary/50`}
              onClick={mode.onClick}
            >
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <IconComponent className="h-12 w-12 text-primary" />
                </div>
                <CardTitle className="text-xl">{mode.title}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {mode.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={(e) => {
                  e.stopPropagation();
                  mode.onClick();
                }}>
                  Play Now
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={showDifficultyModal} onOpenChange={setShowDifficultyModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Choose Difficulty
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={selectedDifficulty} onValueChange={(value: 'easy' | 'medium' | 'hard') => setSelectedDifficulty(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">
                  <div className="flex flex-col">
                    <span className="font-medium">Easy</span>
                    <span className="text-sm text-muted-foreground">Perfect for beginners</span>
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex flex-col">
                    <span className="font-medium">Medium</span>
                    <span className="text-sm text-muted-foreground">Balanced challenge</span>
                  </div>
                </SelectItem>
                <SelectItem value="hard">
                  <div className="flex flex-col">
                    <span className="font-medium">Hard</span>
                    <span className="text-sm text-muted-foreground">Expert level opponent</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowDifficultyModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleStartSinglePlayer} className="flex-1">
                Start Game
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};