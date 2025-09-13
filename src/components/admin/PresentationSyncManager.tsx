import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { GPTStatusChecker } from "./presentation/GPTStatusChecker";
import { FileUploadArea } from "./presentation/FileUploadArea";
import { AudioVisualization } from "./presentation/AudioVisualization";
import { SlideTimeline } from "./presentation/SlideTimeline";
import { SlidePreview } from "./presentation/SlidePreview";
import { ProjectManager } from "./presentation/ProjectManager";
import { ExportModal } from "./presentation/ExportModal";
import { VideoPreview } from "./presentation/VideoPreview";
import { VideoExportModal } from "./presentation/VideoExportModal";
import { Play, Pause, Save, Download, Zap, Clock, FileText, Film } from "lucide-react";

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
  const [audioStoragePath, setAudioStoragePath] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedSlide, setSelectedSlide] = useState<Slide | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showVideoExportModal, setShowVideoExportModal] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (files: File[], type: 'powerpoint' | 'images' | 'audio' | 'document') => {
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

        setAudioStoragePath(filePath);

        // Get public URL (bucket may be private; used only for local preview)
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
        
        // Upload PowerPoint file to storage first
        const filePath = `powerpoint/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('presentation-files')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('presentation-files')
          .getPublicUrl(filePath);

        toast({
          title: "PowerPoint file uploaded",
          description: "Processing slides from PowerPoint...",
        });

        try {
          // Parse PowerPoint file to extract slides
          const { data: parseData, error: parseError } = await supabase.functions.invoke('presentation-ai-analysis', {
            body: {
              project_id: currentProject?.id,
              analysis_type: 'parse_powerpoint',
              powerpoint_url: publicUrl,
              powerpoint_name: file.name
            }
          });

          if (parseError || !parseData?.slides) {
            throw new Error(parseError?.message || 'Failed to parse PowerPoint file');
          }

          // Convert parsed data to slide format
          const extractedSlides: Slide[] = parseData.slides.map((slide: any, index: number) => ({
            id: `ppt_${index + 1}`,
            slide_number: index + 1,
            title: slide.title || `Slide ${index + 1}`,
            content: slide.content || slide.text || '',
            image_url: slide.image_url
          }));

          setSlides(extractedSlides);

          // Update project with PowerPoint info
          if (currentProject) {
            const { error: updateError } = await supabase
              .from('presentation_projects')
              .update({
                powerpoint_file_url: publicUrl,
                powerpoint_file_name: file.name,
                total_slides: extractedSlides.length,
                updated_at: new Date().toISOString()
              })
              .eq('id', currentProject.id);

            if (updateError) {
              console.error('Error updating project:', updateError);
            }
          }

          toast({
            title: "PowerPoint processed successfully",
            description: `Extracted ${extractedSlides.length} slides`,
          });
        } catch (parseError) {
          console.error('PowerPoint parsing error:', parseError);
          toast({
            title: "PowerPoint processing failed",
            description: "Using basic slide extraction instead",
            variant: "destructive"
          });
          
          // Fallback to basic slide structure
          const basicSlides: Slide[] = [
            { id: '1', slide_number: 1, title: 'Slide 1', content: 'Content from uploaded PowerPoint' },
            { id: '2', slide_number: 2, title: 'Slide 2', content: 'Content from uploaded PowerPoint' },
            { id: '3', slide_number: 3, title: 'Slide 3', content: 'Content from uploaded PowerPoint' },
          ];
          setSlides(basicSlides);
        }
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
      } else if (type === 'document' && files[0]) {
        const docFile = files[0];
        
        // Upload to storage
        const filePath = `documents/${Date.now()}_${docFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from('presentation-files')
          .upload(filePath, docFile);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('presentation-files')
          .getPublicUrl(filePath);

        // Update current project
        if (currentProject) {
          const { error } = await supabase
            .from('presentation_projects')
            .update({
              document_file_url: publicUrl,
              document_file_name: docFile.name,
              updated_at: new Date().toISOString()
            })
            .eq('id', currentProject.id);

          if (error) throw error;
        }

        toast({
          title: "Document uploaded successfully",
          description: "Ready to generate AI-powered slides",
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

  // New seamless workflow state
  const [isAutoProcessing, setIsAutoProcessing] = useState(false);
  const [hasAudioAndSlides, setHasAudioAndSlides] = useState(false);

  // Check if we have both audio and slides for auto-processing
  useEffect(() => {
    const shouldAutoProcess = audioUrl && slides.length > 0 && !hasAudioAndSlides;
    if (shouldAutoProcess && !isAutoProcessing) {
      setHasAudioAndSlides(true);
      handleSeamlessAnalysis();
    }
  }, [audioUrl, slides.length]);

  const handleSeamlessAnalysis = async () => {
    if (!currentProject?.id || isAutoProcessing) return;

    setIsAutoProcessing(true);
    setIsProcessing(true);

    try {
      toast({
        title: "🚀 Starting Seamless Processing",
        description: "Analyzing PowerPoint and audio, then creating synchronized video...",
      });

      // Enhanced AI analysis with seamless processing (avoid large payloads)
      const { data, error } = await supabase.functions.invoke('presentation-ai-analysis', {
        body: {
          project_id: currentProject.id,
          audio_storage_path: audioStoragePath,
          audio_bucket: 'presentation-files',
          slides: slides,
          analysis_type: 'seamless_workflow'
        }
      });

      if (error) {
        console.error('Seamless Analysis error:', error);
        throw new Error(error.message || 'Seamless analysis failed');
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
              )?.text || '',
              animations: data.animation_timeline?.find((a: any) => a.slide_number === index + 1)?.animations || []
            }
          };
        }
        return slide;
      });
      
      setSlides(analyzedSlides);
      setDuration(data.duration || duration);

      toast({
        title: "✅ Analysis Complete - Starting Video Export",
        description: "Creating synchronized video with animations...",
      });

      // Auto-trigger video export
      setTimeout(() => {
        setShowVideoExportModal(true);
      }, 1000);

    } catch (error) {
      console.error('Seamless processing error:', error);
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "Could not complete seamless processing",
        variant: "destructive",
      });
    } finally {
      setIsAutoProcessing(false);
      setIsProcessing(false);
    }
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
      toast({
        title: "AI Analysis Starting",
        description: "Transcribing audio and analyzing content...",
      });

      // Call the AI analysis edge function without sending large audio payloads
      const { data, error } = await supabase.functions.invoke('presentation-ai-analysis', {
        body: {
          project_id: currentProject.id,
          audio_storage_path: audioStoragePath,
          audio_bucket: 'presentation-files',
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
              )?.text || '',
              animations: data.animation_timeline?.find((a: any) => a.slide_number === index + 1)?.animations || []
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
            onClick={handleSeamlessAnalysis} 
            disabled={isAutoProcessing || !audioUrl || slides.length === 0}
            className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            <Zap className="h-4 w-4" />
            {isAutoProcessing ? "🚀 Processing..." : "🎬 Create Video"}
          </Button>
          <Button 
            onClick={handleAIAnalysis} 
            disabled={isProcessing || !audioUrl || slides.length === 0}
            variant="outline"
            className="gap-2"
          >
            <Zap className="h-4 w-4" />
            {isProcessing ? "Analyzing..." : "AI Analysis Only"}
          </Button>
          <Button onClick={handleSaveProject} disabled={!currentProject} variant="outline" className="gap-2">
            <Save className="h-4 w-4" />
            Save Project
          </Button>
          <Button onClick={() => setShowExportModal(true)} disabled={slides.length === 0} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Data
          </Button>
          <Button onClick={() => setShowVideoExportModal(true)} disabled={slides.length === 0 || isAutoProcessing} className="gap-2">
            <Film className="h-4 w-4" />
            {isAutoProcessing ? "Auto-Export..." : "Manual Export"}
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

      {/* Integrated Timeline and Video Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 min-h-[700px]">
        {/* Left Panel - File Manager */}
        <div className="xl:col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>File Manager</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 border-l-4 border-primary">
                  <h3 className="font-semibold text-lg mb-2">🚀 Seamless Video Creation</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Upload your PowerPoint and audio files, then click <strong>"🎬 Create Video"</strong> for automatic processing:
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>✅ PowerPoint slides extraction</li>
                    <li>✅ Audio transcription & analysis</li>
                    <li>✅ Automatic synchronization</li>
                    <li>✅ Animation timeline generation</li>
                    <li>✅ Video export ready</li>
                  </ul>
                </div>

                <ProjectManager
                  currentProject={currentProject}
                  onProjectChange={setCurrentProject}
                />
                <FileUploadArea 
                  onFileUpload={handleFileUpload}
                  isProcessing={isProcessing}
                />
                
                <GPTStatusChecker />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Integrated Timeline and Video */}
        <div className="xl:col-span-9">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* Timeline Editor Section */}
            <div className="space-y-4">
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

              {/* Slide Preview Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Slide Preview</CardTitle>
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

            {/* Video Preview Section */}
            <div>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Video Preview
                    <Badge variant="outline">
                      Live Sync
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-full">
                  <VideoPreview
                    slides={slides}
                    audioUrl={audioUrl}
                    duration={duration}
                    currentTime={currentTime}
                    isPlaying={isPlaying}
                    onPlayChange={setIsPlaying}
                    onTimeUpdate={setCurrentTime}
                    onExportVideo={(resolution) => {
                      setShowVideoExportModal(true);
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        project={currentProject}
        slides={slides}
      />

      <VideoExportModal
        isOpen={showVideoExportModal}
        onClose={() => setShowVideoExportModal(false)}
        project={currentProject}
        slides={slides}
        audioUrl={audioUrl}
        duration={duration}
      />
    </div>
  );
};