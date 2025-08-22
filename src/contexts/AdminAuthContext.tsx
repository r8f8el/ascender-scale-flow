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
      console.log('🔐 AdminAuth: INÍCIO - Login attempt for:', email);
      console.log('🔐 AdminAuth: Password length:', password?.length || 0);
      setLoading(true);

      // Step 1: Limpar sessão anterior
      console.log('🔐 AdminAuth: Step 1 - Clearing any existing session...');
      await supabase.auth.signOut();
      
      // Step 2: Aguardar um pouco para garantir limpeza
      console.log('🔐 AdminAuth: Step 2 - Waiting for session cleanup...');
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 3: Tentar login no Supabase
      console.log('🔐 AdminAuth: Step 3 - Attempting Supabase login...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      console.log('🔐 AdminAuth: Supabase auth response:');
      console.log('  - User exists:', !!data.user);
      console.log('  - User email:', data.user?.email || 'none');
      console.log('  - Session exists:', !!data.session);
      console.log('  - Error exists:', !!error);
      console.log('  - Error message:', error?.message || 'none');
      console.log('  - Error code:', error?.code || 'none');

      if (error) {
        console.error('❌ AdminAuth: Supabase authentication failed');
        console.error('  - Error details:', {
          message: error.message,
          code: error.code,
          status: error.status
        });
        return false;
      }

      if (!data.user) {
        console.error('❌ AdminAuth: No user returned from Supabase');
        return false;
      }

      if (!data.session) {
        console.error('❌ AdminAuth: No session returned from Supabase');
        return false;
      }

      console.log('✅ AdminAuth: Supabase authentication successful');

      // Step 4: Verificar domínio
      console.log('🔐 AdminAuth: Step 4 - Checking admin domain...');
      console.log('  - User email:', data.user.email);
      console.log('  - Domain check:', data.user.email?.includes('@ascalate.com.br'));

      if (!data.user.email?.endsWith('@ascalate.com.br')) {
        console.error('❌ AdminAuth: Domain verification failed');
        console.error('  - Email:', data.user.email);
        console.error('  - Expected domain: @ascalate.com.br');
        
        // Fazer logout do usuário não-admin
        await supabase.auth.signOut();
        return false;
      }

      console.log('✅ AdminAuth: Domain verification passed');

      // Step 5: O contexto deve ser atualizado automaticamente pelo listener
      console.log('🔐 AdminAuth: Step 5 - Waiting for context update...');
      
      // Aguardar um pouco para o listener processar
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('🎉 AdminAuth: Login process completed successfully');
      return true;
      
    } catch (error) {
      console.error('❌ AdminAuth: Login exception occurred:');
      console.error('  - Error type:', typeof error);
      console.error('  - Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('  - Full error:', error);
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
