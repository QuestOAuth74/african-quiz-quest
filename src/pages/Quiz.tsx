import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, XCircle, Info } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import TopNavigation from "@/components/TopNavigation";
import QuizAdminOverlay from "@/components/admin/QuizAdminOverlay";
import { useRealtimeQuestions } from "@/hooks/useRealtimeQuestions";
import QuestionRating from "@/components/QuestionRating";
import MotivationalPopup from "@/components/MotivationalPopup";
import QuizCompletionModal from "@/components/QuizCompletionModal";
import { FullscreenToggle } from "@/components/FullscreenToggle";
import confetti from "canvas-confetti";

interface Question {
  id: string;
  text: string;
  explanation: string | null;
  historical_context: string | null;
  points: number;
  image_url: string | null;
  category_id: string;
  question_options?: QuestionOption[]; // Added for unified data structure
}

interface QuestionOption {
  id: string;
  text: string;
  option_type: string;
  question_id: string;
}

interface Category {
  id: string;
  name: string;
}

type QuestionFilter = 'all' | 'fresh' | 'correct' | 'wrong';

const Quiz = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
  const [showMotivationalPopup, setShowMotivationalPopup] = useState(false);
  const [hasShownMotivation, setHasShownMotivation] = useState(false);
  const [showQuizCompletionModal, setShowQuizCompletionModal] = useState(false);

  // Set page title
  usePageTitle("Quiz", { loading: isLoadingQuestions, loadingTitle: "Loading Quiz" });

  // Get all question IDs for realtime subscription
  const questionIds = questions.map(q => q.id);
  const { getQuestion, getOptions, hasUpdates } = useRealtimeQuestions(questionIds);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      loadQuizData();
    }
  }, [user, searchParams]);

  const loadQuizData = async () => {
    try {
      setIsLoadingQuestions(true);
      
      // Get URL parameters
      const categoriesParam = searchParams.get('categories');
      const countParam = searchParams.get('count');
      const filterParam = searchParams.get('filter') as QuestionFilter || 'all';
      const selectedCategoryIds = categoriesParam ? categoriesParam.split(',') : [];
      const questionCount = countParam ? parseInt(countParam) : 10;
      
      // Load categories first (same logic as Jeopardy)
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      // Build questions query (unified with Jeopardy logic)
      let questionsQuery = supabase
        .from('questions')
        .select(`
          *,
          categories (name),
          question_options (*)
        `)
        .limit(50); // Get more questions to shuffle client-side
      
      // Filter by selected categories if provided (same as Jeopardy)
      if (selectedCategoryIds.length > 0) {
        questionsQuery = questionsQuery.in('category_id', selectedCategoryIds);
      }

      const { data: questionsData, error: questionsError } = await questionsQuery;

      if (questionsError) {
        console.error('Questions error:', questionsError);
        throw questionsError;
      }
      
      if (questionsData && questionsData.length > 0) {
        let filteredQuestions = questionsData;

        // Apply question filtering based on user attempts
        if (filterParam !== 'all') {
          const { data: attempts, error: attemptsError } = await supabase
            .from('user_question_attempts')
            .select('question_id, answered_correctly')
            .eq('user_id', user.id)
            .in('question_id', questionsData.map(q => q.id));

          if (attemptsError) {
            console.error('Error loading user attempts:', attemptsError);
            throw attemptsError;
          }

          const attemptedQuestionIds = new Set(attempts?.map(a => a.question_id) || []);
          const correctQuestionIds = new Set(attempts?.filter(a => a.answered_correctly).map(a => a.question_id) || []);
          const wrongQuestionIds = new Set(attempts?.filter(a => !a.answered_correctly).map(a => a.question_id) || []);

          filteredQuestions = questionsData.filter(question => {
            switch (filterParam) {
              case 'fresh':
                return !attemptedQuestionIds.has(question.id);
              case 'correct':
                return correctQuestionIds.has(question.id);
              case 'wrong':
                return wrongQuestionIds.has(question.id);
              default:
                return true;
            }
          });
        }

        // Shuffle questions client-side and take the requested number
        const shuffledQuestions = [...filteredQuestions].sort(() => Math.random() - 0.5).slice(0, questionCount);
        setQuestions(shuffledQuestions);
        // Load options from the joined data (unified with Jeopardy)
        if (shuffledQuestions[0]?.question_options) {
          setOptions(shuffledQuestions[0].question_options);
        }
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
      // Find the question in current questions data (unified approach)
      const currentQuestion = questions.find(q => q.id === questionId);
      if (currentQuestion?.question_options) {
        setOptions(currentQuestion.question_options);
        return;
      }

      // Fallback to database query if options not in current data
      const { data: optionsData, error: optionsError } = await supabase
        .from('question_options')
        .select('*')
        .eq('question_id', questionId)
        .order('created_at');

      if (optionsError) {
        console.error('Options error:', optionsError);
        toast({
          title: "Failed to load question options",
          description: optionsError.message,
          variant: "destructive",
        });
        return;
      }

      setOptions(optionsData || []);
    } catch (error) {
      console.error('Error loading options:', error);
      toast({
        title: "Error loading options",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  // Force reload current question options when realtime updates occur
  const handleRealtimeUpdate = () => {
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      const currentQuestionId = questions[currentQuestionIndex].id;
      loadOptionsForQuestion(currentQuestionId);
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
    const newAnsweredQuestions = [...answeredQuestions, {
      questionId: questions[currentQuestionIndex].id,
      correct: isCorrect,
      selectedOption: selectedAnswer
    }];
    setAnsweredQuestions(newAnsweredQuestions);

    // Show motivational popup once during the quiz (around halfway point)
    const halfwayPoint = Math.floor(questions.length / 2);
    if (!hasShownMotivation && newAnsweredQuestions.length === halfwayPoint && newAnsweredQuestions.length > 2) {
      setTimeout(() => {
        setShowMotivationalPopup(true);
        setHasShownMotivation(true);
      }, 1500); // Show after a brief delay to let result sink in
    }
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
      const { data, error } = await supabase
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
        })
        .select();

      if (error) {
        console.error('Database error saving quiz results:', error);
        throw error;
      }

      console.log('Quiz results saved successfully:', data);
      
      // Mark that stats should be refreshed on profile page
      localStorage.setItem('refreshProfileStats', 'true');
      
      // Show completion modal
      setShowQuizCompletionModal(true);
    } catch (error) {
      console.error('Error saving quiz results:', error);
      toast({
        title: "Error",
        description: "Failed to save quiz results. Please try again.",
        variant: "destructive",
      });
      // Show completion modal even if save fails
      setShowQuizCompletionModal(true);
    }
  };

  const handleNewQuiz = () => {
    setShowQuizCompletionModal(false);
    // Reset quiz state
    setCurrentQuestionIndex(0);
    setScore(0);
    setAnsweredQuestions([]);
    setSelectedAnswer(null);
    setShowResult(false);
    setHasShownMotivation(false);
    loadQuizData();
  };

  const handleBackToHome = () => {
    setShowQuizCompletionModal(false);
    navigate('/');
  };

  const getCurrentCategory = () => {
    const question = questions[currentQuestionIndex];
    if (!question) return null;
    return categories.find(c => c.id === question.category_id);
  };

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

  // Get current question with potential realtime updates
  const currentQuestion = questions.length > 0 && currentQuestionIndex < questions.length 
    ? getQuestion(questions[currentQuestionIndex].id, questions[currentQuestionIndex])
    : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-theme-brown-dark via-theme-brown to-theme-brown-light flex items-center justify-center">
        <TopNavigation />
        <QuizAdminOverlay 
          currentQuestionId={currentQuestion?.id}
          onQuestionUpdate={handleRealtimeUpdate}
        />
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-yellow mx-auto mb-4"></div>
          <p className="text-theme-yellow font-orbitron">Loading...</p>
        </div>
      </div>
    );
  }

  if (isLoadingQuestions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-theme-brown-dark via-theme-brown to-theme-brown-light flex items-center justify-center">
        <TopNavigation />
        <QuizAdminOverlay 
          currentQuestionId={currentQuestion?.id}
          onQuestionUpdate={handleRealtimeUpdate}
        />
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-yellow mx-auto mb-4"></div>
          <p className="text-theme-yellow font-orbitron">Loading quiz questions...</p>
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

  // Get current options with potential realtime updates  
  const currentOptions = currentQuestion 
    ? getOptions(currentQuestion.id, options)
    : options;
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const category = getCurrentCategory();

  return (
    <div className="min-h-screen bg-gradient-to-br from-theme-brown-dark via-theme-brown to-theme-brown-light">
      <TopNavigation />
      
      <QuizAdminOverlay 
        currentQuestionId={currentQuestion?.id}
        onQuestionUpdate={handleRealtimeUpdate}
      />

      <div className="container mx-auto px-4 py-24 max-w-4xl">
        <Button
          onClick={() => navigate('/quiz-setup')}
          variant="ghost"
          className="mb-6 text-theme-yellow-light hover:text-theme-yellow"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Quiz Setup
        </Button>

        {/* Quiz Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-theme-yellow">Traditional Quiz</h1>
            <div className="flex items-center gap-4">
              <div className="text-theme-yellow-light">
                Question {currentQuestionIndex + 1} of {questions.length}
              </div>
              <FullscreenToggle />
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
                {currentQuestion?.points} points
              </Badge>
              {hasUpdates && (
                <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-800">
                  Updated Live
                </Badge>
              )}
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
              <div className="mb-6 flex justify-center">
                <div className="quiz-image-frame">
                  <div className="quiz-crystal-bottom-left"></div>
                  <div className="quiz-crystal-bottom-right"></div>
                  <img
                    src={currentQuestion.image_url}
                    alt="Question illustration"
                    className="quiz-image-content w-full max-w-md"
                  />
                </div>
              </div>
            )}

            {/* Answer Options */}
            <div className="space-y-3">
              {currentOptions.map((option, index) => {
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

        {/* Question Rating Component */}
        {showResult && (
          <div className="mt-6">
            <Card className="bg-theme-brown border-theme-yellow/20">
              <CardHeader>
                <CardTitle className="text-theme-yellow text-lg">Rate This Question</CardTitle>
              </CardHeader>
              <CardContent>
                <QuestionRating 
                  questionId={currentQuestion.id}
                  showAverage={true}
                  size="md"
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Motivational Popup */}
      <MotivationalPopup 
        isOpen={showMotivationalPopup}
        onClose={() => setShowMotivationalPopup(false)}
      />

      {/* Quiz Completion Modal */}
      <QuizCompletionModal
        isOpen={showQuizCompletionModal}
        onClose={() => setShowQuizCompletionModal(false)}
        onNewQuiz={handleNewQuiz}
        onBackToHome={handleBackToHome}
        finalScore={score}
        totalPossiblePoints={questions.reduce((sum, q) => sum + q.points, 0)}
        questionsAnswered={questions.length}
        questionsCorrect={answeredQuestions.filter(q => q.correct).length}
        answeredQuestions={answeredQuestions}
        questions={questions}
        categories={categories}
      />
    </div>
  );
};

export default Quiz;