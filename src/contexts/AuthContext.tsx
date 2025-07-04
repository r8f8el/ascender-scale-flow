
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

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
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  client: null,
  user: null,
  session: null,
  login: async () => false,
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

// Mock clients database - in a real app, this would be fetched from a server
const mockClients = [
  { id: '1', name: 'Portobello', email: 'cliente@portobello.com.br', password: 'portobello123' },
  { id: '2', name: 'J.Assy', email: 'cliente@jassy.com.br', password: 'jassy123' },
];

const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [client, setClient] = useState<Client | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  
  // Check for existing session and set up auth state listener
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Find matching client based on email
          const foundClient = mockClients.find(
            c => c.email.toLowerCase() === session.user.email?.toLowerCase()
          );
          
          if (foundClient) {
            const { password: _, ...clientWithoutPassword } = foundClient;
            setClient(clientWithoutPassword);
            setIsAuthenticated(true);
            localStorage.setItem('ascalate_client', JSON.stringify(clientWithoutPassword));
          }
        } else {
          setClient(null);
          setIsAuthenticated(false);
          localStorage.removeItem('ascalate_client');
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Existing session:', session);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const foundClient = mockClients.find(
          c => c.email.toLowerCase() === session.user.email?.toLowerCase()
        );
        
        if (foundClient) {
          const { password: _, ...clientWithoutPassword } = foundClient;
          setClient(clientWithoutPassword);
          setIsAuthenticated(true);
          localStorage.setItem('ascalate_client', JSON.stringify(clientWithoutPassword));
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);
  
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Check against mock clients first
      const foundClient = mockClients.find(
        (c) => c.email.toLowerCase() === email.toLowerCase() && c.password === password
      );
      
      if (!foundClient) {
        return false;
      }

      // Sign in with Supabase to create session
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) {
        console.error('Supabase login error:', error);
        return false;
      }

      // The auth state change will handle setting the client data
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };
  
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      // The auth state change will handle clearing the state
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback to manual cleanup
      setClient(null);
      setUser(null);
      setSession(null);
      setIsAuthenticated(false);
      localStorage.removeItem('ascalate_client');
    }
  };
  
  return (
    <AuthContext.Provider value={{ isAuthenticated, client, user, session, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
