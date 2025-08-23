import { Maximize, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useFullscreen } from '@/hooks/useFullscreen';

interface FullscreenToggleProps {
  className?: string;
}

export const FullscreenToggle = ({ className }: FullscreenToggleProps) => {
  const { isFullscreen, toggleFullscreen, isSupported } = useFullscreen();

  if (!isSupported) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className={className}
            aria-label={isFullscreen ? 'Exit fullscreen mode' : 'Enter fullscreen mode'}
          >
            {isFullscreen ? (
              <Minimize className="h-4 w-4" />
            ) : (
              <Maximize className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isFullscreen ? 'Exit Fullscreen (F11)' : 'Enter Fullscreen (F11)'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};