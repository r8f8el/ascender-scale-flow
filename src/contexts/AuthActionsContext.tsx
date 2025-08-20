
import React, { createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useUser } from './UserContext';
import { useClient } from './ClientContext';

interface AuthActionsContextType {
  login: (email: string, password: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, userData?: any) => Promise<{ error: any }>;
}

const AuthActionsContext = createContext<AuthActionsContextType | undefined>(undefined);

export const useAuthActions = () => {
  const context = useContext(AuthActionsContext);
  if (context === undefined) {
    throw new Error('useAuthActions must be used within an AuthActionsProvider');
  }
  return context;
};

export const AuthActionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setUser, setSession, setLoading } = useUser();
  const { setClient } = useClient();

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Attempting login for:', email);
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Login error:', error);
        toast.error('Erro ao fazer login: ' + error.message);
        return { error };
      }

      if (data.user) {
        console.log('✅ Login successful for user:', data.user.id);
        toast.success('Login realizado com sucesso!');
      }

      return { error: null };
    } catch (error: any) {
      console.error('❌ Login exception:', error);
      toast.error('Erro inesperado ao fazer login');
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, userData?: any) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/cliente`,
          data: userData || {}
        }
      });

      if (error) {
        console.error('❌ Signup error:', error);
        toast.error('Erro ao criar conta: ' + error.message);
        return { error };
      }

      if (data.user && !data.user.email_confirmed_at) {
        toast.success('Conta criada! Verifique seu email para confirmar.');
      }

      return { error: null };
    } catch (error: any) {
      console.error('❌ Signup exception:', error);
      toast.error('Erro inesperado ao criar conta');
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('👋 Attempting logout');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Logout error:', error);
        toast.error('Erro ao fazer logout');
      } else {
        console.log('✅ Logout successful');
        setUser(null);
        setSession(null);
        setClient(null);
        toast.success('Logout realizado com sucesso!');
      }
    } catch (error) {
      console.error('❌ Logout exception:', error);
      toast.error('Erro inesperado ao fazer logout');
    }
  };

  const value = {
    login,
    logout,
    signup,
  };

  return <AuthActionsContext.Provider value={value}>{children}</AuthActionsContext.Provider>;
};
