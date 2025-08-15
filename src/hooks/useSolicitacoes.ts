
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Solicitacao, Anexo, HistoricoAprovacao } from '@/types/aprovacoes';

export const useSolicitacoes = (userId?: string) => {
  return useQuery({
    queryKey: ['solicitacoes', userId],
    queryFn: async () => {
      let query = supabase
        .from('solicitacoes')
        .select('*')
        .order('data_criacao', { ascending: false });

      if (userId) {
        query = query.eq('solicitante_id', userId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Solicitacao[];
    }
  });
};

export const useSolicitacaoPendentes = (aprovadorId: string) => {
  return useQuery({
    queryKey: ['solicitacoes-pendentes', aprovadorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('solicitacoes')
        .select('*')
        .eq('aprovador_atual_id', aprovadorId)
        .eq('status', 'Pendente')
        .order('data_criacao', { ascending: false });

      if (error) throw error;
      return data as Solicitacao[];
    }
  });
};

export const useCreateSolicitacao = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<Solicitacao, 'id' | 'data_criacao' | 'data_ultima_modificacao'>) => {
      const { data: solicitacao, error } = await supabase
        .from('solicitacoes')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return solicitacao;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitacoes'] });
      toast.success('Solicitação criada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar solicitação:', error);
      toast.error('Erro ao criar solicitação');
    }
  });
};

export const useUpdateSolicitacao = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Solicitacao> & { id: string }) => {
      const { data: solicitacao, error } = await supabase
        .from('solicitacoes')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return solicitacao;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitacoes'] });
      toast.success('Solicitação atualizada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar solicitação:', error);
      toast.error('Erro ao atualizar solicitação');
    }
  });
};

export const useAnexos = (solicitacaoId: string) => {
  return useQuery({
    queryKey: ['anexos', solicitacaoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('anexos')
        .select('*')
        .eq('solicitacao_id', solicitacaoId)
        .order('data_upload', { ascending: false });

      if (error) throw error;
      return data as Anexo[];
    },
    enabled: !!solicitacaoId
  });
};

export const useHistoricoAprovacao = (solicitacaoId: string) => {
  return useQuery({
    queryKey: ['historico-aprovacao', solicitacaoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('historico_aprovacao')
        .select('*')
        .eq('solicitacao_id', solicitacaoId)
        .order('data_acao', { ascending: true });

      if (error) throw error;
      return data as HistoricoAprovacao[];
    },
    enabled: !!solicitacaoId
  });
};

export const useCreateHistorico = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<HistoricoAprovacao, 'id' | 'data_acao'>) => {
      const { data: historico, error } = await supabase
        .from('historico_aprovacao')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return historico;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['historico-aprovacao', variables.solicitacao_id] });
    }
  });
};
