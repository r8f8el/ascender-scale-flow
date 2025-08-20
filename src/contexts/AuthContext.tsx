
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Client {
  id: string;
  name: string;
  email: string;
  company?: string;
  cnpj?: string;
  is_primary_contact?: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  client: Client | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, userData?: any) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchClientProfile = async (userId: string) => {
    try {
      console.log('👤 Buscando perfil do cliente para userId:', userId);
      
      // First check if user is admin
      const { data: adminData, error: adminError } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (adminData && !adminError) {
        console.log('✅ User is ADMIN:', adminData);
        return null; // Admin users don't need client profile
      }

      // If not admin, fetch client profile
      const { data, error } = await supabase
        .from('client_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('❌ Error fetching client profile:', error);
        // Don't throw error, just return null to allow app to continue
        return null;
      }

      if (!data) {
        console.log('⚠️ No client profile found, creating basic client profile');
        // Create a basic client profile if none exists
        const userEmail = session?.user?.email;
        if (userEmail) {
          const { data: newProfile, error: createError } = await supabase
            .from('client_profiles')
            .insert({
              id: userId,
              name: userEmail.split('@')[0],
              email: userEmail,
              is_primary_contact: true
            })
            .select()
            .single();

          if (createError) {
            console.error('❌ Error creating client profile:', createError);
            return null;
          }

          console.log('✅ Created new CLIENT profile:', newProfile);
          return newProfile;
        }
        return null;
      }

      console.log('✅ Found existing CLIENT profile:', data);
      return data;
    } catch (error) {
      console.error('❌ Exception in fetchClientProfile:', error);
      return null;
    }
  };

  useEffect(() => {
    console.log('🔄 Setting up auth state listener');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('📡 Auth state change:', event, 'User ID:', session?.user?.id);
        
        try {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            // Use setTimeout to prevent blocking the auth state change
            setTimeout(async () => {
              try {
                const profile = await fetchClientProfile(session.user.id);
                setClient(profile);
              } catch (error) {
                console.error('❌ Error fetching profile in timeout:', error);
                setClient(null);
              }
            }, 0);
          } else {
            setClient(null);
          }
        } catch (error) {
          console.error('❌ Error in auth state change handler:', error);
          setClient(null);
        } finally {
          setLoading(false);
        }
      }
    );

    // Check for existing session
    const checkInitialSession = async () => {
      try {
        console.log('🔍 Checking initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('❌ Error getting initial session:', error);
        } else {
          console.log('🔍 Initial session check:', session?.user?.id);
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            try {
              const profile = await fetchClientProfile(session.user.id);
              setClient(profile);
            } catch (error) {
              console.error('❌ Error fetching profile in initial check:', error);
              setClient(null);
            }
          }
        }
      } catch (error) {
        console.error('❌ Error in checkInitialSession:', error);
      } finally {
        setLoading(false);
      }
    };

    checkInitialSession();

    return () => {
      console.log('🧹 Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Attempting login for:', email);
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Login error:', error);
        toast.error('Erro ao fazer login: ' + error.message);
        return { error };
      }

      if (data.user) {
        console.log('✅ Login successful for user:', data.user.id);
        // Profile will be fetched by the auth state change listener
        toast.success('Login realizado com sucesso!');
      }

      return { error: null };
    } catch (error: any) {
      console.error('❌ Login exception:', error);
      toast.error('Erro inesperado ao fazer login');
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, userData?: any) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/cliente`,
          data: userData || {}
        }
      });

      if (error) {
        console.error('❌ Signup error:', error);
        toast.error('Erro ao criar conta: ' + error.message);
        return { error };
      }

      if (data.user && !data.user.email_confirmed_at) {
        toast.success('Conta criada! Verifique seu email para confirmar.');
      }

      return { error: null };
    } catch (error: any) {
      console.error('❌ Signup exception:', error);
      toast.error('Erro inesperado ao criar conta');
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('👋 Attempting logout');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Logout error:', error);
        toast.error('Erro ao fazer logout');
      } else {
        console.log('✅ Logout successful');
        setUser(null);
        setSession(null);
        setClient(null);
        toast.success('Logout realizado com sucesso!');
      }
    } catch (error) {
      console.error('❌ Logout exception:', error);
      toast.error('Erro inesperado ao fazer logout');
    }
  };

  const value = {
    user,
    session,
    client,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    signup,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
