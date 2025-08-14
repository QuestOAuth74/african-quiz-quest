import { ExternalLink, Youtube, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TopNavigation() {
  return (
    <nav className="w-full bg-theme-brown-dark/95 backdrop-blur-sm border-b border-theme-yellow/20 py-3 px-4 fixed top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-theme-yellow font-semibold text-lg">
            Historia Africana
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-theme-yellow-light hover:text-theme-yellow hover:bg-white/10 transition-colors"
          >
            <a href="/forum">
              Baobab Talks
            </a>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-theme-yellow-light hover:text-theme-yellow hover:bg-white/10 transition-colors"
          >
            <a
              href="https://www.youtube.com/@HistoriaAfricana"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <Youtube className="w-4 h-4" />
              <span className="hidden sm:inline">YouTube Channel</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </Button>
          
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-theme-yellow-light hover:text-theme-yellow hover:bg-white/10 transition-colors"
          >
            <a
              href="https://www.historiaafricana.org"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">Website</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </Button>
        </div>
      </div>
    </nav>
  );
}