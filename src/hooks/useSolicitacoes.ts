
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

export const useSolicitacoes = (userId?: string) => {
  return useQuery({
    queryKey: ['solicitacoes', userId],
    queryFn: async () => {
      if (!userId) {
        console.log('No userId provided for solicitacoes query');
        return [];
      }

      console.log('Fetching solicitacoes for user:', userId);
      
      try {
        const { data, error } = await supabase
          .from('solicitacoes')
          .select(`
            *
          `)
          .eq('solicitante_id', userId)
          .order('data_criacao', { ascending: false });

        if (error) {
          console.error('Error fetching solicitacoes:', error);
          // Se for erro de política, retornar array vazio em vez de falhar
          if (error.code === '42P17') {
            console.warn('Database policy issue detected, returning empty array');
            return [];
          }
          throw error;
        }

        console.log('Solicitacoes fetched successfully:', data?.length || 0);
        return (data || []) as Solicitacao[];
      } catch (error) {
        console.error('Error in solicitacoes query:', error);
        // Retornar array vazio em caso de erro para evitar quebrar a UI
        return [];
      }
    },
    enabled: !!userId,
    retry: (failureCount, error: any) => {
      // Não tentar novamente se for erro de política do Supabase
      if (error?.code === '42P17') {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
  });
};

export const useSolicitacaoPendentes = (userId?: string) => {
  return useQuery({
    queryKey: ['solicitacoes-pendentes', userId],
    queryFn: async () => {
      if (!userId) {
        return [];
      }

      try {
        const { data, error } = await supabase
          .from('solicitacoes')
          .select('*')
          .eq('aprovador_atual_id', userId)
          .eq('status', 'Pendente')
          .order('data_criacao', { ascending: false });

        if (error) {
          console.error('Error fetching pending solicitacoes:', error);
          if (error.code === '42P17') {
            return [];
          }
          throw error;
        }

        return (data || []) as Solicitacao[];
      } catch (error) {
        console.error('Error in pending solicitacoes query:', error);
        return [];
      }
    },
    enabled: !!userId,
    retry: (failureCount, error: any) => {
      if (error?.code === '42P17') {
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
};

export const useAnexos = (solicitacaoId?: string) => {
  return useQuery({
    queryKey: ['anexos', solicitacaoId],
    queryFn: async () => {
      if (!solicitacaoId) {
        return [];
      }

      try {
        const { data, error } = await supabase
          .from('anexos')
          .select('*')
          .eq('solicitacao_id', solicitacaoId)
          .order('data_upload', { ascending: false });

        if (error) {
          console.error('Error fetching anexos:', error);
          return [];
        }

        return (data || []) as Anexo[];
      } catch (error) {
        console.error('Error in anexos query:', error);
        return [];
      }
    },
    enabled: !!solicitacaoId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useHistoricoAprovacao = (solicitacaoId?: string) => {
  return useQuery({
    queryKey: ['historico-aprovacao', solicitacaoId],
    queryFn: async () => {
      if (!solicitacaoId) {
        return [];
      }

      try {
        const { data, error } = await supabase
          .from('historico_aprovacao')
          .select('*')
          .eq('solicitacao_id', solicitacaoId)
          .order('data_acao', { ascending: false });

        if (error) {
          console.error('Error fetching historico:', error);
          return [];
        }

        return (data || []) as HistoricoAprovacao[];
      } catch (error) {
        console.error('Error in historico query:', error);
        return [];
      }
    },
    enabled: !!solicitacaoId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateSolicitacao = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ solicitacao, files, aprovadores }: CreateSolicitacaoParams) => {
      try {
        // Criar solicitação
        const { data: solicitacaoData, error: solicitacaoError } = await supabase
          .from('solicitacoes')
          .insert([solicitacao])
          .select()
          .single();

        if (solicitacaoError) {
          console.error('Error creating solicitacao:', solicitacaoError);
          throw solicitacaoError;
        }

        console.log('Solicitacao created successfully:', solicitacaoData.id);

        // Upload de arquivos se houver
        if (files.length > 0) {
          for (const file of files) {
            const fileName = `${solicitacaoData.id}/${Date.now()}_${file.name}`;
            
            const { error: uploadError } = await supabase.storage
              .from('solicitacao-files')
              .upload(fileName, file);

            if (uploadError) {
              console.error('Error uploading file:', uploadError);
              // Continuar mesmo com erro de upload
            }

            // Registrar arquivo na tabela anexos
            const { error: anexoError } = await supabase
              .from('anexos')
              .insert({
                solicitacao_id: solicitacaoData.id,
                nome_arquivo: file.name,
                tipo_arquivo: file.type,
                tamanho_arquivo: file.size,
                url_arquivo: fileName
              });

            if (anexoError) {
              console.error('Error creating anexo record:', anexoError);
            }
          }
        }

        return solicitacaoData;
      } catch (error) {
        console.error('Error in createSolicitacao mutation:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success('Solicitação criada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['solicitacoes'] });
    },
    onError: (error: any) => {
      console.error('Mutation error:', error);
      toast.error('Erro ao criar solicitação: ' + (error.message || 'Erro desconhecido'));
    },
  });
};

export const useUpdateSolicitacao = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateSolicitacaoParams) => {
      try {
        const { data, error } = await supabase
          .from('solicitacoes')
          .update({
            ...updates,
            data_ultima_modificacao: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error('Error updating solicitacao:', error);
          throw error;
        }

        return data;
      } catch (error) {
        console.error('Error in updateSolicitacao mutation:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitacoes'] });
      queryClient.invalidateQueries({ queryKey: ['solicitacoes-pendentes'] });
    },
    onError: (error: any) => {
      console.error('Update mutation error:', error);
      toast.error('Erro ao atualizar solicitação: ' + (error.message || 'Erro desconhecido'));
    },
  });
};

export const useCreateHistorico = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateHistoricoParams) => {
      try {
        const { data, error } = await supabase
          .from('historico_aprovacao')
          .insert([{
            ...params,
            data_acao: new Date().toISOString()
          }])
          .select()
          .single();

        if (error) {
          console.error('Error creating historico:', error);
          throw error;
        }

        return data;
      } catch (error) {
        console.error('Error in createHistorico mutation:', error);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['historico-aprovacao', variables.solicitacao_id] });
    },
    onError: (error: any) => {
      console.error('Historico mutation error:', error);
      toast.error('Erro ao criar histórico: ' + (error.message || 'Erro desconhecido'));
    },
  });
};
