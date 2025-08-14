import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Bot, Sparkles, Settings } from "lucide-react";
import { Link } from "react-router-dom";

interface GameModeSelectorProps {
  onSelectMode: (mode: 'single' | 'multiplayer') => void;
}

export function GameModeSelector({ onSelectMode }: GameModeSelectorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Admin Access Button */}
      <div className="absolute top-4 right-4 z-50">
        <Link to="/admin/login">
          <Button variant="ghost" size="sm" className="text-theme-yellow hover:text-theme-yellow-light hover:bg-theme-yellow/10 border border-theme-yellow/20">
            <Settings className="w-4 h-4 mr-2" />
            Admin
          </Button>
        </Link>
      </div>
      
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-theme-yellow rounded-full animate-pulse opacity-60" />
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-theme-yellow rounded-full animate-pulse opacity-40" />
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-theme-yellow rounded-full animate-pulse opacity-50" />
      </div>
      
      <div className="w-full max-w-5xl animate-fade-in">
        {/* Banner Image Section */}
        <div className="mb-8">
          <div className="relative rounded-xl overflow-hidden shadow-2xl border border-theme-yellow/20 mb-6">
            <img 
              src="https://tvfqqzphwwcgrvmkilzr.supabase.co/storage/v1/object/public/question-images/jeopardy%20game%20banner.png"
              alt="African History Jeopardy Game Banner"
              className="w-full h-48 md:h-64 lg:h-72 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-theme-brown-dark/80 via-transparent to-transparent"></div>
          </div>
          
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="text-theme-yellow animate-pulse" size={32} />
              <h1 className="text-5xl md:text-6xl font-bold gradient-text animate-pulse-yellow">
                JEOPARDY!
              </h1>
              <Sparkles className="text-theme-yellow animate-pulse" size={32} />
            </div>
            <div className="text-xl md:text-2xl text-theme-yellow mb-3 font-light tracking-wide">
              AFRICAN HISTORY EDITION
            </div>
            <p className="text-theme-yellow-light text-sm md:text-base font-medium mb-2">
              A free educational game from <span className="text-theme-yellow font-semibold">The Historia Africana</span> YouTube Channel
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Test your knowledge of African history in this authentic Jeopardy-style experience!
            </p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="jeopardy-card hover:scale-105 transition-all duration-300 cursor-pointer group animate-scale-in border-theme-yellow/20">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-6 p-6 bg-gradient-to-br from-theme-yellow to-theme-yellow-dark rounded-xl w-fit shadow-lg">
                <Bot size={56} className="text-theme-brown" />
              </div>
              <CardTitle className="text-3xl font-bold text-theme-yellow">
                SINGLE PLAYER
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center px-8 pb-8">
              <p className="text-card-foreground mb-8 text-lg leading-relaxed">
                Challenge our intelligent AI opponent. Perfect for practicing and mastering African history!
              </p>
              <Button 
                onClick={() => onSelectMode('single')} 
                className="w-full jeopardy-gold font-bold text-lg py-6 hover:scale-105 transition-all duration-300"
                size="lg"
              >
                START GAME
              </Button>
            </CardContent>
          </Card>

          <Card className="jeopardy-card hover:scale-105 transition-all duration-300 cursor-pointer group animate-scale-in border-theme-yellow/20" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-6 p-6 bg-gradient-to-br from-theme-yellow to-theme-yellow-dark rounded-xl w-fit shadow-lg">
                <Users size={56} className="text-theme-brown" />
              </div>
              <CardTitle className="text-3xl font-bold text-theme-yellow">
                TWO PLAYER
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center px-8 pb-8">
              <p className="text-card-foreground mb-8 text-lg leading-relaxed">
                Compete head-to-head with a friend. Who knows more about the rich history of Africa?
              </p>
              <Button 
                onClick={() => onSelectMode('multiplayer')} 
                className="w-full jeopardy-gold font-bold text-lg py-6 hover:scale-105 transition-all duration-300"
                size="lg"
              >
                START GAME
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground mb-2">
            Think you know African history? Think again!
          </p>
          <p className="text-xs text-muted-foreground">
            Educational content crafted by <span className="text-theme-yellow font-medium">The Historia Africana</span> • Bringing African history to life
          </p>
        </div>
      </div>
    </div>
  );
}