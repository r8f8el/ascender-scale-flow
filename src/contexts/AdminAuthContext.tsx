
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
        setLoading(true);
        
        // Get current session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (currentSession?.user) {
          console.log('Found existing session:', currentSession.user.email);
          setSession(currentSession);
          setUser(currentSession.user);
          
          // Check if user is admin by email domain
          if (currentSession.user.email?.endsWith('@ascalate.com.br')) {
            setIsAdminAuthenticated(true);
            await loadAdminProfile(currentSession.user);
          } else {
            setIsAdminAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('Error initializing admin auth:', error);
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
        
        console.log('Admin auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && session.user.email?.endsWith('@ascalate.com.br')) {
          setIsAdminAuthenticated(true);
          if (event === 'SIGNED_IN') {
            setTimeout(() => {
              if (mounted) {
                loadAdminProfile(session.user);
              }
            }, 100);
          }
        } else {
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
      console.log('Loading admin profile for:', user.email);
      
      const { data: profile, error } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading admin profile:', error);
        return;
      }

      if (profile) {
        console.log('Admin profile loaded:', profile);
        setAdmin({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role as 'admin' | 'super_admin'
        });
      } else {
        console.log('No admin profile found, user may need to be added to admin_profiles table');
        // Still allow login if email is from correct domain
        setAdmin({
          id: user.id,
          name: user.email?.split('@')[0] || 'Admin',
          email: user.email || '',
          role: 'admin'
        });
      }
    } catch (error) {
      console.error('Error loading admin profile:', error);
    }
  };
  
  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting admin login for:', email);
      setLoading(true);

      // Try login first, then check domain
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error.message);
        return false;
      }

      if (data.user) {
        // Check if user is from ascalate domain after successful login
        if (!data.user.email?.endsWith('@ascalate.com.br')) {
          console.error('User is not from Ascalate domain');
          // Sign out the non-admin user
          await supabase.auth.signOut();
          return false;
        }
        
        console.log('Admin login successful for:', data.user.email);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Admin login exception:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  const adminLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Admin logout error:', error);
    }
    
    setAdmin(null);
    setUser(null);
    setSession(null);
    setIsAdminAuthenticated(false);
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
