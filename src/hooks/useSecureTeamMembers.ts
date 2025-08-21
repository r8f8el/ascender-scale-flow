
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
    mutationFn: async ({ email, name, hierarchyLevelId, message }: {
      email: string;
      name: string;
      hierarchyLevelId: string;
      message?: string;
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

      console.log('Enviando convite para:', { email: sanitizedEmail, name: sanitizedName });

      try {
        // Chamar a função RPC que retorna o ID do convite
        const { data: invitationId, error: teamMemberError } = await supabase.rpc('invite_team_member_secure', {
          p_email: sanitizedEmail,
          p_name: sanitizedName,
          p_hierarchy_level_id: hierarchyLevelId
        });

        if (teamMemberError) {
          console.error('Erro ao criar registro do membro:', teamMemberError);
          throw new Error(`Erro ao criar convite: ${teamMemberError.message}`);
        }

        console.log('Convite criado com sucesso. ID:', invitationId);

        // Buscar o token do convite criado
        const { data: inviteData, error: tokenError } = await supabase
          .from('team_members')
          .select('invitation_token')
          .eq('id', invitationId)
          .single();

        if (tokenError || !inviteData?.invitation_token) {
          console.error('Erro ao obter token do convite:', tokenError);
          throw new Error('Erro ao gerar token do convite');
        }

        // Obter dados da empresa atual
        const { data: userProfile, error: profileError } = await supabase
          .from('client_profiles')
          .select('name, company')
          .eq('id', (await supabase.auth.getUser()).data.user?.id)
          .single();

        if (profileError) {
          console.error('Erro ao obter perfil do usuário:', profileError);
          throw new Error('Erro ao obter dados do usuário');
        }

        const inviteUrl = `${window.location.origin}/convite-equipe?token=${inviteData.invitation_token}`;
        console.log('URL do convite:', inviteUrl);

        console.log('Enviando email via edge function...');

        // Chamar a edge function para enviar o email
        const { data: emailData, error: emailError } = await supabase.functions.invoke('send-invitation-email', {
          body: {
            to: sanitizedEmail,
            inviterName: userProfile.name || 'Administrador',
            invitedName: sanitizedName,
            companyName: userProfile.company || 'Sua Empresa',
            inviteUrl: inviteUrl,
            message: message || 'Você foi convidado para se juntar à nossa equipe na plataforma Ascalate'
          }
        });

        if (emailError) {
          console.error('Erro ao enviar email:', emailError);
          throw new Error(`Erro ao enviar email: ${emailError.message}`);
        }

        console.log('Email enviado com sucesso:', emailData);

        return { 
          invitationId, 
          token: inviteData.invitation_token,
          email: emailData,
          invitedEmail: sanitizedEmail,
          invitedName: sanitizedName
        };
      } catch (error: any) {
        console.error('Erro detalhado no convite:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['secure-team-members'] });
      queryClient.invalidateQueries({ queryKey: ['company-team-members'] });
      toast.success(`Seu convite foi enviado para ${data.invitedName} (${data.invitedEmail})!`, {
        description: `O convite foi enviado por email. Link do convite: ${window.location.origin}/convite-equipe?token=${data.token}`,
        duration: 8000
      });
    },
    onError: (error: any) => {
      console.error('Erro ao enviar convite:', error);
      toast.error(`Erro ao enviar convite: ${error.message}`, {
        description: 'Verifique se todos os dados estão corretos e tente novamente.',
        duration: 7000
      });
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
