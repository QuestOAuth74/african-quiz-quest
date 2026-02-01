import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, CheckCircle, XCircle, Target, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import confetti from "canvas-confetti";

interface QuestionResult {
  questionId: string;
  correct: boolean;
  selectedOption: string;
}

interface Question {
  id: string;
  text: string;
  explanation: string | null;
  historical_context: string | null;
  points: number;
  category_id: string;
}

interface Category {
  id: string;
  name: string;
}

interface QuizCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNewQuiz: () => void;
  onBackToHome: () => void;
  finalScore: number;
  totalPossiblePoints: number;
  questionsAnswered: number;
  questionsCorrect: number;
  answeredQuestions: QuestionResult[];
  questions: Question[];
  categories: Category[];
}

export function QuizCompletionModal({ 
  isOpen, 
  onClose, 
  onNewQuiz,
  onBackToHome,
  finalScore,
  totalPossiblePoints,
  questionsAnswered,
  questionsCorrect,
  answeredQuestions,
  questions,
  categories
}: QuizCompletionModalProps) {
  
  // Trigger confetti animation when modal opens
  useEffect(() => {
    if (isOpen) {
      triggerConfetti();
    }
  }, [isOpen]);

  const triggerConfetti = () => {
    // Initial burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Additional bursts with delay
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
    }, 250);

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });
    }, 400);

    // Final burst from the top
    setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.3 }
      });
    }, 600);
  };

  const percentage = Math.round((questionsCorrect / questionsAnswered) * 100);
  const scorePercentage = Math.round((finalScore / totalPossiblePoints) * 100);

  const getPerformanceMessage = () => {
    if (percentage >= 90) return "Outstanding! You're a true scholar!";
    if (percentage >= 80) return "Excellent work! Very impressive!";
    if (percentage >= 70) return "Great job! Well done!";
    if (percentage >= 60) return "Good effort! Keep learning!";
    return "Keep studying! Every step counts!";
  };

  const getPerformanceIcon = () => {
    if (percentage >= 90) return <Trophy className="h-8 w-8 text-yellow-400" />;
    if (percentage >= 80) return <Award className="h-8 w-8 text-yellow-500" />;
    if (percentage >= 70) return <Target className="h-8 w-8 text-green-400" />;
    return <CheckCircle className="h-8 w-8 text-blue-400" />;
  };

  const getCategoriesPlayed = () => {
    const categoryIds = [...new Set(questions.map(q => q.category_id))];
    return categoryIds.map(id => categories.find(c => c.id === id)?.name || 'Unknown').filter(Boolean);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-primary border-accent/20 text-accent/80 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-accent text-center flex items-center justify-center gap-2">
            {getPerformanceIcon()}
            Quiz Complete!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Performance Summary */}
          <div className="text-center space-y-3">
            <p className="text-lg font-semibold text-accent">
              {getPerformanceMessage()}
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-primary/50 p-4 rounded-lg border border-accent/20">
                <div className="text-2xl font-bold text-accent">{questionsCorrect}/{questionsAnswered}</div>
                <div className="text-sm text-accent/80">Questions Correct</div>
                <div className="text-lg font-semibold text-accent">{percentage}%</div>
              </div>
              
              <div className="bg-primary/50 p-4 rounded-lg border border-accent/20">
                <div className="text-2xl font-bold text-accent">{finalScore}</div>
                <div className="text-sm text-accent/80">Total Points</div>
                <div className="text-lg font-semibold text-accent">{scorePercentage}%</div>
              </div>
            </div>
          </div>

          {/* Categories Played */}
          <div className="space-y-2">
            <h4 className="font-semibold text-accent">Categories Covered:</h4>
            <div className="flex flex-wrap gap-2">
              {getCategoriesPlayed().map((category, index) => (
                <Badge key={index} variant="secondary" className="bg-accent/20 text-accent border-accent/30">
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          {/* Question Results Summary */}
          <div className="space-y-3">
            <h4 className="font-semibold text-accent">Question Results:</h4>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {questions.map((question, index) => {
                const result = answeredQuestions.find(aq => aq.questionId === question.id);
                const isCorrect = result?.correct || false;
                
                return (
                  <div key={question.id} className="bg-primary/30 p-3 rounded border border-accent/10">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="text-sm text-accent/80 mb-1">
                          Question {index + 1}: {question.text.substring(0, 80)}
                          {question.text.length > 80 ? '...' : ''}
                        </div>
                        <div className="flex items-center gap-2">
                          {isCorrect ? (
                            <CheckCircle className="h-4 w-4 text-green-400" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-400" />
                          )}
                          <span className={`text-sm font-medium ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                            {isCorrect ? 'Correct' : 'Incorrect'}
                          </span>
                          <Badge variant="outline" className="border-accent/30 text-accent/80 text-xs">
                            {question.points} pts
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={onNewQuiz}
              className="flex-1 bg-accent text-primary hover:bg-accent/90"
            >
              Take Another Quiz
            </Button>
            <Button 
              onClick={onBackToHome}
              variant="outline"
              className="flex-1 border-accent/30 text-accent hover:bg-accent/10"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default QuizCompletionModal;