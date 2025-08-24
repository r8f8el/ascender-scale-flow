
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

      if (error) {
        console.error('❌ Error loading admin profile:', error);
        // Se não encontrar o profile, vamos criar um básico
        console.log('🔧 Creating basic admin profile...');
        setAdmin({
          id: user.id,
          name: user.email?.split('@')[0] || 'Admin',
          email: user.email || '',
          role: 'admin'
        });
        console.log('✅ Basic admin profile created, setting loading to false');
        setLoading(false);
        return;
      }

      if (profile) {
        console.log('✅ Admin profile loaded successfully:', profile);
        setAdmin({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role as 'admin' | 'super_admin'
        });
        console.log('✅ Admin profile set, setting loading to false');
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ Exception loading admin profile:', error);
      // Fallback para admin básico
      setAdmin({
        id: user.id,
        name: user.email?.split('@')[0] || 'Admin',
        email: user.email || '',
        role: 'admin'
      });
      console.log('✅ Fallback admin profile created, setting loading to false');
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('🚀 Initializing admin auth...');
        
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting session:', error);
          setLoading(false);
          return;
        }

        if (!mounted) return;

        console.log('📋 Current session:', currentSession?.user?.email || 'None');

        if (currentSession?.user) {
          const userEmail = currentSession.user.email || '';
          console.log('👤 Found user session for:', userEmail);
          
          if (isAscalateEmail(userEmail)) {
            console.log('✅ Valid Ascalate email, setting authenticated state');
            setSession(currentSession);
            setUser(currentSession.user);
            setIsAdminAuthenticated(true);
            await loadAdminProfile(currentSession.user);
          } else {
            console.log('❌ Invalid email domain, signing out');
            await supabase.auth.signOut();
            setIsAdminAuthenticated(false);
            setAdmin(null);
            setUser(null);
            setSession(null);
            setLoading(false);
          }
        } else {
          console.log('❌ No session found');
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ Error in initializeAuth:', error);
      } finally {
        // Loading é gerenciado individualmente em cada branch
        console.log('🏁 InitializeAuth completed');
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
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
            } else {
              setLoading(false);
            }
          } else {
            console.log('❌ Non-admin user detected, signing out');
            await supabase.auth.signOut();
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      }
    );

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);
  
  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 Attempting admin login for:', email);
      setLoading(true);

      if (!isAscalateEmail(email)) {
        console.error('❌ Email is not from Ascalate domain');
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
        // Loading será definido pelo onAuthStateChange
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