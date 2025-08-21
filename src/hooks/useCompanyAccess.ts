
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useCompanyAccess = () => {
  return useQuery({
    queryKey: ['company-access'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      console.log('🔍 Verificando acesso da empresa para usuário:', user.id);

      // Buscar perfil do usuário atual
      const { data: profile, error: profileError } = await supabase
        .from('client_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('❌ Erro ao buscar perfil:', profileError);
        throw profileError;
      }

      console.log('✅ Perfil encontrado:', profile);

      if (!profile?.company) {
        console.log('⚠️ Usuário não tem empresa definida');
        return { 
          profile, 
          companyMembers: [], 
          hasCompanyAccess: false,
          isTeamMember: false 
        };
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

      if (membersError) {
        console.error('❌ Erro ao buscar membros:', membersError);
        throw membersError;
      }

      console.log('✅ Membros da empresa encontrados:', companyMembers?.length || 0);

      // Verificar se é membro da equipe ativo
      const { data: teamMember, error: teamError } = await supabase
        .from('team_members')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      const isTeamMember = !teamError && teamMember;

      console.log('✅ Status do membro da equipe:', isTeamMember ? 'Ativo' : 'Não encontrado');

      return {
        profile,
        companyMembers: companyMembers || [],
        hasCompanyAccess: true,
        isTeamMember: !!isTeamMember,
        teamMemberData: teamMember
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000 // 10 minutos
  });
};
