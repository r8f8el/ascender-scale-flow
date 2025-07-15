
import React from 'react';
import { Label } from '@/components/ui/label';
import { Paperclip } from 'lucide-react';

interface FileUploadFormProps {
  files: File[];
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FileUploadForm: React.FC<FileUploadFormProps> = ({
  files,
  onFileChange
}) => {
  return (
    <div>
      <Label htmlFor="files">Anexar Arquivos (opcional)</Label>
      <div className="mt-1">
        <input
          type="file"
          id="files"
          multiple
          onChange={onFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4 file:rounded-md
            file:border-0 file:text-sm file:font-medium
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      </div>
      {files.length > 0 && (
        <div className="mt-2 space-y-1">
          {files.map((file, index) => (
            <p key={index} className="text-sm text-gray-500 flex items-center">
              <Paperclip size={16} className="mr-1" />
              {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          ))}
        </div>
      )}
    </div>
  );
};
