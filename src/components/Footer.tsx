import { Link } from 'react-router-dom';
import { Home, Trophy, MessageCircle, User, Globe, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-theme-brown-dark border-t border-theme-yellow/20 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-theme-yellow font-semibold text-lg">Historia Africana</h3>
            <p className="text-theme-yellow-light text-sm">
              Explore the rich history of Africa through interactive trivia and engaging discussions.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="space-y-4">
            <h4 className="text-theme-yellow font-medium">Navigation</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/" 
                  className="flex items-center gap-2 text-theme-yellow-light hover:text-theme-yellow transition-colors text-sm"
                >
                  <Home className="h-4 w-4" />
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/leaderboard" 
                  className="flex items-center gap-2 text-theme-yellow-light hover:text-theme-yellow transition-colors text-sm"
                >
                  <Trophy className="h-4 w-4" />
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link 
                  to="/forum" 
                  className="flex items-center gap-2 text-theme-yellow-light hover:text-theme-yellow transition-colors text-sm"
                >
                  <MessageCircle className="h-4 w-4" />
                  Baobab Talks
                </Link>
              </li>
              <li>
                <Link 
                  to="/profile" 
                  className="flex items-center gap-2 text-theme-yellow-light hover:text-theme-yellow transition-colors text-sm"
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Community Links */}
          <div className="space-y-4">
            <h4 className="text-theme-yellow font-medium">Community</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://www.historiaafricana.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-theme-yellow-light hover:text-theme-yellow transition-colors text-sm"
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
                  className="flex items-center gap-2 text-theme-yellow-light hover:text-theme-yellow transition-colors text-sm"
                >
                  <Youtube className="h-4 w-4" />
                  YouTube Channel
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Access */}
          <div className="space-y-4">
            <h4 className="text-theme-yellow font-medium">Quick Access</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/auth" 
                  className="text-theme-yellow-light hover:text-theme-yellow transition-colors text-sm"
                >
                  Sign In / Sign Up
                </Link>
              </li>
              <li>
                <Link 
                  to="/forum" 
                  className="text-theme-yellow-light hover:text-theme-yellow transition-colors text-sm"
                >
                  Join Discussion
                </Link>
              </li>
              <li>
                <Link 
                  to="/" 
                  className="text-theme-yellow-light hover:text-theme-yellow transition-colors text-sm"
                >
                  Play Trivia
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-theme-yellow/20">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-theme-yellow-light text-sm">
              © {new Date().getFullYear()} Historia Africana. Preserving and sharing African heritage.
            </p>
            <div className="flex items-center space-x-6">
              <Link 
                to="/forum" 
                className="text-theme-yellow-light hover:text-theme-yellow transition-colors text-sm"
              >
                Community Guidelines
              </Link>
              <span className="text-theme-yellow-light text-sm">•</span>
              <span className="text-theme-yellow-light text-sm">
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