import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useFPAFinancialData = (clientId?: string, periodId?: string) => {
  return useQuery({
    queryKey: ['fpa-financial-data', clientId, periodId],
    queryFn: async () => {
      console.log('🔍 Fetching FPA financial data for client:', clientId, 'period:', periodId);
      
      let query = supabase
        .from('fpa_financial_data')
        .select(`
          *,
          fpa_client:fpa_clients!fpa_financial_data_fpa_client_id_fkey(company_name),
          period:fpa_periods!fpa_financial_data_period_id_fkey(id, period_name, period_type, is_actual, start_date, end_date)
        `);
      
      if (clientId) {
        query = query.eq('fpa_client_id', clientId);
      }
      
      if (periodId) {
        query = query.eq('period_id', periodId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      console.log('📊 FPA Financial data response:', { data, error });
      
      if (error) {
        console.error('❌ Error fetching FPA financial data:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!clientId,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
  });
};

export const useCreateFPAFinancialData = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (financialData: any) => {
      console.log('💾 Creating FPA financial data:', financialData);
      
      const { data, error } = await supabase
        .from('fpa_financial_data')
        .insert(financialData)
        .select()
        .single();
      
      if (error) {
        console.error('❌ Error creating FPA financial data:', error);
        throw error;
      }
      
      console.log('✅ FPA financial data created:', data);
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
      console.log('🔄 Updating FPA financial data:', id, updateData);
      
      const { data, error } = await supabase
        .from('fpa_financial_data')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('❌ Error updating FPA financial data:', error);
        throw error;
      }
      
      console.log('✅ FPA financial data updated:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fpa-financial-data'] });
    }
  });
};
