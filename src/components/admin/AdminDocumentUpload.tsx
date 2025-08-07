
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Upload, X, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface ClientProfile {
  id: string;
  name: string;
  email: string;
  company: string | null;
}

interface UploadFile {
  file: File;
  category: string;
  description: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

interface AdminDocumentUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: () => void;
  selectedClientId?: string;
}

const categories = [
  'Contratos',
  'Relatórios', 
  'Manuais',
  'Projetos',
  'Backups',
  'Outros'
];

const AdminDocumentUpload: React.FC<AdminDocumentUploadProps> = ({
  isOpen,
  onClose,
  onUploadComplete,
  selectedClientId
}) => {
  const { toast } = useToast();
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string>(selectedClientId || '');

  const { data: clients = [] } = useQuery({
    queryKey: ['admin-clients-upload'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_profiles')
        .select('id, name, email, company')
        .order('name');
      
      if (error) throw error;
      return data as ClientProfile[];
    }
  });

  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newUploadFiles: UploadFile[] = files.map(file => ({
      file,
      category: 'Outros',
      description: '',
      progress: 0,
      status: 'pending'
    }));
    
    setUploadFiles(prev => [...prev, ...newUploadFiles]);
  };

  const updateUploadFile = (index: number, updates: Partial<UploadFile>) => {
    setUploadFiles(prev => prev.map((item, i) => 
      i === index ? { ...item, ...updates } : item
    ));
  };

  const removeUploadFile = (index: number) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validateFile = (file: File): boolean => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) return false;

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) return false;

    return true;
  };

  const uploadSingleFile = async (uploadFile: UploadFile, index: number): Promise<boolean> => {
    if (!selectedClient) {
      updateUploadFile(index, { 
        status: 'error', 
        error: 'Cliente não selecionado' 
      });
      return false;
    }

    if (!validateFile(uploadFile.file)) {
      updateUploadFile(index, { 
        status: 'error', 
        error: 'Tipo de arquivo não permitido ou muito grande (máx 50MB)' 
      });
      return false;
    }

    try {
      updateUploadFile(index, { status: 'uploading', progress: 10 });

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = uploadFile.file.name.split('.').pop();
      const uniqueFileName = `${timestamp}_${randomString}.${fileExtension}`;
      const filePath = `client-${selectedClient}/${uniqueFileName}`;

      updateUploadFile(index, { progress: 25 });

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, uploadFile.file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      updateUploadFile(index, { progress: 70 });

      // Get current admin info
      const { data: { user } } = await supabase.auth.getUser();
      const { data: adminProfile } = await supabase
        .from('admin_profiles')
        .select('id')
        .eq('id', user?.id)
        .single();

      // Save metadata to database
      const { error: dbError } = await supabase
        .from('client_documents')
        .insert({
          user_id: selectedClient,
          filename: uploadFile.file.name,
          file_path: filePath,
          content_type: uploadFile.file.type,
          file_size: uploadFile.file.size,
          category: uploadFile.category,
          description: uploadFile.description || null,
          uploaded_by_admin_id: adminProfile?.id || null
        });

      if (dbError) {
        console.error('Database insert error:', dbError);
        await supabase.storage.from('documents').remove([filePath]);
        throw dbError;
      }

      updateUploadFile(index, { status: 'completed', progress: 100 });
      return true;

    } catch (error) {
      console.error('Erro no upload:', error);
      updateUploadFile(index, { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      });
      return false;
    }
  };

  const handleUploadAll = async () => {
    if (!selectedClient) {
      toast({
        title: "Erro",
        description: "Selecione um cliente para fazer upload",
        variant: "destructive"
      });
      return;
    }

    if (uploadFiles.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos um arquivo para upload",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < uploadFiles.length; i++) {
      const uploadFile = uploadFiles[i];
      if (uploadFile.status === 'pending') {
        const success = await uploadSingleFile(uploadFile, i);
        if (success) {
          successCount++;
        } else {
          errorCount++;
        }
      }
    }

    setIsUploading(false);

    if (successCount > 0) {
      toast({
        title: "Sucesso!",
        description: `${successCount} arquivo(s) enviado(s) com sucesso!`
      });
      onUploadComplete();
    }

    if (errorCount > 0) {
      toast({
        title: "Atenção",
        description: `${errorCount} arquivo(s) falharam no upload`,
        variant: "destructive"
      });
    }

    if (successCount === uploadFiles.length) {
      handleClose();
    }
  };

  const handleClose = () => {
    setUploadFiles([]);
    setSelectedClient(selectedClientId || '');
    onClose();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Fazer Upload de Documentos (Admin)</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {!selectedClientId && (
            <div>
              <Label htmlFor="client-select">Selecionar Cliente</Label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um cliente..." />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} - {client.company || client.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="files-upload">Selecionar Arquivos</Label>
            <Input
              id="files-upload"
              type="file"
              multiple
              onChange={handleFilesSelect}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt"
              className="cursor-pointer"
            />
            <p className="text-sm text-gray-500 mt-1">
              Tipos aceitos: PDF, Word, Excel, Imagens, TXT (máx 50MB cada)
            </p>
          </div>

          {uploadFiles.length > 0 && (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              <h4 className="font-semibold">Arquivos Selecionados:</h4>
              {uploadFiles.map((uploadFile, index) => (
                <div key={index} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm font-medium">{uploadFile.file.name}</span>
                      <span className="text-xs text-gray-500">
                        ({formatFileSize(uploadFile.file.size)})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {uploadFile.status === 'completed' && (
                        <span className="text-xs text-green-600 font-medium">Concluído</span>
                      )}
                      {uploadFile.status === 'error' && (
                        <span className="text-xs text-red-600 font-medium">Erro</span>
                      )}
                      {uploadFile.status === 'uploading' && (
                        <span className="text-xs text-blue-600 font-medium">Enviando...</span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeUploadFile(index)}
                        disabled={uploadFile.status === 'uploading'}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {uploadFile.status === 'uploading' && (
                    <Progress value={uploadFile.progress} className="w-full" />
                  )}

                  {uploadFile.status === 'error' && uploadFile.error && (
                    <p className="text-sm text-red-600">{uploadFile.error}</p>
                  )}

                  {uploadFile.status === 'pending' && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Categoria</Label>
                        <Select 
                          value={uploadFile.category}
                          onValueChange={(value) => updateUploadFile(index, { category: value })}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(category => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Descrição</Label>
                        <Input
                          placeholder="Opcional..."
                          value={uploadFile.description}
                          onChange={(e) => updateUploadFile(index, { description: e.target.value })}
                          className="h-8"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleUploadAll} 
              disabled={!selectedClient || uploadFiles.length === 0 || isUploading}
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? 'Enviando...' : `Enviar ${uploadFiles.length} arquivo(s)`}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleClose}
              disabled={isUploading}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminDocumentUpload;
