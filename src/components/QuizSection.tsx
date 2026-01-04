import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Clock, Award, Users, Brain, Target, Star, Sparkles, Gift } from "lucide-react";
import { useNavigate } from "react-router-dom";
import blackAfricaBook from "@/assets/black-africa-book.png";

export const QuizSection = () => {
  const navigate = useNavigate();

  const handleStartQuiz = () => {
    navigate('/quiz-setup');
  };

  return (
    <section className="w-full py-16 bg-background relative overflow-hidden border-y-4 border-border">

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Brain className="text-theme-yellow animate-pulse" size={32} />
            <h2 className="text-5xl md:text-6xl font-bold gradient-text animate-pulse-yellow">
              AFRICAN HISTORY QUIZ
            </h2>
            <Brain className="text-theme-yellow animate-pulse" size={32} />
          </div>
          <div className="text-xl md:text-2xl text-theme-yellow mb-4 font-light tracking-wide">
            IN-DEPTH KNOWLEDGE TESTING
          </div>
          <p className="text-lg md:text-xl text-theme-yellow-light max-w-3xl mx-auto mb-4 font-medium">
            Master African history with our comprehensive quiz system
          </p>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Perfect for serious learners, students, and educators who want to dive deep into African history
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
          {/* Feature Card 1 */}
          <Card className="jeopardy-card hover:scale-105 transition-all duration-300 cursor-pointer group animate-scale-in border-theme-yellow/20">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-primary border-4 border-border w-fit shadow-[4px_4px_0px_0px_hsl(var(--border))]">
                <BookOpen size={40} className="text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl font-bold text-theme-yellow">
                COMPREHENSIVE
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center px-6 pb-6">
              <p className="text-card-foreground mb-6 text-base leading-relaxed">
                Detailed questions covering ancient civilizations, colonial history, and modern African nations
              </p>
              <div className="flex items-center justify-center gap-2 text-theme-yellow-light">
                <Star className="w-4 h-4" />
                <span className="text-sm">500+ Expert Questions</span>
              </div>
            </CardContent>
          </Card>

          {/* Feature Card 2 */}
          <Card className="jeopardy-card hover:scale-105 transition-all duration-300 cursor-pointer group animate-scale-in border-theme-yellow/20" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-accent border-4 border-border w-fit shadow-[4px_4px_0px_0px_hsl(var(--border))]">
                <Target size={40} className="text-accent-foreground" />
              </div>
              <CardTitle className="text-2xl font-bold text-theme-yellow">
                ADAPTIVE LEARNING
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center px-6 pb-6">
              <p className="text-card-foreground mb-6 text-base leading-relaxed">
                Self-paced experience with detailed explanations and historical context for every question
              </p>
              <div className="flex items-center justify-center gap-2 text-theme-yellow-light">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Progress Tracking</span>
              </div>
            </CardContent>
          </Card>

          {/* Feature Card 3 */}
          <Card className="jeopardy-card hover:scale-105 transition-all duration-300 cursor-pointer group animate-scale-in border-theme-yellow/20" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-secondary border-4 border-border w-fit shadow-[4px_4px_0px_0px_hsl(var(--border))]">
                <Award size={40} className="text-secondary-foreground" />
              </div>
              <CardTitle className="text-2xl font-bold text-theme-yellow">
                EXPERT CONTENT
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center px-6 pb-6">
              <p className="text-card-foreground mb-6 text-base leading-relaxed">
                Questions crafted by historians and educators, featuring multiple difficulty levels
              </p>
              <div className="flex items-center justify-center gap-2 text-theme-yellow-light">
                <Users className="w-4 h-4" />
                <span className="text-sm">Educator Approved</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quiz Highlights */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
          <div className="p-6 bg-card border-4 border-border shadow-[4px_4px_0px_0px_hsl(var(--border))]">
            <h3 className="text-2xl font-bold text-theme-yellow mb-4 flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              Quiz Highlights
            </h3>
            <ul className="space-y-3 text-card-foreground">
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-theme-yellow rounded-full" />
                <span>Ancient African kingdoms and empires</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-theme-yellow-light rounded-full" />
                <span>Colonial period and resistance movements</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-theme-yellow-dark rounded-full" />
                <span>Independence struggles and leaders</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-theme-yellow rounded-full" />
                <span>Modern African politics and culture</span>
              </li>
            </ul>
          </div>

          <div className="p-6 bg-muted border-4 border-border shadow-[4px_4px_0px_0px_hsl(var(--border))]">
            <h3 className="text-2xl font-bold text-theme-yellow mb-4 flex items-center gap-2">
              <Brain className="w-6 h-6" />
              Learning Features
            </h3>
            <ul className="space-y-3 text-card-foreground">
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-theme-yellow-light rounded-full" />
                <span>Instant feedback with explanations</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-theme-yellow rounded-full" />
                <span>Historical context for each question</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-theme-yellow-dark rounded-full" />
                <span>Difficulty progression system</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-theme-yellow-light rounded-full" />
                <span>Personal progress analytics</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Book Reward Section */}
        <div className="mb-12">
          <div className="grid md:grid-cols-2 gap-8 items-center max-w-5xl mx-auto p-6 bg-card border-4 border-border shadow-[4px_4px_0px_0px_hsl(var(--border))]">
            <div className="order-2 md:order-1">
              <h3 className="text-3xl font-bold text-theme-yellow mb-4 flex items-center gap-2">
                <Gift className="w-8 h-8" />
                FREE BOOK REWARD
              </h3>
              <h4 className="text-xl font-semibold text-theme-yellow-light mb-3">
                Black Africa - An Illustrated History
              </h4>
              <p className="text-card-foreground mb-4 text-lg">
                Earn <span className="text-theme-yellow font-bold">100 orbs</span> through gameplay and receive your free digital copy of this comprehensive historical text!
              </p>
              <div className="flex items-center gap-2 text-theme-yellow-light">
                <Star className="w-5 h-5" />
                <span className="text-sm">Complete quizzes, participate in forums, and engage with the community to collect orbs</span>
              </div>
            </div>
            <div className="order-1 md:order-2 flex justify-center">
              <img 
                src={blackAfricaBook} 
                alt="Black Africa - An Illustrated History book cover"
                className="max-w-full h-auto max-h-64 object-contain rounded-lg shadow-lg hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="p-8 bg-primary border-4 border-border max-w-2xl mx-auto shadow-[4px_4px_0px_0px_hsl(var(--border))]">
            <Button 
              onClick={handleStartQuiz}
              size="lg"
              className="px-12 py-6 text-xl font-bold jeopardy-gold hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl border-0"
            >
              <BookOpen className="w-7 h-7 mr-3" />
              BEGIN AFRICAN HISTORY QUIZ
            </Button>
            <p className="text-sm text-theme-yellow-light mt-4">
              Join thousands of learners exploring African history
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Create an account to save progress and unlock advanced analytics
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};