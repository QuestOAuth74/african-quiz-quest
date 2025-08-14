import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, CheckCircle, XCircle } from "lucide-react";

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: {
    id: string;
    text: string;
    answer: string;
    points: number;
    category: string;
  } | null;
  onAnswer: (isCorrect: boolean) => void;
  timeLimit?: number;
}

export function QuestionModal({ 
  isOpen, 
  onClose, 
  question, 
  onAnswer, 
  timeLimit = 30 
}: QuestionModalProps) {
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [showAnswer, setShowAnswer] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);

  useEffect(() => {
    if (!isOpen || !question) return;
    
    setTimeLeft(timeLimit);
    setShowAnswer(false);
    setHasAnswered(false);
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setShowAnswer(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, question, timeLimit]);

  const handleAnswer = (isCorrect: boolean) => {
    setHasAnswered(true);
    setShowAnswer(true);
    onAnswer(isCorrect);
  };

  const handleClose = () => {
    setShowAnswer(false);
    setHasAnswered(false);
    onClose();
  };

  if (!question) return null;

  const timeProgress = (timeLeft / timeLimit) * 100;
  const isTimeRunningOut = timeLeft <= 10;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl jeopardy-card border-jeopardy-gold/30">
        <DialogHeader className="text-center pb-6">
          <DialogTitle className="font-orbitron font-black text-2xl md:text-3xl text-jeopardy-gold">
            {question.category.toUpperCase()}
          </DialogTitle>
          <div className="font-orbitron font-bold text-xl text-jeopardy-gold-light">
            ${question.points.toLocaleString()}
          </div>
        </DialogHeader>
        
        <div className="space-y-8">
          {/* Timer */}
          <div className="space-y-3">
            <div className="w-full bg-jeopardy-blue-dark rounded-full h-3 border border-jeopardy-gold/30">
              <div 
                className={`h-3 rounded-full transition-all duration-1000 ${
                  isTimeRunningOut 
                    ? 'bg-gradient-to-r from-red-500 to-red-600 animate-pulse' 
                    : 'bg-gradient-to-r from-jeopardy-gold to-jeopardy-gold-light'
                }`}
                style={{ width: `${timeProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-center gap-2">
              <Clock size={16} className={isTimeRunningOut ? 'text-red-400 animate-pulse' : 'text-jeopardy-gold'} />
              <span className={`font-orbitron font-bold ${isTimeRunningOut ? 'text-red-400 animate-pulse' : 'text-jeopardy-gold'}`}>
                {timeLeft}s
              </span>
            </div>
          </div>

          {/* Question */}
          <Card className="jeopardy-card border-jeopardy-blue-light/50 animate-scale-in">
            <CardContent className="p-8">
              <p className="text-xl md:text-2xl text-center font-exo font-medium leading-relaxed text-card-foreground">
                {question.text}
              </p>
            </CardContent>
          </Card>

          {/* Answer Section */}
          {!showAnswer && !hasAnswered && timeLeft > 0 && (
            <div className="flex gap-6 justify-center animate-fade-in">
              <Button 
                onClick={() => handleAnswer(true)} 
                className="px-8 py-4 jeopardy-gold font-orbitron font-bold text-lg hover:scale-105 transition-all duration-300"
                size="lg"
              >
                <CheckCircle className="mr-2" size={20} />
                I KNOW THIS!
              </Button>
              <Button 
                onClick={() => handleAnswer(false)} 
                variant="outline"
                className="px-8 py-4 jeopardy-button font-orbitron font-bold text-lg hover:scale-105 transition-all duration-300 border-jeopardy-gold/50 text-jeopardy-gold hover:text-jeopardy-gold-light"
                size="lg"
              >
                <XCircle className="mr-2" size={20} />
                PASS
              </Button>
            </div>
          )}

          {/* Show Answer */}
          {showAnswer && (
            <Card className="jeopardy-gold border-none animate-fade-in">
              <CardContent className="p-8">
                <div className="text-center">
                  <p className="text-sm font-orbitron font-bold text-jeopardy-blue-dark mb-4 uppercase tracking-wider">
                    Correct Answer:
                  </p>
                  <p className="text-2xl md:text-3xl font-exo font-bold text-jeopardy-blue-dark">
                    {question.answer}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Close Button */}
          {showAnswer && (
            <div className="text-center animate-fade-in">
              <Button 
                onClick={handleClose}
                className="px-8 py-4 jeopardy-button font-orbitron font-bold text-lg hover:scale-105 transition-all duration-300"
                size="lg"
              >
                CONTINUE GAME
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}