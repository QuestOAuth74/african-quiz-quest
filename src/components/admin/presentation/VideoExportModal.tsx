import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Film, Download, Monitor, Tv, Clock, HardDrive } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

interface PresentationProject {
  id: string;
  name: string;
  description?: string;
  status: string;
  total_slides: number;
  total_duration?: number;
  audio_file_url?: string;
  audio_file_name?: string;
  powerpoint_file_url?: string;
  powerpoint_file_name?: string;
  created_at: string;
  updated_at: string;
}

interface VideoExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: PresentationProject | null;
  slides: Slide[];
  audioUrl: string;
  duration: number;
}

type Resolution = '720p' | '1080p' | '4k';
type Format = 'mp4' | 'webm' | 'mov';
type Quality = 'high' | 'medium' | 'low';

export const VideoExportModal = ({ 
  isOpen, 
  onClose, 
  project, 
  slides, 
  audioUrl, 
  duration 
}: VideoExportModalProps) => {
  const [selectedResolution, setSelectedResolution] = useState<Resolution>('1080p');
  const [selectedFormat, setSelectedFormat] = useState<Format>('mp4');
  const [selectedQuality, setSelectedQuality] = useState<Quality>('high');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState<string>("");
  const { toast } = useToast();

  const resolutionOptions = [
    {
      value: '720p' as Resolution,
      label: 'HD 720p',
      dimensions: '1280x720',
      icon: Monitor,
      description: 'Good for web sharing',
      estimatedSize: Math.round(duration * 0.5) // MB estimate
    },
    {
      value: '1080p' as Resolution,
      label: 'Full HD 1080p',
      dimensions: '1920x1080',
      icon: Tv,
      description: 'Best for most uses',
      estimatedSize: Math.round(duration * 1.2) // MB estimate
    },
    {
      value: '4k' as Resolution,
      label: '4K Ultra HD',
      dimensions: '3840x2160',
      icon: Film,
      description: 'Highest quality',
      estimatedSize: Math.round(duration * 4.8) // MB estimate
    }
  ];

  const formatOptions = [
    { value: 'mp4' as Format, label: 'MP4', description: 'Most compatible' },
    { value: 'webm' as Format, label: 'WebM', description: 'Web optimized' },
    { value: 'mov' as Format, label: 'MOV', description: 'Apple format' }
  ];

  const qualityOptions = [
    { value: 'high' as Quality, label: 'High Quality', description: 'Best visual quality' },
    { value: 'medium' as Quality, label: 'Medium Quality', description: 'Balanced size/quality' },
    { value: 'low' as Quality, label: 'Low Quality', description: 'Smaller file size' }
  ];

  const handleExport = async () => {
    if (!project || slides.length === 0) {
      toast({
        title: "Cannot export",
        description: "No project or slides available",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);
    setExportProgress(0);
    setExportStatus("Initializing export...");

    try {
      // Create a hidden canvas for rendering
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Could not create canvas context");

      // Set resolution
      const resolutions = {
        '720p': { width: 1280, height: 720 },
        '1080p': { width: 1920, height: 1080 },
        '4k': { width: 3840, height: 2160 }
      };

      const { width, height } = resolutions[selectedResolution];
      canvas.width = width;
      canvas.height = height;

      setExportStatus("Setting up video stream...");

      // Create media recorder
      const stream = canvas.captureStream(30); // 30 FPS
      
      // Add audio if available
      if (audioUrl) {
        setExportStatus("Processing audio...");
        
        // Create audio context for processing
        const audioContext = new AudioContext();
        const audioElement = new Audio(audioUrl);
        audioElement.crossOrigin = "anonymous";
        
        try {
          const source = audioContext.createMediaElementSource(audioElement);
          const destination = audioContext.createMediaStreamDestination();
          source.connect(destination);
          source.connect(audioContext.destination);
          
          // Add audio tracks to video stream
          destination.stream.getAudioTracks().forEach(track => {
            stream.addTrack(track);
          });
        } catch (audioError) {
          console.warn("Could not process audio:", audioError);
          toast({
            title: "Audio processing failed",
            description: "Continuing with video-only export",
            variant: "default"
          });
        }
      }

      // Configure media recorder based on format and quality
      let mimeType = 'video/webm;codecs=vp9';
      if (selectedFormat === 'mp4') {
        mimeType = 'video/webm'; // Will be converted later if needed
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        setExportStatus("Finalizing video...");
        
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        
        // Download the video
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project.name}_${selectedResolution}_${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setIsExporting(false);
        setExportProgress(100);
        setExportStatus("Export complete!");
        
        toast({
          title: "Video exported successfully",
          description: `${project.name} exported in ${selectedResolution} quality`
        });

        // Close modal after short delay
        setTimeout(() => {
          onClose();
          setExportProgress(0);
          setExportStatus("");
        }, 2000);
      };

      // Start recording
      mediaRecorder.start();
      setExportStatus("Rendering video frames...");

      // Render function for slides
      const renderSlide = (slide: Slide | undefined, timeInSeconds: number) => {
        // Clear canvas with dark background
        ctx.fillStyle = '#0f0f0f';
        ctx.fillRect(0, 0, width, height);

        if (!slide) return;

        // Set text properties based on resolution
        const baseFontSize = height * 0.04;
        const titleFontSize = baseFontSize * 2;
        const contentFontSize = baseFontSize * 1.2;
        
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Title
        if (slide.title) {
          ctx.font = `bold ${titleFontSize}px Arial`;
          ctx.fillText(slide.title, width / 2, height * 0.25);
        }

        // Content
        if (slide.content) {
          ctx.font = `${contentFontSize}px Arial`;
          const lines = slide.content.split('\n');
          const lineHeight = contentFontSize * 1.4;
          const startY = height * 0.45;
          
          lines.forEach((line, index) => {
            ctx.fillText(line, width / 2, startY + (index * lineHeight));
          });
        }

        // Slide number
        ctx.font = `${baseFontSize}px Arial`;
        ctx.fillStyle = '#888888';
        ctx.textAlign = 'right';
        ctx.fillText(`Slide ${slide.slide_number}`, width - 40, height - 40);

        // Progress bar
        const progressWidth = width * 0.6;
        const progressHeight = 8;
        const progressX = (width - progressWidth) / 2;
        const progressY = height - 80;
        
        // Background
        ctx.fillStyle = '#333333';
        ctx.fillRect(progressX, progressY, progressWidth, progressHeight);
        
        // Progress
        const progress = duration > 0 ? (timeInSeconds / duration) : 0;
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(progressX, progressY, progressWidth * progress, progressHeight);

        // AI confidence indicator (if available)
        if (slide.ai_suggestions?.content_match_score) {
          const confidence = slide.ai_suggestions.content_match_score;
          ctx.fillStyle = confidence > 0.7 ? '#10b981' : confidence > 0.4 ? '#f59e0b' : '#ef4444';
          ctx.font = `${baseFontSize * 0.8}px Arial`;
          ctx.textAlign = 'left';
          ctx.fillText(
            `AI Match: ${Math.round(confidence * 100)}%`, 
            40, 
            height - 40
          );
        }
      };

      // Animation loop
      let frameTime = 0;
      const frameRate = 30;
      const frameDuration = 1000 / frameRate;
      const totalFrames = Math.ceil((duration * 1000) / frameDuration);

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

        renderSlide(slide, timeInSeconds);
        
        // Update progress
        const progress = (timeInSeconds / duration) * 100;
        setExportProgress(progress);
        setExportStatus(`Rendering frame ${Math.floor(timeInSeconds * frameRate)} of ${totalFrames}...`);
        
        frameTime += frameDuration;
        
        // Use setTimeout instead of requestAnimationFrame for consistent timing
        setTimeout(renderFrame, frameDuration);
      };

      renderFrame();

    } catch (error) {
      console.error('Export error:', error);
      setIsExporting(false);
      setExportProgress(0);
      setExportStatus("");
      
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    }
  };

  const selectedResolutionOption = resolutionOptions.find(opt => opt.value === selectedResolution);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Film className="h-5 w-5" />
            Export Video
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Project Info */}
          {project && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Project: {project.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4" />
                    Slides: {slides.length}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Duration: {Math.round(duration)}s
                  </span>
                </div>
                <Badge variant="outline">
                  Synced: {slides.filter(s => s.start_time !== undefined).length}/{slides.length}
                </Badge>
              </CardContent>
            </Card>
          )}

          {/* Resolution Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Resolution</Label>
            <RadioGroup 
              value={selectedResolution} 
              onValueChange={(value) => setSelectedResolution(value as Resolution)}
              className="space-y-2"
            >
              {resolutionOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label 
                      htmlFor={option.value} 
                      className="flex items-center justify-between w-full cursor-pointer p-3 border rounded-lg hover:bg-muted"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-accent" />
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-sm text-muted-foreground">
                            {option.dimensions} • {option.description}
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        ~{option.estimatedSize}MB
                      </Badge>
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          <Separator />

          {/* Format and Quality */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label className="text-base font-medium">Format</Label>
              <RadioGroup value={selectedFormat} onValueChange={(value) => setSelectedFormat(value as Format)}>
                {formatOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="cursor-pointer">
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {option.description}
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-medium">Quality</Label>
              <RadioGroup value={selectedQuality} onValueChange={(value) => setSelectedQuality(value as Quality)}>
                {qualityOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="cursor-pointer">
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {option.description}
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>

          {/* Export Progress */}
          {isExporting && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Exporting...</span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(exportProgress)}%
                    </span>
                  </div>
                  <Progress value={exportProgress} className="w-full" />
                  <p className="text-sm text-muted-foreground">{exportStatus}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={onClose} disabled={isExporting}>
              Cancel
            </Button>
            <Button 
              onClick={handleExport} 
              disabled={isExporting || slides.length === 0}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export {selectedResolutionOption?.label}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};