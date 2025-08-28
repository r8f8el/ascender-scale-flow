
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CompanyProject {
  id: string;
  name: string;
  description?: string;
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold';
  progress: number;
  start_date: string;
  end_date: string;
  client_id: string;
  created_at: string;
  updated_at: string;
  owner?: {
    name: string;
    email: string;
  };
}

export const useCompanyProjects = () => {
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['company-projects'],
    queryFn: async () => {
      console.log('🔍 [PROJECTS DEBUG] Buscando projetos da empresa...');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      console.log('🔍 [PROJECTS DEBUG] Usuário autenticado:', user.id);

      // Buscar perfil do usuário para obter empresa
      const { data: profile, error: profileError } = await supabase
        .from('client_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      console.log('🔍 [PROJECTS DEBUG] Perfil:', profile, 'Erro:', profileError);

      let userCompany = profile?.company;

      // Se não tem empresa no perfil, verificar se é membro da equipe
      if (!userCompany) {
        console.log('🔍 [PROJECTS DEBUG] Sem empresa no perfil, verificando team_members...');
        const { data: teamMember, error: teamError } = await supabase
          .from('team_members')
          .select(`
            *,
            company:client_profiles!team_members_company_id_fkey(*)
          `)
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle();

        console.log('🔍 [PROJECTS DEBUG] Team member:', teamMember, 'Erro:', teamError);

        if (teamMember?.company?.company) {
          userCompany = teamMember.company.company;
          console.log('🔍 [PROJECTS DEBUG] Empresa obtida do team member:', userCompany);
        }
      }

      if (!userCompany) {
        console.log('⚠️ [PROJECTS DEBUG] Usuário não pertence a nenhuma empresa');
        return [];
      }

      console.log('🔍 [PROJECTS DEBUG] Buscando projetos da empresa:', userCompany);

      const { data, error } = await supabase
        .from('gantt_projects')
        .select(`
          *,
          owner:client_profiles!gantt_projects_client_id_fkey(name, email, company)
        `)
        .eq('client_profiles.company', userCompany)
        .order('updated_at', { ascending: false });

      console.log('🔍 [PROJECTS DEBUG] Resultado busca projetos:', data, 'Erro:', error);

      if (error) {
        console.error('❌ [PROJECTS DEBUG] Erro ao buscar projetos:', error);
        throw error;
      }

      console.log('✅ [PROJECTS DEBUG] Projetos encontrados:', data?.length || 0);
      
      return data?.map(project => ({
        ...project,
        owner: project.owner || { name: 'Usuário', email: '' }
      })) || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

  const createProject = useMutation({
    mutationFn: async (projectData: {
      name: string;
      description?: string;
      status: 'planning' | 'in_progress' | 'completed' | 'on_hold';
      start_date?: string;
      end_date?: string;
      progress: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Definir datas padrão se não fornecidas
      const today = new Date().toISOString().split('T')[0];
      const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('gantt_projects')
        .insert({
          name: projectData.name,
          description: projectData.description,
          status: projectData.status || 'planning',
          start_date: projectData.start_date || today,
          end_date: projectData.end_date || futureDate,
          progress: projectData.progress || 0,
          client_id: user.id,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-projects'] });
      toast.success('Projeto criado com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao criar projeto', {
        description: error.message
      });
    }
  });

  return {
    projects,
    isLoading,
    createProject
  };
};
