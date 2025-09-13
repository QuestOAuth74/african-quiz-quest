import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GripVertical, Clock, Zap } from "lucide-react";

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

interface SlideTimelineProps {
  slides: Slide[];
  duration: number;
  currentTime: number;
  onSlideTimeUpdate: (slideId: string, startTime: number, endTime: number) => void;
  onSlideSelect: (slide: Slide) => void;
}

export const SlideTimeline = ({
  slides,
  duration,
  currentTime,
  onSlideTimeUpdate,
  onSlideSelect
}: SlideTimelineProps) => {
  const [dragging, setDragging] = useState<{ slideId: string; type: 'move' | 'start' | 'end' } | null>(null);
  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getTimeFromPosition = (clientX: number) => {
    const timeline = timelineRef.current;
    if (!timeline) return 0;

    const rect = timeline.getBoundingClientRect();
    const position = (clientX - rect.left) / rect.width;
    return Math.max(0, Math.min(duration, position * duration));
  };

  const getPositionFromTime = (time: number) => {
    if (duration === 0) return 0;
    return (time / duration) * 100;
  };

  const handleMouseDown = (slideId: string, type: 'move' | 'start' | 'end') => (e: React.MouseEvent) => {
    e.preventDefault();
    setDragging({ slideId, type });
    
    const slide = slides.find(s => s.id === slideId);
    if (slide) {
      onSlideSelect(slide);
      setSelectedSlideId(slideId);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragging) return;

    const newTime = getTimeFromPosition(e.clientX);
    const slide = slides.find(s => s.id === dragging.slideId);
    if (!slide) return;

    const startTime = slide.start_time || 0;
    const endTime = slide.end_time || startTime + 5;

    if (dragging.type === 'start') {
      const newStartTime = Math.min(newTime, endTime - 0.5);
      onSlideTimeUpdate(dragging.slideId, newStartTime, endTime);
    } else if (dragging.type === 'end') {
      const newEndTime = Math.max(newTime, startTime + 0.5);
      onSlideTimeUpdate(dragging.slideId, startTime, newEndTime);
    } else if (dragging.type === 'move') {
      const slideDuration = endTime - startTime;
      const newStartTime = Math.max(0, Math.min(duration - slideDuration, newTime - slideDuration / 2));
      const newEndTime = newStartTime + slideDuration;
      onSlideTimeUpdate(dragging.slideId, newStartTime, newEndTime);
    }
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  useEffect(() => {
    if (dragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragging]);

  const handleSlideClick = (slide: Slide) => {
    onSlideSelect(slide);
    setSelectedSlideId(slide.id);
  };

  const autoDistributeSlides = () => {
    if (slides.length === 0 || duration === 0) return;

    const slideDuration = duration / slides.length;
    slides.forEach((slide, index) => {
      const startTime = index * slideDuration;
      const endTime = (index + 1) * slideDuration;
      onSlideTimeUpdate(slide.id, startTime, endTime);
    });
  };

  if (slides.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">Upload slides to create timeline</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Slide Timeline</h3>
        <Button onClick={autoDistributeSlides} variant="outline" size="sm" className="gap-2">
          <Clock className="h-4 w-4" />
          Auto Distribute
        </Button>
      </div>

      {/* Timeline Container */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Time Markers */}
            <div className="relative h-6">
              {duration > 0 && Array.from({ length: Math.ceil(duration / 10) + 1 }, (_, i) => i * 10).map(time => (
                <div
                  key={time}
                  className="absolute flex flex-col items-center"
                  style={{ left: `${getPositionFromTime(time)}%` }}
                >
                  <div className="w-px h-4 bg-muted-foreground/30" />
                  <span className="text-xs text-muted-foreground mt-1">
                    {formatTime(time)}
                  </span>
                </div>
              ))}
            </div>

            {/* Timeline Track */}
            <div
              ref={timelineRef}
              className="relative h-16 bg-muted/20 rounded-lg overflow-hidden"
            >
              {/* Current Time Indicator */}
              <div
                className="absolute top-0 w-0.5 h-full bg-primary z-10"
                style={{ left: `${getPositionFromTime(currentTime)}%` }}
              />

              {/* Slide Blocks */}
              {slides.map((slide) => {
                const startTime = slide.start_time || 0;
                const endTime = slide.end_time || startTime + 5;
                const left = getPositionFromTime(startTime);
                const width = getPositionFromTime(endTime) - left;

                return (
                  <div
                    key={slide.id}
                    className={cn(
                      "absolute top-2 h-12 rounded cursor-pointer transition-all border-2",
                      selectedSlideId === slide.id
                        ? "border-primary bg-primary/20"
                        : "border-accent bg-accent/10 hover:border-accent/60",
                      slide.ai_suggestions?.optimal_timing && "ring-2 ring-green-500/30"
                    )}
                    style={{ left: `${left}%`, width: `${width}%` }}
                    onClick={() => handleSlideClick(slide)}
                  >
                    {/* Resize Handles */}
                    <div
                      className="absolute left-0 top-0 w-2 h-full cursor-w-resize bg-primary/50 opacity-0 hover:opacity-100"
                      onMouseDown={handleMouseDown(slide.id, 'start')}
                    />
                    <div
                      className="absolute right-0 top-0 w-2 h-full cursor-e-resize bg-primary/50 opacity-0 hover:opacity-100"
                      onMouseDown={handleMouseDown(slide.id, 'end')}
                    />

                    {/* Content */}
                    <div
                      className="flex items-center px-2 h-full gap-1"
                      onMouseDown={handleMouseDown(slide.id, 'move')}
                    >
                      <GripVertical className="h-3 w-3 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">
                          {slide.title || `Slide ${slide.slide_number}`}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatTime(startTime)} - {formatTime(endTime)}
                        </div>
                        {slide.ai_suggestions?.optimal_timing && (
                          <Badge variant="secondary" className="text-xs h-4 px-1">
                            <Zap className="h-2 w-2 mr-1" />
                            AI
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Slide List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Slides ({slides.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {slides.map((slide) => (
              <div
                key={slide.id}
                className={cn(
                  "flex items-center justify-between p-2 rounded border cursor-pointer transition-colors",
                  selectedSlideId === slide.id
                    ? "border-primary bg-primary/5"
                    : "border-muted hover:border-accent"
                )}
                onClick={() => handleSlideClick(slide)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-6 bg-muted rounded flex items-center justify-center">
                    <span className="text-xs font-mono">{slide.slide_number}</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium">
                      {slide.title || `Slide ${slide.slide_number}`}
                    </div>
                    {slide.content && (
                      <div className="text-xs text-muted-foreground truncate max-w-48">
                        {slide.content}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {slide.start_time !== undefined && slide.end_time !== undefined ? (
                    <span>{formatTime(slide.start_time)} - {formatTime(slide.end_time)}</span>
                  ) : (
                    <span className="text-orange-500">Not synced</span>
                  )}
                  {slide.ai_suggestions?.optimal_timing && (
                    <Zap className="h-3 w-3 text-green-500 ml-1 inline" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};