import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GameModeSelector } from "@/components/GameModeSelector";
import GameSetup from "@/components/GameSetup";
import { GameHeader } from "@/components/GameHeader";
import { GameBoard } from "@/components/GameBoard";
import QuestionModal from "@/components/QuestionModal";
import UserAuth from "@/components/UserAuth";
import TopNavigation from "@/components/TopNavigation";
import { AudioControls } from "@/components/AudioControls";
import { Button } from "@/components/ui/button";
import { Settings, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import GameCompletionModal from "@/components/GameCompletionModal";

import { AIThinkingIndicator } from "@/components/AIThinkingIndicator";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import WelcomeModal from "@/components/WelcomeModal";
import { OnlineMultiplayerLobby } from "@/components/OnlineMultiplayerLobby";
import { OnlineGameInterface } from "@/components/OnlineGameInterface";
import { QuizSection } from "@/components/QuizSection";

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
  const [gameMode, setGameMode] = useState<'single' | 'multiplayer' | 'online-multiplayer' | null>(null);
  const [gameConfigured, setGameConfigured] = useState(false);
  const [onlineGameRoomId, setOnlineGameRoomId] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [selectedQuestionGridId, setSelectedQuestionGridId] = useState<string | null>(null);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [showTeacherMode, setShowTeacherMode] = useState(false);
  const [skipCount, setSkipCount] = useState(0);
  const [players, setPlayers] = useState([
    { id: "player1", name: "Player 1", score: 0, isActive: true },
    { id: "computer", name: "Computer", score: 0, isActive: false }
  ]);

  // Add logging to track player state changes
  useEffect(() => {
    console.log('Players state changed:', players.map(p => ({ name: p.name, score: p.score, isActive: p.isActive })));
  }, [players]);
  const [categories, setCategories] = useState([]);
  const [gameConfig, setGameConfig] = useState({ categories: [], rowCount: 5 });
  const [questionsData, setQuestionsData] = useState<{[key: string]: Question}>({});
  const [gameStartTime, setGameStartTime] = useState<Date | null>(null);
  const [isGameCompletionModalOpen, setIsGameCompletionModalOpen] = useState(false);
  const [gameStats, setGameStats] = useState({
    questionsAnswered: 0,
    questionsCorrect: 0,
    streakCount: 0
  });
  const { toast } = useToast();
  const [aiCooldownUntil, setAiCooldownUntil] = useState<number | null>(null);
  const [aiIsThinking, setAiIsThinking] = useState(false);
  const [aiIsSelectingQuestion, setAiIsSelectingQuestion] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [answeringPlayer, setAnsweringPlayer] = useState<string | null>(null);

  // Helper functions for welcome modal timing
  const shouldShowWelcomeModal = (): boolean => {
    const lastSeenTimestamp = localStorage.getItem('welcomeModalLastSeen');
    if (!lastSeenTimestamp) {
      return true; // First visit
    }
    
    const lastSeen = parseInt(lastSeenTimestamp, 10);
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    return (now - lastSeen) >= twentyFourHours;
  };

  const markWelcomeModalSeen = () => {
    localStorage.setItem('welcomeModalLastSeen', Date.now().toString());
  };

  // Check if user should see the welcome modal (first visit or 24+ hours since last viewing)
  useEffect(() => {
    if (shouldShowWelcomeModal()) {
      setShowWelcomeModal(true);
    }
  }, []);

  const handleCloseWelcome = () => {
    setShowWelcomeModal(false);
    markWelcomeModalSeen();
  };

  // Redirect to auth if not authenticated and trying to access admin
  useEffect(() => {
    if (window.location.pathname.includes('/admin') && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  // AI turn management - handles both question selection and answering with cooldown
  useEffect(() => {
    const activePlayer = players.find(p => p.isActive);
    const now = Date.now();
    
    if (activePlayer?.name === "Computer" && gameConfigured) {
      console.log('AI is active, checking conditions:', {
        hasQuestion: !!selectedQuestion,
        modalOpen: isQuestionModalOpen,
        cooldownUntil: aiCooldownUntil,
        cooldownActive: aiCooldownUntil && now < aiCooldownUntil
      });
      
      // Clear cooldown when it's AI's turn to pick a new question (turn has switched)
      if (!selectedQuestion && !isQuestionModalOpen && aiCooldownUntil) {
        console.log('AI turn started - clearing cooldown');
        setAiCooldownUntil(null);
      }
      
      // Check if AI is in cooldown period (only for answering, not for picking questions)
      if (aiCooldownUntil && now < aiCooldownUntil && selectedQuestion && isQuestionModalOpen) {
        console.log('AI is in cooldown for answering, waiting...', Math.round((aiCooldownUntil - now) / 1000), 'seconds remaining');
        return;
      }
      
      // AI picks a question when it's their turn and no question is selected
      if (!selectedQuestion && !isQuestionModalOpen) {
        console.log('AI turn: selecting random question');
        setAiIsSelectingQuestion(true);
        setAiIsThinking(true);
        const timer = setTimeout(() => {
          handleAISelectQuestion();
        }, 1500);
        return () => clearTimeout(timer);
      }
      
      // AI has selected the question, now waiting for user to click to see answer
      if (selectedQuestion && isQuestionModalOpen && (!aiCooldownUntil || now >= aiCooldownUntil)) {
        console.log('AI turn: question selected, waiting for user to see answer');
        setAiIsSelectingQuestion(false);
        // Don't set aiIsThinking to true - the AI is not actively thinking anymore
        // The user will click a button to see the AI's answer
        handleAITurn(selectedQuestion);
      }
    }
  }, [players, selectedQuestion, isQuestionModalOpen, gameConfigured, aiCooldownUntil]);

  const [playerCount, setPlayerCount] = useState<number>(2);

  const handleModeSelect = (mode: 'single' | 'multiplayer' | 'online-multiplayer', selectedPlayerCount?: number) => {
    setGameMode(mode);
    setGameConfigured(false);
    if (mode === 'multiplayer' && selectedPlayerCount) {
      setPlayerCount(selectedPlayerCount);
      const multiplayerPlayers = Array.from({ length: selectedPlayerCount }, (_, index) => ({
        id: `player${index + 1}`,
        name: `Player ${index + 1}`,
        score: 0,
        isActive: index === 0
      }));
      setPlayers(multiplayerPlayers);
    } else if (mode === 'single') {
      setPlayers([
        { id: "player1", name: "Player 1", score: 0, isActive: true },
        { id: "computer", name: "Computer", score: 0, isActive: false }
      ]);
    }
  };

  const handleGameSetup = async (selectedCategories: any[], rowCount: number, questionFilter: 'all' | 'fresh' | 'correct' | 'incorrect', playerNames?: string[]) => {
    try {
      // Update player names if provided (for multiplayer)
      if (playerNames && gameMode === 'multiplayer') {
        setPlayers(prev => prev.map((player, index) => ({
          ...player,
          name: playerNames[index] || `Player ${index + 1}`
        })));
      }
      
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

    // Group questions by category and randomly assign to point tiers
    const questionsMap: {[key: string]: Question} = {};
    const gameCategories = selectedCategories.map(cat => {
      const categoryQuestions = questions.filter(q => q.category_id === cat.id);
      
      // Shuffle the questions randomly for this category
      const shuffledQuestions = [...categoryQuestions].sort(() => Math.random() - 0.5);
      
      // Create questions for each row/point tier (100, 200, 300, 400, 500)
      const questionsForGrid = Array.from({ length: rowCount }, (_, index) => {
        const pointTier = (index + 1) * 100; // 100, 200, 300, 400, 500
        
        // Get the next available shuffled question for this tier
        const questionForTier = shuffledQuestions[index];
        
        if (questionForTier) {
          const correctAnswerIndex = questionForTier.question_options.findIndex(opt => opt.option_type === 'correct');
          
          // Map to questionsMap using grid position as key, but override points with tier points
          questionsMap[`${cat.id}-${index + 1}`] = {
            id: questionForTier.id,
            text: questionForTier.text,
            points: pointTier, // Use the tier points instead of original question points
            category: questionForTier.categories.name,
            explanation: questionForTier.explanation,
            historicalContext: questionForTier.historical_context,
            imageUrl: questionForTier.image_url,
            options: questionForTier.question_options as Array<{id: string; text: string; option_type: 'correct' | 'incorrect'}>,
            correctAnswerIndex: correctAnswerIndex
          };
          
          return questionForTier;
        }
        
        return null; // No question available for this tier
      });
      
      return {
        id: cat.id,
        name: cat.name,
        questions: Array.from({ length: rowCount }, (_, index) => {
          const hasQuestion = questionsForGrid[index] !== null;
          const pointTier = (index + 1) * 100;
          return {
            id: `${cat.id}-${index + 1}`,
            points: pointTier,
            isAnswered: false,
            hasQuestion: hasQuestion
          };
        })
      };
    });
    
    setQuestionsData(questionsMap);
    setGameConfig({ categories: gameCategories, rowCount });
    setCategories(gameCategories);
    setGameConfigured(true);
    setGameStartTime(new Date());
    setGameStats({ questionsAnswered: 0, questionsCorrect: 0, streakCount: 0 });
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
    setSelectedQuestionGridId(questionId);
    setIsQuestionModalOpen(true);
    setAiIsSelectingQuestion(false); // AI finished selecting question
    
    const activePlayer = players.find(p => p.isActive);
    console.log('Question selected:', questionId, 'Active player:', activePlayer?.name);
  };

  const handleAISelectQuestion = () => {
    console.log('AI selecting its own question...');
    
    // Get all available (unanswered) questions
    const availableQuestions: Array<{categoryId: string, questionId: string, points: number}> = [];
    
    categories.forEach(category => {
      category.questions.forEach(question => {
        if (!question.isAnswered && question.hasQuestion) {
          availableQuestions.push({
            categoryId: category.id,
            questionId: question.id,
            points: question.points
          });
        }
      });
    });
    
    if (availableQuestions.length === 0) {
      console.log('No available questions for AI to select');
      return;
    }
    
    // Randomly select a question
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const selectedQuestion = availableQuestions[randomIndex];
    
    console.log('AI selected question:', selectedQuestion);
    
    // Trigger question selection
    handleQuestionSelect(selectedQuestion.categoryId, selectedQuestion.questionId);
  };

  const handleAITurn = (question: Question) => {
    console.log('AI turn - question selected:', question.text, 'Points:', question.points);
    
    // AI has selected the question, but doesn't auto-answer
    // The user will see the question and click to see the AI's answer
    setAiIsThinking(false); // AI finished selecting question
    console.log('AI waiting for user to see answer...');
  };

  const handleAIAnswer = (question: Question) => {
    console.log('AI answering question:', question.text, 'Points:', question.points);
    
    const correctAnswerIndex = question.correctAnswerIndex;
    if (typeof correctAnswerIndex === 'number') {
      console.log('AI selecting correct answer at index:', correctAnswerIndex);
      
      // Set AI cooldown for 60 seconds after answering
      const cooldownEnd = Date.now() + 60000; // 60 seconds
      setAiCooldownUntil(cooldownEnd);
      console.log('AI cooldown set for 60 seconds');
      
      handleAnswer(correctAnswerIndex);
    } else {
      console.log('No correct answer index found for AI');
    }
  };


  const handleAnswer = async (selectedAnswerIndex: number | 'pass' | 'timeout' | 'skip') => {
    // Store the player who is answering before any logic changes
    const currentActivePlayer = players.find(p => p.isActive);
    if (currentActivePlayer) {
      setAnsweringPlayer(currentActivePlayer.name);
    }
    
    let isCorrect = false;
    let pointChange = 0;
    
    if (selectedAnswerIndex === 'skip') {
      // Switch to next player
      setPlayers(prev => prev.map(player => ({
        ...player,
        isActive: !player.isActive
      })));
      
      setIsQuestionModalOpen(false);
      setSelectedQuestion(null);
      setSelectedQuestionGridId(null);
      return;
    }
    
    if (typeof selectedAnswerIndex === 'number') {
      isCorrect = selectedAnswerIndex === selectedQuestion?.correctAnswerIndex;
      pointChange = isCorrect ? selectedQuestion.points : -selectedQuestion.points;
      
      // Record the user's answer attempt if authenticated (only for the facilitator)
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

        // Update streak tracking for the facilitator
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
        questionsCorrect: prev.questionsCorrect + (isCorrect ? 1 : 0),
        streakCount: prev.streakCount
      }));
    }
    // For 'pass' and 'timeout', no points are gained or lost
    
    // Update player score for the active player
    if (pointChange !== 0) {
      console.log('*** SCORE UPDATE ***');
      console.log('Point change:', pointChange);
      const activePlayer = players.find(p => p.isActive);
      console.log('Active player before update:', activePlayer?.name);
      console.log('All players before update:', players.map(p => ({ name: p.name, score: p.score })));
    }
    
    setPlayers(prev => {
      const updated = prev.map(player => 
        player.isActive 
          ? { ...player, score: Math.max(0, player.score + pointChange) } // Prevent negative scores
          : player
      );
      
      if (pointChange !== 0) {
        console.log('All players after update:', updated.map(p => ({ name: p.name, score: p.score })));
      }
      
      return updated;
    });
    
    // Mark question as answered using the grid ID
    setCategories(prev => prev.map(cat => ({
      ...cat,
      questions: cat.questions.map(q => 
        q.id === selectedQuestionGridId ? { ...q, isAnswered: true } : q
      )
    })));

    // Check if game is completed (using the updated categories state)
    const updatedCategories = categories.map(cat => ({
      ...cat,
      questions: cat.questions.map(q => 
        q.id === selectedQuestionGridId ? { ...q, isAnswered: true } : q
      )
    }));
    
    const allQuestionsAnswered = updatedCategories.every(cat => 
      cat.questions.every(q => q.isAnswered)
    );
    
    console.log('Game completion check:', {
      allQuestionsAnswered,
      totalQuestions: updatedCategories.reduce((total, cat) => total + cat.questions.length, 0),
      answeredQuestions: updatedCategories.reduce((total, cat) => 
        total + cat.questions.filter(q => q.isAnswered).length, 0
      )
    });
    
    if (allQuestionsAnswered) {
      console.log('Game completed! Calling handleGameComplete in 3.5 seconds...');
      setTimeout(() => {
        handleGameComplete();
      }, 3500); // Wait a bit longer than the player switch delay
    }

    // Automatically switch turns after processing the answer
    const activePlayer = players.find(p => p.isActive);
    if (activePlayer?.name === "Computer") {
      console.log('Computer answered, switching turns immediately');
      setPlayers(prev => {
        const newPlayers = prev.map(player => ({
          ...player,
          isActive: !player.isActive
        }));
        console.log('Switched to next player:', newPlayers.find(p => p.isActive)?.name);
        return newPlayers;
      });
    } else if (activePlayer?.name !== "Computer") {
      // Human player answered, switch turn to computer
      console.log('Human answered, switching turns to computer');
      setPlayers(prev => {
        const newPlayers = prev.map(player => ({
          ...player,
          isActive: !player.isActive
        }));
        console.log('Switched to next player:', newPlayers.find(p => p.isActive)?.name);
        return newPlayers;
      });
    }

    // Keep modal open for user to read explanation
    console.log('Answer processed. Modal remains open for user to read explanation.');
  };

  const handleGameComplete = async () => {
    console.log('handleGameComplete called', { isAuthenticated, user: !!user, gameStartTime: !!gameStartTime });
    if (!isAuthenticated || !user || !gameStartTime) {
      console.log('Game completion aborted - missing requirements');
      return;
    }

    const currentPlayer = players.find(p => p.name !== "Computer") || players[0];
    const gameDuration = Math.floor((new Date().getTime() - gameStartTime.getTime()) / 1000);

    console.log('Recording game completion:', {
      user_id: user.id,
      game_mode: gameMode || 'single',
      final_score: currentPlayer.score,
      questions_answered: gameStats.questionsAnswered,
      questions_correct: gameStats.questionsCorrect,
      categories_played: gameConfig.categories.map(cat => cat.name),
      game_duration_seconds: gameDuration
    });

    try {
      const { error } = await supabase
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

      if (error) {
        console.error('Error inserting game record:', error);
        throw error;
      }

      console.log('Game record inserted successfully!');

      // Show completion modal instead of toast
      setIsGameCompletionModalOpen(true);
    } catch (error) {
      console.error('Error recording game completion:', error);
      toast({
        title: "Error",
        description: "Failed to record game completion. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleNewGame = () => {
    setIsGameCompletionModalOpen(false);
    setGameMode(null);
    setGameConfigured(false);
    setCategories(gameConfig.categories.map(cat => ({
      ...cat,
      questions: cat.questions.map(q => ({ ...q, isAnswered: false }))
    })));
    setPlayers(prev => prev.map(player => ({ ...player, score: 0 })));
    setGameStartTime(null);
    setGameStats({ questionsAnswered: 0, questionsCorrect: 0, streakCount: 0 });
    setIsQuestionModalOpen(false);
    setSelectedQuestion(null);
    setSelectedQuestionGridId('');
  };

  const handleViewLeaderboard = () => {
    navigate('/leaderboard');
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
    setSelectedQuestionGridId(null);
    setAnsweringPlayer(null); // Clear the answering player
    
    // Turn switching is now handled in handleAnswer for computer turns
    // For human players, turns switch when they select their next question
    console.log('Modal closed');
  };

  if (!gameMode) {
    return (
      <div className="min-h-screen overflow-hidden relative">
        {/* Welcome Modal */}
        <WelcomeModal isOpen={showWelcomeModal} onClose={handleCloseWelcome} />
        
        {/* Top Navigation */}
          <TopNavigation />
        
        {/* Global Audio Controls */}
        <div className="fixed left-4 top-1/2 -translate-y-1/2 z-50">
          <AudioControls />
        </div>

        {/* Game Mode Selector */}
        <GameModeSelector onSelectMode={handleModeSelect} />

        {/* Quiz Section - African History Focus */}
        <QuizSection />

        {/* User Authentication Section */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <UserAuth />
          </div>
        </div>
      </div>
    );
  }

  if (!gameConfigured) {
    // Handle online multiplayer mode
    if (gameMode === 'online-multiplayer') {
      return (
        <div className="min-h-screen overflow-hidden relative">
          {/* Top Navigation */}
          <TopNavigation />
          
          {/* Global Audio Controls */}
          <div className="fixed left-4 top-1/2 -translate-y-1/2 z-50">
            <AudioControls />
          </div>
          <div className="pt-16">
            <OnlineMultiplayerLobby
              onBack={handleBackToModeSelection}
              onGameStart={(roomId, players) => {
                setOnlineGameRoomId(roomId);
                setPlayers(players);
                setGameConfigured(true);
              }}
              gameConfig={{ categories: [], rowCount: 5 }}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen overflow-hidden relative">
        {/* Top Navigation */}
        <TopNavigation />
        
        {/* Global Audio Controls */}
        <div className="fixed left-2 top-1/2 -translate-y-1/2 sm:left-4 z-50">
          <AudioControls />
        </div>
        <div className="pt-16 p-2 sm:p-4">
          <GameSetup
            gameMode={gameMode}
            playerCount={playerCount}
            onBack={handleBackToModeSelection}
            onStartGame={handleGameSetup}
          />
        </div>
      </div>
    );
  }

  // Render online game interface for online multiplayer
  if (gameMode === 'online-multiplayer' && onlineGameRoomId) {
    return (
      <div className="min-h-screen overflow-hidden relative">
        {/* Top Navigation */}
        <TopNavigation />
        
        {/* Global Audio Controls */}
        <div className="fixed left-4 top-1/2 -translate-y-1/2 z-50">
          <AudioControls />
        </div>

        <div className="pt-16">
          <OnlineGameInterface
            roomId={onlineGameRoomId}
            onBack={() => {
              setGameMode(null);
              setGameConfigured(false);
              setOnlineGameRoomId(null);
              setPlayers([]);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden relative">
      {/* Top Navigation */}
      <TopNavigation />
      
      {/* Global Audio Controls */}
      <div className="fixed left-4 top-1/2 -translate-y-1/2 z-50">
        <AudioControls />
      </div>

      <div className="pt-16">
        <GameHeader 
          players={players}
          gameMode={gameMode}
          onNewGame={handleNewGame}
        />
        
        {/* Thinking Bar - positioned between header and board */}
        <div className="container mx-auto px-4 py-4">
          {/* Show AI thinking indicator when computer is active and thinking */}
          <AIThinkingIndicator
            isActive={players.find(p => p.isActive)?.name === "Computer"}
            isSelectingQuestion={aiIsSelectingQuestion}
            isAnswering={aiIsThinking && !aiIsSelectingQuestion}
          />
          
        </div>
      </div>
      
      
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
        currentPlayer={answeringPlayer || players.find(p => p.isActive)?.name}
        gameMode={gameMode}
      />
      
      <GameCompletionModal
        isOpen={isGameCompletionModalOpen}
        onClose={() => setIsGameCompletionModalOpen(false)}
        players={players}
        onNewGame={handleNewGame}
        onViewLeaderboard={handleViewLeaderboard}
      />
    </div>
  );
};

export default Index;
