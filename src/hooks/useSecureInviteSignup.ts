
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface InviteSignupData {
  email: string;
  password: string;
  name: string;
  token: string;
}

export const useSecureInviteSignup = () => {
  const [loading, setLoading] = useState(false);

  const signUpWithInvite = async (data: InviteSignupData) => {
    setLoading(true);
    
    try {
      console.log('🔐 Iniciando signup com convite:', { email: data.email, token: data.token });

      // Validar o token primeiro
      const { data: inviteData, error: inviteError } = await supabase
        .rpc('validate_invitation_token', { p_token: data.token });

      if (inviteError) {
        console.error('❌ Erro ao validar token:', inviteError);
        throw new Error('Token de convite inválido');
      }

      if (!inviteData || inviteData.length === 0 || !inviteData[0].is_valid) {
        throw new Error('Convite inválido ou expirado');
      }

      const invitation = inviteData[0];
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
      const { data: companyData, error: companyError } = await supabase
        .from('client_profiles')
        .select('company, cnpj')
        .eq('id', invitation.company_id)
        .single();

      if (companyError) {
        console.error('❌ Erro ao buscar dados da empresa:', companyError);
        throw new Error('Erro ao obter dados da empresa');
      }

      console.log('✅ Dados da empresa obtidos:', companyData);

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

      // Criar perfil do cliente com os mesmos dados da empresa
      const { error: profileError } = await supabase
        .from('client_profiles')
        .upsert({
          id: authData.user.id,
          name: data.name,
          email: data.email,
          company: companyData.company,
          cnpj: companyData.cnpj,
          is_primary_contact: false,
          hierarchy_level_id: teamInviteData?.hierarchy_level_id || null
        });

      if (profileError) {
        console.error('❌ Erro ao criar perfil:', profileError);
        throw new Error('Erro ao criar perfil do usuário');
      }

      console.log('✅ Perfil criado com sucesso');

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
    loading
  };
};
