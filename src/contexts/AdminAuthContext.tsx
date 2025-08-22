
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { useAuthRateLimit } from '@/hooks/useAuthRateLimit';
import { useSecurityAudit } from '@/hooks/useSecurityAudit';

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
  rateLimitState: any;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  isAdminAuthenticated: false,
  admin: null,
  user: null,
  session: null,
  adminLogin: async () => false,
  adminLogout: () => {},
  loading: true,
  rateLimitState: { isBlocked: false, attemptsRemaining: 5, resetTime: null }
});

export const useAdminAuth = () => useContext(AdminAuthContext);

export const AdminAuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { rateLimitState, checkRateLimit, resetRateLimit } = useAuthRateLimit();
  const { logAuthAttempt, logSecurityEvent } = useSecurityAudit();
  
  console.log('🚀 SECURE AdminAuthProvider: Context initialized with security features');

  const createAdminProfile = async (user: User) => {
    console.log('👤 Creating secure admin profile for:', user.email);
    
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
    console.log('🔄 Secure AdminAuth: Initializing...');

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
          
          // Log successful session restoration
          await logSecurityEvent({
            action: 'admin_session_restored',
            resourceType: 'authentication',
            details: { email: currentSession.user.email }
          });
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
            resetRateLimit(); // Reset rate limit on successful login
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
  }, [resetRateLimit, logSecurityEvent]);
  
  // Secure admin authentication function
  const executeAdminAuthentication = async (email: string, password: string): Promise<boolean> => {
    console.log('🎯 SECURE ADMIN AUTH: Starting authentication process');
    console.log('🎯 SECURE ADMIN AUTH: Email:', email);
    console.log('🎯 SECURE ADMIN AUTH: Password provided:', !!password);
    
    if (!email || !password) {
      console.error('❌ SECURE ADMIN AUTH: Missing credentials');
      await logAuthAttempt(email, false, 'Missing credentials');
      return false;
    }

    // Check rate limit
    const rateLimitOk = await checkRateLimit(email, 'admin_login');
    if (!rateLimitOk) {
      console.error('❌ SECURE ADMIN AUTH: Rate limit exceeded');
      await logSecurityEvent({
        action: 'admin_login_rate_limited',
        resourceType: 'authentication',
        details: { email }
      });
      return false;
    }

    try {
      setLoading(true);
      console.log('🎯 SECURE ADMIN AUTH: Setting loading state');

      // Clear existing session
      console.log('🎯 SECURE ADMIN AUTH: Clearing existing session');
      await supabase.auth.signOut();
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('🎯 SECURE ADMIN AUTH: Attempting Supabase sign in');
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      console.log('🎯 SECURE ADMIN AUTH: Supabase response received');
      console.log('🎯 SECURE ADMIN AUTH: Has user:', !!data?.user);
      console.log('🎯 SECURE ADMIN AUTH: Has session:', !!data?.session);
      console.log('🎯 SECURE ADMIN AUTH: Error:', error?.message || 'none');

      if (error) {
        console.error('❌ SECURE ADMIN AUTH: Authentication failed:', error.message);
        await logAuthAttempt(email, false, error.message);
        return false;
      }

      if (!data?.user || !data?.session) {
        console.error('❌ SECURE ADMIN AUTH: No user or session returned');
        await logAuthAttempt(email, false, 'No user or session returned');
        return false;
      }

      if (!data.user.email?.endsWith('@ascalate.com.br')) {
        console.error('❌ SECURE ADMIN AUTH: Invalid email domain:', data.user.email);
        await supabase.auth.signOut();
        await logSecurityEvent({
          action: 'admin_login_invalid_domain',
          resourceType: 'authentication',
          details: { email: data.user.email }
        });
        return false;
      }

      console.log('✅ SECURE ADMIN AUTH: Authentication successful');
      await logAuthAttempt(email, true);
      return true;
      
    } catch (error) {
      console.error('❌ SECURE ADMIN AUTH: Exception occurred:', error);
      await logAuthAttempt(email, false, `Exception: ${error}`);
      return false;
    } finally {
      console.log('🎯 SECURE ADMIN AUTH: Cleaning up - setting loading to false');
      setLoading(false);
    }
  };
  
  const adminLogout = async () => {
    try {
      if (user?.email) {
        await logSecurityEvent({
          action: 'admin_logout',
          resourceType: 'authentication',
          details: { email: user.email }
        });
      }
      
      await supabase.auth.signOut();
      setAdmin(null);
      setUser(null);
      setSession(null);
      setIsAdminAuthenticated(false);
      console.log('✅ Secure logout complete');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };
  
  const contextValue = {
    isAdminAuthenticated, 
    admin, 
    user,
    session,
    adminLogin: executeAdminAuthentication,
    adminLogout,
    loading,
    rateLimitState
  };
  
  console.log('🎯 SECURE AdminAuthProvider: Context value created with security features');
  console.log('🎯 SECURE AdminAuthProvider: adminLogin function type:', typeof contextValue.adminLogin);
  
  return (
    <AdminAuthContext.Provider value={contextValue}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export default AdminAuthProvider;
