
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useFPADataUploads = (clientId?: string) => {
  return useQuery({
    queryKey: ['fpa-data-uploads', clientId],
    queryFn: async () => {
      let query = supabase
        .from('fpa_data_uploads')
        .select(`
          *,
          fpa_client:fpa_clients(company_name),
          period:fpa_periods(period_name, period_type)
        `);
      
      if (clientId) {
        query = query.eq('fpa_client_id', clientId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!clientId
  });
};

export const useCreateFPADataUpload = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (uploadData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('fpa_data_uploads')
        .insert({
          ...uploadData,
          uploaded_by: user?.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fpa-data-uploads'] });
    }
  });
};

export const useUpdateFPADataUpload = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: any) => {
      const { data, error } = await supabase
        .from('fpa_data_uploads')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fpa-data-uploads'] });
    }
  });
};
