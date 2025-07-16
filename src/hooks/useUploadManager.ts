import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UploadOptions {
  bucket: string;
  folder?: string;
  allowedTypes?: string[];
  maxSizeBytes?: number;
  onProgress?: (progress: number) => void;
}

interface UploadResult {
  url: string;
  path: string;
  name: string;
  size: number;
}

export function useUploadManager() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const validateFile = useCallback((file: File, options: UploadOptions): boolean => {
    // Check file type
    if (options.allowedTypes && options.allowedTypes.length > 0) {
      const isAllowed = options.allowedTypes.some(type => {
        if (type.includes('/*')) {
          return file.type.startsWith(type.replace('/*', ''));
        }
        return file.type === type;
      });

      if (!isAllowed) {
        toast({
          title: 'Tipo de arquivo não permitido',
          description: `Tipos permitidos: ${options.allowedTypes.join(', ')}`,
          variant: 'destructive'
        });
        return false;
      }
    }

    // Check file size
    if (options.maxSizeBytes && file.size > options.maxSizeBytes) {
      const maxSizeMB = options.maxSizeBytes / (1024 * 1024);
      toast({
        title: 'Arquivo muito grande',
        description: `Tamanho máximo permitido: ${maxSizeMB}MB`,
        variant: 'destructive'
      });
      return false;
    }

    return true;
  }, [toast]);

  const generateFileName = useCallback((originalName: string, folder?: string): string => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split('.').pop();
    const cleanName = originalName.replace(/[^a-zA-Z0-9.]/g, '_');
    
    const fileName = `${timestamp}_${randomString}_${cleanName}`;
    return folder ? `${folder}/${fileName}` : fileName;
  }, []);

  const uploadFile = useCallback(async (
    file: File,
    options: UploadOptions
  ): Promise<UploadResult> => {
    if (!validateFile(file, options)) {
      throw new Error('File validation failed');
    }

    setIsUploading(true);
    setProgress(0);

    try {
      const fileName = generateFileName(file.name, options.folder);

      // Create a progress tracking upload
      const { data, error } = await supabase.storage
        .from(options.bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(options.bucket)
        .getPublicUrl(fileName);

      setProgress(100);
      options.onProgress?.(100);

      const result: UploadResult = {
        url: urlData.publicUrl,
        path: fileName,
        name: file.name,
        size: file.size
      };

      toast({
        title: 'Upload concluído',
        description: `Arquivo ${file.name} enviado com sucesso!`
      });

      return result;
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Erro no upload',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  }, [validateFile, generateFileName, toast]);

  const uploadMultiple = useCallback(async (
    files: FileList | File[],
    options: UploadOptions
  ): Promise<UploadResult[]> => {
    const fileArray = Array.from(files);
    const results: UploadResult[] = [];
    
    setIsUploading(true);
    
    try {
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        const fileProgress = (i / fileArray.length) * 100;
        
        setProgress(fileProgress);
        options.onProgress?.(fileProgress);
        
        const result = await uploadFile(file, {
          ...options,
          onProgress: (fileProgressPercent) => {
            const totalProgress = fileProgress + (fileProgressPercent / fileArray.length);
            setProgress(totalProgress);
            options.onProgress?.(totalProgress);
          }
        });
        
        results.push(result);
      }
      
      return results;
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  }, [uploadFile]);

  const deleteFile = useCallback(async (
    bucket: string,
    path: string
  ): Promise<void> => {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) throw error;

      toast({
        title: 'Arquivo removido',
        description: 'Arquivo excluído com sucesso!'
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Erro ao remover arquivo',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive'
      });
      throw error;
    }
  }, [toast]);

  return {
    uploadFile,
    uploadMultiple,
    deleteFile,
    isUploading,
    progress,
    validateFile
  };
}