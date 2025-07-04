
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

interface Client {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  client: Client | null;
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  client: null,
  user: null,
  session: null,
  login: async () => false,
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [client, setClient] = useState<Client | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  
  useEffect(() => {
    console.log('🔧 AuthProvider: Configurando listener de auth...');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state mudou:', event);
        console.log('📱 Session:', session ? 'presente' : 'ausente');
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('👤 Usuário logado:', session.user.email);
          
          try {
            // Buscar perfil de cliente
            const { data: clientProfile, error } = await supabase
              .from('client_profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (clientProfile && !error) {
              const client = {
                id: clientProfile.id,
                name: clientProfile.name,
                email: clientProfile.email
              };
              console.log('✅ Cliente encontrado:', client.name);
              setClient(client);
              setIsAuthenticated(true);
            } else {
              console.log('❌ Perfil de cliente não encontrado');
              setClient(null);
              setIsAuthenticated(false);
            }
          } catch (error) {
            console.error('💥 Erro ao buscar perfil:', error);
            setClient(null);
            setIsAuthenticated(false);
          }
        } else {
          console.log('🚪 Usuário deslogado');
          setClient(null);
          setIsAuthenticated(false);
        }
      }
    );

    // Verificar sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('📱 Sessão inicial:', session ? 'encontrada' : 'não encontrada');
    });

    return () => {
      console.log('🧹 Limpando subscription');
      subscription.unsubscribe();
    };
  }, []);
  
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 Tentativa de login:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      console.log('📡 Resposta do login:', { 
        success: !!data.user, 
        error: error?.message 
      });

      if (error) {
        console.error('❌ Erro no login:', error.message);
        return false;
      }

      if (data.user) {
        console.log('✅ Login bem-sucedido!');
        return true;
      }

      return false;
    } catch (error) {
      console.error('💥 Erro durante login:', error);
      return false;
    }
  };
  
  const logout = async () => {
    try {
      console.log('🚪 Fazendo logout...');
      await supabase.auth.signOut();
    } catch (error) {
      console.error('❌ Erro durante logout:', error);
    }
  };
  
  return (
    <AuthContext.Provider value={{ isAuthenticated, client, user, session, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
