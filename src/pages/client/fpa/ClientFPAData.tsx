
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

  console.log('🎯 ClientFPAData - User:', user?.id, user?.email);
  
  const { data: clients = [], isLoading: clientsLoading, error: clientsError } = useFPAClients();
  
  const currentClient = clients.find(client => 
    client.client_profile?.id === user?.id
  );

  console.log('🏢 Current FPA client found:', !!currentClient, currentClient?.company_name);
  
  const { data: uploads = [], isLoading: uploadsLoading } = useFPADataUploads(currentClient?.id);
  const createUpload = useCreateFPADataUpload();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      console.log('📁 File selected:', file.name);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !currentClient) {
      toast.error('Por favor, selecione um arquivo primeiro');
      return;
    }
    
    setIsUploading(true);
    
    try {
      const uploadData = {
        fpa_client_id: currentClient.id,
        file_name: selectedFile.name,
        file_path: `uploads/${currentClient.id}/${selectedFile.name}`,
        file_type: selectedFile.type || 'application/octet-stream',
        status: 'uploaded'
      };
      
      await createUpload.mutateAsync(uploadData);
      toast.success('Arquivo enviado com sucesso!');
      setSelectedFile(null);
      
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      console.error('❌ Upload failed:', error);
      toast.error('Erro ao enviar arquivo. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  if (clientsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Carregando dados do cliente...</h3>
            <p className="text-sm text-gray-600">
              Aguarde enquanto buscamos suas informações FP&A
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (clientsError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Erro ao Carregar</h3>
          <p className="text-gray-600 mb-4">
            Não foi possível carregar os dados FP&A.
          </p>
          <Button onClick={() => window.location.reload()}>
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  if (!currentClient) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Configuração FP&A Necessária</h3>
          <p className="text-gray-600 mb-4">
            Entre em contato com o administrador para configurar sua conta FP&A.
          </p>
          <Button onClick={() => window.location.href = '/cliente/contato'}>
            Entrar em Contato
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Envio de Dados FP&A</h1>
        <p className="text-gray-600 mt-1">
          Envie suas planilhas financeiras para análise - {currentClient.company_name}
        </p>
      </div>

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
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">{selectedFile.name}</p>
                  <p className="text-sm text-blue-700">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            </div>
          )}

          <Button 
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="w-full"
            size="lg"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Enviando arquivo...
              </>
            ) : (
              <>
                <Upload className="h-5 w-5 mr-2" />
                Enviar Arquivo
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Uploads</CardTitle>
        </CardHeader>
        <CardContent>
          {uploadsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mr-3" />
              <p className="text-gray-600">Carregando histórico...</p>
            </div>
          ) : uploads.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Nenhum arquivo enviado ainda</p>
              <p className="text-sm text-gray-400 mt-1">
                Seus uploads aparecerão aqui após o envio
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {uploads.map((upload) => (
                <div key={upload.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-6 w-6 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900">{upload.file_name}</p>
                      <p className="text-sm text-gray-500">
                        {upload.created_at && new Date(upload.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {upload.status === 'validated' ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-sm font-medium text-green-700">Validado</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                        <span className="text-sm font-medium text-yellow-700">Processando</span>
                      </>
                    )}
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
