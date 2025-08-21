
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CompanyProject {
  id: string;
  name: string;
  description?: string;
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold';
  progress: number;
  start_date?: string;
  end_date?: string;
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
      console.log('🔍 Buscando projetos da empresa...');
      
      const { data, error } = await supabase
        .from('gantt_projects')
        .select(`
          *,
          owner:client_profiles(name, email)
        `)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar projetos:', error);
        throw error;
      }

      console.log('✅ Projetos encontrados:', data?.length || 0);
      
      return data?.map(project => ({
        ...project,
        owner: project.owner?.[0] || { name: 'Usuário', email: '' }
      })) || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

  const createProject = useMutation({
    mutationFn: async (projectData: Omit<CompanyProject, 'id' | 'created_at' | 'updated_at' | 'owner'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('gantt_projects')
        .insert({
          ...projectData,
          client_id: user.id
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
