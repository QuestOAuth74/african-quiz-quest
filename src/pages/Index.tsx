import { useState } from "react";
import { Link } from "react-router-dom";
import { GameModeSelector } from "@/components/GameModeSelector";
import { GameHeader } from "@/components/GameHeader";
import { GameBoard } from "@/components/GameBoard";
import QuestionModal from "@/components/QuestionModal";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

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

const mockQuestions = {
  "1": {
    id: "1",
    text: "This ancient Egyptian queen was known for her relationships with Julius Caesar and Mark Antony.",
    options: [
      "Nefertiti",
      "Cleopatra VII",
      "Hatshepsut",
      "Ankhesenamun"
    ],
    correctAnswerIndex: 1,
    points: 100,
    category: "Ancient Civilizations",
    explanation: "Cleopatra VII (69-30 BCE) was the last active pharaoh of Ancient Egypt. She was highly educated, speaking at least nine languages, and was known for her intelligence and political acumen. Her relationships with Julius Caesar and later Mark Antony were strategic political alliances aimed at preserving Egypt's independence from Rome.",
    historicalContext: "Cleopatra ruled during the Ptolemaic period, a dynasty that had controlled Egypt for nearly 300 years after Alexander the Great's conquest. Her death marked the end of both the Ptolemaic dynasty and Egypt's independence, as the country became a Roman province.",
    imageUrl: "https://images.unsplash.com/photo-1539650116574-75c0c6d73def?w=400&h=300&fit=crop&crop=center"
  },
  "2": {
    id: "2",
    text: "Which ancient civilization built Machu Picchu?",
    options: [
      "Aztecs",
      "Mayans", 
      "Incas",
      "Olmecs"
    ],
    correctAnswerIndex: 2,
    points: 200,
    category: "Ancient Civilizations",
    explanation: "Machu Picchu was built by the Inca Empire around 1450 CE during the reign of Inca Pachacuti. This remarkable citadel sits at 2,430 meters above sea level in the Andes Mountains of Peru.",
    historicalContext: "The site was likely a royal estate and sacred center. It was abandoned around 1572 during the Spanish conquest but remained hidden from the outside world until American historian Hiram Bingham brought it to international attention in 1911.",
    imageUrl: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=400&h=300&fit=crop&crop=center"
  },
  "6": {
    id: "6", 
    text: "Who was the first Holy Roman Emperor?",
    options: [
      "Charlemagne",
      "Otto I",
      "Frederick Barbarossa",
      "Henry IV"
    ],
    correctAnswerIndex: 0,
    points: 100,
    category: "Great Kingdoms",
    explanation: "Charlemagne (Charles the Great) was crowned as the first Holy Roman Emperor by Pope Leo III on Christmas Day, 800 CE. This event marked the revival of the Western Roman Empire concept in medieval Europe.",
    historicalContext: "Charlemagne's empire stretched across much of Western and Central Europe. His coronation established the precedent for the Holy Roman Empire, which would last for over 1,000 years until 1806.",
    imageUrl: "https://images.unsplash.com/photo-1543422655-9d6a50c12bca?w=400&h=300&fit=crop&crop=center"
  }
};

const Index = () => {
  const [gameMode, setGameMode] = useState<'single' | 'multiplayer' | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [showTeacherMode, setShowTeacherMode] = useState(false);
  const [skipCount, setSkipCount] = useState(0);
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
    const question = mockQuestions[questionId] || mockQuestions["1"];
    setSelectedQuestion(question);
    setIsQuestionModalOpen(true);
  };

  const handleAnswer = (selectedAnswerIndex: number | 'pass' | 'timeout' | 'skip') => {
    let isCorrect = false;
    let pointChange = 0;
    
    if (selectedAnswerIndex === 'skip') {
      const newSkipCount = skipCount + 1;
      setSkipCount(newSkipCount);
      
      if (gameMode === 'multiplayer' && newSkipCount < 2) {
        // First player skipped, switch to next player without showing answer
        setPlayers(prev => prev.map(player => ({
          ...player,
          isActive: !player.isActive
        })));
        
        // Reset timer for next player
        setIsQuestionModalOpen(false);
        setTimeout(() => {
          setIsQuestionModalOpen(true);
        }, 100);
        return;
      } else if (gameMode === 'multiplayer' && newSkipCount === 2) {
        // Both players skipped - show teacher mode
        setShowTeacherMode(true);
        setSkipCount(0);
        return;
      } else if (gameMode === 'single') {
        // Single player skipped - show teacher mode
        setShowTeacherMode(true);
        setSkipCount(0);
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

    // Reset skip count after answering
    setSkipCount(0);

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
    setCategories(mockCategories.map(cat => ({
      ...cat,
      questions: cat.questions.map(q => ({ ...q, isAnswered: false }))
    })));
    setPlayers(prev => prev.map(player => ({ ...player, score: 0 })));
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
