import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Brain, Swords, Crown, Bot, Users, Globe } from 'lucide-react';
import { SenetMultiplayerLobby } from './SenetMultiplayerLobby';

interface GameSetupProps {
  onStartGame: (difficulty: 'easy' | 'medium' | 'hard') => void;
}

export const GameSetup = ({ onStartGame }: GameSetupProps) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [gameMode, setGameMode] = useState<'single' | 'multiplayer'>('single');

  const gameModeOptions = [
    {
      mode: 'single' as const,
      title: 'Single Player',
      description: 'Play against the AI pharaoh',
      icon: Bot,
      color: 'bg-blue-500',
    },
    {
      mode: 'multiplayer' as const,
      title: 'Online Multiplayer',
      description: 'Challenge other players worldwide',
      icon: Globe,
      color: 'bg-purple-500',
    },
  ];

  const difficultyOptions = [
    {
      level: 'easy' as const,
      title: 'Apprentice Scribe',
      description: 'Perfect for learning the sacred rules',
      icon: Brain,
      color: 'bg-green-500',
    },
    {
      level: 'medium' as const,
      title: 'Temple Guardian',
      description: 'Balanced challenge for experienced players',
      icon: Swords,
      color: 'bg-yellow-500',
    },
    {
      level: 'hard' as const,
      title: 'Pharaoh\'s Champion',
      description: 'Ultimate test worthy of the gods',
      icon: Crown,
      color: 'bg-red-500',
    },
  ];

  if (gameMode === 'multiplayer') {
    return <SenetMultiplayerLobby />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pt-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="text-6xl animate-pulse text-amber-600 dark:text-amber-400">𓋹</div>
          <h1 className="text-4xl font-bold text-amber-900 dark:text-amber-100">Ancient Senet</h1>
          <div className="text-6xl animate-pulse text-amber-600 dark:text-amber-400">𓋹</div>
        </div>
        <p className="text-xl text-amber-700 dark:text-amber-200 max-w-2xl mx-auto">
          Journey through the underworld in this sacred game of ancient Egypt. 
          Navigate the path to eternal life using strategy, luck, and divine favor.
        </p>
      </div>

      {/* Game Mode Selection */}
      <Card className="border-primary/20 shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-3">
            <Users className="h-7 w-7 text-primary" />
            Choose Game Mode
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gameModeOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Card
                  key={option.mode}
                  className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                    gameMode === option.mode
                      ? 'ring-4 ring-primary shadow-2xl'
                      : 'hover:shadow-lg'
                  }`}
                  onClick={() => setGameMode(option.mode)}
                >
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="flex items-center justify-center">
                      <div className={`p-4 rounded-full ${option.color} text-white shadow-lg`}>
                        <Icon className="h-8 w-8" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold">{option.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                    {gameMode === option.mode && (
                      <Badge className="bg-primary text-primary-foreground">
                        Selected
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          <Separator />
          
          {gameMode === 'single' && (
            <>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-center">Select AI Difficulty</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {difficultyOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <Card
                        key={option.level}
                        className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                          selectedDifficulty === option.level
                            ? 'ring-2 ring-primary'
                            : ''
                        }`}
                        onClick={() => setSelectedDifficulty(option.level)}
                      >
                        <CardContent className="p-4 text-center space-y-3">
                          <div className="flex items-center justify-center">
                            <div className={`p-3 rounded-full ${option.color} text-white`}>
                              <Icon className="h-6 w-6" />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-bold">{option.title}</h4>
                            <p className="text-xs text-muted-foreground">
                              {option.description}
                            </p>
                          </div>
                          {selectedDifficulty === option.level && (
                            <Badge variant="secondary" className="text-xs">
                              Selected
                            </Badge>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
              
              <div className="text-center space-y-4">
                <Button
                  onClick={() => onStartGame(selectedDifficulty)}
                  size="lg"
                  className="px-8 py-6 text-lg font-bold shadow-lg hover:shadow-xl transition-all"
                >
                  <Crown className="h-5 w-5 mr-3" />
                  Begin Sacred Journey
                  <Crown className="h-5 w-5 ml-3" />
                </Button>
                <p className="text-sm text-muted-foreground">
                  Your quest through the afterlife awaits...
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};