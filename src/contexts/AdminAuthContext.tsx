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
  
  const isAscalateEmail = (email: string) => {
    console.log('🔍 Checking if email is Ascalate:', email);
    const isValid = email.endsWith('@ascalate.com.br');
    console.log('✅ Is valid Ascalate email:', isValid);
    return isValid;
  };

  const loadAdminProfile = async (user: User) => {
    try {
      console.log('📝 Loading admin profile for user:', user.email);
      
      const { data: profile, error } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error || !profile) {
        console.log('🔧 Creating basic admin profile (no profile found)');
        setAdmin({
          id: user.id,
          name: user.email?.split('@')[0] || 'Admin',
          email: user.email || '',
          role: 'admin'
        });
      } else {
        console.log('✅ Admin profile loaded successfully:', profile);
        setAdmin({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role as 'admin' | 'super_admin'
        });
      }
    } catch (error) {
      console.error('❌ Exception loading admin profile:', error);
      setAdmin({
        id: user.id,
        name: user.email?.split('@')[0] || 'Admin',
        email: user.email || '',
        role: 'admin'
      });
    } finally {
      console.log('✅ Setting loading to false after profile load');
      setLoading(false);
    }
  };

  const checkSession = async () => {
    try {
      console.log('🔍 Checking initial session...');
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Error getting session:', error);
        setLoading(false);
        return;
      }

      if (currentSession?.user) {
        const userEmail = currentSession.user.email || '';
        
        if (isAscalateEmail(userEmail)) {
          console.log('✅ Valid admin session found');
          setSession(currentSession);
          setUser(currentSession.user);
          setIsAdminAuthenticated(true);
          await loadAdminProfile(currentSession.user);
        } else {
          console.log('❌ Invalid email domain, signing out');
          await supabase.auth.signOut();
          setLoading(false);
        }
      } else {
        console.log('❌ No session found');
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ Error checking session:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🚀 Initializing admin auth...');
    
    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email || 'No user');
        
        if (event === 'SIGNED_OUT' || !session?.user) {
          console.log('🚪 User signed out');
          setSession(null);
          setUser(null);
          setAdmin(null);
          setIsAdminAuthenticated(false);
          setLoading(false);
          return;
        }

        if (session?.user) {
          const userEmail = session.user.email || '';
          
          if (isAscalateEmail(userEmail)) {
            console.log('✅ Valid admin login detected');
            setSession(session);
            setUser(session.user);
            setIsAdminAuthenticated(true);
            
            if (event === 'SIGNED_IN') {
              await loadAdminProfile(session.user);
            }
          } else {
            console.log('❌ Non-admin user detected, signing out');
            await supabase.auth.signOut();
          }
        }
      }
    );

    // Check initial session
    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 Attempting admin login for:', email);
      setLoading(true);

      if (!isAscalateEmail(email)) {
        console.error('❌ Email is not from Ascalate domain');
        setLoading(false);
        return false;
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Login error:', error.message);
        setLoading(false);
        return false;
      }

      if (data.user && data.session) {
        console.log('✅ Login successful for:', data.user.email);
        return true;
      }
      
      console.log('❌ Login failed - no user or session returned');
      setLoading(false);
      return false;
    } catch (error) {
      console.error('❌ Exception during login:', error);
      setLoading(false);
      return false;
    }
  };
  
  const adminLogout = async () => {
    try {
      console.log('🚪 Admin logout initiated');
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Logout error:', error);
      }
      
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Exception during logout:', error);
    } finally {
      setAdmin(null);
      setUser(null);
      setSession(null);
      setIsAdminAuthenticated(false);
      setLoading(false);
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