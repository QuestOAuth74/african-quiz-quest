import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Download, 
  FileText, 
  Play, 
  Clock, 
  CheckCircle,
  AlertCircle,
  FileDown
} from "lucide-react";

interface PresentationProject {
  id: string;
  name: string;
  description?: string;
  status: string;
  total_slides: number;
  total_duration?: number;
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
}

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: PresentationProject | null;
  slides: Slide[];
}

export const ExportModal = ({ isOpen, onClose, project, slides }: ExportModalProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportType, setExportType] = useState<'timing' | 'preview' | 'powerpoint'>('timing');
  const { toast } = useToast();

  const syncedSlides = slides.filter(slide => 
    slide.start_time !== undefined && slide.end_time !== undefined
  );

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const generateTimingMetadata = () => {
    const metadata = {
      project: {
        name: project?.name,
        description: project?.description,
        total_slides: slides.length,
        total_duration: project?.total_duration,
        exported_at: new Date().toISOString()
      },
      slides: slides.map(slide => ({
        slide_number: slide.slide_number,
        title: slide.title,
        start_time: slide.start_time,
        end_time: slide.end_time,
        duration: slide.duration,
        synced: slide.start_time !== undefined && slide.end_time !== undefined
      })),
      timing_summary: {
        total_slides: slides.length,
        synced_slides: syncedSlides.length,
        unsynced_slides: slides.length - syncedSlides.length,
        total_presentation_time: project?.total_duration || 0
      }
    };

    return JSON.stringify(metadata, null, 2);
  };

  const downloadFile = (content: string, filename: string, mimeType: string = 'application/json') => {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleExport = async (type: 'timing' | 'preview' | 'powerpoint') => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      // Simulate export progress
      for (let i = 0; i <= 100; i += 10) {
        setExportProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      switch (type) {
        case 'timing':
          const timingData = generateTimingMetadata();
          downloadFile(
            timingData, 
            `${project?.name || 'presentation'}_timing.json`,
            'application/json'
          );
          toast({
            title: "Timing metadata exported",
            description: "Timing data has been downloaded successfully",
          });
          break;

        case 'preview':
          // Generate HTML preview
          const htmlContent = generatePreviewHTML();
          downloadFile(
            htmlContent, 
            `${project?.name || 'presentation'}_preview.html`,
            'text/html'
          );
          toast({
            title: "Preview exported",
            description: "HTML preview has been downloaded successfully",
          });
          break;

        case 'powerpoint':
          // Generate PowerPoint slides using AI
          if (!project?.id) {
            throw new Error('Project ID is required for PowerPoint generation');
          }

          // Call the edge function to generate PowerPoint slides
          const { data: aiResponse, error: aiError } = await supabase.functions.invoke('presentation-ai-analysis', {
            body: {
              project_id: project.id,
              slides: slides.map(slide => ({
                title: slide.title,
                content: slide.content,
                slide_number: slide.slide_number
              })),
              topic: project.name,
              analysis_type: 'generate_powerpoint'
            }
          });

          if (aiError || !aiResponse?.generated_slides) {
            throw new Error('Failed to generate PowerPoint slides');
          }

          // Download each slide as an HTML file
          aiResponse.generated_slides.forEach((slideHtml: string, index: number) => {
            downloadFile(
              slideHtml,
              `${project.name || 'presentation'}_slide_${index + 1}.html`,
              'text/html'
            );
          });

          toast({
            title: "PowerPoint slides generated",
            description: `${aiResponse.generated_slides.length} HTML slides have been downloaded`,
          });
          break;
      }
    } catch (error) {
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const generatePreviewHTML = () => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${project?.name || 'Presentation'} - Preview</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
        .header { text-align: center; margin-bottom: 30px; }
        .slide { border: 1px solid #ddd; margin: 20px 0; padding: 20px; border-radius: 8px; }
        .slide-header { display: flex; justify-content: between; align-items: center; margin-bottom: 15px; }
        .slide-number { background: #007bff; color: white; padding: 5px 10px; border-radius: 4px; }
        .timing { color: #666; font-size: 0.9em; }
        .synced { background: #28a745; }
        .unsynced { background: #dc3545; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${project?.name || 'Presentation Preview'}</h1>
            <p>${project?.description || ''}</p>
            <p>Total Slides: ${slides.length} | Synced: ${syncedSlides.length}</p>
        </div>
        
        ${slides.map(slide => `
        <div class="slide">
            <div class="slide-header">
                <span class="slide-number ${slide.start_time !== undefined ? 'synced' : 'unsynced'}">
                    Slide ${slide.slide_number}
                </span>
                <span class="timing">
                    ${slide.start_time !== undefined && slide.end_time !== undefined 
                      ? `${formatTime(slide.start_time)} - ${formatTime(slide.end_time)}`
                      : 'Not synced'
                    }
                </span>
            </div>
            <h3>${slide.title || `Slide ${slide.slide_number}`}</h3>
            ${slide.content ? `<p>${slide.content}</p>` : ''}
            ${slide.image_url ? `<img src="${slide.image_url}" style="max-width: 100%; height: auto;" alt="Slide image">` : ''}
        </div>
        `).join('')}
    </div>
</body>
</html>
    `;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Export Presentation</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Project Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Project Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Project Name</p>
                  <p className="text-sm text-muted-foreground">{project?.name || 'Untitled'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <Badge variant="outline">{project?.status || 'Draft'}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">Total Slides</p>
                  <p className="text-sm text-muted-foreground">{slides.length}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Synced Slides</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{syncedSlides.length}</span>
                    {syncedSlides.length === slides.length ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                    )}
                  </div>
                </div>
              </div>

              {syncedSlides.length < slides.length && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {slides.length - syncedSlides.length} slides are not synced with audio timing.
                    Consider completing synchronization before exporting.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Export Options */}
          <div className="grid grid-cols-1 gap-4">
            <Card 
              className={`cursor-pointer transition-colors ${exportType === 'timing' ? 'border-primary' : 'hover:border-accent'}`}
              onClick={() => setExportType('timing')}
            >
              <CardContent className="flex items-center gap-4 pt-6">
                <FileText className="h-8 w-8 text-accent" />
                <div className="flex-1">
                  <h3 className="font-medium">Timing Metadata</h3>
                  <p className="text-sm text-muted-foreground">
                    Export JSON file with slide timing information for integration
                  </p>
                </div>
                <Badge variant={exportType === 'timing' ? 'default' : 'outline'}>
                  JSON
                </Badge>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-colors ${exportType === 'preview' ? 'border-primary' : 'hover:border-accent'}`}
              onClick={() => setExportType('preview')}
            >
              <CardContent className="flex items-center gap-4 pt-6">
                <Play className="h-8 w-8 text-accent" />
                <div className="flex-1">
                  <h3 className="font-medium">HTML Preview</h3>
                  <p className="text-sm text-muted-foreground">
                    Generate an HTML file to preview the synchronized presentation
                  </p>
                </div>
                <Badge variant={exportType === 'preview' ? 'default' : 'outline'}>
                  HTML
                </Badge>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-colors ${exportType === 'powerpoint' ? 'border-primary' : 'hover:border-accent'}`}
              onClick={() => setExportType('powerpoint')}
            >
              <CardContent className="flex items-center gap-4 pt-6">
                <FileDown className="h-8 w-8 text-accent" />
                <div className="flex-1">
                  <h3 className="font-medium">AI PowerPoint Generator</h3>
                  <p className="text-sm text-muted-foreground">
                    Generate enhanced HTML slides with AI-powered content and professional styling
                  </p>
                </div>
                <Badge variant={exportType === 'powerpoint' ? 'default' : 'outline'}>
                  HTML
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Export Progress */}
          {isExporting && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Exporting {exportType}...</span>
                <span>{Math.round(exportProgress)}%</span>
              </div>
              <Progress value={exportProgress} className="w-full" />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isExporting}>
            Cancel
          </Button>
          <Button 
            onClick={() => handleExport(exportType)} 
            disabled={isExporting || !project || slides.length === 0}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};