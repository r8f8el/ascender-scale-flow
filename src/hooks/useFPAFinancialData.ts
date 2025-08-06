
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useFPAFinancialData = (clientId?: string) => {
  return useQuery({
    queryKey: ['fpa-financial-data', clientId],
    queryFn: async () => {
      console.log('🔍 Fetching FPA financial data for client:', clientId);
      
      let query = supabase
        .from('fpa_financial_data')
        .select(`
          *,
          fpa_client:fpa_clients(company_name)
        `);
      
      if (clientId) {
        query = query.eq('fpa_client_id', clientId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Error fetching FPA financial data:', error);
        throw error;
      }
      
      console.log('✅ FPA financial data loaded:', data?.length, 'records');
      return data || [];
    },
    enabled: !!clientId,
    staleTime: 1000 * 60 * 5,
    retry: 2
  });
};

export const useCreateFPAFinancialData = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (financialData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('fpa_financial_data')
        .insert({
          ...financialData,
          created_by: user?.id
        })
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
