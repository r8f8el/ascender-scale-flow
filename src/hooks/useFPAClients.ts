
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useFPAClients = () => {
  return useQuery({
    queryKey: ['fpa-clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fpa_clients')
        .select(`
          *,
          client_profile:client_profiles(name, email, company)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
};

export const useFPAClient = (clientId: string) => {
  return useQuery({
    queryKey: ['fpa-client', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fpa_clients')
        .select(`
          *,
          client_profile:client_profiles(name, email, company)
        `)
        .eq('id', clientId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!clientId
  });
};

export const useCreateFPAClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (clientData: any) => {
      const { data, error } = await supabase
        .from('fpa_clients')
        .insert(clientData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fpa-clients'] });
    }
  });
};
