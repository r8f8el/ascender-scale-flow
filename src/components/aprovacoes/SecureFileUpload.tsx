
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { X, Upload, FileText, AlertTriangle } from 'lucide-react';
import { useSecureFileUpload } from '@/hooks/useSecureFileUpload';
import { toast } from 'sonner';

interface SecureFileUploadProps {
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  maxSizeBytes?: number;
}

export const SecureFileUpload: React.FC<SecureFileUploadProps> = ({
  onFilesChange,
  maxFiles = 10,
  acceptedTypes = [
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
  maxSizeBytes = 50 * 1024 * 1024 // 50MB
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const { validateFile } = useSecureFileUpload();

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach((file) => {
        const errors = file.errors.map((e: any) => e.message).join(', ');
        toast.error(`Arquivo rejeitado (${file.file.name}): ${errors}`);
      });
    }

    // Validate and filter accepted files
    const validFiles = acceptedFiles.filter(file => {
      const isValid = validateFile(file, {
        bucket: 'documents',
        allowedTypes: acceptedTypes,
        maxSizeBytes
      });
      
      if (!isValid) {
        toast.error(`Arquivo inválido: ${file.name}`);
      }
      
      return isValid;
    });

    // Check total file count
    const totalFiles = selectedFiles.length + validFiles.length;
    if (totalFiles > maxFiles) {
      toast.error(`Máximo de ${maxFiles} arquivos permitidos`);
      return;
    }

    // Add valid files
    const newFiles = [...selectedFiles, ...validFiles];
    setSelectedFiles(newFiles);
    onFilesChange(newFiles);

  }, [selectedFiles, maxFiles, acceptedTypes, maxSizeBytes, onFilesChange, validateFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => {
      // Map MIME types to file extensions for react-dropzone
      const extensionMap: { [key: string]: string[] } = {
        'application/pdf': ['.pdf'],
        'application/msword': ['.doc'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        'application/vnd.ms-excel': ['.xls'],
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/png': ['.png'],
        'text/plain': ['.txt'],
        'text/csv': ['.csv']
      };
      
      if (extensionMap[type]) {
        acc[type] = extensionMap[type];
      }
      return acc;
    }, {} as { [key: string]: string[] }),
    maxSize: maxSizeBytes,
    maxFiles: maxFiles - selectedFiles.length,
    multiple: true
  });

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFilesChange(newFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return '🖼️';
    } else if (file.type.includes('pdf')) {
      return '📄';
    } else if (file.type.includes('word') || file.type.includes('document')) {
      return '📝';
    } else if (file.type.includes('excel') || file.type.includes('spreadsheet')) {
      return '📊';
    }
    return '📎';
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-gray-300 hover:border-gray-400'
          }
        `}
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        
        {isDragActive ? (
          <p className="text-primary font-medium">Solte os arquivos aqui...</p>
        ) : (
          <div>
            <p className="text-gray-600 mb-2">
              Arraste arquivos aqui ou clique para selecionar
            </p>
            <p className="text-sm text-gray-500">
              Tipos permitidos: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, TXT, CSV
            </p>
            <p className="text-sm text-gray-500">
              Tamanho máximo: {Math.round(maxSizeBytes / 1024 / 1024)}MB por arquivo
            </p>
            <p className="text-sm text-gray-500">
              Máximo: {maxFiles} arquivos
            </p>
          </div>
        )}
      </div>

      {/* Security Warning */}
      <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
        <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-yellow-800">
          <p className="font-medium mb-1">Aviso de Segurança</p>
          <p>
            Todos os arquivos são validados antes do upload. Não envie arquivos executáveis 
            ou com conteúdo malicioso. Os arquivos serão escaneados automaticamente.
          </p>
        </div>
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">
            Arquivos selecionados ({selectedFiles.length}/{maxFiles})
          </h4>
          
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div key={`${file.name}-${index}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                <span className="text-lg">{getFileIcon(file)}</span>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)} • {file.type}
                  </p>
                </div>

                <Badge variant="secondary" className="text-xs">
                  Validado ✓
                </Badge>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
