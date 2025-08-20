import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface Admin {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'super_admin';
}

interface AdminAuthContextType {
  isAdminAuthenticated: boolean;
  admin: Admin | null;
  user: User | null;
  session: Session | null;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  adminLogout: () => void;
  loading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  isAdminAuthenticated: false,
  admin: null,
  user: null,
  session: null,
  adminLogin: async () => false,
  adminLogout: () => {},
  loading: true,
});

export const useAdminAuth = () => useContext(AdminAuthContext);

export const AdminAuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [admin, setAdmin] = useState<Admin | null>(null);
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

        if (currentSession?.user && currentSession.user.email?.endsWith('@ascalate.com.br')) {
          console.log('Found existing admin session:', currentSession.user.email);
          setSession(currentSession);
          setUser(currentSession.user);
          setIsAdminAuthenticated(true);
          
          // Load admin profile only once
          if (!profileLoaded) {
            profileLoaded = true;
            await loadAdminProfile(currentSession.user);
          }
        }
      } catch (error) {
        console.error('Error initializing admin auth:', error);
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
        
        console.log('Admin auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && session.user.email?.endsWith('@ascalate.com.br')) {
          setIsAdminAuthenticated(true);
          // Load profile only if not already loaded and avoid infinite loops
          if (!profileLoaded && event === 'SIGNED_IN') {
            profileLoaded = true;
            setTimeout(() => {
              if (mounted) {
                loadAdminProfile(session.user);
              }
            }, 100);
          }
        } else {
          setIsAdminAuthenticated(false);
          setAdmin(null);
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

  const loadAdminProfile = async (user: User) => {
    try {
      const { data: profile, error } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading admin profile:', error);
        return;
      }

      if (profile) {
        setAdmin({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role as 'admin' | 'super_admin'
        });
      }
    } catch (error) {
      console.error('Error loading admin profile:', error);
    }
  };
  
  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);

      // Verificar se é email da Ascalate
      if (!email.endsWith('@ascalate.com.br')) {
        console.error('Email não é da Ascalate');
        return false;
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Admin login error:', error);
        return false;
      }

      if (data.user) {
        console.log('Admin login successful');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Admin login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  const adminLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Admin logout error:', error);
    }
    
    setAdmin(null);
    setUser(null);
    setSession(null);
    setIsAdminAuthenticated(false);
  };
  
  return (
    <AdminAuthContext.Provider 
      value={{ 
        isAdminAuthenticated, 
        admin, 
        user,
        session,
        adminLogin, 
        adminLogout,
        loading
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export default AdminAuthProvider;
