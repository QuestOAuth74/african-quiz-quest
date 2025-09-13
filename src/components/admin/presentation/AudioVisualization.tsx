import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Play, Pause, SkipBack, SkipForward, Volume2, FileText, Activity, Clock, Mic } from "lucide-react";

interface AudioVisualizationProps {
  audioUrl: string;
  isPlaying: boolean;
  onPlayChange: (playing: boolean) => void;
  onTimeUpdate: (time: number) => void;
  onLoadedMetadata: (duration: number) => void;
  transcript?: string;
  speechPatterns?: {
    speech_rate_wpm?: number;
    pause_count?: number;
    segments?: Array<{
      start: number;
      end: number;
      text: string;
      confidence?: number;
    }>;
  };
  isProcessing?: boolean;
}

export const AudioVisualization = ({
  audioUrl,
  isPlaying,
  onPlayChange,
  onTimeUpdate,
  onLoadedMetadata,
  transcript,
  speechPatterns,
  isProcessing = false
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

      {/* AI Analysis Section */}
      {(transcript || speechPatterns || isProcessing) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5" />
              AI Audio Analysis
              {isProcessing && (
                <Badge variant="outline" className="animate-pulse">
                  <Mic className="h-3 w-3 mr-1" />
                  Processing
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Speech Statistics */}
            {speechPatterns && (
              <div className="grid grid-cols-3 gap-4 text-sm">
                {speechPatterns.speech_rate_wpm && (
                  <div className="text-center">
                    <div className="font-medium">Speaking Rate</div>
                    <div className="text-muted-foreground">
                      {speechPatterns.speech_rate_wpm} WPM
                    </div>
                  </div>
                )}
                {speechPatterns.pause_count !== undefined && (
                  <div className="text-center">
                    <div className="font-medium">Pauses</div>
                    <div className="text-muted-foreground">
                      {speechPatterns.pause_count}
                    </div>
                  </div>
                )}
                <div className="text-center">
                  <div className="font-medium">Duration</div>
                  <div className="text-muted-foreground">
                    {formatTime(duration)}
                  </div>
                </div>
              </div>
            )}

            {speechPatterns && transcript && <Separator />}

            {/* Transcript Section */}
            {transcript && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">Transcript</span>
                  <Badge variant="secondary">
                    {transcript.split(' ').length} words
                  </Badge>
                </div>
                <div className="bg-muted p-4 rounded-lg max-h-40 overflow-y-auto">
                  <p className="text-sm leading-relaxed">
                    {transcript}
                  </p>
                </div>
              </div>
            )}

            {/* Speech Segments */}
            {speechPatterns?.segments && speechPatterns.segments.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">Speech Segments</span>
                    <Badge variant="secondary">
                      {speechPatterns.segments.length} segments
                    </Badge>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {speechPatterns.segments.slice(0, 5).map((segment, index) => (
                      <div 
                        key={index} 
                        className="flex items-start gap-3 p-2 bg-muted rounded text-sm cursor-pointer hover:bg-muted/80"
                        onClick={() => handleSeek(segment.start)}
                      >
                        <div className="text-xs text-muted-foreground min-w-16">
                          {formatTime(segment.start)}
                        </div>
                        <div className="flex-1">
                          {segment.text}
                        </div>
                        {segment.confidence !== undefined && (
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              segment.confidence > 0 ? 'border-green-500 text-green-500' : 'border-yellow-500 text-yellow-500'
                            }`}
                          >
                            {Math.round(Math.abs(segment.confidence * 100))}%
                          </Badge>
                        )}
                      </div>
                    ))}
                    {speechPatterns.segments.length > 5 && (
                      <div className="text-xs text-muted-foreground text-center py-2">
                        ... and {speechPatterns.segments.length - 5} more segments
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {isProcessing && !transcript && (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-sm text-muted-foreground">
                  Transcribing audio and analyzing speech patterns...
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};