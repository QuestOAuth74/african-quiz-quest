import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Clock, Award, Users, Brain, Target, Star, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const QuizSection = () => {
  const navigate = useNavigate();

  const handleStartQuiz = () => {
    navigate('/quiz-setup');
  };

  return (
    <section className="w-full py-16 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Brain className="text-purple-400 animate-pulse" size={32} />
            <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent animate-pulse-yellow">
              AFRICAN HISTORY QUIZ
            </h2>
            <Brain className="text-blue-400 animate-pulse" size={32} />
          </div>
          <div className="text-xl md:text-2xl text-purple-300 mb-4 font-light tracking-wide">
            IN-DEPTH KNOWLEDGE TESTING
          </div>
          <p className="text-lg md:text-xl text-purple-200 max-w-3xl mx-auto mb-4 font-medium">
            Master African history with our comprehensive quiz system
          </p>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Perfect for serious learners, students, and educators who want to dive deep into African history
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
          {/* Feature Card 1 */}
          <Card className="jeopardy-card hover:scale-105 transition-all duration-300 cursor-pointer group animate-scale-in border-purple-400/20 bg-gradient-to-br from-purple-900/40 to-indigo-900/40">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl w-fit shadow-lg">
                <BookOpen size={40} className="text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-purple-300">
                COMPREHENSIVE
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center px-6 pb-6">
              <p className="text-card-foreground mb-6 text-base leading-relaxed">
                Detailed questions covering ancient civilizations, colonial history, and modern African nations
              </p>
              <div className="flex items-center justify-center gap-2 text-purple-400">
                <Star className="w-4 h-4" />
                <span className="text-sm">500+ Expert Questions</span>
              </div>
            </CardContent>
          </Card>

          {/* Feature Card 2 */}
          <Card className="jeopardy-card hover:scale-105 transition-all duration-300 cursor-pointer group animate-scale-in border-blue-400/20 bg-gradient-to-br from-blue-900/40 to-cyan-900/40" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl w-fit shadow-lg">
                <Target size={40} className="text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-blue-300">
                ADAPTIVE LEARNING
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center px-6 pb-6">
              <p className="text-card-foreground mb-6 text-base leading-relaxed">
                Self-paced experience with detailed explanations and historical context for every question
              </p>
              <div className="flex items-center justify-center gap-2 text-blue-400">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Progress Tracking</span>
              </div>
            </CardContent>
          </Card>

          {/* Feature Card 3 */}
          <Card className="jeopardy-card hover:scale-105 transition-all duration-300 cursor-pointer group animate-scale-in border-indigo-400/20 bg-gradient-to-br from-indigo-900/40 to-purple-900/40" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl w-fit shadow-lg">
                <Award size={40} className="text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-indigo-300">
                EXPERT CONTENT
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center px-6 pb-6">
              <p className="text-card-foreground mb-6 text-base leading-relaxed">
                Questions crafted by historians and educators, featuring multiple difficulty levels
              </p>
              <div className="flex items-center justify-center gap-2 text-indigo-400">
                <Users className="w-4 h-4" />
                <span className="text-sm">Educator Approved</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quiz Highlights */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
          <div className="p-6 bg-gradient-to-br from-purple-600/20 to-purple-800/20 rounded-xl border border-purple-400/30 backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-purple-300 mb-4 flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              Quiz Highlights
            </h3>
            <ul className="space-y-3 text-card-foreground">
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full" />
                <span>Ancient African kingdoms and empires</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full" />
                <span>Colonial period and resistance movements</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-indigo-400 rounded-full" />
                <span>Independence struggles and leaders</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full" />
                <span>Modern African politics and culture</span>
              </li>
            </ul>
          </div>

          <div className="p-6 bg-gradient-to-br from-blue-600/20 to-indigo-800/20 rounded-xl border border-blue-400/30 backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-blue-300 mb-4 flex items-center gap-2">
              <Brain className="w-6 h-6" />
              Learning Features
            </h3>
            <ul className="space-y-3 text-card-foreground">
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full" />
                <span>Instant feedback with explanations</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-indigo-400 rounded-full" />
                <span>Historical context for each question</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full" />
                <span>Difficulty progression system</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full" />
                <span>Personal progress analytics</span>
              </li>
            </ul>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="p-8 bg-gradient-to-r from-purple-900/60 via-blue-900/60 to-indigo-900/60 rounded-2xl border border-purple-400/30 backdrop-blur-sm max-w-2xl mx-auto shadow-[0_0_30px_rgba(147,51,234,0.3)]">
            <Button 
              onClick={handleStartQuiz}
              size="lg"
              className="px-12 py-6 text-xl font-bold bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 hover:from-purple-600 hover:via-blue-600 hover:to-indigo-600 text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 border-0"
            >
              <BookOpen className="w-7 h-7 mr-3" />
              BEGIN AFRICAN HISTORY QUIZ
            </Button>
            <p className="text-sm text-purple-200 mt-4">
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