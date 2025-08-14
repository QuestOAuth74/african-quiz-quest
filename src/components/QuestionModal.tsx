import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {question.category} - ${question.points}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Timer */}
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-1000"
              style={{ width: `${timeProgress}%` }}
            />
          </div>
          <div className="text-center text-sm text-muted-foreground">
            Time remaining: {timeLeft}s
          </div>

          {/* Question */}
          <Card>
            <CardContent className="p-6">
              <p className="text-lg text-center font-medium">{question.text}</p>
            </CardContent>
          </Card>

          {/* Answer Section */}
          {!showAnswer && !hasAnswered && timeLeft > 0 && (
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={() => handleAnswer(true)} 
                className="px-8"
                variant="default"
              >
                I Know This!
              </Button>
              <Button 
                onClick={() => handleAnswer(false)} 
                variant="outline"
                className="px-8"
              >
                Pass
              </Button>
            </div>
          )}

          {/* Show Answer */}
          {showAnswer && (
            <Card className="bg-primary/5 border-primary">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Answer:</p>
                  <p className="text-lg font-semibold text-primary">{question.answer}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Close Button */}
          {showAnswer && (
            <div className="text-center">
              <Button onClick={handleClose}>Continue Game</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}