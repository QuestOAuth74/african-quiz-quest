import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, XCircle, Info } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import TopNavigation from "@/components/TopNavigation";

interface Question {
  id: string;
  text: string;
  explanation: string | null;
  historical_context: string | null;
  points: number;
  image_url: string | null;
  category_id: string;
}

interface QuestionOption {
  id: string;
  text: string;
  option_type: string;
}

interface Category {
  id: string;
  name: string;
}

const Quiz = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [options, setOptions] = useState<QuestionOption[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [answeredQuestions, setAnsweredQuestions] = useState<{
    questionId: string;
    correct: boolean;
    selectedOption: string;
  }[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      loadQuizData();
    }
  }, [user]);

  const loadQuizData = async () => {
    try {
      setIsLoadingQuestions(true);
      
      // Load categories first
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*');

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      // Load questions without random() since it's not supported in Supabase PostgREST
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .limit(50); // Get more questions to shuffle client-side

      if (questionsError) {
        console.error('Questions error:', questionsError);
        throw questionsError;
      }
      
      if (questionsData && questionsData.length > 0) {
        // Shuffle questions client-side and take first 10
        const shuffledQuestions = [...questionsData].sort(() => Math.random() - 0.5).slice(0, 10);
        setQuestions(shuffledQuestions);
        loadOptionsForQuestion(shuffledQuestions[0].id);
      } else {
        toast({
          title: "No Questions Available",
          description: "There are no questions available for the quiz.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error loading quiz data:', error);
      toast({
        title: "Error",
        description: "Failed to load quiz questions. Please make sure you're logged in.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const loadOptionsForQuestion = async (questionId: string) => {
    try {
      const { data: optionsData, error } = await supabase
        .from('question_options')
        .select('*')
        .eq('question_id', questionId);

      if (error) throw error;
      setOptions(optionsData || []);
    } catch (error) {
      console.error('Error loading options:', error);
    }
  };

  const handleAnswerSelect = (optionId: string) => {
    if (showResult) return;
    setSelectedAnswer(optionId);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return;

    const selectedOption = options.find(opt => opt.id === selectedAnswer);
    const isCorrect = selectedOption?.option_type === 'correct';
    
    setShowResult(true);
    
    if (isCorrect) {
      setScore(prev => prev + questions[currentQuestionIndex].points);
    }

    // Track answered question
    setAnsweredQuestions(prev => [...prev, {
      questionId: questions[currentQuestionIndex].id,
      correct: isCorrect,
      selectedOption: selectedAnswer
    }]);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      loadOptionsForQuestion(questions[currentQuestionIndex + 1].id);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    if (!user) return;

    try {
      // Save quiz results
      const { error } = await supabase
        .from('user_games')
        .insert({
          user_id: user.id,
          game_mode: 'quiz',
          final_score: score,
          questions_answered: questions.length,
          questions_correct: answeredQuestions.filter(q => q.correct).length,
          categories_played: [...new Set(questions.map(q => 
            categories.find(c => c.id === q.category_id)?.name || 'Unknown'
          ))],
          game_duration_seconds: null
        });

      if (error) throw error;

      toast({
        title: "Quiz Complete!",
        description: `You scored ${score} points out of ${questions.reduce((sum, q) => sum + q.points, 0)} possible points.`,
      });

      // Reset quiz
      setCurrentQuestionIndex(0);
      setScore(0);
      setAnsweredQuestions([]);
      setSelectedAnswer(null);
      setShowResult(false);
      loadQuizData();
    } catch (error) {
      console.error('Error saving quiz results:', error);
      toast({
        title: "Error",
        description: "Failed to save quiz results.",
        variant: "destructive",
      });
    }
  };

  const getCurrentCategory = () => {
    const question = questions[currentQuestionIndex];
    if (!question) return null;
    return categories.find(c => c.id === question.category_id);
  };

  if (loading || isLoadingQuestions) {
    return (
      <div className="min-h-screen bg-theme-brown-dark">
        <TopNavigation />
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <div className="text-theme-yellow-light text-xl">Loading quiz...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-theme-brown-dark">
        <TopNavigation />
        <div className="pt-20 container mx-auto px-4 py-8">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="mb-6 text-theme-yellow-light hover:text-theme-yellow"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <Card className="bg-theme-brown border-theme-yellow/20">
            <CardContent className="pt-6">
              <div className="text-center text-theme-yellow-light">
                <h2 className="text-xl font-semibold mb-2">No Questions Available</h2>
                <p>Please check back later when questions have been added.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const category = getCurrentCategory();

  return (
    <div className="min-h-screen bg-theme-brown-dark">
      <TopNavigation />
      <div className="pt-20 container mx-auto px-4 py-8 max-w-4xl">
        <Button
          onClick={() => navigate('/')}
          variant="ghost"
          className="mb-6 text-theme-yellow-light hover:text-theme-yellow"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        {/* Quiz Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-theme-yellow">Traditional Quiz</h1>
            <div className="text-theme-yellow-light">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
          </div>
          
          <Progress value={progress} className="h-2 bg-theme-brown/50" />
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-3">
              {category && (
                <Badge variant="secondary" className="bg-theme-yellow/20 text-theme-yellow border-theme-yellow/30">
                  {category.name}
                </Badge>
              )}
              <Badge variant="outline" className="border-theme-yellow/30 text-theme-yellow-light">
                {currentQuestion.points} points
              </Badge>
            </div>
            <div className="text-theme-yellow-light">
              Current Score: <span className="text-theme-yellow font-semibold">{score}</span>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <Card className="bg-theme-brown border-theme-yellow/20 mb-6">
          <CardHeader>
            <CardTitle className="text-theme-yellow text-xl leading-relaxed">
              {currentQuestion.text}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentQuestion.image_url && (
              <div className="mb-6">
                <img
                  src={currentQuestion.image_url}
                  alt="Question illustration"
                  className="w-full max-w-md mx-auto rounded-lg border border-theme-yellow/20"
                />
              </div>
            )}

            {/* Answer Options */}
            <div className="space-y-3">
              {options.map((option, index) => {
                const isSelected = selectedAnswer === option.id;
                const isCorrect = option.option_type === 'correct';
                const showCorrectness = showResult;
                
                let buttonVariant: "default" | "outline" | "secondary" = "outline";
                let className = "w-full text-left p-4 h-auto border-theme-yellow/30 text-theme-yellow-light hover:bg-theme-yellow/10 transition-all duration-200";
                
                if (showCorrectness) {
                  if (isCorrect) {
                    className += " bg-green-500/20 border-green-500 text-green-100 hover:bg-green-500/20";
                  } else if (isSelected && !isCorrect) {
                    className += " bg-red-500/20 border-red-500 text-red-100 hover:bg-red-500/20";
                  }
                } else if (isSelected) {
                  className += " bg-theme-yellow/20 border-theme-yellow text-theme-yellow";
                }

                return (
                  <Button
                    key={option.id}
                    variant={buttonVariant}
                    onClick={() => handleAnswerSelect(option.id)}
                    disabled={showResult}
                    className={className}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="flex items-center gap-3">
                        <span className="font-semibold text-sm bg-theme-brown/50 px-2 py-1 rounded">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span>{option.text}</span>
                      </span>
                      {showResult && isCorrect && (
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      )}
                      {showResult && isSelected && !isCorrect && (
                        <XCircle className="h-5 w-5 text-red-400" />
                      )}
                    </div>
                  </Button>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-between">
              <div>
                {!showResult && selectedAnswer && (
                  <Button 
                    onClick={handleSubmitAnswer}
                    className="bg-theme-yellow text-theme-brown hover:bg-theme-yellow/90"
                  >
                    Submit Answer
                  </Button>
                )}
              </div>
              
              <div>
                {showResult && (
                  <Button 
                    onClick={handleNextQuestion}
                    className="bg-theme-yellow text-theme-brown hover:bg-theme-yellow/90"
                  >
                    {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Explanation Card */}
        {showResult && (currentQuestion.explanation || currentQuestion.historical_context) && (
          <Card className="bg-theme-brown border-theme-yellow/20">
            <CardHeader>
              <CardTitle className="text-theme-yellow flex items-center gap-2">
                <Info className="h-5 w-5" />
                Learn More
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentQuestion.explanation && (
                <div>
                  <h4 className="font-semibold text-theme-yellow-light mb-2">Explanation:</h4>
                  <p className="text-theme-yellow-light/80 leading-relaxed">
                    {currentQuestion.explanation}
                  </p>
                </div>
              )}
              
              {currentQuestion.historical_context && (
                <div>
                  <h4 className="font-semibold text-theme-yellow-light mb-2">Historical Context:</h4>
                  <p className="text-theme-yellow-light/80 leading-relaxed">
                    {currentQuestion.historical_context}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Quiz;