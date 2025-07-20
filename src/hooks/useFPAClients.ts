
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useFPAClients = () => {
  return useQuery({
    queryKey: ['fpa-clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fpa_clients')
        .select(`
          *,
          client_profile:client_profiles(id, name, email, company)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching FPA clients:', error);
        throw error;
      }
      return data || [];
    }
  });
};

export const useFPAClient = (clientId: string) => {
  return useQuery({
    queryKey: ['fpa-client', clientId],
    queryFn: async () => {
      if (!clientId) return null;
      
      const { data, error } = await supabase
        .from('fpa_clients')
        .select(`
          *,
          client_profile:client_profiles(id, name, email, company)
        `)
        .eq('id', clientId)
        .single();
      
      if (error) {
        console.error('Error fetching FPA client:', error);
        throw error;
      }
      return data;
    },
    enabled: !!clientId
  });
};

export const useCreateFPAClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (clientData: {
      client_profile_id: string;
      company_name: string;
      industry?: string;
      business_model?: string;
      strategic_objectives?: string;
    }) => {
      const { data, error } = await supabase
        .from('fpa_clients')
        .insert(clientData)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating FPA client:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fpa-clients'] });
      toast.success('Cliente FP&A criado com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating FPA client:', error);
      toast.error('Erro ao criar cliente FP&A');
    }
  });
};

export const useUpdateFPAClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string; [key: string]: any }) => {
      const { data, error } = await supabase
        .from('fpa_clients')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating FPA client:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fpa-clients'] });
      toast.success('Cliente FP&A atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating FPA client:', error);
      toast.error('Erro ao atualizar cliente FP&A');
    }
  });
};
