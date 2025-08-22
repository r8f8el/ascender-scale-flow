
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
  
  console.log('🚀 AdminAuthProvider: Context initialized');

  const createAdminProfile = async (user: User) => {
    console.log('👤 Creating admin profile for:', user.email);
    
    try {
      const { data: profile } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        console.log('✅ Found admin profile:', profile);
        setAdmin({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role as 'admin' | 'super_admin'
        });
        return true;
      } else {
        console.log('❌ No admin profile found for user');
        return false;
      }
    } catch (error) {
      console.error('❌ Error fetching admin profile:', error);
      return false;
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
          
          const hasProfile = await createAdminProfile(currentSession.user);
          if (hasProfile) {
            setIsAdminAuthenticated(true);
            await logSecurityEvent({
              action: 'admin_session_restored',
              resourceType: 'authentication',
              details: { email: currentSession.user.email }
            });
          }
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
          const hasProfile = await createAdminProfile(session.user);
          if (hasProfile) {
            setIsAdminAuthenticated(true);
            if (event === 'SIGNED_IN') {
              resetRateLimit();
            }
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
  
  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    console.log('🎯 ADMIN LOGIN: Starting authentication');
    console.log('🎯 ADMIN LOGIN: Email:', email);
    console.log('🎯 ADMIN LOGIN: Password provided:', !!password);
    
    if (!email || !password) {
      console.error('❌ ADMIN LOGIN: Missing credentials');
      return false;
    }

    // Check domain
    if (!email.endsWith('@ascalate.com.br')) {
      console.error('❌ ADMIN LOGIN: Invalid domain');
      return false;
    }

    // Check rate limit
    const rateLimitOk = await checkRateLimit(email, 'admin_login');
    if (!rateLimitOk) {
      console.error('❌ ADMIN LOGIN: Rate limit exceeded');
      return false;
    }

    try {
      setLoading(true);
      console.log('🎯 ADMIN LOGIN: Attempting Supabase sign in');

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      console.log('🎯 ADMIN LOGIN: Supabase response received');
      console.log('🎯 ADMIN LOGIN: Has user:', !!data?.user);
      console.log('🎯 ADMIN LOGIN: Has session:', !!data?.session);
      console.log('🎯 ADMIN LOGIN: Error:', error?.message || 'none');

      if (error) {
        console.error('❌ ADMIN LOGIN: Authentication failed:', error.message);
        await logAuthAttempt(email, false, error.message);
        return false;
      }

      if (!data?.user || !data?.session) {
        console.error('❌ ADMIN LOGIN: No user or session returned');
        await logAuthAttempt(email, false, 'No user or session returned');
        return false;
      }

      console.log('✅ ADMIN LOGIN: Authentication successful');
      await logAuthAttempt(email, true);
      return true;
      
    } catch (error) {
      console.error('❌ ADMIN LOGIN: Exception occurred:', error);
      await logAuthAttempt(email, false, `Exception: ${error}`);
      return false;
    } finally {
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
    adminLogin,
    adminLogout,
    loading,
    rateLimitState
  };
  
  console.log('🎯 AdminAuthProvider: Context value created');
  console.log('🎯 AdminAuthProvider: isAdminAuthenticated:', isAdminAuthenticated);
  console.log('🎯 AdminAuthProvider: admin:', admin);
  
  return (
    <AdminAuthContext.Provider value={contextValue}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export default AdminAuthProvider;
