import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface FPAScenario {
  id: string;
  fpa_client_id: string;
  name: string;
  description?: string;
  type: 'base' | 'otimista' | 'pessimista' | 'custom';
  status: 'ativo' | 'rascunho' | 'arquivado';
  assumptions: Record<string, any>;
  results: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreateFPAScenarioParams {
  fpa_client_id: string;
  name: string;
  description?: string;
  type: 'base' | 'otimista' | 'pessimista' | 'custom';
  assumptions?: Record<string, any>;
  results?: Record<string, any>;
}

export const useFPAScenarios = (fpaClientId?: string) => {
  return useQuery({
    queryKey: ['fpa-scenarios', fpaClientId],
    queryFn: async () => {
      if (!fpaClientId) return [];

      const { data, error } = await supabase
        .from('fpa_scenarios')
        .select('*')
        .eq('fpa_client_id', fpaClientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as FPAScenario[];
    },
    enabled: !!fpaClientId,
    staleTime: 1000 * 60 * 2,
  });
};

export const useCreateFPAScenario = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateFPAScenarioParams) => {
      const { data, error } = await supabase
        .from('fpa_scenarios')
        .insert({
          fpa_client_id: params.fpa_client_id,
          name: params.name,
          description: params.description || null,
          type: params.type,
          status: 'rascunho',
          assumptions: params.assumptions || {},
          results: params.results || {},
        })
        .select('*')
        .single();

      if (error) throw error;
      return data as FPAScenario;
    },
    onSuccess: (data) => {
      toast.success('Cenário criado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['fpa-scenarios', data.fpa_client_id] });
    },
    onError: (error: any) => {
      toast.error('Erro ao criar cenário: ' + (error.message || 'Erro desconhecido'));
    },
  });
};

export const useUpdateFPAScenario = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FPAScenario> & { id: string }) => {
      const { data, error } = await supabase
        .from('fpa_scenarios')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;
      return data as FPAScenario;
    },
    onSuccess: (data) => {
      toast.success('Cenário atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['fpa-scenarios', data.fpa_client_id] });
    },
    onError: (error: any) => {
      toast.error('Erro ao atualizar cenário: ' + (error.message || 'Erro desconhecido'));
    },
  });
};

export const useDeleteFPAScenario = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, fpaClientId }: { id: string; fpaClientId: string }) => {
      const { error } = await supabase
        .from('fpa_scenarios')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { id, fpaClientId };
    },
    onSuccess: (_, { fpaClientId }) => {
      toast.success('Cenário removido com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['fpa-scenarios', fpaClientId] });
    },
    onError: (error: any) => {
      toast.error('Erro ao remover cenário: ' + (error.message || 'Erro desconhecido'));
    },
  });
};
