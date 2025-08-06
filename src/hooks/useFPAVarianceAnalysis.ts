
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useFPAVarianceAnalysis = (clientId?: string) => {
  return useQuery({
    queryKey: ['fpa-variance-analysis', clientId],
    queryFn: async () => {
      console.log('🔍 Fetching FPA variance analysis for client:', clientId);
      
      let query = supabase
        .from('fpa_variance_analysis')
        .select(`
          *,
          fpa_client:fpa_clients(company_name),
          period:fpa_periods(period_name, period_type),
          created_by_user:admin_profiles(name)
        `);
      
      if (clientId) {
        query = query.eq('fpa_client_id', clientId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Error fetching FPA variance analysis:', error);
        throw error;
      }
      
      console.log('✅ FPA variance analysis loaded:', data?.length, 'records');
      return data || [];
    },
    enabled: !!clientId,
    staleTime: 1000 * 60 * 5,
    retry: 2
  });
};

export const useCreateFPAVarianceAnalysis = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (varianceData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('fpa_variance_analysis')
        .insert({
          ...varianceData,
          created_by: user?.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fpa-variance-analysis'] });
    }
  });
};

export const useUpdateFPAVarianceAnalysis = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: any) => {
      const { data, error } = await supabase
        .from('fpa_variance_analysis')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fpa-variance-analysis'] });
    }
  });
};
