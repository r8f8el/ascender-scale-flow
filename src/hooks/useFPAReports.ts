import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useFPAReports = (clientId?: string) => {
  return useQuery({
    queryKey: ['fpa-reports', clientId],
    queryFn: async () => {
      console.log('🔍 Fetching FPA reports for client:', clientId);
      
      if (!clientId) {
        console.log('❌ No client ID provided');
        return [];
      }
      
      const { data, error } = await supabase
        .from('fpa_reports')
        .select(`
          *,
          fpa_client:fpa_clients(company_name),
          created_by_user:admin_profiles!fpa_reports_created_by_fkey(name)
        `)
        .eq('fpa_client_id', clientId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Error fetching FPA reports:', error);
        throw error;
      }
      
      console.log('✅ FPA reports loaded:', data?.length, 'records');
      return data || [];
    },
    enabled: !!clientId,
    staleTime: 1000 * 60 * 5,
    retry: 2
  });
};

export const useCreateFPAReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (reportData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('fpa_reports')
        .insert({
          ...reportData,
          created_by: user?.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fpa-reports'] });
    }
  });
};

export const useUpdateFPAReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: any) => {
      const { data, error } = await supabase
        .from('fpa_reports')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fpa-reports'] });
    }
  });
};
