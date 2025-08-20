

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
      
      console.log('🔍 Buscando tarefas para projeto:', projectId);

      const { data, error: fetchError } = await supabase
        .from('gantt_tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('start_date', { ascending: true });

      if (fetchError) {
        console.error('❌ Erro ao buscar tarefas:', fetchError);
        throw fetchError;
      }

      console.log('✅ Tarefas encontradas:', data);
      
      // Type conversion to ensure proper types
      const convertedTasks: GanttTask[] = (data || []).map(task => ({
        id: task.id,
        name: task.name,
        description: task.description || '',
        start_date: task.start_date,
        end_date: task.end_date,
        progress: task.progress || 0,
        priority: (['low', 'medium', 'high', 'urgent'].includes(task.priority) ? task.priority : 'medium') as 'low' | 'medium' | 'high' | 'urgent',
        assigned_to: task.assigned_to || null,
        dependencies: Array.isArray(task.dependencies) ? 
          (task.dependencies as any[]).filter(dep => typeof dep === 'string') : [],
        is_milestone: task.is_milestone || false,
        project_id: task.project_id,
        created_at: task.created_at,
        updated_at: task.updated_at,
        estimated_hours: task.estimated_hours || 0,
        actual_hours: task.actual_hours || 0,
        category: (task as any).category || '',
        tags: Array.isArray((task as any).tags) ? (task as any).tags.filter((tag: any) => typeof tag === 'string') : [],
        status: task.progress === 100 ? 'completed' : 
                task.progress > 0 ? 'in_progress' : 'pending',
        assignee: task.assigned_to || '',
        collaborators: (task as any).collaborators
      }));
      
      setTasks(convertedTasks);
    } catch (err) {
      console.error('❌ Erro ao buscar tarefas:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const createTask = useCallback(async (taskData: Omit<GanttTask, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('📤 Criando nova tarefa:', taskData);
      
      // Ensure data types match the database schema
      const sanitizedData = {
        project_id: taskData.project_id,
        name: taskData.name.trim(),
        description: taskData.description?.trim() || null,
        start_date: taskData.start_date,
        end_date: taskData.end_date,
        progress: Number(taskData.progress || 0),
        assigned_to: (taskData.assigned_to === 'default-value' || !taskData.assigned_to) ? null : taskData.assigned_to,
        priority: taskData.priority || 'medium',
        estimated_hours: taskData.estimated_hours ? Number(taskData.estimated_hours) : null,
        actual_hours: Number(taskData.actual_hours || 0),
        is_milestone: Boolean(taskData.is_milestone || false),
        dependencies: Array.isArray(taskData.dependencies) ? taskData.dependencies : []
      };
      
      console.log('📤 Dados sanitizados para inserção:', sanitizedData);

      const { data, error: createError } = await supabase
        .from('gantt_tasks')
        .insert(sanitizedData)
        .select()
        .single();

      if (createError) {
        console.error('❌ Erro ao criar tarefa:', createError);
        throw createError;
      }

      console.log('✅ Tarefa criada com sucesso:', data);

      const newTask: GanttTask = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        start_date: data.start_date,
        end_date: data.end_date,
        progress: data.progress || 0,
        priority: (['low', 'medium', 'high', 'urgent'].includes(data.priority) ? data.priority : 'medium') as 'low' | 'medium' | 'high' | 'urgent',
        assigned_to: data.assigned_to || null,
        dependencies: Array.isArray(data.dependencies) ? 
          (data.dependencies as any[]).filter(dep => typeof dep === 'string') : [],
        is_milestone: data.is_milestone || false,
        project_id: data.project_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
        estimated_hours: data.estimated_hours || 0,
        actual_hours: data.actual_hours || 0,
        category: (data as any).category || '',
        tags: Array.isArray((data as any).tags) ? (data as any).tags.filter((tag: any) => typeof tag === 'string') : [],
        status: data.progress === 100 ? 'completed' : 
                data.progress > 0 ? 'in_progress' : 'pending',
        assignee: data.assigned_to || '',
        collaborators: (data as any).collaborators
      };

      // Atualizar estado local imediatamente
      setTasks(prev => [...prev, newTask]);
      
      // Recarregar tarefas para garantir sincronização
      setTimeout(() => {
        fetchTasks();
      }, 500);
      
      return { data: newTask, error: null };
    } catch (err) {
      console.error('❌ Erro ao criar tarefa:', err);
      return { data: null, error: err };
    }
  }, [fetchTasks]);

  const updateTask = useCallback(async (taskId: string, updates: Partial<GanttTask>) => {
    try {
      console.log('📤 Atualizando tarefa:', taskId, updates);

      // Sanitizar dados de atualização
      const sanitizedUpdates = {
        ...updates,
        estimated_hours: updates.estimated_hours ? Number(updates.estimated_hours) : undefined,
        progress: updates.progress !== undefined ? Number(updates.progress) : undefined,
        actual_hours: updates.actual_hours !== undefined ? Number(updates.actual_hours) : undefined
      };

      const { data, error: updateError } = await supabase
        .from('gantt_tasks')
        .update(sanitizedUpdates)
        .eq('id', taskId)
        .select()
        .single();

      if (updateError) throw updateError;

      console.log('✅ Tarefa atualizada com sucesso:', data);

      const updatedTask: GanttTask = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        start_date: data.start_date,
        end_date: data.end_date,
        progress: data.progress || 0,
        priority: (['low', 'medium', 'high', 'urgent'].includes(data.priority) ? data.priority : 'medium') as 'low' | 'medium' | 'high' | 'urgent',
        assigned_to: data.assigned_to || null,
        dependencies: Array.isArray(data.dependencies) ? 
          (data.dependencies as any[]).filter(dep => typeof dep === 'string') : [],
        is_milestone: data.is_milestone || false,
        project_id: data.project_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
        estimated_hours: data.estimated_hours || 0,
        actual_hours: data.actual_hours || 0,
        category: (data as any).category || '',
        tags: Array.isArray((data as any).tags) ? (data as any).tags.filter((tag: any) => typeof tag === 'string') : [],
        status: data.progress === 100 ? 'completed' : 
                data.progress > 0 ? 'in_progress' : 'pending',
        assignee: data.assigned_to || '',
        collaborators: (data as any).collaborators
      };

      // Atualizar estado local
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, ...updatedTask } : task
      ));

      // Recarregar tarefas do banco para garantir sincronização
      setTimeout(() => {
        fetchTasks();
      }, 500);

      return { data: updatedTask, error: null };
    } catch (err) {
      console.error('❌ Erro ao atualizar tarefa:', err);
      return { data: null, error: err };
    }
  }, [fetchTasks]);

  const deleteTask = useCallback(async (taskId: string) => {
    try {
      console.log('🗑️ Excluindo tarefa:', taskId);

      const { error: deleteError } = await supabase
        .from('gantt_tasks')
        .delete()
        .eq('id', taskId);

      if (deleteError) throw deleteError;

      console.log('✅ Tarefa excluída com sucesso');

      // Atualizar estado local
      setTasks(prev => prev.filter(task => task.id !== taskId));
      
      // Recarregar tarefas do banco para garantir sincronização
      setTimeout(() => {
        fetchTasks();
      }, 500);

      return { error: null };
    } catch (err) {
      console.error('❌ Erro ao excluir tarefa:', err);
      return { error: err };
    }
  }, [fetchTasks]);

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
      console.error('❌ Erro ao atualizar progresso:', err);
      return { error: err };
    }
  }, []);

  const reorderTasks = useCallback(async (taskIds: string[]) => {
    try {
      // For now, just update the local state since we don't have display_order column
      setTasks(prev => {
        const taskMap = new Map(prev.map(task => [task.id, task]));
        return taskIds.map(id => taskMap.get(id)!).filter(Boolean);
      });

      return { error: null };
    } catch (err) {
      console.error('❌ Erro ao reordenar tarefas:', err);
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
