
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
      let shouldUpdateProfile = false;

      // Se não tem empresa no perfil mas é membro da equipe, usar empresa da equipe
      if (!companyName && isTeamMember && teamMember.company?.company) {
        companyName = teamMember.company.company;
        console.log('📋 Usando empresa do team membership:', companyName);
        shouldUpdateProfile = true;
      }

      // Se ainda não tem empresa, verificar se é contato primário e criar empresa baseada no nome/email
      if (!companyName && profile?.is_primary_contact) {
        // Para contas primárias existentes, usar o nome como empresa se disponível
        if (profile.name && profile.name.trim()) {
          companyName = profile.name.trim();
          console.log('📋 Criando empresa baseada no nome (contato primário):', companyName);
          shouldUpdateProfile = true;
        } else {
          // Usar parte do email como fallback
          const emailParts = profile.email.split('@');
          companyName = emailParts[0].replace(/[^a-zA-Z0-9\s]/g, '').trim();
          console.log('📋 Criando empresa baseada no email (contato primário):', companyName);
          shouldUpdateProfile = true;
        }
      }

      // Se ainda não tem empresa e não é contato primário, mas tem perfil, assumir que é uma conta existente
      if (!companyName && profile) {
        console.log('⚠️ Conta existente sem empresa definida, criando empresa padrão');
        if (profile.name && profile.name.trim()) {
          companyName = profile.name.trim();
        } else {
          const emailParts = profile.email.split('@');
          companyName = emailParts[0].replace(/[^a-zA-Z0-9\s]/g, '').trim();
        }
        
        // Marcar como contato primário se não há empresa definida (conta existente)
        shouldUpdateProfile = true;
        
        console.log('📋 Empresa criada para conta existente:', companyName);
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
        hasCompanyAccess,
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
