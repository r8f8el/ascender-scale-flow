import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useFPAClients } from '@/hooks/useFPAClients';
import { useFPADataUploads, useCreateFPADataUpload } from '@/hooks/useFPADataUploads';
import { toast } from 'sonner';

const ClientFPAData = () => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Get the current user's FPA client data
  const { data: clients = [], isLoading: clientsLoading } = useFPAClients();
  const currentClient = clients.find(client => {
    if (!client.client_profile) return false;
    if (typeof client.client_profile !== 'object') return false;
    if (!('id' in client.client_profile)) return false;
    return (client.client_profile as { id: string }).id === user?.id;
  });
  
  const { data: uploads = [], isLoading: uploadsLoading } = useFPADataUploads(currentClient?.id);
  const createUpload = useCreateFPADataUpload();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !currentClient) {
      toast.error('Por favor, selecione um arquivo primeiro');
      return;
    }

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!currentClient) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Configuração FP&A Necessária</h3>
        <p className="text-gray-600">
          Você precisa completar o onboarding FP&A antes de enviar dados.
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
            <Upload className="h-4 w-4 mr-2" />
            {isUploading || createUpload.isPending ? 'Enviando...' : 'Enviar Arquivo'}
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
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
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
                        {new Date(upload.created_at || '').toLocaleDateString('pt-BR')}
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
