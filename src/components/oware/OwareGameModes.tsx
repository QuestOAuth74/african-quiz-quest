import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bot, Users, Trophy, Zap } from 'lucide-react';

interface OwareGameModesProps {
  onSelectMode: (mode: 'single-player' | 'multiplayer' | 'tutorial') => void;
  selectedRules: 'anan-anan' | 'abapa';
  onRulesChange: (rules: 'anan-anan' | 'abapa') => void;
}

export const OwareGameModes = ({ onSelectMode, selectedRules, onRulesChange }: OwareGameModesProps) => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
          Oware
        </h1>
        <p className="text-muted-foreground mt-2">
          The Ancient African Game of Strategy
        </p>
        <div className="flex justify-center mt-4 text-2xl space-x-2 opacity-60">
          <span>𓀀</span>
          <span>𓂧</span>
          <span>𓃭</span>
          <span>𓄿</span>
          <span>𓅓</span>
        </div>
        
        {/* Rule Selection */}
        <Card className="mt-6 max-w-md mx-auto">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Game Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedRules} onValueChange={onRulesChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="anan-anan">Anan-Anan (Four-Four) - Fast-paced</SelectItem>
                <SelectItem value="abapa">Abapa - Strategic</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-2">
              {selectedRules === 'anan-anan' 
                ? 'Capture when pits reach 4 stones, continue sowing until empty pit'
                : 'Capture 2-3 stones from opponent\'s side, first to 25+ wins'
              }
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Single Player */}
        <Card className="hover:shadow-lg transition-all duration-300 border-amber-200 hover:border-amber-400">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-xl">Single Player</CardTitle>
            <CardDescription>
              Challenge the AI in three difficulty levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => onSelectMode('single-player')}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              Play vs AI
            </Button>
          </CardContent>
        </Card>

        {/* Multiplayer */}
        <Card className="hover:shadow-lg transition-all duration-300 border-amber-200 hover:border-amber-400">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-xl">Multiplayer</CardTitle>
            <CardDescription>
              Play against friends online in real-time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => onSelectMode('multiplayer')}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              Play Online
            </Button>
          </CardContent>
        </Card>

        {/* Tutorial */}
        <Card className="hover:shadow-lg transition-all duration-300 border-amber-200 hover:border-amber-400">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mb-4">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-xl">Learn to Play</CardTitle>
            <CardDescription>
              Interactive tutorial for beginners
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => onSelectMode('tutorial')}
              variant="outline"
              className="w-full border-orange-300 text-orange-600 hover:bg-orange-50"
            >
              Start Tutorial
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Game Rules Summary */}
      <Card className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <Zap className="w-5 h-5" />
            Quick Rules
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-amber-700 space-y-2">
          <p><strong>Current Rules: {selectedRules === 'anan-anan' ? 'Anan-Anan (Four-Four)' : 'Abapa'}</strong></p>
          <p>• <strong>Objective:</strong> Capture more stones than your opponent</p>
          <p>• <strong>Sowing:</strong> Pick up all stones from one of your pits and distribute them counter-clockwise</p>
          {selectedRules === 'anan-anan' ? (
            <>
              <p>• <strong>Capture:</strong> When any pit reaches 4 stones during distribution</p>
              <p>• <strong>Continue:</strong> Keep sowing from last pit until reaching an empty pit</p>
              <p>• <strong>End:</strong> When 8 stones remain, last capturer takes all</p>
            </>
          ) : (
            <>
              <p>• <strong>Capture:</strong> Last stone in opponent's pit with 2-3 stones</p>
              <p>• <strong>End:</strong> First player to capture more than 24 stones wins</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};