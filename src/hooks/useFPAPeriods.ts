
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useFPAPeriods = (clientId?: string) => {
  return useQuery({
    queryKey: ['fpa-periods', clientId],
    queryFn: async () => {
      let query = supabase
        .from('fpa_periods')
        .select('*');
      
      if (clientId) {
        query = query.eq('fpa_client_id', clientId);
      }
      
      const { data, error } = await query.order('start_date', { ascending: false });
      
      if (error) {
        console.error('Error fetching FPA periods:', error);
        throw error;
      }
      return data || [];
    },
    enabled: !!clientId
  });
};

export const useCreateFPAPeriod = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (periodData: {
      fpa_client_id: string;
      start_date: string;
      end_date: string;
      period_type: string;
      period_name?: string;
      is_actual?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('fpa_periods')
        .insert(periodData)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating FPA period:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fpa-periods'] });
      toast.success('Período criado com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating FPA period:', error);
      toast.error('Erro ao criar período');
    }
  });
};

export const useUpdateFPAPeriod = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string; [key: string]: any }) => {
      const { data, error } = await supabase
        .from('fpa_periods')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating FPA period:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fpa-periods'] });
      toast.success('Período atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating FPA period:', error);
      toast.error('Erro ao atualizar período');
    }
  });
};
