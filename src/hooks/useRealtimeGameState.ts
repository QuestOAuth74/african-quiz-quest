import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface GameState {
  currentTurn: string;
  currentQuestion: any;
  players: any[];
  gameStatus: 'waiting' | 'playing' | 'finished';
  scores: Record<string, number>;
  answeredQuestions: string[];
}

export const useRealtimeGameState = (roomId: string | null) => {
  const { user } = useAuth();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');

  // Initialize game state when room is loaded
  useEffect(() => {
    if (!roomId || !user) return;
    
    const initializeGameState = async () => {
      setLoading(true);
      try {
        // Fetch current room data
        const { data: roomData } = await supabase
          .from('game_rooms')
          .select('*')
          .eq('id', roomId)
          .single();

        // Fetch players
        const { data: playersData } = await supabase
          .from('game_room_players')
          .select('*')
          .eq('room_id', roomId);

        // Fetch answered questions
        const { data: answeredQuestionsData } = await supabase
          .from('game_room_questions')
          .select('question_id')
          .eq('room_id', roomId)
          .eq('is_answered', true);

        if (roomData && playersData) {
          const scores = playersData.reduce((acc, player) => {
            acc[player.user_id] = player.score || 0;
            return acc;
          }, {} as Record<string, number>);

          const answeredQuestions = answeredQuestionsData?.map(q => q.question_id) || [];

          setGameState({
            currentTurn: roomData.current_turn_user_id || playersData[0]?.user_id || '',
            currentQuestion: null,
            players: playersData,
            gameStatus: roomData.status as 'waiting' | 'playing' | 'finished',
            scores,
            answeredQuestions
          });
        }
      } catch (error) {
        console.error('Failed to initialize game state:', error);
        toast.error('Failed to load game state');
      } finally {
        setLoading(false);
      }
    };

    initializeGameState();
  }, [roomId, user]);

  // Subscribe to real-time game state changes
  useEffect(() => {
    if (!roomId) return;

    setConnectionStatus('connecting');

    const gameChannel = supabase
      .channel(`game-state-${roomId}`)
      .on('broadcast', { event: 'game_update' }, (payload) => {
        console.log('Game state update received:', payload);
        setGameState(payload.payload);
      })
      .on('broadcast', { event: 'question_selected' }, (payload) => {
        console.log('Question selected:', payload);
        toast.info(`${payload.playerName} selected a question`);
      })
      .on('broadcast', { event: 'answer_submitted' }, (payload) => {
        console.log('Answer submitted:', payload);
        toast.info(`${payload.playerName} ${payload.isCorrect ? 'answered correctly' : 'answered incorrectly'}`);
        
        // Update local game state with new score
        setGameState(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            scores: {
              ...prev.scores,
              [payload.userId]: (prev.scores[payload.userId] || 0) + payload.points
            },
            answeredQuestions: [...prev.answeredQuestions, payload.questionId]
          };
        });
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'game_rooms',
        filter: `id=eq.${roomId}`
      }, (payload) => {
        console.log('Room updated:', payload);
        setGameState(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            gameStatus: payload.new.status,
            currentTurn: payload.new.current_turn_user_id || prev.currentTurn
          };
        });
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'game_room_players',
        filter: `room_id=eq.${roomId}`
      }, (payload) => {
        console.log('Player updated:', payload);
        setGameState(prev => {
          if (!prev) return prev;
          const updatedPlayers = prev.players.map(player => 
            player.user_id === payload.new.user_id 
              ? { ...player, score: payload.new.score }
              : player
          );
          const updatedScores = { ...prev.scores };
          updatedScores[payload.new.user_id] = payload.new.score;
          
          return {
            ...prev,
            players: updatedPlayers,
            scores: updatedScores
          };
        });
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'game_room_questions',
        filter: `room_id=eq.${roomId}`
      }, (payload) => {
        console.log('Question answered:', payload);
        if (payload.new.is_answered) {
          setGameState(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              answeredQuestions: [...prev.answeredQuestions, payload.new.question_id]
            };
          });
        }
      })
      .subscribe((status) => {
        console.log('Channel subscription status:', status);
        setConnectionStatus(status === 'SUBSCRIBED' ? 'connected' : 'disconnected');
      });

    return () => {
      supabase.removeChannel(gameChannel);
      setConnectionStatus('disconnected');
    };
  }, [roomId]);

  // Broadcast game state update
  const broadcastGameUpdate = useCallback(async (newGameState: GameState) => {
    if (!roomId) return;

    console.log('Broadcasting game state update:', newGameState);
    
    const channel = supabase.channel(`game-state-${roomId}`);
    await channel.send({
      type: 'broadcast',
      event: 'game_update',
      payload: newGameState
    });

    setGameState(newGameState);
  }, [roomId]);

  // Handle question selection
  const selectQuestion = useCallback(async (questionId: string, categoryId: string, points: number) => {
    if (!roomId || !user) return;

    try {
      // Record question selection in database
      const { error } = await supabase
        .from('game_room_questions')
        .insert({
          room_id: roomId,
          question_id: questionId,
          answered_by: null,
          is_answered: true
        });

      if (error) throw error;

      // Broadcast to other players
      const channel = supabase.channel(`game-state-${roomId}`);
      await channel.send({
        type: 'broadcast',
        event: 'question_selected',
        payload: {
          questionId,
          categoryId,
          points,
          playerName: user.email?.split('@')[0] || 'Player'
        }
      });

      return true;
    } catch (err: any) {
      toast.error('Failed to select question');
      return false;
    }
  }, [roomId, user]);

  // Handle answer submission
  const submitAnswer = useCallback(async (questionId: string, isCorrect: boolean, points: number) => {
    if (!roomId || !user) return;

    try {
      // Update question as answered
      const { error } = await supabase
        .from('game_room_questions')
        .update({
          answered_by: user.id,
          is_answered: true
        })
        .eq('room_id', roomId)
        .eq('question_id', questionId);

      if (error) throw error;

      // Update player score
      const scoreChange = isCorrect ? points : 0;
      
      // First get current score
      const { data: playerData } = await supabase
        .from('game_room_players')
        .select('score')
        .eq('room_id', roomId)
        .eq('user_id', user.id)
        .single();

      const newScore = (playerData?.score || 0) + scoreChange;
      
      const { error: playerError } = await supabase
        .from('game_room_players')
        .update({ score: newScore })
        .eq('room_id', roomId)
        .eq('user_id', user.id);

      if (playerError) throw playerError;

      // Broadcast answer result
      const channel = supabase.channel(`game-state-${roomId}`);
      await channel.send({
        type: 'broadcast',
        event: 'answer_submitted',
        payload: {
          questionId,
          isCorrect,
          points: scoreChange,
          playerName: user.email?.split('@')[0] || 'Player',
          userId: user.id
        }
      });

      return true;
    } catch (err: any) {
      toast.error('Failed to submit answer');
      return false;
    }
  }, [roomId, user]);

  // Get next turn player
  const nextTurn = useCallback(async () => {
    if (!roomId || !gameState) return;

    const currentPlayerIndex = gameState.players.findIndex(p => p.user_id === gameState.currentTurn);
    const nextPlayerIndex = (currentPlayerIndex + 1) % gameState.players.length;
    const nextPlayer = gameState.players[nextPlayerIndex];

    const updatedState = {
      ...gameState,
      currentTurn: nextPlayer.user_id
    };

    await broadcastGameUpdate(updatedState);
  }, [roomId, gameState, broadcastGameUpdate]);

  return {
    gameState,
    loading,
    selectQuestion,
    submitAnswer,
    nextTurn,
    broadcastGameUpdate,
    isMyTurn: gameState?.currentTurn === user?.id,
    connectionStatus,
    answeredQuestions: gameState?.answeredQuestions || []
  };
};