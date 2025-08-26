
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface InviteData {
  id: string;
  invited_email: string;
  name: string;
  inviter_name: string;
  company_name: string;
  message?: string;
  hierarchy_level: {
    name: string;
    level: number;
  };
}

export const useInviteValidation = (token: string | null) => {
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(!!token);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Token de convite não fornecido');
      setLoading(false);
      return;
    }

    const validateInvite = async () => {
      try {
        console.log('Validando token:', token);

        // Usar função segura para validar convite por token
        const { data: invitationData, error: inviteError } = await supabase
          .rpc('get_invitation_by_token', {
            p_token: token
          });

        if (inviteError || !invitationData || invitationData.length === 0) {
          console.error('Erro ao validar convite:', inviteError);
          setError('Convite inválido, expirado ou já usado');
          return;
        }

        const invite = invitationData[0];
        
        if (!invite.is_valid) {
          setError('Convite inválido ou expirado');
          return;
        }

        // Buscar dados do membro da equipe correspondente
        const { data: memberData, error: memberError } = await supabase
          .from('team_members')
          .select(`
            id,
            invited_email,
            name,
            hierarchy_level_id
          `)
          .eq('invited_email', invite.email)
          .eq('company_id', invite.company_id)
          .eq('status', 'pending')
          .single();

        if (memberError || !memberData) {
          console.error('Erro ao buscar dados do membro:', memberError);
          setError('Dados do convite não encontrados');
          return;
        }

        // Buscar dados do nível hierárquico se necessário
        let hierarchyData = null;
        if (invite.hierarchy_level_id) {
          const { data: hierarchyResult, error: hierarchyError } = await supabase
            .from('hierarchy_levels')
            .select('name, level')
            .eq('id', invite.hierarchy_level_id)
            .single();

          if (!hierarchyError && hierarchyResult) {
            hierarchyData = hierarchyResult;
          }
        }

        setInviteData({
          id: memberData.id,
          invited_email: memberData.invited_email,
          name: memberData.name,
          inviter_name: invite.inviter_name || 'Administrador',
          company_name: invite.company_name || 'Empresa',
          message: invite.message,
          hierarchy_level: hierarchyData || { name: 'Membro', level: 1 }
        });

      } catch (error: any) {
        console.error('Erro na validação:', error);
        setError('Erro ao validar convite');
      } finally {
        setLoading(false);
      }
    };

    validateInvite();
  }, [token]);

  return { inviteData, loading, error };
};
