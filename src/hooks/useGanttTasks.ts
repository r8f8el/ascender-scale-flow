
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTaskNotifications } from './useTaskNotifications';

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

export const useGanttTasks = (projectId: string) => {
  const [tasks, setTasks] = useState<GanttTask[]>([]);
  const [loading, setLoading] = useState(true);
  const { notifyTaskAssignment } = useTaskNotifications();

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

      // Enviar notificação se tarefa foi atribuída
      if (data.assigned_to && data.collaborators) {
        const { data: projectData } = await supabase
          .from('gantt_projects')
          .select('name')
          .eq('id', projectId)
          .single();

        await notifyTaskAssignment.mutateAsync({
          taskName: data.name,
          assignedToEmail: data.collaborators.email,
          assignedToName: data.collaborators.name,
          projectName: projectData?.name || 'Projeto'
        });
      }

      return data;
    } catch (error) {
      console.error('Error creating gantt task:', error);
      toast.error('Erro ao criar tarefa');
    }
  };

  const updateTask = async (id: string, updates: Partial<GanttTask>) => {
    try {
      const oldTask = tasks.find(t => t.id === id);
      
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

      // Enviar notificação se a atribuição mudou
      if (updates.assigned_to && 
          updates.assigned_to !== oldTask?.assigned_to && 
          data.collaborators) {
        
        const { data: projectData } = await supabase
          .from('gantt_projects')
          .select('name')
          .eq('id', projectId)
          .single();

        await notifyTaskAssignment.mutateAsync({
          taskName: data.name,
          assignedToEmail: data.collaborators.email,
          assignedToName: data.collaborators.name,
          projectName: projectData?.name || 'Projeto'
        });
      }

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
