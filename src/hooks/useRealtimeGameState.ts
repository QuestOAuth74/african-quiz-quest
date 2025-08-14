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
}

export const useRealtimeGameState = (roomId: string | null) => {
  const { user } = useAuth();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(false);

  // Subscribe to real-time game state changes
  useEffect(() => {
    if (!roomId) return;

    const gameChannel = supabase
      .channel(`game-state-${roomId}`)
      .on('broadcast', { event: 'game_update' }, (payload) => {
        setGameState(payload.payload);
      })
      .on('broadcast', { event: 'question_selected' }, (payload) => {
        toast.info(`${payload.playerName} selected a question`);
      })
      .on('broadcast', { event: 'answer_submitted' }, (payload) => {
        toast.info(`${payload.playerName} answered the question`);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(gameChannel);
    };
  }, [roomId]);

  // Broadcast game state update
  const broadcastGameUpdate = useCallback(async (newGameState: GameState) => {
    if (!roomId) return;

    await supabase
      .channel(`game-state-${roomId}`)
      .send({
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
      await supabase
        .channel(`game-state-${roomId}`)
        .send({
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
      await supabase
        .channel(`game-state-${roomId}`)
        .send({
          type: 'broadcast',
          event: 'answer_submitted',
          payload: {
            questionId,
            isCorrect,
            points: scoreChange,
            playerName: user.email?.split('@')[0] || 'Player'
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
    isMyTurn: gameState?.currentTurn === user?.id
  };
};