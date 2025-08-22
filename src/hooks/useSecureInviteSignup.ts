
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useSecureInviteValidation } from './useSecureInviteValidation';
import { useSecurityAudit } from './useSecurityAudit';

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
  const { inviteData, loading, error } = useSecureInviteValidation(token);
  const { logSecurityEvent, logAuthAttempt } = useSecurityAudit();
  const queryClient = useQueryClient();

  const signupMutation = useMutation({
    mutationFn: async (data: SignupData): Promise<AcceptInviteResult> => {
      if (!token) {
        throw new Error('Token de convite não fornecido');
      }

      if (!inviteData || !inviteData.is_valid) {
        throw new Error('Token de convite inválido ou expirado');
      }

      console.log('🔒 Iniciando cadastro seguro com convite...');

      // Log the signup attempt
      await logSecurityEvent({
        action: 'team_signup_attempt',
        resourceType: 'team_invitation',
        resourceId: inviteData.invitation_id,
        details: {
          email: data.email,
          invitedEmail: inviteData.email
        }
      });

      // Verify email matches invitation
      if (data.email !== inviteData.email) {
        throw new Error('Email não corresponde ao convite');
      }

      console.log('📧 Criando conta de usuário segura...');
      
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            invited_via_token: token,
            company_id: inviteData.company_id
          }
        }
      });

      if (authError) {
        console.error('❌ Erro ao criar usuário:', authError);
        await logAuthAttempt(data.email, false, authError.message);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Usuário não foi criado corretamente');
      }

      console.log('✅ Usuário criado com sucesso:', authData.user.id);
      await logAuthAttempt(data.email, true);

      // Wait for database triggers to process
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('🤝 Aceitando convite da equipe de forma segura...');
      
      // Accept the team invitation using secure function
      const { data: acceptResult, error: acceptError } = await supabase
        .rpc('accept_team_invitation', {
          p_token: token,
          p_user_id: authData.user.id
        });

      if (acceptError) {
        console.error('❌ Erro ao aceitar convite:', acceptError);
        await logSecurityEvent({
          action: 'team_invitation_accept_failed',
          resourceType: 'team_invitation',
          resourceId: inviteData.invitation_id,
          details: { error: acceptError.message }
        });
        throw acceptError;
      }

      console.log('✅ Convite aceito com sucesso:', acceptResult);

      await logSecurityEvent({
        action: 'team_invitation_accepted',
        resourceType: 'team_invitation',
        resourceId: inviteData.invitation_id,
        details: {
          user_id: authData.user.id,
          company_id: inviteData.company_id
        }
      });

      // Invalidate caches
      queryClient.invalidateQueries({ queryKey: ['company-access'] });
      queryClient.invalidateQueries({ queryKey: ['company-data'] });
      queryClient.invalidateQueries({ queryKey: ['secure-team-members'] });
      queryClient.invalidateQueries({ queryKey: ['secure-company-team-members'] });
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      queryClient.invalidateQueries({ queryKey: ['company-team-members'] });

      console.log('🔄 Caches invalidados com segurança');

      return {
        success: true,
        company_name: inviteData.company_name,
        user_id: authData.user.id
      };
    },
    onSuccess: (result) => {
      console.log('🎉 Cadastro seguro completado com sucesso!');
      toast.success('Conta criada com segurança!', {
        description: `Bem-vindo à ${result.company_name || 'equipe'}! Você pode fazer login agora.`,
        duration: 8000
      });
    },
    onError: (error: any) => {
      console.error('❌ Erro no cadastro seguro:', error);
      let errorMessage = 'Erro ao criar conta';
      
      if (error.message?.includes('User already registered')) {
        errorMessage = 'Este email já está cadastrado. Tente fazer login.';
      } else if (error.message?.includes('Password should be at least')) {
        errorMessage = 'A senha deve ter pelo menos 6 caracteres';
      } else if (error.message?.includes('Invalid email')) {
        errorMessage = 'Email inválido';
      } else if (error.message?.includes('Email não corresponde')) {
        errorMessage = 'O email deve corresponder ao convite recebido';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error('Erro de segurança no cadastro', {
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
    companyData: inviteData ? { name: inviteData.company_name } : null,
    loading,
    error,
    acceptInvite,
    signup: signupMutation.mutate,
    isSigningUp: signupMutation.isPending,
    signupError: signupMutation.error
  };
};
