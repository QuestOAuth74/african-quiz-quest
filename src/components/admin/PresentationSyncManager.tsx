import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileUploadArea } from "./presentation/FileUploadArea";
import { AudioVisualization } from "./presentation/AudioVisualization";
import { SlideTimeline } from "./presentation/SlideTimeline";
import { SlidePreview } from "./presentation/SlidePreview";
import { ProjectManager } from "./presentation/ProjectManager";
import { ExportModal } from "./presentation/ExportModal";
import { Play, Pause, Save, Download, Zap, Clock, FileText } from "lucide-react";

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

export const PresentationSyncManager = () => {
  const [currentProject, setCurrentProject] = useState<PresentationProject | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedSlide, setSelectedSlide] = useState<Slide | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (files: File[], type: 'powerpoint' | 'images' | 'audio') => {
    setIsProcessing(true);
    try {
      if (type === 'audio' && files[0]) {
        const audioFile = files[0];
        const audioUrl = URL.createObjectURL(audioFile);
        setAudioUrl(audioUrl);
        
        // Upload to storage
        const filePath = `${Date.now()}_${audioFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from('presentation-files')
          .upload(filePath, audioFile);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('presentation-files')
          .getPublicUrl(filePath);

        // Update current project or create new one
        if (currentProject) {
          const { error } = await supabase
            .from('presentation_projects')
            .update({
              audio_file_url: publicUrl,
              audio_file_name: audioFile.name,
              updated_at: new Date().toISOString()
            })
            .eq('id', currentProject.id);

          if (error) throw error;
        }

        toast({
          title: "Audio uploaded successfully",
          description: "Ready for synchronization analysis",
        });
      } else if (type === 'powerpoint' && files[0]) {
        const file = files[0];
        // Process PowerPoint file (placeholder for now)
        toast({
          title: "PowerPoint file uploaded",
          description: "Processing slides... (placeholder)",
        });
        
        // Mock slide extraction
        const mockSlides: Slide[] = [
          { id: '1', slide_number: 1, title: 'Introduction', content: 'Welcome to our presentation' },
          { id: '2', slide_number: 2, title: 'Overview', content: 'Key points and agenda' },
          { id: '3', slide_number: 3, title: 'Main Content', content: 'Detailed information' },
          { id: '4', slide_number: 4, title: 'Conclusion', content: 'Summary and next steps' },
        ];
        setSlides(mockSlides);
      } else if (type === 'images') {
        // Process uploaded images
        const imageSlides = files.map((file, index) => ({
          id: `img_${index}`,
          slide_number: slides.length + index + 1,
          title: `Image ${index + 1}`,
          image_url: URL.createObjectURL(file)
        }));
        setSlides(prev => [...prev, ...imageSlides]);
        
        toast({
          title: "Images uploaded",
          description: `Added ${files.length} image slides`,
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSlideTimeUpdate = (slideId: string, startTime: number, endTime: number) => {
    setSlides(prev => prev.map(slide => 
      slide.id === slideId 
        ? { ...slide, start_time: startTime, end_time: endTime, duration: endTime - startTime }
        : slide
    ));
  };

  const handleAIAnalysis = async () => {
    if (!audioUrl || slides.length === 0) {
      toast({
        title: "Missing content",
        description: "Please upload both audio and slides first",
        variant: "destructive",
      });
      return;
    }

    if (!currentProject?.id) {
      toast({
        title: "No project selected",
        description: "Please save your project first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Convert audio URL to base64 for API
      const audioResponse = await fetch(audioUrl);
      const audioBlob = await audioResponse.blob();
      const audioBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve(base64.split(',')[1]); // Remove data:audio/webm;base64, prefix
        };
        reader.readAsDataURL(audioBlob);
      });

      toast({
        title: "AI Analysis Starting",
        description: "Transcribing audio and analyzing content...",
      });

      // Call the AI analysis edge function
      const { data, error } = await supabase.functions.invoke('presentation-ai-analysis', {
        body: {
          project_id: currentProject.id,
          audio_data: audioBase64,
          slides: slides,
          analysis_type: 'full_analysis'
        }
      });

      if (error) {
        console.error('AI Analysis error:', error);
        throw new Error(error.message || 'AI analysis failed');
      }

      // Update slides with AI analysis results
      const analyzedSlides = slides.map((slide, index) => {
        const analysis = data.slide_analysis?.find((a: any) => a.slide_number === index + 1);
        if (analysis) {
          return {
            ...slide,
            start_time: analysis.suggested_start_time,
            end_time: analysis.suggested_end_time,
            duration: analysis.suggested_end_time - analysis.suggested_start_time,
            ai_suggestions: {
              ...analysis.ai_suggestions,
              content_match_score: analysis.content_match_score,
              transcript_segment: data.segments?.find((s: any) => 
                s.start <= analysis.suggested_start_time && s.end >= analysis.suggested_end_time
              )?.text || ''
            }
          };
        }
        return slide;
      });
      
      setSlides(analyzedSlides);
      setDuration(data.duration || duration);

      // Store transcript for reference
      if (data.transcript) {
        setCurrentProject(prev => prev ? {
          ...prev,
          transcript: data.transcript,
          speech_patterns: data.speech_patterns
        } : null);
      }
      
      toast({
        title: "AI Analysis Complete",
        description: `Processed ${data.transcript?.split(' ').length || 0} words and ${slides.length} slides`,
      });
    } catch (error) {
      console.error('AI Analysis error:', error);
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Could not complete AI analysis",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveProject = async () => {
    if (!currentProject) {
      toast({
        title: "No project",
        description: "Please create a project first",
        variant: "destructive",
      });
      return;
    }

    try {
      // Save slides to database
      const { error } = await supabase
        .from('presentation_slides')
        .upsert(
          slides.map(slide => ({
            id: slide.id,
            project_id: currentProject.id,
            slide_number: slide.slide_number,
            title: slide.title,
            content: slide.content,
            image_url: slide.image_url,
            start_time: slide.start_time,
            end_time: slide.end_time,
            duration: slide.duration,
            ai_suggestions: slide.ai_suggestions
          }))
        );

      if (error) throw error;

      toast({
        title: "Project saved",
        description: "All changes have been saved successfully",
      });
    } catch (error) {
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold gradient-text">AI Presentation Sync</h1>
          <p className="text-muted-foreground">Synchronize presentations with audio for YouTube videos</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleAIAnalysis} 
            disabled={isProcessing || !audioUrl || slides.length === 0}
            className="gap-2"
          >
            <Zap className="h-4 w-4" />
            {isProcessing ? "Analyzing..." : "AI Analysis"}
          </Button>
          <Button onClick={handleSaveProject} disabled={!currentProject} variant="outline" className="gap-2">
            <Save className="h-4 w-4" />
            Save Project
          </Button>
          <Button onClick={() => setShowExportModal(true)} disabled={slides.length === 0} className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Slides</p>
                <p className="text-2xl font-bold">{slides.length}</p>
              </div>
              <FileText className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Duration</p>
                <p className="text-2xl font-bold">{Math.round(duration)}s</p>
              </div>
              <Clock className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge variant={currentProject ? "default" : "secondary"}>
                  {currentProject ? currentProject.status : "No Project"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Synced Slides</p>
                <p className="text-2xl font-bold">
                  {slides.filter(s => s.start_time !== undefined).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Three-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
        {/* Left Panel - File Manager */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>File Manager</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ProjectManager 
                currentProject={currentProject}
                onProjectChange={setCurrentProject}
              />
              <FileUploadArea 
                onFileUpload={handleFileUpload}
                isProcessing={isProcessing}
              />
            </CardContent>
          </Card>
        </div>

        {/* Center Panel - Timeline Editor */}
        <div className="lg:col-span-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Timeline Editor
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsPlaying(!isPlaying)}
                    disabled={!audioUrl}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(currentTime)}s / {Math.round(duration)}s
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <AudioVisualization
                  audioUrl={audioUrl}
                  isPlaying={isPlaying}
                  onPlayChange={setIsPlaying}
                  onTimeUpdate={setCurrentTime}
                  onLoadedMetadata={setDuration}
                />
                <SlideTimeline
                  slides={slides}
                  duration={duration}
                  currentTime={currentTime}
                  onSlideTimeUpdate={handleSlideTimeUpdate}
                  onSlideSelect={setSelectedSlide}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Preview */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
        <SlidePreview 
          slide={selectedSlide} 
          currentTime={currentTime} 
          slides={slides}
          isProcessing={isProcessing}
        />
            </CardContent>
          </Card>
        </div>
      </div>

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        project={currentProject}
        slides={slides}
      />
    </div>
  );
};