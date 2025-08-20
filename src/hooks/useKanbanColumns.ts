
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { KanbanColumn } from './useKanbanBoards';

export const useKanbanColumns = (boardId: string) => {
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchColumns = async () => {
    if (!boardId) return;
    
    try {
      const { data, error } = await supabase
        .from('kanban_columns')
        .select('*')
        .eq('board_id', boardId)
        .order('column_order');

      if (error) throw error;
      setColumns(data || []);
    } catch (error) {
      console.error('Error fetching columns:', error);
      toast.error('Erro ao carregar colunas');
    } finally {
      setLoading(false);
    }
  };

  const createColumn = async (columnData: Omit<KanbanColumn, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('kanban_columns')
        .insert([{
          ...columnData,
          board_id: boardId,
          column_order: columns.length
        }])
        .select()
        .single();

      if (error) throw error;
      
      setColumns(prev => [...prev, data]);
      toast.success('Coluna criada com sucesso');
      return data;
    } catch (error) {
      console.error('Error creating column:', error);
      toast.error('Erro ao criar coluna');
    }
  };

  const updateColumn = async (id: string, updates: Partial<KanbanColumn>) => {
    try {
      const { data, error } = await supabase
        .from('kanban_columns')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setColumns(prev => prev.map(column => column.id === id ? data : column));
      toast.success('Coluna atualizada');
      return data;
    } catch (error) {
      console.error('Error updating column:', error);
      toast.error('Erro ao atualizar coluna');
    }
  };

  const deleteColumn = async (id: string) => {
    try {
      // First check if column has tasks
      const { data: tasks } = await supabase
        .from('kanban_tasks')
        .select('id')
        .eq('column_id', id);

      if (tasks && tasks.length > 0) {
        toast.error('Não é possível excluir uma coluna que contém tarefas');
        return;
      }

      const { error } = await supabase
        .from('kanban_columns')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setColumns(prev => prev.filter(column => column.id !== id));
      toast.success('Coluna excluída');
    } catch (error) {
      console.error('Error deleting column:', error);
      toast.error('Erro ao excluir coluna');
    }
  };

  const reorderColumns = async (newOrder: KanbanColumn[]) => {
    try {
      // Update each column individually
      const updatePromises = newOrder.map((column, index) =>
        supabase
          .from('kanban_columns')
          .update({ column_order: index })
          .eq('id', column.id)
      );

      const results = await Promise.all(updatePromises);
      
      // Check if any update failed
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error('Failed to update column order');
      }
      
      setColumns(newOrder);
    } catch (error) {
      console.error('Error reordering columns:', error);
      toast.error('Erro ao reordenar colunas');
    }
  };

  useEffect(() => {
    fetchColumns();
  }, [boardId]);

  return {
    columns,
    loading,
    createColumn,
    updateColumn,
    deleteColumn,
    reorderColumns,
    refetch: fetchColumns
  };
};
