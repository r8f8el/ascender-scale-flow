import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface KanbanBoard {
  id: string;
  name: string;
  description?: string;
  client_id?: string;
  created_by?: string;
  is_active: boolean;
  board_order: number;
  created_at: string;
  updated_at: string;
}

export interface KanbanColumn {
  id: string;
  board_id: string;
  name: string;
  color: string;
  column_order: number;
  wip_limit?: number;
  is_done_column: boolean;
  created_at: string;
  updated_at: string;
}

export interface KanbanTask {
  id: string;
  title: string;
  description?: string;
  column_id: string;
  board_id: string;
  assigned_to?: string;
  created_by?: string;
  priority: string;
  due_date?: string;
  start_date?: string;
  estimated_hours?: number;
  actual_hours: number;
  task_order: number;
  labels: any;
  attachments: any;
  checklist: any;
  created_at: string;
  updated_at: string;
  collaborators?: {
    id: string;
    name: string;
    email: string;
  };
}

export const useKanbanBoards = (clientId?: string) => {
  const [boards, setBoards] = useState<KanbanBoard[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBoards = async () => {
    try {
      let query = supabase
        .from('kanban_boards')
        .select('*')
        .eq('is_active', true)
        .order('board_order');

      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setBoards(data || []);
    } catch (error) {
      console.error('Error fetching kanban boards:', error);
      toast.error('Erro ao carregar quadros');
    } finally {
      setLoading(false);
    }
  };

  const createBoard = async (board: Omit<KanbanBoard, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('kanban_boards')
        .insert([board])
        .select()
        .single();

      if (error) throw error;
      
      setBoards(prev => [...prev, data]);
      toast.success('Quadro criado com sucesso');
      return data;
    } catch (error) {
      console.error('Error creating kanban board:', error);
      toast.error('Erro ao criar quadro');
    }
  };

  const updateBoard = async (id: string, updates: Partial<KanbanBoard>) => {
    try {
      const { data, error } = await supabase
        .from('kanban_boards')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setBoards(prev => prev.map(board => board.id === id ? data : board));
      toast.success('Quadro atualizado');
      return data;
    } catch (error) {
      console.error('Error updating kanban board:', error);
      toast.error('Erro ao atualizar quadro');
    }
  };

  const deleteBoard = async (id: string) => {
    try {
      const { error } = await supabase
        .from('kanban_boards')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setBoards(prev => prev.filter(board => board.id !== id));
      toast.success('Quadro excluído');
    } catch (error) {
      console.error('Error deleting kanban board:', error);
      toast.error('Erro ao excluir quadro');
    }
  };

  useEffect(() => {
    fetchBoards();
  }, [clientId]);

  return {
    boards,
    loading,
    createBoard,
    updateBoard,
    deleteBoard,
    refetch: fetchBoards
  };
};

export const useKanbanData = (boardId: string) => {
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [tasks, setTasks] = useState<KanbanTask[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBoardData = async () => {
    if (!boardId) return;
    
    try {
      setLoading(true);
      
      // Fetch columns
      const { data: columnsData, error: columnsError } = await supabase
        .from('kanban_columns')
        .select('*')
        .eq('board_id', boardId)
        .order('column_order');

      if (columnsError) throw columnsError;

      // Fetch tasks with collaborator info
      const { data: tasksData, error: tasksError } = await supabase
        .from('kanban_tasks')
        .select(`
          *,
          collaborators (
            id,
            name,
            email
          )
        `)
        .eq('board_id', boardId)
        .order('task_order');

      if (tasksError) throw tasksError;

      setColumns(columnsData || []);
      setTasks(tasksData || []);
    } catch (error) {
      console.error('Error fetching board data:', error);
      toast.error('Erro ao carregar dados do quadro');
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (task: Omit<KanbanTask, 'id' | 'created_at' | 'updated_at' | 'collaborators'>) => {
    try {
      const { data, error } = await supabase
        .from('kanban_tasks')
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
      console.error('Error creating task:', error);
      toast.error('Erro ao criar tarefa');
    }
  };

  const updateTask = async (id: string, updates: Partial<KanbanTask>) => {
    try {
      const { data, error } = await supabase
        .from('kanban_tasks')
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
      return data;
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Erro ao atualizar tarefa');
    }
  };

  const moveTask = async (taskId: string, destinationColumnId: string, newOrder: number) => {
    try {
      const { error } = await supabase
        .from('kanban_tasks')
        .update({
          column_id: destinationColumnId,
          task_order: newOrder
        })
        .eq('id', taskId);

      if (error) throw error;
      
      // Update local state
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, column_id: destinationColumnId, task_order: newOrder }
          : task
      ));
    } catch (error) {
      console.error('Error moving task:', error);
      toast.error('Erro ao mover tarefa');
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('kanban_tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setTasks(prev => prev.filter(task => task.id !== id));
      toast.success('Tarefa excluída');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Erro ao excluir tarefa');
    }
  };

  useEffect(() => {
    fetchBoardData();
  }, [boardId]);

  return {
    columns,
    tasks,
    loading,
    createTask,
    updateTask,
    moveTask,
    deleteTask,
    refetch: fetchBoardData
  };
};