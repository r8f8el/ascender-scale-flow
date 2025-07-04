
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
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  client: null,
  user: null,
  session: null,
  login: async () => false,
  logout: () => {},
  loading: true,
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
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Try to find client in mock data based on email
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
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session);
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
      } else {
        // Check localStorage for stored client info
        const storedClient = localStorage.getItem('ascalate_client');
        if (storedClient) {
          const parsedClient = JSON.parse(storedClient);
          setClient(parsedClient);
          setIsAuthenticated(true);
        }
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);
  
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // First try Supabase auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (data.user && !error) {
        // User authenticated with Supabase
        return true;
      }

      // If Supabase auth fails, try mock clients
      const foundClient = mockClients.find(
        (c) => c.email.toLowerCase() === email.toLowerCase() && c.password === password
      );
      
      if (foundClient) {
        const { password: _, ...clientWithoutPassword } = foundClient;
        setClient(clientWithoutPassword);
        setIsAuthenticated(true);
        localStorage.setItem('ascalate_client', JSON.stringify(clientWithoutPassword));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
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
    localStorage.removeItem('ascalate_client');
  };
  
  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      client, 
      user, 
      session, 
      login, 
      logout, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
