import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, signIn, signUp, signOut as supabaseSignOut, getCurrentUser } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  userMetadata: { full_name?: string; role?: 'student' | 'teacher' } | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role: 'student' | 'teacher') => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userMetadata, setUserMetadata] = useState<{ full_name?: string; role?: 'student' | 'teacher' } | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check for current user on mount
    const getUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser || null);
        setUserMetadata(currentUser?.user_metadata || null);
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        setUser(session?.user || null);
        setUserMetadata(session?.user?.user_metadata || null);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserMetadata(null);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const data = await signIn(email, password);
      setUser(data.user);
      setUserMetadata(data.user?.user_metadata || null);
      
      toast({
        title: 'Sign in successful',
        description: 'Welcome back!'
      });

      // Redirect based on role
      if (data.user?.user_metadata?.role === 'teacher') {
        navigate('/teacher-dashboard');
      } else if (data.user?.user_metadata?.role === 'student') {
        navigate('/student-dashboard');
      } else {
        navigate('/');
      }
    } catch (error: any) {
      toast({
        title: 'Sign in failed',
        description: error.message || 'An error occurred during sign in',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (email: string, password: string, fullName: string, role: 'student' | 'teacher') => {
    try {
      setLoading(true);
      await signUp(email, password, fullName, role);
      
      toast({
        title: 'Sign up successful',
        description: 'Check your email to confirm your account'
      });
      
      // We don't navigate here as user needs to confirm email first
    } catch (error: any) {
      toast({
        title: 'Sign up failed',
        description: error.message || 'An error occurred during sign up',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await supabaseSignOut();
      setUser(null);
      setUserMetadata(null);
      
      toast({
        title: 'Signed out',
        description: 'You have been signed out successfully'
      });
      
      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Sign out failed',
        description: error.message || 'An error occurred during sign out',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userMetadata,
        loading,
        signIn: handleSignIn,
        signUp: handleSignUp,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 