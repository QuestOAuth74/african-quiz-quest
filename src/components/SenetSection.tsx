import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Crown, Users, Bot, Gamepad2 } from "lucide-react";

export const SenetSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-12 bg-gradient-to-br from-amber-50/50 to-yellow-50/50 dark:from-amber-900/10 dark:to-yellow-900/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="text-4xl animate-pulse text-amber-600 dark:text-amber-400">𓋹</div>
            <h2 className="text-3xl font-bold text-amber-900 dark:text-amber-100">Ancient Senet</h2>
            <div className="text-4xl animate-pulse text-amber-600 dark:text-amber-400">𓋹</div>
          </div>
          <p className="text-lg text-amber-700 dark:text-amber-200 max-w-2xl mx-auto">
            Journey through the underworld in this sacred game of ancient Egypt. Navigate the path to eternal life using strategy, luck, and divine favor.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Single Player vs AI */}
          <Card className="border-2 border-amber-200/50 dark:border-amber-700/50 hover:border-amber-300 dark:hover:border-amber-600 transition-colors shadow-lg">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-amber-900 dark:text-amber-100">Practice Mode</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-amber-700 dark:text-amber-200 text-sm text-center">
                Master the ancient rules against an intelligent AI opponent
              </p>
              <Button 
                onClick={() => navigate('/senet')}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Gamepad2 className="h-4 w-4 mr-2" />
                Play vs AI
              </Button>
            </CardContent>
          </Card>

          {/* Local Multiplayer */}
          <Card className="border-2 border-amber-200/50 dark:border-amber-700/50 hover:border-amber-300 dark:hover:border-amber-600 transition-colors shadow-lg">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-full flex items-center justify-center">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-amber-900 dark:text-amber-100">Local Play</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-amber-700 dark:text-amber-200 text-sm text-center">
                Challenge friends on the same device in this timeless strategy game
              </p>
              <Button 
                onClick={() => navigate('/senet')}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                <Users className="h-4 w-4 mr-2" />
                Local Match
              </Button>
            </CardContent>
          </Card>

          {/* Online Multiplayer */}
          <Card className="border-2 border-amber-200/50 dark:border-amber-700/50 hover:border-amber-300 dark:hover:border-amber-600 transition-colors shadow-lg md:col-span-2 lg:col-span-1">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-amber-900 dark:text-amber-100">Online Arena</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-amber-700 dark:text-amber-200 text-sm text-center">
                Face players worldwide in real-time ancient Egyptian battles
              </p>
              <Button 
                onClick={() => navigate('/senet')}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Crown className="h-4 w-4 mr-2" />
                Join Arena
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-amber-600 dark:text-amber-300 text-sm">
            Experience the game that guided pharaohs through the afterlife
          </p>
        </div>
      </div>
    </section>
  );
};