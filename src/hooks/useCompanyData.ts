
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useCompanyData = () => {
  return useQuery({
    queryKey: ['company-data'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Buscar perfil do usuário atual
      const { data: profile, error: profileError } = await supabase
        .from('client_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      if (!profile?.company) {
        return { profile, companyMembers: [] };
      }

      // Buscar todos os membros da empresa (incluindo membros da equipe)
      const { data: companyMembers, error: membersError } = await supabase
        .from('client_profiles')
        .select(`
          *,
          hierarchy_levels(
            name,
            level,
            can_approve,
            can_invite_members
          )
        `)
        .eq('company', profile.company)
        .order('is_primary_contact', { ascending: false })
        .order('name');

      if (membersError) throw membersError;

      return {
        profile,
        companyMembers: companyMembers || []
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000 // 10 minutos
  });
};
