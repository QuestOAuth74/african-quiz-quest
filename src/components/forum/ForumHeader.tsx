import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, MessageCircle, TrendingUp, Users, Sparkles } from 'lucide-react';
import baobabHeaderImage from '@/assets/baobab-talks-header.png';

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
    <div className="relative overflow-hidden mb-12 h-[500px]">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={baobabHeaderImage} 
          alt="Baobab Talks Header" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>
      
      {/* Overlay Content Container */}
      <div className="relative h-full flex items-center">
        <div className="w-full">
          <div className="px-8 lg:px-12 py-16">
            {/* Modern Hero Content */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="flex-1 text-center lg:text-left animate-fade-in">
                <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30">
                    <div className="text-white">{currentSlideData.icon}</div>
                  </div>
                  <Badge variant="secondary" className="px-4 py-2 text-sm font-semibold rounded-full bg-white/20 text-white border border-white/30">
                    {currentSlideData.badge}
                  </Badge>
                </div>
                
                <h1 className="text-4xl lg:text-6xl font-black text-white mb-6 tracking-tight">
                  {currentSlideData.title}
                </h1>
                
                <p className="text-lg lg:text-xl text-white/90 max-w-3xl leading-relaxed mx-auto lg:mx-0">
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
                    className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 hover:scale-110 transition-all duration-200 shadow-lg text-white"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={nextSlide}
                    className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 hover:scale-110 transition-all duration-200 shadow-lg text-white"
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
                          ? 'bg-white w-8 shadow-lg shadow-white/30' 
                          : 'bg-white/40 w-3 hover:bg-white/60 hover:w-6'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumHeader;