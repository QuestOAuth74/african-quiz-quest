import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Volume2, VolumeX, Volume1 } from "lucide-react";
import { useBackgroundMusic } from "@/hooks/useBackgroundMusic";

export function AudioControls() {
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
    <div onClick={handleUserInteraction}>
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white hover:text-theme-yellow-light hover:bg-white/10 border border-white/20 bg-black/20 backdrop-blur-sm"
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
      
      {error && (
        <div className="absolute top-full right-0 mt-2 w-64">
          <div className="bg-theme-yellow/10 border border-theme-yellow/20 rounded-lg p-3 text-center">
            <p className="text-theme-yellow text-xs">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}