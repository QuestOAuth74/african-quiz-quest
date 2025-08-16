import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CrosswordWordData } from '@/types/crossword';

export const useCrosswordData = () => {
  const [words, setWords] = useState<CrosswordWordData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWords = async (category?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('crossword_words')
        .select('*')
        .eq('is_active', true);

      if (category && category !== 'all') {
        query = query.eq('category', category);
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
    loadWords,
    checkFeatureEnabled,
    getCategories
  };
};