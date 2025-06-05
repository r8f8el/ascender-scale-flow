
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ClientUser } from '../types/database';

interface Client {
  id: string;
  name: string;
  email: string;
  company?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  client: Client | null;
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  signUp: (email: string, password: string, name: string, company?: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  client: null,
  user: null,
  session: null,
  loading: true,
  login: async () => ({ success: false }),
  logout: async () => {},
  signUp: async () => ({ success: false }),
});

export const useAuth = () => useContext(AuthContext);

const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [client, setClient] = useState<Client | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // Function to fetch client profile from Supabase
  const fetchClientProfile = async (userId: string): Promise<ClientUser | null> => {
    try {
      const { data, error } = await (supabase as any)
        .from('client_users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching client profile:', error);
        return null;
      }

      return data as ClientUser;
    } catch (error) {
      console.error('Error fetching client profile:', error);
      return null;
    }
  };

  // Set up auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch client profile
          const clientProfile = await fetchClientProfile(session.user.id);
          if (clientProfile) {
            setClient({
              id: clientProfile.id,
              name: clientProfile.name,
              email: clientProfile.email,
              company: clientProfile.company
            });
            setIsAuthenticated(true);
          } else {
            setClient(null);
            setIsAuthenticated(false);
          }
        } else {
          setClient(null);
          setIsAuthenticated(false);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        setUser(session.user);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) {
        console.error('Login error:', error);
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Check if user is a client
        const clientProfile = await fetchClientProfile(data.user.id);
        if (!clientProfile) {
          await supabase.auth.signOut();
          return { success: false, error: 'Acesso não autorizado. Esta conta não está registrada como cliente.' };
        }
      }

      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, error: 'Erro interno. Tente novamente.' };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string, company?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: {
            name: name.trim(),
            company: company?.trim()
          },
          emailRedirectTo: `${window.location.origin}/cliente`
        }
      });

      if (error) {
        console.error('Signup error:', error);
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Create client profile
        const { error: clientError } = await (supabase as any)
          .from('client_users')
          .insert({
            id: data.user.id,
            name: name.trim(),
            email: email.toLowerCase().trim(),
            company: company?.trim()
          });

        if (clientError) {
          console.error('Error creating client profile:', clientError);
          return { success: false, error: 'Erro ao criar perfil do cliente.' };
        }
      }

      return { success: true };
    } catch (error: any) {
      console.error('Signup error:', error);
      return { success: false, error: 'Erro interno. Tente novamente.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setClient(null);
      setUser(null);
      setSession(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Erro ao sair",
        description: "Ocorreu um erro ao fazer logout. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      client, 
      user, 
      session, 
      loading, 
      login, 
      logout, 
      signUp 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
