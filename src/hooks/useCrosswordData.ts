import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CrosswordWordData } from '@/types/crossword';

export const useCrosswordData = () => {
  const [words, setWords] = useState<CrosswordWordData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usedWordIds, setUsedWordIds] = useState<Set<string>>(new Set());

  const loadWords = async (category?: string, excludeUsed: boolean = true) => {
    try {
      setLoading(true);
      
      // Load used words for current user if excluding used words
      let usedIds = new Set<string>();
      if (excludeUsed) {
        const { data: usedData } = await supabase
          .from('crossword_word_usage')
          .select('word_id');
        
        if (usedData) {
          usedIds = new Set(usedData.map(item => item.word_id));
          setUsedWordIds(usedIds);
        }
      }

      let query = supabase
        .from('crossword_words')
        .select('*')
        .eq('is_active', true);

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      // If excluding used words, filter them out
      if (excludeUsed && usedIds.size > 0) {
        query = query.not('id', 'in', `(${Array.from(usedIds).join(',')})`);
      }

      const { data, error } = await query.order('word');

      if (error) throw error;

      setWords(data || []);
      setError(null);
    } catch (err) {
      console.error('Error loading crossword words:', err);
      setError('Failed to load crossword words');
    } finally {
      setLoading(false);
    }
  };

  const trackWordUsage = async (wordIds: string[], puzzleId?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const usageRecords = wordIds.map(wordId => ({
        user_id: user.id,
        word_id: wordId,
        puzzle_id: puzzleId
      }));

      const { error } = await supabase
        .from('crossword_word_usage')
        .insert(usageRecords);

      if (error) throw error;

      // Update local used words set
      setUsedWordIds(prev => new Set([...prev, ...wordIds]));
    } catch (error) {
      console.error('Error tracking word usage:', error);
    }
  };

  const checkFeatureEnabled = async (): Promise<boolean> => {
    try {
      const { data } = await supabase
        .from('feature_flags')
        .select('enabled_for_public, enabled_for_admins')
        .eq('feature_name', 'crossword_puzzle')
        .single();

      return data?.enabled_for_public || data?.enabled_for_admins || false;
    } catch (error) {
      console.error('Error checking feature flag:', error);
      return false;
    }
  };

  const getCategories = (): string[] => {
    return [...new Set(words.map(word => word.category))];
  };

  useEffect(() => {
    loadWords();
  }, []);

  return {
    words,
    loading,
    error,
    usedWordIds,
    loadWords,
    checkFeatureEnabled,
    getCategories,
    trackWordUsage
  };
};