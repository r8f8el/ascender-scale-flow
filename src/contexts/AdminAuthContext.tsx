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
  loading: false,
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

  const createBasicAdmin = (user: User): Admin => ({
    id: user.id,
    name: user.email?.split('@')[0] || 'Admin',
    email: user.email || '',
    role: 'admin'
  });

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (currentSession?.user && isAscalateEmail(currentSession.user.email || '')) {
          setSession(currentSession);
          setUser(currentSession.user);
          setAdmin(createBasicAdmin(currentSession.user));
          setIsAdminAuthenticated(true);
        } else {
          setSession(null);
          setUser(null);
          setAdmin(null);
          setIsAdminAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth init error:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        if (event === 'SIGNED_OUT' || !session?.user) {
          setSession(null);
          setUser(null);
          setAdmin(null);
          setIsAdminAuthenticated(false);
          setLoading(false);
          return;
        }

        if (session.user && isAscalateEmail(session.user.email || '')) {
          setSession(session);
          setUser(session.user);
          setAdmin(createBasicAdmin(session.user));
          setIsAdminAuthenticated(true);
          setLoading(false);
        } else if (session.user) {
          setLoading(false);
          supabase.auth.signOut();
        }
      }
    );

    initAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);
  
  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      if (!isAscalateEmail(email)) {
        return false;
      }
      
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setLoading(false);
        return false;
      }

      if (data.user && data.session) {
        setSession(data.session);
        setUser(data.user);
        setAdmin(createBasicAdmin(data.user));
        setIsAdminAuthenticated(true);
      }

      return !!(data.user && data.session);
    } catch (error) {
      setLoading(false);
      return false;
    }
  };
  
  const adminLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
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