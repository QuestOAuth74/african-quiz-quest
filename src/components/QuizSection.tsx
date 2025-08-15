import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Clock, Award, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const QuizSection = () => {
  const navigate = useNavigate();

  const handleStartQuiz = () => {
    navigate('/quiz-setup');
  };

  return (
    <section className="w-full py-16 bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            African History Quiz
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Test your knowledge with our comprehensive African history quiz. Perfect for students, educators, and history enthusiasts.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Quiz Overview Card */}
          <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="w-8 h-8 text-primary" />
                <CardTitle className="text-2xl">In-Depth Learning</CardTitle>
              </div>
              <CardDescription className="text-base">
                Explore comprehensive questions covering ancient civilizations, colonial history, independence movements, and modern African nations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <span>Self-paced learning experience</span>
                </div>
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-primary" />
                  <span>Detailed explanations for each answer</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-primary" />
                  <span>Multiple difficulty levels</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quiz Features Card */}
          <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
            <CardHeader>
              <CardTitle className="text-2xl">Quiz Features</CardTitle>
              <CardDescription className="text-base">
                Designed for serious learners who want to master African history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-primary/10 rounded-lg">
                  <h4 className="font-semibold mb-2">Historical Context</h4>
                  <p className="text-sm text-muted-foreground">
                    Each question includes rich historical background and significance
                  </p>
                </div>
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Progress Tracking</h4>
                  <p className="text-sm text-muted-foreground">
                    Monitor your learning journey and identify areas for improvement
                  </p>
                </div>
                <div className="p-4 bg-accent/20 rounded-lg">
                  <h4 className="font-semibold mb-2">Curated Content</h4>
                  <p className="text-sm text-muted-foreground">
                    Questions crafted by history experts and educators
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12">
          <Button 
            onClick={handleStartQuiz}
            size="lg"
            className="px-8 py-6 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <BookOpen className="w-6 h-6 mr-2" />
            Start African History Quiz
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Create an account to track your progress and unlock advanced features
          </p>
        </div>
      </div>
    </section>
  );
};