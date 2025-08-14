import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GameModeSelector } from "@/components/GameModeSelector";
import GameSetup from "@/components/GameSetup";
import { GameHeader } from "@/components/GameHeader";
import { GameBoard } from "@/components/GameBoard";
import QuestionModal from "@/components/QuestionModal";
import UserAuth from "@/components/UserAuth";
import { AudioControls } from "@/components/AudioControls";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface Question {
  id: string;
  text: string;
  points: number;
  category: string;
  explanation?: string;
  historicalContext?: string;
  imageUrl?: string;
  options?: Array<{
    id: string;
    text: string;
    option_type: 'correct' | 'incorrect';
  }>;
  correctAnswerIndex?: number;
}

const Index = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [gameMode, setGameMode] = useState<'single' | 'multiplayer' | null>(null);
  const [gameConfigured, setGameConfigured] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [showTeacherMode, setShowTeacherMode] = useState(false);
  const [skipCount, setSkipCount] = useState(0);
  const [players, setPlayers] = useState([
    { id: "player1", name: "Player 1", score: 0, isActive: true },
    { id: "computer", name: "Computer", score: 0, isActive: false }
  ]);
  const [categories, setCategories] = useState([]);
  const [gameConfig, setGameConfig] = useState({ categories: [], rowCount: 5 });
  const [questionsData, setQuestionsData] = useState<{[key: string]: Question}>({});
  const [gameStartTime, setGameStartTime] = useState<Date | null>(null);
  const [gameStats, setGameStats] = useState({
    questionsAnswered: 0,
    questionsCorrect: 0
  });
  const { toast } = useToast();

  // Redirect to auth if not authenticated and trying to access admin
  useEffect(() => {
    if (window.location.pathname.includes('/admin') && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  const handleModeSelect = (mode: 'single' | 'multiplayer') => {
    setGameMode(mode);
    setGameConfigured(false);
    if (mode === 'multiplayer') {
      setPlayers([
        { id: "player1", name: "Player 1", score: 0, isActive: true },
        { id: "player2", name: "Player 2", score: 0, isActive: false }
      ]);
    } else {
      setPlayers([
        { id: "player1", name: "Player 1", score: 0, isActive: true },
        { id: "computer", name: "Computer", score: 0, isActive: false }
      ]);
    }
  };

  const handleGameSetup = async (selectedCategories: any[], rowCount: number, questionFilter: 'all' | 'fresh' | 'correct' | 'incorrect') => {
    try {
      // Load questions for selected categories
      await loadQuestionsForCategories(selectedCategories, rowCount, questionFilter);
    } catch (error) {
      console.error('Error setting up game:', error);
      toast({
        title: "Error",
        description: "Failed to load questions. Please try again.",
        variant: "destructive",
      });
    }
  };

  const loadQuestionsForCategories = async (selectedCategories: any[], rowCount: number, questionFilter: 'all' | 'fresh' | 'correct' | 'incorrect') => {
    let questionQuery = supabase
      .from('questions')
      .select(`
        *,
        categories (name),
        question_options (*)
      `)
      .in('category_id', selectedCategories.map(cat => cat.id));

    // Apply question filtering based on user's answer history
    if (isAuthenticated && questionFilter !== 'all') {
      const { data: userAttempts, error: attemptsError } = await supabase
        .from('user_question_attempts')
        .select('question_id, answered_correctly')
        .eq('user_id', user?.id);

      if (attemptsError) {
        console.error('Error loading user attempts:', attemptsError);
        // Continue without filtering if there's an error
      } else {
        const attemptedQuestionIds = userAttempts?.map(attempt => attempt.question_id) || [];
        
        if (questionFilter === 'fresh') {
          // Only questions not attempted before
          if (attemptedQuestionIds.length > 0) {
            questionQuery = questionQuery.not('id', 'in', `(${attemptedQuestionIds.join(',')})`);
          }
        } else if (questionFilter === 'correct') {
          // Only questions answered correctly before
          const correctQuestionIds = userAttempts?.filter(attempt => attempt.answered_correctly)
            .map(attempt => attempt.question_id) || [];
          if (correctQuestionIds.length > 0) {
            questionQuery = questionQuery.in('id', correctQuestionIds);
          } else {
            // No correct answers yet, show empty result
            questionQuery = questionQuery.eq('id', '00000000-0000-0000-0000-000000000000'); // Non-existent ID
          }
        } else if (questionFilter === 'incorrect') {
          // Only questions answered incorrectly before
          const incorrectQuestionIds = userAttempts?.filter(attempt => !attempt.answered_correctly)
            .map(attempt => attempt.question_id) || [];
          if (incorrectQuestionIds.length > 0) {
            questionQuery = questionQuery.in('id', incorrectQuestionIds);
          } else {
            // No incorrect answers yet, show empty result
            questionQuery = questionQuery.eq('id', '00000000-0000-0000-0000-000000000000'); // Non-existent ID
          }
        }
      }
    }

    const { data: questions, error } = await questionQuery;

    if (error) {
      console.error('Error loading questions:', error);
      toast({
        title: "No Questions Available",
        description: "Please add questions to the selected categories first using the admin panel.",
        variant: "destructive",
      });
      return;
    }

    if (!questions || questions.length === 0) {
      let description = "The selected categories don't have any questions yet. Please add questions using the admin panel.";
      
      if (isAuthenticated) {
        switch (questionFilter) {
          case 'fresh':
            description = "You've already attempted all questions in the selected categories. Try selecting 'All Questions' or different categories.";
            break;
          case 'correct':
            description = "You haven't answered any questions correctly in the selected categories yet. Try playing some questions first!";
            break;
          case 'incorrect':
            description = "You haven't answered any questions incorrectly in the selected categories. Great job! Try selecting 'All Questions' for more practice.";
            break;
        }
      }
      
      toast({
        title: "No Questions Found",
        description,
        variant: "destructive",
      });
      return;
    }

    // Group questions by category and organize by points
    const questionsMap: {[key: string]: Question} = {};
    const gameCategories = selectedCategories.map(cat => {
      const categoryQuestions = questions.filter(q => q.category_id === cat.id);
      
      // Sort questions by points and take only the amount needed for rowCount
      const sortedQuestions = categoryQuestions.sort((a, b) => a.points - b.points);
      const questionsForRows = sortedQuestions.slice(0, rowCount);
      
      // Map questions to game format
      questionsForRows.forEach((q, index) => {
        const correctOption = q.question_options.find(opt => opt.option_type === 'correct');
        const correctAnswerIndex = q.question_options.findIndex(opt => opt.option_type === 'correct');
        
        questionsMap[`${cat.id}-${index + 1}`] = {
          id: q.id,
          text: q.text,
          points: q.points,
          category: q.categories.name,
          explanation: q.explanation,
          historicalContext: q.historical_context,
          imageUrl: q.image_url,
          options: q.question_options as Array<{id: string; text: string; option_type: 'correct' | 'incorrect'}>,
          correctAnswerIndex: correctAnswerIndex
        };
      });

      return {
        id: cat.id,
        name: cat.name,
        questions: Array.from({ length: rowCount }, (_, index) => {
          const expectedPoints = (index + 1) * 100;
          const question = questionsForRows.find(q => q.points === expectedPoints);
          return {
            id: `${cat.id}-${index + 1}`,
            points: expectedPoints,
            isAnswered: false,
            hasQuestion: !!question
          };
        })
      };
    });
    
    setQuestionsData(questionsMap);
    setGameConfig({ categories: gameCategories, rowCount });
    setCategories(gameCategories);
    setGameConfigured(true);
    setGameStartTime(new Date());
    setGameStats({ questionsAnswered: 0, questionsCorrect: 0 });
  };

  const handleQuestionSelect = (categoryId: string, questionId: string) => {
    const question = questionsData[questionId];
    if (!question) {
      toast({
        title: "Question Not Available",
        description: "This question is not available. Please select another one.",
        variant: "destructive",
      });
      return;
    }
    setSelectedQuestion(question);
    setIsQuestionModalOpen(true);
    
    // Check if AI is the active player and auto-play after a short delay
    const activePlayer = players.find(p => p.isActive);
    if (activePlayer?.name === "Computer") {
      setTimeout(() => {
        handleAITurn(question);
      }, 2000); // Give 2 seconds to show the question
    }
  };

  const handleAITurn = (question: Question) => {
    const correctAnswerIndex = question.correctAnswerIndex;
    if (typeof correctAnswerIndex === 'number') {
      // AI automatically selects the correct answer
      handleAnswer(correctAnswerIndex);
    }
  };

  const handleAnswer = async (selectedAnswerIndex: number | 'pass' | 'timeout' | 'skip') => {
    let isCorrect = false;
    let pointChange = 0;
    
    if (selectedAnswerIndex === 'skip') {
      const currentPlayer = players.find(p => p.isActive);
      const nextPlayer = players.find(p => !p.isActive);
      
      // Switch to next player
      setPlayers(prev => prev.map(player => ({
        ...player,
        isActive: !player.isActive
      })));
      
      // If next player is computer/AI, automatically pick correct answer after short delay
      if (nextPlayer?.name === "Computer") {
        setIsQuestionModalOpen(false);
        setTimeout(() => {
          // AI picks correct answer
          const correctAnswerIndex = selectedQuestion?.correctAnswerIndex;
          if (typeof correctAnswerIndex === 'number') {
            const aiPointChange = selectedQuestion.points;
            
            // Update AI score
            setPlayers(prev => prev.map(player => 
              player.name === "Computer" 
                ? { ...player, score: player.score + aiPointChange, isActive: true }
                : { ...player, isActive: false }
            ));
            
            // Mark question as answered
            setCategories(prev => prev.map(cat => ({
              ...cat,
              questions: cat.questions.map(q => 
                q.id === selectedQuestion?.id ? { ...q, isAnswered: true } : q
              )
            })));
            
            // Show AI's correct answer briefly, then continue
            setIsQuestionModalOpen(true);
            setTimeout(() => {
              setIsQuestionModalOpen(false);
              setSelectedQuestion(null);
              // Switch back to human player
              setPlayers(prev => prev.map(player => ({
                ...player,
                isActive: player.name !== "Computer"
              })));
            }, 2000);
          }
        }, 1000);
        return;
      } else {
        // For human vs human multiplayer, restart countdown for next player
        setIsQuestionModalOpen(false);
        setTimeout(() => {
          setIsQuestionModalOpen(true);
        }, 100);
        return;
      }
    }
    
    if (typeof selectedAnswerIndex === 'number') {
      isCorrect = selectedAnswerIndex === selectedQuestion?.correctAnswerIndex;
      pointChange = isCorrect ? selectedQuestion.points : -selectedQuestion.points;
      
      // Record the user's answer attempt if authenticated
      if (isAuthenticated && user && selectedQuestion) {
        try {
          await supabase
            .from('user_question_attempts')
            .insert({
              user_id: user.id,
              question_id: selectedQuestion.id,
              answered_correctly: isCorrect
            });
        } catch (error) {
          console.error('Error recording answer attempt:', error);
          // Don't show toast for this error as it's not critical to gameplay
        }

        // Update streak tracking
        try {
          await supabase.rpc('update_user_correct_streak', {
            p_user_id: user.id,
            p_is_correct: isCorrect
          });
        } catch (error) {
          console.error('Error updating streak:', error);
        }
      }

      // Update game stats
      setGameStats(prev => ({
        questionsAnswered: prev.questionsAnswered + 1,
        questionsCorrect: prev.questionsCorrect + (isCorrect ? 1 : 0)
      }));
    }
    // For 'pass' and 'timeout', no points are gained or lost
    
    // Update player score
    setPlayers(prev => prev.map(player => 
      player.isActive 
        ? { ...player, score: Math.max(0, player.score + pointChange) } // Prevent negative scores
        : player
    ));
    
    // Mark question as answered
    setCategories(prev => prev.map(cat => ({
      ...cat,
      questions: cat.questions.map(q => 
        q.id === selectedQuestion?.id ? { ...q, isAnswered: true } : q
      )
    })));

    // Check if game is completed
    const allQuestionsAnswered = categories.every(cat => 
      cat.questions.every(q => q.isAnswered)
    );
    
    if (allQuestionsAnswered) {
      setTimeout(() => {
        handleGameComplete();
      }, 3500); // Wait a bit longer than the player switch delay
    }

    // Switch active player after a delay to allow viewing the explanation
    setTimeout(() => {
      setPlayers(prev => prev.map(player => ({
        ...player,
        isActive: !player.isActive
      })));
      
      // Check if the new active player is AI and there's a selected question
      const newActivePlayers = players.map(player => ({
        ...player,
        isActive: !player.isActive
      }));
      const newActivePlayer = newActivePlayers.find(p => p.isActive);
      
      // If AI becomes active and there's still a question modal open, AI should answer
      if (newActivePlayer?.name === "Computer" && selectedQuestion && isQuestionModalOpen) {
        setTimeout(() => {
          handleAITurn(selectedQuestion);
        }, 1000);
      }
    }, 3000);
  };

  const handleGameComplete = async () => {
    if (!isAuthenticated || !user || !gameStartTime) return;

    const currentPlayer = players.find(p => p.name !== "Computer") || players[0];
    const gameDuration = Math.floor((new Date().getTime() - gameStartTime.getTime()) / 1000);

    try {
      await supabase
        .from('user_games')
        .insert({
          user_id: user.id,
          game_mode: gameMode || 'single',
          final_score: currentPlayer.score,
          questions_answered: gameStats.questionsAnswered,
          questions_correct: gameStats.questionsCorrect,
          categories_played: gameConfig.categories.map(cat => cat.name),
          game_duration_seconds: gameDuration
        });

      toast({
        title: "Game Completed!",
        description: `Final Score: $${currentPlayer.score.toLocaleString()}. Check the leaderboard to see your ranking!`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error recording game completion:', error);
    }
  };

  const handleNewGame = () => {
    setGameMode(null);
    setGameConfigured(false);
    setCategories(gameConfig.categories.map(cat => ({
      ...cat,
      questions: cat.questions.map(q => ({ ...q, isAnswered: false }))
    })));
    setPlayers(prev => prev.map(player => ({ ...player, score: 0 })));
    setGameStartTime(null);
    setGameStats({ questionsAnswered: 0, questionsCorrect: 0 });
  };

  const handleBackToModeSelection = () => {
    setGameMode(null);
    setGameConfigured(false);
  };

  const handleCloseModal = () => {
    setIsQuestionModalOpen(false);
    setSelectedQuestion(null);
    setShowTeacherMode(false);
    setSkipCount(0);
  };

  if (!gameMode) {
    return (
      <div className="min-h-screen overflow-hidden relative">
        {/* Global Audio Controls */}
        <div className="fixed top-4 right-4 z-50">
          <AudioControls />
        </div>

        {/* User Authentication Section */}
        <div className="container mx-auto px-4 pt-20 pb-8">
          <div className="max-w-md mx-auto">
            <UserAuth />
          </div>
        </div>

        {/* Game Mode Selector */}
        <GameModeSelector onSelectMode={handleModeSelect} />
      </div>
    );
  }

  if (!gameConfigured) {
    return (
      <div className="min-h-screen overflow-hidden relative">
        {/* Global Audio Controls */}
        <div className="fixed top-4 right-4 z-50">
          <AudioControls />
        </div>
        <GameSetup
          gameMode={gameMode}
          onBack={handleBackToModeSelection}
          onStartGame={handleGameSetup}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden relative">
      {/* Global Audio Controls */}
      <div className="fixed top-4 right-4 z-50">
        <AudioControls />
      </div>

      <GameHeader 
        players={players}
        gameMode={gameMode}
        onNewGame={handleNewGame}
      />
      <GameBoard 
        categories={categories}
        onQuestionSelect={handleQuestionSelect}
        isGameActive={true}
        rowCount={gameConfig.rowCount}
      />
      <QuestionModal
        isOpen={isQuestionModalOpen || showTeacherMode}
        onClose={handleCloseModal}
        question={selectedQuestion}
        onAnswer={handleAnswer}
        currentPlayer={players.find(p => p.isActive)?.name}
        gameMode={gameMode}
      />
    </div>
  );
};

export default Index;
