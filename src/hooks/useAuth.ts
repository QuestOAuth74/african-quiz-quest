import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    // Check if there's actually a session to sign out from
    if (!session) {
      // User is already signed out, no need to do anything
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signOut();
      
      // Don't manually update state here - let onAuthStateChange handle it
      // Only return actual errors that need user attention
      if (error && error.message !== 'Session not found') {
        return { error };
      }
      
      // Treat "session not found" as success since user is effectively signed out
      return { error: null };
    } catch (error) {
      // Handle unexpected errors
      return { error: error as any };
    }
  };

  return {
    user,
    session,
    loading,
    signOut,
    isAuthenticated: !!user
  };
};