import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CrosswordGameState } from '@/types/crossword';

export const useCrosswordGameState = (userId: string | undefined) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const saveGameState = useCallback(async (
    puzzleId: string,
    gameState: CrosswordGameState
  ) => {
    if (!userId) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('crossword_game_states')
        .upsert({
          user_id: userId,
          puzzle_id: puzzleId,
          game_state: gameState as any,
          time_elapsed: gameState.timeElapsed,
          score: gameState.score,
          hints_used: gameState.hintsUsed,
          is_completed: gameState.isCompleted
        });

      if (error) throw error;

      toast({
        title: "Game Saved",
        description: "Your progress has been saved",
      });
    } catch (error) {
      console.error('Error saving game state:', error);
      toast({
        title: "Save Failed",
        description: "Could not save your progress",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  }, [userId, toast]);

  const loadGameState = useCallback(async (puzzleId: string) => {
    if (!userId) return null;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('crossword_game_states')
        .select('*')
        .eq('user_id', userId)
        .eq('puzzle_id', puzzleId)
        .eq('is_completed', false)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error loading game state:', error);
      toast({
        title: "Load Failed",
        description: "Could not load saved progress",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userId, toast]);

  const getSavedGames = useCallback(async () => {
    if (!userId) return [];

    try {
      const { data, error } = await supabase
        .from('crossword_game_states')
        .select(`
          *,
          crossword_puzzles!inner(
            id,
            title,
            category,
            difficulty
          )
        `)
        .eq('user_id', userId)
        .eq('is_completed', false)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting saved games:', error);
      return [];
    }
  }, [userId]);

  const deleteSavedGame = useCallback(async (puzzleId: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('crossword_game_states')
        .delete()
        .eq('user_id', userId)
        .eq('puzzle_id', puzzleId);

      if (error) throw error;

      toast({
        title: "Game Deleted",
        description: "Saved progress has been removed",
      });
    } catch (error) {
      console.error('Error deleting game state:', error);
      toast({
        title: "Delete Failed",
        description: "Could not delete saved progress",
        variant: "destructive"
      });
    }
  }, [userId, toast]);

  return {
    saveGameState,
    loadGameState,
    getSavedGames,
    deleteSavedGame,
    isSaving,
    isLoading
  };
};