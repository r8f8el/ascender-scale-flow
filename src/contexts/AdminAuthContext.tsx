
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
  
  console.log('🚀 BRAND NEW AdminAuthProvider: Context initialized');

  const createAdminProfile = async (user: User) => {
    console.log('👤 Creating admin profile for:', user.email);
    
    try {
      const { data: profile } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        console.log('✅ Found existing admin profile');
        setAdmin({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role as 'admin' | 'super_admin'
        });
      } else {
        console.log('➕ Creating temporary admin profile');
        setAdmin({
          id: user.id,
          name: user.email?.split('@')[0] || 'Admin',
          email: user.email || '',
          role: 'admin'
        });
      }
    } catch (error) {
      console.error('❌ Error with admin profile:', error);
      setAdmin({
        id: user.id,
        name: user.email?.split('@')[0] || 'Admin',
        email: user.email || '',
        role: 'admin'
      });
    }
  };

  useEffect(() => {
    let mounted = true;
    console.log('🔄 AdminAuth: Initializing...');

    const initAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log('🔍 Current session:', currentSession?.user?.email || 'none');
        
        if (!mounted) return;

        if (currentSession?.user?.email?.endsWith('@ascalate.com.br')) {
          console.log('✅ Valid admin session found');
          setSession(currentSession);
          setUser(currentSession.user);
          setIsAdminAuthenticated(true);
          await createAdminProfile(currentSession.user);
        }
      } catch (error) {
        console.error('❌ Init error:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('🔄 Auth state change:', event, session?.user?.email || 'none');
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user?.email?.endsWith('@ascalate.com.br')) {
          setIsAdminAuthenticated(true);
          if (event === 'SIGNED_IN') {
            await createAdminProfile(session.user);
          }
        } else {
          setIsAdminAuthenticated(false);
          setAdmin(null);
        }
        
        setLoading(false);
      }
    );

    initAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);
  
  // Função completamente nova com nome único
  const performAdminLogin = async (email: string, password: string): Promise<boolean> => {
    console.log('🎯 BRAND NEW AdminLogin: Function called with:', email);
    console.log('🎯 BRAND NEW AdminLogin: Password provided:', !!password);
    
    if (!email || !password) {
      console.error('❌ BRAND NEW AdminLogin: Missing credentials');
      return false;
    }

    try {
      setLoading(true);
      console.log('🎯 BRAND NEW AdminLogin: Setting loading to true');

      // Clear any existing session
      console.log('🎯 BRAND NEW AdminLogin: Clearing existing session...');
      await supabase.auth.signOut();
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log('🎯 BRAND NEW AdminLogin: Attempting Supabase login...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      console.log('🎯 BRAND NEW AdminLogin: Supabase response:', { 
        hasUser: !!data?.user, 
        hasSession: !!data?.session, 
        error: error?.message 
      });

      if (error) {
        console.error('❌ BRAND NEW AdminLogin: Supabase error:', error.message);
        return false;
      }

      if (!data?.user || !data?.session) {
        console.error('❌ BRAND NEW AdminLogin: No user or session returned');
        return false;
      }

      if (!data.user.email?.endsWith('@ascalate.com.br')) {
        console.error('❌ BRAND NEW AdminLogin: Invalid domain:', data.user.email);
        await supabase.auth.signOut();
        return false;
      }

      console.log('✅ BRAND NEW AdminLogin: Login successful!');
      return true;
      
    } catch (error) {
      console.error('❌ BRAND NEW AdminLogin: Exception:', error);
      return false;
    } finally {
      console.log('🎯 BRAND NEW AdminLogin: Finally block - setting loading to false');
      setLoading(false);
    }
  };
  
  const adminLogout = async () => {
    try {
      await supabase.auth.signOut();
      setAdmin(null);
      setUser(null);
      setSession(null);
      setIsAdminAuthenticated(false);
      console.log('✅ Logout complete');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };
  
  const contextValue = {
    isAdminAuthenticated, 
    admin, 
    user,
    session,
    adminLogin: performAdminLogin, // Nova função
    adminLogout,
    loading
  };
  
  console.log('🎯 BRAND NEW AdminAuthProvider: Rendering with performAdminLogin function:', typeof contextValue.adminLogin);
  
  return (
    <AdminAuthContext.Provider value={contextValue}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export default AdminAuthProvider;
