import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ParallaxBanner } from '@/components/ParallaxBanner';
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
      color: 'text-blue-500'
    },
    {
      icon: Users,
      title: 'Challenge Friends',
      description: 'Send direct challenges to other players online',
      color: 'text-green-500'
    },
    {
      icon: Zap,
      title: 'Quick Match',
      description: 'Find random opponents for instant gameplay',
      color: 'text-orange-500'
    }
  ];

  return (
    <section className="relative py-16 bg-gradient-to-br from-background via-background/95 to-secondary/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Disc className="h-8 w-8 text-primary animate-spin" style={{ animationDuration: '8s' }} />
            <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Wheel of Destiny
            </h2>
            <Badge variant="secondary" className="bg-primary/10 text-primary font-semibold">
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
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg bg-background ${feature.color}`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg">{feature.title}</h4>
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
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/10 border-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                <Star className="h-6 w-6 text-primary" />
                How to Play
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold">Spin the Wheel</h4>
                    <p className="text-sm text-muted-foreground">Spin to earn points (200-1000) or risk BANKRUPT/LOSE TURN</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold">Guess Letters</h4>
                    <p className="text-sm text-muted-foreground">Reveal letters in African-themed words and phrases</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold">Solve the Puzzle</h4>
                    <p className="text-sm text-muted-foreground">Be the first to solve and earn bonus points!</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t">
                <Button 
                  onClick={handleWheelAccess}
                  className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-lg py-6"
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
          <h3 className="text-xl font-semibold mb-6">Featured Categories</h3>
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
                className="px-4 py-2 text-sm hover:bg-primary/10 transition-colors"
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