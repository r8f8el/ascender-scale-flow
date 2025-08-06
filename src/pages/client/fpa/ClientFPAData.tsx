
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useFPAClients } from '@/hooks/useFPAClients';
import { useFPADataUploads, useCreateFPADataUpload } from '@/hooks/useFPADataUploads';
import { useFPAFinancialData } from '@/hooks/useFPAFinancialData';
import { toast } from 'sonner';

const ClientFPAData = () => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  console.log('🎯 ClientFPAData component mounted');
  console.log('👤 Current user:', user?.id, user?.email);
  
  // Get the current user's FPA client data
  const { data: clients = [], isLoading: clientsLoading, error: clientsError } = useFPAClients();
  
  console.log('🏢 FPA Clients data:', {
    clients,
    isLoading: clientsLoading,
    error: clientsError,
    clientsCount: clients.length
  });

  const currentClient = clients.find(client => {
    console.log('🔍 Comparing client profile:', client.client_profile?.id, 'with user:', user?.id);
    return client.client_profile?.id === user?.id;
  });

  console.log('✅ Current client found:', currentClient);
  
  const { data: uploads = [], isLoading: uploadsLoading, error: uploadsError } = useFPADataUploads(currentClient?.id);
  const { data: financialData = [], isLoading: financialLoading, error: financialError } = useFPAFinancialData(currentClient?.id);
  const createUpload = useCreateFPADataUpload();

  console.log('📤 Uploads state:', {
    uploads,
    isLoading: uploadsLoading,
    error: uploadsError,
    uploadsCount: uploads.length
  });

  console.log('💰 Financial data state:', {
    financialData,
    isLoading: financialLoading,
    error: financialError,
    dataCount: financialData.length
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('📁 File selected:', {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: new Date(file.lastModified)
      });
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !currentClient) {
      toast.error('Por favor, selecione um arquivo primeiro');
      return;
    }

    console.log('🚀 Starting upload process:', {
      clientId: currentClient.id,
      fileName: selectedFile.name,
      fileSize: selectedFile.size
    });
    
    setIsUploading(true);
    
    try {
      const uploadData = {
        fpa_client_id: currentClient.id,
        file_name: selectedFile.name,
        file_path: `uploads/${currentClient.id}/${selectedFile.name}`,
        file_type: selectedFile.type || 'application/octet-stream',
        status: 'uploaded'
      };
      
      console.log('📊 Upload data prepared:', uploadData);
      
      const result = await createUpload.mutateAsync(uploadData);
      
      console.log('✅ Upload successful:', result);
      toast.success('Arquivo enviado com sucesso!');
      setSelectedFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      console.error('❌ Upload failed:', error);
      toast.error('Erro ao enviar arquivo. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  // Show loading state
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

  // Show error state for client loading
  if (clientsError) {
    console.error('❌ Clients error details:', clientsError);
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Erro ao Carregar Dados</h3>
          <p className="text-gray-600 mb-4">
            Não foi possível carregar as informações do cliente FP&A.
          </p>
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <p className="text-sm text-red-700">
              <strong>Detalhes do erro:</strong> {clientsError.message}
            </p>
          </div>
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
            className="mx-auto"
          >
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  // Show setup required state
  if (!currentClient) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Configuração FP&A Necessária</h3>
          <p className="text-gray-600 mb-4">
            Você precisa completar o onboarding FP&A antes de enviar dados.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
            <p className="text-sm text-yellow-700">
              Entre em contato com o administrador para configurar sua conta FP&A.
            </p>
          </div>
          <Button 
            onClick={() => window.location.href = '/cliente/contato'}
            className="mx-auto"
          >
            Entrar em Contato
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900">Envio de Dados FP&A</h1>
        <p className="text-gray-600">
          Envie suas planilhas financeiras para análise - Cliente: <strong>{currentClient.company_name}</strong>
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
            disabled={!selectedFile || isUploading || createUpload.isPending}
            className="w-full"
            size="lg"
          >
            {(isUploading || createUpload.isPending) ? (
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

      {/* Histórico de Uploads */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Uploads</CardTitle>
        </CardHeader>
        <CardContent>
          {uploadsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mr-3" />
              <p className="text-gray-600">Carregando histórico de uploads...</p>
            </div>
          ) : uploadsError ? (
            <div className="text-center py-8">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
              <p className="text-red-600 font-medium">Erro ao carregar histórico</p>
              <p className="text-sm text-red-500 mt-1">{uploadsError.message}</p>
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
                <div key={upload.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="h-6 w-6 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900">{upload.file_name}</p>
                      <p className="text-sm text-gray-500">
                        Enviado em {upload.created_at && new Date(upload.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
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
                        <span className="text-sm font-medium text-yellow-700 capitalize">
                          {upload.status === 'uploaded' ? 'Processando' : upload.status}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Debug Information (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">Debug Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs space-y-1 text-gray-500">
              <p>User ID: {user?.id}</p>
              <p>Client ID: {currentClient?.id}</p>
              <p>Company: {currentClient?.company_name}</p>
              <p>Uploads: {uploads.length}</p>
              <p>Financial Data: {financialData.length}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClientFPAData;
