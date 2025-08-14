import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, MessageCircle, TrendingUp, Users, Sparkles } from 'lucide-react';

interface HeaderSlide {
  id: string;
  title: string;
  description: string;
  badge: string;
  icon: React.ReactNode;
  gradient: string;
}

const ForumHeader = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: HeaderSlide[] = [
    {
      id: '1',
      title: 'Welcome to Baobab Talks',
      description: 'Join the conversation with fellow trivia enthusiasts and share your knowledge',
      badge: 'Community Hub',
      icon: <MessageCircle className="h-6 w-6" />,
      gradient: 'bg-gradient-to-r from-primary/20 to-accent/20'
    },
    {
      id: '2',
      title: 'Share Your Strategies',
      description: 'Discover winning tactics and share your own game-changing approaches',
      badge: 'Strategy Zone',
      icon: <TrendingUp className="h-6 w-6" />,
      gradient: 'bg-gradient-to-r from-accent/20 to-secondary/20'
    },
    {
      id: '3',
      title: 'Growing Community',
      description: 'Connect with players from around the world and build lasting friendships',
      badge: 'Global Network',
      icon: <Users className="h-6 w-6" />,
      gradient: 'bg-gradient-to-r from-secondary/20 to-primary/20'
    },
    {
      id: '4',
      title: 'Latest Features',
      description: 'Explore new question categories and enhanced gameplay features',
      badge: 'What\'s New',
      icon: <Sparkles className="h-6 w-6" />,
      gradient: 'bg-gradient-to-r from-primary/30 to-accent/30'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const currentSlideData = slides[currentSlide];

  return (
    <div className="relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary))_0%,transparent_50%)]" />
      </div>
      
      <Card className={`border-0 shadow-none ${currentSlideData.gradient} transition-all duration-500 ease-in-out`}>
        <CardContent className="relative px-8 py-12">
          {/* Carousel Content */}
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-4xl animate-fade-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  {currentSlideData.icon}
                </div>
                <Badge variant="secondary" className="text-xs font-medium">
                  {currentSlideData.badge}
                </Badge>
              </div>
              
              <h1 className="text-5xl font-bold text-foreground mb-4 tracking-tight">
                {currentSlideData.title}
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
                {currentSlideData.description}
              </p>
            </div>

            {/* Carousel Controls */}
            <div className="flex flex-col items-center gap-4 ml-8">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={prevSlide}
                  className="h-10 w-10 rounded-full hover:scale-105 transition-transform"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={nextSlide}
                  className="h-10 w-10 rounded-full hover:scale-105 transition-transform"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Slide Indicators */}
              <div className="flex gap-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentSlide 
                        ? 'bg-primary w-6' 
                        : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="flex items-center gap-8 mt-8 pt-8 border-t border-border/50">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">1,247</div>
              <div className="text-sm text-muted-foreground">Active Members</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">3,891</div>
              <div className="text-sm text-muted-foreground">Discussions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">12,456</div>
              <div className="text-sm text-muted-foreground">Messages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">24/7</div>
              <div className="text-sm text-muted-foreground">Community</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForumHeader;