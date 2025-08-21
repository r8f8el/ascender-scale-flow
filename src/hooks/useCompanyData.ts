
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useCompanyData = () => {
  return useQuery({
    queryKey: ['company-data'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      console.log('🔍 Buscando dados da empresa para usuário:', user.id);

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
        console.log('⚠️ Usuário não tem empresa definida, verificando se é membro de equipe...');
        
        // Verificar se é membro ativo de alguma equipe
        const { data: teamMembership, error: teamError } = await supabase
          .from('team_members')
          .select(`
            *,
            company:client_profiles!team_members_company_id_fkey(
              id,
              name,
              company,
              email,
              is_primary_contact
            )
          `)
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single();

        if (teamError || !teamMembership?.company) {
          console.log('⚠️ Usuário não é membro ativo de nenhuma equipe');
          return { profile, companyMembers: [] };
        }

        console.log('✅ Usuário é membro de equipe da empresa:', teamMembership.company);
        
        // Usar a empresa do team membership
        const companyName = teamMembership.company.company || teamMembership.company.name;
        
        if (companyName) {
          // Buscar todos os membros desta empresa
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
            .eq('company', companyName)
            .order('is_primary_contact', { ascending: false })
            .order('name');

          if (membersError) {
            console.error('❌ Erro ao buscar membros da empresa:', membersError);
          }

          return {
            profile: {
              ...profile,
              company: companyName,
              isTeamMember: true
            },
            companyMembers: companyMembers || []
          };
        }
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
        console.error('❌ Erro ao buscar membros da empresa:', membersError);
        throw membersError;
      }

      console.log('✅ Membros da empresa encontrados:', companyMembers?.length || 0);

      return {
        profile,
        companyMembers: companyMembers || []
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000 // 10 minutos
  });
};
