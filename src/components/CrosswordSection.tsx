import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Grid3X3, Puzzle, Brain, Target, Star, Sparkles, Clock, Trophy, Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";
import baobabHeaderImage from '@/assets/baobab-talks-header.png';

export const CrosswordSection = () => {
  const navigate = useNavigate();

  const handleStartCrossword = () => {
    navigate('/crossword');
  };

  return (
    <section className="w-full py-16 bg-gradient-to-br from-primary/10 via-background to-secondary/10 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-accent/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Grid3X3 className="text-primary animate-pulse" size={32} />
            <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent animate-pulse">
              AFRICAN HISTORY CROSSWORDS
            </h2>
            <Puzzle className="text-primary animate-pulse" size={32} />
          </div>
          <div className="text-xl md:text-2xl text-primary mb-4 font-light tracking-wide">
            WORD PUZZLE CHALLENGE
          </div>
          <p className="text-lg md:text-xl text-primary/80 max-w-3xl mx-auto mb-4 font-medium">
            Test your knowledge with thoughtfully crafted crossword puzzles
          </p>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Perfect for puzzle enthusiasts who want to explore African history in an engaging format
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
          {/* Feature Card 1 */}
          <Card className="hover:scale-105 transition-all duration-300 cursor-pointer group animate-scale-in border-primary/20 bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-primary to-secondary rounded-xl w-fit shadow-lg">
                <Puzzle size={40} className="text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-primary">
                INTERACTIVE PUZZLES
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center px-6 pb-6">
              <p className="text-card-foreground mb-6 text-base leading-relaxed">
                Engaging crossword puzzles spanning ancient civilizations to modern African achievements
              </p>
              <div className="flex items-center justify-center gap-2 text-primary/80">
                <Star className="w-4 h-4" />
                <span className="text-sm">Multiple Difficulty Levels</span>
              </div>
            </CardContent>
          </Card>

          {/* Feature Card 2 */}
          <Card className="hover:scale-105 transition-all duration-300 cursor-pointer group animate-scale-in border-primary/20 bg-card/50 backdrop-blur-sm" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-secondary to-accent rounded-xl w-fit shadow-lg">
                <Brain size={40} className="text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-primary">
                EDUCATIONAL FUN
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center px-6 pb-6">
              <p className="text-card-foreground mb-6 text-base leading-relaxed">
                Learn while you play with hints, clues, and historical context for each puzzle
              </p>
              <div className="flex items-center justify-center gap-2 text-primary/80">
                <Lightbulb className="w-4 h-4" />
                <span className="text-sm">Smart Hint System</span>
              </div>
            </CardContent>
          </Card>

          {/* Feature Card 3 */}
          <Card className="hover:scale-105 transition-all duration-300 cursor-pointer group animate-scale-in border-primary/20 bg-card/50 backdrop-blur-sm" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-accent to-primary rounded-xl w-fit shadow-lg">
                <Trophy size={40} className="text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-primary">
                TRACK PROGRESS
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center px-6 pb-6">
              <p className="text-card-foreground mb-6 text-base leading-relaxed">
                Monitor your solving time, completion rate, and unlock achievements as you progress
              </p>
              <div className="flex items-center justify-center gap-2 text-primary/80">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Performance Analytics</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Crossword Features */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
          <div className="p-6 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl border border-primary/30 backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              Puzzle Categories
            </h3>
            <ul className="space-y-3 text-card-foreground">
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span>Ancient African kingdoms and civilizations</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-secondary rounded-full" />
                <span>Historical figures and leaders</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-accent rounded-full" />
                <span>Cultural traditions and heritage</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span>Geography and landmarks</span>
              </li>
            </ul>
          </div>

          <div className="p-6 bg-gradient-to-br from-secondary/20 to-accent/20 rounded-xl border border-primary/30 backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
              <Grid3X3 className="w-6 h-6" />
              Game Features
            </h3>
            <ul className="space-y-3 text-card-foreground">
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-secondary rounded-full" />
                <span>Auto-save progress functionality</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span>Cross-device synchronization</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-accent rounded-full" />
                <span>Responsive design for all devices</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-secondary rounded-full" />
                <span>Comprehensive statistics tracking</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Visual Preview Section */}
        <div className="mb-12">
          <div className="grid md:grid-cols-2 gap-8 items-center max-w-5xl mx-auto p-6 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-2xl border border-primary/30 backdrop-blur-sm">
            <div className="order-2 md:order-1">
              <h3 className="text-3xl font-bold text-primary mb-4 flex items-center gap-2">
                <Target className="w-8 h-8" />
                CHALLENGE YOURSELF
              </h3>
              <h4 className="text-xl font-semibold text-primary/80 mb-3">
                From Beginner to Expert
              </h4>
              <p className="text-card-foreground mb-4 text-lg">
                Start with easy puzzles and progress to challenging crosswords that will test even the most knowledgeable history enthusiasts.
              </p>
              <div className="flex items-center gap-2 text-primary/80">
                <Star className="w-5 h-5" />
                <span className="text-sm">Progressive difficulty system with personalized recommendations</span>
              </div>
            </div>
            <div className="order-1 md:order-2 flex justify-center">
              <div className="relative">
                <img 
                  src={baobabHeaderImage} 
                  alt="African History Crosswords"
                  className="max-w-full h-auto max-h-64 object-cover rounded-lg shadow-lg hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent rounded-lg flex items-center justify-center">
                  <div className="bg-white/90 p-4 rounded-lg shadow-lg">
                    <div className="grid grid-cols-5 gap-1">
                      {Array.from({ length: 25 }, (_, i) => (
                        <div
                          key={i}
                          className={`w-6 h-6 border border-gray-300 flex items-center justify-center text-xs font-bold ${
                            [0, 1, 2, 5, 6, 7, 10, 11, 12].includes(i)
                              ? 'bg-primary/20 text-primary'
                              : 'bg-white'
                          }`}
                        >
                          {[0, 1, 2, 5, 6, 7, 10, 11, 12].includes(i) && 
                            ['A', 'F', 'R', 'I', 'C', 'A', 'H', 'I', 'S'][i % 9]
                          }
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="p-8 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-2xl border border-primary/30 backdrop-blur-sm max-w-2xl mx-auto shadow-[0_0_30px_rgba(59,130,246,0.3)]">
            <Button 
              onClick={handleStartCrossword}
              size="lg"
              className="px-12 py-6 text-xl font-bold bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl border-0"
            >
              <Grid3X3 className="w-7 h-7 mr-3" />
              START CROSSWORD PUZZLES
            </Button>
            <p className="text-sm text-primary/80 mt-4">
              Join the community of crossword enthusiasts
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Sign in to save your progress and compete with others
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};