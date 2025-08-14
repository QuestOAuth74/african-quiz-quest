import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Users, Bot, Sparkles, Settings, Volume2, VolumeX, Volume1 } from "lucide-react";
import { Link } from "react-router-dom";
import { useBackgroundMusic } from "@/hooks/useBackgroundMusic";
import { useState, useEffect } from "react";

interface GameModeSelectorProps {
  onSelectMode: (mode: 'single' | 'multiplayer') => void;
}

export function GameModeSelector({ onSelectMode }: GameModeSelectorProps) {
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [volume, setVolume] = useState(40); // Volume as percentage (0-100)
  
  const {
    isPlaying,
    error,
    playMusic,
    pauseMusic,
    setVolumeLevel,
    handleUserInteraction
  } = useBackgroundMusic(
    "https://tvfqqzphwwcgrvmkilzr.supabase.co/storage/v1/object/public/question-images/game-background%20ha1.mp3",
    {
      autoPlay: true,
      loop: true,
      volume: volume / 100 // Convert percentage to decimal
    }
  );

  // Update audio volume when slider changes
  useEffect(() => {
    setVolumeLevel(volume / 100);
  }, [volume, setVolumeLevel]);

  const handleModeSelect = (mode: 'single' | 'multiplayer') => {
    // Stop background music when starting game
    pauseMusic();
    onSelectMode(mode);
  };

  const toggleMusic = () => {
    if (isPlaying) {
      pauseMusic();
      setMusicEnabled(false);
    } else {
      playMusic();
      setMusicEnabled(true);
    }
  };

  const getVolumeIcon = () => {
    if (!isPlaying || volume === 0) return VolumeX;
    if (volume < 50) return Volume1;
    return Volume2;
  };

  const VolumeIcon = getVolumeIcon();

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      onClick={handleUserInteraction}
    >
      {/* Admin Access and Music Controls */}
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        {/* Music Controls */}
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:text-theme-yellow-light hover:bg-white/10 border border-white/20"
            >
              <VolumeIcon className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 bg-card border-border">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Background Music</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMusic}
                  className="h-6 w-6 p-0"
                >
                  {isPlaying ? (
                    <Volume2 className="w-4 h-4 text-theme-yellow" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Volume</span>
                  <span>{volume}%</span>
                </div>
                <Slider
                  value={[volume]}
                  onValueChange={(value) => setVolume(value[0])}
                  max={100}
                  min={0}
                  step={5}
                  className="w-full"
                  disabled={!isPlaying}
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setVolume(25)}
                  className="flex-1 text-xs"
                  disabled={!isPlaying}
                >
                  Low
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setVolume(50)}
                  className="flex-1 text-xs"
                  disabled={!isPlaying}
                >
                  Medium
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setVolume(75)}
                  className="flex-1 text-xs"
                  disabled={!isPlaying}
                >
                  High
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

      </div>
      
      {/* Full Height Banner Image */}
      <div className="w-full h-screen">
        <img 
          src="https://tvfqqzphwwcgrvmkilzr.supabase.co/storage/v1/object/public/question-images/jeopardy%20game%20banner.png"
          alt="African History Jeopardy Game Banner"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content Section Below Banner */}
      <div className="bg-gradient-to-br from-theme-brown-dark via-background to-theme-brown p-8">
        {error && (
          <div className="max-w-5xl mx-auto mb-4">
            <div className="bg-theme-yellow/10 border border-theme-yellow/20 rounded-lg p-3 text-center">
              <p className="text-theme-yellow text-sm">{error}</p>
            </div>
          </div>
        )}
        
        <div className="max-w-5xl mx-auto">
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
                  TWO PLAYER
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center px-8 pb-8">
                <p className="text-card-foreground mb-8 text-lg leading-relaxed">
                  Compete head-to-head with a friend. Who knows more about the rich history of Africa?
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
    </div>
  );
}