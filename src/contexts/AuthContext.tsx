
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface Client {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  client: Client | null;
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string, companyData?: { company: string; cnpj: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  client: null,
  user: null,
  session: null,
  login: async () => false,
  signup: async () => ({ success: false }),
  logout: () => {},
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [client, setClient] = useState<Client | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    let mounted = true;
    let profileLoaded = false;

    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        // Get current session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (currentSession?.user) {
          console.log('Found existing session:', currentSession.user.email);
          setSession(currentSession);
          setUser(currentSession.user);
          setIsAuthenticated(true);
          
          // Load client profile only once
          if (!profileLoaded) {
            profileLoaded = true;
            await loadClientProfile(currentSession.user);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setIsAuthenticated(true);
          // Load profile only if not already loaded and avoid infinite loops
          if (!profileLoaded && event === 'SIGNED_IN') {
            profileLoaded = true;
            setTimeout(() => {
              if (mounted) {
                loadClientProfile(session.user);
              }
            }, 100);
          }
        } else {
          setIsAuthenticated(false);
          setClient(null);
          profileLoaded = false;
        }
        
        setLoading(false);
      }
    );

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadClientProfile = async (user: User) => {
    try {
      // Não criar perfil de cliente para e-mails de admin
      if (user.email?.endsWith('@ascalate.com.br')) {
        console.log('Admin user detected, skipping client profile creation');
        return;
      }

      // Buscar perfil existente sem criar automaticamente
      const { data: profile, error } = await supabase
        .from('client_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading client profile:', error);
        // Se for erro de política, não tentar criar perfil
        if (error.code === '42P17') {
          console.warn('Database policy issue, using fallback client data');
          setClient({
            id: user.id,
            name: (user.user_metadata as any)?.name || user.email?.split('@')[0] || 'Cliente',
            email: user.email || '',
          });
        }
        return;
      }

      if (profile) {
        setClient({
          id: profile.id,
          name: profile.name,
          email: profile.email,
        });
        console.log('Client profile loaded successfully:', profile.name);
      } else {
        // Usar dados do user metadata como fallback
        setClient({
          id: user.id,
          name: (user.user_metadata as any)?.name || user.email?.split('@')[0] || 'Cliente',
          email: user.email || '',
        });
        console.log('Using fallback client data from user metadata');
      }
    } catch (error) {
      console.error('Error loading client profile:', error);
      // Fallback para dados básicos do usuário
      setClient({
        id: user.id,
        name: (user.user_metadata as any)?.name || user.email?.split('@')[0] || 'Cliente',
        email: user.email || '',
      });
    }
  };
  
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        return false;
      }

      if (data.user) {
        console.log('Login successful');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string, companyData?: { company: string; cnpj: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/cliente`,
          data: {
            name: name,
            company: companyData?.company,
            cnpj: companyData?.cnpj
          }
        }
      });

      if (error) {
        console.error('Signup error:', error);
        return { success: false, error: error.message };
      }

      if (data.user) {
        console.log('Signup successful:', data.user.email);
        return { success: true };
      }
      
      return { success: false, error: 'Erro inesperado' };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Erro inesperado' };
    } finally {
      setLoading(false);
    }
  };
  
  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    setClient(null);
    setUser(null);
    setSession(null);
    setIsAuthenticated(false);
  };
  
  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      client, 
      user, 
      session, 
      login,
      signup,
      logout, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
