import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Bot } from "lucide-react";

interface GameModeSelectorProps {
  onSelectMode: (mode: 'single' | 'multiplayer') => void;
}

export function GameModeSelector({ onSelectMode }: GameModeSelectorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-primary mb-4">African History Jeopardy</h1>
          <p className="text-xl text-muted-foreground">
            Test your knowledge of African history in this exciting quiz game!
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover:bg-accent transition-colors cursor-pointer group">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
                <Bot size={48} className="text-primary" />
              </div>
              <CardTitle className="text-2xl">Play vs Computer</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-6">
                Challenge our AI opponent in a single-player game. Perfect for practicing and learning!
              </p>
              <Button 
                onClick={() => onSelectMode('single')} 
                className="w-full"
                size="lg"
              >
                Start Single Player
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:bg-accent transition-colors cursor-pointer group">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
                <Users size={48} className="text-primary" />
              </div>
              <CardTitle className="text-2xl">Two Player Mode</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-6">
                Play with a friend! Take turns answering questions and see who knows more about African history.
              </p>
              <Button 
                onClick={() => onSelectMode('multiplayer')} 
                className="w-full"
                size="lg"
              >
                Start Two Player
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}