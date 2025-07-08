import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { File, Download, FileSearch, Upload, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

interface Document {
  id: string;
  filename: string;
  file_path: string;
  file_size: number | null;
  content_type: string | null;
  created_at: string;
  updated_at: string;
}

const ClientDocuments = () => {
  const { user, client } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (user) {
      loadDocuments();
    }
  }, []);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar documentos:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar documentos",
          variant: "destructive"
        });
        return;
      }

      setDocuments(data || []);
    } catch (error) {
      console.error('Erro inesperado:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    try {
      // Upload para o storage
      const filePath = `${user.id}/${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Criar registro na tabela documents
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          filename: file.name,
          file_path: filePath,
          file_size: file.size,
          content_type: file.type
        });

      if (dbError) {
        throw dbError;
      }

      toast({
        title: "Sucesso",
        description: "Documento enviado com sucesso"
      });

      // Recarregar documentos
      loadDocuments();
      
      // Reset do input
      event.target.value = '';
    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar documento",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(doc.file_path);

      if (error) {
        throw error;
      }

      // Criar URL para download
      const url = URL.createObjectURL(data);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = doc.filename;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro no download:', error);
      toast({
        title: "Erro",
        description: "Erro ao baixar documento",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (doc: Document) => {
    if (!confirm('Tem certeza que deseja excluir este documento?')) {
      return;
    }

    try {
      // Deletar do storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([doc.file_path]);

      if (storageError) {
        console.error('Erro ao deletar do storage:', storageError);
      }

      // Deletar do banco
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', doc.id);

      if (dbError) {
        throw dbError;
      }

      toast({
        title: "Sucesso",
        description: "Documento excluído com sucesso"
      });

      // Recarregar documentos
      loadDocuments();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir documento",
        variant: "destructive"
      });
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Carregando documentos...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Documentos - {client?.name || user?.email}
          </h1>
          <p className="text-gray-600 mt-1">
            Gerencie seus documentos e arquivos
          </p>
        </div>
        
        <div className="flex gap-4 items-center">
          <div className="relative">
            <FileSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
            <Input
              type="text"
              placeholder="Buscar documentos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          
          <div className="relative">
            <Input
              type="file"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
              id="file-upload"
            />
            <Button
              asChild
              disabled={isUploading}
              className="bg-[#f07c00] hover:bg-[#e56b00]"
            >
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload size={18} className="mr-2" />
                {isUploading ? 'Enviando...' : 'Upload'}
              </label>
            </Button>
          </div>
        </div>
      </div>
      
      {filteredDocuments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <File size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum documento encontrado
          </h3>
          <p className="text-gray-500 mb-4">
            {searchQuery ? 'Nenhum documento corresponde à sua busca.' : 'Você ainda não enviou nenhum documento.'}
          </p>
          {!searchQuery && (
            <div className="relative inline-block">
              <Input
                type="file"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
                id="file-upload-empty"
              />
              <Button
                asChild
                disabled={isUploading}
                className="bg-[#f07c00] hover:bg-[#e56b00]"
              >
                <label htmlFor="file-upload-empty" className="cursor-pointer">
                  <Upload size={18} className="mr-2" />
                  Enviar Primeiro Documento
                </label>
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border">
          <div className="divide-y">
            {filteredDocuments.map((doc) => (
              <div key={doc.id} className="flex justify-between items-center p-4 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <File size={20} className="text-blue-600" />
                  <div>
                    <p className="font-medium">{doc.filename}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Enviado em: {new Date(doc.created_at).toLocaleDateString('pt-BR')}</span>
                      {doc.file_size && (
                        <span>{(doc.file_size / (1024 * 1024)).toFixed(2)} MB</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={() => handleDownload(doc)}
                  >
                    <Download size={16} />
                    <span>Baixar</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex items-center gap-1 text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(doc)}
                  >
                    <Trash2 size={16} />
                    <span>Excluir</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDocuments;