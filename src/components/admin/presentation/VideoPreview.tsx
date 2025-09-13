import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw, Film, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface Slide {
  id: string;
  slide_number: number;
  title?: string;
  content?: string;
  image_url?: string;
  start_time?: number;
  end_time?: number;
  duration?: number;
  ai_suggestions?: any;
}

interface VideoPreviewProps {
  slides: Slide[];
  audioUrl: string;
  duration: number;
  currentTime: number;
  isPlaying: boolean;
  onPlayChange: (playing: boolean) => void;
  onTimeUpdate: (time: number) => void;
  onExportVideo: (resolution: '1080p' | '4k') => void;
}

export const VideoPreview = ({ 
  slides, 
  audioUrl, 
  duration, 
  currentTime, 
  isPlaying, 
  onPlayChange, 
  onTimeUpdate,
  onExportVideo 
}: VideoPreviewProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const animationRef = useRef<number>();
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const { toast } = useToast();

  // Get current slide based on time
  const getCurrentSlide = () => {
    return slides.find(slide => {
      if (slide.start_time !== undefined && slide.end_time !== undefined) {
        return currentTime >= slide.start_time && currentTime <= slide.end_time;
      }
      return false;
    }) || slides[0];
  };

  // Render slide on canvas
  const renderSlide = (ctx: CanvasRenderingContext2D, slide: Slide | undefined, width: number, height: number) => {
    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);

    if (!slide) return;

    // Set text properties
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Title
    if (slide.title) {
      ctx.font = `bold ${Math.floor(height * 0.08)}px Arial`;
      ctx.fillText(slide.title, width / 2, height * 0.2);
    }

    // Content
    if (slide.content) {
      ctx.font = `${Math.floor(height * 0.04)}px Arial`;
      const lines = slide.content.split('\n');
      lines.forEach((line, index) => {
        ctx.fillText(line, width / 2, height * 0.4 + (index * height * 0.06));
      });
    }

    // Slide number
    ctx.font = `${Math.floor(height * 0.03)}px Arial`;
    ctx.fillStyle = '#888888';
    ctx.textAlign = 'right';
    ctx.fillText(`${slide.slide_number}`, width - 20, height - 20);

    // Progress bar
    const progressWidth = width * 0.8;
    const progressHeight = 4;
    const progressX = (width - progressWidth) / 2;
    const progressY = height - 40;
    
    // Background
    ctx.fillStyle = '#333333';
    ctx.fillRect(progressX, progressY, progressWidth, progressHeight);
    
    // Progress
    const progress = duration > 0 ? (currentTime / duration) : 0;
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(progressX, progressY, progressWidth * progress, progressHeight);
  };

  // Animation loop
  const animate = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentSlide = getCurrentSlide();
    renderSlide(ctx, currentSlide, canvas.width, canvas.height);

    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    }
  };

  // Handle play/pause
  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      onPlayChange(!isPlaying);
    }
  };

  // Handle reset
  const handleReset = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      onTimeUpdate(0);
    }
    onPlayChange(false);
  };

  // Export video
  const handleExportVideo = async (resolution: '1080p' | '4k') => {
    if (!canvasRef.current || !audioRef.current) {
      toast({
        title: "Export failed",
        description: "Canvas or audio not ready",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);
    setExportProgress(0);

    try {
      // Set canvas resolution
      const canvas = canvasRef.current;
      const resolutions = {
        '1080p': { width: 1920, height: 1080 },
        '4k': { width: 3840, height: 2160 }
      };

      const { width, height } = resolutions[resolution];
      canvas.width = width;
      canvas.height = height;

      // Create media recorder
      const stream = canvas.captureStream(30); // 30 FPS
      
      // Add audio track if available
      if (audioUrl) {
        const audioContext = new AudioContext();
        const audioElement = new Audio(audioUrl);
        const source = audioContext.createMediaElementSource(audioElement);
        const destination = audioContext.createMediaStreamDestination();
        source.connect(destination);
        
        // Add audio tracks to video stream
        destination.stream.getAudioTracks().forEach(track => {
          stream.addTrack(track);
        });
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        
        // Download the video
        const a = document.createElement('a');
        a.href = url;
        a.download = `presentation_${resolution}_${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setIsExporting(false);
        toast({
          title: "Export complete",
          description: `Video exported in ${resolution} resolution`
        });
      };

      // Start recording
      mediaRecorder.start();

      // Render all slides in sequence
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Could not get canvas context");

      let frameTime = 0;
      const frameRate = 30;
      const frameDuration = 1000 / frameRate;

      const renderFrame = () => {
        const timeInSeconds = frameTime / 1000;
        
        if (timeInSeconds >= duration) {
          mediaRecorder.stop();
          return;
        }

        // Find current slide for this time
        const slide = slides.find(s => {
          if (s.start_time !== undefined && s.end_time !== undefined) {
            return timeInSeconds >= s.start_time && timeInSeconds <= s.end_time;
          }
          return false;
        }) || slides[0];

        renderSlide(ctx, slide, width, height);
        
        frameTime += frameDuration;
        setExportProgress((timeInSeconds / duration) * 100);
        
        setTimeout(renderFrame, frameDuration);
      };

      renderFrame();

    } catch (error) {
      console.error('Export error:', error);
      setIsExporting(false);
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  };

  // Update animation when playing state changes
  useEffect(() => {
    if (isPlaying) {
      animate();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, currentTime]);

  // Handle audio time updates
  useEffect(() => {
    if (audioRef.current) {
      const handleTimeUpdate = () => {
        if (audioRef.current) {
          onTimeUpdate(audioRef.current.currentTime);
        }
      };

      audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        }
      };
    }
  }, [audioUrl]);

  const currentSlide = getCurrentSlide();

  return (
    <Card className="w-full max-w-full overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="h-5 w-5" />
            Video Preview
          </div>
          <Badge variant="outline">
            {Math.round((currentTime / duration) * 100)}% Complete
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 overflow-hidden max-w-full">
        {/* Canvas for video rendering */}
        <div className="relative bg-muted rounded-lg overflow-hidden max-w-full">
          <AspectRatio ratio={16 / 9} className="w-full">
            <canvas
              ref={canvasRef}
              width={640}
              height={360}
              className="w-full h-full block"
            />
          </AspectRatio>
          
          {/* Audio element */}
          {audioUrl && (
            <audio
              ref={audioRef}
              src={audioUrl}
              onLoadedMetadata={() => {
                if (audioRef.current) {
                  onTimeUpdate(audioRef.current.duration);
                }
              }}
            />
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handlePlayPause}
              disabled={!audioUrl}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleReset}
              disabled={!audioUrl}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {Math.round(currentTime)}s / {Math.round(duration)}s
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => handleExportVideo('1080p')}
              disabled={isExporting || slides.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export 1080p
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleExportVideo('4k')}
              disabled={isExporting || slides.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export 4K
            </Button>
          </div>
        </div>

        {/* Export progress */}
        {isExporting && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Exporting video...</span>
              <span>{Math.round(exportProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${exportProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Current slide info */}
        {currentSlide && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm font-medium">
              Slide {currentSlide.slide_number}: {currentSlide.title}
            </div>
            {currentSlide.content && (
              <div className="text-sm text-muted-foreground mt-1">
                {currentSlide.content}
              </div>
            )}
            {currentSlide.ai_suggestions?.content_match_score && (
              <Badge variant="secondary" className="mt-2">
                AI Match: {Math.round(currentSlide.ai_suggestions.content_match_score * 100)}%
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};