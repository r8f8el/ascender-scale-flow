
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
      
      if (error) throw error;
      return data;
    }
  });
};

export const useCreateFPAPeriod = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (periodData: any) => {
      const { data, error } = await supabase
        .from('fpa_periods')
        .insert(periodData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fpa-periods'] });
    }
  });
};
