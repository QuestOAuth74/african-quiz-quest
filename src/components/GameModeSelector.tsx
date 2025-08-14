import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Bot, Sparkles, ArrowLeft, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { UserBadges } from "./UserBadges";

interface GameModeSelectorProps {
  onSelectMode: (mode: 'single' | 'multiplayer' | 'online-multiplayer', playerCount?: number) => void;
}

export function GameModeSelector({ onSelectMode }: GameModeSelectorProps) {
  const { user, isAuthenticated } = useAuth();
  const [showPlayerSelect, setShowPlayerSelect] = useState(false);
  
  const handleModeSelect = (mode: 'single' | 'multiplayer' | 'online-multiplayer') => {
    if (mode === 'multiplayer') {
      setShowPlayerSelect(true);
    } else {
      onSelectMode(mode);
    }
  };

  const handlePlayerCountSelect = (playerCount: number) => {
    onSelectMode('multiplayer', playerCount);
    setShowPlayerSelect(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden"
    >
      
      {/* Full Height Banner Image with Glowing Gold Band */}
      <div className="w-full h-screen p-2">
        <div className="w-full h-full relative rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(255,215,0,0.3),0_0_60px_rgba(255,215,0,0.2),0_0_90px_rgba(255,215,0,0.1)] bg-gradient-to-r from-yellow-400/20 via-yellow-500/30 to-yellow-400/20 p-1">
          <img 
            src="https://tvfqqzphwwcgrvmkilzr.supabase.co/storage/v1/object/public/question-images/jeopardy%20game%20banner.png"
            alt="African History Jeopardy Game Banner"
            className="w-full h-full object-cover rounded-xl"
          />
        </div>
      </div>

      {/* Content Section Below Banner */}
      <div className="bg-gradient-to-br from-theme-brown-dark via-background to-theme-brown p-8">
        <div className="max-w-5xl mx-auto">
          
          {/* Welcome Message with Badges for Authenticated Users - Below banner */}
          {isAuthenticated && user && (
            <div className="mb-8 p-6 bg-background/80 backdrop-blur-sm rounded-lg border border-theme-yellow/20 max-w-xl mx-auto">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Trophy className="h-5 w-5 text-theme-yellow" />
                <h3 className="text-xl font-semibold text-theme-yellow">
                  Welcome back, Champion!
                </h3>
              </div>
              <div className="flex justify-center gap-2 mb-2">
                <UserBadges userId={user.id} limit={6} showTooltip={true} />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Keep playing to unlock more achievements!
              </p>
            </div>
          )}

          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Sparkles className="text-theme-yellow animate-pulse" size={32} />
              <h1 className="text-6xl md:text-7xl font-bold gradient-text animate-pulse-yellow">
                JEOPARDY!
              </h1>
              <Sparkles className="text-theme-yellow animate-pulse" size={32} />
            </div>
            <div className="text-2xl md:text-3xl text-theme-yellow mb-4 font-light tracking-wide">
              AFRICAN HISTORY EDITION
            </div>
            <p className="text-theme-yellow-light text-lg md:text-xl font-medium mb-4">
              A free educational game from <span className="text-theme-yellow font-semibold">The Historia Africana</span> YouTube Channel
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Test your knowledge of African history in this authentic Jeopardy-style experience!
            </p>
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
                  onClick={() => handleModeSelect('single')} 
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
                  MULTIPLAYER
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center px-8 pb-8">
                <p className="text-card-foreground mb-8 text-lg leading-relaxed">
                  Compete with 2-4 players. Who knows more about the rich history of Africa?
                </p>
                <Button 
                  onClick={() => handleModeSelect('multiplayer')} 
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
              Educational content crafted by <span className="text-theme-yellow font-medium">The Historia Africana Youtube Channel</span> • Bringing African history to life
            </p>
          </div>
        </div>
      </div>

      {/* Player Count Selection Modal */}
      {showPlayerSelect && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <Card className="jeopardy-card max-w-md w-full animate-scale-in">
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-between mb-4">
                <Button
                  onClick={() => setShowPlayerSelect(false)}
                  variant="outline"
                  size="sm"
                  className="jeopardy-button"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
                <CardTitle className="text-2xl font-bold text-theme-yellow">
                  SELECT PLAYERS
                </CardTitle>
                <div className="w-16" /> {/* Spacer for balance */}
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pb-8">
              <p className="text-center text-card-foreground mb-6">
                How many players will compete?
              </p>
              <div className="grid grid-cols-1 gap-3">
                {[2, 3, 4].map((count) => (
                  <Button
                    key={count}
                    onClick={() => handlePlayerCountSelect(count)}
                    className="w-full jeopardy-gold font-bold text-lg py-4 hover:scale-105 transition-all duration-300"
                    size="lg"
                  >
                    <Users className="w-5 h-5 mr-2" />
                    {count} PLAYERS
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}