import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface GameSetupProps {
  onStartGame: (difficulty: 'easy' | 'medium' | 'hard') => void;
}

export const GameSetup = ({ onStartGame }: GameSetupProps) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const difficultyInfo = {
    easy: {
      title: 'Novice Scribe',
      description: 'The AI makes mostly random moves with occasional good decisions',
      icon: '𓂋',
      color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
    },
    medium: {
      title: 'Temple Priest', 
      description: 'The AI uses basic strategy and tactical thinking',
      icon: '𓊪',
      color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100'
    },
    hard: {
      title: 'Pharaoh\'s Champion',
      description: 'The AI employs advanced strategy, blocking, and forward planning',
      icon: '𓋹',
      color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <div className="text-6xl">𓋹</div>
        <h1 className="text-4xl font-bold text-foreground">Ancient Senet</h1>
        <p className="text-lg text-muted-foreground">
          Journey through the afterlife in the sacred game of the Pharaohs
        </p>
      </div>

      <Card className="border-amber-200 dark:border-amber-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-amber-600">𓆃</span>
            About Senet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Senet is one of the oldest known board games, played in ancient Egypt over 5,000 years ago. 
            Archaeological evidence shows it was enjoyed by pharaohs and commoners alike, including 
            Tutankhamun who was buried with multiple Senet sets.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Game Objective</h4>
              <p className="text-muted-foreground">
                Race your pieces through the underworld and be the first to reach the afterlife 
                by moving all pieces off the board.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Sacred Mechanics</h4>
              <p className="text-muted-foreground">
                Use throwing sticks to determine movement, navigate special squares with 
                mystical powers, and capture opponent pieces.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>Choose Your Opponent</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(Object.keys(difficultyInfo) as Array<keyof typeof difficultyInfo>).map((difficulty) => (
              <div
                key={difficulty}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  selectedDifficulty === difficulty
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedDifficulty(difficulty)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{difficultyInfo[difficulty].icon}</span>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {difficultyInfo[difficulty].title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {difficultyInfo[difficulty].description}
                      </p>
                    </div>
                  </div>
                  <Badge className={difficultyInfo[difficulty].color}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-6" />

          <div className="flex justify-center">
            <Button
              onClick={() => onStartGame(selectedDifficulty)}
              size="lg"
              className="bg-amber-600 hover:bg-amber-700 text-white min-w-48"
            >
              <span className="text-lg mr-2">𓋹</span>
              Begin Sacred Journey
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};