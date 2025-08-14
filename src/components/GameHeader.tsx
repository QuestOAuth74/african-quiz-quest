import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Home, Sparkles } from "lucide-react";

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
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const leader = sortedPlayers[0];

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Sparkles className="text-jeopardy-gold animate-pulse" size={28} />
          <h1 className="text-4xl md:text-5xl font-orbitron font-black gradient-text">
            JEOPARDY!
          </h1>
          <Sparkles className="text-jeopardy-gold animate-pulse" size={28} />
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-muted-foreground font-exo">Round</div>
            <div className="text-xl font-orbitron font-bold text-jeopardy-gold">
              {currentRound} / {totalRounds}
            </div>
          </div>
          <Button 
            onClick={onNewGame} 
            variant="outline"
            className="jeopardy-button font-orbitron font-bold hover:jeopardy-gold"
          >
            <Home className="mr-2" size={16} />
            NEW GAME
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {players.map((player, index) => (
          <Card 
            key={player.id} 
            className={`jeopardy-card transition-all duration-300 ${
              player.isActive 
                ? 'animate-glow border-jeopardy-gold/60' 
                : 'border-jeopardy-blue-light/30'
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className={`w-4 h-4 rounded-full transition-all duration-300 ${
                      player.isActive 
                        ? 'bg-jeopardy-gold animate-pulse shadow-lg shadow-jeopardy-gold/50' 
                        : 'bg-muted'
                    }`} />
                    {player.id === leader.id && player.score > 0 && (
                      <Trophy className="absolute -top-1 -right-1 text-jeopardy-gold" size={12} />
                    )}
                  </div>
                  <div>
                    <div className="font-orbitron font-bold text-xl text-jeopardy-gold">
                      {player.name}
                    </div>
                    <div className="flex items-center gap-2">
                      {gameMode === 'single' && player.id === 'computer' && (
                        <span className="text-xs jeopardy-gold px-2 py-1 rounded-full font-orbitron font-bold">
                          AI OPPONENT
                        </span>
                      )}
                      {player.id === leader.id && player.score > 0 && (
                        <span className="text-xs bg-jeopardy-gold text-jeopardy-blue-dark px-2 py-1 rounded-full font-orbitron font-bold">
                          LEADER
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-orbitron font-black text-jeopardy-gold jeopardy-text-glow">
                    ${player.score.toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}