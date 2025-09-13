import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";

interface AudioVisualizationProps {
  audioUrl: string;
  isPlaying: boolean;
  onPlayChange: (playing: boolean) => void;
  onTimeUpdate: (time: number) => void;
  onLoadedMetadata: (duration: number) => void;
}

export const AudioVisualization = ({
  audioUrl,
  isPlaying,
  onPlayChange,
  onTimeUpdate,
  onLoadedMetadata
}: AudioVisualizationProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [volume, setVolume] = useState([1]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [waveformData, setWaveformData] = useState<number[]>([]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      onLoadedMetadata(audio.duration);
      generateWaveform();
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      onTimeUpdate(audio.currentTime);
    };

    const handleEnded = () => {
      onPlayChange(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl, onLoadedMetadata, onTimeUpdate, onPlayChange]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play();
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume[0];
    }
  }, [volume]);

  const generateWaveform = async () => {
    if (!audioUrl) return;

    try {
      // Mock waveform data generation
      // In a real implementation, you would use Web Audio API to analyze the audio
      const mockData = Array.from({ length: 1000 }, () => Math.random());
      setWaveformData(mockData);
      drawWaveform(mockData);
    } catch (error) {
      console.error('Error generating waveform:', error);
    }
  };

  const drawWaveform = (data: number[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw waveform
    ctx.strokeStyle = 'hsl(var(--accent))';
    ctx.lineWidth = 1;
    ctx.beginPath();

    const barWidth = width / data.length;
    
    for (let i = 0; i < data.length; i++) {
      const barHeight = (data[i] * height) / 2;
      const x = i * barWidth;
      const y = (height - barHeight) / 2;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      ctx.lineTo(x, y + barHeight);
    }
    
    ctx.stroke();

    // Draw progress indicator
    if (duration > 0) {
      const progressX = (currentTime / duration) * width;
      ctx.strokeStyle = 'hsl(var(--primary))';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(progressX, 0);
      ctx.lineTo(progressX, height);
      ctx.stroke();
    }
  };

  useEffect(() => {
    if (waveformData.length > 0) {
      drawWaveform(waveformData);
    }
  }, [waveformData, currentTime, duration]);

  const handleSeek = (time: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = time;
      setCurrentTime(time);
      onTimeUpdate(time);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || duration === 0) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickTime = (x / canvas.width) * duration;
    handleSeek(clickTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!audioUrl) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">Upload an audio file to see waveform</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      {/* Waveform Canvas */}
      <Card>
        <CardContent className="p-4">
          <canvas
            ref={canvasRef}
            width={800}
            height={120}
            className="w-full h-full cursor-pointer border rounded"
            onClick={handleCanvasClick}
          />
        </CardContent>
      </Card>

      {/* Audio Controls */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleSeek(Math.max(0, currentTime - 10))}
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          
          <Button
            size="sm"
            onClick={() => onPlayChange(!isPlaying)}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleSeek(Math.min(duration, currentTime + 10))}
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 flex items-center gap-4">
          <span className="text-sm font-mono">{formatTime(currentTime)}</span>
          <div className="flex-1">
            <Slider
              value={[currentTime]}
              onValueChange={([value]) => handleSeek(value)}
              max={duration}
              step={0.1}
              className="cursor-pointer"
            />
          </div>
          <span className="text-sm font-mono">{formatTime(duration)}</span>
        </div>

        <div className="flex items-center gap-2">
          <Volume2 className="h-4 w-4" />
          <div className="w-20">
            <Slider
              value={volume}
              onValueChange={setVolume}
              max={1}
              step={0.1}
              className="cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};