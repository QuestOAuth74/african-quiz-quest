import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Crown, Users, Bot, Gamepad2, Star } from "lucide-react";

export const SenetSection = () => {
  const navigate = useNavigate();

  return (
    <section className="w-full py-16 bg-gradient-to-br from-background via-background/95 to-secondary/20 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-secondary/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="text-4xl animate-pulse text-primary">𓋹</div>
            <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              ANCIENT SENET
            </h2>
            <div className="text-4xl animate-pulse text-primary">𓋹</div>
          </div>
          <div className="text-xl md:text-2xl text-primary mb-4 font-light tracking-wide">
            PHARAOH'S SACRED GAME
          </div>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-4 font-medium">
            Journey through the underworld in this ancient Egyptian board game
          </p>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Navigate the path to eternal life using strategy, luck, and divine favor
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
          {/* Single Player vs AI */}
          <Card className="jeopardy-card hover:scale-105 transition-all duration-300 cursor-pointer group animate-scale-in border-primary/20">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-primary to-primary/80 rounded-xl w-fit shadow-lg">
                <Bot className="h-8 w-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl font-bold text-primary">
                PRACTICE MODE
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center px-6 pb-6">
              <p className="text-card-foreground mb-6 text-base leading-relaxed">
                Master the ancient rules against an intelligent AI opponent
              </p>
              <Button 
                onClick={() => navigate('/senet')}
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                <Gamepad2 className="h-4 w-4 mr-2" />
                Play vs AI
              </Button>
              <div className="flex items-center justify-center gap-2 text-primary/70 mt-3">
                <Star className="w-4 h-4" />
                <span className="text-sm">Learn Ancient Rules</span>
              </div>
            </CardContent>
          </Card>

          {/* Local Multiplayer */}
          <Card className="jeopardy-card hover:scale-105 transition-all duration-300 cursor-pointer group animate-scale-in border-primary/20" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-secondary to-secondary/80 rounded-xl w-fit shadow-lg">
                <Crown className="h-8 w-8 text-secondary-foreground" />
              </div>
              <CardTitle className="text-2xl font-bold text-primary">
                LOCAL PLAY
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center px-6 pb-6">
              <p className="text-card-foreground mb-6 text-base leading-relaxed">
                Challenge friends on the same device in this timeless strategy game
              </p>
              <Button 
                onClick={() => navigate('/senet')}
                className="w-full bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70"
              >
                <Users className="h-4 w-4 mr-2" />
                Local Match
              </Button>
              <div className="flex items-center justify-center gap-2 text-primary/70 mt-3">
                <Crown className="w-4 h-4" />
                <span className="text-sm">Pass & Play</span>
              </div>
            </CardContent>
          </Card>

          {/* Online Multiplayer */}
          <Card className="jeopardy-card hover:scale-105 transition-all duration-300 cursor-pointer group animate-scale-in border-primary/20 md:col-span-3 lg:col-span-1" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-accent to-accent/80 rounded-xl w-fit shadow-lg">
                <Users className="h-8 w-8 text-accent-foreground" />
              </div>
              <CardTitle className="text-2xl font-bold text-primary">
                ONLINE ARENA
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center px-6 pb-6">
              <p className="text-card-foreground mb-6 text-base leading-relaxed">
                Face players worldwide in real-time ancient Egyptian battles
              </p>
              <Button 
                onClick={() => navigate('/senet')}
                className="w-full bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70"
              >
                <Crown className="h-4 w-4 mr-2" />
                Join Arena
              </Button>
              <div className="flex items-center justify-center gap-2 text-primary/70 mt-3">
                <Users className="w-4 h-4" />
                <span className="text-sm">Global Competition</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="p-8 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-2xl border border-primary/30 backdrop-blur-sm max-w-2xl mx-auto shadow-[0_0_30px_rgba(var(--primary),0.3)] jeopardy-card">
            <p className="text-primary text-lg font-medium mb-2">
              Experience the game that guided pharaohs through the afterlife
            </p>
            <p className="text-sm text-muted-foreground">
              Master ancient Egyptian strategy and compete with players worldwide
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};