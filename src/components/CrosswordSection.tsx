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
    <section className="w-full py-16 bg-muted relative overflow-hidden border-y-4 border-border">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Grid3X3 className="text-primary" size={32} />
            <h2 className="text-5xl md:text-6xl font-bold text-primary">
              AFRICAN HISTORY CROSSWORDS
            </h2>
            <Puzzle className="text-primary" size={32} />
          </div>
          <div className="text-xl md:text-2xl text-primary mb-4 font-light tracking-wide">
            WORD PUZZLE CHALLENGE
          </div>
          <p className="text-lg md:text-xl text-foreground max-w-3xl mx-auto mb-4 font-medium">
            Test your knowledge with thoughtfully crafted crossword puzzles
          </p>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Perfect for puzzle enthusiasts who want to explore African history in an engaging format
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
          {/* Feature Card 1 */}
          <Card className="neo-card hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-200 cursor-pointer">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-primary border-4 border-border w-fit shadow-[4px_4px_0px_0px_hsl(var(--border))]">
                <Puzzle size={40} className="text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl font-bold text-primary">
                INTERACTIVE PUZZLES
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center px-6 pb-6">
              <p className="text-card-foreground mb-6 text-base leading-relaxed">
                Engaging crossword puzzles spanning ancient civilizations to modern African achievements
              </p>
              <div className="flex items-center justify-center gap-2 text-primary">
                <Star className="w-4 h-4" />
                <span className="text-sm font-semibold">Multiple Difficulty Levels</span>
              </div>
            </CardContent>
          </Card>

          {/* Feature Card 2 */}
          <Card className="neo-card hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-200 cursor-pointer">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-secondary border-4 border-border w-fit shadow-[4px_4px_0px_0px_hsl(var(--border))]">
                <Brain size={40} className="text-secondary-foreground" />
              </div>
              <CardTitle className="text-2xl font-bold text-primary">
                EDUCATIONAL FUN
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center px-6 pb-6">
              <p className="text-card-foreground mb-6 text-base leading-relaxed">
                Learn while you play with hints, clues, and historical context for each puzzle
              </p>
              <div className="flex items-center justify-center gap-2 text-primary">
                <Lightbulb className="w-4 h-4" />
                <span className="text-sm font-semibold">Smart Hint System</span>
              </div>
            </CardContent>
          </Card>

          {/* Feature Card 3 */}
          <Card className="neo-card hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-200 cursor-pointer">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-accent border-4 border-border w-fit shadow-[4px_4px_0px_0px_hsl(var(--border))]">
                <Trophy size={40} className="text-accent-foreground" />
              </div>
              <CardTitle className="text-2xl font-bold text-primary">
                TRACK PROGRESS
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center px-6 pb-6">
              <p className="text-card-foreground mb-6 text-base leading-relaxed">
                Monitor your solving time, completion rate, and unlock achievements as you progress
              </p>
              <div className="flex items-center justify-center gap-2 text-primary">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-semibold">Performance Analytics</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Crossword Features */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
          <div className="p-6 bg-card border-4 border-border shadow-[4px_4px_0px_0px_hsl(var(--border))]">
            <h3 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              Puzzle Categories
            </h3>
            <ul className="space-y-3 text-card-foreground">
              <li className="flex items-center gap-3">
                <div className="w-3 h-3 bg-primary" />
                <span>Ancient African kingdoms and civilizations</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-3 h-3 bg-secondary" />
                <span>Historical figures and leaders</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-3 h-3 bg-accent" />
                <span>Cultural traditions and heritage</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-3 h-3 bg-primary" />
                <span>Geography and landmarks</span>
              </li>
            </ul>
          </div>

          <div className="p-6 bg-card border-4 border-border shadow-[4px_4px_0px_0px_hsl(var(--border))]">
            <h3 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
              <Grid3X3 className="w-6 h-6" />
              Game Features
            </h3>
            <ul className="space-y-3 text-card-foreground">
              <li className="flex items-center gap-3">
                <div className="w-3 h-3 bg-secondary" />
                <span>Auto-save progress functionality</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-3 h-3 bg-primary" />
                <span>Cross-device synchronization</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-3 h-3 bg-accent" />
                <span>Responsive design for all devices</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-3 h-3 bg-secondary" />
                <span>Comprehensive statistics tracking</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Visual Preview Section */}
        <div className="mb-12">
          <div className="grid md:grid-cols-2 gap-8 items-center max-w-5xl mx-auto p-6 bg-card border-4 border-border shadow-[4px_4px_0px_0px_hsl(var(--border))]">
            <div className="order-2 md:order-1">
              <h3 className="text-3xl font-bold text-primary mb-4 flex items-center gap-2">
                <Target className="w-8 h-8" />
                CHALLENGE YOURSELF
              </h3>
              <h4 className="text-xl font-semibold text-foreground mb-3">
                From Beginner to Expert
              </h4>
              <p className="text-card-foreground mb-4 text-lg">
                Start with easy puzzles and progress to challenging crosswords that will test even the most knowledgeable history enthusiasts.
              </p>
              <div className="flex items-center gap-2 text-primary">
                <Star className="w-5 h-5" />
                <span className="text-sm font-semibold">Progressive difficulty system with personalized recommendations</span>
              </div>
            </div>
            <div className="order-1 md:order-2 flex justify-center">
              <div className="relative">
                <img 
                  src={baobabHeaderImage} 
                  alt="African History Crosswords"
                  className="max-w-full h-auto max-h-64 object-cover border-4 border-border shadow-[4px_4px_0px_0px_hsl(var(--border))]"
                />
                <div className="absolute inset-0 bg-background/80 border-4 border-border flex items-center justify-center">
                  <div className="bg-card p-4 border-4 border-border shadow-[4px_4px_0px_0px_hsl(var(--border))]">
                    <div className="grid grid-cols-5 gap-1">
                      {Array.from({ length: 25 }, (_, i) => (
                        <div
                          key={i}
                          className={`w-6 h-6 border-2 border-border flex items-center justify-center text-xs font-bold ${
                            [0, 1, 2, 5, 6, 7, 10, 11, 12].includes(i)
                              ? 'bg-primary/20 text-primary'
                              : 'bg-background'
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
          <div className="p-8 bg-primary border-4 border-border max-w-2xl mx-auto shadow-[4px_4px_0px_0px_hsl(var(--border))]">
            <Button 
              onClick={handleStartCrossword}
              size="lg"
              className="neo-button px-12 py-6 text-xl font-bold bg-background text-foreground hover:bg-muted border-4 border-border"
            >
              <Grid3X3 className="w-7 h-7 mr-3" />
              START CROSSWORD PUZZLES
            </Button>
            <p className="text-sm text-primary-foreground mt-4 font-medium">
              Join the community of crossword enthusiasts
            </p>
            <p className="text-xs text-primary-foreground/80 mt-2">
              Sign in to save your progress and compete with others
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};