
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
        console.log('🔍 AdminAuth: Initializing authentication...');
        setLoading(true);
        
        // Get current session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log('🔍 AdminAuth: Current session:', currentSession?.user?.email || 'none');
        
        if (!mounted) return;

        if (currentSession?.user) {
          console.log('✅ AdminAuth: Found existing session for:', currentSession.user.email);
          setSession(currentSession);
          setUser(currentSession.user);
          
          // Check if user is admin by email domain
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

    // Set up auth state listener
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
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

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
        // Still allow login if email is from correct domain
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
  
  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 AdminAuth: Starting login attempt for:', email);
      setLoading(true);

      // Step 1: Attempt Supabase authentication
      console.log('🔐 AdminAuth: Step 1 - Attempting Supabase login...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('🔐 AdminAuth: Supabase auth result:', { 
        user: data.user?.email || 'none', 
        error: error?.message || 'none' 
      });

      if (error) {
        console.error('❌ AdminAuth: Supabase login failed:', error.message);
        return false;
      }

      if (!data.user) {
        console.error('❌ AdminAuth: No user returned from Supabase');
        return false;
      }

      // Step 2: Check domain after successful authentication
      console.log('🔐 AdminAuth: Step 2 - Checking domain for:', data.user.email);
      if (!data.user.email?.endsWith('@ascalate.com.br')) {
        console.error('❌ AdminAuth: User domain not allowed:', data.user.email);
        // Sign out the non-admin user
        await supabase.auth.signOut();
        return false;
      }

      console.log('✅ AdminAuth: Domain check passed');
      console.log('🎉 AdminAuth: Login successful for:', data.user.email);
      return true;
      
    } catch (error) {
      console.error('❌ AdminAuth: Login exception:', error);
      return false;
    } finally {
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
