
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

interface Admin {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'super_admin';
}

interface AdminAuthContextType {
  isAdminAuthenticated: boolean;
  admin: Admin | null;
  session: Session | null;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  adminLogout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  isAdminAuthenticated: false,
  admin: null,
  session: null,
  adminLogin: async () => false,
  adminLogout: () => {},
});

export const useAdminAuth = () => useContext(AdminAuthContext);

const AdminAuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Admin auth state changed:', event, session?.user?.email);
        setSession(session);
        
        if (session?.user) {
          // Check if user is an admin (ascalate email)
          if (session.user.email?.includes('@ascalate.com.br')) {
            try {
              const { data: profile } = await supabase
                .from('admin_profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
              
              if (profile) {
                setAdmin({
                  id: profile.id,
                  name: profile.name,
                  email: profile.email,
                  role: profile.role as 'admin' | 'super_admin'
                });
                setIsAdminAuthenticated(true);
              }
            } catch (error) {
              console.error('Error fetching admin profile:', error);
            }
          }
        } else {
          setAdmin(null);
          setIsAdminAuthenticated(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        console.log('Existing admin session found:', session.user?.email);
        setSession(session);
      }
    });

    return () => subscription.unsubscribe();
  }, []);
  
  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      // Check if it's an admin email
      if (!email.includes('@ascalate.com.br')) {
        return false; // Non-admin emails should not login through admin portal
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Admin login error:', error.message);
        return false;
      }
      
      return !!data.user;
    } catch (error) {
      console.error('Admin login error:', error);
      return false;
    }
  };
  
  const adminLogout = async () => {
    try {
      await supabase.auth.signOut();
      setAdmin(null);
      setIsAdminAuthenticated(false);
      setSession(null);
    } catch (error) {
      console.error('Admin logout error:', error);
    }
  };
  
  return (
    <AdminAuthContext.Provider 
      value={{ 
        isAdminAuthenticated, 
        admin, 
        session,
        adminLogin, 
        adminLogout 
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export default AdminAuthProvider;
