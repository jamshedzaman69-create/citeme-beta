import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  hasPremium: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const hasPremium = (() => {
    if (!profile) return false;
    const now = new Date();
    const isStripeActive = profile.subscription_status === 'active' && 
                           profile.current_period_end && 
                           new Date(profile.current_period_end) > now;
    const isTrialActive = profile.trial_ends_at && 
                          new Date(profile.trial_ends_at) > now;
    return !!(isStripeActive || isTrialActive);
  })();

  const loadProfile = async (userId: string, retryCount = 0) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      // If no profile yet, retry up to 3 times (waits for DB triggers)
      if (!data && retryCount < 3) {
        setTimeout(() => loadProfile(userId, retryCount + 1), 1000);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: { data: { full_name: fullName } } // Store in metadata too
      });

      if (error) throw error;

      if (data.user) {
        const newProfile: Profile = {
          id: data.user.id,
          email: data.user.email!,
          full_name: fullName,
          subscription_status: 'inactive',
          created_at: new Date().toISOString()
        };

        const { error: profileError } = await supabase.from('profiles').insert([newProfile]);
        if (profileError) throw profileError;

        // CRITICAL: Set state manually so PricingSection appears instantly
        setProfile(newProfile);
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    setUser(null);
    setProfile(null);
    setSession(null);
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, hasPremium, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// Ensure this is the only other export to keep Vite happy
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}