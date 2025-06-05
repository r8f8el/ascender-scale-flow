
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AdminUser } from '../types/database';

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
  loading: boolean;
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  adminLogout: () => Promise<void>;
  adminSignUp: (email: string, password: string, name: string, role?: 'admin' | 'super_admin') => Promise<{ success: boolean; error?: string }>;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  isAdminAuthenticated: false,
  admin: null,
  user: null,
  session: null,
  loading: true,
  adminLogin: async () => ({ success: false }),
  adminLogout: async () => {},
  adminSignUp: async () => ({ success: false }),
});

export const useAdminAuth = () => useContext(AdminAuthContext);

const AdminAuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // Function to fetch admin profile from Supabase
  const fetchAdminProfile = async (userId: string): Promise<AdminUser | null> => {
    try {
      const { data, error } = await (supabase as any)
        .from('admin_users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching admin profile:', error);
        return null;
      }

      return data as AdminUser;
    } catch (error) {
      console.error('Error fetching admin profile:', error);
      return null;
    }
  };

  // Set up auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Admin auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch admin profile
          const adminProfile = await fetchAdminProfile(session.user.id);
          if (adminProfile) {
            setAdmin({
              id: adminProfile.id,
              name: adminProfile.name,
              email: adminProfile.email,
              role: adminProfile.role
            });
            setIsAdminAuthenticated(true);
          } else {
            setAdmin(null);
            setIsAdminAuthenticated(false);
          }
        } else {
          setAdmin(null);
          setIsAdminAuthenticated(false);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        setUser(session.user);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const adminLogin = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) {
        console.error('Admin login error:', error);
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Check if user is an admin
        const adminProfile = await fetchAdminProfile(data.user.id);
        if (!adminProfile) {
          await supabase.auth.signOut();
          return { success: false, error: 'Acesso não autorizado. Esta conta não possui privilégios administrativos.' };
        }
      }

      return { success: true };
    } catch (error: any) {
      console.error('Admin login error:', error);
      return { success: false, error: 'Erro interno. Tente novamente.' };
    } finally {
      setLoading(false);
    }
  };

  const adminSignUp = async (email: string, password: string, name: string, role: 'admin' | 'super_admin' = 'admin'): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: {
            name: name.trim(),
            role
          },
          emailRedirectTo: `${window.location.origin}/admin`
        }
      });

      if (error) {
        console.error('Admin signup error:', error);
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Create admin profile
        const { error: adminError } = await (supabase as any)
          .from('admin_users')
          .insert({
            id: data.user.id,
            name: name.trim(),
            email: email.toLowerCase().trim(),
            role
          });

        if (adminError) {
          console.error('Error creating admin profile:', adminError);
          return { success: false, error: 'Erro ao criar perfil do administrador.' };
        }
      }

      return { success: true };
    } catch (error: any) {
      console.error('Admin signup error:', error);
      return { success: false, error: 'Erro interno. Tente novamente.' };
    } finally {
      setLoading(false);
    }
  };

  const adminLogout = async (): Promise<void> => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setAdmin(null);
      setUser(null);
      setSession(null);
      setIsAdminAuthenticated(false);
    } catch (error) {
      console.error('Admin logout error:', error);
      toast({
        title: "Erro ao sair",
        description: "Ocorreu um erro ao fazer logout. Tente novamente.",
        variant: "destructive"
      });
    } finally {
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
        loading, 
        adminLogin, 
        adminLogout, 
        adminSignUp 
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export default AdminAuthProvider;
