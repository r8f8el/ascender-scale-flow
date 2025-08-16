
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

      // Use secure validation function
      const { data: validationResult, error: validationError } = await supabase
        .rpc('validate_invitation_token', { p_token: token });

      if (validationError) {
        console.error('Erro ao validar convite:', validationError);
        setError('Erro ao validar convite');
        return;
      }

      if (!validationResult || validationResult.length === 0) {
        setError('Convite não encontrado');
        return;
      }

      const invite = validationResult[0];

      if (!invite.is_valid) {
        setError('Este convite expirou ou é inválido');
        return;
      }

      setInviteData(invite);

      // Fetch company data
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
      // Input validation and sanitization
      const sanitizedData = {
        email: signupData.email.trim().toLowerCase(),
        name: signupData.name.trim(),
        password: signupData.password
      };

      if (sanitizedData.password.length < 8) {
        return { success: false, error: 'Senha deve ter pelo menos 8 caracteres' };
      }

      // Create user account
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: sanitizedData.email,
        password: sanitizedData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/cliente/login`,
          data: {
            full_name: sanitizedData.name,
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

      // Update invitation status securely
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
