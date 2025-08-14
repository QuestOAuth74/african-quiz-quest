import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Bot, Sparkles } from "lucide-react";

interface GameModeSelectorProps {
  onSelectMode: (mode: 'single' | 'multiplayer') => void;
}

export function GameModeSelector({ onSelectMode }: GameModeSelectorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-jeopardy-gold rounded-full animate-pulse opacity-60" />
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-jeopardy-gold rounded-full animate-pulse opacity-40" />
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-jeopardy-gold rounded-full animate-pulse opacity-50" />
      </div>
      
      <div className="w-full max-w-5xl animate-fade-in">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Sparkles className="text-jeopardy-gold" size={32} />
            <h1 className="text-6xl md:text-7xl font-orbitron font-black gradient-text animate-pulse-gold">
              JEOPARDY!
            </h1>
            <Sparkles className="text-jeopardy-gold" size={32} />
          </div>
          <div className="font-exo text-2xl md:text-3xl text-jeopardy-gold mb-4 font-light tracking-wide">
            AFRICAN HISTORY EDITION
          </div>
          <p className="text-lg text-muted-foreground font-exo max-w-2xl mx-auto">
            Test your knowledge of African history in this authentic Jeopardy-style experience!
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="jeopardy-card hover:scale-105 transition-all duration-300 cursor-pointer group animate-scale-in border-jeopardy-gold/20">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-6 p-6 jeopardy-gold rounded-xl w-fit">
                <Bot size={56} className="text-jeopardy-blue-dark" />
              </div>
              <CardTitle className="text-3xl font-orbitron font-bold text-jeopardy-gold">
                SINGLE PLAYER
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center px-8 pb-8">
              <p className="text-card-foreground mb-8 font-exo text-lg leading-relaxed">
                Challenge our intelligent AI opponent. Perfect for practicing and mastering African history!
              </p>
              <Button 
                onClick={() => onSelectMode('single')} 
                className="w-full jeopardy-gold font-orbitron font-bold text-lg py-6 text-jeopardy-blue-dark hover:scale-105 transition-all duration-300"
                size="lg"
              >
                START GAME
              </Button>
            </CardContent>
          </Card>

          <Card className="jeopardy-card hover:scale-105 transition-all duration-300 cursor-pointer group animate-scale-in border-jeopardy-gold/20" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-6 p-6 jeopardy-gold rounded-xl w-fit">
                <Users size={56} className="text-jeopardy-blue-dark" />
              </div>
              <CardTitle className="text-3xl font-orbitron font-bold text-jeopardy-gold">
                TWO PLAYER
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center px-8 pb-8">
              <p className="text-card-foreground mb-8 font-exo text-lg leading-relaxed">
                Compete head-to-head with a friend. Who knows more about the rich history of Africa?
              </p>
              <Button 
                onClick={() => onSelectMode('multiplayer')} 
                className="w-full jeopardy-gold font-orbitron font-bold text-lg py-6 text-jeopardy-blue-dark hover:scale-105 transition-all duration-300"
                size="lg"
              >
                START GAME
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground font-exo">
            Think you know African history? Think again!
          </p>
        </div>
      </div>
    </div>
  );
}