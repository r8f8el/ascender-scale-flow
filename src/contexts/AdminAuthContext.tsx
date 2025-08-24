
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
  
  const isAscalateEmail = (email: string) => {
    return email.endsWith('@ascalate.com.br');
  };

  const loadAdminProfile = async (user: User) => {
    try {
      console.log('Loading admin profile for:', user.email);
      
      const { data: profile, error } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading admin profile:', error);
        return;
      }

      if (profile) {
        console.log('Admin profile loaded:', profile);
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

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing admin auth...');
        setLoading(true);
        
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (currentSession?.user) {
          console.log('Found existing session for:', currentSession.user.email);
          
          if (isAscalateEmail(currentSession.user.email || '')) {
            setSession(currentSession);
            setUser(currentSession.user);
            setIsAdminAuthenticated(true);
            await loadAdminProfile(currentSession.user);
          } else {
            console.log('User email is not from Ascalate domain');
            await supabase.auth.signOut();
            setIsAdminAuthenticated(false);
            setAdmin(null);
            setUser(null);
            setSession(null);
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('🔄 Admin auth state changed:', event, session?.user?.email);
        
        if (event === 'SIGNED_OUT' || !session?.user) {
          setSession(null);
          setUser(null);
          setAdmin(null);
          setIsAdminAuthenticated(false);
          setLoading(false);
          return;
        }

        if (session?.user && isAscalateEmail(session.user.email || '')) {
          setSession(session);
          setUser(session.user);
          setIsAdminAuthenticated(true);
          
          if (event === 'SIGNED_IN') {
            await loadAdminProfile(session.user);
          }
        } else if (session?.user) {
          console.log('Non-admin user detected, signing out');
          await supabase.auth.signOut();
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
  
  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 Attempting admin login for:', email);
      setLoading(true);

      if (!isAscalateEmail(email)) {
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

      if (data.user && data.session) {
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
      setLoading(true);
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Admin logout error:', error);
    } finally {
      setAdmin(null);
      setUser(null);
      setSession(null);
      setIsAdminAuthenticated(false);
      setLoading(false);
    }
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
