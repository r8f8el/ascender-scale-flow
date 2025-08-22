
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface InviteData {
  email: string;
  name: string;
  hierarchyLevelId: string;
  message?: string;
}

export const useSecureTeamInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InviteData) => {
      console.log('🔒 Enviando convite seguro:', data);

      // Check rate limit first
      const { data: rateLimitOk, error: rateLimitError } = await supabase
        .rpc('check_invitation_rate_limit', {
          p_user_id: (await supabase.auth.getUser()).data.user?.id
        });

      if (rateLimitError) {
        throw new Error(`Erro de rate limit: ${rateLimitError.message}`);
      }

      if (!rateLimitOk) {
        throw new Error('Limite de convites excedido. Tente novamente em uma hora.');
      }

      // Send secure invitation
      const { data: invitationId, error } = await supabase
        .rpc('invite_team_member_secure', {
          p_email: data.email,
          p_name: data.name,
          p_hierarchy_level_id: data.hierarchyLevelId
        });

      if (error) {
        console.error('❌ Erro ao enviar convite seguro:', error);
        throw error;
      }

      console.log('✅ Convite seguro enviado:', invitationId);

      // If there's a custom message, send notification
      if (data.message) {
        try {
          await supabase.functions.invoke('send-notification', {
            body: {
              type: 'team_invitation_custom',
              data: {
                invitedEmail: data.email,
                inviterName: 'Sistema',
                companyName: 'Empresa',
                message: data.message,
                invitationId: invitationId
              }
            }
          });
        } catch (notificationError) {
          console.warn('⚠️ Erro ao enviar notificação personalizada:', notificationError);
        }
      }

      return invitationId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secure-team-members'] });
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      
      toast.success('Convite enviado com segurança!', {
        description: 'O membro receberá um email seguro com instruções.',
      });
    },
    onError: (error: any) => {
      console.error('❌ Erro no convite seguro:', error);
      
      let errorMessage = 'Erro ao enviar convite';
      
      if (error.message?.includes('Limite de convites excedido')) {
        errorMessage = 'Limite de convites excedido. Aguarde uma hora.';
      } else if (error.message?.includes('já existe um convite pendente')) {
        errorMessage = 'Já existe um convite pendente para este email';
      } else if (error.message?.includes('Perfil do usuário não encontrado')) {
        errorMessage = 'Perfil não encontrado. Faça login novamente.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error('Erro de segurança', {
        description: errorMessage,
      });
    }
  });
};
