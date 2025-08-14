import { useState } from "react";
import { ExternalLink, Youtube, Globe, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const TopNavigation = () => {
  const [open, setOpen] = useState(false);
  return (
    <nav className="w-full bg-theme-brown-dark/95 backdrop-blur-sm border-b border-theme-yellow/20 py-3 px-4 fixed top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-theme-yellow font-semibold text-lg">
            Historia Africana
          </span>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-3">
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
            <a href="/profile">
              Profile
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

        {/* Mobile Hamburger Menu */}
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-theme-yellow-light hover:text-theme-yellow hover:bg-white/10 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent 
              side="right" 
              className="w-80 bg-theme-brown-dark border-theme-yellow/20"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="pb-6 border-b border-theme-yellow/20">
                  <span className="text-theme-yellow font-semibold text-lg">
                    Historia Africana
                  </span>
                </div>

                {/* Navigation Links */}
                <nav className="flex flex-col space-y-4 pt-6">
                  <a
                    href="/"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 text-theme-yellow-light hover:text-theme-yellow transition-colors p-3 rounded-md hover:bg-white/10"
                  >
                    <span>Home</span>
                  </a>
                  
                  <a
                    href="/forum"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 text-theme-yellow-light hover:text-theme-yellow transition-colors p-3 rounded-md hover:bg-white/10"
                  >
                    <span>Baobab Talks</span>
                  </a>
                  
                  <a
                    href="/profile"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 text-theme-yellow-light hover:text-theme-yellow transition-colors p-3 rounded-md hover:bg-white/10"
                  >
                    <span>Profile</span>
                  </a>
                  
                  <a
                    href="/leaderboard"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 text-theme-yellow-light hover:text-theme-yellow transition-colors p-3 rounded-md hover:bg-white/10"
                  >
                    <span>Leaderboard</span>
                  </a>

                  {/* Divider */}
                  <div className="border-t border-theme-yellow/20 my-4"></div>

                  {/* External Links */}
                  <a
                    href="https://www.youtube.com/@HistoriaAfricana"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 text-theme-yellow-light hover:text-theme-yellow transition-colors p-3 rounded-md hover:bg-white/10"
                  >
                    <Youtube className="w-4 h-4" />
                    <span>YouTube Channel</span>
                    <ExternalLink className="w-3 h-3 ml-auto" />
                  </a>
                  
                  <a
                    href="https://www.historiaafricana.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 text-theme-yellow-light hover:text-theme-yellow transition-colors p-3 rounded-md hover:bg-white/10"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Website</span>
                    <ExternalLink className="w-3 h-3 ml-auto" />
                  </a>
                </nav>

                {/* Auth Link at Bottom */}
                <div className="mt-auto pt-6 border-t border-theme-yellow/20">
                  <a
                    href="/auth"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center gap-2 text-theme-brown-dark bg-theme-yellow hover:bg-theme-yellow/90 transition-colors p-3 rounded-md font-medium"
                  >
                    <span>Sign In / Sign Up</span>
                  </a>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default TopNavigation;