
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface GanttProject {
  id: string;
  name: string;
  description?: string;
  client_id?: string;
  created_by?: string;
  start_date: string;
  end_date: string;
  progress: number;
  status: string;
  priority: string;
  budget?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useGanttProjects = (clientId?: string) => {
  const [projects, setProjects] = useState<GanttProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('gantt_projects')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      
      // Se não houver projetos, criar alguns projetos de exemplo
      if (!data || data.length === 0) {
        const mockProjects: GanttProject[] = [
          {
            id: '1',
            name: 'Projeto de Consultoria Financeira',
            description: 'Análise e planejamento financeiro para empresa de médio porte',
            client_id: clientId || '1',
            created_by: '1',
            start_date: '2024-01-01',
            end_date: '2024-12-31',
            progress: 65,
            status: 'active',
            priority: 'high',
            budget: 50000,
            is_active: true,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          },
          {
            id: '2',
            name: 'Implementação de Sistema FP&A',
            description: 'Sistema de planejamento financeiro e análise',
            client_id: clientId || '1',
            created_by: '1',
            start_date: '2024-03-01',
            end_date: '2024-08-31',
            progress: 30,
            status: 'active',
            priority: 'medium',
            budget: 75000,
            is_active: true,
            created_at: '2024-03-01T00:00:00Z',
            updated_at: '2024-03-01T00:00:00Z'
          }
        ];
        setProjects(mockProjects);
      } else {
        setProjects(data);
      }
    } catch (error) {
      console.error('Error fetching gantt projects:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      
      // Em caso de erro, usar projetos de exemplo
      const mockProjects: GanttProject[] = [
        {
          id: '1',
          name: 'Projeto de Consultoria Financeira',
          description: 'Análise e planejamento financeiro para empresa de médio porte',
          client_id: clientId || '1',
          created_by: '1',
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          progress: 65,
          status: 'active',
          priority: 'high',
          budget: 50000,
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          name: 'Implementação de Sistema FP&A',
          description: 'Sistema de planejamento financeiro e análise',
          client_id: clientId || '1',
          created_by: '1',
          start_date: '2024-03-01',
          end_date: '2024-08-31',
          progress: 30,
          status: 'active',
          priority: 'medium',
          budget: 75000,
          is_active: true,
          created_at: '2024-03-01T00:00:00Z',
          updated_at: '2024-03-01T00:00:00Z'
        }
      ];
      setProjects(mockProjects);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (project: Omit<GanttProject, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('gantt_projects')
        .insert([project])
        .select()
        .single();

      if (error) throw error;
      
      setProjects(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error creating gantt project:', error);
      throw error;
    }
  };

  const updateProject = async (id: string, updates: Partial<GanttProject>) => {
    try {
      const { data, error } = await supabase
        .from('gantt_projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setProjects(prev => prev.map(project => project.id === id ? data : project));
      return data;
    } catch (error) {
      console.error('Error updating gantt project:', error);
      throw error;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('gantt_projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setProjects(prev => prev.filter(project => project.id !== id));
    } catch (error) {
      console.error('Error deleting gantt project:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [clientId]);

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    refetch: fetchProjects
  };
};
