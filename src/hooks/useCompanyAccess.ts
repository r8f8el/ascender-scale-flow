
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useCompanyAccess = () => {
  return useQuery({
    queryKey: ['company-access'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      console.log('🔍 Verificando acesso da empresa para usuário:', user.id);

      // Buscar perfil do usuário atual no client_profiles
      let { data: profile, error: profileError } = await supabase
        .from('client_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      // Se não encontrou no client_profiles, tentar buscar no admin_profiles (caso seja admin)
      if (!profile) {
        const { data: adminProfile } = await supabase
          .from('admin_profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
          
        if (adminProfile) {
          console.log('✅ Perfil de administrador encontrado:', adminProfile);
          return {
            profile: {
              id: user.id,
              name: adminProfile.name,
              email: adminProfile.email,
              company: 'Ascalate',
              is_primary_contact: true
            },
            companyMembers: [],
            hasCompanyAccess: true,
            isTeamMember: false,
            teamMemberData: null
          };
        }
      }

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('❌ Erro ao buscar perfil:', profileError);
        throw profileError;
      }

      if (!profile) {
        throw new Error('Perfil de usuário não encontrado');
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
      let shouldUpdateProfile = false;

      // Se não tem empresa no perfil mas é membro da equipe, usar empresa da equipe
      if (!companyName && isTeamMember && teamMember.company?.company) {
        companyName = teamMember.company.company;
        console.log('📋 Usando empresa do team membership:', companyName);
        shouldUpdateProfile = true;
      }

      // Para contas existentes sem empresa: SEMPRE garantir que tenham uma empresa
      if (!companyName) {
        console.log('🔄 Conta existente sem empresa - criando empresa automaticamente');
        
        if (profile.name && profile.name.trim()) {
          companyName = profile.name.trim();
          console.log('📋 Criando empresa baseada no nome:', companyName);
        } else {
          // Usar parte do email como fallback
          const emailParts = profile.email.split('@');
          companyName = emailParts[0].replace(/[^a-zA-Z0-9\s]/g, '').trim();
          console.log('📋 Criando empresa baseada no email:', companyName);
        }
        
        // Marcar como contato primário se não há empresa definida (conta existente)
        shouldUpdateProfile = true;
      }

      // Atualizar o perfil se necessário
      if (shouldUpdateProfile && companyName) {
        try {
          const updateData: any = { company: companyName };
          
          // Se não tem empresa e está criando uma, marcar como contato primário
          if (!profile.company) {
            updateData.is_primary_contact = true;
          }

          const { error: updateError } = await supabase
            .from('client_profiles')
            .update(updateData)
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

      // GARANTIR que sempre haja acesso para contas existentes
      const hasCompanyAccess = Boolean(companyName);
      
      console.log('🎯 Resultado final do acesso:', {
        hasCompanyAccess,
        companyName,
        isTeamMember: !!isTeamMember,
        membersCount: companyMembers.length,
        profileUpdated: shouldUpdateProfile
      });

      return {
        profile: {
          ...profile,
          company: companyName,
          is_primary_contact: !profile.company ? true : profile.is_primary_contact
        },
        companyMembers,
        hasCompanyAccess: true, // SEMPRE true para contas existentes
        isTeamMember: !!isTeamMember,
        teamMemberData: teamMember
      };
    },
    staleTime: 1 * 60 * 1000, // 1 minuto (reduzido para detectar mudanças mais rapidamente)
    gcTime: 3 * 60 * 1000, // 3 minutos
    retry: 3,
    retryDelay: 1000,
  });
};
