import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BoardState {
  answeredQuestions: string[];
  selectedQuestions: string[];
  boardData: any[];
}

export const useRealtimeBoardState = (roomId: string | null) => {
  const [boardState, setBoardState] = useState<BoardState>({
    answeredQuestions: [],
    selectedQuestions: [],
    boardData: []
  });

  // Subscribe to board state changes
  useEffect(() => {
    if (!roomId) return;

    console.log('Setting up board state listeners for room:', roomId);

    const boardChannel = supabase
      .channel(`board-state-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'game_room_questions',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          console.log('Question state inserted:', payload);
          if (payload.new.is_answered) {
            setBoardState(prev => ({
              ...prev,
              answeredQuestions: [...prev.answeredQuestions, payload.new.question_id]
            }));
          } else {
            setBoardState(prev => ({
              ...prev,
              selectedQuestions: [...prev.selectedQuestions, payload.new.question_id]
            }));
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'game_room_questions',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          console.log('Question state updated:', payload);
          if (payload.new.is_answered && !payload.old.is_answered) {
            setBoardState(prev => ({
              ...prev,
              answeredQuestions: [...prev.answeredQuestions, payload.new.question_id],
              selectedQuestions: prev.selectedQuestions.filter(id => id !== payload.new.question_id)
            }));
          }
        }
      )
      .on('broadcast', { event: 'board_refresh' }, () => {
        console.log('Board refresh requested');
        // Trigger a board data refresh
        refreshBoardState();
      })
      .subscribe((status) => {
        console.log('Board channel subscription status:', status);
      });

    // Initial load of board state
    refreshBoardState();

    return () => {
      supabase.removeChannel(boardChannel);
    };
  }, [roomId]);

  const refreshBoardState = async () => {
    if (!roomId) return;

    try {
      const { data: questionsData } = await supabase
        .from('game_room_questions')
        .select('question_id, is_answered')
        .eq('room_id', roomId);

      if (questionsData) {
        const answered = questionsData
          .filter(q => q.is_answered)
          .map(q => q.question_id);
        
        const selected = questionsData
          .filter(q => !q.is_answered)
          .map(q => q.question_id);

        setBoardState(prev => ({
          ...prev,
          answeredQuestions: answered,
          selectedQuestions: selected
        }));
      }
    } catch (error) {
      console.error('Failed to refresh board state:', error);
    }
  };

  const broadcastBoardRefresh = async () => {
    if (!roomId) return;

    const channel = supabase.channel(`board-state-${roomId}`);
    await channel.send({
      type: 'broadcast',
      event: 'board_refresh',
      payload: {}
    });
  };

  return {
    boardState,
    refreshBoardState,
    broadcastBoardRefresh
  };
};