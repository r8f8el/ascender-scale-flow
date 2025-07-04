
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

const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [client, setClient] = useState<Client | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  
  // Check for existing session and set up auth state listener
  useEffect(() => {
    console.log('AuthProvider: Setting up auth listener...');
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('User found in session, fetching client profile...');
          // Fetch client profile from database
          const { data: clientProfile, error } = await supabase
            .from('client_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          console.log('Client profile query result:', { clientProfile, error });
          
          if (clientProfile && !error) {
            const client = {
              id: clientProfile.id,
              name: clientProfile.name,
              email: clientProfile.email
            };
            console.log('Setting client:', client);
            setClient(client);
            setIsAuthenticated(true);
            localStorage.setItem('ascalate_client', JSON.stringify(client));
          } else {
            console.error('Error fetching client profile:', error);
            setClient(null);
            setIsAuthenticated(false);
            localStorage.removeItem('ascalate_client');
          }
        } else {
          console.log('No user in session, clearing state...');
          setClient(null);
          setIsAuthenticated(false);
          localStorage.removeItem('ascalate_client');
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('Existing session:', session);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        console.log('Found existing session, fetching client profile...');
        // Fetch client profile from database
        const { data: clientProfile, error } = await supabase
          .from('client_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        console.log('Existing session client profile result:', { clientProfile, error });
        
        if (clientProfile && !error) {
          const client = {
            id: clientProfile.id,
            name: clientProfile.name,
            email: clientProfile.email
          };
          console.log('Setting client from existing session:', client);
          setClient(client);
          setIsAuthenticated(true);
          localStorage.setItem('ascalate_client', JSON.stringify(client));
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);
  
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Login attempt for:', email);
      
      // Sign in with Supabase directly
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      console.log('Supabase login response:', { data, error });

      if (error) {
        console.error('Supabase login error:', error);
        return false;
      }

      console.log('Login successful, user:', data.user);
      // The auth state change will handle setting the client data
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };
  
  const logout = async () => {
    try {
      console.log('Logging out...');
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
