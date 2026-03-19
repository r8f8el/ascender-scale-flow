import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Solicitacao, Anexo, HistoricoAprovacao } from '@/types/aprovacoes';
import { toast } from 'sonner';

interface CreateSolicitacaoParams {
  solicitacao: Omit<Solicitacao, 'id' | 'data_criacao' | 'data_ultima_modificacao'>;
  files: File[];
  aprovadores: Array<{
    id: string;
    name: string;
    email: string;
    nivel: number;
  }>;
}

interface UpdateSolicitacaoParams {
  id: string;
  status?: string;
  aprovador_atual_id?: string;
  etapa_atual?: number;
}

interface CreateHistoricoParams {
  solicitacao_id: string;
  usuario_id: string;
  nome_usuario: string;
  acao: 'Criação' | 'Aprovação' | 'Rejeição' | 'Solicitação de Ajuste';
  comentario?: string;
}

interface RawSolicitacao {
  id: string;
  titulo: string;
  descricao: string;
  tipo_solicitacao?: string;
  periodo_referencia: string;
  valor_solicitado?: number;
  justificativa?: string;
  data_limite?: string;
  prioridade?: string;
  status?: string;
  solicitante_id: string;
  aprovador_atual_id?: string;
  etapa_atual: number;
  aprovadores_necessarios?: any;
  aprovadores_completos?: any;
  data_criacao: string;
  data_ultima_modificacao: string;
}

const formatSolicitacao = (rawData: RawSolicitacao): Solicitacao => {
  return {
    ...rawData,
    tipo_solicitacao: rawData.tipo_solicitacao || 'Geral',
    prioridade: (rawData.prioridade as 'Baixa' | 'Media' | 'Alta') || 'Media',
    status: (rawData.status as 'Em Elaboração' | 'Pendente' | 'Aprovado' | 'Rejeitado' | 'Requer Ajuste') || 'Em Elaboração',
  };
};

// My own requests
export const useSolicitacoes = (userId?: string) => {
  return useQuery({
    queryKey: ['solicitacoes', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('solicitacoes')
        .select('*')
        .eq('solicitante_id', userId)
        .order('data_criacao', { ascending: false });

      if (error) throw error;
      return (data || []).map(formatSolicitacao);
    },
    enabled: !!userId,
  });
};

// All requests (admin)
export const useAllSolicitacoes = () => {
  return useQuery({
    queryKey: ['all-solicitacoes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('solicitacoes')
        .select('*')
        .order('data_criacao', { ascending: false });

      if (error) throw error;
      return (data || []).map(formatSolicitacao);
    },
    staleTime: 1000 * 60 * 2,
  });
};

// Pending requests where I am an approver (checks aprovadores_necessarios JSON or aprovador_atual_id)
export const useSolicitacaoPendentes = (userId?: string) => {
  return useQuery({
    queryKey: ['solicitacoes-pendentes', userId],
    queryFn: async () => {
      if (!userId) return [];

      // Get all pending requests
      const { data, error } = await supabase
        .from('solicitacoes')
        .select('*')
        .eq('status', 'Pendente')
        .order('data_criacao', { ascending: false });

      if (error) throw error;

      // Filter client-side: requests where I am listed as an approver
      const pendentes = (data || []).filter(sol => {
        // Check if I'm the current approver
        if (sol.aprovador_atual_id === userId) return true;
        
        // Check if I'm in the aprovadores_necessarios list
        const aprovadores = sol.aprovadores_necessarios as any[];
        if (Array.isArray(aprovadores)) {
          return aprovadores.some((ap: any) => ap.id === userId && !ap.aprovado);
        }
        
        return false;
      });

      return pendentes.map(formatSolicitacao);
    },
    enabled: !!userId,
    staleTime: 1000 * 60,
  });
};

// Company requests (all requests from company members)
export const useCompanySolicitacoes = () => {
  return useQuery({
    queryKey: ['company-solicitacoes'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get user's company
      const { data: profile } = await supabase
        .from('client_profiles')
        .select('company')
        .eq('id', user.id)
        .single();

      if (!profile?.company) return [];

      // Get all company member IDs
      const { data: members } = await supabase
        .from('client_profiles')
        .select('id')
        .eq('company', profile.company);

      if (!members?.length) return [];

      const memberIds = members.map(m => m.id);

      // Get all requests from company members
      const { data, error } = await supabase
        .from('solicitacoes')
        .select('*')
        .in('solicitante_id', memberIds)
        .order('data_criacao', { ascending: false });

      if (error) throw error;
      return (data || []).map(formatSolicitacao);
    },
    staleTime: 1000 * 60,
  });
};

export const useAnexos = (solicitacaoId?: string) => {
  return useQuery({
    queryKey: ['anexos', solicitacaoId],
    queryFn: async () => {
      if (!solicitacaoId) return [];

      const { data, error } = await supabase
        .from('anexos')
        .select('*')
        .eq('solicitacao_id', solicitacaoId)
        .order('data_upload', { ascending: false });

      if (error) return [];
      return (data || []) as Anexo[];
    },
    enabled: !!solicitacaoId,
  });
};

export const useHistoricoAprovacao = (solicitacaoId?: string) => {
  return useQuery({
    queryKey: ['historico-aprovacao', solicitacaoId],
    queryFn: async () => {
      if (!solicitacaoId) return [];

      const { data, error } = await supabase
        .from('historico_aprovacao')
        .select('*')
        .eq('solicitacao_id', solicitacaoId)
        .order('data_acao', { ascending: false });

      if (error) return [];
      return (data || []) as HistoricoAprovacao[];
    },
    enabled: !!solicitacaoId,
  });
};

export const useCreateSolicitacao = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ solicitacao, files, aprovadores }: CreateSolicitacaoParams) => {
      // Get user name for history
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('client_profiles')
        .select('name')
        .eq('id', user?.id || '')
        .single();

      const solicitacaoData = {
        titulo: solicitacao.titulo,
        descricao: solicitacao.descricao || '',
        tipo_solicitacao: solicitacao.tipo_solicitacao || 'Geral',
        periodo_referencia: solicitacao.periodo_referencia,
        valor_solicitado: solicitacao.valor_solicitado || null,
        justificativa: solicitacao.justificativa || null,
        data_limite: solicitacao.data_limite || null,
        prioridade: solicitacao.prioridade || 'Media',
        status: aprovadores.length > 0 ? 'Pendente' : 'Em Elaboração',
        solicitante_id: solicitacao.solicitante_id,
        aprovador_atual_id: aprovadores.length > 0 
          ? aprovadores.sort((a, b) => a.nivel - b.nivel)[0]?.id 
          : null,
        etapa_atual: 1,
        aprovadores_necessarios: aprovadores.map(ap => ({
          id: ap.id,
          name: ap.name,
          email: ap.email,
          nivel: ap.nivel,
          aprovado: false
        })),
        aprovadores_completos: []
      };

      const { data: result, error } = await supabase
        .from('solicitacoes')
        .insert([solicitacaoData])
        .select('*')
        .single();

      if (error) throw error;

      // Upload files
      if (files.length > 0) {
        for (const file of files) {
          const fileName = `${result.id}/${Date.now()}_${file.name}`;
          
          await supabase.storage.from('documents').upload(fileName, file);
          
          await supabase.from('anexos').insert({
            solicitacao_id: result.id,
            nome_arquivo: file.name,
            tipo_arquivo: file.type,
            tamanho_arquivo: file.size,
            url_arquivo: fileName
          });
        }
      }

      // Create history entry
      await supabase.from('historico_aprovacao').insert({
        solicitacao_id: result.id,
        usuario_id: solicitacao.solicitante_id,
        nome_usuario: profile?.name || 'Usuário',
        acao: 'Criação',
        comentario: 'Solicitação criada'
      });

      return result;
    },
    onSuccess: () => {
      toast.success('Solicitação criada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['solicitacoes'] });
      queryClient.invalidateQueries({ queryKey: ['all-solicitacoes'] });
      queryClient.invalidateQueries({ queryKey: ['company-solicitacoes'] });
      queryClient.invalidateQueries({ queryKey: ['solicitacoes-pendentes'] });
    },
    onError: (error: any) => {
      toast.error('Erro ao criar solicitação: ' + (error.message || 'Erro desconhecido'));
    },
  });
};

export const useUpdateSolicitacao = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateSolicitacaoParams) => {
      const { data, error } = await supabase
        .from('solicitacoes')
        .update({
          ...updates,
          data_ultima_modificacao: new Date().toISOString()
        })
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitacoes'] });
      queryClient.invalidateQueries({ queryKey: ['all-solicitacoes'] });
      queryClient.invalidateQueries({ queryKey: ['solicitacoes-pendentes'] });
      queryClient.invalidateQueries({ queryKey: ['company-solicitacoes'] });
    },
    onError: (error: any) => {
      toast.error('Erro ao atualizar solicitação: ' + (error.message || 'Erro desconhecido'));
    },
  });
};

export const useCreateHistorico = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateHistoricoParams) => {
      const { data, error } = await supabase
        .from('historico_aprovacao')
        .insert([{
          ...params,
          data_acao: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['historico-aprovacao', variables.solicitacao_id] });
    },
    onError: (error: any) => {
      toast.error('Erro ao criar histórico: ' + (error.message || 'Erro desconhecido'));
    },
  });
};
