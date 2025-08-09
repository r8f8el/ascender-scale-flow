import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

export interface GanttTask {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  progress: number;
  assigned_to?: string;
  created_by?: string;
  priority: string;
  estimated_hours?: number;
  actual_hours: number;
  is_milestone: boolean;
  dependencies: any;
  created_at: string;
  updated_at: string;
  collaborators?: {
    id: string;
    name: string;
    email: string;
  };
}

export const useGanttProjects = (clientId?: string) => {
  const [projects, setProjects] = useState<GanttProject[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      let query = supabase
        .from('gantt_projects')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching gantt projects:', error);
      toast.error('Erro ao carregar projetos');
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
      toast.success('Projeto criado com sucesso');
      return data;
    } catch (error) {
      console.error('Error creating gantt project:', error);
      toast.error('Erro ao criar projeto');
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
      toast.success('Projeto atualizado');
      return data;
    } catch (error) {
      console.error('Error updating gantt project:', error);
      toast.error('Erro ao atualizar projeto');
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
      toast.success('Projeto excluído');
    } catch (error) {
      console.error('Error deleting gantt project:', error);
      toast.error('Erro ao excluir projeto');
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [clientId]);

  return {
    projects,
    loading,
    createProject,
    updateProject,
    deleteProject,
    refetch: fetchProjects
  };
};

export const useGanttTasks = (projectId: string) => {
  const [tasks, setTasks] = useState<GanttTask[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('gantt_tasks')
        .select(`
          *,
          collaborators (
            id,
            name,
            email
          )
        `)
        .eq('project_id', projectId)
        .order('start_date');

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching gantt tasks:', error);
      toast.error('Erro ao carregar tarefas');
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (task: Omit<GanttTask, 'id' | 'created_at' | 'updated_at' | 'collaborators'>) => {
    try {
      const { data, error } = await supabase
        .from('gantt_tasks')
        .insert([task])
        .select(`
          *,
          collaborators (
            id,
            name,
            email
          )
        `)
        .single();

      if (error) throw error;
      
      setTasks(prev => [...prev, data]);
      toast.success('Tarefa criada');
      return data;
    } catch (error) {
      console.error('Error creating gantt task:', error);
      toast.error('Erro ao criar tarefa');
    }
  };

  const updateTask = async (id: string, updates: Partial<GanttTask>) => {
    try {
      const { data, error } = await supabase
        .from('gantt_tasks')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          collaborators (
            id,
            name,
            email
          )
        `)
        .single();

      if (error) throw error;
      
      setTasks(prev => prev.map(task => task.id === id ? data : task));
      toast.success('Tarefa atualizada');
      return data;
    } catch (error) {
      console.error('Error updating gantt task:', error);
      toast.error('Erro ao atualizar tarefa');
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('gantt_tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setTasks(prev => prev.filter(task => task.id !== id));
      toast.success('Tarefa excluída');
    } catch (error) {
      console.error('Error deleting gantt task:', error);
      toast.error('Erro ao excluir tarefa');
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  return {
    tasks,
    loading,
    createTask,
    updateTask,
    deleteTask,
    refetch: fetchTasks
  };
};