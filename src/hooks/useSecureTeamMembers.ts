
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useOptimizedQuery, useStaticDataQuery } from './useOptimizedQuery';

export interface SecureTeamMember {
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

export const useSecureTeamMembers = () => {
  return useOptimizedQuery({
    queryKey: ['secure-team-members'],
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
      return data as SecureTeamMember[];
    },
    cacheTTL: 2
  });
};

export const useSecureInviteTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, name, hierarchyLevelId }: {
      email: string;
      name: string;
      hierarchyLevelId: string;
    }) => {
      // Input validation and sanitization
      const sanitizedEmail = email.trim().toLowerCase();
      const sanitizedName = name.trim().replace(/[<>'"]/g, '');

      if (!sanitizedEmail || !sanitizedName) {
        throw new Error('Email e nome são obrigatórios');
      }

      if (sanitizedEmail.length > 254) {
        throw new Error('Email muito longo');
      }

      if (sanitizedName.length > 100) {
        throw new Error('Nome muito longo');
      }

      const { data, error } = await supabase.rpc('invite_team_member', {
        p_email: sanitizedEmail,
        p_name: sanitizedName,
        p_hierarchy_level_id: hierarchyLevelId
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secure-team-members'] });
      queryClient.invalidateQueries({ queryKey: ['company-team-members'] });
      toast.success('Convite seguro enviado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao enviar convite:', error);
      toast.error(`Erro ao enviar convite: ${error.message}`);
    }
  });
};

export const useSecureCompanyTeamMembers = () => {
  return useOptimizedQuery({
    queryKey: ['secure-company-team-members'],
    queryFn: async () => {
      // Use secure function to get user company
      const { data: userCompany, error: companyError } = await supabase
        .rpc('get_user_company');

      if (companyError) throw companyError;

      if (!userCompany) {
        return [];
      }

      // Get team members for the user's company
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
        .eq('company', userCompany)
        .order('name');

      if (error) throw error;
      return data;
    },
    cacheTTL: 3
  });
};
