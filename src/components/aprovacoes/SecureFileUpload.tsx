
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { X, Upload, FileText, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface SecureFileUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  maxSizeBytes?: number;
  allowedTypes?: string[];
  className?: string;
}

export const SecureFileUpload: React.FC<SecureFileUploadProps> = ({
  files,
  onFilesChange,
  maxFiles = 5,
  maxSizeBytes = 50 * 1024 * 1024, // 50MB
  allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png'
  ],
  className = ''
}) => {
  
  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxSizeBytes) {
      toast.error(`Arquivo ${file.name} é muito grande. Tamanho máximo: ${Math.round(maxSizeBytes / 1024 / 1024)}MB`);
      return false;
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      toast.error(`Tipo de arquivo ${file.name} não permitido`);
      return false;
    }

    // Check file extension as additional security
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!allowedExtensions.includes(fileExtension)) {
      toast.error(`Extensão de arquivo ${fileExtension} não permitida`);
      return false;
    }

    // Check for suspicious patterns in filename
    const suspiciousPatterns = [
      /\.(exe|bat|cmd|scr|vbs|js|jar|app|deb|rpm)$/i,
      /[<>:"|?*]/,
      /^\./,
      /\.\./, // Directory traversal
      /script/i,
      /<script/i
    ];

    if (suspiciousPatterns.some(pattern => pattern.test(file.name))) {
      toast.error(`Nome de arquivo ${file.name} contém caracteres suspeitos`);
      return false;
    }

    return true;
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles: File[] = [];
    
    for (const file of acceptedFiles) {
      if (files.length + validFiles.length >= maxFiles) {
        toast.error(`Máximo de ${maxFiles} arquivos permitido`);
        break;
      }

      if (validateFile(file)) {
        // Check for duplicate names
        const isDuplicate = [...files, ...validFiles].some(existingFile => 
          existingFile.name === file.name
        );
        
        if (isDuplicate) {
          toast.error(`Arquivo ${file.name} já foi adicionado`);
          continue;
        }

        validFiles.push(file);
      }
    }

    if (validFiles.length > 0) {
      onFilesChange([...files, ...validFiles]);
      toast.success(`${validFiles.length} arquivo(s) adicionado(s) com sucesso`);
    }
  }, [files, maxFiles, onFilesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxFiles: maxFiles - files.length,
    maxSize: maxSizeBytes,
    disabled: files.length >= maxFiles
  });

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
    toast.success('Arquivo removido');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <Label>Anexos (opcional)</Label>
        <p className="text-sm text-muted-foreground">
          Tipos permitidos: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (máximo {maxFiles} arquivos, {Math.round(maxSizeBytes / 1024 / 1024)}MB cada)
        </p>
      </div>

      {files.length < maxFiles && (
        <Card className="border-dashed">
          <CardContent className="p-6">
            <div
              {...getRootProps()}
              className={`cursor-pointer text-center space-y-4 ${
                isDragActive ? 'bg-primary/10' : ''
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <p className="text-lg font-medium">
                  {isDragActive ? 'Solte os arquivos aqui' : 'Clique ou arraste arquivos'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {maxFiles - files.length} arquivo(s) restante(s)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          <Label>Arquivos selecionados:</Label>
          {files.map((file, index) => (
            <Card key={index} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {files.length >= maxFiles && (
        <div className="flex items-center space-x-2 text-amber-600">
          <AlertTriangle className="h-4 w-4" />
          <p className="text-sm">Limite máximo de arquivos atingido</p>
        </div>
      )}
    </div>
  );
};
