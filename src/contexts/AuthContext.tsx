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
      // First check if user is admin
      const { data: adminData, error: adminError } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (adminData && !adminError) {
        console.log('✅ User is ADMIN:', adminData);
        return null; // Admin users don't need client profile
      }

      // If not admin, fetch client profile
      const { data, error } = await supabase
        .from('client_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching client profile:', error);
        return null;
      }

      console.log('✅ User is CLIENT:', data);
      return data;
    } catch (error) {
      console.error('Error in fetchClientProfile:', error);
      return null;
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Check if admin profile exists and create if needed
          setTimeout(async () => {
            // Check if user is admin by email
            if (session.user.email?.includes('@ascalate.com.br')) {
              console.log('🔧 Creating admin profile for:', session.user.email);
              
              // Try to create admin profile
              const { data: adminData, error: adminError } = await supabase
                .from('admin_profiles')
                .upsert({
                  id: session.user.id,
                  name: session.user.email.split('@')[0],
                  email: session.user.email,
                  role: session.user.email === 'rafael.gontijo@ascalate.com.br' ? 'super_admin' : 'admin'
                }, { onConflict: 'id' })
                .select()
                .single();
              
              console.log('✅ Admin profile created/updated:', adminData);
              setClient(null); // Admin users don't need client profile
            } else {
              // Fetch client profile for non-admin users
              const profile = await fetchClientProfile(session.user.id);
              setClient(profile);
            }
          }, 0);
        } else {
          setClient(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchClientProfile(session.user.id).then(setClient);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        toast.error('Erro ao fazer login: ' + error.message);
        return { error };
      }

      if (data.user) {
        const profile = await fetchClientProfile(data.user.id);
        setClient(profile);
        toast.success('Login realizado com sucesso!');
      }

      return { error: null };
    } catch (error: any) {
      console.error('Login exception:', error);
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
          emailRedirectTo: `${window.location.origin}/cliente/login`,
          data: userData || {}
        }
      });

      if (error) {
        console.error('Signup error:', error);
        toast.error('Erro ao criar conta: ' + error.message);
        return { error };
      }

      if (data.user && !data.user.email_confirmed_at) {
        toast.success('Conta criada! Verifique seu email para confirmar.');
      }

      return { error: null };
    } catch (error: any) {
      console.error('Signup exception:', error);
      toast.error('Erro inesperado ao criar conta');
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        toast.error('Erro ao fazer logout');
      } else {
        setUser(null);
        setSession(null);
        setClient(null);
        toast.success('Logout realizado com sucesso!');
      }
    } catch (error) {
      console.error('Logout exception:', error);
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
