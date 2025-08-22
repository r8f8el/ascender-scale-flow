
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
  
  console.log('🔧 AdminAuth: Provider renderizando...');
  
  const loadAdminProfile = async (user: User) => {
    try {
      console.log('👤 AdminAuth: Loading admin profile for:', user.email);
      
      const { data: profile, error } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      console.log('👤 AdminAuth: Profile query result:', { profile, error });

      if (error && error.code !== 'PGRST116') {
        console.error('❌ AdminAuth: Error loading admin profile:', error);
        return;
      }

      if (profile) {
        console.log('✅ AdminAuth: Admin profile loaded:', profile);
        setAdmin({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role as 'admin' | 'super_admin'
        });
      } else {
        console.log('⚠️ AdminAuth: No admin profile found, creating temporary profile');
        setAdmin({
          id: user.id,
          name: user.email?.split('@')[0] || 'Admin',
          email: user.email || '',
          role: 'admin'
        });
      }
    } catch (error) {
      console.error('❌ AdminAuth: Exception loading admin profile:', error);
    }
  };

  useEffect(() => {
    let mounted = true;
    console.log('🔧 AdminAuth: useEffect iniciando...');

    const initializeAuth = async () => {
      try {
        console.log('🔍 AdminAuth: Initializing authentication...');
        setLoading(true);
        
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log('🔍 AdminAuth: Current session:', currentSession?.user?.email || 'none');
        
        if (!mounted) return;

        if (currentSession?.user) {
          console.log('✅ AdminAuth: Found existing session for:', currentSession.user.email);
          setSession(currentSession);
          setUser(currentSession.user);
          
          if (currentSession.user.email?.endsWith('@ascalate.com.br')) {
            console.log('✅ AdminAuth: User has admin domain');
            setIsAdminAuthenticated(true);
            await loadAdminProfile(currentSession.user);
          } else {
            console.log('❌ AdminAuth: User does not have admin domain');
            setIsAdminAuthenticated(false);
          }
        } else {
          console.log('ℹ️ AdminAuth: No existing session found');
        }
      } catch (error) {
        console.error('❌ AdminAuth: Error initializing:', error);
      } finally {
        if (mounted) {
          console.log('🏁 AdminAuth: Initialization complete');
          setLoading(false);
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('🔄 AdminAuth: Auth state changed:', event, session?.user?.email || 'none');
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && session.user.email?.endsWith('@ascalate.com.br')) {
          console.log('✅ AdminAuth: Setting admin authenticated');
          setIsAdminAuthenticated(true);
          if (event === 'SIGNED_IN') {
            setTimeout(() => {
              if (mounted) {
                loadAdminProfile(session.user);
              }
            }, 100);
          }
        } else {
          console.log('❌ AdminAuth: Clearing admin authentication');
          setIsAdminAuthenticated(false);
          setAdmin(null);
        }
        
        setLoading(false);
      }
    );

    initializeAuth();

    return () => {
      console.log('🧹 AdminAuth: Cleanup - unmounting');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);
  
  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    console.log('🔐 AdminAuth: ===== adminLogin FUNCTION CALLED =====');
    console.log('🔐 AdminAuth: Input email:', email);
    console.log('🔐 AdminAuth: Input password length:', password?.length || 0);
    console.log('🔐 AdminAuth: Function context this:', typeof this);
    console.log('🔐 AdminAuth: Current loading state:', loading);
    
    if (!email || !password) {
      console.error('❌ AdminAuth: Missing email or password');
      return false;
    }

    try {
      console.log('🔐 AdminAuth: Setting loading to true');
      setLoading(true);

      console.log('🔐 AdminAuth: Clearing existing session...');
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        console.error('⚠️ AdminAuth: SignOut error (continuing):', signOutError);
      }
      
      console.log('🔐 AdminAuth: Waiting for cleanup...');
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log('🔐 AdminAuth: Attempting Supabase signInWithPassword...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      console.log('🔐 AdminAuth: Supabase response received');
      console.log('🔐 AdminAuth: Data:', data);
      console.log('🔐 AdminAuth: Error:', error);
      console.log('🔐 AdminAuth: User exists:', !!data?.user);
      console.log('🔐 AdminAuth: Session exists:', !!data?.session);

      if (error) {
        console.error('❌ AdminAuth: Supabase authentication failed:', error);
        return false;
      }

      if (!data?.user || !data?.session) {
        console.error('❌ AdminAuth: No user or session returned');
        return false;
      }

      console.log('🔐 AdminAuth: Checking domain...');
      if (!data.user.email?.endsWith('@ascalate.com.br')) {
        console.error('❌ AdminAuth: Domain verification failed for:', data.user.email);
        await supabase.auth.signOut();
        return false;
      }

      console.log('✅ AdminAuth: Domain verification passed');
      console.log('🔐 AdminAuth: Updating context state...');
      
      setSession(data.session);
      setUser(data.user);
      setIsAdminAuthenticated(true);
      
      console.log('🔐 AdminAuth: Loading admin profile...');
      await loadAdminProfile(data.user);
      
      console.log('🎉 AdminAuth: Login successful!');
      return true;
      
    } catch (error) {
      console.error('❌ AdminAuth: Login exception:', error);
      return false;
    } finally {
      console.log('🏁 AdminAuth: Setting loading to false');
      setLoading(false);
    }
  };
  
  const adminLogout = async () => {
    try {
      console.log('🚪 AdminAuth: Logging out...');
      await supabase.auth.signOut();
    } catch (error) {
      console.error('❌ AdminAuth: Logout error:', error);
    }
    
    setAdmin(null);
    setUser(null);
    setSession(null);
    setIsAdminAuthenticated(false);
    console.log('✅ AdminAuth: Logout complete');
  };
  
  console.log('🔧 AdminAuth: Creating context value with adminLogin:', typeof adminLogin);
  
  const contextValue = {
    isAdminAuthenticated, 
    admin, 
    user,
    session,
    adminLogin, 
    adminLogout,
    loading
  };
  
  console.log('🔧 AdminAuth: Context value created:', {
    isAdminAuthenticated,
    adminExists: !!admin,
    userExists: !!user,
    sessionExists: !!session,
    adminLoginType: typeof adminLogin,
    adminLogoutType: typeof adminLogout,
    loading
  });
  
  return (
    <AdminAuthContext.Provider value={contextValue}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export default AdminAuthProvider;
