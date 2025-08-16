import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RateLimitConfig {
  actionType: string;
  maxActions: number;
  timeWindowMinutes: number;
}

interface RateLimitState {
  isLimited: boolean;
  remainingActions: number;
  resetTime: number | null;
  loading: boolean;
}

const DEFAULT_CONFIGS: Record<string, RateLimitConfig> = {
  'question_create': { actionType: 'question_create', maxActions: 20, timeWindowMinutes: 5 },
  'question_update': { actionType: 'question_update', maxActions: 30, timeWindowMinutes: 5 },
  'question_delete': { actionType: 'question_delete', maxActions: 10, timeWindowMinutes: 5 },
  'category_create': { actionType: 'category_create', maxActions: 5, timeWindowMinutes: 5 },
  'category_update': { actionType: 'category_update', maxActions: 10, timeWindowMinutes: 5 },
  'category_delete': { actionType: 'category_delete', maxActions: 3, timeWindowMinutes: 5 },
  'blog_create': { actionType: 'blog_create', maxActions: 10, timeWindowMinutes: 5 },
  'blog_update': { actionType: 'blog_update', maxActions: 15, timeWindowMinutes: 5 },
  'blog_delete': { actionType: 'blog_delete', maxActions: 5, timeWindowMinutes: 5 },
  'user_moderate': { actionType: 'user_moderate', maxActions: 15, timeWindowMinutes: 5 },
  'bulk_operation': { actionType: 'bulk_operation', maxActions: 3, timeWindowMinutes: 10 },
};

export const useAdminRateLimit = (actionType: string) => {
  const [state, setState] = useState<RateLimitState>({
    isLimited: false,
    remainingActions: 0,
    resetTime: null,
    loading: false
  });

  const config = DEFAULT_CONFIGS[actionType] || DEFAULT_CONFIGS['question_create'];

  const checkRateLimit = useCallback(async (): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const { data, error } = await supabase.rpc('check_admin_rate_limit', {
        p_action_type: config.actionType,
        p_time_window_minutes: config.timeWindowMinutes,
        p_max_actions: config.maxActions
      });

      if (error) {
        console.error('Rate limit check failed:', error);
        setState(prev => ({ ...prev, loading: false }));
        return true; // Allow action on error to prevent blocking legitimate use
      }

      const canProceed = data as boolean;
      const isLimited = !canProceed;
      
      setState({
        isLimited,
        remainingActions: isLimited ? 0 : config.maxActions,
        resetTime: isLimited ? Date.now() + (config.timeWindowMinutes * 60 * 1000) : null,
        loading: false
      });

      return canProceed;
    } catch (error) {
      console.error('Rate limit check error:', error);
      setState(prev => ({ ...prev, loading: false }));
      return true; // Allow action on error
    }
  }, [config]);

  const logAction = useCallback(async (
    resourceType: string,
    resourceId?: string,
    payload?: any
  ) => {
    try {
      await supabase.rpc('log_admin_action', {
        p_action_type: config.actionType,
        p_resource_type: resourceType,
        p_resource_id: resourceId || null,
        p_request_payload: payload ? JSON.stringify(payload) : null
      });
    } catch (error) {
      console.error('Failed to log admin action:', error);
    }
  }, [config.actionType]);

  const executeWithRateLimit = useCallback(async <T>(
    action: () => Promise<T>,
    resourceType: string,
    resourceId?: string,
    payload?: any
  ): Promise<T | null> => {
    const canProceed = await checkRateLimit();
    
    if (!canProceed) {
      throw new Error(`Rate limit exceeded for ${actionType}. Please wait before trying again.`);
    }

    try {
      const result = await action();
      await logAction(resourceType, resourceId, payload);
      return result;
    } catch (error) {
      console.error(`Action ${actionType} failed:`, error);
      throw error;
    }
  }, [actionType, checkRateLimit, logAction]);

  return {
    ...state,
    checkRateLimit,
    logAction,
    executeWithRateLimit,
    config
  };
};