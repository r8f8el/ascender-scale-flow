
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TeamMember {
  id: string;
  company_id: string;
  user_id?: string;
  invited_email: string;
  name: string;
  hierarchy_level_id: string;
  status: 'pending' | 'active' | 'inactive';
  invited_by: string;
  invited_at: string;
  joined_at?: string;
  hierarchy_levels?: {
    name: string;
    level: number;
    can_approve: boolean;
    can_invite_members: boolean;
  };
}

export interface HierarchyLevel {
  id: string;
  name: string;
  level: number;
  description?: string;
  can_approve: boolean;
  can_invite_members: boolean;
  can_manage_permissions: boolean;
}

export const useSecureTeamMembers = () => {
  return useQuery({
    queryKey: ['secure-team-members'],
    queryFn: async () => {
      console.log('🔍 Buscando membros da equipe...');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('❌ Usuário não autenticado');
        throw new Error('Usuário não autenticado');
      }

      console.log('👤 Usuário autenticado:', user.id);

      const { data, error } = await supabase
        .from('team_members')
        .select(`
          *,
          hierarchy_levels(
            name,
            level,
            can_approve,
            can_invite_members
          )
        `)
        .order('invited_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar membros da equipe:', error);
        throw error;
      }

      console.log('✅ Membros da equipe encontrados:', data?.length || 0);
      return data as TeamMember[];
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
    retry: (failureCount, error: any) => {
      // Não retry em erros de autenticação ou autorização
      if (error?.code === 'PGRST301' || error?.code === '42501' || error?.status === 401 || error?.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: 1000,
  });
};

export const useSecureCompanyTeamMembers = () => {
  return useQuery({
    queryKey: ['secure-company-team-members'],
    queryFn: async () => {
      console.log('🔍 Buscando membros da empresa...');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('❌ Usuário não autenticado');
        throw new Error('Usuário não autenticado');
      }

      console.log('👤 Buscando empresa do usuário:', user.id);

      // Buscar perfil do usuário atual para obter a empresa
      const { data: userProfile, error: profileError } = await supabase
        .from('client_profiles')
        .select('company')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('❌ Erro ao buscar perfil do usuário:', profileError);
        throw profileError;
      }

      if (!userProfile?.company) {
        console.log('⚠️ Usuário não tem empresa definida');
        return [];
      }

      console.log('🏢 Empresa do usuário:', userProfile.company);

      // Buscar todos os membros da mesma empresa
      const { data, error } = await supabase
        .from('client_profiles')
        .select(`
          id,
          name,
          email,
          is_primary_contact,
          hierarchy_levels(
            name,
            level,
            can_approve,
            can_invite_members
          )
        `)
        .eq('company', userProfile.company)
        .order('is_primary_contact', { ascending: false })
        .order('name');

      if (error) {
        console.error('❌ Erro ao buscar membros da empresa:', error);
        throw error;
      }

      console.log('✅ Membros da empresa encontrados:', data?.length || 0);
      return data || [];
    },
    staleTime: 3 * 60 * 1000, // 3 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: (failureCount, error: any) => {
      // Não retry em erros de autenticação ou autorização
      if (error?.code === 'PGRST301' || error?.code === '42501' || error?.status === 401 || error?.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: 1000,
  });
};

export const useHierarchyLevels = () => {
  return useQuery({
    queryKey: ['hierarchy-levels'],
    queryFn: async () => {
      console.log('🔍 Buscando níveis hierárquicos...');
      
      const { data, error } = await supabase
        .from('hierarchy_levels')
        .select('*')
        .order('level');

      if (error) {
        console.error('❌ Erro ao buscar níveis hierárquicos:', error);
        throw error;
      }

      console.log('✅ Níveis hierárquicos encontrados:', data?.length || 0);
      return data as HierarchyLevel[];
    },
    staleTime: 10 * 60 * 1000, // 10 minutos (dados estáticos)
    gcTime: 30 * 60 * 1000, // 30 minutos
  });
};

export const useInviteSecureTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, name, hierarchyLevelId }: {
      email: string;
      name: string;
      hierarchyLevelId: string;
    }) => {
      console.log('📧 Enviando convite para membro da equipe:', { email, name, hierarchyLevelId });

      const { data, error } = await supabase.rpc('invite_team_member_secure', {
        p_email: email,
        p_name: name,
        p_hierarchy_level_id: hierarchyLevelId
      });

      if (error) {
        console.error('❌ Erro ao enviar convite:', error);
        throw error;
      }

      console.log('✅ Convite enviado com sucesso:', data);
      return data;
    },
    onSuccess: () => {
      // Invalidar caches para recarregar dados
      queryClient.invalidateQueries({ queryKey: ['secure-team-members'] });
      queryClient.invalidateQueries({ queryKey: ['secure-company-team-members'] });
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      queryClient.invalidateQueries({ queryKey: ['company-team-members'] });
      
      toast.success('Convite enviado com sucesso!', {
        description: 'O membro receberá um email com instruções para se juntar à equipe.',
      });
    },
    onError: (error: any) => {
      console.error('❌ Erro ao enviar convite:', error);
      
      let errorMessage = 'Erro ao enviar convite';
      
      if (error.message?.includes('já existe um convite pendente')) {
        errorMessage = 'Já existe um convite pendente para este email';
      } else if (error.message?.includes('já é membro')) {
        errorMessage = 'Este usuário já é membro da equipe';
      } else if (error.message?.includes('Apenas contatos primários')) {
        errorMessage = 'Apenas contatos primários podem convidar membros';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error('Erro ao enviar convite', {
        description: errorMessage,
      });
    }
  });
};
