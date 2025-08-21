
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

interface SignupData {
  name: string;
  email: string;
  password: string;
  token: string;
}

interface CompanyData {
  name: string;
}

interface AcceptInviteResult {
  success: boolean;
  error?: string;
  company_name?: string;
  user_id?: string;
}

export const useSecureInviteSignup = (token?: string | null) => {
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const validateToken = async (tokenToValidate: string) => {
    try {
      setLoading(true);
      console.log('🔍 Validando token de convite:', tokenToValidate);

      const { data, error } = await supabase
        .rpc('validate_invitation_token', {
          p_token: tokenToValidate
        });

      if (error) {
        console.error('❌ Erro ao validar token:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.log('⚠️ Token não encontrado');
        return null;
      }

      const invite = data[0];
      console.log('✅ Token válido:', invite);

      if (!invite.is_valid) {
        console.log('❌ Token inválido ou expirado');
        return null;
      }

      setInviteData(invite);
      return invite;
    } catch (error) {
      console.error('❌ Erro na validação do token:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const signupMutation = useMutation({
    mutationFn: async (data: SignupData) => {
      console.log('🚀 Iniciando cadastro com convite...');

      // Verificar se o token ainda é válido
      const validInvite = await validateToken(data.token);
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
            invited_via_token: data.token
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
          p_token: data.token,
          p_user_id: authData.user.id
        }) as { data: AcceptInviteResult | null, error: any };

      if (acceptError) {
        console.error('❌ Erro ao aceitar convite:', acceptError);
        throw acceptError;
      }

      // Verificar se a função retornou sucesso
      if (!acceptResult || !acceptResult.success) {
        console.error('❌ Erro na função de aceitar convite:', acceptResult?.error);
        throw new Error(acceptResult?.error || 'Erro ao processar convite');
      }

      console.log('✅ Convite aceito com sucesso:', acceptResult);

      // Invalidar caches para forçar recarregamento dos dados
      queryClient.invalidateQueries({ queryKey: ['company-access'] });
      queryClient.invalidateQueries({ queryKey: ['company-data'] });
      queryClient.invalidateQueries({ queryKey: ['secure-team-members'] });
      queryClient.invalidateQueries({ queryKey: ['secure-company-team-members'] });
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      queryClient.invalidateQueries({ queryKey: ['company-team-members'] });

      console.log('🔄 Caches invalidados, dados serão recarregados');

      return {
        user: authData.user,
        session: authData.session,
        companyName: acceptResult.company_name
      };
    },
    onSuccess: (result) => {
      console.log('🎉 Cadastro completado com sucesso!');
      toast.success('Conta criada com sucesso!', {
        description: `Bem-vindo à ${result.companyName || 'equipe'}! Você pode fazer login agora.`,
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

  return {
    inviteData,
    loading,
    validateToken,
    signup: signupMutation.mutate,
    isSigningUp: signupMutation.isPending,
    signupError: signupMutation.error
  };
};
