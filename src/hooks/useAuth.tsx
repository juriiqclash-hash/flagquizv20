import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { saveAccount, clearOldAccounts } from '@/lib/accountManager';

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
      (event, session) => {
        (async () => {
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

            // Save account and check subscription
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('username')
                .eq('user_id', session.user.id)
                .single();

              const { data: subscriptionData } = await supabase
                .from('subscriptions')
                .select('plan')
                .eq('user_id', session.user.id)
                .single();

              const isPremium = subscriptionData?.plan === 'premium' || subscriptionData?.plan === 'ultimate';
              const username = profile?.username || session.user.email?.split('@')[0] || 'User';

              const result = saveAccount(session.user.id, session.user.email || '', username, isPremium);

              if (!result.success && result.message) {
                console.warn(result.message);
              }

              clearOldAccounts(isPremium);
            } catch (error) {
              console.error('Error saving account:', error);
            }
          }
        })();
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

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