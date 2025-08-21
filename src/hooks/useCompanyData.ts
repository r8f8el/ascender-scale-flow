
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

      let finalProfile = profile;
      let companyMembers = [];
      let isTeamMember = false;

      // Se não há empresa no perfil, verificar se é membro de equipe
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
          .maybeSingle();

        if (!teamError && teamMembership?.company) {
          console.log('✅ Usuário é membro de equipe da empresa:', teamMembership.company);
          
          const companyName = teamMembership.company.company || teamMembership.company.name;
          
          if (companyName) {
            // Atualizar o perfil com a empresa encontrada
            try {
              const { error: updateError } = await supabase
                .from('client_profiles')
                .update({ company: companyName })
                .eq('id', user.id);

              if (updateError) {
                console.error('⚠️ Erro ao atualizar perfil com empresa:', updateError);
              } else {
                console.log('✅ Perfil atualizado com empresa:', companyName);
              }
            } catch (error) {
              console.error('⚠️ Erro ao atualizar perfil:', error);
            }

            finalProfile = {
              ...profile,
              company: companyName
            };
            
            isTeamMember = true;
          }
        } else {
          console.log('⚠️ Usuário não é membro ativo de nenhuma equipe');
          
          // Se for contato primário sem empresa, usar o nome como empresa
          if (profile.is_primary_contact && profile.name) {
            const companyName = profile.name;
            console.log('📋 Criando empresa baseada no nome do contato primário:', companyName);
            
            try {
              const { error: updateError } = await supabase
                .from('client_profiles')
                .update({ company: companyName })
                .eq('id', user.id);

              if (!updateError) {
                finalProfile = {
                  ...profile,
                  company: companyName
                };
                console.log('✅ Empresa criada com sucesso:', companyName);
              }
            } catch (error) {
              console.error('⚠️ Erro ao criar empresa:', error);
            }
          }
          
          if (!finalProfile.company) {
            return { profile: finalProfile, companyMembers: [], isTeamMember: false };
          }
        }
      }

      // Se agora temos uma empresa, buscar os membros
      if (finalProfile.company) {
        console.log('🔍 Buscando membros da empresa:', finalProfile.company);
        
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
          .eq('company', finalProfile.company)
          .order('is_primary_contact', { ascending: false })
          .order('name');

        if (membersError) {
          console.error('❌ Erro ao buscar membros da empresa:', membersError);
        } else {
          companyMembers = members || [];
          console.log('✅ Membros da empresa encontrados:', companyMembers.length);
        }
      }

      console.log('🎯 Resultado final dos dados da empresa:', {
        hasCompany: !!finalProfile.company,
        companyName: finalProfile.company,
        isTeamMember,
        membersCount: companyMembers.length
      });

      return {
        profile: finalProfile,
        companyMembers,
        isTeamMember
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
    retry: 3,
    retryDelay: 1000,
  });
};
