
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
          console.log('User found in session, checking user type...');
          
          // Check if user is admin first
          const { data: adminProfile, error: adminError } = await supabase
            .from('admin_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          console.log('Admin profile check:', { adminProfile, adminError });
          
          if (adminProfile && !adminError) {
            // User is admin, don't authenticate as client
            console.log('User is admin, not setting client state');
            setClient(null);
            setIsAuthenticated(false);
            return;
          }
          
          // Check for client profile
          const { data: clientProfile, error: clientError } = await supabase
            .from('client_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          console.log('Client profile query result:', { clientProfile, clientError });
          
          if (clientProfile && !clientError) {
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
            console.error('No client profile found for user:', session.user.id);
            // Create client profile if it doesn't exist
            const { data: newProfile, error: createError } = await supabase
              .from('client_profiles')
              .insert({
                id: session.user.id,
                name: session.user.email?.split('@')[0] || 'Cliente',
                email: session.user.email || '',
                company: session.user.email?.includes('portobello') ? 'Portobello' : 
                        session.user.email?.includes('jassy') ? 'J.Assy' : null
              })
              .select()
              .single();
            
            console.log('Created client profile:', { newProfile, createError });
            
            if (newProfile && !createError) {
              const client = {
                id: newProfile.id,
                name: newProfile.name,
                email: newProfile.email
              };
              console.log('Setting newly created client:', client);
              setClient(client);
              setIsAuthenticated(true);
              localStorage.setItem('ascalate_client', JSON.stringify(client));
            } else {
              console.error('Failed to create client profile:', createError);
              setClient(null);
              setIsAuthenticated(false);
              localStorage.removeItem('ascalate_client');
            }
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
      if (session?.user) {
        // This will trigger the auth state change handler above
        console.log('Found existing session, auth state change will handle it');
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
