import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  needsConsent: boolean;
  setNeedsConsent: (needs: boolean) => void;
  signUp: (email: string, password: string, username: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsConsent, setNeedsConsent] = useState(false);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Only show consent dialog for new signups
        if (event === 'SIGNED_IN' && session?.user) {
          const userConsent = localStorage.getItem(`flagquiz_consent_${session.user.id}`);

          // Check if this is a new user (no consent stored yet)
          if (!userConsent) {
            setNeedsConsent(true);
          }

          // Update streak on sign in
          await updateUserStreak(session.user.id);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Update streak on initial session check
      if (session?.user) {
        await updateUserStreak(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const updateUserStreak = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('current_streak, last_activity_date')
        .eq('user_id', userId)
        .single();

      if (!profile) return;

      const today = new Date().toISOString().split('T')[0];
      const lastActivity = profile.last_activity_date
        ? new Date(profile.last_activity_date).toISOString().split('T')[0]
        : null;

      let newStreak = profile.current_streak || 0;

      if (!lastActivity) {
        newStreak = 1;
      } else if (lastActivity === today) {
        return;
      } else {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastActivity === yesterdayStr) {
          newStreak = (profile.current_streak || 0) + 1;
        } else {
          newStreak = 1;
        }
      }

      await supabase
        .from('profiles')
        .update({
          current_streak: newStreak,
          last_activity_date: today
        })
        .eq('user_id', userId);
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          username: username
        }
      }
    });
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    needsConsent,
    setNeedsConsent,
    signUp,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};