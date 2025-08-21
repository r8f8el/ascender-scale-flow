
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

        // Buscar dados do convite
        const { data: inviteData, error: inviteError } = await supabase
          .from('team_members')
          .select(`
            id,
            invited_email,
            name,
            status,
            hierarchy_levels!inner(
              name,
              level
            ),
            client_profiles!team_members_invited_by_fkey(
              name
            )
          `)
          .eq('invitation_token', token)
          .eq('status', 'pending')
          .single();

        if (inviteError || !inviteData) {
          console.error('Erro ao validar convite:', inviteError);
          setError('Convite inválido, expirado ou já usado');
          return;
        }

        // Buscar dados da empresa
        const { data: companyData, error: companyError } = await supabase
          .from('client_profiles')
          .select('company')
          .eq('id', inviteData.client_profiles?.name ? inviteData.client_profiles.name : '')
          .single();

        setInviteData({
          id: inviteData.id,
          invited_email: inviteData.invited_email,
          name: inviteData.name,
          inviter_name: inviteData.client_profiles?.name || 'Administrador',
          company_name: companyData?.company || 'Empresa',
          hierarchy_level: inviteData.hierarchy_levels
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
