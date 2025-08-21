
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

        // Buscar convite válido
        const { data: invitationData, error: inviteError } = await supabase
          .from('team_invitations')
          .select('*')
          .eq('token', token)
          .eq('status', 'pending')
          .gt('expires_at', new Date().toISOString())
          .single();

        if (inviteError || !invitationData) {
          console.error('Erro ao validar convite:', inviteError);
          setError('Convite inválido, expirado ou já usado');
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
          .eq('invited_email', invitationData.email)
          .eq('company_id', invitationData.company_id)
          .eq('status', 'pending')
          .single();

        if (memberError || !memberData) {
          console.error('Erro ao buscar dados do membro:', memberError);
          setError('Dados do convite não encontrados');
          return;
        }

        // Buscar dados do nível hierárquico
        const { data: hierarchyData, error: hierarchyError } = await supabase
          .from('hierarchy_levels')
          .select('name, level')
          .eq('id', memberData.hierarchy_level_id)
          .single();

        if (hierarchyError || !hierarchyData) {
          console.error('Erro ao buscar nível hierárquico:', hierarchyError);
          setError('Dados do nível hierárquico não encontrados');
          return;
        }

        setInviteData({
          id: memberData.id,
          invited_email: memberData.invited_email,
          name: memberData.name,
          inviter_name: invitationData.inviter_name || 'Administrador',
          company_name: invitationData.company_name || 'Empresa',
          message: invitationData.message,
          hierarchy_level: hierarchyData
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
