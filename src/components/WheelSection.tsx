import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { Disc, Users, Bot, Zap, Trophy, Star } from 'lucide-react';

export const WheelSection = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleWheelAccess = () => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    navigate('/wheel');
  };

  const gameFeatures = [
    {
      icon: Bot,
      title: 'Single Player',
      description: 'Practice against AI opponents with multiple difficulty levels',
    },
    {
      icon: Users,
      title: 'Challenge Friends',
      description: 'Send direct challenges to other players online',
    },
    {
      icon: Zap,
      title: 'Quick Match',
      description: 'Find random opponents for instant gameplay',
    }
  ];

  return (
    <section className="relative py-16 bg-background border-y-4 border-border">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Disc className="h-8 w-8 text-primary" />
            <h2 className="text-4xl font-bold text-primary">
              Wheel of Destiny
            </h2>
            <Badge className="bg-accent text-accent-foreground font-bold border-2 border-border">
              New!
            </Badge>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Spin the wheel and solve African-themed puzzles in this exciting word game. 
            Test your knowledge of African culture, history, and geography while earning points and avoiding bankruptcy!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Game Modes */}
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Trophy className="h-6 w-6 text-primary" />
              Game Modes
            </h3>
            
            <div className="grid gap-4">
              {gameFeatures.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <Card key={index} className="neo-card hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-200">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-primary border-2 border-border">
                          <IconComponent className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg text-foreground">{feature.title}</h4>
                          <p className="text-muted-foreground text-sm">{feature.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Game Preview */}
          <Card className="neo-card">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl flex items-center justify-center gap-2 text-primary">
                <Star className="h-6 w-6" />
                How to Play
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold border-2 border-border">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold">Spin the Wheel</h4>
                    <p className="text-sm text-muted-foreground">Spin to earn points (200-1000) or risk BANKRUPT/LOSE TURN</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-secondary text-secondary-foreground flex items-center justify-center text-sm font-bold border-2 border-border">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold">Guess Letters</h4>
                    <p className="text-sm text-muted-foreground">Reveal letters in African-themed words and phrases</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-accent text-accent-foreground flex items-center justify-center text-sm font-bold border-2 border-border">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold">Solve the Puzzle</h4>
                    <p className="text-sm text-muted-foreground">Be the first to solve and earn bonus points!</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t-4 border-border">
                <Button 
                  onClick={handleWheelAccess}
                  className="neo-button w-full bg-primary text-primary-foreground hover:bg-primary/90 text-lg py-6 font-bold"
                  size="lg"
                >
                  <Disc className="mr-2 h-5 w-5" />
                  {isAuthenticated ? 'Play Wheel of Destiny' : 'Sign In to Play'}
                </Button>
                
                {!isAuthenticated && (
                  <p className="text-center text-sm text-muted-foreground mt-2">
                    Create a free account to save your progress and compete with friends
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sample Categories Preview */}
        <div className="mt-12 text-center">
          <h3 className="text-xl font-bold mb-6 text-foreground">Featured Categories</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              'African Countries',
              'African Culture', 
              'African Wildlife',
              'African History',
              'African Geography',
              'African Music',
              'African Literature',
              'African Cuisine'
            ].map((category, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="px-4 py-2 text-sm font-bold border-2 border-border bg-card hover:bg-muted transition-colors"
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};