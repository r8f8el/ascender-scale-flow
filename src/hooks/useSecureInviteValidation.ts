
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SecureInviteData {
  invitation_id: string;
  email: string;
  company_id: string;
  company_name: string;
  inviter_name: string;
  message?: string;
  hierarchy_level_id: string;
  is_valid: boolean;
}

export const useSecureInviteValidation = (token: string | null) => {
  const [inviteData, setInviteData] = useState<SecureInviteData | null>(null);
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
        console.log('🔒 Validando token de forma segura:', token);

        // Use the secure validation function
        const { data: validationData, error: validationError } = await supabase
          .rpc('validate_invitation_token_secure', {
            p_token: token
          });

        if (validationError) {
          console.error('❌ Erro na validação segura:', validationError);
          setError('Erro ao validar convite');
          return;
        }

        if (!validationData || validationData.length === 0) {
          console.log('⚠️ Token não encontrado ou inválido');
          setError('Convite não encontrado ou inválido');
          return;
        }

        const invite = validationData[0];
        console.log('✅ Token validado com sucesso:', invite);

        if (!invite.is_valid) {
          console.log('❌ Token inválido ou expirado');
          setError('Convite inválido ou expirado');
          return;
        }

        setInviteData({
          invitation_id: invite.invitation_id,
          email: invite.email,
          company_id: invite.company_id,
          company_name: invite.company_name,
          inviter_name: invite.inviter_name,
          message: invite.message,
          hierarchy_level_id: invite.hierarchy_level_id,
          is_valid: invite.is_valid
        });

      } catch (err) {
        console.error('❌ Erro na validação:', err);
        setError('Erro interno na validação');
      } finally {
        setLoading(false);
      }
    };

    validateInvite();
  }, [token]);

  return { inviteData, loading, error };
};
