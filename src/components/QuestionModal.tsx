import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, SkipForward } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useGameAudio } from "@/hooks/useGameAudio";

interface Question {
  id: string;
  text: string;
  options?: Array<{
    id: string;
    text: string;
    option_type: 'correct' | 'incorrect';
  }>;
  correctAnswerIndex?: number;
  points: number;
  category: string;
  explanation?: string;
  historicalContext?: string;
  imageUrl?: string;
}

interface QuestionModalProps {
  question: Question | null;
  isOpen: boolean;
  onClose: () => void;
  onAnswer: (selectedAnswerIndex: number | 'pass' | 'timeout' | 'skip') => void;
  currentPlayer?: string;
  gameMode?: 'single' | 'multiplayer';
  timeLimit?: number;
}

const QuestionModal = ({ 
  question, 
  isOpen, 
  onClose, 
  onAnswer, 
  currentPlayer, 
  gameMode,
  timeLimit = 30 
}: QuestionModalProps) => {
  const soundEffects = useSoundEffects();
  const gameAudio = useGameAudio();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [showTeacherMode, setShowTeacherMode] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && question) {
      setSelectedOption(null);
      setTimeLeft(timeLimit);
      setShowTeacherMode(false);
      setShowAnswer(false);
      setHasAnswered(false);
      setSelectedAnswerIndex(null);
    }
  }, [isOpen, question, timeLimit]);

  useEffect(() => {
    if (showTeacherMode) {
      return; // Don't run timer in teacher mode
    }

    if (!isOpen || !question || hasAnswered) return;
    
    // Start countdown music
    gameAudio.playCountdown();
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (!hasAnswered) {
            setShowAnswer(true);
            setHasAnswered(true);
            onAnswer('timeout');
          }
          // Stop countdown music when time runs out
          gameAudio.stopCountdown();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, question, timeLimit, hasAnswered, showTeacherMode]);

  const handleOptionSelect = (optionId: string) => {
    soundEffects.playButtonClick();
    setSelectedOption(optionId);
  };

  const handleSkip = () => {
    soundEffects.playButtonClick();
    setHasAnswered(true);
    gameAudio.stopCountdown();
    onAnswer('skip');
  };

  const handleSubmit = () => {
    if (selectedOption !== null) {
      // Find the index of the selected option in the options array
      const answerIndex = question.options?.findIndex(opt => opt.id === selectedOption) ?? -1;
      setSelectedAnswerIndex(answerIndex);
      setHasAnswered(true);
      setShowAnswer(true);
      gameAudio.stopCountdown();
      
      // Play correct/wrong answer sound
      const selectedOptionObj = question.options?.find(opt => opt.id === selectedOption);
      
      if (selectedOptionObj?.option_type === 'correct') {
        gameAudio.playCorrectAnswer();
      } else {
        gameAudio.playWrongAnswer();
      }
      
      onAnswer(answerIndex);
    }
  };

  const handlePass = () => {
    setHasAnswered(true);
    setShowAnswer(true);
    gameAudio.stopCountdown();
    onAnswer('pass');
  };

  const handleTeacherModeClose = () => {
    setShowTeacherMode(false);
    onClose();
  };

  const showTeacherModeView = () => {
    setShowTeacherMode(true);
  };

  const handleClose = () => {
    setShowAnswer(false);
    setHasAnswered(false);
    setSelectedAnswerIndex(null);
    onClose();
  };

  if (!question) return null;

  // Teacher Mode View
  if (showTeacherMode) {
    const correctOption = question.options?.find(opt => opt.option_type === 'correct');
    
    return (
      <Dialog open={isOpen} onOpenChange={handleTeacherModeClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] jeopardy-card">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl gradient-text">
              🎓 Teacher Mode - Answer Revealed
            </DialogTitle>
            <DialogDescription className="text-center text-lg text-muted-foreground">
              Both players skipped this question. Here&apos;s the correct answer for learning!
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[70vh] pr-4">
            <div className="space-y-6">
              {/* Question Display */}
              <Card className="jeopardy-card border-theme-yellow/30">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant="secondary" className="bg-accent text-accent-foreground">
                      {question.category}
                    </Badge>
                    <Badge variant="outline" className="jeopardy-gold text-lg px-3 py-1">
                      {question.points} points
                    </Badge>
                  </div>
                  
                  <h3 className="text-xl md:text-2xl font-semibold mb-4 text-accent">
                    {question.text}
                  </h3>
                  
                  {question.imageUrl && (
                    <div className="mb-4">
                      <img 
                        src={question.imageUrl} 
                        alt="Question image" 
                        className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Correct Answer Highlight */}
              <Card className="jeopardy-card border-green-500/50 bg-green-500/5">
                <CardContent className="pt-6">
                  <h4 className="text-lg font-semibold text-green-400 mb-3 flex items-center gap-2">
                    ✅ Correct Answer
                  </h4>
                  <p className="text-xl font-medium text-green-300">
                    {correctOption?.text}
                  </p>
                </CardContent>
              </Card>

              {/* All Options */}
              <Card className="jeopardy-card">
                <CardContent className="pt-6">
                  <h4 className="text-lg font-semibold text-accent mb-4">All Answer Options:</h4>
                  <div className="space-y-3">
                    {question.options?.map((option, index) => (
                      <div
                        key={`teacher-option-${option.id}`}
                        className={`p-3 rounded-lg border ${
                          option.option_type === 'correct'
                            ? "bg-green-100 border-green-300 text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-300"
                            : "bg-muted border-border"
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">
                            {String.fromCharCode(65 + index)}.
                          </span>
                          <span>{option.text}</span>
                          {option.option_type === 'correct' && (
                            <Badge variant="default" className="ml-auto bg-green-600">
                              Correct
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Explanation and Context */}
              {(question.explanation || question.historicalContext) && (
                <div className="space-y-4">
                  {question.explanation && (
                    <Card className="jeopardy-card">
                      <CardContent className="pt-6">
                        <h4 className="font-semibold text-accent mb-2 flex items-center gap-2">
                          📖 Explanation
                        </h4>
                        <p className="text-muted-foreground leading-relaxed">{question.explanation}</p>
                      </CardContent>
                    </Card>
                  )}
                  
                  {question.historicalContext && (
                    <Card className="jeopardy-card">
                      <CardContent className="pt-6">
                        <h4 className="font-semibold text-accent mb-2 flex items-center gap-2">
                          🏛️ Historical Context
                        </h4>
                        <p className="text-muted-foreground leading-relaxed">{question.historicalContext}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              <div className="flex justify-center pt-4">
                <Button 
                  onClick={handleTeacherModeClose}
                  className="jeopardy-button px-8 py-3"
                  size="lg"
                >
                  Continue Game
                </Button>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  }

  // Regular Game Mode View
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
        <DialogContent className="max-w-4xl max-h-[85vh] jeopardy-card border-theme-yellow/30">
          <DialogHeader className="text-center pb-4 flex-shrink-0">
            <DialogTitle className="font-orbitron font-black text-2xl md:text-3xl text-theme-yellow">
              {question.category.toUpperCase()}
            </DialogTitle>
            <div className="font-orbitron font-bold text-xl text-theme-yellow-light">
              ${question.points.toLocaleString()}
            </div>
            {currentPlayer && (
              <div className="text-sm text-muted-foreground">
                Current Player: <span className="text-theme-yellow font-medium">{currentPlayer}</span>
              </div>
            )}
          </DialogHeader>
          
          <ScrollArea className="flex-1 max-h-[70vh]">
            <div className="space-y-6 pr-4">
              {/* Timer */}
              {!showAnswer && !hasAnswered && (
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
              )}

              {/* Question */}
              <Card className="jeopardy-card border-theme-brown-light/50 animate-scale-in">
                <CardContent className="p-4">
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
                  <div className="space-y-3">
                    {question.options?.map((option, index) => (
                      <Button
                        key={`game-option-${option.id}`}
                        onClick={() => handleOptionSelect(option.id)}
                        variant={selectedOption === option.id ? "default" : "outline"}
                        className={`w-full p-4 h-auto text-left justify-start transition-all duration-300 ${
                          selectedOption === option.id 
                            ? "jeopardy-gold border-theme-yellow" 
                            : "jeopardy-button border-theme-yellow/50 hover:border-theme-yellow"
                        }`}
                      >
                        <span className="font-orbitron font-bold mr-3 text-theme-yellow-light">
                          {String.fromCharCode(65 + index)}.
                        </span>
                        <span className="flex-1">{option.text}</span>
                      </Button>
                    ))}
                  </div>
                  
                  <div className="flex gap-3 justify-center mt-6">
                    <Button
                      onClick={handleSkip}
                      variant="outline"
                      className="jeopardy-button border-orange-500/50 text-orange-400 hover:text-orange-300"
                    >
                      <SkipForward className="mr-2" size={16} />
                      Skip
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={!selectedOption}
                      className="jeopardy-button px-8"
                    >
                      Submit Answer
                    </Button>
                  </div>
                </div>
              )}

              {/* Show Results and Explanation */}
              {showAnswer && (
                <div className="space-y-4 animate-fade-in">
                  {/* Results */}
                  <Card className={`border-none ${
                    selectedAnswerIndex === question.correctAnswerIndex 
                      ? 'jeopardy-gold' 
                      : selectedAnswerIndex === null 
                        ? 'bg-orange-900/20 border-orange-500/50'
                        : 'bg-red-900/20 border-red-500/50'
                  }`}>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-3">
                          {selectedAnswerIndex === question.correctAnswerIndex ? (
                            <CheckCircle className="text-green-800" size={24} />
                          ) : selectedAnswerIndex === null ? (
                            <SkipForward className="text-orange-600" size={24} />
                          ) : (
                            <XCircle className="text-red-600" size={24} />
                          )}
                          <p className={`text-base font-orbitron font-bold uppercase tracking-wider ${
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
                        {selectedAnswerIndex !== null && typeof selectedAnswerIndex === 'number' && question.options && (
                          <p className={`text-sm mb-2 ${
                            selectedAnswerIndex === question.correctAnswerIndex 
                              ? 'text-green-800' 
                              : 'text-red-100'
                          }`}>
                            You selected: <strong>{question.options[selectedAnswerIndex]?.text}</strong>
                          </p>
                        )}
                        <p className={`text-base font-exo font-bold ${
                          selectedAnswerIndex === question.correctAnswerIndex 
                            ? 'text-green-800' 
                            : 'text-white'
                        }`}>
                          Correct Answer: {question.options?.find(opt => opt.option_type === 'correct')?.text}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Explanation */}
                  {(question.explanation || question.historicalContext) && (
                    <Card className="jeopardy-card border-theme-brown-light/50">
                      <CardContent className="p-6">
                        {question.explanation && (
                          <>
                            <h3 className="text-base font-orbitron font-bold text-theme-yellow mb-3 uppercase tracking-wider">
                              Explanation
                            </h3>
                            <p className="text-sm font-exo leading-relaxed text-card-foreground mb-3">
                              {question.explanation}
                            </p>
                          </>
                        )}
                        {question.historicalContext && (
                          <>
                            <div className="pt-3 border-t border-theme-yellow/30">
                              <h4 className="text-sm font-orbitron font-bold text-theme-yellow-light mb-2 uppercase tracking-wider">
                                Historical Context
                              </h4>
                              <p className="text-sm font-exo leading-relaxed text-card-foreground/90">
                                {question.historicalContext}
                              </p>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Close Button */}
                  <div className="text-center pt-2">
                    <Button 
                      onClick={handleClose}
                      className="px-6 py-3 jeopardy-button font-orbitron font-bold text-base hover:scale-105 transition-all duration-300"
                    >
                      CONTINUE GAME
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QuestionModal;