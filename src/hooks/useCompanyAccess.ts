
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

      // Verificar se é membro da equipe ativo
      const { data: teamMember, error: teamError } = await supabase
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
        .maybeSingle();

      const isTeamMember = !teamError && teamMember;
      console.log('✅ Status do membro da equipe:', isTeamMember ? 'Ativo' : 'Não encontrado');

      // Determinar a empresa a ser usada
      let companyName = profile?.company;
      let companyMembers = [];

      // Se não tem empresa no perfil mas é membro da equipe, usar empresa da equipe
      if (!companyName && isTeamMember && teamMember.company?.company) {
        companyName = teamMember.company.company;
        console.log('📋 Usando empresa do team membership:', companyName);

        // Atualizar o perfil com a empresa encontrada
        try {
          const { error: updateError } = await supabase
            .from('client_profiles')
            .update({ company: companyName })
            .eq('id', user.id);

          if (updateError) {
            console.error('⚠️ Erro ao atualizar perfil:', updateError);
          } else {
            console.log('✅ Perfil atualizado com empresa:', companyName);
          }
        } catch (error) {
          console.error('⚠️ Erro ao atualizar perfil:', error);
        }
      }

      // Se ainda não tem empresa, verificar se é contato primário
      if (!companyName && profile?.is_primary_contact) {
        companyName = profile.name; // Usar nome como empresa se for contato primário
        console.log('📋 Usando nome como empresa (contato primário):', companyName);
      }

      // Buscar membros da empresa se temos uma empresa
      if (companyName) {
        const { data: members, error: membersError } = await supabase
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
          console.error('❌ Erro ao buscar membros:', membersError);
        } else {
          companyMembers = members || [];
          console.log('✅ Membros da empresa encontrados:', companyMembers.length);
        }
      }

      const hasCompanyAccess = Boolean(companyName);
      
      console.log('🎯 Resultado final do acesso:', {
        hasCompanyAccess,
        companyName,
        isTeamMember: !!isTeamMember,
        membersCount: companyMembers.length
      });

      return {
        profile: {
          ...profile,
          company: companyName
        },
        companyMembers,
        hasCompanyAccess,
        isTeamMember: !!isTeamMember,
        teamMemberData: teamMember
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutos (reduzido para atualizar mais frequentemente)
    gcTime: 5 * 60 * 1000, // 5 minutos
    retry: 3,
    retryDelay: 1000,
  });
};
