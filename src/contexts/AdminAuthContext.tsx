
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
    console.log('🔐 AdminAuth: ===== FUNÇÃO adminLogin CHAMADA =====');
    console.log('🔐 AdminAuth: Parâmetros recebidos - Email:', email, 'Password length:', password?.length || 0);
    
    try {
      console.log('🔐 AdminAuth: Entrando no try block...');
      setLoading(true);
      console.log('🔐 AdminAuth: Loading state set to true');

      // Step 1: Clear any existing session
      console.log('🔐 AdminAuth: Step 1 - Clearing existing session...');
      try {
        const signOutResult = await supabase.auth.signOut();
        console.log('🔐 AdminAuth: SignOut result:', signOutResult);
      } catch (signOutError) {
        console.error('❌ AdminAuth: Error clearing session:', signOutError);
      }
      
      // Step 2: Wait for cleanup
      console.log('🔐 AdminAuth: Step 2 - Waiting for cleanup...');
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 3: Attempt Supabase authentication
      console.log('🔐 AdminAuth: Step 3 - Attempting Supabase login...');
      console.log('🔐 AdminAuth: Using email:', email.trim());
      console.log('🔐 AdminAuth: Using password length:', password.length);
      
      const loginParams = {
        email: email.trim(),
        password: password,
      };
      console.log('🔐 AdminAuth: Login parameters prepared:', { email: loginParams.email, passwordLength: loginParams.password.length });
      
      console.log('🔐 AdminAuth: Calling supabase.auth.signInWithPassword...');
      const loginResult = await supabase.auth.signInWithPassword(loginParams);
      console.log('🔐 AdminAuth: Supabase login call completed');

      console.log('🔐 AdminAuth: Raw Supabase response:');
      console.log('  - Full data object:', loginResult.data);
      console.log('  - Full error object:', loginResult.error);
      console.log('  - User exists:', !!loginResult.data?.user);
      console.log('  - User email:', loginResult.data?.user?.email || 'none');
      console.log('  - Session exists:', !!loginResult.data?.session);
      console.log('  - Error message:', loginResult.error?.message || 'none');
      console.log('  - Error code:', loginResult.error?.code || 'none');

      if (loginResult.error) {
        console.error('❌ AdminAuth: Supabase authentication failed');
        console.error('  - Error details:', {
          message: loginResult.error.message,
          code: loginResult.error.code,
          status: loginResult.error.status
        });
        console.log('🔐 AdminAuth: Returning false due to Supabase error');
        return false;
      }

      if (!loginResult.data?.user) {
        console.error('❌ AdminAuth: No user returned from Supabase');
        console.log('🔐 AdminAuth: Returning false due to no user');
        return false;
      }

      if (!loginResult.data?.session) {
        console.error('❌ AdminAuth: No session returned from Supabase');
        console.log('🔐 AdminAuth: Returning false due to no session');
        return false;
      }

      console.log('✅ AdminAuth: Supabase authentication successful');

      // Step 4: Check domain
      console.log('🔐 AdminAuth: Step 4 - Checking admin domain...');
      console.log('  - User email:', loginResult.data.user.email);
      console.log('  - Domain check:', loginResult.data.user.email?.includes('@ascalate.com.br'));

      if (!loginResult.data.user.email?.endsWith('@ascalate.com.br')) {
        console.error('❌ AdminAuth: Domain verification failed');
        console.error('  - Email:', loginResult.data.user.email);
        console.error('  - Expected domain: @ascalate.com.br');
        
        // Sign out the non-admin user
        await supabase.auth.signOut();
        console.log('🔐 AdminAuth: Returning false due to domain verification failure');
        return false;
      }

      console.log('✅ AdminAuth: Domain verification passed');

      // Step 5: Update context state manually
      console.log('🔐 AdminAuth: Step 5 - Updating context state...');
      setSession(loginResult.data.session);
      setUser(loginResult.data.user);
      setIsAdminAuthenticated(true);
      
      // Load admin profile
      console.log('🔐 AdminAuth: Step 6 - Loading admin profile...');
      await loadAdminProfile(loginResult.data.user);
      
      console.log('🎉 AdminAuth: Login process completed successfully');
      console.log('🔐 AdminAuth: Returning true - login successful');
      return true;
      
    } catch (error) {
      console.error('❌ AdminAuth: Login exception occurred:');
      console.error('  - Error type:', typeof error);
      console.error('  - Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('  - Full error object:', error);
      console.error('  - Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
      console.log('🔐 AdminAuth: Returning false due to exception');
      return false;
    } finally {
      console.log('🏁 AdminAuth: Login process finished, setting loading to false');
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
  
  console.log('🔧 AdminAuth: Providing context with adminLogin function:', typeof adminLogin);
  
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
