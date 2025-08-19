import React from 'react';
import { Waves, Mountain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  
  const handleToggle = () => {
    console.log('🖱️ Theme toggle clicked, current theme:', theme);
    toggleTheme();
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      className={cn(
        "relative h-9 w-16 rounded-full p-0 transition-all duration-500",
        "bg-muted hover:bg-muted/80",
        "border border-border/50"
      )}
      aria-label={`Switch to ${theme === 'brown-gold' ? 'lake' : 'earth'} theme`}
    >
      <div
        className={cn(
          "absolute inset-1 h-7 w-7 rounded-full transition-all duration-500",
          "flex items-center justify-center",
          "bg-background border border-border/20 shadow-sm",
          theme === 'lake' 
            ? "translate-x-7 bg-gradient-to-br from-primary/20 to-primary/10" 
            : "translate-x-0 bg-gradient-to-br from-theme-brown/20 to-theme-yellow/10"
        )}
      >
        {theme === 'brown-gold' ? (
          <Mountain className="h-4 w-4 text-theme-brown" />
        ) : (
          <Waves className="h-4 w-4 text-primary" />
        )}
      </div>
      
      {/* Background icons */}
      <div className="absolute inset-0 flex items-center justify-between px-2">
        <Mountain 
          className={cn(
            "h-3 w-3 transition-opacity duration-300",
            theme === 'brown-gold' ? "opacity-0" : "opacity-40"
          )} 
        />
        <Waves 
          className={cn(
            "h-3 w-3 transition-opacity duration-300",
            theme === 'lake' ? "opacity-0" : "opacity-40"
          )} 
        />
      </div>
    </Button>
  );
};