
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useFPAClients } from '@/hooks/useFPAClients';
import { useFPADataUploads, useCreateFPADataUpload } from '@/hooks/useFPADataUploads';
import { toast } from 'sonner';

const ClientFPAData = () => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  console.log('Current user:', user?.id);
  
  // Get the current user's FPA client data
  const { data: clients = [], isLoading: clientsLoading, error: clientsError } = useFPAClients();
  
  console.log('FPA Clients:', clients);
  console.log('Clients loading:', clientsLoading);
  console.log('Clients error:', clientsError);

  const currentClient = clients.find(client => {
    console.log('Comparing client profile:', client.client_profile?.id, 'with user:', user?.id);
    return client.client_profile?.id === user?.id;
  });

  console.log('Current client found:', currentClient);
  
  const { data: uploads = [], isLoading: uploadsLoading, error: uploadsError } = useFPADataUploads(currentClient?.id);
  const createUpload = useCreateFPADataUpload();

  console.log('Uploads:', uploads);
  console.log('Uploads loading:', uploadsLoading);
  console.log('Uploads error:', uploadsError);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name, file.type, file.size);
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !currentClient) {
      toast.error('Por favor, selecione um arquivo primeiro');
      return;
    }

    console.log('Starting upload for client:', currentClient.id);
    setIsUploading(true);
    
    try {
      await createUpload.mutateAsync({
        fpa_client_id: currentClient.id,
        file_name: selectedFile.name,
        file_path: `uploads/${currentClient.id}/${selectedFile.name}`,
        file_type: selectedFile.type || 'application/octet-stream',
        status: 'uploaded'
      });
      
      toast.success('Arquivo enviado com sucesso!');
      setSelectedFile(null);
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Erro no upload:', error);
      toast.error('Erro ao enviar arquivo');
    } finally {
      setIsUploading(false);
    }
  };

  if (clientsLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600">Carregando dados do cliente...</p>
        </div>
      </div>
    );
  }

  if (clientsError) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Erro ao Carregar Dados</h3>
        <p className="text-gray-600 mb-4">
          Não foi possível carregar as informações do cliente FP&A.
        </p>
        <p className="text-sm text-gray-500">
          Erro: {clientsError.message}
        </p>
      </div>
    );
  }

  if (!currentClient) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Configuração FP&A Necessária</h3>
        <p className="text-gray-600 mb-4">
          Você precisa completar o onboarding FP&A antes de enviar dados.
        </p>
        <p className="text-sm text-gray-500">
          Entre em contato com o administrador para configurar sua conta FP&A.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Envio de Dados FP&A</h1>
        <p className="text-gray-600 mt-1">
          Envie suas planilhas financeiras para análise
        </p>
      </div>

      {/* Upload de Arquivos */}
      <Card>
        <CardHeader>
          <CardTitle>Enviar Dados Financeiros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="file-upload">Selecionar Arquivo</Label>
            <Input
              id="file-upload"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              className="mt-1"
            />
            <p className="text-sm text-gray-500 mt-1">
              Formatos aceitos: Excel (.xlsx, .xls) e CSV
            </p>
          </div>

          {selectedFile && (
            <div className="p-3 bg-blue-50 rounded-md">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">{selectedFile.name}</span>
                <span className="text-sm text-gray-500">
                  ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
            </div>
          )}

          <Button 
            onClick={handleUpload}
            disabled={!selectedFile || isUploading || createUpload.isPending}
            className="w-full"
          >
            {(isUploading || createUpload.isPending) ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Enviar Arquivo
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Lista de Uploads */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Uploads</CardTitle>
        </CardHeader>
        <CardContent>
          {uploadsLoading ? (
            <div className="text-center py-4">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-600">Carregando histórico...</p>
            </div>
          ) : uploadsError ? (
            <div className="text-center py-4">
              <AlertCircle className="h-6 w-6 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-red-600">Erro ao carregar histórico: {uploadsError.message}</p>
            </div>
          ) : uploads.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nenhum arquivo enviado ainda
            </p>
          ) : (
            <div className="space-y-3">
              {uploads.map((upload) => (
                <div key={upload.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{upload.file_name}</p>
                      <p className="text-sm text-gray-500">
                        {upload.created_at && new Date(upload.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {upload.status === 'validated' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                    )}
                    <span className="text-sm capitalize">{upload.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientFPAData;
