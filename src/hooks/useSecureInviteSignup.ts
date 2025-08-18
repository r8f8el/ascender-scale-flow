
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SecureInviteData {
  id: string;
  email: string;
  inviter_name: string;
  company_id: string;
  message?: string;
  is_valid: boolean;
}

interface CompanyData {
  id: string;
  name: string;
  company?: string;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
}

interface AcceptInviteResult {
  success: boolean;
  error?: string;
  user?: any;
}

export const useSecureInviteSignup = (token: string | null) => {
  const [inviteData, setInviteData] = useState<SecureInviteData | null>(null);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInviteData = async () => {
    if (!token) {
      setError('Token de convite não fornecido');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Buscar convite usando o token
      const { data: invite, error: inviteError } = await supabase
        .from('team_invitations')
        .select('*')
        .eq('token', token)
        .eq('status', 'pending')
        .single();

      if (inviteError || !invite) {
        console.error('Erro ao validar convite:', inviteError);
        setError('Convite não encontrado ou inválido');
        return;
      }

      // Verificar se o convite não expirou
      const now = new Date();
      const expiresAt = new Date(invite.expires_at);
      
      if (now > expiresAt) {
        setError('Este convite expirou');
        return;
      }

      const mappedInvite: SecureInviteData = {
        id: invite.id,
        email: invite.email,
        inviter_name: invite.inviter_name,
        company_id: invite.company_id,
        message: invite.message,
        is_valid: true
      };

      setInviteData(mappedInvite);

      // Buscar dados da empresa
      if (invite.company_id) {
        const { data: company, error: companyError } = await supabase
          .from('client_profiles')
          .select('id, name, company')
          .eq('id', invite.company_id)
          .single();

        if (!companyError && company) {
          setCompanyData({
            id: company.id,
            name: company.company || company.name,
            company: company.company
          });
        }
      }

    } catch (err) {
      console.error('Erro ao carregar dados do convite:', err);
      setError('Erro interno ao carregar convite');
    } finally {
      setLoading(false);
    }
  };

  const acceptInvite = async (signupData: SignupData): Promise<AcceptInviteResult> => {
    if (!inviteData) {
      return { success: false, error: 'Dados do convite não disponíveis' };
    }

    try {
      // Criar a conta do usuário
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/cliente/login`,
          data: {
            full_name: signupData.name,
            company_id: inviteData.company_id
          }
        }
      });

      if (signUpError) {
        console.error('Erro na criação da conta:', signUpError);
        
        if (signUpError.message.includes('already registered')) {
          return { success: false, error: 'Este email já está cadastrado' };
        }
        
        return { success: false, error: signUpError.message };
      }

      if (!authData.user) {
        return { success: false, error: 'Erro ao criar usuário' };
      }

      // Atualizar o status do convite para aceito
      const { error: updateError } = await supabase
        .from('team_invitations')
        .update({ 
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('token', token);

      if (updateError) {
        console.error('Erro ao atualizar convite:', updateError);
      }

      // Atualizar team_members com o user_id
      const { error: teamUpdateError } = await supabase
        .from('team_members')
        .update({
          user_id: authData.user.id,
          status: 'active',
          joined_at: new Date().toISOString()
        })
        .eq('invited_email', signupData.email)
        .eq('company_id', inviteData.company_id);

      if (teamUpdateError) {
        console.error('Erro ao atualizar membro da equipe:', teamUpdateError);
      }

      return { 
        success: true, 
        user: authData.user 
      };

    } catch (err) {
      console.error('Erro ao aceitar convite:', err);
      return { 
        success: false, 
        error: 'Erro interno ao processar inscrição' 
      };
    }
  };

  useEffect(() => {
    loadInviteData();
  }, [token]);

  return {
    inviteData,
    companyData,
    loading,
    error,
    acceptInvite,
    reloadInvite: loadInviteData
  };
};
