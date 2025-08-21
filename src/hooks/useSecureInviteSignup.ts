
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SecureInviteData {
  id: string;
  email: string;
  inviter_name: string;
  company_name: string;
  company_id: string;
  message?: string;
  expires_at: string;
  status: string;
}

export interface CompanyData {
  id: string;
  name: string;
  company: string;
}

export const useSecureInviteSignup = (token: string | null) => {
  const [inviteData, setInviteData] = useState<SecureInviteData | null>(null);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Token de convite não fornecido');
      setLoading(false);
      return;
    }

    const validateInvite = async () => {
      try {
        console.log('🔍 Validando convite seguro com token:', token);
        
        const { data: inviteValidation, error: inviteError } = await supabase
          .rpc('validate_invitation_token', { p_token: token });

        if (inviteError) {
          console.error('❌ Erro ao validar convite:', inviteError);
          throw inviteError;
        }

        if (!inviteValidation || inviteValidation.length === 0) {
          console.log('⚠️ Convite não encontrado ou inválido');
          setError('Convite não encontrado ou inválido');
          return;
        }

        const invite = inviteValidation[0];
        console.log('✅ Convite validado:', invite);

        if (!invite.is_valid) {
          console.log('⚠️ Convite expirado ou já usado');
          setError('Convite expirado ou já foi usado');
          return;
        }

        setInviteData({
          id: invite.invitation_id,
          email: invite.email,
          inviter_name: invite.inviter_name,
          company_name: invite.inviter_name || 'Empresa',
          company_id: invite.company_id,
          message: invite.message,
          expires_at: new Date().toISOString(), // Usar data atual como fallback
          status: 'pending'
        });

        // Buscar dados da empresa
        const { data: company, error: companyError } = await supabase
          .from('client_profiles')
          .select('id, name, company')
          .eq('id', invite.company_id)
          .single();

        if (company && !companyError) {
          setCompanyData(company);
        }

      } catch (error: any) {
        console.error('❌ Erro na validação do convite:', error);
        setError(error.message || 'Erro ao validar convite');
      } finally {
        setLoading(false);
      }
    };

    validateInvite();
  }, [token]);

  const acceptInvite = async (userData: {
    name: string;
    email: string;
    password: string;
  }) => {
    if (!inviteData || !token) {
      return { success: false, error: 'Dados do convite não disponíveis' };
    }

    try {
      console.log('📝 Processando inscrição segura:', userData.email);

      // 1. Criar conta de usuário
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name
          }
        }
      });

      if (signupError) {
        console.error('❌ Erro no signup:', signupError);
        throw signupError;
      }

      if (!signupData.user) {
        throw new Error('Usuário não foi criado');
      }

      console.log('✅ Usuário criado:', signupData.user.id);

      // 2. Aceitar o convite
      const { data: acceptResult, error: acceptError } = await supabase
        .rpc('accept_team_invitation', {
          p_token: token,
          p_user_id: signupData.user.id
        });

      if (acceptError) {
        console.error('❌ Erro ao aceitar convite:', acceptError);
        throw acceptError;
      }

      console.log('✅ Convite aceito com sucesso');
      return { success: true };

    } catch (error: any) {
      console.error('❌ Erro no processo de inscrição:', error);
      return { 
        success: false, 
        error: error.message || 'Erro ao processar inscrição' 
      };
    }
  };

  return {
    inviteData,
    companyData,
    loading,
    error,
    acceptInvite
  };
};
