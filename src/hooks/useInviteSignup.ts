
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Interface para os dados do convite
 */
interface InviteData {
  id: string;
  email: string;
  inviter_name: string;
  company_id: string;
  message?: string;
  expires_at: string;
  status: 'pending' | 'accepted' | 'expired';
}

/**
 * Interface para os dados da empresa
 */
interface CompanyData {
  id: string;
  name: string;
  company?: string;
}

/**
 * Interface para os dados de inscrição
 */
interface SignupData {
  name: string;
  email: string;
  password: string;
}

/**
 * Interface para o resultado da aceitação do convite
 */
interface AcceptInviteResult {
  success: boolean;
  error?: string;
  user?: any;
}

/**
 * Hook customizado para gerenciar convites de inscrição
 * 
 * @param token - Token do convite
 * @param inviteId - ID do convite
 * @returns Objeto com dados do convite, empresa e funções de gerenciamento
 */
export const useInviteSignup = (token: string | null, inviteId: string | null) => {
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Carrega os dados do convite
   */
  const loadInviteData = async () => {
    if (!token && !inviteId) {
      setError('Token ou ID do convite não fornecido');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Busca dados do convite
      let query = supabase
        .from('team_invitations')
        .select(`
          id,
          email,
          inviter_name,
          company_id,
          message,
          expires_at,
          status,
          token
        `);

      // Adiciona filtro baseado no parâmetro disponível
      if (token) {
        query = query.eq('token', token);
      } else if (inviteId) {
        query = query.eq('id', inviteId);
      }

      const { data: invite, error: inviteError } = await query.maybeSingle();

      if (inviteError) {
        console.error('Erro ao buscar convite:', inviteError);
        setError('Convite não encontrado ou inválido');
        return;
      }
      
      if (!invite) {
        setError('Convite não encontrado');
        return;
      }

      // Verifica se o convite não expirou
      const now = new Date();
      const expiresAt = new Date(invite.expires_at);
      
      if (now > expiresAt) {
        setError('Este convite expirou');
        return;
      }

      // Verifica status do convite para mensagens mais claras
      if (invite.status === 'accepted') {
        setError('Este convite já foi aceito');
        return;
      }

      // Cast the status to the correct type
      const inviteDataWithCorrectTypes: InviteData = {
        ...invite,
        status: invite.status as 'pending' | 'accepted' | 'expired'
      };

      setInviteData(inviteDataWithCorrectTypes);

      // Busca dados da empresa usando client_profiles
      if (invite.company_id) {
        const { data: company, error: companyError } = await supabase
          .from('client_profiles')
          .select('id, name, company')
          .eq('id', invite.company_id)
          .maybeSingle();

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

  /**
   * Aceita o convite e cria a conta do usuário
   */
  const acceptInvite = async (signupData: SignupData): Promise<AcceptInviteResult> => {
    if (!inviteData) {
      return { success: false, error: 'Dados do convite não disponíveis' };
    }

    try {
      // Revalida status e expiração por segurança
      const now = new Date();
      const expiresAt = new Date(inviteData.expires_at);
      if (now > expiresAt) {
        return { success: false, error: 'Este convite expirou' };
      }
      if (inviteData.status === 'accepted') {
        return { success: false, error: 'Este convite já foi aceito' };
      }

      // Busca um nível hierárquico padrão (nível mais baixo disponível)
      const { data: hierarchyLevels, error: hierarchyError } = await supabase
        .from('hierarchy_levels')
        .select('id, level')
        .order('level', { ascending: true })
        .limit(1);

      const defaultHierarchyLevelId = hierarchyLevels?.[0]?.id;

      if (!defaultHierarchyLevelId) {
        console.warn('Nenhum nível hierárquico encontrado, continuando sem ele');
      }

      // Cria a conta do usuário no Supabase Auth
      const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/cliente/login` : undefined;
      const signUpOptions: any = {
        data: {
          full_name: signupData.name,
          company_id: inviteData.company_id
        }
      };
      if (redirectUrl) {
        signUpOptions.emailRedirectTo = redirectUrl;
      }

      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: signUpOptions
      });

      if (signUpError) {
        console.error('Erro na criação da conta:', signUpError);
        
        // Mensagens de erro mais amigáveis
        if (signUpError.message.includes('already registered')) {
          return { success: false, error: 'Este email já está cadastrado' };
        }
        
        return { success: false, error: signUpError.message };
      }

      if (!authData.user) {
        return { success: false, error: 'Erro ao criar usuário' };
      }

      // Atualiza o status do convite para aceito
      const { error: updateError } = await supabase
        .from('team_invitations')
        .update({ 
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', inviteData.id);

      if (updateError) {
        console.error('Erro ao atualizar convite:', updateError);
        // Não falha a operação, apenas loga o erro
      }

      // Cria o perfil do usuário na tabela client_profiles
      const { error: profileError } = await supabase
        .from('client_profiles')
        .insert({
          id: authData.user.id,
          name: signupData.name,
          email: signupData.email,
          company: companyData?.company || companyData?.name,
          is_primary_contact: false,
          hierarchy_level_id: defaultHierarchyLevelId
        });

      if (profileError) {
        console.error('Erro ao criar perfil:', profileError);
        // Não falha a operação, o perfil pode ser criado via trigger
      }

      // Adiciona o usuário à equipe da empresa usando team_members
      const teamMemberData: any = {
        user_id: authData.user.id,
        company_id: inviteData.company_id,
        status: 'active',
        invited_by: inviteData.inviter_name,
        joined_at: new Date().toISOString(),
        invited_email: signupData.email,
        name: signupData.name
      };

      // Adiciona hierarchy_level_id apenas se encontrado
      if (defaultHierarchyLevelId) {
        teamMemberData.hierarchy_level_id = defaultHierarchyLevelId;
      }

      const { error: teamError } = await supabase
        .from('team_members')
        .insert(teamMemberData);

      if (teamError) {
        console.error('Erro ao adicionar à equipe:', teamError);
        // Não falha a operação principal
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

  // Carrega os dados do convite quando o componente monta
  useEffect(() => {
    loadInviteData();
  }, [token, inviteId]);

  return {
    inviteData,
    companyData,
    loading,
    error,
    acceptInvite,
    reloadInvite: loadInviteData
  };
};
