import { useState } from "react";
import { Link } from "react-router-dom";
import { GameModeSelector } from "@/components/GameModeSelector";
import GameSetup from "@/components/GameSetup";
import { GameHeader } from "@/components/GameHeader";
import { GameBoard } from "@/components/GameBoard";
import QuestionModal from "@/components/QuestionModal";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

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

  const handleGameSetup = async (selectedCategories: any[], rowCount: number) => {
    try {
      // Load questions for selected categories
      await loadQuestionsForCategories(selectedCategories, rowCount);
    } catch (error) {
      console.error('Error setting up game:', error);
      toast({
        title: "Error",
        description: "Failed to load questions. Please try again.",
        variant: "destructive",
      });
    }
  };

  const loadQuestionsForCategories = async (selectedCategories: any[], rowCount: number) => {
    const { data: questions, error } = await supabase
      .from('questions')
      .select(`
        *,
        categories (name),
        question_options (*)
      `)
      .in('category_id', selectedCategories.map(cat => cat.id));

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
      toast({
        title: "No Questions Found",
        description: "The selected categories don't have any questions yet. Please add questions using the admin panel.",
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
  };

  const handleAnswer = (selectedAnswerIndex: number | 'pass' | 'timeout' | 'skip') => {
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

    // Switch active player after a delay to allow viewing the explanation
    setTimeout(() => {
      setPlayers(prev => prev.map(player => ({
        ...player,
        isActive: !player.isActive
      })));
    }, 3000);
  };

  const handleNewGame = () => {
    setGameMode(null);
    setGameConfigured(false);
    setCategories(gameConfig.categories.map(cat => ({
      ...cat,
      questions: cat.questions.map(q => ({ ...q, isAnswered: false }))
    })));
    setPlayers(prev => prev.map(player => ({ ...player, score: 0 })));
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
    return <GameModeSelector onSelectMode={handleModeSelect} />;
  }

  if (!gameConfigured) {
    return (
      <GameSetup
        gameMode={gameMode}
        onBack={handleBackToModeSelection}
        onStartGame={handleGameSetup}
      />
    );
  }

  return (
    <div className="min-h-screen overflow-hidden relative">
      {/* Admin Access Button */}
      <div className="absolute top-4 right-4 z-50">
        <Link to="/admin/login">
          <Button variant="ghost" size="sm" className="text-theme-yellow hover:text-theme-yellow-light hover:bg-theme-yellow/10 border border-theme-yellow/20">
            <Settings className="w-4 h-4 mr-2" />
            Admin
          </Button>
        </Link>
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
