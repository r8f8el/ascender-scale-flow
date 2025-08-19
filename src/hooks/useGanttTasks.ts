import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface GanttTask {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  progress: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string | null;
  dependencies: string[];
  is_milestone: boolean;
  project_id: string;
  created_at: string;
  updated_at: string;
  estimated_hours?: number;
  actual_hours?: number;
  category?: string;
  tags?: string[];
  status?: 'pending' | 'in_progress' | 'completed' | 'blocked';
  assignee?: string;
  collaborators?: any;
}

export const useGanttTasks = (projectId: string) => {
  const [tasks, setTasks] = useState<GanttTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching tasks for project:', projectId);

      const { data, error: fetchError } = await supabase
        .from('gantt_tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('start_date', { ascending: true });

      if (fetchError) {
        console.error('Error fetching tasks:', fetchError);
        throw fetchError;
      }

      console.log('Tasks fetched successfully:', data);
      
      // Type conversion to ensure proper types
      const convertedTasks: GanttTask[] = (data || []).map(task => ({
        ...task,
        priority: (task.priority as 'low' | 'medium' | 'high' | 'urgent') || 'medium',
        status: (task.status as 'pending' | 'in_progress' | 'completed' | 'blocked') || 'pending',
        dependencies: Array.isArray(task.dependencies) ? task.dependencies : [],
        tags: Array.isArray(task.tags) ? task.tags : []
      }));
      
      setTasks(convertedTasks);
    } catch (err) {
      console.error('Erro ao buscar tarefas:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const createTask = useCallback(async (taskData: Omit<GanttTask, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('📤 Dados sendo enviados:', taskData);
      
      // Ensure assigned_to is null if it's 'default-value' or empty
      const sanitizedData = {
        ...taskData,
        assigned_to: taskData.assigned_to === 'default-value' || !taskData.assigned_to ? null : taskData.assigned_to,
        estimated_hours: taskData.estimated_hours || 8,
        actual_hours: taskData.actual_hours || 0,
        progress: taskData.progress || 0
      };
      
      console.log('📤 Dados de inserção:', sanitizedData);

      const { data, error: createError } = await supabase
        .from('gantt_tasks')
        .insert(sanitizedData)
        .select()
        .single();

      if (createError) {
        console.error('Erro ao salvar tarefa:', createError);
        throw createError;
      }

      const newTask: GanttTask = {
        ...data,
        priority: (data.priority as 'low' | 'medium' | 'high' | 'urgent') || 'medium',
        status: (data.status as 'pending' | 'in_progress' | 'completed' | 'blocked') || 'pending',
        dependencies: Array.isArray(data.dependencies) ? data.dependencies : [],
        tags: Array.isArray(data.tags) ? data.tags : []
      };

      setTasks(prev => [...prev, newTask]);
      return { data: newTask, error: null };
    } catch (err) {
      console.error('Erro ao criar tarefa:', err);
      return { data: null, error: err };
    }
  }, []);

  const updateTask = useCallback(async (taskId: string, updates: Partial<GanttTask>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('gantt_tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single();

      if (updateError) throw updateError;

      const updatedTask: GanttTask = {
        ...data,
        priority: (data.priority as 'low' | 'medium' | 'high' | 'urgent') || 'medium',
        status: (data.status as 'pending' | 'in_progress' | 'completed' | 'blocked') || 'pending',
        dependencies: Array.isArray(data.dependencies) ? data.dependencies : [],
        tags: Array.isArray(data.tags) ? data.tags : []
      };

      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, ...updatedTask } : task
      ));

      return { data: updatedTask, error: null };
    } catch (err) {
      console.error('Erro ao atualizar tarefa:', err);
      return { data: null, error: err };
    }
  }, []);

  const deleteTask = useCallback(async (taskId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('gantt_tasks')
        .delete()
        .eq('id', taskId);

      if (deleteError) throw deleteError;

      setTasks(prev => prev.filter(task => task.id !== taskId));
      return { error: null };
    } catch (err) {
      console.error('Erro ao excluir tarefa:', err);
      return { error: err };
    }
  }, []);

  const updateTaskProgress = useCallback(async (taskId: string, progress: number) => {
    try {
      const { error: updateError } = await supabase
        .from('gantt_tasks')
        .update({ progress })
        .eq('id', taskId);

      if (updateError) throw updateError;

      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, progress } : task
      ));

      return { error: null };
    } catch (err) {
      console.error('Erro ao atualizar progresso:', err);
      return { error: err };
    }
  }, []);

  const reorderTasks = useCallback(async (taskIds: string[]) => {
    try {
      const updates = taskIds.map((taskId, index) => ({
        id: taskId,
        display_order: index
      }));

      const { error: updateError } = await supabase
        .from('gantt_tasks')
        .upsert(updates);

      if (updateError) throw updateError;

      setTasks(prev => {
        const taskMap = new Map(prev.map(task => [task.id, task]));
        return taskIds.map(id => taskMap.get(id)!).filter(Boolean);
      });

      return { error: null };
    } catch (err) {
      console.error('Erro ao reordenar tarefas:', err);
      return { error: err };
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    updateTaskProgress,
    reorderTasks,
    refetch: fetchTasks
  };
};
