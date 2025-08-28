
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface InviteData {
  invitation_id: string;
  email: string;
  company_id: string;
  company_name: string;
  inviter_name: string;
  message: string;
  hierarchy_level_id: string;
  is_valid: boolean;
}

interface CompanyData {
  name: string;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
}

interface AcceptInviteResult {
  success: boolean;
  error?: string;
  company_name?: string;
  user_id?: string;
}

export const useSecureInviteSignup = (token?: string | null) => {
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const validateToken = async (tokenToValidate: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Validando token de convite:', tokenToValidate);

      const { data, error: validationError } = await supabase
        .rpc('get_invitation_by_token', {
          p_token: tokenToValidate
        });

      if (validationError) {
        console.error('❌ Erro ao validar token:', validationError);
        setError('Erro ao validar convite: ' + validationError.message);
        return null;
      }

      console.log('📋 Dados retornados pela função RPC:', data);

      if (!data || data.length === 0) {
        console.log('⚠️ Token não encontrado');
        setError('Convite não encontrado ou token inválido');
        return null;
      }

      const invite = data[0];
      console.log('✅ Convite encontrado:', invite);

      if (!invite.is_valid) {
        console.log('❌ Token inválido ou expirado');
        setError('Convite inválido ou expirado');
        return null;
      }

      // Estruturar os dados do convite
      const inviteDataFormatted: InviteData = {
        invitation_id: invite.invitation_id,
        email: invite.email,
        company_id: invite.company_id,
        company_name: invite.company_name || 'Empresa',
        inviter_name: invite.inviter_name || 'Administrador',
        message: invite.message || '',
        hierarchy_level_id: invite.hierarchy_level_id || '',
        is_valid: invite.is_valid
      };

      setInviteData(inviteDataFormatted);
      
      // Definir dados da empresa
      setCompanyData({ 
        name: invite.company_name || 'Empresa' 
      });

      return invite;
    } catch (err) {
      console.error('❌ Erro na validação do token:', err);
      setError('Erro interno na validação do convite');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Validar token automaticamente quando fornecido
  useEffect(() => {
    if (token) {
      console.log('🔍 useSecureInviteSignup - Validando token:', token);
      validateToken(token);
    }
  }, [token]);

  const signupMutation = useMutation({
    mutationFn: async (data: SignupData): Promise<AcceptInviteResult> => {
      if (!token) {
        throw new Error('Token de convite não fornecido');
      }

      console.log('🚀 Iniciando cadastro com convite...');

      // Verificar se o token ainda é válido
      const validInvite = await validateToken(token);
      if (!validInvite) {
        throw new Error('Token de convite inválido ou expirado');
      }

      console.log('📧 Criando conta de usuário...');
      
      // Criar conta de usuário
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            invited_via_token: token
          },
          emailRedirectTo: `${window.location.origin}/cliente/login`
        }
      });

      if (authError) {
        console.error('❌ Erro ao criar usuário:', authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Usuário não foi criado corretamente');
      }

      console.log('✅ Usuário criado com sucesso:', authData.user.id);

      // Aguardar um pouco para garantir que o trigger foi executado
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('🤝 Aceitando convite da equipe...');
      
      // Aceitar o convite da equipe usando a função RPC
      const { data: acceptResult, error: acceptError } = await supabase
        .rpc('accept_team_invitation', {
          p_token: token,
          p_user_id: authData.user.id
        });

      if (acceptError) {
        console.error('❌ Erro ao aceitar convite:', acceptError);
        throw acceptError;
      }

      console.log('✅ Resultado do aceite do convite:', acceptResult);

      // Invalidar caches para forçar recarregamento dos dados
      queryClient.invalidateQueries({ queryKey: ['company-access'] });
      queryClient.invalidateQueries({ queryKey: ['company-data'] });
      queryClient.invalidateQueries({ queryKey: ['secure-team-members'] });
      queryClient.invalidateQueries({ queryKey: ['secure-company-team-members'] });
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      queryClient.invalidateQueries({ queryKey: ['company-team-members'] });

      console.log('🔄 Caches invalidados, dados serão recarregados');

      return {
        success: true,
        company_name: companyData?.name,
        user_id: authData.user.id
      };
    },
    onSuccess: (result) => {
      console.log('🎉 Cadastro completado com sucesso!');
      toast.success('Conta criada com sucesso!', {
        description: `Bem-vindo à ${result.company_name || 'equipe'}! Você pode fazer login agora.`,
        duration: 8000
      });
    },
    onError: (error: any) => {
      console.error('❌ Erro no cadastro:', error);
      let errorMessage = 'Erro ao criar conta';
      
      if (error.message?.includes('User already registered')) {
        errorMessage = 'Este email já está cadastrado. Tente fazer login.';
      } else if (error.message?.includes('Password should be at least')) {
        errorMessage = 'A senha deve ter pelo menos 6 caracteres';
      } else if (error.message?.includes('Invalid email')) {
        errorMessage = 'Email inválido';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error('Erro ao criar conta', {
        description: errorMessage,
        duration: 8000
      });
    }
  });

  const acceptInvite = async (data: SignupData): Promise<AcceptInviteResult> => {
    return new Promise<AcceptInviteResult>((resolve, reject) => {
      signupMutation.mutate(data, {
        onSuccess: (result) => resolve(result),
        onError: (error) => reject(error)
      });
    });
  };

  return {
    inviteData,
    companyData,
    loading,
    error,
    validateToken,
    acceptInvite,
    signup: signupMutation.mutate,
    isSigningUp: signupMutation.isPending,
    signupError: signupMutation.error
  };
};
