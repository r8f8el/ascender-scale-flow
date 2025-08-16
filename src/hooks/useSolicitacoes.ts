
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Solicitacao, Anexo, HistoricoAprovacao } from '@/types/aprovacoes';
import { useSecureFileUpload } from '@/hooks/useSecureFileUpload';

export const useSolicitacoes = (userId?: string) => {
  return useQuery({
    queryKey: ['solicitacoes', userId],
    queryFn: async () => {
      console.log('Fetching solicitacoes for user:', userId);
      
      let query = supabase
        .from('solicitacoes')
        .select(`
          *,
          client_profiles!fk_solicitacoes_solicitante(name, email)
        `)
        .order('data_criacao', { ascending: false });

      if (userId) {
        query = query.eq('solicitante_id', userId);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching solicitacoes:', error);
        throw error;
      }
      
      console.log('Solicitacoes fetched:', data);
      return data as (Solicitacao & { client_profiles: { name: string; email: string } })[];
    }
  });
};

export const useSolicitacaoPendentes = (aprovadorId: string) => {
  return useQuery({
    queryKey: ['solicitacoes-pendentes', aprovadorId],
    queryFn: async () => {
      console.log('Fetching pending solicitacoes for approver:', aprovadorId);
      
      const { data, error } = await supabase
        .from('solicitacoes')
        .select(`
          *,
          client_profiles!fk_solicitacoes_solicitante(name, email)
        `)
        .eq('aprovador_atual_id', aprovadorId)
        .eq('status', 'Pendente')
        .order('data_criacao', { ascending: false });

      if (error) {
        console.error('Error fetching pending solicitacoes:', error);
        throw error;
      }
      
      console.log('Pending solicitacoes fetched:', data);
      return data as (Solicitacao & { client_profiles: { name: string; email: string } })[];
    }
  });
};

export const useCreateSolicitacao = () => {
  const queryClient = useQueryClient();
  const { uploadFile } = useSecureFileUpload();

  return useMutation({
    mutationFn: async (data: {
      solicitacao: Omit<Solicitacao, 'id' | 'data_criacao' | 'data_ultima_modificacao'>;
      files: File[];
      aprovadores: Array<{ id: string; name: string; email: string; nivel: number }>;
    }) => {
      console.log('Creating solicitacao with data:', data);
      
      // Input validation
      if (!data.solicitacao.titulo?.trim()) {
        throw new Error('Título é obrigatório');
      }
      
      if (!data.solicitacao.periodo_referencia?.trim()) {
        throw new Error('Período de referência é obrigatório');
      }

      if (data.aprovadores.length === 0) {
        throw new Error('Pelo menos um aprovador deve ser selecionado');
      }

      // 1. Criar a solicitação
      const solicitacaoData = {
        ...data.solicitacao,
        aprovadores_necessarios: data.aprovadores.map(a => ({
          id: a.id,
          name: a.name,
          email: a.email,
          nivel: a.nivel,
          aprovado: false,
          data_aprovacao: null
        })),
        aprovadores_completos: [],
        // Definir o primeiro aprovador (maior hierarquia)
        aprovador_atual_id: data.aprovadores.length > 0 
          ? data.aprovadores.sort((a, b) => b.nivel - a.nivel)[0].id 
          : null,
        status: data.aprovadores.length > 0 ? 'Pendente' : 'Em Elaboração'
      };

      const { data: solicitacao, error: solicitacaoError } = await supabase
        .from('solicitacoes')
        .insert([solicitacaoData])
        .select()
        .single();

      if (solicitacaoError) {
        console.error('Error creating solicitacao:', solicitacaoError);
        throw solicitacaoError;
      }

      console.log('Solicitacao created:', solicitacao);

      // 2. Upload dos arquivos se houver (usando método seguro)
      if (data.files.length > 0) {
        console.log('Uploading files:', data.files.length);
        
        for (const file of data.files) {
          try {
            // Upload do arquivo usando método seguro
            const uploadResult = await uploadFile(file, {
              bucket: 'documents',
              folder: `solicitacoes/${solicitacao.id}`,
              allowedTypes: [
                'application/pdf',
                'application/msword', 
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'image/jpeg',
                'image/png',
                'text/plain',
                'text/csv'
              ],
              maxSizeBytes: 50 * 1024 * 1024 // 50MB
            });

            // Salvar registro do anexo
            const { error: anexoError } = await supabase
              .from('anexos')
              .insert([{
                solicitacao_id: solicitacao.id,
                nome_arquivo: file.name,
                url_arquivo: uploadResult.url,
                tamanho_arquivo: file.size,
                tipo_arquivo: file.type
              }]);

            if (anexoError) {
              console.error('Error saving anexo:', anexoError);
              throw anexoError;
            }
          } catch (uploadError) {
            console.error('Error uploading file:', uploadError);
            throw new Error(`Erro ao fazer upload do arquivo ${file.name}: ${uploadError.message}`);
          }
        }
      }

      // 3. Criar entrada no histórico
      const { error: historicoError } = await supabase
        .from('historico_aprovacao')
        .insert([{
          solicitacao_id: solicitacao.id,
          usuario_id: data.solicitacao.solicitante_id,
          nome_usuario: 'Usuário', // TODO: buscar nome do usuário
          acao: 'Criação',
          comentario: 'Solicitação criada'
        }]);

      if (historicoError) {
        console.error('Error creating historico:', historicoError);
        // Não falhar por erro no histórico
      }

      return solicitacao;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitacoes'] });
      toast.success('Solicitação criada com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao criar solicitação:', error);
      toast.error(`Erro ao criar solicitação: ${error.message || 'Erro desconhecido'}`);
    }
  });
};

export const useUpdateSolicitacao = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Solicitacao> & { id: string }) => {
      console.log('Updating solicitacao:', id, data);
      
      const updateData = {
        ...data,
        data_ultima_modificacao: new Date().toISOString()
      };

      const { data: solicitacao, error } = await supabase
        .from('solicitacoes')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating solicitacao:', error);
        throw error;
      }
      
      console.log('Solicitacao updated:', solicitacao);
      return solicitacao;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitacoes'] });
      toast.success('Solicitação atualizada com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar solicitação:', error);
      toast.error(`Erro ao atualizar solicitação: ${error.message || 'Erro desconhecido'}`);
    }
  });
};

export const useAnexos = (solicitacaoId: string) => {
  return useQuery({
    queryKey: ['anexos', solicitacaoId],
    queryFn: async () => {
      console.log('Fetching anexos for solicitacao:', solicitacaoId);
      
      const { data, error } = await supabase
        .from('anexos')
        .select('*')
        .eq('solicitacao_id', solicitacaoId)
        .order('data_upload', { ascending: false });

      if (error) {
        console.error('Error fetching anexos:', error);
        throw error;
      }
      
      console.log('Anexos fetched:', data);
      return data as Anexo[];
    },
    enabled: !!solicitacaoId
  });
};

export const useHistoricoAprovacao = (solicitacaoId: string) => {
  return useQuery({
    queryKey: ['historico-aprovacao', solicitacaoId],
    queryFn: async () => {
      console.log('Fetching approval history for solicitacao:', solicitacaoId);
      
      const { data, error } = await supabase
        .from('historico_aprovacao')
        .select('*')
        .eq('solicitacao_id', solicitacaoId)
        .order('data_acao', { ascending: true });

      if (error) {
        console.error('Error fetching approval history:', error);
        throw error;
      }
      
      console.log('Approval history fetched:', data);
      return data as HistoricoAprovacao[];
    },
    enabled: !!solicitacaoId
  });
};

export const useCreateHistorico = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<HistoricoAprovacao, 'id' | 'data_acao'>) => {
      console.log('Creating approval history entry:', data);
      
      const { data: historico, error } = await supabase
        .from('historico_aprovacao')
        .insert([data])
        .select()
        .single();

      if (error) {
        console.error('Error creating approval history:', error);
        throw error;
      }
      
      console.log('Approval history created:', historico);
      return historico;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['historico-aprovacao', variables.solicitacao_id] });
    }
  });
};
