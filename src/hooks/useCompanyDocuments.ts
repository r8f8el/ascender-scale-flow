
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CompanyDocument {
  id: string;
  name: string;
  file_path: string;
  file_size: number;
  category?: string;
  tags?: string[];
  uploaded_at: string;
  updated_at: string;
  user_id: string;
  uploader?: {
    name: string;
    email: string;
  };
}

export const useCompanyDocuments = () => {
  const queryClient = useQueryClient();

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['company-documents'],
    queryFn: async () => {
      console.log('🔍 Buscando documentos da empresa...');
      
      const { data, error } = await supabase
        .from('client_documents')
        .select(`
          *,
          uploader:client_profiles(name, email)
        `)
        .order('uploaded_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar documentos:', error);
        throw error;
      }

      console.log('✅ Documentos encontrados:', data?.length || 0);
      
      return data?.map(doc => ({
        ...doc,
        uploader: doc.uploader?.[0] || { name: 'Usuário', email: '' }
      })) || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

  const uploadDocument = useMutation({
    mutationFn: async ({ file, category, tags }: {
      file: File;
      category?: string;
      tags?: string[];
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Upload do arquivo
      const fileName = `${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Registrar no banco de dados
      const { data, error } = await supabase
        .from('client_documents')
        .insert({
          name: file.name,
          file_path: uploadData.path,
          file_size: file.size,
          category: category || 'Geral',
          tags: tags || [],
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-documents'] });
      toast.success('Documento enviado com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao enviar documento', {
        description: error.message
      });
    }
  });

  const deleteDocument = useMutation({
    mutationFn: async (documentId: string) => {
      // Buscar documento para obter o file_path
      const { data: doc, error: fetchError } = await supabase
        .from('client_documents')
        .select('file_path')
        .eq('id', documentId)
        .single();

      if (fetchError) throw fetchError;

      // Deletar arquivo do storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([doc.file_path]);

      if (storageError) console.warn('Aviso: erro ao deletar arquivo do storage:', storageError);

      // Deletar registro do banco
      const { error } = await supabase
        .from('client_documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-documents'] });
      toast.success('Documento excluído com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao excluir documento', {
        description: error.message
      });
    }
  });

  return {
    documents,
    isLoading,
    uploadDocument,
    deleteDocument
  };
};
