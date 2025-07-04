
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

// Mock clients database
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
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Check for existing session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (currentSession?.user) {
          console.log('Found existing Supabase session:', currentSession.user.email);
          setSession(currentSession);
          setUser(currentSession.user);
          
          // Try to match with mock client
          const foundClient = mockClients.find(
            c => c.email.toLowerCase() === currentSession.user.email?.toLowerCase()
          );
          
          if (foundClient) {
            const { password: _, ...clientWithoutPassword } = foundClient;
            setClient(clientWithoutPassword);
            setIsAuthenticated(true);
          }
        } else {
          // Check localStorage for mock client session
          const storedClient = localStorage.getItem('ascalate_client');
          if (storedClient) {
            console.log('Found stored client session');
            const parsedClient = JSON.parse(storedClient);
            setClient(parsedClient);
            setIsAuthenticated(true);
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
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event, session?.user?.email);
        
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
          setClient(null);
          setIsAuthenticated(false);
          localStorage.removeItem('ascalate_client');
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
  
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // First try Supabase auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (data.user && !error) {
        console.log('Supabase login successful');
        return true;
      }

      // If Supabase auth fails, try mock clients
      const foundClient = mockClients.find(
        (c) => c.email.toLowerCase() === email.toLowerCase() && c.password === password
      );
      
      if (foundClient) {
        console.log('Mock client login successful');
        const { password: _, ...clientWithoutPassword } = foundClient;
        setClient(clientWithoutPassword);
        setIsAuthenticated(true);
        setLoading(false);
        localStorage.setItem('ascalate_client', JSON.stringify(clientWithoutPassword));
        return true;
      }
      
      setLoading(false);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
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
