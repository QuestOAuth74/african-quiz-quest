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
  const { currentRoom, players: contextPlayers } = useGameRoom();
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
  const [players, setPlayers] = useState<any[]>([]);

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

  // Load room details and players
  useEffect(() => {
    if (!roomId) return;
    
    const loadRoomData = async () => {
      try {
        // Fetch room details
        const { data: room, error: roomError } = await supabase
          .from('game_rooms')
          .select('*')
          .eq('id', roomId)
          .single();
        
        if (!roomError && room) {
          setRoomDetails(room);
        }

        // Fetch players for this room
        const { data: roomPlayers, error: playersError } = await supabase
          .from('game_room_players')
          .select('*')
          .eq('room_id', roomId)
          .eq('is_active', true)
          .order('joined_at');

        if (!playersError && roomPlayers) {
          console.log('🎮 Loaded players:', roomPlayers);
          setPlayers(roomPlayers);
        }
      } catch (error) {
        console.error('Error loading room data:', error);
      }
    };

    loadRoomData();

    // Set up real-time subscription for player updates
    const playersChannel = supabase
      .channel(`players_${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_room_players',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          console.log('🔄 Player update:', payload);
          loadRoomData(); // Reload players on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(playersChannel);
    };
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
        
        // Generate the expected point values (DB uses 100-point increments matching the board)
        const expectedPoints = Array.from({ length: rowCount }, (_, index) => (index + 1) * 100);
        
        console.log('🎯 Loading questions for categories:', categoryData.map(c => c.name));
        console.log('🎯 Expected point values:', expectedPoints);
        
        for (const category of categoryData) {
          // Fetch questions for each expected point value
          for (const points of expectedPoints) {
            const { data: questions } = await supabase
              .from('questions')
              .select(`
                *,
                question_options (*)
              `)
              .eq('category_id', category.id)
              .eq('points', points)
              .limit(1);

            if (questions && questions.length > 0) {
              const question = questions[0];
              // Find correct answer index for the modal
              const correctAnswerIndex = question.question_options?.findIndex(
                (opt: any) => opt.option_type === 'correct'
              ) ?? -1;

              const formattedQuestion = {
                ...question,
                category: category.name,
                correctAnswerIndex,
                // Sort options by created_at to ensure consistent ordering
                options: question.question_options
                  ?.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                  ?.map((opt: any) => ({
                    id: opt.id,
                    text: opt.text,
                    option_type: opt.option_type
                  })) || [],
                // Normalize field names for consistency
                explanation: question.explanation,
                historicalContext: question.historical_context,
                imageUrl: question.image_url
              };
              allQuestions.push(formattedQuestion);
            } else {
              console.warn(`🚨 No question found for category "${category.name}" with ${points} points`);
            }
          }
        }

        console.log('✅ Loaded questions:', allQuestions.length, 'questions');
        console.log('📋 Questions by category:', 
          categoryData.map(cat => ({
            category: cat.name,
            count: allQuestions.filter(q => q.category === cat.name).length
          }))
        );
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
      const boardPoints = (index + 1) * 100; // Both board and DB now use $100 increments
      const question = questionsData.find(q => 
        q.category === category.name && q.points === boardPoints
      );
      
      const questionObj = {
        id: question?.id || `${category.id}-${boardPoints}`,
        points: boardPoints,
        isAnswered: question ? answeredQuestions.has(question.id) : false,
        hasQuestion: !!question
      };
      
      console.log(`🎲 Question for ${category.name} $${boardPoints}:`, {
        found: !!question,
        questionId: question?.id,
        isAnswered: questionObj.isAnswered
      });
      
      return questionObj;
    })
  }));

  // Add debug logging for empty boards
  if (gameBoardCategories.length > 0) {
    const totalQuestions = gameBoardCategories.reduce((sum, cat) => sum + cat.questions.filter(q => q.hasQuestion).length, 0);
    console.log('🎮 GameBoard data:', {
      categories: gameBoardCategories.length,
      totalQuestions,
      questionsPerCategory: gameBoardCategories.map(cat => ({
        name: cat.name,
        questions: cat.questions.filter(q => q.hasQuestion).length
      }))
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="p-4 border-b border-white/20">
        <div className="max-w-6xl mx-auto">
          {/* Mobile-first layout: stack vertically on mobile, horizontal on larger screens */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Game Controls */}
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
                <h1 className="text-lg sm:text-xl font-bold">Room: {currentRoom?.room_code || roomDetails?.room_code}</h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  {isMyTurn ? (
                    <p className="text-green-400 flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4" />
                      Your turn - Select a question
                    </p>
                  ) : (
                    <p className="text-yellow-400 text-sm">
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
            
            {/* Live Scores - Centered on mobile, right-aligned on desktop */}
            <div className="w-full lg:w-auto flex justify-center lg:justify-end">
              <div className="bg-white/5 rounded-lg p-3 sm:p-4 border border-white/10 w-full sm:w-auto max-w-2xl">
                <h3 className="text-white font-semibold mb-3 text-center text-sm sm:text-base">Live Scores</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-2 sm:gap-3 justify-center">
                  {(players.length > 0 ? players : contextPlayers).map((player) => {
                    // Use live scores from gameState, fallback to player.score
                    const currentScore = gameState?.scores?.[player.user_id] ?? player.score ?? 0;
                    const isCurrentTurn = gameState?.currentTurn === player.user_id;
                    
                    console.log(`🎯 Player ${player.player_name} score:`, {
                      gameStateScore: gameState?.scores?.[player.user_id],
                      playerScore: player.score,
                      finalScore: currentScore,
                      isCurrentTurn
                    });
                    
                    return (
                      <Card 
                        key={player.id || player.user_id} 
                        className={`${
                          isCurrentTurn 
                            ? 'bg-yellow-500/20 border-yellow-400/50 ring-2 ring-yellow-400/30' 
                            : 'bg-white/10 border-white/20'
                        } transition-all duration-300 w-full sm:w-auto`}
                      >
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex flex-col items-center gap-2 text-white min-w-0 sm:min-w-[100px] lg:min-w-[120px]">
                            <div className="flex items-center gap-2">
                              {player.is_host && <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />}
                              <span className="font-medium text-xs sm:text-sm text-center truncate max-w-[120px]">
                                {player.player_name}
                              </span>
                            </div>
                            <Badge 
                              variant="secondary" 
                              className={`text-sm sm:text-lg px-2 sm:px-3 py-1 font-bold ${
                                isCurrentTurn ? 'bg-yellow-400 text-black' : 'bg-blue-500 text-white'
                              }`}
                            >
                              ${currentScore.toLocaleString()}
                            </Badge>
                            {isCurrentTurn && (
                              <div className="flex items-center gap-1 text-xs text-yellow-300">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                Your Turn
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
                
                {/* Debug info */}
                {players.length === 0 && contextPlayers.length === 0 && (
                  <div className="text-center text-yellow-400 text-sm mt-2">
                    Loading players...
                  </div>
                )}
              </div>
            </div>
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