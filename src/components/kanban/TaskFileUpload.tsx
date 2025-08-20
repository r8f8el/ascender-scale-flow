
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, File, X, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TaskFileUploadProps {
  taskId: string;
  attachments: any[];
  onAttachmentsUpdate: (attachments: any[]) => void;
}

export const TaskFileUpload: React.FC<TaskFileUploadProps> = ({
  taskId,
  attachments = [],
  onAttachmentsUpdate
}) => {
  const [uploading, setUploading] = useState(false);

  const onDrop = async (acceptedFiles: File[]) => {
    setUploading(true);
    
    try {
      const uploadPromises = acceptedFiles.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${taskId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('task-attachments')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('task-attachments')
          .getPublicUrl(fileName);

        return {
          id: Math.random().toString(36).substring(2),
          name: file.name,
          size: file.size,
          type: file.type,
          url: publicUrl,
          path: fileName,
          uploaded_at: new Date().toISOString()
        };
      });

      const newAttachments = await Promise.all(uploadPromises);
      const updatedAttachments = [...attachments, ...newAttachments];
      
      onAttachmentsUpdate(updatedAttachments);
      toast.success(`${newAttachments.length} arquivo(s) enviado(s)`);
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Erro ao enviar arquivos');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true
  });

  const removeAttachment = async (attachment: any) => {
    try {
      if (attachment.path) {
        await supabase.storage
          .from('task-attachments')
          .remove([attachment.path]);
      }
      
      const updatedAttachments = attachments.filter(a => a.id !== attachment.id);
      onAttachmentsUpdate(updatedAttachments);
      toast.success('Arquivo removido');
    } catch (error) {
      console.error('Error removing file:', error);
      toast.error('Erro ao remover arquivo');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <Label>Anexos</Label>
      
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
          isDragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-primary/50'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
        {isDragActive ? (
          <p className="text-primary">Solte os arquivos aqui...</p>
        ) : (
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              {uploading ? 'Enviando...' : 'Arraste arquivos ou clique para selecionar'}
            </p>
            <p className="text-xs text-muted-foreground">
              Máximo 10MB por arquivo
            </p>
          </div>
        )}
      </div>

      {attachments.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm">Arquivos anexados:</Label>
          {attachments.map((attachment) => (
            <Card key={attachment.id} className="p-3">
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <File className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{attachment.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(attachment.size)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(attachment.url, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeAttachment(attachment)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
