import { useState } from "react";
import { GameModeSelector } from "@/components/GameModeSelector";
import { GameHeader } from "@/components/GameHeader";
import { GameBoard } from "@/components/GameBoard";
import { QuestionModal } from "@/components/QuestionModal";

// Mock data for demonstration
const mockCategories = [
  {
    id: "ancient",
    name: "Ancient Civilizations",
    questions: [
      { id: "1", points: 100, isAnswered: false },
      { id: "2", points: 200, isAnswered: false },
      { id: "3", points: 300, isAnswered: false },
      { id: "4", points: 400, isAnswered: false },
      { id: "5", points: 500, isAnswered: false },
    ]
  },
  {
    id: "kingdoms",
    name: "Great Kingdoms",
    questions: [
      { id: "6", points: 100, isAnswered: false },
      { id: "7", points: 200, isAnswered: false },
      { id: "8", points: 300, isAnswered: false },
      { id: "9", points: 400, isAnswered: false },
      { id: "10", points: 500, isAnswered: false },
    ]
  },
  {
    id: "independence",
    name: "Independence",
    questions: [
      { id: "11", points: 100, isAnswered: false },
      { id: "12", points: 200, isAnswered: false },
      { id: "13", points: 300, isAnswered: false },
      { id: "14", points: 400, isAnswered: false },
      { id: "15", points: 500, isAnswered: false },
    ]
  },
  {
    id: "leaders",
    name: "Leaders",
    questions: [
      { id: "16", points: 100, isAnswered: false },
      { id: "17", points: 200, isAnswered: false },
      { id: "18", points: 300, isAnswered: false },
      { id: "19", points: 400, isAnswered: false },
      { id: "20", points: 500, isAnswered: false },
    ]
  },
  {
    id: "culture",
    name: "Culture & Arts",
    questions: [
      { id: "21", points: 100, isAnswered: false },
      { id: "22", points: 200, isAnswered: false },
      { id: "23", points: 300, isAnswered: false },
      { id: "24", points: 400, isAnswered: false },
      { id: "25", points: 500, isAnswered: false },
    ]
  }
];

const mockQuestion = {
  id: "1",
  text: "This ancient Egyptian queen was known for her relationships with Julius Caesar and Mark Antony.",
  answer: "Who is Cleopatra VII?",
  points: 100,
  category: "Ancient Civilizations"
};

const Index = () => {
  const [gameMode, setGameMode] = useState<'single' | 'multiplayer' | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [players, setPlayers] = useState([
    { id: "player1", name: "Player 1", score: 0, isActive: true },
    { id: "computer", name: "Computer", score: 0, isActive: false }
  ]);
  const [categories, setCategories] = useState(mockCategories);

  const handleModeSelect = (mode: 'single' | 'multiplayer') => {
    setGameMode(mode);
    if (mode === 'multiplayer') {
      setPlayers([
        { id: "player1", name: "Player 1", score: 0, isActive: true },
        { id: "player2", name: "Player 2", score: 0, isActive: false }
      ]);
    }
  };

  const handleQuestionSelect = (categoryId: string, questionId: string) => {
    setSelectedQuestion(mockQuestion);
    setIsQuestionModalOpen(true);
  };

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      setPlayers(prev => prev.map(player => 
        player.isActive 
          ? { ...player, score: player.score + mockQuestion.points }
          : player
      ));
    }
    
    // Mark question as answered
    setCategories(prev => prev.map(cat => ({
      ...cat,
      questions: cat.questions.map(q => 
        q.id === selectedQuestion?.id ? { ...q, isAnswered: true } : q
      )
    })));

    // Switch active player
    setPlayers(prev => prev.map(player => ({
      ...player,
      isActive: !player.isActive
    })));
  };

  const handleNewGame = () => {
    setGameMode(null);
    setCategories(mockCategories.map(cat => ({
      ...cat,
      questions: cat.questions.map(q => ({ ...q, isAnswered: false }))
    })));
    setPlayers(prev => prev.map(player => ({ ...player, score: 0 })));
  };

  const handleCloseModal = () => {
    setIsQuestionModalOpen(false);
    setSelectedQuestion(null);
  };

  if (!gameMode) {
    return <GameModeSelector onSelectMode={handleModeSelect} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <GameHeader 
        players={players}
        gameMode={gameMode}
        onNewGame={handleNewGame}
      />
      <GameBoard 
        categories={categories}
        onQuestionSelect={handleQuestionSelect}
        isGameActive={true}
      />
      <QuestionModal
        isOpen={isQuestionModalOpen}
        onClose={handleCloseModal}
        question={selectedQuestion}
        onAnswer={handleAnswer}
      />
    </div>
  );
};

export default Index;
