
import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Paperclip, X } from 'lucide-react';
import { useUploadManager } from '@/hooks/useUploadManager';
import { toast } from 'sonner';

interface FileUploadSolicitacaoProps {
  files: File[];
  onFileChange: (files: File[]) => void;
  onFileRemove: (index: number) => void;
  uploadedFiles: Array<{ id: string; name: string; url: string; size: number }>;
  onUploadedFileRemove: (id: string) => void;
}

export const FileUploadSolicitacao: React.FC<FileUploadSolicitacaoProps> = ({
  files,
  onFileChange,
  onFileRemove,
  uploadedFiles,
  onUploadedFileRemove
}) => {
  const { isUploading } = useUploadManager();

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    // Validar tamanho dos arquivos (máximo 10MB por arquivo)
    const invalidFiles = selectedFiles.filter(file => file.size > 10 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      toast.error(`Alguns arquivos são muito grandes. Tamanho máximo: 10MB`);
      return;
    }

    // Validar tipos de arquivo
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ];

    const invalidTypeFiles = selectedFiles.filter(file => !allowedTypes.includes(file.type));
    if (invalidTypeFiles.length > 0) {
      toast.error('Tipos de arquivo permitidos: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG');
      return;
    }

    onFileChange([...files, ...selectedFiles]);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="files">Anexar Arquivos (opcional)</Label>
        <div className="mt-2">
          <input
            type="file"
            id="files"
            multiple
            onChange={handleFileSelection}
            disabled={isUploading}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
            className="block w-full text-sm text-muted-foreground
              file:mr-4 file:py-2 file:px-4 file:rounded-md
              file:border-0 file:text-sm file:font-medium
              file:bg-muted file:text-primary
              hover:file:bg-muted/80 disabled:opacity-50"
          />
          <p className="text-xs text-gray-500 mt-1">
            Tipos suportados: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (máximo 10MB por arquivo)
          </p>
        </div>
      </div>

      {/* Arquivos selecionados para upload */}
      {files.length > 0 && (
        <div className="space-y-2">
          <Label>Arquivos selecionados para envio:</Label>
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between bg-blue-50 p-3 rounded-md">
              <div className="flex items-center gap-2">
                <Paperclip size={16} className="text-blue-600" />
                <span className="text-sm font-medium">{file.name}</span>
                <span className="text-xs text-gray-500">
                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onFileRemove(index)}
                disabled={isUploading}
              >
                <X size={16} />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Arquivos já enviados */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <Label>Arquivos anexados:</Label>
          {uploadedFiles.map((file) => (
            <div key={file.id} className="flex items-center justify-between bg-green-50 p-3 rounded-md">
              <div className="flex items-center gap-2">
                <Paperclip size={16} className="text-green-600" />
                <span className="text-sm font-medium">{file.name}</span>
                <span className="text-xs text-gray-500">
                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onUploadedFileRemove(file.id)}
                disabled={isUploading}
              >
                <X size={16} />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
