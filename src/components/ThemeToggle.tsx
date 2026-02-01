import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

export const ThemeToggle: React.FC = () => {
  const { colorMode, toggleColorMode } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleColorMode}
      className={cn(
        "relative h-9 w-16 rounded-full p-0 transition-all duration-300",
        "bg-muted hover:bg-muted/80",
        "border border-border/50"
      )}
      aria-label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
    >
      <div
        className={cn(
          "absolute inset-1 h-7 w-7 rounded-full transition-all duration-300",
          "flex items-center justify-center",
          "bg-background border border-border/20 shadow-sm",
          colorMode === 'dark'
            ? "translate-x-7"
            : "translate-x-0"
        )}
      >
        {colorMode === 'light' ? (
          <Sun className="h-4 w-4 text-accent" />
        ) : (
          <Moon className="h-4 w-4 text-primary" />
        )}
      </div>

      {/* Background icons */}
      <div className="absolute inset-0 flex items-center justify-between px-2">
        <Sun
          className={cn(
            "h-3 w-3 transition-opacity duration-300",
            colorMode === 'light' ? "opacity-0" : "opacity-40"
          )}
        />
        <Moon
          className={cn(
            "h-3 w-3 transition-opacity duration-300",
            colorMode === 'dark' ? "opacity-0" : "opacity-40"
          )}
        />
      </div>
    </Button>
  );
};
