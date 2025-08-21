
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface InviteData {
  invitation_id: string;
  email: string;
  company_id: string;
  inviter_name: string;
  message: string;
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
        .rpc('validate_invitation_token', {
          p_token: tokenToValidate
        });

      if (validationError) {
        console.error('❌ Erro ao validar token:', validationError);
        setError(validationError.message || 'Erro ao validar token');
        return null;
      }

      if (!data || data.length === 0) {
        console.log('⚠️ Token não encontrado');
        setError('Token não encontrado ou inválido');
        return null;
      }

      const invite = data[0];
      console.log('✅ Token válido:', invite);

      if (!invite.is_valid) {
        console.log('❌ Token inválido ou expirado');
        setError('Token inválido ou expirado');
        return null;
      }

      setInviteData(invite);
      
      // Buscar dados da empresa
      const { data: companyInfo, error: companyError } = await supabase
        .from('clients')
        .select('name')
        .eq('id', invite.company_id)
        .single();
      
      if (!companyError && companyInfo) {
        setCompanyData({ name: companyInfo.name });
      }

      return invite;
    } catch (err) {
      console.error('❌ Erro na validação do token:', err);
      setError('Erro interno na validação');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Validar token automaticamente quando fornecido
  useState(() => {
    if (token) {
      validateToken(token);
    }
  });

  const signupMutation = useMutation({
    mutationFn: async (data: SignupData) => {
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
          }
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

      // Verificar se a função retornou sucesso
      const result = acceptResult as AcceptInviteResult;
      if (!result || !result.success) {
        console.error('❌ Erro na função de aceitar convite:', result?.error);
        throw new Error(result?.error || 'Erro ao processar convite');
      }

      console.log('✅ Convite aceito com sucesso:', result);

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
        user: authData.user,
        session: authData.session,
        company_name: result.company_name
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

  const acceptInvite = async (data: SignupData) => {
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
