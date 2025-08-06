
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useFPAReports = (clientId?: string) => {
  return useQuery({
    queryKey: ['fpa-reports', clientId],
    queryFn: async () => {
      let query = supabase
        .from('fpa_reports')
        .select(`
          *,
          fpa_client:fpa_clients!fpa_reports_fpa_client_id_fkey(
            id,
            company_name,
            client_profile_id
          )
        `);
      
      if (clientId) {
        query = query.eq('fpa_client_id', clientId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching FPA reports:', error);
        throw error;
      }
      return data || [];
    }
  });
};

export const useClientFPAReports = () => {
  return useQuery({
    queryKey: ['client-fpa-reports'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('fpa_reports')
        .select(`
          *,
          fpa_client:fpa_clients!fpa_reports_fpa_client_id_fkey!inner(
            id,
            company_name,
            client_profile_id
          )
        `)
        .eq('fpa_client.client_profile_id', user.id)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching client FPA reports:', error);
        throw error;
      }
      return data || [];
    }
  });
};

export const useCreateFPAReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (reportData: {
      fpa_client_id: string;
      title: string;
      report_type: string;
      period_covered: string;
      content: any;
      insights?: string;
      status?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('fpa_reports')
        .insert({
          ...reportData,
          created_by: user?.id
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating FPA report:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fpa-reports'] });
      toast.success('Relatório criado com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating FPA report:', error);
      toast.error('Erro ao criar relatório');
    }
  });
};

export const useUpdateFPAReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string; [key: string]: any }) => {
      const { data, error } = await supabase
        .from('fpa_reports')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating FPA report:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fpa-reports'] });
      toast.success('Relatório atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating FPA report:', error);
      toast.error('Erro ao atualizar relatório');
    }
  });
};

export const useDeleteFPAReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('fpa_reports')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting FPA report:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fpa-reports'] });
      toast.success('Relatório excluído com sucesso!');
    },
    onError: (error) => {
      console.error('Error deleting FPA report:', error);
      toast.error('Erro ao excluir relatório');
    }
  });
};
