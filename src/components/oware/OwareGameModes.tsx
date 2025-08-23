import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { User, Users, BookOpen } from 'lucide-react';

interface OwareGameModesProps {
  onSelectMode: (mode: 'single-player' | 'multiplayer' | 'tutorial') => void;
}

export const OwareGameModes = ({ onSelectMode }: OwareGameModesProps) => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center space-y-8">
        {/* Game Title */}
        <div>
          <h1 className="text-4xl font-bold text-primary mb-4">Oware</h1>
          <p className="text-lg text-muted-foreground">
            The ancient African strategy game
          </p>
        </div>

        {/* Game Mode Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Single Player */}
          <Card className="hover-scale cursor-pointer hover:shadow-lg transition-all duration-200" 
                onClick={() => onSelectMode('single-player')}>
            <CardContent className="p-6 text-center">
              <div className="mb-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Single Player</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Play against AI opponents
              </p>
              <Button variant="outline" className="w-full">
                Start Game
              </Button>
            </CardContent>
          </Card>

          {/* Multiplayer */}
          <Card className="hover-scale cursor-pointer hover:shadow-lg transition-all duration-200" 
                onClick={() => onSelectMode('multiplayer')}>
            <CardContent className="p-6 text-center">
              <div className="mb-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Multiplayer</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Play with friends online
              </p>
              <Button variant="outline" className="w-full">
                Join Lobby
              </Button>
            </CardContent>
          </Card>

          {/* Tutorial */}
          <Card className="hover-scale cursor-pointer hover:shadow-lg transition-all duration-200" 
                onClick={() => onSelectMode('tutorial')}>
            <CardContent className="p-6 text-center">
              <div className="mb-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Tutorial</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Learn how to play
              </p>
              <Button variant="outline" className="w-full">
                Learn Rules
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Game Rules Summary */}
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Standard Oware (Abapa) Rules</h3>
            <div className="text-sm text-muted-foreground space-y-2 text-left">
              <p>• <strong>Objective:</strong> Capture more than 24 stones (more than half of 48 total)</p>
              <p>• <strong>Sowing:</strong> Pick up all stones from your pit and distribute counter-clockwise</p>
              <p>• <strong>Capture:</strong> When your last stone lands in opponent's pit with 2-3 stones</p>
              <p>• <strong>Chain Capture:</strong> Continue capturing backwards from adjacent 2-3 stone pits</p>
              <p>• <strong>Feed Rule:</strong> Cannot capture all opponent's stones - they must have moves available</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};