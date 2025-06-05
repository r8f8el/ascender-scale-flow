
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
      (event, session) => {
        setSession(session);
        
        if (session?.user) {
          // Check if user is a client (not admin) - defer Supabase calls
          if (!session.user.email?.includes('@ascalate.com.br')) {
            setTimeout(() => {
              fetchClientProfile(session.user.id);
            }, 0);
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
        setSession(session);
        if (session.user && !session.user.email?.includes('@ascalate.com.br')) {
          fetchClientProfile(session.user.id);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchClientProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('client_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching client profile:', error);
        return;
      }

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
  };
  
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Input validation
      if (!email || !password) {
        return false;
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return false;
      }

      // Check if it's a client email (not admin)
      if (email.includes('@ascalate.com.br')) {
        return false; // Admin emails should not login through client portal
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      
      if (error) {
        return false;
      }
      
      return !!data.user;
    } catch (error) {
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
