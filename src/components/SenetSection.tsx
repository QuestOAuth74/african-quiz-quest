import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Crown, Users, Bot, Gamepad2, Star } from "lucide-react";

export const SenetSection = () => {
  const navigate = useNavigate();

  return (
    <section className="w-full py-16 bg-muted relative overflow-hidden border-y-4 border-border">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="text-4xl text-primary">𓋹</div>
            <h2 className="text-5xl md:text-6xl font-bold text-primary">
              ANCIENT SENET
            </h2>
            <div className="text-4xl text-primary">𓋹</div>
          </div>
          <div className="text-xl md:text-2xl text-primary mb-4 font-light tracking-wide">
            PHARAOH'S SACRED GAME
          </div>
          <p className="text-lg md:text-xl text-foreground max-w-3xl mx-auto mb-4 font-medium">
            Journey through the underworld in this ancient Egyptian board game
          </p>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Navigate the path to eternal life using strategy, luck, and divine favor
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
          {/* Single Player vs AI */}
          <Card className="neo-card hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-200 cursor-pointer">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-primary border-4 border-border w-fit shadow-[4px_4px_0px_0px_hsl(var(--border))]">
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
                className="neo-button w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
              >
                <Gamepad2 className="h-4 w-4 mr-2" />
                Play vs AI
              </Button>
              <div className="flex items-center justify-center gap-2 text-primary mt-3">
                <Star className="w-4 h-4" />
                <span className="text-sm font-semibold">Learn Ancient Rules</span>
              </div>
            </CardContent>
          </Card>

          {/* Local Multiplayer */}
          <Card className="neo-card hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-200 cursor-pointer">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-secondary border-4 border-border w-fit shadow-[4px_4px_0px_0px_hsl(var(--border))]">
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
                className="neo-button w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold"
              >
                <Users className="h-4 w-4 mr-2" />
                Local Match
              </Button>
              <div className="flex items-center justify-center gap-2 text-primary mt-3">
                <Crown className="w-4 h-4" />
                <span className="text-sm font-semibold">Pass & Play</span>
              </div>
            </CardContent>
          </Card>

          {/* Online Multiplayer */}
          <Card className="neo-card hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-200 cursor-pointer md:col-span-3 lg:col-span-1">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-accent border-4 border-border w-fit shadow-[4px_4px_0px_0px_hsl(var(--border))]">
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
                className="neo-button w-full bg-accent text-accent-foreground hover:bg-accent/90 font-bold"
              >
                <Crown className="h-4 w-4 mr-2" />
                Join Arena
              </Button>
              <div className="flex items-center justify-center gap-2 text-primary mt-3">
                <Users className="w-4 h-4" />
                <span className="text-sm font-semibold">Global Competition</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="p-8 bg-card border-4 border-border max-w-2xl mx-auto shadow-[4px_4px_0px_0px_hsl(var(--border))]">
            <p className="text-primary text-lg font-bold mb-2">
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