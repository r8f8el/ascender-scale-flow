
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

    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing admin auth...');
        
        // Get current session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        console.log('📧 Current session user email:', currentSession?.user?.email);

        if (currentSession?.user?.email?.endsWith('@ascalate.com.br')) {
          console.log('✅ Valid admin session found');
          setSession(currentSession);
          setUser(currentSession.user);
          setIsAdminAuthenticated(true);
          
          // Load admin profile
          await loadAdminProfile(currentSession.user);
        } else {
          console.log('❌ No valid admin session');
          setSession(null);
          setUser(null);
          setIsAdminAuthenticated(false);
          setAdmin(null);
        }
      } catch (error) {
        console.error('❌ Error initializing admin auth:', error);
        setSession(null);
        setUser(null);
        setIsAdminAuthenticated(false);
        setAdmin(null);
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
        
        console.log('🔄 Admin auth state changed:', event, session?.user?.email);
        
        if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setIsAdminAuthenticated(false);
          setAdmin(null);
          setLoading(false);
          return;
        }
        
        if (session?.user?.email?.endsWith('@ascalate.com.br')) {
          setSession(session);
          setUser(session.user);
          setIsAdminAuthenticated(true);
          
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            await loadAdminProfile(session.user);
          }
        } else {
          setSession(null);
          setUser(null);
          setIsAdminAuthenticated(false);
          setAdmin(null);
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
      console.log('👤 Loading admin profile for:', user.email);
      
      const { data: profile, error } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('❌ Error loading admin profile:', error);
        return;
      }

      if (profile) {
        console.log('✅ Admin profile loaded:', profile);
        setAdmin({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role as 'admin' | 'super_admin'
        });
      }
    } catch (error) {
      console.error('❌ Error loading admin profile:', error);
    }
  };
  
  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 Attempting admin login for:', email);
      
      // Verificar se é email da Ascalate
      if (!email.endsWith('@ascalate.com.br')) {
        console.error('❌ Email não é da Ascalate');
        return false;
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Admin login error:', error);
        return false;
      }

      if (data.user && data.session) {
        console.log('✅ Admin login successful for:', data.user.email);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Admin login error:', error);
      return false;
    }
  };
  
  const adminLogout = async () => {
    try {
      console.log('🚪 Admin logout');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('❌ Admin logout error:', error);
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
