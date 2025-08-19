
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
  assigned_to?: string;
  dependencies: string[];
  is_milestone: boolean;
  project_id: string;
  created_at: string;
  updated_at: string;
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

      const { data, error: fetchError } = await supabase
        .from('gantt_tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('start_date', { ascending: true });

      if (fetchError) throw fetchError;

      // Se não houver tarefas, criar algumas de exemplo
      if (!data || data.length === 0) {
        const mockTasks: GanttTask[] = [
          {
            id: '1',
            name: 'Análise de Forças',
            description: 'Identificar e analisar as forças internas da empresa',
            start_date: '2024-06-05',
            end_date: '2024-06-08',
            progress: 100,

            priority: 'medium',
            assigned_to: 'Rafael',
            dependencies: [],
            is_milestone: false,
            project_id: projectId,
            created_at: '2024-06-01T00:00:00Z',
            updated_at: '2024-06-01T00:00:00Z'
          },
          {
            id: '2',
            name: 'Análise de Fraquezas',
            description: 'Identificar e analisar as fraquezas internas da empresa',
            start_date: '2024-06-05',
            end_date: '2024-06-08',
            progress: 100,

            priority: 'medium',
            assigned_to: 'Rafael',
            dependencies: [],
            is_milestone: false,
            project_id: projectId,
            created_at: '2024-06-01T00:00:00Z',
            updated_at: '2024-06-01T00:00:00Z'
          },
          {
            id: '3',
            name: 'Análise de Oportunidades',
            description: 'Identificar e analisar as oportunidades externas',
            start_date: '2024-06-08',
            end_date: '2024-06-11',
            progress: 75,

            priority: 'medium',
            assigned_to: 'Rafael',
            dependencies: ['1', '2'],
            is_milestone: false,
            project_id: projectId,
            created_at: '2024-06-01T00:00:00Z',
            updated_at: '2024-06-01T00:00:00Z'
          },
          {
            id: '4',
            name: 'Análise de Ameaças',
            description: 'Identificar e analisar as ameaças externas',
            start_date: '2024-06-08',
            end_date: '2024-06-11',
            progress: 60,

            priority: 'medium',
            assigned_to: 'Rafael',
            dependencies: ['1', '2'],
            is_milestone: false,
            project_id: projectId,
            created_at: '2024-06-01T00:00:00Z',
            updated_at: '2024-06-01T00:00:00Z'
          },
          {
            id: '5',
            name: 'Compilação da Matriz SWOT',
            description: 'Criar a matriz SWOT consolidada',
            start_date: '2024-06-11',
            end_date: '2024-06-12',
            progress: 0,

            priority: 'high',
            assigned_to: 'Paula',
            dependencies: ['3', '4'],
            is_milestone: true,
            project_id: projectId,
            created_at: '2024-06-01T00:00:00Z',
            updated_at: '2024-06-01T00:00:00Z'
          },
          {
            id: '6',
            name: 'Criação de Planos de Ação',
            description: 'Desenvolver planos de ação baseados na análise SWOT',
            start_date: '2024-06-12',
            end_date: '2024-06-16',
            progress: 0,

            priority: 'high',
            assigned_to: 'Rafael e Paula',
            dependencies: ['5'],
            is_milestone: false,
            project_id: projectId,
            created_at: '2024-06-01T00:00:00Z',
            updated_at: '2024-06-01T00:00:00Z'
          },
          {
            id: '7',
            name: 'Apresentação para o cliente',
            description: 'Apresentar resultados e planos para o cliente',
            start_date: '2024-06-16',
            end_date: '2024-06-19',
            progress: 0,

            priority: 'high',
            assigned_to: 'Rafael e Paula',
            dependencies: ['6'],
            is_milestone: false,
            project_id: projectId,
            created_at: '2024-06-01T00:00:00Z',
            updated_at: '2024-06-01T00:00:00Z'
          }
        ];
        setTasks(mockTasks);
      } else {
        setTasks(data);
      }
    } catch (err) {
      console.error('Erro ao buscar tarefas:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      
      // Em caso de erro, usar tarefas de exemplo
      const mockTasks: GanttTask[] = [
        {
          id: '1',
          name: 'Análise de Forças',
          description: 'Identificar e analisar as forças internas da empresa',
          start_date: '2024-06-05',
          end_date: '2024-06-08',
          progress: 100,
          status: 'completed',
          priority: 'medium',
          assignee: 'Rafael',
          dependencies: [],
          is_milestone: false,
          project_id: projectId,
          created_at: '2024-06-01T00:00:00Z',
          updated_at: '2024-06-01T00:00:00Z'
        },
        {
          id: '2',
          name: 'Análise de Fraquezas',
          description: 'Identificar e analisar as fraquezas internas da empresa',
          start_date: '2024-06-05',
          end_date: '2024-06-08',
          progress: 100,
          status: 'completed',
          priority: 'medium',
          assignee: 'Rafael',
          dependencies: [],
          is_milestone: false,
          project_id: projectId,
          created_at: '2024-06-01T00:00:00Z',
          updated_at: '2024-06-01T00:00:00Z'
        }
      ];
      setTasks(mockTasks);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const createTask = useCallback(async (taskData: Omit<GanttTask, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error: createError } = await supabase
        .from('gantt_tasks')
        .insert(taskData)
        .select()
        .single();

      if (createError) throw createError;

      setTasks(prev => [...prev, data]);
      return { data, error: null };
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

      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, ...data } : task
      ));

      return { data, error: null };
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
      // Atualizar a ordem das tarefas no banco
      const updates = taskIds.map((taskId, index) => ({
        id: taskId,
        display_order: index
      }));

      const { error: updateError } = await supabase
        .from('gantt_tasks')
        .upsert(updates);

      if (updateError) throw updateError;

      // Reordenar localmente
      setTasks(prev => {
        const taskMap = new Map(prev.map(task => [task.id, task]));
        return taskIds.map(id => taskMap.get(id)!);
      });

      return { error: null };
    } catch (err) {
      console.error('Erro ao reordenar tarefas:', err);
      return { error: err };
    }
  }, []);

  // Carregar tarefas quando o projectId mudar
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
