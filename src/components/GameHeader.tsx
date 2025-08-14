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
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Sparkles className="text-jeopardy-gold animate-pulse" size={24} />
          <h1 className="text-3xl md:text-4xl font-orbitron font-black gradient-text">
            JEOPARDY!
          </h1>
          <Sparkles className="text-jeopardy-gold animate-pulse" size={24} />
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-muted-foreground font-exo">Round</div>
            <div className="text-lg font-orbitron font-bold text-jeopardy-gold">
              {currentRound} / {totalRounds}
            </div>
          </div>
          <Button 
            onClick={onNewGame} 
            variant="outline"
            className="jeopardy-button font-orbitron font-bold hover:jeopardy-gold text-sm"
            size="sm"
          >
            <Home className="mr-2" size={14} />
            NEW GAME
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {players.map((player, index) => (
          <Card 
            key={player.id} 
            className={`jeopardy-card transition-all duration-300 ${
              player.isActive 
                ? 'animate-glow border-jeopardy-gold/60' 
                : 'border-jeopardy-blue-light/30'
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {/* Custom Player Icons */}
                    <div className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all duration-300 ${
                      player.isActive 
                        ? 'border-jeopardy-gold shadow-lg shadow-jeopardy-gold/50 animate-pulse' 
                        : 'border-muted opacity-70'
                    }`}>
                      <img 
                        src={
                          player.id === 'player1' || player.id === 'computer'
                            ? "https://tvfqqzphwwcgrvmkilzr.supabase.co/storage/v1/object/public/question-images/historia%20africana%201.png"
                            : "https://tvfqqzphwwcgrvmkilzr.supabase.co/storage/v1/object/public/question-images/historia%20africana%202.png"
                        }
                        alt={`${player.name} avatar`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {player.id === leader.id && player.score > 0 && (
                      <Trophy className="absolute -top-1 -right-1 text-jeopardy-gold bg-background rounded-full p-0.5" size={16} />
                    )}
                  </div>
                  <div>
                    <div className="font-orbitron font-bold text-lg text-jeopardy-gold">
                      {player.name}
                    </div>
                    <div className="flex items-center gap-2">
                      {gameMode === 'single' && player.id === 'computer' && (
                        <span className="text-xs jeopardy-gold px-2 py-1 rounded-full font-orbitron font-bold">
                          AI
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
                  <div className="text-2xl font-orbitron font-black text-jeopardy-gold jeopardy-text-glow">
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