import { useState, useEffect } from 'react';
import { ArrowLeft, Crown, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GameBoard } from './GameBoard';
import QuestionModal from './QuestionModal';
import { useGameRoom } from '@/hooks/useGameRoom';
import { useRealtimeGameState } from '@/hooks/useRealtimeGameState';
import { useRealtimeBoardState } from '@/hooks/useRealtimeBoardState';
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
  const { 
    gameState, 
    selectQuestion, 
    submitAnswer, 
    nextTurn,
    isMyTurn, 
    answeredQuestions: realtimeAnsweredQuestions,
    connectionStatus 
  } = useRealtimeGameState(roomId);
  
  const { boardState } = useRealtimeBoardState(roomId);
  
  const [categories, setCategories] = useState<any[]>([]);
  const [questionsData, setQuestionsData] = useState<any[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set());
  const [pendingAnswer, setPendingAnswer] = useState<{
    isCorrect: boolean;
    points: number;
    questionId: string;
  } | null>(null);
  const [roomDetails, setRoomDetails] = useState<any>(null);

  // Sync local answered questions with real-time data from both sources
  useEffect(() => {
    const combinedAnswered = [
      ...realtimeAnsweredQuestions,
      ...boardState.answeredQuestions
    ];
    const newAnsweredSet = new Set(combinedAnswered);
    setAnsweredQuestions(prev => {
      // Only update if the sets are actually different
      if (prev.size !== newAnsweredSet.size || 
          !Array.from(newAnsweredSet).every(id => prev.has(id))) {
        return newAnsweredSet;
      }
      return prev;
    });
  }, [realtimeAnsweredQuestions, boardState.answeredQuestions]);

  // Ensure we have room details even if coming from Live Lobby (bypass useGameRoom context)
  useEffect(() => {
    if (!roomId) return;
    const fetchRoom = async () => {
      const { data, error } = await supabase
        .from('game_rooms')
        .select('*')
        .eq('id', roomId)
        .single();
      if (!error) setRoomDetails(data);
    };
    fetchRoom();
  }, [roomId]);

  // Load questions based on room configuration
  useEffect(() => {
    const room = currentRoom || roomDetails;
    if (!room) return;

    const loadQuestions = async () => {
      try {
        let categoryData;
        const config: any = room.game_config || {};

        // Handle different config formats
        if (config.categories && Array.isArray(config.categories)) {
          // Categories specified by name
          const { data } = await supabase
            .from('categories')
            .select('*')
            .in('name', config.categories);
          categoryData = data;
        } else if (config.selectedCategories && Array.isArray(config.selectedCategories)) {
          // Categories specified by ID
          const { data } = await supabase
            .from('categories')
            .select('*')
            .in('id', config.selectedCategories);
          categoryData = data;
        } else {
          // No categories specified, load defaults
          const { data } = await supabase
            .from('categories')
            .select('*')
            .limit(6);
          categoryData = data;
        }

        if (!categoryData) {
          console.warn('No categories found');
          return;
        }

        console.log('Loaded categories:', categoryData);
        setCategories(categoryData);

        // Load questions for each category
        const allQuestions: any[] = [];
        const rowCount = config.rowCount || 5;
        for (const category of categoryData) {
          const { data: questions } = await supabase
            .from('questions')
            .select(`
              *,
              question_options (*)
            `)
            .eq('category_id', category.id)
            .limit(rowCount);

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

        console.log('Loaded questions:', allQuestions.length);
        setQuestionsData(allQuestions);
      } catch (error) {
        console.error('Failed to load questions:', error);
        toast.error('Failed to load game questions');
      }
    };

    loadQuestions();
  }, [currentRoom, roomDetails]);

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

  // Handle answer submission - store answer temporarily, don't submit yet
  const handleAnswer = async (selectedAnswerIndex: number | 'pass' | 'timeout' | 'skip') => {
    if (!selectedQuestion) return;

    let isCorrect = false;
    if (typeof selectedAnswerIndex === 'number') {
      const selectedOption = selectedQuestion.options[selectedAnswerIndex];
      isCorrect = selectedOption?.option_type === 'correct';
    }

    // Store the answer temporarily - don't submit to database yet
    setPendingAnswer({
      isCorrect,
      points: selectedQuestion.points,
      questionId: selectedQuestion.id
    });

    // Show immediate feedback but don't progress the game
    if (isCorrect) {
      toast.success('Correct answer!');
    } else {
      toast.error('Incorrect answer');
    }
  };

  const handleModalClose = async () => {
    // Submit the answer now that user is done reviewing
    if (pendingAnswer) {
      const success = await submitAnswer(
        pendingAnswer.questionId, 
        pendingAnswer.isCorrect, 
        pendingAnswer.points
      );
      
      if (success) {
        // Progress to next turn after successful submission
        await nextTurn();
      }
      
      // Clear pending answer
      setPendingAnswer(null);
    }
    
    // Close modal and clear selection
    setIsQuestionModalOpen(false);
    setSelectedQuestion(null);
  };

  // Generate game board data
  const gameBoardCategories = categories.map(category => ({
    id: category.id,
    name: category.name,
    questions: Array.from({ length: (currentRoom?.game_config?.rowCount || roomDetails?.game_config?.rowCount || 5) }, (_, index) => {
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
              <h1 className="text-xl font-bold">Room: {currentRoom?.room_code || roomDetails?.room_code}</h1>
              <div className="flex items-center gap-4">
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
                <div className="flex items-center gap-2 text-xs">
                  <div className={`w-2 h-2 rounded-full ${
                    connectionStatus === 'connected' ? 'bg-green-400' : 
                    connectionStatus === 'connecting' ? 'bg-yellow-400' : 'bg-red-400'
                  }`} />
                  <span className="text-gray-300">{connectionStatus}</span>
                </div>
              </div>
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
            rowCount={currentRoom?.game_config?.rowCount || roomDetails?.game_config?.rowCount || 5}
          />
        </div>
      </div>

      {/* Question Modal */}
      <QuestionModal
        isOpen={isQuestionModalOpen}
        onClose={handleModalClose}
        question={selectedQuestion}
        onAnswer={handleAnswer}
        currentPlayer="You"
        gameMode="online-multiplayer"
      />
    </div>
  );
};