
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
    console.log('🔧 AuthProvider: Iniciando configuração do listener de auth...');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state mudou:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('👤 Usuário encontrado na sessão:', session.user.email);
          console.log('🆔 User ID:', session.user.id);
          
          try {
            // Verificar se é admin primeiro
            console.log('🔍 Verificando se é admin...');
            const { data: adminProfile, error: adminError } = await supabase
              .from('admin_profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();
            
            console.log('👔 Resultado verificação admin:', { adminProfile, adminError });
            
            if (adminProfile && !adminError) {
              console.log('⚠️ Usuário é admin, não definindo como cliente');
              setClient(null);
              setIsAuthenticated(false);
              return;
            }
            
            // Verificar perfil de cliente
            console.log('👥 Verificando perfil de cliente...');
            const { data: clientProfile, error: clientError } = await supabase
              .from('client_profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();
            
            console.log('📋 Resultado perfil cliente:', { clientProfile, clientError });
            
            if (clientProfile && !clientError) {
              const client = {
                id: clientProfile.id,
                name: clientProfile.name,
                email: clientProfile.email
              };
              console.log('✅ Cliente encontrado, definindo estado:', client);
              setClient(client);
              setIsAuthenticated(true);
              localStorage.setItem('ascalate_client', JSON.stringify(client));
            } else {
              console.log('🔨 Perfil de cliente não encontrado, criando...');
              
              // Tentar criar perfil de cliente
              const { data: newProfile, error: createError } = await supabase
                .from('client_profiles')
                .insert({
                  id: session.user.id,
                  name: session.user.email?.split('@')[0] || 'Cliente',
                  email: session.user.email || '',
                  company: session.user.email?.includes('portobello') ? 'Portobello' : 
                          session.user.email?.includes('jassy') ? 'J.Assy' : 
                          session.user.email?.includes('@ascalate') ? 'Ascalate' : null
                })
                .select()
                .single();
              
              console.log('🆕 Resultado criação perfil:', { newProfile, createError });
              
              if (newProfile && !createError) {
                const client = {
                  id: newProfile.id,
                  name: newProfile.name,
                  email: newProfile.email
                };
                console.log('✅ Perfil criado com sucesso:', client);
                setClient(client);
                setIsAuthenticated(true);
                localStorage.setItem('ascalate_client', JSON.stringify(client));
              } else {
                console.error('❌ Falha ao criar perfil de cliente:', createError);
                setClient(null);
                setIsAuthenticated(false);
                localStorage.removeItem('ascalate_client');
              }
            }
          } catch (error) {
            console.error('💥 Erro durante verificação de perfis:', error);
            setClient(null);
            setIsAuthenticated(false);
            localStorage.removeItem('ascalate_client');
          }
        } else {
          console.log('🚪 Sem usuário na sessão, limpando estado...');
          setClient(null);
          setIsAuthenticated(false);
          localStorage.removeItem('ascalate_client');
        }
      }
    );

    // Verificar sessão existente
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('📱 Sessão existente encontrada:', !!session);
      if (session?.user) {
        console.log('👤 Usuário na sessão existente:', session.user.email);
      }
    });

    return () => {
      console.log('🧹 Limpando subscription do auth listener');
      subscription.unsubscribe();
    };
  }, []);
  
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 Tentativa de login para:', email);
      console.log('🔑 Senha fornecida:', password ? `${password.length} caracteres` : 'vazia');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      console.log('📡 Resposta do Supabase login:', { 
        user: data.user?.email, 
        session: !!data.session,
        error: error 
      });

      if (error) {
        console.error('❌ Erro no login Supabase:', error.message);
        return false;
      }

      if (data.user) {
        console.log('✅ Login bem-sucedido para:', data.user.email);
        // O auth state change vai lidar com o resto
        return true;
      }

      console.warn('⚠️ Login sem erro mas sem usuário retornado');
      return false;
    } catch (error) {
      console.error('💥 Erro durante tentativa de login:', error);
      return false;
    }
  };
  
  const logout = async () => {
    try {
      console.log('🚪 Fazendo logout...');
      await supabase.auth.signOut();
    } catch (error) {
      console.error('❌ Erro durante logout:', error);
      // Fallback para limpeza manual
      setClient(null);
      setUser(null);
      setSession(null);
      setIsAuthenticated(false);
      localStorage.removeItem('ascalate_client');
    }
  };
  
  return (
    <AuthContext.Provider value={{ isAuthenticated, client, user, session, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
