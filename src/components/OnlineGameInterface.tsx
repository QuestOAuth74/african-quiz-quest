import { useState, useEffect } from 'react';
import { ArrowLeft, Crown, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GameBoard } from './GameBoard';
import QuestionModal from './QuestionModal';
import { useGameRoom } from '@/hooks/useGameRoom';
import { useRealtimeGameState } from '@/hooks/useRealtimeGameState';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface OnlineGameInterfaceProps {
  roomId: string;
  onBack: () => void;
}

export const OnlineGameInterface = ({ roomId, onBack }: OnlineGameInterfaceProps) => {
  const { user } = useAuth();
  const { currentRoom, players } = useGameRoom();
  const { gameState, selectQuestion, submitAnswer, isMyTurn } = useRealtimeGameState(roomId);
  
  const [categories, setCategories] = useState<any[]>([]);
  const [questionsData, setQuestionsData] = useState<any[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set());

  // Load questions based on room configuration
  useEffect(() => {
    if (!currentRoom?.game_config?.categories) return;

    const loadQuestions = async () => {
      try {
        // Get category IDs
        const { data: categoryData } = await supabase
          .from('categories')
          .select('*')
          .in('name', currentRoom.game_config.categories);

        if (!categoryData) return;

        setCategories(categoryData);

        // Load questions for each category
        const allQuestions = [];
        for (const category of categoryData) {
          const { data: questions } = await supabase
            .from('questions')
            .select(`
              *,
              question_options (*)
            `)
            .eq('category_id', category.id)
            .limit(currentRoom.game_config.rowCount || 5);

          if (questions) {
            const formattedQuestions = questions.map(q => ({
              ...q,
              category: category.name,
              options: q.question_options?.map((opt: any) => ({
                id: opt.id,
                text: opt.text,
                option_type: opt.option_type
              })) || []
            }));
            allQuestions.push(...formattedQuestions);
          }
        }

        setQuestionsData(allQuestions);
      } catch (error) {
        console.error('Failed to load questions:', error);
        toast.error('Failed to load game questions');
      }
    };

    loadQuestions();
  }, [currentRoom]);

  // Load answered questions
  useEffect(() => {
    if (!roomId) return;

    const loadAnsweredQuestions = async () => {
      const { data } = await supabase
        .from('game_room_questions')
        .select('question_id')
        .eq('room_id', roomId)
        .eq('is_answered', true);

      if (data) {
        setAnsweredQuestions(new Set(data.map(q => q.question_id)));
      }
    };

    loadAnsweredQuestions();
  }, [roomId]);

  // Handle question selection
  const handleQuestionSelect = async (categoryId: string, questionId: string) => {
    if (!isMyTurn) {
      toast.error("It's not your turn!");
      return;
    }

    // Find question by ID
    const question = questionsData.find(q => q.id === questionId);

    if (!question || answeredQuestions.has(question.id)) {
      toast.error('Question not available');
      return;
    }

    const success = await selectQuestion(question.id, question.category_id, question.points);
    if (success) {
      setSelectedQuestion(question);
      setIsQuestionModalOpen(true);
    }
  };

  // Handle answer submission
  const handleAnswer = async (selectedAnswerIndex: number | 'pass' | 'timeout' | 'skip') => {
    if (!selectedQuestion) return;

    let isCorrect = false;
    if (typeof selectedAnswerIndex === 'number') {
      const selectedOption = selectedQuestion.options[selectedAnswerIndex];
      isCorrect = selectedOption?.option_type === 'correct';
    }

    const success = await submitAnswer(selectedQuestion.id, isCorrect, selectedQuestion.points);
    if (success) {
      setAnsweredQuestions(prev => new Set([...prev, selectedQuestion.id]));
      setIsQuestionModalOpen(false);
      setSelectedQuestion(null);
      
      if (isCorrect) {
        toast.success('Correct answer!');
      } else {
        toast.error('Incorrect answer');
      }
    }
  };

  // Generate game board data
  const gameBoardCategories = categories.map(category => ({
    id: category.id,
    name: category.name,
    questions: Array.from({ length: currentRoom?.game_config?.rowCount || 5 }, (_, index) => {
      const points = (index + 1) * 200;
      const question = questionsData.find(q => 
        q.category === category.name && q.points === points
      );
      
      return {
        id: question?.id || `${category.id}-${points}`,
        points,
        isAnswered: question ? answeredQuestions.has(question.id) : false
      };
    })
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="p-4 border-b border-white/20">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              onClick={onBack}
              variant="outline"
              size="sm"
              className="text-white border-white/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Leave Game
            </Button>
            <div className="text-white">
              <h1 className="text-xl font-bold">Room: {currentRoom?.room_code}</h1>
              {isMyTurn ? (
                <p className="text-green-400 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Your turn - Select a question
                </p>
              ) : (
                <p className="text-yellow-400">
                  Waiting for other players...
                </p>
              )}
            </div>
          </div>
          
          {/* Player Scores */}
          <div className="flex gap-4">
            {players.map((player) => (
              <Card key={player.id} className="bg-white/10 border-white/20">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 text-white">
                    {player.is_host && <Crown className="w-4 h-4 text-yellow-400" />}
                    <span className="font-medium">{player.player_name}</span>
                    <Badge variant="secondary">{player.score}</Badge>
                    {gameState?.currentTurn === player.user_id && (
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Game Board */}
      <div className="p-4">
        <div className="max-w-6xl mx-auto">
          <GameBoard
            categories={gameBoardCategories}
            onQuestionSelect={handleQuestionSelect}
            isGameActive={true}
            rowCount={currentRoom?.game_config?.rowCount || 5}
          />
        </div>
      </div>

      {/* Question Modal */}
      <QuestionModal
        isOpen={isQuestionModalOpen}
        onClose={() => setIsQuestionModalOpen(false)}
        question={selectedQuestion}
        onAnswer={handleAnswer}
        currentPlayer="You"
        gameMode="online-multiplayer"
      />
    </div>
  );
};