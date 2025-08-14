import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Player {
  id: string;
  name: string;
  score: number;
  isActive: boolean;
}

interface GameHeaderProps {
  players: Player[];
  gameMode: 'single' | 'multiplayer';
  onNewGame: () => void;
  currentRound?: number;
  totalRounds?: number;
}

export function GameHeader({ players, gameMode, onNewGame, currentRound = 1, totalRounds = 1 }: GameHeaderProps) {
  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold text-primary">African History Jeopardy</h1>
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground">Round {currentRound} of {totalRounds}</span>
          <Button onClick={onNewGame} variant="outline">
            New Game
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {players.map((player) => (
          <Card 
            key={player.id} 
            className={`${player.isActive ? 'ring-2 ring-primary bg-primary/5' : ''} transition-all`}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${player.isActive ? 'bg-primary' : 'bg-muted'}`} />
                <span className="font-semibold text-lg">{player.name}</span>
                {gameMode === 'single' && player.id === 'computer' && (
                  <span className="text-xs bg-secondary px-2 py-1 rounded-full">AI</span>
                )}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">${player.score}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}