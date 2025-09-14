import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Film, Download, Monitor, Tv, Clock, Files } from "lucide-react";
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

      mediaRecorder.onstop = async () => {
        setExportStatus("Finalizing video...");
        
        const webmBlob = new Blob(chunks, { type: 'video/webm' });
        
        // Convert format if needed
        let finalBlob = webmBlob;
        let fileExtension = 'webm';
        
        if (selectedFormat !== 'webm') {
          try {
            setExportStatus("Converting video format...");
            const { FFmpeg } = await import('@ffmpeg/ffmpeg');
            const { fetchFile, toBlobURL } = await import('@ffmpeg/util');
            
            const ffmpeg = new FFmpeg();
            
            // Load FFmpeg
            const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
            await ffmpeg.load({
              coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
              wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
            });
            
            // Write input file
            await ffmpeg.writeFile('input.webm', await fetchFile(webmBlob));
            
            // Convert based on selected format
            const outputFormat = selectedFormat === 'mp4' ? 'mp4' : 'mov';
            const codecArgs = selectedFormat === 'mp4' ? 
              ['-c:v', 'libx264', '-c:a', 'aac'] : 
              ['-c:v', 'libx264', '-c:a', 'aac'];
            
            await ffmpeg.exec(['-i', 'input.webm', ...codecArgs, `output.${outputFormat}`]);
            
            // Read output file
            const data = await ffmpeg.readFile(`output.${outputFormat}`);
            finalBlob = new Blob([data], { type: `video/${outputFormat}` });
            fileExtension = outputFormat;
            
          } catch (conversionError) {
            console.warn('Format conversion failed, using WebM:', conversionError);
            toast({
              title: "Format conversion failed",
              description: "Downloading as WebM instead",
              variant: "default"
            });
          }
        }
        
        const url = URL.createObjectURL(finalBlob);
        
        // Download the video
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project.name}_${selectedResolution}_${Date.now()}.${fileExtension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setIsExporting(false);
        setExportProgress(100);
        setExportStatus("Export complete!");
        
        toast({
          title: "Video exported successfully",
          description: `${project.name} exported in ${selectedResolution} quality as ${fileExtension.toUpperCase()}`
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

      // Animation helper functions
      const applyImageSlideIn = (animationData: any, slideProgress: number) => {
        if (animationData.type !== 'image_slide_in') return { x: 0, opacity: 1 };
        
        const progress = Math.min(1, Math.max(0, slideProgress / animationData.duration));
        const direction = animationData.direction || 'right';
        
        let translateX = 0;
        if (direction === 'right') {
          translateX = (1 - progress) * width * 0.5;
        } else if (direction === 'left') {
          translateX = -(1 - progress) * width * 0.5;
        }
        
        return {
          x: translateX,
          opacity: progress
        };
      };

      const shouldHighlightKeyword = (animationData: any, timeInSeconds: number) => {
        if (animationData.type !== 'keyword_highlight') return false;
        
        const animStart = animationData.start_time;
        const animEnd = animStart + animationData.duration;
        
        return timeInSeconds >= animStart && timeInSeconds <= animEnd;
      };

      // Preload all slide images
      const loadedImages = new Map<string, HTMLImageElement>();
      const loadSlideImage = (slide: Slide): Promise<HTMLImageElement | null> => {
        return new Promise((resolve) => {
          if (!slide.image_url) {
            resolve(null);
            return;
          }
          
          if (loadedImages.has(slide.image_url)) {
            resolve(loadedImages.get(slide.image_url)!);
            return;
          }
          
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            loadedImages.set(slide.image_url!, img);
            resolve(img);
          };
          img.onerror = () => resolve(null);
          img.src = slide.image_url;
        });
      };

      // Load all slide images first
      setExportStatus("Loading slide images...");
      const imagePromises = slides.map(slide => loadSlideImage(slide));
      await Promise.all(imagePromises);

      // Render function for slides with animations
      const renderSlide = (slide: Slide | undefined, timeInSeconds: number) => {
        // Clear canvas with presentation background
        ctx.fillStyle = '#F5F5F5';
        ctx.fillRect(0, 0, width, height);

        if (!slide) return;

        // Calculate slide-relative time
        const slideStartTime = slide.start_time || 0;
        const slideProgress = timeInSeconds - slideStartTime;
        
        // Get animations for this slide
        const animations = slide.ai_suggestions?.animations || [];

        // Set text properties based on resolution
        const baseFontSize = height * 0.04;
        const titleFontSize = baseFontSize * 2;
        const contentFontSize = baseFontSize * 1.2;

        // Apply image slide-in animation if present
        let imageTransform = { x: 0, opacity: 1 };
        const imageAnimation = animations.find((a: any) => a.type === 'image_slide_in');
        if (imageAnimation && slideProgress >= 0) {
          imageTransform = applyImageSlideIn(imageAnimation, slideProgress);
        }

        // Save context for transformations
        ctx.save();
        
        // Apply image transformation
        ctx.globalAlpha = imageTransform.opacity;
        ctx.translate(imageTransform.x, 0);

        // Render slide image if available
        const slideImage = slide.image_url ? loadedImages.get(slide.image_url) : null;
        if (slideImage) {
          // Calculate dimensions to fit slide image while maintaining aspect ratio
          const imageAspect = slideImage.width / slideImage.height;
          const canvasAspect = width / height;
          
          let drawWidth, drawHeight, drawX, drawY;
          
          if (imageAspect > canvasAspect) {
            // Image is wider than canvas
            drawWidth = width * 0.9; // Leave some margin
            drawHeight = drawWidth / imageAspect;
            drawX = width * 0.05;
            drawY = (height - drawHeight) / 2;
          } else {
            // Image is taller than canvas
            drawHeight = height * 0.8; // Leave some margin
            drawWidth = drawHeight * imageAspect;
            drawX = (width - drawWidth) / 2;
            drawY = height * 0.1;
          }
          
          ctx.drawImage(slideImage, drawX, drawY, drawWidth, drawHeight);
        }

        // Only render text overlays if no slide image or as overlay
        const hasSlideImage = slideImage !== null;
        
        // Title with potential highlighting (overlay on image or standalone)
        if (slide.title && (!hasSlideImage || animations.some((a: any) => a.type === 'title_overlay'))) {
          ctx.font = `bold ${titleFontSize}px Georgia`;
          ctx.fillStyle = hasSlideImage ? '#FFFFFF' : '#3C1518';
          ctx.strokeStyle = hasSlideImage ? '#000000' : 'transparent';
          ctx.lineWidth = hasSlideImage ? 2 : 0;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          // Check for keyword highlighting
          const titleHighlight = animations.find((a: any) => 
            a.type === 'keyword_highlight' && 
            slide.title?.toLowerCase().includes(a.text?.toLowerCase()) &&
            shouldHighlightKeyword(a, timeInSeconds)
          );
          
          if (titleHighlight) {
            // Draw highlight background
            const textMetrics = ctx.measureText(slide.title);
            const highlightWidth = textMetrics.width + 20;
            const highlightHeight = titleFontSize + 10;
            
            ctx.fillStyle = titleHighlight.color || '#FFFF00';
            ctx.globalAlpha = 0.7;
            ctx.fillRect(
              (width / 2) - (highlightWidth / 2), 
              (height * 0.25) - (highlightHeight / 2),
              highlightWidth,
              highlightHeight
            );
            ctx.globalAlpha = imageTransform.opacity;
          }
          
          ctx.fillStyle = hasSlideImage ? '#FFFFFF' : '#3C1518';
          if (hasSlideImage) {
            ctx.strokeText(slide.title, width / 2, height * 0.15);
          }
          ctx.fillText(slide.title, width / 2, hasSlideImage ? height * 0.15 : height * 0.25);
        }

        // Content with potential highlighting (only if no slide image or as overlay)
        if (slide.content && (!hasSlideImage || animations.some((a: any) => a.type === 'content_overlay'))) {
          ctx.font = `${contentFontSize}px Calibri`;
          ctx.fillStyle = hasSlideImage ? '#FFFFFF' : '#2D2D2A';
          ctx.strokeStyle = hasSlideImage ? '#000000' : 'transparent';
          ctx.lineWidth = hasSlideImage ? 1 : 0;
          const lines = slide.content.split('\n');
          const lineHeight = contentFontSize * 1.4;
          const startY = hasSlideImage ? height * 0.85 : height * 0.45;
          
          lines.forEach((line, index) => {
            const currentY = startY + (index * lineHeight);
            
            // Check for keyword highlighting in this line
            const lineHighlight = animations.find((a: any) => 
              a.type === 'keyword_highlight' && 
              line.toLowerCase().includes(a.text?.toLowerCase()) &&
              shouldHighlightKeyword(a, timeInSeconds)
            );
            
            if (lineHighlight) {
              // Find the keyword position in the line
              const keywordIndex = line.toLowerCase().indexOf(lineHighlight.text.toLowerCase());
              if (keywordIndex !== -1) {
                const beforeText = line.substring(0, keywordIndex);
                const keyword = line.substring(keywordIndex, keywordIndex + lineHighlight.text.length);
                const afterText = line.substring(keywordIndex + lineHighlight.text.length);
                
                // Measure text widths
                const beforeWidth = ctx.measureText(beforeText).width;
                const keywordWidth = ctx.measureText(keyword).width;
                
                // Calculate positions
                const lineWidth = ctx.measureText(line).width;
                const lineStartX = (width / 2) - (lineWidth / 2);
                const keywordStartX = lineStartX + beforeWidth;
                
                // Draw highlight background
                ctx.fillStyle = lineHighlight.color || '#FFFF00';
                ctx.globalAlpha = 0.7;
                ctx.fillRect(
                  keywordStartX - 5,
                  currentY - (contentFontSize / 2) - 5,
                  keywordWidth + 10,
                  contentFontSize + 10
                );
                ctx.globalAlpha = imageTransform.opacity;
                
                // Draw text parts
                ctx.fillStyle = hasSlideImage ? '#FFFFFF' : '#2D2D2A';
                ctx.textAlign = 'left';
                if (hasSlideImage) ctx.strokeText(beforeText, lineStartX, currentY);
                ctx.fillText(beforeText, lineStartX, currentY);
                ctx.fillStyle = '#000000'; // Darker for highlighted text
                if (hasSlideImage) ctx.strokeText(keyword, keywordStartX, currentY);
                ctx.fillText(keyword, keywordStartX, currentY);
                ctx.fillStyle = hasSlideImage ? '#FFFFFF' : '#2D2D2A';
                if (hasSlideImage) ctx.strokeText(afterText, keywordStartX + keywordWidth, currentY);
                ctx.fillText(afterText, keywordStartX + keywordWidth, currentY);
                ctx.textAlign = 'center';
              }
            } else {
              // Normal text rendering
              ctx.fillStyle = hasSlideImage ? '#FFFFFF' : '#2D2D2A';
              ctx.textAlign = 'center';
              if (hasSlideImage) ctx.strokeText(line, width / 2, currentY);
              ctx.fillText(line, width / 2, currentY);
            }
          });
        }

        // Restore context
        ctx.restore();

        // Slide number
        ctx.font = `${baseFontSize}px Calibri`;
        ctx.fillStyle = '#666666';
        ctx.textAlign = 'right';
        ctx.fillText(`Slide ${slide.slide_number}`, width - 40, height - 40);

        // Progress bar
        const progressWidth = width * 0.6;
        const progressHeight = 8;
        const progressX = (width - progressWidth) / 2;
        const progressY = height - 80;
        
        // Background
        ctx.fillStyle = '#DDDDDD';
        ctx.fillRect(progressX, progressY, progressWidth, progressHeight);
        
        // Progress
        const progress = duration > 0 ? (timeInSeconds / duration) : 0;
        ctx.fillStyle = '#8B5D33';
        ctx.fillRect(progressX, progressY, progressWidth * progress, progressHeight);

        // AI confidence indicator and animation info (if available)
        if (slide.ai_suggestions?.content_match_score) {
          const confidence = slide.ai_suggestions.content_match_score;
          ctx.fillStyle = confidence > 0.7 ? '#10b981' : confidence > 0.4 ? '#f59e0b' : '#ef4444';
          ctx.font = `${baseFontSize * 0.8}px Calibri`;
          ctx.textAlign = 'left';
          ctx.fillText(
            `AI Match: ${Math.round(confidence * 100)}%`, 
            40, 
            height - 40
          );
          
          // Show active animations
          const activeAnimations = animations.filter((a: any) => {
            if (a.type === 'keyword_highlight') {
              return shouldHighlightKeyword(a, timeInSeconds);
            }
            return false;
          });
          
          if (activeAnimations.length > 0) {
            ctx.fillStyle = '#FFAA00';
            ctx.fillText(
              `🎬 ${activeAnimations.length} active`,
              40,
              height - 20
            );
          }
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
                    <Files className="h-4 w-4" />
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