import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, CheckCircle, XCircle, SkipForward } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: {
    id: string;
    text: string;
    options: string[];
    correctAnswerIndex: number;
    points: number;
    category: string;
    explanation: string;
    historicalContext: string;
    imageUrl?: string;
  } | null;
  onAnswer: (selectedAnswerIndex: number | 'pass' | 'timeout') => void;
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
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!isOpen || !question) return;
    
    setTimeLeft(timeLimit);
    setShowAnswer(false);
    setHasAnswered(false);
    setSelectedAnswerIndex(null);
    
    // Start countdown music
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Silently handle autoplay restrictions
      });
    }
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (!hasAnswered) {
            setShowAnswer(true);
            setHasAnswered(true);
            onAnswer('timeout');
          }
          // Stop music when time runs out
          if (audioRef.current) {
            audioRef.current.pause();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, question, timeLimit]);

  const handleAnswer = (answerIndex: number) => {
    setSelectedAnswerIndex(answerIndex);
    setHasAnswered(true);
    setShowAnswer(true);
    // Stop music when answer is selected
    if (audioRef.current) {
      audioRef.current.pause();
    }
    onAnswer(answerIndex);
  };

  const handlePass = () => {
    setHasAnswered(true);
    setShowAnswer(true);
    // Stop music when passing
    if (audioRef.current) {
      audioRef.current.pause();
    }
    onAnswer('pass');
  };

  const handleClose = () => {
    setShowAnswer(false);
    setHasAnswered(false);
    setSelectedAnswerIndex(null);
    onClose();
  };

  if (!question) return null;

  const timeProgress = (timeLeft / timeLimit) * 100;
  const isTimeRunningOut = timeLeft <= 10;

  return (
    <>
      {/* Hidden audio element for Jeopardy thinking music */}
      <audio
        ref={audioRef}
        loop
        preload="auto"
      >
        <source src="https://www.myinstants.com/media/sounds/jeopardy-thinking-music.mp3" type="audio/mpeg" />
        {/* Fallback URL */}
        <source src="https://audio.jukehost.co.uk/XrOb5vQ8DLh5s9BnBaA2E8uMllonK0vj" type="audio/mpeg" />
      </audio>
      
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] jeopardy-card border-theme-yellow/30 overflow-hidden flex flex-col">
          <DialogHeader className="text-center pb-6 flex-shrink-0">
            <DialogTitle className="font-orbitron font-black text-2xl md:text-3xl text-theme-yellow">
              {question.category.toUpperCase()}
            </DialogTitle>
            <div className="font-orbitron font-bold text-xl text-theme-yellow-light">
              ${question.points.toLocaleString()}
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="space-y-8 pr-4">
                {/* Timer */}
                <div className="space-y-3">
                  <div className="w-full bg-theme-brown-dark rounded-full h-3 border border-theme-yellow/30">
                    <div 
                      className={`h-3 rounded-full transition-all duration-1000 ${
                        isTimeRunningOut 
                          ? 'bg-gradient-to-r from-red-500 to-red-600 animate-pulse' 
                          : 'bg-gradient-to-r from-theme-yellow to-theme-yellow-light'
                      }`}
                      style={{ width: `${timeProgress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Clock size={16} className={isTimeRunningOut ? 'text-red-400 animate-pulse' : 'text-theme-yellow'} />
                    <span className={`font-orbitron font-bold ${isTimeRunningOut ? 'text-red-400 animate-pulse' : 'text-theme-yellow'}`}>
                      {timeLeft}s
                    </span>
                  </div>
                </div>

                {/* Question */}
                <Card className="jeopardy-card border-theme-brown-light/50 animate-scale-in">
                  <CardContent className="p-6">
                    {question.imageUrl && (
                      <div className="mb-6 flex justify-center">
                        <img 
                          src={question.imageUrl} 
                          alt="Question illustration" 
                          className="rounded-lg max-w-full h-48 object-cover border-2 border-theme-yellow/30"
                        />
                      </div>
                    )}
                    <p className="text-lg md:text-xl text-center font-exo font-medium leading-relaxed text-card-foreground">
                      {question.text}
                    </p>
                  </CardContent>
                </Card>

                {/* Answer Options */}
                {!showAnswer && !hasAnswered && timeLeft > 0 && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {question.options.map((option, index) => (
                        <Button
                          key={index}
                          onClick={() => handleAnswer(index)}
                          variant="outline"
                          className="p-6 h-auto text-left jeopardy-button font-exo text-base hover:scale-105 transition-all duration-300 border-theme-yellow/50 text-theme-yellow hover:text-theme-yellow-light"
                        >
                          <span className="font-orbitron font-bold mr-3 text-theme-yellow-light">
                            {String.fromCharCode(65 + index)}.
                          </span>
                          {option}
                        </Button>
                      ))}
                    </div>
                    <div className="flex justify-center">
                      <Button
                        onClick={handlePass}
                        variant="outline"
                        className="px-8 py-4 jeopardy-button font-orbitron font-bold text-lg hover:scale-105 transition-all duration-300 border-orange-500/50 text-orange-400 hover:text-orange-300"
                        size="lg"
                      >
                        <SkipForward className="mr-2" size={20} />
                        PASS
                      </Button>
                    </div>
                  </div>
                )}

                {/* Show Results and Explanation */}
                {showAnswer && (
                  <div className="space-y-6 animate-fade-in">
                    {/* Results */}
                    <Card className={`border-none ${
                      selectedAnswerIndex === question.correctAnswerIndex 
                        ? 'jeopardy-gold' 
                        : selectedAnswerIndex === null 
                          ? 'bg-orange-900/20 border-orange-500/50'
                          : 'bg-red-900/20 border-red-500/50'
                    }`}>
                      <CardContent className="p-6">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-3 mb-4">
                            {selectedAnswerIndex === question.correctAnswerIndex ? (
                              <CheckCircle className="text-green-800" size={24} />
                            ) : selectedAnswerIndex === null ? (
                              <SkipForward className="text-orange-600" size={24} />
                            ) : (
                              <XCircle className="text-red-600" size={24} />
                            )}
                            <p className={`text-lg font-orbitron font-bold uppercase tracking-wider ${
                              selectedAnswerIndex === question.correctAnswerIndex 
                                ? 'text-green-800' 
                                : selectedAnswerIndex === null 
                                  ? 'text-orange-100' 
                                  : 'text-red-100'
                            }`}>
                              {selectedAnswerIndex === question.correctAnswerIndex 
                                ? 'Correct!' 
                                : selectedAnswerIndex === null 
                                  ? 'Passed' 
                                  : 'Incorrect'}
                            </p>
                          </div>
                          {selectedAnswerIndex !== null && typeof selectedAnswerIndex === 'number' && (
                            <p className={`text-base mb-3 ${
                              selectedAnswerIndex === question.correctAnswerIndex 
                                ? 'text-green-800' 
                                : 'text-red-100'
                            }`}>
                              You selected: <strong>{question.options[selectedAnswerIndex]}</strong>
                            </p>
                          )}
                          <p className={`text-lg font-exo font-bold ${
                            selectedAnswerIndex === question.correctAnswerIndex 
                              ? 'text-green-800' 
                              : 'text-white'
                          }`}>
                            Correct Answer: {question.options[question.correctAnswerIndex]}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Explanation */}
                    <Card className="jeopardy-card border-theme-brown-light/50">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-orbitron font-bold text-theme-yellow mb-4 uppercase tracking-wider">
                          Explanation
                        </h3>
                        <p className="text-base font-exo leading-relaxed text-card-foreground mb-4">
                          {question.explanation}
                        </p>
                        <div className="pt-4 border-t border-theme-yellow/30">
                          <h4 className="text-base font-orbitron font-bold text-theme-yellow-light mb-3 uppercase tracking-wider">
                            Historical Context
                          </h4>
                          <p className="text-sm font-exo leading-relaxed text-card-foreground/90">
                            {question.historicalContext}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Close Button */}
                    <div className="text-center">
                      <Button 
                        onClick={handleClose}
                        className="px-8 py-4 jeopardy-button font-orbitron font-bold text-lg hover:scale-105 transition-all duration-300"
                        size="lg"
                      >
                        CONTINUE GAME
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}