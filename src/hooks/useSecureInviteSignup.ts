
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface InviteSignupData {
  email: string;
  password: string;
  name: string;
  token?: string;
}

interface InviteData {
  email: string;
  inviter_name: string;
  company_id: string;
  message?: string;
}

interface CompanyData {
  name: string;
}

export const useSecureInviteSignup = (token?: string | null) => {
  const [loading, setLoading] = useState(false);
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      validateInvite(token);
    }
  }, [token]);

  const validateInvite = async (inviteToken: string) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔐 Validando convite:', inviteToken);

      const { data: inviteResult, error: inviteError } = await supabase
        .rpc('validate_invitation_token', { p_token: inviteToken });

      if (inviteError) {
        console.error('❌ Erro ao validar token:', inviteError);
        setError('Token de convite inválido');
        return;
      }

      if (!inviteResult || inviteResult.length === 0 || !inviteResult[0].is_valid) {
        setError('Convite inválido ou expirado');
        return;
      }

      const invitation = inviteResult[0];
      console.log('✅ Convite válido:', invitation);

      setInviteData({
        email: invitation.email,
        inviter_name: invitation.inviter_name,
        company_id: invitation.company_id,
        message: invitation.message
      });

      // Buscar dados da empresa
      const { data: company, error: companyError } = await supabase
        .from('client_profiles')
        .select('name, company')
        .eq('id', invitation.company_id)
        .single();

      if (companyError) {
        console.error('❌ Erro ao buscar empresa:', companyError);
      } else {
        setCompanyData({
          name: company.company || company.name
        });
      }
    } catch (err) {
      console.error('❌ Erro na validação:', err);
      setError('Erro ao validar convite');
    } finally {
      setLoading(false);
    }
  };

  const acceptInvite = async (data: InviteSignupData) => {
    if (!token) {
      return { success: false, error: 'Token não encontrado' };
    }

    return await signUpWithInvite({ ...data, token });
  };

  const signUpWithInvite = async (data: InviteSignupData) => {
    setLoading(true);
    
    try {
      console.log('🔐 Iniciando signup com convite:', { email: data.email, token: data.token });

      if (!data.token) {
        throw new Error('Token é obrigatório');
      }

      // Validar o token primeiro
      const { data: inviteDataResult, error: inviteError } = await supabase
        .rpc('validate_invitation_token', { p_token: data.token });

      if (inviteError) {
        console.error('❌ Erro ao validar token:', inviteError);
        throw new Error('Token de convite inválido');
      }

      if (!inviteDataResult || inviteDataResult.length === 0 || !inviteDataResult[0].is_valid) {
        throw new Error('Convite inválido ou expirado');
      }

      const invitation = inviteDataResult[0];
      console.log('✅ Convite válido:', invitation);

      // Criar conta do usuário
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            full_name: data.name
          }
        }
      });

      if (signUpError) {
        console.error('❌ Erro no signup:', signUpError);
        throw signUpError;
      }

      if (!authData.user) {
        throw new Error('Erro ao criar conta do usuário');
      }

      console.log('✅ Usuário criado:', authData.user.id);

      // Buscar dados da empresa do convite
      const { data: companyDataResult, error: companyError } = await supabase
        .from('client_profiles')
        .select('company, cnpj')
        .eq('id', invitation.company_id)
        .single();

      if (companyError) {
        console.error('❌ Erro ao buscar dados da empresa:', companyError);
        throw new Error('Erro ao obter dados da empresa');
      }

      console.log('✅ Dados da empresa obtidos:', companyDataResult);

      // Buscar dados do convite na tabela team_invitations para pegar hierarchy_level_id
      const { data: teamInviteData, error: teamInviteError } = await supabase
        .from('team_invitations')
        .select('hierarchy_level_id')
        .eq('token', data.token)
        .eq('status', 'pending')
        .single();

      if (teamInviteError) {
        console.error('❌ Erro ao buscar dados do team invite:', teamInviteError);
      }

      // Aceitar o convite usando a função do banco
      const { data: acceptData, error: acceptError } = await supabase
        .rpc('accept_team_invitation', {
          p_token: data.token,
          p_user_id: authData.user.id
        });

      if (acceptError) {
        console.error('❌ Erro ao aceitar convite:', acceptError);
        throw new Error('Erro ao aceitar convite da equipe');
      }

      console.log('✅ Convite aceito com sucesso:', acceptData);

      toast.success('Conta criada com sucesso!', {
        description: 'Verifique seu email para confirmar a conta e fazer login.'
      });

      return { success: true, user: authData.user };

    } catch (error: any) {
      console.error('❌ Erro completo no signup:', error);
      toast.error('Erro ao criar conta', {
        description: error.message || 'Tente novamente mais tarde.'
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    signUpWithInvite,
    acceptInvite,
    loading,
    inviteData,
    companyData,
    error
  };
};
