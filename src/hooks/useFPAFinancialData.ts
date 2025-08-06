
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useFPAFinancialData = (clientId?: string, periodId?: string) => {
  return useQuery({
    queryKey: ['fpa-financial-data', clientId, periodId],
    queryFn: async () => {
      let query = supabase
        .from('fpa_financial_data')
        .select(`
          *,
          fpa_client:fpa_clients!fpa_financial_data_fpa_client_id_fkey(company_name),
          period:fpa_periods(period_name, period_type)
        `);
      
      if (clientId) {
        query = query.eq('fpa_client_id', clientId);
      }
      
      if (periodId) {
        query = query.eq('period_id', periodId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!clientId
  });
};

export const useCreateFPAFinancialData = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (financialData: any) => {
      const { data, error } = await supabase
        .from('fpa_financial_data')
        .insert(financialData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fpa-financial-data'] });
    }
  });
};

export const useUpdateFPAFinancialData = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: any) => {
      const { data, error } = await supabase
        .from('fpa_financial_data')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fpa-financial-data'] });
    }
  });
};
