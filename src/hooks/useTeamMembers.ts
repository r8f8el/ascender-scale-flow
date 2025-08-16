
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useOptimizedQuery, useStaticDataQuery } from './useOptimizedQuery';

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

export const useHierarchyLevels = () => {
  return useStaticDataQuery(
    ['hierarchy-levels'],
    async () => {
      const { data, error } = await supabase
        .from('hierarchy_levels')
        .select('*')
        .order('level');

      if (error) throw error;
      return data as HierarchyLevel[];
    }
  );
};

export const useTeamMembers = () => {
  return useOptimizedQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
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
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TeamMember[];
    },
    cacheTTL: 2 // Cache for 2 minutes since team data changes more frequently
  });
};

export const useInviteTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, name, hierarchyLevelId }: {
      email: string;
      name: string;
      hierarchyLevelId: string;
    }) => {
      const { data, error } = await supabase.rpc('invite_team_member', {
        p_email: email,
        p_name: name,
        p_hierarchy_level_id: hierarchyLevelId
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      queryClient.invalidateQueries({ queryKey: ['company-team-members'] });
      toast.success('Convite enviado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao enviar convite:', error);
      toast.error(`Erro ao enviar convite: ${error.message}`);
    }
  });
};

export const useCompanyTeamMembers = () => {
  return useOptimizedQuery({
    queryKey: ['company-team-members'],
    queryFn: async () => {
      // Buscar membros da empresa do usuário atual
      const { data: userProfile, error: profileError } = await supabase
        .from('client_profiles')
        .select('company')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (profileError) throw profileError;

      // Buscar todos os membros da mesma empresa
      const { data, error } = await supabase
        .from('client_profiles')
        .select(`
          id,
          name,
          email,
          hierarchy_levels(
            name,
            level,
            can_approve,
            can_invite_members
          )
        `)
        .eq('company', userProfile.company)
        .order('name');

      if (error) throw error;
      return data;
    },
    cacheTTL: 3 // Cache for 3 minutes
  });
};
