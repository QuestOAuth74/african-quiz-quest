import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { FileText, Image, Clock, Zap, Lightbulb, ChevronLeft, ChevronRight } from "lucide-react";

interface Slide {
  id: string;
  slide_number: number;
  title?: string;
  content?: string;
  image_url?: string;
  start_time?: number;
  end_time?: number;
  duration?: number;
  ai_suggestions?: {
    optimal_timing?: boolean;
    content_match?: 'high' | 'medium' | 'low';
    suggested_adjustments?: string[];
  };
}

interface SlidePreviewProps {
  slide: Slide | null;
  currentTime: number;
  slides: Slide[];
}

export const SlidePreview = ({ slide, currentTime, slides }: SlidePreviewProps) => {
  // Find currently active slide based on timeline
  const activeSlide = slides.find(s => 
    s.start_time !== undefined && 
    s.end_time !== undefined && 
    currentTime >= s.start_time && 
    currentTime <= s.end_time
  );

  const displaySlide = slide || activeSlide;

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getContentMatchColor = (match?: 'high' | 'medium' | 'low') => {
    switch (match) {
      case 'high': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const getContentMatchText = (match?: 'high' | 'medium' | 'low') => {
    switch (match) {
      case 'high': return 'High Match';
      case 'medium': return 'Medium Match';
      case 'low': return 'Low Match';
      default: return 'Not Analyzed';
    }
  };

  if (!displaySlide) {
    return (
      <Card className="h-full">
        <CardContent className="flex flex-col items-center justify-center h-full text-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Select a slide or play audio to see preview
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Slide Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            Slide {displaySlide.slide_number}
          </Badge>
          {displaySlide === activeSlide && (
            <Badge variant="default" className="gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Live
            </Badge>
          )}
        </div>
      </div>

      {/* Slide Preview */}
      <Card className="flex-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            {displaySlide.image_url ? (
              <Image className="h-4 w-4" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            {displaySlide.title || `Slide ${displaySlide.slide_number}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Slide Content */}
          {displaySlide.image_url ? (
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden">
              <img 
                src={displaySlide.image_url} 
                alt={displaySlide.title || `Slide ${displaySlide.slide_number}`}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ) : (
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center p-4">
              <div className="text-center space-y-2">
                <FileText className="h-8 w-8 text-muted-foreground mx-auto" />
                <div className="text-sm font-medium">
                  {displaySlide.title || `Slide ${displaySlide.slide_number}`}
                </div>
                {displaySlide.content && (
                  <div className="text-xs text-muted-foreground max-w-xs">
                    {displaySlide.content}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timing Information */}
          {displaySlide.start_time !== undefined && displaySlide.end_time !== undefined && (
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {formatTime(displaySlide.start_time)} - {formatTime(displaySlide.end_time)}
                </span>
              </div>
              <Badge variant="secondary">
                {Math.round((displaySlide.end_time - displaySlide.start_time) * 10) / 10}s
              </Badge>
            </div>
          )}

          {/* AI Suggestions */}
          {displaySlide.ai_suggestions && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">AI Analysis</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center justify-between">
                  <span>Timing:</span>
                  <Badge 
                    variant={displaySlide.ai_suggestions.optimal_timing ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {displaySlide.ai_suggestions.optimal_timing ? "Optimal" : "Needs Work"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Content Match:</span>
                  <Badge 
                    variant="outline" 
                    className={cn("text-xs", getContentMatchColor(displaySlide.ai_suggestions.content_match))}
                  >
                    {getContentMatchText(displaySlide.ai_suggestions.content_match)}
                  </Badge>
                </div>
              </div>

              {displaySlide.ai_suggestions.suggested_adjustments && displaySlide.ai_suggestions.suggested_adjustments.length > 0 && (
                <Alert>
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <div className="font-medium text-sm">Suggestions:</div>
                      <ul className="list-disc list-inside text-xs space-y-1">
                        {displaySlide.ai_suggestions.suggested_adjustments.map((suggestion, index) => (
                          <li key={index}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Slide Navigation */}
          <div className="flex justify-between items-center pt-2 border-t">
            <Button 
              variant="ghost" 
              size="sm"
              disabled={displaySlide.slide_number <= 1}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <span className="text-xs text-muted-foreground">
              {displaySlide.slide_number} of {slides.length}
            </span>
            
            <Button 
              variant="ghost" 
              size="sm"
              disabled={displaySlide.slide_number >= slides.length}
              className="gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};