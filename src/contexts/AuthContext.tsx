
import React, { createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { UserProvider, useUser } from './UserContext';
import { ClientProvider, useClient } from './ClientContext';
import { AuthActionsProvider, useAuthActions } from './AuthActionsContext';
import { AuthSessionProvider } from './AuthSessionContext';

interface Client {
  id: string;
  name: string;
  email: string;
  company?: string;
  cnpj?: string;
  is_primary_contact?: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  client: Client | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, userData?: any) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, session, loading } = useUser();
  const { client } = useClient();
  const { login, logout, signup } = useAuthActions();

  const value = {
    user,
    session,
    client,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    signup,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <UserProvider>
      <ClientProvider>
        <AuthActionsProvider>
          <AuthSessionProvider>
            <AuthContextProvider>
              {children}
            </AuthContextProvider>
          </AuthSessionProvider>
        </AuthActionsProvider>
      </ClientProvider>
    </UserProvider>
  );
};

export default AuthProvider;
