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
          client_profile:client_profiles!fpa_clients_client_profile_id_fkey(id, name, email, company)
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
          client_profile:client_profiles!fpa_clients_client_profile_id_fkey(id, name, email, company)
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

// Hook para criar cliente FP&A diretamente de client_profiles existentes
export const useCreateFPAClientFromProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (clientProfileId: string) => {
      // Primeiro buscar o perfil do cliente
      const { data: profile, error: profileError } = await supabase
        .from('client_profiles')
        .select('*')
        .eq('id', clientProfileId)
        .single();
      
      if (profileError) {
        console.error('Error fetching client profile:', profileError);
        throw profileError;
      }

      // Verificar se já existe um cliente FP&A para este perfil
      const { data: existingClient, error: checkError } = await supabase
        .from('fpa_clients')
        .select('id')
        .eq('client_profile_id', clientProfileId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing FPA client:', checkError);
        throw checkError;
      }

      if (existingClient) {
        return existingClient;
      }

      // Criar novo cliente FP&A
      const { data, error } = await supabase
        .from('fpa_clients')
        .insert({
          client_profile_id: clientProfileId,
          company_name: profile.company || profile.name,
          onboarding_completed: false,
          current_phase: 1
        })
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
