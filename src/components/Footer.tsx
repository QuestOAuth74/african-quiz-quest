import { Link } from 'react-router-dom';
import { Home, Trophy, MessageCircle, User, Globe, Youtube, Instagram, Heart, Coffee, ExternalLink, Gamepad2, Target, Crosshair, Grid3X3, Crown, Circle } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-primary border-t-4 border-border mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-primary-foreground font-bold text-lg">Historia Africana</h3>
            <p className="text-primary-foreground/80 text-sm">
              Explore the rich history of Africa through interactive trivia and engaging discussions.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="space-y-4">
            <h4 className="text-primary-foreground font-bold">Navigation</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/" 
                  className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground hover:underline transition-colors text-sm font-medium"
                >
                  <Home className="h-4 w-4" />
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/leaderboard" 
                  className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground hover:underline transition-colors text-sm font-medium"
                >
                  <Trophy className="h-4 w-4" />
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link 
                  to="/forum" 
                  className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground hover:underline transition-colors text-sm font-medium"
                >
                  <MessageCircle className="h-4 w-4" />
                  Baobab Talks
                </Link>
              </li>
              <li>
                <Link 
                  to="/profile" 
                  className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground hover:underline transition-colors text-sm font-medium"
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Games Section */}
          <div className="space-y-4">
            <h4 className="text-primary-foreground font-bold">Games</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/" 
                  className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground hover:underline transition-colors text-sm font-medium"
                >
                  <Gamepad2 className="h-4 w-4" />
                  Jeopardy Quiz
                </Link>
              </li>
              <li>
                <Link 
                  to="/quiz" 
                  className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground hover:underline transition-colors text-sm font-medium"
                >
                  <Target className="h-4 w-4" />
                  Quick Quiz
                </Link>
              </li>
              <li>
                <Link 
                  to="/wheel" 
                  className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground hover:underline transition-colors text-sm font-medium"
                >
                  <Crosshair className="h-4 w-4" />
                  Wheel of Destiny
                </Link>
              </li>
              <li>
                <Link 
                  to="/crossword" 
                  className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground hover:underline transition-colors text-sm font-medium"
                >
                  <Grid3X3 className="h-4 w-4" />
                  Crossword Puzzles
                </Link>
              </li>
              <li>
                <Link 
                  to="/senet" 
                  className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground hover:underline transition-colors text-sm font-medium"
                >
                  <Crown className="h-4 w-4" />
                  Ancient Senet
                </Link>
              </li>
              <li>
                <Link 
                  to="/oware" 
                  className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground hover:underline transition-colors text-sm font-medium"
                >
                  <Circle className="h-4 w-4" />
                  Oware (African Chess)
                </Link>
              </li>
            </ul>
          </div>

          {/* Community Links */}
          <div className="space-y-4">
            <h4 className="text-primary-foreground font-bold">Community</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://www.historiaafricana.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground hover:underline transition-colors text-sm font-medium"
                >
                  <Globe className="h-4 w-4" />
                  Website
                </a>
              </li>
              <li>
                <a 
                  href="https://www.youtube.com/@HistoriaAfricana" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground hover:underline transition-colors text-sm font-medium"
                >
                  <Youtube className="h-4 w-4" />
                  YouTube Channel
                </a>
              </li>
              <li>
                <a 
                  href="https://www.instagram.com/historiaafricana1" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground hover:underline transition-colors text-sm font-medium"
                >
                  <Instagram className="h-4 w-4" />
                  Instagram
                </a>
              </li>
              <li>
                <a 
                  href="https://patreon.com/HistoriaAfricanaYoutubeChannel" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground hover:underline transition-colors text-sm font-medium"
                >
                  <Heart className="h-4 w-4" />
                  Patreon
                </a>
              </li>
              <li>
                <a 
                  href="https://www.buymeacoffee.com/historiaafricanachannel" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground hover:underline transition-colors text-sm font-medium"
                >
                  <Coffee className="h-4 w-4" />
                  Buy Me A Coffee
                </a>
              </li>
              <li>
                <a 
                  href="https://linktr.ee/historiaafricana" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground hover:underline transition-colors text-sm font-medium"
                >
                  <ExternalLink className="h-4 w-4" />
                  Our Linktree
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Access */}
          <div className="space-y-4">
            <h4 className="text-primary-foreground font-bold">Quick Access</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/auth" 
                  className="text-primary-foreground/80 hover:text-primary-foreground hover:underline transition-colors text-sm font-medium"
                >
                  Sign In / Sign Up
                </Link>
              </li>
              <li>
                <Link 
                  to="/forum" 
                  className="text-primary-foreground/80 hover:text-primary-foreground hover:underline transition-colors text-sm font-medium"
                >
                  Join Discussion
                </Link>
              </li>
              <li>
                <Link 
                  to="/" 
                  className="text-primary-foreground/80 hover:text-primary-foreground hover:underline transition-colors text-sm font-medium"
                >
                  Play Trivia
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className="text-primary-foreground/80 hover:text-primary-foreground hover:underline transition-colors text-sm font-medium"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/privacy" 
                  className="text-primary-foreground/80 hover:text-primary-foreground hover:underline transition-colors text-sm font-medium"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t-4 border-border">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-primary-foreground/80 text-sm font-medium">
              © {new Date().getFullYear()} Historia Africana. Preserving and sharing African heritage.
            </p>
            <div className="flex items-center space-x-6">
              <Link 
                to="/forum" 
                className="text-primary-foreground/80 hover:text-primary-foreground hover:underline transition-colors text-sm font-medium"
              >
                Community Guidelines
              </Link>
              <span className="text-primary-foreground font-bold">•</span>
              <span className="text-primary-foreground/80 text-sm font-medium">
                Made with passion for African history
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;