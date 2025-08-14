import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface Question {
  id: string;
  text: string;
  explanation: string | null;
  historical_context: string | null;
  points: number;
  image_url: string | null;
  category_id: string;
}

interface QuestionOption {
  id: string;
  text: string;
  option_type: string;
  question_id: string;
}

export const useRealtimeQuestions = (questionIds: string[] = []) => {
  const [updatedQuestions, setUpdatedQuestions] = useState<{ [key: string]: Question }>({});
  const [updatedOptions, setUpdatedOptions] = useState<{ [key: string]: QuestionOption[] }>({});
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    if (questionIds.length === 0) return;

    console.log('Setting up realtime subscription for questions:', questionIds);

    // Create a channel for realtime updates
    const realtimeChannel = supabase
      .channel('quiz-question-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'questions',
          filter: `id=in.(${questionIds.join(',')})`
        },
        (payload) => {
          console.log('Question updated:', payload);
          const question = payload.new as Question;
          setUpdatedQuestions(prev => ({
            ...prev,
            [question.id]: question
          }));
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'question_options'
        },
        (payload) => {
          console.log('Question options changed:', payload);
          const option = payload.new as QuestionOption;
          
          // Only process if this option belongs to one of our tracked questions
          if (option && questionIds.includes(option.question_id)) {
            if (payload.eventType === 'DELETE') {
              // Handle deletion
              setUpdatedOptions(prev => ({
                ...prev,
                [option.question_id]: prev[option.question_id]?.filter(opt => opt.id !== payload.old.id) || []
              }));
            } else {
              // Handle insert/update - reload all options for this question
              loadOptionsForQuestion(option.question_id);
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    setChannel(realtimeChannel);

    return () => {
      console.log('Cleaning up realtime subscription');
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, [questionIds.join(',')]);

  const loadOptionsForQuestion = async (questionId: string) => {
    try {
      const { data: options, error } = await supabase
        .from('question_options')
        .select('*')
        .eq('question_id', questionId)
        .order('created_at');

      if (error) throw error;

      setUpdatedOptions(prev => ({
        ...prev,
        [questionId]: options || []
      }));
    } catch (error) {
      console.error('Error loading options for question:', questionId, error);
    }
  };

  const getQuestion = (questionId: string, originalQuestion: Question): Question => {
    return updatedQuestions[questionId] || originalQuestion;
  };

  const getOptions = (questionId: string, originalOptions: QuestionOption[]): QuestionOption[] => {
    return updatedOptions[questionId] || originalOptions;
  };

  return {
    getQuestion,
    getOptions,
    hasUpdates: Object.keys(updatedQuestions).length > 0 || Object.keys(updatedOptions).length > 0
  };
};