
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CompanyDashboardData {
  company_name: string;
  projects: Array<{
    id: string;
    name: string;
    status: string;
    progress: number;
    start_date: string;
    end_date: string;
  }>;
  documents: Array<{
    id: string;
    filename: string;
    category: string;
    uploaded_at: string;
  }>;
  team_members: Array<{
    id: string;
    name: string;
    email: string;
    is_primary_contact: boolean;
    hierarchy_level?: string;
  }>;
  pending_invitations: Array<{
    id: string;
    name: string;
    email: string;
    invited_at: string;
  }>;
}

export const useCompanyDashboard = () => {
  return useQuery({
    queryKey: ['company-dashboard'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      console.log('🏢 Buscando dados do dashboard da empresa para usuário:', user.id);

      // Buscar perfil do usuário atual
      const { data: profile, error: profileError } = await supabase
        .from('client_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('❌ Erro ao buscar perfil:', profileError);
        throw profileError;
      }

      let userCompany = profile?.company;

      // Se não tem empresa no perfil, verificar se é membro da equipe
      if (!userCompany) {
        const { data: teamMember } = await supabase
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

        if (teamMember?.company?.company) {
          userCompany = teamMember.company.company;
          console.log('📋 Usando empresa do team membership:', userCompany);
        }
      }

      if (!userCompany) {
        console.warn('⚠️ Usuário não pertence a nenhuma empresa');
        return null;
      }

      // Buscar projetos da empresa
      const { data: projects } = await supabase
        .from('gantt_projects')
        .select(`
          id,
          name,
          status,
          progress,
          start_date,
          end_date,
          client_profiles!gantt_projects_client_id_fkey(company)
        `)
        .eq('client_profiles.company', userCompany)
        .order('updated_at', { ascending: false })
        .limit(10);

      // Buscar documentos da empresa
      const { data: documents } = await supabase
        .from('client_documents')
        .select(`
          id,
          filename,
          category,
          uploaded_at,
          client_profiles!client_documents_user_id_fkey(company)
        `)
        .eq('client_profiles.company', userCompany)
        .order('uploaded_at', { ascending: false })
        .limit(10);

      // Buscar membros da equipe
      const { data: teamMembers } = await supabase
        .from('client_profiles')
        .select(`
          id,
          name,
          email,
          is_primary_contact,
          hierarchy_levels(name)
        `)
        .eq('company', userCompany)
        .order('is_primary_contact', { ascending: false });

      // Buscar convites pendentes
      const { data: pendingInvitations } = await supabase
        .from('team_members')
        .select(`
          id,
          name,
          invited_email,
          invited_at,
          company:client_profiles!team_members_company_id_fkey(company)
        `)
        .eq('status', 'pending')
        .eq('client_profiles.company', userCompany);

      const dashboardData: CompanyDashboardData = {
        company_name: userCompany,
        projects: (projects || []).map(p => ({
          id: p.id,
          name: p.name,
          status: p.status || 'planning',
          progress: p.progress || 0,
          start_date: p.start_date,
          end_date: p.end_date
        })),
        documents: (documents || []).map(d => ({
          id: d.id,
          filename: d.filename,
          category: d.category || 'Outros',
          uploaded_at: d.uploaded_at
        })),
        team_members: (teamMembers || []).map(m => ({
          id: m.id,
          name: m.name,
          email: m.email,
          is_primary_contact: m.is_primary_contact || false,
          hierarchy_level: m.hierarchy_levels?.name
        })),
        pending_invitations: (pendingInvitations || []).map(i => ({
          id: i.id,
          name: i.name || 'Nome não informado',
          email: i.invited_email,
          invited_at: i.invited_at
        }))
      };

      console.log('✅ Dados do dashboard obtidos:', dashboardData);
      return dashboardData;
    },
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
  });
};
