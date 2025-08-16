
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UploadOptions {
  bucket: string;
  folder?: string;
  allowedTypes?: string[];
  maxSizeBytes?: number;
}

interface UploadResult {
  url: string;
  path: string;
}

export const useSecureFileUpload = () => {
  const [uploading, setUploading] = useState(false);

  const validateFile = (file: File, options: UploadOptions): boolean => {
    // Check file size
    const maxSize = options.maxSizeBytes || 50 * 1024 * 1024; // 50MB default
    if (file.size > maxSize) {
      toast.error(`Arquivo muito grande. Tamanho máximo: ${Math.round(maxSize / 1024 / 1024)}MB`);
      return false;
    }

    // Check file type
    const allowedTypes = options.allowedTypes || [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'text/plain',
      'text/csv'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipo de arquivo não permitido');
      return false;
    }

    // Validate file extension as additional security
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png', '.txt', '.csv'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!allowedExtensions.includes(fileExtension)) {
      toast.error('Extensão de arquivo não permitida');
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
      toast.error('Nome de arquivo suspeito detectado');
      return false;
    }

    return true;
  };

  const sanitizeFilename = (filename: string): string => {
    // Remove or replace dangerous characters
    return filename
      .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace non-alphanumeric chars
      .replace(/^\.+/, '') // Remove leading dots
      .replace(/\.+$/, '') // Remove trailing dots
      .substring(0, 255); // Limit length
  };

  const uploadFile = async (file: File, options: UploadOptions): Promise<UploadResult> => {
    if (!validateFile(file, options)) {
      throw new Error('Validação de arquivo falhou');
    }

    setUploading(true);

    try {
      // Sanitize filename
      const sanitizedName = sanitizeFilename(file.name);
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const uniqueFilename = `${timestamp}_${randomString}_${sanitizedName}`;
      
      // Build file path
      const filePath = options.folder 
        ? `${options.folder}/${uniqueFilename}`
        : uniqueFilename;

      console.log('Uploading file:', {
        originalName: file.name,
        sanitizedName: uniqueFilename,
        size: file.size,
        type: file.type,
        path: filePath
      });

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(options.bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false, // Prevent overwriting
        });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(options.bucket)
        .getPublicUrl(data.path);

      console.log('Upload successful:', {
        path: data.path,
        url: publicUrl
      });

      return {
        url: publicUrl,
        path: data.path
      };

    } catch (error: any) {
      console.error('File upload error:', error);
      toast.error(`Erro no upload: ${error.message || 'Erro desconhecido'}`);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadFile,
    uploading,
    validateFile
  };
};
