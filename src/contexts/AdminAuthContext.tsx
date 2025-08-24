
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
  
  console.log('🚀 AdminAuthProvider: Context initialized');

  const checkAdminProfile = async (user: User): Promise<boolean> => {
    console.log('👤 Checking admin profile for:', user.email);
    
    try {
      // Verificar se é email admin primeiro
      if (!user.email?.endsWith('@ascalate.com.br')) {
        console.log('❌ Not an admin email domain');
        return false;
      }

      // Buscar perfil admin
      const { data: profile, error } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('❌ Error fetching admin profile:', error);
        return false;
      }

      if (profile) {
        console.log('✅ Admin profile found:', profile);
        setAdmin({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role as 'admin' | 'super_admin'
        });
        setIsAdminAuthenticated(true);
        return true;
      }

      console.log('❌ No admin profile found');
      return false;
      
    } catch (error) {
      console.error('❌ Exception checking admin profile:', error);
      return false;
    }
  };

  useEffect(() => {
    let mounted = true;
    console.log('🔄 AdminAuth: Setting up authentication listener');

    const initializeAuth = async () => {
      try {
        // Verificar sessão atual primeiro
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log('🔍 Initial session check:', currentSession?.user?.email || 'none');
        
        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          
          if (currentSession?.user) {
            const isAdmin = await checkAdminProfile(currentSession.user);
            if (!isAdmin) {
              setIsAdminAuthenticated(false);
              setAdmin(null);
            }
          } else {
            setIsAdminAuthenticated(false);
            setAdmin(null);
          }
          
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ Error in initial auth check:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Configurar listener de mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('🔄 Auth state change:', event, session?.user?.email || 'none');
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const isAdmin = await checkAdminProfile(session.user);
          if (!isAdmin) {
            setIsAdminAuthenticated(false);
            setAdmin(null);
          }
        } else {
          setIsAdminAuthenticated(false);
          setAdmin(null);
        }
        
        setLoading(false);
      }
    );

    // Inicializar auth
    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);
  
  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    console.log('🎯 ADMIN LOGIN: Starting authentication for:', email);
    
    if (!email || !password) {
      console.error('❌ Missing credentials');
      return false;
    }

    if (!email.endsWith('@ascalate.com.br')) {
      console.error('❌ Invalid email domain');
      return false;
    }

    try {
      setLoading(true);
      console.log('🎯 ADMIN LOGIN: Attempting Supabase authentication');

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        console.error('❌ ADMIN LOGIN: Supabase auth error:', error.message);
        setLoading(false);
        return false;
      }

      if (!data?.user || !data?.session) {
        console.error('❌ ADMIN LOGIN: No user or session in response');
        setLoading(false);
        return false;
      }

      console.log('✅ ADMIN LOGIN: Authentication successful');
      // O loading será definido como false pelo listener onAuthStateChange
      return true;
      
    } catch (error) {
      console.error('❌ ADMIN LOGIN: Exception:', error);
      setLoading(false);
      return false;
    }
  };
  
  const adminLogout = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setAdmin(null);
      setUser(null);
      setSession(null);
      setIsAdminAuthenticated(false);
      console.log('✅ Logout complete');
    } catch (error) {
      console.error('❌ Logout error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const contextValue = {
    isAdminAuthenticated, 
    admin, 
    user,
    session,
    adminLogin,
    adminLogout,
    loading
  };
  
  console.log('🎯 AdminAuthProvider: Context value:', {
    isAdminAuthenticated,
    hasAdmin: !!admin,
    hasUser: !!user,
    loading,
    adminEmail: admin?.email
  });
  
  return (
    <AdminAuthContext.Provider value={contextValue}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export default AdminAuthProvider;
