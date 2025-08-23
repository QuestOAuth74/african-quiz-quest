import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Crown, Users, Bot, Gamepad2, Star } from "lucide-react";

export const OwareSection = () => {
  const navigate = useNavigate();

  return (
    <section className="w-full py-16 bg-gradient-to-br from-background via-background/95 to-secondary/20 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="text-4xl animate-pulse text-amber-600">⚫</div>
            <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
              OWARE
            </h2>
            <div className="text-4xl animate-pulse text-amber-600">⚫</div>
          </div>
          <div className="text-xl md:text-2xl text-amber-600 mb-4 font-light tracking-wide">
            AFRICAN CHESS
          </div>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-4 font-medium">
            Master the ancient Akan strategy game of sowing and capturing
          </p>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Experience the wisdom of African ancestors through this timeless board game
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
          {/* Single Player vs AI */}
          <Card className="jeopardy-card hover:scale-105 transition-all duration-300 cursor-pointer group animate-scale-in border-amber-500/20">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-amber-600 to-amber-500 rounded-xl w-fit shadow-lg">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-amber-600">
                PRACTICE MODE
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center px-6 pb-6">
              <p className="text-card-foreground mb-6 text-base leading-relaxed">
                Learn the ancient rules against a strategic AI opponent
              </p>
              <Button 
                onClick={() => navigate('/oware')}
                className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white"
              >
                <Gamepad2 className="h-4 w-4 mr-2" />
                Play vs AI
              </Button>
              <div className="flex items-center justify-center gap-2 text-amber-600/70 mt-3">
                <Star className="w-4 h-4" />
                <span className="text-sm">Master Strategy</span>
              </div>
            </CardContent>
          </Card>

          {/* Local Multiplayer */}
          <Card className="jeopardy-card hover:scale-105 transition-all duration-300 cursor-pointer group animate-scale-in border-orange-500/20" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-orange-600 to-orange-500 rounded-xl w-fit shadow-lg">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-amber-600">
                LOCAL PLAY
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center px-6 pb-6">
              <p className="text-card-foreground mb-6 text-base leading-relaxed">
                Challenge friends in this traditional African strategy game
              </p>
              <Button 
                onClick={() => navigate('/oware')}
                className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white"
              >
                <Users className="h-4 w-4 mr-2" />
                Local Match
              </Button>
              <div className="flex items-center justify-center gap-2 text-amber-600/70 mt-3">
                <Crown className="w-4 h-4" />
                <span className="text-sm">Pass & Play</span>
              </div>
            </CardContent>
          </Card>

          {/* Online Multiplayer */}
          <Card className="jeopardy-card hover:scale-105 transition-all duration-300 cursor-pointer group animate-scale-in border-yellow-500/20 md:col-span-3 lg:col-span-1" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-yellow-600 to-yellow-500 rounded-xl w-fit shadow-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-amber-600">
                ONLINE ARENA
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center px-6 pb-6">
              <p className="text-card-foreground mb-6 text-base leading-relaxed">
                Compete with Oware masters from around the world
              </p>
              <Button 
                onClick={() => navigate('/oware')}
                className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 text-white"
              >
                <Crown className="h-4 w-4 mr-2" />
                Join Arena
              </Button>
              <div className="flex items-center justify-center gap-2 text-amber-600/70 mt-3">
                <Users className="w-4 h-4" />
                <span className="text-sm">Global Competition</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="p-8 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-yellow-500/10 rounded-2xl border border-amber-500/30 backdrop-blur-sm max-w-2xl mx-auto shadow-[0_0_30px_rgba(245,158,11,0.3)] jeopardy-card">
            <p className="text-amber-600 text-lg font-medium mb-2">
              Experience the strategic depth of traditional African gaming
            </p>
            <p className="text-sm text-muted-foreground">
              Master the art of sowing, capturing, and strategic thinking
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};