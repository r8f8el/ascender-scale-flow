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
            *,
            client_profiles!solicitacoes_solicitante_id_fkey (
              name,
              email
            )
          `)
          .eq('solicitante_id', userId)
          .order('data_criacao', { ascending: false });

        if (error) {
          console.error('Error fetching solicitacoes:', error);
          throw error;
        }

        console.log('Solicitacoes fetched successfully:', data?.length || 0);
        return (data || []) as any[];
      } catch (error) {
        console.error('Error in solicitacoes query:', error);
        return [];
      }
    },
    enabled: !!userId,
    retry: 2,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};

export const useAllSolicitacoes = () => {
  return useQuery({
    queryKey: ['all-solicitacoes'],
    queryFn: async () => {
      console.log('Fetching all solicitacoes for admin');
      
      try {
        const { data, error } = await supabase
          .from('solicitacoes')
          .select(`
            *,
            client_profiles!solicitacoes_solicitante_id_fkey (
              name,
              email
            )
          `)
          .order('data_criacao', { ascending: false });

        if (error) {
          console.error('Error fetching all solicitacoes:', error);
          throw error;
        }

        console.log('All solicitacoes fetched successfully:', data?.length || 0);
        return (data || []) as any[];
      } catch (error) {
        console.error('Error in all solicitacoes query:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 2,
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
          .select(`
            *,
            client_profiles!solicitacoes_solicitante_id_fkey (
              name,
              email
            )
          `)
          .eq('aprovador_atual_id', userId)
          .eq('status', 'Pendente')
          .order('data_criacao', { ascending: false });

        if (error) {
          console.error('Error fetching pending solicitacoes:', error);
          throw error;
        }

        return (data || []) as any[];
      } catch (error) {
        console.error('Error in pending solicitacoes query:', error);
        return [];
      }
    },
    enabled: !!userId,
    retry: 2,
    staleTime: 1000 * 60 * 2,
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
        console.log('Creating solicitacao with data:', solicitacao);
        
        // Garantir que os valores obrigatórios estão presentes e seguem a estrutura da tabela
        const solicitacaoData = {
          titulo: solicitacao.titulo,
          descricao: solicitacao.descricao || '',
          tipo_solicitacao: solicitacao.tipo_solicitacao || 'Geral',
          periodo_referencia: solicitacao.periodo_referencia,
          valor_solicitado: solicitacao.valor_solicitado || null,
          justificativa: solicitacao.justificativa || null,
          data_limite: solicitacao.data_limite || null,
          prioridade: solicitacao.prioridade || 'Media',
          status: solicitacao.status || 'Em Elaboração',
          solicitante_id: solicitacao.solicitante_id,
          aprovador_atual_id: solicitacao.aprovador_atual_id || null,
          etapa_atual: solicitacao.etapa_atual || 1,
          aprovadores_necessarios: aprovadores.map(ap => ({
            id: ap.id,
            name: ap.name,
            email: ap.email,
            nivel: ap.nivel,
            aprovado: false
          })),
          aprovadores_completos: []
        };

        // Criar solicitação
        const { data: solicitacaoResult, error: solicitacaoError } = await supabase
          .from('solicitacoes')
          .insert([solicitacaoData])
          .select(`
            *,
            client_profiles!solicitacoes_solicitante_id_fkey (
              name,
              email
            )
          `)
          .single();

        if (solicitacaoError) {
          console.error('Error creating solicitacao:', solicitacaoError);
          throw solicitacaoError;
        }

        console.log('Solicitacao created successfully:', solicitacaoResult.id);

        // Upload de arquivos se houver
        if (files.length > 0) {
          for (const file of files) {
            const fileName = `${solicitacaoResult.id}/${Date.now()}_${file.name}`;
            
            const { error: uploadError } = await supabase.storage
              .from('solicitacao-files')
              .upload(fileName, file);

            if (uploadError) {
              console.error('Error uploading file:', uploadError);
              // Continuar mesmo com erro de upload
            }

            // Registrar arquivo na tabela anexos se ela existir
            try {
              const { error: anexoError } = await supabase
                .from('anexos')
                .insert({
                  solicitacao_id: solicitacaoResult.id,
                  nome_arquivo: file.name,
                  tipo_arquivo: file.type,
                  tamanho_arquivo: file.size,
                  url_arquivo: fileName
                });

              if (anexoError) {
                console.error('Error creating anexo record:', anexoError);
              }
            } catch (error) {
              console.error('Anexos table might not exist:', error);
            }
          }
        }

        // Criar histórico de criação se a tabela existir
        try {
          const { error: historicoError } = await supabase
            .from('historico_aprovacao')
            .insert({
              solicitacao_id: solicitacaoResult.id,
              usuario_id: solicitacao.solicitante_id,
              nome_usuario: 'Usuário',
              acao: 'Criação',
              comentario: 'Solicitação criada'
            });

          if (historicoError) {
            console.error('Error creating historico:', historicoError);
          }
        } catch (error) {
          console.error('Historico table might not exist:', error);
        }

        return solicitacaoResult;
      } catch (error) {
        console.error('Error in createSolicitacao mutation:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success('Solicitação criada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['solicitacoes'] });
      queryClient.invalidateQueries({ queryKey: ['all-solicitacoes'] });
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
          .select(`
            *,
            client_profiles!solicitacoes_solicitante_id_fkey (
              name,
              email
            )
          `)
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
      queryClient.invalidateQueries({ queryKey: ['all-solicitacoes'] });
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
