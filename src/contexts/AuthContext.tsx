
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

interface Client {
  id: string;
  name: string;
  email: string;
  company?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  client: Client | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  client: null,
  session: null,
  login: async () => false,
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [client, setClient] = useState<Client | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        
        if (session?.user) {
          // Check if user is a client (not admin)
          if (!session.user.email?.includes('@ascalate.com.br')) {
            try {
              const { data: profile } = await supabase
                .from('client_profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
              
              if (profile) {
                setClient({
                  id: profile.id,
                  name: profile.name,
                  email: profile.email,
                  company: profile.company
                });
                setIsAuthenticated(true);
              }
            } catch (error) {
              console.error('Error fetching client profile:', error);
            }
          }
        } else {
          setClient(null);
          setIsAuthenticated(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        console.log('Existing session found:', session.user?.email);
        setSession(session);
      }
    });

    return () => subscription.unsubscribe();
  }, []);
  
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Check if it's a client email (not admin)
      if (email.includes('@ascalate.com.br')) {
        return false; // Admin emails should not login through client portal
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Login error:', error.message);
        return false;
      }
      
      return !!data.user;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };
  
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setClient(null);
      setIsAuthenticated(false);
      setSession(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  return (
    <AuthContext.Provider value={{ isAuthenticated, client, session, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
