import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Bot, Sparkles, ArrowLeft, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { UserBadges } from "./UserBadges";
import { useIsMobile } from "@/hooks/use-mobile";

interface GameModeSelectorProps {
  onSelectMode: (mode: 'single' | 'multiplayer' | 'online-multiplayer', playerCount?: number) => void;
}

export function GameModeSelector({ onSelectMode }: GameModeSelectorProps) {
  const { user, isAuthenticated } = useAuth();
  const [showPlayerSelect, setShowPlayerSelect] = useState(false);
  const isMobile = useIsMobile();
  
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
      <div className={`w-full p-2 ${isMobile ? 'h-[40vh]' : 'h-[50vh] sm:h-[60vh] md:h-screen'}`}>
        <div className="w-full h-full relative rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(255,215,0,0.3),0_0_60px_rgba(255,215,0,0.2),0_0_90px_rgba(255,215,0,0.1)] bg-gradient-to-r from-yellow-400/20 via-yellow-500/30 to-yellow-400/20 p-1">
          <img 
            src="https://tvfqqzphwwcgrvmkilzr.supabase.co/storage/v1/object/public/question-images/jeopardy%20game%20banner.png"
            alt="African History Jeopardy Game Banner"
            className={`w-full h-full rounded-xl ${isMobile ? 'object-contain' : 'object-cover'}`}
          />
        </div>
      </div>

      {/* Content Section Below Banner */}
      <div className="bg-gradient-to-br from-theme-brown-dark via-background to-theme-brown p-4 sm:p-6 md:p-8">
        <div className="max-w-5xl mx-auto">
          
          {/* Sign Up/Login Message for Non-Authenticated Users */}
          {!isAuthenticated && (
            <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-gradient-to-r from-theme-yellow/20 via-theme-yellow/30 to-theme-yellow/20 backdrop-blur-sm rounded-lg border-2 border-theme-yellow/50 max-w-2xl mx-auto shadow-lg shadow-theme-yellow/20">
              <div className="text-center">
                <h3 className="text-xl sm:text-2xl font-bold text-theme-yellow mb-3">
                  🎯 Unlock the Full Experience!
                </h3>
                <p className="text-sm sm:text-base text-theme-yellow-light mb-4 leading-relaxed">
                  Sign up or log in to track your progress, compete on leaderboards, and unlock achievements as you master African history!
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link to="/auth">
                    <Button className="w-full sm:w-auto jeopardy-gold font-semibold px-6 py-2 hover:scale-105 transition-all duration-300">
                      Sign Up Free
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button variant="outline" className="w-full sm:w-auto jeopardy-button border-theme-yellow/50 text-theme-yellow hover:bg-theme-yellow/10 font-semibold px-6 py-2">
                      Log In
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
          
          {/* Welcome Message with Badges for Authenticated Users - Below banner */}
          {isAuthenticated && user && (
            <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-background/80 backdrop-blur-sm rounded-lg border border-theme-yellow/20 max-w-xl mx-auto">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-theme-yellow" />
                <h3 className="text-lg sm:text-xl font-semibold text-theme-yellow">
                  Welcome back, Champion!
                </h3>
              </div>
              <div className="flex justify-center gap-2 mb-2">
                <UserBadges userId={user.id} limit={6} showTooltip={true} />
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground text-center">
                Keep playing to unlock more achievements!
              </p>
            </div>
          )}

          <div className="text-center mb-8 sm:mb-12">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <Sparkles className="text-theme-yellow animate-pulse" size={24} />
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold gradient-text animate-pulse-yellow">
                JEOPARDY!
              </h1>
              <Sparkles className="text-theme-yellow animate-pulse" size={24} />
            </div>
            <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-theme-yellow mb-3 sm:mb-4 font-light tracking-wide">
              AFRICAN HISTORY EDITION
            </div>
            <p className="text-theme-yellow-light text-sm sm:text-base md:text-lg lg:text-xl font-medium mb-3 sm:mb-4 px-2">
              A free educational game from <span className="text-theme-yellow font-semibold">The Historia Africana</span> YouTube Channel
            </p>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Test your knowledge of African history in this authentic Jeopardy-style experience!
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <Card className="jeopardy-card hover:scale-105 transition-all duration-300 cursor-pointer group animate-scale-in border-theme-yellow/20">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-theme-yellow to-theme-yellow-dark rounded-xl w-fit shadow-lg">
                  <Bot size={40} className="text-theme-brown" />
                </div>
                <CardTitle className="text-2xl font-bold text-theme-yellow">
                  SINGLE PLAYER
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center px-6 pb-6">
                <p className="text-card-foreground mb-6 text-base leading-relaxed">
                  Challenge our intelligent AI opponent. Perfect for practicing!
                </p>
                <Button 
                  onClick={() => handleModeSelect('single')} 
                  className="w-full jeopardy-gold font-bold text-base py-4 hover:scale-105 transition-all duration-300"
                  size="lg"
                >
                  START GAME
                </Button>
              </CardContent>
            </Card>

            <Card className="jeopardy-card hover:scale-105 transition-all duration-300 cursor-pointer group animate-scale-in border-theme-yellow/20" style={{ animationDelay: '0.1s' }}>
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-theme-yellow to-theme-yellow-dark rounded-xl w-fit shadow-lg">
                  <Users size={40} className="text-theme-brown" />
                </div>
                <CardTitle className="text-2xl font-bold text-theme-yellow">
                  LOCAL MULTIPLAYER
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center px-6 pb-6">
                <p className="text-card-foreground mb-6 text-base leading-relaxed">
                  Play with 2-4 friends on the same device. Classic couch gaming!
                </p>
                <Button 
                  onClick={() => handleModeSelect('multiplayer')} 
                  className="w-full jeopardy-gold font-bold text-base py-4 hover:scale-105 transition-all duration-300"
                  size="lg"
                >
                  START GAME
                </Button>
              </CardContent>
            </Card>

            <Card className="jeopardy-card hover:scale-105 transition-all duration-300 cursor-pointer group animate-scale-in border-theme-yellow/20" style={{ animationDelay: '0.2s' }}>
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-xl w-fit shadow-lg relative">
                  <Users size={40} className="text-white" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                </div>
                <CardTitle className="text-2xl font-bold text-theme-yellow flex items-center justify-center gap-2">
                  ONLINE MULTIPLAYER
                  <Badge variant="secondary" className="text-xs bg-green-600 text-white">LIVE</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center px-6 pb-6">
                <p className="text-card-foreground mb-6 text-base leading-relaxed">
                  Join players worldwide in real-time! Create or join rooms instantly.
                </p>
                <Button 
                  onClick={() => handleModeSelect('online-multiplayer')} 
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold text-base py-4 hover:scale-105 transition-all duration-300"
                  size="lg"
                >
                  JOIN LIVE GAME
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center mt-6 sm:mt-8 px-4">
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