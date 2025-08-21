
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
        // Obter dados do usuário atual
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuário não autenticado');

        const { data: userProfile, error: profileError } = await supabase
          .from('client_profiles')
          .select('name, company')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Erro ao obter perfil do usuário:', profileError);
          throw new Error('Erro ao obter dados do usuário');
        }

        // Gerar token único
        const token = crypto.randomUUID() + '-' + Date.now();
        
        // Use the correct domain for the invite URL
        const baseUrl = 'https://ascalate.com.br';
        const inviteUrl = `${baseUrl}/convite-equipe/cadastro?token=${token}`;
        
        // Criar convite na tabela team_invitations
        const { data: inviteData, error: inviteError } = await supabase
          .from('team_invitations')
          .insert({
            email: sanitizedEmail,
            company_id: user.id,
            company_name: userProfile.company || userProfile.name,
            inviter_name: userProfile.name,
            token: token,
            message: message || 'Você foi convidado para se juntar à nossa equipe na plataforma Ascalate',
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'pending',
            hierarchy_level_id: hierarchyLevelId
          })
          .select()
          .single();

        if (inviteError) {
          console.error('Erro ao criar convite:', inviteError);
          throw new Error(`Erro ao criar convite: ${inviteError.message}`);
        }

        // Criar entrada em team_members
        const { error: memberError } = await supabase
          .from('team_members')
          .insert({
            company_id: user.id,
            invited_email: sanitizedEmail,
            name: sanitizedName,
            hierarchy_level_id: hierarchyLevelId,
            invited_by: user.id,
            status: 'pending'
          });

        if (memberError) {
          console.error('Erro ao criar membro da equipe:', memberError);
          // Continue mesmo com erro, pois o convite foi criado
        }

        console.log('URL do convite:', inviteUrl);
        console.log('Enviando email via edge function...');

        // Chamar a edge function de notificações
        const { data: emailData, error: emailError } = await supabase.functions.invoke('send-notification', {
          body: {
            type: 'team_invitation',
            data: {
              invitedEmail: sanitizedEmail,
              inviterName: userProfile.name || 'Administrador',
              companyName: userProfile.company || userProfile.name || 'Sua Empresa',
              inviteUrl: inviteUrl,
              message: message || 'Você foi convidado para se juntar à nossa equipe na plataforma Ascalate'
            }
          }
        });

        if (emailError) {
          console.error('Erro ao enviar email:', emailError);
          throw new Error(`Erro ao enviar email: ${emailError.message}`);
        }

        console.log('Email enviado com sucesso:', emailData);

        return { 
          invitationId: inviteData.id, 
          token: token,
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
      queryClient.invalidateQueries({ queryKey: ['company-data'] });
      toast.success(`Convite enviado com sucesso!`, {
        description: `${data.invitedName} (${data.invitedEmail}) receberá o convite por email em breve.`,
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

// Novo hook para listar todos os membros da empresa (incluindo team members)
export const useSecureCompanyTeamMembers = () => {
  return useOptimizedQuery({
    queryKey: ['secure-company-team-members'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Buscar perfil do usuário atual para obter a empresa
      const { data: currentProfile, error: profileError } = await supabase
        .from('client_profiles')
        .select('company')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      if (!currentProfile?.company) return [];

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
        .eq('company', currentProfile.company)
        .order('is_primary_contact', { ascending: false })
        .order('name');

      if (error) throw error;
      return data;
    },
    cacheTTL: 3
  });
};
