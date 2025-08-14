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
      description: 'Explore the rich history of Africa and share knowledge about our heritage',
      badge: 'African Heritage',
      icon: <MessageCircle className="h-6 w-6" />,
      gradient: 'bg-gradient-to-r from-primary/20 to-accent/20'
    },
    {
      id: '2',
      title: 'Ancient Civilizations',
      description: 'Discover the great kingdoms of Africa - from Kush to Zimbabwe, Mali to Axum',
      badge: 'Historical Empires',
      icon: <TrendingUp className="h-6 w-6" />,
      gradient: 'bg-gradient-to-r from-accent/20 to-secondary/20'
    },
    {
      id: '3',
      title: 'Cultural Exchange',
      description: 'Connect with fellow history enthusiasts and share stories from across the continent',
      badge: 'Community',
      icon: <Users className="h-6 w-6" />,
      gradient: 'bg-gradient-to-r from-secondary/20 to-primary/20'
    },
    {
      id: '4',
      title: 'Preserving Our Stories',
      description: 'Help document and preserve African narratives for future generations',
      badge: 'Legacy Building',
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
    <div className="relative overflow-hidden mb-12">
      {/* Modern Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.1),transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_30%,hsl(var(--accent)/0.05)_50%,transparent_70%)]" />
      </div>
      
      {/* Modern Content Container */}
      <div className="relative">
        <Card className={`border-none shadow-2xl ${currentSlideData.gradient} transition-all duration-700 ease-in-out backdrop-blur-lg overflow-hidden`}>
          <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/60 to-background/40" />
          <CardContent className="relative px-8 lg:px-12 py-16">
            {/* Modern Hero Content */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="flex-1 text-center lg:text-left animate-fade-in">
                <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
                  <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl backdrop-blur-sm border border-border/50">
                    {currentSlideData.icon}
                  </div>
                  <Badge variant="secondary" className="px-4 py-2 text-sm font-semibold rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-border/30">
                    {currentSlideData.badge}
                  </Badge>
                </div>
                
                <h1 className="text-4xl lg:text-6xl font-black text-foreground mb-6 tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">
                  {currentSlideData.title}
                </h1>
                
                <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl leading-relaxed mx-auto lg:mx-0">
                  {currentSlideData.description}
                </p>
              </div>

              {/* Modern Navigation */}
              <div className="flex flex-col items-center gap-6 lg:ml-8">
                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={prevSlide}
                    className="h-12 w-12 rounded-full bg-background/50 backdrop-blur-sm border border-border/50 hover:bg-background/80 hover:scale-110 transition-all duration-200 shadow-lg"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={nextSlide}
                    className="h-12 w-12 rounded-full bg-background/50 backdrop-blur-sm border border-border/50 hover:bg-background/80 hover:scale-110 transition-all duration-200 shadow-lg"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
                
                {/* Modern Slide Indicators */}
                <div className="flex gap-3">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`h-3 rounded-full transition-all duration-500 ${
                        index === currentSlide 
                          ? 'bg-primary w-8 shadow-lg shadow-primary/30' 
                          : 'bg-muted-foreground/40 w-3 hover:bg-muted-foreground/60 hover:w-6'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForumHeader;