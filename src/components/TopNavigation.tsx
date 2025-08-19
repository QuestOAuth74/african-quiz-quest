import { useState } from "react";
import { ExternalLink, Youtube, Globe, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const TopNavigation = () => {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleProtectedNavigation = (path: string, featureName: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: `Please sign in to access ${featureName}.`,
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    navigate(path);
  };

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out.",
    });
    navigate('/');
  };
  return (
    <nav className="w-full bg-theme-brown-dark/95 backdrop-blur-lg border-b border-theme-yellow/20 py-2 sm:py-3 px-3 sm:px-4 fixed top-0 z-40 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 animate-fade-in">
          <span className="text-theme-yellow font-semibold text-base sm:text-lg truncate hover:text-theme-yellow-light transition-colors duration-300">
            Historia Africana
          </span>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-3 animate-slide-in-right">
          <Button
            variant="ghost"
            size="sm"
            className="text-theme-yellow-light hover:text-theme-yellow hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-md"
            onClick={() => handleProtectedNavigation('/quiz-setup', 'Start Quiz')}
          >
            Start Quiz
          </Button>
          
          <Link
            to="/blog"
            className="text-theme-yellow-light hover:text-theme-yellow hover:bg-white/10 transition-colors px-3 py-2 text-sm rounded-md"
          >
            Blog
          </Link>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-theme-yellow-light hover:text-theme-yellow hover:bg-white/10 transition-colors"
            onClick={() => handleProtectedNavigation('/forum', 'Baobab Talks')}
          >
            Baobab Talks
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-theme-yellow-light hover:text-theme-yellow hover:bg-white/10 transition-colors"
            onClick={() => handleProtectedNavigation('/profile', 'Profile')}
          >
            Profile
          </Button>
          
          {/* Auth Button */}
          {isAuthenticated ? (
            <Button
              variant="ghost"
              size="sm"
              className="text-theme-yellow-light hover:text-theme-yellow hover:bg-white/10 transition-colors"
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          ) : (
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-theme-yellow-light hover:text-theme-yellow hover:bg-white/10 transition-colors"
            >
              <Link to="/auth">Sign In</Link>
            </Button>
          )}
          
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
                  <Link
                    to="/"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 text-theme-yellow-light hover:text-theme-yellow transition-colors p-3 rounded-md hover:bg-white/10"
                  >
                    <span>Home</span>
                  </Link>
                  
                  <button
                    onClick={() => {
                      setOpen(false);
                      handleProtectedNavigation('/quiz-setup', 'Start Quiz');
                    }}
                    className="flex items-center gap-3 text-theme-yellow-light hover:text-theme-yellow transition-colors p-3 rounded-md hover:bg-white/10 w-full text-left"
                  >
                    <span>Start Quiz</span>
                  </button>
                  
                  <Link
                    to="/blog"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 text-theme-yellow-light hover:text-theme-yellow transition-colors p-3 rounded-md hover:bg-white/10"
                  >
                    <span>Blog</span>
                  </Link>
                  
                  <button
                    onClick={() => {
                      setOpen(false);
                      handleProtectedNavigation('/forum', 'Baobab Talks');
                    }}
                    className="flex items-center gap-3 text-theme-yellow-light hover:text-theme-yellow transition-colors p-3 rounded-md hover:bg-white/10 w-full text-left"
                  >
                    <span>Baobab Talks</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setOpen(false);
                      handleProtectedNavigation('/profile', 'Profile');
                    }}
                    className="flex items-center gap-3 text-theme-yellow-light hover:text-theme-yellow transition-colors p-3 rounded-md hover:bg-white/10 w-full text-left"
                  >
                    <span>Profile</span>
                  </button>
                  
                  <Link
                    to="/leaderboard"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 text-theme-yellow-light hover:text-theme-yellow transition-colors p-3 rounded-md hover:bg-white/10"
                  >
                    <span>Leaderboard</span>
                  </Link>

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
                  {isAuthenticated ? (
                    <button
                      onClick={handleSignOut}
                      className="flex items-center justify-center gap-2 text-theme-brown-dark bg-theme-yellow hover:bg-theme-yellow/90 transition-colors p-3 rounded-md font-medium w-full"
                    >
                      <span>Sign Out</span>
                    </button>
                  ) : (
                    <Link
                      to="/auth"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-center gap-2 text-theme-brown-dark bg-theme-yellow hover:bg-theme-yellow/90 transition-colors p-3 rounded-md font-medium"
                    >
                      <span>Sign In / Sign Up</span>
                    </Link>
                  )}
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